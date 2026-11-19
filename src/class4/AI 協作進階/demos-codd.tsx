import { Fragment, useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第六章 近期的分享
 *
 *   第 41 頁  CoddDemo   遠端工具更新：CODD
 *
 * Notion「1013 修改」原文：
 *   「遠端工具更新 CODD：幫我提到這是先前課程所介紹的雲端管理工具。
 *    之前因為著重在 channel 的使用，現在發現它也很適合用在雲端的開發，
 *    所以特別強化了 session 管理的功能。」
 * 原文附了一張講師的實際截圖。截圖上有帳號、學生的姓名與作業、私人路徑，
 * 所以這頁不貼截圖，改用簡報的亮色色票重畫一個「可以操作」的介面示意。
 *
 * 跟前後頁的關係：
 *   第 40 頁是第六章的章節頁，這是第六章的第一頁；第 42 頁接 GitHub Projects 看板。
 *   第 36 頁介紹過 Channels（事件推進正在跑的 session），先前課程的 CODD 就是
 *   以 Channel 為主；這次的更新把重心移到 session 管理。
 *   「一眼看到誰在等你」呼應第五章 Loop Engineering 談的「人什麼時候該介入」
 *   （第 29 頁「人只在最後出現」、第 30 頁「你介入了 N 次」）。第五章沒有一頁
 *   叫這個標題，所以畫面上不加引號，免得看起來像在引某一頁。
 *
 * 版型（同第 34、36 頁的「左邊選項、右邊情境」）：
 *   左  接續卡（Notion 的意思：先前課程 → 之前著重 Channel → 現在強化 session 管理）
 *       ＋ 四個區塊的選單。
 *   右  區塊卡：標題列（區塊編號＋播放／下一步）→ CODD 的介面示意 → 一句說明＋小字補充。
 *       選到哪一個區塊，介面示意上那一區就用 acid 外框標出來。
 *   介面示意本身也能操作：
 *     - 點側欄的 session，右邊主區換成那個 session 的終端機。
 *     - api 那個 session 停在 WAITING，終端機是一個權限確認；按按鍵列的「1」
 *       → 跳到「02 一眼看到誰在等你」，從「按下 1」開始播：BUSY → IDLE。
 *       在 02 裡直接按「1」也一樣。播完可以按「重播」，不會卡住。
 *     - 02 播放中點了別的 session，故事先停下來（人接手）；再按播放／下一步會切回 api。
 *   播放規則同第 34、36 頁：一進頁面停在播完的畫面；在左欄點了別的選項就從頭自動播。
 *   一進頁面是 01 的最後一格：api 已被拖到最上面、亮著 WAITING，主區是它的權限確認。
 *   02–04 沿用拖曳後的順序（api 在最上面）：01 才講過「順序存在 server、各裝置一致」，
 *   換個區塊就跳回原本的順序會自相矛盾。只有 01 從頭播時才回到拖曳前的順序。
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-13 查的，來源是講師的專案文件：CODD 的 README、
 * 2026-10-13 那次更新的說明，以及介面元件的原始碼；原文照引）
 * ──────────────────────────────────────────────────────────────
 * 名稱
 *   - README 標題「Fancy CODD — Claude Code Channel Manager」；網頁左上角的品牌字
 *     「FANCY/CODD」。CODD 是什麼的縮寫，文件與程式碼都沒有寫，畫面上不寫展開。
 * 架在哪裡、怎麼連進來
 *   - README：「對外只開一個 Cloudflare named tunnel，Google ID Token 認證」；
 *     hooks 要裝在「跑 server 的那台機器（Mac mini）」。講師的課程筆記也寫
 *     「我是放在家用的 Mac mini」。→ 左欄接續卡最後一行。
 * 先前課程
 *   - 先前那堂課的主軸是 Channel：Telegram／Discord 的 Channel Plugin（本質是
 *     MCP Server）把訊息推進常駐在主機上的 Claude Code session。課程筆記的
 *     「CODD 概念」段落：一定要用 Cloudflare Tunnel、要加 Google OAuth 與
 *     Cloudflare Zero Trust 多層保護。
 * 這次更新（2026-10-13）
 *   01 Session 側欄
 *     「左側欄列出這個 app 開的 session：標題（Claude Code 的 session 名稱 / ai-title）、
 *       路徑、狀態燈（WAITING / BUSY / IDLE）、在此狀態多久與運行時間；
 *       hover 顯示最近一次 prompt」
 *     「可拖曳調整順序（桌機整列拖、觸控用左側把手、鍵盤 Alt+Shift+↑↓），
 *       順序存在 server，各裝置一致」
 *     「IDENTITY / SKILLS / AGENTS / TASKS / MEMORY / KANBAN 收進可收合的 WORKSPACE」；
 *     已停止的 session 收在 STOPPED（最多列 12 筆，其餘連到 ALL SESSIONS）。
 *   02 一眼看到誰在等你
 *     WAITING 由 hooks 判斷，原因分三種：權限請求（permission）、
 *     AskUserQuestion（question）、ExitPlanMode（plan）。
 *   03 主機與用量
 *     「左下角裝置狀態：CPU、記憶體（含壓力）、磁碟、swap、電池；
 *       Claude Code 5h / 1w 剩餘用量與重置時間」。區塊標籤是 HOST 與「USAGE 剩餘」。
 *     終端機上方的 CTX 是 context 剩餘百分比（statusline 的
 *     context_window.remaining_percentage）；UP 是運行時間（結束後改成 RAN）。
 *   04 手機也能操作
 *     「session 頁終端機佔滿右側，字級可調、專注模式；手機有 drawer、
 *       按鍵列與輸入框（注音選字不誤送）」
 *     按鍵列的註解：「手機鍵盤打不出來、但 Claude Code 常用的按鍵」——
 *     ESC、TAB、⇧TAB（Shift+Tab，切換模式）、方向鍵、Enter、^C、1、2、3。
 *     輸入框在桌機的提示文字是「訊息 · Enter 送出 · ⇧Enter 換行」（觸控裝置是
 *     「輸入訊息…」）。講師的截圖是桌機畫面，按鍵列在桌機上也看得到。
 *     「PTY 尺寸跟著最後操作的裝置走，其他裝置可一鍵接管」；提示文字是
 *     「◇ 跟隨其他裝置的尺寸 {cols}×{rows} · 點此接管」。
 *   狀態怎麼來（底部小字）
 *     「user-level hooks + statusLine 包裝（保留原本的 statusline）」；
 *     「/setup 引導安裝：先預覽變更、備份、可完整移除」；
 *     「沒收到 hook 回報的 claude session 顯示「NO HOOK」提示」。
 *     更新說明把狀態與用量放在同一條（hooks ＋ statusLine 包裝），沒有拆開說用量
 *     只走哪一條，所以 03 的小字寫「hooks 加 statusline」；CTX 確定來自 statusline 的
 *     context_window.remaining_percentage。NO HOOK 照原文寫「沒收到 hook 回報」。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 三個 session 全是虛構的：shop：結帳頁改版、blog：週報文章、api：修 CI，
 *     路徑 ~/projects/…、狀態、兩個時間、CTX 百分比都是編的。STOPPED (2) 的數字也是。
 *   - 終端機的內容（你打的那句、工具呼叫、結果、spinner 的秒數）都是編的。
 *     權限確認框簡化成五行（Bash(npm test)／Do you want to proceed?／1 Yes／
 *     2 Yes, and don't ask again／3 No），實際 Claude Code 的畫面字更多。
 *   - 按下 1 之後的 BUSY → IDLE、「24 passed」、「要我開 PR 嗎？」是示意的流程。
 *   - HOST 與 USAGE 的數字、開機時間、重置時間；◆ 1（等待中的數量）照截圖的樣子。
 *   - 拖曳的情境（把 api 拉到最上面）；注音選字的「順便更新文件」；
 *     「跟隨其他裝置的尺寸 46×30」的尺寸。
 *   - 狀態燈的形狀：截圖裡 WAITING 是 ◆、IDLE 是 ○；BUSY 截圖沒有，補成實心 ●。
 *   - 版面比例、字級、顏色都是為了投影重畫的，不是 CODD 的實際樣式（實際是深色）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid   選單選取；介面示意上目前區塊的外框；目前這一步（被拖曳的那一列、
 *          按下的「1」、時間欄、STOPPED／WORKSPACE）；接續卡的「所以」那一列。
 *   amber  WAITING：側欄的 ◆ 燈與實心標籤、「◆ 1」、主區標題旁的狀態標籤。
 *          一律是實心填色＋文字標籤，不靠淡色。
 *   BUSY／IDLE 不另佔強調色：BUSY ＝ paper 實心燈＋paper 實框標籤；
 *   IDLE ＝ muted 空心燈＋line 細框標籤，靠文字分辨。其他一律中性色。
 *   被選到的 session 列用 bg-panel ＋ 4px paper 左粗條（中性），不用 acid ——
 *   acid 留給「這一區是現在講的重點」。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬度：左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）。
 *       介面示意 1102（外框 2 ＋ 2）＝ 側欄 324 ＋ 主區 774。
 * 左欄：接續卡 ≈ 2 ＋ py 24 ＋ 標籤 26 ＋ 8 ＋ 三列 3 × 26 ＋ 2 × 4 ＋ 8 ＋ 小字兩行 9 ＋ 50
 *       ≈ 213，gap 12，四張選單 (720 − 213 − 12 − 36) ÷ 4 ≈ 115／張；
 *       選單內容 ＝ py 24 ＋ 名稱 35 ＋ 6 ＋ 說明一行 26 ≈ 91，放得下（說明都控制在一行）。
 * 右卡：內高 720 − 2 − 48 ＝ 670 ＝ 標題列 48 ＋ 12 ＋ 介面示意 514 ＋ 12 ＋ 說明卡 84。
 *   介面示意內高 510：
 *     側欄 ＝ py 12 ＋ 品牌列 28 ＋ 6 ＋ session 區（p 12 ＋ 標題 28 ＋ 4 ＋ 三列 172
 *            ＋ 4 ＋ STOPPED 26 ＋ WORKSPACE 26 ＝ 272）＋ mt-auto
 *            ＋ HOST 86 ＋ 6 ＋ USAGE 86 ≈ 496。
 *     主區 ＝ 標題列 70 ＋ 終端機（flex-1）＋ 按鍵列 6 ＋ 52 ＋ 輸入列 4 ＋ 56 ＋ 8；
 *            終端機 ≈ 314，扣 py 24 剩 290。終端機字級 18（程式碼的下限），
 *            行高 1.45 ＝ 26.1。最高的是 api 的權限確認：
 *            四行 4 × 26.1 ＋ 6 ＋ 確認框（py 12 ＋ 框 4 ＋ py 12 ＋ 五行 130.5）≈ 269。
 * 實測（2026-10-13，無頭 Chrome 1920×1080，dev server）：
 *   根容器 1740 × 720；接續卡 216、四張選單各 114（內容 67，餘 23）。
 *   右卡：標題列 48 → 介面示意 514 → 說明卡 84，說明卡下緣剛好落在卡片內緣。
 *   側欄：session 區 272、HOST＋USAGE 178，中間 mt-auto 剩 14（最緊的一處）。
 *   主區：終端機 314（字級 18）；api 權限確認的下緣離終端機內緣 21，
 *         IDLE 那四行 63，shop 七行 107。按鍵列寬 624（w-fit，外框只包住按鍵）。
 *   四個區塊每一格都跑過 audit-slides：overflow／contrast／超出 main／子元素擠出 全部 0。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger-more.tsx，不 import 那個檔案）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110 disabled:border-line disabled:bg-ink-soft disabled:font-normal disabled:text-faint`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:border-line-soft disabled:text-faint`;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 播放器（同第 34、36 頁的 usePlayer，多了 start 與 jump）──────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 start 開始自動播（在左欄點了別的選項時 start ＝ 0；
 *          在別的區塊按了「1」跳過來時 start ＝ 1，也就是「按下 1」那一格）
 * jump：在 02 裡直接按「1」，跳到那一格並繼續播。
 * 區塊卡用區塊 id 當 key，換區塊就整張重掛，狀態自然歸零。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode, start = 0) {
  const [tick, setTick] = useState(mode === 'still' ? last : Math.min(start, last));
  const [playing, setPlaying] = useState(mode === 'play');

  const atEnd = tick >= last;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setTick((value) => Math.min(value + 1, last)),
      ms,
    );
    return () => window.clearTimeout(timer);
  }, [running, tick, last, ms]);

  const toggle = () => {
    if (atEnd) {
      setTick(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const step = () => {
    setPlaying(false);
    setTick((value) => Math.min(value + 1, last));
  };

  const jump = (to: number) => {
    setTick(Math.min(to, last));
    setPlaying(true);
  };

  const pause = () => setPlaying(false);

  const label = running ? '暫停' : atEnd ? '重播' : tick === 0 ? '播放' : '繼續';

  return { tick, atEnd, toggle, step, jump, pause, label };
}

type Player = ReturnType<typeof usePlayer>;

function PlayerControls({ player }: { player: Player }) {
  return (
    <div className="ml-auto flex shrink-0 gap-3">
      <button type="button" onClick={player.toggle} className={BTN_PRIMARY}>
        {player.label}
      </button>
      <button
        type="button"
        onClick={player.step}
        disabled={player.atEnd}
        className={BTN_GHOST}
      >
        下一步
      </button>
    </div>
  );
}

/** 左側選單的一列（同第 39 頁的 MenuItem，沒有 chips，撐滿高度） */
function MenuItem({
  index,
  name,
  sub,
  on,
  onClick,
}: {
  index: number;
  name: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-3 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {name}
        </span>
        <span
          className={`text-[19px] leading-snug whitespace-nowrap ${on ? 'text-paper' : 'text-muted'}`}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

/* ── 接續先前課程：Notion 那段話的三個轉折 ─────────────────
 * 兩欄 max-content／1fr。19px 下最長的「發現它也很適合用在雲端開發」約 250，
 * 卡片內寬 540 − 2 − 6 − 40 ＝ 492，放得下；最後一行小字 18px 約兩行。 */

const BRIDGE: readonly { tag: string; text: string; on?: boolean }[] = [
  { tag: '之前', text: '著重在 Channel 的使用' },
  { tag: '現在', text: '發現它也很適合用在雲端開發' },
  { tag: '所以', text: '特別強化了 session 管理', on: true },
];

function BridgeCard() {
  return (
    <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-5 py-3">
      <span className={LABEL_FAINT}>先前課程介紹過的雲端管理工具</span>
      <div className="grid grid-cols-[max-content_1fr] items-baseline gap-x-4 gap-y-1 text-[19px] leading-snug">
        {BRIDGE.map((row) => (
          <Fragment key={row.tag}>
            <span className={row.on ? 'font-semibold text-acid' : 'text-faint'}>{row.tag}</span>
            <span className={row.on ? 'font-semibold text-acid' : 'text-paper'}>{row.text}</span>
          </Fragment>
        ))}
      </div>
      <p className="mt-1 border-t border-line-soft pt-2 text-[18px] leading-snug text-muted">
        架在自己家裡的 Mac mini，透過 Cloudflare Tunnel
        <br />
        加 Google 登入，從外面連進來。
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 介面示意的資料
 * ══════════════════════════════════════════════════════════════ */

type SessionId = 'shop' | 'blog' | 'api';
type Status = 'waiting' | 'busy' | 'idle';

/** api 那個 session 在 02 的故事裡走的四格 */
type ApiPhase = 'waiting' | 'pressed' | 'busy' | 'idle';

type LineKind = 'you' | 'tool' | 'out' | 'say' | 'spin';

interface Line {
  kind: LineKind;
  text: string;
}

interface Session {
  id: SessionId;
  name: string;
  path: string;
  status: Status;
  /** 在目前這個狀態待了多久 */
  inState: string;
  /** 總共跑了多久（UP） */
  up: string;
  /** context 剩餘 % */
  ctx: number;
  lines: readonly Line[];
}

const SESSIONS: Record<SessionId, Session> = {
  shop: {
    id: 'shop',
    name: 'shop：結帳頁改版',
    path: '~/projects/shop',
    status: 'busy',
    inState: '3m',
    up: '1h12m',
    ctx: 38,
    lines: [
      { kind: 'you', text: '結帳頁改成兩欄，右邊放訂單摘要' },
      { kind: 'tool', text: 'Read(src/pages/Checkout.vue)' },
      { kind: 'tool', text: 'Update(src/pages/Checkout.vue)' },
      { kind: 'out', text: '改成 grid 兩欄，摘要卡固定在右側' },
      { kind: 'tool', text: 'Bash(npm run build)' },
      { kind: 'out', text: 'Running…' },
      { kind: 'spin', text: 'Working… (3m 12s · esc to interrupt)' },
    ],
  },
  blog: {
    id: 'blog',
    name: 'blog：週報文章',
    path: '~/projects/blog',
    status: 'idle',
    inState: '18m',
    up: '46m',
    ctx: 81,
    lines: [
      { kind: 'you', text: '把這週的更新整理成週報' },
      { kind: 'tool', text: 'Read(CHANGELOG.md)' },
      { kind: 'tool', text: 'Write(posts/weekly-41.md)' },
      { kind: 'out', text: '新功能 3 項、修正 5 項' },
      { kind: 'say', text: '週報草稿寫好了，要不要調整語氣？' },
      { kind: 'spin', text: 'Worked for 2m 8s' },
    ],
  },
  api: {
    id: 'api',
    name: 'api：修 CI',
    path: '~/projects/api',
    status: 'waiting',
    inState: '2m',
    up: '41m',
    ctx: 64,
    lines: [
      { kind: 'you', text: 'CI 上的測試一直紅，幫我看一下' },
      { kind: 'tool', text: 'Read(.github/workflows/ci.yml)' },
      { kind: 'tool', text: 'Update(src/utils/date.ts)' },
      { kind: 'out', text: '時區轉換少一行，補上了' },
    ],
  },
};

/** api 在按下 1 之後接著印出來的幾行 */
const API_TAIL: Record<'busy' | 'idle', readonly Line[]> = {
  busy: [
    { kind: 'tool', text: 'Bash(npm test)' },
    { kind: 'out', text: 'Running…' },
    { kind: 'spin', text: 'Working… (6s · esc to interrupt)' },
  ],
  idle: [
    { kind: 'tool', text: 'Bash(npm test)' },
    { kind: 'out', text: '24 passed' },
    { kind: 'say', text: '測試都過了，CI 修好了。要我開 PR 嗎？' },
    { kind: 'spin', text: 'Worked for 1m 6s' },
  ],
};

function sessionAt(id: SessionId, phase: ApiPhase): Session {
  const base = SESSIONS[id];
  if (id !== 'api') return base;
  if (phase === 'busy') return { ...base, status: 'busy', inState: '6s' };
  if (phase === 'idle') return { ...base, status: 'idle', inState: '2s', up: '42m', ctx: 61 };
  return base;
}

const BASE_ORDER: readonly SessionId[] = ['shop', 'blog', 'api'];
const DRAGGED_ORDER: readonly SessionId[] = ['api', 'shop', 'blog'];

const STATUS_LABEL: Record<Status, string> = {
  waiting: 'WAITING',
  busy: 'BUSY',
  idle: 'IDLE',
};

const KEYS = ['ESC', 'TAB', '⇧TAB', '↑', '↓', '←', '→', '⏎', '^C', '1', '2', '3'] as const;

const USAGE_ROWS: readonly { span: string; left: number; reset: string }[] = [
  { span: '5h', left: 82, reset: '19:30' },
  { span: '1w', left: 61, reset: '週五 23:00' },
];

/* ── 介面示意的小零件 ───────────────────────────────────── */

const MOCK_LABEL = 'font-mono text-[16px] tracking-[0.12em] uppercase';
const KEY =
  'flex h-10 min-w-11 items-center justify-center rounded-md border px-2 font-mono text-[16px] transition-colors duration-200';

/** 區塊外框：疊在區塊上面的 acid 框，用 opacity 淡入淡出（不影響排版） */
function Focus({
  on,
  dashed = false,
  className = 'inset-0',
}: {
  on: boolean;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-lg border-acid transition-opacity duration-300 ${
        dashed ? 'border-2 border-dashed' : 'border-[3px]'
      } ${className} ${on ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

/** 狀態燈：WAITING ◆ amber、BUSY ● 實心、IDLE ○ 空心 */
function Lamp({ status }: { status: Status }) {
  if (status === 'waiting') {
    return <span aria-hidden="true" className="size-3 shrink-0 rotate-45 bg-amber" />;
  }
  if (status === 'busy') {
    return <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-paper" />;
  }
  return <span aria-hidden="true" className="size-3 shrink-0 rounded-full border-2 border-muted" />;
}

/** 狀態標籤：一定有文字，不靠顏色分辨 */
function StatusTag({ status, extra }: { status: Status; extra?: string }) {
  const tone =
    status === 'waiting'
      ? 'border-amber bg-amber font-semibold text-on-accent'
      : status === 'busy'
        ? 'border-paper text-paper'
        : 'border-line text-muted';
  return (
    <span
      className={`flex h-6 shrink-0 items-center rounded border px-1.5 font-mono text-[16px] leading-none whitespace-nowrap ${tone}`}
    >
      {extra ? `${STATUS_LABEL[status]} · ${extra}` : STATUS_LABEL[status]}
    </span>
  );
}

function SessionRow({
  session,
  top,
  selected,
  focus,
  dragged,
  timesOn,
  onSelect,
}: {
  session: Session;
  top: number;
  selected: boolean;
  focus: boolean;
  dragged: boolean;
  timesOn: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={`最近一次 prompt：${session.lines[0].text}`}
      style={{ top }}
      className={`absolute inset-x-0 flex h-14 flex-col justify-center gap-0.5 rounded-md border-l-4 px-3 text-left transition-[top,background-color] duration-500 ease-out ${
        selected ? 'border-l-paper bg-panel' : 'border-l-transparent hover:bg-panel'
      }`}
    >
      <span className="flex w-full items-center gap-2">
        <Lamp status={session.status} />
        <span className="min-w-0 flex-1 text-[18px] leading-6 whitespace-nowrap text-paper">
          {session.name}
        </span>
        <StatusTag status={session.status} />
      </span>
      <span className="flex w-full items-center justify-between gap-2 font-mono text-[16px] leading-[22px] whitespace-nowrap">
        <span className="text-muted">{session.path}</span>
        <span
          className={`transition-colors duration-300 ${timesOn ? 'font-semibold text-acid' : 'text-muted'}`}
        >
          {session.inState} · {session.up}
        </span>
      </span>
      <Focus on={focus} />
      <Focus on={dragged} dashed />
    </button>
  );
}

function TermLine({ line }: { line: Line }) {
  if (line.kind === 'you') {
    return (
      <p className="whitespace-pre text-paper">
        <span className="text-muted">{'> '}</span>
        {line.text}
      </p>
    );
  }
  if (line.kind === 'out') {
    return <p className="whitespace-pre text-muted">{`  ⎿ ${line.text}`}</p>;
  }
  if (line.kind === 'spin') {
    return <p className="whitespace-pre text-faint">{`✻ ${line.text}`}</p>;
  }
  return <p className="whitespace-pre text-paper">{`● ${line.text}`}</p>;
}

/** Claude Code 的權限確認（簡化成五行） */
function PermissionBox({ pressed }: { pressed: boolean }) {
  return (
    <div className="rounded-lg border-2 border-line bg-panel px-4 py-1.5">
      <p className="font-semibold text-paper">Bash(npm test)</p>
      <p className="text-paper">Do you want to proceed?</p>
      <p
        className={`whitespace-pre transition-colors duration-200 ${
          pressed ? 'font-semibold text-acid' : 'text-paper'
        }`}
      >
        ❯ 1. Yes
      </p>
      <p className="whitespace-pre text-muted">{"  2. Yes, and don't ask again"}</p>
      <p className="whitespace-pre text-muted">{'  3. No'}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 介面示意本體
 * 外框 1102 × 514（border 2）：側欄 324 ＋ 主區 774。
 * ══════════════════════════════════════════════════════════════ */

interface MockFlags {
  /** 01：整個 session 清單 */
  list: boolean;
  /** 01 第 2 格：兩個時間 */
  times: boolean;
  /** 01 第 3 格：STOPPED、WORKSPACE */
  folds: boolean;
  /** 01 第 4 格：被拖曳的那一列 */
  dragged: SessionId | null;
  /** 02：api 那一列＋終端機最後那一塊 */
  waiting: boolean;
  /** 03：HOST／USAGE／CTX，依序亮起 */
  host: boolean;
  usage: boolean;
  ctx: boolean;
  /** 04：按鍵列／輸入框／接管提示，依序亮起 */
  keys: boolean;
  input: boolean;
  banner: boolean;
}

type InputState = 'empty' | 'composing' | 'composed';

function CoddMock({
  flags,
  phase,
  order,
  selected,
  onSelect,
  onKeyOne,
  inputState,
}: {
  flags: MockFlags;
  phase: ApiPhase;
  order: readonly SessionId[];
  selected: SessionId;
  onSelect: (id: SessionId) => void;
  onKeyOne: () => void;
  inputState: InputState;
}) {
  const current = sessionAt(selected, phase);
  const api = sessionAt('api', phase);
  const waitingCount = api.status === 'waiting' ? 1 : 0;
  const showPrompt = selected === 'api' && (phase === 'waiting' || phase === 'pressed');
  const keyOneReady = selected === 'api' && phase === 'waiting';

  let keyOneClass = `${KEY} border-line bg-panel text-paper`;
  if (selected === 'api' && phase === 'pressed') {
    keyOneClass = `${KEY} border-acid bg-acid font-semibold text-on-accent`;
  } else if (keyOneReady && flags.waiting) {
    keyOneClass = `${KEY} border-acid bg-panel font-semibold text-acid ring-1 ring-acid hover:bg-acid/14`;
  } else if (keyOneReady) {
    keyOneClass = `${KEY} border-line bg-panel text-paper hover:border-acid hover:text-acid`;
  }

  let tail: readonly Line[] = [];
  if (selected === 'api' && (phase === 'busy' || phase === 'idle')) tail = API_TAIL[phase];

  return (
    <div className="grid h-[514px] shrink-0 grid-cols-[324px_1fr] overflow-hidden rounded-xl border-2 border-line bg-panel">
      {/* ── 側欄 ───────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col border-r border-line bg-panel-lift px-3 py-1.5">
        <div className="flex h-7 shrink-0 items-center justify-between px-1">
          <span className="font-mono text-[19px] font-bold tracking-[0.06em] text-paper">
            FANCY/CODD
          </span>
          <span className="rounded-md border border-line px-2 font-mono text-[16px] leading-[26px] text-muted">
            + NEW
          </span>
        </div>

        {/* SESSIONS ＋ STOPPED ＋ WORKSPACE */}
        <div className="relative mt-1.5 shrink-0 rounded-lg p-1.5">
          <div className="flex h-7 items-center justify-between px-1">
            <span className={`${MOCK_LABEL} text-faint`}>Sessions 3</span>
            {waitingCount > 0 && (
              <span className="flex h-6 items-center gap-1.5 rounded bg-amber px-2 font-mono text-[16px] leading-none font-semibold text-on-accent">
                ◆ {waitingCount}
              </span>
            )}
          </div>
          <div className="relative mt-1 h-[172px]">
            {BASE_ORDER.map((id) => (
              <SessionRow
                key={id}
                session={sessionAt(id, phase)}
                top={order.indexOf(id) * 58}
                selected={selected === id}
                focus={flags.waiting && id === 'api'}
                dragged={flags.dragged === id}
                timesOn={flags.times}
                onSelect={() => onSelect(id)}
              />
            ))}
          </div>
          {(['STOPPED (2)', 'WORKSPACE'] as const).map((label) => (
            <div
              key={label}
              className={`flex h-[26px] items-center gap-2 px-1 transition-colors duration-300 ${MOCK_LABEL} ${
                flags.folds ? 'font-semibold text-acid' : 'text-faint'
              } ${label === 'WORKSPACE' ? '' : 'mt-1'}`}
            >
              <span aria-hidden="true">▸</span>
              {label}
            </div>
          ))}
          <Focus on={flags.list} />
        </div>

        {/* HOST ＋ USAGE */}
        <div className="mt-auto flex shrink-0 flex-col gap-1.5">
          <div className="relative flex flex-col gap-0.5 rounded-lg px-1.5 py-2 font-mono text-[16px] leading-[22px]">
            <div className="flex items-center justify-between px-1.5">
              <span className={`${MOCK_LABEL} text-faint`}>Host</span>
              <span className="text-muted">up 12d 3h</span>
            </div>
            <div className="flex justify-between px-1.5">
              <span>
                <span className="text-faint">CPU</span> <span className="text-paper">23%</span>
              </span>
              <span>
                <span className="text-faint">MEM</span> <span className="text-paper">9/16G</span>
              </span>
            </div>
            <div className="flex justify-between px-1.5">
              <span>
                <span className="text-faint">DISK</span>{' '}
                <span className="text-paper">182G free</span>
              </span>
              <span>
                <span className="text-faint">SWAP</span> <span className="text-paper">1.2G</span>
              </span>
            </div>
            <Focus on={flags.host} />
          </div>

          <div className="relative flex flex-col gap-0.5 rounded-lg px-1.5 py-2 font-mono text-[16px] leading-[22px]">
            <div className="flex items-center justify-between px-1.5">
              <span className={`${MOCK_LABEL} text-faint`}>Usage 剩餘</span>
              <span className="text-muted">重置</span>
            </div>
            {USAGE_ROWS.map((row) => (
              <div
                key={row.span}
                className="grid grid-cols-[24px_1fr_40px_max-content] items-center gap-2 px-1.5"
              >
                <span className="text-faint">{row.span}</span>
                <span className="h-2 rounded-full bg-line-soft">
                  <span
                    className="block h-2 rounded-full bg-muted"
                    style={{ width: `${row.left}%` }}
                  />
                </span>
                <span className="text-right text-paper">{row.left}%</span>
                <span className="text-muted">{row.reset}</span>
              </div>
            ))}
            <Focus on={flags.usage} />
          </div>
        </div>
      </div>

      {/* ── 主區 ───────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col">
        {/* session 標題列 */}
        <div className="flex h-[70px] shrink-0 items-center gap-4 border-b border-line px-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <Lamp status={current.status} />
              <span className="text-[22px] leading-[30px] font-semibold whitespace-nowrap text-paper">
                {current.name}
              </span>
              <StatusTag status={current.status} extra={current.inState} />
            </div>
            <div className="flex items-center gap-2 font-mono text-[16px] leading-[22px] whitespace-nowrap text-muted">
              <span>{current.path}</span>
              <span aria-hidden="true">·</span>
              <span>UP {current.up}</span>
              <span aria-hidden="true">·</span>
              <span className="relative rounded-md px-2 py-0.5 text-paper">
                CTX {current.ctx}%
                <Focus on={flags.ctx} className="inset-0 rounded-md" />
              </span>
            </div>
          </div>
          {flags.banner && (
            <span className="relative ml-auto flex h-11 shrink-0 items-center rounded-lg border-2 border-dashed border-line px-3 text-[16px] whitespace-nowrap text-paper">
              ◇ 跟隨其他裝置的尺寸 46×30 · 點此接管
              <Focus on className="-inset-1.5" />
            </span>
          )}
        </div>

        {/* 終端機 */}
        <div className="flex min-h-0 flex-1 flex-col bg-ink-soft px-5 py-3 font-mono text-[18px] leading-[1.45]">
          {current.lines.map((line, index) => (
            <TermLine key={`${current.id}-${index}`} line={line} />
          ))}
          {selected === 'api' && (
            <div className="relative -mx-3 mt-1.5 rounded-lg px-3 py-1.5">
              {showPrompt ? (
                <PermissionBox pressed={phase === 'pressed'} />
              ) : (
                tail.map((line, index) => <TermLine key={`tail-${index}`} line={line} />)
              )}
              <Focus on={flags.waiting} />
            </div>
          )}
        </div>

        {/* 按鍵列（w-fit：外框只包住按鍵） */}
        <div className="relative mx-3 mt-1.5 flex w-fit shrink-0 items-center gap-1.5 rounded-lg p-1.5">
          {KEYS.map((key) =>
            key === '1' ? (
              <button
                key={key}
                type="button"
                onClick={onKeyOne}
                disabled={!keyOneReady}
                aria-label="按鍵 1：同意"
                className={`${keyOneClass} disabled:cursor-default`}
              >
                1
              </button>
            ) : (
              <span key={key} className={`${KEY} border-line bg-panel text-paper`}>
                {key}
              </span>
            ),
          )}
          <Focus on={flags.keys} />
        </div>

        {/* 輸入框 */}
        <div className="relative mx-3 mt-1 mb-2 flex shrink-0 gap-2 rounded-lg p-1.5">
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-md border border-line bg-panel px-4 text-[18px] whitespace-nowrap">
            {inputState === 'empty' && (
              <span className="text-faint">訊息 · Enter 送出 · ⇧Enter 換行</span>
            )}
            {inputState === 'composing' && (
              <span className="text-paper">
                順便更新文
                <span className="underline decoration-paper decoration-2 underline-offset-4">
                  ㄐㄧㄢˋ
                </span>
              </span>
            )}
            {inputState === 'composed' && <span className="text-paper">順便更新文件</span>}
          </div>
          <span className="flex h-11 shrink-0 items-center rounded-md border border-line px-4 font-mono text-[16px] tracking-[0.12em] text-paper">
            SEND
          </span>
          <Focus on={flags.input} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 四個區塊
 * 說明（status）21px 一行約 49 個中文字；小字（note）18px 一行約 58 字。
 * ══════════════════════════════════════════════════════════════ */

type AreaId = 'sessions' | 'waiting' | 'host' | 'mobile';

interface Area {
  id: AreaId;
  name: string;
  sub: string;
  status: readonly string[];
  note: string;
  ms: number;
}

const AREAS: readonly Area[] = [
  {
    id: 'sessions',
    name: 'Session 側欄',
    sub: '同時開好幾個，狀態與時間一眼看完',
    status: [
      '同時開好幾個 session，一列一個：名稱、工作資料夾、狀態燈',
      '右邊兩個時間：在目前狀態待了多久 · 總共跑了多久',
      '停掉的收進 STOPPED；SKILLS、MEMORY、KANBAN 這些收進 WORKSPACE',
      '拖曳排序：把 api 拉到最上面，換台裝置看也是同一個順序',
    ],
    note: '標題用的是 Claude Code 的 session 名稱；滑鼠停在一列上，會看到最近一次的 prompt。',
    ms: 1600,
  },
  {
    id: 'waiting',
    name: '一眼看到誰在等你',
    sub: 'WAITING：等你核准、回答或確認計畫',
    status: [
      'api 亮起 WAITING：它要跑 npm test，正在等你核准',
      '點進 api，按 1 同意。人不在電腦前，也能從外面回覆',
      '狀態變成 BUSY：Claude 接著把測試跑完',
      '跑完變成 IDLE。只有亮起 WAITING 的，才需要你出手',
    ],
    note: '呼應第五章 Loop Engineering：人什麼時候該介入。狀態由 Claude Code 的 hooks 回報，/setup 頁面引導安裝。',
    ms: 1800,
  },
  {
    id: 'host',
    name: '主機與用量',
    sub: 'HOST、USAGE 剩餘，還有 CTX',
    status: [
      'HOST：這台 Mac mini 的 CPU、記憶體、磁碟、swap，開機多久',
      'USAGE 剩餘：Claude Code 5 小時、1 週的用量還剩多少，幾點重置',
      'CTX：目前這個 session 的 context 還剩多少',
    ],
    note: '用量與 CTX 靠 hooks 加 statusline 回報；沒收到 hook 回報的 session 會標示 NO HOOK。',
    ms: 1600,
  },
  {
    id: 'mobile',
    name: '手機也能操作',
    sub: '按鍵列與輸入框，換裝置一鍵接管',
    status: [
      '按鍵列：補上手機鍵盤打不出來的 ESC、⇧TAB、方向鍵、^C',
      '輸入框：注音還在選字時按 Enter，只會確認選字、不會誤送',
      '剛用手機操作過，終端機尺寸跟著手機；回到電腦按一下就接管',
    ],
    note: '手機寬度下，側欄會收成抽屜（drawer）；按鍵列在桌機上也看得到。',
    ms: 1800,
  },
];

const API_PHASES: readonly ApiPhase[] = ['waiting', 'pressed', 'busy', 'idle'];

function flagsFor(area: AreaId, tick: number): MockFlags {
  return {
    list: area === 'sessions',
    times: area === 'sessions' && tick === 1,
    folds: area === 'sessions' && tick === 2,
    dragged: area === 'sessions' && tick === 3 ? 'api' : null,
    waiting: area === 'waiting',
    host: area === 'host',
    usage: area === 'host' && tick >= 1,
    ctx: area === 'host' && tick >= 2,
    keys: area === 'mobile',
    input: area === 'mobile' && tick >= 1,
    banner: area === 'mobile' && tick >= 2,
  };
}

/** 進場方式：still 一進頁面、play 點了左欄、approve 在別的區塊按了「1」 */
type Entry = 'still' | 'play' | 'approve';

function AreaCard({
  index,
  area,
  entry,
  onApprove,
}: {
  index: number;
  area: Area;
  entry: Entry;
  onApprove: () => void;
}) {
  const player = usePlayer(
    area.status.length - 1,
    area.ms,
    entry === 'still' ? 'still' : 'play',
    entry === 'approve' ? 1 : 0,
  );
  const [selected, setSelected] = useState<SessionId>('api');
  const tick = player.tick;

  const phase: ApiPhase = area.id === 'waiting' ? API_PHASES[tick] : 'waiting';
  /* 拖曳後的順序存在 server：只有 01 從頭播時是拖曳前，其他區塊都是 api 在最上面 */
  const order = area.id === 'sessions' && tick < 3 ? BASE_ORDER : DRAGGED_ORDER;

  let inputState: InputState = 'empty';
  if (area.id === 'mobile' && tick === 1) inputState = 'composing';
  else if (area.id === 'mobile' && tick >= 2) inputState = 'composed';

  const pressOne = () => {
    if (area.id === 'waiting') player.jump(1);
    else onApprove();
  };

  /* 02 的故事講的是 api：播放中點了別的 session 就先停下來（人接手），
   * 再按播放／下一步時切回 api，故事才對得上畫面。 */
  const isWaiting = area.id === 'waiting';
  const select = (id: SessionId) => {
    setSelected(id);
    if (isWaiting) player.pause();
  };
  const controls: Player = isWaiting
    ? {
        ...player,
        toggle: () => {
          setSelected('api');
          player.toggle();
        },
        step: () => {
          setSelected('api');
          player.step();
        },
      }
    : player;

  return (
    <div className="slide-enter flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} shrink-0 text-acid`}>區塊 {pad2(index + 1)}</span>
        <span className="text-[30px] leading-none font-semibold whitespace-nowrap text-paper">
          {area.name}
        </span>
        <span className="rounded-full border border-line bg-panel-lift px-4 py-1 text-[18px] whitespace-nowrap text-paper">
          示意畫面 · 資料是虛構的
        </span>
        <PlayerControls player={controls} />
      </div>

      {/* 介面示意 */}
      <CoddMock
        flags={flagsFor(area.id, tick)}
        phase={phase}
        order={order}
        selected={selected}
        onSelect={select}
        onKeyOne={pressOne}
        inputState={inputState}
      />

      {/* 一句說明＋小字補充 */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6">
        <p className="flex items-center gap-2 text-[21px] leading-snug whitespace-nowrap text-paper">
          <span className="font-semibold text-acid">›</span>
          {area.status[tick]}
        </p>
        <p className="text-[18px] leading-snug whitespace-nowrap text-muted">{area.note}</p>
      </div>
    </div>
  );
}

export function CoddDemo() {
  const [view, setView] = useState<{ area: AreaId; entry: Entry }>({
    area: 'sessions',
    entry: 'still',
  });
  const index = Math.max(
    0,
    AREAS.findIndex((item) => item.id === view.area),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：接續先前課程 ＋ 四個區塊 ─────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <BridgeCard />
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {AREAS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              sub={item.sub}
              on={item.id === view.area}
              onClick={() => setView({ area: item.id, entry: 'play' })}
            />
          ))}
        </div>
      </div>

      {/* ── 右：CODD 介面示意 ───────────────────────────── */}
      <AreaCard
        key={view.area}
        index={index}
        area={AREAS[index]}
        entry={view.entry}
        onApprove={() => setView({ area: 'waiting', entry: 'approve' })}
      />
    </div>
  );
}
