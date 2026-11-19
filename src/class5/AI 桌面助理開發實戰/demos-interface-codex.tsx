import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { BrandFrame, TITLEBAR_CLEAR } from './brand-badge';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 兩家桌面版的介面：ChatGPT Codex
 *
 *   第 10 頁  ChatgptCodexDemo  ChatGPT Codex：寫程式的地方（沒有投票 → 根容器 720）
 *   （第 8、9 頁的 ChatgptAppDemo、ChatgptWorkDemo 在 demos-interface-chatgpt.tsx，
 *    第 11 頁的 ClaudeAppDemo 在 demos-interface-claude.tsx；三個檔案不互相 import，
 *    只共用 brand-badge.tsx 的品牌貼紙。頁碼依 2026-11-19 的 47 頁版本，第 8–11 頁從 2026-11-18 之後都沒變）
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼有這一頁
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-17 要求把當時第 9 頁的 WorkLogicDemo「補充：ChatGPT 的 Work 邏輯」拆掉，
 * 改成用介面示意圖講 ChatGPT 桌面版本身（舊頁字太多）。第 8 頁講 Chat／Work／Codex
 * 怎麼切，第 9 頁講 Work，這一頁講 Codex。舊頁 Codex 欄（demos-models.tsx）的說法
 * 依 2026-11-17 的查證重寫：「左上角選單」與「權限各自設定，改 Work 不會動到 Codex」
 * 都只出現在 help.openai.com 的搜尋摘要，這一頁不用。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-17；learn.chatgpt.com 是 OpenAI 官方的 ChatGPT＋Codex 文件站）
 * ──────────────────────────────────────────────────────────────
 *   https://learn.chatgpt.com/docs/whats-new
 *     2026-07-09：Codex App 併入 ChatGPT 桌面版（macOS、Windows），同時加入
 *     「inline editing in diffs, pull request review in the side panel」與一個專案多個 repo。
 *   https://learn.chatgpt.com/docs/changelog
 *     版本 26.707「Codex joins the ChatGPT desktop app」。
 *     （help.openai.com/en/articles/6825453-chatgpt-release-notes 也有同一則，
 *       但 WebFetch 回 403，只看到搜尋摘要；頁面上的日期以上面兩頁為準。）
 *   https://learn.chatgpt.com/docs/quickstart
 *     product selector（ChatGPT dropdown）的兩列：「Codex — Build, debug, and ship」。
 *   https://learn.chatgpt.com/docs/use-chatgpt   （2026-11-17 自己重讀過對照表）
 *     Technical detail：Work「Hide technical details like Git or shell commands」；
 *       Codex「See developer details, including diff and review views」。
 *     Pull requests pane：Work「Not available when using ChatGPT Work」；Codex「Available when enabled」。
 *     「ChatGPT Work and Codex share usage limits.」
 *     Quick chat：ChatGPT「Not available」；Codex「When available, access ChatGPT chats
 *       from web and mobile in Codex」。
 *   https://learn.chatgpt.com/docs/projects
 *     「Work conversation history remains separate from Codex history.」；
 *     「Select Add folder to attach multiple folders.」，滑到資料夾上可以「Make primary」；
 *     遠端（Cloud）專案目前只支援一個資料夾。
 *   https://learn.chatgpt.com/docs/environments/modes
 *     每個 chat 選 Local／Worktree／Cloud；「Both Local and Worktree chats run on your computer.」
 *   https://learn.chatgpt.com/docs/cloud
 *     Cloud 任務各自有工作區，「can keep working while your computer is asleep」。
 *   https://learn.chatgpt.com/docs/environments/local-environment   （2026-11-17 重讀）
 *     diff pane 可以逐段、逐檔 stage 或 revert，加 inline comment 給 Codex 處理；
 *     「commit changes, push a branch, and create a pull request without leaving the app」。
 *     「Commit or push」「Create pull request」兩個字樣出現在這頁的範例面板。
 *   https://learn.chatgpt.com/docs/code-review   （2026-11-17 重讀）
 *     review pane 的範圍：「Unstaged」（預設）「Staged」「Commit」「Branch」「Last turn」；
 *     Last turn 會跨所有掛上的 repo（repo 選單顯示「All repos」）；標頭有「Stage all」「Revert all」；
 *     滑到 diff 的某一行按「+」留言。GitHub PR 用側欄的 Code Review plugin（可以釘選），
 *     「Submit review」→ Comment／Approve／Request changes。
 *   https://learn.chatgpt.com/docs/integrated-terminal   （2026-11-17 重讀）
 *     「Select New tab, then Terminal, or press Ctrl+`」；面板標題「Terminal /bin/zsh」；
 *     「a terminal scoped to its current project or worktree」；
 *     插圖裡的輸入框提示「Ask Codex anything, @ to add files, / for commands」、
 *     「6 Sol」「Medium」、輸入框下方的「Local」「Worktree」「Cloud」與分支「main」。
 *   https://learn.chatgpt.com/docs/reference/commands   （2026-11-17 重讀）
 *     「Toggle terminal (Codex only)」⌃`；「Open review tab (Codex only)」⌃⇧G；
 *     「Toggle bottom panel (Codex only)」⌘J；「Quick chat (ChatGPT only)」⌘⌥N。
 *   https://learn.chatgpt.com/docs/permission-modes
 *     輸入框的權限選單：Ask for approval／「Approve for me」／Full access／Custom (config.toml)。
 *
 *   沒用在畫面上的：
 *   - Quick chat：commands 頁寫「(ChatGPT only)」、對照表寫 Codex「When available」，
 *     兩頁的說法不好對齊，所以只在側欄畫一個圖示（title＝Quick chat），不寫成重點。
 *   - 側欄 Code Review 的 PR 收件匣、Summary／Changes 分頁、Review with Codex 等細節，
 *     一頁放不下，只留「審 PR 用側欄 Code Review」一句。
 *
 * ──────────────────────────────────────────────────────────────
 * 示意（不是截圖；畫面上有一行小字標明）
 * ──────────────────────────────────────────────────────────────
 *   - 整個視窗是依上面文件與 learn.chatgpt.com 插圖手繪的，元件位置是示意。
 *     product selector 畫在側欄最上方是推測（官方只說「the ChatGPT dropdown」）。
 *   - 側欄的「New chat」＋ Quick chat 圖示、「Scheduled」「Plugins」取自官方插圖；
 *     插圖來自不同時期，彼此不完全一致。
 *   - 專案 acme 底下列出 acme-web、acme-api 兩個 repo 是示意：官方只寫 Edit project › Add folder
 *     可以掛好幾個資料夾，側欄實際怎麼列沒有寫。acme-web 取自官方 modes 頁插圖，acme-api 是補的。
 *   - 對話標題「Fix retry handling」取自官方插圖；對話內容、diff、留言、終端機輸出、
 *     「+18 −4」這些數字都是編的例子。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 *   右邊五個編號卡片，或直接點左邊畫面上的編號（以及那一塊區域），都會選取同一個項目：
 *   畫面上那一塊描 4px acid 框、編號變成 acid 實心，右邊卡片亮起來；再點一次取消。
 *   一進頁面沒有選任何項目，編號都是中性色。⑤ 在畫面上有兩處（側欄 Code Review、
 *   標頭的 Commit or push／Create pull request），會一起亮。
 *   鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點，
 *   之後按方向鍵、空白鍵照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid   只用在「選到的項目」：畫面上的框（outline，不佔版面）、實心編號、右邊卡片。
 *          卡片的 bg-acid/14 一定配 6px 不透明 acid 左粗條與 acid 外框。
 *   teal   diff 的新增行（＋號與 4px 左邊條）與 +N 數字；coral 是刪除行與 −N。
 *          顏色之外，每一行還有 ＋／− 符號，不靠顏色單獨表達。
 *   lime   終端機的提示字元與測試通過的輸出。
 *   teal   另外也是視窗左上角「ChatGPT」品牌貼紙的實心底（brand-badge.tsx，字是 on-accent），
 *          講師 2026-11-18 在 codd://note/note-plus 要的明顯標示；這一頁 Codex 是 ChatGPT 裡的
 *          一個產品，所以貼紙寫 ChatGPT，跟第 8、9 頁同一張（Codex 由側欄的產品選單與右欄標題交代）。
 *          原本標題列裡的淡色小字「ChatGPT」跟貼紙重複，拿掉。
 *   其他一律中性（panel／panel-lift／ink-soft／line），視窗本身不搶色。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   上區 620 ＋ gap 16 ＋ 下方「跟 Work 比」條 84 ＝ 720
 *   上區  左 1150 ＋ gap 28 ＋ 右 562
 *     左  視窗 590 ＋ gap 8 ＋ 說明小字 22 ＝ 620
 *         視窗：框 4 ＋ 標題列 40 ＋ 本體 546
 *           側欄 224 寬：py 24 ＋ 選單 36 ＋ 8 ＋ 四列 (32 × 4 ＋ 4 × 4) ＋ 標籤 36
 *                      ＋ 專案區 96 ＋ 兩則對話 68                          ≈ 412
 *           主區 922 寬：標頭 48 ＋ 中段 394 ＋ 終端機 104 ＝ 546
 *             對話欄 498：p 32 ＋ 泡泡 40 ＋ 回覆 26 ＋ 檔案 32 ＋ 輸入框約 96 ＋ 下方列 52 ≈ 300
 *                         輸入框內寬約 430；晶片一列約 407（Approve for me 最寬）
 *             審查欄 424：py 20 ＋ 範圍分頁 36 ＋ 8 ＋ 工具列 36 ＋ 8 ＋ 檔名 32 ＋ 6
 *                         ＋ diff（6 行 × 26 ＋ 留言 42 ＋ 框 2 ＝ 200）           ≈ 346
 *                         最長一行 34 個等寬字 × 17px ≈ 347 ＜ 內寬 396
 *             終端機：pt 8 ＋ 標題 28 ＋ 4 ＋ 兩行 52 ≈ 92
 *     右  標題區 108 ＋ 12 ＋ 五張卡片 (92 × 5 ＋ 8 × 4 ＝ 492) ＝ 612
 *         卡片文字寬約 459 → 19px 一行約 24 個中文字；每句控制在一行
 *   下方條  標籤 196 ＋ 四格各約 384（文字寬 344，20px 一行）
 *   選取只改 outline 與顏色，任何互動都不改變高度；沒有容器會捲動。
 *   浮水印在舞台右上（x 1692–1872、y 104–147），落在 Panel 的外框與內距上；
 *   根容器右上角 260 × 120 是右欄標題區的空白（標題靠左、最寬約 270），第一張卡片從 y 120 開始。
 *   「ChatGPT」貼紙騎在視窗左上角（往上超出 20、往左超出 14，含外環 23／17），落在 Panel 的
 *   內距裡，不佔版面；下緣在視窗標題列之內，側欄的產品選單從視窗 y 54 開始，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-antigravity.tsx 等，不 import）──────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 選取中的卡片：淡底一定配 6px 不透明左粗條 */
const CARD_ON = 'border-acid border-l-acid bg-acid/14';
const CARD_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** 示意畫面裡的晶片、按鈕（都是 span，不能點） */
const CHIP =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 text-[16px] whitespace-nowrap text-muted';
const MOCK_BTN =
  'inline-flex h-8 shrink-0 items-center rounded-lg border border-line bg-panel px-3 text-[16px] whitespace-nowrap text-paper';

/** 按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕，不讓簡報翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ── 小圖示（純裝飾，aria-hidden）────────────────────────── */

type IconName =
  | 'chevron'
  | 'compose'
  | 'quick'
  | 'clock'
  | 'plug'
  | 'review'
  | 'folder'
  | 'repo'
  | 'branch'
  | 'shield'
  | 'plus'
  | 'mic'
  | 'send'
  | 'terminal'
  | 'file'
  | 'code';

const ICON_PATHS: Record<IconName, ReactNode> = {
  chevron: <path d="m6 9 6 6 6-6" />,
  compose: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  quick: (
    <>
      <path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.5-5.2A8.5 8.5 0 1 1 21 12Z" />
      <path d="M12.5 8.5v7M9 12h7" />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </>
  ),
  plug: (
    <>
      <rect x={4} y={4} width={7} height={7} rx={1.5} />
      <rect x={13} y={4} width={7} height={7} rx={1.5} />
      <rect x={4} y={13} width={7} height={7} rx={1.5} />
      <path d="M16.5 13v7M13 16.5h7" />
    </>
  ),
  review: (
    <>
      <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-7l-5 4v-4H5a1 1 0 0 1-1-1Z" />
      <path d="m9 10 2 2 4-4" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  ),
  repo: (
    <>
      <path d="M6 4h12v16H8a2 2 0 0 1-2-2Z" />
      <path d="M6 18a2 2 0 0 1 2-2h10" />
    </>
  ),
  branch: (
    <>
      <circle cx={6} cy={5} r={2} />
      <circle cx={6} cy={19} r={2} />
      <circle cx={18} cy={7} r={2} />
      <path d="M6 7v10M18 9a6 6 0 0 1-6 6H8" />
    </>
  ),
  shield: <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  mic: (
    <>
      <rect x={9} y={3} width={6} height={11} rx={3} />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  send: <path d="M12 19V5M6 11l6-6 6 6" />,
  terminal: (
    <>
      <rect x={3} y={4} width={18} height={16} rx={2} />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-panel px-1.5 py-0 font-sans text-[19px] tracking-[0.08em] text-paper">
      {children}
    </kbd>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 五個編號項目
 * ══════════════════════════════════════════════════════════════ */

type SpotNo = 1 | 2 | 3 | 4 | 5;

interface Callout {
  no: SpotNo;
  /** 12 個字以內 */
  title: string;
  /** 一行，約 24 個中文字以內 */
  line: ReactNode;
}

const CALLOUTS: readonly Callout[] = [
  {
    no: 1,
    title: '一個專案，好幾個 repo',
    line: 'Add folder 把前端、後端掛進同一個專案',
  },
  {
    no: 2,
    title: '選在哪裡跑',
    line: 'Local、Worktree 在本機；Cloud 電腦睡著也繼續',
  },
  {
    no: 3,
    title: '看改了什麼',
    line: (
      <>
        <Kbd>⌃⇧G</Kbd> 開審查分頁：逐行留言、stage、revert
      </>
    ),
  },
  {
    no: 4,
    title: '內建終端機',
    line: (
      <>
        <Kbd>⌃`</Kbd> 打開，範圍就是目前的專案或 worktree
      </>
    ),
  },
  {
    no: 5,
    title: '送出改動、審 PR',
    line: 'Commit、push、開 PR；審 PR 用側欄 Code Review',
  },
];

interface SpotState {
  active: SpotNo | null;
  pick: (no: SpotNo) => void;
}

function SpotBadge({
  no,
  on,
  pick,
  className,
}: {
  no: SpotNo;
  on: boolean;
  pick: (no: SpotNo) => void;
  className: string;
}) {
  const title = CALLOUTS[no - 1].title;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`第 ${no} 項：${title}`}
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        pick(no);
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`absolute z-10 grid size-[30px] place-items-center rounded-full border-2 font-mono text-[17px] leading-none font-semibold transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'border-acid bg-acid text-on-accent' : 'border-paper bg-panel text-paper'
      } ${className}`}
    >
      {no}
    </button>
  );
}

/**
 * 畫面上可以標示的一塊：選到時描 4px acid 框（outline 往內縮，不佔版面、不被裁掉），
 * 編號放在 badge 指定的位置。點這一塊也算選取。
 */
function Spot({
  no,
  state,
  badge,
  className = '',
  children,
}: {
  no: SpotNo;
  state: SpotState;
  badge: string;
  className?: string;
  children: ReactNode;
}) {
  const on = state.active === no;
  return (
    <div
      onClick={() => state.pick(no)}
      className={`relative cursor-pointer outline-4 outline-offset-[-4px] transition-[outline-color] duration-200 ${
        on ? 'outline-acid' : 'outline-transparent'
      } ${className}`}
    >
      {children}
      <SpotBadge no={no} on={on} pick={state.pick} className={badge} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * Codex 視窗示意
 * ══════════════════════════════════════════════════════════════ */

function NavRow({ icon, label, extra }: { icon: IconName; label: string; extra?: ReactNode }) {
  return (
    <div className="flex h-8 shrink-0 items-center gap-2 rounded-lg px-2 text-[17px] text-paper">
      <span className="text-muted">
        <Icon name={icon} />
      </span>
      <span className="truncate">{label}</span>
      {extra}
    </div>
  );
}

function CodexSidebar({ state }: { state: SpotState }) {
  return (
    <div className="flex w-[224px] shrink-0 flex-col gap-1 border-r border-line bg-panel-lift px-3 py-3">
      {/* product selector：選的是 Codex */}
      <div className="mb-2 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-2.5 text-paper">
        <Icon name="code" />
        <span className="text-[18px] font-semibold">Codex</span>
        <span className="ml-auto text-muted">
          <Icon name="chevron" />
        </span>
      </div>

      <NavRow
        icon="compose"
        label="New chat"
        extra={
          <span
            role="img"
            aria-label="Quick chat"
            title="Quick chat"
            className="ml-auto grid size-7 shrink-0 place-items-center rounded-md border border-line-soft bg-panel text-muted"
          >
            <Icon name="quick" size={16} />
          </span>
        }
      />
      <NavRow icon="clock" label="Scheduled" />
      <NavRow icon="plug" label="Plugins" />
      <Spot no={5} state={state} className="rounded-lg" badge="top-1/2 right-0.5 -translate-y-1/2">
        <NavRow icon="review" label="Code Review" />
      </Spot>

      <p className="mt-3 h-6 shrink-0 px-2 text-[16px] leading-6 text-faint">Projects</p>
      <Spot no={1} state={state} className="shrink-0 rounded-lg py-1" badge="top-1 right-1">
        <div className="flex h-8 items-center gap-2 px-2 text-[17px] font-semibold text-paper">
          <span className="text-muted">
            <Icon name="folder" />
          </span>
          acme
        </div>
        {['acme-web', 'acme-api'].map((repo) => (
          <div
            key={repo}
            className="flex h-7 items-center gap-2 pr-2 pl-8 font-mono text-[16px] text-muted"
          >
            <Icon name="repo" size={16} />
            {repo}
          </div>
        ))}
      </Spot>
      <div className="mt-1 flex h-8 shrink-0 items-center rounded-lg border border-line bg-panel pr-2 pl-8 text-[17px] whitespace-nowrap text-paper">
        Fix retry handling
      </div>
      <div className="flex h-8 shrink-0 items-center pr-2 pl-8 text-[17px] whitespace-nowrap text-muted">
        Add rate limit
      </div>
    </div>
  );
}

function DiffStat({ add, del }: { add: number; del: number }) {
  return (
    <span className="font-mono whitespace-nowrap">
      <span className="text-teal">+{add}</span> <span className="text-coral">−{del}</span>
    </span>
  );
}

function CodexHeader({ state }: { state: SpotState }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line pr-2 pl-4">
      <span className="text-[19px] font-semibold whitespace-nowrap text-paper">Fix retry handling</span>
      <span className="font-mono text-[16px] text-faint">acme</span>
      <span className="ml-auto text-[17px]">
        <DiffStat add={18} del={4} />
      </span>
      <Spot
        no={5}
        state={state}
        className="flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-11"
        badge="top-1/2 left-1.5 -translate-y-1/2"
      >
        <span className={MOCK_BTN}>Commit or push</span>
        <span className={MOCK_BTN}>Create pull request</span>
      </Spot>
    </div>
  );
}

function FileChip({ name, add, del }: { name: string; add: number; del: number }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 font-mono text-[16px] whitespace-nowrap">
      <span className="text-muted">
        <Icon name="file" size={16} />
      </span>
      <span className="text-paper">{name}</span>
      <DiffStat add={add} del={del} />
    </span>
  );
}

const RUN_MODES = ['Local', 'Worktree', 'Cloud'] as const;

function CodexThread({ state }: { state: SpotState }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <p className="ml-auto max-w-[380px] shrink-0 rounded-2xl rounded-br-sm bg-ink-soft px-4 py-2 text-[18px] leading-snug text-paper">
        fetchUser 失敗時自動重試，最多 3 次
      </p>
      <p className="mt-4 shrink-0 text-[18px] leading-snug text-paper">
        加好重試，也補了測試，全部通過。
      </p>
      <div className="mt-2 flex shrink-0 gap-2">
        <FileChip name="client.ts" add={12} del={3} />
        <FileChip name="client.test.ts" add={6} del={1} />
      </div>

      {/* 輸入框 */}
      <div className="mt-auto shrink-0 rounded-2xl border-2 border-line bg-panel-lift px-3.5 pt-2.5 pb-2">
        <p className="text-[17px] leading-snug text-faint">
          Ask Codex anything, @ to add files, / for commands
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className={`${CHIP} w-8 justify-center px-0`}>
            <Icon name="plus" size={16} />
          </span>
          <span className={CHIP}>
            <Icon name="shield" size={16} />
            Approve for me
          </span>
          <span className={CHIP}>6 Sol</span>
          <span className={CHIP}>Medium</span>
          <span className="ml-auto text-muted">
            <Icon name="mic" />
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper text-on-accent">
            <Icon name="send" size={16} />
          </span>
        </div>
      </div>

      {/* 輸入框下方那一列：在哪裡跑 ＋ 分支 */}
      <Spot
        no={2}
        state={state}
        className="mt-2 flex h-11 shrink-0 items-center gap-2 rounded-xl px-1.5"
        badge="top-1/2 right-1.5 -translate-y-1/2"
      >
        <span className="flex h-8 items-center gap-0.5 rounded-lg border border-line bg-panel p-0.5">
          {RUN_MODES.map((mode, index) => (
            <span
              key={mode}
              className={`flex h-full items-center rounded-md px-2.5 text-[16px] ${
                index === 0
                  ? 'border border-paper bg-panel-lift font-semibold text-paper'
                  : 'text-muted'
              }`}
            >
              {mode}
            </span>
          ))}
        </span>
        <span className={CHIP}>
          <Icon name="branch" size={16} />
          main
        </span>
      </Spot>
    </div>
  );
}

const REVIEW_SCOPES = ['Unstaged', 'Staged', 'Commit', 'Branch', 'Last turn'] as const;

type HunkKind = 'meta' | 'add' | 'del';

/** 等寬 17px 一字約 10.2px；最長一行（含 ＋ 號）34 字 ≈ 347px */
const HUNK: readonly { kind: HunkKind; text: string }[] = [
  { kind: 'meta', text: '@@ -18,3 +18,6 @@' },
  { kind: 'del', text: '  return fetch(url);' },
  { kind: 'add', text: '  for (let i = 0; i < 3; i++) {' },
  { kind: 'add', text: '    const res = await fetch(url);' },
  { kind: 'add', text: '    if (res.ok) return res;' },
  { kind: 'add', text: '  }' },
];

/** 逐行留言插在這一行（index）後面 */
const COMMENT_AFTER = 4;

function HunkRow({ kind, text }: { kind: HunkKind; text: string }) {
  if (kind === 'meta') {
    return <div className="bg-panel-lift px-3 whitespace-pre text-faint">{text}</div>;
  }
  const add = kind === 'add';
  return (
    <div
      className={`flex border-l-4 pl-2 whitespace-pre ${
        add ? 'border-l-teal text-paper' : 'border-l-coral text-coral'
      }`}
    >
      <span className={`w-[1.2ch] shrink-0 font-semibold ${add ? 'text-teal' : 'text-coral'}`}>
        {add ? '+' : '−'}
      </span>
      {text}
    </div>
  );
}

function ReviewPane({ state }: { state: SpotState }) {
  return (
    <Spot
      no={3}
      state={state}
      className="flex w-[424px] shrink-0 flex-col border-l border-line px-3 py-2.5"
      badge="top-1/2 -left-[16px] -translate-y-1/2"
    >
      <div className="flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-line bg-panel-lift p-0.5">
        {REVIEW_SCOPES.map((scope, index) => (
          <span
            key={scope}
            className={`flex h-full flex-auto items-center justify-center rounded-md px-1.5 text-[16px] whitespace-nowrap ${
              index === 0 ? 'border border-line bg-panel font-semibold text-paper' : 'text-muted'
            }`}
          >
            {scope}
          </span>
        ))}
      </div>

      <div className="mt-2 flex h-9 shrink-0 items-center gap-2">
        <span className={`${CHIP} font-mono`}>
          <Icon name="repo" size={16} />
          acme-web
          <Icon name="chevron" size={16} />
        </span>
        <span className={`ml-auto ${MOCK_BTN}`}>Stage all</span>
        <span className={MOCK_BTN}>Revert all</span>
      </div>

      <div className="mt-2 flex h-8 shrink-0 items-center gap-2 font-mono text-[16px]">
        <span className="text-muted">
          <Icon name="file" size={16} />
        </span>
        <span className="text-paper">src/api/client.ts</span>
        <span className="ml-auto">
          <DiffStat add={12} del={3} />
        </span>
      </div>

      <div className="mt-1.5 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-panel font-mono text-[17px] leading-[26px]">
        {HUNK.map((row, index) => (
          <div key={row.text}>
            <HunkRow kind={row.kind} text={row.text} />
            {index === COMMENT_AFTER && (
              <div className="mx-2 my-1.5 flex items-center gap-2 rounded-md border border-line bg-panel-lift px-2.5 py-1 font-sans text-[16px] leading-snug text-paper">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-paper text-on-accent">
                  <Icon name="plus" size={14} />
                </span>
                失敗後先等一下再重試
              </div>
            )}
          </div>
        ))}
      </div>
    </Spot>
  );
}

function TerminalPanel({ state }: { state: SpotState }) {
  return (
    <Spot
      no={4}
      state={state}
      className="h-[104px] shrink-0 border-t border-line bg-panel-lift px-4 pt-2"
      badge="top-2 right-3"
    >
      <div className="flex h-7 items-center gap-2 text-[16px]">
        <span className="text-muted">
          <Icon name="terminal" size={16} />
        </span>
        <span className="font-semibold text-paper">Terminal</span>
        <span className="font-mono text-faint">/bin/zsh</span>
      </div>
      <div className="mt-1 font-mono text-[17px] leading-[26px]">
        <p className="text-paper">
          <span className="text-lime">➜</span> acme-web git:(main) npm test
        </p>
        <p className="text-lime">✓ 14 passed</p>
      </div>
    </Spot>
  );
}

function CodexWindow({ state }: { state: SpotState }) {
  return (
    <BrandFrame brand="chatgpt" className="shrink-0">
      <div
        role="group"
        aria-label="ChatGPT 桌面版的 Codex 畫面示意"
        className="flex h-[590px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-line bg-panel"
      >
        {/* 標題列：左邊讓給「ChatGPT」貼紙（原本的淡色小字 ChatGPT 跟貼紙重複，拿掉），右半邊刻意留空 */}
        <div
          className={`flex h-10 shrink-0 items-center gap-2 border-b border-line bg-panel-lift pr-4 ${TITLEBAR_CLEAR}`}
        >
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-3 rounded-full bg-line" />
          ))}
        </div>

        <div className="flex min-h-0 flex-1">
          <CodexSidebar state={state} />
          <div className="flex min-w-0 flex-1 flex-col">
            <CodexHeader state={state} />
            <div className="flex min-h-0 flex-1">
              <CodexThread state={state} />
              <ReviewPane state={state} />
            </div>
            <TerminalPanel state={state} />
          </div>
        </div>
      </div>
    </BrandFrame>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 右欄：五張卡片
 * ══════════════════════════════════════════════════════════════ */

function CalloutCard({ item, on, pick }: { item: Callout; on: boolean; pick: (no: SpotNo) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        pick(item.no);
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex h-[92px] w-full shrink-0 items-center gap-4 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${FOCUS_RING} ${
        on ? CARD_ON : CARD_OFF
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full border-2 font-mono text-[19px] leading-none font-semibold transition-colors duration-200 ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-paper bg-panel text-paper'
        }`}
      >
        {item.no}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[23px] leading-tight font-semibold whitespace-nowrap text-paper">
          {item.title}
        </span>
        <span className="text-[19px] leading-snug whitespace-nowrap text-muted">{item.line}</span>
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 下方：跟 Work 比
 * ══════════════════════════════════════════════════════════════ */

const WORK_DIFFS = [
  { label: 'Git、shell 指令', text: 'Work 藏起來，Codex 都看得到' },
  { label: 'Pull requests pane', text: 'Work 沒有；Codex 啟用後就有' },
  { label: '紀錄', text: 'Codex 的紀錄跟 Chat、Work 分開' },
  { label: '用量', text: 'Work 與 Codex 共用額度' },
] as const;

function WorkStrip() {
  return (
    <div className="flex h-[84px] shrink-0 items-stretch overflow-hidden rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift">
      <div className="flex w-[196px] shrink-0 flex-col justify-center px-5">
        <span className="text-[22px] leading-tight font-semibold text-paper">跟 Work 比</span>
        <span className="mt-1 text-[16px] leading-tight text-faint">差在這四件事</span>
      </div>
      <dl className="grid min-w-0 flex-1 grid-cols-4">
        {WORK_DIFFS.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col justify-center border-l border-line px-5">
            <dt className="text-[17px] leading-6 text-faint">{item.label}</dt>
            <dd className="text-[20px] leading-snug whitespace-nowrap text-paper">{item.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 10 頁 · ChatgptCodexDemo — ChatGPT Codex：寫程式的地方
 * ══════════════════════════════════════════════════════════════ */

export function ChatgptCodexDemo() {
  const [active, setActive] = useState<SpotNo | null>(null);
  const state: SpotState = {
    active,
    pick: (no) => setActive((prev) => (prev === no ? null : no)),
  };

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-4">
      <div className="grid h-[620px] shrink-0 grid-cols-[1150px_1fr] gap-7">
        {/* ── 左：Codex 視窗示意 ── */}
        <div className="flex min-h-0 min-w-0 flex-col gap-2">
          <CodexWindow state={state} />
          <p className="h-[22px] shrink-0 text-[17px] leading-[22px] whitespace-nowrap text-faint">
            介面示意：依官方文件繪製，實際畫面以 App 為準 · 2026-07-09（26.707）起 Codex 併入 ChatGPT 桌面版
          </p>
        </div>

        {/* ── 右：五個編號（標題靠左，右上留給浮水印）── */}
        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="h-[108px] shrink-0">
            <p className={`${LABEL_FAINT} leading-6`}>Codex 畫面導覽</p>
            <h3 className="mt-2 text-[30px] leading-tight font-semibold text-paper">五個常用的地方</h3>
            <p className="mt-1 text-[19px] text-muted">點一項，左邊標出它在哪</p>
          </div>
          <div role="group" aria-label="Codex 畫面的五個地方" className="mt-3 flex flex-col gap-2">
            {CALLOUTS.map((item) => (
              <CalloutCard key={item.no} item={item} on={active === item.no} pick={state.pick} />
            ))}
          </div>
        </div>
      </div>

      <WorkStrip />
    </div>
  );
}
