// src/content/schema.ts
import { z } from "astro:content";
import { iconSchema } from "./iconSchema";

// Define SEO fields as a nested object schema
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
    seo: seoSchema({ image }),
  });

// Meta schema for _meta.mdx files
export const metaSchema = ({ image }: { image: Function }) => z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  featuredImage: image().optional(),
  seo: seoSchema({ image }),
});