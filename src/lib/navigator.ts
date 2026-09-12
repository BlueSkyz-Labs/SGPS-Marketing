import { getFooterLinks, getNav, type Language } from "@/data/site";
import { TRUST_LEDGER } from "@/data/trust-ledger";
import { INTEGRITY_ENTRIES } from "@/data/integrity";
import type { ProductEntry } from "@/lib/products";

export interface NavigatorItem {
  href: string;
  label: string;
  kind: "route" | "trust" | "product" | "evidence";
  aliases: string[];
}

const ROUTE_ALIASES: Record<string, Record<Language, string[]>> = {
  products: {
    en: ["products", "public registry", "product status"],
    vi: ["sản phẩm", "trạng thái sản phẩm"],
  },
  about: {
    en: ["about", "company", "founder"],
    vi: ["về blueskyz", "công ty"],
  },
  contact: { en: ["contact", "reach out"], vi: ["liên hệ"] },
  support: { en: ["support", "help", "recourse"], vi: ["hỗ trợ", "giúp đỡ"] },
  privacy: { en: ["privacy", "data"], vi: ["quyền riêng tư", "dữ liệu"] },
  security: {
    en: ["security", "vulnerability", "report an issue"],
    vi: ["bảo mật", "lỗ hổng"],
  },
};

/**
 * S+ Command Navigator index (Task 9).
 * Generated from live route truth + the Trust Ledger + the real public
 * product registry — never a manually duplicated list. Unknown routes are
 * impossible: every href originates from an approved source.
 */
export function buildNavigatorIndex(
  lang: Language,
  products: ProductEntry[],
): NavigatorItem[] {
  const items: NavigatorItem[] = [];
  const byHref = new Map<string, NavigatorItem>();

  for (const link of [...getNav(lang), ...getFooterLinks(lang)]) {
    if (byHref.has(link.href)) {
      continue;
    }
    const segment = link.href.split("/").filter(Boolean)[1] ?? "";
    const item: NavigatorItem = {
      href: link.href,
      label: link.label,
      kind: "route",
      aliases: [...(ROUTE_ALIASES[segment]?.[lang] ?? [])],
    };
    items.push(item);
    byHref.set(item.href, item);
  }

  for (const entry of TRUST_LEDGER) {
    const href = entry.href[lang];
    const existing = byHref.get(href);
    if (existing) {
      existing.aliases.push(entry.summary[lang]);
      continue;
    }
    const item: NavigatorItem = {
      href,
      label: entry.label[lang],
      kind: "trust",
      aliases: [entry.summary[lang]],
    };
    items.push(item);
    byHref.set(item.href, item);
  }

  // Provenance items derive from the integrity data only — public evidence
  // destinations, merged by href so no duplicate entries exist.
  for (const entry of INTEGRITY_ENTRIES) {
    for (const evidence of entry.evidence) {
      const href = evidence.href[lang];
      const existing = byHref.get(href);
      if (existing) {
        // Only identity markers merge into existing destinations; summaries
        // can mention other topics and must not pollute unrelated matches.
        existing.aliases.push(entry.id, entry.state);
        continue;
      }
      const aliases = [entry.id, entry.state, entry.summary[lang]];
      const item: NavigatorItem = {
        href,
        label: evidence.label[lang],
        kind: "evidence",
        aliases,
      };
      items.push(item);
      byHref.set(item.href, item);
    }
  }

  for (const product of products) {
    items.push({
      href: `/${lang}/products/`,
      label: product.data.name,
      kind: "product",
      aliases: [product.data.slug, "product", "sản phẩm"],
    });
  }

  return items;
}
