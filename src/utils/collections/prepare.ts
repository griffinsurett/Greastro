// src/utils/collections/prepare.ts
import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { MetaData, BaseData } from "@/content/schema";
import { getItemKey } from './core';
import { processDataForReferences } from './references';
import { shouldItemHavePage } from '@/utils/pages';

export interface PreparedFields {
  slug: string;
  url?: string;
}

export type PreparedItem = BaseData & PreparedFields & Record<string, any>;

export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  const identifier = getItemKey(entry);
  
  const processedData = await processDataForReferences(entry.data);
  
  const hasExistingUrl = processedData.url !== undefined;
  
  return {
    ...processedData,
    slug: identifier,
    ...(!hasExistingUrl && shouldItemHavePage(entry, meta) && {
      url: `/${collection}/${identifier}`
    })
  } as PreparedItem;
}

export async function prepareCollectionEntries<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T,
  meta: MetaData
): Promise<PreparedItem[]> {
  return Promise.all(
    entries.map(entry => prepareEntry(entry, collection, meta))
  );
}