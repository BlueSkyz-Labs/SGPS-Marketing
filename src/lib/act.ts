import { SHARED_LABELS, labelFor, type Language } from "../data/site.ts";

export type ActCta = {
  href: string;
  label: string;
};

/**
 * Empty public-registry Act path, locale-aware.
 * Soft-land on Contact only when a real business email exists; otherwise About
 * (learn who we are) with Security as the working trust recourse.
 */
export function emptyRegistryPrimaryCta(
  contactEmail: string | null | undefined,
  lang: Language = "en",
): ActCta {
  if (contactEmail) {
    return {
      href: `/${lang}/contact/`,
      label: labelFor(SHARED_LABELS.contactUs, lang),
    };
  }
  return {
    href: `/${lang}/about/`,
    label: labelFor(SHARED_LABELS.aboutBlueSkyz, lang),
  };
}

export function emptyRegistrySecondaryCta(
  contactEmail: string | null | undefined,
  lang: Language = "en",
): ActCta {
  if (contactEmail) {
    return {
      href: `/${lang}/about/`,
      label: labelFor(SHARED_LABELS.aboutBlueSkyz, lang),
    };
  }
  return {
    href: `/${lang}/security/`,
    label: labelFor(SHARED_LABELS.security, lang),
  };
}
