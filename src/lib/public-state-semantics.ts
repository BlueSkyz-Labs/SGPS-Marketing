/**
 * Canonical public-state semantics (T8 / C3) — fail-closed.
 *
 * Domain-specific state vocabularies stay exactly where they already live:
 *
 *   - product lifecycle / availability / publicLabel → `src/lib/product-schema.ts`
 *   - `TrustState`                                    → `src/data/trust-ledger.ts`
 *   - `TruthState`                                    → `src/data/integrity.ts`
 *
 * This module deliberately does **not** redefine any of them. It composes
 * their types *by reference* and maps every live value to:
 *
 *   - a canonical meaning key;
 *   - the owning subsystem;
 *   - whether the state is public-facing;
 *   - which truth state, if any, may visually represent it;
 *   - which implications are permitted (`mayImply`) and which are forbidden
 *     (`neverImplies`).
 *
 * No score, no confidence percentage, no runtime-generated value, no
 * network or storage primitive. Unknown states resolve to `null` so a caller
 * fails closed instead of rendering an unmapped meaning.
 *
 * Node-safe: type-only imports plus relative ".ts" specifiers keep this
 * module importable by the repository test runner (same pattern as
 * `src/lib/claims.ts`). Nothing here is resolved at runtime except this file.
 */

import type { TruthState } from "../data/integrity.ts";
import type { TrustState } from "../data/trust-ledger.ts";
import type {
  Availability,
  Lifecycle,
  PublicLabel,
} from "./product-schema.ts";

/** Which public surface owns a state value. */
export type PublicSemanticSource =
  | "product-lifecycle"
  | "product-availability"
  | "product-label"
  | "trust-ledger"
  | "integrity";

/** Owning subsystem — used for wording ownership and review routing. */
export type PublicSemanticOwner =
  | "product-registry"
  | "trust-ledger"
  | "integrity-contract";

/**
 * The union of live vocabulary values this model covers. It is composed from
 * the canonical unions above — a reference, never a re-declaration.
 */
export type PublicSurfaceStateValue =
  | Lifecycle
  | Availability
  | PublicLabel
  | TrustState
  | TruthState;

/**
 * Canonical meaning of a public state, independent of surface wording.
 *
 * Evidence states reuse the live `TruthState` values directly: they are
 * already the canonical vocabulary for "what a public evidence surface is
 * allowed to mean", so this module references them instead of inventing a
 * parallel set.
 */
export type PublicStateMeaningKey =
  | "product-not-yet-public"
  | "product-public-preview"
  | "product-available-now"
  | "product-winding-down"
  | "product-retired"
  | "trust-surface-exists"
  | "trust-surface-absent"
  | TruthState;

/** Assurance claims no public state may ever imply. */
export type UnsupportedAssuranceKey =
  | "verified-by-us"
  | "certified"
  | "audited"
  | "compliant"
  | "guaranteed"
  | "secure"
  | "security-assurance"
  | "privacy-assurance";

/** Absence of a publication is not evidence of non-existence. */
export type AbsenceKey = "does-not-exist";

/** Everything a state may or may not be read as. */
export type ImpliedMeaningKey =
  | PublicStateMeaningKey
  | UnsupportedAssuranceKey
  | AbsenceKey;

/**
 * Implications forbidden for *every* public state, whatever the surface.
 * Reading any of these out of a public state is a semantic upgrade, not a
 * mapping — the exact drift C3 exists to stop.
 */
export const NEVER_IMPLIED_BY_ANY_STATE: readonly ImpliedMeaningKey[] = [
  "verified-by-us",
  "certified",
  "audited",
  "compliant",
  "guaranteed",
  "secure",
  "security-assurance",
  "privacy-assurance",
  "does-not-exist",
];

export interface PublicStateSemanticEntry {
  source: PublicSemanticSource;
  value: PublicSurfaceStateValue;
  /** The only thing this state is allowed to mean. */
  meaning: PublicStateMeaningKey;
  owner: PublicSemanticOwner;
  publicFacing: boolean;
  /** Truth state that may visually represent this state, if any. */
  mayRenderAsTruthState?: TruthState | undefined;
  /**
   * Implied keys this state may legitimately be read as. Always includes its
   * own `meaning`; never intersects `neverImplies`.
   */
  mayImply: readonly ImpliedMeaningKey[];
  /** Implied keys that must never follow from this state. */
  neverImplies: readonly ImpliedMeaningKey[];
}

/** `neverImplies` = the blanket ban plus the state's own temptations. */
const never = (
  ...extras: readonly ImpliedMeaningKey[]
): readonly ImpliedMeaningKey[] => [...NEVER_IMPLIED_BY_ANY_STATE, ...extras];

/** No product-surface state is evidence of review or of a source link. */
const PRODUCT_NEVER: readonly ImpliedMeaningKey[] = ["reviewed", "source-linked"];

export const PUBLIC_STATE_SEMANTICS: readonly PublicStateSemanticEntry[] = [
  /* ---------------------------------------------------------------- */
  /* product-lifecycle — `lifecycle` in src/lib/product-schema.ts      */
  /* ---------------------------------------------------------------- */
  {
    source: "product-lifecycle",
    value: "concept",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "prototype",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "development",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "beta",
    meaning: "product-public-preview",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-public-preview"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "active",
    meaning: "product-available-now",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-available-now"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "maintenance",
    meaning: "product-available-now",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-available-now"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "sunset",
    meaning: "product-winding-down",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-winding-down"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-lifecycle",
    value: "archived",
    meaning: "product-retired",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-retired"],
    neverImplies: never(...PRODUCT_NEVER),
  },

  /* ---------------------------------------------------------------- */
  /* product-availability — `availability` in src/lib/product-schema.ts */
  /* ---------------------------------------------------------------- */
  {
    source: "product-availability",
    value: "private",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-availability",
    value: "waitlist",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-availability",
    value: "preview",
    meaning: "product-public-preview",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-public-preview"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-availability",
    value: "public",
    meaning: "product-available-now",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-available-now"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-availability",
    value: "invite-only",
    meaning: "product-available-now",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-available-now"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-availability",
    value: "unavailable",
    meaning: "unavailable",
    owner: "product-registry",
    publicFacing: true,
    mayRenderAsTruthState: "unavailable",
    mayImply: ["unavailable"],
    neverImplies: never(...PRODUCT_NEVER),
  },

  /* ---------------------------------------------------------------- */
  /* product-label — `publicLabel` in src/lib/product-schema.ts        */
  /* ---------------------------------------------------------------- */
  {
    source: "product-label",
    value: "Preview",
    meaning: "product-public-preview",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-public-preview"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-label",
    value: "In development",
    meaning: "product-not-yet-public",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-not-yet-public"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-label",
    value: "Beta",
    meaning: "product-public-preview",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-public-preview"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-label",
    value: "Available",
    meaning: "product-available-now",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-available-now"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-label",
    value: "Sunsetting",
    meaning: "product-winding-down",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-winding-down"],
    neverImplies: never(...PRODUCT_NEVER),
  },
  {
    source: "product-label",
    value: "Archived",
    meaning: "product-retired",
    owner: "product-registry",
    publicFacing: true,
    mayImply: ["product-retired"],
    neverImplies: never(...PRODUCT_NEVER),
  },

  /* ---------------------------------------------------------------- */
  /* trust-ledger — `TrustState` in src/data/trust-ledger.ts           */
  /* ---------------------------------------------------------------- */
  {
    source: "trust-ledger",
    value: "available",
    meaning: "trust-surface-exists",
    owner: "trust-ledger",
    publicFacing: true,
    mayRenderAsTruthState: "source-linked",
    mayImply: ["trust-surface-exists"],
    neverImplies: never("reviewed", "source-linked"),
  },
  {
    source: "trust-ledger",
    value: "not-published",
    meaning: "trust-surface-absent",
    owner: "trust-ledger",
    publicFacing: true,
    mayRenderAsTruthState: "not-published",
    mayImply: ["trust-surface-absent"],
    neverImplies: never(),
  },

  /* ---------------------------------------------------------------- */
  /* integrity — `TruthState` in src/data/integrity.ts                 */
  /* ---------------------------------------------------------------- */
  {
    source: "integrity",
    value: "source-linked",
    meaning: "source-linked",
    owner: "integrity-contract",
    publicFacing: true,
    mayRenderAsTruthState: "source-linked",
    mayImply: ["source-linked"],
    neverImplies: never("reviewed"),
  },
  {
    source: "integrity",
    value: "reviewed",
    meaning: "reviewed",
    owner: "integrity-contract",
    publicFacing: true,
    mayRenderAsTruthState: "reviewed",
    mayImply: ["reviewed"],
    neverImplies: never("source-linked"),
  },
  {
    source: "integrity",
    value: "changed",
    meaning: "changed",
    owner: "integrity-contract",
    publicFacing: true,
    mayRenderAsTruthState: "changed",
    mayImply: ["changed"],
    neverImplies: never("reviewed", "source-linked"),
  },
  {
    source: "integrity",
    value: "not-published",
    meaning: "not-published",
    owner: "integrity-contract",
    publicFacing: true,
    mayRenderAsTruthState: "not-published",
    mayImply: ["not-published"],
    neverImplies: never(),
  },
  {
    source: "integrity",
    value: "unavailable",
    meaning: "unavailable",
    owner: "integrity-contract",
    publicFacing: true,
    mayRenderAsTruthState: "unavailable",
    mayImply: ["unavailable"],
    neverImplies: never("reviewed", "source-linked"),
  },
];

/** Every (source, value) pair this model covers — no orphans, no extras. */
export const ALL_SURFACE_STATES: readonly {
  source: PublicSemanticSource;
  value: PublicSurfaceStateValue;
}[] = PUBLIC_STATE_SEMANTICS.map(({ source, value }) => ({ source, value }));

/**
 * A mapping that a public surface must never make. Each one is an over-reading
 * a reader is genuinely tempted to take, which is why it is written down with
 * its reason instead of being left to reviewer memory.
 */
export interface ForbiddenMapping {
  source: PublicSemanticSource;
  value: PublicSurfaceStateValue;
  implied: ImpliedMeaningKey;
  reason: string;
}

export const FORBIDDEN_MAPPINGS: readonly ForbiddenMapping[] = [
  {
    source: "product-availability",
    value: "public",
    implied: "reviewed",
    reason:
      "Public availability is a distribution state. It says the product can be reached, not that a human reviewed the content behind it.",
  },
  {
    source: "product-availability",
    value: "public",
    implied: "source-linked",
    reason:
      "Shipping something publicly does not attach an evidence reference to it; source-linked requires a resolved public evidence id.",
  },
  {
    source: "product-availability",
    value: "public",
    implied: "security-assurance",
    reason:
      "Availability describes reach, not protection. No security posture follows from a product being publicly usable.",
  },
  {
    source: "product-label",
    value: "Available",
    implied: "security-assurance",
    reason:
      "publicLabel `Available` describes product availability, not security or privacy assurance.",
  },
  {
    source: "product-label",
    value: "Available",
    implied: "privacy-assurance",
    reason:
      "A public product label says nothing about what data is collected or how it is handled.",
  },
  {
    source: "product-label",
    value: "Available",
    implied: "verified-by-us",
    reason:
      "A shipped product is not a verified product; verification needs published evidence, not a label.",
  },
  {
    source: "trust-ledger",
    value: "available",
    implied: "verified-by-us",
    reason:
      "Trust ledger `available` means the public trust surface exists. It does not mean an external auditor, or we, verified the product.",
  },
  {
    source: "trust-ledger",
    value: "available",
    implied: "audited",
    reason:
      "Publishing a privacy, security, or support route is not an audit and must never render as one.",
  },
  {
    source: "trust-ledger",
    value: "available",
    implied: "reviewed",
    reason:
      "A live trust route carries no review state; `reviewed` is a distinct truth state with its own authored review metadata.",
  },
  {
    source: "trust-ledger",
    value: "available",
    implied: "source-linked",
    reason:
      "A published route is not a source-linked evidence reference; the evidence id must resolve in the public evidence index.",
  },
  {
    source: "trust-ledger",
    value: "not-published",
    implied: "does-not-exist",
    reason:
      "Absence from the public ledger is a publication state, not proof that the underlying practice is missing.",
  },
  {
    source: "integrity",
    value: "source-linked",
    implied: "certified",
    reason:
      "A resolved source link is traceability, not certification. Nothing in this site issues or holds a certificate.",
  },
  {
    source: "integrity",
    value: "source-linked",
    implied: "verified-by-us",
    reason:
      "source-linked means the claim points at a public artifact; it does not mean we verified the artifact's contents.",
  },
  {
    source: "integrity",
    value: "source-linked",
    implied: "reviewed",
    reason:
      "source-linked and reviewed are distinct truth states. A link is not a review, and review metadata is authored separately.",
  },
  {
    source: "integrity",
    value: "not-published",
    implied: "does-not-exist",
    reason:
      "A not-published surface stays quiet by design; silence is never evidence that the thing does not exist.",
  },
  {
    source: "integrity",
    value: "changed",
    implied: "reviewed",
    reason:
      "`changed` means the content moved after the last review, so it must never render as `reviewed`.",
  },
  {
    source: "integrity",
    value: "unavailable",
    implied: "does-not-exist",
    reason:
      "Temporary unavailability is a reachability state and must not be upgraded into non-existence.",
  },
  {
    source: "product-availability",
    value: "unavailable",
    implied: "does-not-exist",
    reason:
      "A product that is currently unreachable has not been deleted; availability and existence are different facts.",
  },
];

/**
 * Canonical entry for a surface state, or `null` when the value is unknown.
 * Fail-closed: an unmapped state has no permitted rendering.
 */
export function getStateSemantics(
  source: PublicSemanticSource,
  value: string,
): PublicStateSemanticEntry | null {
  const entry = PUBLIC_STATE_SEMANTICS.find(
    (candidate) => candidate.source === source && candidate.value === value,
  );
  return entry ?? null;
}

/**
 * True when `implied` must never be read out of `(source, value)`.
 *
 * Two independent rules apply: the blanket ban on assurance/absence readings
 * from any public state, and the explicit per-pair list. Unknown states are
 * still bound by the blanket ban; callers must treat a `null` from
 * `getStateSemantics` as unmappable and render nothing.
 */
export function isForbiddenMapping(
  source: PublicSemanticSource,
  value: string,
  implied: string,
): boolean {
  if (NEVER_IMPLIED_BY_ANY_STATE.includes(implied as ImpliedMeaningKey)) {
    return true;
  }
  return FORBIDDEN_MAPPINGS.some(
    (mapping) =>
      mapping.source === source &&
      mapping.value === value &&
      mapping.implied === implied,
  );
}

/** Reason an explicit forbidden pair is rejected, or `null` when it is not one. */
export function getForbiddenMappingReason(
  source: PublicSemanticSource,
  value: string,
  implied: string,
): string | null {
  const mapping = FORBIDDEN_MAPPINGS.find(
    (candidate) =>
      candidate.source === source &&
      candidate.value === value &&
      candidate.implied === implied,
  );
  return mapping ? mapping.reason : null;
}
