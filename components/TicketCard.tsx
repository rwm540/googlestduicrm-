// Fix: Created TicketCard component
import React from 'react';
import { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow border">
            <h4 className="font-bold">{ticket.title}</h4>
            <p className="text-sm text-gray-500">{ticket.ticketNumber}</p>
        </div>
    );
};

export default TicketCard;
