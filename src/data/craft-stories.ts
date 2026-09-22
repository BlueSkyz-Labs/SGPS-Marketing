import type { CraftStoryDraft } from "../lib/craft-stories.ts";

/**
 * C4-B G9 — Authored craft stories.
 *
 * A story exists only where this repository already holds the truth it narrates.
 * Each one names the canonical evidence that backs it and states its own limits
 * out loud; `validateCraftStory` refuses anything that invents an outcome, hides
 * a limitation, cites only itself, or implies assurance we do not hold.
 */

export const CRAFT_STORIES: readonly CraftStoryDraft[] = [
  {
    id: "private-security-reporting",
    sections: {
      problem: {
        en: "A public issue tracker is the wrong place for a vulnerability: it publishes the reporter and the defect before anyone can look at either.",
        vi: "Trình theo dõi issue công khai là chỗ sai cho một lỗ hổng: nó công bố cả người báo lẫn khiếm khuyết trước khi ai kịp xem.",
        zh: "公开的问题跟踪器并不适合处理漏洞：它会在任何人查看之前就公布报告者与缺陷。",
      },
      designChoice: {
        en: "The security route states where private reporting goes and where its boundary is, and that statement is bound to a published evidence id rather than to a promise.",
        vi: "Trang Bảo mật nêu rõ báo cáo riêng đi đâu và ranh giới ở đâu, và tuyên bố đó gắn với một evidence id đã công bố thay vì một lời hứa.",
        zh: "安全页面说明私密报告的去向与其边界，且该陈述绑定到已发布的 evidence id，而不是一句承诺。",
      },
      constraint: {
        en: "This site is static-first: it holds no intake service of its own, so the reporting path has to leave the site and say so plainly.",
        vi: "Site này tĩnh trước: nó không có dịch vụ tiếp nhận riêng, nên đường báo cáo phải rời khỏi site và nói rõ điều đó.",
        zh: "本站以静态为先：自身没有接收服务，因此报告路径必须离开本站，并明确说明这一点。",
      },
      implementation: {
        en: "The published claim is bound to the private-reporting advisory destination and to the security route itself, so a reader can follow both and check the statement.",
        vi: "Tuyên bố đã công bố được gắn với đích báo cáo riêng và với chính trang Bảo mật, để người đọc theo được cả hai và tự kiểm chứng.",
        zh: "已发布的陈述绑定到私密报告的目标地址与安全页面本身，读者可以循两者核对。",
      },
      limitations: {
        en: "No bug bounty, no response time commitment and no certification are claimed. This site does not itself receive reports — it states the private channel and its boundary.",
        vi: "Không có bug bounty, không cam kết thời gian phản hồi và không có chứng nhận nào được tuyên bố. Site này không tự tiếp nhận báo cáo — nó nêu kênh riêng và ranh giới của kênh đó.",
        zh: "不声称漏洞赏金、响应时限或任何认证。本站自身不接收报告——它只说明私密渠道及其边界。",
      },
    },
    evidenceRefs: ["ev-security-advisory", "ev-security-route"],
  },
];

/** Look up one authored story by id. */
export function getCraftStory(id: string): CraftStoryDraft | undefined {
  return CRAFT_STORIES.find((story) => story.id === id);
}
