// src/utils/fetchMeta.ts
import { metaSchema, type MetaData } from "@/content/schema"; // Import type from schema!
import { z } from "astro:content";

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);

// More permissive image schema for meta files
const metaImageSchema = () => z.union([
  z.string(),
  z.object({
    src: z.string(),
    alt: z.string().optional(),
  }),
  z.any(),
]);

export function getCollectionMeta(collectionName: string): MetaData {
  let data: Record<string, any> = {};

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  }

  return metaSchema({ image: metaImageSchema }).parse(data);
}