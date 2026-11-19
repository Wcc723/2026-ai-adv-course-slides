import { useEffect, useState, type ReactNode } from 'react';
import remoteUrl from './images/remote-control.png';
import automationUrl from './images/automation.png';

/* ══════════════════════════════════════════════════════════════
 * 〈5 種 SubAgent 協作模式〉— Level 4、Level 5 的互動範例
 *
 *   第 16 頁  RemoteAgentDemo      Remote Agent：以前／現在，手機遙控另一台電腦
 *   第 17 頁  RemoteScenarioDemo   Remote Agent 使用情境（左選單、右情境圖）
 *   第 20 頁  ChatGptArchDemo      直接使用 ChatGPT 的架構
 *   第 21 頁  HermesArchDemo       Hermes Agent 的架構
 *   第 22 頁  HermesFeaturesDemo   Hermes Agent 特點（左選項、右概念圖）
 *
 * 內容來源：Notion「5 種 SubAgent 協作模式」Level 4、Level 5 的 callout。
 *
 * 用色：acid（目前選取、進行中）＋ teal（完成、回傳）；以前的做法用 coral。
 * 任何一個畫面最多同時出現兩支。淡底一律配 6px 不透明左粗條或實色邊框。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 沒有任何容器會捲動。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 shrink-0 rounded-xl border px-6 text-[20px] transition-colors duration-200';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent disabled:border-line disabled:bg-panel-lift disabled:font-normal disabled:text-faint`;
const BTN_QUIET = `${BTN} border-line bg-panel text-paper hover:border-acid`;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一項（同〈從 0 到 1〉SkillDemo 的選單樣式） */
function MenuButton({
  index,
  on,
  title,
  sub,
  onClick,
  className = '',
}: {
  index: number;
  on: boolean;
  title: string;
  sub: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex items-center gap-5 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${className} ${
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
        <span
          className={`text-[27px] leading-snug text-paper ${on ? 'font-semibold' : ''}`}
        >
          {title}
        </span>
        <span
          className={`text-[20px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

/** 兩段式切換鈕。選中的那一段用實心 paper，不佔強調色 */
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1 rounded-xl border border-line bg-panel-lift p-1">
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={on}
            className={`h-12 rounded-lg px-5 text-[20px] transition-colors duration-200 ${
              on ? 'bg-paper font-medium text-on-accent' : 'text-muted hover:text-paper'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── SVG 共用 ───────────────────────────────────────────── */

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  lineSoft: 'var(--color-line-soft)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

const SVG_TR =
  'transition-[fill,stroke,stroke-width,stroke-dashoffset,opacity] duration-500 ease-out';

/**
 * 節點與連線的狀態。
 *   normal  總覽，沒有焦點
 *   on      目前的焦點（acid 粗框）
 *   dim     不是焦點（line-soft 細框、faint 字）
 *   done    完成、回傳（teal 粗框）
 */
type Tone = 'normal' | 'on' | 'dim' | 'done';

const TONE: Record<
  Tone,
  { stroke: string; width: number; title: string; sub: string; glyph: string }
> = {
  normal: { stroke: C.line, width: 2, title: C.paper, sub: C.muted, glyph: C.muted },
  on: { stroke: C.acid, width: 3, title: C.acid, sub: C.paper, glyph: C.acid },
  dim: { stroke: C.lineSoft, width: 2, title: C.faint, sub: C.faint, glyph: C.faint },
  done: { stroke: C.teal, width: 3, title: C.teal, sub: C.paper, glyph: C.teal },
};

type MarkerKey = 'muted' | 'acid' | 'line' | 'teal';

const MARKER_COLOR: Record<MarkerKey, string> = {
  muted: C.muted,
  acid: C.acid,
  line: C.line,
  teal: C.teal,
};

const EDGE_KEY: Record<Tone, MarkerKey> = {
  normal: 'muted',
  on: 'acid',
  dim: 'line',
  done: 'teal',
};

/** 每個元件用自己的前綴，避免 marker id 撞在一起 */
function ArrowDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {(Object.keys(MARKER_COLOR) as MarkerKey[]).map((key) => (
        <marker
          key={key}
          id={`${prefix}-${key}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={MARKER_COLOR[key]} />
        </marker>
      ))}
    </defs>
  );
}

function Edge({
  d,
  tone,
  prefix,
  dashed = false,
  arrow = true,
}: {
  d: string;
  tone: Tone;
  prefix: string;
  dashed?: boolean;
  arrow?: boolean;
}) {
  const key = EDGE_KEY[tone];
  return (
    <path
      d={d}
      fill="none"
      stroke={MARKER_COLOR[key]}
      strokeWidth={tone === 'on' || tone === 'done' ? 3 : 2}
      strokeDasharray={dashed ? '8 8' : undefined}
      strokeLinecap="round"
      markerEnd={arrow ? `url(#${prefix}-${key})` : undefined}
      className={SVG_TR}
    />
  );
}

type GlyphKind =
  | 'person'
  | 'app'
  | 'model'
  | 'agent'
  | 'file'
  | 'terminal'
  | 'browser';

/** 節點裡的小圖示，全部是線稿，顏色跟著節點狀態走 */
function Glyph({
  kind,
  cx,
  cy,
  color,
}: {
  kind: GlyphKind;
  cx: number;
  cy: number;
  color: string;
}) {
  const stroke = {
    fill: 'none',
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: SVG_TR,
  };

  switch (kind) {
    case 'person':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy - 10} r={11} />
          <path d={`M ${cx - 20} ${cy + 22} a 20 17 0 0 1 40 0`} />
        </g>
      );
    case 'app':
      return (
        <g {...stroke}>
          <rect x={cx - 30} y={cy - 22} width={60} height={44} rx={7} />
          <path d={`M ${cx - 30} ${cy - 10} H ${cx + 30}`} />
          <path d={`M ${cx - 18} ${cy + 2} H ${cx + 12} M ${cx - 18} ${cy + 12} H ${cx + 2}`} />
        </g>
      );
    case 'model':
      return (
        <g {...stroke}>
          <rect x={cx - 18} y={cy - 18} width={36} height={36} rx={6} />
          <rect x={cx - 7} y={cy - 7} width={14} height={14} rx={2} />
          <path
            d={[-8, 8]
              .map(
                (o) =>
                  `M ${cx + o} ${cy - 18} V ${cy - 26} M ${cx + o} ${cy + 18} V ${cy + 26} M ${cx - 18} ${cy + o} H ${cx - 26} M ${cx + 18} ${cy + o} H ${cx + 26}`,
              )
              .join(' ')}
          />
        </g>
      );
    case 'agent':
      return (
        <g>
          <g {...stroke}>
            <rect x={cx - 24} y={cy - 12} width={48} height={34} rx={10} />
            <path d={`M ${cx} ${cy - 12} V ${cy - 22}`} />
            <circle cx={cx} cy={cy - 25} r={3} />
          </g>
          <circle cx={cx - 9} cy={cy + 4} r={4} fill={color} className={SVG_TR} />
          <circle cx={cx + 9} cy={cy + 4} r={4} fill={color} className={SVG_TR} />
        </g>
      );
    case 'file':
      return (
        <g {...stroke}>
          <path
            d={`M ${cx - 14} ${cy - 18} H ${cx + 5} L ${cx + 15} ${cy - 8} V ${cy + 18} H ${cx - 14} Z`}
          />
          <path d={`M ${cx + 5} ${cy - 18} V ${cy - 8} H ${cx + 15}`} />
        </g>
      );
    case 'terminal':
      return (
        <g {...stroke}>
          <rect x={cx - 20} y={cy - 16} width={40} height={32} rx={5} />
          <path d={`M ${cx - 12} ${cy - 5} L ${cx - 5} ${cy + 1} L ${cx - 12} ${cy + 7}`} />
          <path d={`M ${cx - 1} ${cy + 8} H ${cx + 10}`} />
        </g>
      );
    case 'browser':
      return (
        <g {...stroke}>
          <rect x={cx - 20} y={cy - 16} width={40} height={32} rx={5} />
          <path d={`M ${cx - 20} ${cy - 6} H ${cx + 20}`} />
          <circle cx={cx + 4} cy={cy + 5} r={6} />
        </g>
      );
  }
}

/**
 * 標準節點：上面一個圖示、中間標題、下面一行說明。高度固定 150。
 * 圖示中心 y+44、標題基線 y+104、說明基線 y+134。
 */
function SvgNode({
  x,
  y,
  w,
  h = 150,
  glyph,
  title,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  glyph: GlyphKind;
  title: string;
  sub?: string;
  tone: Tone;
}) {
  const t = TONE[tone];
  const cx = x + w / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={C.inkSoft}
        stroke={t.stroke}
        strokeWidth={t.width}
        className={SVG_TR}
      />
      <Glyph kind={glyph} cx={cx} cy={y + 44} color={t.glyph} />
      <text
        x={cx}
        y={y + 104}
        textAnchor="middle"
        fontSize={26}
        fontWeight={600}
        fill={t.title}
        className={SVG_TR}
      >
        {title}
      </text>
      {sub && (
        <text
          x={cx}
          y={y + 134}
          textAnchor="middle"
          fontSize={18}
          fill={t.sub}
          className={SVG_TR}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

/** 可以點的小節點（模型插頭、服務插頭）：標題＋一行狀態 */
function PlugNode({
  x,
  y,
  w,
  h,
  title,
  status,
  on,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  status: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <g className="cursor-pointer" onClick={onClick} role="button" aria-pressed={on}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={C.inkSoft}
        stroke={on ? C.acid : C.line}
        strokeWidth={on ? 3 : 2}
        strokeDasharray={on ? undefined : '8 6'}
        className={SVG_TR}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 4}
        textAnchor="middle"
        fontSize={24}
        fontWeight={600}
        fill={on ? C.paper : C.faint}
        className={SVG_TR}
      >
        {title}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 24}
        textAnchor="middle"
        fontSize={17}
        fill={on ? C.acid : C.faint}
        className={SVG_TR}
      >
        {status}
      </text>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 16 頁 · RemoteAgentDemo — Remote Agent
 *
 * callout：「原本我們都是在電腦前透過 prompt 跟 AI 進行溝通，但是接下來會越來越
 * 流行 Remote Agent。簡單來講，在畫面上就可以呈現一個人透過手機，控制另外一台
 * 電腦上面的 Agent。」
 *
 * 上方切換「以前／現在」：
 *   以前  一張桌子：你、prompt、Agent 全在同一台電腦前（coral 提醒）
 *   現在  左手機、中連線、右另一台電腦。按「送出」之後：
 *         sending（acid 圓點往右）→ working（三個步驟依序完成）
 *         → returning（teal 圓點往左）→ done（手機收到回覆）
 *
 * 用色：以前 coral；現在 acid（進行中）＋ teal（完成）。
 * 高度：上方切換列 64 ＋ gap 24 ＋ 主畫面 632（手機 560 ＋ 標籤）。
 * ══════════════════════════════════════════════════════════════ */

type RemoteMode = 'before' | 'after';
type RemotePhase = 'idle' | 'sending' | 'working' | 'returning' | 'done';

const REMOTE_MODES: readonly { id: RemoteMode; label: string }[] = [
  { id: 'before', label: '以前：坐在電腦前' },
  { id: 'after', label: '現在：Remote Agent' },
];

const REMOTE_PROMPT = '幫我修掉登入頁的錯誤';
const REMOTE_WORK = ['打開登入頁的程式碼', '找到錯誤並修正', '跑測試，確認全部通過'] as const;
const REMOTE_REPLY = '修好了，測試全部通過 ✅';

const REMOTE_STATUS: Record<RemotePhase, string> = {
  idle: '你人在外面，身上只有手機',
  sending: '訊息從手機送到另一台電腦',
  working: 'Agent 在另一台電腦上動手做事',
  returning: '做完了，結果傳回手機',
  done: '人不用坐在電腦前，事情照樣完成',
};

const REMOTE_LINK: Record<RemotePhase, string> = {
  idle: '手機 ⇄ 另一台電腦',
  sending: '送出指令',
  working: '等 Agent 做完',
  returning: '回傳結果',
  done: '手機 ⇄ 另一台電腦',
};

function PersonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx={50} cy={30} r={17} fill="none" stroke={C.paper} strokeWidth={5} />
      <path
        d="M 16 90 a 34 30 0 0 1 68 0"
        fill="none"
        stroke={C.paper}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function RemoteBefore() {
  return (
    <div className="slide-enter flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
      <div className="relative flex items-center gap-10 rounded-3xl border-2 border-dashed border-line px-14 pt-16 pb-12">
        <span className={`absolute top-5 left-8 ${LABEL_FAINT}`}>同一張桌子前</span>

        <div className="flex w-[240px] flex-col items-center gap-3">
          <PersonIcon size={120} />
          <span className="text-[30px] font-semibold text-paper">你</span>
          <span className="text-[20px] text-muted">坐在電腦前打 prompt</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[19px] text-muted">一句一句輸入</span>
          <svg width={120} height={24} viewBox="0 0 120 24" aria-hidden="true">
            <path d="M 4 12 H 108" stroke={C.muted} strokeWidth={3} />
            <path d="M 104 4 L 116 12 L 104 20 z" fill={C.muted} />
          </svg>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex h-[340px] w-[600px] flex-col overflow-hidden rounded-2xl border-[10px] border-paper bg-panel">
            <div className="flex h-[56px] shrink-0 items-center border-b border-line-soft px-5">
              <span className="text-[20px] font-semibold text-paper">你的電腦 · Agent</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-4 px-6 font-mono text-[20px]">
              <p className="text-paper">{`你 › ${REMOTE_PROMPT}`}</p>
              <p className="text-muted">{'Agent › 好的，我先看一下登入頁…'}</p>
              <p className="text-faint">{'你 › （等你輸入下一句 prompt）'}</p>
            </div>
          </div>
          <div className="h-[28px] w-[110px] bg-paper" />
          <div className="h-[10px] w-[240px] rounded-full bg-paper" />
        </div>
      </div>

      <p className="border-l-[6px] border-l-coral pl-5 text-[24px] text-paper">
        {'人、prompt、Agent 綁在同一台電腦前 —— 人一離開，對話就停在那裡'}
      </p>
    </div>
  );
}

function RemoteAfter({
  phase,
  workStep,
  onSend,
  onReset,
}: {
  phase: RemotePhase;
  workStep: number;
  onSend: () => void;
  onReset: () => void;
}) {
  const sent = phase !== 'idle';
  const busy = phase === 'sending' || phase === 'working' || phase === 'returning';

  const lineColor =
    phase === 'sending' || phase === 'working'
      ? 'border-acid'
      : phase === 'returning'
        ? 'border-teal'
        : 'border-line';
  const dotColor = phase === 'returning' ? 'bg-teal' : 'bg-acid';
  const dotLeft = phase === 'sending' || phase === 'working' ? '100%' : '0%';
  const dotShown = phase === 'sending' || phase === 'returning';

  const badge =
    phase === 'idle'
      ? { text: '閒置', cls: 'border-line text-faint' }
      : phase === 'sending'
        ? { text: '收到指令', cls: 'border-acid text-acid' }
        : phase === 'working'
          ? { text: '工作中', cls: 'border-acid text-acid' }
          : { text: '完成', cls: 'border-teal text-teal' };

  return (
    <div className="slide-enter grid min-h-0 flex-1 grid-cols-[380px_1fr_600px] items-center gap-6">
      {/* ── 左：手機 ─────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <span className={LABEL_FAINT}>你（人在外面）</span>
        <div className="flex h-[560px] w-[360px] flex-col overflow-hidden rounded-[44px] border-[10px] border-paper bg-panel">
          <div className="flex h-[60px] shrink-0 items-center justify-center border-b border-line-soft">
            <span className="text-[20px] font-semibold text-paper">另一台電腦的 Agent</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 p-4">
            {!sent && (
              <p className="self-center pb-24 text-[19px] text-faint">還沒有訊息</p>
            )}
            {sent && (
              <p className="max-w-[260px] self-end rounded-2xl rounded-br-md bg-acid px-4 py-3 text-[20px] leading-snug text-on-accent">
                {REMOTE_PROMPT}
              </p>
            )}
            {busy && phase !== 'sending' && (
              <p className="self-start rounded-2xl rounded-bl-md border border-line bg-ink-soft px-4 py-3 text-[19px] text-muted">
                Agent 工作中…
              </p>
            )}
            {phase === 'done' && (
              <p className="max-w-[270px] self-start rounded-2xl rounded-bl-md border border-l-[6px] border-line border-l-teal bg-panel px-4 py-3 text-[20px] leading-snug text-paper">
                {REMOTE_REPLY}
              </p>
            )}
          </div>

          <div className="flex h-[76px] shrink-0 items-center gap-2 border-t border-line-soft px-3">
            <span
              className={`flex h-12 min-w-0 flex-1 items-center rounded-full border border-line px-4 text-[19px] ${
                sent ? 'text-faint' : 'text-paper'
              }`}
            >
              {sent ? '…' : REMOTE_PROMPT}
            </span>
            {phase === 'done' ? (
              <button type="button" onClick={onReset} className={`${BTN_QUIET} px-4`}>
                重來
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={sent}
                className={`${BTN_PRIMARY} px-4`}
              >
                送出
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 中：遠端連線 ─────────────────────────── */}
      <div className="flex flex-col items-center px-2">
        <span className={LABEL_FAINT}>遠端連線</span>
        <div
          className={`relative mt-6 h-0 w-full border-t-[4px] border-dashed transition-colors duration-500 ${lineColor}`}
        >
          <span
            className={`absolute top-0 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,opacity] duration-1000 ease-in-out ${dotColor}`}
            style={{ left: dotLeft, opacity: dotShown ? 1 : 0 }}
          />
        </div>
        <span className="mt-6 text-[20px] text-muted">{REMOTE_LINK[phase]}</span>
      </div>

      {/* ── 右：另一台電腦 ───────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <span className={LABEL_FAINT}>另一台電腦（在家裡）</span>
        <div className="flex flex-col items-center">
          <div className="flex h-[400px] w-[600px] flex-col overflow-hidden rounded-2xl border-[10px] border-paper bg-panel">
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line-soft px-5">
              <span className="text-[20px] font-semibold text-paper">Agent</span>
              <span
                className={`rounded-full border px-4 py-1 text-[17px] transition-colors duration-300 ${badge.cls}`}
              >
                {badge.text}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 px-6">
              <p className="text-[20px] text-paper">
                <span className={`mr-3 ${LABEL_FAINT}`}>收到的指令</span>
                {sent && phase !== 'sending' ? REMOTE_PROMPT : '等待指令…'}
              </p>
              {REMOTE_WORK.map((step, index) => {
                const allDone = phase === 'returning' || phase === 'done';
                const done = allDone || (phase === 'working' && index < workStep);
                const current = phase === 'working' && index === workStep;
                return (
                  <div
                    key={step}
                    className={`flex h-[58px] items-center gap-4 rounded-xl border border-l-[6px] px-4 transition-colors duration-300 ${
                      current
                        ? 'border-acid border-l-acid bg-acid/14'
                        : done
                          ? 'border-line border-l-teal bg-panel'
                          : 'border-line-soft border-l-line bg-panel'
                    }`}
                  >
                    <span
                      className={`w-6 text-center text-[20px] ${
                        current ? 'text-acid' : done ? 'text-teal' : 'text-faint'
                      }`}
                    >
                      {done ? '✓' : current ? '▶' : '○'}
                    </span>
                    <span
                      className={`text-[21px] ${done || current ? 'text-paper' : 'text-faint'}`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-[28px] w-[110px] bg-paper" />
          <div className="h-[10px] w-[240px] rounded-full bg-paper" />
        </div>
      </div>
    </div>
  );
}

export function RemoteAgentDemo() {
  const [mode, setMode] = useState<RemoteMode>('after');
  const [phase, setPhase] = useState<RemotePhase>('idle');
  const [workStep, setWorkStep] = useState(0);

  useEffect(() => {
    let timer = 0;
    if (phase === 'sending') {
      timer = window.setTimeout(() => setPhase('working'), 1100);
    } else if (phase === 'working') {
      timer =
        workStep < REMOTE_WORK.length
          ? window.setTimeout(() => setWorkStep((step) => step + 1), 900)
          : window.setTimeout(() => setPhase('returning'), 400);
    } else if (phase === 'returning') {
      timer = window.setTimeout(() => setPhase('done'), 1100);
    }
    return () => window.clearTimeout(timer);
  }, [phase, workStep]);

  const reset = () => {
    setPhase('idle');
    setWorkStep(0);
  };

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-6">
      <div className="flex h-[64px] shrink-0 items-center gap-8">
        <Segmented
          value={mode}
          options={REMOTE_MODES}
          onChange={(next) => {
            setMode(next);
            reset();
          }}
        />
        <p className="text-[24px] text-paper">
          {mode === 'before'
            ? '以前：在電腦前透過 prompt 跟 AI 溝通'
            : REMOTE_STATUS[phase]}
        </p>
      </div>

      {mode === 'before' ? (
        <RemoteBefore />
      ) : (
        <RemoteAfter
          phase={phase}
          workStep={workStep}
          onSend={() => {
            setWorkStep(0);
            setPhase('sending');
          }}
          onReset={reset}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 17 頁 · RemoteScenarioDemo — Remote Agent 使用情境
 *
 * callout 指定「左邊是選單，右邊則是情境圖」。第三項在 Notion 是空的，只做兩項：
 *   遠端控制電腦  一個人用手機控制另外一台電腦上面的 Agent → remote-control.png
 *   自動化操作    設定排程，讓 AI 在獨立的裝置上自主開發   → automation.png
 * 左下角的小卡把兩個情境拆成「誰來觸發」與「Agent 在哪裡跑」兩件事。
 *
 * 圖片是 Codex 產的扁平插圖，放在固定尺寸的畫框裡 object-contain，
 * 不管實際比例是橫幅還是正方形都不會溢出。
 *
 * 用色：acid（目前選取）。
 * 高度：左欄兩個選項各 170 ＋ 小卡；右欄標籤 24 ＋ 畫框 flex-1。
 * ══════════════════════════════════════════════════════════════ */

type ScenarioId = 'remote' | 'auto';

const SCENARIOS: readonly {
  id: ScenarioId;
  name: string;
  text: string;
  trigger: string;
  where: string;
  src: string;
  alt: string;
}[] = [
  {
    id: 'remote',
    name: '遠端控制電腦',
    text: '一個人用手機，控制另外一台電腦上面的 Agent。',
    trigger: '你，從手機下指令',
    where: '另外一台電腦',
    src: remoteUrl,
    alt: '一個人在外面用手機，遠端控制家裡電腦上的 AI Agent',
  },
  {
    id: 'auto',
    name: '自動化操作',
    text: '設定一個排程，讓 AI 自主性地進行開發。',
    trigger: '排程，時間到就自己開始',
    where: '一台獨立的裝置',
    src: automationUrl,
    alt: '一台獨立的小主機照排程自己寫程式、批改作業，旁邊沒有人',
  },
];

export function RemoteScenarioDemo() {
  const [id, setId] = useState<ScenarioId>('remote');
  const current = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[520px_1fr] gap-8">
      {/* ── 左：選單 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>使用情境</span>
        {SCENARIOS.map((item, index) => (
          <MenuButton
            key={item.id}
            index={index}
            on={item.id === id}
            title={item.name}
            sub={item.text}
            onClick={() => setId(item.id)}
            className="min-h-[170px] py-5"
          />
        ))}

        <div className="mt-auto flex flex-col gap-5 rounded-2xl border border-line bg-panel px-6 py-6">
          <div className="flex flex-col gap-1.5">
            <span className={LABEL_FAINT}>誰來觸發</span>
            <span className="text-[26px] text-paper">{current.trigger}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={LABEL_FAINT}>Agent 在哪裡跑</span>
            <span className="text-[26px] text-paper">{current.where}</span>
          </div>
        </div>
      </div>

      {/* ── 右：情境圖 ───────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <span className={`${LABEL_TYPE} text-acid`}>{`情境圖 · ${current.name}`}</span>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-panel">
          <img
            key={current.id}
            src={current.src}
            alt={current.alt}
            className="slide-enter block size-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 20、21 頁共用的座標（viewBox 1640 × 520）
 *
 * 兩頁刻意用同一套座標：你、OpenAI 在同一個位置，中間那一格在第 20 頁是
 * ChatGPT App、在第 21 頁換成 Hermes Agent。翻頁時學員看到的是「中間多長出一層」。
 *
 *   你            ( 30, 140) 190 × 150
 *   通訊工具      (300, 100) 240 × 230   只有第 21 頁
 *   你的電腦框    (620,  20) 630 × 480   只有第 21 頁
 *   App／Hermes   (740, 140) 360 × 150
 *   檔案／終端機／瀏覽器  y 400，各 180 × 72  只有第 21 頁
 *   OpenAI        (1350, 140) 260 × 150
 *   主幹線        y 200（去程）／ y 238（回程，只有第 20 頁）
 * ══════════════════════════════════════════════════════════════ */

const ARCH_VIEW = '0 0 1640 520';
const ARCH = {
  you: { x: 30, y: 140, w: 190 },
  mid: { x: 740, y: 140, w: 360 },
  model: { x: 1350, y: 140, w: 260 },
} as const;

/* ══════════════════════════════════════════════════════════════
 * 第 20 頁 · ChatGptArchDemo — 直接使用 ChatGPT 的架構
 *
 * callout：「我們人是直接使用 ChatGPT 的應用程式，再由 ChatGPT 的應用程式直接
 * 去串接 OpenAI。」
 *
 * 三個節點一條直線。按「送出訊息」，訊息沿去程（acid）跑到 OpenAI，
 * 再沿回程（teal）回到你手上，一段 900ms。你和 App 之間刻意留一大段空白，
 * 下一頁 Hermes 的那一層就長在這裡。
 *
 * 用色：acid（去程）＋ teal（回程）。
 * 高度：上方列 64 ＋ gap 24 ＋ SVG（1740 寬時約 552）。
 * ══════════════════════════════════════════════════════════════ */

const CG_PREFIX = 'l5-chatgpt-arrow';

const CG_SEGMENTS: readonly { d: string; back: boolean }[] = [
  { d: 'M 222 200 L 736 200', back: false },
  { d: 'M 1102 200 L 1346 200', back: false },
  { d: 'M 1348 238 L 1104 238', back: true },
  { d: 'M 738 238 L 224 238', back: true },
];

const CG_STATUS = [
  '按「送出訊息」，看一則訊息怎麼跑一趟',
  '① 你在 ChatGPT 的 App 裡輸入訊息',
  '② App 直接把訊息送到 OpenAI',
  '③ OpenAI 的模型產生回答，送回 App',
  '④ 你在 App 裡看到回答',
  '人 → App → OpenAI：一條直線，中間沒有別的東西',
] as const;

export function ChatGptArchDemo() {
  /** -1 還沒送；0–3 正在走第幾段；4 走完 */
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (step < 0 || step >= CG_SEGMENTS.length) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), 900);
    return () => window.clearTimeout(timer);
  }, [step]);

  const running = step >= 0 && step < CG_SEGMENTS.length;
  const done = step >= CG_SEGMENTS.length;

  const tone = (node: 'you' | 'app' | 'model'): Tone => {
    if (step === 0) return node === 'model' ? 'normal' : 'on';
    if (step === 1) return node === 'you' ? 'normal' : 'on';
    if (step === 2) return node === 'you' ? 'normal' : 'done';
    if (step === 3) return node === 'model' ? 'normal' : 'done';
    if (step === 4) return node === 'you' ? 'done' : 'normal';
    return 'normal';
  };

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-6">
      <div className="flex h-[64px] shrink-0 items-center justify-between gap-8">
        <p className="text-[26px] text-paper">{CG_STATUS[step + 1]}</p>
        {done ? (
          <button type="button" onClick={() => setStep(-1)} className={BTN_QUIET}>
            重來
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(0)}
            disabled={running}
            className={BTN_PRIMARY}
          >
            {running ? '傳送中…' : '送出訊息'}
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={ARCH_VIEW}
          className="h-auto max-h-full w-full"
          role="img"
          aria-label="你直接使用 ChatGPT 的應用程式，App 再直接串接 OpenAI"
        >
          <ArrowDefs prefix={CG_PREFIX} />

          {/* 底線：去程實線、回程虛線 */}
          <Edge d={CG_SEGMENTS[0].d} tone="normal" prefix={CG_PREFIX} />
          <Edge d={CG_SEGMENTS[1].d} tone="normal" prefix={CG_PREFIX} />
          <Edge d={CG_SEGMENTS[2].d} tone="dim" prefix={CG_PREFIX} dashed />
          <Edge d={CG_SEGMENTS[3].d} tone="dim" prefix={CG_PREFIX} dashed />

          {/* 亮起來的那一段：pathLength=1 的生長線 */}
          {CG_SEGMENTS.map((segment, index) => {
            const lit = step >= index;
            const full = step > index;
            const key: MarkerKey = segment.back ? 'teal' : 'acid';
            return (
              <path
                key={segment.d}
                d={segment.d}
                fill="none"
                stroke={MARKER_COLOR[key]}
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={lit ? 0 : 1}
                markerEnd={full ? `url(#${CG_PREFIX}-${key})` : undefined}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            );
          })}

          <text x={480} y={180} textAnchor="middle" fontSize={19} fill={C.muted}>
            直接使用
          </text>
          <text x={480} y={268} textAnchor="middle" fontSize={18} fill={C.faint}>
            回答
          </text>
          <text x={1225} y={180} textAnchor="middle" fontSize={19} fill={C.muted}>
            直接串接
          </text>

          <SvgNode
            {...ARCH.you}
            glyph="person"
            title="你"
            sub="打開 App 輸入"
            tone={tone('you')}
          />
          <SvgNode
            {...ARCH.mid}
            glyph="app"
            title="ChatGPT 應用程式"
            sub="你直接操作的 App"
            tone={tone('app')}
          />
          <SvgNode
            {...ARCH.model}
            glyph="model"
            title="OpenAI"
            sub="ChatGPT 背後的模型"
            tone={tone('model')}
          />
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 21 頁 · HermesArchDemo — Hermes Agent 的架構
 *
 * callout：「人和電腦裝置之間還會有一個框框。這個框框是在我們的電腦裝置裡面，
 * 我們會安裝 Hermes Agent。接下來，需要讓 OpenAI 進行授權，我們的 Hermes Agent
 * 才能去呼叫 ChatGPT。這個 Hermes Agent 比較大的特點是，它可以操控我們當前這台
 * 電腦。另外也可以方便串接各種通訊工具（如 Discord、Slack、Telegram 等等）。」
 *
 * 座標沿用第 20 頁（見上方 ARCH）。三顆 chip 各自點亮一段：
 *   授權呼叫模型  Hermes → OpenAI 那條線與「授權」標籤
 *   操控這台電腦  電腦框、Hermes、檔案／終端機／瀏覽器
 *   串接通訊工具  你 → 通訊工具 → Hermes
 * 焦點以外的節點退成 dim；再點一次同一顆 chip 回到總覽。
 *
 * 用色：acid（焦點）。
 * 高度：上方列 72 ＋ gap 24 ＋ SVG（約 552）。
 * ══════════════════════════════════════════════════════════════ */

const HM_PREFIX = 'l5-hermes-arrow';

type HermesFocus = 'model' | 'control' | 'chat';

const HERMES_CHIPS: readonly { id: HermesFocus; label: string; text: string }[] = [
  {
    id: 'model',
    label: '授權呼叫模型',
    text: '先讓 OpenAI 授權，Hermes Agent 才能去呼叫 ChatGPT 的模型。',
  },
  {
    id: 'control',
    label: '操控這台電腦',
    text: 'Hermes Agent 裝在你的電腦裡，可以操控當前這台電腦。',
  },
  {
    id: 'chat',
    label: '串接通訊工具',
    text: '方便串接 Discord、Slack、Telegram 等通訊工具，從那裡跟它說話。',
  },
];

const HERMES_OVERVIEW =
  '跟上一頁比，你和 OpenAI 之間多了一個框框：裝在你電腦裡的 Hermes Agent。';

const HERMES_GROUP: Record<HermesFocus, readonly string[]> = {
  model: ['hermes', 'model', 'e-model'],
  control: ['frame', 'hermes', 'file', 'terminal', 'browser', 'e-control'],
  chat: ['you', 'tools', 'hermes', 'e-you', 'e-tools'],
};

const HERMES_TARGETS: readonly {
  id: 'file' | 'terminal' | 'browser';
  label: string;
  x: number;
  from: number;
}[] = [
  { id: 'file', label: '檔案', x: 650, from: 860 },
  { id: 'terminal', label: '終端機', x: 855, from: 920 },
  { id: 'browser', label: '瀏覽器', x: 1060, from: 980 },
];

const HERMES_TOOLS = ['Discord', 'Slack', 'Telegram'] as const;

export function HermesArchDemo() {
  const [focus, setFocus] = useState<HermesFocus | null>(null);

  const tone = (key: string): Tone => {
    if (!focus) return 'normal';
    return HERMES_GROUP[focus].includes(key) ? 'on' : 'dim';
  };

  const current = HERMES_CHIPS.find((chip) => chip.id === focus);
  const frame = TONE[tone('frame')];
  const tools = TONE[tone('tools')];
  const auth = tone('e-model');

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-6">
      <div className="flex h-[72px] shrink-0 items-center gap-6">
        <div className="flex shrink-0 gap-3">
          {HERMES_CHIPS.map((chip) => {
            const on = chip.id === focus;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFocus(on ? null : chip.id)}
                aria-pressed={on}
                className={`h-12 rounded-full border px-6 text-[20px] transition-colors duration-200 ${
                  on
                    ? 'border-acid bg-acid font-medium text-on-accent'
                    : 'border-line bg-panel text-paper hover:border-acid'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <p
          className={`min-w-0 flex-1 border-l-[6px] pl-5 text-[22px] leading-snug text-paper transition-colors ${
            current ? 'border-l-acid' : 'border-l-line'
          }`}
        >
          {current ? current.text : HERMES_OVERVIEW}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={ARCH_VIEW}
          className="h-auto max-h-full w-full"
          role="img"
          aria-label="你透過通訊工具跟電腦裡的 Hermes Agent 說話，Hermes Agent 經過 OpenAI 授權呼叫模型，也能操控這台電腦"
        >
          <ArrowDefs prefix={HM_PREFIX} />

          {/* 你的電腦裝置：框本身 */}
          <rect
            x={620}
            y={20}
            width={630}
            height={480}
            rx={28}
            fill="none"
            stroke={frame.stroke}
            strokeWidth={frame.width}
            className={SVG_TR}
          />
          <text x={648} y={60} fontSize={20} fontWeight={600} fill={frame.title} className={SVG_TR}>
            你的電腦裝置
          </text>

          {/* 連線 */}
          <Edge d="M 222 215 L 296 215" tone={tone('e-you')} prefix={HM_PREFIX} />
          <Edge d="M 542 215 L 736 215" tone={tone('e-tools')} prefix={HM_PREFIX} />
          <Edge d="M 1102 215 L 1346 215" tone={auth} prefix={HM_PREFIX} />
          {HERMES_TARGETS.map((target) => (
            <Edge
              key={target.id}
              d={`M ${target.from} 292 L ${target.x + 90} 396`}
              tone={tone('e-control')}
              prefix={HM_PREFIX}
            />
          ))}
          <text
            x={1008}
            y={356}
            textAnchor="middle"
            fontSize={18}
            fill={TONE[tone('e-control')].title}
            className={SVG_TR}
          >
            操控
          </text>

          {/* 授權標籤：蓋在電腦框的右邊線上 */}
          <g>
            <rect
              x={1150}
              y={166}
              width={150}
              height={34}
              rx={17}
              fill={C.panel}
              stroke={TONE[auth].stroke}
              strokeWidth={TONE[auth].width === 3 ? 2 : 1.5}
              className={SVG_TR}
            />
            <text
              x={1225}
              y={189}
              textAnchor="middle"
              fontSize={18}
              fill={TONE[auth].title}
              className={SVG_TR}
            >
              授權（OAuth）
            </text>
          </g>

          {/* 節點 */}
          <SvgNode
            {...ARCH.you}
            glyph="person"
            title="你"
            sub="傳訊息給它"
            tone={tone('you')}
          />

          <g>
            <rect
              x={300}
              y={100}
              width={240}
              height={230}
              rx={18}
              fill={C.inkSoft}
              stroke={tools.stroke}
              strokeWidth={tools.width}
              className={SVG_TR}
            />
            <text
              x={420}
              y={142}
              textAnchor="middle"
              fontSize={24}
              fontWeight={600}
              fill={tools.title}
              className={SVG_TR}
            >
              通訊工具
            </text>
            {HERMES_TOOLS.map((name, index) => (
              <g key={name}>
                <rect
                  x={330}
                  y={162 + index * 52}
                  width={180}
                  height={40}
                  rx={20}
                  fill={C.panel}
                  stroke={tools.stroke}
                  strokeWidth={1.5}
                  className={SVG_TR}
                />
                <text
                  x={420}
                  y={189 + index * 52}
                  textAnchor="middle"
                  fontSize={19}
                  fill={tone('tools') === 'dim' ? C.faint : C.paper}
                  className={SVG_TR}
                >
                  {name}
                </text>
              </g>
            ))}
          </g>

          <SvgNode
            {...ARCH.mid}
            glyph="agent"
            title="Hermes Agent"
            sub="裝在你的電腦裡"
            tone={tone('hermes')}
          />
          <SvgNode
            {...ARCH.model}
            glyph="model"
            title="OpenAI"
            sub="ChatGPT 背後的模型"
            tone={tone('model')}
          />

          {HERMES_TARGETS.map((target) => {
            const t = TONE[tone(target.id)];
            return (
              <g key={target.id}>
                <rect
                  x={target.x}
                  y={400}
                  width={180}
                  height={72}
                  rx={14}
                  fill={C.inkSoft}
                  stroke={t.stroke}
                  strokeWidth={t.width}
                  className={SVG_TR}
                />
                <Glyph kind={target.id} cx={target.x + 44} cy={436} color={t.glyph} />
                <text
                  x={target.x + 80}
                  y={444}
                  fontSize={22}
                  fill={t.title}
                  className={SVG_TR}
                >
                  {target.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 22 頁 · HermesFeaturesDemo — Hermes Agent 特點
 *
 * callout 指定「左邊是選項，右邊是概念圖」，四點照抄：
 *   01 不需要綁定特定模型   可以選用、混用不同廠商的模型
 *   02 持續學習             特殊的記憶機制、會習慣不斷撰寫 Skill
 *   03 可以有多個 SubAgent  請它派出 SubAgent 幫你做事
 *   04 可延伸串接不同的服務 如 Discord、各種 MCP 等等
 *
 * 右側每一項一張概念圖，各自有一個小互動（切換後狀態重置）：
 *   01 點模型插頭：切換要不要用、可以同時開好幾個（至少留一個）
 *   02 「完成一件任務」：記憶多一筆、Skill 多一張，最多四次
 *   03 「派出 SubAgent」：PM 派工 → 三個 Coding Agent 依序完成 → 彙整
 *   04 點服務插頭：接上／拔掉
 * 模型、服務都只用文字標籤，不畫廠商 logo。記憶與 Skill 的內容是示意。
 *
 * 用色：acid（選取、進行中）＋ teal（只有 03 的完成狀態）。
 * 高度：左欄四項各 128 ＋ 底部小卡；右欄標題列約 80 ＋ SVG（1080 × 520）。
 * ══════════════════════════════════════════════════════════════ */

type FeatureId = 'models' | 'learning' | 'subagents' | 'services';

const FEATURES: readonly { id: FeatureId; name: string; sub: string; text: string }[] = [
  {
    id: 'models',
    name: '不需要綁定特定模型',
    sub: '可以選用、混用不同廠商的模型',
    text: '背後要接哪一家的模型由你決定，也可以同時混用好幾家。',
  },
  {
    id: 'learning',
    name: '持續學習',
    sub: '特殊的記憶機制，習慣不斷撰寫 Skill',
    text: '做過的事會留在記憶裡，也會習慣把做法寫成一個個 Skill。',
  },
  {
    id: 'subagents',
    name: '可以有多個 SubAgent',
    sub: '請它派出 SubAgent 幫你做事',
    text: '它像 PM 一樣拆工作，派出多個 Coding Agent 分頭進行。',
  },
  {
    id: 'services',
    name: '可延伸串接不同的服務',
    sub: '如 Discord、各種 MCP 等等',
    text: '通訊工具、各種 MCP 都能接上來，能做的事跟著變多。',
  },
];

function FeatureFrame({
  name,
  text,
  action,
  children,
}: {
  name: string;
  text: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="slide-enter flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      <div className="flex min-h-[72px] shrink-0 items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <span className={`${LABEL_TYPE} text-acid`}>{name}</span>
          <p className="text-[22px] leading-snug text-paper">{text}</p>
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

const FEAT_VIEW = '0 0 1080 520';
const FEAT_SVG = 'h-auto max-h-full w-full';

/* ── 01 不需要綁定特定模型 ─────────────────────────────── */

const MODEL_PLUGS: readonly { id: string; label: string; x: number; y: number }[] = [
  { id: 'openai', label: 'OpenAI', x: 40, y: 60 },
  { id: 'anthropic', label: 'Anthropic', x: 40, y: 370 },
  { id: 'google', label: 'Google', x: 780, y: 60 },
  { id: 'open', label: '開源模型', x: 780, y: 370 },
];

function ModelsFeature({ feature }: { feature: (typeof FEATURES)[number] }) {
  const [active, setActive] = useState<string[]>(['openai']);

  const toggle = (id: string) => {
    setActive((list) => {
      if (list.includes(id)) return list.length === 1 ? list : list.filter((item) => item !== id);
      return [...list, id];
    });
  };

  return (
    <FeatureFrame
      name={feature.name}
      text={feature.text}
      action={<span className="shrink-0 text-[19px] text-muted">點模型：切換、混用</span>}
    >
      <svg viewBox={FEAT_VIEW} className={FEAT_SVG} role="img" aria-label="Hermes Agent 可以接上不同廠商的模型">
        {MODEL_PLUGS.map((plug) => {
          const on = active.includes(plug.id);
          const left = plug.x < 540;
          const fromX = left ? plug.x + 260 : plug.x;
          const toX = left ? 390 : 690;
          const toY = plug.y < 200 ? 240 : 300;
          return (
            <path
              key={`edge-${plug.id}`}
              d={`M ${fromX} ${plug.y + 45} L ${toX} ${toY}`}
              fill="none"
              stroke={on ? C.acid : C.line}
              strokeWidth={on ? 3 : 2}
              strokeDasharray={on ? undefined : '8 8'}
              className={SVG_TR}
            />
          );
        })}
        <SvgNode
          x={390}
          y={195}
          w={300}
          glyph="agent"
          title="Hermes Agent"
          sub={active.length > 1 ? `同時混用 ${active.length} 家模型` : '目前使用 1 家模型'}
          tone="normal"
        />
        {MODEL_PLUGS.map((plug) => {
          const on = active.includes(plug.id);
          return (
            <PlugNode
              key={plug.id}
              x={plug.x}
              y={plug.y}
              w={260}
              h={90}
              title={plug.label}
              status={on ? '使用中' : '未使用'}
              on={on}
              onClick={() => toggle(plug.id)}
            />
          );
        })}
      </svg>
    </FeatureFrame>
  );
}

/* ── 02 持續學習 ───────────────────────────────────────── */

const LEARN_TASKS: readonly { task: string; memory: string; skill: string }[] = [
  { task: '寫這週的週報', memory: '週報固定週五寄出', skill: '寫週報' },
  { task: '部署網站', memory: '專案用 pnpm 安裝', skill: '部署網站' },
  { task: '批改學生作業', memory: '評語要附上建議', skill: '批改作業' },
  { task: '整理會議紀錄', memory: '紀錄要列出待辦', skill: '整理會議紀錄' },
];

function LearningFeature({ feature }: { feature: (typeof FEATURES)[number] }) {
  const [count, setCount] = useState(0);
  const full = count >= LEARN_TASKS.length;
  const latest = count - 1;

  return (
    <FeatureFrame
      name={feature.name}
      text={feature.text}
      action={
        full ? (
          <button type="button" onClick={() => setCount(0)} className={BTN_QUIET}>
            重來
          </button>
        ) : (
          <button type="button" onClick={() => setCount((value) => value + 1)} className={BTN_PRIMARY}>
            完成一件任務
          </button>
        )
      }
    >
      <svg viewBox={FEAT_VIEW} className={FEAT_SVG} role="img" aria-label="每完成一件任務，記憶多一筆、Skill 多一張">
        {/* 記憶 */}
        <rect x={30} y={30} width={280} height={460} rx={24} fill="none" stroke={C.line} strokeWidth={2} />
        <text x={170} y={76} textAnchor="middle" fontSize={24} fontWeight={600} fill={C.paper}>
          記憶
        </text>
        {count === 0 && (
          <text x={170} y={270} textAnchor="middle" fontSize={19} fill={C.faint}>
            （還沒有記憶）
          </text>
        )}
        {LEARN_TASKS.slice(0, count).map((item, index) => {
          const isNew = index === latest;
          return (
            <g key={item.memory}>
              <rect
                x={52}
                y={100 + index * 92}
                width={236}
                height={72}
                rx={14}
                fill={C.inkSoft}
                stroke={isNew ? C.acid : C.line}
                strokeWidth={isNew ? 3 : 2}
                className={SVG_TR}
              />
              <text x={170} y={143 + index * 92} textAnchor="middle" fontSize={19} fill={C.paper}>
                {item.memory}
              </text>
            </g>
          );
        })}

        {/* Skill：從下往上疊 */}
        <rect x={770} y={30} width={280} height={460} rx={24} fill="none" stroke={C.line} strokeWidth={2} />
        <text x={910} y={76} textAnchor="middle" fontSize={24} fontWeight={600} fill={C.paper}>
          Skill
        </text>
        {count === 0 && (
          <text x={910} y={270} textAnchor="middle" fontSize={19} fill={C.faint}>
            （還沒有 Skill）
          </text>
        )}
        {LEARN_TASKS.slice(0, count).map((item, index) => {
          const isNew = index === latest;
          const y = 396 - index * 92;
          return (
            <g key={item.skill}>
              <rect
                x={792}
                y={y}
                width={236}
                height={72}
                rx={14}
                fill={C.inkSoft}
                stroke={isNew ? C.acid : C.line}
                strokeWidth={isNew ? 3 : 2}
                className={SVG_TR}
              />
              <Glyph kind="file" cx={830} cy={y + 36} color={isNew ? C.acid : C.muted} />
              <text x={858} y={y + 43} fontSize={20} fill={C.paper}>
                {item.skill}
              </text>
            </g>
          );
        })}

        {/* Hermes 與兩條箭頭 */}
        <defs>
          <marker id="l5-learn-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={C.muted} />
          </marker>
        </defs>
        <path d="M 408 270 L 316 270" stroke={C.muted} strokeWidth={2} markerEnd="url(#l5-learn-arrow)" />
        <path d="M 672 270 L 764 270" stroke={C.muted} strokeWidth={2} markerEnd="url(#l5-learn-arrow)" />
        <text x={362} y={252} textAnchor="middle" fontSize={18} fill={C.muted}>
          記住
        </text>
        <text x={718} y={252} textAnchor="middle" fontSize={18} fill={C.muted}>
          寫成 Skill
        </text>
        <SvgNode
          x={410}
          y={195}
          w={260}
          glyph="agent"
          title="Hermes Agent"
          sub={count === 0 ? '還沒做過任務' : `剛完成：${LEARN_TASKS[latest].task}`}
          tone={count === 0 ? 'normal' : 'on'}
        />
      </svg>
    </FeatureFrame>
  );
}

/* ── 03 可以有多個 SubAgent ────────────────────────────── */

const CODING_AGENTS: readonly { task: string; x: number }[] = [
  { task: '前端頁面', x: 40 },
  { task: '後端 API', x: 400 },
  { task: '撰寫測試', x: 760 },
];

const SUB_PREFIX = 'l5-sub-arrow';

function SubagentsFeature({ feature }: { feature: (typeof FEATURES)[number] }) {
  /** 0 待命；1 派工；2–4 第 0–2 個完成；5 PM 彙整完畢 */
  const [tick, setTick] = useState(0);
  const LAST = 5;

  useEffect(() => {
    if (tick < 1 || tick >= LAST) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), 900);
    return () => window.clearTimeout(timer);
  }, [tick]);

  const running = tick >= 1 && tick < LAST;
  const agentTone = (index: number): Tone =>
    tick === 0 ? 'normal' : tick >= 2 + index ? 'done' : 'on';
  const agentStatus = (index: number) =>
    tick === 0 ? '待命' : tick >= 2 + index ? '完成' : '工作中';
  const pmTone: Tone = tick === 0 ? 'normal' : tick >= LAST ? 'done' : 'on';

  return (
    <FeatureFrame
      name={feature.name}
      text={feature.text}
      action={
        tick >= LAST ? (
          <button type="button" onClick={() => setTick(0)} className={BTN_QUIET}>
            重來
          </button>
        ) : (
          <button type="button" onClick={() => setTick(1)} disabled={running} className={BTN_PRIMARY}>
            {running ? '工作中…' : '派出 SubAgent'}
          </button>
        )
      }
    >
      <svg viewBox={FEAT_VIEW} className={FEAT_SVG} role="img" aria-label="Hermes Agent 當 PM，派出三個 Coding Agent 分頭工作">
        <ArrowDefs prefix={SUB_PREFIX} />
        {CODING_AGENTS.map((agent, index) => {
          const cx = agent.x + 140;
          return (
            <Edge
              key={agent.task}
              d={`M 540 182 C 540 260, ${cx} 250, ${cx} 326`}
              tone={agentTone(index)}
              prefix={SUB_PREFIX}
            />
          );
        })}
        <SvgNode
          x={380}
          y={30}
          w={320}
          glyph="agent"
          title="Hermes Agent"
          sub={tick >= LAST ? '彙整結果，回報給你' : 'PM：拆工作、派工作'}
          tone={pmTone}
        />
        {CODING_AGENTS.map((agent, index) => (
          <SvgNode
            key={agent.task}
            x={agent.x}
            y={330}
            w={280}
            glyph="agent"
            title="Coding Agent"
            sub={`${agent.task} · ${agentStatus(index)}`}
            tone={agentTone(index)}
          />
        ))}
      </svg>
    </FeatureFrame>
  );
}

/* ── 04 可延伸串接不同的服務 ───────────────────────────── */

const SERVICE_PLUGS: readonly { id: string; label: string; x: number; y: number }[] = [
  { id: 'discord', label: 'Discord', x: 40, y: 90 },
  { id: 'slack', label: 'Slack', x: 40, y: 220 },
  { id: 'telegram', label: 'Telegram', x: 40, y: 350 },
  { id: 'mcp-db', label: 'MCP · 資料庫', x: 800, y: 90 },
  { id: 'mcp-drive', label: 'MCP · 雲端硬碟', x: 800, y: 220 },
  { id: 'mcp-cal', label: 'MCP · 行事曆', x: 800, y: 350 },
];

function ServicesFeature({ feature }: { feature: (typeof FEATURES)[number] }) {
  const [connected, setConnected] = useState<string[]>(['discord', 'mcp-db']);

  const toggle = (id: string) =>
    setConnected((list) =>
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    );

  return (
    <FeatureFrame
      name={feature.name}
      text={feature.text}
      action={<span className="shrink-0 text-[19px] text-muted">點服務：接上／拔掉</span>}
    >
      <svg viewBox={FEAT_VIEW} className={FEAT_SVG} role="img" aria-label="Hermes Agent 可以接上通訊工具與各種 MCP">
        <text x={160} y={62} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.muted}>
          通訊工具
        </text>
        <text x={920} y={62} textAnchor="middle" fontSize={20} fontWeight={600} fill={C.muted}>
          MCP
        </text>
        {SERVICE_PLUGS.map((plug, index) => {
          const on = connected.includes(plug.id);
          const left = plug.x < 540;
          const fromX = left ? plug.x + 240 : plug.x;
          const toX = left ? 410 : 670;
          const toY = 230 + (index % 3) * 40;
          return (
            <path
              key={`edge-${plug.id}`}
              d={`M ${fromX} ${plug.y + 40} L ${toX} ${toY}`}
              fill="none"
              stroke={on ? C.acid : C.line}
              strokeWidth={on ? 3 : 2}
              strokeDasharray={on ? undefined : '8 8'}
              className={SVG_TR}
            />
          );
        })}
        <SvgNode
          x={410}
          y={185}
          w={260}
          glyph="agent"
          title="Hermes Agent"
          sub={`已接上 ${connected.length} 個服務`}
          tone="normal"
        />
        {SERVICE_PLUGS.map((plug) => {
          const on = connected.includes(plug.id);
          return (
            <PlugNode
              key={plug.id}
              x={plug.x}
              y={plug.y}
              w={240}
              h={80}
              title={plug.label}
              status={on ? '已接上' : '點一下接上'}
              on={on}
              onClick={() => toggle(plug.id)}
            />
          );
        })}
      </svg>
    </FeatureFrame>
  );
}

export function HermesFeaturesDemo() {
  const [id, setId] = useState<FeatureId>('models');
  const feature = FEATURES.find((item) => item.id === id) ?? FEATURES[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：四個特點 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        {FEATURES.map((item, index) => (
          <MenuButton
            key={item.id}
            index={index}
            on={item.id === id}
            title={item.name}
            sub={item.sub}
            onClick={() => setId(item.id)}
            className="h-[128px] shrink-0"
          />
        ))}
        <div className="mt-auto flex flex-col gap-2 rounded-2xl border border-line bg-panel px-6 py-5">
          <span className={LABEL_FAINT}>Level 05</span>
          <p className="text-[20px] leading-snug text-muted">
            開始出現 PM Agent，由 Agent 管理其他 Coding Agent。
          </p>
        </div>
      </div>

      {/* ── 右：概念圖（切換時重置各自的互動狀態）── */}
      <div className="flex min-h-0 flex-col">
        {id === 'models' && <ModelsFeature key="models" feature={feature} />}
        {id === 'learning' && <LearningFeature key="learning" feature={feature} />}
        {id === 'subagents' && <SubagentsFeature key="subagents" feature={feature} />}
        {id === 'services' && <ServicesFeature key="services" feature={feature} />}
      </div>
    </div>
  );
}
