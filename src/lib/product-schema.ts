import { z } from "astro/zod";
import { isHttpsUrl } from "./https-url.ts";
import { isNonProductionSiteUrl } from "./truth.ts";

const lifecycle = z.enum([
  "concept",
  "prototype",
  "development",
  "beta",
  "active",
  "maintenance",
  "sunset",
  "archived",
]);

const availability = z.enum([
  "private",
  "waitlist",
  "preview",
  "public",
  "invite-only",
  "unavailable",
]);

const publicLabel = z.enum([
  "Preview",
  "In development",
  "Beta",
  "Available",
  "Sunsetting",
  "Archived",
]);

const platform = z.enum(["web", "android", "ios", "macos", "windows", "api"]);

const audience = z.enum([
  "individual",
  "professional",
  "team",
  "business",
  "organization",
]);

const actionType = z.enum([
  "open",
  "try",
  "explore",
  "preview",
  "waitlist",
  "get-started",
  "github",
  "contact",
]);

export type Lifecycle = z.infer<typeof lifecycle>;
export type Availability = z.infer<typeof availability>;
export type PublicLabel = z.infer<typeof publicLabel>;

/** Public product claim URLs: https only, never local/preview/docs hosts. */
export function isPublicClaimHttpsUrl(value: string): boolean {
  return isHttpsUrl(value) && !isNonProductionSiteUrl(value);
}

const httpsUrl = z
  .url()
  .refine(isPublicClaimHttpsUrl, "https production claim URL required");

/**
 * Coherence for *public* listings only.
 * Non-public drafts may use `availability: private` without matching this matrix.
 */
export const PUBLIC_LABEL_COHERENCE: Record<
  PublicLabel,
  { lifecycles: readonly Lifecycle[]; availabilities: readonly Availability[] }
> = {
  Preview: {
    lifecycles: ["prototype", "development", "beta"],
    availabilities: ["preview", "waitlist", "invite-only", "public"],
  },
  "In development": {
    lifecycles: ["concept", "prototype", "development"],
    availabilities: ["waitlist", "preview", "invite-only"],
  },
  Beta: {
    lifecycles: ["beta", "development"],
    availabilities: ["public", "invite-only", "preview", "waitlist"],
  },
  Available: {
    lifecycles: ["active", "maintenance"],
    availabilities: ["public", "invite-only"],
  },
  Sunsetting: {
    lifecycles: ["sunset", "maintenance"],
    availabilities: ["public", "invite-only", "unavailable"],
  },
  Archived: {
    lifecycles: ["archived", "sunset"],
    availabilities: ["unavailable"],
  },
};

const action = z.object({
  type: actionType,
  label: z.string().min(1).max(40),
  href: httpsUrl,
});

/** Local product evidence only — CSP img-src is 'self' data:; remote URLs cannot render. */
const productScreenshot = z.object({
  src: z
    .string()
    .regex(
      /^\/products\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|webp)$/i,
      "screenshot.src must be a local /products/... image path",
    ),
  alt: z.string().min(1).max(160),
  width: z.number().int().positive().max(8192),
  height: z.number().int().positive().max(8192),
});

export const productSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    shortDescription: z.string().min(1).max(180),
    lifecycle,
    availability,
    publicLabel,
    audience: z.array(audience).min(1),
    jobs: z.array(z.string().min(1)).min(1),
    /** Verified product capabilities — distinct from customer jobs-to-be-done. */
    capabilities: z.array(z.string().min(1).max(120)).min(2).max(3).optional(),
    platforms: z.array(platform).min(1),
    primaryAction: action,
    secondaryAction: action.optional(),
    proof: z
      .object({
        // OPEN DECISION (owner, #125 C1c vs live schema): screenshot is
        // OPTIONAL here. Flipping to a mandatory floor means replacing
        // `productScreenshot.optional()` with `productScreenshot` below AND
        // pointing every published product at a real /products/... asset —
        // do not flip without the assets, or listing breaks.
        screenshot: productScreenshot.optional(),
        publicUrl: httpsUrl.optional(),
        repositoryUrl: httpsUrl.optional(),
        documentationUrl: httpsUrl.optional(),
        privacyUrl: httpsUrl.optional(),
        securityUrl: httpsUrl.optional(),
        supportUrl: httpsUrl.optional(),
      })
      .refine(
        (value) => Object.values(value).some(Boolean),
        "public product requires at least one proof artifact",
      ),
    endorsement: z.literal("A BlueSkyz Labs product"),
    featuredTier: z.enum(["hero", "featured", "ecosystem", "hidden"]),
    displayOrder: z.number().int().nonnegative(),
    public: z.boolean(),
    sourceRevision: z.string().regex(/^[0-9a-f]{7,40}$/),
    lastReviewedAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    const immatureLifecycles: ReadonlySet<Lifecycle> = new Set([
      "concept",
      "prototype",
      "development",
    ]);
    const tryBlockedByLifecycle = immatureLifecycles.has(value.lifecycle);
    const tryBlockedByAvailability = value.availability === "waitlist";

    const rejectTry = (
      path: ["primaryAction" | "secondaryAction", "type"],
      reason: string,
    ) => {
      ctx.addIssue({
        code: "custom",
        path,
        message: reason,
      });
    };

    if (value.primaryAction.type === "try") {
      if (tryBlockedByLifecycle) {
        rejectTry(
          ["primaryAction", "type"],
          `${value.lifecycle} product cannot claim Try`,
        );
      } else if (tryBlockedByAvailability) {
        rejectTry(
          ["primaryAction", "type"],
          "waitlist availability cannot claim Try",
        );
      }
    }

    if (value.secondaryAction?.type === "try") {
      if (tryBlockedByLifecycle) {
        rejectTry(
          ["secondaryAction", "type"],
          `${value.lifecycle} product cannot claim Try`,
        );
      } else if (tryBlockedByAvailability) {
        rejectTry(
          ["secondaryAction", "type"],
          "waitlist availability cannot claim Try",
        );
      }
    }

    if (
      value.proof.screenshot &&
      (!value.capabilities || value.capabilities.length < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message:
          "screenshot proof requires 2–3 verified capabilities for FlagshipProof",
      });
    }

    // Coherence + public listing rules apply only to public listings.
    if (!value.public) return;

    const coherence = PUBLIC_LABEL_COHERENCE[value.publicLabel];
    if (!coherence.lifecycles.includes(value.lifecycle)) {
      ctx.addIssue({
        code: "custom",
        path: ["publicLabel"],
        message: `publicLabel ${value.publicLabel} is incoherent with lifecycle ${value.lifecycle}`,
      });
    }
    if (!coherence.availabilities.includes(value.availability)) {
      ctx.addIssue({
        code: "custom",
        path: ["publicLabel"],
        message: `publicLabel ${value.publicLabel} is incoherent with availability ${value.availability}`,
      });
    }

    if (value.availability === "private") {
      ctx.addIssue({
        code: "custom",
        path: ["availability"],
        message: "public product cannot have private availability",
      });
    }
    if (
      value.availability === "unavailable" &&
      value.publicLabel !== "Sunsetting" &&
      value.publicLabel !== "Archived"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["availability"],
        message:
          "unavailable availability is only coherent with Sunsetting or Archived public labels",
      });
    }
    if (!value.capabilities || value.capabilities.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message:
          "public product requires 2–3 verified capabilities (distinct from jobs)",
      });
    }
  });

export type ProductSchema = z.infer<typeof productSchema>;
