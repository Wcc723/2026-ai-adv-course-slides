import { useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * 情境考題（第 21、22 頁）
 *
 * 兩支元件共用同一套版式：頂部圖例 → 標題列 → 題目卡片。
 * 圖例是這兩頁的核心，學員要一眼看出「答案只會是 1–4」，
 * 所以編號用實心圓章（text-on-accent 壓在實心強調色上，6.47–9.91:1），
 * 卡片用淡底配不透明左粗條 —— 淡底在投影機下會被吃掉，不能單獨承擔語意。
 * ──────────────────────────────────────────────────────────── */

type TestTypeId = 'unit' | 'integration' | 'contract' | 'e2e';

interface TestType {
  /** 圓章上的編號，對應圖例的 1–4 */
  readonly num: string;
  readonly name: string;
  /** 實心底：只放 text-on-accent */
  readonly badgeClass: string;
  /** 淡底 + 不透明左粗條：上面的文字一律 text-paper */
  readonly frameClass: string;
}

/** 四種測試各給一支可辨識色：主色系三支不夠，第四支動用延伸色 violet */
const TEST_TYPES: Record<TestTypeId, TestType> = {
  unit: {
    num: '1',
    name: 'Unit Test',
    badgeClass: 'bg-acid',
    frameClass: 'border-acid/55 border-l-acid bg-acid/14',
  },
  integration: {
    num: '2',
    name: 'Integration Test',
    badgeClass: 'bg-teal',
    frameClass: 'border-teal/55 border-l-teal bg-teal/14',
  },
  contract: {
    num: '3',
    name: 'API／Contract Test',
    badgeClass: 'bg-blue',
    frameClass: 'border-blue/55 border-l-blue bg-blue/14',
  },
  e2e: {
    num: '4',
    name: 'E2E Test',
    badgeClass: 'bg-violet',
    frameClass: 'border-violet/55 border-l-violet bg-violet/14',
  },
};

const TYPE_ORDER: readonly TestTypeId[] = [
  'unit',
  'integration',
  'contract',
  'e2e',
];

/** 未選中／選中的按鈕外觀，兩支元件共用 */
const IDLE_BUTTON =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';
const ACTIVE_BUTTON = 'border-acid bg-acid text-on-accent';

/* ── 共用零件 ────────────────────────────────────────────── */

/** 頂部固定的圖例：編號 1–4 對應四種測試 */
function QuizLegend() {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-3.5">
      {TYPE_ORDER.map((id) => {
        const type = TEST_TYPES[id];
        return (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-xl border border-l-[6px] px-4 py-2.5 ${type.frameClass}`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-[28px] leading-none text-on-accent ${type.badgeClass}`}
            >
              {type.num}
            </span>
            {/* 淡底上的文字一律 text-paper：用強調色自己會掉到 4.43:1 以下 */}
            <span className="font-display text-[24px] tracking-[0.04em] text-paper">
              {type.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface QuizHeaderProps {
  /** 整頁標示：單選是中性標籤，複選用實心 amber 標籤明確區隔 */
  mode: 'single' | 'multi';
  hint: string;
  allOpen: boolean;
  onToggleAll: () => void;
}

function QuizHeader({ mode, hint, allOpen, onToggleAll }: QuizHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <span
          className={
            mode === 'multi'
              ? 'rounded-lg bg-amber px-4 py-1.5 font-display text-[22px] tracking-[0.18em] text-on-accent'
              : 'rounded-lg border border-line bg-ink-soft px-4 py-1.5 font-display text-[22px] tracking-[0.18em] text-paper'
          }
        >
          {mode === 'multi' ? '複選' : '單選'}
        </span>
        <p className="text-[21px] text-muted">{hint}</p>
      </div>

      <button
        type="button"
        onClick={onToggleAll}
        className={`shrink-0 rounded-lg border px-5 py-2.5 text-[19px] transition-colors ${
          allOpen ? ACTIVE_BUTTON : IDLE_BUTTON
        }`}
      >
        {allOpen ? '全部收合' : '全部展開'}
      </button>
    </div>
  );
}

/** 解答標籤：編號圓章 + 測試名稱，套上該答案的強調色 */
function AnswerTag({ type }: { type: TestType }) {
  return (
    <span
      className={`flex items-center gap-2.5 rounded-lg border border-l-[6px] px-3 py-2 ${type.frameClass}`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full font-display text-[20px] leading-none text-on-accent ${type.badgeClass}`}
      >
        {type.num}
      </span>
      <span className="font-display text-[21px] whitespace-nowrap text-paper">
        {type.name}
      </span>
    </span>
  );
}

interface QuizCardProps {
  index: number;
  question: string;
  answers: readonly TestTypeId[];
  /** 複選題在卡片上再標一次，不只靠標題列 */
  multi: boolean;
  closedHint: string;
  open: boolean;
  onToggle: () => void;
}

function QuizCard({
  index,
  question,
  answers,
  multi,
  closedHint,
  open,
  onToggle,
}: QuizCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center gap-3">
        <span className="font-display text-[18px] tracking-[0.16em] text-faint">
          Q{index}
        </span>
        {multi ? (
          <span className="rounded bg-amber px-2.5 py-0.5 font-display text-[17px] tracking-[0.14em] text-on-accent">
            複選
          </span>
        ) : null}
      </div>

      <p className="mt-2.5 text-[25px] leading-[1.5] text-paper">{question}</p>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-3.5">
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 rounded-lg border px-5 py-2 text-[19px] transition-colors ${
            open ? ACTIVE_BUTTON : IDLE_BUTTON
          }`}
        >
          {open ? '收合解答' : '顯示解答'}
        </button>

        {open ? (
          answers.map((id) => <AnswerTag key={id} type={TEST_TYPES[id]} />)
        ) : (
          <span className="text-[18px] text-faint">{closedHint}</span>
        )}
      </div>
    </div>
  );
}

interface QuizQuestion {
  readonly question: string;
  readonly answers: readonly TestTypeId[];
}

/** 開合狀態共用邏輯：一題一格 boolean，全部展開／收合看 every */
function useAnswerToggles(count: number) {
  const [openFlags, setOpenFlags] = useState<boolean[]>(() =>
    Array.from({ length: count }, () => false),
  );

  const allOpen = openFlags.every(Boolean);

  const toggleOne = (index: number) => {
    setOpenFlags((flags) =>
      flags.map((flag, i) => (i === index ? !flag : flag)),
    );
  };

  const toggleAll = () => {
    setOpenFlags((flags) => flags.map(() => !flags.every(Boolean)));
  };

  return { openFlags, allOpen, toggleOne, toggleAll };
}

/* ── 21：單選 4 題 ───────────────────────────────────────── */

const SINGLE_QUESTIONS: readonly QuizQuestion[] = [
  {
    question: '薪資系統中的加班費與請假扣款計算，適合加入哪一種測試？',
    answers: ['unit'],
  },
  {
    question:
      '使用者註冊後，需要同時寫入資料庫並寄送驗證信，適合加入哪一種測試？',
    answers: ['integration'],
  },
  {
    question:
      '前端與後端由不同團隊開發，如何避免 API 欄位被修改後造成系統故障？',
    answers: ['contract'],
  },
  {
    question:
      '使用者需要完成註冊、登入、購買與觀看課程，應該用哪一種測試驗證？',
    answers: ['e2e'],
  },
];

export function QuizSingleDemo() {
  const { openFlags, allOpen, toggleOne, toggleAll } = useAnswerToggles(
    SINGLE_QUESTIONS.length,
  );

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <QuizHeader
        mode="single"
        hint="每題只有一個最合適的答案，先自己判斷再展開解答"
        allOpen={allOpen}
        onToggleAll={toggleAll}
      />

      <QuizLegend />

      <div className="grid grid-cols-2 gap-4">
        {SINGLE_QUESTIONS.map((item, index) => (
          <QuizCard
            key={item.question}
            index={index + 1}
            question={item.question}
            answers={item.answers}
            multi={false}
            closedHint="從 1–4 選一個"
            open={openFlags[index] ?? false}
            onToggle={() => toggleOne(index)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── 22：複選 3 題 ───────────────────────────────────────── */

const MULTI_QUESTIONS: readonly QuizQuestion[] = [
  {
    question:
      '登入功能同時涉及資料庫、密碼驗證、Token 與頁面跳轉，可能需要哪些測試？',
    answers: ['integration', 'e2e'],
  },
  {
    question:
      '檔案上傳功能同時包含格式驗證、雲端儲存與操作畫面，可能需要哪些測試？',
    answers: ['unit', 'integration', 'e2e'],
  },
  {
    question:
      '請假系統需要驗證假別計算、主管通知與完整審核流程，可能需要哪些測試？',
    answers: ['unit', 'integration', 'e2e'],
  },
];

export function QuizMultiDemo() {
  const { openFlags, allOpen, toggleOne, toggleAll } = useAnswerToggles(
    MULTI_QUESTIONS.length,
  );

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <QuizHeader
        mode="multi"
        hint="每題的答案不只一個，把所有需要的測試都選出來"
        allOpen={allOpen}
        onToggleAll={toggleAll}
      />

      <QuizLegend />

      <div className="grid grid-cols-3 gap-4">
        {MULTI_QUESTIONS.map((item, index) => (
          <QuizCard
            key={item.question}
            index={index + 1}
            question={item.question}
            answers={item.answers}
            multi
            closedHint="從 1–4 選出多個"
            open={openFlags[index] ?? false}
            onToggle={() => toggleOne(index)}
          />
        ))}
      </div>
    </div>
  );
}
