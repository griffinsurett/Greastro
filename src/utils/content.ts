// src/utils/content.ts

/**
 * Get raw MDX content for a specific file
 */
function getRawMDXContent(collectionName: string, fileName: string): string | null {
  const rawMDXFiles = import.meta.glob('/src/content/**/*.mdx', { 
    query: '?raw',
    eager: true 
  });
  
  const rawPath = Object.keys(rawMDXFiles).find(path => 
    path.includes(`/${collectionName}/${fileName}.mdx`)
  );
  
  return rawPath ? (rawMDXFiles[rawPath] as string) : null;
}

/**
 * Check if MDX has content after frontmatter
 */
function hasContentAfterFrontmatter(rawContent: string): boolean {
  const frontmatterEnd = rawContent.indexOf('---', 4); // Start after first ---
  if (frontmatterEnd === -1) return false;
  
  const contentAfterFrontmatter = rawContent.substring(frontmatterEnd + 3).trim();
  return contentAfterFrontmatter.length > 0;
}

/**
 * Extract frontmatter from raw MDX content
 */
export function extractFrontmatter(rawContent: string): string | null {
  const frontmatterStart = rawContent.indexOf('---');
  if (frontmatterStart !== 0) return null;
  
  const frontmatterEnd = rawContent.indexOf('---', 3);
  if (frontmatterEnd === -1) return null;
  
  return rawContent.substring(3, frontmatterEnd).trim();
}

/**
 * Checks if an MDX file has actual content beyond frontmatter
 * and returns the component if it does
 */
export async function getMDXContentIfExists(
  collectionName: string,
  fileName: string = '_meta'
): Promise<{ Component: any; hasContent: boolean } | null> {
  try {
    const mdxModule = await import(`../content/${collectionName}/${fileName}.mdx`);
    const rawContent = getRawMDXContent(collectionName, fileName);
    
    if (!rawContent) {
      return null;
    }
    
    return {
      Component: mdxModule.default,
      hasContent: hasContentAfterFrontmatter(rawContent)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Specific helper for collection meta MDX files
 */
export async function getCollectionMetaMDX(collectionName: string) {
  return getMDXContentIfExists(collectionName, '_meta');
}