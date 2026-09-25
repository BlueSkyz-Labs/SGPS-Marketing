import { CLAIMS } from "../data/claims.ts";
import { type Language, compilePublicDossier } from "./dossier.ts";

/**
 * Canonical rank of a claim in the published catalog. The compiler keeps the
 * order it was asked in, so the plan imposes the catalog's own order instead:
 * the destination must not depend on the order the visitor happened to tick.
 */
const CLAIM_RANK = new Map(CLAIMS.map((claim, index) => [claim.id, index]));

/**
 * C4-E Task 5 — Decision Room to dossier handoff.
 *
 * The visitor's own ticks are the only input. Nothing is selected on their
 * behalf, nothing is remembered and nothing is transmitted: the plan is a
 * validated list of public ids and an ordinary link that carries them.
 *
 * Ids that cannot be composed are reported, never quietly dropped or quietly
 * included. When nothing is transferable the plan has no destination at all,
 * so there is no hidden default set to fall back on.
 */

/** The C4-C composer reads this exact parameter. */
export const HANDOFF_PARAM = "items";

/** Only claim-backed Decision Room items name a composable public id. */
export const HANDOFF_CLAIM_PREFIX = "claim:";

export type HandoffRejectionReason =
  "not-composable" | "not-public" | "duplicate";

export interface HandoffRejection {
  /** The Decision Room item id exactly as it was selected. */
  id: string;
  reason: HandoffRejectionReason;
}

export interface HandoffPlan {
  /** An ordinary same-origin link, or null when nothing is transferable. */
  href: string | null;
  /** Public ids in canonical catalog order — never the order they were ticked. */
  itemIds: string[];
  /** Every selection that could not transfer, with why. Never silent. */
  rejected: HandoffRejection[];
}

function claimIdOf(itemId: string): string | null {
  if (!itemId.startsWith(HANDOFF_CLAIM_PREFIX)) return null;
  const claimId = itemId.slice(HANDOFF_CLAIM_PREFIX.length).trim();
  return claimId.length > 0 ? claimId : null;
}

/**
 * Turn explicit selections into a dossier destination.
 *
 * Composes against the canonical catalog, so an id the product has not
 * published fails closed here exactly as it would in the composer.
 */
export function planDossierHandoff(
  selectedIds: readonly string[],
  lang: Language,
): HandoffPlan {
  const rejected: HandoffRejection[] = [];
  const candidates: string[] = [];
  const seen = new Set<string>();

  for (const raw of selectedIds) {
    if (typeof raw !== "string") {
      rejected.push({ id: String(raw), reason: "not-composable" });
      continue;
    }
    const itemId = raw.trim();
    if (itemId.length === 0) continue;
    const claimId = claimIdOf(itemId);
    if (claimId === null) {
      rejected.push({ id: itemId, reason: "not-composable" });
      continue;
    }
    if (seen.has(claimId)) {
      rejected.push({ id: itemId, reason: "duplicate" });
      continue;
    }
    seen.add(claimId);
    candidates.push(claimId);
  }

  if (candidates.length === 0) return { href: null, itemIds: [], rejected };

  const compiled = compilePublicDossier({ lang, claimIds: candidates });
  const itemIds = compiled.entries
    .map((entry) => entry.id)
    .sort(
      (a, b) =>
        (CLAIM_RANK.get(a) ?? Number.MAX_SAFE_INTEGER) -
        (CLAIM_RANK.get(b) ?? Number.MAX_SAFE_INTEGER),
    );
  for (const rejection of compiled.rejected) {
    rejected.push({
      id: `${HANDOFF_CLAIM_PREFIX}${rejection.id}`,
      reason: rejection.reason === "duplicate" ? "duplicate" : "not-public",
    });
  }

  if (itemIds.length === 0) return { href: null, itemIds: [], rejected };

  const search = new URLSearchParams({ [HANDOFF_PARAM]: itemIds.join(",") });
  return { href: `/${lang}/dossier/?${search.toString()}`, itemIds, rejected };
}
