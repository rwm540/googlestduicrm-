import React, { useState } from 'react';
import { PurchaseContract, User, Customer } from '../types';
import PurchaseContractTable from '../components/PurchaseContractTable';
import PurchaseContractFormModal from '../components/PurchaseContractFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';

interface PurchaseContractsProps {
  contracts: PurchaseContract[];
  users: User[];
  customers: Customer[];
  onSave: (contract: PurchaseContract | Omit<PurchaseContract, 'id'>) => void;
  onDelete: (contractId: number) => void;
}

const PurchaseContracts: React.FC<PurchaseContractsProps> = ({ contracts, users, customers, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<PurchaseContract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (contract: PurchaseContract | null = null) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingContract(null), 300);
  };

  const handleSaveContract = (contractData: PurchaseContract | Omit<PurchaseContract, 'id'>) => {
    onSave(contractData);
    handleCloseModal();
  };
  
  const filteredContracts = contracts.filter(contract =>
    contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">قرارداد های فروش</h1>
            <p className="text-gray-500 mt-1">قراردادهای فروش به مشتریان را مدیریت کنید.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <PlusIcon />
            <span>قرارداد جدید</span>
          </button>
        </div>

        <div className="mt-8">
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="جستجوی قرارداد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
            </div>
            <PurchaseContractTable contracts={filteredContracts} onEdit={handleOpenModal} onDelete={onDelete} />
        </div>

        <PurchaseContractFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveContract}
          contract={editingContract}
          users={users}
          contracts={contracts}
          customers={customers}
        />
      </main>
    </div>
  );
};

export default PurchaseContracts;