// src/utils/seo.ts
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getEntry } from 'astro:content';
import type { SEOData, MetaData, ImageInput } from '@/content/schema';

// SEO props interface
export interface SEOProps {
  title?: string;
  description?: string;
  image?: ImageInput;
  author?: string;
  publishDate?: Date | string;
  seo?: SEOData;
  siteName?: string;
}

// Resolve author reference to a name
export async function resolveAuthor(
  author: any
): Promise<string | undefined> {
  if (!author) return undefined;
  
  if (typeof author === 'string') {
    try {
      const entry = await getEntry('authors', author);
      return entry?.data.title || author;
    } catch {
      return author;
    }
  }
  
  if (author?.collection === 'authors' && author?.id) {
    const entry = await getEntry('authors', author.id);
    return entry?.data.title || author.id;
  }
  
  if (author?.title) return author.title;
  if (author?.name) return author.name;
  
  return undefined;
}

// Build SEO props from collection item data
export async function buildItemSEOProps(
  item: CollectionEntry<CollectionKey>,
  collectionMeta?: MetaData
): Promise<SEOProps> {
  const authorName = 'author' in item.data 
    ? await resolveAuthor(item.data.author) 
    : undefined;
  
  return {
    title: item.data.title,
    description: item.data.description,
    image: item.data.featuredImage || collectionMeta?.featuredImage,
    author: authorName,
    publishDate: item.data.publishDate,
    seo: {
      ...collectionMeta?.seo,
      ...item.data.seo,
    }
  };
}

// Build SEO props for collection index pages
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