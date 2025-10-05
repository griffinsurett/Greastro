// src/utils/seo.ts
/**
 * SEO Props Builder
 * 
 * Builds SEO metadata objects for pages from collection entries.
 * Handles:
 * - Resolving author references to display names
 * - Merging item and collection SEO settings
 * - Building complete SEO props for layout components
 * 
 * Used by dynamic page routes to generate proper meta tags.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getEntry } from 'astro:content';
import type { SEOData, MetaData, ImageInput } from '@/content/schema';

/**
 * SEO props interface for page metadata
 * Passed to SEO.astro component for meta tag generation
 */
export interface SEOProps {
  title?: string;              // Page title
  description?: string;        // Page description
  image?: ImageInput;          // Featured/OG image
  author?: string;             // Author name (resolved from reference)
  publishDate?: Date | string; // Publication date
  seo?: SEOData;              // Additional SEO overrides
  siteName?: string;          // Site name for OG tags
}

/**
 * Resolve an author reference to a display name
 * 
 * Handles multiple author formats:
 * - String IDs: 'jane-doe'
 * - Reference objects: { collection: 'authors', id: 'jane-doe' }
 * - Author objects: { title: 'Jane Doe', ... }
 * 
 * @param author - Author in any supported format
 * @returns Author display name or undefined
 * @example
 * await resolveAuthor('jane-doe') // 'Jane Doe'
 * await resolveAuthor({ title: 'John Smith' }) // 'John Smith'
 */
export async function resolveAuthor(author: any): Promise<string | undefined> {
  if (!author) return undefined;
  
  // Direct properties (already resolved object)
  if (author.title) return author.title;
  if (author.name) return author.name;
  
  // Extract ID from reference or use string directly
  const authorId = typeof author === 'string' ? author : author.id;
  if (!authorId) return undefined;
  
  // Look up author entry
  try {
    const entry = await getEntry('authors', authorId);
    return entry?.data.title || authorId;
  } catch {
    return authorId;
  }
}

/**
 * Build SEO props from a collection item entry
 * 
 * Combines item data with collection defaults:
 * - Item's own SEO settings take precedence
 * - Falls back to collection's SEO settings
 * - Resolves author reference if present
 * 
 * @param item - Collection entry to build SEO for
 * @param collectionMeta - Optional collection metadata for defaults
 * @returns Complete SEO props object for layout
 * @example
 * const seo = await buildItemSEOProps(blogPost, blogMeta);
 * // Returns: { title, description, image, author, seo: {...} }
 */
export async function buildItemSEOProps(
  item: CollectionEntry<CollectionKey>,
  collectionMeta?: MetaData
): Promise<SEOProps> {
  const itemData = item.data as any;
  
  // Resolve author to display name
  const authorName = itemData.author
    ? await resolveAuthor(itemData.author) 
    : undefined;
  
  return {
    title: itemData.title,
    description: itemData.description,
    image: itemData.featuredImage || collectionMeta?.featuredImage,
    author: authorName,
    publishDate: itemData.publishDate,
    seo: {
      // Collection SEO defaults
      ...collectionMeta?.seo,
      // Item SEO overrides
      ...itemData.seo,
    }
  };
}

/**
 * Build SEO props for collection index pages
 * 
 * Uses collection metadata with sensible defaults.
 * 
 * @param collectionMeta - Collection metadata from _meta.mdx
 * @param collectionName - Collection name for fallback title
 * @returns SEO props for collection index page
 * @example
 * const seo = buildCollectionSEOProps(blogMeta, 'blog');
 * // Returns: { title: 'Blog', description: '...', seo: {...} }
 */
export function buildCollectionSEOProps(
  collectionMeta: MetaData,
  collectionName: string
): SEOProps {
  // Capitalize collection name for fallback title
  const title = collectionMeta.title || 
    collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  
  const description = collectionMeta.description || 
    `Browse our ${collectionName} collection`;
  
  return {
    title,
    description,
    image: collectionMeta.featuredImage,
    seo: collectionMeta.seo || {}
  };
}