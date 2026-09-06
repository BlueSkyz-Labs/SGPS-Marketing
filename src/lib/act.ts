export type ActCta = {
  href: string;
  label: string;
};

/**
 * Empty public-registry Act path.
 * Soft-land on Contact only when a real business email exists; otherwise About
 * (learn who we are) with Security as the working trust recourse.
 */
export function emptyRegistryPrimaryCta(
  contactEmail: string | null | undefined,
): ActCta {
  if (contactEmail) {
    return { href: "/contact/", label: "Contact us" };
  }
  return { href: "/about/", label: "About BlueSkyz" };
}

export function emptyRegistrySecondaryCta(
  contactEmail: string | null | undefined,
): ActCta {
  if (contactEmail) {
    return { href: "/about/", label: "About BlueSkyz" };
  }
  return { href: "/security/", label: "Security" };
}
