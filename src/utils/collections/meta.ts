// src/utils/collections/meta.ts
import { metaSchema, type MetaData } from "@/content/schema";

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../../content/**/_meta.mdx",
  { eager: true }
);

export function getCollectionMeta(collectionName: string): MetaData {
  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  // Use a simple image function for parsing frontmatter
  // This allows string paths and image objects without full Astro image processing
  const simpleImageFn = () => ({
    parse: (val: any) => val,
    _parse: (val: any) => ({ success: true, data: val })
  });

  return metaSchema({ image: simpleImageFn }).parse(data);
}