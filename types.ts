export type MenuItemId = 'dashboard' | 'customers' | 'users' | 'contracts' | 'tickets' | 'reports' | 'referrals';

export type UserRole = 'مدیر' | 'پشتیانی' | 'فروش' | 'برنامه نویس';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password?: string;
  accessibleMenus: MenuItemId[];
  role: UserRole;
}

export type Gender = 'مرد' | 'زن';
export type MaritalStatus = 'مجرد' | 'متاهل';
export type PaymentMethod = 'نقد' | 'چک' | 'کارت' | 'حواله' | 'کارت به کارت' | 'حواله بانکی';
export type CustomerLevel = 'A' | 'B' | 'C' | 'D';
export type SoftwareType = 'رستورانی' | 'فروشگاهی' | 'شرکتی' | 'عمومی';
export type CustomerStatus = 'فعال' | 'غیرفعال';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  mobileNumbers: string[];
  emails: string[];
  phone: string[];
  address: string;
  jobTitle: string;
  companyName: string;
  activityType: string;
  taxCode: string;
  bankAccountNumber: string;
  iban: string;
  paymentMethods: PaymentMethod[];
  remainingCredit: number;
  softwareType: SoftwareType;
  purchaseDate: string;
  supportStartDate: string;
  supportEndDate: string;
  level: CustomerLevel;
  status: CustomerStatus;
}

export type ContractStatus = 'فعال' | 'در انتظار تایید' | 'منقضی شده' | 'لغو شده';
export type ContractType = "خرید دائم" | "اشتراک دوره ای" | "اجاره ی نرم افزار" | "سفارشی سازی";
export type CustomerType = "شخصی" | "سازمانی";
export type NetworkSupport = "بله" | "خیر";
export type PaymentStatus = "پرداخت شده" | "بدهی باقی مانده" | "در حال پیگیری";

export interface PurchaseContract {
    id: number;
    contractId: string;
    contractStartDate: string;
    contractEndDate: string;
    contractDate: string;
    contractType: ContractType;
    contractStatus: ContractStatus;
    softwareVersion: string;
    customerType: CustomerType;
    customerName: string;
    economicCode: string;
    customerAddress: string;
    customerContact: string;
    customerRepresentative: string;
    vendorName: string;
    salesperson: string; // username of user
    softwareName: string;
    licenseCount: number;
    softwareDescription: string;
    platform: string;
    networkSupport: NetworkSupport;
    webMobileSupport: string;
    initialTraining: string;
    setupAndInstallation: string;
    technicalSupport: string;
    updates: string;
    customizations: string;
    totalAmount: number;
    prepayment: number;
    paymentStages: string;
    paymentMethods: PaymentMethod[];
    paymentStatus: PaymentStatus;
    invoiceNumber: string;
    signedContractPdf: string;
    salesInvoice: string;
    deliverySchedule: string;
    moduleList: string;
    terminationConditions: string;
    warrantyConditions: string;
    ownershipRights: string;
    confidentialityClause: string;
    nonCompeteClause: string;
    disputeResolution: string;
    lastStatusChangeDate: string;
    crmResponsible: string; // username of user
    notes: string;
    futureTasks: string;
}

export type SupportContractDuration = 'شش ماهه' | 'یکساله' | 'موردی';
export type SupportContractType = 'تلفنی' | 'ریموت' | 'حضوری';
export type SupportContractLevel = 'طلایی' | 'نقره ای' | 'برنزه';
export type SupportContractStatus = 'فعال' | 'در انتظار تایید' | 'منقضی شده' | 'لغو شده';


export interface SupportContract {
    id: number;
    customerId: number | null;
    startDate: string;
    endDate: string;
    duration: SupportContractDuration;
    supportType: SupportContractType[];
    level: SupportContractLevel;
    status: SupportContractStatus;
    organizationName: string;
    contactPerson: string;
    contactNumber: string;
    contactEmail: string;
    economicCode: string;
    fullAddress: string;
    softwareName: string;
    softwareVersion: string;
    initialInstallDate: string;
    installType: string;
    userCount: string;
    softwareType: SoftwareType;
}

export type TicketStatus = 'انجام نشده' | 'در حال پیگیری' | 'اتمام یافته' | 'ارجاع شده';
export type TicketPriority = 'کم' | 'متوسط' | 'ضطراری';
export type TicketType =
  | 'نصب'
  | 'اپدیت'
  | 'اموزش'
  | 'طراحی و چاپ'
  | 'تبدیل اطلاعات'
  | 'رفع اشکال'
  | 'راه اندازی'
  | 'مشکل برنامه نویسی'
  | 'سایر'
  | 'فراصدر'
  | 'گزارشات'
  | 'تنظیمات نرم افزاری'
  | 'مجوزدهی'
  | 'صندوق'
  | 'پوز'
  | 'ترازو'
  | 'انبار'
  | 'چک'
  | 'تعریف'
  | 'سیستم'
  | 'مودیان'
  | 'بیمه'
  | 'حقوق دستمزد'
  | 'بکاپ'
  | 'اوند'
  | 'کیوسک'
  | 'افتتاحیه'
  | 'اختتامیه'
  | 'تغییر مسیر'
  | 'پرینتر'
  | 'کارتخوان'
  | 'sql'
  | 'پنل پیامکی'
  | 'کلاینت'
  | 'صورتحساب'
  | 'مغایرت گیری'
  | 'ویندوزی'
  | 'چاپ'
  | 'پایان سال'
  | 'دمو'
  // FIX: Added missing ticket types to resolve errors in initial data.
  | 'خطا'
  | 'درخواست'
  | 'مشکل';
export type TicketChannel = 'تلفن' | 'ایمیل' | 'پورتال' | 'حضوری';

export interface TicketUpdate {
    id: number;
    author: string; // username
    date: string;
    description: string;
    timeSpent: number; // in minutes
}

export interface Ticket {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    customerId: number;
    creationDateTime: string;
    lastUpdateDate: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    channel: TicketChannel;
    assignedTo: string; // username
    attachments: string[]; // file names
    updates: TicketUpdate[];
    // New fields for automated system
    editableUntil: string; // ISO string for when the ticket becomes non-editable
    workSessionStartedAt?: string; // ISO string for when the current work session started
    totalWorkDuration: number; // in seconds
}

export interface Referral {
  id: number;
  ticket: Ticket;
  referredBy: string; // username of referrer
  referredTo: string; // username of new assignee
  referralDate: string; // ISO string
}

// FIX: Add missing type definitions for Attendance, Leave, and Mission features.
export type AttendanceType = 'ورود' | 'خروج';

export interface AttendanceRecord {
  id: number;
  userId: number;
  timestamp: string; // ISO string
  type: AttendanceType;
}

export type LeaveType = 'روزانه' | 'ساعتی';
export type LeaveRequestStatus = 'در انتظار تایید' | 'تایید شده' | 'رد شده';

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  status: LeaveRequestStatus;
  requestedAt: string; // ISO string
}

export interface MissionTask {
  id: number;
  description: string;
  completed: boolean;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  assignedTo: number; // user id
  createdBy: number; // user id
  tasks: MissionTask[];
  startTimestamp: string; // ISO string
  endTimestamp: string; // ISO string
  completed: boolean;
}