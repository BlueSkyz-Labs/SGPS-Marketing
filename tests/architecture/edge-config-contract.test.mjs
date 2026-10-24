/**
 * G8 / G14 edge-config contract. Deterministic config checks only; live
 * behaviour (Cloudflare applying _headers / _redirects) is verified post-deploy.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name === "index.html") out.push(dir);
  }
  return out;
}

test("G14: every built localized route has an exact one-hop 301 from its no-slash form", () => {
  assert.ok(existsSync("dist"), "run the build first");
  const rules = new Map(
    readFileSync("public/_redirects", "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split(/\s+/))
      .map(([from, to, status]) => [from, { to, status }]),
  );
  const routes = walk("dist")
    .map((d) => d.slice("dist".length).replace(/\\/g, "/"))
    .filter((p) => LOCALES.some((l) => p.startsWith(`/${l}/`)));
  assert.ok(routes.length > 50, "localized routes must be discovered");
  for (const route of routes) {
    const rule = rules.get(route);
    assert.ok(rule, `missing no-slash redirect for ${route}`);
    assert.equal(rule.status, "301", `${route} must be 301`);
    const finalDest = rules.get(`${route}/`)?.to ?? `${route}/`;
    assert.equal(
      rule.to,
      finalDest,
      `${route} must reach its final URL in one hop`,
    );
  }
});

test("G14: redirect rules stay within platform limits", () => {
  const n = readFileSync("public/_redirects", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  assert.ok(n.length <= 2000, "static redirect limit is 2000");
});
