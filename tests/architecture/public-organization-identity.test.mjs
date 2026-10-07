import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { publicMailboxForRole } from "../../src/lib/public-mailbox.ts";
import { organizationJsonLd } from "../../src/lib/seo.ts";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

test("Owner-confirmed operating year is shared by visible pages and Organization JSON-LD", () => {
  const site = read("src/data/site.ts");
  assert.match(site, /foundedYear:\s*2026/);
  const organization = organizationJsonLd("https://blueskyzlabs.com", 2026);
  assert.equal(organization.foundingDate, "2026");
  assert.equal(organization.name, "BlueSkyz Labs");
  assert.equal("founder" in organization, false);
  assert.equal("contactPoint" in organization, false);
  assert.equal("email" in organization, false);
  assert.equal("sameAs" in organization, false);

  const gateway = read("src/pages/index.astro");
  assert.match(gateway, /SITE\.foundedYear/);
  assert.match(gateway, /SITE\.proposition/);
  assert.match(gateway, /href="\/en\/about\/"/);
  assert.match(gateway, /organizationJsonLd\(SITE\.url, SITE\.foundedYear\)/);
  assert.match(
    read("src/layouts/BaseLayout.astro"),
    /organizationJsonLd\(SITE\.url, SITE\.foundedYear\)/,
  );
  assert.match(
    read("src/components/empty-state/AboutComposition.astro"),
    /SITE\.foundedYear/,
  );
  for (const locale of LOCALES) {
    assert.match(
      read(`src/pages/${locale}/about.astro`),
      /AboutComposition lang=/,
    );
  }
});

test("public About products and status labels come from the public registry", () => {
  const composition = read("src/components/empty-state/AboutComposition.astro");
  assert.match(composition, /getPublicProducts\(\)/);
  assert.match(composition, /ProductStatus/);
  assert.match(composition, /publicLabel/);
  for (const locale of LOCALES) {
    assert.match(
      read(`src/pages/${locale}/about.astro`),
      /AboutComposition lang=/,
    );
  }
});

test("mailbox projection accepts only the address assigned to its DEC-038 role", () => {
  const allowed = [
    ["hello@blueskyzlabs.com", "contact"],
    ["support@blueskyzlabs.com", "support"],
    ["privacy@blueskyzlabs.com", "privacy"],
    ["security@blueskyzlabs.com", "security"],
    ["tony@blueskyzlabs.com", "founder"],
  ];
  for (const [address, role] of allowed) {
    assert.equal(publicMailboxForRole(address, role), address);
  }

  const rejected = [
    ["tony@blueskyzlabs.com", "contact"],
    ["tony@blueskyzlabs.com", "security"],
    ["security@blueskyzlabs.com", "contact"],
    ["ops@blueskyzlabs.com", "contact"],
    ["admin@blueskyzlabs.com", "founder"],
    ["hello@example.com", "contact"],
    ["not-an-email", "contact"],
  ];
  for (const [address, role] of rejected) {
    assert.equal(publicMailboxForRole(address, role), null);
  }
});

test("configured public email sources are purpose-specific and optional", () => {
  const site = read("src/data/site.ts");
  assert.match(site, /PUBLIC_CONTACT_EMAIL,[\s\S]*?"contact"/);
  assert.match(site, /PUBLIC_SUPPORT_EMAIL,[\s\S]*?"support"/);
  assert.match(site, /PUBLIC_PRIVACY_EMAIL,[\s\S]*?"privacy"/);
  assert.match(site, /PUBLIC_SECURITY_EMAIL,[\s\S]*?"security"/);
  assert.match(site, /PUBLIC_FOUNDER_EMAIL,[\s\S]*?"founder"/);

  const env = read(".env.example");
  for (const key of [
    "PUBLIC_CONTACT_EMAIL",
    "PUBLIC_SUPPORT_EMAIL",
    "PUBLIC_PRIVACY_EMAIL",
    "PUBLIC_SECURITY_EMAIL",
    "PUBLIC_FOUNDER_EMAIL",
  ]) {
    assert.match(env, new RegExp(`^${key}=""$`, "m"));
  }

  const contact = read("src/components/empty-state/PublicContactEmails.astro");
  assert.match(contact, /SITE\.contactEmail/);
  assert.match(contact, /SITE\.supportEmail/);
  assert.doesNotMatch(contact, /SITE\.securityEmail|SITE\.privacyEmail/);
  assert.match(
    read("src/components/empty-state/AboutComposition.astro"),
    /SITE\.founderEmail/,
  );
  assert.match(
    read("src/components/trust/PrivacyBody.astro"),
    /SITE\.privacyEmail/,
  );
  assert.match(
    read("src/components/trust/SecurityBody.astro"),
    /SITE\.securityEmail/,
  );
  for (const locale of LOCALES) {
    assert.match(
      read(`src/pages/${locale}/support.astro`),
      /SITE\.supportEmail/,
    );
  }
});
