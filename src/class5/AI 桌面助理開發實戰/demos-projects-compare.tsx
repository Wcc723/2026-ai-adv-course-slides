import { useState, type KeyboardEvent, type MouseEvent } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 共有的能力：專案管理（二）
 *
 *   第 15 頁  ProjectsCompareDemo  專案管理：ChatGPT、Claude 的專案差在哪（沒有投票 → 720）
 *   （第 14 頁的 ProjectsDemo 在 demos-shared.tsx：講師截圖＋兩家各自的重點）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-17：「補一個分頁，ChatGPT、Claude 這兩種專案有什麼不同」。
 * 第 14 頁是「一家一家看」，這頁是「並排比」：左邊七列對照表，右邊三種情況，
 * 點一種情況，表格標出決定它的那幾列，並說該選哪一家。
 * 講師也嫌舊頁字太多，所以每格限一行（約 22 字內），細節留在第 14 頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-17）
 * ──────────────────────────────────────────────────────────────
 * 標「摘要」的：help.openai.com 對 WebFetch 回 403，只讀得到搜尋摘要，
 * 頁面用比較保守的寫法（「約」「也可能」），不寫死各方案的數字。
 * 依據只有摘要的格子（容量、記憶、共用的 ChatGPT 欄）在畫面上加 †，
 * 右下角的頁底註寫「† 只見於 OpenAI 說明中心摘要」（2026-11-17 審查意見）。
 *
 *   OpenAI
 *   - https://learn.chatgpt.com/docs/projects
 *     「keep related chats, files, instructions, and sources together」；Chats／Sources 兩區；
 *     桌面版可以掛多個本機資料夾，「ChatGPT can read and change files in every attached folder」；
 *     主要資料夾「Codex also uses that folder as the default for Git operations」；
 *     Projects 畫面把雲端專案與本機專案放在一起；遠端專案目前只能一個資料夾。
 *   - https://learn.chatgpt.com/docs/glossary
 *     Project：「A group of related chats and shared sources, or a local folder」。
 *   - https://learn.chatgpt.com/docs/automations.md?surface=app
 *     桌面版排程「run in the project directory or an isolated worktree」，電腦與 App 要開著；
 *     網頁版的排程在雲端跑 → 畫面寫「可在專案資料夾跑」，不寫成一律要開著電腦。
 *   - https://help.openai.com/en/articles/10169521-projects-in-chatgpt（摘要）
 *     每個專案的檔案上限 Free 5、Go／Plus 25、Pro／Business／Enterprise／Edu 40
 *       → 頁面只寫「依方案約 5～40 個」（Edu 在 2025-09 release notes 寫 25，官方前後不一）；
 *     Free、Go、Plus、Pro 都能邀人共用，權限分 chat／edit → 「個人方案也能邀人」；
 *     共用的專案自動改成「僅限專案」記憶；僅限專案記憶的專案不能用 ChatGPT Work
 *       → 「共用後只能後者」「也可能不能開 Work」；
 *     所有方案都有 Projects → 欄頭「各方案都有」。
 *   - https://help.openai.com/en/articles/6825453-chatgpt-release-notes（摘要）
 *     2026-08：未共用的專案可以在預設與僅限專案記憶之間切換；
 *     2026-08-14「ChatGPT Work is not available in projects using project-only memory」。
 *   Anthropic
 *   - https://support.claude.com/en/articles/9517075-what-are-projects
 *     「self-contained workspaces」；只有 Team／Enterprise 能共用，Can view／Can edit；
 *     新版 Projects「rolling out in stages starting with Claude Code」。
 *   - https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects
 *     所有方案（含 Free）都有，「Free users can create a maximum of five projects」；
 *     「Each project has its own memory.」，關掉「Use account memory」才跟一般對話完全分開。
 *   - https://support.claude.com/en/articles/8241126-upload-files-to-claude
 *     專案單檔 30MB；檔數「Unlimited, but total content must fit within Claude's context window」。
 *   - https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects
 *     接近 context 上限時自動改用 RAG，「expand your project's capacity by up to 10x」；
 *     Pro、Max、Ultra、Team、Enterprise（Free 沒有）。
 *   - https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork
 *     桌面版的專案（原 Cowork 專案）：掛本機資料夾、匯入既有專案、貼網址；
 *     專案專屬的排程任務；「available on desktop on all paid plans」
 *       → 情況 03 的「要注意」：掛資料夾的專案與 Code 分頁都要付費方案（Free 學員只有一般專案）。
 *   - https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile
 *     2026-10-06 起 Pro、Max、Ultra 的任務與排程在雲端跑（Team／Enterprise 這頁沒寫）
 *       → 頁面寫「個人付費方案在雲端跑」。
 *   - https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude
 *     Chat 與 Cowork 合併；「Projects work in every conversation.」（所以這頁不提 Cowork）。
 *   - https://code.claude.com/docs/en/claude-projects
 *     新版 Projects：「public beta on Pro, Max, and Ultra plans」、Team／Enterprise 還沒有；
 *     「A project is one ongoing conversation」，Claude 拆成平行的雲端 thread；
 *     「A project belongs to one user.」→ 底下的＊註。
 *   - https://code.claude.com/docs/en/desktop-quickstart   Code 分頁要付費方案。
 *
 * 官方文件互相矛盾、頁面刻意不寫死的地方：
 * - 14116274 寫「Projects are only available in Cowork, not in Claude Code」，
 *   但新版 Projects 正是從 Code 分頁開始推 → 表格寫「寫程式走 Code 分頁＊」，＊註說明新版。
 * - claude.com/docs/cowork/guide/projects 寫專案「live on your computer」、不能共用；
 *   比較新的 support 14116274 寫存在 Claude 帳號、共用方式同一般專案 → 以 support 為準。
 * - 匯入專案的按鈕，指南寫「Import a project」、support 寫「Import from project」→ 頁面只寫「匯入」。
 * - 新版 Projects 先推給「用過 cloud session、沒有舊專案」的帳號，舊專案之後也會換成新版；
 *   ＊註不寫成兩種專案會永久並存，課堂示範前要先確認講師帳號看不看得到。
 *
 * 補的示意（不是官方原文，也不是講師原話）：
 * - 七個比較項目與每格的濃縮寫法，是照上面的文件歸納的。
 * - 三種情況、對應的關鍵列、建議與「要注意」，是照研究整理的「怎麼選」寫的使用建議。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 一進頁面沒有選情況，表格是中性的，先講表。點右邊一種情況：
 *   - 決定它的列加 6px acid 左粗條＋淡底，列名前出現同號碼的實心圓；其他列的字退成 muted；
 *   - 建議的那一家欄頭出現實心膠囊「選這家」（兩家都可以時兩欄都是「都行」），
 *     關鍵列裡那一家的格子變粗體；
 *   - 右下的卡片換成建議與一句「要注意」。
 * 再點一次同一個情況就取消。
 * 鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（只有 acid 一支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選中的情況、關鍵列（6px 左粗條＋/14 淡底）、列名前的號碼、欄頭膠囊、建議卡的左粗條與結論膠囊。
 *   其餘一律中性；淡底一定配不透明左粗條，膠囊與號碼都是實心，不靠淡色傳達語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   左 1272 ＋ gap 28 ＋ 右 440
 *   左  表格 620 ＋ 16 ＋ ＊註 84（19px 兩行內）
 *       表格 ＝ 外框 2 ＋ 欄頭 64 ＋ 七列平分 554（每列約 79，21px 一行）
 *       欄寬 ＝ 左粗條 6 ＋ 項目 204 ＋ 兩欄各 530（px-5 → 字寬 490，21px 一行 23 字）
 *       項目欄：號碼 28 ＋ 8 ＋ 名稱（最長「一個專案是什麼」19px × 7 ＝ 133），不換行
 *   右  標題區 108 ＋ 12 ＋ 三個情況（64 × 3 ＋ 10 × 2 ＝ 212）＋ 16 ＋ 建議卡 336 ＋ 10 ＋ 註記 26
 *       建議卡 ＝ py 48 ＋ 框 2 ＋ 結論膠囊 44 ＋ 16 ＋ 理由三行（21 × 1.5 × 3 ≈ 95）
 *                ＋ 要注意（框線 15 ＋ 標籤 24 ＋ 4 ＋ 19px 兩行 56）≈ 304
 *       理由寬 384 → 21px 一行 18 字，最長的第三則約 43 字、三行。
 *   切換情況不改變任何高度：號碼與欄頭膠囊沒出現時是 invisible 佔位。
 *   浮水印在右上角：右欄頂端 120 內只有靠左的「怎麼選／看你的情況／左表會標出關鍵的列」，
 *   最寬的一行約 171 寬，止於根容器 x ≈ 1471；三個按鈕從 y ＝ 120 才開始。
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

/* ── 資料 ─────────────────────────────────────────────────── */

type Vendor = 'chatgpt' | 'claude';

type RowId = 'what' | 'put' | 'capacity' | 'memory' | 'local' | 'share' | 'schedule';

interface CompareRow {
  id: RowId;
  name: string;
  chatgpt: string;
  claude: string;
}

/** 每格一行（約 22 字內）。標「摘要」的依據見檔頭 */
const ROWS: readonly CompareRow[] = [
  {
    id: 'what',
    name: '一個專案是什麼',
    chatgpt: '一組對話＋來源，也可以是一個本機資料夾',
    claude: '獨立的工作區：對話紀錄、知識庫、指示',
  },
  {
    id: 'put',
    name: '放什麼',
    chatgpt: '上傳的檔案，加上接進來的來源',
    claude: '文件、程式碼、文字；桌面版還能加網址',
  },
  {
    id: 'capacity',
    name: '容量',
    // 摘要：Free 5、Go／Plus 25、Pro 以上 40（learn.chatgpt.com/docs/projects 沒寫檔數上限）→ †
    chatgpt: '每個專案有檔案數上限，依方案約 5～40 個†',
    claude: '檔數不限，付費方案資料多時自動改用 RAG',
  },
  {
    id: 'memory',
    name: '記憶',
    // 摘要：共用後自動改成僅限專案 → †
    chatgpt: '可選「預設」或「僅限專案」；共用後只能後者†',
    claude: '每個專案獨立，還能跟一般對話完全分開',
  },
  {
    id: 'local',
    name: '本機與寫程式',
    chatgpt: '桌面版掛本機資料夾，Codex 也用同一個',
    claude: '桌面版可掛資料夾；寫程式走 Code 分頁＊',
  },
  {
    id: 'share',
    name: '共用',
    // 摘要：Free、Go、Plus、Pro 都能邀人 → †（情況 01「選 ChatGPT」建立在這一格上）
    chatgpt: '個人方案也能邀人，分可編輯、只能對話†',
    claude: '限 Team、Enterprise，分可檢視、可編輯',
  },
  {
    id: 'schedule',
    name: '排程',
    // automations：「run in the project directory or an isolated worktree」；網頁版的排程在雲端 → 「可在」
    chatgpt: '桌面版排程可在專案資料夾跑，電腦要開著',
    claude: '專案可設排程；個人付費方案在雲端跑',
  },
];

const VENDORS: readonly { id: Vendor; name: string; sub: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', sub: '各方案都有' },
  { id: 'claude', name: 'Claude', sub: '各方案都有 · Free 最多 5 個' },
];

type ScenarioId = 'share' | 'data' | 'local';

interface Scenario {
  id: ScenarioId;
  name: string;
  /** 決定這個情況的列 */
  rows: readonly RowId[];
  pick: Vendor | 'both';
  verdict: string;
  reason: string;
  caveat: string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    id: 'share',
    name: '要跟別人一起用',
    rows: ['share', 'memory'],
    pick: 'chatgpt',
    verdict: '選 ChatGPT',
    reason: '個人方案就能邀人一起用；Claude 要 Team、Enterprise 才能共用。',
    // 摘要：共用後僅限專案記憶、不能用 Work
    caveat: '代價：共用後記憶只留在專案裡，也可能不能開 Work。',
  },
  {
    id: 'data',
    name: '資料多、要長期累積',
    rows: ['put', 'capacity'],
    pick: 'claude',
    verdict: '選 Claude',
    reason: '檔數不限；資料多時付費方案自動改用 RAG，容量最多約 10 倍。',
    caveat: 'Free 方案沒有 RAG，而且最多 5 個專案。',
  },
  {
    id: 'local',
    name: '要讀寫本機檔案或程式碼',
    rows: ['what', 'local'],
    pick: 'both',
    verdict: '兩家都行，用桌面版',
    reason:
      'ChatGPT 的專案直接掛資料夾，Codex 也用同一個；Claude 在桌面版掛資料夾，寫程式到 Code 分頁。',
    // 14116274：掛資料夾的桌面專案「available on desktop on all paid plans」；Code 分頁見 desktop-quickstart
    caveat: 'Claude 掛資料夾的專案、Code 分頁都要付費方案。',
  },
];

/* ── 對照表 ───────────────────────────────────────────────── */

const GRID_COLS = 'grid grid-cols-[204px_1fr_1fr]';

function CompareTable({ scenario, order }: { scenario: Scenario | null; order: number }) {
  return (
    <div
      role="table"
      aria-label="ChatGPT 與 Claude 的專案對照"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-panel"
    >
      {/* 欄頭 */}
      <div
        role="row"
        className={`${GRID_COLS} h-16 shrink-0 border-b border-line border-l-[6px] border-l-panel-lift bg-panel-lift`}
      >
        <div role="columnheader" className="flex items-center px-4">
          <span className={`${LABEL_TYPE} text-faint`}>比較項目</span>
        </div>
        {VENDORS.map((vendor) => {
          const picked =
            scenario !== null && (scenario.pick === vendor.id || scenario.pick === 'both');
          return (
            <div
              key={vendor.id}
              role="columnheader"
              className="flex min-w-0 items-center gap-3 border-l border-line-soft px-5"
            >
              <span className="text-[24px] leading-none font-semibold text-paper">
                {vendor.name}
              </span>
              <span className="text-[17px] whitespace-nowrap text-faint">{vendor.sub}</span>
              <span
                aria-hidden={!picked}
                className={`ml-auto shrink-0 rounded-full bg-acid px-4 py-1 text-[17px] font-semibold text-on-accent ${
                  picked ? '' : 'invisible'
                }`}
              >
                {scenario?.pick === 'both' ? '都行' : '選這家'}
              </span>
            </div>
          );
        })}
      </div>

      {/* 七列 */}
      {ROWS.map((row) => {
        const key = scenario !== null && scenario.rows.includes(row.id);
        const dimmed = scenario !== null && !key;
        return (
          <div
            key={row.id}
            role="row"
            className={`${GRID_COLS} min-h-0 flex-1 border-b border-line-soft border-l-[6px] transition-colors duration-200 last:border-b-0 ${
              key ? 'border-l-acid bg-acid/14' : 'border-l-panel bg-panel'
            }`}
          >
            {/* 不用 sr-only 的文字：它是 overflow hidden 的 1px 盒子，稽核會判成溢出 */}
            <div
              role="rowheader"
              aria-label={key ? `${row.name}（關鍵列）` : undefined}
              className="flex items-center gap-2 px-4"
            >
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-acid text-[16px] leading-none font-semibold text-on-accent tabular-nums ${
                  key ? '' : 'invisible'
                }`}
              >
                {order}
              </span>
              <span
                className={`text-[19px] leading-snug font-semibold whitespace-nowrap ${
                  dimmed ? 'text-muted' : 'text-paper'
                }`}
              >
                {row.name}
              </span>
            </div>
            {VENDORS.map((vendor) => {
              const strong =
                key && scenario !== null && (scenario.pick === vendor.id || scenario.pick === 'both');
              return (
                <div
                  key={vendor.id}
                  role="cell"
                  className={`flex min-w-0 items-center border-l border-line-soft px-5 text-[21px] leading-snug ${
                    dimmed ? 'text-muted' : 'text-paper'
                  } ${strong ? 'font-semibold' : ''}`}
                >
                  {row[vendor.id]}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ── 建議卡 ───────────────────────────────────────────────── */

function VerdictCard({ scenario }: { scenario: Scenario | null }) {
  return (
    <div aria-live="polite" className="mt-4 min-h-0 flex-1">
      {scenario === null ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-panel text-center">
          <p className="text-[22px] font-semibold text-muted">選一種情況</p>
          <p className="text-[19px] text-faint">這裡會說該選哪一家</p>
        </div>
      ) : (
        <div
          key={scenario.id}
          className="slide-enter flex h-full flex-col rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-6"
        >
          <p>
            <span className="inline-flex h-11 items-center rounded-full bg-acid px-5 text-[22px] font-semibold text-on-accent">
              {scenario.verdict}
            </span>
          </p>
          <p className="mt-4 text-[21px] leading-[1.5] text-paper">{scenario.reason}</p>
          <div className="mt-auto border-t border-line-soft pt-3.5">
            <p className="text-[17px] leading-6 font-semibold text-faint">要注意</p>
            <p className="mt-1 text-[19px] leading-[1.45] text-muted">{scenario.caveat}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 15 頁 · ProjectsCompareDemo — 專案管理：ChatGPT、Claude 的專案差在哪
 * ══════════════════════════════════════════════════════════════ */

export function ProjectsCompareDemo() {
  const [picked, setPicked] = useState<ScenarioId | null>(null);
  const index = SCENARIOS.findIndex((item) => item.id === picked);
  const scenario = index === -1 ? null : SCENARIOS[index];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[1fr_440px] gap-7">
      {/* ── 左：對照表＋新版 Projects 的註 ─────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <CompareTable scenario={scenario} order={index + 1} />
        <p className="flex h-[84px] shrink-0 items-center rounded-xl border border-line bg-ink-soft px-6 text-[19px] leading-[1.45] text-paper">
          {
            '＊Claude 另有新版 Projects（beta，Pro／Max／Ultra，在 Code 分頁）：一個專案就是一段對話，拆成多條雲端 thread 平行做；不能共用。'
          }
        </p>
      </div>

      {/* ── 右：三種情況＋建議 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <div className="h-[108px] shrink-0">
          <p className={`${LABEL_TYPE} h-6 leading-6 text-faint`}>怎麼選</p>
          <p className="mt-2 text-[30px] leading-[38px] font-semibold text-paper">看你的情況</p>
          <p className="mt-1.5 text-[19px] leading-7 text-muted">左表會標出關鍵的列</p>
        </div>

        <div className="mt-3 flex shrink-0 flex-col gap-2.5">
          {SCENARIOS.map((item, order) => {
            const on = item.id === picked;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={(event) => {
                  setPicked(on ? null : item.id);
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                className={`flex h-16 items-center gap-4 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${FOCUS_RING} ${
                  on
                    ? 'border-acid border-l-acid bg-acid/14'
                    : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
                }`}
              >
                <span
                  className={`font-display text-[20px] leading-none font-semibold tabular-nums ${
                    on ? 'text-acid' : 'text-faint'
                  }`}
                >
                  0{order + 1}
                </span>
                <span
                  className={`text-[22px] leading-tight whitespace-nowrap text-paper ${
                    on ? 'font-semibold' : ''
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        <VerdictCard scenario={scenario} />

        <p className="mt-2.5 h-[26px] shrink-0 text-[17px] leading-[26px] text-faint">
          † 只見於 OpenAI 說明中心摘要 · 查核日 2026-11-17
        </p>
      </div>
    </div>
  );
}
