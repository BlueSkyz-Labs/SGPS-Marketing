import type { Language } from "@/lib/i18n";

/**
 * v12 S1 Feature Story chrome strings. Chapter headings and lines are not
 * here: they come from the showcase record (screen title and caption) and the
 * product record (job or capability), through `resolveFeatureStory`.
 * zh and zh-hant: NOT VERIFIED (native review pending).
 */
export const STORY_COPY = {
  en: {
    title: (name: string) => `A landlord’s month in ${name}`,
    lead: "From today’s list to the owner’s computer, in the order the month runs.",
    desktop: "On the owner’s computer",
    inspect: "View larger image (sample data)",
    inspectOpens: "opens the image in a new tab",
  },
  vi: {
    title: (name: string) => `Một tháng làm chủ trọ cùng ${name}`,
    lead: "Từ việc cần làm hôm nay đến máy tính của chủ trọ, theo nhịp một tháng.",
    desktop: "Trên máy tính của chủ trọ",
    inspect: "Xem ảnh lớn (dữ liệu mẫu)",
    inspectOpens: "mở ảnh trong thẻ mới",
  },
  zh: {
    title: (name: string) => `房东的一个月，在 ${name} 里`,
    lead: "从今天的待办到房东的电脑，按一个月的节奏展开。",
    desktop: "房东电脑",
    inspect: "查看大图（示例数据）",
    inspectOpens: "在新标签页打开图片",
  },
  "zh-hant": {
    title: (name: string) => `房東的一個月，在 ${name} 裡`,
    lead: "從今天的待辦到房東的電腦，按一個月的節奏展開。",
    desktop: "房東電腦",
    inspect: "查看大圖（範例資料）",
    inspectOpens: "在新分頁開啟圖片",
  },
} as const satisfies Record<
  Language,
  {
    title: (name: string) => string;
    lead: string;
    desktop: string;
    inspect: string;
    inspectOpens: string;
  }
>;

/** The phone derivative next to each master (`<name>-480.webp`). */
export const phoneSmallSrc = (src: string) =>
  src.replace(/\.webp$/, "-480.webp");
/** The desktop derivative next to each master (`<name>-768.webp`). */
export const desktopSmallSrc = (src: string) =>
  src.replace(/\.webp$/, "-768.webp");
