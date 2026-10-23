import { expect, test, type Page } from "@playwright/test";
import {
  hasPublishedJournalEntry,
  journalNavItems,
} from "../../src/lib/journal-nav.ts";

/**
 * Owner decisions 2026-10-20:
 *  - ACQ-10: on the home page each product has ONE primary link per section;
 *    the hero product names are plain text.
 *  - TRU-15: Journal is absent from the header, the mobile menu and the
 *    command navigator until the journal collection holds a published entry
 *    in that language (pure-helper test below); with the first posts it
 *    appears, labelled "Journey" / "Hành trình" (Owner D-2).
 * Every guard has a negative proof that breaks the invariant on the live page
 * (or on the pure helper) and shows the detector fires.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** Per home section, the product hrefs linked more than once. */
async function duplicateProductLinks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const sections = [...document.querySelectorAll("main section")];
    for (const section of sections) {
      const seen = new Map<string, number>();
      for (const a of section.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href")!;
        if (!/\/products\/[^/]+\/$/.test(href)) continue;
        seen.set(href, (seen.get(href) ?? 0) + 1);
      }
      for (const [href, n] of seen) {
        if (n > 1)
          out.push(`${section.getAttribute("aria-labelledby")}: ${href} x${n}`);
      }
    }
    return out;
  });
}

for (const lang of LOCALES) {
  test(`ACQ-10 /${lang}/: one link per product per home section; hero names are text`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    expect(await duplicateProductLinks(page)).toEqual([]);
    const line = page.locator("[data-hero-product-line]");
    await expect(line).toBeVisible();
    await expect(line.locator("a")).toHaveCount(0);
    await expect(line.locator("[data-hero-product-name]")).toHaveCount(2);
    // The product stays reachable: the hero entry and the house row CTA.
    await expect(
      page.locator("main a[href$='/products/sotam/']").first(),
    ).toBeVisible();
  });
}

test("ACQ-10 negative proof: a second link to the same product in a section is detected", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => {
    const section = document.querySelector("[data-product-house]")!;
    const row = section.querySelector("[data-product-cta]")!;
    const dup = document.createElement("a");
    dup.href = row.getAttribute("href")!;
    dup.textContent = "dup";
    row.after(dup);
  });
  expect((await duplicateProductLinks(page)).length).toBeGreaterThan(0);
});

// --- TRU-15 -----------------------------------------------------------------

async function journalLinkCount(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.querySelectorAll(
        'header a[href*="/journal"], dialog[data-command-navigator] a[href*="/journal"], dialog[data-command-navigator] [data-href*="/journal"]',
      ).length,
  );
}

/** The section's own label (Owner D-2, 2026-10-22), from JOURNAL_COPY. */
const JOURNAL_LABEL = {
  en: "Journey",
  vi: "Hành trình",
  zh: "日志",
  "zh-hant": "日誌",
} as const;

/** Locales holding published Journey posts (VI + EN pairs, P1-B). */
const WITH_POSTS = new Set<string>(["en", "vi"]);

for (const lang of LOCALES) {
  // Journey P1-B: en and vi hold published posts, so their gate is open; zh and
  // zh-Hant hold none, so they must not send a visitor to an empty index (the
  // per-language rule is pinned by the pure-helper test below).
  const open = WITH_POSTS.has(lang);
  test(`TRU-15 /${lang}/: the Journal is ${open ? "in" : "absent from"} the header, mobile menu and navigator`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    // desktop header + mobile menu + command navigator
    expect(await journalLinkCount(page)).toBe(open ? 3 : 0);
    if (!open) return;
    await expect(
      page.locator(`header a[href="/${lang}/journal/"]`).first(),
    ).toHaveText(JOURNAL_LABEL[lang]);
    const res = await page.goto(`/${lang}/journal/`);
    expect(res?.status()).toBe(200);
  });
}

test("TRU-15 negative proof: an injected Journal link is detected", async ({
  page,
}) => {
  await page.goto("/en/");
  const before = await journalLinkCount(page);
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/en/journal/";
    document.querySelector("header nav")!.append(a);
  });
  expect(await journalLinkCount(page)).toBe(before + 1);
});

test("TRU-15 gate: Journal appears only with a published entry in that language", () => {
  for (const lang of LOCALES) {
    const published = { data: { draft: false, lang } };
    const draft = { data: { draft: true, lang } };
    expect(journalNavItems(lang, [])).toEqual([]);
    expect(journalNavItems(lang, [draft])).toEqual([]);
    const items = journalNavItems(lang, [draft, published]);
    expect(items).toHaveLength(1);
    expect(items[0]!.href).toBe(`/${lang}/journal/`);
    expect(items[0]!.label.length).toBeGreaterThan(0);
    // Negative proof: a post published only in another language opens no gate.
    const other = lang === "en" ? "vi" : "en";
    expect(
      journalNavItems(lang, [{ data: { draft: false, lang: other } }]),
    ).toEqual([]);
  }
  expect(hasPublishedJournalEntry([])).toBe(false);
  expect(hasPublishedJournalEntry([{ data: { draft: false } }])).toBe(true);
});
