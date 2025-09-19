import React, { useState, useEffect } from 'react';
import { LeaveRequest, User, LeaveType } from '../types';
import Modal from './Modal';
import DatePicker from './DatePicker';
import Alert from './Alert';
import { formatJalaali } from '../utils/dateFormatter';

interface LeaveRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: LeaveRequest | Omit<LeaveRequest, 'id'>) => void;
  currentUser: User;
}

const inputClass = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm";

const getInitialState = (currentUser: User): Omit<LeaveRequest, 'id'> => {
    const todayStr = formatJalaali(new Date());
    return {
        userId: currentUser.id,
        leaveType: 'روزانه',
        startDate: todayStr,
        endDate: todayStr,
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
        status: 'در انتظار تایید',
        requestedAt: new Date().toISOString(),
    };
};

const LeaveRequestFormModal: React.FC<LeaveRequestFormModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState(() => getInitialState(currentUser));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setFormData(getInitialState(currentUser));
            setErrors([]);
        }, 300);
    }
  }, [isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];
    if (!formData.reason.trim()) {
        validationErrors.push('دلیل مرخصی نمی‌تواند خالی باشد.');
    }
    if (formData.leaveType === 'روزانه' && formData.startDate > formData.endDate) {
        validationErrors.push('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
    }
     if (formData.leaveType === 'ساعتی' && formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        validationErrors.push('ساعت پایان نمی‌تواند قبل یا مساوی ساعت شروع باشد.');
    }

    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
    }
    
    onSave(formData);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-4">ثبت درخواست مرخصی</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Alert messages={errors} onClose={() => setErrors([])} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع مرخصی</label>
                    <select name="leaveType" value={formData.leaveType} onChange={handleChange} className={inputClass}>
                        <option value="روزانه">روزانه</option>
                        <option value="ساعتی">ساعتی</option>
                    </select>
                </div>
                {formData.leaveType === 'روزانه' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
                            <DatePicker value={formData.startDate} onChange={date => setFormData(f => ({...f, startDate: date}))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
                            <DatePicker value={formData.endDate} onChange={date => setFormData(f => ({...f, endDate: date}))} />
                        </div>
                    </div>
                ) : (
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
                         <DatePicker value={formData.startDate} onChange={date => setFormData(f => ({...f, startDate: date, endDate: date}))} />
                         <div className="grid grid-cols-2 gap-4 mt-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">از ساعت</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تا ساعت</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputClass} />
                            </div>
                         </div>
                    </div>
                )}
                <div>
                     <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">دلیل مرخصی</label>
                     <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} className={`${inputClass} min-h-[100px]`}></textarea>
                </div>

                 <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">انصراف</button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">ارسال درخواست</button>
                </div>
            </form>
        </div>
    </Modal>
  )
};

export default LeaveRequestFormModal;
