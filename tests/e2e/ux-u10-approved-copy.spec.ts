import { expect, test } from "@playwright/test";

/**
 * UX-U10: Owner-approved copy (2026-10-12). Asserts the approved strings
 * render and the replaced ones are gone. zh/zh-hant lines are NOT VERIFIED
 * pending native review.
 * Negative proof: the pre-change build renders the old VI H1, "Nâng tầm",
 * "Xác minh" and an ASCII comma, so the absence assertions fail there.
 */
const NEW_H1 =
  "Chúng tôi làm những sản phẩm thông minh, giúp mọi người làm việc nhẹ nhàng và hiệu quả hơn.";
const OLD_H1 =
  "Chúng tôi xây dựng sản phẩm thông minh, giúp con người làm chủ và nâng tầm cách làm việc.";

test.describe("U10 VI home, tagline and verify label", () => {
  test("VI home: approved sub-line, tagline, label; old strings absent", async ({
    page,
  }) => {
    await page.goto("/vi/");
    const body = page.locator("body");
    await expect(page.locator("h1")).toContainText(NEW_H1);
    // Preview 2026-10-15 replaces the 2026-10-12 sub-line (Owner review of
    // the new copy pending); the old line must be gone.
    await expect(body).toContainText(
      "Đang mở bản xem trước: Sổ Trọ, sổ tay cho chủ trọ. Đang phát triển: Sổ Tâm, nhật ký riêng tư.",
    );
    await expect(body).not.toContainText(
      "Đang phát triển: Sổ Trọ, sổ tay cho chủ trọ; Sổ Tâm, nhật ký riêng tư.",
    );
    await expect(page.getByRole("contentinfo")).toContainText(
      "Trí tuệ. Tầm nhìn. Tác động.",
    );
    await expect(body).not.toContainText(OLD_H1);
    await expect(body).not.toContainText("Nâng tầm");
    const nav = page.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: "Kiểm chứng" }).first(),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: "Xác minh" })).toHaveCount(0);
  });

  test("VI about lede agrees with the home H1", async ({ page }) => {
    await page.goto("/vi/about/");
    await expect(page.locator("main")).toContainText(NEW_H1);
    await expect(page.locator("main")).not.toContainText("làm chủ");
  });

  test("VI verify page is titled Kiểm chứng", async ({ page }) => {
    await page.goto("/vi/verify/");
    await expect(page).toHaveTitle(/^Kiểm chứng/);
    await expect(page.locator("h1")).toHaveText("Kiểm chứng");
    await expect(page.locator("body")).not.toContainText("Xác minh");
  });
});

const INTERIM = {
  en: [
    "Not yet open for sign-up or download. Check this page for updates, or get in touch.",
  ],
  vi: [
    "Chưa mở đăng ký hoặc tải về. Bạn có thể theo dõi trang này, hoặc liên hệ với chúng tôi.",
  ],
  zh: ["目前尚未开放注册或下载。请关注本页更新，或与我们联系。"],
  "zh-hant": ["目前尚未開放註冊或下載。歡迎持續關注本頁，或與我們聯絡。"],
} as const;

// Preview 2026-10-15: Sổ Trọ's web preview is open, so its page shows the
// preview note; Sổ Tâm keeps the approved interim sentence.
const PREVIEW = {
  en: "The web preview is open to a limited number of landlords; the Android and iOS apps are still in development. Questions? Get in touch.",
  vi: "Bản xem trước trên web đã mở cho một số chủ trọ, số chỗ có hạn; ứng dụng Android và iOS vẫn đang phát triển. Cần hỏi thêm? Liên hệ với chúng tôi.",
  zh: "网页预览版已向少量房东开放，名额有限；Android 与 iOS 应用仍在开发中。有疑问？与我们联系。",
  "zh-hant":
    "網頁預覽版已向少量房東開放，名額有限；Android 與 iOS 應用程式仍在開發中。有疑問？與我們聯絡。",
} as const;

for (const lang of Object.keys(INTERIM) as (keyof typeof INTERIM)[]) {
  for (const [slug, text, state] of [
    ["sotro", PREVIEW[lang], "web-preview"],
    ["sotam", INTERIM[lang][0], "closed"],
  ] as const) {
    test(`/${lang}/products/${slug}/ shows its ${state} note linking to Contact`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/${slug}/`);
      const note = page.locator("[data-interim-note]");
      await expect(note).toHaveCount(1);
      await expect(note).toHaveText(text);
      await expect(note).toHaveAttribute("data-interim-state", state);
      await expect(note.locator("a")).toHaveAttribute(
        "href",
        `/${lang}/contact/`,
      );
      await expect(page.locator("main")).not.toContainText(
        /waitlist|danh sách chờ|候補|等候名單/i,
      );
      if (slug === "sotro") {
        // An open preview must not say it is closed for sign-up.
        await expect(page.locator("main")).not.toContainText(INTERIM[lang][0]);
      }
    });
  }
}

test("zh-hant support uses 電子郵件信箱, not 郵箱", async ({ page }) => {
  await page.goto("/zh-hant/support/");
  await expect(page.locator("main")).not.toContainText("郵箱");
});

test("negative proof: the absence guard fails when the old copy is present", () => {
  const stale = `${OLD_H1} Trí tuệ. Nâng tầm. Tác động. Xác minh`;
  expect(stale).toContain(OLD_H1);
  expect(() => expect(stale).not.toContain(OLD_H1)).toThrow();
  expect(() => expect(stale).not.toContain("Nâng tầm")).toThrow();
  expect(() => expect(stale).not.toContain("Xác minh")).toThrow();
});
