// src/content/schema.ts
import { z } from "astro:content";

// Base schema that all collections will extend
export const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.union([z.date(), z.string()]).optional(),
    order: z.number().default(0),
    featuredImage: image().optional(),
    hasPage: z.boolean().optional(), // Individual items can override
  });

// Meta schema for _meta.mdx files - extends base schema
export const metaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
});