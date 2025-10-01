// src/utils/collections.ts
import { getCollection, getEntry } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import { metaSchema, type MetaData } from "@/content/schema";
import { shouldItemHavePage } from '@/utils/pages';
import type { PreparedItem } from '@/types';
import { z } from "astro:content";

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

/**
 * Resolve a single reference and return all its data
 */
async function resolveReference(ref: { collection: string; id: string }): Promise<any> {
  try {
    const entry = await getEntry(ref.collection as CollectionKey, ref.id);
    if (!entry) {
      console.warn(`Reference not found: ${ref.collection}/${ref.id}`);
      return null;
    }
    
    // Build resolved object with metadata + all entry data
    const resolved: any = {
      ...entry.data,
      _collection: ref.collection,
      _id: ref.id,
      slug: getItemKey(entry),
    };
    
    // Add URL if the referenced item should have a page
    const refMeta = getCollectionMeta(ref.collection);
    if (shouldItemHavePage(entry, refMeta)) {
      resolved.url = `/${ref.collection}/${resolved.slug}`;
    }
    
    // Auto-compute common derived fields if base data exists
    if (resolved.title) {
      resolved.name = resolved.title; // Alias for convenience
      
      // Generate initials from title
      const words = String(resolved.title).split(' ').filter(Boolean);
      resolved.initials = words.map(w => w[0]).join('').toUpperCase();
    }
    
    return resolved;
  } catch (error) {
    console.error(`Error resolving reference ${ref.collection}/${ref.id}:`, error);
    return null;
  }
}

/**
 * Recursively process data to resolve all collection references
 * Works with nested objects, arrays, and references-within-references
 */
async function processDataForReferences(
  data: any, 
  depth: number = 0, 
  maxDepth: number = 3
): Promise<any> {
  // Prevent infinite recursion
  if (depth >= maxDepth) return data;
  if (data == null) return data;
  
  // Single reference
  if (isCollectionReference(data)) {
    const resolved = await resolveReference(data);
    // Recursively process the resolved data in case it has references too
    return resolved ? await processDataForReferences(resolved, depth + 1, maxDepth) : null;
  }
  
  // Array of values (may contain references)
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(item => processDataForReferences(item, depth + 1, maxDepth))
    );
  }
  
  // Plain objects - process each field
  if (typeof data === 'object' && data.constructor === Object) {
    const processed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip private fields to avoid unnecessary processing
      if (key.startsWith('_')) {
        processed[key] = value;
      } else {
        processed[key] = await processDataForReferences(value, depth + 1, maxDepth);
      }
    }
    
    return processed;
  }
  
  // Primitives (string, number, boolean, etc.)
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

/**
 * Prepare a single entry - resolves all references and adds computed fields
 */
export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  const identifier = getItemKey(entry);
  
  // Resolve ALL references recursively
  const processedData = await processDataForReferences(entry.data);
  
  return {
    ...processedData,
    slug: identifier,
    ...(shouldItemHavePage(entry, meta) && {
      url: `/${collection}/${identifier}`
    })
  } as PreparedItem;
}

/**
 * Prepare all entries in a collection
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