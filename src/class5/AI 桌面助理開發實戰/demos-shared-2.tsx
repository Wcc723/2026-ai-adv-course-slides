import {
  Fragment,
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import chatgptRemoteUrl from './images/chatgpt-remote.png';
import claudeRemoteUrl from './images/claude-remote.png';
import { VOTE_TOPICS } from './vote-topics';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 共有的能力（後半）
 *
 *   第 19 頁  RemoteControlDemo  Remote Control（withVote，根容器 640）
 *   第 20 頁  VoiceMcpDemo       語音搭配 MCP（withVote，根容器 640）
 *   第 21 頁  ChromeDemo         AI in Chrome（withVote，根容器 640）
 *   第 22 頁  ChromeFormDemo     AI in Chrome 實作：幫我填表單（根容器 720）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（Notion「課綱 › ChatGPT vs Claude」）
 * ──────────────────────────────────────────────────────────────
 * - 第 19 頁：「ChatGPT Remote Control」與「Claude Code 的 Remote Control」兩個
 *   callout。兩句講師心得原文放在引言卡；截圖 images/chatgpt-remote.png、
 *   images/claude-remote.png 是講師附的。
 *   CODD 筆記「簡報調整」（2026-11-10）補了兩句，寫進開法卡：
 *   「ChatGPT 可以在手機版的 Codex 進行操作」「Claude Code 有開啟後，新的專案就能在
 *   手機上看到」。
 * - 第 20 頁：「語音搭配 MCP」callout（講師要求補示意圖）與大綱的註記
 *   「語音搭配 MCP（Claude 限定英文）」。CODD 筆記（2026-11-10）把範例改成
 *   「直接讀取課綱」：用語音請 ChatGPT 透過 Notion MCP 讀這一頁
 *   https://app.notion.com/p/ChatGPT-vs-Claude-4136ab47eb48805290aee58fed3a6076
 *   （頁面名稱「課綱 › ChatGPT vs Claude」，Notion 節點上的小文件連到這裡）。
 * - 第 21 頁：「AI in Chrome」callout：兩個擴充功能的連結、「簡單來說，就是可以讓
 *   AI 來操控你的瀏覽器」、操作登入後的介面與 Google Search Console 的心得。
 * - 第 22 頁：「AI in Chrome 實作」callout（「你提供畫面上有一個簡單的表單……
 *   你只要提供表單以及提示詞給我就好」）。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證來源（查核日 2026-11-10）
 * ──────────────────────────────────────────────────────────────
 * Remote Control
 *   https://learn.chatgpt.com/docs/remote-connections
 *     被控制的那台：Settings > Connections > Control this Mac or PC → Set up／Add；
 *     控制端：Settings > Connections > Control other devices；手機（iOS／Android）
 *     掃 QR code 配對；兩台要 same account and workspace、host 要 awake, online；
 *     「Choosing Sleep still stops remote access.」；遠端用的是 host 的 projects、
 *     files、plugins、Computer Use；瀏覽器任務要在 host 開 Computer Use、裝 Chrome 擴充。
 *     頁面沒有提到「部署」—— 那是講師自己的使用經驗，放在引言裡。
 *   https://code.claude.com/docs/en/remote-control
 *     /remote-control（/rc）在單一 session 開啟、再輸入一次斷開；從 claude.ai/code
 *     或 Claude App 接手；「Enable Remote Control for all sessions」（/config）；
 *     電腦要開著、claude process 要持續執行；檔案、MCP、工具與專案設定都照常可用。
 *   https://code.claude.com/docs/en/desktop
 *     桌面版：「Connect new sessions to Remote Control」在 Settings > Code 或
 *     Settings > Claude Code，只影響之後新開的 session。
 *   手機版的 Codex（只從搜尋結果讀到，help.openai.com 直接讀取回 403）：
 *     https://9to5mac.com/2026/05/14/openai-brings-codex-control-to-chatgpt-for-iphone-and-android/
 *     https://9to5mac.com/2026/05/29/chatgpt-for-ios-can-now-start-codex-work-on-windows/
 *     ChatGPT 的 iOS／Android App 裡有 Codex，在電腦端掃 QR code 配對之後，
 *     從手機上的 Codex 開工作、看進度、核准操作；後來也支援 Windows 的主機。
 * 語音
 *   https://support.claude.com/en/articles/11101966-use-voice-mode
 *     「Connected tools work the same way in voice mode as they do in text chat」；
 *     「Support for languages other than English is in beta.」
 *     ⚠ 官方沒有寫「語音搭配 MCP 限定英文」，所以頁面上標「講師實測」。
 *   https://help.openai.com/en/articles/6825453-chatgpt-release-notes
 *     （2026-09-23「Live now supports plugins on web, iOS, and Android」，只從搜尋摘要
 *     看到；help.openai.com 的 ChatGPT Voice 文章直接讀取回 403）。頁面不寫 ChatGPT
 *     語音的官方說法，只畫講師描述的流程。
 * Chrome
 *   https://learn.chatgpt.com/docs/chrome-extension
 *     在桌面版 Settings > Computer Use 安裝；對話裡用 @ 選瀏覽器；「ChatGPT can read or
 *     act on sites where you're already signed in」；「Treat page content as untrusted
 *     context」；「Allow for all sites」標 Elevated Risk。
 *   https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome
 *     工具列打開側邊欄；reading, clicking, typing, navigating, and filling forms。
 *   https://support.claude.com/en/articles/12902428-use-claude-in-chrome-safely
 *     「The biggest risk facing browser-using AI tools is prompt injection attacks」；
 *     不要用在 sensitive sites、另開 separate browser profile。
 *   兩個 Chrome 線上應用程式商店頁面（講師附的網址，2026-11-04 更新）：
 *     ChatGPT（OpenAI）「Control your browser with ChatGPT.」
 *     Claude（Anthropic）「A lot of work lives behind a login, on a page with no export
 *     button. Claude in Chrome works there.」
 *
 * 補的示意：
 * - 第 19 頁 Claude 分頁「單一 Session」：截圖裡沒有這個開法，改成把截圖調淡、
 *   上面疊一張 /remote-control 指令卡（不是截圖的一部分）。截圖上的 acid 外框是
 *   量原圖位置畫的。「設定 › Claude Code」這段路徑照官方文件，繁中介面的實際字樣
 *   只看得到截圖裡的那三個開關。
 * - 第 20 頁整張流程圖、每一步的說明、兩句對話泡泡都是照講師那段話補的示意；
 *   ChatGPT 的回答是照課綱的大綱寫的，不是實際錄到的回答。
 * - 第 21 頁「示意」那一列三個方塊（已登入的 Chrome → Google Search Console →
 *   整理網站資料），以及安全提醒的分類與措辭（依兩家官方的安全說明歸納）。
 * - 第 22 頁表單與兩份提示詞是虛構的示範資料（暱稱「小明」）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   分頁一律用深色小色塊（bg-paper ＋ text-on-accent），不佔強調色。
 *   第 19 頁  只有 acid（選到的開法、截圖上的外框、指令卡外框）。
 *   第 20 頁  coral（去程，實線）＋ teal（回程，虛線），沿用圖解慣例；
 *             正在講的節點用 3px 實心深色框（paper），不另外開色。
 *   第 21 頁  blue（連結卡）＋ coral（安全提醒的 6px 左粗條）。
 *   第 22 頁  acid（送出、表單焦點、勾選的評分）＋ teal（已送出、已複製）。
 *   淡底（/14）一律配 6px 不透明左粗條或實心色框，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768）
 * ──────────────────────────────────────────────────────────────
 *   第 19 頁 h-[640px]，寬 1740 ＝ 左欄 700 ＋ gap 32 ＋ 右欄 1008
 *     左  分頁 56 ＋ 24 ＋ 引言卡 188 ＋ 24 ＋ 小標 24 ＋ 10
 *         ＋ 開法卡 136 × 2 ＋ 12 ＝ 610
 *         引言卡：py 40 ＋ 標籤 26 ＋ 8 ＋ 26px × 1.45 × 3 行 113 ＝ 187
 *         開法卡：py 32 ＋ 標題 34 ＋ 6 ＋ 20px × 1.5 × 2 行 60 ＝ 132
 *     右  截圖框 454 ＋ 14 ＋ 怎麼開 88 ＋ 12 ＋ 註腳（最多兩行）58 ＝ 626
 *         截圖框內 974 × 420：ChatGPT 2020×832 → 974 × 401（寬撐滿）；
 *         Claude 1978×902 → 921 × 420（高撐滿）。外框用百分比，量自原圖。
 *   第 20 頁 h-[640px]
 *     控制列 52 ＋ 24 ＋ 流程圖 260 ＋ 24 ＋ 下排 236 ＝ 596
 *     流程圖：四個節點 270 ＋ 三欄箭頭各 220；節點內 ≈ 圖示 56 ＋ 名稱 35 ＋ 副標 30
 *             ＋ 說明或小文件 62 ＋ 間距 ≈ 211
 *     下排：說明卡（≈ 標籤 26 ＋ 標題 38 ＋ 一行說明 32 ＋ 泡泡 44 ＋ 間距 ≈ 162）
 *           ＋ Claude 註記卡 600 寬（≈ 176）
 *   第 21 頁 h-[640px]
 *     一句話 64 ＋ 24 ＋ 下排 552
 *     左  連結卡 264 × 2 ＋ 24（卡內 ≈ py 48 ＋ 標籤 26 ＋ 12 ＋ 名稱 45 ＋ 8
 *         ＋ 說明兩行 60 ＋ 網址列 40 ≈ 251）
 *     右  分頁 56 ＋ 16 ＋ 內容卡 480（p-7，內高 422）
 *         卡斯伯怎麼用 ≈ 引言 152 ＋ 20 ＋ 示意 78 ＋ 20 ＋ 官方說法 129 ＝ 399
 *         安全提醒     ≈ 三張 118 ＋ 間距 14 × 2 ＝ 382
 *   第 22 頁 h-[720px]，寬 1740 ＝ 左欄 700 ＋ gap 36 ＋ 表單 1004
 *     左  提示詞列 44 ＋ 14 ＋ 提示詞框 316（7 行 × 34 ＋ py 40 ≈ 278）
 *         ＋ 16 ＋ 複製列 56 ＋ 24 ＋ 步驟卡（剩下的 250）
 *     右  表單卡 py-7 → 內高 662：標題 72 ＋ 20 ＋ 暱稱／功能 96 ＋ 20 ＋ 評分 96
 *         ＋ 20 ＋ 留言 30 ＋ 8 ＋ 92 ＋ 20 ＋ 按鈕 56 ＋ 20 ＋ 結果列 108 ≈ 658
 *   沒有任何容器會捲動；切分頁、逐步播放、送出表單都不會改變高度
 *   （結果列、說明卡、內容卡都是固定高度）。
 *   浮水印在右上角：四頁的右上角都只有空白、截圖的空白處，或卡片標題列的右半邊。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 分頁：選中用深色小色塊，不佔強調色 */
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-14 shrink-0 rounded-xl border px-6 text-[22px] transition-colors duration-200 ${
        active
          ? 'border-paper bg-paper font-medium text-on-accent'
          : 'border-line bg-panel text-paper hover:border-muted'
      }`}
    >
      {children}
    </button>
  );
}

/** 講師原話的引言卡 */
function QuoteCard({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`flex shrink-0 flex-col justify-center rounded-2xl border border-line border-l-[6px] border-l-paper bg-ink-soft px-7 ${className}`}
    >
      <figcaption className={`${LABEL_TYPE} text-faint`}>{label}</figcaption>
      <blockquote className="mt-2 text-[26px] leading-[1.45] text-paper">
        「{children}」
      </blockquote>
    </figure>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 19 頁 · RemoteControlDemo — Remote Control
 *
 * 左：ChatGPT／Claude Code 分頁 ＋ 講師心得 ＋ 兩種開法（可點）。
 * 右：講師的截圖；點哪一種開法，截圖上就框出對應的位置，下方一條「怎麼開」。
 * ChatGPT 的兩種是「被控制的那台／手上這台」（截圖是控制端的「控制其他裝置」）；
 * Claude 的兩種照講師的話分成「單一 Session／整個設定」。
 * 「單一 Session」不在設定頁裡，截圖調淡、疊一張指令卡。
 * 兩個分頁一進來都停在截圖對得上的那一種（ChatGPT 手上這台、Claude 整個設定）。
 * ══════════════════════════════════════════════════════════════ */

/** 截圖上的框，單位是圖片寬高的百分比（量自原圖） */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

type RcHow =
  | { kind: 'path'; parts: readonly string[] }
  | { kind: 'command'; command: string };

interface RcMode {
  id: string;
  title: string;
  text: string;
  boxes: readonly Box[];
  how: RcHow;
  /** 「怎麼開」第二行，一行放得下 */
  howNote: string;
}

type RcBrandId = 'chatgpt' | 'claude';

interface RcBrand {
  id: RcBrandId;
  tab: string;
  quote: string;
  modesLabel: string;
  shot: {
    src: string;
    alt: string;
    /** CSS aspect-ratio，等於原圖尺寸 */
    ratio: string;
    /** 寬撐滿或高撐滿（截圖框內 974 × 420） */
    fit: 'width' | 'height';
    /** 截圖框底色：亮色截圖用 panel、深色截圖用 paper，留白才不會像破洞 */
    frame: string;
  };
  modes: readonly [RcMode, RcMode];
  defaultMode: 0 | 1;
  footnote: string;
}

const RC_BRANDS: readonly RcBrand[] = [
  {
    id: 'chatgpt',
    tab: 'ChatGPT',
    quote:
      '這功能我很常使用，它很適合直接去操控另外一台電腦，包含像是操控瀏覽器，或是指示 AI 做資料的部署，都是沒有問題的。',
    modesLabel: '兩邊各設定一次',
    shot: {
      src: chatgptRemoteUrl,
      alt: 'ChatGPT 桌面版的「連線」設定頁：分頁有控制這台 Mac、控制其他裝置、SSH；目前在「控制其他裝置」，列出兩台已連線的裝置（一台 Mac mini、一台 PC）',
      ratio: '2020 / 832',
      fit: 'width',
      frame: 'bg-panel',
    },
    modes: [
      {
        id: 'host',
        title: '被控制的那台',
        text: '要被遙控的電腦：開著 ChatGPT 桌面版、允許其他裝置連線；手機掃 QR code 就能配對。',
        boxes: [{ left: 5.2, top: 23.6, width: 11.9, height: 10.1 }],
        how: { kind: 'path', parts: ['設定', '連線', '控制這台 Mac（或 PC）'] },
        howNote: '確認遠端存取；這台要保持開機、連網，進入睡眠就會斷線。',
      },
      {
        id: 'controller',
        title: '手上這台',
        text: '手機在 ChatGPT App 的 Codex 裡操作；另一台 Mac／PC 則是新增要控制的裝置，再下指令、核准操作。',
        boxes: [
          { left: 17.1, top: 23.6, width: 12.4, height: 10.1 },
          { left: 4.7, top: 45.4, width: 88.3, height: 49.5 },
        ],
        how: { kind: 'path', parts: ['設定', '連線', '控制其他裝置', '新增'] },
        howNote: '兩台要登入同一個帳號與工作區；手機版從 ChatGPT App 的 Codex 進去操作。',
      },
    ],
    defaultMode: 1,
    footnote:
      '遠端用的是那台電腦上的專案、檔案、Plugin 與 Computer Use；要操控瀏覽器，那台電腦也要裝好 Chrome 擴充功能。',
  },
  {
    id: 'claude',
    tab: 'Claude Code',
    quote: 'Claude Code 的 Remote Control 有分為單一 Session 或者是整個設定。',
    modesLabel: '兩種開法',
    shot: {
      src: claudeRemoteUrl,
      alt: 'Claude 桌面版的 Remote Control 設定：將新工作階段連接至 Remote Control、允許您的手機和 claude.ai 在此啟動工作階段、讓此電腦保持喚醒狀態，三個開關都是關閉的',
      ratio: '1978 / 902',
      fit: 'height',
      frame: 'bg-paper',
    },
    modes: [
      {
        id: 'single',
        title: '單一 Session',
        text: '只讓目前這一個 session 可以從手機或 claude.ai 接手；用完再輸入一次就斷開。',
        boxes: [],
        how: { kind: 'command', command: '/remote-control' },
        howNote: '在 session 裡輸入，縮寫 /rc；再到 claude.ai/code 或 Claude App 接手。',
      },
      {
        id: 'all',
        title: '整個設定',
        text: '打開之後，新開的專案（session）都會自動出現在手機上，不用每次手動開。',
        boxes: [{ left: 0.7, top: 16.6, width: 98.6, height: 23.3 }],
        how: {
          kind: 'path',
          parts: ['設定', 'Claude Code', '將新工作階段連接至 Remote Control'],
        },
        howNote:
          '只影響之後新開的 session；終端機版：/config › Enable Remote Control for all sessions',
      },
    ],
    defaultMode: 1,
    footnote:
      'Claude 一直在你的電腦上執行：檔案、MCP、工具與專案設定都照常可用。電腦要開著，Claude 不能關掉。',
  },
];

function ModeCard({
  no,
  mode,
  active,
  onClick,
}: {
  no: number;
  mode: RcMode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-[136px] w-full shrink-0 items-start gap-4 rounded-2xl border border-l-[6px] px-6 py-4 text-left transition-colors duration-300 ${
        active
          ? 'border-acid/55 border-l-acid bg-acid/14'
          : 'border-line border-l-line bg-panel hover:border-l-acid'
      }`}
    >
      <span
        className={`w-10 shrink-0 pt-1 font-display text-[26px] leading-none font-semibold tabular-nums ${
          active ? 'text-acid' : 'text-faint'
        }`}
      >
        {String(no).padStart(2, '0')}
      </span>
      <span className="min-w-0">
        <span className="block text-[26px] leading-snug font-medium text-paper">
          {mode.title}
        </span>
        <span className="mt-1.5 block text-[20px] leading-normal text-muted">
          {mode.text}
        </span>
      </span>
    </button>
  );
}

function HighlightBox({ box }: { box: Box }) {
  return (
    <div
      className="pointer-events-none absolute rounded-lg border-4 border-acid outline-2 outline-on-accent transition-all duration-300 ease-out"
      style={{
        left: `${box.left}%`,
        top: `${box.top}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
    />
  );
}

function HowStrip({ how, note }: { how: RcHow; note: string }) {
  const chip = 'rounded-lg border border-line bg-panel px-3 py-0.5 text-[20px] text-paper';
  return (
    <div className="mt-3.5 flex h-[88px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-line bg-ink-soft px-6">
      <div className="flex items-center gap-3">
        <span className={`${LABEL_TYPE} mr-1 text-faint`}>怎麼開</span>
        {how.kind === 'path' ? (
          how.parts.map((part, index) => (
            <Fragment key={part}>
              {index > 0 && (
                <span aria-hidden="true" className="text-[20px] text-faint">
                  ›
                </span>
              )}
              <span className={chip}>{part}</span>
            </Fragment>
          ))
        ) : (
          <code className={`${chip} font-mono font-semibold`}>{how.command}</code>
        )}
      </div>
      <p className="truncate text-[18px] text-muted">{note}</p>
    </div>
  );
}

export function RemoteControlDemo() {
  const [brandId, setBrandId] = useState<RcBrandId>('chatgpt');
  const [modeByBrand, setModeByBrand] = useState<Record<RcBrandId, 0 | 1>>({
    chatgpt: RC_BRANDS[0].defaultMode,
    claude: RC_BRANDS[1].defaultMode,
  });

  const brand = RC_BRANDS.find((item) => item.id === brandId) ?? RC_BRANDS[0];
  const modeIndex = modeByBrand[brand.id];
  const mode = brand.modes[modeIndex];
  const inSettings = mode.how.kind === 'path';

  const pickMode = (index: 0 | 1) =>
    setModeByBrand((current) => ({ ...current, [brand.id]: index }));

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[700px_1fr] gap-8">
      {/* ── 左：分頁、心得、兩種開法 ──────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3">
          {RC_BRANDS.map((item) => (
            <Tab
              key={item.id}
              active={item.id === brand.id}
              onClick={() => setBrandId(item.id)}
            >
              {item.tab}
            </Tab>
          ))}
        </div>

        <QuoteCard key={brand.id} label="卡斯伯的使用心得" className="slide-enter mt-6 h-[188px]">
          {brand.quote}
        </QuoteCard>

        <p className={`mt-6 ${LABEL_TYPE} text-faint`}>{brand.modesLabel}</p>
        <div className="mt-2.5 flex flex-col gap-3">
          {brand.modes.map((item, index) => (
            <ModeCard
              key={`${brand.id}-${item.id}`}
              no={index + 1}
              mode={item}
              active={index === modeIndex}
              onClick={() => pickMode(index === 0 ? 0 : 1)}
            />
          ))}
        </div>
      </div>

      {/* ── 右：截圖、怎麼開、註腳 ────────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <div
          className={`relative flex h-[454px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line p-4 ${brand.shot.frame}`}
        >
          <div
            className="relative max-h-full max-w-full"
            style={{
              aspectRatio: brand.shot.ratio,
              ...(brand.shot.fit === 'width' ? { width: '100%' } : { height: '100%' }),
            }}
          >
            <img
              src={brand.shot.src}
              alt={brand.shot.alt}
              className={`size-full object-contain transition-opacity duration-300 ${
                inSettings ? 'opacity-100' : 'opacity-25'
              }`}
            />
            {mode.boxes.map((box) => (
              <HighlightBox key={`${box.left}-${box.top}`} box={box} />
            ))}
          </div>

          {mode.how.kind === 'command' && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="slide-enter flex flex-col items-center gap-3 rounded-2xl border-2 border-acid bg-panel px-12 py-8 text-center">
                <span className={`${LABEL_TYPE} text-faint`}>不在設定頁 · 在 session 裡輸入</span>
                <code className="rounded-xl bg-ink-soft px-6 py-2 font-mono text-[36px] font-semibold text-paper">
                  {mode.how.command}
                </code>
                <span className="text-[20px] text-muted">
                  只有這一個 session 連上 Remote Control
                </span>
              </div>
            </div>
          )}
        </div>

        <HowStrip how={mode.how} note={mode.howNote} />

        <p className="mt-3 h-[58px] shrink-0 text-[19px] leading-normal break-keep text-pretty text-muted">
          {brand.footnote}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 20 頁 · VoiceMcpDemo — 語音搭配 MCP
 *
 * 範例：用說的，請 ChatGPT 透過 Notion MCP 讀這堂課的課綱，再用語音說給你聽。
 * 四個節點：你（語音）→ ChatGPT 語音對話 → MCP 連線 → Notion（課綱頁）。
 * 上排 coral 實線是去程、下排 teal 虛線是回程（圖解慣例）。
 * 一進來是「全貌」：所有箭頭都上色、節點都是一般狀態，本身就是一張完整的圖。
 * 「下一步」逐段播放 5 步；正在講的節點換成 3px 深色實心框、其餘節點變淡，
 * 箭頭分成已走過（上色）、這一步（加粗）、還沒走（line 色）。
 * 右下角是 Claude 的註記：語音搭配 MCP 目前限定英文（官方查不到，標講師實測）。
 * ══════════════════════════════════════════════════════════════ */

type VmNodeId = 'you' | 'chatgpt' | 'mcp' | 'notion';

const VM_NODES: readonly { id: VmNodeId; name: string; sub: string; detail: string }[] = [
  { id: 'you', name: '你', sub: '用說的', detail: '開著語音對話直接講' },
  { id: 'chatgpt', name: 'ChatGPT', sub: '語音對話', detail: '聽懂需求，決定找 Notion' },
  { id: 'mcp', name: 'MCP', sub: '連線', detail: '呼叫 Notion 的工具' },
  { id: 'notion', name: 'Notion', sub: '這堂課的課綱', detail: '' },
];

interface VmStep {
  title: string;
  text: string;
  nodes: readonly VmNodeId[];
  say?: { who: string; text: string };
}

/** 第 0 步是全貌，1–5 是逐段播放 */
const VM_STEPS: readonly VmStep[] = [
  {
    title: '用說的，讓 ChatGPT 去讀 Notion 上的課綱',
    text: '透過 MCP 連到 Notion，讀完課綱再用語音跟你說。按「下一步」一段一段看。',
    nodes: [],
  },
  {
    title: '你用說的提出需求',
    text: '不用打字，直接跟 ChatGPT 講要做什麼。',
    nodes: ['you', 'chatgpt'],
    say: { who: '你', text: '幫我打開 Notion 上「ChatGPT vs Claude」這份課綱，跟我說今天要上哪些內容。' },
  },
  {
    title: 'ChatGPT 透過 MCP 連線',
    text: 'ChatGPT 判斷這件事要用 Notion，透過 MCP 連線呼叫 Notion 的工具。',
    nodes: ['chatgpt', 'mcp'],
  },
  {
    title: '到 Notion 找文件',
    text: '搜尋到〈課綱 › ChatGPT vs Claude〉這一頁，把內容讀出來。',
    nodes: ['mcp', 'notion'],
  },
  {
    title: '內容回到 ChatGPT',
    text: '課綱內容沿著同一條連線回到 ChatGPT，成為這段對話的參考資料。',
    nodes: ['notion', 'mcp', 'chatgpt'],
  },
  {
    title: '用語音回答你',
    text: 'ChatGPT 照著課綱整理重點，直接用語音說給你聽，你可以接著追問。',
    nodes: ['chatgpt', 'you'],
    say: {
      who: 'ChatGPT',
      // 2026-11-18：「混合使用」那一頁已移除，最後一章改成「開發屬於自己的工具」（社群自製工具＋CODD）
      text: '今天先看兩家共有的能力，再看各自獨有的功能，最後是自製工具與 CODD。',
    },
  },
];

const VM_LAST = VM_STEPS.length - 1;

/** 範例要讀的 Notion 課綱頁（講師的 Notion，沒有權限的人點開會要求登入） */
const SYLLABUS_URL =
  'https://app.notion.com/p/ChatGPT-vs-Claude-4136ab47eb48805290aee58fed3a6076';

/** 三欄箭頭（第 i 欄在節點 i 與 i+1 之間）：標籤與在第幾步亮起 */
const VM_GO = [
  { label: '提出需求', step: 1 },
  { label: '呼叫工具', step: 2 },
  { label: '搜尋、讀取', step: 3 },
] as const;

const VM_BACK = [
  { label: '用語音回答', step: 5 },
  { label: '回傳內容', step: 4 },
  { label: '回傳內容', step: 4 },
] as const;

type ArrowState = 'todo' | 'done' | 'current';

function arrowState(at: number, step: number): ArrowState {
  if (step === 0) return 'done';
  if (at === step) return 'current';
  return at < step ? 'done' : 'todo';
}

function FlowArrow({ dir, state }: { dir: 'go' | 'back'; state: ArrowState }) {
  const color =
    state === 'todo'
      ? 'var(--color-line)'
      : dir === 'go'
        ? 'var(--color-coral)'
        : 'var(--color-teal)';
  const width = state === 'current' ? 5 : 3;
  const isGo = dir === 'go';

  return (
    <svg width={180} height={24} viewBox="0 0 180 24" fill="none" aria-hidden="true">
      <line
        x1={isGo ? 6 : 174}
        y1={12}
        x2={isGo ? 162 : 18}
        y2={12}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={isGo ? undefined : '10 7'}
        className="transition-[stroke,stroke-width] duration-300"
      />
      <path
        d={isGo ? 'M160 3 L178 12 L160 21 Z' : 'M20 3 L2 12 L20 21 Z'}
        fill={color}
        className="transition-[fill] duration-300"
      />
    </svg>
  );
}

function ArrowLabel({
  no,
  label,
  dir,
  state,
}: {
  no: number;
  label: string;
  dir: 'go' | 'back';
  state: ArrowState;
}) {
  const tone =
    state === 'todo' ? 'text-faint' : dir === 'go' ? 'text-coral' : 'text-teal';
  return (
    <span
      className={`flex items-center gap-1.5 text-[17px] whitespace-nowrap transition-colors duration-300 ${tone} ${
        state === 'current' ? 'font-semibold' : ''
      }`}
    >
      <span className="font-display tabular-nums">{no}</span>
      {label}
    </span>
  );
}

function VmArrows({ index, step }: { index: number; step: number }) {
  const go = VM_GO[index];
  const back = VM_BACK[index];
  const goState = arrowState(go.step, step);
  const backState = arrowState(back.step, step);

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-1.5">
        <ArrowLabel no={go.step} label={go.label} dir="go" state={goState} />
        <FlowArrow dir="go" state={goState} />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <FlowArrow dir="back" state={backState} />
        <ArrowLabel no={back.step} label={back.label} dir="back" state={backState} />
      </div>
    </div>
  );
}

function NodeGlyph({ id }: { id: VmNodeId }) {
  const stroke = {
    stroke: 'var(--color-paper)',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <svg width={56} height={56} viewBox="0 0 64 64" aria-hidden="true">
      {id === 'you' && (
        <>
          <rect x={24} y={8} width={16} height={30} rx={8} {...stroke} />
          <path d="M16 30 a16 16 0 0 0 32 0" {...stroke} />
          <path d="M32 46 V56 M22 56 H42" {...stroke} />
        </>
      )}
      {id === 'chatgpt' && (
        <>
          <path
            d="M12 12 H52 a4 4 0 0 1 4 4 V42 a4 4 0 0 1 -4 4 H28 L18 56 V46 H12 a4 4 0 0 1 -4 -4 V16 a4 4 0 0 1 4 -4 Z"
            {...stroke}
          />
          <path d="M21 26 V32 M28 22 V36 M35 25 V33 M42 21 V37" {...stroke} />
        </>
      )}
      {id === 'mcp' && (
        <>
          <path d="M24 8 V20 M40 8 V20" {...stroke} />
          <rect x={14} y={20} width={36} height={18} rx={4} {...stroke} />
          <path d="M32 38 V46 a8 8 0 0 1 -8 8 H12" {...stroke} />
        </>
      )}
      {id === 'notion' && (
        <>
          <path d="M16 6 H38 L50 18 V58 H16 Z" {...stroke} />
          <path d="M38 6 V18 H50" {...stroke} />
          <path d="M22 30 H42 M22 38 H42 M22 46 H34" {...stroke} />
        </>
      )}
    </svg>
  );
}

function VmNodeCard({
  node,
  state,
}: {
  node: (typeof VM_NODES)[number];
  state: 'normal' | 'lit' | 'dim';
}) {
  const skin =
    state === 'lit'
      ? 'border-paper bg-panel'
      : state === 'dim'
        ? 'border-line-soft bg-ink-soft'
        : 'border-line bg-panel';

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-[3px] px-4 text-center transition-colors duration-300 ${skin}`}
    >
      <NodeGlyph id={node.id} />
      <p className="mt-3 text-[28px] leading-tight font-semibold text-paper">{node.name}</p>
      <p className="mt-1 text-[20px] text-muted">{node.sub}</p>
      {node.id === 'notion' ? (
        <a
          href={SYLLABUS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block w-full rounded-lg border border-line bg-panel px-3 py-2 text-left text-[16px] leading-snug text-muted transition-colors duration-200 hover:border-paper"
        >
          <span className="block font-semibold text-paper">課綱 ↗</span>
          <span className="block font-mono">ChatGPT vs Claude</span>
        </a>
      ) : (
        <p className="mt-3 text-[19px] leading-snug text-muted">{node.detail}</p>
      )}
    </div>
  );
}

const STEP_BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';

export function VoiceMcpDemo() {
  const [step, setStep] = useState(0);
  const current = VM_STEPS[step];

  const nodeState = (id: VmNodeId): 'normal' | 'lit' | 'dim' => {
    if (step === 0) return 'normal';
    return current.nodes.includes(id) ? 'lit' : 'dim';
  };

  const next = () => setStep((value) => (value >= VM_LAST ? 1 : value + 1));

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col">
      {/* ── 控制列（靠左，右上角留給浮水印）─────────────── */}
      <div className="flex h-[52px] shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
          className={`${STEP_BTN} border-line bg-panel text-paper hover:border-muted disabled:text-faint`}
        >
          上一步
        </button>
        <button
          type="button"
          onClick={next}
          className={`${STEP_BTN} w-[148px] border-paper bg-paper font-medium text-on-accent hover:brightness-125`}
        >
          {step >= VM_LAST ? '從頭播放' : '下一步'}
        </button>

        <div className="ml-4 flex items-center gap-2">
          {VM_STEPS.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? 'step' : undefined}
              className={`h-11 min-w-11 rounded-lg border px-3 font-display text-[19px] tabular-nums transition-colors duration-200 ${
                index === step
                  ? 'border-paper bg-paper text-on-accent'
                  : 'border-line bg-panel text-paper hover:border-muted'
              }`}
            >
              {index === 0 ? '全貌' : index}
            </button>
          ))}
        </div>

        <div className="ml-6 flex items-center gap-6 text-[17px]">
          <span className="flex items-center gap-2 text-coral">
            <svg width={40} height={10} viewBox="0 0 40 10" aria-hidden="true">
              <line x1={2} y1={5} x2={38} y2={5} stroke="var(--color-coral)" strokeWidth={3} strokeLinecap="round" />
            </svg>
            去程
          </span>
          <span className="flex items-center gap-2 text-teal">
            <svg width={40} height={10} viewBox="0 0 40 10" aria-hidden="true">
              <line
                x1={2}
                y1={5}
                x2={38}
                y2={5}
                stroke="var(--color-teal)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
            </svg>
            回程
          </span>
        </div>
      </div>

      {/* ── 流程圖 ─────────────────────────────────────────── */}
      <div className="mt-6 grid h-[260px] shrink-0 grid-cols-[270px_1fr_270px_1fr_270px_1fr_270px]">
        {VM_NODES.map((node, index) => (
          <Fragment key={node.id}>
            {index > 0 && <VmArrows index={index - 1} step={step} />}
            <VmNodeCard node={node} state={nodeState(node.id)} />
          </Fragment>
        ))}
      </div>

      {/* ── 下排：這一步在做什麼 ＋ Claude 的註記 ─────────── */}
      <div className="mt-6 grid h-[236px] shrink-0 grid-cols-[1fr_600px] gap-6">
        <div
          key={step}
          className="slide-enter flex flex-col justify-center rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel px-8"
        >
          <p className={`${LABEL_TYPE} text-faint`}>
            {step === 0 ? '全貌' : `Step ${step} / ${VM_LAST}`}
          </p>
          <p className="mt-1.5 text-[28px] leading-snug font-semibold text-paper">
            {current.title}
          </p>
          <p className="mt-1.5 text-[21px] leading-normal text-muted">{current.text}</p>
          {current.say && (
            <p className="mt-3 w-fit max-w-full truncate rounded-xl bg-ink-soft px-5 py-2 text-[21px] text-paper">
              <span className="font-semibold">{current.say.who}：</span>
              {current.say.text}
            </p>
          )}
        </div>

        <aside className="flex flex-col justify-center rounded-2xl border border-line bg-ink-soft px-7">
          <div className="flex items-center gap-3">
            <span className={`${LABEL_TYPE} text-faint`}>Claude 呢？</span>
            <span className="rounded-md bg-paper px-2.5 py-0.5 text-[16px] font-medium text-on-accent">
              講師實測
            </span>
          </div>
          <p className="mt-3 text-[26px] leading-snug font-semibold break-keep text-pretty text-paper">
            Claude 的語音模式搭配 MCP，目前限定英文。
          </p>
          <p className="mt-3 text-[19px] leading-normal text-muted">
            官方說明：語音模式可以使用已連接的工具；英文以外的語言目前是 beta。
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 21 頁 · ChromeDemo — AI in Chrome
 *
 * 上：講師那一句「簡單來說，就是可以讓 AI 來操控你的瀏覽器」。
 * 左：兩張 Chrome 線上應用程式商店的連結卡（整張是 <a>，新分頁開啟）。
 * 右：兩個分頁 ——「卡斯伯怎麼用」（講師原話 ＋ 示意 ＋ 兩家官方的說法）
 *     與「安全提醒」（三點，依兩家官方的安全說明歸納，coral 左粗條）。
 * ══════════════════════════════════════════════════════════════ */

const EXTENSIONS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    by: 'OpenAI',
    text: '在 ChatGPT 桌面版的「設定 › Computer Use」安裝；對話裡用 @ 選瀏覽器，它就能讀取、操作你已登入的網站。',
    url: 'https://chromewebstore.google.com/detail/chatgpt/hehggadaopoacecdllhhajmbjkdcmajg?hl=zh-tw',
    display: 'chromewebstore.google.com/detail/chatgpt',
  },
  {
    id: 'claude',
    name: 'Claude',
    by: 'Anthropic',
    text: '從 Chrome 工具列打開側邊欄，描述想做的事：Claude 會讀頁面、點擊、輸入、填表單，你在旁邊看著。',
    url: 'https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn?hl=zh-tw',
    display: 'chromewebstore.google.com/detail/claude',
  },
] as const;

const CHROME_SAFETY = [
  {
    title: '你登入了什麼，它就能動什麼',
    text: '在登入狀態下，AI 能看、能點、能送出，權限跟你本人一樣。網站權限從單次允許開始，不要一開始就對所有網站放行。',
  },
  {
    title: '網頁上的文字，可能是惡意指示',
    text: '頁面或信件裡藏的文字，可能把 AI 帶去做你沒要求的事（Prompt Injection）。兩家官方都提醒：頁面內容要當成不可信的資料。',
  },
  {
    title: '敏感的網站分開來',
    text: '網銀、公司後台這類網站先不要交給它；可以另開一個沒有登入敏感帳號的 Chrome 設定檔來用。',
  },
] as const;

type ChromeTab = 'usage' | 'safety';

function ExtensionCard({ ext }: { ext: (typeof EXTENSIONS)[number] }) {
  return (
    <a
      href={ext.url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-0 flex-1 flex-col justify-between rounded-2xl border-2 border-blue/70 bg-panel px-8 py-6 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-blue" />
          <span className={`${LABEL_TYPE} text-blue`}>Chrome 線上應用程式商店</span>
        </div>
        <p className="mt-3 flex items-baseline gap-4">
          <span className="text-[36px] leading-tight font-semibold text-paper">{ext.name}</span>
          <span className="text-[20px] text-muted">{ext.by}</span>
        </p>
        <p className="mt-2 text-[20px] leading-normal text-muted">{ext.text}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="min-w-0 flex-1 truncate font-mono text-[17px] text-faint">
          {ext.display}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[19px] font-medium text-on-accent">
          在新分頁打開
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </span>
      </div>
    </a>
  );
}

function ChromeUsage() {
  const flow = ['已登入的 Chrome', 'Google Search Console', '整理網站資料給你'];
  return (
    <>
      <QuoteCard label="卡斯伯的使用情境" className="py-5">
        我自己也很常請它來操控 Chrome 瀏覽器，操作我登入後的介面，像是我自己也會請它幫我登入
        Google Search Console 的網站資料。
      </QuoteCard>

      <div className="mt-5">
        <p className={`${LABEL_TYPE} text-faint`}>示意</p>
        <div className="mt-2 flex items-center gap-3">
          {flow.map((item, index) => (
            <Fragment key={item}>
              {index > 0 && (
                <span aria-hidden="true" className="text-[24px] text-faint">
                  →
                </span>
              )}
              <span className="flex h-11 items-center rounded-lg border border-line bg-panel px-4 text-[20px] whitespace-nowrap text-paper">
                {item}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line px-6 py-4">
        <p className={`${LABEL_TYPE} text-faint`}>官方怎麼說</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[19px] leading-normal text-muted">
          <li>
            <span className="font-semibold text-paper">ChatGPT：</span>
            可以讀取、操作你已經登入的網站，例如 LinkedIn、Gmail 或內部工具。
          </li>
          <li>
            <span className="font-semibold text-paper">Claude：</span>
            很多工作藏在登入之後、沒有匯出按鈕的頁面裡，它就在那裡工作。
          </li>
        </ul>
      </div>
    </>
  );
}

function ChromeSafety() {
  return (
    <div className="flex flex-col gap-3.5">
      {CHROME_SAFETY.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-line border-l-[6px] border-l-coral bg-panel px-6 py-3.5"
        >
          <p className="text-[23px] leading-snug font-semibold text-paper">{item.title}</p>
          <p className="mt-1 text-[19px] leading-normal text-muted">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export function ChromeDemo() {
  const [tab, setTab] = useState<ChromeTab>('usage');

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col">
      <p className="flex h-16 shrink-0 items-center gap-5">
        <span className={`${LABEL_TYPE} text-faint`}>簡單來說</span>
        <span className="text-[36px] font-semibold text-paper">
          就是可以讓 AI 來操控你的瀏覽器。
        </span>
      </p>

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-[720px_1fr] gap-8">
        <div className="flex min-h-0 flex-col gap-6">
          {EXTENSIONS.map((ext) => (
            <ExtensionCard key={ext.id} ext={ext} />
          ))}
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center gap-3">
            <Tab active={tab === 'usage'} onClick={() => setTab('usage')}>
              卡斯伯怎麼用
            </Tab>
            <Tab active={tab === 'safety'} onClick={() => setTab('safety')}>
              安全提醒
            </Tab>
          </div>
          <div
            key={tab}
            className="slide-enter mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-panel p-7"
          >
            {tab === 'usage' ? <ChromeUsage /> : <ChromeSafety />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 22 頁 · ChromeFormDemo — AI in Chrome 實作：幫我填表單
 *
 * 左：提示詞（兩種：指定內容／讓 AI 自己寫）＋ 複製按鈕 ＋ 三個步驟。
 * 右：真的可以填的「第五堂課 課後回饋表」。
 *
 * 給 AI 讀的設計：
 * - <form id="class5-feedback">，每個欄位都有 <label htmlFor> 與清楚的 id／name
 *   （nickname、favorite、rating、message），評分用原生 radio、功能用原生 select，
 *   選項是 vote-topics.ts 的 VOTE_TOPICS（value 是 id、顯示 label）。
 * - 欄位都是「非受控」的（defaultValue），送出時才用 FormData 讀值。
 *   受控元件在擴充功能直接改 .value 時會被 React 蓋回空字串，非受控就沒有這個問題。
 * - 「送出」是 type="button"：在暱稱欄按 Enter 不會意外送出（onSubmit 也擋掉了）。
 *   送出只在下方結果列顯示「已送出（示意，不會傳到任何地方）」與摘要；
 *   之後只要有欄位再被改動，結果列就回到「還沒送出」。
 * - 打字不會翻頁（SlideTemplate 已處理 input／textarea／select）；radio 與 select
 *   另外在 onKeyDown 擋掉方向鍵等翻頁鍵往上冒泡。
 * ══════════════════════════════════════════════════════════════ */

const FORM_PROMPTS = [
  {
    id: 'given',
    tab: '指定內容',
    lines: [
      '請在目前這個分頁的「第五堂課 課後回饋表」幫我填入：',
      '・暱稱：小明',
      '・最喜歡的功能：Remote Control',
      '・評分：5',
      '・想對講師說的話：今天學到讓 AI 操控瀏覽器，回去想試試看請它幫我整理 Google Search Console 的資料。',
      '填完先不要按送出，讓我確認。',
    ],
  },
  {
    id: 'free',
    tab: '讓 AI 自己寫',
    lines: [
      '請在目前這個分頁的「第五堂課 課後回饋表」幫我填寫：',
      '・暱稱：小明',
      '・最喜歡的功能：從下拉選單挑一個你覺得最實用的',
      '・評分：你自己決定',
      '・想對講師說的話：用一兩句話寫下對這堂課的回饋',
      '填完先不要按送出，讓我確認。',
    ],
  },
] as const;

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_LABEL: Record<CopyState, string> = {
  idle: '複製提示詞',
  copied: '已複製',
  failed: '無法複製，請手動選取',
};

const COPY_SKIN: Record<CopyState, string> = {
  idle: 'border-line bg-panel text-paper hover:border-muted',
  copied: 'border-teal bg-teal text-on-accent',
  failed: 'border-paper bg-paper text-on-accent',
};

const FORM_STEPS = [
  '用 Chrome 打開這一頁（就是現在這一頁）。',
  '打開 ChatGPT 或 Claude 的 Chrome 擴充功能，貼上提示詞。',
  '看它一欄一欄填好；確認沒問題，再自己按「送出」。',
] as const;

/** 會讓簡報翻頁的按鍵，在 radio／select 上不要往上冒泡 */
const NAV_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
]);

function keepNavKeys(event: KeyboardEvent<HTMLElement>) {
  if (NAV_KEYS.has(event.key)) event.stopPropagation();
}

const FIELD =
  'h-14 w-full rounded-xl border-2 border-line bg-panel px-4 text-[21px] text-paper placeholder:text-faint focus:border-acid focus:outline-none';

const FIELD_LABEL = 'text-[20px] font-medium text-paper';

interface FeedbackSnapshot {
  nickname: string;
  favorite: string;
  rating: string;
  message: string;
}

export function ChromeFormDemo() {
  const [promptId, setPromptId] = useState<(typeof FORM_PROMPTS)[number]['id']>('given');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [submitted, setSubmitted] = useState<FeedbackSnapshot | null>(null);

  const prompt = FORM_PROMPTS.find((item) => item.id === promptId) ?? FORM_PROMPTS[0];

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = window.setTimeout(() => setCopyState('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.lines.join('\n'));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form;
    if (!form) return;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? '').trim();
    setSubmitted({
      nickname: read('nickname'),
      favorite: read('favorite'),
      rating: read('rating'),
      message: read('message'),
    });
  };

  const handleReset = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.form?.reset();
    setSubmitted(null);
  };

  const favoriteLabel = submitted
    ? (VOTE_TOPICS.find((topic) => topic.id === submitted.favorite)?.label ?? '')
    : '';

  // 右欄用 minmax(0,1fr)：結果列的摘要是 nowrap 單行，1fr 的最小寬度會被它撐開，
  // 學員打的字一長，整個表單就被推出面板（面板出現橫向捲軸）
  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[700px_minmax(0,1fr)] gap-9">
      {/* ── 左：提示詞 ─────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-3">
          <span className={`${LABEL_TYPE} mr-1 text-faint`}>提示詞</span>
          {FORM_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPromptId(item.id)}
              aria-pressed={item.id === promptId}
              className={`h-11 rounded-lg border px-4 text-[19px] transition-colors duration-200 ${
                item.id === promptId
                  ? 'border-paper bg-paper font-medium text-on-accent'
                  : 'border-line bg-panel text-paper hover:border-muted'
              }`}
            >
              {item.tab}
            </button>
          ))}
        </div>

        <div
          key={prompt.id}
          className="slide-enter mt-3.5 h-[316px] shrink-0 rounded-2xl border border-line bg-ink-soft px-6 py-5"
        >
          {prompt.lines.map((line) => (
            <p key={line} className="text-[21px] leading-[1.6] text-paper">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 flex h-14 shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => void copyPrompt()}
            className={`h-14 rounded-xl border px-7 text-[21px] font-medium transition-colors duration-200 ${COPY_SKIN[copyState]}`}
          >
            {COPY_LABEL[copyState]}
          </button>
          <span className="text-[19px] text-muted">貼到 ChatGPT 或 Claude 的擴充功能</span>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col justify-center rounded-2xl border border-line bg-panel px-7">
          <p className={`${LABEL_TYPE} text-faint`}>怎麼試</p>
          <ol className="mt-3 flex flex-col gap-3">
            {FORM_STEPS.map((text, index) => (
              <li key={text} className="flex items-start gap-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-paper font-display text-[18px] font-semibold text-on-accent tabular-nums">
                  {index + 1}
                </span>
                <span className="text-[20px] leading-normal text-paper">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── 右：表單 ───────────────────────────────────────── */}
      <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-line bg-panel px-9 py-7">
        <header className="shrink-0">
          <h3
            id="class5-feedback-title"
            className="text-[30px] leading-tight font-semibold text-paper"
          >
            第五堂課 課後回饋表
          </h3>
          <p className="mt-1.5 text-[19px] text-muted">
            示範用表單：請填虛構資料，送出也不會傳到任何地方。
          </p>
        </header>

        <form
          id="class5-feedback"
          name="class5-feedback"
          aria-labelledby="class5-feedback-title"
          autoComplete="off"
          onSubmit={(event) => event.preventDefault()}
          onInput={() => setSubmitted(null)}
          className="mt-5 flex min-h-0 flex-1 flex-col"
        >
          <div className="grid shrink-0 grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="feedback-nickname" className={FIELD_LABEL}>
                暱稱
              </label>
              <input
                id="feedback-nickname"
                name="nickname"
                type="text"
                defaultValue=""
                placeholder="例：小明"
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="feedback-favorite" className={FIELD_LABEL}>
                最喜歡的功能
              </label>
              <select
                id="feedback-favorite"
                name="favorite"
                defaultValue=""
                onKeyDown={keepNavKeys}
                className={FIELD}
              >
                <option value="" disabled>
                  請選擇
                </option>
                {VOTE_TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="mt-5 shrink-0" onKeyDown={keepNavKeys}>
            <legend className={FIELD_LABEL}>
              評分
              <span className="ml-3 text-[18px] font-normal text-muted">1 普通 · 5 很喜歡</span>
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  htmlFor={`feedback-rating-${value}`}
                  className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-line bg-panel text-[22px] text-paper transition-colors duration-200 hover:border-muted has-checked:border-acid has-checked:bg-acid/14 has-checked:font-semibold"
                >
                  <input
                    id={`feedback-rating-${value}`}
                    type="radio"
                    name="rating"
                    value={String(value)}
                    className="size-5 accent-acid"
                  />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor="feedback-message" className={`mt-5 shrink-0 ${FIELD_LABEL}`}>
            想對講師說的話
          </label>
          <textarea
            id="feedback-message"
            name="message"
            rows={2}
            defaultValue=""
            placeholder="例：今天最想回去試的是……"
            className={`${FIELD} mt-2 h-[92px] shrink-0 resize-none py-3 leading-normal`}
          />

          <div className="mt-5 flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-14 rounded-xl border border-acid bg-acid px-10 text-[22px] font-medium text-on-accent transition-[filter] duration-200 hover:brightness-110"
            >
              送出
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-14 rounded-xl border border-line bg-panel px-7 text-[21px] text-paper transition-colors duration-200 hover:border-muted"
            >
              清除
            </button>
          </div>

          <div
            aria-live="polite"
            className={`mt-auto flex h-[132px] shrink-0 flex-col justify-center rounded-xl border px-6 ${
              submitted
                ? 'border-teal border-l-[6px] border-l-teal bg-teal/14'
                : 'border-dashed border-line bg-ink-soft'
            }`}
          >
            {submitted ? (
              <>
                <p className="text-[20px] font-semibold text-teal">
                  已送出（示意，不會傳到任何地方）
                </p>
                <p className="mt-1 truncate text-[19px] text-paper">
                  {submitted.nickname || '（未填暱稱）'}
                  <span className="mx-2 text-faint">·</span>
                  {favoriteLabel || '（未選功能）'}
                  <span className="mx-2 text-faint">·</span>
                  {submitted.rating ? `${submitted.rating} 分` : '（未評分）'}
                </p>
                {/* 留言最多兩行：提示詞給的那句（約 50 字）剛好兩行放得下 */}
                <p className="line-clamp-2 text-[19px] leading-snug text-muted">
                  {submitted.message ? `「${submitted.message}」` : '（沒有留言）'}
                </p>
              </>
            ) : (
              <p className="text-[19px] text-muted">
                還沒送出。按「送出」後，剛填的內容只會顯示在這裡。
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
