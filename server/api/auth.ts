import { Router } from 'express';
import prisma from '../db';
import bcrypt from 'bcrypt';
import { User } from '../../types';

const router = Router();

// Helper to exclude keys from an object
function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  const newUser = { ...user };
  for (let key of keys) {
    delete newUser[key];
  }
  return newUser;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find user by username, case-insensitively
        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (!user) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        // Compare provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        // Return user object without the password hash
        const userWithoutPassword = exclude(user, ['password']);
        res.json({ ...userWithoutPassword, accessibleMenus: userWithoutPassword.accessibleMenus as any[] });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login.', error: error.message });
    }
});

export default router;