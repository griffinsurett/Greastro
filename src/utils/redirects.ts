// src/utils/redirects.ts
/**
 * Redirect Collection and Management
 * 
 * This utility scans all collections and items for `redirectFrom` fields
 * and generates a comprehensive redirect configuration for Astro.
 * 
 * Supports:
 * - Collection-level redirects (from _meta.mdx)
 * - Item-level redirects (from individual entries)
 * - Validation to prevent conflicts and security issues
 * - Automatic trailing slash handling
 * 
 * Security features:
 * - Prevents external redirects
 * - Blocks protocol handlers (javascript:, data:, etc.)
 * - Validates path format
 * - Detects circular and self-redirects
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Redirect configuration object for Astro
 */
export interface RedirectConfig {
  [from: string]: string;
}

/**
 * Individual redirect entry with metadata
 */
export interface RedirectEntry {
  from: string;
  to: string;
  source: string;
  type: 'collection' | 'item';
}

/**
 * Simple frontmatter parser - extracts only what we need
 * Looks for redirectFrom, hasPage, and itemsHasPage fields
 */
function parseFrontmatter(filePath: string): {
  redirectFrom?: string[];
  hasPage?: boolean;
  itemsHasPage?: boolean;
} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract frontmatter block between --- markers
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return {};
    }
    
    const frontmatter = frontmatterMatch[1];
    const result: any = {};
    
    // Parse redirectFrom field (can be string or array)
    const redirectFromMatch = frontmatter.match(/redirectFrom:\s*(.+?)(?=\n\w+:|$)/s);
    if (redirectFromMatch) {
      const value = redirectFromMatch[1].trim();
      
      // Check if it's an array format
      if (value.startsWith('[') || value.startsWith('-')) {
        // Array format - either YAML flow [a, b] or block - a\n - b
        const items: string[] = [];
        
        if (value.startsWith('[')) {
          // Flow array: ["/contact", "/contact-us"]
          const arrayContent = value.match(/\[(.*?)\]/s)?.[1] || '';
          items.push(
            ...arrayContent
              .split(',')
              .map(s => s.trim().replace(/['"]/g, ''))
              .filter(Boolean)
          );
        } else {
          // Block array:
          // - "/contact"
          // - "/contact-us"
          const lines = value.split('\n');
          for (const line of lines) {
            const match = line.match(/^\s*-\s*["']?([^"'\n]+)["']?/);
            if (match) {
              items.push(match[1].trim());
            }
          }
        }
        
        result.redirectFrom = items;
      } else {
        // Single string value
        result.redirectFrom = [value.replace(/['"]/g, '')];
      }
    }
    
    // Parse hasPage (boolean)
    const hasPageMatch = frontmatter.match(/hasPage:\s*(true|false)/);
    if (hasPageMatch) {
      result.hasPage = hasPageMatch[1] === 'true';
    }
    
    // Parse itemsHasPage (boolean)
    const itemsHasPageMatch = frontmatter.match(/itemsHasPage:\s*(true|false)/);
    if (itemsHasPageMatch) {
      result.itemsHasPage = itemsHasPageMatch[1] === 'true';
    }
    
    return result;
  } catch (error) {
    console.warn(`Failed to parse ${filePath}:`, error);
    return {};
  }
}

/**
 * Normalize a path for redirect matching
 * Ensures consistent format with leading slash, no trailing slash
 * 
 * @param path - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(inputPath: string): string {
  let normalized = inputPath.trim();
  
  // Add leading slash if missing
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Validate that a redirect path is safe and properly formatted
 * 
 * Security checks:
 * - Prevents external URLs (http://, https://)
 * - Blocks protocol handlers (javascript:, data:, vbscript:, etc.)
 * - Prevents special characters that could cause XSS
 * - Ensures absolute path format
 * 
 * @param path - Path to validate
 * @returns true if valid, false otherwise
 */
function isValidRedirectPath(inputPath: string): boolean {
  // Must not be empty
  if (!inputPath || inputPath.trim() === '') {
    return false;
  }
  
  const path = inputPath.trim();
  
  // No external URLs allowed
  if (path.match(/^https?:\/\//i)) {
    return false;
  }
  
  // No protocol handlers allowed (security risk)
  if (path.match(/^(javascript|data|vbscript|file|about):/i)) {
    return false;
  }
  
  // No special characters that could cause XSS or parsing issues
  if (path.match(/[<>"'`]/)) {
    return false;
  }
  
  // Must be absolute path (start with /)
  if (!path.startsWith('/')) {
    return false;
  }
  
  return true;
}

/**
 * Validate a single redirect target
 * 
 * @param to - Target path
 * @param from - Source path
 * @param source - Source file (for error reporting)
 * @returns Error message if invalid, null if valid
 */
function validateRedirectTarget(to: string, from: string, source: string): string | null {
  // Check if target path is valid
  if (!isValidRedirectPath(to)) {
    // Determine specific reason for better error message
    if (to.match(/^https?:\/\//i)) {
      return `External redirect not allowed: "${from}" -> "${to}" in ${source}. Only internal paths are permitted.`;
    }
    
    if (to.match(/^(javascript|data|vbscript|file|about):/i)) {
      return `Protocol handler not allowed: "${from}" -> "${to}" in ${source}. This is a security risk.`;
    }
    
    if (to.match(/[<>"'`]/)) {
      return `Invalid characters in redirect target: "${from}" -> "${to}" in ${source}. Special characters like <>"'\` are not allowed.`;
    }
    
    if (!to.startsWith('/')) {
      return `Redirect target must be absolute path: "${from}" -> "${to}" in ${source}. Path must start with /.`;
    }
    
    return `Invalid redirect target: "${from}" -> "${to}" in ${source}`;
  }
  
  // Check if source path is valid
  if (!isValidRedirectPath(from)) {
    return `Invalid redirect source: "${from}" in ${source}. Path must be a valid absolute path.`;
  }
  
  return null;
}

/**
 * Get all collection directories
 * 
 * @param contentDir - Path to content directory
 * @returns Array of collection directory names
 */
function getCollectionDirs(contentDir: string): string[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !name.startsWith('.') && !name.startsWith('_'));
}

/**
 * Collect redirects from a collection's _meta.mdx file
 * 
 * @param collectionName - Collection to process
 * @param contentDir - Path to content directory
 * @returns Array of redirect entries
 */
function collectCollectionRedirects(
  collectionName: string,
  contentDir: string
): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];
  const metaPath = path.join(contentDir, collectionName, '_meta.mdx');
  
  if (!fs.existsSync(metaPath)) {
    return redirects;
  }
  
  const meta = parseFrontmatter(metaPath);
  
  // Only process if collection has a page
  if (meta.hasPage === false) {
    return redirects;
  }
  
  if (!meta.redirectFrom || meta.redirectFrom.length === 0) {
    return redirects;
  }
  
  const targetPath = `/${collectionName}`;
  
  for (const fromPath of meta.redirectFrom) {
    redirects.push({
      from: normalizePath(fromPath),
      to: targetPath,
      source: `${collectionName}/_meta.mdx`,
      type: 'collection',
    });
  }
  
  return redirects;
}

/**
 * Collect redirects from individual items in a collection
 * 
 * @param collectionName - Collection to process
 * @param contentDir - Path to content directory
 * @returns Array of redirect entries
 */
function collectItemRedirects(
  collectionName: string,
  contentDir: string
): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];
  const collectionDir = path.join(contentDir, collectionName);
  
  if (!fs.existsSync(collectionDir)) {
    return redirects;
  }
  
  // Read collection meta for itemsHasPage default
  const metaPath = path.join(collectionDir, '_meta.mdx');
  const meta = fs.existsSync(metaPath) ? parseFrontmatter(metaPath) : {};
  const itemsHasPageDefault = meta.itemsHasPage !== false;
  
  // Get all content files
  const files = fs.readdirSync(collectionDir);
  const contentFiles = files.filter(file => 
    (file.endsWith('.mdx') || file.endsWith('.md')) && 
    !file.startsWith('_')
  );
  
  for (const file of contentFiles) {
    const filePath = path.join(collectionDir, file);
    const data = parseFrontmatter(filePath);
    
    // Check if item should have a page
    const hasPage = data.hasPage !== undefined ? data.hasPage : itemsHasPageDefault;
    if (!hasPage) {
      continue;
    }
    
    if (!data.redirectFrom || data.redirectFrom.length === 0) {
      continue;
    }
    
    // Extract slug from filename
    const slug = file.replace(/\.(mdx|md)$/, '');
    const targetPath = `/${collectionName}/${slug}`;
    
    for (const fromPath of data.redirectFrom) {
      redirects.push({
        from: normalizePath(fromPath),
        to: targetPath,
        source: `${collectionName}/${slug}`,
        type: 'item',
      });
    }
  }
  
  return redirects;
}

/**
 * Validate redirects for conflicts and security issues
 * 
 * Checks for:
 * - Duplicate source paths
 * - Circular redirects
 * - Self-redirects
 * - Invalid/unsafe redirect targets
 * - Invalid/unsafe redirect sources
 * 
 * @param redirects - Array of redirect entries to validate
 * @returns Object with isValid flag, errors, and warnings
 */
export function validateRedirects(redirects: RedirectEntry[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fromPaths = new Map<string, RedirectEntry[]>();
  
  // Validate each redirect target and source
  for (const redirect of redirects) {
    const validationError = validateRedirectTarget(redirect.to, redirect.from, redirect.source);
    if (validationError) {
      errors.push(validationError);
    }
  }
  
  // Group redirects by source path
  for (const redirect of redirects) {
    const existing = fromPaths.get(redirect.from) || [];
    existing.push(redirect);
    fromPaths.set(redirect.from, existing);
  }
  
  // Check for duplicate source paths
  for (const [from, entries] of fromPaths) {
    if (entries.length > 1) {
      const destinations = entries.map(e => e.to);
      const sources = entries.map(e => e.source);
      
      // If all redirect to same place, it's just a warning
      if (new Set(destinations).size === 1) {
        warnings.push(
          `Duplicate redirect from "${from}" defined in: ${sources.join(', ')}`
        );
      } else {
        errors.push(
          `Conflicting redirects from "${from}":\n` +
          entries.map(e => `  - ${e.source} -> ${e.to}`).join('\n')
        );
      }
    }
  }
  
  // Check for self-redirects
  for (const redirect of redirects) {
    if (redirect.from === redirect.to) {
      errors.push(
        `Self-redirect detected: "${redirect.from}" -> "${redirect.to}" in ${redirect.source}`
      );
    }
  }
  
  // Check for circular redirects
  const visited = new Set<string>();
  const checkCircular = (from: string, path: string[] = []): boolean => {
    if (path.includes(from)) {
      errors.push(
        `Circular redirect detected: ${[...path, from].join(' -> ')}`
      );
      return true;
    }
    
    if (visited.has(from)) {
      return false;
    }
    
    visited.add(from);
    const redirect = redirects.find(r => r.from === from);
    
    if (redirect) {
      return checkCircular(redirect.to, [...path, from]);
    }
    
    return false;
  };
  
  for (const redirect of redirects) {
    if (!visited.has(redirect.from)) {
      checkCircular(redirect.from);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Collect all redirects from all collections
 * 
 * @param contentDir - Path to content directory (defaults to src/content)
 * @returns Object with redirects array and validation results
 */
export function collectAllRedirects(
  contentDir: string = path.join(process.cwd(), 'src', 'content')
): {
  redirects: RedirectEntry[];
  validation: ReturnType<typeof validateRedirects>;
} {
  const allRedirects: RedirectEntry[] = [];
  const collectionDirs = getCollectionDirs(contentDir);
  
  for (const collectionName of collectionDirs) {
    try {
      const collectionRedirects = collectCollectionRedirects(collectionName, contentDir);
      allRedirects.push(...collectionRedirects);
      
      const itemRedirects = collectItemRedirects(collectionName, contentDir);
      allRedirects.push(...itemRedirects);
    } catch (error) {
      console.error(`Error collecting redirects from ${collectionName}:`, error);
    }
  }
  
  const validation = validateRedirects(allRedirects);
  
  return {
    redirects: allRedirects,
    validation,
  };
}

/**
 * Build redirect configuration for Astro
 * 
 * Converts redirect entries to Astro's expected format.
 * Handles duplicates by keeping first occurrence.
 * Validates all redirects for security and correctness.
 * 
 * @param includeWarnings - Whether to log warnings (default: true)
 * @returns Redirect configuration object for Astro config
 * @throws Error if validation fails
 */
export function buildRedirectConfig(includeWarnings: boolean = true): RedirectConfig {
  const { redirects, validation } = collectAllRedirects();
  
  // Log validation results
  if (validation.errors.length > 0) {
    console.error('\n❌ Redirect validation errors:');
    validation.errors.forEach(error => console.error(`  ${error}`));
    console.error(''); // Empty line for readability
    throw new Error('Redirect configuration has errors. Please fix them before building.');
  }
  
  if (includeWarnings && validation.warnings.length > 0) {
    console.warn('\n⚠️  Redirect warnings:');
    validation.warnings.forEach(warning => console.warn(`  ${warning}`));
    console.warn(''); // Empty line for readability
  }
  
  // Build config object
  const config: RedirectConfig = {};
  const seen = new Set<string>();
  
  for (const redirect of redirects) {
    // Skip duplicates (keep first occurrence)
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
 * @param redirects - Redirects to log
 */
export function logRedirects(redirects: RedirectEntry[]): void {
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