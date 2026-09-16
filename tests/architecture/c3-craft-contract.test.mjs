/**
 * C3-A Task 1 — Experience Craft Foundation boundary contract.
 *
 * The first C3 runtime wave must extend C2 through one focused craft layer,
 * not by creating route-local motion systems, a second brand palette, or a
 * second transition identity mechanism. This test intentionally lands before
 * the implementation so CI proves RED for the missing shared boundary.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

const RUNTIME_ENTRY = "src/layouts/BaseLayout.astro";
const CRAFT_CSS = "src/styles/c3-craft.css";
const CRAFT_IMPORT = /import\s+"@\/styles\/c3-craft\.css";/g;

const ROLE_CONTRACTS = [
  ["--c3-image-surface-radius", "var(--radius-card)"],
  ["--c3-image-surface-border", "var(--border-subtle)"],
  ["--c3-image-surface-background", "var(--surface-primary)"],
  ["--c3-route-transition-duration", "var(--motion-continuity-duration)"],
  ["--c3-route-transition-ease", "var(--motion-ease-standard)"],
  ["--c3-interaction-duration", "var(--motion-confirmation-duration)"],
  ["--c3-interaction-ease", "var(--motion-ease-standard)"],
  ["--c3-interaction-distance", "var(--motion-distance-sm)"],
];

function collectFiles(root, extension) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      files.push(...collectFiles(path, extension));
    } else if (extname(path) === extension) {
      files.push(path);
    }
  }
  return files;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function craftSource() {
  return existsSync(CRAFT_CSS) ? readFileSync(CRAFT_CSS, "utf8") : "";
}

test("C3 craft has one focused stylesheet imported by the runtime layout entry", () => {
  assert.ok(
    existsSync(CRAFT_CSS),
    `${CRAFT_CSS} must exist before C3 runtime craft work begins`,
  );
  const runtimeEntry = readFileSync(RUNTIME_ENTRY, "utf8");
  assert.equal(
    (runtimeEntry.match(CRAFT_IMPORT) ?? []).length,
    1,
    "BaseLayout.astro must import the focused C3 craft layer exactly once",
  );
});

test("image, route-transition, and interaction roles alias existing semantic tokens", () => {
  const css = craftSource();
  for (const [role, value] of ROLE_CONTRACTS) {
    assert.match(
      css,
      new RegExp(`${escapeRegExp(role)}:\\s*${escapeRegExp(value)}`),
      `${role} must alias ${value}`,
    );
  }

  assert.doesNotMatch(
    css,
    /#[0-9a-f]{3,8}\b/i,
    "C3 craft must consume semantic color tokens instead of authoring a second palette",
  );
  assert.doesNotMatch(
    css,
    /@keyframes\b/,
    "Task 1 establishes grammar only; route animation keyframes do not belong here",
  );
  assert.doesNotMatch(
    css,
    /view-transition-name\s*:/,
    "view-transition identity remains owned by the existing product-transition convention",
  );
});

test("each C3 craft role has exactly one declaration across src/styles", () => {
  const styleSources = collectFiles("src/styles", ".css").map((path) => [
    path,
    readFileSync(path, "utf8"),
  ]);

  for (const [role] of ROLE_CONTRACTS) {
    const declaration = new RegExp(`${escapeRegExp(role)}:`);
    const owners = styleSources.filter(([, source]) =>
      declaration.test(source),
    );
    assert.equal(
      owners.length,
      1,
      `${role} must have one owner, found: ${owners.map(([path]) => path).join(", ") || "none"}`,
    );
  }
});

test("route-local Astro surfaces do not define duplicate keyframe grammars", () => {
  const astroFiles = [
    ...collectFiles("src/pages", ".astro"),
    ...collectFiles("src/components", ".astro"),
  ];
  const offenders = astroFiles.filter((path) =>
    /@keyframes\b/.test(readFileSync(path, "utf8")),
  );
  assert.deepEqual(
    offenders,
    [],
    `route-local keyframes duplicate the shared craft grammar: ${offenders.join(", ")}`,
  );
});
