// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

/* Auth reads `process.env` at runtime rather than `import.meta.env`, so the
   secret is never compiled into the deployed bundle and a value changed in the
   host's dashboard takes effect without a rebuild. The cost is that `astro dev`
   doesn't put .env into `process.env` — this bridges it for local development.
   In production the real environment is already there and nothing is overwritten. */
for (const [key, value] of Object.entries(loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''))) {
  process.env[key] ??= value;
}

export default defineConfig({
  /* On-demand rendering, because the sign-in gate is middleware and Astro only
     runs middleware per-request for on-demand routes. A prerendered page is a
     file on a CDN: there is no moment at which it could check a cookie. */
  output: 'server',
  adapter: vercel(),

  // No integrations by design. Every interaction on this site is built on native
  // semantic elements progressively enhanced with a small amount of TypeScript,
  // so the production bundle stays close to zero JS.
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
