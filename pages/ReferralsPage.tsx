import React, { useState, useMemo } from 'react';
import { User, Referral, Customer, Ticket } from '../types';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';
import ReferTicketModal from '../components/ReferTicketModal';

interface ReferralsPageProps {
  referrals: Referral[];
  currentUser: User;
  users: User[];
  customers: Customer[];
  onSave: (ticket: Ticket | Omit<Ticket, 'id'>, isFromReferral: boolean) => void;
  onReferTicket: (ticketId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => void;
  onToggleWork: (ticketId: number, isFromReferral: boolean) => void;
}

const ReferralsPage: React.FC<ReferralsPageProps> = ({ referrals, currentUser, users, customers, onSave, onReferTicket, onToggleWork }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referringTicket, setReferringTicket] = useState<Ticket | null>(null);

  const handleOpenModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenReferModal = (ticket: Ticket) => {
    setReferringTicket(ticket);
    setIsReferModalOpen(true);
  };
  const handleCloseReferModal = () => setIsReferModalOpen(false);

  const handleSaveTicket = (ticketData: Ticket | Omit<Ticket, 'id'>) => {
    onSave(ticketData, true);
    handleCloseModal();
  };

  const handleReferTicketSubmit = (newAssigneeUsername: string) => {
    if (!referringTicket) return;
    onReferTicket(referringTicket.id, true, currentUser, newAssigneeUsername);
    handleCloseReferModal();
  };

  const referralsToShow = useMemo(() => {
    const isSuperAdmin = currentUser.role === 'مدیر' && currentUser.accessibleMenus.includes('users');
    return (isSuperAdmin ? referrals : referrals.filter(r => r.referredTo === currentUser.username))
      .filter(r => r.ticket.status !== 'اتمام یافته') // Filter out completed tickets
      .sort((a, b) => new Date(b.referralDate).getTime() - new Date(a.referralDate).getTime());
  }, [referrals, currentUser]);

  const referredTickets = referralsToShow.map(r => r.ticket);

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">ارجاعات</h1>
          <p className="text-gray-500 mt-1">تیکت های ارجاع داده شده به شما در این بخش قابل مشاهده است.</p>
        </div>

        <TicketTable
          tickets={referredTickets}
          customers={customers}
          users={users}
          onEdit={handleOpenModal}
          onRefer={handleOpenReferModal}
          onToggleWork={(ticketId) => onToggleWork(ticketId, true)}
          isReferralTable={true}
        />

        {isModalOpen && (
          <TicketFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTicket}
            ticket={editingTicket}
            customers={customers}
            users={users}
            currentUser={currentUser}
          />
        )}
        
        {isReferModalOpen && (
          <ReferTicketModal
            isOpen={isReferModalOpen}
            onClose={handleCloseReferModal}
            onRefer={handleReferTicketSubmit}
            ticket={referringTicket}
            users={users}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
};

export default ReferralsPage;