/**
 * Step 1 — send the user to Google.
 *
 * The `state` parameter carries two things: a random nonce echoed back in a
 * cookie so a forged callback can't be replayed, and the path the user was
 * trying to reach so they land there rather than on the homepage.
 */
import type { APIRoute } from 'astro';
import { config } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const { clientId } = config();

  const nonce = crypto.randomUUID();
  const next = url.searchParams.get('next') || '/';
  /* Only same-site paths: an open redirect here would let someone bounce a
     signed-in user off to another origin. */
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  cookies.set('mesa_oauth', `${nonce}|${safeNext}`, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  auth.searchParams.set('client_id', clientId);
  auth.searchParams.set('redirect_uri', new URL('/api/auth/callback', url.origin).toString());
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'openid email profile');
  auth.searchParams.set('state', nonce);
  /* Nudges Google's account chooser to the right domain. Not a security
     control — `isAllowed` is. */
  auth.searchParams.set('hd', config().domains.split(',')[0].trim());

  return redirect(auth.toString(), 302);
};
