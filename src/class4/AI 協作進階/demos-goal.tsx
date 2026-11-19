import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering
 *
 *   第 37 頁  GoalDemo   Goal：往同一個方向持續開發
 *
 * callout 原文重點（2026-10-06，Notion 連線故障，講師直接貼上）：
 *   這邊介紹另外一種可以持續完成大量 issue 的方法，叫做 Goal。
 *   相對於 Prompt 或者是 Loop 的方式，Goal 可以往同一個方向持續地一直開發下去。
 *   （幫我繪製概念圖）
 *   當有建立文件之後，就可以設定 Goal，要求 AI 設定一些指標來完成 Issue。
 *   完成的指標可以包含：需要完成哪些測試流程、要做多少個 Issue、
 *   甚至把 issue 全部完成。
 *
 * 版面：左邊是概念圖、右邊是「設定 Goal」的互動。
 *   左  一張 SVG 疊三條跑道，用形狀的差異講三種方式：
 *         Prompt  你開口 → 做一件 → 停下，後面的 issue 不會動
 *         Loop    時間軸上每到一個時間點觸發一次，每次是獨立的一段，彼此不相連
 *         Goal    一條持續往前的路徑，沿途經過 #1–#8 的 issue 里程碑，
 *                 終點是「達標」旗子；底下一列是完成數、回合數、每回合的檢查結果
 *       Prompt／Loop 兩條是中性灰，只有 Goal 用強調色 —— 這一頁的主角是它。
 *   右  ① 前提：先有文件（Notion／GitHub issue），才能設定 Goal。
 *         文件卡上的 8 個 issue 會跟著左邊的進度一起打勾，接上第 32 頁「AI 去文件
 *         了解下一輪需求」的說法。
 *       ② 完成指標（可勾選）：測試流程／要做多少個 Issue／全部完成。
 *         後兩項是同一件事（終點在哪）的兩種答案，所以二選一。
 *         兩項都沒勾時沒有終點，播放鍵停用 —— 官方文件說條件要有「一個可以量的終點」。
 *       ③ 依勾選組出一行 /goal 指令（中文示意），勾到的部分加底線。
 *       按「開始」後每 1.1 秒前進一回合：路徑往前、issue 計數往上跳，
 *       每回合結束檢查一次指標，達成就停下。
 *
 * 查過的官方文件（2026-10-06）：
 *   Claude Code  https://code.claude.com/docs/en/goal
 *     - /goal <條件>：設定完成條件，Claude 會一直做下去，不用每一步都下 prompt
 *     - 每一回合結束，由另一個小模型檢查條件是否成立；沒成立就再開一回合，
 *       成立（或判斷不可能達成）就自動解除
 *     - 對照表：/goal 是「上一回合結束就接著做」；/loop 是「時間到了才做」
 *     - 執行中會顯示「◎ /goal active」；建議在條件裡加回合上限，例如
 *       「or stop after 20 turns」
 *     - 官方的使用情境就有「把標了 label 的 issue backlog 做到清空為止」
 *   Codex        https://learn.chatgpt.com/codex/long-running-work
 *     - 也有 /goal（Goal mode），ChatGPT 桌面 app、Codex CLI、IDE 擴充都能用；
 *       goal 的文字同時是第一個 prompt 與完成條件。所以頁面上加一行對照。
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫、可以換掉）：
 *   - issue 編號 #1–#8、label「v1.2」、「做 5 個」這個數字
 *   - 測試流程用「e2e 測試」當例子；#3、#6 第一次 e2e 沒過、下一回合修好
 *   - /goal 指令的中文寫法，以及「最多 20 回合」這個上限（取自官方文件的建議，
 *     callout 沒有寫；下一頁「邊界」會再談）
 *   - Loop 跑道上的「第 1 次…第 4 次」與時鐘圖示
 *   - 「◎ /goal active」是 Claude Code 的實際狀態字樣，Codex 的介面不一樣
 *
 * 用色（兩支）：
 *   acid  Goal 跑道與路徑、目前這一回合、勾選的指標、/goal
 *   teal  完成的 issue、達標旗子、已達成
 *   Prompt／Loop 兩條跑道、「停下」標籤、前提卡一律中性（paper／muted／faint／line）。
 * 淡底一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算（Panel 內可用約 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）：
 *   左  SVG 1000 × 700：Prompt 0–136、Loop 152–330、Goal 346–698
 *   右  寬 700：前提卡 120 ＋ 指標 24+10+3×60+2×8＝230 ＋ 指令 24+10+136＝170
 *       ＋ 按鈕 48 ＋ 註腳兩行 50 ＋ 間距 4×16＝64 → 約 682
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_FAINT =
  'font-display text-[17px] tracking-[0.16em] text-faint uppercase';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110 disabled:border-line disabled:bg-ink-soft disabled:font-normal disabled:text-faint`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:text-faint disabled:hover:border-line`;

const LINK =
  'text-paper underline decoration-muted underline-offset-4 transition-colors duration-200 hover:text-acid';

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity] duration-300 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
  onAccent: 'var(--color-on-accent)',
} as const;

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix }: { prefix: string }) {
  const tones: Record<string, string> = { muted: C.muted, acid: C.acid };
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

/* ── 資料與推進規則 ─────────────────────────────────────── */

/** 終點在哪：做 N 個、全部做完，或還沒選 */
type Scope = 'count' | 'all' | null;
type IssueState = 'open' | 'out' | 'done' | 'fail';

const ISSUE_TOTAL = 8;
const COUNT_TARGET = 5;
const MAX_TURNS = 20;
/** 有勾測試指標時，這兩個 issue 第一次 e2e 沒過、下一回合修好（示意） */
const RETRY_ISSUES: readonly number[] = [3, 6];
const TICK_MS = 1100;
const ISSUES = Array.from({ length: ISSUE_TOTAL }, (_, index) => index + 1);

interface Turn {
  issue: number;
  passed: boolean;
}

/** 依指標排出每一回合要做的事。沒有終點就是空的 —— 播不了 */
function buildTurns(tests: boolean, target: number): Turn[] {
  const turns: Turn[] = [];
  for (let issue = 1; issue <= target; issue += 1) {
    if (tests && RETRY_ISSUES.includes(issue)) {
      turns.push({ issue, passed: false });
    }
    turns.push({ issue, passed: true });
  }
  return turns;
}

/* ── 左：三條跑道的概念圖 ───────────────────────────────── */

const TRACK_Y = 474;
const TRACK_X0 = 286;
const TRACK_X1 = 944;
const TRACK_LEN = TRACK_X1 - TRACK_X0;
const ISSUE_R = 26;

function issueX(issue: number) {
  return 336 + (issue - 1) * 82;
}

const LOOP_TICKS: readonly number[] = [336, 496, 656, 816];

interface GoalView {
  target: number;
  tests: boolean;
  states: readonly IssueState[];
  headX: number;
  started: boolean;
  achieved: boolean;
  turn: number;
  done: number;
  message: readonly [string, string];
}

function PromptLane() {
  return (
    <g>
      <rect x={2} y={2} width={996} height={132} rx={20} fill="none" stroke={C.line} strokeWidth={2} />
      <text x={28} y={60} fontSize={28} fontWeight={700} fill={C.paper}>
        Prompt
      </text>
      <text x={28} y={96} fontSize={18} fill={C.muted}>
        一次一件，做完就停
      </text>

      <rect x={286} y={46} width={140} height={44} rx={22} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
      <text x={356} y={75} textAnchor="middle" fontSize={18} fill={C.paper}>
        你的 prompt
      </text>
      <path d="M 430 68 L 468 68" stroke={C.muted} strokeWidth={2} markerEnd="url(#gl-arrow-muted)" />
      <rect x={474} y={42} width={110} height={52} rx={12} fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
      <text x={529} y={75} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.paper}>
        做 #1
      </text>
      <path d="M 588 68 L 626 68" stroke={C.muted} strokeWidth={2} markerEnd="url(#gl-arrow-muted)" />
      {/* 「停下」用深色中性標籤，不佔強調色 */}
      <rect x={632} y={46} width={104} height={44} rx={10} fill={C.paper} />
      <text x={684} y={75} textAnchor="middle" fontSize={19} fontWeight={600} fill={C.onAccent}>
        ■ 停下
      </text>

      {[2, 3].map((issue, index) => (
        <g key={issue}>
          <rect
            x={776 + index * 82}
            y={46}
            width={66}
            height={44}
            rx={10}
            fill="none"
            stroke={C.line}
            strokeWidth={2}
            strokeDasharray="6 6"
          />
          <text x={809 + index * 82} y={75} textAnchor="middle" fontSize={18} fill={C.faint}>
            #{issue}
          </text>
        </g>
      ))}
      <text x={950} y={76} textAnchor="middle" fontSize={22} fill={C.faint}>
        …
      </text>
      <text x={776} y={118} fontSize={17} fill={C.muted}>
        下一件要等你再開口
      </text>
    </g>
  );
}

function LoopLane() {
  return (
    <g>
      <rect x={2} y={152} width={996} height={176} rx={20} fill="none" stroke={C.line} strokeWidth={2} />
      <text x={28} y={208} fontSize={28} fontWeight={700} fill={C.paper}>
        Loop
      </text>
      <text x={28} y={244} fontSize={18} fill={C.muted}>
        照時間重複觸發，
      </text>
      <text x={28} y={270} fontSize={18} fill={C.muted}>
        每次各做各的
      </text>

      {/* 時間軸 y 290、「時間到」y 320（量過）：時鐘下緣 304 剛好接到字框上緣（原本 294／322 會疊進 2px），
          字框下緣 326 也離開跑道框線 328（原本貼齊） */}
      <path d="M 276 290 L 962 290" stroke={C.muted} strokeWidth={2} markerEnd="url(#gl-arrow-muted)" />
      <text x={962} y={319} textAnchor="end" fontSize={16} fill={C.faint}>
        時間
      </text>

      {LOOP_TICKS.map((x, index) => (
        <g key={x}>
          {/* 每一次都是獨立的一段：方塊之間沒有箭頭相連 */}
          <rect x={x - 60} y={180} width={120} height={50} rx={12} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
          <text x={x} y={212} textAnchor="middle" fontSize={19} fill={C.paper}>
            第 {index + 1} 次
          </text>
          <path d={`M ${x} 275 L ${x} 238`} stroke={C.muted} strokeWidth={2} markerEnd="url(#gl-arrow-muted)" />
          <circle cx={x} cy={290} r={13} fill={C.panel} stroke={C.muted} strokeWidth={2} />
          <path
            d={`M ${x} 290 L ${x} 281 M ${x} 290 L ${x + 6} 290`}
            stroke={C.muted}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text x={x} y={320} textAnchor="middle" fontSize={16} fill={C.faint}>
            時間到
          </text>
        </g>
      ))}
      <text x={914} y={213} textAnchor="middle" fontSize={22} fill={C.faint}>
        …
      </text>
    </g>
  );
}

function GoalLane({ view }: { view: GoalView }) {
  const { target, tests, states, headX, started, achieved } = view;
  const progress = headX - TRACK_X0;

  const pill = !started
    ? { text: '尚未開始', stroke: C.line, color: C.faint, dash: '6 6', fillOp: 0 }
    : achieved
      ? { text: '✓ 已達成', stroke: C.teal, color: C.teal, dash: undefined, fillOp: 0.14 }
      : { text: '◎ /goal active', stroke: C.acid, color: C.acid, dash: undefined, fillOp: 0.14 };

  return (
    <g>
      <rect x={2} y={346} width={996} height={352} rx={20} fill="none" stroke={C.acid} strokeWidth={3} />
      <text x={28} y={402} fontSize={32} fontWeight={700} fill={C.acid}>
        Goal
      </text>
      <text x={28} y={440} fontSize={18} fill={C.muted}>
        朝同一個方向一直往前，
      </text>
      <text x={28} y={466} fontSize={18} fill={C.muted}>
        達成指標才停
      </text>

      {/* 狀態膠囊 */}
      <rect
        x={28}
        y={490}
        width={206}
        height={40}
        rx={20}
        fill={pill.stroke}
        fillOpacity={pill.fillOp}
        stroke={pill.stroke}
        strokeWidth={2.5}
        strokeDasharray={pill.dash}
        className={SVG_TR}
      />
      <text x={131} y={517} textAnchor="middle" fontSize={18} fontWeight={600} fill={pill.color} className={SVG_TR}>
        {pill.text}
      </text>

      {/* 圖例 */}
      <circle cx={40} cy={600} r={10} fill="none" stroke={C.acid} strokeWidth={3} />
      <text x={62} y={606} fontSize={17} fill={C.muted}>
        目前這一回合
      </text>
      <circle cx={40} cy={636} r={10} fill={C.teal} fillOpacity={0.14} stroke={C.teal} strokeWidth={3} />
      <text x={62} y={642} fontSize={17} fill={C.muted}>
        完成的 issue
      </text>

      {/* 路徑：底下一條中性軌道，上面一條 acid 的進度 */}
      <path
        d={`M ${TRACK_X0} ${TRACK_Y} L ${TRACK_X1} ${TRACK_Y}`}
        stroke={C.line}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M ${TRACK_X0} ${TRACK_Y} L ${TRACK_X1} ${TRACK_Y}`}
        stroke={C.acid}
        strokeWidth={8}
        strokeDasharray={`${TRACK_LEN} ${TRACK_LEN}`}
        style={{ strokeDashoffset: TRACK_LEN - progress }}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <circle cx={TRACK_X0} cy={TRACK_Y} r={8} fill={C.muted} />
      <text x={TRACK_X0} y={534} textAnchor="middle" fontSize={16} fill={C.faint}>
        起點
      </text>

      {/* 終點旗子：跟著指標移動（做 5 個 → 插在 #5；全部完成 → 插在 #8） */}
      {target > 0 ? (
        <g>
          <path
            d={`M ${issueX(target)} ${TRACK_Y - ISSUE_R} L ${issueX(target)} 390`}
            stroke={C.teal}
            strokeWidth={3}
          />
          <rect
            x={issueX(target)}
            y={390}
            width={68}
            height={30}
            rx={4}
            fill={achieved ? C.teal : C.panel}
            stroke={C.teal}
            strokeWidth={2.5}
            className={SVG_TR}
          />
          <text
            x={issueX(target) + 34}
            y={411}
            textAnchor="middle"
            fontSize={17}
            fontWeight={700}
            fill={achieved ? C.onAccent : C.teal}
            className={SVG_TR}
          >
            達標
          </text>
        </g>
      ) : (
        <g>
          <path d={`M 924 ${TRACK_Y - 6} L 924 390`} stroke={C.muted} strokeWidth={2} strokeDasharray="5 5" />
          <rect x={924} y={390} width={44} height={30} rx={4} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="5 5" />
          <text x={946} y={411} textAnchor="middle" fontSize={18} fontWeight={700} fill={C.faint}>
            ？
          </text>
        </g>
      )}

      {/* issue 里程碑 */}
      {ISSUES.map((issue) => {
        const state = states[issue - 1];
        const x = issueX(issue);
        const tone = state === 'done' ? C.teal : state === 'fail' ? C.acid : null;
        const note =
          state === 'done' ? (tests ? 'e2e ✓' : '完成') : state === 'fail' ? 'e2e 沒過' : null;
        return (
          <g key={issue}>
            {/* 先墊一塊不透明的 panel，蓋掉底下的路徑 */}
            <circle cx={x} cy={TRACK_Y} r={ISSUE_R} fill={C.panel} />
            <circle
              cx={x}
              cy={TRACK_Y}
              r={ISSUE_R}
              fill={tone ?? C.inkSoft}
              fillOpacity={tone ? 0.14 : state === 'out' ? 0 : 1}
              stroke={tone ?? (state === 'out' ? C.line : C.muted)}
              strokeWidth={tone ? 3 : 2}
              strokeDasharray={state === 'out' ? '5 5' : undefined}
              className={SVG_TR}
            />
            <text
              x={x}
              y={TRACK_Y + 6}
              textAnchor="middle"
              fontSize={17}
              fontWeight={600}
              fill={tone ?? (state === 'out' ? C.faint : C.paper)}
              className={SVG_TR}
            >
              #{issue}
            </text>
            {note && (
              <text
                x={x}
                y={534}
                textAnchor="middle"
                fontSize={16}
                fontWeight={600}
                fill={tone ?? C.paper}
              >
                {note}
              </text>
            )}
          </g>
        );
      })}
      {target === COUNT_TARGET && (
        <text
          x={(issueX(COUNT_TARGET + 1) + issueX(ISSUE_TOTAL)) / 2}
          y={534}
          textAnchor="middle"
          fontSize={16}
          fill={C.faint}
        >
          不在這次的範圍
        </text>
      )}

      {/* 目前這一回合：acid 圓環沿著路徑往前 */}
      {target > 0 && (
        <g
          style={{ transform: `translate(${headX}px, ${TRACK_Y}px)` }}
          className="transition-transform duration-700 ease-out"
        >
          <circle r={35} fill="none" stroke={C.acid} strokeWidth={3} />
        </g>
      )}

      {/* 狀態列：完成數、回合數、每回合結束的檢查 */}
      <text x={286} y={596} fontSize={17} fill={C.faint}>
        已完成的 issue
      </text>
      <text
        x={286}
        y={654}
        fontSize={54}
        fontWeight={600}
        fill={achieved ? C.teal : C.paper}
        className={`font-display ${SVG_TR}`}
      >
        {target > 0 ? `${view.done} / ${target}` : '–'}
      </text>
      <text x={466} y={596} fontSize={17} fill={C.faint}>
        回合（上限 {MAX_TURNS}）
      </text>
      <text x={466} y={654} fontSize={54} fontWeight={600} fill={C.paper} className="font-display">
        {view.turn > 0 ? view.turn : '–'}
      </text>

      <rect x={612} y={572} width={370} height={108} rx={14} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
      <text x={632} y={602} fontSize={16} fill={C.faint}>
        每回合結束，另一個模型檢查指標
      </text>
      <text
        x={632}
        y={636}
        fontSize={21}
        fontWeight={600}
        fill={achieved ? C.teal : C.paper}
        className={SVG_TR}
      >
        {view.message[0]}
      </text>
      <text x={632} y={664} fontSize={18} fill={C.muted}>
        {view.message[1]}
      </text>
    </g>
  );
}

function GoalCompareDiagram({ view }: { view: GoalView }) {
  return (
    <svg width={1000} height={700} viewBox="0 0 1000 700" role="img" className="shrink-0">
      <title>
        三種讓 AI 持續開發的方式：Prompt 做完一件就停；Loop 照時間觸發、每次各做各的；
        Goal 朝同一個方向一直做下去，沿途完成 issue，達成指標才停
      </title>
      <ArrowMarkers prefix="gl-arrow" />
      <PromptLane />
      <LoopLane />
      <GoalLane view={view} />
    </svg>
  );
}

/* ── 右：設定 Goal ──────────────────────────────────────── */

/** 可勾選的完成指標：勾到的那列 acid 淡底 ＋ 6px 左粗條 ＋ 實心勾選框 */
function CriterionRow({
  title,
  hint,
  on,
  onClick,
}: {
  title: string;
  hint: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={`flex h-[60px] w-full items-center gap-4 rounded-xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
        on
          ? 'border-acid/55 border-l-acid bg-acid/14'
          : 'border-line border-l-line bg-panel hover:border-l-acid'
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 text-[20px] leading-none font-bold transition-colors duration-200 ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-muted bg-panel'
        }`}
      >
        {on && '✓'}
      </span>
      <span className="text-[24px] leading-none font-medium text-paper">{title}</span>
      <span className="ml-auto shrink-0 text-[19px] text-muted">{hint}</span>
    </button>
  );
}

/** 指令裡對應到勾選指標的那一段：加 acid 底線。不斷行 —— 否則「通過」會被拆在兩行，底線也斷成兩截 */
function Frag({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap underline decoration-acid decoration-2 underline-offset-[6px]">
      {children}
    </span>
  );
}

function issueChipClass(state: IssueState) {
  if (state === 'done') return 'border-teal bg-teal/14 font-semibold text-teal';
  if (state === 'fail') return 'border-acid bg-panel text-acid';
  if (state === 'out') return 'border-dashed border-line bg-panel text-faint';
  return 'border-line bg-panel text-paper';
}

export function GoalDemo() {
  const [tests, setTests] = useState(true);
  const [scope, setScope] = useState<Scope>('count');
  const [cursor, setCursor] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const target = scope === 'all' ? ISSUE_TOTAL : scope === 'count' ? COUNT_TARGET : 0;
  const turns = buildTurns(tests, target);
  const last = turns.length - 1;
  const started = cursor >= 0;
  const achieved = target > 0 && cursor === last;
  const running = playing && cursor < last;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setCursor((value) => Math.min(value + 1, last)),
      TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, cursor, last]);

  const seen = turns.slice(0, cursor + 1);
  const current = started ? turns[cursor] : null;
  const doneSet = new Set(seen.filter((turn) => turn.passed).map((turn) => turn.issue));

  const states: IssueState[] = ISSUES.map((issue) => {
    if (target > 0 && issue > target) return 'out';
    if (doneSet.has(issue)) return 'done';
    if (current && current.issue === issue && !current.passed) return 'fail';
    return 'open';
  });

  let message: readonly [string, string];
  if (target === 0) message = ['還沒有終點', '勾「要做多少個」或「全部完成」'];
  else if (!current) message = ['還沒開始', '按「開始」，從 #1 做起'];
  else if (achieved) message = ['✓ 達成指標', '→ Goal 自動解除，停下來'];
  else if (!current.passed) message = [`#${current.issue} 的 e2e 沒過`, '→ 不算完成，下一回合繼續修'];
  else message = [`還沒達成：還差 ${target - doneSet.size} 個`, '→ 繼續下一回合'];

  const view: GoalView = {
    target,
    tests,
    states,
    headX: current ? issueX(current.issue) : TRACK_X0,
    started,
    achieved,
    turn: cursor + 1,
    done: doneSet.size,
    message,
  };

  /* 改了指標就從頭來：路徑、計數都回到起點 */
  const restart = () => {
    setPlaying(false);
    setCursor(-1);
  };

  const toggleScope = (next: Exclude<Scope, null>) => {
    setScope((value) => (value === next ? null : next));
    restart();
  };

  const togglePlay = () => {
    if (target === 0) return;
    if (!started || achieved) {
      setCursor(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const playLabel = running ? '暫停' : achieved ? '再播一次' : started ? '繼續' : '開始';

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <GoalCompareDiagram view={view} />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* ① 前提：先有文件 */}
        <div className="rounded-2xl border border-l-[6px] border-line border-l-muted bg-panel px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-paper px-3 py-0.5 text-[17px] font-semibold text-on-accent">
              前提
            </span>
            <span className="text-[24px] font-semibold text-paper">先有文件，才能設定 Goal</span>
            <span className="ml-auto text-[19px] text-muted">Notion／GitHub issue</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="shrink-0 text-[17px] text-faint">issue · v1.2</span>
            <div className="flex gap-1.5">
              {ISSUES.map((issue) => {
                const state = states[issue - 1];
                return (
                  <span
                    key={issue}
                    className={`flex h-10 w-[48px] items-center justify-center rounded-lg border-2 font-mono text-[17px] transition-colors duration-300 ${issueChipClass(state)}`}
                  >
                    {/* ✓ 不用等寬字：SF Mono 的 ✓ 長得像「√」，「√1」會被看成「v1」 */}
                    {state === 'done' ? (
                      <>
                        <span className="font-sans">✓</span>
                        {issue}
                      </>
                    ) : (
                      `#${issue}`
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ② 完成指標 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <p className={LABEL_FAINT}>設定完成指標</p>
            <p className="text-[17px] text-faint">後兩項二選一</p>
          </div>
          <div className="flex flex-col gap-2">
            <CriterionRow
              title="需要完成哪些測試流程"
              hint="例：e2e 測試"
              on={tests}
              onClick={() => {
                setTests((value) => !value);
                restart();
              }}
            />
            <CriterionRow
              title="要做多少個 Issue"
              hint={`例：${COUNT_TARGET} 個`}
              on={scope === 'count'}
              onClick={() => toggleScope('count')}
            />
            <CriterionRow
              title="甚至把 issue 全部完成"
              hint={`v1.2 共 ${ISSUE_TOTAL} 個`}
              on={scope === 'all'}
              onClick={() => toggleScope('all')}
            />
          </div>
        </div>

        {/* ③ 組出來的指令 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <p className={LABEL_FAINT}>組出來的 /goal 指令</p>
            <span className="rounded-md border border-line px-2 text-[17px] text-faint">示意</span>
          </div>
          <div className="h-[136px] rounded-xl border border-line bg-ink-soft px-6 py-4">
            <p className="font-mono text-[21px] leading-[1.5] text-paper">
              <span className="font-semibold text-acid">/goal</span> 完成 GitHub 上標記 v1.2 的
              {scope === 'count' && (
                <>
                  {' '}
                  <Frag>{COUNT_TARGET} 個</Frag>
                </>
              )}
              {scope === 'all' && <Frag>全部</Frag>} issue
              {tests && (
                <>
                  ，<Frag>每個都要通過 e2e 測試</Frag>
                </>
              )}
              ，最多 {MAX_TURNS} 回合
            </p>
            {target === 0 && (
              <p className="mt-2 text-[19px] text-muted">
                沒有終點：Goal 不知道做到哪裡算完成。
              </p>
            )}
          </div>
        </div>

        {/* 播放 */}
        <div className="flex gap-3">
          <button type="button" disabled={target === 0} onClick={togglePlay} className={BTN_PRIMARY}>
            {playLabel}
          </button>
          <button
            type="button"
            disabled={target === 0 || achieved}
            onClick={() => {
              setPlaying(false);
              setCursor((value) => Math.min(value + 1, last));
            }}
            className={BTN_GHOST}
          >
            下一回合
          </button>
          <button type="button" onClick={restart} className={BTN_GHOST}>
            重來
          </button>
        </div>

        <p className="text-[19px] leading-snug text-muted">
          Codex 也有 <span className="font-mono text-paper">/goal</span>
          {'（Goal mode），ChatGPT 桌面 app、Codex CLI、IDE 擴充都能用。官方文件：'}
          <a
            href="https://code.claude.com/docs/en/goal"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            Claude Code ↗
          </a>
          ・
          <a
            href="https://learn.chatgpt.com/codex/long-running-work"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            Codex ↗
          </a>
        </p>
      </div>
    </div>
  );
}
