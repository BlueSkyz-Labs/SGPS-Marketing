/**
 * C4-A S4 — Luxury Density Budget.
 *
 * Deterministic counters and conservative ceilings for how much competes for
 * attention inside one scene. This is a budget check, never a subjective
 * "luxury score": every value is countable from the DOM and every ceiling is a
 * plain integer, so a scene either exceeds its budget or it does not.
 *
 * Ceilings start from measured production density and may only be tightened
 * deliberately — never raised to make a busy scene pass.
 */

export interface SceneDensity {
  /** Simultaneous primary actions (one decision per scene). */
  primaryActions: number;
  /** Chips / status objects competing with the scene's message. */
  chips: number;
  /** Focal media regions claiming the eye at once. */
  focalMedia: number;
  /** Peer card groups presented as equals. */
  cardGroups: number;
  /** Motion hooks running at the same time. */
  motionHooks: number;
}

export const DENSITY_CEILINGS: Readonly<SceneDensity> = Object.freeze({
  primaryActions: 1,
  chips: 6,
  focalMedia: 1,
  cardGroups: 1,
  motionHooks: 2,
});

export type DensityKey = keyof SceneDensity;

export interface DensityViolation {
  key: DensityKey;
  count: number;
  ceiling: number;
}

export interface DensityReport {
  ok: boolean;
  scene: SceneDensity;
  violations: DensityViolation[];
}

const KEYS: DensityKey[] = [
  "primaryActions",
  "chips",
  "focalMedia",
  "cardGroups",
  "motionHooks",
];

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

/** Normalises a partial (or hostile) scene description into counted values. */
export function measureDensity(scene: Partial<SceneDensity>): SceneDensity {
  const measured = {} as SceneDensity;
  for (const key of KEYS) measured[key] = count(scene?.[key]);
  return measured;
}

/** Evaluates a scene against the budget. Pure: same input, same verdict. */
export function evaluateDensity(scene: Partial<SceneDensity>): DensityReport {
  const measured = measureDensity(scene);
  const violations: DensityViolation[] = [];
  for (const key of KEYS) {
    const ceiling = DENSITY_CEILINGS[key];
    if (measured[key] > ceiling)
      violations.push({ key, count: measured[key], ceiling });
  }
  return { ok: violations.length === 0, scene: measured, violations };
}

/** Human-readable one-liner for evidence logs; never a score. */
export function describeDensity(report: DensityReport): string {
  if (report.ok) return "density budget: within ceilings";
  return (
    "density budget exceeded: " +
    report.violations.map((v) => `${v.key} ${v.count}/${v.ceiling}`).join(", ")
  );
}
