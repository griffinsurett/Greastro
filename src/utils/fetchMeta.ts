// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/schema";

const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);

export function getCollectionMeta(collectionName: string) {
  let data: Record<string, any> = {};

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  }

  return metaSchema.parse(data);
}