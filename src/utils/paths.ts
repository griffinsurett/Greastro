// src/utils/paths.ts

/**
 * Parses a content file path to extract collection name and slug
 * 
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
 * Checks if a path is a meta file
 */
export function isMetaFile(path: string): boolean {
  return /_meta\.(mdx|md|json)$/.test(path);
}

/**
 * Checks if a path belongs to a specific collection
 */
export function isInCollection(path: string, collectionName: string): boolean {
  return path.includes(`/content/${collectionName}/`);
}