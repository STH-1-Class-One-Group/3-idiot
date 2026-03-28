import React, { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { consumePostLoginPath } from './authRedirect';

interface AuthRedirectHandlerProps {
  user: User | null | undefined;
}

export const AuthRedirectHandler: React.FC<AuthRedirectHandlerProps> = ({
  user,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    const pendingPath = consumePostLoginPath();
    if (!pendingPath) {
      return;
    }

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (pendingPath === currentPath) {
      return;
    }

    navigate(pendingPath, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate, user]);

  return null;
};
