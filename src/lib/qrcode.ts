/**
 * Pure client-side zero-dependency QR Code generator (ISO/IEC 18004).
 * Generates 2D boolean matrices and accessible SVG elements.
 *
 * Designed specifically for VietQR payloads (80-200 characters)
 * with zero third-party dependencies, zero network access, and zero storage.
 */

export interface QRSVGOptions {
  size?: number;
  margin?: number;
  color?: string;
  backgroundColor?: string;
  alt?: string;
}

// GF(256) logarithm and exponential tables (primitive polynomial 0x11D / 285)
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    LOG_TABLE[val] = i;
    val <<= 1;
    if (val & 0x100) {
      val ^= 0x11d;
    }
  }
  EXP_TABLE[255] = EXP_TABLE[0]!;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x]! + LOG_TABLE[y]!) % 255]!;
}

// Reed-Solomon Generator Polynomial Cache
function getGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] = next[j]! ^ gfMul(poly[j]!, EXP_TABLE[i]!);
      next[j + 1] = next[j + 1]! ^ poly[j]!;
    }
    poly = next;
  }
  return poly;
}

// QR Table: Versions 1 through 10, Error Correction Level L
// [totalCodewords, dataCodewords, ecCodewordsPerBlock, numBlocks]
interface VersionInfo {
  version: number;
  totalCodewords: number;
  dataCodewords: number;
  ecPerBlock: number;
  blocks: number;
  alignment: number[];
}

const VERSION_TABLE: VersionInfo[] = [
  {
    version: 1,
    totalCodewords: 26,
    dataCodewords: 19,
    ecPerBlock: 7,
    blocks: 1,
    alignment: [],
  },
  {
    version: 2,
    totalCodewords: 44,
    dataCodewords: 34,
    ecPerBlock: 10,
    blocks: 1,
    alignment: [6, 18],
  },
  {
    version: 3,
    totalCodewords: 70,
    dataCodewords: 55,
    ecPerBlock: 15,
    blocks: 1,
    alignment: [6, 22],
  },
  {
    version: 4,
    totalCodewords: 100,
    dataCodewords: 80,
    ecPerBlock: 20,
    blocks: 1,
    alignment: [6, 26],
  },
  {
    version: 5,
    totalCodewords: 134,
    dataCodewords: 108,
    ecPerBlock: 26,
    blocks: 1,
    alignment: [6, 30],
  },
  {
    version: 6,
    totalCodewords: 172,
    dataCodewords: 136,
    ecPerBlock: 18,
    blocks: 2,
    alignment: [6, 34],
  },
  {
    version: 7,
    totalCodewords: 196,
    dataCodewords: 156,
    ecPerBlock: 20,
    blocks: 2,
    alignment: [6, 22, 38],
  },
  {
    version: 8,
    totalCodewords: 242,
    dataCodewords: 194,
    ecPerBlock: 24,
    blocks: 2,
    alignment: [6, 24, 42],
  },
  {
    version: 9,
    totalCodewords: 292,
    dataCodewords: 232,
    ecPerBlock: 30,
    blocks: 2,
    alignment: [6, 26, 46],
  },
  {
    version: 10,
    totalCodewords: 346,
    dataCodewords: 274,
    ecPerBlock: 36,
    blocks: 2,
    alignment: [6, 28, 50],
  },
];

// Precomputed 15-bit Format Information for Error Correction Level L (01)
// Mask 0 through 7 XORed with 0x5412 (101010000010010)
const FORMAT_INFO_LEVEL_L = [
  0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
];

function calculateReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = getGeneratorPoly(ecCount);
  const result = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i]! ^ result[0]!;
    result.copyWithin(0, 1);
    result[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      result[j] = result[j]! ^ gfMul(gen[j]!, factor);
    }
  }
  return result;
}

/**
 * Generates an ISO/IEC 18004 QR Code boolean matrix for the given text.
 */
export function generateQRMatrix(text: string): boolean[][] {
  const textBytes = new TextEncoder().encode(text);

  // Find minimum version that fits data
  let info: VersionInfo | undefined;
  for (const v of VERSION_TABLE) {
    // Byte mode overhead: 4 bits mode + 8 bits length + data*8
    const requiredBits = 4 + 8 + textBytes.length * 8;
    if (requiredBits <= v.dataCodewords * 8) {
      info = v;
      break;
    }
  }

  if (!info) {
    throw new Error(
      `Data too long for QR Code Version 1-10 (${textBytes.length} bytes)`,
    );
  }

  const size = info.version * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  // Helper to set module and mark as reserved
  function setModule(r: number, c: number, dark: boolean) {
    matrix[r]![c] = dark;
    reserved[r]![c] = true;
  }

  // 1. Place Finder Patterns (7x7) + Separators
  function placeFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            setModule(row, col, isBorder || isCenter);
          } else {
            // 1-module light separator
            setModule(row, col, false);
          }
        }
      }
    }
  }

  placeFinder(0, 0); // Top-left
  placeFinder(0, size - 7); // Top-right
  placeFinder(size - 7, 0); // Bottom-left

  // 2. Alignment Patterns (5x5) for Version >= 2
  const coords = info.alignment;
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      const r = coords[i]!;
      const c = coords[j]!;
      // Skip if overlaps with any of the 3 finder patterns
      const isTopLeft = r < 9 && c < 9;
      const isTopRight = r < 9 && c > size - 10;
      const isBottomLeft = r > size - 10 && c < 9;
      if (isTopLeft || isTopRight || isBottomLeft) continue;

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          setModule(r + dr, c + dc, isBorder || isCenter);
        }
      }
    }
  }

  // 3. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    const isDark = i % 2 === 0;
    if (!reserved[6]![i]) setModule(6, i, isDark);
    if (!reserved[i]![6]) setModule(i, 6, isDark);
  }

  // 4. Dark Module
  setModule(size - 8, 8, true);

  // 5. Reserve Format Information Area
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8]![i] = true;
      reserved[i]![8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8]![size - 1 - i] = true;
    reserved[size - 1 - i]![8] = true;
  }

  // 6. Encode Data Bitstream
  const bitstream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitstream.push((val >> i) & 1);
    }
  }

  // Byte Mode: 0100
  pushBits(0b0100, 4);
  // Character count (8 bits for version 1-9, 16 bits for version 10+)
  const countBits = info.version >= 10 ? 16 : 8;
  pushBits(textBytes.length, countBits);
  // Data bytes
  for (const byte of textBytes) {
    pushBits(byte, 8);
  }

  // Terminator (up to 4 zeroes)
  const maxDataBits = info.dataCodewords * 8;
  const termLen = Math.min(4, maxDataBits - bitstream.length);
  pushBits(0, termLen);

  // Pad to 8-bit boundary
  while (bitstream.length % 8 !== 0) {
    bitstream.push(0);
  }

  // Pad bytes: alternate 0xEC (11101100) and 0x11 (00010001)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bitstream.length < maxDataBits) {
    pushBits(padPatterns[padIdx % 2]!, 8);
    padIdx++;
  }

  // Convert bits to data codewords
  const dataBytes = new Uint8Array(info.dataCodewords);
  for (let i = 0; i < info.dataCodewords; i++) {
    let b = 0;
    for (let bit = 0; bit < 8; bit++) {
      b = (b << 1) | bitstream[i * 8 + bit]!;
    }
    dataBytes[i] = b;
  }

  // 7. Divide into Blocks and calculate Error Correction
  const numBlocks = info.blocks;
  const dataPerBlock = Math.floor(info.dataCodewords / numBlocks);
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * dataPerBlock;
    const blockData = dataBytes.slice(start, start + dataPerBlock);
    dataBlocks.push(blockData);
    ecBlocks.push(calculateReedSolomon(blockData, info.ecPerBlock));
  }

  // Interleave data codewords, then EC codewords
  const finalCodewords: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(dataBlocks[b]![i]!);
    }
  }
  for (let i = 0; i < info.ecPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(ecBlocks[b]![i]!);
    }
  }

  // Convert final codewords to bits
  const finalBits: number[] = [];
  for (const byte of finalCodewords) {
    for (let bit = 7; bit >= 0; bit--) {
      finalBits.push((byte >> bit) & 1);
    }
  }

  // 8. Place Data in 2-column Zig-Zag pattern
  let bitCursor = 0;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const upward = ((size - 1 - right) >> 1) % 2 === 0;

    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let c = right; c >= right - 1; c--) {
        if (!reserved[r]![c]) {
          const bit = bitCursor < finalBits.length ? finalBits[bitCursor++] : 0;
          matrix[r]![c] = bit === 1;
        }
      }
    }
  }

  // 9. Apply Mask Pattern (Default standard: Mask 0: (row + col) % 2 === 0)
  const mask = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r]![c]) {
        if ((r + c) % 2 === 0) {
          matrix[r]![c] = !matrix[r]![c];
        }
      }
    }
  }

  // 10. Place Format Information (Mask 0, Level L)
  const formatBits = FORMAT_INFO_LEVEL_L[mask]!;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >> (14 - i)) & 1) === 1;
    // Format bits around top-left
    if (i <= 5) setModule(8, i, bit);
    else if (i === 6) setModule(8, 7, bit);
    else if (i === 7) setModule(8, 8, bit);
    else if (i === 8) setModule(7, 8, bit);
    else setModule(14 - i, 8, bit);

    // Redundant format bits around top-right / bottom-left
    if (i < 8) {
      setModule(size - 1 - i, 8, bit);
    } else {
      setModule(8, size - 15 + i, bit);
    }
  }

  return matrix;
}

/**
 * Renders a QR Code as a clean, responsive SVG string.
 */
export function renderQRSVG(text: string, options: QRSVGOptions = {}): string {
  const {
    size = 256,
    margin = 4,
    color = "currentColor",
    backgroundColor = "transparent",
    alt = "QR Code",
  } = options;

  const matrix = generateQRMatrix(text);
  const moduleCount = matrix.length;
  const viewBoxSize = moduleCount + margin * 2;

  // Build combined SVG path for all dark modules (highly compact output)
  let pathData = "";
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r]![c]) {
        const x = c + margin;
        const y = r + margin;
        pathData += `M${x},${y}h1v1h-1z`;
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" role="img" aria-label="${alt}">`,
    backgroundColor !== "transparent"
      ? `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${backgroundColor}"/>`
      : "",
    `<path d="${pathData}" fill="${color}" fill-rule="evenodd"/>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("");
}
