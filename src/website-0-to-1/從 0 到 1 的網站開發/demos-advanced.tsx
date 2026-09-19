import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 第三章後段 · 進階網站（第 32、33、35 頁）
 *
 *   第 32 頁  VueConceptsDemo      進階網站會遇到的三個概念（改編移植）
 *   第 33 頁  AdvancedPromptDemo   進階網站的提示詞（新寫）
 *   第 35 頁  FamilyLedgerDemo     實作：家庭記帳工具（新寫）
 *
 * 三頁講的是同一件事的三個角度：Vue、元件、路由這三個詞長什麼樣 →
 * 把它們寫成一份交給 AI 的規範 → 拿那份規範真的做一個家庭記帳工具。
 * 所以第 33 頁的 14 條規範與第 35 頁摺疊卡裡的 14 條是**同一份資料**
 * （下方的 `RULES`），改一邊另一邊跟著走。
 *
 * 三頁的殼刻意不同：
 *   第 32 頁  左三張概念卡 ＋ 右概念圖與程式碼井
 *   第 33 頁  左提示詞視窗（逐行）＋ 右四個分組與「為什麼要寫」
 *   第 35 頁  左開工前清單 ＋ 右兩個步驟分頁的提示詞視窗
 *
 * ──────────────────────────────────────────────────────────────
 * 第 32 頁的來源與改編
 * ──────────────────────────────────────────────────────────────
 * 來源是另一個專案 Vite 那一份的 ConceptsDemo（五個概念：框架、元件、
 * 路由、套件、.env）。Notion 指定只留 Vue、元件、路由，改編如下：
 *   - 第一項名稱改成「Vue」，不再寫「React、Vue」。
 *   - 例子全部換成第 35 頁的家庭記帳：一筆收支（成員、項目、金額）、
 *     一張記帳卡片用三次、三個 hash 網址。
 *   - 路由用 hash 模式（這堂課的提示詞規定 createWebHashHistory），
 *     網址長得像 `…chatgpt.site/#/records`。
 *   - 元件標籤用 kebab-case 並寫完整的結束標籤（`<record-card …></record-card>`）：
 *     瀏覽器直接執行的 Vue 如果把樣板寫在 HTML 裡，自訂標籤不能自閉合、
 *     也不分大小寫，這個寫法在兩種樣板都成立。
 *   - 這堂課不使用 Node.js 與建置工具，所以整頁沒有 Vite、npm、套件、.env。
 *   - 五項變三項，左欄三張卡平均撐滿高度。
 *   - 框架那一格多了一顆「改一下金額」：資料一改、畫面跟著變，
 *     這一句話讓台下自己按出來，比讀出來有說服力。
 *
 * ──────────────────────────────────────────────────────────────
 * 深色 → 亮色
 * ──────────────────────────────────────────────────────────────
 * 來源是深色主題，同名 token 明暗相反。實心色塊上的字從 `text-ink` 改成
 * `text-on-accent`；淡底 `/8`、`/12` 上調到 `/14`；邊框 `/40`～`/45` 上調到 `/55`。
 * 選中的卡片除了淡底，一律再配不透明的訊號（實色邊框 ＋ 6px 左粗條 ＋
 * 實心序號徽章），淡色填色不單獨承擔「選中」的語意。
 *
 * 每頁的強調色不超過兩支：
 *   第 32 頁  violet（Vue 與元件，都是框架給的寫法）＋ teal（路由）
 *   第 33 頁  acid（目前這一組）＋ teal（寫了之後、已複製）
 *   第 35 頁  acid（目前步驟、要替換的佔位字）＋ teal（已備妥、已複製）
 *
 * ──────────────────────────────────────────────────────────────
 * 不宣稱官方限制
 * ──────────────────────────────────────────────────────────────
 * ChatGPT Sites 官方文件沒有點名支援或不支援 Vue 的瀏覽器版本，也沒有列出
 * 框架清單。第 33 頁「為什麼要寫」的理由全部是「對 AI 講清楚會省掉什麼麻煩」，
 * 沒有任何一句寫成「ChatGPT Sites 只能這樣」。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description 也沒有 caption，demo 面板可用約 1742 × 766。
 *   第 32 頁  沿用來源的 `h-full max-h-[748px]`、`max-w-[1760px]`
 *   第 33、35 頁  `h-[720px]`、`max-w-[1740px]`
 * 沒有任何容器可以捲動；未輪到的內容一律不掛（`{cond && …}`）。
 * 第 35 頁第 ② 步的 14 條規範放不下與開發目標同時展開，所以兩段是
 * 互斥的摺疊：展開規範時，開發目標收成一列。複製鍵永遠複製完整全文。
 *
 * 浮水印在對外版固定在右上角（舞台 y 104–144）。面板內容從 y≈161 開始，
 * 三頁的右上角都沒有放按鈕，複製鍵都在視窗標題列裡。
 * ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * 共用詞彙（從來源複製後轉亮色，只留這三頁用得到的）
 * ══════════════════════════════════════════════════════════════ */

/**
 * 第 32 頁的顏色契約。
 *   src   violet  Vue 與元件 —— 都是「框架給你的寫法」，同一家
 *   dist  teal    路由 —— 講的是上線之後那個網站長什麼樣
 *   net   faint   箭頭、沒選中的圖示
 */
type Tone = 'src' | 'dist' | 'net';

/** SVG 用的 CSS 變數。DOM 那邊用下面的 Tailwind class，兩套不要混 */
const TONE_VAR: Record<Tone, string> = {
  src: 'var(--color-violet)',
  dist: 'var(--color-teal)',
  net: 'var(--color-faint)',
};

/** 選中的大卡：實色框、淡底、字。淡底不單獨承擔語意（另有左粗條與實心徽章） */
const TONE_ON: Record<Tone, string> = {
  src: 'border-violet bg-violet/14 text-violet',
  dist: 'border-teal bg-teal/14 text-teal',
  net: 'border-line bg-panel-lift text-paper',
};

/** 實心藥丸 / 序號徽章。實心色塊上的字一律 text-on-accent */
const TONE_PILL: Record<Tone, string> = {
  src: 'border-violet bg-violet text-on-accent',
  dist: 'border-teal bg-teal text-on-accent',
  net: 'border-muted bg-muted text-on-accent',
};

/** 只要框線 ＋ 淡底的容器 */
const TONE_CARD: Record<Tone, string> = {
  src: 'border-violet/55 bg-violet/14',
  dist: 'border-teal/55 bg-teal/14',
  net: 'border-line bg-panel-lift',
};

/** 圖示外圈那一層淡光暈。只負責把圖示撐開，不承擔辨識 */
const TONE_HALO: Record<Tone, string> = {
  src: 'bg-violet/20',
  dist: 'bg-teal/20',
  net: 'bg-muted/14',
};

/** 面板小標籤的字體規格。顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 最常見的那一種：次要色的小標籤 */
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

/**
 * 不轉大寫的小標。**標籤裡出現真實檔名、元件名或程式碼的時候一定要用這個。**
 * `uppercase` 會把 `record-card` 印成 `RECORD-CARD`，大寫只發生在 CSS，
 * 稽核讀 `textContent` 看不到。
 */
const LABEL_EXACT_TYPE = 'font-display text-[17px] tracking-[0.12em]';

/** 上面那個的次要色版本 */
const LABEL_EXACT = `${LABEL_EXACT_TYPE} text-faint`;

/** 沒被選中的大卡 */
const CARD_OFF = 'border-line-soft bg-panel-lift hover:border-line';

/** 控制列那一排按鈕的共同尺寸 */
const BTN_ROW =
  'h-11 rounded-xl border px-5 text-[19px] transition-colors duration-200';

/** 序號徽章 */
const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

/** 01 / 02 / 03 … */
function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 線稿圖示（從來源的 diagrams.tsx 搬過來）──────────────── */

/*
 * viewBox 96×96、strokeWidth 5、fill none。**沒有 `<text>`**：
 * SVG 縮放之後字級會掉到 16 以下，文字一律交給 DOM。
 */

interface GlyphProps {
  tone?: Tone;
  size?: number;
}

function Glyph({
  tone = 'net',
  size = 48,
  children,
}: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      fill="none"
      stroke={TONE_VAR[tone]}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 左邊一個資料方塊、右邊一個畫面方塊，中間一條線接起來 */
function BindGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="8" y="26" width="30" height="44" rx="5" />
      <rect x="58" y="26" width="30" height="44" rx="5" />
      <path d="M38 48h20" />
      <path d="M16 40h14M16 52h10" />
      <path d="M66 40h14M66 52h14M66 62h8" />
    </Glyph>
  );
}

/** 一個方塊被複製成四個。元件 */
function BlocksGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="10" y="10" width="34" height="34" rx="5" />
      <rect x="52" y="10" width="34" height="34" rx="5" />
      <rect x="10" y="52" width="34" height="34" rx="5" />
      <rect x="52" y="52" width="34" height="34" rx="5" />
    </Glyph>
  );
}

/** 一條線分岔成三條。路由 */
function RouteGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="18" cy="48" r="9" />
      <path d="M27 48h17" />
      <path d="M44 48V20h12M44 48h12M44 48v28h12" />
      <circle cx="66" cy="20" r="9" />
      <circle cx="66" cy="48" r="9" />
      <circle cx="66" cy="76" r="9" />
    </Glyph>
  );
}

/** 向右的箭頭 */
function ArrowRight({ tone = 'net', size = 32 }: GlyphProps) {
  return (
    <Glyph tone={tone} size={size}>
      <path d="M14 48h68" />
      <path d="M60 26l22 22-22 22" />
    </Glyph>
  );
}

/** 向下的箭頭 */
function ArrowDown({ tone = 'net', size = 32 }: GlyphProps) {
  return (
    <Glyph tone={tone} size={size}>
      <path d="M48 14v68" />
      <path d="M26 60l22 22 22-22" />
    </Glyph>
  );
}

/** 勾選框裡的勾。畫在實心 teal 上，所以筆畫用挖空字色 */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 96 96"
      width={22}
      height={22}
      fill="none"
      stroke="var(--color-on-accent)"
      strokeWidth={11}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 50l22 22 42-46" />
    </svg>
  );
}

/* ── GlyphBadge ─────────────────────────────────────────── */

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

/* ── 行內程式碼 ─────────────────────────────────────────── */

/**
 * 把提示詞裡用反引號包起來的片段畫成等寬字。
 * 畫面上不印反引號；複製出去的全文仍然是原字串，反引號一個都沒少。
 */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded-md bg-panel px-1.5 font-mono text-[0.9em] text-paper"
          >
            {part}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

/* ── 複製 ───────────────────────────────────────────────── */

type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * 先走 `navigator.clipboard`；它在非安全來源、或瀏覽器沒給權限時會 reject，
 * 那時退回暫時插一個 textarea 用 `execCommand('copy')`。兩條都失敗才回報失敗，
 * 畫面上會出現一行「請手動選取」。**一定要接住 reject**，稽核腳本逐顆點按鈕時
 * 沒接住的 promise 會變成 unhandled rejection。
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 往下走退路 */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '-9999px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** 複製狀態過一會兒自己退回 idle，按鈕字才不會一直停在「已複製」 */
function useCopy(): [CopyStatus, (text: string) => void] {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = (text: string) => {
    void copyText(text).then((ok) => setStatus(ok ? 'copied' : 'failed'));
  };

  return [status, copy];
}

function CopyButton({
  status,
  label,
  onClick,
}: {
  status: CopyStatus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BTN_ROW} min-w-[132px] ${
        status === 'copied'
          ? 'border-teal bg-teal font-medium text-on-accent'
          : 'border-line bg-panel text-paper hover:border-acid'
      }`}
    >
      {status === 'copied' ? '已複製' : label}
    </button>
  );
}

function CopyFailed() {
  return (
    <span className="text-[18px] text-paper">
      {'瀏覽器擋下了複製，請手動選取文字'}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 32 頁 · VueConceptsDemo — 進階網站會遇到的三個概念
 * ══════════════════════════════════════════════════════════════ */

type ConceptId = 'vue' | 'component' | 'router';

interface Concept {
  id: ConceptId;
  tone: Tone;
  name: string;
  /** 卡片上那一行小字 */
  sub: string;
  glyph: (props: GlyphProps) => ReactNode;
  /** 底部等寬區塊的標題 */
  footLabel: string;
  /** 底部等寬區塊的內容。每一行一個字串，空白會照原樣保留 */
  foot: readonly string[];
}

const CONCEPTS: readonly Concept[] = [
  {
    id: 'vue',
    tone: 'src',
    name: 'Vue',
    sub: '把資料綁到畫面上',
    glyph: BindGlyph,
    footLabel: '在專案裡長這樣',
    foot: [
      '<span>{{ record.member }}</span>',
      '<span>{{ record.item }}</span>',
      '<span>NT$ {{ record.amount }}</span>',
    ],
  },
  {
    id: 'component',
    tone: 'src',
    name: '元件（Component）',
    sub: '畫面切成一塊一塊，重複使用',
    glyph: BlocksGlyph,
    footLabel: '在專案裡長這樣',
    foot: [
      '<record-card :record="records[0]"></record-card>',
      '<record-card :record="records[1]"></record-card>',
      '<record-card :record="records[2]"></record-card>',
    ],
  },
  {
    id: 'router',
    tone: 'dist',
    name: '路由（Router）',
    sub: '一個網站，好幾個頁面',
    glyph: RouteGlyph,
    footLabel: '在專案裡長這樣 · hash 模式',
    foot: [
      'createRouter({ history: createWebHashHistory(), routes })',
      "{ path: '/',        component: Home }",
      "{ path: '/records', component: Records }",
      "{ path: '/members', component: Members }",
    ],
  },
];

/** 按一下換一個金額，資料與畫面一起變 */
const AMOUNTS = [1280, 960, 1540] as const;

function formatNtd(value: number) {
  return `NT$ ${value.toLocaleString('en-US')}`;
}

/** 資料 → 畫面。Vue 在做的事 */
function FrameworkDiagram() {
  const [turn, setTurn] = useState(0);
  const amount = AMOUNTS[turn % AMOUNTS.length];

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center gap-7 px-2">
      <div className="flex flex-col gap-4">
        <div
          className={`flex flex-col gap-2 rounded-2xl border px-6 py-6 ${TONE_CARD.src}`}
        >
          <span className={`${LABEL_TYPE} text-violet`}>資料</span>
          <span className="font-mono text-[19px] text-paper">
            member: &apos;媽媽&apos;
          </span>
          <span className="font-mono text-[19px] text-paper">
            item: &apos;市場買菜&apos;
          </span>
          <span className="font-mono text-[19px] text-paper">
            amount: <b className="font-medium text-violet">{amount}</b>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setTurn((value) => value + 1)}
          className="h-11 rounded-xl border border-violet/55 bg-panel px-5 text-[19px] text-violet transition-colors duration-200 hover:border-violet hover:bg-violet/14"
        >
          改一下金額
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <BindGlyph tone="src" size={44} />
        <span className="text-[18px] text-muted">綁在一起</span>
      </div>

      <div className="flex w-[300px] flex-col gap-2.5 rounded-2xl border border-line bg-panel px-6 py-6">
        <span className={LABEL_FAINT}>畫面</span>
        <span className="text-[20px] text-muted">媽媽</span>
        <span className="text-[24px] text-paper">市場買菜</span>
        <span className="text-[28px] font-medium text-violet">
          {formatNtd(amount)}
        </span>
        <span className="text-[18px] leading-snug text-muted">
          資料一改，這裡自己跟著變
        </span>
      </div>
    </div>
  );
}

/** 同一張記帳卡片，三份資料 */
const RECORDS: readonly { member: string; item: string; amount: string }[] = [
  { member: '媽媽', item: '市場買菜', amount: 'NT$ 1,280' },
  { member: '爸爸', item: '機車加油', amount: 'NT$ 150' },
  { member: '小明', item: '午餐', amount: 'NT$ 120' },
];

/** 一個定義 → 一整排。元件 */
function ComponentDiagram() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-2">
      <div
        className={`flex w-[360px] flex-col gap-2 rounded-2xl border px-6 py-5 ${TONE_CARD.src}`}
      >
        <div className="flex items-center gap-3">
          <BlocksGlyph tone="src" size={24} />
          <span className={`${LABEL_EXACT_TYPE} text-violet`}>record-card</span>
        </div>
        <span className="text-[20px] leading-snug text-muted">
          寫一次：一張記帳卡片長什麼樣
        </span>
      </div>

      <ArrowDown tone="src" size={30} />

      {/*
        三張卡刻意給三份不同的資料：這一頁要講的正是「換三份資料、版型完全一樣」，
        三張都一樣的話那句話就沒有證據。
      */}
      <div className="flex gap-4">
        {RECORDS.map((record) => (
          <div
            key={record.member}
            className="flex w-[212px] flex-col gap-1.5 rounded-2xl border border-line bg-panel px-5 py-5"
          >
            <span className="text-[18px] text-muted">{record.member}</span>
            <span className="text-[21px] leading-snug text-paper">
              {record.item}
            </span>
            <span className="text-[22px] font-medium text-violet">
              {record.amount}
            </span>
          </div>
        ))}
      </div>

      <span className="text-[20px] text-muted">
        用三次：換三份資料，版型完全一樣
      </span>
    </div>
  );
}

/** 一個網址分岔成三個 hash 頁面 */
const ROUTES: readonly { hash: string; page: string }[] = [
  { hash: '#/', page: '首頁：本月總覽' },
  { hash: '#/records', page: '收支紀錄' },
  { hash: '#/members', page: '家庭成員' },
];

function RouterDiagram() {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-7 px-2">
      <div className="flex items-center gap-7">
        <div className="flex flex-col items-center gap-3">
          <GlyphBadge tone="dist" size={84}>
            <RouteGlyph tone="dist" size={48} />
          </GlyphBadge>
          <span className="text-[19px] text-muted">同一個網站</span>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {ROUTES.map((route) => (
            <div
              key={route.hash}
              className="flex items-center gap-4 rounded-xl border border-line bg-panel px-5 py-4"
            >
              <span className="w-[290px] shrink-0 font-mono text-[19px]">
                <span className="text-faint">…chatgpt.site/</span>
                <span className="font-medium text-teal">{route.hash}</span>
              </span>
              <ArrowRight tone="net" size={24} />
              <span className="text-[21px] text-paper">{route.page}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="border-l-[6px] border-l-teal pl-4 text-[21px] leading-snug text-paper">
        <span className="font-mono font-medium text-teal">#</span>
        {' 後面由 Vue Router 處理，所以一包靜態檔案也能有好幾個頁面。'}
      </p>
    </div>
  );
}

const CONCEPT_DIAGRAM: Record<ConceptId, () => ReactNode> = {
  vue: FrameworkDiagram,
  component: ComponentDiagram,
  router: RouterDiagram,
};

export function VueConceptsDemo() {
  /** 一進場就選好第一個概念 */
  const [picked, setPicked] = useState<ConceptId>('vue');
  const concept = CONCEPTS.find((item) => item.id === picked) ?? CONCEPTS[0];
  const Diagram = CONCEPT_DIAGRAM[concept.id];

  return (
    <div className="flex h-full max-h-[748px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-[5fr_7fr] gap-6">
        {/* ── 左：三個概念，平均撐滿高度 ─────────────────── */}
        <div className="flex min-h-0 flex-col gap-4">
          {CONCEPTS.map((item, index) => {
            const active = item.id === picked;
            const Icon = item.glyph;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPicked(item.id)}
                aria-current={active}
                className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                  active ? TONE_ON[item.tone] : CARD_OFF
                }`}
              >
                <span
                  className={`${STEP_BADGE} ${
                    active ? TONE_PILL[item.tone] : 'border-line text-faint'
                  }`}
                >
                  {pad2(index + 1)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span
                    className={`text-[30px] leading-snug ${
                      active ? 'font-medium' : 'text-muted'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-[21px] leading-snug ${
                      active ? 'text-muted' : 'text-faint'
                    }`}
                  >
                    {item.sub}
                  </span>
                </span>
                <Icon tone={active ? item.tone : 'net'} size={56} />
              </button>
            );
          })}
        </div>

        {/* ── 右：概念圖 ＋ 在專案裡長這樣 ────────────────── */}
        <div className="flex min-h-0 flex-col gap-5">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-panel-lift px-7 py-6">
            <Diagram />
          </div>

          {/*
            高度寫死 196：三段的行數是 3–4 行，讓它自己撐的話上面的概念圖
            會跟著忽大忽小，台下每點一次就要重新對焦。
            `whitespace-pre` 是為了保留路由表的對齊空白。
          */}
          <div className="flex h-[196px] shrink-0 flex-col justify-center gap-3 rounded-2xl border border-line bg-ink-soft px-8">
            <span className={LABEL_EXACT}>{concept.footLabel}</span>
            <div className="flex flex-col gap-1">
              {concept.foot.map((line, index) => (
                <span
                  key={index}
                  className="font-mono text-[20px] leading-snug whitespace-pre text-paper"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 33 頁 · AdvancedPromptDemo — 進階網站的提示詞
 *
 * 提示詞是 Notion 原文，一個字都不改。14 條分成四組，點一組（或直接點
 * 某一行）就高亮那一組的行，右邊說明「沒寫的話」會怎樣、「寫了之後」
 * 省掉什麼。說明只講對 AI 講清楚的效果，不寫成 ChatGPT Sites 的官方限制。
 * ══════════════════════════════════════════════════════════════ */

type RuleGroupId = 'stack' | 'no-build' | 'config' | 'simple';

interface Rule {
  group: RuleGroupId;
  /** 反引號照原文保留，畫面上由 InlineCode 畫成等寬字 */
  text: string;
}

const RULES_HEAD = '請依照以下規範開發網站：';

const RULES: readonly Rule[] = [
  { group: 'stack', text: '使用 HTML、CSS、JavaScript' },
  { group: 'stack', text: '使用 Vue 3 與 Vue Router' },
  { group: 'stack', text: 'Vue Router 使用 `createWebHashHistory()`' },
  { group: 'stack', text: '使用原生 CSS，不使用 Tailwind、Bootstrap' },
  { group: 'stack', text: '使用原生 `fetch()`，不使用 Axios' },
  { group: 'no-build', text: '不使用 Node.js、npm、Vite 或任何 Build Tool' },
  { group: 'no-build', text: '不建立 `package.json`' },
  {
    group: 'no-build',
    text: 'Vue 與 Vue Router 使用瀏覽器可直接執行的 Global Build',
  },
  { group: 'no-build', text: '網站必須可以直接以靜態檔案執行' },
  {
    group: 'config',
    text: '前端公開環境設定統一放在獨立的 `config.js`，例如 Client ID、API URL，不要散落在其他 JS 檔案',
  },
  {
    group: 'config',
    text: '`config.js` 只允許放可公開資訊，Secret、Private API Key、密碼不可放在前端',
  },
  { group: 'simple', text: '優先保持架構簡單、穩定、少依賴' },
  { group: 'simple', text: '修改功能時不要自行加入新的 Framework 或建置工具' },
  { group: 'simple', text: '最終網站必須可以直接部署到 ChatGPT Sites' },
];

/** 複製出去的全文：Notion 原文的格式（標題、空一行、星號清單） */
const RULES_PROMPT = [
  RULES_HEAD,
  '',
  ...RULES.map((rule) => `* ${rule.text}`),
].join('\n');

interface RuleGroup {
  id: RuleGroupId;
  name: string;
  range: string;
  /** 沒寫這一組的話，AI 常見的走向 */
  without: string;
  /** 寫了之後省掉什麼。反引號會畫成等寬字 */
  with: string;
}

const RULE_GROUPS: readonly RuleGroup[] = [
  {
    id: 'stack',
    name: '用什麼寫',
    range: '第 1–5 條',
    without:
      'AI 會自己挑工具，可能是 React、Tailwind、Axios，每多一樣就多一份要載入、要看懂的東西。',
    with: '每一次修改都在同一套寫法裡。hash 模式的網址長得像 `/#/records`，# 後面不會送到主機，主機不用為每一頁另外設定。',
  },
  {
    id: 'no-build',
    name: '不要建置工具',
    range: '第 6–9 條',
    without:
      'AI 很常直接建一個 npm＋Vite 專案，你的電腦就得先裝 Node.js，每次改完還要先建置才看得到結果。',
    with: 'Vue 用 `<script>` 標籤載入，沒有 `package.json`，整個資料夾就是要部署的那一包靜態檔案。',
  },
  {
    id: 'config',
    name: '設定放哪裡',
    range: '第 10–11 條',
    without:
      'Client ID 散在好幾個 JS 檔案裡，之後換網址或換帳號，要一個一個找出來改。',
    with: '換網址或換帳號只改 `config.js`。Google 的 Client ID 本來就會出現在網頁上，可以放；Client Secret、密碼不可以。',
  },
  {
    id: 'simple',
    name: '保持簡單、能部署',
    range: '第 12–14 條',
    without:
      '功能越加越多，AI 可能順手加進新的框架或建置工具，網站越改越難維護。',
    with: '每一次修改都守在同一個範圍裡。官方沒有列出 ChatGPT Sites 支援哪些框架，一包靜態檔案是最不用擔心相容性的形狀。',
  },
];

function Reason({
  label,
  text,
  positive,
}: {
  label: string;
  text: string;
  positive: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 border-l-[6px] pl-4 ${
        positive ? 'border-l-teal' : 'border-l-line'
      }`}
    >
      <span className={`${LABEL_TYPE} ${positive ? 'text-teal' : 'text-muted'}`}>
        {label}
      </span>
      <p className="text-[20px] leading-normal text-paper">
        <InlineCode text={text} />
      </p>
    </div>
  );
}

export function AdvancedPromptDemo() {
  const [group, setGroup] = useState<RuleGroupId>('stack');
  const [status, copy] = useCopy();
  const current = RULE_GROUPS.find((item) => item.id === group) ?? RULE_GROUPS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[1080px_1fr] gap-6">
      {/* ── 左：提示詞視窗，逐行 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line">
        <div className="flex h-[64px] shrink-0 items-center justify-between gap-4 border-b border-line bg-panel-lift px-6">
          <span className={LABEL_FAINT}>提示詞 · 接在你的需求後面</span>
          <div className="flex items-center gap-4">
            {status === 'failed' && <CopyFailed />}
            <CopyButton
              status={status}
              label="複製整段"
              onClick={() => copy(RULES_PROMPT)}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center bg-ink-soft py-4">
          <p className="px-6 pb-3 text-[21px] text-paper">{RULES_HEAD}</p>
          {RULES.map((rule, index) => {
            const on = rule.group === group;
            return (
              <button
                key={rule.text}
                type="button"
                onClick={() => setGroup(rule.group)}
                className={`flex min-h-[37px] w-full items-stretch gap-3 pr-5 text-left transition-colors duration-200 ${
                  on ? 'bg-acid/14' : 'hover:bg-panel-lift'
                }`}
              >
                <span className={`w-[6px] shrink-0 ${on ? 'bg-acid' : ''}`} />
                <span
                  className={`flex w-[30px] shrink-0 items-center justify-end font-mono text-[17px] ${
                    on ? 'text-muted' : 'text-faint'
                  }`}
                >
                  {pad2(index + 1)}
                </span>
                <span
                  className={`flex items-center py-1 text-[20px] leading-snug ${
                    on ? 'text-paper' : 'text-muted'
                  }`}
                >
                  <span>
                    <InlineCode text={rule.text} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 右：四組 ＋ 為什麼要寫 ───────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>十四條，分成四組</span>

        <div className="flex shrink-0 flex-col gap-2.5">
          {RULE_GROUPS.map((item, index) => {
            const on = item.id === group;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGroup(item.id)}
                aria-current={on}
                className={`flex h-[66px] items-center gap-4 rounded-2xl border px-5 text-left transition-colors duration-200 ${
                  on ? 'border-acid bg-acid/14' : CARD_OFF
                }`}
              >
                <span
                  className={`${STEP_BADGE} ${
                    on
                      ? 'border-acid bg-acid text-on-accent'
                      : 'border-line text-faint'
                  }`}
                >
                  {pad2(index + 1)}
                </span>
                <span
                  className={`flex-1 text-[24px] ${
                    on ? 'font-medium text-paper' : 'text-muted'
                  }`}
                >
                  {item.name}
                </span>
                <span
                  className={`text-[17px] ${on ? 'text-paper' : 'text-faint'}`}
                >
                  {item.range}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 rounded-2xl border border-line bg-panel-lift px-7 py-6">
          <Reason label="沒寫的話" text={current.without} positive={false} />
          <Reason label="寫了之後" text={current.with} positive />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 35 頁 · FamilyLedgerDemo — 實作：家庭記帳工具
 *
 * 兩個步驟分頁，各自一顆複製鍵。
 *   ① 先請 AI 建立虛構資料。Notion 原文放的是講者自己的試算表網址，
 *      學員要用自己的，所以畫面上是虛線框的佔位字，複製出去也是佔位字。
 *   ② 開發專案原型。Notion 原文只修一個錯字（「正卻」→「正確」）。
 *      後半段的 14 條規範與第 33 頁同一份資料，收成一張摺疊卡；
 *      **複製鍵永遠複製完整全文**，不管卡片有沒有展開。
 *
 * 左欄的「開工前準備」可以逐項打勾，只是給台下對照自己缺什麼，不影響右邊。
 * ══════════════════════════════════════════════════════════════ */

type LedgerStep = 'data' | 'prototype';

const LEDGER_STEPS: readonly { id: LedgerStep; mark: string; label: string }[] =
  [
    { id: 'data', mark: '①', label: '先建立虛構資料' },
    { id: 'prototype', mark: '②', label: '開發專案原型' },
  ];

const SHEET_PLACEHOLDER = '（貼上你的試算表連結）';

const DATA_LINES = [
  '我要製作一個家庭記帳的工具',
  '在製作之前，我想要你先協助我建立虛構的資料內容',
] as const;

const DATA_PROMPT = [...DATA_LINES, `試算表連結：${SHEET_PLACEHOLDER}`].join(
  '\n',
);

const PROTOTYPE_INTRO = [
  '接下來我們來開發專案原型：',
  '這是一個教學專案，但在描述上不要使用任何「教學」的相關字眼，開發目標如下：',
] as const;

const PROTOTYPE_GOALS = [
  '需要開發一個記帳工具，會串接到剛剛的試算表，試算表內容，你在開發過程中可以調整內容',
  '預期這些家庭成員都可以登入',
  '會串接 Google Login，我會自行加入 Google Client id',
  '會部署至 ChatGPT Site，但你只需要確保在本地端可正確運行即可',
] as const;

const PROTOTYPE_OUTRO = '以上需求有任何問題，請跟我進行討論';

/** 複製出去的全文：開發目標 ＋ 空兩行 ＋ 第 33 頁那一整段規範 */
const PROTOTYPE_PROMPT = [
  ...PROTOTYPE_INTRO,
  '',
  ...PROTOTYPE_GOALS.map((goal, index) => `${index + 1}. ${goal}`),
  '',
  PROTOTYPE_OUTRO,
  '',
  '',
  RULES_PROMPT,
].join('\n');

type PrepId = 'sheet' | 'client' | 'plan';

const PREP: readonly { id: PrepId; title: string; note: string }[] = [
  {
    id: 'sheet',
    title: '一份自己的 Google 試算表',
    note: '第 ① 步要貼上它的連結，之後共用給要登入的家人',
  },
  {
    id: 'client',
    title: 'Google Client ID',
    note: '第 30 頁建立的，第 ② 步做完再自己填進 config.js',
  },
  {
    id: 'plan',
    title: '能用 ChatGPT Sites 的方案',
    note: 'Plus 以上，免費版與 Go 目前不能用',
  },
];

/** 標題列 ＋ 程式碼井。兩個步驟共用，內容自己帶 */
function PromptWindow({
  label,
  hint,
  status,
  onCopy,
  children,
}: {
  label: string;
  hint?: string;
  status: CopyStatus;
  onCopy: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line">
      <div className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-panel-lift px-6">
        <span className={LABEL_EXACT}>{label}</span>
        <div className="flex items-center gap-4">
          {status === 'failed' ? (
            <CopyFailed />
          ) : (
            hint && <span className="text-[18px] text-muted">{hint}</span>
          )}
          <CopyButton status={status} label="複製全文" onClick={onCopy} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center bg-ink-soft px-6 py-4">
        {children}
      </div>
    </div>
  );
}

function DataStep({
  status,
  onCopy,
}: {
  status: CopyStatus;
  onCopy: () => void;
}) {
  return (
    <>
      <PromptWindow label="貼到 Codex 的輸入框" status={status} onCopy={onCopy}>
        <div className="flex flex-col gap-3 px-4 text-[28px] leading-relaxed text-paper">
          {DATA_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="flex items-center">
            <span>試算表連結：</span>
            <span className="rounded-lg border-2 border-dashed border-acid bg-acid/14 px-4 text-acid">
              {SHEET_PLACEHOLDER}
            </span>
          </p>
        </div>
      </PromptWindow>

      <div className="grid h-[196px] shrink-0 grid-cols-2 gap-4">
        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-line bg-panel-lift px-7">
          <span className={LABEL_FAINT}>送出前</span>
          <p className="text-[21px] leading-normal text-paper">
            {'把虛線框換成你自己的試算表連結。空白的試算表就可以，欄位與虛構資料交給 AI 提議。'}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-line bg-panel-lift px-7">
          <span className={LABEL_FAINT}>為什麼先做資料</span>
          <p className="text-[21px] leading-normal text-paper">
            {'先有欄位與幾筆資料，第 ② 步開發時 AI 才知道要讀寫哪些欄位；用虛構資料測試，也不用先把真實的收支打進去。'}
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * 第 ② 步的兩段是互斥的摺疊：規範展開時，開發目標收成一列。
 * 兩段同時展開的話要 ~800px，放不進 720 的根容器。
 */
function PrototypeStep({
  status,
  onCopy,
  rulesOpen,
  onToggleRules,
}: {
  status: CopyStatus;
  onCopy: () => void;
  rulesOpen: boolean;
  onToggleRules: (open: boolean) => void;
}) {
  return (
    <PromptWindow
      label="貼到 Codex 的輸入框"
      hint="含 14 條規範"
      status={status}
      onCopy={onCopy}
    >
      <div className="flex flex-col gap-4">
        {rulesOpen ? (
          <button
            type="button"
            onClick={() => onToggleRules(false)}
            className="flex h-[48px] shrink-0 items-center justify-between rounded-xl border border-line bg-panel px-5 text-left text-[20px] text-paper transition-colors duration-200 hover:border-acid"
          >
            <span>{'＋ 開發目標（四點需求）'}</span>
            <span className="text-[17px] text-faint">展開</span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 px-2 text-[23px] leading-normal text-paper">
            <div className="flex flex-col">
              {PROTOTYPE_INTRO.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <ol className="flex flex-col gap-1">
              {PROTOTYPE_GOALS.map((goal, index) => (
                <li key={goal} className="flex gap-3">
                  <span className="w-[28px] shrink-0 font-mono text-faint">
                    {index + 1}.
                  </span>
                  <span>{goal}</span>
                </li>
              ))}
            </ol>
            <p>{PROTOTYPE_OUTRO}</p>
          </div>
        )}

        {rulesOpen ? (
          <div className="flex flex-col rounded-xl border border-line bg-panel pb-3">
            <button
              type="button"
              onClick={() => onToggleRules(false)}
              className="flex h-[46px] shrink-0 items-center justify-between px-5 text-left text-[20px] text-paper"
            >
              <span>{'－ 進階網站的開發規範（14 條，同第 33 頁）'}</span>
              <span className="text-[17px] text-faint">收起</span>
            </button>
            <p className="px-5 pb-1 text-[18px] leading-[28px] text-paper">
              {RULES_HEAD}
            </p>
            {RULES.map((rule, index) => (
              <div
                key={rule.text}
                className="flex h-[27px] items-center gap-3 px-5"
              >
                <span className="w-[26px] shrink-0 text-right font-mono text-[15px] text-faint">
                  {pad2(index + 1)}
                </span>
                <span className="text-[18px] text-paper">
                  <InlineCode text={rule.text} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onToggleRules(true)}
            className="flex h-[56px] shrink-0 items-center justify-between rounded-xl border border-dashed border-line bg-panel px-5 text-left text-[21px] text-paper transition-colors duration-200 hover:border-acid"
          >
            <span>{'＋ 進階網站的開發規範（14 條，同第 33 頁）'}</span>
            <span className="text-[17px] text-faint">展開</span>
          </button>
        )}
      </div>
    </PromptWindow>
  );
}

export function FamilyLedgerDemo() {
  const [step, setStep] = useState<LedgerStep>('data');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [ready, setReady] = useState<readonly PrepId[]>([]);
  const [status, copy] = useCopy();

  const toggleReady = (id: PrepId) =>
    setReady((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const allReady = ready.length === PREP.length;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[480px_1fr] gap-6">
      {/* ── 左：開工前準備 ───────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 rounded-2xl border border-line bg-panel-lift px-6 py-5">
          <span className={LABEL_FAINT}>開工前準備</span>
          <div className="flex flex-col gap-3">
            {PREP.map((item) => {
              const done = ready.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleReady(item.id)}
                  aria-pressed={done}
                  className={`flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-colors duration-200 ${
                    done
                      ? 'border-teal bg-teal/14'
                      : 'border-line bg-panel hover:border-teal/55'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border-2 ${
                      done ? 'border-teal bg-teal' : 'border-line bg-panel'
                    }`}
                  >
                    {done && <CheckIcon />}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[22px] leading-snug text-paper">
                      {item.title}
                    </span>
                    <span className="text-[18px] leading-snug text-muted">
                      {item.note}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <span
            className={`text-[19px] ${allReady ? 'font-medium text-teal' : 'text-muted'}`}
          >
            {allReady
              ? '三樣都備妥了，可以開工'
              : `已備妥 ${ready.length} / ${PREP.length}`}
          </span>
        </div>

        <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-line bg-panel-lift px-6 py-5">
          <span className={LABEL_FAINT}>第 ② 步做完之後</span>
          <p className="text-[19px] leading-snug text-paper">
            {'先在自己的電腦上確認登入、讀取與新增收支都正常，再照第 34 頁的清單部署到 ChatGPT Sites。'}
          </p>
        </div>
      </div>

      {/* ── 右：兩個步驟 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex h-[52px] shrink-0 items-center gap-3">
          {LEDGER_STEPS.map((item, index) => {
            const on = item.id === step;
            return (
              <div key={item.id} className="flex items-center gap-3">
                {index > 0 && <ArrowRight tone="net" size={26} />}
                <button
                  type="button"
                  onClick={() => setStep(item.id)}
                  aria-current={on}
                  className={`flex h-[52px] items-center gap-2.5 rounded-xl border px-6 text-[21px] transition-colors duration-200 ${
                    on
                      ? 'border-acid bg-acid font-medium text-on-accent'
                      : 'border-line bg-panel-lift text-muted hover:border-acid/55 hover:text-paper'
                  }`}
                >
                  <span>{item.mark}</span>
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {step === 'data' ? (
          <DataStep status={status} onCopy={() => copy(DATA_PROMPT)} />
        ) : (
          <PrototypeStep
            status={status}
            onCopy={() => copy(PROTOTYPE_PROMPT)}
            rulesOpen={rulesOpen}
            onToggleRules={setRulesOpen}
          />
        )}
      </div>
    </div>
  );
}
