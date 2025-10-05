// src/utils/redirects/index.ts
/**
 * Redirect System - Main Entry Point
 * 
 * Orchestrates redirect collection, validation, and configuration building.
 * This is the main file imported by astro.config.mjs.
 */

import { collectAllRedirects } from './collector';
import { validateRedirects } from './validation';
import type { RedirectConfig, RedirectEntry } from './types';

// Re-export types for convenience
export type { RedirectConfig, RedirectEntry } from './types';

/**
 * Build redirect configuration for Astro
 * 
 * Main function called from astro.config.mjs.
 * Collects, validates, and formats redirects.
 * 
 * @param includeWarnings - Whether to log warnings (default: true)
 * @returns Redirect configuration object for Astro
 * @throws Error if validation fails
 */
export function buildRedirectConfig(includeWarnings: boolean = true): RedirectConfig {
  // Collect all redirects from filesystem
  const redirects = collectAllRedirects();
  
  // Validate for security and correctness
  const validation = validateRedirects(redirects);
  
  // Log validation results
  if (validation.errors.length > 0) {
    console.error('\n❌ Redirect validation errors:');
    validation.errors.forEach(error => console.error(`  ${error}`));
    console.error('');
    throw new Error('Redirect configuration has errors. Please fix them before building.');
  }
  
  if (includeWarnings && validation.warnings.length > 0) {
    console.warn('\n⚠️  Redirect warnings:');
    validation.warnings.forEach(warning => console.warn(`  ${warning}`));
    console.warn('');
  }
  
  // Build config object, removing duplicates
  const config: RedirectConfig = {};
  const seen = new Set<string>();
  
  for (const redirect of redirects) {
    if (seen.has(redirect.from)) {
      continue;
    }
    
    seen.add(redirect.from);
    config[redirect.from] = redirect.to;
  }
  
  if (Object.keys(config).length > 0) {
    console.log(`✅ Generated ${Object.keys(config).length} redirects`);
  }
  
  return config;
}

/**
 * Log all redirects in a readable format
 * Useful for debugging
 * 
 * @param contentDir - Optional content directory path
 */
export function logRedirects(contentDir?: string): void {
  const redirects = collectAllRedirects(contentDir);
  
  console.log('\n📋 All Redirects:');
  console.log('─'.repeat(80));
  
  const byCollection = new Map<string, RedirectEntry[]>();
  
  for (const redirect of redirects) {
    const collection = redirect.source.split('/')[0];
    const existing = byCollection.get(collection) || [];
    existing.push(redirect);
    byCollection.set(collection, existing);
  }
  
  for (const [collection, items] of byCollection) {
    console.log(`\n${collection}:`);
    for (const redirect of items) {
      console.log(`  ${redirect.from} → ${redirect.to}`);
    }
  }
  
  console.log('\n' + '─'.repeat(80));
}