// src/utils/images.ts
import type { ImageInput } from '@/content/schema';

/**
 * Type guard for image objects
 */
export function isImageObject(value: any): value is { src: string; alt?: string } {
  return value && typeof value === 'object' && 'src' in value;
}

/**
 * Extracts image URL from various image input formats
 * Handles: string paths, Astro optimized images, and image objects
 */
export function getImageUrl(img: ImageInput | undefined, fallback: string): string {
  if (!img) return fallback;
  
  // Handle string paths
  if (typeof img === 'string') return img;
  
  // Must be an object from here
  if (typeof img !== 'object') return fallback;
  
  // Astro optimized images have 'format' property
  if ('format' in img && 'src' in img && typeof img.src === 'string') {
    return img.src;
  }
  
  // Standard image objects with src property
  if ('src' in img) {
    const src = img.src;
    
    // Direct string src
    if (typeof src === 'string') return src;
    
    // Nested object with src (some Astro image formats)
    if (typeof src === 'object' && src && 'src' in src) {
      const nestedSrc = (src as any).src;
      if (typeof nestedSrc === 'string') return nestedSrc;
    }
  }
  
  return fallback;
}