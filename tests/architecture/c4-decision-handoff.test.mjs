import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  HANDOFF_PARAM,
  planDossierHandoff,
} from "../../src/lib/decision-handoff.ts";
import { CLAIMS } from "../../src/data/claims.ts";
import { compilePublicDossier } from "../../src/lib/dossier.ts";

const SOURCE = readFileSync(
  path.join(import.meta.dirname, "../../src/lib/decision-handoff.ts"),
  "utf8",
);

/**
 * Claims the product really publishes. The compiler is request-driven — it never
 * returns a default set — so the test names ids from the canonical catalog and
 * first proves each one is actually composable.
 */
function publishedClaimIds(limit = 3) {
  const ids = CLAIMS.map((claim) => claim.id).slice(0, limit);
  for (const id of ids) {
    const compiled = compilePublicDossier({ lang: "en", claimIds: [id] });
    assert.equal(
      compiled.entries.length,
      1,
      `${id} must be a composable public claim`,
    );
    assert.equal(compiled.entries[0].id, id);
  }
  return ids;
}

test("an empty selection has no destination at all", () => {
  const plan = planDossierHandoff([], "en");
  assert.equal(
    plan.href,
    null,
    "nothing ticked must not fabricate a default set",
  );
  assert.deepEqual(plan.itemIds, []);
  assert.deepEqual(plan.rejected, []);
});

test("only explicitly selected claim items transfer", () => {
  const [first] = publishedClaimIds();
  const plan = planDossierHandoff([`claim:${first}`], "en");
  assert.equal(plan.itemIds.length, 1);
  assert.equal(plan.itemIds[0], first);
  assert.equal(plan.href, `/en/dossier/?${HANDOFF_PARAM}=${first}`);
  assert.equal(plan.rejected.length, 0);
});

test("the parameter matches the composer contract and the link stays same-origin", () => {
  assert.equal(HANDOFF_PARAM, "items");
  const [first] = publishedClaimIds();
  const href = planDossierHandoff([`claim:${first}`], "vi").href ?? "";
  assert.ok(href.startsWith("/vi/dossier/?"), "a relative same-origin path");
  assert.ok(
    !href.includes("//"),
    "no absolute or protocol-relative destination",
  );
  assert.ok(!/^[a-z]+:/i.test(href), "no scheme");
});

test("an unpublished id fails closed and is reported, never silently included", () => {
  const plan = planDossierHandoff(["claim:this-claim-does-not-exist"], "en");
  assert.equal(plan.href, null);
  assert.deepEqual(plan.itemIds, []);
  assert.deepEqual(plan.rejected, [
    { id: "claim:this-claim-does-not-exist", reason: "not-public" },
  ]);
});

test("items that name no composable public id are reported, not dropped", () => {
  const plan = planDossierHandoff(
    ["trust:security", "product:placeholder", "  "],
    "en",
  );
  assert.equal(plan.href, null);
  assert.deepEqual(plan.rejected, [
    { id: "trust:security", reason: "not-composable" },
    { id: "product:placeholder", reason: "not-composable" },
  ]);
});

test("a repeated selection is reported as a duplicate and composed once", () => {
  const [first] = publishedClaimIds();
  const plan = planDossierHandoff([`claim:${first}`, `claim:${first}`], "en");
  assert.equal(plan.itemIds.length, 1);
  assert.deepEqual(plan.rejected, [
    { id: `claim:${first}`, reason: "duplicate" },
  ]);
});

test("the destination follows canonical order, not the order they were ticked", () => {
  const ids = publishedClaimIds(3);
  assert.ok(ids.length >= 2, "need at least two published claims");
  const forward = planDossierHandoff(
    ids.map((id) => `claim:${id}`),
    "en",
  );
  const reverse = planDossierHandoff(
    [...ids].reverse().map((id) => `claim:${id}`),
    "en",
  );
  assert.deepEqual(forward.itemIds, reverse.itemIds);
  assert.equal(
    forward.href,
    reverse.href,
    "the tick order must not change the destination",
  );
});

test("the plan is deterministic across calls", () => {
  const [first] = publishedClaimIds();
  assert.deepEqual(
    planDossierHandoff([`claim:${first}`], "zh"),
    planDossierHandoff([`claim:${first}`], "zh"),
  );
});

test("a mixed selection keeps the valid ids and reports the rest", () => {
  const [first] = publishedClaimIds();
  const plan = planDossierHandoff(
    [`claim:${first}`, "claim:nope", "trust:x"],
    "en",
  );
  assert.deepEqual(plan.itemIds, [first]);
  assert.equal(plan.href, `/en/dossier/?${HANDOFF_PARAM}=${first}`);
  assert.equal(plan.rejected.length, 2);
});

test("the handoff introduces no network, storage or timing primitive", () => {
  const code = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(
    /(^|\s)\/\/.*$/gm,
    "",
  );
  for (const term of [
    "fetch(",
    "XMLHttpRequest",
    "localStorage",
    "sessionStorage",
    "document.cookie",
    "indexedDB",
    "setTimeout",
    "location.href",
  ]) {
    assert.ok(!code.includes(term), `the handoff must not use ${term}`);
  }
  // non-vacuity: the same scan rejects a source that does
  assert.ok(["fetch("].some((term) => `const x = fetch("/a")`.includes(term)));
});
