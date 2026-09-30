import { getCollection, type CollectionEntry } from "astro:content";
import { getPublicProducts } from "@/lib/products";

export type ShowcaseEntry = CollectionEntry<"showcases">;

/** The showcase for a public product, if one is recorded. */
export async function getShowcase(slug: string): Promise<ShowcaseEntry | null> {
  const showcases = await getCollection("showcases");
  return (
    showcases.find((entry: ShowcaseEntry) => entry.data.product === slug) ??
    null
  );
}

/** Public products that carry an onboarding guide, with their showcase. */
export async function getGuideProducts() {
  const products = await getPublicProducts();
  const showcases = await getCollection("showcases");
  return products.flatMap((product) => {
    const showcase = showcases.find(
      (entry: ShowcaseEntry) => entry.data.product === product.data.slug,
    );
    return showcase?.data.guide ? [{ product, showcase }] : [];
  });
}
