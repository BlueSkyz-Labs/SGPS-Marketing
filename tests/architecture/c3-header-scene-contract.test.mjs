/**
 * C3-A Task 4 — scene-marker contract for the global header (design S4).
 *
 * The header adapts contrast/density per *authored* scene. That is only safe if
 * the scene vocabulary has exactly one source, the marker actually reaches the
 * rendered header, and every declared scene has a style variant - otherwise a
 * page can claim a scene the stylesheet has never heard of.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const SCENE_SOURCE = "src/lib/scene.ts";
const HEADER = "src/components/layout/Header.astro";
const LAYOUT = "src/layouts/BaseLayout.astro";
const CRAFT_CSS = "src/styles/c3-craft.css";

test("the scene vocabulary has exactly one source", () => {
  const source = read(SCENE_SOURCE);
  assert.match(
    source,
    /export const SCENES = \["ink", "porcelain", "product"\] as const;/,
    "SCENES must declare the authored scene vocabulary",
  );
  assert.match(source, /export type Scene = \(typeof SCENES\)\[number\];/);
  assert.match(
    source,
    /export const DEFAULT_SCENE: Scene = "porcelain";/,
    "the default scene must be explicit",
  );
});

test("the layout forwards the scene and the header renders it", () => {
  const layout = read(LAYOUT);
  assert.match(
    layout,
    /scene\?: Scene;/,
    "BaseLayout must accept an authored scene prop",
  );
  assert.match(
    layout,
    /<Header scene=\{scene\} \/>/,
    "BaseLayout must forward the scene to the header",
  );

  const header = read(HEADER);
  assert.match(
    header,
    /import \{ DEFAULT_SCENE, lockupSurface, type Scene \} from "@\/lib\/scene";/,
    "the header must consume the shared scene vocabulary",
  );
  assert.match(
    header,
    /data-scene=\{scene\}/,
    "the header must render the authored scene marker",
  );
  assert.doesNotMatch(
    header,
    /scene\s*=\s*"(ink|porcelain|product)"/,
    "the header must not hardcode a scene instead of consuming the prop",
  );
});

test("every scene has a style variant and no scene authors a raw palette", () => {
  const css = read(CRAFT_CSS);
  for (const scene of ["ink", "product"]) {
    assert.match(
      css,
      new RegExp(`header\\[data-scene="${scene}"\\]`),
      `the craft layer must define the ${scene} header variant`,
    );
  }
  assert.doesNotMatch(
    css,
    /#[0-9a-f]{3,8}\b/i,
    "scene variants must re-point semantic tokens instead of authoring hex colours",
  );
});

test("the sticky header surface is authored in the craft layer, not in a dropped utility", () => {
  const header = read(HEADER);
  assert.match(
    header,
    /class="header-glass border-b/,
    "the header must carry the shared glass surface class",
  );
  assert.doesNotMatch(
    header,
    /\[border-bottom-color:/,
    "an arbitrary border-bottom-color variant carrying a nested :where()/@media never compiles; the hairline must be authored in the craft layer",
  );

  const css = read(CRAFT_CSS);
  assert.match(
    css,
    /\.header-glass\s*\{[^}]*position:\s*sticky/,
    "header-glass must stick to the top of the viewport",
  );
  assert.match(
    css,
    /\.header-glass\s*\{[^}]*backdrop-filter:\s*blur\(12px\)/,
    "header-glass must frost the surface behind it",
  );
  assert.match(
    css,
    /\.header-glass\s*\{[^}]*border-bottom-color:/,
    "the specular hairline must be declared on the glass surface itself",
  );
  assert.match(
    css,
    /\[data-theme="light"\]\s*\.header-glass\s*\{[^}]*border-bottom-color:/,
    "the light theme must declare its own hairline colour",
  );
  assert.match(
    css,
    /\.header-glass\s*\{[^}]*background-color:\s*var\(--surface-primary-glass\)/,
    "the frosted surface must derive from the scene token, not a hard-coded theme colour",
  );
  assert.match(
    css,
    /header\[data-scene="ink"\]\s*\{[^}]*--surface-primary-glass:/,
    "the ink scene must re-point the glass token alongside its surface token, or porcelain text lands on a porcelain surface",
  );
  assert.match(
    css,
    /@media\s*\(forced-colors:\s*active\)\s*\{[^}]*\.header-glass\s*\{[^}]*border-bottom-color:\s*CanvasText/,
    "forced-colors mode must keep the hairline visible",
  );
});

// The compact menu panel lives inside the header. The hero is an isolated
// stacking context later in the DOM, so a non-positioned header at compact
// widths let the hero paint and hit-test above the open panel (Firefox).
export const headerStacksAboveMain = (css) => {
  const base = css.match(/(?:^|\n)\.header-glass\s*\{([^}]*)\}/);
  if (!base) return false;
  const z = base[1].match(/z-index:\s*(\d+)/);
  return (
    /position:\s*(relative|sticky)/.test(base[1]) &&
    Boolean(z && Number(z[1]) > 0)
  );
};

test("the header is a positioned stacking context at every width", () => {
  assert.equal(
    headerStacksAboveMain(read(CRAFT_CSS)),
    true,
    "the base .header-glass rule (outside any media query) must set position and a positive z-index",
  );
});

test("negative proof: a base header rule without position/z-index is rejected", () => {
  assert.equal(
    headerStacksAboveMain(".header-glass {\n  background-color: red;\n}"),
    false,
  );
  assert.equal(
    headerStacksAboveMain(".header-glass {\n  position: relative;\n}"),
    false,
  );
  assert.equal(
    headerStacksAboveMain(
      ".header-glass {\n  position: relative;\n  z-index: 50;\n}",
    ),
    true,
  );
});
