import React from 'react';
import DashboardStats from '../components/DashboardStats';
import { User, Customer, PurchaseContract, SupportContract, Ticket, Referral } from '../types';
import GeminiAnalysis from '../components/GeminiAnalysis';

interface DashboardPageProps {
  users: User[];
  customers: Customer[];
  purchaseContracts: PurchaseContract[];
  supportContracts: SupportContract[];
  tickets: Ticket[];
  referrals: Referral[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  users,
  customers, purchaseContracts, supportContracts, tickets, referrals
}) => {
  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">داشبورد</h1>
          <p className="text-gray-500 mt-1">خلاصه وضعیت و آمار کلی سیستم</p>
        </div>

        {/* Stats */}
        <DashboardStats 
          users={users}
          customers={customers}
          purchaseContracts={purchaseContracts}
          supportContracts={supportContracts}
          tickets={tickets}
          referrals={referrals}
        />

        {/* Reports Analysis Section */}
        <div className="mt-8">
           <GeminiAnalysis
              users={users}
           />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;