import { Fragment, useEffect, useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：觸發方式（續）
 *
 *   第 36 頁  MoreTriggersDemo   其他觸發方式（Desktop 排程任務、GitHub Actions、Channels）
 *
 * 背景：第 34 頁的 callout 要查 /loop、CronCreate、Routines 三種方案。做那頁時查
 * 官方文件，scheduled-tasks 頁面還另外點名了三條 callout 沒列的路：
 *   「For scheduling that survives independently of any session, use Routines …,
 *    set up a Desktop scheduled task, or use GitHub Actions.」
 *   「To react to events as they happen instead of polling, see Channels:
 *    your CI can push the failure into the session directly.」
 * 講師看完說「新增一頁，說明你提到這些方法」，就是這一頁。
 *
 * 跟第 34 頁的關係（左欄上方那張「接續第 34 頁」卡）：
 *   /loop 關掉 session 就停        → Desktop 排程任務不用開著 session
 *   Routines 不能被 issue 觸發     → GitHub Actions 可以
 *   定時去問，總會慢一拍           → Channels 讓事件直接推進來
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-06 查的官方文件）
 * ──────────────────────────────────────────────────────────────
 * Desktop 排程任務 · https://code.claude.com/docs/en/desktop-scheduled-tasks
 *   - 在你的電腦上跑，每次開一個新的 session，跟你手動開的 session 無關。
 *   - 只在 Desktop app 開著、電腦醒著時才會跑；睡著的那次跳過。醒來時檢查過去
 *     7 天，只補跑「最近錯過的那一次」。
 *   - 建立：Code 分頁 → Routines → New routine → Local（Desktop 1.1.5368 起），
 *     或在任何 session 裡用講的。Desktop 的 Routines 頁同時管本機排程與雲端 routine。
 *   - 選單：Manual／Hourly／Daily／Weekdays／Weekly；更密的（例如每 15 分鐘）用講的。
 *     比較表：最短 1 分鐘、不需要開著 session、要開著電腦、可以讀本機檔案。
 *   - 不能被事件觸發：要接 API 或 GitHub 事件，文件建議改用雲端 routine。
 *   - prompt 存在 ~/.claude/scheduled-tasks/<task-name>/SKILL.md。
 * GitHub Actions · https://code.claude.com/docs/en/github-actions
 *   - anthropics/claude-code-action@v1，在 GitHub 的 runner 上跑 Claude Code；
 *     /install-github-app 一鍵設定（App、secret、workflow PR）。
 *   - 沒給 prompt ＝ interactive mode：等 @claude，出現在留言、PR review，
 *     或「新開 issue 的標題／內文」裡都會觸發。給了 prompt ＝ automation mode：
 *     任何 GitHub 事件都能跑，包括 schedule。
 *   - 費用：GitHub Actions 分鐘數 ＋ API token（或訂閱的 OAuth token）。
 *   - action 的 usage.md（github.com/anthropics/claude-code-action）有
 *     `issues: types: [opened, assigned, labeled]` 的範例與 label_trigger 參數；
 *     branch_prefix 預設 claude/。FAQ：預設不直接開 PR，而是推到分支、附上
 *     預填好的開 PR 連結（尊重 branch protection）。
 *   - schedule 最短 5 分鐘是 GitHub 自己的限制（docs.github.com 的 events 文件），
 *     整點高峰可能延遲。
 * Channels · https://code.claude.com/docs/en/channels
 *          · https://code.claude.com/docs/en/channels-reference
 *   - research preview。channel 是一個 MCP server，把事件推進「正在跑的」session；
 *     session 沒開就收不到。
 *   - 內建 Telegram、Discord、iMessage（＋ fakechat 示範）；用
 *     `claude --channels plugin:<name>@claude-plugins-official` 開。
 *   - 接 CI 要自己寫 webhook channel（reference 有範例：本機 127.0.0.1:8788，
 *     終端機顯示 `← webhook: build failed on main`）；自製的不在 allowlist，
 *     研究預覽期間要用 --dangerously-load-development-channels。
 *   - 要 claude.ai 登入或 Console API key；Bedrock／Agent Platform／Foundry 不支援；
 *     Team／Enterprise 要 Owner 開啟 channelsEnabled。
 * Codex
 *   - 桌面排程 · https://learn.chatgpt.com/docs/automations：桌面 app 的排程任務在專案
 *     資料夾或 worktree 裡跑，要開著電腦和 app；對話內排程可用分鐘級間隔，進階週期
 *     寫 RRULE；Codex CLI 沒有排程介面。事件觸發（Gmail／Slack／GitHub 的 Pull
 *     request 活動）只在網頁版與手機，桌面 app、CLI、IDE 都沒有。
 *   - GitHub Action · https://learn.chatgpt.com/docs/github-action：openai/codex-action@v1
 *     在 workflow 裡跑 codex exec，要 OPENAI_API_KEY；官方範例接 pull_request，
 *     留言要另一個 job 用 github-script 發。@codex 標記（third-party/github）只用在 PR。
 *   - Channels：沒有對應。Codex CLI 不會把 MCP 通知送進正在跑的 session，
 *     openai/codex issue #15299（2026-03 開）還開著。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - Desktop：任務名 daily-review、每天 09:00、「review 昨天的 commit」、
 *     資料夾 ~/projects/shop、「隔天睡著」的情境。
 *   - GitHub Actions：issue #27「新增匯出 CSV」、label 名稱 claude、右側「也能接的事件」
 *     的挑選。YAML 只節錄 on: 那段並標「示意 · 節錄」，types 刻意只放 opened、labeled。
 *   - Channels：「把設定頁的表單拆成元件」這件手上的事、auth.test.ts、
 *     build failed on main 那行沿用 reference 的範例字串。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選單選取、目前觸發的那一條（節點、箭頭、狀態列）、接續卡裡對應的那一列。
 *   teal  「✓ 可以」：GitHub Actions 接得到 issue、Channels 的事件觸發、Desktop 跑完。
 *         第 34 頁用 coral 標 Routines 的 issue ✕；這頁是補上缺口，所以改用正向的 teal。
 *   「✕ 不能」（Desktop 的事件觸發）一律中性 muted。Codex 對照卡、地點標籤也是中性。
 *   淡底（/14）一律配實色邊框或 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬度：同第 34 頁。左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1102）；
 *       右卡主體 ＝ 圖解 540 ＋ gap 24 ＋ 事實 538（dt 100 ＋ 16 ＋ dd 422）。
 * 左欄：接續卡 ≈ 2 ＋ py 24 ＋ 標籤 26 ＋ 8 ＋ 三列 3 × 26 ＋ 2 × 4 ≈ 146，
 *       gap 12，三張選單 (720 − 146 − 12 − 24) ÷ 3 ≈ 179／張；
 *       選單內容 ＝ py 32 ＋ 名稱 35 ＋ 6 ＋ 說明兩行 52 ＋ 12 ＋ 標籤 31 ≈ 168，放得下。
 *       （第 34 頁頂端那行小標籤併進接續卡，省下 42。）
 * 右卡：內高 720 − 2 − 48 ＝ 670 ＝ 標題列 48 ＋ 16 ＋ 主體 420 ＋ 16 ＋ Codex 對照卡 170。
 *       主體左半 ＝ 圖解 372 ＋ 8 ＋ 狀態 40；右半四列的細算寫在資料旁。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger.tsx，不 import 那個檔案）──── */

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

/** 簡化的人形：圓頭 ＋ 圓肩。(cx, cy) 是頭的圓心 */
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

/** 節點底色：作用中 ＝ acid 淡底 ＋ 實色粗框；平常 ＝ ink-soft ＋ line 細框 */
function nodeStyle(active: boolean) {
  return {
    fill: active ? C.acid : C.inkSoft,
    fillOpacity: active ? 0.14 : 1,
    stroke: active ? C.acid : C.line,
    strokeWidth: active ? 3.5 : 2,
  };
}

/** 直線箭頭：作用中 acid、平常 muted；dashed 用在「送不到」 */
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
      strokeDasharray={dashed ? '7 6' : undefined}
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

/** 左側選單的一列（同第 34 頁的 MenuItem） */
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

type MethodId = 'desktop' | 'actions' | 'channels';

/* ── 接續第 34 頁：三個缺口，各補一條 ─────────────────────
 * 三列 max-content 對齊箭頭。19px 下最寬的缺口「Routines 不能被 issue 觸發」約 243，
 * 箭頭欄約 20 ＋ 兩個 gap 24，解法欄最寬「Desktop 免開 session」semibold 約 193，
 * 合計約 480 ≤ 卡片內寬 540 − 2 − 6 − 40 ＝ 492。 */

const BRIDGE: readonly { id: MethodId; gap: string; fix: string }[] = [
  { id: 'desktop', gap: '/loop 關掉 session 就停', fix: 'Desktop 免開 session' },
  { id: 'actions', gap: 'Routines 不能被 issue 觸發', fix: 'GitHub Actions 可以' },
  { id: 'channels', gap: '定時去問，總會慢一拍', fix: 'Channels 直接推進來' },
];

function BridgeCard({ picked }: { picked: MethodId }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-5 py-3">
      <span className={LABEL_FAINT}>接續第 34 頁 · 三個缺口，各補一條</span>
      <div className="grid grid-cols-[max-content_max-content_1fr] items-center gap-x-3 gap-y-1 text-[19px] leading-snug">
        {BRIDGE.map((row) => {
          const on = row.id === picked;
          return (
            <Fragment key={row.id}>
              <span className="whitespace-nowrap text-muted">{row.gap}</span>
              <span className={on ? 'font-semibold text-acid' : 'text-faint'}>→</span>
              <span
                className={`whitespace-nowrap transition-colors duration-200 ${
                  on ? 'font-semibold text-acid' : 'text-paper'
                }`}
              >
                {row.fix}
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── 01 Desktop 排程任務 ─────────────────────────────────
 * tick 0 電腦開著、沒有 session → 1 時間到，Desktop 自己開一個 → 2 在資料夾裡跑
 *      → 3 跑完、通知、側欄多一筆 → 4 睡著那次跳過，醒來補跑一次。
 * 座標（viewBox 540 × 372，1:1 呈現）：
 *   電腦外框 (6, 6) 528 × 360；標題列 y 42、分隔線 y 60
 *   排程任務 (30, 80) 214 × 124；你開著的 session（虛線）(30, 226) 214 × 116
 *   新的 session (296, 80) 216 × 124；側欄 Scheduled (296, 244) 216 × 98
 *   人形 (204, 274) r 15：頭 259–289，「你開著的 session」右緣約 181，不相碰 */

function DesktopScene({ tick }: { tick: number }) {
  const fireOn = tick === 1;
  const sessionOn = tick === 1 || tick === 2;
  const doneOn = tick >= 3;

  let sessionState = '還沒開始';
  if (tick === 1) sessionState = 'Desktop 自己開的';
  else if (tick === 2) sessionState = '讀檔、改程式…';
  else if (tick >= 3) sessionState = '跑完了';

  return (
    <svg width={540} height={372} viewBox="0 0 540 372" role="img" className="shrink-0">
      <title>Desktop 排程任務：電腦開著、你沒有開任何 session，時間到 Desktop app 自己開一個新的 session 來跑</title>
      <ArrowMarkers prefix="mt-dk" tones={['muted', 'acid']} />

      {/* 你的電腦 */}
      <rect x={6} y={6} width={528} height={360} rx={22} fill="none" stroke={C.muted} strokeWidth={2} />
      <text x={30} y={42} fontSize={18} fontWeight={600} fill={C.paper}>
        你的電腦 · Claude Desktop app
      </text>
      <text
        x={510}
        y={42}
        textAnchor="end"
        fontSize={17}
        fontWeight={tick === 4 ? 700 : 400}
        fill={tick === 4 ? C.acid : C.muted}
        className={SVG_TR}
      >
        要開著、不能睡著
      </text>
      <line x1={6} y1={60} x2={534} y2={60} stroke={C.line} strokeWidth={1.5} />

      {/* 排程任務 */}
      <rect x={30} y={80} width={214} height={124} rx={16} {...nodeStyle(fireOn)} className={SVG_TR} />
      <ClockIcon cx={56} cy={108} color={fireOn ? C.acid : C.paper} />
      <text x={78} y={114} fontSize={17} fill={C.muted} className="font-mono">
        daily-review
      </text>
      <text
        x={50}
        y={154}
        fontSize={24}
        fontWeight={700}
        fill={fireOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        每天 09:00
      </text>
      <text x={50} y={186} fontSize={17} fill={C.muted}>
        review 昨天的 commit
      </text>

      {/* 你開著的 session：沒有 */}
      <rect
        x={30}
        y={226}
        width={214}
        height={116}
        rx={16}
        fill="none"
        stroke={C.muted}
        strokeWidth={2}
        strokeDasharray="7 6"
      />
      <text x={50} y={258} fontSize={17} fill={C.muted}>
        你開著的 session
      </text>
      <text x={50} y={302} fontSize={30} fontWeight={700} fill={C.paper}>
        0 個
      </text>
      <text x={50} y={330} fontSize={17} fill={C.muted}>
        不用開著
      </text>
      <Person cx={204} cy={274} r={15} color={C.muted} dashed />

      {/* 排程 → 新的 session */}
      <Arrow d="M 248 142 L 290 142" on={fireOn} prefix="mt-dk" />

      {/* 新的 session */}
      <rect x={296} y={80} width={216} height={124} rx={16} {...nodeStyle(sessionOn)} className={SVG_TR} />
      <text
        x={314}
        y={114}
        fontSize={20}
        fontWeight={700}
        fill={sessionOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        新的 session
      </text>
      <text
        x={314}
        y={150}
        fontSize={18}
        fontWeight={sessionOn ? 600 : 400}
        fill={tick === 0 ? C.faint : C.paper}
        className={SVG_TR}
      >
        {sessionState}
      </text>
      <text x={314} y={184} fontSize={16} fill={C.muted} className="font-mono">
        ~/projects/shop
      </text>

      {/* 新的 session → 側欄紀錄 */}
      <Arrow d="M 404 208 L 404 238" on={tick === 3} prefix="mt-dk" />

      {/* 側欄 · Scheduled */}
      <rect x={296} y={244} width={216} height={98} rx={16} {...nodeStyle(tick === 3)} className={SVG_TR} />
      <text x={314} y={272} fontSize={17} fill={C.faint}>
        側欄 · Scheduled
      </text>
      {doneOn ? (
        <text x={314} y={302} fontSize={18} fontWeight={700} fill={C.teal}>
          ✓ 今天這次完成
        </text>
      ) : (
        <text x={314} y={302} fontSize={17} fill={C.faint}>
          還沒有紀錄
        </text>
      )}
      {tick === 3 && (
        <text x={314} y={330} fontSize={17} fill={C.muted}>
          桌面通知你一聲
        </text>
      )}
      {tick === 4 && (
        <text x={314} y={330} fontSize={17} fontWeight={700} fill={C.acid}>
          睡著跳過 → 醒來補跑
        </text>
      )}
    </svg>
  );
}

/* ── 02 GitHub Actions ───────────────────────────────────
 * tick 0 還沒有新 issue → 1 有人開 issue、加 label → 2 workflow 被觸發
 *      → 3 Claude 在 runner 裡開發 → 4 推到 claude/ 分支 → PR。
 * 座標（viewBox 540 × 372，1:1 呈現）：
 *   左側四格 x 8 w 360：issue y 8 h 76、workflow y 112、runner y 204、PR y 296（h 64）；
 *   格間 28，箭頭 x 188 長 22。
 *   label 膠囊 (262, 22) 88 × 30，title「#27 新增匯出 CSV」右緣約 198。
 *   右欄 x 392：「也能接的事件」y 30–152；你的電腦（關著）y 262–360。 */

const GH_ALSO: readonly string[] = ['@claude 留言', 'Pull request', 'schedule 排程', '任何 GitHub 事件'];

function ActionsScene({ tick }: { tick: number }) {
  const hasIssue = tick >= 1;

  const steps: readonly { y: number; h: number; on: boolean }[] = [
    { y: 8, h: 76, on: tick === 1 },
    { y: 112, h: 64, on: tick === 2 },
    { y: 204, h: 64, on: tick === 3 },
    { y: 296, h: 64, on: tick === 4 },
  ];

  return (
    <svg width={540} height={372} viewBox="0 0 540 372" role="img" className="shrink-0">
      <title>GitHub Actions：有人開了 issue 或加上 label，workflow 被觸發，Claude 在 GitHub 的 runner 裡開發，推到 claude/ 分支開 PR</title>
      <ArrowMarkers prefix="mt-gh" tones={['muted', 'acid']} />

      {/* 四格之間的箭頭（先畫） */}
      <Arrow d="M 188 86 L 188 108" on={tick === 2} prefix="mt-gh" />
      <Arrow d="M 188 178 L 188 200" on={tick === 3} prefix="mt-gh" />
      <Arrow d="M 188 270 L 188 292" on={tick === 4} prefix="mt-gh" />

      {/* 01 issue */}
      {hasIssue ? (
        <rect x={8} y={8} width={360} height={76} rx={16} {...nodeStyle(steps[0].on)} className={SVG_TR} />
      ) : (
        <rect
          x={8}
          y={8}
          width={360}
          height={76}
          rx={16}
          fill="none"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="7 6"
        />
      )}
      {hasIssue ? (
        <>
          <text
            x={28}
            y={40}
            fontSize={20}
            fontWeight={700}
            fill={steps[0].on ? C.acid : C.paper}
            className={SVG_TR}
          >
            #27 新增匯出 CSV
          </text>
          <text x={28} y={70} fontSize={17} fill={C.muted}>
            有人開了 issue，加上 label
          </text>
          <rect
            x={262}
            y={22}
            width={88}
            height={30}
            rx={15}
            fill={C.panel}
            stroke={steps[0].on ? C.acid : C.line}
            strokeWidth={steps[0].on ? 3 : 2}
            className={SVG_TR}
          />
          <text
            x={306}
            y={43}
            textAnchor="middle"
            fontSize={17}
            fontWeight={600}
            fill={steps[0].on ? C.acid : C.paper}
            className={`font-mono ${SVG_TR}`}
          >
            claude
          </text>
        </>
      ) : (
        <>
          <text x={28} y={40} fontSize={20} fontWeight={600} fill={C.muted}>
            Issues
          </text>
          <text x={28} y={70} fontSize={17} fill={C.faint}>
            還沒有新的 issue
          </text>
        </>
      )}

      {/* 02 workflow */}
      <rect x={8} y={112} width={360} height={64} rx={16} {...nodeStyle(steps[1].on)} className={SVG_TR} />
      <text
        x={28}
        y={140}
        fontSize={20}
        fontWeight={700}
        fill={steps[1].on ? C.acid : C.paper}
        className={SVG_TR}
      >
        workflow 被觸發
      </text>
      <text x={28} y={165} fontSize={16} fill={C.muted} className="font-mono">
        on: issues · opened / labeled
      </text>

      {/* 03 runner */}
      <rect x={8} y={204} width={360} height={64} rx={16} {...nodeStyle(steps[2].on)} className={SVG_TR} />
      <text
        x={28}
        y={232}
        fontSize={20}
        fontWeight={700}
        fill={steps[2].on ? C.acid : C.paper}
        className={SVG_TR}
      >
        Claude 在 CI 裡開發
      </text>
      <text x={28} y={257} fontSize={16} fill={C.muted} className="font-mono">
        runner · claude-code-action@v1
      </text>

      {/* 04 PR */}
      <rect x={8} y={296} width={360} height={64} rx={16} {...nodeStyle(steps[3].on)} className={SVG_TR} />
      <text
        x={28}
        y={324}
        fontSize={20}
        fontWeight={700}
        fill={steps[3].on ? C.acid : C.paper}
        className={SVG_TR}
      >
        推到 claude/ 分支 → PR
      </text>
      <text x={28} y={349} fontSize={16} fill={C.muted}>
        預設附上開 PR 的連結，由你按下
      </text>

      {/* 右欄：也能接的事件 */}
      <text x={392} y={30} fontSize={16} fill={C.faint}>
        也能接的事件
      </text>
      {GH_ALSO.map((item, index) => (
        <text key={item} x={392} y={62 + index * 30} fontSize={17} fill={C.paper}>
          {item}
        </text>
      ))}

      {/* 你的電腦：關著 */}
      <rect x={420} y={262} width={64} height={40} rx={5} fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
      <path d="M 410 308 L 494 308" stroke={C.muted} strokeWidth={3} strokeLinecap="round" />
      <text x={452} y={288} textAnchor="middle" fontSize={16} fill={C.muted}>
        z z
      </text>
      <text x={452} y={336} textAnchor="middle" fontSize={17} fontWeight={600} fill={C.paper}>
        你的電腦
      </text>
      <text x={452} y={360} textAnchor="middle" fontSize={16} fill={C.muted}>
        關著也照跑
      </text>
    </svg>
  );
}

/* ── 03 Channels ─────────────────────────────────────────
 * tick 0 你在 session 裡做別的事 → 1 CI 的 build 失敗 → 2 POST 給本機 channel、推進 session
 *      → 3 Claude 直接開始修 → 4 session 關掉，事件進不來。
 * 座標（viewBox 540 × 372，1:1 呈現）：
 *   CI (8, 8) 220 × 100；channel (304, 8) 228 × 100；中間箭頭 y 58、「POST」在上方 y 48
 *   往下的箭頭 x 418 y 112 → 152，旁邊「推進 session」x 432 y 138
 *   session 外框 (8, 158) 524 × 206：標題 y 190、分隔線 y 204、內容四行 y 236／264／300／332 */

function ChannelScene({ tick }: { tick: number }) {
  const failed = tick >= 1;
  const closed = tick === 4;
  const ciOn = tick === 1;
  const pushOn = tick === 2;
  const fixOn = tick === 3;

  return (
    <svg width={540} height={372} viewBox="0 0 540 372" role="img" className="shrink-0">
      <title>Channels：CI 的事件經過本機的 channel，直接推進你正在跑的 Claude Code session；session 關掉就收不到</title>
      <ArrowMarkers prefix="mt-ch" tones={['muted', 'acid']} />

      {/* CI */}
      <rect x={8} y={8} width={220} height={100} rx={16} {...nodeStyle(ciOn)} className={SVG_TR} />
      <text x={28} y={40} fontSize={18} fontWeight={700} fill={C.paper}>
        CI · GitHub Actions
      </text>
      <text
        x={28}
        y={72}
        fontSize={18}
        fontWeight={failed ? 600 : 400}
        fill={ciOn ? C.acid : failed ? C.paper : C.muted}
        className={SVG_TR}
      >
        {failed ? 'main 的 build 失敗' : 'main 跑測試中…'}
      </text>
      {failed && (
        <text x={28} y={96} fontSize={16} fill={C.muted} className="font-mono">
          auth.test.ts
        </text>
      )}

      {/* CI → channel */}
      <text x={265} y={46} textAnchor="middle" fontSize={16} fill={pushOn ? C.acid : C.muted} className={`font-mono ${SVG_TR}`}>
        POST
      </text>
      <Arrow d="M 232 58 L 298 58" on={pushOn} prefix="mt-ch" dashed={closed} />

      {/* channel */}
      {closed ? (
        <rect
          x={304}
          y={8}
          width={228}
          height={100}
          rx={16}
          fill="none"
          stroke={C.muted}
          strokeWidth={2}
          strokeDasharray="7 6"
        />
      ) : (
        <rect x={304} y={8} width={228} height={100} rx={16} {...nodeStyle(pushOn)} className={SVG_TR} />
      )}
      <text
        x={322}
        y={40}
        fontSize={20}
        fontWeight={700}
        fill={closed ? C.muted : pushOn ? C.acid : C.paper}
        className={SVG_TR}
      >
        {closed ? 'channel（停了）' : 'channel'}
      </text>
      <text x={322} y={70} fontSize={17} fill={C.muted}>
        MCP server · 本機
      </text>
      <text x={322} y={96} fontSize={16} fill={C.faint} className="font-mono">
        127.0.0.1:8788
      </text>

      {/* channel → session */}
      <Arrow d="M 418 112 L 418 152" on={pushOn} prefix="mt-ch" dashed={closed} />
      <text x={432} y={138} fontSize={17} fill={pushOn ? C.acid : C.muted} className={SVG_TR}>
        推進 session
      </text>

      {/* 你開著的 session */}
      <rect
        x={8}
        y={158}
        width={524}
        height={206}
        rx={18}
        fill="none"
        stroke={closed ? C.muted : fixOn ? C.acid : C.paper}
        strokeWidth={fixOn ? 3.5 : 2}
        strokeDasharray={closed ? '8 7' : undefined}
        className={SVG_TR}
      />
      <text x={28} y={190} fontSize={18} fontWeight={700} fill={closed ? C.muted : C.paper}>
        你開著的 Claude Code session
      </text>
      <text
        x={512}
        y={190}
        textAnchor="end"
        fontSize={17}
        fontWeight={closed ? 700 : 400}
        fill={closed ? C.acid : C.muted}
        className={SVG_TR}
      >
        關掉就收不到
      </text>
      <line x1={8} y1={204} x2={532} y2={204} stroke={C.line} strokeWidth={1.5} />

      {closed ? (
        <>
          <text x={270} y={268} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.muted}>
            session 關掉了
          </text>
          <text x={270} y={304} textAnchor="middle" fontSize={18} fill={C.muted}>
            channel 跟著停，CI 的事件送不進來
          </text>
        </>
      ) : (
        <>
          <text x={28} y={236} fontSize={17} fill={C.paper} className="font-mono">
            {'> 把設定頁的表單拆成元件'}
          </text>
          <text x={28} y={264} fontSize={17} fill={C.muted} className="font-mono">
            {'  ✓ 拆好 3 個元件，繼續中…'}
          </text>
          {tick >= 2 && (
            <text
              x={28}
              y={300}
              fontSize={17}
              fontWeight={pushOn ? 700 : 400}
              fill={pushOn ? C.acid : C.paper}
              className={`font-mono ${SVG_TR}`}
            >
              ← webhook: build failed on main
            </text>
          )}
          {tick >= 3 && (
            <text
              x={28}
              y={332}
              fontSize={17}
              fontWeight={700}
              fill={C.acid}
              className="font-mono"
            >
              ● Claude 讀 CI log，開始修 auth.test.ts
            </text>
          )}
        </>
      )}
    </svg>
  );
}

/* ── 三個方法的資料 ──────────────────────────────────────
 * 事實欄每列：dt 100 ＋ gap 16 ＋ dd 422（21px 約 20 字一行）、上下 py 10。
 *   Desktop   2 行 ＋ (code ＋ 1 行) ＋ 3 行 ＋ (1 行 ＋ 19px 1 行)
 *             ≈ 79 ＋ 87 ＋ 108 ＋ 82 ＝ 356
 *   Actions   2 行 ＋ (code ＋ YAML 3 行) ＋ 2 行 ＋ (1 行 ＋ 19px 1 行)
 *             ≈ 79 ＋ 148 ＋ 79 ＋ 82 ＝ 388
 *   Channels  2 行 ＋ (code ＋ 2 行) ＋ 3 行 ＋ (1 行 ＋ 19px 1 行)
 *             ≈ 79 ＋ 116 ＋ 108 ＋ 82 ＝ 385
 * 全部 ≤ 420。Codex 對照卡內高 170 − 32 ＝ 138，文字欄寬約 792（20px 約 39 字一行），
 * 每張最多 4 行 × 30。 */

const DOCS_DESKTOP = 'https://code.claude.com/docs/en/desktop-scheduled-tasks';
const DOCS_ACTIONS = 'https://code.claude.com/docs/en/github-actions';
const DOCS_CHANNELS = 'https://code.claude.com/docs/en/channels';
const DOCS_CODEX_TASKS = 'https://learn.chatgpt.com/docs/automations';
const DOCS_CODEX_ACTION = 'https://learn.chatgpt.com/docs/github-action';

const YES = 'font-semibold text-teal';
const NOTE = 'mt-1.5 block text-[19px] leading-snug text-muted';

interface Method {
  id: MethodId;
  name: string;
  sub: string;
  chips: readonly string[];
  where: string;
  docs: string;
  facts: readonly { label: string; body: ReactNode }[];
  status: readonly string[];
  ms: number;
  codex: { verdict: string; docs: string; lines: readonly ReactNode[] };
}

const METHODS: readonly Method[] = [
  {
    id: 'desktop',
    name: 'Desktop 排程任務',
    sub: '時間到，Desktop app 自己開一個新的 session',
    chips: ['本機', '最短 1 分鐘', '免開 session'],
    where: '本機 · Desktop app',
    docs: DOCS_DESKTOP,
    facts: [
      {
        label: '在哪裡跑',
        body: '你的電腦上，每次開一個新的 session；Desktop app 要開著、電腦不能睡著。',
      },
      {
        label: '怎麼建立',
        body: (
          <>
            <code className={CODE}>Routines → New routine → Local</code>
            <span className="mt-2 block">或用講的：「每天 9 點幫我 review」</span>
          </>
        ),
      },
      {
        label: '間隔與限制',
        body: '選單有每小時／每天／平日／每週，更密的用講的，最短 1 分鐘。睡著的那次跳過，醒來只補跑最近一次。',
      },
      {
        label: '事件觸發',
        body: (
          <>
            <span className="font-semibold text-muted">✕ 不能，只依時間觸發</span>
            <span className={NOTE}>要接 GitHub 事件，改用雲端 Routine。</span>
          </>
        ),
      },
    ],
    status: [
      '08:59 電腦開著、app 在背景，沒開任何 session',
      '時間到（會晚幾分鐘）→ Desktop 開新的 session',
      'Claude 在專案資料夾裡跑：讀檔、改程式',
      '跑完 → 桌面通知，側欄 Scheduled 多一筆',
      '電腦睡著的那次會跳過，醒來只補跑最近一次',
    ],
    ms: 1300,
    codex: {
      verdict: '有：桌面排程任務',
      docs: DOCS_CODEX_TASKS,
      lines: [
        'ChatGPT 桌面 app 的排程任務可以在專案資料夾或獨立 worktree 裡跑。',
        '一樣要開著電腦和 app；在對話裡排程可用分鐘級間隔，進階週期寫 RRULE。',
        'Codex CLI 沒有排程介面，要從桌面 app 或網頁建立。',
      ],
    },
  },
  {
    id: 'actions',
    name: 'GitHub Actions',
    sub: '在 CI 裡跑 Claude Code：issue 一開、加上 label 就開工',
    chips: ['GitHub runner', '接 issue 事件', '電腦關著也跑'],
    where: '雲端 · GitHub runner',
    docs: DOCS_ACTIONS,
    facts: [
      {
        label: '在哪裡跑',
        body: 'GitHub 的 runner（CI 的機器）上；你的電腦關著也會跑。',
      },
      {
        label: '怎麼建立',
        body: (
          <>
            <code className={CODE}>/install-github-app</code>
            <span className="relative mt-2 block rounded-md bg-ink-soft px-3 py-1.5 font-mono text-[17px] leading-[1.5] whitespace-pre text-paper">
              {'on:\n  issues:\n    types: [opened, labeled]'}
              <span className="absolute top-1.5 right-3 font-sans text-[17px] text-faint">
                示意 · 節錄
              </span>
            </span>
          </>
        ),
      },
      {
        label: '間隔與限制',
        body: '排程最短 5 分鐘（GitHub 的限制）；吃 Actions 分鐘數與 API token。',
      },
      {
        label: '事件觸發',
        body: (
          <>
            <span className={YES}>✓ 可以：issue 一開、加上 label 就觸發</span>
            <span className={NOTE}>預設推到 claude/ 分支，附上開 PR 的連結。</span>
          </>
        ),
      },
    ],
    status: [
      '你的電腦關著；repo 裡放好了 workflow',
      '有人開了 issue #27，加上 label「claude」',
      'issues 事件 → workflow 被觸發',
      'Claude 在 GitHub 的 runner 裡讀 issue、改程式',
      '推到 claude/ 分支，附上開 PR 的連結',
    ],
    ms: 1300,
    codex: {
      verdict: '有：Codex GitHub Action',
      docs: DOCS_CODEX_ACTION,
      lines: [
        <>
          <code className={CODE}>openai/codex-action@v1</code> 在 workflow 裡跑 codex exec。
        </>,
        '官方範例接 pull_request；換成 on: issues，一樣能接 issue 事件。',
        '差別：留言、開 PR 要自己再加一步；@codex 標記只用在 PR。',
      ],
    },
  },
  {
    id: 'channels',
    name: 'Channels',
    sub: 'CI 的事件直接推進你正在跑的 session',
    chips: ['本機 session', '事件即時推入', '研究預覽'],
    where: '本機 · 研究預覽',
    docs: DOCS_CHANNELS,
    facts: [
      {
        label: '在哪裡跑',
        body: '你電腦上、開著的 Claude Code session；channel 本身是一個 MCP server。',
      },
      {
        label: '怎麼建立',
        body: (
          <>
            <code className={CODE}>claude --channels plugin:…</code>
            <span className="mt-2 block">
              內建 Telegram、Discord、iMessage；接 CI 要照文件範例自己寫一個。
            </span>
          </>
        ),
      },
      {
        label: '間隔與限制',
        body: '沒有間隔，事件一到就送進去。要 claude.ai 登入或 Console API key；Team／Enterprise 要管理員開啟。',
      },
      {
        label: '事件觸發',
        body: (
          <>
            <span className={YES}>✓ 可以，這就是它的用途</span>
            <span className={NOTE}>session 沒開著，事件就收不到。</span>
          </>
        ),
      },
    ],
    status: [
      '你開著 session 在做別的事；channel 在背景等著',
      'CI 跑完：main 的 build 失敗了',
      'CI 把結果 POST 給本機的 channel → 推進 session',
      'session 裡多了一則事件，Claude 直接開始修',
      'session 關掉的話，channel 跟著停，事件進不來',
    ],
    ms: 1300,
    codex: {
      verdict: '沒有對應',
      docs: DOCS_CODEX_TASKS,
      lines: [
        '官方沒有這個功能：Codex CLI 不會把 MCP 通知送進正在跑的 session。',
        'GitHub 上有人提了需求（openai/codex #15299），目前還開著。',
        '網頁版排程任務可由 GitHub PR 等事件觸發，但跑在雲端，進不了本機 session。',
      ],
    },
  },
];

function MethodCard({ index, item, mode }: { index: number; item: Method; mode: PlayMode }) {
  const player = usePlayer(item.status.length - 1, item.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} text-acid`}>方法 {pad2(index + 1)}</span>
        <span className="text-[30px] leading-none font-semibold text-paper">{item.name}</span>
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
            {item.id === 'desktop' && <DesktopScene tick={player.tick} />}
            {item.id === 'actions' && <ActionsScene tick={player.tick} />}
            {item.id === 'channels' && <ChannelScene tick={player.tick} />}
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
          <a href={item.codex.docs} target="_blank" rel="noreferrer" className={`${LINK} mt-auto`}>
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

export function MoreTriggersDemo() {
  const [picked, setPicked] = useState<MethodId>('desktop');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    METHODS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：接續第 34 頁 ＋ 三個方法 ─────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <BridgeCard picked={picked} />
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {METHODS.map((item, i) => (
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
      </div>

      {/* ── 右：概念圖 ───────────────────────────────────── */}
      <MethodCard
        key={picked}
        index={index}
        item={METHODS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
