// src/utils/filesystem/pageLogic.ts
/**
 * Node.js-Compatible Page Logic
 * 
 * ⚠️ IMPORTANT: This file contains INTENTIONAL DUPLICATES of functions from src/utils/pages.ts
 * 
 * WHY THESE DUPLICATES EXIST:
 * - This file runs in pure Node.js context (astro.config.mjs, loaders, build scripts)
 * - The main pages.ts file imports from 'astro:content' which is a virtual module
 * - Virtual modules only exist AFTER Astro initializes, not during config/build time
 * - Therefore, we need Node.js-compatible versions that work with raw frontmatter data
 * 
 * WHEN TO USE THIS FILE:
 * - ✅ In astro.config.mjs
 * - ✅ In custom loaders
 * - ✅ In build scripts that run before Astro
 * - ✅ In redirect collectors
 * - ❌ In Astro page files (.astro)
 * - ❌ In components that run during build
 * 
 * MAINTENANCE NOTE:
 * - If you update the logic in src/utils/pages.ts, update these functions too!
 * - These use the same getItemProperty pattern but work with plain objects
 * - The actual logic should remain identical to pages.ts
 */

/**
 * Get property value using override pattern
 * Item property > Collection property > Default
 * 
 * This is a Node.js-compatible version that works with plain objects
 * instead of Astro CollectionEntry types.
 * 
 * @param itemData - Item frontmatter data (plain object from parseFrontmatter)
 * @param metaData - Collection meta data (plain object from parseFrontmatter)
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
 * Determine if an item should have a page (Node.js version)
 * 
 * Uses override pattern:
 * - Item's hasPage field (if present)
 * - Collection's itemsHasPage setting from _meta.mdx
 * - Default: true (most items should have pages)
 * 
 * @param itemData - Item frontmatter (plain object from parseFrontmatter)
 * @param metaData - Collection meta (plain object from parseFrontmatter)
 * @returns True if item should have a page
 */
export function shouldItemHavePage(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'hasPage', 'itemsHasPage', true);
}

/**
 * Determine if an item should use root path (Node.js version)
 * 
 * Uses override pattern:
 * - Item's rootPath field (if present)
 * - Collection's itemsRootPath setting from _meta.mdx
 * - Default: false (most items use collection paths)
 * 
 * When true, item is accessible at /slug instead of /collection/slug
 * 
 * @param itemData - Item frontmatter (plain object from parseFrontmatter)
 * @param metaData - Collection meta (plain object from parseFrontmatter)
 * @returns True if item should use root path
 */
export function shouldItemUseRootPath(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'rootPath', 'itemsRootPath', false);
}