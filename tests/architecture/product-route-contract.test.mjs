/**
 * C2 — product route contract (fail-closed).
 *
 * `getProductProfilePath()` emits `/{lang}/products/{slug}/`, so the moment a
 * product is published the locale profile routes must exist and must render a
 * real profile (never a redirect stub). This guard closes the gap that an
 * empty registry hides today.
 *
 * Paths are repository-relative (matching the rest of tests/architecture).
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const PRODUCT_ENTRIES_DIR = "src/content/products";
const LOCALES = ["en", "vi"];
const PROFILE_ROUTES = LOCALES.map(
  (lang) => `src/pages/${lang}/products/[slug].astro`,
);
const INDEX_ROUTES = LOCALES.map(
  (lang) => `src/pages/${lang}/products/index.astro`,
);
const ROOT_STUBS = ["src/pages/index.astro", "src/pages/products/index.astro"];

/** Public products declared by the content registry (README excluded). */
function publicProductCount(dir = PRODUCT_ENTRIES_DIR) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir)
    .filter((name) => /\.(md|mdx|ya?ml|json)$/i.test(name))
    .filter((name) => {
      const source = readFileSync(join(dir, name), "utf8");
      return /^\s*public:\s*true\s*$/m.test(source);
    }).length;
}

/**
 * The detector the guard uses, exported for non-vacuity proof.
 * Returns a list of findings; empty means the routes satisfy the contract.
 */
function missingRouteFindings({ publicProducts, profileRoutes, routeSources }) {
  const findings = [];
  if (publicProducts > 0) {
    for (const route of profileRoutes) {
      if (!routeSources[route]) {
        findings.push(`${route} is missing`);
      } else if (/Astro\.redirect\(/.test(routeSources[route])) {
        findings.push(`${route} is still a redirect stub`);
      }
    }
    if (findings.length > 0) {
      findings.push(
        `${publicProducts} public product(s) would link to a path that does not render`,
      );
    }
  }
  return findings;
}

const readIfPresent = (path) =>
  existsSync(path) ? readFileSync(path, "utf8") : null;

test("the locale product index routes exist for every locale", () => {
  for (const route of INDEX_ROUTES) {
    assert.ok(existsSync(route), `${route} must exist`);
  }
});

test("the profile path helper stays locale-prefixed", () => {
  const helper = readFileSync("src/lib/product-routes.ts", "utf8");
  assert.match(helper, /\$\{lang\}\/products\/\$\{slug\}/);
  for (const lang of LOCALES) {
    assert.match(
      helper,
      new RegExp(`${lang}|lang`),
      "helper must be bilingual",
    );
  }
});

test("legacy root paths stay redirect stubs, never dead ends", () => {
  for (const stub of ROOT_STUBS) {
    const source = readFileSync(stub, "utf8");
    assert.match(
      source,
      /Astro\.redirect\("\/en/,
      `${stub} must redirect to a locale path`,
    );
    // A stub must not carry a rendered template: everything after the second
    // frontmatter fence is dead weight that could surface as a stale page.
    const body = source.split(/^---$/m).slice(2).join("---").trim();
    assert.equal(body, "", `${stub} must not render a template`);
  }
  // The legacy product profile route is deliberately retained WITH its
  // implementation (its own architecture contracts pin it) and guarded by a
  // redirect so nothing renders while the registry is empty.
  const legacyProfile = readFileSync("src/pages/products/[slug].astro", "utf8");
  assert.match(legacyProfile, /export async function getStaticPaths\(\)/);
  assert.match(legacyProfile, /Astro\.redirect\("\/en\/products\/"\)/);
});

test("public products without locale profile routes are caught (non-vacuity)", () => {
  const findings = missingRouteFindings({
    publicProducts: 1,
    profileRoutes: PROFILE_ROUTES,
    routeSources: {},
  });
  assert.ok(findings.length > 0, "the detector must report missing routes");
  assert.match(findings[0], /is missing/);

  const stubFindings = missingRouteFindings({
    publicProducts: 2,
    profileRoutes: PROFILE_ROUTES,
    routeSources: Object.fromEntries(
      PROFILE_ROUTES.map((route) => [
        route,
        '---\nreturn Astro.redirect("/en/products/");\n---\n',
      ]),
    ),
  });
  assert.ok(
    stubFindings.some((finding) => /redirect stub/.test(finding)),
    "the detector must reject a redirect stub as a profile page",
  );

  const cleanFindings = missingRouteFindings({
    publicProducts: 1,
    profileRoutes: PROFILE_ROUTES,
    routeSources: Object.fromEntries(
      PROFILE_ROUTES.map((route) => [
        route,
        "---\nconst { product } = Astro.props;\n---\n",
      ]),
    ),
  });
  assert.deepEqual(
    cleanFindings,
    [],
    "a real profile page must satisfy the guard",
  );
});

test("the shipped registry satisfies the route contract", () => {
  const publicProducts = publicProductCount();
  const routeSources = Object.fromEntries(
    PROFILE_ROUTES.map((route) => [route, readIfPresent(route)]),
  );
  const findings = missingRouteFindings({
    publicProducts,
    profileRoutes: PROFILE_ROUTES,
    routeSources,
  });
  assert.deepEqual(
    findings,
    [],
    `product route contract violated: ${findings.join("; ")}`,
  );
});
