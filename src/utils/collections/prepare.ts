// src/utils/collections/prepare.ts
/**
 * Collection Entry Preparation and Processing
 * 
 * This module handles transforming raw collection entries into "prepared" items
 * that are ready for use in pages and components. Preparation includes:
 * - Resolving collection references to actual data
 * - Adding slug and URL fields
 * - Processing nested references recursively
 * 
 * The prepared items have all the data needed to render them without
 * additional lookups.
 */

import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { MetaData, BaseData } from "@/content/schema";
import { getItemKey } from './core';
import { processDataForReferences } from './references';
import { shouldItemHavePage } from '@/utils/pages';

/**
 * Fields added during the preparation process
 */
export interface PreparedFields {
  slug: string;      // URL-safe identifier
  url?: string;      // Full URL path (if item has a page)
}

/**
 * A fully prepared collection item with all data resolved and URLs generated
 */
export type PreparedItem = BaseData & PreparedFields & Record<string, any>;

/**
 * Prepare a single collection entry for use in pages/components
 * 
 * This function:
 * 1. Extracts the entry's unique identifier (slug/id)
 * 2. Recursively resolves any collection references to actual data
 * 3. Generates URL if the item should have its own page
 * 4. Preserves any existing URL (e.g., from menu-items loader)
 * 
 * @param entry - Raw collection entry from Astro
 * @param collection - Name of the collection this entry belongs to
 * @param meta - Collection metadata from _meta.mdx
 * @returns Prepared item with all fields resolved and ready to use
 * @example
 * const prepared = await prepareEntry(blogPost, 'blog', blogMeta);
 * // prepared.slug: 'my-post'
 * // prepared.url: '/blog/my-post'
 * // prepared.author: { name: 'Jane Doe', ... } // resolved from reference
 */
export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  // Get the unique identifier for this entry
  const identifier = getItemKey(entry);
  
  // Resolve any collection references in the entry data
  // (e.g., author reference -> full author object)
  const processedData = await processDataForReferences(entry.data);
  
  // Check if this entry already has a URL (e.g., from a custom loader)
  const hasExistingUrl = processedData.url !== undefined;
  
  // Return the prepared item with slug and conditional URL
  return {
    ...processedData,
    slug: identifier,
    // Only add URL if entry doesn't have one and should have a page
    ...(!hasExistingUrl && shouldItemHavePage(entry, meta) && {
      url: `/${collection}/${identifier}`
    })
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
 * // Ready to use in Section component or page
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