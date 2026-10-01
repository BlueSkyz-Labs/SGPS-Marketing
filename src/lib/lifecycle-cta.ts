import type { Language, LocalizedLabel } from "../data/site.ts";
import { isProductAppOriginUrl } from "./app-access-url.ts";
import { getProductProfilePath } from "./product-routes.ts";
import type { Availability, Lifecycle } from "./product-schema.ts";
import { isPublicClaimHttpsUrl } from "./product-schema.ts";

/**
 * Plan v5 W3.2 (Council S05) — lifecycle → CTA mapper.
 *
 * The product surfaces never author an action verb of their own. The verb is a
 * presentation-only projection of the record's *recorded* `lifecycle` and
 * `availability`; it creates no product, claim, evidence or release truth and
 * it never strengthens the record's public label.
 *
 * Verb vocabulary is deliberately bounded to three honest next steps:
 *
 *   - `view-development-status` — the record is still concept/prototype/
 *     development; the honest next step is its recorded status, not the app.
 *   - `learn` — every other non-Try case (beta previews, invite-only, winding
 *     down, retired or an unknown lifecycle that fails closed).
 *   - `try` — the record is publicly available *and* its primary action is the
 *     product's own allow-listed HTTPS origin.
 *
 * Fail-closed: `try` requires every one of these, and an unknown lifecycle
 * never inherits it. Sign-in/store destinations are governed separately by
 * `src/lib/app-access-url.ts` and are not touched by this mapper.
 */

export type LifecycleCtaVerb = "learn" | "view-development-status" | "try";

/** The only verbs a public product surface may render, in priority order. */
export const LIFECYCLE_CTA_VERBS: readonly LifecycleCtaVerb[] = [
  "learn",
  "view-development-status",
  "try",
];

/**
 * One labelled source for every CTA verb (plan v5 W3.2), so no component
 * authors the wording inline. VI/ZH strings are faithful translations pending
 * native review (W3.4 `FEEDBACK_CHECKPOINT`).
 */
export const LIFECYCLE_CTA_VERB_LABELS: Record<
  LifecycleCtaVerb,
  LocalizedLabel
> = {
  learn: { en: "Learn", vi: "Tìm hiểu", zh: "了解", "zh-hant": "了解" },
  "view-development-status": {
    en: "See",
    vi: "Xem",
    zh: "查看",
    "zh-hant": "查看",
  },
  try: { en: "Try", vi: "Dùng thử", zh: "试用", "zh-hant": "試用" },
};

/** Lifecycles that are, by definition, not yet public. */
const DEVELOPMENT_LIFECYCLES: ReadonlySet<Lifecycle> = new Set([
  "concept",
  "prototype",
  "development",
]);

/**
 * Lifecycles where a public availability may honestly offer `Try`. Terminal
 * states (sunset/archived) and immature states are excluded, and anything not
 * listed here fails closed.
 */
const TRY_ELIGIBLE_LIFECYCLES: ReadonlySet<Lifecycle> = new Set([
  "beta",
  "active",
  "maintenance",
]);

export interface LifecycleCtaInput {
  slug: string;
  lifecycle: Lifecycle;
  availability: Availability;
  primaryActionHref: string;
  /** Product name for view-development-status CTA label formatting. */
  productName?: string;
}

export interface LifecycleCta {
  verb: LifecycleCtaVerb;
  /** Localized verb label, resolved here so callers stay wording-free. */
  label: string;
  /** Canonical localized profile path, or the allow-listed product origin. */
  href: string;
  /** True only when the destination leaves the marketing origin (`try`). */
  external: boolean;
}

export function lifecycleCtaVerbLabel(
  verb: LifecycleCtaVerb,
  lang: Language,
): string {
  return LIFECYCLE_CTA_VERB_LABELS[verb][lang];
}

export function resolveLifecycleCta(
  input: LifecycleCtaInput,
  lang: Language,
): LifecycleCta {
  const tryEligible =
    TRY_ELIGIBLE_LIFECYCLES.has(input.lifecycle) &&
    input.availability === "public" &&
    isPublicClaimHttpsUrl(input.primaryActionHref) &&
    isProductAppOriginUrl(input.slug, input.primaryActionHref);

  const verb: LifecycleCtaVerb = tryEligible
    ? "try"
    : DEVELOPMENT_LIFECYCLES.has(input.lifecycle)
      ? "view-development-status"
      : "learn";

  let label = lifecycleCtaVerbLabel(verb, lang);
  // For view-development-status, append the product name if provided
  if (verb === "view-development-status" && input.productName) {
    label = `${label} ${input.productName}`;
  }

  return {
    verb,
    label,
    href: tryEligible
      ? input.primaryActionHref
      : getProductProfilePath(lang, input.slug),
    external: tryEligible,
  };
}
