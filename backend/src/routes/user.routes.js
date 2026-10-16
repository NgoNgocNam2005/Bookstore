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
import rateLimit from 'express-rate-limit';
import {
  createUserInvitationController,
  resendUserInvitationController
} from '../controllers/user-invitation.controller.js';
import {
  createUserInvitationSchema,
  resendInvitationSchema
} from '../validators/user-invitation.validator.js';


const router = Router();
const canCreateUsers = requireRoles('admin', 'editor', 'staff');
const canManageUsers = requireRoles('admin');
const invitationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});


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

router.post(
  '/', 
  authMiddleware,
  canCreateUsers,
  invitationLimiter,
  validate(createUserInvitationSchema),
  asyncHandler(createUserInvitationController)
);

router.post(
  '/:id/resend-invitation',
  authMiddleware,
  canCreateUsers,
  invitationLimiter,
  validate(resendInvitationSchema),
  asyncHandler(resendUserInvitationController)
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
