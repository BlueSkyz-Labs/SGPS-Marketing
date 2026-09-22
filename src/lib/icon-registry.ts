/**
 * C4-A S7 — BlueSkyz Line Icon Grammar.
 *
 * One bounded, allowlisted icon set sharing a single geometry and stroke
 * grammar. Icons are added only when a live control materially needs one; this
 * is not a speculative icon library. Every path is authored on the same 24-unit
 * grid so icons never need per-use scaling hacks.
 */

export interface IconDefinition {
  /** Single-geometry stroke paths on the shared grid. */
  paths: readonly string[];
}

/** The one grammar every C4 icon is drawn with. */
export const ICON_GRAMMAR = Object.freeze({
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
});

export const ICON_REGISTRY: Readonly<Record<string, IconDefinition>> =
  Object.freeze({
    "arrow-right": Object.freeze({
      paths: Object.freeze(["M5 12h14", "M13 6l6 6-6 6"]),
    }),
    "chevron-down": Object.freeze({ paths: Object.freeze(["M6 9l6 6 6-6"]) }),
    check: Object.freeze({ paths: Object.freeze(["M5 13l4 4 10-10"]) }),
    close: Object.freeze({
      paths: Object.freeze(["M6 6l12 12", "M18 6 6 18"]),
    }),
    external: Object.freeze({
      paths: Object.freeze(["M14 5h5v5", "M19 5l-8 8", "M18 14v5H5V6h5"]),
    }),
  });

export type IconName = keyof typeof ICON_REGISTRY;

export function getIcon(name: string): IconDefinition | undefined {
  return ICON_REGISTRY[name];
}

export function iconNames(): string[] {
  return Object.keys(ICON_REGISTRY);
}

export function hasIcon(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(ICON_REGISTRY, name);
}
