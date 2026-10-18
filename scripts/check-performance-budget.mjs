#!/usr/bin/env node
/**
 * Experience Performance & Friction gate, web adapter (SGPS-DEC-2026-025).
 *
 * Reads the Lighthouse reports written by `lhci autorun` (lhr-*.json) and
 * checks the median of every gate route against performance-budget.json:
 * timing ceilings, deterministic resource-byte ceilings and zero-count
 * invariants, plus the render-blocking invariant (no blocking script except
 * the theme-init script; blocking stylesheet count within a ceiling). A value at or above warnRatio x ceiling warns; above the
 * ceiling fails. A budget route with fewer than minRuns reports fails, so a
 * route cannot be dropped silently. The budget file is a protected path.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Render-blocking resource URLs of one report, or null when the report has
 * neither audit. Lighthouse 13 replaced `render-blocking-resources` with
 * `render-blocking-insight`; the legacy id is the fallback. Never defaults to
 * an empty list: a missing audit must fail closed, not read as "none".
 */
export function renderBlockingUrls(audits) {
  for (const id of ["render-blocking-insight", "render-blocking-resources"]) {
    const items = audits[id]?.details?.items;
    if (Array.isArray(items)) return items.map((item) => String(item.url));
  }
  return null;
}

/** Split render-blocking URLs into disallowed scripts and stylesheets. */
export function classifyRenderBlocking(urls, allowedScript) {
  const allowed = new RegExp(allowedScript);
  const path = (url) => url.split(/[?#]/)[0];
  const stylesheets = urls.filter((u) => /\.css$/i.test(path(u)));
  const scripts = urls.filter((u) => !/\.css$/i.test(path(u)));
  return {
    stylesheets: stylesheets.length,
    unexpectedScripts: scripts.filter((u) => !allowed.test(path(u))),
  };
}

export function summarize(lhr) {
  const audits = lhr.audits;
  const resources = Object.fromEntries(
    (audits["resource-summary"]?.details?.items ?? []).map((item) => [
      item.resourceType,
      { bytes: item.transferSize, count: item.requestCount },
    ]),
  );
  return {
    route: new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl).pathname,
    timing: {
      "largest-contentful-paint":
        audits["largest-contentful-paint"]?.numericValue,
      "cumulative-layout-shift":
        audits["cumulative-layout-shift"]?.numericValue,
      "total-blocking-time": audits["total-blocking-time"]?.numericValue,
    },
    resourceBytes: Object.fromEntries(
      Object.entries(resources).map(([type, value]) => [type, value.bytes]),
    ),
    zeroCounts: {
      "third-party": resources["third-party"]?.count ?? 0,
    },
    renderBlocking: renderBlockingUrls(audits),
  };
}

/** Overrides: known routes only, resourceBytes only, with reason + evidence. */
export function validateOverrides(budget) {
  const problems = [];
  for (const [route, o] of Object.entries(budget.routeOverrides ?? {})) {
    if (!budget.routes.includes(route))
      problems.push(`${route}: override for an unknown route`);
    const keys = Object.keys(o).filter(
      (k) => !["resourceBytes", "reason", "evidence"].includes(k),
    );
    if (keys.length) problems.push(`${route}: override may not set ${keys}`);
    if (typeof o.reason !== "string" || o.reason.length < 40)
      problems.push(`${route}: override needs a recorded reason`);
    if (typeof o.evidence !== "string" || !o.evidence)
      problems.push(`${route}: override needs an evidence reference`);
    for (const key of Object.keys(o.resourceBytes ?? {}))
      if (!(key in budget.resourceBytes))
        problems.push(`${route}: unknown resource key ${key}`);
  }
  return problems;
}

export function evaluate(summaries, budget) {
  const errors = [];
  const warnings = [];
  for (const route of budget.routes) {
    const runs = summaries.filter((s) => s.route === route);
    if (runs.length < budget.minRuns) {
      errors.push(`${route}: ${runs.length} runs < minRuns ${budget.minRuns}`);
      continue;
    }
    const check = (group, key, ceiling) => {
      const values = runs
        .map((r) => r[group][key])
        .filter((v) => typeof v === "number");
      if (values.length < budget.minRuns) {
        errors.push(`${route} ${group}.${key}: missing measurement`);
        return;
      }
      const value = median(values);
      if (value > ceiling)
        errors.push(`${route} ${group}.${key}: ${value} > ${ceiling}`);
      else if (ceiling > 0 && value >= ceiling * budget.warnRatio)
        warnings.push(
          `${route} ${group}.${key}: ${value} >= ${budget.warnRatio} x ${ceiling}`,
        );
    };
    for (const [key, ceiling] of Object.entries(budget.timing))
      check("timing", key, ceiling);
    // Route overrides may only re-calibrate resource bytes for one route,
    // with a recorded reason (validateOverrides); timing and zero counts
    // are never relaxed per route.
    const routeBytes = {
      ...budget.resourceBytes,
      ...(budget.routeOverrides?.[route]?.resourceBytes ?? {}),
    };
    for (const [key, ceiling] of Object.entries(routeBytes))
      check("resourceBytes", key, ceiling);
    for (const [key, ceiling] of Object.entries(budget.zeroCounts))
      check("zeroCounts", key, ceiling);
    // Render-blocking: fail closed when any run lacks the audit, then no
    // script other than the allowed one and a stylesheet-count ceiling.
    const rb = budget.renderBlocking;
    if (runs.some((r) => !Array.isArray(r.renderBlocking))) {
      errors.push(
        `${route} renderBlocking: missing render-blocking audit (render-blocking-insight / render-blocking-resources)`,
      );
    } else {
      const classified = runs.map((r) =>
        classifyRenderBlocking(r.renderBlocking, rb.allowedScript),
      );
      const bad = [...new Set(classified.flatMap((c) => c.unexpectedScripts))];
      if (bad.length > rb.scripts)
        errors.push(
          `${route} renderBlocking.scripts: unexpected render-blocking script(s) ${bad.join(", ")}`,
        );
      const sheets = median(classified.map((c) => c.stylesheets));
      if (sheets > rb.stylesheets)
        errors.push(
          `${route} renderBlocking.stylesheets: ${sheets} > ${rb.stylesheets}`,
        );
    }
  }
  return { errors, warnings };
}

function main(dir = ".lighthouseci") {
  const budget = JSON.parse(readFileSync("performance-budget.json", "utf8"));
  const summaries = readdirSync(dir)
    .filter((name) => /^lhr-.*\.json$/.test(name))
    .map((name) =>
      summarize(JSON.parse(readFileSync(join(dir, name), "utf8"))),
    );
  const overrideProblems = validateOverrides(budget);
  const { errors, warnings } = evaluate(summaries, budget);
  errors.unshift(...overrideProblems);
  for (const warning of warnings) console.log(`WARN  ${warning}`);
  for (const error of errors) console.log(`FAIL  ${error}`);
  console.log(
    errors.length
      ? `Performance budget FAIL (${errors.length} error(s), ${warnings.length} warning(s))`
      : `Performance budget PASS (${summaries.length} reports, ${warnings.length} warning(s))`,
  );
  process.exitCode = errors.length ? 1 : 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv[2]);
}
