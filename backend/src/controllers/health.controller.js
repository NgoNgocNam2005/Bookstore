import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getHealth(_request, response, next) {
  try {
    return sendSuccess(response, await getHealthStatus());
  } catch (error) {
    return next(error);
  }
}
