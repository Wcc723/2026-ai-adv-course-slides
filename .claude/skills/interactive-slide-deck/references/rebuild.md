# 系統架構與已知陷阱

給「要從零重建這套系統」或「要改動核心版型／舞台／色票」的人。日常新增簡報用不到這份。

## 架構

```
src/
├── styles/theme.css         # 色票與字體，全站唯一色彩來源（@theme static）
├── styles/index.css         # 入口：@import tailwindcss + theme + .slide-enter
├── stage/Stage.tsx          # 1920×1080 固定舞台，等比縮放置中
├── types/slide.ts           # SlideBody / Step 型別 = 版型的合約
├── template/SlideTemplate.tsx  # 鍵盤操作、網址同步、頁首頁尾、黑幕、滿版
├── components/
│   ├── SlideBodyView.tsx    # 依 SlideBody.kind 分派，split 遞迴
│   ├── CodeBlock/CodeTabs/codeTheme
│   ├── Asset.tsx
│   └── SlideHeader / NavigationControls / MenuButton
├── assets/manifest.ts       # 型別化素材目錄
├── data/courses.ts          # 首頁與選單清單
└── showcase/版型示範/        # 一份簡報四個檔案（新課程複製它到 weekN/課程名稱/）
```

資料流：`slides.ts` 的 `Step[]` → `SlideTemplate`（管步驟狀態）→ `SlideBodyView`（管版型）→ 各版型元件。

## 重建順序

1. `styles/theme.css` + `styles/index.css`（色票先定，後面全部依賴它）
2. `types/slide.ts`（型別即合約）
3. `stage/Stage.tsx`
4. `components/`：CodeBlock → CodeTabs → SlideBodyView → Header / Nav / Menu
5. `template/SlideTemplate.tsx`
6. `showcase/版型示範/`（九種版型各一頁，同時當測試案例）
7. `pages/Home.tsx` + `router.tsx` + `data/courses.ts`
8. 跑 `scripts/audit-slides.js` 驗收

---

## 已知陷阱

每一條都是實際踩過的。

### 1. 固定舞台的置中：不能直接把 1920px 的元素丟進 grid

```tsx
// ✗ 錯：grid 軌道會被撐成 max-content（1920px），置中失效，內容往右溢出
<div className="fixed inset-0 grid place-items-center overflow-hidden">
  <div style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>

// ✓ 對：外層用「縮放後」的尺寸讓置中正常，內層才是真正的舞台
<div className="fixed inset-0 grid place-items-center overflow-hidden bg-letterbox">
  <div className="relative" style={{ width: 1920 * scale, height: 1080 * scale }}>
    <div className="absolute top-0 left-0"
         style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
```

`scale = Math.min(innerWidth / 1920, innerHeight / 1080)`，在 `resize` 時更新。

外層底色用 `bg-letterbox` 而不是 `bg-ink`。目前兩者同值（都是淨白米 `#F4F1E8`），舞台邊界刻意隱形 —— 非 16:9 的螢幕上看起來就是一整片連續的紙。原本這裡放深色，理由是「翻淺之後上下會多出兩條亮帶」，實際看過之後決定不要那兩條：深色框反而把 16:9 的邊界畫得很明顯。token 仍然分開，是為了讓「舞台外框」與「頁面底色」可以各自調整（例如全黑教室想壓深外框減少溢光）。

### 2. Tailwind v4 會 tree-shake `@theme` 變數

預設只輸出「有被 utility 用到」的變數。本專案的 token 還會被 SVG 以 `var(--color-*)` 引用、被色票頁 `getComputedStyle` 讀取，這些用法 Tailwind 掃不到。

**必須用 `@theme static`**，否則 `ok` / `warn` / `info` / `danger` / `role-*` 這類沒有對應 class 的變數根本不會進 CSS —— 現象是 swatch 變透明、`getPropertyValue()` 回傳空字串，但不會有任何錯誤訊息。

### 3. 不要用 JS 動畫函式庫做翻頁

原本用 `AnimatePresence mode="wait"`，踩到兩個問題：

- **內容不掛載**：分頁在背景時 rAF 被節流，退場動畫永遠跑不完；`mode="wait"` 會等退場結束才掛載新內容，結果頁首已經換到第 3 頁、內容還停在第 1 頁
- **多餘延遲**：每次翻頁要多等一次退場時間

改成 CSS：

```css
.slide-enter { animation: slide-enter 200ms ease-out; }
```

**關鍵是不設 `animation-fill-mode`**：元素的基準狀態就是可見的，動畫只是加分。動畫被停用、被節流、或根本沒跑，內容一樣看得到。這對直播／授課工具是必要的安全性。

順帶把 framer-motion 移除了，bundle 從 176KB gzip 降到 138KB。

### 4. iframe 會吃掉鍵盤

`html` 版型用 sandbox iframe。使用者一旦點過 iframe，焦點就落在 iframe 裡，父層的 `keydown` 監聽收不到任何東西 —— 講到一半鍵盤翻頁突然失效。

解法：srcDoc 內注入一段轉發程式，把翻頁鍵 `postMessage` 回父層；`SlideTemplate` 監聽 `message` 事件，走跟 `keydown` 同一套處理函式。轉發時要排除 `input` / `textarea` / `contentEditable`，並在 iframe 內 `preventDefault()`。

### 5. 打字不能翻頁

範例裡有輸入框，空白鍵與方向鍵必須交還給範例。`SlideTemplate` 的 `keydown` 處理一開始就檢查 `event.target` 是不是 `INPUT` / `TEXTAREA` / `SELECT` / `contentEditable`。

### 6. 截圖驗證會騙人，量測不會

用瀏覽器自動化截圖驗版面時，在 DPR 2.2 的螢幕上截圖會被裁切與非等比縮放，看起來像是「內容溢出到畫面外」，實際上完全沒有。而且截圖有時是上一幀的快取。

**驗版面一律用 DOM 量測**：

```js
document.querySelector('header').getBoundingClientRect()   // 左右邊距應該相等
document.documentElement.scrollWidth === innerWidth        // 沒有水平溢出
```

另外分頁在背景時 CSS 時間軸是暫停的，`.slide-enter` 會停在 opacity 0。要截圖前先強制完成動畫：

```js
document.querySelectorAll('*').forEach(e =>
  e.getAnimations().forEach(a => { try { a.finish() } catch {} }));
```

（`try/catch` 是必要的，頁面上可能有無限動畫，`finish()` 會丟 `InvalidStateError`。）

### 7. prism-react-renderer 的語言集合有限

只內建 `html` `css` `javascript` `typescript` `jsx` `tsx`。`json` / `bash` 不會報錯，但會退化成無高亮的純文字。`CodeLanguage` 型別因此只開放這六種。

### 8. 內容高度是硬限制

舞台高度固定，多一行就被裁掉。已經內建兩個自動調節：

- `CodeBlock` 依行數自動縮字（> 16 行 → 18px、> 22 行 → 17px）
- `PointsBody` 項目數 > 4 時自動切緊湊排版

超出這兩個機制就得拆頁。**不要靠捲軸**，簡報不該需要捲動。

### 9. `<script>` 字串與 ESLint

srcDoc 模板字面值裡寫 `<\/script>` 會被 `no-useless-escape` 擋。這個專案的 bundle 是外部 `.js` 檔，不會被內嵌進 HTML `<script>`，所以直接寫 `</script>` 是安全的。

---

## 設計取捨紀錄

| 決定 | 理由 |
| --- | --- |
| 固定 1920×1080 + scale，而非 RWD | 投影、直播、錄影、不同螢幕看到的排版完全一致；作者不必寫任何 RWD |
| `SlideBody` 用 discriminated union 而非 props 組合 | 版型是有限集合，union 讓 `SlideBodyView` 的 switch 具備窮盡性檢查 |
| `split` 遞迴而非提供 grid 版型 | 兩個積木就能拼出三欄、四宮格，型別與渲染都不用擴充 |
| 步驟狀態放在網址 `?s=N` | 直播中可以直接跳頁、可以把單頁連結貼給學員；不需要另外做狀態同步 |
| 只做亮色，且維持單一 token 組 | 主要情境是課程使用；不做主題切換是原本就對的判斷 —— 這次換的是色票不是機制，所以 `@theme static` 的結構不動、`codeTheme` 就地改、稽核重跑一輪、素材只需一套 |
| 素材保留多色、不 `currentColor` 化 | 素材是技術插畫，顏色帶語意（紅=請求、綠=回應），單色化會失去資訊；代價是亮色主題下必須在素材底下墊一塊 `bg-paper` 底板（見 `SlideBodyView`），素材檔案本身零修改 |
