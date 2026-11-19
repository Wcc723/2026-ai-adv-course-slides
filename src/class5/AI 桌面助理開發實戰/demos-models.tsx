import { useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 共有的能力：模型強度
 *
 *   第 13 頁  ModelsDemo  模型強度：ChatGPT ／ Claude 左右對照，
 *                         分頁切「模型／Effort／方案差異」
 *
 * 這個檔案原本還有 WorkLogicDemo（2026-11-10 版的第 9 頁「補充：ChatGPT 的 Work 邏輯」——
 * Chat、Work（雲端）、Work（本地）、Codex 四欄 ＋ 隨堂判斷）。講師 2026-11-17 要求
 * 「移動到『ChatGPT、Claude 共有的能力』的前面，專注介紹 ChatGPT 獨有的介面」
 * 「這一頁字太多了，可以使用介面，介紹 ChatGPT Work、Codex（你可以拆兩、三頁介紹）」，
 * 所以那一頁連同只有它用到的型別、資料與小圖示都刪掉了，改成用介面示意講的
 * 第 8、9 頁 demos-interface-chatgpt.tsx（Chat／Work／Codex 的介面、Work 的 Local／Cloud）
 * 與第 10 頁 demos-interface-codex.tsx（Codex）。舊頁的來源與哪些說法被拿掉，
 * 寫在 demos-interface-chatgpt.tsx 的註解。ModelsDemo 本身沒有改，只是頁碼從 8 變 12，
 * 2026-11-18 開場多了訂閱調查（第 6 頁）再變成 13。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（Notion「課綱 › ChatGPT vs Claude」）
 * ──────────────────────────────────────────────────────────────
 * - 「模型強度」callout：這邊列出兩家各自的模型、Effort，另外也提一下以目前方案
 *   來說，什麼樣的費率是否有什麼樣的差異（例如：Fable、最高 Effort 等…
 *   → 三個分頁就是這三件事；Fable 與最高 Effort 用 acid 標出來。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-10，全部是官方頁面）
 * ──────────────────────────────────────────────────────────────
 *   OpenAI
 *   - https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt
 *     Chat 的 Thinking 滑桿：Instant／Medium／High／Extra High／Pro；
 *     GPT-6 Sol 驅動 Instant～Extra High，Pro 是 GPT-6 Pro（GPT-6 Astra 驅動）。
 *     方案表：Plus 有 Medium、High，沒有 Extra High 與 Pro；Pro／Business／Enterprise 全有；
 *     Free、Go 用 GPT-5.6 Luna，難題按 Think（也是 Luna）。
 *   - https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex
 *     Work／Codex 的模型清單（GPT-6.1 Sol、GPT-6.1 Terra、GPT-6 Sol、GPT-6 Luna，
 *     加上 GPT-6 Astra 與 GPT-5.6 家族）；Default 把模型與推理合成一條滑桿。
 *   - https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex
 *     「Astra 開 Low 可能勝過 Sol 開 High」；Pro 100／200／500 在 Work／Codex 沒有 5 小時限制。
 *   - https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers
 *     Pro 100／200／500 ＝ US$100／200／500，Ultrafast 只有 Pro 500。
 *   - https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus   Plus US$20
 *   - https://help.openai.com/en/articles/11989085-what-is-chatgpt-go    Go 的內容（沒寫美元價）
 *   - https://chatgpt.com/zh-Hant/pricing/   台灣定價頁：Go NT$270、Plus NT$690、
 *     Pro NT$3,300 起；Astra：Free、Go 沒有，Plus 有限額。
 *   - 2026-11-17 研究補充（還沒放上畫面）：https://learn.chatgpt.com/docs/pricing 寫
 *     "GPT-6.1 Sol is available in Work and Codex, not Chat."（GPT-6.1 Terra 同樣只在 Work／Codex）。
 *   Anthropic
 *   - https://platform.claude.com/docs/en/about-claude/models/overview
 *     目前的四個：Fable 5.2、Opus 5.5、Sonnet 5.5、Haiku 5.5 與各自的定位。
 *   - https://platform.claude.com/docs/en/build-with-claude/effort
 *     五級 low／medium／high／xhigh／max 的說明。
 *   - https://support.claude.com/en/articles/8664678
 *     App 裡的 Effort：Low、Medium、High、Extra high、Max；Extra high 只在 Opus 4.7
 *     以後的模型；目前的模型 Thinking 關不掉；Enterprise 管理員可以關掉某些等級；
 *     點輸入框旁的模型名稱切換，舊版本在 More models。文中沒有任何方案限制。
 *   - https://support.claude.com/en/articles/15424964-claude-fable-5-on-your-plan
 *     Fable：Free 不能用；Pro 走 usage credits；Max、Ultra、Team Premium 內含，
 *     上限是每週額度的 50%（不是額外的額度）。
 *   - https://claude.com/pricing
 *     Free US$0、Pro US$20（年繳每月 $17）、Max US$100（Pro 的 5 倍）、
 *     Ultra US$200（每週 10 倍、驗證帳號沒有 5 小時限制）；Free 只有 Sonnet、Haiku。
 *
 * 補的示意（Notion 沒寫、可以換掉）：
 * - 每一列的短標籤（最強、主力、均衡、最快）是照官方的定位描述歸納的。
 * - Effort 分頁的「誰能開到哪一格」橫條，是把官方方案表畫成圖。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（只有一支強調色 acid）
 * ──────────────────────────────────────────────────────────────
 *   acid ＝「方案會影響能不能用的地方」：GPT-6 Pro／Astra、Fable 5.2、
 *   Extra High 與 Pro 兩格、方案表裡的「最高推理」「Fable 內含」。
 *   分頁選取用中性的 bg-paper，不跟 acid 搶語意。
 *   淡底（/14）一律配 6px 不透明左粗條；強調格用實色框，不靠填色。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   頂列 56 ＋ 16 ＋ 主區 572 ＋ 16 ＋ 重點條 60 ＝ 720
 *     欄卡 py-5 ＋ 框 2 → 內高 530；欄頭 40 ＋ 12 → 分頁內容 478
 *     模型    ChatGPT  小標 24 ＋ 10 ＋ 四列 (70 × 4 ＋ 8 × 3 = 304) ＋ 16
 *                      ＋ 小標 24 ＋ 10 ＋ 晶片兩行 (38 × 2 ＋ 8 = 84)      ≈ 472
 *             Claude   小標 24 ＋ 10 ＋ 四列 304 ＋ 16 ＋ 小標 24 ＋ 10 ＋ 說明 64 ≈ 452
 *             晶片寬：第一行五顆 17px mono 約 733 ＜ 欄內寬 800，固定兩行
 *     Effort  小標 24 ＋ 12 ＋ 刻度 72 ＋ 12 ＋ 橫條 (30 × 3 ＋ 8 × 2 = 106)
 *             ＋ 16 ＋ 說明卡 140 ＋ 12 ＋ 附註 56                         ≈ 450
 *     方案    表頭 40 ＋ 四列 (90 × 4 = 360) ＋ 12 ＋ 附註 64（兩行）      ≈ 476
 *   浮水印在右上：頂列只有左邊的分頁與查核日、Claude 欄頭靠左。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <p className={`${LABEL_FAINT} h-6 shrink-0 leading-6`}>{children}</p>
  );
}

/** 重點字：acid ＋ 粗體 */
function Hot({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-acid">{children}</span>;
}

/* ══════════════════════════════════════════════════════════════
 * 第 13 頁 · ModelsDemo — 模型強度
 *
 * 頂列三個分頁；主區左右兩欄（ChatGPT ／ Claude），內容跟著分頁換；
 * 底部一條「重點」跟著分頁換一句話。一進來停在「模型」。
 * ══════════════════════════════════════════════════════════════ */

type ModelsTabKey = 'models' | 'effort' | 'plans';

interface ModelsTab {
  key: ModelsTabKey;
  label: string;
  /** 兩欄欄頭右邊的小字 */
  sub: { chatgpt: string; claude: string };
  takeaway: ReactNode;
}

const MODEL_TABS: readonly ModelsTab[] = [
  {
    key: 'models',
    label: '模型',
    sub: { chatgpt: '桌面版的模型選單', claude: '桌面版的模型選單' },
    takeaway: (
      <>
        兩家最強的模型都要看方案：ChatGPT 是 <Hot>GPT-6 Astra</Hot>，Claude 是{' '}
        <Hot>Fable 5.2</Hot>。
      </>
    ),
  },
  {
    key: 'effort',
    label: 'Effort',
    sub: { chatgpt: '推理強度（Thinking）', claude: '推理強度（Effort）' },
    takeaway: (
      <>
        ChatGPT 的 <Hot>Extra High 與 Pro</Hot> 要 Pro、Business 或 Enterprise；
        Claude 的 Effort 五級，官方沒有寫方案限制。
      </>
    ),
  },
  {
    key: 'plans',
    label: '方案差異',
    sub: { chatgpt: '個人方案 · 月費', claude: '個人方案 · 月費' },
    takeaway: (
      <>
        最大的差別：ChatGPT 用方案鎖「<Hot>最高推理</Hot>」，Claude 用方案鎖「
        <Hot>Fable</Hot>」。
      </>
    ),
  },
];

/** 一欄的外框：欄頭（名字＋小字）＋ 分頁內容 */
function VendorColumn({
  name,
  sub,
  children,
}: {
  name: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-7 py-5">
      <header className="flex h-10 shrink-0 items-baseline gap-4">
        <h3 className="font-display text-[30px] leading-none font-semibold text-paper">
          {name}
        </h3>
        <span className="text-[19px] text-faint">{sub}</span>
      </header>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

/* ── 分頁一：模型 ─────────────────────────────────────── */

interface ModelInfo {
  name: string;
  tag: string;
  desc: string;
  /** 方案會影響能不能用 → acid */
  hot?: boolean;
}

const CHATGPT_CHAT_MODELS: readonly ModelInfo[] = [
  {
    name: 'GPT-6 Pro',
    tag: '最強（Astra 驅動）',
    desc: 'Thinking 滑桿拉到「Pro」才會用到；要 Pro、Business 或 Enterprise',
    hot: true,
  },
  {
    name: 'GPT-6',
    tag: '付費方案的預設',
    desc: 'Instant 到 Extra High 都是它（GPT-6 Sol 驅動），Plus 起可用',
  },
  {
    name: 'GPT-5.6 Sol',
    tag: '上一代',
    desc: '還能在選單裡指定、留在 GPT-5.6；Pro 等級是 GPT-5.6 Sol Pro',
  },
  {
    name: 'GPT-5.6 Luna',
    tag: 'Free、Go 的預設',
    desc: 'Free 與 Go 的預設模型；難題按 Think，用的也是它',
  },
];

/** Work／Codex 的模型清單（跟 Chat 是兩份） */
const CHATGPT_WORK_MODELS: readonly { name: string; hot?: boolean }[] = [
  { name: 'GPT-6 Astra', hot: true },
  { name: 'GPT-6.1 Sol' },
  { name: 'GPT-6.1 Terra' },
  { name: 'GPT-6 Sol' },
  { name: 'GPT-6 Luna' },
  { name: 'GPT-5.6 Sol／Terra／Luna' },
];

const CLAUDE_MODELS: readonly ModelInfo[] = [
  {
    name: 'Fable 5.2',
    tag: '最強',
    desc: '給高難度推理、長時間的 agent 工作；能不能用、怎麼計費要看方案',
    hot: true,
  },
  {
    name: 'Opus 5.5',
    tag: '主力',
    desc: '長時間的 agentic coding 與知識工作；官方建議多數工作從它開始',
  },
  {
    name: 'Sonnet 5.5',
    tag: '均衡',
    desc: '速度與智慧最好的組合；Free 方案也能用',
  },
  {
    name: 'Haiku 5.5',
    tag: '最快',
    desc: '大量、要求低延遲的工作，例如分類、擷取',
  },
];

function ModelRow({ name, tag, desc, hot = false }: ModelInfo) {
  return (
    <div
      className={`flex h-[70px] shrink-0 items-center gap-5 rounded-xl border border-l-[6px] px-5 ${
        hot
          ? 'border-acid border-l-acid bg-panel'
          : 'border-line-soft border-l-line bg-panel-lift'
      }`}
    >
      <span className="flex w-[210px] shrink-0 flex-col gap-0.5">
        <span
          className={`font-display text-[26px] leading-tight font-semibold ${
            hot ? 'text-acid' : 'text-paper'
          }`}
        >
          {name}
        </span>
        <span className="text-[16px] leading-tight text-faint">{tag}</span>
      </span>
      <span className="min-w-0 flex-1 text-[19px] leading-[1.35] break-keep text-pretty text-muted">
        {desc}
      </span>
    </div>
  );
}

function ModelList({ models }: { models: readonly ModelInfo[] }) {
  return (
    <div className="mt-2.5 flex shrink-0 flex-col gap-2">
      {models.map((model) => (
        <ModelRow key={model.name} {...model} />
      ))}
    </div>
  );
}

function ChatgptModels() {
  return (
    <>
      <SubLabel>Chat 的模型選單</SubLabel>
      <ModelList models={CHATGPT_CHAT_MODELS} />

      <div className="mt-4">
        <SubLabel>Work／Codex 是另一份清單</SubLabel>
      </div>
      <div className="mt-2.5 flex shrink-0 flex-wrap gap-2">
        {CHATGPT_WORK_MODELS.map((model) => (
          <span
            key={model.name}
            className={`flex h-[38px] items-center rounded-lg border px-3.5 font-mono text-[17px] ${
              model.hot
                ? 'border-2 border-acid font-semibold text-acid'
                : 'border-line bg-panel-lift text-paper'
            }`}
          >
            {model.name}
          </span>
        ))}
      </div>
    </>
  );
}

function ClaudeModels() {
  return (
    <>
      <SubLabel>點輸入框旁的模型名稱切換</SubLabel>
      <ModelList models={CLAUDE_MODELS} />

      <div className="mt-4">
        <SubLabel>其他版本</SubLabel>
      </div>
      <p className="mt-2.5 flex h-16 shrink-0 items-center rounded-xl border border-line-soft bg-panel-lift px-5 text-[19px] leading-[1.4] text-muted">
        更早的版本（Fable 5.1、Opus 5⋯）收在選單的「More models」裡。
      </p>
    </>
  );
}

/* ── 分頁二：Effort ───────────────────────────────────── */

interface EffortStop {
  name: string;
  desc: string;
  who: string;
  /** 要 Pro 以上方案才開得到 → acid */
  hot?: boolean;
}

/** 一格橫條：base ＝ 這個方案開得到；hot ＝ 開得到、而且是方案才解鎖的那一段；none ＝ 開不到 */
type BarCell = 'base' | 'hot' | 'none';

interface PlanBar {
  label: string;
  /** 五格，對應五個刻度 */
  cells?: readonly BarCell[];
  /** 沒有 cells 時，第一格之後（或整條）改放一句說明 */
  note?: string;
  /** note 從第幾格開始（0 起算），預設 0 */
  noteFrom?: 0 | 1;
  /** 待確認：虛線框 */
  pending?: boolean;
}

interface EffortSide {
  label: string;
  stops: readonly EffortStop[];
  bars: readonly PlanBar[];
  initial: number;
  note: string;
}

const CHATGPT_EFFORT: EffortSide = {
  label: '模型選單裡的 Thinking 滑桿',
  stops: [
    {
      name: 'Instant',
      desc: '快速回答日常問題。Free 與 Go 用的是 GPT-5.6 Luna。',
      who: '所有方案',
    },
    {
      name: 'Medium',
      desc: '標準思考。',
      who: 'Plus、Pro、Business、Enterprise',
    },
    {
      name: 'High',
      desc: '延伸思考。Plus 能開到的最高一級。',
      who: 'Plus、Pro、Business、Enterprise',
    },
    {
      name: 'Extra High',
      desc: 'GPT-6 Sol 能開到的最高思考等級。',
      who: 'Pro、Business、Enterprise（Plus 沒有）',
      hot: true,
    },
    {
      name: 'Pro',
      desc: '改用 Pro 模型 GPT-6 Pro（GPT-6 Astra 驅動），給困難、長時間的工作；有每週訊息上限。',
      who: 'Pro、Business、Enterprise（Plus 沒有）',
      hot: true,
    },
  ],
  bars: [
    {
      label: 'Free、Go',
      cells: ['base', 'none', 'none', 'none', 'none'],
      note: '只有 Instant；難題按 Think（GPT-5.6 Luna）',
      noteFrom: 1,
    },
    { label: 'Plus', cells: ['base', 'base', 'base', 'none', 'none'] },
    { label: 'Pro／商務／企業', cells: ['base', 'base', 'base', 'hot', 'hot'] },
  ],
  initial: 3,
  note: 'Work／Codex 另有一條：選 Default 是模型＋推理合成一條滑桿，指定模型就照那個模型能開的等級。官方提醒：Astra 開 Low，可能比 Sol 開 High 還好。',
};

const CLAUDE_WHO = '官方說明沒有寫方案限制（Free 待確認）';

const CLAUDE_EFFORT: EffortSide = {
  label: '點模型名稱 › Effort',
  stops: [
    {
      name: 'Low',
      desc: '最省、最快，能力會降一些；適合簡單、講清楚就能做的事。',
      who: CLAUDE_WHO,
    },
    {
      name: 'Medium',
      desc: '速度、成本與表現的平衡點。',
      who: CLAUDE_WHO,
    },
    {
      name: 'High',
      desc: '該花多少就花多少，追求好結果：複雜推理、困難的 coding。',
      who: CLAUDE_WHO,
    },
    {
      name: 'Extra high',
      desc: '給長時間的 agent 與 coding 工作（超過 30 分鐘那種）；Opus 4.7 以後的模型才有。',
      who: CLAUDE_WHO,
    },
    {
      name: 'Max',
      desc: '不限制 token 花費的最高能力；比 Extra high 更慢、更貴，常常只多一點點進步。',
      who: CLAUDE_WHO,
    },
  ],
  bars: [
    { label: '付費方案', cells: ['base', 'base', 'base', 'base', 'base'] },
    {
      label: 'Free',
      note: '待確認：官方說明沒寫 Free 能開到哪一級',
      pending: true,
    },
    { label: 'Enterprise', note: '管理員可以關掉某些模型或等級' },
  ],
  initial: 4,
  note: '目前的模型 Thinking 都關不掉，Effort 就是調它想多深的主要開關；選單會在每個模型建議的那一級標上 Default。',
};

const STOP_GRID = 'grid grid-cols-[190px_repeat(5,minmax(0,1fr))]';

function barCellClass(cell: BarCell) {
  if (cell === 'hot') return 'mx-0.5 h-3 rounded-full bg-acid';
  if (cell === 'base') return 'mx-0.5 h-3 rounded-full bg-paper';
  return 'mx-0.5 h-3 rounded-full border border-dashed border-line';
}

function EffortPanel({ side }: { side: EffortSide }) {
  const [picked, setPicked] = useState(side.initial);
  const stop = side.stops[picked];
  const last = side.stops.length - 1;

  return (
    <>
      <SubLabel>{side.label}</SubLabel>

      {/* ── 刻度：五個可以點的點，後面一條軌道 ── */}
      <div className={`mt-3 h-[72px] shrink-0 ${STOP_GRID}`}>
        <span className="flex items-start pt-0.5 text-[17px] text-faint">
          點一格看說明
        </span>
        {side.stops.map((item, index) => {
          const on = index === picked;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setPicked(index)}
              aria-pressed={on}
              className="relative flex flex-col items-center gap-2"
            >
              <span
                aria-hidden="true"
                className={`absolute top-[13px] h-0.5 bg-line ${
                  index === 0 ? 'left-1/2' : 'left-0'
                } ${index === last ? 'right-1/2' : 'right-0'}`}
              />
              <span
                className={`relative size-7 rounded-full border-2 transition-colors duration-200 ${
                  item.hot
                    ? on
                      ? 'border-acid bg-acid'
                      : 'border-acid bg-panel'
                    : on
                      ? 'border-paper bg-paper'
                      : 'border-muted bg-panel'
                }`}
              />
              <span
                className={`font-display text-[20px] leading-tight whitespace-nowrap ${
                  item.hot ? 'text-acid' : on ? 'text-paper' : 'text-muted'
                } ${on ? 'font-semibold' : ''}`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 每個方案能推到哪一格 ── */}
      <div className="mt-3 flex h-[106px] shrink-0 flex-col gap-2">
        {side.bars.map((bar) => (
          <div key={bar.label} className={`h-[30px] items-center ${STOP_GRID}`}>
            <span className="truncate text-[18px] text-muted">{bar.label}</span>
            {bar.cells && bar.noteFrom === undefined &&
              bar.cells.map((cell, index) => (
                <span key={index} className={barCellClass(cell)} />
              ))}
            {bar.cells && bar.noteFrom === 1 && (
              <>
                <span className={barCellClass(bar.cells[0])} />
                <span className="col-span-4 truncate pl-3 text-[17px] text-muted">
                  {bar.note}
                </span>
              </>
            )}
            {!bar.cells && (
              <span
                className={`col-span-5 mx-0.5 flex h-[30px] items-center rounded-lg px-3 text-[17px] text-muted ${
                  bar.pending
                    ? 'border border-dashed border-muted'
                    : 'border border-line-soft bg-panel-lift'
                }`}
              >
                {bar.note}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── 選到的那一格 ── */}
      <div
        key={stop.name}
        className={`slide-enter mt-4 flex h-[140px] shrink-0 flex-col justify-center gap-2 rounded-xl border border-l-[6px] bg-panel-lift px-6 ${
          stop.hot ? 'border-acid border-l-acid' : 'border-line border-l-paper'
        }`}
      >
        <div className="flex items-baseline gap-4">
          <span
            className={`font-display text-[28px] leading-tight font-semibold ${
              stop.hot ? 'text-acid' : 'text-paper'
            }`}
          >
            {stop.name}
          </span>
          <span
            className={`text-[18px] ${stop.hot ? 'font-semibold text-acid' : 'text-muted'}`}
          >
            誰能用：{stop.who}
          </span>
        </div>
        <p className="text-[20px] leading-[1.45] text-muted">{stop.desc}</p>
      </div>

      <p className="mt-3 h-14 shrink-0 text-[19px] leading-[1.45] text-muted">
        {side.note}
      </p>
    </>
  );
}

/* ── 分頁三：方案差異 ─────────────────────────────────── */

interface PlanCell {
  text: string;
  /** hot 的格子：實色框下面再補一行小字，框裡只放短詞，避免框內折行 */
  sub?: string;
  hot?: boolean;
}

interface PlanRow {
  plan: string;
  price: string;
  priceNote?: string;
  a: PlanCell;
  b: PlanCell;
}

interface PlanTable {
  /** 第三、四欄的欄名；hot 的那一欄欄名用 acid */
  columns: readonly [PlanCell, PlanCell];
  rows: readonly PlanRow[];
  note: string;
}

const CHATGPT_PLANS: PlanTable = {
  columns: [{ text: 'Chat 最高推理', hot: true }, { text: '最強模型 Astra' }],
  rows: [
    {
      plan: 'Free／Go',
      price: '0／NT$270',
      priceNote: 'Go：台灣定價頁',
      a: { text: 'Instant＋Think（GPT-5.6 Luna）' },
      b: { text: '不能用' },
    },
    {
      plan: 'Plus',
      price: 'US$20',
      priceNote: '台灣頁 NT$690',
      a: { text: '到 High 為止' },
      b: { text: '只在 Work／Codex，有限額' },
    },
    {
      plan: 'Pro 100／200',
      price: 'US$100／200',
      priceNote: '台灣頁 NT$3,300 起',
      a: { text: 'Extra High＋Pro', hot: true },
      b: { text: 'Chat、Work、Codex 都能用' },
    },
    {
      plan: 'Pro 500',
      price: 'US$500',
      a: { text: 'Extra High＋Pro', hot: true },
      b: { text: '同上，再加 Ultrafast' },
    },
  ],
  note: 'Business、Enterprise 也有 Extra High 與 Pro。Work／Codex 的用量另外算，Pro 方案在那邊沒有 5 小時限制。',
};

const CLAUDE_PLANS: PlanTable = {
  columns: [{ text: '用量（Pro ＝ 1×）' }, { text: 'Fable', hot: true }],
  rows: [
    {
      plan: 'Free',
      price: 'US$0',
      a: { text: '有限額；只有 Sonnet、Haiku' },
      b: { text: '不能用' },
    },
    {
      plan: 'Pro',
      price: 'US$20',
      priceNote: '年繳每月 $17',
      a: { text: '1×；多了 Opus' },
      b: { text: '用 usage credits 另外付費' },
    },
    {
      plan: 'Max',
      price: 'US$100',
      a: { text: '5×（每 5 小時、每週都是）' },
      b: { text: '內含', sub: '最多用到每週額度的一半', hot: true },
    },
    {
      plan: 'Ultra',
      price: 'US$200',
      a: { text: '每週 10×；驗證帳號沒有 5 小時限制' },
      b: { text: '內含', sub: '最多用到每週額度的一半', hot: true },
    },
  ],
  note: 'Team 的 Premium 席位也內含 Fable，Standard 席位走 usage credits。價格未稅，官方保留調整的權利。',
};

const PLAN_GRID = 'grid grid-cols-[160px_150px_1fr_1fr] gap-x-4';

function PlanCellView({ cell }: { cell: PlanCell }) {
  if (cell.hot) {
    return (
      <span className="flex flex-col gap-1">
        <span className="w-fit rounded-lg border-2 border-acid px-3 py-1 text-[19px] leading-snug font-semibold whitespace-nowrap text-acid">
          {cell.text}
        </span>
        {cell.sub && (
          <span className="text-[17px] leading-snug text-muted">{cell.sub}</span>
        )}
      </span>
    );
  }
  return <span className="text-[19px] leading-[1.4] break-keep text-muted">{cell.text}</span>;
}

function PlansPanel({ table }: { table: PlanTable }) {
  return (
    <>
      <div className={`h-10 shrink-0 items-center ${PLAN_GRID}`}>
        <span className={LABEL_FAINT}>方案</span>
        <span className={LABEL_FAINT}>月費</span>
        {table.columns.map((column) => (
          <span
            key={column.text}
            className={`${LABEL_TYPE} ${column.hot ? 'font-semibold text-acid' : 'text-faint'}`}
          >
            {column.text}
          </span>
        ))}
      </div>

      <div className="flex shrink-0 flex-col">
        {table.rows.map((row) => (
          <div
            key={row.plan}
            className={`h-[90px] items-center border-t border-line-soft ${PLAN_GRID}`}
          >
            <span className="font-display text-[26px] leading-tight font-semibold text-paper">
              {row.plan}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-[23px] leading-tight text-paper">
                {row.price}
              </span>
              {row.priceNote && (
                <span className="text-[16px] leading-tight text-faint">
                  {row.priceNote}
                </span>
              )}
            </span>
            <PlanCellView cell={row.a} />
            <PlanCellView cell={row.b} />
          </div>
        ))}
      </div>

      <p className="mt-3 h-16 shrink-0 border-t border-line-soft pt-2 text-[19px] leading-[1.4] text-muted">
        {table.note}
      </p>
    </>
  );
}

/* ── 組起來 ───────────────────────────────────────────── */

export function ModelsDemo() {
  const [tab, setTab] = useState<ModelsTabKey>('models');
  const current = MODEL_TABS.find((item) => item.key === tab) ?? MODEL_TABS[0];

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-4">
      {/* ── 頂列：分頁（靠左，右上留給浮水印） ── */}
      <div className="flex h-14 shrink-0 items-center gap-6">
        <div
          role="tablist"
          className="flex h-14 items-center gap-1 rounded-xl border border-line bg-panel-lift p-1"
        >
          {MODEL_TABS.map((item) => {
            const on = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(item.key)}
                className={`h-full rounded-lg px-8 text-[22px] transition-colors duration-200 ${
                  on
                    ? 'bg-paper font-semibold text-on-accent'
                    : 'text-muted hover:text-paper'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <span className="text-[18px] text-faint">
          查核日 2026-11-10 · 以官方說明頁為準
        </span>
      </div>

      {/* ── 主區：左右對照 ── */}
      <div key={tab} className="slide-enter grid h-[572px] shrink-0 grid-cols-2 gap-6">
        <VendorColumn name="ChatGPT" sub={current.sub.chatgpt}>
          {tab === 'models' && <ChatgptModels />}
          {tab === 'effort' && <EffortPanel side={CHATGPT_EFFORT} />}
          {tab === 'plans' && <PlansPanel table={CHATGPT_PLANS} />}
        </VendorColumn>
        <VendorColumn name="Claude" sub={current.sub.claude}>
          {tab === 'models' && <ClaudeModels />}
          {tab === 'effort' && <EffortPanel side={CLAUDE_EFFORT} />}
          {tab === 'plans' && <PlansPanel table={CLAUDE_PLANS} />}
        </VendorColumn>
      </div>

      {/* ── 重點條 ── */}
      <div className="flex h-[60px] shrink-0 items-center gap-4 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel-lift px-6">
        <span className="shrink-0 rounded-full bg-acid px-3.5 py-1 text-[18px] font-semibold text-on-accent">
          重點
        </span>
        <p className="truncate text-[23px] text-paper">{current.takeaway}</p>
      </div>
    </div>
  );
}
