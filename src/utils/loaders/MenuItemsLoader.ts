// src/utils/loaders/MenuItemsLoader.ts
/**
 * Menu Items Loader - With Semantic Auto-Generated IDs
 * 
 * Generates intelligent IDs based on full ancestor chain:
 * - contact-us (root level)
 * - contact-us-about-us (under about-us parent)
 * - contact-us-about-us-company (under about-us → company)
 * - contact-us-about-us-1 (only if duplicate exists)
 */

import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollectionMeta, getCollectionNames } from '@/utils/collections';
import { capitalize } from '@/utils/string';
import { parseContentPath, isMetaFile } from '@/utils/paths';
import { shouldItemHavePage, shouldItemUseRootPath } from '@/utils/filesystem/pageLogic';

const MENU_ITEMS_JSON_PATH = 'src/content/menu-items/menu-items.json';
const MENUS_COLLECTION = 'menus' as const;

// Track used IDs for auto-incrementing
const usedIds = new Map<string, number>();

/**
 * Get full ancestor chain for a parent reference
 * Returns array of IDs from immediate parent to root
 */
function getAncestorChain(parentRef: any, store: any): string[] {
  const ancestors: string[] = [];
  let current = parentRef;
  const visited = new Set<string>(); // Prevent infinite loops
  
  while (current) {
    // Extract parent ID
    const parentId = typeof current === 'string' 
      ? current 
      : current.id || String(current);
    
    // Prevent circular references
    if (visited.has(parentId)) {
      console.warn(`Circular parent reference detected: ${parentId}`);
      break;
    }
    visited.add(parentId);
    ancestors.push(parentId);
    
    // Look up parent in store
    const parentEntry = store.get(parentId);
    if (!parentEntry?.data?.parent) break;
    
    current = parentEntry.data.parent;
  }
  
  return ancestors;
}

/**
 * Build semantic ID from full ancestor path
 * Walks up parent chain to ensure uniqueness across multi-level hierarchies
 */
function buildSemanticId(
  baseId: string, 
  context: {
    parent?: any;
    menu?: any;
    includeMenu?: boolean;
  },
  store: any
): string {
  const parts = [baseId];
  
  // Walk up the parent chain
  if (context.parent) {
    const ancestors = getAncestorChain(context.parent, store);
    // Add in reverse order (grandparent, parent, child)
    parts.push(...ancestors.reverse());
  }
  
  // Optionally add menu (useful if same item in multiple menus)
  if (context.includeMenu && context.menu) {
    const menuId = typeof context.menu === 'string'
      ? context.menu
      : Array.isArray(context.menu) 
        ? (context.menu[0]?.id || String(context.menu[0]))
        : (context.menu.id || String(context.menu));
    parts.push(menuId);
  }
  
  return parts.join('-');
}

/**
 * Get unique ID with auto-increment only when truly needed
 * Uses semantic context first, numbers only as last resort
 */
function getUniqueId(semanticId: string): string {
  const count = usedIds.get(semanticId) || 0;
  usedIds.set(semanticId, count + 1);
  
  return count === 0 ? semanticId : `${semanticId}-${count}`;
}

/**
 * Normalize menu reference to standard format
 */
function normalizeMenuReference(menu: any): any {
  if (!menu) return [];
  
  const normalizeOne = (m: any) => 
    typeof m === 'string' 
      ? { collection: MENUS_COLLECTION, id: m }
      : m;
  
  return Array.isArray(menu) 
    ? menu.map(normalizeOne)
    : [normalizeOne(menu)];
}

/**
 * Ensure value is an array
 */
function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Create the menu items loader
 */
export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // Clear ID tracking for fresh load
      usedIds.clear();

      // Step 1: Load base menu items from JSON
      store.clear();
      await file(MENU_ITEMS_JSON_PATH).load(context);

      // Step 2: Track IDs from manually loaded items
      for (const [id, entry] of store.entries()) {
        usedIds.set(id, 1); // Mark as used
        
        // Validate that url exists
        const data = entry.data;
        if (data && !data.url) {
          console.warn(`Menu item ${id} missing url field`);
        }
      }

      // Step 3: Load all content files
      const mdxMods = import.meta.glob<{ frontmatter?: any }>(
        '../../content/**/*.{mdx,md}',
        { eager: true }
      );

      // Step 4: Process individual item addToMenu fields
      await processItemMenus(mdxMods, store);

      // Step 5: Process collection-level addToMenu and itemsAddToMenu
      await processCollectionMenus(mdxMods, store);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

/**
 * Process individual item addToMenu configurations
 */
async function processItemMenus(
  modules: Record<string, any>,
  store: any
): Promise<void> {
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? {};
    if (!data.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    const meta = getCollectionMeta(collection);
    const menuConfigs = ensureArray(data.addToMenu);

    for (const menuConfig of menuConfigs) {
      // Store parent as-is (hierarchy built at query time)
      let parent = null;
      if (menuConfig.parent !== undefined) {
        parent = menuConfig.parent;
      } else if (menuConfig.customHierarchy === false && data.parent) {
        parent = data.parent;
      }
      
      // Build semantic ID based on full ancestor chain
      const baseId = menuConfig.id ?? `${collection}-${slug}`;
      const semanticId = buildSemanticId(
        baseId,
        {
          parent,
          menu: menuConfig.menu,
          includeMenu: false, // Set to true if you want menu in ID
        },
        store
      );
      
      // Get unique ID (adds number only if semantic ID is taken)
      const itemId = getUniqueId(semanticId);
      
      // Determine URL
      const useRootPath = shouldItemUseRootPath(data, meta);
      const itemUrl = menuConfig.url ?? (useRootPath ? `/${slug}` : `/${collection}/${slug}`);
      
      const menus = normalizeMenuReference(menuConfig.menu);

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          url: itemUrl,
          menu: menus,
          parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: menuConfig.order ?? data.order,
          tags: data.tags,
        },
      });
    }
  }
}

/**
 * Process collection-level menu configurations
 */
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any
): Promise<void> {
  const collections = getCollectionNames().filter(c => c !== 'menus' && c !== 'menu-items');

  for (const collection of collections) {
    const meta = getCollectionMeta(collection);

    // Process collection's own addToMenu
    if (meta.addToMenu) {
      const menuConfigs = ensureArray(meta.addToMenu);

      for (const menuConfig of menuConfigs) {
        const baseId = menuConfig.id ?? collection;
        const semanticId = buildSemanticId(
          baseId,
          {
            parent: menuConfig.parent,
            menu: menuConfig.menu,
            includeMenu: false,
          },
          store
        );
        const itemId = getUniqueId(semanticId);
        const itemUrl = menuConfig.url ?? `/${collection}`;
        const menus = normalizeMenuReference(menuConfig.menu);

        store.set({
          id: itemId,
          data: {
            title: menuConfig.title ?? meta.title ?? capitalize(collection),
            description: menuConfig.description ?? meta.description,
            url: itemUrl,
            menu: menus,
            parent: menuConfig.parent ?? null,
            openInNewTab: menuConfig.openInNewTab ?? false,
            order: menuConfig.order,
          },
        });
      }
    }

    // Process itemsAddToMenu
    if (meta.itemsAddToMenu) {
      await processItemsAddToMenu(collection, meta, modules, store);
    }
  }
}

/**
 * Process itemsAddToMenu configuration
 */
async function processItemsAddToMenu(
  collection: string,
  meta: any,
  modules: Record<string, any>,
  store: any
): Promise<void> {
  const configs = ensureArray(meta.itemsAddToMenu);

  for (const menuConfig of configs) {
    const menus = normalizeMenuReference(menuConfig.menu);
    
    // Create parent menu item if attachTo is the collection name
    const attachTo = menuConfig.attachTo === undefined || menuConfig.attachTo === true
      ? collection
      : menuConfig.attachTo;
    
    if (attachTo === collection && !store.has(collection)) {
      const semanticId = buildSemanticId(
        collection,
        {
          parent: null,
          menu: menuConfig.menu,
          includeMenu: false,
        },
        store
      );
      const parentId = getUniqueId(semanticId);
      
      store.set({
        id: parentId,
        data: {
          title: meta.title ?? capitalize(collection),
          description: meta.description,
          url: `/${collection}`,
          menu: menus,
          parent: null,
          openInNewTab: false,
        },
      });
    }

    // Process each item in the collection
    for (const [path, mod] of Object.entries(modules)) {
      if (!path.includes(`../../content/${collection}/`)) continue;
      if (isMetaFile(path)) continue;

      const data = mod.frontmatter ?? {};
      const { slug } = parseContentPath(path);

      // Check if item should have a page
      if (!shouldItemHavePage(data, meta)) continue;

      // Generate menu item
      const useRootPath = shouldItemUseRootPath(data, meta);
      const itemUrl = useRootPath ? `/${slug}` : `/${collection}/${slug}`;
      
      // Simple parent logic
      let parent = attachTo;
      if (data.parent && menuConfig.respectHierarchy !== false) {
        parent = data.parent;
      }

      // Build semantic ID with full ancestor chain
      const baseId = `${collection}-${slug}-auto`;
      const semanticId = buildSemanticId(
        baseId,
        {
          parent,
          menu: menuConfig.menu,
          includeMenu: false,
        },
        store
      );
      const menuItemId = getUniqueId(semanticId);

      store.set({
        id: menuItemId,
        data: {
          title: data.title ?? capitalize(slug),
          description: data.description,
          url: itemUrl,
          menu: menus,
          parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: data.order,
          tags: data.tags,
        },
      });
    }
  }
}