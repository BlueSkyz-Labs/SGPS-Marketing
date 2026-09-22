/**
 * C3-B Task 2 — synthetic Claim Fabric rows for the throwaway parity fixture.
 *
 * The fixture app never ships and is never typechecked by repo gates; these
 * rows exist so capability-bound proof resolution is measurable in e2e while
 * the production registry and claim fabric stay owner-gated and empty.
 *
 * They are deliberately shaped like the canonical contract:
 * - binding lives on the claim (`productBinding.productSlug/capabilityId`);
 * - `private-reporting` evidence must never surface publicly;
 * - one claim belongs to a DIFFERENT product so borrowing is detectable;
 * - one authored capability has no claim at all, so fail-closed is measurable.
 */
export const FIXTURE_PRODUCT_REFS = [
  { slug: "fixture-flagship", name: "Fixture Flagship" },
  { slug: "fixture-secondary", name: "Fixture Secondary" },
  { slug: "fixture-ecosystem", name: "Fixture Ecosystem" },
];

export const FIXTURE_CAPABILITY_WITH_PROOF = "Fixture capability one";
export const FIXTURE_CAPABILITY_WITH_REVIEWED_PROOF = "Fixture capability two";
export const FIXTURE_CAPABILITY_WITHOUT_PROOF = "Fixture capability three";

export const FIXTURE_CLAIMS = [
  {
    claim: {
      id: "fixture-claim-capability-one",
      kind: "product",
      productBinding: {
        productSlug: "fixture-flagship",
        capabilityId: FIXTURE_CAPABILITY_WITH_PROOF,
      },
      statement: {
        en: "Fixture capability one is published with a source-linked route.",
        vi: "Năng lực mẫu một được công bố kèm tuyến dẫn nguồn.",
      },
    },
    evidence: [
      {
        id: "fixture-evidence-route",
        kind: "route",
        href: {
          en: "/en/evidence/fixture-claim-capability-one/",
          vi: "/vi/evidence/fixture-claim-capability-one/",
        },
        label: { en: "Evidence passport", vi: "Hồ sơ bằng chứng" },
      },
      {
        id: "fixture-evidence-artifact",
        kind: "artifact",
        href: {
          en: "/products/fixtures/fixture-flagship.png",
          vi: "/products/fixtures/fixture-flagship.png",
        },
        label: { en: "Fixture artifact", vi: "Tệp bằng chứng mẫu" },
      },
      {
        // Private reporting must be filtered out by the selector.
        id: "fixture-evidence-private",
        kind: "private-reporting",
        href: {
          en: "/internal/fixture-private-report/",
          vi: "/internal/fixture-private-report/",
        },
        label: { en: "Private report", vi: "Báo cáo nội bộ" },
      },
    ],
    boundary: {
      id: "fixture-boundary-one",
      claim: {
        en: "Fixture capability one is source-linked.",
        vi: "Năng lực mẫu một đã gắn nguồn.",
      },
      doesNotImply: {
        en: "Does not imply certification or an endorsement.",
        vi: "Không ngụ ý chứng nhận hay bảo chứng.",
      },
    },
    truthState: "source-linked",
    productSlugs: ["fixture-flagship"],
  },
  {
    claim: {
      id: "fixture-claim-capability-two",
      kind: "product",
      productBinding: {
        productSlug: "fixture-flagship",
        capabilityId: FIXTURE_CAPABILITY_WITH_REVIEWED_PROOF,
      },
      statement: {
        en: "Fixture capability two was reviewed against its artifact.",
        vi: "Năng lực mẫu hai đã được xem xét với tệp bằng chứng.",
      },
    },
    evidence: [
      {
        id: "fixture-evidence-reviewed-artifact",
        kind: "artifact",
        href: {
          en: "/products/fixtures/fixture-flagship.png",
          vi: "/products/fixtures/fixture-flagship.png",
        },
        label: { en: "Reviewed artifact", vi: "Tệp đã xem xét" },
      },
    ],
    truthState: "reviewed",
    productSlugs: ["fixture-flagship"],
  },
  {
    // Belongs to another product: the flagship surface must never borrow it.
    claim: {
      id: "fixture-claim-secondary",
      kind: "product",
      productBinding: {
        productSlug: "fixture-secondary",
        capabilityId: FIXTURE_CAPABILITY_WITH_PROOF,
      },
      statement: {
        en: "Fixture secondary publishes its own proof.",
        vi: "Sản phẩm mẫu phụ công bố bằng chứng riêng.",
      },
    },
    evidence: [
      {
        id: "fixture-evidence-secondary",
        kind: "route",
        href: {
          en: "/en/evidence/fixture-claim-secondary/",
          vi: "/vi/evidence/fixture-claim-secondary/",
        },
        label: { en: "Secondary evidence", vi: "Bằng chứng sản phẩm phụ" },
      },
    ],
    truthState: "source-linked",
    productSlugs: ["fixture-secondary"],
  },
];
