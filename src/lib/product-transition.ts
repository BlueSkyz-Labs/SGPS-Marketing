/**
 * C2 P3 (Task 9) — cross-document product continuity naming.
 *
 * Single source of truth for the `view-transition-name` convention shared by
 * the homepage product surfaces and the canonical localized product profile
 * destination. Static-first by construction:
 *
 *   - the name is emitted as an inline style property on the element, so a
 *     browser without cross-document View Transition support simply ignores
 *     it (no client router, no click interception, no hydration);
 *   - the name is derived only from the already-constrained record slug, so no
 *     component can invent a second identity for a product.
 *
 * Convention (one source element and one destination element per document):
 *   flagship product media  -> product-media-<slug>
 *   product card            -> product-card-<slug>
 */
export type ProductTransitionKind = "media" | "card";

/** Mirrors `productSchema` slug: lowercase, hyphen-separated, no edge hyphens. */
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Stable continuity name for one product surface.
 * Throws on an unsafe slug rather than emitting a name that could collide or
 * inject into the style attribute.
 */
export function productTransitionName(
  kind: ProductTransitionKind,
  slug: string,
): string {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(
      `unsafe product slug for a view-transition-name: ${JSON.stringify(slug)}`,
    );
  }
  return `product-${kind}-${slug}`;
}

/** The inline style value to spread onto a product element. */
export function productTransitionStyle(
  kind: ProductTransitionKind,
  slug: string,
): string {
  return `view-transition-name: ${productTransitionName(kind, slug)}`;
}
