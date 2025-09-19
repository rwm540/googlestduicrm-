
import React, { useState } from 'react';
import { Customer } from '../types';
import CustomerTable from '../components/CustomerTable';
import CustomerFormModal from '../components/CustomerFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';

interface CustomerListProps {
  customers: Customer[];
  onSave: (customer: Customer | Omit<Customer, 'id'>) => void;
  onDelete: (customerId: number) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingCustomer(null), 300);
  };

  const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
    onSave(customerData);
    handleCloseModal();
  };

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(search) ||
        customer.companyName.toLowerCase().includes(search) ||
        customer.nationalId.toLowerCase().includes(search) ||
        customer.emails.some(e => e.toLowerCase().includes(search)) ||
        customer.mobileNumbers.some(m => m.toLowerCase().includes(search))
    )
  });


  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">مدیریت مشتریان</h1>
            <p className="text-gray-500 mt-1">مشتریان خود را در این بخش مدیریت کنید.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <PlusIcon />
            <span>مشتری جدید</span>
          </button>
        </div>

        {/* Customer Table Section */}
        <div className="mt-8">
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="جستجوی مشتری..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
            </div>
            <CustomerTable customers={filteredCustomers} onEdit={handleOpenModal} onDelete={onDelete} />
        </div>

        {/* Modal */}
        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCustomer}
          customer={editingCustomer}
          customers={customers}
        />
      </main>
    </div>
  );
};

export default CustomerList;