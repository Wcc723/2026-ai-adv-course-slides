import { useState, type KeyboardEvent, type MouseEvent } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 小章節：Google Antigravity
 *
 *   第 38 頁  GeminiCompareDemo  比較表：Gemini 與 ChatGPT、Claude
 *             接在第 37 頁 AntigravityDemo（demos-antigravity.tsx）後面，
 *             第 39 頁是 Antigravity 實例。沒有投票 → 根容器 h-[720px]。
 *
 *   左  Gemini 的兩個新模型（Argon、Carbon）：官方定位一行 ＋ 講師一句話；
 *       底下是「講師體感」與圖例。
 *   右  六個面向 × 三家的比較表。點一列，列與「講師認為比較好」的格子被標出來，
 *       下方卡片顯示講師那一句話（原話濃縮）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：講師 CODD 筆記「簡報調整」（codd://note/note-plus，2026-11-18）
 *           「Google Antigravity」一節
 * ──────────────────────────────────────────────────────────────
 *   「這邊後面再幫我補一個比較表，這個比較表可以提到 Google Gemini 跟其他幾家的一些優劣勢。」
 *   六個面向的評語照筆記，下方卡片的句子是原話濃縮，沒有加講師沒說的評價：
 *     小專案開發   「我會給它至少兩顆星，但還不敢給到三顆星」→ Gemini 2 星
 *     大型專案開發 「就架構上，我最推薦的還是使用 Claude」
 *     幻覺         「CodeX 以及 Claude 的幻覺還是比較低的；Gemini 這個系列的幻覺則是比較高」
 *     資料正確性   「正確性比較高的還是 Claude 跟 ChatGPT……Gemini 有些時候還是會出錯，
 *                  不管是錯字或小幅度的文字錯誤」
 *     商業模式     「ChatGPT 跟 Claude 追求極致的嚴謹……所以 Gemini 在商業模式這一點上面會處理得比較好」
 *     Google 政策  「Claude 跟 ChatGPT 沒有辦法抓出任何錯誤，而 Gemini 可以抓出非常多我在 SEO 上面
 *                  犯的錯誤。所以如果是 Google 的政策面向，我會給三顆星」→ Gemini 3 星
 *
 *   星等只放講師給過的：
 *   - 上面兩格（Gemini 小專案 2、Google 政策 3）是這次筆記給的。
 *   - 「大型專案開發」「商業模式」沿用第 4 頁 ToolFeelDemo（demos-intro.tsx 的 FEEL_ROWS）
 *     同名的列：「大型專案」ChatGPT 2、Claude 3、Gemini 空白；「商業模式的理解」
 *     ChatGPT 1、Claude 1、Gemini 2。下方卡片的頁底註會寫「星等沿用第 4 頁」。
 *     改了 FEEL_ROWS 記得一起改這裡（兩份資料沒有連動，刻意不 import 別的檔）。
 *   - 其他格子講師沒給星，改用一行字的標記（較低／較高、較嚴謹／偶爾出錯…），
 *     teal ＝ 講師認為較好、coral ＝ 較弱（跟第 37 頁「別家有的也有／缺點」同一組色）。
 *     「最推薦」照「我最推薦的還是使用 Claude」。講師完全沒提到的格子是「—」。
 *   - 第 4 頁「一般 Coding」Gemini 是 1 星，這頁「小專案開發」是 2 星；面向名稱不同，
 *     沒有拿來互相套用。
 *   - 筆記的「就比較表來說的話，我還是停留在目前剛剛推出的版本」語意不明，
 *     頁面不寫成「評分以某個版本為準」，只寫「評分是講師目前的體感，不是評測數據」。
 *
 *   兩個模型（左欄）
 *   - 講師的話：「Gemini Argon，它本身的模型相較前幾版來說確實聰明很多，但我自己目前還是
 *     不會用在主力開發」「前幾天也推出了一個 Gemini 4 Carbon 的新模型，目前來講我還沒有使用它
 *     來做深度開發，主要原因是因為我還沒有進行用量的測試」→ 卡片下半的引號句。
 *   - 名稱與日期（官方，查核日 2026-11-18）：
 *       講師說的「Gemini Argon」正式名稱是 Gemini 4 Argon，2026-10-13 發表，
 *         官方「our latest frontier model」（10-13 發表時的說法；11-18 已有更新的 Carbon、Hydrogen，畫面不寫「最新」）
 *         ＋ Gemini App 給 Pro、Ultra（support.google.com/gemini/answer/18648722、blog.google 的 Argon availability 文章，
 *         Antigravity 現行價目表一致）→「官方：前沿模型，Pro、Ultra 都能用」
 *         https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/
 *         https://deepmind.google/models/model-cards/gemini-4-argon/（Published 13 October 2026）
 *       Gemini 4 Carbon 2026-10-28 先預告（只開放給資安防禦者）、2026-11-10 正式開放，
 *         官方「our strongest model」；Gemini App、AI Mode、Antigravity 都只給 Google AI Ultra
 *         （另有付費 API）→「官方：最強的模型，訂閱只給 Ultra」，日期寫 11-10 開放
 *         https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/
 *         https://support.google.com/gemini/answer/18648722?hl=en（4 Carbon 只給 Ultra）
 *   - 官方頁面是研究時用 WebFetch 讀全文（經過摘要），引文可能有些微轉述的落差。
 *     這頁沒有只見於搜尋摘要的說法；第三方（9to5Google 的選單標籤）沒有上畫面。
 *
 * 補的（講師沒給、為了讓畫面成立才加的，都可以換掉）：
 *   - 面向名稱的寫法（「Google 政策」是「Google 政策面向」的縮寫）、欄頭「含 Codex」
 *     （講師在「幻覺」那一條用 Codex 指 ChatGPT 那一家）。
 *   - 每格的一行標記字（較低、較嚴謹、偶爾出錯、較好、抓出很多、抓不出 SEO 錯誤）是
 *     把講師那一句拆到格子裡的濃縮。
 *   - 「比較好」的判定照講師的句子：小專案只評了 Gemini，所以那一列沒有「比較好」。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 一進頁面沒有選列，表格是中性的。點一列面向（再點一次取消）：
 *   - 列名加 6px acid 左粗條＋淡底，那一列的格子是 acid/14 淡底（輔助）；
 *   - 講師認為比較好的格子換成 3px 實心 acid 框（不靠淡底傳達語意）；
 *   - 下方卡片：面向名稱、「比較好」的實心膠囊、講師那一句、頁底註。
 * 鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid   選中的列、比較好的格子（3px 實心框）、卡片左粗條與「比較好」膠囊
 *   teal   講師認為較好的標記（實心膠囊，on-accent 字）
 *   coral  較弱的標記（實心膠囊，on-accent 字）
 *   amber  星星（同第 4 頁）
 *   blue   左欄模型卡的 6px 左粗條（資訊）
 *   標記都是實心膠囊附文字；淡底一定配不透明左粗條或實心框。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   欄寬  左 452 ＋ gap 28 ＋ 右 1260
 *   左    標籤 24 ＋ 12 ＋ 模型卡 2 × ≈ 196 ＋ 14 ＋（mt-auto）體感框 ≈ 200 ≈ 642
 *         模型卡 ＝ 框 2 ＋ py 40 ＋ 名稱列 36 ＋ 6 ＋ 官方 26 ＋ 12 ＋ 分隔 1 ＋ 12 ＋ 引言 2 行 64
 *         引言寬 392 → 21px 一行約 18 字，兩句都是 26、27 字 → 兩行
 *   右    表頭 56 ＋ 六列 66 × 6 ＋ gap 6 × 6 ＝ 488 ＋ 16 ＋ 說明卡 216
 *         欄寬 ＝ 面向 248 ＋ 三欄各 (1260 − 248 − 18) ÷ 3 ≈ 331
 *         最寬的格子「★★★ ＋ 抓出很多」≈ 92 ＋ 10 ＋ 108 ＝ 210、「抓不出 SEO 錯誤」≈ 200
 *         說明卡 ＝ 框 2 ＋ py 40 ＋ 標題列 40 ＋ 12 ＋ 引言 24px 最多 2 行 72 ＋（mt-auto）註 24 ≈ 190
 *         引言寬約 1196 → 24px 一行約 49 字，六句在瀏覽器量過都是一行（36），離註 62
 *   選列、取消都不改變任何高度：說明卡固定 flex-1，空的時候是虛線框的提示。
 *   浮水印在右上角（舞台 y104–147）：根容器頂端在舞台 y194，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

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

/** 同第 4 頁 ToolFeelDemo 的星星 */
const STAR_PATH =
  'M12 2.6l2.85 5.95 6.55.8-4.83 4.5 1.25 6.48L12 17.1l-5.82 3.23 1.25-6.48L2.6 9.35l6.55-.8z';

function Stars({ count, size }: { count: number; size: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1" role="img" aria-label={`${count} 顆星`}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d={STAR_PATH} fill="var(--color-amber)" />
        </svg>
      ))}
    </span>
  );
}

/* ── 資料 ─────────────────────────────────────────────────── */

type Tool = 'chatgpt' | 'claude' | 'gemini';

const TOOLS: readonly { id: Tool; name: string; sub?: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', sub: '含 Codex' },
  { id: 'claude', name: 'Claude' },
  { id: 'gemini', name: 'Gemini' },
];

const TOOL_NAME: Record<Tool, string> = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' };

type Tone = 'good' | 'weak';

/** 一格：講師給的星等、一行標記；null ＝ 講師沒提到 */
type Cell = { stars?: number; tag?: { text: string; tone: Tone } } | null;

type AspectId = 'small' | 'large' | 'hallucination' | 'accuracy' | 'business' | 'google';

interface Aspect {
  id: AspectId;
  name: string;
  cells: Record<Tool, Cell>;
  /** 講師認為比較好的；空的話顯示 verdict */
  leaders: readonly Tool[];
  verdict?: string;
  /** 講師原話濃縮 */
  quote: string;
  /** 卡片底部的註 */
  note?: string;
}

const ASPECTS: readonly Aspect[] = [
  {
    id: 'small',
    name: '小專案開發',
    cells: { chatgpt: null, claude: null, gemini: { stars: 2 } },
    leaders: [],
    verdict: '這一列只評了 Gemini',
    quote: '小專案我會給它至少兩顆星，但還不敢給到三顆星。',
  },
  {
    id: 'large',
    name: '大型專案開發',
    // 星等沿用第 4 頁 FEEL_ROWS「大型專案」：[2, 3, null]
    cells: {
      chatgpt: { stars: 2 },
      claude: { stars: 3, tag: { text: '最推薦', tone: 'good' } },
      gemini: null,
    },
    leaders: ['claude'],
    quote: '就架構上，我最推薦的還是 Claude。',
    note: '星等沿用第 4 頁「大型專案」，Gemini 那一格原本就空白',
  },
  {
    id: 'hallucination',
    name: '幻覺',
    cells: {
      chatgpt: { tag: { text: '較低', tone: 'good' } },
      claude: { tag: { text: '較低', tone: 'good' } },
      gemini: { tag: { text: '較高', tone: 'weak' } },
    },
    leaders: ['chatgpt', 'claude'],
    quote: 'Codex 和 Claude 的幻覺還是比較低，Gemini 這個系列的幻覺比較高。',
  },
  {
    id: 'accuracy',
    name: '資料正確性',
    cells: {
      chatgpt: { tag: { text: '較嚴謹', tone: 'good' } },
      claude: { tag: { text: '較嚴謹', tone: 'good' } },
      gemini: { tag: { text: '偶爾出錯', tone: 'weak' } },
    },
    leaders: ['chatgpt', 'claude'],
    quote: '正確性延續幻覺：Claude、ChatGPT 比較嚴謹；Gemini 有時還是會出錯，像錯字或小幅的文字錯誤。',
  },
  {
    id: 'business',
    name: '商業模式',
    // 星等沿用第 4 頁 FEEL_ROWS「商業模式的理解」：[1, 1, 2]
    cells: {
      chatgpt: { stars: 1 },
      claude: { stars: 1 },
      gemini: { stars: 2, tag: { text: '較好', tone: 'good' } },
    },
    leaders: ['gemini'],
    quote: 'ChatGPT、Claude 追求極致的嚴謹，基本上絕對不允許小範圍犯錯；所以 Gemini 在商業模式上處理得比較好。',
    note: '星等沿用第 4 頁「商業模式的理解」',
  },
  {
    id: 'google',
    name: 'Google 政策',
    cells: {
      chatgpt: { tag: { text: '抓不出 SEO 錯誤', tone: 'weak' } },
      claude: { tag: { text: '抓不出 SEO 錯誤', tone: 'weak' } },
      gemini: { stars: 3, tag: { text: '抓出很多', tone: 'good' } },
    },
    leaders: ['gemini'],
    quote: '最近優化 Google SEO，Claude、ChatGPT 抓不出任何錯誤，Gemini 抓出非常多我在 SEO 上犯的錯。',
  },
];

interface Model {
  name: string;
  date: string;
  official: string;
  quote: string;
}

const MODELS: readonly Model[] = [
  {
    name: 'Gemini 4 Argon',
    date: '2026-10-13 推出',
    official: '官方：前沿模型，Pro、Ultra 都能用',
    quote: '比前幾版確實聰明很多，但我目前還不會用在主力開發。',
  },
  {
    name: 'Gemini 4 Carbon',
    date: '2026-11-10 開放',
    official: '官方：最強的模型，訂閱只給 Ultra',
    quote: '前幾天剛推出，還沒做用量測試，所以還沒拿來深度開發。',
  },
];

/* ── 左欄：模型 ───────────────────────────────────────────── */

function ModelCard({ model }: { model: Model }) {
  return (
    <section className="rounded-2xl border border-l-[6px] border-line border-l-blue bg-panel px-6 py-5">
      <div className="flex h-9 items-center justify-between gap-3">
        <h3 className="font-display text-[28px] leading-none font-semibold whitespace-nowrap text-paper">
          {model.name}
        </h3>
        <span className="shrink-0 rounded-full border-2 border-line px-3 py-0.5 text-[16px] leading-tight whitespace-nowrap text-muted tabular-nums">
          {model.date}
        </span>
      </div>
      <p className="mt-1.5 text-[18px] leading-[26px] text-muted">{model.official}</p>
      <p className="mt-3 border-t border-line-soft pt-3 text-[21px] leading-[1.5] break-keep text-pretty text-paper">
        「{model.quote}」
      </p>
    </section>
  );
}

function Legend() {
  return (
    <div className="rounded-2xl border border-line bg-ink-soft px-6 py-5">
      <span className="rounded-full bg-paper px-4 py-1 text-[17px] font-semibold text-on-accent">
        講師體感
      </span>
      <p className="mt-3 text-[21px] leading-[1.5] text-paper">
        評分是講師目前的體感，不是評測數據。
      </p>
      <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[18px] leading-tight text-muted">
        <li className="flex items-center gap-2">
          <Stars count={1} size={20} />
          講師給的星等
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 text-center text-[20px] leading-none text-faint">—</span>
          講師沒提到
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-[18px] shrink-0 rounded-[5px] bg-teal" />
          講師認為較好
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-[18px] shrink-0 rounded-[5px] bg-coral" />
          較弱
        </li>
      </ul>
    </div>
  );
}

/* ── 右欄：比較表 ─────────────────────────────────────────── */

const GRID_COLS = 'grid grid-cols-[248px_repeat(3,minmax(0,1fr))] gap-1.5';

const TONE_LOOK: Record<Tone, string> = {
  good: 'bg-teal',
  weak: 'bg-coral',
};

function CellValue({ cell }: { cell: Cell }) {
  if (cell === null) {
    return (
      <span className="text-[26px] leading-none text-faint" aria-label="講師沒提到">
        —
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      {cell.stars !== undefined && <Stars count={cell.stars} size={28} />}
      {cell.tag && (
        <span
          className={`inline-flex h-9 items-center rounded-full px-4 text-[19px] font-semibold whitespace-nowrap text-on-accent ${TONE_LOOK[cell.tag.tone]}`}
        >
          {cell.tag.text}
        </span>
      )}
    </span>
  );
}

function CompareTable({
  picked,
  onPick,
}: {
  picked: AspectId | null;
  onPick: (id: AspectId) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      {/* 表頭 */}
      <div className={`${GRID_COLS} h-14`}>
        <span className={`flex items-end px-5 pb-2 ${LABEL_TYPE} text-faint`}>面向 ／ 工具</span>
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-line-soft bg-panel-lift"
          >
            <span className="text-[26px] leading-none font-semibold text-paper">{tool.name}</span>
            {tool.sub && <span className="text-[17px] leading-none text-faint">{tool.sub}</span>}
          </div>
        ))}
      </div>

      {/* 六列 */}
      {ASPECTS.map((aspect) => {
        const on = aspect.id === picked;
        return (
          <div key={aspect.id} className={`${GRID_COLS} h-[66px]`}>
            <button
              type="button"
              aria-pressed={on}
              onClick={(event) => {
                onPick(aspect.id);
                blurAfterClick(event);
              }}
              onKeyDown={keepActivationKeys}
              className={`flex items-center rounded-xl border border-l-[6px] px-5 text-left text-[24px] whitespace-nowrap text-paper transition-colors duration-200 ${FOCUS_RING} ${
                on
                  ? 'border-acid/55 border-l-acid bg-acid/14 font-semibold'
                  : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
              }`}
            >
              {aspect.name}
            </button>
            {TOOLS.map((tool) => {
              const leader = on && aspect.leaders.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  aria-label={leader ? `${tool.name}：講師認為比較好` : undefined}
                  className={`flex items-center justify-center rounded-xl px-4 transition-colors duration-200 ${
                    leader
                      ? 'border-[3px] border-acid bg-panel'
                      : on
                        ? 'border border-acid/55 bg-acid/14'
                        : 'border border-line-soft bg-panel'
                  }`}
                >
                  <CellValue cell={aspect.cells[tool.id]} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DetailCard({ aspect }: { aspect: Aspect | null }) {
  return (
    <div aria-live="polite" className="mt-4 min-h-0 flex-1">
      {aspect === null ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-panel text-center">
          <p className="text-[22px] font-semibold text-muted">點上面任一列面向</p>
          <p className="text-[19px] text-faint">這裡會顯示講師怎麼說、誰比較好</p>
        </div>
      ) : (
        <div
          key={aspect.id}
          className="slide-enter flex h-full flex-col rounded-2xl border border-l-[6px] border-line border-l-acid bg-panel px-7 py-5"
        >
          <div className="flex h-10 shrink-0 items-center gap-5">
            <p className="text-[26px] leading-none font-semibold text-paper">{aspect.name}</p>
            {aspect.leaders.length > 0 ? (
              <p className="flex items-center gap-2.5">
                <span className="text-[18px] text-faint">講師認為比較好</span>
                {aspect.leaders.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex h-10 items-center rounded-full bg-acid px-5 text-[20px] font-semibold text-on-accent"
                  >
                    {TOOL_NAME[tool]}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-[19px] text-muted">{aspect.verdict}</p>
            )}
          </div>
          <p className="mt-3 text-[24px] leading-[1.5] text-paper">「{aspect.quote}」</p>
          <p className="mt-auto h-6 text-[17px] leading-6 text-faint">
            {aspect.note ? `${aspect.note} · ` : ''}講師原話濃縮（CODD 筆記，2026-11-18）
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 38 頁 · GeminiCompareDemo — 比較表：Gemini 與 ChatGPT、Claude
 * ══════════════════════════════════════════════════════════════ */

export function GeminiCompareDemo() {
  const [picked, setPicked] = useState<AspectId | null>(null);
  const aspect = ASPECTS.find((item) => item.id === picked) ?? null;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[452px_minmax(0,1fr)] gap-7">
      {/* ── 左：兩個新模型 ＋ 體感說明 ─────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <p className={`${LABEL_TYPE} h-6 leading-6 text-faint`}>Gemini 的新模型</p>
        <div className="mt-3 flex flex-col gap-3.5">
          {MODELS.map((model) => (
            <ModelCard key={model.name} model={model} />
          ))}
        </div>
        <div className="mt-auto">
          <Legend />
        </div>
      </div>

      {/* ── 右：比較表 ＋ 講師怎麼說 ───────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <CompareTable
          picked={picked}
          onPick={(id) => setPicked((current) => (current === id ? null : id))}
        />
        <DetailCard aspect={aspect} />
      </div>
    </div>
  );
}
