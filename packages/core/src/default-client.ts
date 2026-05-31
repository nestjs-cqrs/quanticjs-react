import { createClient, type ApiClient, type RequestInterceptor } from './client';
import { correlationId } from './interceptors';

export interface DefaultClientOptions {
  baseUrl?: string;
  interceptors?: RequestInterceptor[];
  loginUrl?: string;
  refreshUrl?: string;
  disableAuth?: boolean;
}

export function createDefaultClient(options?: DefaultClientOptions): ApiClient {
  const {
    baseUrl = '/api',
    interceptors: extra = [],
    loginUrl = '/auth/login',
    refreshUrl = '/auth/refresh',
    disableAuth = false,
  } = options ?? {};

  return createClient({
    baseUrl,
    credentials: 'include',
    interceptors: [correlationId(), ...extra],
    auth: disableAuth
      ? undefined
      : {
          refresh: () =>
            fetch(refreshUrl, {
              method: 'POST',
              credentials: 'include',
            }).then((r) => {
              if (!r.ok) throw r;
            }),
          onRefreshFailure: () => {
            const returnTo = encodeURIComponent(
              window.location.pathname + window.location.search,
            );
            window.location.href = `${loginUrl}?returnTo=${returnTo}`;
          },
        },
  });
}
