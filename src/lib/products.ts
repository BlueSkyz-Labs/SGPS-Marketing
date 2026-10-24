import { getCollection, type CollectionEntry } from "astro:content";

export type ProductEntry = CollectionEntry<"products">;

export async function getPublicProducts(): Promise<ProductEntry[]> {
  const products = await getCollection(
    "products",
    (entry: ProductEntry) => entry.data.public,
  );
  return products.sort(
    (a: ProductEntry, b: ProductEntry) =>
      a.data.displayOrder - b.data.displayOrder,
  );
}

/**
 * OG-3: the proof media a surface may render. Identity art on tagline hold
 * (`proof.media.taglineHold`) is never displayed, on any surface.
 */
export function displayableMedia(
  media: ProductEntry["data"]["proof"]["media"],
): ProductEntry["data"]["proof"]["media"] {
  return media && !media.taglineHold ? media : undefined;
}

export async function getFlagshipProduct(): Promise<ProductEntry | null> {
  return (
    (await getPublicProducts()).find(
      (entry: ProductEntry) => entry.data.featuredTier === "hero",
    ) ?? null
  );
}
