import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function complete(names) {
  return names.every((name) => Boolean(process.env[name]));
}

export function loadConfig(log = console) {
  let sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    sessionSecret = crypto.randomBytes(32).toString('hex');
    log.warn?.('SESSION_SECRET is unset; sessions will be invalidated whenever the server restarts.');
  }

  const oidcNames = ['OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_REDIRECT_URI'];
  const samlNames = ['SAML_ENTRY_POINT', 'SAML_ISSUER', 'SAML_CERT', 'SAML_CALLBACK_URL'];

  return {
    serverRoot,
    host: process.env.HOST || '0.0.0.0',
    port: Number.parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || null,
    sqlitePath: path.resolve(process.env.SQLITE_PATH || path.join(serverRoot, 'data', 'opsquest.db')),
    sessionSecret,
    secureCookies: process.env.COOKIE_SECURE === undefined
      ? process.env.NODE_ENV === 'production'
      : process.env.COOKIE_SECURE === 'true',
    adminUser: process.env.ADMIN_USER,
    adminPassword: process.env.ADMIN_PASSWORD,
    oidc: complete(oidcNames) ? {
      issuer: process.env.OIDC_ISSUER,
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      redirectUri: process.env.OIDC_REDIRECT_URI,
      defaultRole: normalizeRole(process.env.OIDC_DEFAULT_ROLE, 'viewer'),
      roleClaim: process.env.OIDC_ROLE_CLAIM || null,
    } : null,
    saml: complete(samlNames) ? {
      entryPoint: process.env.SAML_ENTRY_POINT,
      issuer: process.env.SAML_ISSUER,
      cert: process.env.SAML_CERT.replace(/\\n/g, '\n'),
      callbackUrl: process.env.SAML_CALLBACK_URL,
      defaultRole: normalizeRole(process.env.SAML_DEFAULT_ROLE, 'viewer'),
    } : null,
  };
}

export function normalizeRole(value, fallback = 'viewer') {
  return ['admin', 'editor', 'viewer'].includes(value) ? value : fallback;
}
