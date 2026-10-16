import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookCopyRoutes from './book-copy.routes.js';
import bookRoutes from './book.routes.js';
import borrowOrderRoutes from './borrow-order.routes.js';
import categoryRoutes from './category.routes.js';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/book-categories', categoryRoutes);
apiRouter.use('/books', bookRoutes);
apiRouter.use('/book-copies', bookCopyRoutes);
apiRouter.use('/borrow-orders', borrowOrderRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
