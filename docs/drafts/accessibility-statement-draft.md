# BẢN NHÁP — Tuyên bố khả năng tiếp cận (blueskyzlabs.com)

> **Trạng thái:** NHÁP, CHƯA CÔNG BỐ. Agent soạn ngày 2026-10-04 (GMT+7) theo quyết định của Owner: agent soạn bản 4 ngôn ngữ, Owner duyệt lời cam kết.
>
> - Bản zh-Hans và zh-Hant chưa qua người bản ngữ rà soát.
> - Mọi chỗ `[ĐIỀN: …]` là dữ kiện Owner cung cấp.
>
> **Khung tham chiếu:**
>
> - W3C WAI, mẫu tuyên bố khả năng tiếp cận: https://www.w3.org/WAI/planning/statements/
> - WCAG 2.2 (Khuyến nghị W3C): https://www.w3.org/TR/WCAG22/
>
> Cả hai truy cập ngày 2026-10-04.
>
> **Bằng chứng thật dùng cho nội dung** (chỉ nêu điều đã đo):
>
> - axe WCAG 2.2: 178 lượt quét trên 89 trang × sáng/tối, 0 vi phạm, tại `main@c173f16` (`docs/evidence/2026-10-04-v10-e7-delta-post-e4.md`).
> - Mục tiêu chạm tối thiểu 24 px: đạt trên 64 trang.
> - Có trạng thái giảm chuyển động.
> - Kiểm thử với người dùng thật (Human E4) **chưa thực hiện**.

---

## Tiếng Việt

**Cam kết.** BlueSkyz Labs mong muốn blueskyzlabs.com dùng được cho mọi người, kể cả người dùng công nghệ hỗ trợ.

**Tiêu chuẩn.** Chúng tôi hướng tới mức **AA của WCAG 2.2**.

**Hiện trạng.**

- Kiểm tra tự động bằng axe trên toàn bộ trang, ở cả giao diện sáng và tối, không phát hiện vi phạm.
- Trang hỗ trợ:
  - điều hướng bằng bàn phím;
  - chế độ giảm chuyển động;
  - đọc được khi tắt JavaScript.

**Giới hạn đã biết.**

- Chưa có kiểm thử với người dùng thật dùng công nghệ hỗ trợ.
- Bản tiếng Trung chưa được người bản ngữ rà soát.
- Kiểm tra tự động không phát hiện được mọi vấn đề.

**Phản hồi.** Nếu gặp khó khăn khi dùng trang, vui lòng liên hệ **[ĐIỀN: email]**. Chúng tôi phản hồi trong **[ĐIỀN: thời hạn]**.

**Cập nhật lần cuối:** [ĐIỀN].

---

## English

**Commitment.** BlueSkyz Labs wants blueskyzlabs.com to be usable by everyone, including people who use assistive technology.

**Standard.** We aim for **WCAG 2.2 level AA**.

**Current status.**

- Automated axe checks across every page, in light and dark themes, found no violations.
- The site supports keyboard navigation and reduced motion, and stays readable without JavaScript.

**Known limitations.**

- No testing yet with real assistive-technology users.
- The Chinese versions have not been reviewed by native speakers.
- Automated checks cannot find every issue.

**Feedback.** Contact **[FILL IN: email]**; we reply within **[FILL IN]**.

**Last updated:** [FILL IN].

---

## 简体中文（待母语者审校）

**承诺。** BlueSkyz Labs 希望所有人都能使用 blueskyzlabs.com，包括使用辅助技术的用户。

**标准。** 我们以 **WCAG 2.2 AA 级**为目标。

**现状。**

- 对全部页面的浅色与深色主题进行了 axe 自动检测，未发现违规。
- 网站支持键盘导航和减少动态效果，关闭 JavaScript 时仍可阅读。

**已知限制。**

- 尚未与真实的辅助技术用户进行测试。
- 中文版本尚未经母语者审校。
- 自动检测无法发现所有问题。

**反馈。** 请联系 **[待填写：邮箱]**，我们将在 **[待填写]** 内回复。

**最后更新：** [待填写]。

---

## 繁體中文（待母語者審校）

**承諾。** BlueSkyz Labs 希望所有人都能使用 blueskyzlabs.com，包括使用輔助科技的使用者。

**標準。** 我們以 **WCAG 2.2 AA 級**為目標。

**現況。**

- 對所有頁面的淺色與深色主題進行 axe 自動檢測，未發現違規。
- 網站支援鍵盤導覽與減少動態效果，關閉 JavaScript 時仍可閱讀。

**已知限制。**

- 尚未與真實的輔助科技使用者進行測試。
- 中文版本尚未經母語者審校。
- 自動檢測無法發現所有問題。

**意見回饋。** 請聯絡 **[待填寫：電子郵件]**，我們將於 **[待填寫]** 內回覆。

**最後更新：** [待填寫]。

---

## Việc cần làm sau khi Owner duyệt (agent thực hiện)

1. Tạo trang `/{lang}/accessibility/` cho 4 ngôn ngữ.
2. Gắn liên kết ở chân trang và sitemap.
3. Thêm test cho các nội dung bắt buộc của trang (tiêu chuẩn, giới hạn, liên hệ).
4. Chạy lại axe và kiểm tra đồng bộ giữa các bản ngôn ngữ.
