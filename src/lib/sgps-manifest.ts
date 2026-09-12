import { getPublicClaims, getEvidencePassportPath } from "./claims.ts";
import { INTEGRITY_ENTRY_INDEX } from "../data/claims.ts";
import type { TruthState } from "../data/integrity.ts";
import type { PublicProductRef } from "./claims.ts";

/**
 * v3 G7 — Public SGPS manifest (Task 17).
 * A privacy-safe, deterministic description of the public claim fabric for
 * human and machine consumers. It exposes only stable ids, localized public
 * URLs, optional authored truth states, and safe evidence ids.
 *
 * Hard rejections (tested): email addresses, private-reporting target
 * values, internal repo paths, SHAs, workflow ids, branches, unpublished
 * product names, and arbitrary free-text fields.
 */

export interface PublicSgpsManifestClaim {
  id: string;
  kind: string;
  urls: { en: string; vi: string };
  truthState?: TruthState | undefined;
  evidenceIds: string[];
}

export interface PublicSgpsManifest {
  schemaVersion: "1.0";
  generatedFrom: "public-runtime-data";
  claims: PublicSgpsManifestClaim[];
}

/** Only stable public evidence ids may ever appear in manifest output. */
export const PUBLIC_MANIFEST_EVIDENCE_ID_PATTERN = /^ev-[a-z0-9-]+$/;

export function buildPublicSgpsManifest(
  products: PublicProductRef[],
): PublicSgpsManifest {
  const claims = getPublicClaims(products)
    .map(({ claim, reviewId }) => {
      const record: PublicSgpsManifestClaim = {
        id: claim.id,
        kind: claim.kind,
        urls: {
          en: getEvidencePassportPath("en", claim.id),
          vi: getEvidencePassportPath("vi", claim.id),
        },
        evidenceIds: [...claim.evidenceIds]
          .filter((id) => PUBLIC_MANIFEST_EVIDENCE_ID_PATTERN.test(id))
          .sort(),
      };
      const entry = reviewId ? INTEGRITY_ENTRY_INDEX.get(reviewId) : undefined;
      if (entry) {
        record.truthState = entry.state;
      }
      return record;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    schemaVersion: "1.0",
    generatedFrom: "public-runtime-data",
    claims,
  };
}

/** Deterministic serialization: stable key order, trailing newline. */
export function serializePublicSgpsManifest(
  products: PublicProductRef[],
): string {
  return `${JSON.stringify(buildPublicSgpsManifest(products), null, 2)}\n`;
}
