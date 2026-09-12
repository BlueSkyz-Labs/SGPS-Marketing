/**
 * Claim-to-Evidence Fabric selectors (v3 G1) — fail-closed.
 *
 * A claim becomes a public graph node only when every evidence reference
 * resolves, its surface is declared, product claims resolve a public
 * product, and any optional boundary/review reference exists. Anything
 * that cannot satisfy the contract is excluded rather than guessed.
 *
 * Node-safe: relative ".ts" imports keep this module importable by the
 * repository test runner (same pattern as src/lib/act.ts).
 */

import {
  BOUNDARY_INDEX,
  CLAIMS,
  EVIDENCE_INDEX,
  INTEGRITY_ENTRY_INDEX,
  type PublicClaim,
} from "../data/claims.ts";
import type {
  BoundaryStatement,
  EvidenceReference,
  TruthState,
} from "../data/integrity.ts";

export interface PublicProductRef {
  slug: string;
  name: string;
}

export type ClaimGraphNode = {
  id: string;
  kind: "claim" | "evidence" | "boundary" | "surface" | "product";
};

export type ClaimGraphRelation =
  "supported-by" | "bounded-by" | "appears-on" | "about-product";

export interface ClaimGraphEdge {
  from: string;
  to: string;
  relation: ClaimGraphRelation;
}

export interface ResolvedClaim {
  claim: PublicClaim;
  evidence: EvidenceReference[];
  boundaryId?: string | undefined;
  reviewId?: string | undefined;
  productSlugs: string[];
}

const CLAIM_ID_SET = new Set(CLAIMS.map((claim) => claim.id));

/** Fail-closed resolution of a single claim against the public registry. */
export function resolvePublicClaim(
  claim: PublicClaim,
  products: PublicProductRef[],
): ResolvedClaim | null {
  if (!claim.id || !claim.surface) return null;
  if (!claim.statement.en || !claim.statement.vi) return null;
  if (claim.evidenceIds.length === 0) return null;

  const evidence: EvidenceReference[] = [];
  for (const evidenceId of claim.evidenceIds) {
    const ref = EVIDENCE_INDEX.get(evidenceId);
    if (!ref) return null;
    if (!evidence.some((item) => item.id === ref.id)) {
      evidence.push(ref);
    }
  }

  if (claim.boundaryId && !BOUNDARY_INDEX.has(claim.boundaryId)) return null;
  if (claim.reviewId && !INTEGRITY_ENTRY_INDEX.has(claim.reviewId)) return null;

  let productSlugs: string[] = [];
  if (claim.kind === "product") {
    // Product claims must resolve the live public registry; an empty
    // registry fails closed instead of publishing an empty promise.
    if (products.length === 0) return null;
    productSlugs = products.map((product) => product.slug);
  }

  return {
    claim,
    evidence,
    boundaryId: claim.boundaryId,
    reviewId: claim.reviewId,
    productSlugs,
  };
}

export function getPublicClaims(products: PublicProductRef[]): ResolvedClaim[] {
  return CLAIMS.map((claim) => resolvePublicClaim(claim, products)).filter(
    (resolved): resolved is ResolvedClaim => resolved !== null,
  );
}

export function getPublicClaim(
  id: string,
  products: PublicProductRef[],
): ResolvedClaim | null {
  if (!CLAIM_ID_SET.has(id)) return null;
  const claim = CLAIMS.find((candidate) => candidate.id === id);
  return claim ? resolvePublicClaim(claim, products) : null;
}

export interface PublicClaimGraph {
  nodes: ClaimGraphNode[];
  edges: ClaimGraphEdge[];
}

/** Deterministic public graph: claims -> evidence/boundary -> surface/product. */
export function buildPublicClaimGraph(
  products: PublicProductRef[],
): PublicClaimGraph {
  const nodes = new Map<string, ClaimGraphNode>();
  const edges: ClaimGraphEdge[] = [];

  const addNode = (node: ClaimGraphNode) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  };

  for (const resolved of getPublicClaims(products)) {
    const claimNodeId = `claim:${resolved.claim.id}`;
    addNode({ id: claimNodeId, kind: "claim" });

    for (const ref of resolved.evidence) {
      const evidenceNodeId = `evidence:${ref.id}`;
      addNode({ id: evidenceNodeId, kind: "evidence" });
      edges.push({
        from: claimNodeId,
        to: evidenceNodeId,
        relation: "supported-by",
      });
    }

    if (resolved.boundaryId) {
      const boundaryNodeId = `boundary:${resolved.boundaryId}`;
      addNode({ id: boundaryNodeId, kind: "boundary" });
      edges.push({
        from: claimNodeId,
        to: boundaryNodeId,
        relation: "bounded-by",
      });
    }

    const surfaceNodeId = `surface:${resolved.claim.surface}`;
    addNode({ id: surfaceNodeId, kind: "surface" });
    edges.push({
      from: claimNodeId,
      to: surfaceNodeId,
      relation: "appears-on",
    });

    for (const slug of resolved.productSlugs) {
      const productNodeId = `product:${slug}`;
      addNode({ id: productNodeId, kind: "product" });
      edges.push({
        from: claimNodeId,
        to: productNodeId,
        relation: "about-product",
      });
    }
  }

  return {
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort(
      (a, b) =>
        a.from.localeCompare(b.from) ||
        a.to.localeCompare(b.to) ||
        a.relation.localeCompare(b.relation),
    ),
  };
}

/** Ordered source-to-surface trace steps for a modeled claim (v3 G2). */
export interface ClaimTraceStep {
  kind: "claim" | "evidence" | "boundary" | "surface";
  id: string;
  label: { en: string; vi: string };
  href?: { en: string; vi: string } | undefined;
}

const SURFACE_LABELS: Record<string, { en: string; vi: string }> = {
  security: { en: "Security surface", vi: "Bề mặt Bảo mật" },
  privacy: { en: "Privacy surface", vi: "Bề mặt Quyền riêng tư" },
  products: { en: "Products surface", vi: "Bề mặt Sản phẩm" },
};

/**
 * Deterministic trace: claim -> evidence (as declared) -> optional boundary
 * -> surface. Missing optional nodes disappear; nothing is fabricated.
 */
export function getClaimTrace(
  id: string,
  products: PublicProductRef[],
): ClaimTraceStep[] | null {
  const resolved = getPublicClaim(id, products);
  if (!resolved) return null;

  const steps: ClaimTraceStep[] = [
    {
      kind: "claim",
      id: resolved.claim.id,
      label: resolved.claim.statement,
    },
  ];

  for (const ref of resolved.evidence) {
    steps.push({
      kind: "evidence",
      id: ref.id,
      label: ref.label,
      href: ref.href,
    });
  }

  if (resolved.boundaryId) {
    const boundary = BOUNDARY_INDEX.get(resolved.boundaryId);
    if (boundary) {
      steps.push({
        kind: "boundary",
        id: boundary.id,
        label: boundary.claim,
      });
    }
  }

  const surfaceRoute = EVIDENCE_INDEX.get(`ev-${resolved.claim.surface}-route`);
  steps.push({
    kind: "surface",
    id: resolved.claim.surface,
    label: SURFACE_LABELS[resolved.claim.surface] ?? {
      en: resolved.claim.surface,
      vi: resolved.claim.surface,
    },
    href: surfaceRoute?.href,
  });

  return steps;
}

/** Evidence passport model (v3 G3) — public, printable, shareable. */
export interface EvidencePassportModel {
  id: string;
  claim: { en: string; vi: string };
  state: TruthState;
  evidence: EvidenceReference[];
  boundaryId?: string | undefined;
  boundary?: BoundaryStatement | undefined;
  reviewedOn?: string | undefined;
  contextHref: { en: string; vi: string };
}

export function getEvidencePassport(
  id: string,
  products: PublicProductRef[],
): EvidencePassportModel | null {
  const resolved = getPublicClaim(id, products);
  if (!resolved) return null;

  const contextRoute = EVIDENCE_INDEX.get(`ev-${resolved.claim.surface}-route`);
  if (!contextRoute) return null;

  const entry = resolved.reviewId
    ? INTEGRITY_ENTRY_INDEX.get(resolved.reviewId)
    : undefined;

  return {
    id: resolved.claim.id,
    claim: resolved.claim.statement,
    state: entry?.state ?? "source-linked",
    evidence: resolved.evidence,
    boundaryId: resolved.boundaryId,
    boundary: resolved.boundaryId
      ? BOUNDARY_INDEX.get(resolved.boundaryId)
      : undefined,
    reviewedOn: entry?.review?.reviewedOn,
    contextHref: contextRoute.href,
  };
}

/** Static passport paths for a locale — only modeled public claims. */
export function getEvidencePassportIds(products: PublicProductRef[]): string[] {
  return getPublicClaims(products).map((resolved) => resolved.claim.id);
}
