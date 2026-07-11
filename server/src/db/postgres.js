import pg from 'pg';

const { Pool } = pg;
function user(row) {
  return row ? { ...row, passHash: row.pass_hash, displayName: row.display_name, externalId: row.external_id, createdAt: new Date(row.created_at).toISOString() } : null;
}

export function createPostgresAdapter(connectionString) {
  const pool = new Pool({ connectionString });
  return {
    storage: 'postgres',
    async migrate() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
          pass_hash TEXT, role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
          source TEXT NOT NULL CHECK (source IN ('local','oidc','saml')),
          external_id TEXT, created_at TIMESTAMPTZ NOT NULL,
          UNIQUE(source, external_id)
        );
        CREATE TABLE IF NOT EXISTS scenarios (
          id TEXT PRIMARY KEY, body JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL,
          updated_by TEXT REFERENCES users(id) ON DELETE SET NULL
        );
      `);
    },
    async close() { await pool.end(); },
    async countScenarios() { const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM scenarios'); return rows[0].count; },
    async listScenarioMeta() { const { rows } = await pool.query('SELECT id, updated_at AS "updatedAt" FROM scenarios ORDER BY id'); return rows.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt).toISOString() })); },
    async listScenarios() { const { rows } = await pool.query('SELECT body FROM scenarios ORDER BY id'); return rows.map((r) => r.body); },
    async getScenario(id) { const { rows } = await pool.query('SELECT body FROM scenarios WHERE id=$1', [id]); return rows[0]?.body || null; },
    async upsertScenario(body, updatedBy = null) {
      const { rows } = await pool.query(`INSERT INTO scenarios(id,body,updated_at,updated_by) VALUES($1,$2,NOW(),$3)
        ON CONFLICT(id) DO UPDATE SET body=EXCLUDED.body,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by
        RETURNING updated_at AS "updatedAt"`, [body.id, body, updatedBy]);
      return { id: body.id, updatedAt: new Date(rows[0].updatedAt).toISOString() };
    },
    async deleteScenario(id) { return (await pool.query('DELETE FROM scenarios WHERE id=$1', [id])).rowCount > 0; },
    async countUsers() { const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users'); return rows[0].count; },
    async listUsers() { const { rows } = await pool.query('SELECT id,username,display_name,role,source,external_id,created_at FROM users ORDER BY username'); return rows.map(user); },
    async getUserById(id) { const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]); return user(rows[0]); },
    async getUserByUsername(username) { const { rows } = await pool.query('SELECT * FROM users WHERE lower(username)=lower($1)', [username]); return user(rows[0]); },
    async getExternalUser(source, externalId) { const { rows } = await pool.query('SELECT * FROM users WHERE source=$1 AND external_id=$2', [source, externalId]); return user(rows[0]); },
    async createUser(data) {
      const { rows } = await pool.query(`INSERT INTO users(id,username,display_name,pass_hash,role,source,external_id,created_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [data.id,data.username,data.displayName,data.passHash||null,data.role,data.source,data.externalId||null,data.createdAt]);
      return user(rows[0]);
    },
    async updateUser(id, changes) {
      const columns = { role: 'role', passHash: 'pass_hash', displayName: 'display_name' };
      const sets = [], values = [];
      for (const [key, column] of Object.entries(columns)) if (key in changes) { values.push(changes[key]); sets.push(`${column}=$${values.length}`); }
      if (!sets.length) return this.getUserById(id);
      values.push(id);
      const { rows } = await pool.query(`UPDATE users SET ${sets.join(',')} WHERE id=$${values.length} RETURNING *`, values);
      return user(rows[0]);
    },
    async deleteUser(id) { return (await pool.query('DELETE FROM users WHERE id=$1', [id])).rowCount > 0; },
  };
}
