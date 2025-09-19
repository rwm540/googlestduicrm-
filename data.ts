import { User, Customer, PurchaseContract, SupportContract, Ticket } from './types';

// All initial data has been cleared as per user request.
// Only a single admin user is created by default.

export const initialUsers: User[] = [
  { 
    id: 1, 
    firstName: 'مدیر', 
    lastName: 'سیستم', 
    username: 'admin', 
    password: 'admin', 
    role: 'مدیر', 
    accessibleMenus: ['dashboard', 'customers', 'users', 'contracts', 'tickets', 'reports', 'referrals'] 
  },
];

export const initialCustomers: Customer[] = [];

export const initialPurchaseContracts: PurchaseContract[] = [];

export const initialSupportContracts: SupportContract[] = [];

export const initialTickets: Ticket[] = [];
