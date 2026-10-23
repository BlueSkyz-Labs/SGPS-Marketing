import { expect, test, type Page } from "@playwright/test";

/**
 * Customer-experience review 2026-10-15 (F2, F5, F6, F7, F8). Each check has a
 * negative proof that breaks the fixed state in the live page and expects the
 * same check to fail.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;

/** F2: destinations linked more than once inside <main>. */
const repeatedHrefs = (page: Page) =>
  page.evaluate(() => {
    const seen = new Map<string, number>();
    for (const a of document.querySelectorAll<HTMLAnchorElement>(
      "main a[href]",
    )) {
      const href = a.getAttribute("href")!;
      if (href.startsWith("#")) continue;
      seen.set(href, (seen.get(href) ?? 0) + 1);
    }
    return [...seen].filter(([, n]) => n > 1).map(([href]) => href);
  });

/** F5: px between the "Reviewed" label text and the date. */
const reviewedGap = (page: Page) =>
  page.evaluate(() => {
    const box = document.querySelector(".sources-line__reviewed")!;
    const label = document.createRange();
    label.selectNodeContents(box.firstChild!);
    const time = box.querySelector("time")!.getBoundingClientRect();
    return time.left - label.getBoundingClientRect().right;
  });

/** F6: source links that point at the page they sit on. */
const selfLinks = (page: Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLAnchorElement>(
        "[data-sources-line] a[href]",
      ),
    ]
      .filter((a) => new URL(a.href).pathname === location.pathname)
      .map((a) => a.textContent!.trim()),
  );

/** F7: horizontal offset between the two links in the Contact Security card. */
const securityCardOffset = (page: Page) =>
  page.evaluate(() => {
    const card = document.querySelector('[data-contact-card="security"]')!;
    const [page, action] = card.querySelectorAll("a");
    const text = (el: Element) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getBoundingClientRect().left;
    };
    return Math.abs(text(page) - text(action));
  });

for (const lang of LANGS) {
  test(`${lang}: /support links each destination once (F2)`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/support/`);
    expect(await repeatedHrefs(page)).toEqual([]);
    // EX-20: the shared Next steps band closes the page with exactly the two
    // routes the page does not already link (Contact, Product status); it never
    // repeats the Security caveat, so every destination is still linked once.
    const bar = page.locator("[data-journey-bar]");
    await expect(bar).toHaveCount(1);
    await expect(bar.locator("a")).toHaveCount(2);
    await expect(bar.locator(`a[href="/${lang}/contact/"]`)).toHaveCount(1);
    await expect(bar.locator(`a[href="/${lang}/products/"]`)).toHaveCount(1);
    await expect(bar.locator(`a[href="/${lang}/security/"]`)).toHaveCount(0);
    // EX-18: like About, Contact and Verify, Support has no eyebrow-with-rule.
    await expect(page.locator("main .page-header__eyebrow")).toHaveCount(0);
  });

  test(`${lang}: /security cites itself as text, not a link (F6)`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/security/`);
    expect(await selfLinks(page)).toEqual([]);
    const current = page.locator(
      '[data-sources-line] [aria-current="page"]#evidence-ev-security-route',
    );
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("data-trace-step", "evidence");
  });

  test(`${lang}: Contact Security card links share one left edge (F7)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${lang}/contact/`);
    expect(await securityCardOffset(page)).toBeLessThanOrEqual(1);
  });
}

test("negative proof (F2): a repeated primary link on /support is caught", async ({
  page,
}) => {
  await page.goto("/en/support/");
  // Duplicate whatever the primary action is (the mailbox, or Contact).
  const href = await page.evaluate(() => {
    const primary = document.querySelector("[data-support-primary]")!;
    const a = document.createElement("a");
    a.href = primary.getAttribute("href")!;
    document.querySelector("main")!.append(a);
    return a.getAttribute("href");
  });
  expect(await repeatedHrefs(page)).toEqual([href]);
});

test("F5: the Reviewed label and its date are separated; negative proof", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/security/");
  expect(await reviewedGap(page)).toBeGreaterThanOrEqual(3);
  await page.addStyleTag({
    content: ".sources-line__reviewed { column-gap: 0 !important; }",
  });
  expect(await reviewedGap(page)).toBeLessThan(1);
});

test("negative proof (F6): a self-link in the sources line is caught", async ({
  page,
}) => {
  await page.goto("/en/security/");
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/en/security/";
    a.textContent = "Security route";
    document.querySelector("[data-sources-line]")!.append(a);
  });
  expect(await selfLinks(page)).toEqual(["Security route"]);
});

test("negative proof (F7): a full-width tertiary action is misaligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/contact/");
  await page.addStyleTag({
    content:
      '[data-contact-card="security"] .safe-action a { align-self: stretch !important; }',
  });
  expect(await securityCardOffset(page)).toBeGreaterThan(1);
});

test.describe("locale banner on a 404 (F8)", () => {
  test.use({ locale: "vi-VN" });

  test("is absent on the 404 page", async ({ page }) => {
    await page.goto("/en/404/");
    await expect(page.locator("[data-locale-suggestion]")).toHaveCount(0);
  });

  test("negative proof: the same browser still gets it on a real page", async ({
    page,
  }) => {
    await page.goto("/en/about/");
    await expect(page.locator("[data-locale-suggestion]")).toHaveCount(1);
  });
});
