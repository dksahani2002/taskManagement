export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
