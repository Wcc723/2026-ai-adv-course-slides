import { useState, type ReactNode } from 'react';
import { Highlight } from 'prism-react-renderer';
import { codeTheme } from '../../components/codeTheme';
import { ArchMap, RoleIcon } from './diagrams-web';
import type { ArchArrow, ArchNode, RoleIconId, Tone } from './diagrams-web';

/* ══════════════════════════════════════════════════════════════
 * 〈從 0 到 1 的網站開發〉— 網站怎麼運作
 *
 * 第一章最後四頁與第二章的 ChatGPT Sites 那一頁。前三個 demo 移植自
 * 〈網站是如何運作的〉，後兩個是這份簡報補的：
 *
 *   第 15 頁  LoadDemo       輸入網址之後，畫面是怎麼來的
 *   第 16 頁  RolesDemo      前端 / 後端 / 伺服器 / 資料庫各自在做什麼
 *   第 17 頁  FrontendDemo   HTML / CSS / JavaScript 怎麼把畫面撐起來
 *   第 18 頁  ImageLoadDemo  圖片是獨立的檔案，HTML 裡只有一行連結
 *   第 25 頁  SiteArchDemo   ChatGPT Sites 在這張圖上包住了哪一塊
 *
 * ──────────────────────────────────────────────────────────────
 * 共同的視覺語言
 * ──────────────────────────────────────────────────────────────
 * 第 15、16、25 頁右側是**同一張** `ArchMap`（見 ./diagrams-web），座標完全
 * 不動，換的只有「哪些節點亮起、畫哪幾支箭頭、伺服器框叫什麼」。
 * 第 17、18 頁是同一個購物網站、同一個行李箱、同一種檔案卡。
 *
 * 顏色是跨頁契約，各頁不可以自己決定 —— 顏色永遠代表**角色**：
 *   user    role-user    使用者
 *   client  role-client  前端、瀏覽器
 *   backend role-server  後端程式
 *   db      role-data    資料庫
 *   host    muted / line 伺服器 —— 刻意沒有強調色
 *   net     faint        網路
 *   danger  danger       失敗、寫錯
 *   html / css / js      第 17、18 頁，直接吃色票的 lang-* 三色
 *   img     violet       第 18 頁的圖片檔（它不是程式語言，不借 lang-*）
 *
 * ──────────────────────────────────────────────────────────────
 * 從深色主題移植過來時改了什麼
 * ──────────────────────────────────────────────────────────────
 * 來源是深色主題，同名 token 在這裡明暗相反。對照表逐條套用：
 *   - 實心色塊上的字從 `text-ink` 改成 `text-on-accent`
 *   - 淡底 `/8` → `/14`、邊框 `/35`~`/45` → `/55`
 *   - 「被選中」除了淡底，一律再配一個不透明訊號（實色框線或實心徽章）
 *   - 小徽章（TONE_CHIP）的底改成 `bg-panel`：彩色字疊在自己的淡底上、
 *     再疊在 ink-soft 上，acid 會掉到 4.4:1，改成白底一律 ≥5.2:1
 *   - 網頁預覽原本是 `bg-paper`（深色時代的白），改成 `bg-panel`
 *   - 瀏覽器視窗的三顆紅綠燈改成中性色：亮色的 coral / amber / teal 是
 *     深褐、深橄欖、深青，認不出是紅綠燈，只會多出三個強調色
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這份簡報沒有 description 也沒有 caption，面板可用 ≈ 1744 × 768。
 *
 *   移植的三頁  根容器維持 `h-[648px] w-full max-w-[1760px]`。裡面每一格
 *               都是對著 648 湊出來的，改根容器等於重排整份；多出來的
 *               高度由 Panel 的 items-center 上下均分。
 *               「主區 flex-1」＋「底部控制列 h-11」，gap-5 → 主區 584。
 *   新寫的兩頁  根容器 `h-[700px] w-full max-w-[1740px]` → 主區 636。
 *
 * 字級：卡片主文 26–32、次要說明 19–22、標籤 16–17、等寬 18–20，下限 15。
 *
 * 沒有任何一個容器可以真的捲動（稽核會把它判成溢出），未輪到的一般 DOM
 * 一律不掛（`{cond && …}`），只有 SVG 的 <path> / <g> 例外。
 * 動畫只用 CSS transition，不引入任何動畫函式庫。
 *
 * 浮水印在對外版固定在右上角。五頁的右上角都是 ArchMap 容器或瀏覽器的
 * 標題列，沒有文字落在那一角。
 * ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * 共用零件
 *
 * Tailwind 只掃得到完整字串，所以每一格都存整串 class，不做動態拼接
 * （`bg-${tone}/14` 不會產生任何 class）。
 * ══════════════════════════════════════════════════════════════ */

/** 文字色。小標與強調字共用 */
const TONE_TEXT: Record<Tone, string> = {
  user: 'text-role-user',
  client: 'text-role-client',
  backend: 'text-role-server',
  db: 'text-role-data',
  host: 'text-paper',
  net: 'text-faint',
  danger: 'text-danger',
  html: 'text-lang-html',
  css: 'text-lang-css',
  js: 'text-lang-javascript',
  img: 'text-violet',
};

/** 說明卡外框（講過了、但不是現在正在講的那一張） */
const TONE_CARD: Record<Tone, string> = {
  user: 'border-role-user/55 bg-role-user/14',
  client: 'border-role-client/55 bg-role-client/14',
  backend: 'border-role-server/55 bg-role-server/14',
  db: 'border-role-data/55 bg-role-data/14',
  host: 'border-line bg-panel-lift',
  net: 'border-line-soft bg-panel-lift',
  danger: 'border-danger/55 bg-danger/14',
  html: 'border-lang-html/55 bg-lang-html/14',
  css: 'border-lang-css/55 bg-lang-css/14',
  js: 'border-lang-javascript/55 bg-lang-javascript/14',
  img: 'border-violet/55 bg-violet/14',
};

/**
 * 被選中的大卡／分頁按鈕。
 *
 * 框線是**實色**：淡底只有 1.2:1 上下，投影出去會整片被吃掉，
 * 不能單獨表示「選中」。淡底維持 `/14` —— 彩色字疊在 `/20` 的自色淡底上，
 * acid 會掉到 4.5:1 以下。
 */
const TONE_ON: Record<Tone, string> = {
  user: 'border-role-user bg-role-user/14 text-role-user',
  client: 'border-role-client bg-role-client/14 text-role-client',
  backend: 'border-role-server bg-role-server/14 text-role-server',
  db: 'border-role-data bg-role-data/14 text-role-data',
  host: 'border-muted bg-muted/14 text-paper',
  net: 'border-faint bg-muted/14 text-paper',
  danger: 'border-danger bg-danger/14 text-danger',
  html: 'border-lang-html bg-lang-html/14 text-lang-html',
  css: 'border-lang-css bg-lang-css/14 text-lang-css',
  js: 'border-lang-javascript bg-lang-javascript/14 text-lang-javascript',
  img: 'border-violet bg-violet/14 text-violet',
};

/**
 * 小徽章。底色是 `bg-panel` 不是淡色：徽章常常疊在 ink-soft 或另一層淡底上，
 * 彩色字在那種底上會掉到 4.5:1 以下；白底上九支強調色全部 ≥5.2:1。
 */
const TONE_CHIP: Record<Tone, string> = {
  user: 'border-role-user/55 bg-panel text-role-user',
  client: 'border-role-client/55 bg-panel text-role-client',
  backend: 'border-role-server/55 bg-panel text-role-server',
  db: 'border-role-data/55 bg-panel text-role-data',
  host: 'border-muted/55 bg-panel text-paper',
  net: 'border-faint/55 bg-panel text-muted',
  danger: 'border-danger/55 bg-panel text-danger',
  html: 'border-lang-html/55 bg-panel text-lang-html',
  css: 'border-lang-css/55 bg-panel text-lang-css',
  js: 'border-lang-javascript/55 bg-panel text-lang-javascript',
  img: 'border-violet/55 bg-panel text-violet',
};

/** 小圓點 */
const TONE_DOT: Record<Tone, string> = {
  user: 'bg-role-user',
  client: 'bg-role-client',
  backend: 'bg-role-server',
  db: 'bg-role-data',
  host: 'bg-muted',
  net: 'bg-faint',
  danger: 'bg-danger',
  html: 'bg-lang-html',
  css: 'bg-lang-css',
  js: 'bg-lang-javascript',
  img: 'bg-violet',
};

/** 實心藥丸（序號、主要按鈕）。挖空字對九支強調色都 ≥6.4:1 */
const TONE_PILL: Record<Tone, string> = {
  user: 'border-role-user bg-role-user text-on-accent',
  client: 'border-role-client bg-role-client text-on-accent',
  backend: 'border-role-server bg-role-server text-on-accent',
  db: 'border-role-data bg-role-data text-on-accent',
  host: 'border-muted bg-muted text-on-accent',
  net: 'border-faint bg-faint text-on-accent',
  danger: 'border-danger bg-danger text-on-accent',
  html: 'border-lang-html bg-lang-html text-on-accent',
  css: 'border-lang-css bg-lang-css text-on-accent',
  js: 'border-lang-javascript bg-lang-javascript text-on-accent',
  img: 'border-violet bg-violet text-on-accent',
};

/** 只有邊框色。給假視窗這種「底色必須是 bg-ink-soft」的場合用 */
const TONE_EDGE: Record<Tone, string> = {
  user: 'border-role-user/55',
  client: 'border-role-client/55',
  backend: 'border-role-server/55',
  db: 'border-role-data/55',
  host: 'border-line',
  net: 'border-line-soft',
  danger: 'border-danger/55',
  html: 'border-lang-html/55',
  css: 'border-lang-css/55',
  js: 'border-lang-javascript/55',
  img: 'border-violet/55',
};

/** 6px 左粗條的顏色（`border-l-[6px]` 由呼叫端加） */
const TONE_BAR: Record<Tone, string> = {
  user: 'border-l-role-user',
  client: 'border-l-role-client',
  backend: 'border-l-role-server',
  db: 'border-l-role-data',
  host: 'border-l-muted',
  net: 'border-l-faint',
  danger: 'border-l-danger',
  html: 'border-l-lang-html',
  css: 'border-l-lang-css',
  js: 'border-l-lang-javascript',
  img: 'border-l-violet',
};

/** 面板小標籤的字體規格。顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 最常見的那一種：次要色的小標籤 */
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

/** 沒被選中的大卡 */
const CARD_OFF = 'border-line bg-panel-lift hover:border-faint';

/** 次要按鈕的皮膚（「重來」「上一步」） */
const GHOST_SKIN = 'border-line bg-panel text-muted hover:border-faint hover:text-paper';

/**
 * 停用的按鈕。**不要用 opacity 壓** —— 稽核量的是實際對比，半透明的
 * muted 會掉到 4.5:1 以下。改用色票裡本來就比較淡的 faint。
 */
const GHOST_OFF = 'cursor-default border-line-soft bg-panel text-faint';

/** 控制列那一排按鈕的共同尺寸 */
const BTN_ROW = 'h-11 rounded-xl border px-5 text-[19px] transition-colors duration-200';

/** 圓形的序號徽章 */
const STEP_BADGE =
  'flex size-7 shrink-0 items-center justify-center rounded-full border font-display text-[16px]';

/** 01 / 02 / 03 … */
function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── CheckMark / CrossMark ──────────────────────────────── */

/** 自己畫的勾選記號，顏色吃 currentColor */
function CheckMark() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.4 6.4 11.8 13 4.6" />
    </svg>
  );
}

/** 打叉。規格跟 CheckMark 完全對稱，勾與叉的視覺重量才一致 */
function CrossMark() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.4 4.4 11.6 11.6" />
      <path d="M11.6 4.4 4.4 11.6" />
    </svg>
  );
}

/* ── StepDots / StepControls ────────────────────────────── */

/** 步驟圓點列。列高固定 24，目前這一顆拉長成膠囊 */
function StepDots({
  total,
  current,
  tone,
  onPick,
}: {
  total: number;
  current: number;
  tone: Tone;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex h-6 items-center gap-2.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`第 ${i + 1} 步`}
          aria-current={i === current}
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
            i === current ? `w-9 ${TONE_DOT[tone]}` : 'w-2.5 bg-line hover:bg-faint'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * 「上一步 / 下一步 / 重來」那一組控制列。高度固定 44（見 BTN_ROW）。
 * 這一列本身不決定自己貼哪邊，呼叫端自己用 flex 排。
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
        上一步
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={atEnd}
        className={`${BTN_ROW} ${atEnd ? GHOST_OFF : `${TONE_PILL[tone]} font-medium`}`}
      >
        下一步
      </button>
      <span className={`px-2 ${LABEL_FAINT}`}>
        {pad2(current + 1)} / {pad2(total)}
      </span>
      <button type="button" onClick={onReset} className={`${BTN_ROW} ${GHOST_SKIN}`}>
        重來
      </button>
    </div>
  );
}

/** 底部控制列：左邊是這一拍的說明，右邊是圓點與按鈕。LoadDemo 起的四頁共用 */
function BeatBar({
  beat,
  total,
  tone,
  label,
  onPick,
  onReset,
}: {
  beat: number;
  total: number;
  tone: Tone;
  label: string;
  onPick: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className={`${STEP_BADGE} ${TONE_PILL[tone]}`}>{beat + 1}</span>
        <span className="truncate text-[21px] text-paper">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <StepDots total={total} current={beat} tone={tone} onPick={onPick} />
        <StepControls
          current={beat}
          total={total}
          tone={tone}
          onPrev={() => onPick(Math.max(0, beat - 1))}
          onNext={() => onPick(Math.min(total - 1, beat + 1))}
          onReset={onReset}
        />
      </div>
    </div>
  );
}

/* ── BrowserFrame ───────────────────────────────────────── */

/**
 * 假的瀏覽器視窗。第 15、17、18 頁共用。
 *
 * 高度組成：標題列 52 + 網址列 60（沒給 `url` 時不算）
 *          + 上下框線 2 + 內容區 p-6 的 48。
 * 沒有 overflow-hidden：塞不下就是塞不下，請縮文案，不要靠裁切。
 */
function BrowserFrame({
  title,
  tone = 'client',
  url,
  onUrlChange,
  onGo,
  goLabel = '前往',
  children,
  className = '',
}: {
  title: string;
  tone?: Tone;
  url?: string;
  onUrlChange?: (value: string) => void;
  onGo?: () => void;
  goLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-ink-soft ${TONE_EDGE[tone]} ${className}`}>
      <div
        className={`flex h-[52px] shrink-0 items-center gap-3 rounded-t-2xl border-b bg-panel-lift px-5 ${TONE_EDGE[tone]}`}
      >
        <span className="size-3 rounded-full bg-line" />
        <span className="size-3 rounded-full bg-line" />
        <span className="size-3 rounded-full bg-line" />
        <span className={`ml-2 text-[19px] ${TONE_TEXT[tone]}`}>{title}</span>
      </div>

      {url !== undefined && (
        <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line-soft px-5">
          <span className={`${LABEL_FAINT} shrink-0`}>網址</span>
          <input
            value={url}
            onChange={(event) => onUrlChange?.(event.target.value)}
            readOnly={onUrlChange === undefined}
            spellCheck={false}
            aria-label="網址列"
            className="min-w-0 flex-1 rounded-full border border-line bg-panel px-4 py-1.5 font-mono text-[19px] text-paper outline-none focus:border-role-client"
          />
          {onGo && (
            <button
              type="button"
              onClick={onGo}
              className={`h-9 shrink-0 rounded-full border px-5 text-[18px] font-medium transition-colors duration-200 ${TONE_PILL.client}`}
            >
              {goLabel}
            </button>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">{children}</div>
    </div>
  );
}

/* ── ShopPage ───────────────────────────────────────────── */

interface Product {
  id: RoleIconId;
  name: string;
  price: string;
}

const PRODUCTS: Product[] = [
  { id: 'suitcase', name: '行李箱 28 吋', price: 'NT$3,280' },
  { id: 'backpack', name: '登機後背包', price: 'NT$1,180' },
  { id: 'pouch', name: '收納袋六件組', price: 'NT$480' },
];

/**
 * 商品縮圖。空的灰方塊看起來像圖還沒載入完，所以直接把商品畫進去 ——
 * 圖示是手繪 SVG（./diagrams-web 的 RoleIcon），吃 tone、不是點陣圖。
 */
function ProductThumb({ id, size = 96 }: { id: RoleIconId; size?: number }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-line-soft bg-role-client/14">
      <RoleIcon id={id} size={size} tone="client" />
    </div>
  );
}

/** 假購物網站的內容區。第 15 頁載入完成之後顯示 */
function ShopPage({ host }: { host: string }) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between">
        <span className="text-[24px] font-semibold text-paper">{host}</span>
        <span className={`rounded-full border px-4 py-1.5 text-[18px] ${TONE_CHIP.client}`}>
          購物車 0
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex min-h-0 flex-col gap-3 rounded-xl border border-line bg-panel p-4"
          >
            <ProductThumb id={product.id} />
            <span className="text-[20px] text-paper">{product.name}</span>
            <span className={`text-[19px] ${TONE_TEXT.client}`}>{product.price}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 15 頁 — LoadDemo
 *
 * 「輸入網址之後，畫面是怎麼來的」。左邊是瀏覽器、右邊是運作概念圖，
 * 五拍走完一次完整的來回。網址列是真的可以打字的 input —— 打什麼，
 * 載入完成之後的網站標題就是什麼。
 *
 * 主區 584：左右各一欄（grid-cols-2 gap-6）。
 * 底部一列 44：目前這一步的說明 + StepControls。
 * ══════════════════════════════════════════════════════════════ */

interface LoadBeat {
  label: string;
  browser: 'idle' | 'loading' | 'done';
  lit: ArchNode[];
  ring?: ArchNode;
  arrows: ArchArrow[];
}

const LOAD_BEATS: LoadBeat[] = [
  {
    label: '在網址列輸入網址，按「前往」。',
    browser: 'idle',
    lit: [],
    arrows: [],
  },
  {
    label: '瀏覽器把這個網址送出去。',
    browser: 'loading',
    lit: ['user', 'client'],
    ring: 'client',
    arrows: ['userToClient'],
  },
  {
    label: '經過網路，找到這個網址對應的伺服器。',
    browser: 'loading',
    lit: ['user', 'client', 'host'],
    ring: 'host',
    arrows: ['userToClient', 'clientToBackend'],
  },
  {
    label: '伺服器上的後端去資料庫拿這一頁需要的資料。',
    browser: 'loading',
    lit: ['user', 'client', 'host', 'backend', 'db'],
    ring: 'db',
    arrows: ['userToClient', 'clientToBackend', 'backendToDb', 'dbToBackend'],
  },
  {
    label: '資料送回前端，網站就出現在你的瀏覽器裡。',
    browser: 'done',
    lit: ['user', 'client', 'host', 'backend', 'db'],
    ring: 'client',
    arrows: ['userToClient', 'clientToBackend', 'backendToDb', 'dbToBackend', 'backendToClient'],
  },
];

export function LoadDemo() {
  const [url, setUrl] = useState('shop.example');
  const [beat, setBeat] = useState(0);
  const current = LOAD_BEATS[beat];
  const host = url.trim() === '' ? 'shop.example' : url.trim();

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <BrowserFrame
          title="瀏覽器"
          url={url}
          onUrlChange={setUrl}
          onGo={() => setBeat(1)}
          className="h-full"
        >
          {current.browser === 'idle' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <RoleIcon id="browser" size={72} tone="net" muted />
              <span className="text-[22px] text-faint">還沒有內容 —— 按「前往」開始</span>
            </div>
          )}

          {current.browser === 'loading' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <span className={`rounded-full border px-5 py-2 text-[20px] ${TONE_CHIP.net}`}>
                正在取得 {host} 的內容…
              </span>
              <span className="text-[20px] text-faint">這段時間畫面是空的，資料還在路上</span>
            </div>
          )}

          {current.browser === 'done' && <ShopPage host={host} />}
        </BrowserFrame>

        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-line bg-panel-lift p-4">
          <ArchMap lit={current.lit} ring={current.ring} arrows={current.arrows} />
        </div>
      </div>

      <BeatBar
        beat={beat}
        total={LOAD_BEATS.length}
        tone="client"
        label={current.label}
        onPick={setBeat}
        onReset={() => setBeat(0)}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 16 頁 — RolesDemo
 *
 * 同一張 ArchMap，這次左邊逐張點亮說明卡。四拍分別點名前端、後端、
 * 伺服器、資料庫；前端只給一句，細節留到下一頁（第 17 頁 FrontendDemo）。
 *
 * 說明一律白話直述句：不用工讀生、餐廳、倉庫這類比喻。
 * ══════════════════════════════════════════════════════════════ */

interface RoleCard {
  node: ArchNode;
  tone: Tone;
  name: string;
  lead: string;
  detail: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    node: 'client',
    tone: 'client',
    name: '前端',
    lead: '你在螢幕上看到、點得到的那一層。',
    detail: '下一頁會單獨拆開來看它是用什麼寫的。',
  },
  {
    node: 'backend',
    tone: 'backend',
    name: '後端',
    lead: '一整包處理邏輯的程式，決定每個請求該做什麼。',
    detail: '但程式碼放在那裡不會自己動，要有人把它跑起來。',
  },
  {
    node: 'host',
    tone: 'host',
    name: '伺服器',
    lead: '一台一直開著的機器，負責把後端程式跑起來。',
    detail: '它真的是機器 —— 大家講的「雲端」就是別人家的這種機器。',
  },
  {
    node: 'db',
    tone: 'db',
    name: '資料庫',
    lead: '專門存資料的地方，也放在伺服器上。',
    detail: '程式負責處理邏輯，資料要長期留著就得交給資料庫。',
  },
];

/**
 * 說明卡。**四張卡從第一拍就全部掛在畫面上**，不是一張一張長出來 ——
 * 台下先看到「總共要講四件事」，再看它們一個一個亮起來，比較好抓進度。
 *
 * 三種狀態：
 *   還沒講到  白卡、灰框、文字 muted
 *   講過了    帶著自己的角色色（淡底 + /55 框），序號是白底描邊
 *   正在講    框線變實色、序號變實心 —— 這兩個不透明訊號才是「正在講」，
 *             淡底只是陪襯
 *
 * 講過的卡片會一直留著顏色：這一頁在教的就是「哪個角色是什麼顏色」，
 * 講完把顏色收掉等於把剛建立的對應關係拆掉。
 */
function ExplainCard({
  index,
  tone,
  name,
  lead,
  detail,
  state,
}: {
  index: number;
  tone: Tone;
  name: string;
  lead: string;
  detail: string;
  state: 'idle' | 'seen' | 'active';
}) {
  const skin =
    state === 'active' ? TONE_ON[tone] : state === 'seen' ? TONE_CARD[tone] : 'border-line bg-panel';
  const badge =
    state === 'active'
      ? TONE_PILL[tone]
      : state === 'seen'
        ? TONE_CHIP[tone]
        : 'border-line bg-panel text-faint';
  const nameColor = state === 'idle' ? 'text-muted' : TONE_TEXT[tone];
  const leadColor = state === 'idle' ? 'text-muted' : 'text-paper';
  const detailColor = state === 'idle' ? 'text-faint' : 'text-muted';

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-2xl border px-7 transition-colors duration-300 ${skin}`}
    >
      <div className="flex items-center gap-3">
        <span className={`${STEP_BADGE} ${badge}`}>{index}</span>
        <span className={`text-[27px] font-semibold ${nameColor}`}>{name}</span>
      </div>
      <p className={`text-[21px] leading-[1.5] ${leadColor}`}>{lead}</p>
      <p className={`text-[19px] leading-[1.5] ${detailColor}`}>{detail}</p>
    </div>
  );
}

export function RolesDemo() {
  const [beat, setBeat] = useState(0);
  const currentCard = beat > 0 ? ROLE_CARDS[beat - 1] : undefined;
  const lit = ROLE_CARDS.slice(0, beat).map((card) => card.node);

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        {/* 四張卡一開始就全部在，只是還沒亮 */}
        <div className="flex min-h-0 flex-col gap-3">
          {ROLE_CARDS.map((card, index) => (
            <ExplainCard
              key={card.node}
              index={index + 1}
              tone={card.tone}
              name={card.name}
              lead={card.lead}
              detail={card.detail}
              state={index === beat - 1 ? 'active' : index < beat ? 'seen' : 'idle'}
            />
          ))}
        </div>

        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-line bg-panel-lift p-4">
          <ArchMap lit={lit} ring={currentCard?.node} />
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <span className="text-[21px] text-muted">
          {currentCard
            ? `現在講的是「${currentCard.name}」，右圖對應的那一格會亮起來。`
            : '四個角色，一次講一個。'}
        </span>
        <StepControls
          current={beat}
          total={ROLE_CARDS.length + 1}
          tone="backend"
          onPrev={() => setBeat((value) => Math.max(0, value - 1))}
          onNext={() => setBeat((value) => Math.min(ROLE_CARDS.length, value + 1))}
          onReset={() => setBeat(0)}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 17 頁 — FrontendDemo
 *
 * 左邊三段程式碼、右邊網頁預覽。逐段加上去，右邊跟著變：
 *   只有 HTML  → 沒有樣式的純結構
 *   加上 CSS   → 排版與顏色出現
 *   加上 JS    → 按鈕才真的會動
 *
 * 三個檔案框**全程都掛著**（沒加的顯示虛線與「尚未加入」），這樣切換
 * 時版面不會跳；真正沒掛的是裡面的程式碼本身。
 *
 * 預覽區用 bg-panel（最亮的表面）+ text-paper：網頁預設就是白底，
 * 這樣「無樣式」那一拍才有說服力。
 *
 * style.css 的按鈕顏色跟著畫面改成 `navy` / `white`：深色主題時代畫面上
 * 是亮藍底黑字，現在預覽裡是深藍底白字，程式碼要跟畫面對得上。
 * ══════════════════════════════════════════════════════════════ */

interface CodeFile {
  tone: Tone;
  filename: string;
  language: 'html' | 'css' | 'javascript';
  label: string;
  code: string;
}

const CODE_FILES: CodeFile[] = [
  {
    tone: 'html',
    filename: 'index.html',
    language: 'html',
    label: '結構：畫面上有哪些東西',
    code: `<div class="card">
  <p class="name">行李箱 28 吋</p>
  <button id="add">加入購物車</button>
</div>`,
  },
  {
    tone: 'css',
    filename: 'style.css',
    language: 'css',
    label: '樣式：這些東西長什麼樣子',
    code: `.card { border: 1px solid gray; border-radius: 12px; }
.name { font-size: 20px; font-weight: 600; }
button { background: navy; color: white; }
button:hover { opacity: 0.85; }`,
  },
  {
    tone: 'js',
    filename: 'main.js',
    language: 'javascript',
    label: '行為：點下去會發生什麼事',
    code: `const btn = document.getElementById('add');
btn.addEventListener('click', () => {
  cart.count = cart.count + 1;
});`,
  },
];

/**
 * 緊湊版的程式碼框。共用的 `CodeBlock` padding 比較寬鬆，
 * 三段疊起來會超過 584，所以這一頁自己排一份小的：
 * 檔名列 36 + py-3 的 24 + 4 行 × 27 = 168，框定 172。
 */
function MiniCode({ file, on }: { file: CodeFile; on: boolean }) {
  return (
    <div
      className={`flex h-[172px] shrink-0 flex-col overflow-hidden rounded-xl border ${
        on ? `${TONE_EDGE[file.tone]} bg-ink-soft` : 'border-dashed border-line bg-panel-lift'
      }`}
    >
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-line-soft px-4">
        <span className={`size-2.5 rounded-full ${on ? TONE_DOT[file.tone] : 'bg-line'}`} />
        <span className={`font-mono text-[17px] ${on ? TONE_TEXT[file.tone] : 'text-faint'}`}>
          {file.filename}
        </span>
        <span className="ml-auto text-[17px] text-faint">{on ? file.label : '尚未加入'}</span>
      </div>

      {on ? (
        <Highlight theme={codeTheme} code={file.code} language={file.language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} min-h-0 flex-1 px-4 py-3 text-[18px] leading-[1.5]`}
              style={style}
            >
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="text-[19px] text-faint">按上面那一排把它加進來</span>
        </div>
      )}
    </div>
  );
}

export function FrontendDemo() {
  /** 已經加進來幾個檔案，0–3 */
  const [level, setLevel] = useState(0);
  const [count, setCount] = useState(0);
  const [poked, setPoked] = useState(0);

  const hasJs = level >= 3;

  const handleAddToCart = () => {
    if (hasJs) {
      setCount((value) => value + 1);
    } else {
      setPoked((value) => value + 1);
    }
  };

  const pick = (next: number) => {
    setLevel(next);
    setCount(0);
    setPoked(0);
  };

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        {/* 左：三個檔案 */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex h-10 shrink-0 items-center gap-3">
            {CODE_FILES.map((file, index) => (
              <button
                key={file.filename}
                type="button"
                onClick={() => pick(index + 1)}
                className={`h-10 rounded-xl border px-4 font-mono text-[18px] transition-colors duration-200 ${
                  level >= index + 1 ? TONE_ON[file.tone] : `${CARD_OFF} text-paper`
                }`}
              >
                {file.filename}
              </button>
            ))}
            <button
              type="button"
              onClick={() => pick(0)}
              className={`ml-auto h-10 rounded-xl border px-4 text-[18px] transition-colors duration-200 ${GHOST_SKIN}`}
            >
              重來
            </button>
          </div>

          {CODE_FILES.map((file, index) => (
            <MiniCode key={file.filename} file={file} on={level >= index + 1} />
          ))}
        </div>

        {/* 右：網頁預覽 */}
        <BrowserFrame title="網頁預覽" className="h-full">
          <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl bg-panel p-8">
            {level === 0 && (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <span className="text-[22px] text-muted">還沒有任何檔案，畫面是空的</span>
              </div>
            )}

            {level >= 1 && (
              <>
                <div className="flex shrink-0 items-center justify-between">
                  <span className="text-[19px] text-muted">
                    {level === 1
                      ? '只有 HTML：有內容，但沒有排版'
                      : level === 2
                        ? '加上 CSS：排版與顏色出現了'
                        : '加上 JavaScript：按鈕開始有反應'}
                  </span>
                  <span className="rounded-full border border-line px-4 py-1 text-[19px] text-paper">
                    購物車 {count}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center">
                  {level === 1 ? (
                    <div className="w-full font-serif">
                      <p className="text-[24px] text-paper">行李箱 28 吋</p>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="mt-2 border border-faint bg-ink-soft px-3 py-1 font-serif text-[20px] text-paper"
                      >
                        加入購物車
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-[420px] rounded-xl border-2 border-line p-7">
                      <p className="text-[26px] font-semibold text-paper">行李箱 28 吋</p>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="mt-5 rounded-lg bg-role-client px-6 py-2.5 text-[21px] font-medium text-on-accent transition-opacity duration-200 hover:opacity-85"
                      >
                        加入購物車
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex h-9 shrink-0 items-center">
            {level >= 1 && level < 3 && poked > 0 && (
              <span className={`rounded-full border px-4 py-1 text-[18px] ${TONE_CHIP.danger}`}>
                按了沒有反應 —— 還沒加上 main.js，這顆按鈕還沒有行為
              </span>
            )}
            {hasJs && (
              <span className={`rounded-full border px-4 py-1 text-[18px] ${TONE_CHIP.js}`}>
                數字是 JavaScript 加的，重新整理就會歸零 —— 資料沒有存在任何地方
              </span>
            )}
          </div>
        </BrowserFrame>
      </div>

      {/* 底部不再重複三個檔案的標籤 —— 每個程式碼框的標題列已經寫過一次了 */}
      <div className="flex h-11 shrink-0 items-center">
        <span className="text-[21px] text-muted">
          這三個檔案都在你的瀏覽器裡執行，所以前端這一層不負責保存資料 —— 重新整理，剛剛加進購物車的數字就沒了。
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 18 頁 — ImageLoadDemo（這份簡報補的）
 *
 * Notion：「補一頁關於圖片的介紹 —— 圖片是一個獨立檔案，會透過連結載入」。
 * 接在第 17 頁後面，所以是同一個購物網站、同一個行李箱、同樣的檔案卡。
 *
 * 要講清楚的只有一件事：圖片不在 HTML 檔案裡面。index.html 只寫了一行
 * `<img src="images/luggage.jpg">`，瀏覽器讀到這一行，才**另外**向伺服器
 * 要那個圖片檔，圖片回來才出現在畫面上。
 *
 *   左  專案資料夾（圖片檔自己一格）＋ index.html（那一行被標出來）
 *   右  瀏覽器：上面是網頁，下面是「這個網頁向伺服器要了哪些檔案」
 *
 * 四拍：資料夾 → 先拿到 index.html（圖片框是空的）→ 讀到 src 再要一次
 *       → 圖片回來。程式碼框的標題列可以把 src 切成「寫錯路徑」
 *       （images → image），第四拍就會變成破圖與「找不到」。
 *
 * 檔名沿用第 17 頁的 index.html / style.css / main.js，兩頁才對得起來。
 * style.css 與 main.js 也列在請求清單裡：它們一樣是被 HTML 連過去、
 * 另外拿回來的檔案，只列圖片反而會讓人以為瀏覽器只發了兩次請求。
 *
 * 用色：html / css / js 三支語言色是第 17 頁的既有契約；圖片檔是 violet；
 * 寫錯路徑是 danger。瀏覽器框是 client 藍 —— 跟 lang-css 同一支色，不多算。
 *
 * 程式碼的標示列用 `bg-panel` + 6px 左粗條，不用淡色底：語法色在
 * ink-soft 上本來就只有 5.2–6.2:1，再疊一層淡色底，字串的松綠會掉到 4.5 以下。
 * ══════════════════════════════════════════════════════════════ */

type ImagePath = 'right' | 'wrong';

const IMAGE_SRC: Record<ImagePath, string> = {
  right: 'images/luggage.jpg',
  wrong: 'image/luggage.jpg',
};

/** 放在另一個網站上的圖片，示意用 */
const IMAGE_REMOTE = 'https://cdn.example.com/luggage.jpg';

interface ImageBeat {
  label: string;
  /** 路徑寫錯時換這一句；沒給就沿用 label */
  wrongLabel?: string;
}

const IMAGE_BEATS: ImageBeat[] = [
  { label: '圖片是一個獨立的檔案，放在專案資料夾的 images 裡。' },
  { label: '瀏覽器先拿到 index.html，圖片的位置只有一個框，裡面還是空的。' },
  {
    label: '讀到 <img src>，瀏覽器再另外向伺服器要 images/luggage.jpg。',
    wrongLabel: '讀到 <img src>，瀏覽器照著寫錯的路徑去要 image/luggage.jpg。',
  },
  {
    label: '圖片檔回來了，畫面才完整。',
    wrongLabel: '伺服器上沒有 image/luggage.jpg，畫面出現破圖 —— 路徑要對到檔案真正的位置。',
  },
];

/** 第 17 頁的三個檔案，這一頁只列名字 */
const TEXT_FILES: { tone: Tone; name: string; role: string }[] = [
  { tone: 'html', name: 'index.html', role: '結構' },
  { tone: 'css', name: 'style.css', role: '樣式' },
  { tone: 'js', name: 'main.js', role: '行為' },
];

/**
 * 左上：專案資料夾。三個文字檔一欄、images 資料夾一欄 ——
 * 圖片檔刻意自己佔半邊，畫面本身就在說「它是另一個檔案」。
 */
function ProjectFolder({ beat, wrong }: { beat: number; wrong: boolean }) {
  /** 第 1 拍（介紹資料夾）與「真的被要走」的那兩拍，圖片檔會亮起來 */
  const imageOn = beat === 0 || (beat >= 2 && !wrong);

  return (
    <div className="flex h-[250px] shrink-0 flex-col gap-4 rounded-2xl border border-line bg-panel-lift p-5">
      <div className="flex h-8 shrink-0 items-center gap-3">
        <RoleIcon id="folder" size={32} tone="host" />
        <span className="font-mono text-[20px] text-paper">my-shop/</span>
        <span className={`ml-auto ${LABEL_FAINT}`}>專案資料夾</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="flex min-h-0 flex-col gap-2">
          {TEXT_FILES.map((file) => {
            const on = beat === 1 && file.tone === 'html';
            return (
              <div
                key={file.name}
                className={`flex h-[48px] items-center gap-3 rounded-xl border border-l-[6px] px-4 transition-colors duration-300 ${
                  on ? `${TONE_EDGE[file.tone]} ${TONE_BAR[file.tone]} bg-panel` : 'border-line-soft border-l-line bg-panel'
                }`}
              >
                <span className={`size-2.5 shrink-0 rounded-full ${TONE_DOT[file.tone]}`} />
                <span className={`font-mono text-[19px] ${TONE_TEXT[file.tone]}`}>{file.name}</span>
                <span className="ml-auto text-[17px] text-faint">{file.role}</span>
              </div>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-col gap-3 rounded-xl border border-dashed border-violet/55 p-4">
          <div className="flex items-center gap-2">
            <RoleIcon id="folder" size={26} tone="img" />
            <span className="font-mono text-[19px] text-violet">images/</span>
          </div>
          <div
            className={`flex min-h-0 flex-1 items-center gap-4 rounded-xl border border-l-[6px] px-4 transition-colors duration-300 ${
              imageOn ? 'border-violet/55 border-l-violet bg-panel' : 'border-line-soft border-l-line bg-panel'
            }`}
          >
            <RoleIcon id="image" size={52} tone="img" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[19px] text-violet">luggage.jpg</span>
              <span className="text-[17px] text-muted">圖片檔，自己一個檔案</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const IMAGE_HTML = (src: string) => `<div class="card">
  <img src="${src}" alt="行李箱 28 吋">
  <p class="name">行李箱 28 吋</p>
  <button id="add">加入購物車</button>
</div>`;

/** `<img>` 在第幾行（0 起算） */
const IMG_LINE = 1;

/**
 * 左下：index.html。第 2 拍起把 `<img>` 那一行標出來，行尾掛一個
 * 「只是一個連結」—— 這一頁要台下記住的就是這一行。
 * 標題列右邊是「正確路徑 / 寫錯路徑」的切換。
 */
function ImageHtmlCode({
  beat,
  path,
  onPathChange,
}: {
  beat: number;
  path: ImagePath;
  onPathChange: (next: ImagePath) => void;
}) {
  const wrong = path === 'wrong';
  const mark: Tone = wrong ? 'danger' : 'img';
  const showMark = beat >= 1;

  const options: { id: ImagePath; label: string; on: string }[] = [
    { id: 'right', label: '正確路徑', on: 'bg-violet text-on-accent' },
    { id: 'wrong', label: '寫錯路徑', on: 'bg-danger text-on-accent' },
  ];

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-ink-soft ${TONE_EDGE.html}`}>
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line-soft px-4">
        <span className={`size-2.5 rounded-full ${TONE_DOT.html}`} />
        <span className={`font-mono text-[18px] ${TONE_TEXT.html}`}>index.html</span>
        <span className="ml-auto text-[17px] text-faint">src 寫成</span>
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onPathChange(option.id)}
              aria-pressed={option.id === path}
              className={`rounded-lg px-4 py-1 text-[17px] transition-colors duration-200 ${
                option.id === path ? option.on : 'text-muted hover:text-paper'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center">
        <Highlight theme={codeTheme} code={IMAGE_HTML(IMAGE_SRC[path])} language="html">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} w-full py-3 text-[20px] leading-[1.6]`} style={style}>
              {tokens.map((line, index) => {
                const lineProps = getLineProps({ line });
                const marked = showMark && index === IMG_LINE;
                return (
                  <div
                    key={index}
                    {...lineProps}
                    className={`${lineProps.className ?? ''} border-l-[6px] pr-4 pl-4 transition-colors duration-300 ${
                      marked ? `${TONE_BAR[mark]} bg-panel` : 'border-l-transparent'
                    }`}
                  >
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                    {marked && (
                      <span
                        className={`ml-4 inline-block rounded-full border px-3 align-middle font-sans text-[16px] leading-[1.6] ${TONE_CHIP[mark]}`}
                      >
                        ← 只是一個連結
                      </span>
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

/** 網頁上的圖片框。四種樣子：空框、取得中、圖片、破圖 */
function ImageSlot({ beat, wrong, src }: { beat: number; wrong: boolean; src: string }) {
  if (beat >= 3 && !wrong) {
    return (
      <div className="flex h-[160px] w-[250px] shrink-0 items-center justify-center rounded-lg border-2 border-violet bg-violet/14">
        <RoleIcon id="suitcase" size={120} tone="img" />
      </div>
    );
  }

  if (beat >= 3 && wrong) {
    return (
      <div className="flex h-[160px] w-[250px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-danger/55">
        <RoleIcon id="imageBroken" size={52} tone="danger" />
        <span className="text-[18px] text-muted">行李箱 28 吋</span>
        <span className="text-[16px] text-faint">載不到圖，只剩 alt 文字</span>
      </div>
    );
  }

  if (beat === 2) {
    return (
      <div className="flex h-[160px] w-[250px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-violet/55">
        <span className="text-[19px] text-violet">取得中…</span>
        <span className="font-mono text-[16px] text-faint">{src}</span>
      </div>
    );
  }

  return (
    <div className="flex h-[160px] w-[250px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line">
      <span className="text-[19px] text-muted">圖片的位置</span>
      <span className="text-[17px] text-faint">還是空的</span>
    </div>
  );
}

/** 請求清單的一列 */
function RequestRow({
  index,
  children,
  status,
}: {
  index: number;
  children: ReactNode;
  status: 'done' | 'pending' | 'failed';
}) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 rounded-lg bg-panel-lift px-3">
      <span className={`${STEP_BADGE} border-line bg-panel text-faint`}>{index}</span>
      <span className="flex min-w-0 items-center gap-2 font-mono text-[19px]">{children}</span>
      {status === 'done' && (
        <span className="ml-auto flex shrink-0 items-center gap-2 text-[18px] text-muted">
          <span className="text-paper">
            <CheckMark />
          </span>
          已取得
        </span>
      )}
      {status === 'pending' && <span className="ml-auto shrink-0 text-[18px] text-faint">取得中…</span>}
      {status === 'failed' && (
        <span className="ml-auto flex shrink-0 items-center gap-2 text-[18px] text-danger">
          <CrossMark />
          找不到檔案（404）
        </span>
      )}
    </div>
  );
}

export function ImageLoadDemo() {
  const [beat, setBeat] = useState(0);
  const [path, setPath] = useState<ImagePath>('right');
  const wrong = path === 'wrong';
  const src = IMAGE_SRC[path];
  const current = IMAGE_BEATS[beat];
  const label = wrong && current.wrongLabel ? current.wrongLabel : current.label;

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        {/* 左：專案資料夾 + index.html + 補充 */}
        <div className="flex min-h-0 flex-col gap-4">
          <ProjectFolder beat={beat} wrong={wrong} />
          <ImageHtmlCode beat={beat} path={path} onPathChange={setPath} />

          <div className="flex h-[68px] shrink-0">
            {!wrong && beat >= 2 && (
              <div className="flex flex-1 flex-col justify-center gap-0.5 rounded-xl border border-line bg-panel-lift px-5">
                <span className="text-[19px] text-muted">src 也可以是另一個網站的完整網址，例如</span>
                <span className="font-mono text-[18px] text-paper">{IMAGE_REMOTE}</span>
              </div>
            )}
            {wrong && beat >= 3 && (
              <div className="flex flex-1 flex-col justify-center gap-0.5 rounded-xl border border-l-[6px] border-danger/55 border-l-danger bg-panel px-5">
                <span className="text-[19px] text-paper">
                  資料夾叫 <span className="font-mono text-violet">images/</span>，src 卻寫成{' '}
                  <span className="font-mono text-danger">image/</span>
                </span>
                <span className="text-[19px] text-muted">少一個 s，伺服器就找不到這個檔案。</span>
              </div>
            )}
          </div>
        </div>

        {/* 右：瀏覽器 —— 上面是網頁，下面是它向伺服器要了哪些檔案 */}
        <BrowserFrame title="瀏覽器" className="h-full">
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl bg-panel p-5">
            {beat === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
                <RoleIcon id="browser" size={64} tone="net" muted />
                <span className="text-[20px] text-faint">還沒開始載入</span>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center justify-between">
                  <span className="text-[21px] font-semibold text-paper">shop.example</span>
                  <span className={`rounded-full border px-4 py-1 text-[17px] ${TONE_CHIP.client}`}>
                    購物車 0
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 items-center">
                  <div className="flex w-full items-center gap-6 rounded-xl border-2 border-line p-5">
                    <ImageSlot beat={beat} wrong={wrong} src={src} />
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[26px] font-semibold text-paper">行李箱 28 吋</span>
                      <span className={`text-[20px] ${TONE_TEXT.client}`}>NT$3,280</span>
                      <span className="mt-1 self-start rounded-lg bg-role-client px-5 py-2 text-[19px] font-medium text-on-accent">
                        加入購物車
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex h-[214px] shrink-0 flex-col gap-2 rounded-xl border border-line bg-panel px-5 py-3">
            <span className={`h-7 shrink-0 ${LABEL_FAINT}`}>這個網頁向伺服器要的檔案</span>
            {beat === 0 && (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <span className="text-[19px] text-faint">還沒有發出任何請求</span>
              </div>
            )}
            {beat >= 1 && (
              <RequestRow index={1} status="done">
                <span className={TONE_TEXT.html}>index.html</span>
              </RequestRow>
            )}
            {beat >= 1 && (
              <RequestRow index={2} status="done">
                <span className={TONE_TEXT.css}>style.css</span>
                <span className="font-sans text-faint">、</span>
                <span className={TONE_TEXT.js}>main.js</span>
              </RequestRow>
            )}
            {beat >= 2 && (
              <RequestRow index={3} status={beat === 2 ? 'pending' : wrong ? 'failed' : 'done'}>
                <span className={wrong ? 'text-danger' : 'text-violet'}>{src}</span>
              </RequestRow>
            )}
          </div>
        </BrowserFrame>
      </div>

      <BeatBar
        beat={beat}
        total={IMAGE_BEATS.length}
        tone="img"
        label={label}
        onPick={setBeat}
        onReset={() => {
          setBeat(0);
          setPath('right');
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 25 頁 — SiteArchDemo（這份簡報補的）
 *
 * Notion：「畫面上主要是介紹 how-websites-work 的第 2 頁（LoadDemo），
 * 網站開發中，它可以作為後端以及資料庫，並部署網站使用」。
 * 所以右邊回到第 15 頁那一張 ArchMap，伺服器那一圈改標成「ChatGPT Sites」。
 * 伺服器框維持中性色 —— 角色色的契約不因為換了名字而改變。
 *
 *   1 一般的網站：主機、後端、資料庫都要自己準備
 *   2 ChatGPT Sites 把主機、後端程式、資料庫（D1）、檔案儲存（R2）包在一起
 *   3 在 Codex 裡請它部署，拿到一個網址
 *   4 這堂課的網站是純靜態的，只用到主機；資料交給第三章的 Google 試算表
 *
 * 說法的依據是 2026-09-18 查證過的官方文件（learn.chatgpt.com/docs/sites、
 * OpenAI Academy）：Sites 是 ChatGPT 內建的託管服務，含主機、伺服器端程式、
 * D1 與 R2；純靜態網站只用到主機。網址中間那一段官方沒有定義規則，
 * 畫面上的名字全部是示意。
 *
 * 右下的事實卡是 public beta 的狀態，**會過期**，所以標了時間。
 * 上台前再確認一次方案與入口。
 * ══════════════════════════════════════════════════════════════ */

interface SiteBeat {
  label: string;
  /** 左欄清單的小標 */
  kicker: string;
  lit: ArchNode[];
  ring?: ArchNode;
  arrows: ArchArrow[];
  /** 伺服器框標成 ChatGPT Sites */
  sites: boolean;
}

const ALL_NODES: ArchNode[] = ['user', 'client', 'host', 'backend', 'db'];

const SITE_BEATS: SiteBeat[] = [
  {
    label: '一般的網站：除了前端，主機、後端、資料庫這些都要自己準備。',
    kicker: '一般的網站',
    lit: ALL_NODES,
    arrows: ['userToClient', 'clientToBackend', 'backendToDb', 'dbToBackend', 'backendToClient'],
    sites: false,
  },
  {
    label: 'ChatGPT Sites 是 OpenAI 在 ChatGPT 裡提供的託管服務，把這些包在一起。',
    kicker: 'ChatGPT Sites',
    lit: ALL_NODES,
    ring: 'host',
    arrows: [],
    sites: true,
  },
  {
    label: '在 Codex 裡請它部署，就會拿到一個網址。',
    kicker: 'ChatGPT Sites',
    lit: ALL_NODES,
    ring: 'client',
    arrows: ['userToClient', 'clientToBackend', 'backendToClient'],
    sites: true,
  },
  {
    label: '這堂課做的是純靜態網站，只用到 Sites 的主機；資料交給 Google 試算表。',
    kicker: '這堂課的網站',
    lit: ['user', 'client', 'host'],
    ring: 'host',
    arrows: [],
    sites: true,
  },
];

interface SiteService {
  id: string;
  icon: RoleIconId;
  tone: Tone;
  name: string;
  /** 一般網站時的說明 */
  plain: string;
  /** ChatGPT Sites 時的說明 */
  sites: string;
  /** 這堂課用不用得到 */
  course: 'use' | 'skip' | 'sheets';
}

const SITE_SERVICES: SiteService[] = [
  {
    id: 'host',
    icon: 'server',
    tone: 'host',
    name: '主機',
    plain: '一台一直開著的機器',
    sites: '託管網站，給你一個網址',
    course: 'use',
  },
  {
    id: 'backend',
    icon: 'code',
    tone: 'backend',
    name: '後端程式',
    plain: '處理邏輯的程式',
    sites: '可以執行伺服器端程式',
    course: 'skip',
  },
  {
    id: 'db',
    icon: 'database',
    tone: 'db',
    name: '資料庫',
    plain: '長期保存資料',
    sites: 'D1，與 SQLite 相容',
    course: 'sheets',
  },
  {
    id: 'files',
    icon: 'folder',
    tone: 'db',
    name: '檔案儲存',
    plain: '存放上傳的圖片與檔案',
    sites: 'R2，存放檔案',
    course: 'skip',
  },
];

/** 清單右邊的狀態標籤 */
function ServiceTag({ beat, course }: { beat: number; course: SiteService['course'] }) {
  const base = 'shrink-0 rounded-full border px-4 py-1 text-[18px]';

  if (beat === 0) {
    return <span className={`${base} border-line bg-panel text-muted`}>自己準備</span>;
  }
  if (beat < 3) {
    return <span className={`${base} ${TONE_PILL.host}`}>Sites 提供</span>;
  }
  if (course === 'use') {
    return (
      <span className={`${base} flex items-center gap-2 ${TONE_PILL.host}`}>
        <CheckMark />
        這堂課用到
      </span>
    );
  }
  if (course === 'sheets') {
    return <span className={`${base} ${TONE_CHIP.db}`}>改用 Google 試算表（第三章）</span>;
  }
  return <span className={`${base} border-line-soft bg-panel text-faint`}>這堂課不用</span>;
}

function ServiceRow({ beat, service }: { beat: number; service: SiteService }) {
  const skipped = beat === 3 && service.course === 'skip';
  const bar =
    beat === 0
      ? 'border-l-line'
      : beat < 3
        ? 'border-l-muted'
        : service.course === 'use'
          ? 'border-l-muted'
          : service.course === 'sheets'
            ? TONE_BAR.db
            : 'border-l-line';

  return (
    <div
      className={`flex h-[54px] shrink-0 items-center gap-4 rounded-xl border border-l-[6px] border-line bg-panel px-4 transition-colors duration-300 ${bar}`}
    >
      <RoleIcon id={service.icon} size={36} tone={service.tone} muted={skipped} />
      <span className={`w-[112px] shrink-0 text-[23px] font-semibold ${skipped ? 'text-muted' : 'text-paper'}`}>
        {service.name}
      </span>
      <span className={`min-w-0 truncate text-[19px] ${skipped ? 'text-faint' : 'text-muted'}`}>
        {beat === 0 ? service.plain : service.sites}
      </span>
      <span className="ml-auto" />
      <ServiceTag beat={beat} course={service.course} />
    </div>
  );
}

/** 事實卡的四列。public beta 的狀態，會過期 */
const SITE_FACTS: { label: string; value: string }[] = [
  { label: '狀態', value: '公開測試版（public beta）' },
  { label: '方案', value: 'Plus、Pro、Business、Enterprise、Edu' },
  { label: '入口', value: '桌面版的 Work、Codex，或網頁版的 Work' },
  { label: '觸發', value: '提示詞寫到「website」，或輸入 @Sites' },
];

export function SiteArchDemo() {
  const [beat, setBeat] = useState(0);
  const current = SITE_BEATS[beat];
  const deployed = beat >= 2;

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-4">
          {/* 要準備的四樣東西，四拍都在，只換說明與右邊的標籤 */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-line bg-panel-lift p-4">
            <span className={`h-7 shrink-0 ${LABEL_FAINT}`}>{current.kicker}</span>
            {SITE_SERVICES.map((service) => (
              <ServiceRow key={service.id} beat={beat} service={service} />
            ))}
          </div>

          {/* 網址：部署之後才有 */}
          <div
            className={`flex h-[84px] shrink-0 flex-col justify-center gap-1 rounded-xl border border-l-[6px] bg-panel px-5 transition-colors duration-300 ${
              beat === 2 ? 'border-role-client/55 border-l-role-client' : 'border-line border-l-line'
            }`}
          >
            {deployed ? (
              <>
                <div className="flex items-center gap-4">
                  <span className={`shrink-0 ${LABEL_FAINT}`}>網址</span>
                  <span className="truncate font-mono text-[21px] text-paper">
                    https://my-profile.yourname.chatgpt.site
                  </span>
                </div>
                <span className="text-[16px] text-faint">
                  格式是「網站名.帳號名.chatgpt.site」，這裡的名字是示意
                </span>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className={`shrink-0 ${LABEL_FAINT}`}>網址</span>
                <span className="text-[20px] text-faint">部署之後才會有網址</span>
              </div>
            )}
          </div>

          {/* 事實卡：會過期，所以時間標在最顯眼的位置 */}
          <div className="flex h-[204px] shrink-0 flex-col gap-1.5 rounded-2xl border border-line bg-panel px-5 py-4">
            <div className="flex h-8 shrink-0 items-center gap-3">
              <span className={LABEL_FAINT}>ChatGPT Sites 目前的狀態</span>
              <span className="ml-auto rounded-full border border-warn/55 bg-panel px-3 py-0.5 text-[16px] text-warn">
                2026-09 的狀態，之後可能改變
              </span>
            </div>
            {SITE_FACTS.map((fact) => (
              <div key={fact.label} className="flex h-[28px] shrink-0 items-baseline gap-4">
                <span className="w-[44px] shrink-0 text-[17px] text-faint">{fact.label}</span>
                <span className="truncate text-[20px] text-paper">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-line bg-panel-lift p-4">
          <ArchMap
            lit={current.lit}
            ring={current.ring}
            arrows={current.arrows}
            serverLabel={current.sites ? 'ChatGPT Sites' : '伺服器'}
          />
        </div>
      </div>

      <BeatBar
        beat={beat}
        total={SITE_BEATS.length}
        tone="client"
        label={current.label}
        onPick={setBeat}
        onReset={() => setBeat(0)}
      />
    </div>
  );
}
