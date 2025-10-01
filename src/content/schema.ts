// src/content/schema.ts
import { z } from "astro:content";
import { iconSchema } from "./iconSchema";

// Define flat SEO fields as a function that returns the schema fields
export const seoFields = ({ image }: { image: Function }) => ({
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
});

// Optional: Keep seoSchema for type reference if needed elsewhere
export const seoSchema = ({ image }: { image: Function }) => 
  z.object(seoFields({ image })).optional();

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
    ...seoFields({ image }),    
  });

// Meta schema for _meta.mdx files
export const metaSchema = ({ image }: { image: Function }) => z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  featuredImage: image().optional(),
  ...seoFields({ image }),
});