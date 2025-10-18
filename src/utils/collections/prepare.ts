// src/utils/collections/prepare.ts
/**
 * Collection Entry Preparation and Processing
 * 
 * This module handles transforming raw collection entries into "prepared" items
 * that are ready for use in pages and components. Preparation includes:
 * - Adding slug and URL fields
 * - Determining correct URL path (collection or root level)
 * 
 * References are NOT resolved here - components query for them as needed.
 */

import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { MetaData, BaseData } from "@/content/schema";
import { getItemKey } from './core';
import { shouldItemHavePage, shouldItemUseRootPath } from '@/utils/pages';

/**
 * Fields added during the preparation process
 */
export interface PreparedFields {
  slug: string;      // URL-safe identifier
  url?: string;      // Full URL path (if item has a page)
}

/**
 * A fully prepared collection item with URLs generated
 * Extends BaseData to include all common schema fields
 */
export type PreparedItem = BaseData & PreparedFields;

/**
 * Prepare a single collection entry for use in pages/components
 * 
 * This function:
 * 1. Extracts the entry's unique identifier (slug/id)
 * 2. Determines if item should use root path or collection path
 * 3. Generates URL if the item should have its own page
 * 4. Preserves any existing URL (e.g., from menu-items loader)
 * 5. Keeps references as-is (components will query for them)
 * 
 * @param entry - Raw collection entry from Astro
 * @param collection - Name of the collection this entry belongs to
 * @param meta - Collection metadata from _meta.mdx
 * @returns Prepared item with slug and URL ready to use
 * @example
 * const prepared = await prepareEntry(blogPost, 'blog', blogMeta);
 * // prepared.slug: 'my-post'
 * // prepared.url: '/blog/my-post' (or '/my-post' if rootPath: true)
 * // prepared.author: { collection: 'authors', id: 'jane-doe' } // RAW reference
 */
export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  // Get the unique identifier for this entry
  const identifier = getItemKey(entry);
  
  // Keep raw data - components will query for references themselves
  const data = entry.data as Record<string, any>;
  
  // Check if this entry already has a URL (e.g., from a custom loader)
  const hasExistingUrl = data.url !== undefined;
  
  // Determine if item should have a page
  const hasPage = shouldItemHavePage(entry, meta);
  
  // Determine URL path based on rootPath setting
  let itemUrl: string | undefined;
  if (!hasExistingUrl && hasPage) {
    const useRootPath = shouldItemUseRootPath(entry, meta);
    itemUrl = useRootPath ? `/${identifier}` : `/${collection}/${identifier}`;
  }
  
  // Return the prepared item with slug and conditional URL
  return {
    ...data,
    slug: identifier,
    ...(itemUrl && { url: itemUrl })
  } as PreparedItem;
}

/**
 * Prepare all entries in a collection
 * 
 * Calls prepareEntry for each entry in the collection and returns
 * an array of prepared items ready for rendering.
 * 
 * @param entries - Array of raw collection entries
 * @param collection - Collection name
 * @param meta - Collection metadata
 * @returns Array of prepared items
 * @example
 * const prepared = await prepareCollectionEntries(blogEntries, 'blog', blogMeta);
 * // Ready to use in ContentRenderer or page
 */
export async function prepareCollectionEntries<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T,
  meta: MetaData
): Promise<PreparedItem[]> {
  return Promise.all(
    entries.map(entry => prepareEntry(entry, collection, meta))
  );
}