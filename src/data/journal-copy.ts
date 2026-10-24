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
    title: "Journey",
    lede: "News and real product updates from BlueSkyz Labs. Every post lists its sources.",
    news: "News and updates",
    product: "Product updates",
    empty: "No posts yet.",
  },
  vi: {
    title: "Hành trình",
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
    languageNote: "文章以越南語和英語發布。",
  },
};

/**
 * Post-page UI strings (Journey P1-A). Only vi and en have post pages: posts
 * are published as VI + EN pairs (design D-3), so zh / zh-Hant have no entry.
 * Owner-directed copy; descriptive labels only, no product claim.
 */
export interface JournalPostCopy {
  published: string;
  updated: string;
  sources: string;
  /** Credit under every journal figure (press standard R1, R3). */
  figureCredit: string;
  /** Heading of the end-of-article summary infographic (press standard R1). */
  summary: string;
  /** Closing rights line; `{year}` is the post's publication year. */
  copyright: string;
  aboutAuthor: string;
  backToJournal: string;
  rss: string;
}

export const JOURNAL_POST_COPY: Record<"vi" | "en", JournalPostCopy> = {
  vi: {
    published: "Đăng ngày",
    updated: "Cập nhật",
    sources: "Nguồn",
    figureCredit: "Minh hoạ: BlueSkyz Labs",
    summary: "Tóm tắt",
    copyright: "© {year} BlueSkyz Labs. Bảo lưu mọi quyền.",
    aboutAuthor: "Về tác giả",
    backToJournal: "Tất cả bài viết",
    rss: "RSS",
  },
  en: {
    published: "Published",
    updated: "Updated",
    sources: "Sources",
    figureCredit: "Illustration: BlueSkyz Labs",
    summary: "In brief",
    copyright: "© {year} BlueSkyz Labs. All rights reserved.",
    aboutAuthor: "About the author",
    backToJournal: "All posts",
    rss: "RSS",
  },
};
