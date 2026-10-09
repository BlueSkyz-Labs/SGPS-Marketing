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
  zh: string;
  "zh-hant": string;
}

export interface ProductClaimBinding {
  /** Public product slug this claim is explicitly about. */
  productSlug: string;
  /** Stable authored capability identifier; never inferred from display copy. */
  capabilityId: string;
}

/**
 * Short label for a claim. EN/VI are authored; zh/zh-hant, when present, are
 * an exact leading cut of the full statement (never new prose).
 */
export interface ClaimTitleLabel {
  en: string;
  vi: string;
  zh?: string | undefined;
  "zh-hant"?: string | undefined;
}

export interface PublicClaim {
  id: string;
  kind: ClaimKind;
  surface: string;
  statement: LocalizedStatement;
  /**
   * Short label used only for the EN/VI evidence page <title> (SEO length).
   * Derived from, and never a replacement for, the full `statement`.
   */
  titleLabel?: ClaimTitleLabel | undefined;
  evidenceIds: string[];
  boundaryId?: string | undefined;
  reviewId?: string | undefined;
  /**
   * Optional capability-level binding for product claims.
   * Generic product-publication claims deliberately omit this field and must
   * never be borrowed as proof for an individual capability.
   */
  productBinding?: ProductClaimBinding | undefined;
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
      zh: "安全报告通过 GitHub 私有渠道送达维护者，绝不会通过公开 issue 提出。",
      "zh-hant":
        "安全報告透過 GitHub 私有管道送達維護者，絕不會透過公開 issue 提出。",
    },
    titleLabel: {
      en: "Security reports go through a private GitHub channel",
      vi: "Báo cáo bảo mật qua kênh GitHub riêng tư",
      zh: "安全报告通过 GitHub 私有渠道送达维护者",
      "zh-hant": "安全報告透過 GitHub 私有管道送達維護者",
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
      en: "This site sets no cookies. It stores explicitly selected language and theme preferences in this browser, without tracking or profiling.",
      vi: "Trang web này không đặt cookie. Trang web chỉ lưu lựa chọn ngôn ngữ và giao diện do khách truy cập chủ động chọn trong trình duyệt, không theo dõi hay lập hồ sơ.",
      zh: "本站不设置 Cookie；仅在访客明确选择语言或主题时于浏览器本地保存偏好，不进行跟踪或行为画像。",
      "zh-hant":
        "本站不設定 Cookie；僅在訪客明確選擇語言或主題時於瀏覽器本地儲存偏好，不進行追蹤或行為剖析。",
    },
    titleLabel: {
      en: "No cookies; only chosen language and theme are stored",
      vi: "Không đặt cookie; chỉ lưu ngôn ngữ và giao diện đã chọn",
      zh: "本站不设置 Cookie",
      "zh-hant": "本站不設定 Cookie",
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
      zh: "产品仅在其公开证据可核验时才会出现在公开登记表中。",
      "zh-hant": "產品僅在其公開證據可核驗時才會出現在公開登錄名單中。",
    },
    titleLabel: {
      en: "Registry lists only products with verifiable evidence",
      vi: "Danh mục chỉ công bố sản phẩm có bằng chứng xác minh được",
      zh: "产品仅在其公开证据可核验时才会出现在公开登记表中",
      "zh-hant": "產品僅在其公開證據可核驗時才會出現在公開登錄名單中",
    },
    evidenceIds: ["ev-products-route"],
  },
];

/**
 * The short label a page uses to refer back to a claim whose full statement it
 * already shows once. Falls back to the full statement when no short form
 * exists for the locale, so a reference can never become blank or invented.
 */
export function claimShortLabel(
  claim: Pick<PublicClaim, "statement" | "titleLabel">,
  lang: keyof LocalizedStatement,
): string {
  return claim.titleLabel?.[lang] ?? claim.statement[lang];
}
