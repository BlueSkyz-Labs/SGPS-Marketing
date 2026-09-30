import type { Language } from "../lib/i18n.ts";

/**
 * Search/social metadata for the pages whose copy is owned here (Copy/SEO
 * Phase 2). Titles are descriptors only: `BaseLayout` appends
 * ` | BlueSkyz Labs` (single separator, brand last) unless the descriptor
 * already names the brand (home). Every sentence restates what the page or the
 * product registry already says; nothing here is a new product fact, and
 * "in development" stays in every product description so previews never imply
 * availability.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export type StaticPageKey =
  "home" | "about" | "contact" | "privacy" | "support";

export const PAGE_META: Record<Language, Record<StaticPageKey, PageMeta>> = {
  vi: {
    home: {
      title: "BlueSkyz Labs | Sổ Trọ, Sổ Tâm – đang phát triển",
      description:
        "BlueSkyz Labs đang xây dựng Sổ Trọ, sổ tay điện tử cho chủ trọ ở Việt Nam, và Sổ Tâm, cuốn nhật ký riêng tư ưu tiên lưu trên máy. Cả hai đang phát triển.",
    },
    about: {
      title: "Giới thiệu",
      description:
        "BlueSkyz Labs xây dựng các sản phẩm phần mềm. Xem chúng tôi đang làm gì và bằng chứng công khai đứng sau những điều chúng tôi nói, để bạn tự kiểm chứng.",
    },
    contact: {
      title: "Liên hệ",
      description:
        "Cách liên hệ BlueSkyz Labs: hiện có kênh báo cáo lỗ hổng bảo mật riêng tư; hộp thư kinh doanh sẽ được đăng tại đây khi được công bố.",
    },
    privacy: {
      title: "Quyền riêng tư",
      description:
        "Trang web này không đặt cookie và chỉ lưu ngôn ngữ, giao diện do bạn chọn trong trình duyệt. Xem chúng tôi thu thập gì và không thu thập gì.",
    },
    support: {
      title: "Hỗ trợ",
      description:
        "Cách nhận trợ giúp: mỗi sản phẩm ghi kênh hỗ trợ riêng ngay trên trang của sản phẩm. Hiện chưa công bố hộp thư hỗ trợ chung.",
    },
  },
  en: {
    home: {
      title: "BlueSkyz Labs | Sổ Trọ and Sổ Tâm, in development",
      description:
        "BlueSkyz Labs is building Sổ Trọ, a digital notebook for landlords in Vietnam, and Sổ Tâm, a private local-first journal. Both are in development.",
    },
    about: {
      title: "About us",
      description:
        "BlueSkyz Labs builds software products. See what we are building now and the public evidence behind what we say, so you can check it yourself.",
    },
    contact: {
      title: "Contact",
      description:
        "How to reach BlueSkyz Labs: private vulnerability reporting for security issues today, and a business mailbox once one is published.",
    },
    privacy: {
      title: "Privacy",
      description:
        "This site sets no cookies and stores only the language and theme you choose, in your browser. See what we collect and what we do not.",
    },
    support: {
      title: "Support",
      description:
        "Where to get help: each product lists its own support route on its page. No general support mailbox has been published yet.",
    },
  },
  zh: {
    home: {
      title: "BlueSkyz Labs | Sổ Trọ、Sổ Tâm",
      description:
        "BlueSkyz Labs 正在打造两款产品：面向越南房东的电子记事本 Sổ Trọ，以及本地优先的私密日记 Sổ Tâm。两款产品均在开发中。",
    },
    about: {
      title: "关于我们",
      description:
        "BlueSkyz Labs 打造软件产品。了解我们目前在做什么，以及我们所说内容背后的公开依据，方便你自行核实。",
    },
    contact: {
      title: "联系我们",
      description:
        "如何联系 BlueSkyz Labs：目前可通过私密漏洞报告通道反馈安全问题；商务邮箱公布后将在此列出。",
    },
    privacy: {
      title: "隐私",
      description:
        "本站不设置 Cookie，仅在你的浏览器中保存你主动选择的语言与主题。了解我们收集什么、不收集什么。",
    },
    support: {
      title: "帮助与支持",
      description:
        "如何获得帮助：每款产品在自己的页面列出专属支持入口；目前尚未公布通用支持邮箱。安全漏洞请走私密报告通道，而非支持渠道。",
    },
  },
  "zh-hant": {
    home: {
      title: "BlueSkyz Labs | Sổ Trọ、Sổ Tâm",
      description:
        "BlueSkyz Labs 正在打造兩項產品：給越南房東的數位記事本 Sổ Trọ，以及本機優先的私密日記 Sổ Tâm。兩項產品都還在開發中。",
    },
    about: {
      title: "關於我們",
      description:
        "BlueSkyz Labs 打造軟體產品。了解我們目前在做什麼，以及我們所說內容背後的公開依據，方便你自行查證。",
    },
    contact: {
      title: "聯絡我們",
      description:
        "如何聯絡 BlueSkyz Labs：目前可透過私密漏洞通報管道回報資安問題；商務電子信箱公布後將在此列出。",
    },
    privacy: {
      title: "隱私權",
      description:
        "本站不設定 Cookie，只在你的瀏覽器中儲存你主動選擇的語言與主題。了解我們蒐集什麼、不蒐集什麼。",
    },
    support: {
      title: "協助與支援",
      description:
        "如何取得協助：每項產品在自己的頁面列出專屬支援管道；目前尚未公布通用支援信箱。資安漏洞請走私密通報管道，而非支援管道。",
    },
  },
};

/** Product profile pages, keyed by registry slug then locale. */
export const PRODUCT_META: Record<string, Record<Language, PageMeta>> = {
  sotro: {
    vi: {
      title: "Sổ Trọ – sổ tay điện tử cho chủ trọ",
      description:
        "Sổ Trọ giúp chủ trọ nắm phòng, tiền phòng chưa thu, tiền điện nước theo chỉ số công tơ và biên nhận. Đang phát triển; ảnh chụp từ bản thử, dữ liệu minh hoạ.",
    },
    en: {
      title: "Sổ Trọ: a digital notebook for landlords",
      description:
        "Sổ Trọ is a Vietnam-first digital notebook for landlords: rooms, unpaid rent, utility charges from meter readings and receipts. In development.",
    },
    zh: {
      title: "Sổ Trọ：房东电子记事本",
      description:
        "Sổ Trọ 是面向越南房东的电子记事本：房间、未收房租、按电表水表读数计算的费用与收据。开发中，截图来自使用演示数据的开发版本。",
    },
    "zh-hant": {
      title: "Sổ Trọ：房東數位記事本",
      description:
        "Sổ Trọ 是給越南房東的數位記事本：房間、未收租金、依電表水表度數計算的費用與收據。開發中，畫面來自使用示範資料的開發版本。",
    },
  },
  sotam: {
    vi: {
      title: "Sổ Tâm – nhật ký riêng tư",
      description:
        "Sổ Tâm là cuốn nhật ký ưu tiên lưu trên máy, để bạn viết ra suy nghĩ riêng tư và giữ lại kỷ niệm. Bạn tự xuất bài viết ra máy. Đang phát triển.",
    },
    en: {
      title: "Sổ Tâm: a private, local-first journal",
      description:
        "Sổ Tâm is a local-first journal for writing private reflections and keeping personal memories, with local export you control. In development.",
    },
    zh: {
      title: "Sổ Tâm：本地优先的私密日记",
      description:
        "Sổ Tâm 是本地优先的日记，用来写下私密的所思所想、留住个人回忆，并可自行导出到本地。目前在开发中。",
    },
    "zh-hant": {
      title: "Sổ Tâm：本機優先的私密日記",
      description:
        "Sổ Tâm 是本機優先的日記，用來寫下私密的所思所想、留住個人回憶，並可自行匯出到本機。目前仍在開發中。",
    },
  },
};

/** Sổ Trọ getting-started guide, keyed by registry slug then locale. */
export const GUIDE_META: Record<string, Record<Language, PageMeta>> = {
  sotro: {
    vi: {
      title: "Bắt đầu với Sổ Trọ (bản đang phát triển)",
      description:
        "Hướng dẫn từng bước cho bản Sổ Trọ đang phát triển: tạo dãy trọ, ghép điện thoại cho người nhà, ghi điện nước và thu tiền phòng. Các bước có thể thay đổi.",
    },
    en: {
      title: "Sổ Trọ getting-started guide",
      description:
        "Step-by-step guide to the Sổ Trọ development build: set up a building, pair family phones, record meter readings and collect rent. Steps may change.",
    },
    zh: {
      title: "Sổ Trọ 入门指南",
      description:
        "Sổ Trọ 开发版分步指南：创建楼栋、为家人配对手机、记录水电表读数并收租。正式发布前步骤可能调整。",
    },
    "zh-hant": {
      title: "Sổ Trọ 入門指南",
      description:
        "Sổ Trọ 開發版的逐步指南：建立房舍、為家人配對手機、記錄水電表度數並收租。正式發布前步驟可能調整。",
    },
  },
};

export function productMeta(
  slug: string,
  lang: Language,
  fallback: PageMeta,
): PageMeta {
  return PRODUCT_META[slug]?.[lang] ?? fallback;
}

export function guideMeta(
  slug: string,
  lang: Language,
  fallback: PageMeta,
): PageMeta {
  return GUIDE_META[slug]?.[lang] ?? fallback;
}
