import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第五章 Loop Engineering：風險
 *
 *   第 39 頁  LoopRiskDemo   Loop Engineering 的風險
 *
 * callout 原文（2026-10-06，Notion 連線故障，講師直接貼上）：
 *   「Loop Engineer 風險
 *    1. 文件有誤，AI 照著做也做錯
 *    2. 產能過高，人類難以完整閱讀完所有產出
 *    3. 當出錯時，人類難以及時發現問題，也難以找出問題」
 *
 * 版型跟同一章的其他頁一致：「左邊是選項，右邊是情境」。
 *   左  三個風險（MenuItem：標題＋一句說明），底下一張小卡點出
 *       「上一頁（第 38 頁 邊界）是 AI 在回圈裡出的狀況；這一頁的風險都在人類這一端」。
 *   右  情境卡，結構同第 22 頁的 DrawbackCard：
 *       標題列放 callout 原句＋播放鍵 → 可播放的情境 → 最下面一條「人類這一端」。
 *     01 文件有誤   延續第 32 頁「文檔 → Loop」：Issue 卡 →（讀取）→ Loop →（交付）→ 成品。
 *                   需求寫錯一行，AI 照著寫、測試也照著寫，Loop 全部通過；
 *                   人一打開成品才發現不是要的，回頭一看錯在文件。
 *                   Loop 那一格是第 31 頁四格回圈的縮小版（寫程式 → 跑測試 → 通過了嗎？ → 修正）。
 *     02 產能過高   一天一疊 PR 往上堆，人一天讀得完的量是一條固定的虛線；
 *                   線以上的就是沒讀到的，上方的計數器一直往上跳。
 *     03 難以發現   9 輪 × 4 位 SubAgent 的紀錄格，每一格都回報完成。
 *                   第 9 輪之後才發現結帳金額不對，從第 9 輪往回一格一格翻，
 *                   翻到第 3 輪才找到。
 *
 * 播放規則（同第 22、27 頁的 usePlayer）：一進頁面停在「播完」的畫面，
 * 講師可以先講再按重播；在左欄點了別的風險，右邊從頭自動播一次。
 *
 * 為了讓畫面成立而補的示意（callout 沒有寫，可以整段換掉）：
 *   01  Issue #42 會員註冊、四條需求、寫錯的那一條「註冊後直接登入」
 *       （原本要的是「先寄驗證信」）、三條測試、成品的兩個畫面。
 *       「測試也是照同一份文件寫的，所以全部通過」是補的說明，
 *       用來解釋 Loop 為什麼會全部通過。
 *   02  每天交出的 PR 數 4 → 16、人一天讀 4 個，全部是示意數字（畫面上有標）。
 *       「產出一天比一天多」也是示意，代表觸發與回圈越開越多的情況。
 *   03  9 輪、4 位 SubAgent 的分工（購物車／折扣／結帳／測試）、
 *       錯在第 3 輪的折扣、第 9 輪之後才發現的「結帳金額不對」、翻了 26 份紀錄。
 *   最下面那條「人類這一端」的三句話是把 callout 展開的講法，不是原文。
 *   左下「跟上一頁的差別」那張小卡也是補的，依據是第 38 頁講 AI 在回圈裡的狀況。
 *
 * 用色（兩支）：acid＝目前選取／目前這一步／游標；coral＝風險、錯誤、沒讀到的。
 *   其他一律中性。測試通過的 ✓ 也是中性 —— 這一頁的「通過」不代表沒問題，
 *   所以刻意不用 teal。
 * 淡底一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 * 會換行的句子加 break-keep：只在標點與空白斷行，不會斷成「連／結」「登／入了」或剩一個「碼。」。
 *
 * 高度預算（Panel 內可用約 1744 × 768；根容器 h-[720px] max-w-[1740px]，沒有任何容器會捲動）：
 *   寬  左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102）
 *   左  標籤 26 ＋ 16 ＋ 三張選單 flex-1（(540 − 24) ÷ 3 ≈ 172／張）＋ 16 ＋ 小卡 122 ＝ 720
 *   右  卡片 py 24×2 ＋ 邊框 2 → 內高 670
 *       ＝ 標題列 48 ＋ 16 ＋ 情境 500 ＋ 16 ＋ 人類這一端 90
 *   情境 500 各自的分配寫在各情境上面。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

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
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  coral: 'var(--color-coral)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一列（同 demos-tradeoffs.tsx 的 MenuItem，撐滿高度） */
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
      </span>
    </button>
  );
}

/* ── 播放器（同 demos-tradeoffs.tsx 的 usePlayer）──────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的風險時）
 * 情境卡用風險的 id 當 key，換選項就整張重掛，狀態自然歸零。 */

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

/** 數字一格一格往上跳到 target；往下（重播歸零）時直接跳過去 */
function useCountUp(target: number) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (value === target) return;
    const timer = window.setTimeout(
      () => setValue((current) => (current < target ? current + 1 : target)),
      40,
    );
    return () => window.clearTimeout(timer);
  }, [value, target]);

  return value;
}

/* ══════════════════════════════════════════════════════════════
 * 情境 01 · 文件有誤，AI 照著做也做錯
 *
 * tick 0  三張卡都在，還沒開始
 *      1  AI 讀文件（Issue 卡與「讀取」箭頭亮 acid）
 *      2  照著寫程式、也照著寫測試（Loop 的「寫程式」亮）
 *      3  Loop 全部通過（「通過了嗎？」亮，測試一排 ✓）
 *      4  交付成品（成品卡出現兩個畫面，結論「跟文件寫的一樣」）
 *      5  成品是錯的：成品、那一條測試、文件那一行一起變 coral
 *
 * 寬：Issue 380 ＋ 箭頭 52 ＋ Loop 318 ＋ 箭頭 52 ＋ 成品 300 ＝ 1102
 * 高：卡片列 440 ＋ 12 ＋ 步驟條 48 ＝ 500
 *   卡片 border 2×2 ＋ p-5 → 內高 396、內寬 336／274／256
 *   Issue  標題 64 ＋ 16 ＋ 四條 52×4＋8×3＝232 ＋ 16 ＋ 註記 68
 *   Loop   標籤 26 ＋ 12 ＋ 回圈 196 ＋ 12 ＋ 測試 150
 *   成品   標籤 26 ＋ 12 ＋ 畫面 84 ＋ 12 ＋ 箭頭 20 ＋ 12 ＋ 畫面 84 ＋ 12 ＋ 結論 134
 * ══════════════════════════════════════════════════════════════ */

const DOC_LAST = 5;

const DOC_LINES: readonly { text: string; wrong?: boolean }[] = [
  { text: '欄位：Email、密碼、暱稱' },
  { text: '密碼至少 8 碼' },
  { text: '註冊後直接登入', wrong: true },
  { text: '登入後導向會員首頁' },
];

const DOC_TESTS: readonly { text: string; fromWrong?: boolean }[] = [
  { text: '註冊後是登入狀態', fromWrong: true },
  { text: '密碼少於 8 碼會擋下' },
  { text: 'lint 0 個錯誤' },
];

const DOC_STEPS = [
  'AI 讀文件',
  '照著寫程式與測試',
  'Loop 全部通過',
  '交付成品',
  '成品是錯的',
] as const;

/* Loop 縮小版：圓角矩形的跑道，四個角各一格，四邊中點各一個順時針箭頭。
 * 座標（viewBox 274 × 196，1:1 呈現）：跑道 (60, 30) 154 × 136，
 * 角上的膠囊 104 × 36，中間留給「Loop」與狀態。 */
const GLYPH_PILLS: readonly { id: 'code' | 'test' | 'check' | 'fix'; x: number; y: number; text: string }[] = [
  { id: 'code', x: 60, y: 30, text: '寫程式' },
  { id: 'test', x: 214, y: 30, text: '跑測試' },
  { id: 'check', x: 214, y: 166, text: '通過了嗎？' },
  { id: 'fix', x: 60, y: 166, text: '修正' },
];

const GLYPH_HEADS: readonly { x: number; y: number; rotate: number }[] = [
  { x: 137, y: 30, rotate: 0 },
  { x: 214, y: 98, rotate: 90 },
  { x: 137, y: 166, rotate: 180 },
  { x: 60, y: 98, rotate: 270 },
];

function LoopGlyph({ tick }: { tick: number }) {
  const running = tick === 2 || tick === 3;
  const litPill = tick === 2 ? 'code' : tick === 3 ? 'check' : null;
  const status = tick < 2 ? '還沒開始' : tick === 2 ? '照文件寫' : '✓ 全部通過';
  const track = running ? C.acid : C.muted;

  return (
    <svg width={274} height={196} viewBox="0 0 274 196" role="img" className="shrink-0">
      <title>Loop：寫程式、跑測試、檢查是否通過、修正，一圈一圈繞</title>
      <rect
        x={60}
        y={30}
        width={154}
        height={136}
        rx={22}
        fill="none"
        stroke={track}
        strokeWidth={running ? 3.5 : 2}
        className={SVG_TR}
      />
      {GLYPH_HEADS.map((head) => (
        <path
          key={head.rotate}
          d="M -9 -8 L 9 0 L -9 8 Z"
          transform={`translate(${head.x} ${head.y}) rotate(${head.rotate})`}
          fill={track}
          className={SVG_TR}
        />
      ))}

      <text x={137} y={94} textAnchor="middle" fontSize={22} fontWeight={700} fill={running ? C.acid : C.paper} className={SVG_TR}>
        Loop
      </text>
      <text
        x={137}
        y={124}
        textAnchor="middle"
        fontSize={17}
        fontWeight={tick >= 3 ? 600 : 400}
        fill={tick >= 3 ? C.paper : C.muted}
      >
        {status}
      </text>

      {GLYPH_PILLS.map((pill) => {
        const on = pill.id === litPill;
        return (
          <g key={pill.id}>
            {/* 先墊一塊不透明的 panel，蓋掉跑道的線 */}
            <rect x={pill.x - 52} y={pill.y - 18} width={104} height={36} rx={18} fill={C.panel} />
            <rect
              x={pill.x - 52}
              y={pill.y - 18}
              width={104}
              height={36}
              rx={18}
              fill={on ? C.acid : C.inkSoft}
              fillOpacity={on ? 0.14 : 1}
              stroke={on ? C.acid : C.line}
              strokeWidth={on ? 3 : 2}
              className={SVG_TR}
            />
            <text
              x={pill.x}
              y={pill.y + 6}
              textAnchor="middle"
              fontSize={17}
              fontWeight={on ? 600 : 400}
              fill={on ? C.acid : C.paper}
              className={SVG_TR}
            >
              {pill.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** 卡片之間的箭頭：上面一個字，下面一支 → */
function Connector({ label, on }: { label: string; on: boolean }) {
  const color = on ? C.acid : C.muted;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <span className={`text-[17px] ${on ? 'font-semibold text-acid' : 'text-muted'}`}>
        {label}
      </span>
      <svg width={52} height={24} viewBox="0 0 52 24" aria-hidden="true">
        <path d="M 4 12 L 40 12" stroke={color} strokeWidth={on ? 4 : 2.5} className={SVG_TR} />
        <path d="M 37 4 L 50 12 L 37 20 Z" fill={color} className={SVG_TR} />
      </svg>
    </div>
  );
}

function DocCard({ tick }: { tick: number }) {
  const reading = tick === 1;
  const done = tick >= 2;
  const revealed = tick >= DOC_LAST;

  return (
    <div
      className={`flex h-full min-w-0 flex-col gap-4 rounded-2xl border-2 bg-panel p-5 transition-colors duration-300 ${
        reading ? 'border-acid' : 'border-line'
      }`}
    >
      <div className="flex h-[64px] shrink-0 flex-col justify-between">
        <span className={LABEL_FAINT}>Notion／Issue</span>
        <span className="text-[24px] leading-none font-semibold text-paper">#42 會員註冊</span>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        {DOC_LINES.map((line) => {
          const bad = revealed && line.wrong;
          return (
            <div
              key={line.text}
              className={`flex h-[52px] items-center gap-3 rounded-xl border border-l-[6px] px-3 text-[20px] text-paper transition-colors duration-300 ${
                bad ? 'border-coral border-l-coral bg-coral/14' : 'border-line-soft border-l-line bg-panel-lift'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 text-[17px] leading-none ${
                  done ? 'border-paper bg-paper text-on-accent' : 'border-line'
                }`}
              >
                {done ? '✓' : ''}
              </span>
              <span className={`min-w-0 truncate ${bad ? 'font-semibold' : ''}`}>{line.text}</span>
              {bad && (
                <span className="slide-enter ml-auto shrink-0 rounded-md bg-coral px-2 py-0.5 text-[17px] font-semibold text-on-accent">
                  寫錯了
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 items-center">
        {revealed && (
          <p className="slide-enter text-[19px] leading-snug break-keep text-paper">
            <span className="font-semibold text-coral">原本要的：</span>
            註冊後先寄驗證信，點了連結才能登入
          </p>
        )}
      </div>
    </div>
  );
}

function DocLoopCard({ tick }: { tick: number }) {
  const running = tick === 2 || tick === 3;
  const revealed = tick >= DOC_LAST;

  return (
    <div
      className={`flex h-full min-w-0 flex-col gap-3 rounded-2xl border-2 bg-panel p-5 transition-colors duration-300 ${
        running ? 'border-acid' : 'border-line'
      }`}
    >
      <div className="flex h-[26px] shrink-0 items-center justify-between">
        <span className={LABEL_FAINT}>Loop</span>
        <span className="text-[18px] text-muted">AI 照著做</span>
      </div>

      <LoopGlyph tick={tick} />

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 rounded-xl border border-line bg-ink-soft px-4 py-3">
        <span className={LABEL_FAINT}>測試也照文件寫</span>
        {tick < 2 ? (
          <p className="font-mono text-[18px] leading-[26px] text-faint">（還沒寫）</p>
        ) : (
          DOC_TESTS.map((test) => {
            const bad = revealed && test.fromWrong;
            return (
              <p
                key={test.text}
                className={`slide-enter truncate border-l-[6px] pl-2 font-mono text-[17px] leading-[26px] ${
                  bad
                    ? 'border-l-coral font-semibold text-coral'
                    : `border-l-transparent ${tick >= 3 ? 'text-paper' : 'text-muted'}`
                }`}
              >
                {tick >= 3 ? '✓' : '○'} {test.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}

function ResultScreen({ no, text }: { no: string; text: string }) {
  return (
    <div className="slide-enter flex h-[84px] shrink-0 items-center gap-3 rounded-xl border border-line bg-ink-soft px-4">
      <span className="shrink-0 font-mono text-[17px] text-faint">{no}</span>
      <span className="text-[19px] leading-snug break-keep text-paper">{text}</span>
    </div>
  );
}

function DocResultCard({ tick }: { tick: number }) {
  const delivered = tick >= 4;
  const revealed = tick >= DOC_LAST;
  const border = revealed ? 'border-coral' : tick === 4 ? 'border-acid' : 'border-line';

  return (
    <div
      className={`flex h-full min-w-0 flex-col gap-3 rounded-2xl border-2 bg-panel p-5 transition-colors duration-300 ${border}`}
    >
      <div className="flex h-[26px] shrink-0 items-center justify-between">
        <span className={LABEL_FAINT}>成品</span>
        <span className="text-[18px] text-muted">你打開來看</span>
      </div>

      {delivered ? (
        <>
          <ResultScreen no="01" text="填完註冊表單，按下送出" />
          <span className="h-5 shrink-0 text-center text-[18px] leading-5 text-muted">↓</span>
          <ResultScreen no="02" text="直接進到會員首頁，已經登入" />
          <div
            className={`slide-enter flex min-h-0 flex-1 flex-col justify-center gap-1 rounded-xl border border-l-[6px] px-4 ${
              revealed ? 'border-coral border-l-coral bg-coral/14' : 'border-line border-l-paper bg-panel-lift'
            }`}
          >
            {revealed ? (
              <>
                <span className="text-[22px] font-semibold text-coral">✕ 不是要的</span>
                <span className="text-[19px] leading-snug break-keep text-paper">
                  沒驗證 Email，就直接登入了
                </span>
              </>
            ) : (
              <>
                <span className="text-[21px] font-semibold text-paper">✓ 跟文件寫的一樣</span>
                <span className="text-[18px] text-muted">Loop 也全部通過</span>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border-2 border-dashed border-line px-4 text-center text-[19px] text-faint">
          等 Loop 跑完才會交付
        </div>
      )}
    </div>
  );
}

function DocWrongScene({ tick }: { tick: number }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid h-[440px] shrink-0 grid-cols-[380px_52px_minmax(0,1fr)_52px_300px]">
        <DocCard tick={tick} />
        <Connector label="讀取" on={tick === 1} />
        <DocLoopCard tick={tick} />
        <Connector label="交付" on={tick === 4} />
        <DocResultCard tick={tick} />
      </div>

      <div className="grid h-12 shrink-0 grid-cols-5 gap-2">
        {DOC_STEPS.map((label, index) => {
          const no = index + 1;
          const isLast = no === DOC_STEPS.length;
          const style =
            no === tick
              ? isLast
                ? 'border-coral bg-coral/14 font-semibold text-coral'
                : 'border-acid bg-acid/14 font-semibold text-acid'
              : no < tick
                ? 'border-line text-paper'
                : 'border-dashed border-line text-faint';
          return (
            <span
              key={label}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 text-[18px] transition-colors duration-300 ${style}`}
            >
              <span className="font-mono">{no}</span>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 情境 02 · 產能過高，人類難以完整閱讀完所有產出
 *
 * tick ＝ 過了幾天（0–7）。每一天 AI 交出一疊 PR（一格一個），
 * 人一天讀得完的量是一條固定的虛線（4 個），線以上的格子是 coral ＝ 沒讀到。
 * 上方四個計數器：經過幾天、AI 交出的、你讀完的、還沒讀的（數字一格一格往上跳）。
 *
 * 高：計數器 96 ＋ 16 ＋ 長條圖 388 ＝ 500
 * 長條圖座標（viewBox 1102 × 388，1:1 呈現）：
 *   底線 y 341；每格高 15、間距 4（一格佔 19）；最多 16 格 → 頂端 y 40，數字在 y 30
 *   七天的欄 x 40 ＋ 122·i，寬 90；虛線 y 266（第 4 格與第 5 格的縫）
 *   右側 x 896 起：圖例與虛線的說明；日期標籤 y 372
 * ══════════════════════════════════════════════════════════════ */

const VOL_OUT = [4, 6, 8, 10, 12, 14, 16] as const;
const VOL_LAST = VOL_OUT.length;
const VOL_CAP = 4;
const VOL_BASE = 340;
const VOL_PITCH = 19;
const VOL_BH = 15;
const VOL_SLOT = 122;
const VOL_X0 = 40;
const VOL_BW = 90;
const VOL_LINE_Y = VOL_BASE - VOL_CAP * VOL_PITCH + 2;
const VOL_RIGHT = VOL_X0 + (VOL_OUT.length - 1) * VOL_SLOT + VOL_BW + 16;

function StatBox({
  label,
  value,
  unit,
  risk = false,
}: {
  label: string;
  value: number;
  unit: string;
  risk?: boolean;
}) {
  const shown = useCountUp(value);
  return (
    <div
      className={`flex flex-col justify-center gap-1 rounded-2xl border border-l-[6px] px-5 ${
        risk ? 'border-coral/55 border-l-coral bg-coral/14' : 'border-line border-l-line bg-panel-lift'
      }`}
    >
      <span className={`${LABEL_TYPE} ${risk ? 'text-coral' : 'text-faint'}`}>{label}</span>
      <span className="flex items-baseline gap-2">
        <span
          className={`font-display text-[44px] leading-none font-semibold tabular-nums ${
            risk ? 'text-coral' : 'text-paper'
          }`}
        >
          {shown}
        </span>
        <span className="text-[20px] text-muted">{unit}</span>
      </span>
    </div>
  );
}

function VolumeScene({ tick }: { tick: number }) {
  const produced = VOL_OUT.slice(0, tick).reduce((sum, count) => sum + count, 0);
  const read = VOL_CAP * tick;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid h-[96px] shrink-0 grid-cols-4 gap-3">
        <StatBox label="經過" value={tick} unit="天" />
        <StatBox label="AI 交出的 PR" value={produced} unit="個" />
        <StatBox label="你讀完的" value={read} unit="個" />
        <StatBox label="還沒讀的" value={produced - read} unit="個" risk />
      </div>

      <svg viewBox="0 0 1102 388" className="h-[388px] w-full shrink-0" role="img">
        <title>
          AI 每天交出的 PR 一天比一天多，人一天讀得完的量是一條固定的線，線以上的都沒有讀到
        </title>

        <line
          x1={VOL_X0 - 16}
          y1={VOL_BASE + 1}
          x2={VOL_RIGHT}
          y2={VOL_BASE + 1}
          stroke={C.line}
          strokeWidth={2}
        />

        {tick === 0 && (
          <text x={450} y={180} textAnchor="middle" fontSize={20} fill={C.muted}>
            按「播放」，看 AI 一天一天交出 PR
          </text>
        )}

        {/* 每天一疊 */}
        {VOL_OUT.slice(0, tick).map((count, day) => {
          const x = VOL_X0 + day * VOL_SLOT;
          const latest = day === tick - 1;
          return (
            <g key={day} className="slide-enter">
              {Array.from({ length: count }, (_, k) => {
                const unread = k >= VOL_CAP;
                return (
                  <rect
                    key={k}
                    x={x}
                    y={VOL_BASE - (k + 1) * VOL_PITCH + 4}
                    width={VOL_BW}
                    height={VOL_BH}
                    rx={4}
                    fill={unread ? C.coral : C.inkSoft}
                    fillOpacity={unread ? 0.22 : 1}
                    stroke={unread ? C.coral : C.muted}
                    strokeWidth={unread ? 2 : 1.5}
                  />
                );
              })}
              <text
                x={x + VOL_BW / 2}
                y={VOL_BASE - count * VOL_PITCH - 6}
                textAnchor="middle"
                fontSize={20}
                fontWeight={600}
                fill={latest ? C.acid : C.paper}
              >
                {count}
              </text>
            </g>
          );
        })}

        {/* 人一天讀得完的量：固定的線，畫在方塊上面 */}
        <line
          x1={VOL_X0 - 16}
          y1={VOL_LINE_Y}
          x2={VOL_RIGHT}
          y2={VOL_LINE_Y}
          stroke={C.paper}
          strokeWidth={3}
          strokeDasharray="10 7"
        />
        <text x={896} y={VOL_LINE_Y - 6} fontSize={20} fontWeight={600} fill={C.paper}>
          你一天讀得完的量
        </text>
        <text x={896} y={VOL_LINE_Y + 22} fontSize={18} fill={C.muted}>
          固定 {VOL_CAP} 個，不會變多
        </text>

        {/* 日期 */}
        {VOL_OUT.map((_, day) => (
          <text
            key={day}
            x={VOL_X0 + day * VOL_SLOT + VOL_BW / 2}
            y={372}
            textAnchor="middle"
            fontSize={18}
            fontWeight={day === tick - 1 ? 600 : 400}
            fill={day === tick - 1 ? C.acid : day < tick ? C.muted : C.faint}
          >
            第 {day + 1} 天
          </text>
        ))}

        {/* 圖例 */}
        <g fontSize={18} fill={C.muted}>
          <rect x={896} y={26} width={30} height={16} rx={4} fill={C.inkSoft} stroke={C.muted} strokeWidth={1.5} />
          <text x={938} y={40}>你讀完的</text>
          <rect x={896} y={60} width={30} height={16} rx={4} fill={C.coral} fillOpacity={0.22} stroke={C.coral} strokeWidth={2} />
          <text x={938} y={74} fill={C.coral} fontWeight={600}>
            沒讀到的
          </text>
          <text x={896} y={110} fontSize={17} fill={C.faint}>
            一格 ＝ 一個 PR
          </text>
        </g>
        <text x={1100} y={372} textAnchor="end" fontSize={16} fill={C.faint}>
          數字為示意
        </text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 情境 03 · 當出錯時，人類難以及時發現問題，也難以找出問題
 *
 * tick 1–9    第 N 輪跑完，4 位 SubAgent 都回報「✓ 完成」
 *             （第 3 輪 SUB 02 其實錯了，但它也回報完成，看起來一模一樣）
 *      10     第 9 輪之後才發現：結帳金額不對
 *      11–16  從第 9 輪往回，一輪一輪打開紀錄（acid 游標）
 *      17     翻到第 3 輪，找到了（coral）＋ 底下的括號「中間隔了 6 輪」
 *
 * 高：狀態列 64 ＋ 16 ＋ 紀錄格 300 ＋ 16 ＋ 底下標記 96 ＝ 492
 *   紀錄格 ＝ 輪次標題 28 ＋ 8 ＋ 四列 60×4 ＋ 8×3
 * 寬：名稱欄 150 ＋ 九輪 minmax(0,1fr)，gap 8 → 每格約 97
 * ══════════════════════════════════════════════════════════════ */

const LATE_ROUNDS = 9;
const LATE_BAD_ROUND = 3;
const LATE_BAD_ROW = 1;
const LATE_FOUND_TICK = LATE_ROUNDS + 1;
const LATE_LAST = LATE_FOUND_TICK + (LATE_ROUNDS - LATE_BAD_ROUND + 1);
const LATE_GAP = LATE_ROUNDS - LATE_BAD_ROUND;

const LATE_SUBS: readonly { no: string; name: string }[] = [
  { no: 'SUB 01', name: '購物車' },
  { no: 'SUB 02', name: '折扣' },
  { no: 'SUB 03', name: '結帳' },
  { no: 'SUB 04', name: '測試' },
];

const LATE_ROUND_LIST = Array.from({ length: LATE_ROUNDS }, (_, i) => i + 1);

const LATE_GRID = 'grid grid-cols-[150px_repeat(9,minmax(0,1fr))] gap-2';

type CellState = 'idle' | 'done' | 'checked' | 'cursor' | 'found';

const CELL_STYLE: Record<CellState, string> = {
  idle: 'border-dashed border-line text-faint',
  done: 'border-line bg-ink-soft text-muted',
  checked: 'border-line-soft bg-panel text-faint',
  cursor: 'border-acid bg-acid/14 font-semibold text-acid',
  found: 'border-coral bg-coral/14 font-semibold text-coral',
};

const CELL_TEXT: Record<CellState, string> = {
  idle: '',
  done: '✓ 完成',
  checked: '看過',
  cursor: '打開中',
  found: '✕ 在這',
};

/** 往回翻到第幾輪（還沒開始翻就是 null） */
function lateScanRound(tick: number) {
  const scanStep = tick - LATE_FOUND_TICK;
  return scanStep > 0 ? LATE_ROUNDS + 1 - scanStep : null;
}

function lateCell(tick: number, round: number, row: number): CellState {
  if (round > Math.min(tick, LATE_ROUNDS)) return 'idle';
  const scanRound = lateScanRound(tick);
  if (scanRound === null) return 'done';
  if (round > scanRound) return 'checked';
  if (round < scanRound) return 'done';
  if (round === LATE_BAD_ROUND) {
    if (row < LATE_BAD_ROW) return 'checked';
    if (row === LATE_BAD_ROW) return 'found';
    return 'done';
  }
  return 'cursor';
}

function LateFindScene({ tick }: { tick: number }) {
  const run = Math.min(tick, LATE_ROUNDS);
  const discovered = tick >= LATE_FOUND_TICK;
  const found = tick >= LATE_LAST;
  const scanRound = lateScanRound(tick);
  const scanning = scanRound !== null && !found;
  const scanned =
    scanRound === null
      ? 0
      : found
        ? LATE_GAP * LATE_SUBS.length + LATE_BAD_ROW + 1
        : (LATE_ROUNDS + 1 - scanRound) * LATE_SUBS.length;

  /* 狀態列：文字、右側數字、框的樣式 */
  let status = '按「播放」，看 Loop 一輪一輪跑下去';
  let side = '';
  let barStyle = 'border-line border-l-line bg-panel';
  let sideStyle = 'text-muted';
  if (found) {
    status = `找到了：第 ${LATE_BAD_ROUND} 輪的 SUB 02（折扣）把折扣算了兩次`;
    side = `翻了 ${scanned} 份才找到`;
    barStyle = 'border-coral/55 border-l-coral bg-coral/14';
    sideStyle = 'font-semibold text-coral';
  } else if (scanning) {
    status = `回頭一條一條找：打開第 ${scanRound} 輪的紀錄`;
    side = `已翻 ${scanned} 份`;
    barStyle = 'border-acid/55 border-l-acid bg-panel';
    sideStyle = 'font-semibold text-acid';
  } else if (discovered) {
    status = `第 ${LATE_ROUNDS} 輪跑完，你才發現：結帳金額不對`;
    side = '要回頭找了';
    barStyle = 'border-coral/55 border-l-coral bg-coral/14';
    sideStyle = 'font-semibold text-coral';
  } else if (run > 0) {
    status = `第 ${run} 輪：${LATE_SUBS.length} 位 SubAgent 都回報完成`;
    side = `紀錄 ${run * LATE_SUBS.length} 份`;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        className={`flex h-[64px] shrink-0 items-center gap-5 rounded-2xl border border-l-[6px] px-6 transition-colors duration-300 ${barStyle}`}
      >
        <span className={`${LABEL_FAINT} shrink-0`}>Loop 紀錄</span>
        <span className="min-w-0 truncate text-[21px] text-paper">{status}</span>
        <span className={`ml-auto shrink-0 text-[19px] ${sideStyle}`}>{side}</span>
      </div>

      {/* 紀錄格 */}
      <div className="flex h-[300px] shrink-0 flex-col gap-2">
        <div className={`${LATE_GRID} h-[28px] shrink-0`}>
          <span />
          {LATE_ROUND_LIST.map((round) => {
            const flagged =
              (discovered && round === LATE_ROUNDS) || (found && round === LATE_BAD_ROUND);
            return (
              <span
                key={round}
                className={`flex items-center justify-center text-[17px] ${
                  flagged ? 'font-semibold text-coral' : round <= run ? 'text-muted' : 'text-faint'
                }`}
              >
                第 {round} 輪
              </span>
            );
          })}
        </div>

        {LATE_SUBS.map((sub, row) => (
          <div key={sub.no} className={`${LATE_GRID} h-[60px] shrink-0`}>
            <span className="flex flex-col justify-center">
              <span className="font-mono text-[17px] leading-tight text-faint">{sub.no}</span>
              <span className="text-[20px] leading-tight font-medium text-paper">{sub.name}</span>
            </span>
            {LATE_ROUND_LIST.map((round) => {
              const state = lateCell(tick, round, row);
              return (
                <span
                  key={round}
                  className={`flex items-center justify-center rounded-xl border-2 text-[18px] transition-colors duration-300 ${CELL_STYLE[state]}`}
                >
                  {CELL_TEXT[state]}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* 底下的標記：發現在哪、錯在哪、中間隔了幾輪 */}
      <div className="flex h-[96px] shrink-0 flex-col gap-2">
        {/* 兩個標記都要寫死 gridRow：只給 gridColumn 的話，後面那個欄號比較小，
            自動排版會把它擠到第二列，溢出這個 36px 的容器 */}
        <div className={`${LATE_GRID} h-[36px] shrink-0`}>
          {discovered && (
            <span
              className="slide-enter flex items-center justify-center text-[18px] font-semibold text-coral"
              style={{ gridRow: '1', gridColumn: `${LATE_ROUNDS + 1}` }}
            >
              ↑ 發現
            </span>
          )}
          {found && (
            <span
              className="slide-enter flex items-center justify-center text-[18px] font-semibold text-coral"
              style={{ gridRow: '1', gridColumn: `${LATE_BAD_ROUND + 1}` }}
            >
              ↑ 混進來
            </span>
          )}
        </div>

        <div className={`${LATE_GRID} h-[52px] shrink-0`}>
          {found ? (
            <div
              className="slide-enter flex flex-col items-center"
              style={{ gridColumn: `${LATE_BAD_ROUND + 1} / ${LATE_ROUNDS + 2}` }}
            >
              <div className="h-3.5 w-full rounded-b-md border-x-2 border-b-2 border-coral" />
              <span className="mt-1 text-[20px] font-semibold whitespace-nowrap text-coral">
                錯誤在第 {LATE_BAD_ROUND} 輪混進來，中間隔了 {LATE_GAP} 輪才發現
              </span>
            </div>
          ) : scanning ? (
            <div
              className="flex items-center"
              style={{ gridColumn: `${(scanRound ?? LATE_ROUNDS) + 1} / ${LATE_ROUNDS + 2}` }}
            >
              <svg width={16} height={20} viewBox="0 0 16 20" aria-hidden="true" className="shrink-0">
                <path d="M 16 0 L 0 10 L 16 20 Z" fill={C.acid} />
              </svg>
              <span className="h-[4px] flex-1 bg-acid" />
            </div>
          ) : run > 0 && !discovered ? (
            <span
              className="flex items-center text-[20px] text-muted"
              style={{ gridColumn: `2 / ${LATE_ROUNDS + 2}` }}
            >
              每一輪都回報完成，看起來都沒問題
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 39 頁 · LoopRiskDemo
 * ══════════════════════════════════════════════════════════════ */

type RiskId = 'doc' | 'volume' | 'late';

interface Risk {
  id: RiskId;
  /** 左欄選單 */
  name: string;
  sub: string;
  /** 右欄標題列：callout 原句 */
  title: string;
  /** 最下面「人類這一端」那一條 */
  note: string;
  last: number;
  ms: number;
}

const RISKS: readonly Risk[] = [
  {
    id: 'doc',
    name: '文件有誤',
    sub: 'AI 照著做，也會跟著做錯',
    title: '文件有誤，AI 照著做也做錯',
    note: 'Loop 只會檢查「有沒有照文件做」。測試也是照同一份文件寫的，所以全部通過，成品卻是錯的。',
    last: DOC_LAST,
    ms: 1300,
  },
  {
    id: 'volume',
    name: '產能過高',
    sub: '產出太多，人類讀不完',
    title: '產能過高，人類難以完整閱讀完所有產出',
    note: '你一天能讀完的量是固定的，AI 的產出卻一天比一天多。讀不完的部分，就是沒有人看過的程式碼。',
    last: VOL_LAST,
    ms: 1000,
  },
  {
    id: 'late',
    name: '出錯時難以發現',
    sub: '發現得晚，也很難找出問題在哪',
    title: '當出錯時，人類難以及時發現問題，也難以找出問題',
    note: '錯誤混在大量的輪次與 SubAgent 紀錄裡，每一輪看起來都正常；等到發現，已經過了好幾輪，只能回頭一條一條找。',
    last: LATE_LAST,
    ms: 650,
  },
];

function RiskCard({ index, item, mode }: { index: number; item: Risk; mode: PlayMode }) {
  const player = usePlayer(item.last, item.ms, mode);

  return (
    <div className="slide-enter flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} shrink-0 text-coral`}>風險 {pad2(index + 1)}</span>
        <span className="min-w-0 text-[28px] leading-none font-semibold text-paper">
          {item.title}
        </span>
        <PlayerControls player={player} />
      </div>

      <div className="h-[500px] shrink-0">
        {item.id === 'doc' && <DocWrongScene tick={player.tick} />}
        {item.id === 'volume' && <VolumeScene tick={player.tick} />}
        {item.id === 'late' && <LateFindScene tick={player.tick} />}
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-coral bg-panel-lift px-6">
        <span className={`${LABEL_FAINT} shrink-0`}>人類這一端</span>
        <p className="text-[21px] leading-normal break-keep text-paper">{item.note}</p>
      </div>
    </div>
  );
}

export function LoopRiskDemo() {
  const [picked, setPicked] = useState<RiskId>('doc');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    RISKS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：三個風險 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>三個風險，都在人類這一端</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {RISKS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              sub={item.sub}
              on={item.id === picked}
              onClick={() => {
                setPicked(item.id);
                setTouched(true);
              }}
            />
          ))}
        </div>
        <div className="flex h-[122px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-line border-l-[6px] border-l-muted bg-panel-lift px-6">
          <span className={LABEL_FAINT}>跟上一頁的差別</span>
          <p className="text-[20px] leading-normal break-keep text-paper">
            上一頁的邊界，處理的是 AI 在回圈裡出的狀況；這一頁的三個風險，都在人類這一端。
          </p>
        </div>
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <RiskCard
        key={picked}
        index={index}
        item={RISKS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
