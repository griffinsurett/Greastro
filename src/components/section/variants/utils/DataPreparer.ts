// src/components/section/variants/utils/DataPreparer.ts
import { getEntry } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { PreparedItem, AnyCollectionEntry } from '@/types';
import { getItemKey } from '@/utils/getItemKey';
import { getCollectionMeta } from '@/utils/fetchMeta';
import { shouldItemHavePage } from '@/utils/pageUtils';

// ============================================================================
// REFERENCE RESOLUTION
// ============================================================================

function isCollectionReference(value: any): value is { collection: string; id: string } {
  return (
    value &&
    typeof value === 'object' &&
    'collection' in value &&
    'id' in value &&
    typeof value.collection === 'string' &&
    typeof value.id === 'string'
  );
}

function isReferenceArray(value: any): value is Array<{ collection: string; id: string }> {
  return Array.isArray(value) && value.every(isCollectionReference);
}

async function resolveReference(ref: { collection: string; id: string }): Promise<any> {
  try {
    const entry = await getEntry(ref.collection as CollectionKey, ref.id);
    if (!entry) return null;
    
    const resolved: any = {
      _collection: ref.collection,
      _id: ref.id,
      ...entry.data, // Include all data
    };
    
    // Add computed fields
    if (entry.data.title) {
      resolved.name = entry.data.title;
      const names = String(entry.data.title).split(' ').filter(Boolean);
      resolved.initials = names.map((n: string) => n[0]).join('').toUpperCase();
    }
    
    // Add URL if available
    if ('slug' in entry) {
      resolved.slug = entry.slug;
      resolved.url = `/${ref.collection}/${entry.slug}`;
    } else if ('id' in entry) {
      resolved.slug = entry.id;
      resolved.url = `/${ref.collection}/${entry.id}`;
    }
    
    return resolved;
  } catch (error) {
    console.error(`Error resolving reference ${ref.collection}/${ref.id}:`, error);
    return null;
  }
}

async function processDataForReferences(data: any, depth = 0, maxDepth = 3): Promise<any> {
  if (depth >= maxDepth) return data;
  if (data == null) return data;
  
  if (isCollectionReference(data)) {
    return await resolveReference(data);
  }
  
  if (isReferenceArray(data)) {
    return await Promise.all(data.map(ref => resolveReference(ref)));
  }
  
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(item => processDataForReferences(item, depth + 1, maxDepth))
    );
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const processed: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_') || key === 'data') {
        processed[key] = value;
      } else {
        processed[key] = await processDataForReferences(value, depth + 1, maxDepth);
      }
    }
    return processed;
  }
  
  return data;
}

// ============================================================================
// FIELD AUTO-DETECTION
// ============================================================================

function findDateField(data: any): any {
  const dateFields = ['publishDate', 'date', 'createdAt', 'updatedAt', 'publishedAt'];
  
  for (const field of dateFields) {
    if (data[field]) return data[field];
  }
  
  for (const [key, value] of Object.entries(data)) {
    if ((key.toLowerCase().includes('date') || key.endsWith('At')) && value) {
      return value;
    }
  }
  
  return undefined;
}

function findImageField(data: any): any {
  const imageFields = ['featuredImage', 'image', 'thumbnail', 'cover', 'avatar'];
  
  for (const field of imageFields) {
    if (data[field] && typeof data[field] === 'object' && 'src' in data[field]) {
      return data[field];
    }
  }
  
  return undefined;
}

// ============================================================================
// MAIN PREPARATION FUNCTION
// ============================================================================

export async function prepareCollectionData<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T
): Promise<PreparedItem[]> {
  const collectionMeta = getCollectionMeta(collection);
  
  return Promise.all(
    entries.map(async (entry) => {
      const identifier = getItemKey(entry);
      
      // Resolve any collection references in the data
      const processedData = await processDataForReferences(entry.data);
      
      // Build the prepared item with only fields NOT in schema
      const prepared: PreparedItem = {
        ...processedData,
        slug: identifier,
      };

      // Add URL if item should have a page
      if (shouldItemHavePage(entry, collectionMeta)) {
        prepared.url = `/${collection}/${identifier}`;
      }

      // Auto-detect and add common fields if not already present
      if (!prepared.date) {
        const date = findDateField(processedData);
        if (date) prepared.date = date;
      }
      
      if (!prepared.image) {
        const image = findImageField(processedData);
        if (image) prepared.image = image;
      }
      
      return prepared;
    })
  );
}

export function prepareStaticData(props: Record<string, any>): Record<string, any> {
  return props.items ? props : { items: [], ...props };
}