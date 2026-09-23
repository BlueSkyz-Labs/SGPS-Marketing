import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  PUBLIC_LENSES,
  getPublicArchitectureView,
} from "../../src/lib/public-architecture.ts";

const RAW = readFileSync("architecture/sgps-model.json", "utf8");

const PUBLIC_NODE_KEYS = ["boundary", "id", "kind", "label"].sort();
const PUBLIC_VIEW_KEYS = [
  "edges",
  "lastVerified",
  "lens",
  "nodes",
  "source",
].sort();

test("the leak scanner is non-vacuous: the raw model really carries internals", () => {
  assert.match(
    RAW,
    /BlueSkyz-Labs\/SGPS-Marketing/,
    "raw model must carry a repository slug",
  );
  assert.match(RAW, /\b[0-9a-f]{40}\b/, "raw model must carry a revision");
  assert.match(RAW, /"sourceEvidence"/, "raw model must carry source evidence");
  assert.match(RAW, /"path"/, "raw model must carry a path");
});

test("no lens publishes a repository path, revision, workflow name or internal field", () => {
  for (const lens of PUBLIC_LENSES) {
    const serialized = JSON.stringify(getPublicArchitectureView(lens));
    for (const [needle, why] of [
      ["BlueSkyz-Labs/SGPS-Marketing", "repository slug"],
      ["sourceEvidence", "source evidence block"],
      ["revision", "source revision"],
      ["repository", "repository field"],
      ["src/", "repository path"],
      ["Quality Gates", "workflow name"],
      ["Browser Assurance", "workflow name"],
      ["preview", "preview environment"],
      ["@", "address-like value"],
    ]) {
      assert.equal(
        serialized.includes(needle),
        false,
        `${lens} leaks ${needle} (${why})`,
      );
    }
    assert.doesNotMatch(
      serialized,
      /\b[0-9a-f]{7,40}\b/i,
      `${lens} leaks a revision-like value`,
    );
    assert.doesNotMatch(serialized, /\//, `${lens} leaks a path separator`);
  }
});

test("every view carries exactly the public schema", () => {
  for (const lens of PUBLIC_LENSES) {
    const view = getPublicArchitectureView(lens);
    assert.deepEqual(
      Object.keys(view).sort(),
      PUBLIC_VIEW_KEYS,
      `${lens} view shape`,
    );
    for (const node of view.nodes) {
      assert.deepEqual(
        Object.keys(node).sort(),
        PUBLIC_NODE_KEYS,
        `${lens} node shape`,
      );
    }
    for (const edge of view.edges) {
      assert.deepEqual(Object.keys(edge).sort(), ["from", "id", "to", "type"]);
    }
  }
});

test("a lens returns only allowlisted kinds and never an empty view", () => {
  const allowed = {
    system: ["Portfolio", "Domain", "System", "Component"],
    data: ["DataResource"],
    trust: ["System", "Component", "ExternalDependency"],
    recovery: ["Deployment", "InfrastructureResource"],
    evidence: ["Component", "System"],
  };
  for (const lens of PUBLIC_LENSES) {
    const view = getPublicArchitectureView(lens);
    assert.ok(view.nodes.length > 0, `${lens} must return nodes`);
    for (const node of view.nodes) {
      assert.ok(
        allowed[lens].includes(node.kind),
        `${lens} leaked kind ${node.kind}`,
      );
      assert.match(
        node.id,
        /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/,
        "id must be public-safe",
      );
      assert.ok(node.label.length > 0, "label must be present");
    }
  }
});

test("edges never dangle outside the published nodes", () => {
  for (const lens of PUBLIC_LENSES) {
    const view = getPublicArchitectureView(lens);
    const ids = new Set(view.nodes.map((node) => node.id));
    for (const edge of view.edges) {
      assert.ok(
        ids.has(edge.from),
        `${lens} edge from unpublished node ${edge.from}`,
      );
      assert.ok(
        ids.has(edge.to),
        `${lens} edge to unpublished node ${edge.to}`,
      );
    }
  }
});

test("the verification date is authored, never generated at runtime", () => {
  for (const lens of PUBLIC_LENSES) {
    const view = getPublicArchitectureView(lens);
    if (view.lastVerified !== null) {
      assert.match(view.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.equal(view.source, "canonical-architecture-model");
  }
  const source = readFileSync(
    new URL("../../src/lib/public-architecture.ts", import.meta.url),
    "utf8",
  );
  for (const banned of ["Date.now", "new Date(", "Math.random", "fetch("]) {
    assert.equal(
      source.includes(banned),
      false,
      `adapter must stay deterministic: ${banned}`,
    );
  }
});

test("the projection is deterministic", () => {
  for (const lens of PUBLIC_LENSES) {
    assert.deepEqual(
      getPublicArchitectureView(lens),
      getPublicArchitectureView(lens),
    );
  }
});
