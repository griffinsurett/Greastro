// src/types.ts
// Only types that AREN'T directly from schemas
import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { BaseData, MetaData } from '@/content/schema';

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export type AnyCollectionEntry = CollectionEntry<CollectionKey>;

// Helper to get data type for a specific collection
export type CollectionData<T extends CollectionKey> = CollectionEntry<T>['data'];

// ============================================================================
// IMAGE TYPES (Unified)
// ============================================================================

// Standard image object shape
export interface ImageObject {
  src: string;
  alt?: string;
}

// Image with Astro's optimized metadata
export interface OptimizedImage {
  src: ImageMetadata;
  alt?: string;
}

// All possible image inputs (unified across the app)
export type ImageInput = 
  | string                    // Direct URL string
  | ImageMetadata             // Astro optimized image
  | ImageObject               // Standard object with src/alt
  | OptimizedImage;           // Astro image with metadata

// Helper to check if value is an image
export function isImageObject(value: any): value is ImageObject | OptimizedImage {
  return value && typeof value === 'object' && 'src' in value;
}

// ============================================================================
// PREPARED ITEM TYPES (Added during data preparation)
// ============================================================================

// Fields we add during preparation that aren't in the schema
export interface PreparedFields {
  slug: string;
  url?: string;
}

// Complete prepared item = schema data + prepared fields + any collection-specific fields
export type PreparedItem = BaseData & PreparedFields & {
  [key: string]: any; // Allow additional fields from specific collections
};

// ============================================================================
// VARIANT PROPS (Component-specific, not schema)
// ============================================================================

export interface BaseVariantProps {
  items?: PreparedItem[];
  title?: string;
  description?: string;
  className?: string;
  collectionUrl?: string;
  collectionTitle?: string;
}

// ============================================================================
// PAGE GENERATION TYPES (Extract inline types)
// ============================================================================

// Item-level page configuration
export interface ItemPageConfig {
  hasPage?: boolean;
}

// Collection-level meta configuration
export interface CollectionPageMeta {
  hasPage?: boolean;
  itemsHasPage?: boolean;
}

// Complete page generation configuration
export interface PageGenerationConfig {
  itemData?: ItemPageConfig;
  meta: MetaData;
  type: 'item' | 'collection';
}