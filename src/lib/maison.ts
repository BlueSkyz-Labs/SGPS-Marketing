import { getFooterLinks, type Language } from "../data/site.ts";

/**
 * C4-B G1 — Maison information architecture adapter.
 *
 * Organizes the public surfaces BlueSkyz already owns into one house order. It
 * is an ADAPTER, not a registry: every href is taken from the existing approved
 * route helper, and a section whose public route does not exist is omitted
 * rather than invented. Nothing here may become a second route source.
 */

export type MaisonSectionId =
  "products" | "proof" | "architecture" | "journal" | "studio";

export interface MaisonSection {
  id: MaisonSectionId;
  label: string;
  href: string;
}

/** House order. Sections are listed in the order a visitor should meet them. */
export const MAISON_ORDER: readonly MaisonSectionId[] = [
  "products",
  "proof",
  "architecture",
  "journal",
  "studio",
] as const;

/**
 * Sections that have no resolvable public route yet. They stay in the house
 * order but are omitted from output — an edition may curate only items that
 * actually resolve.
 */
export const MAISON_PENDING_SECTIONS: readonly MaisonSectionId[] = [
  "architecture",
  "journal",
] as const;

/**
 * Which approved footer link backs each live section. `proof` reads as the
 * security/trust surface; `studio` reads as the house's about surface.
 */
const SECTION_ROUTE_KEY: Readonly<Partial<Record<MaisonSectionId, string>>> =
  Object.freeze({
    products: "products",
    proof: "security",
    studio: "about",
  });

/**
 * Ordered public section descriptors for this language. Fail closed: a section
 * whose backing route is absent from the approved helper is dropped, never
 * given a synthesized href.
 */
export function getMaisonSections(lang: Language): MaisonSection[] {
  const approved = getFooterLinks(lang);
  const sections: MaisonSection[] = [];

  for (const id of MAISON_ORDER) {
    const key = SECTION_ROUTE_KEY[id];
    if (!key) continue;
    const link = approved.find((item) => item.href === `/${lang}/${key}/`);
    if (!link) continue;
    sections.push({ id, label: link.label, href: link.href });
  }

  return sections;
}

/** Ids omitted this run, for evidence and routing docs. */
export function getMaisonPendingSections(): MaisonSectionId[] {
  return [...MAISON_PENDING_SECTIONS];
}
