/**
 * v3 G10 — Integrity regression firewall (Task 20).
 * Deterministic source/data validator across ten drift classes. Never
 * auto-fixes; one failure per line with class, subject, and a fix hint.
 *
 * Pure selectors are imported where Node-safe; source contracts are used
 * only where Astro runtime imports prevent pure execution.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { CLAIMS, EVIDENCE_INDEX } from "../src/data/claims.ts";
import { resolvePublicClaim, getPublicClaims } from "../src/lib/claims.ts";
import { buildPublicSgpsManifest } from "../src/lib/sgps-manifest.ts";

export const DRIFT_CLASSES = [
  "claim-id-integrity",
  "unknown-evidence",
  "product-claim-resolvability",
  "locale-parity",
  "bare-locale-path",
  "forbidden-language",
  "generated-review-date",
  "manifest-divergence",
  "telemetry-allowlist",
  "evidence-destination",
];

const FIXES = {
  "claim-id-integrity":
    "Keep claim ids unique, slug-safe, and aligned with the public fabric.",
  "unknown-evidence":
    "Cite only evidence ids that exist in public integrity data.",
  "product-claim-resolvability":
    "A product claim must fail closed on an empty registry and resolve every advertised product through the public selector.",
  "locale-parity":
    "Every EN path, statement, label, and href needs its VI counterpart.",
  "bare-locale-path":
    "Shared components must build locale-aware hrefs; no hardcoded /en/ or /vi/ paths.",
  "forbidden-language":
    "Remove scoring, certification, or blanket-verification vocabulary.",
  "generated-review-date":
    "Review dates are authored literals; never generate them at build or runtime.",
  "manifest-divergence":
    "The public manifest must mirror the resolved claim fabric exactly.",
  "telemetry-allowlist":
    "Telemetry properties must stay enumerable and free of query, email, IP, body, or free text; transmission stays off.",
  "evidence-destination":
    "Evidence links must target known public routes or HTTPS public destinations.",
};

const FORBIDDEN_LANGUAGE =
  /\b(trust score|score:|certified|guaranteed|ranking)\b/i;
const GENERATED_DATE = /new Date\(|toISOString\(|Date\.now\(/;
const FORBIDDEN_TELEMETRY_PROP =
  /^(query|q|email|ip|userip|body|freetext|searchterm|text)$/i;
const PUBLIC_DESTINATION =
  /^\/(en|vi)\/(evidence\/[a-z0-9-]+\/|products\/[a-z0-9-]+\/|decision-room\/)$/;

function defaultList(dir) {
  const root = process.cwd();
  const base = join(root, dir);
  const results = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(relative(root, full).split("\\").join("/"));
    }
  };
  walk(base);
  return results;
}

export function runFirewall(opts = {}) {
  const read =
    opts.read ?? ((path) => readFileSync(join(process.cwd(), path), "utf8"));
  const list = opts.list ?? defaultList;
  const claims = opts.claims ?? CLAIMS;
  const evidence = opts.evidence ?? EVIDENCE_INDEX;
  const products = opts.products ?? [];
  const manifestOf = opts.manifest ?? ((p) => buildPublicSgpsManifest(p));
  const failures = [];
  const push = (cls, subject, detail) => {
    failures.push({ cls, subject, detail, fix: FIXES[cls] });
  };

  const seoSource = read("src/lib/seo.ts");
  const staticPaths = [...seoSource.matchAll(/"(\.?\/[a-z0-9/-]*)"/g)]
    .map((match) => match[1])
    .filter((value) => value.startsWith("/"));

  /* 1 — duplicate or orphan claim ids */
  const seen = new Set();
  for (const claim of claims) {
    if (!claim.id || !/^[a-z0-9-]+$/.test(claim.id)) {
      push(
        "claim-id-integrity",
        claim.id ?? "<missing>",
        "claim id is missing or not slug-safe",
      );
    } else if (seen.has(claim.id)) {
      push("claim-id-integrity", claim.id, "duplicate claim id");
    } else {
      seen.add(claim.id);
    }
  }

  /* 2 — unknown evidence references */
  for (const claim of claims) {
    for (const evidenceId of claim.evidenceIds ?? []) {
      if (!evidence.has(evidenceId)) {
        push(
          "unknown-evidence",
          claim.id ?? "<missing>",
          `unknown evidence id "${evidenceId}"`,
        );
      }
    }
  }

  /* 3 — product claims must not resolve through an empty registry */
  for (const claim of claims) {
    if (claim.kind !== "product") continue;
    const resolved = resolvePublicClaim(claim, products);
    if (products.length === 0 && resolved !== null) {
      push(
        "product-claim-resolvability",
        claim.id,
        "product claim resolved while the public registry is empty",
      );
    }
    if (products.length > 0 && resolved === null) {
      push(
        "product-claim-resolvability",
        claim.id,
        "product claim does not resolve though the public registry is not empty",
      );
    }
    if (resolved) {
      const known = new Set(products.map((product) => product.slug));
      for (const slug of resolved.productSlugs) {
        if (!known.has(slug)) {
          push(
            "product-claim-resolvability",
            claim.id,
            `unknown product "${slug}"`,
          );
        }
      }
    }
  }

  /* 4 — EN/VI parity: route registry + localized data */
  for (const path of staticPaths) {
    if (!path.startsWith("/en/")) continue;
    const sibling = "/vi/" + path.slice(4);
    if (!staticPaths.includes(sibling)) {
      push("locale-parity", path, `missing VI counterpart ${sibling}`);
    }
  }
  for (const claim of claims) {
    if (!claim.statement?.en || !claim.statement?.vi) {
      push(
        "locale-parity",
        claim.id ?? "<missing>",
        "claim statement lacks an EN/VI pair",
      );
    }
  }
  for (const [id, ref] of evidence) {
    if (!ref.href?.en || !ref.href?.vi || !ref.label?.en || !ref.label?.vi) {
      push(
        "locale-parity",
        id,
        "evidence reference lacks an EN/VI href or label",
      );
    }
  }

  /* 5 — bare locale-sensitive paths in shared components */
  const sharedFiles = list("src/components").concat(list("src/layouts"));
  for (const file of sharedFiles) {
    const source = read(file);
    const match = source.match(
      /href="\/(en|vi)\/(products|security|privacy|support)\//,
    );
    if (match) {
      push("bare-locale-path", file, `hardcoded locale path "${match[0]}"`);
    }
  }

  /* 6 + 7 — forbidden language and generated dates in public truth sources */
  const truthFiles = [
    "src/data/claims.ts",
    "src/data/integrity.ts",
    ...list("src/components/integrity"),
  ];
  for (const file of truthFiles) {
    const source = read(file);
    if (FORBIDDEN_LANGUAGE.test(source)) {
      push(
        "forbidden-language",
        file,
        "contains scoring or blanket-verification language",
      );
    }
    if (GENERATED_DATE.test(source)) {
      push(
        "generated-review-date",
        file,
        "review dates must be authored, not generated",
      );
    }
  }

  /* 8 — manifest must mirror the resolved fabric */
  const fabricIds = getPublicClaims(products).map(
    (resolved) => resolved.claim.id,
  );
  const manifestIds = manifestOf(products).claims.map((claim) => claim.id);
  for (const id of manifestIds) {
    if (!fabricIds.includes(id)) {
      push(
        "manifest-divergence",
        id,
        "manifest id is not in the resolved fabric",
      );
    }
  }
  for (const id of fabricIds) {
    if (!manifestIds.includes(id)) {
      push("manifest-divergence", id, "fabric id is missing from the manifest");
    }
  }

  /* 9 — telemetry allowlists stay enumerable and transmission stays off */
  const analyticsSource = read("src/lib/analytics.ts");
  const allowedBlock = analyticsSource.match(
    /ALLOWED_PROPERTIES[^=]*=\s*\{([\s\S]*?)\n\};/,
  );
  if (allowedBlock) {
    for (const match of allowedBlock[1].matchAll(/^\s*(\w+):\s*\[(.*?)\]/gm)) {
      for (const prop of match[2].matchAll(/"([^"]+)"/g)) {
        if (FORBIDDEN_TELEMETRY_PROP.test(prop[1])) {
          push(
            "telemetry-allowlist",
            match[1],
            `property "${prop[1]}" is forbidden`,
          );
        }
      }
    }
  }
  const bridgeSource = read("src/scripts/analytics-bridge.ts");
  if (/fetch\(|sendBeacon|XMLHttpRequest/.test(bridgeSource)) {
    push(
      "telemetry-allowlist",
      "src/scripts/analytics-bridge.ts",
      "transmission must stay disabled",
    );
  }

  /* 10 — evidence destinations must be known public surfaces or HTTPS */
  const knownPaths = new Set(staticPaths);
  for (const [id, ref] of evidence) {
    for (const href of [ref.href?.en, ref.href?.vi]) {
      if (!href) continue;
      if (href.startsWith("/")) {
        if (!knownPaths.has(href) && !PUBLIC_DESTINATION.test(href)) {
          push(
            "evidence-destination",
            id,
            `unknown internal destination "${href}"`,
          );
        }
      } else if (!href.startsWith("https://")) {
        push(
          "evidence-destination",
          id,
          `external destination must be HTTPS: "${href}"`,
        );
      }
    }
  }

  return failures;
}

export function formatFirewallFailures(failures) {
  return failures.map(
    ({ cls, subject, detail, fix }) =>
      `FAIL ${cls} ${subject} — ${detail} (fix: ${fix})`,
  );
}

const isMain = process.argv[1]
  ? process.argv[1]
      .split("\\")
      .join("/")
      .endsWith("scripts/check-integrity-firewall.mjs")
  : false;

if (isMain) {
  const failures = runFirewall();
  if (failures.length > 0) {
    for (const line of formatFirewallFailures(failures)) console.error(line);
    console.error(`Integrity firewall: FAIL (${failures.length} issue(s))`);
    process.exit(1);
  }
  console.log(
    `Integrity firewall: PASS (${DRIFT_CLASSES.length} drift classes checked)`,
  );
}
