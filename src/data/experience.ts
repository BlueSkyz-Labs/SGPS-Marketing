import { BRAND_PRINCIPLES, type Language as LocaleLanguage } from "@/data/site";

/**
 * Two-locale alias kept for the existing consumers of this module
 * (`ExperienceSpine`, `OneHouseMatrix`, `Atlas`). The site locale set is owned
 * by `@/lib/i18n` and now ships `en`, `vi` and `zh`; every localized map below
 * is typed with that canonical set so the third locale is authored, never
 * inherited from another locale.
 */
import type { Language as SiteLanguage } from "./site.ts";
import type { ExperienceIntent } from "@/lib/experience-intent";

/** Canonical locale set (en|vi|zh). Maps below are typed with it; Atlas and
 * friends consume this same type so a zh surface compiles. */
export type Language = SiteLanguage;

/** Authored copy for every shipped locale (en / vi / zh). */
type LocalizedText = Record<LocaleLanguage, string>;

export interface ExperienceStage {
  /** Existing heading id on the homepage that the stage anchors to. */
  id: string;
  label: LocalizedText;
}

/**
 * S+ Elevation Spine — narrative stages of the homepage story in document
 * order. Anchors must stay bound to real section heading ids; no shims.
 */
export const EXPERIENCE_STAGES: ExperienceStage[] = [
  {
    id: "hero-title",
    label: { en: "Intelligence.", vi: "Trí tuệ.", zh: "智能。" },
  },
  {
    id: "house-title",
    label: { en: "Elevation.", vi: "Nâng tầm.", zh: "提升。" },
  },
  { id: "trust-title", label: { en: "Trust.", vi: "Tin cậy.", zh: "信任。" } },
  {
    id: "about-title",
    label: { en: "Impact.", vi: "Tác động.", zh: "影响。" },
  },
];

/* ------------------------------------------------------------------ */
/* S+ One House Intelligence Matrix (Task 5).                          */
/* Single source of principle copy: EN base mirrors the v4 brand kit   */
/* (site.ts BRAND_PRINCIPLES); VI + dimension copy live here.          */
/* ------------------------------------------------------------------ */

export type DimensionKey = "product" | "people" | "evidence" | "impact";

export const PRINCIPLE_DIMENSION_KEYS: DimensionKey[] = [
  "product",
  "people",
  "evidence",
  "impact",
];

export const PRINCIPLE_DIMENSION_LABELS: Record<DimensionKey, LocalizedText> = {
  product: { en: "In the product", vi: "Trong sản phẩm", zh: "产品之中" },
  people: { en: "For people", vi: "Cho con người", zh: "以人为本" },
  evidence: { en: "Evidence", vi: "Bằng chứng", zh: "证据" },
  impact: {
    en: "Real-world impact",
    vi: "Tác động thực tế",
    zh: "实际影响",
  },
};

export interface PrincipleMatrixEntry {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
  dimensions: Record<DimensionKey, LocalizedText>;
}

const VI_PRINCIPLE_NAMES: Record<string, string> = {
  Intelligence: "Trí tuệ",
  Elevation: "Nâng tầm",
  Trust: "Tin cậy",
  Impact: "Tác động",
};

const ZH_PRINCIPLE_NAMES: Record<string, string> = {
  Intelligence: "智能",
  Elevation: "提升",
  Trust: "信任",
  Impact: "影响",
};

const VI_PRINCIPLE_SUMMARIES: Record<string, string> = {
  Intelligence: "Suy nghĩ sâu sắc. Giải pháp thông minh.",
  Elevation: "Góc nhìn tốt hơn. Tác động lớn hơn.",
  Trust: "Tuyên bố mở. Bằng chứng kiểm chứng được.",
  Impact: "Giá trị thực. Thay đổi thực.",
};

const ZH_PRINCIPLE_SUMMARIES: Record<string, string> = {
  Intelligence: "深思熟虑。方案智能。",
  Elevation: "视角更高。影响更大。",
  Trust: "声明公开。证据可核验。",
  Impact: "真实价值。真实改变。",
};

const PRINCIPLE_DIMENSIONS: Record<
  string,
  Record<DimensionKey, LocalizedText>
> = {
  Intelligence: {
    product: {
      en: "Applied as deliberate engineering decisions — documented and reviewable.",
      vi: "Thể hiện qua các quyết định kỹ thuật có chủ đích — được ghi lại và có thể soát xét.",
      zh: "以有意识的工程决策落实 — 有记录，可供审阅。",
    },
    people: {
      en: "Less guesswork for the people using and maintaining what we build.",
      vi: "Ít phỏng đoán hơn cho người dùng và người vận hành sản phẩm.",
      zh: "让使用和维护我们所构建产品的人少一些猜测。",
    },
    evidence: {
      en: "Evidence lives in tests, reviews, and versioned decisions — not slogans.",
      vi: "Bằng chứng nằm ở kiểm thử, soát xét và các quyết định được phiên bản hóa — không phải khẩu hiệu.",
      zh: "证据存在于测试、审阅与版本化的决策之中 — 而非口号。",
    },
    impact: {
      en: "Compounds over time: small correct choices are cheaper to live with.",
      vi: "Tích lũy theo thời gian: những lựa chọn đúng nhỏ giúp vận hành bền vững hơn.",
      zh: "随时间累积：细小的正确选择让长期维护成本更低。",
    },
  },
  Elevation: {
    product: {
      en: "Built for the long view — fewer rushed trade-offs, more durable structure.",
      vi: "Xây dựng theo tầm nhìn dài hạn — ít đánh đổi vội vàng, cấu trúc bền vững hơn.",
      zh: "着眼长期构建 — 更少仓促取舍，更持久的结构。",
    },
    people: {
      en: "Raises the ceiling for the team and for the person at the screen.",
      vi: "Nâng cao năng lực cho đội ngũ và người dùng.",
      zh: "为团队与屏幕前的人提升上限。",
    },
    evidence: {
      en: "Reviewed against references and standards before shipping.",
      vi: "Đối chiếu với các tham chiếu và tiêu chuẩn trước khi phát hành.",
      zh: "发布前对照参考资料与标准进行审阅。",
    },
    impact: {
      en: "Better perspective produces decisions that age well.",
      vi: "Góc nhìn tốt hơn tạo ra những quyết định bền vững theo thời gian.",
      zh: "更好的视角带来经得起时间检验的决策。",
    },
  },
  Trust: {
    product: {
      en: "Security and privacy treated as first-class routes, not afterthoughts.",
      vi: "Bảo mật và quyền riêng tư là ưu tiên hàng đầu — không phải phần thêm vào.",
      zh: "将安全与隐私视为核心路径，而非事后补充。",
    },
    people: {
      en: "Working recourse paths when something goes wrong.",
      vi: "Các đường dẫn khắc phục thực sự khi có vấn đề.",
      zh: "出现问题时具备可用的补救路径。",
    },
    evidence: {
      en: "Reportable channels and public routes you can check today.",
      vi: "Kênh báo cáo và các đường dẫn công khai có thể kiểm tra ngay hôm nay.",
      zh: "今日即可核查的举报渠道与公开路径。",
    },
    impact: {
      en: "Trust compounds through consistency, not promises.",
      vi: "Tin cậy tích lũy qua sự nhất quán, không phải lời hứa.",
      zh: "信任来自一贯的执行，而非承诺。",
    },
  },
  Impact: {
    product: {
      en: "Focused scope: solve the real problem, skip the theater.",
      vi: "Phạm vi tập trung: giải quyết vấn đề thật, bỏ qua hình thức.",
      zh: "范围聚焦：解决真实问题，不做表面文章。",
    },
    people: {
      en: "Designed so the people it serves spend less effort, not more.",
      vi: "Thiết kế để người sử dụng tốn ít công sức hơn, không phải nhiều hơn.",
      zh: "设计上让所服务的人付出更少精力，而非更多。",
    },
    evidence: {
      en: "Changes are validated against acceptance criteria before release.",
      vi: "Thay đổi được xác nhận theo tiêu chí chấp nhận trước khi phát hành.",
      zh: "变更在发布前依据验收标准完成验证。",
    },
    impact: {
      en: "Value shows up in durable outcomes, not launch-day noise.",
      vi: "Giá trị nằm ở kết quả bền vững, không phải ồn ào ngày ra mắt.",
      zh: "价值体现在持久的结果上，而非发布当日的喧嚣。",
    },
  },
};

function getDimensions(name: string): Record<DimensionKey, LocalizedText> {
  const dimensions = PRINCIPLE_DIMENSIONS[name];
  if (!dimensions) {
    throw new Error(
      `S+ matrix is missing dimensions for principle: ${name} — every principle must expose all four dimensions`,
    );
  }
  return dimensions;
}

export const PRINCIPLE_MATRIX: PrincipleMatrixEntry[] = BRAND_PRINCIPLES.map(
  (principle) => ({
    id: principle.name.toLowerCase(),
    name: {
      en: principle.name,
      vi: VI_PRINCIPLE_NAMES[principle.name] ?? principle.name,
      zh: ZH_PRINCIPLE_NAMES[principle.name] ?? principle.name,
    },
    summary: {
      en: principle.summary,
      vi: VI_PRINCIPLE_SUMMARIES[principle.name] ?? principle.summary,
      zh: ZH_PRINCIPLE_SUMMARIES[principle.name] ?? principle.summary,
    },
    dimensions: getDimensions(principle.name),
  }),
);

/* ------------------------------------------------------------------ */
/* v3 G5 — Explicit mission paths (Task 15).                            */
/* Four visitor-chosen missions. Every step points at a live canonical */
/* route; evidence surfaces are flagged. Missions may only reorder or  */
/* emphasize journey steps — they never hide facts, and nothing here   */
/* is ever inferred from identity, history, or tracking.               */
/* ------------------------------------------------------------------ */

export type MissionId = ExperienceIntent;

export interface MissionStep {
  /** Language-less canonical route from the live registry. */
  path: string;
  label: LocalizedText;
  /** Public evidence surfaces a visitor can independently check. */
  evidenceFirst?: boolean;
}

export interface Mission {
  id: MissionId;
  label: LocalizedText;
  steps: MissionStep[];
}

export const MISSIONS: Mission[] = [
  {
    id: "explore-products",
    label: {
      en: "Explore products",
      vi: "Khám phá sản phẩm",
      zh: "探索产品",
    },
    steps: [
      {
        path: "/products/",
        label: { en: "Products", vi: "Sản phẩm", zh: "产品" },
      },
      {
        path: "/architecture/",
        label: { en: "Architecture", vi: "Kiến trúc", zh: "架构" },
      },
      {
        path: "/about/",
        label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
      },
      {
        path: "/contact/",
        label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
      },
    ],
  },
  {
    id: "evaluate-product",
    label: {
      en: "Evaluate a product",
      vi: "Đánh giá sản phẩm",
      zh: "评估产品",
    },
    steps: [
      {
        path: "/decision-room/",
        label: { en: "Decision Room", vi: "Phòng Quyết định", zh: "决策室" },
        evidenceFirst: true,
      },
      {
        path: "/products/",
        label: {
          en: "Check product status",
          vi: "Kiểm tra trạng thái sản phẩm",
          zh: "查看产品状态",
        },
        evidenceFirst: true,
      },
      {
        path: "/about/",
        label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
      },
      {
        path: "/contact/",
        label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
      },
    ],
  },
  {
    id: "understand-architecture",
    label: {
      en: "Understand architecture",
      vi: "Tìm hiểu kiến trúc",
      zh: "了解架构",
    },
    steps: [
      {
        path: "/architecture/",
        label: { en: "Architecture", vi: "Kiến trúc", zh: "架构" },
      },
      {
        path: "/about/",
        label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
      },
      {
        path: "/security/",
        label: { en: "Security", vi: "Bảo mật", zh: "安全" },
      },
      {
        path: "/products/",
        label: { en: "Products", vi: "Sản phẩm", zh: "产品" },
      },
    ],
  },
  {
    id: "verify-trust",
    label: { en: "Verify trust", vi: "Kiểm chứng tin cậy", zh: "核验信任" },
    steps: [
      {
        path: "/security/",
        label: { en: "Security", vi: "Bảo mật", zh: "安全" },
        evidenceFirst: true,
      },
      {
        path: "/privacy/",
        label: { en: "Privacy", vi: "Quyền riêng tư", zh: "隐私" },
        evidenceFirst: true,
      },
      {
        path: "/decision-room/",
        label: { en: "Decision Room", vi: "Phòng Quyết định", zh: "决策室" },
        evidenceFirst: true,
      },
      { path: "/support/", label: { en: "Support", vi: "Hỗ trợ", zh: "支持" } },
    ],
  },
  {
    id: "work-with-us",
    label: {
      en: "Work with us",
      vi: "Làm việc cùng chúng tôi",
      zh: "与我们合作",
    },
    steps: [
      {
        path: "/contact/",
        label: { en: "Contact", vi: "Liên hệ", zh: "联系我们" },
      },
      { path: "/support/", label: { en: "Support", vi: "Hỗ trợ", zh: "支持" } },
      {
        path: "/about/",
        label: { en: "About BlueSkyz", vi: "Về BlueSkyz", zh: "关于 BlueSkyz" },
      },
      {
        path: "/security/",
        label: { en: "Security", vi: "Bảo mật", zh: "安全" },
        evidenceFirst: true,
      },
    ],
  },
];

/** Mission → ordered step keys (consumed by the Journey Bar enhancement). */
export function getMissionOrders(): Record<string, string[]> {
  return Object.fromEntries(
    MISSIONS.map((mission) => [
      mission.id,
      mission.steps.map((step) =>
        step.path.split("/").filter(Boolean).join("/"),
      ),
    ]),
  );
}

/** Mission → step keys that are public evidence surfaces. */
export function getMissionEvidenceKeys(): Record<string, string[]> {
  return Object.fromEntries(
    MISSIONS.filter((mission) =>
      mission.steps.some((step) => step.evidenceFirst),
    ).map((mission) => [
      mission.id,
      mission.steps
        .filter((step) => step.evidenceFirst)
        .map((step) => step.path.split("/").filter(Boolean).join("/")),
    ]),
  );
}
