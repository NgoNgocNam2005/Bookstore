import { Router } from 'express';
import {
  changeMyPassword,
  getMyProfile,
  getUserByIdController,
  listUsersController,
  updateMyProfile,
  updateUserController
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  adminUpdateUserSchema,
  changePasswordSchema,
  listUsersSchema,
  updateProfileSchema,
  userIdSchema
} from '../validators/user.validator.js';

const router = Router();
const canManageUsers = requireRoles('admin', 'staff');

router.get('/me', authMiddleware, asyncHandler(getMyProfile));

router.patch(
  '/me',
  authMiddleware,
  validate(updateProfileSchema),
  asyncHandler(updateMyProfile)
);

router.patch(
  '/me/password',
  authMiddleware,
  validate(changePasswordSchema),
  asyncHandler(changeMyPassword)
);

// Admin/Staff routes
router.get(
  '/',
  authMiddleware,
  canManageUsers,
  validate(listUsersSchema),
  asyncHandler(listUsersController)
);

router.get(
  '/:id',
  authMiddleware,
  canManageUsers,
  validate(userIdSchema),
  asyncHandler(getUserByIdController)
);

router.patch(
  '/:id',
  authMiddleware,
  canManageUsers,
  validate(adminUpdateUserSchema),
  asyncHandler(updateUserController)
);

export default router;
