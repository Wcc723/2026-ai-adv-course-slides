import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { BrandFrame, TITLEBAR_CLEAR } from './brand-badge';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 兩家桌面版的介面：Claude
 *
 *   第 11 頁  ClaudeAppDemo  Claude 桌面版的介面：對話與 Code（沒有投票 → 根容器 720）
 *   （第 8–10 頁 ChatGPT 的 Chat／Work／Codex 在 demos-interface-chatgpt.tsx、
 *     demos-interface-codex.tsx；這一頁跟它們共用同一套手繪視窗的視覺語言，但不互相 import，
 *     只共用 brand-badge.tsx 的品牌貼紙）
 *   頁碼依 2026-11-19 的 47 頁版本（第 8–11 頁從 2026-11-18 codd://note/note-plus 那一輪之後都沒變）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-17 的修改要求（由主控轉述，CODD 筆記裡沒有這一段）：
 *   「Claude 沒有這樣分（Chat／Work／Codex），他只有一般對話跟 Code
 *    （但對話同時具有 Work 功能）」「我記得沒有 Cowork」。
 * 查證後的寫法：前半句對已經換到新版的帳號成立；後半句只對一半 ——
 * 新版沒有可以選的 Cowork，但「Claude Cowork」這個名稱還在（產品頁、說明中心的
 * 文章標題、Chrome 側邊欄一打開就是一個 Cowork session），所以畫面寫
 * 「Cowork 已併入」，不寫「沒有 Cowork」。
 * 講師也說過舊頁字太多，這一頁用介面示意來講，文字只留每條一行。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-17，全部是實際讀到全文的官方頁面）
 * ──────────────────────────────────────────────────────────────
 * https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude
 *   「these are merged into a single conversation」「with no mode to choose」
 *   「What you could previously only do in Claude Cowork is available from any conversation.」
 *   分批推出：「rolling out gradually to Pro, Max, and Ultra plans on web, desktop, and mobile」；
 *   「your message box still shows "Chat" and "Cowork" options, you don't have it yet」；
 *   換過去之後「you can't switch back」。
 *   Get finished files back：文件、有公式的試算表、PowerPoint 開得了的簡報，可以下載。
 *   Files and folders：桌面版可以授權電腦上的資料夾。
 *   Browsing：「the browser built into Claude Desktop or your own Chrome browser through
 *     Claude in Chrome」。
 *   Computer use：「In beta on Pro, Max, and Ultra plans」。
 *   Scheduled tasks「can run in the cloud, so they keep going when your computer is off」。
 *   連接器在 Customize > Connectors。
 *   權限：「A permission setting in the message box」，Auto（不逐步問、動手前跑自動安全檢查；
 *     Pro／Max／Ultra／Team 陸續改成預設）、Manual（每個動作先問；Enterprise 預設）。
 *   「Your quick questions and longer tasks live together in Recents.」
 *   「Projects work in every conversation.」
 *   Research：「click the "+" button below the chat input, then choose "Research."」，
 *     或輸入 /deep-research；新版沒有網路搜尋開關。
 *   「The model picker and the "Code" tab are where they were.」
 *   限制：無痕對話（Incognito）仍開在舊版，不能建立檔案、不能跑程式碼（畫面沒寫，太細）。
 * https://support.claude.com/en/articles/12138966-release-notes
 *   2026-09-16「Claude Cowork comes to every conversation」（Pro、Max 開始分批）；
 *   2026-07-07「Chat and Cowork also share one home now」（Cowork 從那時起就不是獨立分頁）。
 * https://claude.com/product/cowork
 *   橫幅「Claude Cowork is now just Claude.」；FAQ：還沒推到的帳號「you'll find Cowork next to Chat」。
 * https://claude.com/resources/articles/cowork-is-now-claude（2026-09-16）
 *   「Team and Free plans will follow soon」；更新：10/23 Enterprise GA、11/12 Team GA。
 *   之後沒有 Free 的更新 → 畫面寫「Free 尚未」。
 * https://support.claude.com/en/articles/18342806-set-up-and-manage-the-new-unified-claude-experience-for-your-team-organization
 *   Team「turns on by default on December 1, 2026」；2027-02-01 停用舊的分開版本（畫面只寫 12/1）。
 * https://support.claude.com/en/articles/17444462-set-up-and-manage-the-new-unified-claude-experience-for-your-enterprise-organization
 *   Enterprise 2026-11-16 預設開啟；ZDR、HIPAA、CMEK 的組織暫時沒有（畫面沒寫）。
 * https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile
 *   舊版：訊息框左下角選「Cowork」；新版「there's no "Cowork" option to select」；
 *   「+」選單裡有「Memory」；Chrome 側邊欄「starts a Cowork session」。
 * https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
 *   「click "Scheduled" in the left sidebar」；排程在雲端跑；「+」選單控制可用的連接器。
 * https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork
 *   「Find Projects in the left navigation panel and click the "+" button」。
 * https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude
 *   .xlsx／.pptx／.docx／PDF，Free 到 Enterprise 全部方案都能用。
 * https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them
 *   側欄有「Artifacts」分頁；「select "Output" in the message box and choose a template」；
 *   Docs、Slides、Design 全部方案，Data 限 Pro／Max／Ultra／Team／Enterprise。
 * https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork
 *   computer use 是 beta，Pro／Max／Ultra，macOS 與 Windows；Team、Enterprise 不能用。
 * https://code.claude.com/docs/en/desktop-quickstart
 *   「Claude Code is in the Code tab at the top of the app's sidebar.」
 *   「If the tabs show only icons, hover over one to see its name.」
 *   需要 Pro、Max、Ultra、Team 或 Enterprise（Free 點了會要你升級）。
 * https://code.claude.com/docs/en/desktop
 *   #start-a-session  prompt box 下方那一列：環境選擇器「the first control in the row」、
 *                     專案資料夾「next to the environment selector」、權限模式、
 *                     模型「toward the right end of the row」。
 *   #choose-a-permission-mode  Manual、Accept edits、Plan、Auto、Bypass permissions
 *                     （舊版叫 Ask permissions、Auto accept edits、Plan mode）。
 *   #environment-configuration  Local／SSH／Cloud，Windows 另有 WSL。
 *   Worktree：「turn on Worktree in the row under the prompt box」，預設關。
 *   用量環：「the usage ring is in the row under the prompt box」，點開看方案用量。
 *   窗格：session 標題列的圖示按鈕「Hover to see each button's name, such as Terminal,
 *         Changes for the diff view, Browser, and Files」，其他窗格在 ⋮ 選單。
 *   側欄：「+ New」（Cmd/Ctrl+N）、「Customize」或「Plugins」。
 *   「Desktop older than v2.37337.0: update to get the current layout.」
 * https://claude.com/docs/cowork/changelog  v2.42304.0（2026-10-15）
 *   「the row under the message box to hold the permission mode, one menu for model and effort,
 *    and the usage ring」；「+」與麥克風移進訊息框裡。
 *
 * 查證者標成不可靠、或直接判錯的（畫面上都沒有用）
 *   - Code 分頁那一列「由左到右」的完整順序：文件只寫了環境第一、資料夾第二、模型靠右；
 *     Worktree 的位置文件寫「在那一列」，changelog 卻寫「Branch and Worktree are at the
 *     bottom of the folder menu」，兩者衝突。這一頁照文件畫在那一列，整列順序算示意。
 *   - 「v4.16336.0 全 App 換新外觀」：那一行在 changelog 的 3P 區塊，不是一般帳號 → 不提。
 *   - 「專案不能在 Claude Code 用」：不完整（Code 分頁有新版 Projects beta）→ 這頁不談專案細節，
 *     只寫官方原句「Projects work in every conversation」。
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 整個視窗是依上面文件手繪的示意，不是截圖；畫面上標「介面示意」。
 *   - 對話分頁的英文名稱官方沒寫 → 側欄最上方畫成圖示；Code 分頁旁的黑色小標籤
 *     是在示意「滑過去才看得到名稱」。
 *   - 「New chat」是推測的標籤（官方文件沒寫新對話按鈕的字）。
 *   - 「+」選單裡的「加入資料夾」：Academy 寫可以從訊息框加資料夾，但英文字樣與是否在「+」
 *     選單裡沒查到，所以用中文、放在「+」選單是示意。Research、Memory、Connectors 有文件。
 *   - 模型選單「位置不變」，畫在訊息框右下是示意；模型 Opus 5.5、Effort High 取自
 *     第 13 頁〈模型強度〉的資料。Auto、Output 在訊息框裡有文件，左右位置是示意。
 *   - 對話內容、資料夾「訪談紀錄」、檔案「訪談重點.pptx」、側欄的對話與 session 名稱、
 *     shop-web、終端機的輸出，全部是示意。
 *   - 環境選單簡化成 Local／SSH／Cloud／WSL＋New environment（實際每組底下列的是存好的環境）。
 *   - 窗格按鈕實際只有圖示、滑過才有名稱；這裡把名稱直接寫出來。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 *   右上的對照表：ChatGPT「Chat｜Work｜Codex」對 Claude「對話（Cowork 已併入）｜Code 分頁」，
 *   Claude 那一列就是切換按鈕；視窗側欄最上方的兩個分頁圖示也能切。一進頁面是「對話」。
 *   左邊五條重點跟視窗裡的編號一一對應：點重點，視窗裡那一塊加 4px acid 外框與編號；
 *   點視窗裡有編號的地方，也會選到那一條重點。
 *     對話   ①檔案卡 ②工作步驟 ③「+」與 Output（展開兩個選單）④ Auto（展開權限選單）⑤側欄
 *     Code   ①環境（展開選單）②資料夾＋Worktree ③權限模式（展開五種）④模型＋用量環
 *            ⑤窗格（視窗換成開工後的 session 畫面）
 *   鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點，
 *         之後按方向鍵、空白鍵照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid   選中的切換按鈕、重點、視窗裡的外框與編號；對照表裡對應到的 ChatGPT 格子（2px 實線框）
 *   warn   底部「分批推出中」的提醒（6px 左粗條＋字）
 *   coral  視窗左上角的「Claude」品牌貼紙（brand-badge.tsx，實心＋ on-accent）。
 *          講師 2026-11-18（codd://note/note-plus）要明顯、可以彩色的品牌標示，
 *          所以這一頁是 acid、warn 之外的第三支；貼紙在視窗上緣、提醒在左下，不會混讀。
 *   其餘都是中性色。淡底 acid/14 一律配 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768；根容器 1740 × 720）
 * ──────────────────────────────────────────────────────────────
 *   左 600：標籤 24 ＋ 6 ＋ 標題 38 ＋ 6 ＋ 副標最多 2 行 56 ≈ 130
 *           ＋ 20 ＋ 重點 5 × 約 79（py 24 ＋ 標題 29 ＋ 4 ＋ 一行 26）＋ 間距 4 × 8 ≈ 427
 *           ＋ 提醒 2 行約 72 ＝ 649（mt-auto 吸收剩下的空間）
 *           重點一行 19px，內文寬約 495 → 每條都控制在一行。
 *   右 1108：對照表 2 列（48 ＋ 8 ＋ 54）＝ 110 ＋ 32 ＋ 視窗 578
 *           （對照表與視窗之間原本 16；2026-11-18 加了騎在視窗左上角的「Claude」貼紙，
 *            往上超出 20、含外環 23，所以視窗多讓 16，貼紙跟「對話」按鈕之間留 9）
 *           視窗：標題列 40 ＋ 本體 534（側欄 236 寬，主畫面約 867 寬）
 *           對話：上 16 ＋ 對話內容約 266 … 訊息框約 103 ＋ 下 12；
 *                 「+」與 Output 兩個選單（144）往上開，只蓋到檔案卡底下的兩條示意文字，
 *                 檔案卡與工作步驟都不會被擋住（所以示意文字放在檔案卡之後）。
 *           Code 新 session：上 88 ＋ prompt box 107 ＋ 16 ＋ 那一列 36 ＋ 往下開的選單最高 213 ≈ 472
 *           Code session：標題列 64（編號落在標題列裡，不會壓到視窗標題列）＋ 對話欄／Terminal 窗格
 *           側欄 ⑤ 的編號放在區塊右緣中間，避免蓋到 Projects 的圖示。
 *   任何互動都只換視窗裡面的內容，不改外框高度；沒有容器會捲動。
 *   浮水印在舞台右上（x 1692–1872、y 104–147），根容器的上緣在舞台 y 約 184，碰不到；
 *   即使如此，根容器右上 260 × 120 仍只有空白：對照表靠左、寬 814（右邊留 294），
 *   視窗從 y 142 開始（貼紙從 y 122 開始，在根容器左半邊）。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-antigravity.tsx，不 import）───────── */

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

/** 視窗裡的小控制項（訊息框的 chip、那一列的選單） */
const CHIP =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-panel px-3 text-[16px] whitespace-nowrap text-paper';

/** 彈出選單 */
/** 寬度各自指定（同一個 class 字串裡不要放兩個 w-[…]） */
const MENU_BOX = 'flex flex-col rounded-xl border-2 border-line bg-panel p-1.5';
const MENU = `absolute z-20 ${MENU_BOX}`;
const MENU_ITEM = 'flex h-8 items-center gap-2 rounded-md px-2.5 text-[17px] whitespace-nowrap text-paper';

/* ── 圖示（裝飾用，aria-hidden）──────────────────────────── */

type IconName =
  | 'chat'
  | 'code'
  | 'plus'
  | 'folder'
  | 'globe'
  | 'clock'
  | 'shapes'
  | 'sliders'
  | 'pin'
  | 'task'
  | 'mic'
  | 'up'
  | 'download'
  | 'monitor'
  | 'server'
  | 'cloud'
  | 'shield'
  | 'terminal'
  | 'diff'
  | 'browser'
  | 'file'
  | 'branch'
  | 'search'
  | 'layers'
  | 'plug';

const ICON_PATHS: Record<IconName, ReactNode> = {
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  shapes: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <circle cx="16.5" cy="7.5" r="3.5" />
      <path d="M7.5 14l3.5 6H4z" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  pin: <path d="M9 4h6l-1 5 3 3H7l3-3zM12 12v8" />,
  task: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  cloud: <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" />,
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </>
  ),
  diff: <path d="M12 4v8M8 8h8M8 18h8" />,
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  layers: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  plug: <path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4" />,
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v10M18 9c0 5-7 4-11 8.5" />
    </>
  ),
};

function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Caret() {
  return (
    <span aria-hidden="true" className="text-[16px] leading-none text-faint">
      ▾
    </span>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 ${
        on ? 'justify-end border-paper bg-paper' : 'justify-start border-line bg-panel-lift'
      }`}
    >
      <span className={`size-3.5 rounded-full ${on ? 'bg-panel' : 'bg-muted'}`} />
    </span>
  );
}

function UsageRing() {
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="none" stroke="var(--color-line)" strokeWidth={4} />
      <circle
        cx="14"
        cy="14"
        r="10"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="22 63"
        transform="rotate(-90 14 14)"
      />
    </svg>
  );
}

function Skeleton({ width }: { width: string }) {
  return <span aria-hidden="true" className={`block h-2.5 rounded-full bg-line-soft ${width}`} />;
}

/* ── 視窗裡有編號的區塊 ─────────────────────────────────── */

const BADGE_TOP_LEFT = '-top-3.5 -left-3';

function SpotBadge({ n, on, place = BADGE_TOP_LEFT }: { n: number; on: boolean; place?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${place} z-10 grid size-7 place-items-center rounded-full font-mono text-[16px] leading-none font-semibold ${
        on
          ? 'bg-acid text-on-accent shadow-[0_0_0_3px_var(--color-panel)]'
          : 'border-2 border-line bg-panel text-muted'
      }`}
    >
      {n}
    </span>
  );
}

/** 點了會選到對應的重點；選中時加 4px acid 外框 */
function SpotButton({
  n,
  label,
  on,
  onPick,
  className,
  badgePlace,
  children,
}: {
  n: number;
  label: string;
  on: boolean;
  onPick: () => void;
  className: string;
  /** 編號的位置（預設左上角） */
  badgePlace?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${n}. ${label}`}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`relative text-left transition-[outline-color] duration-150 ${
        on
          ? 'outline-4 outline-offset-4 outline-acid'
          : 'outline-2 outline-offset-4 outline-transparent hover:outline-line'
      } ${FOCUS_RING} ${className}`}
    >
      {children}
      <SpotBadge n={n} on={on} place={badgePlace} />
    </button>
  );
}

/* ── 資料 ───────────────────────────────────────────────── */

type ViewId = 'chat' | 'code';
type ChatSpot = 'file' | 'steps' | 'plus' | 'permission' | 'sidebar';
type CodeSpot = 'env' | 'folder' | 'mode' | 'model' | 'panes';

interface Callout<T extends string> {
  id: T;
  /** 12 字以內 */
  title: string;
  /** 一行，26 字以內 */
  line: string;
}

const CHAT_CALLOUTS: readonly Callout<ChatSpot>[] = [
  { id: 'file', title: '交出成品檔案', line: 'docx、xlsx、pptx、pdf，做好就能下載' },
  { id: 'steps', title: '動用你的電腦', line: '本機資料夾、瀏覽器、computer use（beta）' },
  { id: 'plus', title: '「+」與 Output', line: 'Research、連接器、範本都從這裡叫出來' },
  { id: 'permission', title: '權限放在訊息框', line: 'Auto 不逐步問你；Manual 每個動作先問' },
  // 16761823 原文是「can run in the cloud」；預設在雲端只驗證到 Pro／Max／Ultra（15520349）→「可在」
  { id: 'sidebar', title: '排程與專案', line: 'Scheduled 可在雲端跑；專案每個對話都能用' },
];

const CODE_CALLOUTS: readonly Callout<CodeSpot>[] = [
  { id: 'env', title: '選在哪裡跑', line: 'Local、SSH、Cloud；Windows 多一個 WSL' },
  { id: 'folder', title: '資料夾與 Worktree', line: 'Worktree 預設關，打開就改在隔離的副本' },
  { id: 'mode', title: '權限模式', line: '五種，決定改檔、跑指令前要不要問你' },
  { id: 'model', title: '模型與用量', line: '模型、Effort 一個選單；用量環看方案額度' },
  { id: 'panes', title: '開工後的窗格', line: 'Terminal、Changes、Browser、Files 並排' },
];

const VIEW_INFO: Record<ViewId, { label: string; title: string; sub: string }> = {
  chat: {
    label: 'Claude Desktop · 對話',
    title: 'Chat、Cowork 合成一個對話',
    sub: '不用先選模式；ChatGPT 放在 Work 的事，這裡直接交代',
  },
  code: {
    label: 'Claude Desktop · Code 分頁',
    title: 'Code 分頁：寫程式的地方',
    // 「對應」不是「等於」：Code 有 SSH／WSL、五種權限模式，Codex 有 Cloud 任務、Code Review
    sub: '對應 ChatGPT 的 Codex；要付費方案。環境切換見第 33–34 頁',
  },
};

function numberOf<T extends string>(list: readonly Callout<T>[], id: T) {
  return list.findIndex((item) => item.id === id) + 1;
}

function titleOf<T extends string>(list: readonly Callout<T>[], id: T) {
  return list.find((item) => item.id === id)?.title ?? '';
}

/* ── 右上：對照表（Claude 那一列就是切換按鈕）──────────────── */

function ViewButton({
  on,
  onClick,
  className,
  children,
}: {
  on: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onClick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex h-[54px] items-center justify-center gap-3 rounded-xl border-2 border-l-[6px] px-4 transition-colors duration-150 ${FOCUS_RING} ${
        on ? 'border-acid border-l-acid bg-acid/14' : 'border-line border-l-line bg-panel-lift hover:border-acid'
      } ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

function MappingStrip({ view, onView }: { view: ViewId; onView: (view: ViewId) => void }) {
  const gptCells = [
    { name: 'Chat', on: view === 'chat' },
    { name: 'Work', on: view === 'chat' },
    { name: 'Codex', on: view === 'code' },
  ];

  return (
    <div
      role="group"
      aria-label="ChatGPT 與 Claude 的對照；Claude 這一列可以切換下面的視窗"
      className="grid w-[814px] shrink-0 grid-cols-[112px_repeat(3,224px)] items-center gap-x-2.5 gap-y-2"
    >
      <span className="text-[19px] font-semibold text-muted">ChatGPT</span>
      {gptCells.map((cell) => (
        <span
          key={cell.name}
          className={`flex h-12 items-center justify-center rounded-xl border-2 text-[21px] transition-colors duration-150 ${
            cell.on
              ? 'border-acid bg-panel font-semibold text-paper'
              : 'border-line-soft bg-panel-lift text-muted'
          }`}
        >
          {cell.name}
        </span>
      ))}

      <span className="text-[19px] font-semibold text-muted">Claude</span>
      <ViewButton on={view === 'chat'} onClick={() => onView('chat')} className="col-span-2">
        <span className="text-[22px] font-semibold text-paper">對話</span>
        <span className="text-[17px] text-muted">Cowork 已併入</span>
      </ViewButton>
      <ViewButton on={view === 'code'} onClick={() => onView('code')}>
        <span className="text-[22px] font-semibold text-paper">Code 分頁</span>
      </ViewButton>
    </div>
  );
}

/* ── 視窗：側欄 ─────────────────────────────────────────── */

function TabButton({
  icon,
  label,
  on,
  onClick,
}: {
  icon: IconName;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={(event) => {
        onClick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`grid size-10 shrink-0 place-items-center rounded-lg border transition-colors duration-150 ${FOCUS_RING} ${
        on ? 'border-line bg-panel text-paper' : 'border-transparent text-muted hover:border-line'
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function SideRow({
  icon,
  text,
  tone = 'paper',
  trailing,
  active = false,
}: {
  icon: IconName;
  text: string;
  tone?: 'paper' | 'muted';
  trailing?: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`flex h-8 items-center gap-2.5 rounded-lg px-2 text-[17px] whitespace-nowrap ${
        tone === 'paper' ? 'text-paper' : 'text-muted'
      } ${active ? 'border border-line bg-panel' : ''}`}
    >
      <Icon name={icon} className="size-[18px]" />
      <span className="min-w-0 flex-1 truncate">{text}</span>
      {trailing}
    </span>
  );
}

function SideHeading({ children }: { children: ReactNode }) {
  return <span className="block px-2 pt-2 text-[16px] text-faint">{children}</span>;
}

function ChatSidebar({ pick, onPick }: { pick: ChatSpot; onPick: (id: ChatSpot) => void }) {
  return (
    <>
      <SideRow icon="plus" text="New chat" />
      <SpotButton
        n={numberOf(CHAT_CALLOUTS, 'sidebar')}
        label={titleOf(CHAT_CALLOUTS, 'sidebar')}
        on={pick === 'sidebar'}
        onPick={() => onPick('sidebar')}
        className="mt-1 flex flex-col gap-0.5 rounded-lg"
        badgePlace="top-1/2 -right-3 -translate-y-1/2"
      >
        <SideRow
          icon="folder"
          text="Projects"
          trailing={
            <span aria-hidden="true" className="text-[19px] leading-none text-muted">
              +
            </span>
          }
        />
        <SideRow icon="shapes" text="Artifacts" />
        <SideRow icon="clock" text="Scheduled" />
      </SpotButton>
      <SideRow icon="sliders" text="Customize" />

      <SideHeading>Pinned</SideHeading>
      <SideRow icon="pin" text="週報範本" tone="muted" />

      <SideHeading>Recents</SideHeading>
      <SideRow icon="task" text="訪談重點簡報" tone="muted" />
      <SideRow icon="task" text="整理下載資料夾" tone="muted" />
      <SideRow icon="chat" text="這句英文怎麼說" tone="muted" />
    </>
  );
}

function CodeSidebar({ inSession }: { inSession: boolean }) {
  return (
    <>
      <SideRow
        icon="plus"
        text="New"
        active={!inSession}
        trailing={<span className="font-mono text-[16px] text-faint">⌘N</span>}
      />
      <SideHeading>shop-web</SideHeading>
      <SideRow icon="code" text="結帳頁按鈕沒反應" tone="muted" active={inSession} />
      <SideRow icon="code" text="加上深色模式" tone="muted" />
      <SideHeading>blog</SideHeading>
      <SideRow icon="code" text="升級相依套件" tone="muted" />
      <span className="mt-auto">
        <SideRow icon="sliders" text="Customize" />
      </span>
    </>
  );
}

/* ── 視窗：對話 ─────────────────────────────────────────── */

function ChatMain({ pick, onPick }: { pick: ChatSpot; onPick: (id: ChatSpot) => void }) {
  const spot = (id: ChatSpot) => ({
    n: numberOf(CHAT_CALLOUTS, id),
    label: titleOf(CHAT_CALLOUTS, id),
    on: pick === id,
    onPick: () => onPick(id),
  });

  return (
    // 上下內距原本 24／20，視窗為了左上角的「Claude」貼紙縮了 16，這裡各還 8，
    // 「+」選單跟檔案卡之間維持原本的距離
    <div className="flex h-full flex-col px-10 pt-4 pb-3">
      {/* 對話內容（示意） */}
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3">
        <span className="self-end rounded-2xl rounded-br-md border border-line bg-panel-lift px-4 py-2 text-[19px] leading-snug text-paper">
          把「訪談紀錄」裡的 5 份訪談整理成簡報
        </span>

        <SpotButton {...spot('steps')} className="flex w-[460px] flex-col gap-1.5 rounded-xl border border-line-soft bg-panel px-4 py-2.5">
          <span className="flex items-center gap-2.5 text-[17px] text-muted">
            <Icon name="folder" className="size-[18px]" />
            讀取「訪談紀錄」資料夾的 5 個檔案
          </span>
          <span className="flex items-center gap-2.5 text-[17px] text-muted">
            <Icon name="globe" className="size-[18px]" />
            用瀏覽器查了 3 篇產業報告
          </span>
        </SpotButton>

        <SpotButton {...spot('file')} className="flex w-[400px] items-center gap-3.5 rounded-xl border-2 border-line bg-panel px-4 py-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-panel-lift text-paper">
            <Icon name="file" className="size-6" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[19px] leading-snug font-semibold text-paper">訪談重點.pptx</span>
            <span className="text-[16px] leading-snug text-faint">簡報 · 可以下載</span>
          </span>
          <Icon name="download" className="size-5 text-muted" />
        </SpotButton>

        <span className="flex flex-col gap-2.5 py-1">
          <Skeleton width="w-full" />
          <Skeleton width="w-[68%]" />
        </span>
      </div>

      {/* 訊息框：沒有 Chat／Cowork 可選 */}
      <div className="relative mx-auto mt-auto w-full max-w-[760px]">
        {pick === 'plus' && (
          <span className="absolute bottom-full left-0 z-20 mb-3 flex gap-3">
            <span className={`${MENU_BOX} w-[230px]`}>
              <span className={MENU_ITEM}>
                <Icon name="search" className="size-[18px] text-muted" />
                Research
              </span>
              <span className={MENU_ITEM}>
                <Icon name="layers" className="size-[18px] text-muted" />
                <span className="flex-1">Memory</span>
                <Switch on />
              </span>
              <span className={MENU_ITEM}>
                <Icon name="plug" className="size-[18px] text-muted" />
                <span className="flex-1">Connectors</span>
                <span aria-hidden="true" className="text-faint">
                  ›
                </span>
              </span>
              <span className={MENU_ITEM}>
                <Icon name="folder" className="size-[18px] text-muted" />
                加入資料夾
              </span>
            </span>
            <span className={`${MENU_BOX} w-[180px]`}>
              {['Docs', 'Slides', 'Design', 'Data'].map((name) => (
                <span key={name} className={MENU_ITEM}>
                  <Icon name="shapes" className="size-[18px] text-muted" />
                  {name}
                </span>
              ))}
            </span>
          </span>
        )}
        {pick === 'permission' && (
          <span className={`${MENU} bottom-full left-[176px] mb-3 w-[200px]`}>
            <span className={`${MENU_ITEM} bg-panel-lift font-semibold`}>
              <span className="w-4 text-center">✓</span>
              Auto
            </span>
            <span className={MENU_ITEM}>
              <span className="w-4" />
              Manual
            </span>
          </span>
        )}

        <div className="rounded-2xl border-2 border-line bg-panel-lift px-4 pt-3 pb-3">
          <span className="block px-1 text-[19px] leading-snug text-faint">直接交代要做的事…</span>
          <div className="mt-4 flex items-center gap-4">
            <SpotButton {...spot('plus')} className="flex items-center gap-2 rounded-full">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-panel text-paper">
                <Icon name="plus" className="size-[18px]" />
              </span>
              <span className={CHIP}>
                Output
                <Caret />
              </span>
            </SpotButton>
            <SpotButton {...spot('permission')} className="rounded-full">
              <span className={CHIP}>
                <Icon name="shield" className="size-[17px] text-muted" />
                Auto
                <Caret />
              </span>
            </SpotButton>
            <span className={`${CHIP} ml-auto`}>
              Opus 5.5
              <Caret />
            </span>
            <span className="grid size-9 shrink-0 place-items-center text-muted">
              <Icon name="mic" />
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-on-accent">
              <Icon name="up" className="size-[18px]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 視窗：Code 分頁 ────────────────────────────────────── */

const ENV_MENU: readonly { icon: IconName; name: string; note?: string; on?: boolean }[] = [
  { icon: 'monitor', name: 'Local', on: true },
  { icon: 'server', name: 'SSH' },
  { icon: 'cloud', name: 'Cloud' },
  { icon: 'terminal', name: 'WSL', note: 'Windows' },
];

const MODE_MENU = ['Manual', 'Accept edits', 'Plan', 'Auto', 'Bypass permissions'] as const;

function CodeNewSession({ pick, onPick }: { pick: CodeSpot; onPick: (id: CodeSpot) => void }) {
  const spot = (id: CodeSpot) => ({
    n: numberOf(CODE_CALLOUTS, id),
    label: titleOf(CODE_CALLOUTS, id),
    on: pick === id,
    onPick: () => onPick(id),
  });

  return (
    <div className="flex h-full flex-col items-center px-10 pt-[88px]">
      <div className="w-[760px]">
        {/* prompt box：「+」與麥克風在框裡面 */}
        <div className="rounded-2xl border-2 border-line bg-panel-lift px-5 pt-4 pb-3">
          <span className="block text-[19px] leading-snug text-paper">
            結帳頁按下付款沒反應，找出原因並修好
          </span>
          <span className="mt-4 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full border border-line bg-panel text-paper">
              <Icon name="plus" className="size-[17px]" />
            </span>
            <span className="ml-auto grid size-8 place-items-center text-muted">
              <Icon name="mic" className="size-[19px]" />
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-paper text-on-accent">
              <Icon name="up" className="size-[17px]" />
            </span>
          </span>
        </div>

        {/* prompt box 下方那一列（順序是示意） */}
        <div className="mt-4 flex items-center gap-4">
          <span className="relative">
            <SpotButton {...spot('env')} className="rounded-full">
              <span className={CHIP}>
                <Icon name="monitor" className="size-[17px] text-muted" />
                Local
                <Caret />
              </span>
            </SpotButton>
            {pick === 'env' && (
              <span className={`${MENU} top-full left-0 mt-3 w-[250px]`}>
                {ENV_MENU.map((item) => (
                  <span key={item.name} className={`${MENU_ITEM} ${item.on ? 'bg-panel-lift font-semibold' : ''}`}>
                    <Icon name={item.icon} className="size-[18px] text-muted" />
                    <span className="flex-1">{item.name}</span>
                    {item.note && <span className="text-[16px] text-faint">{item.note}</span>}
                    {item.on && <span>✓</span>}
                  </span>
                ))}
                <span aria-hidden="true" className="mx-2 my-1 block h-px bg-line-soft" />
                <span className={MENU_ITEM}>
                  <Icon name="plus" className="size-[18px] text-muted" />
                  New environment
                </span>
              </span>
            )}
          </span>

          <SpotButton {...spot('folder')} className="flex items-center gap-1.5 rounded-full">
            <span className={CHIP}>
              <Icon name="folder" className="size-[17px] text-muted" />
              shop-web
              <Caret />
            </span>
            <span className={CHIP}>
              <Icon name="branch" className="size-[17px] text-muted" />
              Worktree
              <Switch on={false} />
            </span>
          </SpotButton>

          <span className="relative">
            <SpotButton {...spot('mode')} className="rounded-full">
              <span className={CHIP}>
                <Icon name="shield" className="size-[17px] text-muted" />
                Manual
                <Caret />
              </span>
            </SpotButton>
            {pick === 'mode' && (
              <span className={`${MENU} top-full left-0 mt-3 w-[250px]`}>
                {MODE_MENU.map((name, index) => (
                  <span key={name} className={`${MENU_ITEM} ${index === 0 ? 'bg-panel-lift font-semibold' : ''}`}>
                    <span className="w-4 text-center">{index === 0 ? '✓' : ''}</span>
                    {name}
                  </span>
                ))}
              </span>
            )}
          </span>

          <SpotButton {...spot('model')} className="ml-auto flex items-center gap-2 rounded-full">
            <span className={CHIP}>
              Opus 5.5 · High
              <Caret />
            </span>
            <UsageRing />
          </SpotButton>
        </div>
      </div>
    </div>
  );
}

const PANES: readonly { icon: IconName; name: string }[] = [
  { icon: 'terminal', name: 'Terminal' },
  { icon: 'diff', name: 'Changes' },
  { icon: 'browser', name: 'Browser' },
  { icon: 'file', name: 'Files' },
];

const TERMINAL_LINES = [
  '$ pnpm test',
  '✓ 42 passed',
  '$ git diff --stat',
  ' src/checkout.ts | 13 ++++++++++--',
] as const;

function CodeSession({ pick, onPick }: { pick: CodeSpot; onPick: (id: CodeSpot) => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* session 標題列 */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-5">
        <span className="text-[19px] font-semibold text-paper">結帳頁按鈕沒反應</span>
        <Caret />
        <SpotButton
          n={numberOf(CODE_CALLOUTS, 'panes')}
          label={titleOf(CODE_CALLOUTS, 'panes')}
          on={pick === 'panes'}
          onPick={() => onPick('panes')}
          className="ml-auto flex items-center gap-1 rounded-lg"
        >
          {PANES.map((pane, index) => (
            <span
              key={pane.name}
              className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[16px] ${
                index === 0 ? 'border border-line bg-panel-lift text-paper' : 'border border-transparent text-muted'
              }`}
            >
              <Icon name={pane.icon} className="size-[17px]" />
              {pane.name}
            </span>
          ))}
          <span aria-hidden="true" className="px-1.5 text-[19px] text-muted">
            ⋮
          </span>
        </SpotButton>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 對話欄（示意） */}
        <div className="flex w-[340px] shrink-0 flex-col gap-3 border-r border-line-soft px-6 py-5">
          <span className="block h-9 w-[220px] self-end rounded-xl rounded-br-sm bg-panel-lift" />
          <Skeleton width="w-full" />
          <Skeleton width="w-[86%]" />
          <Skeleton width="w-[62%]" />
          <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-line-soft px-3 py-1 font-mono text-[16px] text-muted">
            <Icon name="terminal" className="size-4" />
            pnpm test
          </span>
          <Skeleton width="w-[90%]" />
          <span className="mt-auto block h-12 rounded-xl border-2 border-line bg-panel-lift" />
        </div>

        {/* Terminal 窗格（示意） */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 bg-panel-lift px-6 py-4">
          <span className="text-[16px] text-faint">Terminal</span>
          {TERMINAL_LINES.map((line) => (
            <span key={line} className="font-mono text-[17px] leading-snug whitespace-pre text-paper">
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 視窗本體 ───────────────────────────────────────────── */

function ClaudeWindow({
  view,
  onView,
  chatPick,
  onChatPick,
  codePick,
  onCodePick,
}: {
  view: ViewId;
  onView: (view: ViewId) => void;
  chatPick: ChatSpot;
  onChatPick: (id: ChatSpot) => void;
  codePick: CodeSpot;
  onCodePick: (id: CodeSpot) => void;
}) {
  const inSession = view === 'code' && codePick === 'panes';
  const mainKey = view === 'chat' ? 'chat' : inSession ? 'code-session' : 'code-new';

  return (
    // mt-4：上面的對照表跟視窗原本只隔 16，貼紙往上超出 20（含外環 23）會壓到「對話」按鈕；
    // 多留 16（共 32），視窗從 594 縮成 578，裡面的內容都還放得下（見檔頭高度預算）。
    <BrandFrame brand="claude" className="mt-4 flex min-h-0 flex-1 flex-col">
      <div
        role="group"
        aria-label="Claude 桌面版的介面示意"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-line bg-panel"
      >
        {/* 標題列：左邊讓給「Claude」貼紙（原本的小字 Claude 跟貼紙重複，拿掉） */}
        <div
          className={`flex h-10 shrink-0 items-center gap-2 border-b border-line bg-panel-lift pr-4 ${TITLEBAR_CLEAR}`}
        >
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-3 rounded-full bg-line" />
          ))}
          <span className="ml-auto text-[16px] text-faint">介面示意：依官方文件繪製，實際畫面以 App 為準</span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* 側欄：最上方是對話與 Code 兩個分頁 */}
          <div className="flex w-[236px] shrink-0 flex-col gap-1 border-r border-line bg-panel-lift px-3 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <TabButton icon="chat" label="對話" on={view === 'chat'} onClick={() => onView('chat')} />
              <TabButton icon="code" label="Code 分頁" on={view === 'code'} onClick={() => onView('code')} />
              {view === 'chat' && (
                <span className="ml-1 rounded-md bg-paper px-2 py-0.5 text-[16px] leading-snug text-on-accent">
                  Code
                </span>
              )}
            </div>
            {view === 'chat' ? (
              <ChatSidebar pick={chatPick} onPick={onChatPick} />
            ) : (
              <CodeSidebar inSession={inSession} />
            )}
          </div>

          <div key={mainKey} className="slide-enter relative min-w-0 flex-1">
            {view === 'chat' && <ChatMain pick={chatPick} onPick={onChatPick} />}
            {view === 'code' && !inSession && <CodeNewSession pick={codePick} onPick={onCodePick} />}
            {inSession && <CodeSession pick={codePick} onPick={onCodePick} />}
          </div>
        </div>
      </div>
    </BrandFrame>
  );
}

/* ── 左欄：重點 ─────────────────────────────────────────── */

function CalloutButton({
  n,
  title,
  line,
  on,
  onPick,
}: {
  n: number;
  title: string;
  line: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex w-full items-start gap-3.5 rounded-xl border border-l-[6px] px-4 py-3 text-left transition-colors duration-150 ${FOCUS_RING} ${
        on ? 'border-acid border-l-acid bg-acid/14' : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full font-mono text-[18px] font-semibold ${
          on ? 'bg-acid text-on-accent' : 'border-2 border-line bg-panel text-paper'
        }`}
      >
        {n}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[22px] leading-tight font-semibold text-paper">{title}</span>
        <span className="mt-1 text-[19px] leading-snug whitespace-nowrap text-muted">{line}</span>
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 11 頁 · ClaudeAppDemo — Claude 桌面版的介面：對話與 Code
 *
 * 左：目前的分頁、一句定位、五條重點（跟視窗裡的編號對應）、分批推出的提醒。
 * 右：ChatGPT ⇄ Claude 的對照表（Claude 那一列切換），底下是手繪的 Claude Desktop 視窗。
 * ══════════════════════════════════════════════════════════════ */

export function ClaudeAppDemo() {
  const [view, setView] = useState<ViewId>('chat');
  const [chatPick, setChatPick] = useState<ChatSpot>('file');
  const [codePick, setCodePick] = useState<CodeSpot>('env');

  const info = VIEW_INFO[view];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[600px_minmax(0,1fr)] gap-8">
      {/* ── 左：定位 ＋ 五條重點 ＋ 提醒 ─────────────────── */}
      <div className="flex min-h-0 flex-col">
        <p className={`${LABEL_TYPE} text-faint`}>{info.label}</p>
        <h3 className="mt-1.5 text-[30px] leading-tight font-semibold text-paper">{info.title}</h3>
        <p className="mt-1.5 text-[20px] leading-snug text-muted">{info.sub}</p>

        <div
          key={view}
          role="group"
          aria-label={`${view === 'chat' ? '對話' : 'Code 分頁'}的五條重點`}
          className="slide-enter mt-5 flex flex-col gap-2"
        >
          {view === 'chat'
            ? CHAT_CALLOUTS.map((item, index) => (
                <CalloutButton
                  key={item.id}
                  n={index + 1}
                  title={item.title}
                  line={item.line}
                  on={item.id === chatPick}
                  onPick={() => setChatPick(item.id)}
                />
              ))
            : CODE_CALLOUTS.map((item, index) => (
                <CalloutButton
                  key={item.id}
                  n={index + 1}
                  title={item.title}
                  line={item.line}
                  on={item.id === codePick}
                  onPick={() => setCodePick(item.id)}
                />
              ))}
        </div>

        <p className="mt-auto rounded-xl border border-l-[6px] border-line border-l-warn bg-panel px-4 py-2.5 text-[17px] leading-snug text-muted">
          <span className="mr-3 font-semibold text-warn">分批推出中</span>
          訊息框還看得到 Chat／Cowork，就是還沒換到新版。
          <span className="whitespace-nowrap">Team 12/1 預設開啟</span>；Free 尚未。
        </p>
      </div>

      {/* ── 右：對照表 ＋ 視窗示意 ───────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <MappingStrip view={view} onView={setView} />
        <ClaudeWindow
          view={view}
          onView={setView}
          chatPick={chatPick}
          onChatPick={setChatPick}
          codePick={codePick}
          onCodePick={setCodePick}
        />
      </div>
    </div>
  );
}
