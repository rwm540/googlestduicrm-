import React, { useState } from 'react';
import { PurchaseContract, User, Customer } from '../types';
import PurchaseContractTable from '../components/PurchaseContractTable';
import PurchaseContractFormModal from '../components/PurchaseContractFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Pagination from '../components/Pagination';
import { toPersianDigits } from '../utils/dateFormatter';
import { TrashIcon } from '../components/icons/TrashIcon';

interface PurchaseContractsProps {
  contracts: PurchaseContract[];
  users: User[];
  customers: Customer[];
  onSave: (contract: PurchaseContract | Omit<PurchaseContract, 'id'>) => void;
  onDelete: (contractId: number) => void;
  onDeleteMany: (contractIds: number[]) => void;
}

const ITEMS_PER_PAGE = 10;

const PurchaseContracts: React.FC<PurchaseContractsProps> = ({ contracts, users, customers, onSave, onDelete, onDeleteMany }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<PurchaseContract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredContracts = contracts.filter(contract =>
    contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const paginatedIds = paginatedContracts.map(c => c.id);
    const allOnPageSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedIds.includes(id));

    if (allOnPageSelected) {
      setSelectedIds(prev => prev.filter(id => !paginatedIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...paginatedIds])]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`آیا از حذف ${toPersianDigits(selectedIds.length)} قرارداد انتخاب شده اطمینان دارید؟`)) {
      onDeleteMany(selectedIds);
      setSelectedIds([]);
    }
  };

  const allOnPageSelected = paginatedContracts.length > 0 && paginatedContracts.every(c => selectedIds.includes(c.id));

  return (
    <>
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
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
               <input
                  type="text"
                  placeholder="جستجوی قرارداد..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                >
                  <TrashIcon />
                  <span>حذف ({toPersianDigits(selectedIds.length)}) مورد</span>
                </button>
              )}
          </div>
          <div className="flex items-center lg:hidden mb-4">
              <input 
                  id="checkbox-all-mobile-purchase" 
                  type="checkbox"
                  onChange={handleToggleSelectAll}
                  checked={allOnPageSelected}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" 
              />
              <label htmlFor="checkbox-all-mobile-purchase" className="mr-2 text-sm font-medium text-gray-700">انتخاب همه در این صفحه</label>
          </div>
          <PurchaseContractTable 
            contracts={paginatedContracts} 
            onEdit={handleOpenModal} 
            onDelete={onDelete} 
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
          <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredContracts.length}
          />
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
    </>
  );
};

export default PurchaseContracts;