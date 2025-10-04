// src/layouts/collections/helpers/layoutUtils.ts
/**
 * Dynamically discover all collection layout components
 */
export async function getCollectionLayouts() {
  const layouts = import.meta.glob('../*.astro', { eager: true });
  
  const result = Object.entries(layouts).reduce((acc, [path, module]) => {
    const fileName = path.split('/').pop()?.replace('.astro', '');
    
    if (fileName && module && typeof module === 'object' && 'default' in module) {
      acc[fileName] = module.default;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  return result;
}

/**
 * Get the layout component for a collection or item
 */
export async function getLayoutComponent(layoutName: string) {
  const layouts = await getCollectionLayouts();
  
  const component = layouts[layoutName] || layouts['CollectionLayout'];
  
  if (!component) {
    throw new Error(
      `Layout component "${layoutName}" not found. Available layouts: ${Object.keys(layouts).join(', ')}. ` +
      `Make sure you have a CollectionLayout.astro file in src/layouts/collections/`
    );
  }
  
  return component;
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
  if (isItemPage && item?.data?.itemLayout) {
    return item.data.itemLayout;
  }
  
  // Use collection meta itemsLayout for individual items
  if (isItemPage && meta?.itemsLayout) {
    return meta.itemsLayout;
  }
  
  // Default fallback is CollectionLayout
  return 'CollectionLayout';
}