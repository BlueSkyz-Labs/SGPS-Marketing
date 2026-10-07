import type { LocalizedLabel } from "@/data/site";

/**
 * Experience v6 S8 — short composition labels for the honest empty states
 * (Contact, About, profiles without captures). These are labels only: no
 * capability, contact, founder or availability claim lives here. Every entry
 * not already present in `SHARED_LABELS`/authored copy is a short derived
 * translation flagged for native review in the slice PR.
 */
export const EMPTY_STATE_COPY = {
  contactLede: {
    en: "No business mailbox is published yet. We will list it here once it is approved.",
    vi: "Chưa có hộp thư công việc được công bố. Chúng tôi sẽ đăng tại đây khi được phê duyệt.",
    zh: "商务邮箱尚未公布。获批后将在此列出。",
    "zh-hant": "商務電子信箱尚未公布。核准後將在此列出。",
  },
  signInHeading: {
    en: "Product sign-in",
    vi: "Đăng nhập sản phẩm",
    zh: "产品登录",
    "zh-hant": "產品登入",
  },
  signInBody: {
    en: "Already using a product? Go straight to its sign-in.",
    vi: "Đã dùng một sản phẩm? Vào thẳng trang đăng nhập của sản phẩm.",
    zh: "已在使用某款产品？直接前往其登录页。",
    "zh-hant": "已在使用某款產品？直接前往其登入頁。",
  },
  notPublished: {
    en: "Not yet published",
    vi: "Chưa công bố",
    zh: "尚未公布",
    "zh-hant": "尚未公布",
  },
  businessPending: {
    en: "Published here once approved.",
    vi: "Sẽ được công bố tại đây khi được phê duyệt.",
    zh: "获批后在此公布。",
    "zh-hant": "核准後於此公布。",
  },
  aboutCheck: {
    en: "What you can check",
    vi: "Bạn có thể tự kiểm chứng",
    zh: "你可以自行核实",
    "zh-hant": "你可以自行查證",
  },
  aboutCheckNoCookies: {
    en: "This site sets no cookies.",
    vi: "Trang web này không đặt cookie.",
    zh: "本站不设置 Cookie。",
    "zh-hant": "本站不設定 Cookie。",
  },
  aboutCheckSecurity: {
    en: "Security reports go through a private GitHub channel.",
    vi: "Báo cáo bảo mật được gửi qua kênh GitHub riêng tư.",
    zh: "安全报告通过 GitHub 私有渠道提交。",
    "zh-hant": "資安通報透過 GitHub 私有管道提交。",
  },
  aboutCheckCta: {
    en: "See our claims and sources",
    vi: "Xem các tuyên bố và nguồn",
    zh: "查看我们的声明与依据",
    "zh-hant": "查看我們的聲明與依據",
  },
  aboutWhatWeMake: {
    en: "What we are building",
    vi: "Chúng tôi đang xây dựng",
    zh: "我们正在打造",
    "zh-hant": "我們正在打造",
  },
  // Owner-confirmed entity facts (E-26 resolved 2026-10-07, #523). The label
  // is derived translation flagged for native review; the facts themselves
  // come from the `pages` collection, never from this file.
  aboutFounded: {
    en: "Founded",
    vi: "Thành lập",
    zh: "成立于",
    "zh-hant": "成立於",
  },
  noCaptures: {
    en: "No app screenshots are published yet.",
    vi: "Chưa có ảnh chụp giao diện ứng dụng nào được công bố.",
    zh: "尚未公布任何应用截图。",
    "zh-hant": "尚未公布任何應用程式截圖。",
  },
  ladderCurrent: {
    en: "Current stage",
    vi: "Giai đoạn hiện tại",
    zh: "当前阶段",
    "zh-hant": "目前階段",
  },
} as const satisfies Record<string, LocalizedLabel>;

