import type { RequestInterceptor } from './client';

export function correlationId(): RequestInterceptor {
  return (ctx) => ({
    ...ctx,
    init: {
      ...ctx.init,
      headers: {
        ...(ctx.init.headers as Record<string, string>),
        'X-Correlation-ID': crypto.randomUUID(),
      },
    },
  });
}

export function tenantId(
  getTenantId: () => string | null | undefined,
): RequestInterceptor {
  return (ctx) => {
    const id = getTenantId();
    if (!id) return ctx;
    return {
      ...ctx,
      init: {
        ...ctx.init,
        headers: {
          ...(ctx.init.headers as Record<string, string>),
          'X-Tenant-ID': id,
        },
      },
    };
  };
}

export function bearerAuth(
  getToken: () => string | null | undefined,
): RequestInterceptor {
  return (ctx) => {
    const token = getToken();
    if (!token) return ctx;
    return {
      ...ctx,
      init: {
        ...ctx.init,
        headers: {
          ...(ctx.init.headers as Record<string, string>),
          Authorization: `Bearer ${token}`,
        },
      },
    };
  };
}
