// FIX: Use namespace import for Prisma to resolve module export issues.
// FIX: Changed to named import for Prisma types for proper module resolution.
import { PrismaClient, Prisma } from '@prisma/client';
// Fix: Explicitly import the `process` object to ensure its type includes the 'exit' method.
import process from 'process';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
    console.log(`Start seeding ...`);

    // Clean up database completely
    await prisma.referral.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.supportContract.deleteMany();
    await prisma.purchaseContract.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleaned up all existing data.');

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('101921PO', saltRounds);

    // Create the single admin user with full access
    await prisma.user.create({
        data: {
            firstName: 'مدیر',
            lastName: 'سیستم',
            username: 'PakzadEmr101',
            password: hashedPassword,
            role: 'مدیر',
            accessibleMenus: ['dashboard', 'customers', 'users', 'contracts', 'tickets', 'reports', 'referrals'] as Prisma.JsonArray,
        }
    });

    console.log(`Seeded 1 admin user (PakzadEmr101) successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })