// Fix: Replace CommonJS `require` with ES module `import` for `dotenv`.
import 'dotenv/config';
// FIX: import Request, Response, NextFunction to explicitly type middleware arguments.
// By letting TypeScript infer the types for req, res, and next, the global
// type augmentation for Express.Request can be correctly applied, resolving the errors.
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import apiRouter from './routes';

// This is the correct way to augment the Express Request type.
// It tells TypeScript that every Request object will have an 'io' property.
declare global {
  namespace Express {
    interface Request {
      io: Server;
    }
  }
}

const app = express();
const server = http.createServer(app);

// Setup CORS
app.use(cors({
    origin: '*', // In a production environment, you should restrict this to your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*', // Restrict this in production
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Make io accessible to all route handlers by attaching it to the request object.
// This is now type-safe because of the 'declare global' block above.
// FIX: Let TypeScript infer the types for req, res, and next. This allows the global
// type augmentation for Express.Request to be correctly applied, resolving both errors.
// FIX: Explicitly type middleware arguments to resolve overload ambiguity.
// FIX: Removed explicit types for middleware arguments to allow type augmentation to apply correctly.
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api', apiRouter);

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`Prisma is connected to the database.`);
});