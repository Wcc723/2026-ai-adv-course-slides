import { useId, type ReactElement } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 提示詞兩頁共用的圖解：一條從零到完成的線
 *
 * 第 20 頁（MainlineDemo）與第 21 頁（ThreeFactorsDemo）畫的是同一條線。
 * 元件刻意「不內建任何形狀」—— 直線、抖動折線、往下偏的曲線、發散的分支，
 * 一律由呼叫端用 `paths[].d` 表達，這裡只負責四件事：
 *   1. 依 tone 給顏色（一律 var(--color-*)，元件裡沒有 hex）
 *   2. `progress` 生長（pathLength=1 + dasharray "1 1" + dashoffset 1-progress，
 *      呼叫端不必知道路徑實際長度）
 *   3. `opacity` 淡入淡出（CSS transition，不硬切）
 *   4. 節點 / 節點標籤 / 終點旗子
 *
 * 色彩契約（兩頁一致）：
 *   acid   主線、順利、你要的方向
 *   teal   輕微抖動（AI 隨機，仍往終點走）
 *   coral  偏離（提示詞給錯），連走偏的終點也用它 —— 一頁只留兩個強調色
 *   blue   模糊分岔（資源不足），配虛線與 0.42 的透明度
 *
 * 亮色主題的調整（相對於深色原版）：
 *   - 節點仍是 ink-soft 填色 + 彩色描邊，在亮色下就是「淺沙色卡片配深色描邊」
 *   - `dim` 節點原本整組壓到 0.42，標籤文字會掉到 2:1 以下；
 *     現在只壓圓點，標籤改用 faint 全不透明，唸得出來但不搶戲
 *   - 箭頭 marker 的 id 加上實例前綴，同頁兩個實例也不會共用一支
 *
 * ──────────────────────────────────────────────────────────────
 * 基準座標系（以下所有 d 字串都以 width={880} height={300} 為準）
 * ──────────────────────────────────────────────────────────────
 *   主線 y            140
 *   五個節點 x        [70, 215, 360, 505, 650]
 *   線的終點 x        790        （留 30px 給箭頭，不要壓到旗桿）
 *   終點旗子          { x: 820, y: 140 }
 *
 * 標籤畫在節點下方 40px、字級 17，所以節點 y 最多到 ~245；
 * 旗子往上長 46px，所以 goal.y 最少要 ~60。節點標籤控制在 7 個字以內
 * （節點間距 145，再長會左右相撞）。`paths[].id` 在同一個實例內要唯一。
 * ══════════════════════════════════════════════════════════════ */

/* ── 公開型別 ───────────────────────────────────────────── */

export type TrackTone = 'acid' | 'coral' | 'teal' | 'blue';

export interface TrackNode {
  /** viewBox 座標 */
  x: number;
  y: number;
  tone: TrackTone;
  /** 節點下方的小標籤，可省略 */
  label?: string;
  /** 目前被強調的節點會放大並加外環 */
  active?: boolean;
  /**
   * 壓暗節點。給「沒有發生的那條路」的端點用 ——
   * 線本身淡掉了，端點卻維持滿強度的話，畫面最亮的會是沒有發生的事。
   */
  dim?: boolean;
}

export interface TrackPath {
  id: string;
  d: string;
  tone: TrackTone;
  dashed?: boolean;
  /** 0~1，用 stroke-dasharray/offset 做生長；省略等同 1 */
  progress?: number;
  /** 0~1，淡入淡出 */
  opacity?: number;
  width?: number;
  /** 終點要不要加箭頭 */
  arrow?: boolean;
}

export interface MainlineTrackProps {
  width: number;
  height: number;
  paths: TrackPath[];
  nodes: TrackNode[];
  /** 終點旗標的座標，省略就不畫 */
  goal?: { x: number; y: number; tone: TrackTone; label?: string };
  /** 給 <title> 用的一句話 */
  title: string;
}

/* ── 內部常數 ───────────────────────────────────────────── */

const TONE_VAR: Record<TrackTone, string> = {
  acid: 'var(--color-acid)',
  coral: 'var(--color-coral)',
  teal: 'var(--color-teal)',
  blue: 'var(--color-blue)',
};

/** dashed 的虛線樣式，使用者座標單位 */
const DASH_PATTERN = '14 10';

const DEFAULT_STROKE = 4;

/** 節點標籤字級。viewBox 座標，硬規則是不得低於 16 */
const LABEL_SIZE = 17;

/** dim 節點的圓點透明度。標籤不跟著壓，見 TrackNodeView */
const DIM_OPACITY = 0.42;

/** 生長遮罩比線本身寬的量（使用者座標），讓通道兩側留一點餘裕 */
const MASK_PAD = 10;

/**
 * 箭頭 marker 沒有指定 markerUnits，SVG 預設是 `strokeWidth` —— marker 的座標系
 * 會被 stroke-width 放大，內容 `M0,0 L0,6 L9,3 z` 的半高 3 實際是 3 × strokeWidth。
 * 「虛線 + 生長」的遮罩會連 marker 一起遮，通道不夠寬就會把箭頭兩側削掉，
 * 所以有箭頭的線要把通道再加寬 2 × 3 × strokeWidth。
 */
const MASK_ARROW_HALF_PER_WIDTH = 3;

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function arrowId(uid: string, tone: TrackTone) {
  return `pw-arrow-${uid}-${tone}`;
}

/* ── 箭頭 marker：依 tone 各建一支 ─────────────────────── */

function TrackArrowMarker({ uid, tone }: { uid: string; tone: TrackTone }) {
  return (
    <marker
      id={arrowId(uid, tone)}
      markerWidth={10}
      markerHeight={10}
      refX={9}
      refY={3}
      orient="auto"
    >
      <path d="M0,0 L0,6 L9,3 z" fill={TONE_VAR[tone]} />
    </marker>
  );
}

/* ── 一條線 ─────────────────────────────────────────────── */

interface TrackPathViewProps {
  path: TrackPath;
  /** 同一份 MainlineTrack 的實例前綴，避免同頁兩個實例的 id 互撞 */
  uid: string;
  boxWidth: number;
  boxHeight: number;
}

/**
 * `progress` 與 `dashed` 各自的實作方式不同，兩者同時給的時候會打架：
 * 生長靠的就是 stroke-dasharray，虛線靠的也是。
 *
 * 所以只有「虛線 + 生長」這一種組合會多包一層遮罩 —— 遮罩裡放一條加粗的
 * 路徑，由它吃 pathLength/dashoffset 負責生長，外面那條維持虛線外觀。
 * 其餘情況都只畫一條 path，不製造多餘的 DOM。
 */
function TrackPathView({
  path,
  uid,
  boxWidth,
  boxHeight,
}: TrackPathViewProps): ReactElement {
  const color = TONE_VAR[path.tone];
  const strokeWidth = path.width ?? DEFAULT_STROKE;
  const grows = path.progress !== undefined;
  const progress = clamp01(path.progress ?? 1);
  const masked = grows && path.dashed === true;
  const maskId = `pw-grow-${uid}-${path.id}`;

  const line = (
    <path
      d={path.d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={path.opacity ?? 1}
      markerEnd={path.arrow ? `url(#${arrowId(uid, path.tone)})` : undefined}
      mask={masked ? `url(#${maskId})` : undefined}
      pathLength={grows && !masked ? 1 : undefined}
      strokeDasharray={
        masked || (!grows && path.dashed)
          ? DASH_PATTERN
          : grows
            ? '1 1'
            : undefined
      }
      strokeDashoffset={grows && !masked ? 1 - progress : undefined}
      className="transition-[stroke-dashoffset,opacity] duration-700 ease-out"
    />
  );

  if (!masked) return line;

  return (
    <>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={boxWidth}
          height={boxHeight}
        >
          {/* 遮罩用亮度取樣，這裡的 white 是遮罩開關不是配色，不走色票 */}
          <path
            d={path.d}
            fill="none"
            stroke="white"
            strokeWidth={
              strokeWidth +
              MASK_PAD +
              (path.arrow === true
                ? strokeWidth * MASK_ARROW_HALF_PER_WIDTH * 2
                : 0)
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - progress}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </mask>
      </defs>
      {line}
    </>
  );
}

/* ── 一個節點 ───────────────────────────────────────────── */

function TrackNodeView({ node }: { node: TrackNode }): ReactElement {
  const color = TONE_VAR[node.tone];
  const active = node.active === true;
  const dim = node.dim === true;

  return (
    <g>
      <g opacity={dim ? DIM_OPACITY : 1}>
        {active && (
          <circle
            cx={node.x}
            cy={node.y}
            r={22}
            fill="none"
            stroke={color}
            strokeWidth={2}
            opacity={0.55}
          />
        )}
        <circle
          cx={node.x}
          cy={node.y}
          r={active ? 13 : 9}
          fill="var(--color-ink-soft)"
          stroke={color}
          strokeWidth={active ? 4 : 3}
          className="transition-[r,stroke-width] duration-300 ease-out"
        />
      </g>
      {node.label && (
        <text
          x={node.x}
          y={node.y + (active ? 46 : 40)}
          textAnchor="middle"
          // dim 的標籤改用 faint 而不是壓透明度：紙面上 0.42 的強調色只剩 2:1
          fill={dim ? 'var(--color-faint)' : color}
          fontSize={LABEL_SIZE}
          fontWeight={500}
        >
          {node.label}
        </text>
      )}
    </g>
  );
}

/* ── 終點旗子 ───────────────────────────────────────────── */

function TrackGoalFlag({
  goal,
  width,
}: {
  goal: NonNullable<MainlineTrackProps['goal']>;
  width: number;
}): ReactElement {
  const color = TONE_VAR[goal.tone];
  const top = goal.y - 46;

  /*
   * 終點通常貼著 viewBox 右緣，置中的標籤很容易超出去被裁掉
   * （SVG 是 overflow: hidden，而且稽核腳本量不到 —— 裁切不會改變 scrollWidth）。
   * 中文字寬約等於 fontSize，據此估半寬；放不下就改成靠右對齊。
   */
  const halfLabel = ((goal.label?.length ?? 0) * LABEL_SIZE) / 2;
  const clampRight = goal.x + halfLabel > width - 4;

  return (
    <g>
      <line
        x1={goal.x}
        y1={goal.y}
        x2={goal.x}
        y2={top}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M ${goal.x} ${top} L ${goal.x + 32} ${top + 11} L ${goal.x} ${top + 22} Z`}
        fill={color}
        fillOpacity={0.85}
      />
      <circle cx={goal.x} cy={goal.y} r={5} fill={color} />
      {goal.label && (
        <text
          x={clampRight ? width - 4 : goal.x}
          y={goal.y + 38}
          textAnchor={clampRight ? 'end' : 'middle'}
          fill={color}
          fontSize={LABEL_SIZE}
          fontWeight={500}
        >
          {goal.label}
        </text>
      )}
    </g>
  );
}

/* ── 主元件 ─────────────────────────────────────────────── */

export function MainlineTrack({
  width,
  height,
  paths,
  nodes,
  goal,
  title,
}: MainlineTrackProps): ReactElement {
  // React 的 id 含非英數字元，拿來拼 url(#…) 之前先洗掉
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // 只替真的有用到箭頭的 tone 建 marker，DOM 不長多餘的節點
  const arrowTones = Array.from(
    new Set(paths.filter((path) => path.arrow).map((path) => path.tone)),
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      <title>{title}</title>

      {arrowTones.length > 0 && (
        <defs>
          {arrowTones.map((tone) => (
            <TrackArrowMarker key={tone} uid={uid} tone={tone} />
          ))}
        </defs>
      )}

      {/* 線在最底層，節點與旗子疊在線上面 */}
      {paths.map((path) => (
        <TrackPathView
          key={path.id}
          path={path}
          uid={uid}
          boxWidth={width}
          boxHeight={height}
        />
      ))}

      {goal && <TrackGoalFlag goal={goal} width={width} />}

      {nodes.map((node) => (
        <TrackNodeView key={`${node.x}-${node.y}-${node.tone}`} node={node} />
      ))}
    </svg>
  );
}
