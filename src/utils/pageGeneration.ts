// src/utils/pageGeneration.ts
/**
 * Page Generation Configuration
 * 
 * Controls which collections should generate static pages.
 * Some collections (like menus, menu-items) are data-only
 * and shouldn't create pages.
 * 
 * This separation keeps the page generation clean and prevents
 * creating unnecessary routes.
 */

import type { CollectionKey } from "astro:content";
import { collections } from "@/content/config";

/**
 * Collections that should not generate pages
 * These are data-only collections used for configuration
 */
export const EXCLUDED_COLLECTIONS: CollectionKey[] = ['menu-items', 'menus'];

/**
 * Get all collection names that should generate pages
 * 
 * Filters out system/data-only collections that exist purely
 * for configuration and shouldn't have routes.
 * 
 * @returns Array of collection names that can have pages
 * @example
 * getPageCollections() // ['blog', 'authors', 'services', ...]
 * // Excludes: ['menus', 'menu-items']
 */
export function getPageCollections(): CollectionKey[] {
  return (Object.keys(collections) as CollectionKey[]).filter(
    coll => !EXCLUDED_COLLECTIONS.includes(coll)
  );
}

/**
 * Check if a collection should be excluded from page generation
 * 
 * @param collection - Collection to check
 * @returns True if collection should not generate pages
 */
export function isExcludedCollection(collection: CollectionKey): boolean {
  return EXCLUDED_COLLECTIONS.includes(collection);
}