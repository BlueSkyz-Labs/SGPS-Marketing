import type { APIRoute } from "astro";
import { getPublicProducts } from "@/lib/products";
import { serializePublicSgpsManifest } from "@/lib/sgps-manifest";

export const prerender = true;

/**
 * v3 G7 — /.well-known/sgps.json (Task 17).
 * Deterministic, privacy-safe public manifest of the claim fabric.
 */
export const GET: APIRoute = async () => {
  const products = (await getPublicProducts()).map((product) => ({
    slug: product.data.slug,
    name: product.data.name,
  }));
  return new Response(serializePublicSgpsManifest(products), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
