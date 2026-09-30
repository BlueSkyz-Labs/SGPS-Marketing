import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_DOSSIER_URL_ITEMS,
  MAX_DOSSIER_URL_VALUE_CHARS,
  parseDossierUrlState,
} from "../../src/lib/dossier-url-state.ts";

test("ordinary dossier URL state is parsed and deduplicated", () => {
  assert.deepEqual(
    parseDossierUrlState(
      "?items=security-reporting-is-private,ev-security-advisory,security-reporting-is-private",
    ),
    {
      ids: ["security-reporting-is-private", "ev-security-advisory"],
      oversized: false,
    },
  );
});

test("oversized raw selection fails closed without partial acceptance", () => {
  const raw = "a".repeat(MAX_DOSSIER_URL_VALUE_CHARS + 1);
  assert.deepEqual(parseDossierUrlState(`?items=${raw}`), {
    ids: [],
    oversized: true,
  });
});

test("too many comma-separated items fail closed as a whole", () => {
  const raw = Array.from(
    { length: MAX_DOSSIER_URL_ITEMS + 1 },
    (_, index) => `id-${index}`,
  ).join(",");
  assert.deepEqual(parseDossierUrlState(`?items=${raw}`), {
    ids: [],
    oversized: true,
  });
});

test("selector-like and markup-like strings remain inert ids", () => {
  const payloads = [
    'x"] ~ template[data-dossier-entry="security-reporting-is-private',
    "<img src=x onerror=alert(1)>",
    'x\\\\"]',
  ];
  const search = new URLSearchParams({ items: payloads.join(",") }).toString();
  const parsed = parseDossierUrlState(`?${search}`);
  assert.equal(parsed.oversized, false);
  assert.deepEqual(parsed.ids, payloads);
});

test("empty URL state remains the safe default", () => {
  assert.deepEqual(parseDossierUrlState(""), {
    ids: [],
    oversized: false,
  });
  assert.deepEqual(parseDossierUrlState("?items="), {
    ids: [],
    oversized: false,
  });
});
