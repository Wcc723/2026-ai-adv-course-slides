import { useState } from 'react';
import coverUrl from './images/cover.png';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 開場、課程大綱、章節頁、怎麼開啟 SubAgent
 *
 *   第 1 頁                    CoverDemo        封面（bare，左標題、右 Codex 插圖）
 *   第 2 頁                    AgendaDemo       課程大綱：六章，點一章看包含哪些頁
 *   第 3/11/15/23/28/40 頁     Chapter1Cover … Chapter6Cover  章節頁（bare）
 *   第 10 頁                   HowToOpenDemo    在 ChatGPT 與 Claude Code 開啟 SubAgent
 *
 * 原本最後一頁是 RecapDemo（重點回顧：每章一句帶走的重點），2026-10-13 依 Notion
 * 「1013 修改」的「p39 ~ 43 移除」跟第六章一起拿掉，CHAPTERS 的 `takeaway` 欄位
 * 也一併刪除。原始碼在 _backup/2026-10-13-class4-before-1013.tar.gz。
 *
 * 封面與章節頁照〈5 種 SubAgent 協作模式〉demos-intro.tsx 的 CoverDemo／
 * LevelCover 寫法，不用 `title` 版型：`title` 的圖框是為 SVG 素材準備的 420px
 * `bg-paper` 深色底板，這份的插圖是紙面風格的橫幅點陣圖，放進去會被壓成
 * 小方塊。字級照抄 `SlideBodyView` 的 TitleBody（kicker 22、大標 92、導言 26）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（Notion「課綱 › AI 協作進階－SubAgents 與外部服務整合」）
 * ──────────────────────────────────────────────────────────────
 * - 六章的章名與導言是依各章 callout 歸納的，意思沒有加東西。
 *   第六章原本是「外部服務整合」（2026-10-06 加的），2026-10-13 依「1013 修改」
 *   整章拿掉，換成「近期的分享」：Notion 原文的小標是「加入『近期的分享』」，
 *   底下三段是遠端工具更新 CODD、專案管理（GitHub Projects）、本地算力運用。
 *   章名照小標；summary、lead、brief 是照這三段歸納的。
 * - 第五章 callout 原文：「注意，這是一個 “概念”，並沒有絕對的做法」，
 *   原句放在章節頁的提示框裡（引號改成「」）。
 * - 第 10 頁 callout 原文：「在 ChatGPT 及 Claude Code 如何開啟 SubAgent／
 *   參考課程（只需要一個連結）」。單元資訊：
 *     單元  什麼是 SubAgent、什麼時候用 SubAgent
 *     課程  2026 AI 開發進化營
 *     章節  Claude Code 與 Codex 的 SubAgent
 *   卡片上那句「操作步驟這個單元示範過，課堂上不重複」是講師交辦的說明，
 *   除此之外沒有補任何單元內容。
 * - 第 2 頁的頁面標題照 slides.ts 的頁序手寫在 CHAPTERS 的 `pages`（不能 import
 *   slides.ts，會循環引用）。頁碼是從 `pages` 的長度算出來的：
 *     第 1 頁封面、第 2 頁大綱，第 3 頁起每一章 ＝ 章節頁 1 頁 ＋ 內容頁。
 *   ⚠ slides.ts 增刪或調換頁面時，這裡的 `pages` 要一起改，頁碼才會對。
 *
 * 補的示意：
 * - 封面插圖 images/cover.png 是 Codex Image 產的（主 Agent 把任務卡交給
 *   SubAgent、旁邊的手冊代表 Skill、筆電接出去的插頭線代表 MCP），
 *   裁成 1300×813（16:10）。圖裡沒有文字。
 * - 第五章的導言後半「從傳統 AI Coding 的回圈出發⋯」是照 slides.ts 第五章
 *   的頁序寫的，callout 本身只有那句提醒。第四章的導言「怎麼開啟、怎麼分工」
 *   也是照頁序補的。
 * - 第 2 頁左欄每章那一句（`brief`）是照該章的頁面歸納的。
 * - 封面導言第二段的結尾原本是「最後接上外部服務」，第六章換掉之後改成
 *   「最後分享近期實際在用的做法」。
 * - 第 10 頁卡片左側的影片框是裝飾用的 SVG，不代表單元的實際畫面。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   封面、章節頁  只有 acid（kicker、目前這一章、第五章的提醒）。
 *   第 2 頁       只有 acid（選取的那一章）；其他一律中性色。
 *   第 10 頁      只有 blue（連結，跟其他簡報的連結卡一致）；
 *                 ChatGPT／Claude Code 兩個小標籤是中性色，不另外開色。
 *   淡底（/14）一律配 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 *   封面（bare，內容區 1824 × 848）
 *     左欄 ≈ kicker 30 ＋ 20 ＋ 大標 94 ＋ 16 ＋ 副標 62 ＋ 32
 *            ＋ 導言兩段（46 × 1 ＋ 20 ＋ 46 × 2）≈ 414（實測 414，第二段剛好兩行）
 *     右欄  插圖框 960 × 600（16:10，跟圖片同比例，不會留黑邊）
 *   章節頁（bare）
 *     左欄 ≈ kicker 30 ＋ 20 ＋ 大標 94（換行也只到 188）＋ 32 ＋ 主句 48–96
 *            ＋ 20 ＋ 導言 46–92 ＋ 第五章提示框 40 ＋ 92 ≈ 最多 610
 *     右欄  六列 × 70 ＋ gap 12 × 5 ≈ 480（實測 480）
 *     第五章的導言用 `\n` 指定在「怎麼改變，」之後換行，不然第二行只剩「些邊界。」
 *   第 2、10 頁（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]）
 *     第 2 頁   左欄六列平分 720（gap 10 × 5）→ 每列 ≈ 112，內容 章名 33 ＋ 4 ＋ 一句 26
 *               右卡 py-8 → 內高 656：標籤 25 ＋ 8 ＋ 章名 48 ＋ 24
 *               ＋ 頁面清單（最多第五章 11 列 × 48）≈ 634
 *               第五章原本 10 列 × 52（下緣離卡片內緣 26），2026-10-13 多了 loop.md
 *               變成 11 列，列高才從 52 降到 48。
 *     第 10 頁  連結卡 p-12 上下 96 ＋ 頂列 36 ＋ 32 ＋ 課程路徑 32 ＋ 12
 *               ＋ 單元標題（預留兩行）120 ＋ 28 ＋ 兩邊都有教 44 ＋ 28
 *               ＋ 網址框 62 ＋ 28 ＋ 按鈕 60 ＋ 32 ＋ 底部說明 58 ≈ 668
 *   沒有任何容器會捲動。浮水印在右上角：第 10 頁的卡片寬 1440 置中，
 *   右上角兩邊都留約 150 的空白，標籤也不放在卡片右上；第 2 頁右卡的
 *   標題列靠左，右上角沒有東西。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/* ── 六章 ───────────────────────────────────────────────── */

type ChapterNo = 1 | 2 | 3 | 4 | 5 | 6;

interface Chapter {
  no: ChapterNo;
  name: string;
  /** 章節頁的主句（30px paper） */
  summary: string;
  /** 章節頁的導言（26px muted）。`\n` 是指定的換行點，避免最後一行只剩幾個字 */
  lead: string;
  /** 課程大綱左欄那一句（19px，一行放得下） */
  brief: string;
  /** 這一章的內容頁標題（不含章節頁），照 slides.ts 的頁序 */
  pages: readonly string[];
}

const CHAPTERS: readonly Chapter[] = [
  {
    no: 1,
    name: 'SubAgent 是什麼',
    summary: '先認識主 Agent 與 SubAgent',
    lead: '再回頭看 Context Window，理解為什麼要把工作交出去。',
    brief: '主 Agent、SubAgent，以及為什麼要把工作交出去',
    pages: [
      '先認識主 Agent',
      'SubAgent 是什麼？',
      'SubAgent 的概念',
      '還記得 Context Window 嗎？',
      '什麼情況會塞爆 Context',
      '所以使用 SubAgent 的好處是？',
      '在 ChatGPT 與 Claude Code 開啟 SubAgent',
    ],
  },
  {
    no: 2,
    name: 'SubAgent、Skill 與 MCP',
    summary: '三個常被放在一起講的東西',
    lead: '它們各自解決什麼問題，又怎麼一起用。',
    brief: '三者各自解決什麼問題，又怎麼一起用',
    pages: [
      'SubAgent 跟 Skill、MCP 不同之處',
      'SubAgent、Skill、MCP 可以混合使用',
      '需要建立 SubAgent 嗎？',
    ],
  },
  {
    no: 3,
    name: '實際使用 SubAgent',
    summary: 'Claude Code 與 ChatGPT 各有哪些 SubAgent、怎麼呼叫',
    lead: '什麼時候該自己定義一個，以及使用 SubAgent 的代價。',
    brief: 'Claude Code 與 ChatGPT 怎麼用、何時要自訂',
    pages: [
      'Claude Code 的 SubAgent 分類',
      'Claude Code 的 SubAgent 呼叫方式',
      'ChatGPT（Codex）的 SubAgent 分類',
      'ChatGPT（Codex）的 SubAgent 呼叫方式',
      '絕大部分通用型就夠用',
      '什麼時候該用自訂型',
      'SubAgent 的缺點',
    ],
  },
  {
    no: 4,
    name: 'Claude Code 的 Ultracode',
    summary: '一次派出數十個 SubAgent 的工作方式',
    lead: '怎麼開啟、怎麼分工，以及實際用起來的心得。',
    brief: '讓 Claude Code 自己決定要派出多少 SubAgent',
    pages: [
      'Ultracode（dynamic workflows）',
      '開啟 Ultracode',
      'Ultracode 怎麼分工',
      'Ultracode 實際使用心得',
    ],
  },
  {
    no: 5,
    name: 'Loop Engineering',
    summary: '讓 Agent 持續循環工作、驗證、修正',
    lead: '從傳統 AI Coding 的回圈出發，看工程師的角色怎麼改變，\n以及實際怎麼做、要守住哪些邊界。',
    brief: '讓 Agent 持續循環工作、驗證、修正',
    pages: [
      'Loop Engineering',
      'AI Coding 工程師做什麼',
      'Loop Engineering 工程師做什麼',
      '具體怎麼做：重新定義 SDD',
      '觸發方式：不只 Prompt',
      '定時觸發的三種方案',
      'loop.md：給 /loop 一份預設工作',
      '其他觸發方式',
      'Goal：往同一個方向持續開發',
      '邊界：經常發生的狀況',
      'Loop Engineering 的風險',
    ],
  },
  {
    no: 6,
    name: '近期的分享',
    summary: '最近實際在用的工具與做法',
    lead: '遠端管理 Claude Code 的 CODD、用 GitHub Projects 帶著 AI 大量開發，\n以及本地算力的玩法。',
    brief: 'CODD、GitHub Projects 與本地算力',
    pages: [
      '遠端工具更新：CODD',
      '專案管理：用 GitHub Projects',
      '開發流程：哪些在 GitHub、哪些在 Claude',
      '本地算力運用',
    ],
  },
];

/** 第 1 頁封面、第 2 頁課程大綱，第 3 頁開始是第一章的章節頁 */
const FIRST_CHAPTER_PAGE = 3;

/** 每一章章節頁的頁碼：前一章的章節頁 ＋ 1 ＋ 前一章的內容頁數 */
const CHAPTER_PAGE: readonly number[] = CHAPTERS.map((_, index) =>
  CHAPTERS.slice(0, index).reduce(
    (page, before) => page + 1 + before.pages.length,
    FIRST_CHAPTER_PAGE,
  ),
);

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ══════════════════════════════════════════════════════════════
 * 第 1 頁 · CoverDemo
 * ══════════════════════════════════════════════════════════════ */

export function CoverDemo() {
  return (
    <div className="flex h-full w-full items-center gap-16">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          SubAgents & External Services
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          AI 協作進階
        </h2>
        <p className="mt-4 font-display text-[52px] leading-[1.2] font-semibold tracking-tight text-paper">
          SubAgents 與外部服務整合
        </p>
        <p className="mt-8 max-w-[760px] text-[26px] leading-[1.75] text-muted">
          跟你對話的主 Agent，不必什麼事都自己做。
        </p>
        <p className="mt-5 max-w-[760px] text-[26px] leading-[1.75] text-muted">
          把工作交給 SubAgent、搭配 Skill 與 MCP，一路走到 Ultracode、Loop
          Engineering，最後分享近期實際在用的做法。
        </p>
      </div>
      <div className="grid h-[600px] w-[960px] shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-panel">
        <img
          src={coverUrl}
          alt="主 Agent 把任務卡交給坐在桌前的 SubAgent；旁邊攤開一本手冊，筆電接出一條線連到瀏覽器、資料庫與雲端服務"
          className="size-full object-contain"
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 2 頁 · AgendaDemo — 課程大綱
 *
 * 左：六章（章節編號＋章名＋一句話），視覺沿用章節頁右欄的清單與 MenuItem
 *     的選取樣式；六列用 flex-1 平分 720px 的高度。
 * 右：選到的那一章包含哪些頁面（頁碼＋標題），頁碼由 CHAPTER_PAGE 算出。
 * 一進頁面停在第一章。用色：只有 acid（選取）。
 * ══════════════════════════════════════════════════════════════ */

export function AgendaDemo() {
  const [current, setCurrent] = useState<ChapterNo>(1);
  const chapter = CHAPTERS[current - 1];
  const firstPage = CHAPTER_PAGE[current - 1] + 1;
  const lastPage = firstPage + chapter.pages.length - 1;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[660px_1fr] gap-8">
      {/* ── 左：六章 ─────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-2.5">
        {CHAPTERS.map((item) => {
          const on = item.no === current;
          return (
            <button
              key={item.no}
              type="button"
              onClick={() => setCurrent(item.no)}
              aria-current={on}
              className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                on
                  ? 'border-acid border-l-acid bg-acid/14'
                  : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
              }`}
            >
              <span
                className={`w-12 shrink-0 font-display text-[32px] leading-none font-semibold tabular-nums ${
                  on ? 'text-acid' : 'text-faint'
                }`}
              >
                {pad2(item.no)}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span
                  className={`text-[26px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}
                >
                  {item.name}
                </span>
                <span
                  className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}
                >
                  {item.brief}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 右：這一章有哪些頁 ───────────────────────────── */}
      <div
        key={current}
        className="slide-enter flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-10 py-8"
      >
        <div className="flex items-baseline gap-5">
          <span className={`${LABEL_TYPE} text-acid`}>Chapter {pad2(current)}</span>
          <span className="text-[19px] text-faint">
            第 {firstPage}–{lastPage} 頁 · 共 {chapter.pages.length} 頁
          </span>
        </div>
        <h3 className="mt-2 text-[38px] leading-tight font-semibold text-paper">
          {chapter.name}
        </h3>

        <ol className="mt-6 flex flex-col border-t border-line">
          {chapter.pages.map((title, index) => (
            <li
              key={title}
              className="grid h-[48px] shrink-0 grid-cols-[72px_1fr] items-center border-b border-line-soft"
            >
              <span className="font-mono text-[19px] text-faint tabular-nums">
                {pad2(firstPage + index)}
              </span>
              <span className="truncate text-[24px] text-paper">{title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 章節頁 · Chapter1Cover … Chapter6Cover
 *
 * 左邊是 TitleBody 的字級；右邊一條六章的進度，目前這一章 acid 粗條。
 * 第五章多一個提示框：Loop Engineering 是概念，不是固定的做法。
 * ══════════════════════════════════════════════════════════════ */

function LoopNotice() {
  return (
    <div className="mt-10 flex max-w-[1000px] items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-7 py-5">
      <span className="shrink-0 rounded-full bg-acid px-4 py-1 text-[20px] font-semibold text-on-accent">
        注意
      </span>
      <p className="text-[28px] leading-normal text-paper">
        這是一個「<span className="font-semibold text-acid">概念</span>
        」，並沒有絕對的做法。
      </p>
    </div>
  );
}

function ChapterCover({ no }: { no: ChapterNo }) {
  const chapter = CHAPTERS[no - 1];

  return (
    <div className="flex h-full w-full items-center gap-20">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          Chapter {pad2(no)}
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          {chapter.name}
        </h2>
        <p className="mt-8 max-w-[1000px] text-[30px] leading-[1.6] font-medium text-paper">
          {chapter.summary}
        </p>
        <p className="mt-5 max-w-[1000px] text-[26px] leading-[1.75] whitespace-pre-line text-muted">
          {chapter.lead}
        </p>
        {no === 5 && <LoopNotice />}
      </div>

      <ol className="flex w-[540px] shrink-0 flex-col gap-3">
        {CHAPTERS.map((item) => {
          const active = item.no === no;
          return (
            <li
              key={item.no}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-5 rounded-xl border border-l-[6px] px-6 py-4 ${
                active
                  ? 'border-acid border-l-acid bg-acid/14'
                  : 'border-line border-l-line bg-panel'
              }`}
            >
              <span
                className={`font-display text-[28px] leading-none font-semibold tabular-nums ${
                  active ? 'text-acid' : 'text-faint'
                }`}
              >
                {pad2(item.no)}
              </span>
              <span
                className={`text-[24px] ${
                  active ? 'font-medium text-paper' : 'text-muted'
                }`}
              >
                {item.name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Chapter1Cover() {
  return <ChapterCover no={1} />;
}

export function Chapter2Cover() {
  return <ChapterCover no={2} />;
}

export function Chapter3Cover() {
  return <ChapterCover no={3} />;
}

export function Chapter4Cover() {
  return <ChapterCover no={4} />;
}

export function Chapter5Cover() {
  return <ChapterCover no={5} />;
}

export function Chapter6Cover() {
  return <ChapterCover no={6} />;
}

/* ══════════════════════════════════════════════════════════════
 * 第 10 頁 · HowToOpenDemo — 在 ChatGPT 與 Claude Code 開啟 SubAgent
 *
 * callout 只要一個連結，所以整頁就是一張大的連結卡（整張是 <a>，新分頁開啟）：
 * 左邊一個影片框的裝飾，右邊寫清楚單元標題、所屬課程與章節、網址。
 * 「ChatGPT（Codex）」「Claude Code」兩個小標籤表示這個單元兩邊都有教 ——
 * 章節名稱寫的是 Codex，就是 ChatGPT 的 coding agent，這份簡報的第三章也是
 * 用「ChatGPT（Codex）」這個寫法。
 * ══════════════════════════════════════════════════════════════ */

const LESSON = {
  course: '2026 AI 開發進化營',
  chapter: 'Claude Code 與 Codex 的 SubAgent',
  title: '什麼是 SubAgent、什麼時候用 SubAgent',
  host: 'courses.hexschool.com',
  path: '/courses/2026-ai/lectures/66408383',
} as const;

const LESSON_URL = `https://${LESSON.host}${LESSON.path}`;

const TOOLS = ['ChatGPT（Codex）', 'Claude Code'] as const;

/** 卡片左側的影片框：純裝飾，不代表單元的實際畫面 */
function LessonGlyph() {
  const blue = 'var(--color-blue)';
  const line = 'var(--color-line)';
  const inkSoft = 'var(--color-ink-soft)';
  const panel = 'var(--color-panel)';
  const muted = 'var(--color-muted)';

  return (
    <svg
      width={300}
      height={300}
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden="true"
    >
      {/* 影片框 */}
      <rect x={10} y={40} width={280} height={190} rx={18} fill={inkSoft} stroke={blue} strokeWidth={3} />
      <line x1={10} y1={78} x2={290} y2={78} stroke={line} strokeWidth={2} />
      {[34, 54, 74].map((cx) => (
        <circle key={cx} cx={cx} cy={59} r={6} fill={line} />
      ))}

      {/* 播放鍵 */}
      <circle cx={150} cy={150} r={40} fill={blue} />
      <path d="M138 128 L170 150 L138 172 Z" fill={panel} />

      {/* 進度條 */}
      <line x1={36} y1={206} x2={264} y2={206} stroke={line} strokeWidth={6} strokeLinecap="round" />
      <line x1={36} y1={206} x2={120} y2={206} stroke={blue} strokeWidth={6} strokeLinecap="round" />
      <circle cx={120} cy={206} r={9} fill={blue} />

      {/* 單元清單 */}
      {[256, 280].map((y, index) => (
        <g key={y}>
          <rect x={14} y={y - 8} width={16} height={16} rx={4} stroke={index === 0 ? blue : muted} strokeWidth={2.5} />
          <line
            x1={44}
            y1={y}
            x2={index === 0 ? 236 : 196}
            y2={y}
            stroke={index === 0 ? blue : line}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

export function HowToOpenDemo() {
  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center justify-center">
      <a
        href={LESSON_URL}
        target="_blank"
        rel="noreferrer"
        className="group flex w-[1440px] items-center gap-14 rounded-3xl border-2 border-blue/70 bg-panel p-12 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
      >
        <div className="flex w-[300px] shrink-0 items-center justify-center">
          <LessonGlyph />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-blue" />
            <span className="font-display text-[17px] tracking-[0.16em] text-blue uppercase">
              參考課程單元
            </span>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-x-3 text-[22px] leading-snug text-muted">
            <span>{LESSON.course}</span>
            <span aria-hidden="true" className="text-faint">
              ›
            </span>
            <span>{LESSON.chapter}</span>
          </p>

          <h3 className="mt-3 text-[48px] leading-[1.25] font-semibold text-paper">
            {LESSON.title}
          </h3>

          <div className="mt-7 flex items-center gap-3">
            <span className="text-[20px] text-muted">這個單元兩邊都有教</span>
            {TOOLS.map((name) => (
              <span
                key={name}
                className="rounded-lg border border-line bg-ink-soft px-3.5 py-1.5 text-[19px] text-paper"
              >
                {name}
              </span>
            ))}
          </div>

          <p className="mt-7 rounded-2xl border border-line-soft bg-ink-soft px-6 py-4 font-mono text-[19px] leading-[1.55] break-all">
            <span className="text-muted">{LESSON.host}</span>
            <span className="font-semibold text-blue">{LESSON.path}</span>
          </p>

          <span className="mt-7 inline-flex w-fit items-center gap-3 rounded-xl bg-blue px-6 py-3.5 text-[22px] font-medium text-on-accent">
            在新分頁打開課程單元
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </span>

          <p className="mt-8 border-t border-line-soft pt-6 text-[21px] leading-[1.55] text-muted">
            在 ChatGPT 與 Claude Code 怎麼開啟 SubAgent，操作步驟在這個單元示範過，課堂上不重複。
          </p>
        </div>
      </a>
    </div>
  );
}
