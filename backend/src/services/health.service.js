import { checkDatabaseConnection } from '../config/database.js';

export async function getHealthStatus() {
  const databaseConnected = await checkDatabaseConnection();

  return {
    status: 'ok',
    service: 'backend',
    database: databaseConnected ? 'ok' : 'unavailable'
  };
}
