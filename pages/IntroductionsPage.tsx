import React, { useState, useMemo } from 'react';
import { CustomerIntroduction, User } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import IntroductionCard from '../components/IntroductionCard';
import IntroductionFormModal from '../components/IntroductionFormModal';
import ReferIntroductionModal from '../components/ReferIntroductionModal';

interface IntroductionsPageProps {
  introductions: CustomerIntroduction[];
  users: User[];
  onSave: (introduction: CustomerIntroduction | Omit<CustomerIntroduction, 'id'>) => void;
  onDelete: (id: number) => void;
  currentUser: User;
}

const IntroductionsPage: React.FC<IntroductionsPageProps> = ({ introductions, users, onSave, onDelete, currentUser }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [editingIntroduction, setEditingIntroduction] = useState<CustomerIntroduction | null>(null);
  const [referringIntroduction, setReferringIntroduction] = useState<CustomerIntroduction | null>(null);

  const salesTeamForForm = useMemo(() => users.filter(u => u.role === 'مسئول فروش' || u.role === 'کارشناس فروش'), [users]);
  
  const handleOpenFormModal = (intro: CustomerIntroduction | null = null) => {
    setEditingIntroduction(intro);
    setIsFormModalOpen(true);
  };
  
  const handleOpenReferModal = (intro: CustomerIntroduction) => {
    setReferringIntroduction(intro);
    setIsReferModalOpen(true);
  };

  const handleSave = (intro: CustomerIntroduction | Omit<CustomerIntroduction, 'id'>) => {
    onSave(intro);
    setIsFormModalOpen(false);
  };
  
  const handleRefer = (newAssigneeUsername: string) => {
    if (referringIntroduction) {
        onSave({ ...referringIntroduction, assignedToUsername: newAssigneeUsername });
    }
    setIsReferModalOpen(false);
  };

  return (
    <>
      <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <main className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">معرفی مشتریان</h1>
              <p className="text-gray-500 mt-1">فرصت‌های جدید فروش را در این بخش ثبت و پیگیری کنید.</p>
            </div>
            <button
              onClick={() => handleOpenFormModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <PlusIcon />
              <span>معرفی جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {introductions.map(intro => (
              <IntroductionCard
                key={intro.id}
                introduction={intro}
                users={users}
                currentUser={currentUser}
                onEdit={handleOpenFormModal}
                onRefer={handleOpenReferModal}
                onStatusChange={(newStatus) => onSave({ ...intro, status: newStatus })}
                onDelete={onDelete}
              />
            ))}
             {introductions.length === 0 && (
                <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
                    <h3 className="text-xl font-semibold text-slate-700">هیچ موردی برای نمایش وجود ندارد</h3>
                    <p className="text-gray-500 mt-2">اولین مشتری را شما معرفی کنید!</p>
                </div>
            )}
          </div>
        </main>
      </div>
      
      <IntroductionFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        introduction={editingIntroduction}
        currentUser={currentUser}
        salesTeam={salesTeamForForm}
      />

      <ReferIntroductionModal 
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        onRefer={handleRefer}
        introduction={referringIntroduction}
        users={users}
        currentUser={currentUser}
      />
    </>
  );
};

export default IntroductionsPage;