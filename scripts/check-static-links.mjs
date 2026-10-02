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

const ATTR = /(href|src)=["']([^"']+)["']/gi;
const SAFE_SCHEME = /^(?:https?:|mailto:|tel:)/i;
const EXECUTABLE_SCHEME = /^(?:javascript|vbscript):/i;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function classifyUrl(attribute, url) {
  if (EXECUTABLE_SCHEME.test(url)) {
    return { kind: "forbidden", reason: `forbidden executable URL scheme: ${url}` };
  }
  if (/^data:/i.test(url)) {
    return attribute === "src"
      ? { kind: "skip" }
      : { kind: "forbidden", reason: `data: navigation is not allowed: ${url}` };
  }
  if (SAFE_SCHEME.test(url) || url.startsWith("#")) return { kind: "skip" };
  if (ANY_SCHEME.test(url)) {
    return { kind: "forbidden", reason: `unsupported URL scheme: ${url}` };
  }
  return { kind: "local" };
}

const pages = walkHtml(DIST);
const broken = [];
let checked = 0;
let external = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const match of html.matchAll(ATTR)) {
    const attribute = match[1].toLowerCase();
    const url = match[2].trim();
    if (!url) continue;

    const classification = classifyUrl(attribute, url);
    if (classification.kind === "skip") {
      if (/^https?:/i.test(url)) external += 1;
      continue;
    }
    checked += 1;
    if (classification.kind === "forbidden") {
      broken.push({
        page: `/${relative(DIST, page).replaceAll("\\", "/")}`,
        url,
        detail: classification.reason,
      });
      continue;
    }

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
