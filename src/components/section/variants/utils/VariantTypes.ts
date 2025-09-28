// src/components/section/variants/utils/VariantTypes.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';

// Only define what we ADD during preparation, not what's already in collections
export interface PreparedFields {
  slug: string;
  url?: string;  // Now optional - only present if item has a page
  author?: {
    name: string;
    role?: string;
    initials: string;
  };
  date?: Date | string;
  image?: {
    src: string;
    alt: string;
  };
  tags?: Array<string>;
}

// Combine collection data with our prepared fields
export type PreparedItem = CollectionEntry<CollectionKey>['data'] & PreparedFields;

// Base props that ALL variants receive from Section component
export interface BaseVariantProps {
  items?: PreparedItem[];
  title?: string;
  description?: string;
  className?: string;
}