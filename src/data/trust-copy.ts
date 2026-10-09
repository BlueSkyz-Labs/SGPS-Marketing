/**
 * v8 W5a: visitor copy for /security/ and /privacy/ in the four locales.
 * Strings follow docs/superpowers/plans/v8/copy-deck.md rows sec-1..6 and
 * pri-1..5. zh and zh-hant lines are deck suggestions pending native review.
 * Claim and boundary text stays in claims.ts and integrity.ts; this module
 * adds no new fact.
 */
import type { Language } from "@/data/site";

type PerLang<T> = Record<Language, T>;

export interface SourceRef {
  /** Evidence id from the claim's evidenceIds. */
  id: string;
  label: string;
}

export interface SecurityCopy {
  title: string;
  lede: string;
  cta: string;
  note: string;
  offerLead: string;
  offerBody: string;
  whyLabel: string;
  whyBody: string;
  limitLabel: string;
  limitBody: string;
  sourcesLabel: string;
  sources: SourceRef[];
  reviewed: string;
  emailLabel: string;
}

export const SECURITY_COPY: PerLang<SecurityCopy> = {
  en: {
    title: "Security",
    lede: "Report security problems privately through GitHub. Do not open a public issue.",
    cta: "Report a vulnerability",
    note: "Only maintainers can see reports.",
    offerLead: "What we do not offer:",
    offerBody:
      "a bug bounty, a response-time commitment or a right to public disclosure. We publish no certification badges without verified evidence.",
    whyLabel: "Why private:",
    whyBody:
      "A public issue publishes the reporter and the defect before anyone can look at either.",
    limitLabel: "Limit:",
    limitBody:
      "This site has no intake service of its own. Reports go to GitHub, not to this site.",
    sourcesLabel: "Sources:",
    sources: [
      {
        id: "ev-security-advisory",
        label: "GitHub private vulnerability reporting",
      },
      { id: "ev-security-route", label: "Security route" },
    ],
    reviewed: "Reviewed",
    emailLabel: "Email",
  },
  vi: {
    title: "Bảo mật",
    lede: "Báo cáo vấn đề bảo mật riêng tư qua GitHub. Đừng mở issue công khai.",
    cta: "Báo cáo lỗ hổng",
    note: "Chỉ người bảo trì xem được.",
    offerLead: "Chúng tôi không cung cấp:",
    offerBody:
      "chương trình thưởng lỗ hổng, cam kết thời gian phản hồi hay quyền công bố công khai. Chúng tôi không đăng huy hiệu chứng nhận nếu chưa có bằng chứng đã kiểm chứng.",
    whyLabel: "Vì sao riêng tư:",
    whyBody:
      "Issue công khai sẽ làm lộ người báo và lỗ hổng trước khi có ai kịp xử lý.",
    limitLabel: "Giới hạn:",
    limitBody:
      "Trang web này không có dịch vụ tiếp nhận riêng. Báo cáo đi tới GitHub, không đến trang này.",
    sourcesLabel: "Nguồn:",
    sources: [
      {
        id: "ev-security-advisory",
        label: "Báo cáo lỗ hổng riêng tư của GitHub",
      },
      { id: "ev-security-route", label: "Trang Bảo mật" },
    ],
    reviewed: "Đã xem xét",
    emailLabel: "Email",
  },
  zh: {
    title: "安全",
    lede: "请通过 GitHub 私下报告安全问题，不要提交公开 issue。",
    cta: "报告漏洞",
    note: "仅维护者可见。",
    offerLead: "我们不提供：",
    offerBody:
      "漏洞赏金、响应时限承诺或公开披露权。没有经核实的证据，我们不发布任何认证标识。",
    whyLabel: "为什么私下：",
    whyBody: "公开 issue 会在任何人查看之前就公布报告者和缺陷。",
    limitLabel: "限制：",
    limitBody: "本站没有自己的接收服务。报告提交到 GitHub，而不是本站。",
    sourcesLabel: "来源：",
    sources: [
      { id: "ev-security-advisory", label: "GitHub 私密漏洞报告" },
      { id: "ev-security-route", label: "安全页面" },
    ],
    reviewed: "审阅于",
    emailLabel: "Email",
  },
  "zh-hant": {
    title: "資訊安全",
    lede: "請透過 GitHub 私下通報資安問題，不要提交公開 issue。",
    cta: "通報漏洞",
    note: "僅維護者可見。",
    offerLead: "我們不提供：",
    offerBody:
      "漏洞賞金、回應時限承諾或公開揭露權。沒有經查證的證據，我們不發布任何認證標章。",
    whyLabel: "為什麼私下：",
    whyBody: "公開 issue 會在任何人檢視之前就公布通報者和缺陷。",
    limitLabel: "限制：",
    limitBody: "本站沒有自己的接收服務。通報提交到 GitHub，而不是本站。",
    sourcesLabel: "來源：",
    sources: [
      { id: "ev-security-advisory", label: "GitHub 私密漏洞通報" },
      { id: "ev-security-route", label: "資訊安全頁面" },
    ],
    reviewed: "審閱於",
    emailLabel: "Email",
  },
};

export interface PrivacyCopy {
  title: string;
  lede: string;
  collectedLead: string;
  collectedBody: string;
  limitsLead: string;
  limitsBody: string;
  deletion: string;
  sourcesLabel: string;
  sources: SourceRef[];
}

export const PRIVACY_COPY: PerLang<PrivacyCopy> = {
  en: {
    title: "Privacy",
    lede: "This site sets no cookies. It stores only the language and theme you choose, in your browser, with no tracking or profiling.",
    collectedLead: "What is collected.",
    collectedBody:
      "No accounts or forms. Server and CDN logs may record technical data such as your IP address, browser type and the page requested. They are used for security, abuse prevention and reliable delivery, not advertising. Logs stay with the hosting operators. This site uses no third-party ad pixels or session-recording scripts.",
    limitsLead: "Limits.",
    limitsBody:
      "This does not mean no data is processed. Any website needs infrastructure that handles network data such as IP addresses and request headers.",
    deletion:
      "There is no account on this site to export or delete. Each product publishes its own privacy practices when it is public. Full legal wording is published when BlueSkyz approves it.",
    sourcesLabel: "Sources:",
    sources: [
      { id: "ev-privacy-route", label: "Privacy route" },
      { id: "ev-security-route", label: "Security route" },
    ],
  },
  vi: {
    title: "Quyền riêng tư",
    lede: "Trang web này không đặt cookie. Chỉ lưu ngôn ngữ và giao diện bạn chọn, trong trình duyệt của bạn; không theo dõi, không lập hồ sơ.",
    collectedLead: "Thu thập gì.",
    collectedBody:
      "Không có tài khoản hay biểu mẫu. Nhật ký máy chủ và CDN có thể ghi dữ liệu kỹ thuật như địa chỉ IP, loại trình duyệt và trang được yêu cầu, dùng cho bảo mật, chống lạm dụng và phân phối ổn định, không phải quảng cáo. Nhật ký do bên vận hành hosting giữ. Trang web này không dùng pixel quảng cáo hay script ghi phiên của bên thứ ba.",
    limitsLead: "Giới hạn.",
    limitsBody:
      "Điều này không có nghĩa là không có dữ liệu nào được xử lý. Mọi trang web đều cần hạ tầng xử lý dữ liệu mạng như địa chỉ IP và header yêu cầu.",
    deletion:
      "Trang web này không có tài khoản nào để xuất hoặc xoá. Mỗi sản phẩm sẽ công bố cách xử lý quyền riêng tư của mình khi được công khai. Văn bản pháp lý đầy đủ sẽ đăng khi được BlueSkyz phê duyệt.",
    sourcesLabel: "Nguồn:",
    sources: [
      { id: "ev-privacy-route", label: "Trang Quyền riêng tư" },
      { id: "ev-security-route", label: "Trang Bảo mật" },
    ],
  },
  zh: {
    title: "隐私",
    lede: "本站不设置 Cookie，只在你的浏览器中保存你选择的语言和主题，不跟踪、不做用户画像。",
    collectedLead: "收集什么。",
    collectedBody:
      "没有账号或表单。服务器和 CDN 日志可能记录技术数据，如 IP 地址、浏览器类型和所访问的页面，用于安全、防滥用和稳定交付，而非广告。日志由托管运营方保管。本站不使用第三方广告像素或会话录制脚本。",
    limitsLead: "限制。",
    limitsBody:
      "这不代表完全不处理任何数据。任何网站都需要基础设施处理 IP 地址、请求标头等网络数据。",
    deletion:
      "本站没有可导出或删除的账号。每款产品公开时会发布各自的隐私做法。完整法律文本经 BlueSkyz 批准后发布。",
    sourcesLabel: "来源：",
    sources: [
      { id: "ev-privacy-route", label: "隐私页面" },
      { id: "ev-security-route", label: "安全页面" },
    ],
  },
  "zh-hant": {
    title: "隱私權",
    lede: "本站不設定 Cookie，只在你的瀏覽器中儲存你選擇的語言與主題，不追蹤、不剖析。",
    collectedLead: "蒐集什麼。",
    collectedBody:
      "沒有帳號或表單。伺服器與 CDN 記錄檔可能記錄技術資料，如 IP 位址、瀏覽器類型和所瀏覽的頁面，用於安全、防濫用和穩定傳送，而非廣告。記錄檔由代管營運方保管。本站不使用第三方廣告像素或工作階段側錄指令碼。",
    limitsLead: "限制。",
    limitsBody:
      "這不代表完全不處理任何資料。任何網站都需要基礎設施處理 IP 位址、請求標頭等網路資料。",
    deletion:
      "本站沒有可匯出或刪除的帳號。每項產品公開時會發布各自的隱私做法。完整法律文本經 BlueSkyz 核准後發布。",
    sourcesLabel: "來源：",
    sources: [
      { id: "ev-privacy-route", label: "隱私權頁面" },
      { id: "ev-security-route", label: "資訊安全頁面" },
    ],
  },
};
