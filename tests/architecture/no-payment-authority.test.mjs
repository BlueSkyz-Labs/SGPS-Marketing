/**
 * Owner decision D-0 (2026-09-27): Marketing is not a payment authority.
 * The public site must never generate a payable bank-transfer code
 * (VietQR / NAPAS 247 / EMVCo merchant payload). Payment-adjacent product
 * functionality belongs to the product repository under SGPS-DEC-2026-016.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// NAPAS GUID, the NAPAS transfer service code, and payload-builder names.
const PAYMENT_MARKERS = [
  /A000000727/i,
  /QRIBFTT[AC]/,
  /\bvietqr\b/i,
  /\bnapas\b/i,
  /\bemvco\b/i,
];

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(astro|ts|tsx|js|mjs|yaml|json)$/.test(entry)) out.push(full);
  }
  return out;
};

export function paymentMarkersIn(text) {
  return PAYMENT_MARKERS.filter((re) => re.test(text)).map(String);
}

test("public source carries no payment QR generator or payload", () => {
  const offenders = walk("src")
    .map((file) => [file, paymentMarkersIn(readFileSync(file, "utf8"))])
    .filter(([, hits]) => hits.length > 0);
  assert.deepEqual(offenders, [], "payment payload markers found in src/");
});

test("negative proof: a reintroduced NAPAS payload is detected", () => {
  const mutated =
    'const payload = "0010A000000727012400069704220110" + "0208QRIBFTTA";';
  assert.ok(paymentMarkersIn(mutated).length >= 2);
  assert.ok(paymentMarkersIn('import { x } from "@/lib/vietqr";').length > 0);
  assert.deepEqual(paymentMarkersIn("Sổ Trọ landlord notebook"), []);
});
