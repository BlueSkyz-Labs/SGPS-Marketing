import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import {
  getMaisonPendingSections,
  getMaisonSections,
} from "../../src/lib/maison.ts";

const LANGS = ["en", "vi"];
const ADAPTER = "src/lib/maison.ts";

test("C4-B maison: serves the live house sections in order", () => {
  for (const lang of LANGS) {
    const sections = getMaisonSections(lang);
    assert.deepEqual(
      sections.map((section) => section.id),
      ["products", "proof", "studio"],
      `${lang} section order`,
    );
  }
});

test("C4-B maison: every href is a resolvable public page", () => {
  for (const lang of LANGS) {
    for (const section of getMaisonSections(lang)) {
      assert.match(section.href, new RegExp(`^/${lang}/[a-z-]+/$`));
      const slug = section.href.split("/").filter(Boolean)[1];
      const page = `src/pages/${lang}/${slug}.astro`;
      const indexPage = `src/pages/${lang}/${slug}/index.astro`;
      assert.ok(
        existsSync(page) || existsSync(indexPage),
        `${section.id} must point at a real public page (${page})`,
      );
    }
  }
});

test("C4-B maison: sections without a public route fail closed", () => {
  assert.deepEqual(getMaisonPendingSections(), ["architecture", "journal"]);
  for (const lang of LANGS) {
    const ids = getMaisonSections(lang).map((section) => section.id);
    for (const pending of getMaisonPendingSections()) {
      assert.ok(
        !ids.includes(pending),
        `${pending} must be omitted, not invented`,
      );
      assert.ok(
        !existsSync(`src/pages/${lang}/${pending}.astro`) &&
          !existsSync(`src/pages/${lang}/${pending}/index.astro`),
        `${pending} is only pending while it truly has no public route`,
      );
    }
  }
});

test("C4-B maison: labels come from the approved helper, not this module", () => {
  const adapter = readFileSync(ADAPTER, "utf8");
  const literalHrefs = adapter.match(/"\/[a-z]{2}\/[a-z-]+\/"/g) ?? [];
  assert.deepEqual(
    literalHrefs,
    [],
    "adapter must not hard-code route literals",
  );
});

test("C4-B maison: EN/VI parity", () => {
  const en = getMaisonSections("en");
  const vi = getMaisonSections("vi");
  assert.deepEqual(
    vi.map((section) => section.id),
    en.map((section) => section.id),
  );
  for (let index = 0; index < en.length; index += 1) {
    assert.equal(vi[index].href, en[index].href.replace(/^\/en\//, "/vi/"));
    assert.ok(vi[index].label.trim().length > 0, "VI label must be authored");
  }
});
