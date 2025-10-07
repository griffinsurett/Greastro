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
      // Inline small assets (CSS under 4KB gets inlined)
      assetsInlineLimit: 4096,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Minify CSS aggressively
      cssMinify: 'lightningcss',
      
      rollupOptions: {
        output: {
          // Better chunk splitting for CSS
          assetFileNames: (assetInfo) => {
            // Separate CSS by type
            if (assetInfo.name?.endsWith('.css')) {
              // Critical CSS gets different name for preloading
              if (assetInfo.name.includes('global') || assetInfo.name.includes('base')) {
                return 'assets/critical-[hash][extname]';
              }
              return 'assets/styles-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          
          manualChunks(id) {
            // React vendor bundle
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'react-vendor';
            }
            
            // Consent system (lazy loaded)
            if (id.includes('/components/consent/')) {
              return 'consent';
            }
            
            // Modal system (used by consent)
            if (id.includes('/components/Modal')) {
              return 'modal';
            }
            
            // Icons (if large)
            if (id.includes('react-icons')) {
              return 'icons';
            }
            
            // Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    
    // Optimize CSS processing
    css: {
      devSourcemap: false,
      
      // Lightning CSS transformer (faster than PostCSS)
      transformer: 'lightningcss',
      
      lightningcss: {
        // Optimize for modern browsers (smaller CSS)
        targets: {
          chrome: 90,
          firefox: 88,
          safari: 14,
          edge: 90,
        },
        
        // Enable CSS nesting and other modern features
        drafts: {
          nesting: true,
        },
      },
    },
    
    // Optimize dependencies
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
  
  // Astro build optimizations
  build: {
    // Inline small stylesheets automatically
    inlineStylesheets: 'auto',
    
    // Split code by page
    split: true,
  },
  
  // Compress HTML
  compressHTML: true,
  
  redirects: {
    ...redirects,
  },
});