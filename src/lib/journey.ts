import type { Language } from "@/data/site";

export interface JourneyAction {
  href: string;
  label: string;
}

interface JourneyStep {
  segment: string;
  label: Record<Language, string>;
}

/**
 * S+ Contextual Journey Bar (Task 6).
 * Deterministic route -> next-action map derived from the live approved
 * route set only. Unknown routes return no actions (fail-safe); the bar is
 * rendered near the end of content, never as a sticky overlay.
 */
const JOURNEY: Record<string, JourneyStep[]> = {
  "": [
    {
      segment: "products",
      label: {
        en: "Check product status",
        vi: "Kiểm tra trạng thái sản phẩm",
        zh: "查看产品状态",
      },
    },
    {
      segment: "decision-room",
      label: { en: "Decision Room", vi: "Phòng Quyết định", zh: "决策室" },
    },
    {
      segment: "about",
      label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
    },
    {
      segment: "security",
      label: { en: "Security", vi: "Bảo mật", zh: "安全" },
    },
  ],
  products: [
    {
      segment: "decision-room",
      label: { en: "Decision Room", vi: "Phòng Quyết định", zh: "决策室" },
    },
    {
      segment: "about",
      label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
    },
    {
      segment: "contact",
      label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
    },
  ],
  about: [
    {
      segment: "products",
      label: {
        en: "Product status",
        vi: "Trạng thái sản phẩm",
        zh: "产品状态",
      },
    },
    {
      segment: "contact",
      label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
    },
  ],
  contact: [
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ", zh: "支持" } },
    {
      segment: "security",
      label: { en: "Security", vi: "Bảo mật", zh: "安全" },
    },
  ],
  support: [
    {
      segment: "contact",
      label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
    },
    {
      segment: "security",
      label: { en: "Security", vi: "Bảo mật", zh: "安全" },
    },
  ],
  privacy: [
    {
      segment: "security",
      label: { en: "Security", vi: "Bảo mật", zh: "安全" },
    },
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ", zh: "支持" } },
  ],
  security: [
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ", zh: "支持" } },
    {
      segment: "privacy",
      label: { en: "Privacy", vi: "Quyền riêng tư", zh: "隐私" },
    },
  ],
};

export function getJourneyActions(
  pathname: string,
  lang: Language,
): JourneyAction[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== lang) {
    return [];
  }
  const route = parts[1] ?? "";
  const steps = JOURNEY[route];
  if (!steps) {
    return [];
  }
  return steps.map((step) => ({
    href: `/${lang}/${step.segment}/`,
    label: step.label[lang],
  }));
}

/** Route key from a live href/path — strips the locale and sur[/] noise. */
export function routeKeyFromPath(pathOrHref: string): string {
  const parts = pathOrHref.split("/").filter(Boolean);
  const withoutLang =
    parts[0] === "en" || parts[0] === "vi" || parts[0] === "zh"
      ? parts.slice(1)
      : parts;
  return withoutLang.join("/");
}

/**
 * v3 G5 — deterministic mission ordering.
 * Items whose route key appears in `orderedKeys` come first, in that order;
 * every other item keeps its original relative order after them. The set of
 * items never changes: mission state may reorder or emphasize, never hide.
 */
export function orderItemsByMission<T>(
  items: T[],
  keyOf: (item: T) => string,
  orderedKeys: string[],
): T[] {
  const rank = new Map(orderedKeys.map((key, index) => [key, index]));
  return items
    .map((item, index) => ({
      item,
      index,
      rank: rank.get(routeKeyFromPath(keyOf(item))) ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => (a.rank === b.rank ? a.index - b.index : a.rank - b.rank))
    .map(({ item }) => item);
}

/** Mission step keys, in mission order — the deterministic reorder input. */
export function missionStepKeys(steps: { path: string }[]): string[] {
  return steps.map((step) => routeKeyFromPath(step.path));
}
