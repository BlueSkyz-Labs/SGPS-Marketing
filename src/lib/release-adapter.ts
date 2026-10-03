import {
  parseReleaseStory,
  type ReleaseChangeKind,
  type ReleaseSignificance,
  type ReleaseStory,
  type ReleaseStoryProduct,
} from "./release-schema.ts";

/**
 * v11 J2 / C3-F Task 2: the public release record.
 *
 * The product repositories are private, so the public record lives in this
 * public repository (`src/data/releases/<product>/<version>.json`). Its public
 * source identity is the Owner-approved pull request that added it. The
 * adapter maps a record to a C3-F release story and has no prose authority:
 * every word comes from the record, and `parseReleaseStory` re-validates it.
 */
export interface LocalizedText {
  vi: string;
  en: string;
}

export interface PublicReleaseRecordChange {
  id: string;
  kind: ReleaseChangeKind;
  title: LocalizedText;
  summary: LocalizedText;
  surface?: string;
}

export interface PublicReleaseRecord {
  product: string;
  version: string;
  releaseDate: string;
  significance: ReleaseSignificance;
  title: LocalizedText;
  summary: LocalizedText;
  changes: readonly PublicReleaseRecordChange[];
  evidenceIds: readonly string[];
  /** Public, merged Owner-approval PR in this repository. */
  approvalPr: string;
  /** `published` only after the Owner approved the record and it merged. */
  state: "draft" | "published";
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const APPROVAL_PR =
  /^https:\/\/github\.com\/BlueSkyz-Labs\/SGPS-Marketing\/pull\/\d+$/;

export class ReleaseRecordError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = "ReleaseRecordError";
    this.code = code;
  }
}

export function releaseRecordId(record: PublicReleaseRecord): string {
  return `${record.product}-${record.version.replaceAll(".", "-")}`;
}

export function toReleaseStory(
  record: PublicReleaseRecord,
  lang: keyof LocalizedText,
  context: {
    asOfDate: string;
    products: readonly ReleaseStoryProduct[];
    evidence?: ReadonlyMap<string, unknown>;
  },
): ReleaseStory {
  if (!SEMVER.test(record.version)) {
    throw new ReleaseRecordError("INVALID_VERSION", "version must be x.y.z");
  }
  if (!APPROVAL_PR.test(record.approvalPr)) {
    throw new ReleaseRecordError(
      "INVALID_APPROVAL",
      "approvalPr must be a pull request in BlueSkyz-Labs/SGPS-Marketing",
    );
  }
  return parseReleaseStory(
    {
      id: releaseRecordId(record),
      productSlug: record.product,
      title: record.title[lang],
      summary: record.summary[lang],
      releaseDate: record.releaseDate,
      sourceUrl: record.approvalPr,
      changes: record.changes.map((change) => ({
        id: change.id,
        kind: change.kind,
        title: change.title[lang],
        summary: change.summary[lang],
        ...(change.surface === undefined ? {} : { surface: change.surface }),
      })),
      evidenceIds: record.evidenceIds,
      significance: record.significance,
    },
    {
      asOfDate: context.asOfDate,
      products: context.products,
      sources: [
        {
          url: record.approvalPr,
          public: true,
          published: record.state === "published",
          authoredMajorMilestone: record.significance === "major",
        },
      ],
      ...(context.evidence === undefined ? {} : { evidence: context.evidence }),
    },
  );
}

/** Deterministic order: newest release first, then product, then version. */
export function sortReleaseRecords(
  records: readonly PublicReleaseRecord[],
): PublicReleaseRecord[] {
  return [...records].sort(
    (a, b) =>
      b.releaseDate.localeCompare(a.releaseDate) ||
      a.product.localeCompare(b.product) ||
      b.version.localeCompare(a.version, undefined, { numeric: true }),
  );
}
