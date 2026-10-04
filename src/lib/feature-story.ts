/**
 * v12 S1 Feature Story: a product's month told with its own recorded screens.
 *
 * The story is presentation only. It may order, pair and reveal registry
 * truth; it never creates any. Every chapter names a screen declared in the
 * same showcase record and, optionally, one job or capability of the product
 * record (`job-1`, `capability-2`, 1-based) that the screen shows. Resolution
 * fails loudly, so an unknown screen, a wrong surface or a missing fact stops
 * the build instead of rendering an invented chapter.
 *
 * Pure module (no Astro imports) so the architecture guards can import it.
 */

export const STORY_FACT_REF = /^(job|capability)-([1-9])$/;
export const STORY_MIN_CHAPTERS = 3;
export const STORY_MAX_CHAPTERS = 6;

export interface StoryScreen {
  id: string;
  surface: "phone" | "desktop";
}

export interface StoryRecord {
  chapters: ReadonlyArray<{ screen: string; fact?: string | undefined }>;
  coda?: string | undefined;
}

export interface StoryFacts {
  jobs: readonly string[];
  capabilities: readonly string[];
}

export interface ResolvedChapter<S extends StoryScreen> {
  screen: S;
  /** The registry job/capability text this screen shows, if one is bound. */
  fact: string | null;
}

export interface ResolvedStory<S extends StoryScreen> {
  chapters: ResolvedChapter<S>[];
  coda: S | null;
}

/** Every reason a story record stops being registry-backed. */
export function storyProblems(
  story: StoryRecord,
  screens: readonly StoryScreen[],
  facts?: StoryFacts,
): string[] {
  const problems: string[] = [];
  const byId = new Map(screens.map((screen) => [screen.id, screen]));
  const count = story.chapters.length;
  if (count < STORY_MIN_CHAPTERS || count > STORY_MAX_CHAPTERS) {
    problems.push(
      `a story has ${STORY_MIN_CHAPTERS}-${STORY_MAX_CHAPTERS} chapters, found ${count}`,
    );
  }
  const seen = new Set<string>();
  story.chapters.forEach((chapter, index) => {
    const screen = byId.get(chapter.screen);
    if (!screen) {
      problems.push(`chapter ${index + 1}: unknown screen ${chapter.screen}`);
    } else if (screen.surface !== "phone") {
      problems.push(`chapter ${index + 1}: ${chapter.screen} is not a phone`);
    }
    if (seen.has(chapter.screen)) {
      problems.push(`chapter ${index + 1}: ${chapter.screen} repeats`);
    }
    seen.add(chapter.screen);
    if (chapter.fact !== undefined) {
      const match = STORY_FACT_REF.exec(chapter.fact);
      if (!match) {
        problems.push(`chapter ${index + 1}: bad fact ref ${chapter.fact}`);
      } else if (facts) {
        const list = match[1] === "job" ? facts.jobs : facts.capabilities;
        if (!list[Number(match[2]) - 1]) {
          problems.push(`chapter ${index + 1}: no ${chapter.fact} in record`);
        }
      }
    }
  });
  if (story.coda !== undefined) {
    const coda = byId.get(story.coda);
    if (!coda) problems.push(`coda: unknown screen ${story.coda}`);
    else if (coda.surface !== "desktop") {
      problems.push(`coda: ${story.coda} is not a desktop screen`);
    }
  }
  return problems;
}

/** Resolve a story against its showcase screens and product facts, or throw. */
export function resolveFeatureStory<S extends StoryScreen>(
  story: StoryRecord,
  screens: readonly S[],
  facts: StoryFacts,
): ResolvedStory<S> {
  const problems = storyProblems(story, screens, facts);
  if (problems.length > 0) {
    throw new Error(`feature story is not registry-backed: ${problems[0]}`);
  }
  const byId = new Map(screens.map((screen) => [screen.id, screen]));
  return {
    chapters: story.chapters.map((chapter) => {
      const match = chapter.fact ? STORY_FACT_REF.exec(chapter.fact) : null;
      const list = match?.[1] === "job" ? facts.jobs : facts.capabilities;
      return {
        screen: byId.get(chapter.screen)!,
        fact: match ? list[Number(match[2]) - 1]! : null,
      };
    }),
    coda: story.coda ? byId.get(story.coda)! : null,
  };
}

/**
 * Registry captions are written to follow a title and a dash ("Today — only
 * what…"). As a standalone line the first letter is capitalised; nothing else
 * changes.
 */
export function sentenceCase(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
