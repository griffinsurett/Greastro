// src/content/config.ts
import { z, defineCollection } from 'astro:content';

// Base schema that all collections will extend
const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  publishDate: z.date().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  featuredImage: z.object({
    src: z.string(),
    alt: z.string(),
  }).optional(),
  meta: z.record(z.any()).optional(), // For custom fields
});

// Define your collections with the base schema - all support MDX
export const collections = {
  'blog': defineCollection({
    schema: baseSchema.extend({
      author: z.string(),
      tags: z.array(z.string()).default([]),
      readingTime: z.number().optional(),
    }),
  }),
  'services': defineCollection({
    schema: baseSchema.extend({
      icon: z.string().optional(),
      price: z.string().optional(),
      features: z.array(z.string()).default([]),
    }),
  }),
  'testimonials': defineCollection({
    schema: baseSchema.extend({
      author: z.string(),
      role: z.string(),
      company: z.string().optional(),
      rating: z.number().min(1).max(5).default(5),
    }),
  }),
  'portfolio': defineCollection({
    schema: baseSchema.extend({
      client: z.string(),
      projectUrl: z.string().url().optional(),
      technologies: z.array(z.string()).default([]),
      category: z.string(),
    }),
  }),
};