import React, { useState, useMemo } from 'react';
import { Ticket, Customer, User, Referral } from '../types';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import TicketBoard from '../components/TicketBoard';
import ReferTicketModal from '../components/ReferTicketModal';
import { parseJalaaliDateTime } from '../utils/dateFormatter';

interface TicketsProps {
  tickets: Ticket[];
  referrals: Referral[];
  customers: Customer[];
  users: User[];
  onSave: (ticket: Ticket | Omit<Ticket, 'id'>, isFromReferral: boolean) => void;
  onReferTicket: (ticketId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => void;
  onToggleWork: (ticketId: number, isFromReferral: boolean) => void;
  currentUser: User;
}

const Tickets: React.FC<TicketsProps> = ({ tickets, referrals, customers, users, onSave, onReferTicket, onToggleWork, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referringTicket, setReferringTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleOpenModal = (ticket: Ticket | null = null) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingTicket(null), 300);
  };
  
  const handleOpenReferModal = (ticket: Ticket) => {
    setReferringTicket(ticket);
    setIsReferModalOpen(true);
  };

  const handleCloseReferModal = () => {
    setIsReferModalOpen(false);
    setTimeout(() => setReferringTicket(null), 300);
  };

  const handleSaveTicket = (ticketData: Ticket | Omit<Ticket, 'id'>) => {
    onSave(ticketData, false);
    handleCloseModal();
  };

  const handleReferTicketSubmit = (newAssigneeUsername: string) => {
    if (!referringTicket) return;
    onReferTicket(referringTicket.id, false, currentUser, newAssigneeUsername);
    handleCloseReferModal();
  };

  const filteredTickets = useMemo(() => {
    let sourceTickets: Ticket[] = [];

    if (showCompleted) {
        const allCompletedTickets = [
            ...tickets.filter(t => t.status === 'اتمام یافته'),
            ...referrals.map(r => r.ticket).filter(t => t.status === 'اتمام یافته')
        ];

        if (currentUser.role === 'مدیر') {
            sourceTickets = allCompletedTickets;
        } else {
            sourceTickets = allCompletedTickets.filter(t => t.assignedTo === currentUser.username);
        }
    } else {
        // Active tickets only come from the main `tickets` array. Referrals are handled on their own page.
        sourceTickets = tickets.filter(ticket => ticket.status !== 'ارجاع شده' && ticket.status !== 'اتمام یافته');
    }

    return sourceTickets
        .filter(ticket => {
            const search = searchTerm.toLowerCase();
            if (!search) return true;
            
            const customer = customers.find(c => c.id === ticket.customerId);
            return (
                ticket.title.toLowerCase().includes(search) ||
                ticket.ticketNumber.toLowerCase().includes(search) ||
                (customer && customer.companyName.toLowerCase().includes(search))
            );
        })
        .sort((a, b) => {
            const dateA = parseJalaaliDateTime(a.creationDateTime)?.getTime() || 0;
            const dateB = parseJalaaliDateTime(b.creationDateTime)?.getTime() || 0;
            return dateB - dateA;
        });
  }, [tickets, referrals, searchTerm, customers, showCompleted, currentUser]);


  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {showCompleted ? 'تیکت‌های اتمام یافته' : 'مدیریت تیکت‌ها'}
            </h1>
            <p className="text-gray-500 mt-1">
              {showCompleted
                ? 'تیکت‌های تکمیل شده در این بخش آرشیو می‌شوند.'
                : 'تیکت های پشتیبانی را پیگیری و مدیریت کنید.'
              }
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-white text-cyan-600 border border-cyan-600 font-semibold rounded-lg hover:bg-cyan-50 transition-colors"
            >
              {showCompleted ? 'نمایش تیکت‌های جاری' : 'نمایش تیکت‌های اتمام یافته'}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              <PlusIcon />
              <span>تیکت جدید</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="جستجوی تیکت (شماره، عنوان، مشتری)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
          </div>
          {viewMode === 'list' ? (
            <TicketTable
              tickets={filteredTickets}
              customers={customers}
              users={users}
              onEdit={handleOpenModal}
              onRefer={handleOpenReferModal}
              onToggleWork={(ticketId) => onToggleWork(ticketId, false)}
              isReferralTable={false}
              emptyMessage={showCompleted ? 'هیچ تیکت اتمام یافته‌ای برای نمایش وجود ندارد.' : 'هیچ تیکت فعالی یافت نشد. برای شروع یک تیکت جدید ایجاد کنید.'}
            />
          ) : (
            <TicketBoard tickets={filteredTickets} />
          )}
        </div>

        <TicketFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTicket}
          ticket={editingTicket}
          customers={customers}
          users={users}
          currentUser={currentUser}
        />
        <ReferTicketModal
          isOpen={isReferModalOpen}
          onClose={handleCloseReferModal}
          onRefer={handleReferTicketSubmit}
          ticket={referringTicket}
          users={users}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
};

export default Tickets;