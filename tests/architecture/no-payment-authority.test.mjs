/**
 * Owner decision D-0 (2026-09-27): Marketing is not a payment authority.
 * The public site must never generate or ship a payable bank-transfer code
 * (VietQR / NAPAS 247 / EMVCo merchant payload). Payment-adjacent product
 * functionality belongs to the product repository under SGPS-DEC-2026-016.
 *
 * This source guard covers textual runtime surfaces under src/ and public/.
 * It does not claim semantic recognition of arbitrary opaque binary images;
 * asset-governance remains a separate defense for that residual class.
 */
import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const PAYMENT_MARKERS = [
  /A000000727/i,
  /QRIBFTT[AC]/,
  /\bvietqr\b/i,
  /\bnapas\b/i,
  /\bemvco\b/i,
];

const TEXT_RUNTIME_EXTENSION =
  /\.(?:astro|ts|tsx|js|mjs|cjs|html|css|svg|xml|txt|yaml|yml|json|webmanifest)$/i;
const SPECIAL_TEXT_FILES = new Set(["_headers", "_redirects"]);

function walkTextRuntime(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkTextRuntime(full, out);
    } else if (
      TEXT_RUNTIME_EXTENSION.test(entry) ||
      SPECIAL_TEXT_FILES.has(entry)
    ) {
      out.push(full);
    }
  }
  return out;
}

export function paymentMarkersIn(text) {
  return PAYMENT_MARKERS.filter((re) => re.test(text)).map(String);
}

export function findPaymentAuthorityOffenders({
  cwd = process.cwd(),
  roots = ["src", "public"],
} = {}) {
  return roots
    .flatMap((root) => walkTextRuntime(join(cwd, root)))
    .map((file) => [file, paymentMarkersIn(readFileSync(file, "utf8"))])
    .filter(([, hits]) => hits.length > 0);
}

test("textual public runtime carries no payment QR generator or payload", () => {
  assert.deepEqual(
    findPaymentAuthorityOffenders(),
    [],
    "payment payload markers found in src/ or public/",
  );
});

test("negative proof: payment authority under public/ is detected", () => {
  const dir = mkdtempSync(join(tmpdir(), "marketing-no-payment-"));
  try {
    mkdirSync(join(dir, "public"), { recursive: true });
    writeFileSync(
      join(dir, "public", "pay.js"),
      'const payload = "0010A000000727012400069704220110" + "0208QRIBFTTA";',
      "utf8",
    );
    const offenders = findPaymentAuthorityOffenders({ cwd: dir });
    assert.equal(offenders.length, 1);
    assert.match(offenders[0][0], /public[\\/]pay\.js$/);
    assert.ok(offenders[0][1].length >= 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("negative proof: a reintroduced NAPAS payload is detected", () => {
  const mutated =
    'const payload = "0010A000000727012400069704220110" + "0208QRIBFTTA";';
  assert.ok(paymentMarkersIn(mutated).length >= 2);
  assert.ok(paymentMarkersIn('import { x } from "@/lib/vietqr";').length > 0);
  assert.deepEqual(paymentMarkersIn("Sổ Trọ landlord notebook"), []);
});
