// src/utils/collections/references.ts
/**
 * Collection Reference Resolution
 * 
 * Handles resolving Astro collection references to actual data.
 * When an entry has a reference like `author: reference('authors')`,
 * this module fetches and processes the referenced entry.
 * 
 * Features:
 * - Recursive resolution (references can contain references)
 * - Depth limiting to prevent infinite loops
 * - URL generation for referenced items
 * - Additional computed fields (name, initials from title)
 */

import { getEntry } from 'astro:content';
import type { CollectionKey } from 'astro:content';
import { getCollectionMeta } from './meta';
import { getItemKey } from './core';
import { shouldItemHavePage } from '@/utils/pages';

/**
 * Type guard to check if a value is a collection reference
 * 
 * Collection references have the shape: { collection: string, id: string }
 * 
 * @param value - Value to check
 * @returns True if value is a collection reference
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
 * Resolve a collection reference to actual data
 * 
 * Fetches the referenced entry and enriches it with:
 * - slug (from entry id/slug)
 * - url (if item has a page)
 * - name (copy of title for consistency)
 * - initials (computed from title words)
 * 
 * @param ref - Reference object with collection and id
 * @returns Resolved entry data with enriched fields, or null if not found
 * @example
 * // Entry has: author: reference('authors', 'jane-doe')
 * const resolved = await resolveReference({ collection: 'authors', id: 'jane-doe' });
 * // resolved: { title: 'Jane Doe', name: 'Jane Doe', initials: 'JD', slug: 'jane-doe', url: '/authors/jane-doe', ... }
 */
async function resolveReference(ref: { collection: string; id: string }): Promise<any> {
  try {
    // Fetch the referenced entry
    const entry = await getEntry(ref.collection as CollectionKey, ref.id);
    if (!entry) {
      console.warn(`Reference not found: ${ref.collection}/${ref.id}`);
      return null;
    }
    
    // Build resolved object with entry data
    const resolved: any = {
      ...entry.data,
      _collection: ref.collection,  // Track original collection
      _id: ref.id,                   // Track original id
      slug: getItemKey(entry),
    };
    
    // Add URL if this item has a page
    const refMeta = getCollectionMeta(ref.collection);
    if (shouldItemHavePage(entry, refMeta)) {
      resolved.url = `/${ref.collection}/${resolved.slug}`;
    }
    
    // Add computed fields from title if present
    if (resolved.title) {
      // Copy title to name for consistency
      resolved.name = resolved.title;
      
      // Generate initials from title words
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
 * 
 * Traverses objects and arrays, resolving any collection references found.
 * Includes depth limiting to prevent infinite loops from circular references.
 * 
 * @param data - Data to process (can be any type)
 * @param depth - Current recursion depth
 * @param maxDepth - Maximum recursion depth (default 3)
 * @returns Data with all references resolved
 * @example
 * const data = {
 *   author: { collection: 'authors', id: 'jane-doe' },
 *   tags: ['javascript', 'astro']
 * };
 * const processed = await processDataForReferences(data);
 * // processed.author is now full author object, not a reference
 */
export async function processDataForReferences(
  data: any, 
  depth: number = 0, 
  maxDepth: number = 3
): Promise<any> {
  // Stop if max depth reached
  if (depth >= maxDepth) return data;
  if (data == null) return data;
  
  // If this is a collection reference, resolve it
  if (isCollectionReference(data)) {
    const resolved = await resolveReference(data);
    // Recursively process the resolved data
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