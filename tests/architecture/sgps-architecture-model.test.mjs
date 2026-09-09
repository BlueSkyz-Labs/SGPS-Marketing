import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const model = JSON.parse(readFileSync("architecture/sgps-model.json", "utf8"));

const ALLOWED_KINDS = new Set([
  "Portfolio",
  "Domain",
  "System",
  "Component",
  "API",
  "Event",
  "DataResource",
  "InfrastructureResource",
  "ExternalDependency",
  "Deployment",
]);

const REQUIRED_PROJECT_KINDS = new Set([
  "Portfolio",
  "Domain",
  "System",
  "Component",
  "DataResource",
  "InfrastructureResource",
  "ExternalDependency",
  "Deployment",
]);

const ALLOWED_RELATIONSHIP_TYPES = new Set([
  "contains",
  "reads",
  "validates",
  "depends_on",
  "deploys_to",
  "produces",
  "assures",
]);

function assertNoParentCycles(entitiesById) {
  for (const entity of entitiesById.values()) {
    const seen = new Set([entity.id]);
    let current = entity;
    while (current.parentId) {
      assert.ok(
        entitiesById.has(current.parentId),
        `unknown parent ${current.parentId} for ${current.id}`,
      );
      assert.equal(
        seen.has(current.parentId),
        false,
        `parent cycle detected at ${current.parentId}`,
      );
      seen.add(current.parentId);
      current = entitiesById.get(current.parentId);
    }
  }
}

test("SGPS architecture model is canonical, typed, and graph-valid", () => {
  assert.equal(model.schemaVersion, "sgps.architecture/v1alpha1");
  assert.equal(model.invariant, "VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH");
  assert.match(model.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(model.entities) && model.entities.length > 0);
  assert.ok(Array.isArray(model.relationships));

  const entitiesById = new Map();
  const kinds = new Set();
  for (const entity of model.entities) {
    assert.match(entity.id, /^[a-z][a-z0-9.-]+$/);
    assert.equal(entitiesById.has(entity.id), false, `duplicate id ${entity.id}`);
    assert.ok(ALLOWED_KINDS.has(entity.kind), `invalid kind ${entity.kind}`);
    entitiesById.set(entity.id, entity);
    kinds.add(entity.kind);
  }

  for (const requiredKind of REQUIRED_PROJECT_KINDS) {
    assert.ok(kinds.has(requiredKind), `missing applicable kind ${requiredKind}`);
  }
  assertNoParentCycles(entitiesById);

  const relationshipIds = new Set();
  for (const relation of model.relationships) {
    assert.match(relation.id, /^rel\.[a-z0-9.-]+$/);
    assert.equal(
      relationshipIds.has(relation.id),
      false,
      `duplicate relationship id ${relation.id}`,
    );
    relationshipIds.add(relation.id);
    assert.ok(
      ALLOWED_RELATIONSHIP_TYPES.has(relation.type),
      `invalid relationship type ${relation.type}`,
    );
    assert.ok(entitiesById.has(relation.from), `unknown from endpoint ${relation.from}`);
    assert.ok(entitiesById.has(relation.to), `unknown to endpoint ${relation.to}`);
    assert.notEqual(relation.from, relation.to, `self relationship ${relation.id}`);
  }
});

test("SGPS marketing system binds architecture claims to immutable Git evidence", () => {
  const system = model.entities.find((entity) => entity.id === "system.sgps-marketing");
  assert.ok(system, "missing system.sgps-marketing");
  assert.equal(system.kind, "System");
  assert.equal(system.repository, "BlueSkyz-Labs/SGPS-Marketing");
  assert.equal(system.owner, "BlueSkyz Labs");
  assert.ok(system.lifecycle);
  assert.ok(system.criticality);
  assert.ok(system.dataClassification);
  assert.ok(system.trustBoundary);
  assert.equal(system.sourceEvidence?.repository, "BlueSkyz-Labs/SGPS-Marketing");
  assert.match(system.sourceEvidence?.revision ?? "", /^[0-9a-f]{40}$/);
});

test("static-site model does not fabricate backend architecture", () => {
  const prohibitedKinds = new Set(["API", "Event"]);
  const fabricated = model.entities.filter((entity) => prohibitedKinds.has(entity.kind));
  assert.deepEqual(
    fabricated,
    [],
    "API/Event entities require real repository/runtime evidence and are N/A for the current static site",
  );
  assert.match(model.notes ?? "", /auth.*database.*queue.*N\/A/i);
});

test("derived architecture views are deterministic and explicitly non-authoritative", () => {
  execFileSync(process.execPath, ["scripts/generate-architecture-views.mjs", "--check"], {
    stdio: "pipe",
  });
  const views = JSON.parse(readFileSync("architecture/derived-views.json", "utf8"));
  assert.equal(views.invariant, "VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH");
  assert.deepEqual(
    views.views.map((view) => view.id),
    [
      "portfolio-landscape",
      "system-context",
      "component",
      "dependency",
      "data-flow",
      "deployment",
      "security-trust",
      "ownership",
    ],
  );
});
