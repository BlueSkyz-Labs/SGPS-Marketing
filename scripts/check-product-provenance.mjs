#!/usr/bin/env node
/**
 * T3 — product provenance guard (fail-closed).
 *
 * A published product record must be able to name where its facts come from. This guard exists
 * because a candidate shipped `repositoryUrl` values pointing at repositories that do not exist,
 * one `sourceRevision` repeated across five products that was in fact a commit of THIS repository,
 * and composed brand banners labelled as product screenshots. The previous contract
 * ("sourceRevision must be reachable from this repository") accepted all three: the misattributed
 * revision really was reachable here, so the guard proved only that the site cites itself.
 *
 * Contract per record under src/content/products:
 *   1. `slug` is present and equal to the file stem.
 *   2. `proof.repositoryUrl` is exactly https://github.com/BlueSkyz-Labs/<repo> for the slug's
 *      allow-listed repository — an unknown product, an unknown slug or a foreign organisation
 *      fails closed.
 *   3. `sourceRevision` is a 40-hex revision, is NOT a commit of this repository, and exactly
 *      matches the provider-read-back qualification registry for that product.
 *   4. The qualification registry itself records the product repository, default branch,
 *      checked default-head revision and the bounded evidence relationship.
 *   5. `proof.media` is declared, so identity/brand art is never claimed as a product screenshot.
 *
 * Offline by design. CI does not access private product repositories. Cross-repository existence
 * is qualified ahead of time through a provider read-back and pinned in the protected qualification
 * registry. This proves source identity/revision qualification only, never product capability,
 * deployment/runtime state, payment state or Human E4.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, extname, join } from "node:path";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const ROOT = rootIndex > -1 ? args[rootIndex + 1] : process.cwd();
const repoIndex = args.indexOf("--repo");
/** Repository used to detect a revision that belongs here; defaults to the scanned root. */
const REPO = repoIndex > -1 ? args[repoIndex + 1] : ROOT;
const PRODUCTS_DIR = join(ROOT, "src/content/products");
const ORG = "https://github.com/BlueSkyz-Labs";

/** The only repositories a product record may cite, keyed by product slug. */
const PRODUCT_REPOSITORIES = {
  apexagent: "ApexAgent",
  fluentarc: "FluentArc",
  sotam: "sotam",
  sotro: "Sotro",
  vungtaylai: "VungTayLai",
};

export const QUALIFICATION_FILE =
  "docs/evidence/product-source-qualification.json";

const QUALIFIED_RELATIONSHIPS = new Set([
  "EXACT_DEFAULT_HEAD",
  "ANCESTOR_OF_DEFAULT_HEAD",
]);

function loadQualificationRegistry() {
  const path = join(ROOT, QUALIFICATION_FILE);
  if (!existsSync(path)) {
    return {
      registry: null,
      errors: [
        `FAIL ${QUALIFICATION_FILE} — qualification registry is missing`,
      ],
    };
  }

  try {
    const registry = JSON.parse(readFileSync(path, "utf8"));
    const errors = [];
    if (registry?.schemaVersion !== "1.0") {
      errors.push(
        `FAIL ${QUALIFICATION_FILE} — schemaVersion must be 1.0`,
      );
    }
    if (registry?.evidenceClass !== "PROVIDER_REPOSITORY_READBACK") {
      errors.push(
        `FAIL ${QUALIFICATION_FILE} — evidenceClass must be PROVIDER_REPOSITORY_READBACK`,
      );
    }
    if (
      !registry?.products ||
      typeof registry.products !== "object" ||
      Array.isArray(registry.products)
    ) {
      errors.push(
        `FAIL ${QUALIFICATION_FILE} — products qualification map is missing`,
      );
    }
    return { registry, errors };
  } catch {
    return {
      registry: null,
      errors: [`FAIL ${QUALIFICATION_FILE} — invalid JSON`],
    };
  }
}

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(ya?ml|json)$/i.test(entry)) out.push(path);
  }
  return out;
}

function field(source, name) {
  const match = new RegExp(
    `^\\s*${name}:\\s*["']?([^"'\\n#]+?)["']?\\s*$`,
    "m",
  ).exec(source);
  return match ? match[1].trim() : null;
}

function hasKey(source, name) {
  return new RegExp(`^\\s*${name}:\\s*$`, "m").test(source);
}

/** Extracts the indented block under `name:` (canonical YAML shape; null when absent). */
function block(source, name) {
  const match = new RegExp(
    `^(\\s*)${name}:\\s*\\n((?:\\1[ \\t]+[^\\n]*\\n?)*)`,
    "m",
  ).exec(source);
  return match ? match[2] : null;
}

/** True when the revision resolves to an object in the repository being guarded. */
function revisionBelongsToThisRepository(revision) {
  try {
    execFileSync("git", ["cat-file", "-e", revision], {
      cwd: REPO,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const files = walk(PRODUCTS_DIR);
const failures = [];
let verified = 0;

let qualifications = null;
if (files.length > 0) {
  const loaded = loadQualificationRegistry();
  qualifications = loaded.registry;
  failures.push(...loaded.errors);
}

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const relative = file.slice(ROOT.length + 1).replace(/\\/g, "/");
  const problems = [];

  const slug = field(source, "slug");
  if (!slug) {
    problems.push("no slug");
  } else if (slug !== basename(file, extname(file))) {
    problems.push(`slug ${slug} does not match the file name`);
  }

  const repositoryUrl = field(source, "repositoryUrl");
  const expectedRepository = slug ? PRODUCT_REPOSITORIES[slug] : undefined;
  if (!repositoryUrl) {
    problems.push("no proof.repositoryUrl");
  } else if (!expectedRepository) {
    problems.push(
      `repositoryUrl ${repositoryUrl} cites a product that is not allow-listed (known: ${Object.keys(
        PRODUCT_REPOSITORIES,
      ).join(", ")})`,
    );
  } else if (repositoryUrl !== `${ORG}/${expectedRepository}`) {
    problems.push(
      `repositoryUrl ${repositoryUrl} is not ${ORG}/${expectedRepository}`,
    );
  }

  const revision = field(source, "sourceRevision");
  if (!revision) {
    problems.push(
      "no sourceRevision (fix: cite the product commit that evidences it)",
    );
  } else if (!/^[0-9a-f]{40}$/.test(revision)) {
    problems.push(`sourceRevision ${revision} is not a 40-hex revision`);
  } else if (revisionBelongsToThisRepository(revision)) {
    problems.push(
      `sourceRevision ${revision} is a commit of THIS repository — it must cite the product source, not this site`,
    );
  }

  if (
    slug &&
    expectedRepository &&
    revision &&
    /^[0-9a-f]{40}$/.test(revision) &&
    qualifications?.products
  ) {
    const qualification = qualifications.products[slug];
    const expectedQualifiedRepository = `BlueSkyz-Labs/${expectedRepository}`;

    if (!qualification) {
      problems.push(
        `sourceRevision ${revision} has no provider-read-back qualification`,
      );
    } else {
      if (qualification.repository !== expectedQualifiedRepository) {
        problems.push(
          `qualification repository ${qualification.repository ?? "<missing>"} is not ${expectedQualifiedRepository}`,
        );
      }
      if (qualification.sourceRevision !== revision) {
        problems.push(
          `sourceRevision ${revision} is not the qualified revision ${qualification.sourceRevision ?? "<missing>"}`,
        );
      }
      if (!/^[0-9a-f]{40}$/.test(qualification.checkedDefaultHead ?? "")) {
        problems.push(
          "qualification must record the full checked default-branch head",
        );
      }
      if (!QUALIFIED_RELATIONSHIPS.has(qualification.relationship)) {
        problems.push(
          `qualification relationship ${qualification.relationship ?? "<missing>"} is not accepted`,
        );
      }
    }
  }

  // Sổ Tâm P0 scope is explicitly audio-free (Product Truth / AGENTS / ADR).
  // This is a bounded source-content tripwire, not a substitute for project-owner
  // capability attestation or deployed runtime verification. See issue #291.
  if (slug === "sotam") {
    if (field(source, "name") !== "Sổ Tâm") {
      problems.push("Sổ Tâm must retain its verified product name");
    }
    const publicCopy = source
      .split("\n")
      .filter((line) =>
        /^(?:shortDescription:|  - |  label:|    alt:)/.test(line),
      )
      .join(" ");
    const audioScopePattern =
      /\b(?:voice|audio|transcrip\w*|speech|microphone)\b|giọng nói|ghi âm|âm thanh|语音|录音|转录/i;
    if (audioScopePattern.test(publicCopy)) {
      problems.push(
        "Sổ Tâm P0 public copy must not claim out-of-scope voice/audio/transcription",
      );
    }
  }

  // Vững Tay Lái V0 is a Vietnamese-first class-B learning Web/PWA,
  // not a native mobile app or an active-driving hazard-warning service.
  // Product source: docs/product/PRODUCT_TRUTH.md (LOCK); see Council #293.
  if (slug === "vungtaylai") {
    const publicCopy = source
      .split("\n")
      .filter((line) =>
        /^(?:shortDescription:|  - |  label:|    alt:)/.test(line),
      )
      .join(" ");
    const prohibitedDrivingClaim =
      /real.time|blind.spot|lane.drift|collision.warning|hazard.alert|computer.vision|cảnh báo va chạm|điểm mù|lệch làn|实时驾驶|碰撞预警/i;
    if (prohibitedDrivingClaim.test(publicCopy)) {
      problems.push(
        "Vững Tay Lái V0 must not claim live driving or hazard-warning capabilities",
      );
    }
    const platformsBlock =
      /^platforms:\s*\n((?:\s+-\s+\w+\s*\n)*)/m.exec(source)?.[1] ?? "";
    if (/^\s+-\s+(?:android|ios)\s*$/im.test(platformsBlock)) {
      problems.push(
        "Vững Tay Lái V0 must not claim native Android/iOS platforms",
      );
    }
  }

  if (hasKey(source, "screenshot") && !hasKey(source, "media")) {
    problems.push(
      "proof declares a bare screenshot claim; brand or identity art must be declared as proof.media",
    );
  }

  // Plan v5 W3.1 — typed proof media. A record must declare what its media is,
  // and its own evidence (alt wording, asset name) must not contradict that
  // declaration. Missing or unparsable media metadata fails closed.
  const mediaKey = hasKey(source, "media");
  const mediaBlock = mediaKey ? block(source, "media") : null;

  if (mediaKey && !mediaBlock) {
    problems.push(
      "proof.media must be an indented block so its declared kind can be checked",
    );
  }

  if (mediaBlock) {
    const kind = field(mediaBlock, "kind");
    const mediaSrc = field(mediaBlock, "src");
    const mediaAlt = field(mediaBlock, "alt");

    if (!kind) {
      problems.push(
        "proof.media must declare kind: identity-art or ui-screenshot",
      );
    } else if (kind !== "identity-art" && kind !== "ui-screenshot") {
      problems.push(
        `proof.media.kind ${kind} must be identity-art or ui-screenshot`,
      );
    } else if (kind === "ui-screenshot") {
      if (mediaSrc && /identity/i.test(mediaSrc)) {
        problems.push(
          `proof.media.kind ui-screenshot contradicts the identity artwork asset ${mediaSrc}`,
        );
      }
      if (mediaAlt && /\b(?:identity|artwork)\b/i.test(mediaAlt)) {
        problems.push(
          "proof.media.kind ui-screenshot contradicts artwork/identity wording in alt",
        );
      }
    } else {
      if (mediaAlt && /\bscreenshot\b/i.test(mediaAlt)) {
        problems.push(
          "proof.media.kind identity-art must not claim to be a screenshot (alt)",
        );
      }
      if (mediaSrc && /\bscreenshot\b/i.test(mediaSrc)) {
        problems.push(
          "proof.media.kind identity-art must not cite a screenshot asset (src)",
        );
      }
    }
  }

  if (problems.length > 0) {
    for (const problem of problems)
      failures.push(`FAIL ${relative} — ${problem}`);
    continue;
  }
  verified += 1;
}

if (failures.length > 0) {
  for (const line of failures) console.error(line);
  console.error(
    `Product provenance source qualification: FAIL (${failures.length} finding(s) across ${files.length} entries)`,
  );
  process.exit(1);
}

if (files.length === 0) {
  console.log(
    "Product provenance source qualification: IDLE (0 product records — the guard activates on the first record)",
  );
  process.exit(0);
}

console.log(
  `Product provenance source qualification: QUALIFIED (${verified} entries; capability/runtime/payment/E4 NOT_VERIFIED)`,
);
