import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { LoginModal } from '../common/LoginModal';
import { CartIcon } from '../../features/cart/components/CartIcon';

// ── Props 인터페이스 ──────────────────────────────────────────
interface HeaderProps {
  user: User | null;       
  onSignOut: () => void;   
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = () => setIsDropdownOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    onSignOut(); 
  };

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string)
    || user?.email
    || '사용자';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-[0_12px_40px_rgba(27,28,28,0.06)] flex justify-between items-center px-8 h-16 max-w-full transition-colors">
        <div className="text-xl font-bold tracking-tighter text-blue-800 dark:text-blue-300">
          Modern Sentinel
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 font-['Inter'] text-sm tracking-tight"
                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
            }
          >
            Shopping
          </NavLink>
          <NavLink
            to="/Dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 font-['Inter'] text-sm tracking-tight"
                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight"
            }
          >
            Dashboard
          </NavLink>
          <a className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight" href="#">
            Armed Reserve
          </a>
          <a className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight" href="#">
            Recruitment
          </a>
          <a className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-['Inter'] text-sm tracking-tight" href="#">
            Community
          </a>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition-all">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition-all">
            confirmation_number
          </span>

          {/* ✅ 이 위치의 장바구니 아이콘은 내부에서 useCart()를 사용하여 실시간 숫자를 보여줍니다 */}
          <CartIcon />

          {user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-500 hover:ring-blue-400 transition-all"
                aria-label="프로필 메뉴"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {initial}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">로그인됨</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {displayName}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="로그인"
            >
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition-all">
                account_circle
              </span>
            </button>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};