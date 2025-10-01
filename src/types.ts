// src/types.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { BaseData, MetaData } from '@/content/schema';

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export type AnyCollectionEntry = CollectionEntry<CollectionKey>;
export type CollectionData<T extends CollectionKey> = CollectionEntry<T>['data'];

// ============================================================================
// IMAGE TYPES (Unified)
// ============================================================================

export interface ImageObject {
  src: string;
  alt?: string;
}

export interface OptimizedImage {
  src: ImageMetadata;
  alt?: string;
}

export type ImageInput = 
  | string
  | ImageMetadata
  | ImageObject
  | OptimizedImage;

export function isImageObject(value: any): value is ImageObject | OptimizedImage {
  return value && typeof value === 'object' && 'src' in value;
}

// ============================================================================
// PREPARED ITEM TYPES (Added during data preparation)
// ============================================================================

export interface PreparedFields {
  slug: string;
  url?: string;
}

export type PreparedItem = BaseData & PreparedFields & {
  [key: string]: any;
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

// Section component props extend variant props + add collection/variant selection
export interface SectionProps extends Partial<BaseVariantProps> {
  collection?: CollectionKey;
  variant?: string;
  [key: string]: any; // Allow any additional props to pass through
}

// ============================================================================
// PAGE GENERATION TYPES
// ============================================================================

export interface ItemPageConfig {
  hasPage?: boolean;
}

export interface CollectionPageMeta {
  hasPage?: boolean;
  itemsHasPage?: boolean;
}

export interface PageGenerationConfig {
  itemData?: ItemPageConfig;
  meta: MetaData;
  type: 'item' | 'collection';
}