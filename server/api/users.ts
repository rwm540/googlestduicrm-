
import { Router } from 'express';
import prisma from '../db';
// FIX: Use namespace import for Prisma to resolve module export issues.
import * as PrismaScope from '@prisma/client';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        // Convert JSON fields from Prisma's JsonValue to plain objects/arrays for the client
        res.json(users.map(u => ({...u, accessibleMenus: u.accessibleMenus as any[]})));
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// POST create a new user
router.post('/', async (req, res) => {
    try {
        const { accessibleMenus, ...restOfUser } = req.body;
        // In a real app, hash the password before inserting
        const newUser = await prisma.user.create({
            data: {
                ...restOfUser,
                accessibleMenus: (accessibleMenus || []) as PrismaScope.Prisma.JsonArray,
            }
        });
        req.io.emit('data_changed', { entity: 'users' });
        res.status(201).json({...newUser, accessibleMenus: newUser.accessibleMenus as any[]});
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
            updatePayload.accessibleMenus = accessibleMenus as PrismaScope.Prisma.JsonArray;
        }
        // Only update password if a new one is provided
        if (password) {
            updatePayload.password = password; // Again, should be hashed
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updatePayload,
        });

        if (updatedUser) {
            req.io.emit('data_changed', { entity: 'users' });
            res.json({...updatedUser, accessibleMenus: updatedUser.accessibleMenus as any[]});
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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
