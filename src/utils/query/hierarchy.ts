// src/utils/query/hierarchy.ts
/**
 * Hierarchical Query Utilities
 * 
 * Functions for querying parent-child relationships and tree structures.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { Relation, RelationMap } from './types';
import { getRelations } from './relations';
import { getOrBuildGraph, getRelationMap } from './graph';
import { normalizeId } from './helpers';

/**
 * Get parent entry
 */
export async function getParent<T extends CollectionKey>(
  collection: T,
  id: string,
  resolve: boolean = false
): Promise<Relation | undefined> {
  const cleanId = normalizeId(id);
  const relationMap = await getRelations(collection, cleanId, ['parent']);
  const parent = relationMap.parent;
  
  if (parent && resolve && !parent.entry) {
    const { getEntry } = await import('astro:content');
    try {
      parent.entry = await getEntry(parent.collection, normalizeId(parent.id));
    } catch (error) {
      console.warn(`Failed to resolve parent ${parent.collection}/${parent.id}`);
    }
  }
  
  return parent;
}

/**
 * Get all children entries
 */
export async function getChildren<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    resolve?: boolean;
    recursive?: boolean;
    maxDepth?: number;
  } = {}
): Promise<Relation[]> {
  const { resolve = false, recursive = false, maxDepth = Infinity } = options;
  const cleanId = normalizeId(id);
  
  if (recursive) {
    return getDescendants(collection, cleanId, { resolve, maxDepth });
  }
  
  const relationMap = await getRelations(collection, cleanId, ['child']);
  const children = relationMap.children;
  
  if (resolve) {
    const { resolveRelations } = await import('./relations');
    await resolveRelations(children);
  }
  
  return children;
}

/**
 * Get all ancestors (parents up the tree)
 */
export async function getAncestors<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    resolve?: boolean;
    includeRoot?: boolean;
  } = {}
): Promise<Relation[]> {
  const { resolve = false, includeRoot = true } = options;
  const cleanId = normalizeId(id);
  const relationMap = await getRelations(collection, cleanId, ['ancestor']);
  
  let ancestors = relationMap.ancestors;
  
  if (!includeRoot) {
    // Exclude the root node (highest ancestor)
    const maxDepth = Math.max(...ancestors.map(a => a.depth || 0));
    ancestors = ancestors.filter(a => (a.depth || 0) < maxDepth);
  }
  
  if (resolve) {
    const { resolveRelations } = await import('./relations');
    await resolveRelations(ancestors);
  }
  
  return ancestors;
}

/**
 * Get all descendants (children down the tree)
 */
export async function getDescendants<T extends CollectionKey>(
  collection: T,
  id: string,
  options: {
    resolve?: boolean;
    maxDepth?: number;
  } = {}
): Promise<Relation[]> {
  const { resolve = false, maxDepth = Infinity } = options;
  const cleanId = normalizeId(id);
  const relationMap = await getRelations(collection, cleanId, ['descendant']);
  
  let descendants = relationMap.descendants;
  
  // Filter by max depth
  if (maxDepth < Infinity) {
    descendants = descendants.filter(d => (d.depth || 0) <= maxDepth);
  }
  
  if (resolve) {
    const { resolveRelations } = await import('./relations');
    await resolveRelations(descendants);
  }
  
  return descendants;
}

/**
 * Get siblings (entries with same parent)
 */
export async function getSiblings<T extends CollectionKey>(
  collection: T,
  id: string,
  resolve: boolean = false
): Promise<Relation[]> {
  const cleanId = normalizeId(id);
  const relationMap = await getRelations(collection, cleanId, ['sibling']);
  const siblings = relationMap.siblings;
  
  if (resolve) {
    const { resolveRelations } = await import('./relations');
    await resolveRelations(siblings);
  }
  
  return siblings;
}

/**
 * Get root entries (entries with no parent)
 */
export async function getRoots<T extends CollectionKey>(
  collection: T,
  resolve: boolean = false
): Promise<CollectionEntry<T>[]> {
  const graph = await getOrBuildGraph();
  const collectionMap = graph.nodes.get(collection);
  
  if (!collectionMap) return [];
  
  const roots: CollectionEntry<T>[] = [];
  
  for (const relationMap of collectionMap.values()) {
    if (relationMap.isRoot) {
      roots.push(relationMap.entry as CollectionEntry<T>);
    }
  }
  
  return roots;
}

/**
 * Get leaf entries (entries with no children)
 */
export async function getLeaves<T extends CollectionKey>(
  collection: T
): Promise<CollectionEntry<T>[]> {
  const graph = await getOrBuildGraph();
  const collectionMap = graph.nodes.get(collection);
  
  if (!collectionMap) return [];
  
  const leaves: CollectionEntry<T>[] = [];
  
  for (const relationMap of collectionMap.values()) {
    if (relationMap.isLeaf) {
      leaves.push(relationMap.entry as CollectionEntry<T>);
    }
  }
  
  return leaves;
}

/**
 * Get full tree structure starting from a node
 */
export async function getTree<T extends CollectionKey>(
  collection: T,
  id: string,
  maxDepth: number = Infinity
): Promise<TreeNode<T>> {
  const cleanId = normalizeId(id);
  const graph = await getOrBuildGraph();
  const relationMap = getRelationMap(graph, collection, cleanId);
  
  if (!relationMap) {
    throw new Error(`Entry not found: ${collection}/${cleanId}`);
  }
  
  return buildTreeNode(relationMap, graph, 0, maxDepth);
}

/**
 * Tree node structure
 */
export interface TreeNode<T extends CollectionKey = CollectionKey> {
  entry: CollectionEntry<T>;
  children: TreeNode<T>[];
  depth: number;
  hasChildren: boolean;
  isLeaf: boolean;
}

/**
 * Build tree node recursively
 */
function buildTreeNode<T extends CollectionKey>(
  relationMap: RelationMap,
  graph: any,
  currentDepth: number,
  maxDepth: number
): TreeNode<T> {
  const node: TreeNode<T> = {
    entry: relationMap.entry as CollectionEntry<T>,
    children: [],
    depth: currentDepth,
    hasChildren: relationMap.hasChildren,
    isLeaf: relationMap.isLeaf,
  };
  
  // Stop if max depth reached
  if (currentDepth >= maxDepth) {
    return node;
  }
  
  // Build children recursively
  const collectionMap = graph.nodes.get(relationMap.entry.collection);
  
  for (const child of relationMap.children) {
    const childId = normalizeId(child.id);
    const childMap = collectionMap?.get(childId);
    if (childMap) {
      node.children.push(buildTreeNode(childMap, graph, currentDepth + 1, maxDepth));
    }
  }
  
  return node;
}

/**
 * Get breadcrumb path from root to entry
 */
export async function getBreadcrumbs<T extends CollectionKey>(
  collection: T,
  id: string,
  resolve: boolean = true
): Promise<Relation[]> {
  const cleanId = normalizeId(id);
  const ancestors = await getAncestors(collection, cleanId, { resolve });
  
  // Sort by depth (deepest first) and reverse to get root to current
  const breadcrumbs = ancestors
    .sort((a, b) => (b.depth || 0) - (a.depth || 0))
    .reverse();
  
  // Add current entry as last item
  const { getEntry } = await import('astro:content');
  const currentEntry = await getEntry(collection, cleanId);
  
  breadcrumbs.push({
    type: 'child',
    collection,
    id: cleanId,
    entry: currentEntry,
  });
  
  return breadcrumbs;
}

/**
 * Check if entry is ancestor of another
 */
export async function isAncestorOf(
  collection: CollectionKey,
  ancestorId: string,
  descendantId: string
): Promise<boolean> {
  const cleanAncestorId = normalizeId(ancestorId);
  const cleanDescendantId = normalizeId(descendantId);
  const ancestors = await getAncestors(collection, cleanDescendantId);
  return ancestors.some(a => normalizeId(a.id) === cleanAncestorId);
}

/**
 * Check if entry is descendant of another
 */
export async function isDescendantOf(
  collection: CollectionKey,
  descendantId: string,
  ancestorId: string
): Promise<boolean> {
  return isAncestorOf(collection, ancestorId, descendantId);
}

/**
 * Get level in hierarchy (0 = root)
 */
export async function getLevel(
  collection: CollectionKey,
  id: string
): Promise<number> {
  const cleanId = normalizeId(id);
  const relationMap = await getRelations(collection, cleanId);
  return relationMap.depth;
}