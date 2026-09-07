const localFallback = "http://localhost:4321";

export const SITE = {
  name: "BlueSkyz Labs",
  /** Primary hero line — R4d comprehensive mockup (2026-09-05). */
  taglineLead: "Intelligence. Elevated.",
  taglineAccent: "Impact.",
  /** Supporting sentence under the tagline. */
  proposition:
    "We build intelligent products that empower people and elevate the way work gets done.",
  supporting:
    "Designed with clarity. Engineered with depth. Delivered with quiet excellence.",
  motto: "Build with clarity. Scale with confidence.",
  /** Approved public brand identity; does not replace env-driven canonical URL. */
  publicWebsite: "https://blueskyzlabs.com",
  founder: {
    name: "Tony Nguyen",
    role: "Founder & CEO",
  },
  location: {
    locality: "Ho Chi Minh City",
    country: "Vietnam",
  },
  url: import.meta.env.PUBLIC_SITE_URL?.trim() || localFallback,
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL?.trim() || null,
  securityEmail: import.meta.env.PUBLIC_SECURITY_EMAIL?.trim() || null,
} as const;

/** Public GitHub private vulnerability reporting (SECURITY.md). */
export const SECURITY_ADVISORY_URL =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

export const NAV = [
  { label: "Products", href: "/products/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const FOOTER_LINKS = [
  { label: "Products", href: "/products/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
  { label: "Support", href: "/support/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Security", href: "/security/" },
] as const;

/** R4d brand principles from owner comprehensive mockup (not product claims). */
export const BRAND_PRINCIPLES = [
  {
    name: "Intelligence",
    summary: "Deep thinking. Smart solutions.",
  },
  {
    name: "Elevation",
    summary: "Better perspective. Greater impact.",
  },
  {
    name: "Trust",
    summary: "Reliable, secure, consistent.",
  },
  {
    name: "Impact",
    summary: "Real value. Real change.",
  },
] as const;
