// examples.ts
/**
 * Query System Usage Examples
 */

import { 
  query, 
  find,
  getRelations,
  getChildren,
  getAncestors,
  whereEquals,
  whereContains,
  sortByDate,
  sortBy,
  and,
  buildRelationshipGraph,
} from '@/utils/query';

/**
 * Example 1: Basic querying
 */
async function basicQuery() {
  // Get all blog posts
  const allPosts = await query('blog').all();
  
  // Get first 10 blog posts sorted by date
  const recentPosts = await query('blog')
    .orderBy(sortByDate('publishDate', 'desc'))
    .limit(10)
    .get();
  
  // Find a specific entry
  const post = await find('blog', 'my-post');
}

/**
 * Example 2: Filtering
 */
async function filteringExamples() {
  // Find posts by author
  const johnsPosts = await query('blog')
    .where(whereEquals('author', 'john-doe'))
    .all();
  
  // Find posts containing "astro" in title
  const astroPosts = await query('blog')
    .where(whereContains('title', 'astro', false))
    .all();
  
  // Complex filter with AND logic
  const filteredPosts = await query('blog')
    .where(and(
      whereEquals('status', 'published'),
      whereContains('title', 'tutorial')
    ))
    .all();
}

/**
 * Example 3: Hierarchical queries
 */
async function hierarchyExamples() {
  // Get all children of a service
  const children = await getChildren('services', 'web-development', {
    resolve: true,
    recursive: false,
  });
  
  // Get all descendants (recursive)
  const allDescendants = await getChildren('services', 'web-development', {
    resolve: true,
    recursive: true,
  });
  
  // Get ancestors (breadcrumb trail)
  const ancestors = await getAncestors('services', 'frontend-dev');
  
  // Get root entries (top-level services)
  const { getRoots } = await import('@/utils/query');
  const roots = await getRoots('services');
}

/**
 * Example 4: Relations
 */
async function relationExamples() {
  // Get all relations for a blog post
  const relations = await getRelations('blog', 'my-post');
  
  console.log('References:', relations.references);
  console.log('Referenced by:', relations.referencedBy);
  console.log('Indirect relations:', relations.indirect);
  
  // Get specific related entries
  const { getReferencedEntries } = await import('@/utils/query');
  const services = await getReferencedEntries('blog', 'my-post', {
    field: 'services',
    resolve: true,
  });
}

/**
 * Example 5: Advanced querying with relations
 */
async function advancedQuery() {
  // Query with relations included
  const result = await query('blog')
    .where(whereEquals('status', 'published'))
    .orderBy(sortByDate('publishDate', 'desc'))
    .limit(10)
    .withRelations(true, 2) // Include relations up to depth 2
    .get();
  
  // Access entries and their relations
  for (const entry of result.entries) {
    const relationMap = result.relations?.get(`blog:${entry.id}`);
    console.log(`Post: ${entry.data.title}`);
    console.log(`References: ${relationMap?.references.length}`);
    console.log(`Referenced by: ${relationMap?.referencedBy.length}`);
  }
}

/**
 * Example 6: Building and caching the graph
 */
async function graphExample() {
  // Build graph once at startup
  const graph = await buildRelationshipGraph({
    includeIndirect: true,
    maxIndirectDepth: 3,
    cache: true,
  });
  
  console.log(`Total entries: ${graph.totalEntries}`);
  console.log(`Collections: ${graph.collections.join(', ')}`);
}

/**
 * Example 7: Multi-collection query
 */
async function multiCollectionQuery() {
  // Query across multiple collections
  const allContent = await query(['blog', 'services', 'portfolio'])
    .orderBy(sortBy('publishDate', 'desc'))
    .limit(20)
    .get();
  
  console.log(`Found ${allContent.total} items across collections`);
}

/**
 * Example 8: Pagination
 */
async function paginationExample() {
  const pageSize = 10;
  const page = 2;
  
  const result = await query('blog')
    .orderBy(sortByDate())
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .get();
  
  console.log(`Page ${result.page} of ${Math.ceil(result.total / pageSize)}`);
  console.log(`Has next: ${result.hasNext}`);
  console.log(`Has previous: ${result.hasPrev}`);
}