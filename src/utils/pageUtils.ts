// src/utils/pageUtils.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getCollection } from 'astro:content';
import { getCollectionMeta } from '@/utils/fetchMeta';
import type { MetaData } from '@/content/schema';
import type { PageGenerationConfig } from '@/types';

/**
 * SINGLE FUNCTION to determine page generation
 * Replaces: shouldItemHavePage, shouldCollectionHavePage, shouldProcessCollectionItems
 */
export function shouldGeneratePage(config: PageGenerationConfig): boolean {
  const { itemData, meta, type } = config;
  
  if (type === 'item') {
    // Item's explicit hasPage overrides collection default
    if (itemData?.hasPage !== undefined) {
      return itemData.hasPage;
    }
    // Fall back to collection's itemsHasPage setting
    return meta.itemsHasPage !== false;
  }
  
  if (type === 'collection') {
    // Collection index page setting
    return meta.hasPage !== false;
  }
  
  return true; // Default to generating pages
}

/**
 * Check if we should process items for a collection
 * (i.e., if ANY items might need pages)
 */
export async function shouldProcessCollection(
  collectionName: CollectionKey
): Promise<boolean> {
  const meta = getCollectionMeta(collectionName);
  
  // If collection-wide itemsHasPage is true, we need to process
  if (meta.itemsHasPage !== false) {
    return true;
  }
  
  // If false, check if any individual items override with hasPage: true
  const entries = await getCollection(collectionName);
  return entries.some(entry => {
    const itemData = { hasPage: entry.data.hasPage };
    return shouldGeneratePage({ itemData, meta, type: 'item' });
  });
}

/**
 * Convenience wrappers for better readability
 */
export function shouldItemHavePage(
  item: CollectionEntry<CollectionKey>,
  meta: MetaData
): boolean {
  return shouldGeneratePage({
    itemData: { hasPage: item.data.hasPage },
    meta,
    type: 'item'
  });
}

export function shouldCollectionHavePage(meta: MetaData): boolean {
  return shouldGeneratePage({
    meta,
    type: 'collection'
  });
}