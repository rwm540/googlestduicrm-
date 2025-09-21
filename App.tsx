import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UserManagement from './pages/UserManagement';
import CustomerList from './pages/CustomerList';
import PurchaseContracts from './pages/PurchaseContracts';
import SupportContracts from './pages/SupportContracts';
import Tickets from './pages/Tickets';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ReferralsPage from './pages/ReferralsPage';

import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral } from './types';
import { MenuIcon } from './components/icons/MenuIcon';

// Declare globals loaded from CDN
declare const jalaali: any;

const API_URL = 'http://localhost:3001/api';

function App() {
  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>([]);
  const [supportContracts, setSupportContracts] = useState<SupportContract[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  
  // App state
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchData = useCallback(async (entity?: string) => {
    try {
      const fetchPromises = {
        users: () => fetch(`${API_URL}/users`).then(res => res.json()),
        customers: () => fetch(`${API_URL}/customers`).then(res => res.json()),
        contracts: () => fetch(`${API_URL}/contracts`).then(res => res.json()),
        tickets: () => fetch(`${API_URL}/tickets`).then(res => res.json()),
      };

      if (entity) {
         switch (entity) {
            case 'users': setUsers(await fetchPromises.users()); break;
            case 'customers': setCustomers(await fetchPromises.customers()); break;
            case 'contracts': 
                const { purchase, support } = await fetchPromises.contracts();
                setPurchaseContracts(purchase);
                setSupportContracts(support);
                break;
            case 'tickets':
                const { tickets: fetchedTickets, referrals: fetchedReferrals } = await fetchPromises.tickets();
                setTickets(fetchedTickets);
                setReferrals(fetchedReferrals);
                break;
         }
      } else {
         const [usersData, customersData, contractsData, ticketsData] = await Promise.all([
            fetchPromises.users(),
            fetchPromises.customers(),
            fetchPromises.contracts(),
            fetchPromises.tickets(),
         ]);
         setUsers(usersData);
         setCustomers(customersData);
         setPurchaseContracts(contractsData.purchase);
         setSupportContracts(contractsData.support);
         setTickets(ticketsData.tickets);
         setReferrals(ticketsData.referrals);
      }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => console.log('Connected to WebSocket server'));
    socket.on('data_changed', (data: { entity: string }) => {
        console.log(`Data changed for: ${data.entity}, refetching...`);
        fetchData(data.entity);
    });
    socket.on('disconnect', () => console.log('Disconnected from WebSocket server'));

    return () => {
        socket.disconnect();
    };
  }, [fetchData]);

  const apiRequest = async (url: string, method: string, body?: any) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      return response.json();
    } catch (error) {
      console.error(`Error with ${method} ${url}:`, error);
      // Here you could show an error toast to the user
    }
  };

  // --- CRUD Handlers ---
  const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
    const isEditing = 'id' in userData;
    apiRequest(isEditing ? `/users/${userData.id}` : '/users', isEditing ? 'PUT' : 'POST', userData);
  };
  const handleDeleteUser = (userId: number) => apiRequest(`/users/${userId}`, 'DELETE');
  const handleDeleteUsers = (userIds: number[]) => apiRequest('/users/delete-many', 'POST', { ids: userIds });
  
  const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
    const isEditing = 'id' in customerData;
    apiRequest(isEditing ? `/customers/${customerData.id}` : '/customers', isEditing ? 'PUT' : 'POST', customerData);
  };
  const handleDeleteCustomer = (customerId: number) => apiRequest(`/customers/${customerId}`, 'DELETE');
  const handleDeleteCustomers = (customerIds: number[]) => apiRequest('/customers/delete-many', 'POST', { ids: customerIds });

  const handleSavePurchaseContract = (contractData: PurchaseContract | Omit<PurchaseContract, 'id'>) => {
    const isEditing = 'id' in contractData;
    apiRequest(isEditing ? `/contracts/purchase/${contractData.id}` : '/contracts/purchase', isEditing ? 'PUT' : 'POST', contractData);
  };
  const handleDeletePurchaseContract = (contractId: number) => apiRequest(`/contracts/purchase/${contractId}`, 'DELETE');
  const handleDeletePurchaseContracts = (contractIds: number[]) => apiRequest('/contracts/purchase/delete-many', 'POST', { ids: contractIds });
  
  const handleSaveSupportContract = (contractData: SupportContract | Omit<SupportContract, 'id'>) => {
    const isEditing = 'id' in contractData;
    apiRequest(isEditing ? `/contracts/support/${contractData.id}` : '/contracts/support', isEditing ? 'PUT' : 'POST', contractData);
  };
  const handleDeleteSupportContract = (contractId: number) => apiRequest(`/contracts/support/${contractId}`, 'DELETE');
  const handleDeleteSupportContracts = (contractIds: number[]) => apiRequest('/contracts/support/delete-many', 'POST', { ids: contractIds });
  
  const handleSaveTicket = (ticketData: Ticket | Omit<Ticket, 'id'>, isFromReferral: boolean) => {
    const isEditing = 'id' in ticketData;
    apiRequest(isEditing ? `/tickets/${ticketData.id}` : '/tickets', isEditing ? 'PUT' : 'POST', ticketData);
  };

  const handleToggleWork = (itemId: number) => apiRequest(`/tickets/${itemId}/toggle-work`, 'POST');
  
  const handleReferTicket = (itemId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => {
      apiRequest(`/tickets/${itemId}/refer`, 'POST', { referredTo: referredToUsername, isFromReferral, referredBy: referredBy.username });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const landingPage = user.accessibleMenus.includes('dashboard') ? 'dashboard' : user.accessibleMenus[0] || 'no_access';
    setActivePage(landingPage);
  };
  
  const handleLogout = () => setCurrentUser(null);

  if (loading && !currentUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>در حال بارگذاری...</p>
        </div>
    );
  }

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;
  
  const hasAccess = (pageId: string) => currentUser.accessibleMenus.includes(pageId as any);

  const renderActivePage = () => {
    if (!hasAccess(activePage) && activePage !== 'no_access') return <PlaceholderPage title="دسترسی غیر مجاز" />;
    
    switch (activePage) {
      case 'dashboard': return <DashboardPage users={users} customers={customers} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} referrals={referrals} />;
      case 'users': return <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} onDeleteMany={handleDeleteUsers} currentUser={currentUser} />;
      case 'customers': return <CustomerList customers={customers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} onDeleteMany={handleDeleteCustomers} currentUser={currentUser} />;
      case 'contracts': return (
        <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
           <main className="max-w-7xl mx-auto">
            <div className="mb-8"><PurchaseContracts contracts={purchaseContracts} users={users} customers={customers} onSave={handleSavePurchaseContract} onDelete={handleDeletePurchaseContract} onDeleteMany={handleDeletePurchaseContracts} currentUser={currentUser} /></div>
            <div className="mt-12"><SupportContracts contracts={supportContracts} customers={customers} onSave={handleSaveSupportContract} onDelete={handleDeleteSupportContract} onDeleteMany={handleDeleteSupportContracts} currentUser={currentUser} /></div>
          </main>
        </div>
      );
      case 'tickets': return <Tickets tickets={tickets} referrals={referrals} customers={customers} users={users} onSave={handleSaveTicket} onReferTicket={handleReferTicket} currentUser={currentUser} onToggleWork={handleToggleWork} supportContracts={supportContracts} />;
      case 'reports': return <ReportsPage customers={customers} users={users} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} />;
      case 'referrals': return <ReferralsPage referrals={referrals} currentUser={currentUser} users={users} customers={customers} onSave={handleSaveTicket} onReferTicket={handleReferTicket} onToggleWork={handleToggleWork} supportContracts={supportContracts} />;
      case 'no_access': return <PlaceholderPage title="شما به هیچ صفحه‌ای دسترسی ندارید." />;
      default: return <PlaceholderPage title="صفحه مورد نظر یافت نشد" />;
    }
  };

  return (
    <div className="relative lg:flex h-screen bg-gray-100 font-sans" dir="rtl">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden" aria-hidden="true"></div>}
      <Sidebar activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} user={currentUser} onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center bg-white border-b border-gray-200 h-20 px-6 flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><MenuIcon /></button>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">{renderActivePage()}</div>
      </div>
    </div>
  );
}

export default App;
