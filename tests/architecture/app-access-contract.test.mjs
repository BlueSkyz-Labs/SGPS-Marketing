/**
 * Owner 2026-09-28: only Sổ Trọ and Sổ Tâm are published, and each shows an
 * "app access" block — a direct sign-in link once the Owner supplies it, and
 * native Android/iOS apps that stay "in development" until store-listed.
 * Owner 2026-10-24 adds Vững Tay Lái at the In-development state. Its Product
 * Truth V0 has no accounts or native apps and public launch is BLOCKED, so
 * it is the one published product with NO appAccess block (no sign-in URL, no
 * store URL); it is exempt from the sign-in and Android/iOS rules below and is
 * held to the stricter "no appAccess" rule instead.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const DIR = "src/content/products";
const PUBLISHED = ["sotam", "sotro", "vungtaylai"];
// Products whose Product Truth V0 has no accounts or native apps (2026-10-24).
const NO_APP_ACCESS = ["vungtaylai"];
assert.ok(
  NO_APP_ACCESS.every((s) => PUBLISHED.includes(s)),
  "NO_APP_ACCESS must be a subset of PUBLISHED",
);
const WITH_APP_ACCESS = PUBLISHED.filter((s) => !NO_APP_ACCESS.includes(s));

const records = readdirSync(DIR)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => [f.replace(/\.yaml$/, ""), readFileSync(join(DIR, f), "utf8")]);

export function mobileStates(text) {
  const block = text.match(/^appAccess:\n((?: {2,}.*\n)+)/m)?.[1] ?? "";
  return [...block.matchAll(/^ {2}(android|ios):\n((?: {4}.*\n?)+)/gm)].map(
    ([, key, body]) => ({
      key,
      state: body.match(/state:\s*(\S+)/)?.[1],
      storeUrl: body.match(/storeUrl:\s*(\S+)/)?.[1],
    }),
  );
}

export function mobileViolations(text) {
  return mobileStates(text)
    .filter((a) => (a.state === "available") !== Boolean(a.storeUrl))
    .map((a) => a.key);
}

test("only Sổ Trọ, Sổ Tâm and Vững Tay Lái are published", () => {
  const published = records
    .filter(([, text]) => /^public:\s*true\s*$/m.test(text))
    .map(([slug]) => slug)
    .sort();
  assert.deepEqual(published, PUBLISHED);
  for (const [slug, text] of records) {
    if (PUBLISHED.includes(slug)) continue;
    assert.match(text, /^featuredTier: hidden$/m, `${slug} must be hidden`);
  }
});

test("published products declare Android and iOS honestly", () => {
  for (const slug of WITH_APP_ACCESS) {
    const text = records.find(([s]) => s === slug)[1];
    const keys = mobileStates(text)
      .map((a) => a.key)
      .sort();
    assert.deepEqual(keys, ["android", "ios"], slug);
    assert.deepEqual(mobileViolations(text), [], slug);
  }
});

export function signInViolation(slug, text) {
  const url = text.match(/^ {2}signInUrl:\s*(\S+)/m)?.[1];
  if (!url) return "missing signInUrl";
  const { protocol, hostname } = new URL(url);
  // ADR 0006: each product lives on its own <slug>.blueskyzlabs.com host.
  if (protocol !== "https:" || hostname !== `${slug}.blueskyzlabs.com`)
    return `sign-in must be on https://${slug}.blueskyzlabs.com`;
  return null;
}

test("sign-in links go to the product's own subdomain", () => {
  for (const slug of WITH_APP_ACCESS) {
    const text = records.find(([s]) => s === slug)[1];
    assert.equal(signInViolation(slug, text), null, slug);
  }
});

test("negative proof: a foreign or retired sign-in host is rejected", () => {
  const retired = "appAccess:\n  signInUrl: https://sotro.tonydemo.com/login\n";
  const swapped =
    "appAccess:\n  signInUrl: https://sotam.blueskyzlabs.com/auth/login\n";
  assert.ok(signInViolation("sotro", retired));
  assert.ok(signInViolation("sotro", swapped));
  assert.ok(signInViolation("sotro", "appAccess:\n"));
});

test("the profile pages mount the app access block in every locale", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    const page = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    assert.match(page, new RegExp(`<AppAccess[^>]*lang="${lang}"`), lang);
  }
});

test("negative proof: a store link on an in-development app is rejected", () => {
  const bad =
    "appAccess:\n  android:\n    state: in-development\n    storeUrl: https://play.google.com/x\n  ios:\n    state: available\n";
  assert.deepEqual(mobileViolations(bad), ["android", "ios"]);
});

export function supportedPlatforms(text) {
  const block = text.match(/^platforms:\n((?: {2}- [^\n]+\n)+)/m)?.[1] ?? "";
  return [...block.matchAll(/^ {2}- ([a-z-]+)$/gm)].map((m) => m[1]);
}

export function prematureNativePlatforms(text) {
  const platforms = supportedPlatforms(text);
  return mobileStates(text)
    .filter((app) => app.state === "in-development")
    .filter((app) => platforms.includes(app.key))
    .map((app) => app.key);
}

test("pending native apps cannot appear as supported platforms", () => {
  for (const slug of WITH_APP_ACCESS) {
    const record = records.find(([key]) => key === slug)?.[1] ?? "";
    assert.deepEqual(prematureNativePlatforms(record), [], slug);
  }
  const sotam = records.find(([key]) => key === "sotam")?.[1] ?? "";
  assert.deepEqual(supportedPlatforms(sotam), ["web"]);
  assert.deepEqual(
    mobileStates(sotam).map((app) => app.state),
    ["in-development", "in-development"],
  );
});

test("negative proof: prematurely listing a native OS fails", () => {
  const sotam = records.find(([key]) => key === "sotam")?.[1] ?? "";
  const altered = sotam.replace(
    "platforms:\n  - web\n",
    "platforms:\n  - web\n  - android\n",
  );
  assert.notEqual(altered, sotam);
  assert.deepEqual(prematureNativePlatforms(altered), ["android"]);
});

export function appAccessViolation(text) {
  const out = [];
  if (/^"?appAccess"?:/m.test(text)) out.push("has an appAccess block");
  if (/"?signInUrl"?:/.test(text)) out.push("has a signInUrl");
  if (/"?storeUrl"?:/.test(text)) out.push("has a storeUrl");
  if (/^"?releaseGate"?:/m.test(text)) out.push("has a releaseGate");
  return out;
}

test("Vững Tay Lái is published with no appAccess block (Product Truth)", () => {
  for (const slug of NO_APP_ACCESS) {
    const text = records.find(([s]) => s === slug)[1];
    assert.deepEqual(appAccessViolation(text), [], slug);
    assert.deepEqual(supportedPlatforms(text), ["web"], slug);
  }
});

test("negative proof: a sign-in or store URL on Vững Tay Lái is rejected", () => {
  const text = records.find(([s]) => s === "vungtaylai")[1];
  const withSignIn = text.replace(
    "featuredTier:",
    "appAccess:\n  signInUrl: https://vungtaylai.blueskyzlabs.com/login\nfeaturedTier:",
  );
  assert.notEqual(withSignIn, text);
  assert.ok(appAccessViolation(withSignIn).length > 0);
  const withStore = text.replace(
    "featuredTier:",
    "appAccess:\n  android:\n    state: available\n    storeUrl: https://play.google.com/x\nfeaturedTier:",
  );
  assert.ok(appAccessViolation(withStore).length > 0);
});
