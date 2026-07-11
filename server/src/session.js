import crypto from 'node:crypto';

const COOKIE = 'opsquest_session';
const MAX_AGE = 60 * 60 * 12;

function signature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function encode(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${signature(payload, secret)}`;
}

function decode(value, secret) {
  if (!value) return null;
  const [payload, supplied] = value.split('.');
  if (!payload || !supplied) return null;
  const expected = signature(payload, secret);
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.uid || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function setSession(reply, user, config) {
  const data = { uid: user.id, exp: Date.now() + MAX_AGE * 1000 };
  reply.setCookie(COOKIE, encode(data, config.sessionSecret), {
    path: '/', httpOnly: true, sameSite: 'lax', secure: config.secureCookies, maxAge: MAX_AGE,
  });
}

export function clearSession(reply, config) {
  reply.clearCookie(COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: config.secureCookies });
}

export function readSession(request, config) {
  return decode(request.cookies[COOKIE], config.sessionSecret);
}

export function makeSignedState(data, config) {
  return encode({ ...data, exp: Date.now() + 10 * 60 * 1000 }, config.sessionSecret);
}

export function readSignedState(value, config) {
  return decode(value, config.sessionSecret);
}
