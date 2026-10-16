import { expect, test } from "@playwright/test";

const COPY = {
  en: {
    link: "Website privacy",
    scope: "This notice covers blueskyzlabs.com only, not the product.",
  },
  vi: {
    link: "Quyền riêng tư của website",
    scope:
      "Thông báo này chỉ áp dụng cho website blueskyzlabs.com, không áp dụng cho sản phẩm.",
  },
  zh: {
    link: "网站隐私",
    scope: "此说明仅适用于网站 blueskyzlabs.com，不适用于该产品。",
  },
  "zh-hant": {
    link: "網站隱私權",
    scope: "此說明僅適用於網站 blueskyzlabs.com，不適用於該產品。",
  },
} as const;

for (const locale of ["en", "vi", "zh", "zh-hant"] as const) {
  for (const product of ["sotro", "sotam"] as const) {
    test(`${locale}/${product}: privacy link states its website scope`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/products/${product}/`);

      await expect(
        page.getByRole("link", { name: COPY[locale].link }),
      ).toHaveAttribute("href", `/${locale}/privacy/`);
      await expect(page.locator("[data-product-privacy-scope]")).toContainText(
        COPY[locale].scope,
      );
    });
  }
}
