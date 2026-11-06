/**
 * Domain error types for LendLoop.
 *
 * These are plain classes (not framework errors) so the domain layer stays
 * free of Convex imports. Handlers/services translate these into Convex
 * `ConvexError`s with appropriate status codes at the boundary.
 *
 * @see convex/security/AccessControl.ts for usage.
 */

/** Base class for all expected, user-facing app errors. */
export class AppError extends Error {
  /** Suggested HTTP-style status code for the boundary to use. */
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

/** Caller is not authenticated at all. */
export class Unauthenticated extends AppError {
  constructor(message = 'You must be signed in to do that.') {
    super(message, 401);
  }
}

/** Caller is authenticated but not allowed to perform the action. */
export class Forbidden extends AppError {
  constructor(message = "You don't have permission to do that.") {
    super(message, 403);
  }
}

/** Referenced resource does not exist. */
export class NotFound extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 404);
  }
}

/** Input failed validation. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

/** Request conflicts with current state (e.g. overlapping loan). */
export class Conflict extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Narrow helper: rethrow an unknown value as an AppError if it isn't already.
 * Useful at the service boundary where a repository might throw raw errors.
 */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError(err.message);
  return new AppError('An unexpected error occurred.');
}
