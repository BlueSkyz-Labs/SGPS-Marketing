/**
 * Plain-language copy for the public architecture explainer.
 *
 * Every statement is derived from `architecture/sgps-model.json` (entities,
 * relationships, trust boundaries, data classification and the model's own
 * "not applicable" note). Nothing here adds a capability, guarantee, vendor
 * claim or number the model does not state. The machine adapter
 * (`src/lib/public-architecture.ts`) stays authoritative for *which* entities
 * are public; this file only humanizes them for a non-technical visitor.
 *
 * The map is fail-closed: `humanNode` / `humanBoundary` / `humanEdge` throw at
 * build time when the model gains an entity, boundary or relationship type that
 * has no localized label, so a raw slug can never reach a visitor.
 */
import type { PublicLens } from "@/lib/public-architecture";
import type { Language } from "@/lib/i18n";

export interface NodeCopy {
  label: string;
  blurb: string;
}

export interface LensCopy {
  /** Short label used in the in-page navigation. */
  nav: string;
  heading: string;
  intro: string;
}

export interface ArchitectureCopy {
  title: string;
  description: string;
  lede: string;
  nav: string;
  parts: string;
  connections: string;
  noConnections: string;
  lastVerified: string;
  verifyLink: string;
  technical: {
    summary: string;
    hint: string;
    parts: string;
    connections: string;
  };
  lenses: Record<PublicLens, LensCopy>;
  kinds: Record<string, string>;
  nodes: Record<string, NodeCopy>;
  boundaries: Record<string, string>;
  edges: Record<string, string>;
}

export const ARCHITECTURE_COPY: Record<Language, ArchitectureCopy> = {
  en: {
    title: "Architecture",
    description:
      "How this website is built and served, explained in plain language and derived from our public architecture model.",
    lede: "How this website is built and served, explained in plain language. Everything below comes from the project's public architecture model.",
    nav: "Sections",
    parts: "The parts",
    connections: "How they connect",
    noConnections: "This view does not describe any connection between parts.",
    lastVerified: "Last checked against the architecture model",
    verifyLink: "Check our claims on the Verify page",
    technical: {
      summary: "Technical names",
      hint: "The exact identifiers from the architecture model, for people who want to check this page against it.",
      parts: "Parts",
      connections: "Connections",
    },
    lenses: {
      system: {
        nav: "Build and serve",
        heading: "How the site is built and served",
        intro:
          "The website is a set of static pages that read a public product list and are delivered from Cloudflare. This is how the parts fit together.",
      },
      data: {
        nav: "Data",
        heading: "What data it handles (and doesn't)",
        intro:
          "The only data resource in the model is the public product list. Sign-in, an application API, a database, a queue, a transaction store, tenant isolation and session controls are marked not applicable for this static site, not assumed to pass.",
      },
      trust: {
        nav: "Trust boundaries",
        heading: "Trust boundaries",
        intro:
          "Every part sits inside a boundary. Some parts are ours; others belong to outside services the site depends on: GitHub, the npm Registry and Cloudflare.",
      },
      recovery: {
        nav: "Recovery",
        heading: "Recovery",
        intro:
          "This view shows what the live site runs on: the production deployment and the Cloudflare hosting it is deployed to. The model does not describe a backup or restore procedure.",
      },
      evidence: {
        nav: "Evidence",
        heading: "Where the evidence lives",
        intro:
          "Two parts exist to check the site: a claims check that runs while the site is built, and automated source checks on GitHub. Evidence for individual claims is on the Verify page.",
      },
    },
    kinds: {
      Portfolio: "Organization",
      Domain: "Area",
      System: "Website",
      Component: "Part",
      DataResource: "Data",
      ExternalDependency: "Outside service",
      Deployment: "Deployment",
      InfrastructureResource: "Hosting",
    },
    nodes: {
      "portfolio.blueskyz-labs": {
        label: "BlueSkyz Labs",
        blurb: "The organization that owns the website.",
      },
      "domain.corporate-web": {
        label: "Corporate web",
        blurb: "The public web area this website belongs to.",
      },
      "system.sgps-marketing": {
        label: "This website",
        blurb: "The public BlueSkyz Labs website you are reading.",
      },
      "component.astro-static-site": {
        label: "Static site pages",
        blurb: "The ready-made pages sent to your browser.",
      },
      "component.public-truth-gate": {
        label: "Claims check at build time",
        blurb: "Validates the public product list while the site is built.",
      },
      "component.source-assurance": {
        label: "Automated source checks",
        blurb: "Checks that run on GitHub with read-only access.",
      },
      "data.product-registry": {
        label: "Public product list",
        blurb:
          "The products the site may show. It is public information, and the owner decides what is published.",
      },
      "infra.cloudflare-worker": {
        label: "Cloudflare static hosting",
        blurb: "Serves the site's static files from Cloudflare's global edge.",
      },
      "external.github": {
        label: "GitHub",
        blurb: "An outside service the site depends on for its source code.",
      },
      "external.npm-registry": {
        label: "npm Registry",
        blurb:
          "An outside service the site depends on for public software packages.",
      },
      "external.cloudflare": {
        label: "Cloudflare",
        blurb: "An outside service the site depends on to deliver its pages.",
      },
      "deployment.production": {
        label: "Live site deployment",
        blurb: "The production deployment that visitors reach.",
      },
    },
    boundaries: {
      organizational: "Inside the organization",
      "public-internet": "Open to the public internet",
      "github-source-build-to-cloudflare-edge":
        "From the source and build on GitHub to Cloudflare's edge",
      "browser-visible-static-output": "Static output a browser can see",
      "build-time-truth-validation": "Checked while the site is built",
      "github-actions-read-only": "GitHub automation, read-only",
      "repository-content": "Content kept in the code repository",
      "cloudflare-edge": "Cloudflare's edge network",
      "external-scm": "Outside: source hosting",
      "external-package-registry": "Outside: package registry",
      "external-edge-provider": "Outside: edge provider",
      "cloudflare-production": "Cloudflare production",
    },
    edges: {
      contains: "contains",
      reads: "reads",
      validates: "checks",
      assures: "assures",
      depends_on: "relies on",
      deploys_to: "is deployed to",
    },
  },
  vi: {
    title: "Kiến trúc",
    description:
      "Trang web này được xây dựng và vận hành ra sao, giải thích dễ hiểu và lấy từ mô hình kiến trúc công khai của chúng tôi.",
    lede: "Trang web này được xây dựng và vận hành ra sao, giải thích dễ hiểu. Mọi nội dung bên dưới đều lấy từ mô hình kiến trúc công khai của dự án.",
    nav: "Các phần",
    parts: "Các thành phần",
    connections: "Chúng kết nối thế nào",
    noConnections: "Phần này không mô tả kết nối nào giữa các thành phần.",
    lastVerified: "Đối chiếu gần nhất với mô hình kiến trúc",
    verifyLink: "Kiểm chứng các tuyên bố của chúng tôi tại trang Xác minh",
    technical: {
      summary: "Tên kỹ thuật",
      hint: "Các mã định danh chính xác trong mô hình kiến trúc, dành cho những ai muốn đối chiếu trang này với mô hình.",
      parts: "Thành phần",
      connections: "Kết nối",
    },
    lenses: {
      system: {
        nav: "Xây dựng và vận hành",
        heading: "Trang web được xây dựng và vận hành ra sao",
        intro:
          "Trang web là một tập hợp trang tĩnh, đọc danh sách sản phẩm công khai và được phục vụ qua Cloudflare. Dưới đây là cách các thành phần ghép với nhau.",
      },
      data: {
        nav: "Dữ liệu",
        heading: "Trang web xử lý dữ liệu gì (và không xử lý gì)",
        intro:
          "Tài nguyên dữ liệu duy nhất trong mô hình là danh sách sản phẩm công khai. Đăng nhập, API ứng dụng, cơ sở dữ liệu, hàng đợi, kho giao dịch, tách biệt dữ liệu giữa các khách hàng và kiểm soát phiên được ghi rõ là không áp dụng cho trang tĩnh này, chứ không được coi là đã đáp ứng.",
      },
      trust: {
        nav: "Ranh giới tin cậy",
        heading: "Ranh giới tin cậy",
        intro:
          "Mỗi thành phần nằm trong một ranh giới. Một số thuộc về chúng tôi; số khác thuộc các dịch vụ bên ngoài mà trang web phụ thuộc: GitHub, npm Registry và Cloudflare.",
      },
      recovery: {
        nav: "Khôi phục",
        heading: "Khôi phục",
        intro:
          "Phần này cho thấy trang web đang chạy trên nền tảng nào: bản triển khai chính thức và dịch vụ lưu trữ Cloudflare nơi nó được triển khai. Mô hình không mô tả quy trình sao lưu hay khôi phục.",
      },
      evidence: {
        nav: "Bằng chứng",
        heading: "Bằng chứng nằm ở đâu",
        intro:
          "Hai thành phần có nhiệm vụ kiểm tra trang web: bước kiểm tra tuyên bố chạy khi dựng trang, và các bước kiểm tra mã nguồn tự động trên GitHub. Bằng chứng cho từng tuyên bố nằm ở trang Xác minh.",
      },
    },
    kinds: {
      Portfolio: "Tổ chức",
      Domain: "Lĩnh vực",
      System: "Trang web",
      Component: "Thành phần",
      DataResource: "Dữ liệu",
      ExternalDependency: "Dịch vụ bên ngoài",
      Deployment: "Bản triển khai",
      InfrastructureResource: "Lưu trữ",
    },
    nodes: {
      "portfolio.blueskyz-labs": {
        label: "BlueSkyz Labs",
        blurb: "Tổ chức sở hữu trang web.",
      },
      "domain.corporate-web": {
        label: "Web doanh nghiệp",
        blurb: "Lĩnh vực web công khai mà trang web này thuộc về.",
      },
      "system.sgps-marketing": {
        label: "Trang web này",
        blurb: "Trang web công khai của BlueSkyz Labs mà bạn đang đọc.",
      },
      "component.astro-static-site": {
        label: "Các trang tĩnh",
        blurb: "Những trang dựng sẵn được gửi tới trình duyệt của bạn.",
      },
      "component.public-truth-gate": {
        label: "Kiểm tra tuyên bố khi dựng trang",
        blurb:
          "Xác thực danh sách sản phẩm công khai trong lúc trang web được dựng.",
      },
      "component.source-assurance": {
        label: "Kiểm tra nguồn tự động",
        blurb: "Các bước kiểm tra chạy trên GitHub, chỉ có quyền đọc.",
      },
      "data.product-registry": {
        label: "Danh sách sản phẩm công khai",
        blurb:
          "Các sản phẩm mà trang web có thể hiển thị. Đây là thông tin công khai, và chủ sở hữu quyết định nội dung được công bố.",
      },
      "infra.cloudflare-worker": {
        label: "Lưu trữ tĩnh trên Cloudflare",
        blurb:
          "Phục vụ các tệp tĩnh của trang web từ mạng biên toàn cầu của Cloudflare.",
      },
      "external.github": {
        label: "GitHub",
        blurb: "Dịch vụ bên ngoài mà trang web phụ thuộc để lưu mã nguồn.",
      },
      "external.npm-registry": {
        label: "npm Registry",
        blurb:
          "Dịch vụ bên ngoài mà trang web phụ thuộc để lấy các gói phần mềm công khai.",
      },
      "external.cloudflare": {
        label: "Cloudflare",
        blurb: "Dịch vụ bên ngoài mà trang web phụ thuộc để phục vụ các trang.",
      },
      "deployment.production": {
        label: "Bản triển khai chính thức",
        blurb: "Bản triển khai chính thức mà khách truy cập tiếp cận.",
      },
    },
    boundaries: {
      organizational: "Trong nội bộ tổ chức",
      "public-internet": "Hướng ra internet công cộng",
      "github-source-build-to-cloudflare-edge":
        "Từ mã nguồn và bản dựng trên GitHub tới mạng biên của Cloudflare",
      "browser-visible-static-output": "Đầu ra tĩnh mà trình duyệt nhìn thấy",
      "build-time-truth-validation": "Được kiểm tra khi trang được dựng",
      "github-actions-read-only": "Tự động hóa GitHub, chỉ đọc",
      "repository-content": "Nội dung lưu trong kho mã nguồn",
      "cloudflare-edge": "Mạng biên của Cloudflare",
      "external-scm": "Bên ngoài: nơi lưu mã nguồn",
      "external-package-registry": "Bên ngoài: kho gói phần mềm",
      "external-edge-provider": "Bên ngoài: nhà cung cấp mạng biên",
      "cloudflare-production": "Môi trường chính thức trên Cloudflare",
    },
    edges: {
      contains: "bao gồm",
      reads: "đọc",
      validates: "kiểm tra",
      assures: "bảo đảm cho",
      depends_on: "phụ thuộc vào",
      deploys_to: "được triển khai tới",
    },
  },
  zh: {
    title: "架构",
    description:
      "用通俗语言说明本网站如何构建与提供服务，内容派生自我们公开的架构模型。",
    lede: "用通俗语言说明本网站如何构建与提供服务。以下所有内容均来自项目公开的架构模型。",
    nav: "章节",
    parts: "组成部分",
    connections: "它们如何连接",
    noConnections: "此视角没有描述各部分之间的任何连接。",
    lastVerified: "最近一次对照架构模型核验",
    verifyLink: "前往“验证”页面核对我们的说法",
    technical: {
      summary: "技术名称",
      hint: "架构模型中的确切标识符，供希望对照模型核查本页的人使用。",
      parts: "组成部分",
      connections: "连接",
    },
    lenses: {
      system: {
        nav: "构建与提供服务",
        heading: "网站如何构建与提供服务",
        intro:
          "网站由一组静态页面构成，这些页面读取公开的产品清单，并通过 Cloudflare 提供。下面是各部分如何配合。",
      },
      data: {
        nav: "数据",
        heading: "处理哪些数据（以及不处理哪些）",
        intro:
          "模型中唯一的数据资源是公开的产品清单。登录、应用程序 API、数据库、队列、交易存储、租户隔离和会话控制，对这个静态网站均标记为不适用，而不是默认通过。",
      },
      trust: {
        nav: "信任边界",
        heading: "信任边界",
        intro:
          "每个部分都处于某个边界之内。有些部分归我们所有；其他部分属于网站所依赖的外部服务：GitHub、npm Registry 和 Cloudflare。",
      },
      recovery: {
        nav: "恢复",
        heading: "恢复",
        intro:
          "此视角显示线上网站运行在什么之上：正式部署，以及它所部署到的 Cloudflare 托管。模型没有描述备份或还原流程。",
      },
      evidence: {
        nav: "证据",
        heading: "证据在哪里",
        intro:
          "有两个部分专门用于检查网站：构建网站时运行的说法检查，以及 GitHub 上的自动化源码检查。各项说法的证据在“验证”页面。",
      },
    },
    kinds: {
      Portfolio: "组织",
      Domain: "领域",
      System: "网站",
      Component: "组成部分",
      DataResource: "数据",
      ExternalDependency: "外部服务",
      Deployment: "部署",
      InfrastructureResource: "托管",
    },
    nodes: {
      "portfolio.blueskyz-labs": {
        label: "BlueSkyz Labs",
        blurb: "拥有本网站的组织。",
      },
      "domain.corporate-web": {
        label: "企业网站",
        blurb: "本网站所属的公开网络领域。",
      },
      "system.sgps-marketing": {
        label: "本网站",
        blurb: "您正在阅读的 BlueSkyz Labs 公开网站。",
      },
      "component.astro-static-site": {
        label: "静态网站页面",
        blurb: "发送到您浏览器的现成页面。",
      },
      "component.public-truth-gate": {
        label: "构建时的说法检查",
        blurb: "在构建网站时验证公开的产品清单。",
      },
      "component.source-assurance": {
        label: "自动化源码检查",
        blurb: "在 GitHub 上以只读权限运行的检查。",
      },
      "data.product-registry": {
        label: "公开产品清单",
        blurb: "网站可以展示的产品。这是公开信息，由所有者决定发布什么。",
      },
      "infra.cloudflare-worker": {
        label: "Cloudflare 静态托管",
        blurb: "从 Cloudflare 全球边缘提供网站的静态文件。",
      },
      "external.github": {
        label: "GitHub",
        blurb: "网站在源代码方面所依赖的外部服务。",
      },
      "external.npm-registry": {
        label: "npm Registry",
        blurb: "网站在公开软件包方面所依赖的外部服务。",
      },
      "external.cloudflare": {
        label: "Cloudflare",
        blurb: "网站依赖其来提供页面的外部服务。",
      },
      "deployment.production": {
        label: "线上网站部署",
        blurb: "访问者所访问的正式部署。",
      },
    },
    boundaries: {
      organizational: "组织内部",
      "public-internet": "对公共互联网开放",
      "github-source-build-to-cloudflare-edge":
        "从 GitHub 上的源码与构建到 Cloudflare 边缘",
      "browser-visible-static-output": "浏览器可见的静态输出",
      "build-time-truth-validation": "在构建网站时检查",
      "github-actions-read-only": "GitHub 自动化，只读",
      "repository-content": "保存在代码仓库中的内容",
      "cloudflare-edge": "Cloudflare 边缘网络",
      "external-scm": "外部：源码托管",
      "external-package-registry": "外部：软件包注册中心",
      "external-edge-provider": "外部：边缘服务提供方",
      "cloudflare-production": "Cloudflare 正式环境",
    },
    edges: {
      contains: "包含",
      reads: "读取",
      validates: "检查",
      assures: "为其提供保证",
      depends_on: "依赖",
      deploys_to: "部署到",
    },
  },
  // zh-Hant copy: machine-assisted (OpenCC s2twp), pending native review.
  "zh-hant": {
    title: "架構",
    description:
      "用淺顯的語言說明本網站如何建置與提供服務，內容派生自我們公開的架構模型。",
    lede: "用淺顯的語言說明本網站如何建置與提供服務。以下所有內容均來自專案公開的架構模型。",
    nav: "章節",
    parts: "組成部分",
    connections: "它們如何連接",
    noConnections: "此視角沒有描述各部分之間的任何連接。",
    lastVerified: "最近一次對照架構模型核驗",
    verifyLink: "前往「驗證」頁面核對我們的說法",
    technical: {
      summary: "技術名稱",
      hint: "架構模型中的確切識別碼，供希望對照模型核查本頁的人使用。",
      parts: "組成部分",
      connections: "連接",
    },
    lenses: {
      system: {
        nav: "建置與提供服務",
        heading: "網站如何建置與提供服務",
        intro:
          "網站由一組靜態頁面構成，這些頁面讀取公開的產品清單，並透過 Cloudflare 提供。以下是各部分如何配合。",
      },
      data: {
        nav: "資料",
        heading: "處理哪些資料（以及不處理哪些）",
        intro:
          "模型中唯一的資料資源是公開的產品清單。登入、應用程式 API、資料庫、佇列、交易儲存、租戶隔離和工作階段控制，對這個靜態網站均標記為不適用，而不是預設通過。",
      },
      trust: {
        nav: "信任邊界",
        heading: "信任邊界",
        intro:
          "每個部分都處於某個邊界之內。有些部分歸我們所有；其他部分屬於網站所依賴的外部服務：GitHub、npm Registry 和 Cloudflare。",
      },
      recovery: {
        nav: "復原",
        heading: "復原",
        intro:
          "此視角顯示線上網站執行在什麼之上：正式部署，以及它所部署到的 Cloudflare 代管。模型沒有描述備份或還原流程。",
      },
      evidence: {
        nav: "證據",
        heading: "證據在哪裡",
        intro:
          "有兩個部分專門用於檢查網站：建置網站時執行的說法檢查，以及 GitHub 上的自動化原始碼檢查。各項說法的證據在「驗證」頁面。",
      },
    },
    kinds: {
      Portfolio: "組織",
      Domain: "領域",
      System: "網站",
      Component: "組成部分",
      DataResource: "資料",
      ExternalDependency: "外部服務",
      Deployment: "部署",
      InfrastructureResource: "代管",
    },
    nodes: {
      "portfolio.blueskyz-labs": {
        label: "BlueSkyz Labs",
        blurb: "擁有本網站的組織。",
      },
      "domain.corporate-web": {
        label: "企業網站",
        blurb: "本網站所屬的公開網路領域。",
      },
      "system.sgps-marketing": {
        label: "本網站",
        blurb: "您正在閱讀的 BlueSkyz Labs 公開網站。",
      },
      "component.astro-static-site": {
        label: "靜態網站頁面",
        blurb: "傳送到您瀏覽器的現成頁面。",
      },
      "component.public-truth-gate": {
        label: "建置時的說法檢查",
        blurb: "在建置網站時驗證公開的產品清單。",
      },
      "component.source-assurance": {
        label: "自動化原始碼檢查",
        blurb: "在 GitHub 上以唯讀權限執行的檢查。",
      },
      "data.product-registry": {
        label: "公開產品清單",
        blurb: "網站可以展示的產品。這是公開資訊，由擁有者決定發布什麼。",
      },
      "infra.cloudflare-worker": {
        label: "Cloudflare 靜態代管",
        blurb: "從 Cloudflare 全球邊緣提供網站的靜態檔案。",
      },
      "external.github": {
        label: "GitHub",
        blurb: "網站在原始碼方面所依賴的外部服務。",
      },
      "external.npm-registry": {
        label: "npm Registry",
        blurb: "網站在公開軟體套件方面所依賴的外部服務。",
      },
      "external.cloudflare": {
        label: "Cloudflare",
        blurb: "網站依賴其來提供頁面的外部服務。",
      },
      "deployment.production": {
        label: "線上網站部署",
        blurb: "使用者所造訪的正式部署。",
      },
    },
    boundaries: {
      organizational: "組織內部",
      "public-internet": "對公共網際網路開放",
      "github-source-build-to-cloudflare-edge":
        "從 GitHub 上的原始碼與建置到 Cloudflare 邊緣",
      "browser-visible-static-output": "瀏覽器可見的靜態輸出",
      "build-time-truth-validation": "在建置網站時檢查",
      "github-actions-read-only": "GitHub 自動化，唯讀",
      "repository-content": "保存在程式碼儲存庫中的內容",
      "cloudflare-edge": "Cloudflare 邊緣網路",
      "external-scm": "外部：原始碼代管",
      "external-package-registry": "外部：軟體套件註冊中心",
      "external-edge-provider": "外部：邊緣服務提供者",
      "cloudflare-production": "Cloudflare 正式環境",
    },
    edges: {
      contains: "包含",
      reads: "讀取",
      validates: "檢查",
      assures: "為其提供保證",
      depends_on: "依賴",
      deploys_to: "部署到",
    },
  },
};

function need<T>(table: Record<string, T>, key: string, what: string): T {
  const value = table[key];
  if (value === undefined) {
    throw new Error(
      `architecture-copy: no localized label for ${what} "${key}"; add it to every locale`,
    );
  }
  return value;
}

export const humanNode = (lang: Language, id: string): NodeCopy =>
  need(ARCHITECTURE_COPY[lang].nodes, id, "entity");
export const humanKind = (lang: Language, kind: string): string =>
  need(ARCHITECTURE_COPY[lang].kinds, kind, "kind");
export const humanBoundary = (lang: Language, slug: string): string =>
  need(ARCHITECTURE_COPY[lang].boundaries, slug, "boundary");
export const humanEdge = (lang: Language, type: string): string =>
  need(ARCHITECTURE_COPY[lang].edges, type, "relationship type");
