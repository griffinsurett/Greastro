// src/utils/query/graph.ts
/**
 * Relationship Graph Builder
 * 
 * Builds a complete relationship graph for all content collections.
 * Handles direct references, hierarchical relations, and indirect connections.
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { getCollectionNames } from '@/utils/collections';
import { 
  type RelationshipGraph, 
  type RelationMap, 
  type Relation,
  type GraphBuildOptions,
  getEntryKey,
  parseEntryKey,
} from './types';
import { extractRelationConfig, normalizeReference, isParentField } from './schema';
import { getQueryKey, normalizeId } from './helpers';

/**
 * Build the complete relationship graph
 */
export async function buildRelationshipGraph(
  options: GraphBuildOptions = {}
): Promise<RelationshipGraph> {
  const {
    collections = getCollectionNames().filter(c => c !== 'menus' && c !== 'menu-items'),
    includeIndirect = true,
    maxIndirectDepth = 3,
    cache = true,
  } = options;
  
  // Initialize graph
  const graph: RelationshipGraph = {
    nodes: new Map(),
    indexes: {
      byCollection: new Map(),
      byParent: new Map(),
      byReference: new Map(),
    },
    collections: collections as CollectionKey[],
    totalEntries: 0,
  };
  
  // Phase 1: Load all entries and create base nodes
  console.log('📊 Building relationship graph...');
  await loadAllEntries(graph, collections as CollectionKey[]);
  
  // Phase 2: Build direct references
  console.log('🔗 Mapping direct references...');
  await buildDirectReferences(graph);
  
  // Phase 3: Build hierarchical relationships
  console.log('🌲 Building hierarchy...');
  await buildHierarchy(graph);
  
  // Phase 4: Build indirect relationships
  if (includeIndirect) {
    console.log('🔄 Finding indirect relations...');
    await buildIndirectRelations(graph, maxIndirectDepth);
  }
  
  console.log(`✅ Graph built: ${graph.totalEntries} entries, ${graph.collections.length} collections`);
  
  return graph;
}

/**
 * Phase 1: Load all entries and create base relation maps
 */
async function loadAllEntries(
  graph: RelationshipGraph,
  collections: CollectionKey[]
): Promise<void> {
  for (const collection of collections) {
    const entries = await getCollection(collection);
    const collectionMap = new Map<string, RelationMap>();
    const idSet = new Set<string>();
    
    for (const entry of entries) {
      // Use getQueryKey for consistent ID handling
      const id = getQueryKey(entry);
      const key = getEntryKey(collection, id);
      
      // Create base relation map
      const relationMap: RelationMap = {
        entry,
        references: [],
        referencedBy: [],
        parent: undefined,
        children: [],
        siblings: [],
        ancestors: [],
        descendants: [],
        indirect: [],
        depth: 0,
        hasChildren: false,
        isRoot: true,
        isLeaf: true,
      };
      
      collectionMap.set(id, relationMap);
      idSet.add(id);
      graph.totalEntries++;
    }
    
    graph.nodes.set(collection, collectionMap);
    graph.indexes.byCollection.set(collection, idSet);
  }
}

/**
 * Phase 2: Build direct reference relationships
 */
async function buildDirectReferences(graph: RelationshipGraph): Promise<void> {
  for (const [collection, collectionMap] of graph.nodes) {
    for (const [id, relationMap] of collectionMap) {
      const entry = relationMap.entry;
      const data = entry.data as any;
      
      // Extract all relation fields
      const relationConfigs = extractRelationConfig(data);
      
      for (const config of relationConfigs) {
        // Skip parent fields (handled in hierarchy phase)
        if (isParentField(config.field)) continue;
        
        const refs = normalizeReference(data[config.field]);
        
        for (const ref of refs) {
          // Normalize the reference ID
          const refId = normalizeId(ref.id);
          
          // Add forward reference
          relationMap.references.push({
            type: 'reference',
            collection: ref.collection,
            id: refId,
            field: config.field,
          });
          
          // Add reverse reference
          const targetMap = graph.nodes.get(ref.collection)?.get(refId);
          if (targetMap) {
            targetMap.referencedBy.push({
              type: 'referenced-by',
              collection: collection as CollectionKey,
              id,
              field: config.field,
            });
          }
          
          // Index reference
          const refKey = getEntryKey(ref.collection, refId);
          const entryKey = getEntryKey(collection as CollectionKey, id);
          
          if (!graph.indexes.byReference.has(refKey)) {
            graph.indexes.byReference.set(refKey, new Set());
          }
          graph.indexes.byReference.get(refKey)!.add(entryKey);
        }
      }
    }
  }
}

/**
 * Phase 3: Build hierarchical relationships (parent-child)
 */
async function buildHierarchy(graph: RelationshipGraph): Promise<void> {
  // First pass: establish parent-child links
  for (const [collection, collectionMap] of graph.nodes) {
    for (const [id, relationMap] of collectionMap) {
      const data = relationMap.entry.data as any;
      const parentRef = normalizeReference(data.parent)[0];
      
      if (parentRef && parentRef.collection === collection) {
        const parentId = normalizeId(parentRef.id);
        const parentMap = collectionMap.get(parentId);
        
        if (parentMap) {
          // Set parent
          relationMap.parent = {
            type: 'parent',
            collection: collection as CollectionKey,
            id: parentId,
          };
          
          // Add child to parent
          parentMap.children.push({
            type: 'child',
            collection: collection as CollectionKey,
            id,
          });
          
          relationMap.isRoot = false;
          parentMap.hasChildren = true;
          parentMap.isLeaf = false;
          
          // Index parent relationship
          const parentKey = getEntryKey(collection as CollectionKey, parentId);
          if (!graph.indexes.byParent.has(parentKey)) {
            graph.indexes.byParent.set(parentKey, new Set());
          }
          graph.indexes.byParent.get(parentKey)!.add(id);
        }
      }
    }
  }
  
  // Second pass: calculate depth and find ancestors/descendants
  for (const [collection, collectionMap] of graph.nodes) {
    for (const [id, relationMap] of collectionMap) {
      // Calculate depth and ancestors
      calculateAncestors(relationMap, collectionMap);
      
      // Calculate descendants
      calculateDescendants(relationMap, collectionMap);
      
      // Find siblings
      if (relationMap.parent) {
        const parentMap = collectionMap.get(relationMap.parent.id);
        if (parentMap) {
          relationMap.siblings = parentMap.children.filter(
            child => child.id !== id
          );
        }
      }
    }
  }
}

/**
 * Calculate ancestors and depth
 */
function calculateAncestors(
  relationMap: RelationMap,
  collectionMap: Map<string, RelationMap>
): void {
  const ancestors: Relation[] = [];
  let depth = 0;
  let current = relationMap.parent;
  
  while (current) {
    depth++;
    ancestors.push({
      ...current,
      type: 'ancestor',
      depth,
    });
    
    const parentMap = collectionMap.get(current.id);
    current = parentMap?.parent;
  }
  
  relationMap.ancestors = ancestors;
  relationMap.depth = depth;
}

/**
 * Calculate descendants recursively
 */
function calculateDescendants(
  relationMap: RelationMap,
  collectionMap: Map<string, RelationMap>
): void {
  const descendants: Relation[] = [];
  
  function traverse(childIds: Relation[], depth: number): void {
    for (const child of childIds) {
      descendants.push({
        ...child,
        type: 'descendant',
        depth,
      });
      
      const childMap = collectionMap.get(child.id);
      if (childMap && childMap.children.length > 0) {
        traverse(childMap.children, depth + 1);
      }
    }
  }
  
  traverse(relationMap.children, 1);
  relationMap.descendants = descendants;
}

/**
 * Phase 4: Build indirect relationships (multi-hop)
 */
async function buildIndirectRelations(
  graph: RelationshipGraph,
  maxDepth: number
): Promise<void> {
  for (const [collection, collectionMap] of graph.nodes) {
    for (const [id, relationMap] of collectionMap) {
      const entryKey = getEntryKey(collection as CollectionKey, id);
      const visited = new Set<string>([entryKey]);
      const indirect: Relation[] = [];
      
      // BFS to find indirect relations
      const queue: Array<{ key: string; path: string[]; depth: number }> = [];
      
      // Start with direct references
      for (const ref of relationMap.references) {
        const refKey = getEntryKey(ref.collection, ref.id);
        queue.push({
          key: refKey,
          path: [collection as string, ref.collection],
          depth: 1,
        });
      }
      
      while (queue.length > 0) {
        const { key, path, depth } = queue.shift()!;
        
        if (depth >= maxDepth) continue;
        if (visited.has(key)) continue;
        
        visited.add(key);
        const { collection: currentColl, id: currentId } = parseEntryKey(key);
        const currentMap = graph.nodes.get(currentColl)?.get(currentId);
        
        if (!currentMap) continue;
        
        // Add as indirect relation
        if (depth > 1) {
          indirect.push({
            type: 'indirect',
            collection: currentColl,
            id: currentId,
            depth,
            path,
          });
        }
        
        // Queue next level
        for (const ref of currentMap.references) {
          const refKey = getEntryKey(ref.collection, ref.id);
          if (!visited.has(refKey)) {
            queue.push({
              key: refKey,
              path: [...path, ref.collection],
              depth: depth + 1,
            });
          }
        }
      }
      
      relationMap.indirect = indirect;
    }
  }
}

/**
 * Get relation map for a specific entry
 */
export function getRelationMap(
  graph: RelationshipGraph,
  collection: CollectionKey,
  id: string
): RelationMap | undefined {
  const cleanId = normalizeId(id);
  return graph.nodes.get(collection)?.get(cleanId);
}

/**
 * Get all entries in a collection
 */
export function getCollectionEntries(
  graph: RelationshipGraph,
  collection: CollectionKey
): CollectionEntry<CollectionKey>[] {
  const collectionMap = graph.nodes.get(collection);
  if (!collectionMap) return [];
  
  return Array.from(collectionMap.values()).map(rm => rm.entry);
}

/**
 * Check if graph has been built
 */
let _cachedGraph: RelationshipGraph | null = null;

export async function getOrBuildGraph(
  options?: GraphBuildOptions
): Promise<RelationshipGraph> {
  if (_cachedGraph && options?.cache !== false) {
    return _cachedGraph;
  }
  
  _cachedGraph = await buildRelationshipGraph(options);
  return _cachedGraph;
}

/**
 * Clear cached graph
 */
export function clearGraphCache(): void {
  _cachedGraph = null;
}