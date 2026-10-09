import { login } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { toPublicUser } from '../utils/user.js';

export async function loginController(request, response) {
  const result = await login(request.body);

  return sendSuccess(response, result);
}

export function getCurrentUser(request, response) {
  return sendSuccess(response, {
    user: toPublicUser(request.user)
  });
}
