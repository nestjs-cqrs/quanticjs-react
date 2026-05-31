import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface AuthSession {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions?: string[];
  keycloakId?: string;
  role?: string;
  username?: string;
}

export interface UseAuthOptions {
  endpoint?: string;
}

export function useAuth(options?: UseAuthOptions) {
  const endpoint = options?.endpoint ?? '/auth/me';

  const { data, isLoading, error } = useQuery<AuthSession>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const res = await fetch(endpoint, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Auth check failed: ${res.status}`);
      }
      return res.json();
    },
    retry: false,
    staleTime: Infinity,
  });

  const session = useMemo(() => {
    if (!data) return undefined;
    return { ...data, permissions: data.permissions ?? [] };
  }, [data]);

  return {
    session,
    isLoading,
    error: error ?? undefined,
    isAuthenticated: !!session,
    isAdmin: session?.roles?.includes('admin') ?? false,
  };
}
