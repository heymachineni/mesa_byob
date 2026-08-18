/**
 * The gate.
 *
 * Astro middleware only runs per-request for on-demand rendered routes — for a
 * prerendered page it runs at build time, which would gate nothing. That is why
 * the site moved to on-demand rendering: a static file has no opportunity to
 * check a cookie, and any check done in the browser is a curtain rather than a
 * lock, since the whole Starter Pack is in the HTML.
 */
import { defineMiddleware } from 'astro:middleware';
import { verify, cookieName } from './lib/auth';

/** Reachable without a session, or nobody could ever sign in. */
const OPEN = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/signed-out',
  '/favicon.ico',
  '/favicon.png',
];

const isAsset = (path: string) =>
  path.startsWith('/_astro/') ||
  path.startsWith('/fonts/') ||
  /\.(png|jpg|jpeg|svg|webp|avif|woff2?|ico|css|js|map|txt|xml)$/.test(path);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (OPEN.includes(pathname) || isAsset(pathname)) return next();

  /* An explicit opt-out, used by the verification suite so it can render the
     pages it checks. Explicit rather than "open when unconfigured", because a
     production deploy that forgot its environment variables would otherwise
     serve the whole kit to the world and look like it was working. */
  if (import.meta.env.AUTH_DISABLED === '1') return next();

  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) {
    return new Response(
      'Sign-in is not configured on this deployment. Set GOOGLE_CLIENT_ID, ' +
        'GOOGLE_CLIENT_SECRET and SESSION_SECRET, or set AUTH_DISABLED=1 to run it open.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const token = context.cookies.get(cookieName)?.value;
  const session = token ? await verify(token, secret) : null;

  if (!session) {
    const next_ = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/api/auth/login?next=${next_}`, 302);
  }

  /* Available to pages as `Astro.locals.user`. */
  context.locals.user = session;

  const response = await next();
  /* A signed-in page is per-user; a shared cache must not keep it. */
  response.headers.set('cache-control', 'private, no-store');
  return response;
});
