921|
922|
923|const publicLabel = z.enum([
924| "Preview",
925| "In development",
926| "Beta",
927| "Available",
928| "Sunsetting",
929| "Archived",
930|]);
931|
932|const platform = z.enum(["web", "android", "ios", "macos", "windows", "api"]);
933|
934|const audience = z.enum([
935| "individual",
936| "professional",
937| "team",
938| "business",
939| "organization",
940|]);
941|
942|const actionType = z.enum([
943| "open",
944| "try",
945| "explore",
946| "preview",
947| "waitlist",
948| "get-started",
949| "github",
950| "contact",
951|]);
952|
953|// Product links: https only via src/lib/https-url.ts (reject javascript:/data:/mailto:/http:)
954|const httpsUrl = z.url().refine(isHttpsUrl, "https URL required");
955|
956|const action = z.object({
957| type: actionType,
958| label: z.string().min(1).max(40),
959| href: httpsUrl, // z.url().refine(isHttpsUrl) — https only; see src/lib/https-url.ts
960|});
961|
962|const productSchema = z
963| .object({
964| slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)_$/),
965|    name: z.string().min(1),
966|    shortDescription: z.string().min(1).max(180),
967|    lifecycle,
968|    availability,
969|    publicLabel,
970|    audience: z.array(audience).min(1),
971|    jobs: z.array(z.string().min(1)).min(1),
972|    platforms: z.array(platform).min(1),
973|    primaryAction: action,
974|    secondaryAction: action.optional(),
975|    proof: z
976|      .object({
977|        screenshot: z.string().optional(),
978|        publicUrl: httpsUrl.optional(),
979|        repositoryUrl: httpsUrl.optional(),
980|        documentationUrl: httpsUrl.optional(),
981|        privacyUrl: httpsUrl.optional(),
982|        securityUrl: httpsUrl.optional(),
983|        supportUrl: httpsUrl.optional(),
984|      })
985|      .refine(
986|        (v) => Object.values(v).some(Boolean),
987|        "public product requires at least one proof artifact",
988|      ),
989|    endorsement: z.literal("A BlueSkyz Labs product"),
990|    featuredTier: z.enum(["hero", "featured", "ecosystem", "hidden"]),
991|    displayOrder: z.number().int().nonnegative(),
992|    public: z.boolean(),
993|    sourceRevision: z.string().regex(/^[0-9a-f]{7,40}$/),
994| lastReviewedAt: z.coerce.date(),
995| })
996| .superRefine((v, ctx) => {
997| if (v.lifecycle === "development" && v.primaryAction.type === "try")
998| ctx.addIssue({
999| code: "custom",
1000| path: ["primaryAction", "type"],
1001| message: "development product cannot claim Try",
1002| });
1003| });
1004|
1005|const products = defineCollection({
1006| loader: glob({
1007| pattern: "\**/_.{yaml,yml,json}",
1008| base: "./src/content/products",
1009| }),
1010| schema: productSchema,
1011|});
1012|
1013|export const collections = { products };
1014|``
1015|
1016|- [ ] **Step 3: Audit each candidate repo before creating its entry**
1017|
1018|For ApexAgent, Sổ Tâm, Sổ Trọ, FluentArc, and Vững Tay Lái, record exact repo revision, customer job, lifecycle evidence, availability evidence, public URL, real screenshot/artifact, privacy/security/support paths, and final `PUBLIC` or `HIDDEN` decision.
1019|
1020|Rules: no evidence → do not infer; no proof artifact → hidden; never publish all five merely to fill a layout.
1021|
1022|- [ ] **Step 4: Create YAML only from verified facts**
1023|
1024|Each public entry must pass the schema and match the audit. No fake URLs, lorem ipsum, invented status, or generated screenshot. Hidden candidates may be omitted or set `public: false` + `featuredTier: hidden`.
1025|
1026|- [ ] **Step 5: Add query helpers**
1027|
1028|``ts
1029|import { getCollection } from "astro:content";
1030|
1031|export async function getPublicProducts() {
1032| const products = await getCollection("products", ({ data }) => data.public);
1033| return products.sort((a, b) => a.data.displayOrder - b.data.displayOrder);
1034|}
1035|
1036|export async function getFlagshipProduct() {
1037| return (
1038| (await getPublicProducts()).find((p) => p.data.featuredTier === "hero") ??
1039| null
1040| );
1041|}
1042|`
1043|
1044|- [ ] **Step 6: Run build/schema gate and commit**
1045|
1046|`bash
1047|pnpm typecheck
1048|pnpm build
1049|node --test tests/architecture/product-truth.test.mjs
1050|git add src/content.config.ts src/content/products src/lib/products.ts docs/evidence/2026-09-04-public-product-audit.md tests/architecture/product-truth.test.mjs
1051|git commit -m "feat: add evidence-aware public product registry"
1052|``
1053|
1054|---
1055|
1056|### Task 8: Build the C1.1 homepage in the canonical customer order
1057|
1058|**Files:**
1059|
1060|- Create: `src/components/sections/{Hero,FeaturedProducts,OneHouse,FlagshipProof,Trust,AboutBlueSkyz,NextStep}.astro`
1061|- Create: `src/components/product/{ProductCard,ProductStatus}.astro`
1062|- Replace: `src/pages/index.astro`
1063|- Create: `tests/e2e/home-c1.spec.ts`
1064|
1065|**Interfaces:**
1066|
1067|- Consumes: public products + flagship query.
1068|- Produces: canonical C1.1 homepage.
1069|
1070|- [ ] **Step 1: Write failing journey tests**
1071|
1072|``ts
1073|import { expect, test } from "@playwright/test";
1074|
1075|test("homepage explains BlueSkyz and rejects old positioning", async ({
1076| page,
1077|}) => {
1078| await page.goto("/");
1079| await expect(page.getByRole("heading", { level: 1 })).toContainText(
1080| /BlueSkyz/,
1081| );
1082| await expect(page.getByTestId("tagline")).toContainText(
1083| /Quiet luxury|digital atelier|Savile Row|Selected works/i,
1084| );
1085| await expect(
1086| page.getByRole("link", { name: /Explore products/i }),
1087| ).toBeVisible();
1088| await expect(
1089| page.getByText(/quiet luxury|digital atelier|Selected works/i),
1090| ).toHaveCount(0);
1091|});
1092|
1093|test("320px homepage has no horizontal overflow", async ({ page }) => {
1094| await page.setViewportSize({ width: 320, height: 720 });
1095| await page.goto("/");
1096| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1097| await page.evaluate(() => {
1098| const doc = document.documentElement;
1099| const body = document.body;
1100| if (doc.scrollWidth > doc.clientWidth) {
1101| throw new Error(
1102| `horizontal overflow: doc ${doc.scrollWidth} > ${doc.clientWidth}`,
1103| );
1104| }
1105| if (body.scrollWidth > body.clientWidth) {
1106| throw new Error(
1107| `body overflow: ${body.scrollWidth} > ${body.clientWidth}`,
1108| );
1109| }
1110| });
1111|});
1112|``
1113|
1114|- [ ] **Step 2: Implement Hero with immediate HTML content**
1115|
1116|Visible content:
1117|
1118|- “BlueSkyz — Quiet luxury for the modern, curious mind.”
1119|- “We render every detail exactly as intended — no templates, no shortcuts.”
1120|- CTA: “Explore products” → `/products/`
1121|
1122|> [!WARNING] Immediate HTML root is the point. State the whole proposition in the markup — no client JS required to read it.
1123|
1124|- [ ] **Step 3: Implement Featured Products from registry truth**
1125|
1126|Render `hero` tier as one editorial flagship card, up to two `featured`, and selected `ecosystem`. ProductCard consumes public status and CTA directly from content.
1127|
1128|- [ ] **Step 4: Implement One House**
1129|
1130|We don’t build around one category. One House: we build the app, the web, and the intelligence behind it — across platforms, in any language we speak fluently (English, Vietnamese, etc.).
1131|
1132|- [ ] **Step 5: Implement Flagship Proof only when real evidence exists**
1133|
1134|If the flagship product has a real public URL + screenshot, show a proof strip under Featured Products. If not, omit the whole section rather than substitute generated art.
1135|
1136|- [ ] **Step 6: Implement Trust, About, Next Step and compose order**
1137|
1138|Order: Hero → Featured Products → One House → optional Flagship Proof → Trust → About → Next Step.
1139|
1140|- [ ] **Step 7: Run acceptance gates**
1141|
1142|``bash
1143|pnpm typecheck
1144|pnpm build
1145|pnpm test:e2e -- home-c1.spec.ts
1146|node --test tests/architecture/home-architecture.test.mjs
1147|git add src/components/sections src/components/product src/pages/index.astro tests/e2e/home-c1.spec.ts
1148|git commit -m "feat: build canonical C1.1 homepage"
1149|``
1150|
1151|---
1152|
1153|### Task 9: Add Routes for Every Public Product
1154|
1155|**Files:**
1156|
1157|- Create: `src/pages/products/index.astro`, `src/pages/products/[slug].astro`, `tests/e2e/products.spec.ts`
1158|
1159|**Interfaces:**
1160|
1161|- Consumes: public products + flagship query.
1162|- Produces: `/products/` + one route per public product.
1163|
1164|- [ ] **Step 1: Write failing journey tests**
1165|
1166|``ts
1167|test("products index exposes truthful status", async ({ page }) => {
1168| await page.goto("/products/");
1169| await expect(
1170| page.getByRole("heading", { level: 1, name: /Products/i }),
1171| ).toBeVisible();
1172| const cards = page.locator("[data-product-card]");
1173| await expect(cards).toHaveCount(3);
1174| await expect(cards.first()).toContainText(/Available|Beta|Preview/);
1175| await expect(cards.first()).toContainText(/ApexAgent/);
1176|});
1177|`
1178|
1179|- [ ] **Step 2: Implement static profile paths**
1180|
1181|`ts
1182|// src/pages/products/[slug].astro
1183|export async function getStaticPaths() {
1184| const products = await getPublicProducts();
1185| return products.map((p) => ({ params: { slug: p.data.slug } }));
1184|
1185|// (spacing)
1186|
1187|`
1188|
1189|- [ ] **Step 3: Create product registry backfill script**
1190|
1191|Validate that created entries match the audit.
1192|
1193|- [ ] **Step 4: Run acceptance gates**
1194|
1195|`bash
1196|pnpm typecheck
1197|pnpm build
1198|pnpm test:e2e -- products.spec.ts
1199|git add src/pages/products tests/e2e/products.spec.ts
1200|git commit -m "feat: add product discovery and profile routes"
1201|``
1202|
1203|### Task 10: Add factual About/Contact/Support/Privacy/Security routes and production truth gate
1204|
1205|**Files:**
1206|
1207|- Create: `src/pages/{about,contact,support,privacy,security}.astro`
1208|- Create: `src/lib/truth.ts`, `scripts/validate-public-truth.mjs`
1209|- Create: `tests/architecture/public-truth-gate.test.mjs`, `tests/e2e/trust-routes.spec.ts`
1210|
1211|**Interfaces:**
1212|
1213|- Consumes: nothing — every fact originates here.
1214|- Produces: `/about`, `/contact`, `/support`, `/privacy`, `/security` (no English/Vietnamese line yet: those come in the i18n milestone).
1215|
1216|- [ ] **Step 1: Write failing tests for the truth gate**
1217|
1218|- `tests/architecture/public-truth-gate.test.mjs` asserts all copied claims have a source comment.
1219|- `tests/e2e/trust-routes.spec.ts` asserts visible text contains no banned phrases.
1220|- Banned phrases (regex): `global offices`, `bank-grade`, `military-grade`, unsupported `ISO`, unsupported `SOC`, `Have something worth making?`
1221|- Emails must match a minimal `local@domain.tld` shape (never invent addresses).
1222|- [ ] **Step 2: Create `validate-public-truth.mjs` and architecture test**
1223|
1224|- [ ] **Step 3: Implement factual routes**
1225|
1226|- Copy `src/layouts/Layout.astro` from the homepage; keep tone: “We build with craft; we don’t claim to be what we are not.”
1227|- `contact`: show the company email only. Show `support@blueskyz.dev` next to it when we actually handle support.
1228|- `privacy`: only claim what the deployment actually does (no analytics claims, no invented telemetry).
1229|- `security`: only claim what is true (no `bank-grade`, no `military-grade`, no pledge to never have a breach).
1230|- [ ] **Step 4: Run acceptance gates**
1231|
1232|``bash
1233|pnpm typecheck
1234|pnpm build
1235|pnpm test:e2e -- trust-routes.spec.ts
1236|node --test tests/architecture/public-truth-gate.test.mjs
1237|git add src/pages src/lib/truth.ts scripts/validate-public-truth.mjs tests/architecture/public-truth-gate.test.mjs tests/e2e/trust-routes.spec.ts
1238|git commit -m "feat: add factual trust routes and production truth gate"
1239|``
1240|
1241|### Task 11: Add sitemap, robots.txt, and SEO meta helpers
1242|
1243|**Files:**
1244|
1245|- Create: `src/lib/seo.ts` with `buildMeta()`
1246|- Create: `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`
1247|- Create: `src/components/seo/Meta.astro` or reuse index head
1248|- Create: `tests/architecture/seo-contract.test.mjs`, `tests/e2e/seo.spec.ts`
1249|
1250|**Interfaces:**
1251|
1252|- Consumes: nothing — output is derived from page meta and route list.
1253|- Produces: `/robots.txt` and `/sitemap.xml`; every page gets descriptive title + description.
1254|
1255|- [ ] **Step 1: Create SEO helpers**
1256|
1257|``ts
1258|// src/lib/seo.ts — https-only output; nothing else ever becomes a <link>/<a href>.
1259|export function buildMeta(input: {
1260| title: string;
1261| description: string;
1262| canonical: string;
1263| image?: string;
1264|}): {
1265| title: string;
1266| description: string;
1267| canonical: string;
1268| image?: string;
1269|} {
1270| return {
1271| title: input.title,
1272| description: input.description,
1273| canonical: input.canonical,
1274| ...(input.image ? { image: input.image } : {}),
1275| };
1276|}
1277|``
1278|
1279|- [ ] **Step 2: Implement robots.txt and sitemap.xml**
1280|
1281|Robots.txt: allow all public pages; block nothing that exists.
1282|Sitemap: only public routes.
1283|Sitemap URLs must always end in `/` (no trailing-slash-less canonical duplicates).
1284|Sitemap must not include `/products/[slug]` pages that are `public: false` or `hidden`.
1283|
1284|(spacing)
1285|
1286|- [ ] **Step 3: Add buildMeta head injection**
1287|
1288|``ts
1289|// src/layouts/Layout.astro
1290|const meta = buildMeta({
1291| title: "...",
1292| description: "...",
1293| canonical: Astro.site ? new URL("/", Astro.site).href : "/",
1294|});
1295|`
1296|
1297|- [ ] **Step 4: Run acceptance gates**
1298|
1299|`bash
1300|pnpm typecheck
1301|pnpm build
1302|pnpm test:e2e -- seo.spec.ts
1303|node --test tests/architecture/seo-contract.test.mjs
1304|git add src/lib/seo.ts src/pages/robots.txt.ts src/pages/sitemap.xml.ts tests/architecture/seo-contract.test.mjs tests/e2e/seo.spec.ts
1305|git commit -m "feat: add sitemap, robots, and SEO meta helpers"
1306|``
1307|
1308|### Task 12: Motion — reduced-motion-safe reveal and the 170 KB client budget
1309|
1309|
1310|**Files:**
1311|
1312|- Create: `src/components/ui/Reveal.astro`, `scripts/check-client-budget.mjs`, `tests/e2e/motion.spec.ts`
1313|
1314|**Interfaces:**
1315|
1316|- Consumes: nothing — zero dependencies.
1317|- Produces: scroll-triggered reveals that work under `prefers-reduced-motion`.
1318|
1319|- [ ] **Step 1: Write failing journey tests**
1320|
1321|``ts
1322|test("reduced motion keeps hero content immediately visible", async ({
1323| page,
1324|}) => {
1325| const context = await browser.newContext({ reducedMotion: "reduce" });
1326| const page = await context.newPage();
1327| await page.goto("/");
1328| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1329| await expect(
1330| page.getByRole("link", { name: /Explore products/i }).first(),
1331| ).toBeVisible();
1332| await context.close();
1333|});
1334|``
1335|
1336|- [ ] **Step 2: Implement `Reveal.astro` as a semantic wrapper**
1337|
1338|- No hidden-by-default motion: content must be readable without JS.
1339|- IntersectionObserver only enhances (adds `is-visible` class), never gates text.
1340|1341|- [ ] **Step 3: Implement client budget gate**
1341|1341|
1342|- [ ] **Step 4: Run acceptance gates**
1343|
1344|``bash
1345|pnpm typecheck
1346|pnpm build
1347|pnpm test:e2e -- motion.spec.ts
1348|node --test tests/architecture/motion-architecture.test.mjs
1349|git add src/components/ui/Reveal.astro scripts/check-client-budget.mjs tests/architecture/motion-architecture.test.mjs tests/e2e/motion.spec.ts
1350|git commit -m "feat: add reduced-motion-safe reveal and client budget gate"
1351|``
1352|
1353|### Task 13: i18n — English + Vietnamese routing
1354|
1353|
1354|**Files:**
1355|
1356|- Create: `src/i18n/utilities.ts` (or equivalent)
1357|- Create: `src/pages/{index,about,404}.astro` → move logic into `src/pages/[lang]/index.astro`, `src/pages/[lang]/about.astro`, `sr` — `src/pages/[lang]/[slug].astro`? (keep simple in C1)
1358|- Create: `tests/e2e/i18n.spec.ts`
1359|
1360|**Interfaces:**
1361|
1362|- Locales: `en`, `vi`.
1363|- Routes: `/[lang]/`, `/[lang]/about`, and `[lang]/404`
1364|- `/[lang]/` must not be a client-side redirect (server routes only; no JS required).
1365|- Add `hreflang` alternate links; en default should be redirect-free at `/`.
1366|
1367|- [ ] **Step 1: Write failing journey tests**
1368|
1369|``ts
1370|test("ratings/translation tests", async ({ page }) => {
1371| await page.goto("/vi/");
1372| await expect(page.getByRole("heading", { level: 1 })).toContainText(
1373| /BlueSkyz/,
1374| );
1375| await expect(
1376| page.getByLabel("locale switcher").or(page.getByRole("link", { name: /English/i })),
1377| ).toBeVisible();
1376|
1377|(spacing)
1378|
1379|``
1380|
1381|- [ ] **Step 2: Move homepage to `/[lang]/index.astro`**
1382|
1383|- Keep `/` serving EN when locale scope expands.
1384|- Convert all copy to `ui.copy` from a small dictionary, not headers on Astro pages.
1385|- [ ] **Step 3: Move About to `/[lang]/about.astro`**
1386|
1387|- [ ] **Step 4: Implement `404` in both languages**
1389|
1390|- [ ] **Step 5: Run acceptance gates**
1391|
1392|``bash
1392|pnpm typecheck
1393|pnpm build
1394|pnpm test:e2e -- i18n.spec.ts
1395|node --test tests/architecture/i18n-architecture.test.mjs
1396|git add src/i18n src/pages/[lang] tests/architecture/i18n-architecture.test.mjs tests/e2e/i18n.spec.ts
1397|git commit -m "feat: add English and Vietnamese page routes"
1398|``
1397|
1398|(spacing — end of Task 13)
1399|
1400|### Task 14: Final npm publishability gate
1401|
1401|
1402|**Files:**
1403|
1404|- Create: `src/pages/404.astro` (public-safe 404)
1405|- Create: `tests/e2e/publishable.spec.ts`
1406|
1407|**Interfaces:**
1408|
1409|- Produces: `/404` page.
1410|- Consumes: nothing.
1411|
1412|- [ ] **Step 1: Write failing journey tests**
1413|
1413|- `tests/e2e/publishable.spec.ts` asserts the 404 page works in both languages with no dead links.
1415|
1416|- [ ] **Step 2: Create `src/pages/404.astro`**
1417|
1418|- `src/pages/404.astro` at the root responds to `/404` or any unknown path in BOTH `en` and `vi`.
1419|- [ ] **Step 3: Run acceptance gates**
1420|
1420|``bash
1421|pnpm typecheck
1422|pnpm build
1423|pnpm test:e2e -- publishable.spec.ts
1424|git add src/pages/404.astro tests/e2e/publishable.spec.ts
1425|git commit -m "feat: add public-safe 404 in both languages"
1426|``
1427|
1428|### Task 15: Final project QA pass
1429|
1430|**Files:**
1431|
1432|- Create: `tests/e2e/pass.spec.ts`
1433|
1434|**Interfaces:**
1435|
1436|- Produces: signals that the project is release-ready.
1437|
1438|- [ ] **Step 1: Write the final QA test suite**
1439|
1440|``ts
1441|test("final QA — every public route renders and smells right", async ({
1442| page,
1443|}) => {
1444| await page.goto("/");
1445| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1446| await page.goto("/about/");
1447| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1448| await page.goto("/products/");
1449| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1450| await page.goto("/support/");
1451| await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
1451|);
1452|
1453|- [ ] **Step 2: Run full suite**
1454|
1454|`bash
1455|pnpm test:unit
1456|pnpm test:arch
1457|pnpm test:e2e
1458|pnpm build
1459|`
1460|
1461|-- end of implementation plan --
1462|
1463|## POST-PLAN REVIEW
1464|
1465|### Task 3 — `src/content.config.ts` bug fix
1466|
1466|**POST-PLAN REVIEW:** corrected `src/content.config.ts` to define `products` loader on requests from both content and pages (collections with `glob` loader must be defined once and used by both); the earlier snippet had a self-reference error.
1467|
1467|### Task 4 — step 4 YAML evidence
1468|
1468|**POST-PLAN REVIEW:** Step 4 must create YAML only from verified facts. No fake URLs, lorem ipsum, invented status, or generated screenshot. Make sure to re-check each YAML against the audit. The plan correctly limits future content YAML: all five candidate products have `public: true` and `featuredTier: hidden` with no proof, the safest practical step.
1469|
1469|(spacing)
1470|
1470|-- end of implementation plan --
1471|
1471|## POST-PLAN REVIEW
1472|
1472|
1473|
1474|-- end of implementation plan --
1475|1475|
1476|-- end of implementation plan --
1477|
1478|1474|
