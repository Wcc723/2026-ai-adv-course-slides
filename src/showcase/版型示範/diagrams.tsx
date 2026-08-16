/**
 * 圖解撰寫慣例（新專案標準）
 *
 * - 不畫背景矩形，讓面板的 bg-panel 直接透出來
 * - 顏色一律用 CSS 變數：fill="var(--color-teal)"，換色票時圖解會跟著換
 * - viewBox 取 16:9 附近的比例，實際大小交給版型縮放
 * - 文字最小 16（舞台座標），對應直播用簡報「不小於 12px」的規範
 */

const NODE_HEIGHT = 132;

function Node({
  x,
  y,
  label,
  sub,
  color,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={220}
        height={NODE_HEIGHT}
        rx={16}
        fill="var(--color-ink-soft)"
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={x + 110}
        y={y + 56}
        textAnchor="middle"
        fill={color}
        fontSize={26}
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={x + 110}
        y={y + 90}
        textAnchor="middle"
        fill="var(--color-muted)"
        fontSize={18}
      >
        {sub}
      </text>
    </g>
  );
}

function Arrow({
  from,
  to,
  y,
  label,
  color,
  dashed = false,
}: {
  from: number;
  to: number;
  y: number;
  label: string;
  color: string;
  dashed?: boolean;
}) {
  const markerId = `arrow-${color.replace(/[^a-z]/g, '')}-${dashed ? 'd' : 's'}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={from}
        y1={y}
        x2={to}
        y2={y}
        stroke={color}
        strokeWidth={3}
        strokeDasharray={dashed ? '8 6' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={(from + to) / 2}
        y={y - 16}
        textAnchor="middle"
        fill={color}
        fontSize={18}
      >
        {label}
      </text>
    </g>
  );
}

/** 前端 → API → 資料庫的請求／回應流程 */
export function RequestFlowDiagram() {
  return (
    <svg width={900} height={480} viewBox="0 0 900 480" role="img">
      <title>前端、API 伺服器與資料庫之間的請求與回應流程</title>

      <Node
        x={30}
        y={100}
        label="前端網頁"
        sub="Browser"
        color="var(--color-role-client)"
      />
      <Node
        x={340}
        y={100}
        label="API 伺服器"
        sub="Server"
        color="var(--color-role-server)"
      />
      <Node
        x={650}
        y={100}
        label="資料庫"
        sub="Database"
        color="var(--color-role-data)"
      />

      <Arrow
        from={256}
        to={332}
        y={140}
        label="request"
        color="var(--color-coral)"
      />
      <Arrow
        from={566}
        to={642}
        y={140}
        label="query"
        color="var(--color-coral)"
      />
      <Arrow
        from={642}
        to={566}
        y={200}
        label="rows"
        color="var(--color-teal)"
        dashed
      />
      <Arrow
        from={332}
        to={256}
        y={200}
        label="response"
        color="var(--color-teal)"
        dashed
      />

      <rect
        x={30}
        y={310}
        width={840}
        height={130}
        rx={16}
        fill="var(--color-ink-soft)"
        stroke="var(--color-line)"
      />
      <text x={58} y={352} fill="var(--color-paper)" fontSize={22} fontWeight={600}>
        圖解用色慣例
      </text>
      <text x={58} y={390} fill="var(--color-muted)" fontSize={19}>
        角色用 role-client / role-server / role-data，去程用 coral，回程用 teal 虛線。
      </text>
      <text x={58} y={420} fill="var(--color-faint)" fontSize={17}>
        全部寫成 var(--color-*)，之後調整色票時所有圖解會同步更新。
      </text>
    </svg>
  );
}
