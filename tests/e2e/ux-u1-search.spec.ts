import { expect, test } from "@playwright/test";

// U1 / red-team C-01: header search must not give confident wrong answers and
// must not dead-end. Desktop trigger pinned so projects behave identically.
test.use({ viewport: { width: 1280, height: 800 } });

// Preview 2026-10-15: the status line names each product's own state from the
// registry, so an open preview is never called "in development".
const STATUS: Record<string, RegExp> = {
  en: /^Sổ Trọ: open preview, limited places; Sổ Tâm: in development; Android and iOS: no store release\.$/,
  vi: /^Sổ Trọ: bản xem trước đã mở, số chỗ có hạn; Sổ Tâm: đang phát triển; Android và iOS: chưa có bản trên cửa hàng ứng dụng\.$/,
  zh: /^Sổ Trọ：预览版已开放，名额有限；Sổ Tâm：开发中；Android 与 iOS：尚未上架应用商店\.$/,
  "zh-hant":
    /^Sổ Trọ：預覽版已開放，名額有限；Sổ Tâm：開發中；Android 與 iOS：尚未上架應用程式商店\.$/,
};

async function search(
  page: import("@playwright/test").Page,
  lang: string,
  q: string,
) {
  await page.goto(`/${lang}/`);
  await page.keyboard.press("Control+k");
  await page.locator("[data-command-input]").fill(q);
}

const items = (page: import("@playwright/test").Page) =>
  page.locator("[data-command-item]:not([hidden])");

test("vi 'giá' no longer matches Privacy or cookie text", async ({ page }) => {
  await search(page, "vi", "giá");
  await expect(items(page)).toHaveCount(0);
  await expect(page.locator("[data-command-empty]")).toBeVisible();
  await expect(
    page.locator(
      "dialog[data-command-navigator] [data-command-list] a:visible",
    ),
  ).toHaveCount(0);
});

test("unaccented 'gia' does not match inside longer words", async ({
  page,
}) => {
  // 'gia' (unaccented) must not match inside 'giao diện'-style words either.
  await search(page, "vi", "gia");
  for (const item of await items(page).all()) {
    await expect(item).not.toContainText(/quyền riêng tư|bằng chứng/i);
  }
});

for (const [lang, queries] of [
  ["en", ["price", "pricing", "download", "sign up", "facebook"]],
  ["vi", ["giá", "tải app", "đăng ký", "facebook", "download"]],
] as const) {
  for (const q of queries) {
    test(`${lang} '${q}' shows fallback links${q === "facebook" ? " and no status line" : ""}`, async ({
      page,
    }) => {
      await search(page, lang, q);
      await expect(items(page)).toHaveCount(0);
      const fallback = page.locator("[data-command-fallback]");
      await expect(fallback).toBeVisible();
      await expect(
        fallback.locator(`a[href="/${lang}/products/"]`),
      ).toBeVisible();
      await expect(
        fallback.locator(`a[href="/${lang}/contact/"]`),
      ).toBeVisible();
      const status = page.locator("[data-command-status]");
      if (q === "facebook") {
        // No hit and no status intent: fallback links only, no availability claim.
        await expect(status).toBeHidden();
      } else {
        await expect(status).toBeVisible();
        await expect(status).toHaveText(STATUS[lang]!);
      }
    });
  }
}

test("status line exists for all four locales on a price intent", async ({
  page,
}) => {
  const q = { en: "price", vi: "giá", zh: "价格", "zh-hant": "價格" } as const;
  for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
    await search(page, lang, q[lang]);
    await expect(page.locator("[data-command-status]")).toHaveText(
      STATUS[lang]!,
    );
    await expect(
      page.locator(`[data-command-fallback] a[href="/${lang}/contact/"]`),
    ).toBeVisible();
  }
});

test("negative proof: a matching query hides the fallback and status", async ({
  page,
}) => {
  await search(page, "en", "privacy");
  await expect(items(page)).toHaveCount(1);
  await expect(page.locator("[data-command-fallback]")).toBeHidden();
  await expect(page.locator("[data-command-status]")).toBeHidden();
});

test("title hits rank above body hits", async ({ page }) => {
  await search(page, "en", "contact");
  const first = items(page).first();
  await expect(first).toContainText("Contact");
});

// Preview 2026-10-15: Sổ Trọ's published capability now mentions Zalo
// receipts, so a 'zalo' search answers with the Sổ Trọ page instead of the
// empty-state fallback.
for (const lang of ["en", "vi"] as const) {
  test(`${lang} 'zalo' finds the Sổ Trọ page`, async ({ page }) => {
    await search(page, lang, "zalo");
    await expect(items(page)).not.toHaveCount(0);
    await expect(
      items(page).locator(`a[href="/${lang}/products/sotro/"]`).first(),
    ).toBeVisible();
    await expect(page.locator("[data-command-fallback]")).toBeHidden();
  });
}
