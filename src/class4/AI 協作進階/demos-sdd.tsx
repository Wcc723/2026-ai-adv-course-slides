import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：具體怎麼做
 *
 *   第 32 頁  SddLoopDemo   具體怎麼做：重新定義 SDD
 *
 * 原始內容來源：講師直接貼上的 callout（2026-10-06，Notion 連線故障）。
 * callout 原文重點：
 *   「具體來說怎麼做？ 1. 重新定義 SDD 的方法」
 *   我們從單純從 session 對話框，改成由整個 harness 與周邊環境驅動專案開發。
 *   1. 在開發過程中，可以把需要開發的內容直接寫在 Notion 或者是 issue 上面。
 *      相較於過去的 SDD（講師原文寫「系統設計文件」，2026-10-06 確認是 Spec-Driven Development）來講，它能容納的量更大，
 *      甚至可以使用 AI 來產出大量的 issue。（或是 GitHub Projects）
 *   2. 所以在這個閉環過程中，如果開發這一輪結束了，
 *      AI 可以直接去文件了解下一輪的開發需求。
 *
 * 講師附的參考圖是第 31 頁 LoopEngineerDiagram 那張 Harness 圖，用紅框加了兩個註記：
 *   上緣左邊兩格 → 「文檔」：Notion、GitHub issue
 *   上緣右邊兩格 → 「開發用 MCP 工具」：瀏覽器、測試等…
 * 這裡以那張圖為底重畫（座標與零件複製過來改，不 import 那個檔案）：
 *   觸發膠囊、Harness 外框、四格 Loop、邊界虛線圓、「停下來」都維持，
 *   上緣改成兩組有標題的工具群，並補上「閉環」：
 *     文檔 ─讀取需求→ 寫程式 → 跑測試 → 通過了嗎？ ─通過→ 回到文檔、issue 打勾
 *
 * 版面：左欄是「以前／現在」對照 ＋ 講師的兩點（可點）＋ 播放器；右欄是概念圖。
 *   點卡 1 → 圖上的「文檔」群組用 acid 亮起
 *   點卡 2 → 「閉環」的兩條箭頭（讀取需求、回到文檔）用 acid 亮起
 *     （規格只指定回到文檔那一條；讀取需求那條一起亮，閉環才看得出是一整圈）
 *   播放：讀 #12 → 寫程式 → 跑測試 → 通過 → #12 打勾 → 讀 #13 → … 做完 #14 停。
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫、可以換掉）：
 *   - issue 編號與名稱：#12 登入頁、#13 忘記密碼、#14 會員中心
 *   - 「＋ 還有 24 個 issue」：表示文檔能容納的量很大，數字是示意
 *   - 播放器每一步的文字（「讀取需求：#12 登入頁」…）、issue 上的「讀取中／開發中／完成」
 *   - 跑測試那一步，「開發用 MCP 工具」的兩格跟著亮起（示意 Loop 會用到這些工具）
 *   - 每個 issue 都一輪就通過；失敗→修正的回圈在第 29 頁已經演過，這頁不重演
 *   - 做完三個 issue 就停（講師指定「跑兩三個 issue 之後停」）
 *
 * 用色（兩支）：
 *   acid  目前這一步、選中的部分（卡片、文檔群組、閉環箭頭）
 *   teal  通過、已完成打勾的 issue
 *   其他一律中性（paper／muted／faint／line）。「現在」標籤用 bg-paper 實心，不佔強調色。
 * 淡底（/14）一律配實色邊框或 6px 左粗條，不單獨承擔語意。
 *
 * 座標（viewBox 1180 × 720，1:1 呈現）：
 *   觸發膠囊      x 4  w 186，y 320／400／480（h 60），箭頭 194 → 230
 *   Harness 外框  (236, 120) 720 × 592
 *   文檔群組      (262, 30) 314 × 236，跨在外框上緣；issue 卡 y 104／144／184
 *   MCP 工具群組  (640, 50) 280 × 126，跨在外框上緣
 *   回圈中心      (700, 450) r 135；邊界虛線圓 r 216；節點 144 × 54
 *   讀取需求箭頭  文檔右緣 (580, 236) → 寫程式上緣 (650, 280)
 *   閉環箭頭      通過了嗎？左緣 (622, 596) → 左轉沿 x 300 往上 → 文檔下緣 (300, 272)
 *   邊界標籤      (771, 614) 170 × 44；停下來 (980, 560) 200 × 140
 *
 * 高度預算（Panel 內可用約 1744 × 768，根容器 h-[720px] max-w-[1740px]）：
 *   右欄 SVG 720。
 *   左欄 w 520：以前／現在 144 ＋ 16 ＋ 卡片 180 ＋ 12 ＋ 147 ＋ 16
 *              ＋ 進度框 93 ＋ 12 ＋ 按鈕 48 ≈ 668（卡 1 標題若換行 +36 → 704）。
 *   寬度：520 ＋ gap 40 ＋ SVG 1180 ＝ 1740。沒有任何容器會捲動。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_FAINT =
  'font-display text-[17px] tracking-[0.16em] text-faint uppercase';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} min-w-[132px] border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:bg-ink-soft disabled:text-faint disabled:hover:border-line`;

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

type Tone = 'acid' | 'teal';

const TONE_VAR: Record<Tone, string> = {
  acid: C.acid,
  teal: C.teal,
};

/** 左側可點的選項卡（同 demos-ultracode-loop.tsx 的 OptionCard）：選到的那張 acid 淡底 ＋ 6px 左粗條 */
function OptionCard({
  no,
  title,
  text,
  active,
  onClick,
}: {
  no: string;
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-start gap-5 rounded-2xl border border-l-[6px] px-6 py-5 text-left transition-colors duration-300 ${
        active
          ? 'border-acid/55 border-l-acid bg-acid/14'
          : 'border-line border-l-line bg-panel hover:border-l-acid'
      }`}
    >
      <span
        className={`pt-1 font-display text-[26px] leading-none font-semibold tabular-nums ${
          active ? 'text-acid' : 'text-faint'
        }`}
      >
        {no}
      </span>
      <span className="min-w-0">
        <span className="block text-[26px] leading-snug font-medium text-paper">
          {title}
        </span>
        <span className="mt-1.5 block text-[20px] leading-relaxed text-muted">
          {text}
        </span>
      </span>
    </button>
  );
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix }: { prefix: string }) {
  const tones: Record<string, string> = {
    muted: C.muted,
    acid: C.acid,
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

/* ══════════════════════════════════════════════════════════════
 * 第 32 頁 · SddLoopDemo — 具體怎麼做：重新定義 SDD
 * ══════════════════════════════════════════════════════════════ */

type FocusId = 'docs' | 'closure';

const POINTS: readonly { id: FocusId; no: string; title: string; text: string }[] = [
  {
    id: 'docs',
    no: '01',
    title: '需求直接寫在 Notion 或 issue 上',
    text: '相較於過去 SDD（Spec-Driven Development）的規格文件，能容納的量更大，甚至可以用 AI 產出大量的 issue（或是 GitHub Projects）。',
  },
  {
    id: 'closure',
    no: '02',
    title: '閉環：一輪結束就讀下一輪',
    text: '這一輪開發結束了，AI 可以直接去文件了解下一輪的開發需求。',
  },
];

const ISSUES: readonly { no: string; title: string }[] = [
  { no: '#12', title: '登入頁' },
  { no: '#13', title: '忘記密碼' },
  { no: '#14', title: '會員中心' },
];

/** 文檔裡還沒列出來的 issue 數（示意） */
const MORE_ISSUES = 24;

type Phase = 'idle' | 'read' | 'code' | 'test' | 'pass' | 'done';

interface SddStep {
  phase: Phase;
  /** 正在處理第幾個 issue（ISSUES 的 index），-1 表示還沒開始 */
  issue: number;
  log: string;
}

const SDD_SCRIPT: readonly SddStep[] = [
  { phase: 'idle', issue: -1, log: '需求都寫在文檔裡，等待觸發' },
  ...ISSUES.flatMap((item, index): SddStep[] => {
    const name = `${item.no} ${item.title}`;
    const last = index === ISSUES.length - 1;
    return [
      { phase: 'read', issue: index, log: `讀取需求：${name}` },
      { phase: 'code', issue: index, log: `寫程式：${name}` },
      { phase: 'test', issue: index, log: '跑測試：用瀏覽器、測試工具驗證' },
      { phase: 'pass', issue: index, log: '通過了嗎？ → 通過' },
      {
        phase: 'done',
        issue: index,
        log: last
          ? `${item.no} 打勾 → 繼續讀下一個 issue…`
          : `${item.no} 打勾 → 回文檔讀下一個 issue`,
      },
    ];
  }),
];

const SDD_LAST = SDD_SCRIPT.length - 1;

type RowState = 'pending' | 'active' | 'done';

function rowState(step: SddStep, index: number): RowState {
  if (index < step.issue) return 'done';
  if (index > step.issue) return 'pending';
  return step.phase === 'done' ? 'done' : 'active';
}

/* ── 概念圖的座標 ───────────────────────────────────────── */

const SD_CX = 700;
const SD_CY = 450;
const SD_R = 135;
const SD_FENCE_R = 216;
const SD_NODE_W = 144;
const SD_NODE_H = 54;

type LoopKey = 'code' | 'test' | 'check' | 'fix';

const SD_LOOP_NODES: readonly { key: LoopKey; x: number; y: number; text: string }[] = [
  { key: 'code', x: SD_CX, y: SD_CY - SD_R, text: '寫程式' },
  { key: 'test', x: SD_CX + SD_R, y: SD_CY, text: '跑測試' },
  { key: 'check', x: SD_CX, y: SD_CY + SD_R, text: '通過了嗎？' },
  { key: 'fix', x: SD_CX - SD_R, y: SD_CY, text: '修正' },
];

/** 回圈上四個順時針箭頭，放在 45° 的位置 */
const SD_D = SD_R * Math.SQRT1_2;
const SD_LOOP_HEADS: readonly { x: number; y: number; rotate: number }[] = [
  { x: SD_CX + SD_D, y: SD_CY - SD_D, rotate: 45 },
  { x: SD_CX + SD_D, y: SD_CY + SD_D, rotate: 135 },
  { x: SD_CX - SD_D, y: SD_CY + SD_D, rotate: 225 },
  { x: SD_CX - SD_D, y: SD_CY - SD_D, rotate: 315 },
];

const SD_TRIGGERS: readonly { y: number; text: string }[] = [
  { y: 320, text: '你的 prompt' },
  { y: 400, text: '排程時間' },
  { y: 480, text: '事件發生' },
];

const SD_TOOLS: readonly { x: number; w: number; text: string }[] = [
  { x: 660, w: 110, text: '瀏覽器' },
  { x: 782, w: 120, text: '測試等…' },
];

const SD_ROW_X = 278;
const SD_ROW_W = 282;
const SD_ROW_H = 34;
const SD_ROW_Y = 104;
const SD_ROW_STEP = 40;

const SD_READ_PATH = 'M 580 236 C 630 236 650 250 650 280';
const SD_RETURN_PATH = 'M 622 596 L 314 596 Q 300 596 300 582 L 300 272';

function SddDiagram({ focus, step }: { focus: FocusId; step: SddStep }) {
  const docsOn = focus === 'docs';
  const closureOn = focus === 'closure';
  const { phase } = step;

  /* 讀取需求：播放到 read 時亮 acid；選卡 2 時也亮 acid */
  const readLit = phase === 'read' || closureOn;
  /* 回到文檔：這一輪完成時亮 teal（優先），選卡 2 時亮 acid */
  const returnTone: Tone | null =
    phase === 'done' ? 'teal' : closureOn ? 'acid' : null;
  const passLit = phase === 'pass' || phase === 'done';
  const toolsLit = phase === 'test';

  const nodeTone = (key: LoopKey): Tone | null => {
    if (key === 'code' && phase === 'code') return 'acid';
    if (key === 'test' && phase === 'test') return 'acid';
    if (key === 'check' && passLit) return 'teal';
    return null;
  };

  const current = step.issue >= 0 ? ISSUES[step.issue] : null;
  const currentTone: Tone = passLit ? 'teal' : 'acid';

  return (
    <svg width={1180} height={720} viewBox="0 0 1180 720" role="img" className="shrink-0">
      <title>
        重新定義 SDD：需求寫在 Notion／GitHub issue，Loop 讀取需求開發，這一輪通過後回到文檔把 issue 打勾，再讀下一個
      </title>
      <ArrowMarkers prefix="sdd-arrow" />

      {/* ── 觸發 ── */}
      <text x={97} y={300} textAnchor="middle" fontSize={18} fontWeight={600} fill={C.muted}>
        觸發
      </text>
      {SD_TRIGGERS.map((item) => (
        <g key={item.text}>
          <rect
            x={4}
            y={item.y}
            width={186}
            height={60}
            rx={30}
            fill={C.inkSoft}
            stroke={C.line}
            strokeWidth={2}
          />
          <text x={97} y={item.y + 37} textAnchor="middle" fontSize={20} fill={C.muted}>
            {item.text}
          </text>
          <path
            d={`M 194 ${item.y + 30} L 230 ${item.y + 30}`}
            stroke={C.muted}
            strokeWidth={2}
            markerEnd="url(#sdd-arrow-muted)"
          />
        </g>
      ))}

      {/* ── Harness 外框 ── */}
      <rect x={236} y={120} width={720} height={592} rx={28} fill="none" stroke={C.muted} strokeWidth={2} />
      <text x={262} y={694} fontSize={22} fontWeight={700} fill={C.paper}>
        Harness
      </text>
      <text x={366} y={694} fontSize={17} fill={C.muted}>
        AI 可以用的權限與工具
      </text>

      {/* ── 邊界 ── */}
      <circle
        cx={SD_CX}
        cy={SD_CY}
        r={SD_FENCE_R}
        fill="none"
        stroke={C.muted}
        strokeWidth={2}
        strokeDasharray="10 9"
      />
      <path
        d="M 945 636 L 974 636"
        stroke={C.muted}
        strokeWidth={2}
        markerEnd="url(#sdd-arrow-muted)"
      />
      <rect x={771} y={614} width={170} height={44} rx={22} fill={C.panel} />
      <rect x={771} y={614} width={170} height={44} rx={22} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
      <text x={856} y={643} textAnchor="middle" fontSize={18} fontWeight={600} fill={C.muted}>
        邊界：最多 5 輪
      </text>
      <rect x={980} y={560} width={200} height={140} rx={16} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
      <text x={998} y={598} fontSize={22} fontWeight={700} fill={C.paper}>
        停下來
      </text>
      <g fontSize={17} fill={C.muted}>
        <text x={998} y={630}>超過輪數、時間</text>
        <text x={998} y={654}>或預算上限，</text>
        <text x={998} y={678}>就停下、通知你</text>
      </g>

      {/* ── 閉環：回到文檔（畫在 Loop 底下，被節點蓋住的那一小段不影響） ── */}
      <path
        d={SD_RETURN_PATH}
        fill="none"
        stroke={returnTone ? TONE_VAR[returnTone] : C.muted}
        strokeWidth={returnTone ? 4 : 2}
        markerEnd={`url(#sdd-arrow-${returnTone ?? 'muted'})`}
        className={SVG_TR}
      />
      <text
        x={584}
        y={584}
        textAnchor="middle"
        fontSize={18}
        fontWeight={passLit ? 700 : 600}
        fill={passLit ? C.teal : C.muted}
        className={SVG_TR}
      >
        {passLit ? '✓ 通過' : '通過'}
      </text>
      <g
        fontSize={18}
        fontWeight={returnTone ? 600 : 400}
        fill={returnTone ? TONE_VAR[returnTone] : C.muted}
        className={SVG_TR}
      >
        <text x={316} y={424}>這一輪完成</text>
        <text x={316} y={450}>→ 讀下一個 issue</text>
      </g>

      {/* ── 讀取需求：文檔 → 寫程式 ── */}
      <path
        d={SD_READ_PATH}
        fill="none"
        stroke={readLit ? C.acid : C.muted}
        strokeWidth={readLit ? 4 : 2}
        markerEnd={`url(#sdd-arrow-${readLit ? 'acid' : 'muted'})`}
        className={SVG_TR}
      />
      <text
        x={588}
        y={222}
        fontSize={18}
        fontWeight={600}
        fill={readLit ? C.acid : C.muted}
        className={SVG_TR}
      >
        讀取需求
      </text>

      {/* ── Loop ── */}
      <circle cx={SD_CX} cy={SD_CY} r={SD_R} fill="none" stroke={C.muted} strokeWidth={2} />
      {SD_LOOP_HEADS.map((head) => (
        <path
          key={head.rotate}
          d="M -10 -9 L 10 0 L -10 9 Z"
          transform={`translate(${head.x} ${head.y}) rotate(${head.rotate})`}
          fill={C.muted}
        />
      ))}
      {current && (
        <text
          x={SD_CX}
          y={SD_CY - 36}
          textAnchor="middle"
          fontSize={20}
          fontWeight={600}
          fill={TONE_VAR[currentTone]}
          className={SVG_TR}
        >
          {current.no} {current.title}
        </text>
      )}
      <text x={SD_CX} y={SD_CY + 2} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.paper}>
        Loop
      </text>
      <text x={SD_CX} y={SD_CY + 30} textAnchor="middle" fontSize={17} fill={C.muted}>
        失敗就自己修
      </text>
      {SD_LOOP_NODES.map((node) => {
        const tone = nodeTone(node.key);
        const x = node.x - SD_NODE_W / 2;
        const y = node.y - SD_NODE_H / 2;
        return (
          <g key={node.key}>
            <rect x={x} y={y} width={SD_NODE_W} height={SD_NODE_H} rx={14} fill={C.panel} />
            <rect
              x={x}
              y={y}
              width={SD_NODE_W}
              height={SD_NODE_H}
              rx={14}
              fill={tone ? TONE_VAR[tone] : C.inkSoft}
              fillOpacity={tone ? 0.14 : 1}
              stroke={tone ? TONE_VAR[tone] : C.line}
              strokeWidth={tone ? 3.5 : 2}
              className={SVG_TR}
            />
            <text
              x={node.x}
              y={node.y + 7}
              textAnchor="middle"
              fontSize={20}
              fontWeight={600}
              fill={tone ? C.paper : C.muted}
              className={SVG_TR}
            >
              {node.text}
            </text>
          </g>
        );
      })}

      {/* ── 開發用 MCP 工具（跨在外框上緣） ── */}
      <rect x={640} y={50} width={280} height={126} rx={18} fill={C.inkSoft} stroke={C.line} strokeWidth={2} />
      <text x={660} y={84} fontSize={20} fontWeight={700} fill={C.paper}>
        開發用 MCP 工具
      </text>
      {SD_TOOLS.map((tool) => (
        <g key={tool.text}>
          <rect x={tool.x} y={102} width={tool.w} height={50} rx={12} fill={C.panel} />
          <rect
            x={tool.x}
            y={102}
            width={tool.w}
            height={50}
            rx={12}
            fill={toolsLit ? C.acid : C.panel}
            fillOpacity={toolsLit ? 0.14 : 1}
            stroke={toolsLit ? C.acid : C.line}
            strokeWidth={toolsLit ? 2.5 : 1.5}
            className={SVG_TR}
          />
          <text
            x={tool.x + tool.w / 2}
            y={134}
            textAnchor="middle"
            fontSize={19}
            fontWeight={toolsLit ? 600 : 400}
            fill={toolsLit ? C.paper : C.muted}
            className={SVG_TR}
          >
            {tool.text}
          </text>
        </g>
      ))}

      {/* ── 文檔（跨在外框上緣）：先墊一塊不透明的 panel，蓋掉外框的線 ── */}
      <rect x={262} y={30} width={314} height={236} rx={18} fill={C.panel} />
      <rect
        x={262}
        y={30}
        width={314}
        height={236}
        rx={18}
        fill={docsOn ? C.acid : C.inkSoft}
        fillOpacity={docsOn ? 0.14 : 1}
        stroke={docsOn ? C.acid : C.line}
        strokeWidth={docsOn ? 3.5 : 2}
        className={SVG_TR}
      />
      <text x={282} y={64} fontSize={22} fontWeight={700} fill={docsOn ? C.acid : C.paper} className={SVG_TR}>
        文檔
      </text>
      <text x={338} y={64} fontSize={18} fill={docsOn ? C.paper : C.muted} className={SVG_TR}>
        Notion · GitHub issue
      </text>
      <text x={338} y={90} fontSize={17} fill={C.muted}>
        或 GitHub Projects
      </text>

      {ISSUES.map((item, index) => {
        const state = rowState(step, index);
        const tone: Tone | null =
          state === 'done' ? 'teal' : state === 'active' ? 'acid' : null;
        const y = SD_ROW_Y + index * SD_ROW_STEP;
        const status =
          state === 'done'
            ? '完成'
            : state === 'active'
              ? phase === 'read'
                ? '讀取中'
                : '開發中'
              : '';
        return (
          <g key={item.no}>
            <rect x={SD_ROW_X} y={y} width={SD_ROW_W} height={SD_ROW_H} rx={8} fill={C.panel} />
            <rect
              x={SD_ROW_X}
              y={y}
              width={SD_ROW_W}
              height={SD_ROW_H}
              rx={8}
              fill={tone ? TONE_VAR[tone] : C.panel}
              fillOpacity={tone ? 0.14 : 1}
              stroke={tone ? TONE_VAR[tone] : C.line}
              strokeWidth={tone ? 2.5 : 1.5}
              className={SVG_TR}
            />
            {/* 勾選框：完成時填實 teal ＋ 挖空的勾 */}
            <rect
              x={SD_ROW_X + 12}
              y={y + 8}
              width={18}
              height={18}
              rx={4}
              fill={state === 'done' ? C.teal : C.panel}
              stroke={tone ? TONE_VAR[tone] : C.faint}
              strokeWidth={2}
              className={SVG_TR}
            />
            {state === 'done' && (
              <path
                d={`M ${SD_ROW_X + 16} ${y + 17} L ${SD_ROW_X + 20} ${y + 21} L ${SD_ROW_X + 26} ${y + 12}`}
                fill="none"
                stroke={C.onAccent}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            <text x={SD_ROW_X + 40} y={y + 23} fontSize={17} fill={C.faint} className="font-mono">
              {item.no}
            </text>
            <text
              x={SD_ROW_X + 84}
              y={y + 23}
              fontSize={18}
              fontWeight={state === 'pending' ? 400 : 600}
              fill={C.paper}
            >
              {item.title}
            </text>
            {tone && (
              <text
                x={SD_ROW_X + SD_ROW_W - 12}
                y={y + 23}
                textAnchor="end"
                fontSize={16}
                fontWeight={600}
                fill={TONE_VAR[tone]}
              >
                {status}
              </text>
            )}
          </g>
        );
      })}
      <text
        x={282}
        y={248}
        fontSize={17}
        fontWeight={docsOn ? 600 : 400}
        fill={docsOn ? C.paper : C.muted}
        className={SVG_TR}
      >
        ＋ 還有 {MORE_ISSUES} 個 issue
      </text>
    </svg>
  );
}

export function SddLoopDemo() {
  const [focus, setFocus] = useState<FocusId>('docs');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = SDD_SCRIPT[cursor];
  const atEnd = cursor === SDD_LAST;
  const running = playing && !atEnd;
  const doneCount = ISSUES.filter((_, index) => rowState(step, index) === 'done').length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setCursor((value) => Math.min(value + 1, SDD_LAST)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [running, cursor]);

  const togglePlay = () => {
    if (running) {
      setPlaying(false);
      return;
    }
    /* 從頭或從結尾按下去，直接跳到「讀 #12」，不用多等一拍 */
    if (atEnd || cursor === 0) setCursor(1);
    setPlaying(true);
  };

  const playLabel = running ? '暫停' : atEnd ? '重播' : cursor === 0 ? '播放' : '繼續播放';

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <div className="flex w-[520px] shrink-0 flex-col gap-4">
        {/* 這一頁的核心轉變 */}
        <div className="flex flex-col gap-3 rounded-2xl border border-line px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="w-16 shrink-0 rounded-lg border border-line py-1 text-center text-[17px] text-faint">
              以前
            </span>
            <span className="text-[22px] text-muted">單純從 session 對話框</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-0.5 w-16 shrink-0 rounded-lg border border-paper bg-paper py-1 text-center text-[17px] font-medium text-on-accent">
              現在
            </span>
            <span className="text-[24px] leading-snug font-semibold text-paper">
              由整個 Harness 與周邊環境
              <br />
              驅動專案開發
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {POINTS.map((point) => (
            <OptionCard
              key={point.id}
              no={point.no}
              title={point.title}
              text={point.text}
              active={point.id === focus}
              onClick={() => setFocus(point.id)}
            />
          ))}
        </div>

        {/* 播放器 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-ink-soft px-5 py-3">
            <div className="flex items-baseline justify-between">
              <p className={LABEL_FAINT}>AI 現在在做</p>
              <p className="text-[19px] text-muted">
                已完成{' '}
                <span className="font-display text-[24px] font-semibold text-teal tabular-nums">
                  {doneCount}
                </span>{' '}
                / {ISSUES.length} 個 issue
              </p>
            </div>
            <p className="truncate text-[22px] font-medium text-paper">
              <span className="text-acid">{'› '}</span>
              {step.log}
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={togglePlay} className={BTN_PRIMARY}>
              {playLabel}
            </button>
            <button
              type="button"
              disabled={cursor === 0}
              onClick={() => {
                setPlaying(false);
                setCursor((value) => Math.max(value - 1, 0));
              }}
              className={BTN_GHOST}
            >
              上一步
            </button>
            <button
              type="button"
              disabled={atEnd}
              onClick={() => {
                setPlaying(false);
                setCursor((value) => Math.min(value + 1, SDD_LAST));
              }}
              className={BTN_GHOST}
            >
              下一步
            </button>
          </div>
        </div>
      </div>

      <SddDiagram focus={focus} step={step} />
    </div>
  );
}
