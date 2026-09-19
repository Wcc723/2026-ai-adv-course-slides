import type { ReactNode } from 'react';

/* ════════════════════════════════════════════════════════════
 * 第 26、31、34 頁（demos-site.tsx）用到的圖示與小圖解
 *
 * - 小圖示一律 32×32 的 viewBox、線條用 currentColor，顏色交給外層的
 *   text-* 決定。這些是本檔自己畫的線條圖示，不是素材庫的 SVG，
 *   所以不受「素材不可改成 currentColor」那條規則限制。
 * - 大一點的圖解（資料庫與備份）照專案慣例：不畫背景矩形、
 *   顏色一律 var(--color-*)、節點 ink-soft 填色配彩色描邊、文字 ≥ 16。
 * ════════════════════════════════════════════════════════════ */

interface GlyphProps {
  size?: number;
  className?: string;
}

function Glyph({
  size = 28,
  className,
  strokeWidth = 2,
  children,
}: GlyphProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className ?? ''}`}
    >
      {children}
    </svg>
  );
}

export function PersonGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx={16} cy={10.5} r={5} />
      <path d="M6 27c0-5.6 4.5-9.5 10-9.5s10 3.9 10 9.5" />
    </Glyph>
  );
}

export function LockGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x={7.5} y={14} width={17} height={13} rx={2.5} />
      <path d="M11 14v-3.5a5 5 0 0 1 10 0V14" />
      <path d="M16 19.5v3" />
    </Glyph>
  );
}

export function GlobeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx={16} cy={16} r={11} />
      <ellipse cx={16} cy={16} rx={4.8} ry={11} />
      <path d="M5 16h22" />
      <path d="M7.2 10h17.6M7.2 22h17.6" />
    </Glyph>
  );
}

export function KeyGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx={10.5} cy={16} r={5} />
      <path d="M15.5 16H27" />
      <path d="M22.5 16v4.5M26.5 16v3.5" />
    </Glyph>
  );
}

export function SheetGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x={6} y={5} width={20} height={22} rx={2.5} />
      <path d="M6 11.5h20M6 17.5h20M6 23.5h20" />
      <path d="M13 11.5V27" />
    </Glyph>
  );
}

export function DatabaseGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <ellipse cx={16} cy={8.5} rx={10} ry={3.8} />
      <path d="M6 8.5v15c0 2.1 4.5 3.8 10 3.8s10-1.7 10-3.8v-15" />
      <path d="M6 16c0 2.1 4.5 3.8 10 3.8s10-1.7 10-3.8" />
    </Glyph>
  );
}

export function FileGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M9 4.5h10l6 6V27.5H9z" />
      <path d="M19 4.5v6h6" />
      <path d="M12.5 17h9M12.5 22h9" />
    </Glyph>
  );
}

export function ImageGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x={5} y={7} width={22} height={18} rx={2.5} />
      <circle cx={12} cy={13} r={2.2} />
      <path d="m6 23 7-7 5 5 3-3 5 5" />
    </Glyph>
  );
}

export function ServerGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x={5} y={6} width={22} height={9} rx={2} />
      <rect x={5} y={17} width={22} height={9} rx={2} />
      <path d="M9.5 10.5h.01M9.5 21.5h.01" strokeWidth={3} />
      <path d="M15 10.5h8M15 21.5h8" />
    </Glyph>
  );
}

export function BrowserGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x={4} y={6} width={24} height={20} rx={2.5} />
      <path d="M4 12h24" />
      <path d="M8 9h.01M11 9h.01" strokeWidth={2.6} />
    </Glyph>
  );
}

export function GearGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx={16} cy={16} r={4} />
      <path d="M16 4.5v4M16 23.5v4M4.5 16h4M23.5 16h4M7.9 7.9l2.8 2.8M21.3 21.3l2.8 2.8M7.9 24.1l2.8-2.8M21.3 10.7l2.8-2.8" />
    </Glyph>
  );
}

export function ChatGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M6 7.5h20v13H14l-6 5v-5H6z" />
      <path d="M11 12.5h10M11 16.5h6" />
    </Glyph>
  );
}

export function TrashGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M6 9h20" />
      <path d="M12.5 9V6h7v3" />
      <path d="M8.5 9 10 27h12l1.5-18" />
      <path d="M14 14v8M18 14v8" />
    </Glyph>
  );
}

export function InfoGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx={16} cy={16} r={11} />
      <path d="M16 14.5v8" />
      <path d="M16 10h.01" strokeWidth={3} />
    </Glyph>
  );
}

export function CheckGlyph(props: GlyphProps) {
  return (
    <Glyph strokeWidth={3} {...props}>
      <path d="m7.5 16.5 6 6L25 10" />
    </Glyph>
  );
}

export function CrossGlyph(props: GlyphProps) {
  return (
    <Glyph strokeWidth={3} {...props}>
      <path d="m9.5 9.5 13 13M22.5 9.5l-13 13" />
    </Glyph>
  );
}

/**
 * 連接兩張卡片的短箭頭。
 * ok＝實線（走得過去）、blocked＝虛線中間一個叉（走不過去）、idle＝淡虛線（還沒走到）。
 * 顏色由外層 text-* 決定，箭頭方向用 direction 切換。
 */
export function Connector({
  state,
  direction = 'right',
  width = 64,
}: {
  state: 'ok' | 'blocked' | 'idle';
  direction?: 'left' | 'right';
  width?: number;
}) {
  const mid = width / 2;
  const head =
    direction === 'right'
      ? `M${width - 12} 6 L${width - 2} 14 L${width - 12} 22`
      : `M12 6 L2 14 L12 22`;
  return (
    <svg
      width={width}
      height={28}
      viewBox={`0 0 ${width} 28`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={`M3 14 H${width - 3}`}
        strokeDasharray={state === 'ok' ? undefined : '5 6'}
      />
      {state !== 'blocked' && <path d={head} />}
      {state === 'blocked' && (
        <path
          d={`M${mid - 7} 7 L${mid + 7} 21 M${mid + 7} 7 L${mid - 7} 21`}
          strokeWidth={3.5}
        />
      )}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * 第 26 頁第 3 項的概念圖：網站的資料庫有容量上限，備份那一顆是問號
 * ──────────────────────────────────────────────────────────── */

function Cylinder({
  x,
  y,
  w,
  h,
  stroke,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  dashed?: boolean;
}) {
  const rx = w / 2;
  const ry = 22;
  const cx = x + rx;
  const dash = dashed ? '10 8' : undefined;
  return (
    <g stroke={stroke} strokeWidth={3} strokeDasharray={dash}>
      <path
        d={`M${x} ${y} V${y + h} A${rx} ${ry} 0 0 0 ${x + w} ${y + h} V${y}`}
        fill={dashed ? 'none' : 'var(--color-ink-soft)'}
      />
      <ellipse
        cx={cx}
        cy={y}
        rx={rx}
        ry={ry}
        fill={dashed ? 'none' : 'var(--color-panel)'}
      />
    </g>
  );
}

export function DataLimitDiagram() {
  return (
    <svg width={400} height={420} viewBox="0 0 400 420" role="img">
      <title>每個網站的資料庫有 10 GB 的上限，但官方沒有說明備份</title>

      {/* 網站的資料庫 */}
      <Cylinder x={24} y={70} w={200} h={250} stroke="var(--color-teal)" />
      {/* 已用量：淡色水位＋一條實線刻度，不讓淡色單獨承擔語意 */}
      <path
        d="M27 250 A100 22 0 0 0 221 250 V320 A100 22 0 0 1 27 320 Z"
        fill="var(--color-teal)"
        fillOpacity={0.2}
        stroke="none"
      />
      <path
        d="M27 250 A100 22 0 0 0 221 250"
        stroke="var(--color-teal)"
        strokeWidth={2}
        fill="none"
      />
      <text
        x={124}
        y={172}
        textAnchor="middle"
        fontSize={22}
        fill="var(--color-muted)"
      >
        每個網站
      </text>
      <text
        x={124}
        y={218}
        textAnchor="middle"
        fontSize={42}
        fontWeight={700}
        fill="var(--color-paper)"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        10 GB
      </text>
      <text
        x={124}
        y={392}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
        fill="var(--color-teal)"
      >
        網站的資料庫
      </text>

      {/* 備份：官方沒有說明 → 虛線加問號 */}
      <Cylinder
        x={268}
        y={150}
        w={112}
        h={150}
        stroke="var(--color-coral)"
        dashed
      />
      <text
        x={324}
        y={252}
        textAnchor="middle"
        fontSize={60}
        fontWeight={700}
        fill="var(--color-coral)"
      >
        ?
      </text>
      <text
        x={324}
        y={392}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
        fill="var(--color-coral)"
      >
        備份？
      </text>
      <path
        d="M226 236 H262"
        stroke="var(--color-coral)"
        strokeWidth={2.5}
        strokeDasharray="5 6"
      />
    </svg>
  );
}
