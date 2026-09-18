import type { LocalizedText } from "../data/integrity.ts";
export type TrustState = "available" | "not-published";

export interface TrustLedgerEntry {
  id: "privacy" | "security" | "support";
  state: TrustState;
  href: LocalizedText;
  label: LocalizedText;
  summary: LocalizedText;
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
    href: { en: "/en/privacy/", vi: "/vi/privacy/", zh: "/zh/privacy/" },
    label: { en: "Privacy", vi: "Quyền riêng tư", zh: "隐私" },
    summary: {
      en: "What is collected on this corporate site, how it is handled, and how to ask questions about it.",
      vi: "Cách dữ liệu trang doanh nghiệp này được xử lý và cách đặt câu hỏi về dữ liệu.",
      zh: "关于本站点如何收集与处理数据，以及如何咨询相关信息。",
    },
    evidenceKind: "route",
  },
  {
    id: "security",
    state: "available",
    href: { en: "/en/security/", vi: "/vi/security/", zh: "/zh/security/" },
    label: { en: "Security", vi: "Bảo mật", zh: "安全" },
    summary: {
      en: "A private vulnerability reporting channel via GitHub Security Advisories — no public issues for security reports.",
      vi: "Kênh báo cáo lỗ hổng riêng tư qua GitHub Security Advisories — không mở issue công khai cho báo cáo bảo mật.",
      zh: "通过 GitHub Security Advisories 提供的私密漏洞报告渠道 — 安全报告不公开开 issue。",
    },
    evidenceKind: "private-reporting",
  },
  {
    id: "support",
    state: "available",
    href: { en: "/en/support/", vi: "/vi/support/", zh: "/zh/support/" },
    label: { en: "Support", vi: "Hỗ trợ", zh: "支持" },
    summary: {
      en: "Working help and recourse paths — real routes, not slogans.",
      vi: "Đường dẫn trợ giúp và khắc phục đang hoạt động — tuyến đường thật, không phải khẩu hiệu.",
      zh: "提供有效的帮助与求助途径 — 真实渠道，而非口号。",
    },
    evidenceKind: "route",
  },
];
