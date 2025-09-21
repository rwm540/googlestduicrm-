

import React, { useState, useEffect } from 'react';
import { Ticket, User, UserRole } from '../types';
import Modal from './Modal';
import { toPersianDigits } from '../utils/dateFormatter';

interface ReferTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefer: (newAssigneeUsername: string) => void;
  tickets: Ticket[] | null;
  users: User[];
  currentUser: User;
}

const isLead = (role: UserRole) => role.startsWith('مسئول');
const isSpecialist = (role: UserRole) => role.startsWith('کارشناس');

const getDepartment = (role: UserRole): string => {
    if (role.includes('پشتیبان')) return 'پشتیبان';
    if (role.includes('برنامه نویس')) return 'برنامه نویس';
    if (role.includes('فروش')) return 'فروش';
    return '';
};

const ReferTicketModal: React.FC<ReferTicketModalProps> = ({ isOpen, onClose, onRefer, tickets, users, currentUser }) => {
  const [newAssignee, setNewAssignee] = useState('');

  useEffect(() => {
    if (!isOpen || !tickets || tickets.length === 0) {
      setNewAssignee('');
      return;
    }

    const currentAssignees = new Set(tickets.map(t => t.assignedTo));
    
    const availableUsers = users.filter(user => {
        if (currentAssignees.has(user.username)) return false; // Exclude current assignees
        
        if (currentUser.role === 'مدیر') {
            return isLead(user.role); // Admin refers to Leads
        }
        if (isLead(currentUser.role)) {
            const currentUserDept = getDepartment(currentUser.role);
            const targetUserDept = getDepartment(user.role);
            // Lead can refer to Admin, other Leads, or Specialists in their own department
            return user.role === 'مدیر' || isLead(user.role) || (isSpecialist(user.role) && currentUserDept === targetUserDept);
        }
        return false; // Specialists cannot refer
      });

    if (availableUsers.length > 0) {
        setNewAssignee(availableUsers[0].username);
    } else {
        setNewAssignee('');
    }

  }, [isOpen, tickets, users, currentUser]);

  if (!tickets || tickets.length === 0) return null;

  const isGroupRefer = tickets.length > 1;
  const firstTicket = tickets[0];
  
  const currentAssignees = new Set(tickets.map(t => t.assignedTo));

  const availableUsers = users.filter(user => {
    if (currentAssignees.has(user.username)) return false;
    if (currentUser.role === 'مدیر') {
        return isLead(user.role);
    }
    if (isLead(currentUser.role)) {
        const currentUserDept = getDepartment(currentUser.role);
        const targetUserDept = getDepartment(user.role);
        return user.role === 'مدیر' || isLead(user.role) || (isSpecialist(user.role) && currentUserDept === targetUserDept);
    }
    return false;
  });

  const handleRefer = () => {
    if (newAssignee) {
      onRefer(newAssignee);
    }
  };

  const getAssigneeName = (username: string) => {
    if (!username) return 'هیچکس';
    const user = users.find(u => u.username === username);
    return user ? `${user.firstName} ${user.lastName}` : username;
  };
  
  const currentAssigneeName = isGroupRefer 
    ? 'چند کاربر' 
    : getAssigneeName(firstTicket.assignedTo);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-2">
          {isGroupRefer ? `ارجاع ${toPersianDigits(tickets.length)} تیکت` : `ارجاع تیکت: #${toPersianDigits(firstTicket.ticketNumber)}`}
        </h3>
        {!isGroupRefer && <p className="text-sm text-gray-500 mb-4">"{firstTicket.title}"</p>}

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">مسئول فعلی:</p>
            <p className="text-slate-800 font-semibold">{currentAssigneeName}</p>
          </div>
          <div>
            <label htmlFor="newAssignee" className="block text-sm font-medium text-gray-700 mb-1">
              ارجاع به:
            </label>
            <select
              id="newAssignee"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
              {availableUsers.length > 0 ? (
                 <option value="" disabled>یک کاربر را انتخاب کنید</option>
              ) : (
                 <option value="" disabled>کاربر دیگری برای ارجاع یافت نشد</option>
              )}
              {availableUsers.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleRefer}
            disabled={!newAssignee}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ارجاع
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReferTicketModal;
