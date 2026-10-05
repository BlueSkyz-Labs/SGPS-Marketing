import assert from "node:assert/strict";
import test from "node:test";
import {
  DOSSIER_ITEM_MAX_LENGTH,
  DOSSIER_ITEMS_MAX_COUNT,
  DOSSIER_ITEMS_MAX_RAW_LENGTH,
  DOSSIER_QUERY_MAX_LENGTH,
  buildSelectionSearch,
  parseDossierSearch,
  parseDossierSelection,
} from "../../src/lib/dossier-url-state.ts";

test("normal selection trims and deduplicates without reordering", () => {
  assert.deepEqual(parseDossierSelection(" alpha, beta,alpha ,, beta "), {
    status: "ok",
    ids: ["alpha", "beta"],
    reason: null,
  });
});

test("negative proof: oversized raw items fail closed with no partial ids", () => {
  const result = parseDossierSelection(
    "a".repeat(DOSSIER_ITEMS_MAX_RAW_LENGTH + 1),
  );
  assert.deepEqual(result, {
    status: "rejected",
    ids: [],
    reason: "items-too-long",
  });
});

test("negative proof: too many comma tokens fail closed before DOM work", () => {
  const raw = Array.from(
    { length: DOSSIER_ITEMS_MAX_COUNT + 1 },
    (_, index) => `item-${index}`,
  ).join(",");
  const result = parseDossierSelection(raw);
  assert.deepEqual(result, {
    status: "rejected",
    ids: [],
    reason: "too-many-items",
  });
});

test("negative proof: one oversized token rejects the whole request", () => {
  const result = parseDossierSelection(
    `valid,${"x".repeat(DOSSIER_ITEM_MAX_LENGTH + 1)}`,
  );
  assert.deepEqual(result, {
    status: "rejected",
    ids: [],
    reason: "item-too-long",
  });
});

test("negative proof: oversized whole query is rejected before URLSearchParams", () => {
  const result = parseDossierSearch(
    "?" + "x".repeat(DOSSIER_QUERY_MAX_LENGTH + 1),
  );
  assert.deepEqual(result, {
    status: "rejected",
    ids: [],
    reason: "query-too-long",
  });
});

test("quote/backslash/selector-like values remain inert ids at parser boundary", () => {
  const payload = String.raw`";][data-x=evil]\\foo`;
  assert.deepEqual(parseDossierSelection(payload), {
    status: "ok",
    ids: [payload],
    reason: null,
  });
});

test("write-back round-trips through the bounded parser and keeps other params", () => {
  const search = buildSelectionSearch("?goal=verify", "items", [
    "a",
    "b:c",
    "d",
  ]);
  assert.ok(search);
  assert.equal(new URLSearchParams(search).get("goal"), "verify");
  assert.deepEqual(parseDossierSearch(search, "items"), {
    status: "ok",
    ids: ["a", "b:c", "d"],
    reason: null,
  });
  assert.equal(buildSelectionSearch("?items=a", "items", []), "");
});

test("negative proof: write-back refuses anything the parser would reject or alter", () => {
  const tooMany = Array.from(
    { length: DOSSIER_ITEMS_MAX_COUNT + 1 },
    (_, i) => `i${i}`,
  );
  assert.equal(buildSelectionSearch("", "items", tooMany), null);
  assert.equal(
    buildSelectionSearch("", "items", [
      "x".repeat(DOSSIER_ITEM_MAX_LENGTH + 1),
    ]),
    null,
  );
  // a comma inside an id would split on read-back, so it is never written
  assert.equal(buildSelectionSearch("", "items", ["a,b"]), null);
  assert.equal(
    buildSelectionSearch("?" + "x".repeat(DOSSIER_QUERY_MAX_LENGTH), "items", [
      "a",
    ]),
    null,
  );
});
