// src/utils/loaders/MenuItemsLoader.ts
import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollectionMeta, getCollectionNames } from '@/utils/collections';

// Helper: Capitalize string
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper: Normalize reference (extract ID from reference object)
function normalizeRef(ref: any): string {
  if (typeof ref === 'string') return ref;
  if (ref?.id) return ref.id;
  return String(ref);
}

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Clear and load base menu items from JSON
      store.clear();
      await file('src/content/menu-items/menu-items.json').load(context);

      // 2) Load all content files
      const mdxMods = import.meta.glob<{ frontmatter?: any; default?: any }>(
        '../../content/**/*.{mdx,md,json}',
        { eager: true }
      );

      // 3) Process individual item addToMenu fields
      await processItemMenus(mdxMods, store, logger);

      // 4) Process collection-level menu configurations
      await processCollectionMenus(mdxMods, store, logger);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

// Process individual items with addToMenu
async function processItemMenus(
  modules: Record<string, any>,
  store: any,
  logger: any
) {
  for (const [path, mod] of Object.entries(modules)) {
    // Skip meta files
    if (/_meta\.(mdx|md|json)$/.test(path)) continue;

    const data = mod.frontmatter ?? mod.default;
    if (!data?.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    const menuItems = Array.isArray(data.addToMenu) 
      ? data.addToMenu 
      : [data.addToMenu];

    for (const menuConfig of menuItems) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      const link = menuConfig.link ?? `/${collection}/${slug}`;
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          url: link,
          menu: menus,
          parent: menuConfig.parent ?? null,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: menuConfig.order ?? 0,
        },
      });
    }
  }
}

// Process collection-level menu configurations
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any,
  logger: any
) {
  const collections = getCollectionNames().filter(
    c => c !== 'menus' && c !== 'menu-items'
  );

  for (const collection of collections) {
    const meta = await getCollectionMeta(collection);

    // Process collection addToMenu (adds collection index to menu)
    if (meta.addToMenu) {
      const menuConfigs = Array.isArray(meta.addToMenu) 
        ? meta.addToMenu 
        : [meta.addToMenu];

      for (const menuConfig of menuConfigs) {
        const itemId = menuConfig.id ?? collection;
        const link = menuConfig.link ?? `/${collection}`;
        const menus = Array.isArray(menuConfig.menu) 
          ? menuConfig.menu 
          : [menuConfig.menu];

        store.set({
          id: itemId,
          data: {
            title: menuConfig.title ?? meta.title ?? capitalize(collection),
            description: menuConfig.description ?? meta.description,
            url: link,
            menu: menus,
            parent: menuConfig.parent ?? null,
            openInNewTab: menuConfig.openInNewTab ?? false,
          },
        });
      }
    }

    // Process itemsAddToMenu (adds all items to menu)
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

// Process all items in a collection for itemsAddToMenu
async function processCollectionItems(
  collection: string,
  menuConfigs: any,
  modules: Record<string, any>,
  store: any
) {
  const configs = Array.isArray(menuConfigs) ? menuConfigs : [menuConfigs];

  for (const [path, mod] of Object.entries(modules)) {
    if (!path.includes(`../../content/${collection}/`)) continue;
    if (/_meta\.(mdx|md|json)$/.test(path)) continue;

    const data = mod.frontmatter ?? {};
    const { slug } = parseContentPath(path);

    for (const menuConfig of configs) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      const link = menuConfig.link ?? `/${collection}/${slug}`;
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

      // Handle parent hierarchy
      let parent = null;
      if (menuConfig.respectHierarchy && data.parent) {
        parent = `${collection}/${normalizeRef(data.parent)}`;
      } else if (menuConfig.parent) {
        parent = menuConfig.parent;
      }

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          url: link,
          menu: menus,
          parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: menuConfig.order ?? 0,
        },
      });
    }
  }
}

// Parse collection and slug from file path
function parseContentPath(path: string): { collection: string; slug: string } {
  const segments = path.split('/');
  const fileName = segments.pop()!;
  const collection = segments.pop()!;
  const slug = fileName.replace(/\.(mdx|md|json)$/, '');
  
  return { collection, slug };
}