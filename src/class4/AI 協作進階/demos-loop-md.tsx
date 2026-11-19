import { Fragment, useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：觸發方式（loop.md）
 *
 *   第 35 頁  LoopMdDemo   loop.md：給 /loop 一份預設工作
 *
 * 來源：講師 2026-10-13 的修改清單（1013 修改）：
 *   「p34 後方：新增一頁 Claude Loop.md 的說明」
 * 檔名照官方文件寫成小寫 loop.md。
 *
 * 跟前後頁的關係：
 *   第 34 頁〈定時觸發的三種方案〉已經講過 /loop 的間隔單位、最短 1 分鐘、7 天過期、
 *   session 關掉就停 —— 這頁不重講，只在左下「怎麼停」卡的標籤寫「其他排程規則同第 34 頁」。
 *   這頁只講「/loop 自己怎麼決定要跑什麼」：三種給法、找檔順序與優先權、loop.md 長什麼樣、
 *   取代內建 prompt 之後護欄要自己寫（接第 38 頁〈邊界〉）。
 *   第 36 頁〈其他觸發方式〉的 Desktop 排程任務，prompt 存在另一個檔
 *   （~/.claude/scheduled-tasks/<task-name>/SKILL.md），跟 loop.md 是兩回事，這頁不提。
 *
 * 版型：同第 34、36 頁的「左邊是選項，右邊是概念圖」。
 *   左  標籤「/loop 後面給了什麼？」＋ 三個選項（官方表格的三列）＋ 底部「怎麼停」小卡。
 *   右  情境卡：標題列（寫法編號、指令、給了什麼、官方文件、播放／下一步）
 *       → 主體（左 SVG 概念圖 ＋ 一行狀態；右邊依選項不同）→ Codex 對照卡。
 *       01 沒給 prompt  左：找檔順序（專案 → 使用者 → 內建），播到最後是「專案有 → 採用」
 *                       右：loop.md 檔案框（<pre>，共用 CodeBlock 不支援 markdown）
 *                           ＋「取代，不是疊加」卡
 *       02／03 有 prompt 左：你的 prompt 每輪都跑、loop.md 虛線「不會被讀」、節奏時間軸
 *                       右：四列事實（跑什麼、loop.md、節奏、多排一件）
 *   播放規則同第 34 頁：一進頁面停在最後一格，在左欄點了別的選項就從頭自動播一次。
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-13 查的官方文件）
 * ──────────────────────────────────────────────────────────────
 * Claude Code · https://code.claude.com/docs/en/scheduled-tasks
 *   #run-a-prompt-repeatedly-with-loop（左欄三個選項就是這張表的三列）
 *     「Interval and prompt | /loop 5m check the deploy | Your prompt runs on a fixed schedule」
 *     「Prompt only | /loop check the deploy | Your prompt runs at an interval Claude
 *       chooses each iteration」
 *     「Interval only, or nothing | /loop | The built-in maintenance prompt runs, or your
 *       loop.md if one exists」
 *   #customize-the-default-prompt-with-loop-md
 *     「Create a loop.md file to replace the built-in maintenance prompt with your own
 *       instructions. It defines a single default prompt for bare /loop, not a list of
 *       separate scheduled tasks, and Claude Code ignores it whenever you supply a prompt
 *       on the command line. To schedule additional prompts alongside it, use
 *       /loop <prompt> or ask Claude directly.」
 *     「Claude looks for the file in two locations and uses the first one it finds.」
 *       .claude/loop.md     Project-level. Takes precedence when both files exist.
 *       ~/.claude/loop.md   User-level. Applies in any project that does not define its own.
 *     「The file is plain Markdown with no required structure. Write it as if you were
 *       typing the /loop prompt directly.」
 *     「Edits to loop.md take effect on the next iteration, so you can refine the
 *       instructions while a loop is running. When no loop.md exists in either location,
 *       the loop falls back to the built-in maintenance prompt. Keep the file concise:
 *       content beyond 25,000 bytes is truncated.」
 *     官方唯一的範例（.claude/loop.md）：
 *       Check the `release/next` PR. If CI is red, pull the failing job log,
 *       diagnose, and push a minimal fix. If new review comments have arrived,
 *       address each one and resolve the thread. If everything is green and
 *       quiet, say so in one line.
 *   #run-the-built-in-maintenance-prompt
 *     「continue any unfinished work from the conversation」
 *     「tend to the current branch's pull request: review comments, failed CI runs,
 *       merge conflicts」
 *     「run cleanup passes such as bug hunts or simplification when nothing else is pending」
 *     「Claude does not start new initiatives outside that scope, and irreversible actions
 *       such as pushing or deleting only proceed when they continue something the
 *       transcript already authorized.」
 *     「A bare /loop runs this prompt at a dynamically chosen interval. Add an interval,
 *       for example /loop 15m, to run it on a fixed schedule instead.」
 *   #let-claude-choose-the-interval
 *     「After each iteration it picks a delay between one minute and one hour based on what
 *       it observed … The chosen delay and the reason for it are printed at the end of
 *       each iteration.」
 *   #stop-a-loop
 *     「To stop a self-paced /loop while it is waiting for the next iteration, press Esc.」
 *     「Loops on a fixed interval keep running until you cancel them like any other
 *       scheduled task or seven days elapse.」
 *   比較表 /loop 那一欄的 Permission prompts：「Inherits from session」
 *   ——「權限照 session 的設定」。
 *
 *   「護欄不會跟過來」是從 replace 推出來的：不開新題目、push／刪除要先授權，是內建
 *   prompt 自己帶的兩條規則；loop.md 把整份內建 prompt 換掉，這兩條就不在了。官方沒有
 *   另外寫這一句，是查核時補上的提醒，所以畫面上寫成「邊界要自己寫進 loop.md」。
 *   官方 changelog 查不到 loop.md 是哪一版加的，畫面不寫版本。
 *
 * Codex · https://learn.chatgpt.com/docs/automations
 *   「Codex CLI doesn't provide the Scheduled management interface. Use ChatGPT web or
 *     the desktop app to create and manage scheduled tasks.」
 *   「Put durable instructions in the task prompt or an attached skill」
 *   「Use a scheduled task in a chat when you want ChatGPT to return to the same chat with
 *     its existing context.」—— 最像 /loop，但一樣沒有預設回圈檔。官方這句沒有限定
 *     桌面 app，畫面只寫「在對話裡排程」，不寫平台。也因為有這一種（沿用對話脈絡、
 *     不是每次從存下的 prompt 開始），畫面寫「常駐的指示寫在任務的 prompt」，
 *     不寫「每個任務都照自己的 prompt 跑」。
 *   AGENTS.md · https://learn.chatgpt.com/docs/agent-configuration/agents-md
 *   「Codex reads AGENTS.md files before doing any work.」—— 常駐指示，比較像 CLAUDE.md，
 *   不是回圈專用。Codex CLI 沒有 /loop（openai/codex 的功能請求 #15679 以 not planned
 *   關閉），畫面只寫結論、不放 issue 號。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 檔案框裡「這個專案的 loop.md」內容：抓 GitHub 上標 ready 的 issue、一次一個、
 *     做完開 PR；沒有就檢查自己開的 PR 的 CI 與 review；都沒事用一行回報。接第 32–33 頁
 *     的 issue 情境，結構仿官方的 release/next 範例。
 *   - 「加上『不准推 main，也不准刪檔。』那一行 → 下一輪生效」的劇情。整份用一般句子寫，
 *     不混用條列，呼應官方「plain Markdown with no required structure」。
 *   - 「檢查部署」是官方 check the deploy 的中譯；第 02 項的 2 分、2 分、30 分與每輪結尾
 *     印出的理由；第 03 項的 5 分鐘間隔與「部署好了也照跑」。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選單選取、目前這一步（指令膠囊、找檔的節點與箭頭、時間軸目前這一輪）、
 *         「怎麼停」卡裡對應的那一列。
 *   teal  找到並採用的那份（專案的 loop.md 節點、檔案框外框、「✓ 採用」），
 *         生效（新加的那一行），以及 02／03「每一輪都跑你給的 prompt」。
 *   「不會被讀」「沒用到」「被取代」一律中性虛線；「取代，不是疊加」卡、Codex 對照卡
 *   是中性的 paper 左粗條。淡底（/14）一律配實色邊框或 6px 不透明左粗條。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬度：左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）；
 *       右卡主體 ＝ SVG 520 ＋ gap 24 ＋ 右半 558。
 * 左欄：標籤 26 ＋ 16 ＋ 三張選單 ＋ 16 ＋ 怎麼停卡
 *       → 選單 (720 − 26 − 16 − 16 − 116 − 24) ÷ 3 ≈ 174／張；
 *       選單內容 ＝ 指令 33 ＋ 6 ＋ 說明兩行 52 ＋ 6 ＋ 6 ＋ 標籤 30 ≈ 134，加 py 32 ＝ 166 < 174。
 *       說明一律用 \n 指定斷點（whitespace-pre-line），不讓「prompt」「內建的」落單。
 * 右卡：內高 720 − 2 − 48 ＝ 670 ＝ 標題列 48 ＋ 16 ＋ 主體 420 ＋ 16 ＋ Codex 對照卡 170。
 *       主體左半 ＝ SVG 372 ＋ 8 ＋ 狀態 40。
 *       01 右半 ＝ 檔案框 260（框 4 ＋ 檔頭 40 ＋ pre 152 ＋ 檔尾兩行 64）＋ 12
 *                 ＋「取代」卡 148（內容 21px 兩行 ＋ 19px 兩行 ≈ 118，置中）。
 *       02／03 右半 ＝ 四列事實 ≈ 316（細算寫在 promptFacts 旁），下面留白。
 *       Codex 對照卡內高 170 − 2 − 32 ＝ 136：左欄 標籤 24 ＋ 判定兩行 66 ＋ 連結 27；
 *       右欄四行 × 30 ＝ 120（20px 約 38 字一行，每行都控制在一行內）。
 * 實測（2026-10-13，1920 × 1080 無頭 Chrome，三個選項都量過）：
 *   根容器 1740 × 720；選單 174 × 3（內容 134）；怎麼停卡 116；
 *   右卡 標題列 48、主體 420、Codex 卡 170（內高 136）；狀態列 520 × 40；
 *   01 檔案框 260 ＋「取代」卡 148；02 四列 51 ＋ 108 ＋ 79 ＋ 78 ＝ 316；
 *   03 四列 51 ＋ 108 ＋ 82 ＋ 78 ＝ 319。
 *   稽核（overflow、contrast、svgContrast、outOfMain、childEscape）01 的六格、
 *   02 與 03 的第一格與最後一格全部是空陣列。
 *   浮水印在右上角舞台 y 104–147；這頁的根容器從 y 184 開始（Panel 的 p-10 之內），碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger-more.tsx，不 import 那個檔案）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;
/** 標籤裡有 /loop、loop.md 這種要保留小寫的字，就不轉大寫 */
const LABEL_PLAIN = 'font-display text-[17px] tracking-[0.16em] text-faint';

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
} as const;

type Tone = 'muted' | 'acid';

const TONE_VAR: Record<Tone, string> = {
  muted: C.muted,
  acid: C.acid,
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

/** 直線箭頭：作用中 acid、平常 muted；dashed 用在「不再往下找」 */
function Arrow({
  d,
  on,
  prefix,
  dashed = false,
}: {
  d: string;
  on: boolean;
  prefix: string;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={on ? C.acid : C.muted}
      strokeWidth={on ? 3.5 : 2}
      strokeDasharray={dashed ? '5 4' : undefined}
      markerEnd={`url(#${prefix}-${on ? 'acid' : 'muted'})`}
      className={SVG_TR}
    />
  );
}

/* ── 播放器（同第 34 頁的 usePlayer）───────────────────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的選項時）
 * 情境卡用選項 id 當 key，換選項就整張重掛，狀態自然歸零。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode) {
  const [tick, setTick] = useState(mode === 'still' ? last : 0);
  const [playing, setPlaying] = useState(mode === 'play');

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

  return { tick, atEnd, toggle, step, label };
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

/** 左側選單的一列（同第 34 頁的 MenuItem：指令用等寬字） */
function MenuItem({
  index,
  name,
  sub,
  chips,
  on,
  onClick,
}: {
  index: number;
  name: string;
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
          className={`font-mono text-[26px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}
        >
          {name}
        </span>
        <span
          className={`text-[19px] leading-snug whitespace-pre-line ${on ? 'text-paper' : 'text-muted'}`}
        >
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

type InputId = 'bare' | 'prompt' | 'both';

/* ── 左下：怎麼停 ────────────────────────────────────────
 * 停法看「節奏」不看有沒有 loop.md：沒給間隔＝動態節奏，給了間隔＝固定間隔。
 * 02 只會是動態、03 只會是固定，選到時對應那一列轉 acid；01 兩種都可能，不標。
 * 19px 下最寬一列「固定間隔 → 請 Claude 取消，或等 7 天過期」約 380 ≤ 卡片內寬 492。 */

const STOPS: readonly { rhythm: string; how: ReactNode; for: InputId | null }[] = [
  {
    rhythm: '動態節奏',
    how: (
      <>
        等下一輪時按{' '}
        <kbd className="rounded-md border border-line bg-panel px-2 font-mono text-[17px] text-paper">
          Esc
        </kbd>
      </>
    ),
    for: 'prompt',
  },
  { rhythm: '固定間隔', how: '請 Claude 取消，或等 7 天過期', for: 'both' },
];

function StopCard({ picked }: { picked: InputId }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-5 py-3">
      <span className={LABEL_PLAIN}>怎麼停 · 其他排程規則同第 34 頁</span>
      <div className="grid grid-cols-[max-content_max-content_1fr] items-center gap-x-3 gap-y-1 text-[19px] leading-snug">
        {STOPS.map((row) => {
          const on = row.for === picked;
          return (
            <Fragment key={row.rhythm}>
              <span className={on ? 'font-semibold text-acid' : 'text-muted'}>{row.rhythm}</span>
              <span className={on ? 'font-semibold text-acid' : 'text-faint'}>→</span>
              <span
                className={`transition-colors duration-200 ${
                  on ? 'font-semibold text-acid' : 'text-paper'
                }`}
              >
                {row.how}
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── 01 沒給 prompt：找檔順序 ────────────────────────────
 * tick 0 下了 /loop → 1 先找專案 → 2 專案沒有才找使用者層級 → 3 都沒有跑內建
 *      → 4 這個專案有 → 採用，後面兩個不用 → 5 改了 loop.md，下一輪照新的。
 * 1–3 是在講「順序」，4–5 回到這個專案的實際情況（右邊的檔案框）。右邊整段都看得到
 * 這個專案的 loop.md，所以 1–3 的箭頭標籤與狀態列一律寫成條件句（「沒有的話」
 * 「如果兩邊都沒有」），不寫成「沒有」這種陳述句，免得跟檔案框打架；
 * 4 之後第一支箭頭改寫「找到了，不再往下找」，第二支的標籤拿掉。
 * 座標（viewBox 520 × 372，1:1 呈現）：
 *   指令膠囊 (2, 2) 516 × 40
 *   ① 專案   (2, 68) 516 × 54；② 使用者 (2, 150) 516 × 54；③ 內建 (2, 232) 516 × 138
 *   節點之間留 28：箭頭 x 40、長 23，旁邊 x 56 寫條件（最長「找到了，不再往下找」16px 約 144）
 *   右側標籤 (414, 節點頂 ＋ 13) 90 × 28；③ 最長一行「再顧目前分支的 PR：review 留言、
 *   失敗的 CI、merge conflict」16px 約 432，右緣 488 < 516，跟標籤不同列；
 *   ③ 最後一行（護欄）基線 357，離節點下緣 370 還有 13。 */

type NodeState = 'idle' | 'on' | 'adopted' | 'skipped';

function nodeRect(state: NodeState) {
  if (state === 'on') {
    return { fill: C.acid, fillOpacity: 0.14, stroke: C.acid, strokeWidth: 3.5 };
  }
  if (state === 'adopted') {
    return { fill: C.teal, fillOpacity: 0.14, stroke: C.teal, strokeWidth: 3.5 };
  }
  if (state === 'skipped') {
    return { fill: 'none', stroke: C.muted, strokeWidth: 2, strokeDasharray: '7 6' };
  }
  return { fill: C.inkSoft, fillOpacity: 1, stroke: C.line, strokeWidth: 2 };
}

/** 找檔順序的號碼：作用中 acid、採用 teal（粗框 ＋ 同色數字）。
 *  不用實心圓挖空字：稽核腳本拿 SVG 文字對 HTML 背景量，量不到圓的填色。 */
function OrderBadge({ cx, cy, no, state }: { cx: number; cy: number; no: number; state: NodeState }) {
  const tone = state === 'on' ? C.acid : state === 'adopted' ? C.teal : null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill={C.panel}
        stroke={tone ?? C.line}
        strokeWidth={tone ? 3 : 2}
        className={SVG_TR}
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill={tone ?? C.faint}
        className={`font-mono ${SVG_TR}`}
      >
        {no}
      </text>
    </g>
  );
}

/** 節點右側的結果標籤：teal ＝ 採用；muted 虛線 ＝ 沒用到／被取代 */
function Tag({
  x,
  y,
  width,
  label,
  tone,
}: {
  x: number;
  y: number;
  width: number;
  label: string;
  tone: 'teal' | 'muted';
}) {
  const teal = tone === 'teal';
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={28}
        rx={14}
        fill={C.panel}
        stroke={teal ? C.teal : C.muted}
        strokeWidth={2}
        strokeDasharray={teal ? undefined : '5 4'}
      />
      <text
        x={x + width / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={16}
        fontWeight={teal ? 700 : 400}
        fill={teal ? C.teal : C.muted}
      >
        {label}
      </text>
    </g>
  );
}

function LookupScene({ tick }: { tick: number }) {
  const done = tick >= 4;
  const capOn = tick === 0;
  const stA: NodeState = tick === 1 ? 'on' : done ? 'adopted' : 'idle';
  const stB: NodeState = tick === 2 ? 'on' : done ? 'skipped' : 'idle';
  const stC: NodeState = tick === 3 ? 'on' : done ? 'skipped' : 'idle';
  const stepFill = done ? C.muted : C.paper;

  return (
    <svg width={520} height={372} viewBox="0 0 520 372" role="img" className="shrink-0">
      <title>
        沒給 prompt 的 /loop 怎麼找預設工作：先找專案的 .claude/loop.md，沒有再找
        ~/.claude/loop.md，都沒有就跑內建的 maintenance prompt
      </title>
      <ArrowMarkers prefix="lm-lk" tones={['muted', 'acid']} />

      {/* 指令 */}
      <rect
        x={2}
        y={2}
        width={516}
        height={40}
        rx={20}
        fill={capOn ? C.acid : C.inkSoft}
        fillOpacity={capOn ? 0.14 : 1}
        stroke={capOn ? C.acid : C.line}
        strokeWidth={capOn ? 3 : 2}
        className={SVG_TR}
      />
      <text x={24} y={29} fontSize={20} fontWeight={700} fill={C.paper} className="font-mono">
        {'> /loop'}
      </text>
      <text
        x={496}
        y={28}
        textAnchor="end"
        fontSize={17}
        fontWeight={capOn ? 600 : 400}
        fill={capOn ? C.acid : C.muted}
        className={SVG_TR}
      >
        沒給 prompt → 去找一份預設工作
      </text>

      <Arrow d="M 40 44 L 40 65" on={tick === 1} prefix="lm-lk" />

      {/* ① 專案層級 */}
      <rect x={2} y={68} width={516} height={54} rx={14} {...nodeRect(stA)} className={SVG_TR} />
      <OrderBadge cx={30} cy={95} no={1} state={stA} />
      <text x={56} y={91} fontSize={18} fontWeight={700} fill={C.paper} className="font-mono">
        .claude/loop.md
      </text>
      <text x={56} y={113} fontSize={16} fill={C.muted}>
        專案層級 · 兩個都有時以它為準
      </text>
      {done && <Tag x={414} y={81} width={90} label="✓ 採用" tone="teal" />}

      <Arrow d="M 40 124 L 40 147" on={tick === 2} prefix="lm-lk" dashed={done} />
      <text
        x={56}
        y={141}
        fontSize={16}
        fontWeight={tick === 2 ? 700 : 400}
        fill={tick === 2 ? C.acid : C.muted}
        className={SVG_TR}
      >
        {done ? '找到了，不再往下找' : '沒有的話'}
      </text>

      {/* ② 使用者層級 */}
      <rect x={2} y={150} width={516} height={54} rx={14} {...nodeRect(stB)} className={SVG_TR} />
      <OrderBadge cx={30} cy={177} no={2} state={stB} />
      <text
        x={56}
        y={173}
        fontSize={18}
        fontWeight={700}
        fill={done ? C.muted : C.paper}
        className={`font-mono ${SVG_TR}`}
      >
        ~/.claude/loop.md
      </text>
      <text x={56} y={195} fontSize={16} fill={C.muted}>
        使用者層級 · 專案沒有自己的檔案時才用
      </text>
      {done && <Tag x={414} y={163} width={90} label="沒用到" tone="muted" />}

      <Arrow d="M 40 206 L 40 229" on={tick === 3} prefix="lm-lk" dashed={done} />
      {!done && (
        <text
          x={56}
          y={223}
          fontSize={16}
          fontWeight={tick === 3 ? 700 : 400}
          fill={tick === 3 ? C.acid : C.muted}
          className={SVG_TR}
        >
          也沒有的話
        </text>
      )}

      {/* ③ 內建的 maintenance prompt */}
      <rect x={2} y={232} width={516} height={138} rx={14} {...nodeRect(stC)} className={SVG_TR} />
      <OrderBadge cx={30} cy={258} no={3} state={stC} />
      <text
        x={56}
        y={264}
        fontSize={18}
        fontWeight={700}
        fill={done ? C.muted : C.paper}
        className={SVG_TR}
      >
        內建的 maintenance prompt
      </text>
      {done && <Tag x={414} y={244} width={90} label="被取代" tone="muted" />}
      <text x={56} y={289} fontSize={16} fill={stepFill} className={SVG_TR}>
        先接著做對話裡沒做完的工作
      </text>
      <text x={56} y={311} fontSize={16} fill={stepFill} className={SVG_TR}>
        再顧目前分支的 PR：review 留言、失敗的 CI、merge conflict
      </text>
      <text x={56} y={333} fontSize={16} fill={stepFill} className={SVG_TR}>
        都沒事，才做 bug hunt 或簡化
      </text>
      <text x={56} y={357} fontSize={16} fill={C.muted}>
        <tspan fontWeight={700} fill={stepFill}>
          護欄：
        </tspan>
        不開新題目；push、刪除要對話已授權過
      </text>
    </svg>
  );
}

/* ── 01 右半：這個專案的 loop.md ＋「取代，不是疊加」────────
 * 檔案框外框在 tick ≥ 4（採用）轉 teal；tick 5 多出最後一行（teal 6px 左粗條）。
 * pre 18px、行高 1.45 ≈ 26：五行 131 ＋ py 20 ＝ 151 → h-[152px]。
 * 最寬一行「沒有的話，就檢查自己開的 PR 的 CI 與 review。」約 461 ≤ 558 − 4 − 32 ＝ 522。 */

const LOOP_MD_LINES: readonly string[] = [
  '抓 GitHub 上標 ready 的 issue，',
  '一次只做一個，做完開 PR。',
  '沒有的話，就檢查自己開的 PR 的 CI 與 review。',
  '都沒事，就用一行回報。',
];

const LOOP_MD_ADDED = '不准推 main，也不准刪檔。';

function LoopMdSide({ tick }: { tick: number }) {
  const adopted = tick >= 4;
  const edited = tick >= 5;

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      {/* 檔案框 */}
      <div
        className={`flex shrink-0 flex-col rounded-2xl border-2 transition-colors duration-300 ${
          adopted ? 'border-teal' : 'border-line'
        }`}
      >
        <div className="flex h-10 shrink-0 items-center gap-3 rounded-t-[14px] border-b border-line bg-panel-lift px-4">
          <span className="font-mono text-[18px] font-semibold text-paper">.claude/loop.md</span>
          <span className="text-[16px] text-faint">專案層級 · 示意</span>
          {adopted && (
            <span className="ml-auto text-[17px] font-semibold text-teal">
              {edited ? '✓ 改了，下一輪照新的' : '✓ 這一輪照它跑'}
            </span>
          )}
        </div>
        <pre className="h-[152px] shrink-0 bg-ink-soft px-4 py-2.5 font-mono text-[18px] leading-[1.45] whitespace-pre text-paper">
          {LOOP_MD_LINES.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          {edited && (
            <span className="-mx-4 block border-l-[6px] border-l-teal bg-teal/14 pr-4 pl-[10px] font-semibold">
              {LOOP_MD_ADDED}
            </span>
          )}
        </pre>
        <p className="rounded-b-[14px] border-t border-line bg-panel-lift px-4 py-2 text-[17px] leading-snug text-muted">
          <span className="block">純 Markdown、沒有固定格式 · 寫的是一段 prompt，不是排程清單</span>
          <span className="block">超過 25,000 bytes 的部分會被截掉</span>
        </p>
      </div>

      {/* 取代，不是疊加 */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-5 py-3">
        <p className="text-[21px] leading-snug text-paper">
          <span className="block">
            <span className="font-semibold">取代，不是疊加：</span>內建 prompt 的兩條護欄
          </span>
          <span className="block">不開新題目、push 或刪除要先授權，不會跟過來。</span>
        </p>
        <p className="text-[19px] leading-snug text-muted">
          <span className="block">
            邊界要自己寫進 loop.md → <span className="text-paper">第 38 頁〈邊界〉</span>
          </span>
          <span className="block">權限一樣照 session 的設定。</span>
        </p>
      </div>
    </div>
  );
}

/* ── 02／03 有給 prompt：loop.md 不會被讀 ─────────────────
 * 02 tick 0 下指令 → 1–3 第 1–3 輪，每輪結尾 Claude 挑下一次（2 分、2 分、30 分）。
 *    間隔是每輪挑出來的，所以時間軸一格一格長出來；空心圓「下一輪」跟著往後移。
 * 03 tick 0 下指令 → 1–3 第 1–3 輪，間隔一開始就寫在指令裡，整條時間軸先畫好。
 * 座標（viewBox 520 × 372，1:1 呈現）：
 *   指令膠囊 (2, 2) 516 × 44；箭頭 x 145 y 48 → 67
 *   每一輪都跑 (2, 70) 290 × 136；不會被讀（虛線）(314, 70) 204 × 136
 *   ——「~/.claude/loop.md」16px 等寬約 163，x 332 起右緣 495 < 518
 *   節奏標題 y 248；時間軸 y 300（x 24–500）；間隔字 y 286；第 N 輪 y 334；最後一行 y 364
 *   02 的圓心 40／150／260、下一輪最遠 480；03 的圓心 40／190／340、下一輪 490 */

type PromptKind = 'prompt' | 'both';

interface Rhythm {
  label: string;
  xs: readonly number[];
  next: number;
  gaps: readonly string[];
  /** 時間軸下面那一行：前綴 ＋ 每一格的內容 */
  printedLead: string;
  printed: readonly string[];
}

const RHYTHM: Record<PromptKind, Rhythm> = {
  prompt: {
    label: '節奏 · Claude 每輪自己挑（1 分鐘～1 小時）',
    xs: [40, 150, 260],
    next: 480,
    gaps: ['等 2 分', '等 2 分', '等 30 分'],
    printedLead: '每輪結尾印出 › ',
    printed: [
      '',
      '2 分鐘後再看：部署還在跑',
      '2 分鐘後再看：還沒跑完',
      '30 分鐘後再看：部署完成，沒事了',
    ],
  },
  both: {
    label: '節奏 · 固定每 5 分鐘，寫在指令裡',
    xs: [40, 190, 340],
    next: 490,
    gaps: ['5 分', '5 分', '5 分'],
    printedLead: '照排程 › ',
    printed: ['', '5 分鐘後跑下一輪', '5 分鐘後跑下一輪', '部署好了也一樣：5 分鐘後再跑'],
  },
};

function PromptScene({ tick, kind }: { tick: number; kind: PromptKind }) {
  const rhythm = RHYTHM[kind];
  const capOn = tick === 0;
  const running = tick >= 1;
  const fixed = kind === 'both';

  /* 02 的空心「下一輪」跟著最新的間隔往後移；03 一開始就在最後 */
  const nextX = fixed ? rhythm.next : tick < rhythm.xs.length ? rhythm.xs[tick] : rhythm.next;
  const showNext = fixed || tick >= 1;

  return (
    <svg width={520} height={372} viewBox="0 0 520 372" role="img" className="shrink-0">
      <title>
        {fixed
          ? '/loop 5m 檢查部署：每 5 分鐘跑一次你給的 prompt，loop.md 不會被讀'
          : '/loop 檢查部署：每一輪跑你給的 prompt，Claude 每輪自己挑下一次的間隔，loop.md 不會被讀'}
      </title>
      <ArrowMarkers prefix={`lm-${kind}`} tones={['muted', 'acid']} />

      {/* 指令 */}
      <rect
        x={2}
        y={2}
        width={516}
        height={44}
        rx={22}
        fill={capOn ? C.acid : C.inkSoft}
        fillOpacity={capOn ? 0.14 : 1}
        stroke={capOn ? C.acid : C.line}
        strokeWidth={capOn ? 3 : 2}
        className={SVG_TR}
      />
      <text
        x={24}
        y={31}
        fontSize={20}
        fontWeight={700}
        fill={C.paper}
        className="font-mono"
        style={{ whiteSpace: 'pre' }}
      >
        {fixed ? '> /loop 5m ' : '> /loop '}
        <tspan fill={capOn ? C.acid : C.paper} className={SVG_TR}>
          檢查部署
        </tspan>
      </text>
      <text
        x={496}
        y={30}
        textAnchor="end"
        fontSize={17}
        fontWeight={capOn ? 600 : 400}
        fill={capOn ? C.acid : C.muted}
        className={SVG_TR}
      >
        {fixed ? '間隔＋prompt' : '只給 prompt'}
      </text>

      <Arrow d="M 145 48 L 145 67" on={tick === 1} prefix={`lm-${kind}`} />

      {/* 每一輪都跑：你給的 prompt */}
      <rect
        x={2}
        y={70}
        width={290}
        height={136}
        rx={16}
        fill={running ? C.teal : C.inkSoft}
        fillOpacity={running ? 0.14 : 1}
        stroke={running ? C.teal : C.line}
        strokeWidth={running ? 3.5 : 2}
        className={SVG_TR}
      />
      <text x={24} y={100} fontSize={17} fill={C.muted}>
        每一輪都跑
      </text>
      <text x={24} y={146} fontSize={30} fontWeight={700} fill={C.paper}>
        檢查部署
      </text>
      <text
        x={24}
        y={186}
        fontSize={17}
        fontWeight={running ? 700 : 400}
        fill={running ? C.teal : C.faint}
        className={SVG_TR}
      >
        {running ? '✓ 你給的 prompt' : '還沒開始'}
      </text>

      {/* loop.md：不會被讀 */}
      <rect
        x={314}
        y={70}
        width={204}
        height={136}
        rx={16}
        fill="none"
        stroke={C.muted}
        strokeWidth={2}
        strokeDasharray="7 6"
      />
      <text x={332} y={100} fontSize={18} fontWeight={700} fill={C.muted}>
        不會被讀
      </text>
      <text x={332} y={130} fontSize={16} fill={C.muted} className="font-mono">
        .claude/loop.md
      </text>
      <text x={332} y={154} fontSize={16} fill={C.muted} className="font-mono">
        ~/.claude/loop.md
      </text>
      <text x={332} y={188} fontSize={16} fill={C.muted}>
        內建 prompt 也不跑
      </text>

      {/* 節奏 */}
      <text x={24} y={248} fontSize={17} fontWeight={600} fill={C.paper}>
        {rhythm.label}
      </text>
      <line x1={rhythm.xs[0]} y1={300} x2={rhythm.next} y2={300} stroke={C.line} strokeWidth={2} />

      {rhythm.gaps.map((gap, i) => {
        const from = rhythm.xs[i];
        const to = i + 1 < rhythm.xs.length ? rhythm.xs[i + 1] : rhythm.next;
        const shown = fixed || tick >= i + 1;
        const on = tick === i + 1;
        if (!shown) return null;
        return (
          <text
            key={i}
            x={(from + to) / 2}
            y={286}
            textAnchor="middle"
            fontSize={16}
            fontWeight={on ? 700 : 400}
            fill={on ? C.acid : C.muted}
            className={SVG_TR}
          >
            {gap}
          </text>
        );
      })}

      {rhythm.xs.map((x, i) => {
        const round = i + 1;
        const on = tick === round;
        const past = tick > round;
        /* 02 還沒發生的輪次不畫（間隔還沒挑），03 先畫成虛線 */
        if (!fixed && tick < round) return null;
        return (
          <g key={x}>
            <circle
              cx={x}
              cy={300}
              r={14}
              fill={C.panel}
              stroke={on ? C.acid : past ? C.paper : C.muted}
              strokeWidth={on ? 3.5 : 2.5}
              strokeDasharray={on || past ? undefined : '5 4'}
              className={SVG_TR}
            />
            <text
              x={x}
              y={306}
              textAnchor="middle"
              fontSize={16}
              fontWeight={700}
              fill={on ? C.acid : past ? C.paper : C.faint}
              className={`font-mono ${SVG_TR}`}
            >
              {round}
            </text>
            <text
              x={x}
              y={334}
              textAnchor="middle"
              fontSize={16}
              fontWeight={on ? 700 : 400}
              fill={on ? C.acid : C.muted}
              className={SVG_TR}
            >
              第 {round} 輪
            </text>
          </g>
        );
      })}

      {showNext && (
        <g>
          <circle
            cx={nextX}
            cy={300}
            r={14}
            fill={C.panel}
            stroke={C.muted}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <text x={nextX} y={334} textAnchor="middle" fontSize={16} fill={C.muted}>
            下一輪
          </text>
        </g>
      )}

      {tick >= 1 && (
        <text x={24} y={364} fontSize={16} fill={C.faint}>
          {rhythm.printedLead}
          <tspan fill={C.paper} fontWeight={600}>
            {rhythm.printed[tick]}
          </tspan>
        </text>
      )}
    </svg>
  );
}

/* ── 02／03 右半：四列事實 ────────────────────────────────
 * 每列 dt 100 ＋ gap 16 ＋ dd 442（21px 約 21 字一行）、上下 py 10。
 *   跑什麼 1 行 ＋ loop.md (1 行 ＋ 19px 2 行) ＋ 節奏 2 行（03 是 1 行 ＋ 19px 1 行）
 *   ＋ 多排一件 2 行 ≈ 49 ＋ 107 ＋ 78 ＋ 82 ＝ 316 ≤ 420。
 *   長句一律用 block 手動斷行，不讓瀏覽器把「內建 prompt」「/loop <prompt>」拆在兩行。 */

const YES = 'font-semibold text-teal';
const NOTE = 'mt-1.5 block text-[19px] leading-snug text-muted';

function promptFacts(kind: PromptKind): readonly { label: string; body: ReactNode }[] {
  return [
    {
      label: '跑什麼',
      body: <span className={YES}>✓ 每一輪都跑你給的 prompt</span>,
    },
    {
      label: 'loop.md',
      body: (
        <>
          <span className="font-semibold text-muted">不會被讀</span>
          <span className={NOTE}>
            <span className="block">指令帶了 prompt，Claude Code 就忽略它；</span>
            <span className="block">內建的 maintenance prompt 也不跑。</span>
          </span>
        </>
      ),
    },
    {
      label: '節奏',
      body:
        kind === 'prompt' ? (
          <>
            <span className="block">每輪結束，Claude 看狀況挑下一次：</span>
            <span className="block">1 分鐘～1 小時，並印出挑多久、為什麼。</span>
          </>
        ) : (
          <>
            固定每 5 分鐘一輪，不會依狀況調整。
            <span className={NOTE}>間隔的寫法與限制同第 34 頁。</span>
          </>
        ),
    },
    {
      label: '多排一件',
      body: (
        <>
          <span className="block">想在 loop.md 之外多排一件事，</span>
          <span className="block">
            就下 <code className={`${CODE} whitespace-nowrap`}>/loop &lt;prompt&gt;</code>
            ，或直接請 Claude 排。
          </span>
        </>
      ),
    },
  ];
}

function PromptFacts({ kind }: { kind: PromptKind }) {
  return (
    <dl className="flex min-h-0 min-w-0 flex-col">
      {promptFacts(kind).map((fact) => (
        <div
          key={fact.label}
          className="grid grid-cols-[100px_1fr] gap-4 border-b border-line-soft py-2.5 last:border-b-0"
        >
          <dt className={`${LABEL_PLAIN} pt-1`}>{fact.label}</dt>
          <dd className="text-[21px] leading-snug text-paper">{fact.body}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── 三種給法的資料 ──────────────────────────────────────── */

const DOCS_LOOP_MD =
  'https://code.claude.com/docs/en/scheduled-tasks#customize-the-default-prompt-with-loop-md';
const DOCS_LOOP = 'https://code.claude.com/docs/en/scheduled-tasks#run-a-prompt-repeatedly-with-loop';
const DOCS_CODEX = 'https://learn.chatgpt.com/docs/automations';

interface Input {
  id: InputId;
  name: string;
  sub: string;
  chips: readonly string[];
  given: string;
  docs: string;
  status: readonly string[];
  ms: number;
}

const INPUTS: readonly Input[] = [
  {
    id: 'bare',
    name: '/loop、/loop 15m',
    sub: '沒給 prompt：有 loop.md 就跑它，\n沒有就跑內建的 maintenance prompt',
    chips: ['讀 loop.md', '/loop＝動態節奏', '15m＝固定間隔'],
    given: '沒給 prompt',
    docs: DOCS_LOOP_MD,
    status: [
      '下了 /loop，沒給 prompt → 去找一份預設工作',
      '① 先找專案的 .claude/loop.md，兩個都有時它優先',
      '② 如果專案沒有，才找 ~/.claude/loop.md',
      '③ 如果兩邊都沒有，才跑內建的 maintenance prompt',
      '這個專案有 loop.md → 照它跑，取代內建 prompt',
      '你改了 loop.md → 下一輪就照新內容跑',
    ],
    ms: 1400,
  },
  {
    id: 'prompt',
    name: '/loop 檢查部署',
    sub: '只給 prompt：每一輪跑你的 prompt，\n間隔由 Claude 每輪自己挑',
    chips: ['不讀 loop.md', 'Claude 自挑 1 分鐘～1 小時'],
    given: '只給 prompt',
    docs: DOCS_LOOP,
    status: [
      '下了 /loop 檢查部署：只給 prompt，沒給間隔',
      '第 1 輪：部署還在跑 → Claude 挑 2 分鐘後再看',
      '第 2 輪：還沒跑完 → 再挑 2 分鐘',
      '第 3 輪：部署完成、沒事 → 挑 30 分鐘後',
    ],
    ms: 1300,
  },
  {
    id: 'both',
    name: '/loop 5m 檢查部署',
    sub: '間隔＋prompt：照你寫的固定間隔，\n每一輪跑你的 prompt',
    chips: ['不讀 loop.md', '固定間隔'],
    given: '間隔＋prompt',
    docs: DOCS_LOOP,
    status: [
      '下了 /loop 5m 檢查部署：間隔＋prompt',
      '第 1 輪：跑你給的 prompt，loop.md 不會被讀',
      '5 分鐘到 → 第 2 輪，一樣跑你的 prompt',
      '再 5 分鐘 → 第 3 輪，部署好了也照跑',
    ],
    ms: 1300,
  },
];

/* ── Codex 對照卡（三個選項共用一張）─────────────────────── */

const CODEX_LINES: readonly string[] = [
  'Codex CLI 沒有 /loop；排程任務要在 ChatGPT 網頁版或桌面 app 建立。',
  '常駐的指示寫在任務的 prompt 裡，或掛一個 skill；沒有自動讀的預設檔。',
  '最像 /loop 的是「在對話裡排程」：時間到回到同一個對話、沿用脈絡。',
  'AGENTS.md 是每次啟動都讀的常駐指示，比較像 CLAUDE.md，不是回圈專用。',
];

function CodexCard() {
  return (
    <div className="flex min-h-0 flex-1 gap-6 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6 py-4">
      <div className="flex w-[230px] shrink-0 flex-col gap-1.5">
        <span className={LABEL_FAINT}>Codex 有沒有對應？</span>
        <span className="text-[24px] leading-snug font-semibold text-paper">
          沒有對應的
          <br />
          預設回圈檔
        </span>
        <a href={DOCS_CODEX} target="_blank" rel="noreferrer" className={`${LINK} mt-auto`}>
          Codex 官方文件 ↗
        </a>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[20px] leading-normal text-paper">
        {CODEX_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function InputCard({ index, item, mode }: { index: number; item: Input; mode: PlayMode }) {
  const player = usePlayer(item.status.length - 1, item.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} shrink-0 text-acid`}>寫法 {pad2(index + 1)}</span>
        <span className="font-mono text-[28px] leading-none font-semibold whitespace-nowrap text-paper">
          {item.name}
        </span>
        <span className="shrink-0 rounded-full border border-line bg-panel-lift px-4 py-1 text-[18px] text-paper">
          {item.given}
        </span>
        <a href={item.docs} target="_blank" rel="noreferrer" className={`${LINK} shrink-0`}>
          官方文件 ↗
        </a>
        <PlayerControls player={player} />
      </div>

      {/* 主體：概念圖 ＋ 右半 */}
      <div className="grid h-[420px] shrink-0 grid-cols-[520px_1fr] gap-6">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="h-[372px] shrink-0">
            {item.id === 'bare' ? (
              <LookupScene tick={player.tick} />
            ) : (
              <PromptScene tick={player.tick} kind={item.id} />
            )}
          </div>
          <p className="flex h-10 shrink-0 items-center gap-2 text-[20px] whitespace-nowrap text-paper">
            <span className="font-semibold text-acid">›</span>
            {item.status[player.tick]}
          </p>
        </div>

        {item.id === 'bare' ? (
          <LoopMdSide tick={player.tick} />
        ) : (
          <PromptFacts kind={item.id} />
        )}
      </div>

      {/* Codex 對照卡 */}
      <CodexCard />
    </div>
  );
}

export function LoopMdDemo() {
  const [picked, setPicked] = useState<InputId>('bare');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    INPUTS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：/loop 後面給了什麼 ＋ 怎麼停 ─────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_PLAIN}>
          <span className="font-mono tracking-normal">/loop</span> 後面給了什麼？
        </span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {INPUTS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
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
        <StopCard picked={picked} />
      </div>

      {/* ── 右：概念圖 ───────────────────────────────────── */}
      <InputCard
        key={picked}
        index={index}
        item={INPUTS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
