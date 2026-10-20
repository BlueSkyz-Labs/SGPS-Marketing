import { expect, test, type Page } from "@playwright/test";
import {
  hasPublishedJournalEntry,
  journalNavItems,
} from "../../src/lib/journal-nav.ts";

/**
 * Owner decisions 2026-10-20:
 *  - ACQ-10: on the home page each product has ONE primary link per section;
 *    the hero product names are plain text.
 *  - ACQ-09: the header Products control carries the About/Contact current
 *    cue (bold + underline) on every page under /<lang>/products/.
 *  - TRU-15: Journal is absent from the header, the mobile menu and the
 *    command navigator until the journal collection holds a published entry.
 * Every guard has a negative proof that breaks the invariant on the live page
 * (or on the pure helper) and shows the detector fires.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const DESKTOP_MIN = 768;

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

async function productsControl(page: Page, lang: string) {
  const mobile = (page.viewportSize()?.width ?? 1280) < DESKTOP_MIN;
  if (mobile) {
    await page.locator("header details > summary").click();
    return page.locator(
      `header details nav a:not(.lang-option)[href="/${lang}/products/"]`,
    );
  }
  return page.locator(`header nav a.btn[href="/${lang}/products/"]`);
}

async function currentCue(page: Page, lang: string, current: boolean) {
  const control = await productsControl(page, lang);
  if (current) {
    await expect(control).toHaveAttribute("data-nav-current", "");
  } else {
    await expect(control).not.toHaveAttribute("data-nav-current", /.*/);
  }
  return control.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      underline: cs.textDecorationLine.includes("underline"),
      bar: cs.boxShadow !== "none",
      weight: Number(cs.fontWeight),
    };
  });
}

for (const lang of LOCALES) {
  test(`ACQ-09 /${lang}/: Products shows the current cue on the index and on a profile, not elsewhere`, async ({
    page,
  }, testInfo) => {
    const mobile = testInfo.project.name.includes("mobile");
    for (const path of ["products/", "products/sotro/"]) {
      await page.goto(`/${lang}/${path}`);
      const cue = await currentCue(page, lang, true);
      if (mobile) expect(cue.bar, `${path} menu bar`).toBe(true);
      else {
        expect(cue.underline, `${path} underline`).toBe(true);
        expect(cue.weight).toBeGreaterThanOrEqual(700);
      }
    }
    for (const path of ["", "about/", "contact/"]) {
      await page.goto(`/${lang}/${path}`);
      const cue = await currentCue(page, lang, false);
      expect(cue.underline, `${path} no underline`).toBe(false);
      // The desktop pill carries its own shadow; the bar is a menu cue.
      if (mobile) expect(cue.bar, `${path} no bar`).toBe(false);
    }
  });
}

test("ACQ-09: the Products cue matches the About cue (same underline, same weight)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop nav only");
  await page.goto("/en/about/");
  const about = await page
    .locator('header nav a:not(.lang-option)[href="/en/about/"]')
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return [
        cs.textDecorationLine,
        cs.textDecorationThickness,
        cs.textUnderlineOffset,
        cs.fontWeight,
      ];
    });
  await page.goto("/en/products/");
  const products = await page
    .locator('header nav a.btn[href="/en/products/"]')
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return [
        cs.textDecorationLine,
        cs.textDecorationThickness,
        cs.textUnderlineOffset,
        cs.fontWeight,
      ];
    });
  expect(products).toEqual(about);
});

test("ACQ-09 negative proof: without the data attribute the pill has no underline", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop nav only");
  await page.goto("/en/products/sotro/");
  const pill = page.locator('header nav a.btn[href="/en/products/"]');
  await pill.evaluate((el) => el.removeAttribute("data-nav-current"));
  expect(
    await pill.evaluate((el) =>
      getComputedStyle(el).textDecorationLine.includes("underline"),
    ),
  ).toBe(false);
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

for (const lang of LOCALES) {
  test(`TRU-15 /${lang}/: no Journal in header, mobile menu or navigator while it is empty`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    expect(await journalLinkCount(page)).toBe(0);
    // The route itself is not deleted.
    const res = await page.goto(`/${lang}/journal/`);
    expect(res?.status()).toBe(200);
  });
}

test("TRU-15 negative proof: an injected Journal link is detected", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/en/journal/";
    document.querySelector("header nav")!.append(a);
  });
  expect(await journalLinkCount(page)).toBe(1);
});

test("TRU-15 gate: Journal appears only with at least one published entry", () => {
  const published = { data: { draft: false } };
  const draft = { data: { draft: true } };
  for (const lang of LOCALES) {
    expect(journalNavItems(lang, [])).toEqual([]);
    expect(journalNavItems(lang, [draft])).toEqual([]);
    const items = journalNavItems(lang, [draft, published]);
    expect(items).toHaveLength(1);
    expect(items[0]!.href).toBe(`/${lang}/journal/`);
    expect(items[0]!.label.length).toBeGreaterThan(0);
  }
  expect(hasPublishedJournalEntry([])).toBe(false);
  expect(hasPublishedJournalEntry([published])).toBe(true);
});
