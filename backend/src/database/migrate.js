import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(currentDirectory, 'migrations');

async function ensureMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS sequelize_migrations (
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function getAppliedMigrations() {
  const [rows] = await sequelize.query(
    'SELECT name FROM sequelize_migrations ORDER BY name'
  );

  return new Set(rows.map((row) => row.name));
}

const migrationFiles = (await readdir(migrationsDirectory))
  .filter((fileName) => fileName.endsWith('.js'))
  .sort();

await ensureMigrationsTable();
const appliedMigrations = await getAppliedMigrations();
const queryInterface = sequelize.getQueryInterface();

for (const migrationFile of migrationFiles) {
  if (appliedMigrations.has(migrationFile)) {
    console.log(`Skipping migration: ${migrationFile}`);
    continue;
  }

  const migration = await import(
    pathToFileURL(path.join(migrationsDirectory, migrationFile))
  );

  await migration.up(queryInterface, Sequelize);
  await sequelize.query(
    'INSERT INTO sequelize_migrations (name) VALUES (?)',
    { replacements: [migrationFile] }
  );
  console.log(`Applied migration: ${migrationFile}`);
}

await sequelize.close();
console.log('Database migrations completed.');
