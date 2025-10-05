// src/utils/paths.ts
/**
 * Path Parsing Utilities
 * 
 * Helper functions for working with content file paths.
 * Extracts collection names, slugs, and identifies special files.
 * 
 * Used by loaders and other utilities to parse glob import paths.
 */

/**
 * Parse a content file path to extract collection name and slug
 * 
 * Handles the standard content structure:
 * src/content/{collection}/{file}.mdx
 * 
 * @param path - File path from glob import
 * @returns Object with collection name and slug (filename without extension)
 * @example
 * parseContentPath('../../content/blog/my-post.mdx')
 * // Returns: { collection: 'blog', slug: 'my-post' }
 */
export function parseContentPath(path: string): { collection: string; slug: string } {
  const segments = path.split('/');
  const fileName = segments.pop()!;
  const collection = segments.pop()!;
  const slug = fileName.replace(/\.(mdx|md|json)$/, '');
  
  return { collection, slug };
}

/**
 * Check if a path is a meta file (_meta.mdx, _meta.md, _meta.json)
 * 
 * Meta files are special - they configure collections but aren't
 * collection entries themselves.
 * 
 * @param path - File path to check
 * @returns True if path is a meta file
 */
export function isMetaFile(path: string): boolean {
  return /_meta\.(mdx|md|json)$/.test(path);
}

/**
 * Check if a path belongs to a specific collection
 * 
 * @param path - File path to check
 * @param collectionName - Collection name to match
 * @returns True if path is in the specified collection
 */
export function isInCollection(path: string, collectionName: string): boolean {
  return path.includes(`/content/${collectionName}/`);
}