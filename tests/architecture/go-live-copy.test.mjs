/**
 * Go-live copy polish (Owner decisions 2026-10-01): C-12, C-21, C-36 and the
 * vi Sổ Trọ description. Each pinned string has a negative proof.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { PRODUCT_META } from "../../src/data/page-meta.ts";
import { SHARED_LABELS } from "../../src/data/site.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const read = (p) => readFileSync(p, "utf8");

const DECISION_ROOM_TITLE = {
  en: "Compare claims",
  vi: "So sánh tuyên bố",
  zh: "比较声明",
  "zh-hant": "比較聲明",
};

const titleOf = (src) => src.match(/<BaseLayout\s+title="([^"]+)"/)?.[1];

test("decision-room <title> uses the public name in every locale", () => {
  for (const lang of LANGS) {
    assert.equal(
      titleOf(read(`src/pages/${lang}/decision-room.astro`)),
      DECISION_ROOM_TITLE[lang],
      lang,
    );
  }
});

test("negative proof: a legacy decision-room title is detected", () => {
  const legacy = read("src/pages/en/decision-room.astro").replace(
    "Compare claims",
    "Decision Room",
  );
  assert.notEqual(titleOf(legacy), DECISION_ROOM_TITLE.en);
});

test("vi Sổ Trọ description says 'khoản tiền chưa thu' within 120-160 chars", () => {
  const { description } = PRODUCT_META.sotro.vi;
  assert.ok(description.includes("khoản tiền chưa thu"));
  assert.ok(!description.includes("tiền phòng chưa thu"));
  const length = [...description].length;
  assert.ok(length >= 120 && length <= 160, `length ${length}`);
});

test("product profile capability heading uses SHARED_LABELS.scopeHeading", () => {
  assert.equal(SHARED_LABELS.scopeHeading.en, "What we're building");
  assert.equal(SHARED_LABELS.scopeHeading.vi, "Đang xây dựng những gì");
  for (const lang of LANGS) {
    const src = read(`src/pages/${lang}/products/[slug].astro`);
    assert.ok(
      src.includes(`labelFor(SHARED_LABELS.scopeHeading, "${lang}")`),
      lang,
    );
    assert.doesNotMatch(
      src,
      /Development focus|Trọng tâm phát triển|开发重点|開發重點/,
      lang,
    );
  }
});

const CRAFT_HEADINGS = {
  en: [
    "Why a private channel",
    "What we chose",
    "What limits it",
    "How it works",
    "What it does not do",
  ],
  vi: [
    "Vì sao cần kênh riêng tư",
    "Chúng tôi chọn gì",
    "Giới hạn",
    "Cách hoạt động",
    "Kênh này không làm gì",
  ],
  zh: ["为什么要私密渠道", "我们的选择", "限制", "如何运作", "不做什么"],
  "zh-hant": ["為什麼要私密管道", "我們的選擇", "限制", "如何運作", "不做什麼"],
};
const SECTIONS = [
  "problem",
  "designChoice",
  "constraint",
  "implementation",
  "limitations",
];

function craftHeadings(src, lang) {
  const block = src.slice(
    src.indexOf(lang === "zh-hant" ? '"zh-hant": {' : `  ${lang}: {`),
  );
  return SECTIONS.map((s) => block.match(new RegExp(`${s}: "([^"]+)"`))?.[1]);
}

test("security case-study headings follow C-36 in every locale", () => {
  const src = read("src/components/editorial/CraftStory.astro");
  for (const lang of LANGS) {
    assert.deepEqual(craftHeadings(src, lang), CRAFT_HEADINGS[lang], lang);
  }
});

test("negative proof: a reverted heading is detected", () => {
  const src = read("src/components/editorial/CraftStory.astro").replace(
    "What we chose",
    "The design choice",
  );
  assert.notDeepEqual(craftHeadings(src, "en"), CRAFT_HEADINGS.en);
});
