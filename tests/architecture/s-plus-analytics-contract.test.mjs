import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const analytics = readFileSync("src/lib/analytics.ts", "utf8");
const bridge = readFileSync("src/scripts/analytics-bridge.ts", "utf8");
const analyticsModuleUrl = new URL(
  "../../src/lib/analytics.ts",
  import.meta.url,
);
const { sanitizeAnalyticsEvent } = await import(analyticsModuleUrl);

const EXPECTED_EVENTS = [
  "intent_selected",
  "trust_route_opened",
  "journey_action_opened",
  "command_navigator_opened",
  "command_result_opened",
  "atlas_node_opened",
];

test("analytics taxonomy is exactly the approved event set", () => {
  const block =
    analytics.match(/ANALYTICS_EVENTS[^[]*\[([\s\S]*?)\]/)?.[1] ?? "";
  const names = [...block.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual([...names].sort(), [...EXPECTED_EVENTS].sort());
});

test("analytics property allowlist excludes free text and personal data", () => {
  const block =
    analytics.match(/ALLOWED_PROPERTIES[\s\S]*?=\s*\{([\s\S]*?)\n\};/)?.[1] ??
    "";
  for (const forbidden of [
    "query",
    "text",
    "search",
    "email",
    "ip",
    "body",
    "payload",
    "value",
  ]) {
    assert.ok(
      !new RegExp(`"${forbidden}"`).test(block),
      `property "${forbidden}" must not be collectable`,
    );
  }
});

test("analytics performs no transmission and stores nothing", () => {
  for (const forbidden of [
    "fetch(",
    "XMLHttpRequest",
    "sendBeacon",
    "localStorage",
    "sessionStorage",
    "document.cookie",
    "indexedDB",
  ]) {
    assert.ok(
      !analytics.includes(forbidden),
      `analytics must not use ${forbidden}`,
    );
    assert.ok(!bridge.includes(forbidden), `bridge must not use ${forbidden}`);
  }
});

test("analytics emission is fail-safe (guarded try/catch)", () => {
  assert.match(analytics, /try\s*\{/);
  assert.match(analytics, /catch\s*\{/);
  assert.match(analytics, /DEDUPE_WINDOW_MS/);
});

test("intent telemetry rejects values outside the declared intent vocabulary", () => {
  for (const intent of [
    "profile-visitor<script>alert(1)</script>",
    "?intent=verify-trust",
  ]) {
    assert.equal(
      sanitizeAnalyticsEvent("intent_selected", { intent }),
      null,
      `${intent} must not enter the intent_selected taxonomy`,
    );
  }
});

test("intent telemetry accepts a declared experience intent", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent("intent_selected", { intent: "verify-trust" }),
    { name: "intent_selected", properties: { intent: "verify-trust" } },
  );
});

test("categorical dimension values cannot carry free text or raw URL data", () => {
  const invalidCases = [
    ["trust_route_opened", { surface: "privacy?email=x" }],
    ["journey_action_opened", { kind: "route", destination: "products?x" }],
    ["journey_action_opened", { destination: "https://other.test/" }],
    ["command_result_opened", { kind: "private search query" }],
    ["atlas_node_opened", { kind: "product<script>" }],
    ["trust_route_opened", { surface: "x".repeat(65) }],
    ["atlas_node_opened", { kind: 123 }],
  ];
  for (const [name, properties] of invalidCases) {
    assert.equal(sanitizeAnalyticsEvent(name, properties), null);
  }
});

test("first-party categories survive and extra property names are discarded", () => {
  const event = sanitizeAnalyticsEvent("journey_action_opened", {
    kind: "route",
    destination: "products",
    email: "private@example.com",
  });
  assert.equal(event?.properties.kind, "route");
  assert.equal(event?.properties.destination, "products");
  assert.equal(Object.hasOwn(event?.properties ?? {}, "email"), false);
  assert.equal(
    sanitizeAnalyticsEvent("trust_route_opened", { surface: "privacy" })
      ?.properties.surface,
    "privacy",
  );
  assert.equal(
    sanitizeAnalyticsEvent("command_result_opened", { kind: "route" })
      ?.properties.kind,
    "route",
  );
  assert.equal(
    sanitizeAnalyticsEvent("atlas_node_opened", { kind: "product" })?.properties
      .kind,
    "product",
  );
});

test("journey telemetry never derives the destination from raw href", () => {
  assert.match(bridge, /closest\("\[data-step-key\]"\)/);
  assert.doesNotMatch(bridge, /journeyLink\.getAttribute\("href"\)/);
});
