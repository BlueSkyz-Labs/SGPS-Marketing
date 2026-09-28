import { expect, test } from "@playwright/test";

// Owner 2026-09-28: Sổ Trọ and Sổ Tâm only; native apps in development.
const PUBLISHED = ["sotro", "sotam"];
const SIGN_IN: Record<string, string> = {
  sotro: "https://sotro.blueskyzlabs.com/login",
  sotam: "https://sotam.blueskyzlabs.com/auth/login",
};
const NAMES: Record<string, string> = { sotro: "Sổ Trọ", sotam: "Sổ Tâm" };
const HIDDEN = ["apexagent", "fluentarc", "vungtaylai"];

test.describe("app access", () => {
  for (const slug of PUBLISHED) {
    test(`${slug}: direct sign-in link; Android and iOS in development, never linked`, async ({
      page,
    }) => {
      await page.goto(`/vi/products/${slug}/`);
      const block = page.locator("[data-app-access]");
      await expect(block.getByRole("heading")).toHaveText("Truy cập ứng dụng");
      for (const key of ["android", "ios"]) {
        const app = block.locator(`[data-mobile-app="${key}"]`);
        await expect(app).toHaveAttribute(
          "data-mobile-state",
          "in-development",
        );
        await expect(app).toContainText("Đang phát triển");
        await expect(app.locator("a")).toHaveCount(0);
        expect(await app.evaluate((el) => el.tagName)).toBe("P");
      }
      const signIn = page.getByRole("link", {
        name: `Đăng nhập · ${NAMES[slug]}`,
      });
      await expect(signIn).toHaveAttribute("href", SIGN_IN[slug]);
      await expect(block.locator("[data-app-signin]")).toHaveCount(0);
      const box = await signIn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    });
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
