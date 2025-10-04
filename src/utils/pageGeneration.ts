// src/utils/pageGeneration.ts
import type { CollectionKey } from "astro:content";
import { collections } from "@/content/config";

/**
 * Collections that should not generate pages
 */
export const EXCLUDED_COLLECTIONS: CollectionKey[] = ['menu-items', 'menus'];

/**
 * Get all collection names excluding system collections
 */
export function getPageCollections(): CollectionKey[] {
  return (Object.keys(collections) as CollectionKey[]).filter(
    coll => !EXCLUDED_COLLECTIONS.includes(coll)
  );
}

/**
 * Check if a collection should be excluded from page generation
 */
export function isExcludedCollection(collection: CollectionKey): boolean {
  return EXCLUDED_COLLECTIONS.includes(collection);
}