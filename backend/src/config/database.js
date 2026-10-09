import { Sequelize } from 'sequelize';
import env from './env.js';

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: 'mysql',
    logging: false,
    define: { underscored: true }
  }
);

export async function checkDatabaseConnection() {
  await sequelize.authenticate();
  return true;
}

export async function closeDatabaseConnection() {
  await sequelize.close();
}

export default sequelize;
