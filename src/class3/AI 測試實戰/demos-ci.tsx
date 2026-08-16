import { useEffect, useState } from 'react';

/**
 * 第三堂課 · 三、外部資源與 GitHub Actions
 *
 * `ci-flow` → CiFlowDemo  GitHub Actions 運作流程（可播放）
 *
 * 用色分工（一頁最多兩支主強調色，語意用語意 token）：
 * - CiFlowDemo：acid＝當前步驟與 CTA、ok＝通過、error＝失敗（2 主 + 1 延伸）
 *
 * SVG 文字的對比是拿「SVG 的 DOM 父層背景」去算的，不是拿節點自己的 fill，
 * 所以所有 <text> 一律用 paper / muted / faint / 強調色，
 * 絕對不要出現 on-accent（挖空字在稽核眼中等於白底白字）。
 */

/* ════════════════════════════════════════════════════════════
 * 共用零件
 * ════════════════════════════════════════════════════════════ */

type Tone = 'acid';

/** 選中／主要動作：實心對比。hover 換邊框色，不動透明度以免壓低對比 */
const SOLID_FACE: Record<Tone, string> = {
  acid: 'border-acid bg-acid text-on-accent hover:border-paper',
};

const IDLE_FACE =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';

const DISABLED_FACE = 'cursor-not-allowed border-line-soft bg-panel-lift text-faint';

function DemoButton({
  label,
  tone,
  selected = false,
  disabled = false,
  onClick,
}: {
  label: string;
  tone: Tone;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const face = disabled ? DISABLED_FACE : selected ? SOLID_FACE[tone] : IDLE_FACE;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-lg border-2 px-5 py-2 text-[19px] transition-colors ${face}`}
    >
      {label}
    </button>
  );
}

/** 箭頭 marker。用 userSpaceOnUse 讓箭頭大小不隨 strokeWidth 變動 */
const ARROW_COLORS = ['line', 'muted', 'ok', 'error'] as const;
type ArrowColor = (typeof ARROW_COLORS)[number];

function ArrowMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      {ARROW_COLORS.map((name) => (
        <marker
          key={name}
          id={`${prefix}-${name}`}
          markerUnits="userSpaceOnUse"
          markerWidth={14}
          markerHeight={12}
          refX={13}
          refY={6}
          orient="auto"
        >
          <path d="M0,0 L0,12 L13,6 z" fill={`var(--color-${name})`} />
        </marker>
      ))}
    </defs>
  );
}

function ArrowPath({
  d,
  color,
  prefix,
  width = 2.5,
}: {
  d: string;
  color: ArrowColor;
  prefix: string;
  width?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={`var(--color-${color})`}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd={`url(#${prefix}-${color})`}
    />
  );
}

/* ════════════════════════════════════════════════════════════
 * 35 · CiFlowDemo — GitHub Actions 運作流程
 * ════════════════════════════════════════════════════════════ */

type FlowState = 'pending' | 'running' | 'done' | 'failed';
type FlowOutcome = 'idle' | 'running' | 'passed' | 'failed';
type FlowScenario = 'pass' | 'fail';

interface FlowUnit {
  id: string;
  label: string;
  sub: string;
}

/** 前四格是雲端把環境準備好的過程，後四格是 jobs 裡真正執行的步驟 */
const PIPELINE_NODES: FlowUnit[] = [
  { id: 'local', label: '本地端開發', sub: '你的電腦' },
  { id: 'repo', label: 'GitHub Repository', sub: '遠端儲存庫' },
  { id: 'workflow', label: '觸發 Workflow', sub: 'Push／PR／排程' },
  { id: 'runner', label: '建立 Runner', sub: '乾淨的執行環境' },
];

const JOB_STEPS: FlowUnit[] = [
  { id: 'checkout', label: 'Checkout', sub: '取出這次的程式碼' },
  { id: 'install', label: '安裝依賴', sub: 'npm ci' },
  { id: 'verify', label: '檢查與測試', sub: 'lint + test' },
  { id: 'build', label: 'Build', sub: '產出可部署的檔案' },
];

const FLOW_UNITS: FlowUnit[] = [...PIPELINE_NODES, ...JOB_STEPS];
/** 失敗情境停在「檢查與測試」，也就是第 7 格（索引 6） */
const FAIL_INDEX = 6;
const FLOW_STEP_MS = 760;

const FLOW_STROKE: Record<FlowState, string> = {
  pending: 'var(--color-line)',
  running: 'var(--color-acid)',
  done: 'var(--color-ok)',
  failed: 'var(--color-error)',
};

/** 文字色與描邊色分開列：line 是邊框色，絕對不能拿來當文字 */
const FLOW_TEXT: Record<FlowState, string> = {
  pending: 'var(--color-faint)',
  running: 'var(--color-acid)',
  done: 'var(--color-ok)',
  failed: 'var(--color-error)',
};

const FLOW_WORD: Record<FlowState, string> = {
  pending: '待執行',
  running: '執行中',
  done: '完成',
  failed: '失敗',
};

/**
 * 狀態圖示。打勾與叉號畫成 path 而不是 <text>：
 * 挖空字在稽核眼中是拿 DOM 背景去算對比的，一定過不了。
 */
function StatusGlyph({ x, y, state }: { x: number; y: number; state: FlowState }) {
  const color = FLOW_STROKE[state];

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={15}
        fill="var(--color-panel)"
        stroke={color}
        strokeWidth={state === 'pending' ? 2 : 3}
      />
      {state === 'done' && (
        <path
          d={`M ${x - 7} ${y} L ${x - 2} ${y + 6} L ${x + 8} ${y - 6}`}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {state === 'failed' && (
        <g stroke={color} strokeWidth={3} strokeLinecap="round">
          <path d={`M ${x - 6} ${y - 6} L ${x + 6} ${y + 6}`} />
          <path d={`M ${x + 6} ${y - 6} L ${x - 6} ${y + 6}`} />
        </g>
      )}
      {state === 'running' && <circle cx={x} cy={y} r={6} fill={color} />}
      {state === 'pending' && <circle cx={x} cy={y} r={4} fill="var(--color-line)" />}
    </g>
  );
}

function PipelineNode({
  x,
  unit,
  state,
}: {
  x: number;
  unit: FlowUnit;
  state: FlowState;
}) {
  return (
    <g>
      <rect
        x={x}
        y={8}
        width={320}
        height={92}
        rx={16}
        fill="var(--color-ink-soft)"
        stroke={FLOW_STROKE[state]}
        strokeWidth={state === 'pending' ? 2 : 3}
        strokeDasharray={state === 'pending' ? '8 7' : undefined}
      />
      <StatusGlyph x={x + 36} y={54} state={state} />
      <text x={x + 66} y={48} fontSize={25} fontWeight={600} fill="var(--color-paper)">
        {unit.label}
      </text>
      <text x={x + 66} y={76} fontSize={18} fill="var(--color-muted)">
        {unit.sub}
      </text>
    </g>
  );
}

function JobChip({
  x,
  unit,
  state,
}: {
  x: number;
  unit: FlowUnit;
  state: FlowState;
}) {
  return (
    <g>
      <rect
        x={x}
        y={176}
        width={300}
        height={104}
        rx={14}
        fill="var(--color-ink-soft)"
        stroke={FLOW_STROKE[state]}
        strokeWidth={state === 'pending' ? 2 : 3}
        strokeDasharray={state === 'pending' ? '8 7' : undefined}
      />
      <StatusGlyph x={x + 38} y={228} state={state} />
      <text x={x + 68} y={220} fontSize={24} fontWeight={600} fill="var(--color-paper)">
        {unit.label}
      </text>
      <text x={x + 68} y={248} fontSize={18} fill={FLOW_TEXT[state]}>
        {FLOW_WORD[state]}
      </text>
    </g>
  );
}

function ResultBox({
  y,
  state,
  title,
  sub,
}: {
  y: number;
  state: FlowState;
  title: string;
  sub: string;
}) {
  return (
    <g>
      <rect
        x={700}
        y={y}
        width={880}
        height={88}
        rx={16}
        fill="var(--color-ink-soft)"
        stroke={FLOW_STROKE[state]}
        strokeWidth={state === 'pending' ? 2 : 3}
        strokeDasharray={state === 'pending' ? '8 7' : undefined}
      />
      <StatusGlyph x={740} y={y + 44} state={state} />
      <text x={772} y={y + 38} fontSize={24} fontWeight={600} fill="var(--color-paper)">
        {title}
      </text>
      <text x={772} y={y + 68} fontSize={18} fill="var(--color-muted)">
        {sub}
      </text>
    </g>
  );
}

interface FlowStatus {
  title: string;
  color: string;
  lines: [string, string];
}

function readFlowStatus(
  outcome: FlowOutcome,
  cursor: number,
  scenario: FlowScenario,
): FlowStatus {
  if (outcome === 'idle') {
    return {
      title: '等待推送',
      color: 'var(--color-faint)',
      lines: ['選好情境，按下 git push', '整段流程都在 GitHub 的機器上跑'],
    };
  }

  if (outcome === 'passed') {
    return {
      title: '全部通過',
      color: 'var(--color-ok)',
      lines: ['四個步驟都是綠燈', '可以合併，也可以接著部署'],
    };
  }

  if (outcome === 'failed') {
    return {
      title: '檢查與測試沒過',
      color: 'var(--color-error)',
      lines: ['Build 不會執行，流程中止', '先看 Log 與 Artifact 再修'],
    };
  }

  const unit = FLOW_UNITS[cursor];
  const total = FLOW_UNITS.length;

  return {
    title: unit.label,
    color: 'var(--color-acid)',
    lines: [
      `第 ${cursor + 1} ／ ${total} 步\u3000${unit.sub}`,
      scenario === 'pass' ? '一路綠燈到 Build' : '會停在檢查與測試',
    ],
  };
}

const FLOW_LEGEND: { label: string; dot: string }[] = [
  { label: '待執行', dot: 'bg-line' },
  { label: '執行中', dot: 'bg-acid' },
  { label: '完成', dot: 'bg-ok' },
  { label: '失敗', dot: 'bg-error' },
];

const PIPELINE_X = [50, 470, 890, 1310];
const JOB_X = [136, 505, 874, 1243];

export function CiFlowDemo() {
  const [scenario, setScenario] = useState<FlowScenario>('pass');
  const [cursor, setCursor] = useState(0);
  const [outcome, setOutcome] = useState<FlowOutcome>('idle');

  useEffect(() => {
    if (outcome !== 'running') return undefined;

    const timer = window.setTimeout(() => {
      if (scenario === 'fail' && cursor === FAIL_INDEX) {
        setOutcome('failed');
        return;
      }
      if (cursor >= FLOW_UNITS.length - 1) {
        setCursor(FLOW_UNITS.length);
        setOutcome('passed');
        return;
      }
      setCursor(cursor + 1);
    }, FLOW_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [outcome, cursor, scenario]);

  const play = () => {
    setCursor(0);
    setOutcome('running');
  };

  const pick = (next: FlowScenario) => {
    setScenario(next);
    setCursor(0);
    setOutcome('idle');
  };

  const unitState = (index: number): FlowState => {
    if (outcome === 'idle') return 'pending';
    if (outcome === 'failed' && index === FAIL_INDEX) return 'failed';
    if (index < cursor) return 'done';
    if (index === cursor) return outcome === 'running' ? 'running' : 'done';
    return 'pending';
  };

  const passState: FlowState = outcome === 'passed' ? 'done' : 'pending';
  const failState: FlowState = outcome === 'failed' ? 'failed' : 'pending';
  const status = readFlowStatus(outcome, cursor, scenario);

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex shrink-0 items-center gap-4">
        <span className="font-display text-[18px] tracking-[0.16em] text-faint">
          情境
        </span>
        <DemoButton
          label="成功"
          tone="acid"
          selected={scenario === 'pass'}
          onClick={() => pick('pass')}
        />
        <DemoButton
          label="失敗"
          tone="acid"
          selected={scenario === 'fail'}
          onClick={() => pick('fail')}
        />

        <div className="ml-8 flex items-center gap-6">
          {FLOW_LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span className={`size-3.5 rounded-full ${item.dot}`} />
              <span className="text-[18px] text-muted">{item.label}</span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <DemoButton
            label="git push"
            tone="acid"
            selected
            disabled={outcome === 'running'}
            onClick={play}
          />
          <DemoButton label="重播" tone="acid" onClick={play} />
        </div>
      </div>

      <svg
        viewBox="0 0 1680 520"
        className="h-auto w-full"
        role="img"
        aria-label="GitHub Actions 從 git push 到合併或查看 Log 的執行流程"
      >
        <title>
          GitHub Actions 從 git push 到合併或查看 Log 的執行流程
        </title>
        <ArrowMarkers prefix="ciflow" />

        {/* 第一排：本地端 → Repository → 觸發 Workflow → 建立 Runner */}
        {PIPELINE_NODES.map((unit, index) => (
          <PipelineNode
            key={unit.id}
            x={PIPELINE_X[index]}
            unit={unit}
            state={unitState(index)}
          />
        ))}
        <ArrowPath d="M 380 54 H 462" color="muted" prefix="ciflow" />
        <text
          x={421}
          y={40}
          textAnchor="middle"
          fontSize={18}
          fontFamily="var(--font-mono)"
          fill="var(--color-muted)"
        >
          git push
        </text>
        <ArrowPath d="M 800 54 H 882" color="muted" prefix="ciflow" />
        <ArrowPath d="M 1220 54 H 1302" color="muted" prefix="ciflow" />
        <ArrowPath d="M 1470 106 V 126" color="muted" prefix="ciflow" />

        {/* jobs 容器：虛線框代表「同一個 Runner 內的一組步驟」 */}
        <rect
          x={100}
          y={128}
          width={1480}
          height={170}
          rx={20}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={2}
          strokeDasharray="10 8"
        />
        <text
          x={128}
          y={162}
          fontSize={21}
          fontFamily="var(--font-mono)"
          fill="var(--color-faint)"
        >
          jobs
        </text>
        <text x={192} y={162} fontSize={19} fill="var(--color-faint)">
          在同一個 Runner 內依序執行，前一步沒過就不會往下走
        </text>

        {JOB_STEPS.map((unit, index) => (
          <JobChip
            key={unit.id}
            x={JOB_X[index]}
            unit={unit}
            state={unitState(PIPELINE_NODES.length + index)}
          />
        ))}
        <ArrowPath d="M 446 228 H 497" color="muted" prefix="ciflow" />
        <ArrowPath d="M 815 228 H 866" color="muted" prefix="ciflow" />
        <ArrowPath d="M 1184 228 H 1235" color="muted" prefix="ciflow" />

        {/* 分岔：上成功、下失敗 */}
        <path
          d="M 560 298 V 464"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={2.5}
        />
        <ArrowPath
          d="M 560 360 H 692"
          color={outcome === 'passed' ? 'ok' : 'line'}
          prefix="ciflow"
        />
        <ArrowPath
          d="M 560 464 H 692"
          color={outcome === 'failed' ? 'error' : 'line'}
          prefix="ciflow"
        />
        <text x={626} y={348} textAnchor="middle" fontSize={18} fill="var(--color-muted)">
          全部通過
        </text>
        <text x={626} y={452} textAnchor="middle" fontSize={18} fill="var(--color-muted)">
          任一失敗
        </text>

        <ResultBox
          y={316}
          state={passState}
          title="成功：允許合併／部署"
          sub="PR 上的檢查變綠，合併鍵才會解鎖"
        />
        <ResultBox
          y={420}
          state={failState}
          title="失敗：查看 Log／Artifact"
          sub="下載 Artifact 看測試報告，修好再推一次"
        />

        {/* 左下角的執行狀態播報 */}
        <text
          x={100}
          y={344}
          fontSize={18}
          letterSpacing={4}
          fill="var(--color-faint)"
        >
          執行狀態
        </text>
        <text x={100} y={390} fontSize={28} fontWeight={600} fill={status.color}>
          {status.title}
        </text>
        <text x={100} y={426} fontSize={19} fill="var(--color-muted)">
          {status.lines[0]}
        </text>
        <text x={100} y={454} fontSize={19} fill="var(--color-muted)">
          {status.lines[1]}
        </text>
      </svg>
    </div>
  );
}
