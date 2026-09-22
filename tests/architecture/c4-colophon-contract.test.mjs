import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * C4-A S6 — Signature Colophon contract (fail-closed).
 *
 * The footer colophon is a public surface: it may state identity, language and
 * approved public routes, and nothing else. Anything that leaks internal
 * machinery, private evidence, or claims stronger assurance than we hold is a
 * contract violation, not a style choice.
 */
const FOOTER = "src/components/layout/Footer.astro";
const C4 = "src/styles/c4-quiet-authority.css";
const footer = readFileSync(FOOTER, "utf8");

const FORBIDDEN = [
  { label: "git SHA", re: /\b[0-9a-f]{7,40}\b/ },
  {
    label: "internal repo path",
    re: /\.github\/|\.worktrees\/|docs\/superpowers\//,
  },
  {
    label: "workflow / CI name",
    re: /\bQuality Gates\b|\bBrowser Assurance\b|Source Assurance/i,
  },
  {
    label: "private evidence handle",
    re: /private evidence|internal evidence|evidence\/\d{4}-/i,
  },
  {
    label: "blanket assurance language",
    re: /\bguaranteed\b|\bcertified\b|\bfully secure\b|\b100% (?:secure|safe)\b/i,
  },
  {
    label: "invented review date",
    re: /(?:reviewed|audited|verified)\s+(?:on\s+)?\d{4}-\d{2}-\d{2}/i,
  },
];

test("C4 colophon: no forbidden public leakage", () => {
  for (const { label, re } of FORBIDDEN) {
    assert.doesNotMatch(footer, re, `colophon must not expose ${label}`);
  }
});

test("C4 colophon: is marked and styled from the C4 role layer", () => {
  assert.match(footer, /data-c4-colophon/, "colophon must be identifiable");
  assert.match(
    readFileSync(C4, "utf8"),
    /\.c4-colophon/,
    "colophon must use a C4 role",
  );
});

test("C4 colophon: reuses approved route helpers instead of duplicating labels", () => {
  assert.match(
    footer,
    /getFooterLinks/,
    "colophon must consume the approved footer link helper",
  );
  assert.doesNotMatch(
    footer,
    /href="\/en\/(?:security|privacy|architecture)\/"/,
    "colophon must not hard-code public route labels",
  );
});

test("C4 colophon: states no freshness claim it cannot support", () => {
  assert.doesNotMatch(
    footer,
    /\b(?:last updated|released|built on)\b\s*:?\s*\d/i,
    "colophon must not invent freshness context",
  );
});
