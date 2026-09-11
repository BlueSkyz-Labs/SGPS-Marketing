export type TrustState = "available" | "not-published";

export interface TrustLedgerEntry {
  id: "privacy" | "security" | "support";
  state: TrustState;
  href: { en: string; vi: string };
  label: { en: string; vi: string };
  summary: { en: string; vi: string };
  evidenceKind: "route" | "private-reporting";
}

/**
 * S+ Verifiable Trust Ledger (Task 4).
 * Every entry must be derivable from facts already encoded by this site.
 * A missing fact is `not-published` — never a guessed assurance status.
 */
export const TRUST_LEDGER: TrustLedgerEntry[] = [
  {
    id: "privacy",
    state: "available",
    href: { en: "/en/privacy/", vi: "/vi/privacy/" },
    label: { en: "Privacy", vi: "Quyền riêng tư" },
    summary: {
      en: "What is collected on this corporate site, how it is handled, and how to ask questions about it.",
      vi: "Cách dữ liệu trang doanh nghiệp này được xử lý và cách đặt câu hỏi về dữ liệu.",
    },
    evidenceKind: "route",
  },
  {
    id: "security",
    state: "available",
    href: { en: "/en/security/", vi: "/vi/security/" },
    label: { en: "Security", vi: "Bảo mật" },
    summary: {
      en: "A private vulnerability reporting channel via GitHub Security Advisories — no public issues for security reports.",
      vi: "Kênh báo cáo lỗ hổng riêng tư qua GitHub Security Advisories — không mở issue công khai cho báo cáo bảo mật.",
    },
    evidenceKind: "private-reporting",
  },
  {
    id: "support",
    state: "available",
    href: { en: "/en/support/", vi: "/vi/support/" },
    label: { en: "Support", vi: "Hỗ trợ" },
    summary: {
      en: "Working help and recourse paths — real routes, not slogans.",
      vi: "Đường dẫn trợ giúp và khắc phục đang hoạt động — tuyến đường thật, không phải khẩu hiệu.",
    },
    evidenceKind: "route",
  },
];
