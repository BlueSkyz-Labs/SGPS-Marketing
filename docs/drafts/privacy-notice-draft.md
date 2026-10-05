# Thông báo quyền riêng tư (blueskyzlabs.com): bản trung lập, chờ duyệt

> **Trạng thái:** ĐÃ HOÀN THIỆN, CHỜ OWNER DUYỆT CÔNG BỐ. Agent viết lại ngày 2026-10-05 (GMT+7) theo chỉ đạo của Owner: "viết trung lập, an toàn".
>
> - **Nguyên tắc viết.** Chỉ nêu những gì trang web thực sự làm, đã đối chiếu với mã nguồn trên `main`. Không nêu dữ kiện pháp nhân, email, con số hay căn cứ pháp lý cụ thể mà repository không chứng minh được. Chỗ nào cần dữ kiện đó, văn bản dùng cách diễn đạt trung tính.
> - **Còn đúng một dữ kiện Owner phải cung cấp trước khi công bố:** kênh liên hệ về quyền riêng tư (§1). Nếu thiếu kênh này, người dùng không thực hiện được quyền ở §6.
> - Đây không phải tư vấn pháp lý. Nên nhờ pháp chế rà soát nếu nhắm thị trường EU.
>
> **Dữ kiện kỹ thuật đã xác minh trên `main` (2026-10-05):**
>
> - Trang không đặt cookie. Mã nguồn không có lệnh ghi cookie nào. Các tuyên bố công khai `privacy-no-tracking-on-this-site` đã có sẵn.
> - Trang chỉ lưu lựa chọn ngôn ngữ và giao diện trong `localStorage` của trình duyệt (`src/lib/theme.ts`, `src/scripts/locale-suggestion.ts`). Gợi ý ngôn ngữ không gửi yêu cầu mạng nào.
> - Trang không có tài khoản, biểu mẫu, công cụ phân tích, pixel quảng cáo hay script ghi phiên.
> - Trang chạy trên Cloudflare Workers (chỉ phục vụ tệp tĩnh). `wrangler.toml` bật lưu nhật ký Workers Logs (`persist = true`, `redact_query_string = true`). Mã nguồn không cấu hình logpush hay tail consumer. Cài đặt Logpush ở cấp tài khoản chưa được xác minh, nên văn bản không khẳng định điều đó.
>
> **Tài liệu tham khảo** (giữ từ bản nháp 2026-10-04):
>
> - GDPR Điều 13: https://gdpr-info.eu/art-13-gdpr/
> - Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15: https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
> - Cloudflare Workers Logs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/

---

## Bản tiếng Việt

### 1. Ai vận hành trang này

- Trang blueskyzlabs.com do **BlueSkyz Labs** vận hành.
- Liên hệ về quyền riêng tư: **[OWNER CUNG CẤP TRƯỚC KHI CÔNG BỐ: một kênh liên hệ riêng tư, ví dụ một địa chỉ email]**.

### 2. Chúng tôi thu thập gì

- **Không cookie, không tài khoản, không biểu mẫu, không công cụ phân tích.**
- **Lựa chọn ngôn ngữ và giao diện** được lưu trong trình duyệt của bạn (local storage) và không gửi về cho chúng tôi. Bạn có thể xoá bất cứ lúc nào bằng cách xoá dữ liệu trang web trong trình duyệt.
- **Dữ liệu kỹ thuật:** khi bạn truy cập, hạ tầng phân phối trang có thể ghi lại các thông tin như địa chỉ IP, loại trình duyệt, trang được yêu cầu và thời điểm truy cập.

### 3. Mục đích

- Dữ liệu kỹ thuật chỉ dùng để phân phối trang, giữ an toàn, chống lạm dụng và khắc phục sự cố.
- Chúng tôi không dùng dữ liệu này cho quảng cáo, không lập hồ sơ người dùng và không bán cho bên nào.
- Việc xử lý dựa trên nhu cầu chính đáng trong việc vận hành và bảo vệ trang web, trong phạm vi pháp luật áp dụng cho phép.

### 4. Bên xử lý dữ liệu thay mặt chúng tôi

- **Cloudflare** cung cấp dịch vụ lưu trữ và phân phối nội dung cho trang này.
- Cloudflare vận hành mạng lưới toàn cầu, nên dữ liệu kỹ thuật có thể được xử lý ở ngoài Việt Nam, theo chính sách bảo mật của chính Cloudflare.

### 5. Thời gian lưu

- Nhật ký kỹ thuật do chúng tôi bật trên hạ tầng chỉ được lưu trong thời gian ngắn, theo thời hạn mặc định của nhà cung cấp, và tự động xoá sau đó.

### 6. Quyền của bạn

- Trong phạm vi pháp luật áp dụng cho phép, bạn có quyền yêu cầu được biết, truy cập, chỉnh sửa, xoá, hạn chế hoặc phản đối việc xử lý dữ liệu cá nhân liên quan đến bạn.
- Gửi yêu cầu qua kênh liên hệ ở mục 1. Chúng tôi phản hồi trong thời hạn pháp luật áp dụng quy định.
- Bạn cũng có quyền khiếu nại tới cơ quan có thẩm quyền về bảo vệ dữ liệu cá nhân nơi bạn cư trú.

### 7. Sản phẩm

Mỗi sản phẩm (ví dụ Sổ Trọ, Sổ Tâm) có thông báo quyền riêng tư riêng. Thông báo này chỉ áp dụng cho trang blueskyzlabs.com.

### 8. Thay đổi

- Nếu sau này trang có bổ sung công cụ đo lường (ví dụ đo tốc độ tải trang ẩn danh), chúng tôi sẽ cập nhật thông báo này **trước khi** bật công cụ đó.
- Phiên bản ngày 2026-10-05.

---

## English version

### 1. Who runs this site

- blueskyzlabs.com is operated by **BlueSkyz Labs**.
- Privacy contact: **[OWNER TO PROVIDE BEFORE PUBLISHING: a private contact channel, for example an email address]**.

### 2. What we collect

- **No cookies, no accounts, no forms, no analytics.**
- **Your language and theme choice** is stored in your browser (local storage) and is not sent to us. You can remove it at any time by clearing this site's data in your browser.
- **Technical data:** when you visit, the delivery infrastructure may record information such as your IP address, browser type, the page requested and the time of the request.

### 3. Purpose

- Technical data is used only to deliver the site, keep it secure, prevent abuse and fix problems.
- We do not use it for advertising, do not build user profiles and do not sell it.
- Processing relies on our legitimate need to operate and protect the website, to the extent the applicable law allows.

### 4. Who processes data for us

- **Cloudflare** provides hosting and content delivery for this site.
- Cloudflare runs a global network, so technical data may be processed outside Vietnam under Cloudflare's own privacy policy.

### 5. Retention

- The technical logs we enable on our infrastructure are kept only for a short period, under the provider's default retention, and are then deleted automatically.

### 6. Your rights

- To the extent the applicable law allows, you may ask to be informed about, access, correct, erase, restrict or object to the processing of personal data about you.
- Send requests through the contact channel in section 1. We reply within the time the applicable law requires.
- You may also complain to the data protection authority where you live.

### 7. Products

Each product (for example Sổ Trọ and Sổ Tâm) has its own privacy notice. This notice covers blueskyzlabs.com only.

### 8. Changes

- If the site later adds a measurement tool (for example anonymous page-speed measurement), we will update this notice **before** turning that tool on.
- Version dated 2026-10-05.

---

## Bước công bố (agent thực hiện sau khi Owner duyệt và cung cấp kênh liên hệ)

1. **Cập nhật nội dung trang.** Sửa `PRIVACY_COPY` trong `src/data/trust-copy.ts` cho cả 4 ngôn ngữ, giữ trang `/privacy/` trong giới hạn số từ của v8. Đưa toàn văn vào một khối mở rộng (disclosure), như trang `/verify/` đang làm.
2. **Bản tiếng Trung.** Bản zh-Hans và zh-Hant cần người bản ngữ rà soát.
3. **Bỏ câu chờ duyệt.** Xoá câu "Full legal wording is published when BlueSkyz approves it".
4. **Giữ tuyên bố công khai.** Giữ nguyên tuyên bố `privacy-no-tracking-on-this-site`, vì dữ kiện vẫn đúng.
5. **Kiểm tra lại.** Chạy lại các kiểm tra public-truth, i18n parity và v8 trust-page caps.
6. **Thứ tự với RUM.** Chỉ sau khi trang `/privacy/` đã công bố mới gỡ Cloudflare Access. Khi bật RUM, thêm Cloudflare Web Analytics vào mục 2 và mục 4 trước khi bật beacon (xem SGPS-DEC-2026-039 §3.5).
