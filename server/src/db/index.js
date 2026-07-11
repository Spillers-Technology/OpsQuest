import { createPostgresAdapter } from './postgres.js';
import { createSqliteAdapter } from './sqlite.js';

export async function createDatabase(config) {
  const db = config.databaseUrl
    ? createPostgresAdapter(config.databaseUrl)
    : createSqliteAdapter(config.sqlitePath);
  await db.migrate();
  return db;
}
