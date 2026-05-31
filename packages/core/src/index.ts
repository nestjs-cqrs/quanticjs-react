export {
  ErrorType,
  ApiError,
  isApiError,
  type ProblemDetails,
  type ValidationFieldError,
} from './error';

export {
  createClient,
  type ApiClient,
  type ClientConfig,
  type AuthConfig,
  type RequestContext,
  type RequestInterceptor,
  type RequestOptions,
} from './client';

export { correlationId, tenantId, bearerAuth } from './interceptors';

export { QuanticProvider, useClient, type QuanticProviderProps } from './react';

export {
  createDefaultClient,
  type DefaultClientOptions,
} from './default-client';

export { useAuth, type AuthSession, type UseAuthOptions } from './auth/use-auth';
export { useLogout, type UseLogoutOptions } from './auth/use-logout';
export { usePermissions } from './auth/use-permissions';
export { Can, type CanProps } from './auth/can';
export { AuthGuard, type AuthGuardProps } from './auth/auth-guard';
export {
  PermissionGuard,
  type PermissionGuardProps,
} from './auth/permission-guard';
