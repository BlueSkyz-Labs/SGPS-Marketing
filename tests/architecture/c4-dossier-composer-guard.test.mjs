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
const URL_STATE = "src/lib/dossier-url-state.ts";

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

test("the composer reads only allowlisted public ids from the URL", () => {
  const source = readFileSync(MODULE, "utf8");
  assert.match(
    source,
    /parseDossierUrlState/,
    "attacker-controlled query state must pass through the bounded parser",
  );
  assert.match(
    source,
    /item\.textContent/,
    "rejected URL state must remain text-only",
  );
  // URL parsing lives in a small pure module; the DOM composer only consumes
  // its bounded result.
  const urlState = readFileSync(URL_STATE, "utf8");
  assert.match(
    urlState,
    /URLSearchParams/,
    "selection must be parsed from URLSearchParams",
  );
  assert.match(
    urlState,
    /MAX_DOSSIER_URL_VALUE_CHARS/,
    "raw query value must be length-bounded before DOM rendering",
  );
  assert.match(
    urlState,
    /MAX_DOSSIER_URL_ITEMS/,
    "query token count must be bounded before DOM rendering",
  );
  assert.doesNotMatch(
    source + urlState,
    /history\.(pushState|replaceState)/,
    "dossier URL state is read-only and must never rewrite navigation state",
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
