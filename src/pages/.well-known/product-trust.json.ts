import type { APIRoute } from "astro";
import { SITE } from "@/data/site";
import {
  buildAgentPassport,
  serializeAgentPassport,
} from "@/lib/agent-passport";
import { getPublicClaims, type PublicProductRef } from "@/lib/claims";
import { getPublicProducts } from "@/lib/products";
import {
  CANONICAL_PUBLIC_SITE_ORIGIN,
  isNonProductionSiteUrl,
} from "@/lib/truth";

export const prerender = true;

/**
 * C3-B Task 5 (G9) — agent-readable product & trust passport.
 *
 * A derived view of what the public registry and the Claim Fabric already
 * publish, so an agent can read the same truth a visitor can open. It never
 * reads private content and carries no assurance vocabulary.
 *
 * The site origin is the canonical one (ADR 0006): a preview or local build
 * must not publish its own host as if it were the organisation's origin.
 */
export const GET: APIRoute = async () => {
  const registry = await getPublicProducts();
  const products: PublicProductRef[] = registry.map((product) => ({
    slug: product.data.slug,
    name: product.data.name,
  }));

  const document = buildAgentPassport({
    siteUrl: isNonProductionSiteUrl(SITE.url)
      ? CANONICAL_PUBLIC_SITE_ORIGIN
      : SITE.url,
    derivedFrom: "public-registry",
    products: registry.map((product) => ({
      slug: product.data.slug,
      name: product.data.name,
      shortDescription: product.data.shortDescription,
      publicLabel: product.data.publicLabel,
      ...(product.data.lastReviewedAt
        ? {
            lastReviewedAt: new Date(product.data.lastReviewedAt)
              .toISOString()
              .slice(0, 10),
          }
        : {}),
      url: {
        en: `/en/products/${product.data.slug}/`,
        vi: `/vi/products/${product.data.slug}/`,
      },
    })),
    claims: getPublicClaims(products),
  });

  return new Response(serializeAgentPassport(document), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
};
