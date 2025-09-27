// src/utils/VariantUtils.ts

/**
 * Dynamically discover all variant components
 */
export async function getVariantComponents() {
  const variants = import.meta.glob('../*.astro', { eager: true });
  
  return Object.entries(variants).reduce((acc, [path, module]) => {
    const variantName = path
      .split('/')
      .pop()
      ?.replace('Variant.astro', '')
      .toLowerCase();
    
    if (variantName && module && typeof module === 'object' && 'default' in module) {
      acc[variantName] = module.default;
    }
    
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Check if a variant exists
 */
export async function isValidVariant(name: string): Promise<boolean> {
  const components = await getVariantComponents();
  return name.toLowerCase() in components;
}