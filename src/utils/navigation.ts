// src/utils/navigation.ts
/**
 * Navigation Utilities - Universal for any hierarchical content
 * 
 * These utilities work for menus, breadcrumbs, sidebars, and any
 * navigation system that needs active state detection.
 */

/**
 * Check if a URL is active based on current path (EXACT MATCH ONLY)
 * Works for menus, breadcrumbs, sidebars, etc.
 * 
 * @param itemUrl - The URL to check
 * @param currentPath - Current page path
 * @returns True if the URL is active (exact match)
 */
export function isActivePath(itemUrl: string | undefined, currentPath: string): boolean {
  if (!itemUrl) return false;
  
  const normalizedItem = itemUrl.replace(/\/$/, '') || '/';
  const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
  
  // Only exact match
  return normalizedItem === normalizedCurrent;
}

/**
 * Check if any child in a tree has active path
 * Generic - works for any hierarchical content
 * 
 * @param item - Item with potential children
 * @param currentPath - Current page path
 * @returns True if any descendant is active
 */
export function hasActiveDescendant(item: any, currentPath: string): boolean {
  if (!item.children || item.children.length === 0) return false;
  
  return item.children.some((child: any) => 
    isActivePath(child.url, currentPath) || 
    hasActiveDescendant(child, currentPath)
  );
}