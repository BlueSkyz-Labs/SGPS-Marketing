/**
 * C3-B Task 5 (G9) — agent-readable passport: shape, determinism and leakage.
 *
 * The document is served publicly to machines, so the guard is mostly negative:
 * it must contain nothing a human visitor could not already open, carry no
 * assurance vocabulary, and serialize to identical bytes for identical public
 * state.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  AGENT_PASSPORT_VERSION,
  buildAgentPassport,
  serializeAgentPassport,
} from "../../src/lib/agent-passport.ts";
import { getEvidencePassportPath } from "../../src/lib/claims.ts";
import { getProductIndexPath } from "../../src/lib/product-routes.ts";
import { NEVER_IMPLIED_BY_ANY_STATE } from "../../src/lib/public-state-semantics.ts";

const INPUT = {
  siteUrl: "https://blueskyzlabs.com",
  derivedFrom: "public-registry",
  products: [
    {
      slug: "fixture-product",
      name: "Fixture Product",
      shortDescription: "Fixture description.",
      publicLabel: "In development",
      lastReviewedAt: "2026-08-01",
      url: {
        en: "/en/products/fixture-product/",
        vi: "/vi/products/fixture-product/",
      },
    },
    {
      slug: "another-product",
      name: "Another Product",
      shortDescription: "Another fixture description.",
      publicLabel: "Preview",
      url: {
        en: "/en/products/another-product/",
        vi: "/vi/products/another-product/",
      },
    },
  ],
  claims: [
    {
      claim: {
        id: "fixture-claim",
        kind: "product",
        surface: "products",
        statement: { en: "Fixture claim", vi: "Tuyên bố kiểm thử" },
        evidenceIds: ["fixture-evidence"],
      },
      evidence: [
        {
          id: "fixture-evidence",
          kind: "artifact",
          href: {
            en: "/en/evidence/fixture-evidence/",
            vi: "/vi/evidence/fixture-evidence/",
          },
          label: { en: "Fixture evidence", vi: "Bằng chứng kiểm thử" },
        },
      ],
      boundaryId: "fixture-boundary",
      reviewId: "fixture-review",
      productSlugs: ["fixture-product"],
    },
  ],
};

test("the document carries only the vetted top-level shape", () => {
  const document = buildAgentPassport(INPUT);
  assert.deepEqual(Object.keys(document), [
    "version",
    "derivedFrom",
    "site",
    "products",
  ]);
  assert.equal(document.version, AGENT_PASSPORT_VERSION);
  assert.equal(document.site.url, "https://blueskyzlabs.com");
  const fixture = document.products.find(
    (product) => product.slug === "fixture-product",
  );
  assert.deepEqual(Object.keys(fixture ?? {}), [
    "slug",
    "name",
    "shortDescription",
    "publicLabel",
    "url",
    "lastReviewedAt",
    "claims",
  ]);
  // Authored freshness is optional: a product without it carries no empty field.
  const another = document.products.find(
    (product) => product.slug === "another-product",
  );
  assert.equal("lastReviewedAt" in (another ?? {}), false);
});

test("identical public state serializes to identical bytes, in a stable order", () => {
  const first = serializeAgentPassport(buildAgentPassport(INPUT));
  const second = serializeAgentPassport(
    buildAgentPassport({ ...INPUT, products: [...INPUT.products].reverse() }),
  );
  assert.equal(
    first,
    second,
    "product order in the input must not change the document",
  );

  const document = buildAgentPassport(INPUT);
  assert.deepEqual(
    document.products.map((product) => product.slug),
    ["another-product", "fixture-product"],
  );
  assert.ok(first.endsWith("\n"), "the machine document ends with a newline");
});

test("a claim appears only under the product it resolved for", () => {
  const document = buildAgentPassport(INPUT);
  const fixture = document.products.find(
    (product) => product.slug === "fixture-product",
  );
  const other = document.products.find(
    (product) => product.slug === "another-product",
  );
  assert.deepEqual(
    fixture?.claims.map((claim) => claim.id),
    ["fixture-claim"],
  );
  assert.equal(fixture?.claims[0]?.truthState, "reviewed");
  assert.equal(fixture?.claims[0]?.boundaryId, "fixture-boundary");
  assert.deepEqual(other?.claims, []);
});

test("public destinations only, and locale-safe", () => {
  const document = buildAgentPassport(INPUT);
  const serialized = serializeAgentPassport(document);
  for (const product of document.products) {
    assert.match(product.url.en, /^\/en\/products\//);
    assert.match(product.url.vi, /^\/vi\/products\//);
  }

  assert.equal(getProductIndexPath("zh"), "/zh/products/");
  assert.equal(
    getEvidencePassportPath("zh", "privacy-no-tracking-on-this-site"),
    "/zh/evidence/privacy-no-tracking-on-this-site/",
  );

  // A reference that is not an ordinary public route is dropped, not rewritten.
  const withPrivateRef = buildAgentPassport({
    ...INPUT,
    claims: [
      {
        ...INPUT.claims[0],
        evidence: [
          {
            id: "private-evidence",
            kind: "artifact",
            href: { en: "/internal/notes", vi: "/internal/notes" },
            label: { en: "Internal", vi: "Nội bộ" },
          },
        ],
      },
    ],
  });
  assert.deepEqual(withPrivateRef.products[1]?.claims[0]?.evidence, []);
  assert.ok(!serializeAgentPassport(withPrivateRef).includes("/internal/"));
  assert.ok(!serialized.includes("http://"));
});

test("nothing internal, secret or private can reach the document", () => {
  const serialized = serializeAgentPassport(buildAgentPassport(INPUT));

  const FORBIDDEN = [
    /src\//,
    /\.github\//,
    /tests?\//,
    /docs\//,
    /quality-gates/i,
    /browser-assurance/i,
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    /ghp_[A-Za-z0-9]{10,}/,
    /sk-[A-Za-z0-9]{10,}/,
    /\b[a-f0-9]{40}\b/,
  ];
  for (const pattern of FORBIDDEN) {
    assert.doesNotMatch(
      serialized,
      pattern,
      `the machine document must not leak ${pattern}`,
    );
  }
});

test("assurance vocabulary is rejected by the same model as the copy scanner", () => {
  const serialized = serializeAgentPassport(buildAgentPassport(INPUT));
  const TERMS = [
    ...NEVER_IMPLIED_BY_ANY_STATE.filter((key) => key !== "does-not-exist").map(
      (key) => key.replace(/-/g, "[ -]?"),
    ),
    "trust[ -]?score",
    "risk[ -]?score",
  ];
  for (const term of TERMS) {
    assert.doesNotMatch(
      serialized,
      new RegExp(`\\b(${term})\\b`, "i"),
      `the machine document must not claim "${term}"`,
    );
  }
});

test("machine passport drops private-reporting references", () => {
  const advisory =
    "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";
  const input = {
    ...INPUT,
    claims: [
      {
        ...INPUT.claims[0],
        evidence: [
          ...INPUT.claims[0].evidence,
          {
            id: "private-reporting-reference",
            kind: "private-reporting",
            href: { en: advisory, vi: advisory },
            label: { en: "Private report", vi: "Báo cáo riêng tư" },
          },
        ],
      },
    ],
  };
  const document = buildAgentPassport(input);
  const fixture = document.products.find(
    (item) => item.slug === "fixture-product",
  );
  assert.deepEqual(
    fixture?.claims[0]?.evidence.map((item) => item.id),
    ["fixture-evidence"],
  );
  const serialized = serializeAgentPassport(document);
  assert.ok(!serialized.includes("private-reporting-reference"));
  assert.ok(!serialized.includes(advisory));
});
