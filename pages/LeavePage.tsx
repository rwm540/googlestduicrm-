import React, { useState } from 'react';
import { User, LeaveRequest, LeaveRequestStatus } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import LeaveRequestFormModal from '../components/LeaveRequestFormModal';
import { toPersianDigits } from '../utils/dateFormatter';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';
import { XBadgeIcon } from '../components/icons/XBadgeIcon';

interface LeavePageProps {
  currentUser: User;
  leaveRequests: LeaveRequest[];
  users: User[];
  onSave: (request: LeaveRequest | Omit<LeaveRequest, 'id'>) => void;
  onStatusChange: (requestId: number, newStatus: LeaveRequestStatus) => void;
}

const statusStyles: Record<LeaveRequestStatus, string> = {
    'در انتظار تایید': 'bg-yellow-100 text-yellow-700',
    'تایید شده': 'bg-green-100 text-green-700',
    'رد شده': 'bg-red-100 text-red-700',
};

const LeavePage: React.FC<LeavePageProps> = ({ currentUser, leaveRequests, users, onSave, onStatusChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSaveRequest = (requestData: LeaveRequest | Omit<LeaveRequest, 'id'>) => {
    onSave(requestData);
    setIsModalOpen(false);
  };
  
  // FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type.
  const requestsToShow = currentUser.role === 'مدیر' 
    ? leaveRequests
    : leaveRequests.filter(r => r.userId === currentUser.id);

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'کاربر حذف شده';
  };

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">مدیریت مرخصی ها</h1>
            <p className="text-gray-500 mt-1">درخواست های مرخصی خود را ثبت و پیگیری کنید.</p>
          </div>
          {/* FIX: Changed 'employee' to check for non-admin roles to match the UserRole type. */}
          {currentUser.role !== 'مدیر' && (
             <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
             >
                <PlusIcon />
                <span>درخواست جدید</span>
             </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-600">
              <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50">
                <tr>
                  {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                  {currentUser.role === 'مدیر' && <th scope="col" className="px-6 py-4">کارمند</th>}
                  <th scope="col" className="px-6 py-4">نوع</th>
                  <th scope="col" className="px-6 py-4">بازه زمانی</th>
                  <th scope="col" className="px-6 py-4">دلیل</th>
                  <th scope="col" className="px-6 py-4">وضعیت</th>
                  {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                  {currentUser.role === 'مدیر' && <th scope="col" className="px-6 py-4 text-left">اقدامات</th>}
                </tr>
              </thead>
              <tbody>
                {requestsToShow.map(req => (
                  <tr key={req.id} className="border-b hover:bg-slate-50/50">
                    {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                    {currentUser.role === 'مدیر' && <td className="px-6 py-4 font-medium text-slate-800">{getUserName(req.userId)}</td>}
                    <td className="px-6 py-4">{req.leaveType}</td>
                    <td className="px-6 py-4">
                        {req.leaveType === 'روزانه' 
                            ? `${toPersianDigits(req.startDate)} تا ${toPersianDigits(req.endDate)}`
                            : `${toPersianDigits(req.startDate)} از ${toPersianDigits(req.startTime || '')} تا ${toPersianDigits(req.endTime || '')}`
                        }
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[req.status]}`}>
                            {req.status}
                        </span>
                    </td>
                    {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                    {currentUser.role === 'مدیر' && (
                        <td className="px-6 py-4 text-left">
                            {req.status === 'در انتظار تایید' && (
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onStatusChange(req.id, 'تایید شده')} className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-100 transition-colors" title="تایید">
                                        <CheckBadgeIcon />
                                    </button>
                                     <button onClick={() => onStatusChange(req.id, 'رد شده')} className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" title="رد">
                                        <XBadgeIcon />
                                    </button>
                                </div>
                            )}
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {requestsToShow.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p>هیچ درخواست مرخصی یافت نشد.</p>
                </div>
            )}
          </div>
        </div>

        <LeaveRequestFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveRequest}
            currentUser={currentUser}
        />
      </main>
    </div>
  );
};

export default LeavePage;