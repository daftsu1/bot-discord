import crypto from 'crypto';

const COOKIE_NAME = 'despensa_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 días

function getSecret() {
  const s = process.env.SESSION_SECRET || process.env.DISCORD_BOT_TOKEN || 'dev-secret-change-in-prod';
  return Buffer.from(s, 'utf8');
}

export function signSession(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + MAX_AGE_SEC * 1000 });
  const encoded = Buffer.from(data, 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySession(value) {
  if (!value || typeof value !== 'string') return null;
  const [encoded, sig] = value.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function getSessionCookie(req) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function parseSession(req) {
  const val = getSessionCookie(req);
  return val ? verifySession(val) : null;
}

export function setSessionCookie(res, payload) {
  const value = signSession(payload);
  const maxAge = MAX_AGE_SEC;
  const secure = (process.env.WEB_BASE_URL || '').startsWith('https') ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

export function clearSessionCookie(res) {
  const secure = (process.env.WEB_BASE_URL || '').startsWith('https') ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
