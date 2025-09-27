// src/utils/getItemKey.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';

type CollectionItem = CollectionEntry<CollectionKey>;
type AnyItem = CollectionItem | { slug?: string; id?: string; [key: string]: unknown };

/**
 * Pulls a stable identifier off an item:
 * - Returns item.slug if present (MDX collections)
 * - Falls back to item.id (file loader collections)
 * - Returns empty string if neither exists
 */
export function getItemKey(item: AnyItem): string {
  if (!item) return "";
  if ('slug' in item && typeof item.slug === 'string' && item.slug) return item.slug;
  if ('id' in item && typeof item.id === 'string' && item.id) return item.id;
  return "";
}