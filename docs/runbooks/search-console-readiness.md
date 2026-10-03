# Search Console và Bing Webmaster Tools: checklist cho Owner (v11 J0)

**Dành cho:** Owner. **Thời điểm:** sau go-live. **Phạm vi:** chỉ tài liệu, không đổi code.
**Trạng thái:** bản nháp do agent soạn, Owner thực hiện. Việc này là gate **O-11.3** của plan v11.

Quy ước nhãn nguồn: mỗi nhận định về cách Google Search Console (GSC) hoặc Bing Webmaster Tools (BWT) hoạt động đều kèm nguồn chính thức và tháng truy cập. Chỗ nào không kiểm chứng được thì ghi **CHƯA KIỂM CHỨNG**. Các nhận định về repo được lấy từ source tại `main@11e3a8b` (file được nêu tên).

## 1. Preconditions (làm xong hết rồi mới bắt đầu)

- [ ] **Go-live đã xong** (plan v9, §5 Owner gates).
- [ ] **Cloudflare Access đã được gỡ** khỏi `https://blueskyzlabs.com`. Hiện tại apex trả 302 sang trang đăng nhập Access (`docs/evidence/2026-10-03-v10-multidimensional-redteam.md`, RT-01). Với một trang đang bị chặn đăng nhập, crawler không thể đọc nội dung. Đây là suy luận từ cách Access hoạt động, **CHƯA KIỂM CHỨNG** bằng nguồn Google. Vì vậy chỉ nộp sitemap sau khi Access đã gỡ.
- [ ] **`www` → apex 301 đã có** (red-team RT-01). Cần có Redirect Rule `www.blueskyzlabs.com/*` → `https://blueskyzlabs.com/$1`, status 301. Kiểm tra: `curl -sI https://www.blueskyzlabs.com/en/` phải trả `301` với `location` trỏ về apex. Nếu `www` vẫn trả 200 thì có hai host phục vụ cùng nội dung và canonical bị loãng.
- [ ] Kiểm tra nhanh trên production: `https://blueskyzlabs.com/robots.txt` có `Allow: /` và dòng `Sitemap: https://blueskyzlabs.com/sitemap.xml`. Trong repo, `src/pages/robots.txt.ts` chỉ phát `Allow: /` + `Sitemap:` khi `SITE.url` là origin production. Với origin preview hoặc staging nó phát `Disallow: /`. Nếu production trả `Disallow: /` thì dừng lại và báo agent.
- [ ] Tài khoản Google dùng cho GSC là tài khoản của tổ chức do Owner kiểm soát, không dùng tài khoản cá nhân tạm thời. Lý do: người xác minh là chủ sở hữu property. (Khuyến nghị vận hành của runbook này, không phải yêu cầu của Google.)

## 2. Xác minh Domain property bằng DNS TXT trong Cloudflare

> **Agent không làm được bước này.** Agent không có quyền vào GSC, không có quyền đăng nhập Google của Owner, và không được xin credential Cloudflare trong chat.
> **Owner tuyệt đối không dán token xác minh (chuỗi `google-site-verification=...`), mật khẩu, API token hay mã 2FA vào chat.** Token chỉ đi từ màn hình GSC sang màn hình Cloudflare DNS. Nếu cần báo kết quả, chỉ viết "đã xác minh" hoặc "chưa xác minh".

Vì sao dùng Domain property: loại property này gộp dữ liệu của mọi protocol (http/https) và mọi subdomain, và chỉ Domain property mới cần DNS record để xác minh (nguồn 1, truy cập 10/2026). ADR 0006 cũng dự kiến các subdomain sản phẩm `<product>.blueskyzlabs.com`, nên một Domain property bao phủ được chúng (suy luận từ ADR 0006 và nguồn 1).

Các bước:

1. Mở Google Search Console, chọn **Add property**, chọn loại **Domain**, nhập `blueskyzlabs.com` (không có `https://`, không có `www`), bấm **Continue**. Tên nút và nhãn có thể khác theo giao diện hiện hành: **CHƯA KIỂM CHỨNG** từng nhãn, hãy theo màn hình thực tế.
2. Trong hộp thoại xác minh, chọn loại record **TXT**. GSC hiển thị một chuỗi dạng `google-site-verification=...`. Bấm copy (nguồn 1, truy cập 10/2026).
3. Mở Cloudflare Dashboard, chọn zone `blueskyzlabs.com`, vào trang **DNS Records**, bấm **Add record** (nguồn 2, truy cập 10/2026).
4. Điền: **Type** = `TXT`; **Name** = apex (ghi `@` hoặc tên `blueskyzlabs.com`; Google mô tả trường host là để trống, Cloudflare dùng apex, nên chọn apex); **Content** = chuỗi vừa copy; **TTL** = Auto hoặc mặc định. Bấm **Save**. TXT không có tùy chọn Proxy (nguồn 2). Việc dùng đúng ký hiệu `@` trong giao diện Cloudflare hiện tại: **CHƯA KIỂM CHỨNG**, nguồn 2 chỉ nói "apex name".
5. Quay lại GSC bấm **Verify**. Nếu chưa được, đợi rồi thử lại: Google nói record có thể mất vài phút đến vài ngày mới hiển thị với Google, và khuyên đợi một đến hai ngày rồi thử lại (nguồn 1, truy cập 10/2026).
6. **Không xóa TXT record sau khi xác minh xong.** Google kiểm tra định kỳ; nếu không còn thấy token, quyền sẽ hết hạn sau một thời gian ân hạn (nguồn 1, truy cập 10/2026).

Việc cần ghi lại (không chứa token): ngày xác minh, tài khoản Google là owner, và ảnh chụp màn hình trạng thái "Ownership verified" đã che token (nếu có).

## 3. Nộp `https://blueskyzlabs.com/sitemap.xml`

Cách nộp: trong GSC mở báo cáo **Sitemaps**, nhập `sitemap.xml` (hoặc URL đầy đủ), bấm **Submit**, rồi theo dõi trạng thái và lỗi xử lý (nguồn 3, truy cập 10/2026). Nhãn chính xác của ô nhập: **CHƯA KIỂM CHỨNG**. Trạng thái "Success" chỉ nghĩa là Google đọc được file, không nghĩa là mọi URL đã được index.

Sitemap trong repo thực sự chứa gì (`src/pages/sitemap.xml.ts`, `src/lib/seo.ts`):

- Chỉ phát URL khi `SITE.url` là origin production; nếu không, file rỗng (không có `<url>`).
- Cổng ngôn ngữ `/` (Owner decision F16).
- Các trang tĩnh trong `PUBLIC_STATIC_PATHS` cho 4 locale `en`, `vi`, `zh`, `zh-hant`: trang chủ, `decision-room`, `products`, `about`, `contact`, `support`, `privacy`, `security`, `architecture`, `verify`, `editions`, `dossier`. Mỗi locale 12 trang, tổng 48.
- **Trừ** `/<lang>/dossier/print/` (`noindex, follow`, không nằm trong sitemap; `isNoindexPath`).
- Mỗi product công khai × 4 locale: `/<lang>/products/<slug>/`; trang guide `/<lang>/products/<slug>/guide/` cho product có guide; trang evidence `/<lang>/evidence/<id>/`; trang `/<lang>/editions/<id>/`.
- `<lastmod>` lấy từ git cho từng route và bị bỏ nếu không chính xác (shallow clone, không có history); không bao giờ dùng thời điểm build. Google chỉ dùng `lastmod` khi giá trị luôn chính xác và kiểm chứng được, và bỏ qua `priority`, `changefreq` (nguồn 3).
- Sitemap **không** chứa `xhtml:link` hreflang. Hreflang nằm trong `<head>` của từng trang (mục 4). Google chấp nhận hreflang qua HTML tag, HTTP header hoặc sitemap (nguồn 4).

**Journal (`/vi/journal/`, `/en/journal/`, `/zh/journal/`, `/zh-hant/journal/`) hiện KHÔNG nằm trong sitemap** và không được thêm vào cho đến khi có bài đã xuất bản đầu tiên:

- Trang index journal là `noindex, follow` khi chưa có bài (`journalIsIndexable` trong `src/lib/journal-schema.ts` chỉ trả `true` khi có ít nhất một bài không phải draft).
- `sitemap.xml.ts` ở baseline này chưa có mục journal nào.
- Khi bài đầu tiên (J3) được merge, index và bài viết mới được đưa vào sitemap và bỏ `noindex`. Sau lần deploy đó, hãy bấm kiểm tra lại báo cáo Sitemaps và dùng **URL Inspection** cho URL bài mới (**CHƯA KIỂM CHỨNG** bằng nguồn trong phiên này; chỉ là gợi ý vận hành).

Giới hạn của một sitemap là 50 MB (chưa nén) hoặc 50.000 URL (nguồn 3); sitemap hiện tại nhỏ hơn rất nhiều.

## 4. Hành vi hreflang và canonical mong đợi (đúng như `src/lib/seo.ts`)

Mỗi trang (trừ trang 404) phát trong `<head>` (`src/layouts/BaseLayout.astro`):

- `<link rel="canonical">` = `canonicalForPath(path, SITE.url)`: URL tuyệt đối của chính trang đó, trên origin `https://blueskyzlabs.com`, có dấu `/` cuối. Mỗi URL tự canonical cho ngôn ngữ của nó; không có trang nào canonical sang locale khác.
- Bốn `<link rel="alternate" hreflang=...>` do `hreflangLinks`: `en`, `vi`, `zh-Hans` (đường dẫn `/zh/`), `zh-Hant` (đường dẫn `/zh-hant/`). Tập link giống hệt nhau trên mọi biến thể và mỗi trang tự trỏ về chính nó, đúng yêu cầu reciprocal của Google (nguồn 4, truy cập 10/2026).
- Một `hreflang="x-default"` do `xDefaultPath`:
  - cụm trang chủ (`/`, `/en/`, `/vi/`, `/zh/`, `/zh-hant/`): `x-default` = `/` (cổng ngôn ngữ);
  - mọi trang khác: `x-default` = bản `/en/...` tương ứng.
- Với `noindex` (journal index khi rỗng; dossier print) thẻ canonical và hreflang vẫn được phát, và trang có `<meta name="robots" content="noindex, follow">`.

Điều cần thấy trong GSC sau vài tuần (kỳ vọng, không phải cam kết):

- Google chỉ chọn canonical là một **gợi ý**, không phải lệnh; URL Inspection có thể cho thấy "Google-selected canonical" khác với "User-declared canonical". Nếu khác, ghi lại URL và gửi agent (nguồn 4 nói Google ưu tiên URL nằm trong cụm hreflang khi chọn canonical).
- Với một cặp VI và EN, hai URL phải cùng nằm trong một cụm hreflang; thiếu liên kết ngược có thể khiến annotation bị bỏ qua (nguồn 4).
- Báo cáo International Targeting/hreflang có thể không còn trong giao diện hiện tại: **CHƯA KIỂM CHỨNG**; dùng URL Inspection và "View crawled page" để so `<head>`.
- Locale `zh` và `zh-hant` tồn tại trên journal chỉ ở dạng trang index nói rằng bài được đăng bằng tiếng Việt và tiếng Anh (plan v11 §12). Các cặp VI↔EN của bài là cụm chính.

Lưu ý: guard hreflang của repo kiểm tra HTML build ra, không kiểm tra thứ Google đã index. Bằng chứng indexing chỉ có từ GSC; trước khi có dữ liệu, tác động SEO là **NOT VERIFIED**.

## 5. Export hằng tháng cho review v11 J7

Tần suất: một lần mỗi tháng, vào ngày cố định (ví dụ mùng 5), cho **tháng dương lịch trước**. J7 là review 90 ngày, cần ít nhất 3 lần export.

Dữ liệu GSC giữ khoảng 16 tháng (nguồn 5, truy cập 10/2026), nên không export ngay lập tức vẫn kịp, nhưng đừng để quá 3 tháng. Dữ liệu mới nhất là dữ liệu sơ bộ có thể còn đổi trong vài giờ (nguồn 6), nên export sau khi tháng kết thúc ít nhất vài ngày.

Cách export (nguồn 7, truy cập 10/2026):

1. GSC → **Performance** → **Search results**. Đặt **Date** = tháng cần lấy (Custom, ngày đầu đến ngày cuối).
2. Bật cả bốn chỉ số: **Total clicks**, **Total impressions**, **Average CTR**, **Average position**.
3. Tab **Queries**: bấm **Export**, chọn **Download CSV**. Tab **Pages**: làm tương tự. (Tab Countries và Devices không bắt buộc.)
4. Export có tối đa **1.000 dòng** (nguồn 7); nếu bảng của bạn dài hơn thì file bị cắt. Với một site mới, thường dưới ngưỡng này; nếu chạm 1.000 dòng, ghi chú "truncated" khi gửi. Truy vấn rất hiếm bị Google ẩn danh nên không xuất hiện trong dữ liệu theo truy vấn (nguồn 5), vì vậy tổng của tab Queries có thể nhỏ hơn tổng của tab Pages. Việc nhóm theo page hay theo property cũng làm tổng khác nhau (nguồn 5, 6).
5. Giá trị "~" hoặc "-" trong báo cáo được đổi thành `0` trong file tải xuống (nguồn 7), nên đừng đọc `0` là "không có".

Định dạng gửi cho agent (không có token, không có email cá nhân):

- Tên file: `gsc-YYYY-MM-queries.csv` và `gsc-YYYY-MM-pages.csv` (CSV gốc, không sửa tay).
- Kèm một dòng chú thích trong tin nhắn:

```text
GSC export | property: blueskyzlabs.com (Domain) | period: YYYY-MM-01..YYYY-MM-DD
type: Web (Search results) | filters: none | rows: <số dòng> | truncated: yes|no
exported-on: YYYY-MM-DD
```

- Cách gửi: đặt hai file CSV vào repo qua một PR (thư mục do agent chỉ định khi J7 mở) hoặc đính vào issue; không dán nội dung CSV chứa dữ liệu lạ vào chat nếu nó rất dài. CSV này chỉ là dữ liệu truy vấn tổng hợp, không chứa danh tính khách truy cập. Thư mục đích sẽ do card J7 quy định: **CHƯA CÓ QUYẾT ĐỊNH**.
- Cột kỳ vọng: query hoặc page, Clicks, Impressions, CTR, Position. Tên cột đúng theo file Google xuất, có thể là tiếng Việt nếu giao diện đặt tiếng Việt: **CHƯA KIỂM CHỨNG**. Khuyến nghị đặt giao diện GSC sang English trước khi export để tên cột ổn định.
- Cần thêm kiểu export khác (API, Bulk export sang BigQuery) thì đó là quyết định riêng: Bulk export không bị giới hạn 1.000 dòng nhưng cần BigQuery và có thể phát sinh chi phí (nguồn 8). Không bắt buộc cho quy mô hiện tại.

Agent chỉ phân tích những gì có trong file đã gửi. Không có file thì kết luận SEO của J7 là NOT VERIFIED.

## 6. Bing Webmaster Tools: import từ GSC

Chỉ làm **sau khi** GSC đã xác minh xong (Domain property ở mục 2). Bing cho phép nhập site đã xác minh từ Search Console cùng với sitemap của site đó (nguồn 9, truy cập 10/2026). Các bước:

1. Đăng nhập Bing Webmaster Tools bằng tài khoản Owner (hoặc tạo tài khoản mới).
2. Vào trang **My Sites**, bấm **Import**.
3. Đăng nhập tài khoản Google đã dùng ở GSC và bấm **Allow**. Bing xin quyền đọc danh sách site đã xác minh và sitemap của bạn.
4. Chọn site `blueskyzlabs.com` và bấm **Import**. Site được thêm và tự động xác minh.
5. Dữ liệu traffic có thể mất đến 48 giờ mới xuất hiện cho site mới xác minh.

Lưu ý:

- Bing đối chiếu định kỳ với GSC để xác nhận quyền sở hữu; nếu thu hồi quyền truy cập Google thì có thể cần xác minh bằng cách khác (nguồn 9).
- Bài blog nguồn 9 đăng từ 09/2019. Giao diện hiện tại có thể khác: **CHƯA KIỂM CHỨNG** từng nhãn nút. Trang trợ giúp "Add and Verify site" của Bing (https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b, xuất hiện trong kết quả tìm kiếm, truy cập 10/2026) là nơi đối chiếu, nhưng nội dung trang chưa được đọc trong phiên này.
- Sau import, mở mục Sitemaps trong BWT và kiểm tra `https://blueskyzlabs.com/sitemap.xml` đã có. Có tự đồng bộ sitemap hay không: **CHƯA KIỂM CHỨNG** (nguồn 9 nói Bing nhận sitemap kèm site; không nói rõ đồng bộ liên tục).
- Bing không có export hằng tháng bắt buộc trong J7; có thể bổ sung sau nếu Owner muốn.

## 7. Ghi chú về quyền riêng tư

Kết luận: **việc dùng GSC và BWT không thêm cookie hay script vào website**, nên các câu trên trang Privacy về cookie không đổi. Cơ sở và giới hạn:

- **Xác minh bằng DNS** chỉ sửa DNS record của domain, không cần thêm mã hay thẻ vào trang (nguồn 1, truy cập 10/2026). Repo không được sửa gì để phục vụ GSC (J0 là tài liệu, không có code).
- **Khi nào kết luận này sai:** nếu sau này Owner chọn xác minh bằng thẻ `<meta>` hoặc file HTML (không phải cách trong runbook này), thì thêm thẻ/file vào site. Không dùng các cách đó. Mọi thay đổi như vậy phải đi qua PR và rà lại claim.
- Phía site, các claim hiện tại là: "Trang web này không đặt cookie. Chỉ lưu ngôn ngữ và giao diện bạn chọn, trong trình duyệt của bạn; không theo dõi, không lập hồ sơ" (`src/data/trust-copy.ts`, `PRIVACY_COPY.vi.lede`; cùng ý ở `src/data/claims.ts`). Trang Privacy cũng nói log server/CDN có thể ghi IP, loại trình duyệt, trang được yêu cầu cho an ninh và chống lạm dụng, và "không có nghĩa là không có dữ liệu nào được xử lý".
- **Không được nói quá:** GSC không đo khách truy cập bằng script trên site, nhưng GSC là dịch vụ của Google và Google vẫn xử lý dữ liệu tìm kiếm của người dùng của Google Search. Điều đó không nằm trên site này và không thay đổi những gì site thu thập. Runbook này không tuyên bố Google "không theo dõi" ai. Đừng viết "site không có analytics" theo nghĩa rộng hơn câu hiện có: câu đúng với repo là "không đặt cookie, không script đo lường trên site".
- Về "no analytics": plan v11 §2 ghi RUM đang OFF (v10 O-10.3). Dữ liệu GSC là dữ liệu từ phía Google, không phải analytics trên site. Nếu Owner muốn nói điều này công khai thì cần diễn đạt riêng và qua review copy; **không** tự thêm vào trang Privacy trong card này.
- Tác động pháp lý (ví dụ nghĩa vụ công bố theo luật Việt Nam, nếu có) **không được đánh giá ở đây**: **CHƯA KIỂM CHỨNG**, ngoài phạm vi runbook.

## Nguồn (tất cả truy cập 10/2026; chỉ URL do WebSearch trả về trong phiên này)

1. Google, Verify your site ownership - Search Console Help: https://support.google.com/webmasters/answer/9008080?hl=en
2. Cloudflare, Manage DNS records (create DNS records): https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
3. Google, Build and submit a sitemap: https://developers.google.com/search/docs/guides/create-URLs
4. Google, Localized Versions of your Pages: https://developers.google.com/search/docs/specialty/international/localized-versions
5. Google, A deep dive into Search Console performance data filtering and limits: https://developers.google.com/search/blog/2022/10/performance-data-deep-dive
6. Google, Performance report (Search results): About the data: https://support.google.com/webmasters/answer/17011364?hl=en
7. Google, Export data directly from a Search Console report: https://support.google.com/webmasters/answer/12919797?hl=en
8. Google, Bulk data export: https://developers.google.com/search/blog/2023/02/bulk-data-export
9. Bing Webmaster Blog, Import sites from Search Console to Bing Webmaster Tools (09/2019): https://blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools

## Các bước đánh dấu CHƯA KIỂM CHỨNG (tóm tắt)

- Nhãn chính xác của các nút/ô trong giao diện GSC, Cloudflare và BWT hiện tại.
- Cách ghi apex (`@` hay tên domain) trong Cloudflare hiện tại.
- Access đang bật chặn crawler (suy luận, không có nguồn Google).
- Báo cáo hreflang/International Targeting còn tồn tại trong GSC hay không.
- Tên cột trong CSV khi giao diện không phải English.
- Bing có đồng bộ sitemap liên tục sau import hay không.
- Nghĩa vụ pháp lý về quyền riêng tư khi dùng dịch vụ của Google.
- Thư mục nhận file export cho J7.
