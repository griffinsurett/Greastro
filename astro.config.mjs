// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';

// Load environment variables from .env files
const env = loadEnv(
  process.env.NODE_ENV || 'development',
  process.cwd(),
  ''
);

const siteUrl = `https://${env.PUBLIC_SITE_DOMAIN}`;
console.log(`Site URL: ${siteUrl}`);

export default defineConfig({
  site: siteUrl,
  server: {
    port: 9090,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')
            ) {
              return 'react-vendor';
            }
            // ❌ Removed icon chunk splitting
          },
        },
      },
    },
  },
  integrations: [
    mdx(),
    react({
      include: ['**/react/*', '**/components/**/*.jsx', '**/hooks/**/*.js'],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: process.env.NODE_ENV === 'development',
      },
    }),
  ],
});
