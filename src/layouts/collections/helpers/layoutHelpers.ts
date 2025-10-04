// src/layouts/collections/helpers/layoutHelpers.ts

/**
 * Resolves author name from various author formats
 */
export function getAuthorName(author: any): string {
  if (!author) return '';
  if (typeof author === 'string') return author;
  if (author.name) return author.name;
  if (author.title) return author.title;
  if (author.id) return author.id;
  return '';
}

/**
 * Extracts image URL from various image formats
 */
export function getImageSrc(image: any): string {
  if (!image) return '';
  
  if (typeof image === 'string') {
    if (image.startsWith('@/')) {
      return image.replace('@/', '/src/');
    }
    return image;
  }
  
  if (image.src) {
    if (typeof image.src === 'string') return image.src;
    if (image.src.src) return image.src.src;
    return image.src;
  }
  
  return '';
}