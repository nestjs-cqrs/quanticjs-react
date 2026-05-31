import type { ReactNode } from 'react';
import { useAuth } from './use-auth';

export interface AuthGuardProps {
  children: ReactNode;
  loading?: ReactNode;
  loginUrl?: string;
  preserveReturnTo?: boolean;
  onUnauthenticated?: () => void;
}

export function AuthGuard({
  children,
  loading = null,
  loginUrl = '/auth/login',
  preserveReturnTo = true,
  onUnauthenticated,
}: AuthGuardProps) {
  const { session, isLoading, error } = useAuth();

  if (isLoading) return <>{loading}</>;

  if (error || !session) {
    onUnauthenticated?.();
    const target = preserveReturnTo
      ? `${loginUrl}?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
      : loginUrl;
    window.location.href = target;
    return null;
  }

  return <>{children}</>;
}
