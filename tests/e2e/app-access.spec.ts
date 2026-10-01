import { expect, test } from "@playwright/test";

// Owner 2026-09-28: Sổ Trọ and Sổ Tâm only; native apps in development.
const PUBLISHED = ["sotro", "sotam"];
const SIGN_IN: Record<string, string> = {
  sotro: "https://sotro.blueskyzlabs.com/login",
  sotam: "https://sotam.blueskyzlabs.com/auth/login",
};
const HIDDEN = ["apexagent", "fluentarc", "vungtaylai"];

test.describe("app access", () => {
  for (const slug of PUBLISHED) {
    test(`${slug}: one Availability line (no store link); sign-in is a text link`, async ({
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
      await expect(block).toContainText("Web: đang phát triển");
      await expect(block.locator("a")).toHaveCount(0);
      await expect(block.locator("[data-mobile-app]")).toHaveCount(0);
      await expect(
        block.locator('[data-mobile-state="in-development"]'),
      ).toHaveCount(1);
      const signIn = page.getByRole("link", {
        name: "Đã có tài khoản? Đăng nhập",
      });
      await expect(signIn).toHaveAttribute("href", SIGN_IN[slug]);
      await expect(block.locator("[data-app-signin]")).toHaveCount(0);
      const box = await signIn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    });
  }

  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    for (const slug of PUBLISHED) {
      test(`${lang}/${slug}: sign-in link opens the app, not this page`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/products/${slug}/`);
        const primaryActions = page.locator(
          `main article a[href="${SIGN_IN[slug]}"]`,
        );
        await expect(primaryActions).toHaveCount(1);
        await expect(primaryActions).toHaveAttribute("href", SIGN_IN[slug]);
        expect(new URL(SIGN_IN[slug]).pathname).not.toBe(
          new URL(page.url()).pathname,
        );
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
