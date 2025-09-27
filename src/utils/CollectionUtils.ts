// src/utils/CollectionUtils.ts
import type { CollectionEntry, ContentCollectionKey } from 'astro:content';

// These types come from Astro - no hardcoding!
export type CollectionName = ContentCollectionKey;
export type AnyCollectionEntry = CollectionEntry<CollectionName>;

// Optional: Runtime validation only if you need it for dynamic strings
export async function validateCollection(name: string): Promise<boolean> {
  try {
    const { getCollection } = await import('astro:content');
    await getCollection(name as CollectionName);
    return true;
  } catch {
    return false;
  }
}