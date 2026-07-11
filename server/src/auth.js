import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from './password.js';
import { clearSession, makeSignedState, readSession, readSignedState, setSession } from './session.js';
import { normalizeRole } from './config.js';

export function publicUser(user) {
  if (!user) return null;
  const { id, username, displayName, role, source, externalId, createdAt } = user;
  return { id, username, displayName, role, source, externalId, createdAt };
}

async function uniqueUsername(db, preferred) {
  const base = String(preferred || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 50) || 'user';
  let name = base;
  let suffix = 1;
  while (await db.getUserByUsername(name)) name = `${base.slice(0, 45)}-${suffix++}`;
  return name;
}

async function jitUser(db, { source, externalId, username, displayName, role, syncRole }) {
  let user = await db.getExternalUser(source, externalId);
  if (user) {
    const changes = { displayName: displayName || user.displayName };
    if (syncRole) changes.role = role;
    return db.updateUser(user.id, changes);
  }
  return db.createUser({ id: crypto.randomUUID(), username: await uniqueUsername(db, username), displayName: displayName || username || externalId, passHash: null, role, source, externalId, createdAt: new Date().toISOString() });
}

export async function attachUser(request, db, config) {
  const session = readSession(request, config);
  request.user = session ? await db.getUserById(session.uid) : null;
}

export function requireRole(minimum) {
  const ranks = { viewer: 0, editor: 1, admin: 2 };
  return async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'authentication required' });
    if (ranks[request.user.role] < ranks[minimum]) return reply.code(403).send({ error: `${minimum} role required` });
  };
}

export async function registerAuthRoutes(app, db, config) {
  app.get('/auth/providers', async () => ({ local: true, oidc: Boolean(config.oidc), saml: Boolean(config.saml) }));
  app.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body || {};
    const user = typeof username === 'string' ? await db.getUserByUsername(username) : null;
    if (!user || user.source !== 'local' || !(await verifyPassword(password, user.passHash))) {
      return reply.code(401).send({ error: 'invalid username or password' });
    }
    setSession(reply, user, config);
    return { user: publicUser(user) };
  });
  app.post('/auth/logout', async (_request, reply) => { clearSession(reply, config); return { ok: true }; });
  app.get('/auth/me', { preHandler: requireRole('viewer') }, async (request) => ({ user: publicUser(request.user) }));

  if (config.oidc) await registerOidc(app, db, config);
  if (config.saml) await registerSaml(app, db, config);
}

async function registerOidc(app, db, config) {
  const oidc = await import('openid-client');
  const provider = await oidc.discovery(new URL(config.oidc.issuer), config.oidc.clientId, config.oidc.clientSecret);
  app.get('/auth/oidc/login', async (_request, reply) => {
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    const state = oidc.randomState();
    const signed = makeSignedState({ verifier, state }, config);
    reply.setCookie('opsquest_oidc', signed, { path: '/auth/oidc', httpOnly: true, sameSite: 'lax', secure: config.secureCookies, maxAge: 600 });
    const url = oidc.buildAuthorizationUrl(provider, { redirect_uri: config.oidc.redirectUri, scope: 'openid profile email', code_challenge: challenge, code_challenge_method: 'S256', state });
    return reply.redirect(url.href);
  });
  app.get('/auth/oidc/callback', async (request, reply) => {
    const saved = readSignedState(request.cookies.opsquest_oidc, config);
    if (!saved) return reply.code(400).send({ error: 'OIDC login state expired or invalid' });
    const current = new URL(config.oidc.redirectUri);
    current.search = new URLSearchParams(request.query).toString();
    const tokens = await oidc.authorizationCodeGrant(provider, current, { pkceCodeVerifier: saved.verifier, expectedState: saved.state });
    const claims = tokens.claims();
    if (!claims?.sub) return reply.code(400).send({ error: 'OIDC response did not include sub' });
    let role = config.oidc.defaultRole;
    if (config.oidc.roleClaim) role = normalizeRole(claims[config.oidc.roleClaim], role);
    const user = await jitUser(db, { source: 'oidc', externalId: claims.sub, username: claims.preferred_username || claims.email || `oidc-${claims.sub}`, displayName: claims.name || claims.email, role, syncRole: Boolean(config.oidc.roleClaim) });
    setSession(reply, user, config);
    reply.clearCookie('opsquest_oidc', { path: '/auth/oidc' });
    return reply.redirect('/admin/');
  });
}

async function registerSaml(app, db, config) {
  const { SAML } = await import('@node-saml/node-saml');
  const saml = new SAML({ callbackUrl: config.saml.callbackUrl, entryPoint: config.saml.entryPoint, issuer: config.saml.issuer, idpCert: config.saml.cert, wantAssertionsSigned: true, validateInResponseTo: 'always' });
  app.get('/auth/saml/login', async (request, reply) => reply.redirect(await saml.getAuthorizeUrlAsync('', request.hostname, {})));
  app.post('/auth/saml/callback', async (request, reply) => {
    const { profile } = await saml.validatePostResponseAsync(request.body || {});
    if (!profile?.nameID) return reply.code(400).send({ error: 'SAML response did not include NameID' });
    const email = profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const displayName = profile.displayName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || email || profile.nameID;
    const user = await jitUser(db, { source: 'saml', externalId: profile.nameID, username: email || `saml-${profile.nameID}`, displayName, role: config.saml.defaultRole, syncRole: false });
    setSession(reply, user, config);
    return reply.redirect('/admin/');
  });
}
