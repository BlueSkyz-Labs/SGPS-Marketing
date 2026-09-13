/**
 * Decision Room items (v3 G4) — built only from public claims, the Trust
 * Ledger, and the public product registry. A neutral workspace: visitors
 * place sourced facts and their boundaries side by side, and nothing is
 * graded or ordered by quality.
 *
 * Node-safe: relative ".ts" imports (repository test-runner pattern).
 */

import { getPublicClaims } from "./claims.ts";
import { BOUNDARY_INDEX } from "../data/claims.ts";
import { TRUST_LEDGER } from "../data/trust-ledger.ts";
import { getProductProfilePath } from "./product-routes.ts";

export type DecisionKind = "claim" | "trust" | "product";

export interface DecisionItem {
  id: string;
  kind: DecisionKind;
  label: { en: string; vi: string };
  summary?: { en: string; vi: string } | undefined;
  boundaryText?: { en: string; vi: string } | undefined;
  evidenceHref?: { en: string; vi: string } | undefined;
}

/** Hard comparison cap — a bounded workspace, never an endless list. */
export const MAX_COMPARISON = 4;

export interface DecisionProductRef {
  slug: string;
  name: string;
}

export function buildDecisionItems(
  products: DecisionProductRef[],
): DecisionItem[] {
  const items: DecisionItem[] = [];

  for (const resolved of getPublicClaims(products)) {
    const firstEvidence = resolved.evidence[0];
    items.push({
      id: `claim:${resolved.claim.id}`,
      kind: "claim",
      label: resolved.claim.statement,
    });
    const last = items[items.length - 1];
    if (last && resolved.boundaryId) {
      // Boundary text travels with the item so the room can show what the
      // claim does not establish next to what it does.
      const boundaryText = firstBoundaryText(resolved.boundaryId);
      if (boundaryText) last.boundaryText = boundaryText;
    }
    if (last && firstEvidence) {
      last.evidenceHref = firstEvidence.href;
      last.summary = { en: firstEvidence.label.en, vi: firstEvidence.label.vi };
    }
  }

  for (const entry of TRUST_LEDGER) {
    items.push({
      id: `trust:${entry.id}`,
      kind: "trust",
      label: entry.label,
      summary: entry.summary,
      evidenceHref: entry.href,
    });
  }

  for (const product of products) {
    items.push({
      id: `product:${product.slug}`,
      kind: "product",
      label: { en: product.name, vi: product.name },
      evidenceHref: {
        en: getProductProfilePath("en", product.slug),
        vi: getProductProfilePath("vi", product.slug),
      },
    });
  }

  return items;
}

function firstBoundaryText(
  boundaryId: string,
): { en: string; vi: string } | undefined {
  const boundary = BOUNDARY_INDEX.get(boundaryId);
  return boundary ? boundary.doesNotImply : undefined;
}
