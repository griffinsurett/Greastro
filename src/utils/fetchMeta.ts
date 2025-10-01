// src/utils/fetchMeta.ts
import { metaSchema } from "@/content/schema";
import { z } from "astro:content";

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);

// Create a mock image function for meta parsing
// This allows us to parse the schema without actual image processing
const mockImage = () => z.any();

export function getCollectionMeta(collectionName: string) {
  let data: Record<string, any> = {};

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  }

  // Pass the mock image function to metaSchema
  return metaSchema({ image: mockImage }).parse(data);
}