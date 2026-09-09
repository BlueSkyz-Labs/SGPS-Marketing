import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isNonProductionSiteUrl,
  validatePublicTruth,
} from "../../src/lib/truth.ts";

test("public truth gate rejects missing production identity", () => {
  const errors = validatePublicTruth({});
  assert.ok(errors.some((e) => e.includes("PUBLIC_SITE_URL")));
  assert.ok(errors.some((e) => e.includes("PUBLIC_CONTACT_EMAIL")));
  assert.ok(errors.some((e) => e.includes("PUBLIC_SECURITY_EMAIL")));
});

test("public truth gate rejects documentation and preview hosts", () => {
  const cases = [
    "https://example.com",
    "https://www.example.org",
    "https://blueskyz-web.thinhnguyen-km10.workers.dev",
    "http://localhost:4321",
  ];
  for (const siteUrl of cases) {
    const errors = validatePublicTruth({
      siteUrl,
      contactEmail: "owner@blueskyzlabs.com",
      securityEmail: "security@blueskyzlabs.com",
    });
    assert.ok(
      errors.some((e) => e.includes("PUBLIC_SITE_URL")),
      `expected rejection for ${siteUrl}`,
    );
  }
});

test("public truth gate rejects placeholder emails", () => {
  const errors = validatePublicTruth({
    siteUrl: "https://blueskyzlabs.com",
    contactEmail: "@",
    securityEmail: "not-an-email",
  });
  assert.ok(errors.some((e) => e.includes("PUBLIC_CONTACT_EMAIL")));
  assert.ok(errors.some((e) => e.includes("PUBLIC_SECURITY_EMAIL")));
});

test("isNonProductionSiteUrl covers local, workers.dev, example, and retired temporary hosts", () => {
  assert.equal(isNonProductionSiteUrl("http://localhost:4321"), true);
  assert.equal(isNonProductionSiteUrl("https://127.0.0.1"), true);
  assert.equal(isNonProductionSiteUrl("https://[::1]/"), true);
  assert.equal(isNonProductionSiteUrl("https://example.com"), true);
  assert.equal(isNonProductionSiteUrl("https://foo.example"), true);
  assert.equal(
    isNonProductionSiteUrl(
      "https://blueskyz-web.thinhnguyen-km10.workers.dev/",
    ),
    true,
  );
  assert.equal(isNonProductionSiteUrl("https://tonydemo.com/"), true);
  assert.equal(isNonProductionSiteUrl("https://www.tonydemo.com/"), true);
  assert.equal(isNonProductionSiteUrl("https://blueskyz.tonydemo.com/"), true);
});

test("public truth gate rejects IPv6 loopback and .example TLD", () => {
  for (const siteUrl of ["https://[::1]", "https://docs.example"]) {
    const errors = validatePublicTruth({
      siteUrl,
      contactEmail: "owner@blueskyzlabs.com",
      securityEmail: "security@blueskyzlabs.com",
    });
    assert.ok(
      errors.some((e) => e.includes("PUBLIC_SITE_URL")),
      `expected rejection for ${siteUrl}`,
    );
  }
});

test("validate-public-truth script exists and does not invent production fallbacks", () => {
  const script = readFileSync("scripts/validate-public-truth.mjs", "utf8");
  assert.match(script, /validatePublicTruth/);
  assert.doesNotMatch(script, /portfolio\.tonydemo\.com/);
  assert.doesNotMatch(script, /hello@blueskyz\.io/);
});

test("isNonProductionSiteUrl rejects pages.dev, tonydemo staging, and trailing-dot FQDNs", () => {
  assert.equal(
    isNonProductionSiteUrl("https://blueskyz-labs-portfolio.pages.dev/"),
    true,
  );
  assert.equal(isNonProductionSiteUrl("https://sotro.tonydemo.com/"), true);
  assert.equal(isNonProductionSiteUrl("https://portfolio.tonydemo.com/"), true);
  assert.equal(isNonProductionSiteUrl("https://demo.workers.dev./"), true);
  assert.equal(isNonProductionSiteUrl("https://example.com./"), true);
});

test("public truth gate accepts only the exact canonical BlueSkyz organizational origin", () => {
  const validEmails = {
    contactEmail: "owner@blueskyzlabs.com",
    securityEmail: "security@blueskyzlabs.com",
  };

  const canonicalErrors = validatePublicTruth({
    siteUrl: "https://blueskyzlabs.com",
    ...validEmails,
  });
  assert.equal(
    canonicalErrors.some((e) => e.includes("PUBLIC_SITE_URL")),
    false,
  );

  for (const siteUrl of [
    "https://tonydemo.com",
    "https://www.tonydemo.com",
    "https://blueskyz.tonydemo.com",
    "https://www.blueskyzlabs.com",
    "https://blueskyzlabs.com.",
    "https://blueskyzlabs.com/products/",
    "https://blueskyzlabs.com/?preview=1",
    "https://blueskyzlabs.com:8443/",
    "https://blueskyz.labs",
  ]) {
    const errors = validatePublicTruth({ siteUrl, ...validEmails });
    assert.ok(
      errors.some((e) => e.includes("PUBLIC_SITE_URL")),
      `expected canonical-origin rejection for ${siteUrl}`,
    );
  }
});
