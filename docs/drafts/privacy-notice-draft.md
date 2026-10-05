# BẢN NHÁP — Thông báo quyền riêng tư (blueskyzlabs.com)

> **Trạng thái:** NHÁP, CHƯA CÔNG BỐ. Agent soạn ngày 2026-10-04 (GMT+7) theo quyết định của Owner: agent soạn, Owner hoặc pháp chế duyệt.
>
> - Không đưa bản này lên trang `/privacy/` khi chưa có phê duyệt bằng văn bản.
> - Mọi chỗ `[ĐIỀN: …]` là dữ kiện Owner phải cung cấp. Agent không tự bịa.
> - Đây không phải tư vấn pháp lý.
>
> **Khung tham chiếu** (truy cập 2026-10-04):
>
> - GDPR Điều 13: https://gdpr-info.eu/art-13-gdpr/
> - Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, hiệu lực 01/01/2026: https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
> - Thời hạn lưu nhật ký Cloudflare Workers Logs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
>
> **Dữ kiện kỹ thuật đã xác minh** (bám theo nội dung trang hiện tại, không thêm mới):
>
> - Trang không đặt cookie.
> - Trang chỉ lưu lựa chọn ngôn ngữ và giao diện trong trình duyệt.
> - Trang không có tài khoản, không có biểu mẫu, không có pixel quảng cáo hay script ghi phiên.
> - `wrangler.toml` bật lưu nhật ký: `observability.logs.persist = true`, `invocation_logs = true`.

---

## Bản tiếng Việt (nháp)

### 1. Ai chịu trách nhiệm xử lý dữ liệu

- Bên kiểm soát dữ liệu: **[ĐIỀN: tên pháp nhân đầy đủ, mã số doanh nghiệp, địa chỉ trụ sở]**, hoạt động dưới thương hiệu BlueSkyz Labs.
- Liên hệ về quyền riêng tư: **[ĐIỀN: email chuyên trách quyền riêng tư]**.

### 2. Chúng tôi thu thập gì

- **Không cookie, không tài khoản, không biểu mẫu.** Trang không đặt cookie và không có tính năng đăng ký hay gửi biểu mẫu.
- **Lựa chọn ngôn ngữ và giao diện** được lưu trong trình duyệt của bạn (local storage). Dữ liệu này không gửi về máy chủ của chúng tôi.
- **Nhật ký kỹ thuật:** khi bạn truy cập, hạ tầng phân phối có thể ghi lại:
  - địa chỉ IP;
  - loại trình duyệt;
  - trang được yêu cầu;
  - thời điểm truy cập.

### 3. Mục đích và cơ sở xử lý

- **Mục đích:** bảo mật, chống lạm dụng, phân phối trang ổn định và khắc phục sự cố. Không dùng cho quảng cáo, không lập hồ sơ người dùng.
- **Cơ sở xử lý:** [ĐIỀN, pháp chế xác nhận: lợi ích hợp pháp (GDPR Điều 6(1)(f)) và căn cứ tương ứng theo Luật 91/2025/QH15].

### 4. Bên nhận dữ liệu

- **Cloudflare, Inc.** là nhà cung cấp hosting và CDN, xử lý nhật ký kỹ thuật thay mặt chúng tôi.
- Dữ liệu có thể được xử lý ngoài Việt Nam. [ĐIỀN, pháp chế xác nhận: cơ chế chuyển dữ liệu ra nước ngoài theo Luật 91/2025/QH15].

### 5. Thời gian lưu

- Nhật ký kỹ thuật được lưu tối đa **[ĐIỀN: số ngày]**.
- Tham khảo: tài liệu Cloudflare nêu 3 ngày với gói Free và 7 ngày với gói Paid. Owner cần xác nhận gói đang dùng.

### 6. Quyền của bạn

Bạn có quyền:

- yêu cầu được biết;
- truy cập;
- chỉnh sửa;
- xóa;
- hạn chế hoặc phản đối việc xử lý dữ liệu cá nhân của mình, trong phạm vi pháp luật cho phép.

Gửi yêu cầu tới **[ĐIỀN: email]**. Chúng tôi phản hồi trong **[ĐIỀN: thời hạn]**. Bạn cũng có quyền khiếu nại tới cơ quan có thẩm quyền về bảo vệ dữ liệu cá nhân **[ĐIỀN, pháp chế xác nhận: tên cơ quan]**.

### 7. Sản phẩm

Sổ Trọ và Sổ Tâm có chính sách quyền riêng tư riêng. Trang này chỉ áp dụng cho blueskyzlabs.com.

### 8. Cập nhật

Phiên bản ngày **[ĐIỀN]**. Khi có thay đổi quan trọng, chúng tôi cập nhật ngày tại đây.

---

## English version (draft)

### 1. Controller

- **[FILL IN: full legal entity name, registration number, registered address]**, trading as BlueSkyz Labs.
- Privacy contact: **[FILL IN: email]**.

### 2. What we collect

- No cookies, no accounts, no forms.
- Your language and theme choice is stored in your browser only.
- Technical logs (IP address, browser type, page requested, time) may be recorded by our delivery infrastructure.

### 3. Purpose and legal basis

- **Purpose:** security, abuse prevention, reliable delivery and troubleshooting. Never advertising or profiling.
- **Legal basis:** [FILL IN, legal to confirm: legitimate interests (GDPR Art. 6(1)(f)) and the corresponding basis under Vietnam Law 91/2025/QH15].

### 4. Recipients

- **Cloudflare, Inc.**, our hosting and CDN provider, processes technical logs on our behalf.
- Processing may occur outside Vietnam. [FILL IN, legal to confirm: cross-border transfer mechanism].

### 5. Retention

- Technical logs are kept for up to **[FILL IN: days]**.
- Cloudflare documents 3 days on the Free plan and 7 days on Paid; the Owner confirms the plan.

### 6. Your rights

- Rights: to be informed, access, rectification, erasure, restriction and objection, as the law allows.
- Contact **[FILL IN: email]**; reply within **[FILL IN]**.
- Right to complain to **[FILL IN, legal to confirm: supervisory authority]**.

### 7. Products

Sổ Trọ and Sổ Tâm publish their own privacy notices. This notice covers blueskyzlabs.com only.

### 8. Changes

Version dated **[FILL IN]**.

---

## Việc cần làm sau khi Owner duyệt (agent thực hiện)

1. Cập nhật `PRIVACY_COPY` trong `src/data/trust-copy.ts` cho cả 4 ngôn ngữ. Bản zh-Hans và zh-Hant cần người bản ngữ rà soát.
2. Bỏ câu "Full legal wording is published when BlueSkyz approves it".
3. Giữ nguyên tuyên bố `privacy-no-tracking-on-this-site`, vì dữ kiện vẫn đúng.
4. Chạy lại các kiểm tra public-truth và i18n parity.
