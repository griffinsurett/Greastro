// src/utils/pageGeneration/itemPageHelpers.ts
/**
 * Item Page Generation Helpers
 * 
 * Shared utilities for generating individual item pages.
 * Used by both root-level and collection-level page routes.
 */

import type { CollectionKey, CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { getCollectionMeta, getItemKey } from "@/utils/collections";
import { shouldItemHavePage, shouldItemUseRootPath, shouldProcessCollection } from "@/utils/pages";
import { getPageCollections } from "@/utils/pageGeneration";
import { buildItemSEOProps } from "@/utils/seo";
import { getLayoutName, getLayoutComponent } from "@/layouts/collections/helpers/layoutUtils";
import type { MetaData } from "@/content/schema";

/**
 * Filter function type for determining which items to include
 */
export type ItemFilter = (
  entry: CollectionEntry<CollectionKey>,
  meta: MetaData
) => boolean;

/**
 * Path parameters for root-level items
 */
export interface RootLevelPathParams {
  slug: string;
}

/**
 * Path parameters for collection-level items
 */
export interface CollectionLevelPathParams {
  collection: string;
  slug: string;
}

/**
 * Props passed to item page components
 */
export interface ItemPageProps {
  entry: CollectionEntry<CollectionKey>;
  collectionMeta: MetaData;
  collectionName: CollectionKey;
}

/**
 * Generic static path entry
 */
export interface StaticPath<TParams> {
  params: TParams;
  props: ItemPageProps;
}

/**
 * Prepared page data ready for rendering
 */
export interface PreparedPageData {
  entry: CollectionEntry<CollectionKey>;
  collectionMeta: MetaData;
  collectionName: CollectionKey;
  LayoutComponent: any;
  Content: any;
  seoProps: any;
}

/**
 * Generate static paths for items matching a filter
 * 
 * Generic function that handles path generation for both
 * root-level and collection-level routes.
 * 
 * @param filter - Function to determine which items to include
 * @param buildParams - Function to build path params from entry
 * @returns Array of static path entries
 */
export async function generateItemPaths<TParams>(
  filter: ItemFilter,
  buildParams: (collection: string, slug: string) => TParams
): Promise<StaticPath<TParams>[]> {
  const collections = getPageCollections();
  const paths: StaticPath<TParams>[] = [];

  for (const coll of collections) {
    const shouldProcess = await shouldProcessCollection(coll);
    if (!shouldProcess) continue;

    const meta = getCollectionMeta(coll);
    const entries = await getCollection(coll);

    entries
      .filter((entry) => filter(entry, meta))
      .forEach((entry) => {
        const slug = getItemKey(entry);
        paths.push({
          params: buildParams(coll, slug),
          props: {
            entry,
            collectionMeta: meta,
            collectionName: coll,
          },
        });
      });
  }

  return paths;
}

/**
 * Prepare all data needed to render an item page
 * 
 * This function handles ALL the logic for preparing a page:
 * - Getting the layout component
 * - Rendering MDX content
 * - Building SEO props
 * 
 * @param props - Props from getStaticPaths
 * @returns All data needed to render the page
 */
export async function prepareItemPageData(
  props: ItemPageProps
): Promise<PreparedPageData> {
  const { entry, collectionMeta, collectionName } = props;

  // Get the layout name from meta or use default
  const layoutName = getLayoutName(collectionMeta, entry, true);

  // Get the actual layout component
  const LayoutComponent = await getLayoutComponent(layoutName);

  // Prepare content if MDX - safe type assertion since we know it might have render
  let Content = null;
  const entryWithRender = entry as any;
  if (entryWithRender && typeof entryWithRender.render === "function") {
    const rendered = await entryWithRender.render();
    Content = rendered.Content;
  }

  // Build SEO props
  const seoProps = await buildItemSEOProps(entry, collectionMeta);

  return {
    entry,
    collectionMeta,
    collectionName,
    LayoutComponent,
    Content,
    seoProps,
  };
}

/**
 * Filter for root-level items
 * Items that should have a page AND use root path
 */
export const rootLevelFilter: ItemFilter = (entry, meta) => {
  return shouldItemHavePage(entry, meta) && shouldItemUseRootPath(entry, meta);
};

/**
 * Filter for collection-level items
 * Items that should have a page but NOT use root path
 */
export const collectionLevelFilter: ItemFilter = (entry, meta) => {
  return shouldItemHavePage(entry, meta) && !shouldItemUseRootPath(entry, meta);
};

/**
 * Build params for root-level paths
 */
export function buildRootLevelParams(
  _collection: string,
  slug: string
): RootLevelPathParams {
  return { slug };
}

/**
 * Build params for collection-level paths
 */
export function buildCollectionLevelParams(
  collection: string,
  slug: string
): CollectionLevelPathParams {
  return { collection, slug };
}