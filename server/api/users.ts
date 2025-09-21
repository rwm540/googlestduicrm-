import { Router } from 'express';
import prisma from '../db';
// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for Prisma types for proper module resolution.
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const saltRounds = 10;

// Helper to exclude keys from an object
function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  // Create a new object to avoid mutating the original
  const newUser = { ...user };
  for (let key of keys) {
    delete newUser[key];
  }
  return newUser;
}

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        const usersWithoutPasswords = users.map(user => exclude(user, ['password']));
        res.json(usersWithoutPasswords.map(u => ({...u, accessibleMenus: u.accessibleMenus as any[]})));
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// POST create a new user
router.post('/', async (req, res) => {
    try {
        const { accessibleMenus, password, ...restOfUser } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const newUser = await prisma.user.create({
            data: {
                ...restOfUser,
                password: hashedPassword,
                accessibleMenus: (accessibleMenus || []) as Prisma.JsonArray,
            }
        });

        req.io.emit('data_changed', { entity: 'users' });
        const userWithoutPassword = exclude(newUser, ['password']);
        res.status(201).json({...userWithoutPassword, accessibleMenus: userWithoutPassword.accessibleMenus as any[]});
    } catch (err: any) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});
    
// PUT update a user by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { accessibleMenus, password, ...restOfUser } = req.body;
        
        const updatePayload: any = { ...restOfUser };
        if (accessibleMenus) {
            updatePayload.accessibleMenus = accessibleMenus as Prisma.JsonArray;
        }
        // Only hash and update password if a new one is provided
        if (password) {
            updatePayload.password = await bcrypt.hash(password, saltRounds);
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updatePayload,
        });

        req.io.emit('data_changed', { entity: 'users' });
        const userWithoutPassword = exclude(updatedUser, ['password']);
        res.json({...userWithoutPassword, accessibleMenus: userWithoutPassword.accessibleMenus as any[]});
    } catch (err: any) {
        // Prisma throws specific errors for not found on update
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

// POST delete multiple users
router.post('/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid input: "ids" must be an array.' });
        }
        const { count } = await prisma.user.deleteMany({
            where: {
                id: { in: ids.map(Number) },
            },
        });
        req.io.emit('data_changed', { entity: 'users' });
        res.status(200).json({ message: `${count} users deleted successfully.` });
    } catch (err: any) {
        res.status(500).json({ message: 'Error deleting users', error: err.message });
    }
});

// DELETE a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: Number(id) }
        });
        req.io.emit('data_changed', { entity: 'users' });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err: any) {
         if (err.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

export default router;