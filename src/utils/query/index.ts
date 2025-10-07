// src/utils/query/index.ts
/**
 * Query System - Public API
 * 
 * Central export point for all query functionality.
 */

// Core types
export type {
  RelationType,
  Relation,
  RelationMap,
  FilterFn,
  SortFn,
  SortConfig,
  QueryOptions,
  QueryResult,
  RelationshipGraph,
  EntryReference,
} from './types';

export {
  getEntryKey,
  parseEntryKey,
  isCollectionReference,
} from './types';

// Helpers
export {
  getQueryKey,
  normalizeId,
  entryExists,
  safeGetEntry,
} from './helpers';

// Schema helpers
export {
  relationSchema,
  parentSchema,
  createRelationalSchema,
  extractRelationConfig,
  normalizeReference,
  isParentField,
} from './schema';

// Graph operations
export {
  buildRelationshipGraph,
  getRelationMap,
  getCollectionEntries,
  getOrBuildGraph,
  clearGraphCache,
} from './graph';

// Relations
export {
  getRelations,
  getReferencedEntries,
  getReferencingEntries,
  getAllRelatedEntries,
  resolveRelations,
} from './relations';

// Hierarchy
export {
  getParent,
  getChildren,
  getAncestors,
  getDescendants,
  getSiblings,
  getRoots,
  getLeaves,
  getTree,
  getBreadcrumbs,
  isAncestorOf,
  isDescendantOf,
  getLevel,
  type TreeNode,
} from './hierarchy';

// Filters
export {
  whereEquals,
  whereExists,
  whereIn,
  whereContains,
  whereStartsWith,
  whereGreaterThan,
  whereLessThan,
  whereBetween,
  whereAfter,
  whereBefore,
  whereArrayContains,
  whereArrayContainsAny,
  and,
  or,
  not,
  applyFilters,
} from './filters';

// Sorting
export {
  sortBy,
  sortByDate,
  sortByTitle,
  sortByOrder,
  sortByMultiple,
  createSortFn,
  applySorting,
} from './sorting';

// Query builder
export {
  Query,
  query,
  find,
  findWhere,
  findAll,
} from './query';