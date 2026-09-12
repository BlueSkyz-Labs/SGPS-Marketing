import { getPublicClaims, resolvePublicClaim } from "./claims.ts";
import type { PublicProductRef } from "./claims.ts";
import {
  BOUNDARY_INDEX,
  CLAIMS,
  EVIDENCE_INDEX,
  INTEGRITY_ENTRY_INDEX,
  type PublicClaim,
} from "../data/claims.ts";
import { buildPublicSgpsManifest } from "./sgps-manifest.ts";

/**
 * v3 G9 — Publishability compiler (Task 19).
 * Fail-closed validation composing the existing truth/product/claim
 * selectors — it never copies their logic and never repairs content.
 */

export type PublishabilityFailureCode =
  | "MISSING_PUBLIC_TRUTH"
  | "MISSING_EVIDENCE"
  | "INVALID_LOCALE_PARITY"
  | "UNKNOWN_PRODUCT"
  | "ORPHAN_CLAIM";

export interface PublishabilityFailure {
  code: PublishabilityFailureCode;
  subject: string;
  detail: string;
  fix: string;
}

const PUBLIC_SURFACES = ["security", "privacy", "products"] as const;

const FIXES: Record<PublishabilityFailureCode, string> = {
  MISSING_PUBLIC_TRUTH:
    "Give the claim a public EN and VI statement on a known public surface.",
  MISSING_EVIDENCE:
    "Reference only evidence ids that exist in public integrity data.",
  INVALID_LOCALE_PARITY:
    "Complete every EN/VI pair for statements, labels, and hrefs.",
  UNKNOWN_PRODUCT:
    "A product claim may only resolve products present in the public registry; an empty registry must fail closed.",
  ORPHAN_CLAIM: "Remove duplicates; keep claim ids aligned with the manifest.",
};

export function checkPublishability(
  products: PublicProductRef[],
  claims: readonly PublicClaim[] = CLAIMS,
): PublishabilityFailure[] {
  const failures: PublishabilityFailure[] = [];
  const push = (
    code: PublishabilityFailureCode,
    subject: string,
    detail: string,
  ): void => {
    failures.push({ code, subject, detail, fix: FIXES[code] });
  };

  const seen = new Set<string>();
  for (const claim of claims) {
    const subject = claim.id || "<missing-id>";

    if (!claim.id) {
      push("ORPHAN_CLAIM", subject, "claim has no id");
    } else if (seen.has(claim.id)) {
      push("ORPHAN_CLAIM", subject, "duplicate claim id");
    } else {
      seen.add(claim.id);
    }

    if (!claim.statement?.en || !claim.statement?.vi) {
      push(
        "MISSING_PUBLIC_TRUTH",
        subject,
        "statement must be complete in both EN and VI",
      );
    }
    if (
      !PUBLIC_SURFACES.includes(
        claim.surface as (typeof PUBLIC_SURFACES)[number],
      )
    ) {
      push(
        "MISSING_PUBLIC_TRUTH",
        subject,
        `surface "${claim.surface ?? ""}" is not a declared public surface`,
      );
    }

    if (!claim.evidenceIds || claim.evidenceIds.length === 0) {
      push(
        "MISSING_EVIDENCE",
        subject,
        "claim must cite at least one evidence id",
      );
    }
    for (const evidenceId of claim.evidenceIds ?? []) {
      const ref = EVIDENCE_INDEX.get(evidenceId);
      if (!ref) {
        push(
          "MISSING_EVIDENCE",
          subject,
          `unknown evidence id "${evidenceId}"`,
        );
        continue;
      }
      if (!ref.href.en || !ref.href.vi || !ref.label.en || !ref.label.vi) {
        push(
          "INVALID_LOCALE_PARITY",
          subject,
          `evidence "${evidenceId}" is missing an EN/VI href or label`,
        );
      }
    }
    if (claim.boundaryId) {
      const boundary = BOUNDARY_INDEX.get(claim.boundaryId);
      if (!boundary) {
        push(
          "MISSING_EVIDENCE",
          subject,
          `unknown boundary id "${claim.boundaryId}"`,
        );
      } else if (
        !boundary.claim.en ||
        !boundary.claim.vi ||
        !boundary.doesNotImply.en ||
        !boundary.doesNotImply.vi
      ) {
        push(
          "INVALID_LOCALE_PARITY",
          subject,
          `boundary "${claim.boundaryId}" is missing an EN/VI pair`,
        );
      }
    }
    if (claim.reviewId && !INTEGRITY_ENTRY_INDEX.has(claim.reviewId)) {
      push(
        "MISSING_EVIDENCE",
        subject,
        `unknown review id "${claim.reviewId}"`,
      );
    }

    // Product claims must fail closed on an empty registry and may only
    // resolve products present in the public selector input.
    if (claim.kind === "product") {
      const resolved = resolvePublicClaim(claim, products);
      if (products.length === 0 && resolved !== null) {
        push(
          "UNKNOWN_PRODUCT",
          subject,
          "product claim resolved while the public registry is empty",
        );
      }
      if (resolved) {
        const known = new Set(products.map((product) => product.slug));
        for (const slug of resolved.productSlugs) {
          if (!known.has(slug)) {
            push(
              "UNKNOWN_PRODUCT",
              subject,
              `claim resolves unknown product "${slug}"`,
            );
          }
        }
      }
    }
  }

  // Cross-system: manifest ids must equal the resolved public fabric ids.
  const manifestIds = buildPublicSgpsManifest(products).claims.map(
    (claim) => claim.id,
  );
  const fabricIds = getPublicClaims(products).map(
    (resolved) => resolved.claim.id,
  );
  for (const id of manifestIds) {
    if (!fabricIds.includes(id)) {
      push("ORPHAN_CLAIM", id, "manifest claim id is not in the public fabric");
    }
  }
  for (const id of fabricIds) {
    if (!manifestIds.includes(id)) {
      push(
        "ORPHAN_CLAIM",
        id,
        "public fabric claim id is missing from the manifest",
      );
    }
  }

  return failures;
}

export function formatPublishabilityFailures(
  failures: PublishabilityFailure[],
): string[] {
  return failures.map(
    ({ code, subject, detail, fix }) =>
      `FAIL ${code} ${subject} — ${detail} (fix: ${fix})`,
  );
}
