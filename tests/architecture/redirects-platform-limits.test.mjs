import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Cloudflare Workers Static Assets rejects the deploy (error 100324, "Maximum
// number of dynamic _redirects rules limit of 100 exceeded") when the file has
// more than 100 dynamic rules, and it counts every rule from the first dynamic
// one onward. Two `:slug` rules near the top made 108 rules "dynamic" and
// failed every production deploy from #681 (2026-10-25). Local builds and
// `wrangler deploy --dry-run` do not run this check, so this contract does.
// Limits: https://developers.cloudflare.com/workers/platform/limits/

const REDIRECTS = join(process.cwd(), "public", "_redirects");
const STATIC_LIMIT = 2000;
const DYNAMIC_LIMIT = 100;

function rules(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0]);
}

const isDynamic = (source) => source.includes("*") || /:[A-Za-z_]/.test(source);

/** Rules Cloudflare counts as dynamic: the first dynamic rule and all after it. */
function platformCounts(text) {
  const sources = rules(text);
  const first = sources.findIndex(isDynamic);
  const dynamic = first === -1 ? 0 : sources.length - first;
  return { static: sources.length - dynamic, dynamic };
}

test("_redirects stays within the Cloudflare static/dynamic rule limits", () => {
  const counts = platformCounts(readFileSync(REDIRECTS, "utf8"));
  assert.ok(
    counts.dynamic <= DYNAMIC_LIMIT,
    `dynamic rules ${counts.dynamic} > ${DYNAMIC_LIMIT}`,
  );
  assert.ok(
    counts.static <= STATIC_LIMIT,
    `static rules ${counts.static} > ${STATIC_LIMIT}`,
  );
});

test("every dynamic rule comes after every static rule", () => {
  const sources = rules(readFileSync(REDIRECTS, "utf8"));
  const first = sources.findIndex(isDynamic);
  if (first === -1) return;
  const staticAfter = sources.slice(first).filter((s) => !isDynamic(s));
  assert.deepEqual(
    staticAfter,
    [],
    "static rules after the first dynamic rule count as dynamic",
  );
});

test("negative proof: a dynamic rule above 100 static rules breaks the limit", () => {
  const statics = Array.from(
    { length: 101 },
    (_, i) => `/p${i} /p${i}/ 301`,
  ).join("\n");
  const broken = `/products/:slug /en/products/ 301\n${statics}\n`;
  assert.ok(platformCounts(broken).dynamic > DYNAMIC_LIMIT);
  const fixed = `${statics}\n/products/:slug /en/products/ 301\n`;
  assert.equal(platformCounts(fixed).dynamic, 1);
});
