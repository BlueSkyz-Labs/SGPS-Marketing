import { BRAND_PRINCIPLES } from "@/data/site";

export type Language = "en" | "vi";

export interface ExperienceStage {
  /** Existing heading id on the homepage that the stage anchors to. */
  id: string;
  label: Record<Language, string>;
}

/**
 * S+ Elevation Spine — narrative stages of the homepage story in document
 * order. Anchors must stay bound to real section heading ids; no shims.
 */
export const EXPERIENCE_STAGES: ExperienceStage[] = [
  { id: "hero-title", label: { en: "Intelligence.", vi: "Trí tuệ." } },
  { id: "house-title", label: { en: "Elevation.", vi: "Nâng tầm." } },
  { id: "trust-title", label: { en: "Trust.", vi: "Tin cậy." } },
  { id: "about-title", label: { en: "Impact.", vi: "Tác động." } },
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

export const PRINCIPLE_DIMENSION_LABELS: Record<
  DimensionKey,
  Record<Language, string>
> = {
  product: { en: "In the product", vi: "Trong sản phẩm" },
  people: { en: "For people", vi: "Cho con người" },
  evidence: { en: "Evidence", vi: "Bằng chứng" },
  impact: { en: "Real-world impact", vi: "Tác động thực tế" },
};

export interface PrincipleMatrixEntry {
  id: string;
  name: Record<Language, string>;
  summary: Record<Language, string>;
  dimensions: Record<DimensionKey, Record<Language, string>>;
}

const VI_PRINCIPLE_NAMES: Record<string, string> = {
  Intelligence: "Trí tuệ",
  Elevation: "Nâng tầm",
  Trust: "Tin cậy",
  Impact: "Tác động",
};

const VI_PRINCIPLE_SUMMARIES: Record<string, string> = {
  Intelligence: "Suy nghĩ sâu sắc. Giải pháp thông minh.",
  Elevation: "Góc nhìn tốt hơn. Tác động lớn hơn.",
  Trust: "Tuyên bố mở. Bằng chứng kiểm chứng được.",
  Impact: "Giá trị thực. Thay đổi thực.",
};

const PRINCIPLE_DIMENSIONS: Record<
  string,
  Record<DimensionKey, Record<Language, string>>
> = {
  Intelligence: {
    product: {
      en: "Applied as deliberate engineering decisions — documented and reviewable.",
      vi: "Thể hiện qua các quyết định kỹ thuật có chủ đích — được ghi lại và có thể soát xét.",
    },
    people: {
      en: "Less guesswork for the people using and maintaining what we build.",
      vi: "Ít phỏng đoán hơn cho người dùng và người vận hành sản phẩm.",
    },
    evidence: {
      en: "Evidence lives in tests, reviews, and versioned decisions — not slogans.",
      vi: "Bằng chứng nằm ở kiểm thử, soát xét và các quyết định được phiên bản hóa — không phải khẩu hiệu.",
    },
    impact: {
      en: "Compounds over time: small correct choices are cheaper to live with.",
      vi: "Tích lũy theo thời gian: những lựa chọn đúng nhỏ giúp vận hành bền vững hơn.",
    },
  },
  Elevation: {
    product: {
      en: "Built for the long view — fewer rushed trade-offs, more durable structure.",
      vi: "Xây dựng theo tầm nhìn dài hạn — ít đánh đổi vội vàng, cấu trúc bền vững hơn.",
    },
    people: {
      en: "Raises the ceiling for the team and for the person at the screen.",
      vi: "Nâng cao năng lực cho đội ngũ và người dùng.",
    },
    evidence: {
      en: "Reviewed against references and standards before shipping.",
      vi: "Đối chiếu với các tham chiếu và tiêu chuẩn trước khi phát hành.",
    },
    impact: {
      en: "Better perspective produces decisions that age well.",
      vi: "Góc nhìn tốt hơn tạo ra những quyết định bền vững theo thời gian.",
    },
  },
  Trust: {
    product: {
      en: "Security and privacy treated as first-class routes, not afterthoughts.",
      vi: "Bảo mật và quyền riêng tư là ưu tiên hàng đầu — không phải phần thêm vào.",
    },
    people: {
      en: "Working recourse paths when something goes wrong.",
      vi: "Các đường dẫn khắc phục thực sự khi có vấn đề.",
    },
    evidence: {
      en: "Reportable channels and public routes you can check today.",
      vi: "Kênh báo cáo và các đường dẫn công khai có thể kiểm tra ngay hôm nay.",
    },
    impact: {
      en: "Trust compounds through consistency, not promises.",
      vi: "Tin cậy tích lũy qua sự nhất quán, không phải lời hứa.",
    },
  },
  Impact: {
    product: {
      en: "Focused scope: solve the real problem, skip the theater.",
      vi: "Phạm vi tập trung: giải quyết vấn đề thật, bỏ qua hình thức.",
    },
    people: {
      en: "Designed so the people it serves spend less effort, not more.",
      vi: "Thiết kế để người sử dụng tốn ít công sức hơn, không phải nhiều hơn.",
    },
    evidence: {
      en: "Changes are validated against acceptance criteria before release.",
      vi: "Thay đổi được xác nhận theo tiêu chí chấp nhận trước khi phát hành.",
    },
    impact: {
      en: "Value shows up in durable outcomes, not launch-day noise.",
      vi: "Giá trị nằm ở kết quả bền vững, không phải ồn ào ngày ra mắt.",
    },
  },
};

function getDimensions(
  name: string,
): Record<DimensionKey, Record<Language, string>> {
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
    },
    summary: {
      en: principle.summary,
      vi: VI_PRINCIPLE_SUMMARIES[principle.name] ?? principle.summary,
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

export type MissionId =
  "evaluate-product" | "understand-blueskyz" | "verify-trust" | "work-with-us";

export interface MissionStep {
  /** Language-less canonical route from the live registry. */
  path: string;
  label: Record<Language, string>;
  /** Public evidence surfaces a visitor can independently check. */
  evidenceFirst?: boolean;
}

export interface Mission {
  id: MissionId;
  label: Record<Language, string>;
  steps: MissionStep[];
}

export const MISSIONS: Mission[] = [
  {
    id: "evaluate-product",
    label: { en: "Evaluate a product", vi: "Đánh giá sản phẩm" },
    steps: [
      {
        path: "/decision-room/",
        label: { en: "Decision Room", vi: "Phòng Quyết định" },
        evidenceFirst: true,
      },
      {
        path: "/products/",
        label: {
          en: "Check product status",
          vi: "Kiểm tra trạng thái sản phẩm",
        },
        evidenceFirst: true,
      },
      {
        path: "/about/",
        label: { en: "About BlueSkyz", vi: "Về BlueSkyz" },
      },
      { path: "/contact/", label: { en: "Contact", vi: "Liên hệ" } },
    ],
  },
  {
    id: "understand-blueskyz",
    label: { en: "Understand BlueSkyz", vi: "Tìm hiểu BlueSkyz" },
    steps: [
      { path: "/about/", label: { en: "About BlueSkyz", vi: "Về BlueSkyz" } },
      {
        path: "/products/",
        label: {
          en: "Check product status",
          vi: "Kiểm tra trạng thái sản phẩm",
        },
      },
      { path: "/support/", label: { en: "Support", vi: "Hỗ trợ" } },
      { path: "/contact/", label: { en: "Contact", vi: "Liên hệ" } },
    ],
  },
  {
    id: "verify-trust",
    label: { en: "Verify trust", vi: "Kiểm chứng tin cậy" },
    steps: [
      {
        path: "/security/",
        label: { en: "Security", vi: "Bảo mật" },
        evidenceFirst: true,
      },
      {
        path: "/privacy/",
        label: { en: "Privacy", vi: "Quyền riêng tư" },
        evidenceFirst: true,
      },
      {
        path: "/decision-room/",
        label: { en: "Decision Room", vi: "Phòng Quyết định" },
        evidenceFirst: true,
      },
      { path: "/support/", label: { en: "Support", vi: "Hỗ trợ" } },
    ],
  },
  {
    id: "work-with-us",
    label: { en: "Work with us", vi: "Làm việc cùng chúng tôi" },
    steps: [
      { path: "/contact/", label: { en: "Contact", vi: "Liên hệ" } },
      { path: "/support/", label: { en: "Support", vi: "Hỗ trợ" } },
      { path: "/about/", label: { en: "About BlueSkyz", vi: "Về BlueSkyz" } },
      {
        path: "/security/",
        label: { en: "Security", vi: "Bảo mật" },
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
