
// FIX: Use namespace import for Prisma to resolve module export issues.
import * as PrismaScope from '@prisma/client';

const prisma = new PrismaScope.PrismaClient();

export default prisma;
