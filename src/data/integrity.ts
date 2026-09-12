/**
 * Truth-safe integrity contract (S+ v2 Task 0.4, populated by v3 S+5).
 *
 * Fail-closed by design: entries reference only facts that are already
 * public on the routes below. This module intentionally contains no scoring,
 * no blanket verification, and no runtime-generated dates.
 */

import { SECURITY_ADVISORY_URL } from "./site.ts";

export type TruthState =
  "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface EvidenceReference {
  /** Stable public evidence id referenced by the claim fabric. */
  id: string;
  kind: "route" | "artifact" | "private-reporting";
  href: { en: string; vi: string };
  label: LocalizedText;
}

export interface ReviewMetadata {
  /** Authored ISO date (YYYY-MM-DD). Never generated at runtime. */
  reviewedOn: string;
  source: "content-review" | "evidence-update";
}

export interface BoundaryStatement {
  /** Stable public boundary id referenced by the claim fabric. */
  id: string;
  claim: LocalizedText;
  doesNotImply: LocalizedText;
}

export interface IntegrityEntry {
  id: string;
  surface: string;
  state: TruthState;
  summary: LocalizedText;
  evidence: EvidenceReference[];
  review?: ReviewMetadata;
  boundary?: BoundaryStatement;
}

/**
 * Authored, source-backed boundary statements (v3 S+3).
 * Each one is concrete: the claim mirrors what the page actually does, and
 * the "does not establish" half names a real, tempting over-reading.
 */
export const SECURITY_BOUNDARY: BoundaryStatement = {
  id: "bnd-security-reporting",
  claim: {
    en: "Private vulnerability reporting is available through GitHub security advisories, visible only to maintainers.",
    vi: "Kênh báo cáo lỗ hổng riêng tư khả dụng qua GitHub security advisories, chỉ người bảo trì nhìn thấy.",
  },
  doesNotImply: {
    en: "It does not establish a bug-bounty program, a response-time SLA, or a right to public disclosure.",
    vi: "Nó không xác lập chương trình bug-bounty, cam kết thời gian phản hồi, hay quyền công bố công khai.",
  },
};

export const PRIVACY_BOUNDARY: BoundaryStatement = {
  id: "bnd-privacy-collection",
  claim: {
    en: "This site sets no cookies, uses no client storage, and performs no tracking or profiling.",
    vi: "Trang này không đặt cookie, không dùng lưu trữ phía trình duyệt, và không theo dõi hay lập hồ sơ.",
  },
  doesNotImply: {
    en: "It does not establish that no data at all is processed: serving any website still requires infrastructure to handle network-level metadata such as IP addresses and request headers.",
    vi: "Nó không xác lập rằng không có dữ liệu nào được xử lý: mọi website vẫn cần hạ tầng xử lý siêu dữ liệu mạng như địa chỉ IP và header yêu cầu.",
  },
};

/**
 * Public integrity entries (v3 S+5). Every entry references facts already
 * public on the routes below — nothing internal, nothing speculative.
 */
export const INTEGRITY_ENTRIES: readonly IntegrityEntry[] = [
  {
    id: "security-private-reporting",
    surface: "security",
    state: "source-linked",
    summary: {
      en: "Vulnerability reports reach the maintainers through GitHub private advisories, and the security route publishes no unproven badges.",
      vi: "Báo cáo lỗ hổng đến người bảo trì qua GitHub private advisories, và trang bảo mật không công bố huy hiệu nào khi chưa chứng minh.",
    },
    evidence: [
      {
        id: "ev-security-advisory",
        kind: "private-reporting",
        href: { en: SECURITY_ADVISORY_URL, vi: SECURITY_ADVISORY_URL },
        label: {
          en: "GitHub private vulnerability reporting",
          vi: "Báo cáo lỗ hổng riêng tư trên GitHub",
        },
      },
      {
        id: "ev-security-route",
        kind: "route",
        href: { en: "/en/security/", vi: "/vi/security/" },
        label: { en: "Security route", vi: "Trang Bảo mật" },
      },
    ],
    review: { reviewedOn: "2026-09-12", source: "content-review" },
    boundary: SECURITY_BOUNDARY,
  },
  {
    id: "privacy-data-practices",
    surface: "privacy",
    state: "source-linked",
    summary: {
      en: "The privacy route states exactly what is and is not collected, and no analytics transmission is enabled.",
      vi: "Trang quyền riêng tư nêu rõ điều gì được và không được thu thập, và không có truyền dữ liệu phân tích nào được bật.",
    },
    evidence: [
      {
        id: "ev-privacy-route",
        kind: "route",
        href: { en: "/en/privacy/", vi: "/vi/privacy/" },
        label: { en: "Privacy route", vi: "Trang Quyền riêng tư" },
      },
      {
        id: "ev-security-route",
        kind: "route",
        href: { en: "/en/security/", vi: "/vi/security/" },
        label: { en: "Security reporting route", vi: "Trang báo cáo bảo mật" },
      },
    ],
    boundary: PRIVACY_BOUNDARY,
  },
  {
    id: "products-publication",
    surface: "products",
    state: "not-published",
    summary: {
      en: "The public registry stays quiet by design: listings appear only when a product's evidence is ready to verify.",
      vi: "Danh mục công khai giữ im lặng có chủ đích: mục chỉ xuất hiện khi bằng chứng của sản phẩm sẵn sàng để xác minh.",
    },
    evidence: [
      {
        id: "ev-products-route",
        kind: "route",
        href: { en: "/en/products/", vi: "/vi/products/" },
        label: { en: "Products route", vi: "Trang Sản phẩm" },
      },
      {
        id: "ev-public-manifest",
        kind: "artifact",
        href: {
          en: "/.well-known/sgps.json",
          vi: "/.well-known/sgps.json",
        },
        label: {
          en: "Public SGPS manifest",
          vi: "Bản kê SGPS công khai",
        },
      },
    ],
  },
];

/** Authored EN/VI pairs for the selective bilingual mirror (v3 S+8). */
export interface MirrorPair {
  id: string;
  en: string;
  vi: string;
}

export const MIRROR_PAIRS: readonly MirrorPair[] = [
  {
    id: "security-reporting",
    en: "Private vulnerability reporting is available through GitHub security advisories, visible only to maintainers.",
    vi: "Kênh báo cáo lỗ hổng riêng tư khả dụng qua GitHub security advisories, chỉ người bảo trì nhìn thấy.",
  },
  {
    id: "security-limits",
    en: "Reporting does not establish a bug-bounty program, a response-time SLA, or a right to public disclosure.",
    vi: "Việc báo cáo không xác lập chương trình bug-bounty, cam kết thời gian phản hồi, hay quyền công bố công khai.",
  },
];
