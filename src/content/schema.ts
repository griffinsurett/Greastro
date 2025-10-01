// src/content/schema.ts
import { z } from "astro:content";
import { iconSchema } from "./iconSchema";

// SEO override schema - all fields optional to allow granular control
// Now accepts image function as parameter
export const seoSchema = ({ image }: { image: Function }) => z.object({
  // Page meta overrides
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  
  // Open Graph overrides
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: image().optional(),
  ogType: z.string().optional(),
  
  // Twitter Card overrides
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: image().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
  
  // Additional SEO fields
  canonicalUrl: z.string().url().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
}).optional();

// Base schema that all collections will extend
export const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.union([z.date(), z.string()]).optional(),
    order: z.number().default(0),
    featuredImage: image().optional(),
    hasPage: z.boolean().optional(),
    icon: iconSchema({ image }).optional(),
    // Add SEO overrides to base schema - pass image function
    seo: seoSchema({ image }),
  });

// Meta schema for _meta.mdx files - now properly handles images
export const metaSchema = ({ image }: { image: Function }) => z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  // Collection-level featured image using image function
  featuredImage: image().optional(),
  // Collection-level SEO overrides - pass image function
  seo: seoSchema({ image }),
});