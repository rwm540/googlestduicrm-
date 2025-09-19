import React from 'react';
import { Customer, CustomerLevel } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import Avatar from './Avatar';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

const levelStyles: { [key in CustomerLevel]: string } = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-red-100 text-red-700',
};

const toPersianDigits = (n: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};


const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onDelete, selectedIds, onToggleSelect, onToggleSelectAll }) => {
  const allOnPageSelected = customers.length > 0 && customers.every(c => selectedIds.includes(c.id));

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
        <h3 className="text-xl font-semibold text-slate-700">هیچ مشتری یافت نشد</h3>
        <p className="text-gray-500 mt-2">برای شروع، یک مشتری جدید از طریق دکمه "مشتری جدید" اضافه کنید.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Mobile & Tablet Card View (for screens smaller than lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-px bg-gray-200">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white p-4 space-y-3 relative">
            <div className="absolute top-4 left-4 z-10">
              <input 
                type="checkbox"
                className="h-5 w-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                checked={selectedIds.includes(customer.id)}
                onChange={() => onToggleSelect(customer.id)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar name={`${customer.firstName} ${customer.lastName}`} />
                    <div>
                        <p className="font-bold text-slate-800">{customer.firstName} {customer.lastName}</p>
                        <p className="text-sm text-gray-500">{customer.companyName}</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${levelStyles[customer.level]}`}>
                    {customer.level}
                </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1 pt-2 border-t border-gray-100">
              <p>موبایل: {toPersianDigits(customer.mobileNumbers[0] || 'N/A')}</p>
              <p>کد ملی: {toPersianDigits(customer.nationalId)}</p>
              <p>پایان پشتیبانی: {toPersianDigits(customer.supportEndDate)}</p>
            </div>
            <div className="flex items-center justify-end pt-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(customer)}
                        className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors"
                        aria-label={`ویرایش ${customer.firstName}`}
                    >
                        <EditIcon />
                    </button>
                    <button
                        onClick={() => onDelete(customer.id)}
                        className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        aria-label={`حذف ${customer.firstName}`}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (for lg screens and up) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-600">
          <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50 tracking-wider">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input id="checkbox-all-customers" type="checkbox"
                    onChange={onToggleSelectAll}
                    checked={allOnPageSelected}
                    className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" />
                  <label htmlFor="checkbox-all-customers" className="sr-only">checkbox</label>
                </div>
              </th>
              <th scope="col" className="px-6 py-4">مشتری</th>
              <th scope="col" className="px-6 py-4">شرکت</th>
              <th scope="col" className="px-6 py-4">موبایل</th>
              <th scope="col" className="px-6 py-4">سطح</th>
              <th scope="col" className="px-6 py-4">پایان پشتیبانی</th>
              <th scope="col" className="px-6 py-4 text-left">اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors duration-200">
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input id={`checkbox-customer-${customer.id}`} type="checkbox"
                      checked={selectedIds.includes(customer.id)}
                      onChange={() => onToggleSelect(customer.id)}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" />
                    <label htmlFor={`checkbox-customer-${customer.id}`} className="sr-only">checkbox</label>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-4">
                     <Avatar name={`${customer.firstName} ${customer.lastName}`} />
                     <div>
                       <div className="font-medium text-slate-800">{customer.firstName} {customer.lastName}</div>
                       <div className="font-mono text-xs text-gray-400">{toPersianDigits(customer.nationalId)}</div>
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{customer.companyName}</td>
                <td className="px-6 py-4 text-gray-500 font-mono">{toPersianDigits(customer.mobileNumbers[0] || '-')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${levelStyles[customer.level]}`}>
                    {customer.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{toPersianDigits(customer.supportEndDate)}</td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors"
                      aria-label={`ویرایش ${customer.companyName}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      aria-label={`حذف ${customer.companyName}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;