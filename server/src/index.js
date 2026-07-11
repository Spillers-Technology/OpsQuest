import crypto from 'node:crypto';
import path from 'node:path';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { loadConfig } from './config.js';
import { createDatabase } from './db/index.js';
import { hashPassword } from './password.js';
import { attachUser, registerAuthRoutes } from './auth.js';
import { registerRoutes } from './routes.js';

const app = Fastify({ logger: true });
const config = loadConfig(app.log);
const db = await createDatabase(config);

app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_request, body, done) => done(null, Object.fromEntries(new URLSearchParams(body))));
await app.register(cookie);

app.addHook('onRequest', async (request) => attachUser(request, db, config));
app.addHook('onSend', async (request, reply, payload) => {
  const pathname = request.url.split('?', 1)[0];
  if (request.method === 'GET' && (pathname === '/health' || pathname.startsWith('/v1/'))) {
    reply.header('Access-Control-Allow-Origin', '*');
  }
  return payload;
});

if (await db.countUsers() === 0) {
  if (config.adminUser && config.adminPassword) {
    await db.createUser({ id: crypto.randomUUID(), username: config.adminUser, displayName: config.adminUser, passHash: await hashPassword(config.adminPassword), role: 'admin', source: 'local', externalId: null, createdAt: new Date().toISOString() });
    app.log.warn(`Created bootstrap admin user "${config.adminUser}". Remove ADMIN_PASSWORD from the environment after first boot.`);
  } else {
    app.log.warn('No users exist and ADMIN_USER/ADMIN_PASSWORD are unset. Public scenario reads work, but the editor has no login until bootstrap credentials are supplied.');
  }
}

await registerAuthRoutes(app, db, config);
registerRoutes(app, db);
await app.register(fastifyStatic, { root: path.join(config.serverRoot, 'public'), prefix: '/admin/' });
app.get('/admin', async (_request, reply) => reply.redirect('/admin/'));

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
  reply.code(status).send({ error: status === 500 ? 'internal server error' : error.message });
});

const shutdown = async (signal) => {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  await db.close();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

try { await app.listen({ host: config.host, port: config.port }); }
catch (error) { app.log.error(error); await db.close(); process.exit(1); }
