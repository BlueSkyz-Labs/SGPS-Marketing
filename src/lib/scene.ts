/**
 * C3-A Task 4 — authored scene markers for the global header (design S4).
 *
 * The header adapts contrast/density to the *authored* scene of the page it
 * renders on. Scenes are declared by the page, never inferred from scroll
 * position, pathname shape or runtime measurement, so the static/no-JS and
 * reduced-motion states stay authoritative and CSS alone can express the
 * contract.
 *
 * Navigation labels, order, semantics and focus visibility are scene-invariant.
 */
export const SCENES = ["ink", "porcelain", "product"] as const;

export type Scene = (typeof SCENES)[number];

/** Pages that declare no scene render the default porcelain header. */
export const DEFAULT_SCENE: Scene = "porcelain";

/** The brand lockup polarity a scene needs. */
export function lockupSurface(scene: Scene): "ink" | "porcelain" {
  return scene === "ink" ? "ink" : "porcelain";
}
