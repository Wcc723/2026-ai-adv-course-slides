/**
 * 第三堂課 · 四種測試的互動示範
 *
 * 五支元件：為什麼需要測試 → Unit → Integration → Contract → E2E。
 *
 * 共同約束（改動前先確認）：
 * - 顏色只走 theme.css 的 token，元件內不得出現 hex / rgb() / 具名色
 * - 每支元件總高 ≤ 640px，寬 w-full max-w-[1680px]，不靠內部捲軸塞內容
 * - 狀態卡一律「淡底 + 6px 不透明左粗條」，淡底上的文字一律 text-paper
 * - text-muted / text-faint 只出現在 panel / panel-lift / ink-soft / ink 四種純色表面
 * - SVG 的 <text> 沒有大字豁免，全部用 paper / muted / faint 或強調色（對純色表面 ≥5.22:1）
 * - 逐步動畫用 useState + setTimeout，effect 內開的 timer 一律在 cleanup 清掉
 */
import { Fragment, useEffect, useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * 共用小零件
 * ──────────────────────────────────────────────────────────── */

/**
 * 執行按鈕：藥丸形、有外框、文字前帶一個字元。
 * 刻意跟下面的 Segment（方框群組、內層沒有外框）長得不一樣 ——
 * 投影出去時要一眼分得出「這是動作」還是「這是選項」。
 * disabled 不用 opacity，改換成 faint 文字避免掉出 4.5:1。
 */
function ToolButton({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}) {
  const primary = variant === 'primary';
  const tone = disabled
    ? 'border-line-soft bg-panel text-faint'
    : primary
      ? 'border-acid bg-acid text-on-accent'
      : 'border-line bg-panel text-paper hover:border-acid';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border-2 px-6 py-2 text-[19px] transition-colors ${tone}`}
    >
      {primary ? '▶ ' : '↺ '}
      {label}
    </button>
  );
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/**
 * 選項／模式切換：一個群組方框裝住所有選項，選項自己沒有外框。
 * 左邊固定放一個小標說明「這一組在選什麼」，避免跟執行按鈕混在一起。
 */
function Segment<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[16px] text-faint">{label}</span>
      <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-soft p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-5 py-1.5 text-[19px] transition-colors ${
              option.value === value
                ? 'bg-acid text-on-accent'
                : 'text-muted hover:text-paper'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type BadgeTone = 'ok' | 'error' | 'run' | 'idle';

/** 狀態徽章刻意用「實心強調色 + on-accent」，完全不靠透明填色承擔語意 */
function StatusBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  const style: string =
    tone === 'ok'
      ? 'bg-ok text-on-accent'
      : tone === 'error'
        ? 'bg-error text-on-accent'
        : tone === 'run'
          ? 'bg-acid text-on-accent'
          : 'border border-line-soft bg-panel text-muted';

  return (
    <span className={`rounded-md px-3 py-0.5 font-mono text-[16px] ${style}`}>
      {label}
    </span>
  );
}

/** 範例分支名 */
function BranchChip({ name }: { name: string }) {
  return (
    <span className="rounded-md border border-line-soft bg-ink-soft px-3 py-1 font-mono text-[17px] text-paper">
      {name}
    </span>
  );
}

type CardState = 'idle' | 'run' | 'ok' | 'error';

/** 狀態外框：淡底 + 6px 不透明左粗條（低透明度填色不得單獨承擔語意） */
function shellClass(state: CardState): string {
  switch (state) {
    case 'ok':
      return 'border border-l-[6px] border-ok/55 border-l-ok bg-ok/14';
    case 'error':
      return 'border border-l-[6px] border-error/55 border-l-error bg-error/14';
    case 'run':
      return 'border border-l-[6px] border-acid/55 border-l-acid bg-acid/14';
    default:
      return 'border border-l-[6px] border-line-soft border-l-line bg-panel';
  }
}

/* ────────────────────────────────────────────────────────────
 * 1. WhyTestDemo — 為什麼需要測試
 * ──────────────────────────────────────────────────────────── */

/** 第 3 步注入新功能之後的累積偏移；越晚發現，跟預期的落差越大 */
const DRIFTS: readonly number[] = [0, 0, 0, 1, 3, 8, 15, 24, 35, 48];
const BUG_INDEX: number = 2;

type WhyMode = 'off' | 'on';

const WHY_MODES: readonly SegmentOption<WhyMode>[] = [
  { value: 'off', label: '不加測試' },
  { value: 'on', label: '加入測試' },
];
const BASE_Y: number = 130;
const DRIFT_SCALE: number = 4.2;

function nodeX(index: number): number {
  return 90 + index * 156;
}

function actualY(index: number, testOn: boolean): number {
  const drift = testOn ? 0 : DRIFTS[index];
  return BASE_Y + drift * DRIFT_SCALE;
}

export function WhyTestDemo() {
  const [current, setCurrent] = useState(0);
  const [testOn, setTestOn] = useState(false);

  const lastIndex = testOn ? BUG_INDEX : DRIFTS.length - 1;
  const visible = Math.min(current, lastIndex);
  const drift = testOn ? 0 : DRIFTS[visible];
  const trace = testOn ? 0 : Math.max(0, visible - BUG_INDEX);

  const actualPath = Array.from({ length: visible + 1 }, (_, i) =>
    `${i === 0 ? 'M' : 'L'}${nodeX(i)},${actualY(i, testOn)}`,
  ).join(' ');

  const driftShell = testOn
    ? 'border border-l-[6px] border-ok/55 border-l-ok bg-ok/14'
    : 'border border-l-[6px] border-coral/55 border-l-coral bg-coral/14';

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segment
          label="模式"
          options={WHY_MODES}
          value={testOn ? 'on' : 'off'}
          onChange={(next) => {
            setTestOn(next === 'on');
            setCurrent(0);
          }}
        />
        <ToolButton
          label="往前一步"
          disabled={visible >= lastIndex}
          onClick={() => setCurrent((n) => Math.min(n + 1, lastIndex))}
        />
        <ToolButton
          label="重來"
          variant="secondary"
          onClick={() => setCurrent(0)}
        />
        <span className="ml-auto text-[18px] text-faint">
          每個節點代表一次 commit
        </span>
      </div>

      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <svg
            width={1600}
            height={420}
            viewBox="0 0 1600 420"
            role="img"
            className="h-auto w-full"
          >
            <title>
              第 3 步注入的新功能弄壞了既有行為，沒有被測試擋下，之後每一次 commit
              都讓實際結果離預期更遠
            </title>

            {/* 圖例 */}
            <line
              x1={1000}
              y1={44}
              x2={1080}
              y2={44}
              stroke="var(--color-teal)"
              strokeWidth={4}
              strokeDasharray="12 8"
            />
            <text x={1092} y={52} fill="var(--color-teal)" fontSize={24}>
              預期路線
            </text>
            <line
              x1={1270}
              y1={44}
              x2={1350}
              y2={44}
              stroke="var(--color-coral)"
              strokeWidth={4}
            />
            <text x={1362} y={52} fill="var(--color-coral)" fontSize={24}>
              實際路線
            </text>

            {/* 預期：一條水平直線 */}
            <line
              x1={nodeX(0)}
              y1={BASE_Y}
              x2={nodeX(DRIFTS.length - 1)}
              y2={BASE_Y}
              stroke="var(--color-teal)"
              strokeWidth={4}
              strokeDasharray="12 8"
            />
            {DRIFTS.map((_, i) => (
              <circle
                key={`expect-${i}`}
                cx={nodeX(i)}
                cy={BASE_Y}
                r={7}
                fill="var(--color-teal)"
              />
            ))}

            {/* 測試開啟後的攔截閘門 */}
            {testOn && (
              <g>
                <line
                  x1={nodeX(BUG_INDEX)}
                  y1={62}
                  x2={nodeX(BUG_INDEX)}
                  y2={330}
                  stroke="var(--color-coral)"
                  strokeWidth={3}
                  strokeDasharray="10 8"
                />
                <circle
                  cx={nodeX(BUG_INDEX)}
                  cy={BASE_Y}
                  r={19}
                  fill="var(--color-coral)"
                />
                <rect
                  x={nodeX(BUG_INDEX) - 10}
                  y={BASE_Y - 3}
                  width={20}
                  height={6}
                  rx={3}
                  fill="var(--color-on-accent)"
                />
              </g>
            )}

            {/* 實際：走到目前節點為止 */}
            <path
              d={actualPath}
              fill="none"
              stroke="var(--color-coral)"
              strokeWidth={4}
            />
            {Array.from({ length: visible + 1 }, (_, i) => (
              <circle
                key={`actual-${i}`}
                cx={nodeX(i)}
                cy={actualY(i, testOn)}
                r={8}
                fill="var(--color-coral)"
              />
            ))}

            {/* 目前節點：外環 + 偏移標註 */}
            <circle
              cx={nodeX(visible)}
              cy={actualY(visible, testOn)}
              r={17}
              fill="none"
              stroke="var(--color-coral)"
              strokeWidth={3}
            />
            {drift > 0 && (
              <g>
                <line
                  x1={nodeX(visible)}
                  y1={BASE_Y}
                  x2={nodeX(visible)}
                  y2={actualY(visible, testOn)}
                  stroke="var(--color-coral)"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
                <text
                  x={nodeX(visible) + 26}
                  y={actualY(visible, testOn) + 9}
                  fill="var(--color-coral)"
                  fontSize={26}
                  fontWeight={600}
                >
                  −{drift}
                </text>
              </g>
            )}

            {/* 新功能注入點的標註 */}
            <text
              x={nodeX(BUG_INDEX)}
              y={88}
              textAnchor="middle"
              fill="var(--color-coral)"
              fontSize={24}
              fontWeight={600}
            >
              {testOn ? '測試在第 3 步擋下' : '第 3 步注入新功能'}
            </text>

            {/* 節點編號 */}
            {DRIFTS.map((_, i) => (
              <text
                key={`label-${i}`}
                x={nodeX(i)}
                y={392}
                textAnchor="middle"
                fill="var(--color-faint)"
                fontSize={22}
              >
                {i + 1}
              </text>
            ))}
          </svg>
        </div>

        <div className="flex w-[380px] shrink-0 flex-col gap-3">
          <div className="rounded-xl border border-line bg-ink-soft px-5 py-3">
            <p className="text-[17px] text-faint">目前進度</p>
            <p className="font-display text-[30px] text-paper">
              第 {visible + 1} / {DRIFTS.length} 個 commit
            </p>
          </div>

          <div className={`rounded-xl px-5 py-4 ${driftShell}`}>
            <p className="text-[19px] text-paper">
              {testOn ? '被測試攔下之後的偏移' : '與預期結果的偏移'}
            </p>
            <p className="mt-1 font-display text-[46px] leading-none text-paper">
              {drift}
            </p>
          </div>

          <div className={`rounded-xl px-5 py-4 ${driftShell}`}>
            <p className="text-[19px] text-paper">
              {testOn ? '第 3 步就被擋下來，回溯' : '要找出源頭需要回溯'}
            </p>
            <p className="mt-1 font-display text-[40px] leading-none text-paper">
              {trace} 個 commit
            </p>
          </div>
        </div>
      </div>

      <p className="text-[19px] text-muted">
        第 3
        步加的新功能悄悄弄壞了既有行為，沒有測試擋下來，之後每一次改動都讓落差更大。測試不會讓新功能不出錯，它讓出錯的那一步停在第
        3 步。
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 2. UnitTestDemo — Unit Test
 * ──────────────────────────────────────────────────────────── */

/** 折價券規則：最低消費門檻、折數、折抵金額上限 */
interface Coupon {
  min: number;
  rate: number;
  max: number;
}

interface UnitCase {
  input: string;
  note: string;
  price: number;
  coupon: Coupon;
  expected: number;
}

const UNIT_CASES: readonly UnitCase[] = [
  {
    input: '(1000, 九折)',
    note: '無門檻、無上限',
    price: 1000,
    coupon: { min: 0, rate: 0.9, max: 9999 },
    expected: 900,
  },
  {
    input: '(1000, 九折)',
    note: '折抵上限 50',
    price: 1000,
    coupon: { min: 0, rate: 0.9, max: 50 },
    expected: 950,
  },
  {
    input: '(80, 九折)',
    note: '最低消費 100 → 不折扣',
    price: 80,
    coupon: { min: 100, rate: 0.9, max: 9999 },
    expected: 80,
  },
  {
    input: '(100, 九折)',
    note: '剛好達到最低消費',
    price: 100,
    coupon: { min: 100, rate: 0.9, max: 9999 },
    expected: 90,
  },
  {
    input: '(300, 八折)',
    note: '折抵 60，未達上限 100',
    price: 300,
    coupon: { min: 0, rate: 0.8, max: 100 },
    expected: 240,
  },
];

/** 教學用的受測函式；skipMin 模擬「少判斷最低消費門檻」的 bug */
function calcDiscount(price: number, coupon: Coupon, skipMin: boolean): number {
  if (!skipMin && price < coupon.min) return price;
  const off = price * (1 - coupon.rate);
  return Math.round(price - Math.min(off, coupon.max));
}

const UNIT_GRID: string =
  'grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)]';

type UnitVariant = 'clean' | 'buggy';

const UNIT_VARIANTS: readonly SegmentOption<UnitVariant>[] = [
  { value: 'clean', label: '正確版本' },
  { value: 'buggy', label: '注入 bug' },
];

export function UnitTestDemo() {
  /* 逐列跑測試：target 是「要跑到第幾列」，running 由它推導出來，
     effect 裡就不必同步呼叫 setState（react-hooks/set-state-in-effect） */
  const [revealed, setRevealed] = useState(0);
  const [target, setTarget] = useState(0);
  const [buggy, setBuggy] = useState(false);
  const running = revealed < target;

  useEffect(() => {
    if (revealed >= target) return;
    const timer = window.setTimeout(() => setRevealed((n) => n + 1), 250);
    return () => window.clearTimeout(timer);
  }, [revealed, target]);

  const reset = (): void => {
    setTarget(0);
    setRevealed(0);
  };

  const codeLines: readonly { text: string; bug: boolean }[] = [
    { text: 'function calcDiscount(price, coupon) {', bug: false },
    buggy
      ? { text: '  // 少了最低消費門檻的判斷', bug: true }
      : { text: '  if (price < coupon.min) return price;', bug: false },
    { text: '', bug: false },
    { text: '  const off = price * (1 - coupon.rate);', bug: false },
    { text: '  const cut = Math.min(off, coupon.max);', bug: false },
    { text: '', bug: false },
    { text: '  return price - cut;', bug: false },
    { text: '}', bug: false },
  ];

  const failedIndex = UNIT_CASES.findIndex(
    (item) => calcDiscount(item.price, item.coupon, buggy) !== item.expected,
  );

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segment
          label="受測程式"
          options={UNIT_VARIANTS}
          value={buggy ? 'buggy' : 'clean'}
          onChange={(next) => {
            setBuggy(next === 'buggy');
            reset();
          }}
        />
        <ToolButton
          label="執行測試"
          disabled={running}
          onClick={() => {
            setRevealed(0);
            setTarget(UNIT_CASES.length);
          }}
        />
        <ToolButton label="重來" variant="secondary" onClick={reset} />
        <span className="ml-auto font-mono text-[17px] text-faint">
          discount.test.ts
        </span>
      </div>

      <div className="flex items-stretch gap-5">
        <div className="w-[600px] shrink-0 rounded-xl border border-line bg-ink-soft p-5">
          <p className="mb-3 font-mono text-[17px] text-faint">calcDiscount.js</p>
          <div className="flex flex-col gap-0.5">
            {codeLines.map((line, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-md py-0.5 pr-2 ${
                  line.bug
                    ? 'border-l-[6px] border-l-error bg-error/14 pl-[10px]'
                    : 'pl-4'
                }`}
              >
                <span className="w-6 shrink-0 text-right font-mono text-[16px] text-faint">
                  {index + 1}
                </span>
                <span className="font-mono text-[19px] whitespace-pre text-paper">
                  {line.text || ' '}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[18px] text-muted">
            {buggy
              ? '門檻判斷被拿掉，未達最低消費也會被折扣。'
              : '未達最低消費就原價回傳，折抵金額另有上限。'}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`grid ${UNIT_GRID} gap-3 px-4 pb-2 text-[17px] text-faint`}
          >
            <span>輸入</span>
            <span>預期輸出</span>
            <span>實際輸出</span>
            <span>結果</span>
          </div>

          <div className="flex flex-col gap-2">
            {UNIT_CASES.map((item, index) => {
              const done = index < revealed;
              const actual = calcDiscount(item.price, item.coupon, buggy);
              const pass = actual === item.expected;
              const state: CardState = !done
                ? 'idle'
                : pass
                  ? 'ok'
                  : 'error';

              return (
                <div
                  key={`${item.input}-${index}`}
                  className={`grid ${UNIT_GRID} items-center gap-3 rounded-lg px-4 py-2 ${shellClass(state)}`}
                >
                  <div>
                    <p className="font-mono text-[20px] text-paper">
                      {item.input}
                    </p>
                    <p
                      className={`text-[17px] ${done ? 'text-paper' : 'text-muted'}`}
                    >
                      {item.note}
                    </p>
                  </div>
                  <span className="font-mono text-[21px] text-paper">
                    {item.expected}
                  </span>
                  <span className="font-mono text-[21px] text-paper">
                    {done ? actual : '—'}
                  </span>
                  <span>
                    {done ? (
                      <StatusBadge
                        tone={pass ? 'ok' : 'error'}
                        label={pass ? '✓ pass' : '✗ fail'}
                      />
                    ) : (
                      <StatusBadge tone="idle" label="尚未執行" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[19px] text-muted">
        {buggy && failedIndex >= 0
          ? `Unit Test 直接指到是哪一個輸入組合壞掉：第 ${failedIndex + 1} 列 ${UNIT_CASES[failedIndex].input}，未達最低消費卻仍被折扣。`
          : 'Unit Test 只餵純輸入、只比對回傳值，所以失敗時能直接指出是哪一組輸入。'}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 3. IntegrationTestDemo — Integration Test
 *
 * 兩個情境刻意畫成不一樣的圖：
 * - unit：三個模組各自獨立、彼此之間不連線，測試不跨過模組邊界（所以它才像 unit）
 * - integration：這時候才把三個模組串成一條真實請求路徑，漏掉的那一站標成 error
 * ──────────────────────────────────────────────────────────── */

type IntegrationScenario = 'unit' | 'integration';

interface UnitProbe {
  call: string;
  expect: string;
}

interface TestModule {
  title: string;
  file: string;
  /** 情境一：這個模組自己的單元測試，全部都會綠 */
  probes: readonly UnitProbe[];
  /** 情境二：串起來之後，這一站實際做了什麼 */
  flowCall: string;
  flowNote: string;
  /** 只有把模組串起來才看得到的漏洞落在這一站 */
  broken: boolean;
}

const TEST_MODULES: readonly TestModule[] = [
  {
    title: 'API Server',
    file: 'ordersHandler.js',
    probes: [
      { call: 'handler() 回傳格式', expect: '{ data: [] }' },
      { call: 'handler() 狀態碼', expect: '200' },
    ],
    flowCall: 'GET /admin/orders',
    flowNote: '一般會員帶著自己的 token 打進來，handler 轉給 Auth 檢查。',
    broken: false,
  },
  {
    title: 'Auth 權限檢查',
    file: 'auth.js',
    probes: [
      { call: "isAdmin('admin')", expect: 'true' },
      { call: "isAdmin('member')", expect: 'false' },
    ],
    flowCall: '只呼叫 isLoggedIn()',
    flowNote: '漏掉 isAdmin()：只要登入過就放行，一般會員也被當成管理員。',
    broken: true,
  },
  {
    title: 'Database 存取層',
    file: 'orderRepo.js',
    probes: [
      { call: 'findOrders() 語法', expect: '正確' },
      { call: 'findOrders() 連線', expect: '可建立' },
    ],
    flowCall: 'SELECT * FROM orders',
    flowNote: '沒有人告訴它要加 owner 條件，於是整張訂單表都撈出來。',
    broken: false,
  },
];

const INTEGRATION_OPTIONS: readonly SegmentOption<IntegrationScenario>[] = [
  { value: 'unit', label: '各自的單元測試' },
  { value: 'integration', label: '串起來卻錯' },
];

function FlowArrow({ lit }: { lit: boolean }) {
  return (
    <svg width={56} height={24} viewBox="0 0 56 24" role="presentation">
      <line
        x1={2}
        y1={12}
        x2={44}
        y2={12}
        stroke={lit ? 'var(--color-ok)' : 'var(--color-line)'}
        strokeWidth={3}
      />
      <path
        d="M42,4 L54,12 L42,20 Z"
        fill={lit ? 'var(--color-ok)' : 'var(--color-line)'}
      />
    </svg>
  );
}

/** 情境一模組之間放的不是箭頭，是一條「不會被跨過」的邊界 */
function ModuleBoundary() {
  return (
    <span className="flex w-[92px] shrink-0 flex-col items-center justify-center gap-2 px-2">
      <span className="w-0 flex-1 border-l-2 border-dashed border-line" />
      <span className="text-[16px] text-faint">模組邊界</span>
      <span className="w-0 flex-1 border-l-2 border-dashed border-line" />
    </span>
  );
}

export function IntegrationTestDemo() {
  const [scenario, setScenario] = useState<IntegrationScenario>('unit');
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState(0);
  const running = progress < target;
  const isUnit = scenario === 'unit';

  useEffect(() => {
    if (progress >= target) return;
    const timer = window.setTimeout(() => setProgress((n) => n + 1), 420);
    return () => window.clearTimeout(timer);
  }, [progress, target]);

  const done = target > 0 && progress >= target;

  const nodeState = (index: number): CardState => {
    if (progress <= index) return running && progress === index ? 'run' : 'idle';
    if (isUnit) return 'ok';
    return TEST_MODULES[index].broken ? 'error' : 'ok';
  };

  const badgeTone = (state: CardState): BadgeTone =>
    state === 'ok'
      ? 'ok'
      : state === 'error'
        ? 'error'
        : state === 'run'
          ? 'run'
          : 'idle';

  const badgeLabel = (index: number, state: CardState): string => {
    if (state === 'run') return '執行中';
    if (state === 'idle') return '待執行';
    if (state === 'error') return '✗ 漏判權限';
    if (isUnit) return '✓ 全綠';
    return index === 0 ? '✓ 已轉交' : '✓ 已回傳';
  };

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segment
          label="情境"
          options={INTEGRATION_OPTIONS}
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            setProgress(0);
            setTarget(0);
          }}
        />
        <ToolButton
          label={isUnit ? '執行三支單元測試' : '執行整合測試'}
          disabled={running}
          onClick={() => {
            setProgress(0);
            setTarget(TEST_MODULES.length);
          }}
        />
        <span className="ml-auto flex items-center gap-3 text-[18px] text-faint">
          範例分支
          <BranchChip name="codex/admin-orders-auth-bug" />
        </span>
      </div>

      <div className="flex h-[290px] items-stretch">
        {TEST_MODULES.map((mod, index) => {
          const state = nodeState(index);
          const tinted = state !== 'idle';

          return (
            <Fragment key={mod.title}>
              {index > 0 &&
                (isUnit ? (
                  <ModuleBoundary />
                ) : (
                  <span className="flex w-[92px] shrink-0 items-center justify-center">
                    <FlowArrow lit={progress > index} />
                  </span>
                ))}

              <div
                className={`flex h-full min-w-0 flex-1 flex-col rounded-xl px-6 py-4 ${shellClass(state)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[27px] text-paper">
                    {mod.title}
                  </span>
                  <StatusBadge
                    tone={badgeTone(state)}
                    label={badgeLabel(index, state)}
                  />
                </div>

                <p
                  className={`mt-2 font-mono text-[18px] ${tinted ? 'text-paper' : 'text-muted'}`}
                >
                  {isUnit ? mod.file : mod.flowCall}
                </p>

                {isUnit ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <p
                      className={`text-[17px] ${tinted ? 'text-paper' : 'text-muted'}`}
                    >
                      這個模組自己的單元測試
                    </p>
                    {mod.probes.map((probe) => (
                      <div
                        key={probe.call}
                        className="flex items-center gap-3 rounded-lg border border-line-soft bg-ink-soft px-3 py-1.5"
                      >
                        <span className="min-w-0 truncate font-mono text-[17px] text-paper">
                          {probe.call}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-[17px] text-muted">
                          → {probe.expect}
                        </span>
                        <StatusBadge
                          tone={state === 'ok' ? 'ok' : 'idle'}
                          label={state === 'ok' ? '✓' : '—'}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`mt-3 text-[18px] ${tinted ? 'text-paper' : 'text-muted'}`}
                  >
                    {mod.flowNote}
                  </p>
                )}

                <p
                  className={`mt-auto text-[17px] ${tinted ? 'text-paper' : 'text-muted'}`}
                >
                  {isUnit
                    ? '測試裡不呼叫另外兩個模組'
                    : `真實請求的第 ${index + 1} 站`}
                </p>
              </div>
            </Fragment>
          );
        })}
      </div>

      {isUnit ? (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-ink-soft px-6 py-3">
          <span className="text-[19px] text-muted">三支單元測試</span>
          {TEST_MODULES.map((mod, index) => (
            <span key={mod.title} className="flex items-center gap-2">
              <StatusBadge
                tone={progress > index ? 'ok' : 'idle'}
                label={progress > index ? '✓' : '—'}
              />
              <span className="text-[18px] text-muted">{mod.title}</span>
            </span>
          ))}
          <span className="ml-auto text-[18px] text-faint">
            單元測試不會跨過模組邊界
          </span>
        </div>
      ) : (
        <div
          className={`flex items-center gap-4 rounded-xl px-6 py-3 ${shellClass(done ? 'error' : 'idle')}`}
        >
          <span
            className={`font-mono text-[19px] ${done ? 'text-paper' : 'text-muted'}`}
          >
            一般會員 · GET /admin/orders
          </span>
          <span className={`text-[19px] ${done ? 'text-paper' : 'text-muted'}`}>
            →
          </span>
          <span className={`text-[19px] ${done ? 'text-paper' : 'text-muted'}`}>
            {done
              ? '200 OK · 回傳 128 筆訂單，包含其他會員的'
              : '按「執行整合測試」，請求會依序流過三個模組'}
          </span>
          <span className="ml-auto">
            <StatusBadge
              tone={done ? 'error' : 'idle'}
              label={done ? '✗ 越權拿到資料' : '待執行'}
            />
          </span>
        </div>
      )}

      <div
        className={`rounded-xl px-6 py-4 ${shellClass(
          !done ? 'idle' : isUnit ? 'ok' : 'error',
        )}`}
      >
        <p className={`text-[24px] ${done ? 'text-paper' : 'text-muted'}`}>
          {!done
            ? isUnit
              ? '三個模組各自跑自己的測試，沒有任何一支測試會離開自己的方塊。'
              : '同樣三個模組，這次串成一條真實請求路徑。'
            : isUnit
              ? '三支單元測試全綠 —— 因為它們根本沒有跨過模組邊界。'
              : '一般會員也拿到了全部訂單：Auth 漏掉 isAdmin()。'}
        </p>
        <p className={`mt-1 text-[19px] ${done ? 'text-paper' : 'text-faint'}`}>
          {isUnit
            ? '這正是它像 unit 的原因：從頭到尾沒有模組互相呼叫，也就驗不到彼此的接縫。'
            : '要抓到這個漏洞，只能靠真的把模組串起來跑的整合測試。'}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 4. ContractTestDemo — API／Contract Test
 *
 * 兩種模式：
 * - inspect：一份契約 + 四張回應卡片，點下去自己判斷
 * - collection：openapi.json → Postman Collection，四個端點一次全部重跑
 * ──────────────────────────────────────────────────────────── */

type ContractMode = 'inspect' | 'collection';

const CONTRACT_MODES: readonly SegmentOption<ContractMode>[] = [
  { value: 'inspect', label: '逐張判斷' },
  { value: 'collection', label: '一次測全部' },
];

interface ContractField {
  field: string;
  type: string;
}

const CONTRACT_FIELDS: readonly ContractField[] = [
  { field: 'id', type: 'string' },
  { field: 'title', type: 'string' },
  { field: 'price', type: 'number' },
  { field: 'stock', type: 'number' },
  { field: 'status', type: '200' },
];

interface ContractCase {
  label: string;
  status: string;
  lines: readonly string[];
  ok: boolean;
  reason: string;
}

const CONTRACT_CASES: readonly ContractCase[] = [
  {
    label: '回應 A',
    status: 'HTTP 200',
    lines: [
      '{',
      '  "id": "p_01",',
      '  "title": "純棉 T 恤",',
      '  "price": 1200',
      '}',
    ],
    ok: false,
    reason: '違反 stock: number — 欄位整個不見，前端的庫存會拿到 undefined',
  },
  {
    label: '回應 B',
    status: 'HTTP 200',
    lines: [
      '{',
      '  "id": "p_02",',
      '  "title": "帆布托特包",',
      '  "price": "1200",',
      '  "stock": 8',
      '}',
    ],
    ok: false,
    reason: '違反 price: number — 回傳字串 "1200"，加總會變成字串串接',
  },
  {
    label: '回應 C',
    status: 'HTTP 500',
    lines: ['{', '  "message":', '    "Internal Error"', '}'],
    ok: false,
    reason: '違反 status: 200 — 狀態碼是 500，回應內容也不是商品物件',
  },
  {
    label: '回應 D',
    status: 'HTTP 200',
    lines: [
      '{',
      '  "id": "p_04",',
      '  "title": "羊毛襪",',
      '  "price": 320,',
      '  "stock": 24',
      '}',
    ],
    ok: true,
    reason: '五個欄位、型別與狀態碼全部符合契約',
  },
];

interface ContractEndpoint {
  method: string;
  path: string;
  check: string;
  ok: boolean;
  /** 失敗時違反契約的哪一項 */
  violation: string;
}

const CONTRACT_ENDPOINTS: readonly ContractEndpoint[] = [
  {
    method: 'GET',
    path: '/api/products',
    check: '列表每一筆都有 id / title / price / stock',
    ok: true,
    violation: '',
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    check: 'price 回傳字串 "1200"',
    ok: false,
    violation: 'price: number',
  },
  {
    method: 'POST',
    path: '/api/products',
    check: '201 + 建立後的完整商品物件',
    ok: true,
    violation: '',
  },
  {
    method: 'GET',
    path: '/api/products/:id/stock',
    check: 'stock: number、狀態碼 200',
    ok: true,
    violation: '',
  },
];

/** 契約產生的請求包：一條流程，不需要另外畫大圖 */
function PipelineChip({ label, mono }: { label: string; mono?: boolean }) {
  return (
    <span
      className={`rounded-md border border-line-soft bg-panel px-3 py-1 text-[18px] text-paper ${mono ? 'font-mono' : ''}`}
    >
      {label}
    </span>
  );
}

export function ContractTestDemo() {
  const [mode, setMode] = useState<ContractMode>('inspect');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [checked, setChecked] = useState(0);
  const [runTarget, setRunTarget] = useState(0);
  const running = checked < runTarget;

  useEffect(() => {
    if (checked >= runTarget) return;
    const timer = window.setTimeout(() => setChecked((n) => n + 1), 250);
    return () => window.clearTimeout(timer);
  }, [checked, runTarget]);

  const finished = runTarget > 0 && checked >= runTarget;
  const failedEndpoints = CONTRACT_ENDPOINTS.filter((item) => !item.ok);
  const passedCount = CONTRACT_ENDPOINTS.length - failedEndpoints.length;
  const firstFailed = failedEndpoints[0];

  const reveal = (index: number): void => {
    setRevealed((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segment
          label="檢視方式"
          options={CONTRACT_MODES}
          value={mode}
          onChange={setMode}
        />
        {mode === 'collection' && (
          <ToolButton
            label="執行 Collection"
            disabled={running}
            onClick={() => {
              setChecked(0);
              setRunTarget(CONTRACT_ENDPOINTS.length);
            }}
          />
        )}
        <ToolButton
          label="重來"
          variant="secondary"
          onClick={() => {
            if (mode === 'inspect') {
              setRevealed([]);
              return;
            }
            setChecked(0);
            setRunTarget(0);
          }}
        />
        <span className="ml-auto text-[18px] text-faint">
          {mode === 'inspect'
            ? '四張回應，只有一張真的符合契約'
            : '端點是從契約產生的，不是手動一條一條建的'}
        </span>
      </div>

      <div className="rounded-xl border border-line bg-ink-soft px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-[19px] text-muted">
            {mode === 'inspect'
              ? '契約 · GET /api/products/:id'
              : '契約 · openapi.json 定義的商品欄位'}
          </span>
          <div className="flex flex-wrap gap-2">
            {CONTRACT_FIELDS.map((item) => (
              <span
                key={item.field}
                className="rounded-md border border-line-soft bg-panel px-3 py-1 font-mono text-[19px] text-paper"
              >
                {item.field}
                <span className="ml-2 text-muted">{item.type}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {mode === 'inspect' ? (
        <Fragment>
          <div className="grid grid-cols-4 gap-4">
            {CONTRACT_CASES.map((item, index) => {
              const shown = revealed.includes(index);
              const state: CardState = !shown
                ? 'idle'
                : item.ok
                  ? 'ok'
                  : 'error';

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => reveal(index)}
                  className={`flex h-[364px] flex-col rounded-xl px-5 py-4 text-left transition-colors ${shellClass(state)} ${
                    shown ? '' : 'hover:border-line hover:bg-panel-lift'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[24px] text-paper">
                      {item.label}
                    </span>
                    <StatusBadge
                      tone={!shown ? 'idle' : item.ok ? 'ok' : 'error'}
                      label={
                        !shown
                          ? '點我判斷'
                          : item.ok
                            ? '✓ 符合契約'
                            : '✗ 違反契約'
                      }
                    />
                  </div>

                  <span
                    className={`mt-2 block font-mono text-[18px] ${shown ? 'text-paper' : 'text-muted'}`}
                  >
                    {item.status}
                  </span>

                  <span className="mt-2 block flex-1 rounded-lg border border-line-soft bg-ink-soft px-3 py-2">
                    {item.lines.map((line, lineIndex) => (
                      <span
                        key={lineIndex}
                        className="block font-mono text-[18px] leading-[1.45] whitespace-pre text-paper"
                      >
                        {line}
                      </span>
                    ))}
                  </span>

                  <span
                    className={`mt-2 block h-[62px] text-[18px] ${shown ? 'text-paper' : 'text-faint'}`}
                  >
                    {shown ? item.reason : '這一份回應符合上面的契約嗎？'}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[19px] text-muted">
            前後端不同團隊時，契約測試擋的是「欄位被偷偷改掉」——
            型別換了、欄位少了、狀態碼變了，畫面還沒壞，測試就先紅了。
          </p>
        </Fragment>
      ) : (
        <Fragment>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-ink-soft px-6 py-3">
            <PipelineChip label="openapi.json" mono />
            <span className="text-[19px] text-muted">→</span>
            <span className="font-mono text-[17px] text-muted">
              openapi-to-postmanv2
            </span>
            <span className="text-[19px] text-muted">→</span>
            <PipelineChip label="Postman Collection · 4 個請求" mono />
            <span className="text-[19px] text-muted">→</span>
            <PipelineChip label="一次跑完所有端點" />
            <span className="ml-auto text-[17px] text-faint">
              契約改一次，整包請求跟著重新產生
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {CONTRACT_ENDPOINTS.map((item, index) => {
              const shown = index < checked;
              const state: CardState = shown
                ? item.ok
                  ? 'ok'
                  : 'error'
                : running && index === checked
                  ? 'run'
                  : 'idle';
              const tinted = state !== 'idle';

              return (
                <div
                  key={item.path}
                  className={`flex items-center gap-4 rounded-lg px-5 py-2 ${shellClass(state)}`}
                >
                  <span
                    className={`w-[58px] shrink-0 font-mono text-[18px] ${tinted ? 'text-paper' : 'text-muted'}`}
                  >
                    {item.method}
                  </span>
                  <span
                    className={`font-mono text-[20px] ${tinted ? 'text-paper' : 'text-muted'}`}
                  >
                    {item.path}
                  </span>
                  <span
                    className={`text-[18px] ${tinted ? 'text-paper' : 'text-muted'}`}
                  >
                    {item.check}
                  </span>
                  <span className="ml-auto">
                    <StatusBadge
                      tone={
                        shown
                          ? item.ok
                            ? 'ok'
                            : 'error'
                          : state === 'run'
                            ? 'run'
                            : 'idle'
                      }
                      label={
                        shown
                          ? item.ok
                            ? '✓ pass'
                            : '✗ fail'
                          : state === 'run'
                            ? '檢查中'
                            : '待檢查'
                      }
                    />
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className={`rounded-xl px-6 py-4 ${shellClass(finished ? 'error' : 'idle')}`}
          >
            <p className={`text-[24px] ${finished ? 'text-paper' : 'text-muted'}`}>
              {finished
                ? `${CONTRACT_ENDPOINTS.length} 個端點 · ${passedCount} 通過 · ${failedEndpoints.length} 失敗`
                : '按「執行 Collection」，四個端點會被依序打過一次。'}
            </p>
            <p
              className={`mt-1 text-[19px] ${finished ? 'text-paper' : 'text-faint'}`}
            >
              {finished && firstFailed
                ? `失敗的是 ${firstFailed.method} ${firstFailed.path}：${firstFailed.check}，違反契約的 ${firstFailed.violation}。`
                : '四個端點都由同一份契約檢查：欄位、型別、狀態碼，缺一不可。'}
            </p>
          </div>

          <p className="text-[19px] text-muted">
            手動一條一條打，改了欄位很難每條都重驗；契約產生的 Collection
            可以一次全部重跑。
          </p>
        </Fragment>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 5. E2eTestDemo — E2E Test
 *
 * 兩種模式並排比成本：
 * - manual：不會自動前進，要一頁一頁按「下一步」，每個動作估 8 秒累加上去
 * - auto：維持自動逐頁前進，跑完把秒數留在畫面上跟人工對照
 * ──────────────────────────────────────────────────────────── */

type E2eScenario = 'happy' | 'missing';
type E2eMode = 'manual' | 'auto';
type WireframeVariant = 'home' | 'cart' | 'checkout' | 'payment' | 'done';

interface E2ePage {
  name: string;
  variant: WireframeVariant;
  step: string;
  /** 人工測這一頁要做幾個動作 */
  clicks: number;
  /** E2E 自動跑這一頁花的秒數 */
  autoSeconds: number;
}

const E2E_PAGES: readonly E2ePage[] = [
  {
    name: '首頁',
    variant: 'home',
    step: '瀏覽商品並加入購物車',
    clicks: 2,
    autoSeconds: 1.1,
  },
  {
    name: '購物車',
    variant: 'cart',
    step: '確認品項與數量',
    clicks: 3,
    autoSeconds: 1.2,
  },
  {
    name: '結帳',
    variant: 'checkout',
    step: '填寫收件資訊、建立訂單',
    clicks: 6,
    autoSeconds: 1.5,
  },
  {
    name: '付款',
    variant: 'payment',
    step: '送出付款資訊',
    clicks: 3,
    autoSeconds: 1.4,
  },
  {
    name: '完成',
    variant: 'done',
    step: '顯示訂單編號',
    clicks: 1,
    autoSeconds: 1.2,
  },
];

const E2E_OPTIONS: readonly SegmentOption<E2eScenario>[] = [
  { value: 'happy', label: '正常流程' },
  { value: 'missing', label: '缺少地址欄位' },
];

const E2E_MODE_OPTIONS: readonly SegmentOption<E2eMode>[] = [
  { value: 'manual', label: '人工手動測' },
  { value: 'auto', label: 'E2E 自動跑' },
];

const FAIL_INDEX: number = 2;
const SECONDS_PER_CLICK: number = 8;
const COST_SHELL: string =
  'border border-l-[6px] border-coral/55 border-l-coral bg-coral/14';

function manualClicks(pages: number): number {
  return E2E_PAGES.slice(0, pages).reduce((sum, page) => sum + page.clicks, 0);
}

function autoSeconds(pages: number): number {
  return E2E_PAGES.slice(0, pages).reduce(
    (sum, page) => sum + page.autoSeconds,
    0,
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes} 分 ${rest} 秒` : `${rest} 秒`;
}

/** 頁面線框：純幾何、不放文字，所以沒有 SVG 文字對比問題 */
function Wireframe({
  variant,
  missing,
}: {
  variant: WireframeVariant;
  missing: boolean;
}) {
  const block = 'var(--color-line-soft)';
  const strong = 'var(--color-line)';

  return (
    <svg
      width={260}
      height={140}
      viewBox="0 0 260 140"
      role="presentation"
      className="h-[132px] w-full"
    >
      <rect
        x={1}
        y={1}
        width={258}
        height={138}
        rx={8}
        fill="none"
        stroke={strong}
        strokeWidth={2}
      />

      {variant === 'home' && (
        <g>
          <rect x={14} y={14} width={232} height={16} rx={4} fill={strong} />
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => (
              <rect
                key={`${col}-${row}`}
                x={14 + col * 78}
                y={42 + row * 46}
                width={64}
                height={38}
                rx={5}
                fill={block}
              />
            )),
          )}
        </g>
      )}

      {variant === 'cart' && (
        <g>
          <rect x={14} y={12} width={120} height={12} rx={4} fill={strong} />
          {[0, 1, 2].map((row) => (
            <rect
              key={row}
              x={14}
              y={34 + row * 26}
              width={232}
              height={20}
              rx={5}
              fill={block}
            />
          ))}
          <rect x={158} y={114} width={88} height={16} rx={5} fill={strong} />
        </g>
      )}

      {variant === 'checkout' && (
        <g>
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect
                x={14}
                y={17 + row * 30}
                width={52}
                height={10}
                rx={3}
                fill={strong}
              />
              <rect
                x={76}
                y={12 + row * 30}
                width={170}
                height={20}
                rx={5}
                fill={block}
              />
            </g>
          ))}
          <rect
            x={14}
            y={107}
            width={52}
            height={10}
            rx={3}
            fill={missing ? 'none' : strong}
            stroke={missing ? 'var(--color-error)' : 'none'}
            strokeWidth={2}
            strokeDasharray={missing ? '5 4' : undefined}
          />
          <rect
            x={76}
            y={102}
            width={170}
            height={20}
            rx={5}
            fill={missing ? 'none' : block}
            stroke={missing ? 'var(--color-error)' : 'none'}
            strokeWidth={2}
            strokeDasharray={missing ? '6 5' : undefined}
          />
        </g>
      )}

      {variant === 'payment' && (
        <g>
          <rect x={14} y={14} width={232} height={46} rx={6} fill={block} />
          <rect x={14} y={70} width={110} height={18} rx={5} fill={block} />
          <rect x={136} y={70} width={110} height={18} rx={5} fill={block} />
          <rect x={150} y={106} width={96} height={20} rx={6} fill={strong} />
        </g>
      )}

      {variant === 'done' && (
        <g>
          <circle
            cx={130}
            cy={52}
            r={26}
            fill="none"
            stroke={strong}
            strokeWidth={3}
          />
          <path
            d="M118,52 L127,61 L143,44"
            fill="none"
            stroke={strong}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x={60} y={96} width={140} height={12} rx={4} fill={block} />
          <rect x={85} y={116} width={90} height={10} rx={4} fill={block} />
        </g>
      )}
    </svg>
  );
}

export function E2eTestDemo() {
  const [mode, setMode] = useState<E2eMode>('manual');
  const [scenario, setScenario] = useState<E2eScenario>('happy');
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState(0);
  /** 兩邊的成績各自留著，切換模式不清空，才能並排對照 */
  const [manualCost, setManualCost] = useState<number | null>(null);
  const [autoCost, setAutoCost] = useState<number | null>(null);

  /** 缺少地址欄位時，流程只走到結帳頁就停住 */
  const limit = scenario === 'missing' ? FAIL_INDEX + 1 : E2E_PAGES.length;
  const running = progress < target;
  const finished = progress >= limit;
  const isManual = mode === 'manual';

  useEffect(() => {
    if (mode !== 'auto' || progress >= target) return;
    const timer = window.setTimeout(() => {
      const next = progress + 1;
      setProgress(next);
      if (next >= target) setAutoCost(autoSeconds(target));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [mode, progress, target]);

  const resetRun = (): void => {
    setProgress(0);
    setTarget(0);
  };

  const clickedSoFar = manualClicks(progress);
  const manualShown = manualCost ?? (isManual ? clickedSoFar : 0);
  const manualLit = manualCost !== null || (isManual && clickedSoFar > 0);

  const pageState = (index: number): CardState => {
    if (progress <= index) return 'idle';
    if (scenario === 'missing' && index === FAIL_INDEX) return 'error';
    return 'ok';
  };

  const summaryShell = !finished
    ? shellClass('idle')
    : scenario === 'missing'
      ? shellClass('error')
      : isManual
        ? COST_SHELL
        : shellClass('ok');

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segment
          label="模式"
          options={E2E_MODE_OPTIONS}
          value={mode}
          onChange={(next) => {
            setMode(next);
            resetRun();
          }}
        />
        <Segment
          label="情境"
          options={E2E_OPTIONS}
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            resetRun();
            setManualCost(null);
            setAutoCost(null);
          }}
        />
        {isManual ? (
          <ToolButton
            label="人工點下一頁"
            disabled={finished}
            onClick={() => {
              const next = Math.min(progress + 1, limit);
              setProgress(next);
              if (next >= limit) setManualCost(manualClicks(limit));
            }}
          />
        ) : (
          <ToolButton
            label="執行 E2E 測試"
            disabled={running}
            onClick={() => {
              setProgress(0);
              setTarget(limit);
            }}
          />
        )}
        <ToolButton label="重來" variant="secondary" onClick={resetRun} />
        <span className="ml-auto flex items-center gap-3 text-[18px] text-faint">
          範例分支
          <BranchChip
            name={
              scenario === 'missing'
                ? 'codex/e2e-required-address-bug'
                : 'codex/e2e-checkout'
            }
          />
        </span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {E2E_PAGES.map((page, index) => {
          const state = pageState(index);
          const tinted = state !== 'idle';

          return (
            <div
              key={page.name}
              className={`flex flex-col gap-2 rounded-xl px-4 py-3 ${shellClass(state)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[24px] text-paper">
                  {index + 1}. {page.name}
                </span>
                <StatusBadge
                  tone={
                    state === 'ok' ? 'ok' : state === 'error' ? 'error' : 'idle'
                  }
                  label={state === 'ok' ? '✓' : state === 'error' ? '✗' : '待跑'}
                />
              </div>

              <Wireframe
                variant={page.variant}
                missing={page.variant === 'checkout' && scenario === 'missing'}
              />

              <p className={`text-[17px] ${tinted ? 'text-paper' : 'text-muted'}`}>
                {isManual
                  ? `人工 ${page.clicks} 個動作 · 約 ${page.clicks * SECONDS_PER_CLICK} 秒`
                  : `自動 ${page.autoSeconds.toFixed(1)} 秒`}
              </p>

              <p
                className={`h-[50px] text-[18px] ${tinted ? 'text-paper' : 'text-muted'}`}
              >
                {page.variant === 'checkout' && scenario === 'missing'
                  ? '表單少了 shippingAddress'
                  : page.step}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`rounded-xl px-6 py-3 ${manualLit ? COST_SHELL : shellClass('idle')}`}
        >
          <p className={`text-[18px] ${manualLit ? 'text-paper' : 'text-muted'}`}>
            人工手動測
          </p>
          <p
            className={`mt-1 font-display text-[26px] ${manualLit ? 'text-paper' : 'text-muted'}`}
          >
            {manualLit
              ? `${manualShown} 次操作 · ${formatDuration(manualShown * SECONDS_PER_CLICK)}`
              : '尚未人工走過'}
          </p>
          <p
            className={`mt-1 h-[22px] text-[17px] ${manualLit ? 'text-paper' : 'text-muted'}`}
          >
            {manualCost !== null
              ? '而且每次改版都要再來一遍'
              : '每個動作估 8 秒，一頁一頁按下去'}
          </p>
        </div>

        <div
          className={`rounded-xl px-6 py-3 ${autoCost !== null ? shellClass('ok') : shellClass('idle')}`}
        >
          <p
            className={`text-[18px] ${autoCost !== null ? 'text-paper' : 'text-muted'}`}
          >
            E2E 自動跑
          </p>
          <p
            className={`mt-1 font-display text-[26px] ${autoCost !== null ? 'text-paper' : 'text-muted'}`}
          >
            {autoCost !== null
              ? `0 次人工操作 · ${autoCost.toFixed(1)} 秒`
              : '尚未自動跑過'}
          </p>
          <p
            className={`mt-1 h-[22px] text-[17px] ${autoCost !== null ? 'text-paper' : 'text-muted'}`}
          >
            {autoCost !== null
              ? '同一條流程，重跑不用有人顧'
              : '切到「E2E 自動跑」讓它自己走完'}
          </p>
        </div>
      </div>

      <div className={`rounded-xl px-6 py-4 ${summaryShell}`}>
        <p className={`text-[24px] ${finished ? 'text-paper' : 'text-muted'}`}>
          {!finished
            ? isManual
              ? '人工回歸測試：每一頁都要自己點，按「人工點下一頁」走走看。'
              : '按「執行 E2E 測試」，測試會像真的使用者一樣一頁一頁走完。'
            : scenario === 'missing'
              ? '建立訂單失敗：後端要求必填 shippingAddress，結帳頁沒有這個欄位。'
              : isManual
                ? `一輪人工回歸測試：${manualClicks(limit)} 次操作 · 約 ${formatDuration(manualClicks(limit) * SECONDS_PER_CLICK)}。`
                : `同一條流程：0 次人工操作 · ${autoSeconds(limit).toFixed(1)} 秒，五頁全部通過。`}
        </p>
        <p className={`mt-1 text-[19px] ${finished ? 'text-paper' : 'text-faint'}`}>
          {isManual
            ? '每次改版都要再來一遍，而且這還只是其中一條路徑。'
            : 'E2E 驗的是整條路走不走得通，代價是最慢、最容易因為畫面調整而壞掉。'}
        </p>
      </div>
    </div>
  );
}
