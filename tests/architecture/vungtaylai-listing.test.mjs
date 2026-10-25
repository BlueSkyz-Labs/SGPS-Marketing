/**
 * Owner 2026-10-24 publishes the Vững Tay Lái listing at the In-development
 * state. Product Truth V0 has no accounts and public launch is BLOCKED, so
 * this record must carry no sign-in, store URL, releaseGate or
 * applicationCategory, and its lifecycle may not advance past
 * prototype/preview here. Runtime reachability of the product host is not a
 * capability or launch claim. Owner 2026-10-25: Android and iOS apps are on
 * the development roadmap, so the only appAccess allowed is exactly those two
 * apps in development.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// VTL_RECORD lets the negative-proof run point the same test at a mutated copy.
const record = readFileSync(
  process.env.VTL_RECORD ?? "src/content/products/vungtaylai.yaml",
  "utf8",
);

const top = (text, key) =>
  new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m").exec(text)?.[1];

const ROADMAP_ONLY =
  "appAccess:\n  android:\n    state: in-development\n  ios:\n    state: in-development\n";

export function listingViolations(text) {
  const out = [];
  if (top(text, "public") !== "true") out.push("public must be true");
  if (top(text, "featuredTier") !== "featured")
    out.push("featuredTier must be featured");
  if (top(text, "lifecycle") !== "prototype")
    out.push("lifecycle must stay prototype");
  if (top(text, "availability") !== "preview")
    out.push("availability must stay preview");
  if (top(text, "publicLabel") !== "In development")
    out.push("publicLabel must be In development");
  const access = /^appAccess:\n((?: {2,}.*\n)*)/m.exec(text)?.[0];
  if (access !== undefined && access !== ROADMAP_ONLY)
    out.push("appAccess may only list Android and iOS in development");
  for (const key of ["releaseGate", "applicationCategory"])
    if (new RegExp(`^${key}:`, "m").test(text))
      out.push(`${key} must be absent`);
  if (/signInUrl:|storeUrl:/.test(text)) out.push("no sign-in or store URL");
  for (const host of [
    "vungtaylai.blueskyzlabs.com",
    "play.google.com",
    "apps.apple.com",
    "itunes.apple.com",
  ])
    if (text.includes(host)) out.push(`no app or store host: ${host}`);
  if (!/^sourceRevision:\s*[0-9a-f]{40}\s*$/m.test(text))
    out.push("sourceRevision must be a 40-hex SHA");
  return out;
}

test("the record is published honestly at In development", () => {
  assert.deepEqual(listingViolations(record), []);
  assert.match(record, /^primaryAction:\n {2}type: preview$/m);
  assert.match(
    record,
    /^ {2}href: https:\/\/blueskyzlabs\.com\/en\/products\/vungtaylai\/$/m,
  );
});

function items(text, indent, key) {
  const block = new RegExp(
    `^${" ".repeat(indent)}${key}:\\n((?:${" ".repeat(indent)}  - .*\\n)+)`,
    "m",
  ).exec(text)?.[1];
  return block ? block.trim().split("\n").length : 0;
}

test("localized strings mirror the English counts", () => {
  const jobs = items(record, 0, "jobs");
  const caps = items(record, 0, "capabilities");
  assert.ok(jobs > 0 && caps > 0);
  for (const lang of ["vi", "zh", "zh-hant"]) {
    const block = new RegExp(`^ {2}${lang}:\\n((?: {4,}.*\\n)+)`, "m").exec(
      record,
    )?.[1];
    if (!block) {
      assert.equal(lang, "zh-hant", `${lang} i18n block missing`);
      continue;
    }
    const jobsN = items(`  ${lang}:\n${block}`, 4, "jobs");
    const capsN = items(`  ${lang}:\n${block}`, 4, "capabilities");
    assert.equal(jobsN, jobs, `${lang} jobs`);
    assert.equal(capsN, caps, `${lang} capabilities`);
  }
  const prefixes = {
    vi: "Mục tiêu phát triển:",
    zh: "开发目标：",
    "zh-hant": "開發目標：",
  };
  for (const [lang, prefix] of Object.entries(prefixes)) {
    const block = new RegExp(`^ {2}${lang}:\\n((?: {4,}.*\\n)+)`, "m").exec(
      record,
    )?.[1];
    if (!block) continue;
    const caps = new RegExp(`^ {4}capabilities:\\n((?: {6}- .*\\n)+)`, "m")
      .exec(block)?.[1]
      .trim()
      .split("\n");
    assert.ok(caps?.length, `${lang} capabilities present`);
    for (const line of caps)
      assert.ok(
        line.replace(/^\s*- "?/, "").startsWith(prefix),
        `${lang} capability must start with ${prefix}: ${line}`,
      );
  }
  assert.equal(
    (record.match(/^ {2}- "Development target:/gm) ?? []).length,
    caps,
    "English capabilities keep the Development target prefix",
  );
});

test("negative proof: adding a signInUrl is rejected", () => {
  const bad = record.replace(
    "appAccess:\n",
    "appAccess:\n  signInUrl: https://vungtaylai.blueskyzlabs.com/login\n",
  );
  assert.notEqual(bad, record);
  const v = listingViolations(bad);
  assert.ok(
    v.includes("appAccess may only list Android and iOS in development"),
    v.join("; "),
  );
  assert.ok(v.includes("no sign-in or store URL"), v.join("; "));
});

test("negative proof: a native app marked available is rejected", () => {
  const bad = record.replace(
    "  ios:\n    state: in-development\n",
    "  ios:\n    state: available\n",
  );
  assert.notEqual(bad, record);
  assert.deepEqual(listingViolations(bad), [
    "appAccess may only list Android and iOS in development",
  ]);
});

test("negative proof: active lifecycle without a releaseGate is rejected", () => {
  const bad = record.replace("lifecycle: prototype", "lifecycle: active");
  assert.notEqual(bad, record);
  const v = listingViolations(bad);
  assert.ok(v.includes("lifecycle must stay prototype"), v.join("; "));
  assert.ok(!/^releaseGate:/m.test(bad));
});

test("negative proof: moving publicUrl to the app host is rejected", () => {
  const bad = record.replace(
    /^( {2}publicUrl: ).*$/m,
    "$1https://vungtaylai.blueskyzlabs.com/",
  );
  assert.notEqual(bad, record);
  const v = listingViolations(bad);
  assert.ok(
    v.includes("no app or store host: vungtaylai.blueskyzlabs.com"),
    v.join("; "),
  );
  console.log(`NEGATIVE PROOF FAIL: ${v.join("; ")}`);
});

test("negative proof: a store host anywhere is rejected", () => {
  for (const host of [
    "play.google.com",
    "apps.apple.com",
    "itunes.apple.com",
  ]) {
    const v = listingViolations(`${record}\n# https://${host}/x\n`);
    assert.ok(v.includes(`no app or store host: ${host}`), v.join("; "));
  }
});

test("negative proof: dropping the VI capability prefix is detected", () => {
  const bad = record.replace("Mục tiêu phát triển: bài học", "Bài học");
  assert.notEqual(bad, record);
  const viBlock = /^ {2}vi:\n((?: {4,}.*\n)+)/m.exec(bad)[1];
  const first = /^ {4}capabilities:\n {6}- "?(.*)$/m.exec(viBlock)[1];
  assert.ok(!first.startsWith("Mục tiêu phát triển:"), first);
  console.log(`NEGATIVE PROOF FAIL: VI capability lacks prefix: ${first}`);
});
