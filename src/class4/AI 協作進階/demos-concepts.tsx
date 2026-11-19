import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第二章 SubAgent、Skill 與 MCP
 *
 *   第 12 頁  CompareDemo   SubAgent 跟 Skill、MCP 不同之處
 *   第 13 頁  MixDemo       SubAgent、Skill、MCP 可以混合使用
 *
 * 內容來源：Notion「AI 協作進階－SubAgents 與外部服務整合」的 callout。
 *
 * 第 12 頁 callout：「注意，這彼此是可以混合使用的。左邊是選項，右邊是概念圖
 * （簡單譬喻）」，附一張表：
 *   Skill     保存可重用的知識、步驟、判斷規則與操作流程      工作 SOP／操作手冊
 *   MCP       連接瀏覽器、外部服務、資料庫或其他工具與資料    外部設備與資料來源
 *   SubAgent  使用獨立 Context 與工具執行一項工作，再把結果回傳  獨立工作的工讀生
 *
 * 第 13 頁 callout：「SubAgent 跟 Skill、MCP 是可以混合使用的。依據下圖，
 * 重新繪製概念圖，並與簡報風格一致」。參考圖是 Notion 上的插畫（主 Session
 * 機器人 → SubAgent 坐在桌前；上方 Skill 手冊、右邊 MCP 插頭接三個外部資源、
 * 下方把結果報告送回主 Session），這裡用專案色票手繪重畫，沒有放原圖。
 * 參考圖上的「主 Session」照講師指示改成「主 Agent」，跟前面幾頁的叫法一致。
 *
 * 為了讓畫面成立而補的示意（callout 裡沒有）：
 *   - 第 12 頁每一項右欄上方的一句情境說明。
 *   - Skill 圖：手冊頁上的「讀懂需求／照規則判斷／照流程產出」、
 *     「今天／明天／下週的工作」與「寫一次，重複使用」。
 *   - MCP 圖：四個外部資源（瀏覽器、外部服務、資料庫、其他工具與資料）是照
 *     表格「解決的問題」那一欄拆出來的；「轉接頭」是比喻用語。
 *   - SubAgent 圖：「草稿、查到的資料都留在這張桌上」，對應第 14 頁
 *     「把探索、測試輸出、Log 放到 SubAgent 那邊」的說法。
 *   - 第 13 頁：「任務」「結果報告」卡片上的字、三個外部資源的名稱
 *     （瀏覽器、資料庫、雲端服務 —— 參考圖只有圖示），以及四步的一句話說明。
 *
 * 用色（每頁最多兩支強調色）：
 *   第 12 頁  acid＝左欄目前選取、圖裡的主 Agent；teal＝被比喻的那個東西
 *            （手冊、MCP 與外部設備、工讀生）。
 *   第 13 頁  acid＝目前這一步的元素與箭頭；teal＝SubAgent（固定）。
 *            其他一律中性（paper／muted／line）。
 * 淡底（/14）一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算：Panel（p-10）內可用約 1744 × 768，根容器一律
 * h-[720px] max-w-[1740px]，沒有任何容器會捲動。各頁的細算寫在各自的區塊註解。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_FAINT =
  'font-display text-[17px] tracking-[0.16em] text-faint uppercase';

const BADGE_BASE =
  'flex shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';
const STEP_BADGE = `size-10 ${BADGE_BASE}`;

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:text-faint disabled:hover:border-line`;

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

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一列（照 demos-subagent.tsx 的 MenuItem） */
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
      className={`flex min-h-[112px] items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
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
          className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}
        >
          {name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，線條粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({
  prefix,
  tones,
}: {
  prefix: string;
  tones: Record<string, string>;
}) {
  return (
    <defs>
      {Object.entries(tones).map(([name, color]) => (
        <marker
          key={name}
          id={`${prefix}-${name}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={16}
          markerHeight={16}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心（照 demos-subagent.tsx） */
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

/** 打開的書：底下一片封面，上面兩頁微微彎曲。內容用 children 自己畫 */
function OpenBook({
  x,
  y,
  w,
  h,
  color,
  width = 2.5,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  width?: number;
  children?: ReactNode;
}) {
  const mid = x + w / 2;
  const sag = h * 0.06;
  const page = (edge: number, ctrl: number) =>
    `M ${mid} ${y + sag} Q ${ctrl} ${y - sag} ${edge} ${y + sag * 0.5} L ${edge} ${y + h} Q ${ctrl} ${y + h - sag * 1.5} ${mid} ${y + h + sag * 0.5} Z`;
  return (
    <g className={SVG_TR}>
      <rect
        x={x - 10}
        y={y + 12}
        width={w + 20}
        height={h}
        rx={8}
        fill={C.inkSoft}
        stroke={color}
        strokeWidth={width}
        className={SVG_TR}
      />
      <path d={page(x, x + w * 0.25)} fill={C.panel} stroke={color} strokeWidth={width} className={SVG_TR} />
      <path d={page(x + w, x + w * 0.75)} fill={C.panel} stroke={color} strokeWidth={width} className={SVG_TR} />
      {children}
    </g>
  );
}

/** 打勾的方框。(x, y) 是左上角 */
function CheckBox({
  x,
  y,
  s,
  color,
}: {
  x: number;
  y: number;
  s: number;
  color: string;
}) {
  return (
    <g stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x={x} y={y} width={s} height={s} rx={s * 0.18} fill={C.panel} className={SVG_TR} />
      <path
        d={`M ${x + s * 0.22} ${y + s * 0.52} L ${x + s * 0.43} ${y + s * 0.74} L ${x + s * 0.8} ${y + s * 0.28}`}
        fill="none"
        className={SVG_TR}
      />
    </g>
  );
}

/** 圓圈打勾（任務卡、結果報告用） */
function CheckCircle({
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
  return (
    <g stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={cx} cy={cy} r={r} className={SVG_TR} />
      <path
        d={`M ${cx - r * 0.45} ${cy + r * 0.02} L ${cx - r * 0.1} ${cy + r * 0.36} L ${cx + r * 0.48} ${cy - r * 0.34}`}
        className={SVG_TR}
      />
    </g>
  );
}

/** 齒輪（手冊左頁的裝飾） */
function Gear({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <g stroke={color} fill="none">
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4;
        return (
          <line
            key={index}
            x1={cx + Math.cos(angle) * r}
            y1={cy + Math.sin(angle) * r}
            x2={cx + Math.cos(angle) * r * 1.38}
            y2={cy + Math.sin(angle) * r * 1.38}
            strokeWidth={r * 0.34}
            className={SVG_TR}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill={C.panel} strokeWidth={2.5} className={SVG_TR} />
      <circle cx={cx} cy={cy} r={r * 0.4} strokeWidth={2.5} className={SVG_TR} />
    </g>
  );
}

/* ── 外部資源的圖示（約 70 × 56，(cx, cy) 是中心）── */

type DeviceKind = 'browser' | 'database' | 'cloud' | 'toolbox';

function DeviceIcon({
  kind,
  cx,
  cy,
  color,
}: {
  kind: DeviceKind;
  cx: number;
  cy: number;
  color: string;
}) {
  const common = {
    stroke: color,
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: SVG_TR,
  };

  if (kind === 'browser') {
    return (
      <g>
        <rect x={cx - 34} y={cy - 26} width={68} height={52} rx={6} fill={C.panel} {...common} />
        <line x1={cx - 34} y1={cy - 12} x2={cx + 34} y2={cy - 12} {...common} />
        {[-26, -19, -12].map((dx) => (
          <circle key={dx} cx={cx + dx} cy={cy - 19} r={2.5} fill={color} className={SVG_TR} />
        ))}
        <rect x={cx - 26} y={cy - 4} width={18} height={22} rx={2} fill="none" {...common} />
        <line x1={cx - 1} y1={cy} x2={cx + 26} y2={cy} {...common} />
        <line x1={cx - 1} y1={cy + 9} x2={cx + 26} y2={cy + 9} {...common} />
        <line x1={cx - 1} y1={cy + 18} x2={cx + 18} y2={cy + 18} {...common} />
      </g>
    );
  }

  if (kind === 'database') {
    return (
      <g>
        <path
          d={`M ${cx - 26} ${cy - 18} L ${cx - 26} ${cy + 18} A 26 9 0 0 0 ${cx + 26} ${cy + 18} L ${cx + 26} ${cy - 18}`}
          fill={C.panel}
          {...common}
        />
        <ellipse cx={cx} cy={cy - 18} rx={26} ry={9} fill={C.panel} {...common} />
        <path d={`M ${cx - 26} ${cy} A 26 9 0 0 0 ${cx + 26} ${cy}`} fill="none" {...common} />
      </g>
    );
  }

  if (kind === 'cloud') {
    return (
      <path
        d={`M ${cx - 32} ${cy + 16} A 13 13 0 0 1 ${cx - 22} ${cy - 6} A 20 20 0 0 1 ${cx + 14} ${cy - 10} A 14 14 0 0 1 ${cx + 32} ${cy + 16} Z`}
        fill={C.panel}
        {...common}
      />
    );
  }

  return (
    <g>
      <path
        d={`M ${cx - 12} ${cy - 12} V ${cy - 22} H ${cx + 12} V ${cy - 12}`}
        fill="none"
        {...common}
      />
      <rect x={cx - 32} y={cy - 12} width={64} height={38} rx={6} fill={C.panel} {...common} />
      <line x1={cx - 32} y1={cy + 4} x2={cx + 32} y2={cy + 4} {...common} />
      <rect x={cx - 6} y={cy - 1} width={12} height={10} rx={2} fill={C.panel} {...common} />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 12 頁 · CompareDemo — SubAgent 跟 Skill、MCP 不同之處
 *
 * 左：三個選項（名稱 ＋ callout 表格的「解決的問題」），底部提示
 * 「這三者彼此可以混合使用」帶出下一頁。
 * 右：該選項的「簡單比喻」——比喻名稱放大到 52px，下面一句情境，
 * 再下面是手繪概念圖（viewBox 1100 × 500，放進約 1100 寬的卡片接近 1:1）：
 *   Skill     一本打開的 SOP 手冊，主 Agent 照著步驟做；同一類工作都翻同一本
 *   MCP       主 Agent 透過插頭、MCP 轉接頭接上四種外部設備與資料來源
 *   SubAgent  工讀生拿到任務 → 在自己的桌子（獨立 Context）做 → 只把結果交回
 *
 * 高度預算（左右各自 720）：
 *   左：標籤 26 ＋ gap 16 ＋ 選單 3 × 約 127 ＋ gap 2 × 12 ＋ 提示框約 113 ≈ 560
 *   右：py-7 56 ＋ 比喻標題列 65 ＋ gap 12 ＋ 情境 33 ＋ gap 12 ＋ 圖 500 ＋ 框線 2 ≈ 680
 * ══════════════════════════════════════════════════════════════ */

type KindId = 'skill' | 'mcp' | 'subagent';

const KINDS: readonly {
  id: KindId;
  name: string;
  sub: string;
  metaphor: string;
  scene: string;
}[] = [
  {
    id: 'skill',
    name: 'Skill',
    sub: '保存可重用的知識、步驟、判斷規則與操作流程',
    metaphor: '工作 SOP／操作手冊',
    scene: '把做法整理成一本手冊；同一類工作，主 Agent 都照著它一步一步做。',
  },
  {
    id: 'mcp',
    name: 'MCP',
    sub: '連接瀏覽器、外部服務、資料庫或其他工具與資料',
    metaphor: '外部設備與資料來源',
    scene: '需要瀏覽器、資料庫或外部服務時，透過 MCP 這個轉接頭接上去。',
  },
  {
    id: 'subagent',
    name: 'SubAgent',
    sub: '使用獨立 Context 與工具執行一項工作，再把結果回傳',
    metaphor: '獨立工作的工讀生',
    scene: '交代一件工作給他，他在自己的桌子上做完，只把結果交回來。',
  },
];

/* ── Skill：一本 SOP 手冊 ── */

const SKILL_STEPS = ['讀懂需求', '照規則判斷', '照流程產出'] as const;
const SKILL_JOBS = ['今天的工作', '明天的工作', '下週的工作'] as const;

function SkillFigure() {
  return (
    <svg viewBox="0 0 1100 500" className="h-[500px] w-full" role="img">
      <title>Skill 像一本工作 SOP：主 Agent 照著手冊的步驟做事，同一類工作都翻同一本</title>
      <ArrowMarkers prefix="cmp-skill" tones={{ teal: C.teal }} />

      {/* 主 Agent */}
      <Person cx={120} cy={190} r={40} color={C.acid} />
      <text x={120} y={370} textAnchor="middle" fill={C.acid} fontSize={26} fontWeight={600}>
        主 Agent
      </text>
      <text x={120} y={402} textAnchor="middle" fill={C.muted} fontSize={19}>
        照著手冊做事
      </text>

      {/* 手冊 → 主 Agent */}
      <line
        x1={322}
        y1={272}
        x2={206}
        y2={272}
        stroke={C.teal}
        strokeWidth={3}
        markerEnd="url(#cmp-skill-teal)"
      />
      <text x={264} y={254} textAnchor="middle" fill={C.teal} fontSize={20} fontWeight={600}>
        照著步驟做
      </text>

      {/* 手冊 */}
      <OpenBook x={340} y={40} w={500} h={290} color={C.teal} width={3}>
        <text x={465} y={142} textAnchor="middle" fill={C.teal} fontSize={56} fontWeight={700}>
          SOP
        </text>
        <text x={465} y={184} textAnchor="middle" fill={C.paper} fontSize={22}>
          工作手冊
        </text>
        {[226, 256, 286].map((y, index) => (
          <line
            key={y}
            x1={385}
            y1={y}
            x2={index === 2 ? 500 : 545}
            y2={y}
            stroke={C.line}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
        {SKILL_STEPS.map((label, index) => {
          const rowY = 108 + index * 72;
          return (
            <g key={label}>
              <CheckBox x={624} y={rowY - 18} s={34} color={C.teal} />
              <text x={674} y={rowY + 8} fill={C.paper} fontSize={22}>
                {label}
              </text>
            </g>
          );
        })}
      </OpenBook>

      {/* 同一類工作都翻同一本 */}
      {SKILL_JOBS.map((job, index) => {
        const x = 380 + index * 155;
        return (
          <g key={job}>
            <line
              x1={x + 70}
              y1={350}
              x2={x + 70}
              y2={402}
              stroke={C.teal}
              strokeWidth={2.5}
              strokeDasharray="6 6"
            />
            <rect
              x={x}
              y={402}
              width={140}
              height={50}
              rx={12}
              fill={C.inkSoft}
              stroke={C.muted}
              strokeWidth={2}
            />
            <text x={x + 70} y={434} textAnchor="middle" fill={C.paper} fontSize={19}>
              {job}
            </text>
          </g>
        );
      })}
      <text x={870} y={434} fill={C.teal} fontSize={22} fontWeight={600}>
        寫一次，重複使用
      </text>
    </svg>
  );
}

/* ── MCP：插頭 → 轉接頭 → 外部設備與資料來源 ── */

const MCP_DEVICES: readonly { kind: DeviceKind; name: string }[] = [
  { kind: 'browser', name: '瀏覽器' },
  { kind: 'cloud', name: '外部服務' },
  { kind: 'database', name: '資料庫' },
  { kind: 'toolbox', name: '其他工具與資料' },
];

function McpFigure() {
  const busTop = 100;
  const gap = 104;
  const busBottom = busTop + gap * (MCP_DEVICES.length - 1);
  const hubY = (busTop + busBottom) / 2;

  return (
    <svg viewBox="0 0 1100 500" className="h-[500px] w-full" role="img">
      <title>MCP：主 Agent 透過插頭與轉接頭，接上瀏覽器、外部服務、資料庫等外部設備與資料來源</title>

      {/* 主 Agent */}
      <Person cx={110} cy={hubY - 76} r={40} color={C.acid} />
      <text x={110} y={hubY + 98} textAnchor="middle" fill={C.acid} fontSize={26} fontWeight={600}>
        主 Agent
      </text>
      <text x={110} y={hubY + 130} textAnchor="middle" fill={C.muted} fontSize={19}>
        需要時接上去
      </text>

      {/* 電線 → 插頭 */}
      <path
        d={`M 178 ${hubY + 26} C 232 ${hubY + 26} 236 ${hubY} 286 ${hubY}`}
        fill="none"
        stroke={C.muted}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <rect
        x={286}
        y={hubY - 22}
        width={60}
        height={44}
        rx={12}
        fill={C.inkSoft}
        stroke={C.teal}
        strokeWidth={3}
      />
      <line x1={346} y1={hubY - 10} x2={370} y2={hubY - 10} stroke={C.teal} strokeWidth={6} strokeLinecap="round" />
      <line x1={346} y1={hubY + 10} x2={370} y2={hubY + 10} stroke={C.teal} strokeWidth={6} strokeLinecap="round" />

      {/* MCP 轉接頭 */}
      <rect
        x={376}
        y={hubY - 54}
        width={196}
        height={108}
        rx={18}
        fill={C.inkSoft}
        stroke={C.teal}
        strokeWidth={3}
      />
      <text x={474} y={hubY + 6} textAnchor="middle" fill={C.teal} fontSize={40} fontWeight={700}>
        MCP
      </text>
      <text x={474} y={hubY + 36} textAnchor="middle" fill={C.muted} fontSize={19}>
        轉接頭
      </text>

      {/* 分接到外部 */}
      <line x1={572} y1={hubY} x2={650} y2={hubY} stroke={C.teal} strokeWidth={3} />
      <line x1={650} y1={busTop} x2={650} y2={busBottom} stroke={C.teal} strokeWidth={3} />
      <circle cx={650} cy={hubY} r={7} fill={C.teal} />

      <text x={860} y={34} textAnchor="middle" fill={C.teal} fontSize={20} fontWeight={600} letterSpacing={2}>
        外部設備與資料來源
      </text>

      {MCP_DEVICES.map((device, index) => {
        const cy = busTop + index * gap;
        return (
          <g key={device.name}>
            <line x1={650} y1={cy} x2={700} y2={cy} stroke={C.teal} strokeWidth={3} />
            <circle cx={692} cy={cy} r={6} fill={C.teal} />
            <rect
              x={700}
              y={cy - 42}
              width={320}
              height={84}
              rx={16}
              fill={C.inkSoft}
              stroke={C.teal}
              strokeWidth={2.5}
            />
            <DeviceIcon kind={device.kind} cx={760} cy={cy} color={C.teal} />
            <text x={816} y={cy + 9} fill={C.paper} fontSize={24} fontWeight={600}>
              {device.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── SubAgent：獨立工作的工讀生 ── */

function SubAgentFigure() {
  return (
    <svg viewBox="0 0 1100 500" className="h-[500px] w-full" role="img">
      <title>SubAgent 像獨立工作的工讀生：拿到任務，在自己的桌子（獨立 Context）上做完，只把結果交回</title>
      <ArrowMarkers prefix="cmp-sub" tones={{ acid: C.acid, teal: C.teal }} />

      {/* 主 Agent 交辦 */}
      <Person cx={110} cy={150} r={40} color={C.acid} />
      <text x={110} y={330} textAnchor="middle" fill={C.acid} fontSize={26} fontWeight={600}>
        主 Agent
      </text>
      <text x={110} y={362} textAnchor="middle" fill={C.muted} fontSize={19}>
        交辦，再收結果
      </text>

      <rect
        x={222}
        y={128}
        width={150}
        height={64}
        rx={12}
        fill={C.inkSoft}
        stroke={C.acid}
        strokeWidth={2.5}
      />
      <text x={297} y={169} textAnchor="middle" fill={C.paper} fontSize={24} fontWeight={600}>
        任務
      </text>

      <line
        x1={382}
        y1={160}
        x2={530}
        y2={160}
        stroke={C.acid}
        strokeWidth={3}
        markerEnd="url(#cmp-sub-acid)"
      />
      <text x={456} y={140} textAnchor="middle" fill={C.paper} fontSize={22} fontWeight={600}>
        ① 拿到任務
      </text>

      {/* 自己的桌子：獨立 Context */}
      <rect
        x={548}
        y={16}
        width={536}
        height={404}
        rx={24}
        fill="none"
        stroke={C.teal}
        strokeWidth={2.5}
        strokeDasharray="10 8"
      />
      <text x={574} y={54} fill={C.teal} fontSize={20} fontWeight={600}>
        自己的桌子 · 獨立 Context
      </text>

      <Person cx={700} cy={166} r={38} color={C.teal} />

      {/* 書桌 */}
      <rect x={590} y={280} width={460} height={16} rx={4} fill={C.inkSoft} stroke={C.teal} strokeWidth={2.5} />
      <line x1={612} y1={296} x2={612} y2={372} stroke={C.teal} strokeWidth={2.5} />
      <line x1={1028} y1={296} x2={1028} y2={372} stroke={C.teal} strokeWidth={2.5} />

      {/* 桌上的草稿 */}
      {[-10, 0, 9].map((deg, index) => {
        const sx = 774 + index * 34;
        const sy = 228;
        return (
          <g key={deg} transform={`rotate(${deg} ${sx + 32} ${sy + 22})`}>
            <rect x={sx} y={sy} width={64} height={44} rx={4} fill={C.panel} stroke={C.muted} strokeWidth={2} />
            <line x1={sx + 10} y1={sy + 15} x2={sx + 50} y2={sy + 15} stroke={C.line} strokeWidth={3} strokeLinecap="round" />
            <line x1={sx + 10} y1={sy + 28} x2={sx + 40} y2={sy + 28} stroke={C.line} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}

      {/* 桌上的筆電 */}
      <rect x={936} y={210} width={92} height={64} rx={6} fill={C.panel} stroke={C.teal} strokeWidth={2.5} />
      <circle cx={982} cy={242} r={7} fill="none" stroke={C.teal} strokeWidth={2.5} />
      <rect x={922} y={272} width={120} height={8} rx={3} fill={C.inkSoft} stroke={C.teal} strokeWidth={2.5} />

      <text x={820} y={334} textAnchor="middle" fill={C.paper} fontSize={22} fontWeight={600}>
        ② 在自己的桌上做
      </text>
      <text x={820} y={368} textAnchor="middle" fill={C.muted} fontSize={19}>
        草稿、查到的資料都留在這張桌上
      </text>

      {/* 只把結果交回 */}
      <path
        d="M 820 420 L 820 462 L 110 462 L 110 392"
        fill="none"
        stroke={C.teal}
        strokeWidth={3}
        markerEnd="url(#cmp-sub-teal)"
      />
      <rect
        x={280}
        y={436}
        width={190}
        height={52}
        rx={12}
        fill={C.inkSoft}
        stroke={C.teal}
        strokeWidth={2.5}
      />
      <CheckCircle cx={312} cy={462} r={14} color={C.teal} />
      <text x={338} y={470} fill={C.teal} fontSize={22} fontWeight={600}>
        結果
      </text>
      <text x={640} y={448} textAnchor="middle" fill={C.paper} fontSize={22} fontWeight={600}>
        ③ 把結果交回
      </text>
    </svg>
  );
}

export function CompareDemo() {
  const [kind, setKind] = useState<KindId>('skill');
  const current = KINDS.find((item) => item.id === kind) ?? KINDS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：三個選項 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>各自解決的問題</span>
        <div className="flex flex-col gap-3">
          {KINDS.map((item, index) => (
            <MenuItem
              key={item.id}
              index={index}
              name={item.name}
              sub={item.sub}
              on={item.id === kind}
              onClick={() => setKind(item.id)}
            />
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel px-6 py-5">
          <p className="text-[24px] leading-normal text-paper">
            注意：這三者彼此可以
            <span className="font-semibold text-teal">混合使用</span>。
          </p>
          <p className="mt-1.5 text-[19px] leading-snug text-muted">
            例如 SubAgent 照著 Skill 做事、透過 MCP 取用外部服務 —— 下一頁來看。
          </p>
        </div>
      </div>

      {/* ── 右：簡單比喻 ─────────────────────────────────── */}
      <div
        key={kind}
        className="slide-enter flex min-h-0 flex-col gap-3 rounded-2xl border border-line bg-panel px-8 py-7"
      >
        <div className="flex items-center gap-5">
          <span className="rounded-xl border-2 border-teal px-4 py-1 font-mono text-[28px] leading-snug font-semibold text-teal">
            {current.name}
          </span>
          <span className="text-[26px] text-muted">就像</span>
          <span className="text-[52px] leading-tight font-semibold text-paper">
            {current.metaphor}
          </span>
        </div>
        <p className="text-[22px] leading-normal text-paper">{current.scene}</p>
        <div className="mt-auto">
          {kind === 'skill' && <SkillFigure />}
          {kind === 'mcp' && <McpFigure />}
          {kind === 'subagent' && <SubAgentFigure />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 13 頁 · MixDemo — SubAgent、Skill、MCP 可以混合使用
 *
 * 照 Notion 參考圖重畫，版面一樣左 → 中 → 右：
 *   左   主 Agent（大機器人）拿著任務卡
 *   中   上方 Skill 手冊 ↓ SubAgent 坐在桌前，桌上有筆電
 *   右   筆電接出電線 → 插頭 → MCP → 匯流線分接瀏覽器、資料庫、雲端服務
 *   下   結果報告沿著底部的線送回主 Agent
 *
 * 逐步播放四步：① 交辦任務 ② 讀 Skill 的 SOP ③ 透過 MCP 取用外部服務
 * ④ 回報結果。下方四張步驟卡可以直接點，右邊是播放／重播、上一步／下一步。
 * 每一步 2.2 秒，約 9 秒播完。
 *
 * 用色：acid＝目前這一步的元素與箭頭（走過的箭頭退成 muted 實線，
 * 還沒走到的是 line 虛線）；teal＝SubAgent，固定不變。
 *
 * 座標（viewBox 1740 × 556，以 1740 寬呈現時 1:1）：
 *   主 Agent   機器人 cx 190、頭頂 y 180；任務卡 (334, 290) 150 × 80
 *   Skill        標籤 (750, 6)；手冊 (670, 62) 280 × 124
 *   SubAgent     標籤 (720, 232)；機器人 cx 810、頭頂 y 314、縮 0.6；書桌 y 446
 *   MCP          插頭 (1100, 272)；MCP 標籤 (1166, 260)；匯流線 x 1400
 *   外部資源     (1450, cy − 60) 270 × 120，cy ＝ 120／290／460
 *   回報         底線 y 530；結果報告 (400, 506) 220 × 48
 *
 * 高度預算：SVG 556 ＋ gap 24 ＋ 下方步驟列 140 ＝ 720。
 * ══════════════════════════════════════════════════════════════ */

const MIX_STEPS: readonly { title: string; text: string }[] = [
  { title: '交辦任務', text: '主 Agent 把一件工作交給 SubAgent' },
  { title: '讀 Skill 的 SOP', text: 'SubAgent 先讀 Skill，照著 SOP 的步驟做' },
  { title: '透過 MCP 取用外部服務', text: '透過 MCP 接上瀏覽器、資料庫、雲端服務' },
  { title: '回報結果', text: '做完之後，把結果報告交回主 Agent' },
];

const MIX_LAST = MIX_STEPS.length;
const MIX_TICK_MS = 2200;
const MIX_ARROW = 'mix-arrow';

const MIX_DEVICES: readonly { kind: DeviceKind; name: string; cy: number }[] = [
  { kind: 'browser', name: '瀏覽器', cy: 120 },
  { kind: 'database', name: '資料庫', cy: 290 },
  { kind: 'cloud', name: '雲端服務', cy: 460 },
];

type ArrowState = 'on' | 'past' | 'future';

function arrowState(step: number, owner: number): ArrowState {
  if (step === owner) return 'on';
  return step > owner ? 'past' : 'future';
}

/** 依步驟狀態給箭頭的樣式：目前 acid 粗線、走過 muted 實線、還沒到 line 虛線 */
function arrowStyle(state: ArrowState) {
  if (state === 'on') {
    return { stroke: C.acid, strokeWidth: 4, markerEnd: `url(#${MIX_ARROW}-acid)` };
  }
  if (state === 'past') {
    return { stroke: C.muted, strokeWidth: 2.5, markerEnd: `url(#${MIX_ARROW}-muted)` };
  }
  return {
    stroke: C.line,
    strokeWidth: 2.5,
    strokeDasharray: '8 8',
    markerEnd: `url(#${MIX_ARROW}-line)`,
  };
}

/** 機器人：(cx, top) 是頭頂中心，s 是縮放。reach 時右手往前伸（拿任務卡） */
function Robot({
  cx,
  top,
  s,
  color,
  reach = false,
  legs = true,
}: {
  cx: number;
  top: number;
  s: number;
  color: string;
  reach?: boolean;
  legs?: boolean;
}) {
  const sw = 3 / s;
  return (
    <g
      transform={`translate(${cx} ${top}) scale(${s})`}
      stroke={color}
      strokeWidth={sw}
      fill={C.panel}
      className={SVG_TR}
    >
      {/* 天線 */}
      <line x1={0} y1={-24} x2={0} y2={0} />
      <circle cx={0} cy={-32} r={9} fill={color} stroke="none" className={SVG_TR} />
      {/* 耳朵 ＋ 頭 */}
      <rect x={-84} y={34} width={18} height={40} rx={9} />
      <rect x={66} y={34} width={18} height={40} rx={9} />
      <rect x={-70} y={0} width={140} height={108} rx={44} />
      {/* 面罩與表情 */}
      <rect x={-52} y={20} width={104} height={66} rx={28} fill={C.paper} stroke="none" />
      <circle cx={-20} cy={50} r={9} fill={C.panel} stroke="none" />
      <circle cx={20} cy={50} r={9} fill={C.panel} stroke="none" />
      <path d="M -12 66 Q 0 76 12 66" fill="none" stroke={C.panel} />
      {/* 腿、手臂（畫在身體前面，讓身體蓋住接縫） */}
      {legs && (
        <>
          <rect x={-44} y={234} width={34} height={70} rx={14} />
          <rect x={10} y={234} width={34} height={70} rx={14} />
        </>
      )}
      <rect x={-86} y={128} width={26} height={92} rx={13} />
      {reach ? (
        <rect x={50} y={136} width={100} height={28} rx={14} />
      ) : (
        <rect x={60} y={128} width={26} height={92} rx={13} />
      )}
      {/* 身體 */}
      <rect x={-56} y={116} width={112} height={124} rx={30} />
      <circle cx={0} cy={164} r={10} fill={color} stroke="none" className={SVG_TR} />
    </g>
  );
}

/** 標籤框（主 Agent、Skill、SubAgent、MCP） */
function MixPill({
  x,
  y,
  w,
  h,
  label,
  active,
  teal = false,
  fontSize = 26,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  active: boolean;
  teal?: boolean;
  fontSize?: number;
}) {
  const stroke = teal ? C.teal : active ? C.acid : C.muted;
  const textFill = teal ? C.teal : active ? C.acid : C.paper;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={active ? C.acid : C.inkSoft}
        fillOpacity={active ? 0.14 : 1}
        stroke={stroke}
        strokeWidth={active || teal ? 3.5 : 2}
        className={SVG_TR}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + fontSize * 0.36}
        textAnchor="middle"
        fill={textFill}
        fontSize={fontSize}
        fontWeight={700}
        className={SVG_TR}
      >
        {label}
      </text>
    </g>
  );
}

/** 步驟編號（SVG 內） */
function MixBadge({ x, y, n, on }: { x: number; y: number; n: number; on: boolean }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={18}
        fill={on ? C.acid : C.panel}
        stroke={on ? C.acid : C.muted}
        strokeWidth={2}
        className={SVG_TR}
      />
      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fill={on ? C.onAccent : C.muted}
        className={SVG_TR}
      >
        {n}
      </text>
    </g>
  );
}

function MixDiagram({ step }: { step: number }) {
  const on = (n: number) => step === n;
  const tone = (active: boolean) => (active ? C.acid : C.muted);

  const mainOn = on(1) || on(4);
  const skillOn = on(2);
  const mcpOn = on(3);
  const mcpStroke = tone(mcpOn);
  const mcpWidth = mcpOn ? 4 : 2.5;

  const book = { x: 670, y: 62, w: 280, h: 124 };
  const bookMid = book.x + book.w / 2;

  return (
    <svg viewBox="0 0 1740 556" className="h-[556px] w-full shrink-0" role="img">
      <title>主 Agent 把任務交給 SubAgent；SubAgent 照 Skill 的 SOP 做事、透過 MCP 取用瀏覽器、資料庫與雲端服務，最後把結果報告回報給主 Agent</title>
      <ArrowMarkers prefix={MIX_ARROW} tones={{ acid: C.acid, muted: C.muted, line: C.line }} />

      {/* ── 箭頭與連線（先畫，壓在節點下面） ── */}

      {/* ① 交辦任務 */}
      <line x1={494} y1={330} x2={746} y2={330} fill="none" {...arrowStyle(arrowState(step, 1))} className={SVG_TR} />
      {/* ② 讀 Skill */}
      <line
        x1={bookMid}
        y1={book.y + book.h + 14}
        x2={bookMid}
        y2={228}
        fill="none"
        {...arrowStyle(arrowState(step, 2))}
        className={SVG_TR}
      />
      {/* ④ 回報結果 */}
      <path
        d="M 870 466 L 870 530 L 190 530 L 190 500"
        fill="none"
        {...arrowStyle(arrowState(step, 4))}
        className={SVG_TR}
      />

      {/* ③ MCP：筆電 → 插頭 → MCP → 匯流線 → 外部資源（實體線，不畫虛線） */}
      <g stroke={mcpStroke} strokeWidth={mcpWidth} fill="none" strokeLinecap="round" className={SVG_TR}>
        <path d="M 1022 400 C 1066 400 1056 290 1100 290" />
        <line x1={1332} y1={290} x2={1400} y2={290} />
        <line x1={1400} y1={MIX_DEVICES[0].cy} x2={1400} y2={MIX_DEVICES[MIX_DEVICES.length - 1].cy} />
        {MIX_DEVICES.map((device) => (
          <line key={device.name} x1={1400} y1={device.cy} x2={1450} y2={device.cy} />
        ))}
      </g>
      {MIX_DEVICES.map((device) => (
        <circle key={device.name} cx={1400} cy={device.cy} r={6} fill={mcpStroke} className={SVG_TR} />
      ))}

      {/* ── 左：主 Agent ── */}
      <MixPill x={70} y={70} w={240} h={56} label="主 Agent" active={mainOn} fontSize={28} />
      <Robot cx={190} top={180} s={1} color={tone(mainOn)} reach />
      <g>
        <rect
          x={334}
          y={290}
          width={150}
          height={80}
          rx={12}
          fill={on(1) ? C.acid : C.inkSoft}
          fillOpacity={on(1) ? 0.14 : 1}
          stroke={tone(on(1))}
          strokeWidth={on(1) ? 3.5 : 2.5}
          className={SVG_TR}
        />
        <CheckCircle cx={368} cy={330} r={18} color={tone(on(1))} />
        <text x={400} y={339} fill={C.paper} fontSize={24} fontWeight={600}>
          任務
        </text>
      </g>

      {/* ── 中：Skill 手冊 ── */}
      <MixPill x={750} y={6} w={120} h={46} label="Skill" active={skillOn} />
      <OpenBook
        x={book.x}
        y={book.y}
        w={book.w}
        h={book.h}
        color={tone(skillOn)}
        width={skillOn ? 3.5 : 2.5}
      >
        <Gear cx={book.x + 70} cy={book.y + 46} r={18} color={tone(skillOn)} />
        {[book.y + 90, book.y + 108].map((y) => (
          <line
            key={y}
            x1={book.x + 26}
            y1={y}
            x2={book.x + 116}
            y2={y}
            stroke={C.line}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        {[0, 1, 2].map((row) => {
          const y = book.y + 22 + row * 32;
          return (
            <g key={row}>
              <CheckBox x={bookMid + 18} y={y} s={22} color={tone(skillOn)} />
              <line
                x1={bookMid + 52}
                y1={y + 11}
                x2={book.x + book.w - 22}
                y2={y + 11}
                stroke={C.line}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </OpenBook>

      {/* ── 中：SubAgent 坐在桌前（固定 teal） ── */}
      <MixPill x={720} y={232} w={180} h={46} label="SubAgent" active={false} teal />
      <Robot cx={810} top={314} s={0.6} color={C.teal} legs={false} />

      {/* 筆電（MCP 的起點） */}
      <rect
        x={930}
        y={372}
        width={92}
        height={68}
        rx={6}
        fill={mcpOn ? C.acid : C.panel}
        fillOpacity={mcpOn ? 0.14 : 1}
        stroke={mcpStroke}
        strokeWidth={mcpOn ? 3.5 : 2.5}
        className={SVG_TR}
      />
      <circle cx={976} cy={406} r={7} fill="none" stroke={mcpStroke} strokeWidth={2.5} className={SVG_TR} />
      <rect x={914} y={438} width={124} height={8} rx={3} fill={C.inkSoft} stroke={mcpStroke} strokeWidth={2.5} className={SVG_TR} />

      {/* 書桌 */}
      <rect x={690} y={446} width={360} height={14} rx={4} fill={C.inkSoft} stroke={C.muted} strokeWidth={2.5} />
      <line x1={708} y1={460} x2={708} y2={516} stroke={C.muted} strokeWidth={2.5} />
      <line x1={1032} y1={460} x2={1032} y2={516} stroke={C.muted} strokeWidth={2.5} />

      {/* ── 右：插頭 → MCP → 插座 ── */}
      <rect
        x={1100}
        y={272}
        width={46}
        height={36}
        rx={10}
        fill={C.inkSoft}
        stroke={mcpStroke}
        strokeWidth={mcpWidth}
        className={SVG_TR}
      />
      <line x1={1146} y1={282} x2={1162} y2={282} stroke={mcpStroke} strokeWidth={5} strokeLinecap="round" className={SVG_TR} />
      <line x1={1146} y1={298} x2={1162} y2={298} stroke={mcpStroke} strokeWidth={5} strokeLinecap="round" className={SVG_TR} />
      <MixPill x={1166} y={260} w={122} h={60} label="MCP" active={mcpOn} fontSize={28} />
      <rect
        x={1292}
        y={272}
        width={40}
        height={36}
        rx={10}
        fill={C.inkSoft}
        stroke={mcpStroke}
        strokeWidth={mcpWidth}
        className={SVG_TR}
      />

      {/* ── 右：外部資源 ── */}
      {MIX_DEVICES.map((device) => (
        <g key={device.name}>
          <rect
            x={1450}
            y={device.cy - 60}
            width={270}
            height={120}
            rx={18}
            fill={mcpOn ? C.acid : C.inkSoft}
            fillOpacity={mcpOn ? 0.14 : 1}
            stroke={mcpStroke}
            strokeWidth={mcpOn ? 3.5 : 2.5}
            className={SVG_TR}
          />
          <DeviceIcon kind={device.kind} cx={1510} cy={device.cy} color={mcpStroke} />
          <text x={1566} y={device.cy + 9} fill={C.paper} fontSize={24} fontWeight={600}>
            {device.name}
          </text>
        </g>
      ))}

      {/* ── 下：結果報告 ── */}
      <g>
        <rect
          x={400}
          y={506}
          width={220}
          height={48}
          rx={10}
          fill={on(4) ? C.acid : C.inkSoft}
          fillOpacity={on(4) ? 0.14 : 1}
          stroke={tone(on(4))}
          strokeWidth={on(4) ? 3.5 : 2.5}
          className={SVG_TR}
        />
        <CheckCircle cx={426} cy={530} r={14} color={tone(on(4))} />
        {[10, 16, 22].map((barH, index) => (
          <rect
            key={barH}
            x={450 + index * 12}
            y={542 - barH}
            width={8}
            height={barH}
            fill={tone(on(4))}
            className={SVG_TR}
          />
        ))}
        <text x={494} y={537} fill={C.paper} fontSize={19} fontWeight={600}>
          結果報告
        </text>
      </g>

      {/* ── 步驟編號 ── */}
      <MixBadge x={620} y={330} n={1} on={on(1)} />
      <MixBadge x={bookMid + 40} y={210} n={2} on={on(2)} />
      <MixBadge x={1227} y={232} n={3} on={on(3)} />
      <MixBadge x={720} y={530} n={4} on={on(4)} />
    </svg>
  );
}

export function MixDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step === MIX_LAST;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setStep((value) => Math.min(value + 1, MIX_LAST)),
      MIX_TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, step]);

  const togglePlay = () => {
    if (running) {
      setPlaying(false);
      return;
    }
    if (atEnd || step === 0) setStep(1);
    setPlaying(true);
  };

  const goTo = (value: number) => {
    setPlaying(false);
    setStep(Math.max(1, Math.min(value, MIX_LAST)));
  };

  const status =
    step === 0
      ? '尚未開始，按「播放」'
      : running
        ? `播放中 · 第 ${step} / ${MIX_LAST} 步`
        : atEnd
          ? '四步都走完了'
          : `第 ${step} / ${MIX_LAST} 步`;

  const playLabel = running ? '暫停' : atEnd ? '重播' : step === 0 ? '播放' : '繼續播放';

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-6">
      <MixDiagram step={step} />

      {/* ── 下：四步 ＋ 控制 ───────────────────────────────── */}
      <div className="grid h-[140px] shrink-0 grid-cols-[repeat(4,minmax(0,1fr))_320px] gap-3">
        {MIX_STEPS.map((item, index) => {
          const n = index + 1;
          const isOn = step === n;
          const done = step > n;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => goTo(n)}
              aria-current={isOn}
              className={`flex min-w-0 flex-col justify-center gap-1.5 rounded-2xl border border-l-[6px] px-5 py-3 text-left transition-colors duration-300 ${
                isOn
                  ? 'border-acid/55 border-l-acid bg-acid/14'
                  : done
                    ? 'border-line border-l-muted bg-panel'
                    : 'border-line border-l-line bg-panel hover:border-l-acid'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`size-9 ${BADGE_BASE} ${
                    isOn
                      ? 'border-acid bg-acid text-on-accent'
                      : done
                        ? 'border-muted text-muted'
                        : 'border-line text-faint'
                  }`}
                >
                  {n}
                </span>
                <span className="text-[22px] leading-snug font-semibold text-paper">
                  {item.title}
                </span>
              </span>
              <span
                className={`text-[19px] leading-snug ${isOn ? 'text-paper' : 'text-muted'}`}
              >
                {item.text}
              </span>
            </button>
          );
        })}

        <div className="flex flex-col justify-between pl-2">
          <p className="text-[18px] leading-none text-muted">{status}</p>
          <button type="button" onClick={togglePlay} className={`${BTN_PRIMARY} w-full`}>
            {playLabel}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={step <= 1}
              onClick={() => goTo(step - 1)}
              className={BTN_GHOST}
            >
              上一步
            </button>
            <button
              type="button"
              disabled={atEnd}
              onClick={() => goTo(step + 1)}
              className={BTN_GHOST}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
