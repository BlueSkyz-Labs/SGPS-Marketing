# 中文（简体）本地化词汇表 — BlueSkyz Labs 网站

**Register:** 商务中文 (business/commercial Simplified Chinese). Professional and restrained; no slang, no
traditional characters, no exclamation-led marketing tone. Sentence-final 。for full sentences; no trailing
period on standalone labels.

This glossary binds every `zh` string added to the codebase so terminology stays consistent across nav,
product, trust and evidence surfaces.

## Brand & product terms

| English | Vietnamese | 中文 |
| --- | --- | --- |
| BlueSkyz Labs | BlueSkyz Labs | BlueSkyz Labs（保留原文） |
| Intelligence. Elevated. Impact. | Trí tuệ. Nâng tầm. Tác động. | 智能。提升。影响。 |
| Intelligence | Trí tuệ | 智能 |
| Elevation | Nâng tầm | 提升 |
| Trust | Tin cậy | 信任 |
| Impact | Tác động | 影响 |
| product | sản phẩm | 产品 |
| capability | năng lực | 能力 |
| evidence | bằng chứng | 证据 |
| evidence passport | hồ sơ bằng chứng | 证据档案 |
| boundary (statement) | giới hạn | 边界说明 |
| claim | tuyên bố | 声明 |
| review | soát xét | 审阅 |
| source | nguồn | 来源 |
| public proof | bằng chứng công khai | 公开证据 |
| verified public artifact | bằng chứng công khai đã xác minh | 已核验的公开凭证 |
| not a concept mock | không phải bản mô phỏng ý tưởng | 并非概念稿 |

## Truth-state vocabulary (canonical — never re-worded)

| English | Vietnamese | 中文 |
| --- | --- | --- |
| source-linked | Đã gắn nguồn | 已关联来源 |
| reviewed | Đã xem xét | 已审阅 |
| changed | Đã thay đổi | 已变更 |
| not-published | Chưa công bố | 尚未公布 |
| unavailable | Không khả dụng | 暂不可用 |

**Never** available in any state: certified / audited / compliant / guaranteed / secure / verified-by-us,
and their Chinese equivalents 认证 / 审计 / 合规 / 保证 / 安全认证. Assurance language may not be invented in
translation — an added 认证 is a fabricated claim, not a phrasing choice.

## Navigation & chrome

| English | Vietnamese | 中文 |
| --- | --- | --- |
| Products | Sản phẩm | 产品 |
| About / About BlueSkyz | Về BlueSkyz | 关于我们 |
| Contact / Contact us | Liên hệ | 联系我们 |
| Support | Hỗ trợ | 支持 |
| Privacy | Quyền riêng tư | 隐私 |
| Security | Bảo mật | 安全 |
| Menu | Menu | 菜单 |
| Search | Tìm | 搜索 |
| Search pages | Tìm trang | 搜索页面 |
| Explore products | Khám phá sản phẩm | 探索产品 |
| Explore all products | Khám phá tất cả sản phẩm | 探索全部产品 |
| Featured products | Sản phẩm nổi bật | 精选产品 |
| View profile | Xem hồ sơ | 查看产品简介 |
| Language | Ngôn ngữ | 语言 |
| Light / Dark / System | Sáng / Tối / Hệ thống | 浅色 / 深色 / 跟随系统 |

## Tone rules

1. Prefer 动词+宾语 (“探索产品”) over noun-stacking for actions.
2. Address the visitor as 您 implicitly; avoid 你.
3. Keep technical nouns stable: 证据, 来源, 边界, 声明, 产品, 能力 — never swap in synonyms mid-surface.
4. Do not localize proper nouns: BlueSkyz Labs, ApexAgent, Sổ Tâm, Sổ Trọ, FluentArc, Vững Tay Lái.
5. Numbers, dates and currency stay locale-formatted by the presentation layer, not by the string itself.
6. Locale ≠ jurisdiction: a Chinese-language page does not imply a Chinese entity, address, currency or law.