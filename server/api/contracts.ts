
import { Router } from 'express';
import prisma from '../db';
// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for Prisma types for proper module resolution.
import { Prisma } from '@prisma/client';

const router = Router();

// Helper function to connect a user by username
const connectUser = async (username: string | undefined | null) => {
    if (!username) return undefined;
    const user = await prisma.user.findUnique({ where: { username } });
    return user ? { connect: { id: user.id } } : undefined;
};

// Helper function to format purchase contract for the client
const formatPurchaseContract = (contract: any) => {
    return {
        ...contract,
        paymentMethods: contract.paymentMethods as any[] || [],
        salesperson: contract.salesperson?.username || null,
        crmResponsible: contract.crmResponsible?.username || null,
        totalAmount: Number(contract.totalAmount),
        prepayment: Number(contract.prepayment),
        licenseCount: Number(contract.licenseCount)
    };
};

// Helper function to format support contract for the client
const formatSupportContract = (contract: any) => ({
    ...contract,
    supportType: contract.supportType as any[] || []
});

// GET all contracts
router.get('/', async (req, res) => {
    try {
        const purchase = await prisma.purchaseContract.findMany({
            include: {
                salesperson: { select: { username: true } },
                crmResponsible: { select: { username: true } },
            },
            orderBy: { id: 'desc' }
        });

        const support = await prisma.supportContract.findMany({
            orderBy: { id: 'desc' }
        });
        
        res.json({
            purchase: purchase.map(formatPurchaseContract),
            support: support.map(formatSupportContract),
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching contracts', error: err.message });
    }
});

// --- Purchase Contracts ---

router.post('/purchase', async (req, res) => {
    try {
        const { paymentMethods, salesperson, crmResponsible, ...rest } = req.body;
        
        const newContract = await prisma.purchaseContract.create({
            data: {
                ...rest,
                paymentMethods: (paymentMethods || []) as Prisma.JsonArray,
                salesperson: await connectUser(salesperson),
                crmResponsible: await connectUser(crmResponsible),
            },
            include: { salesperson: true, crmResponsible: true }
        });

        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(201).json(formatPurchaseContract(newContract));
    } catch (err: any) {
        res.status(500).json({ message: 'Error creating purchase contract', error: err.message });
    }
});

router.put('/purchase/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethods, salesperson, crmResponsible, ...rest } = req.body;

        const updatedContract = await prisma.purchaseContract.update({
            where: { id: Number(id) },
            data: {
                ...rest,
                paymentMethods: (paymentMethods || []) as Prisma.JsonArray,
                salesperson: await connectUser(salesperson),
                crmResponsible: await connectUser(crmResponsible),
            },
            include: { salesperson: true, crmResponsible: true }
        });
        
        req.io.emit('data_changed', { entity: 'contracts' });
        res.json(formatPurchaseContract(updatedContract));
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Purchase contract not found' });
        res.status(500).json({ message: 'Error updating purchase contract', error: err.message });
    }
});

router.post('/purchase/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        const { count } = await prisma.purchaseContract.deleteMany({
            where: { id: { in: ids.map(Number) } },
        });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(200).json({ message: `${count} purchase contracts deleted successfully.` });
    } catch (err: any) {
        res.status(500).json({ message: 'Error deleting purchase contracts', error: err.message });
    }
});

router.delete('/purchase/:id', async (req, res) => {
    try {
        await prisma.purchaseContract.delete({ where: { id: Number(req.params.id) } });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(200).json({ message: 'Purchase contract deleted successfully.' });
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Purchase contract not found' });
        res.status(500).json({ message: 'Error deleting purchase contract', error: err.message });
    }
});

// --- Support Contracts ---

router.post('/support', async (req, res) => {
    try {
        const { supportType, customerId, ...rest } = req.body;
        const newContract = await prisma.supportContract.create({
            data: {
                ...rest,
                supportType: (supportType || []) as Prisma.JsonArray,
                customer: customerId ? { connect: { id: Number(customerId) } } : undefined,
            }
        });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(201).json(formatSupportContract(newContract));
    } catch (err: any) {
        res.status(500).json({ message: 'Error creating support contract', error: err.message });
    }
});

router.put('/support/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { supportType, customerId, ...rest } = req.body;
        const updatedContract = await prisma.supportContract.update({
            where: { id: Number(id) },
            data: {
                ...rest,
                supportType: (supportType || []) as Prisma.JsonArray,
                customer: customerId ? { connect: { id: Number(customerId) } } : { disconnect: true },
            }
        });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.json(formatSupportContract(updatedContract));
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Support contract not found' });
        res.status(500).json({ message: 'Error updating support contract', error: err.message });
    }
});

router.post('/support/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        const { count } = await prisma.supportContract.deleteMany({
            where: { id: { in: ids.map(Number) } },
        });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(200).json({ message: `${count} support contracts deleted successfully.` });
    } catch (err: any) {
        res.status(500).json({ message: 'Error deleting support contracts', error: err.message });
    }
});

router.delete('/support/:id', async (req, res) => {
    try {
        await prisma.supportContract.delete({ where: { id: Number(req.params.id) } });
        req.io.emit('data_changed', { entity: 'contracts' });
        res.status(200).json({ message: 'Support contract deleted successfully.' });
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Support contract not found' });
        res.status(500).json({ message: 'Error deleting support contract', error: err.message });
    }
});

export default router;