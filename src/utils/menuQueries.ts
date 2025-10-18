// src/utils/query/menuQueries.ts
/**
 * Menu Query Utilities
 * 
 * Helper functions for querying and building menu structures at render time.
 */

import type { CollectionEntry } from 'astro:content';
import { query, sortBy } from '@/utils/query';

/**
 * Build hierarchical menu tree from flat items
 */
export function buildMenuTree(items: any[]): any[] {
  const itemMap = new Map();
  const roots: any[] = [];
  
  // First pass: create nodes with children arrays
  // ✅ Use loader ID, not slug
  items.forEach(item => {
    const id = item.id || item.slug;  // Changed order!
    itemMap.set(id, { ...item, children: [] });
  });
  
  // Second pass: build hierarchy
  items.forEach(item => {
    const id = item.id || item.slug;  // Changed order!
    const node = itemMap.get(id);
    const parent = item.parent;
    
    if (parent) {
      const parentId = typeof parent === 'string' ? parent : parent.id;
      const parentNode = itemMap.get(parentId);
      
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  
  // Sort recursively
  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    nodes.forEach(node => {
      if (node.children?.length > 0) {
        sortTree(node.children);
      }
    });
  };
  
  sortTree(roots);
  return roots;
}

/**
 * Filter menu items by menu ID
 */
export function filterByMenu(menuId: string) {
  return (entry: CollectionEntry<'menu-items'>) => {
    const menus = entry.data.menu;
    if (Array.isArray(menus)) {
      return menus.some(m => m.id === menuId);
    }
    return menus?.id === menuId;
  };
}

/**
 * Get menu items with tree structure
 * 
 * @example
 * const items = await getMenuWithTree('main-menu');
 */
export async function getMenuWithTree(menuId: string) {
  const result = await query('menu-items')
    .where(filterByMenu(menuId))
    .orderBy(sortBy('order', 'asc'))
    .all();
  
  return buildMenuTree(result);
}