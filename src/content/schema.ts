// src/content/schema.ts
import { z } from "astro:content";
import type { ImageMetadata } from 'astro';

// ============================================================================
// IMAGE SCHEMA (Data Layer)
// ============================================================================

export const imageInputSchema = ({ image }: { image: Function }) => z.union([
  z.string(),                    // URL string
  image(),                       // Astro's image() helper
  z.object({                     // Explicit object
    src: z.union([z.string(), z.any()]),  // string or ImageMetadata
    alt: z.string().optional(),
  }),
]);

// Export the inferred type - this is your single source of truth
export type ImageInput = z.infer<ReturnType<typeof imageInputSchema>>;

// ============================================================================
// ICON SCHEMA + TYPE
// ============================================================================

export const iconSchema = ({ image }: { image: Function }) => z.union([
  z.string(),
  image(),
  z.object({
    type: z.literal('astro-icon'),
    name: z.string(),
  }),
  z.object({
    type: z.literal('svg'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('emoji'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('text'),
    content: z.string(),
  }),
]);

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
    ogImage: imageInputSchema({ image }).optional(),  // ✅ Reuse image schema
    ogType: z.string().optional(),
    twitterTitle: z.string().optional(),
    twitterDescription: z.string().optional(),
    twitterImage: imageInputSchema({ image }).optional(),
    twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
    robots: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional();

export type SEOData = z.infer<ReturnType<typeof seoSchema>>;

// ============================================================================
// BASE SCHEMA (Foundation for all collections)
// ============================================================================

export const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.union([z.date(), z.string()]).optional().transform(val => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      return new Date(val);
    }),
    order: z.number().default(0),
    featuredImage: imageInputSchema({ image }).optional(),  // ✅ Reuse
    hasPage: z.boolean().optional(),
    icon: iconSchema({ image }).optional(),
    seo: seoSchema({ image }),
  });

export type BaseData = z.infer<ReturnType<typeof baseSchema>>;

// ============================================================================
// META SCHEMA (for _meta.mdx files)
// ============================================================================

export const metaSchema = ({ image }: { image: Function }) => z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  featuredImage: imageInputSchema({ image }).optional(),
  seo: seoSchema({ image }),
});

export type MetaData = z.infer<ReturnType<typeof metaSchema>>;