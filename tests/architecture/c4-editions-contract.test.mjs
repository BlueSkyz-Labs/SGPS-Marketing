import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { CLAIMS, EVIDENCE_INDEX } from "../../src/data/claims.ts";
import { describeEdition, resolveEdition } from "../../src/lib/editions.ts";

const ADAPTER = "src/lib/editions.ts";
const LANGS = ["en", "vi"];
const firstEvidence = [...EVIDENCE_INDEX.keys()][0];
const firstClaim = CLAIMS[0];

function editionWith(sources) {
  return {
    id: "edition-test",
    title: { en: "Collected Edition", vi: "Tuyển tập" },
    deck: { en: "A curated selection.", vi: "Tuyển chọn có chủ đích." },
    note: { en: "Editorial note.", vi: "Ghi chú biên tập." },
    published: "2026-09-23",
    sources,
  };
}

test("C4-B editions: resolves a real public evidence reference", () => {
  assert.ok(firstEvidence, "canonical evidence index must not be empty");
  const resolved = resolveEdition(
    editionWith([{ kind: "evidence", id: firstEvidence }]),
    "en",
  );
  assert.equal(resolved.unresolved.length, 0);
  assert.equal(resolved.sources.length, 1);
  assert.equal(resolved.sources[0].id, firstEvidence);
  assert.ok(
    resolved.sources[0].label.length > 0,
    "label comes from canonical truth",
  );
});

test("C4-B editions: unresolved references fail closed", () => {
  const edition = editionWith([
    { kind: "evidence", id: "ev-does-not-exist" },
    { kind: "claim", id: "claim-does-not-exist" },
  ]);
  for (const lang of LANGS) {
    const resolved = resolveEdition(edition, lang);
    assert.deepEqual(
      resolved.sources,
      [],
      `${lang} publishes nothing unresolvable`,
    );
    assert.equal(resolved.unresolved.length, 2);
    const described = describeEdition(edition, lang);
    assert.equal(described.resolvedSources, 0);
    assert.equal(described.unresolvedSources, 2);
  }
});

test("C4-B editions: every published destination is canonical, never invented", () => {
  const canonical = new Set(
    [...EVIDENCE_INDEX.values()].flatMap((entry) => [
      entry.href.en,
      entry.href.vi,
    ]),
  );
  const sources = [
    { kind: "evidence", id: firstEvidence },
    ...(firstClaim ? [{ kind: "claim", id: firstClaim.id }] : []),
  ];
  for (const lang of LANGS) {
    for (const source of resolveEdition(editionWith(sources), lang).sources) {
      assert.ok(
        canonical.has(source.href),
        `${source.kind}:${source.id} href must come from the canonical index (got ${source.href})`,
      );
    }
  }
});

test("C4-B editions: localized fields exist for every language", () => {
  const resolved = resolveEdition(
    editionWith([{ kind: "evidence", id: firstEvidence }]),
    "vi",
  );
  assert.equal(resolved.title, "Tuyển tập");
  assert.equal(resolved.deck, "Tuyển chọn có chủ đích.");
  assert.equal(resolved.note, "Ghi chú biên tập.");
  assert.match(resolved.published, /^\d{4}-\d{2}-\d{2}$/);
});

test("C4-B editions: the schema owns no route literals", () => {
  const adapter = readFileSync(ADAPTER, "utf8");
  const literals = adapter.match(/["'`]\/[a-z]{2}\//g) ?? [];
  assert.deepEqual(
    literals,
    [],
    "destinations must be read from canonical evidence hrefs",
  );
});
