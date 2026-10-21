import { expect, test, type Page } from "@playwright/test";

/**
 * Audit wave 2.
 * - B-03: the "What we say" heading on /verify keeps the mt-6 gap above its
 *   first card instead of touching it. (The product pages' "What it does"
 *   list has the same reset, but adding the gap there grows the page past
 *   the UX-U4 length guard; that trade-off is an Owner decision.)
 * - B-02: footer and breadcrumb labels start at their box edge, so short CJK
 *   labels line up with their column and siblings.
 * - B-04: the interim-note contact link uses the in-content link colour, like
 *   the trust links on the same page.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const MIN_GAP = 16;

/** Pixels between each list's preceding heading and the list itself. */
const headingGaps = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((lists) =>
    lists.map((ul) => {
      const h2 = ul.parentElement?.querySelector("h2");
      return h2
        ? ul.getBoundingClientRect().top - h2.getBoundingClientRect().bottom
        : -1;
    }),
  );

/** Links whose text starts more than 1px in from the left of their box. */
const indentedLabels = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((links) =>
    links
      .map((a) => {
        const range = document.createRange();
        range.selectNodeContents(a);
        const text = range.getBoundingClientRect();
        const box = a.getBoundingClientRect();
        return { label: a.textContent?.trim(), inset: text.left - box.left };
      })
      .filter((x) => x.inset > 1)
      .map((x) => `${x.label} +${Math.round(x.inset)}px`),
  );

for (const lang of LANGS) {
  for (const [path, selector] of [
    [`/${lang}/verify/`, "ul[data-evidence-teaser]"],
  ] as const) {
    test(`${path}: heading keeps a gap above its cards`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      const gaps = await headingGaps(page, selector);
      expect(gaps.length).toBeGreaterThan(0);
      for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(MIN_GAP);
    });
  }

  test(`${lang}: footer and breadcrumb labels start at their box edge`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/products/sotro/`);
    expect(await indentedLabels(page, ".footer-nav-link")).toEqual([]);
    expect(await indentedLabels(page, ".breadcrumb-link")).toEqual([]);
  });
}

test("negative proof: a margin reset or centred label is reported", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/verify/");
  await page.addStyleTag({
    content:
      ".verify-claims{margin:0!important}.footer-nav-link{justify-content:center!important}",
  });
  const [gap] = await headingGaps(page, "ul[data-evidence-teaser]");
  expect(gap).toBeLessThan(MIN_GAP);
  expect(
    (await indentedLabels(page, ".footer-nav-link")).length,
  ).toBeGreaterThan(0);
});

for (const lang of LANGS) {
  test(`${lang}: interim-note link matches the page's trust links`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotam/`);
    const colour = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).color);
    const note = page.locator("[data-interim-note] a");
    test.skip((await note.count()) === 0, "no interim note on this record");
    expect(await colour("[data-interim-note] a")).toBe(
      await colour(".profile-trust-link"),
    );
  });
}

test("negative proof: a secondary-text interim link is reported", async ({
  page,
}) => {
  await page.goto("/en/products/sotam/");
  await page.addStyleTag({
    content: "[data-interim-note] a{color:var(--text-secondary)!important}",
  });
  const colour = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).color);
  expect(await colour("[data-interim-note] a")).not.toBe(
    await colour(".profile-trust-link"),
  );
});

/**
 * The interim-note contact link sits inside a sentence, so it takes the
 * WCAG 2.5.8 inline exception (Owner 2026-10-18, B-01) instead of a 44 px
 * inline-flex box that doubled the leading of its line. Its destination keeps
 * a tap-sized twin (the Contact link in the footer).
 */
const interimLink = (page: Page) =>
  page
    .locator("[data-interim-note] a")
    .first()
    .evaluate((a) => {
      const lineHeight = Number.parseFloat(
        getComputedStyle(a.closest("p") as Element).lineHeight,
      );
      const twin = [...document.querySelectorAll("a[href]")].some((b) => {
        if (b === a || b.getAttribute("href") !== a.getAttribute("href"))
          return false;
        const r = b.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44;
      });
      return {
        display: getComputedStyle(a).display,
        // Per line box: G6 puts the link inside the availability line, where
        // a narrow phone may wrap it over two lines (one box per line).
        height: Math.max(...[...a.getClientRects()].map((r) => r.height)),
        lineHeight,
        twin,
      };
    });

for (const lang of LANGS) {
  test(`${lang}: interim-note link keeps its sentence's leading`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/products/sotro/`);
    test.skip(
      (await page.locator("[data-interim-note] a").count()) === 0,
      "no interim note on this record",
    );
    const link = await interimLink(page);
    expect(link.display).toBe("inline");
    expect(link.height).toBeLessThanOrEqual(link.lineHeight);
    expect(link.twin).toBe(true);
  });
}

test("negative proof: a 44 px inline-flex interim link is reported", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/products/sotro/");
  await page.addStyleTag({
    content:
      "[data-interim-note] a{display:inline-flex!important;min-height:44px!important}",
  });
  const link = await interimLink(page);
  expect(link.display).not.toBe("inline");
  expect(link.height).toBeGreaterThan(link.lineHeight);
});
