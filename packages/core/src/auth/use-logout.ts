import { useState, useCallback } from 'react';

export interface UseLogoutOptions {
  logoutUrl?: string;
  redirectUrl?: string;
  csrfCookieName?: string;
  confirm?: boolean | string;
}

function readCsrfToken(cookieName: string): string | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]+)`),
  );
  return match?.[1];
}

export function useLogout(options?: UseLogoutOptions) {
  const {
    logoutUrl = '/api/auth/logout',
    redirectUrl = '/api/auth/login',
    csrfCookieName = 'csrf',
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

    const headers: Record<string, string> = {};
    const csrf =
      readCsrfToken(csrfCookieName) ?? readCsrfToken('__Host-csrf');
    if (csrf) headers['X-CSRF-Token'] = csrf;

    fetch(logoutUrl, { method: 'POST', credentials: 'include', headers })
      .then(async (res) => {
        try {
          const data = (await res.json()) as { endSessionUrl?: string };
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
  }, [logoutUrl, redirectUrl, csrfCookieName, confirmOpt]);

  return { logout, isLoggingOut };
}
