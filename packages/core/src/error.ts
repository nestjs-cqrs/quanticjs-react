export enum ErrorType {
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
  Conflict = 'CONFLICT',
  ValidationError = 'VALIDATION_ERROR',
  InternalError = 'INTERNAL_ERROR',
  Unauthorized = 'UNAUTHORIZED',
  UnprocessableEntity = 'UNPROCESSABLE_ENTITY',
  RateLimited = 'RATE_LIMITED',
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  retryAfter?: number;
  errors?: ValidationFieldError[];
}

export interface ValidationFieldError {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public readonly title: string;
  public readonly detail: string | undefined;
  public readonly correlationId: string | undefined;
  public readonly validationErrors: ValidationFieldError[] | undefined;
  public readonly retryAfter: number | undefined;
  public readonly errorType: ErrorType | undefined;
  public readonly instance: string | undefined;

  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.title = problem.title;
    this.detail = problem.detail;
    this.correlationId = problem.correlationId;
    this.validationErrors = problem.errors;
    this.retryAfter = problem.retryAfter;
    this.instance = problem.instance;
    this.errorType = resolveErrorType(problem.type);
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get fieldErrors(): Record<string, string[]> {
    if (!this.validationErrors) return {};
    const map: Record<string, string[]> = {};
    for (const err of this.validationErrors) {
      const key = err.field ?? '_root';
      (map[key] ??= []).push(err.message);
    }
    return map;
  }

  hasFieldError(field: string): boolean {
    return this.validationErrors?.some((e) => e.field === field) ?? false;
  }

  getFieldErrors(field: string): string[] {
    return (
      this.validationErrors
        ?.filter((e) => e.field === field)
        .map((e) => e.message) ?? []
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function resolveErrorType(type: string): ErrorType | undefined {
  const slug = type.split('/').pop();
  return Object.values(ErrorType).find((e) => e === slug) as
    | ErrorType
    | undefined;
}
