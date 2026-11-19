import { Fragment, useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第三章 實際使用 SubAgent（Claude Code）
 *
 *   第 16 頁  ClaudeTypesDemo    Claude Code 的 SubAgent 分類
 *   第 17 頁  ClaudeInvokeDemo   Claude Code 的 SubAgent 呼叫方式
 *
 * 原始內容來源：Notion「AI 協作進階－SubAgents 與外部服務整合」的 callout
 * 與兩張表格（被劃掉的列不放）。表格的文字照原意，只為版面斷句。
 *
 * 對照過官方文件 https://code.claude.com/docs/en/sub-agents（2026-10）：
 *   - 內建 agent：Explore（唯讀搜尋）、Plan（plan mode 蒐集資訊）、
 *     General-purpose（探索＋動手）、claude（萬用備援）、
 *     statusline-setup（/statusline）、claude-code-guide（Claude Code 功能問題）
 *   - Explore 被呼叫時會指定 thoroughness：quick／medium／very thorough
 *   - 委派在對話紀錄裡是一列「agent 名稱(簡短任務)」，例如 code-improver(…)
 *   - 自然語言點名：由 Claude 決定是否委派；@-mention：保證由它執行，
 *     語法 @"code-reviewer (agent)"，手動輸入可寫 @agent-code-reviewer
 *   - /subtask：v2.1.212 起才有（v2.1.161–2.1.211 是 /fork）。Fork 繼承整段
 *     對話、在提示列下方的面板背景執行，完成後結果以訊息回到主對話
 *   - 自訂 agent 放在 .claude/agents/，description 寫 use proactively 會更積極
 *
 * 補的示意（官方文件沒有、為了讓畫面成立而寫的）：
 *   - 終端機裡的每一句對話、檔名（routes.ts、LoginForm.tsx、parser.test.ts…）、
 *     函式名 formatPrice、測試數量與結果
 *   - 「⎿ Done · …」那一列是簡化的寫法；真正的畫面會列出工具次數、token 與耗時
 *   - Explore 那一列的「thoroughness: medium」標籤：官方只說會指定，標示方式是示意
 *   - 第 17 頁「通用型」派出的是 general-purpose —— 沒指定類型時由 Claude 挑，
 *     這裡畫的是最常見的那一種
 *   - code-reviewer 的 description 取自官方文件的範例句
 *
 * 用色（每頁最多兩支強調色）：
 *   acid   目前選取、主 Agent、「Claude 判斷」
 *   teal   SubAgent、完成、「你指定 · 保證執行」、輸入列裡觸發 SubAgent 的關鍵字
 *   其他一律中性（paper／muted／faint／line）。
 * 淡底（/14）一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 沒有任何容器會捲動。對話紀錄的每一列都先佔好位置（invisible），
 * 播放時只切換可見度，版面不會跳。各頁的數字寫在各自的區塊註解裡。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex shrink-0 items-center justify-center rounded-full border font-mono';

const BTN_SMALL =
  'h-9 rounded-lg border border-line bg-panel px-4 text-[18px] text-paper transition-colors duration-200 hover:border-acid';

const REVEAL = 'transition-[opacity,visibility] duration-300';
const SHOWN = 'visible opacity-100';
const HIDDEN = 'invisible opacity-0';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 行內的程式碼片段（指令、路徑、agent 名稱） */
function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[0.92em]">{children}</code>;
}

/** 終端機的視窗列。badge 給 plan mode 這類狀態，right 放狀態文字與重播鈕 */
function WindowBar({
  title,
  badge,
  right,
}: {
  title: string;
  badge?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-5">
      <span className="size-3.5 rounded-full bg-line" />
      <span className="size-3.5 rounded-full bg-line" />
      <span className="size-3.5 rounded-full bg-line" />
      <span className="ml-4 text-[17px] text-faint">{title}</span>
      {badge && (
        <span className="ml-3 rounded-md border border-paper px-2.5 py-0.5 font-mono text-[17px] font-semibold text-paper">
          {badge}
        </span>
      )}
      {right && <div className="ml-auto flex items-center gap-4">{right}</div>}
    </div>
  );
}

/**
 * 把字串裡的 mark 那一段標成 teal（實色字＋底線，不靠填色）。
 * upto 給打字動畫用：只顯示前 upto 個字。
 */
function Marked({
  text,
  mark,
  upto,
}: {
  text: string;
  mark?: string;
  upto?: number;
}) {
  const end = upto ?? text.length;
  const from = mark ? text.indexOf(mark) : -1;
  if (!mark || from < 0) return <>{text.slice(0, end)}</>;
  const to = from + mark.length;
  return (
    <>
      {text.slice(0, Math.min(end, from))}
      {end > from && (
        <span className="border-b-2 border-teal font-semibold text-teal">
          {text.slice(from, Math.min(end, to))}
        </span>
      )}
      {end > to && text.slice(to, end)}
    </>
  );
}

/* ── 終端機裡的對話紀錄 ─────────────────────────────────── */

type Beat =
  | { kind: 'user'; text: string; mark?: string }
  | { kind: 'main'; text: string }
  | { kind: 'call'; name: string; task: string; tag?: string }
  | { kind: 'work'; text: string }
  | { kind: 'done'; text: string }
  | { kind: 'reply'; who: 'main' | 'fork'; text: string };

type Who = 'you' | 'main' | 'sub' | 'fork' | 'file';

const WHO: Record<Who, { label: string; className: string }> = {
  you: { label: '你', className: 'text-muted' },
  main: { label: '主 Agent', className: 'text-acid' },
  sub: { label: 'SubAgent', className: 'text-teal' },
  fork: { label: 'Fork', className: 'text-teal' },
  file: { label: '設定檔', className: 'text-faint' },
};

function isSubBeat(beat: Beat) {
  return beat.kind === 'call' || beat.kind === 'work' || beat.kind === 'done';
}

function whoOf(beat: Beat): Who {
  if (beat.kind === 'user') return 'you';
  if (beat.kind === 'reply' && beat.who === 'fork') return 'fork';
  return 'main';
}

interface BeatBlock {
  start: number;
  beats: Beat[];
  sub: boolean;
}

/** 連續的 call／work／done 收進同一個 SubAgent 方塊 */
function groupBeats(beats: readonly Beat[]): BeatBlock[] {
  const blocks: BeatBlock[] = [];
  beats.forEach((beat, index) => {
    const sub = isSubBeat(beat);
    const prev = blocks[blocks.length - 1];
    if (sub && prev?.sub) prev.beats.push(beat);
    else blocks.push({ start: index, beats: [beat], sub });
  });
  return blocks;
}

/** 對話紀錄的一列：左邊是誰在說話，右邊是內容。show 只切換可見度、不改高度 */
function Row({
  who,
  show,
  children,
}: {
  who: Who;
  show: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-baseline gap-4 ${REVEAL} ${show ? SHOWN : HIDDEN}`}>
      <span
        className={`w-[92px] shrink-0 text-right text-[17px] font-semibold ${WHO[who].className}`}
      >
        {WHO[who].label}
      </span>
      <div className="min-w-0 flex-1 font-mono text-[20px] leading-[1.5]">{children}</div>
    </div>
  );
}

function BeatLine({ beat }: { beat: Beat }) {
  switch (beat.kind) {
    case 'user':
      return (
        <>
          <span className="text-faint">{'> '}</span>
          <span className="text-paper">
            <Marked text={beat.text} mark={beat.mark} />
          </span>
        </>
      );
    case 'main':
      return (
        <>
          <span className="text-acid">{'● '}</span>
          <span className="text-paper">{beat.text}</span>
        </>
      );
    case 'call':
      return (
        <>
          <span className="text-teal">{'● '}</span>
          <span className="font-semibold text-teal">{beat.name}</span>
          <span className="text-paper">({beat.task})</span>
          {beat.tag && (
            <span className="ml-3 rounded-md border border-line px-2 py-0.5 text-[17px] text-muted">
              {beat.tag}
            </span>
          )}
        </>
      );
    case 'work':
      return (
        <>
          <span className="text-faint">{'⎿ '}</span>
          <span className="text-muted">{beat.text}</span>
        </>
      );
    case 'done':
      return (
        <>
          <span className="text-faint">{'⎿ '}</span>
          <span className="font-semibold text-teal">{beat.text}</span>
        </>
      );
    case 'reply':
      return (
        <>
          <span className={beat.who === 'fork' ? 'text-teal' : 'text-acid'}>{'● '}</span>
          <span className="text-paper">{beat.text}</span>
        </>
      );
  }
}

/** 整段對話紀錄。shown＝目前看得到前幾個 beat */
function Transcript({ beats, shown }: { beats: readonly Beat[]; shown: number }) {
  return (
    <>
      {groupBeats(beats).map((block) =>
        block.sub ? (
          <Row key={block.start} who="sub" show={shown > block.start}>
            <div className="flex flex-col gap-1 rounded-xl border border-teal/55 border-l-[6px] border-l-teal bg-panel px-5 py-2.5">
              {block.beats.map((beat, offset) => (
                <p
                  key={offset}
                  className={`${REVEAL} ${shown > block.start + offset ? SHOWN : HIDDEN}`}
                >
                  <BeatLine beat={beat} />
                </p>
              ))}
            </div>
          </Row>
        ) : (
          <Row key={block.start} who={whoOf(block.beats[0])} show={shown > block.start}>
            <p>
              <BeatLine beat={block.beats[0]} />
            </p>
          </Row>
        ),
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 16 頁 · ClaudeTypesDemo — Claude Code 的 SubAgent 分類
 *
 * callout：「AI Coding Tool SubAgent 的分類 - Claude。左邊列出選單，右邊提供
 * 示意圖（幫我研究這些 SubAgent 的用途並繪製情境）。劃掉的可以不用」
 *
 *   分類        Subagent             用途                         自動觸發時機
 *   通用型      General-purpose      需要探索加修改的多步驟任務     任務需要探索與修改、複雜推理或多個相依步驟時
 *   通用型      claude               不適合其他專用 agent 時的萬用備援  沒有更合適的 agent 時
 *   內建專用型  Explore              唯讀的程式碼搜尋與分析         需要理解程式碼但不修改時（會自選 quick、medium 或 very thorough）
 *   內建專用型  Plan                 Plan mode 下蒐集資訊           只在 plan mode 中
 *   內建專用型  claude-code-guide    回答 Claude Code 功能問題      你問 Claude Code 相關問題時
 *   內建專用型  statusline-setup     設定狀態列                     執行 /statusline 時
 *   自訂型      你自己定義的 agent   依你的設定                     description 符合任務時；寫上「use proactively」會更積極
 *   （Fork 那一列被劃掉，不放。）
 *
 * 左：依分類分組的 7 項選單（分組小標＋較矮的選單列）。
 * 右上：該 agent 的「用途」與「自動觸發時機」。
 * 右下：Claude Code 終端機模擬畫面，選了哪一項就自動播一次
 *       你說一句話 → 主 Agent 派出 → SubAgent 做事 → 回報；可按「重播」。
 *       每個 agent 的情境都不一樣，貼著它的用途寫。
 *
 * 高度預算：
 *   左欄  3 個分組小標 26 ＋ 小標與選單 gap 8 ×3 ＋ 7 列 × 76
 *         ＋ 組內 gap 8 × 4 ＋ 組間 gap 16 × 2 ＝ 698
 *   右欄  說明卡 148 ＋ gap 16 ＋ 終端機 556
 *         終端機 ＝ 視窗列 48 ＋ 內文 448（py 40，可用 408）＋ 進度列 60
 *         內文最高的是自訂型：設定檔 68 ＋ 4 列 × 30 ＋ SubAgent 方塊 154
 *         ＋ gap 14 × 4 ≈ 368 ＜ 408
 * ══════════════════════════════════════════════════════════════ */

type AgentGroup = '通用型' | '內建專用型' | '自訂型';

const AGENT_GROUPS: readonly AgentGroup[] = ['通用型', '內建專用型', '自訂型'];

interface AgentType {
  id: string;
  group: AgentGroup;
  name: string;
  /** 名稱是識別字（用等寬字）還是一般文字 */
  mono: boolean;
  use: string;
  trigger: ReactNode;
  /** 視窗列上的狀態標籤，例如 plan mode */
  mode?: string;
  /** 自訂型：先秀出設定檔裡的 description */
  file?: { path: string; line: string; mark: string };
  beats: readonly Beat[];
}

const AGENT_TYPES: readonly AgentType[] = [
  {
    id: 'general-purpose',
    group: '通用型',
    name: 'General-purpose',
    mono: true,
    use: '需要探索加修改的多步驟任務',
    trigger: '任務需要探索與修改、複雜推理或多個相依步驟時',
    beats: [
      { kind: 'user', text: '把專案裡的日期格式統一成 YYYY-MM-DD，改完跑測試。' },
      { kind: 'main', text: '要先找、再改、再驗證，交給 general-purpose。' },
      { kind: 'call', name: 'general-purpose', task: '統一日期格式並驗證' },
      { kind: 'work', text: '搜尋 日期格式化的寫法 → 12 處' },
      { kind: 'work', text: '修改 utils/date.ts 等 5 個檔案' },
      { kind: 'work', text: '執行 npm test → 全部通過' },
      { kind: 'done', text: 'Done · 回報修改清單' },
      {
        kind: 'reply',
        who: 'main',
        text: '已統一成 YYYY-MM-DD：改了 5 個檔案，測試全部通過。',
      },
    ],
  },
  {
    id: 'claude',
    group: '通用型',
    name: 'claude',
    mono: true,
    use: '不適合其他專用 agent 時的萬用備援',
    trigger: '沒有更合適的 agent 時',
    beats: [
      { kind: 'user', text: '把 README 的安裝步驟翻成英文，放在中文下方。' },
      { kind: 'main', text: '沒有更合適的專用 agent，交給 claude 處理。' },
      { kind: 'call', name: 'claude', task: '翻譯 README 的安裝步驟' },
      { kind: 'work', text: '讀取 README.md' },
      { kind: 'work', text: '修改 README.md → 新增英文段落' },
      { kind: 'done', text: 'Done' },
      { kind: 'reply', who: 'main', text: '英文版的安裝步驟已經放在中文段落下方。' },
    ],
  },
  {
    id: 'explore',
    group: '內建專用型',
    name: 'Explore',
    mono: true,
    use: '唯讀的程式碼搜尋與分析',
    trigger: (
      <>
        需要理解程式碼但不修改時（會自選 <Code>quick</Code>、<Code>medium</Code> 或{' '}
        <Code>very thorough</Code>）
      </>
    ),
    beats: [
      { kind: 'user', text: '這個專案的登入流程在哪？' },
      { kind: 'main', text: '只要看懂、不用修改，派 Explore 去找。' },
      {
        kind: 'call',
        name: 'Explore',
        task: '找出登入流程',
        tag: 'thoroughness: medium',
      },
      { kind: 'work', text: '搜尋 "login"、"session" → 8 個檔案' },
      { kind: 'work', text: '讀取 routes.ts、login.ts、session.ts' },
      { kind: 'done', text: 'Done · 唯讀，沒有修改任何檔案' },
      {
        kind: 'reply',
        who: 'main',
        text: '登入從 routes.ts 進來 → login.ts 驗證帳密 → session.ts 發 token。',
      },
    ],
  },
  {
    id: 'plan',
    group: '內建專用型',
    name: 'Plan',
    mono: true,
    use: 'Plan mode 下蒐集資訊',
    trigger: '只在 plan mode 中',
    mode: 'plan mode',
    beats: [
      { kind: 'user', text: '幫登入加上「記住我」，先規劃要怎麼做。' },
      { kind: 'main', text: '目前在 plan mode，先派 Plan 蒐集資訊。' },
      { kind: 'call', name: 'Plan', task: '蒐集登入與 session 的程式碼' },
      { kind: 'work', text: '讀取 login.ts、session.ts' },
      { kind: 'work', text: '搜尋 cookie 的設定 → 2 處' },
      { kind: 'done', text: 'Done · 唯讀，沒有修改任何檔案' },
      {
        kind: 'reply',
        who: 'main',
        text: '計畫：① session 加上到期時間 ② 表單加勾選框 ③ 補測試。要照這樣做嗎？',
      },
    ],
  },
  {
    id: 'claude-code-guide',
    group: '內建專用型',
    name: 'claude-code-guide',
    mono: true,
    use: '回答 Claude Code 功能問題',
    trigger: '你問 Claude Code 相關問題時',
    beats: [
      { kind: 'user', text: 'Claude Code 的 hooks 要怎麼設定？' },
      { kind: 'main', text: '這是 Claude Code 功能的問題，交給 claude-code-guide。' },
      { kind: 'call', name: 'claude-code-guide', task: '查 hooks 的設定方式' },
      { kind: 'work', text: '查閱 Claude Code 官方文件 · Hooks' },
      { kind: 'done', text: 'Done' },
      {
        kind: 'reply',
        who: 'main',
        text: 'hooks 寫在 settings.json，可以在工具執行前後自動跑你指定的指令。',
      },
    ],
  },
  {
    id: 'statusline-setup',
    group: '內建專用型',
    name: 'statusline-setup',
    mono: true,
    use: '設定狀態列',
    trigger: (
      <>
        執行 <Code>/statusline</Code> 時
      </>
    ),
    beats: [
      { kind: 'user', text: '/statusline 顯示目前的模型與 git 分支', mark: '/statusline' },
      { kind: 'main', text: '執行了 /statusline，交給 statusline-setup 設定。' },
      { kind: 'call', name: 'statusline-setup', task: '設定狀態列' },
      { kind: 'work', text: '建立 ~/.claude/statusline.sh' },
      { kind: 'work', text: '修改 ~/.claude/settings.json → statusLine' },
      { kind: 'done', text: 'Done · 狀態列設定完成' },
      { kind: 'reply', who: 'main', text: '設定好了，狀態列會顯示目前的模型與 git 分支。' },
    ],
  },
  {
    id: 'custom',
    group: '自訂型',
    name: '你自己定義的 agent',
    mono: false,
    use: '依你的設定',
    trigger: (
      <>
        <Code>description</Code> 符合任務時；寫上「<Code>use proactively</Code>」會更積極
      </>
    ),
    file: {
      path: '.claude/agents/code-reviewer.md',
      line: 'description: Reviews code for quality. Use proactively after code changes.',
      mark: 'Use proactively',
    },
    beats: [
      { kind: 'user', text: '登入表單的驗證我改好了。' },
      {
        kind: 'main',
        text: '剛改完程式碼，符合 code-reviewer 的 description，派它來看。',
      },
      { kind: 'call', name: 'code-reviewer', task: '檢查登入表單的修改' },
      { kind: 'work', text: '讀取 git diff' },
      { kind: 'work', text: '讀取 src/auth/LoginForm.tsx' },
      { kind: 'done', text: 'Done · 2 個建議' },
      {
        kind: 'reply',
        who: 'main',
        text: 'code-reviewer 建議：密碼不要寫進 log、錯誤訊息改成通用文字。',
      },
    ],
  },
];

const STAGES = ['你提出需求', '主 Agent 派出', 'SubAgent 執行', '回報'] as const;

function stageOf(beat: Beat) {
  if (beat.kind === 'user') return 0;
  if (beat.kind === 'main' || beat.kind === 'call') return 1;
  if (beat.kind === 'work') return 2;
  return 3;
}

/** 左側的選單列（比第 4 頁的 MenuItem 矮，7 項才塞得進 720） */
function AgentRow({
  index,
  agent,
  on,
  onClick,
}: {
  index: number;
  agent: AgentType;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex h-[76px] w-full items-center gap-4 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} size-9 text-[17px] ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`truncate text-[24px] leading-tight text-paper ${
            agent.mono ? 'font-mono' : ''
          } ${on ? 'font-semibold' : ''}`}
        >
          {agent.name}
        </span>
        <span
          className={`truncate text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}
        >
          {agent.use}
        </span>
      </span>
    </button>
  );
}

/** 終端機下方的進度：你 → 主 Agent → SubAgent → 回報 */
function StageTrack({ stage, finished }: { stage: number; finished: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {STAGES.map((label, index) => {
        const current = index === stage;
        const tone = current
          ? finished
            ? 'border-teal bg-teal font-semibold text-on-accent'
            : 'border-acid bg-acid font-semibold text-on-accent'
          : index < stage
            ? 'border-line text-paper'
            : 'border-line-soft text-faint';
        return (
          <Fragment key={label}>
            {index > 0 && <span className="text-[18px] text-faint">→</span>}
            <span
              className={`rounded-full border px-3.5 py-1 text-[17px] transition-colors duration-300 ${tone}`}
            >
              {index < stage ? `✓ ${label}` : label}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

function TypesTerminal({ agent }: { agent: AgentType }) {
  const last = agent.beats.length - 1;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (tick >= last) return;
    const timer = window.setTimeout(
      () => setTick((value) => value + 1),
      tick === 0 ? 900 : 750,
    );
    return () => window.clearTimeout(timer);
  }, [tick, last]);

  const finished = tick >= last;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <WindowBar title="Terminal — my-project · claude" badge={agent.mode} />

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 px-7 py-5">
        {agent.file && (
          <Row who="file" show>
            <div className="rounded-lg border border-dashed border-line bg-panel px-4 py-1.5 text-[18px] leading-[1.5]">
              <p className="text-faint">{agent.file.path}</p>
              <p className="text-paper">
                <Marked text={agent.file.line} mark={agent.file.mark} />
              </p>
            </div>
          </Row>
        )}
        <Transcript beats={agent.beats} shown={tick + 1} />
      </div>

      <div className="flex h-[60px] shrink-0 items-center gap-4 border-t border-line bg-panel px-5">
        <StageTrack stage={stageOf(agent.beats[tick])} finished={finished} />
        <button type="button" onClick={() => setTick(0)} className={`ml-auto ${BTN_SMALL}`}>
          重播
        </button>
      </div>
    </div>
  );
}

export function ClaudeTypesDemo() {
  const [picked, setPicked] = useState(AGENT_TYPES[0].id);
  const current = AGENT_TYPES.find((agent) => agent.id === picked) ?? AGENT_TYPES[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：依分類分組的選單 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        {AGENT_GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-2">
            <span className={`flex h-[26px] items-center ${LABEL_FAINT}`}>{group}</span>
            {AGENT_TYPES.filter((agent) => agent.group === group).map((agent) => (
              <AgentRow
                key={agent.id}
                index={AGENT_TYPES.indexOf(agent)}
                agent={agent}
                on={agent.id === picked}
                onClick={() => setPicked(agent.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── 右：用途＋觸發時機，下方是情境 ────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <div
          key={current.id}
          className="slide-enter flex h-[148px] shrink-0 flex-col justify-center gap-2.5 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-7"
        >
          <div className="flex items-center gap-4">
            <span
              className={`text-[30px] leading-none font-semibold text-acid ${
                current.mono ? 'font-mono' : ''
              }`}
            >
              {current.name}
            </span>
            <span className="rounded-full border border-line px-3 py-0.5 text-[17px] text-muted">
              {current.group}
            </span>
          </div>
          <dl className="grid grid-cols-[128px_1fr] items-baseline gap-x-4 gap-y-1 text-[22px] leading-[1.45]">
            <dt className="text-[18px] text-faint">用途</dt>
            <dd className="text-paper">{current.use}</dd>
            <dt className="text-[18px] text-faint">自動觸發時機</dt>
            <dd className="text-paper">{current.trigger}</dd>
          </dl>
        </div>

        <TypesTerminal key={current.id} agent={current} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 17 頁 · ClaudeInvokeDemo — Claude Code 的 SubAgent 呼叫方式
 *
 * callout：「AI Coding Tool SubAgent 的呼叫方式 - Claude。左邊列出選單，
 * 右邊提供示意圖。劃掉的可以不用」
 *
 *   分類        手動呼叫方式                    範例
 *   通用型      自然語言要求，不指定類型        用 subagent 跑測試，只回報失敗的項目
 *   內建專用型  自然語言點名                    用 Explore subagent 找出所有呼叫這個函式的地方
 *   自訂型      自然語言點名（由 Claude 決定是否委派）
 *                                               Use the code-reviewer subagent to review my changes
 *   自訂型      @-mention（保證執行）           @"code-reviewer (agent)" 看一下 auth 的修改
 *                                               或 @agent-code-reviewer
 *   Fork        斜線指令                        /subtask 幫目前的 parser 修改寫單元測試
 *   （劃掉不放：平行研究、整個 session 以它運行、Plugin 提供的 agent、串接多個 agent。
 *     分類表把 Fork 劃掉了，但呼叫方式表沒有，所以這頁照放。）
 *
 * 左：5 種方式（分類小標＋呼叫方式＋一句特性）。
 * 右上：終端機。選了哪一項，就把那句範例 prompt 逐字打進輸入列（等寬字、
 *       觸發 SubAgent 的關鍵字標 teal）→ 送出 → 主 Agent 派出 → 回報。
 *       Fork 走另一條路：提示列下方多一個背景面板，你可以繼續下指令，
 *       完成後結果以訊息回到主對話。
 * 右下：特性卡。「誰決定要不要派出？」Claude 判斷 vs 你指定（保證執行），
 *       再列三條這種方式的特性。
 *
 * 高度預算：
 *   左欄  標籤 26 ＋ gap 12 ＋ 5 列 × 124 ＋ gap 12 × 4 ≈ 706
 *   右欄  終端機 500 ＋ gap 16 ＋ 特性卡 204
 *         終端機 ＝ 視窗列 48 ＋ 內文 452（py 40，可用 412）
 *         內文最高：啟動列 30 ＋ 對話（2 列 × 30 ＋ SubAgent 方塊 120 ＋ 回報 30）
 *         ＋ 輸入列 64 ＋ gap 14 × 5 ≈ 374 ＜ 412
 *         特性卡 ＝ py 40 ＋ 標籤 26 ＋ 兩顆 52 的膠囊 ＋ gap ≈ 190
 * ══════════════════════════════════════════════════════════════ */

interface InvokeWay {
  id: string;
  group: string;
  name: string;
  sub: string;
  /** 範例 prompt，逐字照講師的表格 */
  prompt: string;
  /** prompt 裡觸發 SubAgent 的那一段 */
  mark: string;
  decider: 'claude' | 'you';
  traits: readonly ReactNode[];
  /** 第一個 beat 一定是送出的那句 prompt */
  beats: readonly Beat[];
  /** Fork 才有：提示列下方的背景面板 */
  fork?: { task: string };
}

function invokeWay(
  way: Omit<InvokeWay, 'beats'> & { after: readonly Beat[] },
): InvokeWay {
  const { after, ...rest } = way;
  return {
    ...rest,
    beats: [{ kind: 'user', text: way.prompt, mark: way.mark }, ...after],
  };
}

const INVOKE_WAYS: readonly InvokeWay[] = [
  invokeWay({
    id: 'general',
    group: '通用型',
    name: '自然語言要求，不指定類型',
    sub: '只說「用 subagent」，類型交給 Claude 挑',
    prompt: '用 subagent 跑測試，只回報失敗的項目',
    mark: 'subagent',
    decider: 'claude',
    traits: [
      '不用記任何 agent 的名字',
      '沒有指定類型，派哪一種由 Claude 挑',
      '適合一次性的獨立工作，不必建立設定檔',
    ],
    after: [
      { kind: 'main', text: '好，我派一個 subagent 去跑測試。' },
      { kind: 'call', name: 'general-purpose', task: '跑測試，只回報失敗項目' },
      { kind: 'work', text: '執行 npm test → 48 個測試' },
      { kind: 'done', text: 'Done · 2 個失敗' },
      {
        kind: 'reply',
        who: 'main',
        text: '有 2 個測試失敗：login.test.ts、cart.test.ts，其他都通過。',
      },
    ],
  }),
  invokeWay({
    id: 'builtin',
    group: '內建專用型',
    name: '自然語言點名',
    sub: '直接寫出 Explore 這類內建名稱',
    prompt: '用 Explore subagent 找出所有呼叫這個函式的地方',
    mark: 'Explore',
    decider: 'claude',
    traits: [
      '在句子裡說出內建 agent 的名字，例如 Explore',
      '內建的 agent 不需要另外設定',
      '用自然語言點名，仍由 Claude 判斷是否委派',
    ],
    after: [
      { kind: 'main', text: '好，交給 Explore 去找。' },
      { kind: 'call', name: 'Explore', task: '找出呼叫 formatPrice 的地方' },
      { kind: 'work', text: '搜尋 "formatPrice(" → 6 處' },
      { kind: 'done', text: 'Done · 唯讀，沒有修改檔案' },
      {
        kind: 'reply',
        who: 'main',
        text: 'formatPrice 在 6 個地方被呼叫，集中在 cart/ 與 checkout/。',
      },
    ],
  }),
  invokeWay({
    id: 'custom-nl',
    group: '自訂型',
    name: '自然語言點名',
    sub: '由 Claude 決定是否委派',
    prompt: 'Use the code-reviewer subagent to review my changes',
    mark: 'code-reviewer',
    decider: 'claude',
    traits: [
      <>
        點名的是你在 <Code>.claude/agents/</Code> 自訂的 agent
      </>,
      'Claude 會看任務內容，決定要不要委派',
      '想確定一定由它執行，改用 @-mention',
    ],
    after: [
      { kind: 'main', text: '這適合交給 code-reviewer，我請它看一下。' },
      { kind: 'call', name: 'code-reviewer', task: 'Review my changes' },
      { kind: 'work', text: '讀取 git diff → 3 個檔案' },
      { kind: 'done', text: 'Done · 2 個建議' },
      {
        kind: 'reply',
        who: 'main',
        text: 'code-reviewer 建議：補上錯誤處理、把重複的驗證抽成函式。',
      },
    ],
  }),
  invokeWay({
    id: 'mention',
    group: '自訂型',
    name: '@-mention',
    sub: '保證執行：指定由這個 agent 來跑',
    prompt: '@"code-reviewer (agent)" 看一下 auth 的修改',
    mark: '@"code-reviewer (agent)"',
    decider: 'you',
    traits: [
      '輸入 @ 從選單挑 agent，跟 @ 檔案一樣',
      <>
        也可以手動輸入：<Code>@agent-code-reviewer</Code>
      </>,
      '整句話仍交給 Claude，由它寫給 agent 的任務說明',
    ],
    after: [
      { kind: 'main', text: '收到，交給 code-reviewer。' },
      { kind: 'call', name: 'code-reviewer', task: '檢查 auth 的修改' },
      { kind: 'work', text: '讀取 src/auth/ 的 diff' },
      { kind: 'done', text: 'Done · 1 個問題' },
      {
        kind: 'reply',
        who: 'main',
        text: 'code-reviewer 發現：token 過期時沒有導回登入頁。',
      },
    ],
  }),
  invokeWay({
    id: 'fork',
    group: 'Fork',
    name: '斜線指令',
    sub: '用 /subtask 開一個 Fork',
    prompt: '/subtask 幫目前的 parser 修改寫單元測試',
    mark: '/subtask',
    decider: 'you',
    fork: { task: '幫目前的 parser 修改寫單元測試' },
    traits: [
      'Fork 繼承目前整段對話，不用重新說明',
      '在背景執行，完成後結果回到主對話',
      <>
        v2.1.212 起才有；v2.1.161–2.1.211 用 <Code>/fork</Code>
      </>,
    ],
    after: [
      { kind: 'user', text: '繼續處理 parser 的錯誤訊息' },
      { kind: 'main', text: '好，我先看錯誤訊息的部分。' },
      { kind: 'reply', who: 'fork', text: '已新增 parser.test.ts，寫好 6 個單元測試。' },
    ],
  }),
];

/** 左側的選單列：分類小標＋呼叫方式＋一句特性 */
function InvokeItem({
  index,
  way,
  on,
  onClick,
}: {
  index: number;
  way: InvokeWay;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex h-[124px] w-full items-center gap-5 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} size-10 text-[18px] ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className={`text-[17px] ${on ? 'font-semibold text-acid' : 'text-faint'}`}>
          {way.group}
        </span>
        <span className={`text-[26px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {way.name}
        </span>
        <span className={`truncate text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {way.sub}
        </span>
      </span>
    </button>
  );
}

function InvokeTerminal({ way }: { way: InvokeWay }) {
  const total = way.prompt.length;
  const last = way.beats.length;
  const [typed, setTyped] = useState(0);
  const [step, setStep] = useState(0);

  /* 先逐字打進輸入列，打完停一下再送出（step 1），之後每 850ms 多一列 */
  useEffect(() => {
    const next =
      typed < total
        ? { delay: typed === 0 ? 600 : 55, run: () => setTyped((value) => value + 1) }
        : step < last
          ? { delay: step === 0 ? 650 : 850, run: () => setStep((value) => value + 1) }
          : null;
    if (!next) return;
    const timer = window.setTimeout(next.run, next.delay);
    return () => window.clearTimeout(timer);
  }, [typed, step, total, last]);

  const sent = step >= 1;
  const finished = step >= last;
  const typing = !sent && typed > 0;
  const status = !sent
    ? typed < total
      ? '輸入中…'
      : '送出'
    : finished
      ? '完成'
      : '執行中…';

  const replay = () => {
    setTyped(0);
    setStep(0);
  };

  return (
    <div className="flex h-[500px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <WindowBar
        title="Terminal — my-project · claude"
        right={
          <>
            <span className="text-[17px] text-muted">{status}</span>
            <button type="button" onClick={replay} className={BTN_SMALL}>
              重播
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 px-7 py-5">
        <p className="font-mono text-[20px] leading-[1.5] text-muted">~/my-project $ claude</p>

        <Transcript beats={way.beats} shown={step} />

        {/* 輸入列：範例 prompt 逐字打進來 */}
        <div
          className={`mt-auto flex h-16 shrink-0 items-center rounded-xl border-2 bg-panel px-5 font-mono text-[22px] transition-colors duration-300 ${
            typing ? 'border-acid' : 'border-line'
          }`}
        >
          <span className="text-faint">{'> '}</span>
          {!sent && (
            <span className="whitespace-pre text-paper">
              <Marked text={way.prompt} mark={way.mark} upto={typed} />
            </span>
          )}
          <span className="animate-pulse text-paper">▌</span>
        </div>

        {/* Fork：提示列下方的背景面板 */}
        {way.fork && (
          <div
            className={`flex h-12 shrink-0 items-center gap-4 rounded-xl border border-teal/55 border-l-[6px] border-l-teal bg-panel px-5 ${REVEAL} ${
              sent ? SHOWN : HIDDEN
            }`}
          >
            <span className="text-[17px] font-semibold text-teal">Fork</span>
            <span className="min-w-0 truncate font-mono text-[19px] text-paper">
              {way.fork.task}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-2 text-[17px]">
              {finished ? (
                <span className="font-semibold text-teal">✓ 完成，結果回到主對話</span>
              ) : (
                <>
                  <span className="size-2.5 animate-pulse rounded-full bg-teal" />
                  <span className="text-muted">背景執行中，你可以繼續工作</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeciderPill({
  on,
  tone,
  label,
  note,
}: {
  on: boolean;
  tone: 'acid' | 'teal';
  label: string;
  note: string;
}) {
  const onClass =
    tone === 'acid' ? 'border-acid border-l-acid bg-acid/14' : 'border-teal border-l-teal bg-teal/14';
  const dot = tone === 'acid' ? 'bg-acid' : 'bg-teal';
  return (
    <div
      className={`flex h-[52px] items-center gap-3 rounded-xl border border-l-[6px] px-4 transition-colors duration-300 ${
        on ? onClass : 'border-line-soft border-l-line bg-panel'
      }`}
    >
      <span className={`size-3 shrink-0 rounded-full ${on ? dot : 'border-2 border-line'}`} />
      <span className={`text-[22px] ${on ? 'font-semibold text-paper' : 'text-muted'}`}>
        {label}
      </span>
      <span className={`text-[18px] ${on ? 'text-paper' : 'text-faint'}`}>{note}</span>
    </div>
  );
}

export function ClaudeInvokeDemo() {
  const [picked, setPicked] = useState(INVOKE_WAYS[0].id);
  const current = INVOKE_WAYS.find((way) => way.id === picked) ?? INVOKE_WAYS[0];
  const byYou = current.decider === 'you';

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：5 種呼叫方式 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <span className={LABEL_FAINT}>手動呼叫 SubAgent 的方式</span>
        <div className="flex flex-col gap-3">
          {INVOKE_WAYS.map((way, index) => (
            <InvokeItem
              key={way.id}
              index={index}
              way={way}
              on={way.id === picked}
              onClick={() => setPicked(way.id)}
            />
          ))}
        </div>
      </div>

      {/* ── 右：終端機＋特性卡 ───────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <InvokeTerminal key={current.id} way={current} />

        <div
          key={`card-${current.id}`}
          className={`slide-enter grid min-h-0 flex-1 grid-cols-[420px_1fr] gap-10 rounded-2xl border border-line border-l-[6px] bg-panel px-7 py-5 ${
            byYou ? 'border-l-teal' : 'border-l-acid'
          }`}
        >
          <div className="flex flex-col gap-2.5">
            <span className={LABEL_FAINT}>誰決定要不要派出？</span>
            <DeciderPill on={!byYou} tone="acid" label="Claude 判斷" note="由 Claude 決定是否委派" />
            <DeciderPill on={byYou} tone="teal" label="你指定" note="保證執行" />
          </div>
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className={LABEL_FAINT}>這種方式的特性</span>
            <ul className="flex flex-col gap-2">
              {current.traits.map((trait, index) => (
                <li key={index} className="flex gap-3 text-[22px] leading-snug text-paper">
                  <span className="text-faint">—</span>
                  <span className="min-w-0">{trait}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
