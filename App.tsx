import React, { useState, useEffect } from 'react';
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
import { initialUsers, initialCustomers, initialPurchaseContracts, initialSupportContracts, initialTickets } from './data';
import { MenuIcon } from './components/icons/MenuIcon';
import { formatJalaali, formatJalaaliDateTime } from './utils/dateFormatter';

// Declare globals loaded from CDN
declare const jalaali: any;

function App() {
  // State for data
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>(initialPurchaseContracts);
  const [supportContracts, setSupportContracts] = useState<SupportContract[]>(initialSupportContracts);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  
  // App state
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
    if ('id' in userData) setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } as User : u));
    else setUsers([...users, { ...userData, id: Date.now() } as User]);
  };

  const handleDeleteUser = (userId: number) => setUsers(users.filter(u => u.id !== userId));
  const handleDeleteUsers = (userIds: number[]) => setUsers(users.filter(u => !userIds.includes(u.id)));
  
  const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
    if ('id' in customerData) setCustomers(customers.map(c => c.id === customerData.id ? { ...c, ...customerData } : c));
    else setCustomers([...customers, { ...customerData, id: Date.now() } as Customer]);
  };

  const handleDeleteCustomer = (customerId: number) => setCustomers(customers.filter(c => c.id !== customerId));
  const handleDeleteCustomers = (customerIds: number[]) => setCustomers(customers.filter(c => !customerIds.includes(c.id)));

  const handleSavePurchaseContract = (contractData: PurchaseContract | Omit<PurchaseContract, 'id'>) => {
    if ('id' in contractData) setPurchaseContracts(purchaseContracts.map(c => c.id === contractData.id ? { ...c, ...contractData } : c));
    else setPurchaseContracts([...purchaseContracts, { ...contractData, id: Date.now() } as PurchaseContract]);
  };

  const handleDeletePurchaseContract = (contractId: number) => setPurchaseContracts(purchaseContracts.filter(c => c.id !== contractId));
  const handleDeletePurchaseContracts = (contractIds: number[]) => setPurchaseContracts(purchaseContracts.filter(c => !contractIds.includes(c.id)));
  
  const handleSaveSupportContract = (contractData: SupportContract | Omit<SupportContract, 'id'>) => {
    if ('id' in contractData) setSupportContracts(supportContracts.map(c => c.id === contractData.id ? { ...c, ...contractData } : c));
    else setSupportContracts([...supportContracts, { ...contractData, id: Date.now() } as SupportContract]);
  };

  const handleDeleteSupportContract = (contractId: number) => setSupportContracts(supportContracts.filter(c => c.id !== contractId));
  const handleDeleteSupportContracts = (contractIds: number[]) => setSupportContracts(supportContracts.filter(c => !contractIds.includes(c.id)));
  
  const handleSaveTicket = (ticketData: Ticket | Omit<Ticket, 'id'>, isFromReferral: boolean) => {
      const now = new Date();
      if ('id' in ticketData) {
          // Editing existing ticket - UPDATE editableUntil on every save
          const updatedTicket = { 
              ...ticketData,
              editableUntil: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
          } as Ticket;
          if (isFromReferral) {
              setReferrals(prev => prev.map(r => r.ticket.id === updatedTicket.id ? { ...r, ticket: updatedTicket } : r));
          } else {
              setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
          }
      } else {
          // Creating new ticket
          const lastTicketNum = tickets.length > 0 ? Math.max(...tickets.map(t => parseInt(t.ticketNumber.split('-')[2], 10) || 0)) : 100;
          const newTicketNum = `T-${jalaali.toJalaali(now).jy}-${String(lastTicketNum + 1).padStart(3, '0')}`;
          const newTicket = {
              ...ticketData,
              id: Date.now(),
              ticketNumber: newTicketNum,
              creationDateTime: formatJalaaliDateTime(now),
              lastUpdateDate: formatJalaaliDateTime(now),
              status: 'انجام نشده',
              editableUntil: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
              totalWorkDuration: 0,
              updates: [],
          } as Ticket;
          setTickets(prev => [...prev, newTicket]);
      }
  };

  const handleToggleWork = (itemId: number, isFromReferral: boolean) => {
      const updateTicketWork = (ticket: Ticket): Ticket => {
          // If the work is running, we stop it and mark it as finished.
          if (ticket.status === 'در حال پیگیری' && ticket.workSessionStartedAt) {
              const sessionStart = new Date(ticket.workSessionStartedAt);
              const durationSeconds = (new Date().getTime() - sessionStart.getTime()) / 1000;
              return { 
                  ...ticket, 
                  status: 'اتمام یافته', // Change status to 'Finished'
                  workSessionStartedAt: undefined, 
                  totalWorkDuration: ticket.totalWorkDuration + durationSeconds 
              };
          } 
          // If the work is not started, we start it.
          else if (ticket.status === 'انجام نشده') {
              return { 
                  ...ticket, 
                  status: 'در حال پیگیری', 
                  workSessionStartedAt: new Date().toISOString() 
              };
          }
          // For any other status, do nothing.
          return ticket;
      };

      if (isFromReferral) {
          setReferrals(prev => prev.map(r => r.ticket.id === itemId ? { ...r, ticket: updateTicketWork(r.ticket) } : r));
      } else {
          setTickets(prev => prev.map(t => t.id === itemId ? updateTicketWork(t) : t));
      }
  };
  
  const handleReferTicket = (itemId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => {
      let ticketToRefer: Ticket;
      
      if (isFromReferral) {
          const referral = referrals.find(r => r.ticket.id === itemId);
          if (!referral) return;
          ticketToRefer = referral.ticket;
          setReferrals(prev => prev.filter(r => r.ticket.id !== itemId));
      } else {
          const ticket = tickets.find(t => t.id === itemId);
          if (!ticket) return;
          ticketToRefer = ticket;
          setTickets(prev => prev.map(t => t.id === itemId ? { ...t, status: 'ارجاع شده' } : t));
      }
      
      const now = new Date();
      const newReferralTicket: Ticket = {
          ...ticketToRefer,
          id: Date.now(),
          assignedTo: referredToUsername,
          lastUpdateDate: formatJalaaliDateTime(now),
          // status, workSessionStartedAt, and totalWorkDuration are preserved from ticketToRefer
          editableUntil: ticketToRefer.editableUntil,
          updates: [
            ...ticketToRefer.updates,
            {
              id: Date.now() + 1, // Ensure unique ID
              author: referredBy.username,
              date: formatJalaaliDateTime(now),
              description: `ارجاع از ${referredBy.username} به ${referredToUsername}`,
              timeSpent: 0
            }
          ],
      };
      
      const newReferral: Referral = {
          id: newReferralTicket.id,
          ticket: newReferralTicket,
          referredBy: referredBy.username,
          referredTo: referredToUsername,
          referralDate: now.toISOString(),
      };
      setReferrals(prev => [...prev, newReferral]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const landingPage = user.accessibleMenus.includes('dashboard') ? 'dashboard' : user.accessibleMenus[0] || 'no_access';
    setActivePage(landingPage);
  };
  
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) return <LoginPage onLogin={handleLogin} users={users} />;
  
  const hasAccess = (pageId: string) => currentUser.accessibleMenus.includes(pageId as any);

  const renderActivePage = () => {
    if (!hasAccess(activePage) && activePage !== 'no_access') return <PlaceholderPage title="دسترسی غیر مجاز" />;
    
    switch (activePage) {
      case 'dashboard': return <DashboardPage users={users} customers={customers} purchaseContracts={purchaseContracts} supportContracts={supportContracts} tickets={tickets} referrals={referrals} />;
      case 'users': return <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} onDeleteMany={handleDeleteUsers} />;
      case 'customers': return <CustomerList customers={customers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} onDeleteMany={handleDeleteCustomers} />;
      case 'contracts': return (
        <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
           <main className="max-w-7xl mx-auto">
            <div className="mb-8"><PurchaseContracts contracts={purchaseContracts} users={users} customers={customers} onSave={handleSavePurchaseContract} onDelete={handleDeletePurchaseContract} onDeleteMany={handleDeletePurchaseContracts} /></div>
            <div className="mt-12"><SupportContracts contracts={supportContracts} customers={customers} onSave={handleSaveSupportContract} onDelete={handleDeleteSupportContract} onDeleteMany={handleDeleteSupportContracts} /></div>
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