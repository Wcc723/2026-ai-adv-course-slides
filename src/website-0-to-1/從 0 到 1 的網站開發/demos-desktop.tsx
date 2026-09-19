import { useState, type ReactNode } from 'react';
import { Highlight } from 'prism-react-renderer';
import { Asset } from '../../components';
import { codeTheme } from '../../components/codeTheme';
import type { AssetId } from '../../assets/manifest';
import sampleImage from './images/codex-image-sample.jpg';
import {
  BrowserGlyph,
  BubbleGlyph,
  ChartGlyph,
  CheckMark,
  CodeGlyph,
  DashMark,
  DiffGlyph,
  DocGlyph,
  FolderGlyph,
  ImageGlyph,
  LayersGlyph,
  MonitorGlyph,
  SheetGlyph,
  ShieldGlyph,
  TerminalGlyph,
} from './diagrams-desktop';
import type { Tone } from './diagrams-desktop';

/* ══════════════════════════════════════════════════════════════
 * 從 0 到 1 的網站開發 · ChatGPT 桌面版那一段
 *
 * 這一份回答的問題只有一個：同一個 App 裡的三種工作方式，差在哪 ——
 * 以及做網站時，Codex 裡會用到哪三件事。
 *
 *   第 4 頁   WhereDemo        這三個在畫面的哪裡（兩個控制項，不是一個）
 *   第 5 頁   ThreeModesDemo   各自適合什麼（左邊選，右邊換一整個畫面）
 *   第 6 頁   TheLineDemo      主要分界：能不能直接操作本機
 *   第 7 頁   CodexExtraDemo   Codex 額外攤開的五個開發者介面
 *   第 8 頁   SameJobDemo      同一件事的三個階段
 *   第 24 頁  CodexToolsDemo   在 Codex 中你會用到的三件事（新寫的）
 *
 * 第 4–8 頁移植自 2026-interactive-presentive 的 ChatGPT桌面版（來源的 2、3、4、6、7 頁）。
 * 來源第 5 頁〈Work 雲端模式的五個特點〉沒有選進這份簡報，
 * 所以 `WorkCloudDemo` 與只給它用的 `cloud` 色、雲端／手機／時鐘圖示都沒有搬過來。
 *
 * ──────────────────────────────────────────────────────────────
 * 文字是校正過的，不要改回去
 * ──────────────────────────────────────────────────────────────
 * 來源的文案 2026-08-31 被逐頁校正過一次，方向只有一個：
 * **不用「A 做得到、B 做不到」的句型**，那個句型幾乎都站不住。所以：
 *   - 第 5 頁 Chat 的說明是「問問題、讀取你提供的資料、來回討論」
 *   - 第 6 頁只剩兩組（本機資料夾、內建瀏覽器），權限那句用「可能」
 *   - 第 7 頁一律講成「Codex 額外攤開這些介面」，不講 Work 沒有這些能力
 * 這一份只做了三件事：深色 → 亮色的色彩轉換、拿掉跨篇引用、頁碼對照新頁序。
 *
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description，也沒有 caption
 * ──────────────────────────────────────────────────────────────
 * 只留兩層：標題說這一頁在講什麼，demo 自己說現在發生什麼。
 * 所以 `Hint` 是台下唯一的文字回饋，每一個呼叫端給的都是跟著狀態變的句子。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 *   main 1824 × 848
 *   − Panel 的 p-10 ＋ border            82
 *   ────────────────────────────────────────
 *   沒有導言也沒有圖說時可用           766
 *
 * 第 4–8 頁的根容器沿用來源的 `h-full max-h-[748px]`，尺寸一格都沒動；
 * 第 24 頁是新寫的，用固定的 720。
 * 字級：卡片主文 26–32、次要說明 19–22、標籤 16–17、等寬 17–20，不低於 15。
 * 沒有任何一個容器可以真的捲動，未輪到的一般 DOM 一律不掛（`{cond && …}`）。
 *
 * ──────────────────────────────────────────────────────────────
 * 深色 → 亮色
 * ──────────────────────────────────────────────────────────────
 * 同名 token 在兩邊明暗相反，轉換時守三條：
 *   1. 實心色塊上的字一律 `text-on-accent`（來源是 text-ink）
 *   2. 選中的狀態不能只靠淡色底：大卡配 6px 實心左粗條（TONE_PICK），
 *      藥丸與分頁換成實色邊框（TONE_ON），視窗裡亮起來的區塊加一圈實色框（zone）
 *   3. 假視窗與網頁預覽是最亮的 `bg-panel`，所有淡色底都疊在它上面算對比；
 *      彩色小字不放在「淡色底疊淡色底」的地方（Chip 因此改成白底描邊）
 * 素材庫的圖是為深底畫的，一律墊 `bg-paper` 底板（AssetPlate）。
 * ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * 共用零件
 *
 * Tailwind 只掃得到完整字串，所以每一格都存整串 class，不做動態拼接。
 * ══════════════════════════════════════════════════════════════ */

/** 文字色。小標與強調字共用 */
const TONE_TEXT: Record<Tone, string> = {
  chat: 'text-coral',
  work: 'text-teal',
  codex: 'text-lime',
  wait: 'text-amber',
  host: 'text-paper',
  net: 'text-faint',
};

/** 一般狀態的卡片：淡底 ＋ 淡框。不承擔「選中」的語意 */
const TONE_CARD: Record<Tone, string> = {
  chat: 'border-coral/55 bg-coral/14',
  work: 'border-teal/55 bg-teal/14',
  codex: 'border-lime/55 bg-lime/14',
  wait: 'border-amber/55 bg-amber/14',
  host: 'border-line bg-panel-lift',
  net: 'border-line-soft bg-panel-lift',
};

/**
 * 被選中的大卡：淡底 ＋ 6px 實心左粗條。
 * 呼叫端一律自己帶 `border border-l-[6px]`，沒選中的卡也留著那條粗條（CARD_OFF 的 line 色），
 * 選中時只換顏色、不換寬度，內容不會位移。
 */
const TONE_PICK: Record<Tone, string> = {
  chat: 'border-coral/55 border-l-coral bg-coral/14',
  work: 'border-teal/55 border-l-teal bg-teal/14',
  codex: 'border-lime/55 border-l-lime bg-lime/14',
  wait: 'border-amber/55 border-l-amber bg-amber/14',
  host: 'border-line border-l-paper bg-panel-lift',
  net: 'border-line border-l-faint bg-panel-lift',
};

/** 沒被選中的大卡。搭配 `border border-l-[6px]` 使用 */
const CARD_OFF =
  'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** 被選中的藥丸／分頁：實色邊框就是那個不透明的訊號 */
const TONE_ON: Record<Tone, string> = {
  chat: 'border-coral bg-coral/20 text-coral',
  work: 'border-teal bg-teal/20 text-teal',
  codex: 'border-lime bg-lime/20 text-lime',
  wait: 'border-amber bg-amber/20 text-amber',
  host: 'border-paper bg-muted/14 text-paper',
  net: 'border-faint bg-muted/14 text-paper',
};

/** 沒被選中的藥丸／分頁 */
const PILL_OFF =
  'border-line-soft bg-panel-lift text-muted hover:border-line';

/**
 * 小徽章。白底描邊而不是淡色底：徽章常常放在已經有淡色底的卡片裡，
 * 淡色疊淡色之後彩色小字會掉到 4.5:1 以下（實算 lime 4.23:1）。
 */
const TONE_CHIP: Record<Tone, string> = {
  chat: 'border-coral/70 bg-panel text-coral',
  work: 'border-teal/70 bg-panel text-teal',
  codex: 'border-lime/70 bg-panel text-lime',
  wait: 'border-amber/70 bg-panel text-amber',
  host: 'border-line bg-panel text-paper',
  net: 'border-line bg-panel text-muted',
};

/** 實心小圓點 */
const TONE_DOT: Record<Tone, string> = {
  chat: 'bg-coral',
  work: 'bg-teal',
  codex: 'bg-lime',
  wait: 'bg-amber',
  host: 'bg-muted',
  net: 'bg-faint',
};

/** 實心藥丸（主要按鈕）。字一律 on-accent，對九支強調色都 ≥6.47:1 */
const TONE_PILL: Record<Tone, string> = {
  chat: 'border-coral bg-coral text-on-accent',
  work: 'border-teal bg-teal text-on-accent',
  codex: 'border-lime bg-lime text-on-accent',
  wait: 'border-amber bg-amber text-on-accent',
  host: 'border-paper bg-paper text-on-accent',
  net: 'border-muted bg-muted text-on-accent',
};

/** 只要框線的容器 */
const TONE_EDGE: Record<Tone, string> = {
  chat: 'border-coral/55',
  work: 'border-teal/55',
  codex: 'border-lime/55',
  wait: 'border-amber/55',
  host: 'border-line',
  net: 'border-line-soft',
};

/** 圖示外圈那一層淡光暈。只負責把圖示撐開，不承擔辨識 */
const TONE_HALO: Record<Tone, string> = {
  chat: 'bg-coral/20',
  work: 'bg-teal/20',
  codex: 'bg-lime/20',
  wait: 'bg-amber/20',
  host: 'bg-muted/14',
  net: 'bg-muted/14',
};

/** 面板小標籤的字體規格。顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 最常見的那一種：次要色的小標籤 */
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

/** 次要按鈕的皮膚（「重來」「上一階段」） */
const GHOST_SKIN =
  'border-line-soft text-muted hover:border-line hover:text-paper';

/**
 * 停用的按鈕。**不要用 opacity 壓** —— 稽核量的是實際對比，
 * 半透明的字會掉到 4.5:1 以下。改用色票裡本來就比較淡的 faint。
 */
const GHOST_OFF = 'cursor-default border-line-soft text-faint';

/** 控制列那一排按鈕的共同尺寸 */
const BTN_ROW =
  'h-11 rounded-xl border px-5 text-[19px] transition-colors duration-200';

/** 01 / 02 / 03 … */
function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── DemoRoot ───────────────────────────────────────────── */

/** 第 4–8 頁的最外層，尺寸照來源不動 */
function DemoRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full max-h-[748px] w-full max-w-[1760px] flex-col gap-5">
      {children}
    </div>
  );
}

/* ── StepControls ───────────────────────────────────────── */

/**
 * 「上一階段 / 下一階段 / 重來」那一組控制列。
 * **不叫「上一步／下一步」是刻意的**：頁尾的翻頁鈕就叫那兩個字，
 * 同一個畫面上出現兩組同名按鈕，台下分不出哪一個會換頁。
 */
function StepControls({
  current,
  total,
  tone,
  onPrev,
  onNext,
  onReset,
}: {
  current: number;
  total: number;
  tone: Tone;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const atStart = current <= 0;
  const atEnd = current >= total - 1;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={atStart}
        className={`${BTN_ROW} ${atStart ? GHOST_OFF : GHOST_SKIN}`}
      >
        上一階段
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={atEnd}
        className={`${BTN_ROW} ${
          atEnd ? GHOST_OFF : `${TONE_PILL[tone]} font-medium`
        }`}
      >
        下一階段
      </button>
      <span className={`px-2 ${LABEL_FAINT}`}>
        {pad2(current + 1)} / {pad2(total)}
      </span>
      <button
        type="button"
        onClick={onReset}
        className={`${BTN_ROW} ${GHOST_SKIN}`}
      >
        重來
      </button>
    </div>
  );
}

/* ── Chip / Hint ────────────────────────────────────────── */

/** 關鍵字徽章。預設等寬字 —— 台下要抄得下來 */
function Chip({
  text,
  tone = 'net',
  mono = true,
}: {
  text: string;
  tone?: Tone;
  mono?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3.5 py-1 text-[17px] ${
        mono ? 'font-mono' : ''
      } ${TONE_CHIP[tone]}`}
    >
      {text}
    </span>
  );
}

/** demo 底部那一行提示。台下唯一的文字回饋，所以每一個呼叫端給的都跟著狀態變 */
function Hint({ children, tone }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`text-[21px] leading-snug ${
        tone ? TONE_TEXT[tone] : 'text-muted'
      }`}
    >
      {children}
    </span>
  );
}

/* ── 圖示底座 ───────────────────────────────────────────── */

/** 圖示外面那一圈淡光暈。只負責把圖示撐開，不承擔辨識 */
function GlyphBadge({
  tone,
  size = 76,
  children,
}: {
  tone: Tone;
  size?: number;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl ${TONE_HALO[tone]}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

/**
 * 素材庫的圖一律墊這塊 `bg-paper` 底板。
 * 素材是奶白線稿配深色填色、為深底畫的，直接放在亮色卡片上輪廓線會整條消失、
 * 圖形退化成深色剪影（見 SlideBodyView 的 AssetsBody）。
 */
function AssetPlate({ id, size }: { id: AssetId; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl bg-paper"
      style={{ width: size, height: size }}
    >
      <Asset id={id} size={Math.round(size * 0.84)} />
    </span>
  );
}

/* ── ChatBubble ─────────────────────────────────────────── */

/**
 * 聊天泡泡。
 * padding 不開放覆寫：同權重的 py-3 / py-4 疊在同一個字串裡誰贏是看 CSS 順序，不可靠。
 */
function ChatBubble({
  side,
  tone,
  label,
  className = '',
  children,
}: {
  side: 'user' | 'ai';
  tone?: Tone;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const mine = side === 'user';
  const corner = mine ? 'rounded-br-md' : 'rounded-bl-md';
  const skin = mine
    ? 'border-line bg-panel-lift'
    : tone
      ? TONE_CARD[tone]
      : 'border-line bg-panel';

  return (
    <div
      className={`flex flex-col gap-2 ${mine ? 'items-end' : 'items-start'}`}
    >
      {label !== undefined && (
        <span
          className={
            mine
              ? LABEL_FAINT
              : `${LABEL_TYPE} ${tone ? TONE_TEXT[tone] : 'text-faint'}`
          }
        >
          {label}
        </span>
      )}
      <div
        className={`rounded-2xl border px-5 py-3 ${corner} ${skin} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 假視窗
 *
 * 第 4、7、24 頁反覆出現，三頁是同一個 App，所以長相一定要一樣。
 * 本體是最亮的 bg-panel（亮色 App 的畫面），標題列是 panel-lift 的淺沙色；
 * 裡面所有淡色底都疊在 panel 上，對比才算得準。
 * 標題列高度固定 52，呼叫端算高度時要扣掉。
 * ══════════════════════════════════════════════════════════════ */

function MockWindow({
  title,
  tone,
  right,
  className = '',
  children,
}: {
  title: string;
  tone?: Tone;
  /** 標題列最右邊的東西（Codex 的終端機按鈕那一類） */
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const edge = tone ? TONE_EDGE[tone] : 'border-line';
  const titleColor = tone ? TONE_TEXT[tone] : 'text-muted';

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-panel ${edge} ${className}`}
    >
      <div
        className={`flex h-[52px] shrink-0 items-center gap-3 rounded-t-2xl border-b bg-panel-lift px-5 ${edge}`}
      >
        <span className="h-3 w-3 rounded-full bg-coral" />
        <span className="h-3 w-3 rounded-full bg-amber" />
        <span className="h-3 w-3 rounded-full bg-teal" />
        <span className={`ml-2 text-[19px] ${titleColor}`}>{title}</span>
        {right !== undefined && (
          <span className="ml-auto flex items-center gap-3">{right}</span>
        )}
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * 視窗裡亮起來的區塊 vs 沒亮的區塊（第 7 頁）。
 * 亮起來的那一塊除了淡色底，還要一圈實色框（border ＋ ring，ring 不佔版面、不會讓內容位移）。
 * **不要用 opacity 壓暗沒亮的那幾塊**，稽核量的是實際對比。
 */
function zone(on: boolean) {
  return on
    ? 'border-lime bg-lime/14 ring-1 ring-lime'
    : 'border-line-soft bg-panel-lift';
}

/* ══════════════════════════════════════════════════════════════
 * 第 4 頁 — 這三個在畫面的哪裡
 *
 * 那是兩個不同的控制項，不是一個下拉選單：
 *
 *   左上角的產品選單    ChatGPT ／ Codex
 *   對話區最上面的切換  Chat ／ Work
 *
 * 這一頁的整個設計就是為了讓這件事變得不用解釋：兩個控制項都是真的按鈕，
 * 點下去畫面真的會變。台下看完應該要能自己在自己的 App 上找到它們。
 * 介面字串寫官方的英文名（Chat / Work），中文意思交給第 5 頁的卡片。
 * ══════════════════════════════════════════════════════════════ */

type Product = 'chatgpt' | 'codex';
type Mode = 'chat' | 'work';

const RECENT_CHATS = ['個人網站要放什麼', '各地區營業額分析', '英文講義整理'];

const PROJECT_NAMES = ['個人網站', '公司報表'];

/** 側邊欄的一列。`on` 的那一列是目前打開的那一段對話 */
function SideRow({
  text,
  tone,
  on = false,
}: {
  text: string;
  tone: Tone;
  on?: boolean;
}) {
  return (
    <div
      className={`flex h-11 items-center gap-3 rounded-lg border border-l-[6px] px-3 text-[19px] ${
        on ? `${TONE_PICK[tone]} ${TONE_TEXT[tone]}` : 'border-transparent text-muted'
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[on ? tone : 'net']}`}
      />
      <span className="truncate">{text}</span>
    </div>
  );
}

function WhereDemo() {
  const [product, setProduct] = useState<Product>('chatgpt');
  const [mode, setMode] = useState<Mode>('chat');
  const [menuOpen, setMenuOpen] = useState(false);

  const inCodex = product === 'codex';
  const tone: Tone = inCodex ? 'codex' : mode === 'chat' ? 'chat' : 'work';
  const where = inCodex
    ? 'Codex'
    : `ChatGPT ${'›'} ${mode === 'chat' ? 'Chat' : 'Work'}`;

  const hint = menuOpen ? (
    <>
      這個選單只有兩個選項：<span className="text-paper">ChatGPT</span> 與{' '}
      <span className="text-lime">Codex</span>。Chat 與 Work 都住在 ChatGPT 裡面，不在這裡選。
    </>
  ) : inCodex ? (
    <>
      Codex 的主體一樣是跟 AI 的對話 —— 只是旁邊多了
      <span className="text-lime">審查修改的畫面</span>與
      <span className="text-lime">終端機</span>，而且它有自己的專案與紀錄。
    </>
  ) : mode === 'chat' ? (
    <>
      <span className="text-coral">Chat</span> 是你問一句它答一句，幫你想、幫你查、幫你改一段話。
    </>
  ) : (
    <>
      <span className="text-teal">Work</span> 是同一個輸入框，但它會把整件事做完，交回來一份可以打開檢查的成果。
    </>
  );

  return (
    <DemoRoot>
      <MockWindow
        title={where}
        tone={tone}
        className="min-h-0 flex-1"
        right={
          inCodex ? (
            <span className="flex items-center gap-2 rounded-lg border border-lime/55 bg-panel px-3 py-1">
              <TerminalGlyph tone="codex" size={22} />
              <span className="text-[17px] text-lime">終端機</span>
            </span>
          ) : undefined
        }
      >
        {/* ── 側邊欄 ── */}
        <div className="relative flex w-[340px] shrink-0 flex-col gap-3 border-r border-line p-5">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-14 shrink-0 items-center justify-between rounded-xl border px-4 text-[23px] transition-colors duration-200 ${
              menuOpen
                ? TONE_ON[inCodex ? 'codex' : 'host']
                : `${TONE_CARD['host']} text-paper hover:border-muted`
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[inCodex ? 'codex' : 'host']}`}
              />
              {inCodex ? 'Codex' : 'ChatGPT'}
            </span>
            <span className="text-[17px] text-faint">{menuOpen ? '▲' : '▼'}</span>
          </button>

          {menuOpen && (
            <div className="absolute left-5 right-5 top-[76px] z-10 flex flex-col gap-1 rounded-xl border border-line bg-panel p-2 shadow-lg">
              {(['chatgpt', 'codex'] as Product[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProduct(p);
                    setMenuOpen(false);
                  }}
                  className={`flex h-12 items-center gap-3 rounded-lg border px-3 text-[21px] transition-colors duration-200 ${
                    product === p
                      ? TONE_ON[p === 'codex' ? 'codex' : 'host']
                      : 'border-transparent text-muted hover:bg-panel-lift'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[p === 'codex' ? 'codex' : 'host']}`}
                  />
                  {p === 'codex' ? 'Codex' : 'ChatGPT'}
                </button>
              ))}
            </div>
          )}

          <div
            className={`flex h-12 shrink-0 items-center rounded-xl border px-4 text-[19px] ${TONE_CARD['net']} text-muted`}
          >
            ＋ 新對話
          </div>

          {inCodex ? (
            <>
              <SideRow text="Pull Request" tone="codex" />
              <SideRow text="網站" tone="codex" />
              <SideRow text="已排程" tone="codex" />
              <SideRow text="外掛程式" tone="codex" />
              <span className={`mt-2 ${LABEL_FAINT}`}>專案</span>
              <SideRow text="個人網站" tone="codex" />
              <SideRow text="換掉首頁的排版" tone="codex" on />
              <SideRow text="修正手機版跑版" tone="codex" />
              <SideRow text="公司報表" tone="codex" />
            </>
          ) : (
            <>
              <span className={`mt-2 ${LABEL_FAINT}`}>最近</span>
              {RECENT_CHATS.map((text, i) => (
                <SideRow key={text} text={text} tone={tone} on={i === 0} />
              ))}
              <span className={`mt-2 ${LABEL_FAINT}`}>專案</span>
              {PROJECT_NAMES.map((text) => (
                <SideRow key={text} text={text} tone={tone} />
              ))}
            </>
          )}
        </div>

        {/* ── 主區 ── */}
        <div className="flex min-h-0 flex-1 flex-col p-6">
          {inCodex ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="flex shrink-0 items-center gap-3">
                <Chip text="個人網站" tone="codex" />
                <span className="text-[19px] text-faint">
                  這個資料夾就是它的工作範圍
                </span>
              </div>
              {/*
               * 版面照實機截圖對過：
               * 側邊欄 ｜ 上半是「對話 ＋ 審查」兩欄 ｜ 下半是橫跨兩欄的終端機。
               * 左邊那條列的是專案與對話，不是檔案樹；
               * 終端機橫跨對話與審查底下，但只到側邊欄的右緣。
               */}
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="flex min-h-0 flex-1 gap-4">
                  {/* 對話是主體，所以是整個畫面裡最寬的一塊。泡泡不掛名字，靠左右與顏色分 */}
                  <div
                    className={`flex min-h-0 flex-1 flex-col justify-end gap-4 rounded-xl border p-5 ${TONE_CARD['net']}`}
                  >
                    <ChatBubble side="user" className="max-w-[560px]">
                      <span className="text-[21px] leading-snug text-paper">
                        把首頁的大標改成我的名字
                      </span>
                    </ChatBubble>
                    <ChatBubble side="ai" tone="codex" className="max-w-[640px]">
                      <span className="text-[21px] leading-snug text-paper">
                        改好了，順便加了一行職稱。
                      </span>
                    </ChatBubble>
                    <ChatBubble side="user" className="max-w-[560px]">
                      <span className="text-[21px] leading-snug text-paper">
                        照片再大一點
                      </span>
                    </ChatBubble>
                    <ChatBubble side="ai" tone="codex" className="max-w-[640px]">
                      <span className="text-[21px] leading-snug text-paper">
                        調成整個寬度了，手機上也試過。
                      </span>
                    </ChatBubble>
                    <div
                      className={`flex h-[56px] shrink-0 items-center justify-between rounded-xl border px-4 ${TONE_CARD['net']}`}
                    >
                      <span className="text-[19px] text-faint">想做什麼都可以</span>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${TONE_PILL['codex']}`}
                      >
                        {'↑'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex min-h-0 w-[420px] shrink-0 flex-col gap-2 rounded-xl border p-4 ${TONE_CARD['codex']}`}
                  >
                    <span className="flex items-center gap-3">
                      <DiffGlyph tone="codex" size={22} />
                      <span className={`${LABEL_TYPE} text-lime`}>審查</span>
                      <span className="ml-auto font-mono text-[17px] text-teal">＋31</span>
                      <span className="font-mono text-[17px] text-coral">−9</span>
                    </span>
                    <span className="font-mono text-[17px] text-muted">index.html</span>
                    {/* 刪除／新增列的淡底只到 /14：它疊在審查區的淡綠底上，再高字就掉到 4.6:1。
                        語意由行首的 − ＋ 與字色承擔，淡底只是分組 */}
                    <span className="rounded-md bg-coral/14 px-3 py-1 font-mono text-[17px] text-coral">
                      − &lt;h1&gt;我的網站&lt;/h1&gt;
                    </span>
                    <span className="rounded-md bg-teal/14 px-3 py-1 font-mono text-[17px] text-teal">
                      ＋ &lt;h1&gt;陳小明&lt;/h1&gt;
                    </span>
                    <span className="rounded-md bg-teal/14 px-3 py-1 font-mono text-[17px] text-teal">
                      ＋ &lt;p&gt;前端工程師&lt;/p&gt;
                    </span>
                    <span className="px-3 py-1 font-mono text-[17px] text-faint">
                      &nbsp;&nbsp;&lt;img src=&quot;photo.jpg&quot; /&gt;
                    </span>
                    <span className="px-3 py-1 text-[17px] text-faint">167 行沒有變動</span>
                  </div>
                </div>

                {/* 橫跨對話與審查底下的那一條 */}
                <div
                  className={`flex h-[104px] shrink-0 flex-col justify-center gap-1.5 rounded-xl border px-4 ${TONE_CARD['net']}`}
                >
                  <span className="flex items-center gap-2">
                    <TerminalGlyph tone="net" size={20} />
                    <span className={LABEL_FAINT}>終端機</span>
                    <span className="rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[16px] text-muted">
                      個人網站
                    </span>
                  </span>
                  <span className="font-mono text-[17px] text-lime">
                    {'›'} python3 -m http.server 5500
                  </span>
                  <span className="font-mono text-[17px] text-faint">Serving HTTP on :: port 5500</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/*
               * 官方講法是「at the top of the new chat page, above the composer」——
               * 它在對話區的最上面、置中，不是貼在輸入框上緣。
               */}
              <div className="mb-4 flex h-[52px] shrink-0 items-center justify-center gap-2">
                {(
                  [
                    { key: 'chat', label: 'Chat', tone: 'chat' },
                    { key: 'work', label: 'Work', tone: 'work' },
                  ] as { key: Mode; label: string; tone: Tone }[]
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={`h-11 rounded-full border px-6 text-[21px] transition-colors duration-200 ${
                      mode === m.key ? TONE_ON[m.tone] : PILL_OFF
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex min-h-0 flex-1 flex-col justify-end gap-5">
                {mode === 'chat' ? (
                  <>
                    {/* 這一頁在講位置，對話內容只是佈景 —— 刻意跟第 5、8 頁用不同的話題 */}
                    <ChatBubble side="user" label="你" className="max-w-[900px]">
                      <span className="text-[24px] leading-snug text-paper">
                        「敬請把握這次難得的機會」這句話太生硬，幫我改口語一點
                      </span>
                    </ChatBubble>
                    <ChatBubble
                      side="ai"
                      tone="chat"
                      label="ChatGPT"
                      className="max-w-[1000px]"
                    >
                      <span className="text-[24px] leading-snug text-paper">
                        可以寫成「這次名額不多，想來的話早點跟我說」。要更輕鬆一點還是更正式一點？
                      </span>
                    </ChatBubble>
                  </>
                ) : (
                  <div
                    className={`flex flex-col gap-4 rounded-2xl border p-6 ${TONE_CARD['work']}`}
                  >
                    <span className={`${LABEL_TYPE} text-teal`}>工作中</span>
                    <span className="text-[24px] leading-snug text-paper">
                      把「公司報表」資料夾裡的試算表，整理成一份各地區營業額月報
                    </span>
                    <div className="flex flex-col gap-2">
                      {['讀取資料夾裡的試算表', '算出各地區營業額', '畫成長條圖', '寫成一份月報'].map(
                        (s, i) => (
                          <span
                            key={s}
                            className="flex items-center gap-3 text-[21px] text-muted"
                          >
                            <CheckMark tone={i < 3 ? 'work' : 'net'} size={22} />
                            {s}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`mt-4 flex h-[76px] shrink-0 items-center justify-between rounded-2xl border px-5 ${TONE_CARD['net']}`}
              >
                <span className="text-[21px] text-faint">問點什麼，或交代一件事…</span>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${TONE_PILL[tone]}`}
                >
                  {'↑'}
                </span>
              </div>
            </>
          )}
        </div>
      </MockWindow>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <Hint>{hint}</Hint>
        <button
          type="button"
          onClick={() => {
            setProduct('chatgpt');
            setMode('chat');
            setMenuOpen(false);
          }}
          className={`${BTN_ROW} ${GHOST_SKIN}`}
        >
          重來
        </button>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 5 頁 — 三個選項各自適合什麼
 *
 * 左邊三個選項，右邊各自一個畫面：Chat 是一段對話、Work 是報告與試算表、
 * Codex 是程式碼與一個網站。右邊三個場景都是靜態的畫面，只有左邊的選擇是活的。
 * 三張卡的圖用素材庫的 chat-mode / work-mode / codex-mode，那三張圖就是為這一頁畫的。
 * ══════════════════════════════════════════════════════════════ */

const MODES = [
  {
    key: 'chat',
    asset: 'chat-mode',
    name: 'Chat',
    zh: '對話',
    line: '問問題、讀取你提供的資料、來回討論',
    tone: 'chat',
  },
  {
    key: 'work',
    asset: 'work-mode',
    name: 'Work',
    zh: '工作',
    line: '講清楚要什麼，它把成果做出來給你檢查',
    tone: 'work',
  },
  {
    key: 'codex',
    asset: 'codex-mode',
    name: 'Codex',
    zh: '',
    line: '用你電腦上的檔案，直接寫程式',
    tone: 'codex',
  },
] as const;

type ModeKey = (typeof MODES)[number]['key'];

/** Work 那一欄的產出檔案 */
const WORK_OUTPUTS = [
  { name: '各地區營業額.xlsx', glyph: 'sheet' },
  { name: '地區長條圖.png', glyph: 'chart' },
  { name: '營運月報.docx', glyph: 'doc' },
] as const;

function ThreeModesDemo() {
  const [picked, setPicked] = useState<ModeKey>('chat');
  const current = MODES.find((m) => m.key === picked)!;

  const hint =
    picked === 'chat' ? (
      <>
        Chat 主要適合來回討論；<span className="text-paper">可以讀取你附上的檔案</span>，但不會直接把整個本機資料夾當成工作範圍。
      </>
    ) : picked === 'work' ? (
      <>
        Work 收到的是一個<span className="text-paper">目標</span>，交回來的是三個真的檔案 —— 你打開就能檢查。
      </>
    ) : (
      <>Codex 直接動的是資料夾裡的檔案，改完還會自己打開網站看一眼。</>
    );

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：三個選項 ── */}
        <div className="flex w-[520px] shrink-0 flex-col gap-5">
          {MODES.map((m) => {
            const on = m.key === picked;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setPicked(m.key)}
                className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                  on ? TONE_PICK[m.tone] : CARD_OFF
                }`}
              >
                <AssetPlate id={m.asset} size={136} />
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="flex items-baseline gap-3">
                    <span
                      className={`font-display text-[34px] ${on ? TONE_TEXT[m.tone] : 'text-paper'}`}
                    >
                      {m.name}
                    </span>
                    {m.zh !== '' && (
                      <span className="text-[21px] text-faint">{m.zh}</span>
                    )}
                  </span>
                  <span className="text-[20px] leading-snug text-muted">{m.line}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 右：對應的畫面 ── */}
        <div
          className={`flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border p-6 ${TONE_CARD[current.tone]}`}
        >
          {picked === 'chat' && (
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
              <ChatBubble side="user" label="你" className="max-w-[760px]">
                <span className="flex flex-col items-end gap-2">
                  {/* 附件晶片：Hint 說「可以讀取你附上的檔案」，畫面上就要看得到一份 */}
                  <span className="flex items-center gap-2 self-start rounded-lg border border-line bg-panel px-3 py-1">
                    <DocGlyph tone="net" size={20} />
                    <span className="font-mono text-[17px] text-muted">作品清單.docx</span>
                  </span>
                  <span className="text-[23px] leading-snug text-paper">
                    我想做一個自己的個人網站，可是不知道從哪裡開始。
                  </span>
                </span>
              </ChatBubble>
              <ChatBubble side="ai" tone="chat" label="ChatGPT" className="max-w-[860px]">
                <span className="text-[23px] leading-snug text-paper">
                  先決定它要給誰看。給找工作的人看，跟給朋友看，內容差很多。
                </span>
              </ChatBubble>
              <ChatBubble side="user" label="你" className="max-w-[760px]">
                <span className="text-[23px] leading-snug text-paper">給想找我接案的人看。</span>
              </ChatBubble>
              <ChatBubble side="ai" tone="chat" label="ChatGPT" className="max-w-[860px]">
                <span className="text-[23px] leading-snug text-paper">
                  那作品放最前面、聯絡方式要一眼看得到，自我介紹壓到三行以內就好。
                </span>
              </ChatBubble>
            </div>
          )}

          {picked === 'work' && (
            <>
              <div className="flex shrink-0 items-center gap-3">
                <FolderGlyph tone="work" size={30} />
                <span className={`${LABEL_TYPE} text-teal`}>工作範圍</span>
                <Chip text="公司報表" tone="work" />
              </div>
              <div className="flex flex-col gap-2.5">
                {['讀取資料夾裡的三份試算表', '算出各地區的營業額', '畫成一張長條圖', '寫成一份月報'].map(
                  (s) => (
                    <span key={s} className="flex items-center gap-3 text-[22px] text-muted">
                      <CheckMark tone="work" size={24} />
                      {s}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-auto flex shrink-0 gap-4">
                {WORK_OUTPUTS.map((o) => (
                  <div
                    key={o.name}
                    className={`flex flex-1 flex-col items-center gap-4 rounded-2xl border p-6 ${TONE_CARD['host']}`}
                  >
                    <GlyphBadge tone="work" size={92}>
                      {o.glyph === 'sheet' && <SheetGlyph tone="work" size={56} />}
                      {o.glyph === 'chart' && <ChartGlyph tone="work" size={56} />}
                      {o.glyph === 'doc' && <DocGlyph tone="work" size={56} />}
                    </GlyphBadge>
                    <span className="font-mono text-[19px] text-paper">{o.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {picked === 'codex' && (
            <>
              <div className="flex shrink-0 items-center gap-3">
                <FolderGlyph tone="codex" size={30} />
                <span className={`${LABEL_TYPE} text-lime`}>工作範圍</span>
                <Chip text="個人網站" tone="codex" />
              </div>
              <div className="flex min-h-0 flex-1 gap-4">
                <div
                  className={`flex min-h-0 w-[46%] shrink-0 flex-col gap-1.5 rounded-2xl border p-5 ${TONE_CARD['host']}`}
                >
                  <span className={`${LABEL_TYPE} mb-1 text-lime`}>index.html</span>
                  {[
                    '<section class="hero">',
                    '  <img src="photo.jpg" />',
                    '  <h1>陳小明</h1>',
                    '  <p>前端工程師</p>',
                    '</section>',
                    '',
                    '<section class="works">',
                    '  <h2>作品</h2>',
                    '  <ul id="list"></ul>',
                    '</section>',
                    '',
                    '<footer>',
                    '  <a href="mailto:hi@…">寫信給我</a>',
                    '</footer>',
                  ].map((line, i) => (
                    <span
                      key={i}
                      className="whitespace-pre font-mono text-[18px] leading-snug text-paper"
                    >
                      {line === '' ? ' ' : line}
                    </span>
                  ))}
                </div>

                {/* 網頁預覽：最亮的 bg-panel ＋ 墨色字（來源是深底上的反白畫面） */}
                <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border border-line bg-panel p-6">
                  <div className="flex items-center gap-4">
                    <span className="h-16 w-16 shrink-0 rounded-full border border-line bg-line-soft" />
                    <span className="flex flex-col gap-1">
                      <span className="text-[26px] font-medium text-paper">陳小明</span>
                      <span className="text-[19px] text-muted">前端工程師</span>
                    </span>
                  </div>
                  <span className="text-[19px] leading-snug text-muted">
                    做了六年的網站，最近在學怎麼把想法一天內做成看得到的東西。
                  </span>
                  <span className="text-[19px] font-medium text-paper">作品</span>
                  <div className="flex flex-col gap-2.5">
                    {['線上訂位系統', '書籍整理工具', '團購結算表'].map((w) => (
                      <span
                        key={w}
                        className="rounded-lg bg-ink-soft px-4 py-2.5 text-[19px] text-paper"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto border-t border-line pt-4 text-[18px] text-muted">
                    hi@example.com <span className="px-2">·</span> 台中
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint tone={current.tone}>{hint}</Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 6 頁 — 本機工作方式是主要分界
 *
 * 左邊是 Chat，右邊是「Work 與 Codex」—— 合併那兩欄本身就是這一頁要講的事。
 *
 * 原本是三組。「一整段任務」那一組整組拿掉了：Chat 也做得了較大型的研究與代理任務，
 * 把那兩列算成 Work／Codex 獨有是替官方加碼。剩下的兩組才是真的分界：
 *
 *   直接操作本機資料夾（2 列）／使用可操作網頁的瀏覽器（3 列）
 *
 * 「會停下來問你」降成主區底部的一條常駐註記，並且用「可能」——
 * 不是每次開網站、每次下載都一定會問，那要看操作本身與權限模式。
 *
 * **一個修正過的說法**：ChatGPT 的專案 Chat 也用得到（一個專案裡可以開 Chat 也可以開 Work），
 * 真正只有右邊做得到的是「把電腦上的一個資料夾當成工作範圍」，所以第一組是這個說法。
 * ══════════════════════════════════════════════════════════════ */

const LINE_GROUPS = [
  {
    key: 'files',
    title: '直接操作本機資料夾',
    glyph: 'folder',
    rows: ['直接打開電腦上的一個資料夾來工作', '一次改好幾個檔案，而且記得上一次改了什麼'],
    hint: (
      <>
        Chat 也讀得懂檔案 —— 前提是<span className="text-paper">你把檔案附上去</span>。Work 與 Codex 是你把整個資料夾交出去，它自己去翻。
      </>
    ),
  },
  {
    key: 'browser',
    title: '使用可操作網頁的瀏覽器',
    glyph: 'browser',
    rows: ['在 App 裡直接開網頁，你跟它看到同一頁', '自己在好幾個分頁之間切換', '登入網站、下載檔案'],
    hint: (
      <>
        這個瀏覽器是 App 內建的，<span className="text-paper">跟你平常那個 Chrome 是分開的兩套</span>，登入紀錄不共用。
      </>
    ),
  },
] as const;

type LineKey = (typeof LINE_GROUPS)[number]['key'];

/**
 * 展開那一組左邊的小情境。沒有它的話這一頁就只是一張打勾表 ——
 * 「內建的瀏覽器」這種詞，台下第一次聽想像不出畫面。
 * 底色用最亮的 panel：外面那張展開的卡已經是 panel-lift，同色疊上去會看不出框。
 */
function LineScene({ kind }: { kind: LineKey }) {
  if (kind === 'files') {
    return (
      <span className="flex h-full flex-col gap-2.5 rounded-xl border border-line bg-panel p-5">
        <span className="flex items-center gap-3">
          <FolderGlyph tone="host" size={26} />
          <span className="font-mono text-[19px] text-paper">個人網站/</span>
        </span>
        {['index.html', 'style.css', 'photo.jpg', '自我介紹.txt', '作品清單.md'].map((f) => (
          <span key={f} className="pl-9 font-mono text-[18px] text-muted">
            {f}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="flex h-full flex-col gap-3 rounded-xl border border-line bg-panel p-5">
      <span className="flex items-center gap-2">
        <span
          className={`rounded-t-md border-b-2 border-teal px-3 py-1 text-[17px] ${TONE_TEXT['work']}`}
        >
          作品集後台
        </span>
        <span className="rounded-t-md px-3 py-1 text-[17px] text-faint">圖庫</span>
        <span className="rounded-t-md px-3 py-1 text-[17px] text-faint">＋</span>
      </span>
      <span className="rounded-lg border border-line-soft px-3 py-2 font-mono text-[17px] text-muted">
        https://…/admin/login
      </span>
      <span className="flex flex-col gap-2">
        <span className="rounded-lg border border-line-soft px-3 py-2 text-[17px] text-faint">
          帳號
        </span>
        <span className="rounded-lg border border-line-soft px-3 py-2 text-[17px] text-faint">
          密碼
        </span>
      </span>
    </span>
  );
}

function TheLineDemo() {
  const [picked, setPicked] = useState<LineKey>('files');
  const current = LINE_GROUPS.find((g) => g.key === picked)!;

  return (
    <DemoRoot>
      {/*
       * ── 頂列：兩邊的名字，各帶一句「它看得到什麼」 ──
       * 那一句不是裝飾。官方文件從來沒有寫過一份「Chat 不能做什麼」的清單，
       * 加上這一句之後，左欄講的是範圍（它手上有哪些東西），不是能力上限。
       */}
      <div className="flex h-[64px] shrink-0 items-center gap-4">
        <span className="flex-1" />
        <span
          className={`flex h-full w-[240px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border ${TONE_CARD['chat']}`}
        >
          <span className="flex items-center gap-2">
            <BubbleGlyph tone="chat" size={24} />
            <span className="font-display text-[24px] text-coral">Chat</span>
          </span>
          <span className="text-[16px] text-faint">你貼進來、你上傳的</span>
        </span>
        <span
          className={`flex h-full w-[420px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border ${TONE_CARD['host']}`}
        >
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT['work']}`} />
              <span className="font-display text-[24px] text-teal">Work</span>
            </span>
            <span className="text-[19px] text-faint">＋</span>
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT['codex']}`} />
              <span className="font-display text-[24px] text-lime">Codex</span>
            </span>
          </span>
          <span className="text-[16px] text-faint">再加上你允許它碰的這台電腦</span>
        </span>
      </div>

      {/* ── 主區：兩組 ＋ 權限註記 ── */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {LINE_GROUPS.map((g) => {
          const on = g.key === picked;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setPicked(g.key)}
              className={`flex shrink-0 flex-col rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                on ? `${TONE_PICK['host']} flex-1` : `${CARD_OFF} h-[86px]`
              }`}
            >
              <span className="flex h-[86px] shrink-0 items-center gap-4">
                <GlyphBadge tone={on ? 'host' : 'net'} size={56}>
                  {g.glyph === 'folder' && (
                    <FolderGlyph tone={on ? 'host' : 'net'} size={38} />
                  )}
                  {g.glyph === 'browser' && (
                    <BrowserGlyph tone={on ? 'host' : 'net'} size={38} />
                  )}
                </GlyphBadge>
                <span className={`flex-1 text-[28px] ${on ? 'text-paper' : 'text-muted'}`}>
                  {g.title}
                </span>
                <span className="flex w-[240px] shrink-0 justify-center">
                  <DashMark tone="net" size={30} />
                </span>
                <span className="flex w-[420px] shrink-0 items-center justify-center gap-16">
                  <CheckMark tone="work" size={30} />
                  <CheckMark tone="codex" size={30} />
                </span>
              </span>

              {on && (
                <span className="flex min-h-0 flex-1 gap-6 border-t border-line pt-3 pb-4">
                  <span className="flex w-[440px] shrink-0 flex-col">
                    <LineScene kind={g.key} />
                  </span>
                  <span className="flex min-h-0 flex-1 flex-col justify-center gap-4">
                    {g.rows.map((row) => (
                      <span key={row} className="flex items-center gap-4">
                        <span className="flex-1 text-[22px] leading-snug text-muted">{row}</span>
                        <span className="flex w-[240px] shrink-0 justify-center">
                          <DashMark tone="net" size={24} />
                        </span>
                        <span className="flex w-[420px] shrink-0 items-center justify-center gap-16">
                          <CheckMark tone="work" size={24} />
                          <CheckMark tone="codex" size={24} />
                        </span>
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </button>
          );
        })}

        {/*
         * 「會停下來問你」本身值得留，所以降成一條常駐註記，而且用「可能」：
         * 不是每次開網站、每次下載都一定會問，那要看操作本身與你設定的權限模式。
         */}
        <div
          className={`flex h-[76px] shrink-0 items-center gap-4 rounded-2xl border px-6 ${TONE_CARD['wait']}`}
        >
          <ShieldGlyph tone="wait" size={34} />
          <span className="text-[21px] leading-snug text-muted">
            碰到需要授權、敏感或重要的操作時，<span className="text-amber">它可能停下來請你確認</span>。
          </span>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint>{current.hint}</Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 7 頁 — Codex 額外提供的開發者介面
 *
 * 官方自己寫「ChatGPT Work and Codex have overlapping capabilities」，
 * Work 的能力清單裡也包含 run code and shell commands。所以這一頁講的是
 * **Codex 額外攤開了哪些介面**，一句都不寫「Work 做不到」；
 * 「差別在畫面，不在能不能」也拿掉了 —— 那句話一樣太絕對。
 *
 * 五個名詞（終端機、diff、worktree、repository）這一頁不解釋，
 * 只讓台下看見它們在畫面上的位置，自己看出共同點：它們都是開發者介面。
 *
 * 右邊那個 Codex 視窗是主體，五個區塊固定在原位，選哪一項就亮哪一塊 ——
 * 換位置的話台下要重新找一次，那就白做了。
 * ══════════════════════════════════════════════════════════════ */

const CODEX_EXTRAS = [
  {
    key: 'terminal',
    title: '內建的終端機面板',
    en: 'Terminal',
    line: '跑一行指令、看它印出什麼，就在同一個視窗裡',
    hint: '指令與輸出就攤在同一個視窗的下半部，不用切到別的 App。',
  },
  {
    key: 'diff',
    title: '專門看修改的畫面',
    en: 'Review',
    line: '哪幾行被改了，改之前跟改之後排在一起',
    hint: '綠色是加上去的、紅色是被拿掉的 —— 不用讀懂程式，也看得出它動了多少。',
  },
  {
    key: 'comment',
    title: '在那些修改上留意見',
    en: 'Comment',
    line: '這一段不要這樣改 —— 直接寫在那一行旁邊',
    hint: '意見直接寫在那一行旁邊，它看得到、會照著改，不用回對話框重講一次。',
  },
  {
    key: 'worktree',
    title: '同一個專案開第二份',
    en: 'Worktree',
    line: '一份繼續用，另一份拿去試新的做法',
    hint: '兩份互不干擾。新的那份試壞了就丟掉，本來那份沒事。',
  },
  {
    key: 'repos',
    title: '切換不同的程式庫',
    en: 'Multi-repo',
    line: '前台跟後台在同一個工作區，要改哪一邊自己切',
    hint: '同一個工作區掛好幾個程式庫，要改哪一邊就在這裡切。',
  },
] as const;

type CodexKey = (typeof CODEX_EXTRAS)[number]['key'];

function CodexExtraDemo() {
  const [picked, setPicked] = useState<CodexKey>('terminal');
  const current = CODEX_EXTRAS.find((e) => e.key === picked)!;

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：五個項目 ── */}
        <div className="flex w-[560px] shrink-0 flex-col gap-3">
          {CODEX_EXTRAS.map((e, i) => {
            const on = e.key === picked;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setPicked(e.key)}
                className={`flex min-h-0 flex-1 flex-col justify-center gap-1.5 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
                  on ? TONE_PICK['codex'] : CARD_OFF
                }`}
              >
                <span className="flex items-baseline gap-3">
                  <span className={LABEL_FAINT}>{pad2(i + 1)}</span>
                  <span className={`text-[25px] ${on ? 'text-lime' : 'text-paper'}`}>
                    {e.title}
                  </span>
                  <span className="font-mono text-[17px] text-faint">{e.en}</span>
                </span>
                <span className="text-[19px] leading-snug text-muted">{e.line}</span>
              </button>
            );
          })}

          <div
            className={`flex shrink-0 items-center gap-4 rounded-2xl border px-5 py-4 ${TONE_CARD['net']}`}
          >
            <CodeGlyph tone="codex" size={34} />
            <span className="text-[19px] leading-snug text-muted">
              Work 與 Codex 的<span className="text-lime">能力大量重疊</span>；Codex 額外攤開終端機、修改比較、程式碼評論、Worktree 與多程式庫等開發者介面。
            </span>
          </div>
        </div>

        {/*
         * ── 右：Codex 的視窗 ──
         *
         *     ┌───────────────────────┬──────────┐
         *     │  對話（主體）          │  審查     │
         *     ├───────────────────────┴──────────┤
         *     │  終端機（橫跨兩欄）                │
         *     └──────────────────────────────────┘
         *
         * 這裡連側邊欄都省掉了 —— 第 4 頁已經演過一次，這一頁的主角是右半邊。
         */}
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <MockWindow
            title="Codex"
            tone="codex"
            className="min-h-0 flex-1"
            right={
              <span
                className={`flex items-center gap-2 rounded-lg border px-3 py-1 ${zone(picked === 'terminal')}`}
              >
                <TerminalGlyph tone={picked === 'terminal' ? 'codex' : 'net'} size={20} />
                <span
                  className={`text-[16px] ${picked === 'terminal' ? 'text-paper' : 'text-faint'}`}
                >
                  終端機
                </span>
              </span>
            }
          >
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
              {/* ① 對話的標題列。工作副本掛在這裡 */}
              <div className="flex h-11 shrink-0 items-center gap-3">
                <FolderGlyph tone="net" size={22} />
                <span className="text-[19px] text-paper">個人網站</span>
                <span className="text-[19px] text-faint">·</span>
                <span className="text-[19px] text-muted">換掉首頁的排版</span>
                <span
                  className={`ml-auto flex h-9 items-center gap-2 rounded-lg border px-3 ${zone(picked === 'worktree')}`}
                >
                  <LayersGlyph tone={picked === 'worktree' ? 'codex' : 'net'} size={20} />
                  <span
                    className={`text-[17px] ${picked === 'worktree' ? 'text-lime' : 'text-faint'}`}
                  >
                    {picked === 'worktree' ? '主要的 ＋ 試新版面' : '主要的'}
                  </span>
                </span>
              </div>

              <div className="flex min-h-0 flex-1 gap-3">
                {/* ② 對話：整個視窗裡最寬的一塊 */}
                <div
                  className={`flex min-h-0 flex-1 flex-col justify-end gap-3 rounded-xl border p-4 ${zone(false)}`}
                >
                  <span className="text-[17px] text-faint">適用於 1m 12s</span>
                  <ChatBubble side="user" className="max-w-[420px]">
                    <span className="text-[19px] leading-snug text-paper">
                      把首頁的大標改成我的名字
                    </span>
                  </ChatBubble>
                  <span className="text-[19px] leading-snug text-paper">
                    已完成。改了 index.html 的兩行，並加上一行職稱。
                  </span>
                  <ChatBubble side="user" className="max-w-[420px]">
                    <span className="text-[19px] leading-snug text-paper">照片再大一點</span>
                  </ChatBubble>
                  <span className="text-[19px] leading-snug text-paper">
                    已經調成整個寬度，手機上也看過一次了。
                  </span>
                  <div
                    className={`flex h-[52px] shrink-0 items-center justify-between rounded-lg border px-4 ${TONE_CARD['net']}`}
                  >
                    <span className="text-[18px] text-faint">想做什麼都可以</span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${TONE_PILL['codex']}`}
                    >
                      {'↑'}
                    </span>
                  </div>
                </div>

                {/* ③ 審查 */}
                <div
                  className={`flex min-h-0 w-[400px] shrink-0 flex-col gap-2 rounded-xl border p-4 ${zone(
                    picked === 'diff' || picked === 'comment' || picked === 'repos',
                  )}`}
                >
                  <span className="flex items-center gap-3">
                    <DiffGlyph
                      tone={picked === 'diff' || picked === 'comment' ? 'codex' : 'net'}
                      size={22}
                    />
                    <span className={LABEL_FAINT}>審查</span>
                    <span className="ml-auto font-mono text-[17px] text-teal">＋31</span>
                    <span className="font-mono text-[17px] text-coral">−9</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[16px] ${
                        picked === 'repos'
                          ? 'border-lime bg-panel text-lime'
                          : 'border-line-soft bg-panel text-faint'
                      }`}
                    >
                      {picked === 'repos' ? '個人網站 ⌄' : '分支 ⌄'}
                    </span>
                    <span className="font-mono text-[16px] text-faint">→ origin/main</span>
                  </span>
                  <span className="font-mono text-[17px] text-muted">index.html</span>
                  {picked === 'repos' && (
                    <span className="font-mono text-[17px] text-lime">shop-api/server.js</span>
                  )}
                  <span className="rounded-md bg-coral/14 px-3 py-1 font-mono text-[17px] text-coral">
                    − &lt;h1&gt;我的網站&lt;/h1&gt;
                  </span>
                  <span className="rounded-md bg-teal/14 px-3 py-1 font-mono text-[17px] text-teal">
                    ＋ &lt;h1&gt;陳小明&lt;/h1&gt;
                  </span>
                  {picked === 'comment' ? (
                    <span className="rounded-lg border border-lime bg-panel px-3 py-2 text-[18px] leading-snug text-paper">
                      這一行改成職稱加城市
                    </span>
                  ) : (
                    <span className="rounded-md bg-teal/14 px-3 py-1 font-mono text-[17px] text-teal">
                      ＋ &lt;p&gt;前端工程師&lt;/p&gt;
                    </span>
                  )}
                  <span className="px-3 py-1 text-[17px] text-faint">167 行沒有變動</span>
                </div>
              </div>

              {/* ④ 終端機：橫跨對話與審查底下 */}
              <div
                className={`flex h-[104px] shrink-0 flex-col justify-center gap-1.5 rounded-xl border px-4 ${zone(picked === 'terminal')}`}
              >
                <span className="flex items-center gap-2">
                  <TerminalGlyph tone={picked === 'terminal' ? 'codex' : 'net'} size={20} />
                  <span className={LABEL_FAINT}>終端機</span>
                  <span className="rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[16px] text-muted">
                    個人網站
                  </span>
                </span>
                <span
                  className={`font-mono text-[17px] ${picked === 'terminal' ? 'text-lime' : 'text-faint'}`}
                >
                  {'›'} python3 -m http.server 5500
                </span>
                <span
                  className={`font-mono text-[17px] ${picked === 'terminal' ? 'text-paper' : 'text-faint'}`}
                >
                  Serving HTTP on :: port 5500
                </span>
              </div>
            </div>
          </MockWindow>

          {/* 逐項的說明。只靠「哪一塊亮起來」不夠，台下不見得知道那一塊叫什麼 */}
          <div
            className={`flex h-[64px] shrink-0 items-center gap-4 rounded-2xl border px-6 ${TONE_CARD['net']}`}
          >
            <span className={`shrink-0 ${LABEL_TYPE} text-lime`}>
              {pad2(CODEX_EXTRAS.findIndex((e) => e.key === picked) + 1)}
            </span>
            <span className="text-[20px] leading-snug text-muted">{current.hint}</span>
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint tone="codex">想查看技術過程、修改內容與開發細節時，就切換到 Codex。</Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 8 頁 — 同一件事的三個階段
 *
 * 第 5–7 頁都在比較，比完台下的問題會是「那我到底該用哪一個」。
 * 這一頁的答案是：**不用選，它們是同一件事的三段。**
 * 例子是同一個個人網站，圖用素材庫的 chat-mode → planning-copy → site-files-edit，
 * 那三張圖的 purpose 逐字就是這三段（見 manifest.ts）。
 * ══════════════════════════════════════════════════════════════ */

const STAGES = [
  {
    key: 'chat',
    asset: 'chat-mode',
    name: 'Chat',
    title: '先討論要放什麼',
    tone: 'chat',
    say: '幫我想清楚這個網站要給誰看，哪一塊放最前面。',
    did: ['把問題問回來給你', '幫你排出先後順序', '沒有動到任何檔案'],
    gotLabel: '你得到的是想法',
    got: ['要給誰看', '哪一塊放最前面', '哪一塊可以砍掉', '自我介紹壓到三行'],
    hint: '這一段刻意先不產出檔案，只把網站方向談清楚。',
  },
  {
    key: 'work',
    asset: 'planning-copy',
    name: 'Work',
    title: '整理成企劃跟文案',
    tone: 'work',
    say: '把剛剛討論的整理成網站企劃，每一頁的文案也寫出來。',
    did: [
      '讀了你們剛剛談的內容',
      '整理成企劃與逐頁文案',
      '存成你打得開的四個檔案',
      '把它們放進「個人網站」資料夾',
    ],
    gotLabel: '你得到四個檔案',
    got: ['網站企劃.docx', '首頁文案.docx', '作品頁文案.docx', '作品清單.xlsx'],
    hint: '同樣一段對話，交給 Work 就變成你打得開、改得動的檔案。',
  },
  {
    key: 'codex',
    asset: 'site-files-edit',
    name: 'Codex',
    title: '在資料夾裡把網站做出來',
    tone: 'codex',
    say: '讀取「個人網站」資料夾裡的網站企劃、首頁文案、作品頁文案、作品清單與照片，做成一頁式網站，完成後打開檢查。',
    did: [
      '打開「個人網站」資料夾，讀裡面的企劃與文案',
      '在同一個資料夾裡建立網站檔案',
      '做完自己開網站看一次',
    ],
    gotLabel: '資料夾裡多了這些',
    got: ['index.html', 'style.css', 'main.js', 'images/photo.jpg'],
    hint: '到 Codex 這一段，才把前面整理好的企劃與文案做成真正的網站檔案。',
  },
] as const;

function SameJobDemo() {
  const [step, setStep] = useState(0);
  const current = STAGES[step];

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        {/* ── 三段 ── */}
        <div className="flex h-[288px] shrink-0 items-stretch gap-4">
          {STAGES.map((s, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <div key={s.key} className="flex min-w-0 flex-1 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-l-[6px] px-5 text-center transition-colors duration-200 ${
                    on
                      ? TONE_PICK[s.tone]
                      : done
                        ? 'border-line border-l-line bg-panel-lift'
                        : CARD_OFF
                  }`}
                >
                  <AssetPlate id={s.asset} size={112} />
                  <span className="flex items-center gap-3">
                    {/*
                     * 做完的那幾張要看得出來已經做完。只換底色不夠 ——
                     * done 與 todo 的底色幾乎一樣，差別要靠一個實心的勾。
                     */}
                    {done ? (
                      <CheckMark tone={s.tone} size={22} />
                    ) : (
                      <span className={LABEL_FAINT}>{pad2(i + 1)}</span>
                    )}
                    <span
                      className={`font-display text-[30px] ${on ? TONE_TEXT[s.tone] : 'text-paper'}`}
                    >
                      {s.name}
                    </span>
                  </span>
                  <span
                    className={`text-[21px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}
                  >
                    {s.title}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <span
                    className={`shrink-0 text-[30px] ${i < step ? 'text-paper' : 'text-faint'}`}
                  >
                    {'→'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 這一段實際發生什麼 ── */}
        <div className="flex min-h-0 flex-1 gap-6">
          <div
            className={`flex min-h-0 flex-1 flex-col justify-center gap-4 rounded-2xl border p-7 ${TONE_CARD['net']}`}
          >
            <span className={LABEL_FAINT}>你說</span>
            <span className="text-[25px] leading-relaxed text-paper">{current.say}</span>
            <span className={`${LABEL_FAINT} pt-1`}>它做了什麼</span>
            <div className="flex flex-col gap-2">
              {current.did.map((d) => (
                <span key={d} className="flex items-center gap-3 text-[20px] text-muted">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[current.tone]}`}
                  />
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div
            className={`flex min-h-0 w-[640px] shrink-0 flex-col justify-center gap-4 rounded-2xl border p-7 ${TONE_CARD[current.tone]}`}
          >
            <span className={`${LABEL_TYPE} ${TONE_TEXT[current.tone]}`}>
              {current.gotLabel}
            </span>
            <div className="flex flex-col gap-4">
              {current.got.map((g) => (
                <span key={g} className="flex items-center gap-3">
                  <CheckMark tone={current.tone} size={26} />
                  <span
                    className={`text-[26px] text-paper ${
                      current.key === 'chat' ? '' : 'font-mono'
                    }`}
                  >
                    {g}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <Hint tone={current.tone}>{current.hint}</Hint>
        <StepControls
          current={step}
          total={STAGES.length}
          tone={current.tone}
          onPrev={() => setStep((s) => Math.max(0, s - 1))}
          onNext={() => setStep((s) => Math.min(STAGES.length - 1, s + 1))}
          onReset={() => setStep(0)}
        />
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 24 頁 — 在 Codex 中你會用到的三件事（新寫的）
 *
 * Notion 規格：畫面左側列出三種選單，說明 Codex 可以用哪些功能 ——
 *   1. 撰寫程式碼：使用先前 Codex 生成程式碼的範例
 *   2. 圖片生成：用 ChatGPT 的圖片生成做一張圖，附上提示詞當說明
 *   3. 伺服器預覽：在本機開一個預覽用的伺服器（跟電腦環境有關，
 *      第一次執行時 AI 可能會請你同意安裝一些工具）
 *
 * 版面：左邊三項直列選單（01/02/03，第一項預設選中），右邊一個 Codex 視窗隨選項換內容。
 * 視窗沿用第 4、7 頁同一個 MockWindow —— 台下要認得出這是同一個 App。
 * 版面刻意跟第 7 頁同構（左清單、右視窗），但右邊是整塊換掉而不是亮某一塊：
 * 這三件事在 Codex 裡是三段不同的對話，不是同一個畫面上的三個區塊。
 *
 * 三段的例子接在一起：
 *   01 用第 23 頁「簡單起手」那段提示詞，Codex 建出 index.html、style.css、main.js，
 *      程式碼片段是第 5 頁那個個人網站的 index.html
 *   02 圖片是**真的用 Codex 生成的**（codex exec --enable image_generation，2026-09-18），
 *      畫面上的提示詞就是當時實際送出的原文（IMAGE_PROMPT），一個字都不要改 ——
 *      改了畫面上的字，就不再是「這段提示詞產出這張圖」。
 *      原圖 1983×793，存成 images/codex-image-sample.jpg（960×384）。
 *   03 預覽的網站用的就是 02 那張圖當首頁主視覺，網址是 http://localhost:5500 ——
 *      第 34 頁 Google 授權來源也寫 http://localhost:5500，埠號兩頁要一致。
 *
 * 03 不寫死要裝哪一個工具：每台電腦缺的東西不一樣，Python 只是舉例。
 *
 * 高度預算（根容器 720）：
 *   主區 720 − gap 20 − Hint 44 = 656
 *   視窗本體 656 − 標題列 52 − 邊框 2 = 602，扣 p-5 → 562
 *   對話標題列 44 ＋ gap 12 → 內容區 506
 *   最擠的是 03 的瀏覽器：網址列 44 ＋ p-5 40 ＋ 主視覺 279 ＋ 作品列 44 ＋ 頁尾 38 ＋ gap 32 = 477
 * ══════════════════════════════════════════════════════════════ */

/** 第 23 頁「簡單起手」的提示詞。空字串是空一行 */
const STARTER_PROMPT = [
  '我想要製作個人介紹網站',
  '',
  '附件中的 @素材 是我的相關資料',
  '請依據我的個人特質，幫我製作個人網站',
  '',
  '請僅使用 HTML、CSS、JS 來完成它',
] as const;

/** 生成 images/codex-image-sample.jpg 時實際送出的提示詞原文。不要改（理由見上方註解） */
const IMAGE_PROMPT =
  '幫我的個人網站生成一張首頁主視覺：溫暖、乾淨的扁平插畫，一個人坐在灑滿陽光的書桌前用筆電工作，旁邊有盆栽和一杯咖啡，米白底搭配柔和的橘色與綠色，橫式構圖，畫面左側留一些空白。不要有任何文字或 logo。';

/** 01 的變更摘要。圓點用 CodeTabs 同一組語言色 */
const CHANGED_FILES = [
  { name: 'index.html', dot: 'bg-lang-html', add: 48 },
  { name: 'style.css', dot: 'bg-lang-css', add: 96 },
  { name: 'main.js', dot: 'bg-lang-javascript', add: 24 },
] as const;

const TOTAL_ADDED = CHANGED_FILES.reduce((sum, f) => sum + f.add, 0);

/** 01 右邊的程式碼片段：第 5 頁那個個人網站的 index.html */
const INDEX_SNIPPET = `<link rel="stylesheet" href="style.css" />

<section class="hero">
  <img src="photo.jpg" />
  <h1>陳小明</h1>
  <p>前端工程師</p>
</section>

<section class="works">
  <h2>作品</h2>
  <ul id="list"></ul>
</section>

<script src="main.js"></script>`;

const PREVIEW_URL = 'http://localhost:5500';

const TOOLS = [
  {
    key: 'code',
    title: '撰寫程式碼',
    en: 'Code',
    line: '把需求變成網站的檔案，直接寫進專案資料夾',
    thread: '建立個人網站',
    hint: (
      <>
        Codex 把<span className="text-paper">真的檔案</span>寫進專案資料夾，右邊是 index.html 的其中一段；想改哪裡，繼續在對話裡說就好。
      </>
    ),
  },
  {
    key: 'image',
    title: '圖片生成',
    en: 'Image',
    line: '用一段提示詞生成圖片，存成專案裡的檔案',
    thread: '生成首頁主視覺',
    hint: (
      <>
        左邊就是生成右邊這張圖<span className="text-paper">實際用的提示詞</span>；不滿意可以接著請它調整，再生成一次。
      </>
    ),
  },
  {
    key: 'preview',
    title: '伺服器預覽',
    en: 'Preview',
    line: '在你的電腦上開一個預覽網址，打開就能看',
    thread: '開啟預覽',
    hint: (
      <>
        localhost 這個網址<span className="text-paper">只有你自己的電腦打得開</span>；要讓別人也看得到，就要部署成一個真的網址。
      </>
    ),
  },
] as const;

type ToolKey = (typeof TOOLS)[number]['key'];

/** 用專案的淺色語法主題畫一小段程式碼。底色必須是 ink-soft —— codeTheme 的對比是對它算的 */
function CodeLines({ code }: { code: string }) {
  return (
    <Highlight theme={codeTheme} code={code} language="markup">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} m-0 whitespace-pre font-mono text-[18px] leading-[1.5]`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {/* 空行由 prism-react-renderer 補成一個 inline-block 的 "\n"，會自己撐出一行高 */}
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

/** 視窗裡的對話區：跟第 7 頁的對話區同一種底（zone 的 off 狀態） */
function ThreadBox({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex min-h-0 flex-col justify-end gap-3 rounded-xl border p-4 ${zone(false)} ${className}`}
    >
      {children}
    </div>
  );
}

/** 對話區最下面的輸入框，跟第 7 頁同一個 */
function Composer() {
  return (
    <div
      className={`flex h-[52px] shrink-0 items-center justify-between rounded-lg border px-4 ${TONE_CARD['net']}`}
    >
      <span className="text-[18px] text-faint">想做什麼都可以</span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${TONE_PILL['codex']}`}
      >
        {'↑'}
      </span>
    </div>
  );
}

/** 01 撰寫程式碼 */
function CodePane() {
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <ThreadBox className="flex-1">
        <ChatBubble side="user" className="max-w-[520px]">
          <span className="flex flex-col">
            {STARTER_PROMPT.map((line, i) =>
              line === '' ? (
                <span key={i} className="h-2" />
              ) : (
                <span key={i} className="text-[20px] leading-snug text-paper">
                  {line}
                </span>
              ),
            )}
          </span>
        </ChatBubble>
        <span className="text-[20px] leading-snug text-paper">
          已完成。依照素材裡的資料，做了一頁式的個人網站：
        </span>
        <div className="flex shrink-0 flex-col gap-2 rounded-lg border border-line bg-panel px-4 py-3">
          <span className="flex items-center gap-3">
            <DiffGlyph tone="codex" size={22} />
            <span className="text-[18px] text-muted">已變更 3 個檔案</span>
            <span className="ml-auto font-mono text-[18px] text-ok">+{TOTAL_ADDED}</span>
          </span>
          {CHANGED_FILES.map((f) => (
            <span key={f.name} className="flex h-[30px] items-center gap-3 pl-1">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${f.dot}`} />
              <span className="font-mono text-[19px] text-paper">{f.name}</span>
              <span className="ml-auto font-mono text-[18px] text-ok">+{f.add}</span>
            </span>
          ))}
        </div>
        <Composer />
      </ThreadBox>

      <div className="flex min-h-0 w-[540px] shrink-0 flex-col rounded-xl border border-line bg-ink-soft">
        <span className="flex h-11 shrink-0 items-center gap-3 border-b border-line-soft px-4">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-lang-html" />
          <span className="font-mono text-[18px] text-muted">index.html</span>
          <span className="ml-auto text-[17px] text-faint">片段</span>
        </span>
        <div className="px-5 py-4">
          <CodeLines code={INDEX_SNIPPET} />
        </div>
      </div>
    </div>
  );
}

/** 02 圖片生成 */
function ImagePane() {
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <ThreadBox className="w-[440px] shrink-0">
        <ChatBubble side="user" label="實際用的提示詞" className="max-w-[400px]">
          <span className="text-[20px] leading-relaxed text-paper">{IMAGE_PROMPT}</span>
        </ChatBubble>
        <span className="text-[20px] leading-snug text-paper">
          生成好了，存進專案的 images 資料夾。
        </span>
        <Composer />
      </ThreadBox>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <span className="flex h-[26px] shrink-0 items-center gap-3">
          <ImageGlyph tone="codex" size={24} />
          <span className={`${LABEL_TYPE} text-lime`}>生成的結果</span>
        </span>
        <img
          src={sampleImage}
          alt="扁平插畫：一個人坐在陽光灑落的木頭書桌前用筆電工作，旁邊有盆栽和一杯咖啡，畫面左側是大片米白留白"
          width={960}
          height={384}
          className="w-full rounded-xl border border-line"
          draggable={false}
        />
        <div
          className={`flex shrink-0 flex-col gap-2.5 rounded-xl border px-4 py-3 ${TONE_CARD['net']}`}
        >
          <span className="flex items-center gap-3">
            <FolderGlyph tone="host" size={24} />
            <span className="text-[19px] text-muted">圖片是一個獨立的檔案，存在</span>
            <span className="font-mono text-[19px] text-paper">個人網站/images/hero.jpg</span>
          </span>
          <div className="rounded-lg border border-line-soft bg-ink-soft px-4 py-1.5">
            <CodeLines code={'<img src="images/hero.jpg" alt="首頁主視覺" />'} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 03 伺服器預覽 */
function PreviewPane() {
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 w-[440px] shrink-0 flex-col gap-3">
        <ThreadBox className="flex-1">
          <ChatBubble side="user" className="max-w-[380px]">
            <span className="text-[20px] leading-snug text-paper">
              開一個預覽，讓我看看網站現在長什麼樣子
            </span>
          </ChatBubble>
          <span className="flex flex-col gap-1">
            <span className="text-[20px] leading-snug text-paper">
              我在本機開了一個預覽伺服器：
            </span>
            <span className="font-mono text-[19px] text-lime underline underline-offset-4">
              {PREVIEW_URL}
            </span>
          </span>
          <Composer />
        </ThreadBox>

        {/* 這一條是講者的註記，不是 Codex 說的話，所以放在對話區外面 */}
        <div
          className={`flex shrink-0 items-start gap-3 rounded-xl border border-l-[6px] px-4 py-3 ${TONE_PICK['wait']}`}
        >
          <ShieldGlyph tone="wait" size={30} />
          <span className="text-[19px] leading-snug text-muted">
            第一次執行時，AI 可能會請你<span className="text-amber">同意安裝需要的工具</span>（例如 Python）。要裝什麼跟你的電腦環境有關。
          </span>
        </div>
      </div>

      {/* 假瀏覽器：網頁畫面是最亮的 bg-panel ＋ 墨色字 */}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-line bg-panel">
        <div className="flex h-11 shrink-0 items-center gap-3 rounded-t-xl border-b border-line bg-ink-soft px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-faint" />
          <span className="h-2.5 w-2.5 rounded-full bg-faint" />
          <span className="h-2.5 w-2.5 rounded-full bg-faint" />
          <span className="ml-2 flex h-8 flex-1 items-center rounded-md border border-line bg-panel px-3 font-mono text-[17px] text-paper">
            {PREVIEW_URL}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          {/* 主視覺就是 02 生成的那張圖；左側的留白剛好放名字 */}
          <div className="relative shrink-0">
            <img
              src={sampleImage}
              alt="個人網站的首頁主視覺"
              width={960}
              height={384}
              className="w-full rounded-lg"
              draggable={false}
            />
            <span className="absolute left-7 top-1/2 flex -translate-y-1/2 flex-col gap-1">
              <span className="text-[34px] font-medium text-paper">陳小明</span>
              <span className="text-[20px] text-muted">前端工程師</span>
            </span>
          </div>
          <div className="flex h-11 shrink-0 items-center gap-3">
            <span className="mr-2 text-[19px] font-medium text-paper">作品</span>
            {['線上訂位系統', '書籍整理工具', '團購結算表'].map((w) => (
              <span
                key={w}
                className="rounded-lg bg-ink-soft px-4 py-2 text-[18px] text-paper"
              >
                {w}
              </span>
            ))}
          </div>
          <span className="mt-auto border-t border-line pt-3 text-[17px] text-muted">
            hi@example.com <span className="px-2">·</span> 台中
          </span>
        </div>
      </div>
    </div>
  );
}

function CodexToolsDemo() {
  const [picked, setPicked] = useState<ToolKey>('code');
  const current = TOOLS.find((t) => t.key === picked)!;

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-5">
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：三件事 ── */}
        <div className="flex w-[480px] shrink-0 flex-col gap-4">
          {TOOLS.map((t, i) => {
            const on = t.key === picked;
            const glyphTone: Tone = on ? 'codex' : 'net';
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setPicked(t.key)}
                className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                  on ? TONE_PICK['codex'] : CARD_OFF
                }`}
              >
                <GlyphBadge tone={glyphTone} size={76}>
                  {t.key === 'code' && <CodeGlyph tone={glyphTone} size={46} />}
                  {t.key === 'image' && <ImageGlyph tone={glyphTone} size={46} />}
                  {t.key === 'preview' && <MonitorGlyph tone={glyphTone} size={46} />}
                </GlyphBadge>
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="flex items-baseline gap-3">
                    <span className={LABEL_FAINT}>{pad2(i + 1)}</span>
                    <span className={`text-[28px] ${on ? 'text-lime' : 'text-paper'}`}>
                      {t.title}
                    </span>
                    <span className="font-mono text-[17px] text-faint">{t.en}</span>
                  </span>
                  <span className="text-[20px] leading-snug text-muted">{t.line}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 右：Codex 的視窗，整塊隨選項換掉 ── */}
        <MockWindow title="Codex" tone="codex" className="min-h-0 min-w-0 flex-1">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-5">
            <div className="flex h-11 shrink-0 items-center gap-3">
              <FolderGlyph tone="net" size={22} />
              <span className="text-[19px] text-paper">個人網站</span>
              <span className="text-[19px] text-faint">·</span>
              <span className="text-[19px] text-muted">{current.thread}</span>
            </div>
            {picked === 'code' && <CodePane />}
            {picked === 'image' && <ImagePane />}
            {picked === 'preview' && <PreviewPane />}
          </div>
        </MockWindow>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint>{current.hint}</Hint>
      </div>
    </div>
  );
}

export {
  CodexExtraDemo,
  CodexToolsDemo,
  SameJobDemo,
  TheLineDemo,
  ThreeModesDemo,
  WhereDemo,
};
