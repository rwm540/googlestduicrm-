import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral } from './types';

// Initial mock data is cleared. Data will now be fetched from Supabase.
// The default admin user should be inserted directly into the Supabase database via SQL.
export const initialUsers: User[] = [];
export const initialCustomers: Customer[] = [];
export const initialPurchaseContracts: PurchaseContract[] = [];
export const initialSupportContracts: SupportContract[] = [];
export const initialTickets: Ticket[] = [];
export const initialReferrals: Referral[] = [];