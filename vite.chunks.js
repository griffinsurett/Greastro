// vite.chunks.js

export function manualChunks(id) {
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
  
  // ADD THIS: Accessibility system (lazy loaded)
  if (id.includes('/components/accessibility/')) {
    return 'accessibility';
  }
  
  // Modal system
  if (id.includes('/components/Modal')) {
    return 'modal';
  }
  
  // Icons
  if (id.includes('react-icons')) {
    return 'icons';
  }
  
  // Other node_modules
  if (id.includes('node_modules')) {
    return 'vendor';
  }
}

export function assetFileNames(assetInfo) {
  if (assetInfo.name?.endsWith('.css')) {
    if (assetInfo.name.includes('global') || assetInfo.name.includes('base')) {
      return 'assets/critical-[hash][extname]';
    }
    return 'assets/styles-[hash][extname]';
  }
  return 'assets/[name]-[hash][extname]';
}