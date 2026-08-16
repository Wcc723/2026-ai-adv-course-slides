import { useEffect, useState, type ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────
 * 第 30–32 頁：「執行測試」階段的解法
 *
 * 基調偏正向，主色一律 teal；只有「舊做法／代價高」的對照組才用 coral。
 * 終端機那一支是全檔唯一的深色底板（bg-paper），裡面的文字改用 ink 系，
 * 狀態則走實心色塊 + text-on-accent，不靠深底上看不見的強調色。
 * ──────────────────────────────────────────────────────────── */

/** 兩種語氣共用的樣式表。Tailwind 需要完整字串，不能動態拼接 class 名。 */
const toneStyles = {
  teal: {
    card: 'border border-l-[6px] border-teal/55 border-l-teal bg-teal/14',
    solid: 'border-teal bg-teal text-on-accent',
    bar: 'bg-teal',
  },
  coral: {
    card: 'border border-l-[6px] border-coral/55 border-l-coral bg-coral/14',
    solid: 'border-coral bg-coral text-on-accent',
    bar: 'bg-coral',
  },
} as const;

type Tone = keyof typeof toneStyles;

/** 未選中的按鈕與方塊：描邊 + 浮起底，hover 才把字提到 paper */
const idleControl =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';

/* ────────────────────────────────────────────────────────────
 * 30. 模組化測試：一次全跑 ↔ 只跑改到的模組
 * ──────────────────────────────────────────────────────────── */

type ModuleId = 'auth' | 'cart' | 'coupon' | 'order' | 'payment' | 'admin';

interface TestModule {
  id: ModuleId;
  label: string;
  cases: number;
  /** 這個模組單獨跑完要幾秒 */
  seconds: number;
  /** 這個模組會吐出幾行輸出 */
  lines: number;
}

/* 六個模組加總 = 272 秒（4m32s）／ 1,842 行，剛好是「一次全跑」的數字 */
const testModules: TestModule[] = [
  { id: 'auth', label: '登入與權限', cases: 24, seconds: 38, lines: 246 },
  { id: 'cart', label: '購物車', cases: 31, seconds: 52, lines: 318 },
  { id: 'coupon', label: '折扣計算', cases: 6, seconds: 11, lines: 34 },
  { id: 'order', label: '訂單流程', cases: 42, seconds: 64, lines: 402 },
  { id: 'payment', label: '付款串接', cases: 37, seconds: 71, lines: 515 },
  { id: 'admin', label: '後台管理', cases: 28, seconds: 36, lines: 327 },
];

const TOTAL_LINES = 1842;

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m${String(seconds).padStart(2, '0')}s`;
}

function formatCount(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function ModularTestDemo() {
  const [mode, setMode] = useState<'all' | 'picked'>('picked');
  const [picked, setPicked] = useState<ModuleId[]>(['coupon']);

  const running: ModuleId[] =
    mode === 'all' ? testModules.map((item) => item.id) : picked;

  const stats = testModules
    .filter((item) => running.includes(item.id))
    .reduce(
      (acc, item) => ({
        seconds: acc.seconds + item.seconds,
        lines: acc.lines + item.lines,
        cases: acc.cases + item.cases,
      }),
      { seconds: 0, lines: 0, cases: 0 },
    );

  /* 輸出行數越多，貼回主 Session 的 Context 佔用越高 */
  const contextPct = 4 + Math.round((stats.lines / TOTAL_LINES) * 58);
  const tone: Tone = mode === 'all' ? 'coral' : 'teal';

  function toggleModule(id: ModuleId) {
    if (mode === 'all') {
      setMode('picked');
      setPicked([id]);
      return;
    }
    setPicked((prev) => {
      if (!prev.includes(id)) return [...prev, id];
      // 至少留一個模組，否則統計會變成一排 0
      return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
    });
  }

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-5">
      {/* 模式切換 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMode('all')}
          aria-pressed={mode === 'all'}
          className={`rounded-lg border px-6 py-2.5 text-[20px] transition-colors ${
            mode === 'all' ? toneStyles.coral.solid : idleControl
          }`}
        >
          一次全跑
        </button>
        <button
          type="button"
          onClick={() => setMode('picked')}
          aria-pressed={mode === 'picked'}
          className={`rounded-lg border px-6 py-2.5 text-[20px] transition-colors ${
            mode === 'picked' ? toneStyles.teal.solid : idleControl
          }`}
        >
          只跑改到的模組
        </button>
        <p className="ml-2 text-[19px] text-faint">
          {mode === 'all'
            ? '六個模組全部重跑，包含這次根本沒動到的'
            : `點方塊挑要跑哪幾個模組，目前選了 ${picked.length} 個`}
        </p>
      </div>

      {/* 模組方塊 */}
      <div className="grid grid-cols-6 gap-3">
        {testModules.map((item) => {
          const active = running.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleModule(item.id)}
              aria-pressed={active}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                active ? toneStyles[tone].solid : idleControl
              }`}
            >
              <span className="block font-mono text-[26px]">{item.id}</span>
              <span className="mt-1 block text-[17px]">
                {item.label} · {item.cases} tests
              </span>
              <span className="mt-2 block font-display text-[19px]">
                {active ? `執行中 ${formatDuration(item.seconds)}` : '未執行'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 統計：淡色底一律配一條不透明左粗條，文字一律 paper */}
      <div className="flex gap-4">
        <div className={`flex-1 rounded-xl px-6 py-4 ${toneStyles[tone].card}`}>
          <p className="text-[18px] text-paper">耗時</p>
          <p className="mt-1 font-display text-[38px] leading-none text-paper">
            {formatDuration(stats.seconds)}
          </p>
        </div>

        <div className={`flex-1 rounded-xl px-6 py-4 ${toneStyles[tone].card}`}>
          <p className="text-[18px] text-paper">終端機輸出</p>
          <p className="mt-1 font-display text-[38px] leading-none text-paper">
            {formatCount(stats.lines)}
            <span className="ml-2 font-sans text-[20px]">行</span>
          </p>
        </div>

        <div className={`flex-1 rounded-xl px-6 py-4 ${toneStyles[tone].card}`}>
          <p className="text-[18px] text-paper">貼回主 Session 的 Context</p>
          <p className="mt-1 font-display text-[38px] leading-none text-paper">
            {contextPct}%
          </p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-panel">
            <div
              className={`h-full rounded-full transition-all duration-300 ${toneStyles[tone].bar}`}
              style={{ width: `${contextPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-line bg-ink-soft px-6 py-4">
          <p className="text-[18px] text-faint">測試案例</p>
          <p className="mt-1 font-display text-[38px] leading-none text-paper">
            {stats.cases}
            <span className="ml-2 font-sans text-[20px] text-muted">
              / 168 個
            </span>
          </p>
        </div>
      </div>

      <p className="text-[20px] text-muted">
        只跑與這次修改直接相關的測試，是最省 Context 的一步。
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 31. 善用不同 Session / Model / Effort / SubAgent
 * ──────────────────────────────────────────────────────────── */

type ModelId = 'Opus' | 'Sonnet' | 'Haiku';
type EffortId = 'low' | 'medium' | 'high';
type SessionId = 'keep' | 'fresh';

const models: ModelId[] = ['Opus', 'Sonnet', 'Haiku'];
const efforts: EffortId[] = ['low', 'medium', 'high'];

const sessionOptions: { id: SessionId; label: string }[] = [
  { id: 'keep', label: '沿用目前' },
  { id: 'fresh', label: '另開新的' },
];

const modelNotes: Record<ModelId, string> = {
  Opus: '推理最深，留給難解的失敗與跨模組重構',
  Sonnet: '日常主力，速度與品質的平衡點',
  Haiku: '最快也最便宜，適合重複性高的例行檢查',
};

const effortNotes: Record<EffortId, string> = {
  low: '少想幾步直接動手，適合已經指名檔案的小修正',
  medium: '一般任務的預設值',
  high: '先規劃再動手，慢，但不容易改壞既有邏輯',
};

/**
 * Effort 不只決定想得多深，也決定 Context 吃多少：
 * 推理輪數與工具呼叫越多，進到主 Session 的中間產物就越多。
 * 幅度刻意壓在 ±10，讓 SubAgent（-70）仍然是最大的那一刀。
 */
const effortContextDelta: Record<EffortId, number> = {
  low: -10,
  medium: 0,
  high: 10,
};

function ToolGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-display text-[17px] tracking-[0.14em] text-faint">
        {label}
      </p>
      <div className="mt-1.5 flex gap-2">{children}</div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-4 py-2 font-mono text-[18px] transition-colors ${
        active ? toneStyles.teal.solid : idleControl
      }`}
    >
      {children}
    </button>
  );
}

export function ModelSwitchDemo() {
  const [model, setModel] = useState<ModelId>('Sonnet');
  const [effort, setEffort] = useState<EffortId>('medium');
  const [session, setSession] = useState<SessionId>('keep');
  const [subAgent, setSubAgent] = useState(false);

  /* 基準由 Session / SubAgent 決定：開了 SubAgent，測試輸出根本不會進來 */
  const contextBase = subAgent ? 18 : session === 'keep' ? 88 : 40;
  /* Effort 再往上推或往下拉，最後夾在 5–99 之間 */
  const delta = effortContextDelta[effort];
  const contextPct = Math.min(99, Math.max(5, contextBase + delta));
  const tone: Tone = contextPct >= 70 ? 'coral' : 'teal';

  const baseNote = subAgent
    ? '測試 log 留在子代理裡，主 Session 只收到一段摘要。'
    : session === 'keep'
      ? '整份測試輸出、stack trace 與先前的對話全部疊在同一個 Session。'
      : '換一個乾淨的 Session，只帶進這次要修的檔案與失敗訊息。';

  /* high + 沿用同一個 Session：基準本來就滿，推理紀錄又全部疊上去 */
  const worstCombo = effort === 'high' && !subAgent && session === 'keep';

  const effortNote =
    delta === 0
      ? `effort medium 維持 ${contextBase}% 的基準，沒有多餘的推理紀錄疊上來。`
      : delta > 0
        ? `effort high 多繞幾輪推理、多叫幾次工具，把基準再推高 ${delta} 個百分點${
            worstCombo ? '，這是最貴的組合。' : '。'
          }`
        : `effort low 少想幾步、工具也少叫，把基準往下拉 ${-delta} 個百分點。`;

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex gap-8">
        {/* 模擬的 AI 對話框 */}
        <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-line bg-panel-lift p-6">
          <div className="flex flex-col gap-3">
            <div className="max-w-[78%] self-end rounded-2xl rounded-br-md border border-line-soft bg-panel px-5 py-3 text-[20px] text-paper">
              幫我把 coupon 的折扣計算修好，測試要全綠
            </div>
            <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-line-soft bg-ink-soft px-5 py-3 text-[20px] text-paper">
              我先跑 tests/unit/coupon.test.ts，把失敗的斷言整理成摘要再回報。
            </div>
          </div>

          {/* 工具列 */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-xl border border-line-soft bg-panel px-5 py-4">
            <ToolGroup label="MODEL">
              {models.map((item) => (
                <PillButton
                  key={item}
                  active={model === item}
                  onClick={() => setModel(item)}
                >
                  {item}
                </PillButton>
              ))}
            </ToolGroup>

            <ToolGroup label="EFFORT">
              {efforts.map((item) => (
                <PillButton
                  key={item}
                  active={effort === item}
                  onClick={() => setEffort(item)}
                >
                  {item}
                </PillButton>
              ))}
            </ToolGroup>

            <ToolGroup label="SESSION">
              {sessionOptions.map((item) => (
                <PillButton
                  key={item.id}
                  active={session === item.id}
                  onClick={() => setSession(item.id)}
                >
                  {item.label}
                </PillButton>
              ))}
            </ToolGroup>

            <ToolGroup label="SUBAGENT">
              <PillButton active={!subAgent} onClick={() => setSubAgent(false)}>
                關
              </PillButton>
              <PillButton active={subAgent} onClick={() => setSubAgent(true)}>
                開
              </PillButton>
            </ToolGroup>
          </div>
        </div>

        {/* 主 Session 的 Context 佔用 */}
        <div className="flex w-[520px] shrink-0 flex-col gap-4">
          <div className={`rounded-2xl px-7 py-5 ${toneStyles[tone].card}`}>
            <p className="text-[19px] text-paper">主 Session 的 Context 佔用</p>
            <p className="mt-1 font-display text-[60px] leading-none text-paper">
              {contextPct}%
            </p>
            <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-panel">
              <div
                className={`h-full rounded-full transition-all duration-300 ${toneStyles[tone].bar}`}
                style={{ width: `${contextPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line bg-ink-soft px-6 py-4">
            <p className="text-[19px] text-paper">{baseNote}</p>
            <p className="text-[19px] text-paper">{effortNote}</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line bg-ink-soft px-6 py-4">
            <p className="text-[19px] text-muted">
              <span className="mr-3 font-mono text-paper">{model}</span>
              {modelNotes[model]}
            </p>
            <p className="text-[19px] text-muted">
              <span className="mr-3 font-mono text-paper">
                effort: {effort}
              </span>
              {effortNotes[effort]}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[20px] text-muted">
        Model 決定這一次任務的推理成本；Effort
        同時牽動思考的深度與 Context 的消耗；Session 與 SubAgent
        決定主 Session 要替你背多少 Context。
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 32. 必要時改由人工執行測試
 *
 * ⚠ 這一支的底板是 bg-paper（近黑），是全檔唯一的深底。
 *   深底上的文字一律 text-ink / text-ink-soft（對 paper 約 14:1 / 13:1），
 *   不能沿用 text-paper（黑底黑字）；狀態則用實心 ok / error 色塊配
 *   text-on-accent，強調色本身在深底上是看不見的。
 * ──────────────────────────────────────────────────────────── */

type TermTone =
  | 'cmd'
  | 'head-pass'
  | 'head-fail'
  | 'case-ok'
  | 'case-bad'
  | 'detail'
  | 'dim'
  | 'sum'
  | 'blank';

interface TermLine {
  tone: TermTone;
  text: string;
}

const passLines: TermLine[] = [
  { tone: 'cmd', text: 'npm run test:module -- coupon' },
  { tone: 'head-pass', text: 'tests/unit/coupon.test.ts' },
  { tone: 'detail', text: '  calcDiscount' },
  { tone: 'case-ok', text: '未達門檻不折扣 (3 ms)' },
  { tone: 'case-ok', text: '滿千折百 (1 ms)' },
  { tone: 'case-ok', text: '百分比折扣四捨五入 (2 ms)' },
  { tone: 'case-ok', text: '過期的折扣碼不套用 (1 ms)' },
  { tone: 'case-ok', text: '折扣後金額不會小於 0 (1 ms)' },
  { tone: 'case-ok', text: '多張折扣碼只取最優惠 (2 ms)' },
  { tone: 'blank', text: '' },
  { tone: 'sum', text: 'Tests:   6 passed, 6 total' },
  { tone: 'sum', text: 'Time:    1.284 s' },
];

const failLines: TermLine[] = [
  { tone: 'cmd', text: 'npm run test:module -- coupon' },
  { tone: 'head-fail', text: 'tests/unit/coupon.test.ts' },
  { tone: 'detail', text: '  calcDiscount' },
  { tone: 'case-ok', text: '未達門檻不折扣 (3 ms)' },
  { tone: 'case-ok', text: '滿千折百 (1 ms)' },
  { tone: 'case-bad', text: '百分比折扣四捨五入 (4 ms)' },
  { tone: 'blank', text: '' },
  { tone: 'detail', text: '      expect(received).toBe(expected)' },
  { tone: 'detail', text: '      Expected: 90' },
  { tone: 'detail', text: '      Received: 100' },
  { tone: 'dim', text: '      at tests/unit/coupon.test.ts:24:31' },
  { tone: 'sum', text: 'Tests:   1 failed, 5 passed, 6 total' },
  { tone: 'sum', text: 'Time:    1.402 s' },
];

function TerminalLine({ line }: { line: TermLine }) {
  switch (line.tone) {
    case 'blank':
      return <div className="h-[13px]" />;
    case 'cmd':
      return (
        <p className="whitespace-pre text-ink">
          <span className="mr-2 text-ink-soft">$</span>
          {line.text}
        </p>
      );
    case 'head-pass':
      return (
        <p className="whitespace-pre text-ink">
          <span className="mr-3 rounded bg-ok px-2 py-0.5 font-semibold text-on-accent">
            PASS
          </span>
          {line.text}
        </p>
      );
    case 'head-fail':
      return (
        <p className="whitespace-pre text-ink">
          <span className="mr-3 rounded bg-error px-2 py-0.5 font-semibold text-on-accent">
            FAIL
          </span>
          {line.text}
        </p>
      );
    case 'case-ok':
      return (
        <p className="whitespace-pre pl-8 text-ink">
          <span className="mr-2">✓</span>
          {line.text}
        </p>
      );
    case 'case-bad':
      return (
        <p className="whitespace-pre pl-8 text-ink">
          <span className="mr-2 rounded bg-error px-1.5 font-semibold text-on-accent">
            ✕
          </span>
          {line.text}
        </p>
      );
    case 'dim':
      return <p className="whitespace-pre text-ink-soft">{line.text}</p>;
    case 'sum':
      return (
        <p className="whitespace-pre font-semibold text-ink">{line.text}</p>
      );
    case 'detail':
      return <p className="whitespace-pre text-ink">{line.text}</p>;
  }
}

export function ManualTerminalDemo() {
  const [variant, setVariant] = useState<'pass' | 'fail'>('pass');
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  const lines = variant === 'pass' ? passLines : failLines;
  const total = lines.length;
  const finished = started && shown >= total;

  /* 打字機效果：每 180ms 多印一行，離開或重跑時一定要把 timer 清掉 */
  useEffect(() => {
    if (!started || shown >= total) return;
    const timer = setTimeout(() => setShown((n) => n + 1), 180);
    return () => clearTimeout(timer);
  }, [started, shown, total]);

  function run() {
    setShown(1);
    setStarted(true);
  }

  function pickVariant(next: 'pass' | 'fail') {
    setVariant(next);
    setShown(0);
    setStarted(false);
  }

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      {/* 指令列與控制 */}
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-ink-soft px-5 py-3">
          <span className="font-mono text-[19px] text-faint">$</span>
          <span className="font-mono text-[20px] text-paper">
            npm run test:module -- coupon
          </span>
        </div>

        {/* 執行鍵刻意用深色墨板而不是強調色：右邊兩顆結果切換已經是 ok / error，
            再多一顆實心 teal 會跟「全部通過」混在一起 */}
        <button
          type="button"
          onClick={run}
          className="rounded-lg border border-paper bg-paper px-7 py-3 text-[20px] text-ink transition-colors hover:border-muted hover:bg-muted"
        >
          {finished ? '重新執行' : started ? '執行中…' : '執行'}
        </button>

        <span className="ml-2 text-[18px] text-faint">結果</span>
        <button
          type="button"
          onClick={() => pickVariant('pass')}
          aria-pressed={variant === 'pass'}
          className={`rounded-lg border px-5 py-3 text-[19px] transition-colors ${
            variant === 'pass'
              ? 'border-ok bg-ok text-on-accent'
              : idleControl
          }`}
        >
          全部通過
        </button>
        <button
          type="button"
          onClick={() => pickVariant('fail')}
          aria-pressed={variant === 'fail'}
          className={`rounded-lg border px-5 py-3 text-[19px] transition-colors ${
            variant === 'fail'
              ? 'border-error bg-error text-on-accent'
              : idleControl
          }`}
        >
          有一項失敗
        </button>
      </div>

      {/* 終端機視窗：深色底板，裡面一律用 ink 系文字 */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-center gap-2 border-b border-ink/20 px-5 py-3">
          <span className="size-3 rounded-full bg-ink/55" />
          <span className="size-3 rounded-full bg-ink/40" />
          <span className="size-3 rounded-full bg-ink/28" />
          <span className="ml-3 font-mono text-[17px] text-ink-soft">
            zsh — 人工執行 coupon 模組測試
          </span>
        </div>

        {/* 高度寫死：12 行內文 ×26 + 1 行空行 13 + py-4 = 357，留一點餘裕。
            外層是 overflow-hidden，內容超過就會被裁掉，也會被稽核判定溢出 */}
        <div className="h-[372px] px-6 py-4 font-mono text-[19px] leading-[26px]">
          {!started && (
            <p className="text-ink-soft">
              等待執行 —— 按上方的「執行」開始
            </p>
          )}
          {lines.slice(0, shown).map((line, index) => (
            <TerminalLine key={`${variant}-${index}`} line={line} />
          ))}
          {started && !finished && (
            <span className="inline-block h-[19px] w-[10px] animate-pulse bg-ink align-middle" />
          )}
        </div>
      </div>

      <p className="text-[20px] text-muted">
        AI 不必什麼都自己跑，人工執行一次再把關鍵錯誤貼回去，往往更省。
      </p>
    </div>
  );
}
