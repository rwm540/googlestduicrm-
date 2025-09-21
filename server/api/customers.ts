
import { Router } from 'express';
import prisma from '../db';
// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for Prisma types for proper module resolution.
import { Prisma } from '@prisma/client';

const router = Router();

// Helper to convert Prisma JSON fields to arrays for client
const processCustomerForOutput = (customer: any) => ({
    ...customer,
    mobileNumbers: customer.mobileNumbers as any[] || [],
    emails: customer.emails as any[] || [],
    phone: customer.phone as any[] || [],
    paymentMethods: customer.paymentMethods as any[] || [],
});

// GET all customers
router.get('/', async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { id: 'desc' }
        });
        res.json(customers.map(processCustomerForOutput));
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
});

// POST create a new customer
router.post('/', async (req, res) => {
    try {
        const { mobileNumbers, emails, phone, paymentMethods, ...rest } = req.body;
        const newCustomer = await prisma.customer.create({
            data: {
                ...rest,
                mobileNumbers: (mobileNumbers || []) as Prisma.JsonArray,
                emails: (emails || []) as Prisma.JsonArray,
                phone: (phone || []) as Prisma.JsonArray,
                paymentMethods: (paymentMethods || []) as Prisma.JsonArray,
            }
        });
        req.io.emit('data_changed', { entity: 'customers' });
        res.status(201).json(processCustomerForOutput(newCustomer));
    } catch (err: any) {
        res.status(500).json({ message: 'Error creating customer', error: err.message });
    }
});

// PUT update a customer by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mobileNumbers, emails, phone, paymentMethods, ...rest } = req.body;
        const updatedCustomer = await prisma.customer.update({
            where: { id: Number(id) },
            data: {
                ...rest,
                mobileNumbers: (mobileNumbers || []) as Prisma.JsonArray,
                emails: (emails || []) as Prisma.JsonArray,
                phone: (phone || []) as Prisma.JsonArray,
                paymentMethods: (paymentMethods || []) as Prisma.JsonArray,
            }
        });
        
        if (updatedCustomer) {
            req.io.emit('data_changed', { entity: 'customers' });
            res.json(processCustomerForOutput(updatedCustomer));
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (err: any) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(500).json({ message: 'Error updating customer', error: err.message });
    }
});

// POST delete multiple customers
router.post('/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        const { count } = await prisma.customer.deleteMany({
            where: { id: { in: ids.map(Number) } },
        });
        req.io.emit('data_changed', { entity: 'customers' });
        res.status(200).json({ message: `${count} customers deleted successfully.` });
    } catch (err: any) {
        res.status(500).json({ message: 'Error deleting customers', error: err.message });
    }
});

// DELETE a customer by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({
            where: { id: Number(id) }
        });
        req.io.emit('data_changed', { entity: 'customers' });
        res.status(200).json({ message: 'Customer deleted successfully.' });
    } catch (err: any) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(500).json({ message: 'Error deleting customer', error: err.message });
    }
});

export default router;