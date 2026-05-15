import { ApiError, type ProblemDetails } from './error';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RequestContext {
  url: string;
  init: RequestInit;
}

export type RequestInterceptor = (
  ctx: RequestContext,
) => RequestContext | Promise<RequestContext>;

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface AuthConfig {
  refresh: () => Promise<void>;
  onRefreshFailure?: () => void;
}

export interface ClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  interceptors?: RequestInterceptor[];
  auth?: AuthConfig;
  fetch?: typeof globalThis.fetch;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
  upload<T>(
    path: string,
    data: FormData,
    options?: RequestOptions,
  ): Promise<T>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const url = `${base.replace(/\/+$/, '')}${path}`;
  if (!params) return url;

  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val != null) qs.set(key, String(val));
  }
  const str = qs.toString();
  return str ? `${url}?${str}` : url;
}

async function parseError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails;
  try {
    problem = await response.json();
  } catch {
    problem = {
      type: `https://httpproblems.com/${response.status}`,
      title: response.statusText || 'Request Failed',
      status: response.status,
    };
  }
  return new ApiError(response.status, problem);
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createClient(config: ClientConfig): ApiClient {
  const {
    baseUrl,
    credentials = 'include',
    headers: defaultHeaders = {},
    interceptors = [],
    auth,
    fetch: fetchFn = globalThis.fetch,
  } = config;

  let refreshPromise: Promise<void> | null = null;

  async function execute<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
    isRetry = false,
  ): Promise<T> {
    const url = buildUrl(baseUrl, path, options?.params);
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...options?.headers,
    };

    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    let ctx: RequestContext = {
      url,
      init: {
        method,
        credentials,
        headers,
        signal: options?.signal,
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      },
    };

    for (const interceptor of interceptors) {
      ctx = await interceptor(ctx);
    }

    let response: Response;
    try {
      response = await fetchFn(ctx.url, ctx.init);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(0, {
        type: 'https://arex.dev/errors/NETWORK_ERROR',
        title: 'Network Error',
        status: 0,
        detail: err instanceof Error ? err.message : 'Request failed',
      });
    }

    if (!response.ok) {
      const error = await parseError(response);

      if (error.isUnauthorized && auth && !isRetry) {
        try {
          refreshPromise ??= auth
            .refresh()
            .finally(() => (refreshPromise = null));
          await refreshPromise;
          return execute<T>(method, path, body, options, true);
        } catch {
          auth.onRefreshFailure?.();
          throw error;
        }
      }

      throw error;
    }

    return parseBody<T>(response);
  }

  return {
    get: <T>(path: string, opts?: RequestOptions) =>
      execute<T>('GET', path, undefined, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      execute<T>('POST', path, body, opts),
    put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
      execute<T>('PUT', path, body, opts),
    patch: <T>(path: string, body: unknown, opts?: RequestOptions) =>
      execute<T>('PATCH', path, body, opts),
    delete: <T>(path: string, opts?: RequestOptions) =>
      execute<T>('DELETE', path, undefined, opts),
    upload: <T>(path: string, data: FormData, opts?: RequestOptions) =>
      execute<T>('POST', path, data, opts),
  };
}
