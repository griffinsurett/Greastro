// src/utils/loaders/MenuItemsLoader.ts
/**
 * Menu Items Loader
 * 
 * Custom Astro loader that dynamically generates menu items from:
 * 1. Static menu-items.json file (manually defined menu items)
 * 2. Collection items with addToMenu in frontmatter
 * 3. Entire collections with addToMenu in _meta.mdx
 * 4. Individual collection items with itemsAddToMenu in _meta.mdx
 * 
 * This creates a unified menu-items collection that powers navigation menus.
 * Supports hierarchical menus with parent-child relationships.
 */

import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollectionMeta, getCollectionNames } from '@/utils/collections';
import { capitalize, normalizeRef } from '@/utils/string';
import { parseContentPath, isMetaFile } from '@/utils/paths';

/**
 * Create the menu items loader
 * 
 * @returns Loader instance for Astro content config
 */
export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    
    /**
     * Load function called by Astro during build
     * 
     * Processing steps:
     * 1. Load base menu-items.json
     * 2. Add URL field to manual items
     * 3. Process individual item addToMenu
     * 4. Process collection-level menu configs
     */
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // Step 1: Clear and load base menu items from JSON
      store.clear();
      await file('src/content/menu-items/menu-items.json').load(context);

      // Step 2: Add URL field to manually loaded items
      for (const [id, entry] of store.entries()) {
        const data = entry.data;
        if (data && data.slug && !data.url) {
          store.set({
            id,
            data: {
              ...data,
              url: data.slug,
            },
          });
        }
      }

      // Step 3: Load all content files for processing
      const mdxMods = import.meta.glob<{ frontmatter?: any; default?: any }>(
        '../../content/**/*.{mdx,md,json}',
        { eager: true }
      );

      // Step 4: Process individual item addToMenu fields
      await processItemMenus(mdxMods, store, logger);

      // Step 5: Process collection-level menu configurations
      await processCollectionMenus(mdxMods, store, logger);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

/**
 * Process items with addToMenu in their frontmatter
 * 
 * Handles individual content items that want to add themselves
 * to navigation menus.
 * 
 * @param modules - Glob imported content modules
 * @param store - Astro loader store
 * @param logger - Astro logger
 */
async function processItemMenus(
  modules: Record<string, any>,
  store: any,
  logger: any
) {
  for (const [path, mod] of Object.entries(modules)) {
    // Skip _meta files
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? mod.default;
    if (!data?.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    
    // Support single object or array of menu configs
    const menuItems = Array.isArray(data.addToMenu) 
      ? data.addToMenu 
      : [data.addToMenu];

    for (const menuConfig of menuItems) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      const itemSlug = menuConfig.slug ?? `/${collection}/${slug}`;
      
      // Normalize menu reference to array
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

      // Add to store
      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          slug: itemSlug,
          url: itemSlug,
          menu: menus,
          parent: menuConfig.parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
        },
      });
    }
  }
}

/**
 * Process collection-level menu configurations
 * 
 * Handles two types of collection menu configs:
 * 1. addToMenu: Add the collection itself to menus
 * 2. itemsAddToMenu: Add all items in collection to menus
 * 
 * @param modules - Glob imported content modules
 * @param store - Astro loader store
 * @param logger - Astro logger
 */
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any,
  logger: any
) {
  // Get all collections except system collections
  const collections = getCollectionNames().filter(
    c => c !== 'menus' && c !== 'menu-items'
  );

  for (const collection of collections) {
    const meta = await getCollectionMeta(collection);

    // Process addToMenu: Add collection itself to menus
    if (meta.addToMenu) {
      const menuConfigs = Array.isArray(meta.addToMenu) 
        ? meta.addToMenu 
        : [meta.addToMenu];

      for (const menuConfig of menuConfigs) {
        const itemId = menuConfig.id ?? collection;
        const itemSlug = menuConfig.slug ?? `/${collection}`;
        const menus = Array.isArray(menuConfig.menu) 
          ? menuConfig.menu 
          : [menuConfig.menu];

        store.set({
          id: itemId,
          data: {
            title: menuConfig.title ?? meta.title ?? capitalize(collection),
            description: menuConfig.description ?? meta.description,
            slug: itemSlug,
            url: itemSlug,
            menu: menus,
            parent: menuConfig.parent,
            openInNewTab: menuConfig.openInNewTab ?? false,
          },
        });
      }
    }

    // Process itemsAddToMenu: Add all collection items to menus
    if (meta.itemsAddToMenu) {
      await processCollectionItems(
        collection,
        meta.itemsAddToMenu,
        modules,
        store
      );
    }
  }
}

/**
 * Process all items in a collection for menu inclusion
 * 
 * Iterates through all items in a collection and adds them
 * to menus based on itemsAddToMenu config.
 * 
 * Supports hierarchical menus via respectHierarchy option.
 * 
 * @param collection - Collection name
 * @param menuConfigs - Menu configuration(s) from _meta.mdx
 * @param modules - Glob imported content modules
 * @param store - Astro loader store
 */
async function processCollectionItems(
  collection: string,
  menuConfigs: any,
  modules: Record<string, any>,
  store: any
) {
  const configs = Array.isArray(menuConfigs) ? menuConfigs : [menuConfigs];

  for (const [path, mod] of Object.entries(modules)) {
    // Only process items from this collection
    if (!path.includes(`../../content/${collection}/`)) continue;
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? {};
    const { slug } = parseContentPath(path);

    for (const menuConfig of configs) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      const itemSlug = menuConfig.slug ?? `/${collection}/${slug}`;
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

      // Handle parent hierarchy
      let parent: string | undefined;
      if (menuConfig.respectHierarchy && data.parent) {
        // Use item's parent reference for hierarchy
        parent = `${collection}/${normalizeRef(data.parent)}`;
      } else if (menuConfig.parent) {
        // Use configured parent
        parent = menuConfig.parent;
      }

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          slug: itemSlug,
          url: itemSlug,
          menu: menus,
          parent: parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
        },
      });
    }
  }
}