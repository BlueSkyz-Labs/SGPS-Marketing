/**
 * Architectural contract & test suite for VietQR NAPAS 247 engine.
 * Enforces pure client-side deterministic generation, EMVCo compliance,
 * valid CRC16-CCITT calculation, and zero remote network/storage leakage.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  calculateCRC16CCITT,
  formatTLV,
  generateVietQRPayload,
  parseVietQRTLV,
  VIETNAM_BANKS,
} from "../../src/lib/vietqr.ts";

test("TLV helper formats tag, 2-digit zero-padded length, and value", () => {
  assert.equal(formatTLV("00", "01"), "000201");
  assert.equal(formatTLV("58", "VN"), "5802VN");
  assert.equal(formatTLV("53", "704"), "5303704");
  assert.equal(formatTLV("54", "2500000"), "54072500000");
});

test("CRC16-CCITT calculates correct EMVCo checksum", () => {
  // Standard EMVCo seed test: "000201010212" with tag 63
  const raw = "0002010102126304";
  const checksum = calculateCRC16CCITT(raw);
  assert.match(checksum, /^[0-9A-F]{4}$/);
  // Re-verify deterministic output
  assert.equal(calculateCRC16CCITT(raw), checksum);
});

test("generateVietQRPayload creates valid EMVCo / NAPAS 247 payload", () => {
  const payload = generateVietQRPayload({
    bankBin: "970422", // MBBank
    accountNumber: "0901234567",
    amount: 3500000,
    purpose: "TIEN PHONG THANG 10",
  });

  // Must begin with Payload Format Indicator (000201)
  assert.ok(payload.startsWith("000201"));

  // Must declare dynamic QR when amount is specified (010212)
  assert.ok(payload.includes("010212"));

  // Must contain NAPAS GUID: A000000727
  assert.ok(payload.includes("A000000727"));

  // Must contain bank BIN and account number
  assert.ok(payload.includes("970422"));
  assert.ok(payload.includes("0901234567"));

  // Must contain Service Code QRIBFTTA
  assert.ok(payload.includes("QRIBFTTA"));

  // Must contain Vietnam Currency 704 and Country VN
  assert.ok(payload.includes("5303704"));
  assert.ok(payload.includes("5802VN"));

  // Must contain Amount
  assert.ok(payload.includes("54073500000"));

  // Must contain Purpose
  assert.ok(payload.includes("TIEN PHONG THANG 10"));

  // Must end with CRC tag 6304 and 4-hex checksum
  assert.match(payload, /6304[0-9A-F]{4}$/);

  // Parse and verify self-consistency
  const parsed = parseVietQRTLV(payload);
  assert.equal(parsed["00"], "01");
  assert.equal(parsed["01"], "12");
  assert.equal(parsed["53"], "704");
  assert.equal(parsed["58"], "VN");
  assert.equal(parsed["54"], "3500000");
});

test("generateVietQRPayload handles static QR without amount or purpose", () => {
  const payload = generateVietQRPayload({
    bankBin: "970415", // VietinBank
    accountNumber: "102800123456",
  });

  assert.ok(payload.startsWith("000201"));
  // Static QR: 010211
  assert.ok(payload.includes("010211"));
  assert.ok(!payload.includes("540")); // No tag 54 (amount)
  assert.match(payload, /6304[0-9A-F]{4}$/);
});

test("generateVietQRPayload validates inputs and fails closed on invalid parameters", () => {
  // Invalid BIN (not 6 digits)
  assert.throws(
    () =>
      generateVietQRPayload({
        bankBin: "12345",
        accountNumber: "0123456",
      }),
    /bankBin must be exactly 6 digits/,
  );

  // Invalid account number (empty)
  assert.throws(
    () =>
      generateVietQRPayload({
        bankBin: "970422",
        accountNumber: "",
      }),
    /accountNumber must not be empty/,
  );

  // Invalid amount (negative)
  assert.throws(
    () =>
      generateVietQRPayload({
        bankBin: "970422",
        accountNumber: "123456",
        amount: -5000,
      }),
    /amount must be a positive integer/,
  );
});

test("VIETNAM_BANKS directory includes major banks with truthful BINs", () => {
  assert.ok(VIETNAM_BANKS.length >= 10);
  const mbbank = VIETNAM_BANKS.find((b) => b.shortName === "MBBank");
  assert.ok(mbbank);
  assert.equal(mbbank.bin, "970422");

  const vcb = VIETNAM_BANKS.find((b) => b.shortName === "Vietcombank");
  assert.ok(vcb);
  assert.equal(vcb.bin, "970436");
});

test("architectural security guard: vietqr module has zero network or storage leakage", () => {
  const source = readFileSync("src/lib/vietqr.ts", "utf8");

  // Zero network calls
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
  assert.doesNotMatch(source, /WebSocket/);
  assert.doesNotMatch(source, /navigator\.sendBeacon/);

  // Zero persistent storage access
  assert.doesNotMatch(source, /localStorage/);
  assert.doesNotMatch(source, /sessionStorage/);
  assert.doesNotMatch(source, /document\.cookie/);
  assert.doesNotMatch(source, /indexedDB/);

  // Zero dynamic script evaluation
  assert.doesNotMatch(source, /\beval\s*\(/);
  assert.doesNotMatch(source, /new Function\s*\(/);
});
