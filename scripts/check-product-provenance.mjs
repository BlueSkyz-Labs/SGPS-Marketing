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
 *   3. `sourceRevision` is a 40-hex revision and is NOT a commit of this repository: attributing
 *      this repository's own revision to a product is the defect, not evidence.
 *   4. `proof.media` is declared, so identity/brand art is never claimed as a product screenshot.
 *
 * Offline by design. A foreign revision cannot be proven to exist from here, so the guard refuses
 * the cases it can decide (unknown repository, this repository's own revision, unlabelled media)
 * and reports IDLE for an empty registry instead of passing by accident.
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
    `Product provenance: FAIL (${failures.length} of ${files.length} entries)`,
  );
  process.exit(1);
}

if (files.length === 0) {
  console.log(
    "Product provenance: IDLE (0 published products — the guard activates on the first listing)",
  );
  process.exit(0);
}

console.log(`Product provenance: PASS (${verified} entries)`);
