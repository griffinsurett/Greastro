// src/components/section/variants/utils/DataPreparer.ts

import { getEntry } from 'astro:content';

export interface PreparedItem {
  title: string;
  description?: string;
  slug?: string;
  url?: string;
  image?: {
    src: string;
    alt: string;
  };
  date?: Date | string;
  tags?: string[];
  author?: {
    name: string;
    role?: string;
    initials?: string;
  };
  // Add any other common fields
  meta?: Record<string, any>; // For variant-specific data
}

export interface PreparedData {
  items: PreparedItem[];
  title?: string;
  description?: string;
  className?: string;
  columns?: number;
  gap?: string;
  // Any other section-level props
  [key: string]: any;
}

/**
 * Prepare collection entries for UI consumption
 */
export async function prepareCollectionData(
  entries: any[],
  collection?: string
): Promise<PreparedItem[]> {
  if (!entries || entries.length === 0) return [];
  
  return Promise.all(
    entries.map(async (entry) => {
      const item: PreparedItem = {
        title: entry.data.title,
        description: entry.data.description,
        slug: entry.slug,
        url: collection ? `/${collection}/${entry.slug}` : undefined,
      };

      // Handle image
      if (entry.data.image) {
        item.image = {
          src: entry.data.image.src,
          alt: entry.data.image.alt || entry.data.title
        };
      }

      // Handle dates
      if (entry.data.publishDate) {
        item.date = entry.data.publishDate;
      }

      // Handle tags
      if (entry.data.tags) {
        item.tags = entry.data.tags;
      }

      // Handle author reference
      if (entry.data.author) {
        try {
          const author = await getEntry(entry.data.author);
          if (author) {
            const names = author.data.title.split(' ');
            item.author = {
              name: author.data.title,
              role: author.data.role,
              initials: names.map((n: string) => n[0]).join('')
            };
          }
        } catch (e) {
          // Author resolution failed, skip it
        }
      }

      // Add any other fields as meta
      const knownFields = ['title', 'description', 'image', 'publishDate', 'tags', 'author'];
      const metaFields = Object.keys(entry.data).filter(key => !knownFields.includes(key));
      
      if (metaFields.length > 0) {
        item.meta = {};
        metaFields.forEach(key => {
          item.meta![key] = entry.data[key];
        });
      }

      return item;
    })
  );
}

/**
 * Prepare static data (for non-collection usage)
 */
export function prepareStaticData(props: any): PreparedData {
  const { variant, entries, ...rest } = props;
  
  // For static content, just pass through the props
  return {
    items: [], // No items for static content
    ...rest
  };
}