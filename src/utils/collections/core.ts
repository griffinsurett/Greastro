// src/utils/collections/core.ts
import { getCollection } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import { collections } from '@/content/config';
import type { MetaData } from '@/content/schema';

export function getCollectionNames(): string[] {
  return Object.keys(collections);
}

type AnyItem = CollectionEntry<CollectionKey> | { slug?: string; id?: string; [key: string]: unknown };

export function getItemKey(item: AnyItem): string {
  if (!item) return "";
  if ('slug' in item && typeof item.slug === 'string' && item.slug) return item.slug;
  if ('id' in item && typeof item.id === 'string' && item.id) return item.id;
  return "";
}

export async function getCollectionWithMeta(collectionName: CollectionKey) {
  // Import meta here to avoid circular dependency at module load
  const { metaSchema } = await import('@/content/schema');
  
  const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
    "../../content/**/_meta.mdx",
    { eager: true }
  );

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  const simpleImageFn = () => ({
    parse: (val: any) => val,
    _parse: (val: any) => ({ success: true, data: val })
  });

  const meta: MetaData = metaSchema({ image: simpleImageFn }).parse(data);
  const entries = await getCollection(collectionName);
  
  return { entries, meta, collectionName };
}