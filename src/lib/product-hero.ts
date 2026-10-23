import type { ShowcaseSchema } from "./showcase-schema.ts";

/**
 * Experience wave E (EX-01): the hero poster of a product profile is the first
 * phone capture the page already tells in its Feature Story (or, without a
 * story, the first phone capture of the record). It is the same recorded asset
 * the story renders, never a second source of product truth, and it carries no
 * claim of its own: the hero image is decorative and the story chapter keeps
 * the described copy.
 *
 * Pure module (no Astro imports) so the architecture guards can import it.
 */
type Screen = ShowcaseSchema["screens"][number];

export function heroScreen(
  showcase: Pick<ShowcaseSchema, "screens" | "story"> | null,
): Screen | null {
  if (!showcase) return null;
  const phones = showcase.screens.filter((item) => item.surface === "phone");
  const first = showcase.story?.chapters[0]?.screen;
  return phones.find((item) => item.id === first) ?? phones[0] ?? null;
}
