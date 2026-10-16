import { Router } from 'express';
import {
  cancelMyBorrowOrderController,
  createBorrowOrderController,
  getBorrowOrderController,
  getMyBorrowOrderController,
  listBorrowOrdersController,
  listMyBorrowOrdersController,
  listOverdueBorrowOrdersController,
  updateBorrowOrderStatusController
} from '../controllers/borrow-order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  borrowOrderIdSchema,
  createBorrowOrderSchema,
  listBorrowOrdersSchema,
  listMyBorrowOrdersSchema,
  updateBorrowOrderStatusSchema
} from '../validators/borrow-order.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createBorrowOrderSchema),
  asyncHandler(createBorrowOrderController)
);

router.get(
  '/my',
  validate(listMyBorrowOrdersSchema),
  asyncHandler(listMyBorrowOrdersController)
);

router.get(
  '/my/:id',
  validate(borrowOrderIdSchema),
  asyncHandler(getMyBorrowOrderController)
);

router.patch(
  '/my/:id/cancel',
  validate(borrowOrderIdSchema),
  asyncHandler(cancelMyBorrowOrderController)
);

router.get(
  '/',
  requireRoles('admin', 'staff'),
  validate(listBorrowOrdersSchema),
  asyncHandler(listBorrowOrdersController)
);

router.get(
  '/overdue',
  requireRoles('admin', 'staff'),
  validate(listBorrowOrdersSchema),
  asyncHandler(listOverdueBorrowOrdersController)
);
  
router.get(
  '/:id',
  requireRoles('admin', 'staff'),
  validate(borrowOrderIdSchema),
  asyncHandler(getBorrowOrderController)
);

router.patch(
  '/:id/status',
  requireRoles('admin', 'staff'),
  validate(updateBorrowOrderStatusSchema),
  asyncHandler(updateBorrowOrderStatusController)
);

export default router;
