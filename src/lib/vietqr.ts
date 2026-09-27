/**
 * Pure client-side deterministic VietQR / NAPAS 247 generator.
 * Conforms strictly to EMVCo QR Code Specification for Payment Systems (QRCPS)
 * and NAPAS 247 Interbank Transfer standards.
 *
 * Invariants:
 * - 100% deterministic, zero network calls, zero storage, zero telemetry.
 * - Standard CRC16-CCITT checksum calculation (poly 0x1021, init 0xFFFF).
 */

export interface VietQRParams {
  bankBin: string;
  accountNumber: string;
  amount?: number;
  purpose?: string;
}

export interface BankInfo {
  bin: string;
  shortName: string;
  name: string;
}

/**
 * Standard directory of major Vietnamese banks participating in NAPAS 247.
 */
export const VIETNAM_BANKS: readonly BankInfo[] = [
  { bin: "970422", shortName: "MBBank", name: "Ngân hàng TMCP Quân đội" },
  {
    bin: "970436",
    shortName: "Vietcombank",
    name: "Ngân hàng TMCP Ngoại thương Việt Nam",
  },
  {
    bin: "970415",
    shortName: "VietinBank",
    name: "Ngân hàng TMCP Công thương Việt Nam",
  },
  {
    bin: "970418",
    shortName: "BIDV",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
  },
  {
    bin: "970407",
    shortName: "Techcombank",
    name: "Ngân hàng TMCP Kỹ thương Việt Nam",
  },
  { bin: "970416", shortName: "ACB", name: "Ngân hàng TMCP Á Châu" },
  {
    bin: "970432",
    shortName: "VPBank",
    name: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
  },
  { bin: "970423", shortName: "TPBank", name: "Ngân hàng TMCP Tiên Phong" },
  {
    bin: "970405",
    shortName: "Agribank",
    name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn",
  },
  {
    bin: "970403",
    shortName: "Sacombank",
    name: "Ngân hàng TMCP Sài Gòn Thương Tín",
  },
  {
    bin: "970437",
    shortName: "HDBank",
    name: "Ngân hàng TMCP Phát triển TP.HCM",
  },
  { bin: "970448", shortName: "OCB", name: "Ngân hàng TMCP Phương Đông" },
] as const;

/**
 * Formats a Tag-Length-Value (TLV) field according to EMVCo specification.
 * Tag: 2 digits. Length: 2 digits zero-padded. Value: payload.
 */
export function formatTLV(tag: string, value: string): string {
  const lengthStr = String(value.length).padStart(2, "0");
  return `${tag}${lengthStr}${value}`;
}

/**
 * Calculates standard EMVCo CRC16-CCITT checksum over input string.
 * Polynomial: 0x1021, Initial value: 0xFFFF.
 */
export function calculateCRC16CCITT(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Normalizes Vietnamese diacritics to clean uppercase alphanumeric text for banking notes.
 */
export function sanitizeBankingNote(note: string): string {
  return note
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, 25);
}

/**
 * Parses root-level TLV fields from a valid EMVCo string.
 */
export function parseVietQRTLV(payload: string): Record<string, string> {
  const result: Record<string, string> = {};
  let cursor = 0;
  while (cursor < payload.length) {
    const tag = payload.substring(cursor, cursor + 2);
    const len = parseInt(payload.substring(cursor + 2, cursor + 4), 10);
    if (isNaN(len)) break;
    const value = payload.substring(cursor + 4, cursor + 4 + len);
    result[tag] = value;
    cursor += 4 + len;
  }
  return result;
}

/**
 * Generates an EMVCo-compliant VietQR payload string for NAPAS 247 transfer.
 */
export function generateVietQRPayload(params: VietQRParams): string {
  const { bankBin, accountNumber, amount, purpose } = params;

  // Validation
  if (!/^\d{6}$/.test(bankBin)) {
    throw new Error("bankBin must be exactly 6 digits");
  }
  if (!accountNumber || accountNumber.trim().length === 0) {
    throw new Error("accountNumber must not be empty");
  }
  if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0)) {
    throw new Error("amount must be a positive integer");
  }

  // Tag 38: Consumer Account Information for NAPAS
  // Sub-tag 00: NAPAS GUID (A000000727)
  const napasGuid = formatTLV("00", "A000000727");

  // Sub-tag 01: Beneficiary Bank Organization
  // Sub-sub-tag 00: Bank BIN
  // Sub-sub-tag 01: Account Number
  const beneficiaryContent =
    formatTLV("00", bankBin) + formatTLV("01", accountNumber.trim());
  const beneficiaryInfo = formatTLV("01", beneficiaryContent);

  // Sub-tag 02: Service Code (QRIBFTTA: Quick Response InterBank Fund Transfer To Account)
  const serviceCode = formatTLV("02", "QRIBFTTA");

  const tag38Value = napasGuid + beneficiaryInfo + serviceCode;
  const tag38 = formatTLV("38", tag38Value);

  // Root fields
  const tag00 = formatTLV("00", "01"); // Payload Format Indicator
  const isDynamic = amount !== undefined && amount > 0;
  const tag01 = formatTLV("01", isDynamic ? "12" : "11"); // 11: Static, 12: Dynamic
  const tag53 = formatTLV("53", "704"); // Transaction Currency: 704 (VND)

  let tag54 = "";
  if (isDynamic) {
    tag54 = formatTLV("54", String(amount)); // Transaction Amount
  }

  const tag58 = formatTLV("58", "VN"); // Country Code: VN

  let tag62 = "";
  if (purpose && purpose.trim().length > 0) {
    const sanitized = sanitizeBankingNote(purpose);
    if (sanitized.length > 0) {
      const tag08 = formatTLV("08", sanitized); // Purpose of transaction
      tag62 = formatTLV("62", tag08);
    }
  }

  // Raw payload without CRC
  const rawPayload = `${tag00}${tag01}${tag38}${tag53}${tag54}${tag58}${tag62}6304`;

  // Calculate CRC16
  const crc = calculateCRC16CCITT(rawPayload);

  return `${rawPayload}${crc}`;
}
