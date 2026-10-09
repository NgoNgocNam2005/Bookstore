import cors from 'cors';
import express from 'express';
import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';

const app = express();

const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include local tools and server-to-server calls.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
