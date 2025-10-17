// src/components/ContentRenderer/ContentRenderer.types.ts
/**
 * Content Renderer Type Definitions
 *
 * Type definitions for the Content Renderer component and its variants.
 * Provides a consistent interface for all content renderer variants.
 */

import type { Query } from '@/utils/query';
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
  id?: string;                 // Manual ID override (auto-generated if not provided)
}

/**
 * Props for the main Section component
 * Uses Query object instead of collection string
 */
export interface SectionProps extends Partial<BaseVariantProps> {
  query?: Query<CollectionKey>;  // Query object for fetching items
  variant?: string;               // Variant component to render with
  [key: string]: any;             // Allow additional variant-specific props
}