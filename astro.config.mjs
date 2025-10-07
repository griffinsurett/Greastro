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
console.log(`Site URL: ${siteUrl}`);

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
      
      // Minify more aggressively
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        },
        format: {
          comments: false, // Remove all comments
        },
      },
      
      rollupOptions: {
        output: {
          // Optimize chunk sizes
          manualChunks(id) {
            // React - keep together but separate from main bundle
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'react-vendor';
            }
            
            // React Icons - split by library
            if (id.includes('react-icons/lu')) {
              return 'icons-lucide';
            }
            if (id.includes('react-icons/fi')) {
              return 'icons-feather';
            }
            if (id.includes('react-icons/')) {
              return 'icons-other';
            }
            
            // Consent system - all together (loaded with client:idle)
            if (
              id.includes('/components/consent/') ||
              id.includes('/hooks/useCookieStorage')
            ) {
              return 'consent';
            }
            
            // Modal - separate (only loaded when needed)
            if (id.includes('/components/Modal')) {
              return 'modal';
            }
            
            // Other React components
            if (id.includes('/components/') && id.includes('.tsx')) {
              return 'components';
            }
            
            // Hooks
            if (id.includes('/hooks/')) {
              return 'hooks';
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
      include: ['react', 'react-dom'],
      exclude: ['@astrojs/react'],
    },
    
    // Enable build cache
    cacheDir: '.vite',
  },
  
  integrations: [
    mdx(),
    react({
      include: ['**/components/**/*.{jsx,tsx}', '**/hooks/**/*.{js,ts,jsx,tsx}'],
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