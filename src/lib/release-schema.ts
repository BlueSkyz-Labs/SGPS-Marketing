import { EVIDENCE_INDEX } from "../data/claims.ts";

const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRODUCT_SLUG = IDENTIFIER;
const REVISION = /^[0-9a-f]{7,40}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_ID = /^ev-[a-z0-9-]+$/;
const PUBLIC_PATH = /^\/[a-z0-9][a-z0-9/_-]*\/?$/;
const INTERNAL_PATH =
  /(?:^|[\s/\\])(?:src|tests|docs|node_modules|\.git(?:hub)?)(?:[\s/\\]|$)|[A-Za-z]:[\\/]|(?:^|[\\/])\.\.(?:[\\/]|$)/i;
const UNSAFE_PUBLIC_TEXT =
  /[\u0000-\u001f\u007f]|(?:javascript|data|file):|<\/?script|\$\{/i;

const STORY_KEYS = new Set([
  "id",
  "productSlug",
  "title",
  "summary",
  "releaseDate",
  "sourceRevision",
  "sourceUrl",
  "changes",
  "productSurface",
  "evidenceIds",
  "significance",
]);

const CHANGE_KEYS = new Set(["id", "kind", "title", "summary", "surface"]);
const UNSUPPORTED_KEYS = new Set([
  "adoption",
  "adoptionRate",
  "customerImpact",
  "impact",
  "metrics",
  "metric",
  "significanceClaim",
]);

export type ReleaseChangeKind =
  "feature" | "fix" | "improvement" | "maintenance" | "deprecation";

export type ReleaseSignificance = "minor" | "major";

export interface ReleaseStoryChange {
  id: string;
  kind: ReleaseChangeKind;
  title: string;
  summary: string;
  surface?: string;
}

export interface ReleaseStoryInput {
  id: string;
  productSlug: string;
  title: string;
  summary: string;
  releaseDate: string;
  sourceRevision?: string;
  sourceUrl?: string;
  changes: readonly ReleaseStoryChange[];
  productSurface?: string;
  evidenceIds: readonly string[];
  significance?: ReleaseSignificance;
}

export interface ReleaseStory extends ReleaseStoryInput {
  sourceRevision?: string;
  sourceUrl?: string;
}

export interface ReleaseStoryProduct {
  slug: string;
  public: boolean;
}

export interface ReleaseStorySource {
  revision?: string;
  url?: string;
  public: boolean;
  published: boolean;
  authoredMajorMilestone?: boolean;
}

export interface ReleaseStoryValidationContext {
  /** Authored comparison date; deliberately not derived from a runtime clock. */
  asOfDate: string;
  products: readonly ReleaseStoryProduct[];
  sources: readonly ReleaseStorySource[];
  evidence?: ReadonlyMap<string, unknown>;
}

export class ReleaseStoryValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = "ReleaseStoryValidationError";
    this.code = code;
  }
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new ReleaseStoryValidationError(
      "INVALID_RECORD",
      `${label} must be an object`,
    );
  }
  return value as Record<string, unknown>;
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): void {
  for (const key of Object.keys(value)) {
    if (allowed.has(key)) continue;
    if (UNSUPPORTED_KEYS.has(key)) {
      throw new ReleaseStoryValidationError(
        "UNSUPPORTED_CLAIM",
        `unsupported metric, adoption, impact, or significance claim: ${key}`,
      );
    }
    throw new ReleaseStoryValidationError(
      "UNKNOWN_FIELD",
      `unknown field: ${key}`,
    );
  }
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ReleaseStoryValidationError(
      "INVALID_FIELD",
      `${field} must be authored text`,
    );
  }
  return value;
}

function inspectPublicText(value: unknown, field: string): void {
  for (const text of stringsIn(value)) {
    if (UNSAFE_PUBLIC_TEXT.test(text)) {
      throw new ReleaseStoryValidationError(
        "UNSAFE_PUBLIC_FIELD",
        `${field} contains injection-like public text`,
      );
    }
    if (INTERNAL_PATH.test(text)) {
      throw new ReleaseStoryValidationError(
        "INTERNAL_PATH",
        `${field} contains an internal repository path`,
      );
    }
  }
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(stringsIn);
  }
  return [];
}

function assertIsoDate(value: unknown, field: string): string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) {
    throw new ReleaseStoryValidationError(
      "AUTHORED_DATE_REQUIRED",
      `${field} must be an authored YYYY-MM-DD date`,
    );
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ReleaseStoryValidationError(
      "AUTHORED_DATE_REQUIRED",
      `${field} must be a real calendar date`,
    );
  }
  return value;
}

function publicHttpsUrl(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ReleaseStoryValidationError(
      "INVALID_SOURCE",
      `${field} must be a URL`,
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ReleaseStoryValidationError(
      "INVALID_SOURCE",
      `${field} must be a URL`,
    );
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.hostname === "localhost" ||
    parsed.hostname.endsWith(".local") ||
    /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.)/.test(
      parsed.hostname,
    )
  ) {
    throw new ReleaseStoryValidationError(
      "PRIVATE_SOURCE",
      `${field} must resolve to a public HTTPS source`,
    );
  }
  return value;
}

function matchingSource(
  input: ReleaseStoryInput,
  sources: readonly ReleaseStorySource[],
): ReleaseStorySource {
  if (!input.sourceRevision && !input.sourceUrl) {
    throw new ReleaseStoryValidationError(
      "MISSING_SOURCE_IDENTITY",
      "release story requires a source identity",
    );
  }
  if (
    input.sourceRevision !== undefined &&
    !REVISION.test(input.sourceRevision)
  ) {
    throw new ReleaseStoryValidationError(
      "INVALID_SOURCE",
      "sourceRevision must be a canonical revision",
    );
  }
  const sourceUrl =
    input.sourceUrl === undefined
      ? undefined
      : publicHttpsUrl(input.sourceUrl, "sourceUrl");
  const source = sources.find(
    (candidate) =>
      (input.sourceRevision === undefined ||
        candidate.revision === input.sourceRevision) &&
      (sourceUrl === undefined || candidate.url === sourceUrl),
  );
  if (!source || !source.public || !source.published) {
    throw new ReleaseStoryValidationError(
      "UNRESOLVABLE_SOURCE",
      "source identity must resolve to a published public source",
    );
  }
  return source;
}

function validateProduct(
  productSlug: string,
  products: readonly ReleaseStoryProduct[],
): void {
  if (!PRODUCT_SLUG.test(productSlug)) {
    throw new ReleaseStoryValidationError(
      "INVALID_PRODUCT",
      "productSlug must be a canonical product identifier",
    );
  }
  const product = products.find((candidate) => candidate.slug === productSlug);
  if (!product || !product.public) {
    throw new ReleaseStoryValidationError(
      "UNPUBLISHED_PRODUCT",
      `product is unknown or unpublished: ${productSlug}`,
    );
  }
}

function validateEvidence(
  evidenceIds: readonly string[],
  evidence: ReadonlyMap<string, unknown>,
): string[] {
  if (!Array.isArray(evidenceIds) || evidenceIds.length === 0) {
    throw new ReleaseStoryValidationError(
      "MISSING_EVIDENCE",
      "at least one public evidence reference is required",
    );
  }
  const unique = new Set<string>();
  for (const id of evidenceIds) {
    if (typeof id !== "string" || !EVIDENCE_ID.test(id)) {
      throw new ReleaseStoryValidationError(
        "MISSING_EVIDENCE",
        "evidence references must use public evidence identifiers",
      );
    }
    if (unique.has(id) || !evidence.has(id)) {
      throw new ReleaseStoryValidationError(
        "MISSING_EVIDENCE",
        `evidence reference is missing or duplicated: ${id}`,
      );
    }
    const entry = evidence.get(id);
    if (
      entry !== null &&
      typeof entry === "object" &&
      "public" in entry &&
      (entry as { public?: unknown }).public !== true
    ) {
      throw new ReleaseStoryValidationError(
        "PRIVATE_EVIDENCE",
        `evidence reference is not public: ${id}`,
      );
    }
    unique.add(id);
  }
  return [...evidenceIds];
}

function validateChanges(value: unknown): ReleaseStoryChange[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ReleaseStoryValidationError(
      "INVALID_CHANGES",
      "changes must contain at least one authored change",
    );
  }
  return value.map((entry, index) => {
    const change = record(entry, `changes[${index}]`);
    rejectUnknownKeys(change, CHANGE_KEYS);
    const id = requiredText(change.id, `changes[${index}].id`);
    if (!IDENTIFIER.test(id)) {
      throw new ReleaseStoryValidationError(
        "INVALID_IDENTIFIER",
        `changes[${index}].id must be a safe identifier`,
      );
    }
    const kind = requiredText(change.kind, `changes[${index}].kind`);
    if (
      !["feature", "fix", "improvement", "maintenance", "deprecation"].includes(
        kind,
      )
    ) {
      throw new ReleaseStoryValidationError(
        "INVALID_CHANGE",
        `changes[${index}].kind is unsupported`,
      );
    }
    const title = requiredText(change.title, `changes[${index}].title`);
    const summary = requiredText(change.summary, `changes[${index}].summary`);
    const surface =
      change.surface === undefined
        ? undefined
        : requiredText(change.surface, `changes[${index}].surface`);
    inspectPublicText({ title, summary, surface }, `changes[${index}]`);
    return {
      id,
      kind: kind as ReleaseChangeKind,
      title,
      summary,
      ...(surface === undefined ? {} : { surface }),
    };
  });
}

export function parseReleaseStory(
  input: unknown,
  context: ReleaseStoryValidationContext,
): ReleaseStory {
  const story = record(input, "release story");
  rejectUnknownKeys(story, STORY_KEYS);
  const authoredAsOf = assertIsoDate(context.asOfDate, "context.asOfDate");
  const id = requiredText(story.id, "id");
  const productSlug = requiredText(story.productSlug, "productSlug");
  if (!IDENTIFIER.test(id)) {
    throw new ReleaseStoryValidationError(
      "INVALID_IDENTIFIER",
      "id must be a safe release identifier",
    );
  }
  validateProduct(productSlug, context.products);
  const title = requiredText(story.title, "title");
  const summary = requiredText(story.summary, "summary");
  inspectPublicText({ title, summary }, "public copy");
  const releaseDate = assertIsoDate(story.releaseDate, "releaseDate");
  if (releaseDate > authoredAsOf) {
    throw new ReleaseStoryValidationError(
      "FUTURE_DATE",
      "releaseDate cannot be in the future relative to authored context",
    );
  }
  const sourceRevision =
    story.sourceRevision === undefined
      ? undefined
      : requiredText(story.sourceRevision, "sourceRevision");
  const sourceUrl =
    story.sourceUrl === undefined
      ? undefined
      : requiredText(story.sourceUrl, "sourceUrl");
  const source = matchingSource(
    { ...story, sourceRevision, sourceUrl } as ReleaseStoryInput,
    context.sources,
  );
  const changes = validateChanges(story.changes);
  const productSurface =
    story.productSurface === undefined
      ? undefined
      : requiredText(story.productSurface, "productSurface");
  if (productSurface !== undefined && !PUBLIC_PATH.test(productSurface)) {
    throw new ReleaseStoryValidationError(
      "INVALID_PATH",
      "productSurface must be a public route path",
    );
  }
  inspectPublicText({ productSurface }, "productSurface");
  const evidenceIds = validateEvidence(
    story.evidenceIds as readonly string[],
    context.evidence ?? EVIDENCE_INDEX,
  );
  const significance =
    story.significance === undefined
      ? undefined
      : requiredText(story.significance, "significance");
  if (
    significance !== undefined &&
    significance !== "minor" &&
    significance !== "major"
  ) {
    throw new ReleaseStoryValidationError(
      "UNSUPPORTED_SIGNIFICANCE",
      "significance must be minor or major and must be source-backed",
    );
  }
  if (significance === "major" && source.authoredMajorMilestone !== true) {
    throw new ReleaseStoryValidationError(
      "UNSUPPORTED_SIGNIFICANCE",
      "major milestone requires authored source truth",
    );
  }
  return {
    id,
    productSlug,
    title,
    summary,
    releaseDate,
    ...(sourceRevision === undefined ? {} : { sourceRevision }),
    ...(sourceUrl === undefined ? {} : { sourceUrl }),
    changes,
    ...(productSurface === undefined ? {} : { productSurface }),
    evidenceIds,
    ...(significance === undefined
      ? {}
      : { significance: significance as ReleaseSignificance }),
  };
}

export const validateReleaseStory = parseReleaseStory;
