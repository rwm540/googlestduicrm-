

import React, { useState, useEffect } from 'react';
import { Ticket, User, UserRole } from '../types';
import { toPersianDigits, formatSecondsToTime } from '../utils/dateFormatter';
import { EditIcon } from './icons/EditIcon';
import { UserCheckIcon } from './icons/UserCheckIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { ClockIcon } from './icons/ClockIcon';
import ConfirmationModal from './ConfirmationModal';

interface TicketActionsProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onRefer: (ticket: Ticket) => void;
  onToggleWork: (ticketId: number) => void;
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


const TicketActions: React.FC<TicketActionsProps> = ({ ticket, onEdit, onRefer, onToggleWork, currentUser }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isStillEditable, setIsStillEditable] = useState(new Date().getTime() < new Date(ticket.editableUntil).getTime());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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

    if (ticket.status === 'اتمام یافته' || ticket.status === 'ارجاع شده') {
        return (
            <div className="flex items-center justify-end gap-2 text-sm text-gray-500" title="زمان کل صرف شده">
                <ClockIcon className="h-4 w-4" />
                <span className="font-mono">{toPersianDigits(formatSecondsToTime(ticket.totalWorkDuration))}</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                <button
                    onClick={handleToggleWorkClick}
                    className={`p-2 rounded-full transition-colors ${isRunning ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                    title={isRunning ? 'توقف کار' : 'شروع کار'}
                >
                    {isRunning ? <StopIcon /> : <PlayIcon />}
                </button>
                
                <div className="text-sm text-gray-500 p-2 font-mono" title="زمان کل / زمان این جلسه">
                    {toPersianDigits(formatSecondsToTime(totalDuration))}
                    {isRunning && <span className="text-xs opacity-70"> ({toPersianDigits(formatSecondsToTime(elapsedTime))})</span>}
                </div>
                
                {!isSpecialist(currentUser.role) && (
                    <button
                        onClick={(e) => handleActionClick(e, () => onRefer(ticket))}
                        className="p-2 text-blue-500 rounded-full transition-colors hover:text-blue-600 hover:bg-blue-100"
                        title="ارجاع به کاربر دیگر"
                    >
                        <UserCheckIcon />
                    </button>
                )}

                {isStillEditable ? (
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
                    <div className="p-2 text-gray-300 cursor-not-allowed" title="زمان ویرایش به پایان رسیده است">
                        <EditIcon />
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmToggleWork}
                title={isRunning ? 'توقف کار' : 'شروع کار'}
                message={`آیا از ${isRunning ? 'توقف' : 'شروع'} کار روی این تیکت اطمینان دارید؟`}
                confirmText={isRunning ? 'توقف کن' : 'شروع کن'}
                confirmButtonColor={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            />
        </>
    );
};

export default TicketActions;
