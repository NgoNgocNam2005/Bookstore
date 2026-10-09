import { findActiveUserById } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  getBearerToken,
  verifyAccessToken
} from '../utils/jwt.js';

export const authMiddleware = asyncHandler(
  async (request, _response, next) => {
    const token = getBearerToken(request);

    if (!token) {
      throw new AppError(
        'Authentication token is required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(
        'Invalid or expired authentication token',
        401,
        'INVALID_TOKEN'
      );
    }

    const user = await findActiveUserById(payload.sub);

    if (!user) {
      throw new AppError(
        'User not found or inactive',
        401,
        'USER_NOT_FOUND'
      );
    }

    request.user = user;
    request.auth = payload;

    next();
  }
);
