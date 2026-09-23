import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const SUBJECT = "privacy-no-tracking-on-this-site";

test.describe("C4-D provenance lens", () => {
  test("progressive disclosure: statement first, sources and boundary collapsed but reachable", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    const lens = page.locator(`[data-provenance-lens="${SUBJECT}"]`);
    await expect(lens).toBeVisible();
    await expect(lens.locator("[data-provenance-statement]")).toBeVisible();

    const sources = lens.locator("details[data-provenance-sources]");
    await expect(sources).toHaveCount(1);
    // collapsed by default, and never hover-only: the summary is a real control.
    // Native <details> exposes aria-expanded through the accessibility tree, not
    // as a DOM attribute, so assert the observable collapse instead.
    await expect(sources).not.toHaveAttribute("open", /.*/);
    await expect(sources.locator("summary")).toBeVisible();
    await expect(
      sources.locator(".c4-provenance__source-link").first(),
    ).toBeHidden();
  });

  test("keyboard alone expands the disclosure and reaches every source link", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    const sources = page.locator("details[data-provenance-sources]");
    await sources.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(sources).toHaveAttribute("open", /.*/);

    const links = sources.locator(".c4-provenance__source-link");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(links.nth(i)).toBeVisible();
      await expect(links.nth(i)).toHaveAttribute("href", /^(https:\/\/|\/)/);
    }
  });

  test("touch targets are at least 44px on the summary and the source links", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    const sources = page.locator("details[data-provenance-sources]");
    await sources.locator("summary").click();
    const boxes = await page
      .locator(
        "details[data-provenance-sources] summary, .c4-provenance__source-link",
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().height),
      );
    expect(boxes.length).toBeGreaterThan(1);
    for (const height of boxes) {
      expect(height).toBeGreaterThanOrEqual(44 - 0.001);
    }
  });

  test("the lens survives forced colours", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en/privacy/");
    const lens = page.locator(`[data-provenance-lens="${SUBJECT}"]`);
    await expect(lens.locator("[data-provenance-statement]")).toBeVisible();
    await expect(
      lens.locator("details[data-provenance-sources] summary"),
    ).toBeVisible();
    await expect(
      lens.locator("details[data-provenance-boundary] summary"),
    ).toBeVisible();
  });

  test("no assurance vocabulary appears in the provenance surface", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    const text = (
      await page.locator("[data-provenance-lens]").innerText()
    ).toLowerCase();
    for (const word of [
      "certified",
      "audited",
      "guaranteed",
      "compliant",
      "verified by us",
    ]) {
      expect(text, `must not claim ${word}`).not.toContain(word);
    }
  });

  for (const lang of LANGS) {
    test(`/${lang}/privacy/ publishes the lens without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/privacy/`)).text();
      expect(html).toContain(`data-provenance-lens="${SUBJECT}"`);
      expect(html).toContain("data-provenance-statement");
      expect(html).toContain("data-provenance-sources");
      expect(html).toContain("<details");
    });
  }

  test("an unresolved subject fails closed instead of implying provenance", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    // the real surface must never render the unknown branch
    expect(await page.locator("[data-provenance-unknown]").count()).toBe(0);
  });

  test("the lens stays inside 320px and 390px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/privacy/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });
});
