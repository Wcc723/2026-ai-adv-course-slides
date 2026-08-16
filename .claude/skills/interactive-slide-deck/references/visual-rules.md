# 視覺規則

色票的唯一來源是 `src/styles/theme.css`。**元件裡出現 hex 就是錯的。**

## 色票分組

| 分組 | token | 用途 |
| --- | --- | --- |
| 基底 | `ink` `ink-soft` `panel` `panel-lift` `line` `line-soft` `letterbox` | 背景與分隔線。`panel` 最亮、`ink-soft` 最沉，`letterbox` 是舞台外框，目前跟 `ink` 同值（邊界隱形），token 分開以便單獨調整 |
| 前景 | `paper` `muted` `faint` `on-accent` | 文字的三個層級，外加實心強調色塊上的挖空文字 |
| 強調 | `acid` `coral` `teal` `blue` | 主色系。**名字是角色不是色相**（`acid` 現在是品紅、`lime` 是松綠），選色看 `theme.css` 的註解，不要照名字猜 |
| 延伸 | `lime` `sky` `violet` `amber` `danger` | 圖解需要更多可辨識色時 |
| 語意 | `ok` `warn` `error` `info` | 狀態優先。這四個是強調色的 `var()` 別名，改上面的強調色就會跟著走 |
| 角色 | `role-user` `role-client` `role-server` `role-data` | 前後端與資料流圖解共用 |
| 語言 | `lang-html` `lang-css` `lang-javascript` `lang-typescript` `lang-jsx` `lang-tsx` | CodeTabs 的標籤點 |
| 素材 | `icon-base` `icon-plate` `icon-coral` `icon-lime` `icon-teal` | 既有 SVG 內建色，刻意沒有跟著轉亮色，**僅供對照，不要拿去改素材** |

用法：

```tsx
<div className="border-line bg-panel text-paper">          {/* Tailwind utility */}
<div className="border-teal/55 bg-teal/14 text-teal">      {/* 透明階用斜線語法 */}
<rect stroke="var(--color-role-server)" />                 {/* SVG 用 CSS 變數 */}
```

透明階慣例：底色 `/14`、強調底色 `/20`、邊框 `/55`。紙底比深底更會吃掉低透明度的填色，所以整體比深色時代高一階（深色的 `bg-acid/8` 疊在 `#171713` 上是 1.23:1，紙面要 `/14` 才有同樣的存在感）。

### 低透明度填色不得單獨承擔語意

`bg-acid/14` 這種等級的填色只有 1.2:1 上下。投影機做不出黑、教室環境光又會把黑階整個抬高，後排看到的就是一片白。**只要一塊填色是在表達「這一項不一樣」，就必須再配一個不靠淡色的訊號**——最省事的是不透明的 6px 左粗條（`border-l-[6px] border-l-acid`），`points` 卡片與 `CodeBlock` 的 `highlightLines` 都是這樣做的。反過來也成立：不要為了搶存在感把透明度一路往上調，調到後面壓在上面的文字與語法色會掉出 4.5:1。

### 素材與封面圖要墊深色底板

12 個 SVG 素材是奶白線稿（`icon-base`）配深色填色（`icon-plate`），為深底畫的，而且是用 `<img src>` 載入、CSS 構不到，檔案一個位元都沒改。做法是**在素材底下墊一塊 `bg-paper` 的深色底板**：`title` 版型的 420px 封面畫框、`assets` 版型的 176px 內層底板都是（卡片本身仍是 `bg-panel`，說明文字留在紙面上）。

**不要把底板換成 `bg-panel`。** 直接放在紙面上不會「消失」而是「反轉」：輪廓線對面板只剩 1.10:1 整條不見，內部深色填色對面板卻變成 17.27:1，圖形退化成一坨深色剪影。改了不會有錯誤訊息，稽核也不會擋——剪影的對比反而更高。

### 語意優先

有語意 token 就用語意 token。「這是錯誤狀態」寫 `text-error`，不要寫 `text-coral`；「這是後端」寫 `var(--color-role-server)`，不要寫 `var(--color-acid)`。這樣之後調色票只要改一段。

### 一頁最多兩個強調色

超過兩個，重點就沒有重點了。需要更多可辨識色時（例如四個角色的流程圖）才動用延伸色。

### `@theme static` 是必要的

Tailwind v4 預設**只輸出有被 utility 用到的變數**。本專案的 token 還會被 SVG 以 `var(--color-*)` 引用、被色票頁 `getComputedStyle` 即時讀取，所以 `theme.css` 必須用 `@theme static`，否則 `ok` / `warn` / `info` / `danger` / `role-*` 這些沒有對應 class 的變數不會出現在產出的 CSS 裡（swatch 會變透明、`getPropertyValue` 回傳空字串）。

## 對比度

三個文字層級對 `panel` 的對比是 **16.2:1 / 8.7:1 / 7.4:1**，對最深的表面 `ink-soft` 也還有 13.1 / 7.0 / 6.0，全站文字通過 WCAG AA。

- 投影機與直播壓縮會再吃掉一些對比，**不要降低 `muted` / `faint` 對背景的對比**（往哪個方向調隨主題而異，要守的是對比值本身）
- **不要拿 `line` / `line-soft` 當文字色**，那是邊框色
- 程式碼註解是教學時最常唸的內容，對比不能再壓低（目前是 `--color-faint`，對程式碼井 5.96:1）
- 新增顏色組合後跑 `scripts/audit-slides.js`，它會連 SVG 的 `fill` 一起驗

## 字級

見 `layouts.md` 的尺寸預算。下限 15px，一般內文不低於 19px。

字體：`font-sans`（內文）、`font-display`（標題與數字，condensed）、`font-mono`（程式碼與 token 名稱）。

## SVG 圖解慣例

```tsx
export function MyDiagram() {
  return (
    <svg width={820} height={560} viewBox="0 0 820 560" role="img">
      <title>一句話描述這張圖在說什麼</title>
      <rect x={40} y={100} width={200} height={120} rx={12}
            fill="var(--color-ink-soft)" stroke="var(--color-role-client)" strokeWidth={2} />
      <text x={140} y={165} textAnchor="middle"
            fill="var(--color-role-client)" fontSize={24} fontWeight={600}>前端網頁</text>
    </svg>
  );
}
```

規則：

1. **不畫背景矩形** — 讓面板的 `bg-panel` 透出來。畫了背景就等於把圖解跟主題綁死
2. **顏色一律 `var(--color-*)`** — 換色票時圖解自動跟著換
3. **viewBox 820×560** — 放進 `split` 單欄剛好；滿版圖解可用 900×480
4. **文字最小 16**（viewBox 座標），一定要有 `<title>`
5. **節點內用 `fill="var(--color-ink-soft)"` + 彩色 stroke**（現在是淺沙色卡片配深色描邊），不要整塊填實心強調色再挖空文字
6. 去程用 `coral` 實線、回程用 `teal` 虛線，是既有的流向慣例
7. 重複的節點／箭頭抽成同檔案內的小元件（見 `src/showcase/版型示範/diagrams.tsx` 的 `Node` / `Arrow`）

`marker` 的 `id` 在同一頁可能碰撞，用有意義的前綴（`flow-req`、`flow-res`）。
