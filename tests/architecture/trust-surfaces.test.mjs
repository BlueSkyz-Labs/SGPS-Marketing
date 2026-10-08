import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const ADVISORY =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

test("support empty state offers contact and security recourse", () => {
  // The root src/pages/support.astro is a pure Astro.redirect("/en/support/")
  // stub with no rendered markup of its own; the actually rendered content
  // lives in the locale page, so assert there instead of on dead source.
  const support = readFileSync("src/pages/en/support.astro", "utf8");
  assert.match(support, /href="\/en\/contact\/"/);
  assert.match(support, /href="\/en\/security\/"/);
  assert.match(support, /href="\/en\/about\/"/);
  assert.match(support, /SITE\.supportEmail/);
  assert.match(support, /hasSupportEmail/);
  assert.match(support, /min-h-11/);

  const rootStub = readFileSync("src/pages/support.astro", "utf8");
  assert.match(rootStub, /Astro\.redirect\("\/en\/support\/"\)/);
});

test("trust section links meet touch-target floor", () => {
  // S+ Task 4: links moved from sections/Trust.astro into the authoritative
  // TrustLedger component; the assertion follows the rendered links.
  const ledgerComponent = readFileSync(
    "src/components/experience/TrustLedger.astro",
    "utf8",
  );
  assert.match(ledgerComponent, /EvidenceDetails/);
  const evidenceDetails = readFileSync(
    "src/components/integrity/EvidenceDetails.astro",
    "utf8",
  );
  assert.match(evidenceDetails, /min-h-11/);
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
  // Same rationale as the support test above: root src/pages/contact.astro
  // is a redirect-only stub; the rendered lane lives on the locale page.
  const contact = readFileSync("src/pages/en/contact.astro", "utf8");
  assert.match(contact, /SECURITY_ADVISORY_URL/);
  assert.match(contact, /Open private vulnerability reporting/);

  const rootStub = readFileSync("src/pages/contact.astro", "utf8");
  assert.match(rootStub, /Astro\.redirect\("\/en\/contact\/"\)/);
});

test("flagship act is evidence-gated, wired on the home, and the retired shelf stays gone", () => {
  const theatre = readFileSync(
    "src/components/product/FlagshipTheatre.astro",
    "utf8",
  );
  assert.match(theatre, /proof\.media/);
  assert.match(theatre, /data-flagship-theatre/);
  assert.match(theatre, /capabilities\.slice/);
  assert.equal(
    existsSync("src/components/sections/FlagshipProof.astro"),
    false,
  );
  assert.equal(
    existsSync("src/components/sections/FeaturedProducts.astro"),
    false,
  );
  const home = readFileSync("src/pages/en/index.astro", "utf8");
  assert.match(home, /getFlagshipProduct/);
  assert.match(home, /FlagshipTheatre/);
  const legacyHome = readFileSync("src/pages/index.astro", "utf8");
  assert.doesNotMatch(legacyHome, /FlagshipProof|FeaturedProducts/);
});

test("about page shows the owner-confirmed founder line and invents no biography", () => {
  // Experience v6 S8 (audit E-26 resolved 2026-10-07, #523): founder detail
  // now publishes from the pages collection, so the composition must stay
  // data-driven (no hardcoded literal) and must not invent offices.
  const about = readFileSync(
    "src/components/empty-state/AboutComposition.astro",
    "utf8",
  );
  assert.match(about, /founder_name/);
  assert.doesNotMatch(about, /Tony Nguyen/);
  assert.doesNotMatch(about, /global offices|bank-grade|military-grade/i);
});

test("SECURITY.md advisory URL matches site constant", () => {
  const policy = readFileSync("SECURITY.md", "utf8");
  assert.match(
    policy,
    new RegExp(ADVISORY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});
