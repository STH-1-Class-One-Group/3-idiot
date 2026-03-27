import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/50 bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-center sm:px-6 sm:py-10 md:flex-row md:items-center md:justify-between md:text-left lg:px-8 lg:py-12">
        <div className="font-['Inter'] text-xs text-slate-500 dark:text-slate-400">
          2024 Modern Sentinel Military Services. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
          <button
            type="button"
            className="text-xs text-slate-500 opacity-80 transition-opacity hover:text-blue-600 hover:opacity-100 dark:text-slate-400 dark:hover:text-blue-300"
          >
            Terms
          </button>
          <button
            type="button"
            className="text-xs text-slate-500 opacity-80 transition-opacity hover:text-blue-600 hover:opacity-100 dark:text-slate-400 dark:hover:text-blue-300"
          >
            Privacy
          </button>
          <button
            type="button"
            className="text-xs text-slate-500 opacity-80 transition-opacity hover:text-blue-600 hover:opacity-100 dark:text-slate-400 dark:hover:text-blue-300"
          >
            Support
          </button>
        </div>
      </div>
    </footer>
  );
};
