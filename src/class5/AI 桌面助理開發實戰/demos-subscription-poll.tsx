import { type KeyboardEvent, type MouseEvent } from 'react';
import {
  BUDGET_OPTIONS,
  BUDGET_TOPIC,
  SUBSCRIBED,
  SUBSCRIPTION_TOPICS,
  UNSUBSCRIBED,
  type BudgetOption,
  type SubscriptionOption,
} from './vote-topics';
import { castVote, useVoteState, type VoteStatus } from './vote-client';
import { DEFAULT_VOTE_ROOM, VOTE_ROOM } from './vote-config';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 開場：訂閱調查
 *
 *   第 6 頁  SubscriptionPollDemo  你目前訂閱了哪些方案？（現場投票，兩題）
 *            接在第 5 頁「卡斯伯目前訂閱」（demos-intro.tsx）後面。
 *            沒有包 withVote，自己接 vote-client（同第 2 頁 FinalChallengeDemo）→ 根容器 h-[720px]。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：講師 CODD 筆記「簡報調整」（codd://note/note-plus，2026-11-18）
 * ──────────────────────────────────────────────────────────────
 *   「後面補一個頁面，用來詢問大家目前訂閱了哪些方案。選項有：ChatGPT、Claude、
 *    Google AI Ultra、其他。下方可以再多一個題目，詢問目前訂閱的方案額度：
 *    $20 美元、100、200、200 以上」
 *   - 題一的四個選項、題二的四個額度照筆記（文字在 vote-topics.ts 的 SUBSCRIPTION_TOPICS、
 *     BUDGET_OPTIONS）。題二的「100、200」照「$20 美元」補成 $100、$200。
 *   - 這頁只有學員自己的投票結果，沒有任何官方方案、價格的事實陳述，所以沒有查核來源；
 *     查核日 2026-11-18。
 *
 * 補的（講師沒給、為了讓畫面成立才加的，都可以換掉）：
 *   - 題一做成複選（很多人同時訂好幾家），筆記沒寫單選或複選。
 *   - 卡片上的小字 OpenAI／Anthropic／Google／其他 AI 服務。
 *   - 題二卡片上的「每月・美元」與提示「訂好幾家就選最接近的總額」：筆記只寫「方案額度」，
 *     訂了好幾家的人要選哪一格是補的規則（單一方案也有超過 200 的，例如第 5 頁查證的 ChatGPT Pro 500）。
 *   - 頂列的操作提示、兩題的「可複選／單選」標籤與提示句。
 *
 * ──────────────────────────────────────────────────────────────
 * 投票的做法（協定沒有改，見 vote-topics.ts 與 workers/class5-vote/README.md）
 * ──────────────────────────────────────────────────────────────
 *   題一  每個選項一個主題（sub-chatgpt／sub-claude／sub-google／sub-other）。
 *         點一下送 score 1（有訂），再點一次送 2（取消），伺服器當成改票。
 *         人數 ＝ counts[0]。長條以四個選項裡最多的那一個為滿格（複選沒有共同的分母，
 *         所以不顯示百分比）。
 *   題二  主題 sub-budget，score 1～4 ＝ 第幾個額度，counts[0..3] 就是各額度的票數；
 *         點另一張就是改票（同第 2 頁）。百分比 ＝ 這一格 ÷ 這一題的總票數。
 *   兩題都不算進第 48 頁的功能排行（VoteResultsDemo 只列 VOTE_TOPICS）。
 *   學員端與講師投影端是同一個畫面；按下去馬上顯示「你有訂／你選的」（樂觀更新），
 *   人數等伺服器廣播（約 250ms）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（只有 acid 一支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  你勾的／你選的：6px 左粗條、實心勾選框／實心圓點、實心「你有訂／你選的」標籤、長條。
 *         hover 的 acid/14 淡底一定配 acid 左粗條與外框。
 *   ok／warn／error 只用在連線狀態點，一律附文字。其餘長條是中性的 muted。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   頂列 56 ＋ 20 ＋ 題一 312 ＋ 20 ＋ 題二 312 ＝ 720
 *   每一題 ＝ 題目列 44 ＋ 12 ＋ 卡片 256
 *   卡片（四欄，各 (1740 − 3 × 20) ÷ 4 ＝ 420 寬）＝ 框 4 ＋ py 40 ＋ 內容 212：
 *     名稱列 44 ＋ 8 ＋ 小字／標籤列 32 ＋（mt-auto）人數 52 ＋ 12 ＋ 長條 14 ≈ 162
 *   名稱最長「Google AI Ultra」34px ≈ 280 寬，勾選框 34 ＋ gap 16 → 330，卡片內寬 364。
 *   標籤沒出現時是 invisible 佔位，投票、改票、取消都不改變任何尺寸。
 *   浮水印在右上角：頂列由左往右排，右上角只有留白；根容器頂端約在舞台 y184，
 *   浮水印 y104–147 碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const STATUS: Record<VoteStatus, { label: string; dot: string }> = {
  connecting: { label: '連線中', dot: 'bg-warn' },
  open: { label: '已連線', dot: 'bg-ok' },
  offline: { label: '離線・重新連線中', dot: 'bg-error' },
  unconfigured: { label: '投票伺服器尚未設定', dot: 'bg-faint' },
};

function StatusText({ status }: { status: VoteStatus }) {
  const { label, dot } = STATUS[status];
  return (
    <span role="status" className="flex shrink-0 items-center gap-2.5 text-[19px] text-muted">
      <span aria-hidden className={`size-[12px] shrink-0 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/** 按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

const CARD_BASE = `flex h-full min-w-0 flex-col rounded-2xl border-2 border-l-[6px] bg-panel px-6 py-5 text-left transition-colors duration-150 disabled:cursor-not-allowed ${FOCUS_RING}`;

const CARD_ON = 'border-acid border-l-acid';
const CARD_OFF =
  'border-line border-l-line enabled:hover:border-acid enabled:hover:border-l-acid enabled:hover:bg-acid/14';

/** 「你有訂／你選的」：沒選的時候 invisible 佔位，卡片高度不變 */
function MineTag({ on, children }: { on: boolean; children: string }) {
  return (
    <span
      aria-hidden={!on}
      className={`shrink-0 rounded-full bg-acid px-3.5 py-0.5 text-[17px] leading-tight font-semibold text-on-accent ${
        on ? '' : 'invisible'
      }`}
    >
      {children}
    </span>
  );
}

/** 卡片底部：人數（大字）＋ 右邊的補充 ＋ 長條 */
function Result({
  count,
  synced,
  unit,
  side,
  width,
  on,
}: {
  count: number;
  synced: boolean;
  unit: string;
  side?: string;
  /** 長條寬度 0～100 */
  width: number;
  on: boolean;
}) {
  return (
    <span className="mt-auto flex flex-col gap-3" aria-live="polite">
      <span className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-2">
          <span className="font-display text-[52px] leading-none font-semibold text-paper tabular-nums">
            {synced ? count : '—'}
          </span>
          <span className="text-[21px] text-muted">{unit}</span>
        </span>
        {side !== undefined && (
          <span className="font-display text-[28px] leading-none font-semibold text-muted tabular-nums">
            {side}
          </span>
        )}
      </span>
      <span className="block h-[14px] w-full overflow-hidden rounded-full bg-line-soft">
        <span
          className={`block h-full rounded-full transition-[width] duration-300 ${
            on ? 'bg-acid' : 'bg-muted'
          }`}
          style={{ width: `${synced ? width : 0}%` }}
        />
      </span>
    </span>
  );
}

/** 題目列：題號、題目、題型標籤、提示 */
function QuestionHead({
  no,
  question,
  kind,
  hint,
  extra,
}: {
  no: string;
  question: string;
  kind: string;
  hint: string;
  extra?: string;
}) {
  return (
    <div className="flex h-[44px] shrink-0 items-center gap-5">
      <span className="shrink-0 rounded-full bg-paper px-4 py-1 text-[19px] font-semibold text-on-accent">
        {no}
      </span>
      <h3 className="shrink-0 text-[30px] leading-tight font-semibold text-paper">{question}</h3>
      <span className="shrink-0 rounded-full border-2 border-paper px-3.5 py-0.5 text-[18px] font-semibold text-paper">
        {kind}
      </span>
      <span className="min-w-0 truncate text-[20px] text-muted">{hint}</span>
      {extra !== undefined && (
        <span className="ml-auto shrink-0 text-[21px] text-muted tabular-nums" aria-live="polite">
          {extra}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 題一 · 你目前訂閱了哪些方案？（複選）
 * ══════════════════════════════════════════════════════════════ */

function CheckMark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-[34px] shrink-0 place-items-center rounded-lg border-2 ${
        on ? 'border-acid bg-acid text-on-accent' : 'border-line bg-panel text-transparent'
      }`}
    >
      <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function SubscriptionCard({
  option,
  count,
  peak,
  synced,
  on,
  disabled,
}: {
  option: SubscriptionOption;
  count: number;
  /** 四個選項裡最多的人數（長條的滿格） */
  peak: number;
  synced: boolean;
  on: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={on}
      aria-label={`${option.label}（${option.vendor}）`}
      onClick={(event) => {
        castVote(option.topic, on ? UNSUBSCRIBED : SUBSCRIBED);
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`${CARD_BASE} ${on ? CARD_ON : CARD_OFF}`}
    >
      <span className="flex h-[44px] shrink-0 items-center gap-4">
        <CheckMark on={on} />
        <span className="truncate text-[34px] leading-tight font-semibold text-paper">
          {option.label}
        </span>
      </span>
      <span className="mt-2 flex h-[32px] shrink-0 items-center gap-3">
        <span className="text-[20px] text-muted">{option.vendor}</span>
        <MineTag on={on}>你有訂</MineTag>
      </span>
      <Result
        count={count}
        synced={synced}
        unit="人有訂"
        width={peak > 0 ? (count / peak) * 100 : 0}
        on={on}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 題二 · 目前訂閱的方案額度？（單選）
 * ══════════════════════════════════════════════════════════════ */

function RadioMark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-[34px] shrink-0 place-items-center rounded-full border-2 bg-panel ${
        on ? 'border-acid' : 'border-line'
      }`}
    >
      <span className={`size-[16px] rounded-full ${on ? 'bg-acid' : 'bg-transparent'}`} />
    </span>
  );
}

function BudgetCard({
  option,
  count,
  total,
  synced,
  on,
  disabled,
}: {
  option: BudgetOption;
  count: number;
  total: number;
  synced: boolean;
  on: boolean;
  disabled: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={on}
      aria-label={`${option.label}（每月・美元）`}
      onClick={(event) => {
        castVote(BUDGET_TOPIC, option.score);
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`${CARD_BASE} ${on ? CARD_ON : CARD_OFF}`}
    >
      <span className="flex h-[44px] shrink-0 items-center gap-4">
        <RadioMark on={on} />
        <span className="font-display text-[38px] leading-none font-semibold text-paper tabular-nums">
          {option.label}
        </span>
      </span>
      <span className="mt-2 flex h-[32px] shrink-0 items-center gap-3">
        <span className="text-[20px] text-muted">每月・美元</span>
        <MineTag on={on}>你選的</MineTag>
      </span>
      <Result
        count={count}
        synced={synced}
        unit="人"
        side={synced ? `${pct}%` : '—'}
        width={pct}
        on={on}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 6 頁 · SubscriptionPollDemo
 * ══════════════════════════════════════════════════════════════ */

export function SubscriptionPollDemo() {
  const vote = useVoteState();
  const disabled = vote.status === 'unconfigured';

  const subCounts = SUBSCRIPTION_TOPICS.map((option) => vote.topics[option.topic].counts[0]);
  const peak = Math.max(0, ...subCounts);

  const budget = vote.topics[BUDGET_TOPIC];
  const budgetCounts = BUDGET_OPTIONS.map((option) => budget.counts[option.score - 1]);
  const budgetTotal = budgetCounts.reduce((sum, count) => sum + count, 0);
  const myBudget = vote.yours[BUDGET_TOPIC];

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-5">
      {/* ── 頂列：由左往右排，右上角留給浮水印 ── */}
      <div className="flex h-[56px] shrink-0 items-center gap-6">
        <span className="rounded-full bg-paper px-4 py-1 text-[18px] font-semibold text-on-accent">
          現場投票
        </span>
        <span className="text-[24px] text-paper">點選項就投票，結果即時更新。</span>
        <span className="flex h-[44px] items-center rounded-full border border-line bg-panel px-4">
          <StatusText status={vote.status} />
        </span>
        <span className="flex items-baseline gap-2" aria-live="polite">
          <span className="font-display text-[36px] leading-none font-semibold text-paper tabular-nums">
            {vote.synced ? vote.online : '—'}
          </span>
          <span className="text-[21px] text-muted">人在線</span>
        </span>
        {/* 測試房間（localStorage 換過房間）才出現，跟第 2 頁、投票結果頁一致 */}
        {VOTE_ROOM !== DEFAULT_VOTE_ROOM && (
          <span className="max-w-[230px] truncate rounded-md border-2 border-warn px-3 py-1 text-[16px] text-warn">
            測試房間：{VOTE_ROOM}
          </span>
        )}
      </div>

      {/* ── 題一：複選 ── */}
      <section className="flex h-[312px] shrink-0 flex-col gap-3">
        <QuestionHead
          no="題一"
          question="你目前訂閱了哪些方案？"
          kind="可複選"
          hint="有訂的都點；再點一次就取消。"
        />
        <div
          role="group"
          aria-label="你目前訂閱了哪些方案？可複選"
          className="grid h-[256px] shrink-0 grid-cols-4 gap-5"
        >
          {SUBSCRIPTION_TOPICS.map((option, index) => (
            <SubscriptionCard
              key={option.topic}
              option={option}
              count={subCounts[index]}
              peak={peak}
              synced={vote.synced}
              on={vote.yours[option.topic] === SUBSCRIBED}
              disabled={disabled}
            />
          ))}
        </div>
      </section>

      {/* ── 題二：單選 ── */}
      <section className="flex h-[312px] shrink-0 flex-col gap-3">
        <QuestionHead
          no="題二"
          question="目前訂閱的方案額度？"
          kind="單選"
          hint="訂好幾家就選最接近的總額；點另一張就是改票。"
          extra={vote.synced ? `${budgetTotal} 人作答` : '— 人作答'}
        />
        <div
          role="group"
          aria-label="目前訂閱的方案額度？選一個"
          className="grid h-[256px] shrink-0 grid-cols-4 gap-5"
        >
          {BUDGET_OPTIONS.map((option, index) => (
            <BudgetCard
              key={option.score}
              option={option}
              count={budgetCounts[index]}
              total={budgetTotal}
              synced={vote.synced}
              on={myBudget === option.score}
              disabled={disabled}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
