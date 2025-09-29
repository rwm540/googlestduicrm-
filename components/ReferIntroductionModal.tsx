import React, { useState, useEffect, useMemo } from 'react';
import { CustomerIntroduction, User } from '../types';
import Modal from './Modal';
import SearchableSelect from './SearchableSelect';

interface ReferIntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefer: (newAssigneeUsername: string) => void;
  introduction: CustomerIntroduction | null;
  users: User[];
  currentUser: User;
}

const ReferIntroductionModal: React.FC<ReferIntroductionModalProps> = ({ isOpen, onClose, onRefer, introduction, users, currentUser }) => {
  const [newAssignee, setNewAssignee] = useState('');

  const availableUsers = useMemo(() => {
    if (!isOpen || !introduction) return [];

    // Users who can be assigned are those with access to the 'introductions' menu,
    // excluding the current user.
    return users.filter(u =>
      u.accessibleMenus.includes('introductions') && u.username !== currentUser.username
    );
  }, [isOpen, introduction, users, currentUser]);

  useEffect(() => {
    if (isOpen && availableUsers.length > 0) {
      setNewAssignee(introduction?.assignedToUsername || '');
    } else if (!isOpen) {
      setNewAssignee('');
    }
  }, [isOpen, introduction, availableUsers]);

  if (!introduction) return null;

  const handleRefer = () => {
    if (newAssignee) {
      onRefer(newAssignee);
    }
  };
  
  const currentAssignee = users.find(u => u.username === introduction.assignedToUsername);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-2">ارجاع معرفی مشتری</h3>
        <p className="text-sm text-gray-500 mb-4">"{introduction.customerName}"</p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">مسئول فعلی:</p>
            <p className="text-slate-800 font-semibold">
              {currentAssignee ? `${currentAssignee.firstName} ${currentAssignee.lastName}` : 'نامشخص'}
            </p>
          </div>
          <div>
            <label htmlFor="newAssignee" className="block text-sm font-medium text-gray-700 mb-1">
              ارجاع به:
            </label>
            <SearchableSelect 
                options={availableUsers.map(u => ({ value: u.username, label: `${u.firstName} ${u.lastName} (${u.role})` }))}
                value={newAssignee}
                onChange={value => setNewAssignee(String(value))}
                placeholder="انتخاب همکار..."
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
            انصراف
          </button>
          <button type="button" onClick={handleRefer} disabled={!newAssignee || newAssignee === introduction.assignedToUsername} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400">
            ارجاع
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReferIntroductionModal;