const PUBLISHED_SUMMARY = {
  en: "The public registry lists the products currently published on this site.",
  vi: "Danh mục công khai liệt kê các sản phẩm hiện được công bố trên trang này.",
  zh: "公开登记表列出当前在本站发布的产品。",
};

/**
 * @param {{ en: string, vi: string, zh: string }} emptySummary
 * @param {number} productCount
 * @param {"en" | "vi" | "zh"} lang
 * @returns {{ state: "not-published" | "source-linked", summary: string }}
 */
export function getProductsIntegrityPresentation(
  emptySummary,
  productCount,
  lang,
) {
  return productCount > 0
    ? { state: "source-linked", summary: PUBLISHED_SUMMARY[lang] }
    : { state: "not-published", summary: emptySummary[lang] };
}
