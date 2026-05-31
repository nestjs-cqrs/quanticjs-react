import { useAuth } from './use-auth';

export function usePermissions() {
  const { session } = useAuth();
  const permissions = session?.permissions ?? [];
  const roles = session?.roles ?? [];

  return {
    can: (permission: string, _resource?: unknown) =>
      permissions.includes(permission),
    canAny: (...perms: string[]) => perms.some((p) => permissions.includes(p)),
    canAll: (...perms: string[]) =>
      perms.every((p) => permissions.includes(p)),
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (...r: string[]) => r.some((role) => roles.includes(role)),
    permissions,
    roles,
  };
}
