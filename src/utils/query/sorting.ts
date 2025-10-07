// src/utils/query/sorting.ts
/**
 * Sorting Utilities
 * 
 * Type-safe sorting functions for query operations.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { SortFn, SortConfig } from './types';

/**
 * Create a sort function for a field
 */
export function sortBy<T extends CollectionKey>(
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): SortFn<T> {
  return (a: CollectionEntry<T>, b: CollectionEntry<T>) => {
    const aData = a.data as any;
    const bData = b.data as any;
    const aValue = aData[field];
    const bValue = bData[field];
    
    // Handle null/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Compare values
    let result = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      result = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      result = aValue.getTime() - bValue.getTime();
    } else {
      result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    
    return direction === 'asc' ? result : -result;
  };
}

/**
 * Sort by publish date (most recent first)
 */
export function sortByDate<T extends CollectionKey>(
  field: string = 'publishDate',
  direction: 'asc' | 'desc' = 'desc'
): SortFn<T> {
  return (a: CollectionEntry<T>, b: CollectionEntry<T>) => {
    const aData = a.data as any;
    const bData = b.data as any;
    const aDate = aData[field] ? new Date(aData[field]) : null;
    const bDate = bData[field] ? new Date(bData[field]) : null;
    
    if (!aDate && !bDate) return 0;
    if (!aDate) return direction === 'desc' ? 1 : -1;
    if (!bDate) return direction === 'desc' ? -1 : 1;
    
    const diff = aDate.getTime() - bDate.getTime();
    return direction === 'asc' ? diff : -diff;
  };
}

/**
 * Sort by title (alphabetically)
 */
export function sortByTitle<T extends CollectionKey>(
  direction: 'asc' | 'desc' = 'asc'
): SortFn<T> {
  return sortBy('title', direction);
}

/**
 * Sort by order field
 */
export function sortByOrder<T extends CollectionKey>(
  direction: 'asc' | 'desc' = 'asc'
): SortFn<T> {
  return sortBy('order', direction);
}

/**
 * Create a multi-level sort function
 */
export function sortByMultiple<T extends CollectionKey>(
  ...sortFns: SortFn<T>[]
): SortFn<T> {
  return (a: CollectionEntry<T>, b: CollectionEntry<T>) => {
    for (const sortFn of sortFns) {
      const result = sortFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

/**
 * Create sort function from config
 */
export function createSortFn<T extends CollectionKey>(
  config: SortConfig
): SortFn<T> {
  return sortBy(config.field, config.direction);
}

/**
 * Apply sorting to entries
 */
export function applySorting<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  sort: SortFn<T> | SortFn<T>[] | SortConfig[]
): CollectionEntry<T>[] {
  // Convert configs to functions
  if (Array.isArray(sort) && sort.length > 0 && 'field' in sort[0]) {
    const sortFns = (sort as SortConfig[]).map(config => createSortFn<T>(config));
    return [...entries].sort(sortByMultiple(...sortFns));
  }
  
  // Single sort function
  if (typeof sort === 'function') {
    return [...entries].sort(sort);
  }
  
  // Array of sort functions
  if (Array.isArray(sort)) {
    return [...entries].sort(sortByMultiple(...(sort as SortFn<T>[])));
  }
  
  return entries;
}