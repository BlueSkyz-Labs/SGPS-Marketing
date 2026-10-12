/**
 * Owner 2026-10-12 customer-focus decisions:
 *
 * 1. /verify is the one trust door. Collections (/editions), Printable summary
 *    (/dossier) and Compare claims (/decision-room) stay published and
 *    searchable but leave the footer and the product "Next steps" row; the
 *    home no longer carries the "Check what we say" claims band.
 * 2. No public page links to a product's app sign-in. The product record keeps
 *    `appAccess.signInUrl` as product truth.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { getFooterGroups, getFooterLinks } from "../../src/data/site.ts";
import { getJourneyActions } from "../../src/lib/journey.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const OUT_OF_FOOTER = ["editions", "dossier", "decision-room"];

const slugOf = (href) => href.split("/").filter(Boolean)[1] ?? "";

export function footerProblems(groups) {
  const slugs = groups.flatMap((group) =>
    group.links.map((l) => slugOf(l.href)),
  );
  const problems = OUT_OF_FOOTER.filter((slug) => slugs.includes(slug)).map(
    (slug) => `footer links /${slug}/`,
  );
  if (!slugs.includes("verify")) problems.push("footer lost /verify/");
  return problems;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** A rendered link to an app sign-in: the old text link or button shapes. */
export const linksSignIn = (source) =>
  /data-app-signin|href=\{[\w.?]*signInUrl\}|ProductSignInLane/.test(source);

for (const lang of LANGS) {
  test(`${lang}: footer keeps /verify as the one trust door`, () => {
    assert.deepEqual(footerProblems(getFooterGroups(lang)), []);
  });

  test(`${lang}: hidden pages keep their labels for search and breadcrumbs`, () => {
    const hrefs = getFooterLinks(lang).map((l) => l.href);
    for (const slug of ["editions", "dossier"]) {
      assert.ok(hrefs.includes(`/${lang}/${slug}/`), `${lang} ${slug}`);
      assert.ok(existsSync(`src/pages/${lang}/${slug}/index.astro`));
    }
  });

  test(`${lang}: product Next steps lead to /verify, not Compare claims`, () => {
    const hrefs = getJourneyActions(`/${lang}/products/sotro/`, lang).map(
      (a) => a.href,
    );
    assert.ok(hrefs.includes(`/${lang}/verify/`), hrefs.join());
    assert.ok(!hrefs.some((h) => h.includes("/decision-room/")), hrefs.join());
  });

  test(`${lang}: home renders no claims band`, () => {
    const home = readFileSync(`src/pages/${lang}/index.astro`, "utf8");
    assert.doesNotMatch(home, /ProofBand|data-trust-band/);
  });
}

test("negative proof: a footer that re-adds a hidden page or drops /verify fails", () => {
  const groups = getFooterGroups("en");
  const withEditions = [
    ...groups,
    { label: "Evidence", links: [{ label: "x", href: "/en/editions/" }] },
  ];
  assert.equal(footerProblems(withEditions).length, 1);
  const withoutVerify = groups.map((group) => ({
    ...group,
    links: group.links.filter((l) => !l.href.endsWith("/verify/")),
  }));
  assert.equal(footerProblems(withoutVerify).length, 1);
});

test("no public page or component links to an app sign-in", () => {
  const offenders = walk("src")
    .filter((f) => f.endsWith(".astro"))
    .filter((f) => linksSignIn(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
});

test("negative proof: each sign-in link shape is detected", () => {
  for (const snippet of [
    "<a href={data.appAccess.signInUrl} data-app-signin>Sign in</a>",
    '<ButtonLink href={signInUrl} variant="secondary">',
    '<ProductSignInLane lang="en" />',
  ]) {
    assert.ok(linksSignIn(snippet), snippet);
  }
  assert.equal(
    linksSignIn("const showTryCta = !data.appAccess?.signInUrl;"),
    false,
  );
});
