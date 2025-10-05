// src/utils/metaOverrides.ts
/**
 * Meta Override Utilities
 * 
 * Implements the override pattern used throughout the system:
 * 1. Item-level overrides (highest priority)
 * 2. Collection-level defaults (from _meta.mdx)
 * 3. System defaults (lowest priority)
 * 
 * This allows fine-grained control - collections can set defaults
 * while individual items can override on a case-by-case basis.
 * 
 * Example: itemsHasPage in _meta.mdx sets default, but individual
 * items can override with hasPage in their frontmatter.
 */

/**
 * Get a property value with fallback chain
 * 
 * Implements the three-level override pattern:
 * Item override → Collection default → System default
 * 
 * @param itemData - The item's data object (frontmatter)
 * @param meta - The collection's metadata from _meta.mdx
 * @param itemKey - Property name on the item (e.g., 'hasPage')
 * @param metaKey - Property name in meta (e.g., 'itemsHasPage')
 * @param defaultValue - Fallback if neither is set
 * @returns The resolved property value
 * @example
 * // Collection says items should have pages by default
 * // But this specific item says no
 * getItemProperty(
 *   { hasPage: false },           // Item override
 *   { itemsHasPage: true },       // Collection default
 *   'hasPage',
 *   'itemsHasPage',
 *   true                          // System default
 * ) // Returns: false (item override wins)
 */
export function getItemProperty<T>(
  itemData: any,
  meta: any,
  itemKey: string,
  metaKey: string,
  defaultValue: T
): T {
  // 1. Item-level override takes precedence
  if (itemData?.[itemKey] !== undefined) {
    return itemData[itemKey];
  }
  
  // 2. Collection-level setting from _meta.mdx
  if (meta?.[metaKey] !== undefined) {
    return meta[metaKey];
  }
  
  // 3. System default value
  return defaultValue;
}