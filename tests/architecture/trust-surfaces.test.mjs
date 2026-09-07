import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const ADVISORY =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

test("support empty state offers contact and security recourse", () => {
  const support = readFileSync("src/pages/support.astro", "utf8");
  assert.match(support, /href="\/contact\/"/);
  assert.match(support, /href="\/security\/"/);
  assert.match(support, /href="\/about\/"/);
  assert.match(support, /SITE\.contactEmail/);
  assert.match(support, /hasBusinessEmail/);
  assert.match(support, /min-h-11/);
});

test("trust section links meet touch-target floor", () => {
  const trust = readFileSync("src/components/sections/Trust.astro", "utf8");
  assert.match(trust, /min-h-11/);
});

test("security surface exposes actionable private reporting CTA", () => {
  const site = readFileSync("src/data/site.ts", "utf8");
  assert.match(site, /SECURITY_ADVISORY_URL/);
  assert.match(site, /security\/advisories\/new/);

  const page = readFileSync("src/pages/security.astro", "utf8");
  assert.match(page, /SECURITY_ADVISORY_URL/);
  assert.match(page, /Open private vulnerability reporting/);
  assert.doesNotMatch(page, /bank-grade|military-grade/i);
});

test("contact security lane deep-links advisory when email unset", () => {
  const contact = readFileSync("src/pages/contact.astro", "utf8");
  assert.match(contact, /SECURITY_ADVISORY_URL/);
  assert.match(contact, /Open private vulnerability reporting/);
});

test("flagship proof section is evidence-gated and optional", () => {
  assert.equal(existsSync("src/components/sections/FlagshipProof.astro"), true);
  const proof = readFileSync(
    "src/components/sections/FlagshipProof.astro",
    "utf8",
  );
  assert.match(proof, /proof\.screenshot/);
  assert.match(proof, /screenshot\.src/);
  assert.match(proof, /data-flagship-proof/);
  assert.match(proof, /capabilities\.slice/);
  assert.doesNotMatch(proof, /jobs\.slice/);
  const home = readFileSync("src/pages/index.astro", "utf8");
  assert.match(home, /getFlagshipProduct/);
  assert.match(home, /FlagshipProof/);
});

test("about page publishes centralized approved founder identity without invented biography", () => {
  const about = readFileSync("src/pages/about.astro", "utf8");
  const story = readFileSync(
    "src/components/sections/BrandStory.astro",
    "utf8",
  );
  const site = readFileSync("src/data/site.ts", "utf8");

  assert.match(about, /BrandStory/);
  assert.match(story, /SITE\.founder/);
  assert.match(site, /name:\s*"Tony Nguyen"/);
  assert.match(site, /role:\s*"Founder & CEO"/);
  assert.doesNotMatch(
    `${about}\n${story}`,
    /global offices|bank-grade|military-grade/i,
  );
});

test("SECURITY.md advisory URL matches site constant", () => {
  const policy = readFileSync("SECURITY.md", "utf8");
  assert.match(
    policy,
    new RegExp(ADVISORY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});
