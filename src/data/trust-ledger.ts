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
 *
 * Support is `not-published` while `SITE.contactEmail` is absent: the /support
 * page says no general support mailbox is published, so the ledger must not
 * call the lane "available". Its summary reuses that page's own wording. This
 * is the build-default truth; a build that publishes a mailbox is described by
 * the /support page itself, and the ledger only ever understates.
 */
export const TRUST_LEDGER: TrustLedgerEntry[] = [
  {
    id: "privacy",
    state: "available",
    href: {
      en: "/en/privacy/",
      vi: "/vi/privacy/",
      zh: "/zh/privacy/",
      "zh-hant": "/zh-hant/privacy/",
    },
    label: {
      en: "Privacy",
      vi: "Quyền riêng tư",
      zh: "隐私",
      "zh-hant": "隱私",
    },
    summary: {
      en: "What this site collects and does not collect.",
      vi: "Trang này thu thập gì và không thu thập gì.",
      zh: "本站收集什么、不收集什么。",
      "zh-hant": "本站蒐集什麼、不蒐集什麼。",
    },
    evidenceKind: "route",
  },
  {
    id: "security",
    state: "available",
    href: {
      en: "/en/security/",
      vi: "/vi/security/",
      zh: "/zh/security/",
      "zh-hant": "/zh-hant/security/",
    },
    label: { en: "Security", vi: "Bảo mật", zh: "安全", "zh-hant": "安全" },
    summary: {
      en: "How to report a vulnerability privately.",
      vi: "Cách báo cáo lỗ hổng riêng tư.",
      zh: "如何私下报告漏洞。",
      "zh-hant": "如何私下通報漏洞。",
    },
    evidenceKind: "private-reporting",
  },
  {
    id: "support",
    state: "not-published",
    href: {
      en: "/en/support/",
      vi: "/vi/support/",
      zh: "/zh/support/",
      "zh-hant": "/zh-hant/support/",
    },
    label: { en: "Support", vi: "Hỗ trợ", zh: "支持", "zh-hant": "支援" },
    summary: {
      en: "No general support mailbox has been published yet. Security reporting is for vulnerabilities only.",
      vi: "Hiện chưa có hộp thư hỗ trợ chung. Kênh báo cáo bảo mật chỉ dành cho lỗ hổng bảo mật.",
      zh: "目前尚未公布通用支持邮箱。安全漏洞报告仅用于漏洞。",
      "zh-hant": "目前尚未公布通用支援信箱。資安通報僅用於漏洞。",
    },
    evidenceKind: "route",
  },
];
