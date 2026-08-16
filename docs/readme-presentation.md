# 互動式簡報開發指南

React 教學用的互動式簡報。固定 1920×1080 的 16:9 舞台、亮色技術風格（淨白米紙面 + 墨版強調色），內容以**內嵌互動範例**為主，程式碼是需要時才叫出來的配角。

---

## 專案結構

```
src/
├── styles/
│   ├── theme.css            # 色票與字體（全站唯一色彩來源）
│   └── index.css            # 入口，@import tailwindcss + theme
├── stage/
│   └── Stage.tsx            # 1920×1080 舞台，等比縮放置中
├── types/slide.ts           # SlideBody / Step 型別
├── template/
│   └── SlideTemplate.tsx    # 主版型：鍵盤操作、網址同步、頁首頁尾
├── components/
│   ├── SlideBodyView.tsx    # 依 SlideBody.kind 分派到各版型
│   ├── SlideHeader.tsx
│   ├── NavigationControls.tsx
│   ├── MenuButton.tsx
│   ├── CodeBlock.tsx / CodeTabs.tsx / codeTheme.ts
│   └── Asset.tsx            # 取用 SVG 素材
├── assets/
│   ├── manifest.ts          # 素材目錄（id 有型別提示）
│   └── svg/*.svg            # 素材本體
├── data/courses.ts          # 首頁與選單的課程清單
├── pages/Home.tsx
└── showcase/版型示範/        # ★ 目前唯一的一份簡報，也是參考標準，開新課程從這裡複製
```

每一份簡報固定四個檔案：

| 檔案 | 內容 |
| --- | --- |
| `slides.ts` | 簡報資料（標題、步驟、版型） |
| `demos.tsx` | 互動範例元件 |
| `diagrams.tsx` | SVG 圖解 |
| `index.tsx` | 套上 `SlideTemplate` 的入口 |

---

## 核心型別

```ts
interface Step {
  id: string;            // 唯一識別碼，也是切換動畫的 key
  title: string;         // 頁首顯示的步驟名稱
  description?: string;  // 內容區上方的導言
  body: SlideBody;       // 這一頁的版型與內容
}
```

`SlideBody` 有九種，其中 `split` 可以遞迴組合：

| kind | 用途 | 主要欄位 |
| --- | --- | --- |
| `title` | 章節封面 | `kicker` `heading` `lead` `assetId` `image` |
| `demo` | 內嵌 React 互動範例（主力） | `render` `caption` `bare` |
| `html` | 內嵌原生 HTML/CSS/JS，跑在 sandbox iframe | `html` `css` `caption` |
| `diagram` | 手繪 SVG 圖解 | `render` `caption` |
| `code` | 程式碼，多筆自動變分頁 | `blocks` |
| `points` | 重點條列 | `heading` `items` |
| `assets` | 素材展示牆 | `heading` `items` |
| `table` | 表格，儲存格可放外部連結 | `heading` `columns` `rows` `note` |
| `split` | 左右分割，可巢狀 | `left` `right` `ratio` |

`title` 的 `lead` 給陣列就會分成多段；`assetId`（素材庫共用 SVG）與 `image`（這份簡報專用的點陣圖）二選一。
`points` 的項目與 `table` 的儲存格都可以帶 `href`，渲染成新分頁開啟的外部連結。
`table` 的儲存格另外可以帶 `note`，會在主文上方加一行 16px 的 faint 小標（用來標示這一格屬於哪一類），
與 body 層級的 `note`（表格下方的補充說明）不是同一個欄位。

`ratio` 可用 `1:1`、`3:2`、`2:3`、`2:1`、`1:2`，預設 `1:1`。

### 範例

```ts
// 滿版互動範例
{
  id: 'try-it',
  title: '實際體驗',
  description: '試試看：改左邊的輸入框，右邊四個區塊會同時跟上。',
  body: { kind: 'demo', render: SeparationDemo, caption: '資料只有一份' },
}

// 左圖右碼
{
  id: 'explain',
  title: '請求流程',
  body: {
    kind: 'split',
    ratio: '1:1',
    left: { kind: 'diagram', render: RequestFlowDiagram },
    right: { kind: 'code', blocks: [{ language: 'javascript', filename: 'state.js', code: '…' }] },
  },
}
```

---

## 配色

所有顏色定義在 `src/styles/theme.css` 的 `@theme`，Tailwind 會自動產生對應的 utility（`bg-panel`、`text-acid`、`border-line`…）。**不要在元件裡寫死色碼。**

| 分組 | token | 用途 |
| --- | --- | --- |
| 基底 | `ink` `ink-soft` `panel` `panel-lift` `line` `line-soft` `letterbox` | 背景與分隔線。亮色主題下 `panel` 最亮，「浮起」與「下沉」都往深處走一階；`letterbox` 是舞台外的框，目前跟 `ink` 同值（邊界隱形），但 token 分開以便單獨調整 |
| 前景 | `paper` `muted` `faint` `on-accent` | 文字的三個層級，加上疊在實心強調色色塊上的挖空色 |
| 強調 | `acid` `coral` `teal` `blue` | 主色系，一頁最多用兩個 |
| 延伸 | `lime` `sky` `violet` `amber` `danger` | 圖解需要更多可辨識色時 |
| 語意 | `ok` `warn` `error` `info` | 狀態優先，改色只改這一段 |
| 角色 | `role-user` `role-client` `role-server` `role-data` | 前後端與資料流圖解共用 |
| 語言 | `lang-html` `lang-css` `lang-javascript` … | CodeTabs 的標籤點 |
| 素材 | `icon-base` `icon-plate` `icon-coral` `icon-lime` `icon-teal` | 既有 SVG 內建色，僅供對照，不要拿去改素材 |

強調色的 token 名稱是**角色**不是色相：`acid` 現在是品紅、`lime` 是松綠。名字沿用深色時代是為了不動 `Accent` 型別與各 deck 的既有寫法，選色請看 `theme.css` 註解寫的用途，不要照名字猜顏色。

語意、角色、語言這三組共 14 個 token 都是上面強調色的 `var()` 別名，不是複製的色值 —— 換掉一支強調色，它們會自動跟著換。（`warn` 指向 `amber` 而不是 `acid`：`acid` 已經是 CTA 色，共用會失去語意。）

透明階直接用 Tailwind 的斜線語法：`bg-acid/14`（底色）、`bg-acid/20`（強調底色）、`border-acid/55`（邊框）。這組數字比深色時代整體高一階，校準的基準是「觀感」而不是公式：深色的 `bg-acid/8` 疊在近黑底上是 1.23:1，換到紙面要 `/14` 才有同樣的存在感。（例外是程式碼高亮列，維持 `bg-acid/8` 就不能再往上加，再高語法色會掉到 4.5 以下。）

**低透明度的填色不得單獨承擔語意。** 投影機做不出黑、環境光又會把黑階抬高，1.2:1 等級的填色在教室後排會整片被吃掉。要標示狀態就再加一個不透明的元素 —— `points` 卡片與 `CodeBlock` 的 `highlightLines` 都是用 6px 的實心左粗條補的。

`theme.css` 用的是 `@theme static`，這是必要的：Tailwind v4 預設只輸出「有被 utility 用到」的變數，但這裡的 token 也會被 SVG 圖解以 `var(--color-*)` 引用、被色票頁即時讀取，少了 `static` 那些變數不會出現在產出的 CSS 裡。

**對比度**：三個文字層級對 `panel` 的對比是 16.22:1 / 8.72:1 / 7.39:1，對最深的表面 `ink-soft` 也還有 13.08 / 7.03 / 5.96，全站文字都通過 WCAG AA。投影與直播壓縮會再吃掉一些對比，所以**不要降低這個差距**（往紙面的方向靠都算），也不要用 `line` 系列當文字色。

`/showcase/layouts` 的「專案色票」那一頁會即時從 CSS 變數讀出目前的值，改完 `theme.css` 打開那頁就能對照。

---

## SVG 素材

素材沿用「直播用簡報工具」的 technical-editorial 風格：透明底、512×512 viewBox、base stroke `#F7F2E7`（奶白線稿）、內部填色 `#121A21`（深色）、accent `#FF6B5A` / `#C8F04B` / `#42D7C2`。

**這些素材是為深底畫的，轉亮色時一個位元都沒改。** 12 個檔案都是 `<img src>` 載入的，CSS 構不到；亮色主題的做法是在素材底下墊一塊 `bg-paper`（近黑）的底板，讓素材維持原本的明暗關係 —— 位置在 `SlideBodyView` 的 `title` 版型（420px 的封面畫框）與 `assets` 版型（176px 的內層底板，卡片本身仍是 `bg-panel`，說明文字留在紙面上）。實測線稿對底板 14.76:1、內部填色對底板 1.07:1，跟原本在深色面板上的 16.10 / 1.02 幾乎一樣。

⚠️ 這是刻意的設計語言，不是還沒改完。把素材直接放在紙面上不會「消失」而是「反轉」：輪廓線對 `panel` 只剩 1.10:1 整條不見，內部深色填色卻變成 17.27:1，圖形退化成深色剪影。改掉不會有錯誤訊息，稽核也擋不住（剪影的對比反而更高），所以新版型要放素材時記得一起帶底板。

新增素材：

1. 把 SVG 放進 `src/assets/svg/<id>.svg`（**檔名就是 id**）
2. 在 `src/assets/manifest.ts` 的 `assets` 補一筆 `{ id, name, purpose, tags }`
3. 用 `<Asset id="<id>" size={220} />` 取用，`id` 會有型別提示

素材是多色技術插畫，**不要改成 `currentColor`**，會失去語意色。

---

## SVG 圖解慣例

- 不畫自己的背景矩形，讓面板的 `bg-panel` 透出來
- 顏色一律寫 `var(--color-*)`，換色票時圖解自動跟著換
- viewBox 用 16:9 附近的比例；放進 `split` 單欄時 820×560 剛好
- 文字最小 16（舞台座標）

參考 `src/showcase/版型示範/diagrams.tsx`。

---

## 舞台與尺寸

`Stage` 固定 1920×1080，用 `transform: scale()` 等比縮放並置中（letterbox）。

因此**所有排版都直接寫舞台像素**，不需要寫 RWD：

```
1080 = 頁首 84 + 內容 920 + 頁尾 76
內容區左右 padding 48、上下 36 → 實際可用約 1824 × 848
```

字級參考：內文 24、次要 19–21、程式碼 20、步驟標題 26、封面大標 92。按 `H` 隱藏頁首頁尾時，內容區會擴張到 1008 高。

---

## 簡報操作

| 按鍵 | 動作 |
| --- | --- |
| `→` `↓` `Space` `PageDown` | 下一步 |
| `←` `↑` `PageUp` | 上一步 |
| `Home` / `End` | 第一步 / 最後一步 |
| `F` | 全螢幕 |
| `B` | 黑幕（任意鍵離開） |
| `H` | 隱藏頁首頁尾（滿版） |

- 簡報筆送出的就是 `PageUp` / `PageDown`
- 游標在 `input` / `textarea` 時，方向鍵與空白鍵交還給範例，不會翻頁
- 點過 `html` 版型的 iframe 之後焦點會落在 iframe 裡，父層收不到鍵盤事件。srcDoc 內有一段轉發程式會把翻頁鍵 `postMessage` 回簡報，所以操作過範例還是能直接用鍵盤翻頁
- 目前步驟記在網址 `?s=3`，可以直接跳頁或分享單頁連結
- 頁尾的進度條每一段都可以點擊跳頁
- 翻頁動畫是 CSS（`.slide-enter`）而非 JS 動畫函式庫：元素的基準狀態就是可見的，內容不會因為動畫沒跑完而看不到

---

## 新增一份簡報

1. 複製 `src/showcase/版型示範/` 成 `src/weekN/課程名稱/`
2. 改寫 `slides.ts`、`demos.tsx`、`diagrams.tsx`
3. `index.tsx` 改元件名稱
4. `src/router.tsx` 註冊路由
5. `src/data/courses.ts` 的 `publicCourses` 補一筆（`week` 給週次；不給就會歸在「參考範本」）。
   只給自己看的簡報改放 `internalCourses`，並且路由要註冊在 `internalOnlyRoutes` —— 見下面的〈內部版與對外版〉

---

## 內部版與對外版

同一份程式碼有兩種面貌，由環境變數 `VITE_DECK_MODE` 切換，唯一的判斷點是 `src/env.ts`。

| | internal（內部版） | public（對外版） |
| --- | --- | --- |
| 簡報 | 全部看得到 | `internalCourses` 那幾份整份 tree-shake 掉，連標題字串都不在產物裡 |
| 浮水印 | 不顯示 | 每一頁角落顯示六角學院商標 |
| 何時是這個模式 | `pnpm dev` | `pnpm dev:public`、`pnpm build`、`pnpm preview`、`pnpm deploy:pages` |

`import.meta.env.VITE_DECK_MODE` 是 build 時就被換成字面值的常數，不是執行期判斷，
所以對外版的產物裡內部簡報是「根本沒被打包」而不是「連不到」。三個 .env 檔都要進版控：
少了 `.env` 的那一行，Vite 就換不掉這個變數，整段會退回執行期判斷，內部簡報反而會被打包出去。

要新增一份只給自己看的簡報，兩邊都要動，沒有自動關聯：

- `src/data/courses.ts` 的 `internalCourses`（少一筆＝選單看不到）
- `src/router.tsx` 的 `internalOnlyRoutes`（少一筆＝路由連不上）

`internalCourses` 目前是空的，機制留著等下一份不公開的簡報。〈版型示範〉原本放在那裡，
後來改成公開：它只是版型與色票的參考標準，沒有不能給人看的內容；而且擺在內部版有個
實際的壞處 —— 浮水印只在對外版渲染，內部版永遠看不到，等於整個 repo 沒有任何一頁能
驗證浮水印會不會壓到內容。

⚠️ tree-shaking 還依賴 `package.json` 的 `sideEffects` 宣告。少了它，Rollup 會把 deck 的
`demos.tsx` / `diagrams.tsx` 當成有副作用而整個保留 —— 路由確實連不到，但程式碼還是
進了對外產物（實測 bundle 會多出約 90KB）。

浮水印在 `src/components/Watermark.tsx`，位置改 `WATERMARK_POSITION` 一行即可，
四個角落的座標都已經定義好。它是絕對定位、`pointer-events-none`，
按 `H` 隱藏頁首頁尾時位置不變，按 `B` 黑幕時會被黑幕蓋掉。

### ⚠️ 本地端看到的不等於部署出去的

`pnpm dev` 跑的是內部版，部署出去的不是。兩種模式的差異在平常開發時完全看不到，
所以**發佈前一定要看一次對外版**：

```bash
pnpm dev:public   # 對外版 + 熱更新，開發途中用這個
pnpm preview      # 真正的建置產物，deploy 前用這個
```

三個會安靜出事的地方：

- **新簡報預設是對外的。** 放進 `publicCourses` 就等於發佈出去。只給自己看的簡報
  必須同時放進 `internalCourses` 和 `internalOnlyRoutes`，漏掉任何一邊都不會在本地
  報錯，而是直接上線。
- **`pnpm dev` 永遠看不到浮水印。** demo 如果把右上角塞滿，本地看起來正常，
  只有 `pnpm dev:public`（或 `pnpm preview`）才會疊在一起。
  右上角是量過的：〈版型示範〉10 頁逐頁掃四個角落，撞到內容的元素數是
  右上 0 ／右下 6 ／左下 7 ／左上 9，右上是唯一 0 衝突的角落（細節見 `Watermark.tsx` 的註解）。
  但**新簡報不會自動安全** —— 任何把內容推到右上的版面都要重新確認。
- **從內部簡報 import 東西，會把它整份拉回對外產物。** 移除是靠「沒有任何地方引用到」
  達成的，共用或對外的程式碼只要有一行 `import` 指向 `src/showcase/`，
  隔離就破了，而且 build 依然是綠的看不出來。要用就用複製的。

改 `.env` 不用手動重啟，Vite 偵測到就會自己重啟 dev server。
但 `VITE_*` 的值會被打進前端產物，任何人打開網站都讀得到 ——
這幾個檔案是用來切模式的，不要拿來放密鑰。

---

## 開發指令

```bash
pnpm dev         # 開發伺服器（內部版）
pnpm dev:public  # 開發伺服器（對外版）—— 不用 build 就能看到浮水印與過濾後的選單
pnpm build       # TypeScript 編譯 + Vite 建置（對外版）
pnpm lint        # ESLint
pnpm preview     # 預覽建置產物
pnpm deploy:pages # 建置並發佈到 GitHub Pages（原始儲存庫會被防呆擋下）
```
