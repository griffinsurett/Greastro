/**
 * Dynamically discover all variant components
 */
export async function getVariantComponents() {
  const variants = import.meta.glob('../*.astro', { eager: true });
  
  return Object.entries(variants).reduce((acc, [path, module]) => {
    const fileName = path.split('/').pop()?.replace('.astro', '');
    
    if (fileName && module && typeof module === 'object' && 'default' in module) {
      acc[fileName] = module.default;
    }
    
    return acc;
  }, {} as Record<string, any>);
}