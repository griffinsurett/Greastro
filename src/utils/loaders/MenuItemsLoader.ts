// src/utils/loaders/MenuItemsLoader.ts
import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollectionMeta, getCollectionNames } from '@/utils/collections';
import { capitalize, normalizeRef } from '@/utils/string';
import { parseContentPath, isMetaFile } from '@/utils/paths';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Clear and load base menu items from JSON
      store.clear();
      await file('src/content/menu-items/menu-items.json').load(context);

      // 2) Process manually loaded menu-items to add url field
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

      // 3) Load all content files
      const mdxMods = import.meta.glob<{ frontmatter?: any; default?: any }>(
        '../../content/**/*.{mdx,md,json}',
        { eager: true }
      );

      // 4) Process individual item addToMenu fields
      await processItemMenus(mdxMods, store, logger);

      // 5) Process collection-level menu configurations
      await processCollectionMenus(mdxMods, store, logger);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

async function processItemMenus(
  modules: Record<string, any>,
  store: any,
  logger: any
) {
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? mod.default;
    if (!data?.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    const menuItems = Array.isArray(data.addToMenu) 
      ? data.addToMenu 
      : [data.addToMenu];

    for (const menuConfig of menuItems) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      const itemSlug = menuConfig.slug ?? `/${collection}/${slug}`;
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

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

async function processCollectionItems(
  collection: string,
  menuConfigs: any,
  modules: Record<string, any>,
  store: any
) {
  const configs = Array.isArray(menuConfigs) ? menuConfigs : [menuConfigs];

  for (const [path, mod] of Object.entries(modules)) {
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
        parent = `${collection}/${normalizeRef(data.parent)}`;
      } else if (menuConfig.parent) {
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