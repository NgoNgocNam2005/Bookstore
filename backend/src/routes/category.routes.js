import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  listCategoriesController,
  updateCategoryController
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  categoryIdSchema,
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema
} from '../validators/category.validator.js';

const router = Router();
const canManageCategories = requireRoles('admin', 'editor', 'staff');

router.use(authMiddleware);

router.get(
  '/',
  validate(listCategoriesSchema),
  asyncHandler(listCategoriesController)
);

router.get(
  '/:id',
  validate(categoryIdSchema),
  asyncHandler(getCategoryController)
);

router.post(
  '/',
  canManageCategories,
  validate(createCategorySchema),
  asyncHandler(createCategoryController)
);

router.patch(
  '/:id',
  canManageCategories,
  validate(updateCategorySchema),
  asyncHandler(updateCategoryController)
);

router.delete(
  '/:id',
  canManageCategories,
  validate(categoryIdSchema),
  asyncHandler(deleteCategoryController)
);

export default router;
