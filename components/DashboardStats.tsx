import React from 'react';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PurchaseIcon } from './icons/PurchaseIcon';
import { SupportIcon } from './icons/SupportIcon';
import { TicketIcon } from './icons/TicketIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral } from '../types';

interface DashboardStatsProps {
  users: User[];
  customers: Customer[];
  purchaseContracts: PurchaseContract[];
  supportContracts: SupportContract[];
  tickets: Ticket[];
  referrals: Referral[];
}

const toPersianDigits = (n: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; iconBgColor: string }> = ({ icon, value, label, iconBgColor }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-6 flex items-center gap-6">
    <div className={`rounded-full p-4 flex-shrink-0 ${iconBgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800">{toPersianDigits(value)}</p>
      <p className="text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
    users, 
    customers, purchaseContracts, supportContracts, tickets, referrals 
}) => {
  
  // Business Stats Calculations
  const totalUsers = users.length;
  const totalCustomers = customers.length;
  const totalPurchaseContracts = purchaseContracts.length;
  const totalSupportContracts = supportContracts.length;
  const totalTickets = tickets.length;
  const totalReferrals = referrals.length;

  const stats = [
    { id: 1, icon: <UsersIcon className="h-8 w-8" />, value: totalUsers.toString(), label: 'تعداد کاربران', color: 'bg-cyan-100 text-cyan-600' },
    { id: 2, icon: <UserGroupIcon />, value: totalCustomers.toString(), label: 'تعداد مشتریان', color: 'bg-blue-100 text-blue-600' },
    { id: 3, icon: <PurchaseIcon />, value: totalPurchaseContracts.toString(), label: 'قراردادهای فروش', color: 'bg-emerald-100 text-emerald-600' },
    { id: 4, icon: <SupportIcon />, value: totalSupportContracts.toString(), label: 'قراردادهای پشتیبانی', color: 'bg-indigo-100 text-indigo-600' },
    { id: 5, icon: <TicketIcon />, value: totalTickets.toString(), label: 'تعداد تیکت‌ها', color: 'bg-pink-100 text-pink-600' },
    { id: 6, icon: <HashtagIcon className="h-8 w-8" />, value: totalReferrals.toString(), label: 'تیکت‌های ارجاع شده', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {stats.map(stat => (
        <StatCard key={stat.id} icon={stat.icon} value={stat.value} label={stat.label} iconBgColor={stat.color} />
      ))}
    </div>
  );
};

export default DashboardStats;