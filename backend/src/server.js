import app from './app.js';
import env from './config/env.js';
import { checkDatabaseConnection } from './config/database.js';

try {
  await checkDatabaseConnection();
  app.listen(env.port, () => {
    console.log(`Backend is running at http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('Unable to connect to MySQL:', error.message);
  process.exit(1);
}
