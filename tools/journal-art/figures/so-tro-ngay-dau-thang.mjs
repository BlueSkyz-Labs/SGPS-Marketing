/**
 * Art for "so-tro-ngay-dau-thang". The lead image composes real Sổ Trọ screenshots
 * (captured 2026-10-25 from a test build with sample data); the infographic
 * restates the post body.
 */
import { readFileSync } from "node:fs";
import { COBALT, HATCH_DEFS, INK, TINT, page } from "../art-base.mjs";
import { stampHtml } from "../stamp.mjs";

const POST = "so-tro-ngay-dau-thang";
const YEAR = 2026;
const SHOTS = new URL(
  "../../../public/products/sotro/showcase/",
  import.meta.url,
).href;
const MARK = readFileSync(
  new URL(
    "../../../public/brand/blueskyz/v4/products/sotro.svg",
    import.meta.url,
  ),
  "utf8",
).replace(/<svg /, '<svg class="ig__mark" ');

const PILL = {
  vi: "Bản demo · đang hoàn thiện",
  en: "Demo · still being finished",
};

const T = {
  vi: {
    heroTitle: "Sổ Trọ trên điện thoại và máy tính",
    kicker: "Tóm tắt bài viết",
    title: "Một ngày đầu tháng với Sổ Trọ",
    deck: "Ghi điện nước, thu tiền, cả nhà cùng làm.",
    points: [
      [
        "Xem việc hôm nay",
        "Chỉ hiện việc cần nhớ và tiền trọ tháng này chưa đóng.",
      ],
      ["Ghi điện nước", "Chọn phòng, nhập số, sang phòng kế tiếp."],
      [
        "Thu tiền",
        "Xác nhận số tiền rồi mới ghi vào sổ; mã QR chuyển khoản; biên nhận gửi qua Zalo.",
      ],
      [
        "Người nhà cùng giúp",
        "Kết nối điện thoại bằng một lần chạm, không cần tài khoản hay mật khẩu.",
      ],
    ],
    statusHead: "Hiện trạng",
    status: [
      [
        "Web",
        "Đang xem trước, nhận sổ mới với số lượng có hạn. Bản demo, đang hoàn thiện.",
      ],
      ["Android, iOS", "Đang phát triển, chưa có trên cửa hàng ứng dụng."],
    ],
    footer:
      "Ảnh màn hình chụp ngày 25/10/2026 từ bản chạy thử, dùng dữ liệu mẫu.",
  },
  en: {
    heroTitle: "Sổ Trọ on phone and desktop",
    kicker: "Article summary",
    title: "A first-of-the-month day with Sổ Trọ",
    deck: "Meter readings, rent and family help.",
    points: [
      [
        "See today's tasks",
        "Only things to remember and this month's unpaid rent.",
      ],
      [
        "Enter meter readings",
        "Pick a room, enter the numbers, move to the next.",
      ],
      [
        "Collect rent",
        "Confirm the amount, then record it; a bank-transfer QR code; a receipt to copy into Zalo.",
      ],
      ["Family helps", "Connect a phone with one tap, no account or password."],
    ],
    statusHead: "Where it stands",
    status: [
      [
        "Web",
        "In preview, accepting new rent books in limited numbers. A demo, still being finished.",
      ],
      ["Android, iOS", "In development, not in the app stores."],
    ],
    footer:
      "Screenshots captured on 25 October 2026 from a test build with sample data.",
  },
};

const PILL_CSS = `
  .pill { position: absolute; z-index: 21; left: 56px; top: 48px; padding: 9px 18px; border-radius: 999px;
    background: rgba(247,248,250,0.9); box-shadow: 0 0 0 1px rgba(11,16,32,0.1);
    font: 600 17px/1 "Inter Variable", sans-serif; letter-spacing: 0.01em; color: #334155; }
  .pill::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${COBALT}; margin-right: 10px; vertical-align: 1px; }
`;

function hero(lang) {
  const W = 1600,
    H = 900;
  const css = `
  .bg { position: absolute; inset: 0; }
  .desk { position: absolute; left: 60px; top: 140px; width: 760px; border-radius: 16px; overflow: hidden; background: #fff;
    border: 3px solid ${INK}; box-shadow: 18px 18px 0 rgba(11,16,32,0.10); }
  .desk__bar { height: 34px; display: flex; align-items: center; gap: 9px; padding: 0 14px; border-bottom: 2px solid ${INK}; background: ${TINT}; }
  .desk__bar i { width: 11px; height: 11px; border-radius: 50%; border: 2px solid ${INK}; }
  .desk img { display: block; width: 100%; }
  .phone { position: absolute; width: 250px; padding: 12px; border-radius: 44px; background: ${INK};
    box-shadow: 14px 22px 0 rgba(11,16,32,0.10), 0 30px 50px rgba(11,16,32,0.18); }
  .phone img { display: block; width: 100%; border-radius: 32px; }
  ${PILL_CSS}
  `;
  const bg = `<svg class="bg" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${HATCH_DEFS}</defs>
    <rect width="${W}" height="${H}" fill="${TINT}"/>
    <rect width="${W}" height="${H}" fill="url(#h-fine)" opacity="0.08"/>
    <circle cx="1180" cy="440" r="340" fill="none" stroke="${COBALT}" stroke-width="3" stroke-dasharray="2 12"/>
    <path d="M40 820H1560" stroke="${INK}" stroke-width="3"/><rect x="40" y="824" width="1520" height="40" fill="url(#h-diag)" opacity="0.3"/></svg>`;
  const body = `${bg}
  <div class="pill">${PILL[lang]}</div>
  <div class="desk"><div class="desk__bar"><i></i><i></i><i></i></div><img src="${SHOTS}mgr-02-payments.webp" alt=""></div>
  <div class="phone" style="left:850px;top:210px;z-index:1;transform:rotate(-3deg)"><img src="${SHOTS}op-01-home.webp" alt=""></div>
  <div class="phone" style="left:1070px;top:120px;z-index:2;transform:rotate(2deg)"><img src="${SHOTS}op-03-utilities.webp" alt=""></div>
  <div class="phone" style="left:1290px;top:200px;z-index:3;transform:rotate(5deg)"><img src="${SHOTS}op-02-payments.webp" alt=""></div>
  ${stampHtml({ year: YEAR, position: "left: 6%; bottom: 11%;" })}`;
  return page({ width: W, height: H, css, body });
}

function infographic(lang) {
  const t = T[lang];
  const W = 1200,
    H = 1260;
  const css = `
  .ig { position: absolute; inset: 0; padding: 72px 80px 200px; display: flex; flex-direction: column; gap: 34px; }
  .ig__top { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; }
  .ig__mark { width: 104px; height: 104px; display: block; border-radius: 24px; }
  .ig__kicker { font-size: 20px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${COBALT}; }
  .ig__title { font-size: 56px; font-weight: 750; letter-spacing: -0.025em; line-height: 1.08; margin-top: 8px; text-wrap: balance; }
  .ig__deck { font-size: 26px; color: #334155; margin-top: 8px; }
  .ig__rule { height: 4px; background: ${INK}; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  .pt { border: 2px solid ${INK}; border-radius: 18px; padding: 28px; background: #fff; display: grid; grid-template-columns: 56px 1fr; gap: 18px; }
  .pt__n { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font-size: 26px; font-weight: 800; color: #fff; background: ${COBALT}; }
  .pt__h { font-size: 25px; font-weight: 750; line-height: 1.25; } .pt__t { font-size: 21px; line-height: 1.45; color: #334155; margin-top: 8px; }
  .st__h { font-size: 22px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 14px; }
  .st { display: grid; gap: 14px; } .st__row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: baseline; padding: 18px 0; border-top: 1px solid rgba(11,16,32,0.2); }
  .st__k { font-size: 24px; font-weight: 750; } .st__v { font-size: 22px; line-height: 1.45; color: #334155; }
  .ig__foot { margin-top: auto; font-size: 17px; line-height: 1.45; color: #475569; }
  `;
  const body = `<div class="ig">
    <div class="ig__top">${MARK}<div><p class="ig__kicker">${t.kicker}</p><h1 class="ig__title">${t.title.replace("first-of-the-month", `<span style="white-space:nowrap">first-of-the-month</span>`)}</h1><p class="ig__deck">${t.deck}</p></div></div>
    <div class="ig__rule"></div>
    <div class="grid">${t.points.map(([h, s], i) => `<div class="pt"><span class="pt__n">${i + 1}</span><div><p class="pt__h">${h}</p><p class="pt__t">${s}</p></div></div>`).join("")}</div>
    <div><p class="st__h">${t.statusHead}</p><div class="st">${t.status.map(([k, v]) => `<div class="st__row"><span class="st__k">${k}</span><span class="st__v">${v}</span></div>`).join("")}</div></div>
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
    height: 1260,
    year: YEAR,
    title: T[lang].title,
    html: () => infographic(lang),
  },
]);
