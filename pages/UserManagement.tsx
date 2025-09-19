

import React, { useState } from 'react';
import { User } from '../types';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Pagination from '../components/Pagination';

interface UserManagementProps {
  users: User[];
  onSave: (user: User | Omit<User, 'id'>) => void;
  onDelete: (userId: number) => void;
}

const ITEMS_PER_PAGE = 10;

const UserManagement: React.FC<UserManagementProps> = ({ users, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingUser(null), 300);
  };

  const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
    onSave(userData);
    handleCloseModal();
  };
  
  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">مدیریت کاربران CRM</h1>
            <p className="text-gray-500 mt-1">کاربران سیستم CRM خود را ایجاد و مدیریت کنید.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <PlusIcon />
            <span>کاربر جدید</span>
          </button>
        </div>

        {/* User Table Section */}
        <div className="mt-8">
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="جستجوی کاربر..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
            </div>
            <UserTable users={paginatedUsers} onEdit={handleOpenModal} onDelete={onDelete} />
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredUsers.length}
            />
        </div>

        {/* Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          user={editingUser}
          users={users}
        />
      </main>
    </div>
  );
};

export default UserManagement;
