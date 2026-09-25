/**
 * C3-D Task 3: fidelity tier resolver — deterministic tests.
 *
 * Contract: resolve a fidelity tier of exactly `static-premium | restrained | cinematic`
 * from explicit preference overrides plus standards-based capability/preference checks.
 *
 * Step 1: reduced motion forces static-premium (non-travel); unsupported native features
 *         must never cause critical content failure.
 * Step 2: the module source must not contain fingerprinting primitives.
 * Step 3: resolver prefers CSS/media queries; JS reads only what it needs locally.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const MODULE_SRC = "src/lib/experience-fidelity.ts";

function readModuleSrc() {
  return readFileSync(MODULE_SRC, "utf8");
}

// ---------------------------------------------------------------------------
// Step 1 — deterministic resolver tests
// ---------------------------------------------------------------------------

test("reduced motion forces static-premium tier", async () => {
  const { resolveFidelityTier } = await loadModule();
  const tier = resolveFidelityTier({ reducedMotion: true });
  assert.equal(
    tier,
    "static-premium",
    "reduced motion must lock to static-premium",
  );
});

test("reduced motion with explicit cinematic override still yields static-premium", async () => {
  const { resolveFidelityTier } = await loadModule();
  const tier = resolveFidelityTier({
    reducedMotion: true,
    explicitOverride: "cinematic",
  });
  assert.equal(
    tier,
    "static-premium",
    "reduced motion overrides any explicit cinematic preference",
  );
});

test("unsupported native feature falls back gracefully, never throws", async () => {
  const { resolveFidelityTier } = await loadModule();
  assert.doesNotThrow(() => {
    resolveFidelityTier({
      nativeFeatures: { viewTransitions: false, containerQueries: false },
    });
  }, "unsupported features must not throw");
});

test("unsupported native feature never yields critical content failure", async () => {
  const { resolveFidelityTier } = await loadModule();
  const tier = resolveFidelityTier({
    nativeFeatures: { viewTransitions: false, containerQueries: false },
  });
  assert.ok(
    ["static-premium", "restrained", "cinematic"].includes(tier),
    "tier must always be one of the three valid values",
  );
});

test("explicit override is respected when no conflicting signal", async () => {
  const { resolveFidelityTier } = await loadModule();
  assert.equal(
    resolveFidelityTier({ explicitOverride: "cinematic" }),
    "cinematic",
    "explicit cinematic override must be honoured",
  );
  assert.equal(
    resolveFidelityTier({ explicitOverride: "restrained" }),
    "restrained",
    "explicit restrained override must be honoured",
  );
  assert.equal(
    resolveFidelityTier({ explicitOverride: "static-premium" }),
    "static-premium",
    "explicit static-premium override must be honoured",
  );
});

test("default tier is static-premium when no signal", async () => {
  const { resolveFidelityTier } = await loadModule();
  const tier = resolveFidelityTier({});
  assert.equal(tier, "static-premium", "default must be the safest tier");
});

// ---------------------------------------------------------------------------
// Step 2 — fingerprinting primitives rejected in source
// ---------------------------------------------------------------------------

test("module contains no canvas fingerprinting", () => {
  const src = readModuleSrc();
  const pattern =
    /getContext\s*\(\s*['"]?2d['"]?\s*\)|canvas\.toDataURL|canvas\.getImageData|canvas\.toBlob/i;
  assert.match(src, /function|=>|const|let|var/); // sanity: file is non-empty
  assert.ok(
    !pattern.test(src),
    "canvas fingerprinting primitives (getContext, toDataURL, getImageData, toBlob) must not exist in module",
  );
});

test("module contains no WebGL renderer inspection", () => {
  const src = readModuleSrc();
  const pattern =
    /getExtension\s*\(\s*['"]?(debug_renderer_info|WEBGL_debug_renderer_info)['"]?\s*\)|unmaskedRenderer|unmaskedVendor|gl\.getParameter\s*\(\s*0x1f/i;
  assert.ok(
    !pattern.test(src),
    "WebGL renderer inspection primitives must not exist in module",
  );
});

test("module contains no audio fingerprinting", () => {
  const src = readModuleSrc();
  const pattern =
    /AudioContext|webkitAudioContext|OscillatorNode|AnalyserNode|createOscillator|createAnalyser/i;
  assert.ok(
    !pattern.test(src),
    "audio fingerprinting primitives must not exist in module",
  );
});

test("module contains no hardware benchmark loops", () => {
  const src = readModuleSrc();
  const pattern =
    /math\.random.*(?:sqrt|pow|sin|cos|tan)|benchmark|performance\s*\.\s*now\s*\(.*(?:loop|iter)/i;
  assert.ok(
    !pattern.test(src),
    "hardware benchmark loop primitives must not exist in module",
  );
});

test("module contains no device identifiers", () => {
  const src = readModuleSrc();
  const pattern =
    /navigator\.\s*(hardwareConcurrency|deviceMemory|platform|userAgent|maxTouchPoints)|vendor/;
  assert.ok(
    !pattern.test(src),
    "device identifier primitives must not exist in module",
  );
});

test("module contains no network transmission", () => {
  const src = readModuleSrc();
  const pattern =
    /fetch\s*\(|XMLHttpRequest|navigator\.\s*sendBeacon|WebSocket/i;
  assert.ok(
    !pattern.test(src),
    "network transmission primitives must not exist in module",
  );
});

// ---------------------------------------------------------------------------
// Step 3 — resolver prefers standards-based signals
// ---------------------------------------------------------------------------

test("resolver prefers prefers-reduced-motion over explicit cinematic preference", async () => {
  const { resolveFidelityTier } = await loadModule();
  const tier = resolveFidelityTier({
    reducedMotion: true,
    explicitOverride: "cinematic",
  });
  assert.equal(tier, "static-premium");
});

test("explicit cinematic override degrades to restrained when view transitions are unsupported", async () => {
  const { resolveFidelityTier } = await loadModule();
  assert.equal(
    resolveFidelityTier({
      explicitOverride: "cinematic",
      nativeFeatures: { viewTransitions: false },
    }),
    "restrained",
    "an unsupported native feature must degrade the override, never break content",
  );
});

test("reduced motion wins over an explicit restrained override too", async () => {
  const { resolveFidelityTier } = await loadModule();
  assert.equal(
    resolveFidelityTier({
      reducedMotion: true,
      explicitOverride: "restrained",
    }),
    "static-premium",
  );
});

test("resolver yields cinematic once motion is welcome and the tier is not overridden", async () => {
  const { resolveFidelityTier } = await loadModule();
  assert.equal(
    resolveFidelityTier({
      reducedMotion: false,
      explicitOverride: undefined,
    }),
    "cinematic",
    "a motion-welcome signal with no override and supported native features yields cinematic",
  );
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function loadModule() {
  const { resolve } = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const mod = await import(pathToFileURL(resolve(MODULE_SRC)).href);
  return mod;
}
