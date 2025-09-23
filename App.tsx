
import React, { useState, useEffect, useCallback } from 'react';
import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral, MenuItemId, AttendanceRecord, LeaveRequest, Mission, AttendanceType, LeaveRequestStatus } from './types';
import api from './src/api';

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
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import MissionsPage from './pages/MissionsPage';
import ProcessingOverlay from './components/ProcessingOverlay';
import { formatJalaaliDateTime } from './utils/dateFormatter';

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

const convertKeysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (Array.isArray(obj[key])) {
              acc[snakeKey] = obj[key];
            } else {
              acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
            }
            return acc;
        }, {} as any);
    }
    return obj;
};

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
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<MenuItemId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // All application data states
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>([]);
  const [supportContracts, setSupportContracts] = useState<SupportContract[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  // HR data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);

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
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
        const [
            usersRes, customersRes, purchaseContractsRes,
            supportContractsRes, ticketsRes, referralsRes
        ] = await Promise.all([
            api.get('/users?select=*&order=id.asc'),
            api.get('/customers?select=*&order=id.asc'),
            api.get('/purchase_contracts?select=*&order=id.asc'),
            api.get('/support_contracts?select=*&order=id.asc'),
            api.get('/tickets?select=*&order=id.asc'),
            api.get('/referrals?select=*,ticket:tickets(*)&order=id.asc')
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
        console.error("خطا در دریافت اطلاعات کلی:", error.response?.data?.message || error.message);
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

  // CRUD Handlers
  const handleSaveUser = async (user: User | Omit<User, 'id'>) => {
    setIsProcessing(true);
    try {
        const payload = convertKeysToSnakeCase(user);
        if ('id' in user) {
            const { id, ...updateData } = payload;
            await api.patch(`/users?id=eq.${id}`, updateData);
        } else {
            await api.post('/users', payload, { headers: { 'Prefer': 'return=minimal' } });
        }
        await fetchAllData();
    } catch (error: any) { console.error("خطا در ذخیره کاربر:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };
  const handleDeleteUser = async (userId: number) => {
    setIsProcessing(true);
    try { await api.delete(`/users?id=eq.${userId}`); await fetchAllData(); } catch (error) { console.error("خطای حذف کاربر:", error); } finally { setIsProcessing(false); }
  };
  const handleDeleteManyUsers = async (userIds: number[]) => {
    setIsProcessing(true);
    try { await api.delete(`/users?id=in.(${userIds.join(',')})`); await fetchAllData(); } catch (error) { console.error("خطای حذف کاربران:", error); } finally { setIsProcessing(false); }
  };
  
  const handleSaveCustomer = async (customer: Customer | Omit<Customer, 'id'>) => {
    setIsProcessing(true);
    try {
        const payload = convertKeysToSnakeCase(customer);
        if ('id' in customer) {
            const { id, ...updateData } = payload;
            await api.patch(`/customers?id=eq.${id}`, updateData);
        } else {
            await api.post('/customers', payload, { headers: { 'Prefer': 'return=minimal' } });
        }
        await fetchAllData();
    } catch (error: any) { console.error("خطا در ذخیره مشتری:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };
  const handleDeleteCustomer = async (customerId: number) => {
    setIsProcessing(true);
    try { await api.delete(`/customers?id=eq.${customerId}`); await fetchAllData(); } catch (error) { console.error("خطای حذف مشتری:", error); } finally { setIsProcessing(false); }
  };
  const handleDeleteManyCustomers = async (customerIds: number[]) => {
    setIsProcessing(true);
    try { await api.delete(`/customers?id=in.(${customerIds.join(',')})`); await fetchAllData(); } catch (error) { console.error("خطای حذف مشتریان:", error); } finally { setIsProcessing(false); }
  };

    const handleSaveTicket = async (ticketData: Ticket | Omit<Ticket, 'id'>) => {
    setIsProcessing(true);
    try {
      let savedTicket: Ticket;
      if ('id' in ticketData) {
        const { id, ...updateData } = convertKeysToSnakeCase(ticketData);
        const { data } = await api.patch(`/tickets?id=eq.${id}`, updateData, { headers: { 'Prefer': 'return=representation' } });
        savedTicket = convertKeysToCamelCase(data[0]);
      } else {
        const creationTime = new Date();
        const editableUntil = new Date(creationTime.getTime() + 15 * 60 * 1000).toISOString();
        const payload = {
          ...convertKeysToSnakeCase(ticketData),
          ticket_number: `T-${Date.now().toString().slice(-5)}`,
          creation_date_time: creationTime.toISOString(),
          last_update_date: creationTime.toISOString(),
          editable_until: editableUntil,
        };
        const { data } = await api.post('/tickets', payload, { headers: { 'Prefer': 'return=representation' } });
        savedTicket = convertKeysToCamelCase(data[0]);
      }
      await fetchAllData();
    } catch (error: any) { console.error("خطا در ذخیره تیکت:", error.response?.data || error.message); } finally { setIsProcessing(false); }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    setIsProcessing(true);
    try { await api.delete(`/tickets?id=eq.${ticketId}`); await fetchAllData(); } catch (error) { console.error("خطای حذف تیکت:", error); } finally { setIsProcessing(false); }
  };

  const handleReferTicket = async (ticketId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => {
    setIsProcessing(true);
    try {
        // 1. Create referral record
        await api.post('/referrals', {
            ticket_id: ticketId,
            referred_by_username: referredBy.username,
            referred_to_username: referredToUsername,
            referral_date: new Date().toISOString()
        }, { headers: { 'Prefer': 'return=minimal' } });
        
        // 2. Update ticket status and assignee
        await api.patch(`/tickets?id=eq.${ticketId}`, {
            assigned_to_username: referredToUsername,
            status: 'ارجاع شده',
            last_update_date: new Date().toISOString()
        });
        
        await fetchAllData();
    } catch (error: any) { console.error("خطا در ارجاع تیکت:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };

  const handleToggleWork = async (ticketId: number) => {
    setIsProcessing(true);
    try {
        const ticket = tickets.find(t => t.id === ticketId) || referrals.find(r => r.ticket.id === ticketId)?.ticket;
        if (!ticket) throw new Error("تیکت یافت نشد");
        
        let updatePayload: any;
        if (ticket.status === 'در حال پیگیری') { // Stop work
            const sessionStart = new Date(ticket.workSessionStartedAt!).getTime();
            const now = new Date().getTime();
            const duration = Math.floor((now - sessionStart) / 1000);
            updatePayload = {
                status: 'اتمام یافته',
                work_session_started_at: null,
                total_work_duration: ticket.totalWorkDuration + duration,
                last_update_date: new Date().toISOString()
            };
        } else { // Start work
            updatePayload = {
                status: 'در حال پیگیری',
                work_session_started_at: new Date().toISOString(),
                last_update_date: new Date().toISOString()
            };
        }
        await api.patch(`/tickets?id=eq.${ticketId}`, updatePayload);
        await fetchAllData();
    } catch (error: any) { console.error("خطا در تغییر وضعیت کار:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };
  
  const handleSavePurchaseContract = async (contract: PurchaseContract | Omit<PurchaseContract, 'id'>) => {
    setIsProcessing(true);
    try {
        const payload = convertKeysToSnakeCase(contract);
        if ('id' in contract) {
            const { id, ...updateData } = payload;
            await api.patch(`/purchase_contracts?id=eq.${id}`, updateData);
        } else {
            await api.post('/purchase_contracts', payload, { headers: { 'Prefer': 'return=minimal' } });
        }
        await fetchAllData();
    } catch (error: any) { console.error("خطا در ذخیره قرارداد فروش:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };
  const handleDeletePurchaseContract = async (contractId: number) => {
    setIsProcessing(true);
    try { await api.delete(`/purchase_contracts?id=eq.${contractId}`); await fetchAllData(); } catch (error) { console.error("خطای حذف قرارداد فروش:", error); } finally { setIsProcessing(false); }
  };
  const handleDeleteManyPurchaseContracts = async (contractIds: number[]) => {
    setIsProcessing(true);
    try { await api.delete(`/purchase_contracts?id=in.(${contractIds.join(',')})`); await fetchAllData(); } catch (error) { console.error("خطای حذف قراردادهای فروش:", error); } finally { setIsProcessing(false); }
  };
  
  const handleSaveSupportContract = async (contract: SupportContract | Omit<SupportContract, 'id'>) => {
     setIsProcessing(true);
    try {
        const payload = convertKeysToSnakeCase(contract);
        if ('id' in contract) {
            const { id, ...updateData } = payload;
            await api.patch(`/support_contracts?id=eq.${id}`, updateData);
        } else {
            await api.post('/support_contracts', payload, { headers: { 'Prefer': 'return=minimal' } });
        }
        await fetchAllData();
    } catch (error: any) { console.error("خطا در ذخیره قرارداد پشتیبانی:", error.response?.data?.message || error.message); } finally { setIsProcessing(false); }
  };
  const handleDeleteSupportContract = async (contractId: number) => {
    setIsProcessing(true);
    try { await api.delete(`/support_contracts?id=eq.${contractId}`); await fetchAllData(); } catch (error) { console.error("خطای حذف قرارداد پشتیبانی:", error); } finally { setIsProcessing(false); }
  };
  const handleDeleteManySupportContracts = async (contractIds: number[]) => {
    setIsProcessing(true);
    try { await api.delete(`/support_contracts?id=in.(${contractIds.join(',')})`); await fetchAllData(); } catch (error) { console.error("خطای حذف قراردادهای پشتیبانی:", error); } finally { setIsProcessing(false); }
  };
  
  const handleRecordAttendance = (type: AttendanceType) => { /* Mock */ };
  const handleSaveLeaveRequest = (request: LeaveRequest | Omit<LeaveRequest, 'id'>) => { /* Mock */ };
  const handleLeaveStatusChange = (requestId: number, newStatus: LeaveRequestStatus) => { /* Mock */ };
  const handleSaveMission = (mission: Mission | Omit<Mission, 'id'>) => { /* Mock */ };

  const renderPage = useCallback(() => {
    if (!currentUser) return null;
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const pageComponents: { [key in MenuItemId]?: React.ReactElement } = {
        'dashboard': <DashboardPage users={users} customers={customers} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} referrals={referrals} />,
        'users': <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} onDeleteMany={handleDeleteManyUsers} currentUser={currentUser} />,
        'customers': <CustomerList customers={customers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} onDeleteMany={handleDeleteManyCustomers} currentUser={currentUser} />,
        'contracts': (
            <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <main className="max-w-7xl mx-auto space-y-8">
                    <PurchaseContracts contracts={purchaseContracts} users={users} customers={customers} onSave={handleSavePurchaseContract} onDelete={handleDeletePurchaseContract} onDeleteMany={handleDeleteManyPurchaseContracts} currentUser={currentUser} />
                    <SupportContracts contracts={supportContracts} customers={customers} onSave={handleSaveSupportContract} onDelete={handleDeleteSupportContract} onDeleteMany={handleDeleteManySupportContracts} currentUser={currentUser} />
                </main>
            </div>
        ),
        'tickets': <Tickets tickets={tickets} referrals={referrals} customers={customers} users={users} supportContracts={supportContracts} onSave={handleSaveTicket} onReferTicket={handleReferTicket} onToggleWork={handleToggleWork} onDeleteTicket={handleDeleteTicket} currentUser={currentUser} />,
        'referrals': <ReferralsPage referrals={referrals} currentUser={currentUser} users={users} customers={customers} supportContracts={supportContracts} onSave={handleSaveTicket} onReferTicket={handleReferTicket} onToggleWork={handleToggleWork} />,
        'reports': <ReportsPage customers={customers} users={users} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} />,
        'attendance': <AttendancePage currentUser={currentUser} records={attendanceRecords} onRecord={handleRecordAttendance} />,
        'leave': <LeavePage currentUser={currentUser} leaveRequests={leaveRequests} users={users} onSave={handleSaveLeaveRequest} onStatusChange={handleLeaveStatusChange} />,
        'missions': <MissionsPage currentUser={currentUser} missions={missions} users={users} onSave={handleSaveMission} />,
    };
    return pageComponents[activePage] || null;
  }, [activePage, currentUser, users, customers, purchaseContracts, supportContracts, tickets, referrals, attendanceRecords, leaveRequests, missions, fetchAllData]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <span className="loader" style={{borderColor: '#0891b2', borderStyle: 'solid'}}></span>
        </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
       {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" aria-hidden="true" />}
      <Sidebar
        user={currentUser}
        activePage={activePage}
        setActivePage={(page) => setActivePage(page as MenuItemId)}
        isSidebarOpen={isSidebarOpen}
        onLogout={handleLogout}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
         <Header
          pageTitle={pageTitles[activePage]}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />
        <div className="flex-1 flex" style={{ overflow: 'hidden' }}>
          {renderPage()}
        </div>
      </div>
      <ProcessingOverlay isVisible={isProcessing} />
    </div>
  );
};

export default App;
