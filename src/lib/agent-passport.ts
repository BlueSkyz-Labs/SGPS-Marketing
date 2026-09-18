/**
 * C3-B Task 5 (G9) — agent-readable product & trust passport.
 *
 * A derived view, never a second truth: it serializes what the public registry
 * and the already-resolved Claim Fabric publish, and nothing else. Three
 * properties make it safe to serve:
 *
 *   - deterministic: entries are sorted by their own ids and the serializer
 *     emits a stable key order, so the same public state always produces bytes
 *     that compare equal;
 *   - derived: it never reads private content, workflow names, repository paths
 *     or anything the visitor could not already open;
 *   - closed vocabulary: it carries the canonical truth states and the authored
 *     product label, never a score, rank or assurance wording.
 *
 * Node-safe: relative ".ts" imports keep this module importable by the
 * repository test runner.
 */

import type { PublicProductRef, ResolvedClaim } from "./claims.ts";

/** Version of the machine contract; bump when the shape changes. */
export const AGENT_PASSPORT_VERSION = "1.0.0";

export interface AgentPassportProductInput {
  slug: string;
  name: string;
  shortDescription: string;
  publicLabel: string;
  /** Authored freshness already published on the product surface. */
  lastReviewedAt?: string | undefined;
  /** Localized public profile paths. */
  url: { en: string; vi: string };
}

export interface AgentPassportInput {
  /** Canonical public origin (ADR 0006), not a request-derived value. */
  siteUrl: string;
  products: readonly AgentPassportProductInput[];
  claims: readonly ResolvedClaim[];
  /** Public source the document was derived from, e.g. "public-registry". */
  derivedFrom: string;
}

export interface AgentPassportEvidence {
  id: string;
  kind: string;
  url: { en: string; vi: string };
  label: { en: string; vi: string };
}

export interface AgentPassportClaim {
  id: string;
  surface: string;
  statement: { en: string; vi: string };
  truthState: string;
  boundaryId?: string | undefined;
  reviewId?: string | undefined;
  evidence: AgentPassportEvidence[];
}

export interface AgentPassportProduct {
  slug: string;
  name: string;
  shortDescription: string;
  publicLabel: string;
  url: { en: string; vi: string };
  lastReviewedAt?: string | undefined;
  claims: AgentPassportClaim[];
}

export interface AgentPassportDocument {
  version: string;
  derivedFrom: string;
  site: { url: string };
  products: AgentPassportProduct[];
}

const LOCAL_PUBLIC_PATH = /^\/(?!\/)[^\s]*$/;
const UNSAFE_PATH = /(?:^|\/)(?:internal|admin|api|_)(?:\/|$)|\.\./i;

/** A published destination: an ordinary site-local route or a public https URL. */
function isPublicReference(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("https://"))
    return !/tonydemo\.com|localhost|127\.0\.0\.1/i.test(href);
  return LOCAL_PUBLIC_PATH.test(href) && !UNSAFE_PATH.test(href);
}

function sortBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const left = key(a);
    const right = key(b);
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

/**
 * Build the passport from canonical public inputs. Products the registry does
 * not publish are absent by construction, and a claim only appears under a
 * product it resolved for.
 */
export function buildAgentPassport(
  input: AgentPassportInput,
): AgentPassportDocument {
  const products = [...input.products]
    .filter((product) => Boolean(product.slug) && Boolean(product.name))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .map<AgentPassportProduct>((product) => {
      const claims = sortBy(
        input.claims.filter((resolved) =>
          resolved.productSlugs.includes(product.slug),
        ),
        (resolved) => resolved.claim.id,
      ).map<AgentPassportClaim>((resolved) => ({
        id: resolved.claim.id,
        surface: resolved.claim.surface,
        statement: {
          en: resolved.claim.statement.en,
          vi: resolved.claim.statement.vi,
        },
        truthState: resolved.reviewId ? "reviewed" : "source-linked",
        ...(resolved.boundaryId ? { boundaryId: resolved.boundaryId } : {}),
        ...(resolved.reviewId ? { reviewId: resolved.reviewId } : {}),
        evidence: sortBy(resolved.evidence, (reference) => reference.id)
          .filter(
            (reference) =>
              isPublicReference(reference.href.en) &&
              isPublicReference(reference.href.vi),
          )
          .map<AgentPassportEvidence>((reference) => ({
            id: reference.id,
            kind: reference.kind,
            url: { en: reference.href.en, vi: reference.href.vi },
            label: { en: reference.label.en, vi: reference.label.vi },
          })),
      }));

      return {
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        publicLabel: product.publicLabel,
        url: { en: product.url.en, vi: product.url.vi },
        ...(product.lastReviewedAt
          ? { lastReviewedAt: product.lastReviewedAt }
          : {}),
        claims,
      };
    })
    .filter(
      (product) =>
        isPublicReference(product.url.en) && isPublicReference(product.url.vi),
    );

  return {
    version: AGENT_PASSPORT_VERSION,
    derivedFrom: input.derivedFrom,
    site: { url: input.siteUrl },
    products,
  };
}

/**
 * Stable JSON: two spaces, insertion order decided above, trailing newline. The
 * bytes are the contract an agent reads, so they must not drift between builds.
 */
export function serializeAgentPassport(
  document: AgentPassportDocument,
): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

/** Convenience for callers that only hold public product refs. */
export function toPassportProducts(
  products: readonly PublicProductRef[],
): PublicProductRef[] {
  return [...products].sort((a, b) => (a.slug < b.slug ? -1 : 1));
}
