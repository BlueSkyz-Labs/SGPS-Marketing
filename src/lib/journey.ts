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
      },
    },
    { segment: "about", label: { en: "About BlueSkyz", vi: "Về BlueSkyz" } },
  ],
  products: [
    { segment: "about", label: { en: "About BlueSkyz", vi: "Về BlueSkyz" } },
    { segment: "contact", label: { en: "Contact", vi: "Liên hệ" } },
  ],
  about: [
    {
      segment: "products",
      label: { en: "Product status", vi: "Trạng thái sản phẩm" },
    },
    { segment: "contact", label: { en: "Contact", vi: "Liên hệ" } },
  ],
  contact: [
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ" } },
    { segment: "security", label: { en: "Security", vi: "Bảo mật" } },
  ],
  support: [
    { segment: "contact", label: { en: "Contact", vi: "Liên hệ" } },
    { segment: "security", label: { en: "Security", vi: "Bảo mật" } },
  ],
  privacy: [
    { segment: "security", label: { en: "Security", vi: "Bảo mật" } },
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ" } },
  ],
  security: [
    { segment: "support", label: { en: "Support", vi: "Hỗ trợ" } },
    { segment: "privacy", label: { en: "Privacy", vi: "Quyền riêng tư" } },
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
