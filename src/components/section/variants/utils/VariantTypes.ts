// src/components/section/variants/utils/VariantTypes.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';

export interface PreparedFields {
  slug: string;
  url?: string;
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

export type PreparedItem = CollectionEntry<CollectionKey>['data'] & PreparedFields;

export interface BaseVariantProps {
  items?: PreparedItem[];
  title?: string;
  description?: string;
  className?: string;
  collectionUrl?: string;   // Only present if collection has index page
  collectionTitle?: string;  // Display title for the collection
}