import { useState, type ReactNode } from 'react';
import {
  AlertShieldGlyph,
  BoltGlyph,
  BranchGlyph,
  CheckMark,
  ChevronGlyph,
  CompressGlyph,
  CubeGlyph,
  DashMark,
  FolderGlyph,
  GaugeGlyph,
  HandGlyph,
  MicGlyph,
  PetGlyph,
  PlugGlyph,
  PlusGlyph,
  ReviewGlyph,
  RouteGlyph,
  ScreenGlyph,
  SearchGlyph,
  SlashGlyph,
  TargetGlyph,
  TerminalGlyph,
  ThinkGlyph,
  TiersGlyph,
} from './diagrams-details';
import type { GlyphTone, Tone } from './diagrams-details';

/* ══════════════════════════════════════════════════════════════
 * 第 9–14 頁 — 輸入框下面那一排（建立你第一個專案）
 *
 * 第 4–8 頁講完 Chat、Work、Codex 各自適合什麼。這六頁往下鑽一層，
 * 只講一件事：**輸入框下面那一排，每一顆都在改它怎麼幫你做事。**
 *
 *   第  9 頁  ComposerDemo   那一排在哪裡（四個熱區，後面五頁的地圖）
 *   第 10 頁  SlashDemo      打一個斜線就有的八件事
 *   第 11 頁  ProjectDemo    專案：先確認你在哪一個
 *   第 12 頁  ApprovalDemo   三種核准方式（同一個動作，三種結局）
 *   第 13 頁  ModelDemo      模型清單怎麼讀
 *   第 14 頁  EffortDemo     推理強度與快速是兩回事
 *
 * 移植自 2026-interactive-presentive 的 chatgpt-desktop-details 第 2–7 頁。
 * 內容照搬（2026-09-06 逐條校正、查證過官方文件，見檔尾「六處修正」），
 * 只做三件事：深色→亮色轉換、拿掉跨篇引用、頁碼改成本簡報的順序。
 *
 * ──────────────────────────────────────────────────────────────
 * 第 9 頁是地圖，不是暖場
 * ──────────────────────────────────────────────────────────────
 * 後面五頁講的東西**全部都在同一列上**。少了第 9 頁，台下會以為那是
 * 散落在 App 各處的五個功能。
 *
 * 第 10、12、13 頁本質上都是「選一項、換內容」，同一種殼連放三次，
 * 台下會覺得在原地踏步。所以三頁的殼刻意都不一樣：
 *
 *   第 10 頁   左邊八列直式清單，右邊一塊詳情
 *   第 12 頁   上面三張卡，下面**一個會跑出不同結局的假對話**
 *   第 13 頁   上面一條名字解剖，中間四張橫排卡，下面一條說明帶
 *
 * 第 12 頁是唯一一頁「選了之後看到的不是說明，是後果」——
 * 三種核准方式的差別用講的很抽象，讓同一句話在三種模式下各跑一次就不用講。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description 也沒有 caption，demo 面板內可用約 1744 × 768。
 * 根容器沿用來源的 `h-full max-h-[748px]`，寬度與來源的面板幾乎相同（差 2px），
 * 所以版面沒有重排。
 *
 *   兩段式（主區 flex-1 ＋ gap-5 ＋ 底列 44）→ 主區 684
 *   三段式（頂列 ＋ 主區 ＋ 底列 44）        → 依頂列高度再扣
 *
 * 字級：卡片主文 26–32、次要說明 19–22、標籤 16–17、等寬 18–20。不要低於 15。
 * 沒有任何一個容器可以真的捲動，未輪到的內容一律不掛（`{cond && …}`）。
 *
 * ──────────────────────────────────────────────────────────────
 * 深色 → 亮色：這一份做了哪些事
 * ──────────────────────────────────────────────────────────────
 * 同名 token 在兩個專案明暗相反（`ink` 從近黑變成米白），所以每一格都重寫過：
 *
 *   · 選中的大卡／清單列：淡底之外一律加 6px 不透明左粗條（`TONE_CARD`）。
 *     淡色填色在投影機上會被吃掉，不能單獨承擔「選中」這件事。
 *   · 選中的小熱區／分段按鈕：改成實心色塊配挖空字（`TONE_SOLID`），
 *     圖示同步換成 `inverse`。來源是「淡底＋同色字」，那種組合在紙面上
 *     疊一層 /20 的淡底之後，霽藍字只剩 4.1:1。
 *   · 小徽章：底色改成 `bg-panel`，字色才不必跟淡底搶對比。
 *   · `bg-panel-lift` 只疊在 `bg-panel` 上；放在 panel-lift 容器裡的清單列
 *     改用 `bg-panel`（`CARD_OFF_IN_LIFT`），否則列與容器同色會整片糊掉。
 *   · 假 composer 的輸入框改成最亮的 `bg-panel`，送出鈕是 `bg-paper` 深色圓
 *     配 `text-on-accent` 箭頭 —— 對應真實 App 淺色模式的長相。
 *   · 一頁最多兩個強調色：第 9 頁的外掛圖示改成中性色；第 12 頁只有選中的
 *     那張卡上色；第 14 頁的「2.5× 額度消耗」從 coral 改成 paper。
 *
 * ──────────────────────────────────────────────────────────────
 * 介面上的字一律照實機截圖，教學用語才是我們自己的
 * ──────────────────────────────────────────────────────────────
 * 「代我核准」「選擇專案」「極高」「快速」這些都是繁中介面上的原字串，
 * 逐字照抄。官方文件沒有 zh-Hant 版（learn.chatgpt.com 沒有 zh-TW locale），
 * 網路上找得到的中文對照表是機器翻譯的鏡像站（它把 App 的「脈絡」譯成
 * 「上下文」、「規劃」譯成「計劃」），**不可以拿來當投影片的中文指令名**。
 * 截圖上看得到的中文照抄；截圖上沒有的，用官方英文加我們自己的中譯，
 * 並在畫面上把英文指令名一起放出來（`/plan`、`/compact` 這些是穩定的）。
 *
 * ──────────────────────────────────────────────────────────────
 * 台下的前提
 * ──────────────────────────────────────────────────────────────
 * 看過：第 4–8 頁的 Chat／Work／Codex。**沒有**另外教過 MCP、技能、
 * 終端機與 Git。所以：MCP 那一列不解釋 MCP，只示範「先驗環境、再改輸入」
 * 的除錯順序；審查那一列不提 commit；規劃模式那一列不提 repository。
 * 「脈絡」這個詞也沒有前面的頁面教過，第 10 頁「狀態」那一列補了一句白話定義。
 *
 * 這一份沒有 description 也沒有 caption：標題說這一頁在講什麼，
 * demo 自己說現在發生什麼。所以每一頁都預設演一次 —— 第 9 頁第一個熱區
 * 預設亮著、第 10 頁第一列預設選中、第 11 頁預設已選好一個專案、
 * 第 12 頁預設停在「代我核准」、第 13 頁第一張卡預設選中、
 * 第 14 頁預設就是截圖裡那組設定（極高 ＋ 快速開著）。
 * ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * 共用零件
 *
 * Tailwind 只掃得到完整字串，所以每一格都存整串 class，不做動態拼接
 * （`bg-${tone}/14` 不會產生任何 class）。
 * ══════════════════════════════════════════════════════════════ */

/** 文字色。小標與強調字共用 */
const TONE_TEXT: Record<Tone, string> = {
  cmd: 'text-blue',
  proj: 'text-violet',
  ask: 'text-amber',
  safe: 'text-teal',
  risk: 'text-coral',
  model: 'text-lime',
  think: 'text-sky',
  fast: 'text-acid',
  host: 'text-paper',
  net: 'text-muted',
};

/**
 * 帶語意的大卡與清單列：淡底 ＋ 淡框 ＋ **不透明的 6px 左粗條**。
 * 呼叫端要自己給 `border`（四邊 1px），左邊由這裡加粗。
 */
const TONE_CARD: Record<Tone, string> = {
  cmd: 'border-l-[6px] border-blue/55 border-l-blue bg-blue/14',
  proj: 'border-l-[6px] border-violet/55 border-l-violet bg-violet/14',
  ask: 'border-l-[6px] border-amber/55 border-l-amber bg-amber/14',
  safe: 'border-l-[6px] border-teal/55 border-l-teal bg-teal/14',
  risk: 'border-l-[6px] border-coral/55 border-l-coral bg-coral/14',
  model: 'border-l-[6px] border-lime/55 border-l-lime bg-lime/14',
  think: 'border-l-[6px] border-sky/55 border-l-sky bg-sky/14',
  fast: 'border-l-[6px] border-acid/55 border-l-acid bg-acid/14',
  host: 'border-l-[6px] border-line border-l-paper bg-panel-lift',
  net: 'border-l-[6px] border-muted/55 border-l-muted bg-muted/14',
};

/** 選中的小熱區、分段按鈕：實心色塊配挖空字。裡面的圖示要用 `inverse` */
const TONE_SOLID: Record<Tone, string> = {
  cmd: 'border-blue bg-blue text-on-accent',
  proj: 'border-violet bg-violet text-on-accent',
  ask: 'border-amber bg-amber text-on-accent',
  safe: 'border-teal bg-teal text-on-accent',
  risk: 'border-coral bg-coral text-on-accent',
  model: 'border-lime bg-lime text-on-accent',
  think: 'border-sky bg-sky text-on-accent',
  fast: 'border-acid bg-acid text-on-accent',
  host: 'border-paper bg-paper text-on-accent',
  net: 'border-muted bg-muted text-on-accent',
};

/** 小徽章。底色用最亮的 panel，字色才不必跟淡底搶對比 */
const TONE_CHIP: Record<Tone, string> = {
  cmd: 'border-blue/55 bg-panel text-blue',
  proj: 'border-violet/55 bg-panel text-violet',
  ask: 'border-amber/55 bg-panel text-amber',
  safe: 'border-teal/55 bg-panel text-teal',
  risk: 'border-coral/55 bg-panel text-coral',
  model: 'border-lime/55 bg-panel text-lime',
  think: 'border-sky/55 bg-panel text-sky',
  fast: 'border-acid/55 bg-panel text-acid',
  host: 'border-line bg-panel text-paper',
  net: 'border-line bg-panel text-muted',
};

/** 實心小圓點 */
const TONE_DOT: Record<Tone, string> = {
  cmd: 'bg-blue',
  proj: 'bg-violet',
  ask: 'bg-amber',
  safe: 'bg-teal',
  risk: 'bg-coral',
  model: 'bg-lime',
  think: 'bg-sky',
  fast: 'bg-acid',
  host: 'bg-muted',
  net: 'bg-faint',
};

/** 圖示外圈那一層淡光暈。純裝飾，不承擔辨識 */
const TONE_HALO: Record<Tone, string> = {
  cmd: 'bg-blue/20',
  proj: 'bg-violet/20',
  ask: 'bg-amber/20',
  safe: 'bg-teal/20',
  risk: 'bg-coral/20',
  model: 'bg-lime/20',
  think: 'bg-sky/20',
  fast: 'bg-acid/20',
  host: 'bg-muted/14',
  net: 'bg-muted/14',
};

/** 面板小標籤的字體規格。顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 最常見的那一種：次要色的小標籤 */
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

/**
 * 沒被選中的大卡（直接放在 bg-panel 上）。左邊同樣是 6px，
 * 只是顏色跟框一樣淡 —— 選中與否切換時內容不會左右跳。
 */
const CARD_OFF =
  'border-l-[6px] border-line-soft border-l-line-soft bg-panel-lift hover:border-line';

/**
 * 沒被選中的清單列，**放在 bg-panel-lift 容器裡**的版本。
 * panel-lift 疊 panel-lift 等於沒有底，所以列本身改用最亮的 panel。
 */
const CARD_OFF_IN_LIFT =
  'border-l-[6px] border-line-soft border-l-line-soft bg-panel hover:border-line';

/** 01 / 02 / 03 … */
function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── DemoRoot ───────────────────────────────────────────── */

/** 每一個 demo 的最外層。`h-full max-h-[748px]` 的理由見檔頭 */
function DemoRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full max-h-[748px] w-full max-w-[1760px] flex-col gap-5">
      {children}
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

/**
 * demo 底部那一行提示。沒有導言也沒有圖說，這是台下唯一的文字回饋，
 * 所以每一個呼叫端給的都**跟著狀態變**。
 */
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
 * 粗體標記。說明文字裡各有一句是重點，用 `**…**` 包起來。
 * 寫成一個小函式而不是在資料裡塞 JSX，是為了讓資料表保持純資料。
 */
function markup(text: string, tone: Tone) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={TONE_TEXT[tone]}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/* ══════════════════════════════════════════════════════════════
 * 假的 composer
 *
 * 第 9 頁整頁、第 11 頁底部那一條都用它。版面照實機截圖重畫（2026-09-06）：
 *
 *     我們要處理什麼？
 *     ┌──────────────────────────────────────────────┐
 *     │  與 ChatGPT 一起工作                           │
 *     │  ＋  代我核准        ⚡ 模型 極高 ⌄   🎤  ●    │
 *     └──────────────────────────────────────────────┘
 *       選擇專案   [三個外掛圖示] 外掛程式          🖥
 *
 * **下面那一列在輸入框外面**，不是同一個框裡的東西 —— 截圖上
 * 「選擇專案」那一列跟輸入框是分開的兩塊。這件事有教學意義：
 * 專案是掛在對話上的，跟這一次輸入無關。
 * ══════════════════════════════════════════════════════════════ */

/** composer 上那些可點的位置 */
type Spot = 'slash' | 'perm' | 'power' | 'proj';

/**
 * 熱區的外框。選中是實心色塊；其他熱區維持可點的實心框線，但不搶焦點。
 * **不要用 opacity 壓暗** —— 稽核量的是實際對比，半透明的字會掉到 4.5:1 以下。
 */
function spotSkin(tone: Tone, on: boolean) {
  return on ? TONE_SOLID[tone] : 'border-line text-paper hover:border-muted';
}

/* ══════════════════════════════════════════════════════════════
 * 第 9 頁 — 那一排在哪裡
 * ══════════════════════════════════════════════════════════════ */

interface SpotInfo {
  key: Spot;
  tone: Tone;
  /** 熱區上的字，逐字照截圖 */
  label: string;
  /** 這是什麼 */
  title: string;
  lines: string[];
}

const SPOTS: SpotInfo[] = [
  {
    key: 'slash',
    tone: 'cmd',
    label: '/',
    title: '在輸入框裡打一個斜線',
    lines: [
      '整份清單會跳出來：換模型、調推理強度、看這條對話用掉多少脈絡，都在這裡，不用去翻設定。',
      '打完斜線繼續打字就會篩選，所以不用背 —— 記得有這個入口就好。',
      '清單裡混著三種東西：內建指令、你啟用的技能，還有你自己寫的提示。所以每個人看到的長度都不一樣。',
    ],
  },
  {
    key: 'proj',
    tone: 'proj',
    label: '選擇專案',
    title: '這條對話屬於哪一個專案',
    lines: [
      '專案帶著它自己的檔案與指示。忘了選，這條對話就拿不到那些東西，也不會被收進專案裡。',
      '它在輸入框「外面」那一列 —— 專案是掛在整條對話上的，跟你這一次打了什麼無關。',
      '桌面版有一組快捷鍵直接開這個挑選器：⌘ ⌥ ⇧ O，Windows 是 Ctrl Alt Shift O。',
    ],
  },
  {
    key: 'perm',
    tone: 'safe',
    label: '代我核准',
    title: '它做事之前要不要先問你',
    lines: [
      '三種：一律先問、只在偵測到可能不安全時才問、完全不問。',
      '這一顆決定的是「誰來審」，不是「它能碰多少東西」—— 這是整個 App 上最容易誤會的一顆。',
      '圖示長得像終端機視窗，所以常被當成跟寫程式有關。它管的其實是所有動作，包括開網頁跟改檔案。',
    ],
  },
  {
    key: 'power',
    tone: 'model',
    label: '模型　極高',
    title: '用哪個模型、想多久、送多快',
    lines: [
      '一顆按鈕上其實有三個獨立的設定：模型、推理強度，以及左邊那道閃電代表的「快速」。',
      '閃電亮著代表「快速」正開著。那是一個獨立的開關，跟你選哪一個模型無關。',
      '而且「極高」看起來像最後一格，其實後面還有兩級 —— 預設把它們藏起來了。',
    ],
  },
];

/** 外掛程式那三顆圖示。純裝飾，所以用中性色、靠形狀區分 */
const PLUGIN_SHAPES = ['rounded-sm', 'rounded-full', 'rotate-45 rounded-[2px]'];

/**
 * 第 9 頁。整頁就是一張假的 composer，四個熱區都是實心可點的。
 *
 * 這一頁存在的理由：第 10–14 頁講的東西**全部都在這一列上**。
 */
function ComposerDemo() {
  const [picked, setPicked] = useState<Spot>('slash');
  const current = SPOTS.find((s) => s.key === picked)!;

  const on = (key: Spot) => key === picked;

  return (
    <DemoRoot>
      {/* ── 假的 composer ── */}
      <div className="flex shrink-0 flex-col items-center gap-8 rounded-3xl border border-line bg-ink-soft px-10 py-12">
        <span className="text-[34px] text-paper">我們要處理什麼？</span>

        {/*
         * 輸入框本體。它是最亮的表面（bg-panel）；選中時外框換成實色，
         * 再加一圈 ring 讓它粗到從後排看得見 —— 大框不適合整塊塗實心。
         */}
        <button
          type="button"
          onClick={() => setPicked('slash')}
          className={`flex w-full max-w-[1360px] flex-col gap-7 rounded-3xl border bg-panel px-7 py-7 text-left transition-colors duration-200 ${
            on('slash')
              ? 'border-blue ring-2 ring-blue'
              : 'border-line hover:border-muted'
          }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`font-mono text-[30px] ${
                on('slash') ? 'text-blue' : 'text-faint'
              }`}
            >
              /
            </span>
            <span className="text-[26px] text-faint">與 ChatGPT 一起工作</span>
          </span>

          {/* 輸入框底下那一排 */}
          <span className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line">
              <PlusGlyph tone="net" size={22} />
            </span>

            <span
              onClick={(e) => {
                e.stopPropagation();
                setPicked('perm');
              }}
              className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-4 transition-colors duration-200 ${spotSkin(
                'safe',
                on('perm'),
              )}`}
            >
              <TerminalGlyph tone={on('perm') ? 'inverse' : 'net'} size={22} />
              <span className="text-[21px]">代我核准</span>
            </span>

            <span className="flex-1" />

            <span
              onClick={(e) => {
                e.stopPropagation();
                setPicked('power');
              }}
              className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-4 transition-colors duration-200 ${spotSkin(
                'model',
                on('power'),
              )}`}
            >
              <BoltGlyph tone={on('power') ? 'inverse' : 'net'} size={20} />
              <span className="text-[21px]">模型</span>
              <span
                className={`text-[21px] ${on('power') ? '' : 'text-faint'}`}
              >
                極高
              </span>
              <ChevronGlyph tone={on('power') ? 'inverse' : 'net'} size={20} />
            </span>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line">
              <MicGlyph tone="net" size={22} />
            </span>
            {/* 送出鈕：深色小圓配挖空箭頭，對應真實 App 淺色模式的長相 */}
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper">
              <span className="text-[20px] text-on-accent">↑</span>
            </span>
          </span>
        </button>

        {/* 輸入框外面那一列 */}
        <div className="flex w-full max-w-[1360px] items-center gap-4">
          <button
            type="button"
            onClick={() => setPicked('proj')}
            className={`flex h-12 items-center gap-2.5 rounded-xl border px-4 transition-colors duration-200 ${spotSkin(
              'proj',
              on('proj'),
            )}`}
          >
            <FolderGlyph tone={on('proj') ? 'inverse' : 'net'} size={22} />
            <span className="text-[21px]">選擇專案</span>
          </button>

          <span className="flex items-center gap-2.5">
            {PLUGIN_SHAPES.map((shape) => (
              <span
                key={shape}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft bg-panel"
              >
                <span className={`h-3 w-3 bg-faint ${shape}`} />
              </span>
            ))}
            <span className="text-[21px] text-faint">外掛程式</span>
          </span>

          <span className="flex-1" />
          <span className="flex h-9 w-9 items-center justify-center">
            <ScreenGlyph tone="net" size={26} />
          </span>
        </div>
      </div>

      {/* ── 說明 ── */}
      <div
        className={`flex min-h-0 flex-1 items-center gap-8 rounded-2xl border px-10 ${TONE_CARD[current.tone]}`}
      >
        <GlyphBadge tone={current.tone} size={104}>
          {current.key === 'slash' && <SlashGlyph tone="cmd" size={66} />}
          {current.key === 'proj' && <FolderGlyph tone="proj" size={66} />}
          {current.key === 'perm' && <TerminalGlyph tone="safe" size={66} />}
          {current.key === 'power' && <CubeGlyph tone="model" size={66} />}
        </GlyphBadge>

        <div className="flex min-w-0 flex-col gap-3">
          <span className="flex items-center gap-4">
            <span className={`text-[30px] ${TONE_TEXT[current.tone]}`}>
              {current.title}
            </span>
            <Chip text={current.label} tone={current.tone} mono={false} />
          </span>
          {current.lines.map((line) => (
            <span key={line} className="text-[21px] leading-snug text-muted">
              {line}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint tone={current.tone}>
          四個位置都點點看 —— 接下來五頁講的東西，全部都在這一列上。
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 10 頁 — 打一個斜線就有的八件事
 *
 * ──────────────────────────────────────────────────────────────
 * 這八條是怎麼挑的
 * ──────────────────────────────────────────────────────────────
 * 官方參考頁共 24 條，實機截圖看得到 10 條（有捲軸）。這裡挑的是
 * **最該學會的八條**，不是截圖上那十條的複製。差別有三處：
 *
 *   加進來    規劃模式 /plan、壓縮脈絡 /compact、審查 /review、側邊對話 /side
 *   拿掉      使用量與帳單、回饋、在專案中工作（專案有自己的一頁）、
 *             快速 /fast（第 14 頁整頁在講它，這裡再列一次是重複）
 *
 * 「使用量與帳單」特別說明：它真的在實機畫面上，但**官方 24 條的表格裡
 * 沒有這一列**，changelog 與設定頁文件掃過 /usage、/billing 也全部沒命中。
 * 投影片上標一個查不到出處的指令名，是把風險轉嫁給台下，所以不放。
 *
 * 八條排成三組，主線是**脈絡是有限資源**：「狀態→壓縮→側邊對話」
 * 這一組放最前面；剩下兩組才是任務與雜項。
 *
 * ──────────────────────────────────────────────────────────────
 * 整欄同色，靠形狀分辨
 * ──────────────────────────────────────────────────────────────
 * 八列的圖示全部是 cmd（blue），所以形狀必須一眼分得出來。
 * 分組資訊放在右邊的詳情面板，不在左邊做分隔列 —— 八列已經把
 * 684px 的主區用滿了，再插三條分隔列會溢出。
 * ══════════════════════════════════════════════════════════════ */

type CmdKey =
  | 'status'
  | 'compact'
  | 'side'
  | 'plan'
  | 'goal'
  | 'review'
  | 'pet'
  | 'mcp';

interface CmdInfo {
  key: CmdKey;
  /** 畫面上的中文名。截圖看得到的逐字照抄，其餘是我們的中譯 */
  name: string;
  /** 官方英文指令名。這個是穩定的，中文名不一定 */
  slug: string;
  /** 一行說明，放在右邊標題下。截圖看得到的逐字照抄，其餘是我們的中譯 */
  brief: string;
  /**
   * 官方參考頁上的英文原文，逐字。
   *
   * 放它有兩個理由：一是官方沒有 zh-Hant 文件，中文名只有截圖上那幾條可信，
   * 英文才是台下回去搜得到的字；二是它把右側面板撐成三段
   * （是什麼 → 什麼時候用 → 官方怎麼寫），面板不會空一大塊。
   */
  official: string;
  group: string;
  /** 什麼時候真的會用它 */
  when: string[];
  /**
   * 一段真的寫出來的例子。目前只有「目標」有。
   *
   * 那一條光講「目標文字同時是第一句提示，也是驗收標準」很抽象 ——
   * 要看到一段目標長什麼樣、哪一半是驗收標準，才講得完。
   * 例子本身取自官方長時間工作文件裡自己舉的那一個。
   */
  example?: { goal: string; done: string };
  glyph: ReactNode;
}

const COMMANDS: CmdInfo[] = [
  {
    key: 'status',
    name: '狀態',
    slug: '/status',
    brief: '顯示對話 ID、脈絡用量和速率限制',
    group: '脈絡是有限資源',
    official: 'Show the chat ID, context usage, and rate limits.',
    when: [
      '覺得它開始忘記前面講過的事，先來這裡看這一條對話的脈絡用掉多少。脈絡就是它同時記得住的內容，**有上限**。',
      '注意它跟「使用量與帳單」不一樣：這裡看的是**這一條對話**，帳單看的是整個帳號的累計。想知道這場對話還能講多久，答案在這裡。',
    ],
    glyph: <GaugeGlyph tone="cmd" size={30} />,
  },
  {
    key: 'compact',
    name: '壓縮脈絡',
    slug: '/compact',
    brief: '把目前這條對話的脈絡壓縮起來',
    group: '脈絡是有限資源',
    official: "Compact the current chat's context.",
    when: [
      '狀態顯示快滿了，但你不想開一條新對話重講一次背景。',
      '它是留重點、丟細節，不是清空。跟狀態是一組：**先量，再壓**。',
    ],
    glyph: <CompressGlyph tone="cmd" size={30} />,
  },
  {
    key: 'side',
    name: '側邊對話',
    slug: '/side',
    brief: '開一條臨時的側邊對話，不打斷主對話',
    group: '脈絡是有限資源',
    official: 'Start a temporary side chat without interrupting the main chat.',
    when: [
      '它正在跑一件長工作，你想問「它現在到底在做什麼」。',
      '直接在主對話問，這些來回會留在脈絡裡佔位子；開側邊問就不會。這是三條裡最少人知道的一條。',
    ],
    glyph: <BranchGlyph tone="cmd" size={30} />,
  },
  {
    key: 'plan',
    name: '規劃模式',
    slug: '/plan',
    brief: '切換規劃模式，適合多步驟的規劃',
    group: '先把任務講清楚',
    official: 'Toggle plan mode for multi-step planning.',
    when: [
      '任務自己都還講不清楚的時候先開它，讓它反過來問你，把限制條件問出來。',
      '一個限制要先知道：**它正在做事的時候切不過去**，要在開工前切。',
    ],
    glyph: <RouteGlyph tone="cmd" size={30} />,
  },
  {
    key: 'goal',
    name: '目標',
    slug: '/goal',
    brief: '設定一個要它持續追求的目標',
    group: '先把任務講清楚',
    official:
      'Set a persistent goal for ChatGPT to work toward; use /plan first to shape it.',
    when: [
      '官方寫得很明白：先用規劃模式談清楚，再設成目標。目標那段文字**同時是第一句提示，也是驗收標準**。',
      '**設目標不等於放權限** —— 沙盒與核准方式都不變，需要你決定的時候它還是會停下來。',
    ],
    example: {
      goal: '把這個專案從 JavaScript 換成 TypeScript。',
      done: '現有行為不能變、用嚴格模式編譯、不要出現 any、而且整套測試都要通過。',
    },
    glyph: <TargetGlyph tone="cmd" size={30} />,
  },
  {
    key: 'review',
    name: '審查',
    slug: '/review',
    brief: '進入審查模式，檢查還沒送出的修改',
    group: '先把任務講清楚',
    official:
      'Start code review mode to review uncommitted changes or compare against a base branch.',
    when: [
      '它剛替你改完一批檔案，你收下之前。',
      '重點是**換一個角色再看一次**：同一個模型換成審查者的姿態，比你直接追問「這樣對嗎」有用。',
    ],
    glyph: <ReviewGlyph tone="cmd" size={30} />,
  },
  {
    key: 'pet',
    name: '寵物',
    slug: '/pet',
    brief: '喚醒或收起桌面寵物',
    group: '你可能沒發現',
    official: 'Wake or tuck away the desktop pet.',
    when: [
      '這不是彩蛋。官方把它寫在「長時間工作」那一節：長任務跑著、你切去做別的事，寵物是不用切回視窗就看得到的狀態指示。',
      '上台前記得先收起來。',
    ],
    glyph: <PetGlyph tone="cmd" size={30} />,
  },
  {
    key: 'mcp',
    name: 'MCP',
    slug: '/mcp',
    brief: '顯示 MCP 伺服器狀態，看接上了哪些',
    group: '你可能沒發現',
    official: 'Open MCP status to view connected servers.',
    when: [
      '它說「我沒有這個工具」的時候，先來這裡確認外接的工具到底連上了沒有，再回頭懷疑自己的提示詞寫錯。',
      '順序反過來會浪費很多時間。這裡不用先懂 MCP 是什麼，只要記住這個**先驗環境、再改輸入**的順序。',
    ],
    glyph: <PlugGlyph tone="cmd" size={30} />,
  },
];

function SlashDemo() {
  const [picked, setPicked] = useState<CmdKey>('status');
  const current = COMMANDS.find((c) => c.key === picked)!;

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：八條指令 ── */}
        <div className="flex w-[540px] shrink-0 flex-col gap-2.5">
          {COMMANDS.map((c) => {
            const on = c.key === picked;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setPicked(c.key)}
                className={`flex min-h-0 flex-1 items-center gap-4 rounded-2xl border px-5 text-left transition-colors duration-200 ${
                  on ? TONE_CARD['cmd'] : CARD_OFF
                }`}
              >
                <span className="shrink-0">{c.glyph}</span>
                <span
                  className={`w-[112px] shrink-0 text-[24px] ${
                    on ? 'text-blue' : 'text-paper'
                  }`}
                >
                  {c.name}
                </span>
                <span className="font-mono text-[19px] text-faint">
                  {c.slug}
                </span>
              </button>
            );
          })}
        </div>

        {/*
         * ── 右：這一條是什麼、什麼時候用 ──
         *
         * `gap-5` 不是 `gap-6`：「目標」那一條多掛一個範例區塊，五個子元素
         * 四道 24px 的間距會讓中間的 `justify-center` 區塊**往上**溢出約 3px。
         * 那個方向 `scrollHeight` 量不到（它從 padding box 上緣往下算）。
         */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 rounded-2xl border border-line bg-panel-lift p-10">
          {/*
           * 分組標籤放在標題列的右邊，不是面板底部 —— 底部那個位置會被
           * 中間的 `flex-1` 推到最下面，兩行說明與它之間空出一大塊。
           */}
          <div className="flex shrink-0 items-center gap-5">
            <GlyphBadge tone="cmd" size={92}>
              <span className="scale-[1.9]">{current.glyph}</span>
            </GlyphBadge>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="flex items-baseline gap-4">
                <span className="text-[36px] text-paper">{current.name}</span>
                <span className="font-mono text-[24px] text-blue">
                  {current.slug}
                </span>
              </span>
              <span className="text-[21px] leading-snug text-muted">
                {current.brief}
              </span>
            </div>
            <span className="ml-auto flex shrink-0 items-center gap-3 self-start rounded-full border border-blue/55 bg-panel px-4 py-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT['cmd']}`} />
              <span className="text-[18px] text-blue">{current.group}</span>
            </span>
          </div>

          <div className="h-px shrink-0 bg-line" />

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            <span className={LABEL_FAINT}>什麼時候真的會用它</span>
            {current.when.map((line) => (
              <span key={line} className="text-[24px] leading-relaxed text-paper">
                {markup(line, 'cmd')}
              </span>
            ))}
          </div>

          {/*
           * 目標那一條專屬的例子。拆成「要做的事」與「做完的標準」兩列，
           * 是因為官方對一個好目標的要求就是這兩段都要寫齊 ——
           * 只寫前半，它不知道什麼時候算做完。
           */}
          {current.example && (
            <div
              className={`flex shrink-0 flex-col gap-3 rounded-xl border px-6 py-4 ${TONE_CARD['cmd']}`}
            >
              <span className={LABEL_FAINT}>一段目標實際長這樣</span>
              <span className="flex items-baseline gap-4">
                <span className="w-[104px] shrink-0 text-[19px] text-faint">
                  要做的事
                </span>
                <span className="text-[21px] leading-snug text-paper">
                  {current.example.goal}
                </span>
              </span>
              <span className="flex items-baseline gap-4">
                <span className="w-[104px] shrink-0 text-[19px] text-blue">
                  驗收標準
                </span>
                <span className="text-[21px] leading-snug text-blue">
                  {current.example.done}
                </span>
              </span>
            </div>
          )}

          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-line-soft bg-panel px-6 py-4">
            <span className={LABEL_FAINT}>官方文件上的原文</span>
            <span className="font-mono text-[19px] leading-snug text-muted">
              {current.official}
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint tone="cmd">
          官方的參考頁列了 24 條 —— 你看得到幾條，取決於你的方案與環境。
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 11 頁 — 專案：先確認你在哪一個
 *
 * ──────────────────────────────────────────────────────────────
 * 這一頁不講「它會自動繼承」
 * ──────────────────────────────────────────────────────────────
 * 原始規格寫「預設的情況下，你會在哪個專案開啟新的對話，它就會套用
 * 那個專案的選擇」。**官方文件沒有這樣寫。** 文件只寫「從專案裡開一條
 * 新對話」，沒有描述任何自動繼承規則；而且桌面版有多則仍未修的公開回報：
 * 在 Work 選好專案之後切到 Chat，專案關聯會直接消失。
 *
 * 所以這一頁改成講**怎麼確認** —— 這正好也是規格真正的重點那一句：
 * 「一定要注意在左下角的專案，你選擇的是哪一個」。畫面底部那條 composer
 * 就是為了這句話存在的：選了誰，下面立刻跟著變。
 *
 * 另外補一件真正的「小細節」：**ChatGPT 專案不是你電腦上的資料夾。**
 * 官方逐字寫著它「不提供電腦上某個資料夾的直接存取」；能綁資料夾的是
 * 另一種「本機專案」，而桌面版把兩者混在同一個清單裡顯示。
 *
 * 專案名稱全部是假的。
 * ══════════════════════════════════════════════════════════════ */

interface ProjectInfo {
  key: string;
  name: string;
}

/** 第一列不是專案，是官方的 `/task`：不帶專案開始一條對話 */
const NO_PROJECT = 'none';

const PROJECTS: ProjectInfo[] = [
  { key: NO_PROJECT, name: '不在任何專案裡' },
  { key: 'site', name: '個人網站改版' },
  { key: 'report', name: '季報整理' },
  { key: 'english', name: '英文自學' },
  { key: 'pitch', name: '客戶提案' },
  { key: 'notes', name: '讀書筆記' },
];

/** 一個專案裝的三樣東西 */
const PROJECT_HOLDS = [
  {
    label: '對話',
    text: '這個專案底下的對話全部收在一起，之後回來找得到。',
  },
  {
    label: '檔案',
    text: '你上傳的參考資料。專案裡的每一條對話都看得到它們。',
  },
  {
    label: '專案指示',
    text: '只在這個專案裡生效，而且會蓋掉你的全域自訂指示。',
  },
];

function ProjectDemo() {
  const [picked, setPicked] = useState<string>('site');
  const current = PROJECTS.find((p) => p.key === picked)!;
  const inProject = picked !== NO_PROJECT;

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：專案挑選器 ── */}
        <div className="flex w-[620px] shrink-0 flex-col gap-3 rounded-2xl border border-line bg-panel-lift p-6">
          <div className="flex h-12 shrink-0 items-center gap-3 rounded-xl border border-line-soft bg-panel px-4">
            <SearchGlyph tone="net" size={22} />
            <span className="text-[21px] text-faint">搜尋專案</span>
          </div>

          {PROJECTS.map((p) => {
            const on = p.key === picked;
            const none = p.key === NO_PROJECT;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPicked(p.key)}
                className={`flex min-h-0 flex-1 items-center gap-4 rounded-xl border px-5 text-left transition-colors duration-200 ${
                  on ? TONE_CARD[none ? 'net' : 'proj'] : CARD_OFF_IN_LIFT
                }`}
              >
                {none ? (
                  <DashMark tone="net" size={26} />
                ) : (
                  <FolderGlyph tone={on ? 'proj' : 'net'} size={26} />
                )}
                <span
                  className={`text-[24px] ${
                    on
                      ? none
                        ? 'text-paper'
                        : 'text-violet'
                      : none
                        ? 'text-muted'
                        : 'text-paper'
                  }`}
                >
                  {p.name}
                </span>
                {none && (
                  <span className="ml-auto font-mono text-[18px] text-faint">
                    /task
                  </span>
                )}
              </button>
            );
          })}

          <div className="flex h-12 shrink-0 items-center gap-3 px-5">
            <PlusGlyph tone="net" size={22} />
            <span className="text-[21px] text-muted">新增專案</span>
          </div>
        </div>

        {/* ── 右：專案裝了什麼 ／ 沒選的代價 ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div
            className={`flex min-h-0 flex-1 flex-col gap-5 rounded-2xl border p-8 ${
              inProject ? TONE_CARD['proj'] : TONE_CARD['net']
            }`}
          >
            <span className={LABEL_FAINT}>
              {inProject ? '一個專案裝三樣東西' : '不選專案，你會少掉這些'}
            </span>

            {inProject ? (
              PROJECT_HOLDS.map((h) => (
                <div key={h.label} className="flex min-h-0 flex-1 gap-5">
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT['proj']}`}
                  />
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[25px] text-violet">{h.label}</span>
                    <span className="text-[21px] leading-snug text-muted">
                      {h.text}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className="flex min-h-0 flex-1 flex-col justify-center gap-6">
                <span className="text-[25px] leading-relaxed text-paper">
                  這條對話拿不到專案的檔案與指示，也不會被收進那個專案裡。
                </span>
                <span className="text-[23px] leading-relaxed text-muted">
                  事後把它搬進專案不等於一開始就在裡面 —— 前面那幾輪已經是在
                  <span className="text-paper">沒有專案脈絡</span>
                  的情況下生出來的了。
                </span>
                <span className="text-[21px] leading-snug text-faint">
                  這不是壞事：跟任何專案都無關的問題，本來就該用這個。壞的是
                  <span className="text-muted">以為自己在專案裡，其實不在</span>。
                </span>
              </div>
            )}
          </div>

          {/* 這一塊不隨選擇改變 —— 它是這一頁真正的「小細節」 */}
          <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-line bg-panel px-7 py-5">
            <FolderGlyph tone="net" size={34} />
            <span className="text-[21px] leading-snug text-muted">
              <span className="text-paper">專案不是你電腦上的資料夾。</span>
              {'ChatGPT 專案不提供本機資料夾的存取；能綁資料夾的是另一種「本機專案」，桌面版把兩種放在同一個清單裡。'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 底：composer 那一條，跟著選擇變 ── */}
      <div className="flex h-16 shrink-0 items-center gap-5 rounded-2xl border border-line bg-ink-soft px-6">
        <span className={LABEL_FAINT}>輸入框下面那一列</span>
        <span
          className={`flex h-11 items-center gap-2.5 rounded-xl border px-4 ${
            inProject ? TONE_SOLID['proj'] : 'border-line text-muted'
          }`}
        >
          <FolderGlyph tone={inProject ? 'inverse' : 'net'} size={22} />
          <span className="text-[21px]">
            {inProject ? current.name : '選擇專案'}
          </span>
        </span>
        <Hint tone={inProject ? 'proj' : undefined}>
          {inProject
            ? '這裡就是答案 —— 開始打字之前先看一眼。'
            : '沒有選 —— 而畫面上唯一看得出來的地方，就是這一格。'}
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 12 頁 — 三種核准方式
 *
 * ──────────────────────────────────────────────────────────────
 * 這一頁改掉了原始規格最重要的一句
 * ──────────────────────────────────────────────────────────────
 * 規格寫「針對一些比較危險的操作（比如說刪除），你就必須明確提到
 * 『刪除』才能移除該項目」。**這個機制是錯的**，而且錯得剛好會讓台下
 * 產生一種危險的安全感。查證的結果：
 *
 *   1. 官方 guardian 政策**明文反對關鍵字判讀**：
 *      「Judge authorization by the material semantics, not exact syntax.」
 *   2. 政策還特別寫，範圍小的 `rm -rf` 不該只因為它是 rm -rf 就判高風險
 *      —— 先做唯讀檢查，確認範圍窄的話「usually low or medium」，直接放行。
 *   3. 真正成文的規則是另一個方向：**破壞性動作要有你授權的證據才放行。**
 *      「Assign low or unknown authorization when the scope of destruction
 *      exceeds what was specifically authorized」，結果是
 *      「deny broad destructive actions when there is significant risk of
 *      irreversible damage and no proof of user authorization」，
 *      被擋下之後主代理拿到的指令是「stop and ask the user」。
 *   4. 唯一「必須明確講出來」的成文規則，是**被擋下之後的再授權**，
 *      不是事前 —— 對應 CLI 的 `/approve`。
 *
 * 所以這一頁講的是「它在判斷你有沒有授權這件事」，並照使用者的決定
 * 加註它會出錯：官方自己把「Auto-review can make mistakes」寫在設定頁上，
 * 對齊部落格也寫紅隊「identified cases where Auto-review could be misled」。
 *
 * ──────────────────────────────────────────────────────────────
 * 官方建議與實務傾向並陳
 * ──────────────────────────────────────────────────────────────
 * 官方文件第一句是「For most work, start with Ask for approval」，
 * 而且「代我核准」與「完整存取權」**預設根本不在選單裡**，要先去
 * 設定 › 一般 › 權限 開啟。使用者推薦的是中間那格，理由（逐步核准會麻痺）
 * 也是對的，兩家大廠都往中間走。兩件事都講，不要只講一邊 ——
 * 只講推薦，台下打開 App 只看到一個選項會以為自己的版本不對。
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼預設停在中間那張卡
 * ──────────────────────────────────────────────────────────────
 * 它是實機截圖裡被打勾的那一格、也是這一頁要推薦的答案。
 *
 * 三張卡同時各帶一個色會超過「一頁兩個強調色」，所以沒被選中的卡
 * 圖示退回中性，整頁同一時間只有一個色在說話。
 * ══════════════════════════════════════════════════════════════ */

type ModeKey = 'ask' | 'auto' | 'full';

interface ModeInfo {
  key: ModeKey;
  tone: Tone;
  /** 繁中介面上的字，逐字照截圖 */
  name: string;
  /** 官方英文名 */
  en: string;
  /** 繁中介面上的說明，逐字照截圖 */
  desc: string;
  /** 圖示。給顏色才畫得出來，因為沒被選中的卡要退回中性 */
  glyph: (tone: GlyphTone) => ReactNode;
  /** 這個模式下那件事會怎麼跑 */
  steps: { text: string; tone: Tone; strong?: boolean }[];
  notes: string[];
}

const MODES: ModeInfo[] = [
  {
    key: 'ask',
    tone: 'ask',
    name: '要求核准',
    en: 'Ask for approval',
    desc: '一律先詢問是否要編輯外部檔案及使用網際網路',
    glyph: (tone) => <HandGlyph tone={tone} size={34} />,
    steps: [
      { text: '讀了專案裡的設定檔', tone: 'net' },
      { text: '要連到外部網站下載套件', tone: 'ask', strong: true },
      { text: '停在這裡等你按「允許」', tone: 'ask', strong: true },
    ],
    notes: [
      '**官方建議大多數工作從這裡開始。**它讓 AI 在目前的工作區裡做事，要跨出去之前先停下來。',
      '代價是**按久了會麻痺**。Anthropic 量到 Claude Code 使用者按下同意的比例是 93%，並把「核准疲勞」寫成他們改用自動判斷的理由。',
    ],
  },
  {
    key: 'auto',
    tone: 'safe',
    name: '代我核准',
    en: 'Approve for me',
    desc: '僅對偵測為可能不安全的操作要求核准',
    glyph: (tone) => <TerminalGlyph tone={tone} size={34} />,
    steps: [
      { text: '讀了專案裡的設定檔', tone: 'net' },
      { text: '要連到外部網站下載套件', tone: 'safe' },
      { text: '自動審查：風險低、你授權過 → 放行', tone: 'safe', strong: true },
      { text: '裝好了，沒有打斷你', tone: 'safe', strong: true },
    ],
    notes: [
      '**它不會放寬權限，只是換一個審查者。**沙盒邊界跟「要求核准」一模一樣，差別只在跨界的請求是送給你、還是送給一個審查代理。',
      '它判斷的是**你有沒有授權這件事**：破壞性動作找不到你授權的證據，就擋下來回頭問你。不是靠你講出某個關鍵字。',
      '**它會出錯。**官方自己把「Auto-review can make mistakes」寫在設定頁上，也公開說紅隊騙過它。',
    ],
  },
  {
    key: 'full',
    tone: 'risk',
    name: '完整存取權',
    en: 'Full access',
    desc: '可無限制存取網際網路和您電腦上的任何檔案',
    glyph: (tone) => <AlertShieldGlyph tone={tone} size={34} />,
    steps: [
      { text: '讀了專案裡的設定檔', tone: 'net' },
      { text: '連到外部網站下載套件', tone: 'risk' },
      { text: '也讀得到這個資料夾以外的任何檔案', tone: 'risk', strong: true },
      { text: '全部做完，中間沒有任何一步問過你', tone: 'risk', strong: true },
    ],
    notes: [
      '**沒有沙盒，也沒有核准。**官方文件把這一格標為「不建議」，風險寫的是資料遺失、外洩與非預期行為。',
      '切過去的時候會跳一個確認框，而**框裡直接叫你改選「代我核准」**。',
    ],
  },
];

/** 假對話裡沒有被強調的那幾步：跟強調的那幾步同樣留 6px 左邊，文字才對得齊 */
const STEP_PLAIN =
  'border-l-[6px] border-line-soft border-l-line-soft bg-panel text-muted';

function ApprovalDemo() {
  const [picked, setPicked] = useState<ModeKey>('auto');
  const current = MODES.find((m) => m.key === picked)!;

  return (
    <DemoRoot>
      {/* ── 上：三張卡 ── */}
      <div className="flex h-[168px] shrink-0 gap-5">
        {MODES.map((m) => {
          const on = m.key === picked;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setPicked(m.key)}
              className={`flex flex-1 flex-col justify-center gap-2.5 rounded-2xl border px-7 text-left transition-colors duration-200 ${
                on ? TONE_CARD[m.tone] : CARD_OFF
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="shrink-0">{m.glyph(on ? m.tone : 'net')}</span>
                <span
                  className={`text-[28px] ${on ? TONE_TEXT[m.tone] : 'text-paper'}`}
                >
                  {m.name}
                </span>
                {on && <CheckMark tone={m.tone} size={26} />}
                <span className="ml-auto font-mono text-[17px] text-faint">
                  {m.en}
                </span>
              </span>
              <span className="text-[19px] leading-snug text-muted">
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 下：同一句話，三種結局 ── */}
      <div className="flex min-h-0 flex-1 gap-6">
        {/* 假對話 */}
        <div className="flex min-h-0 w-[720px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
          <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line px-6">
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className={`ml-3 ${LABEL_FAINT}`}>同一句話</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
            <div className="flex shrink-0 justify-end">
              <span className="rounded-2xl rounded-br-md border border-line bg-panel px-5 py-3 text-[22px] text-paper">
                幫我把這個專案需要的套件裝起來
              </span>
            </div>

            {current.steps.map((s, i) => (
              <div key={s.text} className="flex min-h-0 flex-1 items-center gap-4">
                <span className={`${LABEL_FAINT} w-9 shrink-0`}>
                  {pad2(i + 1)}
                </span>
                <span
                  className={`flex min-w-0 flex-1 items-center rounded-xl border px-5 py-3 text-[22px] leading-snug ${
                    s.strong
                      ? `${TONE_CARD[s.tone]} ${TONE_TEXT[s.tone]}`
                      : STEP_PLAIN
                  }`}
                >
                  {s.text}
                </span>
              </div>
            ))}

            {/* 只有「要求核准」會停在一個真的詢問框上 */}
            {picked === 'ask' && (
              <div className="flex h-[60px] shrink-0 items-center gap-4 rounded-xl border border-l-[6px] border-amber/55 border-l-amber bg-panel px-5">
                <span className="text-[21px] text-amber">要允許這次連線嗎？</span>
                <span className="ml-auto flex gap-3">
                  <span
                    className={`rounded-lg border px-4 py-1.5 text-[19px] ${TONE_SOLID['ask']}`}
                  >
                    允許
                  </span>
                  <span className="rounded-lg border border-line px-4 py-1.5 text-[19px] text-muted">
                    拒絕
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/*
         * 注意事項。三種模式的則數不一樣（2 / 3 / 2），所以每一則**不能**
         * 給 flex-1 —— 那會讓兩則的模式把文字撐到面板的頭尾兩端，中間空一大塊。
         * 改成整組置中、固定間距，2 則與 3 則都成立。
         */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-2xl border border-line bg-panel-lift p-8">
          <span className={`shrink-0 ${LABEL_FAINT}`}>選這一格要知道的事</span>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-7">
            {current.notes.map((n) => (
              <div key={n} className="flex shrink-0 items-start gap-4">
                <span
                  className={`mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[current.tone]}`}
                />
                <span className="text-[22px] leading-relaxed text-muted">
                  {markup(n, current.tone)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint tone={current.tone}>
          後面兩格預設不在選單裡 —— 要先去 設定 › 一般 › 權限 把它們打開。
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 13 頁 — 模型清單怎麼讀
 *
 * ──────────────────────────────────────────────────────────────
 * 骨架是規則，型號掛在上面
 * ──────────────────────────────────────────────────────────────
 * 實機截圖裡那八列是某個帳號在那一刻的 rollout：其中一個已於截圖前六天
 * 從 Codex 退役、另一個是截圖前三天才發布的。2026-09-06 使用者決定
 * **把目前的型號套回去**（他會在台上自己說明那是參考）。所以是兩層：
 *
 *   骨架   四個層級與它們的適用情境 —— 全部來自官方對「能力層級」的說明，
 *          跨世代穩定，型號換掉也不用改
 *   貼皮   每張卡下面那一行 `models` —— 2026-09-06 的清單，會過期
 *
 * **會過期的東西全部集中在 `TierInfo.models` 那四行**（加上頁面上方
 * 那段講 GPT-5.5／Mini／Spark 的補充，以及 `預設` 那一條裡
 * GPT-5.4 Mini 的退役日期）。名字換掉的時候只要動這幾處，
 * 四個層級與它們的說明一個字都不用改。
 *
 * 上方那條名字解剖仍然用 `世代` `層級` 兩個佔位符而不是真的型號 ——
 * 它教的是「怎麼讀」，讀的對象就在下面那四張卡上。
 *
 * ──────────────────────────────────────────────────────────────
 * 四張卡的順序＝強度順序
 * ──────────────────────────────────────────────────────────────
 *   01 預設          不在強度軸上（它是「不指定」），放最前面因為它是推薦答案
 *   02 最快最便宜  ┐
 *   03 均衡        ├ 由弱到強，一路遞增
 *   04 旗艦        ┘
 *
 * 底部的 Hint 要跟著講「後面三格由左到右越來越強」——
 * 少了那一句，台下會以為 `預設` 也在同一條軸上、而且是最弱的。
 * ══════════════════════════════════════════════════════════════ */

type TierKey = 'default' | 'balanced' | 'flagship' | 'cheap';

interface TierInfo {
  key: TierKey;
  name: string;
  tag: string;
  /**
   * 2026-09-06 的選單上，落在這一層的型號。
   *
   * 這一份會過期 —— 層級與適用情境都來自官方對能力層級的說明，
   * 那一段跨世代穩定。名字換掉的時候，只要改這一行與檔頭的日期就好。
   */
  models: string;
  lines: string[];
}

const TIERS: TierInfo[] = [
  {
    key: 'default',
    name: '預設',
    tag: '不指定，跟著官方建議走',
    models: 'Default',
    lines: [
      '沒有特別理由的時候，答案就是這個。它會跟著官方目前建議的模型走，你不用追版本。',
      '**釘死一個型號的代價，是被留在已經退役的版本上。**GPT-5.4 Mini 在 2026-08-31 就從 Codex 退役了，但它還留在選單上 —— 選得到不代表還該選。',
      '只有在你有理由撐過版本更迭時才釘死：要重現舊結果、提示詞是針對某個模型調過的、或是有成本上限。',
    ],
  },
  {
    key: 'cheap',
    name: '最快最便宜',
    tag: '你已經知道好答案長什麼樣',
    models: 'GPT-5.6 Luna',
    lines: [
      '抽取、分類、格式轉換、整理成結構化摘要 —— 官方點名的就是這幾種**量產型**的任務。',
      '判準很簡單：**你一眼就能看出對不對的事**，不需要更貴的。',
      '它通常還藏在「進階」裡面，要點開才選得到 —— 這也是它最常被忽略的原因。',
    ],
  },
  {
    key: 'balanced',
    name: '均衡',
    tag: '日常工作的起點',
    models: 'GPT-5.6 Terra',
    lines: [
      '官方對這一層的說法是：需要不錯的推理與工具使用，但**不需要旗艦那種深度**的日常工作。',
      '官方還補了一句可以直接照做的：**以前交給上一代旗艦的事，現在從這一層開始**。',
      '這一層是大多數人**往上多花錢**的那個起點。先在這裡試，不夠再往上，比一開始就頂規省得多。',
    ],
  },
  {
    key: 'flagship',
    name: '旗艦',
    tag: '有歧義、難、高價值的工作',
    models: 'GPT-6 Astra · GPT-5.6 Sol',
    lines: [
      '留給要權衡、要判斷、成果要交出去的事：複雜的修改、深入的研究、要見人的文件。',
      '**同一層裡有兩個。**Astra 是新世代的那一個，強在連續操作、把一整件事從頭做到尾；Sol 是上一個世代的旗艦，深度與打磨仍然夠用。',
      '**範圍窄的任務選了它也幫不上忙。**官方在同一句話裡就補了但書：任務比較單純的時候，先把「做完長什麼樣」定義清楚，比換更貴的模型有效。',
    ],
  },
];

function ModelDemo() {
  const [picked, setPicked] = useState<TierKey>('default');
  const current = TIERS.find((t) => t.key === picked)!;

  return (
    <DemoRoot>
      {/* ── 上：名字怎麼讀 ── */}
      <div className="flex h-[132px] shrink-0 items-center gap-8 rounded-2xl border border-line bg-panel-lift px-8">
        <GlyphBadge tone="model" size={76}>
          <CubeGlyph tone="model" size={44} />
        </GlyphBadge>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[34px] text-faint">GPT-</span>
          <span className="flex flex-col items-center gap-1.5">
            <span className="rounded-xl border border-sky/55 bg-panel px-5 py-1.5 font-mono text-[30px] text-sky">
              世代
            </span>
            <span className={`${LABEL_TYPE} text-sky`}>數字越大越新</span>
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <span className="rounded-xl border border-lime/55 bg-panel px-5 py-1.5 font-mono text-[30px] text-lime">
              層級
            </span>
            <span className={`${LABEL_TYPE} text-lime`}>同一代裡分幾層</span>
          </span>
        </div>

        <span className="ml-auto flex max-w-[760px] items-center gap-5">
          <TiersGlyph tone="net" size={34} />
          <span className="text-[21px] leading-snug text-muted">
            <span className="text-paper">名字會換，層級不會。</span>
            清單上還會留著上一代的旗艦 GPT-5.5，以及 GPT-5.4 Mini、GPT-5.3 Codex
            Spark —— 名字裡的 Mini、Spark 是「快而不強」，不是「小一號的旗艦」。
          </span>
        </span>
      </div>

      {/* ── 中：四個層級 ── */}
      <div className="flex h-[176px] shrink-0 gap-5">
        {TIERS.map((t, i) => {
          const on = t.key === picked;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setPicked(t.key)}
              className={`flex flex-1 flex-col justify-center gap-2 rounded-2xl border px-7 text-left transition-colors duration-200 ${
                on ? TONE_CARD['model'] : CARD_OFF
              }`}
            >
              <span className="flex items-baseline gap-3">
                <span className={LABEL_FAINT}>{pad2(i + 1)}</span>
                <span
                  className={`text-[30px] ${on ? 'text-lime' : 'text-paper'}`}
                >
                  {t.name}
                </span>
              </span>
              <span className="text-[19px] leading-snug text-muted">
                {t.tag}
              </span>
              <span
                className={`font-mono text-[19px] leading-snug ${
                  on ? 'text-lime' : 'text-faint'
                }`}
              >
                {t.models}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 下：什麼時候選它 ── */}
      <div
        className={`flex min-h-0 flex-1 flex-col justify-center gap-6 rounded-2xl border px-10 ${TONE_CARD['model']}`}
      >
        <span className="flex items-center gap-4">
          <span className={LABEL_FAINT}>什麼時候選它</span>
          <span className="h-px flex-1 bg-lime/55" />
        </span>
        {current.lines.map((line) => (
          <span key={line} className="text-[24px] leading-relaxed text-paper">
            {markup(line, 'model')}
          </span>
        ))}
      </div>

      <div className="flex h-11 shrink-0 items-center gap-4">
        <Chip text="2026 年 9 月的清單" tone="net" mono={false} />
        <Hint tone="model">
          名字沒有固定規則，強度才有 —— 後面三格由左到右越來越強。
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 14 頁 — 推理強度與快速是兩回事
 *
 * ──────────────────────────────────────────────────────────────
 * 「極高」不是最高
 * ──────────────────────────────────────────────────────────────
 * 實機截圖的滑桿停在「極高」、而且把手大約在 3/4 的位置 —— 那不是頂點。
 * 官方文件列的是六級：Light（桌面版與 Web 叫「輕度」、CLI 叫 Low）
 * · Medium · High · Extra High · Max · Ultra。後面兩級**預設看不到**，
 * 要去設定裡打開才會出現在滑桿上，這正好解釋為什麼一台原廠設定的機器上
 * 「極高」看起來就是最後一格。
 *
 * Ultra 值得特別講：它不只是「想更久」，它會**開子代理平行拆工作**。
 * Max 才是「同一件事、同一個代理、更多時間」。
 *
 * ──────────────────────────────────────────────────────────────
 * 兩條軸，不是一條
 * ──────────────────────────────────────────────────────────────
 * 「快速」與「推理」在官方的指令表裡是兩條各自獨立的指令，
 * 而且是兩種不同的東西：推理是**想多久**（品質換時間與 token），
 * 快速是**同一份思考送多快**（速度換額度）。文件裡沒有任何一句把兩者綁在一起。
 *
 * 所以這一頁的畫面是左右兩塊 —— 版面本身就在說「這是兩件事」。
 * 預設狀態刻意設成第 9 頁 composer 上的那一組（極高 ＋ 快速開著）。
 *
 * 一頁兩個強調色：推理 sky、快速 acid。來源把「2.5× 額度消耗」塗成 coral，
 * 那是第三個色，這裡改成 paper —— 數字本身夠大，不靠顏色也看得出是代價。
 * ══════════════════════════════════════════════════════════════ */

interface LevelInfo {
  name: string;
  /** 預設看不到，要去設定裡開 */
  hidden?: boolean;
  text: string;
  /** 具體的例子。少了它，這一格會變成一行字浮在一大片空白裡 */
  example: string;
}

const LEVELS: LevelInfo[] = [
  {
    name: '輕度',
    text: '範圍明確、講清楚就能做的事。回得最快也最省，代價是**想得少、錯的機會也最高** —— 所以任務本身要夠明確，不能讓它自己猜。',
    example: '改錯字、換一個講法、把一段話整理成條列。',
  },
  {
    name: '中',
    text: '需要多一點規劃的任務，速度與深度的平衡點，也是官方的預設值。比輕度穩，但**碰到有歧義的題目還是會出錯**。',
    example: '整理一份會議紀錄、把散落的資料排成表格、一般的修改。',
  },
  {
    name: '高',
    text: '多步驟、多來源、要權衡的難事。從這一級開始明顯變慢，也明顯多花 token。',
    example: '比較三個做法再選一個、追一個看不出原因的問題。',
  },
  {
    name: '極高',
    text: '同一類難事再上一級，適合長時間、你不在旁邊看著的工作。第 9 頁那一排停的就是這一級 —— **但它不是最高的**。',
    example: '一份要交出去的長文件、要跑很久的研究。',
  },
  {
    name: 'Max',
    hidden: true,
    text: '同一件難事給它更多時間想，還是**單一個代理**在做。',
    example: '一個卡了很久、但難點只有一個的問題。',
  },
  {
    name: 'Ultra',
    hidden: true,
    text: '會**開子代理把一件大事拆開平行做**。只有在工作真的切得開的時候才選它。',
    example: '一件可以切成好幾塊、彼此不太相干的大工程。',
  },
];

function EffortDemo() {
  const [level, setLevel] = useState(3);
  const [fast, setFast] = useState(true);
  const current = LEVELS[level];

  return (
    <DemoRoot>
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── 左：推理強度 ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-2xl border border-line bg-panel-lift p-8">
          <div className="flex shrink-0 items-center gap-4">
            <ThinkGlyph tone="think" size={34} />
            <span className="text-[30px] text-sky">推理</span>
            <span className="text-[21px] text-muted">想多久</span>
            <span className="ml-auto font-mono text-[19px] text-faint">
              /reasoning
            </span>
          </div>

          {/* 六個停靠點。選中的是實心色塊，沒選中的是疊在 panel-lift 上的 panel */}
          <div className="flex h-[76px] shrink-0 items-stretch gap-2">
            {LEVELS.map((l, i) => {
              const on = i === level;
              return (
                <button
                  key={l.name}
                  type="button"
                  onClick={() => setLevel(i)}
                  className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors duration-200 ${
                    on
                      ? TONE_SOLID['think']
                      : 'border-line-soft bg-panel hover:border-line'
                  }`}
                >
                  <span className={`text-[22px] ${on ? '' : 'text-paper'}`}>
                    {l.name}
                  </span>
                  {l.hidden && (
                    <span
                      className={`text-[15px] ${on ? '' : 'text-faint'}`}
                    >
                      要先開啟
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 軌道：把「極高不是最後一格」畫出來 */}
          <div className="flex h-2 shrink-0 items-center gap-2">
            {LEVELS.map((l, i) => (
              <span
                key={l.name}
                className={`h-2 flex-1 rounded-full ${
                  i <= level ? TONE_DOT['think'] : 'bg-line'
                }`}
              />
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            <span className="text-[24px] leading-relaxed text-paper">
              {markup(current.text, 'think')}
            </span>
            <span className="flex items-baseline gap-4">
              <span className={`${LABEL_TYPE} shrink-0 text-sky`}>例</span>
              <span className="text-[22px] leading-relaxed text-muted">
                {current.example}
              </span>
            </span>
            {current.hidden && (
              <span className="text-[20px] leading-snug text-faint">
                預設的滑桿上看不到這一級 —— 要先去設定裡把它打開。
              </span>
            )}
          </div>

          {/*
           * 官方原則放在面板底部，跟第 10 頁的「官方文件上的原文」同一個位置、
           * 同一種殼。這一頁的兩塊面板本來各有一大片空白，
           * 而那種空白稽核不會報 —— 只有截圖看得出來。
           */}
          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-line-soft bg-panel px-6 py-4">
            <span className={LABEL_FAINT}>官方的原則</span>
            <span className="text-[21px] leading-snug text-muted">
              請使用<span className="text-sky">能產生所需結果的最低推理強度</span>
              {'。而且大部分任務不需要走到 Max 或 Ultra。'}
            </span>
          </div>
        </div>

        {/* ── 右：快速 ── */}
        <div className="flex min-h-0 w-[620px] shrink-0 flex-col gap-6 rounded-2xl border border-line bg-panel-lift p-8">
          <div className="flex shrink-0 items-center gap-4">
            <BoltGlyph tone="fast" size={34} />
            <span className="text-[30px] text-acid">快速</span>
            <span className="text-[21px] text-muted">送多快</span>
            <span className="ml-auto font-mono text-[19px] text-faint">
              /fast
            </span>
          </div>

          {/* 開關 */}
          <button
            type="button"
            onClick={() => setFast((v) => !v)}
            className={`flex h-[76px] shrink-0 items-center gap-5 rounded-xl border px-6 transition-colors duration-200 ${
              fast ? TONE_CARD['fast'] : CARD_OFF_IN_LIFT
            }`}
          >
            <span
              className={`flex h-9 w-16 shrink-0 items-center rounded-full border px-1 ${
                fast ? 'justify-end border-acid bg-acid/20' : 'border-line bg-panel'
              }`}
            >
              <span
                className={`h-7 w-7 rounded-full ${
                  fast ? TONE_DOT['fast'] : 'bg-faint'
                }`}
              />
            </span>
            <span
              className={`text-[26px] ${fast ? 'text-acid' : 'text-muted'}`}
            >
              {fast ? '開著' : '關閉（標準速度）'}
            </span>
          </button>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            {fast ? (
              <>
                <div className="flex items-center gap-5">
                  <span className="font-display text-[44px] text-acid">
                    1.5×
                  </span>
                  <span className="text-[22px] leading-snug text-muted">
                    速度。同一個模型，不是換成比較笨的那一個。
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-display text-[44px] text-paper">
                    2.5×
                  </span>
                  <span className="text-[22px] leading-snug text-muted">
                    額度消耗。你方案裡包含的用量也跟著燒得比較快。
                  </span>
                </div>
                <span className="text-[21px] leading-snug text-paper">
                  在旁邊等的短迭代可以開；沒人看著的長工作不要開。
                </span>
              </>
            ) : (
              <span className="text-[24px] leading-relaxed text-paper">
                標準速度。同樣的模型、同樣的推理強度，只是排隊排得慢一點 ——
                <span className="text-muted">
                  沒人看著的長工作本來就該待在這裡。
                </span>
              </span>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-line-soft bg-panel px-6 py-4">
            <span className={LABEL_FAINT}>官方文件的標題就這樣寫</span>
            <span className="font-mono text-[19px] leading-snug text-muted">
              Increase speed without sacrificing intelligence.
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center gap-4">
        <Chip text={`推理 ${current.name}`} tone="think" mono={false} />
        <Chip
          text={fast ? '快速 開' : '快速 關'}
          tone={fast ? 'fast' : 'net'}
          mono={false}
        />
        <Hint>
          兩條互不相干的軸：
          <span className="text-sky">推理</span>
          決定它想多久，
          <span className="text-acid">快速</span>
          只決定同一份思考送多快。
        </Hint>
      </div>
    </DemoRoot>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 內容來源與六處修正（2026-09-06 查證，這一段是會過期的題目）
 *
 * 規格是 Notion「ChatGPT Desktop 你沒注意到的小細節」的五個 callout
 * 加五張實機截圖。開工前逐條查過官方文件：learn.chatgpt.com 的
 * slash-commands / models / agent-approvals-security / long-running-work、
 * developers.openai.com/codex/models、以及 alignment.openai.com 那篇 Auto-review。
 * **不要把下面改過的說法改回去。**
 *
 * 1. 「刪除要明講」那句是錯的 → 第 12 頁改成「破壞性動作要有你授權的證據才放行」。
 * 2. 加註「它會出錯」（官方設定頁與對齊部落格都寫了）→ 第 12 頁。
 * 3. 官方建議（先從要求核准開始）與實務傾向（代我核准）並陳 → 第 12 頁。
 * 4. 「預設沿用你開啟對話時的專案」官方沒有這樣寫 → 第 11 頁改講「怎麼確認」。
 * 5. 模型頁的骨架是規則，型號掛在上面，會過期的只有 `TierInfo.models` → 第 13 頁。
 * 6. 「極高」不是最高，後面還有 Max、Ultra，Ultra 會開子代理 → 第 14 頁。
 *
 * 另外兩處查證後值得放的「小細節」：
 *   · 「狀態」（這一條對話）與「使用量與帳單」（整個帳號）不是近似重複 → 第 10 頁。
 *   · ChatGPT 專案不是你電腦上的資料夾，能綁資料夾的是「本機專案」→ 第 11 頁。
 * ══════════════════════════════════════════════════════════════ */

export {
  ApprovalDemo,
  ComposerDemo,
  EffortDemo,
  ModelDemo,
  ProjectDemo,
  SlashDemo,
};
