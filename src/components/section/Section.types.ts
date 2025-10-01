// src/components/section/Section.types.ts
import type { CollectionKey } from 'astro:content';
import type { PreparedItem } from '@/utils/collections';

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