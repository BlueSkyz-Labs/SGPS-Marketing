/**
 * Audit IX-02: the footer links the Journey through the approved helper, with
 * the section's own title as label, only for a language with a published post
 * of its own (the same gate as the header, src/lib/journal-nav.ts).
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { getFooterGroups, getFooterLinks } from "../../src/data/site.ts";
import { JOURNAL_COPY } from "../../src/data/journal-copy.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const post = (lang, draft = false) => ({ data: { lang, draft } });
const journalLinks = (groups) =>
  groups
    .flatMap((group) => group.links)
    .filter((l) => /\/journal\/$/.test(l.href));

for (const lang of LANGS) {
  test(`${lang}: the Journey link is gated per language and labelled by the section title`, () => {
    assert.deepEqual(journalLinks(getFooterGroups(lang, [])), []);
    assert.deepEqual(
      journalLinks(getFooterGroups(lang, [post(lang, true)])),
      [],
    );
    assert.deepEqual(
      journalLinks(getFooterGroups(lang, [post(lang === "en" ? "vi" : "en")])),
      [],
    );
    assert.deepEqual(journalLinks(getFooterGroups(lang, [post(lang)])), [
      { label: JOURNAL_COPY[lang].title, href: `/${lang}/journal/` },
    ]);
    assert.ok(
      getFooterLinks(lang, [post(lang)]).some(
        (l) => l.href === `/${lang}/journal/`,
      ),
    );
  });
}

test("the real collection gives en and vi the link and zh / zh-Hant none", () => {
  const langs = new Set(
    readdirSync("src/content/journal")
      .filter((f) => f.endsWith(".md"))
      .map(
        (f) =>
          /^lang:\s*"?([\w-]+)"?/m.exec(
            readFileSync(`src/content/journal/${f}`, "utf8"),
          )?.[1],
      ),
  );
  assert.deepEqual([...langs].sort(), ["en", "vi"]);
});

test("the footer component feeds the collection into the helper", () => {
  const footer = readFileSync("src/components/layout/Footer.astro", "utf8");
  assert.match(
    footer,
    /getFooterGroups\(lang, await getCollection\("journal"\)\)/,
  );
});
