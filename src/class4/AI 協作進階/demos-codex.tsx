import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第三章 實際使用 SubAgent：ChatGPT（Codex）
 *
 *   第 18 頁  CodexTypesDemo    ChatGPT（Codex）的 SubAgent 分類
 *   第 19 頁  CodexInvokeDemo   ChatGPT（Codex）的 SubAgent 呼叫方式
 *
 * 版型是講師指定的「左邊是選單，右邊是示意圖」：左欄可點的選單（照 callout
 * 表格的分類分組），右欄是「ChatGPT 桌面版的 Codex」風格的 HTML 模擬介面
 * （左側 thread 清單、中間對話、下方輸入框）。介面裡不放任何 logo 或商標
 * 圖形，標題列只寫「ChatGPT · Codex」。
 *
 * 文件依據（developers.openai.com/codex/subagents，現在轉址到
 * learn.chatgpt.com/docs/agent-configuration/subagents）：
 *   - 內建三個 agent：default（general-purpose fallback）、worker
 *     （execution-focused，實作與修正）、explorer（read-heavy 的程式碼探索）
 *   - 自訂 agent 是 ~/.codex/agents/ 或 .codex/agents/ 底下的 TOML 檔
 *   - 本機 Codex 只在你直接要求、或 AGENTS.md／skill 指示要求時才委派；
 *     ChatGPT Work 只有 Ultra 等級會主動委派
 *   - Codex app 的側欄把 subagent 的 thread 分成 Active 與 Done 兩區
 *   模擬介面裡的 Active／Done 就是照這一條畫的，其餘版面是示意。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（callout 沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 所有 thread 名稱、使用者對話、主 Agent 的回覆、SubAgent 的工作步驟與回報內容
 *     （CI 失敗、login.test.ts、payment API、PR #42 …）
 *   - 第 18 頁「沒指定角色就派出 default」：文件只寫 default 是 fallback，
 *     沒指定角色時派出的就是它是依此推論的
 *   - 第 18 頁自訂型的 agent 名稱 reviewer 與 .codex/agents/reviewer.toml
 *   - 第 19 頁「直接要求產生 agent」：表格範例是片語「spawn two agents…」，
 *     輸入框裡打的整句 prompt 後半段是補的；範例原文另外放在右上的「範例」條
 *   - 第 19 頁 AGENTS.md 的內容（## Code review 與那一條規則）
 *   - 第 19 頁左欄每一項的說明句（表格只有分類、呼叫方式、範例三欄），
 *     只有 AGENTS.md 那一項是照表格原文
 *
 * 用色（每頁兩支強調色）：
 *   acid   目前選取、主 Agent、prompt 裡觸發委派的關鍵字
 *   teal   SubAgent（執行中、完成、回報）
 *   其他一律中性。淡底（/14）一律配 6px 不透明左粗條或實色邊框。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 左欄 540、gap 32、右欄約 1168。沒有任何容器會捲動。各頁的細算寫在各自的區塊。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-5 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid`;

/** 對話推進一格的時間 */
const TICK_MS = 750;
/** 打字動畫每一個字的時間 */
const TYPE_MS = 45;

/** 模擬介面側欄裡，除了目前這一則之外的其他 thread */
const OTHER_THREADS = ['首頁改版', '週報整理'] as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 左欄：分組選單 ─────────────────────────────────────── */

interface MenuEntry {
  group: string;
  name: string;
  sub: string;
  mono?: boolean;
}

/** 左側選單的一列。寫法同 demos-subagent.tsx 的 MenuItem，高度收到 96 才放得下分組小標 */
function MenuItem({
  index,
  entry,
  on,
  onClick,
}: {
  index: number;
  entry: MenuEntry;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-[96px] w-full items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-3 text-left transition-colors duration-200 ${
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
      <span className="flex min-w-0 flex-col gap-1">
        <span
          className={`text-[26px] leading-tight text-paper ${entry.mono ? 'font-mono' : ''} ${
            on ? 'font-semibold' : ''
          }`}
        >
          {entry.name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {entry.sub}
        </span>
      </span>
    </button>
  );
}

/** 依 entry.group 把連續的項目分成一組，組名當小標 */
function GroupedMenu({
  entries,
  current,
  onPick,
}: {
  entries: readonly MenuEntry[];
  current: number;
  onPick: (index: number) => void;
}) {
  const groups: { name: string; members: { entry: MenuEntry; index: number }[] }[] = [];
  entries.forEach((entry, index) => {
    const last = groups.at(-1);
    if (last && last.name === entry.group) last.members.push({ entry, index });
    else groups.push({ name: entry.group, members: [{ entry, index }] });
  });

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <div className="flex h-6 items-center gap-3">
            <span className="text-[17px] font-semibold tracking-wide text-muted">
              {group.name}
            </span>
            <span className="h-px flex-1 bg-line-soft" />
          </div>
          {group.members.map(({ entry, index }) => (
            <MenuItem
              key={index}
              index={index}
              entry={entry}
              on={index === current}
              onClick={() => onPick(index)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── 右欄：ChatGPT · Codex 模擬介面 ─────────────────────── */

type AgentStatus = 'running' | 'done';

interface SideAgent {
  name: string;
  mono: boolean;
  status: AgentStatus;
}

function SideGroup({ label, agents }: { label: string; agents: readonly SideAgent[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[17px] text-faint">{label}</span>
      {agents.length === 0 ? (
        <span className="pl-3 text-[17px] text-faint">—</span>
      ) : (
        agents.map((agent) => (
          <span
            key={agent.name}
            className="slide-enter flex items-center gap-2.5 pl-3 text-[18px] text-paper"
          >
            {agent.status === 'running' ? (
              <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-teal" />
            ) : (
              <span className="w-2.5 shrink-0 font-semibold text-teal">✓</span>
            )}
            <span className={`truncate ${agent.mono ? 'font-mono' : ''}`}>{agent.name}</span>
          </span>
        ))
      )}
    </div>
  );
}

function CodexSidebar({ thread, agents }: { thread: string; agents: readonly SideAgent[] }) {
  return (
    <aside className="flex w-[250px] shrink-0 flex-col gap-2 border-r border-line bg-ink-soft px-4 py-5">
      <span className="rounded-lg border border-line bg-panel px-3 py-2 text-[18px] text-paper">
        ＋ 新對話
      </span>
      <span className={`mt-3 ${LABEL_FAINT}`}>對話</span>
      {[thread, ...OTHER_THREADS].map((title, index) => (
        <span
          key={title}
          className={`truncate rounded-lg px-3 py-1.5 text-[18px] ${
            index === 0 ? 'bg-panel font-medium text-paper' : 'text-muted'
          }`}
        >
          {title}
        </span>
      ))}
      <span className={`mt-4 ${LABEL_FAINT}`}>SubAgent</span>
      <SideGroup label="Active" agents={agents.filter((agent) => agent.status === 'running')} />
      <SideGroup label="Done" agents={agents.filter((agent) => agent.status === 'done')} />
    </aside>
  );
}

/** 整個模擬視窗：標題列 44 ＋ 側欄 250 ＋ 對話區 */
function CodexWindow({
  thread,
  agents,
  chatClass,
  children,
}: {
  thread: string;
  agents: readonly SideAgent[];
  chatClass: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-5">
        <span className="size-3.5 rounded-full bg-line" />
        <span className="size-3.5 rounded-full bg-line" />
        <span className="size-3.5 rounded-full bg-line" />
        <span className="ml-4 text-[17px] text-faint">ChatGPT · Codex</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <CodexSidebar thread={thread} agents={agents} />
        <div className={`flex min-w-0 flex-1 flex-col px-7 ${chatClass}`}>{children}</div>
      </div>
    </div>
  );
}

/** 把 prompt 切成「一般字」與「關鍵字」兩種片段，再依打字進度截斷 */
function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function visibleSegments(text: string, marks: readonly string[], limit: number) {
  const parts =
    marks.length === 0
      ? [text]
      : text.split(new RegExp(`(${marks.map(escapeRegExp).join('|')})`, 'g'));
  const out: { text: string; mark: boolean }[] = [];
  let left = limit;
  for (const part of parts) {
    if (left <= 0) break;
    if (part === '') continue;
    const shown = part.slice(0, left);
    out.push({ text: shown, mark: marks.includes(part) });
    left -= shown.length;
  }
  return out;
}

function MarkedText({
  text,
  marks,
  limit = text.length,
}: {
  text: string;
  marks: readonly string[];
  limit?: number;
}) {
  return (
    <>
      {visibleSegments(text, marks, limit).map((segment, index) =>
        segment.mark ? (
          <span key={index} className="font-semibold text-acid">
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function UserBubble({ mono = false, children }: { mono?: boolean; children: ReactNode }) {
  return (
    <div
      className={`slide-enter max-w-[86%] self-end rounded-2xl bg-ink-soft px-5 py-3 text-paper ${
        mono ? 'font-mono text-[20px] leading-[1.5]' : 'text-[22px] leading-normal'
      }`}
    >
      {children}
    </div>
  );
}

function MainMessage({ children }: { children: ReactNode }) {
  return (
    <div className="slide-enter flex max-w-[94%] items-baseline gap-4 self-start rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-5 py-3">
      <span className={`${LABEL_TYPE} shrink-0 text-acid`}>主 Agent</span>
      <p className="text-[22px] leading-normal text-paper">{children}</p>
    </div>
  );
}

function StatusChip({ status }: { status: AgentStatus }) {
  if (status === 'running') {
    return (
      <span className="ml-auto flex shrink-0 items-center gap-2 rounded-full border-2 border-teal px-3 py-0.5 text-[17px] font-semibold text-teal">
        <span className="size-2.5 animate-pulse rounded-full bg-teal" />
        執行中
      </span>
    );
  }
  return (
    <span className="ml-auto shrink-0 rounded-full border-2 border-teal bg-teal px-3 py-0.5 text-[17px] font-semibold text-on-accent">
      完成
    </span>
  );
}

/** SubAgent 卡片。wide＝整列一張（多一個 SubAgent 標籤），否則是並排的窄卡 */
function AgentCard({
  name,
  mono,
  status,
  wide,
  result,
  children,
}: {
  name: string;
  mono: boolean;
  status: AgentStatus;
  wide: boolean;
  result: string;
  children: ReactNode;
}) {
  const done = status === 'done';
  return (
    <div
      className={`slide-enter flex min-w-0 flex-col gap-2 rounded-2xl border border-l-[6px] border-l-teal transition-colors duration-300 ${
        wide ? 'px-5 py-3.5' : 'px-4 py-3'
      } ${done ? 'border-teal bg-teal/14' : 'border-teal/55 bg-panel'}`}
    >
      <div className="flex items-center gap-3">
        {wide && <span className={`${LABEL_TYPE} shrink-0 text-teal`}>SubAgent</span>}
        <span
          className={`min-w-0 truncate text-[22px] font-semibold text-paper ${mono ? 'font-mono' : ''}`}
        >
          {name}
        </span>
        <StatusChip status={status} />
      </div>
      {children}
      <p
        className={`text-[19px] leading-snug font-semibold text-teal ${done ? '' : 'invisible'}`}
      >
        {wide ? '→ 回報主 Agent：' : '回報：'}
        {result}
      </p>
    </div>
  );
}

function InputBox({ ready, children }: { ready: boolean; children: ReactNode }) {
  return (
    <div className="mt-auto flex min-h-[60px] shrink-0 items-center gap-4 rounded-2xl border border-line bg-panel px-5 py-2.5">
      <div className="min-w-0 flex-1">{children}</div>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full border text-[20px] transition-colors duration-200 ${
          ready ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        ↑
      </span>
    </div>
  );
}

function Placeholder() {
  return <span className="text-[20px] text-faint">輸入訊息…</span>;
}

/* ══════════════════════════════════════════════════════════════
 * 第 18 頁 · CodexTypesDemo — ChatGPT（Codex）的 SubAgent 分類
 *
 * callout：「AI Coding Tool SubAgent - ChatGPT。左邊列出選單，右邊提供示意圖」
 *   | 分類       | Subagent           | 用途                 | 自動觸發時機 |
 *   | 通用型     | default            | 通用的備援 agent     | 本機 Codex 不會；ChatGPT Work 只有 Ultra 等級會主動委派 |
 *   | 內建專用型 | worker             | 專注實作與修正       | 不會 |
 *   | 內建專用型 | explorer           | 大量閱讀的程式碼探索 | 不會 |
 *   | 自訂型     | 你自己定義的 agent | 依你的設定           | 不會 |
 *
 * 左：照分類分三組、共四項；底下一條提示框點出這頁的重點 ——
 *     跟 Claude Code 不同，Codex 幾乎不會自己派 SubAgent，要你明確要求。
 * 右上：用途、自動觸發時機兩格 ＋ 重播。
 * 右下：Codex 模擬介面。選一項就自動播一次「你要求 → 主 Agent 派出 →
 *     SubAgent 工作 → 回報 → 主 Agent 彙整」，每個角色的情境照它的用途寫。
 *     tick 1 你的要求、2 主 Agent 派出、3–4 SubAgent 兩步工作、5 回報、6 彙整。
 *
 * 用色：acid（選取、主 Agent）＋ teal（SubAgent）。
 * 高度預算：
 *   左欄  標籤 24 ＋ 12 ＋ 三組（24＋8＋96｜24＋8＋96＋8＋96｜24＋8＋96）＋ 組距 24
 *         ＝ 548，提示框約 140 貼底，合計約 700。
 *   右欄  資訊條 128 ＋ 16 ＋ 模擬視窗 576。視窗扣標題列 44、上下 padding 48，
 *         對話區 484：你 57 ＋ 主 Agent 59 ＋ SubAgent 卡 170 ＋ 彙整 59
 *         ＋ 輸入框 60 ＋ 間距 4 × 12 ＝ 453。
 * ══════════════════════════════════════════════════════════════ */

type CodexTypeId = 'default' | 'worker' | 'explorer' | 'custom';

interface CodexType extends MenuEntry {
  id: CodexTypeId;
  use: string;
  auto: { main: string; note: string };
  scene: {
    thread: string;
    ask: string;
    marks: readonly string[];
    reply: string;
    agent: string;
    steps: readonly [string, string];
    result: string;
    summary: string;
  };
}

const CODEX_TYPES: readonly CodexType[] = [
  {
    id: 'default',
    group: '通用型',
    name: 'default',
    mono: true,
    sub: '通用的備援 agent',
    use: '通用的備援 agent',
    auto: { main: '本機 Codex 不會', note: 'ChatGPT Work：只有 Ultra 等級會主動委派' },
    scene: {
      thread: '查 CI 失敗原因',
      ask: '開一個 agent 幫我查 CI 為什麼在 Node 22 上失敗。',
      marks: [],
      reply: '好，派出 1 個 agent 去查，查完跟你說。',
      agent: 'default',
      steps: ['讀取 .github/workflows/ci.yml', '比對 Node 22 的錯誤 log'],
      result: '有個套件還不支援 Node 22，升級就能解決',
      summary: '查到了：是套件版本的問題，要我直接幫你升級嗎？',
    },
  },
  {
    id: 'worker',
    group: '內建專用型',
    name: 'worker',
    mono: true,
    sub: '專注實作與修正',
    use: '專注實作與修正',
    auto: { main: '不會', note: '要你明確要求才會派出' },
    scene: {
      thread: '修登入測試',
      ask: '請派 worker 修好 login.test.ts 裡那 2 個失敗的測試。',
      marks: ['worker'],
      reply: '好，派 worker 去修，修完我再確認一次。',
      agent: 'worker',
      steps: ['修改 src/auth/session.ts', '重跑 login.test.ts'],
      result: '2 個失敗的測試都修好了，改了 1 個檔案',
      summary: 'worker 修好了：2 個測試都通過，我再跑一次確認。',
    },
  },
  {
    id: 'explorer',
    group: '內建專用型',
    name: 'explorer',
    mono: true,
    sub: '大量閱讀的程式碼探索',
    use: '大量閱讀的程式碼探索',
    auto: { main: '不會', note: '要你明確要求才會派出' },
    scene: {
      thread: '找 payment API',
      ask: '用 explorer 找出專案裡所有呼叫 payment API 的地方。',
      marks: ['explorer'],
      reply: '好，派 explorer 去讀程式碼，整理好再給你。',
      agent: 'explorer',
      steps: ['讀了 46 個檔案', '追出 3 條呼叫 payment API 的路徑'],
      result: '集中在 checkout/ 與 billing/ 兩個資料夾',
      summary: '整理好了：payment API 只在 3 個地方被呼叫。',
    },
  },
  {
    id: 'custom',
    group: '自訂型',
    name: '你自己定義的 agent',
    sub: '依你的設定',
    use: '依你的設定',
    auto: { main: '不會', note: '要你明確要求才會派出' },
    scene: {
      thread: '審查 PR #42',
      ask: '讓 reviewer 看一下這個 PR 有沒有實際風險。',
      marks: ['reviewer'],
      reply: '好，派你設定好的 reviewer 去審查。',
      agent: 'reviewer',
      steps: ['照 .codex/agents/reviewer.toml 的指示', '檢查這個 PR 改到的 5 個檔案'],
      result: '2 個實際風險：少了權限檢查、錯誤沒被處理',
      summary: 'reviewer 回報 2 個實際風險，我整理成清單給你。',
    },
  },
];

const TYPES_END = 6;

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-1.5 rounded-2xl border border-line bg-panel-lift px-6">
      <span className={LABEL_FAINT}>{label}</span>
      {children}
    </div>
  );
}

function TypesScene({ item }: { item: CodexType }) {
  const [tick, setTick] = useState(1);

  useEffect(() => {
    if (tick >= TYPES_END) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [tick]);

  const { scene } = item;
  const status: AgentStatus | null = tick < 3 ? null : tick < 5 ? 'running' : 'done';

  return (
    <CodexWindow
      thread={scene.thread}
      agents={status ? [{ name: scene.agent, mono: true, status }] : []}
      chatClass="gap-3 py-6"
    >
      <UserBubble>
        <MarkedText text={scene.ask} marks={scene.marks} />
      </UserBubble>
      {tick >= 2 && <MainMessage>{scene.reply}</MainMessage>}
      {status && (
        <AgentCard name={scene.agent} mono status={status} wide result={scene.result}>
          {scene.steps.map((step, index) => (
            <p
              key={step}
              className={`font-mono text-[19px] leading-snug text-muted ${
                tick >= 3 + index ? '' : 'invisible'
              }`}
            >
              {'⎿ '}
              {step}
            </p>
          ))}
        </AgentCard>
      )}
      {tick >= TYPES_END && <MainMessage>{scene.summary}</MainMessage>}
      <InputBox ready={false}>
        <Placeholder />
      </InputBox>
    </CodexWindow>
  );
}

export function CodexTypesDemo() {
  const [picked, setPicked] = useState(0);
  const [run, setRun] = useState(0);
  const current = CODEX_TYPES[picked] ?? CODEX_TYPES[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：四種 SubAgent ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <span className={LABEL_FAINT}>Codex 的 SubAgent 分類</span>
        <GroupedMenu entries={CODEX_TYPES} current={picked} onPick={setPicked} />
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-5">
          <p className={`${LABEL_TYPE} text-acid`}>跟 Claude Code 不同</p>
          <p className="mt-2 text-[24px] leading-normal text-paper">
            Codex 幾乎不會自己派 SubAgent，
            <br />
            要你<span className="font-semibold text-acid">明確要求</span>。
          </p>
        </div>
      </div>

      {/* ── 右：用途、觸發時機 ＋ 模擬介面 ────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="grid h-[128px] shrink-0 grid-cols-[1fr_1fr_auto] gap-3">
          <InfoCell label="用途">
            <span className="text-[26px] leading-tight font-semibold text-paper">
              {current.use}
            </span>
          </InfoCell>
          <InfoCell label="自動觸發時機">
            <span className="text-[26px] leading-tight font-semibold text-paper">
              {current.auto.main}
            </span>
            <span className="text-[19px] leading-snug text-muted">{current.auto.note}</span>
          </InfoCell>
          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className={`${BTN_GHOST} self-center`}
          >
            ↻ 重播
          </button>
        </div>
        <div key={`${current.id}-${run}`} className="slide-enter min-h-0 flex-1">
          <TypesScene item={current} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 19 頁 · CodexInvokeDemo — ChatGPT（Codex）的 SubAgent 呼叫方式
 *
 * callout：「AI Coding Tool SubAgent 的呼叫方式 - ChatGPT。左邊列出選單，右邊
 * 提供示意圖（介面可用 ChatGPT Desktop Codex 來示意）。劃掉的可以不用」
 *   | 分類       | 呼叫方式                     | 範例 |
 *   | 通用型     | 直接要求產生 agent           | spawn two agents…、delegate this work in parallel |
 *   | 通用型     | 依角色拆分                   | 用平行 subagent 審查這個 branch：一個看資安、一個看測試缺口、一個看可維護性 |
 *   | 內建專用型 | 在 prompt 中點名             | 用 explorer 先摸清楚相關的程式路徑 |
 *   | 自訂型     | 在 prompt 中點名             | 讓 pr_explorer 找出受影響的程式路徑，reviewer 找出實際風險 |
 *   | 所有類型   | 寫進 AGENTS.md 或 skill 指示 | 在指示檔中要求特定任務必須委派 |
 *   （劃掉的「一個要點配一個 agent」不放。）
 *
 * 左：照分類分四組、共五項。
 * 右上：「範例」條放表格的範例原文（prompt 用等寬字）＋ 重播。
 * 右下：Codex 模擬介面。選一項就把範例 prompt 逐字打進輸入框 → 送出 →
 *     主 Agent 回覆 → 派出的 agent 卡片（數量與角色照範例：依角色拆分是 3 張
 *     並排）→ 依序回報 → 主 Agent 彙整。prompt 裡觸發委派的字用 acid 標出來。
 *     「寫進 AGENTS.md」那一項，對話區最上面先擺一段 AGENTS.md，
 *     你的 prompt 完全沒提到 agent，主 Agent 照檔案裡的規則自己委派；
 *     主 Agent 回覆時那一條規則亮起來。
 *
 * 時間軸：打字每字 45ms → 停 600ms 送出（tick 1）→ 每 750ms 一格：
 *     2 主 Agent 回覆、3 派出、各 agent 依 done 回報、最後一格彙整。
 *
 * 用色：acid（選取、主 Agent、prompt 裡的關鍵字、AGENTS.md 的規則）＋ teal（SubAgent）。
 * 高度預算：
 *   左欄  標籤 24 ＋ 12 ＋ 四組（24＋8＋96＋8＋96｜24＋8＋96｜24＋8＋96｜24＋8＋96）
 *         ＋ 組距 36 ＝ 688。
 *   右欄  範例條 64 ＋ 16 ＋ 模擬視窗 640。視窗扣標題列 44、上下 padding 40，
 *         對話區 556，間距 10：
 *         依角色拆分（最寬）  你 84（兩行）＋ 主 Agent 59 ＋ 三張卡 172 ＋ 彙整 59
 *                             ＋ 輸入框 60 ＋ 間距 50 ＝ 484
 *         AGENTS.md（最高）   檔案 116 ＋ 你 54 ＋ 主 Agent 59 ＋ 寬卡 134 ＋ 彙整 59
 *                             ＋ 輸入框 60 ＋ 間距 60 ＝ 542
 * ══════════════════════════════════════════════════════════════ */

type InvokeId = 'spawn' | 'roles' | 'builtin' | 'custom' | 'agents-md';

interface InvokeAgent {
  name: string;
  mono: boolean;
  task: string;
  result: string;
  /** 第幾個 tick 回報 */
  done: number;
}

interface InvokeEntry extends MenuEntry {
  id: InvokeId;
  /** 表格的範例原文 */
  example: string;
  /** 範例本身是一句 prompt（用等寬字） */
  examplePrompt: boolean;
  thread: string;
  /** 打進輸入框的那一句 */
  prompt: string;
  /** prompt 裡觸發委派的字 */
  marks: readonly string[];
  /** 對話區上方先擺一段 AGENTS.md */
  memo: boolean;
  reply: string;
  agents: readonly InvokeAgent[];
  summary: string;
}

const INVOKES: readonly InvokeEntry[] = [
  {
    id: 'spawn',
    group: '通用型',
    name: '直接要求產生 agent',
    sub: '在 prompt 裡直接說要開幾個 agent',
    example: 'spawn two agents…、delegate this work in parallel',
    examplePrompt: true,
    thread: '錯誤處理檢查',
    prompt: 'spawn two agents：一個看 checkout、一個看 billing 的錯誤處理',
    marks: ['spawn two agents'],
    memo: false,
    reply: '好，開 2 個 agent 分頭處理，結果回來我再彙整。',
    agents: [
      {
        name: 'default · 1',
        mono: true,
        task: '看 checkout 的錯誤處理',
        result: '有 1 處錯誤被直接吞掉',
        done: 5,
      },
      {
        name: 'default · 2',
        mono: true,
        task: '看 billing 的錯誤處理',
        result: '沒有發現問題',
        done: 4,
      },
    ],
    summary: '2 個 agent 都回報了：checkout 有 1 處要補錯誤處理。',
  },
  {
    id: 'roles',
    group: '通用型',
    name: '依角色拆分',
    sub: '一個面向一個 agent，平行處理',
    example: '用平行 subagent 審查這個 branch：一個看資安、一個看測試缺口、一個看可維護性',
    examplePrompt: true,
    thread: '審查 feature 分支',
    prompt: '用平行 subagent 審查這個 branch：一個看資安、一個看測試缺口、一個看可維護性',
    marks: ['平行 subagent'],
    memo: false,
    reply: '好，派 3 個 subagent 平行審查，全部回來後依類別整理。',
    agents: [
      { name: '資安', mono: false, task: '檢查資安風險', result: 'API 金鑰寫死在設定檔裡', done: 5 },
      {
        name: '測試缺口',
        mono: false,
        task: '找出沒被測到的地方',
        result: '付款失敗的流程沒有測試',
        done: 6,
      },
      {
        name: '可維護性',
        mono: false,
        task: '檢查可維護性',
        result: 'OrderService 超過 800 行',
        done: 4,
      },
    ],
    summary: '3 位都回報了，我依資安、測試、可維護性分類整理。',
  },
  {
    id: 'builtin',
    group: '內建專用型',
    name: '在 prompt 中點名',
    sub: '直接叫內建的 explorer、worker',
    example: '用 explorer 先摸清楚相關的程式路徑',
    examplePrompt: true,
    thread: '摸清程式路徑',
    prompt: '用 explorer 先摸清楚相關的程式路徑',
    marks: ['explorer'],
    memo: false,
    reply: '好，先派 explorer 去讀相關的程式碼。',
    agents: [
      {
        name: 'explorer',
        mono: true,
        task: '摸清楚相關的程式路徑',
        result: '找到 3 條相關路徑：routes → service → repository',
        done: 5,
      },
    ],
    summary: '路徑整理好了，接下來要從哪一條開始改？',
  },
  {
    id: 'custom',
    group: '自訂型',
    name: '在 prompt 中點名',
    sub: '點名你自己定義的 agent',
    example: '讓 pr_explorer 找出受影響的程式路徑，reviewer 找出實際風險',
    examplePrompt: true,
    thread: '審查 PR #42',
    prompt: '讓 pr_explorer 找出受影響的程式路徑，reviewer 找出實際風險',
    marks: ['pr_explorer', 'reviewer'],
    memo: false,
    reply: '好，派 pr_explorer 和 reviewer 分頭處理。',
    agents: [
      {
        name: 'pr_explorer',
        mono: true,
        task: '找出受影響的程式路徑',
        result: '影響 2 條路徑：登入、重設密碼',
        done: 4,
      },
      {
        name: 'reviewer',
        mono: true,
        task: '找出實際風險',
        result: '重設密碼的 token 沒有設期限',
        done: 6,
      },
    ],
    summary: '兩位都回報了：重設密碼那條路徑有 1 個實際風險。',
  },
  {
    id: 'agents-md',
    group: '所有類型',
    name: '寫進 AGENTS.md 或 skill 指示',
    sub: '在指示檔中要求特定任務必須委派',
    example: '在指示檔中要求特定任務必須委派',
    examplePrompt: false,
    thread: '審查 PR #57',
    prompt: '幫我審查這個 PR。',
    marks: [],
    memo: true,
    reply: '照 AGENTS.md 規定，先派 explorer 找出受影響的路徑。',
    agents: [
      {
        name: 'explorer',
        mono: true,
        task: '找出這個 PR 影響的程式路徑',
        result: '影響 2 條路徑：購物車、結帳',
        done: 5,
      },
    ],
    summary: '路徑找到了，我接著逐一審查這 2 條路徑。',
  },
];

/** 卡片欄數。寫成完整字串，Tailwind 才掃得到 */
const AGENT_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

/** 「寫進 AGENTS.md」那一項，對話區上方的檔案片段（內容是補的示意） */
function AgentsMdCard({ hot }: { hot: boolean }) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5 rounded-xl border border-line bg-ink-soft px-5 py-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[19px] font-semibold text-paper">AGENTS.md</span>
        <span className="text-[17px] text-faint">專案根目錄的指示檔</span>
      </div>
      <p className="font-mono text-[19px] leading-snug text-muted">## Code review</p>
      <p
        className={`border-l-[6px] pl-3 font-mono text-[19px] leading-snug transition-colors duration-300 ${
          hot ? 'border-l-acid font-semibold text-acid' : 'border-l-line text-paper'
        }`}
      >
        - 審查 PR 時，一律派 explorer 先找出受影響的程式路徑
      </p>
    </div>
  );
}

function InvokeScene({ item }: { item: InvokeEntry }) {
  const [typed, setTyped] = useState(0);
  const [tick, setTick] = useState(0);

  const typing = typed < item.prompt.length;
  const endTick = Math.max(...item.agents.map((agent) => agent.done)) + 1;

  useEffect(() => {
    if (typing) {
      const timer = window.setTimeout(
        () => setTyped((value) => value + 1),
        typed === 0 ? 500 : TYPE_MS,
      );
      return () => window.clearTimeout(timer);
    }
    if (tick >= endTick) return;
    const timer = window.setTimeout(
      () => setTick((value) => value + 1),
      tick === 0 ? 600 : TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [typing, typed, tick, endTick]);

  const sent = tick >= 1;
  const statuses: (AgentStatus | null)[] = item.agents.map((agent) =>
    tick < 3 ? null : tick < agent.done ? 'running' : 'done',
  );
  const sideAgents: SideAgent[] = item.agents.flatMap((agent, index) => {
    const status = statuses[index];
    return status ? [{ name: agent.name, mono: agent.mono, status }] : [];
  });
  const wide = item.agents.length === 1;

  return (
    <CodexWindow thread={item.thread} agents={sideAgents} chatClass="gap-2.5 py-5">
      {item.memo && <AgentsMdCard hot={tick >= 2} />}
      {sent && (
        <UserBubble mono>
          <MarkedText text={item.prompt} marks={item.marks} />
        </UserBubble>
      )}
      {tick >= 2 && <MainMessage>{item.reply}</MainMessage>}
      {tick >= 3 && (
        <div className={`grid gap-3 ${AGENT_COLS[item.agents.length] ?? 'grid-cols-3'}`}>
          {item.agents.map((agent, index) => (
            <AgentCard
              key={agent.name}
              name={agent.name}
              mono={agent.mono}
              status={statuses[index] ?? 'running'}
              wide={wide}
              result={agent.result}
            >
              <p className="text-[19px] leading-snug text-muted">任務：{agent.task}</p>
            </AgentCard>
          ))}
        </div>
      )}
      {tick >= endTick && <MainMessage>{item.summary}</MainMessage>}
      <InputBox ready={!typing && !sent}>
        {sent || typed === 0 ? (
          <Placeholder />
        ) : (
          <p className="font-mono text-[20px] leading-[1.5] text-paper">
            <MarkedText text={item.prompt} marks={item.marks} limit={typed} />
            {typing && <span className="animate-pulse text-acid">▌</span>}
          </p>
        )}
      </InputBox>
    </CodexWindow>
  );
}

export function CodexInvokeDemo() {
  const [picked, setPicked] = useState(0);
  const [run, setRun] = useState(0);
  const current = INVOKES[picked] ?? INVOKES[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：五種呼叫方式 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <span className={LABEL_FAINT}>Codex 的 SubAgent 呼叫方式</span>
        <GroupedMenu entries={INVOKES} current={picked} onPick={setPicked} />
      </div>

      {/* ── 右：範例 ＋ 模擬介面 ───────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex h-16 shrink-0 items-center gap-5 rounded-2xl border border-line bg-panel-lift pr-2 pl-6">
          <span className={`${LABEL_FAINT} shrink-0`}>範例</span>
          <span
            className={`min-w-0 flex-1 text-[20px] leading-snug text-paper ${
              current.examplePrompt ? 'font-mono' : ''
            }`}
          >
            {current.example}
          </span>
          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className={`${BTN_GHOST} shrink-0`}
          >
            ↻ 重播
          </button>
        </div>
        <div key={`${current.id}-${run}`} className="slide-enter min-h-0 flex-1">
          <InvokeScene item={current} />
        </div>
      </div>
    </div>
  );
}
