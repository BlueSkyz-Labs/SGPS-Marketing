import { CLAIMS } from "../data/claims.ts";
import type { Language } from "../data/site.ts";
import { getPublicClaims, type PublicProductRef } from "./claims.ts";
import { CANONICAL_PUBLIC_SITE_ORIGIN } from "./truth.ts";

/**
 * C3-E Task 2 — deterministic public concierge corpus adapter.
 *
 * The corpus is a COMPOSITION of published truth, never a new statement of it.
 * Every record's text is taken verbatim from the same canonical adapters the
 * claim fabric and the evidence passport already use, so this module cannot
 * introduce a product, claim, evidence, release or route fact of its own.
 *
 * There is no model here, no network, no storage, no clock and no randomness:
 * the same input produces the same corpus, ids are stable, and ordering is
 * canonical (never the order the caller happened to pass).
 *
 * Only the records the caller supplies as public become products; the claim
 * set is resolved through the fail-closed claim resolver; route records exist
 * only for surfaces that carry canonical claim statements. Anything else is
 * absent — never substituted, never inferred.
 */

export const CONCIERGE_KINDS = ["product", "claim", "route"] as const;

export type ConciergeKind = (typeof CONCIERGE_KINDS)[number];

/** The public surfaces that produce route records (the plan's selector list). */
const ROUTE_SURFACES = ["security", "privacy", "support"] as const;

export interface ConciergeProductInput {
  slug: string;
  /** Public display name from the registry. */
  name: string;
  /** Public short description from the registry; falls back to the name. */
  description?: string;
}

export interface ConciergeCorpusInput {
  /** Only the caller's already-public products; the corpus adds none. */
  products: readonly ConciergeProductInput[];
  lang: Language;
}

export interface ConciergeCorpusRecord {
  /** Stable canonical id, e.g. `product:sotro`, `claim:<claim-id>`, `route:security`. */
  id: string;
  kind: ConciergeKind;
  /** Verbatim from the canonical source. */
  title: string;
  /** Verbatim composition of canonical statements; never generated prose. */
  text: string;
  /** Absolute same-origin public URL for the requested language. */
  publicUrl: string;
  /** The canonical source identities this record composes. */
  sourceIds: string[];
}

/** A public slug is strictly lowercase; anything else is refused, never sanitized. */
const PUBLIC_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

function isUsableSlug(value: unknown): value is string {
  return typeof value === "string" && PUBLIC_SLUG.test(value);
}

function publicUrl(lang: Language, path: string): string {
  return `${CANONICAL_PUBLIC_SITE_ORIGIN}/${lang}/${path}`;
}

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function buildConciergeCorpus(
  input: ConciergeCorpusInput,
): ConciergeCorpusRecord[] {
  const lang = input?.lang;
  const products = Array.isArray(input?.products) ? input.products : [];

  // Refuse malformed slugs up front — a bad input never becomes a record.
  const usable = products.filter((product) => isUsableSlug(product?.slug));

  const records: ConciergeCorpusRecord[] = [];

  // Product records — the caller's public refs, reflected one-to-one.
  for (const product of usable) {
    const title = nonEmpty(product.name) ?? product.slug;
    const text = nonEmpty(product.description) ?? title;
    records.push({
      id: `product:${product.slug}`,
      kind: "product",
      title,
      text,
      publicUrl: publicUrl(lang, `products/${product.slug}/`),
      sourceIds: [product.slug],
    });
  }

  // Claim records — the fail-closed claim resolver is the shared authority for
  // what is publicly composable; it also enforces the canonical catalog.
  const refs: PublicProductRef[] = usable.map((product) => ({
    slug: product.slug,
    name: nonEmpty(product.name) ?? product.slug,
  }));
  const resolved = getPublicClaims(refs);

  for (const item of resolved) {
    const claim = item.claim;
    const title = nonEmpty(claim.titleLabel?.[lang]) ?? claim.statement[lang];
    records.push({
      id: `claim:${claim.id}`,
      kind: "claim",
      title,
      text: claim.statement[lang],
      publicUrl: publicUrl(lang, `evidence/${claim.id}/`),
      sourceIds: [claim.id, ...(claim.evidenceIds ?? [])],
    });
  }

  // Route records — one per surface that carries canonical claim statements.
  const bySurface = new Map<
    string,
    { statements: string[]; claimIds: string[] }
  >();
  for (const item of resolved) {
    const surface = item.claim.surface;
    if (!(ROUTE_SURFACES as readonly string[]).includes(surface)) continue;
    const bucket = bySurface.get(surface) ?? { statements: [], claimIds: [] };
    bucket.statements.push(item.claim.statement[lang]);
    bucket.claimIds.push(item.claim.id);
    bySurface.set(surface, bucket);
  }

  for (const surface of [...bySurface.keys()].sort()) {
    const bucket = bySurface.get(surface)!;
    records.push({
      id: `route:${surface}`,
      kind: "route",
      title: `/${lang}/${surface}/`,
      text: bucket.statements.join(" "),
      publicUrl: publicUrl(lang, `${surface}/`),
      sourceIds: [...bucket.claimIds].sort(),
    });
  }

  // Canonical order: stable ids, never the input order.
  return records.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Non-vacuity guard for the catalog this module reads. */
export function conciergeCorpusCatalogIsEmpty(): boolean {
  return CLAIMS.length === 0;
}
