# 製作規格：AI 測試實戰－從自動測試到跨專案整合

第三堂課的互動簡報。這份文件是建置的唯一依據，內容來自 Notion 課綱
（`https://app.notion.com/p/3bd6ab47eb4880188035f97eec89ced6`）與其上 15 則 comment。
**comment 才是需求，課綱本文只是參考資料。**

- 落點：`src/class3/AI 測試實戰/`
- 路由：`/class3/ai-testing`
- 規模：**38 頁**，互動 demo 19 支
- 狀態：已建置並通過驗收（2026-08-15），之後經卡斯伯回饋修訂一輪

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
| 04 | `why-split` | **demo** | 切換「全部塞給 AI／拆成多專案」。單一大 repo：AI 讀 187 檔、context 92%；拆開後只掛 frontend + 一份 `openapi.json`、context 18% | C1 |
| 05 | `cross-problem` | **demo** | 單一畫面畫兩個專案（左＝目前專案／右＝想引入的外部資源），中間一條斷開的 session 邊界。三選一：什麼都不給（AI 猜錯欄位）／整包丟進去（context 爆滿）／只給必要檔案（`additionalDirectories`、`@../backend/openapi.json`） | C1 |
| 06 | `openapi-bridge` | **demo** | 沿用同一版面，左前端右後端。點「讀取 openapi.json」→ 右側展開 API 清單 → 左側逐一長出對應的前端畫面卡片 | C2 |
| 07 | `human-vs-ai` | split(points+code) | 給人看的 Postman ／ 給 AI 看的 `openapi.json`；右欄放 `settings.json` 的 `additionalDirectories` | 結 |
| 08 | `project-recipes` | **demo** | 課程範例 · OpenAPI：Claude Code 介面帶入建立 OpenAPI 文件的提示詞，右欄是 `feature/openapi`、`codex/admin-dashboard` | 結 |

### 二、程式碼規範與測試

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 09 | `ch-quality` | title | 章節：二、關於測試與程式碼規範 | **C3** |
| 10 | `eslint` | **demo** | 小編輯器＋三個分頁：分號 / `let`·`const` / 命名規則。切「套用 ESLint」→ 違規行紅底線＋規則名（`semi`、`prefer-const`、`camelcase`）＋錯誤訊息；按「自動修正」變合規 | C4 |
| 11 | `ai-rules` | **demo** | 左：`AGENTS.md` 規則逐條勾選；右：AI 產出跟著變。沒勾「不得為了讓測試通過而刪除斷言」→ 產出「已刪除 3 個斷言，測試通過 ✅」；勾了 → 「測試失敗，原因是…」。底部對照：ESLint＝機器讀的規則、AI Rules＝AI 讀的規則，並註明 ESLint 只是 JS 的常見選項、不是唯一選擇 | C5 |
| 12 | `static-check` | **demo** | 課程範例 · 靜態檢查：ESLint Flat Config 提示詞；三道靜態關卡收在「這個範例會做到」；分支 `codex/eslint-errors-demo` ↔ `codex/eslint-clean` | 結 |
| 13 | `why-test` | **demo** | 由左到右 10 個節點的時間線。理想線筆直；第 3 個節點注入一個沒被發現的錯誤 → 之後每一步實際線往下偏，偏差累積 1→3→8→15；右側顯示「回溯 N 個 commit 才找得到源頭」。「加入測試」開關打開 → 第 3 節點就紅燈停住，偏移不會擴大 | C6 |
| 14 | `test-types` | table | 四種測試對照：測試類型／需求／測試範圍／運作方式 | 結 |
| 15 | `test-unit` | **demo** | `calcDiscount(price, coupon)` ＋一組輸入/預期輸出的表，點「執行」逐列跑出 ✓/✗；改參數看哪列變紅 | C7 |
| 16 | `test-integration` | **demo** | 情境一「各自的單元測試」：三模組獨立、不畫箭頭，明講單元測試不跨模組邊界；情境二「串起來卻錯」才串成真實請求，Auth 漏掉 `isAdmin()` | C7 |
| 17 | `test-contract` | **demo** | 逐張判斷四個回應是否符合契約；另有「一次測全部」：openapi.json → Postman Collection，四個端點一次跑完給彙總 | C7 |
| 18 | `test-e2e` | **demo** | 「人工手動測」要一頁一頁點（15 次操作 · 2 分 0 秒）對照「E2E 自動跑」（0 次 · 6.4 秒）；缺少地址欄位的情境會卡在結帳 | C7 |
| 19 | `test-lab` | **demo** | 課程範例 · 測試分支：五支分支（`tests-unit-integration`、`admin-orders-auth-bug`／`-fixed`、`e2e-checkout`、`e2e-required-address-bug`），`npm test` 等指令收在「這個範例會做到」 | 結 |
| 20 | `which-test` | table | 判斷情境 → 建議測試 → 範例 | **C8** |
| 21 | `quiz-single` | **demo** | 頂部固定圖例 ① Unit ② Integration ③ API／Contract ④ E2E；單選 4 題，每題一行字，解答預設隱藏、點擊展開 | C9 |
| 22 | `quiz-multi` | **demo** | 同上版式，整頁明確標示「複選」，3 題 | C9 |

### 二（下半）、AI 協作時的測試問題

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 23 | `ch-ai-risk` | title | 章節：AI 協作時，測試可能帶來的問題 | **C10** |
| 24 | `risk-overview` | points | 六個問題分三階段——產生：低價值測試；執行：範圍過大、輸出過多、結果不穩定；修正：改測試逃避、缺少停止條件 | 結（補回 comment 沒點名的兩項） |
| 25 | `risk-low-value` | **demo** | `discount.test.ts` 28 個測試，逐一標「這個測試防止什麼問題」；按「只留說得出價值的」→ 剩 6 個，覆蓋率 98%→91%，但抓到的真實 bug 數不變。標出哪些是 getter/setter、只驗證實作細節、重複的邊界 | C11 |
| 26 | `risk-context` | **demo** | Context Window 容量條分段堆疊（專案程式碼／對話／測試 log／stack trace／截圖）。按「跑完整測試」→ log 瞬間吃掉 60%，早期指示開始被壓縮；按「只跑相關測試 + 只留關鍵錯誤」→ 回到 20% | C11 |
| 27 | `risk-cheat` | **demo** | 一個失敗的 unit test（`expect(total).toBe(90)` 實際 100）。「AI 走捷徑」→ 測試被改成 `toBe(100)`，畫面綠燈但金額仍然算錯；「正確做法」→ 改的是 `calcDiscount`，測試不動，綠燈且金額正確。結論一行：綠燈不等於正確 | C11 |
| 28 | `risk-loop` | **demo** | 環形流程自己轉：跑測試→失敗→修改→再跑。次數與 token 消耗累加，改到的檔案越來越多且開始發散到不相關的檔案。「最多修 3 次」開關打開 → 第 3 次停下，狀態變成「交回人工」 | C11 |
| 29 | `fix-writing` | points | 解決方案·產生測試程式碼，純文字三項（優先測商業規則/邊界/錯誤處理/歷史 Bug；計劃模式要求說明每個測試防止什麼；適當使用 Happy Path Test） | **C12** |
| 30 | `fix-modular` | **demo** | 模組方塊 auth / cart / coupon / order / payment / admin。「一次全跑」4m32s、輸出 1,842 行 ↔「只跑改到的 coupon」11s、34 行。可自選要跑哪幾個模組。同時就是「測試範圍過大」的解答 | C13 |
| 31 | `fix-models` | **demo** | 切 Model／Effort／Session／SubAgent。**Effort 會實際推動 Context 長條**（±10），Session 與 SubAgent 決定基準 | C13 |
| 32 | `fix-manual` | **demo** | 終端機視窗，點指令 `npm run test:module -- coupon`，逐行印出結果（`setInterval` + state 的打字機效果），可切通過／失敗兩種結果 | C13 |

### 三、外部資源與 GitHub Actions

| # | id | 版型 | 內容 | 來源 |
| --- | --- | --- | --- | --- |
| 33 | `ch-ci` | title | 章節：三、如何加入外部資源進行測試，並整合 AI 開發 | 結 |
| 34 | `why-ci` | points | 一致的測試環境／合併與部署門檻／耗時工作移出本地端 | 結 |
| 35 | `ci-flow` | **demo** | Notion 那張「GitHub Actions 運作流程」圖的動態版。先選成功／失敗情境 → 按「git push」→ 本地端開發 → GitHub Repository → 觸發 Workflow（Push／PR／排程）→ 建立 Runner（乾淨環境）→ jobs 內 Checkout → 安裝依賴 → 檢查與測試 → Build 逐一打勾 → 成功亮「允許合併／部署」，失敗停在「檢查與測試」變紅並亮「查看 Log／Artifact」 | **C14** |
| 36 | `ci-pros-cons` | split(points+points) | 優缺點各三條，純文字照抄 comment | **C15** |
| 37 | `ci-how` | **demo** | 課程範例 · GitHub Actions：ci.yml 提示詞；三個步驟（設定檔／Artifact／合併條件）收在「這個範例會做到」；分支 `codex/ci-error-demo` → `develop` | 結 |
| 38 | `recap` | points | 重點回顧，上限 6 項 | 結 |

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

## 驗收（2026-08-15 全數通過）

1. ✅ `pnpm lint` 與 `pnpm build` 都通過
2. ✅ `pnpm dev:public` 下 38 頁溢出與對比稽核 0 問題
3. ✅ 19 支 demo 的每一個互動狀態逐一點過重驗（不只初始狀態）
4. ✅ 浮水印 38 頁 0 衝突
5. ✅ 鍵盤 `→` `←` `Home` `End` 正常、末頁不會再前進；首頁「第三堂課」區塊看得到

### ⚠ 稽核腳本有一個假陽性，之後再驗要注意

`scripts/audit-slides.js` 的 `parseColor` 用 `String(value).match(/[\d.]+/g)` 取前三個數字當 RGB。
Chrome 會把**帶 `transition-colors` 的元素**的 `backgroundColor` 序列化成 `oklab(...)`，
於是 `oklab(0.940163 -0.0000205934 0.0152842)`（其實是淺色的 `panel-lift`）
被讀成 RGB(0.94, 0.00002, 0.015) ≈ 純黑，整批深色文字會被誤判成 1.27:1；
負號也會被 `[\d.]+` 吃掉。實測有兩頁（ESLint、AI Rules）因此被誤報。

這次是另外寫了一版 oklab→sRGB 的解析來驗證的。要修根本問題的話，
把 `parseColor` 的正規表示式改成 `/-?[\d.]+/g` 並補上 `oklab()` / `oklch()` 的轉換即可。
**在修好之前，稽核報出來的低對比要先確認背景色字串是不是 `oklab(...)`，再決定要不要動程式碼。**
