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
  assert.equal(
    isCanonicalAppSignInUrl(
      "sotro",
      "https://sotro.blueskyzlabs.com/login",
    ),
    true,
  );
  assert.equal(
    isCanonicalAppSignInUrl(
      "sotam",
      "https://sotam.blueskyzlabs.com/auth/login",
    ),
    true,
  );
});

test("sign-in authority rejects foreign hosts, deceptive URLs and leaking parameters", () => {
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
    assert.equal(
      isCanonicalAppSignInUrl("sotro", candidate),
      false,
      candidate,
    );
  }
  assert.equal(
    isCanonicalAppSignInUrl(
      "sotro.attacker",
      "https://sotro.attacker.blueskyzlabs.com/login",
    ),
    false,
  );
});

test("official platform listing URLs are distinct from arbitrary HTTPS links", () => {
  assert.equal(
    isOfficialMobileStoreUrl(
      "android",
      "https://play.google.com/store/apps/details?id=com.example.app",
    ),
    true,
  );
  assert.equal(
    isOfficialMobileStoreUrl(
      "ios",
      "https://apps.apple.com/vn/app/example/id123456789",
    ),
    true,
  );
  assert.equal(
    isOfficialMobileStoreUrl("ios", "https://apps.apple.com/app/id123456789"),
    true,
  );

  for (const [platform, candidate] of [
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
  ]) {
    assert.equal(
      isOfficialMobileStoreUrl(platform, candidate),
      false,
      `${platform}: ${candidate}`,
    );
  }
});

test("the product schema actually enforces both authority checks", () => {
  const source = readFileSync("src/lib/product-schema.ts", "utf8");
  assert.match(source, /isCanonicalAppSignInUrl\(value\.slug, signInUrl\)/);
  assert.match(source, /isOfficialMobileStoreUrl\(platform, storeUrl\)/);
  assert.match(source, /path: \["appAccess", "signInUrl"\]/);
  assert.match(source, /path: \["appAccess", platform, "storeUrl"\]/);
  const checks = source.indexOf("const signInUrl = value.appAccess?.signInUrl;");
  const earlyReturn = source.indexOf("if (!value.public) return;");
  assert.ok(checks !== -1 && checks < earlyReturn);
});
