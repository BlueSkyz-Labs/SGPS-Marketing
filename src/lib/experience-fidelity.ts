/**
 * C3-D fidelity tier resolver.
 *
 * Resolves a fidelity tier of exactly `static-premium | restrained | cinematic`
 * from explicit preference overrides plus standards-based capability checks.
 *
 * - Prefers CSS/media queries where possible; JS reads only what it needs.
 * - Reduced motion always forces static-premium (non-travel).
 * - Unsupported native features never cause critical content failure.
 * - No remote calls, no persistence, no fingerprinting primitives.
 */

export type FidelityTier = "static-premium" | "restrained" | "cinematic";

export interface NativeFeatures {
  readonly viewTransitions?: boolean;
  readonly containerQueries?: boolean;
  readonly prefersReducedMotion?: boolean;
}

export interface FidelityOptions {
  readonly reducedMotion?: boolean;
  readonly explicitOverride?: FidelityTier;
  readonly nativeFeatures?: NativeFeatures;
}

const VALID_TIERS: readonly FidelityTier[] = [
  "static-premium",
  "restrained",
  "cinematic",
];

function isValidTier(tier: unknown): tier is FidelityTier {
  return typeof tier === "string" && VALID_TIERS.includes(tier as FidelityTier);
}

/**
 * Resolve the fidelity tier for the current session.
 *
 * Priority (highest first):
 *  1. Reduced motion signal → static-premium (safety lock).
 *  2. Explicit override → honoured when safe against native-feature support.
 *  3. Standards-based capability detection.
 *  4. Default → static-premium (safest complete baseline).
 */
export function resolveFidelityTier(
  options: FidelityOptions = {},
): FidelityTier {
  const { reducedMotion, explicitOverride, nativeFeatures } = options;

  // Step 1: reduced motion always forces static-premium (non-travel tier).
  if (reducedMotion) {
    return "static-premium";
  }

  // Step 2: explicit override, gated by native-feature safety.
  if (explicitOverride !== undefined && isValidTier(explicitOverride)) {
    if (explicitOverride === "cinematic") {
      // cinematic needs view transitions; unsupported → restrained fallback.
      if (nativeFeatures?.viewTransitions !== false) {
        return "cinematic";
      }
      return "restrained";
    }
    return explicitOverride;
  }

  // Step 3: standards-based capability detection.
  // Container queries absent → restrained is safer than cinematic.
  if (nativeFeatures?.containerQueries === false) {
    return "restrained";
  }

  // Step 4: reducedMotion explicitly false (user wants motion) → cinematic.
  // No signal at all → static-premium (safest complete baseline).
  if (reducedMotion === false) {
    return "cinematic";
  }
  return "static-premium";
}
