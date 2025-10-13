// src/utils/collections/references.ts
/**
 * Collection Reference Resolution
 * 
 * Single source of truth for resolving Astro collection references.
 * Works with refSchema from schema.ts
 */

import { getEntry } from 'astro:content';
import type { CollectionKey } from 'astro:content';
import { getItemKey } from './core';

/**
 * Type guard to check if a value is a collection reference
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
 * Resolve any reference to its data
 * Works with refSchema output (array or single)
 * Uses getItemKey to handle slug/id differences
 * Automatically normalizes single-item arrays to single objects
 */
export async function resolve(ref: any) {
  if (!ref) return undefined;
  
  if (Array.isArray(ref)) {
    const items = await Promise.all(
      ref.map(async r => {
        if (!r?.collection || !r?.id) return null;
        try {
          const entry = await getEntry(r.collection, r.id);
          return entry ? { ...entry.data, slug: getItemKey(entry) } : null;
        } catch {
          return null;
        }
      })
    );
    const filtered = items.filter(Boolean);
    
    // Normalize: return single item if array length is 1, otherwise return array
    return filtered.length === 1 ? filtered[0] : filtered;
  }
  
  if (ref?.collection && ref?.id) {
    try {
      const entry = await getEntry(ref.collection, ref.id);
      return entry ? { ...entry.data, slug: getItemKey(entry) } : undefined;
    } catch {
      return undefined;
    }
  }
}

/**
 * Recursively process data to resolve all collection references
 * 
 * @param data - Data to process (can be any type)
 * @param depth - Current recursion depth
 * @param maxDepth - Maximum recursion depth (default 3)
 * @returns Data with all references resolved
 */
export async function processDataForReferences(
  data: any, 
  depth: number = 0, 
  maxDepth: number = 3
): Promise<any> {
  // Stop if max depth reached
  if (depth >= maxDepth) return data;
  if (data == null) return data;
  
  // Check if this is a reference (single or array)
  if (isCollectionReference(data) || (Array.isArray(data) && data.some(isCollectionReference))) {
    const resolved = await resolve(data);
    // Recursively process resolved data
    return resolved ? await processDataForReferences(resolved, depth + 1, maxDepth) : null;
  }
  
  // If array, process each item
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(item => processDataForReferences(item, depth + 1, maxDepth))
    );
  }
  
  // If plain object, process each property
  if (typeof data === 'object' && data.constructor === Object) {
    const processed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_')) {
        // Preserve internal properties as-is
        processed[key] = value;
      } else {
        // Process other properties
        processed[key] = await processDataForReferences(value, depth + 1, maxDepth);
      }
    }
    
    return processed;
  }
  
  // For primitives and other types, return as-is
  return data;
}