import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { formatDate } from "../../src/lib/i18n";
// @ts-expect-error plain .mjs helper shared with the architecture test
import * as scan from "../lib/dateline-dist-scan.mjs";

/**
 * Wave G2 dist backstop at the point where `dist/` exists in CI (Browser
 * Assurance builds before Playwright). Node-side only, no browser. Unlike the
 * architecture twin, a missing `dist/` FAILS here: it is never a silent pass.
 */
const DIST = join(process.cwd(), "dist");

test.describe("dist backstop", () => {
  test("no visible ISO date and every dateline matches its route language", () => {
    test.setTimeout(120_000); // the full-dist scan took ~25 s under load
    const result = scan.scanDist(DIST, formatDate);
    expect(result, "dist/ must exist: run `pnpm build` first").not.toBeNull();
    expect(result.pages).toBeGreaterThan(50);
    expect(result.datelines).toBeGreaterThan(0);
    expect(result.problems).toEqual([]);
  });

  test("negative proof: a visible ISO date or a wrong-locale dateline fails the scan", () => {
    const { visibleIso, wrongLocale } = scan.NEGATIVE_FIXTURES;
    const a = scan.datelineProblems(
      visibleIso.path,
      visibleIso.html,
      formatDate,
    );
    console.log(`NEGATIVE PROOF (e2e visible ISO): FAIL -> ${a.join(" | ")}`);
    expect(a).toHaveLength(1);
    expect(
      scan.datelineProblems("/en/x/index.html", scan.QUIET_FIXTURE, formatDate),
    ).toEqual([]);
    const b = scan.datelineProblems(
      wrongLocale.path,
      wrongLocale.html,
      formatDate,
    );
    console.log(`NEGATIVE PROOF (e2e wrong locale): FAIL -> ${b.join(" | ")}`);
    expect(b).toHaveLength(1);
  });

  test("negative proof: a missing dist/ is reported, not treated as clean", () => {
    expect(scan.scanDist(join(DIST, "__absent__"), formatDate)).toBeNull();
  });
});
