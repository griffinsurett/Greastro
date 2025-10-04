// src/utils/metaOverrides.ts

/**
 * Gets a property value with fallback chain:
 * 1. Item-level override (e.g., hasPage on the item)
 * 2. Collection-level setting (e.g., itemsHasPage in _meta.mdx)
 * 3. Default value
 * 
 * @param itemData - The item's data object
 * @param meta - The collection's metadata
 * @param itemKey - Property name on the item (e.g., 'hasPage')
 * @param metaKey - Property name in meta (e.g., 'itemsHasPage')
 * @param defaultValue - Fallback if neither is set
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
  
  // 2. Collection-level setting
  if (meta?.[metaKey] !== undefined) {
    return meta[metaKey];
  }
  
  // 3. Default value
  return defaultValue;
}