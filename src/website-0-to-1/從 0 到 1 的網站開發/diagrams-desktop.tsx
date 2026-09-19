/* ══════════════════════════════════════════════════════════════
 * 從 0 到 1 的網站開發 · 桌面版那一段的圖示（第 4–8 頁、第 24 頁）
 *
 * 移植自 2026-interactive-presentive 的 ChatGPT桌面版/diagrams.tsx，
 * 只留這一份用得到的圖示，另外補了第 24 頁要用的 `ImageGlyph`。
 * 這一段沒有任何流程線圖 —— 主角是「一個 App 裡的三種工作方式」，
 * 畫面幾乎都是假的介面（視窗、下拉選單、分頁），圖示只是介面上的小零件。
 *
 * ──────────────────────────────────────────────────────────────
 * 顏色契約
 * ──────────────────────────────────────────────────────────────
 *   chat   coral       Chat
 *   work   teal        Work
 *   codex  lime        Codex
 *   wait   amber       停下來等你同意
 *   host   paper       中性容器（視窗外框、你的電腦）
 *   net    faint       更淡的中性、以及「這一格沒有」
 *
 * 前三個是從素材庫回推的：`chat-mode` `work-mode` `codex-mode` 三張圖的
 * accent 寫死在檔案裡（≈ coral ／ teal ／ lime），DOM 這邊跟著它走，
 * 不然第 5、8 頁會出現「卡片是一個顏色、卡片裡那張圖是另一個顏色」。
 * 亮色主題下這三支換成低彩度油墨色（lime 是松綠、teal 是青碧），
 * 色相關係沒變，所以契約照舊。這三支是跨頁的固定契約，
 * 跟角色色一樣不受「一頁最多兩個強調色」限制。
 *
 * 來源的 `cloud`（violet）只給〈Work 雲端模式〉那一頁用，
 * 那一頁沒有選進這份簡報，所以這裡拿掉了。
 *
 * ──────────────────────────────────────────────────────────────
 * SVG 的兩個規則
 * ──────────────────────────────────────────────────────────────
 * 1. **這一份裡沒有任何 `<text>`，而且要維持沒有。** 圖示會被縮到 20–40px，
 *    SVG 裡的字縮下去會掉到 16 以下，一般的對比稽核也量不到。文字一律交給 DOM。
 * 2. **不畫背景矩形**，顏色一律 `var(--color-*)`，不出現 hex。
 * ══════════════════════════════════════════════════════════════ */

export type Tone = 'chat' | 'work' | 'codex' | 'wait' | 'host' | 'net';

/**
 * `Tone` 對 CSS 變數。**不要 export** ——
 * react-refresh/only-export-components 會擋掉「元件檔匯出非元件」。
 */
const TONE_VAR: Record<Tone, string> = {
  chat: 'var(--color-coral)',
  work: 'var(--color-teal)',
  codex: 'var(--color-lime)',
  wait: 'var(--color-amber)',
  host: 'var(--color-paper)',
  net: 'var(--color-faint)',
};

/* ══════════════════════════════════════════════════════════════
 * 圖示
 *
 * 一律 96×96 的線稿，沒有底、沒有字，靠 `size` 決定實際大小。
 * 每一個形狀都要能單獨認得出來：第 6、7 頁同一欄的圖示顏色都一樣，
 * 能不能分辨全靠形狀。
 * ══════════════════════════════════════════════════════════════ */

interface GlyphProps {
  tone: Tone;
  size?: number;
}

/** 兩個交疊的對話泡泡。Chat 的代表圖形 */
export function BubbleGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M38 14h40a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-6v14l-16-14H38a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* 前面那一個要蓋住後面那一個的線，所以填最亮的表面色 */}
      <path
        d="M18 40h6v24a10 10 0 0 0 10 10h20v6a10 10 0 0 1-10 10H30l-16 12V84h-2A2 2 0 0 1 10 82V50a10 10 0 0 1 8-10z"
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 一份文件。Work 產出的文章、報告 */
export function DocGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M24 10h32l20 20v56a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* 折角。少了它就只是一個圓角方塊 */}
      <path
        d="M56 10v20h20"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M32 48h32M32 62h32M32 76h20"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 試算表：外框加一組格線 */
export function SheetGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={12}
        y={16}
        width={72}
        height={64}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M12 38h72M12 60h72M40 16v64M62 16v64"
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
    </svg>
  );
}

/** 長條圖。Work 產出的圖表 */
export function ChartGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M16 12v68a4 4 0 0 0 4 4h64"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M32 68V50M50 68V28M68 68V40"
        fill="none"
        stroke={colour}
        strokeWidth={10}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 一對角括號。Codex 的代表圖形，也是第 24 頁「撰寫程式碼」 */
export function CodeGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M30 26 10 48l20 22M66 26l20 22-20 22"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 20 42 76"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 資料夾。「你電腦裡的那個資料夾」 */
export function FolderGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M12 26a6 6 0 0 1 6-6h20l10 12h30a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M12 46h72" fill="none" stroke={colour} strokeWidth={5} />
    </svg>
  );
}

/** 瀏覽器視窗：標題列上有兩個分頁 */
export function BrowserGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={18}
        width={76}
        height={60}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path d="M10 38h76" fill="none" stroke={colour} strokeWidth={5} />
      {/* 兩個分頁。這是它跟 SheetGlyph 唯一的差別，不要拿掉 */}
      <path
        d="M22 28h14M46 28h14"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M24 54h30M24 66h44"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 盾牌加勾。「碰到重要的操作，停下來請你同意」 */
export function ShieldGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M48 10 16 24v26c0 20 14 32 32 38 18-6 32-18 32-38V24z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="m34 48 10 10 20-22"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 終端機視窗：一個提示符加一條游標線 */
export function TerminalGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={18}
        width={76}
        height={60}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="m26 40 12 10-12 10"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 62h22"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 兩欄比對：左右各一疊線，中間一條分隔 */
export function DiffGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={16}
        width={76}
        height={64}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path d="M48 16v64" fill="none" stroke={colour} strokeWidth={5} />
      <path
        d="M20 34h18M20 48h18M20 62h12M58 34h18M58 48h12M58 62h18"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 兩張疊在一起的紙。「同一份東西的第二個副本」 */
export function LayersGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={12}
        y={12}
        width={52}
        height={52}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <rect
        x={32}
        y={32}
        width={52}
        height={52}
        rx={8}
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
      />
    </svg>
  );
}

/** 桌上型螢幕。第 24 頁「在你的電腦上預覽」 */
export function MonitorGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={16}
        width={76}
        height={52}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M38 68v14M58 68v14M30 82h36"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 一張圖片：外框、太陽、山。第 24 頁「圖片生成」（新加的，來源沒有） */
export function ImageGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={16}
        width={76}
        height={64}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <circle
        cx={34}
        cy={36}
        r={7}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="m14 72 24-22 14 12 12-10 20 18"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 表格記號
 *
 * 第 6 頁的比較表與第 8 頁的清單共用。**刻意不是 emoji 的 ✅ ❌** ——
 * 那兩個字符在不同平台會渲染成不同的圖，而且自帶自己的顏色，
 * 跟這一份的顏色契約打架。尺寸預設 26，所以描邊改成 4。
 * ══════════════════════════════════════════════════════════════ */

/** 有：一個勾 */
export function CheckMark({ tone, size = 26 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="presentation">
      <path
        d="m6 17 6 6 14-15"
        fill="none"
        stroke={colour}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 沒有：一條短橫線。不用叉，叉太吵 */
export function DashMark({ tone, size = 26 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="presentation">
      <path
        d="M8 16h16"
        fill="none"
        stroke={colour}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}
