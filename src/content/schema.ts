// src/content/schema.ts
import { z, reference } from "astro:content";

// ============================================================================
// MENU SCHEMA
// ============================================================================
export const BaseMenuFields = {
  parent: z
    .union([reference("menu-items"), z.array(reference("menu-items"))])
    .optional(),
  openInNewTab: z.boolean().default(false),
};

export const MenuReferenceField = {
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
};

/* ─── Menu Schemas ──────────────────────────────────────────────────── */

// Menu items loader schema
export const MenuItemFields = z.object({
  title: z.string(),
  description: z.string().optional(),
  ...BaseMenuFields,
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
});

// Menus.json
export const MenuSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
});

// addToMenu / itemsAddToMenu
export const AddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
});

export const ItemsAddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  respectHierarchy: z.boolean().optional().default(true),
});

// ============================================================================
// IMAGE SCHEMA
// ============================================================================

export const imageInputSchema = ({ image }: { image: Function }) =>
  z.union([
    z.string(),
    image(),
    z.object({
      src: z.union([z.string(), z.any()]),
      alt: z.string().optional(),
    }),
  ]);

export type ImageInput = z.infer<ReturnType<typeof imageInputSchema>>;

// ============================================================================
// ICON SCHEMA
// ============================================================================

export const iconSchema = ({ image }: { image: Function }) =>
  z.union([
    z.string(),
    image(),
    z.object({
      type: z.literal("astro-icon"),
      name: z.string(),
    }),
    z.object({
      type: z.literal("svg"),
      content: z.string(),
    }),
    z.object({
      type: z.literal("emoji"),
      content: z.string(),
    }),
    z.object({
      type: z.literal("text"),
      content: z.string(),
    }),
  ]);

export type IconType = z.infer<ReturnType<typeof iconSchema>>;

// ============================================================================
// SEO SCHEMA
// ============================================================================

export const seoSchema = ({ image }: { image: Function }) =>
  z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: imageInputSchema({ image }).optional(),
      ogType: z.string().optional(),
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
      twitterImage: imageInputSchema({ image }).optional(),
      twitterCard: z
        .enum(["summary", "summary_large_image", "app", "player"])
        .optional(),
      robots: z.string().optional(),
      canonicalUrl: z.string().url().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional();

export type SEOData = z.infer<ReturnType<typeof seoSchema>>;

// ============================================================================
// BASE SCHEMA
// ============================================================================

export const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z
      .union([z.date(), z.string()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val instanceof Date) return val;
        return new Date(val);
      }),
    order: z.number().default(0),
    featuredImage: imageInputSchema({ image }).optional(),
    hasPage: z.boolean().optional(),
    icon: iconSchema({ image }).optional(),
    addToMenu: z.array(AddToMenuFields).optional(),
    seo: seoSchema({ image }),
  });

export type BaseData = z.infer<ReturnType<typeof baseSchema>>;

// ============================================================================
// META SCHEMA
// ============================================================================

export const metaSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    hasPage: z.boolean().default(true),
    itemsHasPage: z.boolean().default(true),
    featuredImage: imageInputSchema({ image }).optional(),
    addToMenu: z.array(AddToMenuFields).optional(),
    itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
    seo: seoSchema({ image }),
  });

export type MetaData = z.infer<ReturnType<typeof metaSchema>>;
