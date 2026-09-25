import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const CLAIM = "security-reporting-is-private";
const EVIDENCE = "ev-security-advisory";

test.describe("C4-C dossier composer", () => {
  test("composes and decomposes a selection with mouse and keyboard", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const preview = page.locator("[data-dossier-preview]");
    const counter = page.locator("[data-dossier-counter]");

    await expect(preview).toHaveAttribute("data-empty", "");
    await expect(counter).toHaveText("0");

    const claim = page.locator(`[data-dossier-item][value="${CLAIM}"]`);
    await claim.click();
    await expect(
      preview.locator(`[data-dossier-entry-item="${CLAIM}"]`),
    ).toBeVisible();
    await expect(counter).toHaveText("1");

    // keyboard selection works the same way
    const evidence = page.locator(`[data-dossier-item][value="${EVIDENCE}"]`);
    await evidence.focus();
    await page.keyboard.press("Space");
    await expect(
      preview.locator(`[data-dossier-entry-item="${EVIDENCE}"]`),
    ).toBeVisible();
    await expect(counter).toHaveText("2");

    await claim.click();
    await expect(
      preview.locator(`[data-dossier-entry-item="${CLAIM}"]`),
    ).toHaveCount(0);
    await expect(counter).toHaveText("1");
  });

  test("validated URL state composes, and an unpublished id fails closed", async ({
    page,
  }) => {
    await page.goto(`/en/dossier/?items=${CLAIM},not-a-published-item`);
    const preview = page.locator("[data-dossier-preview]");
    await expect(
      preview.locator(`[data-dossier-entry-item="${CLAIM}"]`),
    ).toBeVisible();
    // the unknown id is reported, never composed
    await expect(
      preview.locator(`[data-dossier-entry-item="not-a-published-item"]`),
    ).toHaveCount(0);
    const unknown = page.locator("[data-dossier-unknown]");
    await expect(unknown).toBeVisible();
    await expect(unknown).toContainText("not-a-published-item");
    await expect(page.locator("[data-dossier-counter]")).toHaveText("1");
  });

  test("a reload without parameters returns the safe default", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    await expect(page.locator("[data-dossier-preview]")).toHaveAttribute(
      "data-empty",
      "",
    );
    await expect(page.locator("[data-dossier-unknown]")).toBeHidden();
    await expect(page.locator("[data-dossier-counter]")).toHaveText("0");
  });

  test("composition transmits nothing", async ({ page }) => {
    await page.goto("/en/dossier/");
    const sent: string[] = [];
    page.on("request", (request) => {
      if (!request.url().includes("/en/dossier")) sent.push(request.url());
    });
    await page.locator(`[data-dossier-item][value="${CLAIM}"]`).click();
    await page.locator(`[data-dossier-item][value="${EVIDENCE}"]`).click();
    await page.waitForTimeout(300);
    expect(sent, "selecting items must not issue a single request").toEqual([]);
  });

  for (const lang of LANGS) {
    test(`/${lang}/dossier/ keeps every published source reachable without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/dossier/`)).text();
      expect(html).toContain("data-dossier-composer");
      expect(html).toContain(`data-dossier-item value="${CLAIM}"`);
      expect(html).toContain("data-dossier-entry=");
      expect(html).toContain("<noscript>");
      // the composer never claims certification
      for (const banned of [
        "certified",
        "audited",
        "guaranteed",
        "compliant",
      ]) {
        expect(html.toLowerCase()).not.toContain(banned);
      }
    });
  }

  test("the dossier footer exposes canonical ordinary source links at 390px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/dossier/");
    const sources = page.locator("[data-dossier-sources]");
    await expect(sources).toBeVisible();
    await expect(sources).toContainText("Security reporting route");
    const links = sources.locator("[data-dossier-source-link]");
    await expect(links).toHaveCount(4);
    await expect(sources.locator("[data-dossier-freshness]")).toHaveCount(1);
    await expect(sources.locator("[data-dossier-freshness]")).toHaveAttribute(
      "data-dossier-freshness",
      "2026-09-12",
    );
    await expect(sources.locator("[data-dossier-source-unknown]")).toHaveCount(
      1,
    );
    for (let index = 0; index < 4; index += 1) {
      const link = links.nth(index);
      const href = await link.getAttribute("href");
      expect(
        href,
        "every source is an ordinary absolute or root-relative link",
      ).toMatch(/^(https:\/\/|\/(?!\/))/);
      expect(await link.evaluate((element) => element.tagName)).toBe("A");
    }
    const contained = await sources.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.left >= 0 && box.right <= window.innerWidth + 1;
    });
    expect(contained, "the sources footer stays inside 390px").toBe(true);
  });

  test("the composer states that it is presentation only", async ({ page }) => {
    await page.goto("/en/dossier/");
    const note = await page.locator(".c4-dossier__note").innerText();
    expect(note).toContain("exactly as published");
  });

  test("the composer stays inside 320px and 390px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/en/dossier/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });
});
