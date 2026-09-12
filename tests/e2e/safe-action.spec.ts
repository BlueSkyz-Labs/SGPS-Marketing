import { expect, test } from "@playwright/test";

const ADVISORY_URL =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

test.describe("safe action preflight on external trust actions", () => {
  for (const [route, context] of [
    ["/en/security/", /Opens GitHub private vulnerability reporting/i],
    ["/en/contact/", /Opens GitHub private vulnerability reporting/i],
    ["/vi/security/", /báo cáo lỗ hổng riêng tư trên GitHub/i],
    ["/vi/contact/", /báo cáo lỗ hổng riêng tư trên GitHub/i],
  ] as const) {
    test(`${route} shows destination context for private reporting`, async ({
      page,
    }) => {
      await page.goto(route);
      const action = page.locator('[data-safe-action="private-reporting"]');
      await expect(action).toBeVisible();
      const link = action.locator("a").first();
      await expect(link).toHaveAttribute("href", ADVISORY_URL);
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(action.getByText(context)).toBeVisible();
    });
  }

  test("ordinary internal links receive no extra friction", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    await expect(page.locator("[data-safe-action]")).toHaveCount(0);
    const internalLinks = page.locator('main a[href^="/en/"], a[href^="/en/"]');
    expect(await internalLinks.count()).toBeGreaterThan(0);
  });

  test("the action is a real anchor — keyboard focusable, no interception", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const link = page.locator('[data-safe-action="private-reporting"] a');
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveText(/Open private vulnerability reporting/);
  });
});

test.describe("safe action without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("destination context renders statically on /vi/security/", async ({
    page,
  }) => {
    await page.goto("/vi/security/");
    await expect(
      page.locator('[data-safe-action="private-reporting"] a'),
    ).toHaveAttribute("href", ADVISORY_URL);
  });
});
