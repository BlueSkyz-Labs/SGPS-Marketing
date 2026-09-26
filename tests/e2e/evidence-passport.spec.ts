import { expect, test } from "@playwright/test";

const ID = "security-reporting-is-private";
const EN = `/en/evidence/${ID}/`;
const VI = `/vi/evidence/${ID}/`;
const ZH = `/zh/evidence/${ID}/`;

test.describe("evidence passport", () => {
  test("EN passport renders claim, sources, boundary, review, and context", async ({
    page,
  }) => {
    await page.goto(EN);
    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    await expect(passport).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Evidence passport" }),
    ).toBeVisible();
    await expect(passport).toContainText("private GitHub channel");
    await expect(
      passport.locator('[data-truth-state="source-linked"]'),
    ).toHaveText(/Source-linked/);
    await expect(
      passport.getByRole("link", {
        name: /GitHub private vulnerability reporting/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new",
    );
    await expect(passport.locator("[data-boundary-card]")).toBeVisible();
    await expect(passport.locator("[data-passport-review]")).toHaveText(
      /2026-09-12/,
    );
    const context = passport.getByRole("link", { name: /View in context/i });
    await expect(context).toHaveAttribute("href", "/en/security/");
  });

  test("context link navigates to the modeled surface", async ({ page }) => {
    await page.goto(EN);
    await page.getByRole("link", { name: /View in context/i }).click();
    await expect(page).toHaveURL(/\/en\/security\/$/);
  });

  test("unknown ids never become public pages", async ({ page }) => {
    const response = await page.goto("/en/evidence/does-not-exist/");
    expect(response?.status()).toBe(404);
  });

  test("passport avoids certificate and guarantee language", async ({
    page,
  }) => {
    for (const route of [EN, VI]) {
      await page.goto(route);
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/certificate|seal|attestation|guaranteed/i);
      expect(body).not.toMatch(/sha|workflow|branch|deploy/i);
    }
  });

  test("VI passport is localized and reciprocal hreflang is present", async ({
    page,
  }) => {
    await page.goto(VI);
    await expect(page.getByText("Hộ chiếu bằng chứng")).toBeVisible();
    await expect(
      page.locator(`link[rel="alternate"][hreflang="en"]`),
    ).toHaveAttribute(
      "href",
      /\/en\/evidence\/security-reporting-is-private\/$/,
    );
    await expect(
      page.locator(`link[rel="alternate"][hreflang="vi"]`),
    ).toHaveAttribute(
      "href",
      /\/vi\/evidence\/security-reporting-is-private\/$/,
    );
  });

  test("ZH passport localizes its document shell, claim, and metadata", async ({
    page,
  }) => {
    await page.goto(ZH);
    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    await expect(page).toHaveTitle(/证据档案：/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "安全报告通过 GitHub 私有渠道送达维护者，绝不会通过公开 issue 提出。",
    );
    await expect(
      page.getByRole("heading", { level: 1, name: "证据档案" }),
    ).toBeVisible();
    await expect(
      passport.getByRole("heading", {
        level: 2,
        name: "安全报告通过 GitHub 私有渠道送达维护者，绝不会通过公开 issue 提出。",
      }),
    ).toBeVisible();
    await expect(passport.getByText("公开来源")).toBeVisible();
    await expect(
      passport.getByRole("link", { name: "在原文中查看 →" }),
    ).toHaveAttribute("href", "/zh/security/");
    await expect(
      page.locator(`link[rel="alternate"][hreflang="zh-Hans"]`),
    ).toHaveAttribute(
      "href",
      /\/zh\/evidence\/security-reporting-is-private\/$/,
    );
  });

  test("320px keeps the passport readable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(EN);
    await expect(
      page.locator(`[data-evidence-passport="${ID}"]`),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("print keeps claim and sources visible (chromium)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "print verified on chromium");
    await page.goto(EN);
    await page.emulateMedia({ media: "print" });
    await expect(
      page.locator(`[data-evidence-passport="${ID}"]`),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /GitHub private vulnerability reporting/i,
      }),
    ).toBeVisible();
  });
});

test.describe("evidence passport without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("passport renders statically", async ({ page }) => {
    await page.goto(EN);
    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    await expect(passport).toBeVisible();
    await expect(
      passport.getByRole("link", { name: /View in context/i }),
    ).toBeVisible();
  });
});
