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
 * Get property value using override pattern
 * Item property > Collection property > Default
 * 
 * @param itemData - Item frontmatter data
 * @param metaData - Collection meta data
 * @param itemKey - Property key on item
 * @param metaKey - Property key on meta
 * @param defaultValue - Default value
 * @returns Resolved property value
 */
function getItemProperty<T>(
  itemData: any,
  metaData: any,
  itemKey: string,
  metaKey: string,
  defaultValue: T
): T {
  if (itemData?.[itemKey] !== undefined) {
    return itemData[itemKey];
  }
  if (metaData?.[metaKey] !== undefined) {
    return metaData[metaKey];
  }
  return defaultValue;
}

/**
 * Determine if an item should have a page
 * 
 * @param itemData - Item frontmatter
 * @param metaData - Collection meta
 * @returns True if item should have a page
 */
function shouldItemHavePage(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'hasPage', 'itemsHasPage', true);
}

/**
 * Determine if an item should use root path
 * 
 * @param itemData - Item frontmatter
 * @param metaData - Collection meta
 * @returns True if item should be at root level
 */
function shouldItemUseRootPath(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'rootPath', 'itemsRootPath', false);
}

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
    
    // Skip items without pages
    if (!shouldItemHavePage(itemData, meta)) {
      continue;
    }
    
    // Extract slug from filename
    const slug = file.replace(/\.(mdx|md)$/, '');
    
    // Determine paths
    const rootPath = `/${slug}`;
    const collectionPath = `/${collectionName}/${slug}`;
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