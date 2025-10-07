// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import { buildRedirectConfig } from './src/utils/redirects';
import { manualChunks, assetFileNames } from './vite.chunks.js';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const redirects = await buildRedirectConfig();
const siteUrl = `https://${env.PUBLIC_SITE_DOMAIN}`;

console.log(`Site URL: ${siteUrl}`);

export default defineConfig({
  site: siteUrl,
  server: { port: 9090 },
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: 'esbuild', // Changed from 'lightningcss' - more compatible
      rollupOptions: {
        output: { assetFileNames, manualChunks },
      },
    },
    css: {
      devSourcemap: false,
      // Remove transformer - let Tailwind handle it
      // transformer: 'lightningcss', 
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@astrojs/react'],
    },
  },
  
  integrations: [
    mdx(),
    react({
      include: ['**/react/*', '**/components/**/*.jsx', '**/components/**/*.tsx', '**/hooks/**/*.js', '**/hooks/**/*.ts'],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: process.env.NODE_ENV === 'development',
      },
    }),
  ],
  
  build: {
    inlineStylesheets: 'auto',
    split: true,
  },
  
  compressHTML: true,
  redirects,
});