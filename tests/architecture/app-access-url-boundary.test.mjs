/**
 * App-access destination authority regression.
 * Pure URL tests use synthetic URLs only; no network or live authentication.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  isCanonicalAppSignInUrl,
  isOfficialMobileStoreUrl,
} from "../../src/lib/app-access-url.ts";

test("approved product sign-in shapes stay usable", () => {
  const approved = [
    ["sotro", "https://sotro.blueskyzlabs.com/login"],
    ["sotam", "https://sotam.blueskyzlabs.com/auth/login"],
  ];
  for (const [slug, url] of approved) {
    assert.equal(isCanonicalAppSignInUrl(slug, url), true);
  }
});

test("sign-in authority rejects deceptive destinations and leaking parameters", () => {
  const invalid = [
    "http://sotro.blueskyzlabs.com/login",
    "https://sotam.blueskyzlabs.com/login",
    "https://sotro.blueskyzlabs.com.attacker.invalid/login",
    "https://sotro.blueskyzlabs.com@attacker.invalid/login",
    "https://visitor@sotro.blueskyzlabs.com/login",
    "https://sotro.blueskyzlabs.com:444/login",
    "https://sotro.blueskyzlabs.com/",
    "https://sotro.blueskyzlabs.com/login?redirect=attacker.invalid",
    "https://sotro.blueskyzlabs.com/login#session",
    " https://sotro.blueskyzlabs.com/login",
    "not a URL",
  ];
  for (const candidate of invalid) {
    assert.equal(isCanonicalAppSignInUrl("sotro", candidate), false, candidate);
  }
  const badSlug = "sotro.attacker";
  const badUrl = "https://sotro.attacker.blueskyzlabs.com/login";
  assert.equal(isCanonicalAppSignInUrl(badSlug, badUrl), false);
});

test("official store listings cannot swap platforms or use deceptive hosts", () => {
  const playUrl = "https://play.google.com/store/apps/details?id=com.example.app";
  const appleUrl = "https://apps.apple.com/vn/app/example/id123456789";
  assert.equal(isOfficialMobileStoreUrl("android", playUrl), true);
  assert.equal(isOfficialMobileStoreUrl("ios", appleUrl), true);
  assert.equal(
    isOfficialMobileStoreUrl("ios", "https://apps.apple.com/app/id123456789"),
    true,
  );
  const invalid = [
    ["android", "https://play.google.com.attacker.invalid/store/apps/details?id=x"],
    ["android", "https://user@play.google.com/store/apps/details?id=x"],
    ["android", "https://play.google.com/store/apps/details"],
    ["android", "https://apps.apple.com/app/id12345"],
    ["android", "https://play.google.com/store/apps/details?id=x#fragment"],
    ["ios", "https://play.google.com/store/apps/details?id=x"],
    ["ios", "https://apps.apple.com.attacker.invalid/vn/app/x/id12345"],
    ["ios", "https://apps.apple.com/vn/app/x"],
    ["ios", "https://apps.apple.com/vn/app/x/idnot-a-number"],
    ["ios", "javascript:alert(1)"],
  ];
  for (const [platform, candidate] of invalid) {
    assert.equal(
      isOfficialMobileStoreUrl(platform, candidate),
      false,
      `${platform}: ${candidate}`,
    );
  }
});

test("the product schema invokes both destination authority checks", () => {
  const source = readFileSync("src/lib/product-schema.ts", "utf8");
  assert.match(source, /isCanonicalAppSignInUrl\(value\.slug, signInUrl\)/);
  assert.match(source, /isOfficialMobileStoreUrl\(platform, storeUrl\)/);
  assert.match(source, /path: \["appAccess", "signInUrl"\]/);
  assert.match(source, /path: \["appAccess", platform, "storeUrl"\]/);
  const checks = source.indexOf("const signInUrl = value.appAccess?.signInUrl;");
  const earlyReturn = source.indexOf("if (!value.public) return;");
  assert.ok(checks !== -1 && checks < earlyReturn);
});
