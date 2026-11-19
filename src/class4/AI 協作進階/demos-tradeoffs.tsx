import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— SubAgent 與 Ultracode 的取捨
 *
 *   第 22 頁  DrawbacksDemo     SubAgent 的缺點
 *   第 27 頁  UltracodeExpDemo  Ultracode 實際使用心得
 *
 * 兩頁都是講師指定的「左邊是選項，右邊呈現情境」：左欄是可點的選單
 * （標題＋一句重點），右欄是一張情境卡 —— 上面一句 callout 原文，下面是
 * 可以播放的情境。情境卡右上角有「播放／暫停／重播」與「下一步」。
 *
 * 播放的規則（兩頁共用 usePlayer）：
 *   - 一進這一頁，預設那一項直接停在「播完」的畫面，講師可以先講再按重播。
 *   - 在左欄點了別的選項之後，右邊會從頭自動播一次。
 *
 * 文字來源：Notion「AI 協作進階－SubAgents 與外部服務整合」的 callout。
 * 說明文字照原文精簡斷句；「→」後面的講師經驗也放進畫面。
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫，可以整段換掉）：
 *   第 22 頁
 *     - 貴：檔名 login.ts／session.ts／auth.md、三位 SubAgent。
 *     - 無法來回討論：「做登入頁 → 改成用手機號碼登入」這段對話。
 *     - 啟動有延遲：「把按鈕文字從送出改成登入」這個小修改，兩條進度條的比例。
 *     - 難除錯：四條執行緒的分工、/v1 與 /v2 這個錯誤。
 *   第 27 頁
 *     - Token 燒很快：40 個方塊、token 計數器的數字（畫面上標了「示意數字」）。
 *       「一般的 SubAgent 一次派 3–4 位」取自本簡報第 24 頁。
 *     - 減少 Context：12 位 SubAgent、百分比，以及「全塞在主 Agent」的對照條。
 *     - 研究成果：資料 A／B／C。
 *     - 對抗式驗證：搜尋框 debounce 的一來一往。
 *     - 過度驗證：單元／整合／E2E／其他驗證四段的切法；30% 取自 callout。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
/** 第 22 頁：acid 是「目前選取／主要操作」 */
const BTN_PRIMARY_ACID = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
/** 第 27 頁：acid 讓給不出場，主要按鈕用墨色實心 */
const BTN_PRIMARY_INK = `${BTN} border-paper bg-paper font-medium text-on-accent hover:opacity-90`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-paper disabled:border-line-soft disabled:text-faint`;

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity,width] duration-500 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  coral: 'var(--color-coral)',
  teal: 'var(--color-teal)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix }: { prefix: string }) {
  const tones: Record<string, string> = {
    muted: C.muted,
    paper: C.paper,
    coral: C.coral,
    teal: C.teal,
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

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心（同 demos-subagent.tsx） */
function Person({
  cx,
  cy,
  r,
  color,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
}) {
  const shoulder = r * 1.7;
  const top = cy + r * 1.35;
  const bottom = cy + r * 3.2;
  return (
    <g stroke={color} strokeWidth={2.5} fill={C.inkSoft}>
      <circle cx={cx} cy={cy} r={r} />
      <path
        d={`M${cx - shoulder} ${bottom} Q${cx - shoulder} ${top} ${cx} ${top} Q${cx + shoulder} ${top} ${cx + shoulder} ${bottom} Z`}
      />
    </g>
  );
}

/* ── 播放器 ─────────────────────────────────────────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的選項時）
 * 情境卡用選項 id 當 key，換選項就整張重掛，狀態自然歸零。
 * run 每重播一次加一，給有自己狀態的情境（難除錯）當 key 重置用。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode) {
  const [tick, setTick] = useState(mode === 'still' ? last : 0);
  const [playing, setPlaying] = useState(mode === 'play');
  const [run, setRun] = useState(0);

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
      setRun((value) => value + 1);
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

  return { tick, run, atEnd, toggle, step, label };
}

type Player = ReturnType<typeof usePlayer>;

function PlayerControls({ player, primary }: { player: Player; primary: string }) {
  return (
    <div className="ml-auto flex shrink-0 gap-3">
      <button type="button" onClick={player.toggle} className={primary}>
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

/** 時間軸上的一段色塊。外層管寬度（會 transition），內層管顏色與字 */
function TrackSegment({
  left,
  width,
  tone,
  label,
}: {
  left: number;
  width: number;
  tone: 'muted' | 'coral';
  label: string;
}) {
  return (
    <div
      className="absolute inset-y-0 overflow-hidden py-1.5 transition-[width] duration-500 ease-linear"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <div
        className={`mx-0.5 flex h-full items-center rounded-lg px-3 text-[18px] font-semibold whitespace-nowrap text-on-accent ${
          tone === 'coral' ? 'bg-coral' : 'bg-muted'
        }`}
      >
        {label}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 22 頁 · DrawbacksDemo — SubAgent 的缺點
 *
 * callout 原文重點：
 *   1. 貴：每個 subagent 都要自己跑模型和工具，而且常常需要重新讀取主對話
 *      已經讀過的檔案。兩個平台的官方文件都特別提醒這一點。平行開越多，
 *      消耗越可觀。
 *   2. 無法來回討論：適合「交辦後等結果」，不適合反覆修正。Claude Code 的
 *      subagent 甚至不能主動問你問題，模糊的地方只能自己判斷。
 *      → 臨時改變主意，主 Agent 只能把 SubAgent 關掉，再派新的來銜接。
 *   3. 啟動有延遲：要時間重新蒐集背景，快速、小範圍的修改直接在主對話做比較快。
 *      → 像 Ultracode 可以派出大量 SubAgent，單純的小任務用單一主 Agent 反而快。
 *   4. 比較難除錯和追蹤／不知道主對話的脈絡：工作分散在好幾個執行緒，出問題
 *      要逐一打開紀錄。→ 隨著模型越來越強，這類狀況越來越不明顯。
 *
 * 左：四個缺點（MenuItem）。右：情境卡 ——
 *   貴          主對話讀過的檔案，三位 SubAgent 各自再讀一次；token 條一段一段疊長
 *   無法來回討論  三條泳道（你／主 Agent／SubAgent）的時間軸，五個步驟
 *   啟動有延遲    同一個小修改，兩條進度條賽跑
 *   難除錯        四條執行緒，一條一條打開紀錄（可以自己點，也可以播放）
 * 情境卡最下面一條是「補充／實際使用上」，放 callout 裡「→」後面那句。
 *
 * 用色：acid＝目前選取（選單、步驟條的目前這一步、播放鍵）；coral＝缺點／代價。
 *   其他一律中性。沒有 teal。
 *
 * 高度預算（根容器 720 × 1740）：
 *   寬  左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）
 *   左  標籤 26 ＋ gap 16 ＋ 四張選單 flex-1（(678 − 36) ÷ 4 ≈ 160／張）
 *   右  卡片 py 24×2 ＋ 邊框 2 → 內高 670
 *       ＝ 標題列 48 ＋ 16 ＋ 說明 66（22px 兩行）＋ 16 ＋ 情境 400 ＋ 16 ＋ 補充 108
 *   情境 400 各自的分配寫在各情境上面。
 * ══════════════════════════════════════════════════════════════ */

type DrawbackId = 'cost' | 'noTalk' | 'delay' | 'debug';

interface Drawback {
  id: DrawbackId;
  name: string;
  sub: string;
  desc: string;
  noteLabel: string;
  note: string;
  /** 情境的最後一格與每格毫秒數 */
  last: number;
  ms: number;
}

const DRAWBACKS: readonly Drawback[] = [
  {
    id: 'cost',
    name: '貴',
    sub: '每個 SubAgent 都要自己跑模型和工具',
    desc: '每個 SubAgent 都要自己跑模型和工具，而且常常需要重新讀取主對話已經讀過的檔案。平行開越多，消耗越可觀。',
    noteLabel: '補充',
    note: '兩個平台的官方文件都特別提醒這一點。',
    last: 3,
    ms: 1100,
  },
  {
    id: 'noTalk',
    name: '無法來回討論',
    sub: '適合交辦後等結果，不適合反覆修正',
    desc: 'SubAgent 適合「交辦後等結果」的任務，不適合需要反覆修正的工作。Claude Code 的 SubAgent 甚至不能主動問你問題，遇到模糊的地方只能自己判斷。',
    noteLabel: '實際使用上',
    note: '→ 如果你臨時改變主意，主 Agent 通常只能直接把 SubAgent 關掉，再派新的 SubAgent 來銜接你想調整的方向。',
    last: 5,
    ms: 1300,
  },
  {
    id: 'delay',
    name: '啟動有延遲',
    sub: '要先花時間重新蒐集背景資訊',
    desc: 'SubAgent 需要時間重新蒐集背景資訊。對於快速、小範圍的修改來說，直接在主對話做反而比較快。',
    noteLabel: '實際使用上',
    note: '→ 像 Claude Code 的 Ultracode 可以派出大量的 SubAgent；但如果只是單純的小任務，直接使用單一主 Agent 還會比較快。',
    last: 7,
    ms: 550,
  },
  {
    id: 'debug',
    name: '比較難除錯和追蹤',
    sub: '不知道主對話的脈絡，工作又分散在多條執行緒',
    desc: '工作分散在好幾個執行緒裡，出問題時要逐一打開 SubAgent 的紀錄，才知道它做了什麼、為什麼做錯。',
    noteLabel: '實際使用上',
    note: '→ 隨著模型越來越強，其實這類狀況越來越不明顯。',
    last: 3,
    ms: 1100,
  },
];

/** 左側選單的一列（同 demos-subagent.tsx 的 MenuItem，改成撐滿高度） */
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
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
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

/* ── 01 貴 ───────────────────────────────────────────────
 * tick ＝ 已經派出的 SubAgent 數（0–3）。
 * 高度：主對話 88 ＋ 12 ＋ 三列 64×3 ＋ 12×2 ＋ 12 ＋ token 條 72 ＝ 400 */

const COST_FILES = ['login.ts', 'session.ts', 'auth.md'] as const;
const COST_SUBS = ['SubAgent 1', 'SubAgent 2', 'SubAgent 3'] as const;

function FileChip({ name, reread }: { name: string; reread: boolean }) {
  return (
    <span
      className={`rounded-lg border bg-panel px-3 py-1 font-mono text-[18px] ${
        reread ? 'border-coral text-coral' : 'border-line text-paper'
      }`}
    >
      {name}
    </span>
  );
}

function CostScene({ tick }: { tick: number }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex h-[88px] shrink-0 items-center gap-6 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-6">
        <div className="flex w-[180px] shrink-0 flex-col">
          <span className="text-[24px] font-semibold text-paper">主對話</span>
          <span className="text-[18px] text-muted">已經讀過這些檔案</span>
        </div>
        <div className="flex gap-2">
          {COST_FILES.map((file) => (
            <FileChip key={file} name={file} reread={false} />
          ))}
        </div>
      </div>

      {COST_SUBS.map((name, index) =>
        index < tick ? (
          <div
            key={name}
            className="slide-enter flex h-[64px] shrink-0 items-center gap-6 rounded-2xl border border-coral/55 border-l-[6px] border-l-coral bg-panel px-6"
          >
            <span className="w-[180px] shrink-0 text-[22px] font-semibold text-paper">{name}</span>
            <span className="shrink-0 text-[18px] text-muted">又讀一次</span>
            <div className="flex gap-2">
              {COST_FILES.map((file) => (
                <FileChip key={file} name={file} reread />
              ))}
            </div>
            <span className="ml-auto shrink-0 text-[19px] font-semibold text-coral">
              ＋ 自己跑模型與工具
            </span>
          </div>
        ) : (
          <div
            key={name}
            className="flex h-[64px] shrink-0 items-center rounded-2xl border-2 border-dashed border-line px-6 text-[20px] text-faint"
          >
            {name} · 尚未派出
          </div>
        ),
      )}

      <div className="flex h-[72px] shrink-0 flex-col gap-2">
        <div className="flex h-7 items-center justify-between">
          <span className={LABEL_FAINT}>token 消耗</span>
          <span className="text-[19px] text-paper">
            同樣的檔案讀了{' '}
            <span className="font-semibold text-coral">{1 + tick}</span> 次
          </span>
        </div>
        <div className="flex h-9 w-full overflow-hidden rounded-lg bg-ink-soft">
          {['主對話', ...COST_SUBS].map((name, index) => (
            <div
              key={name}
              className="h-full shrink-0 overflow-hidden transition-[width] duration-500 ease-out"
              style={{ width: index <= tick ? '24%' : '0%' }}
            >
              <div
                className={`mr-1 flex h-full items-center rounded-md px-3 text-[17px] font-semibold whitespace-nowrap text-on-accent ${
                  index === 0 ? 'bg-muted' : 'bg-coral'
                }`}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 02 無法來回討論 ─────────────────────────────────────
 * 三條泳道的時間軸（SVG）＋ 下方五步的步驟條。tick ＝ 走到第幾步（0–5）。
 * 座標（viewBox 1100 × 340，1:1 呈現）：
 *   泳道中心 y 56／170／284，分隔線 y 113／227；泳道名稱在 x 0–150
 *   ① 交辦       你的氣泡 (180, 30) 220×52 → 主 Agent「派出 A」(180, 144)
 *   ② 埋頭做     SubAgent A 的長條從 x 200 長到 560
 *   ③ 改主意     你的氣泡 (540, 30) 320×52；A 還不知道，繼續長到 700
 *   ④ 停掉       主 Agent「只能停掉 A」(620, 144)，A 變 coral、尾端一個 ✕
 *   ⑤ 再派新的   主 Agent「再派 SubAgent B」(830, 144) → B 的長條 (830, 258)
 * 高度：SVG 340 ＋ gap 12 ＋ 步驟條 48 ＝ 400 */

const NT_ARROW = 'tf-nt-arrow';

const NT_STEPS = [
  '交辦',
  'SubAgent 埋頭做',
  '你中途改主意',
  '主 Agent 停掉它',
  '再派新的接手',
] as const;

const NT_LANES: readonly { cy: number; name: string; sub: string }[] = [
  { cy: 56, name: '你', sub: '下指令的人' },
  { cy: 170, name: '主 Agent', sub: '對話框裡那一位' },
  { cy: 284, name: 'SubAgent', sub: '不能主動問你問題' },
];

function SvgBox({
  x,
  y,
  w,
  text,
  tone,
  pill = false,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  tone: 'muted' | 'paper' | 'coral';
  pill?: boolean;
}) {
  const coral = tone === 'coral';
  return (
    <g className="slide-enter">
      <rect
        x={x}
        y={y}
        width={w}
        height={52}
        rx={pill ? 26 : 12}
        fill={coral ? C.coral : C.inkSoft}
        fillOpacity={coral ? 0.14 : 1}
        stroke={coral ? C.coral : tone === 'paper' ? C.paper : C.muted}
        strokeWidth={coral ? 3 : 2.5}
      />
      <text
        x={x + w / 2}
        y={y + 33}
        textAnchor="middle"
        fontSize={20}
        fontWeight={coral ? 600 : 500}
        fill={coral ? C.coral : C.paper}
      >
        {text}
      </text>
    </g>
  );
}

function DownArrow({ x, y1, y2, tone }: { x: number; y1: number; y2: number; tone: 'muted' | 'coral' }) {
  return (
    <path
      className="slide-enter"
      d={`M ${x} ${y1} L ${x} ${y2}`}
      stroke={tone === 'coral' ? C.coral : C.muted}
      strokeWidth={tone === 'coral' ? 3 : 2.5}
      markerEnd={`url(#${NT_ARROW}-${tone})`}
    />
  );
}

function StepStrip({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <div className="grid h-12 shrink-0 grid-cols-5 gap-2">
      {steps.map((label, index) => {
        const no = index + 1;
        const style =
          no === current
            ? 'border-acid bg-acid/14 font-semibold text-acid'
            : no < current
              ? 'border-line text-paper'
              : 'border-dashed border-line text-faint';
        return (
          <span
            key={label}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 text-[18px] transition-colors duration-300 ${style}`}
          >
            <span className="font-mono">{no}</span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function NoTalkScene({ tick }: { tick: number }) {
  const stopped = tick >= 4;
  const barEnd = tick >= 3 ? 700 : tick === 2 ? 560 : 360;
  const barText = stopped
    ? 'A 做到一半，只能作廢'
    : tick >= 2
      ? 'A 埋頭做・模糊處自己判斷'
      : 'A 開始做';

  return (
    <div className="flex h-full flex-col gap-3">
      <svg viewBox="0 0 1100 340" className="h-[340px] w-full shrink-0" role="img">
        <title>
          交辦給 SubAgent 之後它就埋頭做；你中途改主意，主 Agent 只能停掉它，再派一個新的接手
        </title>
        <ArrowMarkers prefix={NT_ARROW} />

        {/* 泳道 */}
        {[113, 227].map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={1100}
            y2={y}
            stroke={C.line}
            strokeWidth={1.5}
            strokeDasharray="4 8"
          />
        ))}
        {NT_LANES.map((lane) => (
          <g key={lane.name}>
            <text x={0} y={lane.cy - 2} fontSize={24} fontWeight={600} fill={C.paper}>
              {lane.name}
            </text>
            <text x={0} y={lane.cy + 26} fontSize={17} fill={C.muted}>
              {lane.sub}
            </text>
          </g>
        ))}

        {tick === 0 && (
          <text x={640} y={176} textAnchor="middle" fontSize={20} fill={C.muted}>
            按「播放」，看一次交辦的過程
          </text>
        )}

        {/* ① 交辦 */}
        {tick >= 1 && (
          <g>
            <SvgBox x={180} y={30} w={220} text="交辦：做登入頁" tone="muted" pill />
            <DownArrow x={290} y1={84} y2={138} tone="muted" />
            <SvgBox x={180} y={144} w={220} text="派出 SubAgent A" tone="paper" />
            <DownArrow x={290} y1={198} y2={252} tone="muted" />
          </g>
        )}

        {/* ② 埋頭做 → ④ 作廢：同一條長條 */}
        {tick >= 1 && (
          <g>
            <rect
              x={200}
              y={258}
              width={barEnd - 200}
              height={52}
              rx={12}
              fill={stopped ? C.coral : C.inkSoft}
              fillOpacity={stopped ? 0.14 : 1}
              stroke={stopped ? C.coral : C.paper}
              strokeWidth={stopped ? 3 : 2.5}
              className={SVG_TR}
            />
            <text
              x={220}
              y={291}
              fontSize={20}
              fontWeight={stopped ? 600 : 500}
              fill={stopped ? C.coral : C.paper}
            >
              {barText}
            </text>
          </g>
        )}

        {/* ③ 改主意 */}
        {tick >= 3 && (
          <g>
            <SvgBox x={540} y={30} w={320} text="等等，改成用手機號碼登入" tone="paper" pill />
            <DownArrow x={700} y1={84} y2={138} tone="muted" />
          </g>
        )}

        {/* ④ 停掉 */}
        {tick >= 4 && (
          <g>
            <SvgBox x={620} y={144} w={160} text="只能停掉 A" tone="coral" />
            <DownArrow x={700} y1={198} y2={258} tone="coral" />
            <g className="slide-enter">
              <circle cx={700} cy={284} r={20} fill={C.panel} stroke={C.coral} strokeWidth={3} />
              <path
                d="M 692 276 L 708 292 M 708 276 L 692 292"
                stroke={C.coral}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            </g>
          </g>
        )}

        {/* ⑤ 再派新的 */}
        {tick >= 5 && (
          <g>
            <SvgBox x={830} y={144} w={250} text="再派 SubAgent B" tone="paper" />
            <DownArrow x={955} y1={198} y2={252} tone="muted" />
            <SvgBox x={830} y={258} w={250} text="B 依新方向接手" tone="paper" />
          </g>
        )}
      </svg>

      <StepStrip steps={NT_STEPS} current={tick} />
    </div>
  );
}

/* ── 03 啟動有延遲 ───────────────────────────────────────
 * 時間軸以 % 表示，每一格 10%。
 *   主 Agent 直接改：修改 0–20%
 *   派 SubAgent    ：重新蒐集背景 0–50% → 修改 50–70%
 * tick 0–7（每格 550ms，配 500ms linear 的寬度 transition，看起來是連續在跑）。
 * 高度：任務 60 ＋ 28 ＋ 跑道 98 ＋ 28 ＋ 跑道 98 ＋ 12 ＋ 括號 52 ＝ 376 */

const DELAY_A_EDIT = 20;
const DELAY_B_GATHER = 50;
const DELAY_B_EDIT = 20;

function RaceLane({
  name,
  sub,
  children,
}: {
  name: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2.5">
      <div className="flex h-8 items-baseline gap-4">
        <span className="text-[24px] font-semibold text-paper">{name}</span>
        <span className="text-[19px] text-muted">{sub}</span>
      </div>
      <div className="relative h-14 w-full rounded-xl border border-line bg-ink-soft">
        {children}
      </div>
    </div>
  );
}

function DoneFlag({ at, text }: { at: number; text: string }) {
  return (
    <span
      className="slide-enter absolute top-1/2 -translate-y-1/2 text-[20px] font-semibold whitespace-nowrap text-paper"
      style={{ left: `calc(${at}% + 14px)` }}
    >
      {text}
    </span>
  );
}

function DelayScene({ tick }: { tick: number }) {
  const p = tick * 10;
  const aDone = p >= DELAY_A_EDIT;
  const bEnd = DELAY_B_GATHER + DELAY_B_EDIT;
  const bDone = p >= bEnd;

  return (
    <div className="flex h-full flex-col gap-7">
      <div className="flex h-[60px] shrink-0 items-center gap-6 rounded-2xl border border-line bg-panel-lift px-6">
        <span className={LABEL_FAINT}>同一個小修改</span>
        <span className="text-[22px] text-paper">把按鈕文字從「送出」改成「登入」</span>
      </div>

      <RaceLane name="主 Agent 直接改" sub="背景早就在主對話裡">
        <TrackSegment left={0} width={Math.min(p, DELAY_A_EDIT)} tone="muted" label="修改" />
        {aDone && <DoneFlag at={DELAY_A_EDIT} text="✓ 完成，可以交給你了" />}
      </RaceLane>

      <div className="flex shrink-0 flex-col gap-3">
        <RaceLane name="派 SubAgent 去改" sub="要先重新蒐集背景，才開始改">
          <TrackSegment
            left={0}
            width={Math.min(p, DELAY_B_GATHER)}
            tone="coral"
            label="重新蒐集背景：讀檔、了解專案"
          />
          <TrackSegment
            left={DELAY_B_GATHER}
            width={clamp(p - DELAY_B_GATHER, 0, DELAY_B_EDIT)}
            tone="muted"
            label="修改"
          />
          {bDone && <DoneFlag at={bEnd} text="✓ 完成" />}
        </RaceLane>

        <div className="relative h-[52px] shrink-0">
          {bDone && (
            <div
              className="slide-enter absolute top-0 flex flex-col items-center"
              style={{ left: `${DELAY_A_EDIT}%`, width: `${bEnd - DELAY_A_EDIT}%` }}
            >
              <div className="h-4 w-full rounded-b-md border-x-2 border-b-2 border-coral" />
              <span className="mt-1 text-[19px] font-semibold whitespace-nowrap text-coral">
                比直接改多等的時間，都花在重新蒐集背景
              </span>
            </div>
          )}
          <span className="absolute top-0 right-0 text-[18px] text-muted">時間 →</span>
        </div>
      </div>
    </div>
  );
}

/* ── 04 比較難除錯和追蹤 ─────────────────────────────────
 * 四條執行緒，一條一條打開紀錄。播放／下一步會依序打開，也可以直接點某一條。
 * 第三條出錯：它不知道主對話早就改了做法。tick ＝ 自動打開的條數（0–3）。
 * 高度：結果列 64 ＋ 四列 72×4 ＋ gap 12×4 ＝ 400 */

const DEBUG_THREADS: readonly { name: string; log: string; why?: string }[] = [
  { name: '搜尋檔案', log: '找到 login.ts、session.ts、client.ts' },
  { name: '修改表單', log: '在 login.ts 補上欄位檢查' },
  {
    name: '串接 API',
    log: '把登入請求送到 /v1/login',
    why: '主對話早就決定改用 /v2，它不知道這個脈絡',
  },
  { name: '補測試', log: '補了 3 個測試，全部通過' },
];

function DebugScene({ tick }: { tick: number }) {
  const [manual, setManual] = useState<readonly boolean[]>(() =>
    DEBUG_THREADS.map(() => false),
  );

  const isOpen = (index: number) => index < tick || manual[index];
  const openCount = DEBUG_THREADS.filter((_, index) => isOpen(index)).length;
  const foundAt = DEBUG_THREADS.findIndex((thread, index) => thread.why && isOpen(index));

  const open = (index: number) =>
    setManual((value) => value.map((item, i) => (i === index ? true : item)));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex h-[64px] shrink-0 items-center gap-5 rounded-2xl border border-coral/55 border-l-[6px] border-l-coral bg-panel px-6">
        <span className={LABEL_FAINT}>主 Agent</span>
        <span className="text-[21px] text-paper">
          4 位 SubAgent 都回報完成，但登入還是失敗。
        </span>
        <span
          className={`ml-auto shrink-0 text-[19px] ${
            foundAt >= 0 ? 'font-semibold text-coral' : 'text-muted'
          }`}
        >
          {foundAt >= 0
            ? `問題在 SUB ${pad2(foundAt + 1)}`
            : `已打開 ${openCount} / ${DEBUG_THREADS.length} 份紀錄`}
        </span>
      </div>

      {DEBUG_THREADS.map((thread, index) => {
        const opened = isOpen(index);
        const bad = opened && Boolean(thread.why);
        const tone = bad
          ? 'border-coral border-l-coral bg-coral/14'
          : opened
            ? 'border-line border-l-muted bg-panel'
            : 'border-line-soft border-l-line bg-panel-lift hover:border-line';
        return (
          <button
            key={thread.name}
            type="button"
            onClick={() => open(index)}
            disabled={opened}
            className={`grid h-[72px] shrink-0 grid-cols-[250px_1fr_auto] items-center gap-5 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-300 disabled:cursor-default ${tone}`}
          >
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-[17px] text-faint">SUB {pad2(index + 1)}</span>
              <span className="text-[22px] font-semibold text-paper">{thread.name}</span>
            </span>

            {opened ? (
              <span className="slide-enter flex min-w-0 flex-col">
                <span className="truncate font-mono text-[19px] leading-normal text-paper">
                  {thread.log}
                </span>
                <span
                  className={`truncate text-[18px] leading-normal ${
                    bad ? 'font-semibold text-coral' : 'text-muted'
                  }`}
                >
                  {bad ? `✕ ${thread.why}` : '✓ 看起來沒問題'}
                </span>
              </span>
            ) : (
              <span className="text-[19px] text-faint">紀錄還沒打開</span>
            )}

            {bad ? (
              <span className="rounded-lg bg-coral px-3 py-1 text-[18px] font-semibold text-on-accent">
                問題在這
              </span>
            ) : opened ? (
              <span className="px-3 text-[18px] text-muted">已檢查</span>
            ) : (
              <span className="rounded-lg border border-line bg-panel px-3 py-1 text-[18px] text-paper">
                打開紀錄 ▸
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DrawbackCard({
  index,
  item,
  mode,
}: {
  index: number;
  item: Drawback;
  mode: PlayMode;
}) {
  const player = usePlayer(item.last, item.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} text-coral`}>缺點 {pad2(index + 1)}</span>
        <span className="text-[30px] leading-none font-semibold text-paper">{item.name}</span>
        <PlayerControls player={player} primary={BTN_PRIMARY_ACID} />
      </div>

      <p className="h-[66px] shrink-0 text-[22px] leading-normal text-paper">{item.desc}</p>

      <div className="h-[400px] shrink-0">
        {item.id === 'cost' && <CostScene tick={player.tick} />}
        {item.id === 'noTalk' && <NoTalkScene tick={player.tick} />}
        {item.id === 'delay' && <DelayScene tick={player.tick} />}
        {item.id === 'debug' && <DebugScene key={player.run} tick={player.tick} />}
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-muted bg-panel-lift px-6">
        <span className={`${LABEL_FAINT} shrink-0`}>{item.noteLabel}</span>
        <p className="text-[21px] leading-normal text-paper">{item.note}</p>
      </div>
    </div>
  );
}

export function DrawbacksDemo() {
  const [picked, setPicked] = useState<DrawbackId>('cost');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    DRAWBACKS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：四個缺點 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>SubAgent 的四個缺點</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {DRAWBACKS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              sub={item.sub}
              on={item.id === picked}
              onClick={() => {
                setPicked(item.id);
                setTouched(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <DrawbackCard
        key={picked}
        index={index}
        item={DRAWBACKS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 27 頁 · UltracodeExpDemo — Ultracode 實際使用心得
 *
 * callout 原文重點：
 *   1. Token 燒很快：顧名思義，它一次會派出數十個 SubAgents 來進行工作。
 *   2. 大幅減少 Context window 消耗：任務都交辦給 SubAgent，主 Agent 的
 *      Context Window 消耗得很少，有時候開發大型專案上下文都還不用壓縮。
 *   3. 研究成果非常強：主 Agent 像單一員工，看到什麼就回報；多個 Agent 會
 *      來回比對不同的研究內容，統整出新的成果。
 *   4. 對抗式驗證：不確定怎麼做比較好時，啟用另一個 SubAgent 來確保成果
 *      是當下最合適的。
 *   5. 很多時候會過度驗證：能跑的測試盡可能跑完，更花 token 與時間。有時候
 *      要求它做完就交、不要過度驗證（尤其是時間，不做額外驗證只要 30%）。
 *
 * 左：五張選單，每張右側一枚實心小標籤「代價」（1、5）或「優點」（2、3、4）。
 * 右：情境卡 ——
 *   Token 燒很快  40 個 SubAgent 方塊一波一波亮起，token 計數器往上跳
 *   減少 Context  主 Agent 的量表幾乎沒動；工作都在 12 位 SubAgent 各自的 Context
 *   研究成果      左：單一主 Agent 看到什麼回報什麼；右：三位 Agent 來回比對再統整
 *   對抗式驗證    A 提案 → B 挑錯 → A 修正 → B 找不到反駁 → 留下 v2
 *   過度驗證      能跑的都跑完（100%）vs 做完就交（約 30%）兩條時間軸
 *
 * 用色（守住兩支）：coral＝代價、teal＝優點。
 *   「目前選取」不用 acid，改用中性的墨色：選單選到的那張是 paper 左粗條＋
 *   panel-lift 底＋粗體，編號圓點填 paper；播放鍵也是墨色實心。
 *
 * 高度預算（根容器 720 × 1740）：
 *   寬  左欄 560 ＋ gap 32 ＋ 右欄 1148（卡片內寬 1148 − 2 − 64 ＝ 1082）
 *   左  標籤 26 ＋ gap 16 ＋ 五張選單 flex-1（(678 − 40) ÷ 5 ≈ 127／張；
 *       標題最多兩行 65 ＋ 說明一行 26 ＋ py 24 ＝ 119，放得下）
 *   右  卡片內高 670 ＝ 標題列 48 ＋ 16 ＋ 說明 99（22px 三行）＋ 16 ＋ 情境 491
 *       各情境都設計在 480 以內，數字寫在各情境上面。
 * ══════════════════════════════════════════════════════════════ */

type ExpId = 'burn' | 'context' | 'research' | 'adversarial' | 'overVerify';
type ExpKind = 'cost' | 'gain';

interface Experience {
  id: ExpId;
  kind: ExpKind;
  name: string;
  sub: string;
  desc: string;
  last: number;
  ms: number;
}

const EXPERIENCES: readonly Experience[] = [
  {
    id: 'burn',
    kind: 'cost',
    name: 'Token 燒很快',
    sub: '一次會派出數十個 SubAgent 來工作',
    desc: '顧名思義，它一次會派出數十個 SubAgent 來進行工作。',
    last: 10,
    ms: 380,
  },
  {
    id: 'context',
    kind: 'gain',
    name: '大幅減少 Context window 消耗',
    sub: '工作都交辦出去，主 Agent 用得很少',
    desc: '因為它把所有的任務都交辦給 SubAgent，所以主 Agent 的 Context Window 會消耗得很少。有時候開發一個大型專案，它的上下文都還不用進行壓縮。',
    last: 6,
    ms: 900,
  },
  {
    id: 'research',
    kind: 'gain',
    name: '研究成果非常強',
    sub: '多個 Agent 來回比對，統整出新成果',
    desc: '派 Claude Code 去做研究時，主 Agent 就像單一的員工，看到什麼樣的成果就直接回報給你；多個 Agent 則會來回比對不同的研究內容，再統整出一個新的成果。所以我認為它在做研究上非常有幫助。',
    last: 4,
    ms: 1300,
  },
  {
    id: 'adversarial',
    kind: 'gain',
    name: '對抗式驗證',
    sub: '另一個 SubAgent 確保成果最合適',
    desc: '研究成果很強，在開發上也是如此。當一個成果不確定怎麼做比較好的時候，它會啟用另外一個 SubAgent，來確保這個成果是當下最合適的。',
    last: 5,
    ms: 1300,
  },
  {
    id: 'overVerify',
    kind: 'cost',
    name: '很多時候會過度驗證',
    sub: '能跑的測試都跑完，更花 token 與時間',
    desc: '為了確保產出的品質，它有時會過度驗證，能跑的測試都會盡可能跑完 —— 這會消耗更多的 token，也花更多時間。有時候我甚至會要求它把事情做完、不要過度驗證，直接提供成果。',
    last: 10,
    ms: 450,
  },
];

const KIND_META: Record<ExpKind, { label: string; chip: string; text: string }> = {
  cost: { label: '代價', chip: 'bg-coral', text: 'text-coral' },
  gain: { label: '優點', chip: 'bg-teal', text: 'text-teal' },
};

function KindTag({ kind }: { kind: ExpKind }) {
  const meta = KIND_META[kind];
  return (
    <span
      className={`shrink-0 rounded-md px-3 py-1 text-[17px] font-semibold text-on-accent ${meta.chip}`}
    >
      {meta.label}
    </span>
  );
}

/** 第 27 頁的選單：選取用中性墨色，不用 acid */
function ExpMenuItem({
  index,
  item,
  on,
  onClick,
}: {
  index: number;
  item: Experience;
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
          ? 'border-paper border-l-paper bg-panel-lift'
          : 'border-line-soft border-l-line bg-panel hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} ${
          on ? 'border-paper bg-paper text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`text-[26px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {item.name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {item.sub}
        </span>
      </span>
      <KindTag kind={item.kind} />
    </button>
  );
}

/* ── 01 Token 燒很快 ─────────────────────────────────────
 * 8 × 5 ＝ 40 個方塊，每格亮 4 個；token 數字＝亮起數 × 37,500（示意）。
 * 寬：方塊區 1082 − 360 − 32 ＝ 690；高：標籤列 32 ＋ 12 ＋ 方塊 5 列 flex */

const BURN_AGENTS = 40;
const BURN_PER_TICK = 4;
const BURN_TOKENS_PER_AGENT = 37_500;

function BurnScene({ tick }: { tick: number }) {
  const lit = Math.min(BURN_AGENTS, tick * BURN_PER_TICK);
  const tokens = lit * BURN_TOKENS_PER_AGENT;

  return (
    <div className="grid h-full max-h-[480px] grid-cols-[1fr_360px] gap-8">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex h-8 shrink-0 items-center justify-between">
          <span className={LABEL_FAINT}>Ultracode 一次派出的 SubAgent</span>
          <span className="text-[19px] text-muted">
            執行中 <span className="font-semibold text-coral tabular-nums">{lit}</span> 位
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-8 grid-rows-5 gap-2.5">
          {Array.from({ length: BURN_AGENTS }, (_, i) => {
            const on = i < lit;
            return (
              <span
                key={i}
                className={`flex items-center justify-center rounded-xl border-2 font-mono text-[17px] transition-colors duration-300 ${
                  on
                    ? 'border-coral bg-coral text-on-accent'
                    : 'border-dashed border-line text-faint'
                }`}
                style={{ transitionDelay: `${(i % BURN_PER_TICK) * 70}ms` }}
              >
                {pad2(i + 1)}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5">
        <div className="rounded-2xl border border-coral/55 border-l-[6px] border-l-coral bg-panel px-7 py-6">
          <p className={LABEL_FAINT}>token 用量（示意數字）</p>
          <p className="mt-3 font-display text-[56px] leading-none font-semibold text-coral tabular-nums">
            {tokens.toLocaleString('en-US')}
          </p>
          <p className="mt-3 text-[20px] text-paper">數十個 SubAgent 同時在跑</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-soft">
            <div
              className="h-full bg-coral transition-[width] duration-300 ease-out"
              style={{ width: `${(lit / BURN_AGENTS) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-line px-7 py-5">
          <p className="text-[19px] text-muted">對照：一般的 SubAgent</p>
          <p className="mt-1 text-[22px] text-paper">一次派 3–4 位</p>
        </div>
      </div>
    </div>
  );
}

/* ── 02 大幅減少 Context window 消耗 ──────────────────────
 * 12 位 SubAgent 分三波開工（每波 4 位），各自的 Context 慢慢滿；
 * 主 Agent 只收回報，量表從 4% 走到 13%。對照條：全塞在主 Agent 會一路到 100%。
 * 高度：主量表 152 ＋ 20 ＋ 對照 68 ＋ 24 ＋ SubAgent 區 182 ＝ 446 */

const CTX_CAPS = [82, 68, 90, 74, 86, 62, 78, 88, 70, 84, 66, 80] as const;
const CTX_LAST = 6;

function ContextScene({ tick }: { tick: number }) {
  const main = Math.round(4 + tick * 1.5);
  const solo = Math.min(100, tick * 20);
  const done = tick >= CTX_LAST;

  return (
    <div className="flex h-full max-h-[480px] flex-col gap-5">
      <div className="shrink-0 rounded-2xl border border-teal/55 border-l-[6px] border-l-teal bg-panel px-6 py-4">
        <div className="flex h-9 items-baseline justify-between">
          <span className="text-[22px] font-semibold text-paper">主 Agent 的 Context Window</span>
          <span className="font-display text-[30px] font-semibold text-teal tabular-nums">
            {main}%
          </span>
        </div>
        <div className="mt-2 h-10 overflow-hidden rounded-lg border border-line bg-ink-soft">
          <div
            className="h-full bg-teal transition-[width] duration-500 ease-out"
            style={{ width: `${main}%` }}
          />
        </div>
        <div className="mt-2 flex h-7 items-center justify-between text-[19px]">
          <span className="text-muted">只收到每位 SubAgent 的回報</span>
          <span className={`font-semibold text-teal ${done ? 'slide-enter' : 'invisible'}`}>
            大型專案做完了，還不用壓縮
          </span>
        </div>
      </div>

      <div className="shrink-0 px-1">
        <div className="flex h-7 items-center justify-between text-[19px] text-muted">
          <span>對照：如果工作全都塞在主 Agent 自己的 Context</span>
          <span className="tabular-nums">{solo}%</span>
        </div>
        <div className="mt-2 h-8 overflow-hidden rounded-lg border border-dashed border-line bg-ink-soft">
          <div
            className="flex h-full items-center justify-end overflow-hidden bg-muted px-3 text-[17px] font-semibold whitespace-nowrap text-on-accent transition-[width] duration-500 ease-out"
            style={{ width: `${solo}%` }}
          >
            {solo >= 100 ? '滿了，要壓縮' : ''}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5">
        <span className={LABEL_FAINT}>工作都在 SubAgent 那邊，各自用各自的 Context</span>
        <div className="grid grid-cols-6 gap-2.5">
          {CTX_CAPS.map((cap, i) => {
            const wave = Math.floor(i / 4) + 1;
            const fill = clamp((tick - wave + 1) * 30, 0, cap);
            return (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-line bg-panel px-4 py-3"
              >
                <span className="font-mono text-[17px] text-faint">SUB {pad2(i + 1)}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-ink-soft">
                  <div
                    className="h-full bg-muted transition-[width] duration-500 ease-out"
                    style={{ width: `${fill}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 03 研究成果非常強 ───────────────────────────────────
 * 座標（viewBox 1080 × 480，以 1082 寬呈現，接近 1:1）：
 *   左半 x 0–400：資料 (200, 100) → 主 Agent (200, 272) → 回報框 (40, 378) 320×76
 *   分隔虛線 x 440
 *   右半 x 470–1080：資料 A/B/C 與三位 Agent 在 x 590／790／990，
 *        Agent 之間 y 316 的雙向虛線「比對」，最後匯進 (610, 380) 360×76 的統整框
 * tick：1 左邊跑完 → 2 右邊三位各讀一份 → 3 來回比對 → 4 統整
 * 用色：只有 teal（右邊、多個 Agent）。左邊單一員工一律中性。 */

const RS_ARROW = 'tf-rs-arrow';
const RS_XS = [590, 790, 990] as const;
const RS_DOCS = ['資料 A', '資料 B', '資料 C'] as const;

function DocGlyph({ cx, top, color }: { cx: number; top: number; color: string }) {
  const w = 64;
  const h = 80;
  const fold = 16;
  const x = cx - w / 2;
  return (
    <g stroke={color} strokeWidth={2.5} fill={C.inkSoft} strokeLinejoin="round">
      <path d={`M ${x} ${top} H ${x + w - fold} L ${x + w} ${top + fold} V ${top + h} H ${x} Z`} />
      <path d={`M ${x + w - fold} ${top} V ${top + fold} H ${x + w}`} fill="none" />
      {[0, 1, 2].map((row) => (
        <line
          key={row}
          x1={x + 12}
          y1={top + 34 + row * 14}
          x2={x + w - 14}
          y2={top + 34 + row * 14}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}

function ResearchScene({ tick }: { tick: number }) {
  const show = (from: number) => ({ opacity: tick >= from ? 1 : 0 });

  return (
    <svg viewBox="0 0 1080 480" className="h-[480px] w-full" role="img">
      <title>
        單一主 Agent 看到什麼就回報什麼；多個 Agent 各自研究不同資料、來回比對，再統整出新的成果
      </title>
      <ArrowMarkers prefix={RS_ARROW} />

      {/* ── 左：單一主 Agent ── */}
      <text x={20} y={34} fontSize={24} fontWeight={600} fill={C.paper}>
        單一主 Agent
      </text>
      <text x={20} y={64} fontSize={19} fill={C.muted}>
        像單一的員工
      </text>
      <g style={show(1)} className={SVG_TR}>
        <DocGlyph cx={200} top={100} color={C.muted} />
        <text x={200} y={206} textAnchor="middle" fontSize={17} fill={C.muted}>
          搜尋到的資料
        </text>
        <path
          d="M 200 216 L 200 244"
          stroke={C.muted}
          strokeWidth={2.5}
          markerEnd={`url(#${RS_ARROW}-muted)`}
        />
        <Person cx={200} cy={272} r={22} color={C.muted} />
        <path
          d="M 200 348 L 200 372"
          stroke={C.muted}
          strokeWidth={2.5}
          markerEnd={`url(#${RS_ARROW}-muted)`}
        />
        <rect x={40} y={378} width={320} height={76} rx={14} fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
        <text x={200} y={424} textAnchor="middle" fontSize={21} fontWeight={600} fill={C.paper}>
          看到什麼，就直接回報
        </text>
      </g>

      <line x1={440} y1={20} x2={440} y2={460} stroke={C.line} strokeWidth={2} strokeDasharray="6 8" />

      {/* ── 右：多個 Agent ── */}
      <text x={490} y={34} fontSize={24} fontWeight={600} fill={C.paper}>
        多個 Agent
      </text>
      <text x={490} y={64} fontSize={19} fill={C.muted}>
        來回比對不同的研究內容
      </text>

      <g style={show(2)} className={SVG_TR}>
        {RS_XS.map((x, i) => (
          <g key={x}>
            <DocGlyph cx={x} top={100} color={C.teal} />
            <text x={x} y={206} textAnchor="middle" fontSize={17} fill={C.muted}>
              {RS_DOCS[i]}
            </text>
            <path
              d={`M ${x} 216 L ${x} 244`}
              stroke={C.teal}
              strokeWidth={2.5}
              markerEnd={`url(#${RS_ARROW}-teal)`}
            />
            <Person cx={x} cy={272} r={22} color={C.teal} />
          </g>
        ))}
      </g>

      <g style={show(3)} className={SVG_TR}>
        {[
          [634, 746],
          [834, 946],
        ].map(([x1, x2]) => (
          <g key={x1}>
            <path
              d={`M ${x1} 318 L ${x2} 318`}
              stroke={C.teal}
              strokeWidth={2.5}
              strokeDasharray="7 6"
              markerStart={`url(#${RS_ARROW}-teal)`}
              markerEnd={`url(#${RS_ARROW}-teal)`}
            />
            <text
              x={(x1 + x2) / 2}
              y={306}
              textAnchor="middle"
              fontSize={18}
              fontWeight={600}
              fill={C.teal}
            >
              比對
            </text>
          </g>
        ))}
      </g>

      <g style={show(4)} className={SVG_TR}>
        {[
          [590, 690],
          [790, 790],
          [990, 890],
        ].map(([from, to]) => (
          <path
            key={from}
            d={`M ${from} 350 L ${to} 372`}
            stroke={C.teal}
            strokeWidth={2.5}
            markerEnd={`url(#${RS_ARROW}-teal)`}
          />
        ))}
        <rect
          x={610}
          y={378}
          width={360}
          height={76}
          rx={14}
          fill={C.teal}
          fillOpacity={0.14}
          stroke={C.teal}
          strokeWidth={3}
        />
        <text x={790} y={424} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.teal}>
          統整出一個新的成果
        </text>
      </g>
    </svg>
  );
}

/* ── 04 對抗式驗證 ───────────────────────────────────────
 * 一來一往的對話：A 提案 → B 挑錯 → A 修正 → B 找不到反駁 → 留下 v2。
 * 還沒輪到的那一則用 invisible 佔位，版面不會跳。
 * 高度：開頭 52 ＋ 12 ＋ 四則 68×4 ＋ 12×3 ＋ 16 ＋ 結論 72 ＝ 460 */

type AdvTone = 'plain' | 'challenge' | 'pass';

const ADV_TURNS: readonly { side: 'A' | 'B'; tone: AdvTone; label: string; text: string }[] = [
  { side: 'A', tone: 'plain', label: 'SubAgent A · 提出成果', text: 'v1：每輸入一個字，就打一次搜尋 API' },
  { side: 'B', tone: 'challenge', label: 'SubAgent B · 試著挑錯', text: '打字快的時候，會送出一大堆請求' },
  { side: 'A', tone: 'plain', label: 'SubAgent A · 修正', text: 'v2：停止輸入 300ms 後才送出（debounce）' },
  { side: 'B', tone: 'pass', label: 'SubAgent B · 再挑一次', text: '找不到更好的反駁' },
];

const ADV_STYLE: Record<AdvTone, { box: string; label: string }> = {
  plain: { box: 'border-line border-l-paper', label: 'text-paper' },
  challenge: { box: 'border-coral/55 border-l-coral', label: 'text-coral' },
  pass: { box: 'border-teal/55 border-l-teal', label: 'text-teal' },
};

function AdversarialScene({ tick }: { tick: number }) {
  const final = tick >= ADV_TURNS.length + 1;

  return (
    <div className="flex h-full max-h-[480px] flex-col gap-3">
      <div className="flex h-[52px] shrink-0 items-center gap-4 rounded-2xl border border-line bg-panel-lift px-6">
        <span className={LABEL_FAINT}>主 Agent</span>
        <span className="text-[21px] text-paper">
          這個成果不確定怎麼做比較好 → 再啟用一個 SubAgent 來挑戰它
        </span>
      </div>

      {ADV_TURNS.map((turn, i) => {
        const style = ADV_STYLE[turn.tone];
        return (
          <div
            key={turn.label}
            className={`flex h-[68px] w-[820px] shrink-0 items-center gap-5 rounded-2xl border border-l-[6px] bg-panel px-6 ${
              turn.side === 'A' ? 'self-start' : 'self-end'
            } ${style.box} ${tick >= i + 1 ? 'slide-enter' : 'invisible'}`}
          >
            <span className={`w-[220px] shrink-0 text-[18px] font-semibold ${style.label}`}>
              {turn.tone === 'challenge' ? '✕ ' : turn.tone === 'pass' ? '✓ ' : ''}
              {turn.label}
            </span>
            <span className="text-[22px] text-paper">{turn.text}</span>
          </div>
        );
      })}

      <div
        className={`mt-1 flex h-[72px] shrink-0 items-center justify-center gap-4 rounded-2xl border border-l-[6px] border-teal border-l-teal bg-teal/14 ${
          final ? 'slide-enter' : 'invisible'
        }`}
      >
        <span className="text-[24px] font-semibold text-teal">
          留下 v2：當下最合適的版本
        </span>
      </div>
    </div>
  );
}

/* ── 05 很多時候會過度驗證 ───────────────────────────────
 * 時間以「全部驗證完」為 100%，每一格 10%。實作都是 0–30%。
 *   預設：實作之後接四段驗證，一路到 100%
 *   你要求做完就交：30% 就交付（callout：時間只要 30%）
 * 高度：跑道一 154 ＋ 跑道二 102 ＋ 時間軸 28 ＋ 提醒 64 ＋ gap 20×3 ＝ 408 */

const OV_IMPL = 30;
const OV_CHECKS: readonly { label: string; start: number; len: number }[] = [
  { label: '單元測試', start: 30, len: 18 },
  { label: '整合測試', start: 48, len: 18 },
  { label: 'E2E 測試', start: 66, len: 18 },
  { label: '其他驗證', start: 84, len: 16 },
];

function OvLaneHead({
  name,
  status,
  statusTone,
}: {
  name: string;
  status: string | null;
  statusTone: 'muted' | 'teal';
}) {
  return (
    <div className="flex h-8 items-center justify-between gap-6">
      <span className="text-[22px] font-semibold text-paper">{name}</span>
      {status && (
        <span
          className={`slide-enter shrink-0 text-[19px] ${
            statusTone === 'teal' ? 'font-semibold text-teal' : 'text-muted'
          }`}
        >
          {status}
        </span>
      )}
    </div>
  );
}

function OvMarker() {
  return (
    <span
      className="pointer-events-none absolute -inset-y-1.5 border-l-2 border-dashed border-teal"
      style={{ left: `${OV_IMPL}%` }}
    />
  );
}

function OverVerifyScene({ tick }: { tick: number }) {
  const p = tick * 10;
  const quickDone = p >= OV_IMPL;
  const fullDone = p >= 100;

  return (
    <div className="flex h-full max-h-[480px] flex-col justify-center gap-5">
      <div className="flex shrink-0 flex-col gap-2.5">
        <OvLaneHead
          name="預設：能跑的測試都盡可能跑完"
          status={fullDone ? '✓ 交付（時間 100%）' : null}
          statusTone="muted"
        />
        <div className="relative h-[60px] rounded-xl border border-line bg-ink-soft">
          <TrackSegment left={0} width={Math.min(p, OV_IMPL)} tone="muted" label="實作" />
          {OV_CHECKS.map((check) => (
            <TrackSegment
              key={check.label}
              left={check.start}
              width={clamp(p - check.start, 0, check.len)}
              tone="coral"
              label={check.label}
            />
          ))}
          <OvMarker />
        </div>
        <div className="relative h-[46px]">
          {fullDone && (
            <div
              className="slide-enter absolute top-0 flex flex-col items-center"
              style={{ left: `${OV_IMPL}%`, width: `${100 - OV_IMPL}%` }}
            >
              <div className="h-4 w-full rounded-b-md border-x-2 border-b-2 border-coral" />
              <span className="mt-1 text-[19px] font-semibold text-coral">
                過度驗證：更多 token、更多時間
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5">
        <OvLaneHead
          name="你要求：「把事情做完，不要過度驗證，直接提供成果」"
          status={quickDone ? '✓ 交付（約 30%）' : null}
          statusTone="teal"
        />
        <div className="relative h-[60px] rounded-xl border border-line bg-ink-soft">
          <TrackSegment left={0} width={Math.min(p, OV_IMPL)} tone="muted" label="實作" />
          {quickDone && (
            <span
              className="slide-enter absolute top-1/2 -translate-y-1/2 text-[20px] font-semibold whitespace-nowrap text-teal"
              style={{ left: `calc(${OV_IMPL}% + 14px)` }}
            >
              ✓ 直接交付
            </span>
          )}
          <OvMarker />
        </div>
      </div>

      <div className="relative h-7 shrink-0 text-[18px] text-muted">
        <span className="absolute left-0">時間 0</span>
        <span className="absolute -translate-x-1/2 font-semibold text-teal" style={{ left: `${OV_IMPL}%` }}>
          約 30%
        </span>
        <span className="absolute right-0">100%</span>
      </div>

      <div className="flex h-16 shrink-0 items-center rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel-lift px-6">
        <p className="text-[21px] text-paper">
          尤其是時間：有時候不做這些額外的驗證，時間只要 30% 就做完了。
        </p>
      </div>
    </div>
  );
}

function ExpCard({
  index,
  item,
  mode,
}: {
  index: number;
  item: Experience;
  mode: PlayMode;
}) {
  const player = usePlayer(item.last, item.ms, mode);
  const meta = KIND_META[item.kind];

  return (
    <div className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} ${meta.text}`}>
          {meta.label} · {pad2(index + 1)}
        </span>
        <span className="text-[30px] leading-none font-semibold text-paper">{item.name}</span>
        <PlayerControls player={player} primary={BTN_PRIMARY_INK} />
      </div>

      <p className="h-[99px] shrink-0 text-[22px] leading-normal text-paper">{item.desc}</p>

      <div className="min-h-0 flex-1">
        {item.id === 'burn' && <BurnScene tick={player.tick} />}
        {item.id === 'context' && <ContextScene tick={player.tick} />}
        {item.id === 'research' && <ResearchScene tick={player.tick} />}
        {item.id === 'adversarial' && <AdversarialScene tick={player.tick} />}
        {item.id === 'overVerify' && <OverVerifyScene tick={player.tick} />}
      </div>
    </div>
  );
}

export function UltracodeExpDemo() {
  const [picked, setPicked] = useState<ExpId>('burn');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    EXPERIENCES.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[560px_1fr] gap-8">
      {/* ── 左：五點心得 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>Ultracode 的五點使用心得</span>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5">
          {EXPERIENCES.map((item, i) => (
            <ExpMenuItem
              key={item.id}
              index={i}
              item={item}
              on={item.id === picked}
              onClick={() => {
                setPicked(item.id);
                setTouched(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <ExpCard
        key={picked}
        index={index}
        item={EXPERIENCES[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
