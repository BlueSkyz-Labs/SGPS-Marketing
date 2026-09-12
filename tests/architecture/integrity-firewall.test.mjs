/**
 * v3 G10 — integrity regression firewall contract.
 * RED fixtures for all ten drift classes; the real repository state must
 * pass; the CLI must be deterministic and never auto-fix.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import {
  DRIFT_CLASSES,
  runFirewall,
} from "../../scripts/check-integrity-firewall.mjs";
import { CLAIMS } from "../../src/data/claims.ts";

const REAL_SEO = readFileSync("src/lib/seo.ts", "utf8");
const REAL_ANALYTICS = readFileSync("src/lib/analytics.ts", "utf8");
const REAL_BRIDGE = readFileSync("src/scripts/analytics-bridge.ts", "utf8");

const fakeRead = (overrides) => (path) => {
  if (overrides[path] !== undefined) return overrides[path];
  if (path === "src/lib/seo.ts") return REAL_SEO;
  if (path === "src/lib/analytics.ts") return REAL_ANALYTICS;
  if (path === "src/scripts/analytics-bridge.ts") return REAL_BRIDGE;
  return "";
};

const classesIn = (failures) => new Set(failures.map((failure) => failure.cls));

test("the real repository passes all ten drift classes", () => {
  const failures = runFirewall();
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
});

test("RED: duplicate claim ids are detected", () => {
  const failures = runFirewall({ claims: [CLAIMS[0], CLAIMS[0]] });
  assert.ok(classesIn(failures).has("claim-id-integrity"));
});

test("RED: unknown evidence references are detected", () => {
  const failures = runFirewall({
    claims: [{ ...CLAIMS[0], evidenceIds: ["ev-unknown"] }],
  });
  assert.ok(classesIn(failures).has("unknown-evidence"));
});

test("RED: product claim resolvability drift is detected", () => {
  const productClaim = CLAIMS.find((claim) => claim.kind === "product");
  assert.ok(productClaim);
  // Non-empty registry with a claim that cannot resolve is drift.
  const failures = runFirewall({
    claims: [{ ...productClaim, evidenceIds: ["ev-missing"] }],
    products: [{ slug: "real", name: "Real" }],
  });
  assert.ok(classesIn(failures).has("product-claim-resolvability"));
});

test("RED: EN/VI route parity drift is detected", () => {
  const broken = REAL_SEO.replace('"/vi/security/",', "");
  const failures = runFirewall({
    read: fakeRead({ "src/lib/seo.ts": broken }),
  });
  assert.ok(classesIn(failures).has("locale-parity"));
});

test("RED: bare locale paths in shared components are detected", () => {
  const failures = runFirewall({
    list: (dir) =>
      dir.endsWith("components") ? ["src/components/Fake.astro"] : [],
    read: fakeRead({
      "src/components/Fake.astro": '<a href="/en/products/">Products</a>',
    }),
  });
  assert.ok(classesIn(failures).has("bare-locale-path"));
});

test("RED: forbidden scoring or verification language is detected", () => {
  const failures = runFirewall({
    read: fakeRead({
      "src/data/claims.ts": 'const x = "trust score";',
    }),
  });
  assert.ok(classesIn(failures).has("forbidden-language"));
});

test("RED: generated review dates are detected", () => {
  const failures = runFirewall({
    read: fakeRead({
      "src/data/integrity.ts": "const reviewedOn = new Date().toISOString();",
    }),
  });
  assert.ok(classesIn(failures).has("generated-review-date"));
});

test("RED: manifest divergence is detected", () => {
  const failures = runFirewall({
    manifest: () => ({ claims: [{ id: "ghost-claim" }] }),
  });
  assert.ok(classesIn(failures).has("manifest-divergence"));
});

test("RED: telemetry allowlists accepting hostile properties are detected", () => {
  const brokenAnalytics = REAL_ANALYTICS.replace(
    'command_result_opened: ["kind"],',
    'command_result_opened: ["kind", "query"],',
  );
  const failures = runFirewall({
    read: fakeRead({
      "src/lib/analytics.ts": brokenAnalytics,
      "src/scripts/analytics-bridge.ts": "fetch('/collect', {});",
    }),
  });
  const found = classesIn(failures);
  assert.ok(found.has("telemetry-allowlist"));
});

test("RED: evidence links to unknown destinations are detected", () => {
  const failures = runFirewall({
    claims: [{ ...CLAIMS[0], evidenceIds: ["ev-bad-dest"] }],
    evidence: new Map([
      [
        "ev-bad-dest",
        {
          id: "ev-bad-dest",
          kind: "route",
          href: { en: "/en/internal-only/", vi: "/vi/internal-only/" },
          label: { en: "X", vi: "X" },
        },
      ],
    ]),
  });
  assert.ok(classesIn(failures).has("evidence-destination"));
});

test("all ten drift classes are declared", () => {
  assert.equal(DRIFT_CLASSES.length, 10);
});

test("the CLI is deterministic and never auto-fixes", () => {
  const before = readFileSync("src/data/claims.ts", "utf8");
  const first = spawnSync("node", ["scripts/check-integrity-firewall.mjs"], {
    encoding: "utf8",
  });
  const second = spawnSync("node", ["scripts/check-integrity-firewall.mjs"], {
    encoding: "utf8",
  });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(first.stdout, second.stdout);
  assert.match(first.stdout, /Integrity firewall: PASS/);
  assert.equal(readFileSync("src/data/claims.ts", "utf8"), before);
});

test("the firewall module performs no network or mutation", () => {
  const source = readFileSync("scripts/check-integrity-firewall.mjs", "utf8");
  // Invocation signatures only — the module legitimately embeds detection
  // regexes (e.g. /fetch\(/) for the bridge check itself.
  assert.doesNotMatch(
    source,
    /fetch\(["'`]|sendBeacon\(|writeFileSync|rmSync|unlinkSync/,
  );
});
