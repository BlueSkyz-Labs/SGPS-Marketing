/**
 * Plan v5 W3.4 — every public product carries vi and zh copy that mirrors the
 * English record shape, and localized copy never reintroduces the P1
 * out-of-scope claims (voice/transcription, automatic sending, live driving).
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const DIR = "src/content/products";

function parse(file) {
  const text = readFileSync(join(DIR, file), "utf8");
  const isPublic = /^public:\s*true\s*$/m.test(text);
  const englishJobs = (text.match(/^jobs:\n((?: {2}- .*\n)+)/m)?.[1] ?? "")
    .split("\n")
    .filter(Boolean).length;
  const englishCaps = (
    text.match(/^capabilities:\n((?: {2}- .*\n)+)/m)?.[1] ?? ""
  )
    .split("\n")
    .filter(Boolean).length;
  const block = text.split(/^i18n:\s*$/m)[1] ?? "";
  return { text, isPublic, englishJobs, englishCaps, block };
}

function localeSection(block, lang) {
  const match = block.match(new RegExp(`^  ${lang}:\\n((?: {4}.*\\n?)+)`, "m"));
  return match?.[1] ?? "";
}

function listCount(section, key) {
  const match = section.match(
    new RegExp(`^ {4}${key}:\\n((?: {6}- .*\\n?)+)`, "m"),
  );
  return (match?.[1] ?? "").split("\n").filter(Boolean).length;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".yaml"));

test("every public product carries mirrored vi, zh and zh-hant copy", () => {
  for (const file of files) {
    const p = parse(file);
    if (!p.isPublic) continue;
    for (const lang of ["vi", "zh", "zh-hant"]) {
      const section = localeSection(p.block, lang);
      assert.ok(section, `${file}: missing i18n.${lang}`);
      assert.match(section, /shortDescription: \S/, `${file} ${lang}`);
      assert.match(section, /primaryActionLabel: \S/, `${file} ${lang}`);
      assert.equal(
        listCount(section, "jobs"),
        p.englishJobs,
        `${file} ${lang} jobs`,
      );
      assert.equal(
        listCount(section, "capabilities"),
        p.englishCaps,
        `${file} ${lang} capabilities`,
      );
    }
  }
});

const OUT_OF_SCOPE = {
  "sotam.yaml": [/giọng nói|ghi âm|phiên âm|语音|转录|录音/],
  "sotro.yaml": [/tự động gửi(?!,)|自动发送(?!，)|thanh toán tự động|自动付款/],
  "vungtaylai.yaml": [/thời gian thực|cảnh báo va chạm|实时|碰撞预警/],
};

export function outOfScopeHits(file, text) {
  return (OUT_OF_SCOPE[file] ?? []).filter((re) => re.test(text)).map(String);
}

test("localized copy does not reintroduce out-of-scope claims", () => {
  for (const [file] of Object.entries(OUT_OF_SCOPE)) {
    const { block } = parse(file);
    // Negations that already exist in the English record are allowed:
    // "không tự động gửi" / "不会自动发送" state the boundary, not the feature.
    const scrubbed = block
      .replace(/không tự động gửi/g, "")
      .replace(/不会自动发送/g, "");
    assert.deepEqual(outOfScopeHits(file, scrubbed), [], file);
  }
});

test("negative proof: localized out-of-scope claims are detected", () => {
  assert.ok(outOfScopeHits("sotam.yaml", "Ghi âm giọng nói").length > 0);
  assert.ok(outOfScopeHits("vungtaylai.yaml", "cảnh báo va chạm").length > 0);
  assert.deepEqual(outOfScopeHits("sotam.yaml", "Nhật ký viết tay"), []);
});

test("zh-hant Sổ Trọ copy states no claim absent from the English record (drift fix)", () => {
  const { block } = parse("sotro.yaml");
  const zhHant = localeSection(block, "zh-hant");
  assert.ok(zhHant, "sotro.yaml: missing i18n.zh-hant");
  // Negative proof: the drifted claims and the leaked heading prefix must stay out.
  for (const banned of ["可追溯", "可審計", "開發範圍："]) {
    assert.ok(
      !zhHant.includes(banned),
      `sotro.yaml zh-hant must not contain "${banned}" (not in the English record)`,
    );
  }
  // Positive proof: the honesty claim "nothing is sent automatically" survives.
  assert.match(zhHant, /不會自動傳送/);
});
