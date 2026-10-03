#!/usr/bin/env node
/**
 * Deterministic internal link/asset check over dist/.
 * External http(s) URLs are recorded but not fetched (owner-gated product facts).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";

const DIST = resolve("dist");

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error("dist/ missing — run pnpm build first");
  process.exit(1);
}

function walkHtml(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function resolveLocalTarget(fromFile, rawUrl) {
  const cleaned = rawUrl.split("#")[0].split("?")[0];
  if (!cleaned || cleaned === "") return null;

  let pathname;
  if (cleaned.startsWith("/")) {
    pathname = cleaned;
  } else {
    const fromDir = dirname(relative(DIST, fromFile)).replaceAll("\\", "/");
    const base = fromDir === "." ? "/" : `/${fromDir}/`;
    pathname = new URL(cleaned, `https://example.invalid${base}`).pathname;
  }

  if (pathname.endsWith("/")) pathname = `${pathname}index.html`;
  else if (!pathname.split("/").pop()?.includes(".")) {
    pathname = `${pathname}/index.html`;
  }

  const target = normalize(join(DIST, pathname.replace(/^\//, "")));
  const rel = relative(DIST, target);
  if (rel.startsWith("..") || rel.includes(`..${sep}`)) {
    return { ok: false, reason: `path escapes dist: ${rawUrl}` };
  }
  return {
    ok: existsSync(target),
    target: `/${rel.replaceAll("\\", "/")}`,
    rawUrl,
  };
}

const ATTR = /(?:href|src)=["']([^"']+)["']/gi;
// Executable navigation schemes are never legitimate build output: a future
// raw-template regression must fail the gate instead of being skipped.
// (Issue #377: the old SKIP set silently ignored javascript: URLs.)
const FORBIDDEN_SCHEME = /^(javascript|vbscript):/i;
const SKIP = /^(?:https?:|mailto:|tel:|data:|#)/i;

const pages = walkHtml(DIST);
const broken = [];
let checked = 0;
let external = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const match of html.matchAll(ATTR)) {
    const url = match[1].trim();
    if (!url) continue;
    const forbidden = url.match(FORBIDDEN_SCHEME);
    if (forbidden) {
      broken.push({
        page: `/${relative(DIST, page).replaceAll("\\", "/")}`,
        url,
        detail: `forbidden executable URL scheme: ${forbidden[1].toLowerCase()}:`,
      });
      continue;
    }
    if (SKIP.test(url)) {
      if (/^https?:/i.test(url)) external += 1;
      continue;
    }
    checked += 1;
    const result = resolveLocalTarget(page, url);
    if (!result) continue;
    if (!result.ok) {
      broken.push({
        page: `/${relative(DIST, page).replaceAll("\\", "/")}`,
        url: result.rawUrl ?? url,
        detail: result.reason ?? `missing ${result.target}`,
      });
    }
  }
}

if (broken.length > 0) {
  console.error(
    JSON.stringify(
      { checked, external, brokenCount: broken.length, broken },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      pages: pages.length,
      checked,
      externalSkipped: external,
      brokenCount: 0,
      status: "PASS",
    },
    null,
    2,
  ),
);
