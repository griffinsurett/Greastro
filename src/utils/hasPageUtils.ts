// src/utils/hasPageUtils.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getCollection } from 'astro:content';
import { getCollectionMeta } from '@/utils/fetchMeta';

/**
 * Determines if an individual item should have a page
 * Individual item's hasPage overrides collection's itemsHasPage
 */
export function shouldItemHavePage(
  item: CollectionEntry<CollectionKey>,
  collectionMeta: ReturnType<typeof getCollectionMeta>
): boolean {
  // If item explicitly sets hasPage, use that
  if ('hasPage' in item.data && typeof item.data.hasPage === 'boolean') {
    return item.data.hasPage;
  }
  
  // Otherwise use collection's itemsHasPage setting (defaults to true)
  return collectionMeta.itemsHasPage !== false;
}

/**
 * Determines if a collection should have an index page
 */
export function shouldCollectionHavePage(
  collectionMeta: ReturnType<typeof getCollectionMeta>
): boolean {
  return collectionMeta.hasPage !== false;
}

/**
 * Determines if we should process a collection for individual item pages
 * Returns true if ANY item in the collection might have a page
 */
export async function shouldProcessCollectionItems(
  collectionName: CollectionKey
): Promise<boolean> {
  const meta = getCollectionMeta(collectionName);
  
  // If itemsHasPage is true, we definitely need to process
  if (meta.itemsHasPage !== false) {
    return true;
  }
  
  // If itemsHasPage is false, check if any items override with hasPage: true
  const entries = await getCollection(collectionName);
  return entries.some(entry => 
    'hasPage' in entry.data && entry.data.hasPage === true
  );
}