/**
 * Explicit visitor intent for the local experience graph.
 *
 * Intent affects presentation priority only. The selector never creates,
 * removes, or mutates canonical product, claim, or evidence items.
 */

import type { ClaimKind } from "../data/claims.ts";

export const EXPERIENCE_INTENTS = [
  "explore-products",
  "evaluate-product",
  "verify-trust",
  "understand-architecture",
  "work-with-us",
] as const;

export type ExperienceIntent = (typeof EXPERIENCE_INTENTS)[number];

export const DEFAULT_EXPERIENCE_INTENT: ExperienceIntent = "explore-products";

/** The minimum shape already published by canonical public data modules. */
export interface ExperienceIntentItem {
  id: string;
  kind: ClaimKind;
  surface: string;
}

const INTENT_PRIORITIES: Readonly<
  Record<ExperienceIntent, readonly ClaimKind[]>
> = {
  "explore-products": [
    "product",
    "support",
    "trust",
    "policy",
    "principle",
    "brand",
  ],
  "evaluate-product": [
    "product",
    "trust",
    "policy",
    "support",
    "principle",
    "brand",
  ],
  "verify-trust": [
    "trust",
    "policy",
    "product",
    "support",
    "principle",
    "brand",
  ],
  "understand-architecture": [
    "principle",
    "brand",
    "product",
    "trust",
    "policy",
    "support",
  ],
  "work-with-us": [
    "support",
    "product",
    "trust",
    "policy",
    "principle",
    "brand",
  ],
};

const INTENTS = new Set<string>(EXPERIENCE_INTENTS);

/**
 * Reorder existing items for a declared intent.
 *
 * Unknown or malformed input falls back to the complete default experience.
 * Stable comparison preserves input order within equal intent priority.
 */
export function prioritizeForIntent<T extends ExperienceIntentItem>(
  items: readonly T[],
  intent?: unknown,
): T[] {
  const resolvedIntent: ExperienceIntent =
    typeof intent === "string" && INTENTS.has(intent)
      ? (intent as ExperienceIntent)
      : DEFAULT_EXPERIENCE_INTENT;
  const priorities = INTENT_PRIORITIES[resolvedIntent];

  return [...items].sort((left, right) => {
    const leftPriority = priorities.indexOf(left.kind);
    const rightPriority = priorities.indexOf(right.kind);
    return (
      (leftPriority === -1 ? priorities.length : leftPriority) -
      (rightPriority === -1 ? priorities.length : rightPriority)
    );
  });
}
