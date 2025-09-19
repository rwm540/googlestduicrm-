import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { toPersianDigits, formatSecondsToTime } from '../utils/dateFormatter';
import { EditIcon } from './icons/EditIcon';
import { UserCheckIcon } from './icons/UserCheckIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { ClockIcon } from './icons/ClockIcon';

interface TicketActionsProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onRefer: (ticket: Ticket) => void;
  onToggleWork: (ticketId: number) => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({ ticket, onEdit, onRefer, onToggleWork }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    const isRunning = ticket.status === 'در حال پیگیری';
    const isEditable = new Date().getTime() < new Date(ticket.editableUntil).getTime();
    
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

    const totalDuration = ticket.totalWorkDuration + elapsedTime;

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
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
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
            <button
                onClick={(e) => handleActionClick(e, () => onToggleWork(ticket.id))}
                className={`p-2 rounded-full transition-colors ${isRunning ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                title={isRunning ? 'توقف کار' : 'شروع کار'}
            >
                {isRunning ? <StopIcon /> : <PlayIcon />}
            </button>
            
            <div className="text-sm text-gray-500 p-2 font-mono" title="زمان کل / زمان این جلسه">
                {toPersianDigits(formatSecondsToTime(totalDuration))}
                {isRunning && <span className="text-xs opacity-70"> ({toPersianDigits(formatSecondsToTime(elapsedTime))})</span>}
            </div>
            
            <button
                onClick={(e) => handleActionClick(e, () => onRefer(ticket))}
                className="p-2 text-blue-500 rounded-full transition-colors hover:text-blue-600 hover:bg-blue-100"
                title="ارجاع به کاربر دیگر"
            >
                <UserCheckIcon />
            </button>

            {isEditable ? (
                <button
                    onClick={(e) => handleActionClick(e, () => onEdit(ticket))}
                    className="p-2 text-yellow-500 rounded-full transition-colors hover:text-yellow-600 hover:bg-yellow-100"
                    title="ویرایش / مشاهده جزئیات"
                >
                    <EditIcon />
                </button>
            ) : (
                 <div className="p-2 text-gray-300 cursor-not-allowed" title="زمان ویرایش به پایان رسیده است">
                    <EditIcon />
                </div>
            )}
        </div>
    );
};

export default TicketActions;
