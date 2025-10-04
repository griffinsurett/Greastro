// src/utils/pages.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getCollection } from 'astro:content';
import { getCollectionMeta } from '@/utils/collections';
import type { MetaData } from '@/content/schema';
import { getItemProperty } from '@/utils/metaOverrides';

/**
 * Determines if an individual item should have its own page
 */
export function shouldItemHavePage(
  item: CollectionEntry<CollectionKey>,
  meta: MetaData
): boolean {
  return getItemProperty(
    item.data,
    meta,
    'hasPage',      // item-level property
    'itemsHasPage', // collection-level property
    true            // default value
  );
}

/**
 * Determines if a collection should have an index page
 */
export function shouldCollectionHavePage(meta: MetaData): boolean {
  return meta.hasPage !== false;
}

/**
 * Determines if a collection should be processed for static page generation
 */
export async function shouldProcessCollection(
  collectionName: CollectionKey
): Promise<boolean> {
  const meta = getCollectionMeta(collectionName);
  
  // If collection allows item pages, process it
  if (meta.itemsHasPage !== false) {
    return true;
  }
  
  // Otherwise, check if any individual items override this
  const entries = await getCollection(collectionName);
  return entries.some(entry => {
    const itemData = entry.data as any;
    return itemData.hasPage === true;
  });
}