import type { Language } from "@/data/site";

/**
 * v11 Journal index copy. Descriptive UI text only: it states the section's
 * rules (sources on every post), which the schema enforces, and makes no
 * product claim. zh / zh-Hant are machine-assisted (O-10.6) and say that
 * posts are published in Vietnamese and English.
 */
export const JOURNAL_COPY: Record<
  Language,
  {
    title: string;
    lede: string;
    news: string;
    product: string;
    empty: string;
    languageNote?: string;
  }
> = {
  en: {
    title: "Journal",
    lede: "News and real product updates from BlueSkyz Labs. Every post lists its sources.",
    news: "News and updates",
    product: "Product updates",
    empty: "No posts yet.",
  },
  vi: {
    title: "Nhật ký",
    lede: "Tin tức và cập nhật sản phẩm thật của BlueSkyz Labs. Mỗi bài đều ghi nguồn.",
    news: "Tin tức & cập nhật",
    product: "Cập nhật sản phẩm",
    empty: "Chưa có bài viết.",
  },
  zh: {
    title: "日志",
    lede: "BlueSkyz Labs 的新闻与真实产品更新。每篇文章都注明来源。",
    news: "新闻与动态",
    product: "产品更新",
    empty: "暂无文章。",
    languageNote: "文章以越南语和英语发布。",
  },
  // zh-Hant copy: machine-assisted (OpenCC s2twp), pending native review.
  "zh-hant": {
    title: "日誌",
    lede: "BlueSkyz Labs 的新聞與真實產品更新。每篇文章都註明來源。",
    news: "新聞與動態",
    product: "產品更新",
    empty: "暫無文章。",
    languageNote: "文章以越南語和英語釋出。",
  },
};
