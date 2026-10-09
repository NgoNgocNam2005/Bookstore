import env from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function notFoundHandler(request, _response, next) {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404, 'NOT_FOUND'));
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 && env.nodeEnv === 'production'
        ? 'Internal server error'
        : error.message
    }
  };

  if (error.details !== undefined) {
    payload.error.details = error.details;
  }

  return response.status(statusCode).json(payload);
}
