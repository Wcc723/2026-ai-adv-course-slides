import { useEffect, useState } from 'react';
import workflowsUrl from './images/workflows.png';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第四章 Ultracode、第五章 Loop Engineering 沿用的頁面
 *
 *   第 24 頁  WorkflowsDemo      Claude Code 的 dynamic workflows（截圖導覽）
 *   第 25 頁  UltracodeDemo      開啟 Ultracode：是開關，不是 Effort 的一格
 *   第 29 頁  LoopFlowDemo       Loop Engineering 的回圈（可播放）
 *   第 30 頁  HumanLoopDemo      傳統 AI Coding：繞回圈的是人
 *   第 31 頁  LoopEngineerDemo   Loop Engineering 工程師做的四件事
 *
 * 整個檔案複製自〈5 種 SubAgent 協作模式〉的 demos-level23.tsx（該簡報的
 * 第 9、10、12、13、14 頁）。之後改過兩處：
 *   - 第 24 頁對照條的標籤：原本寫「Level 1 · 基礎 SubAgent」，這堂課沒有 Level 的編號，
 *     改成「一般的 SubAgent」。
 *   - 第 25 頁整頁重寫（2026-10-06）：原版照舊版介面寫「ultracode ＝ xhigh ＋ workflows」、
 *     「Effort 滑桿最右邊一格是 ultracode」；新版官方文件裡 Ultracode 是獨立的開關，
 *     這頁改照官方文件重畫，跟原簡報的第 10 頁已經不同（細節見該頁的區塊註解）。
 *
 * 原始內容來源：Notion「5 種 SubAgent 協作模式」的 callout（第 25 頁除外，改用官方文件）。
 * 第 24 頁的截圖（images/workflows.png）也是從那一頁下載的，是深色終端機畫面，
 * 放在 bg-paper 的截圖框裡，不做調色。原本第 25 頁還有一張 images/ultracode.png
 * （舊版的 Effort 滑桿，最右邊一格是 ultracode），內容已經過時，連同檔案一起刪掉了。
 *
 * 共通規格：
 *   - 這幾頁沒有 description、沒有 caption，放進 Panel（p-10）裡，
 *     可用高度 768。根容器一律 h-[720px] max-w-[1740px]，沒有任何容器會捲動。
 *   - 一頁最多兩支強調色；第 29 頁例外（acid 是游標、teal／coral 是測試結果）。
 *   - 淡底（/14）一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_FAINT =
  'font-display text-[17px] tracking-[0.16em] text-faint uppercase';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110 disabled:border-line disabled:bg-ink-soft disabled:font-normal disabled:text-faint`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid`;

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

type Tone = 'acid' | 'teal' | 'coral';

const TONE_VAR: Record<Tone, string> = {
  acid: C.acid,
  teal: C.teal,
  coral: C.coral,
};

/** 左側可點的選項卡：選到的那張 acid 淡底 ＋ 6px 左粗條 */
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
    coral: C.coral,
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
 * 第 24 頁 · WorkflowsDemo — Claude Code 的 dynamic workflows
 *
 * callout：「把任務派給 SubAgent 的好處之後，Claude Code 做了一個可以更大量
 * 操作 SubAgent 的工作方式。開啟之後，就可以看到畫面上出現這麼大量的 SubAgent。」
 *
 * 截圖是主角（1180 × 538）。右邊三張卡片各對應截圖上的一塊區域，
 * 點哪一張，截圖上就疊一個 acid 外框（百分比定位，座標量自 1080 × 492 原圖）。
 * 截圖下方一條對照：一般的 SubAgent 一次派 3–4 位 → dynamic workflows 一次 16 位。
 *
 * 用色：acid（目前選的卡片、截圖上的外框）＋ teal（16 位 agent 的方塊）。
 * 高度：截圖 538 ＋ gap 24 ＋ 對照條 108 ＝ 670。
 * ══════════════════════════════════════════════════════════════ */

type WfFocus = 'phases' | 'agents' | 'usage';

interface WfPoint {
  id: WfFocus;
  no: string;
  title: string;
  text: string;
  tag: string;
  /** 外框位置，單位是截圖寬高的百分比 */
  box: { left: number; top: number; width: number; height: number };
  /** 標籤放在框內左下（框的下方已經是截圖邊緣時） */
  tagInside?: boolean;
}

const WF_POINTS: readonly WfPoint[] = [
  {
    id: 'phases',
    no: '01',
    title: '任務先拆成好幾個階段',
    text: '左欄的 Phases：Foundation → AcceptanceCriteria → CodeReview → Verify → Completeness → Synthesis，一段一段往下做。',
    tag: 'Phases',
    box: { left: 1.2, top: 4.6, width: 25.8, height: 93 },
    tagInside: true,
  },
  {
    id: 'agents',
    no: '02',
    title: '同一個階段，同時 16 位',
    text: 'CodeReview 這一段一次派出 16 個 agent，各自負責一塊：security、database、python……',
    tag: 'CodeReview · 16 agents',
    box: { left: 27.3, top: 4.2, width: 24.9, height: 75.4 },
  },
  {
    id: 'usage',
    no: '03',
    title: '每一位各自回報',
    text: '每個 agent 用哪個模型、花了多少 token、呼叫幾次工具、跑了多久，都各自列出來。',
    tag: '模型 · token · 工具 · 耗時',
    box: { left: 51.7, top: 8.4, width: 46.6, height: 71.4 },
  },
];

function AgentDots({
  label,
  count,
  filled,
  note,
}: {
  label: string;
  count: number;
  filled: boolean;
  note: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <span className="w-[260px] shrink-0 text-[20px] text-paper">{label}</span>
      <span className="flex shrink-0 gap-2">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={`size-[26px] rounded-md ${
              filled ? 'bg-teal' : 'border-2 border-muted bg-panel'
            }`}
          />
        ))}
      </span>
      <span className="text-[19px] text-muted">{note}</span>
    </div>
  );
}

export function WorkflowsDemo() {
  const [focus, setFocus] = useState<WfFocus>('agents');
  const current = WF_POINTS.find((point) => point.id === focus) ?? WF_POINTS[0];
  const { box } = current;

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <div className="flex w-[1180px] shrink-0 flex-col gap-6">
        <div className="relative h-[538px] w-[1180px] overflow-hidden rounded-2xl border border-line bg-paper">
          <img
            src={workflowsUrl}
            alt="Claude Code dynamic workflows 執行畫面：左欄是 6 個階段，右欄是 CodeReview 階段同時執行的 16 個 agent"
            className="size-full object-contain"
          />
          <div
            className="pointer-events-none absolute rounded-lg border-4 border-acid outline-2 outline-on-accent transition-all duration-500 ease-out"
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            <span
              className={`absolute left-2 rounded-md bg-acid px-3 py-1 text-[17px] font-medium whitespace-nowrap text-on-accent ${
                current.tagInside ? 'bottom-2' : 'top-full mt-2'
              }`}
            >
              {current.tag}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-line px-8 py-5">
          <AgentDots
            label="一般的 SubAgent"
            count={4}
            filled={false}
            note="一次派 3–4 位"
          />
          <AgentDots
            label="Ultracode"
            count={16}
            filled
            note="一次 16 位，還分好幾個階段"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className={LABEL_FAINT}>截圖裡看得到的三件事</p>
        {WF_POINTS.map((point) => (
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
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 25 頁 · UltracodeDemo — 開啟 Ultracode
 *
 * 核心訊息：Ultracode 是一個開關，不是 Effort 的一格。
 *   Effort     決定「想多深」（low／medium／high／xhigh／max）
 *   Ultracode  決定「遇到大任務時，要不要自己編排 dynamic workflows、派出大量 SubAgent」
 *
 * 內容來源：Claude Code 官方文件 Model configuration
 * （https://code.claude.com/docs/en/model-config ，2026-10-06 查核）：
 *   「Ultracode is a Claude Code setting rather than a model effort level: with it on,
 *    Claude orchestrates dynamic workflows for substantive tasks, at whichever effort
 *    level the session runs at.」
 *   三種開啟方式、v2.1.284 的版本註記、不能用的情況都出自同一頁；
 *   五個 Effort 的說明是照該頁「When to use it」表格改寫的。
 *
 * ⚠ 這一頁跟〈5 種 SubAgent 協作模式〉第 10 頁的原版已經不同。原版依舊版介面截圖寫
 *   「ultracode ＝ xhigh ＋ workflows」「Effort 不是最高的（max 更高）」
 *   「Effort 滑桿往右調，最右邊就是 ultracode」—— 那是 v2.1.284 以前的行為。
 *   這裡整頁照新版文件重寫，舊截圖 images/ultracode.png 已經刪除，不要再寫回舊說法。
 *
 * 版面（由上而下）：
 *   一句話    「Ultracode 是一個開關，不是 Effort 的一格」＋一行說明
 *   中排左    用專案色票重畫的「/effort 畫面」示意（1040 寬）：
 *             上面是可點的 Effort 刻度，下面是獨立的 Ultracode 開關（畫面上按 Tab 切換），
 *             最下面一條狀態列說「剛剛換了哪一個、另一個沒有跟著變」。
 *   中排右    說明卡：目前的組合 ＋「想多深」（Effort）＋「遇到大任務」（Ultracode）。
 *             Ultracode 開著時整張卡換成 acid 淡底 ＋ 6px 左粗條。
 *   下排      三種開啟方式（等寬字指令 ＋ 作用範圍標籤 ＋ 一行補充），
 *             最後一行小字：版本註記與不能用的情況。
 *
 * 用色：只有 acid（目前選的 Effort、開啟中的 Ultracode、開啟時說明卡的左粗條）。
 * 高度（2026-10-06 實測，每個組合都一樣）：一句話 86 ＋ gap 24 ＋ 中排 390 ＋ gap 24
 *   ＋ 下排 181 ＝ 705（上限 720）。中排的 390 由左邊的畫面示意撐出來：
 *   標題列 52 ＋ 刻度與開關 286 ＋ 狀態列 52；右邊說明卡跟著拉齊。
 *   說明卡的兩段文字最多各兩行，Effort 說明寫短一點避免最後一兩個字掉到第二行。
 * ══════════════════════════════════════════════════════════════ */

type EffortId = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

const EFFORTS: readonly { id: EffortId; text: string }[] = [
  { id: 'low', text: '想得最少、回得最快，適合腦力激盪、改名這類小事。' },
  { id: 'medium', text: '日常開發、範圍清楚的工作，例如實作一個新功能。' },
  { id: 'high', text: '需要驗證、邊界情況多的工作，例如修既有專案的 bug。' },
  { id: 'xhigh', text: '推理得更深，也花更多 token。' },
  { id: 'max', text: '想到最深，適合讓 Claude 自己啃的難題，例如找資安漏洞；但容易想太多，先試過再用。' },
];

const ULTRA_TEXT = {
  on: '遇到實質的大任務，會自己編排 dynamic workflows，派出大量 SubAgent 分頭做。',
  off: '不會自己編排 dynamic workflows，照一般的方式處理。',
} as const;

const ULTRA_WAYS: readonly {
  cmd: string;
  scope: string;
  note: string;
  noteCode?: string;
}[] = [
  {
    cmd: '/effort ultracode',
    scope: '這個 session',
    note: '關掉：',
    noteCode: '/effort ultracode off',
  },
  {
    cmd: 'claude --effort ultracode',
    scope: '這次啟動',
    note: '這個 session 從 xhigh 開始，不存成預設',
  },
  {
    cmd: '"ultracode": true',
    scope: '所有 session',
    note: '寫進設定檔，例如 ',
    noteCode: '~/.claude/settings.json',
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border border-line bg-panel px-2.5 py-0.5 font-mono text-[18px] text-paper">
      {children}
    </kbd>
  );
}

export function UltracodeDemo() {
  const [level, setLevel] = useState<EffortId>('high');
  const [ultra, setUltra] = useState(true);
  const [changed, setChanged] = useState<'effort' | 'ultra' | null>(null);

  const levelIndex = EFFORTS.findIndex((item) => item.id === level);
  const effort = EFFORTS[levelIndex] ?? EFFORTS[2];

  const pickLevel = (id: EffortId) => {
    setLevel(id);
    setChanged('effort');
  };
  const flipUltra = () => {
    setUltra((value) => !value);
    setChanged('ultra');
  };

  const levelCode = <span className="font-mono font-semibold text-paper">{level}</span>;
  const status =
    changed === 'effort' ? (
      <>
        剛換成 {levelCode}，Ultracode 還是{ultra ? '開' : '關'}著 —— 開關沒有跟著變。
      </>
    ) : changed === 'ultra' ? (
      <>
        剛把 Ultracode {ultra ? '打開' : '關掉'}，Effort 還是 {levelCode} —— 沒有跟著變。
      </>
    ) : (
      '兩個設定各管各的：換其中一個，另一個不會跟著變。'
    );

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col justify-center gap-6">
      {/* ── 一句話 ── */}
      <div>
        <p className="text-[36px] leading-tight font-semibold text-paper">
          Ultracode 是一個<span className="text-acid">開關</span>，不是 Effort 的一格
        </p>
        <p className="mt-2 text-[22px] leading-normal text-muted">
          Effort 決定「想多深」；Ultracode 決定遇到大任務時，要不要自己編排 dynamic
          workflows、派出大量 SubAgent。
        </p>
      </div>

      {/* ── 中排：/effort 畫面示意 ＋ 說明卡 ── */}
      <div className="flex gap-10">
        <div className="flex w-[1040px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex h-[52px] items-center justify-between border-b border-line bg-ink-soft px-8">
            <span className="font-mono text-[20px] font-semibold text-paper">/effort</span>
            <span className="text-[17px] text-faint">示意畫面 · 依官方文件重畫</span>
          </div>

          <div className="flex flex-col gap-5 px-9 pt-6 pb-5">
            {/* Effort 刻度 */}
            <div>
              <div className="flex items-baseline justify-between">
                <p className="flex items-baseline gap-4">
                  <span className="font-mono text-[24px] font-semibold text-paper">Effort</span>
                  <span className="text-[19px] text-muted">想多深</span>
                </p>
                <p className="text-[19px] text-muted">想得少、快<span className="mx-4">→</span>想得深、花更多 token</p>
              </div>
              <div className="relative mt-4 grid grid-cols-5">
                <div className="pointer-events-none absolute top-[14px] right-[10%] left-[10%] h-[4px] rounded-full bg-line" />
                <div
                  className="pointer-events-none absolute top-[14px] left-[10%] h-[4px] rounded-full bg-acid transition-[width] duration-300 ease-out"
                  style={{ width: `${levelIndex * 20}%` }}
                />
                {EFFORTS.map((item) => {
                  const active = item.id === level;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pickLevel(item.id)}
                      className="group relative flex flex-col items-center gap-2.5"
                    >
                      <span
                        className={`relative z-10 size-8 rounded-full border-[3px] transition-colors duration-300 ${
                          active
                            ? 'border-acid bg-acid'
                            : 'border-muted bg-panel group-hover:border-acid'
                        }`}
                      />
                      <span
                        className={`font-mono text-[24px] transition-colors duration-300 ${
                          active ? 'font-semibold text-acid' : 'text-muted'
                        }`}
                      >
                        {item.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-line" />

            {/* Ultracode 開關：獨立一列，不在刻度上 */}
            <div className="flex items-center justify-between gap-8">
              <div className="min-w-0">
                <p className="flex items-baseline gap-4">
                  <span className="font-mono text-[24px] font-semibold text-paper">
                    Ultracode
                  </span>
                  <span className="text-[19px] text-muted">獨立的開關，不在 Effort 刻度上</span>
                </p>
                <p className="mt-1 text-[19px] text-muted">
                  遇到大任務，要不要自己編排 dynamic workflows
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <span className="flex items-center gap-2 text-[19px] text-muted">
                  按 <Kbd>Tab</Kbd> 切換
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ultra}
                  aria-label="Ultracode 開關"
                  onClick={flipUltra}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`w-[30px] text-[24px] font-semibold transition-colors duration-300 ${
                      ultra ? 'text-acid' : 'text-muted'
                    }`}
                  >
                    {ultra ? '開' : '關'}
                  </span>
                  <span
                    className={`relative h-[52px] w-[100px] rounded-full border-2 transition-colors duration-300 ${
                      ultra ? 'border-acid bg-acid' : 'border-muted bg-ink-soft'
                    }`}
                  >
                    <span
                      className={`absolute top-[4px] size-10 rounded-full transition-[left,background-color] duration-300 ease-out ${
                        ultra ? 'left-[52px] bg-on-accent' : 'left-[4px] bg-muted'
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 狀態列：剛剛換了哪一個 */}
          <p className="mt-auto flex h-[52px] items-center gap-3 border-t border-line bg-ink-soft px-8 text-[19px] text-muted">
            <span className="font-mono text-acid">›</span>
            <span>{status}</span>
          </p>
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-l-[6px] px-8 py-6 transition-colors duration-300 ${
            ultra
              ? 'border-acid/55 border-l-acid bg-acid/14'
              : 'border-line border-l-line bg-panel'
          }`}
        >
          <p className={LABEL_FAINT}>目前的組合</p>
          <p className="flex items-baseline gap-3 text-[30px] leading-none font-semibold text-paper">
            <span className="font-mono text-acid">{level}</span>
            <span className="text-muted">＋</span>
            <span>
              Ultracode{' '}
              <span className={ultra ? 'text-acid' : 'text-muted'}>{ultra ? '開' : '關'}</span>
            </span>
          </p>
          <div className="mt-1">
            <p className="text-[17px] text-faint">想多深 · Effort</p>
            <p className="mt-1 text-[21px] leading-normal text-paper">{effort.text}</p>
          </div>
          <div>
            <p className="text-[17px] text-faint">遇到大任務 · Ultracode</p>
            <p className="mt-1 text-[21px] leading-normal text-paper">
              {ultra ? ULTRA_TEXT.on : ULTRA_TEXT.off}
            </p>
          </div>
        </div>
      </div>

      {/* ── 下排：三種開啟方式 ── */}
      <div className="flex flex-col gap-3">
        <p className={LABEL_FAINT}>三種開啟方式</p>
        <div className="grid grid-cols-3 gap-6">
          {ULTRA_WAYS.map((way) => (
            <div
              key={way.cmd}
              className="flex flex-col gap-1.5 rounded-2xl border border-line bg-panel px-6 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[23px] font-semibold whitespace-nowrap text-paper">
                  {way.cmd}
                </span>
                <span className="shrink-0 rounded-md border border-line px-2.5 py-0.5 text-[17px] whitespace-nowrap text-faint">
                  {way.scope}
                </span>
              </div>
              <p className="text-[19px] whitespace-nowrap text-muted">
                {way.note}
                {way.noteCode && <span className="font-mono text-paper">{way.noteCode}</span>}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[19px] text-muted">
          v2.1.284 起開關與 Effort 分開；更早的版本開 ultracode 會固定在 xhigh、選別的等級就關掉。
          <span className="ml-6 text-faint">workflows 被關掉，或模型不支援 xhigh 時無法開啟。</span>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 29 頁 · LoopFlowDemo — Loop Engineering
 *
 * callout：「讓 AI 可以持續開發的一個流程」，並指定線性流程：
 *   目標：完成登入功能 → Claude Code 寫程式 → 自動跑 Test / Lint → 檢查是否通過
 *   → 失敗 → 把錯誤重新丟給 Claude → 修改 → 重新驗證 → 全部通過 → 結束
 *
 * 畫成一條直線接一個回圈：跑 Test → 檢查 → 失敗 → 丟回 Claude → 修改 →
 * 「重新驗證」繞回跑 Test。可以逐步前進或自動播放：前兩輪測試失敗、
 * 第三輪全部通過，右邊是輪數、每一輪的結果、最近一次的測試輸出與 log。
 *
 * 座標（viewBox 1080 × 690，1:1 呈現）：
 *   左欄 x 40  w 300：目標 y30、寫程式 y190、跑 Test y350、修改 y540
 *   中欄 x 440 w 300：檢查 y350、丟回 Claude y540
 *   右欄 x 840 w 200：結束 y350
 *   虛線框（回圈範圍）x 20 y 326 w 740 h 334
 *
 * 用色（這頁例外用三色）：acid＝目前這一步、coral＝測試沒過、teal＝全部通過。
 * 高度：SVG 690；右欄約 620。
 * ══════════════════════════════════════════════════════════════ */

type FlowNode = 'goal' | 'code' | 'test' | 'check' | 'feedback' | 'fix' | 'done';
type FlowArrow =
  | 'goalCode'
  | 'codeTest'
  | 'testCheck'
  | 'checkDone'
  | 'checkFeedback'
  | 'feedbackFix'
  | 'fixTest';

const FLOW_NODE_H = 96;

const FLOW_NODES: Record<
  FlowNode,
  { x: number; y: number; w: number; title: string; sub: string }
> = {
  goal: { x: 40, y: 30, w: 300, title: '目標', sub: '完成登入功能' },
  code: { x: 40, y: 190, w: 300, title: 'Claude Code 寫程式', sub: '登入表單＋驗證邏輯' },
  test: { x: 40, y: 350, w: 300, title: '自動跑 Test / Lint', sub: '每一輪都重跑一次' },
  check: { x: 440, y: 350, w: 300, title: '檢查是否通過', sub: '還沒跑過' },
  feedback: { x: 440, y: 540, w: 300, title: '把錯誤丟回 Claude', sub: '錯誤訊息整段貼回去' },
  fix: { x: 40, y: 540, w: 300, title: '修改', sub: 'Claude 自己改 code' },
  done: { x: 840, y: 350, w: 200, title: '結束', sub: '全部通過' },
};

const FLOW_ARROWS: Record<
  FlowArrow,
  {
    d: string;
    label?: { x: number; y: number; text: string; anchor: 'start' | 'middle'; tone: 'teal' | 'coral' | 'muted' };
  }
> = {
  goalCode: { d: 'M 190 126 L 190 184' },
  codeTest: { d: 'M 190 286 L 190 344' },
  testCheck: { d: 'M 340 398 L 434 398' },
  checkDone: {
    d: 'M 740 398 L 834 398',
    label: { x: 787, y: 382, text: '通過', anchor: 'middle', tone: 'teal' },
  },
  checkFeedback: {
    d: 'M 590 446 L 590 534',
    label: { x: 606, y: 498, text: '失敗', anchor: 'start', tone: 'coral' },
  },
  feedbackFix: { d: 'M 440 588 L 346 588' },
  fixTest: {
    d: 'M 190 540 L 190 452',
    label: { x: 206, y: 503, text: '重新驗證', anchor: 'start', tone: 'muted' },
  },
};

interface FlowStep {
  node: FlowNode;
  round: number;
  arrow?: FlowArrow;
  log: string;
  result?: 'fail' | 'pass';
  output?: string[];
}

const FLOW_SCRIPT: readonly FlowStep[] = [
  { node: 'goal', round: 0, log: '目標：完成登入功能' },
  { node: 'code', round: 0, arrow: 'goalCode', log: 'Claude Code 寫出登入表單與驗證' },
  { node: 'test', round: 1, arrow: 'codeTest', log: '第 1 輪：跑 test、lint' },
  {
    node: 'check',
    round: 1,
    arrow: 'testCheck',
    log: '✕ 2 個測試沒過、lint 2 個錯誤',
    result: 'fail',
    output: [
      '✕ 密碼錯誤時沒有顯示提示',
      '✕ 帳號空白仍然可以送出',
      '✕ lint：2 個未使用的變數',
    ],
  },
  { node: 'feedback', round: 1, arrow: 'checkFeedback', log: '把錯誤訊息丟回給 Claude' },
  { node: 'fix', round: 1, arrow: 'feedbackFix', log: 'Claude 修改 login.ts' },
  { node: 'test', round: 2, arrow: 'fixTest', log: '第 2 輪：重新驗證' },
  {
    node: 'check',
    round: 2,
    arrow: 'testCheck',
    log: '✕ 還有 1 個測試沒過',
    result: 'fail',
    output: [
      '✓ 密碼錯誤提示、帳號空白檢查',
      '✓ lint 0 個錯誤',
      '✕ 勾選「記住我」後重新整理就登出',
    ],
  },
  { node: 'feedback', round: 2, arrow: 'checkFeedback', log: '把錯誤訊息丟回給 Claude' },
  { node: 'fix', round: 2, arrow: 'feedbackFix', log: 'Claude 修改 session.ts' },
  { node: 'test', round: 3, arrow: 'fixTest', log: '第 3 輪：重新驗證' },
  {
    node: 'check',
    round: 3,
    arrow: 'testCheck',
    log: '✓ 全部通過',
    result: 'pass',
    output: ['✓ 12 個測試全部通過', '✓ lint 0 個錯誤'],
  },
  { node: 'done', round: 3, arrow: 'checkDone', log: '全部通過 → 結束，通知你來看' },
];

const FLOW_LAST = FLOW_SCRIPT.length - 1;
const FLOW_ROUNDS = [1, 2, 3] as const;

function arrowTone(arrow: FlowArrow): Tone {
  if (arrow === 'checkFeedback') return 'coral';
  if (arrow === 'checkDone') return 'teal';
  return 'acid';
}

function LoopFlowDiagram({ cursor }: { cursor: number }) {
  const step = FLOW_SCRIPT[cursor];

  /* 到目前為止最近一次的檢查結果，寫在「檢查是否通過」那一格裡 */
  const lastCheck = FLOW_SCRIPT.slice(0, cursor + 1)
    .filter((item) => item.result)
    .at(-1);

  const nodeTone = (id: FlowNode): Tone | null => {
    if (id !== step.node) return null;
    if (id === 'done') return 'teal';
    if (step.result === 'fail') return 'coral';
    if (step.result === 'pass') return 'teal';
    return 'acid';
  };

  return (
    <svg
      width={1080}
      height={690}
      viewBox="0 0 1080 690"
      role="img"
      className="shrink-0"
    >
      <title>Loop Engineering：寫程式、跑測試、檢查，失敗就把錯誤丟回 Claude 修改再驗證，全部通過才結束</title>
      <ArrowMarkers prefix="lf-arrow" />

      {/* 回圈範圍 */}
      <rect
        x={20}
        y={326}
        width={740}
        height={334}
        rx={24}
        fill="none"
        stroke={C.muted}
        strokeWidth={1.5}
        strokeDasharray="8 8"
      />
      <text x={748} y={316} textAnchor="end" fontSize={18} fill={C.muted}>
        Loop：失敗就自己繞回去修
      </text>

      {/* 圖例 */}
      <g fontSize={18} fill={C.muted}>
        <rect x={470} y={44} width={30} height={22} rx={6} fill={C.acid} fillOpacity={0.14} stroke={C.acid} strokeWidth={3} />
        <text x={514} y={62}>目前這一步</text>
        <rect x={470} y={88} width={30} height={22} rx={6} fill={C.coral} fillOpacity={0.14} stroke={C.coral} strokeWidth={3} />
        <text x={514} y={106}>測試沒過</text>
        <rect x={470} y={132} width={30} height={22} rx={6} fill={C.teal} fillOpacity={0.14} stroke={C.teal} strokeWidth={3} />
        <text x={514} y={150}>全部通過</text>
      </g>

      {/* 箭頭 */}
      {(Object.keys(FLOW_ARROWS) as FlowArrow[]).map((id) => {
        const arrow = FLOW_ARROWS[id];
        const active = step.arrow === id;
        const tone = arrowTone(id);
        return (
          <g key={id}>
            <path
              d={arrow.d}
              fill="none"
              stroke={active ? TONE_VAR[tone] : C.muted}
              strokeWidth={active ? 4 : 2}
              markerEnd={`url(#lf-arrow-${active ? tone : 'muted'})`}
              className={SVG_TR}
            />
            {arrow.label && (
              <text
                x={arrow.label.x}
                y={arrow.label.y}
                textAnchor={arrow.label.anchor}
                fontSize={18}
                fontWeight={600}
                fill={
                  arrow.label.tone === 'muted' ? C.muted : TONE_VAR[arrow.label.tone]
                }
              >
                {arrow.label.text}
              </text>
            )}
          </g>
        );
      })}

      {/* 節點 */}
      {(Object.keys(FLOW_NODES) as FlowNode[]).map((id) => {
        const node = FLOW_NODES[id];
        const tone = nodeTone(id);
        const cx = node.x + node.w / 2;

        let sub = node.sub;
        let subFill: string = C.muted;
        if (id === 'check' && lastCheck) {
          sub = lastCheck.result === 'pass' ? '✓ 全部通過' : `✕ 第 ${lastCheck.round} 輪沒過`;
          subFill = lastCheck.result === 'pass' ? C.teal : C.coral;
        }

        return (
          <g key={id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={FLOW_NODE_H}
              rx={16}
              fill={tone ? TONE_VAR[tone] : C.inkSoft}
              fillOpacity={tone ? 0.14 : 1}
              stroke={tone ? TONE_VAR[tone] : C.line}
              strokeWidth={tone ? 4 : 2}
              className={SVG_TR}
            />
            <text
              x={cx}
              y={node.y + 44}
              textAnchor="middle"
              fontSize={24}
              fontWeight={600}
              fill={C.paper}
            >
              {node.title}
            </text>
            <text
              x={cx}
              y={node.y + 74}
              textAnchor="middle"
              fontSize={18}
              fontWeight={id === 'check' && lastCheck ? 600 : 400}
              fill={subFill}
            >
              {sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LoopFlowDemo() {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = FLOW_SCRIPT[cursor];
  const atEnd = cursor === FLOW_LAST;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setCursor((value) => Math.min(value + 1, FLOW_LAST)),
      1300,
    );
    return () => window.clearTimeout(timer);
  }, [running, cursor]);

  const seen = FLOW_SCRIPT.slice(0, cursor + 1);
  const latestOutput = seen.filter((item) => item.output).at(-1)?.output;
  const logs = seen.slice(-5);

  const roundState = (round: number) => {
    const check = seen.find((item) => item.round === round && item.result);
    if (check) return check.result === 'pass' ? 'pass' : 'fail';
    return step.round === round ? 'running' : 'pending';
  };

  const togglePlay = () => {
    if (atEnd) {
      setCursor(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <LoopFlowDiagram cursor={cursor} />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-end justify-between">
          <div>
            <p className={LABEL_FAINT}>Loop 狀態</p>
            <p className="mt-1 font-display text-[44px] leading-none font-semibold text-paper">
              {step.round === 0 ? '準備中' : `第 ${step.round} 輪`}
            </p>
          </div>
          <p className="text-[19px] text-muted">
            {atEnd ? '人只在最後出現' : '這段期間你不用介入'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FLOW_ROUNDS.map((round) => {
            const state = roundState(round);
            const style =
              state === 'pass'
                ? 'border-teal bg-teal/14 text-teal'
                : state === 'fail'
                  ? 'border-coral bg-coral/14 text-coral'
                  : state === 'running'
                    ? 'border-dashed border-acid text-acid'
                    : 'border-dashed border-line text-faint';
            const mark =
              state === 'pass' ? '✓' : state === 'fail' ? '✕' : state === 'running' ? '…' : '';
            return (
              <div
                key={round}
                className={`flex h-[52px] items-center justify-center gap-2 rounded-xl border-2 text-[20px] font-medium transition-colors duration-300 ${style}`}
              >
                第 {round} 輪 <span className="font-mono">{mark}</span>
              </div>
            );
          })}
        </div>

        <div className="flex h-[160px] flex-col gap-2 rounded-xl border border-line bg-ink-soft px-5 py-4">
          <p className={LABEL_FAINT}>最近一次的測試輸出</p>
          {latestOutput ? (
            latestOutput.map((line) => (
              <p
                key={line}
                className={`font-mono text-[18px] leading-snug ${
                  line.startsWith('✓') ? 'text-teal' : 'text-coral'
                }`}
              >
                {line}
              </p>
            ))
          ) : (
            <p className="font-mono text-[18px] text-faint">（還沒跑過測試）</p>
          )}
        </div>

        <div className="flex h-[190px] flex-col gap-1.5">
          <p className={LABEL_FAINT}>log</p>
          {logs.map((item, index) => {
            const latest = index === logs.length - 1;
            return (
              <p
                key={`${cursor - logs.length + index + 1}`}
                className={`truncate text-[20px] leading-[1.5] ${
                  latest ? 'font-medium text-paper' : 'text-muted'
                }`}
              >
                <span className={latest ? 'text-acid' : 'text-faint'}>{'› '}</span>
                {item.log}
              </p>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={atEnd}
            onClick={() => {
              setPlaying(false);
              setCursor((value) => Math.min(value + 1, FLOW_LAST));
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
 * 第 30 頁 · HumanLoopDemo — AI Coding 工程師做什麼
 *
 * callout：傳統的 AI 開發流程
 *   1. 給 AI 一個 prompt（原文「AI 提供一個 prompt」，意思是人提供給 AI）
 *   2. 透過 Harness 去工作完
 *   3. 人類看完成果之後，再提供一個新的 prompt，讓 Harness 修改 code
 *
 * 三格的循環，三格裡有兩格是人。按「下一步」前進，每次走到人的那一格，
 * 「你介入了 N 次」就加一；右邊列出你每一輪打的 prompt —— 其實就是在
 * 手動把錯誤轉述給 AI。跟上一頁對照：那一頁繞回圈的是 AI，這一頁是人。
 *
 * 座標（viewBox 980 × 660，以 1000 寬呈現）：
 *   ① 你寫 prompt  (340, 40)   ② Harness 工作 (640, 500)   ③ 你看成果 (40, 500)
 *   每格 300 × 130。
 *
 * 用色：coral＝人（舊做法、瓶頸）、teal＝AI 在工作。沒有 acid。
 * 高度：SVG 674；右欄約 650。
 * ══════════════════════════════════════════════════════════════ */

type HumanNode = 'prompt' | 'harness' | 'review';

const HUMAN_ORDER: readonly HumanNode[] = ['prompt', 'harness', 'review'];

const HUMAN_NODES: Record<
  HumanNode,
  { x: number; y: number; who: '人' | 'AI'; title: string; sub: string }
> = {
  prompt: { x: 340, y: 40, who: '人', title: '① 你寫 prompt', sub: '告訴 AI 這次要做什麼' },
  harness: { x: 640, y: 500, who: 'AI', title: '② Harness 工作', sub: '例如 Claude Code、Codex' },
  review: { x: 40, y: 500, who: '人', title: '③ 你看成果', sub: '看完，再想下一個 prompt' },
};

const HUMAN_ARROWS: Record<
  HumanNode,
  { d: string; label: { x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end' } }
> = {
  /* key 是箭頭指向的那一格 */
  harness: {
    d: 'M 648 104 Q 790 110 790 490',
    label: { x: 810, y: 300, text: 'prompt', anchor: 'start' },
  },
  review: {
    d: 'M 632 565 L 350 565',
    label: { x: 490, y: 548, text: '成果（寫好的 code）', anchor: 'middle' },
  },
  prompt: {
    d: 'M 190 490 Q 190 110 332 104',
    label: { x: 170, y: 300, text: '新的 prompt', anchor: 'end' },
  },
};

const HUMAN_PROMPTS: readonly string[] = [
  '幫我做一個登入功能',
  '密碼錯誤時要顯示提示',
  '帳號空白時不能送出',
  '勾選「記住我」沒有作用',
  '手機版的按鈕跑版了',
  'lint 有 2 個錯誤，幫我修',
];

const HUMAN_MAX_ROUND = HUMAN_PROMPTS.length;

const HUMAN_STATUS: Record<HumanNode, string> = {
  prompt: '你在寫 prompt',
  harness: 'AI 在工作，你在等',
  review: '你在看成果，找出哪裡不對',
};

function HumanLoopDiagram({ round, node }: { round: number; node: HumanNode }) {
  const toneOf = (id: HumanNode): Tone => (HUMAN_NODES[id].who === '人' ? 'coral' : 'teal');
  /* 第一輪的第一步是起點，沒有箭頭指進來 */
  const activeArrow: HumanNode | null = round === 1 && node === 'prompt' ? null : node;

  return (
    <svg width={1000} height={674} viewBox="0 0 980 660" role="img" className="shrink-0">
      <title>傳統 AI Coding：你寫 prompt、Harness 工作、你看成果，再寫下一個 prompt，每一輪都要等人</title>
      <ArrowMarkers prefix="hl-arrow" />

      {HUMAN_ORDER.map((id) => {
        const arrow = HUMAN_ARROWS[id];
        const active = activeArrow === id;
        const tone = toneOf(id);
        return (
          <g key={id}>
            <path
              d={arrow.d}
              fill="none"
              stroke={active ? TONE_VAR[tone] : C.muted}
              strokeWidth={active ? 4 : 2}
              markerEnd={`url(#hl-arrow-${active ? tone : 'muted'})`}
              className={SVG_TR}
            />
            <text
              x={arrow.label.x}
              y={arrow.label.y}
              textAnchor={arrow.label.anchor}
              fontSize={19}
              fill={active ? TONE_VAR[tone] : C.muted}
              fontWeight={active ? 600 : 400}
            >
              {arrow.label.text}
            </text>
          </g>
        );
      })}

      <text
        x={490}
        y={330}
        textAnchor="middle"
        fontSize={48}
        fontWeight={600}
        fill={C.paper}
        className="font-display"
      >
        第 {round} 輪
      </text>
      <text x={490} y={374} textAnchor="middle" fontSize={21} fontWeight={600} fill={C.coral}>
        繞回圈的是你
      </text>

      {HUMAN_ORDER.map((id) => {
        const item = HUMAN_NODES[id];
        const tone = toneOf(id);
        const active = id === node;
        return (
          <g key={id}>
            <rect
              x={item.x}
              y={item.y}
              width={300}
              height={130}
              rx={18}
              fill={active ? TONE_VAR[tone] : C.inkSoft}
              fillOpacity={active ? 0.14 : 1}
              stroke={active ? TONE_VAR[tone] : C.line}
              strokeWidth={active ? 4 : 2}
              className={SVG_TR}
            />
            <rect
              x={item.x + 20}
              y={item.y + 18}
              width={52}
              height={30}
              rx={8}
              fill={TONE_VAR[tone]}
            />
            <text
              x={item.x + 46}
              y={item.y + 39}
              textAnchor="middle"
              fontSize={17}
              fontWeight={600}
              fill={C.onAccent}
            >
              {item.who}
            </text>
            <text x={item.x + 20} y={item.y + 84} fontSize={26} fontWeight={600} fill={C.paper}>
              {item.title}
            </text>
            <text x={item.x + 20} y={item.y + 114} fontSize={18} fill={C.muted}>
              {item.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function HumanLoopDemo() {
  const [round, setRound] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);

  const node = HUMAN_ORDER[stepIndex];
  const touches = (round - 1) * 2 + 1 + (stepIndex === 2 ? 1 : 0);
  const atEnd = round === HUMAN_MAX_ROUND && stepIndex === 2;

  const next = () => {
    if (stepIndex < 2) {
      setStepIndex(stepIndex + 1);
      return;
    }
    if (round < HUMAN_MAX_ROUND) {
      setRound(round + 1);
      setStepIndex(0);
    }
  };

  const reset = () => {
    setRound(1);
    setStepIndex(0);
  };

  const history = HUMAN_PROMPTS.slice(0, round)
    .map((text, index) => ({ round: index + 1, text }))
    .slice(-3);

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <HumanLoopDiagram round={round} node={node} />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="rounded-2xl border border-l-[6px] border-coral/55 border-l-coral bg-coral/14 px-8 py-5">
          <p className={LABEL_FAINT}>你介入了</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-[88px] leading-none font-semibold text-coral tabular-nums">
              {touches}
            </span>
            <span className="text-[28px] text-paper">次</span>
          </p>
          <p className="mt-2 text-[19px] text-muted">
            寫 prompt 一次、看成果一次 —— 每一輪都是兩次
          </p>
        </div>

        <p className="flex items-center gap-3 text-[24px] text-paper">
          <span
            className={`size-3.5 rounded-full ${
              HUMAN_NODES[node].who === '人' ? 'bg-coral' : 'bg-teal'
            }`}
          />
          {HUMAN_STATUS[node]}
        </p>

        <div className="flex flex-col gap-2.5">
          <p className={LABEL_FAINT}>你每一輪打的 prompt</p>
          {history.map((item, index) => {
            const latest = index === history.length - 1;
            return (
              <div
                key={item.round}
                className={`flex h-[48px] items-center gap-4 rounded-xl border border-l-[6px] px-5 text-[21px] ${
                  latest
                    ? 'border-coral/55 border-l-coral bg-panel text-paper'
                    : 'border-line border-l-line bg-panel text-muted'
                }`}
              >
                <span className="w-[76px] shrink-0 text-[17px] text-faint">第 {item.round} 輪</span>
                <span className="truncate">{item.text}</span>
              </div>
            );
          })}
        </div>

        <p className="rounded-xl border border-line px-6 py-4 text-[20px] leading-relaxed text-muted">
          對照上一頁：Loop Engineering 失敗了是 AI 自己繞回去修；這裡每一輪都要等你回來。
        </p>

        <div className="flex gap-3">
          <button type="button" disabled={atEnd} onClick={next} className={BTN_PRIMARY}>
            {stepIndex === 2 ? '下一輪' : '下一步'}
          </button>
          <button type="button" onClick={reset} className={BTN_GHOST}>
            重來
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 31 頁 · LoopEngineerDemo — Loop Engineering 工程師做什麼
 *
 * callout 指定「左邊是做的事項，右邊則是概念圖」，四件事：
 *   設計整個 Loop、完善整個 Harness、觸發方式、邊界。
 *
 * 右邊是一張圖同時畫出四個部分，點左邊哪一項，右邊那一部分用 acid 亮起，
 * 其他退成 muted：
 *   觸發    左側三顆膠囊（你的 prompt／排程時間／事件發生）→ 進入 Harness
 *   Harness 大外框，上緣插著 MCP、GitHub、瀏覽器、資料庫
 *   Loop    外框中間的四格回圈：寫程式 → 跑測試 → 通過了嗎？ → 修正
 *   邊界    包住回圈的虛線圓 ＋「最多 5 輪」標籤 → 外框外的「停下來」
 *
 * 座標（viewBox 1080 × 700，1:1 呈現）：
 *   觸發膠囊 x 10 w 200，y 260／340／420
 *   Harness 外框 (262, 110) 560 × 580，工具方塊跨在 y 110 的邊上
 *   回圈中心 (542, 400) r 150；邊界虛線圓 r 236
 *   停下來 (856, 500) 214 × 140
 *
 * 用色：只有 acid。
 * 高度：SVG 700；左欄四張卡片約 620。
 * ══════════════════════════════════════════════════════════════ */

type RoleId = 'loop' | 'harness' | 'trigger' | 'boundary';

const ROLES: readonly { id: RoleId; no: string; title: string; text: string }[] = [
  {
    id: 'loop',
    no: '01',
    title: '設計整個 Loop',
    text: 'AI 怎麼開始、過程中跑測試確認有沒有通過、遇到錯誤要怎麼修正。',
  },
  {
    id: 'harness',
    no: '02',
    title: '完善整個 Harness',
    text: 'AI 原本只有這個專案的權限。要串哪些 MCP、給哪些工具，它才跑得順。',
  },
  {
    id: 'trigger',
    no: '03',
    title: '觸發方式',
    text: '不再只有你主動給 prompt，還可以依時間觸發、依事件觸發。',
  },
  {
    id: 'boundary',
    no: '04',
    title: '邊界',
    text: '全自動可能做偏、或卡在同一個回圈。設好上限，避免浪費時間與資源。',
  },
];

const LE_CX = 542;
const LE_CY = 400;
const LE_R = 150;
const LE_FENCE_R = 236;

const LE_LOOP_NODES: readonly { x: number; y: number; text: string }[] = [
  { x: LE_CX, y: LE_CY - LE_R, text: '寫程式' },
  { x: LE_CX + LE_R, y: LE_CY, text: '跑測試' },
  { x: LE_CX, y: LE_CY + LE_R, text: '通過了嗎？' },
  { x: LE_CX - LE_R, y: LE_CY, text: '修正' },
];

/** 回圈上四個順時針箭頭，放在 45° 的位置 */
const LE_LOOP_HEADS: readonly { x: number; y: number; rotate: number }[] = [
  { x: LE_CX + 106.1, y: LE_CY - 106.1, rotate: 45 },
  { x: LE_CX + 106.1, y: LE_CY + 106.1, rotate: 135 },
  { x: LE_CX - 106.1, y: LE_CY + 106.1, rotate: 225 },
  { x: LE_CX - 106.1, y: LE_CY - 106.1, rotate: 315 },
];

const LE_TOOLS: readonly { x: number; text: string }[] = [
  { x: 296, text: 'MCP' },
  { x: 424, text: 'GitHub' },
  { x: 552, text: '瀏覽器' },
  { x: 680, text: '資料庫' },
];

const LE_TRIGGERS: readonly { y: number; text: string }[] = [
  { y: 260, text: '你的 prompt' },
  { y: 340, text: '排程時間' },
  { y: 420, text: '事件發生' },
];

function LoopEngineerDiagram({ focus }: { focus: RoleId }) {
  const on = (id: RoleId) => focus === id;
  const stroke = (id: RoleId) => (on(id) ? C.acid : C.line);
  const strokeW = (id: RoleId) => (on(id) ? 3.5 : 2);
  const fill = (id: RoleId) => (on(id) ? C.acid : C.inkSoft);
  const fillOp = (id: RoleId) => (on(id) ? 0.14 : 1);
  const label = (id: RoleId) => (on(id) ? C.acid : C.muted);
  const body = (id: RoleId) => (on(id) ? C.paper : C.muted);

  return (
    <svg width={1080} height={700} viewBox="0 0 1080 700" role="img" className="shrink-0">
      <title>Loop Engineering 的四個部分：觸發、Harness 與工具、Loop 本身、邊界</title>
      <ArrowMarkers prefix="le-arrow" />

      {/* ── 觸發 ── */}
      <text x={110} y={236} textAnchor="middle" fontSize={18} fontWeight={600} fill={label('trigger')} className={SVG_TR}>
        觸發
      </text>
      {LE_TRIGGERS.map((item) => (
        <g key={item.text}>
          <rect
            x={10}
            y={item.y}
            width={200}
            height={60}
            rx={30}
            fill={fill('trigger')}
            fillOpacity={fillOp('trigger')}
            stroke={stroke('trigger')}
            strokeWidth={strokeW('trigger')}
            className={SVG_TR}
          />
          <text x={110} y={item.y + 37} textAnchor="middle" fontSize={20} fill={body('trigger')} className={SVG_TR}>
            {item.text}
          </text>
          <path
            d={`M 214 ${item.y + 30} L 256 ${item.y + 30}`}
            stroke={on('trigger') ? C.acid : C.muted}
            strokeWidth={on('trigger') ? 3 : 2}
            markerEnd={`url(#le-arrow-${on('trigger') ? 'acid' : 'muted'})`}
            className={SVG_TR}
          />
        </g>
      ))}

      {/* ── Harness 外框 ── */}
      <rect
        x={262}
        y={110}
        width={560}
        height={580}
        rx={28}
        fill="none"
        stroke={on('harness') ? C.acid : C.muted}
        strokeWidth={on('harness') ? 4 : 2}
        className={SVG_TR}
      />
      <text x={292} y={668} fontSize={22} fontWeight={700} fill={on('harness') ? C.acid : C.paper} className={SVG_TR}>
        Harness
      </text>
      <text x={396} y={668} fontSize={17} fill={C.muted}>
        AI 可以用的權限與工具
      </text>
      <text x={542} y={70} textAnchor="middle" fontSize={17} fill={label('harness')} className={SVG_TR}>
        串接的 MCP／工具
      </text>
      {LE_TOOLS.map((tool) => (
        <g key={tool.text}>
          {/* 先墊一塊不透明的 panel，蓋掉外框的線，方塊才像插在邊上 */}
          <rect x={tool.x} y={84} width={116} height={52} rx={12} fill={C.panel} />
          <rect
            x={tool.x}
            y={84}
            width={116}
            height={52}
            rx={12}
            fill={fill('harness')}
            fillOpacity={fillOp('harness')}
            stroke={stroke('harness')}
            strokeWidth={strokeW('harness')}
            className={SVG_TR}
          />
          <text x={tool.x + 58} y={117} textAnchor="middle" fontSize={19} fill={body('harness')} className={SVG_TR}>
            {tool.text}
          </text>
        </g>
      ))}

      {/* ── 邊界 ── */}
      <circle
        cx={LE_CX}
        cy={LE_CY}
        r={LE_FENCE_R}
        fill="none"
        stroke={on('boundary') ? C.acid : C.muted}
        strokeWidth={on('boundary') ? 3.5 : 2}
        strokeDasharray="10 9"
        className={SVG_TR}
      />
      <path
        d="M 808 552 L 850 560"
        stroke={on('boundary') ? C.acid : C.muted}
        strokeWidth={on('boundary') ? 3 : 2}
        markerEnd={`url(#le-arrow-${on('boundary') ? 'acid' : 'muted'})`}
        className={SVG_TR}
      />
      <rect x={638} y={530} width={170} height={44} rx={22} fill={C.panel} />
      <rect
        x={638}
        y={530}
        width={170}
        height={44}
        rx={22}
        fill={fill('boundary')}
        fillOpacity={fillOp('boundary')}
        stroke={stroke('boundary')}
        strokeWidth={strokeW('boundary')}
        className={SVG_TR}
      />
      <text x={723} y={559} textAnchor="middle" fontSize={18} fontWeight={600} fill={body('boundary')} className={SVG_TR}>
        邊界：最多 5 輪
      </text>
      <rect
        x={856}
        y={500}
        width={214}
        height={140}
        rx={16}
        fill={fill('boundary')}
        fillOpacity={fillOp('boundary')}
        stroke={stroke('boundary')}
        strokeWidth={strokeW('boundary')}
        className={SVG_TR}
      />
      <text x={874} y={538} fontSize={22} fontWeight={700} fill={on('boundary') ? C.acid : C.paper} className={SVG_TR}>
        停下來
      </text>
      <g fontSize={17} fill={body('boundary')} className={SVG_TR}>
        <text x={874} y={570}>超過輪數、時間</text>
        <text x={874} y={594}>或預算上限，</text>
        <text x={874} y={618}>就停下、通知你</text>
      </g>

      {/* ── Loop ── */}
      <circle
        cx={LE_CX}
        cy={LE_CY}
        r={LE_R}
        fill="none"
        stroke={on('loop') ? C.acid : C.muted}
        strokeWidth={on('loop') ? 3.5 : 2}
        className={SVG_TR}
      />
      {LE_LOOP_HEADS.map((head) => (
        <path
          key={head.rotate}
          d="M -10 -9 L 10 0 L -10 9 Z"
          transform={`translate(${head.x} ${head.y}) rotate(${head.rotate})`}
          fill={on('loop') ? C.acid : C.muted}
          className={SVG_TR}
        />
      ))}
      <text x={LE_CX} y={LE_CY - 2} textAnchor="middle" fontSize={26} fontWeight={700} fill={on('loop') ? C.acid : C.paper} className={SVG_TR}>
        Loop
      </text>
      <text x={LE_CX} y={LE_CY + 28} textAnchor="middle" fontSize={17} fill={C.muted}>
        失敗就自己修
      </text>
      {LE_LOOP_NODES.map((node) => (
        <g key={node.text}>
          <rect x={node.x - 75} y={node.y - 28} width={150} height={56} rx={14} fill={C.panel} />
          <rect
            x={node.x - 75}
            y={node.y - 28}
            width={150}
            height={56}
            rx={14}
            fill={fill('loop')}
            fillOpacity={fillOp('loop')}
            stroke={stroke('loop')}
            strokeWidth={strokeW('loop')}
            className={SVG_TR}
          />
          <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize={20} fontWeight={600} fill={body('loop')} className={SVG_TR}>
            {node.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LoopEngineerDemo() {
  const [focus, setFocus] = useState<RoleId>('loop');

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className={LABEL_FAINT}>工程師要做的四件事</p>
        {ROLES.map((role) => (
          <OptionCard
            key={role.id}
            no={role.no}
            title={role.title}
            text={role.text}
            active={role.id === focus}
            onClick={() => setFocus(role.id)}
          />
        ))}
      </div>
      <LoopEngineerDiagram focus={focus} />
    </div>
  );
}
