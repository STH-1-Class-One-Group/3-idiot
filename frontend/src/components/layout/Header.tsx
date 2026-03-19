import React from 'react';

export const Header: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-[0_12px_40px_rgba(27,28,28,0.06)] flex justify-between items-center px-8 h-16 max-w-full">
      <div className="text-xl font-bold tracking-tighter text-blue-800 dark:text-blue-300">
        Modern Sentinel
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a
          className="text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 font-['Inter'] text-sm tracking-tight"
          href="#"
        >
          Dashboard
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
          href="#"
        >
          Shopping
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
          href="#"
        >
          Diet
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
          href="#"
        >
          Recruitment
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
          href="#"
        >
          Community
        </a>
      </div>
      <div className="flex items-center space-x-4">
        <span
          className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-blue-600 transition-all"
        >
          dark_mode
        </span>
        <span
          className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-blue-600 transition-all"
        >
          confirmation_number
        </span>
        <span
          className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-blue-600 transition-all"
        >
          shopping_cart
        </span>
        <span
          className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-blue-600 transition-all"
        >
          account_circle
        </span>
      </div>
    </nav>
  );
};
