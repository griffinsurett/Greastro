import { getEntry } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { PreparedItem, PreparedFields } from './VariantTypes';
import { getItemKey } from '@/utils/getItemKey';
import { getCollectionMeta } from '@/utils/fetchMeta';
import { shouldItemHavePage } from '@/utils/hasPageUtils';

export async function prepareCollectionData<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T
): Promise<PreparedItem[]> {
  // Get collection-level meta settings
  const collectionMeta = getCollectionMeta(collection);
  
  return Promise.all(
    entries.map(async (entry) => {
      // Use getItemKey to get the correct identifier (slug for MDX, id for JSON)
      const identifier = getItemKey(entry);
      
      const prepared: PreparedFields = {
        slug: identifier,
      };

      // Use utility to determine if URL should be created
      if (shouldItemHavePage(entry, collectionMeta)) {
        prepared.url = `/${collection}/${identifier}`;
      }

      // Normalize common fields for variants
      if ('publishDate' in entry.data && entry.data.publishDate) {
        prepared.date = entry.data.publishDate;
      }

      if ('featuredImage' in entry.data && entry.data.featuredImage) {
        prepared.image = entry.data.featuredImage;
      }

      // Resolve author reference if it exists
      if ('author' in entry.data && entry.data.author) {
        try {
          const authorRef = entry.data.author as { collection: string; id: string };
          const authorEntry = await getEntry(authorRef.collection as CollectionKey, authorRef.id);
          
          if (authorEntry && 'title' in authorEntry.data) {
            const title = authorEntry.data.title as string;
            const names = title.split(' ');
            prepared.author = {
              name: title,
              role: 'role' in authorEntry.data ? String(authorEntry.data.role) : '',
              initials: names.map((n: string) => n[0]).join('')
            };
          }
        } catch (e) {
          console.error('Error resolving author:', e);
        }
      }

      // Merge original data with prepared fields
      return {
        ...entry.data,
        ...prepared
      } as PreparedItem;
    })
  );
}

export function prepareStaticData(props: Record<string, any>): Record<string, any> {
  return props.items ? props : { items: [], ...props };
}