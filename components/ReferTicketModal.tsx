import React, { useState, useEffect } from 'react';
import { Ticket, User } from '../types';
import Modal from './Modal';

interface ReferTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefer: (newAssigneeUsername: string) => void;
  ticket: Ticket | null;
  users: User[];
  currentUser: User;
}

const ReferTicketModal: React.FC<ReferTicketModalProps> = ({ isOpen, onClose, onRefer, ticket, users, currentUser }) => {
  const [newAssignee, setNewAssignee] = useState('');

  useEffect(() => {
    if (isOpen) {
      const isCurrentUserSuperAdmin = currentUser.role === 'مدیر' && currentUser.accessibleMenus.includes('users');
      
      const availableUsers = users.filter(user => {
        if (user.username === ticket?.assignedTo) return false;
        if (isCurrentUserSuperAdmin) return true;
        return user.role !== 'مدیر';
      });

      if (availableUsers.length > 0) {
        setNewAssignee(availableUsers[0].username);
      } else {
        setNewAssignee('');
      }
    } else {
      setNewAssignee(''); // Reset on close
    }
  }, [isOpen, ticket, users, currentUser]);

  if (!ticket) return null;
  
  const isCurrentUserSuperAdmin = currentUser.role === 'مدیر' && currentUser.accessibleMenus.includes('users');
  const availableUsers = users.filter(user => {
    if (user.username === ticket.assignedTo) return false;
    if (isCurrentUserSuperAdmin) return true;
    return user.role !== 'مدیر';
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
  
  const currentAssigneeName = getAssigneeName(ticket.assignedTo);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-2">
          ارجاع تیکت: <span className="font-mono text-base">#{ticket.ticketNumber}</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">"{ticket.title}"</p>

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
              <option value="" disabled>یک کاربر را انتخاب کنید</option>
              {availableUsers.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.firstName} {user.lastName}
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