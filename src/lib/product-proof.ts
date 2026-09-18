/**
 * C3-B Task 1 (G4) — capability-bound product-to-proof selector.
 *
 * This adapter is a derived view over the canonical Claim Fabric. It never
 * authors product, claim, evidence, boundary, or truth-state data.
 */

import type { BoundaryStatement, EvidenceReference, LocalizedText, TruthState } from "../data/integrity.ts";
import { getEvidencePassportPath, getPublicClaims, type PublicProductRef, type ResolvedClaim } from "./claims.ts";

export interface ProductProofLink {
  claimId: string;
  evidenceId: string;
  href: { en: string; vi: string };
  label: LocalizedText;
  truthState: TruthState;
  boundary?: BoundaryStatement | undefined;
  passportHref: { en: string; vi: string };
}

function isPublicProofReference(reference: EvidenceReference): boolean {
  return reference.kind !== "private-reporting";
}

export function getProductProofLinks(
  productSlug: string,
  capabilityId: string,
  products: readonly PublicProductRef[],
  claims: readonly ResolvedClaim[] = getPublicClaims([...products]),
): ProductProofLink[] {
  if (!productSlug || !capabilityId) return [];
  if (!products.some((product) => product.slug === productSlug)) return [];

  const links: ProductProofLink[] = [];

  for (const resolved of claims) {
    const binding = resolved.claim.productBinding;
    if (resolved.claim.kind !== "product" || !binding) continue;
    if (
      binding.productSlug !== productSlug ||
      binding.capabilityId !== capabilityId
    ) {
      continue;
    }
    if (!resolved.productSlugs.includes(productSlug)) continue;

    for (const reference of resolved.evidence) {
      if (!isPublicProofReference(reference)) continue;
      links.push({
        claimId: resolved.claim.id,
        evidenceId: reference.id,
        href: reference.href,
        label: reference.label,
        truthState: resolved.truthState,
        boundary: resolved.boundary,
        passportHref: {
          en: getEvidencePassportPath("en", resolved.claim.id),
          vi: getEvidencePassportPath("vi", resolved.claim.id),
        },
      });
    }
  }

  return links.sort(
    (a, b) =>
      a.claimId.localeCompare(b.claimId) ||
      a.evidenceId.localeCompare(b.evidenceId),
  );
}
