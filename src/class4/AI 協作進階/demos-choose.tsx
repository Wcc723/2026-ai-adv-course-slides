import { useState, type ReactNode } from 'react';
import generalStrongUrl from './images/general-strong.png';
import generalHandoffUrl from './images/general-handoff.png';
import customCostUrl from './images/custom-cost.png';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第三章 實際使用 SubAgent：通用型還是自訂型
 *
 *   第 20 頁  GeneralEnoughDemo   絕大部分通用型就夠用
 *   第 21 頁  WhenCustomDemo      什麼時候該用自訂型
 *
 * 原始內容來源：Notion「AI 協作進階－SubAgents 與外部服務整合」的 callout
 * 「什麼時候該用通用型／什麼時候該用自訂型」，講師指定版型是
 * 「左邊是選項，右邊則呈現情境」。callout 原文重點：
 *
 *   通用型就夠用：一、現在的模型夠強；二、現在模型之間的溝通能力很強，
 *     你只要跟主 Agent 講好要做的事，它自然就可以交辦通用的 SubAgent 去做；
 *     三、維護自訂 agent 本身也有成本，定義檔要寫、要調、要跟著專案演進更新。
 *   自訂型的四個時機：
 *     它做了你不希望它做的事 —— 可以設定它能用哪些 MCP、限制它的權限，
 *       不希望它檢視程式碼時順手修改程式
 *     專責的模型 —— 通用型不會幫你選合適的模型，有些行為用較便宜的模型就能跑
 *     某段指示一直在重講 —— 又不適合放進 CLAUDE.md／AGENTS.md（干擾主 Agent 的認知）
 *     團隊裡每個人的結果差很多 —— 多人協作時自訂共用的 SubAgent，讓結果一致
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫、可以換掉）：
 *   - 第 20 頁三張插圖（images/general-strong.png、general-handoff.png、
 *     custom-cost.png）是 Codex Image 生成的，第一項的副標「寫程式、讀文件、
 *     跑測試」是照插圖的內容寫的。
 *   - 第 21 頁的情境：src/auth/login.ts 這類檔名、code-reviewer／quick-search／
 *     test-writer／pr-reviewer 這幾個 agent 名稱、對話與回報內容、寫測試的三條規則、
 *     三位成員拿到的 review 結果，全部是示意。
 *   - 定義檔的欄位照官方文件寫：Claude Code 是 .claude/agents/*.md 的 frontmatter
 *     （name、description、tools、model），Codex 是 .codex/agents/*.toml
 *     （name、description、sandbox_mode、developer_instructions）。
 *   - 花費只用相對的 $$$／$ 與長條表示，沒有寫任何真實價格。
 *
 * 用色（每頁最多兩支強調色）：
 *   第 20 頁  acid（選單選取、插圖上的標籤）＋ teal（結論卡）
 *   第 21 頁  acid（選單選取）＋ teal（自訂型的解法）。
 *             通用型的不理想結果一律中性：虛線框 ＋ 深色 paper 標籤，不用 coral。
 *             右上「通用型／自訂型」切換鈕也是中性（bg-paper），不另佔一支強調色。
 * 淡底一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 *
 * 高度預算：Panel 內可用約 1744 × 768，根容器一律 h-[720px] max-w-[1740px]，
 * 沒有任何容器會捲動。各頁的細項寫在該頁的註解裡。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const C = {
  muted: 'var(--color-muted)',
  inkSoft: 'var(--color-ink-soft)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一列（同 demos-subagent.tsx 的 MenuItem） */
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

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心（同 demos-subagent.tsx） */
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
 * 第 20 頁 · GeneralEnoughDemo — 絕大部分通用型就夠用
 *
 * callout：「絕大部分通用型就夠用：第一，現在的模型夠強；第二，現在模型之間的
 * 溝通能力很強，你只要跟主 Agent 講好你要做的事情，它自然就可以交辦這些通用的
 * SubAgent 去做；維護自訂 agent 本身也有成本。定義檔要寫、要調、要跟著專案演進
 * 更新。」講師指定右邊用 Codex Image 生成的情境插圖。
 *
 * 左：三個理由（標題 ＋ callout 的一句話），底下一張結論卡。
 * 右：對應的插圖。三張圖疊在同一個畫框裡用 opacity 交叉淡入，
 *     切換時不會閃白，也等於先把三張都載好。左上角掛一枚 acid 標籤對回選單。
 *
 * 寬度：左 556 ＋ gap 32 ＋ 右 1152 ＝ 1740。插圖 1300 × 813（16:10），
 *       放進 1152 × 720 的畫框剛好等比填滿（object-contain，幾乎沒有留邊）。
 * 高度（左欄）：標籤 26 ＋ gap 16 ＋ 選單 3 × 約 125 ＋ 2 × 12 ≈ 441，
 *       結論卡約 150 用 mt-auto 貼底，合計約 607 < 720。
 * ══════════════════════════════════════════════════════════════ */

type ReasonId = 'strong' | 'handoff' | 'cost';

const REASONS: readonly {
  id: ReasonId;
  name: string;
  sub: string;
  src: string;
  alt: string;
}[] = [
  {
    id: 'strong',
    name: '現在的模型夠強',
    sub: '寫程式、讀文件、跑測試，一位通用型就接得住。',
    src: generalStrongUrl,
    alt: '一位通用型機器人坐在桌前，同時寫程式、讀文件、看著測試全部通過，神情輕鬆',
  },
  {
    id: 'handoff',
    name: '模型之間的溝通能力很強',
    sub: '跟主 Agent 講好要做的事，它自然會交辦給通用的 SubAgent。',
    src: generalHandoffUrl,
    alt: '主 Agent 簡短交代一句，三位通用型 SubAgent 各自領走任務卡、回到座位開工',
  },
  {
    id: 'cost',
    name: '維護自訂 agent 也有成本',
    sub: '定義檔要寫、要調，還要跟著專案演進更新。',
    src: customCostUrl,
    alt: '一位機器人被一大疊設定檔淹沒，拿著扳手一份一份調整，旁邊的專案還在一直長高',
  },
];

export function GeneralEnoughDemo() {
  const [reason, setReason] = useState<ReasonId>('strong');
  const currentIndex = Math.max(
    0,
    REASONS.findIndex((item) => item.id === reason),
  );
  const current = REASONS[currentIndex];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[556px_1152px] gap-8">
      {/* ── 左：三個理由 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>為什麼通用型就夠用</span>
        <div className="flex flex-col gap-3">
          {REASONS.map((item, index) => (
            <MenuItem
              key={item.id}
              index={index}
              name={item.name}
              sub={item.sub}
              on={item.id === reason}
              onClick={() => setReason(item.id)}
            />
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel px-6 py-5">
          <p className="text-[24px] leading-normal text-paper">
            絕大部分的情況，
            <br />
            <span className="font-semibold text-teal">通用型 SubAgent</span> 就夠用了。
          </p>
          <p className="mt-2 text-[19px] leading-snug text-muted">
            遇到特定的狀況再自訂 —— 下一頁。
          </p>
        </div>
      </div>

      {/* ── 右：情境插圖 ─────────────────────────────────── */}
      <div className="relative h-[720px] w-[1152px] overflow-hidden rounded-2xl border border-line bg-panel">
        {REASONS.map((item) => {
          const on = item.id === reason;
          return (
            <img
              key={item.id}
              src={item.src}
              alt={item.alt}
              aria-hidden={!on}
              className={`absolute inset-0 size-full object-contain transition-opacity duration-500 ease-out ${
                on ? 'opacity-100' : 'opacity-0'
              }`}
            />
          );
        })}
        <span className="absolute top-5 left-5 rounded-full bg-acid px-4 py-1 text-[17px] font-semibold text-on-accent">
          理由 {pad2(currentIndex + 1)} · {current.name}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 21 頁 · WhenCustomDemo — 什麼時候該用自訂型
 *
 * callout（四個時機，原文精簡）：
 *   01 它做了你不希望它做的事：自訂時可以設定它能用哪些 MCP、限制它的權限。
 *      不希望它做程式碼檢視時順手修改程式，就用自訂的 SubAgent。
 *   02 專責的模型：有些模型非常貴，用通用的話它不會幫你選合適的模型；
 *      有些行為用較便宜的模型就能跑，先自訂好這類 SubAgent。
 *   03 某段指示一直在重講，而且不適合放進 CLAUDE.md 或 AGENTS.md
 *      （干擾主 Agent 的認知），就自訂 SubAgent 讓它跑特定的任務。
 *   04 團隊裡每個人的結果差很多：多人協作時希望結果有一致性，就自訂共用的 SubAgent。
 *
 * 左：四個時機（標題 ＋ 一句話），底下一張收尾卡。
 * 右：情境卡。上方一句情境 ＋「通用型 SubAgent／自訂 SubAgent」切換鈕，
 *     預設先看通用型的不理想結果，按右上切到自訂型看解法；換左邊的時機會回到通用型。
 *     01 的定義檔另有 Claude Code／Codex 兩個分頁；02 的長條在切換時用
 *     transition 從 $$$ 縮到 $，讓學員直接看到「省下來的那一段」。
 *
 * 寬度：左 540 ＋ gap 32 ＋ 右 1168。右卡 px-8 → 內寬 1102。
 * 高度（左欄）：標籤 26 ＋ gap 16 ＋ 選單 4 × 約 127 ＋ 3 × 12 ≈ 586，
 *       收尾卡約 94（mt-auto），合計約 696 < 720。副標都控制在兩行以內。
 * 高度（右卡）：720 − 邊框 2 − py-7 56 ＝ 662；標題列 56 ＋ gap 20 → 情境區 586。
 *       四個情境各自在 586 內：01 約 490、02 約 470、03 約 500、04 約 470。
 * ══════════════════════════════════════════════════════════════ */

type CaseId = 'restrict' | 'model' | 'repeat' | 'team';
type Mode = 'general' | 'custom';

const CASES: readonly { id: CaseId; name: string; sub: string; scene: string }[] = [
  {
    id: 'restrict',
    name: '它做了你不希望它做的事',
    sub: '限制它能用的 MCP 與權限，例如只檢視程式碼、不順手修改。',
    scene: '情境：請 SubAgent 檢視登入的程式碼',
  },
  {
    id: 'model',
    name: '專責的模型',
    sub: '通用型不會幫你挑模型；簡單的工作，指定較便宜的模型就能跑。',
    scene: '情境：三件簡單的小工作',
  },
  {
    id: 'repeat',
    name: '某段指示一直在重講',
    sub: '又不適合放進 CLAUDE.md／AGENTS.md，就寫進自訂 SubAgent。',
    scene: '情境：每次請它寫測試，都要交代同一段規則',
  },
  {
    id: 'team',
    name: '團隊裡每個人的結果差很多',
    sub: '多人協作時，共用同一個自訂 SubAgent，讓結果有一致性。',
    scene: '情境：三位成員各自請 SubAgent review 同一個 PR',
  },
];

const MODES: readonly { id: Mode; label: string }[] = [
  { id: 'general', label: '通用型 SubAgent' },
  { id: 'custom', label: '自訂 SubAgent' },
];

/* ── 第 21 頁的小零件 ───────────────────────────────────── */

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex shrink-0 rounded-xl border border-line bg-panel-lift p-1">
      {MODES.map((item) => {
        const on = item.id === mode;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={on}
            className={`h-11 rounded-lg px-5 text-[20px] transition-colors duration-200 ${
              on ? 'bg-paper font-semibold text-on-accent' : 'text-muted hover:text-paper'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** 問題標籤：深色中性，不佔強調色 */
function ProblemChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-paper px-3 py-0.5 text-[17px] font-semibold whitespace-nowrap text-on-accent">
      {children}
    </span>
  );
}

/** 情境底下的一句結論：通用型用 muted 左粗條，自訂型用 teal 左粗條 */
function SceneNote({ tone, children }: { tone: Mode; children: ReactNode }) {
  return (
    <div
      className={`shrink-0 rounded-2xl border border-line border-l-[6px] bg-panel px-6 py-4 text-[22px] leading-normal text-paper ${
        tone === 'custom' ? 'border-l-teal' : 'border-l-muted'
      }`}
    >
      {children}
    </div>
  );
}

/** 定義檔：檔名列 ＋ 等寬字的內容，hl 指定的行（0 起算）加 teal 左粗條 */
function CodeFile({
  file,
  lines,
  hl,
}: {
  file: string;
  lines: readonly string[];
  hl: readonly number[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <div className="flex h-11 items-center border-b border-line px-5 font-mono text-[17px] text-muted">
        {file}
      </div>
      <div className="py-3">
        {lines.map((line, index) => {
          const on = hl.includes(index);
          return (
            <div
              key={`${index}-${line}`}
              className={`border-l-[6px] px-5 font-mono text-[19px] leading-[1.7] whitespace-pre text-paper ${
                on ? 'border-l-teal bg-teal/14 font-semibold' : 'border-l-transparent'
              }`}
            >
              {line || ' '}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 模擬的執行紀錄視窗 */
function RunLog({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-line px-6">
        <span className="text-[19px] font-semibold text-paper">{title}</span>
        <span className="text-[18px] text-muted">{sub}</span>
      </div>
      <div className="flex flex-col gap-2 px-6 py-5 font-mono text-[19px] leading-[1.7] whitespace-pre text-paper">
        {children}
      </div>
    </div>
  );
}

const REVIEW_ASK = '> 幫我檢視 src/auth/login.ts，列出問題就好';

/* ── 01 它做了你不希望它做的事 ───────────────────────────
 * 通用型：讀完、找到問題，接著兩筆 Edit（虛線框 ＋「順手改了程式」）。
 * 自訂型：左邊定義檔（Claude Code／Codex 分頁），右邊同一個請求只回報、不修改。
 * 高度：通用型 視窗約 400 ＋ gap 20 ＋ 結論 65 ≈ 485；
 *       自訂型 兩欄約 380 ＋ gap 20 ＋ 結論 65 ≈ 465。
 */

type AgentTool = 'claude' | 'codex';

const REVIEWER_FILES: Record<
  AgentTool,
  { label: string; file: string; name: string; lines: string[]; hl: number[]; note: string; block: string }
> = {
  claude: {
    label: 'Claude Code',
    file: '.claude/agents/code-reviewer.md',
    name: 'code-reviewer',
    lines: [
      '---',
      'name: code-reviewer',
      'description: 只做程式碼檢視，不修改檔案',
      'tools: Read, Grep, Glob',
      '---',
      '檢視程式碼，列出問題與建議。',
    ],
    hl: [3],
    note: 'tools 只開放讀取類的工具，沒有 Edit、Write。',
    block: '工具清單裡沒有 Edit、Write',
  },
  codex: {
    label: 'Codex',
    file: '.codex/agents/reviewer.toml',
    name: 'reviewer',
    lines: [
      'name = "reviewer"',
      'description = "只做程式碼檢視，不修改檔案"',
      'sandbox_mode = "read-only"',
      'developer_instructions = """',
      '檢視程式碼，列出問題與建議。',
      '"""',
    ],
    hl: [2],
    note: 'sandbox_mode 設成唯讀，寫不了檔案。',
    block: 'sandbox 是唯讀，寫不了檔案',
  },
};

function RestrictScene({ mode }: { mode: Mode }) {
  const [tool, setTool] = useState<AgentTool>('claude');
  const spec = REVIEWER_FILES[tool];

  if (mode === 'general') {
    return (
      <div key="general" className="slide-enter flex h-full flex-col gap-5">
        <RunLog title="通用型 SubAgent" sub="能用的工具：全部">
          <p className="text-muted">{REVIEW_ASK}</p>
          <p>● Read   src/auth/login.ts</p>
          <p>● Grep   "token" src/auth/</p>
          <p>● 找到 2 個問題：token 過期沒處理、錯誤訊息太詳細</p>
          <div className="relative mt-3 rounded-xl border-2 border-dashed border-paper px-4 pt-3 pb-2">
            <span className="absolute -top-4 right-5 font-sans">
              <ProblemChip>順手改了程式</ProblemChip>
            </span>
            <p>● Edit   src/auth/login.ts      +12 −4</p>
            <p>● Edit   src/auth/session.ts    +5 −1</p>
          </div>
          <p className="text-muted">● 問題都順便修好了。</p>
        </RunLog>
        <SceneNote tone="general">
          通用型什麼工具都能用：看完覺得該改，就順手改了 —— 但你只是想要一份檢視報告。
        </SceneNote>
      </div>
    );
  }

  return (
    <div key="custom" className="slide-enter flex h-full flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        {/* 左：定義檔 */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            {(Object.keys(REVIEWER_FILES) as AgentTool[]).map((id) => {
              const on = id === tool;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTool(id)}
                  aria-pressed={on}
                  className={`h-10 rounded-lg border px-4 text-[18px] transition-colors duration-200 ${
                    on
                      ? 'border-paper bg-paper font-semibold text-on-accent'
                      : 'border-line bg-panel text-muted hover:text-paper'
                  }`}
                >
                  {REVIEWER_FILES[id].label}
                </button>
              );
            })}
          </div>
          <CodeFile file={spec.file} lines={spec.lines} hl={spec.hl} />
          <p className="text-[19px] leading-snug text-muted">{spec.note}</p>
        </div>

        {/* 右：同一個請求，只回報 */}
        <RunLog title="自訂 SubAgent" sub={spec.name}>
          <p className="text-muted">{REVIEW_ASK}</p>
          <p>● Read   src/auth/login.ts</p>
          <p>● Grep   "token" src/auth/</p>
          <p>● 回報：2 個問題，附上修改建議</p>
          <div className="mt-3 rounded-xl border border-teal/55 border-l-[6px] border-l-teal bg-teal/14 px-4 py-3 font-sans text-[20px] leading-normal whitespace-normal">
            <p className="text-paper">{spec.block}</p>
            <p className="font-semibold text-teal">→ 只看、只回報，程式維持原樣</p>
          </div>
        </RunLog>
      </div>
      <SceneNote tone="custom">
        自訂時可以限制它能用的工具、MCP 與權限，讓它只做你交代的那件事。
      </SceneNote>
    </div>
  );
}

/* ── 02 專責的模型 ─────────────────────────────────────
 * 同樣三件小工作。左：誰來跑（通用型的說明卡／自訂型的定義檔）；
 * 右：每件工作的相對花費長條。長條的 DOM 不隨模式重建，切換時 width 用
 * transition 從 100% 縮到 25%，虛線外框留著，看得到省下來的那一段。
 * 高度：右欄 標籤 26 ＋ 12 ＋ 3 × 81 ＋ 2 × 24 ≈ 330；左欄定義檔約 270；
 *       ＋ gap 20 ＋ 結論 65，合計約 420。
 */

const LIGHT_TASKS = ['搜尋用到 useAuth 的檔案', '整理測試輸出的失敗清單', '列出這次改了哪些檔案'];

const QUICK_AGENT = [
  '---',
  'name: quick-search',
  'description: 搜尋檔案、整理輸出的小工作',
  'model: haiku',
  '---',
];

function ModelScene({ mode }: { mode: Mode }) {
  const custom = mode === 'custom';

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-[480px_1fr] gap-8">
        {/* 左：誰來跑 */}
        <div key={mode} className="slide-enter flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>誰來跑</span>
          {custom ? (
            <>
              <CodeFile file=".claude/agents/quick-search.md" lines={QUICK_AGENT} hl={[3]} />
              <p className="text-[19px] leading-snug text-muted">
                在定義檔裡指定 model，這類工作就固定用較便宜的模型。
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-line border-l-[6px] border-l-muted bg-ink-soft px-6 py-5">
              <p className="text-[26px] font-semibold text-paper">通用型 SubAgent</p>
              <p className="mt-3 text-[21px] leading-normal text-muted">沒有指定模型</p>
              <p className="text-[21px] leading-normal text-paper">→ 跟主 Agent 用同一個模型</p>
              <p className="mt-3 text-[19px] leading-snug text-muted">
                不會因為工作簡單，就幫你換成便宜的。
              </p>
            </div>
          )}
        </div>

        {/* 右：相對花費 */}
        <div className="flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>同樣三件小工作 · 相對花費</span>
          <div className="flex flex-col gap-6">
            {LIGHT_TASKS.map((task) => (
              <div key={task} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[22px] text-paper">{task}</span>
                  <span className="font-mono text-[18px] text-muted">
                    {custom ? 'model: haiku' : '主 Agent 的模型'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-10 flex-1 rounded-lg border-2 border-dashed border-line">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-md transition-[width,background-color] duration-700 ease-out ${
                        custom ? 'w-1/4 bg-teal' : 'w-full bg-muted'
                      }`}
                    />
                  </div>
                  <span
                    className={`w-[64px] shrink-0 font-mono text-[24px] font-semibold ${
                      custom ? 'text-teal' : 'text-paper'
                    }`}
                  >
                    {custom ? '$' : '$$$'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SceneNote tone={mode}>
        {custom
          ? '這類工作，較便宜的模型就跑得動 —— 先把這種 SubAgent 自訂好。'
          : '有些模型非常貴，簡單的小事也用同一個模型在跑。'}
      </SceneNote>
    </div>
  );
}

/* ── 03 某段指示一直在重講 ──────────────────────────────
 * 通用型：左邊同一段規則講了三次；右邊「那放進 CLAUDE.md？」→ 主 Agent 不管
 *         做什麼都會讀到，跟這次任務無關的規則也一直在（虛線框）。
 * 自訂型：規則寫進 test-writer 的定義；主 Agent 的 Context 不再有這段，
 *         要寫測試時才派它出去。
 * 高度：通用型 左欄 26 ＋ 12 ＋ 3 × 113 ＋ 2 × 12 ≈ 400 ＋ 20 ＋ 結論 65 ≈ 485；
 *       自訂型 左欄定義檔約 300、右欄約 380 ＋ 20 ＋ 結論 65 ≈ 465。
 */

const TEST_RULES = '寫測試時用 Vitest，一個 test 只驗一件事，外部 API 一律 mock。';
const CURRENT_TASK = '這次的需求：修正登入按鈕的樣式';

function ContextRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3 text-[20px] leading-snug text-paper">
      {children}
    </div>
  );
}

function RepeatScene({ mode }: { mode: Mode }) {
  if (mode === 'general') {
    return (
      <div key="general" className="slide-enter flex h-full flex-col gap-5">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
          <div className="flex min-h-0 flex-col gap-3">
            <span className={LABEL_FAINT}>每次都要重講一次</span>
            {[1, 2, 3].map((count) => (
              <div key={count} className="rounded-2xl bg-ink-soft px-5 py-3">
                <span className="text-[17px] font-semibold text-muted">第 {count} 次</span>
                <p className="mt-1 text-[20px] leading-normal text-paper">{TEST_RULES}</p>
              </div>
            ))}
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <span className={LABEL_FAINT}>那放進 CLAUDE.md／AGENTS.md？</span>
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-soft px-5 py-5">
              <span className="text-[20px] font-semibold text-paper">主 Agent 每次都會讀到</span>
              <ContextRow>{CURRENT_TASK}</ContextRow>
              <ContextRow>CLAUDE.md · 專案慣例、常用指令</ContextRow>
              <div className="relative mt-2 rounded-xl border-2 border-dashed border-paper bg-panel px-4 py-3 text-[20px] leading-snug text-paper">
                <span className="absolute -top-4 right-4">
                  <ProblemChip>跟這次的任務無關</ProblemChip>
                </span>
                CLAUDE.md · 寫測試的細節規則
              </div>
            </div>
          </div>
        </div>
        <SceneNote tone="general">
          放進 CLAUDE.md，主 Agent 不管做什麼都帶著它 —— 干擾主 Agent 的認知。
        </SceneNote>
      </div>
    );
  }

  return (
    <div key="custom" className="slide-enter flex h-full flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
        <div className="flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>寫進自訂 SubAgent 的定義</span>
          <CodeFile
            file=".claude/agents/test-writer.md"
            lines={[
              '---',
              'name: test-writer',
              'description: 撰寫與修正單元測試',
              '---',
              '寫測試時用 Vitest。',
              '一個 test 只驗一件事。',
              '外部 API 一律 mock。',
            ]}
            hl={[4, 5, 6]}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>主 Agent 這邊</span>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-soft px-5 py-5">
            <span className="text-[20px] font-semibold text-paper">主 Agent 每次都會讀到</span>
            <ContextRow>{CURRENT_TASK}</ContextRow>
            <ContextRow>CLAUDE.md · 專案慣例、常用指令</ContextRow>
          </div>
          <p className="pl-6 text-[20px] font-semibold text-teal">↓ 要寫測試時，才派它出去</p>
          <div className="rounded-2xl border-2 border-teal bg-panel px-5 py-4">
            <p className="font-mono text-[20px] font-semibold text-teal">test-writer</p>
            <p className="mt-1 text-[19px] leading-snug text-muted">
              寫測試的規則只放在它自己的 Context 裡
            </p>
          </div>
        </div>
      </div>
      <SceneNote tone="custom">
        規則寫一次就好；只在派它出去時用到，主 Agent 不再被這段干擾。
      </SceneNote>
    </div>
  );
}

/* ── 04 團隊裡每個人的結果差很多 ────────────────────────
 * 通用型：三位成員各自請通用型 review 同一個 PR，拿到一大段文字、零散的條列、
 *         一句 LGTM（虛線框 ＋ 深色標籤）。
 * 自訂型：上方一條共用的定義檔，三位拿到同樣格式、同樣重點的結果（teal 左粗條）。
 * 高度：通用型 3 × 120 ＋ 2 × 16 ＋ 16 ＋ 結論 65 ≈ 473；
 *       自訂型 定義檔列 54 ＋ 3 × 94 ＋ 3 × 16 ＋ 16 ＋ 結論 65 ≈ 465。
 */

const MEMBERS = ['成員 A', '成員 B', '成員 C'] as const;

const TEAM_FINDINGS: readonly { level: string; file: string; issue: string }[] = [
  { level: '高風險', file: 'login.ts', issue: 'token 過期後沒有重新取得' },
  { level: '中風險', file: 'session.ts', issue: '錯誤訊息透露太多細節' },
];

function Member({ name }: { name: string }) {
  return (
    <div className="flex w-[92px] shrink-0 flex-col items-center gap-1">
      <svg viewBox="0 0 80 80" className="size-[56px]" aria-hidden>
        <Person cx={40} cy={24} r={17} color={C.muted} />
      </svg>
      <span className="text-[18px] text-paper">{name}</span>
    </div>
  );
}

function GeneralOutput({ index }: { index: number }) {
  if (index === 0) {
    return (
      <p className="text-[20px] leading-normal text-muted">
        整體寫得不錯，不過登入那段可以再想想，錯誤處理好像有點怪，變數命名也可以再統一一下……
      </p>
    );
  }
  if (index === 1) {
    return (
      <ul className="flex flex-wrap gap-x-8 gap-y-1 text-[20px] leading-normal text-paper">
        <li>・建議改用 async/await</li>
        <li>・縮排不一致</li>
        <li>・少了 token 過期的處理</li>
      </ul>
    );
  }
  return <p className="text-[22px] text-paper">LGTM，看起來沒問題。</p>;
}

const GENERAL_TAGS = ['一大段，抓不到重點', '重點各不相同', '什麼都沒抓到'] as const;

function TeamScene({ mode }: { mode: Mode }) {
  if (mode === 'general') {
    return (
      <div key="general" className="slide-enter flex h-full flex-col gap-4">
        {MEMBERS.map((member, index) => (
          <div key={member} className="flex items-center gap-5">
            <Member name={member} />
            <span className="text-[28px] text-faint">→</span>
            <div className="relative flex min-h-[112px] flex-1 items-center rounded-2xl border-2 border-dashed border-line bg-ink-soft px-6 pt-5 pb-3">
              <span className="absolute -top-4 right-5">
                <ProblemChip>{GENERAL_TAGS[index]}</ProblemChip>
              </span>
              <GeneralOutput index={index} />
            </div>
          </div>
        ))}
        <div className="mt-auto">
          <SceneNote tone="general">同一個 PR，三個人拿到三種格式、三種重點。</SceneNote>
        </div>
      </div>
    );
  }

  return (
    <div key="custom" className="slide-enter flex h-full flex-col gap-4">
      <div className="flex items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-teal bg-ink-soft px-6 py-3">
        <span className="font-mono text-[20px] font-semibold text-paper">
          .claude/agents/pr-reviewer.md
        </span>
        <span className="text-[19px] text-muted">
          放在專案的 repo 裡，大家共用同一份（Codex 是 .codex/agents/）
        </span>
      </div>
      {MEMBERS.map((member) => (
        <div key={member} className="flex items-center gap-5">
          <Member name={member} />
          <span className="text-[28px] text-teal">→</span>
          <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-teal/55 border-l-[6px] border-l-teal bg-panel px-6 py-3">
            {TEAM_FINDINGS.map((finding) => (
              <div key={finding.file} className="flex items-baseline gap-5">
                <span className="w-[88px] shrink-0 text-[19px] font-semibold text-teal">
                  {finding.level}
                </span>
                <span className="w-[150px] shrink-0 font-mono text-[19px] text-muted">
                  {finding.file}
                </span>
                <span className="text-[20px] text-paper">{finding.issue}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto">
        <SceneNote tone="custom">
          同一份定義檔：格式一樣、重點一樣，大家的結果有一定的一致性。
        </SceneNote>
      </div>
    </div>
  );
}

export function WhenCustomDemo() {
  const [caseId, setCaseId] = useState<CaseId>('restrict');
  const [mode, setMode] = useState<Mode>('general');
  const current = CASES.find((item) => item.id === caseId) ?? CASES[0];

  function pick(id: CaseId) {
    setCaseId(id);
    setMode('general');
  }

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：四個時機 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>這四種情況，再自訂</span>
        <div className="flex flex-col gap-3">
          {CASES.map((item, index) => (
            <MenuItem
              key={item.id}
              index={index}
              name={item.name}
              sub={item.sub}
              on={item.id === caseId}
              onClick={() => pick(item.id)}
            />
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-4">
          <p className="text-[20px] leading-normal text-paper">
            通用型夠用就先用通用型；
            <br />
            遇到這幾種情況，再
            <span className="font-semibold text-acid">自訂 SubAgent</span>。
          </p>
        </div>
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-5 rounded-2xl border border-line bg-panel px-8 py-7">
        <div className="flex h-14 shrink-0 items-center justify-between gap-6">
          <p className="text-[22px] leading-snug text-paper">{current.scene}</p>
          <ModeSwitch mode={mode} onChange={setMode} />
        </div>
        <div key={caseId} className="slide-enter min-h-0 flex-1">
          {caseId === 'restrict' && <RestrictScene mode={mode} />}
          {caseId === 'model' && <ModelScene mode={mode} />}
          {caseId === 'repeat' && <RepeatScene mode={mode} />}
          {caseId === 'team' && <TeamScene mode={mode} />}
        </div>
      </div>
    </div>
  );
}
