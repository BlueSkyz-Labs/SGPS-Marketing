import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ARCHITECTURE_COPY } from "../../src/data/architecture-copy.ts";
import {
  PUBLIC_LENSES,
  getPublicArchitectureView,
} from "../../src/lib/public-architecture.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+){1,}$/;
const MODEL = JSON.parse(readFileSync("architecture/sgps-model.json", "utf8"));

/** Everything the model publishes through any lens. */
function published() {
  const nodes = new Map();
  const edgeTypes = new Set();
  for (const lens of PUBLIC_LENSES) {
    const view = getPublicArchitectureView(lens);
    for (const n of view.nodes) nodes.set(n.id, n);
    for (const e of view.edges) edgeTypes.add(e.type);
  }
  return { nodes, edgeTypes };
}

/** Pure checker so the negative proofs can aim it at broken copy. */
function problems(copy, { nodes, edgeTypes }) {
  const out = [];
  for (const [id, node] of nodes) {
    const entry = copy.nodes[id];
    if (!entry) out.push(`node ${id}`);
    else if (KEBAB.test(entry.label) || KEBAB.test(entry.blurb))
      out.push(`slug text ${id}`);
    if (!copy.kinds[node.kind]) out.push(`kind ${node.kind}`);
    if (node.boundary && !copy.boundaries[node.boundary])
      out.push(`boundary ${node.boundary}`);
  }
  for (const t of edgeTypes) if (!copy.edges[t]) out.push(`edge ${t}`);
  for (const lens of PUBLIC_LENSES) if (!copy.lenses[lens]) out.push(lens);
  return out;
}

test("every published entity, kind, boundary and relationship type has human copy in every locale", () => {
  const pub = published();
  assert.ok(pub.nodes.size >= 10, "non-vacuous: model publishes entities");
  for (const lang of LANGS) {
    assert.deepEqual(problems(ARCHITECTURE_COPY[lang], pub), [], lang);
  }
});

test("negative proof: a missing label or a slug-as-label is reported", () => {
  const pub = published();
  const broken = structuredClone(ARCHITECTURE_COPY.en);
  delete broken.nodes["external.github"];
  delete broken.boundaries["external-scm"];
  broken.nodes["data.product-registry"].label = "product-registry";
  const found = problems(broken, pub);
  assert.ok(found.includes("node external.github"));
  assert.ok(found.includes("boundary external-scm"));
  assert.ok(found.includes("slug text data.product-registry"));
});

test("locales expose identical key sets", () => {
  const shape = (value) =>
    Object.keys(value).sort().join("|") +
    Object.values(value)
      .filter((v) => v && typeof v === "object")
      .map(shape)
      .join("/");
  const reference = shape(ARCHITECTURE_COPY.en);
  for (const lang of LANGS)
    assert.equal(shape(ARCHITECTURE_COPY[lang]), reference, lang);
});

test("SGPS is not introduced anywhere in the visitor copy", () => {
  for (const lang of LANGS) {
    // visitor-facing strings only; the model's own ids are not shown copy
    const strings = JSON.stringify(ARCHITECTURE_COPY[lang], (key, value) =>
      /^[a-z]+\.[a-z-]+$/.test(key) ? { ...value } : value,
    );
    const visible = strings.replace(/"[a-z]+\.[a-z-]+":/g, "");
    assert.doesNotMatch(visible, /sgps/i, lang);
  }
});

test("zh-hant uses Taiwan terms and avoids mainland ones", () => {
  const text = JSON.stringify(ARCHITECTURE_COPY["zh-hant"]);
  for (const mainland of ["数据", "服务器", "用户", "软件", "信息安全"])
    assert.equal(text.includes(mainland), false, mainland);
  assert.equal(text.includes("資料"), true);
});

test("the data section reflects the model's own not-applicable note", () => {
  const note = MODEL.notes;
  for (const term of [
    "Authentication",
    "application API",
    "database",
    "queue",
    "transaction store",
    "tenant isolation",
    "session controls",
  ])
    assert.ok(note.includes(term), `model note must still mention ${term}`);
  assert.match(ARCHITECTURE_COPY.en.lenses.data.intro, /not applicable/);
});
