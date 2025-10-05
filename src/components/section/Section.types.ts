// src/components/section/Section.types.ts
/**
 * Section Type Definitions
 * 
 * Type definitions for the Section component and its variants.
 * Provides a consistent interface for all section variants.
 */

import type { CollectionKey } from 'astro:content';
import type { PreparedItem } from '@/utils/collections';

/**
 * Base props available to all section variants
 */
export interface BaseVariantProps {
  items?: PreparedItem[];      // Prepared collection items or static items
  title?: string;              // Section heading
  description?: string;        // Section description/subtitle
  className?: string;          // Additional CSS classes
  collectionUrl?: string;      // URL to collection index page (for "View All" links)
  collectionTitle?: string;    // Display name for collection (for "View All" text)
}

/**
 * Props for the main Section component
 * Extends BaseVariantProps with collection loading capabilities
 */
export interface SectionProps extends Partial<BaseVariantProps> {
  collection?: CollectionKey;  // Name of collection to load
  variant?: string;            // Variant component to render with
  [key: string]: any;          // Allow additional variant-specific props
}