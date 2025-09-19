
import React, { useState, useEffect } from 'react';
import { Ticket, Customer, User, TicketStatus, TicketPriority, TicketType, TicketChannel } from '../types';
import Modal from './Modal';
import Alert from './Alert';
import { formatJalaaliDateTime } from '../utils/dateFormatter';
import { FileUploadIcon } from './icons/FileUploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Ticket | Omit<Ticket, 'id'>) => void;
  ticket: Ticket | null;
  customers: Customer[];
  users: User[];
  currentUser: User;
}

// FIX: Add missing ticket types to the options so they appear in the form dropdown.
const ticketTypeOptions: TicketType[] = [
    'نصب', 'اپدیت', 'اموزش', 'طراحی و چاپ', 'تبدیل اطلاعات', 
    'رفع اشکال', 'راه اندازی', 'مشکل برنامه نویسی', 'سایر', 'فراصدر', 'گزارشات', 
    'تنظیمات نرم افزاری', 'مجوزدهی', 'صندوق', 'پوز', 'ترازو', 
    'انبار', 'چک', 'تعریف', 'سیستم', 'مودیان', 'بیمه', 'حقوق دستمزد', 
    'بکاپ', 'اوند', 'کیوسک', 'افتتاحیه', 'اختتامیه', 'تغییر مسیر', 
    'پرینتر', 'کارتخوان', 'sql', 'پنل پیامکی', 'کلاینت', 'صورتحساب', 
    'مغایرت گیری', 'ویندوزی', 'چاپ', 'پایان سال', 'دمو',
    'خطا', 'درخواست', 'مشکل'
];

const getInitialState = (currentUser: User): Omit<Ticket, 'id'> => ({
    ticketNumber: '', // Will be set on save
    title: '',
    description: '',
    customerId: 0,
    creationDateTime: '',
    lastUpdateDate: '',
    status: 'انجام نشده',
    priority: 'متوسط',
    type: 'سایر',
    channel: 'تلفن',
    assignedTo: currentUser.username,
    attachments: [],
    updates: [],
    editableUntil: '',
    totalWorkDuration: 0,
});

const inputClass = "block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const textareaClass = `${inputClass} min-h-[120px]`;

const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSave, ticket, customers, users, currentUser }) => {
  const [formData, setFormData] = useState<Ticket | Omit<Ticket, 'id'>>(() => getInitialState(currentUser));
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const isReadOnly = ticket ? (new Date().getTime() > new Date(ticket.editableUntil).getTime() || ticket.status === 'اتمام یافته') : false;
  const modalTitle = ticket 
    ? (isReadOnly ? `مشاهده تیکت #${ticket.ticketNumber}` : `ویرایش تیکت #${ticket.ticketNumber}`)
    : 'ایجاد تیکت جدید';
  
  useEffect(() => {
    if (isOpen) {
        if (ticket) {
            setFormData(ticket);
        } else {
            setFormData(getInitialState(currentUser));
        }
    } else {
        setTimeout(() => {
            setFormData(getInitialState(currentUser));
            setNewAttachments([]);
            setErrors([]);
        }, 300);
    }
  }, [ticket, isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      
      const files = Array.from(e.target.files);
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      files.forEach(file => {
        if (!file.type.startsWith('image/')) {
          validationErrors.push(`فایل "${file.name}" یک تصویر نیست.`);
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          validationErrors.push(`حجم فایل "${file.name}" بیشتر از ۲ مگابایت است.`);
          return;
        }
        validFiles.push(file);
      });

      if (validationErrors.length > 0) {
        setErrors(prev => [...prev, ...validationErrors]);
      }

      setNewAttachments(prev => [...prev, ...validFiles]);
      e.target.value = ''; // Reset input to allow re-selecting the same file
  };

  const handleRemoveAttachment = (nameToRemove: string) => {
      const isNew = newAttachments.some(f => f.name === nameToRemove);
      if (isNew) {
        setNewAttachments(prev => prev.filter(f => f.name !== nameToRemove));
      } else {
        setFormData(prev => ({
          ...prev,
          attachments: prev.attachments.filter(name => name !== nameToRemove)
        }));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isReadOnly) return;

    const validationErrors: string[] = [];
    if (!formData.title.trim()) validationErrors.push('عنوان تیکت الزامی است.');
    if (!formData.customerId) validationErrors.push('انتخاب مشتری الزامی است.');
    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
    }

    const dataToSave = {
        ...formData,
        lastUpdateDate: formatJalaaliDateTime(new Date()),
        attachments: [...formData.attachments, ...newAttachments.map(f => f.name)],
    };
    onSave(dataToSave);
  };
  
  const allAttachmentNames = [...formData.attachments, ...newAttachments.map(f => f.name)];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
        <div className="p-6 border-b flex-shrink-0">
          <h3 className="text-lg font-medium leading-6 text-cyan-600">{modalTitle}</h3>
           {isReadOnly && <p className="text-sm text-amber-600 mt-1">زمان ویرایش این تیکت به پایان رسیده یا تیکت اتمام یافته است و در حالت فقط-خواندنی نمایش داده می‌شود.</p>}
        </div>

        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
          <Alert messages={errors} onClose={() => setErrors([])} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="title" className={labelClass}>عنوان تیکت</label>
              <select id="title" name="title" value={formData.title} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                <option value="">انتخاب کنید...</option>
                {ticketTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="customerId" className={labelClass}>مشتری</label>
              <select id="customerId" name="customerId" value={formData.customerId} onChange={(e) => setFormData(f => ({...f, customerId: Number(e.target.value)}))} className={inputClass} disabled={isReadOnly}>
                <option value={0} disabled>انتخاب کنید...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="assignedTo" className={labelClass}>کاربر مسئول</label>
              <select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                <option value="">هیچکس</option>
                {users.map(u => <option key={u.id} value={u.username}>{`${u.firstName} ${u.lastName}`}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className={labelClass}>شرح کامل</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={textareaClass} disabled={isReadOnly}></textarea>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className={labelClass}>وضعیت</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                {(['انجام نشده', 'در حال پیگیری', 'اتمام یافته', 'ارجاع شده'] as TicketStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className={labelClass}>اولویت</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                {(['کم', 'متوسط', 'ضطراری'] as TicketPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="type" className={labelClass}>نوع مشکل</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                {ticketTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="channel" className={labelClass}>کانال ورودی</label>
              <select id="channel" name="channel" value={formData.channel} onChange={handleChange} className={inputClass} disabled={isReadOnly}>
                {(['تلفن', 'ایمیل', 'پورتال', 'حضوری'] as TicketChannel[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div>
              <label className={labelClass}>فایل‌های پیوست (تصویر، حداکثر ۲ مگابایت)</label>
              {!isReadOnly && (
                <div className="mt-2 mb-4">
                  <input type="file" id="file-upload" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium">
                    <FileUploadIcon />
                    <span>افزودن فایل</span>
                  </label>
                </div>
              )}
               {allAttachmentNames.length > 0 ? (
                <div className="mt-4 border rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto space-y-2">
                    {allAttachmentNames.map((name, index) => (
                      <div key={`${name}-${index}`} className="flex items-center justify-between p-2 bg-white border rounded-md text-sm">
                        <div className="flex items-center gap-2 text-slate-700 truncate">
                            <PaperClipIcon />
                            <span className="truncate">{name}</span>
                        </div>
                        {!isReadOnly && (
                          <button type="button" onClick={() => handleRemoveAttachment(name)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors">
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
               ) : (
                <div className="mt-2 text-center text-sm text-gray-400 p-4 border border-dashed rounded-md">
                    هیچ فایلی پیوست نشده است.
                </div>
               )}
          </div>

        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end items-center flex-shrink-0">
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
                    {isReadOnly ? 'بستن' : 'انصراف'}
                </button>
                {!isReadOnly && (
                    <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                        {ticket ? 'ذخیره تغییرات' : 'ایجاد تیکت'}
                    </button>
                )}
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default TicketFormModal;
