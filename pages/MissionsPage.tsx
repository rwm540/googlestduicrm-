import React, { useState, useEffect } from 'react';
import { User, Mission, MissionTask } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import MissionFormModal from '../components/MissionFormModal';
import { toPersianDigits, formatJalaaliDateTime } from '../utils/dateFormatter';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import CountdownTimer from '../components/CountdownTimer';

interface MissionsPageProps {
  currentUser: User;
  missions: Mission[];
  users: User[];
  onSave: (mission: Mission | Omit<Mission, 'id'>) => void;
}

const MissionsPage: React.FC<MissionsPageProps> = ({ currentUser, missions, users, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [expandedMissionId, setExpandedMissionId] = useState<number | null>(null);

  const handleOpenModal = (mission: Mission | null = null) => {
    setEditingMission(mission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMission(null);
  };
  
  const handleSaveMission = (missionData: Mission | Omit<Mission, 'id'>) => {
    onSave(missionData);
    handleCloseModal();
  };
  
  // FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type.
  const missionsToShow = (currentUser.role === 'مدیر' 
    ? missions 
    : missions.filter(m => m.assignedTo === currentUser.id))
    .sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime());
    
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'کاربر حذف شده';
  };

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">مدیریت ماموریت ها</h1>
            <p className="text-gray-500 mt-1">ماموریت های تعریف شده را مشاهده و مدیریت کنید.</p>
          </div>
          {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
          {currentUser.role === 'مدیر' && (
             <button
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
             >
                <PlusIcon />
                <span>تعریف ماموریت جدید</span>
             </button>
          )}
        </div>

        <div className="space-y-4">
            {missionsToShow.length > 0 ? missionsToShow.map(mission => (
                <div key={mission.id} className="bg-white rounded-lg shadow-sm border border-gray-200/80">
                    <button 
                        onClick={() => setExpandedMissionId(expandedMissionId === mission.id ? null : mission.id)}
                        className="w-full text-right p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <BriefcaseIcon className={`h-8 w-8 flex-shrink-0 ${mission.completed ? 'text-gray-400' : 'text-purple-600'}`} />
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{mission.title}</h3>
                                {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                                {currentUser.role === 'مدیر' && <p className="text-sm text-gray-500">برای: {getUserName(mission.assignedTo)}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            {mission.completed ? (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">اتمام یافته</span>
                            ) : (
                                <CountdownTimer targetDate={mission.endTimestamp} />
                            )}
                        </div>
                    </button>
                    {expandedMissionId === mission.id && (
                        <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{mission.description}</p>
                            <h4 className="font-semibold text-slate-700 mb-2">وظایف:</h4>
                            <ul className="space-y-2">
                                {mission.tasks.map(task => (
                                    <li key={task.id} className="flex items-center gap-3">
                                        <input type="checkbox" checked={task.completed} readOnly className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-not-allowed" />
                                        <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-slate-800'}`}>{task.description}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="text-xs text-gray-400 mt-4 flex justify-between">
                                <span>شروع: {toPersianDigits(formatJalaaliDateTime(new Date(mission.startTimestamp)))}</span>
                                <span>پایان: {toPersianDigits(formatJalaaliDateTime(new Date(mission.endTimestamp)))}</span>
                            </div>
                        </div>
                    )}
                </div>
            )) : (
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
                    <h3 className="text-xl font-semibold text-slate-700">هیچ ماموریتی یافت نشد</h3>
                    {/* FIX: Changed 'admin' to the correct Persian role 'مدیر' to match the UserRole type. */}
                    {currentUser.role === 'مدیر' && <p className="text-gray-500 mt-2">برای شروع، یک ماموریت جدید برای کارمندان تعریف کنید.</p>}
                </div>
            )}
        </div>

        <MissionFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveMission}
            mission={editingMission}
            // FIX: Changed 'employee' to filter for non-admin roles to match the UserRole type.
            users={users.filter(u => u.role !== 'مدیر')}
            currentUser={currentUser}
        />
      </main>
    </div>
  );
};

export default MissionsPage;