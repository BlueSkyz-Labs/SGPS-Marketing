/**
 * G8 / G14 edge-config contract. Deterministic config checks only; live
 * behaviour (Cloudflare applying _headers / _redirects) is verified post-deploy.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const LOCALES = ["en", "vi", "zh", "zh-hant"];

function headerBlock(path) {
  const lines = readFileSync("public/_headers", "utf8").split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === path && !l.startsWith(" "));
  if (start < 0) return null;
  const out = [];
  for (const l of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(l)) break;
    out.push(l.trim());
  }
  return out;
}

test("G8: security.txt is served as text/plain with charset=utf-8", () => {
  const block = headerBlock("/.well-known/security.txt");
  assert.ok(block, "_headers must have a /.well-known/security.txt rule");
  assert.ok(
    block.includes("Content-Type: text/plain; charset=utf-8"),
    "security.txt rule must set Content-Type: text/plain; charset=utf-8",
  );
});

test("G8: the global security headers rule is intact", () => {
  const block = headerBlock("/*");
  assert.ok(block, "_headers must keep the /* rule");
  for (const name of [
    "X-Content-Type-Options: nosniff",
    "Strict-Transport-Security:",
    "Content-Security-Policy:",
    "X-Frame-Options: DENY",
  ]) {
    assert.ok(
      block.some((l) => l.startsWith(name)),
      `/* must keep ${name}`,
    );
  }
});

// Route coverage (every built localized route has an exact one-hop 301) needs
// dist/, so it runs post-build in scripts/check-static-links.mjs; this suite
// runs before the build in Quality Gates.
test("G14: the post-build static-links check owns the no-slash 301 coverage", () => {
  const script = readFileSync("scripts/check-static-links.mjs", "utf8");
  assert.match(script, /public\/_redirects/);
  assert.match(script, /missing "\$\{route\} \$\{finalDest\} 301"/);
});

test("G14: the four locale roots keep their 301", () => {
  const rules = readFileSync("public/_redirects", "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+/));
  for (const lang of LOCALES) {
    assert.ok(
      rules.some(
        ([from, to, status]) =>
          from === `/${lang}` && to === `/${lang}/` && status === "301",
      ),
      `/${lang} must 301 to /${lang}/`,
    );
  }
});

test("G14: redirect rules stay within platform limits", () => {
  const n = readFileSync("public/_redirects", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  assert.ok(n.length <= 2000, "static redirect limit is 2000");
});
