/**
 * Claim-to-Evidence Fabric — public claim definitions (v3 G1).
 *
 * Claims reference evidence and boundaries by stable ids; they never carry
 * hrefs or route strings (no second route registry) and never duplicate
 * evidence content. Renderers resolve everything through src/lib/claims.ts.
 */

import {
  INTEGRITY_ENTRIES,
  type BoundaryStatement,
  type EvidenceReference,
} from "./integrity.ts";

export type ClaimKind =
  "brand" | "principle" | "trust" | "product" | "policy" | "support";

export interface LocalizedStatement {
  en: string;
  vi: string;
}

export interface PublicClaim {
  id: string;
  kind: ClaimKind;
  surface: string;
  statement: LocalizedStatement;
  evidenceIds: string[];
  boundaryId?: string | undefined;
  reviewId?: string | undefined;
}

/** Stable index of public evidence references already declared in integrity data. */
export const EVIDENCE_INDEX: ReadonlyMap<string, EvidenceReference> = new Map(
  INTEGRITY_ENTRIES.flatMap((entry) => entry.evidence).map((ref) => [
    ref.id,
    ref,
  ]),
);

/** Stable index of public boundaries declared in integrity data. */
export const BOUNDARY_INDEX: ReadonlyMap<string, BoundaryStatement> = new Map(
  INTEGRITY_ENTRIES.flatMap((entry) =>
    entry.boundary ? [[entry.boundary.id, entry.boundary] as const] : [],
  ),
);

/** Integrity entries by id — used to validate optional review references. */
export const INTEGRITY_ENTRY_INDEX = new Map(
  INTEGRITY_ENTRIES.map((entry) => [entry.id, entry] as const),
);

/**
 * Seed claims. Each one points only at evidence/boundaries that already
 * exist in public integrity data; none of them adds a new public promise.
 */
export const CLAIMS: readonly PublicClaim[] = [
  {
    id: "security-reporting-is-private",
    kind: "trust",
    surface: "security",
    statement: {
      en: "Security reports reach the maintainers through a private GitHub channel, never through a public issue.",
      vi: "Báo cáo bảo mật đến người bảo trì qua kênh GitHub riêng tư, không bao giờ qua issue công khai.",
    },
    evidenceIds: ["ev-security-advisory", "ev-security-route"],
    boundaryId: "bnd-security-reporting",
    reviewId: "security-private-reporting",
  },
  {
    id: "privacy-no-tracking-on-this-site",
    kind: "policy",
    surface: "privacy",
    statement: {
      en: "This site sets no cookies, uses no client storage, and performs no tracking or profiling.",
      vi: "Trang này không đặt cookie, không dùng lưu trữ phía trình duyệt, và không theo dõi hay lập hồ sơ.",
    },
    evidenceIds: ["ev-privacy-route", "ev-security-route"],
    boundaryId: "bnd-privacy-collection",
    reviewId: "privacy-data-practices",
  },
  {
    id: "registry-publishes-only-proven-products",
    kind: "product",
    surface: "products",
    statement: {
      en: "A product appears in the public registry only when its public evidence is ready to verify.",
      vi: "Sản phẩm chỉ xuất hiện trong danh mục công khai khi bằng chứng công khai của nó sẵn sàng để xác minh.",
    },
    evidenceIds: ["ev-products-route"],
  },
];
