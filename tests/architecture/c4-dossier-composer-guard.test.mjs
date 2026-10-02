/**
 * C4-C Task 2 — the dossier composer is local-only.
 *
 * Selection and presentation are ephemeral: the composer may not transmit
 * anything (no fetch/XHR/beacon/WebSocket/EventSource), may not persist anything
 * (no cookies, local/session storage, IndexedDB) and may not pull remote code.
 * This guard runs before the browser flow tests because a network or storage
 * call is exactly the failure the C4-C doctrine forbids.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const MODULE = "src/scripts/dossier-composer.ts";

const FORBIDDEN = [
  ["fetch(", "network request"],
  ["XMLHttpRequest", "network request"],
  ["sendBeacon", "network beacon"],
  ["new WebSocket", "socket"],
  ["EventSource", "stream"],
  ["document.cookie", "cookie access"],
  ["localStorage", "persistent storage"],
  ["sessionStorage", "persistent storage"],
  ["indexedDB", "persistent storage"],
  ["navigator.geolocation", "device probe"],
  ["import(", "dynamic import"],
];

test("the composer module exists", () => {
  assert.ok(existsSync(MODULE), `${MODULE} must exist`);
});

test("the composer never transmits, persists or loads remote code", () => {
  const source = readFileSync(MODULE, "utf8");
  for (const [needle, why] of FORBIDDEN) {
    assert.equal(
      source.includes(needle),
      false,
      `${MODULE} must not use ${needle} (${why})`,
    );
  }
  // imports must be local: no http(s), protocol-relative or CDN specifiers
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  assert.ok(imports.length > 0, "the composer must import its view model");
  for (const specifier of imports) {
    assert.equal(
      /^(https?:)?\/\//.test(specifier),
      false,
      `remote script import is forbidden: ${specifier}`,
    );
  }
});

test("the composer reads URL state only through the bounded parser", () => {
  const source = readFileSync(MODULE, "utf8");
  const parser = readFileSync("src/lib/dossier-url-state.ts", "utf8");

  assert.match(
    source,
    /parseDossierSearch\(window\.location\.search,\s*SELECTION_PARAM\)/,
    "composer must delegate URL-carried state to the bounded parser",
  );
  assert.doesNotMatch(
    source,
    /new URLSearchParams\(/,
    "composer must not bypass the bounded URL-state parser",
  );
  assert.match(
    parser,
    /if \(search\.length > DOSSIER_QUERY_MAX_LENGTH\)/,
    "whole-query length must be checked before URLSearchParams",
  );
  assert.match(
    parser,
    /new URLSearchParams\(search\)/,
    "bounded parser must be the URLSearchParams boundary",
  );
  // v7 B-06: the URL is written, but only through the bounded writer in the
  // library - never by the composer itself, and never with pushState.
  assert.equal(
    /history\./.test(source),
    false,
    "composer must not touch history directly; it delegates to the bounded writer",
  );
  assert.match(source, /writeSelectionToUrl\(window,\s*SELECTION_PARAM/);
  assert.match(parser, /history\.replaceState\(/);
  assert.equal(
    /pushState|location\.(assign|replace|href)/.test(parser),
    false,
    "the writer is replaceState-only: no new history entry, no navigation",
  );
  assert.match(
    parser,
    /parseDossierSearch\(search,\s*selectionParam\)/,
    "the writer must verify its output through the bounded parser",
  );
});

test("the composer module declares no remote destinations of its own", () => {
  const source = readFileSync(MODULE, "utf8");
  const urls = [...source.matchAll(/https?:\/\/[^\s"'`)]+/g)].map(
    (match) => match[0],
  );
  assert.deepEqual(
    urls,
    [],
    "destinations must come from canonical data, not the composer",
  );
});
