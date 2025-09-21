
// FIX: Use namespace import for Prisma to resolve module export issues.
import * as PrismaScope from '@prisma/client';
// Fix: Explicitly import the `process` object to ensure its type includes the 'exit' method.
import process from 'process';

const prisma = new PrismaScope.PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    // Clean up database
    await prisma.referral.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.supportContract.deleteMany();
    await prisma.purchaseContract.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleaned up existing data.');

    // Seed Users
    const adminUser = await prisma.user.create({
        data: {
            firstName: 'مدیر',
            lastName: 'کل',
            username: 'admin',
            password: 'admin',
            role: 'مدیر',
            accessibleMenus: ['dashboard', 'customers', 'users', 'contracts', 'tickets', 'reports', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });
    
    const salesLead = await prisma.user.create({
        data: {
            firstName: 'سارا',
            lastName: 'احمدی',
            username: 'sales_lead',
            password: 'password',
            role: 'مسئول فروش',
            accessibleMenus: ['dashboard', 'customers', 'contracts', 'reports', 'tickets', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });

    const salesExpert = await prisma.user.create({
        data: {
            firstName: 'رضا',
            lastName: 'محمدی',
            username: 'sales_expert',
            password: 'password',
            role: 'کارشناس فروش',
            accessibleMenus: ['dashboard', 'customers', 'contracts'] as PrismaScope.Prisma.JsonArray
        }
    });
    
    const supportLead = await prisma.user.create({
        data: {
            firstName: 'مریم',
            lastName: 'صادقی',
            username: 'support_lead',
            password: 'password',
            role: 'مسئول پشتیبان',
            accessibleMenus: ['dashboard', 'customers', 'tickets', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });

    const supportExpert = await prisma.user.create({
        data: {
            firstName: 'علی',
            lastName: 'حسینی',
            username: 'support_expert',
            password: 'password',
            role: 'کارشناس پشتیبانی',
            accessibleMenus: ['tickets', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });
    
     const devLead = await prisma.user.create({
        data: {
            firstName: 'پویا',
            lastName: 'کریمی',
            username: 'dev_lead',
            password: 'password',
            role: 'مسئول برنامه نویس',
            accessibleMenus: ['tickets', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });

     const devExpert = await prisma.user.create({
        data: {
            firstName: 'زهرا',
            lastName: 'مرادی',
            username: 'dev_expert',
            password: 'password',
            role: 'کارشناس برنامه نویس',
            accessibleMenus: ['tickets', 'referrals'] as PrismaScope.Prisma.JsonArray
        }
    });
    console.log('Seeded users with new roles.');


    // Seed Customers
    const customer1 = await prisma.customer.create({
        data: {
            firstName: 'علی',
            lastName: 'رضایی',
            nationalId: '1234567890',
            birthDate: '1365/02/15',
            gender: 'مرد',
            maritalStatus: 'متاهل',
            mobileNumbers: ['09121112233'] as PrismaScope.Prisma.JsonArray,
            emails: ['ali.rezaei@example.com'] as PrismaScope.Prisma.JsonArray,
            phone: ['02188776655'] as PrismaScope.Prisma.JsonArray,
            address: 'تهران، خیابان ولیعصر، کوچه اول، پلاک ۱۰',
            jobTitle: 'مدیر عامل',
            companyName: 'شرکت فناوری نوین',
            activityType: 'تولید نرم‌افزار',
            taxCode: '987654321',
            bankAccountNumber: '1122334455',
            iban: 'IR100000000001122334455',
            paymentMethods: ['چک', 'حواله بانکی'] as PrismaScope.Prisma.JsonArray,
            remainingCredit: 0,
            softwareType: 'شرکتی',
            purchaseDate: '1402/05/20',
            supportStartDate: '1402/06/01',
            supportEndDate: '1403/06/01',
            level: 'A',
            status: 'فعال',
        }
    });

    const customer2 = await prisma.customer.create({
        data: {
            firstName: 'مریم',
            lastName: 'حسینی',
            nationalId: '0987654321',
            birthDate: '1370/11/01',
            gender: 'زن',
            maritalStatus: 'مجرد',
            mobileNumbers: ['09123334455'] as PrismaScope.Prisma.JsonArray,
            emails: ['maryam.hosseini@shop.com'] as PrismaScope.Prisma.JsonArray,
            phone: ['02122334455'] as PrismaScope.Prisma.JsonArray,
            address: 'اصفهان، میدان نقش جهان، بازار بزرگ',
            jobTitle: 'مدیر فروشگاه',
            companyName: 'فروشگاه بزرگ اصفهان',
            activityType: 'خرده فروشی',
            taxCode: '123123123',
            bankAccountNumber: '5566778899',
            iban: 'IR200000000005566778899',
            paymentMethods: ['کارت به کارت', 'نقد'] as PrismaScope.Prisma.JsonArray,
            remainingCredit: 1500000,
            softwareType: 'فروشگاهی',
            purchaseDate: '1401/10/10',
            supportStartDate: '1401/10/15',
            supportEndDate: '1402/10/15',
            level: 'B',
            status: 'غیرفعال',
        }
    });
    console.log('Seeded customers.');


    // Seed Contracts
    await prisma.purchaseContract.create({
        data: {
            contractId: 'PC-1402-001',
            contractStartDate: '1402/06/01',
            contractEndDate: '1403/06/01',
            contractDate: '1402/05/20',
            contractType: 'خرید دائم',
            contractStatus: 'فعال',
            softwareVersion: '2.5.1',
            customerType: 'سازمانی',
            customerName: customer1.companyName,
            economicCode: customer1.taxCode,
            customerAddress: customer1.address,
            customerContact: JSON.stringify(customer1.mobileNumbers),
            customerRepresentative: `${customer1.firstName} ${customer1.lastName}`,
            vendorName: 'شرکت شما',
            salespersonId: salesLead.id,
            softwareName: 'نرم افزار جامع مالی',
            licenseCount: 10,
            softwareDescription: 'نسخه کامل نرم افزار مالی همراه با تمامی ماژول ها.',
            platform: 'ویندوز',
            networkSupport: 'بله',
            webMobileSupport: 'نسخه وب پایه',
            initialTraining: '۱۰ ساعت آموزش حضوری',
            setupAndInstallation: 'نصب روی سرور و ۵ کلاینت',
            technicalSupport: 'پشتیبانی تلفنی و ریموت نامحدود',
            updates: 'دریافت تمامی آپدیت ها به مدت یکسال',
            customizations: 'بدون سفارشی سازی',
            totalAmount: 250000000,
            prepayment: 100000000,
            paymentStages: 'یک چک یک ماهه به مبلغ ۱۵۰ میلیون تومان',
            paymentMethods: ['چک', 'حواله بانکی'] as PrismaScope.Prisma.JsonArray,
            paymentStatus: 'بدهی باقی مانده',
            invoiceNumber: 'INV-1402-101',
            lastStatusChangeDate: '1402/06/01',
            crmResponsibleId: adminUser.id,
            notes: 'مشتری بسیار مهم است. پیگیری پرداخت چک انجام شود.',
            futureTasks: 'تماس برای یادآوری پرداخت در تاریخ سررسید چک.'
        }
    });

    await prisma.supportContract.create({
        data: {
            customerId: customer1.id,
            startDate: '1403/06/01',
            endDate: '1404/06/01',
            duration: 'یکساله',
            supportType: ['تلفنی', 'ریموت'] as PrismaScope.Prisma.JsonArray,
            level: 'طلایی',
            status: 'فعال',
            organizationName: customer1.companyName,
            contactPerson: `${customer1.firstName} ${customer1.lastName}`,
            contactNumber: '09121112233',
            contactEmail: 'ali.rezaei@example.com',
            economicCode: customer1.taxCode,
            fullAddress: customer1.address,
            softwareName: 'نرم افزار جامع مالی',
            softwareVersion: '2.5.1',
            initialInstallDate: '1402/05/20',
            installType: 'تحت شبکه',
            userCount: '10',
            softwareType: 'شرکتی',
        }
    });

    await prisma.supportContract.create({
        data: {
            customerId: customer2.id,
            startDate: '1402/10/15',
            endDate: '1403/10/15',
            duration: 'یکساله',
            supportType: ['تلفنی'] as PrismaScope.Prisma.JsonArray,
            level: 'برنزه',
            status: 'منقضی شده',
            organizationName: customer2.companyName,
            contactPerson: `${customer2.firstName} ${customer2.lastName}`,
            contactNumber: '09123334455',
            contactEmail: 'maryam.hosseini@shop.com',
            economicCode: customer2.taxCode,
            fullAddress: customer2.address,
            softwareName: 'نرم افزار فروشگاهی',
            softwareVersion: '1.8.0',
            initialInstallDate: '1401/10/10',
            installType: 'تک کاربره',
            userCount: '1',
            softwareType: 'فروشگاهی',
        }
    });
    console.log('Seeded contracts.');
    
    // Seed Tickets and Referrals
    const now = new Date();
    const creationDateTime = now.toISOString();
    const editableUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const ticket1 = await prisma.ticket.create({
        data: {
            ticketNumber: 'T-2024-0001',
            title: 'گزارش فروش کار نمی‌کند',
            description: 'مشتری اعلام کرده است که گزارش فروش روزانه خطای "عدم دسترسی به داده" را نمایش می‌دهد. لطفا بررسی شود.',
            customerId: customer1.id,
            creationDateTime: creationDateTime,
            lastUpdateDate: creationDateTime,
            status: 'انجام نشده',
            priority: 'ضطراری',
            type: 'گزارشات',
            channel: 'تلفن',
            assignedToId: supportExpert.id,
            attachments: [] as PrismaScope.Prisma.JsonArray,
            updates: [] as PrismaScope.Prisma.JsonArray,
            editableUntil: editableUntil,
            totalWorkDuration: 0,
        }
    });
    
    const ticket2 = await prisma.ticket.create({
        data: {
            ticketNumber: 'T-2024-0002',
            title: 'درخواست افزودن فیلد جدید به فاکتور',
            description: 'مشتری درخواست دارد فیلد "کد بازاریاب" به فاکتور فروش اضافه شود. نیاز به بررسی توسط تیم برنامه‌نویسی دارد.',
            customerId: customer1.id,
            creationDateTime: creationDateTime,
            lastUpdateDate: creationDateTime,
            status: 'ارجاع شده',
            priority: 'متوسط',
            type: 'درخواست',
            channel: 'ایمیل',
            assignedToId: devLead.id,
            attachments: ['screenshot-error.png'] as PrismaScope.Prisma.JsonArray,
            updates: [] as PrismaScope.Prisma.JsonArray,
            editableUntil: editableUntil,
            totalWorkDuration: 120,
        }
    });

    // Create referral history for ticket #2
    await prisma.referral.create({
        data: {
            ticketId: ticket2.id,
            referredById: supportLead.id,
            referredToId: devLead.id,
            referralDate: new Date(now.getTime() - 10 * 60 * 1000).toISOString() // 10 mins ago
        }
    });
    console.log('Seeded tickets and referrals.');
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
