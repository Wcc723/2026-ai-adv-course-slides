import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { BrandFrame, TITLEBAR_CLEAR } from './brand-badge';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 兩家桌面版的介面：ChatGPT
 *
 *   第 8 頁  ChatgptAppDemo   ChatGPT 桌面版的介面：Chat、Work、Codex
 *                             左：三種模式（含快捷鍵）＋ 畫面上的四個地方；右：App 視窗示意
 *   第 9 頁  ChatgptWorkDemo  ChatGPT Work：在本機跑，還是交給雲端
 *                             左：三個標註 ＋ Local／Cloud 對照 ＋ 方案；右：Work 輸入框示意
 *   （第 10 頁 Codex 在 demos-interface-codex.tsx，第 11 頁 Claude 在 demos-interface-claude.tsx；
 *     頁碼依 2026-11-19 的 47 頁版本（第 8–11 頁從 2026-11-18 之後都沒變）。三個檔不互相 import，只共用 brand-badge.tsx 的品牌貼紙）
 *
 * 這兩頁取代原本 demos-models.tsx 的 WorkLogicDemo（補充：ChatGPT 的 Work 邏輯，
 * 四欄對照＋隨堂判斷）。講師 2026-11-17：「移動到『ChatGPT、Claude 共有的能力』的前面，
 * 專注介紹 ChatGPT 獨有的介面」「這一頁字太多了，可以使用介面，介紹 ChatGPT Work、Codex
 * （你可以拆兩、三頁介紹）」。所以舊頁查證過的事實留下來，段落拿掉，改用介面示意講。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-17；learn.chatgpt.com 是 OpenAI 官方的 ChatGPT＋Codex 文件站）
 * ──────────────────────────────────────────────────────────────
 * https://learn.chatgpt.com/docs/quickstart
 *   "select Codex from the ChatGPT dropdown"；選單兩列 "ChatGPT" Create, learn, and explore／
 *   "Codex" Build, debug, and ship；"switch to Work at the top of the new chat page, above
 *   the composer"。側欄插圖：ChatGPT 是 "New chat"、"Projects"、"Plugins"、"Chats"
 *   （"Plan a launch brief"、"Explore API patterns"）；Codex 是 "New chat"（同列右邊有
 *   Quick chat 圖示）、"Scheduled"、"Plugins"、"Chats"（"Fix retry handling"）。
 * https://learn.chatgpt.com/docs/app
 *   "In ChatGPT, use the toggle above the composer to select Chat or Work. In Codex, start with New chat."
 * https://learn.chatgpt.com/docs/use-chatgpt
 *   Chat「問題、來回討論」／ChatGPT Work「Define an outcome and get a reviewable result」
 *   （deck、報告、檔案分析）／Codex「Use developer tools and see technical details」；
 *   對照表：Work "Hide technical details like Git or shell commands"、Codex "See developer
 *   details, including diff and review views"；"ChatGPT Work and Codex share usage limits."；
 *   "On the web, ChatGPT Work runs in a managed cloud environment."；
 *   Cloud "can keep going after you close the desktop app and continue from the web or mobile
 *   app"、"can use uploaded files, connected tools, and approved websites"；
 *   Work locally "Use files, apps, or the browser on your computer"、"available in the desktop
 *   app when enabled for your account or workspace"。
 *   Work 輸入框插圖："Do anything. @ to use plugins"、"6 Sol" "Medium"、麥克風、送出。
 * https://learn.chatgpt.com/docs/reference/commands
 *   "Switch to Chat, Work, or Codex (In the order shown)"：⌃1／⌃2／⌃3，Windows Alt+1／2／3。
 * https://learn.chatgpt.com/docs/projects
 *   "Work conversation history remains separate from Codex history."
 * https://learn.chatgpt.com/docs/integrated-terminal
 *   Codex 輸入框 "Ask Codex anything, @ to add files, / for commands"，下方
 *   "Local"｜"Worktree"｜"Cloud" ＋ 分支 "main"；底部 "Terminal /bin/zsh"，Ctrl+` 開關。
 * https://learn.chatgpt.com/docs/get-started-with-work
 *   "select Cloud in the composer"；"Enterprise workspaces keep their existing Local/Cloud
 *   selector"；"type @ and the plugin name"；開了雲端的本機存取時 "Keep the laptop online
 *   and connected for steps that need its files"。
 * https://learn.chatgpt.com/docs/whats-new
 *   Sept 28–Oct 2, 2026「Continue Work across devices」："Local computer access with Work Cloud"。
 * https://learn.chatgpt.com/docs/enterprise/chatgpt-work-overview
 *   本機執行 "does not mean that the conversation or task context stays only on the device"。
 * https://learn.chatgpt.com/docs/permission-modes
 *   "Open the permissions control below the composer"；標題 "How should ChatGPT actions be
 *   approved?"；四個選項與說明照抄（"Ask for approval"、"Approve for me"、"Full access"、
 *   "Custom (config.toml)"）。
 * https://learn.chatgpt.com/docs/computer-use   macOS、Windows，Work 與 Codex 都能用。
 * https://learn.chatgpt.com/docs/browser        桌面版的 built-in browser；Work 的 Cloud browser。
 * https://learn.chatgpt.com/docs/automations    桌面版用本機專案的排程："Keep the computer on and the app running"。
 * https://chatgpt.com/work/
 *   "Available to all plans on desktop and to Plus, Pro, Business, Enterprise, and Edu on web and mobile."
 * https://chatgpt.com/pricing/                  Free、Go 的 Work 欄是 "Limited (desktop app)"。
 *
 * 只見於搜尋摘要（help.openai.com WebFetch 回 403），畫面上只當預告、不當事實：
 * - https://help.openai.com/en/articles/20001625-understanding-chatgpt-and-codex-usage-limits
 *   摘要：12 月起 Plus、Pro、Business 的 ChatGPT 與 Codex 共用同一份額度，Work 的 agent
 *   功能併入 ChatGPT 主介面。learn.chatgpt.com 的 What's new（10–11 月）還沒寫，
 *   所以第 8 頁只放一行「官方說明中心預告 12 月起介面可能調整，上台前再確認」。
 * - help.openai.com/en/articles/20001275-chatgpt-work-and-codex 舊版摘要寫「top-left menu」，
 *   新版摘要只寫「the menu」：產品選單畫在側欄最上方是示意。同一篇摘要說 Recents 可以
 *   篩選 All／Chat／Work，learn 文件沒寫，所以沒畫篩選器。
 *
 * 舊頁有、這次拿掉的（查不到或只有摘要）：
 * - 「本地 Work 記得上一次改了什麼」：官方文件找不到，是講師舊簡報的說法。
 * - 「權限各自設定，改 Work 不會動到 Codex」：只在 help 20001276 的摘要裡，
 *   而且講的是工作區管理員的權限，不是一般使用者的設定。
 * - 「左上角切到 Codex」：改成「產品選單」。
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 * - 兩個 App 視窗都是 JSX 手繪的示意，不是截圖；畫面下方有一行小字說明。
 *   版面（側欄寬、輸入框位置、晶片排列）是依官方插圖歸納的。
 * - 產品選單的位置（側欄最上方）是示意，官方只說 "ChatGPT dropdown"／product selector。
 * - Chat 的輸入框 placeholder 官方沒寫，所以 Chat 模式畫成已經打好一句中文問題。
 * - 側欄對話右邊的「Chat」「Work」虛線小標是講者的註記（說明兩種對話列在同一份清單），
 *   哪一則標成哪一種是隨意指定的。虛線框一律代表「補充說明」，不是 App 裡的元件。
 * - Work 的 "Local"／"Cloud" 畫在輸入框裡（官方："select Cloud in the composer"），
 *   權限晶片畫在輸入框下方（官方："below the composer"）；兩個彈出選單的長相是示意，
 *   選單裡的中文虛線小標是補充說明。用 Work 文件的字樣 Local／Cloud，
 *   不寫「這台電腦」（"This computer" 是 Codex 文件 "Work in" 選單的字樣）。
 * - Codex 模式底部的 "Terminal /bin/zsh" 平常要按 Ctrl+` 才會出現，這裡常駐是為了點出
 *   「看得到終端機」；權限晶片在 Codex 也有，為了精簡沒畫。
 * - 第 9 頁「App 要開著嗎」一列，Local「電腦、App 都要開著」：官方原文在排程頁（本機專案的排程要
 *   "Keep the computer on and the app running"）；一般本機任務照同一個邏輯推論。
 *   Cloud「預設碰不到電腦上的檔案」：get-started 頁 "Without local computer access for
 *   Work Cloud, choose Local for tasks that need your computer"；例外寫在對照下方的小字。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 第 8 頁  左邊三張模式卡（Chat／Work／Codex）切換視窗：產品選單的值、Chat｜Work 切換鈕、
 *          輸入框的提示字與晶片、側欄內容、Codex 的終端機列。下面四個標註點了會在視窗上
 *          用 acid 框出那一塊；反過來點視窗上的編號、產品選單、Chat｜Work 也會選到對應的標註。
 *          一進來停在 Chat、標註 1（產品選單打開）。在 Codex 選標註 2，會在原位置畫一個
 *          虛線框「Codex 沒有 Chat｜Work 切換」。
 * 第 9 頁  左邊 Local／Cloud 兩顆按鈕（或視窗裡的 "Local ▾" 晶片）切換對照：在哪裡跑、
 *          碰得到什麼、App 要開著嗎、在哪裡接手。三個標註對應輸入框、Local／Cloud、權限；
 *          選權限會打開四個選項的彈出選單，點選項會換晶片上的字。一進來停在 Local、標註 2。
 * 鍵盤：每顆按鈕都擋掉空白鍵與 Enter 往上傳（不會順便翻頁）；滑鼠點完就放掉焦點，
 *       之後按空白鍵照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  標註與它框出的區域（4px 外框 ＋ 實心編號）、第 9 頁 Local／Cloud 的選取按鈕。
 *         選取的標註：6px 不透明左粗條 ＋ border-acid ＋ bg-acid/14，淡底不單獨承擔語意。
 *   teal  第 9 頁「有／可以」的晶片（2px 實線框 ＋ ✓）；「沒有／不行」是虛線框 ＋ ✕。
 *         兩頁視窗左上角的「ChatGPT」品牌貼紙也是 teal 實心＋ on-accent（brand-badge.tsx，
 *         講師 2026-11-18 在 codd://note/note-plus 要的明顯標示）。第 8 頁因此是 acid ＋ teal；
 *         第 9 頁的 teal 晶片在左欄、貼紙在視窗上緣，形狀也不同，不會混讀。
 *   模式卡的選取用中性的 paper（2px 框 ＋ 6px 左粗條），不跟 acid 的標註搶語意。
 *   視窗本身一律中性：border-line、bg-panel／bg-panel-lift，標題列三個圓點是 bg-line
 *   （圓點往右讓到貼紙後面，從視窗 x 190 開始）。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   第 8 頁  左 540 ＋ gap 28 ＋ 右 1172
 *     左  標籤列 24 ＋ 10 ＋ 模式卡 (80 × 3 ＋ 8 × 2 = 256) ＋ 18 ＋ 標籤 24 ＋ 10
 *         ＋ 標註 (66 × 4 ＋ 8 × 3 = 288) ＝ 630，預告框 52 用 mt-auto 貼底（間隔 38）
 *         標註內文寬 ≈ 540 − 框 2 − 左條 6 − px 32 − 編號 32 − gap 12 ＝ 456，19px 一行約 23 字
 *     右  視窗 680 ＋ 12 ＋ 說明小字 28 ＝ 720
 *         視窗：框 4 ＋ 標題列 40 ＋ 內容 636；側欄 280，主區 888
 *         側欄 p-4：選單 48 ＋ 20 ＋ 三列 (40 × 3 ＋ 4 × 2 = 128) ＋ 36 ＋ 紀錄區 154 ＋ 帳號列 40 ≈ 458
 *         主區：切換鈕 48 ＋ 16 ＋ 輸入框 128 ＋ 12 ＋ 下方列 40 ＝ 244，置中（底部留 48 給終端機列）
 *         產品選單是絕對定位、蓋在側欄上（寬 330，會跨進主區 66），不改變任何高度；
 *         選單底緣約在舞台 y 452，紀錄區上緣留 36（不是 20）是為了讓它右上角的編號 4
 *         （-top-4）落在選單底下 6px，不被打開的選單蓋掉半顆（瀏覽器量過）
 *   第 9 頁  左 660 ＋ gap 28 ＋ 右 1052
 *     左  標註 (62 × 3 ＋ 8 × 2 = 202) ＋ 16 ＋ 對照卡 420 ＋ 16 ＋ 方案 66 ＝ 720
 *         對照卡：框 2 ＋ p-5 40 ＋ 標題列 56 ＋ 16 ＋ 四列 (40 ＋ 88 ＋ 40 ＋ 40 ＋ 10 × 3 = 238)
 *                 ＋ 16 ＋ 小字兩行 52 ＝ 420
 *         晶片區寬 ≈ 660 − 42 − 標籤欄 148 − 12 ＝ 458；17px 一顆五字的晶片 ≈ 135，一行三顆 421
 *     右  視窗 680 ＋ 12 ＋ 說明小字 28；側欄 280，主區 768
 *         主區：上方留 300 給彈出選單 ＋ 切換鈕 48 ＋ 16 ＋ 輸入框 128 ＋ 12 ＋ 權限晶片 40 ＝ 544
 *         權限彈出選單 720 × 344，往上開：底 496、頂 152（視窗座標 194），左緣對齊輸入框（44），右緣 764 ＜ 768
 *   浮水印在舞台右上（x 1692–1872、y 104–147），落在 Panel 的外框與內距上；
 *   兩頁的右上角都是視窗：標題列右半是空的、主區上方 300 沒有任何文字或按鈕，
 *   彈出選單也從主區 y 152 以下才開始。
 *   視窗左上角的「ChatGPT」貼紙往上超出 20、往左超出 14（含外環 23／17），落在 Panel 內距與
 *   左右欄之間的 28 gap 裡（離左欄 11），不佔版面、不改任何高度；下緣在標題列之內，
 *   第 8 頁側欄最上方的編號 1（視窗 y 42 起）在它下面 11。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-antigravity.tsx、demos-environments.tsx，不 import）── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 選取中的標註：淡底一定配 6px 不透明左粗條 */
const CALLOUT_ON = 'border-acid border-l-acid bg-acid/14';
const CALLOUT_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** 按鈕有焦點時，空白鍵與 Enter 只觸發按鈕，不讓簡報跟著翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ── 小圖示（純裝飾，aria-hidden）──────────────────────── */

type GlyphName =
  | 'compose'
  | 'folder'
  | 'apps'
  | 'clock'
  | 'quick'
  | 'chevron'
  | 'mic'
  | 'send'
  | 'branch'
  | 'laptop'
  | 'cloud'
  | 'phone'
  | 'globe'
  | 'monitor'
  | 'shield'
  | 'check'
  | 'cross'
  | 'alert'
  | 'terminal';

const GLYPHS: Record<GlyphName, ReactNode> = {
  compose: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  apps: (
    <>
      <rect x={4} y={4} width={6} height={6} rx={1.5} />
      <rect x={14} y={4} width={6} height={6} rx={1.5} />
      <rect x={4} y={14} width={6} height={6} rx={1.5} />
      <rect x={14} y={14} width={6} height={6} rx={1.5} />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  quick: (
    <>
      <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8l-5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z" />
      <path d="M12 8.5v5M9.5 11h5" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  mic: (
    <>
      <rect x={9} y={3} width={6} height={11} rx={3} />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  send: <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />,
  branch: (
    <>
      <circle cx={6.5} cy={5.5} r={2} />
      <circle cx={6.5} cy={18.5} r={2} />
      <circle cx={17.5} cy={7.5} r={2} />
      <path d="M6.5 7.5v9M17.5 9.5c0 4-5 3.5-9.5 7" />
    </>
  ),
  laptop: (
    <>
      <rect x={4} y={5} width={16} height={11} rx={1.5} />
      <path d="M2 19.5h20" />
    </>
  ),
  cloud: <path d="M7 18.5h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6-1.3A4.7 4.7 0 0 0 7 18.5z" />,
  phone: (
    <>
      <rect x={7} y={3} width={10} height={18} rx={2} />
      <path d="M11 17.5h2" />
    </>
  ),
  globe: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17" />
    </>
  ),
  monitor: (
    <>
      <rect x={3} y={4} width={18} height={12} rx={1.5} />
      <path d="M8.5 20h7M12 16v4" />
    </>
  ),
  shield: <path d="M12 3l7 3v5.5c0 4.5-3 7.6-7 9.5-4-1.9-7-5-7-9.5V6z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cross: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  alert: (
    <>
      <path d="M12 5v9" />
      <path d="M12 18.5v.5" />
    </>
  ),
  terminal: (
    <>
      <rect x={3} y={4.5} width={18} height={15} rx={2} />
      <path d="M7 9.5l3 2.5-3 2.5M12.5 15H17" />
    </>
  ),
};

function Glyph({
  name,
  size = 20,
  className,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
}) {
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
      className={`shrink-0 ${className ?? ''}`}
    >
      {GLYPHS[name]}
    </svg>
  );
}

/* ── 視窗示意的零件（第 8、9 頁共用同一套長相）──────────── */

/**
 * App 視窗：2px 框、標題列 h-10 ＋ 三個中性小圓點（右半刻意留白，浮水印在右上）。
 * 左上角騎著「ChatGPT」貼紙（brand-badge.tsx）；圓點往右讓到貼紙後面。
 */
function MockWindow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <BrandFrame brand="chatgpt" className="shrink-0">
      <div
        role="group"
        aria-label={label}
        className="flex h-[680px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-line bg-panel"
      >
        <div
          className={`flex h-10 shrink-0 items-center gap-2 border-b border-line bg-panel-lift pr-4 ${TITLEBAR_CLEAR}`}
        >
          {[0, 1, 2].map((dot) => (
            <span key={dot} aria-hidden="true" className="size-3 rounded-full bg-line" />
          ))}
        </div>
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
    </BrandFrame>
  );
}

function MockCaption() {
  return (
    <p className="mt-3 h-7 shrink-0 text-[17px] leading-7 text-faint">
      介面示意：依官方文件繪製，虛線框是補充說明，實際畫面以 App 為準
    </p>
  );
}

/**
 * 視窗上可以被標註的一塊：選到時 4px acid 外框，左上角一顆編號。
 * 編號本身是按鈕 —— 點視窗上的編號也能選到左邊對應的標註。
 */
function Spot({
  n,
  label,
  on,
  onPick,
  badge = 'left',
  className = '',
  children,
}: {
  n: number;
  label: string;
  on: boolean;
  onPick: () => void;
  /** 編號放在左上角或右上角（右上用在左上角有文字的區塊） */
  badge?: 'left' | 'right';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative ${on ? 'outline-4 outline-offset-4 outline-acid' : ''} ${className}`}
    >
      {children}
      <button
        type="button"
        aria-label={`標出：${label}`}
        aria-pressed={on}
        onClick={(event) => {
          onPick();
          blurAfterClick(event);
        }}
        onKeyDown={keepActivationKeys}
        className={`absolute -top-4 ${badge === 'left' ? '-left-4' : '-right-4'} z-10 grid size-8 place-items-center rounded-full border-2 font-mono text-[17px] leading-none font-semibold transition-colors duration-150 ${FOCUS_RING} ${
          on
            ? 'border-acid bg-acid text-on-accent'
            : 'border-line bg-panel text-paper hover:border-acid'
        }`}
      >
        {n}
      </button>
    </div>
  );
}

/** 左邊的標註：編號 ＋ 標題（12 字內）＋ 一行說明 */
function Callout({
  n,
  title,
  line,
  on,
  onClick,
  height,
}: {
  n: number;
  title: string;
  line: string;
  on: boolean;
  onClick: () => void;
  height: string;
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
      className={`flex w-full shrink-0 items-center gap-3 rounded-xl border border-l-[6px] px-4 text-left transition-colors duration-200 ${height} ${FOCUS_RING} ${
        on ? CALLOUT_ON : CALLOUT_OFF
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 font-mono text-[17px] leading-none font-semibold ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line bg-panel text-paper'
        }`}
      >
        {n}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[20px] leading-[26px] font-semibold text-paper">{title}</span>
        <span className="truncate text-[19px] leading-6 text-muted">{line}</span>
      </span>
    </button>
  );
}

/* ── 側欄 ─────────────────────────────────────────────── */

type Product = 'chatgpt' | 'codex';

const PRODUCTS: readonly { key: Product; name: string; sub: string }[] = [
  { key: 'chatgpt', name: 'ChatGPT', sub: 'Create, learn, and explore' },
  { key: 'codex', name: 'Codex', sub: 'Build, debug, and ship' },
];

const NAV: Record<Product, readonly { icon: GlyphName; text: string; quick?: boolean }[]> = {
  chatgpt: [
    { icon: 'compose', text: 'New chat' },
    { icon: 'folder', text: 'Projects' },
    { icon: 'apps', text: 'Plugins' },
  ],
  codex: [
    { icon: 'compose', text: 'New chat', quick: true },
    { icon: 'clock', text: 'Scheduled' },
    { icon: 'apps', text: 'Plugins' },
  ],
};

/** tag 是講者的註記（虛線小標），不是 App 裡的元件 */
const CHATS: Record<Product, readonly { text: string; tag?: string }[]> = {
  chatgpt: [
    { text: 'Plan a launch brief', tag: 'Work' },
    { text: 'Explore API patterns', tag: 'Chat' },
  ],
  codex: [{ text: 'Fix retry handling' }],
};

const SIDEBAR = 'relative flex w-[280px] shrink-0 flex-col border-r border-line bg-panel-lift p-4';

/** 補充說明一律用虛線小標 */
function NoteTag({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-md border border-dashed border-line px-1.5 text-[16px] leading-6 text-muted">
      {children}
    </span>
  );
}

function SelectorFace({ product }: { product: Product }) {
  return (
    <>
      <span className="font-display text-[22px] font-semibold text-paper">
        {product === 'chatgpt' ? 'ChatGPT' : 'Codex'}
      </span>
      <Glyph name="chevron" size={18} className="text-muted" />
    </>
  );
}

const SELECTOR = 'flex h-12 w-full items-center gap-2 rounded-xl border border-line bg-panel px-4';

function NavRows({ product }: { product: Product }) {
  return (
    <div className="mt-5 flex shrink-0 flex-col gap-1">
      {NAV[product].map((item) => (
        <span
          key={item.text}
          className="flex h-10 items-center gap-3 rounded-lg px-2 text-[18px] text-paper"
        >
          <Glyph name={item.icon} size={20} className="text-muted" />
          {item.text}
          {item.quick && <Glyph name="quick" size={20} className="ml-auto text-muted" />}
        </span>
      ))}
    </div>
  );
}

function ChatRows({ product, note }: { product: Product; note?: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex h-6 items-center px-2 text-[16px] text-faint">Chats</span>
      <div className="mt-2 flex flex-col gap-1">
        {CHATS[product].map((chat) => (
          <span
            key={chat.text}
            className="flex h-10 items-center gap-2 rounded-lg px-2 text-[17px] text-paper"
          >
            <span className="truncate">{chat.text}</span>
            {chat.tag && <span className="ml-auto" />}
            {chat.tag && <NoteTag>{chat.tag}</NoteTag>}
          </span>
        ))}
      </div>
      {note && (
        <span className="mt-1 flex h-6 items-center px-2 text-[16px] text-muted">{note}</span>
      )}
    </div>
  );
}

function AccountRow() {
  return (
    <div aria-hidden="true" className="mt-auto flex h-10 shrink-0 items-center gap-3 px-2">
      <span className="grid size-8 place-items-center rounded-full bg-paper text-[16px] font-semibold text-on-accent">
        A
      </span>
      <span className="h-2.5 w-24 rounded-full bg-line-soft" />
    </div>
  );
}

/* ── 輸入框零件 ───────────────────────────────────────── */

const CHIP =
  'flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-panel px-3.5 text-[17px] whitespace-nowrap text-paper';

function ModelChip() {
  return (
    <span className={CHIP}>
      <span className="text-paper">6 Sol</span>
      <span className="text-muted">Medium</span>
      <Glyph name="chevron" size={14} className="text-muted" />
    </span>
  );
}

function MicSend() {
  return (
    <>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center text-muted">
        <Glyph name="mic" size={20} />
      </span>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-on-accent"
      >
        <Glyph name="send" size={18} />
      </span>
    </>
  );
}

const COMPOSER =
  'flex h-[128px] w-[680px] flex-col justify-between rounded-2xl border-2 border-line bg-panel-lift px-5 py-4';

/** Chat｜Work 切換鈕：給 onPick 就是按鈕，沒給就是靜態的圖 */
function ModeSwitcher({
  value,
  onPick,
}: {
  value: 'chat' | 'work';
  onPick?: (next: 'chat' | 'work') => void;
}) {
  const items = [
    { key: 'chat', text: 'Chat' },
    { key: 'work', text: 'Work' },
  ] as const;
  return (
    <div className="flex h-12 items-center gap-1 rounded-full border border-line bg-panel-lift p-1">
      {items.map((item) => {
        const on = item.key === value;
        const look = `flex h-10 w-[112px] items-center justify-center rounded-full text-[19px] transition-colors duration-150 ${
          on ? 'bg-paper font-semibold text-on-accent' : 'text-muted'
        }`;
        if (!onPick) {
          return (
            <span key={item.key} className={look}>
              {item.text}
            </span>
          );
        }
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            onClick={(event) => {
              onPick(item.key);
              blurAfterClick(event);
            }}
            onKeyDown={keepActivationKeys}
            className={`${look} ${FOCUS_RING} ${on ? '' : 'hover:text-paper'}`}
          >
            {item.text}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 8 頁 · ChatgptAppDemo — ChatGPT 桌面版的介面：Chat、Work、Codex
 * ══════════════════════════════════════════════════════════════ */

type AppMode = 'chat' | 'work' | 'codex';
type AppSpot = 'selector' | 'switcher' | 'composer' | 'history';

const APP_MODES: readonly { key: AppMode; name: string; keys: string; line: string }[] = [
  { key: 'chat', name: 'Chat', keys: '⌃1', line: '問答、討論：要一個回答' },
  { key: 'work', name: 'Work', keys: '⌃2', line: '交出成果：文件、簡報、試算表' },
  { key: 'codex', name: 'Codex', keys: '⌃3', line: '寫程式：看得到 diff 與終端機' },
];

/** 標題 12 字內、說明一行（19px 約 23 字） */
const APP_SPOTS: readonly { key: AppSpot; title: string; line: string }[] = [
  { key: 'selector', title: '產品選單', line: '先選 ChatGPT 還是 Codex' },
  { key: 'switcher', title: 'Chat｜Work 切換', line: '在輸入框上方；Codex 沒有' },
  { key: 'composer', title: '輸入框', line: '提示字與按鈕跟著模式換' },
  { key: 'history', title: '側欄的紀錄', line: 'Chat、Work 同一份，Codex 另一份' },
];

function spotNo(key: AppSpot) {
  return APP_SPOTS.findIndex((item) => item.key === key) + 1;
}

function spotTitle(key: AppSpot) {
  return APP_SPOTS.find((item) => item.key === key)?.title ?? '';
}

function ProductMenu({ product, onPick }: { product: Product; onPick: (next: Product) => void }) {
  return (
    <div className="slide-enter absolute top-[calc(100%+10px)] left-0 z-20 flex w-[330px] flex-col gap-1 rounded-xl border-2 border-line bg-panel p-2">
      {PRODUCTS.map((item) => {
        const on = item.key === product;
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            onClick={(event) => {
              onPick(item.key);
              blurAfterClick(event);
            }}
            onKeyDown={keepActivationKeys}
            className={`flex h-16 items-center gap-3 rounded-lg px-3 text-left ${FOCUS_RING} ${
              on ? 'bg-panel-lift' : 'hover:bg-panel-lift'
            }`}
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-[19px] leading-6 font-semibold text-paper">{item.name}</span>
              <span className="text-[16px] leading-5 text-muted">{item.sub}</span>
            </span>
            {on && <Glyph name="check" size={20} className="ml-auto text-paper" />}
          </button>
        );
      })}
    </div>
  );
}

export function ChatgptAppDemo() {
  const [mode, setMode] = useState<AppMode>('chat');
  const [spot, setSpot] = useState<AppSpot | null>('selector');
  const [menuOpen, setMenuOpen] = useState(true);

  const product: Product = mode === 'codex' ? 'codex' : 'chatgpt';

  function pickSpot(next: AppSpot) {
    const same = spot === next;
    setSpot(same ? null : next);
    setMenuOpen(!same && next === 'selector');
  }

  function spotProps(key: AppSpot) {
    return {
      n: spotNo(key),
      label: spotTitle(key),
      on: spot === key,
      onPick: () => pickSpot(key),
    };
  }

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-7">
      {/* ── 左：三種模式 ＋ 畫面上的四個地方 ── */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex h-6 shrink-0 items-center justify-between">
          <span className={LABEL_FAINT}>三種模式</span>
          <span className="text-[17px] text-faint">Windows 用 Alt+1／2／3</span>
        </div>
        <div role="group" aria-label="三種模式" className="mt-2.5 flex shrink-0 flex-col gap-2">
          {APP_MODES.map((item) => {
            const on = item.key === mode;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={on}
                onClick={(event) => {
                  setMode(item.key);
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                className={`flex h-20 w-full flex-col justify-center gap-0.5 rounded-xl border-2 border-l-[6px] px-5 text-left transition-colors duration-200 ${FOCUS_RING} ${
                  on
                    ? 'border-paper border-l-paper bg-panel'
                    : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="font-display text-[26px] leading-7 font-semibold text-paper">
                    {item.name}
                  </span>
                  <kbd className="rounded-md border border-line bg-panel px-2 font-mono text-[17px] leading-6 text-paper">
                    {item.keys}
                  </kbd>
                </span>
                <span className="text-[20px] leading-7 text-muted">{item.line}</span>
              </button>
            );
          })}
        </div>

        <span className={`${LABEL_FAINT} mt-[18px] h-6 shrink-0 leading-6`}>畫面上的四個地方</span>
        <div role="group" aria-label="畫面上的四個地方" className="mt-2.5 flex shrink-0 flex-col gap-2">
          {APP_SPOTS.map((item, index) => (
            <Callout
              key={item.key}
              n={index + 1}
              title={item.title}
              line={item.line}
              on={spot === item.key}
              onClick={() => pickSpot(item.key)}
              height="h-[66px]"
            />
          ))}
        </div>

        <p className="mt-auto flex h-[52px] shrink-0 items-center gap-3 rounded-xl border border-dashed border-line px-4 text-[17px] leading-snug text-faint">
          <span className="shrink-0 rounded-full border border-line px-2.5 text-[16px] leading-6 text-muted">
            預告
          </span>
          官方說明中心預告 12 月起介面可能調整，上台前再確認
        </p>
      </div>

      {/* ── 右：App 視窗示意（右上角只有標題列與主區的留白） ── */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <MockWindow label="ChatGPT 桌面版的介面示意">
          {/* 側欄 */}
          <div className={SIDEBAR}>
            <Spot {...spotProps('selector')} className="shrink-0 rounded-xl">
              <button
                type="button"
                aria-expanded={menuOpen}
                onClick={(event) => {
                  if (menuOpen) {
                    setMenuOpen(false);
                  } else {
                    setSpot('selector');
                    setMenuOpen(true);
                  }
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                className={`${SELECTOR} ${FOCUS_RING} hover:border-paper`}
              >
                <SelectorFace product={product} />
              </button>
              {menuOpen && (
                <ProductMenu
                  product={product}
                  onPick={(next) => {
                    setMode((current) =>
                      next === 'codex' ? 'codex' : current === 'codex' ? 'chat' : current,
                    );
                    setMenuOpen(false);
                  }}
                />
              )}
            </Spot>

            <NavRows product={product} />

            <Spot
              {...spotProps('history')}
              badge="right"
              className="mt-9 h-[154px] shrink-0 rounded-xl"
            >
              <ChatRows
                product={product}
                note={
                  spot === 'history'
                    ? product === 'chatgpt'
                      ? 'Chat 與 Work 列在一起'
                      : '只列 Codex 的對話'
                    : undefined
                }
              />
            </Spot>

            <AccountRow />
          </div>

          {/* 主區：新對話頁 */}
          <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center pb-12">
            <div className="flex h-12 shrink-0 items-center justify-center">
              {mode !== 'codex' ? (
                <Spot {...spotProps('switcher')} className="rounded-full">
                  <ModeSwitcher
                    value={mode}
                    onPick={(next) => {
                      setMode(next);
                      setSpot('switcher');
                      setMenuOpen(false);
                    }}
                  />
                </Spot>
              ) : (
                spot === 'switcher' && (
                  <Spot {...spotProps('switcher')} className="rounded-full">
                    <span className="flex h-12 w-[300px] items-center justify-center rounded-full border-2 border-dashed border-line text-[17px] text-muted">
                      Codex 沒有 Chat｜Work 切換
                    </span>
                  </Spot>
                )
              )}
            </div>

            <Spot {...spotProps('composer')} className="mt-4 shrink-0 rounded-2xl">
              <div className={COMPOSER}>
                {mode === 'chat' && (
                  <p className="flex items-center text-[21px] leading-8 text-paper">
                    幫我比較這兩種寫法的差別
                    <span aria-hidden="true" className="ml-0.5 h-6 w-0.5 bg-paper" />
                  </p>
                )}
                {mode === 'work' && (
                  <p className="text-[21px] leading-8 text-faint">Do anything. @ to use plugins</p>
                )}
                {mode === 'codex' && (
                  <p className="text-[21px] leading-8 text-faint">
                    Ask Codex anything, @ to add files, / for commands
                  </p>
                )}
                <div className="flex h-9 items-center gap-2">
                  {mode === 'work' && (
                    <span className={CHIP}>
                      <Glyph name="laptop" size={18} className="text-muted" />
                      Local
                      <Glyph name="chevron" size={14} className="text-muted" />
                    </span>
                  )}
                  <span className="flex-1" />
                  {mode !== 'chat' && <ModelChip />}
                  <MicSend />
                </div>
              </div>
            </Spot>

            <div className="mt-3 flex h-10 w-[680px] shrink-0 items-center gap-2">
              {mode === 'work' && (
                <span className={CHIP}>
                  <Glyph name="shield" size={18} className="text-muted" />
                  Approve for me
                  <Glyph name="chevron" size={14} className="text-muted" />
                </span>
              )}
              {mode === 'codex' && (
                <>
                  <span className="flex h-9 items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
                    {['Local', 'Worktree', 'Cloud'].map((item, index) => (
                      <span
                        key={item}
                        className={`flex h-8 items-center rounded-full px-3.5 text-[17px] ${
                          index === 0 ? 'bg-paper font-semibold text-on-accent' : 'text-muted'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </span>
                  <span className={CHIP}>
                    <Glyph name="branch" size={18} className="text-muted" />
                    main
                  </span>
                </>
              )}
            </div>

            {mode === 'codex' && (
              <div className="absolute inset-x-0 bottom-0 flex h-12 items-center gap-3 border-t border-line bg-ink-soft px-5">
                <Glyph name="terminal" size={20} className="text-muted" />
                <span className="font-mono text-[17px] text-paper">Terminal</span>
                <span className="font-mono text-[17px] text-faint">/bin/zsh</span>
                <kbd className="ml-auto rounded-md border border-line bg-panel px-2 font-mono text-[16px] leading-6 text-paper">
                  ⌃`
                </kbd>
              </div>
            )}
          </div>
        </MockWindow>
        <MockCaption />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 9 頁 · ChatgptWorkDemo — ChatGPT Work：在本機跑，還是交給雲端
 * ══════════════════════════════════════════════════════════════ */

type RunLoc = 'local' | 'cloud';
type PermMode = 'ask' | 'auto' | 'full' | 'custom';
type WorkSpot = 'composer' | 'run' | 'perm';

const WORK_SPOTS: readonly { key: WorkSpot; title: string; line: string }[] = [
  { key: 'composer', title: '輸入框', line: '說要什麼成果，打 @ 指定 plugin' },
  { key: 'run', title: 'Local／Cloud', line: '這件事在你的電腦跑，還是雲端' },
  { key: 'perm', title: '權限', line: '動手之前，要不要先問你' },
];

const RUN_OPTIONS: readonly { key: RunLoc; name: string; zh: string; icon: GlyphName }[] = [
  { key: 'local', name: 'Local', zh: '你的電腦', icon: 'laptop' },
  { key: 'cloud', name: 'Cloud', zh: '雲端', icon: 'cloud' },
];

/** 四個選項與英文說明照抄官方；中文虛線小標是補充說明 */
const PERMS: readonly { key: PermMode; name: string; desc: string; zh: string }[] = [
  {
    key: 'ask',
    name: 'Ask for approval',
    desc: 'Always ask to edit external files and use the internet',
    zh: '一律先問',
  },
  {
    key: 'auto',
    name: 'Approve for me',
    desc: 'Only ask for actions detected as potentially unsafe',
    zh: '有風險才問',
  },
  {
    key: 'full',
    name: 'Full access',
    desc: 'Unrestricted access to the internet and any file on your computer',
    zh: '完全不設限',
  },
  {
    key: 'custom',
    name: 'Custom (config.toml)',
    desc: 'Uses permissions defined in config.toml',
    zh: '照設定檔',
  },
];

/** on ＝ 有／可以（teal 實線框）、off ＝ 沒有／不行（虛線框）、warn ＝ 有條件（paper 實線框） */
type ChipState = 'on' | 'off' | 'warn';

const REACH: Record<RunLoc, readonly { text: string; state: ChipState }[]> = {
  cloud: [
    { text: '上傳的檔案', state: 'on' },
    { text: '連接的工具', state: 'on' },
    { text: '核准的網站', state: 'on' },
    { text: '雲端瀏覽器', state: 'on' },
    { text: '電腦上的檔案', state: 'off' },
  ],
  local: [
    { text: '電腦上的資料夾', state: 'on' },
    { text: '內建瀏覽器', state: 'on' },
    { text: '桌面 App（Computer Use）', state: 'on' },
  ],
};

/** 「App 要開著嗎」那一列（列名寫成問句，兩欄的答案才讀得通） */
const AFTER_CLOSE: Record<RunLoc, { text: string; state: ChipState }> = {
  cloud: { text: '不用，照樣做完', state: 'on' },
  local: { text: '電腦、App 都要開著', state: 'warn' },
};

const HANDOFF: readonly { text: string; icon: GlyphName; local: boolean }[] = [
  { text: '桌面版', icon: 'monitor', local: true },
  { text: '網頁', icon: 'globe', local: false },
  { text: '手機', icon: 'phone', local: false },
];

const RUN_NOTE: Record<RunLoc, string> = {
  cloud:
    '例外：工作區開了 Local computer access with Work Cloud、電腦保持連線時，雲端任務也能用電腦上的檔案。',
  local: '只有桌面版，帳號或工作區要有開。任務內容仍可能存在雲端。',
};

const STATE_LOOK: Record<ChipState, string> = {
  on: 'border-teal bg-panel font-semibold text-teal',
  warn: 'border-paper bg-panel font-semibold text-paper',
  off: 'border-dashed border-line text-faint',
};

const STATE_MARK: Record<ChipState, GlyphName> = { on: 'check', warn: 'alert', off: 'cross' };

const STATE_SR: Record<ChipState, string> = { on: '（可以）', warn: '（有條件）', off: '（不行）' };

function StateChip({
  text,
  state,
  icon,
}: {
  text: string;
  state: ChipState;
  icon?: GlyphName;
}) {
  return (
    <span
      role="img"
      aria-label={`${text}${STATE_SR[state]}`}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 text-[17px] whitespace-nowrap ${STATE_LOOK[state]}`}
    >
      <Glyph name={icon ?? STATE_MARK[state]} size={18} />
      {text}
    </span>
  );
}

function CompareRow({ label, tall, children }: { label: string; tall?: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid shrink-0 grid-cols-[148px_1fr] gap-3 ${tall ? 'h-[88px] items-start' : 'h-10 items-center'}`}
    >
      <span className={`text-[17px] font-semibold text-muted ${tall ? 'leading-10' : ''}`}>
        {label}
      </span>
      <div className="flex flex-wrap content-start gap-2">{children}</div>
    </div>
  );
}

export function ChatgptWorkDemo() {
  const [run, setRun] = useState<RunLoc>('local');
  const [perm, setPerm] = useState<PermMode>('auto');
  const [spot, setSpot] = useState<WorkSpot | null>('run');
  const [open, setOpen] = useState<'run' | 'perm' | null>(null);

  const permNow = PERMS.find((item) => item.key === perm) ?? PERMS[1];
  const runNow = RUN_OPTIONS.find((item) => item.key === run) ?? RUN_OPTIONS[0];

  function pickSpot(next: WorkSpot) {
    const same = spot === next;
    setSpot(same ? null : next);
    setOpen(same || next === 'composer' ? null : next);
  }

  function spotProps(key: WorkSpot) {
    return {
      n: WORK_SPOTS.findIndex((item) => item.key === key) + 1,
      label: WORK_SPOTS.find((item) => item.key === key)?.title ?? '',
      on: spot === key,
      onPick: () => pickSpot(key),
    };
  }

  function toggleMenu(which: 'run' | 'perm') {
    setSpot(which);
    setOpen((current) => (current === which ? null : which));
  }

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[660px_1fr] gap-7">
      {/* ── 左：三個標註 ＋ Local／Cloud 對照 ＋ 方案 ── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <div role="group" aria-label="Work 輸入框的三個地方" className="flex shrink-0 flex-col gap-2">
          {WORK_SPOTS.map((item, index) => (
            <Callout
              key={item.key}
              n={index + 1}
              title={item.title}
              line={item.line}
              on={spot === item.key}
              onClick={() => pickSpot(item.key)}
              height="h-[62px]"
            />
          ))}
        </div>

        <section className="flex h-[420px] shrink-0 flex-col rounded-2xl border border-line bg-panel-lift p-5">
          <header className="flex h-14 shrink-0 items-center gap-3">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full border-2 font-mono text-[17px] leading-none font-semibold ${
                spot === 'run'
                  ? 'border-acid bg-acid text-on-accent'
                  : 'border-line bg-panel text-paper'
              }`}
            >
              2
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[24px] leading-[30px] font-semibold text-paper">
                Local 還是 Cloud
              </span>
              <span className="text-[17px] leading-[22px] text-muted">
                網頁版一律在雲端，桌面版才能選
              </span>
            </span>
            <div role="group" aria-label="Work 跑在哪" className="ml-auto flex gap-2">
              {RUN_OPTIONS.map((item) => {
                const on = item.key === run;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={on}
                    onClick={(event) => {
                      setRun(item.key);
                      setSpot('run');
                      blurAfterClick(event);
                    }}
                    onKeyDown={keepActivationKeys}
                    className={`h-12 w-[112px] rounded-xl border-2 font-display text-[22px] transition-colors duration-200 ${FOCUS_RING} ${
                      on
                        ? 'border-acid bg-acid font-semibold text-on-accent'
                        : 'border-line bg-panel text-paper hover:border-acid'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </header>

          <div key={run} className="slide-enter mt-4 flex shrink-0 flex-col gap-2.5">
            <CompareRow label="在哪裡跑">
              {RUN_OPTIONS.map((item) => (
                <StateChip
                  key={item.key}
                  text={item.zh}
                  icon={item.icon}
                  state={item.key === run ? 'on' : 'off'}
                />
              ))}
            </CompareRow>
            <CompareRow label="碰得到什麼" tall>
              {REACH[run].map((item) => (
                <StateChip key={item.text} text={item.text} state={item.state} />
              ))}
            </CompareRow>
            <CompareRow label="App 要開著嗎">
              <StateChip text={AFTER_CLOSE[run].text} state={AFTER_CLOSE[run].state} />
            </CompareRow>
            <CompareRow label="在哪裡接手">
              {HANDOFF.map((item) => (
                <StateChip
                  key={item.text}
                  text={item.text}
                  icon={item.icon}
                  state={run === 'cloud' || item.local ? 'on' : 'off'}
                />
              ))}
            </CompareRow>
          </div>

          <p className="mt-4 h-[52px] shrink-0 text-[17px] leading-[26px] text-muted">
            {RUN_NOTE[run]}
          </p>
        </section>

        <div className="flex h-[66px] shrink-0 items-center gap-5 rounded-xl border border-line bg-panel-lift px-5">
          <span className={LABEL_FAINT}>方案</span>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-[19px] leading-6">
            <dt className="font-semibold text-paper">桌面版</dt>
            <dd className="text-muted">所有方案都有（Free、Go 是 Limited）</dd>
            <dt className="font-semibold text-paper">網頁、手機</dt>
            <dd className="text-muted">Plus、Pro、Business、Enterprise、Edu</dd>
          </dl>
        </div>
      </div>

      {/* ── 右：Work 新對話頁示意（輸入框放低，上方留給彈出選單） ── */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <MockWindow label="ChatGPT Work 輸入框的介面示意">
          <div className={SIDEBAR}>
            <span className={`${SELECTOR} shrink-0`}>
              <SelectorFace product="chatgpt" />
            </span>
            <NavRows product="chatgpt" />
            <div className="mt-5 shrink-0">
              <ChatRows product="chatgpt" />
            </div>
            <AccountRow />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col items-center pt-[300px]">
            <ModeSwitcher value="work" />

            <Spot {...spotProps('composer')} className="mt-4 shrink-0 rounded-2xl">
              <div className={COMPOSER}>
                <p className="text-[21px] leading-8 text-faint">Do anything. @ to use plugins</p>
                <div className="flex h-9 items-center gap-2">
                  <Spot {...spotProps('run')} className="rounded-full">
                    <button
                      type="button"
                      aria-expanded={open === 'run'}
                      aria-label={`跑在哪：${runNow.name}`}
                      onClick={(event) => {
                        toggleMenu('run');
                        blurAfterClick(event);
                      }}
                      onKeyDown={keepActivationKeys}
                      className={`${CHIP} ${FOCUS_RING} hover:border-paper`}
                    >
                      <Glyph name={runNow.icon} size={18} className="text-muted" />
                      {runNow.name}
                      <Glyph name="chevron" size={14} className="text-muted" />
                    </button>
                    {open === 'run' && (
                      <div className="slide-enter absolute bottom-[calc(100%+12px)] left-0 z-20 flex w-[300px] flex-col gap-1 rounded-xl border-2 border-line bg-panel p-2">
                        {RUN_OPTIONS.map((item) => {
                          const on = item.key === run;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              aria-pressed={on}
                              onClick={(event) => {
                                setRun(item.key);
                                setOpen(null);
                                blurAfterClick(event);
                              }}
                              onKeyDown={keepActivationKeys}
                              className={`flex h-12 items-center gap-3 rounded-lg px-3 text-left ${FOCUS_RING} ${
                                on ? 'bg-panel-lift' : 'hover:bg-panel-lift'
                              }`}
                            >
                              <Glyph name={item.icon} size={20} className="text-muted" />
                              <span className="text-[19px] font-semibold text-paper">{item.name}</span>
                              <NoteTag>{item.zh}</NoteTag>
                              {on && <Glyph name="check" size={20} className="ml-auto text-paper" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Spot>
                  <span className="flex-1" />
                  <ModelChip />
                  <MicSend />
                </div>
              </div>
            </Spot>

            <div className="mt-3 flex h-10 w-[680px] shrink-0 items-center">
              <Spot {...spotProps('perm')} className="rounded-full">
                <button
                  type="button"
                  aria-expanded={open === 'perm'}
                  aria-label={`權限：${permNow.name}`}
                  onClick={(event) => {
                    toggleMenu('perm');
                    blurAfterClick(event);
                  }}
                  onKeyDown={keepActivationKeys}
                  className={`${CHIP} ${FOCUS_RING} hover:border-paper`}
                >
                  <Glyph name="shield" size={18} className="text-muted" />
                  {permNow.name}
                  <Glyph name="chevron" size={14} className="text-muted" />
                </button>
                {open === 'perm' && (
                  <div className="slide-enter absolute bottom-[calc(100%+12px)] left-0 z-20 flex w-[720px] flex-col rounded-xl border-2 border-line bg-panel p-3">
                    <p className="flex h-10 items-center px-3 text-[18px] font-semibold text-paper">
                      How should ChatGPT actions be approved?
                    </p>
                    <div className="flex flex-col gap-1">
                      {PERMS.map((item) => {
                        const on = item.key === perm;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            aria-pressed={on}
                            onClick={(event) => {
                              setPerm(item.key);
                              setOpen(null);
                              blurAfterClick(event);
                            }}
                            onKeyDown={keepActivationKeys}
                            className={`grid h-[66px] grid-cols-[22px_1fr_auto] items-center gap-3 rounded-lg px-3 text-left ${FOCUS_RING} ${
                              on ? 'bg-panel-lift' : 'hover:bg-panel-lift'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`grid size-5 place-items-center rounded-full border-2 ${
                                on ? 'border-paper' : 'border-line'
                              }`}
                            >
                              {on && <span className="size-2.5 rounded-full bg-paper" />}
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="text-[19px] leading-6 font-semibold text-paper">
                                {item.name}
                              </span>
                              <span className="text-[16px] leading-5 text-muted">{item.desc}</span>
                            </span>
                            <NoteTag>{item.zh}</NoteTag>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Spot>
            </div>
          </div>
        </MockWindow>
        <MockCaption />
      </div>
    </div>
  );
}
