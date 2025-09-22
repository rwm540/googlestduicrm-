import React from 'react';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
    pageTitle: string;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onToggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between lg:hidden flex-shrink-0 z-20">
            <button onClick={onToggleSidebar} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100">
                <MenuIcon />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
            <div className="w-6"></div> {/* Spacer to balance the title */}
        </header>
    );
};
export default Header;