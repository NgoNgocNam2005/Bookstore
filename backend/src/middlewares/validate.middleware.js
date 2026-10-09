import { AppError } from '../utils/app-error.js';

export function validate(schema) {
  return (request, _response, next) => {
    if (!schema || typeof schema.safeParse !== 'function') {
      return next(
        new AppError(
          'Invalid validation schema',
          500,
          'INVALID_VALIDATION_SCHEMA'
        )
      );
    }

    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query
    });

    if (!result.success) {
      return next(
        new AppError(
          'Request validation failed',
          400,
          'VALIDATION_ERROR',
          result.error.issues
        )
      );
    }

    request.validated = result.data;
    request.body = result.data.body;

    return next();
  };
}
