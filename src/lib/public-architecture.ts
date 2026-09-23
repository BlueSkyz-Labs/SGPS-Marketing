import { readFileSync } from "node:fs";

/**
 * C4-D G4 — public-safe architecture adapter.
 *
 * The canonical model in `architecture/sgps-model.json` is architecture truth
 * and stays authoritative; this adapter is a derived, public-safe projection of
 * it. It exposes only public labels, kinds and boundaries, and it deliberately
 * drops everything the public web must never publish: repository paths, source
 * revisions (SHAs), workflow names, internal hosts, environment/region
 * placement and any field outside the public schema.
 *
 * The projection is allowlist-driven: an entity is included only when its kind
 * belongs to the requested lens, and a value is published only when it passes a
 * conservative public-safety check. Anything that fails is omitted, never
 * sanitised into something that looks public.
 */

export const PUBLIC_LENSES = [
  "system",
  "data",
  "trust",
  "recovery",
  "evidence",
] as const;

export type PublicLens = (typeof PUBLIC_LENSES)[number];

export interface PublicArchitectureNode {
  /** Public-safe identifier: dotted lowercase segments, no path, no revision. */
  id: string;
  kind: string;
  label: string;
  /** Sanitised trust-boundary label, or null when it is not safe to publish. */
  boundary: string | null;
}

export interface PublicArchitectureEdge {
  id: string;
  from: string;
  to: string;
  type: string;
}

export interface PublicArchitectureView {
  lens: PublicLens;
  nodes: PublicArchitectureNode[];
  edges: PublicArchitectureEdge[];
  /** Authored verification date carried from the canonical model. */
  lastVerified: string | null;
  source: "canonical-architecture-model";
}

interface RawEntity {
  id?: unknown;
  kind?: unknown;
  name?: unknown;
  trustBoundary?: unknown;
  [key: string]: unknown;
}

interface RawRelationship {
  id?: unknown;
  from?: unknown;
  to?: unknown;
  type?: unknown;
}

interface RawModel {
  entities?: unknown;
  relationships?: unknown;
  lastVerified?: unknown;
}

const LENS_KINDS: Record<PublicLens, readonly string[]> = {
  system: ["Portfolio", "Domain", "System", "Component"],
  data: ["DataResource"],
  trust: ["System", "Component", "ExternalDependency"],
  recovery: ["Deployment", "InfrastructureResource"],
  evidence: ["Component", "System"],
};

/** A public id is dotted lowercase segments only — never a path or a revision. */
function isPublicId(value: unknown): value is string {
  return (
    typeof value === "string" && /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value)
  );
}

/** Internal-only vocabulary that must never reach the public projection. */
const INTERNAL_TERMS = [
  "Quality Gates",
  "Browser Assurance",
  "sourceEvidence",
  "repository",
  "revision",
];

/** Free text is publishable only when it carries no internal marker at all. */
function isPublicText(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (/[\\/]/.test(value)) return false; // no paths
  if (/\b[0-9a-f]{7,40}\b/i.test(value)) return false; // no revisions
  if (/@/.test(value)) return false; // no addresses
  for (const term of INTERNAL_TERMS) {
    if (value.toLowerCase().includes(term.toLowerCase())) return false;
  }
  return true;
}

function loadModel(): RawModel {
  const raw = readFileSync("architecture/sgps-model.json", "utf8");
  return JSON.parse(raw) as RawModel;
}

export function getPublicArchitectureView(
  lens: PublicLens,
): PublicArchitectureView {
  const model = loadModel();
  const kinds = LENS_KINDS[lens];
  const entities = Array.isArray(model.entities)
    ? (model.entities as RawEntity[])
    : [];
  const relationships = Array.isArray(model.relationships)
    ? (model.relationships as RawRelationship[])
    : [];

  const nodes: PublicArchitectureNode[] = [];
  const included = new Set<string>();

  for (const entity of entities) {
    if (!kinds.includes(String(entity.kind))) continue;
    if (!isPublicId(entity.id)) continue;
    if (!isPublicText(entity.name)) continue;
    nodes.push({
      id: entity.id,
      kind: String(entity.kind),
      label: entity.name,
      boundary: isPublicText(entity.trustBoundary)
        ? entity.trustBoundary
        : null,
    });
    included.add(entity.id);
  }

  const edges: PublicArchitectureEdge[] = [];
  for (const relationship of relationships) {
    if (!isPublicId(relationship.id)) continue;
    if (!isPublicId(relationship.from) || !isPublicId(relationship.to))
      continue;
    if (!included.has(relationship.from) || !included.has(relationship.to))
      continue;
    if (!isPublicText(relationship.type)) continue;
    edges.push({
      id: relationship.id,
      from: relationship.from,
      to: relationship.to,
      type: relationship.type,
    });
  }

  const lastVerified =
    typeof model.lastVerified === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(model.lastVerified)
      ? model.lastVerified
      : null;

  return {
    lens,
    nodes,
    edges,
    lastVerified,
    source: "canonical-architecture-model",
  };
}
