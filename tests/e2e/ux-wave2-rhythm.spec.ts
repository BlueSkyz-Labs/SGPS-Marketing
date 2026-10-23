import { expect, test, type Page } from "@playwright/test";

/**
 * Audit wave 2.
 * - B-03: the "What we say" heading on /verify keeps the mt-6 gap above its
 *   first card instead of touching it. (The product pages' "What it does"
 *   list has the same reset, but adding the gap there grows the page past
 *   the UX-U4 length guard; that trade-off is an Owner decision.)
 * - B-02: footer and breadcrumb labels start at their box edge, so short CJK
 *   labels line up with their column and siblings.
 * - B-04 / B-01 (replaced 2026-10-23, EX-01): the contact action used to be an
 *   inline link inside the availability sentence (in-content link colour, WCAG
 *   2.5.8 inline exception). It is now the secondary button beside the primary
 *   action, so the guards below assert the button's own contract instead: a
 *   44 px tap target with the secondary variant's text colour, and no inline
 *   link left in the availability line.
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

/** The contact button's measurable contract (empty = pass). */
const contactButton = (page: Page) =>
  page
    .locator("a[data-product-contact]")
    .first()
    .evaluate((a) => {
      const box = a.getBoundingClientRect();
      const probe = document.createElement("span");
      probe.style.color = "var(--text-primary)";
      document.body.append(probe);
      const primary = getComputedStyle(probe).color;
      probe.remove();
      return {
        variant: a.getAttribute("data-button-variant"),
        width: box.width,
        height: box.height,
        colour: getComputedStyle(a).color,
        primary,
        inLine: Boolean(a.closest("[data-app-access]")),
        lineLinks: document.querySelectorAll("[data-app-access] a").length,
      };
    });

for (const lang of LANGS) {
  test(`${lang}: the contact action is a 44 px secondary button, not an inline link`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/products/sotro/`);
    const button = await contactButton(page);
    expect(button.variant).toBe("secondary");
    expect(button.height).toBeGreaterThanOrEqual(44);
    expect(button.width).toBeGreaterThanOrEqual(44);
    expect(button.colour).toBe(button.primary);
    expect(button.inLine).toBe(false);
    expect(button.lineLinks).toBe(0);
  });
}

test("negative proof: a 14 px inline contact link is reported", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/products/sotro/");
  await page.addStyleTag({
    content:
      "a[data-product-contact]{display:inline!important;min-height:0!important;padding:0!important;color:var(--text-secondary)!important}",
  });
  const button = await contactButton(page);
  expect(button.height).toBeLessThan(44);
  expect(button.colour).not.toBe(button.primary);
});
