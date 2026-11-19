import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第六章 近期的分享：專案管理的流程
 *
 *   第 43 頁  ProjectsFlowDemo   開發流程：哪些在 GitHub、哪些在 Claude
 *
 * Notion 原文（2026-10-13「1013 修改」）：
 *   「流程通常會是（幫我畫成流程圖，然後加入哪些在 GitHub、哪些在 Claude 的架構概念圖）
 *    1. 我提出探索方向、探索需求，由 Claude Code 建立方向，並討論哪些加入待開發
 *    2. Claude Code 大量逐步開發
 *    3. 人工 Review → 重新安排開發」
 *
 * 跟前後頁的關係：
 *   第 42 頁（demos-projects.tsx）講 GitHub Projects 看板本身怎麼設計：Status 欄
 *   探索／待開發／開發中／驗收／已上線／完成／凍結。這一頁不再解釋欄位，改講
 *   「流程與架構」：一張卡從探索走到完成，每一步是誰在做、東西放在哪裡。
 *   第 44 頁接著講本地算力。
 *   左下小卡回扣第 31 頁〈Loop Engineering 工程師做什麼〉，用那一頁的詞對照這套流程：
 *   Loop ＝ lane 裡的「實作 → 審查 → 修正」、Harness ＝ gh CLI 與 MCP、邊界 ＝ 常設授權。
 *   第 31 頁的第四件事「觸發方式」在這套流程裡沒有明確對應，不硬套。
 *
 * 版面（同第五章「左邊選項、右邊概念圖」）：
 *   左  Notion 的三步（MenuItem ＋ chips），底下一張「對照第 31 頁」小卡。
 *   右  步驟卡（用步驟 id 當 key 重新掛載）：
 *       標題列 → 泳道流程圖（SVG）＋狀態列 → 「放在哪裡」架構條。
 *       泳道三條：人／Claude Code（本機）／GitHub（雲端）。橫向切三段對應三步；
 *       GitHub 那條就是看板的七個 Status，卡片 #18 照著步驟在 Status 之間移動。
 *       選到的那一段鋪一層很淡的 acid，段落標題下有一條實色粗條；
 *       別段的節點退成細框＋faint 字，仍然讀得到。
 *       最下面一條回圈箭頭：人工 Review 之後，要改的開成新卡回到待開發（不重開舊卡）。
 *       架構條把三個地方的東西列成 chip（Notion 要的「哪些在 GitHub、哪些在 Claude」），
 *       播放到哪一格，那一格用到的 chip 就亮起來。
 *
 * 播放規則（同第 34、36 頁的 usePlayer）：一進頁面停在最後一格；
 * 在左欄點了別的步驟，右邊從頭自動播一次。每一步 5 格（tick 0–4）。
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-13 查）
 * ──────────────────────────────────────────────────────────────
 * 講師的專案文件（工具站專案的開發流程決策、常設授權、驗收分級、agent 操作手冊）：
 *   - 探索：人丟研究方向 → Claude 用 SubAgent 搭配 Ubersuggest MCP、Search Console 等
 *     研究 → 結果用 Project 的 draft issue 寫進「探索」→ 用多選題請人裁示 →
 *     裁示寫成決策紀錄，核准的卡進「待開發」，決定要做了才轉成該站 repo 的 issue。
 *     原文：「探索期的 item 用 Project 的 draft issue，不佔任何 repo。
 *            決定要做了才轉成該 repo 的 issue。」「決策用簡短的多選題」
 *   - 規劃跟開發分開：「研究或裁示後冒出來的新計畫，一律先寫成 GitHub Project item，
 *     不在同一個 session 直接實作；開發由另一個 session 從 Project 接手」
 *   - 開發：用 workflow／SubAgent 分 lane 跑「實作、審查、修正」，
 *     同時進行的 lane 壓在 2 到 3 條。
 *   - 驗收（看板 Status 的說明）：「上線前：build 把關、瀏覽器操作、RWD」
 *   - 上線：push main 觸發 Cloudflare Workers Builds（不手動 wrangler deploy）；
 *     讀回 GitHub 上 Workers Builds 的 check run、再驗線上，才把卡片改成「已上線」。
 *   - 授權：「持續開發，不必逐項請示。」只有三類要停下來問：建立新專案、
 *     增加 Cloudflare 資源、其他危險或不可逆操作。
 *   - Review：人實機驗收、交修正清單、看 SERP 表現；
 *     「回顧要求改什麼，開新的 item，不要重開舊的」；交修正清單時要求「先讀、先更新
 *     Project 再實作」。凍結「決定不執行。要寫下凍結原因」；
 *     完成「沒有後續了。SERP 表現不是完成的條件」。
 *   - Claude 操作 Project 用 gh CLI（加 GraphQL），不是 MCP。
 * 官方文件：
 *   GitHub draft issue
 *     https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project
 *     「Unlike issues and pull requests that are referenced from your repositories,
 *      draft issues exist only in your project.」
 *   Cloudflare Workers Builds
 *     https://developers.cloudflare.com/workers/ci-cd/builds/
 *     「Use Workers Builds to integrate with Git and automatically build and deploy
 *      your Worker when pushing a change」
 *     https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
 *     「You can see the checks by selecting on the status icon next to a commit
 *      within your GitHub repository.」
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 卡片編號 #18、#19，以及被凍結的那張 Draft 卡，都是虛構的。
 *   - 每一格亮哪些 chip（例如開發那格亮 Skill、驗收那格亮 SubAgent）是照流程推的
 *     示意，文件沒有逐格對應。
 *   - 泳道把「驗收」與「上線」併成一個節點；常設授權畫成虛線框（它不是一個動作，
 *     是事先給好的範圍）。
 *   - 左下小卡把第 31 頁的 Loop／Harness／邊界對到這套流程，是課程內的對照，
 *     文件沒有這樣寫。
 *   - 文件裡的私人 repo 名稱、Project 與欄位的內部 ID、帳號、營運數字、
 *     個人工作環境的細節一律不放。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選單選取；目前這一格的節點、箭頭、卡片、亮起的 chip；選到的那一段。
 *   teal  已上線／完成的卡片（正向、走完了）。
 *   三條泳道不用顏色區分，只靠標籤文字＋細線；別段的節點用 line-soft 細框＋faint 字。
 *   淡底（/14、段落底的 0.05）一律配實色邊框或實色粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬度：左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）。
 * 左欄：標籤 26 ＋ 12 ＋ 三張選單 flex-1 ＋ 12 ＋ 對照小卡 122 ＝ 720，
 *       選單 ＝ (720 − 26 − 12 − 12 − 122 − 24) ÷ 3 ≈ 175／張；
 *       選單內容 ＝ 名稱 35 ＋ 6 ＋ 說明兩行 52 ＋ 12 ＋ chips 30 ≈ 137，上下各留約 19。
 *       說明用 \n 指定換行點（whitespace-pre-line），不會剩一個「上線」掉到第二行。
 * 右卡：內高 720 − 2 − 48 ＝ 670
 *       ＝ 標題列 48 ＋ 16 ＋（泳道 SVG 410 ＋ 8 ＋ 狀態列 40）＋ 16 ＋ 架構條 132。
 * 實測（2026-10-13，1920×1080）：根容器 1740 × 720；選單 175 × 3（內容 137）、
 *       對照小卡 122；右卡 標題列 48、泳道＋狀態列 458、架構條 132；
 *       SVG 1102 × 410 以 1:1 呈現。最擠的節點是 cResearch「Ubersuggest MCP」
 *       134／146 與 cLanes「分 lane，同時 2–3 條」148／160，左右各留 6；
 *       「Claude Code」泳道標籤 12–118，離分隔線 126 還有 8。
 *       五種稽核（overflow、contrast、svgContrast、outOfMain、childEscape）
 *       三個步驟的每一格都是空的。
 *       節點 → 膠囊的六條箭頭，終點 x 與膠囊 cx 的差都是 0、最後一段都垂直；
 *       loop 終點：待開發有卡片的格 y 358（步驟 01 tick 4、02 tick 0–1、03 tick 2–4），
 *       其餘 y 316（膠囊底）。換格途中箭頭尖不會從卡片上劃過。
 * 泳道 SVG（viewBox 1102 × 410，1:1 呈現，文字最小 16）：
 *   x  泳道標籤欄 0–126（「Claude Code」17px 粗體約 106，從 x 12 起）；
 *      三段 128–474／474–870／870–1102。
 *   y  段落標題 0–32；人 32–126（節點 42–108）；Claude 126–264（節點 144–246）；
 *      GitHub 264–410（Status 膠囊 280–312、卡片 322–354、回圈線 y 380、標籤 y 400）。
 *   節點 → 膠囊的箭頭尖一律落在膠囊的水平中心（cx）；驗收膠囊在 cShip 左緣外，走折線。
 *   回圈箭頭指著待開發的卡片，待開發沒有卡片時改指膠囊底。
 *   座標細節寫在 NODES／SLOTS／ARROWS 旁邊。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger-more.tsx，不 import 那個檔案）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:border-line-soft disabled:text-faint`;

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity] duration-300 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  lineSoft: 'var(--color-line-soft)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

type Tone = 'line' | 'muted' | 'acid';

const TONE_VAR: Record<Tone, string> = {
  line: C.line,
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

/* ── 播放器（同第 34、36 頁的 usePlayer）───────────────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的步驟時）
 * 步驟卡用步驟 id 當 key，換步驟就整張重掛，狀態自然歸零。 */

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

/** 左側選單的一列（同第 36 頁的 MenuItem，附 chips） */
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
        <span className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {name}
        </span>
        <span
          className={`text-[19px] leading-snug break-keep whitespace-pre-line ${on ? 'text-paper' : 'text-muted'}`}
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

/* ══════════════════════════════════════════════════════════════
 * 泳道流程圖的資料
 * ══════════════════════════════════════════════════════════════ */

type StepId = 'explore' | 'build' | 'review';
type Level = 'on' | 'step' | 'off';

type NodeId =
  | 'hDir'
  | 'hRule'
  | 'hAuth'
  | 'hReview'
  | 'cResearch'
  | 'cDecide'
  | 'cLanes'
  | 'cShip'
  | 'cNew';

type ArrowId =
  | 'dir'
  | 'draft'
  | 'ask'
  | 'rule'
  | 'todo'
  | 'pick'
  | 'auth'
  | 'doing'
  | 'next'
  | 'check'
  | 'live'
  | 'review'
  | 'list'
  | 'frozen'
  | 'loop';

type SlotId = 'explore' | 'todo' | 'doing' | 'check' | 'live' | 'done' | 'frozen';

/* 三段的範圍（x）與段落標題。標題下的粗條左右各內縮 8。 */
const ZONES: readonly { id: StepId; x0: number; x1: number; label: string }[] = [
  { id: 'explore', x0: 128, x1: 474, label: '01 提出探索方向' },
  { id: 'build', x0: 474, x1: 870, label: '02 大量逐步開發' },
  { id: 'review', x0: 870, x1: 1102, label: '03 人工 Review' },
];

const SVG_W = 1102;
const SVG_H = 410;
const LANE_LABEL_W = 126;
const LANE_Y = { header: 32, human: 126, claude: 264 } as const;

/* 節點座標
 *   人      y 42 h 66：標題 baseline y＋28、說明 y＋52
 *   Claude  y 144 h 102：標題 y＋30、說明兩行 y＋58／y＋82
 *   第一段  兩欄 x 136–282（中心 209）、x 310–456（中心 383）
 *   第二段  cLanes x 486–646（中心 566）、cShip x 676–850（中心 763）；hAuth 486–850
 *           cShip 底邊的直線段（扣掉圓角 14）是 690–836：已上線膠囊 797 在裡面，
 *           驗收膠囊 668 不在（所以 check 箭頭是折線，見 ARROWS）。
 *   第三段  x 896–1096（中心 996）
 *   第二、三段之間留 850–896 給「已上線 → 人工 Review」那條彎箭頭。 */

interface NodeSpec {
  step: StepId;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: readonly string[];
  dashed?: boolean;
}

const HUMAN = { y: 42, h: 66 } as const;
const CLAUDE = { y: 144, h: 102 } as const;

const NODES: Record<NodeId, NodeSpec> = {
  hDir: { step: 'explore', x: 136, ...HUMAN, w: 146, title: '提出探索方向', lines: ['方向、需求'] },
  hRule: { step: 'explore', x: 310, ...HUMAN, w: 146, title: '裁示', lines: ['回答多選題'] },
  hAuth: {
    step: 'build',
    x: 486,
    ...HUMAN,
    w: 364,
    title: '常設授權：持續開發，不必逐項請示',
    lines: ['停下來問：建新專案、加雲端資源、危險操作'],
    dashed: true,
  },
  hReview: { step: 'review', x: 896, ...HUMAN, w: 200, title: '上線後驗收', lines: ['修正清單 · SERP 表現'] },
  cResearch: {
    step: 'explore',
    x: 136,
    ...CLAUDE,
    w: 146,
    title: 'SubAgent 研究',
    lines: ['Ubersuggest MCP', 'Search Console'],
  },
  cDecide: {
    step: 'explore',
    x: 310,
    ...CLAUDE,
    w: 146,
    title: '寫決策文件',
    lines: ['核准的進待開發', '轉成 repo issue'],
  },
  cLanes: {
    step: 'build',
    x: 486,
    ...CLAUDE,
    w: 160,
    title: '新 session 接手',
    lines: ['實作 → 審查 → 修正', '分 lane，同時 2–3 條'],
  },
  cShip: {
    step: 'build',
    x: 676,
    ...CLAUDE,
    w: 174,
    title: '驗收 → 上線',
    lines: ['build · 瀏覽器 · RWD', 'push main 自動部署'],
  },
  cNew: {
    step: 'review',
    x: 896,
    ...CLAUDE,
    w: 200,
    title: '開成新卡',
    lines: ['不重開舊卡', '不做的放凍結'],
  },
};

/* 看板的七個 Status（GitHub 泳道）。膠囊寬 92、卡片寬 88，都以 cx 置中。
 *   膠囊在上（y 280–312，像看板的欄位標題）、卡片在下（y 322–354）：
 *   Claude 那條往下的箭頭一律落在膠囊頂的正中（x ＝ cx），不會指著空的卡片位置。
 *   第三段的「完成」「凍結」之間留 976–1004，給回圈箭頭往下走（x 990）。 */
const PILL_W = 92;
const CARD_W = 88;
const PILL_Y = 280;
const CARD_Y = 322;

const SLOTS: Record<SlotId, { step: StepId; cx: number; label: string; dashed?: boolean }> = {
  explore: { step: 'explore', cx: 209, label: '探索' },
  todo: { step: 'explore', cx: 383, label: '待開發' },
  doing: { step: 'build', cx: 539, label: '開發中' },
  check: { step: 'build', cx: 668, label: '驗收' },
  live: { step: 'build', cx: 797, label: '已上線' },
  done: { step: 'review', cx: 930, label: '完成' },
  frozen: { step: 'review', cx: 1050, label: '凍結', dashed: true },
};

const SLOT_ORDER: readonly SlotId[] = ['explore', 'todo', 'doing', 'check', 'live', 'done', 'frozen'];

/* 箭頭。終點留 2–4 給箭頭尖（refX 8／10 → 尖端超出終點約 3）。
 *   節點 → 膠囊（draft todo doing check live frozen）的箭頭尖一律落在膠囊的 cx，
 *   最後一段都是垂直往下：209／383／539／668／797／1050。
 *   check   驗收膠囊中心 668 在 cShip 左緣 676 的外面，直線落不到，改走折線：
 *           cShip 底 x 694 往下到 y 257 → 往左到 668 → 往下進膠囊頂。
 *           折線的橫段 y 257 離泳道分隔線 264 有 7，離 cShip 底 246 有 11。
 *   兩條彎箭頭都從 Status 膠囊的右緣出發（膠囊一直都在；卡片位置常常是空的）。
 *   pick    待開發膠囊右緣 → 新 session（cLanes 左緣）：三次曲線，控制點 x 474，
 *           在 y 246 時 x ≈ 469，離 cDecide 右緣 456 有 13。
 *   review  已上線膠囊右緣 → 上線後驗收（hReview 左緣）：控制點 x 874，
 *           在 y 290 時 x ≈ 851（完成膠囊左緣 884），在 y 248 時 x ≈ 864（cShip 右緣 850），
 *           在 y 144 時 x ≈ 877（cNew 左緣 896）。
 *   loop    開成新卡底部 x 990 → 往下到 y 380 → 往左到待開發 → 往上。
 *           終點看待開發有沒有卡片（loopPath）：有卡片停在卡片底（y 358），
 *           沒有就穿過空的卡片位置，停在膠囊底（y 316）。箭頭永遠指著一個東西，
 *           不會指著膠囊下方的空白。終點怎麼移動見 LOOP_D_TR。 */
const LOOP_END = { card: CARD_Y + 32 + 4, pill: PILL_Y + 32 + 4 } as const;

function loopPath(endY: number) {
  return `M 990 248 L 990 380 L 383 380 L 383 ${endY}`;
}

const ARROWS: Record<ArrowId, { step: StepId; d: string; dashed?: boolean }> = {
  dir: { step: 'explore', d: 'M 209 110 L 209 140' },
  draft: { step: 'explore', d: 'M 209 248 L 209 276' },
  ask: { step: 'explore', d: 'M 266 142 L 318 112' },
  rule: { step: 'explore', d: 'M 383 110 L 383 140' },
  todo: { step: 'explore', d: 'M 383 248 L 383 276' },
  pick: { step: 'build', d: 'M 429 296 C 474 296, 474 195, 482 195' },
  auth: { step: 'build', d: 'M 566 110 L 566 140', dashed: true },
  doing: { step: 'build', d: 'M 539 248 L 539 276' },
  next: { step: 'build', d: 'M 648 195 L 672 195' },
  check: { step: 'build', d: 'M 694 248 L 694 257 L 668 257 L 668 276' },
  live: { step: 'build', d: 'M 797 248 L 797 276' },
  review: { step: 'review', d: 'M 843 296 C 874 296, 874 75, 892 75' },
  list: { step: 'review', d: 'M 960 110 L 960 140' },
  frozen: { step: 'review', d: 'M 1050 248 L 1050 276' },
  loop: { step: 'review', d: loopPath(LOOP_END.card) },
};

const LOOP_LABEL = { x: 686, y: 400, text: '要改的開新卡，回到待開發 · 不重開舊卡' } as const;

/* ── 每一步的五格 ─────────────────────────────────────────
 * nodes／arrows 是這一格亮 acid 的；chips 是架構條上這一格用到的。
 * 卡片的位置另外由 cardsFor() 算（同一張卡片用同一個 id，才會滑過去而不是閃一下）。 */

interface Tick {
  text: string;
  nodes: readonly NodeId[];
  arrows: readonly ArrowId[];
  chips: readonly string[];
}

const TICKS: Record<StepId, readonly Tick[]> = {
  explore: [
    {
      text: '人丟一個研究方向或需求，交給 Claude Code',
      nodes: ['hDir'],
      arrows: [],
      chips: ['方向'],
    },
    {
      text: 'Claude 派 SubAgent 研究：Ubersuggest MCP、Search Console 等',
      nodes: ['cResearch'],
      arrows: ['dir'],
      chips: ['SubAgent', 'MCP'],
    },
    {
      text: '研究結果開成 Draft 卡，放進 Project 的「探索」',
      nodes: ['cResearch'],
      arrows: ['draft'],
      chips: ['gh CLI', 'Project 看板'],
    },
    {
      text: '用多選題請人裁示：哪些加入待開發',
      nodes: ['hRule'],
      arrows: ['ask'],
      chips: ['裁示'],
    },
    {
      text: '裁示寫成決策文件；核准的卡進「待開發」，轉成該站 repo 的 issue',
      nodes: ['cDecide'],
      arrows: ['rule', 'todo'],
      chips: ['決策文件', 'gh CLI', 'repo issue'],
    },
  ],
  build: [
    {
      text: '規劃跟開發分開：另一個 session 從看板接手這張卡',
      nodes: ['cLanes'],
      arrows: ['pick'],
      chips: ['CLAUDE.md／AGENTS.md', 'gh CLI', 'Project 看板'],
    },
    {
      text: '人給的是常設授權「持續開發，不必逐項請示」，只有三類事要停下來問',
      nodes: ['hAuth'],
      arrows: ['auth'],
      chips: ['常設授權'],
    },
    {
      text: '改成「開發中」，分 lane 跑「實作 → 審查 → 修正」，同時只開 2–3 條',
      nodes: ['cLanes'],
      arrows: ['doing'],
      chips: ['SubAgent', 'Skill'],
    },
    {
      text: '驗收：build、瀏覽器操作、RWD 都過了，才往下走',
      nodes: ['cShip'],
      arrows: ['next', 'check'],
      chips: ['SubAgent'],
    },
    {
      text: 'push main，Workers Builds 自動部署；讀回 check run、驗過線上 → 已上線',
      nodes: ['cShip'],
      arrows: ['live'],
      chips: ['gh CLI', 'check run', 'Project 看板'],
    },
  ],
  review: [
    {
      text: '上線之後，人實機驗收、看 SERP（搜尋結果）表現',
      nodes: ['hReview'],
      arrows: ['review'],
      chips: ['Review'],
    },
    {
      text: '交修正清單給 Claude：先更新 Project，再實作',
      nodes: ['cNew'],
      arrows: ['list'],
      chips: ['gh CLI', 'Project 看板'],
    },
    {
      text: '要改的開成「新的」卡，放回待開發，不重開舊卡',
      nodes: ['cNew'],
      arrows: ['loop'],
      chips: ['repo issue', 'Project 看板'],
    },
    {
      text: '決定不做的放進「凍結」，寫下凍結的原因',
      nodes: ['cNew'],
      arrows: ['frozen'],
      chips: ['裁示', 'Project 看板'],
    },
    {
      text: '舊卡沒有後續了才改「完成」；新卡 #19 等著下一輪開發',
      nodes: [],
      arrows: [],
      chips: ['Project 看板'],
    },
  ],
};

type CardTone = 'acid' | 'teal' | 'plain';

interface CardState {
  id: string;
  slot: SlotId;
  label: string;
  tone: CardTone;
  shown: boolean;
  draft?: boolean;
}

/** 看板上的卡片：#18 是主角，#19 是 Review 之後開的新卡，Draft 是被凍結的那張 */
function cardsFor(step: StepId, tick: number): readonly CardState[] {
  if (step === 'explore') {
    const converted = tick >= 4;
    return [
      {
        id: 'main',
        slot: converted ? 'todo' : 'explore',
        label: converted ? '#18' : 'Draft',
        draft: !converted,
        tone: tick === 2 || tick === 4 ? 'acid' : 'plain',
        shown: tick >= 2,
      },
    ];
  }
  if (step === 'build') {
    const path: readonly SlotId[] = ['todo', 'todo', 'doing', 'check', 'live'];
    return [
      {
        id: 'main',
        slot: path[tick] ?? 'live',
        label: '#18',
        tone: tick === 4 ? 'teal' : tick === 1 ? 'plain' : 'acid',
        shown: true,
      },
    ];
  }
  return [
    { id: 'main', slot: tick >= 4 ? 'done' : 'live', label: '#18', tone: 'teal', shown: true },
    {
      id: 'new',
      slot: 'todo',
      label: '#19',
      tone: tick === 2 || tick === 4 ? 'acid' : 'plain',
      shown: tick >= 2,
    },
    {
      id: 'frozen',
      slot: 'frozen',
      label: 'Draft',
      draft: true,
      tone: tick === 3 ? 'acid' : 'plain',
      shown: tick >= 3,
    },
  ];
}

/* ── 泳道的零件 ─────────────────────────────────────────── */

function FlowNode({ node, level }: { node: NodeSpec; level: Level }) {
  const on = level === 'on';
  const off = level === 'off';
  const cx = node.x + node.w / 2;
  const isHuman = node.h === HUMAN.h;
  const titleY = node.y + (isHuman ? 28 : 30);
  const lineY = (index: number) => node.y + (isHuman ? 52 : 58) + index * 24;

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={14}
        fill={on ? C.acid : off ? C.panel : C.inkSoft}
        fillOpacity={on ? 0.14 : 1}
        stroke={on ? C.acid : off ? C.lineSoft : C.line}
        strokeWidth={on ? 3.5 : off ? 1.5 : 2}
        strokeDasharray={node.dashed ? '7 6' : undefined}
        className={SVG_TR}
      />
      <text
        x={cx}
        y={titleY}
        textAnchor="middle"
        fontSize={18}
        fontWeight={off ? 500 : 700}
        fill={on ? C.acid : off ? C.faint : C.paper}
        className={SVG_TR}
      >
        {node.title}
      </text>
      {node.lines.map((line, index) => (
        <text
          key={line}
          x={cx}
          y={lineY(index)}
          textAnchor="middle"
          fontSize={16}
          fill={off ? C.faint : C.muted}
          className={SVG_TR}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* 箭頭的轉場：顏色、粗細同 SVG_TR。d 只有 loop 會變（見 LOOP_END），而且分方向：
 *   卡片進待開發 → 箭頭立刻縮到卡片底（d 0s），箭頭尖不會從卡片上劃過；
 *   卡片離開待開發 → 等卡片滑出這一格（約 250ms）再伸到膠囊底。 */
const ARROW_TR = 'stroke 300ms ease-out, stroke-width 300ms ease-out';
const LOOP_D_TR = { filled: 'd 0s', empty: 'd 350ms ease-out 250ms' } as const;

function FlowArrow({
  id,
  level,
  d,
  dTransition,
}: {
  id: ArrowId;
  level: Level;
  d?: string;
  dTransition?: string;
}) {
  const spec = ARROWS[id];
  const tone: Tone = level === 'on' ? 'acid' : level === 'step' ? 'muted' : 'line';
  return (
    <path
      d={d ?? spec.d}
      fill="none"
      stroke={TONE_VAR[tone]}
      strokeWidth={level === 'on' ? 3.5 : level === 'step' ? 2 : 1.5}
      strokeDasharray={spec.dashed ? '7 6' : undefined}
      strokeLinejoin="round"
      markerEnd={`url(#pf-${tone})`}
      style={{ transition: dTransition ? `${ARROW_TR}, ${dTransition}` : ARROW_TR }}
    />
  );
}

function StatusPill({ slot, lit }: { slot: SlotId; lit: boolean }) {
  const spec = SLOTS[slot];
  return (
    <g>
      <rect
        x={spec.cx - PILL_W / 2}
        y={PILL_Y}
        width={PILL_W}
        height={32}
        rx={16}
        fill={lit ? C.inkSoft : C.panel}
        stroke={lit ? C.line : C.lineSoft}
        strokeWidth={lit ? 2 : 1.5}
        strokeDasharray={spec.dashed ? '5 4' : undefined}
        className={SVG_TR}
      />
      <text
        x={spec.cx}
        y={PILL_Y + 22}
        textAnchor="middle"
        fontSize={17}
        fontWeight={lit ? 600 : 400}
        fill={lit ? C.paper : C.faint}
        className={SVG_TR}
      >
        {spec.label}
      </text>
    </g>
  );
}

const CARD_TONE: Record<CardTone, { fill: string; opacity: number; stroke: string; width: number; text: string }> = {
  acid: { fill: C.acid, opacity: 0.14, stroke: C.acid, width: 3, text: C.acid },
  teal: { fill: C.teal, opacity: 0.14, stroke: C.teal, width: 3, text: C.teal },
  plain: { fill: C.panel, opacity: 1, stroke: C.paper, width: 2, text: C.paper },
};

/** 看板上的一張卡片：用 CSS transform 滑到該 Status 的位置 */
function BoardCard({ card }: { card: CardState }) {
  const tone = CARD_TONE[card.tone];
  const x = SLOTS[card.slot].cx - CARD_W / 2;
  return (
    <g
      style={{
        transform: `translate(${x}px, ${CARD_Y}px)`,
        opacity: card.shown ? 1 : 0,
        transition: 'transform 600ms ease-in-out, opacity 300ms ease-out',
      }}
    >
      <rect
        x={0}
        y={0}
        width={CARD_W}
        height={32}
        rx={8}
        fill={tone.fill}
        fillOpacity={tone.opacity}
        stroke={tone.stroke}
        strokeWidth={tone.width}
        strokeDasharray={card.draft ? '6 4' : undefined}
        className={SVG_TR}
      />
      <text
        x={CARD_W / 2}
        y={22}
        textAnchor="middle"
        fontSize={17}
        fontWeight={700}
        fill={tone.text}
        className={card.draft ? SVG_TR : `font-mono ${SVG_TR}`}
      >
        {card.label}
      </text>
    </g>
  );
}

/* ── 泳道流程圖 ─────────────────────────────────────────── */

function FlowScene({ step, tick }: { step: StepId; tick: number }) {
  const current = TICKS[step][tick];
  const cards = cardsFor(step, tick);

  const nodeLevel = (id: NodeId): Level =>
    current.nodes.includes(id) ? 'on' : NODES[id].step === step ? 'step' : 'off';
  const arrowLevel = (id: ArrowId): Level =>
    current.arrows.includes(id) ? 'on' : ARROWS[id].step === step ? 'step' : 'off';
  const slotLit = (slot: SlotId) =>
    SLOTS[slot].step === step || cards.some((card) => card.shown && card.slot === slot);

  const loopLevel = arrowLevel('loop');
  const todoFilled = cards.some((card) => card.shown && card.slot === 'todo');
  const loopD = loopPath(todoFilled ? LOOP_END.card : LOOP_END.pill);
  const zone = ZONES.find((item) => item.id === step) ?? ZONES[0];

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} role="img" className="shrink-0">
      <title>
        開發流程的泳道圖：人、本機的 Claude Code、GitHub 三條泳道；人提出方向與裁示，Claude
        研究、開卡、分 lane 開發到上線，GitHub 看板的卡片從探索走到完成；人工 Review
        之後要改的開成新卡回到待開發
      </title>
      <ArrowMarkers prefix="pf" tones={['line', 'muted', 'acid']} />

      {/* 選到的那一段：很淡的底（實色粗條在段落標題下） */}
      <rect
        x={zone.x0 + 2}
        y={LANE_Y.header}
        width={zone.x1 - zone.x0 - 4}
        height={SVG_H - LANE_Y.header}
        fill={C.acid}
        fillOpacity={0.05}
      />

      {/* 段落標題 */}
      {ZONES.map((item) => {
        const on = item.id === step;
        return (
          <g key={item.id}>
            <text
              x={(item.x0 + item.x1) / 2}
              y={20}
              textAnchor="middle"
              fontSize={17}
              fontWeight={on ? 700 : 400}
              fill={on ? C.acid : C.muted}
            >
              {item.label}
            </text>
            <rect
              x={item.x0 + 8}
              y={on ? 26 : 28}
              width={item.x1 - item.x0 - 16}
              height={on ? 5 : 2}
              rx={on ? 2.5 : 1}
              fill={on ? C.acid : C.line}
            />
          </g>
        );
      })}

      {/* 泳道分隔線與泳道標籤 */}
      {[LANE_Y.header, LANE_Y.human, LANE_Y.claude].map((y) => (
        <line key={y} x1={0} y1={y} x2={SVG_W} y2={y} stroke={C.lineSoft} strokeWidth={1.5} />
      ))}
      <line
        x1={LANE_LABEL_W}
        y1={LANE_Y.header}
        x2={LANE_LABEL_W}
        y2={SVG_H}
        stroke={C.lineSoft}
        strokeWidth={1.5}
      />
      <text x={12} y={86} fontSize={20} fontWeight={700} fill={C.paper}>
        人
      </text>
      <text x={12} y={190} fontSize={17} fontWeight={700} fill={C.paper}>
        Claude Code
      </text>
      <text x={12} y={214} fontSize={16} fill={C.muted}>
        本機
      </text>
      <text x={12} y={312} fontSize={17} fontWeight={700} fill={C.paper}>
        GitHub
      </text>
      <text x={12} y={336} fontSize={16} fill={C.muted}>
        雲端 · 看板
      </text>

      {/* Status 膠囊 */}
      {SLOT_ORDER.map((slot) => (
        <StatusPill key={slot} slot={slot} lit={slotLit(slot)} />
      ))}

      {/* 箭頭（先畫，節點蓋在上面） */}
      {(Object.keys(ARROWS) as ArrowId[]).map((id) => (
        <FlowArrow
          key={id}
          id={id}
          level={arrowLevel(id)}
          d={id === 'loop' ? loopD : undefined}
          dTransition={id === 'loop' ? LOOP_D_TR[todoFilled ? 'filled' : 'empty'] : undefined}
        />
      ))}
      <text
        x={LOOP_LABEL.x}
        y={LOOP_LABEL.y}
        textAnchor="middle"
        fontSize={16}
        fontWeight={loopLevel === 'off' ? 400 : 700}
        fill={loopLevel === 'on' ? C.acid : loopLevel === 'step' ? C.paper : C.faint}
        className={SVG_TR}
      >
        {LOOP_LABEL.text}
      </text>

      {/* 節點 */}
      {(Object.keys(NODES) as NodeId[]).map((id) => (
        <FlowNode key={id} node={NODES[id]} level={nodeLevel(id)} />
      ))}

      {/* 卡片 */}
      {cards.map((card) => (
        <BoardCard key={card.id} card={card} />
      ))}
    </svg>
  );
}

/* ── 架構條：東西放在哪裡 ─────────────────────────────────
 * 寬：內寬 1102 − 1 − 6（左粗條）− 48 ＝ 1047
 *   ＝ 標題欄 96 ＋ 24 ＋ 人 180 ＋ 24 ＋ Claude 340 ＋ 24 ＋ GitHub 359。
 *   Claude 兩列：「CLAUDE.md／AGENTS.md」「決策文件」／「Skill」「gh CLI」「MCP」「SubAgent」。
 *   人兩列：「方向」「裁示」／「常設授權」「Review」。GitHub 一列 chips ＋ 一行說明，
 *   標籤列右邊是圖例。三欄頂端對齊（items-start），標籤才會在同一條線上。
 *   GitHub 欄的說明句用 19px（說明字級的下限），一行約 330，欄寬 359 放得下。
 *   亮起的 chip 用實心 acid ＋ on-accent 字：acid 字壓 acid/14 淡底只有 4.24:1，不夠。 */

const ARCH: readonly { id: string; label: string; chips: readonly string[]; note?: string }[] = [
  { id: 'human', label: '人', chips: ['方向', '裁示', '常設授權', 'Review'] },
  {
    id: 'claude',
    label: 'Claude Code · 本機',
    chips: ['CLAUDE.md／AGENTS.md', '決策文件', 'Skill', 'gh CLI', 'MCP', 'SubAgent'],
  },
  {
    id: 'github',
    label: 'GitHub · 雲端',
    chips: ['Project 看板', 'repo issue', 'check run'],
    note: 'Claude 用 gh CLI 讀寫看板，不靠 MCP',
  },
];

function ArchStrip({ lit }: { lit: readonly string[] }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[96px_180px_340px_1fr] items-start gap-6 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6 py-3">
      <div className="flex flex-col gap-1 self-center">
        <span className={LABEL_FAINT}>架構</span>
        <span className="text-[22px] leading-snug font-semibold text-paper">放在哪裡</span>
      </div>
      {ARCH.map((group) => (
        <div key={group.id} className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center justify-between gap-3">
            <span className={LABEL_FAINT}>{group.label}</span>
            {group.id === 'github' && (
              <span className="flex items-center gap-2 text-[16px] text-faint">
                <span className="size-3.5 rounded-sm bg-acid" />
                現在用到的
              </span>
            )}
          </span>
          <span className="flex flex-wrap gap-x-2 gap-y-1.5">
            {group.chips.map((chip) => {
              const on = lit.includes(chip);
              return (
                <span
                  key={chip}
                  className={`rounded-md border px-2.5 py-0.5 text-[17px] whitespace-nowrap transition-colors duration-300 ${
                    on
                      ? 'border-acid bg-acid font-semibold text-on-accent'
                      : 'border-line bg-panel text-muted'
                  }`}
                >
                  {chip}
                </span>
              );
            })}
          </span>
          {group.note && (
            <span className="text-[19px] leading-snug whitespace-nowrap text-muted">{group.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 43 頁 · ProjectsFlowDemo
 * ══════════════════════════════════════════════════════════════ */

interface FlowStep {
  id: StepId;
  /** 左欄選單 */
  name: string;
  sub: string;
  chips: readonly string[];
  /** 右卡標題列（Notion 原句的意思） */
  title: string;
  ms: number;
}

const STEPS: readonly FlowStep[] = [
  {
    id: 'explore',
    name: '提出探索方向',
    sub: '提出方向與需求，Claude Code 建立方向，\n再討論哪些加入待開發',
    chips: ['Draft 卡', '多選題裁示', '決策文件'],
    title: '提出探索方向，討論哪些加入待開發',
    ms: 1500,
  },
  {
    id: 'build',
    name: 'Claude Code 大量逐步開發',
    sub: '另一個 session 從看板接手，\n分 lane 一路開發、驗收到上線',
    chips: ['常設授權', '同時 2–3 條', 'push 即部署'],
    title: 'Claude Code 大量逐步開發',
    ms: 1500,
  },
  {
    id: 'review',
    name: '人工 Review → 重新安排',
    sub: '實機驗收、交修正清單；\n要改的開成新卡，放回待開發',
    chips: ['開新卡', '不重開舊卡', '不做就凍結'],
    title: '人工 Review → 重新安排開發',
    ms: 1500,
  },
];

function StepCard({ index, item, mode }: { index: number; item: FlowStep; mode: PlayMode }) {
  const ticks = TICKS[item.id];
  const player = usePlayer(ticks.length - 1, item.ms, mode);
  const current = ticks[player.tick];

  return (
    <div className="slide-enter flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} shrink-0 text-acid`}>步驟 {pad2(index + 1)}</span>
        <span className="min-w-0 text-[30px] leading-none font-semibold text-paper">
          {item.title}
        </span>
        <PlayerControls player={player} />
      </div>

      {/* 泳道流程圖 ＋ 狀態列 */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="h-[410px] shrink-0">
          <FlowScene step={item.id} tick={player.tick} />
        </div>
        <p className="flex h-10 shrink-0 items-center gap-2 text-[20px] whitespace-nowrap text-paper">
          <span className="font-semibold text-acid">›</span>
          {current.text}
        </p>
      </div>

      {/* 架構條 */}
      <ArchStrip lit={current.chips} />
    </div>
  );
}

export function ProjectsFlowDemo() {
  const [picked, setPicked] = useState<StepId>('explore');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    STEPS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：Notion 的三步 ＋ 對照第 31 頁 ───────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <span className={LABEL_FAINT}>實際的開發流程 · 三步一圈</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {STEPS.map((item, i) => (
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
        <div className="flex shrink-0 flex-col gap-1.5 rounded-2xl border border-l-[6px] border-line border-l-muted bg-panel-lift px-6 py-3.5">
          <span className={LABEL_FAINT}>對照第 31 頁 · 工程師做什麼</span>
          <p className="text-[20px] leading-normal whitespace-pre-line text-paper">
            {'Loop 是 lane 裡的實作 → 審查 → 修正；\nHarness 是 AGENTS.md、skills 與 gh CLI；\n邊界是三類要停下來問的事。'}
          </p>
        </div>
      </div>

      {/* ── 右：泳道流程圖 ＋ 架構 ───────────────────────────── */}
      <StepCard
        key={picked}
        index={index}
        item={STEPS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
