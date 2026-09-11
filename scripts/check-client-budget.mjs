#!/usr/bin/env node
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CLIENT_JS_HARD_BUDGET_BYTES = 120_000;

function collectLocalScriptSrcs(html, htmlDir, distDir) {
  const srcs = [];
  const pattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const src = match[1];
    if (!src || /^https?:\/\//i.test(src) || src.startsWith("//")) {
      continue;
    }
    const cleaned = src.split("?")[0].split("#")[0];
    // Absolute URL paths resolve against the dist root; page-relative paths
    // resolve against the page directory.
    const resolved = cleaned.startsWith("/")
      ? resolve(distDir, `.${cleaned}`)
      : resolve(htmlDir, cleaned);
    srcs.push(resolved);
  }
  return [...new Set(srcs)];
}

function listHtmlFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

// S+ Wave 1 / Task 1: enforce the hard client-JS ceiling against EVERY built
// page (worst-case visitor), not only dist/index.html. A later interactive
// wave may not exceed this budget on any route.
export function measureClientJsBudget(distDir = "dist") {
  const indexPath = join(distDir, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`Missing ${indexPath}`);
  }

  const uniqueFiles = new Map();
  const pages = [];
  let maxPageBrotliBytes = 0;
  let maxPagePath = null;

  for (const htmlPath of listHtmlFiles(distDir)) {
    const html = readFileSync(htmlPath, "utf8");
    const scriptPaths = collectLocalScriptSrcs(
      html,
      dirname(htmlPath),
      distDir,
    );
    let pageBrotliBytes = 0;

    for (const filePath of scriptPaths) {
      if (!existsSync(filePath)) {
        throw new Error(`Referenced script missing: ${filePath}`);
      }
      let entry = uniqueFiles.get(filePath);
      if (!entry) {
        const raw = readFileSync(filePath);
        const compressed = brotliCompressSync(raw, {
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
          },
        });
        entry = {
          path: filePath,
          rawBytes: raw.byteLength,
          brotliBytes: compressed.byteLength,
        };
        uniqueFiles.set(filePath, entry);
      }
      pageBrotliBytes += entry.brotliBytes;
    }

    pages.push({ path: htmlPath, brotliBytes: pageBrotliBytes });
    if (pageBrotliBytes > maxPageBrotliBytes) {
      maxPageBrotliBytes = pageBrotliBytes;
      maxPagePath = htmlPath;
    }
  }

  const files = [...uniqueFiles.values()];
  const totalBrotliBytes = files.reduce(
    (sum, file) => sum + file.brotliBytes,
    0,
  );

  return {
    indexPath,
    files,
    totalBrotliBytes,
    maxPageBrotliBytes,
    maxPagePath,
    pages,
    budgetBytes: CLIENT_JS_HARD_BUDGET_BYTES,
    withinBudget:
      totalBrotliBytes < CLIENT_JS_HARD_BUDGET_BYTES &&
      maxPageBrotliBytes < CLIENT_JS_HARD_BUDGET_BYTES,
  };
}

export function assertNoFrameworkClientLeak(distDir = "dist") {
  if (!existsSync(distDir)) {
    throw new Error(`Missing ${distDir}`);
  }
  for (const htmlPath of listHtmlFiles(distDir)) {
    const html = readFileSync(htmlPath, "utf8");
    if (/_next\/static|__NEXT_DATA__/i.test(html)) {
      throw new Error(`Next runtime leak detected in ${htmlPath}`);
    }
  }
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = measureClientJsBudget("dist");
  assertNoFrameworkClientLeak("dist");
  console.log(JSON.stringify(result, null, 2));
  if (!result.withinBudget) {
    console.error(
      `Client JS budget exceeded: site-wide ${result.totalBrotliBytes} or worst page ${result.maxPageBrotliBytes} >= ${result.budgetBytes} (worst page: ${result.maxPagePath ?? "n/a"})`,
    );
    process.exit(1);
  }
  console.log(
    `Client JS budget PASS: site-wide ${result.totalBrotliBytes}, worst page ${result.maxPageBrotliBytes} < ${result.budgetBytes} Brotli bytes`,
  );
}
