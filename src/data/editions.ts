import type { EditionRecord } from "../lib/editions.ts";

/**
 * C4-B G6 — Authored collected editions.
 *
 * Each edition curates items that are ALREADY public on this site. Nothing here
 * creates a product, claim, evidence or release statement: the ids below must
 * keep resolving in the canonical indexes, and `resolveEdition` drops any that
 * stop resolving rather than publishing a stale promise.
 */

export const EDITIONS: readonly EditionRecord[] = [
  {
    id: "trust-foundations",
    title: {
      en: "Trust Foundations",
      vi: "Nền tảng tin cậy",
      zh: "信任基石",
    },
    deck: {
      en: "Three public statements about how this site handles security reporting, tracking, and product proof — each one linked to the evidence already published behind it.",
      vi: "Ba tuyên bố công khai về cách site này xử lý báo cáo an ninh, theo dõi và bằng chứng sản phẩm — mỗi tuyên bố đều dẫn tới bằng chứng đã công bố.",
      zh: "关于本站如何处理安全报告、追踪与产品证明的三项公开陈述 — 每项都链接到已发布的证据。",
    },
    sources: [
      { kind: "claim", id: "security-reporting-is-private" },
      { kind: "claim", id: "privacy-no-tracking-on-this-site" },
      { kind: "claim", id: "registry-publishes-only-proven-products" },
    ],
    note: {
      en: "Collected from statements already published on this site. This edition adds no new claim of its own.",
      vi: "Tuyển từ các tuyên bố đã công bố trên site. Tuyển tập này không thêm tuyên bố mới.",
      zh: "选自本站已发布的陈述。本选集不新增任何声明。",
    },
    published: "2026-09-23",
  },
];

/** Look up one authored edition by id. */
export function getEdition(id: string): EditionRecord | undefined {
  return EDITIONS.find((edition) => edition.id === id);
}
