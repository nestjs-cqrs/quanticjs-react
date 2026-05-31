import { useState, useCallback } from 'react';

export interface UseLogoutOptions {
  logoutUrl?: string;
  redirectUrl?: string;
  confirm?: boolean | string;
}

export function useLogout(options?: UseLogoutOptions) {
  const {
    logoutUrl = '/auth/logout',
    redirectUrl = '/auth/login',
    confirm: confirmOpt = false,
  } = options ?? {};

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    if (confirmOpt) {
      const message =
        typeof confirmOpt === 'string'
          ? confirmOpt
          : 'Are you sure you want to logout?';
      if (!window.confirm(message)) return;
    }
    setIsLoggingOut(true);
    fetch(logoutUrl, { method: 'POST', credentials: 'include' })
      .catch(() => {})
      .finally(() => {
        window.location.href = redirectUrl;
      });
  }, [logoutUrl, redirectUrl, confirmOpt]);

  return { logout, isLoggingOut };
}
