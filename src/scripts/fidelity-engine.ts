/**
 * C3-D Task 4 — Fidelity Engine client entry.
 *
 * Reads the resolver, detects native features, sets the presentation
 * tier attribute on <html>.  Enhancement-only: never creates or mutates
 * product, claim, evidence, lifecycle, assurance or release state.
 */
import { resolveFidelityTier } from "@/lib/experience-fidelity";

function detectNativeFeatures(): {
  viewTransitions?: boolean;
  containerQueries?: boolean;
  prefersReducedMotion?: boolean;
} {
  // View Transitions API: check both standard and prefixed.
  const viewTransitions =
    typeof document !== "undefined" && "startViewTransition" in document;

  // Container Queries: check CSS.supports.
  const containerQueries =
    typeof CSS !== "undefined" &&
    CSS.supports?.("container-type: inline-size") === true;

  // Reduced motion preference.
  const prefersReducedMotion =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  return { viewTransitions, containerQueries, prefersReducedMotion };
}

export function initFidelityEngine(): void {
  const features = detectNativeFeatures();
  const reducedMotion = features.prefersReducedMotion;
  const nativeFeatures: import("@/lib/experience-fidelity").NativeFeatures = {
    ...(features.viewTransitions !== undefined
      ? { viewTransitions: features.viewTransitions }
      : {}),
    ...(features.containerQueries !== undefined
      ? { containerQueries: features.containerQueries }
      : {}),
  };
  const tier = resolveFidelityTier({
    ...(reducedMotion !== undefined ? { reducedMotion } : {}),
    ...(features.viewTransitions !== undefined ||
    features.containerQueries !== undefined
      ? { nativeFeatures }
      : {}),
  });
  document.documentElement.setAttribute("data-fidelity-tier", tier);
}

// Run on load; idempotent — re-running only re-sets the same attribute.
initFidelityEngine();
