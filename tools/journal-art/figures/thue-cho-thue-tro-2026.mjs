/**
 * Art for "thue-cho-thue-tro-2026". Every fact and number below is taken from
 * the post body (src/content/journal/thue-cho-thue-tro-2026.{vi,en}.md); the
 * images add no claim the text does not make.
 */
import { COBALT, HATCH_DEFS, INK, TINT, page } from "../art-base.mjs";
import { stampHtml } from "../stamp.mjs";

const POST = "thue-cho-thue-tro-2026";
const YEAR = 2026;

const T = {
  vi: {
    threshold: "1 tỷ ₫",
    heroTitle: "Ngưỡng 1 tỷ đồng cho chủ trọ",
    kicker: "Tóm tắt bài viết",
    title: "Thuế cho thuê trọ năm 2026",
    bigNumber: "1 tỷ đồng/năm",
    bigNote:
      "Ngưỡng doanh thu không phải nộp thuế GTGT và TNCN của hộ, cá nhân kinh doanh, áp dụng từ 1/1/2026.",
    timeline: [
      [
        "10/12/2025",
        "Luật Thuế TNCN (sửa đổi) được thông qua: ngưỡng 500 triệu đồng/năm.",
      ],
      ["29/4/2026", "Nghị định 141/2026/NĐ-CP nâng ngưỡng lên 1 tỷ đồng/năm."],
      ["Từ 1/1/2026", "Mức 1 tỷ đồng được áp dụng."],
    ],
    belowHead: "Doanh thu đến 1 tỷ đồng/năm",
    below: [
      "Không phải nộp thuế GTGT và TNCN.",
      "Vẫn hỏi cơ quan thuế về việc kê khai hoặc thông báo doanh thu.",
    ],
    aboveHead: "Trên 1 tỷ đồng/năm, cho thuê dài hạn",
    above: [
      "Thuế TNCN: 5% trên phần doanh thu vượt ngưỡng.",
      "Thuế GTGT: 5% trên doanh thu.",
      "Lưu trú ngắn ngày được tính theo cách khác.",
    ],
    exampleHead: "Ví dụ thuế TNCN",
    example: [
      "Doanh thu 1,2 tỷ",
      "Vượt ngưỡng 200 triệu",
      "200 triệu × 5% = 10 triệu đồng",
    ],
    invoiceHead: "Hoá đơn điện tử",
    invoice:
      "Cho thuê bất động sản không thuộc diện bắt buộc dùng hoá đơn điện tử theo Nghị định 254/2026/NĐ-CP.",
    footer:
      "Tóm tắt thông tin công khai, không phải tư vấn thuế. Nguồn: baochinhphu.vn · xaydungchinhsach.chinhphu.vn · tuoitre.vn",
  },
  en: {
    threshold: "1 billion ₫",
    heroTitle: "The 1 billion dong threshold for landlords",
    kicker: "Article summary",
    title: "Renting out rooms in Vietnam in 2026",
    bigNumber: "1 billion dong a year",
    bigNote:
      "Annual revenue up to which household and individual businesses owe no VAT or personal income tax, from 1 January 2026.",
    timeline: [
      [
        "10 Dec 2025",
        "Amended Personal Income Tax Law passed: threshold of 500 million dong a year.",
      ],
      [
        "29 Apr 2026",
        "Decree 141/2026/NĐ-CP raises the threshold to 1 billion dong a year.",
      ],
      ["From 1 Jan 2026", "The 1 billion dong threshold applies."],
    ],
    belowHead: "Revenue up to 1 billion dong a year",
    below: [
      "No VAT and no personal income tax.",
      "Still ask your tax office which declaration or revenue notice applies.",
    ],
    aboveHead: "Above 1 billion dong a year, long-term rental",
    above: [
      "PIT: 5% of the revenue above the threshold.",
      "VAT: 5% of revenue.",
      "Short-stay accommodation is taxed differently.",
    ],
    exampleHead: "Worked PIT example",
    example: [
      "Revenue 1.2 billion",
      "200 million above the threshold",
      "200 million × 5% = 10 million dong",
    ],
    invoiceHead: "E-invoices",
    invoice:
      "Renting out property is not among the activities required to use e-invoices under Decree 254/2026/NĐ-CP.",
    footer:
      "A summary of public information, not tax advice. Sources: baochinhphu.vn · xaydungchinhsach.chinhphu.vn · tuoitre.vn",
  },
};

/** Lead illustration: an engraved boarding-house row, a ledger and the threshold gauge. */
function hero(lang) {
  const t = T[lang];
  const W = 1600,
    H = 900;
  const doors = (y, n0, h = 150) =>
    Array.from({ length: 5 }, (_, i) => {
      const x = 230 + i * 170;
      return `<rect x="${x}" y="${y}" width="96" height="${h}" fill="url(#h-mid)" stroke="${INK}" stroke-width="3"/>
      <rect x="${x + 108}" y="${y + 24}" width="44" height="54" fill="url(#h-fine)" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="${x + 80}" cy="${y + 80}" r="4" fill="${TINT}"/>
      <text x="${x + 48}" y="${y - 12}" text-anchor="middle" font-size="18" font-weight="600" fill="${INK}">${n0 + i}</text>`;
    }).join("");
  const balusters = Array.from(
    { length: 46 },
    (_, i) =>
      `<path d="M${200 + i * 20} 452V500" stroke="${INK}" stroke-width="2.5"/>`,
  ).join("");
  const ledgerLines = Array.from({ length: 9 }, (_, i) => {
    const y = 700 + i * 16;
    return `<path d="M352 ${y}H530M588 ${y}H770" stroke="${INK}" stroke-opacity="0.55" stroke-width="1.6"/>`;
  }).join("");
  const ticks = Array.from(
    { length: 11 },
    (_, i) =>
      `<path d="M1330 ${230 + i * 48}H${i % 5 === 0 ? 1362 : 1350}" stroke="${INK}" stroke-width="2.5"/>`,
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter Variable">
  <defs>${HATCH_DEFS}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TINT}"/><stop offset="1" stop-color="#f7f8fa"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect x="0" y="0" width="${W}" height="260" fill="url(#h-fine)" opacity="0.10"/>
  <!-- ground -->
  <path d="M60 680H1540" stroke="${INK}" stroke-width="4"/>
  <rect x="60" y="684" width="1480" height="40" fill="url(#h-diag)" opacity="0.35"/>
  <!-- building -->
  <rect x="180" y="250" width="920" height="430" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
  <rect x="160" y="226" width="960" height="28" fill="url(#h-cross)" stroke="${INK}" stroke-width="4"/>
  <rect x="180" y="500" width="920" height="22" fill="url(#h-diag)" stroke="${INK}" stroke-width="3"/>
  <path d="M190 452H1090" stroke="${INK}" stroke-width="3.5"/>${balusters}
  ${doors(300, 201)}${doors(556, 101, 124)}
  <rect x="1060" y="254" width="40" height="426" fill="url(#h-diag)" opacity="0.6"/>
  <!-- ledger -->
  <path d="M330 860L340 676Q450 650 560 676L560 860Q450 836 330 860Z" fill="#ffffff" stroke="${INK}" stroke-width="3.5"/>
  <path d="M560 676Q670 650 790 676L800 860Q670 836 560 860Z" fill="#ffffff" stroke="${INK}" stroke-width="3.5"/>
  <path d="M560 676V860" stroke="${INK}" stroke-width="3"/>${ledgerLines}
  <path d="M600 712l10 12 20-24M600 760l10 12 20-24M600 808l10 12 20-24" fill="none" stroke="${COBALT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- threshold gauge -->
  <rect x="1240" y="210" width="90" height="480" rx="10" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
  <rect x="1248" y="410" width="74" height="272" rx="6" fill="url(#h-cobalt)"/>${ticks}
  <path d="M1170 410H1450" stroke="${COBALT}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="1170" cy="410" r="9" fill="${COBALT}"/>
  <text x="1144" y="422" text-anchor="end" font-size="34" font-weight="700" fill="${INK}">${t.threshold}</text>
  </svg>`;
  return page({
    width: W,
    height: H,
    body: `${svg}${stampHtml({ year: YEAR, position: "right: 5%; bottom: 6%;" })}`,
  });
}

/** End-of-article summary infographic. */
function infographic(lang) {
  const t = T[lang];
  const W = 1200,
    H = 1700;
  const li = (items) => items.map((s) => `<li>${s}</li>`).join("");
  const css = `
  .ig { position: absolute; inset: 0; padding: 72px 80px 200px; display: flex; flex-direction: column; gap: 34px; }
  .ig__kicker { font-size: 20px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${COBALT}; }
  .ig__title { font-size: 56px; font-weight: 750; letter-spacing: -0.025em; line-height: 1.08; margin-top: 10px; }
  .ig__rule { height: 4px; background: ${INK}; } .ig__hair { height: 1px; background: rgba(11,16,32,0.2); }
  .ig__big { display: grid; gap: 14px; }
  .ig__num { font-size: 88px; font-weight: 800; letter-spacing: -0.04em; color: ${COBALT}; line-height: 1; white-space: nowrap; }
  .ig__note { font-size: 24px; line-height: 1.4; color: #334155; max-width: 30em; }
  .ig__h { font-size: 22px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 14px; }
  .tl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative; }
  .tl::before { content: ""; position: absolute; left: 12px; right: 12px; top: 11px; height: 3px; background: repeating-linear-gradient(90deg, ${INK} 0 10px, transparent 10px 16px); }
  .tl__item { position: relative; padding-top: 38px; }
  .tl__dot { position: absolute; top: 0; left: 0; width: 25px; height: 25px; border-radius: 50%; background: #f7f8fa; border: 4px solid ${INK}; }
  .tl__item:last-child .tl__dot { background: ${COBALT}; border-color: ${COBALT}; }
  .tl__date { font-size: 26px; font-weight: 750; } .tl__text { font-size: 20px; line-height: 1.4; margin-top: 6px; color: #334155; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .card { border: 2px solid ${INK}; border-radius: 18px; padding: 26px 28px; background: #fff; }
  .card--above { border-color: ${COBALT}; box-shadow: inset 0 8px 0 ${COBALT}; }
  .card ul { list-style: none; display: grid; gap: 12px; } .card li { font-size: 21px; line-height: 1.4; padding-left: 26px; position: relative; }
  .card li::before { content: ""; position: absolute; left: 0; top: 11px; width: 12px; height: 3px; background: ${INK}; }
  .ex { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .ex__bar { grid-column: 1 / -1; display: grid; grid-template-columns: 5fr 1fr; height: 54px; border: 2px solid ${INK}; border-radius: 10px; overflow: hidden; }
  .ex__base { background: repeating-linear-gradient(0deg, rgba(11,16,32,0.55) 0 2px, transparent 2px 7px); }
  .ex__over { background: ${COBALT}; }
  .ex__labels { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr auto; margin-top: 10px; font-size: 20px; }
  .ex__labels span:last-child { text-align: right; font-weight: 700; color: ${COBALT}; }
  .ex__result { grid-column: 1 / -1; margin-top: 14px; font-size: 30px; font-weight: 750; }
  .inv { display: grid; grid-template-columns: 64px 1fr; gap: 22px; align-items: center; font-size: 22px; line-height: 1.45; }
  .inv__icon { width: 64px; height: 76px; border: 3px solid ${INK}; border-radius: 8px; background: repeating-linear-gradient(0deg, transparent 0 12px, rgba(11,16,32,0.5) 12px 14px) content-box; padding: 14px 12px; }
  .ig__foot { margin-top: auto; font-size: 17px; line-height: 1.45; color: #475569; }
  `;
  const [exRev, exOver, exResult] = t.example;
  const body = `<div class="ig">
    <div><p class="ig__kicker">${t.kicker}</p><h1 class="ig__title">${t.title}</h1></div>
    <div class="ig__rule"></div>
    <div class="ig__big"><p class="ig__num">${t.bigNumber}</p><p class="ig__note">${t.bigNote}</p></div>
    <div class="tl">${t.timeline.map(([d, s]) => `<div class="tl__item"><span class="tl__dot"></span><p class="tl__date">${d}</p><p class="tl__text">${s}</p></div>`).join("")}</div>
    <div class="cols">
      <div class="card"><p class="ig__h">${t.belowHead}</p><ul>${li(t.below)}</ul></div>
      <div class="card card--above"><p class="ig__h">${t.aboveHead}</p><ul>${li(t.above)}</ul></div>
    </div>
    <div class="ex"><p class="ig__h">${t.exampleHead}</p><span></span>
      <div class="ex__bar"><span class="ex__base"></span><span class="ex__over"></span></div>
      <div class="ex__labels"><span>${exRev}</span><span>${exOver}</span></div>
      <p class="ex__result">${exResult}</p></div>
    <div class="ig__hair"></div>
    <div><p class="ig__h">${t.invoiceHead}</p><div class="inv"><span class="inv__icon"></span><p>${t.invoice}</p></div></div>
    <p class="ig__foot">${t.footer}</p>
  </div>${stampHtml({ year: YEAR, position: "left: 50%; bottom: 64px; transform: translateX(-50%);" })}`;
  return page({ width: W, height: H, css, body });
}

export const FIGURES = ["vi", "en"].flatMap((lang) => [
  {
    post: POST,
    lang,
    name: "hero",
    width: 1600,
    height: 900,
    year: YEAR,
    title: T[lang].heroTitle,
    html: () => hero(lang),
  },
  {
    post: POST,
    lang,
    name: "infographic",
    width: 1200,
    height: 1700,
    year: YEAR,
    title: T[lang].title,
    html: () => infographic(lang),
  },
]);
