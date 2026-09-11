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
