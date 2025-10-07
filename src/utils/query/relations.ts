// src/utils/query/relations.ts
/**
 * Relation Resolution Utilities
 * 
 * High-level functions for querying relationships between entries.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getEntry } from 'astro:content';
import { 
  type RelationshipGraph, 
  type Relation, 
  type RelationMap,
  type RelationType,
} from './types';
import { getRelationMap, getOrBuildGraph } from './graph';

/**
 * Get all relations for an entry
 */
export async function getRelations(
  collection: CollectionKey,
  id: string,
  types?: RelationType[]
): Promise<RelationMap> {
  const graph = await getOrBuildGraph();
  const relationMap = getRelationMap(graph, collection, id);
  
  if (!relationMap) {
    throw new Error(`Entry not found: ${collection}/${id}`);
  }
  
  // Filter by types if specified
  if (types && types.length > 0) {
    const filtered: RelationMap = {
      ...relationMap,
      references: filterByType(relationMap.references, types),
      referencedBy: filterByType(relationMap.referencedBy, types),
      children: filterByType(relationMap.children, types),
      siblings: filterByType(relationMap.siblings, types),
      ancestors: filterByType(relationMap.ancestors, types),
      descendants: filterByType(relationMap.descendants, types),
      indirect: filterByType(relationMap.indirect, types),
    };
    
    return filtered;
  }
  
  return relationMap;
}

/**
 * Get entries that this entry references
 */
export async function getReferencedEntries<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    field?: string;
    targetCollection?: CollectionKey;
    resolve?: boolean;
  } = {}
): Promise<Relation[]> {
  const { field, targetCollection, resolve = false } = options;
  const relationMap = await getRelations(collection, id, ['reference']);
  
  let relations = relationMap.references;
  
  // Filter by field
  if (field) {
    relations = relations.filter(r => r.field === field);
  }
  
  // Filter by target collection
  if (targetCollection) {
    relations = relations.filter(r => r.collection === targetCollection);
  }
  
  // Resolve entries if requested
  if (resolve) {
    await resolveRelations(relations);
  }
  
  return relations;
}

/**
 * Get entries that reference this entry
 */
export async function getReferencingEntries<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    field?: string;
    fromCollection?: CollectionKey;
    resolve?: boolean;
  } = {}
): Promise<Relation[]> {
  const { field, fromCollection, resolve = false } = options;
  const relationMap = await getRelations(collection, id, ['referenced-by']);
  
  let relations = relationMap.referencedBy;
  
  // Filter by field
  if (field) {
    relations = relations.filter(r => r.field === field);
  }
  
  // Filter by source collection
  if (fromCollection) {
    relations = relations.filter(r => r.collection === fromCollection);
  }
  
  // Resolve entries if requested
  if (resolve) {
    await resolveRelations(relations);
  }
  
  return relations;
}

/**
 * Get all related entries (both directions)
 */
export async function getAllRelatedEntries<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    includeIndirect?: boolean;
    maxDepth?: number;
    resolve?: boolean;
  } = {}
): Promise<Relation[]> {
  const { includeIndirect = false, maxDepth = 1, resolve = false } = options;
  
  const relationMap = await getRelations(collection, id);
  
  const relations: Relation[] = [
    ...relationMap.references,
    ...relationMap.referencedBy,
  ];
  
  // Include indirect if requested
  if (includeIndirect) {
    const indirectFiltered = relationMap.indirect.filter(
      r => !maxDepth || (r.depth && r.depth <= maxDepth)
    );
    relations.push(...indirectFiltered);
  }
  
  // Resolve if requested
  if (resolve) {
    await resolveRelations(relations);
  }
  
  // Remove duplicates
  return deduplicateRelations(relations);
}

/**
 * Resolve relation entries (lazy load)
 */
export async function resolveRelations(relations: Relation[]): Promise<void> {
  await Promise.all(
    relations.map(async (relation) => {
      if (!relation.entry) {
        try {
          relation.entry = await getEntry(relation.collection, relation.id);
        } catch (error) {
          console.warn(`Failed to resolve ${relation.collection}/${relation.id}`);
        }
      }
    })
  );
}

/**
 * Helper: Filter relations by type
 */
function filterByType(relations: Relation[], types: RelationType[]): Relation[] {
  return relations.filter(r => types.includes(r.type));
}

/**
 * Helper: Deduplicate relations
 */
function deduplicateRelations(relations: Relation[]): Relation[] {
  const seen = new Set<string>();
  return relations.filter(r => {
    const key = `${r.collection}:${r.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}