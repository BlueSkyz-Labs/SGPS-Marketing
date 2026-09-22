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
