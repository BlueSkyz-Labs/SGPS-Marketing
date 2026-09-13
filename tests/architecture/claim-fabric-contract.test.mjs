import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  CLAIMS,
  EVIDENCE_INDEX,
  BOUNDARY_INDEX,
} from "../../src/data/claims.ts";
import {
  buildPublicClaimGraph,
  getPublicClaim,
  getPublicClaims,
  resolvePublicClaim,
} from "../../src/lib/claims.ts";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const claimsSource = read("src/data/claims.ts");
const libSource = read("src/lib/claims.ts");

const VALID_KINDS = [
  "brand",
  "principle",
  "trust",
  "product",
  "policy",
  "support",
];

test("claim ids are unique, complete, and localized", () => {
  const ids = CLAIMS.map((claim) => claim.id);
  assert.equal(new Set(ids).size, ids.length, "claim ids must be unique");
  for (const claim of CLAIMS) {
    assert.ok(VALID_KINDS.includes(claim.kind), `bad kind: ${claim.kind}`);
    assert.ok(claim.surface.length > 0, "surface required");
    assert.ok(claim.statement.en.length > 0, "EN statement required");
    assert.ok(claim.statement.vi.length > 0, "VI statement required");
    assert.ok(claim.evidenceIds.length > 0, "evidenceIds required");
  }
});

test("every referenced evidence and boundary id resolves", () => {
  const evidenceIds = new Set(EVIDENCE_INDEX.keys());
  const boundaryIds = new Set(BOUNDARY_INDEX.keys());
  assert.ok(evidenceIds.size >= 4, "integrity evidence ids must exist");
  for (const claim of CLAIMS) {
    for (const evidenceId of claim.evidenceIds) {
      assert.ok(
        evidenceIds.has(evidenceId),
        `orphan evidence id: ${evidenceId}`,
      );
    }
    if (claim.boundaryId) {
      assert.ok(
        boundaryIds.has(claim.boundaryId),
        `unknown boundary id: ${claim.boundaryId}`,
      );
    }
  }
});

test("fail-closed: unknown evidence or missing product excludes the claim", () => {
  const synthetic = {
    id: "synthetic-orphan",
    kind: "trust",
    surface: "security",
    statement: { en: "x", vi: "y" },
    evidenceIds: ["ev-does-not-exist"],
  };
  assert.equal(resolvePublicClaim(synthetic, []), null);

  const productClaim = CLAIMS.find((claim) => claim.kind === "product");
  assert.ok(productClaim);
  // Empty registry: product claim excluded.
  assert.equal(resolvePublicClaim(productClaim, []), null);
  // Registry with a real product: claim resolves and maps the product.
  const resolved = resolvePublicClaim(productClaim, [
    { slug: "fixture-product", name: "Fixture" },
  ]);
  assert.ok(resolved);
  assert.deepEqual(resolved.productSlugs, ["fixture-product"]);
});

test("graph is deterministic and fail-closed with an empty registry", () => {
  const graph = buildPublicClaimGraph([]);
  const claimNodes = graph.nodes.filter((node) => node.kind === "claim");
  const productNodes = graph.nodes.filter((node) => node.kind === "product");
  assert.equal(productNodes.length, 0, "no product nodes while registry empty");
  const ids = new Set(graph.nodes.map((node) => node.id));
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.from), `edge from unknown node: ${edge.from}`);
    assert.ok(ids.has(edge.to), `edge to unknown node: ${edge.to}`);
    assert.ok(
      ["supported-by", "bounded-by", "appears-on", "about-product"].includes(
        edge.relation,
      ),
      `bad relation: ${edge.relation}`,
    );
  }
  assert.ok(claimNodes.length >= 2, "security + privacy claims must resolve");
  // Deterministic ordering.
  const again = buildPublicClaimGraph([]);
  assert.deepEqual(graph, again);
});

test("graph adds product nodes and about-product edges when products exist", () => {
  const graph = buildPublicClaimGraph([{ slug: "so-tro", name: "Sổ Trọ" }]);
  const productNode = graph.nodes.find((node) => node.id === "product:so-tro");
  assert.ok(productNode, "product node expected");
  assert.ok(
    graph.edges.some(
      (edge) =>
        edge.relation === "about-product" && edge.to === "product:so-tro",
    ),
    "about-product edge expected",
  );
});

test("public selectors resolve only known ids", () => {
  assert.equal(getPublicClaim("does-not-exist", []), null);
  assert.ok(getPublicClaim("security-reporting-is-private", []));
  assert.equal(getPublicClaims([]).length, CLAIMS.length - 1);
});

test("fabric rejects scores, route registries, and brand-asset truth", () => {
  const combined = `${claimsSource}\n${libSource}`;
  assert.doesNotMatch(combined, /trustScore|maturityScore|confidence|score/i);
  assert.doesNotMatch(claimsSource, /href:/, "claims must not carry hrefs");
  assert.doesNotMatch(claimsSource, /"\/en\/|"\/vi\//, "no route registry");
  assert.doesNotMatch(combined, /brand-assets/);
  assert.doesNotMatch(combined, /astro:content|getCollection/, "node-safe");
});
