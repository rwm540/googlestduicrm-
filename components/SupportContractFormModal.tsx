import React, { useState, useEffect } from 'react';
import { SupportContract, Customer, SupportContractDuration, SupportContractType, SupportContractLevel, SupportContractStatus, SoftwareType } from '../types';
import Modal from './Modal';
import DatePicker from './DatePicker';
import { getPurchaseContractStatusByDate } from '../utils/dateFormatter';

declare const jalaali: any;

interface SupportContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: SupportContract | Omit<SupportContract, 'id'>) => void;
  contract: SupportContract | null;
  customers: Customer[];
}

const getInitialState = (): Omit<SupportContract, 'id'> => {
  const today = new Date();
  const jalaaliDate = jalaali.toJalaali(today);
  const formattedDate = `${jalaaliDate.jy}/${String(jalaaliDate.jm).padStart(2, '0')}/${String(jalaaliDate.jd).padStart(2, '0')}`;
  
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const jalaaliNextYear = jalaali.toJalaali(nextYear);
  const formattedNextYear = `${jalaaliNextYear.jy}/${String(jalaaliNextYear.jm).padStart(2, '0')}/${String(jalaaliNextYear.jd).padStart(2, '0')}`;

  return {
    customerId: null,
    startDate: formattedDate,
    endDate: formattedNextYear,
    duration: 'یکساله',
    supportType: [],
    level: 'برنزه',
    status: 'فعال', // Status will be derived from dates on save
    organizationName: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    economicCode: '',
    fullAddress: '',
    softwareName: '',
    softwareVersion: '',
    initialInstallDate: formattedDate,
    installType: '',
    userCount: '1',
    softwareType: 'عمومی',
  }
};

const inputClass = "block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const statusStyles: { [key in SupportContractStatus]: string } = {
  'فعال': 'bg-green-100 text-green-700',
  'در انتظار تایید': 'bg-yellow-100 text-yellow-700',
  'منقضی شده': 'bg-slate-100 text-slate-600',
  'لغو شده': 'bg-red-100 text-red-700',
};

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-md font-semibold text-slate-700 border-b pb-2 mb-4 col-span-full">{title}</h4>
);


const SupportContractFormModal: React.FC<SupportContractFormModalProps> = ({ isOpen, onClose, onSave, contract, customers }) => {
  const [formData, setFormData] = useState<Omit<SupportContract, 'id'>>(getInitialState());

  useEffect(() => {
    if (isOpen) {
        if (contract) {
            setFormData(contract);
        } else {
            setFormData(getInitialState());
        }
    } else {
        setTimeout(() => setFormData(getInitialState()), 300);
    }
  }, [contract, isOpen]);
  
  const handleCustomerChange = (customerId: number) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if(selectedCustomer) {
        setFormData(prev => ({
            ...prev,
            customerId: selectedCustomer.id,
            organizationName: selectedCustomer.companyName,
            contactPerson: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
            contactNumber: selectedCustomer.mobileNumbers[0] || selectedCustomer.phone[0] || '',
            contactEmail: selectedCustomer.emails[0] || '',
            economicCode: selectedCustomer.taxCode,
            fullAddress: selectedCustomer.address,
            softwareType: selectedCustomer.softwareType,
        }));
    } else {
        // Reset customer-related fields if "select" is chosen
        setFormData(prev => ({
            ...prev,
            ...getInitialState(),
            // Keep contract-specific details if they were already filled
            startDate: prev.startDate,
            endDate: prev.endDate,
            duration: prev.duration,
            supportType: prev.supportType,
            level: prev.level,
            status: prev.status,
        }))
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (field: keyof Omit<SupportContract, 'id'>, date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const type = value as SupportContractType;
    setFormData(prev => ({
        ...prev,
        supportType: checked
            ? [...prev.supportType, type]
            : prev.supportType.filter(st => st !== type)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStatus = getPurchaseContractStatusByDate(formData.startDate, formData.endDate);
    onSave({ ...formData, status: finalStatus, ...(contract && { id: contract.id }) });
    onClose();
  };
  
  const durationOptions: SupportContractDuration[] = ['شش ماهه', 'یکساله', 'موردی'];
  const typeOptions: SupportContractType[] = ['تلفنی', 'ریموت', 'حضوری'];
  const levelOptions: SupportContractLevel[] = ['طلایی', 'نقره ای', 'برنزه'];
  
  const displayStatus = getPurchaseContractStatusByDate(formData.startDate, formData.endDate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-4">
          {contract ? 'ویرایش قرارداد پشتیبانی' : 'افزودن قرارداد پشتیبانی'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3">
                    <FormField label="مشتری (برای تکمیل خودکار)">
                        <select
                            value={formData.customerId || ''}
                            onChange={(e) => handleCustomerChange(Number(e.target.value))}
                            className={inputClass}
                        >
                            <option value="">انتخاب کنید...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.companyName} ({c.firstName} {c.lastName})
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>
                
                <SectionHeader title="اطلاعات پایه قرارداد" />
                <FormField label="تاریخ شروع قرارداد"><DatePicker value={formData.startDate} onChange={d => handleDateChange('startDate', d)} /></FormField>
                <FormField label="تاریخ پایان پشتیبانی"><DatePicker value={formData.endDate} onChange={d => handleDateChange('endDate', d)} /></FormField>
                <FormField label="مدت قرارداد">
                    <select name="duration" value={formData.duration} onChange={handleChange} className={inputClass}>
                        {durationOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
                <FormField label="سطح بندی قرارداد">
                    <select name="level" value={formData.level} onChange={handleChange} className={inputClass}>
                        {levelOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
                <FormField label="وضعیت قرارداد">
                    <div className="flex items-center gap-4 mt-1">
                        <span className={`px-3 py-2 text-sm font-bold rounded-full ${statusStyles[displayStatus]}`}>
                            {displayStatus}
                        </span>
                        <p className="text-sm text-gray-500">(محاسبه خودکار بر اساس تاریخ)</p>
                    </div>
                </FormField>
                <FormField label="نوع پشتیبانی">
                     <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        {typeOptions.map(m => (
                            <div key={m} className="flex items-center"><input id={`type-${m}`} type="checkbox" value={m} checked={formData.supportType.includes(m)} onChange={handleCheckboxChange} className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500" /><label htmlFor={`type-${m}`} className="mr-2 text-sm text-gray-900">{m}</label></div>
                        ))}
                    </div>
                </FormField>
                
                <SectionHeader title="اطلاعات مشتری" />
                <FormField label="نام سازمان و شرکت"><input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} className={inputClass} required /></FormField>
                <FormField label="کد مشتری (شناسه اقتصادی)"><input type="text" name="economicCode" value={formData.economicCode} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="نام شخص رابط"><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="شماره تماس"><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="ایمیل"><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={inputClass} /></FormField>
                <div className="sm:col-span-2 lg:col-span-3"><FormField label="آدرس کامل"><input type="text" name="fullAddress" value={formData.fullAddress} onChange={handleChange} className={inputClass} /></FormField></div>
                
                <SectionHeader title="مشخصات نرم افزار تحت پشتیبانی" />
                <FormField label="نام نرم افزار/سامانه"><input type="text" name="softwareName" value={formData.softwareName} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="نسخه نرم افزار"><input type="text" name="softwareVersion" value={formData.softwareVersion} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="تاریخ نصب اولیه"><DatePicker value={formData.initialInstallDate} onChange={d => handleDateChange('initialInstallDate', d)} /></FormField>
                <FormField label="نوع نصب"><input type="text" name="installType" value={formData.installType} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="تعداد کاربران/ایستگاه کاری"><input type="text" name="userCount" value={formData.userCount} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="نوع نرم افزار (از تعریف مشتری)">
                    <input type="text" name="softwareType" value={formData.softwareType} readOnly className={`${inputClass} bg-slate-100`} />
                </FormField>
            </div>
            
            {/* Buttons */}
            <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                  انصراف
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white">
                  ذخیره قرارداد
                </button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default SupportContractFormModal;