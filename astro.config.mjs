// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

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
