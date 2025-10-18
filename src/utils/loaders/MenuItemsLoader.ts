// src/utils/loaders/MenuItemsLoader.ts
/**
 * Menu Items Loader - Advanced Hierarchy Support
 * 
 * Custom Astro loader that dynamically generates menu items from:
 * 1. Static menu-items.json file (manually defined menu items)
 * 2. Collection items with addToMenu in frontmatter
 * 3. Entire collections with addToMenu in _meta.mdx
 * 4. Individual collection items with itemsAddToMenu in _meta.mdx
 * 
 * Features:
 * - Advanced hierarchy control (auto, flat, manual, skip-levels, etc.)
 * - Flexible placement strategies (nested, root-with-hierarchy, etc.)
 * - Depth filtering and limiting
 * - Tag-based filtering
 * - Auto-attach to collection parent
 */

import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollectionMeta, getCollectionNames } from '@/utils/collections';
import { capitalize, normalizeRef } from '@/utils/string';
import { parseContentPath, isMetaFile } from '@/utils/paths';
import { shouldItemHavePage, shouldItemUseRootPath } from '@/utils/filesystem/pageLogic';
import { parseFrontmatter } from '@/utils/filesystem/frontmatter';
import type { 
  HierarchyModeType, 
  PlacementStrategyType,
  MenuFilterOptionsType,
} from '@/content/schema';

/**
 * Interface for hierarchy information
 */
interface HierarchyInfo {
  depth: number;
  hasChildren: boolean;
  parent?: string;
  children: Set<string>;
}

/**
 * Create the menu items loader
 */
export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    
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

      // Step 4: Build item hierarchy map for depth/children calculations
      const hierarchyMap = buildHierarchyMap(mdxMods);

      // Step 5: Process individual item addToMenu fields
      await processItemMenus(mdxMods, store, logger, hierarchyMap);

      // Step 6: Process collection-level menu configurations
      await processCollectionMenus(mdxMods, store, logger, hierarchyMap);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

/**
 * Build hierarchy map to track parent-child relationships and depth
 * 
 * Note: This is similar to the query system's graph builder but works with
 * raw frontmatter data instead of CollectionEntry types, as it runs during
 * the build process before collections are fully loaded.
 */
function buildHierarchyMap(
  modules: Record<string, any>
): Map<string, HierarchyInfo> {
  const hierarchyMap = new Map<string, HierarchyInfo>();

  // First pass: collect all items and their parents
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? mod.default ?? {};
    const { collection, slug } = parseContentPath(path);
    const itemKey = `${collection}/${slug}`;

    hierarchyMap.set(itemKey, {
      depth: 0,
      hasChildren: false,
      parent: data.parent ? `${collection}/${normalizeRef(data.parent)}` : undefined,
      children: new Set(),
    });
  }

  // Second pass: calculate depth and mark children
  for (const [itemKey, info] of hierarchyMap.entries()) {
    // Calculate depth by walking up parent chain
    let depth = 0;
    let currentKey: string | undefined = itemKey;
    const visited = new Set<string>();

    while (currentKey && hierarchyMap.get(currentKey)?.parent) {
      if (visited.has(currentKey)) {
        console.warn(`Circular parent reference detected: ${itemKey}`);
        break;
      }
      visited.add(currentKey);
      currentKey = hierarchyMap.get(currentKey)!.parent;
      depth++;
      
      if (depth > 10) { // Safety limit
        console.warn(`Max depth exceeded for ${itemKey}`);
        break;
      }
    }

    info.depth = depth;

    // Mark parent as having children
    if (info.parent && hierarchyMap.has(info.parent)) {
      const parentInfo = hierarchyMap.get(info.parent)!;
      parentInfo.hasChildren = true;
      parentInfo.children.add(itemKey);
    }
  }

  return hierarchyMap;
}

/**
 * Resolve attachTo value
 */
function resolveAttachTo(
  attachTo: string | boolean | undefined,
  collection: string
): string | null {
  // undefined or true -> use collection name
  if (attachTo === undefined || attachTo === true) {
    return collection;
  }
  
  // false -> no attachment (root level)
  if (attachTo === false) {
    return null;
  }
  
  // string -> use as-is
  return attachTo;
}

/**
 * Check if item should be included based on filters
 * Uses shared pageLogic utilities for consistency
 */
function checkItemInclusion(
  itemKey: string,
  data: any,
  menuConfig: any,
  meta: any,
  hierarchyMap: Map<string, HierarchyInfo>
): boolean {
  // Use shared utility from filesystem/pageLogic
  if (!shouldItemHavePage(data, meta)) {
    return false;
  }

  const itemInfo = hierarchyMap.get(itemKey);
  if (!itemInfo) return false;

  const filter: MenuFilterOptionsType = menuConfig.filter || {};
  const hierarchyMode: HierarchyModeType = menuConfig.hierarchyMode || 'auto';
  
  // Check depth filters
  const depth = itemInfo.depth;
  
  if (filter.minDepth !== undefined && depth < filter.minDepth) {
    return false;
  }
  
  if (filter.maxDepthTotal !== undefined && depth > filter.maxDepthTotal) {
    return false;
  }
  
  if (filter.onlyDepths && !filter.onlyDepths.includes(depth)) {
    return false;
  }
  
  if (filter.excludeDepths && filter.excludeDepths.includes(depth)) {
    return false;
  }

  // Check root/leaf/branch filters
  const isRoot = depth === 0;
  const hasChildren = itemInfo.hasChildren;
  
  if (filter.includeRoots === false && isRoot) return false;
  if (filter.includeLeaves === false && !hasChildren) return false;
  if (filter.includeBranches === false && hasChildren) return false;

  // Check tags
  if (filter.tags && filter.tags.length > 0) {
    if (!data.tags || !data.tags.some((t: string) => filter.tags!.includes(t))) {
      return false;
    }
  }
  
  if (filter.excludeTags && filter.excludeTags.length > 0) {
    if (data.tags && data.tags.some((t: string) => filter.excludeTags!.includes(t))) {
      return false;
    }
  }

  // Check hierarchy mode specific filters
  if (hierarchyMode === 'roots-only' && !isRoot) {
    return false;
  }
  
  if (hierarchyMode === 'leaves-only' && hasChildren) {
    return false;
  }
  
  if (hierarchyMode === 'skip-levels') {
    const includeLevels = menuConfig.includeLevels || [];
    if (!includeLevels.includes(depth)) {
      return false;
    }
  }

  return true;
}

/**
 * Determine parent for menu item based on hierarchy configuration
 */
function determineParent(
  collection: string,
  slug: string,
  data: any,
  menuConfig: any,
  attachTo: string | null,
  hierarchyMap: Map<string, HierarchyInfo>
): string | null {
  const hierarchyMode: HierarchyModeType = menuConfig.hierarchyMode || 'auto';
  const placementStrategy: PlacementStrategyType = menuConfig.placementStrategy || 'nested';
  const respectHierarchy = menuConfig.respectHierarchy !== false;

  const itemKey = `${collection}/${slug}`;
  const itemInfo = hierarchyMap.get(itemKey);
  const contentParent = itemInfo?.parent;

  // Handle placement strategies
  if (placementStrategy === 'root-flat') {
    // No parent - everything at root
    return null;
  }

  if (placementStrategy === 'root-with-hierarchy') {
    // At menu root, but keep internal hierarchy
    if (respectHierarchy && contentParent) {
      return contentParent;
    }
    return null;
  }

  if (placementStrategy === 'sibling' && attachTo) {
    // Same level as attachTo
    // For now, return null (would need store lookup to get attachTo's parent)
    return null;
  }

  // Default: nested placement
  if (placementStrategy === 'nested') {
    if (hierarchyMode === 'flat') {
      // All items directly under attachTo
      return attachTo;
    }

    if (hierarchyMode === 'manual') {
      // Use explicit parent from config
      return menuConfig.parent || attachTo;
    }

    if (hierarchyMode === 'auto') {
      if (respectHierarchy && contentParent) {
        // Use content parent
        return contentParent;
      } else if (itemInfo && itemInfo.depth === 0) {
        // Root items go under attachTo
        return attachTo;
      } else if (contentParent) {
        // Has parent, use it
        return contentParent;
      }
      // Fallback to attachTo
      return attachTo;
    }

    if (hierarchyMode === 'skip-levels' || hierarchyMode === 'roots-only' || hierarchyMode === 'leaves-only') {
      // For these modes, attach directly to attachTo unless respecting hierarchy
      if (respectHierarchy && contentParent) {
        return contentParent;
      }
      return attachTo;
    }
  }

  return attachTo;
}

/**
 * Generate menu item data
 * Uses shared pageLogic utilities for URL determination
 */
function generateMenuItem(
  collection: string,
  slug: string,
  data: any,
  menuConfig: any,
  meta: any,
  attachTo: string | null,
  hierarchyMap: Map<string, HierarchyInfo>
): any {
  const itemId = `${collection}/${slug}`;
  
  // Use shared utility from filesystem/pageLogic
  const useRootPath = shouldItemUseRootPath(data, meta);
  const itemSlug = useRootPath ? `/${slug}` : `/${collection}/${slug}`;
  
  // Use item's own title from frontmatter
  const title = data.title ?? capitalize(slug);
  
  // Determine parent based on hierarchy configuration
  const parent = determineParent(
    collection,
    slug,
    data,
    menuConfig,
    attachTo,
    hierarchyMap
  );

  // Normalize menu references
  const menus = Array.isArray(menuConfig.menu) 
    ? menuConfig.menu 
    : [menuConfig.menu];

  return {
    title,
    description: data.description,
    slug: itemSlug,
    url: itemSlug,
    menu: menus,
    parent,
    openInNewTab: menuConfig.openInNewTab ?? false,
    order: data.order,
    metadata: menuConfig.metadata,
  };
}

/**
 * Process collection-level menu configurations
 */
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any,
  logger: any,
  hierarchyMap: Map<string, HierarchyInfo>
) {
  const collections = getCollectionNames().filter(
    c => c !== 'menus' && c !== 'menu-items'
  );

  for (const collection of collections) {
    const meta = await getCollectionMeta(collection);

    // Process addToMenu (collection itself)
    if (meta.addToMenu) {
      processCollectionAddToMenu(collection, meta, store);
    }

    // Process itemsAddToMenu (collection items)
    if (meta.itemsAddToMenu) {
      await processCollectionItemsAddToMenu(
        collection,
        meta,
        modules,
        store,
        hierarchyMap
      );
    }
  }
}

/**
 * Process collection's own addToMenu
 * This supports title override
 */
function processCollectionAddToMenu(
  collection: string,
  meta: any,
  store: any
) {
  const menuConfigs = Array.isArray(meta.addToMenu) 
    ? meta.addToMenu 
    : [meta.addToMenu];

  for (const menuConfig of menuConfigs) {
    const itemId = menuConfig.id ?? collection;
    const itemSlug = menuConfig.slug ?? `/${collection}`;
    
    // Title CAN be overridden here (addToMenu supports title)
    const title = menuConfig.title ?? meta.title ?? capitalize(collection);
    
    const menus = Array.isArray(menuConfig.menu) 
      ? menuConfig.menu 
      : [menuConfig.menu];

    store.set({
      id: itemId,
      data: {
        title,
        description: menuConfig.description ?? meta.description,
        slug: itemSlug,
        url: itemSlug,
        menu: menus,
        parent: menuConfig.parent,
        openInNewTab: menuConfig.openInNewTab ?? false,
        metadata: menuConfig.metadata,
      },
    });
  }
}

/**
 * Process itemsAddToMenu configuration
 * This does NOT support title override - uses each item's own title
 */
async function processCollectionItemsAddToMenu(
  collection: string,
  meta: any,
  modules: Record<string, any>,
  store: any,
  hierarchyMap: Map<string, HierarchyInfo>
) {
  const configs = Array.isArray(meta.itemsAddToMenu) 
    ? meta.itemsAddToMenu 
    : [meta.itemsAddToMenu];

  for (const menuConfig of configs) {
    // Resolve attachTo
    const attachTo = resolveAttachTo(menuConfig.attachTo, collection);
    
    // Create parent menu item if attachTo is the collection name
    if (attachTo === collection) {
      createCollectionParentItem(collection, meta, menuConfig, store);
    }

    // Process each item in the collection
    for (const [path, mod] of Object.entries(modules)) {
      if (!path.includes(`../../content/${collection}/`)) continue;
      if (isMetaFile(path)) continue;

      const data = mod.frontmatter ?? {};
      const { slug } = parseContentPath(path);
      const itemKey = `${collection}/${slug}`;

      // Check if item should be included
      const shouldInclude = checkItemInclusion(
        itemKey,
        data,
        menuConfig,
        meta,
        hierarchyMap
      );

      if (!shouldInclude) continue;

      // Generate menu item
      const menuItem = generateMenuItem(
        collection,
        slug,
        data,
        menuConfig,
        meta,
        attachTo,
        hierarchyMap
      );

      // Generate unique ID for menu item
      const menuItemId = `${collection}-${slug}-${menuConfig.menu?.id || 'menu'}`;

      store.set({
        id: menuItemId,
        data: menuItem,
      });
    }
  }
}

/**
 * Create parent menu item for collection
 * Uses meta.title or capitalized collection name - NO title override
 */
function createCollectionParentItem(
  collection: string,
  meta: any,
  menuConfig: any,
  store: any
) {
  const parentId = collection;
  
  // Check if parent already exists
  if (store.has(parentId)) {
    return;
  }

  // Use meta.title or capitalized collection name
  // NO title override from menuConfig - that's only for addToMenu
  const title = meta.title ?? capitalize(collection);
  
  const menus = Array.isArray(menuConfig.menu) 
    ? menuConfig.menu 
    : [menuConfig.menu];

  store.set({
    id: parentId,
    data: {
      title,
      description: meta.description,
      slug: `/${collection}`,
      url: `/${collection}`,
      menu: menus,
      parent: null, // Collection parent is at root by default
      openInNewTab: false,
    },
  });
}

/**
 * Process individual item addToMenu configurations
 * This supports title override for individual items
 */
async function processItemMenus(
  modules: Record<string, any>,
  store: any,
  logger: any,
  hierarchyMap: Map<string, HierarchyInfo>
) {
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? mod.default;
    if (!data?.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    const meta = await getCollectionMeta(collection);
    
    const menuItems = Array.isArray(data.addToMenu) 
      ? data.addToMenu 
      : [data.addToMenu];

    for (const menuConfig of menuItems) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      
      // Determine URL
      let itemSlug;
      if (menuConfig.slug) {
        itemSlug = menuConfig.slug;
      } else {
        // Use shared utility from filesystem/pageLogic
        const useRootPath = shouldItemUseRootPath(data, meta);
        itemSlug = useRootPath ? `/${slug}` : `/${collection}/${slug}`;
      }
      
      // Handle parent with overrides
      let parent = menuConfig.parent;
      
      if (menuConfig.forceRoot) {
        // Force root level
        parent = null;
      } else if (menuConfig.customHierarchy && menuConfig.parent !== undefined) {
        // Use explicit parent, ignore content
        parent = menuConfig.parent;
      } else if (!menuConfig.customHierarchy && data.parent && !menuConfig.forceRoot) {
        // Use content parent
        const itemKey = `${collection}/${slug}`;
        const itemInfo = hierarchyMap.get(itemKey);
        parent = itemInfo?.parent ?? null;
      }
      
      const menus = Array.isArray(menuConfig.menu) 
        ? menuConfig.menu 
        : [menuConfig.menu];

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title, // Required in schema - CAN override
          description: menuConfig.description ?? data.description,
          slug: itemSlug,
          url: itemSlug,
          menu: menus,
          parent,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: menuConfig.order ?? data.order,
          metadata: menuConfig.metadata,
        },
      });
    }
  }
}