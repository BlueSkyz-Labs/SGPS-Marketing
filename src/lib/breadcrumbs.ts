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
    en: "Compare claims",
    vi: "So sánh tuyên bố",
    zh: "比较声明",
    "zh-hant": "比較聲明",
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

function breadcrumbListJsonLd(trail: Crumb[], siteUrl: string) {
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

export function breadcrumbJsonLd(
  lang: Language,
  pathname: string,
  siteUrl: string,
) {
  const trail = getBreadcrumbTrail(lang, pathname);
  if (trail.length === 0) return null;
  return breadcrumbListJsonLd(trail, siteUrl);
}

/**
 * Trail for a product profile (Home > Products > product) and, when
 * `guideName` is given, its guide (… > guide). Home and Products reuse the
 * declared labels; the product name comes from the registry record and the
 * guide name from the guide's own title. Fail-closed like the rest of this
 * module: no declared Products label, no trail.
 */
export function getProductBreadcrumbTrail(
  lang: Language,
  slug: string,
  productName: string,
  guideName?: string,
): Crumb[] {
  const products = getBreadcrumbTrail(lang, `/${lang}/products/`);
  if (products.length === 0) return [];
  const productPath = `/${lang}/products/${slug}/`;
  return [
    ...products,
    { name: productName, path: productPath },
    ...(guideName ? [{ name: guideName, path: `${productPath}guide/` }] : []),
  ];
}

export function productBreadcrumbJsonLd(
  lang: Language,
  slug: string,
  productName: string,
  siteUrl: string,
  guideName?: string,
) {
  const trail = getProductBreadcrumbTrail(lang, slug, productName, guideName);
  if (trail.length === 0) return null;
  return breadcrumbListJsonLd(trail, siteUrl);
}

/**
 * Trail for one collection page (Home > Collections > collection). Home and
 * Collections reuse the declared labels; the collection name is its own
 * authored title. Fail-closed like the rest of this module.
 */
export function editionBreadcrumbJsonLd(
  lang: Language,
  id: string,
  editionTitle: string,
  siteUrl: string,
) {
  const index = getBreadcrumbTrail(lang, `/${lang}/editions/`);
  if (index.length === 0) return null;
  return breadcrumbListJsonLd(
    [...index, { name: editionTitle, path: `/${lang}/editions/${id}/` }],
    siteUrl,
  );
}
