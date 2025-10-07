// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import { buildRedirectConfig } from './src/utils/redirects';

const env = loadEnv(
  process.env.NODE_ENV || 'development',
  process.cwd(),
  ''
);

const redirects = await buildRedirectConfig();
const siteUrl = `https://${env.PUBLIC_SITE_DOMAIN}`;

export default defineConfig({
  site: siteUrl,
  server: {
    port: 9090,
  },
  
  vite: {
    plugins: [tailwindcss()],
    
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // CRITICAL: Separate React completely - don't bundle with main
            if (id.includes('node_modules/react/')) {
              return 'react-core';
            }
            if (id.includes('node_modules/react-dom/')) {
              return 'react-dom';
            }
            if (id.includes('node_modules/scheduler')) {
              return 'react-scheduler';
            }
            
            // Consent system (lazy loaded, needs React)
            if (id.includes('/components/consent/')) {
              return 'consent-ui';
            }
            
            // Modal (used by consent)
            if (id.includes('/components/Modal')) {
              return 'modal-ui';
            }
            
            // Hooks (needed by consent)
            if (id.includes('/hooks/')) {
              return 'hooks';
            }
            
            // Icons
            if (id.includes('react-icons')) {
              return 'icons';
            }
            
            // Other vendor code
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    
    css: {
      devSourcemap: false,
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          chrome: 90,
          firefox: 88,
          safari: 14,
          edge: 90,
        },
        drafts: {
          nesting: true,
        },
      },
    },
    
    optimizeDeps: {
      // Don't pre-bundle React (load on demand)
      exclude: ['react', 'react-dom', '@astrojs/react'],
    },
  },
  
  integrations: [
    mdx(),
    react({
      include: ['**/components/consent/**', '**/hooks/**'],
      // CRITICAL: Don't inject React runtime globally
      experimentalReactChildren: false,
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: false,
      },
    }),
  ],
  
  build: {
    inlineStylesheets: 'auto',
    split: true,
  },
  
  compressHTML: true,
  
  redirects: {
    ...redirects,
  },
});