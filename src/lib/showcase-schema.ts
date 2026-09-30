import { z } from "astro/zod";
import { isHttpsUrl } from "./https-url.ts";

/**
 * Product showcase records (GOLIVE W5). A showcase binds real screens of a
 * product's running application to the exact source revision and data class
 * they were captured from, plus an optional intro video and onboarding guide
 * built only from those screens.
 *
 * Truth rules enforced here, not by convention:
 * - every screen is a capture of the running app (`ui-screenshot`), never
 *   artwork or a mock-up;
 * - the data class is declared, and the only class admitted today is
 *   synthetic demo data (no real tenant, payment or identity data);
 * - assets live under this product's own `/products/<slug>/showcase/` path,
 *   so CSP `img-src 'self'` renders them and nothing is fetched remotely;
 * - guide steps may only reference screens declared in the same record.
 */

const localized = (max: number) =>
  z.object({
    en: z.string().min(1).max(max),
    vi: z.string().min(1).max(max),
    zh: z.string().min(1).max(max),
  });

const assetPath = (extensions: string) =>
  z
    .string()
    .regex(
      new RegExp(
        `^/products/[a-z0-9-]+/showcase/[a-z0-9][a-z0-9.-]*\\.(?:${extensions})$`,
      ),
      "showcase asset must be a local /products/<slug>/showcase/... file",
    );

const screen = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  surface: z.enum(["phone", "desktop"]),
  src: assetPath("webp|avif|png|jpe?g"),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096),
  title: localized(60),
  caption: localized(180),
  alt: localized(160),
});

const captionTrack = z.object({
  /** BCP-47 subtitle language; Chinese is split by script. */
  lang: z.enum(["en", "vi", "zh-Hans", "zh-Hant"]),
  label: z.string().min(1).max(40),
  src: assetPath("vtt"),
});

const video = z.object({
  /** H.264 MP4 for Safari/iOS and most browsers. */
  src: assetPath("mp4"),
  /** VP9 WebM listed first, for browsers built without H.264. */
  webm: assetPath("webm").optional(),
  poster: assetPath("webp|avif|png|jpe?g"),
  width: z.number().int().positive().max(3840),
  height: z.number().int().positive().max(2160),
  durationSeconds: z.number().positive().max(180),
  /** The intro is silent; on-screen text is burned in Vietnamese. */
  audio: z.literal(false),
  captions: z.array(captionTrack).min(1),
});

const guideStep = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  screen: z.string().min(1),
  role: z.enum(["owner", "family"]),
  title: localized(80),
  body: localized(320),
});

export const showcaseSchema = z
  .object({
    product: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    capture: z.object({
      kind: z.literal("ui-screenshot"),
      data: z.literal("synthetic-demo"),
      environment: z.literal("local-test-build"),
      sourceRepository: z.url().refine(isHttpsUrl, "https URL required"),
      sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
      capturedAt: z.coerce.date(),
    }),
    screens: z.array(screen).min(3).max(16),
    video: video.optional(),
    guide: z
      .object({
        title: localized(80),
        intro: localized(320),
        steps: z.array(guideStep).min(3).max(12),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const prefix = `/products/${value.product}/showcase/`;
    const ids = new Set<string>();
    value.screens.forEach((item, index) => {
      if (ids.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["screens", index, "id"],
          message: `duplicate screen id ${item.id}`,
        });
      }
      ids.add(item.id);
      if (!item.src.startsWith(prefix)) {
        ctx.addIssue({
          code: "custom",
          path: ["screens", index, "src"],
          message: `screen must live under ${prefix}`,
        });
      }
    });
    if (value.video) {
      for (const path of [
        value.video.src,
        ...(value.video.webm ? [value.video.webm] : []),
        value.video.poster,
        ...value.video.captions.map((track) => track.src),
      ]) {
        if (!path.startsWith(prefix)) {
          ctx.addIssue({
            code: "custom",
            path: ["video"],
            message: `video asset ${path} must live under ${prefix}`,
          });
        }
      }
      const langs = value.video.captions.map((track) => track.lang);
      if (new Set(langs).size !== langs.length) {
        ctx.addIssue({
          code: "custom",
          path: ["video", "captions"],
          message: "one caption track per language",
        });
      }
    }
    value.guide?.steps.forEach((step, index) => {
      if (!ids.has(step.screen)) {
        ctx.addIssue({
          code: "custom",
          path: ["guide", "steps", index, "screen"],
          message: `guide step references unknown screen ${step.screen}`,
        });
      }
    });
  });

export type ShowcaseSchema = z.infer<typeof showcaseSchema>;
