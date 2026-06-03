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
      .then(async (res) => {
        try {
          const data = await res.json() as { endSessionUrl?: string };
          if (data.endSessionUrl) {
            window.location.href = data.endSessionUrl;
            return;
          }
        } catch {
          // response not JSON — fall through to default redirect
        }
        window.location.href = redirectUrl;
      })
      .catch(() => {
        window.location.href = redirectUrl;
      });
  }, [logoutUrl, redirectUrl, confirmOpt]);

  return { logout, isLoggingOut };
}
