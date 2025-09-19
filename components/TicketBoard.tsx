// Fix: Created TicketBoard component
import React from 'react';
import { Ticket } from '../types';
import TicketCard from './TicketCard';

interface TicketBoardProps {
    tickets: Ticket[];
}

const TicketBoard: React.FC<TicketBoardProps> = ({ tickets }) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            {tickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </div>
    );
};

export default TicketBoard;
