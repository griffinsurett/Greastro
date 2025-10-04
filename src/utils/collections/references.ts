// src/utils/collections/references.ts
import { getEntry } from 'astro:content';
import type { CollectionKey } from 'astro:content';
import { getCollectionMeta } from './meta';
import { getItemKey } from './core';
import { shouldItemHavePage } from '@/utils/pages';

/**
 * Checks if a value is a collection reference
 */
export function isCollectionReference(value: any): value is { collection: string; id: string } {
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
 * Resolves a collection reference to actual data
 */
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

/**
 * Recursively processes data to resolve collection references
 */
export async function processDataForReferences(
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