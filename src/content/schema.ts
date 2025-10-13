// src/content/schema.ts
import { z, reference, type CollectionKey } from "astro:content";

// ============================================================================
// REFERENCE SCHEMA
// ============================================================================

/**
 * Create a reference field that accepts single or array of references
 * 
 * @param targetCollection - Collection(s) to reference
 * @example
 * author: refSchema('authors')
 * related: refSchema(['blog', 'portfolio'])
 */
export function refSchema(targetCollection: CollectionKey | CollectionKey[]) {
  const collections = Array.isArray(targetCollection) ? targetCollection : [targetCollection];
  
  const singleRef = collections.length === 1
    ? reference(collections[0])
    : z.union(collections.map(coll => reference(coll)) as any);
  
  // Just accept both - no transformation
  return z.union([singleRef, z.array(singleRef)]).optional();
}

// ============================================================================
// MENU SCHEMA
// ============================================================================
export const BaseMenuFields = {
  parent: refSchema("menu-items"),
  openInNewTab: z.boolean().default(false),
};

export const MenuReferenceField = {
  menu: refSchema("menus"),
};

/* ─── Menu Schemas ──────────────────────────────────────────────────── */

// Menu items loader schema
export const MenuItemFields = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  ...BaseMenuFields,
  menu: refSchema("menus"),
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
  slug: z.string().optional(),
});

export const ItemsAddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  respectHierarchy: z.boolean().optional().default(true),
});

export type MenuItemData = z.infer<typeof MenuItemFields>;
export type MenuData = z.infer<typeof MenuSchema>;
export type AddToMenuData = z.infer<typeof AddToMenuFields>;
export type ItemsAddToMenuData = z.infer<typeof ItemsAddToMenuFields>;

// ============================================================================
// REDIRECT SCHEMA
// ============================================================================

/**
 * Schema for redirect configuration
 * Accepts either a single string or array of strings
 * Each string represents a path that should redirect to this item/collection
 */
export const redirectFromSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });

export type RedirectFrom = z.infer<typeof redirectFromSchema>;

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
    featuredImage: imageInputSchema({ image }).optional(),
    bannerImage: imageInputSchema({ image }).optional(),
    hasPage: z.boolean().optional(),
    rootPath: z.boolean().optional(),
    icon: iconSchema({ image }).optional(),
    seo: seoSchema({ image }),
    addToMenu: z.array(AddToMenuFields).optional(),
    redirectFrom: redirectFromSchema,
    publishDate: z
      .union([z.date(), z.string()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val instanceof Date) return val;
        return new Date(val);
      }),
    order: z.number().default(0),
    itemLayout: z.string().optional(),
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
    featuredImage: imageInputSchema({ image }).optional(),
    seo: seoSchema({ image }),
    addToMenu: z.array(AddToMenuFields).optional(),
    redirectFrom: redirectFromSchema,
    itemsHasPage: z.boolean().default(true),
    itemsRootPath: z.boolean().default(false),
    itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
    itemsLayout: z.string().default('CollectionLayout'),
  });

export type MetaData = z.infer<ReturnType<typeof metaSchema>>;