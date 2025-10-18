// src/content/schema.ts
import { z, reference, type CollectionKey } from "astro:content";

// ============================================================================
// REFERENCE SCHEMA
// ============================================================================

/**
 * Create a reference field that accepts single or array of references
 */
export function refSchema(targetCollection: CollectionKey | CollectionKey[]) {
  const collections = Array.isArray(targetCollection) ? targetCollection : [targetCollection];
  
  const singleRef = collections.length === 1
    ? reference(collections[0])
    : z.union(collections.map(coll => reference(coll)) as any);
  
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

// ============================================================================
// MENU HIERARCHY TYPES
// ============================================================================

export const HierarchyMode = z.enum([
  'auto',          // Preserve full content hierarchy
  'flat',          // Flatten all items to same level
  'manual',        // Ignore content hierarchy, use explicit parent
  'skip-levels',   // Include only specific depth levels
  'roots-only',    // Only root items (depth 0)
  'leaves-only',   // Only leaf items (no children)
]);

export const PlacementStrategy = z.enum([
  'nested',              // Default: nest under collection/attachTo
  'root-with-hierarchy', // Items at menu root, keep their hierarchy
  'root-flat',          // All items at menu root, no hierarchy
  'sibling',            // Place alongside attachTo (not under it)
]);

export const ParentStrategy = z.enum([
  'auto',      // Default: use collection name (or attachTo)
  'content',   // Use item's content parent field
  'custom',    // Use explicit parent value
  'none',      // No parent (root level)
]);

export const MenuFilterOptions = z.object({
  includeRoots: z.boolean().optional().default(true),
  includeLeaves: z.boolean().optional().default(true),
  includeBranches: z.boolean().optional().default(true),
  minDepth: z.number().optional().default(0),
  maxDepthTotal: z.number().optional(),
  onlyDepths: z.array(z.number()).optional(),
  excludeDepths: z.array(z.number()).optional(),
  tags: z.array(z.string()).optional(),
  excludeTags: z.array(z.string()).optional(),
});

export const ChildHandlingOptions = z.object({
  includeChildren: z.boolean().optional().default(true),
  maxDepth: z.number().nullable().optional(),
  childPlacement: z.enum(['nested', 'flat', 'skip']).optional().default('nested'),
  childFilter: MenuFilterOptions.optional(),
  sortChildren: z.enum(['order', 'title', 'date', 'none']).optional().default('order'),
  reverseChildren: z.boolean().optional().default(false),
});

// ============================================================================
// ITEMS ADD TO MENU SCHEMA (NO TITLE - BULK OPERATION)
// ============================================================================

export const ItemsAddToMenuFields = z.object({
  // Basic Settings
  ...MenuReferenceField,
  ...BaseMenuFields,
  
  // AUTO-ATTACH: Defaults to collection name
  attachTo: z.union([z.string(), z.boolean()]).optional(),
  
  // Hierarchy Configuration
  hierarchyMode: HierarchyMode.optional().default('auto'),
  placementStrategy: PlacementStrategy.optional().default('nested'),
  parentStrategy: ParentStrategy.optional().default('auto'),
  respectHierarchy: z.boolean().optional().default(true),
  
  // Depth Control
  maxDepth: z.number().nullable().optional(),
  minDepth: z.number().optional().default(0),
  includeLevels: z.array(z.number()).optional(),
  excludeLevels: z.array(z.number()).optional(),
  
  // Child Handling
  children: ChildHandlingOptions.optional(),
  
  // Filtering
  filter: MenuFilterOptions.optional(),
  
  // Advanced
  customSort: z.string().optional(),
  groupBy: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// ADD TO MENU SCHEMA (HAS TITLE - INDIVIDUAL ITEMS)
// ============================================================================

export const AddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  
  // Basic Overrides
  id: z.string().optional(),
  title: z.string(), // REQUIRED - label for this specific menu item
  description: z.string().optional(),
  slug: z.string().optional(),
  
  // Hierarchy Overrides
  parent: z.string().nullable().optional(),
  ignoreChildren: z.boolean().optional(),
  maxChildDepth: z.number().nullable().optional(),
  
  // Placement Overrides
  forceRoot: z.boolean().optional(),
  forcePlacement: PlacementStrategy.optional(),
  customHierarchy: z.boolean().optional(),
  
  // Display Overrides
  order: z.number().optional(),
  
  // Children Control
  childrenBehavior: z.enum(['auto', 'none', 'custom']).optional().default('auto'),
  includeOnlyChildren: z.array(z.string()).optional(),
  excludeChildren: z.array(z.string()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type MenuItemData = z.infer<typeof MenuItemFields>;
export type MenuData = z.infer<typeof MenuSchema>;
export type AddToMenuData = z.infer<typeof AddToMenuFields>;
export type ItemsAddToMenuData = z.infer<typeof ItemsAddToMenuFields>;
export type HierarchyModeType = z.infer<typeof HierarchyMode>;
export type PlacementStrategyType = z.infer<typeof PlacementStrategy>;
export type ParentStrategyType = z.infer<typeof ParentStrategy>;
export type MenuFilterOptionsType = z.infer<typeof MenuFilterOptions>;
export type ChildHandlingOptionsType = z.infer<typeof ChildHandlingOptions>;

// ============================================================================
// REDIRECT SCHEMA
// ============================================================================

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