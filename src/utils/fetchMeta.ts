// src/utils/fetchMeta.ts
import { metaSchema } from "@/content/schema";
import { z } from "astro:content";

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);

// More permissive image schema for meta files
// Since these aren't processed through content collections,
// we can't use Astro's image() validation
const metaImageSchema = () => z.union([
  z.string(), // Allow string paths
  z.object({
    src: z.string(),
    alt: z.string().optional(),
  }),
  z.any(), // Fallback for other formats
]);

export function getCollectionMeta(collectionName: string) {
  let data: Record<string, any> = {};

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  }

  // Use the permissive image schema for meta files
  return metaSchema({ image: metaImageSchema }).parse(data);
}