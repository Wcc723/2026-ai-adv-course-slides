import { type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import quotaMonitorUrl from './images/quota-monitor.png';
import { POLL_OPTIONS, POLL_TOPIC, type PollOption } from './vote-topics';
import { castVote, useVoteState, type VoteStatus } from './vote-client';
import { DEFAULT_VOTE_ROOM, VOTE_ROOM } from './vote-config';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 開場前方新增的兩頁
 *
 *   第 2 頁  FinalChallengeDemo  最後一堂課，你想看哪一類的挑戰？（現場單選投票）
 *   第 3 頁  HomeworkDemo        作業挑戰：替自己的開發做一個工具
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：講師的 CODD 筆記「簡報調整」（codd://note/note-xcra，2026-11-10 17:17）
 * ──────────────────────────────────────────────────────────────
 * - 第 2 頁：「最後一堂課程，你想要看那一類的挑戰」四個選項與「註」照筆記。
 *   選項的文字在 vote-topics.ts 的 POLL_OPTIONS（score 1～4 ＝ 第幾個選項）。
 *   投票走功能頁同一條 WebSocket（vote-client.ts），topic 是 POLL_TOPIC；
 *   伺服器回來的 counts[0..3] 就是四個選項的票數。再點另一張卡就是改票。
 *   這一題不算進最後一頁的功能排行（VoteResultsDemo 只列 VOTE_TOPICS）。
 * - 第 3 頁：作業說明、範例（AI 工具使用額度監測）、審核兩點照筆記。
 * - 第 3 頁右欄：講師自己做的「AI 額度監控」實際截圖 images/quota-monitor.png
 *   （680 × 928，來源：講師 2026-11-10 提供）。畫面上的數字是截圖當下的真實用量，
 *   這裡不重畫、不改數字。旁邊那句「讀各家的用量、依剩餘比例變色」是補的說明。
 *
 * 補的示意：
 * - 第 2 頁四張卡的線條圖示、頂列那句操作提示。
 * - 第 3 頁說明句後半「不是做給別人用的產品，是讓你自己開發更順手的工具」、
 *   審核第 1 點的小字「工具真的能用，做到你說它要做的事」是補的說明。
 * - 第 3 頁審核第 2 點的「例如」（金鑰、token 寫死、送到不該送的地方）是補的舉例，
 *   講師原文只寫「確認有沒有什麼資安外洩的問題」。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁最多兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 2 頁  acid（你投的：6px 左粗條、實心標籤、長條）；ok／warn／error 只用在連線狀態點，
 *            一律附文字。其餘長條是中性的 muted。
 *   第 3 頁  acid（「這次不一樣」標籤、審核兩點的左粗條與編號）。右欄截圖裡的綠／橘／紅
 *            是講師工具本身的顏色，不算本頁的強調色；截圖的框與透明圓角底用 paper。
 *   淡底（/14）一律配 6px 不透明左粗條或實心標籤。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px]）
 * ──────────────────────────────────────────────────────────────
 *   第 2 頁  頂列 56 ＋ 24 ＋ 卡片 520 ＋ 24 ＋ 註 96 ＝ 720
 *            卡片 py-7 56 ＋ 編號列 40 ＋ 20 ＋ 圖示 56 ＋ 16 ＋ 名稱 48 ＋ 8 ＋ 例子 2 行 62
 *            ＋ 底部（百分比 56 ＋ 12 ＋ 長條 16）84 ≈ 390，用 mt-auto 把長條推到底
 *   第 3 頁  欄寬：左欄 927（1fr）＋ gap 40 ＋ 右欄 773（截圖 529 ＋ gap 24 ＋ 說明 220）＝ 1740
 *            左欄 ≈ 標籤 34 ＋ 16 ＋ 大標 46 ＋ 14 ＋ 說明 2 行 76 ＋ 24 ＋ 範例框 116
 *            ＋ 24 ＋ 審核標題 26 ＋ 12 ＋ 兩張 2 × 84 ＋ 12 ＋ 說明 2 行 66 ≈ 634
 *            右欄  截圖框 529 × 720（含 2px 邊框），內容 525 × 716，object-contain 等比
 *                  縮成 0.77 倍（原圖字約 20px → 舞台約 15px）；說明欄 220 寬、靠底對齊。
 *                  截圖已經頂滿根容器的 720 高，要再放大只能動根容器高度；
 *                  說明放在截圖旁邊而不是下方，就是為了不讓截圖矮到 0.75 以下。
 *   沒有任何容器會捲動，互動不改變高度。
 *   浮水印在右上角：兩頁的頂端都由左往右排，右上角只有留白；
 *   第 3 頁右欄是截圖＋靠底的說明，右上角只有說明欄上方的留白
 *   （根容器頂端約在舞台 y184，浮水印 y104–147 碰不到）。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

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

/** 選項卡的按鍵不能讓簡報翻頁（空白鍵、方向鍵）—— 同 vote-ui.tsx */
function stopKeys(event: KeyboardEvent) {
  event.stopPropagation();
}

/** 按完就放掉焦點，避免之後按空白鍵重複觸發這個按鈕 —— 同 vote-ui.tsx */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.blur();
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ══════════════════════════════════════════════════════════════
 * 第 2 頁 · FinalChallengeDemo — 最後一堂課，你想看哪一類的挑戰？
 *
 * 頂列：操作提示、連線狀態、投票人數。
 * 中：四張選項卡（按鈕），點一張就投票，再點另一張就是改票；
 *     卡片底部是即時的百分比、票數與長條。你投的那張：6px acid 左粗條＋「你投的」標籤。
 * 底：講師的「註」。
 * ══════════════════════════════════════════════════════════════ */

/** 四個選項的線條圖示（48 × 48 座標，示意） */
function OptionIcon({ score }: { score: PollOption['score'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={56} height={56} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      {score === 1 && (
        <>
          {/* 購物袋 */}
          <path d="M9 17h30l-2.4 23H11.4z" {...common} />
          <path d="M17 17v-3a7 7 0 0 1 14 0v3" {...common} />
          <path d="M17 24v2M31 24v2" {...common} />
        </>
      )}
      {score === 2 && (
        <>
          {/* 遊戲手把 */}
          <rect x={4} y={14} width={40} height={22} rx={11} {...common} />
          <path d="M14 21v8M10 25h8" {...common} />
          <circle cx={31} cy={22.5} r={1.8} fill="currentColor" stroke="none" />
          <circle cx={36} cy={27.5} r={1.8} fill="currentColor" stroke="none" />
        </>
      )}
      {score === 3 && (
        <>
          {/* 應用程式視窗 */}
          <rect x={6} y={8} width={36} height={32} rx={4} {...common} />
          <path d="M6 16h36" {...common} />
          <path d="M13 24h14M13 31h20" {...common} />
        </>
      )}
      {score === 4 && (
        <>
          {/* 對話泡泡 */}
          <path
            d="M9 9h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H21l-8 7v-7H9a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z"
            {...common}
          />
          <circle cx={16} cy={21} r={1.8} fill="currentColor" stroke="none" />
          <circle cx={24} cy={21} r={1.8} fill="currentColor" stroke="none" />
          <circle cx={32} cy={21} r={1.8} fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

function OptionCard({
  option,
  count,
  total,
  synced,
  mine,
  disabled,
}: {
  option: PollOption;
  count: number;
  total: number;
  synced: boolean;
  mine: boolean;
  disabled: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={mine}
      aria-label={`${option.label}：${option.example}`}
      onClick={(event) => {
        castVote(POLL_TOPIC, option.score);
        blurAfterClick(event);
      }}
      className={`flex h-full min-w-0 flex-col rounded-2xl border-2 border-l-[6px] px-7 py-7 text-left transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid disabled:cursor-not-allowed ${
        mine
          ? 'border-acid border-l-acid bg-panel'
          : 'border-line border-l-line bg-panel enabled:hover:border-acid enabled:hover:border-l-acid enabled:hover:bg-acid/14'
      }`}
    >
      {/* 編號 ＋ 你投的 */}
      <span className="flex h-[40px] shrink-0 items-center gap-3">
        <span
          className={`font-display text-[30px] leading-none font-semibold tabular-nums ${
            mine ? 'text-acid' : 'text-faint'
          }`}
        >
          {pad2(option.score)}
        </span>
        {mine && (
          <span className="rounded-full bg-acid px-3.5 py-1 text-[17px] leading-tight font-semibold text-on-accent">
            你投的
          </span>
        )}
      </span>

      <span className={`mt-5 ${mine ? 'text-acid' : 'text-muted'}`}>
        <OptionIcon score={option.score} />
      </span>

      <span className="mt-4 text-[40px] leading-tight font-semibold text-paper">{option.label}</span>
      <span className="mt-2 text-[23px] leading-snug text-muted">{option.example}</span>

      {/* 即時結果 */}
      <span className="mt-auto flex flex-col gap-3" aria-live="polite">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-display text-[56px] leading-none font-semibold text-paper tabular-nums">
            {synced ? `${pct}%` : '—'}
          </span>
          <span className="text-[21px] text-muted tabular-nums">{synced ? `${count} 票` : '— 票'}</span>
        </span>
        <span className="block h-[16px] w-full overflow-hidden rounded-full bg-line-soft">
          <span
            className={`block h-full rounded-full transition-[width] duration-300 ${
              mine ? 'bg-acid' : 'bg-muted'
            }`}
            style={{ width: `${synced ? pct : 0}%` }}
          />
        </span>
      </span>
    </button>
  );
}

export function FinalChallengeDemo() {
  const vote = useVoteState();
  const stats = vote.topics[POLL_TOPIC];
  const mine = vote.yours[POLL_TOPIC];
  const counts = POLL_OPTIONS.map((option) => stats.counts[option.score - 1]);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const disabled = vote.status === 'unconfigured';

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-6">
      {/* ── 頂列：由左往右排，右上角留給浮水印 ── */}
      <div className="flex h-[56px] shrink-0 items-center gap-6">
        <span className="rounded-full bg-paper px-4 py-1 text-[18px] font-semibold text-on-accent">
          現場投票
        </span>
        <span className="text-[24px] text-paper">點一張卡片投票，再點另一張就是改票。</span>
        <span className="flex h-[44px] items-center rounded-full border border-line bg-panel px-4">
          <StatusText status={vote.status} />
        </span>
        <span className="flex items-baseline gap-2" aria-live="polite">
          <span className="font-display text-[36px] leading-none font-semibold text-paper tabular-nums">
            {vote.synced ? total : '—'}
          </span>
          <span className="text-[21px] text-muted">人投票</span>
        </span>
        {/* 測試房間（localStorage 換過房間）才出現，跟投票結果頁一致 */}
        {VOTE_ROOM !== DEFAULT_VOTE_ROOM && (
          <span className="max-w-[230px] truncate rounded-md border-2 border-warn px-3 py-1 text-[16px] text-warn">
            測試房間：{VOTE_ROOM}
          </span>
        )}
      </div>

      {/* ── 四個選項 ── */}
      <div
        role="group"
        aria-label="最後一堂課，你想看哪一類的挑戰？選一個"
        onKeyDown={stopKeys}
        className="grid h-[520px] shrink-0 grid-cols-4 gap-6"
      >
        {POLL_OPTIONS.map((option, index) => (
          <OptionCard
            key={option.score}
            option={option}
            count={counts[index]}
            total={total}
            synced={vote.synced}
            mine={mine === option.score}
            disabled={disabled}
          />
        ))}
      </div>

      {/* ── 註 ── */}
      <div className="flex h-[96px] shrink-0 items-center gap-6 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel px-8">
        <span className="shrink-0 rounded-full border-2 border-paper px-4 py-0.5 text-[19px] font-semibold text-paper">
          註
        </span>
        <p className="min-w-0 text-[24px] leading-snug text-paper">
          因為時間有限，不一定能夠在課程中做完，可能會在事前做完後，回頭介紹過程中的思路。
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 3 頁 · HomeworkDemo — 作業挑戰：替自己的開發做一個工具
 *
 * 左：這次作業要做什麼、範例、審核兩點。
 * 右：範例的實際畫面 —— 講師自己做的「AI 額度監控」截圖，旁邊一欄說明（靠底對齊）。
 * ══════════════════════════════════════════════════════════════ */

function ReviewPoint({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <div className="flex h-[84px] items-center gap-5 rounded-2xl border border-l-[6px] border-line border-l-acid bg-panel px-6">
      <span className="grid size-[48px] shrink-0 place-items-center rounded-full bg-acid font-display text-[26px] leading-none font-semibold text-on-accent tabular-nums">
        {no}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[27px] leading-tight font-semibold text-paper">{title}</span>
        <span className="text-[19px] leading-snug text-muted">{children}</span>
      </span>
    </div>
  );
}

/** 講師的 AI 額度監控截圖（原圖 680 × 928）。
 *  框 529 × 720 含 2px 邊框，內容 525 × 716，object-contain 等比縮成 0.77 倍、不變形；
 *  原圖四角是透明圓角，用 bg-paper 墊底，跟截圖的深色底接起來。 */
function QuotaShot() {
  return (
    <figure className="flex h-full min-h-0 items-end gap-6">
      <img
        src={quotaMonitorUrl}
        alt="講師做的 AI 額度監控實際畫面：更新於 17:48，每 5 分鐘自動更新。Claude Code（Max 20x）每週剩 68%；Codex（Pro Lite）每週剩 81%；Antigravity 的 Gemini 模型 5 小時剩 98%、每週剩 91%，Claude / GPT 模型 5 小時與每週都剩 100%。底部圖例：≥ 50%、20–50%、< 20%。"
        width={529}
        height={720}
        className="block h-[720px] w-[529px] shrink-0 rounded-2xl border-2 border-paper bg-paper object-contain"
      />
      <figcaption className="flex w-[220px] shrink-0 flex-col gap-3 border-t border-line pt-4">
        <span className={`${LABEL_TYPE} text-faint`}>實際畫面</span>
        <span className="text-[24px] leading-snug font-semibold text-balance text-paper">講師做的 AI 額度監控</span>
        <span className="text-[20px] leading-snug text-balance text-muted">它會讀各家的用量，依剩餘比例變色。</span>
      </figcaption>
    </figure>
  );
}

export function HomeworkDemo() {
  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[minmax(0,1fr)_773px] gap-10">
      {/* ── 左：作業說明 ── */}
      <div className="flex min-w-0 flex-col">
        <span className="w-fit rounded-full bg-acid px-4 py-1 text-[18px] font-semibold text-on-accent">
          這次的作業跟以前不一樣
        </span>
        <h3 className="mt-4 text-[38px] leading-tight font-semibold text-paper">
          為自己的開發，做一個額外的工具
        </h3>
        <p className="mt-3.5 text-[24px] leading-[1.6] text-muted">
          就像我在課程裡介紹的 CODD 一樣：不是做給別人用的產品，是讓你自己開發更順手的工具。
        </p>

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-line bg-ink-soft px-6 py-4">
          <span className={`${LABEL_TYPE} text-faint`}>簡單的範例</span>
          <p className="text-[24px] leading-snug text-paper">
            做一個很簡單的監測：看你目前各項 AI 工具的使用額度。
          </p>
          <p className="text-[19px] leading-snug text-muted">
            右邊是我自己做的版本（實際畫面），之後也會再提供一些簡單的範例。
          </p>
        </div>

        <p className={`mt-6 ${LABEL_TYPE} text-faint`}>審核兩點</p>
        <div className="mt-3 flex flex-col gap-3">
          <ReviewPoint no={1} title="有沒有成功完成">
            工具真的能用，做到你說它要做的事。
          </ReviewPoint>
          <ReviewPoint no={2} title="有沒有安全性的疑慮">
            例如：金鑰、token 寫死在程式碼裡，或把資料送到不該送的地方。
          </ReviewPoint>
        </div>

        <p className="mt-auto text-[22px] leading-snug text-paper">
          我會透過我的 AI 工具去審核你的程式碼，確認有沒有資安外洩的問題。
        </p>
      </div>

      {/* ── 右：範例的實際畫面 ── */}
      <QuotaShot />
    </div>
  );
}
