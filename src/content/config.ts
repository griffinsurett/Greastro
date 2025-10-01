// src/content/config.ts
import { file } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { baseSchema } from "./schema";

// Define your collections with the base schema - all support MDX
export const collections = {
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