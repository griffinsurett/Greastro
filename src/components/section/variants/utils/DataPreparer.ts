// src/components/section/variants/utils/DataPreparer.ts
import { getEntry } from 'astro:content';
import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { PreparedItem, PreparedFields } from './VariantTypes';
import { getItemKey } from '@/utils/getItemKey';
import { getCollectionMeta } from '@/utils/fetchMeta';
import { shouldItemHavePage } from '@/utils/hasPageUtils';

// Helper to check if a value is a collection reference
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

// Helper to check if a value is an array of collection references
function isReferenceArray(value: any): value is Array<{ collection: string; id: string }> {
  return Array.isArray(value) && value.every(isCollectionReference);
}

// Generic reference resolver
async function resolveReference(ref: { collection: string; id: string }): Promise<any> {
  try {
    const entry = await getEntry(ref.collection as CollectionKey, ref.id);
    
    if (!entry) return null;
    
    // Extract common fields from the referenced entry
    const resolved: any = {
      _collection: ref.collection,
      _id: ref.id,
    };
    
    // Common fields to extract from any referenced collection
    if ('title' in entry.data) {
      resolved.title = entry.data.title;
      resolved.name = entry.data.title; // Alias for convenience
      
      // Generate initials from title/name
      const names = String(entry.data.title).split(' ').filter(Boolean);
      resolved.initials = names.map((n: string) => n[0]).join('').toUpperCase();
    }
    
    if ('description' in entry.data) {
      resolved.description = entry.data.description;
    }
    
    if ('role' in entry.data) {
      resolved.role = entry.data.role;
    }
    
    if ('email' in entry.data) {
      resolved.email = entry.data.email;
    }
    
    if ('company' in entry.data) {
      resolved.company = entry.data.company;
    }
    
    if ('featuredImage' in entry.data) {
      resolved.image = entry.data.featuredImage;
    }
    
    if ('slug' in entry) {
      resolved.slug = entry.slug;
      // Generate URL for the referenced item
      resolved.url = `/${ref.collection}/${entry.slug}`;
    } else if ('id' in entry) {
      resolved.slug = entry.id;
      resolved.url = `/${ref.collection}/${entry.id}`;
    }
    
    // Include all data from the referenced entry (allows access to any field)
    resolved.data = entry.data;
    
    return resolved;
  } catch (error) {
    console.error(`Error resolving reference to ${ref.collection}/${ref.id}:`, error);
    return null;
  }
}

// Recursively process data to find and resolve references
async function processDataForReferences(data: any, depth = 0, maxDepth = 3): Promise<any> {
  // Prevent infinite recursion
  if (depth >= maxDepth) return data;
  
  // Handle null/undefined
  if (data == null) return data;
  
  // Handle collection reference
  if (isCollectionReference(data)) {
    return await resolveReference(data);
  }
  
  // Handle array of references
  if (isReferenceArray(data)) {
    return await Promise.all(data.map(ref => resolveReference(ref)));
  }
  
  // Handle regular arrays
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(item => processDataForReferences(item, depth + 1, maxDepth))
    );
  }
  
  // Handle objects (but not dates or other special objects)
  if (typeof data === 'object' && data.constructor === Object) {
    const processed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip processing for certain keys to avoid unnecessary recursion
      if (key.startsWith('_') || key === 'data') {
        processed[key] = value;
      } else {
        processed[key] = await processDataForReferences(value, depth + 1, maxDepth);
      }
    }
    
    return processed;
  }
  
  // Return primitives as-is
  return data;
}

// Field detection helpers
function findDateField(data: any): any {
  const dateFields = ['publishDate', 'date', 'createdAt', 'updatedAt', 'publishedAt'];
  
  for (const field of dateFields) {
    if (data[field]) return data[field];
  }
  
  // Fallback: any field containing 'date' or ending with 'At'
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

export async function prepareCollectionData<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T
): Promise<PreparedItem[]> {
  const collectionMeta = getCollectionMeta(collection);
  
  return Promise.all(
    entries.map(async (entry) => {
      const identifier = getItemKey(entry);
      
      // Process all data fields to resolve any collection references
      const processedData = await processDataForReferences(entry.data);
      
      // Build prepared fields
      const prepared: PreparedFields = {
        slug: identifier,
      };

      if (shouldItemHavePage(entry, collectionMeta)) {
        prepared.url = `/${collection}/${identifier}`;
      }

      // Auto-detect common fields
      const date = findDateField(processedData);
      if (date) prepared.date = date;
      
      const image = findImageField(processedData);
      if (image) prepared.image = image;
      
      if (processedData.tags && Array.isArray(processedData.tags)) {
        prepared.tags = processedData.tags;
      }
      
      // Merge everything together
      return {
        ...processedData,
        ...prepared
      } as PreparedItem;
    })
  );
}

export function prepareStaticData(props: Record<string, any>): Record<string, any> {
  return props.items ? props : { items: [], ...props };
}