// src/utils/layoutUtils.ts

/**
 * Dynamically discover all collection layout components
 */
export async function getCollectionLayouts() {
const layouts = import.meta.glob('/src/layouts/collections/*.astro', { eager: true });
  
  return Object.entries(layouts).reduce((acc, [path, module]) => {
    const fileName = path.split('/').pop()?.replace('.astro', '');
    
    if (fileName && module && typeof module === 'object' && 'default' in module) {
      acc[fileName] = module.default;
    }
    
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Get the layout component for a collection or item
 */
export async function getLayoutComponent(layoutName: string) {
  const layouts = await getCollectionLayouts();
  return layouts[layoutName] || layouts['CollectionLayout'];
}

/**
 * Get the layout name for a collection or item
 */
export function getLayoutName(
  meta: any,
  item?: any,
  isItemPage: boolean = false
): string {
  // Item-level override takes precedence
  if (isItemPage && item?.data?.layout) {
    return item.data.layout;
  }
  
  // Use collection meta layout configuration
  if (isItemPage && meta?.itemLayout) {
    return meta.itemLayout;
  }
  
  // For collection index pages
  if (!isItemPage && meta?.layout) {
    return meta.layout;
  }
  
  // Default fallback is CollectionLayout
  return 'CollectionLayout';
}