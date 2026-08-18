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

  /* The address typed on the sign-in page, if any. `login_hint` only prefills
     Google's account chooser and `hd` only filters what it offers — neither is
     a security control. `isAllowed` in the callback is the one that decides. */
  const local = (url.searchParams.get('user') || '').trim();
  const domain = (url.searchParams.get('domain') || '').trim().toLowerCase();
  const { domains } = config();
  const allowed = domains.split(',').map((d) => d.trim().toLowerCase());
  const hint = local && allowed.includes(domain) ? `${local.replace(/@.*$/, '')}@${domain}` : '';

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
  if (hint) {
    auth.searchParams.set('login_hint', hint);
    auth.searchParams.set('hd', hint.split('@')[1]);
  }
  /* After a rejected account, Google would otherwise sign the same one straight
     back in and the student would loop. `select_account` breaks that. */
  if (url.searchParams.get('prompt') === 'select_account') {
    auth.searchParams.set('prompt', 'select_account');
  }

  return redirect(auth.toString(), 302);
};
