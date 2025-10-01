// src/utils/pages.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getCollection } from 'astro:content';
import { getCollectionMeta } from '@/utils/collections';
import type { MetaData } from '@/content/schema';  // ✅ Import from schema

export interface PageGenerationConfig {
  itemData?: { hasPage?: boolean };
  meta: MetaData;  // ✅ Use schema type
  type: 'item' | 'collection';
}

export function shouldGeneratePage(config: PageGenerationConfig): boolean {
  const { itemData, meta, type } = config;
  
  if (type === 'item') {
    if (itemData?.hasPage !== undefined) {
      return itemData.hasPage;
    }
    return meta.itemsHasPage !== false;
  }
  
  if (type === 'collection') {
    return meta.hasPage !== false;
  }
  
  return true;
}

export async function shouldProcessCollection(
  collectionName: CollectionKey
): Promise<boolean> {
  const meta = getCollectionMeta(collectionName);
  
  if (meta.itemsHasPage !== false) {
    return true;
  }
  
  const entries = await getCollection(collectionName);
  return entries.some(entry => {
    const itemData = { hasPage: entry.data.hasPage };
    return shouldGeneratePage({ itemData, meta, type: 'item' });
  });
}

export function shouldItemHavePage(
  item: CollectionEntry<CollectionKey>,  // ✅ Use Astro's type
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