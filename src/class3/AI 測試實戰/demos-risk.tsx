import { useEffect, useState } from 'react';

/* ════════════════════════════════════════════════════════════
 * AI 協作時，測試可能帶來的問題（第 25–28 頁）
 *
 * 共同約定：
 * - 每支元件的內容色控制在兩支強調色以內，需要第三種可辨識訊號時
 *   才動用延伸色（warn / error），並且一律靠語意 token 而不是色相。
 * - 按鈕的選中態直接沿用該元件自己的強調色（正向動作 teal/ok、
 *   問題動作 coral/error），不另外開一支 acid，免得一頁變成三色。
 * - 所有「這一項不一樣」的卡片都是 bg-<accent>/14 ＋ 6px 不透明左粗條，
 *   淡底上的文字一律 text-paper（用 accent 自己的顏色會掉到 4.5:1 以下）。
 * - 元件總高度都壓在 640px 以內，靠固定高度的區塊避免狀態切換時跳動。
 * ════════════════════════════════════════════════════════════ */

const controlBase =
  'rounded-lg border px-5 py-2 text-[19px] transition-colors disabled:cursor-not-allowed';
const controlIdle =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';
const controlOnTeal = 'border-teal bg-teal text-on-accent';
const controlOnOk = 'border-ok bg-ok text-on-accent';
const controlOnError = 'border-error bg-error text-on-accent';
const controlOnCoral = 'border-coral bg-coral text-on-accent';
const controlDisabled =
  'disabled:border-line-soft disabled:bg-ink-soft disabled:text-faint';

/* ────────────────────────────────────────────────────────────
 * 25 產生過多低價值測試
 * 用色：coral（說不出價值）＋ teal（真的擋住問題）
 * ──────────────────────────────────────────────────────────── */

interface TestRow {
  /** 顯示用的原始編號，過濾之後刻意不重編，才看得出中間被刪掉了 */
  no: number;
  name: string;
  prevents: string;
  valuable: boolean;
}

const discountTests: TestRow[] = [
  {
    no: 1,
    name: 'calcDiscount 存在且為 function',
    prevents: '—（只驗證實作細節）',
    valuable: false,
  },
  {
    no: 2,
    name: '未達最低消費 1000 元不折抵',
    prevents: '訂單 999 元照樣打折',
    valuable: true,
  },
  {
    no: 3,
    name: '單張券折抵上限 500 元',
    prevents: '大額訂單被折到近乎免費',
    valuable: true,
  },
  {
    no: 4,
    name: 'getCouponCode() 回傳 code 欄位',
    prevents: '—（getter 沒有邏輯）',
    valuable: false,
  },
  {
    no: 5,
    name: '過期的優惠券不可使用',
    prevents: '過期券在結帳頁仍然生效',
    valuable: true,
  },
  {
    no: 6,
    name: '折抵 800 元時上限不生效',
    prevents: '—（與第 3 筆重複）',
    valuable: false,
  },
  {
    no: 7,
    name: '折抵後金額不得為負數',
    prevents: '退款金額被算成負值',
    valuable: true,
  },
  {
    no: 8,
    name: '內部呼叫 formatPrice() 一次',
    prevents: '—（只驗證實作細節）',
    valuable: false,
  },
  {
    no: 9,
    name: '同一張券不可重複折抵',
    prevents: '重送請求被折抵兩次',
    valuable: true,
  },
  {
    no: 10,
    name: '折抵金額進位到整數元',
    prevents: '每日對帳差 1 元',
    valuable: true,
  },
];

type FilterPhase = 'all' | 'fading' | 'kept';

const FADE_MS = 420;

interface LowValueStat {
  label: string;
  value: string;
  note: string;
  /** 只有「抓到的真實 Bug 數」是重點，用 teal 卡片標出來 */
  highlight: boolean;
}

function lowValueStats(kept: boolean): LowValueStat[] {
  return [
    {
      label: '測試數',
      value: kept ? '6' : '28',
      note: kept ? '刪掉 22 個說不出價值的' : '產生後沒有人再讀過',
      highlight: false,
    },
    {
      label: '行覆蓋率',
      value: kept ? '91%' : '98%',
      note: kept ? '掉了 7 個百分點' : '看起來很漂亮',
      highlight: false,
    },
    {
      label: '抓到的真實 Bug 數',
      value: '3',
      note: kept ? '一個都沒少' : '28 個測試只抓到 3 個',
      highlight: true,
    },
  ];
}

export function LowValueTestDemo() {
  const [phase, setPhase] = useState<FilterPhase>('all');

  // 先淡出、再真的從清單移除，兩段之間的 timer 一定要清掉
  useEffect(() => {
    if (phase !== 'fading') return;
    const timer = setTimeout(() => setPhase('kept'), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const kept = phase === 'kept';
  const rows = kept ? discountTests.filter((row) => row.valuable) : discountTests;
  const stats = lowValueStats(kept);

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[22px] text-paper">discount.test.ts</span>
        <span className="rounded-md border border-line-soft bg-ink-soft px-3 py-1 font-mono text-[17px] text-muted">
          共 28 個測試 · 顯示 10 筆代表
        </span>
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            aria-pressed={phase !== 'all'}
            onClick={() => setPhase('fading')}
            className={`${controlBase} ${
              phase === 'all' ? controlIdle : controlOnTeal
            }`}
          >
            只留說得出價值的
          </button>
          <button
            type="button"
            onClick={() => setPhase('all')}
            className={`${controlBase} ${controlIdle}`}
          >
            重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_440px] gap-6">
        {/* 左：測試清單 */}
        {/* 固定高度：10 列 × 36.5px ＋ 表頭 ＋ 內距 ＝ 453px，
            過濾後只剩 6 列也不會讓右側的數字卡跟著跳動 */}
        <div className="flex h-[464px] flex-col gap-1 rounded-xl border border-line p-3">
          <div className="grid grid-cols-[36px_1fr_430px] gap-3 px-3 text-[16px] tracking-[0.1em] text-faint">
            <span>#</span>
            <span>測試名稱</span>
            <span>這個測試防止什麼問題？</span>
          </div>

          {rows.map((row) => (
            <div
              key={row.no}
              className={`grid grid-cols-[36px_1fr_430px] items-center gap-3 rounded-lg border border-l-[6px] px-3 py-[3px] transition-opacity duration-300 ${
                row.valuable
                  ? 'border-teal/55 border-l-teal bg-teal/14'
                  : 'border-coral/55 border-l-coral bg-coral/14'
              } ${
                phase === 'fading' && !row.valuable ? 'opacity-20' : 'opacity-100'
              }`}
            >
              <span className="font-mono text-[17px] text-paper">{row.no}</span>
              <span className="truncate font-mono text-[19px] text-paper">
                {row.name}
              </span>
              <span className="truncate text-[19px] text-paper">
                {row.prevents}
              </span>
            </div>
          ))}
        </div>

        {/* 右：三個數字 */}
        <div className="flex h-[464px] flex-col gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-1 flex-col justify-center rounded-xl border px-6 ${
                stat.highlight
                  ? 'border-l-[6px] border-teal/55 border-l-teal bg-teal/14'
                  : 'border-line bg-ink-soft'
              }`}
            >
              <p
                className={`text-[17px] tracking-[0.1em] ${
                  stat.highlight ? 'text-paper' : 'text-faint'
                }`}
              >
                {stat.label}
              </p>
              <p className="font-display text-[46px] leading-[1.1] font-semibold text-paper">
                {stat.value}
              </p>
              <p
                className={`text-[18px] ${
                  stat.highlight ? 'text-paper' : 'text-muted'
                }`}
              >
                {stat.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`rounded-xl border px-6 py-3 text-[22px] ${
          kept
            ? 'border-l-[6px] border-teal/55 border-l-teal bg-teal/14 text-paper'
            : 'border-line bg-ink-soft text-muted'
        }`}
      >
        {kept
          ? '覆蓋率掉了 7%，抓到的問題一個都沒少 —— 覆蓋率量的是跑到幾行程式碼，不是擋住幾個問題。'
          : '按下「只留說得出價值的」，看看刪掉 22 個測試之後，到底少了什麼。'}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 26 錯誤輸出過多：Context Window 被測試 log 吃掉
 * 用色：主強調 coral（測試 log）＋ teal/ok（健康狀態）；
 *       容量條需要六段可辨識的色塊，其餘用延伸色 sky / violet / danger / amber。
 * ──────────────────────────────────────────────────────────── */

type SegmentKey = 'code' | 'chat' | 'log' | 'trace' | 'shot' | 'free';

interface SegmentMeta {
  key: SegmentKey;
  label: string;
  /** null 代表「剩餘空間」，用中性的紙面表示，不佔一支強調色 */
  color: string | null;
}

const segmentMeta: SegmentMeta[] = [
  { key: 'code', label: '專案程式碼', color: 'var(--color-sky)' },
  { key: 'chat', label: '對話紀錄', color: 'var(--color-violet)' },
  { key: 'log', label: '測試 log', color: 'var(--color-coral)' },
  { key: 'trace', label: 'Stack Trace', color: 'var(--color-danger)' },
  { key: 'shot', label: '截圖結果', color: 'var(--color-amber)' },
  { key: 'free', label: '剩餘空間', color: null },
];

type ContextScenario = 'full' | 'focused';

interface ScenarioSpec {
  id: ContextScenario;
  button: string;
  pct: Record<SegmentKey, number>;
  tone: 'error' | 'ok';
  headline: string;
  detail: string;
}

const contextScenarios: ScenarioSpec[] = [
  {
    id: 'full',
    button: '跑完整測試',
    pct: { code: 22, chat: 14, log: 34, trace: 16, shot: 10, free: 4 },
    tone: 'error',
    headline: '早期指示已被壓縮',
    detail:
      '最前面的 AGENTS.md 規則與需求描述已經滾出視窗，AI 開始忘記你一開始交代的事。',
  },
  {
    id: 'focused',
    button: '只跑相關測試，只保留關鍵錯誤',
    pct: { code: 22, chat: 15, log: 4, trace: 3, shot: 1, free: 55 },
    tone: 'ok',
    headline: '早期指示完整保留',
    detail: '只把失敗的那幾行餵進去，剩下的空間留給接下來要做的事。',
  },
];

/** 段落寬度小於這個百分比就塞不下文字，改由下方圖例交代 */
const INLINE_LABEL_MIN = 13;

export function ContextWindowDemo() {
  const [scenario, setScenario] = useState<ContextScenario>('full');
  const spec = contextScenarios.find((item) => item.id === scenario) ?? contextScenarios[0];
  const testShare = spec.pct.log + spec.pct.trace + spec.pct.shot;

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-5">
      <div className="flex gap-3">
        {contextScenarios.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={scenario === item.id}
            onClick={() => setScenario(item.id)}
            className={`${controlBase} ${
              scenario !== item.id
                ? controlIdle
                : item.tone === 'error'
                  ? controlOnError
                  : controlOnOk
            }`}
          >
            {item.button}
          </button>
        ))}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="font-display text-[22px] tracking-[0.1em] text-paper">
          Context Window
        </span>
        <span className="font-mono text-[19px] text-muted">200k tokens</span>
      </div>

      <div className="flex h-[132px] overflow-hidden rounded-xl border border-line">
        {segmentMeta.map((segment) => {
          const pct = spec.pct[segment.key];
          const showLabel = pct >= INLINE_LABEL_MIN;
          return (
            <div
              key={segment.key}
              className={`flex flex-col items-center justify-center gap-1 overflow-hidden transition-all duration-500 ease-out ${
                segment.color === null ? 'bg-ink-soft' : ''
              }`}
              style={{
                width: `${pct}%`,
                background: segment.color ?? undefined,
              }}
            >
              {showLabel && (
                <>
                  <span
                    className={`text-[17px] whitespace-nowrap ${
                      segment.color === null ? 'text-muted' : 'text-on-accent'
                    }`}
                  >
                    {segment.label}
                  </span>
                  <span
                    className={`font-display text-[26px] font-semibold ${
                      segment.color === null ? 'text-paper' : 'text-on-accent'
                    }`}
                  >
                    {pct}%
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2">
        {segmentMeta.map((segment) => (
          <span key={segment.key} className="flex items-center gap-2">
            <span
              className={`size-4 rounded-sm ${
                segment.color === null ? 'border border-line bg-ink-soft' : ''
              }`}
              style={{ background: segment.color ?? undefined }}
            />
            <span className="text-[19px] text-paper">{segment.label}</span>
            <span className="font-mono text-[19px] text-muted">
              {spec.pct[segment.key]}%
            </span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_250px_250px] gap-4">
        <div
          className={`rounded-xl border border-l-[6px] px-6 py-4 ${
            spec.tone === 'error'
              ? 'border-error/55 border-l-error bg-error/14'
              : 'border-ok/55 border-l-ok bg-ok/14'
          }`}
        >
          <p className="font-display text-[24px] font-semibold text-paper">
            {spec.headline}
          </p>
          <p className="mt-1 text-[20px] leading-[1.6] text-paper">{spec.detail}</p>
        </div>

        <div className="rounded-xl border border-line bg-ink-soft px-5 py-4">
          <p className="text-[17px] text-faint">測試相關輸出</p>
          <p className="font-display text-[40px] leading-[1.15] font-semibold text-paper">
            {testShare}%
          </p>
          <p className="text-[17px] text-muted">log ＋ trace ＋ 截圖</p>
        </div>

        <div className="rounded-xl border border-line bg-ink-soft px-5 py-4">
          <p className="text-[17px] text-faint">剩餘空間</p>
          <p className="font-display text-[40px] leading-[1.15] font-semibold text-paper">
            {spec.pct.free}%
          </p>
          <p className="text-[17px] text-muted">
            約 {Math.round(spec.pct.free * 2)}k tokens
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 27 修改測試逃避問題：綠燈不等於正確
 * 用色：error（走捷徑）＋ ok（正確做法）
 * ──────────────────────────────────────────────────────────── */

type CheatState = 'fail' | 'cheat' | 'fix';

interface CodeLine {
  text: string;
  tone?: 'error' | 'ok';
  struck?: boolean;
}

const testLines: Record<CheatState, CodeLine[]> = {
  fail: [
    { text: 'const coupon = { rate: 0.1, minSpend: 910 };' },
    { text: '' },
    { text: "it('折抵後實付不得低於最低消費', () => {" },
    { text: '  expect(calcDiscount(1000, coupon)).toBe(90);' },
    { text: '});' },
  ],
  cheat: [
    { text: 'const coupon = { rate: 0.1, minSpend: 910 };' },
    { text: '' },
    { text: "it('折抵後實付不得低於最低消費', () => {" },
    {
      text: '  expect(calcDiscount(1000, coupon)).toBe(90);',
      tone: 'error',
      struck: true,
    },
    {
      text: '  expect(calcDiscount(1000, coupon)).toBe(100);',
      tone: 'error',
    },
    { text: '});' },
  ],
  fix: [
    { text: 'const coupon = { rate: 0.1, minSpend: 910 };' },
    { text: '' },
    { text: "it('折抵後實付不得低於最低消費', () => {" },
    { text: '  expect(calcDiscount(1000, coupon)).toBe(90);' },
    { text: '});' },
  ],
};

const implLines: Record<CheatState, CodeLine[]> = {
  fail: [
    { text: 'export function calcDiscount(price, coupon) {' },
    { text: '  // 少了最低消費門檻的判斷' },
    { text: '  return price * coupon.rate;' },
    { text: '}' },
  ],
  cheat: [
    { text: 'export function calcDiscount(price, coupon) {' },
    { text: '  // 少了最低消費門檻的判斷' },
    { text: '  return price * coupon.rate;' },
    { text: '}' },
  ],
  fix: [
    { text: 'export function calcDiscount(price, coupon) {' },
    { text: '  const off = price * coupon.rate;', tone: 'ok' },
    { text: '  const cap = price - coupon.minSpend;', tone: 'ok' },
    { text: '  return Math.max(0, Math.min(off, cap));', tone: 'ok' },
    { text: '}' },
  ],
};

interface CheatResult {
  expected: string;
  actual: string;
  pass: boolean;
  hint: string;
  hintTone: 'idle' | 'ok';
  verdict: string;
  verdictTone: 'idle' | 'error' | 'ok';
}

const cheatResults: Record<CheatState, CheatResult> = {
  fail: {
    expected: '90',
    actual: '100',
    pass: false,
    hint: '測試碼原封不動',
    hintTone: 'idle',
    verdict: '測試失敗 —— 折抵多算了 10 元，門檻沒有被檢查。',
    verdictTone: 'idle',
  },
  cheat: {
    expected: '100',
    actual: '100',
    pass: true,
    hint: '測試碼被改成配合錯誤答案',
    hintTone: 'idle',
    verdict: '金額仍然算錯，只是沒有人再檢查它了。',
    verdictTone: 'error',
  },
  fix: {
    expected: '90',
    actual: '90',
    pass: true,
    hint: '測試碼一個字都沒動',
    hintTone: 'ok',
    verdict: '金額正確，而且測試還留在那裡繼續守著它。',
    verdictTone: 'ok',
  },
};

function CodeLines({ lines, height }: { lines: CodeLine[]; height: string }) {
  return (
    <div
      className="flex flex-col gap-[3px] overflow-hidden rounded-xl border border-line bg-ink-soft p-4"
      style={{ height }}
    >
      {lines.map((line, index) => (
        <div
          key={`${index}-${line.text}`}
          className={`flex items-center gap-4 rounded-md border border-l-[6px] px-3 py-[3px] ${
            line.tone === 'error'
              ? 'border-error/55 border-l-error bg-error/14'
              : line.tone === 'ok'
                ? 'border-ok/55 border-l-ok bg-ok/14'
                : 'border-transparent border-l-transparent'
          }`}
        >
          <span
            className={`w-6 shrink-0 text-right font-mono text-[17px] ${
              line.tone ? 'text-paper' : 'text-faint'
            }`}
          >
            {index + 1}
          </span>
          <span
            className={`font-mono text-[18px] whitespace-pre text-paper ${
              line.struck ? 'line-through decoration-2' : ''
            }`}
          >
            {line.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CheatTestDemo() {
  const [state, setState] = useState<CheatState>('fail');
  const result = cheatResults[state];

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex items-center gap-5">
        <span className="font-display text-[26px] font-semibold text-paper">
          綠燈不等於正確
        </span>
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            aria-pressed={state === 'cheat'}
            onClick={() => setState('cheat')}
            className={`${controlBase} ${
              state === 'cheat' ? controlOnError : controlIdle
            }`}
          >
            AI 走捷徑
          </button>
          <button
            type="button"
            aria-pressed={state === 'fix'}
            onClick={() => setState('fix')}
            className={`${controlBase} ${
              state === 'fix' ? controlOnOk : controlIdle
            }`}
          >
            正確做法
          </button>
          <button
            type="button"
            onClick={() => setState('fail')}
            className={`${controlBase} ${controlIdle}`}
          >
            重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左：測試碼 */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[19px] text-muted">
            discount.test.ts
          </span>
          <CodeLines lines={testLines[state]} height="262px" />
          <div
            className={`rounded-lg border px-4 py-2 text-[19px] ${
              result.hintTone === 'ok'
                ? 'border-l-[6px] border-ok/55 border-l-ok bg-ok/14 text-paper'
                : 'border-line bg-ink-soft text-muted'
            }`}
          >
            {result.hint}
          </div>
        </div>

        {/* 右：實作與執行結果 */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[19px] text-muted">discount.ts</span>
          <CodeLines lines={implLines[state]} height="262px" />
          <div
            className={`flex items-center gap-5 rounded-lg border border-l-[6px] px-4 py-2 ${
              result.pass
                ? 'border-ok/55 border-l-ok bg-ok/14'
                : 'border-error/55 border-l-error bg-error/14'
            }`}
          >
            <span
              className="size-[18px] shrink-0 rounded-full"
              style={{
                background: result.pass
                  ? 'var(--color-ok)'
                  : 'var(--color-error)',
              }}
            />
            <span className="font-display text-[22px] font-semibold text-paper">
              {result.pass ? '測試通過' : '測試失敗'}
            </span>
            <span className="ml-auto font-mono text-[19px] text-paper">
              預期 {result.expected} · 實際 {result.actual}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border px-6 py-3 text-[22px] ${
          result.verdictTone === 'error'
            ? 'border-l-[6px] border-error/55 border-l-error bg-error/14 text-paper'
            : result.verdictTone === 'ok'
              ? 'border-l-[6px] border-ok/55 border-l-ok bg-ok/14 text-paper'
              : 'border-line bg-ink-soft text-muted'
        }`}
      >
        {result.verdict}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 28 缺少停止條件：修正迴圈自己轉不停
 * 用色：coral（迴圈本身）＋ ok（停止條件生效），
 *       檔案發散另外用 warn，是延伸色不佔主強調的兩支額度。
 * ──────────────────────────────────────────────────────────── */

interface LoopNodeSpec {
  label: string;
  x: number;
  y: number;
}

const loopNodes: LoopNodeSpec[] = [
  { label: '執行測試', x: 40, y: 40 },
  { label: '測試失敗', x: 500, y: 40 },
  { label: '讀 log 找原因', x: 500, y: 288 },
  { label: '修改程式', x: 40, y: 288 },
];

interface TouchedFile {
  name: string;
  related: boolean;
}

const touchedFiles: TouchedFile[] = [
  { name: 'src/discount.ts', related: true },
  { name: 'src/discount.test.ts', related: true },
  { name: 'src/coupon.ts', related: true },
  { name: 'src/order.ts', related: false },
  { name: 'src/cart.ts', related: false },
  { name: 'tests/setup.ts', related: false },
  { name: 'tsconfig.json', related: false },
  { name: 'vite.config.ts', related: false },
];

const TICK_MS = 180;
const STOP_LIMIT = 3;
/** 沒有停止條件時，示範上限；到這裡才停是為了不要讓 timer 無限跑下去 */
const DEMO_LIMIT = 8;
const TOKENS_PER_ROUND = 16;

function LoopNode({ node, active }: { node: LoopNodeSpec; active: boolean }) {
  return (
    <g>
      {/* 節點一律留 ink-soft 底 + 彩色描邊，不整塊填實心強調色再挖空文字：
          挖空字的對比只能靠人眼判斷，稽核腳本是拿 DOM 背景去比，會直接判 1.00:1。
          目前這一步改用「4px 實心描邊 + 左側 6px 不透明粗條」表示，
          兩個都是不透明訊號，投影機吃不掉。 */}
      <rect
        x={node.x}
        y={node.y}
        width={220}
        height={92}
        rx={14}
        fill="var(--color-ink-soft)"
        stroke="var(--color-coral)"
        strokeWidth={active ? 4 : 2}
      />
      {active && (
        <rect
          x={node.x}
          y={node.y + 14}
          width={6}
          height={64}
          rx={3}
          fill="var(--color-coral)"
        />
      )}
      <text
        x={node.x + 110}
        y={node.y + 55}
        textAnchor="middle"
        fontSize={24}
        fontWeight={600}
        fill={active ? 'var(--color-coral)' : 'var(--color-paper)'}
      >
        {node.label}
      </text>
    </g>
  );
}

type LoopTone = 'idle' | 'run' | 'ok' | 'warn';

export function NoStopLoopDemo() {
  /** -1 代表還沒開始，避免用額外的 started 旗標 */
  const [tick, setTick] = useState(-1);
  const [running, setRunning] = useState(false);
  const [stopEnabled, setStopEnabled] = useState(false);

  const limit = stopEnabled ? STOP_LIMIT : DEMO_LIMIT;
  const maxTick = limit * loopNodes.length - 1;
  const started = tick >= 0;
  const frozen = started && tick >= maxTick;
  const attempts = started ? Math.floor(tick / loopNodes.length) + 1 : 0;
  const activeIndex = started ? tick % loopNodes.length : -1;
  const fileCount = Math.min(attempts, touchedFiles.length);
  /* 「到上限就停」是推導出來的，不是在 effect 裡再 setState —— 這樣
     切換停止條件、按暫停、重置都不會留下還在跑的 interval。 */
  const spinning = running && !frozen;

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => {
      setTick((current) => (current >= maxTick ? maxTick : current + 1));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [spinning, maxTick]);

  function handleRun() {
    if (spinning) {
      setRunning(false);
      return;
    }
    setTick((current) => (current < 0 ? 0 : current));
    setRunning(true);
  }

  function handleReset() {
    setRunning(false);
    setTick(-1);
  }

  function handleToggleStop() {
    const next = !stopEnabled;
    setStopEnabled(next);
    if (next) {
      setTick((current) =>
        Math.min(current, STOP_LIMIT * loopNodes.length - 1),
      );
    }
  }

  let tone: LoopTone;
  let statusText: string;
  if (!started) {
    tone = 'idle';
    statusText = '尚未開始 —— 按「開始」讓修正迴圈自己跑一圈一圈';
  } else if (frozen && stopEnabled) {
    tone = 'ok';
    statusText = '已達停止條件 —— 交回人工確認';
  } else if (frozen) {
    tone = 'warn';
    statusText = `第 ${DEMO_LIMIT} 次仍未通過 —— 沒有任何條件讓它停下來（示範上限）`;
  } else if (spinning) {
    tone = 'run';
    statusText = `修正迴圈進行中 —— 第 ${attempts} 次嘗試`;
  } else {
    tone = 'idle';
    statusText = `已暫停 —— 停在第 ${attempts} 次`;
  }

  const centerTitle =
    frozen && stopEnabled
      ? '已達停止條件'
      : frozen
        ? '還在轉'
        : '沒有停止條件';
  const centerFill =
    frozen && stopEnabled
      ? 'var(--color-ok)'
      : frozen
        ? 'var(--color-warn)'
        : 'var(--color-coral)';

  const loopStats = [
    { label: '嘗試次數', value: String(attempts) },
    { label: '累計 token', value: `${attempts * TOKENS_PER_ROUND}k` },
    { label: '改動檔案數', value: String(fileCount) },
  ];

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-[26px] font-semibold text-paper">
          自動修正迴圈
        </span>
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={frozen}
            className={`${controlBase} ${controlDisabled} ${
              spinning ? controlOnCoral : controlIdle
            }`}
          >
            {spinning ? '暫停' : '開始'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={`${controlBase} ${controlIdle}`}
          >
            重置
          </button>
          <button
            type="button"
            aria-pressed={stopEnabled}
            onClick={handleToggleStop}
            className={`${controlBase} ${
              stopEnabled ? controlOnOk : controlIdle
            }`}
          >
            設定停止條件（最多 {STOP_LIMIT} 次）
          </button>
        </div>
      </div>

      <div className="grid h-[440px] grid-cols-[1fr_540px] gap-6">
        <svg
          viewBox="0 0 760 420"
          className="h-[440px] w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <title>
            跑測試、失敗、讀 log、修改程式，四個節點一圈一圈重複，沒有停止條件就不會結束
          </title>
          <defs>
            <marker
              id="loop-arrow-head"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-coral)" />
            </marker>
          </defs>

          <path
            d="M 264 86 L 490 86"
            stroke="var(--color-coral)"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#loop-arrow-head)"
          />
          <path
            d="M 610 136 L 610 280"
            stroke="var(--color-coral)"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#loop-arrow-head)"
          />
          <path
            d="M 496 334 L 270 334"
            stroke="var(--color-coral)"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#loop-arrow-head)"
          />
          <path
            d="M 150 284 L 150 140"
            stroke="var(--color-coral)"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#loop-arrow-head)"
          />

          {loopNodes.map((node, index) => (
            <LoopNode
              key={node.label}
              node={node}
              active={index === activeIndex}
            />
          ))}

          <text
            x={380}
            y={196}
            textAnchor="middle"
            fontSize={26}
            fontWeight={600}
            fill={centerFill}
          >
            {centerTitle}
          </text>
          <text
            x={380}
            y={230}
            textAnchor="middle"
            fontSize={20}
            fill="var(--color-muted)"
          >
            {started ? `第 ${attempts} 次嘗試` : '按「開始」啟動'}
          </text>
        </svg>

        <div className="flex h-[440px] flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {loopStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-line bg-ink-soft px-4 py-2"
              >
                <p className="text-[16px] text-faint">{stat.label}</p>
                <p className="font-display text-[34px] leading-[1.15] font-semibold text-paper">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-xl border border-line p-3">
            <p className="mb-1 text-[16px] tracking-[0.1em] text-faint">
              改動的檔案
            </p>
            {touchedFiles.slice(0, fileCount).map((file) => (
              <div
                key={file.name}
                className={`flex items-center gap-3 rounded-md border px-3 py-[1px] ${
                  file.related
                    ? 'border-line-soft bg-panel-lift'
                    : 'border-l-[6px] border-warn/55 border-l-warn bg-warn/14'
                }`}
              >
                <span className="font-mono text-[18px] text-paper">
                  {file.name}
                </span>
                {!file.related && (
                  <span className="ml-auto text-[17px] text-paper">不相關</span>
                )}
              </div>
            ))}
            {fileCount === 0 && (
              <p className="text-[18px] text-muted">還沒有動到任何檔案</p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border border-l-[6px] px-6 py-3 text-[22px] ${
          tone === 'ok'
            ? 'border-ok/55 border-l-ok bg-ok/14 text-paper'
            : tone === 'warn'
              ? 'border-warn/55 border-l-warn bg-warn/14 text-paper'
              : tone === 'run'
                ? 'border-coral/55 border-l-coral bg-coral/14 text-paper'
                : 'border-line border-l-line bg-ink-soft text-muted'
        }`}
      >
        {statusText}
      </div>
    </div>
  );
}
