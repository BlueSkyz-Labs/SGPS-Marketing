/**
 * Experience density guard — structural proxies over SOURCE (no browser).
 *
 * SCOPE AND HONESTY LIMITS
 * ------------------------
 * This suite measures *structural density proxies* only: how many CTAs a
 * section declares, how deep/ordered its headings are, how many chips can
 * render in the intent lens and decision room, and how many sections a page
 * composes. It is a regression guard against dashboard creep (v3.1 C9).
 *
 * It CANNOT claim human comprehension, credibility, or trust. A green run
 * here says nothing about whether a person understands the page. Human E4
 * remains the sole authority for comprehension and credibility
 * (`docs/evidence/2026-09-12-v3-human-e4.md`, currently NOT RUN), and no
 * automated suite — this one included — may promote that status.
 *
 * Measured baselines were taken on 2026-09-12 against main @ f7636a7 before
 * the thresholds below were written. Each threshold sits just above the
 * measured value so the guard is a ceiling, not a mirror of current output.
 *
 * Deterministic, stdlib-only, source-level. No build, no browser, no network.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const HUMAN_E4_CAVEAT =
  "structural density proxy only — it cannot assert human comprehension; Human E4 (docs/evidence/2026-09-12-v3-human-e4.md, NOT RUN) remains the authority";

const read = (path) => readFileSync(path, "utf8");

/* ------------------------------------------------------------------ */
/* Surfaces and measured baselines (2026-09-12, main @ f7636a7)        */
/* ------------------------------------------------------------------ */

/** Ordered homepage section surface (EN/VI render the same sequence). */
const HOME_SURFACE = [
  "src/components/sections/Hero.astro", // cta=4 (2 per branch), primary=2, h1
  "src/components/experience/ExperienceSpine.astro", // nav only, cta=0
  "src/components/experience/IntentLens.astro", // 4 intent chips, cta=0
  "src/components/sections/FeaturedProducts.astro", // cta=1 (secondary)
  "src/components/sections/OneHouse.astro", // cta=0, h2
  "src/components/experience/OneHouseMatrix.astro", // nested, h3
  "src/components/sections/FlagshipProof.astro", // cta=2, primary=1
  "src/components/sections/Trust.astro", // cta=0, h2
  "src/components/sections/AboutBlueSkyz.astro", // cta=0, h2
  "src/components/sections/NextStep.astro", // cta=4 (2 per branch), primary=2
  "src/components/experience/Atlas.astro", // cta=0, h2
];

/** Page-level sections must each carry exactly one top-level heading. */
const PAGE_LEVEL_SECTIONS = [
  "src/components/sections/Hero.astro",
  "src/components/sections/FeaturedProducts.astro",
  "src/components/sections/OneHouse.astro",
  "src/components/sections/FlagshipProof.astro",
  "src/components/sections/Trust.astro",
  "src/components/sections/AboutBlueSkyz.astro",
  "src/components/sections/NextStep.astro",
  "src/components/experience/Atlas.astro",
];

const SECTION_COMPONENT_NAMES = new Set([
  "Hero",
  "ExperienceSpine",
  "IntentLens",
  "FeaturedProducts",
  "OneHouse",
  "FlagshipProof",
  "Trust",
  "AboutBlueSkyz",
  "NextStep",
  "Atlas",
  "DecisionRoom",
]);

/**
 * Thresholds — measured baseline -> ceiling (just above baseline).
 * MAX_CTA_PER_SECTION          4 -> 5   (Hero, NextStep; 2 render per branch)
 * MAX_PRIMARY_CTA_PER_SECTION  2 -> 3   (Hero, NextStep)
 * MAX_CTA_HOMEPAGE_TOTAL      11 -> 12  (source-level count, all branches)
 * MAX_HEADING_LEVEL_HOME       3 -> 3   (h1 hero, h2 sections, h3 matrix)
 * MAX_HEADING_LITERAL_CHARS   29 -> 40  ("One house — a way of thinking")
 * MAX_CHIPS_INTENT_LENS        4 -> 6
 * MAX_CHIPS_DECISION_ROOM      4 -> 6   (bounded by MAX_COMPARISON)
 * MAX_STATUS_PILLS_TRUST       3 -> 6   (TRUST_LEDGER entries)
 * MAX_SECTIONS_PER_PAGE       10 -> 12  (homepage; decision-room page = 2)
 * MAX_LITERAL_SECTIONS_PAGE    1 -> 4
 */
const MAX_CTA_PER_SECTION = 5;
const MAX_PRIMARY_CTA_PER_SECTION = 3;
const MAX_CTA_HOMEPAGE_TOTAL = 12;
const MAX_HEADING_LEVEL_HOME = 3;
const MAX_HEADING_LITERAL_CHARS = 40;
const MAX_CHIPS_INTENT_LENS = 6;
const MAX_CHIPS_DECISION_ROOM = 6;
const MAX_STATUS_PILLS_TRUST_LEDGER = 6;
const MAX_SECTIONS_PER_PAGE = 12;
const MAX_LITERAL_SECTIONS_PER_PAGE = 4;

/* ------------------------------------------------------------------ */
/* Source readers                                                      */
/* ------------------------------------------------------------------ */

/** CTA = `<ButtonLink>` or an anchor/button carrying a button-like class. */
function countCtas(src) {
  let count = (src.match(/<ButtonLink\b/g) || []).length;
  for (const match of src.matchAll(/<(?:a|button)\b[^>]*>/g)) {
    const classAttr = match[0].match(/class(?:=|\:list=)[^>]*/i);
    if (classAttr && /(?:btn|button|cta)/i.test(classAttr[0])) count += 1;
  }
  return count;
}

/** Primary CTA = `<ButtonLink>` with no `variant` override on the tag. */
function countPrimaryCtas(src) {
  return (src.match(/<ButtonLink(?![^>]*variant)/g) || []).length;
}

function headingLevels(src) {
  return [...src.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
}

/** Literal heading copy (tags stripped) — a proxy for heading length. */
function headingLiterals(src) {
  const literals = [];
  for (const match of src.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    const text = match[1].replace(/<[^>]*>/g, " ");
    for (const quoted of text.matchAll(/"([^"]{2,})"/g)) literals.push(quoted[1]);
  }
  return literals;
}

/** Component invocations in a page body (frontmatter excluded). */
function pageComponents(src) {
  const body = src.split(/^---$/m).slice(2).join("---");
  return [...body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]);
}

function pageSectionNames(src) {
  return pageComponents(src).filter((name) => SECTION_COMPONENT_NAMES.has(name));
}

function countLiteralSections(src) {
  return (src.match(/<section\b/g) || []).length;
}

/* ------------------------------------------------------------------ */
/* 1. CTA density per homepage section                                 */
/* ------------------------------------------------------------------ */

test("homepage section CTA density stays within the measured ceiling", () => {
  let total = 0;
  for (const path of HOME_SURFACE) {
    const src = read(path);
    const ctas = countCtas(src);
    const primary = countPrimaryCtas(src);
    total += ctas;
    assert.ok(
      ctas <= MAX_CTA_PER_SECTION,
      `${path} declares ${ctas} CTA(s), ceiling ${MAX_CTA_PER_SECTION} — more than one competing CTA cluster per region is dashboard creep (${HUMAN_E4_CAVEAT})`,
    );
    assert.ok(
      primary <= MAX_PRIMARY_CTA_PER_SECTION,
      `${path} declares ${primary} primary CTA(s), ceiling ${MAX_PRIMARY_CTA_PER_SECTION} — competing primary actions dilute the decision (${HUMAN_E4_CAVEAT})`,
    );
  }
  assert.ok(
    total <= MAX_CTA_HOMEPAGE_TOTAL,
    `homepage sections declare ${total} CTAs in source, ceiling ${MAX_CTA_HOMEPAGE_TOTAL} (${HUMAN_E4_CAVEAT})`,
  );
});

/* ------------------------------------------------------------------ */
/* 2. Heading depth, order, and length                                 */
/* ------------------------------------------------------------------ */

test("homepage heading hierarchy is ordered, bounded, and one h1", () => {
  const h1Owners = [];
  const levelsUsed = new Set();
  let longest = { text: "", length: 0 };

  for (const path of HOME_SURFACE) {
    const src = read(path);
    const levels = headingLevels(src);
    for (const level of levels) levelsUsed.add(level);
    if (levels.includes(1)) h1Owners.push(path);
    for (const literal of headingLiterals(src)) {
      if (literal.length > longest.length) longest = { text: literal, length: literal.length };
    }
  }

  assert.deepEqual(
    h1Owners,
    ["src/components/sections/Hero.astro"],
    `exactly one h1 may exist on the homepage surface and it must be the Hero (${HUMAN_E4_CAVEAT})`,
  );

  const maxLevel = Math.max(...levelsUsed);
  assert.ok(
    maxLevel <= MAX_HEADING_LEVEL_HOME,
    `homepage heading depth reaches h${maxLevel}, ceiling h${MAX_HEADING_LEVEL_HOME} (${HUMAN_E4_CAVEAT})`,
  );

  // No skipped levels: the used set must be contiguous from h1 to maxLevel.
  const contiguous = [...levelsUsed].sort((a, b) => a - b).join(",");
  assert.equal(
    contiguous,
    Array.from({ length: maxLevel }, (_, index) => index + 1).join(","),
    `homepage heading levels must not skip a level (used: ${contiguous}) (${HUMAN_E4_CAVEAT})`,
  );

  assert.ok(
    longest.length <= MAX_HEADING_LITERAL_CHARS,
    `longest literal homepage heading is ${longest.length} chars ("${longest.text}"), ceiling ${MAX_HEADING_LITERAL_CHARS} — overlong headings signal prose creep (${HUMAN_E4_CAVEAT})`,
  );

  for (const path of PAGE_LEVEL_SECTIONS) {
    const topLevel = headingLevels(read(path)).filter((level) => level <= 2);
    assert.equal(
      topLevel.length,
      1,
      `${path} must carry exactly one top-level heading (found ${topLevel.length}) (${HUMAN_E4_CAVEAT})`,
    );
  }
});

/* ------------------------------------------------------------------ */
/* 3. Chip / pill density in the intent lens and decision room         */
/* ------------------------------------------------------------------ */

function countIntentChips() {
  const src = read("src/components/experience/IntentLens.astro");
  return (src.match(/id:\s*"/g) || []).length;
}

function decisionRoomCap() {
  const src = read("src/lib/decision-room.ts");
  const match = src.match(/MAX_COMPARISON\s*=\s*(\d+)/);
  assert.ok(match, "src/lib/decision-room.ts must declare MAX_COMPARISON");
  return Number(match[1]);
}

function countTrustLedgerEntries() {
  const src = read("src/data/trust-ledger.ts");
  return (src.match(/^\s*id:\s*"[a-z-]+",\s*$/gm) || []).length;
}

test("simultaneous chip and status density stays bounded", () => {
  const intentChips = countIntentChips();
  assert.ok(
    intentChips <= MAX_CHIPS_INTENT_LENS,
    `intent lens renders ${intentChips} chips, ceiling ${MAX_CHIPS_INTENT_LENS} — too many simultaneous intent chips stop being a lens (${HUMAN_E4_CAVEAT})`,
  );

  const roomChips = decisionRoomCap();
  assert.ok(
    roomChips <= MAX_CHIPS_DECISION_ROOM,
    `decision room can render ${roomChips} kind chips (MAX_COMPARISON), ceiling ${MAX_CHIPS_DECISION_ROOM} (${HUMAN_E4_CAVEAT})`,
  );

  const roomSrc = read("src/components/experience/DecisionRoom.astro");
  assert.equal(
    (roomSrc.match(/class="decision-room__kind"/g) || []).length,
    1,
    `decision room must declare exactly one kind-chip template per item (${HUMAN_E4_CAVEAT})`,
  );

  const statusPills = countTrustLedgerEntries();
  assert.ok(
    statusPills <= MAX_STATUS_PILLS_TRUST_LEDGER,
    `trust ledger renders ${statusPills} status pills, ceiling ${MAX_STATUS_PILLS_TRUST_LEDGER} (${HUMAN_E4_CAVEAT})`,
  );
});

/* ------------------------------------------------------------------ */
/* 4. Section count per page + EN/VI parity                            */
/* ------------------------------------------------------------------ */

test("section count per page is bounded and EN/VI homepages stay in parity", () => {
  const pages = {
    "src/pages/en/index.astro": read("src/pages/en/index.astro"),
    "src/pages/vi/index.astro": read("src/pages/vi/index.astro"),
    "src/pages/en/decision-room.astro": read("src/pages/en/decision-room.astro"),
  };

  for (const [path, src] of Object.entries(pages)) {
    const sectionCount = pageSectionNames(src).length + countLiteralSections(src);
    assert.ok(
      sectionCount <= MAX_SECTIONS_PER_PAGE,
      `${path} composes ${sectionCount} sections, ceiling ${MAX_SECTIONS_PER_PAGE} — unbounded section growth is dashboard creep (${HUMAN_E4_CAVEAT})`,
    );
    assert.ok(
      countLiteralSections(src) <= MAX_LITERAL_SECTIONS_PER_PAGE,
      `${path} declares ${countLiteralSections(src)} literal <section> blocks, ceiling ${MAX_LITERAL_SECTIONS_PER_PAGE} (${HUMAN_E4_CAVEAT})`,
    );
  }

  assert.deepEqual(
    pageSectionNames(pages["src/pages/vi/index.astro"]),
    pageSectionNames(pages["src/pages/en/index.astro"]),
    `EN and VI homepages must compose the same section sequence (${HUMAN_E4_CAVEAT})`,
  );
});

/* ------------------------------------------------------------------ */
/* 5. No persistent dashboard shell                                    */
/* ------------------------------------------------------------------ */

test("experience surfaces do not become a persistent dashboard shell", () => {
  const surfaces = [
    ...HOME_SURFACE,
    "src/components/experience/DecisionRoom.astro",
    "src/components/experience/TrustLedger.astro",
    "src/components/experience/JourneyBar.astro",
  ];
  for (const path of surfaces) {
    const src = read(path);
    assert.doesNotMatch(
      src,
      /position:\s*fixed|\bsticky\b/i,
      `${path} must not pin a fixed/sticky shell — evidence UI is inline, never a permanent dashboard chrome (${HUMAN_E4_CAVEAT})`,
    );
  }
});
