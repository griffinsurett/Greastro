// src/utils/redirects/collector.ts
/**
 * Redirect Collection from Filesystem
 * 
 * Scans content collections and extracts redirect configurations
 * from _meta.mdx files and individual content items.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../filesystem/frontmatter';
import { normalizePath } from '../pathValidation';
import type { RedirectEntry } from './types';

/**
 * Get all collection directories
 * 
 * @param contentDir - Path to content directory
 * @returns Array of collection names
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
 * Normalize redirectFrom field to array
 * 
 * @param redirectFrom - Value from frontmatter
 * @returns Array of redirect paths
 */
function normalizeRedirectFrom(redirectFrom: any): string[] {
  if (!redirectFrom) return [];
  if (Array.isArray(redirectFrom)) return redirectFrom;
  if (typeof redirectFrom === 'string') return [redirectFrom];
  return [];
}

/**
 * Collect redirects from a collection's _meta.mdx file
 * 
 * @param collectionName - Collection to process
 * @param contentDir - Path to content directory
 * @returns Array of redirect entries
 */
export function collectCollectionRedirects(
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
  
  const redirectFromPaths = normalizeRedirectFrom(meta.redirectFrom);
  
  if (redirectFromPaths.length === 0) {
    return redirects;
  }
  
  const targetPath = `/${collectionName}`;
  
  for (const fromPath of redirectFromPaths) {
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
export function collectItemRedirects(
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
    
    const redirectFromPaths = normalizeRedirectFrom(data.redirectFrom);
    
    if (redirectFromPaths.length === 0) {
      continue;
    }
    
    // Extract slug from filename
    const slug = file.replace(/\.(mdx|md)$/, '');
    
    // Determine target path based on rootPath setting
    const useRootPath = data.rootPath !== undefined 
      ? data.rootPath 
      : (meta.itemsRootPath !== undefined ? meta.itemsRootPath : false);
    
    const targetPath = useRootPath ? `/${slug}` : `/${collectionName}/${slug}`;
    
    for (const fromPath of redirectFromPaths) {
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
 * Collect all redirects from all collections
 * 
 * @param contentDir - Path to content directory
 * @returns Array of all redirect entries
 */
export function collectAllRedirects(
  contentDir: string = path.join(process.cwd(), 'src', 'content')
): RedirectEntry[] {
  const allRedirects: RedirectEntry[] = [];
  const collectionDirs = getCollectionDirs(contentDir);
  
  for (const collectionName of collectionDirs) {
    try {
      // Collection-level redirects
      const collectionRedirects = collectCollectionRedirects(collectionName, contentDir);
      allRedirects.push(...collectionRedirects);
      
      // Item-level redirects
      const itemRedirects = collectItemRedirects(collectionName, contentDir);
      allRedirects.push(...itemRedirects);
    } catch (error) {
      console.error(`Error collecting redirects from ${collectionName}:`, error);
    }
  }
  
  return allRedirects;
}