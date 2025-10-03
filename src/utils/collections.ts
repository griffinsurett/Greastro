// src/utils/collections.ts
import { getCollection, getEntry } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import { metaSchema, type MetaData, type BaseData } from "@/content/schema";
import { shouldItemHavePage } from '@/utils/pages';
import { collections } from '@/content/config';
import { z } from "astro:content";

// ============================================================================
// COLLECTION UTILITIES
// ============================================================================

/**
 * Returns the list of all collection names defined in content/config.ts.
 */
export function getCollectionNames(): string[] {
  return Object.keys(collections);
}

// ============================================================================
// TYPES (co-located with collections logic)
// ============================================================================

export interface PreparedFields {
  slug: string;
  url?: string;
}

export type PreparedItem = BaseData & PreparedFields & Record<string, any>;

// ============================================================================
// ITEM KEY EXTRACTION
// ============================================================================

type AnyItem = CollectionEntry<CollectionKey> | { slug?: string; id?: string; [key: string]: unknown };

export function getItemKey(item: AnyItem): string {
  if (!item) return "";
  if ('slug' in item && typeof item.slug === 'string' && item.slug) return item.slug;
  if ('id' in item && typeof item.id === 'string' && item.id) return item.id;
  return "";
}

// ============================================================================
// META FETCHING
// ============================================================================

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);

const metaImageSchema = () => z.union([
  z.string(),
  z.object({
    src: z.string(),
    alt: z.string().optional(),
  }),
  z.any(),
]);

export function getCollectionMeta(collectionName: string): MetaData {
  let data: Record<string, any> = {};

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  }

  return metaSchema({ image: metaImageSchema }).parse(data);
}

// ============================================================================
// DYNAMIC REFERENCE RESOLUTION
// ============================================================================

function isCollectionReference(value: any): value is { collection: string; id: string } {
  return (
    value &&
    typeof value === 'object' &&
    'collection' in value &&
    'id' in value &&
    typeof value.collection === 'string' &&
    typeof value.id === 'string'
  );
}

async function resolveReference(ref: { collection: string; id: string }): Promise<any> {
  try {
    const entry = await getEntry(ref.collection as CollectionKey, ref.id);
    if (!entry) {
      console.warn(`Reference not found: ${ref.collection}/${ref.id}`);
      return null;
    }
    
    const resolved: any = {
      ...entry.data,
      _collection: ref.collection,
      _id: ref.id,
      slug: getItemKey(entry),
    };
    
    const refMeta = getCollectionMeta(ref.collection);
    if (shouldItemHavePage(entry, refMeta)) {
      resolved.url = `/${ref.collection}/${resolved.slug}`;
    }
    
    if (resolved.title) {
      resolved.name = resolved.title;
      const words = String(resolved.title).split(' ').filter(Boolean);
      resolved.initials = words.map(w => w[0]).join('').toUpperCase();
    }
    
    return resolved;
  } catch (error) {
    console.error(`Error resolving reference ${ref.collection}/${ref.id}:`, error);
    return null;
  }
}

async function processDataForReferences(
  data: any, 
  depth: number = 0, 
  maxDepth: number = 3
): Promise<any> {
  if (depth >= maxDepth) return data;
  if (data == null) return data;
  
  if (isCollectionReference(data)) {
    const resolved = await resolveReference(data);
    return resolved ? await processDataForReferences(resolved, depth + 1, maxDepth) : null;
  }
  
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(item => processDataForReferences(item, depth + 1, maxDepth))
    );
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const processed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_')) {
        processed[key] = value;
      } else {
        processed[key] = await processDataForReferences(value, depth + 1, maxDepth);
      }
    }
    
    return processed;
  }
  
  return data;
}

// ============================================================================
// COLLECTION MANAGER
// ============================================================================

export async function getCollectionWithMeta(collectionName: CollectionKey) {
  const [entries, meta] = await Promise.all([
    getCollection(collectionName),
    Promise.resolve(getCollectionMeta(collectionName))
  ]);
  
  return { entries, meta, collectionName };
}

export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  const identifier = getItemKey(entry);
  
  const processedData = await processDataForReferences(entry.data);
  
  const result: PreparedItem = {
    ...processedData,
    slug: identifier,
  };
  
  // For menu-items, use the slug field as the url
  if (collection === 'menu-items' && processedData.slug) {
    result.url = processedData.slug;
  } 
  // For other collections, add url if they should have pages
  else if (shouldItemHavePage(entry, meta)) {
    result.url = `/${collection}/${identifier}`;
  }
  
  return result;
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