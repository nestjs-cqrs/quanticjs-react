import { Fragment, createElement, type ReactNode } from 'react';
import { usePermissions } from './use-permissions';

export interface CanProps {
  permission?: string;
  resource?: unknown;
  role?: string;
  check?: (ctx: { permissions: string[]; roles: string[] }) => boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({
  permission,
  resource,
  role,
  check,
  children,
  fallback = null,
}: CanProps) {
  const perms = usePermissions();

  let allowed = false;
  if (check) {
    allowed = check({ permissions: perms.permissions, roles: perms.roles });
  } else if (permission) {
    allowed = perms.can(permission, resource);
  } else if (role) {
    allowed = perms.hasRole(role);
  }

  return createElement(Fragment, null, allowed ? children : fallback);
}
