#!/usr/bin/env node
/**
 * Post-deploy smoke check for the production site (S+ Task 12C / issue #101).
 *
 * Read-only GETs against the live site. Records evidence (site, timestamp,
 * optional commit SHA) and exits non-zero on any failed check.
 *
 * Usage:
 *   node scripts/smoke-production.mjs [--site https://blueskyzlabs.com]
 */
import { readFileSync } from "node:fs";
import {
  assetProblem,
  buildHeaderExpectations,
  extractProductPaths,
  extractSameOriginAssetPaths,
  htmlHeaderProblems,
  immutableAssetHeaderProblems,
} from "./smoke-assets.mjs";
import {
  SUPPORTED_LANGUAGES,
  isLocalizedCanonicalRoute,
} from "./smoke-locales.mjs";

const DEFAULT_SITE = "https://blueskyzlabs.com";

function resolveSite() {
  const index = process.argv.indexOf("--site");
  const candidate =
    index !== -1 ? process.argv[index + 1] : process.env.SMOKE_SITE_URL;
  return (candidate ?? DEFAULT_SITE).replace(/\/+$/, "");
}

const site = resolveSite();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function get(path) {
  return fetch(`${site}${path}`, {
    redirect: "manual",
    headers: { "user-agent": "blueskyz-production-smoke" },
  });
}

const checks = [];
function check(name, run) {
  checks.push({ name, run });
}

check(
  "EN home responds 200 with the hero proposition and no noindex",
  async () => {
    const response = await get("/en/");
    assert(response.status === 200, `status ${response.status}`);
    const html = await response.text();
    assert(html.includes("Intelligence. Elevated."), "hero tagline missing");
    assert(
      !/<meta\s+name="robots"[^>]*noindex/i.test(html),
      "unexpected robots noindex on the production home",
    );
  },
);

check("VI home responds 200 with the localized hero", async () => {
  const response = await get("/vi/");
  assert(response.status === 200, `status ${response.status}`);
  const html = await response.text();
  assert(html.includes("Trí tuệ"), "localized tagline missing");
});

check("zh-Hans home responds 200", async () => {
  const response = await get("/zh/");
  assert(response.status === 200, `status ${response.status}`);
});

check("zh-Hant home responds 200", async () => {
  const response = await get("/zh-hant/");
  assert(response.status === 200, `status ${response.status}`);
});

for (const path of [
  "/en/privacy/",
  "/en/security/",
  "/en/support/",
  "/vi/privacy/",
  "/vi/security/",
  "/vi/support/",
  "/zh/privacy/",
  "/zh/security/",
  "/zh/support/",
]) {
  check(`${path} responds 200`, async () => {
    const response = await get(path);
    assert(response.status === 200, `status ${response.status}`);
  });
}

check(
  "canonical metadata matches the production domain on /en/about/",
  async () => {
    const response = await get("/en/about/");
    const html = await response.text();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(
      canonical === `${site}/en/about/`,
      `unexpected canonical: ${canonical ?? "missing"}`,
    );
  },
);

const LEGACY_REDIRECTS = [
  ["/about/", "/en/about/"],
  ["/contact/", "/en/contact/"],
  ["/privacy/", "/en/privacy/"],
  ["/security/", "/en/security/"],
  ["/support/", "/en/support/"],
  ["/products/", "/en/products/"],
];

for (const [from, to] of LEGACY_REDIRECTS) {
  check(`legacy ${from} redirects to ${to}`, async () => {
    const response = await get(from);
    if ([301, 302, 307, 308].includes(response.status)) {
      const location = response.headers.get("location") ?? "";
      assert(
        location === to || location === `${site}${to}`,
        `unexpected location ${location}`,
      );
      return;
    }
    assert(response.status === 200, `status ${response.status}`);
    const html = await response.text();
    assert(html.includes(`url=${to}`), `meta-refresh stub must target ${to}`);
  });
}

check("root serves the bounded language gateway", async () => {
  const response = await get("/");
  assert(response.status === 200, `status ${response.status}`);
  const html = await response.text();
  // Owner 2026-10-01 (F16): the gateway is the indexable x-default language
  // selector, so production must not mark it noindex and it is self-canonical.
  assert(
    !/<meta\s+name="robots"[^>]*noindex/i.test(html),
    "root gateway must be indexable as the x-default language selector",
  );
  assert(
    /<link\s+rel="canonical"\s+href="https:\/\/[^"]+\/"/i.test(html),
    "root gateway must declare its own canonical URL",
  );
  assert(
    html.includes('data-language-choice="vi"') &&
      html.includes('data-language-choice="en"') &&
      html.includes('data-language-choice="zh"') &&
      html.includes('data-language-choice="zh-hant"'),
    "root gateway must expose explicit VI/EN/zh/zh-hant choices",
  );
});

check("robots.txt allows crawling and links the sitemap", async () => {
  const response = await get("/robots.txt");
  const text = await response.text();
  assert(/Allow: \//.test(text), "robots.txt must allow crawling");
  assert(text.includes(`${site}/sitemap.xml`), "sitemap link missing");
});

check("sitemap lists only canonical localized routes", async () => {
  const response = await get("/sitemap.xml");
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert(
    locs.length >= 21,
    `expected at least the 21 canonical URLs, got ${locs.length}`,
  );
  assert(
    locs.every((loc) => isLocalizedCanonicalRoute(loc, site)),
    "sitemap must only list same-origin localized canonical routes",
  );
});

check("decision room responds with its workspace", async () => {
  const response = await get("/en/decision-room/");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const html = await response.text();
  assert(
    html.includes("data-decision-room"),
    "missing decision-room workspace",
  );
});

check("evidence passport for the security claim is public", async () => {
  const response = await get("/en/evidence/security-reporting-is-private/");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const html = await response.text();
  assert(
    html.includes("data-evidence-passport"),
    "missing evidence passport markup",
  );
});

check("public SGPS manifest is served", async () => {
  const response = await get("/.well-known/sgps.json");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const body = await response.text();
  assert(
    body.includes('"schemaVersion": "1.0"'),
    "manifest must declare schema version 1.0",
  );
});

check("machine-readable security policy is served", async () => {
  const response = await get("/.well-known/security.txt");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const body = await response.text();
  assert(body.includes("Contact:"), "security.txt must declare Contact");
  assert(body.includes("Expires:"), "security.txt must declare Expires");
});

check("branded 404 is served on unknown paths", async () => {
  for (const path of [
    "/en/no-such-page/",
    "/vi/khong-ton-tai/",
    "/no-such-root/",
  ]) {
    const response = await get(path);
    assert(
      response.status === 404,
      `${path}: expected 404, got ${response.status}`,
    );
    const html = await response.text();
    assert(
      html.includes("Page not found") || html.includes("không tìm thấy"),
      `${path}: branded 404 content missing`,
    );
    assert(
      html.length > 5000,
      `${path}: 404 page looks like a blank stub (${html.length} bytes)`,
    );
  }
});

check("critical navigation links are present on the EN home", async () => {
  const response = await get("/en/");
  const html = await response.text();
  for (const href of ["/en/products/", "/en/about/", "/en/contact/"]) {
    assert(html.includes(`href="${href}"`), `missing link ${href}`);
  }
});

const ASSET_CONCURRENCY = 6;
const MAX_ASSETS = 500;

async function mapBounded(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]);
      }
    },
  );
  await Promise.all(lanes);
  return results;
}

async function fetchHtml(path) {
  const response = await get(path);
  assert(response.status === 200, `${path}: status ${response.status}`);
  return response.text();
}

check(
  "built pages reference only reachable same-origin assets (no redirects, right type)",
  async () => {
    const pages = [];
    for (const locale of SUPPORTED_LANGUAGES) {
      pages.push(`/${locale}/`);
      const indexPath = `/${locale}/products/`;
      pages.push(indexPath);
      const productPaths = extractProductPaths(
        await fetchHtml(indexPath),
        locale,
      );
      assert(productPaths.length > 0, `${indexPath}: no product pages linked`);
      pages.push(...productPaths);
    }
    const assets = new Map();
    for (const path of [...new Set(pages)]) {
      const html = await fetchHtml(path);
      for (const asset of extractSameOriginAssetPaths(
        html,
        `${site}${path}`,
        site,
      )) {
        if (!assets.has(asset)) assets.set(asset, path);
      }
    }
    assert(assets.size > 0, "no same-origin assets found on any page");
    assert(
      assets.size <= MAX_ASSETS,
      `asset count ${assets.size} exceeds the smoke bound ${MAX_ASSETS}`,
    );
    const offenders = (
      await mapBounded([...assets.keys()], ASSET_CONCURRENCY, async (asset) => {
        try {
          const response = await get(asset);
          await response.body?.cancel();
          const problem = assetProblem({
            pathname: new URL(asset, site).pathname,
            status: response.status,
            contentType: response.headers.get("content-type"),
            location: response.headers.get("location"),
          });
          return problem
            ? `${asset} (from ${assets.get(asset)}): ${problem}`
            : null;
        } catch (error) {
          return `${asset}: ${error.message}`;
        }
      })
    ).filter(Boolean);
    assert(
      offenders.length === 0,
      `${offenders.length}/${assets.size} asset(s) unhealthy:\n  ${offenders.join("\n  ")}`,
    );
  },
);

const headerExpectations = buildHeaderExpectations(
  readFileSync(new URL("../public/_headers", import.meta.url), "utf8"),
);

check(
  "HTML routes carry the expected CSP, COOP, CORP and nosniff",
  async () => {
    const failures = [];
    for (const path of ["/en/", "/vi/", "/en/products/"]) {
      const response = await get(path);
      assert(response.status === 200, `${path}: status ${response.status}`);
      await response.body?.cancel();
      for (const problem of htmlHeaderProblems(
        (name) => response.headers.get(name),
        headerExpectations,
      )) {
        failures.push(`${path}: ${problem}`);
      }
    }
    assert(failures.length === 0, failures.join("; "));
  },
);

check("hashed /_astro/ assets are served immutable", async () => {
  const html = await fetchHtml("/en/");
  const asset = extractSameOriginAssetPaths(html, `${site}/en/`, site).find(
    (path) => path.startsWith("/_astro/"),
  );
  assert(asset, "no /_astro/ asset referenced from /en/");
  const response = await get(asset);
  await response.body?.cancel();
  assert(response.status === 200, `${asset}: status ${response.status}`);
  const problems = immutableAssetHeaderProblems(
    (name) => response.headers.get(name),
    headerExpectations,
  );
  assert(problems.length === 0, `${asset}: ${problems.join("; ")}`);
});

const commitSha = process.env.SMOKE_COMMIT_SHA ?? process.env.GITHUB_SHA;
console.log(
  `Production smoke: ${site} at ${new Date().toISOString()}${
    commitSha
      ? ` (commit ${commitSha})`
      : " (commit: set SMOKE_COMMIT_SHA to record the deployed SHA)"
  }`,
);

let failed = 0;
for (const { name, run } of checks) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`${failed} production smoke check(s) failed`);
  process.exit(1);
}

console.log("ALL PRODUCTION SMOKE CHECKS PASS");
