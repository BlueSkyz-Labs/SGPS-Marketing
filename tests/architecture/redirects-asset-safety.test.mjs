import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import test from "node:test";

// Cloudflare (Workers Static Assets) applies public/_redirects BEFORE serving
// static assets. A greedy rule such as `/products/*` therefore 301s every
// image/video/subtitle under /products/ to an HTML page. `astro preview` does
// not apply _redirects, so browser tests cannot catch this; this contract does.

const ROOT = process.cwd();
const REDIRECTS = join(ROOT, "public", "_redirects");

/** Parse `source destination [status]` rules; comments and blanks ignored. */
function parseRedirects(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, destination, status] = line.split(/\s+/);
      return { source, destination, status };
    });
}

/** Cloudflare semantics: `*` greedy splat, `:name` one segment (no `/`), else exact. */
function sourceToRegExp(source) {
  let re = "";
  for (let i = 0; i < source.length;) {
    const ch = source[i];
    if (ch === "*") {
      re += ".*";
      i += 1;
    } else if (ch === ":" && /[A-Za-z_]/.test(source[i + 1] ?? "")) {
      let j = i + 1;
      while (j < source.length && /\w/.test(source[j])) j += 1;
      re += "[^/]+";
      i = j;
    } else {
      re += ch.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${re}$`);
}

function matches(rules, urlPath) {
  return rules.filter((r) => sourceToRegExp(r.source).test(urlPath));
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const HTML_EXT = new Set([".html", ".htm"]);
const RESERVED = new Set(["_redirects", "_headers"]);

function assetUrlPaths(baseDir) {
  return walk(baseDir)
    .filter((file) => !HTML_EXT.has(extname(file).toLowerCase()))
    .map((file) => relative(baseDir, file).split(sep).join("/"))
    .filter((rel) => !RESERVED.has(rel))
    .map((rel) => `/${rel}`);
}

const rules = parseRedirects(readFileSync(REDIRECTS, "utf8"));

test("no redirect source matches a non-HTML static asset in public/", () => {
  const assets = assetUrlPaths(join(ROOT, "public"));
  assert.ok(assets.length > 0, "public/ must contain static assets");
  assert.ok(
    assets.includes("/products/sotro/icon.png"),
    "sanity: known product asset must be discovered",
  );
  const offenders = assets.flatMap((asset) =>
    matches(rules, asset).map((r) => `${asset} <- ${r.source}`),
  );
  assert.deepEqual(
    offenders,
    [],
    `redirects swallow assets:\n${offenders.join("\n")}`,
  );
});

test("no redirect source matches a non-HTML asset in dist/ (when built)", (t) => {
  const dist = join(ROOT, "dist");
  if (!existsSync(dist)) {
    t.skip("dist/ not built; public/ coverage above still applies");
    return;
  }
  const offenders = assetUrlPaths(dist).flatMap((asset) =>
    matches(rules, asset).map((r) => `${asset} <- ${r.source}`),
  );
  assert.deepEqual(
    offenders,
    [],
    `redirects swallow built assets:\n${offenders.join("\n")}`,
  );
});

test("legacy page redirects still exist and target the localized routes", () => {
  const bySource = new Map(rules.map((r) => [r.source, r]));
  assert.equal(bySource.get("/products/")?.destination, "/en/products/");
  assert.equal(bySource.get("/products/")?.status, "301");
  const slugRule = bySource.get("/products/:slug/");
  assert.equal(slugRule?.destination, "/en/products/:slug/");
  assert.equal(slugRule?.status, "301");
  assert.equal(
    bySource.get("/products/:slug")?.destination,
    "/en/products/:slug/",
  );

  for (const [from, to] of [
    ["/products/", "/en/products/"],
    ["/products/sotro/", "/en/products/sotro/"],
    ["/products/sotro", "/en/products/sotro/"],
  ]) {
    const hit = matches(rules, from)[0];
    assert.ok(hit, `${from} must be redirected`);
    assert.equal(hit.destination.replace(":slug", "sotro"), to);
  }
});

test("negative proof: the old greedy /products/* rule is detected", () => {
  const oldRules = parseRedirects(
    "/products/ /en/products/ 301\n/products/* /en/products/ 301\n",
  );
  for (const asset of [
    "/products/sotro/icon.png",
    "/products/sotro/showcase/intro.mp4",
    "/products/sotro/showcase/en.vtt",
  ]) {
    assert.ok(
      matches(oldRules, asset).some((r) => r.source === "/products/*"),
      `old rule must match ${asset}`,
    );
  }
  const fixed = parseRedirects(
    "/products/:slug/ /en/products/:slug/ 301\n/products/:slug /en/products/:slug/ 301\n",
  );
  assert.equal(matches(fixed, "/products/sotro/icon.png").length, 0);
  assert.equal(matches(fixed, "/products/sotro/").length, 1);
});
