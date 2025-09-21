import { Router } from 'express';
import usersRouter from './api/users';
import customersRouter from './api/customers';
import contractsRouter from './api/contracts';
import ticketsRouter from './api/tickets';
// Future HR routes can be added here
// import hrRouter from './api/hr';

const router = Router();

// Assign entity routers to their base paths
router.use('/users', usersRouter);
router.use('/customers', customersRouter);
router.use('/contracts', contractsRouter);
router.use('/tickets', ticketsRouter);
// router.use('/hr', hrRouter);

// A simple health check endpoint to verify the server is running
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

export default router;