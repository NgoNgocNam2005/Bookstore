import { Router } from 'express';
import {
  createBookCopyController,
  getBookCopyController,
  listBookCopiesController,
  updateBookCopyStatusController
} from '../controllers/book-copy.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  bookCopyIdSchema,
  createBookCopySchema,
  listBookCopiesSchema,
  updateBookCopyStatusSchema
} from '../validators/book-copy.validator.js';

const router = Router();
const canManageBookCopies = requireRoles('admin', 'staff');

router.use(authMiddleware);
router.use(canManageBookCopies);

router.get(
  '/',
  validate(listBookCopiesSchema),
  asyncHandler(listBookCopiesController)
);

router.get(
  '/:id',
  validate(bookCopyIdSchema),
  asyncHandler(getBookCopyController)
);

router.post(
  '/',
  validate(createBookCopySchema),
  asyncHandler(createBookCopyController)
);

router.patch(
  '/:id/status',
  validate(updateBookCopyStatusSchema),
  asyncHandler(updateBookCopyStatusController)
);

export default router;
