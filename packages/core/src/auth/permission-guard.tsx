import type { ReactNode } from 'react';
import { useAuth } from './use-auth';
import { usePermissions } from './use-permissions';

export interface PermissionGuardProps {
  permission?: string;
  role?: string;
  check?: (ctx: { permissions: string[]; roles: string[] }) => boolean;
  children: ReactNode;
  loading?: ReactNode;
  fallbackUrl?: string;
  fallback?: ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  check,
  children,
  loading = null,
  fallbackUrl = '/unauthorized',
  fallback,
}: PermissionGuardProps) {
  const { isLoading } = useAuth();
  const perms = usePermissions();

  if (isLoading) return <>{loading}</>;

  let allowed = false;
  if (check) {
    allowed = check({ permissions: perms.permissions, roles: perms.roles });
  } else if (permission) {
    allowed = perms.can(permission);
  } else if (role) {
    allowed = perms.hasRole(role);
  }

  if (!allowed) {
    if (fallback !== undefined) return <>{fallback}</>;
    window.location.href = fallbackUrl;
    return null;
  }

  return <>{children}</>;
}
