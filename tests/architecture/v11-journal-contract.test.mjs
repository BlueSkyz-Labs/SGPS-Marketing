import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_INDEX } from "../../src/data/claims.ts";
import {
  journalEntrySchema,
  journalIsIndexable,
  journalPairProblems,
} from "../../src/lib/journal-schema.ts";
import {
  releaseRecordId,
  sortReleaseRecords,
  toReleaseStory,
} from "../../src/lib/release-adapter.ts";

// Fixtures are test-only shapes, never published content (v11 §7.1).
const APPROVAL = "https://github.com/BlueSkyz-Labs/SGPS-Marketing/pull/999";
const ENTRY = {
  id: "fixture-post",
  lang: "vi",
  branch: "news",
  title: "Fixture title",
  description:
    "A fixture description long enough to satisfy the fifty character minimum.",
  datePublished: "2026-10-03",
  sources: ["https://example.org/source"],
  ownerApproval: APPROVAL,
};
const pair = (overrides = {}) => [
  journalEntrySchema.parse({ ...ENTRY, ...overrides }),
  journalEntrySchema.parse({ ...ENTRY, lang: "en", ...overrides }),
];

test("journal schema accepts a sourced, Owner-approved news entry", () => {
  const entry = journalEntrySchema.parse(ENTRY);
  assert.equal(entry.draft, false);
});

test("negative proofs: the schema rejects unsourced, unapproved, unknown-key and dishonest-date entries", () => {
  const bad = [
    { ...ENTRY, sources: [] },
    { ...ENTRY, sources: ["http://insecure.example"] },
    { ...ENTRY, ownerApproval: "https://github.com/other/repo/pull/1" },
    { ...ENTRY, lang: "zh" },
    { ...ENTRY, rating: 5 },
    { ...ENTRY, dateModified: "2026-10-01" },
    { ...ENTRY, dateModified: "2026-10-05" },
    { ...ENTRY, branch: "product" },
    { ...ENTRY, releaseRecord: "sotro-1-1-0" },
    { ...ENTRY, description: "too short" },
  ];
  for (const input of bad) {
    assert.equal(
      journalEntrySchema.safeParse(input).success,
      false,
      JSON.stringify(input),
    );
  }
  assert.equal(
    journalEntrySchema.safeParse({
      ...ENTRY,
      dateModified: "2026-10-05",
      updateNote: "Corrected a tariff date.",
    }).success,
    true,
  );
});

test("pairing: a published post needs matching vi and en versions", () => {
  assert.deepEqual(journalPairProblems(pair()), []);
  const [vi] = pair();
  assert.match(journalPairProblems([vi])[0], /exactly one vi and one en/);
  const mismatched = [
    vi,
    journalEntrySchema.parse({
      ...ENTRY,
      lang: "en",
      datePublished: "2026-10-02",
    }),
  ];
  assert.match(journalPairProblems(mismatched)[0], /datePublished differs/);
  const draftOnly = [journalEntrySchema.parse({ ...ENTRY, draft: true })];
  assert.deepEqual(journalPairProblems(draftOnly), []);
});

test("the index is indexable only with at least one published post", () => {
  assert.equal(journalIsIndexable([]), false);
  assert.equal(
    journalIsIndexable([journalEntrySchema.parse({ ...ENTRY, draft: true })]),
    false,
  );
  assert.equal(journalIsIndexable(pair()), true);
});

const RECORD = {
  product: "fixture",
  version: "1.2.0",
  releaseDate: "2026-10-01",
  significance: "minor",
  title: { vi: "Bản phát hành mẫu", en: "Fixture release" },
  summary: {
    vi: "Bản ghi kiểm thử, không phải nội dung công khai.",
    en: "A test-only record, never public content.",
  },
  changes: [
    {
      id: "fixture-change",
      kind: "improvement",
      title: { vi: "Thay đổi mẫu", en: "Fixture change" },
      summary: { vi: "Mô tả thay đổi mẫu.", en: "Fixture change summary." },
    },
  ],
  evidenceIds: ["ev-products-route"],
  approvalPr: APPROVAL,
  state: "published",
};
const CONTEXT = {
  asOfDate: "2026-10-03",
  products: [{ slug: "fixture", public: true }],
  evidence: EVIDENCE_INDEX,
};

test("adapter maps an approved public release record through the C3-F schema", () => {
  const vi = toReleaseStory(RECORD, "vi", CONTEXT);
  const en = toReleaseStory(RECORD, "en", CONTEXT);
  assert.equal(vi.id, "fixture-1-2-0");
  assert.equal(releaseRecordId(RECORD), "fixture-1-2-0");
  assert.equal(vi.title, "Bản phát hành mẫu");
  assert.equal(en.changes[0].title, "Fixture change");
  assert.equal(en.sourceUrl, APPROVAL);
});

test("negative proofs: the adapter rejects drafts, private-repo sources, bad versions, unknown products, future dates and missing evidence", () => {
  const cases = [
    [{ ...RECORD, state: "draft" }, /SOURCE|source/],
    [
      {
        ...RECORD,
        approvalPr: "https://github.com/BlueSkyz-Labs/Sotro/pull/1",
      },
      /INVALID_APPROVAL/,
    ],
    [{ ...RECORD, version: "1.2" }, /INVALID_VERSION/],
    [{ ...RECORD, product: "unknown" }, /product/i],
    [{ ...RECORD, releaseDate: "2026-10-04" }, /future/],
    [{ ...RECORD, evidenceIds: ["ev-does-not-exist"] }, /evidence/],
  ];
  for (const [record, pattern] of cases) {
    assert.throws(() => toReleaseStory(record, "en", CONTEXT), pattern);
  }
});

test("release records sort newest first, deterministically", () => {
  const older = { ...RECORD, version: "1.1.0", releaseDate: "2026-09-01" };
  const patch = { ...RECORD, version: "1.10.0" };
  assert.deepEqual(
    sortReleaseRecords([older, RECORD, patch]).map((r) => r.version),
    ["1.10.0", "1.2.0", "1.1.0"],
  );
});

import { existsSync, readdirSync, readFileSync } from "node:fs";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const indexPage = (lang) => `src/pages/${lang}/journal/index.astro`;

/** J1 invariants for the journal index pages (pure, testable on strings). */
export function journalIndexProblems(read, langs = LOCALES) {
  const problems = [];
  for (const lang of langs) {
    const src = read(indexPage(lang));
    if (!src) {
      problems.push(`${lang}: index page missing`);
      continue;
    }
    if (!/noindex=\{!indexable\}/.test(src))
      problems.push(`${lang}: noindex is not tied to published posts`);
    if (!src.includes(`path="/${lang}/journal/"`))
      problems.push(`${lang}: wrong canonical path`);
  }
  return problems;
}

const readOrEmpty = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

test("J1: a journal index exists in every locale, noindex until a post is published", () => {
  assert.deepEqual(journalIndexProblems(readOrEmpty), []);
});

test("J1 negative proof: an always-indexable or missing page is rejected", () => {
  const always = (p) =>
    readOrEmpty(p).replace("noindex={!indexable}", "noindex={false}");
  assert.equal(journalIndexProblems(always).length, LOCALES.length);
  assert.deepEqual(
    journalIndexProblems(() => "", ["vi"]),
    ["vi: index page missing"],
  );
});

test("J1: no navigation entry links the journal before the first post (v11 §3)", () => {
  const nav = [
    "src/components/layout/Header.astro",
    "src/components/layout/Footer.astro",
    "src/data/site.ts",
  ].filter(existsSync);
  for (const file of nav) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /\/journal\//, file);
  }
});

test("J1: posts cannot land before their post route exists (J3)", () => {
  const posts = readdirSync("src/content/journal").filter((f) =>
    f.endsWith(".md"),
  );
  const hasPostRoute = LOCALES.some((lang) =>
    existsSync(`src/pages/${lang}/journal/[slug].astro`),
  );
  assert.ok(
    posts.length === 0 || hasPostRoute,
    "a journal post needs the post route (v11 J3) in the same change",
  );
});

test("J1: the sitemap carries no journal URL while the journal is noindex", () => {
  const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");
  assert.doesNotMatch(sitemap, /journal/);
});
