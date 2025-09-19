import React from 'react';
import { SupportContract, SupportContractStatus, Customer } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { getCalculatedStatus, toPersianDigits } from '../utils/dateFormatter';

interface SupportContractTableProps {
  contracts: SupportContract[];
  customers: Customer[];
  onEdit: (contract: SupportContract) => void;
  onDelete: (contractId: number) => void;
}

const statusStyles: { [key in SupportContractStatus]: string } = {
  'فعال': 'bg-green-100 text-green-700',
  'در انتظار تایید': 'bg-yellow-100 text-yellow-700',
  'منقضی شده': 'bg-slate-100 text-slate-600',
  'لغو شده': 'bg-red-100 text-red-700',
};

const SupportContractTable: React.FC<SupportContractTableProps> = ({ contracts, customers, onEdit, onDelete }) => {
  
  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return 'نامشخص';
    return customers.find(c => c.id === customerId)?.companyName || 'یافت نشد';
  };

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
        <h3 className="text-xl font-semibold text-slate-700">هیچ قراردادی یافت نشد</h3>
        <p className="text-gray-500 mt-2">یک قرارداد جدید از طریق دکمه "قرارداد جدید" اضافه کنید.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Mobile & Tablet Card View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-px bg-gray-200">
        {contracts.map(contract => {
            const displayStatus = getCalculatedStatus(contract.endDate, contract.status);
            return (
              <div key={contract.id} className="bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between">
                      <div>
                          <p className="font-bold text-slate-800">{getCustomerName(contract.customerId)}</p>
                          <p className="text-sm text-gray-500">پایان پشتیبانی: {toPersianDigits(contract.endDate)}</p>
                      </div>
                       <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusStyles[displayStatus]}`}>
                          {displayStatus}
                      </span>
                  </div>
                  <div className="flex items-center justify-end pt-2 border-t mt-2">
                      <div className="flex items-center gap-2">
                          <button onClick={() => onEdit(contract)} className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors">
                              <EditIcon />
                          </button>
                          <button onClick={() => onDelete(contract.id)} className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                              <TrashIcon />
                          </button>
                      </div>
                  </div>
              </div>
            )
        })}
        </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-600">
          <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4">نام مشتری</th>
              <th scope="col" className="px-6 py-4">وضعیت قرارداد</th>
              <th scope="col" className="px-6 py-4">تاریخ پایان پشتیبانی</th>
              <th scope="col" className="px-6 py-4 text-left">اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(contract => {
              const displayStatus = getCalculatedStatus(contract.endDate, contract.status);
              return (
              <tr key={contract.id} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors duration-200">
                <td className="px-6 py-4 font-medium text-slate-800">{getCustomerName(contract.customerId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[displayStatus]}`}>
                    {displayStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">{toPersianDigits(contract.endDate)}</td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(contract)} className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors">
                      <EditIcon />
                    </button>
                    <button onClick={() => onDelete(contract.id)} className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportContractTable;
