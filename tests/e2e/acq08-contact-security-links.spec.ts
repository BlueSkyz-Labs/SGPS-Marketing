import { expect, test, type Page } from "@playwright/test";

/**
 * ACQ-08: both links in the Contact Security card share one treatment —
 * weight 600 with the same visible underline at rest — and the "Product
 * support:" label sits 8px from its address. Each check has a negative proof
 * that breaks the fixed state in the live page and expects the check to fail.
 */
const LANGS = ["vi", "en"] as const;

type Treatment = {
  weight: string;
  line: string;
  style: string;
  color: string;
  thickness: string;
};

const cardLinkTreatments = (page: Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLAnchorElement>(
        '[data-contact-card="security"] a',
      ),
    ].map((a) => {
      const s = getComputedStyle(a);
      return {
        weight: s.fontWeight,
        line: s.textDecorationLine,
        style: s.textDecorationStyle,
        color: s.textDecorationColor,
        thickness: s.textDecorationThickness,
      };
    }),
  );

const isVisibleUnderline = (t: Treatment) =>
  t.line.includes("underline") &&
  t.color !== "transparent" &&
  !/rgba\([^)]*,\s*0\)$/.test(t.color);

/** px between the end of the "Product support:" label and the address. */
const supportGap = (page: Page) =>
  page.evaluate(() => {
    const row = document.querySelector('[data-public-email-role="support"]');
    if (!row) return null;
    const text = (el: Element) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getClientRects();
    };
    const label = [...text(row.querySelector("span")!)].at(-1)!;
    const link = text(row.querySelector("a")!)[0]!;
    return { gap: link.left - label.right, sameLine: link.top < label.bottom };
  });

for (const lang of LANGS) {
  test(`${lang}: Security card links share weight 600 + underline`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/contact/`);
    const [first, second, ...rest] = await cardLinkTreatments(page);
    expect(rest).toEqual([]);
    expect(first).toBeDefined();
    expect(second).toEqual(first);
    expect(first!.weight).toBe("600");
    expect(isVisibleUnderline(first!)).toBe(true);
  });

  test(`${lang}: product support label sits 8px from its address`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${lang}/contact/`);
    const m = await supportGap(page);
    test.skip(m === null, "no published support mailbox in this build");
    expect(m!.sameLine).toBe(true);
    expect(Math.abs(m!.gap - 8)).toBeLessThanOrEqual(1);
  });
}

test.describe("ACQ-08 negative proofs", () => {
  test("a weight-400 Security page link is caught", async ({ page }) => {
    await page.goto("/en/contact/");
    await page.addStyleTag({
      content:
        '[data-contact-card="security"] a[href="/en/security/"] { font-weight: 400 !important; }',
    });
    const [first, second] = await cardLinkTreatments(page);
    expect(second).not.toEqual(first);
  });

  test("a resting-transparent tertiary underline is caught", async ({
    page,
  }) => {
    // The tertiary animates text-decoration-color; transitions are disabled
    // so the injected rest state is read, not a mid-transition colour.
    await page.goto("/en/contact/");
    await page.addStyleTag({
      content:
        '[data-contact-card="security"] a.btn--tertiary { transition: none !important; text-decoration-color: transparent !important; }',
    });
    const [first, second] = await cardLinkTreatments(page);
    expect(second).not.toEqual(first);
    expect(isVisibleUnderline(second!)).toBe(false);
  });

  test("an unaligned support address is caught", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/contact/");
    await page.addStyleTag({
      content:
        '[data-public-email-role="support"] a { margin-inline-start: 0 !important; }',
    });
    const m = await supportGap(page);
    test.skip(m === null, "no published support mailbox in this build");
    expect(Math.abs(m!.gap - 8)).toBeGreaterThan(1);
  });
});
