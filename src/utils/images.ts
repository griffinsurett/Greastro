// src/utils/images.ts
/**
 * Image URL Utilities
 * 
 * Helper functions for extracting image URLs from various formats:
 * - String paths (direct URLs or relative paths)
 * - Astro optimized images (with format, src properties)
 * - Image objects ({ src, alt })
 * - Nested image objects (Astro sometimes creates these)
 * 
 * Provides consistent image handling across components.
 */

import type { ImageInput } from '@/content/schema';

/**
 * Type guard to check if value is an image object
 * 
 * @param value - Value to check
 * @returns True if value has a src property
 */
export function isImageObject(value: any): value is { src: string; alt?: string } {
  return value && typeof value === 'object' && 'src' in value;
}

/**
 * Extract image URL from various image input formats
 * 
 * Handles multiple image formats from Astro and content collections:
 * - Direct strings: "/images/photo.jpg"
 * - Optimized images: { format: 'webp', src: '/...' }
 * - Image objects: { src: '/...', alt: '...' }
 * - Nested objects: { src: { src: '/...' } }
 * 
 * @param img - Image input of any supported format
 * @param fallback - URL to use if img is undefined or invalid
 * @returns Image URL string
 * @example
 * getImageUrl(featuredImage, '/default.jpg') // '/images/hero.jpg'
 * getImageUrl(undefined, '/default.jpg') // '/default.jpg'
 */
export function getImageUrl(img: ImageInput | undefined, fallback: string): string {
  // No image provided, use fallback
  if (!img) return fallback;
  
  // Direct string path
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
    
    // Nested object with src (some Astro image formats do this)
    if (typeof src === 'object' && src && 'src' in src) {
      const nestedSrc = (src as any).src;
      if (typeof nestedSrc === 'string') return nestedSrc;
    }
  }
  
  // Couldn't extract URL, use fallback
  return fallback;
}