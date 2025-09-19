import React from 'react';
import { UsersIcon } from './components/icons/UsersIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import Avatar from './components/Avatar';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isSidebarOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'داشبورد', icon: <HomeIcon /> },
    { id: 'customers', label: 'مشتریان', icon: <UsersIcon /> },
    { id: 'users', label: 'کاربران', icon: <UsersIcon /> },
    { id: 'contracts', label: 'قرارداد ها', icon: <DocumentTextIcon /> },
    { id: 'tickets', label: 'تیکت', icon: <DocumentTextIcon /> },
    { id: 'reports', label: 'گزارشات', icon: <DocumentTextIcon /> },
  ];

  return (
    <aside className={`bg-white text-slate-600 flex flex-col h-full transition-all duration-300 ease-in-out border-l border-gray-200 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center border-b border-gray-200 h-20 ${isSidebarOpen ? 'px-4 justify-between' : 'px-4 justify-center'}`}>
        {isSidebarOpen && <h1 className="font-bold text-xl text-slate-800">داشبورد</h1>}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex-shrink-0`}></div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
              activePage === item.id
                ? 'bg-cyan-500/10 text-cyan-600 font-semibold'
                : 'hover:bg-slate-100 hover:text-slate-900'
            } ${!isSidebarOpen && 'justify-center'}`}
            title={item.label}
          >
            <span className="text-cyan-500">{item.icon}</span>
            {isSidebarOpen && <span className="mr-4">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
          <Avatar name="Admin User" />
          {isSidebarOpen && (
            <div className="mr-3 flex-1 overflow-hidden">
              <p className="font-semibold text-slate-800 text-sm truncate">کاربر ادمین</p>
              <p className="text-xs text-gray-500 truncate">مدیر سیستم</p>
            </div>
          )}
          {isSidebarOpen && <button className="text-gray-500 hover:text-slate-900 flex-shrink-0"><ChevronDownIcon /></button>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
