// src/layouts/collections/helpers/layoutUtils.ts
/**
 * Layout Discovery and Selection Utilities
 * 
 * Handles:
 * - Dynamic discovery of layout components
 * - Layout selection based on collection/item config
 * - Fallback to default layout
 * 
 * Enables flexible layout system where collections and items
 * can specify custom layouts via frontmatter.
 */

import { getItemProperty } from '@/utils/metaOverrides';

/**
 * Dynamically discover all collection layout components
 * 
 * Uses Vite glob import to load all .astro files in the
 * layouts/collections directory.
 * 
 * @returns Object mapping layout names to components
 * @example
 * {
 *   'CollectionLayout': CollectionLayoutComponent,
 *   'BlogLayout': BlogLayoutComponent,
 * }
 */
export async function getCollectionLayouts() {
  const layouts = import.meta.glob('../*.astro', { eager: true });
  
  const result = Object.entries(layouts).reduce((acc, [path, module]) => {
    // Extract filename without extension
    const fileName = path.split('/').pop()?.replace('.astro', '');
    
    // Add to map if valid
    if (fileName && module && typeof module === 'object' && 'default' in module) {
      acc[fileName] = module.default;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  return result;
}

/**
 * Get layout component by name
 * 
 * Looks up the layout component and falls back to CollectionLayout
 * if the specified layout doesn't exist.
 * 
 * @param layoutName - Name of the layout to load
 * @returns Layout component
 * @throws Error if layout not found and no default available
 */
export async function getLayoutComponent(layoutName: string) {
  const layouts = await getCollectionLayouts();
  
  // Use specified layout or fall back to default
  const component = layouts[layoutName] || layouts['CollectionLayout'];
  
  if (!component) {
    throw new Error(
      `Layout component "${layoutName}" not found. Available layouts: ${Object.keys(layouts).join(', ')}. ` +
      `Make sure you have a CollectionLayout.astro file in src/layouts/collections/`
    );
  }
  
  return component;
}

/**
 * Determine which layout to use for a collection/item
 * 
 * Uses override pattern:
 * - Index pages always use CollectionLayout
 * - Item pages use itemLayout or itemsLayout or CollectionLayout
 * 
 * @param meta - Collection metadata
 * @param item - Item data (optional)
 * @param isItemPage - Whether this is an item page
 * @returns Layout name to use
 */
export function getLayoutName(
  meta: any,
  item?: any,
  isItemPage: boolean = false
): string {
  // Index pages always use the default layout
  if (!isItemPage) {
    return 'CollectionLayout';
  }
  
  // For item pages, use the override pattern
  return getItemProperty(
    item?.data,
    meta,
    'itemLayout',          // item-level property
    'itemsLayout',         // collection-level property
    'CollectionLayout'     // default layout
  );
}