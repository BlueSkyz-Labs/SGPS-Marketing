import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildDecisionItems } from "../../src/lib/decision-room.ts";
import {
  ATELIER_CONSTRAINTS,
  ATELIER_GOALS,
  ATELIER_REASON_KEYS,
  arrangeDecisionItems,
} from "../../src/lib/decision-atelier.ts";

/**
 * C4-E Task 1 + 2 — Decision Atelier contract.
 *
 * Freezes the Decision Room invariants the atelier must not break: one source
 * model, no second registry, no grading, no network or storage. Then pins the
 * arrangement vocabulary and proves the ranking scanner is not vacuous.
 */

const SRC = readFileSync(
  new URL("../../src/lib/decision-atelier.ts", import.meta.url),
  "utf8",
);

// The invariant is about code, not prose: strip comments before scanning so the
// module may still document what it refuses to do.
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const ITEMS = buildDecisionItems([]);

const BANNED_WORDS = [
  "score",
  "rank",
  "weight",
  "winner",
  "priority",
  "sorted",
  "best-match",
];

const BANNED_PRIMITIVES = [
  "fetch(",
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "document.cookie",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "navigator.geolocation",
  "import(",
];

test("the atelier reuses the Decision Room model instead of a second registry", () => {
  assert.match(
    SRC,
    /from "\.\/decision-room\.ts"/,
    "must import the Decision Room model",
  );
  for (const forbidden of [
    "../data/claims.ts",
    "../data/trust-ledger.ts",
    "product-routes.ts",
    "../data/integrity.ts",
  ]) {
    assert.ok(
      !SRC.includes(forbidden),
      `must not reach around the source model (${forbidden})`,
    );
  }
});

test("no ranking or grading vocabulary is introduced, and the scanner is not vacuous", () => {
  for (const word of BANNED_WORDS) {
    assert.ok(
      !new RegExp(String.raw`\b${word}`, "i").test(CODE),
      `must not introduce "${word}"`,
    );
  }
  // non-vacuity: the same scanner must catch a synthetic violation
  const synthetic =
    "export function scoreItems(items) { return items.map((i) => i.weight); }";
  for (const word of ["score", "weight"]) {
    assert.ok(
      new RegExp(String.raw`\b${word}`, "i").test(synthetic),
      `scanner must detect a synthetic ${word} field`,
    );
  }
});

test("no network or storage primitive is introduced", () => {
  for (const primitive of BANNED_PRIMITIVES) {
    assert.ok(!CODE.includes(primitive), `must not introduce ${primitive}`);
  }
  // non-vacuity: the primitive scanner catches a synthetic violation too
  assert.ok(
    BANNED_PRIMITIVES.some((primitive) =>
      "await fetch(url)".includes(primitive),
    ),
  );
});

test("only allowlisted goals and constraints are accepted", () => {
  assert.deepEqual(
    [...ATELIER_GOALS],
    ["explore", "evaluate", "verify", "architecture", "work-with-blueskyz"],
  );
  assert.deepEqual(
    [...ATELIER_CONSTRAINTS],
    ["technical", "trust", "availability"],
  );

  for (const goal of ATELIER_GOALS) {
    const result = arrangeDecisionItems(ITEMS, { goal });
    assert.equal(result.goal, goal);
    assert.equal(result.complete, true, `${goal} is allowlisted`);
  }

  for (const bad of [
    "",
    "best",
    "recommend-me",
    "<script>alert(1)</script>",
    "0; DROP TABLE",
  ]) {
    const result = arrangeDecisionItems(ITEMS, { goal: bad });
    assert.equal(result.goal, null, `"${bad}" must be rejected`);
    assert.equal(result.complete, false);
    assert.deepEqual(result.groups, [], "a rejected goal arranges nothing");
    assert.deepEqual(
      result.rejected,
      [bad],
      "the rejection is reported, not swallowed",
    );
  }
});

test("unknown constraints are rejected and never narrow anything silently", () => {
  const result = arrangeDecisionItems(ITEMS, {
    goal: "evaluate",
    constraints: ["technical", "vibes", "trust"],
  });
  assert.deepEqual(result.constraints, ["technical", "trust"]);
  assert.deepEqual(result.rejected, ["vibes"]);
  assert.equal(result.complete, false);
});

test("arrangement preserves source identity and source order", () => {
  const result = arrangeDecisionItems(ITEMS, { goal: "explore" });
  assert.ok(
    result.groups.length > 0,
    "explore must publish at least one group",
  );

  const sourceOrder = ITEMS.map((item) => item.id);
  for (const group of result.groups) {
    const groupIds = group.items.map((item) => item.id);
    for (const item of group.items) {
      // the same objects, not copies: identity is how a caller traces provenance
      assert.ok(
        ITEMS.some((source) => source === item),
        "items must be the very objects handed in",
      );
    }
    const sortedBySource = [...groupIds].sort(
      (a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b),
    );
    assert.deepEqual(
      groupIds,
      sortedBySource,
      `${group.id} must keep source order (an item may appear in more than one group)`,
    );
  }
});

test("constraints narrow by declared kind only", () => {
  const technical = arrangeDecisionItems(ITEMS, {
    goal: "explore",
    constraints: ["technical"],
  });
  for (const group of technical.groups) {
    for (const item of group.items) {
      assert.ok(
        item.kind === "claim" || item.kind === "product",
        "the technical constraint admits claims and products only",
      );
    }
  }

  const trust = arrangeDecisionItems(ITEMS, {
    goal: "architecture",
    constraints: ["trust"],
  });
  for (const group of trust.groups) {
    for (const item of group.items) {
      assert.equal(item.kind, "trust");
    }
  }
});

test("the arrangement carries no score, rank or ordering-by-quality field", () => {
  const result = arrangeDecisionItems(ITEMS, { goal: "verify" });
  assert.deepEqual(Object.keys(result).sort(), [
    "complete",
    "constraints",
    "goal",
    "groups",
    "rejected",
  ]);
  for (const group of result.groups) {
    // the allowed shape is explicit: a declared reason key joined it, no score did
    assert.deepEqual(Object.keys(group).sort(), ["id", "items", "reason"]);
  }
});

test("arrangement is deterministic", () => {
  const first = arrangeDecisionItems(ITEMS, {
    goal: "evaluate",
    constraints: ["trust"],
  });
  const second = arrangeDecisionItems(ITEMS, {
    goal: "evaluate",
    constraints: ["trust"],
  });
  assert.deepEqual(
    first.groups.map((group) => [group.id, group.items.map((item) => item.id)]),
    second.groups.map((group) => [
      group.id,
      group.items.map((item) => item.id),
    ]),
  );
});

test("every group states why it matched, using only the declared reason vocabulary", () => {
  assert.deepEqual(
    [...ATELIER_REASON_KEYS],
    [
      "in-scope",
      "carries-source",
      "states-limits",
      "trust-surface",
      "product-fact",
    ],
  );
  let published = 0;
  for (const goal of ATELIER_GOALS) {
    const result = arrangeDecisionItems(ITEMS, { goal });
    published += result.groups.length;
    // a goal may legitimately match nothing in a given item set (no products here)
    for (const group of result.groups) {
      assert.ok(
        ATELIER_REASON_KEYS.includes(group.reason),
        `${group.id} must carry a declared reason key, got ${group.reason}`,
      );
    }
  }
  assert.ok(
    published > 0,
    "the declared goals must publish groups for this item set",
  );
});

test("the arrangement cannot emit prose: a reason is a key, never a sentence", () => {
  // The module produces keys only, so no assurance wording can originate here.
  const result = arrangeDecisionItems(ITEMS, { goal: "evaluate" });
  for (const group of result.groups) {
    assert.equal(typeof group.reason, "string");
    assert.ok(
      !/\s/.test(group.reason),
      `reason "${group.reason}" must be a single key`,
    );
    assert.ok(group.reason.length <= 24, "a key is short; a sentence is not");
  }
  // non-vacuity: the same check rejects a sentence
  assert.ok(
    /\s/.test("this product is the best choice"),
    "sentence detector must work",
  );
});

test("reason keys are declared per group and never derived from item content", () => {
  // Two different item sets with the same goal must yield the same reason keys:
  // the reason describes the matching dimension, not the item's merits.
  const first = arrangeDecisionItems(ITEMS, { goal: "explore" });
  const second = arrangeDecisionItems([...ITEMS].reverse(), {
    goal: "explore",
  });
  assert.deepEqual(
    first.groups.map((group) => [group.id, group.reason]),
    second.groups.map((group) => [group.id, group.reason]),
  );
});
