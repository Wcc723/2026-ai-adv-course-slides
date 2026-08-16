# 版型規格與選用

型別定義在 `src/types/slide.ts`，分派邏輯在 `src/components/SlideBodyView.tsx`。實例在 `src/showcase/版型示範/slides.ts`（每種各一頁）。

## 選用決策表

| 你想做的事 | 版型 |
| --- | --- |
| 開場、章節分隔 | `title` |
| 讓學員自己操作、對照前後差異 | `demo` |
| 示範原生 HTML / CSS / JS 的行為 | `html` |
| 解釋流程、關係、資料流向 | `diagram` |
| 需要逐行讀的程式碼 | `code` |
| 收尾、重點回顧、規則清單 | `points` |
| 介紹可用的視覺素材 | `assets` |
| 規格對照、資源清單、要放外部連結 | `table` |
| 一邊看圖一邊看碼 | `split` |

判斷卡住時的順序：**能互動就 `demo` → 能畫圖就 `diagram` → 再考慮 `code` / `points`**。連續兩頁以上都是 `code` 或 `points`，通常代表這段內容應該改成互動或圖解。

## 各版型欄位

### title — 章節封面

```ts
{
  kind: 'title',
  kicker?: string,
  heading: string,
  lead?: string | string[],
  assetId?: AssetId,
  image?: { src: string; alt: string },
}
```

- `kicker` — 小標，顯示為 acid 色大寫字，放週次或分類（`Week 01`、`Slide System`）
- `heading` — 92px 大標，控制在 12 個中文字以內
- `lead` — 導言，兩到三行。**給陣列就會分成多段**
- `assetId` — 右側 420×420 畫框內的共用 SVG 素材，強化主題印象。畫框刻意用 `bg-paper`
  深色底板而不是 `bg-panel`：素材是奶白線稿配深色填色、為深底畫的，直接放在紙面上輪廓線會消失、
  只剩深色剪影。**不要改成 `bg-panel`**，改了不會報錯、稽核也擋不住，但素材會全部退化
- `image` — 這份簡報專用的點陣圖，與 `assetId` 二選一。圖放在
  `src/weekN/課程名稱/images/`，`import` 進來再帶 `src`。詳見 `images.md`

### demo — 內嵌 React 互動範例（主力）

```ts
{ kind: 'demo', render: ComponentType, caption?: string, bare?: boolean }
```

- `render` — 元件本身，寫在同資料夾的 `demos.tsx`
- `caption` — 面板下方的一句話說明
- `bare: true` — 不套面板外框，適用於元件自己已經畫好完整框架的情況

元件內部要自己控制寬度（建議 `w-full max-w-[1400px]`），否則會縮在舞台中間顯得空曠。

### html — sandbox iframe 內的原生 HTML

```ts
{ kind: 'html', html: string, css?: string, caption?: string }
```

- 在 `sandbox="allow-scripts"` 的 iframe 內執行，與簡報樣式完全隔離
- `html` 內可以直接寫 `<script>`，JS 會正常執行
- iframe 內建可用的 CSS 變數：`--ink` `--ink-soft` `--panel` `--panel-lift` `--line` `--paper` `--muted` `--acid` `--coral` `--teal` `--blue`
- srcDoc 內含一段按鍵轉發程式，焦點在 iframe 裡時仍能用鍵盤翻頁

### diagram — 手繪 SVG 圖解

```ts
{ kind: 'diagram', render: ComponentType, caption?: string }
```

圖解會等比放大填滿面板寬度。撰寫慣例見 `visual-rules.md`。

### code — 程式碼

```ts
{ kind: 'code', blocks: CodeBlock[] }

interface CodeBlock {
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx';
  code: string;
  filename?: string;
  highlightLines?: number[];   // 1 起算
}
```

- 多筆 `blocks` 會自動變成分頁，分頁標籤用 `filename`
- `highlightLines` 標出這一頁要講的行，其他行自動退為背景
- 行數超過 16 / 22 行時字級自動縮小，超過約 30 行就該拆頁或精簡
- `language` 只支援上列六種（prism-react-renderer 內建的集合），`json` / `bash` 會退化成純文字

### points — 重點條列

```ts
{ kind: 'points', heading?: string, items: PointItem[] }

interface PointItem { text: string; note?: string; href?: string; accent?: Accent }
```

- `accent` 可用 `acid` `coral` `teal` `blue` `lime` `sky` `violet` `amber`，預設 `acid`
- `href` 會把主文渲染成外部連結（底線 + 外部箭頭，色跟著 `accent` 走，hover 轉 acid），
  給收尾頁要留的延伸資源用。`note` 不吃連結，要放連結就放在 `text`
- 項目數 > 4 時自動切換到緊湊排版
- **上限 6 項**。超過就拆頁，不要靠捲軸

### assets — 素材展示牆

```ts
{ kind: 'assets', heading?: string, items: AssetItem[] }

interface AssetItem { id: AssetId; label?: string; note?: string }
```

不給 `label` / `note` 時自動用 `manifest.ts` 的 `name` 與 `purpose`。

素材外圍有一塊 176px 的 `bg-paper` 深色底板（理由同 `title` 的畫框），卡片本身維持 `bg-panel`，
說明文字留在紙面上，才不會動到 `paper` / `faint` 的階層。

### table — 表格（可放外部連結）

```ts
{ kind: 'table', heading?: string, columns: string[], rows: TableRow[], note?: string }

interface TableCell { text: string; note?: string; href?: string; accent?: Accent; mono?: boolean }
type TableRow = (string | TableCell)[];
```

- 儲存格四種寫法：純字串（等同 `{ text }`）、`{ text, mono: true }`、`{ text, href }`、`{ text, note }`
- 儲存格的 `note` 是**主文上方**的 16px faint 小標（`font-display` + `tracking`），
  用來標示這一格屬於哪一類（例如技巧名稱）；跟 body 層級的 `note`（表格下方 19px 的補充說明）
  同名但不是同一個東西。兩者同時用的時候，下方那句不要只是把小標改寫一遍
- `href` 渲染成 `<a target="_blank" rel="noreferrer">`，藍色底線加一個 16px 外部連結箭頭，hover 轉 acid
- `accent` 覆寫文字色（一般儲存格預設 `paper`、連結儲存格預設 `blue`），值同 `points` 的 `Accent`
- `mono: true` 用 `font-mono` 20px，給版本號、檔名、API 名稱這類內容
- `heading` 同 `points` 的 40px 標題，`note` 是表格下方 19px 的補充說明
- 欄位文字 22px、表頭 18px。列高會依列數自動收緊（≤6 列 `py-5`、7–8 列 `py-4`、9 列以上 `py-3`）
- **上限約 10 列 × 4 欄**。超過就拆頁，這個版型不會出現捲軸，塞不下就是直接被裁掉

適合放課程參考資料、API 對照表、版本相容性、規格比較。**不要拿來當程式碼排版工具** — 需要逐行讀的東西給 `code`。

### split — 左右分割

```ts
{ kind: 'split', left: SlideBody, right: SlideBody, ratio?: SplitRatio }
```

- `ratio`：`1:1`（預設）`3:2` `2:3` `2:1` `1:2`
- `left` / `right` 各自又是完整的 `SlideBody`，**可以再放 `split`** 拼出三欄或四宮格

常用組合：

| 組合 | ratio | 場景 |
| --- | --- | --- |
| diagram + code | `1:1` | 概念圖配實作 |
| diagram + code | `2:3` | 程式碼較長時 |
| html + code | `1:1` | 執行結果配原始碼 |
| demo + points | `3:2` | 互動配說明 |

## 尺寸預算

舞台固定 1920×1080：

```
1080 = 頁首 84 + 內容區 920 + 頁尾 76
內容區左右 padding 48、上下 36  →  實際可用 1824 × 848
```

內容區再往下扣：

| 元素 | 高度 |
| --- | --- |
| `description`（一行） | 約 36 + gap 24 |
| `caption` | 約 26 + gap 16 |
| `points` / `table` 的 `heading` | 40 + gap 24~32 |
| `table` 的 `note` | 約 28 + gap 24 |
| `code` 的分頁列（多筆 blocks 時） | 約 52 + gap 16 |
| 面板 padding（`Panel` 的 `p-10`） | 80 |

按 `H` 隱藏頁首頁尾時，內容區會擴張到 1008 高。

**字級參考**：封面大標 92、`points` 主文 26–28、內文／`description` 24、`demo` 卡片主文 26–32、次要說明 19–22、程式碼 17–20、標籤與 caption 16–18。

不要低於 15px。舞台在小視窗會被縮到 0.5 倍左右，15px 會變成 8px。
