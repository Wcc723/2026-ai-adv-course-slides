import { useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第六章 近期的分享：專案管理
 *
 *   第 42 頁  ProjectsBoardDemo   專案管理：用 GitHub Projects
 *
 * Notion 原文（1013 修改）：
 *   「專案管理：最近的專案管理方式，提到 https://www.pocketool.app/ 目前都是用 Projects」
 *   附一張 GitHub Projects 看板截圖。截圖上的卡片有私人 repo 名稱與還沒公開的計畫，
 *   所以不放原圖，改成用簡報色票重畫一張看板（欄位、數量、欄位說明照實；卡片換成示意）。
 *
 * 跟前後頁的關係：
 *   第 32 頁（重新定義 SDD）提過需求可以寫在 Notion、issue「或是 GitHub Projects」，
 *   左欄上方那張卡回扣這一句。第 41 頁是 CODD。
 *   分工：這一頁只講「看板長什麼樣、怎麼設計」；第 43 頁〈開發流程：哪些在 GitHub、
 *   哪些在 Claude〉才講一張卡片怎麼被人和 Claude 推著走，這頁不演流程。
 *
 * 版型：同第五章「左邊是選項，右邊是概念圖」。
 *   左  講師的實例卡（口袋工具連結、回扣第 32 頁）＋ 四個設計重點（MenuItem）。
 *   右  情境卡（用設計重點的 id 當 key 重掛）：標題列 → 重畫的看板 → 欄位定義列 → 設計重點卡。
 *       選到哪一個設計重點，看板上對應的地方就用 acid 標出來：
 *         01 一個 Project 管所有站   看板名稱、每張 Issue 卡上的站名
 *         02 Status 欄位就是流程     七個欄位的標題、右上角的 Workflows、
 *                                    已上線欄那張「已關閉」的 Issue 卡（關了也沒變完成）
 *                                    與圖例的「Issue 已關閉」
 *         03 Draft 與 Issue          所有 Draft 卡（虛線框）與圖例的 Draft
 *         04 Claude 用 gh CLI 操作   Claude 開的那張卡、Claude 改過 Status 的那張卡
 *   另一個互動：點任何一欄的標題（含最右邊的「凍結」窄欄），看板下方顯示那一欄的
 *   完整定義。每個設計重點有自己預設的欄位（01 待開發、02 完成、03 探索、04 已上線）。
 *   這一頁沒有會動的東西，所以不放播放器。
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（查詢日 2026-10-13）
 * ──────────────────────────────────────────────────────────────
 * 講師的專案文件（工作流程的決策紀錄、給 agent 的操作手冊），以及當天用 gh 唯讀查詢
 * 這個 Project 的欄位、數量與 Workflows 設定：
 *   - Project 名稱「口袋工具開發」，Private，只有一個 Board view，依 Status 分欄。
 *   - Status 七個選項與各自的說明（畫面上的「欄位定義」逐字照抄）：
 *       探索 49   用 Ubersuggest 找題材，還沒決定要不要做
 *       待開發 82 決定要做，還沒開工
 *       開發中 1  正在寫
 *       驗收 1    上線前：build 把關、瀏覽器操作、RWD
 *       已上線 88 push 完成、Workers Builds 成功、線上驗過
 *       完成 95   沒有後續了。SERP 表現不是完成的條件
 *       凍結 7    決定不執行。要寫下凍結原因
 *     數量跟 Notion 截圖一致，合計 323 張；其中 113 張 Draft、210 張 Issue，
 *     Issue 來自 10 個 repo。
 *   - 唯一的工作來源：「唯一的工作來源是 GitHub Project …，不要從 docs/ 的 markdown 挑工作。」
 *   - 不用 label：「階段用 Project 的 Status 單選欄位，不要用 label。label 是 repo 層級的，
 *     跨 repo 就得在每個 repo 各建一套同名 label，一定會漂。」
 *   - Draft：「探索期的 item 用 Project 的 draft issue，不佔任何 repo。決定要做了才轉成
 *     該 repo 的 issue。」bug 與使用者回饋開在各 repo 自己的 issue。
 *   - Workflows：只開「Auto-add sub-issues to project」；其餘五個都是關的，其中包括
 *     GitHub 建立 Project 時預設開著的兩個（Item closed、Pull request merged）。
 *     所以 issue 關掉不會自動變成「完成」（當天已上線的 72 張 issue 裡有 57 張已經
 *     closed，卡片仍停在已上線；完成欄有 74 張 closed 的 issue）。
 *     ⚠ 為什麼關掉，文件沒有寫。畫面上只寫事實（已上線與完成是兩欄、issue 關掉不會
 *       自動變完成），不寫推論的理由。
 *   - Claude Code 操作看板用 gh CLI 加 GraphQL，不是 MCP：改 Status 用
 *     `gh project item-edit`，新增 Draft 用 `addProjectV2DraftIssue` mutation。
 *   - 署名：gh 帶的是站長本人的 token，Claude 寫的東西在 GitHub 上一樣顯示成站長的帳號，
 *     所以 Claude 寫的內容結尾加「寫入者：Claude（日期）」，站長本人寫的不帶署名。
 * GitHub 官方文件：
 *   - About Projects · https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
 *     「A project is an adaptable table, board, and roadmap that integrates with your
 *      issues and pull requests on GitHub」
 *   - Draft issue · https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project
 *     「Unlike issues and pull requests that are referenced from your repositories,
 *      draft issues exist only in your project.」「you must first convert the draft
 *      issue to an issue」
 *   - 內建自動化 · https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations
 *     「When your project initializes, two workflows are enabled by default: When issues
 *      or pull requests in your project are closed, their status is set to Done … when
 *      pull requests in your project are merged, their status is set to Done」
 *   - gh 手冊 · https://cli.github.com/manual/gh_project_item-edit
 *     「Edit a draft issue or a project item.」
 * 口袋工具首頁 · https://www.pocketool.app/ ：卡片上的站名與功能名稱取自首頁公開列出的
 *   工具（站：行政小幫手、Pixel Smith 影像工具、顏文字花園、英文跟讀、口袋單字王；
 *   功能：時差查詢、民國西元日期、HEIC 轉 JPG、影片逐句練習）。站名照首頁，
 *   「Pixel Smith 影像工具」在卡片上縮成「Pixel Smith」。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（為了讓畫面成立而加的，看板上也標了「卡片內容為示意」）
 * ──────────────────────────────────────────────────────────────
 *   - 每張卡片的標題、#編號、掛在哪個站，全部是虛構的。Issue 卡用首頁上的公開站名，
 *     不用 repo 名稱（repo 是私人的）；已上線、完成兩欄放首頁上已經公開的功能，
 *     其他欄放中性的標題（多國語系頁面、手機版按鈕太小…），不對應任何真實計畫。
 *   - 欄位標題下那一行是說明的節錄（欄寬只放得下一行）；完整原文在「欄位定義」列。
 *     驗收、已上線兩欄的節錄有刪字，其他欄是原文的開頭或全文。
 *   - 04 的兩張卡上的「寫入者：Claude」「Status 由 Claude 改」、02 的「已關閉，沒變完成」
 *     都是標註，真實看板上署名寫在卡片內文裡，不會出現在卡片表面。
 *   - 哪張 Issue 畫成已關閉（打勾圓圈）是示意：已上線欄一開一關（真實是 57 關、15 開），
 *     完成欄兩張都是關的。
 *   - 「還有 N 張」是用各欄的真實數量減掉畫面上的卡片數算出來的。
 *   - 真實看板唯一的 view 叫「View 1」（Board 版面）；畫面上的分頁直接寫 Board，
 *     讓學員一眼看出這是看板版面。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  左欄選取的設計重點、看板上對應的位置（實色框 ＋ 文字；淡底一律配實色框）。
 *   teal  已上線、完成兩欄的狀態點與欄名（正向、做完了）。02 選到時欄名改成 acid。
 *   其他一律中性：Draft／Issue／已關閉圖示、凍結、數量、欄位定義列。
 *   「目前看哪一欄的定義」用墨色（paper）2px 框：欄位外框與下方的欄位定義列同色，
 *   一眼對得起來，也不跟 acid 的「設計重點」搶。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根容器 h-[720px] max-w-[1740px]，沒有任何容器捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬：左欄 460 ＋ gap 32 ＋ 右欄 1248（比第 34、36 頁的 540 窄，讓看板的六欄寬一點）。
 *     右卡 px-6 → 內寬 1248 − 2 − 48 ＝ 1198；看板邊框 4 ＋ p-2 16 → 欄區 1178
 *     ＝ 六欄 × 182 ＋ 凍結窄欄 48 ＋ gap 6 × 6。
 *     卡片內容寬 ＝ 182 − 欄框 4 − p-2 16 − 卡框 4 − px-2 16 ＝ 142（站名標籤有 -ml-1，可用 146）：
 *     站名標籤 16px 一律單行（whitespace-nowrap），所以編號刻意用個位數 ——
 *     兩位數時「Pixel Smith #12」粗體實測 145，只剩 1px。
 *     標題 18px 一行約 7 字，加 break-keep 只在標點與空白斷行，所以標題都寫成「前綴：七字內」。
 * 左：實例卡 121 ＋ gap 12 × 4 ＋ 四張選單各 138（實測）；
 *     選單內容 ＝ py 32 ＋ 名稱 35 ＋ 6 ＋ 說明一行 26 ≈ 99，留白充足。
 * 右：卡片內高 720 − 2 − 48 ＝ 670
 *     ＝ 標題列 48 ＋ 14 ＋ 看板 404 ＋ 10 ＋ 欄位定義列 48 ＋ 14 ＋ 設計重點卡 132（實測相同）。
 *     看板 404 ＝ 邊框 4 ＋ 看板標題列 52 ＋ 欄區 348（p-2 → 欄高 332）。
 *     欄 332 ＝ 欄框 4 ＋ 欄標題 70 ＋ 卡片區。實測最後一個元素下緣到欄框內緣的餘裕：
 *       探索、待開發 29（04 的探索多一行標註，剩 5）、開發中與驗收 159、
 *       已上線 79（02、04 各有一張卡多一行標註，剩 55）、完成 79。
 *       最緊的是 04 的探索欄：再加一行字就會擠出欄外，改卡片文字前先重量。
 *     設計重點卡 132 ＝ 邊框 2 ＋ py 28 ＋ 三行 20px × 30 ＋ 2 × 4（實測每行 30）。
 * 稽核（2026-10-13，1920×1080 無頭 Chrome，作者一輪、審稿一輪）：四個設計重點、
 *   點欄位（含凍結）都跑過 overflow／contrast／svgContrast／outOfMain／childEscape，
 *   全部是空陣列。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger-more.tsx，不 import 那個檔案）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const LINK =
  'text-[18px] text-muted underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-acid';

const CODE = 'rounded-md bg-ink-soft px-2 py-0.5 font-mono text-[18px] text-paper';

const COUNT_CHIP =
  'shrink-0 rounded-full border border-line bg-panel px-2 text-[16px] leading-snug text-muted';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 左側選單的一列（同第 39 頁的 MenuItem，不帶 chips） */
function MenuItem({
  index,
  name,
  sub,
  on,
  onClick,
}: {
  index: number;
  name: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}

/* ── 看板用的小圖示（16px，顏色由呼叫端給 var(--color-*)）──────── */

/** Draft：虛線圓圈（GitHub 的 draft issue 圖示） */
function DraftIcon({ color }: { color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle
        cx={8}
        cy={8}
        r={6.25}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeDasharray="2.6 2.2"
      />
    </svg>
  );
}

/** Issue：實線圓圈 ＋ 中間一點（GitHub 的 open issue 圖示） */
function IssueIcon({ color }: { color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle cx={8} cy={8} r={6.25} fill="none" stroke={color} strokeWidth={1.75} />
      <circle cx={8} cy={8} r={1.75} fill={color} />
    </svg>
  );
}

/** 已關閉的 Issue：實線圓圈 ＋ 打勾（GitHub 的 closed issue 圖示） */
function ClosedIssueIcon({ color }: { color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle cx={8} cy={8} r={6.25} fill="none" stroke={color} strokeWidth={1.75} />
      <path
        d="M5.2 8.2 L7.2 10.1 L10.9 6"
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 狀態點：已上線、完成是實心 teal，其他是中性空心圈 */
function StatusDot({ positive }: { positive: boolean }) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {positive ? (
        <circle cx={7} cy={7} r={6} fill={C.teal} />
      ) : (
        <circle cx={7} cy={7} r={5.25} fill="none" stroke={C.muted} strokeWidth={1.75} />
      )}
    </svg>
  );
}

/** 鎖頭：這個 Project 是 Private */
function LockIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <rect
        x={3.5}
        y={8}
        width={11}
        height={8}
        rx={1.75}
        fill="none"
        stroke={C.muted}
        strokeWidth={1.75}
      />
      <path d="M6 8 V5.5 a3 3 0 0 1 6 0 V8" fill="none" stroke={C.muted} strokeWidth={1.75} />
    </svg>
  );
}

/** Board 分頁的圖示：三欄 */
function BoardIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <rect x={2} y={3} width={14} height={12} rx={2} fill="none" stroke={C.paper} strokeWidth={1.75} />
      <path d="M6.7 3 V15 M11.3 3 V15" stroke={C.paper} strokeWidth={1.75} />
    </svg>
  );
}

/* ── 看板資料 ─────────────────────────────────────────────
 * short 是欄寬放得下的一行節錄，full 是 Status 選項說明的原文。 */

type StatusId = 'explore' | 'todo' | 'doing' | 'review' | 'live' | 'done' | 'frozen';

interface Status {
  id: StatusId;
  name: string;
  count: number;
  short: string;
  full: string;
  positive: boolean;
}

const STATUSES: readonly Status[] = [
  {
    id: 'explore',
    name: '探索',
    count: 49,
    short: '還沒決定要不要做',
    full: '用 Ubersuggest 找題材，還沒決定要不要做',
    positive: false,
  },
  {
    id: 'todo',
    name: '待開發',
    count: 82,
    short: '決定要做，還沒開工',
    full: '決定要做，還沒開工',
    positive: false,
  },
  { id: 'doing', name: '開發中', count: 1, short: '正在寫', full: '正在寫', positive: false },
  {
    id: 'review',
    name: '驗收',
    count: 1,
    short: '上線前：build 把關',
    full: '上線前：build 把關、瀏覽器操作、RWD',
    positive: false,
  },
  {
    id: 'live',
    name: '已上線',
    count: 88,
    short: 'push 完成、線上驗過',
    full: 'push 完成、Workers Builds 成功、線上驗過',
    positive: true,
  },
  {
    id: 'done',
    name: '完成',
    count: 95,
    short: '沒有後續了',
    full: '沒有後續了。SERP 表現不是完成的條件',
    positive: true,
  },
  {
    id: 'frozen',
    name: '凍結',
    count: 7,
    short: '決定不執行',
    full: '決定不執行。要寫下凍結原因',
    positive: false,
  },
];

const FROZEN = STATUSES[STATUSES.length - 1];
const COLUMNS = STATUSES.slice(0, -1);

interface BoardCard {
  status: StatusId;
  title: string;
  /** 沒有 site 的是 Draft（只存在 Project 裡、不屬於任何 repo） */
  site?: string;
  num?: number;
  /** issue 已經 closed（打勾圓圈）。只有 Issue 卡會用到 */
  closed?: boolean;
  /** 02 選到時才出現的標註：issue 關了，卡片還停在已上線 */
  closedNote?: string;
  /** 04 選到時才出現的標註 */
  ghNote?: string;
}

/* 卡片全部是示意：站名、功能取自口袋工具首頁的公開名稱，標題、編號、開關狀態是虛構的 */
const CARDS: readonly BoardCard[] = [
  { status: 'explore', title: '探索：多國語系頁面', ghNote: '寫入者：Claude' },
  { status: 'explore', title: '探索：新工具題材' },
  { status: 'todo', site: '顏文字花園', num: 9, title: '修正：手機版按鈕太小' },
  { status: 'todo', site: '口袋單字王', num: 6, title: '回饋：想要深色模式' },
  { status: 'doing', site: '英文跟讀', num: 5, title: '句子切分：標點規則' },
  { status: 'review', site: '口袋單字王', num: 3, title: '測驗結果頁：RWD' },
  {
    status: 'live',
    site: 'Pixel Smith',
    num: 7,
    title: 'HEIC 轉 JPG',
    ghNote: 'Status 由 Claude 改',
  },
  {
    status: 'live',
    site: '行政小幫手',
    num: 8,
    title: '時差查詢',
    closed: true,
    closedNote: '已關閉，沒變完成',
  },
  { status: 'done', site: '行政小幫手', num: 4, title: '民國西元日期', closed: true },
  { status: 'done', site: '英文跟讀', num: 2, title: '影片逐句練習', closed: true },
];

/* ── 四個設計重點 ───────────────────────────────────────── */

type DesignId = 'hub' | 'status' | 'draft' | 'gh';

const DOCS_ABOUT =
  'https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects';
const DOCS_AUTOMATION =
  'https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations';
const DOCS_DRAFT =
  'https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project';
const DOCS_GH = 'https://cli.github.com/manual/gh_project_item-edit';

const VERB = 'mr-3 font-semibold text-paper';

interface Design {
  id: DesignId;
  name: string;
  sub: string;
  docs: string;
  docsLabel: string;
  defaultStatus: StatusId;
  headline: string;
  lines: readonly ReactNode[];
}

const DESIGNS: readonly Design[] = [
  {
    id: 'hub',
    name: '一個 Project 管所有站',
    sub: '每個站各有 repo，卡片全收進同一個看板',
    docs: DOCS_ABOUT,
    docsLabel: 'GitHub 文件',
    defaultStatus: 'todo',
    headline: '唯一的工作來源',
    lines: [
      '每個站各有自己的 repo，卡片全部收進同一個 Project。',
      '下一件事從這個看板挑，不從 docs/ 的 markdown 挑。',
      '現在 323 張卡，Issue 分別來自 10 個 repo。',
    ],
  },
  {
    id: 'status',
    name: 'Status 欄位就是流程',
    sub: '7 個階段各寫一句定義；不用 label',
    docs: DOCS_AUTOMATION,
    docsLabel: 'GitHub 文件',
    defaultStatus: 'done',
    headline: '階段寫在 Status',
    lines: [
      '7 個選項各寫一句定義，點上面的欄位名稱就看得到。',
      'label 是 repo 層級的：跨 repo 要各建一套，一定會漂。',
      'Workflows 只開 Auto-add sub-issues；issue 關掉，不會自動變「完成」。',
    ],
  },
  {
    id: 'draft',
    name: 'Draft 與 Issue',
    sub: '探索期用 Draft，決定要做才開成 issue',
    docs: DOCS_DRAFT,
    docsLabel: 'GitHub 文件',
    defaultStatus: 'explore',
    headline: '決定要做，才開 issue',
    lines: [
      '探索期用 Draft：只存在 Project 裡，不佔任何 repo。',
      '決定要做了，才轉成那個站 repo 的 issue；bug 與使用者回饋直接開 issue。',
      '現在 113 張 Draft、210 張 Issue。',
    ],
  },
  {
    id: 'gh',
    name: 'Claude 用 gh CLI 操作',
    sub: '自己開卡、改 Status，內容結尾署名',
    docs: DOCS_GH,
    docsLabel: 'gh 手冊',
    defaultStatus: 'live',
    headline: 'gh CLI，不是 MCP',
    lines: [
      <>
        <span className={VERB}>開卡</span>
        <code className={CODE}>addProjectV2DraftIssue</code>（GraphQL），在探索欄新增 Draft
      </>,
      <>
        <span className={VERB}>移卡</span>
        <code className={CODE}>gh project item-edit</code> 改 Status
      </>,
      <>
        <span className={VERB}>署名</span>
        內文結尾寫「寫入者：Claude」；gh 用的是本人的 token，介面上看不出誰寫的
      </>,
    ],
  },
];

/* ── 看板 ────────────────────────────────────────────── */

function CardView({ card, design }: { card: BoardCard; design: DesignId }) {
  const isDraft = card.site === undefined;
  const draftOn = design === 'draft' && isDraft;
  const siteOn = design === 'hub' && !isDraft;
  const closedOn = design === 'status' && card.closedNote !== undefined;
  const ghOn = design === 'gh' && card.ghNote !== undefined;
  const acidFrame = draftOn || closedOn || ghOn;
  const iconColor = draftOn || siteOn || closedOn ? C.acid : C.muted;
  const note = closedOn ? card.closedNote : ghOn ? card.ghNote : undefined;

  return (
    <div
      className={`rounded-lg border-2 bg-panel px-2 py-1.5 transition-colors duration-200 ${
        isDraft ? 'border-dashed' : ''
      } ${acidFrame ? 'border-acid' : isDraft ? 'border-line' : 'border-line-soft'}`}
    >
      <span
        className={`-ml-1 flex w-fit items-center gap-1 rounded-md border px-1 text-[16px] leading-snug whitespace-nowrap ${
          siteOn
            ? 'border-acid font-semibold text-acid'
            : draftOn
              ? 'border-transparent font-semibold text-acid'
              : 'border-transparent text-muted'
        }`}
      >
        {isDraft ? (
          <DraftIcon color={iconColor} />
        ) : card.closed ? (
          <ClosedIssueIcon color={iconColor} />
        ) : (
          <IssueIcon color={iconColor} />
        )}
        {isDraft ? 'Draft' : `${card.site} #${card.num}`}
      </span>
      <p className="mt-0.5 text-[18px] leading-snug break-keep text-paper">{card.title}</p>
      {note !== undefined && (
        <p className="mt-0.5 text-[16px] leading-snug font-semibold text-acid">{note}</p>
      )}
    </div>
  );
}

function Board({
  design,
  picked,
  onPick,
}: {
  design: DesignId;
  picked: StatusId;
  onPick: (id: StatusId) => void;
}) {
  const hubOn = design === 'hub';
  const headerOn = design === 'status';
  const draftOn = design === 'draft';

  return (
    <div className="flex h-[404px] shrink-0 flex-col rounded-2xl border-2 border-line bg-panel">
      {/* 看板標題列 */}
      <div className="flex h-[52px] shrink-0 items-center gap-4 border-b border-line-soft px-4">
        <LockIcon />
        <span
          className={`-ml-2 rounded-md px-2 text-[22px] leading-snug font-semibold transition-colors duration-200 ${
            hubOn ? 'bg-acid/14 text-acid ring-2 ring-acid' : 'text-paper'
          }`}
        >
          口袋工具開發
        </span>
        <span className="flex h-full items-center gap-2 border-b-[3px] border-paper px-2 pt-[3px] text-[18px] font-semibold text-paper">
          <BoardIcon />
          Board
        </span>
        <span className="text-[16px] text-faint">卡片內容為示意</span>

        <span className="ml-auto flex items-center gap-5">
          <span
            className={`flex items-center gap-1.5 text-[16px] ${
              draftOn ? 'font-semibold text-acid' : 'text-muted'
            }`}
          >
            <DraftIcon color={draftOn ? C.acid : C.muted} />
            Draft
          </span>
          <span className="flex items-center gap-1.5 text-[16px] text-muted">
            <IssueIcon color={C.muted} />
            Issue
          </span>
          <span
            className={`flex items-center gap-1.5 text-[16px] ${
              headerOn ? 'font-semibold text-acid' : 'text-muted'
            }`}
          >
            <ClosedIssueIcon color={headerOn ? C.acid : C.muted} />
            Issue 已關閉
          </span>
          <span
            className={`flex items-center gap-2 rounded-lg border px-3 py-0.5 text-[17px] transition-colors duration-200 ${
              headerOn ? 'border-acid bg-acid/14 font-semibold text-acid' : 'border-line text-muted'
            }`}
          >
            Workflows
            <span className={COUNT_CHIP}>1</span>
          </span>
        </span>
      </div>

      {/* 六欄 ＋ 凍結窄欄 */}
      <div className="grid min-h-0 flex-1 grid-cols-[repeat(6,minmax(0,1fr))_48px] gap-1.5 p-2">
        {COLUMNS.map((status) => {
          const cards = CARDS.filter((card) => card.status === status.id);
          const more = status.count - cards.length;
          const selected = status.id === picked;
          return (
            <div
              key={status.id}
              className={`flex min-h-0 flex-col rounded-xl border-2 bg-panel-lift transition-colors duration-200 ${
                selected ? 'border-paper' : 'border-line-soft'
              }`}
            >
              <button
                type="button"
                onClick={() => onPick(status.id)}
                aria-pressed={selected}
                className={`flex shrink-0 flex-col gap-1 rounded-t-[10px] border-b-[3px] px-2.5 py-2 text-left transition-colors duration-200 ${
                  headerOn ? 'bg-acid/14 ring-2 ring-acid ring-inset' : 'hover:bg-panel'
                } ${selected ? 'border-b-paper' : 'border-b-line-soft'}`}
              >
                <span className="flex items-center gap-2">
                  <StatusDot positive={status.positive} />
                  <span
                    className={`text-[20px] leading-tight ${
                      headerOn
                        ? 'font-bold text-acid'
                        : status.positive
                          ? 'font-semibold text-teal'
                          : 'font-semibold text-paper'
                    }`}
                  >
                    {status.name}
                  </span>
                  <span className={COUNT_CHIP}>{status.count}</span>
                </span>
                <span className="text-[16px] leading-snug whitespace-nowrap text-muted">
                  {status.short}
                </span>
              </button>

              <div className="flex min-h-0 flex-col gap-2 p-2">
                {cards.map((card) => (
                  <CardView key={card.title} card={card} design={design} />
                ))}
                {more > 0 && (
                  <span className="px-1 text-[16px] leading-snug text-faint">還有 {more} 張</span>
                )}
              </div>
            </div>
          );
        })}

        {/* 凍結：窄欄，直書 */}
        <button
          type="button"
          onClick={() => onPick(FROZEN.id)}
          aria-pressed={picked === FROZEN.id}
          className={`flex min-h-0 flex-col items-center gap-2 rounded-xl border-2 py-3 transition-colors duration-200 ${
            picked === FROZEN.id ? 'border-paper' : 'border-line-soft'
          } ${headerOn ? 'bg-acid/14 ring-2 ring-acid ring-inset' : 'bg-panel-lift hover:bg-panel'}`}
        >
          <StatusDot positive={false} />
          <span
            className={`text-[20px] leading-none font-semibold [writing-mode:vertical-rl] ${
              headerOn ? 'text-acid' : 'text-paper'
            }`}
          >
            {FROZEN.name}
          </span>
          <span className={COUNT_CHIP}>{FROZEN.count}</span>
          <span className="text-[16px] leading-none text-muted [writing-mode:vertical-rl]">
            {FROZEN.short}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── 右側情境卡 ───────────────────────────────────────── */

function DesignCard({ index, item }: { index: number; item: Design }) {
  const [picked, setPicked] = useState<StatusId>(item.defaultStatus);
  const status = STATUSES.find((s) => s.id === picked) ?? STATUSES[0];

  return (
    <div className="slide-enter flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-6 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} text-acid`}>設計 {pad2(index + 1)}</span>
        <span className="text-[30px] leading-none font-semibold text-paper">{item.name}</span>
        <a href={item.docs} target="_blank" rel="noreferrer" className={LINK}>
          {item.docsLabel} ↗
        </a>
        <span className="ml-auto text-[18px] text-muted">點欄位名稱，下面顯示完整定義</span>
      </div>

      <div className="mt-3.5">
        <Board design={item.id} picked={picked} onPick={setPicked} />
      </div>

      {/* 欄位定義列：跟選到的那一欄同樣是墨色框 */}
      <div className="mt-2.5 flex h-12 shrink-0 items-center gap-4 rounded-xl border-2 border-paper bg-panel px-5">
        <span className={LABEL_FAINT}>欄位定義</span>
        <span className="flex items-center gap-2">
          <StatusDot positive={status.positive} />
          <span className="text-[22px] leading-none font-semibold text-paper">{status.name}</span>
          <span className={COUNT_CHIP}>{status.count}</span>
        </span>
        <span className="text-[21px] leading-none text-paper">「{status.full}」</span>
      </div>

      {/* 設計重點 */}
      <div className="mt-3.5 flex min-h-0 flex-1 gap-6 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6 py-3.5">
        <div className="flex w-[230px] shrink-0 flex-col justify-center gap-1.5">
          <span className={LABEL_FAINT}>設計重點</span>
          <span className="text-[24px] leading-snug font-semibold text-paper">{item.headline}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[20px] leading-normal text-paper">
          {item.lines.map((line, lineIndex) => (
            <p key={lineIndex}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 左欄上方：講師的實例 ─────────────────────────────── */

function ContextCard() {
  return (
    <div className="flex shrink-0 flex-col gap-1.5 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className={LABEL_FAINT}>實際案例</span>
        <a href="https://www.pocketool.app/" target="_blank" rel="noreferrer" className={LINK}>
          www.pocketool.app ↗
        </a>
      </div>
      <span className="text-[22px] leading-snug font-semibold text-paper">
        口袋工具目前都用 GitHub Projects 管
      </span>
      <span className="text-[19px] leading-snug text-muted">
        第 32 頁提到的 GitHub Projects，長這樣
      </span>
    </div>
  );
}

export function ProjectsBoardDemo() {
  const [picked, setPicked] = useState<DesignId>('hub');
  const index = Math.max(
    0,
    DESIGNS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[460px_1fr] gap-8">
      {/* ── 左：實際案例 ＋ 四個設計重點 ───────────────────── */}
      <div className="flex min-h-0 flex-col gap-3">
        <ContextCard />
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {DESIGNS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              sub={item.sub}
              on={item.id === picked}
              onClick={() => setPicked(item.id)}
            />
          ))}
        </div>
      </div>

      {/* ── 右：看板 ─────────────────────────────────────── */}
      <DesignCard key={picked} index={index} item={DESIGNS[index]} />
    </div>
  );
}
