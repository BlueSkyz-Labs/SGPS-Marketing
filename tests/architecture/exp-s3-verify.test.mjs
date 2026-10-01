/**
 * Experience v6 S3 — /verify route contract (source level).
 * Complements tests/e2e/exp-s3-verify.spec.ts, which measures the rendered
 * pages. Each guard is a pure predicate over source text, exercised on the
 * real files and on an intentionally broken copy (negative proof).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

const mountsVerify = (source, lang) =>
  source.includes(`path="/${lang}/verify/"`) &&
  new RegExp(`<VerifyCentre lang="${lang}"`).test(source);
const linksToVerify = (source) =>
  /href=\{`\/\$\{lang\}\/verify\/`\}|href="\/(en|vi|zh|zh-hant)\/verify\/"/.test(
    source,
  );
const inlinesEvidence = (source) =>
  /import\s+(Atlas|SourceTrace|TrustLedger|EvidenceTeaser)\b|<(Atlas|SourceTrace|TrustLedger|EvidenceTeaser)\b/.test(
    source,
  );
const listsPath = (seoSource, lang) => seoSource.includes(`"/${lang}/verify/"`);

test("/verify exists in all four locales and mounts the verification centre", () => {
  for (const lang of LOCALES) {
    const file = `src/pages/${lang}/verify.astro`;
    assert.ok(existsSync(file), `${file} missing`);
    const source = read(file);
    assert.ok(mountsVerify(source, lang), `${lang} must mount VerifyCentre`);
    // Negative proof: a page that points at the wrong locale/path fails.
    assert.ok(
      !mountsVerify(source.replace(`/${lang}/verify/`, "/en/verify/"), "vi") ||
        lang === "vi",
    );
    assert.ok(
      !mountsVerify(source.replace("<VerifyCentre", "<div"), lang),
      "removing the mount must fail the guard",
    );
  }
});

test("/verify is in the sitemap/hreflang path list for every locale", () => {
  const seo = read("src/lib/seo.ts");
  for (const lang of LOCALES) {
    assert.ok(listsPath(seo, lang), `${lang} verify path not listed`);
    assert.ok(
      !listsPath(seo.replaceAll(`"/${lang}/verify/"`, ""), lang),
      "removing the entry must fail the guard",
    );
  }
});

test("footer navigation links to /verify in every locale", () => {
  const site = read("src/data/site.ts");
  const footerBody = site.slice(site.indexOf("export function getFooterLinks"));
  assert.match(footerBody, /l\.verify, href: `\/\$\{lang\}\/verify\/`/);
  assert.equal(
    (site.match(/^\s{4}verify: "/gm) ?? []).length,
    LOCALES.length,
    "one nav label per locale",
  );
  assert.doesNotMatch(
    footerBody.replace("/verify/", "/security/"),
    /l\.verify, href: `\/\$\{lang\}\/verify\/`/,
  );
});

test("the home proof band links to /verify (and only one route)", () => {
  const band = read("src/components/sections/ProofBand.astro");
  assert.ok(linksToVerify(band));
  assert.equal((band.match(/<a\b/g) ?? []).length, 1);
  // Negative proof: pointing the band back at /security/ fails the guard.
  assert.ok(!linksToVerify(band.replace("/verify/", "/security/")));
});

test("products index and security carry no inlined Atlas/trace/ledger; products links to /verify", () => {
  for (const lang of LOCALES) {
    const products = read(`src/pages/${lang}/products/index.astro`);
    assert.ok(!inlinesEvidence(products), `${lang} products inlines evidence`);
    assert.ok(linksToVerify(products), `${lang} products must link /verify`);
    assert.doesNotMatch(products, /surface="products"/);
    assert.ok(
      inlinesEvidence(
        products + '\nimport Atlas from "@/components/experience/Atlas.astro";',
      ),
      "re-adding Atlas must fail the guard",
    );
    // v8 W5a: the security page no longer mounts the integrity lens at all.
    const security = read(`src/pages/${lang}/security.astro`);
    assert.doesNotMatch(security, /surface=/, `${lang} security`);
    assert.ok(!security.includes("SourceTrace"));
  }
});

test("evidence capabilities are mounted on /verify, not deleted", () => {
  const centre = read("src/components/verify/VerifyCentre.astro");
  // v8 W5a: claims and sources render inline (SourcesLine); the duplicated
  // trace and per-page layers are gone, the claim map stays as one disclosure.
  for (const used of ["Atlas", "TrustLedger", "SourcesLine"]) {
    assert.match(centre, new RegExp(`import ${used}\\b`), used);
  }
  assert.match(centre, /decision-room/);
  // Layers are native disclosures: no JavaScript is needed to open them.
  assert.equal((centre.match(/<details\s+class=/g) ?? []).length, 1);
  assert.doesNotMatch(centre, /<(SourceTrace|IntegrityLens)\b/);
  assert.doesNotMatch(centre, /<script\b/);
  for (const route of [
    "decision-room.astro",
    "dossier/index.astro",
    "architecture/index.astro",
    "editions/index.astro",
  ]) {
    assert.ok(existsSync(`src/pages/en/${route}`), `${route} must remain`);
  }
});
