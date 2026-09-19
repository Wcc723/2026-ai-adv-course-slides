/* ══════════════════════════════════════════════════════════════
 * 第 9–14 頁（輸入框下面那一排）· 圖示與顏色契約
 *
 * 只放兩件事：這六頁共用的顏色契約（`Tone`），以及一組線稿圖示。
 * **沒有任何流程線圖** —— 這六頁的主角是「輸入框下面那一排按鈕」，
 * 畫面幾乎都是假的介面，不是關係圖。
 *
 * 移植自 2026-interactive-presentive 的 chatgpt-desktop-details（深色主題）。
 * 圖示本身只有描邊、沒有底色，所以線條一條都沒改；改的是顏色契約的說明，
 * 以及多了一個 `inverse`（見下方）。
 *
 * ──────────────────────────────────────────────────────────────
 * 顏色契約
 * ──────────────────────────────────────────────────────────────
 *   cmd    blue        斜線指令
 *   proj   violet      專案
 *   ask    amber       要求核准（停下來等你）
 *   safe   teal        代我核准（推薦的那一格）
 *   risk   coral       完整存取權（警示）
 *   model  lime        模型
 *   think  sky         推理強度
 *   fast   acid        快速（閃電）
 *   host   paper       中性容器（視窗外框、輸入框）
 *   net    faint       更淡的中性、未選中
 *
 * 三個權限模式的顏色是**照它們在畫面上的角色**排的：amber 在 theme.css
 * 的用途寫著「過渡、等待中」，而「要求核准」要表達的正是它停在那裡等你按；
 * teal 是正向色，給推薦的那一格；coral 是警示色，給那個 App 自己用橘字
 * 標出來的選項。
 *
 * `fast` 用 acid：acid 是本專案的主強調色（當前步驟、CTA），而這一段對
 * 「快速」的講法就是**你可能沒發現它正開著** —— 那是最需要被看見的一格。
 * （亮色主題下 acid 是品紅，不是深色時代的螢光黃；token 名稱是角色不是色相。）
 *
 * **一頁最多兩個強調色。** 第 12 頁的三種核准方式同時有 ask／safe／risk
 * 三個色，所以那一頁只有被選中的那張卡上色，另外兩張退回中性。
 *
 * `inverse` 不是一個角色，是「疊在實心強調色塊上的圖示」：選中的熱區是
 * 實心色塊配挖空字（`text-on-accent`），裡面的圖示也要跟著挖空。
 *
 * ──────────────────────────────────────────────────────────────
 * 兩條 SVG 規矩
 * ──────────────────────────────────────────────────────────────
 * 1. **這一份裡沒有任何 `<text>`，而且要維持沒有。** SVG 經縮放之後，
 *    `fontSize={20}` 在半寬欄位裡實際只渲染出 12.5 舞台像素，低於 16 的下限
 *    —— 而一般的對比稽核讀不到這件事。文字一律交給 DOM。
 * 2. **不畫背景矩形**，讓面板透出來；顏色一律 `var(--color-*)`，
 *    這一份裡不應該出現任何 hex。
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼圖示這麼多
 * ──────────────────────────────────────────────────────────────
 * 第 10 頁一次列八條斜線指令，**整欄同色**（都是 cmd）——
 * 能不能分辨全靠形狀。所以那八個圖示是照「一眼認得出差別」挑的，
 * 不是照語意精確度：`CompressGlyph` 兩支相向的箭頭、`BranchGlyph`
 * 一條主線分出去、`RouteGlyph` 一條折線路徑，三個都在講「脈絡」，
 * 但輪廓完全不像。
 * ══════════════════════════════════════════════════════════════ */

export type Tone =
  | 'cmd'
  | 'proj'
  | 'ask'
  | 'safe'
  | 'risk'
  | 'model'
  | 'think'
  | 'fast'
  | 'host'
  | 'net';

/** 圖示可用的顏色：六頁的角色色，外加疊在實心色塊上用的 `inverse` */
export type GlyphTone = Tone | 'inverse';

/**
 * `GlyphTone` 對 CSS 變數。**不要 export** ——
 * react-refresh/only-export-components 會擋掉「元件檔匯出非元件」。
 */
const TONE_VAR: Record<GlyphTone, string> = {
  cmd: 'var(--color-blue)',
  proj: 'var(--color-violet)',
  ask: 'var(--color-amber)',
  safe: 'var(--color-teal)',
  risk: 'var(--color-coral)',
  model: 'var(--color-lime)',
  think: 'var(--color-sky)',
  fast: 'var(--color-acid)',
  host: 'var(--color-paper)',
  net: 'var(--color-faint)',
  inverse: 'var(--color-on-accent)',
};

/* ══════════════════════════════════════════════════════════════
 * 圖示
 *
 * 一律 96×96 的線稿，沒有底、沒有字，靠 `size` 決定實際大小。
 * 描邊寬度寫死 5 —— 縮到 44px 以下會糊掉。例外是 `CheckMark`、
 * `DashMark` 與 `ChevronGlyph`，它們本來就是要塞進小格子裡的記號。
 * ══════════════════════════════════════════════════════════════ */

export interface GlyphProps {
  tone: GlyphTone;
  size?: number;
}

/** 圓角方框裡一道斜線。斜線指令的代表圖形 */
export function SlashGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={12}
        y={16}
        width={72}
        height={64}
        rx={12}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M58 30 38 66"
        fill="none"
        stroke={colour}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 資料夾。專案的代表圖形 */
export function FolderGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M12 30a8 8 0 0 1 8-8h18l10 12h28a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 放大鏡。搜尋專案 */
export function SearchGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <circle
        cx={42}
        cy={42}
        r={24}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M60 60 80 80"
        fill="none"
        stroke={colour}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 舉起的手掌。要求核准 —— 「先停一下」 */
export function HandGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M34 52V24a7 7 0 0 1 14 0v22"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M48 46V20a7 7 0 0 1 14 0v26"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M62 46V28a7 7 0 0 1 14 0v34a26 26 0 0 1-26 26h-4a20 20 0 0 1-16-8L18 66a7 7 0 0 1 10-10l6 6"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 終端機視窗帶 `>_`。代我核准 —— 對應 App 上那顆圖示 */
export function TerminalGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={18}
        width={76}
        height={60}
        rx={10}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="m28 40 12 10-12 10"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 62h18"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 盾牌裡一個驚嘆號。完整存取權 —— App 自己把這一列標成橘字 */
export function AlertShieldGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M48 10 80 22v26c0 20-13 33-32 40-19-7-32-20-32-40V22z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M48 34v20"
        fill="none"
        stroke={colour}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={48} cy={66} r={4} fill={colour} />
    </svg>
  );
}

/** 立方體。模型 —— 對應 App 模型選單那顆圖示 */
export function CubeGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M48 12 82 30v36L48 84 14 66V30z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M14 30l34 18 34-18M48 48v36"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 三層堆疊。能力層級 —— 第 13 頁用來標「同一代裡分幾層」 */
export function TiersGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={30}
        y={14}
        width={36}
        height={16}
        rx={6}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <rect
        x={20}
        y={40}
        width={56}
        height={16}
        rx={6}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <rect
        x={10}
        y={66}
        width={76}
        height={16}
        rx={6}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
    </svg>
  );
}

/** 同心弧。推理強度 —— 一圈比一圈想得遠 */
export function ThinkGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <circle cx={48} cy={48} r={8} fill={colour} />
      <path
        d="M48 26a22 22 0 0 1 0 44"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M48 12a36 36 0 0 1 0 72"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 閃電。快速 */
export function BoltGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M54 10 22 54h20l-6 32 34-46H50z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 半圓儀表加一根指針。狀態 —— 這條對話還剩多少 */
export function GaugeGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M14 68a34 34 0 0 1 68 0"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M48 68 68 44"
        fill="none"
        stroke={colour}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={48} cy={68} r={5} fill={colour} />
    </svg>
  );
}

/** 兩支相向的箭頭夾一條線。壓縮脈絡 */
export function CompressGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M48 14v22m0 0-10-10m10 10 10-10"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 48h64"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M48 82V60m0 0L38 70m10-10 10 10"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 一條主線分出一條支線。側邊對話 */
export function BranchGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M26 16v64"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M26 44h22a14 14 0 0 1 14 14v6"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle
        cx={26}
        cy={16}
        r={6}
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
      />
      <circle
        cx={62}
        cy={72}
        r={6}
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
      />
    </svg>
  );
}

/** 折線路徑帶節點。規劃模式 —— 先把路畫出來 */
export function RouteGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M20 74h20a12 12 0 0 0 0-24H36a12 12 0 0 1 0-24h20"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="10 9"
      />
      <circle
        cx={20}
        cy={74}
        r={7}
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
      />
      <circle
        cx={68}
        cy={26}
        r={7}
        fill="var(--color-panel)"
        stroke={colour}
        strokeWidth={5}
      />
    </svg>
  );
}

/** 靶心。目標 */
export function TargetGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <circle
        cx={48}
        cy={48}
        r={34}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <circle
        cx={48}
        cy={48}
        r={18}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <circle cx={48} cy={48} r={6} fill={colour} />
    </svg>
  );
}

/** 文件上一個勾。審查 */
export function ReviewGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M22 14h34l20 20v48a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M56 14v20h20"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="m30 62 10 10 20-22"
        fill="none"
        stroke={colour}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 尖耳圓臉。桌面寵物 */
export function PetGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M24 40 20 16l20 12M72 40l4-24-20 12"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M24 40a24 24 0 0 1 48 0v16a24 24 0 0 1-48 0z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <circle cx={38} cy={46} r={4} fill={colour} />
      <circle cx={58} cy={46} r={4} fill={colour} />
    </svg>
  );
}

/** 插頭。MCP —— 外接工具接上了沒有 */
export function PlugGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M34 12v22M62 12v22"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M24 34h48v14a24 24 0 0 1-48 0z"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M48 72v14"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 加號。新增專案、composer 左下那顆 */
export function PlusGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <path
        d="M48 22v52M22 48h52"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 麥克風。composer 右下那顆 */
export function MicGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={36}
        y={12}
        width={24}
        height={44}
        rx={12}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M24 46a24 24 0 0 0 48 0M48 70v14"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 螢幕。composer 下方最右邊那顆 */
export function ScreenGlyph({ tone, size = 48 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="presentation">
      <rect
        x={10}
        y={22}
        width={76}
        height={48}
        rx={8}
        fill="none"
        stroke={colour}
        strokeWidth={5}
      />
      <path
        d="M32 82h32"
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── 小記號 ─────────────────────────────────────────────────
 * 這三個是要塞進表格格子與按鈕裡的，尺寸本來就小，
 * 所以描邊比上面那一組細。
 * ────────────────────────────────────────────────────────── */

/** 勾 */
export function CheckMark({ tone, size = 26 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="presentation">
      <path
        d="m7 17 6 6 12-14"
        fill="none"
        stroke={colour}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 短橫線。「這一格沒有」 */
export function DashMark({ tone, size = 26 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="presentation">
      <path
        d="M9 16h14"
        fill="none"
        stroke={colour}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 向下的角括號。下拉選單那一顆 */
export function ChevronGlyph({ tone, size = 26 }: GlyphProps) {
  const colour = TONE_VAR[tone];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="presentation">
      <path
        d="m10 13 6 6 6-6"
        fill="none"
        stroke={colour}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
