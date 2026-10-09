import { AppError } from '../utils/app-error.js';

export function requireRoles(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(
        new AppError(
          'You do not have permission to access this resource',
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
