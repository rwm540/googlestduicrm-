
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Added CustomerIntroduction type for the new feature.
import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral, MenuItemId, TicketStatus, CustomerIntroduction } from './types';
import api from './src/api';
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Components and Pages
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagement from './pages/UserManagement';
import CustomerList from './pages/CustomerList';
import Tickets from './pages/Tickets';
import ReferralsPage from './pages/ReferralsPage';
import ReportsPage from './pages/ReportsPage';
import PurchaseContracts from './pages/PurchaseContracts';
import SupportContracts from './pages/SupportContracts';
// FIX: Added import for the new IntroductionsPage.
import IntroductionsPage from './pages/IntroductionsPage';
// FIX: Removed unused HR page imports.
import ProcessingOverlay from './components/ProcessingOverlay';
// FIX: Import parseJalaali to handle date conversions for sorting.
import { formatJalaaliDateTime, toPersianDigits, parseJalaali } from './utils/dateFormatter';
import Alert from './components/Alert';

// Helper functions for key conversion
const convertKeysToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      acc[camelKey] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// FIX: Corrected the snake_case conversion to handle nested arrays of objects properly.
const convertKeysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

// FIX: Added page title for the new 'introductions' feature.
const pageTitles: Record<MenuItemId, string> = {
  dashboard: 'داشبورد',
  customers: 'مدیریت مشتریان',
  users: 'مدیریت کاربران',
  contracts: 'مدیریت قرارداد ها',
  tickets: 'مدیریت تیکت‌ها',
  reports: 'گزارشات',
  referrals: 'ارجاعات',
  attendance: 'حضور و غیاب',
  leave: 'مرخصی ها',
  missions: 'ماموریت ها',
  introductions: 'معرفی مشتریان',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<MenuItemId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalAlert, setGlobalAlert] = useState<{ messages: string[], type: 'error' | 'success' } | null>(null);

  // All application data states
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>([]);
  const [supportContracts, setSupportContracts] = useState<SupportContract[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  // FIX: Added state for the new Customer Introductions feature.
  const [introductions, setIntroductions] = useState<CustomerIntroduction[]>([]);
  // FIX: Removed unused HR data states.

  // Session management: Check for a valid session on initial load
  useEffect(() => {
    const checkSession = () => {
        try {
            const sessionDataString = localStorage.getItem('crm_session');
            if (sessionDataString) {
                const { user, loginTimestamp } = JSON.parse(sessionDataString);
                const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
                
                // Check if session is older than 3 days
                if (Date.now() - loginTimestamp < threeDaysInMillis) {
                    setCurrentUser(user);
                } else {
                    // Session expired, clear it
                    localStorage.removeItem('crm_session');
                }
            }
        } catch (error) {
            console.error("Failed to parse session data from localStorage", error);
            // Clear corrupted session data
            localStorage.removeItem('crm_session');
        } finally {
            // Finished checking session, hide main loader
            setIsLoading(false);
        }
    };
    checkSession();
  }, []); // Empty dependency array ensures this runs only once on mount

   useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globalAlert) {
      const timer = setTimeout(() => {
        setGlobalAlert(null);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [globalAlert]);

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
        // Fetch core data first
        const [
            usersRes, customersRes, purchaseContractsRes,
            supportContractsRes, ticketsRes, referralsRes,
        ] = await Promise.all([
            api.get('/users?select=*&order=id.asc'),
            api.get('/customers?select=*&order=id.asc'),
            api.get('/purchase_contracts?select=*&order=id.asc'),
            api.get('/support_contracts?select=*&order=id.asc'),
            api.get('/tickets?select=*&order=id.asc'),
            api.get('/referrals?select=*,ticket:tickets(*)&order=id.asc'),
        ]);

        const camelUsers = convertKeysToCamelCase(usersRes.data);
        const camelCustomers = convertKeysToCamelCase(customersRes.data);
        const camelTickets = convertKeysToCamelCase(ticketsRes.data);

        setUsers(camelUsers);
        setCustomers(camelCustomers);
        setPurchaseContracts(convertKeysToCamelCase(purchaseContractsRes.data));
        setSupportContracts(convertKeysToCamelCase(supportContractsRes.data));
        setTickets(camelTickets);
        
        const camelReferrals = convertKeysToCamelCase(referralsRes.data).map((ref: any) => {
            if (ref.ticket) {
                ref.ticket = convertKeysToCamelCase(ref.ticket);
            } else {
                ref.ticket = camelTickets.find((t: Ticket) => t.id === ref.ticketId) || ref.ticket;
            }
            return ref;
        });
        setReferrals(camelReferrals);

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'یک خطای ناشناخته رخ داد.';
        setGlobalAlert({ messages: ['خطا در دریافت اطلاعات اصلی.', errorMessage], type: 'error' });
        console.error("خطا در دریافت اطلاعات اصلی:", errorMessage);
    }

    // Separately fetch introductions data to handle potential errors gracefully
    try {
        const introductionsRes = await api.get('/customer_introductions?select=*&order=created_at.desc');
        setIntroductions(convertKeysToCamelCase(introductionsRes.data));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || '';
        const isMissingTableError = errorMessage.includes("relation \"public.customer_introductions\" does not exist") || errorMessage.includes("Could not find the table");

        if (isMissingTableError) {
             setGlobalAlert({ 
                messages: [
                    'جدول "معرفی مشتریان" یافت نشد!', 
                    'برای فعال‌سازی این بخش، لازم است جدول مربوطه در پایگاه داده شما ایجاد شود.',
                    'لطفا اسکریپت SQL مربوط به ساخت جدول را در Supabase اجرا کنید.'
                ], 
                type: 'error' 
            });
            console.error("خطا: جدول customer_introductions وجود ندارد.");
        } else {
            setGlobalAlert({ messages: ['خطا در دریافت اطلاعات معرفی مشتریان.', errorMessage], type: 'error' });
            console.error("خطا در دریافت اطلاعات معرفی مشتریان:", errorMessage);
        }
    } finally {
        setIsProcessing(false);
    }
  }, [currentUser]);

  // Fetch all data when a user logs in (either via session or form)
  useEffect(() => {
    if (currentUser) {
        fetchAllData();
    }
  }, [currentUser, fetchAllData]);
  
  // Realtime data synchronization
  useEffect(() => {
    if (!currentUser) return;

    const createRealtimeHandler = <T extends { id: number }>(
        setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        const processRecord = (record: any) => convertKeysToCamelCase(record) as T;

        if (eventType === 'INSERT') {
            setState(prev => [processRecord(newRecord), ...prev.filter(item => item.id !== newRecord.id)]);
        } else if (eventType === 'UPDATE') {
            setState(prev => prev.map(item => item.id === newRecord.id ? processRecord(newRecord) : item));
        } else if (eventType === 'DELETE') {
            const id = oldRecord.id;
            setState(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const handleTicketChange = (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const processTicket = (record: any) => convertKeysToCamelCase(record) as Ticket;

        if (eventType === 'INSERT') {
            const newTicket = processTicket(newRecord);
            setTickets(prev => [...prev.filter(t => t.id !== newTicket.id), newTicket]);
        } else if (eventType === 'UPDATE') {
            const updatedTicket = processTicket(newRecord);
            setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            setReferrals(prev => prev.map(r => r.ticketId === updatedTicket.id ? { ...r, ticket: updatedTicket } : r));
        } else if (eventType === 'DELETE') {
            const id = oldRecord.id;
            setTickets(prev => prev.filter(t => t.id !== id));
            setReferrals(prev => prev.filter(r => r.ticketId !== id));
        }
    };
    
    const handleReferralChange = async (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const recordId = newRecord.id;
            try {
                const { data } = await api.get(`/referrals?id=eq.${recordId}&select=*,ticket:tickets(*)`);
                if (data && data.length > 0) {
                    const fullReferral = convertKeysToCamelCase(data[0]);
                    if (fullReferral.ticket) {
                        fullReferral.ticket = convertKeysToCamelCase(fullReferral.ticket);
                    }
                    
                    if (eventType === 'INSERT') {
                        setReferrals(prev => [...prev.filter(r => r.id !== fullReferral.id), fullReferral]);
                    } else { // UPDATE
                        setReferrals(prev => prev.map(r => r.id === fullReferral.id ? fullReferral : r));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch full referral on realtime update:", error);
            }
        } else if (eventType === 'DELETE') {
            const id = oldRecord.id;
            setReferrals(prev => prev.filter(r => r.id !== id));
        }
    };

    const channels: RealtimeChannel[] = [];
    channels.push(supabase.channel('public:users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, createRealtimeHandler(setUsers)).subscribe());
    channels.push(supabase.channel('public:customers').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, createRealtimeHandler(setCustomers)).subscribe());
    channels.push(supabase.channel('public:purchase_contracts').on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_contracts' }, createRealtimeHandler(setPurchaseContracts)).subscribe());
    channels.push(supabase.channel('public:support_contracts').on('postgres_changes', { event: '*', schema: 'public', table: 'support_contracts' }, createRealtimeHandler(setSupportContracts)).subscribe());
    channels.push(supabase.channel('public:tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, handleTicketChange).subscribe());
    channels.push(supabase.channel('public:referrals').on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, handleReferralChange).subscribe());
    // FIX: Added realtime subscription for customer introductions.
    channels.push(supabase.channel('public:customer_introductions').on('postgres_changes', { event: '*', schema: 'public', table: 'customer_introductions' }, createRealtimeHandler(setIntroductions)).subscribe());
    // FIX: Removed realtime subscriptions for HR tables.

    return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
    };
}, [currentUser]);


  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { data, status } = await api.get(`/users?username=eq.${username}&password=eq.${password}&select=*`);
      if (status === 200 && data && data.length > 0) {
        const loggedInUser = convertKeysToCamelCase(data[0]);
        
        // Create and store session data for 3 days
        const sessionData = {
            user: loggedInUser,
            loginTimestamp: Date.now()
        };
        localStorage.setItem('crm_session', JSON.stringify(sessionData));

        setCurrentUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطای ورود:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    // Clear session from localStorage on logout
    localStorage.removeItem('crm_session');
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  // --- START CRUD Handlers (wrapped in useCallback) ---
  
  // FIX: Updated user handlers to manually update state, making the UI responsive
  // even if realtime is not configured correctly (e.g., due to RLS policies).
  const handleSaveUser = useCallback(async (user: User | Omit<User, 'id'>) => {
    setIsProcessing(true);
    try {
        const payload = convertKeysToSnakeCase(user);
        const isEditing = 'id' in user;
        if (isEditing) {
            const { id, ...updateData } = payload;
            const { data } = await api.patch(`/users?id=eq.${id}`, updateData, { headers: { 'Prefer': 'return=representation' } });
            const updatedUser = convertKeysToCamelCase(data[0]);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        } else {
            const { data } = await api.post('/users', payload, { headers: { 'Prefer': 'return=representation' } });
            const newUser = convertKeysToCamelCase(data[0]);
            setUsers(prev => [...prev, newUser]);
        }
        setGlobalAlert({ messages: [`کاربر با موفقیت ${isEditing ? 'ویرایش' : 'ذخیره'} شد.`], type: 'success' });
    } catch (error: any) { 
      const errorMessage = error.response?.data?.message || error.message || 'یک خطای ناشناخته رخ داد.';
      setGlobalAlert({ messages: ['خطا در ذخیره کاربر.', errorMessage], type: 'error' });
      console.error("خطا در ذخیره کاربر:", errorMessage);
    } finally { setIsProcessing(false); }
  }, []);
  
  const handleDeleteUser = useCallback(async (userId: number) => {
    if (userId === currentUser?.id) {
        setGlobalAlert({ messages: ['شما نمی‌توانید حساب کاربری خود را حذف کنید.'], type: 'error' });
        return;
    }
    setIsProcessing(true);
    try { 
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) throw new Error('کاربر برای حذف یافت نشد.');
      const usernameToDelete = userToDelete.username;

      await api.delete(`/referrals?referred_by_username=eq.${usernameToDelete}`);
      await api.delete(`/referrals?referred_to_username=eq.${usernameToDelete}`);
      await api.patch(`/tickets?assigned_to_username=eq.${usernameToDelete}`, { assigned_to_username: null });
      await api.patch(`/purchase_contracts?salesperson_username=eq.${usernameToDelete}`, { salesperson_username: null });
      await api.patch(`/purchase_contracts?crm_responsible_username=eq.${usernameToDelete}`, { crm_responsible_username: null });
      // FIX: Added deletion of related customer introductions.
      await api.delete(`/customer_introductions?introducer_username=eq.${usernameToDelete}`);
      await api.delete(`/customer_introductions?assigned_to_username=eq.${usernameToDelete}`);

      await api.delete(`/users?id=eq.${userId}`); 
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      setGlobalAlert({ messages: ['کاربر با موفقیت حذف شد.'], type: 'success' });
    } catch (error: any) { 
      const errorMessage = error.response?.data?.message || error.message || 'یک خطای ناشناخته رخ داد.';
      setGlobalAlert({ messages: ['خطا در حذف کاربر.', errorMessage], type: 'error' });
    } finally { setIsProcessing(false); }
  }, [users, currentUser]);

  const handleDeleteManyUsers = useCallback(async (userIds: number[]) => {
    if (userIds.includes(currentUser?.id ?? -1)) {
        setGlobalAlert({ messages: ['شما نمی‌توانید حساب کاربری خود را در حذف گروهی انتخاب کنید.'], type: 'error' });
        return;
    }
    setIsProcessing(true);
    try { 
      const usersToDelete = users.filter(u => userIds.includes(u.id));
      if (usersToDelete.length === 0) {
        setIsProcessing(false);
        return;
      }
      const usernamesToDelete = usersToDelete.map(u => u.username);
      const usernamesQuery = `in.(${usernamesToDelete.join(',')})`;
      const userIdsQuery = `in.(${userIds.join(',')})`;

      await api.delete(`/referrals?referred_by_username=${usernamesQuery}`);
      await api.delete(`/referrals?referred_to_username=${usernamesQuery}`);
      await api.patch(`/tickets?assigned_to_username=${usernamesQuery}`, { assigned_to_username: null });
      await api.patch(`/purchase_contracts?salesperson_username=${usernamesQuery}`, { salesperson_username: null });
      await api.patch(`/purchase_contracts?crm_responsible_username=${usernamesQuery}`, { crm_responsible_username: null });
       // FIX: Added deletion of related customer introductions.
      await api.delete(`/customer_introductions?introducer_username=${usernamesQuery}`);
      await api.delete(`/customer_introductions?assigned_to_username=${usernamesQuery}`);

      await api.delete(`/users?id=${userIdsQuery}`); 
      
      setUsers(prev => prev.filter(u => !userIds.includes(u.id)));
      setGlobalAlert({ messages: [`${toPersianDigits(userIds.length)} کاربر با موفقیت حذف شدند.`], type: 'success' });
    } catch (error: any) { 
      const errorMessage = error.response?.data?.message || error.message || 'یک خطای ناشناخته رخ داد.';
      setGlobalAlert({ messages: ['خطا در حذف گروهی کاربران.', errorMessage], type: 'error' });
    } finally { setIsProcessing(false); }
  }, [users, currentUser]);

  // FIX: Refactored generic CRUD handlers to accept a setState function,
  // ensuring immediate UI updates after successful API calls.
  const useGenericCrudHandlers = <T extends {id: number}>(
    entityName: string, 
    endpoint: string,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    sortAfterInsert: (a: T, b: T) => number = () => 0
  ) => {
    const onSave = useCallback(async (data: T | Omit<T, 'id'>) => {
        setIsProcessing(true);
        try {
            const payload = convertKeysToSnakeCase(data);
            const isEditing = 'id' in data;
            if (isEditing) {
                const { id, ...updateData } = payload;
                const { data: updatedData } = await api.patch(`/${endpoint}?id=eq.${id}`, updateData, { headers: { 'Prefer': 'return=representation' } });
                const updatedItem = convertKeysToCamelCase(updatedData[0]);
                setState(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
            } else {
                const { data: newData } = await api.post(`/${endpoint}`, payload, { headers: { 'Prefer': 'return=representation' } });
                const newItem = convertKeysToCamelCase(newData[0]);
                setState(prev => [...prev, newItem].sort(sortAfterInsert));
            }
            setGlobalAlert({ messages: [`${entityName} با موفقیت ${isEditing ? 'ویرایش' : 'ذخیره'} شد.`], type: 'success' });
        } catch (error: any) { 
            const errorMessage = error.response?.data?.message || error.message;
            setGlobalAlert({ messages: [`خطا در ذخیره ${entityName}.`, errorMessage], type: 'error' });
        } finally { setIsProcessing(false); }
    }, [entityName, endpoint, setState, sortAfterInsert]);

    const onDelete = useCallback(async (id: number) => {
        setIsProcessing(true);
        try {
            await api.delete(`/${endpoint}?id=eq.${id}`);
            setState(prev => prev.filter(item => item.id !== id));
            setGlobalAlert({ messages: [`${entityName} با موفقیت حذف شد.`], type: 'success' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            setGlobalAlert({ messages: [`خطا در حذف ${entityName}.`, errorMessage], type: 'error' });
        } finally { setIsProcessing(false); }
    }, [entityName, endpoint, setState]);

    const onDeleteMany = useCallback(async (ids: number[]) => {
        setIsProcessing(true);
        try {
            await api.delete(`/${endpoint}?id=in.(${ids.join(',')})`);
            setState(prev => prev.filter(item => !ids.includes(item.id)));
            setGlobalAlert({ messages: [`${toPersianDigits(ids.length)} ${entityName} با موفقیت حذف شدند.`], type: 'success' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            setGlobalAlert({ messages: [`خطا در حذف گروهی ${entityName}.`, errorMessage], type: 'error' });
        } finally { setIsProcessing(false); }
    }, [entityName, endpoint, setState]);

    return { onSave, onDelete, onDeleteMany };
  };

  const { onSave: handleSaveCustomer, onDelete: handleDeleteCustomer, onDeleteMany: handleDeleteManyCustomers } = useGenericCrudHandlers<Customer>('مشتری', 'customers', setCustomers);
  const { onSave: handleSavePurchaseContract, onDelete: handleDeletePurchaseContract, onDeleteMany: handleDeleteManyPurchaseContracts } = useGenericCrudHandlers<PurchaseContract>('قرارداد فروش', 'purchase_contracts', setPurchaseContracts);
  const { onSave: handleSaveSupportContract, onDelete: handleDeleteSupportContract, onDeleteMany: handleDeleteManySupportContracts } = useGenericCrudHandlers<SupportContract>('قرارداد پشتیبانی', 'support_contracts', setSupportContracts);
  // FIX: Added CRUD handlers for the new Customer Introductions feature.
  const { onSave: handleSaveIntroduction, onDelete: handleDeleteIntroduction } = useGenericCrudHandlers<CustomerIntroduction>(
    'معرفی مشتری', 
    'customer_introductions', 
    setIntroductions,
    // FIX: Use 'createdAt' for sorting new customer introductions, falling back to 'introductionDate'.
    (a: CustomerIntroduction, b: CustomerIntroduction) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (parseJalaali(a.introductionDate)?.getTime() || 0);
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (parseJalaali(b.introductionDate)?.getTime() || 0);
        return dateB - dateA;
    }
  );
  // FIX: Removed unused HR CRUD handlers.

  const { onSave: handleGenericTicketSave, onDelete: handleDeleteTicket } = useGenericCrudHandlers<Ticket>('تیکت', 'tickets', setTickets);

  const handleSaveTicket = useCallback(async (ticketData: Ticket | Omit<Ticket, 'id'>) => {
    setIsProcessing(true);
    try {
        let payload: Partial<Ticket> & { id?: number } = { ...ticketData };
        const isEditing = 'id' in payload;

        if (!isEditing) {
            const now = new Date();
            const lastTicketNumber = tickets.reduce((max, t) => Math.max(max, parseInt(t.ticketNumber.split('-')[1], 10) || 0), 0);
            payload = {
                ...payload,
                ticketNumber: `T-${lastTicketNumber + 1}`,
                creationDateTime: formatJalaaliDateTime(now),
                lastUpdateDate: formatJalaaliDateTime(now),
                editableUntil: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
            };
        } else {
            payload = { ...payload, lastUpdateDate: formatJalaaliDateTime(new Date()) };
        }
        await handleGenericTicketSave(payload as Ticket);

    } catch (error: any) {
        // Error is handled in the generic handler
    } finally { setIsProcessing(false); }
  }, [tickets, handleGenericTicketSave]);
  
  const handleReferTicket = useCallback(async (ticketId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => {
    setIsProcessing(true);
    try {
        const { data: updatedTicketData } = await api.patch(`/tickets?id=eq.${ticketId}`, { status: 'ارجاع شده', assigned_to_username: referredToUsername }, { headers: { 'Prefer': 'return=representation' }});
        const updatedTicket = convertKeysToCamelCase(updatedTicketData[0]);
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        
        const referralPayload = {
            ticket_id: ticketId,
            referred_by_username: referredBy.username,
            referred_to_username: referredToUsername,
            referral_date: new Date().toISOString()
        };
        await api.post('/referrals', referralPayload);
        // Rely on realtime to update referrals list. It's less critical for immediate feedback.
        setGlobalAlert({ messages: [`تیکت با موفقیت ارجاع داده شد.`], type: 'success' });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        setGlobalAlert({ messages: ['خطا در ارجاع تیکت.', errorMessage], type: 'error' });
    } finally { setIsProcessing(false); }
  }, []);

  const handleToggleWork = useCallback(async (ticketId: number) => {
      setIsProcessing(true);
      try {
        const ticket = tickets.find(t => t.id === ticketId) || referrals.find(r => r.ticket.id === ticketId)?.ticket;
        if (!ticket) return;

        let newStatus: TicketStatus;
        let workSessionStartedAt: string | null = ticket.workSessionStartedAt || null;
        let totalWorkDuration = ticket.totalWorkDuration || 0;

        if (ticket.status === 'در حال پیگیری') {
            newStatus = 'اتمام یافته';
            if (workSessionStartedAt) {
                totalWorkDuration += Math.floor((new Date().getTime() - new Date(workSessionStartedAt).getTime()) / 1000);
            }
            workSessionStartedAt = null;
        } else {
            newStatus = 'در حال پیگیری';
            workSessionStartedAt = new Date().toISOString();
        }

        const { data: updatedTicketData } = await api.patch(`/tickets?id=eq.${ticketId}`, { status: newStatus, work_session_started_at: workSessionStartedAt, total_work_duration: totalWorkDuration }, { headers: { 'Prefer': 'return=representation' }});
        const updatedTicket = convertKeysToCamelCase(updatedTicketData[0]);
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setGlobalAlert({ messages: [`وضعیت تیکت با موفقیت تغییر کرد.`], type: 'success' });
      } catch(e) {
         setGlobalAlert({ messages: ['خطا در تغییر وضعیت تیکت.'], type: 'error' });
      } finally { setIsProcessing(false); }
  }, [tickets, referrals]);

  const handleReopenTicket = useCallback(async (ticketId: number) => {
      setIsProcessing(true);
      try {
        const { data: updatedTicketData } = await api.patch(`/tickets?id=eq.${ticketId}`, { status: 'انجام نشده' }, { headers: { 'Prefer': 'return=representation' }});
        const updatedTicket = convertKeysToCamelCase(updatedTicketData[0]);
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setGlobalAlert({ messages: ['تیکت با موفقیت مجدداً باز شد.'], type: 'success' });
      } catch (e) {
        setGlobalAlert({ messages: ['خطا در باز کردن مجدد تیکت.'], type: 'error' });
      } finally { setIsProcessing(false); }
  }, []);

  const handleExtendEditTime = useCallback(async (ticketId: number) => {
      setIsProcessing(true);
      try {
        const newEditableUntil = new Date(new Date().getTime() + 30 * 60 * 1000).toISOString();
        const { data: updatedTicketData } = await api.patch(`/tickets?id=eq.${ticketId}`, { editable_until: newEditableUntil }, { headers: { 'Prefer': 'return=representation' }});
        const updatedTicket = convertKeysToCamelCase(updatedTicketData[0]);
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setGlobalAlert({ messages: ['زمان ویرایش تیکت با موفقیت تمدید شد.'], type: 'success' });
      } catch (e) {
        setGlobalAlert({ messages: ['خطا در تمدید زمان ویرایش.'], type: 'error' });
      } finally { setIsProcessing(false); }
  }, []);
  
  // FIX: Removed unused HR handlers.


  // --- END CRUD Handlers ---

  const renderPage = () => {
    if (!currentUser) return null;
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage users={users} customers={customers} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} referrals={referrals} />;
      case 'users':
        return <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} onDeleteMany={handleDeleteManyUsers} currentUser={currentUser} />;
      case 'customers':
        return <CustomerList customers={customers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} onDeleteMany={handleDeleteManyCustomers} currentUser={currentUser} />;
      case 'contracts':
        return (
            <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <main className="max-w-7xl mx-auto space-y-12">
                    <PurchaseContracts contracts={purchaseContracts} users={users} customers={customers} onSave={handleSavePurchaseContract} onDelete={handleDeletePurchaseContract} onDeleteMany={handleDeleteManyPurchaseContracts} currentUser={currentUser} />
                    <SupportContracts contracts={supportContracts} customers={customers} onSave={handleSaveSupportContract} onDelete={handleDeleteSupportContract} onDeleteMany={handleDeleteManySupportContracts} currentUser={currentUser} />
                </main>
            </div>
        );
      case 'tickets':
        return <Tickets tickets={tickets} referrals={referrals} customers={customers} users={users} supportContracts={supportContracts} onSave={handleSaveTicket} onReferTicket={handleReferTicket} onToggleWork={handleToggleWork} onDeleteTicket={handleDeleteTicket} onReopenTicket={handleReopenTicket} onExtendEditTime={handleExtendEditTime} currentUser={currentUser} />;
      case 'reports':
        return <ReportsPage customers={customers} users={users} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} currentUser={currentUser} />;
      case 'referrals':
        return <ReferralsPage referrals={referrals} currentUser={currentUser} users={users} customers={customers} supportContracts={supportContracts} onSave={handleSaveTicket} onReferTicket={handleReferTicket} onToggleWork={handleToggleWork} onExtendEditTime={handleExtendEditTime} />;
      // FIX: Added case for the new introductions page.
      case 'introductions':
        const introductionsForUser = introductions.filter(intro => {
          // Manager can see all introductions
          if (currentUser.role === 'مدیر') {
            return true;
          }
          // Sales team members can see introductions they introduced or are assigned to
          return intro.introducerUsername === currentUser.username || intro.assignedToUsername === currentUser.username;
        });
        return <IntroductionsPage introductions={introductionsForUser} users={users} onSave={handleSaveIntroduction} onDelete={handleDeleteIntroduction} currentUser={currentUser} />;
      // FIX: Removed unused HR page cases.
      default:
        return <DashboardPage users={users} customers={customers} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} referrals={referrals} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50">
        <span className="loader !border-cyan-600"></span>
      </div>
    );
  }

  return (
    <>
      <ProcessingOverlay isVisible={isProcessing} />
      <Alert messages={globalAlert?.messages || []} type={globalAlert?.type} onClose={() => setGlobalAlert(null)} />
      {currentUser ? (
        <div className="h-screen flex overflow-hidden bg-gray-100">
          <Sidebar 
            activePage={activePage} 
            setActivePage={(page) => setActivePage(page as MenuItemId)} 
            isSidebarOpen={isSidebarOpen} 
            user={currentUser} 
            onLogout={handleLogout}
            onClose={() => setIsSidebarOpen(false)}
          />
           {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden"></div>}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header pageTitle={pageTitles[activePage]} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {renderPage()}
          </div>
        </div>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
