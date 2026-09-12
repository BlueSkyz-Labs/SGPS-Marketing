import { PRINCIPLE_MATRIX, type Language } from "@/data/experience";
import { TRUST_LEDGER } from "@/data/trust-ledger";
import { getPublicClaims } from "@/lib/claims";
import type { ProductEntry } from "@/lib/products";

export type AtlasNodeKind =
  "brand" | "principle" | "trust" | "claim" | "evidence" | "product";

export interface AtlasNode {
  id: string;
  kind: AtlasNodeKind;
  label: string;
  href: string;
}

export interface AtlasEdge {
  from: string;
  to: string;
}

export interface AtlasModel {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

/**
 * S+ BlueSkyz Atlas V2 (v3 G6 Task 16) — evidence constellation.
 * The model is derived exclusively from truth sources: the masterbrand node
 * is the site itself, principle nodes come from the shared experience model,
 * trust nodes come from the verifiable trust ledger, claim and evidence
 * nodes come **only** from the Claim Fabric (fail-closed: a claim that
 * cannot resolve its sources never becomes a node), and product nodes come
 * only from the real public product registry (zero public products = zero
 * product nodes; nothing is fabricated). Relationships are derived from the
 * fabric — no claim content is duplicated here.
 */
export function buildAtlasModel(
  lang: Language,
  products: ProductEntry[],
): AtlasModel {
  const nodes: AtlasNode[] = [
    { id: "brand", kind: "brand", label: "BlueSkyz Labs", href: `/${lang}/` },
  ];
  const edges: AtlasEdge[] = [];

  for (const principle of PRINCIPLE_MATRIX) {
    const id = `principle:${principle.id}`;
    nodes.push({
      id,
      kind: "principle",
      label: principle.name[lang],
      href: "#house-title",
    });
    edges.push({ from: "brand", to: id });
  }

  for (const entry of TRUST_LEDGER) {
    const id = `trust:${entry.id}`;
    nodes.push({
      id,
      kind: "trust",
      label: entry.label[lang],
      href: entry.href[lang],
    });
    edges.push({ from: "brand", to: id });
  }

  // Claim Fabric: only resolved, publicly displayable claims and their
  // evidence references become nodes; relationships mirror the fabric.
  const evidenceIds = new Map<string, string>();
  for (const resolved of getPublicClaims(
    products.map((product) => ({
      slug: product.data.slug,
      name: product.data.name,
    })),
  )) {
    const claimId = `claim:${resolved.claim.id}`;
    nodes.push({
      id: claimId,
      kind: "claim",
      label: resolved.claim.statement[lang],
      href: `/${lang}/${resolved.claim.surface}/`,
    });
    edges.push({ from: "brand", to: claimId });

    for (const reference of resolved.evidence) {
      const href = reference.href[lang];
      const dedupeKey = `${reference.label.en}|${href}`;
      let evidenceId = evidenceIds.get(dedupeKey);
      if (!evidenceId) {
        evidenceId = `evidence:${evidenceIds.size + 1}`;
        evidenceIds.set(dedupeKey, evidenceId);
        nodes.push({
          id: evidenceId,
          kind: "evidence",
          label: reference.label[lang],
          href,
        });
      }
      edges.push({ from: claimId, to: evidenceId });
    }
  }

  for (const product of products) {
    const id = `product:${product.data.slug}`;
    nodes.push({
      id,
      kind: "product",
      label: product.data.name,
      href: `/${lang}/products/`,
    });
    edges.push({ from: "brand", to: id });
  }

  return { nodes, edges };
}
