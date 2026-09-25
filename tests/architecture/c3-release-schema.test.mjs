import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_INDEX } from "../../src/data/claims.ts";

let schema;
let moduleLoadError;
try {
  schema = await import("../../src/lib/release-schema.ts");
} catch (error) {
  moduleLoadError = error;
}

const VALID_SOURCE = {
  revision: "abcdef1234567",
  url: "https://github.com/BlueSkyz-Labs/sgps-marketing/releases/tag/2026-09-25",
  public: true,
  published: true,
  authoredMajorMilestone: false,
};

const CONTEXT = {
  asOfDate: "2026-09-25",
  products: [{ slug: "apexagent", public: true }],
  sources: [VALID_SOURCE],
  evidence: EVIDENCE_INDEX,
};

const VALID_STORY = {
  id: "apexagent-2026-09-25",
  productSlug: "apexagent",
  title: "ApexAgent release",
  summary: "A public release story backed by authored source evidence.",
  releaseDate: "2026-09-25",
  sourceRevision: VALID_SOURCE.revision,
  sourceUrl: VALID_SOURCE.url,
  changes: [
    {
      id: "guided-workflows",
      kind: "feature",
      title: "Guided workflows",
      summary:
        "Adds authored workflow guidance for the public product surface.",
    },
  ],
  productSurface: "/en/products/apexagent/",
  evidenceIds: ["ev-products-route"],
};

function parse(input = VALID_STORY, context = CONTEXT) {
  if (moduleLoadError) {
    assert.fail(
      `release schema module failed to load: ${moduleLoadError.message}`,
    );
  }
  return schema.parseReleaseStory(input, context);
}

function assertRejected(input, message, context = CONTEXT) {
  assert.throws(() => parse(input, context), new RegExp(message));
}

test("accepts a release story with a public product, source, and evidence", () => {
  const story = parse();
  assert.equal(story.id, VALID_STORY.id);
  assert.equal(story.productSlug, "apexagent");
  assert.deepEqual(story.evidenceIds, ["ev-products-route"]);
});

test("requires a resolvable release or source identity", () => {
  const input = {
    ...VALID_STORY,
    sourceRevision: undefined,
    sourceUrl: undefined,
  };
  assertRejected(input, "source identity");
});

test("rejects a future release date without consulting a runtime clock", () => {
  assertRejected({ ...VALID_STORY, releaseDate: "2026-09-26" }, "future");
});

test("rejects a generated or non-authored release date", () => {
  assertRejected(
    { ...VALID_STORY, releaseDate: new Date("2026-09-25") },
    "authored",
  );
});

test("rejects an unknown product", () => {
  assertRejected({ ...VALID_STORY, productSlug: "unknown-product" }, "product");
});

test("rejects an unpublished product", () => {
  const context = {
    ...CONTEXT,
    products: [{ slug: "apexagent", public: false }],
  };
  assertRejected(VALID_STORY, "product", context);
});

test("rejects a private or unresolvable source", () => {
  const context = {
    ...CONTEXT,
    sources: [{ ...VALID_SOURCE, public: false }],
  };
  assertRejected(VALID_STORY, "source", context);
});

test("rejects unsupported metrics or adoption claims", () => {
  assertRejected(
    { ...VALID_STORY, metrics: { adoptionRate: 0.9 } },
    "unsupported",
  );
});

test("rejects an unsupported significance claim", () => {
  assertRejected({ ...VALID_STORY, significance: "viral" }, "significance");
});

test("rejects a missing or unknown evidence reference", () => {
  assertRejected({ ...VALID_STORY, evidenceIds: [] }, "evidence");
  assertRejected(
    { ...VALID_STORY, evidenceIds: ["ev-not-published"] },
    "evidence",
  );
});

test("rejects injection-like identifiers and paths", () => {
  assertRejected({ ...VALID_STORY, id: "../publish" }, "identifier");
  assertRejected(
    { ...VALID_STORY, productSurface: "/src/private/repo" },
    "path",
  );
});

test("rejects internal repository paths in public copy", () => {
  assertRejected(
    { ...VALID_STORY, summary: "See src/lib/release-schema.ts for details." },
    "internal",
  );
});

test("does not promote maintenance to a major milestone without authored source truth", () => {
  const input = {
    ...VALID_STORY,
    significance: "major",
    changes: [
      {
        id: "maintenance",
        kind: "maintenance",
        title: "Maintenance",
        summary: "Routine maintenance only.",
      },
    ],
  };
  assertRejected(input, "major");
});

test("permits an authored major milestone only when the source says so", () => {
  const context = {
    ...CONTEXT,
    sources: [{ ...VALID_SOURCE, authoredMajorMilestone: true }],
  };
  const story = parse({ ...VALID_STORY, significance: "major" }, context);
  assert.equal(story.significance, "major");
});
