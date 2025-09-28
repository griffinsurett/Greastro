// src/utils/indexMdxUtils.ts

/**
 * Checks if an MDX file has actual content beyond frontmatter
 * and returns the component if it does
 */
export async function getMDXContentIfExists(
  collectionName: string,
  fileName: string = '_meta'
): Promise<{ Component: any; hasContent: boolean } | null> {
  try {
    // Import the MDX module
    const mdxModule = await import(`../content/${collectionName}/${fileName}.mdx`);
    
    // Get all raw MDX files to check content
    const rawMDXFiles = import.meta.glob('/src/content/**/*.mdx', { 
      query: '?raw',
      eager: true 
    });
    
    // Find the specific file
    const rawPath = Object.keys(rawMDXFiles).find(path => 
      path.includes(`/${collectionName}/${fileName}.mdx`)
    );
    
    if (!rawPath) {
      return null;
    }
    
    const rawContent = rawMDXFiles[rawPath] as string;
    
    // Check if there's content after the frontmatter
    const frontmatterEnd = rawContent.indexOf('---', 4); // Start after first ---
    if (frontmatterEnd === -1) {
      return null;
    }
    
    const contentAfterFrontmatter = rawContent.substring(frontmatterEnd + 3).trim();
    const hasContent = contentAfterFrontmatter.length > 0;
    
    return {
      Component: mdxModule.default,
      hasContent
    };
  } catch (error) {
    // No MDX file exists or error loading it
    return null;
  }
}

/**
 * Specific helper for collection meta MDX files
 */
export async function getCollectionMetaMDX(collectionName: string) {
  return getMDXContentIfExists(collectionName, '_meta');
}