// src/components/section/SectionTypes.ts
import type { CollectionKey } from 'astro:content';

export interface SectionProps {
  collection?: CollectionKey;
  variant?: string;
}