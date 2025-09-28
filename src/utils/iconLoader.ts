// src/utils/iconLoader.ts
export interface DynamicIconProps {
  icon: string;
  library?: 'lucide' | 'simple-icons' | 'fa6-brands' | 'fa6-solid';
}

// Map libraries to their prefixes
const libraryPrefixes: Record<string, string> = {
  'lucide': 'lucide',
  'simple-icons': 'simple-icons',
  'fa6-brands': 'fa6-brands',
  'fa6-solid': 'fa6-solid',
};

export function getIconName(icon: string, library?: string): string {
  // If icon already has a prefix, return as-is
  if (icon.includes(':')) return icon;
  
  // Otherwise, add the library prefix (default to lucide)
  const prefix = library ? libraryPrefixes[library] : 'lucide';
  return `${prefix}:${icon}`;
}

// Dynamic import function for client-side icon loading
export async function loadIconLibrary(library: string) {
  switch (library) {
    case 'lucide':
      return await import('@iconify-json/lucide');
    case 'simple-icons':
      return await import('@iconify-json/simple-icons');
    case 'fa6-brands':
      return await import('@iconify-json/fa6-brands');
    case 'fa6-solid':
      return await import('@iconify-json/fa6-solid');
    default:
      throw new Error(`Unknown icon library: ${library}`);
  }
}