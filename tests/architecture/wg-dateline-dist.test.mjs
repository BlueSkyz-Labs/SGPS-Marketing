import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { formatDate } from "../../src/lib/i18n.ts";
import {
  datelineProblems,
  NEGATIVE_FIXTURES,
  QUIET_FIXTURE,
  routeLang,
  scanDist,
} from "../lib/dateline-dist-scan.mjs";

/**
 * Wave G2 dist-level backstop for wg-dateline-single-role.test.mjs. Local runs
 * with a build get the full scan; without `dist/` this reports an explicit
 * skip (never a silent pass). CI runs the same scan from
 * tests/e2e/wg-dateline-dist.spec.ts, where `dist/` exists and its absence
 * fails.
 */
const DIST = join(new URL("../../", import.meta.url).pathname, "dist");

test("WG-02 dist: no visible ISO date and every dateline matches its route language", (t) => {
  const result = scanDist(DIST, formatDate);
  if (!result) {
    t.skip("SKIPPED: dist/ is absent; run `pnpm build` first (not a PASS)");
    return;
  }
  assert.ok(result.pages > 50, `scanned ${result.pages} pages`);
  assert.ok(result.datelines > 0, "at least one rendered dateline");
  assert.deepEqual(result.problems, []);
});

test("WG-02 dist negative proof: a visible ISO date or a wrong-locale dateline fails", () => {
  const { visibleIso, wrongLocale } = NEGATIVE_FIXTURES;
  const a = datelineProblems(visibleIso.path, visibleIso.html, formatDate);
  console.log(`NEGATIVE PROOF (dist visible ISO): FAIL -> ${a.join(" | ")}`);
  assert.equal(a.length, 1);
  assert.deepEqual(
    datelineProblems("/en/x/index.html", QUIET_FIXTURE, formatDate),
    [],
  );
  const b = datelineProblems(wrongLocale.path, wrongLocale.html, formatDate);
  console.log(`NEGATIVE PROOF (dist wrong locale): FAIL -> ${b.join(" | ")}`);
  assert.equal(b.length, 1);
  assert.deepEqual(
    datelineProblems("/en/x/index.html", wrongLocale.html, formatDate),
    [],
  );
  assert.equal(routeLang("/index.html"), "en");
  assert.equal(routeLang("/zh-hant/about/index.html"), "zh-hant");
});
