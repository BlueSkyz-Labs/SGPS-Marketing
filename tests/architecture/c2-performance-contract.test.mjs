/**
 * C2 Lane E — performance contract (repaired + hardened).
 *
 * Guard intent (preserved from the C2 draft): the C2 cinematic layer must not
 * buy its spectacle from a runtime UI/animation/3D framework. Concretely:
 *
 *   1. the dependency inventory declares none of the banned runtime libraries;
 *   2. C2-authored source files introduce no such import and no WebGL runtime;
 *   3. the client-JS hard ceiling in scripts/check-client-budget.mjs is pinned
 *      and may never be raised by C2 (owner decision only).
 *
 * Repo conventions: node:test + node:assert/strict, ESM only, paths are
 * relative to the repository root (never process.cwd() joins or
 * new URL("../..", import.meta.url), which break inside git worktrees).
 * Every detector is exported so the non-vacuity tests below can feed it a
 * synthetic offending input and prove it actually fires.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// ---------------------------------------------------------------------------
// Detectors (exported: the non-vacuity tests call them directly).
// ---------------------------------------------------------------------------

/**
 * Runtime libraries the C2 lane must never adopt. Scoped packages are matched
 * by prefix, so `three/examples/jsm/...` and `@react-three/fiber` both hit.
 */
const BANNED_RUNTIME_PACKAGES = [
  "react",
  "react-dom",
  "preact",
  "vue",
  "@vue",
  "svelte",
  "@sveltejs",
  "solid-js",
  "gsap",
  "@gsap",
  "three",
  "@react-three",
  "framer-motion",
  "motion",
  "animejs",
  "lottie-web",
  "@lottiefiles",
  "p5",
  "babylonjs",
  "@babylonjs",
  "ogl",
  "regl",
  "twgl.js",
  "@tresjs",
  "tres",
  "zdog",
  "aframe",
  "pixi.js",
  "@pixi",
];

const IMPORT_SPECIFIER_PATTERNS = [
  // import ... from "specifier"
  /\bimport\s+[\s\S]*?\bfrom\s*["']([^"']+)["']/g,
  // import("specifier")
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  // side-effect import "specifier"
  /\bimport\s+["']([^"']+)["']/g,
  // require("specifier")
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
];

const WEBGL_RUNTIME_PATTERNS = [
  /getContext\s*\(\s*["'](?:webgl2?|experimental-webgl)["']/i,
  /\bWebGLRenderer\b/,
  /\bnew\s+THREE\./,
];

/** True when `name` is a banned package (exact name or scoped sub-path). */
export function isBannedRuntimePackage(name) {
  const value = String(name).toLowerCase();
  return BANNED_RUNTIME_PACKAGES.some(
    (banned) =>
      value === banned ||
      value.startsWith(`${banned}/`) ||
      value.startsWith(`@${banned}/`),
  );
}

/** Every banned runtime library declared in a package.json object. */
export function findBannedFrameworkDeps(pkg) {
  const found = [];
  for (const section of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    for (const name of Object.keys(pkg?.[section] ?? {})) {
      if (isBannedRuntimePackage(name)) {
        found.push(`${section}:${name}`);
      }
    }
  }
  return found.sort();
}

/** Banned framework specifiers imported anywhere in a source text. */
export function findBannedFrameworkImports(content) {
  const specifiers = new Set();
  for (const pattern of IMPORT_SPECIFIER_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]) specifiers.add(match[1]);
    }
  }
  return [...specifiers].filter(isBannedRuntimePackage).sort();
}

/** True when a source text opens a WebGL runtime context or renderer. */
export function detectWebGLRuntime(content) {
  return WEBGL_RUNTIME_PATTERNS.some((pattern) => pattern.test(content));
}

// ---------------------------------------------------------------------------
// Scan helpers — paths are repository-root relative, missing paths are skipped
// so a C2 directory that does not exist yet cannot break the guard.
// ---------------------------------------------------------------------------

const C2_SOURCE_ROOTS = [
  "src/components/product",
  "src/components/experience",
  "src/components/sections",
  "src/components/integrity",
  "src/components/layout",
  "src/components/ui",
  "src/layouts",
  "src/pages",
  "src/lib",
  "src/scripts",
];

const SOURCE_EXTENSIONS = [
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
];

/** Forward-slash paths so assertions are separator-independent. */
const toPosix = (path) => path.replaceAll("\\", "/");

function listFiles(root) {
  if (!existsSync(root)) return [];
  const entries = readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = toPosix(join(root, entry.name));
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function listC2SourceFiles() {
  return [
    ...new Set(C2_SOURCE_ROOTS.flatMap((root) => listFiles(root))),
  ].sort();
}

// ---------------------------------------------------------------------------
// Guard 1 — dependency inventory declares no banned runtime library.
// ---------------------------------------------------------------------------

test("dependency inventory declares no banned runtime framework", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const offending = findBannedFrameworkDeps(pkg);
  assert.deepEqual(
    offending,
    [],
    `C2 must not add React/Vue/Svelte/GSAP/Three/WebGL runtime dependencies: ${offending.join(", ")}`,
  );
});

// ---------------------------------------------------------------------------
// Guard 2 — C2-authored source introduces no banned import and no WebGL runtime.
// ---------------------------------------------------------------------------

test("C2 source files import no banned framework and no WebGL runtime", () => {
  const files = listC2SourceFiles();
  assert.ok(files.length > 0, "expected C2 source surfaces to scan");

  const importOffenders = [];
  const webglOffenders = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const specifier of findBannedFrameworkImports(content)) {
      importOffenders.push(`${file}: ${specifier}`);
    }
    if (detectWebGLRuntime(content)) {
      webglOffenders.push(file);
    }
  }

  assert.deepEqual(
    importOffenders,
    [],
    `C2 source must not import a spectacle runtime framework: ${importOffenders.join(", ")}`,
  );
  assert.deepEqual(
    webglOffenders,
    [],
    `C2 source must not open a WebGL/3D runtime: ${webglOffenders.join(", ")}`,
  );
});

test("the C2 scan is anchored on the cinematic surfaces that exist today", () => {
  const files = listC2SourceFiles();
  for (const anchor of [
    "src/components/experience/HorizonField.astro",
    "src/components/product/ProductCard.astro",
    "src/components/sections/Hero.astro",
  ]) {
    assert.ok(
      files.includes(anchor),
      `${anchor} is a C2 surface and must be under scan`,
    );
  }
});

// ---------------------------------------------------------------------------
// Guard 3 — client-JS hard ceiling is pinned (owner decision only).
// ---------------------------------------------------------------------------

const BUDGET_SCRIPT = "scripts/check-client-budget.mjs";

// Pinned ceiling. Raising CLIENT_JS_HARD_BUDGET_BYTES is an owner decision with
// an ADR behind it; the C2 lane may never raise it, only stay under it.
const PINNED_CLIENT_JS_HARD_BUDGET_BYTES = 120_000;

test("client-JS hard budget ceiling is pinned and has not been raised", () => {
  const source = readFileSync(BUDGET_SCRIPT, "utf8");
  const match = source.match(
    /export\s+const\s+CLIENT_JS_HARD_BUDGET_BYTES\s*=\s*([0-9_]+)\s*;/,
  );
  assert.ok(
    match,
    "scripts/check-client-budget.mjs must export a literal CLIENT_JS_HARD_BUDGET_BYTES ceiling",
  );
  const ceiling = Number(match[1].replaceAll("_", ""));
  assert.equal(
    ceiling,
    PINNED_CLIENT_JS_HARD_BUDGET_BYTES,
    `client-JS ceiling moved off the pinned value (${PINNED_CLIENT_JS_HARD_BUDGET_BYTES}); only an Owner decision may change it`,
  );
});

// ---------------------------------------------------------------------------
// Non-vacuity proofs — the detectors fire on synthetic offending input and do
// NOT fire on legitimate consumption. If a detector is broken these fail.
// ---------------------------------------------------------------------------

test("non-vacuity: the framework-import detector catches a fake import (source)", () => {
  assert.deepEqual(findBannedFrameworkImports('import gsap from "gsap";'), [
    "gsap",
  ]);
  assert.deepEqual(
    findBannedFrameworkImports('import * as THREE from "three";'),
    ["three"],
  );
  assert.deepEqual(
    findBannedFrameworkImports('import { Canvas } from "@react-three/fiber";'),
    ["@react-three/fiber"],
  );
  assert.deepEqual(
    findBannedFrameworkImports('const { gsap } = await import("gsap");'),
    ["gsap"],
  );
  assert.deepEqual(
    findBannedFrameworkImports('const svelte = require("@sveltejs/kit");'),
    ["@sveltejs/kit"],
  );
  // Negative control: canonical consumption must stay clean.
  assert.deepEqual(
    findBannedFrameworkImports(
      'import { getPublicProducts } from "@/lib/products";\nimport type { CollectionEntry } from "astro:content";\n',
    ),
    [],
    "the detector must not flag canonical repo imports",
  );
});

test("non-vacuity: the framework-dependency detector catches a fake dependency", () => {
  assert.deepEqual(
    findBannedFrameworkDeps({ dependencies: { gsap: "^3.12.0" } }),
    ["dependencies:gsap"],
  );
  assert.deepEqual(
    findBannedFrameworkDeps({
      devDependencies: { "@react-three/drei": "^9.0.0", prettier: "^3.3.3" },
    }),
    ["devDependencies:@react-three/drei"],
  );
  // Negative control: the real inventory shape stays clean.
  assert.deepEqual(
    findBannedFrameworkDeps({ dependencies: { astro: "^7.3.2" } }),
    [],
  );
});

test("non-vacuity: the WebGL detector catches a fake WebGL runtime", () => {
  assert.equal(detectWebGLRuntime('canvas.getContext("webgl2");'), true);
  assert.equal(
    detectWebGLRuntime("renderer = new THREE.WebGLRenderer();"),
    true,
  );
  assert.equal(
    detectWebGLRuntime('<div class="horizon-field" data-horizon></div>'),
    false,
    "the detector must not flag pure CSS/DOM decoration",
  );
});
