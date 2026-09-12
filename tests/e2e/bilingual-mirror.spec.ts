import { expect, test } from "@playwright/test";

test.describe("selective bilingual mirror", () => {
  test("/en/security/ mirrors authored EN/VI evidence pairs", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const mirror = page.locator("[data-bilingual-mirror]");
    await mirror.scrollIntoViewIfNeeded();
    await expect(mirror).toBeVisible();
    await expect(
      mirror.getByRole("heading", {
        level: 2,
        name: "Bilingual evidence mirror",
      }),
    ).toBeVisible();
    const pairs = mirror.locator("[data-mirror-pair]");
    await expect(pairs).toHaveCount(2);
    const firstPair = pairs.first();
    await expect(firstPair.locator('[lang="en"]')).toContainText(
      "Private vulnerability reporting is available",
    );
    await expect(firstPair.locator('[lang="vi"]')).toContainText(
      "Kênh báo cáo lỗ hổng riêng tư",
    );
  });

  test("the localized route remains primary: no headings inside pairs", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const mirror = page.locator("[data-bilingual-mirror]");
    await expect(
      mirror.locator(
        "[data-mirror-pair] h1, [data-mirror-pair] h2, [data-mirror-pair] h3",
      ),
    ).toHaveCount(0);
  });

  test("320px stacks the pairs without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/en/security/");
    await page.locator("[data-bilingual-mirror]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-mirror-pair]").first()).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("VI security page mirrors the same authored pairs", async ({ page }) => {
    await page.goto("/vi/security/");
    const mirror = page.locator("[data-bilingual-mirror]");
    await mirror.scrollIntoViewIfNeeded();
    await expect(
      mirror.getByRole("heading", {
        level: 2,
        name: "Đối chiếu bằng chứng song ngữ",
      }),
    ).toBeVisible();
    await expect(mirror.locator('[lang="en"]').first()).toContainText(
      "Private vulnerability reporting is available",
    );
  });
});

test.describe("bilingual mirror without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("mirror renders statically", async ({ page }) => {
    await page.goto("/en/security/");
    await expect(page.locator("[data-bilingual-mirror]")).toBeVisible();
    await expect(page.locator("[data-mirror-pair]")).toHaveCount(2);
  });
});
