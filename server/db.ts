// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for PrismaClient for proper module resolution.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;