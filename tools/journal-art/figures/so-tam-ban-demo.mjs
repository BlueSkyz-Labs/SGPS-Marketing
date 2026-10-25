/**
 * Art for "so-tam-ban-demo". The lead image composes real Sổ Tâm
 * screenshots (captured 2026-10-25 from a development build with sample answers);
 * the infographic restates the post body.
 */
import { readFileSync } from "node:fs";
import { COBALT, HATCH_DEFS, INK, TINT, page } from "../art-base.mjs";
import { stampHtml } from "../stamp.mjs";

const POST = "so-tam-ban-demo";
const YEAR = 2026;
const SHOTS = new URL(
  "../../../public/products/sotam/showcase/",
  import.meta.url,
).href;
const MARK = readFileSync(
  new URL(
    "../../../public/brand/blueskyz/v4/products/sotam.svg",
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
    heroTitle: "Sổ Tâm trên điện thoại",
    kicker: "Tóm tắt bài viết",
    title: "Sổ Tâm, bản demo",
    deck: "Một trang viết riêng, theo nhịp của bạn.",
    points: [
      [
        "Bắt đầu không cần tài khoản",
        "Ứng dụng nói rõ bản viết trên web lưu ở đâu.",
      ],
      [
        "Viết một trang",
        "Trang Hôm nay ghi ngày kèm tiết khí; bản viết được lưu trên thiết bị.",
      ],
      [
        "Gọi tên cảm xúc, nếu muốn",
        "Tâm trạng và điểm chạm là chữ, không bắt buộc.",
      ],
      [
        "Nhìn lại",
        "Ghi chép và Ký ức giữ các trang theo tháng; đang ở dạng xem trước.",
      ],
    ],
    statusHead: "Hiện trạng",
    status: [
      [
        "Web",
        "Bản demo đang hoàn thiện; bản viết lưu trong trình duyệt, chưa mã hóa, chưa đồng bộ.",
      ],
      ["Android, iOS", "Đang phát triển, chưa có trên cửa hàng ứng dụng."],
    ],
    footer:
      "Ảnh màn hình chụp ngày 25/10/2026 từ bản đang phát triển, dùng nội dung mẫu.",
  },
  en: {
    heroTitle: "Sổ Tâm on a phone",
    kicker: "Article summary",
    title: "Sổ Tâm demo",
    deck: "A private page to write on, at your own pace.",
    points: [
      ["Start without an account", "The app says where web writing is stored."],
      [
        "Write a page",
        "The Today page shows the date with the solar term; writing is saved on the device.",
      ],
      [
        "Name a feeling, if you want",
        "Moods and touchpoints are words, all optional.",
      ],
      [
        "Look back",
        "Journal and Memories keep pages by month; both are previews.",
      ],
    ],
    statusHead: "Where it stands",
    status: [
      [
        "Web",
        "A demo still being finished; writing stays in the browser, not yet encrypted or synced.",
      ],
      ["Android, iOS", "In development, not in the app stores."],
    ],
    footer:
      "Screenshots captured on 25 October 2026 from a development build with sample text.",
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
  .phone { position: absolute; width: 270px; padding: 12px; border-radius: 44px; background: ${INK};
    box-shadow: 14px 22px 0 rgba(11,16,32,0.10), 0 30px 50px rgba(11,16,32,0.18); }
  .phone img { display: block; width: 100%; border-radius: 32px; }
  ${PILL_CSS}
  `;
  const bg = `<svg class="bg" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${HATCH_DEFS}</defs>
    <rect width="${W}" height="${H}" fill="${TINT}"/>
    <rect width="${W}" height="${H}" fill="url(#h-fine)" opacity="0.08"/>
    <circle cx="800" cy="440" r="380" fill="none" stroke="${COBALT}" stroke-width="3" stroke-dasharray="2 12"/>
    <path d="M40 820H1560" stroke="${INK}" stroke-width="3"/><rect x="40" y="824" width="1520" height="40" fill="url(#h-diag)" opacity="0.3"/></svg>`;
  const shots = [
    ["sotam-01-welcome.webp", 130, 190, -7, 1],
    ["sotam-02-write.webp", 355, 120, -3.5, 1],
    ["sotam-03-mood-touchpoints.webp", 665, 70, 0, 1.08],
    ["sotam-04-journal.webp", 975, 120, 3.5, 1],
    ["sotam-05-memories.webp", 1200, 190, 7, 1],
  ];
  const phones = shots
    .map(
      ([f, x, y, r, s], i) =>
        `<div class="phone" style="left:${x}px;top:${y}px;z-index:${i === 2 ? 5 : 4 - Math.abs(i - 2)};transform:rotate(${r}deg) scale(${s})"><img src="${SHOTS}${f}" alt=""></div>`,
    )
    .join("");
  const body = `${bg}
  <div class="pill">${PILL[lang]}</div>
  ${phones}
  ${stampHtml({ year: YEAR, position: "left: 50%; bottom: 3.4%; transform: translateX(-50%);" })}`;
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
  .ig__title { font-size: 56px; font-weight: 750; letter-spacing: -0.025em; line-height: 1.08; margin-top: 8px; }
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
    <div class="ig__top">${MARK}<div><p class="ig__kicker">${t.kicker}</p><h1 class="ig__title">${t.title}</h1><p class="ig__deck">${t.deck}</p></div></div>
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
