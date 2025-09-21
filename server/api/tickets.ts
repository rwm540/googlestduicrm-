
import { Router } from 'express';
import prisma from '../db';
// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for Prisma types for proper module resolution.
import { Prisma } from '@prisma/client';

const router = Router();

// Helper to connect a user by username
const connectUser = async (username: string | undefined | null) => {
    if (!username) return undefined;
    const user = await prisma.user.findUnique({ where: { username } });
    return user ? { connect: { id: user.id } } : undefined;
};

// Helper to format a ticket for client response
const formatTicket = (ticket: any) => ({
    ...ticket,
    attachments: ticket.attachments as any[] || [],
    updates: ticket.updates as any[] || [],
    assignedTo: ticket.assignedTo?.username || null,
    totalWorkDuration: Number(ticket.totalWorkDuration || 0),
});

const formatReferral = (referral: any) => ({
    id: referral.id,
    referralDate: referral.referralDate,
    referredBy: referral.referredBy?.username || null,
    referredTo: referral.referredTo?.username || null,
    ticket: formatTicket(referral.ticket),
});

// GET all tickets and referrals
router.get('/', async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: { assignedTo: { select: { username: true } } },
            orderBy: { creationDateTime: 'desc' },
        });
        
        const referrals = await prisma.referral.findMany({
            include: {
                ticket: { include: { assignedTo: true } },
                referredBy: { select: { username: true } },
                referredTo: { select: { username: true } },
            },
            orderBy: { referralDate: 'desc' },
        });

        res.json({
            tickets: tickets.map(formatTicket),
            referrals: referrals.map(formatReferral),
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching tickets and referrals', error: err.message });
    }
});

// POST create a new ticket
router.post('/', async (req, res) => {
    try {
        const { attachments, updates, assignedTo, customerId, ...rest } = req.body;
        
        const lastTicket = await prisma.ticket.findFirst({ orderBy: { id: 'desc' } });
        const nextId = lastTicket ? lastTicket.id + 1 : 1;
        const ticketNumber = `T-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

        const creationDateTime = new Date();
        const editableUntil = new Date(creationDateTime.getTime() + 15 * 60 * 1000);

        const newTicket = await prisma.ticket.create({
            data: {
                ...rest,
                ticketNumber,
                creationDateTime: creationDateTime.toISOString(),
                lastUpdateDate: creationDateTime.toISOString(),
                editableUntil: editableUntil.toISOString(),
                attachments: (attachments || []) as Prisma.JsonArray,
                updates: (updates || []) as Prisma.JsonArray,
                customer: { connect: { id: Number(customerId) } },
                assignedTo: await connectUser(assignedTo),
            },
            include: { assignedTo: true }
        });
        
        req.io.emit('data_changed', { entity: 'tickets' });
        res.status(201).json(formatTicket(newTicket));
    } catch (err: any) {
        res.status(500).json({ message: 'Error creating ticket', error: err.message });
    }
});

// PUT update a ticket
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { attachments, updates, assignedTo, customerId, ...rest } = req.body;
        
        const updatedTicket = await prisma.ticket.update({
            where: { id: Number(id) },
            data: {
                ...rest,
                lastUpdateDate: new Date().toISOString(),
                attachments: (attachments || []) as Prisma.JsonArray,
                updates: (updates || []) as Prisma.JsonArray,
                customer: { connect: { id: Number(customerId) } },
                assignedTo: await connectUser(assignedTo),
            },
            include: { assignedTo: true }
        });
        
        req.io.emit('data_changed', { entity: 'tickets' });
        res.json(formatTicket(updatedTicket));
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Ticket not found' });
        res.status(500).json({ message: 'Error updating ticket', error: err.message });
    }
});

// POST toggle work session
router.post('/:id/toggle-work', async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: Number(id) } });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        let updatePayload: any = {};

        if (ticket.status === 'در حال پیگیری' && ticket.workSessionStartedAt) {
            const sessionStart = new Date(ticket.workSessionStartedAt).getTime();
            const now = new Date().getTime();
            const sessionDuration = Math.round((now - sessionStart) / 1000);
            
            updatePayload = {
                status: 'انجام نشده',
                workSessionStartedAt: null,
                totalWorkDuration: BigInt(Number(ticket.totalWorkDuration || 0)) + BigInt(sessionDuration),
            };
        } else {
            updatePayload = {
                status: 'در حال پیگیری',
                workSessionStartedAt: new Date().toISOString(),
            };
        }
        
        await prisma.ticket.update({ where: { id: Number(id) }, data: updatePayload });
        req.io.emit('data_changed', { entity: 'tickets' });
        res.status(200).json({ message: 'Work toggled' });
    } catch (err: any) {
        res.status(500).json({ message: 'Error toggling work session', error: err.message });
    }
});

// POST refer a ticket
router.post('/:id/refer', async (req, res) => {
    const { id } = req.params;
    const { referredTo, referredBy } = req.body;
    
    try {
        const referredToUser = await prisma.user.findUnique({ where: { username: referredTo } });
        const referredByUser = await prisma.user.findUnique({ where: { username: referredBy } });

        if (!referredToUser || !referredByUser) {
            return res.status(400).json({ message: 'کاربر ارجاع دهنده یا گیرنده نامعتبر است.' });
        }
        
        await prisma.$transaction(async (tx) => {
            // Update ticket status and assignee
            await tx.ticket.update({
                where: { id: Number(id) },
                data: {
                    status: 'ارجاع شده',
                    assignedTo: { connect: { id: referredToUser.id } },
                }
            });

            // Create a new referral record for history
            await tx.referral.create({
                data: {
                    ticket: { connect: { id: Number(id) } },
                    referredBy: { connect: { id: referredByUser.id } },
                    referredTo: { connect: { id: referredToUser.id } },
                    referralDate: new Date().toISOString(),
                }
            });
        });

        req.io.emit('data_changed', { entity: 'tickets' });
        res.status(200).json({ message: 'Ticket referred successfully' });
    } catch (err: any) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Ticket not found' });
        res.status(500).json({ message: 'Error referring ticket', error: err.message });
    }
});


export default router;