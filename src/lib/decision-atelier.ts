import type { DecisionItem, DecisionKind } from "./decision-room.ts";

/**
 * C4-E Task 2 — Decision Atelier arrangement.
 *
 * The atelier reuses the Decision Room's source model and never invents a
 * second one. Arrangement is explicit: an allowlisted goal plus bounded
 * constraints select declared groups by predicate. There is no numeric
 * relevance, no hidden weight and no ordering by quality — items keep their
 * source identity and their source order, and a selection outside the
 * vocabulary is rejected rather than guessed at.
 */

export const ATELIER_GOALS = [
  "explore",
  "evaluate",
  "verify",
  "architecture",
  "work-with-blueskyz",
] as const;

export type AtelierGoal = (typeof ATELIER_GOALS)[number];

export const ATELIER_CONSTRAINTS = [
  "technical",
  "trust",
  "availability",
] as const;

export type AtelierConstraint = (typeof ATELIER_CONSTRAINTS)[number];

/** A declared group: an id, the kinds it accepts, and the facts it requires. */
interface GroupRule {
  id: string;
  kinds: readonly DecisionKind[];
  requiresEvidence?: boolean;
  requiresBoundary?: boolean;
}

/** Every goal's groups, in presentation order. Declared, never computed. */
const GOAL_GROUPS: Record<AtelierGoal, readonly GroupRule[]> = {
  explore: [
    { id: "starting-points", kinds: ["claim", "trust", "product"] },
    {
      id: "open-questions",
      kinds: ["claim", "trust", "product"],
      requiresBoundary: true,
    },
  ],
  evaluate: [
    {
      id: "sourced-facts",
      kinds: ["claim", "trust", "product"],
      requiresEvidence: true,
    },
    {
      id: "stated-limits",
      kinds: ["claim", "trust", "product"],
      requiresBoundary: true,
    },
  ],
  verify: [
    {
      id: "evidence-backed",
      kinds: ["claim", "trust"],
      requiresEvidence: true,
    },
  ],
  architecture: [{ id: "trust-signals", kinds: ["trust"] }],
  "work-with-blueskyz": [{ id: "product-truth", kinds: ["product"] }],
};

/** What each constraint narrows to. Declared, never weighted. */
const CONSTRAINT_KINDS: Record<AtelierConstraint, readonly DecisionKind[]> = {
  technical: ["claim", "product"],
  trust: ["trust"],
  availability: ["claim", "trust", "product"],
};

export interface AtelierSelection {
  goal: string;
  constraints?: readonly string[];
}

export interface AtelierGroup {
  id: string;
  items: DecisionItem[];
}

export interface AtelierArrangement {
  goal: AtelierGoal | null;
  constraints: AtelierConstraint[];
  groups: AtelierGroup[];
  /** Selection values outside the vocabulary; reported, never guessed at. */
  rejected: string[];
  /** False when any part of the selection was rejected. */
  complete: boolean;
}

function accepts(rule: GroupRule, item: DecisionItem): boolean {
  if (!rule.kinds.includes(item.kind)) return false;
  if (rule.requiresEvidence && !item.evidenceHref) return false;
  if (rule.requiresBoundary && !item.boundaryText) return false;
  return true;
}

/**
 * Arrange source items for an explicit goal and bounded constraints.
 *
 * Returns the same item objects it was given, in their original order, so a
 * caller can always trace a displayed item back to the Decision Room source.
 */
export function arrangeDecisionItems(
  items: readonly DecisionItem[],
  selection: AtelierSelection,
): AtelierArrangement {
  const rejected: string[] = [];

  const goal = (ATELIER_GOALS as readonly string[]).includes(selection.goal)
    ? (selection.goal as AtelierGoal)
    : null;
  if (!goal) rejected.push(selection.goal);

  const constraints: AtelierConstraint[] = [];
  for (const candidate of selection.constraints ?? []) {
    if ((ATELIER_CONSTRAINTS as readonly string[]).includes(candidate)) {
      if (!constraints.includes(candidate as AtelierConstraint)) {
        constraints.push(candidate as AtelierConstraint);
      }
      continue;
    }
    rejected.push(candidate);
  }

  if (!goal) {
    return { goal: null, constraints, groups: [], rejected, complete: false };
  }

  const allowedKinds =
    constraints.length === 0
      ? null
      : new Set(
          constraints.flatMap((constraint) => [
            ...CONSTRAINT_KINDS[constraint],
          ]),
        );

  const groups: AtelierGroup[] = [];
  for (const rule of GOAL_GROUPS[goal]) {
    const matched = items.filter(
      (item) =>
        accepts(rule, item) &&
        (allowedKinds === null || allowedKinds.has(item.kind)),
    );
    if (matched.length > 0) groups.push({ id: rule.id, items: matched });
  }

  return {
    goal,
    constraints,
    groups,
    rejected,
    complete: rejected.length === 0,
  };
}
