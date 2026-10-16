import { Router } from 'express';
import { getAdminDashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { adminDashboardSchema } from '../validators/dashboard.validator.js';


const router = Router();
router.use(authMiddleware);

router.get(
    '/admin',
    requireRoles('admin'),
    validate(adminDashboardSchema),
    asyncHandler(getAdminDashboardController)
);

export default router;