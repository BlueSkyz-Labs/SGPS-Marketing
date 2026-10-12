import type { APIRoute } from "astro";
import { getPublicProducts } from "@/lib/products";
import { renderProductOgImage } from "@/lib/product-og";

/** Only published products get a card: the paths come from the public registry. */
export async function getStaticPaths() {
  const products = await getPublicProducts();
  return products.map((product) => ({ params: { slug: product.data.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const body = await renderProductOgImage(String(params.slug));
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "image/jpeg" },
  });
};
