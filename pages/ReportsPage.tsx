
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, PurchaseContract, SupportContract, Ticket, User, TicketStatus, TicketPriority, ContractStatus, CustomerStatus } from '../types';
import DatePicker from '../components/DatePicker';
import Pagination from '../components/Pagination';

type ReportType = 'customers' | 'contracts' | 'tickets';

interface ReportsPageProps {
  customers: Customer[];
  users: User[];
  purchaseContracts: PurchaseContract[];
  supportContracts: SupportContract[];
  tickets: Ticket[];
}

const ITEMS_PER_PAGE = 10;

const ReportsPage: React.FC<ReportsPageProps> = ({ customers, users, purchaseContracts, supportContracts, tickets }) => {
    const [reportType, setReportType] = useState<ReportType>('customers');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: 'all',
        priority: 'all',
        assignedTo: 'all',
    });
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportColumns, setReportColumns] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const toPersianDigits = (n: string | number): string => {
        if (n === undefined || n === null) return '';
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
    };
    
    const handleGenerateReport = useCallback(() => {
        setCurrentPage(1); // Reset page on new report generation
        let data: any[] = [];
        let columns: string[] = [];

        const allContracts = [
            ...purchaseContracts.map(c => ({ ...c, type: 'خرید' })),
            ...supportContracts.map(c => ({ ...c, type: 'پشتیبانی', contractId: `SC-${c.id}`, customerName: customers.find(cust => cust.id === c.customerId)?.companyName || 'N/A', totalAmount: 0, contractStatus: c.status, contractDate: c.startDate }))
        ];

        const checkDateRange = (dateStr: string) => {
            if (!dateStr) return false;
            const dateOnly = dateStr.split(' ')[0];
            if (filters.startDate && dateOnly < filters.startDate) return false;
            if (filters.endDate && dateOnly > filters.endDate) return false;
            return true;
        };

        switch (reportType) {
            case 'customers':
                columns = ['کد مشتری', 'نام مشتری', 'شرکت', 'سطح', 'وضعیت', 'تاریخ خرید'];
                data = customers.filter(c => {
                    if (!checkDateRange(c.purchaseDate)) return false;
                    if (filters.status !== 'all' && c.status !== filters.status) return false;
                    return true;
                }).map(c => ({
                    id: c.id,
                    name: `${c.firstName} ${c.lastName}`,
                    company: c.companyName,
                    level: c.level,
                    status: c.status,
                    purchaseDate: c.purchaseDate
                }));
                break;
            case 'contracts':
                columns = ['شناسه', 'نام مشتری', 'نوع', 'وضعیت', 'تاریخ قرارداد', 'مبلغ (ریال)'];
                 data = allContracts.filter(c => {
                    if (!checkDateRange(c.contractDate)) return false;
                    if (filters.status !== 'all' && c.contractStatus !== filters.status) return false;
                    if (filters.assignedTo !== 'all' && 'salesperson' in c && c.salesperson !== filters.assignedTo) return false;
                    return true;
                }).map(c => ({
                    id: c.contractId,
                    customerName: c.customerName,
                    type: c.type,
                    status: c.contractStatus,
                    date: c.contractDate,
                    amount: (c.totalAmount || 0).toLocaleString('fa-IR')
                }));
                break;
            case 'tickets':
                columns = ['شماره تیکت', 'عنوان', 'مشتری', 'وضعیت', 'اولویت', 'مسئول'];
                data = tickets.filter(t => {
                    if (!checkDateRange(t.creationDateTime)) return false;
                    if (filters.status !== 'all' && t.status !== filters.status) return false;
                    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
                    if (filters.assignedTo !== 'all' && t.assignedTo !== filters.assignedTo) return false;
                    return true;
                }).map(t => ({
                    id: t.ticketNumber,
                    title: t.title,
                    customer: customers.find(c => c.id === t.customerId)?.companyName || 'N/A',
                    status: t.status,
                    priority: t.priority,
                    assignee: users.find(u => u.username === t.assignedTo)?.firstName || t.assignedTo || 'N/A'
                }));
                break;
        }

        setReportData(data);
        setReportColumns(columns);
        setShowResults(true);
    }, [filters, reportType, customers, users, purchaseContracts, supportContracts, tickets]);

    useEffect(() => {
        handleGenerateReport();
    }, [handleGenerateReport]);

    const totalPages = Math.ceil(reportData.length / ITEMS_PER_PAGE);
    const paginatedData = reportData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderFilters = () => {
        const ticketStatuses: TicketStatus[] = ['در حال پیگیری', 'انجام نشده', 'اتمام یافته'];
        const contractStatuses: ContractStatus[] = ['فعال', 'منقضی شده', 'لغو شده', 'در انتظار تایید'];
        const customerStatuses: CustomerStatus[] = ['فعال', 'غیرفعال'];
        const priorities: TicketPriority[] = ['ضطراری', 'متوسط', 'کم'];
        
        let statusOptions: {value: string, label: string}[] = [];
        if (reportType === 'tickets') statusOptions = ticketStatuses.map(s => ({value: s, label: s}));
        if (reportType === 'contracts') statusOptions = contractStatuses.map(s => ({value: s, label: s}));
        if (reportType === 'customers') statusOptions = customerStatuses.map(s => ({value: s, label: s}));
        
        return (
            <>
                {statusOptions.length > 0 && (
                     <div>
                        <label className="text-sm font-medium text-gray-700">وضعیت</label>
                        <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="w-full mt-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                            <option value="all">همه</option>
                            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                )}
                
                {reportType === 'tickets' && (
                     <div>
                        <label className="text-sm font-medium text-gray-700">اولویت</label>
                        <select value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))} className="w-full mt-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                            <option value="all">همه</option>
                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
                
                {(reportType === 'tickets' || reportType === 'contracts') && (
                     <div>
                        <label className="text-sm font-medium text-gray-700">مسئول</label>
                        <select value={filters.assignedTo} onChange={e => setFilters(f => ({...f, assignedTo: e.target.value}))} className="w-full mt-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                            <option value="all">همه</option>
                            {users.map(u => <option key={u.id} value={u.username}>{u.firstName} {u.lastName}</option>)}
                        </select>
                    </div>
                )}
            </>
        )
    };
    
  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">گزارشات</h1>
          <p className="text-gray-500 mt-1">گزارشات سیستم را در این بخش مشاهده و فیلتر کنید.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-4">
                    <label className="text-sm font-medium text-gray-700">نوع گزارش</label>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {(['customers', 'contracts', 'tickets'] as ReportType[]).map(type => (
                            <button key={type} onClick={() => { setReportType(type); setFilters(f => ({...f, status: 'all', priority: 'all'})); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${reportType === type ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {type === 'customers' ? 'مشتریان' : type === 'contracts' ? 'قراردادها' : 'تیکت‌ها'}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">از تاریخ</label>
                    <DatePicker value={filters.startDate} onChange={date => setFilters(f => ({...f, startDate: date}))} />
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700">تا تاریخ</label>
                    <DatePicker value={filters.endDate} onChange={date => setFilters(f => ({...f, endDate: date}))} />
                </div>
                {renderFilters()}
            </div>
        </div>
        
        {showResults && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
                 <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">نتایج گزارش</h3>
                </div>
                {reportData.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-600">
                                <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50">
                                    <tr>{reportColumns.map(col => <th key={col} className="px-6 py-4">{col}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, index) => (
                                        <tr key={index} className="border-b hover:bg-slate-50/50">
                                            {Object.values(row).map((val: any, i) => <td key={i} className="px-6 py-4">{toPersianDigits(val)}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={reportData.length}
                        />
                    </>
                ) : (
                    <div className="p-16 text-center text-gray-500">
                        <p>هیچ نتیجه‌ای برای فیلترهای انتخابی یافت نشد.</p>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
};

export default ReportsPage;
