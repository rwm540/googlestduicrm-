import React, { useState, useEffect } from 'react';
import { PurchaseContract, User, Customer, ContractType, ContractStatus, CustomerType, NetworkSupport, PaymentMethod, PaymentStatus } from '../types';
import Modal from './Modal';
import DatePicker from './DatePicker';
import { FileUploadIcon } from './icons/FileUploadIcon';
import Alert from './Alert';
import { getPurchaseContractStatusByDate, formatCurrency, convertPersianToEnglish } from '../utils/dateFormatter';

declare const jalaali: any;

interface PurchaseContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: PurchaseContract | Omit<PurchaseContract, 'id'>) => void;
  contract: PurchaseContract | null;
  users: User[];
  contracts: PurchaseContract[];
  customers: Customer[];
}

const getInitialState = (): Omit<PurchaseContract, 'id'> => {
  const today = new Date();
  const jalaaliDate = jalaali.toJalaali(today);
  const formattedDate = `${jalaaliDate.jy}/${String(jalaaliDate.jm).padStart(2, '0')}/${String(jalaaliDate.jd).padStart(2, '0')}`;
  
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const jalaaliNextYear = jalaali.toJalaali(nextYear);
  const formattedNextYear = `${jalaaliNextYear.jy}/${String(jalaaliNextYear.jm).padStart(2, '0')}/${String(jalaaliNextYear.jd).padStart(2, '0')}`;


  return {
    contractId: `PC-${jalaaliDate.jy}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    contractStartDate: formattedDate,
    contractEndDate: formattedNextYear,
    contractDate: formattedDate,
    contractType: "خرید دائم",
    contractStatus: "در انتظار تایید",
    softwareVersion: "",
    customerType: "سازمانی",
    customerName: "",
    economicCode: "",
    customerAddress: "",
    customerContact: "",
    customerRepresentative: "",
    vendorName: "شرکت شما",
    salesperson: "",
    softwareName: "",
    licenseCount: 1,
    softwareDescription: "",
    platform: "",
    networkSupport: "بله",
    webMobileSupport: "",
    initialTraining: "",
    setupAndInstallation: "",
    technicalSupport: "",
    updates: "",
    customizations: "",
    totalAmount: 0,
    prepayment: 0,
    paymentStages: "",
    paymentMethods: [],
    paymentStatus: "در حال پیگیری",
    invoiceNumber: "",
    signedContractPdf: "",
    salesInvoice: "",
    deliverySchedule: "",
    moduleList: "",
    terminationConditions: "",
    warrantyConditions: "",
    ownershipRights: "",
    confidentialityClause: "",
    nonCompeteClause: "",
    disputeResolution: "",
    lastStatusChangeDate: formattedDate,
    crmResponsible: "",
    notes: "",
    futureTasks: "",
  };
};

const inputClass = "block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const textareaClass = `${inputClass} min-h-[80px]`;

const statusStyles: { [key in ContractStatus]: string } = {
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

const FileInput: React.FC<{ label: string; fileName: string; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, fileName, onFileChange }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <div className="mt-1 flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-2 text-center">
                    <FileUploadIcon />
                    {fileName ? (
                         <p className="text-sm text-green-600 font-semibold truncate">{fileName}</p>
                    ) : (
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold text-cyan-600">برای آپلود کلیک کنید</span> یا فایل را بکشید
                        </p>
                    )}
                </div>
                <input type="file" className="hidden" onChange={onFileChange} />
            </label>
        </div>
    </div>
);


const PurchaseContractFormModal: React.FC<PurchaseContractFormModalProps> = ({ isOpen, onClose, onSave, contract, users, contracts, customers }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Omit<PurchaseContract, 'id'>>(getInitialState());
  const [errors, setErrors] = useState<string[]>([]);
  const [formattedTotalAmount, setFormattedTotalAmount] = useState('');
  const [formattedPrepayment, setFormattedPrepayment] = useState('');
  const salesUsers = users.filter(user => user.role === 'فروش');

  useEffect(() => {
    if (isOpen) {
        const initialState = contract ? contract : getInitialState();
        setFormData(initialState);
        setFormattedTotalAmount(formatCurrency(initialState.totalAmount));
        setFormattedPrepayment(formatCurrency(initialState.prepayment));
    } else {
        setTimeout(() => {
            const initial = getInitialState();
            setFormData(initial);
            setFormattedTotalAmount(formatCurrency(initial.totalAmount));
            setFormattedPrepayment(formatCurrency(initial.prepayment));
            setActiveTab(0);
            setErrors([]);
        }, 300);
    }
  }, [contract, isOpen]);
  
  const handleCustomerSelect = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        setFormData(prev => ({
            ...prev,
            customerName: customer.companyName,
            economicCode: customer.taxCode,
            customerAddress: customer.address,
            customerContact: customer.mobileNumbers[0] || customer.phone[0] || '',
            customerRepresentative: `${customer.firstName} ${customer.lastName}`
        }));
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'totalAmount' | 'prepayment') => {
    const rawValue = e.target.value;
    const englishValue = convertPersianToEnglish(rawValue);
    const numericString = englishValue.replace(/[^0-9]/g, '');
    const numericValue = numericString ? parseInt(numericString, 10) : 0;
    
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    const formatted = numericString ? formatCurrency(numericValue) : '';
    if (field === 'totalAmount') {
        setFormattedTotalAmount(formatted);
    } else {
        setFormattedPrepayment(formatted);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };
  
  const handleDateChange = (field: keyof Omit<PurchaseContract, 'id'>, date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const method = value as PaymentMethod;
    setFormData(prev => ({
        ...prev,
        paymentMethods: checked
            ? [...prev.paymentMethods, method]
            : prev.paymentMethods.filter(pm => pm !== method)
    }));
  };
  
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<PurchaseContract, 'id'>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0].name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];
    
    if (!formData.contractId.trim()) {
        validationErrors.push('شناسه قرارداد نمی‌تواند خالی باشد.');
    }
    
    const isContractIdTaken = contracts.some(
        c => c.contractId.toLowerCase() === formData.contractId.toLowerCase() && c.id !== contract?.id
    );
    if (isContractIdTaken) {
        validationErrors.push('این شناسه قرارداد قبلا استفاده شده است.');
    }

    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setActiveTab(0); // Go to the tab with the error
        return;
    }
    const finalStatus = getPurchaseContractStatusByDate(formData.contractStartDate, formData.contractEndDate);
    onSave({ ...formData, contractStatus: finalStatus, ...(contract && { id: contract.id }) });
    onClose();
  };
  
  const tabs = ["مشخصات", "طرفین", "فنی", "خدمات", "مالی", "پیوست", "حقوقی", "CRM"];
  
  const displayStatus = getPurchaseContractStatusByDate(formData.contractStartDate, formData.contractEndDate);

  const renderTabContent = () => {
    switch(activeTab) {
        case 0: return ( // مشخصات
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="شناسه قرارداد"><input type="text" name="contractId" value={formData.contractId} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="نوع قرارداد">
                    <select name="contractType" value={formData.contractType} onChange={handleChange} className={inputClass}>
                        {(['خرید دائم', 'اشتراک دوره ای', 'اجاره ی نرم افزار', 'سفارشی سازی'] as ContractType[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
                <FormField label="وضعیت قرارداد">
                    <div className="flex items-center gap-4 mt-1">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyles[displayStatus]}`}>
                            {displayStatus}
                        </span>
                         <p className="text-sm text-gray-500">(محاسبه خودکار بر اساس تاریخ)</p>
                    </div>
                </FormField>
                <FormField label="تاریخ انعقاد"><DatePicker value={formData.contractDate} onChange={d => handleDateChange('contractDate', d)} /></FormField>
                <FormField label="شروع مدت قرارداد"><DatePicker value={formData.contractStartDate} onChange={d => handleDateChange('contractStartDate', d)} /></FormField>
                <FormField label="پایان مدت قرارداد"><DatePicker value={formData.contractEndDate} onChange={d => handleDateChange('contractEndDate', d)} /></FormField>
                <FormField label="نسخه نرم افزار"><input type="text" name="softwareVersion" value={formData.softwareVersion} onChange={handleChange} className={inputClass} /></FormField>
            </div>
        );
        case 1: return ( // طرفین
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="sm:col-span-2 lg:col-span-3">
                    <FormField label="انتخاب مشتری (برای تکمیل خودکار)">
                        <select
                            onChange={(e) => handleCustomerSelect(Number(e.target.value))}
                            className={inputClass}
                            defaultValue=""
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
                <FormField label="نوع مشتری">
                    <select name="customerType" value={formData.customerType} onChange={handleChange} className={inputClass}>
                         {(['شخصی', 'سازمانی'] as CustomerType[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
                <FormField label="نام مشتری"><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="کد اقتصادی"><input type="text" name="economicCode" value={formData.economicCode} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="شماره تماس و ایمیل"><input type="text" name="customerContact" value={formData.customerContact} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="نماینده مشتری"><input type="text" name="customerRepresentative" value={formData.customerRepresentative} onChange={handleChange} className={inputClass} /></FormField>
                <div className="sm:col-span-2 lg:col-span-3">
                    <FormField label="آدرس کامل مشتری"><input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleChange} className={inputClass} /></FormField>
                </div>
                <FormField label="فروشنده / تامین کننده"><input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="مسئول فروش">
                     <select name="salesperson" value={formData.salesperson} onChange={handleChange} className={inputClass}>
                        <option value="">انتخاب کنید...</option>
                        {salesUsers.map(user => <option key={user.id} value={user.username}>{user.firstName} {user.lastName}</option>)}
                     </select>
                </FormField>
             </div>
        );
        case 2: return ( // فنی
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="نام نرم افزار"><input type="text" name="softwareName" value={formData.softwareName} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="تعداد کاربر / لایسنس"><input type="number" name="licenseCount" value={formData.licenseCount} onChange={handleChange} className={inputClass} /></FormField>
                <div className="sm:col-span-2"><FormField label="توضیحات نرم افزار"><textarea name="softwareDescription" value={formData.softwareDescription} onChange={handleChange} className={textareaClass}></textarea></FormField></div>
                <FormField label="سیستم عامل و بستر اجرا"><input type="text" name="platform" value={formData.platform} onChange={handleChange} className={inputClass} /></FormField>
                <FormField label="پشتیبانی از شبکه">
                     <select name="networkSupport" value={formData.networkSupport} onChange={handleChange} className={inputClass}>
                         {(['بله', 'خیر'] as NetworkSupport[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
                 <div className="sm:col-span-2"><FormField label="پشتیبانی از نسخه وب / موبایل"><input type="text" name="webMobileSupport" value={formData.webMobileSupport} onChange={handleChange} className={inputClass} /></FormField></div>
            </div>
        );
        case 3: return ( // خدمات
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="آموزش اولیه"><textarea name="initialTraining" value={formData.initialTraining} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="نصب و راه اندازی اولیه"><textarea name="setupAndInstallation" value={formData.setupAndInstallation} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="پشتیبانی فنی"><textarea name="technicalSupport" value={formData.technicalSupport} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="به روز رسانی ها"><textarea name="updates" value={formData.updates} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <div className="sm:col-span-2"><FormField label="سفارشی سازی ها"><textarea name="customizations" value={formData.customizations} onChange={handleChange} className={textareaClass}></textarea></FormField></div>
            </div>
        );
        case 4: return ( // مالی
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="مبلغ کل قرارداد (ریال)">
                  <input 
                      type="text" 
                      name="totalAmount" 
                      value={formattedTotalAmount} 
                      onChange={e => handleAmountChange(e, 'totalAmount')} 
                      className={`${inputClass} font-mono`}
                      inputMode="numeric"
                      dir="ltr"
                  />
                </FormField>
                <FormField label="پیش پرداخت (ریال)">
                  <input 
                      type="text" 
                      name="prepayment" 
                      value={formattedPrepayment} 
                      onChange={e => handleAmountChange(e, 'prepayment')} 
                      className={`${inputClass} font-mono`}
                      inputMode="numeric"
                      dir="ltr"
                  />
                </FormField>
                <FormField label="شماره فاکتور"><input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className={inputClass} /></FormField>
                <div className="lg:col-span-3"><FormField label="مراحل پرداخت"><textarea name="paymentStages" value={formData.paymentStages} onChange={handleChange} className={textareaClass}></textarea></FormField></div>
                <FormField label="روش پرداخت">
                     <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        {(['نقد', 'کارت به کارت', 'چک', 'حواله بانکی'] as PaymentMethod[]).map(m => (
                            <div key={m} className="flex items-center"><input id={m} type="checkbox" value={m} checked={formData.paymentMethods.includes(m)} onChange={handleCheckboxChange} className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500" /><label htmlFor={m} className="mr-2 text-sm text-gray-900">{m}</label></div>
                        ))}
                    </div>
                </FormField>
                 <FormField label="وضعیت پرداخت">
                    <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className={inputClass}>
                         {(['پرداخت شده', 'بدهی باقی مانده', 'در حال پیگیری'] as PaymentStatus[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </FormField>
            </div>
        );
        case 5: return ( // پیوست
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FileInput label="نسخه PDF قرارداد امضا شده" fileName={formData.signedContractPdf} onFileChange={e => handleFileChange(e, 'signedContractPdf')} />
                <FileInput label="فاکتور فروش" fileName={formData.salesInvoice} onFileChange={e => handleFileChange(e, 'salesInvoice')} />
                <FileInput label="برنامه زمانبندی تحویل" fileName={formData.deliverySchedule} onFileChange={e => handleFileChange(e, 'deliverySchedule')} />
                <FileInput label="لیست ماژول های خریداری شده" fileName={formData.moduleList} onFileChange={e => handleFileChange(e, 'moduleList')} />
            </div>
        );
        case 6: return ( // حقوقی
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="شرایط فسخ قرارداد"><textarea name="terminationConditions" value={formData.terminationConditions} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="شرایط گارانتی نرم افزار"><textarea name="warrantyConditions" value={formData.warrantyConditions} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="حقوق مالکیت نرم افزار"><textarea name="ownershipRights" value={formData.ownershipRights} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="بند محرمانگی اطلاعات"><textarea name="confidentialityClause" value={formData.confidentialityClause} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="بند عدم رقابت"><textarea name="nonCompeteClause" value={formData.nonCompeteClause} onChange={handleChange} className={textareaClass}></textarea></FormField>
                <FormField label="صلاحیت رسیدگی به اختلاف"><textarea name="disputeResolution" value={formData.disputeResolution} onChange={handleChange} className={textareaClass}></textarea></FormField>
            </div>
        );
        case 7: return ( // CRM
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="تاریخ آخرین تغییر وضعیت"><DatePicker value={formData.lastStatusChangeDate} onChange={d => handleDateChange('lastStatusChangeDate', d)} /></FormField>
                 <FormField label="مسئول پیگیری قرارداد">
                     <select name="crmResponsible" value={formData.crmResponsible} onChange={handleChange} className={inputClass}>
                        <option value="">انتخاب کنید...</option>
                        {users.map(user => <option key={user.id} value={user.username}>{user.firstName} {user.lastName}</option>)}
                     </select>
                </FormField>
                <div className="sm:col-span-2"><FormField label="یادداشت و مکاتبات مرتبط"><textarea name="notes" value={formData.notes} onChange={handleChange} className={textareaClass}></textarea></FormField></div>
                <div className="sm:col-span-2"><FormField label="وظایف آتی و یادآورها"><textarea name="futureTasks" value={formData.futureTasks} onChange={handleChange} className={textareaClass}></textarea></FormField></div>
            </div>
        );
        default: return null;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="p-6 flex flex-col">
        <h3 className="text-xl font-medium leading-6 text-cyan-600 mb-4">
          {contract ? 'ویرایش قرارداد فروش' : 'افزودن قرارداد فروش'}
        </h3>
        
        <div className="border-b border-gray-200 mb-4">
            <nav className="flex flex-wrap -mb-px space-x-4 space-x-reverse" aria-label="Tabs">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(index)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === index 
                            ? 'border-cyan-500 text-cyan-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2 pb-4">
              <Alert messages={errors} onClose={() => setErrors([])} />
              {renderTabContent()}
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white"
                >
                  ذخیره قرارداد
                </button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default PurchaseContractFormModal;