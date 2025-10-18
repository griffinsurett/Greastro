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
import type { 
  HierarchyModeType, 
  PlacementStrategyType,
  MenuFilterOptionsType,
  AddToMenuData,
  ItemsAddToMenuData,
  MetaData,
} from '@/content/schema';

// ============================================================================
// CONSTANTS
// ============================================================================

const SYSTEM_COLLECTIONS = ['menus', 'menu-items'] as const;
const MENUS_COLLECTION = 'menus' as const;
const MAX_HIERARCHY_DEPTH = 10;
const MENU_ITEMS_JSON_PATH = 'src/content/menu-items/menu-items.json';

// ============================================================================
// LOCAL TYPES (only what's NOT in schema)
// ============================================================================

/**
 * Hierarchy information tracked during build
 */
interface HierarchyInfo {
  depth: number;
  hasChildren: boolean;
  parent?: string;
  children: Set<string>;
}

/**
 * Normalized menu reference
 */
interface MenuReference {
  collection: typeof MENUS_COLLECTION;
  id: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize menu references to standard format
 * Converts string or array to normalized reference object(s)
 */
function normalizeMenuReference(menu: any): MenuReference[] {
  if (!menu) return [];
  
  const normalizeOne = (m: any): MenuReference => 
    typeof m === 'string' 
      ? { collection: MENUS_COLLECTION, id: m }
      : m;
  
  return Array.isArray(menu) 
    ? menu.map(normalizeOne)
    : [normalizeOne(menu)];
}

/**
 * Wrap single config or array into array
 */
function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Check if collection should be excluded from menu processing
 */
function isSystemCollection(collection: string): boolean {
  return SYSTEM_COLLECTIONS.includes(collection as any);
}

// ============================================================================
// LOADER
// ============================================================================

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
      await file(MENU_ITEMS_JSON_PATH).load(context);

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

// ============================================================================
// HIERARCHY BUILDING
// ============================================================================

/**
 * Build hierarchy map to track parent-child relationships and depth
 */
function buildHierarchyMap(modules: Record<string, any>): Map<string, HierarchyInfo> {
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
  calculateDepthsAndChildren(hierarchyMap);

  return hierarchyMap;
}

/**
 * Calculate depths and mark parent-child relationships
 */
function calculateDepthsAndChildren(hierarchyMap: Map<string, HierarchyInfo>): void {
  for (const [itemKey, info] of hierarchyMap.entries()) {
    info.depth = calculateDepth(itemKey, hierarchyMap);

    // Mark parent as having children
    if (info.parent && hierarchyMap.has(info.parent)) {
      const parentInfo = hierarchyMap.get(info.parent)!;
      parentInfo.hasChildren = true;
      parentInfo.children.add(itemKey);
    }
  }
}

/**
 * Calculate depth by walking up parent chain
 */
function calculateDepth(
  itemKey: string,
  hierarchyMap: Map<string, HierarchyInfo>
): number {
  let depth = 0;
  let currentKey: string | undefined = itemKey;
  const visited = new Set<string>();

  while (currentKey && hierarchyMap.get(currentKey)?.parent) {
    if (visited.has(currentKey)) {
      console.warn(`[MenuLoader] Circular parent reference detected: ${itemKey}`);
      break;
    }
    
    visited.add(currentKey);
    currentKey = hierarchyMap.get(currentKey)!.parent;
    depth++;
    
    if (depth > MAX_HIERARCHY_DEPTH) {
      console.warn(`[MenuLoader] Max depth (${MAX_HIERARCHY_DEPTH}) exceeded for ${itemKey}`);
      break;
    }
  }

  return depth;
}

// ============================================================================
// FILTERING & VALIDATION
// ============================================================================

/**
 * Resolve attachTo value to parent ID
 */
function resolveAttachTo(
  attachTo: string | boolean | undefined,
  collection: string
): string | null {
  if (attachTo === undefined || attachTo === true) {
    return collection;
  }
  
  if (attachTo === false) {
    return null;
  }
  
  return attachTo;
}

/**
 * Check if item passes all filter criteria
 */
function checkItemInclusion(
  itemKey: string,
  data: any,
  menuConfig: ItemsAddToMenuData,
  meta: MetaData,
  hierarchyMap: Map<string, HierarchyInfo>
): boolean {
  if (!shouldItemHavePage(data, meta)) {
    return false;
  }

  const itemInfo = hierarchyMap.get(itemKey);
  if (!itemInfo) return false;

  return (
    passesDepthFilters(itemInfo, menuConfig.filter) &&
    passesTypeFilters(itemInfo, menuConfig.filter) &&
    passesTagFilters(data, menuConfig.filter) &&
    passesHierarchyModeFilter(itemInfo, menuConfig)
  );
}

/**
 * Check depth-related filters
 */
function passesDepthFilters(
  itemInfo: HierarchyInfo,
  filter: MenuFilterOptionsType = {}
): boolean {
  const { depth } = itemInfo;
  
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

  return true;
}

/**
 * Check item type filters (roots, leaves, branches)
 */
function passesTypeFilters(
  itemInfo: HierarchyInfo,
  filter: MenuFilterOptionsType = {}
): boolean {
  const isRoot = itemInfo.depth === 0;
  const hasChildren = itemInfo.hasChildren;
  
  if (filter.includeRoots === false && isRoot) return false;
  if (filter.includeLeaves === false && !hasChildren) return false;
  if (filter.includeBranches === false && hasChildren) return false;

  return true;
}

/**
 * Check tag-based filters
 */
function passesTagFilters(
  data: any,
  filter: MenuFilterOptionsType = {}
): boolean {
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

  return true;
}

/**
 * Check hierarchy mode specific filters
 */
function passesHierarchyModeFilter(
  itemInfo: HierarchyInfo,
  menuConfig: ItemsAddToMenuData
): boolean {
  const hierarchyMode = menuConfig.hierarchyMode || 'auto';
  const isRoot = itemInfo.depth === 0;
  const hasChildren = itemInfo.hasChildren;
  
  if (hierarchyMode === 'roots-only' && !isRoot) {
    return false;
  }
  
  if (hierarchyMode === 'leaves-only' && hasChildren) {
    return false;
  }
  
  if (hierarchyMode === 'skip-levels') {
    const includeLevels = menuConfig.includeLevels || [];
    if (!includeLevels.includes(itemInfo.depth)) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// PARENT DETERMINATION
// ============================================================================

/**
 * Determine parent for menu item based on hierarchy configuration
 */
function determineParent(
  collection: string,
  slug: string,
  data: any,
  menuConfig: ItemsAddToMenuData,
  attachTo: string | null,
  hierarchyMap: Map<string, HierarchyInfo>
): string | null {
  const hierarchyMode = menuConfig.hierarchyMode || 'auto';
  const placementStrategy = menuConfig.placementStrategy || 'nested';
  const respectHierarchy = menuConfig.respectHierarchy !== false;

  const itemKey = `${collection}/${slug}`;
  const itemInfo = hierarchyMap.get(itemKey);
  const contentParent = itemInfo?.parent;

  // Handle placement strategies
  if (placementStrategy === 'root-flat') {
    return null;
  }

  if (placementStrategy === 'root-with-hierarchy') {
    return respectHierarchy && contentParent ? contentParent : null;
  }

  if (placementStrategy === 'sibling' && attachTo) {
    return null; // Would need store lookup to get attachTo's parent
  }

  // Default: nested placement
  return determineNestedParent(
    hierarchyMode,
    respectHierarchy,
    contentParent,
    attachTo,
    itemInfo,
    menuConfig
  );
}

/**
 * Determine parent for nested placement strategy
 */
function determineNestedParent(
  hierarchyMode: HierarchyModeType,
  respectHierarchy: boolean,
  contentParent: string | undefined,
  attachTo: string | null,
  itemInfo: HierarchyInfo | undefined,
  menuConfig: ItemsAddToMenuData
): string | null {
  switch (hierarchyMode) {
    case 'flat':
      return attachTo;
    
    case 'manual':
      return menuConfig.parent || attachTo;
    
    case 'auto':
      if (respectHierarchy && contentParent) {
        return contentParent;
      }
      if (itemInfo && itemInfo.depth === 0) {
        return attachTo;
      }
      if (contentParent) {
        return contentParent;
      }
      return attachTo;
    
    case 'skip-levels':
    case 'roots-only':
    case 'leaves-only':
      return respectHierarchy && contentParent ? contentParent : attachTo;
    
    default:
      return attachTo;
  }
}

// ============================================================================
// MENU ITEM GENERATION
// ============================================================================

/**
 * Generate menu item data from content item
 */
function generateMenuItem(
  collection: string,
  slug: string,
  data: any,
  menuConfig: ItemsAddToMenuData,
  meta: MetaData,
  attachTo: string | null,
  hierarchyMap: Map<string, HierarchyInfo>
): any {
  const useRootPath = shouldItemUseRootPath(data, meta);
  const itemSlug = useRootPath ? `/${slug}` : `/${collection}/${slug}`;
  const title = data.title ?? capitalize(slug);
  const itemKey = `${collection}/${slug}`;
  
  const parent = determineParent(collection, slug, data, menuConfig, attachTo, hierarchyMap);
  const menus = normalizeMenuReference(menuConfig.menu);

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

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process collection-level menu configurations
 */
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any,
  logger: any,
  hierarchyMap: Map<string, HierarchyInfo>
): Promise<void> {
  const collections = getCollectionNames().filter(c => !isSystemCollection(c));

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
 */
function processCollectionAddToMenu(
  collection: string,
  meta: MetaData,
  store: any
): void {
  const menuConfigs = ensureArray(meta.addToMenu!);

  for (const menuConfig of menuConfigs as AddToMenuData[]) {
    const itemId = menuConfig.id ?? collection;
    const itemSlug = menuConfig.slug ?? `/${collection}`;
    const title = menuConfig.title ?? meta.title ?? capitalize(collection);
    const menus = normalizeMenuReference(menuConfig.menu);

    store.set({
      id: itemId,
      data: {
        title,
        description: menuConfig.description ?? meta.description,
        slug: itemSlug,
        url: itemSlug,
        menu: menus,
        parent: menuConfig.parent ?? null,
        openInNewTab: menuConfig.openInNewTab ?? false,
        metadata: menuConfig.metadata,
      },
    });
  }
}

/**
 * Process itemsAddToMenu configuration
 */
async function processCollectionItemsAddToMenu(
  collection: string,
  meta: MetaData,
  modules: Record<string, any>,
  store: any,
  hierarchyMap: Map<string, HierarchyInfo>
): Promise<void> {
  const configs = ensureArray(meta.itemsAddToMenu!);

  for (const menuConfig of configs as ItemsAddToMenuData[]) {
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
      const menuItemId = `${collection}-${slug}-${(menuConfig.menu as any)?.id || 'menu'}`;

      store.set({
        id: menuItemId,
        data: menuItem,
      });
    }
  }
}

/**
 * Create parent menu item for collection
 */
function createCollectionParentItem(
  collection: string,
  meta: MetaData,
  menuConfig: ItemsAddToMenuData,
  store: any
): void {
  const parentId = collection;
  
  // Check if parent already exists
  if (store.has(parentId)) {
    return;
  }

  const title = meta.title ?? capitalize(collection);
  const menus = normalizeMenuReference(menuConfig.menu);

  store.set({
    id: parentId,
    data: {
      title,
      description: meta.description,
      slug: `/${collection}`,
      url: `/${collection}`,
      menu: menus,
      parent: null,
      openInNewTab: false,
    },
  });
}

/**
 * Process individual item addToMenu configurations
 */
async function processItemMenus(
  modules: Record<string, any>,
  store: any,
  logger: any,
  hierarchyMap: Map<string, HierarchyInfo>
): Promise<void> {
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? mod.default;
    if (!data?.addToMenu) continue;

    const { collection, slug } = parseContentPath(path);
    const meta = await getCollectionMeta(collection);
    const menuConfigs = ensureArray(data.addToMenu);

    for (const menuConfig of menuConfigs as AddToMenuData[]) {
      const itemId = menuConfig.id ?? `${collection}/${slug}`;
      
      // Determine URL
      const itemSlug = menuConfig.slug ?? 
        (shouldItemUseRootPath(data, meta) ? `/${slug}` : `/${collection}/${slug}`);
      
      // Determine parent
      let parent: string | null = null;
      
      if (menuConfig.forceRoot) {
        parent = null;
      } else if (menuConfig.customHierarchy && menuConfig.parent !== undefined) {
        parent = menuConfig.parent ?? null;
      } else if (!menuConfig.customHierarchy && data.parent && !menuConfig.forceRoot) {
        const itemKey = `${collection}/${slug}`;
        const itemInfo = hierarchyMap.get(itemKey);
        parent = itemInfo?.parent ?? null;
      } else {
        parent = menuConfig.parent ?? null;
      }
      
      const menus = normalizeMenuReference(menuConfig.menu);

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
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