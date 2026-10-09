import { Router } from 'express';
import {
  createBookController,
  deleteBookController,
  getBookController,
  listBooksController,
  updateBookController
} from '../controllers/book.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  bookIdSchema,
  createBookSchema,
  listBooksSchema,
  updateBookSchema
} from '../validators/book.validator.js';

const router = Router();
const canManageBooks = requireRoles('admin', 'editor', 'staff');

router.use(authMiddleware);

router.get(
  '/',
  validate(listBooksSchema),
  asyncHandler(listBooksController)
);

router.get(
  '/:id',
  validate(bookIdSchema),
  asyncHandler(getBookController)
);

router.post(
  '/',
  canManageBooks,
  validate(createBookSchema),
  asyncHandler(createBookController)
);

router.patch(
  '/:id',
  canManageBooks,
  validate(updateBookSchema),
  asyncHandler(updateBookController)
);

router.delete(
  '/:id',
  canManageBooks,
  validate(bookIdSchema),
  asyncHandler(deleteBookController)
);

export default router;
