import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

function user(row) {
  return row ? { ...row, passHash: row.pass_hash, displayName: row.display_name, externalId: row.external_id, createdAt: row.created_at } : null;
}

export function createSqliteAdapter(filename) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const sql = new Database(filename);
  sql.pragma('journal_mode = WAL');
  sql.pragma('foreign_keys = ON');

  return {
    storage: 'sqlite',
    async migrate() {
      sql.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
          pass_hash TEXT, role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
          source TEXT NOT NULL CHECK (source IN ('local','oidc','saml')),
          external_id TEXT, created_at TEXT NOT NULL,
          UNIQUE(source, external_id)
        );
        CREATE TABLE IF NOT EXISTS scenarios (
          id TEXT PRIMARY KEY, body TEXT NOT NULL, updated_at TEXT NOT NULL,
          updated_by TEXT, FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
        );
      `);
    },
    async close() { sql.close(); },
    async countScenarios() { return sql.prepare('SELECT COUNT(*) AS count FROM scenarios').get().count; },
    async listScenarioMeta() { return sql.prepare('SELECT id, updated_at AS updatedAt FROM scenarios ORDER BY id').all(); },
    async listScenarios() { return sql.prepare('SELECT body FROM scenarios ORDER BY id').all().map((r) => JSON.parse(r.body)); },
    async getScenario(id) { const row = sql.prepare('SELECT body FROM scenarios WHERE id = ?').get(id); return row ? JSON.parse(row.body) : null; },
    async upsertScenario(body, updatedBy = null) {
      const now = new Date().toISOString();
      sql.prepare(`INSERT INTO scenarios(id,body,updated_at,updated_by) VALUES(?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at,updated_by=excluded.updated_by`)
        .run(body.id, JSON.stringify(body), now, updatedBy);
      return { id: body.id, updatedAt: now };
    },
    async deleteScenario(id) { return sql.prepare('DELETE FROM scenarios WHERE id = ?').run(id).changes > 0; },
    async countUsers() { return sql.prepare('SELECT COUNT(*) AS count FROM users').get().count; },
    async listUsers() { return sql.prepare('SELECT id,username,display_name,role,source,external_id,created_at FROM users ORDER BY username').all().map(user); },
    async getUserById(id) { return user(sql.prepare('SELECT * FROM users WHERE id = ?').get(id)); },
    async getUserByUsername(username) { return user(sql.prepare('SELECT * FROM users WHERE lower(username) = lower(?)').get(username)); },
    async getExternalUser(source, externalId) { return user(sql.prepare('SELECT * FROM users WHERE source = ? AND external_id = ?').get(source, externalId)); },
    async createUser(data) {
      sql.prepare('INSERT INTO users(id,username,display_name,pass_hash,role,source,external_id,created_at) VALUES(?,?,?,?,?,?,?,?)')
        .run(data.id, data.username, data.displayName, data.passHash || null, data.role, data.source, data.externalId || null, data.createdAt);
      return this.getUserById(data.id);
    },
    async updateUser(id, changes) {
      const parts = [], values = [];
      for (const [key, column] of [['role','role'],['passHash','pass_hash'],['displayName','display_name']]) {
        if (key in changes) { parts.push(`${column} = ?`); values.push(changes[key]); }
      }
      if (parts.length) sql.prepare(`UPDATE users SET ${parts.join(', ')} WHERE id = ?`).run(...values, id);
      return this.getUserById(id);
    },
    async deleteUser(id) { return sql.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0; },
  };
}
