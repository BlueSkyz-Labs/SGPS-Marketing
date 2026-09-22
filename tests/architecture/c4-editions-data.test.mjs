import assert from "node:assert/strict";
import test from "node:test";
import { EDITIONS, getEdition } from "../../src/data/editions.ts";
import { resolveEdition } from "../../src/lib/editions.ts";

const LANGS = ["en", "vi", "zh"];
const TODAY = new Date().toISOString().slice(0, 10);

test("C4-B editions data: every authored edition is publicly resolvable", () => {
  assert.ok(EDITIONS.length > 0, "the collected edition must ship at least one edition");
  for (const edition of EDITIONS) {
    for (const lang of LANGS) {
      const resolved = resolveEdition(edition, lang);
      assert.deepEqual(
        resolved.unresolved,
        [],
        `${edition.id} (${lang}) must not ship an unresolvable source`,
      );
      assert.ok(resolved.sources.length > 0, `${edition.id} (${lang}) must resolve sources`);
      for (const source of resolved.sources) {
        assert.ok(source.href.length > 0, `${edition.id} source needs a canonical destination`);
      }
    }
  }
});

test("C4-B editions data: ids are unique and lookup works", () => {
  const ids = EDITIONS.map((edition) => edition.id);
  assert.equal(new Set(ids).size, ids.length, "edition ids must be unique");
  for (const id of ids) {
    assert.equal(getEdition(id)?.id, id);
  }
  assert.equal(getEdition("no-such-edition"), undefined);
});

test("C4-B editions data: no duplicated source inside one edition", () => {
  for (const edition of EDITIONS) {
    const keys = edition.sources.map((source) => `${source.kind}:${source.id}`);
    assert.equal(new Set(keys).size, keys.length, `${edition.id} repeats a source`);
  }
});

test("C4-B editions data: authored metadata is complete for both languages", () => {
  for (const edition of EDITIONS) {
    assert.match(edition.published, /^\d{4}-\d{2}-\d{2}$/, `${edition.id} needs an ISO date`);
    assert.ok(edition.published <= TODAY, `${edition.id} cannot be published in the future`);
    for (const field of ["title", "deck", "note"] as const) {
      const value = edition[field];
      assert.ok(value, `${edition.id} needs ${field}`);
      for (const lang of LANGS) {
        assert.ok(
          (value[lang] ?? "").trim().length > 0,
          `${edition.id}.${field}.${lang} must be authored`,
        );
      }
    }
  }
});
