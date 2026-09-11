import { PRINCIPLE_MATRIX, type Language } from "@/data/experience";
import { TRUST_LEDGER } from "@/data/trust-ledger";
import type { ProductEntry } from "@/lib/products";

export type AtlasNodeKind = "brand" | "principle" | "trust" | "product";

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
 * S+ BlueSkyz Atlas V1 (Task 10).
 * The model is derived exclusively from truth sources: the masterbrand node
 * is the site itself, principle nodes come from the shared experience model,
 * trust nodes come from the verifiable trust ledger, and product nodes come
 * only from the real public product registry (zero public products = zero
 * product nodes; nothing is fabricated).
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
