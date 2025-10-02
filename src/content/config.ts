// src/content/config.ts
/**
 * Collection structure:
 * 
 * src/content/[collection]/
 *   _meta.mdx         ← Collection config (frontmatter) + index page content (body)
 *                        The _ prefix excludes it from collection entries
 *   item-one.mdx      ← Collection item
 *   item-two.mdx      ← Collection item
 * 
 * _meta.mdx frontmatter controls:
 * - title: Display name for the collection
 * - description: Collection description
 * - hasPage: Whether to generate /[collection] index page
 * - itemsHasPage: Whether items get individual pages
 * - featuredImage: Hero image for index page
 * - seo: SEO overrides
 */
import { file } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { baseSchema, MenuSchema, MenuItemFields } from "./schema";
import { MenuItemsLoader } from "@/utils/loaders/MenuItemsLoader";

// Define your collections with the base schema - all support MDX
export const collections = {
    // ── menus.json ─────────────────────────────────────────
  "menus": defineCollection({
    loader: file("src/content/menus/menus.json"),
    schema: MenuSchema,
  }),

  // ── menu-items.json ─────────────────────────────────────
  "menu-items": defineCollection({
    loader: MenuItemsLoader(),
    schema: MenuItemFields,
  }),
  
  "contact-us": defineCollection({
    loader: file("src/content/contact-us/contact-us.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        linkPrefix: z.string().optional(),
      }),
  }),

  "social-media": defineCollection({
    loader: file("src/content/social-media/socialmedia.json"),
    schema: ({ image }) => baseSchema({ image }).extend({
      link: z.string().optional(),
    }),
  }),

  "blog": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        author: reference("authors"),
        tags: z.array(z.string()).default([]),
        readingTime: z.number().optional(),
      }),
  }),

  "authors": defineCollection({
    loader: file("src/content/authors/authors.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        email: z.string().email().optional(),
        social: z
          .object({
            twitter: z.string().url().optional(),
            github: z.string().url().optional(),
            linkedin: z.string().url().optional(),
            website: z.string().url().optional(),
          })
          .optional(),
        role: z.string().optional(),
      }),
  }),

  "services": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        price: z.string().optional(),
        features: z.array(z.string()).default([]),
      }),
  }),

  "testimonials": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        role: z.string(),
        company: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
      }),
  }),

  "portfolio": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        client: z.string(),
        projectUrl: z.string().url().optional(),
        technologies: z.array(z.string()).default([]),
        category: z.string(),
      }),
  }),

  "faq": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        category: z.string().optional(),
      }),
  }),
};