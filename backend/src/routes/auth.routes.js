import { Router } from 'express';
import {
  getCurrentUser,
  loginController
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(loginController)
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(getCurrentUser)
);

export default router;
