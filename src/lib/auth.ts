/**
 * Session signing, and who is allowed in.
 *
 * Deliberately small. There is no session store and no database: the cookie
 * *is* the session, signed with HMAC-SHA256 so it can be verified without
 * looking anything up. Nothing secret is inside it — only who you are and when
 * it expires — so the worst a stolen cookie yields is the same content the
 * signed-in student already sees.
 *
 * Web Crypto rather than a library, because this runs in the same places Astro
 * does and has no dependencies to keep current.
 */

const COOKIE = 'mesa_session';
/** A cohort works in weeks; a fortnight avoids a re-login mid-programme. */
const MAX_AGE = 60 * 60 * 24 * 14;

export type Session = {
  /** Google's stable user id. */
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  /** Seconds since epoch. */
  exp: number;
};

const enc = new TextEncoder();

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const unb64url = (s: string) => {
  const p = s.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(p + '='.repeat((4 - (p.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function key(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function sign(session: Session, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(session)));
  const mac = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body));
  return `${body}.${b64url(mac)}`;
}

/** Returns the session only if the signature holds and it hasn't expired. */
export async function verify(token: string, secret: string): Promise<Session | null> {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;

  let ok = false;
  try {
    /* `crypto.subtle.verify` is constant-time, which a string compare of the
       two MACs would not be. */
    ok = await crypto.subtle.verify('HMAC', await key(secret), unb64url(mac), enc.encode(body));
  } catch {
    return null;
  }
  if (!ok) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(unb64url(body))) as Session;
    if (typeof session.exp !== 'number' || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export const cookieName = COOKIE;
export const maxAge = MAX_AGE;

export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE,
};

/**
 * The actual gate.
 *
 * The consent screen is published as *External*, which means Google will
 * happily authenticate any Gmail account on earth. Google verifying someone is
 * not the same as them belonging here — this is the check that decides.
 */
export function isAllowed(email: string | undefined, verified: boolean, domains: string): boolean {
  if (!email || !verified) return false;
  const allowed = domains
    .split(',')
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
  if (!allowed.length) return false;
  const domain = email.toLowerCase().split('@')[1];
  return allowed.includes(domain);
}

/**
 * Read the environment at *runtime*.
 *
 * `import.meta.env` is replaced by the bundler during the build, which has two
 * consequences that only show up in production: the value is compiled into the
 * deployed artifact, and a value changed in the host's dashboard does nothing
 * until the next rebuild. A dynamic key is not enough to avoid it — Vite
 * substitutes the whole object — so this file does not reference it at all.
 */
export function env(key: string): string | undefined {
  return process.env?.[key];
}

/**
 * The public origin of this deployment.
 *
 * `url.origin` is what the *server* saw, and behind a proxy that is not always
 * what the browser used — TLS terminates at the edge, so the protocol can come
 * through as http, and the host can be the internal deployment URL rather than
 * the domain. Google requires the `redirect_uri` at the token step to match the
 * one used at the authorize step byte for byte, so a mismatch here fails the
 * exchange with no useful message.
 */
export function origin(request: Request, fallback: string): string {
  const explicit = env('PUBLIC_SITE_URL');
  if (explicit) return explicit.replace(/\/$/, '');

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : fallback;
}

/** Fails loudly at boot rather than mysteriously at sign-in. */
export function config() {
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'].filter(
    (k) => !env(k)
  );
  if (missing.length) {
    throw new Error(
      `Google sign-in is not configured. Missing: ${missing.join(', ')}. ` +
        `Copy .env.example to .env and fill them in.`
    );
  }
  return {
    clientId: env('GOOGLE_CLIENT_ID')!,
    clientSecret: env('GOOGLE_CLIENT_SECRET')!,
    sessionSecret: env('SESSION_SECRET')!,
    domains: env('ALLOWED_EMAIL_DOMAINS') || 'mesaschool.co',
  };
}
