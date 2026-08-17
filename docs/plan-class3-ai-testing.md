# 製作規格：AI 測試實戰－從自動測試到跨專案整合

第三堂課的互動簡報。這份文件是建置的唯一依據，內容來自 Notion 課綱
（`https://app.notion.com/p/3bd6ab47eb4880188035f97eec89ced6`）與其上 15 則 comment。
**comment 才是需求，課綱本文只是參考資料。**

- 落點：`src/class3/AI 測試實戰/`
- 路由：`/class3/ai-testing`
- 規模：**44 頁**，互動 demo 21 支
- 狀態：已建置並通過驗收，之後經卡斯伯回饋修訂三輪（2026-08-15、2026-08-16 兩次）

## 2026-08-15 修訂（第一版建好之後）

| 回饋 | 處理 |
| --- | --- |
| 跟課程範例有關的頁面要**同一種風格、同一種標題，統一點明是課程範例** | 第 08／12／19／37 頁改用共用的 `CourseExampleView`，標題一律「課程範例 · xxx」 |
| 提示詞「只是單純的提示詞」，不該包成假 TypeScript，**要用 Claude Code 的介面帶入** | 新增 `demos-example.tsx`，左欄是 Claude Code 終端機介面，提示詞以純文字排版 |
| Integration Test 的「各自都對」在這個案例不該測到 Database，那樣比較像 unit | 情境一改成「各自的單元測試」：三個模組獨立、**之間不畫箭頭**，明講單元測試不跨模組邊界；情境二才串起來 |
| Contract Test 想提到 openapi 搭配 Postman，可以一次測全部 | 加「一次測全部」模式：openapi.json → openapi-to-postmanv2 → Collection，四個端點一次跑完並給彙總 |
| E2E Test 想加入「人工還要一個一個點，很慢」的感覺 | 加「人工手動測／E2E 自動跑」模式：人工要一頁一頁點，累計 15 次操作 · 2 分 0 秒；自動 0 次 · 6.4 秒，兩邊數字並排對照 |
| 調整 Effort 應該也會影響 Context 消耗 | `contextPct` 改成 Session/SubAgent 決定基準、Effort 再位移 ±10（low/medium/high），長條會實際伸縮 |
| 「AI 修正迴圈」「CI Review Skill」兩頁不需要 | 刪除，`CiAiLoopDemo` 與其專用常數一併移除，40 頁 → 38 頁 |

## 2026-08-16 修訂（第二輪）

| 回饋 | 處理 |
| --- | --- |
| 「為什麼要拆專案」前面再加一章「正常開發什麼情況會有多個專案」 | 新增第 04 頁 `multi-project`：左小型專案資料夾樹、右中大型五個專案方塊，靜態對照 |
| 「OpenAPI 橋接」之後補上給人看的 Postman 介面 | 新增第 08 頁 `postman-ui`：用專案色票重畫的可互動 Postman（不嵌深色截圖），點請求換主面板、Send 出回應 |
| 課程範例 · OpenAPI 要加給同學的額外學習文件 | `CourseExampleSpec` 新增 `extraDoc`，只有 OpenAPI 那頁帶連結 |
| 第二章內文改成指定的兩段 | `ch-quality` 的 lead 逐字替換 |
| AI Rules 想看到完整的 AGENTS.md，可以捲動 | 左欄改成完整 Markdown 文件（400px 框、可捲動），其中 4 條是核取方塊開關 |
| 「第 3 步注入錯誤」改成「第 3 步注入新功能」 | WhyTestDemo 全部相關文案一起改：新功能弄壞既有行為卻沒被擋下 |
| E2E 的選項與執行按鈕長得一樣，分不出來 | **共用元件層修正**：`Segment` 改群組方框＋小標、`ToolButton` 改藥丸＋`▶`/`↺`；同樣模式的 CI 流程頁一併套用 |
| 「怎麼選測試」要更多說明與對應案例 | 改成四欄：測試類型／什麼時候要用／測的是什麼／這門課的具體案例 |
| 「另開新的」Session 主 Session 不該佔用 context | 改成兩條長條（主 Session／另一邊）：沿用 80%–0%、另開新的 22%–72%、SubAgent 22%–68% |
| 加入價格試算 | 相對倍率的「示意試算」（以 Sonnet+medium+不開 SubAgent 為 1×），Model／Effort／SubAgent 都會動；並點明換 Session 不影響總成本 |

## 2026-08-16 修訂（第三輪）

| 回饋 | 處理 |
| --- | --- |
| 第二章上、第二章下各加開頭與結尾 | 各插入一頁「會學到」與一頁「重點」，共 4 頁（40 → 44 頁） |
| 首頁最外層大標 | 「React 互動式教學簡報」→「AI 開發進化營」（`src/pages/Home.tsx`）。`index.html` 的分頁標題仍是舊字串，未動 |

四頁都用 `points`、6 項、`heading` 起頭；「會學到」統一 blue、「重點」統一 acid。
內容經第二個代理逐條對帳過：每一條都對得到實際教學頁，數字全部取自 demo 元件裡的真值。

⚠ **這四頁的高度餘裕是 0**（清單 764/764）。所以它們**刻意不給 `description`**，
而且每一項的 text 與 note 都必須各自維持一行 —— 任何一條 note 加長到換行就會溢出。
要改文案的話改完一定要重跑稽核。

## 已確認的決定

| 項目 | 決定 |
| --- | --- |
| 涵蓋範圍 | comment 指定的 24 頁必做；另補 16 頁結構性內容（下表標「結」） |
| 測試類型 | **一律四種**（Unit / Integration / API·Contract / E2E）。Visual Regression 全面不收，連總覽表格都不列 |
| 情境考題 | 拆兩頁：單選 4 題、複選 3 題 |
| 命名 | `class3` / `ai-testing` |
| Loop Engineering | **不收**。它在父頁面分隔線之後，課綱子頁沒有 |
| Postman 截圖 | **不放**。深色 UI 與紙面色票衝突，改用第 07 頁的文字對照 |
| `courses.ts` | 用 `series: '第三堂課'`，首頁區塊標題就是「第三堂課」（`week: 3` 會渲染成「Week 3」） |

---

## 頁面清單

「來源」欄的 C = comment 指定必做，結 = 補的結構性內容。

### 開場

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 01 | `cover` | title | kicker `Class 3`、大標「AI 測試實戰」、lead 三句、`assetId: 'codex-mode'` | 結 |
| 02 | `agenda` | points | 三條主線：跨專案管理／規範與測試／外部資源整合 | 結 |

### 一、專案管理

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 03 | `ch-project` | title | 章節：一、專案管理 | 結 |
| 04 | `multi-project` | **demo** | 左「小型專案」一個 repo 的資料夾樹（4–6 個資料夾，不需要拆）／右「中、大型專案」五個獨立專案方塊（前台／後台／後端／資料庫／共用契約），依需求拆分。靜態對照，不做切換 | 結 |
| 05 | `why-split` | **demo** | 切換「全部塞給 AI／拆成多專案」。單一大 repo：AI 讀 187 檔、context 92%；拆開後只掛 frontend + 一份 `openapi.json`、context 18% | C1 |
| 06 | `cross-problem` | **demo** | 單一畫面畫兩個專案（左＝目前專案／右＝想引入的外部資源），中間一條斷開的 session 邊界。三選一：什麼都不給（AI 猜錯欄位）／整包丟進去（context 爆滿）／只給必要檔案（`additionalDirectories`、`@../backend/openapi.json`） | C1 |
| 07 | `openapi-bridge` | **demo** | 沿用同一版面，左前端右後端。點「讀取 openapi.json」→ 右側展開 API 清單 → 左側逐一長出對應的前端畫面卡片 | C2 |
| 08 | `postman-ui` | **demo** | 用專案色票重畫的 Postman：左 Collection 樹（Auth／Products／Coupons／Orders／Admin），點請求換主面板，`▶ Send` 出回應。**不嵌原本的深色截圖** | 結 |
| 09 | `human-vs-ai` | split(points+code) | 給人看的 Postman ／ 給 AI 看的 `openapi.json`；右欄放 `settings.json` 的 `additionalDirectories` | 結 |
| 10 | `project-recipes` | **demo** | 課程範例 · OpenAPI：Claude Code 介面帶入建立 OpenAPI 文件的提示詞，右欄是 `feature/openapi`、`codex/admin-dashboard` | 結 |

### 二、程式碼規範與測試

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 11 | `ch-quality` | title | 章節：二、關於測試與程式碼規範 | **C3** |
| 12 | `ch-quality-goals` | points | **第二章上 · 會學到**：兩層規範／靜態檢查／偏差會滾多遠／四種測試／怎麼判斷該補哪一種／七題考題。blue | 結 |
| 13 | `eslint` | **demo** | 小編輯器＋三個分頁：分號 / `let`·`const` / 命名規則。切「套用 ESLint」→ 違規行紅底線＋規則名（`semi`、`prefer-const`、`camelcase`）＋錯誤訊息；按「自動修正」變合規 | C4 |
| 14 | `ai-rules` | **demo** | 左欄是**完整的 AGENTS.md**（400px 框、可捲動），其中 4 條是核取方塊開關；右欄 AI 產出跟著變。底部對照 ESLint（機器讀）／AI Rules（AI 讀），並註明 ESLint 不是唯一選擇 | C5 |
| 15 | `static-check` | **demo** | 課程範例 · 靜態檢查：ESLint Flat Config 提示詞；三道靜態關卡收在「這個範例會做到」；分支 `codex/eslint-errors-demo` ↔ `codex/eslint-clean` | 結 |
| 16 | `why-test` | **demo** | 由左到右 10 個節點的時間線。理想線筆直；**第 3 步注入一個新功能**（文案是「注入新功能」不是「注入錯誤」），它悄悄弄壞既有行為卻沒被測試擋下 → 之後每一步實際線往下偏，偏差累積 1→3→8→15；右側顯示「回溯 N 個 commit 才找得到源頭」。「加入測試」打開 → 第 3 節點就紅燈停住 | C6 |
| 17 | `test-types` | table | 四種測試對照：測試類型／需求／測試範圍／運作方式 | 結 |
| 18 | `test-unit` | **demo** | `calcDiscount(price, coupon)` ＋一組輸入/預期輸出的表，點「執行」逐列跑出 ✓/✗；改參數看哪列變紅 | C7 |
| 19 | `test-integration` | **demo** | 情境一「各自的單元測試」：三模組獨立、不畫箭頭，明講單元測試不跨模組邊界；情境二「串起來卻錯」才串成真實請求，Auth 漏掉 `isAdmin()` | C7 |
| 20 | `test-contract` | **demo** | 逐張判斷四個回應是否符合契約；另有「一次測全部」：openapi.json → Postman Collection，四個端點一次跑完給彙總 | C7 |
| 21 | `test-e2e` | **demo** | 「人工手動測」要一頁一頁點（15 次操作 · 2 分 0 秒）對照「E2E 自動跑」（0 次 · 6.4 秒）；缺少地址欄位的情境會卡在結帳 | C7 |
| 22 | `test-lab` | **demo** | 課程範例 · 測試分支：五支分支（`tests-unit-integration`、`admin-orders-auth-bug`／`-fixed`、`e2e-checkout`、`e2e-required-address-bug`），`npm test` 等指令收在「這個範例會做到」 | 結 |
| 23 | `which-test` | table | 四欄：測試類型／什麼時候要用／測的是什麼／這門課的具體案例。四種測試各自配色（Unit=acid、Integration=teal、Contract=blue、E2E=violet） | **C8** |
| 24 | `quiz-single` | **demo** | 頂部固定圖例 ① Unit ② Integration ③ API／Contract ④ E2E；單選 4 題，每題一行字，解答預設隱藏、點擊展開 | C9 |
| 25 | `quiz-multi` | **demo** | 同上版式，整頁明確標示「複選」，3 題 | C9 |
| 26 | `ch-quality-recap` | points | **第二章上 · 重點**：規範分兩層、靜態檢查最便宜、測試的價值在早一步發現、四種測試不是四選一、選測試先問壞掉時最想先知道什麼。acid | 結 |

### 二（下半）、AI 協作時的測試問題

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 27 | `ch-ai-risk` | title | 章節：AI 協作時，測試可能帶來的問題 | **C10** |
| 28 | `ch-ai-risk-goals` | points | **第二章下 · 會學到**：三個階段的代價＋三個解法，動詞句型，刻意與下一頁的名詞清單錯開。blue | 結 |
| 29 | `risk-overview` | points | 六個問題分三階段——產生：低價值測試；執行：範圍過大、輸出過多、結果不穩定；修正：改測試逃避、缺少停止條件 | 結（補回 comment 沒點名的兩項） |
| 30 | `risk-low-value` | **demo** | `discount.test.ts` 28 個測試，逐一標「這個測試防止什麼問題」；按「只留說得出價值的」→ 剩 6 個，覆蓋率 98%→91%，但抓到的真實 bug 數不變。標出哪些是 getter/setter、只驗證實作細節、重複的邊界 | C11 |
| 31 | `risk-context` | **demo** | Context Window 容量條分段堆疊（專案程式碼／對話／測試 log／stack trace／截圖）。按「跑完整測試」→ log 瞬間吃掉 60%，早期指示開始被壓縮；按「只跑相關測試 + 只留關鍵錯誤」→ 回到 20% | C11 |
| 32 | `risk-cheat` | **demo** | 一個失敗的 unit test（`expect(total).toBe(90)` 實際 100）。「AI 走捷徑」→ 測試被改成 `toBe(100)`，畫面綠燈但金額仍然算錯；「正確做法」→ 改的是 `calcDiscount`，測試不動，綠燈且金額正確。結論一行：綠燈不等於正確 | C11 |
| 33 | `risk-loop` | **demo** | 環形流程自己轉：跑測試→失敗→修改→再跑。次數與 token 消耗累加，改到的檔案越來越多且開始發散到不相關的檔案。「最多修 3 次」開關打開 → 第 3 次停下，狀態變成「交回人工」 | C11 |
| 34 | `fix-writing` | points | 解決方案·產生測試程式碼，純文字三項（優先測商業規則/邊界/錯誤處理/歷史 Bug；計劃模式要求說明每個測試防止什麼；適當使用 Happy Path Test） | **C12** |
| 35 | `fix-modular` | **demo** | 模組方塊 auth / cart / coupon / order / payment / admin。「一次全跑」4m32s、輸出 1,842 行 ↔「只跑改到的 coupon」11s、34 行。可自選要跑哪幾個模組。同時就是「測試範圍過大」的解答 | C13 |
| 36 | `fix-models` | **demo** | 兩條長條看上下文去了哪裡（主 Session／另一邊）：沿用 80–0、另開新的 22–72、SubAgent 22–68；下方是相對倍率的成本示意試算，Model／Effort／SubAgent 都會動 | C13 |
| 37 | `fix-manual` | **demo** | 終端機視窗，點指令 `npm run test:module -- coupon`，逐行印出結果（`setInterval` + state 的打字機效果），可切通過／失敗兩種結果 | C13 |
| 38 | `ch-ai-risk-recap` | points | **第二章下 · 重點**：測試不是越多越好、綠燈不等於正確、Context 是有限資源、要有停止條件、只跑相關測試、換 Session 是換地方承接。acid | 結 |

### 三、外部資源與 GitHub Actions

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 39 | `ch-ci` | title | 章節：三、如何加入外部資源進行測試，並整合 AI 開發 | 結 |
| 40 | `why-ci` | points | 一致的測試環境／合併與部署門檻／耗時工作移出本地端 | 結 |
| 41 | `ci-flow` | **demo** | Notion 那張「GitHub Actions 運作流程」圖的動態版。先選成功／失敗情境 → 按「git push」→ 本地端開發 → GitHub Repository → 觸發 Workflow（Push／PR／排程）→ 建立 Runner（乾淨環境）→ jobs 內 Checkout → 安裝依賴 → 檢查與測試 → Build 逐一打勾 → 成功亮「允許合併／部署」，失敗停在「檢查與測試」變紅並亮「查看 Log／Artifact」 | **C14** |
| 42 | `ci-pros-cons` | split(points+points) | 優缺點各三條，純文字照抄 comment | **C15** |
| 43 | `ci-how` | **demo** | 課程範例 · GitHub Actions：ci.yml 提示詞；三個步驟（設定檔／Artifact／合併條件）收在「這個範例會做到」；分支 `codex/ci-error-demo` → `develop` | 結 |
| 44 | `recap` | points | 重點回顧，上限 6 項 | 結 |

---

## 檔案結構

```
src/class3/AI 測試實戰/
├── slides.ts             # 38 步
├── demos-example.tsx     # 08, 12, 19, 37  CourseExampleView + 四支課程範例
├── demos-project.tsx     # 04–06   WhySplit / CrossProject / OpenApiBridge
├── demos-rules.tsx       # 10, 11  Eslint / AiRules
├── demos-testing.tsx     # 13, 15–18  WhyTest / Unit / Integration / Contract / E2e
├── demos-quiz.tsx        # 21, 22  QuizSingle / QuizMulti
├── demos-risk.tsx        # 25–28  LowValue / ContextWindow / CheatTest / NoStopLoop
├── demos-fix.tsx         # 30–32  ModularTest / ModelSwitch / ManualTerminal
├── demos-ci.tsx          # 35      CiFlow
└── index.tsx
```

**與原規劃的兩點差異：**

- demos 檔案從 4 個變成 8 個。原因是建置時每個檔案交給一個代理平行寫，
  一個檔塞 9 支元件會讓那一支的品質明顯掉下來；拆到每檔 2–5 支之後才穩。
  （`demos-example.tsx` 是修訂時新增的第 8 個。）功能上沒有差別，`slides.ts` 照樣分別 import。
- 沒有 `diagrams.tsx`。38 頁裡沒有任何一頁用 `kind: 'diagram'`，
  需要圖解的地方（時間線、迴圈、CI 流程）都是會動的，SVG 直接寫在對應的 demo 元件內。
  留一個沒人 import 的檔案只是死碼。

註冊兩個地方：

- `src/router.tsx` 加 `{ path: '/class3/ai-testing', element: <AiTestingSlide /> }`
- `src/data/courses.ts` 的 `publicCourses` 加
  `{ id: 'ai-testing', title: 'AI 測試實戰－從自動測試到跨專案整合', path: '/class3/ai-testing', description: '…', series: '第三堂課' }`

## 硬規則（沿用 `.claude/skills/interactive-slide-deck`）

- 顏色只能用 `src/styles/theme.css` 的 token，元件裡出現 hex 就是錯的
- 所有尺寸寫舞台像素（1920×1080），不寫 RWD。內容區實際可用 1824×848
- **低透明度填色不得單獨承擔語意**——狀態一律再配一條 6px 不透明左粗條
- SVG 圖解不畫背景矩形，顏色一律 `var(--color-*)`，文字最小 16
- **不引入 JS 動畫函式庫**。逐步動畫用 `setInterval` + state
- 文字對背景 ≥ 4.5:1（大字 ≥ 3:1）

## 驗收（2026-08-16 第三輪後重跑，全數通過）

1. ✅ `pnpm lint` 與 `pnpm build` 都通過
2. ✅ `pnpm dev:public` 下 44 頁溢出與對比稽核 0 問題（唯一例外見下）
3. ✅ 21 支 demo 的每一個互動狀態逐一點過重驗（不只初始狀態）
4. ✅ 浮水印 0 衝突（`points` 的 `heading` 是區塊元素、框寬撐滿，幾何檢查會誤報；用 Range 量字形右緣在 x≈435，浮水印自 1560 起，間距 1125px）
5. ✅ 鍵盤 `→` `←` `Home` `End` 正常、末頁不會再前進；首頁「第三堂課」區塊看得到

### 刻意的稽核例外：AI Rules 那一頁

第 13 頁的 AGENTS.md 是一個 `h-[400px] overflow-y-auto` 的捲動框，稽核會報
「溢出 0w/370h」。**這是卡斯伯明確要求的**（「看有沒有辦法提供完整的 AGENTS.md，
往下滾動也沒關係」），不是缺陷。除了這一個容器以外，全 deck 不得有任何溢出。

### ⚠ 稽核腳本有一個假陽性，之後再驗要注意

`scripts/audit-slides.js` 的 `parseColor` 用 `String(value).match(/[\d.]+/g)` 取前三個數字當 RGB。
Chrome 會把**帶 `transition-colors` 的元素**的 `backgroundColor` 序列化成 `oklab(...)`，
於是 `oklab(0.940163 -0.0000205934 0.0152842)`（其實是淺色的 `panel-lift`）
被讀成 RGB(0.94, 0.00002, 0.015) ≈ 純黑，整批深色文字會被誤判成 1.27:1；
負號也會被 `[\d.]+` 吃掉。實測有兩頁（ESLint、AI Rules）因此被誤報。

這次是另外寫了一版 oklab→sRGB 的解析來驗證的。要修根本問題的話，
把 `parseColor` 的正規表示式改成 `/-?[\d.]+/g` 並補上 `oklab()` / `oklch()` 的轉換即可。
**在修好之前，稽核報出來的低對比要先確認背景色字串是不是 `oklab(...)`，再決定要不要動程式碼。**
