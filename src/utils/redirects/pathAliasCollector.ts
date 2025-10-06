// src/utils/redirects/pathAliasCollector.ts
/**
 * Path Alias Redirect Collector
 * 
 * Automatically generates redirects between root-level and collection-level paths.
 * Ensures users never hit 404s when accessing items via alternate paths.
 * 
 * Examples:
 * - Item at /about (rootPath: true) → Redirect /pages/about to /about
 * - Item at /blog/post (rootPath: false) → Redirect /post to /blog/post
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../filesystem/frontmatter';
import { normalizePath } from '../pathValidation';
import { getCollectionDirs } from '../filesystem/shared';
import { shouldItemHavePage, shouldItemUseRootPath } from '../filesystem/pageLogic';
import type { RedirectEntry } from './types';

/**
 * Collect path alias redirects for a single collection
 * 
 * For each item that has a page:
 * - If rootPath: true → Redirect /collection/slug to /slug
 * - If rootPath: false → Redirect /slug to /collection/slug
 * 
 * @param collectionName - Collection to process
 * @param contentDir - Path to content directory
 * @returns Array of redirect entries
 */
export function collectPathAliasRedirects(
  collectionName: string,
  contentDir: string
): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];
  const collectionDir = path.join(contentDir, collectionName);
  
  if (!fs.existsSync(collectionDir)) {
    return redirects;
  }
  
  // Read collection meta for defaults
  const metaPath = path.join(collectionDir, '_meta.mdx');
  const meta = fs.existsSync(metaPath) ? parseFrontmatter(metaPath) : {};
  
  // Get all content files
  const files = fs.readdirSync(collectionDir);
  const contentFiles = files.filter(file => 
    (file.endsWith('.mdx') || file.endsWith('.md')) && 
    !file.startsWith('_')
  );
  
  for (const file of contentFiles) {
    const filePath = path.join(collectionDir, file);
    const itemData = parseFrontmatter(filePath);
    
    // Skip items without pages - using Node.js-compatible function from filesystem/pageLogic
    if (!shouldItemHavePage(itemData, meta)) {
      continue;
    }
    
    // Extract slug from filename
    const slug = file.replace(/\.(mdx|md)$/, '');
    
    // Determine paths
    const rootPath = `/${slug}`;
    const collectionPath = `/${collectionName}/${slug}`;
    
    // Use Node.js-compatible function from filesystem/pageLogic
    const useRootPath = shouldItemUseRootPath(itemData, meta);
    
    // Create redirect based on rootPath setting
    if (useRootPath) {
      // Item is at root level, redirect collection path to root
      redirects.push({
        from: normalizePath(collectionPath),
        to: normalizePath(rootPath),
        source: `${collectionName}/${slug} (path-alias)`,
        type: 'path-alias',
      });
    } else {
      // Item is at collection level, redirect root path to collection
      redirects.push({
        from: normalizePath(rootPath),
        to: normalizePath(collectionPath),
        source: `${collectionName}/${slug} (path-alias)`,
        type: 'path-alias',
      });
    }
  }
  
  return redirects;
}

/**
 * Collect all path alias redirects from all collections
 * 
 * @param contentDir - Path to content directory
 * @returns Array of all path alias redirect entries
 */
export function collectAllPathAliasRedirects(
  contentDir: string = path.join(process.cwd(), 'src', 'content')
): RedirectEntry[] {
  const allRedirects: RedirectEntry[] = [];
  const collectionDirs = getCollectionDirs(contentDir);
  
  for (const collectionName of collectionDirs) {
    try {
      const pathRedirects = collectPathAliasRedirects(collectionName, contentDir);
      allRedirects.push(...pathRedirects);
    } catch (error) {
      console.error(`Error collecting path alias redirects from ${collectionName}:`, error);
    }
  }
  
  return allRedirects;
}