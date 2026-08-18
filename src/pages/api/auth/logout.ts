import type { APIRoute } from 'astro';
import { cookieName } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(cookieName, { path: '/' });
  return redirect('/signin?reason=signed_out', 302);
};
