import assert from "node:assert/strict";
import test from "node:test";
import { getProductsIntegrityPresentation } from "../../src/lib/products-integrity-summary.mjs";

const EMPTY_SUMMARY = {
  en: "The public registry stays quiet by design.",
  vi: "Danh mục công khai giữ im lặng có chủ đích.",
  zh: "公开登记表按设计保持静默。",
  "zh-hant": "公開登錄名單按設計保持靜默。",
};

test("an empty public registry keeps its unpublished summary", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    assert.deepEqual(getProductsIntegrityPresentation(EMPTY_SUMMARY, 0, lang), {
      state: "not-published",
      summary: EMPTY_SUMMARY[lang],
    });
  }
});

test("a populated public registry uses accurate localized summary", () => {
  const expected = {
    en: "The public registry lists the products currently published on this site.",
    vi: "Danh mục công khai liệt kê các sản phẩm hiện được công bố trên trang này.",
    zh: "公开登记表列出当前在本站发布的产品。",
    "zh-hant": "公開登錄名單列出目前在本站發布的產品。",
  };

  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    assert.deepEqual(getProductsIntegrityPresentation(EMPTY_SUMMARY, 1, lang), {
      state: "source-linked",
      summary: expected[lang],
    });
  }
});
