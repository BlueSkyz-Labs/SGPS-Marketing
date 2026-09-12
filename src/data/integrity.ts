/**
 * Truth-safe integrity contract (S+ v2 Task 0.4).
 *
 * Fail-closed by design: no speculative public entries exist until real,
 * reviewable evidence is published. This module intentionally contains no
 * scoring, no blanket verification, and no runtime-generated dates.
 */

export type TruthState =
  "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface EvidenceReference {
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

/** Fail-closed: empty until real, reviewable public evidence exists. */
export const INTEGRITY_ENTRIES =
  [] as const satisfies readonly IntegrityEntry[];

/**
 * Authored, source-backed boundary statements (v3 S+3).
 * Each one is concrete: the claim mirrors what the page actually does, and
 * the "does not establish" half names a real, tempting over-reading.
 */
export const SECURITY_BOUNDARY: BoundaryStatement = {
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
  claim: {
    en: "This site sets no cookies, uses no client storage, and performs no tracking or profiling.",
    vi: "Trang này không đặt cookie, không dùng lưu trữ phía trình duyệt, và không theo dõi hay lập hồ sơ.",
  },
  doesNotImply: {
    en: "It does not establish that no data at all is processed: serving any website still requires infrastructure to handle network-level metadata such as IP addresses and request headers.",
    vi: "Nó không xác lập rằng không có dữ liệu nào được xử lý: mọi website vẫn cần hạ tầng xử lý siêu dữ liệu mạng như địa chỉ IP và header yêu cầu.",
  },
};
