/**
 * Step 2 — Google sends the user back with a code; swap it for an identity.
 *
 * The token exchange happens here, server-side, because it needs the client
 * secret. That is the whole reason this route exists rather than doing the
 * whole thing in the browser.
 */
import type { APIRoute } from 'astro';
import { config, sign, isAllowed, cookieName, cookieOptions, maxAge } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const { clientId, clientSecret, sessionSecret, domains } = config(import.meta.env);

  const error = url.searchParams.get('error');
  if (error) return redirect(`/signed-out?reason=${encodeURIComponent(error)}`, 302);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const stash = cookies.get('mesa_oauth')?.value;
  cookies.delete('mesa_oauth', { path: '/' });

  if (!code || !state || !stash) return redirect('/signed-out?reason=bad_request', 302);

  const [nonce, next] = stash.split('|');
  if (state !== nonce) return redirect('/signed-out?reason=state_mismatch', 302);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: new URL('/api/auth/callback', url.origin).toString(),
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) return redirect('/signed-out?reason=token_exchange', 302);

  const token = (await res.json()) as { id_token?: string };
  if (!token.id_token) return redirect('/signed-out?reason=no_id_token', 302);

  /* The id_token comes straight from Google over TLS in direct response to our
     own request, so the payload is read rather than re-verified. It is never
     accepted from the browser. */
  const claims = JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(
        atob(token.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        (c) => c.charCodeAt(0)
      )
    )
  ) as {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    aud?: string;
  };

  if (claims.aud !== clientId) return redirect('/signed-out?reason=wrong_audience', 302);
  if (!isAllowed(claims.email, claims.email_verified === true, domains)) {
    return redirect('/signed-out?reason=not_allowed', 302);
  }

  const session = await sign(
    {
      sub: claims.sub,
      email: claims.email!,
      name: claims.name,
      picture: claims.picture,
      exp: Math.floor(Date.now() / 1000) + maxAge,
    },
    sessionSecret
  );

  cookies.set(cookieName, session, { ...cookieOptions, secure: url.protocol === 'https:' });
  return redirect(next && next.startsWith('/') ? next : '/', 302);
};
