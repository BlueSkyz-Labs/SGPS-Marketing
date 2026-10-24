/**
 * Owner 2026-10-24 publishes the Vững Tay Lái listing at the In-development
 * state. The product's Product Truth keeps public launch BLOCKED and forbids
 * accounts and native apps, so this record must carry no appAccess,
 * releaseGate or applicationCategory, and its lifecycle may not advance past
 * prototype/preview here. Runtime reachability of the product host is not a
 * capability or launch claim.
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
  for (const key of ["appAccess", "releaseGate", "applicationCategory"])
    if (new RegExp(`^${key}:`, "m").test(text))
      out.push(`${key} must be absent`);
  if (/signInUrl:|storeUrl:/.test(text)) out.push("no sign-in or store URL");
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
  assert.equal(
    (record.match(/^ {2}- "Development target:/gm) ?? []).length,
    caps,
    "English capabilities keep the Development target prefix",
  );
});

test("negative proof: adding a signInUrl is rejected", () => {
  const bad = record.replace(
    "featuredTier:",
    "appAccess:\n  signInUrl: https://vungtaylai.blueskyzlabs.com/login\nfeaturedTier:",
  );
  assert.notEqual(bad, record);
  const v = listingViolations(bad);
  assert.ok(v.includes("appAccess must be absent"), v.join("; "));
  assert.ok(v.includes("no sign-in or store URL"), v.join("; "));
});

test("negative proof: active lifecycle without a releaseGate is rejected", () => {
  const bad = record.replace("lifecycle: prototype", "lifecycle: active");
  assert.notEqual(bad, record);
  const v = listingViolations(bad);
  assert.ok(v.includes("lifecycle must stay prototype"), v.join("; "));
  assert.ok(!/^releaseGate:/m.test(bad));
});
