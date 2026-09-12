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

for (const path of [
  "/en/privacy/",
  "/en/security/",
  "/en/support/",
  "/vi/privacy/",
  "/vi/security/",
  "/vi/support/",
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
  ["/", "/en/"],
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
    locs.length >= 14,
    `expected at least the 14 canonical URLs, got ${locs.length}`,
  );
  assert(
    locs.every((loc) => /\/(en|vi)\//.test(loc)),
    "sitemap must only list localized canonical routes",
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

check("critical navigation links are present on the EN home", async () => {
  const response = await get("/en/");
  const html = await response.text();
  for (const href of ["/en/products/", "/en/about/", "/en/contact/"]) {
    assert(html.includes(`href="${href}"`), `missing link ${href}`);
  }
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
