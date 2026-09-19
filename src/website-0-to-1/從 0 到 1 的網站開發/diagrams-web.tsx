import type { ReactElement } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈從 0 到 1 的網站開發〉— 網站怎麼運作（圖解）
 *
 * 這個檔案只有兩樣東西，全部給 ./demos-web 用：
 *
 *   ArchMap   第 15、16、25 頁共用的「運作概念圖」
 *   RoleIcon  角色與檔案的小圖示（瀏覽器、伺服器、資料庫、圖片檔…）
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼 ArchMap 要三頁共用
 * ──────────────────────────────────────────────────────────────
 * 第 15、16 頁沿用〈網站是如何運作的〉的規格：右側是同一張運作概念圖，
 * 節點座標**完全不動**，換的只有「哪些節點亮起、畫哪幾支箭頭」。
 * 第 25 頁（什麼是 ChatGPT Sites）的 Notion 規格也指定回到這張圖，
 * 只是把伺服器那一圈標成「ChatGPT Sites」（`serverLabel`）。
 * 台下三次看到的是同一張圖被逐步標註，不是三張長得像的圖。
 *
 * ──────────────────────────────────────────────────────────────
 * 色彩契約（全篇共用，元件裡不會出現任何 hex）
 * ──────────────────────────────────────────────────────────────
 *   user    role-user   使用者、操作端
 *   client  role-client 前端、瀏覽器
 *   backend role-server 後端程式
 *   db      role-data   資料庫
 *   host    muted/line  **伺服器：刻意沒有強調色**
 *   net     faint       網路：它是路徑不是角色
 *   danger  danger      被擋下來、失敗的操作
 *   html / css / js     第 17、18 頁的三個檔案，直接吃 lang-* 三色
 *   img     violet      第 18 頁的圖片檔。它不是程式語言，所以不借 lang-*
 *
 * 伺服器畫成一個沒有顏色的框、程式卡片放在框裡面，是在講同一句話 ——
 * 「程式碼本身不會自己動，要有伺服器把它跑起來」。
 *
 * ──────────────────────────────────────────────────────────────
 * 亮色主題的表面關係
 * ──────────────────────────────────────────────────────────────
 * ArchMap 放在 `bg-panel-lift`（淺沙）的容器裡。伺服器框用 `panel`（最亮）
 * 填滿，看起來是一張「浮在沙色上的白紙」；點名前是 0.6 的半透明加虛線。
 * 節點點名後用自己的角色色填 0.18 —— 紙底會吃掉更低的透明度，而且
 * 框線本身是不透明的角色色，淡色填色不單獨承擔「被點名」這個語意。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用型別與常數 ─────────────────────────────────────── */

/** 全篇的色調名 */
export type Tone =
  | 'user'
  | 'client'
  | 'backend'
  | 'db'
  | 'host'
  | 'net'
  | 'danger'
  | 'html'
  | 'css'
  | 'js'
  | 'img';

/** tone → theme.css 的色票變數。這個檔案裡不會出現任何 hex */
const TONE_VAR: Record<Tone, string> = {
  user: 'var(--color-role-user)',
  client: 'var(--color-role-client)',
  backend: 'var(--color-role-server)',
  db: 'var(--color-role-data)',
  host: 'var(--color-muted)',
  net: 'var(--color-faint)',
  danger: 'var(--color-danger)',
  html: 'var(--color-lang-html)',
  css: 'var(--color-lang-css)',
  js: 'var(--color-lang-javascript)',
  img: 'var(--color-violet)',
};

/** ArchMap 只會畫到這幾種色調的箭頭 */
const ARROW_TONES: Tone[] = ['user', 'client', 'backend', 'db'];

/** marker id 的前綴。同一頁若有兩張 SVG 用同名 marker 會互相覆蓋 */
const ARROW_ID = 'web-arch-arrow';

/**
 * SVG 元素的過渡。`d` 不在裡面 —— 它不能 transition，會直接硬切。
 * fill-opacity 與 stroke-dashoffset 都要單獨列，只寫 fill / stroke 帶不到。
 */
const SVG_TR =
  'transition-[fill,stroke,opacity,fill-opacity,stroke-dashoffset,stroke-width] duration-500 ease-out';

/** 圖示的過渡短一點，點下去要跟手 */
const ICON_TR = 'transition-[fill,stroke,opacity] duration-300 ease-out';

/**
 * 焦點外環比方塊本身外擴的量。箭頭的起訖點都要避開它，
 * 不然 markerEnd 會穿過外環的框線。
 */
const RING_PAD = 6;

/* ── 箭頭 marker：每個 tone 各一支 ─────────────────────── */

/**
 * markerUnits 用預設的 strokeWidth，所以 marker 的實際大小 = 內容 × 線寬。
 * 這裡的線一律 strokeWidth 3，箭頭實長 27、半高 9。
 */
function WebArrowDefs(): ReactElement {
  return (
    <defs>
      {ARROW_TONES.map((tone) => (
        <marker
          key={tone}
          id={`${ARROW_ID}-${tone}`}
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={TONE_VAR[tone]} />
        </marker>
      ))}
    </defs>
  );
}

/* ── FlowBox ─────────────────────────────────────────────── */

interface FlowBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  on: boolean;
  title: string;
  note?: string;
  /** 目前這一步的焦點：外面多一圈 */
  ring?: boolean;
  titleSize?: number;
  noteSize?: number;
}

/**
 * 一個角色方塊。`on` 是「這一格現在有沒有被點名」：
 * 沒點名的時候框線走 line、文字走 muted，點名之後才吃 tone。
 * 所有狀態都靠 opacity / fill 切換，方塊本身全程留在 DOM 裡。
 */
function FlowBox({
  x,
  y,
  w,
  h,
  tone,
  on,
  title,
  note,
  ring = false,
  titleSize = 26,
  noteSize = 19,
}: FlowBoxProps): ReactElement {
  const color = TONE_VAR[tone];
  const cx = x + w / 2;

  return (
    <g>
      <rect
        x={x - RING_PAD}
        y={y - RING_PAD}
        width={w + RING_PAD * 2}
        height={h + RING_PAD * 2}
        rx={22}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        opacity={ring ? 0.75 : 0}
        className={SVG_TR}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={color}
        fillOpacity={on ? 0.18 : 0}
        stroke={on ? color : 'var(--color-line)'}
        strokeWidth={2}
        className={SVG_TR}
      />
      <text
        x={cx}
        y={note === undefined ? y + h / 2 + titleSize / 3 : y + h / 2 - 8}
        textAnchor="middle"
        fill={on ? 'var(--color-paper)' : 'var(--color-muted)'}
        fontSize={titleSize}
        fontWeight={600}
        className={SVG_TR}
      >
        {title}
      </text>
      {note !== undefined && (
        <text
          x={cx}
          y={y + h / 2 + 26}
          textAnchor="middle"
          fill={on ? color : 'var(--color-faint)'}
          fontSize={noteSize}
          className={SVG_TR}
        >
          {note}
        </text>
      )}
    </g>
  );
}

/* ── FlowArrow ───────────────────────────────────────────── */

/**
 * 一段箭頭。`d` 由呼叫端寫死，只切 tone 與 opacity。
 *
 * 用 pathLength=1 + dasharray "1 1" + dashoffset 做生長；
 * `d` 本身不能 transition，所以線要「長出來」只能走 dashoffset。
 * 整個 <g> 一起吃 opacity —— 不然 markerEnd 會在線還沒長到之前就先亮在終點。
 */
function FlowArrow({
  d,
  tone,
  shown,
}: {
  d: string;
  tone: Tone;
  shown: boolean;
}): ReactElement {
  return (
    <g opacity={shown ? 1 : 0} className={SVG_TR}>
      <path
        d={d}
        fill="none"
        stroke={TONE_VAR[tone]}
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

/* ══════════════════════════════════════════════════════════════
 * RoleIcon — 角色與檔案圖示
 *
 * 素材庫的 frontend-web / api-server / database 是 512×512 的插畫，
 * 筆觸與尺寸跟流程圖對不上，而且是為深底畫的，所以這裡全部手繪。
 *
 * 顏色吃 tone，形狀完全不動 —— 同一顆圖示在亮起前後看起來是同一個東西。
 * `image` / `imageBroken` / `folder` 是第 18、25 頁補的三顆。
 * ══════════════════════════════════════════════════════════════ */

export type RoleIconId =
  | 'browser'
  | 'server'
  | 'database'
  | 'sheet'
  | 'code'
  | 'suitcase'
  | 'backpack'
  | 'pouch'
  | 'image'
  | 'imageBroken'
  | 'folder';

const ROLE_ICON_LABEL: Record<RoleIconId, string> = {
  browser: '瀏覽器',
  server: '伺服器',
  database: '資料庫',
  sheet: '試算表',
  code: '程式碼',
  suitcase: '行李箱',
  backpack: '後背包',
  pouch: '收納袋',
  image: '圖片檔',
  imageBroken: '載入失敗的圖片',
  folder: '資料夾',
};

function roleGlyph(id: RoleIconId, color: string, wash: number): ReactElement {
  const outline = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: ICON_TR,
  };
  const band = {
    fill: color,
    fillOpacity: wash,
    stroke: 'none',
    className: ICON_TR,
  };
  const dot = { fill: color, stroke: 'none', className: ICON_TR };

  switch (id) {
    case 'browser':
      return (
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
    case 'server':
      return (
        <g>
          <rect x={6} y={8} width={32} height={13} rx={3} {...band} />
          <rect x={6} y={8} width={32} height={13} rx={3} {...outline} />
          <rect x={6} y={25} width={32} height={13} rx={3} {...band} />
          <rect x={6} y={25} width={32} height={13} rx={3} {...outline} />
          <circle cx={12} cy={14.5} r={1.8} {...dot} />
          <circle cx={12} cy={31.5} r={1.8} {...dot} />
          <path d="M19 14.5 H32" {...outline} />
          <path d="M19 31.5 H32" {...outline} />
        </g>
      );
    case 'database':
      return (
        <g>
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12 Z" {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...outline} />
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12" {...outline} />
          <path d="M8 22 C8 25 14 27 22 27 C30 27 36 25 36 22" {...outline} />
        </g>
      );
    case 'sheet':
      return (
        <g>
          <rect x={7} y={6} width={30} height={32} rx={3} {...band} />
          <rect x={7} y={6} width={30} height={32} rx={3} {...outline} />
          <path d="M7 16 H37" {...outline} />
          <path d="M7 27 H37" {...outline} />
          <path d="M18 16 V38" {...outline} />
          <path d="M28 16 V38" {...outline} />
        </g>
      );
    case 'code':
      return (
        <g>
          <rect x={5} y={8} width={34} height={28} rx={4} {...band} />
          <rect x={5} y={8} width={34} height={28} rx={4} {...outline} />
          <path d="M16 17 L11 22 L16 27" {...outline} />
          <path d="M28 17 L33 22 L28 27" {...outline} />
          <path d="M24 15 L20 29" {...outline} />
        </g>
      );
    case 'suitcase':
      return (
        <g>
          <path d="M18 10 V8 C18 6.6 19 6 20.2 6 H23.8 C25 6 26 6.6 26 8 V10" {...outline} />
          <rect x={8} y={10} width={28} height={25} rx={3} {...band} />
          <rect x={8} y={10} width={28} height={25} rx={3} {...outline} />
          <path d="M8 20 H36" {...outline} />
          <path d="M22 10 V35" {...outline} />
          <path d="M13 35 V38" {...outline} />
          <path d="M31 35 V38" {...outline} />
        </g>
      );
    case 'backpack':
      return (
        <g>
          <path d="M12 18 C12 13 16 10 22 10 C28 10 32 13 32 18 V34 C32 35.5 31 36 30 36 H14 C13 36 12 35.5 12 34 Z" {...band} />
          <path d="M12 18 C12 13 16 10 22 10 C28 10 32 13 32 18 V34 C32 35.5 31 36 30 36 H14 C13 36 12 35.5 12 34 Z" {...outline} />
          <path d="M12 23 H32" {...outline} />
          <rect x={17} y={26} width={10} height={7} rx={2} {...outline} />
          <path d="M18 11 V8 C18 6.6 19.6 6 22 6 C24.4 6 26 6.6 26 8 V11" {...outline} />
        </g>
      );
    case 'pouch':
      return (
        <g>
          <rect x={9} y={11} width={21} height={10} rx={3} {...band} />
          <rect x={9} y={11} width={21} height={10} rx={3} {...outline} />
          <rect x={14} y={22} width={21} height={10} rx={3} {...band} />
          <rect x={14} y={22} width={21} height={10} rx={3} {...outline} />
          <rect x={10} y={33} width={17} height={7} rx={3} {...outline} />
          <path d="M9 16 H30" {...outline} />
          <path d="M14 27 H35" {...outline} />
        </g>
      );
    case 'image':
      return (
        <g>
          <rect x={6} y={9} width={32} height={26} rx={3} {...band} />
          <rect x={6} y={9} width={32} height={26} rx={3} {...outline} />
          <circle cx={15} cy={17} r={3} {...outline} />
          <path d="M6 31 L16 22 L23 28 L28 24 L38 32" {...outline} />
        </g>
      );
    case 'imageBroken':
      /* 同一張圖片框，從中間撕成兩半 —— 瀏覽器的破圖圖示也是這個意思 */
      return (
        <g>
          <path d="M9 9 H21 L18 17 L23 23 L19 35 H9 C7.3 35 6 33.7 6 32 V12 C6 10.3 7.3 9 9 9 Z" {...band} />
          <path d="M9 9 H21 L18 17 L23 23 L19 35 H9 C7.3 35 6 33.7 6 32 V12 C6 10.3 7.3 9 9 9 Z" {...outline} />
          <path d="M26 9 H35 C36.7 9 38 10.3 38 12 V32 C38 33.7 36.7 35 35 35 H24 L28 23 L23 17 Z" {...outline} />
          <circle cx={12.5} cy={16} r={2.2} {...outline} />
        </g>
      );
    case 'folder':
      return (
        <g>
          <path d="M5 13 C5 11.3 6.3 10 8 10 H17 L20 13 H36 C37.7 13 39 14.3 39 16 V33 C39 34.7 37.7 36 36 36 H8 C6.3 36 5 34.7 5 33 Z" {...band} />
          <path d="M5 13 C5 11.3 6.3 10 8 10 H17 L20 13 H36 C37.7 13 39 14.3 39 16 V33 C39 34.7 37.7 36 36 36 H8 C6.3 36 5 34.7 5 33 Z" {...outline} />
          <path d="M5 18 H39" {...outline} />
        </g>
      );
  }
}

/**
 * 角色圖示，透明底、線條 + 少量填色，size 預設 44。
 * 填色在紙底要比深底高一階才看得見：一般 0.22、`muted` 0.16。
 */
export function RoleIcon({
  id,
  size = 44,
  tone = 'client',
  muted = false,
}: {
  id: RoleIconId;
  size?: number;
  tone?: Tone;
  muted?: boolean;
}): ReactElement {
  const color = muted ? 'var(--color-faint)' : TONE_VAR[tone];
  const wash = muted ? 0.16 : 0.22;

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" role="img">
      <title>{ROLE_ICON_LABEL[id]}</title>
      {roleGlyph(id, color, wash)}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ArchMap — 運作概念圖（第 15、16、25 頁）
 *
 * viewBox 820 × 600，用 `h-full w-full` + preserveAspectRatio 置中，
 * 所以放在多寬的欄位裡都不會變形。
 *
 * 座標表（三頁完全一致，改動請一起改）：
 *
 *   使用者      ( 40,  50) 270 × 56
 *   前端        ( 40, 160) 270 × 160     cx 175
 *   後端        (500, 130) 270 × 150     cx 635
 *   資料庫      (500, 360) 270 × 150     cx 635
 *   伺服器框    (480,  74) 310 × 482
 *   網路去程    y 195   x 318 → 492
 *   網路回程    y 255   x 492 → 318
 *
 * 兩條網路 lane 都落在「後端」的 y 範圍（130–280）與「前端」的 y 範圍
 * （160–320）之內，所以箭頭兩端都真的接在方塊上，不會懸空。
 *
 * 原本的圖還有「一台伺服器／拆成三台」與部署模式兩種變化，
 * 這份簡報用不到，已經拿掉。
 * ══════════════════════════════════════════════════════════════ */

/** 可以被點名的節點。`host` 指的是伺服器外框本身 */
export type ArchNode = 'user' | 'client' | 'backend' | 'db' | 'host';

/** 可以出現的箭頭。名稱就是方向 */
export type ArchArrow =
  | 'userToClient'
  | 'clientToBackend'
  | 'backendToDb'
  | 'dbToBackend'
  | 'backendToClient';

interface ArchMapProps {
  /** 哪些節點亮起 */
  lit: ArchNode[];
  /** 目前的焦點，外面多一圈 */
  ring?: ArchNode;
  /** 畫哪幾支箭頭 */
  arrows?: ArchArrow[];
  /**
   * 伺服器框左上角的標籤。預設「伺服器」；
   * 第 25 頁改成「ChatGPT Sites」—— 框本身維持中性色，契約不變。
   */
  serverLabel?: string;
}

const NODE = {
  user: { x: 40, y: 50, w: 270, h: 56 },
  client: { x: 40, y: 160, w: 270, h: 160 },
  backend: { x: 500, y: 130, w: 270, h: 150 },
  db: { x: 500, y: 360, w: 270, h: 150 },
} as const;

const SERVER_FRAME = { x: 480, y: 74, w: 310, h: 482 } as const;

/** 網路那兩條 lane 的 y。去程在上、回程在下，不重疊 */
const LANE_OUT = 195;
const LANE_BACK = 255;

const ARROW_D: Record<ArchArrow, string> = {
  userToClient: 'M 175 112 L 175 152',
  clientToBackend: `M 318 ${LANE_OUT} L 492 ${LANE_OUT}`,
  backendToDb: 'M 655 288 L 655 352',
  dbToBackend: 'M 615 352 L 615 288',
  backendToClient: `M 492 ${LANE_BACK} L 318 ${LANE_BACK}`,
};

const ARROW_TONE: Record<ArchArrow, Tone> = {
  userToClient: 'user',
  clientToBackend: 'client',
  backendToDb: 'backend',
  dbToBackend: 'db',
  backendToClient: 'backend',
};

/**
 * 伺服器外框。沒有強調色是刻意的，見檔頭。
 *
 * 因為不能靠顏色表示「被點名了」，改用**線型**：還沒點名是虛線
 * （等於「這裡有一個範圍」），點名之後變實線、變粗、標籤轉深。
 * 焦點（ring）再加粗一階。
 */
function HostFrame({
  label,
  on,
  ring = false,
}: {
  label: string;
  on: boolean;
  ring?: boolean;
}): ReactElement {
  const { x, y, w, h } = SERVER_FRAME;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={24}
        fill="var(--color-panel)"
        fillOpacity={on ? 1 : 0.6}
        stroke={on ? 'var(--color-muted)' : 'var(--color-line)'}
        strokeWidth={ring ? 4 : on ? 3 : 2}
        strokeDasharray={on ? undefined : '12 8'}
        className={SVG_TR}
      />
      <text
        x={x + 22}
        y={y + 32}
        fill={on ? 'var(--color-paper)' : 'var(--color-muted)'}
        fontSize={21}
        fontWeight={600}
        className={SVG_TR}
      >
        {label}
      </text>
    </g>
  );
}

/** 運作概念圖。第 15、16、25 頁共用，座標永遠不動 */
export function ArchMap({
  lit,
  ring,
  arrows = [],
  serverLabel = '伺服器',
}: ArchMapProps): ReactElement {
  const on = (node: ArchNode) => lit.includes(node);
  const hasArrow = (arrow: ArchArrow) => arrows.includes(arrow);

  return (
    <svg
      viewBox="0 0 820 600"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`網站運作概念圖：使用者、前端，以及${serverLabel}上的後端與資料庫`}
    >
      <WebArrowDefs />

      {/* 伺服器框畫在最底層，卡片疊在它上面 —— 「程式放進伺服器裡」的層次 */}
      <HostFrame label={serverLabel} on={on('host')} ring={ring === 'host'} />

      {/*
        網路 —— 只是路徑，所以走 line / faint、沒有方塊。
        兩條虛線軌道**永遠都在**（就算這一拍沒有任何箭頭），台下才看得出
        「前端跟伺服器之間本來就有一條路」；彩色的箭頭是長在軌道上面的。
      */}
      <g>
        <path
          d={`M 316 ${LANE_OUT} L 494 ${LANE_OUT}`}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={3}
          strokeDasharray="9 9"
          strokeLinecap="round"
        />
        <path
          d={`M 316 ${LANE_BACK} L 494 ${LANE_BACK}`}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={3}
          strokeDasharray="9 9"
          strokeLinecap="round"
        />
        <text
          x={405}
          y={233}
          textAnchor="middle"
          fill="var(--color-faint)"
          fontSize={20}
        >
          網路
        </text>
      </g>

      {/* 節點 */}
      <FlowBox
        {...NODE.user}
        tone="user"
        on={on('user')}
        ring={ring === 'user'}
        title="使用者"
        titleSize={22}
      />
      <FlowBox
        {...NODE.client}
        tone="client"
        on={on('client')}
        ring={ring === 'client'}
        title="前端"
        note="你看到的畫面"
      />
      <FlowBox
        {...NODE.backend}
        tone="backend"
        on={on('backend')}
        ring={ring === 'backend'}
        title="後端"
        note="處理邏輯的程式"
      />
      <FlowBox
        {...NODE.db}
        tone="db"
        on={on('db')}
        ring={ring === 'db'}
        title="資料庫"
        note="長期保存資料"
      />

      {/* 箭頭畫在最上層 */}
      {(Object.keys(ARROW_D) as ArchArrow[]).map((arrow) => (
        <FlowArrow
          key={arrow}
          d={ARROW_D[arrow]}
          tone={ARROW_TONE[arrow]}
          shown={hasArrow(arrow)}
        />
      ))}
    </svg>
  );
}
