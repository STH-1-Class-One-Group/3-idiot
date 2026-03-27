import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

import { LoginModal } from '../common/LoginModal';
import { MyCouponModal } from '../common/MyCouponModal';
import { ProfileAvatar } from '../common/ProfileAvatar';
import { Profile } from '../common/ProfileSetupModal';
import { CartIcon } from '../../features/cart/components/CartIcon';

const brandLogoSrc = `${process.env.PUBLIC_URL}/logo.png`;

interface HeaderProps {
  user: User | null;
  profile: Profile | null;
  onSignOut: () => Promise<void> | void;
}

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "border-b-2 border-blue-600 pb-1 font-['Inter'] text-sm tracking-tight text-blue-700 dark:border-blue-400 dark:text-blue-400"
    : "font-['Inter'] text-sm tracking-tight text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300";

export const Header: React.FC<HeaderProps> = ({ user, profile, onSignOut }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    return false;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMyCouponModalOpen, setIsMyCouponModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSignOut = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDropdownOpen(false);
    await onSignOut();
  };

  const displayName =
    profile?.nickname || (user?.user_metadata?.full_name as string) || user?.email || '사용자';

  return (
    <>
      <nav className="fixed top-0 z-50 flex h-16 w-full max-w-full items-center justify-between bg-white/80 px-8 shadow-[0_12px_40px_rgba(27,28,28,0.06)] backdrop-blur-lg transition-colors dark:bg-slate-900/80">
        <NavLink to="/" className="flex shrink-0 items-center" aria-label="홈으로 이동">
          <img src={brandLogoSrc} alt="TeamC service logo" className="h-12 w-auto object-contain" />
          <span className="sr-only">TeamC</span>
        </NavLink>

        <div className="hidden items-center space-x-8 md:flex">
          <NavLink to="/" className={navLinkClassName}>
            쇼핑
          </NavLink>
          <NavLink to="/Dashboard" className={navLinkClassName}>
            대시보드
          </NavLink>
          <NavLink to="/armed-reseve" className={navLinkClassName}>
            예비군
          </NavLink>
          <a
            className="font-['Inter'] text-sm tracking-tight text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
            href="#"
          >
            모집정보
          </a>
          <NavLink to="/Community" className={navLinkClassName}>
            커뮤니티
          </NavLink>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined cursor-pointer text-slate-500 transition-all hover:text-blue-600 dark:text-slate-400">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <span
            className="material-symbols-outlined cursor-pointer text-slate-500 transition-all hover:text-blue-600 dark:text-slate-400"
            onClick={() => setIsMyCouponModalOpen(true)}
          >
            confirmation_number
          </span>

          <CartIcon />

          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
                className="flex items-center justify-center rounded-full ring-2 ring-blue-500 transition-all hover:ring-blue-400"
                aria-label="프로필 메뉴"
              >
                <ProfileAvatar
                  nickname={displayName}
                  rank={profile?.rank}
                  avatar_url={profile?.avatar_url}
                  containerClassName="h-9 w-9 overflow-hidden rounded-full"
                />
              </button>

              {isDropdownOpen ? (
                <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">로그인됨</p>
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {displayName}
                    </p>
                    {profile?.rank ? (
                      <p className="mt-0.5 text-xs text-primary">
                        {profile.rank}
                        {profile.unit ? ` · ${profile.unit}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    로그아웃
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="로그인"
            >
              <span className="material-symbols-outlined cursor-pointer text-slate-500 transition-all hover:text-blue-600 dark:text-slate-400">
                account_circle
              </span>
            </button>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <MyCouponModal isOpen={isMyCouponModalOpen} onClose={() => setIsMyCouponModalOpen(false)} />
    </>
  );
};
