// src/content/schema.ts
import { z } from "astro:content";

// ============================================================================
// ICON SCHEMA + TYPE
// ============================================================================

export const iconSchema = ({ image }: { image: Function }) => z.union([
  // String reference (for icon libraries like "lucide:phone" or emoji "📞")
  z.string(),
  
  // Image using Zod's image handler
  image(),
  
  // Object with explicit type for more complex cases
  z.object({
    type: z.literal('astro-icon'),
    name: z.string(), // e.g., "lucide:phone"
  }),
  
  z.object({
    type: z.literal('svg'),
    content: z.string(), // Raw SVG string
  }),
  
  z.object({
    type: z.literal('emoji'),
    content: z.string(), // e.g., "📞"
  }),
  
  z.object({
    type: z.literal('text'),
    content: z.string(), // Fallback text
  }),
]);

// Export inferred type directly from schema
export type IconType = z.infer<ReturnType<typeof iconSchema>>;

// ============================================================================
// SEO SCHEMA + TYPE
// ============================================================================

export const seoSchema = ({ image }: { image: Function }) => 
  z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: image().optional(),
    ogType: z.string().optional(),
    twitterTitle: z.string().optional(),
    twitterDescription: z.string().optional(),
    twitterImage: image().optional(),
    twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
    robots: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional();

// Infer type from schema
export type SEOData = z.infer<ReturnType<typeof seoSchema>>;

// ============================================================================
// BASE SCHEMA + TYPE
// ============================================================================

export const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    // Smart date handling - accepts Date or string, auto-converts to Date
    publishDate: z.union([z.date(), z.string()]).optional().transform(val => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      return new Date(val);
    }),
    order: z.number().default(0),
    featuredImage: image().optional(),
    hasPage: z.boolean().optional(),
    icon: iconSchema({ image }).optional(),
    seo: seoSchema({ image }),
  });

// Infer type from schema
export type BaseData = z.infer<ReturnType<typeof baseSchema>>;

// ============================================================================
// META SCHEMA + TYPE
// ============================================================================

export const metaSchema = ({ image }: { image: Function }) => z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  featuredImage: image().optional(),
  seo: seoSchema({ image }),
});

// Infer type from schema
export type MetaData = z.infer<ReturnType<typeof metaSchema>>;