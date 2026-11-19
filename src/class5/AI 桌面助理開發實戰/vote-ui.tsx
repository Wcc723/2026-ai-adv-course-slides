import { useState, type ComponentType, type KeyboardEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { VOTE_TOPICS, type VoteTopic, type VoteTopicId } from './vote-topics';
import { DEFAULT_VOTE_ROOM, VOTE_ROOM } from './vote-config';
import {
  VOTE_SCORES,
  castVote,
  useVoteState,
  type TopicStats,
  type VoteStatus,
} from './vote-client';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰〉— 現場投票
 *
 *   第 14、16–17、19–21、24–29、31–33、37、42 頁  VoteFrame        功能頁 ＋ 底部的 1～5 分投票列（17 頁）
 *   第 47 頁                                     VoteResultsDemo  投票結果：17 個主題的即時排行，
 *                                                                  最下方是回到第 2 頁挑戰投票的連結
 *   第 2 頁的挑戰單選題（demos-front.tsx）、第 6 頁的訂閱調查（demos-subscription-poll.tsx）
 *   走同一條連線，但不算進排行。
 *
 * 這個檔只 export 元件（eslint 的 react-refresh 規則）。連線與狀態在
 * vote-client.ts（全份簡報共用一條 WebSocket），網址與房間在 vote-config.ts，
 * 伺服器是 workers/class5-vote/（Cloudflare Worker ＋ Durable Object）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * - Notion「課綱 › ChatGPT vs Claude」原文：「額外幫我建立一個 Cloudflare 的
 *   Websocket，我想要在今天介紹的功能中加入一些投票，然後分別是 1 ~ 5 分，
 *   5 分是滿分」。哪幾頁要投票由 slides.ts 的 withVote 決定，主題清單在 vote-topics.ts。
 * - 題目「這個功能對你有多實用？」與「1 分：用不到／5 分：馬上就要用」是補的文案，
 *   講師只定了 1～5 分、5 分滿分。
 * - 第 47 頁最下方的連結：講師 CODD 筆記「簡報調整」（codd://note/note-plus，2026-11-18）
 *   「最下方補一個連結，返回『最後一堂課，你想看哪一類的挑戰？』，我要再跟同學介紹一次
 *   最終課程內容」。連結文字照筆記；「第 2 頁」小標是補的。
 *
 * 查證：Cloudflare Durable Objects 文件（WebSocket Hibernation、SQLite storage、
 * State API、class migrations），查核日 2026-11-10。
 *   https://developers.cloudflare.com/durable-objects/best-practices/websockets/
 *   https://developers.cloudflare.com/durable-objects/api/state/
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid    你投的分數（實心按鈕＋分佈條上你那一格）、排行前三名（實心名次＋6px 左粗條）
 *   ok／warn／error   連線狀態點，一律附文字（已連線／連線中／離線），不只靠顏色
 *   其餘    中性色（分佈條 faint、平均分數條 muted、分類標籤 line 外框＋muted 字）
 *   篩選分類的「選中」是實心 paper 底，不另外開強調色。
 *   回到第 2 頁的連結是實心 acid（CTA），hover 換成實心 paper，字一律 on-accent。
 *   淡底（acid/14）只出現在前三名的列與按鈕 hover，前三名一定配實心名次與左粗條。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768）
 * ──────────────────────────────────────────────────────────────
 *   VoteFrame  根容器 h-[748px] ＝ demo 640 ＋ gap 20 ＋ 投票列 88。
 *              投票列寬 1400：左右 padding 52 ＋ 題目 290 ＋ 按鈕 5 × 64 ＋ 4 × 12
 *              ＋ 分隔線 1 ＋ 平均／票數 204 ＋ 分佈 114 ＋ 狀態最長約 180 ＋ gap 7 × 32 ≈ 1385。
 *              按鈕 64 × 64（舞台像素），按下或改票都不改變任何尺寸。
 *   VoteResultsDemo  根容器 h-[720px] max-w-[1740px]
 *              頂列 56 ＋ 9 ＋ 欄名 28 ＋ 9 ＋ 清單 17 列 × 33 ＝ 561 ＋ 9 ＋ 連結列 48 ＝ 720。
 *              （補回 Environments 從 15 列變 16 列時，頂列 64 收成 56、每列 40 收成 38；
 *              2026-11-18 多了 Mini 寵物（17 列）又在最下方補連結列，每列再收成 33、
 *              間距 12 收成 9。字級都沒動：列內最高的是名次方塊 30、平均 30px 的數字
 *              與 28 高的分佈條，33 還放得下。）
 *              篩選分類只會讓列變少，清單高度固定 561，連結列永遠在最下方。
 *              頂列由左往右排，最長（含測試房間標籤）約 1450，右側留 ≥ 280 給浮水印。
 *   沒有任何容器會捲動。投票列在頁面底部置中，離右上角的浮水印最遠。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

/**
 * 第 2 頁「最後一堂課，你想看哪一類的挑戰？」（slides.ts 的 id 'final-challenge'）。
 * slides.ts 會 import 這個檔，這裡不能反過來 import steps（循環引用），
 * 所以頁碼寫死；slides.ts 調整開場頁序時要一起改。
 */
const FINAL_CHALLENGE_STEP = 2;

const LABEL_TYPE = 'font-display text-[16px] tracking-[0.14em] uppercase';

const STATUS: Record<VoteStatus, { label: string; dot: string }> = {
  connecting: { label: '連線中', dot: 'bg-warn' },
  open: { label: '已連線', dot: 'bg-ok' },
  offline: { label: '離線・重新連線中', dot: 'bg-error' },
  unconfigured: { label: '投票伺服器尚未設定', dot: 'bg-faint' },
};

function StatusText({ status }: { status: VoteStatus }) {
  const { label, dot } = STATUS[status];
  return (
    <span role="status" className="flex shrink-0 items-center gap-2.5 text-[17px] text-muted">
      <span aria-hidden className={`size-[12px] shrink-0 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/** 投票列與篩選列的按鍵不能讓簡報翻頁（空白鍵、方向鍵） */
function stopKeys(event: KeyboardEvent) {
  event.stopPropagation();
}

/** 按完就放掉焦點，避免之後按空白鍵重複觸發這個按鈕 */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.blur();
}

/**
 * 連結被鍵盤聚焦時：Enter 照連結原本的行為前往，空白鍵也當成點擊（像按鈕一樣），
 * 兩個鍵都不往上傳，不會讓簡報翻頁。（同 demos-antigravity.tsx 的 keepActivationKeys，
 * 多了空白鍵觸發點擊，因為 <a> 預設只吃 Enter。）
 */
function activateLinkKeys(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

function formatAvg(stats: TopicStats, synced: boolean): string {
  return synced && stats.total > 0 ? stats.avg.toFixed(1) : '—';
}

/** 五格分佈：高度代表票數（相對於這一題最多的那一格），你投的那格是 acid */
function Distribution({
  counts,
  mine,
  height,
}: {
  counts: TopicStats['counts'];
  mine?: number;
  height: number;
}) {
  const peak = Math.max(1, ...counts);
  return (
    <span className="flex items-end gap-1.5" style={{ height: `${height}px` }}>
      {counts.map((count, index) => {
        const score = index + 1;
        const barHeight = count > 0 ? Math.max(4, Math.round((count / peak) * height)) : 3;
        const tone = mine === score ? 'bg-acid' : count > 0 ? 'bg-faint' : 'bg-line';
        return (
          <span
            key={score}
            title={`${score} 分：${count} 票`}
            className={`w-[18px] shrink-0 rounded-t-[3px] transition-[height] duration-300 ${tone}`}
            style={{ height: `${barHeight}px` }}
          />
        );
      })}
    </span>
  );
}

function ScoreLabels() {
  return (
    <span className="flex gap-1.5" aria-hidden>
      {VOTE_SCORES.map((score) => (
        <span
          key={score}
          className="w-[18px] text-center text-[16px] leading-none text-faint tabular-nums"
        >
          {score}
        </span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * VoteFrame — 功能頁 ＋ 底部投票列
 *
 * 上：被包的 demo（根容器高度上限 640）。
 * 下：題目｜1～5 五顆按鈕｜即時平均、票數｜五格分佈｜連線狀態。
 * 一進頁面就看得到目前的平均與票數；按一顆就投票，再按另一顆就是改票。
 * ══════════════════════════════════════════════════════════════ */

function VoteBar({ topic }: { topic: VoteTopicId }) {
  const vote = useVoteState();
  const stats = vote.topics[topic];
  const mine = vote.yours[topic];
  const disabled = vote.status === 'unconfigured';

  return (
    <div
      role="group"
      aria-label="這個功能對你有多實用？1 到 5 分"
      onKeyDown={stopKeys}
      className="flex h-[88px] w-[1400px] max-w-full shrink-0 items-center gap-8 rounded-2xl border border-line bg-ink pr-6 pl-7"
    >
      {/* 題目 */}
      <div className="flex w-[290px] shrink-0 flex-col gap-1.5">
        <p className="text-[24px] leading-tight font-semibold text-paper">
          這個功能對你有多實用？
        </p>
        <p className="flex gap-4 text-[17px] leading-tight text-faint">
          <span>1 分：用不到</span>
          <span>5 分：馬上就要用</span>
        </p>
      </div>

      {/* 1～5 分 */}
      <div className="flex shrink-0 items-center gap-3">
        {VOTE_SCORES.map((score) => {
          const on = mine === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              aria-label={`${score} 分`}
              onClick={(event) => {
                castVote(topic, score);
                blurAfterClick(event);
              }}
              className={`grid size-[64px] shrink-0 place-items-center rounded-xl border-2 font-display text-[30px] leading-none font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid disabled:cursor-not-allowed ${
                on
                  ? 'border-acid bg-acid text-on-accent'
                  : 'border-line bg-panel text-paper enabled:hover:border-acid enabled:hover:bg-acid/14 enabled:hover:text-acid disabled:text-faint'
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>

      <span aria-hidden className="h-[52px] w-px shrink-0 bg-line" />

      {/* 即時平均、票數 */}
      <div className="flex shrink-0 items-end gap-6" aria-live="polite">
        <span className="flex w-[84px] flex-col gap-1.5">
          <span className="text-[16px] leading-none text-faint">平均</span>
          <span className="font-display text-[40px] leading-none font-semibold text-paper tabular-nums">
            {formatAvg(stats, vote.synced)}
          </span>
        </span>
        <span className="flex w-[96px] flex-col gap-1.5">
          <span className="text-[16px] leading-none text-faint">票數</span>
          <span className="font-display text-[40px] leading-none font-semibold text-paper tabular-nums">
            {vote.synced ? stats.total : '—'}
          </span>
        </span>
      </div>

      {/* 五格分佈 */}
      <span className="flex shrink-0 flex-col items-center gap-1.5" aria-hidden>
        <Distribution counts={stats.counts} mine={mine} height={40} />
        <ScoreLabels />
      </span>

      <span className="ml-auto">
        <StatusText status={vote.status} />
      </span>
    </div>
  );
}

export function VoteFrame({ Demo, topic }: { Demo: ComponentType; topic: VoteTopicId }) {
  return (
    <div className="flex h-[748px] w-full flex-col items-center gap-5">
      <div className="flex h-[640px] w-full shrink-0 items-center justify-center">
        <Demo />
      </div>
      <VoteBar topic={topic} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 最後一頁 · VoteResultsDemo — 投票結果
 *
 * 17 個主題依平均分數排序（同分比票數），票數 0 的排最後並標「還沒有人投」。
 * 名次是全體排名（並列同名次），篩選分類時名次不變，前三名一定看得出來。
 * 頂列：連線狀態、總投票人次、投過的人數與目前在線人數、分類篩選。
 * 最下方：回到第 2 頁「最後一堂課，你想看哪一類的挑戰？」的連結。
 *   SlideTemplate 用網址的 ?s=N 決定目前是第幾頁（換頁是 setSearchParams replace），
 *   這裡用 <Link to={{ search: '?s=2' }} replace>，跟鍵盤翻頁一樣只換 ?s、不多一筆瀏覽紀錄；
 *   頁面是 hash router，href 會是 #/class5/ai-desktop-assistant?s=2。
 * ══════════════════════════════════════════════════════════════ */

type Group = VoteTopic['group'];
type Filter = '全部' | Group;

const FILTERS: readonly Filter[] = ['全部', '共有', 'ChatGPT', 'Claude', 'Google', '卡斯伯'];

const GRID = 'grid-cols-[64px_128px_minmax(0,1fr)_320px_84px_96px_114px]';

interface RankedRow {
  topic: VoteTopic;
  stats: TopicStats;
  rank: number | null;
}

function rankTopics(topics: Readonly<Record<VoteTopicId, TopicStats>>): RankedRow[] {
  const rows = VOTE_TOPICS.map((topic, order) => ({ topic, order, stats: topics[topic.id] }));
  rows.sort((a, b) => {
    const aEmpty = a.stats.total === 0;
    const bEmpty = b.stats.total === 0;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    if (b.stats.avg !== a.stats.avg) return b.stats.avg - a.stats.avg;
    if (b.stats.total !== a.stats.total) return b.stats.total - a.stats.total;
    return a.order - b.order;
  });

  let rank = 0;
  return rows.map((row, index) => {
    if (row.stats.total === 0) return { topic: row.topic, stats: row.stats, rank: null };
    const before = rows[index - 1];
    const tied =
      before !== undefined &&
      before.stats.avg === row.stats.avg &&
      before.stats.total === row.stats.total;
    if (!tied) rank = index + 1;
    return { topic: row.topic, stats: row.stats, rank };
  });
}

function RankRow({ row }: { row: RankedRow }) {
  const { topic, stats, rank } = row;
  const empty = rank === null;
  const top = rank !== null && rank <= 3;

  return (
    <li
      className={`grid h-[33px] shrink-0 ${GRID} items-center gap-6 border-b border-l-[6px] border-b-line-soft pr-5 pl-3 ${
        top ? 'border-l-acid bg-acid/14' : 'border-l-transparent'
      }`}
    >
      {/* 名次 */}
      <span className="flex items-center">
        {top ? (
          <span className="grid h-[30px] w-[46px] place-items-center rounded-md bg-acid font-display text-[22px] leading-none font-semibold text-on-accent tabular-nums">
            {rank}
          </span>
        ) : (
          <span className="w-[46px] text-center font-display text-[22px] leading-none text-faint tabular-nums">
            {rank ?? '—'}
          </span>
        )}
      </span>

      {/* 分類 */}
      <span className="flex items-center">
        <span className="inline-flex h-[26px] items-center rounded-full border border-line px-3 text-[16px] leading-none text-muted">
          {topic.group}
        </span>
      </span>

      {/* 主題 */}
      <span
        className={`truncate text-[24px] leading-tight ${
          empty ? 'text-muted' : 'text-paper'
        } ${top ? 'font-semibold' : ''}`}
      >
        {topic.label}
      </span>

      {/* 平均分數條（0–5） */}
      {empty ? (
        <span className="text-[19px] text-faint">還沒有人投</span>
      ) : (
        <span className="relative h-[14px] w-full overflow-hidden rounded-full bg-ink-soft">
          <span
            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${
              top ? 'bg-acid' : 'bg-muted'
            }`}
            style={{ width: `${(stats.avg / 5) * 100}%` }}
          />
        </span>
      )}

      {/* 平均 */}
      <span className="font-display text-[30px] leading-none font-semibold text-paper tabular-nums">
        {empty ? '—' : stats.avg.toFixed(1)}
      </span>

      {/* 票數 */}
      <span className="text-[19px] text-muted tabular-nums">{stats.total} 票</span>

      {/* 分佈 */}
      <Distribution counts={stats.counts} height={28} />
    </li>
  );
}

export function VoteResultsDemo() {
  const vote = useVoteState();
  const [filter, setFilter] = useState<Filter>('全部');

  const ranked = rankTopics(vote.topics);
  const rows = filter === '全部' ? ranked : ranked.filter((row) => row.topic.group === filter);
  const totalVotes = VOTE_TOPICS.reduce((sum, topic) => sum + vote.topics[topic.id].total, 0);
  const isTestRoom = VOTE_ROOM !== DEFAULT_VOTE_ROOM;

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-[9px]">
      {/* ── 頂列：狀態、總數、篩選（全部靠左，右上角留給浮水印） ── */}
      <div className="flex h-[56px] shrink-0 items-center gap-7">
        <span className="flex h-[44px] items-center rounded-full border border-line bg-panel px-4">
          <StatusText status={vote.status} />
        </span>

        <p className="flex items-baseline gap-2.5" aria-live="polite">
          <span className="font-display text-[44px] leading-none font-semibold text-paper tabular-nums">
            {vote.synced ? totalVotes : '—'}
          </span>
          <span className="text-[22px] text-muted">人次投票</span>
        </p>

        <p className="text-[20px] text-muted tabular-nums">
          {/* voters 是伺服器算的不重複 clientId，含只投第 2 頁挑戰題、第 6 頁訂閱調查的人，
              所以寫「參與」不寫「投過」 */}
          {vote.synced ? `${vote.voters} 人參與（含第 2、6 頁）・${vote.online} 人在線` : '等待伺服器回應'}
        </p>

        <div
          role="group"
          aria-label="依分類篩選"
          onKeyDown={stopKeys}
          className="flex shrink-0 items-center gap-2"
        >
          {FILTERS.map((item) => {
            const on = item === filter;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={(event) => {
                  setFilter(item);
                  blurAfterClick(event);
                }}
                className={`h-[40px] rounded-full border-2 px-4 text-[19px] leading-none transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid ${
                  on
                    ? 'border-paper bg-paper font-semibold text-on-accent'
                    : 'border-line bg-panel text-muted hover:border-paper hover:text-paper'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {isTestRoom && (
          <span className="max-w-[230px] truncate rounded-md border-2 border-warn px-3 py-1 text-[16px] text-warn">
            測試房間：{VOTE_ROOM}
          </span>
        )}
      </div>

      {/* ── 欄名 ───────────────────────────────────────────── */}
      <div
        className={`grid h-[28px] shrink-0 ${GRID} items-center gap-6 border-b border-l-[6px] border-b-line border-l-transparent pr-5 pl-3`}
      >
        <span className={`${LABEL_TYPE} w-[46px] text-center text-faint`}>名次</span>
        <span className={`${LABEL_TYPE} text-faint`}>分類</span>
        <span className={`${LABEL_TYPE} text-faint`}>主題</span>
        <span className={`${LABEL_TYPE} text-faint`}>平均分數（滿分 5）</span>
        <span className={`${LABEL_TYPE} text-faint`}>平均</span>
        <span className={`${LABEL_TYPE} text-faint`}>票數</span>
        <ScoreLabels />
      </div>

      {/* ── 排行：17 列 × 33 ──────────────────────────────── */}
      <ol className="flex h-[561px] shrink-0 flex-col">
        {rows.map((row) => (
          <RankRow key={row.topic.id} row={row} />
        ))}
      </ol>

      {/* ── 最下方：回到第 2 頁的挑戰投票 ─────────────────────── */}
      <div className="flex h-[48px] shrink-0 items-center">
        <Link
          to={{ search: `?s=${FINAL_CHALLENGE_STEP}` }}
          replace
          onKeyDown={activateLinkKeys}
          className="flex h-[48px] items-center gap-4 rounded-xl border-2 border-acid bg-acid pr-3 pl-5 text-on-accent transition-colors duration-150 hover:border-paper hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid"
        >
          <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            {/* 往回的箭頭 */}
            <path
              d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[22px] leading-none font-semibold">
            回到：最後一堂課，你想看哪一類的挑戰？
          </span>
          <span className="rounded-full border-2 border-on-accent px-3 py-0.5 text-[17px] leading-tight font-semibold">
            第 2 頁
          </span>
        </Link>
      </div>
    </div>
  );
}
