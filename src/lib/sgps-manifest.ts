import {
  getEvidencePassportPath,
  getPublicClaims,
  type PublicProductRef,
  type ResolvedClaim,
} from "./claims.ts";
import { EVIDENCE_INDEX, INTEGRITY_ENTRY_INDEX } from "../data/claims.ts";
import type { TruthState } from "../data/integrity.ts";

/**
 * v3 G7 + C3-B G9 — public SGPS machine passport.
 *
 * A privacy-safe, deterministic derived view over public Claim Fabric truth.
 * It contains stable ids and public routes only: no claim prose, private
 * reporting destinations, repository provenance, runtime secrets, or inferred
 * assurance.
 */

export interface PublicSgpsManifestClaim {
  id: string;
  kind: string;
  urls: { en: string; vi: string };
  truthState?: TruthState | undefined;
  evidenceIds: string[];
}

export interface PublicSgpsProductProof {
  productSlug: string;
  capabilityId: string;
  claimId: string;
  evidenceIds: string[];
  urls: { en: string; vi: string };
  truthState: TruthState;
  boundaryId?: string | undefined;
  reviewedOn?: string | undefined;
}

export interface PublicSgpsManifest {
  schemaVersion: "1.1";
  generatedFrom: "public-runtime-data";
  claims: PublicSgpsManifestClaim[];
  productProof: PublicSgpsProductProof[];
}

/** Only stable public evidence ids may ever appear in manifest output. */
export const PUBLIC_MANIFEST_EVIDENCE_ID_PATTERN = /^ev-[a-z0-9-]+$/;

function publicEvidenceIds(resolved: ResolvedClaim): string[] {
  return resolved.evidence
    .filter((reference) => reference.kind !== "private-reporting")
    .map((reference) => reference.id)
    .filter((id) => PUBLIC_MANIFEST_EVIDENCE_ID_PATTERN.test(id))
    .sort();
}

function buildProductProof(
  products: readonly PublicProductRef[],
  claims: readonly ResolvedClaim[],
): PublicSgpsProductProof[] {
  const publicSlugs = new Set(products.map((product) => product.slug));
  const records: PublicSgpsProductProof[] = [];

  for (const resolved of claims) {
    const binding = resolved.claim.productBinding;
    if (resolved.claim.kind !== "product" || !binding) continue;
    if (!publicSlugs.has(binding.productSlug)) continue;
    if (!resolved.productSlugs.includes(binding.productSlug)) continue;

    const evidenceIds = publicEvidenceIds(resolved);
    if (evidenceIds.length === 0) continue;

    const record: PublicSgpsProductProof = {
      productSlug: binding.productSlug,
      capabilityId: binding.capabilityId,
      claimId: resolved.claim.id,
      evidenceIds,
      urls: {
        en: getEvidencePassportPath("en", resolved.claim.id),
        vi: getEvidencePassportPath("vi", resolved.claim.id),
      },
      truthState: resolved.truthState,
    };

    if (resolved.boundaryId) {
      record.boundaryId = resolved.boundaryId;
    }

    const review = resolved.reviewId
      ? INTEGRITY_ENTRY_INDEX.get(resolved.reviewId)?.review
      : undefined;
    if (review?.reviewedOn) {
      record.reviewedOn = review.reviewedOn;
    }

    records.push(record);
  }

  return records.sort(
    (a, b) =>
      a.claimId.localeCompare(b.claimId) ||
      a.productSlug.localeCompare(b.productSlug) ||
      a.capabilityId.localeCompare(b.capabilityId),
  );
}

export function buildPublicSgpsManifest(
  products: PublicProductRef[],
  claims: readonly ResolvedClaim[] = getPublicClaims(products),
): PublicSgpsManifest {
  const publicClaims = claims
    .map((resolved) => {
      const { claim, reviewId } = resolved;
      const record: PublicSgpsManifestClaim = {
        id: claim.id,
        kind: claim.kind,
        urls: {
          en: getEvidencePassportPath("en", claim.id),
          vi: getEvidencePassportPath("vi", claim.id),
        },
        evidenceIds: publicEvidenceIds(resolved),
      };
      const entry = reviewId ? INTEGRITY_ENTRY_INDEX.get(reviewId) : undefined;
      if (entry) {
        record.truthState = entry.state;
      }
      return record;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    schemaVersion: "1.1",
    generatedFrom: "public-runtime-data",
    claims: publicClaims,
    productProof: buildProductProof(products, claims),
  };
}

/** Deterministic serialization: stable key order, trailing newline. */
export function serializePublicSgpsManifest(
  products: PublicProductRef[],
  claims: readonly ResolvedClaim[] = getPublicClaims(products),
): string {
  return `${JSON.stringify(buildPublicSgpsManifest(products, claims), null, 2)}\n`;
}
