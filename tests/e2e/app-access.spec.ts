import { expect, test } from "@playwright/test";

// Owner 2026-09-28: Sổ Trọ and Sổ Tâm only; native apps in development.
const PUBLISHED = ["sotro", "sotam"];
const SIGN_IN: Record<string, string> = {
  sotro: "https://sotro.blueskyzlabs.com/login",
  sotam: "https://sotam.blueskyzlabs.com/auth/login",
};
const HIDDEN = ["apexagent", "fluentarc", "vungtaylai"];
// Preview 2026-10-15: Sổ Trọ's web app is open as a preview; Sổ Tâm is not.
const WEB_LINE: Record<string, [string, string]> = {
  sotro: ["preview", "Web: bản xem trước đã mở, số chỗ có hạn"],
  sotam: ["in-development", "Web: đang phát triển"],
};

test.describe("app access", () => {
  for (const slug of PUBLISHED) {
    test(`${slug}: one Availability line (no store link) and no sign-in link`, async ({
      page,
    }) => {
      await page.goto(`/vi/products/${slug}/`);
      // v8 W3: Access + Platforms + Stage collapse into one line; an
      // in-development native app is plain text and is never linked.
      const block = page.locator("[data-app-access]");
      await expect(block).toHaveCount(1);
      await expect(block).toContainText(
        "Android và iOS: đang phát triển, chưa có bản trên cửa hàng ứng dụng",
      );
      const [state, line] = WEB_LINE[slug]!;
      await expect(block).toContainText(line);
      await expect(block.locator("[data-web-state]")).toHaveAttribute(
        "data-web-state",
        state,
      );
      await expect(block.locator("a")).toHaveCount(0);
      await expect(block.locator("[data-mobile-app]")).toHaveCount(0);
      await expect(
        block.locator('[data-mobile-state="in-development"]'),
      ).toHaveCount(1);
      // Owner 2026-10-12: the public profile shows no app sign-in.
      await expect(page.locator("[data-app-signin]")).toHaveCount(0);
      await expect(page.locator(`a[href="${SIGN_IN[slug]}"]`)).toHaveCount(0);
    });
  }

  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    for (const slug of PUBLISHED) {
      test(`${lang}/${slug}: no page links to the app sign-in`, async ({
        page,
      }) => {
        for (const path of [
          `/${lang}/products/${slug}/`,
          `/${lang}/contact/`,
        ]) {
          await page.goto(path);
          await expect(page.locator(`a[href="${SIGN_IN[slug]}"]`)).toHaveCount(
            0,
          );
        }
      });
    }
  }

  test("hidden products have no profile page and are not listed", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    for (const slug of HIDDEN) {
      await expect(page.locator(`a[href*="/products/${slug}/"]`)).toHaveCount(
        0,
      );
      const response = await page.request.get(`/en/products/${slug}/`);
      expect(response.status()).toBe(404);
    }
  });
});
