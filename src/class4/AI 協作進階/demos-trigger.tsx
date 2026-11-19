import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：觸發方式
 *
 *   第 33 頁  TriggerDemo     觸發方式：不只 Prompt
 *   第 34 頁  SchedulerDemo   定時觸發的三種方案（/loop、CronCreate、Routines）
 *
 * 原始內容來源：Notion「AI 協作進階－SubAgents 與外部服務整合」的 callout
 * （2026-10-06 Notion 連線故障，講師直接貼上原文）。callout 原文重點：
 *
 *   觸發方式，先前只有 Prompt 的觸發方式。
 *   因為 issue 是在 GitHub 上面或者是 Notion 上面，除了用 prompt 去觸發之外，
 *   也可以用時間週期去持續觸發，讓 AI 去抓 GitHub 上面的 issue，然後進行程式碼的開發。
 *   查詢 Claude Code 的三種解決方案，Codex 有沒有相關的，畫成圖示來介紹：
 *     1. loop  2. CronCreate  3. 雲端方案：Routines
 *   但官方文件目前列出的支援事件只有 Pull request 和 Release 兩類，issue 變動無法
 *   直接觸發。網路上有些文章寫可以訂 Issues，以官方文件為準的話目前還不行。
 *   如果要用 Routines 定時掃 issue，排程最短間隔是一小時。
 *
 * 視覺延續第 31 頁 LoopEngineerDiagram：觸發膠囊（rx ＝ 高度一半）、四格回圈
 * （外圈細線 ＋ 45° 的箭頭 ＋ 節點下墊一塊 panel 蓋掉圓線）。
 *
 * ──────────────────────────────────────────────────────────────
 * 第 34 頁的事實依據（2026-10-06 查的官方文件）
 * ──────────────────────────────────────────────────────────────
 * Claude Code · https://code.claude.com/docs/en/scheduled-tasks
 *   - /loop 是 bundled skill，在開著的 session 裡重跑 prompt。`/loop 5m <prompt>`，
 *     單位 s／m／h／d；cron 最小單位一分鐘，秒數會進位。
 *     不給間隔時由 Claude 自己挑下一次，介於一分鐘到一小時。
 *   - CronCreate／CronList／CronDelete 是 Claude 底層用的工具；CronCreate 收
 *     5 欄 cron（本機時區）、prompt、要不要重複（recurring）。ID 8 碼，
 *     一個 session 最多 50 個。
 *   - 兩者都是 session-scoped：Claude Code 開著且閒置時才會觸發，關掉就停；
 *     週期任務 7 天後自動過期。比較表的最短間隔：/loop 1 分鐘、Cloud 1 小時。
 * Claude Code · https://code.claude.com/docs/en/routines
 *   - research preview。跑在 Anthropic 管理的雲端，筆電闔上也會跑；每次 clone
 *     repo，改動推到 claude/ 開頭的分支。
 *   - 建立：claude.ai/code/routines、Desktop app，或 CLI 的 /schedule。
 *   - 觸發：排程（最短一小時，更頻繁的 cron 會被拒絕）、API、GitHub 事件。
 *     GitHub 支援的事件表只有 Pull request、Release 兩類 —— 跟講師寫的一致。
 * Codex · https://learn.chatgpt.com/docs/automations（developers.openai.com/codex/app/automations 轉址過去）
 *   - 現在叫「Scheduled tasks」，舊稱 Automations（網址與錨點還是 automations）。
 *   - Codex CLI 不提供排程介面，要用 ChatGPT 網頁版或桌面 app 建立。
 *   - 桌面 app：可以在專案資料夾或 worktree 裡跑，要讀本機檔案時電腦與 app 要開著。
 *     「在對話裡排程」會回到同一個對話、沿用脈絡，可以用分鐘級間隔；
 *     獨立排程每次開新對話，結果進 Scheduled，進階週期可寫 RRULE。
 *   - 網頁版跑在雲端、不碰本機資料夾；依方案可用事件觸發：Gmail、Slack、
 *     GitHub（Pull request 活動）—— 一樣沒有 issue。
 *   - 另有 Codex GitHub Action（openai/codex-action）在 GitHub Actions 裡跑 codex exec。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（callout 沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   第 33 頁
 *     - 時間 14:00–19:00、每小時觸發一次、「在座位／開會中／下班了」的行程。
 *     - 六個 issue（#21 登入頁 … #26 搜尋功能）、每個時段剛好做完一個 issue。
 *     - 「幫我做 #21 登入頁」這類 prompt。
 *   第 34 頁
 *     - /loop 的 prompt「抓 GitHub 上標 ready 的 issue 來開發」、間隔 30m、
 *       觸發時間 09:30–11:00 與每次抓到的 issue。
 *     - CronCreate 那句話、cron "3 9 * * 1-5"、排程表裡的 ID、另外兩列排程
 *       （看 CI、提醒推 release 分支）。工具的參數名稱 cron／prompt／recurring 是真的。
 *     - Routines 的 09:07、「有人開了 PR／新增 issue」的情境。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 33 頁  acid（目前這一步、現在觸發的膠囊、時間軸游標）＋ teal（issue 完成）。
 *             「你不在 → 沒有人觸發」一律中性虛線，不用 coral。
 *   第 34 頁  acid（選單選取、目前觸發的那一條）＋ coral（不支援／限制）。
 *             Codex 對照卡、地點標籤都是中性。
 *   淡底（/14）一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 沒有任何容器會捲動。細算寫在各頁的區塊。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110 disabled:border-line disabled:bg-ink-soft disabled:font-normal disabled:text-faint`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:border-line-soft disabled:text-faint`;

const LINK =
  'text-[18px] text-muted underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-acid';

const CODE = 'rounded-md bg-ink-soft px-2 py-0.5 font-mono text-[18px] text-paper';

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
  coral: 'var(--color-coral)',
  onAccent: 'var(--color-on-accent)',
} as const;

type Tone = 'muted' | 'acid' | 'teal' | 'coral';

const TONE_VAR: Record<Tone, string> = {
  muted: C.muted,
  acid: C.acid,
  teal: C.teal,
  coral: C.coral,
};

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix, tones }: { prefix: string; tones: readonly Tone[] }) {
  return (
    <defs>
      {tones.map((tone) => (
        <marker
          key={tone}
          id={`${prefix}-${tone}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={14}
          markerHeight={14}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={TONE_VAR[tone]} />
        </marker>
      ))}
    </defs>
  );
}

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心（同 demos-choose.tsx，多了虛線） */
function Person({
  cx,
  cy,
  r,
  color,
  dashed = false,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  dashed?: boolean;
}) {
  const shoulder = r * 1.7;
  const top = cy + r * 1.35;
  const bottom = cy + r * 3.2;
  return (
    <g
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={dashed ? '6 5' : undefined}
      fill={C.inkSoft}
      className={SVG_TR}
    >
      <circle cx={cx} cy={cy} r={r} />
      <path
        d={`M${cx - shoulder} ${bottom} Q${cx - shoulder} ${top} ${cx} ${top} Q${cx + shoulder} ${top} ${cx + shoulder} ${bottom} Z`}
      />
    </g>
  );
}

/** 時鐘小圖示：圓框 ＋ 時針分針 */
function ClockIcon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" className={SVG_TR}>
      <circle cx={cx} cy={cy} r={12} />
      <path d={`M ${cx} ${cy} L ${cx} ${cy - 7} M ${cx} ${cy} L ${cx + 6} ${cy}`} />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 33 頁 · TriggerDemo — 觸發方式：不只 Prompt
 *
 * callout：「先前只有 Prompt 的觸發方式。issue 在 GitHub 或 Notion 上，
 * 除了用 prompt 去觸發，也可以用時間週期持續觸發，讓 AI 去抓 GitHub 上的 issue
 * 來開發。」
 *
 * 左右兩張同樣結構的卡片，共用最下面一條時間軸：
 *   以前  觸發膠囊「你的 prompt」→ Harness · AI 開發 → 做完一次，停下來；
 *         虛線繞回人 ——「下一個 prompt，要等你再下」。
 *         你開會、下班的那幾格沒有人下 prompt，AI 停著（中性虛線）。
 *   現在  第 31 頁的四格回圈：排程時間到 → 抓 issue → 開發 → 等下一次。
 *         每一格時間都會觸發，右邊的 GitHub issue 清單被一個一個取走。
 * 兩邊各有一份同樣的 issue 清單，播完是「3 個完成」對「6 個完成」。
 *
 * 推進：6 個時段 × 4 個階段（觸發 → 抓／收到 → 開發 → 完成）＝ 24 步，
 * 每步 650ms，可以逐步、自動播放、重來。
 *
 * 寬度：兩張卡片各 (1740 − 32) ÷ 2 ＝ 854，卡片內寬 854 − 2 − 56 ＝ 796
 *       ＝ 圖解 440 ＋ gap 24 ＋ issue 清單 332。
 * 高度：根容器 720 ＝ 卡片 588 ＋ gap 20 ＋ 時間軸 92（剩 20）。
 *   卡片內高 588 − 2 − 40 ＝ 546 ＝ 標題列 44 ＋ 16 ＋ 主體 380 ＋ 16 ＋ 狀態列 90。
 *   主體：SVG 440 × 380（viewBox 1:1）；清單 標籤 26 ＋ 8 ＋ 6 列 × 50 ＋ 5 × 6 ＝ 364。
 *   時間軸：6 格 × 148 ＋ 5 × 10 ＝ 938 寬，高 64。
 * ══════════════════════════════════════════════════════════════ */

type Phase = 'fire' | 'fetch' | 'work' | 'done';

const PHASES: readonly Phase[] = ['fire', 'fetch', 'work', 'done'];

const TR_SLOTS: readonly { time: string; here: boolean; where: string }[] = [
  { time: '14:00', here: true, where: '在座位' },
  { time: '15:00', here: true, where: '在座位' },
  { time: '16:00', here: false, where: '開會中' },
  { time: '17:00', here: true, where: '在座位' },
  { time: '18:00', here: false, where: '下班了' },
  { time: '19:00', here: false, where: '下班了' },
];

const TR_ISSUES: readonly { no: number; title: string }[] = [
  { no: 21, title: '登入頁' },
  { no: 22, title: '註冊頁' },
  { no: 23, title: '忘記密碼' },
  { no: 24, title: '會員資料頁' },
  { no: 25, title: '訂單列表' },
  { no: 26, title: '搜尋功能' },
];

/** 每個時段處理哪一個 issue（TR_ISSUES 的索引）；null ＝ 這個時段沒有人觸發 */
const TR_PICK_PROMPT: readonly (number | null)[] = TR_SLOTS.map((slot, index) =>
  slot.here ? TR_SLOTS.slice(0, index).filter((item) => item.here).length : null,
);
const TR_PICK_SCHEDULE: readonly (number | null)[] = TR_SLOTS.map((_, index) => index);

const TR_LAST = TR_SLOTS.length * PHASES.length;
const TR_MS = 650;

type LaneKind = 'prompt' | 'schedule';
type IssueState = 'open' | 'picked' | 'working' | 'done';

/** cursor 0 是開始前；之後每 4 步是一個時段 */
function cursorAt(cursor: number): { slot: number; phase: Phase | null } {
  if (cursor <= 0) return { slot: -1, phase: null };
  const index = cursor - 1;
  return {
    slot: Math.floor(index / PHASES.length),
    phase: PHASES[index % PHASES.length],
  };
}

function laneIssues(lane: LaneKind, slot: number, phase: Phase | null): IssueState[] {
  const picks = lane === 'prompt' ? TR_PICK_PROMPT : TR_PICK_SCHEDULE;
  return TR_ISSUES.map((_, issueIndex) => {
    const at = picks.indexOf(issueIndex);
    if (at === -1 || at > slot) return 'open';
    if (at < slot) return 'done';
    if (phase === 'done') return 'done';
    if (phase === 'work') return 'working';
    if (phase === 'fetch') return lane === 'prompt' ? 'working' : 'picked';
    /* fire：Prompt 那邊是你挑好 issue 才下 prompt；排程那邊時間到了還沒去抓 */
    return lane === 'prompt' ? 'picked' : 'open';
  });
}

interface LaneStatus {
  time: string;
  text: string;
  active: boolean;
}

function issueTag(index: number) {
  const issue = TR_ISSUES[index];
  return { tag: `#${issue.no}`, title: issue.title };
}

function promptStatus(slot: number, phase: Phase | null): LaneStatus {
  if (phase === null) {
    return { time: '—', text: '需求寫在 GitHub 的 issue 上，等你來下 prompt', active: false };
  }
  const at = TR_SLOTS[slot];
  const pick = TR_PICK_PROMPT[slot];
  if (pick === null) {
    return { time: at.time, text: `你${at.where}，沒有人下 prompt —— AI 停著`, active: false };
  }
  const { tag, title } = issueTag(pick);
  const text: Record<Phase, string> = {
    fire: `你下 prompt：「幫我做 ${tag} ${title}」`,
    fetch: `AI 收到 prompt，開始處理 ${tag}`,
    work: `AI 開發 ${tag} 中…`,
    done: `${tag} 做完 —— AI 停下來，等你下一個 prompt`,
  };
  return { time: at.time, text: text[phase], active: true };
}

function scheduleStatus(slot: number, phase: Phase | null): LaneStatus {
  if (phase === null) {
    return { time: '—', text: '排程設定好了：每小時觸發一次', active: false };
  }
  const at = TR_SLOTS[slot];
  const { tag, title } = issueTag(slot);
  const next = TR_SLOTS[slot + 1];
  const text: Record<Phase, string> = {
    fire: `${at.time} 時間到 → 觸發`,
    fetch: `AI 去 GitHub 抓下一個 issue：${tag} ${title}`,
    work: `AI 開發 ${tag} 中…`,
    done: next ? `${tag} 完成 → 等 ${next.time} 再抓下一個` : `${tag} 完成 —— issue 全部做完`,
  };
  return { time: at.time, text: text[phase], active: true };
}

/* ── 以前：Prompt 觸發 ───────────────────────────────────
 * 座標（viewBox 440 × 380，1:1 呈現）：
 *   人 (60, 50) r 20；膠囊 (120, 30) 300 × 60
 *   Harness 方塊 (120, 146) 300 × 88；做完一次 (120, 276) 300 × 52
 *   虛線從做完一次的左側繞回人底下（x 60，y 302 → 160） */

function PromptLaneDiagram({ slot, phase }: { slot: number; phase: Phase | null }) {
  const pick = slot < 0 ? null : TR_PICK_PROMPT[slot];
  const away = slot >= 0 && pick === null;
  const on = (step: Phase) => !away && phase === step;

  const capsuleOn = on('fire');
  const boxOn = on('fetch') || on('work');
  const endOn = on('done');

  let personLabel = '你';
  if (slot >= 0) personLabel = away ? TR_SLOTS[slot].where : '在電腦前';

  let boxSub = '做這一次的 prompt';
  if (away) boxSub = '停著，沒有人觸發';
  else if (pick !== null && phase === 'fetch') boxSub = `收到 prompt：#${TR_ISSUES[pick].no}`;
  else if (pick !== null && phase === 'work') boxSub = `開發 #${TR_ISSUES[pick].no} 中…`;
  else if (pick !== null && phase === 'done') boxSub = `#${TR_ISSUES[pick].no} 做完了`;

  const nodeFill = (active: boolean) => (active ? C.acid : C.inkSoft);
  const nodeOpacity = (active: boolean) => (active ? 0.14 : 1);
  const nodeStroke = (active: boolean) => (active ? C.acid : C.line);
  const nodeWidth = (active: boolean) => (active ? 3.5 : 2);

  const arrow = (active: boolean, d: string) => (
    <path
      d={d}
      fill="none"
      stroke={active ? C.acid : C.muted}
      strokeWidth={active ? 3 : 2}
      markerEnd={`url(#trg-a-${active ? 'acid' : 'muted'})`}
      className={SVG_TR}
    />
  );

  return (
    <svg width={440} height={380} viewBox="0 0 440 380" role="img" className="shrink-0">
      <title>以前只有 Prompt 觸發：你下一次 prompt，AI 做一次就停下來，下一次要等你回來再下</title>
      <ArrowMarkers prefix="trg-a" tones={['muted', 'acid']} />

      {/* 人 */}
      <Person
        cx={60}
        cy={50}
        r={20}
        color={away ? C.muted : capsuleOn ? C.acid : C.paper}
        dashed={away}
      />
      <text
        x={60}
        y={142}
        textAnchor="middle"
        fontSize={17}
        fontWeight={600}
        fill={away ? C.muted : C.paper}
      >
        {personLabel}
      </text>

      {/* 下一次要等你：虛線繞回人 */}
      <path
        d="M 116 302 L 60 302 L 60 160"
        fill="none"
        stroke={C.muted}
        strokeWidth={2}
        strokeDasharray="7 6"
        markerEnd="url(#trg-a-muted)"
      />
      <text x={20} y={364} fontSize={17} fill={C.muted}>
        下一個 prompt，要等你再下
      </text>

      {/* 觸發膠囊：你的 prompt */}
      <rect
        x={120}
        y={30}
        width={300}
        height={60}
        rx={30}
        fill={away ? 'none' : nodeFill(capsuleOn)}
        fillOpacity={away ? 1 : nodeOpacity(capsuleOn)}
        stroke={away ? C.muted : nodeStroke(capsuleOn)}
        strokeWidth={nodeWidth(capsuleOn)}
        strokeDasharray={away ? '8 7' : undefined}
        className={SVG_TR}
      />
      <text
        x={270}
        y={67}
        textAnchor="middle"
        fontSize={21}
        fontWeight={600}
        fill={away ? C.muted : capsuleOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        {away ? '沒有人下 prompt' : '你的 prompt'}
      </text>

      {arrow(on('fetch'), 'M 270 94 L 270 140')}

      {/* Harness · AI 開發 */}
      <rect
        x={120}
        y={146}
        width={300}
        height={88}
        rx={16}
        fill={nodeFill(boxOn)}
        fillOpacity={nodeOpacity(boxOn)}
        stroke={nodeStroke(boxOn)}
        strokeWidth={nodeWidth(boxOn)}
        className={SVG_TR}
      />
      <text x={270} y={184} textAnchor="middle" fontSize={22} fontWeight={600} fill={C.paper}>
        Harness · AI 開發
      </text>
      <text
        x={270}
        y={214}
        textAnchor="middle"
        fontSize={18}
        fontWeight={boxOn ? 600 : 400}
        fill={boxOn ? C.acid : C.muted}
        className={SVG_TR}
      >
        {boxSub}
      </text>

      {arrow(endOn, 'M 270 238 L 270 270')}

      {/* 做完一次，停下來 */}
      <rect
        x={120}
        y={276}
        width={300}
        height={52}
        rx={26}
        fill={nodeFill(endOn)}
        fillOpacity={nodeOpacity(endOn)}
        stroke={nodeStroke(endOn)}
        strokeWidth={nodeWidth(endOn)}
        className={SVG_TR}
      />
      <text
        x={270}
        y={309}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
        fill={endOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        做完一次，停下來
      </text>
    </svg>
  );
}

/* ── 現在：時間週期觸發 ──────────────────────────────────
 * 第 31 頁的四格回圈，換成觸發 → 抓 issue → 開發 → 等下一次。
 * 座標（viewBox 440 × 380，1:1 呈現）：
 *   回圈中心 (220, 200) r 124
 *   排程時間到（膠囊）(125, 48) 190 × 56
 *   三格都是 112 × 60，圓心落在回圈上：抓 issue (288, 170)、開發 (164, 294)、
 *   等下一次 (40, 170)。格子收窄到 112（最長的「等下一次」20px × 4 字 ＝ 80，左右各留 16），
 *   左右兩格內緣 152 ↔ 288 之間留出 136 給中間的時間。
 *   中間：時間（40px，約 92 寬）基線 214，跟左右兩格同一條水平線；
 *         「每小時觸發一次」（17px × 7 字 ≈ 119）放到下面，
 *         夾在兩格底 230 與開發頂 294 之間（基線 260），不跟兩格搶同一排。
 *   「從 GitHub」原本浮在抓 issue 上方，正好壓在回圈線上，收進抓 issue 那格當副標。 */

const SC_CX = 220;
const SC_CY = 200;
const SC_R = 124;
const SC_NODE_H = 60;

const SC_NODES: readonly {
  phase: Phase;
  x: number;
  y: number;
  w: number;
  text: string;
  sub?: string;
}[] = [
  { phase: 'fetch', x: 288, y: 170, w: 112, text: '抓 issue', sub: '從 GitHub' },
  { phase: 'work', x: 164, y: 294, w: 112, text: '開發' },
  { phase: 'done', x: 40, y: 170, w: 112, text: '等下一次' },
];

/** 回圈上四個順時針箭頭，放在 45° 的位置（同第 31 頁） */
const SC_HEADS: readonly { x: number; y: number; rotate: number }[] = [
  { x: SC_CX + 87.7, y: SC_CY - 87.7, rotate: 45 },
  { x: SC_CX + 87.7, y: SC_CY + 87.7, rotate: 135 },
  { x: SC_CX - 87.7, y: SC_CY + 87.7, rotate: 225 },
  { x: SC_CX - 87.7, y: SC_CY - 87.7, rotate: 315 },
];

function ScheduleLaneDiagram({ slot, phase }: { slot: number; phase: Phase | null }) {
  const fireOn = phase === 'fire';
  const running = phase !== null;

  return (
    <svg width={440} height={380} viewBox="0 0 440 380" role="img" className="shrink-0">
      <title>現在可以用時間週期觸發：排程時間到、去 GitHub 抓 issue、開發、等下一次，一直繞下去</title>

      {/* 回圈 */}
      <circle
        cx={SC_CX}
        cy={SC_CY}
        r={SC_R}
        fill="none"
        stroke={running ? C.acid : C.muted}
        strokeWidth={running ? 3 : 2}
        className={SVG_TR}
      />
      {SC_HEADS.map((head) => (
        <path
          key={head.rotate}
          d="M -10 -9 L 10 0 L -10 9 Z"
          transform={`translate(${head.x} ${head.y}) rotate(${head.rotate})`}
          fill={running ? C.acid : C.muted}
          className={SVG_TR}
        />
      ))}

      {/* 中間：現在幾點 */}
      <text
        x={SC_CX}
        y={SC_CY + 14}
        textAnchor="middle"
        fontSize={40}
        fontWeight={600}
        fill={C.paper}
        className="font-display"
      >
        {slot >= 0 ? TR_SLOTS[slot].time : '—'}
      </text>
      <text x={SC_CX} y={SC_CY + 60} textAnchor="middle" fontSize={17} fill={C.muted}>
        每小時觸發一次
      </text>

      {/* 觸發膠囊：排程時間到（延續第 31 頁的「排程時間」） */}
      <rect x={125} y={48} width={190} height={56} rx={28} fill={C.panel} />
      <rect
        x={125}
        y={48}
        width={190}
        height={56}
        rx={28}
        fill={fireOn ? C.acid : C.inkSoft}
        fillOpacity={fireOn ? 0.14 : 1}
        stroke={fireOn ? C.acid : C.line}
        strokeWidth={fireOn ? 3.5 : 2}
        className={SVG_TR}
      />
      <ClockIcon cx={156} cy={76} color={fireOn ? C.acid : C.paper} />
      <text
        x={236}
        y={83}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
        fill={fireOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        排程時間到
      </text>

      {SC_NODES.map((node) => {
        const active = phase === node.phase;
        const cx = node.x + node.w / 2;
        return (
          <g key={node.phase}>
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={SC_NODE_H}
              rx={14}
              fill={C.panel}
            />
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={SC_NODE_H}
              rx={14}
              fill={active ? C.acid : C.inkSoft}
              fillOpacity={active ? 0.14 : 1}
              stroke={active ? C.acid : C.line}
              strokeWidth={active ? 3.5 : 2}
              className={SVG_TR}
            />
            <text
              x={cx}
              y={node.y + (node.sub ? 26 : 37)}
              textAnchor="middle"
              fontSize={20}
              fontWeight={600}
              fill={active ? C.acid : C.paper}
              className={SVG_TR}
            >
              {node.text}
            </text>
            {node.sub && (
              <text x={cx} y={node.y + 48} textAnchor="middle" fontSize={16} fill={C.muted}>
                {node.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── issue 清單、卡片、時間軸 ─────────────────────────── */

function IssueList({ states, pickedLabel }: { states: IssueState[]; pickedLabel: string }) {
  const label: Record<IssueState, string> = {
    open: '待處理',
    picked: pickedLabel,
    working: '開發中',
    done: '✓ 完成',
  };
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className={LABEL_FAINT}>GitHub Issues</span>
      <div className="flex flex-col gap-1.5">
        {TR_ISSUES.map((issue, index) => {
          const state = states[index];
          const style =
            state === 'done'
              ? 'border-teal/55 border-l-teal bg-panel'
              : state === 'open'
                ? 'border-line border-l-line bg-panel'
                : 'border-acid/55 border-l-acid bg-acid/14';
          const tagStyle =
            state === 'done'
              ? 'font-semibold text-teal'
              : state === 'open'
                ? 'text-faint'
                : 'font-semibold text-acid';
          return (
            <div
              key={issue.no}
              className={`flex h-[50px] items-center gap-3 rounded-xl border border-l-[6px] px-4 transition-colors duration-300 ${style}`}
            >
              <span className="w-[42px] shrink-0 font-mono text-[18px] text-muted">
                #{issue.no}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-[20px] ${
                  state === 'done' ? 'text-muted' : 'text-paper'
                }`}
              >
                {issue.title}
              </span>
              <span className={`shrink-0 text-[17px] ${tagStyle}`}>{label[state]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LaneCard({
  tag,
  lead,
  title,
  note,
  diagram,
  issues,
  pickedLabel,
  status,
}: {
  tag: string;
  lead: boolean;
  title: string;
  note: string;
  diagram: ReactNode;
  issues: IssueState[];
  pickedLabel: string;
  status: LaneStatus;
}) {
  const done = issues.filter((state) => state === 'done').length;
  return (
    <div className="flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-7 py-5">
      <div className="flex h-11 shrink-0 items-center gap-4">
        <span
          className={`rounded-full px-4 py-1 text-[18px] font-semibold text-on-accent ${
            lead ? 'bg-acid' : 'bg-paper'
          }`}
        >
          {tag}
        </span>
        <span className="text-[28px] leading-none font-semibold text-paper">{title}</span>
        <span className="ml-auto truncate text-[19px] text-muted">{note}</span>
      </div>

      <div className="grid h-[380px] shrink-0 grid-cols-[440px_1fr] gap-6">
        {diagram}
        <IssueList states={issues} pickedLabel={pickedLabel} />
      </div>

      <div
        className={`flex h-[90px] shrink-0 items-center gap-5 rounded-xl border border-l-[6px] border-line bg-panel-lift px-5 transition-colors duration-300 ${
          status.active ? 'border-l-acid' : 'border-l-line'
        }`}
      >
        <span className="w-[84px] shrink-0 font-display text-[30px] font-semibold text-paper tabular-nums">
          {status.time}
        </span>
        <p
          className={`min-w-0 flex-1 text-[21px] leading-snug ${
            status.active ? 'text-paper' : 'text-muted'
          }`}
        >
          {status.text}
        </p>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-display text-[44px] leading-none font-semibold text-teal tabular-nums">
            {done}
          </span>
          <span className="text-[19px] text-muted">個完成</span>
        </div>
      </div>
    </div>
  );
}

export function TriggerDemo() {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = cursor === TR_LAST;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setCursor((value) => Math.min(value + 1, TR_LAST)),
      TR_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, cursor]);

  const { slot, phase } = cursorAt(cursor);

  const togglePlay = () => {
    if (atEnd) {
      setCursor(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-5">
      <div className="grid h-[588px] shrink-0 grid-cols-2 gap-8">
        <LaneCard
          tag="以前"
          lead={false}
          title="只有 Prompt 觸發"
          note="你下一次 prompt，AI 做一次"
          diagram={<PromptLaneDiagram slot={slot} phase={phase} />}
          issues={laneIssues('prompt', slot, phase)}
          pickedLabel="你挑了它"
          status={promptStatus(slot, phase)}
        />
        <LaneCard
          tag="現在"
          lead
          title="時間週期觸發"
          note="需求在 GitHub／Notion，時間到自己去抓"
          diagram={<ScheduleLaneDiagram slot={slot} phase={phase} />}
          issues={laneIssues('schedule', slot, phase)}
          pickedLabel="被抓走"
          status={scheduleStatus(slot, phase)}
        />
      </div>

      {/* ── 時間軸 ── */}
      <div className="flex h-[92px] shrink-0 items-center gap-6 rounded-2xl border border-line bg-panel px-6">
        <span className={`${LABEL_FAINT} shrink-0`}>時間</span>
        <div className="flex gap-2.5">
          {TR_SLOTS.map((item, index) => {
            const state = index < slot ? 'past' : index === slot ? 'now' : 'future';
            const box =
              state === 'now'
                ? 'border-2 border-acid bg-acid/14'
                : state === 'past'
                  ? 'border border-line bg-panel-lift'
                  : 'border border-dashed border-line';
            const timeColor =
              state === 'now' ? 'text-acid' : state === 'past' ? 'text-paper' : 'text-faint';
            return (
              <div
                key={item.time}
                className={`flex h-[64px] w-[148px] flex-col justify-center rounded-xl px-4 transition-colors duration-300 ${box}`}
              >
                <span
                  className={`font-display text-[24px] leading-none font-semibold tabular-nums ${timeColor}`}
                >
                  {item.time}
                </span>
                <span
                  className={`mt-1.5 text-[17px] leading-tight ${
                    state === 'future' ? 'text-faint' : 'text-muted'
                  }`}
                >
                  你：{item.where}
                </span>
              </div>
            );
          })}
        </div>
        <div className="ml-auto flex shrink-0 gap-3">
          <button
            type="button"
            disabled={atEnd}
            onClick={() => {
              setPlaying(false);
              setCursor((value) => Math.min(value + 1, TR_LAST));
            }}
            className={BTN_PRIMARY}
          >
            下一步
          </button>
          <button type="button" onClick={togglePlay} className={BTN_GHOST}>
            {running ? '暫停' : atEnd ? '再播一次' : '自動播放'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setCursor(0);
            }}
            className={BTN_GHOST}
          >
            重來
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 34 頁 · SchedulerDemo — 定時觸發的三種方案
 *
 * callout：查 Claude Code 的 loop、CronCreate、雲端方案 Routines，Codex 有沒有
 * 相關的，畫成圖示介紹。Routines 那段（只支援 Pull request 與 Release、issue
 * 不能直接觸發、網路文章說可以但以官方文件為準、定時最短一小時）照講師原文放進畫面。
 *
 * 版型：講師指定的「左邊是選項，右邊是概念圖」。
 *   左  三個方案（MenuItem），每張附三枚中性小標籤：在哪裡跑、最短間隔、一個特點。
 *   右  情境卡：
 *       標題列  方案編號、名稱、地點標籤、官方文件連結、播放／下一步
 *       左半    代表運作方式的小圖解（可播放）＋ 一行目前狀態
 *                 /loop       session 框裡一個回圈，點每轉一圈觸發一次
 *                 CronCreate  你說一句話 → Claude 呼叫 CronCreate → 排程表多一列 → 觸發
 *                 Routines    雲端裡的 Routine；排程、API、PR、Release 實線箭頭，
 *                             Issue 那條是 coral 虛線並標「目前不支援」
 *       右半    在哪裡跑／怎麼建立／間隔與限制／事件觸發
 *       底部    「Codex 有沒有對應？」對照卡
 *   播放規則同第 22 頁：一進頁面停在最後一格，點了別的方案就從頭自動播一次。
 *
 * 寬度：左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）。
 *       右卡主體 ＝ 圖解 540 ＋ gap 24 ＋ 事實 538。
 * 高度：
 *   左  標籤 26 ＋ gap 16 ＋ 三張選單 flex-1（(678 − 24) ÷ 3 ≈ 218／張；
 *       名稱 34 ＋ 說明兩行 52 ＋ 標籤 32 ＋ 間距 ＋ py 32 ≈ 170，放得下）
 *   右  卡片內高 720 − 2 − 48 ＝ 670
 *       ＝ 標題列 48 ＋ 16 ＋ 主體 420 ＋ 16 ＋ Codex 對照卡 170
 *       主體左半 ＝ 圖解 372 ＋ 8 ＋ 狀態 40；右半四列合計 350–400（各方案的細算在資料旁）
 * ══════════════════════════════════════════════════════════════ */

type SchemeId = 'loop' | 'cron' | 'routines';

/* ── 播放器（同 demos-tradeoffs.tsx 的 usePlayer）────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的選項時）
 * 情境卡用選項 id 當 key，換選項就整張重掛，狀態自然歸零。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode) {
  const [tick, setTick] = useState(mode === 'still' ? last : 0);
  const [playing, setPlaying] = useState(mode === 'play');
  const [run, setRun] = useState(0);

  const atEnd = tick >= last;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setTick((value) => Math.min(value + 1, last)),
      ms,
    );
    return () => window.clearTimeout(timer);
  }, [running, tick, last, ms]);

  const toggle = () => {
    if (atEnd) {
      setTick(0);
      setRun((value) => value + 1);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const step = () => {
    setPlaying(false);
    setTick((value) => Math.min(value + 1, last));
  };

  const label = running ? '暫停' : atEnd ? '重播' : tick === 0 ? '播放' : '繼續';

  return { tick, run, atEnd, toggle, step, label };
}

type Player = ReturnType<typeof usePlayer>;

function PlayerControls({ player }: { player: Player }) {
  return (
    <div className="ml-auto flex shrink-0 gap-3">
      <button type="button" onClick={player.toggle} className={BTN_PRIMARY}>
        {player.label}
      </button>
      <button
        type="button"
        onClick={player.step}
        disabled={player.atEnd}
        className={BTN_GHOST}
      >
        下一步
      </button>
    </div>
  );
}

/** 左側選單的一列（同 demos-tradeoffs.tsx 的 MenuItem，多了一排中性小標籤） */
function MenuItem({
  index,
  name,
  mono,
  sub,
  chips,
  on,
  onClick,
}: {
  index: number;
  name: string;
  mono: boolean;
  sub: string;
  chips: readonly string[];
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
        <span
          className={`leading-tight text-paper ${mono ? 'font-mono text-[26px]' : 'text-[28px]'} ${
            on ? 'font-semibold' : ''
          }`}
        >
          {name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {sub}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-md border border-line bg-panel px-2.5 py-0.5 text-[17px] text-muted"
            >
              {chip}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

/* ── 01 /loop ────────────────────────────────────────────
 * tick ＝ 已經觸發幾次（0–4）。點每轉一圈回到頂端，就是觸發一次。
 * 座標（viewBox 540 × 372，1:1 呈現）：
 *   session 外框 (6, 6) 528 × 360；指令列 y 84、分隔線 y 104
 *   回圈中心 (200, 246) r 92；觸發膠囊在回圈頂端上方 (164, 110) 72 × 32
 *   觸發紀錄 x 324，四列 y 160 起每列 42；最長的「週期任務 7 天後自動過期」寬 188，
 *   右緣 512，跟「關掉就停」的右緣 510 對齊、離外框 22 */

const LOOP_CX = 200;
const LOOP_CY = 246;
const LOOP_R = 92;

/** 回圈頂端：點停在這裡，觸發膠囊在它正上方 */
const LOOP_TOP = LOOP_CY - LOOP_R;

const LOOP_FIRES: readonly { time: string; issue: string }[] = [
  { time: '09:30', issue: '#21' },
  { time: '10:00', issue: '#22' },
  { time: '10:30', issue: '#23' },
  { time: '11:00', issue: '#24' },
];

const LOOP_HEADS: readonly { x: number; y: number; rotate: number }[] = [
  { x: LOOP_CX + 65.1, y: LOOP_CY - 65.1, rotate: 45 },
  { x: LOOP_CX + 65.1, y: LOOP_CY + 65.1, rotate: 135 },
  { x: LOOP_CX - 65.1, y: LOOP_CY + 65.1, rotate: 225 },
  { x: LOOP_CX - 65.1, y: LOOP_CY - 65.1, rotate: 315 },
];

function LoopScene({ tick }: { tick: number }) {
  const fired = tick > 0;
  return (
    <svg width={540} height={372} viewBox="0 0 540 372" role="img" className="shrink-0">
      <title>/loop：在開著的 Claude Code session 裡，每 30 分鐘重跑同一個 prompt</title>

      {/* session 外框 */}
      <rect x={6} y={6} width={528} height={360} rx={22} fill="none" stroke={C.muted} strokeWidth={2} />
      <text x={30} y={42} fontSize={18} fontWeight={600} fill={C.paper}>
        你的電腦 · Claude Code session
      </text>
      <text x={510} y={42} textAnchor="end" fontSize={17} fill={C.muted}>
        關掉就停
      </text>
      <text x={30} y={84} fontSize={18} fill={C.paper} className="font-mono">
        {'> /loop 30m 抓 GitHub 上標 ready 的 issue 來開發'}
      </text>
      <line x1={6} y1={104} x2={534} y2={104} stroke={C.line} strokeWidth={1.5} />

      {/* 回圈 */}
      <circle cx={LOOP_CX} cy={LOOP_CY} r={LOOP_R} fill="none" stroke={C.muted} strokeWidth={2} />
      {LOOP_HEADS.map((head) => (
        <path
          key={head.rotate}
          d="M -9 -8 L 9 0 L -9 8 Z"
          transform={`translate(${head.x} ${head.y}) rotate(${head.rotate})`}
          fill={C.muted}
        />
      ))}
      <text x={LOOP_CX} y={LOOP_CY - 2} textAnchor="middle" fontSize={24} fontWeight={700} fill={C.paper}>
        每 30 分鐘
      </text>
      <text x={LOOP_CX} y={LOOP_CY + 26} textAnchor="middle" fontSize={17} fill={C.muted}>
        重跑同一個 prompt
      </text>

      {/* 走一圈的點：每多觸發一次就轉一整圈，停在頂端 */}
      <g
        style={{
          transform: `rotate(${tick * 360}deg)`,
          transformOrigin: `${LOOP_CX}px ${LOOP_CY}px`,
          transition: 'transform 900ms ease-in-out',
        }}
      >
        <circle cx={LOOP_CX} cy={LOOP_TOP} r={9} fill={C.acid} />
      </g>

      {/* 頂端的觸發膠囊 */}
      <rect
        x={LOOP_CX - 36}
        y={LOOP_TOP - 44}
        width={72}
        height={32}
        rx={16}
        fill={fired ? C.acid : C.inkSoft}
        fillOpacity={fired ? 0.14 : 1}
        stroke={fired ? C.acid : C.line}
        strokeWidth={fired ? 3 : 2}
        className={SVG_TR}
      />
      <text
        x={LOOP_CX}
        y={LOOP_TOP - 22}
        textAnchor="middle"
        fontSize={17}
        fontWeight={600}
        fill={fired ? C.acid : C.muted}
        className={SVG_TR}
      >
        觸發
      </text>

      {/* 觸發紀錄 */}
      <text x={324} y={146} fontSize={17} fill={C.faint}>
        觸發紀錄
      </text>
      {LOOP_FIRES.map((fire, index) => {
        const state = index < tick - 1 ? 'past' : index === tick - 1 ? 'now' : 'future';
        const color = state === 'now' ? C.acid : state === 'past' ? C.paper : C.faint;
        return (
          <text
            key={fire.time}
            x={324}
            y={180 + index * 42}
            fontSize={19}
            fontWeight={state === 'now' ? 700 : 400}
            fill={color}
            className={`font-mono ${SVG_TR}`}
          >
            {fire.time}
            {state === 'future' ? '  等待中' : `  抓到 ${fire.issue}`}
          </text>
        );
      })}
      <text x={324} y={348} fontSize={17} fill={C.muted}>
        週期任務 7 天後自動過期
      </text>
    </svg>
  );
}

/* ── 02 CronCreate ───────────────────────────────────────
 * tick 0 你說一句話 → 1 Claude 呼叫 CronCreate → 2 排程表多一列 → 3 時間到觸發。
 * 高度：一句話 52 ＋ 10 ＋ 工具呼叫 128 ＋ 10 ＋ 排程表 162（表頭 34 ＋ 3 × 42 ＋ 邊框）
 *       ＝ 362 ≤ 372 */

const CRON_ROWS: readonly { id: string; cron: string; prompt: string; kind: string }[] = [
  { id: '7f3a91c2', cron: '*/30 * * * *', prompt: '看 CI 有沒有過', kind: '重複' },
  { id: 'b81e4d07', cron: '30 14 6 10 *', prompt: '提醒推 release 分支', kind: '一次' },
];

const CRON_NEW = { id: 'c4d2e8a1', cron: '3 9 * * 1-5', prompt: '抓新的 issue 來開發', kind: '重複' };

const CRON_GRID = 'grid grid-cols-[104px_146px_1fr_56px] items-center gap-2 px-3';

function CronScene({ tick }: { tick: number }) {
  const rows = tick >= 2 ? [...CRON_ROWS, CRON_NEW] : CRON_ROWS;
  return (
    <div className="flex h-full flex-col gap-2.5">
      {/* 你說的一句話 */}
      <div
        className={`flex h-[52px] shrink-0 items-center gap-3 rounded-xl border border-l-[6px] bg-panel px-4 transition-colors duration-300 ${
          tick === 0 ? 'border-acid/55 border-l-acid' : 'border-line border-l-line'
        }`}
      >
        <span className="rounded-full bg-paper px-3 py-0.5 text-[17px] font-semibold text-on-accent">
          你
        </span>
        <span className="text-[19px] text-paper">平日早上 9 點左右，抓新的 issue 來開發</span>
      </div>

      {/* Claude 呼叫 CronCreate */}
      {tick >= 1 ? (
        <div
          className={`slide-enter h-[128px] shrink-0 rounded-xl border border-l-[6px] bg-ink-soft px-4 py-2.5 font-mono text-[18px] leading-[1.6] whitespace-pre text-paper transition-colors duration-300 ${
            tick === 1 ? 'border-acid/55 border-l-acid' : 'border-line border-l-line'
          }`}
        >
          <p className="font-semibold">
            CronCreate <span className="font-sans text-[17px] font-normal text-muted">Claude 呼叫的工具</span>
          </p>
          <p>{'  cron       "3 9 * * 1-5"'}</p>
          <p>{'  prompt     "抓新的 issue 來開發"'}</p>
          <p>{'  recurring  true'}</p>
        </div>
      ) : (
        <div className="flex h-[128px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-line text-[19px] text-faint">
          Claude 會把這句話換成 cron，呼叫 CronCreate
        </div>
      )}

      {/* session 裡的排程表 */}
      <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-panel">
        <div
          className={`${CRON_GRID} h-[34px] border-l-[6px] border-l-transparent bg-ink-soft text-[17px] text-faint`}
        >
          <span>ID</span>
          <span>cron</span>
          <span>prompt</span>
          <span>類型</span>
        </div>
        {rows.map((row) => {
          const isNew = row.id === CRON_NEW.id;
          const firing = isNew && tick === 3;
          return (
            <div
              key={row.id}
              className={`${CRON_GRID} h-[42px] border-t border-l-[6px] border-t-line-soft transition-colors duration-300 ${
                firing ? 'border-l-acid bg-acid/14' : 'border-l-transparent'
              } ${isNew ? 'slide-enter' : ''}`}
            >
              <span className="font-mono text-[17px] text-muted">{row.id}</span>
              <span className={`font-mono text-[17px] ${firing ? 'font-semibold text-acid' : 'text-paper'}`}>
                {row.cron}
              </span>
              <span className="truncate text-[18px] text-paper">{row.prompt}</span>
              <span className="text-[18px] text-muted">{row.kind}</span>
            </div>
          );
        })}
        {tick < 2 && (
          <div className={`${CRON_GRID} h-[42px] border-t border-l-[6px] border-t-line-soft border-l-transparent text-[17px] text-faint`}>
            <span>—</span>
            <span>—</span>
            {/* prompt 欄只有 178 寬，這句 17px 要 204 —— 跨進「類型」欄（242）才不會折成兩行被裁掉 */}
            <span className="col-span-2 whitespace-nowrap">（新的排程會出現在這裡）</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 03 Routines ─────────────────────────────────────────
 * tick 0 電腦關著、Routine 待命 → 1 排程時間到 → 2 有人開 PR → 3 有人新增 issue（不觸發）。
 * 座標（viewBox 540 × 372，1:1 呈現）：
 *   觸發膠囊 x 8 w 196 h 44：排程 y 8、API y 62；「GitHub 事件」標籤 y 138；
 *     Pull request y 150、Release y 204、Issue 變動 y 258（coral 虛線）
 *   雲端框 (288, 8) 244 × 262：Routine (306, 64) 208 × 92、推到 claude/ 分支 (306, 194) 208 × 56
 *   你的電腦 (300, 296) 起，文字 x 384 */

type RoutineTrigger = 'schedule' | 'api' | 'pr' | 'release' | 'issue';

const RT_TRIGGERS: readonly {
  id: RoutineTrigger;
  y: number;
  text: string;
  to: number;
}[] = [
  { id: 'schedule', y: 8, text: '排程 · 最短 1 小時', to: 92 },
  { id: 'api', y: 62, text: 'API 呼叫', to: 104 },
  { id: 'pr', y: 150, text: 'Pull request', to: 120 },
  { id: 'release', y: 204, text: 'Release', to: 134 },
  { id: 'issue', y: 258, text: 'Issue 變動', to: 0 },
];

const RT_ACTIVE: readonly (RoutineTrigger | null)[] = [null, 'schedule', 'pr', 'issue'];

function RoutineScene({ tick }: { tick: number }) {
  const active = RT_ACTIVE[tick] ?? null;
  const routineOn = active !== null && active !== 'issue';
  const issueOn = active === 'issue';

  return (
    <svg width={540} height={372} viewBox="0 0 540 372" role="img" className="shrink-0">
      <title>Routines：跑在雲端，可以由排程、API、GitHub 的 Pull request 與 Release 觸發；issue 變動目前不支援</title>
      <ArrowMarkers prefix="sch-rt" tones={['muted', 'acid', 'coral']} />

      {/* 雲端框 */}
      <rect x={288} y={8} width={244} height={262} rx={26} fill="none" stroke={C.muted} strokeWidth={2} />
      <text x={308} y={44} fontSize={18} fontWeight={700} fill={C.paper}>
        雲端 · Anthropic
      </text>

      {/* 觸發 → Routine 的箭頭（先畫，讓膠囊與節點蓋在上面） */}
      {RT_TRIGGERS.filter((item) => item.id !== 'issue').map((item) => {
        const on = active === item.id;
        return (
          <path
            key={item.id}
            d={`M 208 ${item.y + 22} L 300 ${item.to}`}
            fill="none"
            stroke={on ? C.acid : C.muted}
            strokeWidth={on ? 3.5 : 2}
            markerEnd={`url(#sch-rt-${on ? 'acid' : 'muted'})`}
            className={SVG_TR}
          />
        );
      })}
      {/* Issue：虛線，到雲端框前就斷掉 */}
      <path
        d="M 208 280 L 258 254"
        fill="none"
        stroke={C.coral}
        strokeWidth={issueOn ? 3.5 : 2.5}
        strokeDasharray="7 6"
        className={SVG_TR}
      />
      <path
        d="M 258 244 L 274 260 M 274 244 L 258 260"
        stroke={C.coral}
        strokeWidth={3.5}
        strokeLinecap="round"
      />

      {/* 觸發膠囊 */}
      <text x={106} y={138} textAnchor="middle" fontSize={17} fill={C.muted}>
        GitHub 事件
      </text>
      {RT_TRIGGERS.map((item) => {
        const isIssue = item.id === 'issue';
        const on = active === item.id;
        const tone = isIssue ? C.coral : on ? C.acid : C.line;
        return (
          <g key={item.id}>
            <rect x={8} y={item.y} width={196} height={44} rx={22} fill={C.panel} />
            <rect
              x={8}
              y={item.y}
              width={196}
              height={44}
              rx={22}
              fill={on ? (isIssue ? C.coral : C.acid) : C.inkSoft}
              fillOpacity={on ? 0.14 : 1}
              stroke={tone}
              strokeWidth={on ? 3.5 : isIssue ? 2.5 : 2}
              strokeDasharray={isIssue ? '7 6' : undefined}
              className={SVG_TR}
            />
            <text
              x={106}
              y={item.y + 29}
              textAnchor="middle"
              fontSize={18}
              fontWeight={600}
              fill={isIssue ? C.coral : on ? C.acid : C.paper}
              className={SVG_TR}
            >
              {item.text}
            </text>
          </g>
        );
      })}
      <text x={106} y={328} textAnchor="middle" fontSize={18} fontWeight={700} fill={C.coral}>
        ✕ 目前不支援
      </text>
      <text x={106} y={354} textAnchor="middle" fontSize={16} fill={C.muted}>
        以官方文件為準
      </text>

      {/* Routine */}
      <rect
        x={306}
        y={64}
        width={208}
        height={92}
        rx={16}
        fill={routineOn ? C.acid : C.inkSoft}
        fillOpacity={routineOn ? 0.14 : 1}
        stroke={routineOn ? C.acid : C.line}
        strokeWidth={routineOn ? 3.5 : 2}
        className={SVG_TR}
      />
      <text
        x={410}
        y={102}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill={routineOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        Routine
      </text>
      <text x={410} y={132} textAnchor="middle" fontSize={16} fill={C.muted}>
        prompt＋repo＋連接器
      </text>

      <path
        d="M 410 160 L 410 188"
        stroke={routineOn ? C.acid : C.muted}
        strokeWidth={routineOn ? 3 : 2}
        markerEnd={`url(#sch-rt-${routineOn ? 'acid' : 'muted'})`}
        className={SVG_TR}
      />
      <rect
        x={306}
        y={194}
        width={208}
        height={56}
        rx={28}
        fill={routineOn ? C.acid : C.inkSoft}
        fillOpacity={routineOn ? 0.14 : 1}
        stroke={routineOn ? C.acid : C.line}
        strokeWidth={routineOn ? 3.5 : 2}
        className={SVG_TR}
      />
      <text x={410} y={228} textAnchor="middle" fontSize={18} fontWeight={600} fill={C.paper}>
        推到 claude/ 分支
      </text>

      {/* 你的電腦：關著 */}
      <rect x={300} y={298} width={64} height={40} rx={5} fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
      <path d="M 290 344 L 374 344" stroke={C.muted} strokeWidth={3} strokeLinecap="round" />
      <text x={332} y={324} textAnchor="middle" fontSize={16} fill={C.muted}>
        z z
      </text>
      <text x={386} y={318} fontSize={18} fontWeight={600} fill={C.paper}>
        你的電腦
      </text>
      <text x={386} y={344} fontSize={17} fill={C.muted}>
        關著也照跑
      </text>
    </svg>
  );
}

/* ── 三個方案的資料 ──────────────────────────────────────
 * 事實欄每列：dt 100 ＋ gap 16 ＋ dd 422（21px 約 20 字一行）、上下 py 10。
 *   /loop       2 行 ＋ (code ＋ 2 行) ＋ 2 行 ＋ 1 行   ≈ 82 ＋ 118 ＋ 82 ＋ 52 ＝ 334
 *   CronCreate  2 行 ＋ 3 行 ＋ 3 行 ＋ 1 行            ≈ 82 ＋ 112 ＋ 112 ＋ 52 ＝ 358
 *   Routines    2 行 ＋ (code ＋ 1 行) ＋ 2 行 ＋ (2 行 ＋ 19px 2 行) ≈ 82 ＋ 88 ＋ 82 ＋ 132 ＝ 384
 * 全部 ≤ 420。 */

const DOCS_SCHEDULED = 'https://code.claude.com/docs/en/scheduled-tasks';
const DOCS_ROUTINES = 'https://code.claude.com/docs/en/routines';
const DOCS_CODEX = 'https://learn.chatgpt.com/docs/automations';

const NOT_EVENT = <span className="font-semibold text-coral">✕ 不能，只依時間觸發</span>;

interface Scheme {
  id: SchemeId;
  name: string;
  mono: boolean;
  sub: string;
  chips: readonly string[];
  where: string;
  docs: string;
  facts: readonly { label: string; body: ReactNode }[];
  status: readonly string[];
  ms: number;
  codex: { verdict: string; lines: readonly ReactNode[] };
}

const SCHEMES: readonly Scheme[] = [
  {
    id: 'loop',
    name: '/loop',
    mono: true,
    sub: '在開著的 session 裡，每隔一段時間重跑同一個 prompt',
    chips: ['本機 session', '最短 1 分鐘', '7 天過期'],
    where: '本機 · session 內',
    docs: DOCS_SCHEDULED,
    facts: [
      { label: '在哪裡跑', body: '你的電腦上、開著的 Claude Code session 裡；關掉 session 就停。' },
      {
        label: '怎麼建立',
        body: (
          <>
            <code className={CODE}>/loop 30m &lt;prompt&gt;</code>
            <span className="mt-2 block">不給間隔：由 Claude 自己決定下一次（1 分鐘～1 小時）。</span>
          </>
        ),
      },
      { label: '間隔與限制', body: '最短 1 分鐘（單位 s／m／h／d）；週期任務 7 天後自動過期。' },
      { label: '事件觸發', body: NOT_EVENT },
    ],
    status: [
      '09:00 下了 /loop 30m，開始計時',
      '09:30 第 1 次觸發：抓到 #21 來開發',
      '10:00 第 2 次觸發：抓到 #22 來開發',
      '10:30 第 3 次觸發：抓到 #23 來開發',
      '11:00 第 4 次觸發：session 開著就一直跑',
    ],
    ms: 1300,
    codex: {
      verdict: 'Codex CLI 沒有',
      lines: [
        '官方文件寫明：Codex CLI 沒有排程介面。',
        '最接近的是 ChatGPT 桌面 app 的「在對話裡排程」：時間到就回到同一個對話、沿用脈絡，可以用分鐘級的間隔。',
        '一樣要開著電腦和 app。',
      ],
    },
  },
  {
    id: 'cron',
    name: 'CronCreate',
    mono: true,
    sub: 'Claude 用來建立排程的工具：用 cron 寫幾點幾分要跑',
    chips: ['本機 session', '最短 1 分鐘', '最多 50 個'],
    where: '本機 · session 內',
    docs: DOCS_SCHEDULED,
    facts: [
      { label: '在哪裡跑', body: '同樣在你電腦上的 session 裡；排程跟著這個 session。' },
      {
        label: '怎麼建立',
        body: (
          <>
            跟 Claude 說一句話，它呼叫 <code className={CODE}>CronCreate</code> 建立；
            <code className={CODE}>CronList</code> 列出、<code className={CODE}>CronDelete</code> 取消。
          </>
        ),
      },
      {
        label: '間隔與限制',
        body: '5 欄 cron、本機時區，最短 1 分鐘；一個 session 最多 50 個，週期任務 7 天後過期。',
      },
      { label: '事件觸發', body: NOT_EVENT },
    ],
    status: [
      '你用一句話說：什麼時候、做什麼',
      'Claude 換成 cron，呼叫 CronCreate',
      '排程表多了一列（ID c4d2e8a1）',
      '平日 09:03 時間到 → 這一列觸發',
    ],
    ms: 1300,
    codex: {
      verdict: '有類似的',
      lines: [
        '在 ChatGPT／Codex 的對話裡說要做什麼、什麼時候跑，它會幫你建立排程任務（舊稱 Automations）。',
        '每次開新對話執行、結果進 Scheduled，進階的週期可以寫 RRULE。',
        '差別：排程存在桌面 app，不跟著 session 消失；要讀本機專案時，電腦和 app 要開著。',
      ],
    },
  },
  {
    id: 'routines',
    name: 'Routines（雲端）',
    mono: false,
    sub: '跑在 Anthropic 的雲端：電腦關著，也會照排程或事件執行',
    chips: ['雲端', '最短 1 小時', 'PR／Release 事件'],
    where: '雲端 · 研究預覽',
    docs: DOCS_ROUTINES,
    facts: [
      { label: '在哪裡跑', body: 'Anthropic 的雲端，每次重新 clone repo；電腦關著也會跑。' },
      {
        label: '怎麼建立',
        body: (
          <>
            <code className={CODE}>/schedule</code>
            <span className="mt-2 block">
              或在網頁{' '}
              <a href="https://claude.ai/code/routines" target="_blank" rel="noreferrer" className={LINK}>
                claude.ai/code/routines ↗
              </a>
            </span>
          </>
        ),
      },
      { label: '間隔與限制', body: '排程最短 1 小時 —— 拿來定時掃 issue，最快也是一小時一次。' },
      {
        label: '事件觸發',
        body: (
          <>
            GitHub 只支援 Pull request、Release；
            <span className="font-semibold text-coral">issue 變動無法直接觸發。</span>
            <span className="mt-1.5 block text-[19px] leading-snug text-muted">
              網路上有些文章寫可以訂 Issues —— 以官方文件為準，目前還不行。
            </span>
          </>
        ),
      },
    ],
    status: [
      '你的電腦關著，Routine 在雲端待命',
      '09:07 排程時間到 → 雲端開新的 session',
      '有人開了 PR → GitHub 事件觸發',
      '有人新增 issue → 不會觸發',
    ],
    ms: 1300,
    codex: {
      verdict: '有：網頁版排程任務',
      lines: [
        'ChatGPT 網頁版的排程任務跑在雲端，不碰你電腦上的資料夾。',
        <>
          依方案可以用事件觸發，GitHub 只支援 Pull request 活動 ——{' '}
          <span className="font-semibold text-coral">一樣沒有 issue。</span>
        </>,
        '另一條路：Codex GitHub Action（openai/codex-action）在 GitHub Actions 裡跑 codex exec。',
      ],
    },
  },
];

function SchemeCard({ index, item, mode }: { index: number; item: Scheme; mode: PlayMode }) {
  const player = usePlayer(item.status.length - 1, item.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} text-acid`}>方案 {pad2(index + 1)}</span>
        <span
          className={`leading-none font-semibold text-paper ${
            item.mono ? 'font-mono text-[28px]' : 'text-[30px]'
          }`}
        >
          {item.name}
        </span>
        <span className="rounded-full border border-line bg-panel-lift px-4 py-1 text-[18px] text-paper">
          {item.where}
        </span>
        <a href={item.docs} target="_blank" rel="noreferrer" className={LINK}>
          官方文件 ↗
        </a>
        <PlayerControls player={player} />
      </div>

      {/* 主體：圖解 ＋ 事實 */}
      <div className="grid h-[420px] shrink-0 grid-cols-[540px_1fr] gap-6">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="h-[372px] shrink-0">
            {item.id === 'loop' && <LoopScene key={player.run} tick={player.tick} />}
            {item.id === 'cron' && <CronScene tick={player.tick} />}
            {item.id === 'routines' && <RoutineScene tick={player.tick} />}
          </div>
          <p className="flex h-10 shrink-0 items-center gap-2 text-[20px] text-paper">
            <span className="font-semibold text-acid">›</span>
            {item.status[player.tick]}
          </p>
        </div>

        <dl className="flex min-h-0 flex-col">
          {item.facts.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[100px_1fr] gap-4 border-b border-line-soft py-2.5 last:border-b-0"
            >
              <dt className={`${LABEL_FAINT} pt-1`}>{fact.label}</dt>
              <dd className="text-[21px] leading-snug text-paper">{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Codex 對照卡 */}
      <div className="flex min-h-0 flex-1 gap-6 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6 py-4">
        <div className="flex w-[230px] shrink-0 flex-col gap-1.5">
          <span className={LABEL_FAINT}>Codex 有沒有對應？</span>
          <span className="text-[24px] leading-snug font-semibold text-paper">
            {item.codex.verdict}
          </span>
          <a href={DOCS_CODEX} target="_blank" rel="noreferrer" className={`${LINK} mt-auto`}>
            Codex 官方文件 ↗
          </a>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[20px] leading-normal text-paper">
          {item.codex.lines.map((line, lineIndex) => (
            <p key={lineIndex}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SchedulerDemo() {
  const [picked, setPicked] = useState<SchemeId>('loop');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    SCHEMES.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：三種方案 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>定時觸發的三種方案 · Claude Code</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {SCHEMES.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              mono={item.mono}
              sub={item.sub}
              chips={item.chips}
              on={item.id === picked}
              onClick={() => {
                setPicked(item.id);
                setTouched(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 右：概念圖 ───────────────────────────────────── */}
      <SchemeCard
        key={picked}
        index={index}
        item={SCHEMES[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
