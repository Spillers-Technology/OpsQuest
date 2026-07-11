import crypto from 'node:crypto';
import { findDuplicateTicket, validateScenario } from './validate.js';
import { hashPassword } from './password.js';
import { publicUser, requireRole } from './auth.js';
import { normalizeRole } from './config.js';

export function registerRoutes(app, db) {
  app.get('/health', async () => ({ ok: true, storage: db.storage, scenarios: await db.countScenarios() }));
  app.get('/v1/manifest', async () => {
    const scenarios = await db.listScenarioMeta();
    const contentVersion = scenarios.reduce((max, row) => row.updatedAt > max ? row.updatedAt : max, new Date(0).toISOString());
    return { contentVersion, scenarios };
  });
  app.get('/v1/scenarios', async () => db.listScenarios());
  app.get('/v1/scenarios/:id', async (request, reply) => {
    const scenario = await db.getScenario(request.params.id);
    return scenario || reply.code(404).send({ error: 'scenario not found' });
  });

  app.put('/v1/scenarios/:id', { preHandler: requireRole('editor'), bodyLimit: 2 * 1024 * 1024 }, async (request, reply) => {
    const result = validateScenario(request.body);
    if (request.body?.id !== request.params.id) result.errors.push('scenario: body id must match URL id');
    const duplicate = request.body && findDuplicateTicket(request.body, await db.listScenarios());
    if (duplicate) result.errors.push(duplicate);
    if (result.errors.length) return reply.code(400).send(result);
    const saved = await db.upsertScenario(request.body, request.user.id);
    return { ...saved, warnings: result.warnings };
  });
  app.delete('/v1/scenarios/:id', { preHandler: requireRole('editor') }, async (request, reply) => {
    if (!(await db.deleteScenario(request.params.id))) return reply.code(404).send({ error: 'scenario not found' });
    return { ok: true };
  });

  app.get('/v1/users', { preHandler: requireRole('admin') }, async () => (await db.listUsers()).map(publicUser));
  app.post('/v1/users', { preHandler: requireRole('admin') }, async (request, reply) => {
    const { username, displayName, password } = request.body || {};
    const role = normalizeRole(request.body?.role, null);
    if (typeof username !== 'string' || !/^[A-Za-z0-9._-]{2,64}$/.test(username) || typeof displayName !== 'string' || !displayName.trim() || !role) {
      return reply.code(400).send({ error: 'username, displayName, password, and a valid role are required' });
    }
    try {
      const user = await db.createUser({ id: crypto.randomUUID(), username, displayName: displayName.trim(), passHash: await hashPassword(password), role, source: 'local', externalId: null, createdAt: new Date().toISOString() });
      return reply.code(201).send(publicUser(user));
    } catch (error) {
      if (/unique|duplicate/i.test(error.message)) return reply.code(409).send({ error: 'username already exists' });
      if (/password/i.test(error.message)) return reply.code(400).send({ error: error.message });
      throw error;
    }
  });
  app.patch('/v1/users/:id', { preHandler: requireRole('admin') }, async (request, reply) => {
    const target = await db.getUserById(request.params.id);
    if (!target) return reply.code(404).send({ error: 'user not found' });
    const changes = {};
    if ('role' in (request.body || {})) {
      const role = normalizeRole(request.body.role, null);
      if (!role) return reply.code(400).send({ error: 'invalid role' });
      changes.role = role;
    }
    if ('password' in (request.body || {})) {
      if (target.source !== 'local') return reply.code(400).send({ error: 'passwords apply only to local users' });
      try { changes.passHash = await hashPassword(request.body.password); }
      catch (error) { return reply.code(400).send({ error: error.message }); }
    }
    return publicUser(await db.updateUser(target.id, changes));
  });
  app.delete('/v1/users/:id', { preHandler: requireRole('admin') }, async (request, reply) => {
    if (request.params.id === request.user.id) return reply.code(400).send({ error: 'you cannot delete your own account' });
    if (!(await db.deleteUser(request.params.id))) return reply.code(404).send({ error: 'user not found' });
    return { ok: true };
  });
}
