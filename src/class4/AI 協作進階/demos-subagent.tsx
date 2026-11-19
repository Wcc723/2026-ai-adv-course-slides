import { useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第一章 SubAgent 是什麼
 *
 *   第 4 頁  MainAgentDemo   先認識主 Agent
 *   第 5 頁  SubAgentDemo    SubAgent 是什麼？
 *   第 6 頁  OutsourceDemo   SubAgent 的概念（外包的比喻）
 *   第 9 頁  BenefitsDemo    所以使用 SubAgent 的好處是？
 *
 * 整個檔案複製自〈5 種 SubAgent 協作模式〉的 demos-level1.tsx（該簡報的
 * 第 3、5、6、7 頁），內容沒有改。刻意複製而不是 import：兩份簡報各自演進，
 * 那邊改版不會連帶改到這堂課。
 *
 * 原始內容來源：Notion「5 種 SubAgent 協作模式」的 callout，文字盡量照原意，
 * 對話內容、檔名、SubAgent 的分工是為了讓畫面成立而補的示意。
 *
 * 用色（每頁最多兩支強調色）：
 *   acid   目前選取、主 Agent、執行中
 *   teal   SubAgent、完成、正向結果
 *   其他一律中性（paper／muted／faint／line）。
 * 淡底一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 沒有任何容器會捲動。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一列（第 4、9 頁共用） */
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

/** SVG 箭頭 marker。id 要加前綴，避免跟同頁其他 SVG 撞名 */
function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={8}
      refY={5}
      markerWidth={7}
      markerHeight={7}
      orient="auto-start-reverse"
    >
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  );
}

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心 */
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

/* ══════════════════════════════════════════════════════════════
 * 第 4 頁 · MainAgentDemo — 先認識主 Agent
 *
 * callout：「就是你在對話框裡面看到的那個就是主要的 Agent。透過左邊的選單
 * 切換不同的主 Agent 觸發方式（終端機、應用程式、一般的聊天對話），右邊
 * 呈現相對應的介面。」
 *
 * 左：三種入口；右：對應的模擬介面，回覆你的那一塊用 acid 實色框圈起來，
 * 掛一枚「這就是主 Agent」。三種介面的對話內容刻意一樣 —— 換的只是入口。
 * 用色：acid（選取、主 Agent）。沒有第二支強調色。
 * ══════════════════════════════════════════════════════════════ */

type EntryId = 'terminal' | 'app' | 'chat';

const ENTRIES: readonly { id: EntryId; name: string; sub: string }[] = [
  { id: 'terminal', name: '終端機', sub: '例如 Claude Code、Codex CLI' },
  { id: 'app', name: '桌面應用程式', sub: '例如 Claude、ChatGPT 的桌面版' },
  { id: 'chat', name: '聊天對話', sub: '在瀏覽器裡開一個聊天網頁' },
];

const ASK = '幫我看一下這個專案的登入流程，有沒有問題？';
const REPLY = '好的，我先讀一下登入相關的檔案，整理完再跟你說。';

function MainAgentTag() {
  return (
    <span className="absolute -top-4 right-5 rounded-full bg-acid px-4 py-1 text-[17px] font-semibold text-on-accent">
      這就是主 Agent
    </span>
  );
}

function WindowBar({ title }: { title: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-5">
      <span className="size-3.5 rounded-full bg-line" />
      <span className="size-3.5 rounded-full bg-line" />
      <span className="size-3.5 rounded-full bg-line" />
      <span className="ml-4 text-[17px] text-faint">{title}</span>
    </div>
  );
}

function UserBubble() {
  return (
    <div className="max-w-[82%] self-end rounded-2xl bg-ink-soft px-5 py-3.5 text-[22px] leading-normal text-paper">
      {ASK}
    </div>
  );
}

function ReplyBlock() {
  return (
    <div className="relative max-w-[88%] self-start rounded-2xl border-2 border-acid px-5 pt-6 pb-4">
      <MainAgentTag />
      <span className={LABEL_FAINT}>AI</span>
      <p className="mt-1 text-[22px] leading-normal text-paper">{REPLY}</p>
    </div>
  );
}

function InputBox({ text }: { text: string }) {
  return (
    <div className="mt-auto flex items-center justify-between rounded-2xl border border-line bg-panel px-5 py-4">
      <span className="text-[20px] text-faint">{text}</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-paper text-[20px] text-on-accent">
        ↑
      </span>
    </div>
  );
}

function TerminalMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <WindowBar title="Terminal — my-project" />
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-8 py-8 font-mono text-[22px] leading-relaxed text-paper">
        <p className="text-muted">~/my-project $ claude</p>
        <p>
          <span className="text-faint">{'> '}</span>
          {ASK}
        </p>
        <div className="relative rounded-xl border-2 border-acid bg-panel px-5 pt-6 pb-4">
          <MainAgentTag />
          <p>● {REPLY}</p>
          <p className="mt-2 text-muted">{'  ⎿ 讀取 src/auth/login.ts'}</p>
        </div>
        <p className="mt-auto flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-3 text-faint">
          {'> 在這裡輸入你的指令'}
          <span className="animate-pulse text-paper">▌</span>
        </p>
      </div>
    </div>
  );
}

function AppMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <WindowBar title="AI 桌面應用程式" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[240px] shrink-0 flex-col gap-3 border-r border-line bg-ink-soft px-4 py-5">
          <span className="rounded-lg border border-line bg-panel px-3 py-2 text-[18px] text-paper">
            ＋ 新對話
          </span>
          <span className={`mt-3 ${LABEL_FAINT}`}>最近</span>
          {['登入流程檢查', '週報整理', '簡報大綱'].map((title, index) => (
            <span
              key={title}
              className={`truncate rounded-lg px-3 py-1.5 text-[18px] ${
                index === 0 ? 'bg-panel text-paper' : 'text-muted'
              }`}
            >
              {title}
            </span>
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-7 px-8 py-8">
          <UserBubble />
          <ReplyBlock />
          <InputBox text="輸入訊息…" />
        </div>
      </div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-5">
        <span className="size-3.5 rounded-full bg-line" />
        <span className="size-3.5 rounded-full bg-line" />
        <span className="size-3.5 rounded-full bg-line" />
        <span className="ml-5 flex h-9 flex-1 items-center rounded-full border border-line-soft bg-panel px-5 text-[17px] text-faint">
          瀏覽器 · 聊天網頁
        </span>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-[860px] flex-1 flex-col gap-7 px-8 py-8">
        <UserBubble />
        <ReplyBlock />
        <InputBox text="有什麼可以幫忙的？" />
      </div>
    </div>
  );
}

export function MainAgentDemo() {
  const [entry, setEntry] = useState<EntryId>('terminal');
  const current = ENTRIES.find((item) => item.id === entry) ?? ENTRIES[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[500px_1fr] gap-8">
      {/* ── 左：三種入口 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>主 Agent 的入口</span>
        <div className="flex flex-col gap-3">
          {ENTRIES.map((item, index) => (
            <MenuItem
              key={item.id}
              index={index}
              name={item.name}
              sub={item.sub}
              on={item.id === entry}
              onClick={() => setEntry(item.id)}
            />
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-5">
          <p className="text-[24px] leading-normal text-paper">
            不管從哪裡進來，
            <br />
            跟你對話的那一位，就是
            <span className="font-semibold text-acid">主 Agent</span>。
          </p>
        </div>
      </div>

      {/* ── 右：對應的介面 ───────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>{current.name}的畫面</span>
        <div key={entry} className="slide-enter min-h-0 flex-1">
          {entry === 'terminal' && <TerminalMock />}
          {entry === 'app' && <AppMock />}
          {entry === 'chat' && <ChatMock />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 5 頁 · SubAgentDemo — SubAgent 是什麼？
 *
 * callout：「SubAgent 是由主 Agent 去做控制的，SubAgent 則是來輔助主 Agent。
 * 當主 Agent 的工作量太大的時候，可以委託給其他人一起做。畫面上是一個
 * 主要對話框，右側則呈現一些小小的方塊，描述這些 SubAgent 分別代理的其他
 * 小事項。」
 *
 * 按「派出 SubAgent」→ 主 Agent 先說要分工 → 右側四格依序指派、執行、
 * 回報（完成順序刻意錯開）→ 全部回報後主 Agent 在對話框裡彙整。
 * 時間軸用 tick 推進，每 700ms 一格，約 8 秒跑完。
 *
 * 用色：acid（執行中、委派）＋ teal（完成、回報、彙整）。
 * 高度預算：四格平分右欄 720px，每格約 160px；對話框的訊息固定三則，不會長高。
 * ══════════════════════════════════════════════════════════════ */

const TICK_MS = 700;

/** appear：被指派的那一格；appear + 1 開始執行；done：回報 */
const SUB_AGENTS: readonly {
  name: string;
  task: string;
  result: string;
  appear: number;
  done: number;
}[] = [
  {
    name: '搜尋檔案',
    task: '找出登入流程用到的檔案',
    result: '找到 4 個相關檔案',
    appear: 2,
    done: 7,
  },
  {
    name: '閱讀文件',
    task: '讀 API 文件，確認 token 的規則',
    result: 'token 1 小時後就會過期',
    appear: 3,
    done: 9,
  },
  {
    name: '執行測試',
    task: '跑一次登入相關的測試',
    result: '有 2 個測試失敗',
    appear: 4,
    done: 8,
  },
  {
    name: '檢查紀錄',
    task: '翻錯誤紀錄，找出失敗的時間點',
    result: '失敗都發生在 token 過期之後',
    appear: 5,
    done: 10,
  },
];

const REPORT_TICK = 11;

type SubStatus = 'empty' | 'waiting' | 'running' | 'done';

function subStatus(tick: number, appear: number, done: number): SubStatus {
  if (tick < appear) return 'empty';
  if (tick === appear) return 'waiting';
  if (tick < done) return 'running';
  return 'done';
}

function StatusChip({ status }: { status: SubStatus }) {
  if (status === 'waiting') {
    return (
      <span className="ml-auto rounded-full border border-line px-3 py-0.5 text-[17px] text-faint">
        等待
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className="ml-auto flex items-center gap-2 rounded-full bg-acid px-3 py-0.5 text-[17px] font-semibold text-on-accent">
        <span className="size-2.5 animate-pulse rounded-full bg-on-accent" />
        執行中
      </span>
    );
  }
  return (
    <span className="ml-auto rounded-full bg-teal px-3 py-0.5 text-[17px] font-semibold text-on-accent">
      完成
    </span>
  );
}

function SubAgentBox({
  index,
  status,
  name,
  task,
  result,
}: {
  index: number;
  status: SubStatus;
  name: string;
  task: string;
  result: string;
}) {
  if (status === 'empty') {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-line text-[20px] text-faint">
        SubAgent {pad2(index + 1)} · 尚未指派
      </div>
    );
  }

  const tone =
    status === 'running'
      ? 'border-acid border-l-acid bg-acid/14'
      : status === 'done'
        ? 'border-teal border-l-teal bg-teal/14'
        : 'border-line border-l-line bg-panel';

  return (
    <div
      className={`slide-enter flex flex-1 flex-col justify-center gap-1.5 rounded-2xl border border-l-[6px] px-5 transition-colors duration-300 ${tone}`}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[17px] text-faint">SUB {pad2(index + 1)}</span>
        <span className="text-[26px] font-semibold text-paper">{name}</span>
        <StatusChip status={status} />
      </div>
      <p className="text-[20px] leading-snug text-muted">{task}</p>
      <p
        className={`text-[20px] leading-snug font-semibold text-teal ${
          status === 'done' ? '' : 'invisible'
        }`}
      >
        → 回報：{result}
      </p>
    </div>
  );
}

function FlowTag({
  arrow,
  label,
  on,
  tone,
}: {
  arrow: string;
  label: string;
  on: boolean;
  tone: 'acid' | 'teal';
}) {
  const color = on ? (tone === 'acid' ? 'text-acid' : 'text-teal') : 'text-faint';
  return (
    <div className={`flex flex-col items-center gap-1 transition-colors duration-300 ${color}`}>
      <span className="text-[40px] leading-none">{arrow}</span>
      <span className={`text-[20px] ${on ? 'font-semibold' : ''}`}>{label}</span>
    </div>
  );
}

function AgentMessage({
  children,
  tone = 'plain',
}: {
  children: ReactNode;
  tone?: 'plain' | 'done';
}) {
  return (
    <div
      className={`slide-enter max-w-[92%] self-start rounded-2xl border border-l-[6px] px-5 py-4 ${
        tone === 'done' ? 'border-teal border-l-teal bg-teal/14' : 'border-line border-l-acid bg-panel'
      }`}
    >
      <span className={`${LABEL_TYPE} ${tone === 'done' ? 'text-teal' : 'text-acid'}`}>
        主 Agent
      </span>
      <p className="mt-1.5 text-[22px] leading-normal text-paper">{children}</p>
    </div>
  );
}

export function SubAgentDemo() {
  const [tick, setTick] = useState(0);
  const running = tick > 0 && tick < REPORT_TICK;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [running, tick]);

  const statuses = SUB_AGENTS.map((sub) => subStatus(tick, sub.appear, sub.done));
  const doneCount = statuses.filter((status) => status === 'done').length;
  const dispatching = tick >= SUB_AGENTS[0].appear && tick < REPORT_TICK;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[1fr_96px_680px] gap-4">
      {/* ── 左：主對話框 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-ink-soft px-6">
          <span className={LABEL_FAINT}>主對話框</span>
          <span className="text-[18px] text-muted">你只跟主 Agent 說話</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 px-7 py-6">
          <div className="max-w-[86%] self-end rounded-2xl bg-ink-soft px-5 py-3.5 text-[22px] leading-normal text-paper">
            幫我整理這個專案的登入流程，並修掉登入失敗的錯誤。
          </div>

          {tick >= 1 && (
            <AgentMessage>
              這件事有點大，我派 4 位 SubAgent 分頭處理，等他們回報再跟你說。
            </AgentMessage>
          )}

          {running && tick >= 2 && (
            <p className="flex items-center gap-3 text-[20px] text-muted">
              <span className="size-2.5 animate-pulse rounded-full bg-acid" />
              等待 SubAgent 回報中… 已回報 {doneCount} / {SUB_AGENTS.length}
            </p>
          )}

          {tick >= REPORT_TICK && (
            <AgentMessage tone="done">
              4 位都回報了：登入失敗是因為 token 過期後沒有重新取得。我來修正，並把整理好的流程交給你。
            </AgentMessage>
          )}

          {tick === 0 && (
            <p className="mt-2 text-[20px] leading-relaxed text-muted">
              任務太大時，主 Agent 可以把工作拆開，交給 SubAgent 一起做。
              <br />
              按下「派出 SubAgent」看看會發生什麼事。
            </p>
          )}
        </div>

        <div className="flex h-[84px] shrink-0 items-center gap-3 border-t border-line px-6">
          <button
            type="button"
            onClick={() => setTick(1)}
            disabled={tick !== 0}
            className={`h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 ${
              tick === 0
                ? 'border-acid bg-acid font-semibold text-on-accent hover:opacity-90'
                : 'cursor-not-allowed border-line-soft bg-panel-lift text-faint'
            }`}
          >
            派出 SubAgent
          </button>
          <button
            type="button"
            onClick={() => setTick(0)}
            className="h-12 rounded-xl border border-line bg-panel px-6 text-[20px] text-paper transition-colors duration-200 hover:border-acid"
          >
            重來
          </button>
          <span className="ml-auto text-[18px] text-faint">
            {tick === 0 ? '尚未開始' : running ? '執行中' : '全部完成'}
          </span>
        </div>
      </div>

      {/* ── 中：委派／回報 ───────────────────────────────── */}
      <div className="flex flex-col items-center justify-center gap-14">
        <FlowTag arrow="→" label="委派" on={dispatching} tone="acid" />
        <FlowTag arrow="←" label="回報" on={doneCount > 0} tone="teal" />
      </div>

      {/* ── 右：SubAgent 的小方塊 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex h-8 shrink-0 items-center justify-between">
          <span className={LABEL_FAINT}>SubAgent · 分頭處理的小事項</span>
          <span className="text-[18px] text-muted">
            完成 {doneCount} / {SUB_AGENTS.length}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {SUB_AGENTS.map((sub, index) => (
            <SubAgentBox
              key={sub.name}
              index={index}
              status={statuses[index]}
              name={sub.name}
              task={sub.task}
              result={sub.result}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 6 頁 · OutsourceDemo — SubAgent 的概念
 *
 * callout：「你現在是一位主管，有一個外包單位跟你做接洽，這個跟你接洽的人
 * 就是『主 Agent』；而這個外包單位底下可以指派其他人一起幫你完成任務，
 * 那些被指派的人就稱為『SubAgent』。」
 *
 * 上方開關在「外包的比喻」與「換成 AI」兩套標籤之間切換，圖形不動、只換字，
 * 讓學員自己把兩邊對起來。點方塊，下方說明換成那一位在做什麼。
 *
 * 用色：acid（窗口／主 Agent）＋ teal（被指派的人／SubAgent）。你是中性。
 * 選取的方塊外面多一圈 paper 實線環，不靠填色表達。
 *
 * 座標（viewBox 1740 × 470，放進約 1740 寬的欄位時接近 1:1）：
 *   你            ( 30, 175) 300 × 120
 *   外包單位外框  (440,  14) 1286 × 442
 *   窗口          (500, 175) 360 × 120
 *   被指派的人    (1160, 60 / 180 / 300) 520 × 110
 * ══════════════════════════════════════════════════════════════ */

type Lens = 'story' | 'ai';
type OrgNode = 'you' | 'window' | 'sub';

const LENSES: readonly { id: Lens; label: string }[] = [
  { id: 'story', label: '外包的比喻' },
  { id: 'ai', label: '換成 AI' },
];

const ORG_LABELS: Record<
  Lens,
  {
    frame: string;
    you: [string, string];
    window: [string, string];
    subs: [string, string][];
  }
> = {
  story: {
    frame: '外包單位',
    you: ['你', '主管'],
    window: ['接洽窗口', '跟你對接的那個人'],
    subs: [
      ['被指派的人 A', '整理資料'],
      ['被指派的人 B', '撰寫報告'],
      ['被指派的人 C', '檢查成果'],
    ],
  },
  ai: {
    frame: 'AI 工具（例如 Claude Code）',
    you: ['你', '下指令的人'],
    window: ['主 Agent', '對話框裡回覆你的那一位'],
    subs: [
      ['SubAgent 1', '搜尋檔案'],
      ['SubAgent 2', '撰寫程式'],
      ['SubAgent 3', '執行測試'],
    ],
  },
};

const ORG_NOTES: Record<Lens, Record<OrgNode, string>> = {
  story: {
    you: '你只要跟窗口說明需求，不必自己去找底下的每一個人。',
    window: '外包單位派來跟你接洽的人：聽懂需求、把工作分下去，最後把成果交回給你。',
    sub: '外包單位底下被指派的人，每個人只負責被交辦的那一小塊。',
  },
  ai: {
    you: '你只在對話框裡跟主 Agent 說話，SubAgent 不需要你直接管。',
    window: '主 Agent 負責理解需求、拆解任務、派出 SubAgent，最後彙整結果回覆你。',
    sub: 'SubAgent 由主 Agent 控制，各自處理一小塊工作，做完回報給主 Agent。',
  },
};

const NODE_EDGE: Record<OrgNode, string> = {
  you: 'border-l-muted',
  window: 'border-l-acid',
  sub: 'border-l-teal',
};

const NODE_TEXT: Record<OrgNode, string> = {
  you: 'text-muted',
  window: 'text-acid',
  sub: 'text-teal',
};

const SUB_Y = [60, 180, 300] as const;
const ORG_ARROW = 'l1-org-arrow';

function OrgBox({
  x,
  y,
  w,
  h,
  color,
  title,
  sub,
  selected,
  onClick,
  titleSize = 30,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  title: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
  titleSize?: number;
}) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {selected && (
        <rect
          x={x - 9}
          y={y - 9}
          width={w + 18}
          height={h + 18}
          rx={22}
          fill="none"
          stroke={C.paper}
          strokeWidth={2.5}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={C.inkSoft}
        stroke={color}
        strokeWidth={selected ? 4 : 2.5}
        className="transition-[stroke-width] duration-200"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 6}
        textAnchor="middle"
        fill={C.paper}
        fontSize={titleSize}
        fontWeight={600}
      >
        {title}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 28}
        textAnchor="middle"
        fill={C.muted}
        fontSize={19}
      >
        {sub}
      </text>
    </g>
  );
}

export function OutsourceDemo() {
  const [lens, setLens] = useState<Lens>('story');
  const [picked, setPicked] = useState<OrgNode>('window');
  const labels = ORG_LABELS[lens];
  const pickedName =
    picked === 'you' ? labels.you[0] : picked === 'window' ? labels.window[0] : labels.subs.map((s) => s[0]).join('、');

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-4">
      {/* ── 上：切換 ─────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-5">
        <div className="flex rounded-xl border border-line bg-panel-lift p-1">
          {LENSES.map((item) => {
            const on = item.id === lens;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLens(item.id)}
                aria-current={on}
                className={`h-11 rounded-lg px-6 text-[20px] transition-colors duration-200 ${
                  on ? 'bg-paper font-semibold text-on-accent' : 'text-muted hover:text-paper'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <span className="text-[19px] text-muted">點圖上的方塊，看看他負責什麼</span>
      </div>

      {/* ── 中：組織圖 ───────────────────────────────────── */}
      <svg
        viewBox="0 0 1740 470"
        className="h-[470px] w-full shrink-0"
        role="img"
      >
        <title>你只跟窗口（主 Agent）接洽，窗口再把工作指派給底下的人（SubAgent）</title>
        <defs>
          <ArrowMarker id={`${ORG_ARROW}-muted`} color={C.muted} />
          <ArrowMarker id={`${ORG_ARROW}-teal`} color={C.teal} />
        </defs>

        {/* 外包單位外框 */}
        <rect
          x={440}
          y={14}
          width={1286}
          height={442}
          rx={24}
          fill="none"
          stroke={C.line}
          strokeWidth={2}
          strokeDasharray="10 8"
        />
        <text
          x={470}
          y={56}
          fill={C.faint}
          fontSize={20}
          letterSpacing={2}
        >
          {labels.frame}
        </text>

        {/* 你 ↔ 窗口 */}
        <line
          x1={338}
          y1={215}
          x2={490}
          y2={215}
          stroke={C.muted}
          strokeWidth={2.5}
          markerEnd={`url(#${ORG_ARROW}-muted)`}
        />
        <line
          x1={490}
          y1={255}
          x2={338}
          y2={255}
          stroke={C.muted}
          strokeWidth={2.5}
          markerEnd={`url(#${ORG_ARROW}-muted)`}
        />
        <text x={400} y={200} textAnchor="middle" fill={C.muted} fontSize={19}>
          交辦
        </text>
        <text x={400} y={286} textAnchor="middle" fill={C.muted} fontSize={19}>
          回報
        </text>

        {/* 窗口 → 被指派的人 */}
        <line x1={868} y1={235} x2={1010} y2={235} stroke={C.teal} strokeWidth={2.5} />
        <line
          x1={1010}
          y1={SUB_Y[0] + 55}
          x2={1010}
          y2={SUB_Y[2] + 55}
          stroke={C.teal}
          strokeWidth={2.5}
        />
        {SUB_Y.map((y) => (
          <line
            key={y}
            x1={1010}
            y1={y + 55}
            x2={1150}
            y2={y + 55}
            stroke={C.teal}
            strokeWidth={2.5}
            markerEnd={`url(#${ORG_ARROW}-teal)`}
          />
        ))}
        <text x={939} y={220} textAnchor="middle" fill={C.teal} fontSize={19} fontWeight={600}>
          指派
        </text>

        <OrgBox
          x={30}
          y={175}
          w={300}
          h={120}
          color={C.muted}
          title={labels.you[0]}
          sub={labels.you[1]}
          selected={picked === 'you'}
          onClick={() => setPicked('you')}
        />
        <OrgBox
          x={500}
          y={175}
          w={360}
          h={120}
          color={C.acid}
          title={labels.window[0]}
          sub={labels.window[1]}
          selected={picked === 'window'}
          onClick={() => setPicked('window')}
        />
        {SUB_Y.map((y, index) => (
          <OrgBox
            key={y}
            x={1160}
            y={y}
            w={520}
            h={110}
            color={C.teal}
            title={labels.subs[index][0]}
            sub={labels.subs[index][1]}
            selected={picked === 'sub'}
            onClick={() => setPicked('sub')}
            titleSize={28}
          />
        ))}
      </svg>

      {/* ── 下：說明 ─────────────────────────────────────── */}
      <div
        className={`flex min-h-0 flex-1 items-center gap-8 rounded-2xl border border-line border-l-[6px] bg-panel-lift px-8 ${NODE_EDGE[picked]}`}
      >
        <span className={`shrink-0 text-[26px] font-semibold ${NODE_TEXT[picked]}`}>
          {pickedName}
        </span>
        <p className="text-[24px] leading-normal text-paper">{ORG_NOTES[lens][picked]}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 9 頁 · BenefitsDemo — 所以使用 SubAgent 的好處是？
 *
 * callout 指定「左邊是選單，右邊則是用圖示表現它的特色」。三項：
 *   01 更快完成任務     工作切成小塊，像流水線一樣多人一起做
 *   02 減輕主管負擔     窗口專注在你交辦的事，其他的分派出去
 *   03 交給更專責的人   通用型窗口把專業的事交給法律、會計等專家
 *
 * 右側每一項一張手繪 SVG（viewBox 1100 × 450，放進約 1120 寬的卡片接近 1:1）。
 * 用色：acid（選單選取）＋ teal（圖裡的「分工之後」）。「分工之前」一律中性。
 * ══════════════════════════════════════════════════════════════ */

type BenefitId = 'fast' | 'lighter' | 'expert';

const BENEFITS: readonly { id: BenefitId; name: string; sub: string; desc: string }[] = [
  {
    id: 'fast',
    name: '更快完成任務',
    sub: '工作切成小塊，多人一起做',
    desc: '任務發派下去、多人一起協作，工作被切成一小塊一小塊，像流水線一樣大家同時做，速度自然比較快。',
  },
  {
    id: 'lighter',
    name: '減輕主管負擔',
    sub: '窗口不必什麼事都自己扛',
    desc: '什麼事都由窗口自己做，負擔會太重。把工作指派給其他人，跟你對接的窗口就能專注處理你交辦的事，再分派下去。',
  },
  {
    id: 'expert',
    name: '交給更專責的人',
    sub: '通用型窗口 ＋ 專業領域的人',
    desc: '跟你對接的窗口比較偏通用型；遇到專業的事，可以指派精通法律、會計等領域的人去做。',
  },
];

/* ── 01 更快完成：一個人依序做 6 塊 vs 三個人各做 2 塊 ── */

const SEG_W = 150;
const SEG_X0 = 170;

function FastFigure() {
  const soloEnd = SEG_X0 + SEG_W * 6;
  const teamEnd = SEG_X0 + SEG_W * 2;
  const lanes = [196, 262, 328];

  return (
    <svg viewBox="0 0 1100 450" className="h-[450px] w-full" role="img">
      <title>同樣六塊工作，一個人要依序做完，三個人分頭做只要三分之一的時間</title>
      <defs>
        <ArrowMarker id="l1-fast-arrow" color={C.teal} />
      </defs>

      {/* 一個人 */}
      <text x={0} y={104} fill={C.paper} fontSize={24} fontWeight={600}>
        一個人
      </text>
      <text x={0} y={132} fill={C.muted} fontSize={18}>
        依序做完
      </text>
      {Array.from({ length: 6 }, (_, index) => (
        <g key={index}>
          <rect
            x={SEG_X0 + index * SEG_W}
            y={84}
            width={SEG_W - 8}
            height={56}
            rx={10}
            fill={C.inkSoft}
            stroke={C.muted}
            strokeWidth={2}
          />
          <text
            x={SEG_X0 + index * SEG_W + (SEG_W - 8) / 2}
            y={120}
            textAnchor="middle"
            fill={C.muted}
            fontSize={22}
          >
            {index + 1}
          </text>
        </g>
      ))}
      <line x1={soloEnd} y1={60} x2={soloEnd} y2={160} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
      <text x={soloEnd} y={48} textAnchor="middle" fill={C.muted} fontSize={19}>
        完成
      </text>

      {/* 多人一起做 */}
      <text x={0} y={262} fill={C.paper} fontSize={24} fontWeight={600}>
        三個人
      </text>
      <text x={0} y={290} fill={C.muted} fontSize={18}>
        分頭同時做
      </text>
      {lanes.map((y, lane) =>
        [0, 1].map((index) => (
          <g key={`${lane}-${index}`}>
            <rect
              x={SEG_X0 + index * SEG_W}
              y={y}
              width={SEG_W - 8}
              height={52}
              rx={10}
              fill={C.panel}
              stroke={C.teal}
              strokeWidth={2.5}
            />
            <text
              x={SEG_X0 + index * SEG_W + (SEG_W - 8) / 2}
              y={y + 34}
              textAnchor="middle"
              fill={C.teal}
              fontSize={22}
              fontWeight={600}
            >
              {lane * 2 + index + 1}
            </text>
          </g>
        )),
      )}
      <line x1={teamEnd} y1={184} x2={teamEnd} y2={396} stroke={C.teal} strokeWidth={2.5} strokeDasharray="6 6" />
      <text x={teamEnd} y={420} textAnchor="middle" fill={C.teal} fontSize={19} fontWeight={600}>
        完成
      </text>

      {/* 省下的時間 */}
      <line
        x1={teamEnd + 16}
        y1={290}
        x2={soloEnd - 4}
        y2={290}
        stroke={C.teal}
        strokeWidth={2.5}
        markerStart="url(#l1-fast-arrow)"
        markerEnd="url(#l1-fast-arrow)"
      />
      <text
        x={(teamEnd + soloEnd) / 2}
        y={274}
        textAnchor="middle"
        fill={C.teal}
        fontSize={24}
        fontWeight={600}
      >
        省下的時間
      </text>
      <line x1={soloEnd} y1={184} x2={soloEnd} y2={396} stroke={C.line} strokeWidth={2} strokeDasharray="6 6" />
    </svg>
  );
}

/* ── 02 減輕負擔：待辦堆得很高 vs 只留你交辦的事 ── */

function TaskCard({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
      <line x1={x + 14} y1={y + h / 2} x2={x + w * 0.6} y2={y + h / 2} stroke={C.line} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function LighterFigure() {
  const helpers = [840, 950, 1060];

  return (
    <svg viewBox="0 0 1100 450" className="h-[450px] w-full" role="img">
      <title>窗口什麼都自己做時待辦堆得很高；分派出去之後，窗口只留下你交辦的事</title>
      <defs>
        <ArrowMarker id="l1-lighter-arrow" color={C.teal} />
      </defs>

      {/* 左：全部自己做 */}
      {Array.from({ length: 7 }, (_, index) => (
        <TaskCard key={index} x={160} y={250 - index * 34} w={200} h={28} />
      ))}
      <Person cx={260} cy={318} r={24} color={C.muted} />
      <text x={260} y={430} textAnchor="middle" fill={C.paper} fontSize={24} fontWeight={600}>
        全部自己做
      </text>
      <text x={400} y={120} fill={C.muted} fontSize={19}>
        待辦越堆越高
      </text>

      <line x1={560} y1={20} x2={560} y2={440} stroke={C.line} strokeWidth={2} strokeDasharray="6 8" />

      {/* 右：分派出去 */}
      <rect x={606} y={246} width={200} height={34} rx={6} fill={C.panel} stroke={C.teal} strokeWidth={2.5} />
      <text x={706} y={270} textAnchor="middle" fill={C.teal} fontSize={18} fontWeight={600}>
        你交辦的事
      </text>
      <Person cx={706} cy={318} r={24} color={C.teal} />
      <text x={780} y={430} textAnchor="middle" fill={C.paper} fontSize={24} fontWeight={600}>
        分派出去
      </text>

      {helpers.map((cx, index) => (
        <g key={cx}>
          <line
            x1={740}
            y1={310}
            x2={cx - 16}
            y2={256}
            stroke={C.teal}
            strokeWidth={2.5}
            markerEnd="url(#l1-lighter-arrow)"
          />
          <TaskCard x={cx - 36} y={100} w={72} h={24} />
          {index !== 1 && <TaskCard x={cx - 36} y={130} w={72} h={24} />}
          <Person cx={cx} cy={186} r={18} color={C.teal} />
        </g>
      ))}
      <text x={950} y={70} textAnchor="middle" fill={C.muted} fontSize={19}>
        其他工作分給大家
      </text>
    </svg>
  );
}

/* ── 03 更專責的人：通用型窗口 → 法律、會計、其他專業 ── */

function ScalesGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.teal} strokeWidth={2.5} fill="none" strokeLinecap="round">
      <line x1={x} y1={y - 26} x2={x} y2={y + 24} />
      <line x1={x - 24} y1={y - 16} x2={x + 24} y2={y - 16} />
      <line x1={x - 14} y1={y + 24} x2={x + 14} y2={y + 24} />
      <path d={`M${x - 34} ${y + 4} Q${x - 24} ${y + 16} ${x - 14} ${y + 4} Z`} />
      <path d={`M${x + 14} ${y + 4} Q${x + 24} ${y + 16} ${x + 34} ${y + 4} Z`} />
      <line x1={x - 24} y1={y - 16} x2={x - 30} y2={y + 4} />
      <line x1={x - 24} y1={y - 16} x2={x - 18} y2={y + 4} />
      <line x1={x + 24} y1={y - 16} x2={x + 18} y2={y + 4} />
      <line x1={x + 24} y1={y - 16} x2={x + 30} y2={y + 4} />
    </g>
  );
}

function LedgerGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.teal} strokeWidth={2.5} fill="none" strokeLinecap="round">
      <rect x={x - 22} y={y - 28} width={44} height={56} rx={6} />
      <rect x={x - 14} y={y - 20} width={28} height={12} rx={2} />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={x - 11 + col * 11}
            cy={y + 2 + row * 10}
            r={1.8}
            fill={C.teal}
          />
        )),
      )}
    </g>
  );
}

function ExpertFigure() {
  const experts = [
    { y: 24, name: '法律', sub: '審閱合約條款', task: '合約審閱', glyph: 'scales' as const },
    { y: 164, name: '會計', sub: '整理帳目、報稅', task: '帳目與報稅', glyph: 'ledger' as const },
    { y: 304, name: '其他專業領域…', sub: '需要什麼就找誰', task: '…', glyph: 'none' as const },
  ];

  return (
    <svg viewBox="0 0 1100 450" className="h-[450px] w-full" role="img">
      <title>通用型的窗口把專業的工作，指派給法律、會計等更專責的人</title>
      <defs>
        <ArrowMarker id="l1-expert-arrow" color={C.teal} />
      </defs>

      <Person cx={170} cy={170} r={30} color={C.muted} />
      <text x={170} y={326} textAnchor="middle" fill={C.paper} fontSize={26} fontWeight={600}>
        通用型窗口
      </text>
      <text x={170} y={358} textAnchor="middle" fill={C.muted} fontSize={19}>
        什麼都懂一點
      </text>

      {experts.map((expert) => {
        const cy = expert.y + 61;
        const dashed = expert.glyph === 'none';
        const midX = 450;
        const midY = (220 + cy) / 2;
        return (
          <g key={expert.name}>
            <line
              x1={250}
              y1={220}
              x2={654}
              y2={cy}
              stroke={dashed ? C.line : C.teal}
              strokeWidth={2.5}
              strokeDasharray={dashed ? '8 8' : undefined}
              markerEnd={dashed ? undefined : 'url(#l1-expert-arrow)'}
            />
            {!dashed && (
              <g>
                <rect
                  x={midX - 66}
                  y={midY - 20}
                  width={132}
                  height={40}
                  rx={20}
                  fill={C.panel}
                  stroke={C.teal}
                  strokeWidth={2}
                />
                <text x={midX} y={midY + 7} textAnchor="middle" fill={C.teal} fontSize={18} fontWeight={600}>
                  {expert.task}
                </text>
              </g>
            )}
            <rect
              x={664}
              y={expert.y}
              width={420}
              height={122}
              rx={16}
              fill={C.inkSoft}
              stroke={dashed ? C.line : C.teal}
              strokeWidth={dashed ? 2 : 2.5}
              strokeDasharray={dashed ? '8 8' : undefined}
            />
            {expert.glyph === 'scales' && <ScalesGlyph x={730} y={cy} />}
            {expert.glyph === 'ledger' && <LedgerGlyph x={730} y={cy} />}
            <text
              x={dashed ? 700 : 790}
              y={cy - 6}
              fill={dashed ? C.muted : C.paper}
              fontSize={dashed ? 24 : 30}
              fontWeight={600}
            >
              {expert.name}
            </text>
            <text x={dashed ? 700 : 790} y={cy + 28} fill={C.muted} fontSize={19}>
              {expert.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function BenefitsDemo() {
  const [benefit, setBenefit] = useState<BenefitId>('fast');
  const current = BENEFITS.find((item) => item.id === benefit) ?? BENEFITS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[520px_1fr] gap-8">
      {/* ── 左：三個好處 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>指派 SubAgent 的三個好處</span>
        <div className="flex flex-col gap-3">
          {BENEFITS.map((item, index) => (
            <MenuItem
              key={item.id}
              index={index}
              name={item.name}
              sub={item.sub}
              on={item.id === benefit}
              onClick={() => setBenefit(item.id)}
            />
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel px-6 py-5">
          <p className="text-[22px] leading-normal text-paper">
            主 Agent 負責分工與彙整，
            <br />
            SubAgent 負責把自己那一小塊做好。
          </p>
        </div>
      </div>

      {/* ── 右：概念圖 ───────────────────────────────────── */}
      <div
        key={benefit}
        className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-7"
      >
        <span className={`${LABEL_TYPE} text-acid`}>{current.name}</span>
        <p className="text-[22px] leading-normal text-paper">{current.desc}</p>
        <div className="mt-auto">
          {benefit === 'fast' && <FastFigure />}
          {benefit === 'lighter' && <LighterFigure />}
          {benefit === 'expert' && <ExpertFigure />}
        </div>
      </div>
    </div>
  );
}
