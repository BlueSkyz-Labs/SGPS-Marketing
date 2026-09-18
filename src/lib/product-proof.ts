/**
 * C3-B Task 1 (G4) — product-to-proof selector contract.
 *
 * Answers one question for a product surface: *which public proof items may be
 * shown for this capability, and what is their truth state?*
 *
 * Derived only, and fail-closed:
 *
 *   - it never authors a claim, an evidence reference or a screenshot — every
 *     item comes from the product record or the canonical Claim Fabric;
 *   - a destination that is not a public one (local product asset or production
 *     https) is dropped rather than rendered;
 *   - a capability the product does not declare yields nothing, so a surface can
 *     never grow proof chrome for something the product has not published;
 *   - missing artifacts are reported through `getProductProofSummary` as
 *     explicit `not-published` truth, never silently promoted to proof.
 *
 * Node-safe: relative ".ts" imports keep this module importable by the
 * repository test runner (same pattern as src/lib/claims.ts).
 */

import type { LocalizedText, TruthState } from "../data/integrity.ts";
import type { Language } from "../data/site.ts";
import type { PublicProductRef, ResolvedClaim } from "./claims.ts";
import { isNonProductionSiteUrl } from "./truth.ts";

/** Artifact kinds a public product may publish, in display order. */
export const PROOF_KINDS = [
  "screenshot",
  "public-url",
  "repository",
  "documentation",
  "privacy",
  "security",
  "support",
  "evidence",
] as const;

export type ProductProofKind = (typeof PROOF_KINDS)[number];

/** The proof block of a public product record (all artifacts optional). */
export interface ProductProofArtifacts {
  screenshot?: { src: string; alt: string } | undefined;
  publicUrl?: string | undefined;
  repositoryUrl?: string | undefined;
  documentationUrl?: string | undefined;
  privacyUrl?: string | undefined;
  securityUrl?: string | undefined;
  supportUrl?: string | undefined;
}

/** The minimal public shape this selector needs from a product record. */
export interface PublicProductProofInput {
  slug: string;
  public: boolean;
  capabilities?: readonly string[] | undefined;
  proof: ProductProofArtifacts;
}

export interface ProductProofLink {
  /** Stable identity: `<kind>:<slug>` (evidence uses its own reference id). */
  id: string;
  kind: ProductProofKind;
  /** Public destination only. */
  href: string;
  label: LocalizedText;
  truthState: TruthState;
  boundaryId?: string | undefined;
  reviewId?: string | undefined;
}

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Mirrors the product schema's local-asset rule for screenshots. */
const LOCAL_PRODUCT_ASSET =
  /^\/products\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|webp)$/i;

/**
 * Deterministic key for one authored capability string.
 *
 * Capabilities are authored prose (2-3 per product) without their own ids, so a
 * caller passes either the prose itself or a key derived from it. Throws on an
 * empty value instead of inventing an identity for a surface.
 */
export function productProofCapabilityKey(capability: string): string {
  const key = capability
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!key) {
    throw new Error(
      `empty capability cannot identify a product surface: ${JSON.stringify(capability)}`,
    );
  }
  return key;
}

function isPublicHttps(href: string): boolean {
  if (!href.startsWith("https://")) return false;
  if (isNonProductionSiteUrl(href)) return false;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * A site-local path is publishable when it is an ordinary public route. An
 * internal prefix, a protocol-relative URL or a traversal segment is not proof
 * of anything a visitor may open.
 */
function isLocalPublicPath(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  if (href.includes("..")) return false;
  return !/^\/(?:internal|admin|api|_)/i.test(href);
}

/** A destination may be shown only when it is a public one. */
function isPublicProofDestination(href: string): boolean {
  return isLocalPublicPath(href) || isPublicHttps(href);
}

interface ArtifactDefinition {
  kind: ProductProofKind;
  label: LocalizedText;
  href: (proof: ProductProofArtifacts) => string | undefined;
  /** Extra rule for kinds whose destination has its own contract. */
  accept?: (href: string) => boolean;
}

/**
 * Artifact → destination. Labels describe the *artifact type* (never a claim):
 * they say what the reader is about to open, not what it proves.
 */
const ARTIFACTS: readonly ArtifactDefinition[] = [
  {
    kind: "screenshot",
    label: { en: "Product screenshot", vi: "Ảnh chụp sản phẩm" },
    href: (proof) => proof.screenshot?.src,
    // CSP img-src is 'self' data:, so only a local product asset can render.
    accept: (href) => LOCAL_PRODUCT_ASSET.test(href),
  },
  {
    kind: "public-url",
    label: { en: "Public product page", vi: "Trang sản phẩm công khai" },
    href: (proof) => proof.publicUrl,
  },
  {
    kind: "repository",
    label: { en: "Source repository", vi: "Kho mã nguồn" },
    href: (proof) => proof.repositoryUrl,
  },
  {
    kind: "documentation",
    label: { en: "Documentation", vi: "Tài liệu" },
    href: (proof) => proof.documentationUrl,
  },
  {
    kind: "privacy",
    label: { en: "Privacy policy", vi: "Chính sách quyền riêng tư" },
    href: (proof) => proof.privacyUrl,
  },
  {
    kind: "security",
    label: { en: "Security policy", vi: "Chính sách bảo mật" },
    href: (proof) => proof.securityUrl,
  },
  {
    kind: "support",
    label: { en: "Support", vi: "Hỗ trợ" },
    href: (proof) => proof.supportUrl,
  },
] as const;

/**
 * Resolvable public proof items for one product (optionally for one capability).
 *
 * Returns only items that resolve *and* publish a public destination, in a
 * stable order (artifact declaration order, then claim evidence order). An empty
 * array is a valid, meaningful answer: the surface must then show no proof
 * chrome at all.
 */
export function getProductProofLinks(
  product: PublicProductProofInput,
  capabilityId: string | undefined,
  claims: readonly ResolvedClaim[] = [],
  products: readonly PublicProductRef[] = [],
  lang: Language = "en",
): ProductProofLink[] {
  if (!product.public) return [];
  if (!SAFE_SLUG.test(product.slug)) return [];

  if (capabilityId !== undefined) {
    const wanted = productProofCapabilityKey(capabilityId);
    const declared = (product.capabilities ?? []).some(
      (capability) => productProofCapabilityKey(capability) === wanted,
    );
    // A capability the product does not declare has no published proof, and an
    // unknown surface must not borrow the product's.
    if (!declared) return [];
  }

  const links: ProductProofLink[] = [];
  const seen = new Set<string>();

  for (const artifact of ARTIFACTS) {
    const href = artifact.href(product.proof);
    if (!href || !isPublicProofDestination(href)) continue;
    if (artifact.accept && !artifact.accept(href)) continue;
    const id = `${artifact.kind}:${product.slug}`;
    if (seen.has(id)) continue;
    seen.add(id);
    links.push({
      id,
      kind: artifact.kind,
      href,
      label: artifact.label,
      // An authored artifact that resolves is source-linked; a reviewer is
      // recorded by the claim fabric, not guessed here.
      truthState: "source-linked",
    });
  }

  const publicSlugs = new Set(products.map((entry) => entry.slug));
  for (const resolved of claims) {
    if (resolved.claim.kind !== "product") continue;
    if (!resolved.productSlugs.includes(product.slug)) continue;
    // A product claim that resolves the Live registry may only speak for those
    // public products; anything else fails closed instead of borrowing proof.
    if (publicSlugs.size > 0 && !publicSlugs.has(product.slug)) continue;
    for (const reference of resolved.evidence) {
      const href = reference.href[lang];
      if (!isPublicProofDestination(href)) continue;
      if (seen.has(reference.id)) continue;
      seen.add(reference.id);
      links.push({
        id: reference.id,
        kind: "evidence",
        href,
        label: reference.label,
        truthState: resolved.reviewId ? "reviewed" : "source-linked",
        boundaryId: resolved.boundaryId,
        reviewId: resolved.reviewId,
      });
    }
  }

  return links;
}

/**
 * Explicit state for a surface: what may be shown, and which artifact kinds are
 * *not published*. Absence is reported, never rendered as a weaker proof.
 */
export function getProductProofSummary(
  product: PublicProductProofInput,
  capabilityId: string | undefined,
  claims: readonly ResolvedClaim[] = [],
  products: readonly PublicProductRef[] = [],
  lang: Language = "en",
): { published: ProductProofLink[]; missing: ProductProofKind[] } {
  const published = getProductProofLinks(
    product,
    capabilityId,
    claims,
    products,
    lang,
  );
  const missing = PROOF_KINDS.filter(
    (kind) =>
      kind !== "evidence" && !published.some((link) => link.kind === kind),
  );
  return { published, missing };
}
