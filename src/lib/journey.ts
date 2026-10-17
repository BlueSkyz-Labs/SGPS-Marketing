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
  // Home carries exactly one primary action (Experience v6 S1); no pill row.
  "": [],
  products: [
    {
      segment: "verify",
      label: { en: "Verify", vi: "Kiểm chứng", zh: "核实", "zh-hant": "查證" },
    },
    {
      segment: "about",
      label: {
        en: "About BlueSkyz",
        vi: "Về BlueSkyz",
        zh: "关于 BlueSkyz",
        "zh-hant": "關於 BlueSkyz",
      },
    },
    {
      segment: "contact",
      label: {
        en: "Contact",
        vi: "Liên hệ",
        zh: "联系我们",
        "zh-hant": "聯絡我們",
      },
    },
  ],
  about: [
    {
      segment: "products",
      label: {
        en: "Product status",
        vi: "Trạng thái sản phẩm",
        zh: "产品状态",
        "zh-hant": "產品狀態",
      },
    },
    {
      segment: "contact",
      label: {
        en: "Contact",
        vi: "Liên hệ",
        zh: "联系我们",
        "zh-hant": "聯絡我們",
      },
    },
  ],
  contact: [
    {
      segment: "support",
      label: { en: "Support", vi: "Hỗ trợ", zh: "支持", "zh-hant": "支援" },
    },
    {
      segment: "security",
      label: { en: "Security", vi: "Bảo mật", zh: "安全", "zh-hant": "安全" },
    },
  ],
  // Customer review F2: /support already ends with the same Contact and
  // Security pair in-page; a second identical row is noise, not a next step.
  support: [],
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

/**
 * CX4 (audit M1): Home keeps no journey bar (`"": []`, one primary action);
 * its closing row is a separate, quiet About + Contact pair that reuses the
 * labels already approved for the other routes' Next steps rows.
 */
const HOME_CLOSE_SEGMENTS = ["about", "contact"] as const;

export function getHomeCloseActions(lang: Language): JourneyAction[] {
  const allSteps = Object.values(JOURNEY).flat();
  return HOME_CLOSE_SEGMENTS.flatMap((segment) => {
    const step = allSteps.find((candidate) => candidate.segment === segment);
    return step
      ? [{ href: `/${lang}/${segment}/`, label: step.label[lang] }]
      : [];
  });
}

/**
 * UX-U5 (P1-7): in-page next steps for a product profile that has no real
 * screens yet. Same approved labels and existing routes as the other Next steps
 * rows (Product status, Verify, Contact); no new copy.
 */
const PROFILE_NEXT_SEGMENTS = ["products", "verify", "contact"] as const;

export function getProfileNextActions(lang: Language): JourneyAction[] {
  const allSteps = Object.values(JOURNEY).flat();
  return PROFILE_NEXT_SEGMENTS.flatMap((segment) => {
    const step = allSteps.find((candidate) => candidate.segment === segment);
    return step
      ? [{ href: `/${lang}/${segment}/`, label: step.label[lang] }]
      : [];
  });
}

/** Route key from a live href/path — strips the locale and sur[/] noise. */
export function routeKeyFromPath(pathOrHref: string): string {
  const parts = pathOrHref.split("/").filter(Boolean);
  const withoutLang =
    parts[0] === "en" ||
    parts[0] === "vi" ||
    parts[0] === "zh" ||
    parts[0] === "zh-hant"
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
