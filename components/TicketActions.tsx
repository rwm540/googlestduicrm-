import React, { useState, useEffect } from 'react';
import { Ticket, User, UserRole } from '../types';
import { toPersianDigits, formatSecondsToTime } from '../utils/dateFormatter';
import { EditIcon } from './icons/EditIcon';
import { UserCheckIcon } from './icons/UserCheckIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { ClockIcon } from './icons/ClockIcon';
import ConfirmationModal from './ConfirmationModal';
import { TrashIcon } from './icons/TrashIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ClockPlusIcon } from './icons/ClockPlusIcon';

interface TicketActionsProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onRefer: (ticket: Ticket) => void;
  onToggleWork: (ticketId: number) => void;
  onDelete?: (ticketId: number) => void;
  onReopen?: (ticketId: number) => void;
  onExtendEditTime: (ticketId: number) => void;
  currentUser: User;
}

const isSpecialist = (role: UserRole) => role.startsWith('کارشناس');

const EditCountdown: React.FC<{ editableUntil: string }> = ({ editableUntil }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(editableUntil).getTime() - new Date().getTime();
            if (difference > 0) {
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            return null; // Timer finished
        };

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft === null) {
                setTimeLeft('');
                clearInterval(timer);
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);

        // Initial calculation
        const initialTimeLeft = calculateTimeLeft();
        if (initialTimeLeft) {
            setTimeLeft(initialTimeLeft);
        }

        return () => clearInterval(timer);
    }, [editableUntil]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1 text-xs text-amber-600 font-mono p-2" title="زمان باقی مانده برای ویرایش">
            <ClockIcon className="h-4 w-4" />
            <span>{toPersianDigits(timeLeft)}</span>
        </div>
    );
};


const TicketActions: React.FC<TicketActionsProps> = ({ ticket, onEdit, onRefer, onToggleWork, currentUser, onDelete, onReopen, onExtendEditTime }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isStillEditable, setIsStillEditable] = useState(new Date().getTime() < new Date(ticket.editableUntil).getTime());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isReopenConfirmOpen, setIsReopenConfirmOpen] = useState(false);
    const [isExtendConfirmOpen, setIsExtendConfirmOpen] = useState(false);

    const isRunning = ticket.status === 'در حال پیگیری';
    
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isRunning && ticket.workSessionStartedAt) {
            const updateTimer = () => {
                const sessionStart = new Date(ticket.workSessionStartedAt!).getTime();
                const now = new Date().getTime();
                setElapsedTime(Math.floor((now - sessionStart) / 1000));
            };
            updateTimer();
            timer = setInterval(updateTimer, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, ticket.workSessionStartedAt]);

    useEffect(() => {
        // Timer to check for editability expiration
        const checkEditability = () => {
            const editable = new Date().getTime() < new Date(ticket.editableUntil).getTime();
            if (isStillEditable !== editable) {
                setIsStillEditable(editable);
            }
        };
        
        const interval = setInterval(checkEditability, 1000);
        checkEditability(); // check once
        
        return () => clearInterval(interval);
    }, [ticket.editableUntil, isStillEditable]);

    const totalDuration = ticket.totalWorkDuration + elapsedTime;

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const handleToggleWorkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmModalOpen(true);
    };

    const confirmToggleWork = () => {
        onToggleWork(ticket.id);
        setIsConfirmModalOpen(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(ticket.id);
        }
        setIsDeleteConfirmOpen(false);
    };

    const canReopen = currentUser.role === 'مدیر';

    const handleReopenClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsReopenConfirmOpen(true);
    };

    const confirmReopen = () => {
        if (onReopen) {
            onReopen(ticket.id);
        }
        setIsReopenConfirmOpen(false);
    };
    
    const canExtend = currentUser.role === 'مدیر';

    const handleExtendClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExtendConfirmOpen(true);
    };

    const confirmExtend = () => {
        onExtendEditTime(ticket.id);
        setIsExtendConfirmOpen(false);
    };

    const stopWorkMessage = "با توقف کار، این تیکت به وضعیت 'اتمام یافته' تغییر کرده و به لیست کارهای تکمیل شده منتقل می‌شود. آیا اطمینان دارید؟";
    const startWorkMessage = "آیا از شروع کار روی این تیکت اطمینان دارید؟";

    return (
        <>
            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                
                 {ticket.status === 'اتمام یافته' && onReopen && canReopen && (
                    <button
                        onClick={handleReopenClick}
                        className="p-2 text-purple-600 rounded-full transition-colors hover:bg-purple-100"
                        title="به جریان انداختن مجدد"
                    >
                        <RefreshIcon />
                    </button>
                )}

                {ticket.status !== 'اتمام یافته' && (
                    <>
                        <button
                            onClick={handleToggleWorkClick}
                            className={`p-2 rounded-full transition-colors ${isRunning ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                            title={isRunning ? 'توقف کار' : 'شروع کار'}
                        >
                            {isRunning ? <StopIcon /> : <PlayIcon />}
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, () => onRefer(ticket))}
                            className="p-2 text-blue-500 rounded-full transition-colors hover:text-blue-600 hover:bg-blue-100"
                            title="ارجاع به کاربر دیگر"
                        >
                            <UserCheckIcon />
                        </button>
                    </>
                )}
                
                 <div className="text-sm text-gray-500 p-2 font-mono" title="زمان کل / زمان این جلسه">
                    {toPersianDigits(formatSecondsToTime(totalDuration))}
                    {isRunning && <span className="text-xs opacity-70"> ({toPersianDigits(formatSecondsToTime(elapsedTime))})</span>}
                </div>
                

                {isStillEditable && ticket.status !== 'اتمام یافته' ? (
                    <>
                        <button
                            onClick={(e) => handleActionClick(e, () => onEdit(ticket))}
                            className="p-2 text-yellow-500 rounded-full transition-colors hover:text-yellow-600 hover:bg-yellow-100"
                            title="ویرایش / مشاهده جزئیات"
                        >
                            <EditIcon />
                        </button>
                        <EditCountdown editableUntil={ticket.editableUntil} />
                    </>
                ) : (
                    <>
                        {ticket.status !== 'اتمام یافته' && canExtend && (
                            <button
                                onClick={handleExtendClick}
                                className="p-2 text-teal-600 rounded-full transition-colors hover:bg-teal-100"
                                title="تمدید زمان ویرایش (۳۰ دقیقه)"
                            >
                                <ClockPlusIcon />
                            </button>
                        )}
                        <div 
                            className="p-2 text-gray-400 cursor-pointer hover:bg-slate-100 rounded-full" 
                            title="مشاهده جزئیات (فقط خواندنی)"
                            onClick={(e) => handleActionClick(e, () => onEdit(ticket))}
                        >
                            <EditIcon />
                        </div>
                    </>
                )}
                
                 {currentUser.role === 'مدیر' && onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 text-red-500 rounded-full transition-colors hover:text-red-600 hover:bg-red-100"
                        title="حذف تیکت"
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmToggleWork}
                title={isRunning ? 'توقف و اتمام کار' : 'شروع کار'}
                message={isRunning ? stopWorkMessage : startWorkMessage}
                confirmText={isRunning ? 'بله، اتمام کار' : 'شروع کن'}
                confirmButtonColor={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            />
            
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="حذف تیکت"
                message={`آیا از حذف تیکت "${ticket.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
                confirmText="بله، حذف کن"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />

            <ConfirmationModal
                isOpen={isReopenConfirmOpen}
                onClose={() => setIsReopenConfirmOpen(false)}
                onConfirm={confirmReopen}
                title="به جریان انداختن مجدد تیکت"
                message={`آیا می خواهید تیکت "${ticket.title}" را مجدداً باز کنید؟ وضعیت آن به 'انجام نشده' تغییر خواهد کرد.`}
                confirmText="بله، باز کن"
                confirmButtonColor="bg-purple-600 hover:bg-purple-700"
            />
            
            <ConfirmationModal
                isOpen={isExtendConfirmOpen}
                onClose={() => setIsExtendConfirmOpen(false)}
                onConfirm={confirmExtend}
                title="تمدید زمان ویرایش"
                message={`آیا می‌خواهید زمان ویرایش تیکت "${ticket.title}" را برای ۳۰ دقیقه دیگر تمدید کنید؟`}
                confirmText="بله، تمدید کن"
                confirmButtonColor="bg-teal-600 hover:bg-teal-700"
            />
        </>
    );
};

export default TicketActions;