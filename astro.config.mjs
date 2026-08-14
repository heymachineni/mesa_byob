// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
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
