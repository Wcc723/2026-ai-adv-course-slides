import type { ReactElement } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈從 0 到 1 的網站開發〉— 第 37 頁的延伸版運作概念圖（StorageMap）
 *
 * 只給 ./demos-bonus-storage 用。
 *
 * 第 25 頁的 ArchMap 只有「使用者／前端／後端／資料庫」，這一頁要把
 * 資料庫拆成 D1 與 R2 兩格，所以另外畫一張，視覺語言照抄 ArchMap：
 *   - 同樣的圓角節點、焦點外環（RING_PAD）、pathLength=1 的生長箭頭
 *   - 前端與伺服器之間兩條永遠都在的虛線軌道（網路）
 *   - 伺服器那一圈標成「ChatGPT Sites」，框本身不吃強調色
 * diagrams-web.tsx 本身沒有動，圖示也是在這裡重畫的（形狀照 roleGlyph）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（整頁只有兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   teal   D1、R2 與資料流（同 role-data）
 *   coral  風險：沒有備份、Beta 不保證
 *   使用者、前端、後端一律中性（muted／line）。第 25 頁它們各有角色色，
 *   這一頁的主角是資料，其他節點退成灰階，強調色才不會超過兩支。
 *
 * ──────────────────────────────────────────────────────────────
 * 座標（viewBox 660 × 496，放進 660 寬的欄位時是 1:1，字級就是實際像素）
 * ──────────────────────────────────────────────────────────────
 *   使用者      ( 12,  12) 200 × 50
 *   前端        ( 12, 118) 200 × 160
 *   備份？      ( 12, 326) 200 × 150    只有第 03、選到「自己另存」時出現
 *   Sites 外框  (286,  12) 362 × 472
 *   後端        (308,  64) 318 × 132
 *   D1          (308, 290) 152 × 176
 *   R2          (474, 290) 152 × 176
 *   網路去程    y 142   x 220 → 300
 *   網路回程    y 180   x 300 → 220
 * 兩條網路軌道都落在前端（118–278）與後端（64–196）的 y 範圍裡，
 * 箭頭兩端都真的接在方塊上。
 * ══════════════════════════════════════════════════════════════ */

/* ── 型別 ─────────────────────────────────────────────────── */

/** 沒有強調色的三個節點 */
export type NeutralNode = 'user' | 'client' | 'backend';

/**
 * D1／R2 的狀態。
 *   off   存在但這一步沒用到（灰框）
 *   soft  有關係但不是主角（teal 細框、不填色）
 *   on    這一步的主角（teal 粗框 ＋ 淡填色）
 *   risk  有風險（coral 粗框 ＋ 淡填色）
 *   gone  已經不在了（虛線、faint）
 */
export type DataState = 'off' | 'soft' | 'on' | 'risk' | 'gone';

export type StoreArrow =
  | 'userToClient'
  | 'clientToBackend'
  | 'backendToClient'
  | 'backendToD1'
  | 'd1ToBackend'
  | 'backendToR2'
  | 'r2ToBackend'
  | 'toBackup';

export type RingNode = NeutralNode | 'd1' | 'r2' | 'backup';

/** Sites 外框：一般、Beta（coral 虛線 ＋ 徽章）、已經不在（line 虛線） */
export type FrameState = 'plain' | 'beta' | 'gone';

/** 外框外面那一格：不畫、官方沒說（coral 問號）、你自己另存的（teal） */
export type BackupState = 'none' | 'unknown' | 'mine';

export interface StorageMapProps {
  /** 哪些中性節點亮起 */
  lit: NeutralNode[];
  d1: DataState;
  r2: DataState;
  arrows?: StoreArrow[];
  /** 目前的焦點，外面多一圈 */
  ring?: RingNode;
  frame?: FrameState;
  backup?: BackupState;
  /** 網路斷了：兩條軌道轉 coral，中間一個 ✕ */
  cut?: boolean;
  /** 蓋在外框中間的一枚實心章（網站已下架、已永久刪除） */
  stamp?: string;
  /** D1、R2 右上角的 coral 問號 */
  unsure?: boolean;
  /** 節點最下面那一行的說明，會隨互動換 */
  notes?: Partial<Record<'client' | 'd1' | 'r2', string>>;
  /** 左下角的圖例：teal 往下＝寫進去、往上＝讀出來（跟備份那一格共用位置） */
  legend?: boolean;
}

/* ── 常數 ─────────────────────────────────────────────────── */

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  teal: 'var(--color-teal)',
  coral: 'var(--color-coral)',
  onAccent: 'var(--color-on-accent)',
} as const;

type ArrowTone = 'teal' | 'coral' | 'muted';

const ARROW_COLOR: Record<ArrowTone, string> = {
  teal: C.teal,
  coral: C.coral,
  muted: C.muted,
};

/** marker id 的前綴，跟 diagrams-web 的 web-arch-arrow 分開 */
const ARROW_ID = 'b37-store-arrow';

const SVG_TR =
  'transition-[fill,stroke,opacity,fill-opacity,stroke-dashoffset,stroke-width] duration-500 ease-out';

const RING_PAD = 6;

const BOX = {
  user: { x: 12, y: 12, w: 200, h: 50 },
  client: { x: 12, y: 118, w: 200, h: 160 },
  backup: { x: 12, y: 326, w: 200, h: 150 },
  backend: { x: 308, y: 64, w: 318, h: 132 },
  d1: { x: 308, y: 290, w: 152, h: 176 },
  r2: { x: 474, y: 290, w: 152, h: 176 },
} as const;

const FRAME = { x: 286, y: 12, w: 362, h: 472 } as const;

const LANE_OUT = 142;
const LANE_BACK = 180;

const ARROW_D: Record<StoreArrow, string> = {
  userToClient: 'M 112 68 L 112 110',
  clientToBackend: `M 220 ${LANE_OUT} L 300 ${LANE_OUT}`,
  backendToClient: `M 300 ${LANE_BACK} L 220 ${LANE_BACK}`,
  backendToD1: 'M 370 204 L 370 282',
  d1ToBackend: 'M 398 282 L 398 204',
  backendToR2: 'M 536 204 L 536 282',
  r2ToBackend: 'M 564 282 L 564 204',
  toBackup: 'M 300 400 L 222 400',
};

const ARROW_TONE: Record<StoreArrow, ArrowTone> = {
  userToClient: 'muted',
  clientToBackend: 'muted',
  backendToClient: 'muted',
  backendToD1: 'teal',
  d1ToBackend: 'teal',
  backendToR2: 'teal',
  r2ToBackend: 'teal',
  toBackup: 'teal',
};

/* ── 圖示（形狀照 diagrams-web 的 roleGlyph，顏色改成參數）──── */

type GlyphId = 'person' | 'browser' | 'code' | 'database' | 'image' | 'archive';

function Glyph({
  id,
  x,
  y,
  size,
  color,
  wash = 0.22,
}: {
  id: GlyphId;
  x: number;
  y: number;
  size: number;
  color: string;
  wash?: number;
}): ReactElement {
  const outline = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: SVG_TR,
  };
  const band = { fill: color, fillOpacity: wash, stroke: 'none', className: SVG_TR };
  const dot = { fill: color, stroke: 'none', className: SVG_TR };

  let shape: ReactElement;
  switch (id) {
    case 'person':
      shape = (
        <g>
          <circle cx={22} cy={15} r={7} {...band} />
          <circle cx={22} cy={15} r={7} {...outline} />
          <path d="M9 37 C9 29.5 14.8 25 22 25 C29.2 25 35 29.5 35 37" {...outline} />
        </g>
      );
      break;
    case 'browser':
      shape = (
        <g>
          <rect x={5} y={9} width={34} height={27} rx={4} {...band} />
          <rect x={5} y={9} width={34} height={27} rx={4} {...outline} />
          <path d="M5 17 H39" {...outline} />
          <circle cx={10} cy={13} r={1.6} {...dot} />
          <circle cx={15} cy={13} r={1.6} {...dot} />
          <circle cx={20} cy={13} r={1.6} {...dot} />
          <path d="M11 24 H33" {...outline} />
          <path d="M11 30 H26" {...outline} />
        </g>
      );
      break;
    case 'code':
      shape = (
        <g>
          <rect x={5} y={8} width={34} height={28} rx={4} {...band} />
          <rect x={5} y={8} width={34} height={28} rx={4} {...outline} />
          <path d="M16 17 L11 22 L16 27" {...outline} />
          <path d="M28 17 L33 22 L28 27" {...outline} />
          <path d="M24 15 L20 29" {...outline} />
        </g>
      );
      break;
    case 'database':
      shape = (
        <g>
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12 Z" {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...outline} />
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12" {...outline} />
          <path d="M8 22 C8 25 14 27 22 27 C30 27 36 25 36 22" {...outline} />
        </g>
      );
      break;
    case 'image':
      shape = (
        <g>
          <rect x={6} y={9} width={32} height={26} rx={3} {...band} />
          <rect x={6} y={9} width={32} height={26} rx={3} {...outline} />
          <circle cx={15} cy={17} r={3} {...outline} />
          <path d="M6 31 L16 22 L23 28 L28 24 L38 32" {...outline} />
        </g>
      );
      break;
    case 'archive':
      /* 一個箱子加往下的箭頭：「存一份到自己這邊」 */
      shape = (
        <g>
          <rect x={6} y={8} width={32} height={8} rx={2} {...band} />
          <rect x={6} y={8} width={32} height={8} rx={2} {...outline} />
          <path d="M9 16 V34 C9 35.1 9.9 36 11 36 H33 C34.1 36 35 35.1 35 34 V16" {...outline} />
          <path d="M22 20 V31" {...outline} />
          <path d="M17 26.5 L22 31 L27 26.5" {...outline} />
        </g>
      );
      break;
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${size / 44})`} aria-hidden="true">
      {shape}
    </g>
  );
}

/* ── 箭頭 marker 與箭頭 ─────────────────────────────────── */

function ArrowDefs(): ReactElement {
  return (
    <defs>
      {(Object.keys(ARROW_COLOR) as ArrowTone[]).map((tone) => (
        <marker
          key={tone}
          id={`${ARROW_ID}-${tone}`}
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={ARROW_COLOR[tone]} />
        </marker>
      ))}
    </defs>
  );
}

/** 同 ArchMap 的 FlowArrow：dashoffset 讓線「長出來」，整組一起吃 opacity */
function Arrow({ d, tone, shown }: { d: string; tone: ArrowTone; shown: boolean }) {
  return (
    <g opacity={shown ? 1 : 0} className={SVG_TR}>
      <path
        d={d}
        fill="none"
        stroke={ARROW_COLOR[tone]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={shown ? 0 : 1}
        markerEnd={`url(#${ARROW_ID}-${tone})`}
        className={SVG_TR}
      />
    </g>
  );
}

/* ── 焦點外環 ─────────────────────────────────────────────── */

function Ring({
  box,
  color,
  shown,
}: {
  box: { x: number; y: number; w: number; h: number };
  color: string;
  shown: boolean;
}) {
  return (
    <rect
      x={box.x - RING_PAD}
      y={box.y - RING_PAD}
      width={box.w + RING_PAD * 2}
      height={box.h + RING_PAD * 2}
      rx={22}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      opacity={shown ? 0.8 : 0}
      className={SVG_TR}
    />
  );
}

/* ── 中性節點：使用者、前端、後端 ───────────────────────── */

interface NeutralLook {
  stroke: string;
  dash?: string;
  fill: string;
  fillOpacity: number;
  title: string;
  note: string;
  icon: string;
}

function neutralLook(on: boolean, gone: boolean, fill: string): NeutralLook {
  if (gone) {
    return { stroke: C.line, dash: '8 6', fill, fillOpacity: 0, title: C.faint, note: C.faint, icon: C.faint };
  }
  if (on) {
    return { stroke: C.muted, fill, fillOpacity: 1, title: C.paper, note: C.muted, icon: C.muted };
  }
  return { stroke: C.line, fill, fillOpacity: 0, title: C.muted, note: C.faint, icon: C.faint };
}

function NeutralRect({ box, look }: { box: { x: number; y: number; w: number; h: number }; look: NeutralLook }) {
  return (
    <rect
      x={box.x}
      y={box.y}
      width={box.w}
      height={box.h}
      rx={16}
      fill={look.fill}
      fillOpacity={look.fillOpacity}
      stroke={look.stroke}
      strokeWidth={2}
      strokeDasharray={look.dash}
      className={SVG_TR}
    />
  );
}

/* ── D1／R2 ─────────────────────────────────────────────── */

interface DataLook {
  stroke: string;
  strokeWidth: number;
  dash?: string;
  fillOpacity: number;
  accent: string;
  title: string;
  sub: string;
}

function dataLook(state: DataState): DataLook {
  switch (state) {
    case 'on':
      return { stroke: C.teal, strokeWidth: 3, fillOpacity: 0.16, accent: C.teal, title: C.paper, sub: C.muted };
    case 'soft':
      return { stroke: C.teal, strokeWidth: 2, fillOpacity: 0, accent: C.teal, title: C.paper, sub: C.muted };
    case 'risk':
      return { stroke: C.coral, strokeWidth: 3, fillOpacity: 0.14, accent: C.coral, title: C.paper, sub: C.muted };
    case 'gone':
      return { stroke: C.line, strokeWidth: 2, dash: '8 6', fillOpacity: 0, accent: C.faint, title: C.faint, sub: C.faint };
    case 'off':
      return { stroke: C.line, strokeWidth: 2, fillOpacity: 0, accent: C.faint, title: C.muted, sub: C.faint };
  }
}

function DataBox({
  box,
  state,
  glyph,
  name,
  sub,
  note,
  unsure,
}: {
  box: { x: number; y: number; w: number; h: number };
  state: DataState;
  glyph: GlyphId;
  name: string;
  sub: string;
  note?: string;
  unsure: boolean;
}) {
  const look = dataLook(state);
  const cx = box.x + box.w / 2;

  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={16}
        fill={look.accent}
        fillOpacity={look.fillOpacity}
        stroke={look.stroke}
        strokeWidth={look.strokeWidth}
        strokeDasharray={look.dash}
        className={SVG_TR}
      />
      <Glyph
        id={glyph}
        x={cx - 22}
        y={box.y + 16}
        size={44}
        color={look.accent}
        wash={state === 'gone' || state === 'off' ? 0.12 : 0.22}
      />
      <text
        x={cx}
        y={box.y + 94}
        textAnchor="middle"
        fill={look.title}
        fontSize={32}
        fontWeight={700}
        style={{ fontFamily: 'var(--font-display)' }}
        className={SVG_TR}
      >
        {name}
      </text>
      <text x={cx} y={box.y + 122} textAnchor="middle" fill={look.sub} fontSize={19} className={SVG_TR}>
        {sub}
      </text>
      {note !== undefined && (
        <text
          x={cx}
          y={box.y + 154}
          textAnchor="middle"
          fill={look.title}
          fontSize={17}
          fontWeight={600}
          className={SVG_TR}
        >
          {note}
        </text>
      )}
      {/* 問號用實心徽章，不靠淡填色表達「不確定」 */}
      <g opacity={unsure ? 1 : 0} className={SVG_TR}>
        <circle cx={box.x + box.w - 6} cy={box.y + 6} r={17} fill={C.coral} />
        <text
          x={box.x + box.w - 6}
          y={box.y + 14}
          textAnchor="middle"
          fill={C.onAccent}
          fontSize={22}
          fontWeight={700}
        >
          ?
        </text>
      </g>
    </g>
  );
}

/* ── 外框外面的「備份」 ─────────────────────────────────── */

function BackupBox({ state }: { state: BackupState }) {
  const { x, y, w, h } = BOX.backup;
  const cx = x + w / 2;

  if (state === 'none') return null;

  if (state === 'unknown') {
    /* 同第 26 頁 DataLimitDiagram 的「備份？」：虛線加大問號 */
    return (
      <g>
        <path
          d="M 300 400 L 218 400"
          fill="none"
          stroke={C.coral}
          strokeWidth={2.5}
          strokeDasharray="6 7"
        />
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={16}
          fill="none"
          stroke={C.coral}
          strokeWidth={3}
          strokeDasharray="10 8"
        />
        <text x={cx} y={y + 88} textAnchor="middle" fill={C.coral} fontSize={60} fontWeight={700}>
          ?
        </text>
        <text x={cx} y={y + 128} textAnchor="middle" fill={C.coral} fontSize={21} fontWeight={600}>
          官方備份？
        </text>
      </g>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={C.teal}
        fillOpacity={0.16}
        stroke={C.teal}
        strokeWidth={3}
      />
      <Glyph id="archive" x={cx - 22} y={y + 16} size={44} color={C.teal} />
      <text x={cx} y={y + 94} textAnchor="middle" fill={C.paper} fontSize={22} fontWeight={700}>
        你另存的一份
      </text>
      <text x={cx} y={y + 124} textAnchor="middle" fill={C.muted} fontSize={18}>
        「匯出我的資料」
      </text>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * StorageMap
 * ══════════════════════════════════════════════════════════════ */

export function StorageMap({
  lit,
  d1,
  r2,
  arrows = [],
  ring,
  frame = 'plain',
  backup = 'none',
  cut = false,
  stamp,
  unsure = false,
  notes = {},
  legend = false,
}: StorageMapProps): ReactElement {
  const on = (node: NeutralNode) => lit.includes(node);
  const frameGone = frame === 'gone';

  const user = neutralLook(on('user'), false, C.panel);
  const client = neutralLook(on('client'), false, C.panel);
  const backend = neutralLook(on('backend'), frameGone, C.inkSoft);

  const ringColor = (node: RingNode) => {
    if (node === 'd1') return d1 === 'risk' ? C.coral : C.teal;
    if (node === 'r2') return r2 === 'risk' ? C.coral : C.teal;
    if (node === 'backup') return backup === 'mine' ? C.teal : C.coral;
    return C.muted;
  };

  const laneColor = cut ? C.coral : C.line;

  return (
    <svg
      viewBox="0 0 660 496"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="網站運作概念圖：使用者、前端，以及 ChatGPT Sites 上的後端、D1 資料庫與 R2 檔案空間"
    >
      <ArrowDefs />

      {/* ── ChatGPT Sites 外框：畫在最底層，節點疊在它上面 ── */}
      <g>
        <rect
          x={FRAME.x}
          y={FRAME.y}
          width={FRAME.w}
          height={FRAME.h}
          rx={24}
          fill={C.panel}
          stroke={frame === 'beta' ? C.coral : frameGone ? C.line : C.muted}
          strokeWidth={frameGone ? 2 : 3}
          strokeDasharray={frame === 'plain' ? undefined : '12 8'}
          className={SVG_TR}
        />
        <text
          x={FRAME.x + 22}
          y={FRAME.y + 34}
          fill={frameGone ? C.faint : C.paper}
          fontSize={21}
          fontWeight={600}
          className={SVG_TR}
        >
          ChatGPT Sites
        </text>
        {frame !== 'plain' && (
          <g>
            <rect x={FRAME.x + FRAME.w - 92} y={FRAME.y + 12} width={72} height={30} rx={15} fill={C.coral} />
            <text
              x={FRAME.x + FRAME.w - 56}
              y={FRAME.y + 33}
              textAnchor="middle"
              fill={C.onAccent}
              fontSize={18}
              fontWeight={700}
            >
              Beta
            </text>
          </g>
        )}
      </g>

      {/* ── 網路：兩條虛線軌道永遠都在，斷線時轉 coral ── */}
      <g>
        <path
          d={`M 218 ${LANE_OUT} L 302 ${LANE_OUT}`}
          fill="none"
          stroke={laneColor}
          strokeWidth={3}
          strokeDasharray="9 9"
          strokeLinecap="round"
          className={SVG_TR}
        />
        <path
          d={`M 218 ${LANE_BACK} L 302 ${LANE_BACK}`}
          fill="none"
          stroke={laneColor}
          strokeWidth={3}
          strokeDasharray="9 9"
          strokeLinecap="round"
          className={SVG_TR}
        />
        {cut ? (
          <g>
            <circle cx={260} cy={161} r={17} fill={C.coral} />
            <path
              d="M 253 154 L 267 168 M 267 154 L 253 168"
              stroke={C.onAccent}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <text x={260} y={167} textAnchor="middle" fill={C.faint} fontSize={17}>
            網路
          </text>
        )}
      </g>

      {/* ── 使用者 ── */}
      <Ring box={BOX.user} color={ringColor('user')} shown={ring === 'user'} />
      <NeutralRect box={BOX.user} look={user} />
      <Glyph id="person" x={58} y={20} size={34} color={user.icon} />
      <text x={100} y={45} fill={user.title} fontSize={22} fontWeight={600} className={SVG_TR}>
        使用者
      </text>

      {/* ── 前端 ── */}
      <Ring box={BOX.client} color={ringColor('client')} shown={ring === 'client'} />
      <NeutralRect box={BOX.client} look={client} />
      <Glyph id="browser" x={90} y={134} size={44} color={client.icon} />
      <text x={112} y={212} textAnchor="middle" fill={client.title} fontSize={26} fontWeight={600} className={SVG_TR}>
        前端
      </text>
      <text x={112} y={244} textAnchor="middle" fill={client.note} fontSize={18} className={SVG_TR}>
        {notes.client ?? '瀏覽器裡的畫面'}
      </text>

      {/* ── 後端 ── */}
      <Ring box={BOX.backend} color={ringColor('backend')} shown={ring === 'backend'} />
      <NeutralRect box={BOX.backend} look={backend} />
      <Glyph id="code" x={447} y={76} size={40} color={backend.icon} />
      <text x={467} y={148} textAnchor="middle" fill={backend.title} fontSize={24} fontWeight={600} className={SVG_TR}>
        後端
      </text>
      <text x={467} y={178} textAnchor="middle" fill={backend.note} fontSize={18} className={SVG_TR}>
        處理邏輯的程式
      </text>

      {/* ── D1、R2 ── */}
      <Ring box={BOX.d1} color={ringColor('d1')} shown={ring === 'd1'} />
      <DataBox box={BOX.d1} state={d1} glyph="database" name="D1" sub="資料庫" note={notes.d1} unsure={unsure} />
      <Ring box={BOX.r2} color={ringColor('r2')} shown={ring === 'r2'} />
      <DataBox box={BOX.r2} state={r2} glyph="image" name="R2" sub="檔案空間" note={notes.r2} unsure={unsure} />

      {/* ── 左下角圖例：跟備份那一格共用位置，兩者不會同時出現 ── */}
      {legend && backup === 'none' && (
        <g>
          <text x={24} y={350} fill={C.faint} fontSize={17}>
            資料流
          </text>
          <Arrow d="M 40 364 L 40 410" tone="teal" shown />
          <text x={66} y={394} fill={C.muted} fontSize={19}>
            寫進去
          </text>
          <Arrow d="M 40 472 L 40 426" tone="teal" shown />
          <text x={66} y={454} fill={C.muted} fontSize={19}>
            讀出來
          </text>
        </g>
      )}

      {/* ── 外框外面的備份 ── */}
      <Ring box={BOX.backup} color={ringColor('backup')} shown={ring === 'backup'} />
      <BackupBox state={backup} />

      {/* ── 箭頭畫在最上層 ── */}
      {(Object.keys(ARROW_D) as StoreArrow[]).map((arrow) => (
        <Arrow key={arrow} d={ARROW_D[arrow]} tone={ARROW_TONE[arrow]} shown={arrows.includes(arrow)} />
      ))}

      {/* ── 實心章：蓋在後端與 D1、R2 之間的空隙 ── */}
      {stamp !== undefined && (
        <g>
          <rect x={347} y={218} width={240} height={48} rx={12} fill={C.coral} />
          <text x={467} y={250} textAnchor="middle" fill={C.onAccent} fontSize={22} fontWeight={700}>
            {stamp}
          </text>
        </g>
      )}
    </svg>
  );
}
