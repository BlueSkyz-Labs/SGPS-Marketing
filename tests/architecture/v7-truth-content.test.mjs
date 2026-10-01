/**
 * v7 truth and content contract (W4). Every guard is a pure predicate that is
 * run on the real source and then on an intentionally broken copy (negative
 * proof). Rendered behaviour is measured in tests/e2e/v7-truth-content.spec.ts.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { SITE, BRAND_TAGLINE } from "../../src/data/site.ts";
import { TRUST_LEDGER } from "../../src/data/trust-ledger.ts";
import { CLAIMS, claimShortLabel } from "../../src/data/claims.ts";
import {
  formatDisplayDate,
  DISPLAY_DATE_LOCALES,
} from "../../src/lib/display-date.ts";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(astro|ts|mjs|yaml|json)$/.test(name)) out.push(path);
  }
  return out;
}
const SRC_FILES = walk("src");

/* ------------------------------------------------------------------ */
/* D-01 — the ledger may not call Support "available" without a mailbox */
/* ------------------------------------------------------------------ */

const OVERCLAIM =
  /working help|real routes|recourse|khắc phục|有效的(帮助|協助)|补救|補救/i;
const MAILBOX_ABSENT_WORDING = {
  en: /No general support mailbox has been published yet/,
  vi: /chưa có hộp thư hỗ trợ chung/,
  zh: /尚未公布通用支持邮箱/,
  "zh-hant": /尚未公布通用支援信箱/,
};

/** Support lane truth: a missing mailbox can never be "available". */
function supportLedgerIsTruthful(entry, hasMailbox) {
  if (hasMailbox) return true;
  if (entry.state === "available") return false;
  return LOCALES.every(
    (lang) =>
      MAILBOX_ABSENT_WORDING[lang].test(entry.summary[lang]) &&
      !OVERCLAIM.test(entry.summary[lang]),
  );
}

test("D-01: the Support ledger lane matches the absent support mailbox", () => {
  const support = TRUST_LEDGER.find((entry) => entry.id === "support");
  assert.ok(support);
  assert.equal(
    Boolean(SITE.contactEmail),
    false,
    "the default build publishes no general support mailbox",
  );
  assert.ok(supportLedgerIsTruthful(support, Boolean(SITE.contactEmail)));
  assert.equal(support.state, "not-published");
});

test("D-01 negative proof: the old overclaim fails the guard", () => {
  const support = TRUST_LEDGER.find((entry) => entry.id === "support");
  assert.equal(
    supportLedgerIsTruthful({ ...support, state: "available" }, false),
    false,
    "an 'available' state without a mailbox must fail",
  );
  assert.equal(
    supportLedgerIsTruthful(
      {
        ...support,
        summary: {
          ...support.summary,
          en: "Working help and recourse paths — real routes, not slogans.",
        },
      },
      false,
    ),
    false,
    "the retired EN summary must fail",
  );
  assert.equal(
    supportLedgerIsTruthful(
      {
        ...support,
        summary: { ...support.summary, "zh-hant": "提供有效的協助與求助途徑" },
      },
      false,
    ),
    false,
    "a retired zh-hant summary must fail",
  );
  // With a mailbox the guard does not apply (the /support page states it).
  assert.ok(supportLedgerIsTruthful({ ...support, state: "available" }, true));
});

test("D-01: the ledger summary reuses the /support page wording", () => {
  const support = TRUST_LEDGER.find((entry) => entry.id === "support");
  const pages = {
    en: read("src/pages/en/support.astro"),
    vi: read("src/pages/vi/support.astro"),
    zh: read("src/pages/zh/support.astro"),
    "zh-hant": read("src/pages/zh-hant/support.astro"),
  };
  for (const lang of LOCALES) {
    assert.ok(
      pages[lang].includes(support.summary[lang]),
      `${lang}: the ledger text must be the /support page text verbatim`,
    );
  }
});

test("D-01: 'Working recourse paths' is gone from the experience data", () => {
  const experience = read("src/data/experience.ts");
  assert.doesNotMatch(experience, /Working recourse paths/);
  assert.doesNotMatch(experience, OVERCLAIM);
});

/* ------------------------------------------------------------------ */
/* D-03 — one full statement per page; elsewhere the short label       */
/* ------------------------------------------------------------------ */

/** Longest repeat count of any sentence of at least `min` characters. */
function maxSentenceRepeat(text, min = 60) {
  const counts = new Map();
  for (const line of text.split("\n")) {
    for (const piece of line.split(/(?<=[.!?。！？])\s*/)) {
      const sentence = piece.trim();
      if (sentence.length < min) continue;
      counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
    }
  }
  return Math.max(0, ...counts.values());
}

test("D-03: the repetition detector counts a sentence repeated three times", () => {
  const claim =
    "This site sets no cookies. It stores explicitly selected language and theme preferences in this browser, without tracking or profiling.";
  assert.equal(maxSentenceRepeat(`${claim}\nx\n${claim}`), 2);
  assert.equal(maxSentenceRepeat(`${claim}\n${claim}\n${claim}`), 3);
  assert.equal(maxSentenceRepeat("short. short. short."), 0);
});

test("D-03: every claim has a short label that is shorter than its statement", () => {
  for (const claim of CLAIMS) {
    for (const lang of ["en", "vi"]) {
      assert.ok(claim.titleLabel?.[lang], `${claim.id} ${lang}`);
    }
    for (const lang of LOCALES) {
      const label = claimShortLabel(claim, lang);
      assert.ok(label.length > 0);
      assert.ok(label.length <= claim.statement[lang].length);
    }
    // zh/zh-hant short forms are exact leading cuts of the statement.
    for (const lang of ["zh", "zh-hant"]) {
      const label = claim.titleLabel?.[lang];
      if (label) {
        assert.ok(
          claim.statement[lang].startsWith(label),
          `${claim.id} ${lang}: the short label must be a cut, not new prose`,
        );
      }
    }
  }
  // Negative proof: a locale without a short form falls back to the full text.
  const bare = { statement: CLAIMS[0].statement };
  assert.equal(claimShortLabel(bare, "en"), CLAIMS[0].statement.en);
});

test("D-03: trace, atlas, provenance and dossier refer to claims by label", () => {
  assert.match(
    read("src/lib/claims.ts"),
    /claimShortLabel\(resolved\.claim, "en"\)/,
  );
  assert.match(
    read("src/lib/atlas.ts"),
    /claimShortLabel\(resolved\.claim, lang\)/,
  );
  assert.match(
    read("src/components/provenance/ProvenanceLens.astro"),
    /view\.statementLabel \?\? view\.statement/,
  );
  assert.match(
    read("src/components/dossier/DossierSources.astro"),
    /provenance\.statementLabel \?\? provenance\.statement/,
  );
  assert.match(
    read("src/lib/dossier.ts"),
    /claimShortLabel\(boundedClaim, lang\)/,
  );
  assert.match(
    read("src/components/integrity/IntegrityLens.astro"),
    /showBoundary=\{boundaries\}/,
  );
  assert.match(
    read("src/components/integrity/SourceTrace.astro"),
    /showBoundary \|\| step\.kind !== "boundary"/,
  );
  const composer = read("src/components/dossier/DossierComposer.astro");
  assert.doesNotMatch(
    composer,
    /<a[^>]*c4-dossier__source[^>]*>\s*\{entry\.label\}/,
    "the composer source link must not print the entry label a second time",
  );
  for (const lang of LOCALES) {
    for (const file of ["privacy", "security"]) {
      assert.match(
        read(`src/pages/${lang}/${file}.astro`),
        /lensBoundaries=\{false\}/,
        `${lang}/${file} shows its own boundary card; the lens must not repeat it`,
      );
    }
    // Deep links need the trace's evidence anchors on privacy: the trace stays
    // and only drops its boundary step (the page has its own boundary card).
    assert.doesNotMatch(
      read(`src/pages/${lang}/privacy.astro`),
      /lensTraces=\{false\}/,
    );
  }
});

/* ------------------------------------------------------------------ */
/* D-12 — no unexplained internal vocabulary on the visitor surface    */
/* ------------------------------------------------------------------ */

const JARGON = [/BlueSkyz Atlas/, /Public SGPS manifest/, /atlas-legend/];

const visitorSources = () =>
  [
    "src/components/experience/Atlas.astro",
    "src/components/verify/VerifyCentre.astro",
    "src/data/integrity.ts",
  ].map((path) => read(path));

test("D-12: Atlas name, legend and 'SGPS manifest' are off the visitor surface", () => {
  const joined = visitorSources().join("\n");
  for (const pattern of JARGON) assert.doesNotMatch(joined, pattern);
  // Negative proof: re-adding any of them is caught.
  for (const pattern of JARGON) {
    assert.match(`${joined}\n${pattern.source.replace("\\", "")}`, pattern);
  }
  const integrity = read("src/data/integrity.ts");
  assert.doesNotMatch(
    integrity.slice(integrity.indexOf("ev-public-manifest")),
    /SGPS/,
    "the manifest evidence label must not expose SGPS",
  );
});

test("D-12: 'Source-linked' is defined next to its first occurrence", () => {
  const integrity = read("src/data/integrity.ts");
  assert.match(integrity, /export const SOURCE_LINKED_LEGEND/);
  for (const [file, needle] of [
    [
      "src/components/verify/VerifyCentre.astro",
      /SOURCE_LINKED_LEGEND\[lang\]/,
    ],
    [
      "src/components/integrity/EvidencePassport.astro",
      /SOURCE_LINKED_LEGEND\[lang\]/,
    ],
    [
      "src/components/integrity/IntegrityLens.astro",
      /SOURCE_LINKED_LEGEND\[lang\]/,
    ],
  ]) {
    assert.match(read(file), needle, file);
  }
  // On /verify the definition precedes the first state label.
  const verify = read("src/components/verify/VerifyCentre.astro");
  assert.ok(
    verify.indexOf("SOURCE_LINKED_LEGEND[lang]") <
      verify.indexOf("<EvidenceTeaser"),
    "the definition must come before the claims that carry the label",
  );
  assert.match(verify, /legend=\{false\}/);
  // zh-hant uses corner brackets, not curly quotes.
  assert.doesNotMatch(integrity, /“已關聯來源”/);
});

/* ------------------------------------------------------------------ */
/* D-18 — evidence page: claim is the H1, label is the eyebrow         */
/* ------------------------------------------------------------------ */

const claimIsH1 = (page, passport) =>
  /<p class="evidence-passport__page-title" data-passport-page-title>/.test(
    page,
  ) &&
  !/<h1[^>]*data-passport-page-title/.test(page) &&
  /claimAs="h1"/.test(page) &&
  /const ClaimHeading = claimAs;/.test(passport);

test("D-18: every evidence page makes the claim the H1", () => {
  const passport = read("src/components/integrity/EvidencePassport.astro");
  for (const lang of LOCALES) {
    const page = read(`src/pages/${lang}/evidence/[id].astro`);
    assert.ok(claimIsH1(page, passport), `${lang} evidence page`);
    // Negative proof: the old generic H1 fails the guard.
    const old = page.replace(
      '<p class="evidence-passport__page-title" data-passport-page-title>',
      '<h1 class="evidence-passport__page-title" data-passport-page-title>',
    );
    assert.equal(claimIsH1(old, passport), false);
    assert.equal(claimIsH1(page.replace(' claimAs="h1"', ""), passport), false);
  }
});

/* ------------------------------------------------------------------ */
/* B-17 — atlas links resolve to something that exists                 */
/* ------------------------------------------------------------------ */

const hasId = (html, id) => new RegExp(`\\sid="${id}"`).test(html);

function atlasHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(
    /<li[^>]*data-atlas-node[^>]*>[\s\S]*?<\/li>/g,
  )) {
    const href = match[0].match(/<a href="([^"]+)"/)?.[1];
    if (href) hrefs.push(href);
  }
  return hrefs;
}

test("B-17: no atlas node points at the unrendered #house-title", () => {
  assert.doesNotMatch(read("src/lib/atlas.ts"), /house-title/);
  assert.match(read("src/lib/atlas.ts"), /href: `\/\$\{lang\}\/about\/`/);
});

test("B-17: every local atlas link in dist resolves to a built page and anchor", () => {
  if (!existsSync("dist")) return; // architecture tests may run before build
  for (const lang of LOCALES) {
    const verify = read(`dist/${lang}/verify/index.html`);
    const hrefs = atlasHrefs(verify);
    assert.ok(hrefs.length >= 10, `${lang}: atlas lists its nodes`);
    for (const href of hrefs) {
      if (/^https?:/.test(href)) continue;
      const [path, fragment] = href.split("#");
      const file = join("dist", path || `/${lang}/verify/`, "index.html");
      assert.ok(existsSync(file), `${lang}: ${href} has no built page`);
      if (fragment) {
        assert.ok(
          hasId(read(file), fragment),
          `${lang}: ${href} anchor missing`,
        );
      }
    }
  }
});

test("B-17 negative proof: the old target fails the existence check", () => {
  const home = existsSync("dist/en/index.html")
    ? read("dist/en/index.html")
    : "<main></main>";
  assert.equal(hasId(home, "house-title"), false);
  assert.equal(hasId('<h2 id="house-title">', "house-title"), true);
  assert.deepEqual(
    atlasHrefs(
      '<li data-atlas-node class="x"><a href="/en/#house-title">x</a></li>',
    ),
    ["/en/#house-title"],
  );
});

/* ------------------------------------------------------------------ */
/* D-05 — brand tagline per locale, reusing published renderings       */
/* ------------------------------------------------------------------ */

test("D-05: zh and zh-hant taglines are the renderings already published on the home hero", () => {
  const yaml = (lang) => read(`src/content/pages/${lang}/index.yaml`);
  const heading = (lang) => yaml(lang).match(/heading: (.+)/)?.[1];
  for (const lang of ["zh", "zh-hant"]) {
    const { lead, accent } = BRAND_TAGLINE[lang];
    assert.equal(`${lead}${accent}`, heading(lang), `${lang} home heading`);
    assert.notEqual(
      `${lead} ${accent}`,
      `${BRAND_TAGLINE.en.lead} ${BRAND_TAGLINE.en.accent}`,
    );
  }
  assert.equal(BRAND_TAGLINE.vi.lead, "Trí tuệ. Nâng tầm.");
  assert.match(
    read("docs/notes/zh-localization-glossary.md"),
    /智能。提升。影响。/,
  );
  // Negative proof: an English tagline in zh would be caught by the comparison.
  assert.notEqual(
    `${BRAND_TAGLINE.en.lead}${BRAND_TAGLINE.en.accent}`,
    heading("zh"),
  );
});

/* ------------------------------------------------------------------ */
/* D-06 / D-07 — Chinese wording                                       */
/* ------------------------------------------------------------------ */

const MAINLAND_IN_ZH_HANT = ["跟蹤", "行為畫像", "登記表", "目標地址"];
const TRAD_MARKERS = /[從開關請當電頁務標說護實證與這們為]/;
const zhLineUsesNin = (line) => line.includes("您") && !TRAD_MARKERS.test(line);

test("D-06: zh-hant carries no mainland terms from the audit", () => {
  for (const file of SRC_FILES) {
    const source = read(file);
    for (const term of MAINLAND_IN_ZH_HANT) {
      assert.ok(!source.includes(term), `${file} still contains ${term}`);
    }
  }
  const claims = read("src/data/claims.ts");
  for (const term of ["追蹤", "行為剖析", "登錄名單"]) {
    assert.ok(claims.includes(term), `claims zh-hant must use ${term}`);
  }
  assert.ok(read("src/data/craft-stories.ts").includes("目標網址"));
  // Negative proof.
  assert.ok(
    MAINLAND_IN_ZH_HANT.some((t) => "不進行跟蹤或行為畫像".includes(t)),
  );
});

test("D-07: zh body copy uses 你, never 您", () => {
  for (const file of SRC_FILES) {
    for (const line of read(file).split("\n")) {
      assert.ok(!zhLineUsesNin(line), `${file}: ${line.trim().slice(0, 60)}`);
    }
  }
  // Negative proof: a simplified line with 您 is flagged, a zh-hant line is not.
  assert.ok(zhLineUsesNin('? "从您需要的开始"'));
  assert.ok(!zhLineUsesNin('? "從您需要的開始"'));
});

/* ------------------------------------------------------------------ */
/* D-20 — localized display dates, ISO kept in <time datetime>         */
/* ------------------------------------------------------------------ */

test("D-20: display dates localize per locale and keep ISO in the datetime attribute", () => {
  assert.equal(formatDisplayDate("2026-09-12", "en"), "September 12, 2026");
  assert.equal(formatDisplayDate("2026-09-12", "vi"), "12 tháng 9, 2026");
  assert.equal(formatDisplayDate("2026-09-12", "zh"), "2026年9月12日");
  assert.equal(formatDisplayDate("2026-09-12", "zh-hant"), "2026年9月12日");
  assert.deepEqual(DISPLAY_DATE_LOCALES, {
    en: "en",
    vi: "vi",
    zh: "zh-CN",
    "zh-hant": "zh-TW",
  });
  // Negative proof: not a date, or a rolled-over date, is never guessed.
  assert.equal(formatDisplayDate("soon", "en"), "soon");
  assert.equal(formatDisplayDate("2026-02-31", "en"), "2026-02-31");

  for (const [file, iso] of [
    ["src/components/provenance/ProvenanceLens.astro", "view.freshness"],
    ["src/components/dossier/DossierSources.astro", "provenance.freshness"],
    ["src/components/integrity/EvidencePassport.astro", "passport.reviewedOn"],
    ["src/components/integrity/EvidenceDetails.astro", "review.reviewedOn"],
    ["src/components/dossier/DossierDocument.astro", "entry.freshness"],
    ["src/components/dossier/BoardroomDeck.astro", "entry.freshness"],
    ["src/components/dossier/DossierComposer.astro", "entry.freshness"],
    ["src/components/editorial/EditionStory.astro", "view.published"],
  ]) {
    const source = read(file);
    assert.match(
      source,
      new RegExp(`datetime=\\{${iso.replace(".", "\\.")}\\}`),
      file,
    );
    assert.match(source, /formatDisplayDate\(/, file);
    assert.doesNotMatch(
      source,
      new RegExp(`>\\s*\\{${iso.replace(".", "\\.")}\\}\\s*</time>`),
      `${file} must not print the raw ISO date`,
    );
  }
});

/* ------------------------------------------------------------------ */
/* D-14 (Owner 2026-10-01) — sign-in is secondary and qualified        */
/* ------------------------------------------------------------------ */

const signInIsSecondary = (source) =>
  /variant="secondary"[^>]*>\s*\{labelFor\(SHARED_LABELS\.signInExisting/.test(
    source,
  ) && !/<ButtonLink href=\{signInUrl\}>/.test(source);

test("D-14: product pages and the guide demote sign-in to a qualified secondary action", () => {
  for (const lang of LOCALES) {
    const page = read(`src/pages/${lang}/products/[slug].astro`);
    assert.ok(signInIsSecondary(page), `${lang} product page`);
    assert.match(page, /data-product-guide-cta/);
    // Negative proof: the old primary, unqualified button fails.
    assert.equal(
      signInIsSecondary(
        page
          .replace(' variant="secondary"', "")
          .replace("signInExisting", "signIn"),
      ),
      false,
    );
  }
  const guide = read("src/components/product/ProductGuide.astro");
  assert.ok(signInIsSecondary(guide));
  assert.equal(
    signInIsSecondary(guide.replace(' variant="secondary"', "")),
    false,
  );
  const site = read("src/data/site.ts");
  for (const text of [
    "Sign in (existing users)",
    "Đăng nhập (người dùng hiện có)",
    "登录（现有用户）",
    "登入（現有使用者）",
  ]) {
    assert.ok(site.includes(text), text);
  }
});
