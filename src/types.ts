// src/types.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { BaseData, ImageInput, SEOData } from '@/content/schema';

// ============================================================================
// ASTRO TYPE HELPERS (these are conveniences, not duplications)
// ============================================================================

/** Any entry from any collection - still type-safe */
export type AnyCollectionEntry = CollectionEntry<CollectionKey>;

/** Extract data type from specific collection */
export type CollectionData<T extends CollectionKey> = CollectionEntry<T>['data'];

// ============================================================================
// RUNTIME-ADDED FIELDS
// ============================================================================

export interface PreparedFields {
  slug: string;
  url?: string;
}

export type PreparedItem = BaseData & PreparedFields & Record<string, any>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface BaseVariantProps {
  items?: PreparedItem[];
  title?: string;
  description?: string;
  className?: string;
  collectionUrl?: string;
  collectionTitle?: string;
}

export interface SectionProps extends Partial<BaseVariantProps> {
  collection?: CollectionKey;
  variant?: string;
  [key: string]: any;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isImageObject(value: any): value is { src: string; alt?: string } {
  return value && typeof value === 'object' && 'src' in value;
}

// ============================================================================
// RE-EXPORTS (for convenience - single import location)
// ============================================================================

export type { ImageInput, SEOData, BaseData, MetaData } from '@/content/schema';