// src/utils/collections/meta.ts
/**
 * Collection Metadata Utilities
 * 
 * Handles loading and parsing _meta.mdx files for collections.
 * The metadata controls collection-wide settings like:
 * - Whether the collection has an index page (hasPage)
 * - Whether individual items get pages (itemsHasPage)
 * - What layout to use for items (itemsLayout)
 * - Menu integration (addToMenu, itemsAddToMenu)
 * - SEO defaults
 */

import { metaSchema, type MetaData } from "@/content/schema";

/**
 * Pre-load all _meta.mdx files at module load time
 * Using eager loading for better performance
 */
const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../../content/**/_meta.mdx",
  { eager: true }
);

/**
 * Get metadata for a specific collection from its _meta.mdx file
 * 
 * Parses and validates the frontmatter against the metaSchema.
 * Returns default values if no _meta.mdx file exists.
 * 
 * @param collectionName - Name of the collection
 * @returns Parsed and validated metadata object
 * @example
 * const meta = getCollectionMeta('blog');
 * // meta.hasPage, meta.itemsHasPage, meta.itemsLayout, etc.
 */
export function getCollectionMeta(collectionName: string): MetaData {
  // Find the _meta.mdx file for this collection
  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  // Extract frontmatter or use empty object
  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  // Use a simple image function for parsing frontmatter
  // This allows string paths and image objects without full Astro image processing
  const simpleImageFn = () => ({
    parse: (val: any) => val,
    _parse: (val: any) => ({ success: true, data: val })
  });

  // Parse and validate against schema, applying defaults
  return metaSchema({ image: simpleImageFn }).parse(data);
}