/**
 * C3-A Task 5 — Route Transition Grammar source contract (design S5).
 *
 * The grammar is declarative and lives in two places only: the global sheet
 * decides *how* a navigation transition plays, and one module decides *what*
 * elements are named. This test protects both halves so a later route cannot
 * grow a third mechanism (a route-local name, a literal identity, a second
 * duration source) that the e2e guard would only notice as a silent no-op.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

const GLOBAL_CSS = "src/styles/global.css";
const TRANSITION_MODULE = "src/lib/route-transition.ts";

function collectFiles(root, extensions) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      files.push(...collectFiles(path, extensions));
    } else if (extensions.includes(extname(path))) {
      files.push(path);
    }
  }
  return files;
}

test("the global sheet declares the navigation transition once", () => {
  const css = readFileSync(GLOBAL_CSS, "utf8");

  assert.match(
    css,
    /@view-transition\s*\{[^}]*navigation:\s*auto/,
    "cross-document navigation transitions must be declared, not scripted",
  );
  assert.match(
    css,
    /::view-transition-old\(root\)[\s\S]{0,200}?animation-duration:\s*var\(--motion-continuity-duration\)/,
    "the root cross-fade must take its duration from the continuity token",
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?::view-transition-(?:group|old|new)\(\*\)[\s\S]*?animation:\s*none\s*!important/,
    "reduced motion must stop the transition outright, not shorten it",
  );
});

test("transition identity is owned by one module, never authored inline", () => {
  const sources = collectFiles("src", [".astro", ".ts", ".css"]);

  const literalNames = sources.filter((path) => {
    const source = readFileSync(path, "utf8");
    // A literal ident is `view-transition-name: product-card-x`; a derived one
    // is `view-transition-name: ${...}`.
    return /view-transition-name:\s*(?!\$\{)[a-z]/i.test(source);
  });
  assert.deepEqual(
    literalNames,
    [],
    "a route or component authored a literal view-transition-name instead of deriving it from the shared convention",
  );

  const productConvention = "src/lib/product-transition.ts";
  assert.ok(
    existsSync(productConvention),
    "the product continuity convention must stay the single owner for product surfaces",
  );
});

test("the language pair has one owner and a closed vocabulary", () => {
  assert.ok(
    existsSync(TRANSITION_MODULE),
    "the route transition grammar needs one module that owns its names",
  );
  const module = readFileSync(TRANSITION_MODULE, "utf8");

  assert.match(
    module,
    /export function languageTransitionName\(/,
    "the module must expose the language pair naming rule",
  );
  assert.match(
    module,
    /language-\$\{/,
    "the language name must be derived from the supported language, not typed per call site",
  );
  assert.doesNotMatch(
    module,
    /#[0-9a-f]{3,8}\b/i,
    "the grammar must not author colours",
  );
});
