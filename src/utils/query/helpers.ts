// src/utils/query/helpers.ts
/**
 * Helper utilities for the query system
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getItemKey } from '@/utils/collections';

/**
 * Get a clean ID from an entry specifically for query operations
 * This ensures the ID is normalized for graph lookups
 */
export function getQueryKey(entry: CollectionEntry<CollectionKey>): string {
  // Use getItemKey as base, then ensure it's fully normalized
  const key = getItemKey(entry);
  return normalizeId(key);
}

/**
 * Normalize an ID string
 * Strips file extensions and trims whitespace
 */
export function normalizeId(id: string): string {
  return id
    .replace(/\.(mdx?|json)$/i, '')
    .trim();
}

/**
 * Check if an entry exists in a collection
 */
export async function entryExists(
  collection: CollectionKey,
  id: string
): Promise<boolean> {
  try {
    const { getEntry } = await import('astro:content');
    const entry = await getEntry(collection, normalizeId(id));
    return !!entry;
  } catch {
    return false;
  }
}

/**
 * Safely get an entry, returning undefined if not found
 */
export async function safeGetEntry(
  collection: CollectionKey,
  id: string
): Promise<CollectionEntry<CollectionKey> | undefined> {
  try {
    const { getEntry } = await import('astro:content');
    return await getEntry(collection, normalizeId(id));
  } catch {
    return undefined;
  }
}