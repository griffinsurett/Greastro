// src/utils/seo.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getEntry } from 'astro:content';
import type { SEOData, MetaData, ImageInput } from '@/content/schema';

/**
 * SEO props interface for page metadata
 */
export interface SEOProps {
  title?: string;
  description?: string;
  image?: ImageInput;
  author?: string;
  publishDate?: Date | string;
  seo?: SEOData;
  siteName?: string;
}

/**
 * Resolves an author reference to a display name
 * Handles: string IDs, reference objects, and author objects with name/title
 */
export async function resolveAuthor(author: any): Promise<string | undefined> {
  if (!author) return undefined;
  
  // Direct properties
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
 * Builds SEO props from a collection item entry
 */
export async function buildItemSEOProps(
  item: CollectionEntry<CollectionKey>,
  collectionMeta?: MetaData
): Promise<SEOProps> {
  const itemData = item.data as any;
  
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
      ...collectionMeta?.seo,
      ...itemData.seo,
    }
  };
}

/**
 * Builds SEO props for collection index pages
 */
export function buildCollectionSEOProps(
  collectionMeta: MetaData,
  collectionName: string
): SEOProps {
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