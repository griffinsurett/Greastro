// src/components/section/variants/utils/DataPreparer.ts
import { getCollectionWithMeta, prepareCollectionEntries } from '@/utils/collections';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { PreparedItem } from '@/types';

export async function prepareCollectionData<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T
): Promise<PreparedItem[]> {
  const { meta } = await getCollectionWithMeta(collection);
  return prepareCollectionEntries(entries, collection, meta);
}

export function prepareStaticData(props: Record<string, any>): Record<string, any> {
  return props.items ? props : { items: [], ...props };
}