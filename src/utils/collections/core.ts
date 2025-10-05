// src/utils/collections/core.ts
/**
 * Core Collection Management Utilities
 * 
 * This module provides fundamental functions for working with Astro content collections.
 * It handles:
 * - Retrieving all collection names from the config
 * - Extracting unique identifiers (slugs/ids) from collection entries
 * - Loading collections with their associated metadata from _meta.mdx files
 * 
 * These are the building blocks used throughout the application for collection handling.
 */

import { getCollection } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import { collections } from '@/content/config';
import type { MetaData } from '@/content/schema';

/**
 * Get all collection names defined in the content config
 * 
 * @returns Array of collection name strings
 * @example
 * getCollectionNames() // ['blog', 'authors', 'services', ...]
 */
export function getCollectionNames(): string[] {
  return Object.keys(collections);
}

/**
 * Type representing any valid collection entry or generic item with slug/id
 */
type AnyItem = CollectionEntry<CollectionKey> | { slug?: string; id?: string; [key: string]: unknown };

/**
 * Extract the unique identifier from a collection entry
 * 
 * Tries to get the slug first (preferred for URLs), falls back to id.
 * This ensures consistent key extraction across different entry types.
 * 
 * @param item - Collection entry or object with slug/id
 * @returns The slug or id as a string, empty string if neither exists
 * @example
 * getItemKey({ slug: 'my-post' }) // 'my-post'
 * getItemKey({ id: 'jane-doe' }) // 'jane-doe'
 */
export function getItemKey(item: AnyItem): string {
  if (!item) return "";
  if ('slug' in item && typeof item.slug === 'string' && item.slug) return item.slug;
  if ('id' in item && typeof item.id === 'string' && item.id) return item.id;
  return "";
}

/**
 * Load a collection along with its metadata from _meta.mdx
 * 
 * This function performs two key operations:
 * 1. Loads the collection's metadata from its _meta.mdx file
 * 2. Fetches all entries in the collection
 * 
 * The metadata controls important collection behaviors like whether items
 * should have individual pages, what layout to use, etc.
 * 
 * @param collectionName - Name of the collection to load
 * @returns Object containing entries array, parsed metadata, and collection name
 * @example
 * const { entries, meta } = await getCollectionWithMeta('blog');
 * // entries: all blog posts
 * // meta: parsed _meta.mdx frontmatter
 */
export async function getCollectionWithMeta(collectionName: CollectionKey) {
  // Import schema here to avoid circular dependency at module load time
  const { metaSchema } = await import('@/content/schema');
  
  // Eagerly load all _meta.mdx files
  const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
    "../../content/**/_meta.mdx",
    { eager: true }
  );

  // Find the _meta.mdx file for this specific collection
  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  // Extract frontmatter data, default to empty object if not found
  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  // Create a simple image parser that accepts any value
  // This avoids Astro's image optimization during frontmatter parsing
  const simpleImageFn = () => ({
    parse: (val: any) => val,
    _parse: (val: any) => ({ success: true, data: val })
  });

  // Parse and validate the metadata using the schema
  const meta: MetaData = metaSchema({ image: simpleImageFn }).parse(data);
  
  // Fetch all entries from the collection
  const entries = await getCollection(collectionName);
  
  return { entries, meta, collectionName };
}