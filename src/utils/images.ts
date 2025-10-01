// src/utils/images.ts
import type { ImageInput } from '@/content/schema';

export function isImageObject(value: any): value is { src: string; alt?: string } {
  return value && typeof value === 'object' && 'src' in value;
}

export function getImageUrl(img: ImageInput | undefined, fallback: string): string {
  if (!img) return fallback;
  if (typeof img === 'string') return img;
  if (typeof img === 'object') {
    if ('src' in img && typeof img.src === 'string' && 'format' in img) {
      return img.src;
    }
    if ('src' in img) {
      if (typeof img.src === 'string') return img.src;
      if (typeof img.src === 'object' && 'src' in img.src) {
        return img.src.src;
      }
    }
  }
  return fallback;
}