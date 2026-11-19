import { Fragment, useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：邊界
 *
 *   第 38 頁  BoundaryDemo   邊界：經常發生的狀況
 *
 * callout 原文重點（Notion 連線故障，講師 2026-10-06 直接貼上）：
 *   「這邊可以提到 Loop Engineering 這種常見的問題，所以為了避免 AI 陷入死循環，
 *    都要設定邊界。一樣，左邊可以是選項，右邊則是相關的概念圖。」
 *   1. 驗證不確實，導致成品不如預期
 *      a. 成品不如預期
 *      b. 沒有先驗收，就直接釋出（資安問題）
 *   2. AI 為了找尋一個解決方案，花費過多的時間（案例：為了將 3D 動畫的手部動作
 *      「用順」，畫面上照意思寫成「調順」），但解決方案是錯誤的
 *   3. AI 過程中寫錯程式碼，導致測試錯誤，但是測試方式是錯誤的
 *
 * 版型：講師指定「左邊是選項，右邊是概念圖」。
 *   左  三個狀況（MenuItem），第 1 項底下掛 a／b 兩個子情境；最下面一張總結卡
 *       「為了避免 AI 陷入死循環，都要設定邊界」。
 *   右  情境卡：標題列（狀況編號＋播放／下一步）→ 一句說明 → 可播放的概念圖
 *       → 播到最後一格才翻開的「該設的邊界」小卡。
 *   播放規則同第 22、27 頁：一進頁面停在播完的畫面；在左欄點了別的選項就從頭自動播。
 *
 * 四個情境，延續第 29–31 頁的回圈（寫程式 → 跑測試 → 通過了嗎？ → 修正）：
 *   1-a 成品不如預期   「通過了嗎？」只看了頁面打得開、沒有 error 就打勾，Loop 回報
 *                      完成；對照你預期的四項，只做到一項。
 *   1-b 直接釋出       Loop 跑完、測試全過，箭頭繞過「上線前驗收」直接進正式環境；
 *                      釋出的程式碼裡金鑰外露、後台沒擋權限（畫面標「示意」）。
 *   2   繞很久的錯解法  為了把 3D 動畫的手部動作調順，一圈一圈地試；右邊的輪數、時間、
 *                      token 一直往上，但軌跡離「該走的方向」越來越遠。
 *   3   測試方式是錯的  需求是加 5% 稅（100 → 105），測試卻寫成 110。第 1 輪程式真的
 *                      寫錯；第 2 輪改對了，測試還是不過；第 3 輪 AI 把稅率改成 10%，
 *                      測試過了、程式反而錯了 → 最後揭曉「問題其實在測試」。
 *
 * 「該設的邊界」小卡是依 callout「都要設定邊界」延伸的建議，callout 沒有逐項寫：
 *   1-a 明確的驗收條件   1-b 上線前人工驗收   2 輪數・時間・預算上限   3 測試先經過人審核
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫，可以整段換掉）：
 *   - 1-a：「完成登入功能」與預期的四項（沿用第 29 頁的登入範例）、Loop 只檢查的兩項。
 *   - 1-b：public/config.js、routes/admin.ts 兩行程式、sk-live-… 金鑰、/admin/users
 *          路由（畫面標「示意」）。
 *   - 2：六次嘗試的名稱（關節角度、關鍵影格、插值曲線…）、時間與 token 的數字
 *        （畫面標「示意數字」）。
 *   - 3：withTax、5% 稅、tax.test.ts 與三輪的程式內容。
 *
 * 用色（兩支）：acid＝目前選取（選單、播放鍵、回圈上目前這一步）；coral＝問題／風險。
 *   「邊界」不另佔強調色：一律用墨色（paper）實線框＋粗體，總結卡是 paper 左粗條。
 *   Loop 裡「看起來通過」的 ✓ 也是墨色，不用 teal —— 那個通過本身就是問題的一部分。
 *   淡底（/14）一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算（Panel 內可用約 1744 × 768；根容器 h-[720px] max-w-[1740px]，沒有任何容器捲動）：
 *   寬  左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）
 *   左  標籤 26 ＋ 16 ＋ 選單 472（108 ＋ 12 ＋ 子項 52×2＋8 ＋ 12 ＋ 108 ＋ 12 ＋ 108）
 *       ＋ 總結卡約 100（mt-auto）≈ 614 < 720
 *   右  卡片內高 720 − 邊框 2 − py-6 48 ＝ 670
 *       ＝ 標題列 48 ＋ 16 ＋ 說明 66（22px 兩行）＋ 16 ＋ 概念圖 410 ＋ 16 ＋ 邊界卡 98
 *   概念圖 410 各自的分配寫在各情境上面。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-paper disabled:border-line-soft disabled:text-faint`;

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity] duration-300 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  coral: 'var(--color-coral)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix }: { prefix: string }) {
  const tones: Record<string, string> = {
    muted: C.muted,
    acid: C.acid,
    coral: C.coral,
  };
  return (
    <defs>
      {Object.entries(tones).map(([name, color]) => (
        <marker
          key={name}
          id={`${prefix}-${name}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={14}
          markerHeight={14}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

/* ── 播放器（同 demos-tradeoffs.tsx 的 usePlayer）─────────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的選項時）
 * 情境卡用情境 id 當 key，換情境就整張重掛，狀態自然歸零。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode) {
  const [tick, setTick] = useState(mode === 'still' ? last : 0);
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

  const label = running ? '暫停' : atEnd ? '重播' : tick === 0 ? '播放' : '繼續';

  return { tick, atEnd, toggle, step, label };
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

/** 左側選單的一列（同 demos-choose.tsx 的 MenuItem） */
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
      className={`flex min-h-[108px] items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
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
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}

/** 第 1 項底下的子情境（a／b） */
function SubItem({
  letter,
  text,
  on,
  onClick,
}: {
  letter: string;
  text: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex h-[52px] w-full items-center gap-3 rounded-xl border border-l-[6px] px-4 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`w-6 shrink-0 font-mono text-[18px] ${
          on ? 'font-semibold text-acid' : 'text-faint'
        }`}
      >
        {letter}
      </span>
      <span className={`truncate text-[20px] text-paper ${on ? 'font-semibold' : ''}`}>
        {text}
      </span>
    </button>
  );
}

/** 邊界的小圖示：第 31 頁那圈「邊界虛線圓」包住一個小回圈 */
function BoundaryGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
      <circle
        cx={24}
        cy={24}
        r={20}
        fill="none"
        stroke={C.paper}
        strokeWidth={2.5}
        strokeDasharray="6 4.5"
      />
      <circle cx={24} cy={24} r={9} fill="none" stroke={C.muted} strokeWidth={2} />
      <path
        d="M -4 -3.6 L 4 0 L -4 3.6 Z"
        transform="translate(30.4 17.6) rotate(45)"
        fill={C.muted}
      />
    </svg>
  );
}

/* ── 回圈（延續第 31 頁的四格回圈，縮小版）──────────────────
 * 四格放在圓周的上右下左，四個順時針箭頭放在 45° 的位置。
 * 中間的 band（cy ± 23）左右被兩格夾住，所以中心的字分成上下兩行：
 *   「Loop」在 cy − 34、輪數在 cy ＋ 52；「通過了嗎？」底下的狀態在 cy ＋ r ＋ 55。 */

type LoopNode = 'code' | 'test' | 'check' | 'fix';
type NodeTone = 'acid' | 'coral' | 'paper';

const TONE_VAR: Record<NodeTone, string> = {
  acid: C.acid,
  coral: C.coral,
  paper: C.paper,
};

const LOOP_NODES: readonly { id: LoopNode; dx: number; dy: number; text: string }[] = [
  { id: 'code', dx: 0, dy: -1, text: '寫程式' },
  { id: 'test', dx: 1, dy: 0, text: '跑測試' },
  { id: 'check', dx: 0, dy: 1, text: '通過了嗎？' },
  { id: 'fix', dx: -1, dy: 0, text: '修正' },
];

/** [x 方向, y 方向, 旋轉角]：順時針 */
const LOOP_HEADS: readonly (readonly [number, number, number])[] = [
  [1, -1, 45],
  [1, 1, 135],
  [-1, 1, 225],
  [-1, -1, 315],
];

const NODE_W = 124;
const NODE_H = 46;

/** 只有圓圈與箭頭的回圈 */
function LoopRing({ cx, cy, r, head = 9 }: { cx: number; cy: number; r: number; head?: number }) {
  const k = r * Math.SQRT1_2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.muted} strokeWidth={2.5} />
      {LOOP_HEADS.map(([sx, sy, deg]) => (
        <path
          key={deg}
          d={`M ${-head} ${-head * 0.9} L ${head} 0 L ${-head} ${head * 0.9} Z`}
          transform={`translate(${cx + sx * k} ${cy + sy * k}) rotate(${deg})`}
          fill={C.muted}
        />
      ))}
    </g>
  );
}

function MiniLoop({
  cx,
  cy,
  r,
  tones,
  center,
  status,
}: {
  cx: number;
  cy: number;
  r: number;
  tones: Partial<Record<LoopNode, NodeTone>>;
  center: string;
  status: { text: string; tone: 'coral' | 'paper' } | null;
}) {
  return (
    <g>
      <LoopRing cx={cx} cy={cy} r={r} />
      <text x={cx} y={cy - 34} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.paper}>
        Loop
      </text>
      <text x={cx} y={cy + 52} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.paper}>
        {center}
      </text>

      {LOOP_NODES.map((node) => {
        const x = cx + node.dx * r - NODE_W / 2;
        const y = cy + node.dy * r - NODE_H / 2;
        const tone = tones[node.id];
        const color = tone ? TONE_VAR[tone] : null;
        const tinted = tone === 'acid' || tone === 'coral';
        return (
          <g key={node.id}>
            {/* 先墊一塊不透明的 panel，蓋掉圓圈的線 */}
            <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={14} fill={C.panel} />
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={14}
              fill={color && tinted ? color : tone === 'paper' ? C.panel : C.inkSoft}
              fillOpacity={tinted ? 0.14 : 1}
              stroke={color ?? C.line}
              strokeWidth={tone ? 3.5 : 2}
              className={SVG_TR}
            />
            <text
              x={x + NODE_W / 2}
              y={y + 30}
              textAnchor="middle"
              fontSize={19}
              fontWeight={600}
              fill={tone ? C.paper : C.muted}
              className={SVG_TR}
            >
              {node.text}
            </text>
          </g>
        );
      })}

      {status && (
        <text
          key={status.text}
          x={cx}
          y={cy + r + 55}
          textAnchor="middle"
          fontSize={19}
          fontWeight={600}
          fill={TONE_VAR[status.tone]}
          className="slide-enter"
        >
          {status.text}
        </text>
      )}
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 情境資料
 * ══════════════════════════════════════════════════════════════ */

type SceneId = 'shallow' | 'release' | 'detour' | 'wrongTest';

interface Scene {
  id: SceneId;
  no: string;
  title: string;
  desc: string;
  boundary: { head: string; text: string };
  /** 情境的最後一格與每格毫秒數 */
  last: number;
  ms: number;
}

const SCENES: readonly Scene[] = [
  {
    id: 'shallow',
    no: '01-a',
    title: '驗證不確實 · 成品不如預期',
    desc: 'Loop 的「通過了嗎？」只檢查了很淺的東西就打勾：測試過了、Loop 也停了 —— 但成品跟預期差很多。',
    boundary: {
      head: '明確的驗收條件',
      text: '把「怎樣才算完成」逐項寫清楚，每一項都檢查到，才算通過。',
    },
    last: 5,
    ms: 1100,
  },
  {
    id: 'release',
    no: '01-b',
    title: '驗證不確實 · 沒有先驗收，就直接釋出',
    desc: 'Loop 跑完、測試也全過了，但沒有先驗收就直接釋出：沒有人看過的程式，可能把資安問題一起帶出去。',
    boundary: {
      head: '上線前一定要人工驗收',
      text: 'Loop 可以自動跑，但「釋出」這一步留給人來把關。',
    },
    last: 5,
    ms: 1100,
  },
  {
    id: 'detour',
    no: '02',
    title: '花費過多時間，但解法是錯的',
    desc: 'AI 為了找尋一個解決方案，花費過多的時間（案例：為了把 3D 動畫的手部動作調順），但解決方案本身是錯誤的。',
    boundary: {
      head: '輪數・時間・預算的上限',
      text: '超過就停下來回報，讓人判斷這個方向到底對不對。',
    },
    last: 7,
    ms: 800,
  },
  {
    id: 'wrongTest',
    no: '03',
    title: '測試錯誤，但錯的是測試方式',
    desc: 'AI 過程中寫錯程式碼，導致測試錯誤 —— 但測試方式本身也是錯的，AI 只會在錯的測試上越修越偏。',
    boundary: {
      head: '測試要先經過人審核',
      text: '先確認測試驗的是對的東西，再讓 AI 照著測試去修。',
    },
    last: 7,
    ms: 1100,
  },
];

const GROUPS: readonly { name: string; sub: string; scenes: readonly SceneId[] }[] = [
  { name: '驗證不確實', sub: '導致成品不如預期', scenes: ['shallow', 'release'] },
  { name: '花太多時間找解法', sub: 'AI 繞了很久，但解決方案本身是錯的', scenes: ['detour'] },
  { name: '測試方式是錯的', sub: '寫錯程式導致測試錯誤，但測試方式也是錯的', scenes: ['wrongTest'] },
];

const SUBS: readonly { id: SceneId; letter: string; text: string }[] = [
  { id: 'shallow', letter: 'a', text: '成品不如預期' },
  { id: 'release', letter: 'b', text: '沒有先驗收，就直接釋出（資安問題）' },
];

/* ── 01-a 成品不如預期 ───────────────────────────────────
 * tick：1 寫程式 → 2 跑測試（只檢查兩項）→ 3「通過了嗎？」打勾、回報完成
 *       → 4 對照預期 → 5 結論。
 * 寬：回圈 SVG 420 ＋ gap 32 ＋ 右欄 650
 * 高：右欄 標籤 26 ＋ 10 ＋ 檢查列 64 ＋ 16 ＋ 標籤 26 ＋ 10
 *     ＋ 對照 4 × 44 ＋ 3 × 8 ＋ 12 ＋ 結論 40 ＝ 404；SVG 410 */

const SHALLOW_CHECKS = ['頁面打得開', 'console 沒有 error'] as const;

const SHALLOW_EXPECTS: readonly { text: string; ok: boolean; got: string }[] = [
  { text: '頁面打得開', ok: true, got: '✓ 有' },
  { text: '帳號密碼要驗證', ok: false, got: '✕ 隨便輸入都能登入' },
  { text: '密碼錯誤時顯示提示', ok: false, got: '✕ 沒有任何提示' },
  { text: '勾選「記住我」', ok: false, got: '✕ 重新整理就登出' },
];

function ShallowScene({ tick }: { tick: number }) {
  const tones: Partial<Record<LoopNode, NodeTone>> =
    tick === 1 ? { code: 'acid' } : tick === 2 ? { test: 'acid' } : tick >= 3 ? { check: 'paper' } : {};
  const checked = tick >= 2;
  const compared = tick >= 4;
  const done = tick >= 5;
  const okCount = SHALLOW_EXPECTS.filter((item) => item.ok).length;

  return (
    <div className="grid h-full grid-cols-[420px_1fr] gap-8">
      <svg width={420} height={410} viewBox="0 0 420 410" role="img" className="shrink-0">
        <title>Loop 的「通過了嗎？」只檢查了頁面打得開、沒有 error，就打勾回報完成</title>
        <text x={210} y={34} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.paper}>
          目標：完成登入功能
        </text>
        <MiniLoop
          cx={210}
          cy={206}
          r={108}
          tones={tones}
          center={tick >= 3 ? '回報完成' : '第 1 輪'}
          status={tick >= 3 ? { text: '✓ 通過（只看了表面）', tone: 'paper' } : null}
        />
      </svg>

      <div className="flex min-w-0 flex-col">
        <span className={LABEL_FAINT}>「通過了嗎？」只檢查了</span>
        <div className="mt-2.5 flex h-16 shrink-0 items-center gap-4 rounded-2xl border border-line bg-ink-soft px-5">
          {checked ? (
            SHALLOW_CHECKS.map((check) => (
              <span
                key={check}
                className="slide-enter rounded-lg border border-paper bg-panel px-4 py-1.5 text-[20px] text-paper"
              >
                ✓ {check}
              </span>
            ))
          ) : (
            <span className="text-[20px] text-faint">還沒跑到檢查</span>
          )}
        </div>

        <span className={`${LABEL_FAINT} mt-4`}>你預期的登入功能 vs 成品</span>
        <div className="mt-2.5 flex flex-col gap-2">
          {SHALLOW_EXPECTS.map((item) => {
            const bad = compared && !item.ok;
            const tone = bad
              ? 'border-coral/55 border-l-coral bg-coral/14'
              : compared
                ? 'border-line border-l-paper bg-panel'
                : 'border-line border-l-line bg-panel';
            return (
              <div
                key={item.text}
                className={`grid h-11 grid-cols-[1fr_260px] items-center gap-4 rounded-xl border border-l-[6px] px-5 transition-colors duration-300 ${tone}`}
              >
                <span className="text-[21px] text-paper">{item.text}</span>
                <span
                  className={`text-[20px] ${
                    bad ? 'font-semibold text-coral' : compared ? 'font-semibold text-paper' : 'text-faint'
                  }`}
                >
                  {compared ? item.got : '還沒對照'}
                </span>
              </div>
            );
          })}
        </div>

        <p
          className={`mt-3 flex h-10 shrink-0 items-center text-[22px] font-semibold text-coral ${
            done ? 'slide-enter' : 'invisible'
          }`}
        >
          Loop 說完成了 —— 但 {SHALLOW_EXPECTS.length} 項只做到 {okCount} 項
        </p>
      </div>
    </div>
  );
}

/* ── 01-b 沒有先驗收，就直接釋出 ─────────────────────────
 * 座標（viewBox 1100 × 190，1:1 呈現）：
 *   Loop 圓 (90, 96) r 58；「上線前驗收」虛線框 (420, 72) 240 × 96；
 *   正式環境 (874, 66) 222 × 108；繞過驗收的弧線頂點 y 30（框頂 y 72）。
 * tick：1 繞過驗收 → 2 進了正式環境 → 3 金鑰外露 → 4 後台沒擋權限 → 5 結論。
 * 高：SVG 190 ＋ 12 ＋ 程式碼視窗 155（標題 44 ＋ 1 ＋ py 12 ＋ 2 × 48 ＋ 邊框 2）
 *     ＋ 12 ＋ 結論 36 ＝ 405 */

const RELEASE_LINES: readonly { file: string; code: string; flag: string; at: number }[] = [
  {
    file: 'public/config.js',
    code: 'const API_KEY = "sk-live-8f2c…";',
    flag: '✕ 金鑰放在公開的檔案裡',
    at: 3,
  },
  {
    file: 'routes/admin.ts',
    code: "router.get('/admin/users', listUsers);",
    flag: '✕ 後台沒有檢查權限',
    at: 4,
  },
];

function ReleaseScene({ tick }: { tick: number }) {
  const skipped = tick >= 1;
  const live = tick >= 2;
  const done = tick >= 5;

  return (
    <div className="flex h-full flex-col gap-3">
      <svg width={1100} height={190} viewBox="0 0 1100 190" role="img" className="shrink-0">
        <title>Loop 跑完、測試全過，卻繞過上線前的驗收，直接釋出到正式環境</title>
        <ArrowMarkers prefix="bd-rl" />

        {/* ── Loop 跑完 ── */}
        <LoopRing cx={90} cy={96} r={58} />
        <text x={90} y={92} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.paper}>
          Loop
        </text>
        <text x={90} y={118} textAnchor="middle" fontSize={17} fill={C.muted}>
          跑完了
        </text>
        <text x={90} y={184} textAnchor="middle" fontSize={18} fontWeight={600} fill={C.paper}>
          ✓ 測試全過
        </text>

        {/* ── 該走的路：Loop → 驗收 → 正式環境 ── */}
        <path
          d="M 148 120 L 412 120"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="7 7"
          markerEnd="url(#bd-rl-muted)"
        />
        <text x={284} y={150} textAnchor="middle" fontSize={17} fill={C.muted}>
          應該先經過驗收
        </text>
        <path
          d="M 662 120 L 866 120"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="7 7"
          markerEnd="url(#bd-rl-muted)"
        />

        {/* ── 上線前驗收（被跳過） ── */}
        <rect
          x={420}
          y={72}
          width={240}
          height={96}
          rx={16}
          fill="none"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="8 7"
        />
        <text x={540} y={112} textAnchor="middle" fontSize={22} fontWeight={600} fill={C.muted}>
          上線前驗收
        </text>
        <text
          key={skipped ? 'skipped' : 'idle'}
          x={540}
          y={146}
          textAnchor="middle"
          fontSize={18}
          fontWeight={skipped ? 600 : 400}
          fill={skipped ? C.coral : C.muted}
          className={skipped ? 'slide-enter' : undefined}
        >
          {skipped ? '✕ 被跳過了' : '人看過，再釋出'}
        </text>

        {/* ── 繞過驗收的箭頭 ── */}
        <g style={{ opacity: skipped ? 1 : 0 }} className={SVG_TR}>
          <path
            d="M 146 80 C 280 58, 300 30, 540 30 C 780 30, 800 58, 868 88"
            fill="none"
            stroke={C.coral}
            strokeWidth={3.5}
            markerEnd="url(#bd-rl-coral)"
          />
          <text x={540} y={20} textAnchor="middle" fontSize={19} fontWeight={600} fill={C.coral}>
            跳過驗收，直接釋出
          </text>
        </g>

        {/* ── 正式環境 ── */}
        <rect
          x={874}
          y={66}
          width={222}
          height={108}
          rx={16}
          fill={live ? C.coral : C.inkSoft}
          fillOpacity={live ? 0.14 : 1}
          stroke={live ? C.coral : C.line}
          strokeWidth={live ? 3.5 : 2}
          className={SVG_TR}
        />
        <text x={985} y={110} textAnchor="middle" fontSize={22} fontWeight={600} fill={C.paper}>
          正式環境
        </text>
        <text
          x={985}
          y={144}
          textAnchor="middle"
          fontSize={18}
          fontWeight={live ? 600 : 400}
          fill={live ? C.coral : C.muted}
        >
          {live ? '✕ 已經公開了' : '所有人都看得到'}
        </text>
      </svg>

      <div className="shrink-0 overflow-hidden rounded-2xl border border-line bg-ink-soft">
        <div className="flex h-11 items-center justify-between border-b border-line px-5">
          <span className="text-[18px] text-muted">這次釋出的程式碼</span>
          <span className="rounded-md border border-line bg-panel px-2.5 text-[17px] text-muted">
            示意
          </span>
        </div>
        <div className="py-1.5">
          {RELEASE_LINES.map((line) => {
            const flagged = tick >= line.at;
            return (
              <div
                key={line.file}
                className={`flex h-12 items-center gap-5 border-l-[6px] px-5 transition-colors duration-300 ${
                  flagged ? 'border-l-coral bg-coral/14' : 'border-l-transparent'
                }`}
              >
                <span className="w-[180px] shrink-0 font-mono text-[17px] text-muted">
                  {line.file}
                </span>
                <span className="font-mono text-[19px] whitespace-pre text-paper">{line.code}</span>
                {flagged && (
                  <span className="slide-enter ml-auto shrink-0 text-[19px] font-semibold text-coral">
                    {line.flag}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p
        className={`flex h-9 shrink-0 items-center text-[21px] font-semibold text-coral ${
          done ? 'slide-enter' : 'invisible'
        }`}
      >
        沒有人看過就釋出：測試全過，資安問題卻一起被帶出去了。
      </p>
    </div>
  );
}

/* ── 02 花費過多時間，但解法是錯的 ─────────────────────────
 * 座標（viewBox 760 × 410，1:1 呈現）：
 *   開始 (56, 336)；目標靶心 (680, 92) r 34；「該走的方向」虛線 (70, 330) → (640, 111)
 *   AI 的六圈 x 150 → 625（間距 95），y 342 → 372 一路往下偏，r 24
 *   最後一格：x 625 的 coral 虛線從軌跡拉到「該走的方向」，標「越修越偏」。
 * tick：1–6 每格多繞一圈（目前這一圈 acid），7 結論。
 * 寬：SVG 760 ＋ gap 32 ＋ 計量欄 310
 * 高：計量卡 200 ＋ 16 ＋ 試過的解法 flex-1（194）＝ 410 */

const DT_LOOPS: readonly { x: number; y: number }[] = [
  { x: 150, y: 342 },
  { x: 245, y: 352 },
  { x: 340, y: 360 },
  { x: 435, y: 366 },
  { x: 530, y: 370 },
  { x: 625, y: 372 },
];
const DT_R = 24;

const DT_TRIES: readonly string[] = [
  '微調手指的關節角度',
  '多加幾個關鍵影格',
  '換一種插值曲線',
  '再加一層平滑濾波',
  '重寫手指的 IK 解算',
  '回頭再調關節權重',
];

/** 每一輪的示意花費 */
const DT_HOURS_PER_ROUND = 0.8;
const DT_MTOKENS_PER_ROUND = 0.7;

function DetourScene({ tick }: { tick: number }) {
  const rounds = Math.min(tick, DT_LOOPS.length);
  const done = tick > DT_LOOPS.length;
  const recent = DT_TRIES.slice(0, rounds)
    .map((text, index) => ({ round: index + 1, text }))
    .slice(-3);

  return (
    <div className="grid h-full grid-cols-[760px_1fr] gap-8">
      <svg width={760} height={410} viewBox="0 0 760 410" role="img" className="shrink-0">
        <title>為了把 3D 動畫的手部動作調順，AI 一圈一圈地試，軌跡卻離目標越來越遠</title>
        <ArrowMarkers prefix="bd-dt" />

        {/* ── 目標 ── */}
        <text x={752} y={34} textAnchor="end" fontSize={19} fontWeight={600} fill={C.paper}>
          目標：手部動作順暢
        </text>
        <circle cx={680} cy={92} r={34} fill="none" stroke={C.paper} strokeWidth={2.5} />
        <circle cx={680} cy={92} r={20} fill="none" stroke={C.paper} strokeWidth={2.5} />
        <circle cx={680} cy={92} r={7} fill={C.paper} />

        {/* ── 該走的方向 ── */}
        <path
          d="M 70 330 L 640 111"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="8 8"
          markerEnd="url(#bd-dt-muted)"
        />
        <text x={340} y={196} textAnchor="end" fontSize={18} fill={C.muted}>
          該走的方向
        </text>

        {/* ── 開始 ── */}
        <circle cx={56} cy={336} r={10} fill={C.paper} />
        <text x={56} y={374} textAnchor="middle" fontSize={18} fill={C.paper}>
          開始
        </text>

        {/* ── AI 實際繞的每一圈 ── */}
        {DT_LOOPS.slice(0, rounds).map((point, index) => {
          const prev = index === 0 ? null : DT_LOOPS[index - 1];
          const fromX = prev ? prev.x + DT_R : 68;
          const fromY = prev ? prev.y : 337;
          const latest = index === rounds - 1 && !done;
          const color = latest ? C.acid : C.coral;
          return (
            <g key={index} className="slide-enter">
              <path
                d={`M ${fromX} ${fromY} L ${point.x - DT_R - 3} ${point.y}`}
                stroke={C.coral}
                strokeWidth={2.5}
                markerEnd="url(#bd-dt-coral)"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={DT_R}
                fill={latest ? C.acid : C.panel}
                fillOpacity={latest ? 0.14 : 1}
                stroke={color}
                strokeWidth={3}
                className={SVG_TR}
              />
              <path
                d="M -7 -6 L 7 0 L -7 6 Z"
                transform={`translate(${point.x + 17} ${point.y - 17}) rotate(45)`}
                fill={color}
                className={SVG_TR}
              />
              <text
                x={point.x}
                y={point.y + 6}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                fill={color}
                className={SVG_TR}
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        {/* ── 結論：離該走的方向越來越遠 ── */}
        {done && (
          <g className="slide-enter">
            <path
              d="M 625 344 L 625 126"
              stroke={C.coral}
              strokeWidth={2.5}
              strokeDasharray="6 6"
              markerEnd="url(#bd-dt-coral)"
            />
            <text x={610} y={262} textAnchor="end" fontSize={19} fontWeight={600} fill={C.coral}>
              越修越偏：方向本身就錯了
            </text>
          </g>
        )}
      </svg>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="shrink-0 rounded-2xl border border-coral/55 border-l-[6px] border-l-coral bg-panel px-6 py-4">
          <p className={LABEL_FAINT}>已經花掉（示意數字）</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[56px] leading-none font-semibold text-coral tabular-nums">
              {rounds}
            </span>
            <span className="text-[24px] text-paper">輪</span>
          </p>
          <div className="mt-3 flex flex-col gap-1 text-[20px]">
            <p className="flex justify-between">
              <span className="text-muted">時間</span>
              <span className="font-semibold text-paper tabular-nums">
                {(rounds * DT_HOURS_PER_ROUND).toFixed(1)} 小時
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">token</span>
              <span className="font-semibold text-paper tabular-nums">
                {(rounds * DT_MTOKENS_PER_ROUND).toFixed(1)}M
              </span>
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-line bg-ink-soft px-5 py-4">
          <p className={LABEL_FAINT}>AI 試過的解法</p>
          {recent.length === 0 ? (
            <p className="text-[19px] text-faint">還沒開始</p>
          ) : (
            recent.map((item, index) => {
              const latest = index === recent.length - 1 && !done;
              return (
                <p
                  key={item.round}
                  className="flex h-[34px] items-center gap-2 text-[19px] leading-normal"
                >
                  <span className={latest ? 'text-acid' : 'text-faint'}>›</span>
                  <span className="w-[58px] shrink-0 text-[17px] text-faint">第 {item.round} 輪</span>
                  <span className={`truncate ${latest ? 'font-semibold text-paper' : 'text-muted'}`}>
                    {item.text}
                  </span>
                </p>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 03 測試錯誤，但錯的是測試方式 ─────────────────────────
 * 需求是加 5% 稅：withTax(100) 應該是 105；測試卻寫成 110。
 * tick：1 第 1 輪寫程式（寫錯成 1.5）→ 2 測試沒過 → 3 修正成 1.05（其實對了）
 *       → 4 測試還是沒過 → 5 AI 改成 1.1 → 6 測試過了（程式反而錯了）
 *       → 7 揭曉：問題其實在測試。
 * 寬：回圈 SVG 420 ＋ gap 32 ＋ 右欄 650
 * 高：需求 64 ＋ 12 ＋ 測試檔 107 ＋ 12 ＋ 標籤 26 ＋ 10 ＋ 三輪 3 × 52 ＋ 2 × 8 ＝ 403 */

const TAX_ROUNDS: readonly { code: string; head: string; tail: string; pass: boolean }[] = [
  { code: 'return price * 1.5;', head: '✕ 得到 150', tail: '（程式寫錯了）', pass: false },
  { code: 'return price * 1.05;', head: '✕ 得到 105', tail: '（其實改對了）', pass: false },
  { code: 'return price * 1.1;', head: '✓ 測試過了', tail: '（稅率被改錯了）', pass: true },
];

function WrongTestScene({ tick }: { tick: number }) {
  const round = Math.min(TAX_ROUNDS.length, Math.ceil(tick / 2));
  const results = Math.min(TAX_ROUNDS.length, Math.floor(tick / 2));
  const revealed = tick >= 7;
  const lastResult = results > 0 ? TAX_ROUNDS[results - 1] : null;

  const tones: Partial<Record<LoopNode, NodeTone>> =
    tick === 1
      ? { code: 'acid' }
      : tick === 3 || tick === 5
        ? { fix: 'acid' }
        : tick >= 6
          ? { check: 'paper' }
          : tick === 2 || tick === 4
            ? { check: 'coral' }
            : {};

  return (
    <div className="grid h-full grid-cols-[420px_1fr] gap-8">
      <svg width={420} height={410} viewBox="0 0 420 410" role="img" className="shrink-0">
        <title>Loop 以「測試通過」為終點，在一個寫錯的測試上一圈一圈地修</title>
        <text x={210} y={34} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.paper}>
          結束條件：測試通過
        </text>
        <MiniLoop
          cx={210}
          cy={206}
          r={108}
          tones={tones}
          center={round === 0 ? '準備中' : `第 ${round} 輪`}
          status={
            lastResult
              ? lastResult.pass
                ? { text: '✓ 測試過了', tone: 'paper' }
                : { text: '✕ 測試沒過', tone: 'coral' }
              : null
          }
        />
      </svg>

      <div className="flex min-w-0 flex-col">
        <div className="flex h-16 shrink-0 items-center gap-4 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-5">
          <span className={`${LABEL_FAINT} shrink-0`}>需求</span>
          <span className="text-[21px] text-paper">
            價格加 5% 稅：<span className="font-mono text-[19px]">withTax(100)</span> 應該是{' '}
            <span className="font-semibold">105</span>
          </span>
        </div>

        <div
          className={`mt-3 shrink-0 overflow-hidden rounded-2xl border bg-ink-soft transition-colors duration-300 ${
            revealed ? 'border-coral' : 'border-line'
          }`}
        >
          <div className="flex h-10 items-center justify-between border-b border-line px-5">
            <span className="font-mono text-[17px] text-muted">tax.test.ts</span>
            {revealed && (
              <span className="slide-enter text-[18px] font-semibold text-coral">
                需求是 105，測試卻寫 110
              </span>
            )}
          </div>
          <div className="py-2">
            <div
              className={`flex h-12 items-center gap-4 border-l-[6px] px-5 transition-colors duration-300 ${
                revealed ? 'border-l-coral bg-coral/14' : 'border-l-transparent'
              }`}
            >
              <span className="font-mono text-[19px] whitespace-pre text-paper">
                expect(withTax(100)).toBe(110);
              </span>
              {revealed && (
                <span className="slide-enter ml-auto shrink-0 rounded-lg bg-coral px-3 py-1 text-[18px] font-semibold text-on-accent">
                  問題其實在測試
                </span>
              )}
            </div>
          </div>
        </div>

        <span className={`${LABEL_FAINT} mt-3`}>AI 每一輪改的程式</span>
        <div className="mt-2.5 flex flex-col gap-2">
          {TAX_ROUNDS.map((item, index) => {
            const shown = index < round;
            const judged = index < results;
            if (!shown) {
              return (
                <div
                  key={item.code}
                  className="flex h-[52px] items-center rounded-xl border-2 border-dashed border-line px-5 text-[19px] text-faint"
                >
                  第 {index + 1} 輪 · 還沒跑到
                </div>
              );
            }
            const tone = !judged
              ? 'border-acid/55 border-l-acid'
              : item.pass
                ? 'border-line border-l-paper'
                : 'border-coral/55 border-l-coral';
            return (
              <div
                key={item.code}
                className={`slide-enter grid h-[52px] grid-cols-[64px_220px_1fr] items-center gap-3.5 rounded-xl border border-l-[6px] bg-panel px-5 transition-colors duration-300 ${tone}`}
              >
                <span className="text-[17px] text-faint">第 {index + 1} 輪</span>
                <span className="font-mono text-[18px] whitespace-pre text-paper">{item.code}</span>
                {judged ? (
                  <span className="truncate text-[19px]">
                    <span className={`font-semibold ${item.pass ? 'text-paper' : 'text-coral'}`}>
                      {item.head}
                    </span>
                    <span className={item.pass ? 'font-semibold text-coral' : 'text-muted'}>
                      {item.tail}
                    </span>
                  </span>
                ) : (
                  <span className="text-[19px] text-muted">跑測試中…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 情境卡與頁面
 * ══════════════════════════════════════════════════════════════ */

/** 「該設的邊界」：播到最後一格才翻開。墨色實線框＋粗體，不佔強調色 */
function BoundaryCard({ boundary, shown }: { boundary: Scene['boundary']; shown: boolean }) {
  if (!shown) {
    return (
      <div className="flex h-[98px] shrink-0 items-center gap-5 rounded-2xl border-2 border-dashed border-line px-6">
        <span className={LABEL_FAINT}>該設的邊界</span>
        <span className="text-[20px] text-faint">播到最後揭曉</span>
      </div>
    );
  }
  return (
    <div className="slide-enter flex h-[98px] shrink-0 items-center gap-5 rounded-2xl border-2 border-paper bg-panel-lift px-6">
      <BoundaryGlyph />
      <span className={`${LABEL_TYPE} shrink-0 text-paper`}>該設的邊界</span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[25px] leading-tight font-bold text-paper">{boundary.head}</span>
        <span className="text-[20px] leading-snug text-muted">{boundary.text}</span>
      </span>
    </div>
  );
}

function SceneCard({ scene, mode }: { scene: Scene; mode: PlayMode }) {
  const player = usePlayer(scene.last, scene.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      <div className="flex h-12 shrink-0 items-center gap-4">
        {/* 不用 LABEL_TYPE：它帶 uppercase，會把 01-a 變成 01-A，跟左欄的 a／b 對不上 */}
        <span className="shrink-0 font-display text-[17px] tracking-[0.16em] text-coral">
          狀況 {scene.no}
        </span>
        <span className="text-[30px] leading-none font-semibold text-paper">{scene.title}</span>
        <PlayerControls player={player} />
      </div>

      <p className="h-[66px] shrink-0 text-[22px] leading-normal text-paper">{scene.desc}</p>

      <div className="h-[410px] shrink-0">
        {scene.id === 'shallow' && <ShallowScene tick={player.tick} />}
        {scene.id === 'release' && <ReleaseScene tick={player.tick} />}
        {scene.id === 'detour' && <DetourScene tick={player.tick} />}
        {scene.id === 'wrongTest' && <WrongTestScene tick={player.tick} />}
      </div>

      <BoundaryCard boundary={scene.boundary} shown={player.atEnd} />
    </div>
  );
}

export function BoundaryDemo() {
  const [picked, setPicked] = useState<SceneId>('shallow');
  const [touched, setTouched] = useState(false);
  const scene = SCENES.find((item) => item.id === picked) ?? SCENES[0];

  const pick = (id: SceneId) => {
    setPicked(id);
    setTouched(true);
  };

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：三種狀況 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>Loop Engineering 常見的三種狀況</span>
        <div className="flex flex-col gap-3">
          {GROUPS.map((group, index) => {
            const on = group.scenes.includes(picked);
            return (
              <Fragment key={group.name}>
                <MenuItem
                  index={index}
                  name={group.name}
                  sub={group.sub}
                  on={on}
                  onClick={() => {
                    if (!on) pick(group.scenes[0]);
                  }}
                />
                {group.scenes.length > 1 && (
                  <div className="ml-[26px] flex flex-col gap-2 border-l-2 border-line pl-5">
                    {SUBS.map((sub) => (
                      <SubItem
                        key={sub.id}
                        letter={sub.letter}
                        text={sub.text}
                        on={sub.id === picked}
                        onClick={() => pick(sub.id)}
                      />
                    ))}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="mt-auto flex shrink-0 items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel px-6 py-4">
          <BoundaryGlyph />
          <p className="text-[22px] leading-normal text-paper">
            為了避免 AI 陷入死循環，
            <br />
            <span className="font-bold">都要設定邊界</span>。
          </p>
        </div>
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <SceneCard key={picked} scene={scene} mode={touched ? 'play' : 'still'} />
    </div>
  );
}
