import type { Language } from "@/data/site";
import type { ProductEntry } from "@/lib/products";
import { productCopy } from "@/lib/product-copy";

/**
 * v8 W3: visible copy of a product profile page, from the v8 copy deck
 * (sro-*, stm-*). zh and zh-hant lines are deck suggestions and stay NOT
 * VERIFIED for native review.
 *
 * v12 S2: the Sổ Trọ lead is the customer outcome (rent, meter readings and
 * receipts per room in one notebook), built only from the record's jobs and
 * capabilities; the list below gives the detail and the screens the proof.
 *
 * The record fields (`shortDescription`, `jobs`, `capabilities`) are canonical
 * claim/proof bindings; `jobs`/`capabilities` are mirrored against the vendored
 * upstream profile, so the five "What it does" lines live here for every
 * language instead of in the record.
 */
type ProductData = ProductEntry["data"];

const DECK: Record<
  string,
  Record<Language, { oneLiner: string; whatItDoes: string[] }>
> = {
  sotro: {
    en: {
      oneLiner:
        "Rent, meter readings and receipts for every room, in one notebook made for landlords in Vietnam.",
      whatItDoes: [
        "See who has not paid this month and what needs doing today",
        "Keep room, tenant, meter and monthly charge records",
        "Electricity bills from meter readings, with each tier shown",
        "Receipts, with a separate step to confirm money received",
        "Zalo or SMS reminder text to copy; nothing is sent automatically",
      ],
    },
    vi: {
      oneLiner:
        "Tiền thuê, điện nước và biên nhận của từng phòng, gọn trong một cuốn sổ dành cho chủ trọ ở Việt Nam.",
      whatItDoes: [
        "Xem tháng này còn ai chưa đóng tiền và hôm nay cần lo việc gì",
        "Ghi lại phòng, người thuê, số điện nước và các khoản thu hằng tháng",
        "Tính tiền điện từ số công tơ, hiện rõ từng bậc giá",
        "Có biên nhận, và một bước xác nhận riêng trước khi ghi nhận tiền đã nhận",
        "Tin nhắn nhắc kiểu Zalo hoặc SMS để sao chép; không tự động gửi",
      ],
    },
    zh: {
      oneLiner:
        "每个房间的房租、水电表读数和收据，都记在一本为越南房东打造的记事本里。",
      whatItDoes: [
        "查看本月谁还没付款、今天要处理什么",
        "记录房间、租客、水电表和每月费用",
        "根据电表读数计算电费，并列出每一档",
        "提供收据；确认收款需单独一步",
        "可复制的 Zalo 或短信提醒文字；不会自动发送",
      ],
    },
    "zh-hant": {
      oneLiner:
        "每個房間的租金、水電表度數和收據，都記在一本為越南房東打造的記事本裡。",
      whatItDoes: [
        "查看本月誰還沒付款、今天要處理什麼",
        "記錄房間、房客、水電表和每月費用",
        "依電表度數計算電費，並列出每一級",
        "提供收據；確認收款需獨立一步",
        "可複製的 Zalo 或簡訊提醒文字；不會自動傳送",
      ],
    },
  },
  sotam: {
    en: {
      oneLiner: "A private, local-first journal for reflections and memories.",
      whatItDoes: [
        "Write private reflections at your own pace",
        "Reread your entries and memories",
        "Local-first writing in a private Personal Vault",
        "Export your reflections to your device, when you choose",
        "Private Vault storage with clearly defined recovery limits",
      ],
    },
    vi: {
      oneLiner:
        "Cuốn nhật ký riêng tư, ưu tiên lưu trên máy, để viết suy nghĩ và giữ kỷ niệm.",
      whatItDoes: [
        "Viết suy nghĩ riêng tư theo nhịp của bạn",
        "Đọc lại nhật ký và kỷ niệm",
        "Nhật ký ưu tiên lưu trên máy, trong Personal Vault riêng tư",
        "Tự xuất bài viết ra máy khi bạn muốn",
        "Lưu trong Vault riêng tư, với giới hạn khôi phục được nêu rõ",
      ],
    },
    zh: {
      oneLiner: "私密、本地优先的日记，用来写下所思所想、留住回忆。",
      whatItDoes: [
        "按自己的节奏写下私密想法",
        "重读自己的日记与回忆",
        "在私有的 Personal Vault 中本地优先写作",
        "在你需要时把日记导出到你的设备",
        "私有 Vault 存储，恢复范围有明确界定",
      ],
    },
    "zh-hant": {
      oneLiner: "私密、本機優先的日記，用來寫下所思所想、留住回憶。",
      whatItDoes: [
        "按自己的節奏寫下私密想法",
        "重讀自己的日記與回憶",
        "在私有的 Personal Vault 中以本機優先的方式寫作",
        "在你需要時把日記匯出到你的裝置",
        "私有 Vault 儲存，復原範圍有明確界定",
      ],
    },
  },
};

/** At most five plain statements, so the page never turns back into a data sheet. */
export const WHAT_IT_DOES_MAX = 5;

export function productPageCopy(data: ProductData, lang: Language) {
  const deck = DECK[data.slug]?.[lang];
  const copy = productCopy(data, lang);
  return {
    oneLiner: deck?.oneLiner ?? copy.shortDescription,
    whatItDoes: (
      deck?.whatItDoes ?? [...copy.jobs, ...copy.capabilities]
    ).slice(0, WHAT_IT_DOES_MAX),
  };
}

type Strings = Record<Language, string>;
const S = (en: string, vi: string, zh: string, zhHant: string): Strings => ({
  en,
  vi,
  zh,
  "zh-hant": zhHant,
});

export const PAGE_LABELS = {
  // sro-2
  seeScreens: S(
    "See the screens",
    "Xem các màn hình",
    "查看界面截图",
    "查看畫面截圖",
  ),
  // sro-3 (glossary 5.3 for vi)
  signIn: S(
    "Already have an account? Sign in",
    "Đã có tài khoản? Đăng nhập",
    "老用户登录",
    "既有使用者登入",
  ),
  // sro-8 / stm-8 heading
  whatItDoes: S("What it does", "Tính năng", "功能", "功能"),
  // sro-14
  artCaption: S(
    "Brand artwork, not an app screenshot.",
    "Hình ảnh thương hiệu, không phải ảnh chụp ứng dụng.",
    "品牌插图，并非应用截图。",
    "品牌視覺素材，並非應用程式截圖。",
  ),
  // Localized identity-artwork alt suffix (a11y: the record's media.alt is
  // English-only; callers compose `${productName} — ${artIdentity[lang]}`).
  artIdentity: S(
    "brand identity artwork",
    "hình ảnh nhận diện thương hiệu",
    "品牌标识图",
    "品牌標識圖",
  ),
  // sro-15 / stm-9
  privacy: S("Privacy", "Quyền riêng tư", "隐私", "隱私權"),
  security: S("Security", "Bảo mật", "安全", "資訊安全"),
  support: S("Support", "Hỗ trợ", "帮助与支持", "協助與支援"),
} as const;

/** Availability line (sro-5 / stm-4 and the platform "Web" of sro-7). */
export const AVAILABILITY = {
  label: S("Availability", "Tình trạng", "可用情况", "可用情況"),
  web: S("Web", "Web", "网页", "網頁"),
  inDevelopment: S("in development", "đang phát triển", "开发中", "開發中"),
  native: S(
    "Android and iOS",
    "Android và iOS",
    "Android 与 iOS",
    "Android 與 iOS",
  ),
  noStore: S(
    "no store release",
    "chưa có bản trên cửa hàng ứng dụng",
    "尚未上架应用商店",
    "尚未上架應用程式商店",
  ),
  colon: S(": ", ": ", "：", "："),
} as const;
