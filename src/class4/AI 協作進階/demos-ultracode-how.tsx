import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第四章 Ultracode：怎麼分工
 *
 *   第 26 頁  UltracodeHowDemo  Ultracode 怎麼分工
 *             （接在第 25 頁「開啟 Ultracode」之後、第 27 頁「實際使用心得」之前）
 *
 * 講師的要求：「可以加入 ultra code 說明，但一樣，範例我後面再補」。
 * 所以這一頁只講「Ultracode（dynamic workflows）怎麼把一個大任務拆給大量
 * SubAgent」的觀念，不放任何範例專案、具名的 agent、檔名或專案數字。
 * 跟前後頁的分工：第 24 頁是截圖導覽、第 25 頁是怎麼開啟、第 27 頁是使用心得
 * （對抗式驗證、過度驗證都在那一頁），這裡只用一句帶過驗證。
 *
 * 做法：「左邊是選項、右邊是概念圖」。左欄四個觀念，點哪一個，右邊那一部分
 * 用 acid 亮起；右上角可以播放一次完整流程（7 格），左欄會跟著亮到對應的觀念。
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-06 查的官方文件）
 * ──────────────────────────────────────────────────────────────
 * https://code.claude.com/docs/en/workflows
 *   - dynamic workflow 是一份 Claude 寫的 JavaScript 腳本，由 runtime 在背景
 *     執行、一次協調很多 SubAgent。「A workflow moves the plan into code」：
 *     下一步由腳本決定（subagents／skills 是 Claude 一回合一回合決定），
 *     中間結果留在腳本的變數裡，Claude 的 Context 只放最後的答案。
 *   - 腳本裡用 phase() 把接下來的 agent 分成一組，/workflows 的進度畫面
 *     就是一個階段一個階段列出來（第 24 頁截圖左欄的 Phases）。
 *   - agent() 派一位 SubAgent；parallel() 讓一組同時跑、全部回來才往下；
 *     pipeline() 讓清單裡每一項各自往下走。預設最多 16 位同時跑。
 *   - agent() 可以帶 schema，SubAgent 就一定照那個格式交回 —— 這一頁說的
 *     「契約」就是腳本交給每位 SubAgent 的任務說明＋回傳格式。
 *   - 要平行改很多檔案時，每一位在自己的隔離副本（worktree）裡做，
 *     「so edits don't conflict」。
 *   - 可以讓獨立的 agent 互相對抗式檢查結果，再交出去（品質模式）。
 *   - ultracode 開著時，一個需求可能接連變成好幾個 workflow：
 *     先理解程式、再修改、再驗證。
 * https://code.claude.com/docs/en/agents
 *   - SubAgent 把結果交回派它出去的那一方；會彼此直接傳訊息的是 agent teams
 *     （另一種做法）。所以 workflow 裡平行的 SubAgent 之間沒有溝通。
 *   - 「Do the tasks touch the same files? Isolate the work with worktrees.」
 * https://code.claude.com/docs/en/model-config
 *   - ultracode 是 Claude Code 的設定，不是一個 effort 等級：開著時 Claude 會
 *     為每個夠大的任務規劃一個 dynamic workflow。
 *
 * 顧問整理的四個觀念（拆階段、平行、契約、彙整）都對得上上面的文件；
 * 「契約」一詞文件沒有用，畫面上把它講成「任務、範圍、回傳格式」。
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（文件沒有，為了讓圖成立才加的，講師補範例時可以整段換掉）
 * ──────────────────────────────────────────────────────────────
 *   - 三個階段的名稱「了解／平行實作／彙整」（依文件「先理解、再修改、再驗證」
 *     歸納的通用名稱）。
 *   - 階段 1 畫兩位、階段 2 畫四位 SubAgent —— 只是示意「好幾位」，不是實際數量。
 *   - 契約上的三行「每位的任務／負責的範圍／回傳格式」。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（兩支）
 * ──────────────────────────────────────────────────────────────
 *   acid  選取的觀念、播放中「目前這一步」。
 *   teal  播放時已經完成的部分（✓）。
 *   其他一律中性。SVG 節點淡底（/14）一律配 3.5 的實色框，
 *   左欄選單與狀態列是 6px 左粗條。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel p-10 內可用約 1744 × 768；根容器 720 × 1740，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   寬  左欄 560 ＋ gap 32 ＋ 右卡 1148（卡片內寬 1148 − 2 − 64 ＝ 1082）
 *   左  標籤 26 ＋ 16 ＋ 四張選單 flex-1 ＋ 16 ＋ 文件連結 28
 *       每張約 (720 − 86 − 36) ÷ 4 ≈ 149；內容：標題 35 ＋ 6 ＋ 說明兩行 52 ＋ py 32 ＝ 125
 *   右  卡片內高 720 − 2 − 40 ＝ 678 ＝ 標題列 48 ＋ 14 ＋ 圖 540 ＋ 14 ＋ 狀態列 56（剩 6）
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:border-line-soft disabled:text-faint`;

const LINK =
  'text-[18px] text-muted underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-acid';

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity] duration-300 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  line: 'var(--color-line)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** idle ＝ 中性；on ＝ 選取／目前這一步（acid）；done ＝ 已完成（teal） */
type Tone = 'idle' | 'on' | 'done';

const toneStroke = (tone: Tone) =>
  tone === 'on' ? C.acid : tone === 'done' ? C.teal : C.line;
const toneFill = (tone: Tone) =>
  tone === 'on' ? C.acid : tone === 'done' ? C.teal : C.inkSoft;
const toneFillOpacity = (tone: Tone) => (tone === 'idle' ? 1 : 0.14);
const toneWidth = (tone: Tone) => (tone === 'idle' ? 2 : 3.5);
const toneLine = (tone: Tone) =>
  tone === 'on' ? C.acid : tone === 'done' ? C.teal : C.muted;
const toneText = (tone: Tone) =>
  tone === 'on' ? C.acid : tone === 'done' ? C.teal : C.paper;

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
const MARKER = 'uh-arrow';

function ArrowMarkers() {
  const tones: Record<Tone, string> = { idle: C.muted, on: C.acid, done: C.teal };
  return (
    <defs>
      {(Object.keys(tones) as Tone[]).map((tone) => (
        <marker
          key={tone}
          id={`${MARKER}-${tone}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={14}
          markerHeight={14}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={tones[tone]} />
        </marker>
      ))}
    </defs>
  );
}

/* ── 左欄：四個觀念 ─────────────────────────────────────── */

type ConceptId = 'phases' | 'contract' | 'parallel' | 'merge';

interface Concept {
  id: ConceptId;
  name: string;
  sub: string;
  /** 選到這個觀念時，狀態列的那一句（對應官方文件） */
  detail: string;
}

const CONCEPTS: readonly Concept[] = [
  {
    id: 'phases',
    name: '先拆成幾個階段',
    sub: 'Claude 先寫好一份腳本：分幾個階段、每段派誰、交回什麼。',
    detail: '計畫寫在腳本裡，下一步由腳本決定 —— 不是 Claude 一回合一回合臨時想。',
  },
  {
    id: 'contract',
    name: '先講好契約',
    sub: '每一份的任務、範圍、回傳格式，開工前就定好。',
    detail: '契約就是腳本交給每位 SubAgent 的任務說明，加上規定好的回傳格式。',
  },
  {
    id: 'parallel',
    name: '平行派出，彼此不溝通',
    sub: '獨立的部分同時開工，只對契約負責；平行的前提是隔離，不是溝通。',
    detail: '結果只交回腳本、不互傳；要改檔案時，各自在隔離的副本（worktree）裡做。',
  },
  {
    id: 'merge',
    name: '最後彙整成一份',
    sub: '所有結果收攏成一份，主 Agent 只收到最後的答案。',
    detail: '中間結果都留在腳本裡；不確定的，另派 SubAgent 驗證後才交回主 Agent。',
  },
];

/** 左側選單的一列（同 demos-subagent.tsx 的 MenuItem，高度改成平分） */
function MenuItem({
  index,
  concept,
  on,
  onClick,
}: {
  index: number;
  concept: Concept;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
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
        <span className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {concept.name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {concept.sub}
        </span>
      </span>
    </button>
  );
}

/* ── 右邊的概念圖 ───────────────────────────────────────
 * 座標（viewBox 1080 × 540，1:1 呈現）：
 *   階段膠囊  y 6 h 42：階段 1 (12, w 206)、階段 2 (390, w 240)、階段 3 (824, w 222)
 *   階段欄    y 60：階段 1 x 2 w 228 h 470；階段 2 x 262 w 496 h 470；
 *             階段 3 x 790 w 288 h 320（主 Agent 在欄外，y 410）
 *   階段 1    兩位 SubAgent x 20 w 190 h 72，y 203／315
 *   契約      (284, 190) 132 × 210，中心 y 295
 *   階段 2    四位 SubAgent x 530 w 220 h 72，y 91／203／315／427；
 *             之間的空隙 y 183／295／407 畫「✕」——那條線不存在
 *   階段 3    驗證 (812, 96) 246 × 66；彙整 (812, 247) 246 × 96，中心跟契約同高
 *             （y 295），四條匯入線上下對稱；主 Agent (812, 410) 246 × 96 */

type PartId =
  | 'pill1'
  | 'pill2'
  | 'pill3'
  | 'arrow12'
  | 'arrow23'
  | 'col1'
  | 'col2'
  | 'col3'
  | 'p1Agents'
  | 'toContract'
  | 'contract'
  | 'contractLines'
  | 'p2Agents'
  | 'noTalk'
  | 'fanIn'
  | 'merge'
  | 'verify'
  | 'toMain'
  | 'main';

type Parts = Record<PartId, Tone>;

const PART_IDS: readonly PartId[] = [
  'pill1',
  'pill2',
  'pill3',
  'arrow12',
  'arrow23',
  'col1',
  'col2',
  'col3',
  'p1Agents',
  'toContract',
  'contract',
  'contractLines',
  'p2Agents',
  'noTalk',
  'fanIn',
  'merge',
  'verify',
  'toMain',
  'main',
];

function idleParts(): Parts {
  return Object.fromEntries(PART_IDS.map((id) => [id, 'idle'])) as Parts;
}

/** 點選左欄某個觀念時，圖上亮起的部分 */
const FOCUS_PARTS: Record<ConceptId, readonly PartId[]> = {
  phases: ['pill1', 'pill2', 'pill3', 'arrow12', 'arrow23', 'col1', 'col2', 'col3'],
  contract: ['toContract', 'contract', 'contractLines'],
  parallel: ['p1Agents', 'p2Agents', 'noTalk'],
  merge: ['fanIn', 'merge', 'verify', 'toMain', 'main'],
};

function focusParts(concept: ConceptId): Parts {
  const parts = idleParts();
  for (const id of FOCUS_PARTS[concept]) parts[id] = 'on';
  return parts;
}

/* ── 播放：完整流程 7 格 ─────────────────────────────── */

const PLAY_STEPS: readonly { concept: ConceptId; stage: string; log: string }[] = [
  { concept: 'phases', stage: '先排好階段', log: 'Claude 先寫好腳本：這個任務分成三個階段' },
  { concept: 'phases', stage: '階段 1 · 了解', log: '階段 1：派 SubAgent 同時去了解現況' },
  {
    concept: 'contract',
    stage: '階段 2 · 平行實作',
    log: '開工前，先把每一份的任務、範圍、回傳格式定成契約',
  },
  {
    concept: 'parallel',
    stage: '階段 2 · 平行實作',
    log: '多位 SubAgent 同時開工，每一位只看契約、做自己那一份',
  },
  {
    concept: 'parallel',
    stage: '階段 2 · 平行實作',
    log: '各自照契約交回結果 —— 過程中彼此沒有溝通',
  },
  {
    concept: 'merge',
    stage: '階段 3 · 彙整',
    log: '把所有結果彙整成一份；不確定的，另派 SubAgent 驗證',
  },
  { concept: 'merge', stage: '階段 3 · 彙整', log: '主 Agent 只收到最後這一份結果' },
];

const PLAY_LAST = PLAY_STEPS.length - 1;
const PLAY_MS = 1400;

function playParts(tick: number): Parts {
  const parts = idleParts();
  const set = (ids: readonly PartId[], tone: Tone) => {
    for (const id of ids) parts[id] = tone;
  };

  if (tick === 0) {
    set(['pill1', 'pill2', 'pill3', 'arrow12', 'arrow23', 'col1', 'col2', 'col3'], 'on');
    return parts;
  }

  /* 階段 1 */
  set(['pill1', 'p1Agents'], tick === 1 ? 'on' : 'done');
  if (tick === 1) parts.col1 = 'on';

  /* 階段 2：先定契約，再平行開工 */
  if (tick >= 2) {
    parts.arrow12 = 'done';
    parts.pill2 = tick <= 4 ? 'on' : 'done';
    if (tick <= 4) parts.col2 = 'on';
    set(['toContract', 'contract'], tick === 2 ? 'on' : 'done');
  }
  if (tick >= 3) set(['contractLines', 'p2Agents'], tick === 3 ? 'on' : 'done');
  if (tick === 4) parts.noTalk = 'on';

  /* 階段 3：彙整 → 交回主 Agent */
  if (tick >= 5) {
    parts.arrow23 = 'done';
    parts.pill3 = tick === 5 ? 'on' : 'done';
    if (tick === 5) parts.col3 = 'on';
    set(['fanIn', 'merge', 'verify'], tick === 5 ? 'on' : 'done');
  }
  if (tick >= 6) set(['toMain', 'main'], 'done');

  return parts;
}

/* ── 圖解零件 ───────────────────────────────────────────── */

const AGENT_H = 72;
const P1_X = 20;
const P1_W = 190;
const P1_YS = [203, 315] as const;
const P2_X = 530;
const P2_W = 220;
const P2_YS = [91, 203, 315, 427] as const;
const NO_TALK_YS = [183, 295, 407] as const;

const CT = { x: 284, y: 190, w: 132, h: 210, fold: 24 } as const;
const CT_CY = CT.y + CT.h / 2;

const PILLS: readonly { id: 'pill1' | 'pill2' | 'pill3'; x: number; w: number; text: string }[] = [
  { id: 'pill1', x: 12, w: 206, text: '階段 1 · 了解' },
  { id: 'pill2', x: 390, w: 240, text: '階段 2 · 平行實作' },
  { id: 'pill3', x: 824, w: 222, text: '階段 3 · 彙整' },
];

const COLS: readonly { id: 'col1' | 'col2' | 'col3'; x: number; w: number; h: number }[] = [
  { id: 'col1', x: 2, w: 228, h: 470 },
  { id: 'col2', x: 262, w: 496, h: 470 },
  { id: 'col3', x: 790, w: 288, h: 320 },
];

function AgentBox({
  x,
  y,
  w,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  sub: string;
  tone: Tone;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={AGENT_H}
        rx={14}
        fill={toneFill(tone)}
        fillOpacity={toneFillOpacity(tone)}
        stroke={toneStroke(tone)}
        strokeWidth={toneWidth(tone)}
        className={SVG_TR}
      />
      <text
        x={x + w / 2}
        y={y + 32}
        textAnchor="middle"
        fontSize={21}
        fontWeight={600}
        fill={C.paper}
      >
        SubAgent
      </text>
      <text x={x + w / 2} y={y + 58} textAnchor="middle" fontSize={17} fill={C.muted}>
        {sub}
      </text>
      {tone === 'done' && (
        <text
          x={x + w - 22}
          y={y + 33}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill={C.teal}
        >
          ✓
        </text>
      )}
    </g>
  );
}

/** 方塊：標題 ＋ 一行說明（彙整、主 Agent） */
function NodeBox({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone: Tone;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={toneFill(tone)}
        fillOpacity={toneFillOpacity(tone)}
        stroke={toneStroke(tone)}
        strokeWidth={toneWidth(tone)}
        className={SVG_TR}
      />
      <text
        x={x + w / 2}
        y={y + 41}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        fill={toneText(tone)}
        className={SVG_TR}
      >
        {title}
      </text>
      <text x={x + w / 2} y={y + 72} textAnchor="middle" fontSize={17} fill={C.muted}>
        {sub}
      </text>
    </g>
  );
}

function Arrow({ d, tone, dashed = false }: { d: string; tone: Tone; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={toneLine(tone)}
      strokeWidth={tone === 'idle' ? 2 : 3}
      strokeDasharray={dashed ? '6 6' : undefined}
      markerEnd={`url(#${MARKER}-${tone})`}
      className={SVG_TR}
    />
  );
}

function HowDiagram({ parts }: { parts: Parts }) {
  return (
    <svg
      width={1080}
      height={540}
      viewBox="0 0 1080 540"
      role="img"
      className="shrink-0"
    >
      <title>
        Ultracode 的分工：任務拆成三個階段；開工前先講好契約，平行的 SubAgent
        各自只對契約負責、彼此不溝通；最後彙整成一份交回主 Agent
      </title>
      <ArrowMarkers />

      {/* ── 階段欄（虛線框） ── */}
      {COLS.map((col) => {
        const tone = parts[col.id];
        return (
          <rect
            key={col.id}
            x={col.x}
            y={60}
            width={col.w}
            height={col.h}
            rx={20}
            fill="none"
            stroke={tone === 'on' ? C.acid : C.muted}
            strokeWidth={tone === 'on' ? 2.5 : 1.5}
            strokeDasharray="8 8"
            className={SVG_TR}
          />
        );
      })}

      {/* ── 階段膠囊與之間的箭頭 ── */}
      <Arrow d="M 224 27 L 382 27" tone={parts.arrow12} />
      <Arrow d="M 636 27 L 816 27" tone={parts.arrow23} />
      {PILLS.map((pill) => {
        const tone = parts[pill.id];
        return (
          <g key={pill.id}>
            <rect
              x={pill.x}
              y={6}
              width={pill.w}
              height={42}
              rx={21}
              fill={toneFill(tone)}
              fillOpacity={toneFillOpacity(tone)}
              stroke={toneStroke(tone)}
              strokeWidth={toneWidth(tone)}
              className={SVG_TR}
            />
            <text
              x={pill.x + pill.w / 2}
              y={34}
              textAnchor="middle"
              fontSize={19}
              fontWeight={600}
              fill={toneText(tone)}
              className={SVG_TR}
            >
              {pill.text}
              {tone === 'done' ? ' ✓' : ''}
            </text>
          </g>
        );
      })}

      {/* ── 階段 1：了解 ── */}
      {P1_YS.map((y) => (
        <AgentBox key={y} x={P1_X} y={y} w={P1_W} sub="了解現況" tone={parts.p1Agents} />
      ))}
      <Arrow d={`M 214 239 C 252 239, 248 272, 278 272`} tone={parts.toContract} />
      <Arrow d={`M 214 351 C 252 351, 248 318, 278 318`} tone={parts.toContract} />

      {/* ── 契約 ── */}
      <g>
        <path
          d={`M ${CT.x} ${CT.y} H ${CT.x + CT.w - CT.fold} L ${CT.x + CT.w} ${CT.y + CT.fold} V ${CT.y + CT.h} H ${CT.x} Z`}
          fill={toneFill(parts.contract)}
          fillOpacity={toneFillOpacity(parts.contract)}
          stroke={toneStroke(parts.contract)}
          strokeWidth={toneWidth(parts.contract)}
          strokeLinejoin="round"
          className={SVG_TR}
        />
        <path
          d={`M ${CT.x + CT.w - CT.fold} ${CT.y} V ${CT.y + CT.fold} H ${CT.x + CT.w}`}
          fill="none"
          stroke={toneStroke(parts.contract)}
          strokeWidth={toneWidth(parts.contract)}
          strokeLinejoin="round"
          className={SVG_TR}
        />
        <text
          x={CT.x + CT.w / 2}
          y={CT.y + 58}
          textAnchor="middle"
          fontSize={28}
          fontWeight={700}
          fill={toneText(parts.contract)}
          className={SVG_TR}
        >
          契約
        </text>
        <line
          x1={CT.x + 18}
          y1={CT.y + 78}
          x2={CT.x + CT.w - 18}
          y2={CT.y + 78}
          stroke={toneStroke(parts.contract)}
          strokeWidth={2}
          className={SVG_TR}
        />
        <g fontSize={18} fill={C.paper} textAnchor="middle">
          <text x={CT.x + CT.w / 2} y={CT.y + 112}>
            每位的任務
          </text>
          <text x={CT.x + CT.w / 2} y={CT.y + 146}>
            負責的範圍
          </text>
          <text x={CT.x + CT.w / 2} y={CT.y + 180}>
            回傳格式
          </text>
        </g>
      </g>

      {/* 契約 → 每一位 SubAgent（只有這種線，SubAgent 之間沒有線） */}
      {P2_YS.map((y, i) => {
        const cy = y + AGENT_H / 2;
        const sy = CT_CY + (i - 1.5) * 24;
        return (
          <Arrow
            key={y}
            d={`M 420 ${sy} C 470 ${sy}, 480 ${cy}, 524 ${cy}`}
            tone={parts.contractLines}
          />
        );
      })}

      {/* ── 階段 2：平行實作 ── */}
      {P2_YS.map((y, i) => (
        <AgentBox
          key={y}
          x={P2_X}
          y={y}
          w={P2_W}
          sub={`第 ${i + 1} 部分`}
          tone={parts.p2Agents}
        />
      ))}

      {/* SubAgent 之間：那條線不存在 */}
      {NO_TALK_YS.map((y, i) => {
        const color = parts.noTalk === 'on' ? C.acid : C.muted;
        const width = parts.noTalk === 'on' ? 3 : 2;
        return (
          <g key={y} className={SVG_TR}>
            <line
              x1={566}
              y1={y - 18}
              x2={566}
              y2={y + 18}
              stroke={color}
              strokeWidth={width}
              strokeDasharray="4 5"
              className={SVG_TR}
            />
            <circle
              cx={566}
              cy={y}
              r={11}
              fill={C.inkSoft}
              stroke={color}
              strokeWidth={width}
              className={SVG_TR}
            />
            <path
              d={`M ${566 - 5} ${y - 5} L ${566 + 5} ${y + 5} M ${566 + 5} ${y - 5} L ${566 - 5} ${y + 5}`}
              stroke={color}
              strokeWidth={width}
              strokeLinecap="round"
              className={SVG_TR}
            />
            {i === 1 && (
              <text
                x={588}
                y={y + 6}
                fontSize={17}
                fontWeight={parts.noTalk === 'on' ? 600 : 400}
                fill={parts.noTalk === 'on' ? C.acid : C.muted}
                className={SVG_TR}
              >
                彼此不溝通
              </text>
            )}
          </g>
        );
      })}

      {/* ── 階段 3：彙整 ── */}
      {P2_YS.map((y, i) => {
        const cy = y + AGENT_H / 2;
        const ty = CT_CY - 30 + i * 20;
        return (
          <Arrow
            key={y}
            d={`M 754 ${cy} C 786 ${cy}, 778 ${ty}, 806 ${ty}`}
            tone={parts.fanIn}
          />
        );
      })}
      <NodeBox
        x={812}
        y={247}
        w={246}
        h={96}
        title="彙整"
        sub="所有結果收攏成一份"
        tone={parts.merge}
      />

      {/* 驗證只用一句帶過（細節在第 27 頁） */}
      <line
        x1={935}
        y1={164}
        x2={935}
        y2={245}
        stroke={toneLine(parts.verify)}
        strokeWidth={2}
        strokeDasharray="5 5"
        className={SVG_TR}
      />
      <rect
        x={812}
        y={96}
        width={246}
        height={66}
        rx={14}
        fill={parts.verify === 'idle' ? 'none' : toneFill(parts.verify)}
        fillOpacity={toneFillOpacity(parts.verify)}
        stroke={toneLine(parts.verify)}
        strokeWidth={parts.verify === 'idle' ? 1.5 : 3}
        strokeDasharray="7 6"
        className={SVG_TR}
      />
      <g fontSize={17} textAnchor="middle" fill={C.paper}>
        <text x={935} y={123}>
          不確定的結果
        </text>
        <text x={935} y={148}>
          另派 SubAgent 驗證
        </text>
      </g>

      {/* ── 交回主 Agent（在 workflow 外面） ── */}
      <Arrow d="M 935 347 L 935 404" tone={parts.toMain} />
      <text
        x={952}
        y={372}
        fontSize={17}
        fontWeight={600}
        fill={toneLine(parts.toMain)}
        className={SVG_TR}
      >
        交回
      </text>
      <NodeBox
        x={812}
        y={410}
        w={246}
        h={96}
        title="主 Agent"
        sub="只收到這一份結果"
        tone={parts.main}
      />
    </svg>
  );
}

/* ── 第 26 頁 · UltracodeHowDemo ─────────────────────── */

type View = { mode: 'focus'; focus: ConceptId } | { mode: 'play'; tick: number };

export function UltracodeHowDemo() {
  const [view, setView] = useState<View>({ mode: 'focus', focus: 'phases' });
  const [playing, setPlaying] = useState(false);

  const isPlay = view.mode === 'play';
  const tick = view.mode === 'play' ? view.tick : -1;
  const atEnd = isPlay && tick >= PLAY_LAST;
  const running = playing && isPlay && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setView((current) =>
        current.mode === 'play'
          ? { mode: 'play', tick: Math.min(current.tick + 1, PLAY_LAST) }
          : current,
      );
    }, PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [running, tick]);

  const activeConcept: ConceptId =
    view.mode === 'focus' ? view.focus : PLAY_STEPS[view.tick].concept;
  const conceptIndex = Math.max(
    0,
    CONCEPTS.findIndex((concept) => concept.id === activeConcept),
  );
  const parts = view.mode === 'focus' ? focusParts(view.focus) : playParts(view.tick);

  const pick = (id: ConceptId) => {
    setPlaying(false);
    setView({ mode: 'focus', focus: id });
  };

  const onPrimary = () => {
    if (!isPlay || atEnd) {
      setView({ mode: 'play', tick: 0 });
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const onStep = () => {
    setPlaying(false);
    setView((current) =>
      current.mode === 'play'
        ? { mode: 'play', tick: Math.min(current.tick + 1, PLAY_LAST) }
        : { mode: 'play', tick: 0 },
    );
  };

  const primaryLabel = !isPlay
    ? '播放完整流程'
    : running
      ? '暫停'
      : atEnd
        ? '重播'
        : '繼續';

  const headLabel = isPlay
    ? `完整流程 · ${tick + 1}／${PLAY_STEPS.length}`
    : `觀念 ${pad2(conceptIndex + 1)}`;
  const headTitle = isPlay ? PLAY_STEPS[tick].stage : CONCEPTS[conceptIndex].name;
  const status = isPlay ? PLAY_STEPS[tick].log : CONCEPTS[conceptIndex].detail;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[560px_1fr] gap-8">
      {/* ── 左：四個觀念 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>Ultracode 分工的四個觀念</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {CONCEPTS.map((concept, index) => (
            <MenuItem
              key={concept.id}
              index={index}
              concept={concept}
              on={concept.id === activeConcept}
              onClick={() => pick(concept.id)}
            />
          ))}
        </div>
        <a
          href="https://code.claude.com/docs/en/workflows"
          target="_blank"
          rel="noreferrer"
          className={`${LINK} self-start`}
        >
          官方文件：Dynamic workflows ↗
        </a>
      </div>

      {/* ── 右：概念圖 ─────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3.5 rounded-2xl border border-line bg-panel px-8 py-5">
        <div className="flex h-12 shrink-0 items-center gap-4">
          <span className={`${LABEL_TYPE} text-acid`}>{headLabel}</span>
          <span className="text-[30px] leading-none font-semibold text-paper">
            {headTitle}
          </span>
          <div className="ml-auto flex shrink-0 gap-3">
            <button type="button" onClick={onPrimary} className={BTN_PRIMARY}>
              {primaryLabel}
            </button>
            <button type="button" onClick={onStep} disabled={atEnd} className={BTN_GHOST}>
              下一步
            </button>
          </div>
        </div>

        <HowDiagram parts={parts} />

        <div
          className={`flex h-14 shrink-0 items-center gap-4 rounded-xl border border-l-[6px] border-line bg-panel-lift px-6 transition-colors duration-300 ${
            atEnd ? 'border-l-teal' : 'border-l-acid'
          }`}
        >
          <span className={`text-[22px] font-semibold ${atEnd ? 'text-teal' : 'text-acid'}`}>
            {atEnd ? '✓' : '›'}
          </span>
          <p className="text-[21px] text-paper">{status}</p>
        </div>
      </div>
    </div>
  );
}
