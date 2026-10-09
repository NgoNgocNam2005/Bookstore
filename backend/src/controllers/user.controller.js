import {
  changeUserPassword,
  getUserById,
  getUserProfile,
  listUsers,
  updateUserByAdmin,
  updateUserProfile
} from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMyProfile(request, response) {
  const user = await getUserProfile(request.user.id);

  return sendSuccess(response, { user });
}

export async function updateMyProfile(request, response) {
  const user = await updateUserProfile(
    request.user.id,
    request.body
  );

  return sendSuccess(response, { user });
}

export async function changeMyPassword(request, response) {
  const {
    currentPassword,
    newPassword
  } = request.body;

  await changeUserPassword(
    request.user.id,
    currentPassword,
    newPassword
  );

  return sendSuccess(response, {
    message: 'Password updated successfully'
  });
}

// Admin/Staff controllers
export async function listUsersController(request, response) {
  const result = await listUsers(request.validated.query);

  return sendSuccess(response, { items: result.items }, 200, result.meta);
}

export async function getUserByIdController(request, response) {
  const user = await getUserById(request.validated.params.id);

  return sendSuccess(response, { user });
}

export async function updateUserController(request, response) {
  const user = await updateUserByAdmin(
    request.validated.params.id,
    request.body
  );

  return sendSuccess(response, { user });
}
