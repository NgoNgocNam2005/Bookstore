import { Router } from 'express';
import {
  getCurrentUser,
  loginController
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema } from '../validators/auth.validator.js';
import rateLimit from 'express-rate-limit';
import { activateAccountController } from '../controllers/user-invitation.controller.js';
import { activateAccountSchema } from '../validators/user-invitation.validator.js';
const router = Router();
const activationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(loginController)
);

router.post(
  '/activate-account',
  activationLimiter,
  validate(activateAccountSchema),
  asyncHandler(activateAccountController)
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(getCurrentUser)
);

export default router;
