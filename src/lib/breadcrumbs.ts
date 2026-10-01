import { getFooterLinks } from "../data/site.ts";
import type { Language } from "./i18n.ts";
import { canonicalForPath } from "./seo.ts";

export interface Crumb {
  name: string;
  path: string;
}

const HOME_LABELS: Record<Language, string> = {
  en: "Home",
  vi: "Trang chủ",
  zh: "首页",
  "zh-hant": "首頁",
};

/**
 * Labels for public routes whose name is already declared in the UI.
 * Nothing here may invent a name: each entry mirrors a string the page or its
 * component already renders.
 */
const DECLARED_ROUTE_LABELS: Record<string, Record<Language, string>> = {
  "decision-room": {
    en: "Compare the evidence",
    vi: "So sánh bằng chứng",
    zh: "对比证据",
    "zh-hant": "對照證據",
  },
  evidence: {
    en: "Evidence for this claim",
    vi: "Bằng chứng cho nhận định này",
    zh: "这条说法的证据",
    "zh-hant": "這項說法的證據",
  },
};

const normalize = (path: string): string => {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

function routeLabels(lang: Language): Map<string, string> {
  const labels = new Map<string, string>();
  for (const item of getFooterLinks(lang)) {
    labels.set(normalize(item.href), item.label);
  }
  for (const [segment, value] of Object.entries(DECLARED_ROUTE_LABELS)) {
    labels.set(`/${lang}/${segment}`, value[lang]);
  }
  return labels;
}

/**
 * Breadcrumb trail for a public route, or an empty list when the route has no
 * declared label (fail-closed: a page without a canonical name gets no
 * breadcrumb instead of an invented one).
 */
export function getBreadcrumbTrail(lang: Language, pathname: string): Crumb[] {
  const home = `/${lang}/`;
  const target = normalize(pathname);
  if (target === normalize(home)) return [];

  const labels = routeLabels(lang);
  let name = labels.get(target);

  if (!name) {
    // Evidence passports carry the claim's own declared label.
    const evidence = /^\/(en|vi|zh-hant|zh)\/evidence\/([a-z0-9-]+)$/.exec(
      target,
    );
    if (evidence) name = DECLARED_ROUTE_LABELS.evidence?.[lang];
  }
  if (!name) return [];

  return [
    { name: HOME_LABELS[lang], path: home },
    { name, path: `${target}/` },
  ];
}

export function breadcrumbJsonLd(
  lang: Language,
  pathname: string,
  siteUrl: string,
) {
  const trail = getBreadcrumbTrail(lang, pathname);
  if (trail.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalForPath(crumb.path, siteUrl),
    })),
  } as const;
}
