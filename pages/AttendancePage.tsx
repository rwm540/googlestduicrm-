import React from 'react';
import { User, AttendanceRecord, AttendanceType } from '../types';
import { FingerPrintIcon } from '../components/icons/FingerPrintIcon';
import { toPersianDigits, formatJalaaliDateTime, isToday } from '../utils/dateFormatter';

interface AttendancePageProps {
  currentUser: User;
  records: AttendanceRecord[];
  onRecord: (type: AttendanceType) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ currentUser, records, onRecord }) => {
  const userRecords = records.filter(r => r.userId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const lastRecord = userRecords.length > 0 ? userRecords[0] : null;
  const canClockIn = !lastRecord || (lastRecord.type === 'خروج' && isToday(new Date(lastRecord.timestamp)));
  const canClockOut = lastRecord && lastRecord.type === 'ورود' && isToday(new Date(lastRecord.timestamp));
  
  const todayUserRecords = userRecords.filter(r => isToday(new Date(r.timestamp)));
  const pastUserRecords = userRecords.filter(r => !isToday(new Date(r.timestamp)));

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">حضور و غیاب</h1>
          <p className="text-gray-500 mt-1">ساعت ورود و خروج خود را در این بخش ثبت کنید.</p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
                onClick={() => onRecord('ورود')}
                disabled={!canClockIn}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <FingerPrintIcon className="h-8 w-8" />
                <span>ثبت ورود</span>
            </button>
            <button
                onClick={() => onRecord('خروج')}
                disabled={!canClockOut}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <FingerPrintIcon className="h-8 w-8" />
                <span>ثبت خروج</span>
            </button>
        </div>

        {/* Today's Records */}
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">ترددهای امروز</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
                 {todayUserRecords.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {todayUserRecords.map(record => (
                             <li key={record.id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${record.type === 'ورود' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.type}
                                    </span>
                                    <p className="text-gray-600">{toPersianDigits(formatJalaaliDateTime(new Date(record.timestamp)))}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p>امروز ترددی برای شما ثبت نشده است.</p>
                    </div>
                 )}
            </div>
        </div>
        
        {/* Past Records */}
        {pastUserRecords.length > 0 && (
             <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">ترددهای گذشته</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {pastUserRecords.map(record => (
                            <li key={record.id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${record.type === 'ورود' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.type}
                                    </span>
                                    <p className="text-gray-600">{toPersianDigits(formatJalaaliDateTime(new Date(record.timestamp)))}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default AttendancePage;
