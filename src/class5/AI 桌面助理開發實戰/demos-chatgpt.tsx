import { Fragment, useEffect, useState } from 'react';
import dotShotUrl from './images/chatgpt-dot.png';
import gifRobotNotesUrl from './images/gif-robot-notes.gif';
import gifAssistantNotifyUrl from './images/gif-assistant-notify.gif';
import gifGridButtonsUrl from './images/gif-grid-buttons.gif';
import rrPluginUrl from './images/record-replay-plugin.webp';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：ChatGPT
 *
 *   第 24 頁  DotDemo           Dot：能做什麼（四點）／跟一般對話的差別／適用方案，右欄截圖
 *   第 25 頁  ImageGenDemo      圖片生成：在 ChatGPT App 裡 vs 從 Codex CLI 呼叫
 *   第 26 頁  GifDemo           GIF 生成：講師做的三張 GIF ＋ 可複製的提示詞範例
 *   第 27 頁  RecordReplayDemo  Record & Replay：安裝外掛 → 一句話開始錄 → 可以做什麼 ＋ 講師實例
 *   第 28 頁  SitesDemo         Sites：是什麼／四個注意事項 ＋ 連到〈從 0 到 1 的網站開發〉
 *
 * 五頁都被 withVote 包起來，根容器一律 h-[640px] w-full max-w-[1740px]。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * Notion「課綱 › ChatGPT vs Claude」ChatGPT 獨特的能力的五個 callout，
 * 加上講師的 CODD 筆記「簡報調整」（note-xcra，2026-11-10）：
 * - Dot：筆記要求「額外列點說明」四件事（直接對話也能用語音、排程在整個底層／系統裡、
 *   串接服務並主動讀取與提醒、雲端＋本機混合操作電腦與獨立的虛擬主機），並「列出相對應的方案」。
 *   四點照講師的話寫在能力卡上，官方文件對得上的那一句用小字放在卡片下方。
 *   Notion 原本的說明（一般對話是輸入留言才回覆、Dot 依事件自己觸發而且基本上完全自動、
 *   「很厲害也最可怕」、外部開會時它直接傳來相關資訊）保留在
 *   「跟一般對話的差別」分頁、心得卡與右欄截圖說明。截圖 images/chatgpt-dot.png 是講師提供的。
 * - 圖片生成：講師原句整段放在左上的引言卡。
 * - GIF：callout 要「用 ChatGPT 生成一些 GIF 加進來」，筆記補上了三張 GIF
 *   （images/gif-robot-notes.gif、gif-assistant-notify.gif、gif-grid-buttons.gif，
 *   原檔在講師本機的「第五堂」資料夾）。「這幾天新增的功能」照原話放在左下。
 * - Record & Replay：筆記的三件事 —— 要先安裝外掛、用
 *   「@Record & Replay Record my workflow and turn it into a reusable skill」開始製作、
 *   可以做什麼（上傳 YouTube 影片、玩你的遊戲、網站檢查與測試）。
 *   截圖 images/record-replay-plugin.webp 是講師提供的（外掛程式 › Record & Replay）；
 *   「最多 30 分鐘、可以隨時停止或取消、避開敏感的流程」取自截圖裡的官方說明。
 *   講師實例取自講師本機的 Skill：第五堂/ChatGPT/mabinogi-town-travel/SKILL.md 與
 *   recordings/2026-11-10/run-summary.md（瑪奇 Mobile，杜巴頓 → 提爾克納 → 學校）。
 *   現場影片「第五堂/Computer Use 玩遊戲.mp4」不進 repo，畫面上只在「玩你的遊戲」旁標記。
 * - Sites：callout 要參考先前的簡報濃縮成 1～2 頁，網址講師後續補上。
 *   程式碼改寫自〈從 0 到 1 的網站開發〉的 SiteArchDemo（demos-web.tsx，第 25 頁）
 *   與 SiteCautionsDemo（demos-site.tsx，第 26 頁），沒有 import。
 *   講師 2026-11-17 補上連結 `/#/website-0-to-1`（同站的〈從 0 到 1 的網站開發〉），在 SITE_LINK_PATH。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證來源（查核日 2026-11-10；Dot 於 2026-11-17 重新查核）
 * ──────────────────────────────────────────────────────────────
 * - Dot
 *   learn.chatgpt.com/docs/dots（Meet dots）
 *     適用方案：Pro 100／Pro 200／Pro 500 —— 18 歲以上，不含歐洲經濟區、英國、瑞士；
 *     Business Premium —— 支援的地區、看工作區資格；兩者都是逐步開放。
 *     Enterprise、Edu、Healthcare —— 符合資格的工作區；預覽期由管理員對角色開啟，
 *     2026-11-18 起預設開啟、工作區可以退出；資料或推論駐留在阿聯的工作區不適用（畫面沒放）。
 *     用量：Pro 與 Business Premium 跟 dot 的對話不算進 ChatGPT 用量，
 *     它開出去的 Work／Codex 任務照各自的額度算。
 *   2026-11-17 重新查核（講師要求「再確認一下用量」）：
 *     適用方案沒變；chatgpt.com/pricing 的比較表 Dots 一列 Free、Go、Plus 都是 No，只有 Pro 是 Yes。
 *     那張表只涵蓋 Free／Go／Plus／Pro，一般 Business 不在上面（chatgpt.com/business 的席次卡沒提 dots）
 *     → 「沒列到」那一列寫「前三個在定價頁標『No』；四個都不在適用方案裡」，不把「定價頁不含」套到 Business。
 *     「適用方案」分頁的查核日跟著改成 2026-11-17（Enterprise 那一列與底部的深度工作額度是這天補的）。
 *     用量原文仍然成立（learn.chatgpt.com/docs/dots），另外補一句官方原文
 *     「an allowance for deeper work, with extended limits for the first month after launch」
 *     → 畫面寫「另有一份深度工作額度」，不寫「首月加碼」（各帳號的起算日官方沒說清楚）。
 *     learn.chatgpt.com/docs/pricing：「ChatGPT Work and Codex share usage.」→ 委派出去的任務扣的是同一份額度。
 *     Enterprise、Edu、Healthcare：learn.chatgpt.com/codex/enterprise/dots-admin-guide
 *     〈Enterprise preview and billing〉預覽期免費，2026-11-18 起已啟用的 dot 開始計費
 *     （固定費率或依用量；委派給 Work／Codex 的任務照標準費率另計）。預設開啟只寫在這一條。
 *     只有搜尋摘要、沒有寫上畫面的：help.openai.com/en/articles/20001625 預告 12 月起
 *     Plus、Pro、Business 的 ChatGPT 與 Codex 改成同一份額度。到時候「跟 dot 對話不算用量」會不會變，官方沒說。
 *     其他：可以傳訊息或打電話給它；自己的雲端電腦與瀏覽器，你的裝置關機也能繼續。
 *   learn.chatgpt.com/docs/dots/tasks-and-memory（指定時間或支援的事件觸發、
 *     重複的工作要存成排程，在 Scheduled 檢視，也能請它列出、修改、取消；主動研究只讀）
 *   learn.chatgpt.com/docs/dots/computers-and-apps（本機要在桌面版另外允許，電腦要在線、
 *     ChatGPT App 要開著；用已安裝並啟用的外掛，例如 Gmail、Google Drive、GitHub）
 *   learn.chatgpt.com/docs/dots/controls（Pause／Resume、自訂規則、主動研究只讀）
 *   help.openai.com/en/articles/20001530（Getting started with your dot；
 *     本機存取預設關閉。這頁 WebFetch 回 403，內容取自搜尋摘要）
 *   官方適用方案沒有列 Plus、Go、Free 與一般 Business。
 *   四個能力各自有沒有方案差異，上面幾頁都沒寫 → 畫面標「待確認」。
 * - 圖片生成
 *   learn.chatgpt.com/docs/image-generation（Codex 的 $imagegen、CLI 用 -i 附參考圖、
 *     算進 Codex 用量、平均快 3–5 倍）
 *   help.openai.com/en/articles/6825453（ChatGPT release notes：2026-11-04 Images 2.6）
 *   本機 Codex CLI 0.160.0：`codex features list` 的 image_generation 是 stable／true；
 *   Codex 內建的 imagegen skill 寫明內建 image_gen 不需要 OPENAI_API_KEY。
 *   講師的 ~/.claude/skills/codex-image 只取「從 Claude 用 codex exec 叫 Codex 生圖、
 *   要給 -s workspace-write、圖先落在 ~/.codex/generated_images」這個概念。
 * - GIF
 *   help.openai.com/en/articles/11084440（Images in ChatGPT：描述要循環的 GIF 與要動的
 *     部分、可上傳靜態圖、在對話裡修改、可調速度／儲存／分享、不能編輯上傳的動態 GIF、
 *     陸續開放中）
 *   help.openai.com/en/articles/6825453（release notes，2026-11-04）
 * - Record & Replay
 *   learn.chatgpt.com/docs/extend/record-and-replay（macOS、要先有 Computer Use、
 *     錄完整理成 Skill 草稿、開新對話換一組輸入重播）
 * - Sites
 *   learn.chatgpt.com/docs/sites（方案、D1 每站 10 GB、R2 無固定上限、主機到
 *     2026-12-31 免費、2027-01-01 起超過額度計費（擬議）、自訂網域另計）
 *   help.openai.com/en/articles/20001339（新網站預設私人、每個部署網址都是正式環境、
 *     刪除要輸入代稱、無法還原、縮小分享範圍可以暫時下架）
 *   其餘（三種分享範圍的說法、可以跑伺服器端程式、網址格式、條款沒有備份與
 *   穩定性保證）沿用〈從 0 到 1 的網站開發〉2026-09-18 的查證。
 *
 * 補的示意（不是官方畫面）：
 * - 第 24 頁「跟一般對話的差別」的流程圖（三格一般對話、四種觸發 → Dot → 主動找你）
 *   是照官方說明畫的；能力卡的標題是把講師的話濃縮成一句。
 * - 第 25 頁的指令與兩段提示詞（機器人在兩台筆電之間傳紙條）是示意。
 * - 第 26 頁三段提示詞是範例（畫面標「提示詞範例」），套了官方的寫法（循環、說清楚哪裡動）
 *   與 API 文件的建議（回到起始姿勢比較順）。講師的 GIF 不一定是用這三段做的，
 *   第二段已改成貼近那張 GIF 的畫面（機器人頭上的燈亮起來）。
 * - 第 27 頁的三步（做一次給它看 → 整理成 Skill → 換一組輸入再重播）是照官方文件整理的。
 * - 第 28 頁的網址是示意。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（一個畫面最多兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 24 頁  能做什麼：acid（能力卡）＋ coral（講師心得）
 *             差別：acid（Dot、觸發）；適用方案：acid（官方列出的方案）＋ warn（待確認）
 *   第 25 頁  acid（選取、ChatGPT App）＋ lime（Codex CLI、指令）
 *   第 26 頁  acid（新功能的小標）；GIF 畫框一律中性色
 *   第 27 頁  acid（開始錄、可以做什麼）＋ teal（講師實例）；現場影片標記是中性的深色框
 *   第 28 頁  teal（Sites 提供的）或 coral（注意事項）＋ blue（課程連結卡）
 *   選中的切換鈕、「已複製」一律用中性的深色色塊（bg-paper ＋ text-on-accent），不佔額度。
 *   淡底（/14）一律配 6px 不透明左粗條或實色框，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，扣掉投票列後根容器 640）
 * ──────────────────────────────────────────────────────────────
 *   第 24 頁  grid [1fr 470px] gap 28 → 左欄 1242
 *     左欄  分頁列 56 ＋ 14 ＋ 內容 570
 *           能做什麼  2 × 2 能力卡各 212（py 32 ＋ 標題 36 ＋ 8 ＋ 2–3 行 × 29 ＋ 官方 24 ≤ 187）
 *                     ＋ 14 ＋ 心得 118（標題 22 ＋ 6 ＋ 30 ＋ 28）
 *           差別      標籤 30 ＋ 8 ＋ 一般對話 150 ＋ 20 ＋ 標籤 30 ＋ 8 ＋ Dot 流程框 296 ＝ 542
 *                     流程框 p-5 ＋ 邊框 → 內高 254：觸發卡 4 × 54 ＋ gap 3 × 12 ＝ 252
 *                     寬：觸發卡 490 ＋ 匯流線 64 ＋ Dot 250 ＋ 箭頭 80 ＋ 結果 206 ＝ 1090（內寬 1200）
 *           適用方案  3 列 × 88 ＋ 沒列到的 72 ＋ gap 3 × 10 ＝ 366 ＋ 10 ＋ 待確認框 194
 *     右欄  截圖框 p-4：圖寬 436（原圖 1600 × 1502，contain 後 436 × 409）＋ 說明兩行 56
 *   第 25 頁  grid [520px 1fr] gap 24
 *     左欄  引言卡 ≈ 標題 22 ＋ 10 ＋ 5 行 × 33 ＋ py 40 ≈ 245，兩個選項 flex-1 各 ≈ 183
 *     右欄  px-9 py-8 → 內高 576
 *           App：標頭 106 ＋ 24 ＋ 三步 150 ＋ 24 ＋ 提示詞框 164 ＋ 20 ＋ 註 28 ≈ 516
 *           CLI：標頭 72 ＋ 16 ＋ 流程 104 ＋ 16 ＋ 指令 122 ＋ 10 ＋ 三條註 84 ＋ 16
 *                ＋ 提示詞框（兩行）122 ≈ 562
 *   第 26 頁  三張卡 466（GIF 畫框 flex-1 ≈ 284 ＋ 12 ＋ 提示詞框 py 32 ＋ 44 ＋ 10 ＋ 3 行 × 28 ≈ 170）
 *             ＋ 16 ＋ 說明列 158（標題 22 ＋ 8 ＋ 2–3 行 × 28 ＋ py 32 ≤ 146）
 *             GIF 原圖 506 × 337、414 × 414，object-contain 後都比原圖小，不會放大
 *   第 27 頁  grid [470px 1fr] gap 24 → 右側 1246
 *     左欄  截圖框 p-4：標題 32 ＋ 12 ＋ 圖 flex-1 ≈ 496（原圖 1332 × 1352，contain 後 436 × 443）
 *           ＋ 12 ＋ 說明兩行 56
 *     右側  開始錄 ≈ 254（py 40 ＋ 標題 32 ＋ 12 ＋ 提示詞 56 ＋ 12 ＋ 複製列 44 ＋ 12 ＋ 三步 44）
 *           ＋ 16 ＋ 下排 370：可以做什麼 340（py 40 ＋ 標題 32 ＋ 16 ＋ 3 × 76 ＋ 2 × 12）、
 *           講師實例 ≤ 340（py 40 ＋ 32 ＋ 12 ＋ 60 ＋ 12 ＋ 48 ＋ 12 ＋ 56 ＋ 28）
 *   第 28 頁  切換列 56 ＋ 16 ＋ 主區 452 ＋ 16 ＋ 下排 100 ＝ 640
 *     是什麼      主框 p-8 → 內高 388：表頭 32 ＋ 10 ＋ 4 列 × 76 ＋ gap 3 × 10 ＝ 376；
 *                 狀態卡 p-6：標題 24 ＋ 14 ＋ 7 行 × 30 ＋ gap 4 × 10 ≈ 288 ＋ 48 ＝ 336
 *     注意事項    左側四個直式頁籤各 ≈ 105；右框 py-6 → 標題 40 ＋ 8 ＋ 說明 30–60
 *                 ＋ 20 ＋ 圖 ≤ 200 ＋ 12 ＋ 出處 24 ≤ 404
 *   沒有任何容器會捲動；切換只換內容、不改高度；未輪到的內容一律不掛。
 *
 * 浮水印在對外版的右上角（舞台座標 x 1692–1872、y 104–147，實際落在面板的
 * padding 上）。保守起見，每頁 demo 右上 260 × 120 都不放文字：第 24 頁那一角是截圖
 * 的上緣，第 25 頁是右框的空白，第 26 頁是第三張 GIF 畫框的上緣（GIF 置中，兩側留白），
 * 第 27 頁的提示詞框是 w-fit，右邊留 270 以上的空白，第 28 頁是切換列右側的空白。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

interface SegOption<T extends string> {
  id: T;
  text: string;
}

/** 頂部的分段切換。選中的是中性的深色色塊，不佔強調色 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly SegOption<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex h-14 w-fit shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-ink-soft p-1.5"
    >
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(option.id)}
            className={`h-full rounded-xl px-6 text-[21px] transition-colors duration-200 ${
              on
                ? 'bg-paper font-medium text-on-accent'
                : 'text-muted hover:bg-panel hover:text-paper'
            }`}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}

function ArrowRight({
  width = 56,
  className = '',
}: {
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={20}
      viewBox={`0 0 ${width} 20`}
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <line
        x1={2}
        y1={10}
        x2={width - 6}
        y2={10}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${width - 13} 3 L${width - 3} 10 L${width - 13} 17`}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyGlyph({ done }: { done: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {done ? (
        <path
          d="M3 9.5 L7.2 13.5 L15 4.5"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <rect x={5.5} y={5.5} width={10} height={10} rx={2} stroke="currentColor" strokeWidth={1.8} />
          <path
            d="M12 3.5 V3 a1.5 1.5 0 0 0 -1.5 -1.5 H4 A2 2 0 0 0 2 3.5 V10 a1.5 1.5 0 0 0 1.5 1.5"
            stroke="currentColor"
            strokeWidth={1.8}
          />
        </>
      )}
    </svg>
  );
}

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_SKIN: Record<CopyState, string> = {
  idle: 'border-line bg-panel text-paper hover:border-faint',
  copied: 'border-paper bg-paper text-on-accent',
  failed: 'border-error bg-panel text-error',
};

/** 複製按鈕：寬度固定，換字不會推動版面；1.8 秒後回到原本的字 */
function CopyButton({
  text,
  idleLabel = '複製提示詞',
}: {
  text: string;
  idleLabel?: string;
}) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  const label =
    state === 'copied' ? '已複製' : state === 'failed' ? '無法複製' : idleLabel;

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={`flex h-11 w-[168px] shrink-0 items-center justify-center gap-2 rounded-xl border text-[19px] font-medium transition-colors duration-200 ${COPY_SKIN[state]}`}
    >
      <CopyGlyph done={state === 'copied'} />
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 24 頁 · DotDemo
 *
 * 左上三個分頁，右欄固定是講師的截圖：
 *   能做什麼          四張能力卡（講師的說明，小字是官方文件對得上的那一句）＋ 講師心得
 *   跟一般對話的差別  上：一般對話（你輸入留言 → 回覆 → 停下來等你）
 *                     下：Dot（四種觸發 → 自己的雲端電腦 → 主動找你）
 *   適用方案          官方列出的三組方案與條件、沒列到的方案、各能力的方案差異（待確認）
 * 一進頁面停在「能做什麼」（講師筆記要求列點說明的四件事）。
 * ══════════════════════════════════════════════════════════════ */

type DotTab = 'can' | 'vs' | 'plans';

const DOT_TABS: readonly SegOption<DotTab>[] = [
  { id: 'can', text: '能做什麼' },
  { id: 'vs', text: '跟一般對話的差別' },
  { id: 'plans', text: '適用方案' },
];

/** 分頁列右邊的一行小字：這個分頁的內容出自哪裡 */
const DOT_TAB_NOTE: Record<DotTab, string> = {
  can: '卡斯伯的說明；小字是官方文件的對照（2026-11-10）',
  vs: '先看一般對話，再看 Dot 怎麼自己動起來',
  plans: '官方文件 · 2026-11-17 查核',
};

/** 講師筆記（note-xcra）的四點；official 是官方文件裡對得上的那一句 */
const DOT_ABILITIES: readonly { no: string; title: string; desc: string; official: string }[] = [
  {
    no: '1',
    title: '直接對話，也能用語音',
    desc: '像一般的 ChatGPT 一樣，直接跟它對話；要改用語音模式也沒有問題。',
    official: '官方：可以傳訊息給它，也可以直接打電話給它',
  },
  {
    no: '2',
    title: '排程掛在整個系統底層',
    desc: '可以設定排程，而且排程不是存在單一 session，而是在整個底層／系統裡。',
    official: '官方：排程集中在「Scheduled」，也能請它列出、修改、取消',
  },
  {
    no: '3',
    title: '串接服務，還會主動提醒',
    desc: '串接你的各項服務並主動讀取：Notion 上的資訊更新了、開會用的 Google 試算表又改了，它都會主動提醒你。',
    official: '官方：用你已安裝、啟用的外掛，例如 Gmail、Google Drive',
  },
  {
    no: '4',
    title: '操作電腦：雲端＋本機',
    desc: '混合式，雲端和本機都能控制。它還有一台自己的虛擬主機，任務可以直接交給它，不在你的電腦上跑，做完把成品交給你。',
    official: '官方：自己的雲端電腦；本機要在桌面版另外允許',
  },
];

/** 一般對話與 Dot 各一句，講師原話 */
const DOT_QUOTES = {
  chat: '你有任何需求，在對話框輸入留言之後，它會回覆你。',
  dot: '可以依據事件自己觸發，基本上是完全自動。',
} as const;

const CHAT_FLOW: readonly { step: string; who: string; what: string; idle?: boolean }[] = [
  { step: '01', who: '你', what: '有需求，在對話框輸入留言' },
  { step: '02', who: 'ChatGPT', what: '收到之後回覆你' },
  { step: '03', who: '然後', what: '停下來，等你下一則留言', idle: true },
];

/** 四種觸發，照 learn.chatgpt.com/docs/dots 與 tasks-and-memory */
const DOT_TRIGGERS: readonly { name: string; desc: string }[] = [
  { name: '你傳訊息', desc: 'ChatGPT、語音通話、Slack、Teams' },
  { name: '指定時間', desc: '提醒、定期檢查（存成排程）' },
  { name: '指定事件', desc: '服務要支援，例如 Slack 的新 bug 回報' },
  { name: '主動研究', desc: '不用設定，在對話之間讀它有權限的資料' },
];

/** learn.chatgpt.com/docs/dots 的 Eligible plans（2026-11-17 重新查核） */
const DOT_PLANS: readonly { plan: string; terms: string }[] = [
  {
    plan: 'Pro 100／200／500',
    terms: '18 歲以上，不含歐洲經濟區、英國、瑞士；逐步開放中。',
  },
  {
    plan: 'Business Premium',
    terms: '在支援的地區，而且工作區符合資格；逐步開放中。',
  },
  {
    plan: 'Enterprise、Edu、Healthcare',
    terms: '預覽期免費、由管理員開啟；2026-11-18 起預設開啟並開始計費，工作區可以退出。',
  },
];

/** 四張觸發卡的中心（54 高、gap 12）匯流到 Dot 的中線 126 */
function ConvergeLines() {
  const centers = [27, 93, 159, 225];
  return (
    <svg
      width={64}
      height={252}
      viewBox="0 0 64 252"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {centers.map((y) => (
        <path
          key={y}
          d={`M0 ${y} C 36 ${y}, 28 126, 64 126`}
          stroke="var(--color-acid)"
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
}

function ChatFlow() {
  return (
    <div className="flex h-full items-center justify-center gap-4">
      {CHAT_FLOW.map((node, index) => (
        <Fragment key={node.step}>
          {index > 0 && <ArrowRight className="text-faint" />}
          <div
            className={`flex h-[118px] w-[300px] shrink-0 flex-col justify-center gap-1 rounded-2xl border-2 bg-panel px-7 ${
              node.idle ? 'border-dashed border-line' : 'border-line'
            }`}
          >
            <span className={LABEL_FAINT}>{node.step}</span>
            <span className="text-[26px] leading-tight font-semibold text-paper">
              {node.who}
            </span>
            <span className="text-[20px] leading-snug text-muted">{node.what}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function DotFlow() {
  return (
    <div className="flex h-full items-center">
      <ul className="flex w-[490px] shrink-0 flex-col gap-3">
        {DOT_TRIGGERS.map((trigger) => (
          <li
            key={trigger.name}
            className="flex h-[54px] items-center gap-4 rounded-xl border border-line border-l-[6px] border-l-acid bg-panel px-4"
          >
            <span className="w-[92px] shrink-0 text-[21px] font-semibold text-paper">
              {trigger.name}
            </span>
            <span className="min-w-0 text-[18px] whitespace-nowrap text-muted">
              {trigger.desc}
            </span>
          </li>
        ))}
      </ul>

      <ConvergeLines />

      <div className="flex h-full w-[250px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-acid bg-panel px-4 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-acid">
          <span className="size-5 rounded-full bg-on-accent" />
        </span>
        <span className="mt-1 text-[30px] leading-tight font-semibold text-paper">Dot</span>
        <span className="text-[19px] leading-snug text-paper">自己的雲端電腦與瀏覽器</span>
        <span className="text-[17px] text-faint">你的電腦關機也能繼續</span>
      </div>

      <ArrowRight className="mx-3 text-acid" />

      <div className="flex h-[180px] w-[206px] shrink-0 flex-col justify-center gap-2 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-5">
        <span className={LABEL_FAINT}>然後</span>
        <span className="text-[26px] leading-tight font-semibold text-paper">主動找你</span>
        <span className="text-[19px] leading-snug text-muted">帶著建議、問題或整理好的資訊</span>
      </div>
    </div>
  );
}

function DotAbilities() {
  return (
    <div className="flex h-full flex-col gap-3.5">
      <ul className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3.5">
        {DOT_ABILITIES.map((item) => (
          <li
            key={item.no}
            className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-5 py-4"
          >
            <div className="flex h-9 shrink-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-acid font-display text-[19px] font-semibold text-on-accent tabular-nums">
                {item.no}
              </span>
              <span className="min-w-0 text-[25px] leading-tight font-semibold text-paper">
                {item.title}
              </span>
            </div>
            <p className="mt-2 text-[20px] leading-[29px] text-paper">{item.desc}</p>
            <p className="mt-auto pt-2 text-[17px] leading-[24px] text-muted">{item.official}</p>
          </li>
        ))}
      </ul>

      {/* 講師心得：厲害也可怕 */}
      <div className="flex h-[118px] shrink-0 flex-col justify-center rounded-2xl border border-line border-l-[6px] border-l-coral bg-panel px-6">
        <span className={`${LABEL_TYPE} text-coral`}>卡斯伯的心得</span>
        <p className="mt-1.5 text-[21px] leading-[30px] font-semibold text-paper">
          這是它很厲害的地方，但我認為這也是它最可怕的點。
        </p>
        <p className="text-[19px] leading-[28px] text-muted">
          官方的安全設計：主動研究只讀，不會傳訊息或改資料；可以設自訂規則，也能隨時 Pause。
        </p>
      </div>
    </div>
  );
}

function DotVersus() {
  return (
    <div className="flex h-full flex-col">
      <p className="flex h-[30px] shrink-0 items-baseline gap-4">
        <span className={LABEL_FAINT}>一般對話</span>
        <span className="text-[21px] text-paper">{DOT_QUOTES.chat}</span>
      </p>
      <div className="mt-2 h-[150px] shrink-0 rounded-2xl border border-line bg-panel-lift">
        <ChatFlow />
      </div>

      <p className="mt-5 flex h-[30px] shrink-0 items-baseline gap-4">
        <span className={`${LABEL_TYPE} text-acid`}>Dot</span>
        <span className="text-[21px] text-paper">{DOT_QUOTES.dot}</span>
      </p>
      <div className="mt-2 h-[296px] shrink-0 rounded-2xl border border-line bg-panel-lift p-5">
        <DotFlow />
      </div>
    </div>
  );
}

function DotPlans() {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <ul className="flex shrink-0 flex-col gap-2.5">
        {DOT_PLANS.map((row) => (
          <li
            key={row.plan}
            className="grid h-[88px] grid-cols-[400px_minmax(0,1fr)] items-center gap-6 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6"
          >
            <span className="text-[25px] leading-tight font-semibold text-paper">{row.plan}</span>
            <span className="text-[20px] leading-[28px] text-paper">{row.terms}</span>
          </li>
        ))}
        <li className="grid h-[72px] grid-cols-[400px_minmax(0,1fr)] items-center gap-6 rounded-2xl border-2 border-dashed border-line px-6">
          <span className="text-[22px] text-muted">Plus、Go、Free、一般 Business</span>
          <span className="text-[20px] text-muted">前三個在定價頁標「No」；四個都不在適用方案裡</span>
        </li>
      </ul>

      <div className="flex min-h-0 flex-1 flex-col justify-center rounded-2xl border border-line border-l-[6px] border-l-warn bg-panel px-6">
        <div className="flex items-center gap-3">
          <span className="text-[23px] font-semibold text-paper">四個能力各自有沒有方案差異？</span>
          <span className="rounded-md border-2 border-warn px-2.5 py-0.5 text-[17px] font-semibold text-warn">
            待確認
          </span>
        </div>
        <p className="mt-2 text-[20px] leading-[30px] text-paper">
          官方文件沒有寫。目前只看到用量的規則：Pro 與 Business Premium 跟 Dot
          的對話不算進 ChatGPT 用量，另有一份「深度工作」額度；它開出去的 Work／Codex 任務照常計入。
        </p>
      </div>
    </div>
  );
}

export function DotDemo() {
  const [tab, setTab] = useState<DotTab>('can');

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[minmax(0,1fr)_470px] gap-7">
      {/* ── 左欄：三個分頁 ─────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-3.5">
        <div className="flex h-14 shrink-0 items-center gap-6">
          <Segmented label="Dot 的說明" options={DOT_TABS} value={tab} onChange={setTab} />
          <p key={tab} className="slide-enter min-w-0 truncate text-[19px] text-muted">
            {DOT_TAB_NOTE[tab]}
          </p>
        </div>

        <div key={tab} className="slide-enter min-h-0 flex-1">
          {tab === 'can' ? <DotAbilities /> : tab === 'vs' ? <DotVersus /> : <DotPlans />}
        </div>
      </div>

      {/* ── 右欄：講師的截圖 ─────────────────────────────── */}
      <figure className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-line bg-panel p-4">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-line-soft bg-panel">
          <img
            src={dotShotUrl}
            alt="Dot 主動傳來的四則訊息：提醒隔天會議新增的確認事項、新計畫上線當天要先確認的事、典禮主持稿與機制頁的日期還沒對齊、新主持稿有兩處沒跟上最新決策"
            className="absolute inset-0 size-full object-contain"
          />
        </div>
        <figcaption className="shrink-0 text-[19px] leading-[28px] text-muted">
          <span className="font-medium text-paper">卡斯伯的截圖：</span>
          最近在外部開會時，Dot 會直接傳來跟會議有關的資訊。
        </figcaption>
      </figure>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 25 頁 · ImageGenDemo
 *
 * 左：講師原話（引言卡）＋ 兩個選項。右：選到的那一條路。
 *   在 ChatGPT App 裡  三步（描述 → 出圖 → 用說的修改）＋ 可複製的提示詞
 *   從 Codex CLI 呼叫  任何 AI 工具 → 終端機 → Codex → 圖片檔，一段示意指令，
 *                      ＋ 可複製的「給 Claude Code 的提示詞」
 * 一進頁面停在 App；用色 acid（App、選取）＋ lime（CLI、指令）。
 * ══════════════════════════════════════════════════════════════ */

type GenMode = 'app' | 'cli';

const GEN_OPTIONS: readonly { id: GenMode; no: string; title: string; desc: string }[] = [
  {
    id: 'app',
    no: '01',
    title: '在 ChatGPT App 裡',
    desc: '描述畫面、上傳參考圖，在對話裡直接修改',
  },
  {
    id: 'cli',
    no: '02',
    title: '從 Codex CLI 呼叫',
    desc: '任何 AI 工具，都能透過終端機請 Codex 生圖',
  },
];

const APP_STEPS: readonly { no: string; title: string; desc: string }[] = [
  { no: '01', title: '描述畫面', desc: '主題、風格、比例，還有不要出現什麼' },
  { no: '02', title: '直接出圖', desc: '圖片出現在對話裡，可以下載' },
  { no: '03', title: '用說的修改', desc: '說要改哪裡；也能上傳照片、草圖當參考' },
];

const APP_PROMPT =
  '幫我畫一張 16:9 的扁平插畫：一個小機器人坐在書桌前，同時用兩台筆電工作。背景米白、色彩柔和，畫面裡不要有文字。';

const CLI_FLOW: readonly { title: string; desc: string }[] = [
  { title: '任何 AI 工具', desc: 'Claude Code、其他 Agent' },
  { title: '終端機', desc: '執行 codex exec' },
  { title: 'Codex', desc: '內建 image_gen，ChatGPT 帳號登入即可' },
  { title: '圖片檔', desc: '先存在 ~/.codex，再複製進專案' },
];

const CLAUDE_PROMPT =
  '請用 codex exec 呼叫 Codex 的 $imagegen 產生一張圖：機器人在兩台筆電之間傳紙條，扁平插畫、米白背景、不要文字。完成後把圖片複製到 ./images/robot.png。';

function AppDetail() {
  return (
    <div className="flex h-full flex-col">
      <span className={`${LABEL_TYPE} text-acid`}>在 ChatGPT App 裡</span>
      <h3 className="mt-1.5 text-[30px] leading-[40px] font-semibold text-paper">
        用說的，就能生圖、改圖
      </h3>
      <p className="mt-1.5 text-[20px] leading-[30px] text-muted">
        網頁、桌面 App、手機都能用；能生多少張，依方案而定。
      </p>

      <div className="mt-6 grid h-[150px] shrink-0 grid-cols-3 gap-5">
        {APP_STEPS.map((step) => (
          <div
            key={step.no}
            className="flex flex-col justify-center gap-1.5 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel-lift px-6"
          >
            <span className="font-display text-[26px] leading-none font-semibold text-acid tabular-nums">
              {step.no}
            </span>
            <span className="text-[24px] leading-tight font-semibold text-paper">{step.title}</span>
            <span className="text-[19px] leading-snug break-keep text-muted">{step.desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col rounded-2xl bg-ink-soft px-6 py-5">
        <div className="flex h-11 items-center justify-between">
          <span className={LABEL_FAINT}>試試看</span>
          <CopyButton text={APP_PROMPT} />
        </div>
        <p className="mt-3 text-[22px] leading-[34px] text-paper">{APP_PROMPT}</p>
      </div>

      <p className="mt-5 text-[19px] leading-[28px] text-faint">
        2026-11-04 起升級為 Images 2.6，也能做 GIF（下一頁）。
      </p>
    </div>
  );
}

function CliDetail() {
  return (
    <div className="flex h-full flex-col">
      <span className={`${LABEL_TYPE} text-lime`}>從 Codex CLI 呼叫</span>
      <h3 className="mt-1.5 text-[30px] leading-[40px] font-semibold text-paper">
        任何 AI 工具，都能呼叫 Codex 生圖
      </h3>

      <div className="mt-4 flex h-[104px] shrink-0 items-stretch">
        {CLI_FLOW.map((node, index) => (
          <Fragment key={node.title}>
            {index > 0 && (
              <span className="flex w-12 shrink-0 items-center justify-center text-lime">
                <ArrowRight width={36} />
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-xl border border-line border-l-[6px] border-l-lime bg-panel-lift px-4">
              <span className="text-[22px] leading-tight font-semibold text-paper">{node.title}</span>
              <span className="text-[17px] leading-snug text-muted">{node.desc}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-ink-soft px-6 py-4 font-mono text-[19px] leading-[30px] whitespace-pre">
        <div>
          <span className="text-faint">$ </span>
          <span className="text-lime">codex exec</span>
          <span className="text-muted">{' -s workspace-write \\'}</span>
        </div>
        <div className="text-paper">{"    '$imagegen 畫一張扁平插畫：機器人在兩台筆電之間傳紙條，"}</div>
        <div className="text-paper">{"     米白背景、不要文字。完成後把圖片複製到 ./images/robot.png'"}</div>
      </div>

      <ul className="mt-2.5 flex flex-col text-[18px] leading-[28px] text-muted">
        <li>
          ・<code className="font-mono text-paper">-s workspace-write</code>
          ：讓 Codex 能把圖寫進專案，預設是唯讀
        </li>
        <li>
          ・<code className="font-mono text-paper">$imagegen</code>
          要用單引號包住，雙引號會被 shell 當成變數
        </li>
        <li>・生圖會算進 Codex 的用量，平均比一般回合快 3–5 倍用完</li>
      </ul>

      <div className="mt-4 flex items-center gap-6 rounded-2xl border border-line px-6 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={LABEL_FAINT}>給 Claude Code 的提示詞</span>
          <p className="text-[19px] leading-[28px] text-paper">{CLAUDE_PROMPT}</p>
        </div>
        <CopyButton text={CLAUDE_PROMPT} />
      </div>
    </div>
  );
}

export function ImageGenDemo() {
  const [mode, setMode] = useState<GenMode>('app');

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[520px_1fr] gap-6">
      {/* ── 左欄：講師原話 ＋ 兩條路 ─────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <blockquote className="shrink-0 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-5">
          <span className={`${LABEL_TYPE} text-acid`}>卡斯伯</span>
          <p className="mt-2.5 text-[22px] leading-[33px] text-paper">
            這相信是大家非常常使用的功能，因為目前其他家的圖片生成都沒有像 ChatGPT 那麼強大。
            更棒的是在 ChatGPT 的 Codex CLI 也可以使用，所以任何的 AI 工具其實都可以呼叫 Codex
            來生成圖片。
          </p>
        </blockquote>

        <div role="tablist" aria-label="生圖的兩條路" className="flex min-h-0 flex-1 flex-col gap-3">
          {GEN_OPTIONS.map((option) => {
            const on = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setMode(option.id)}
                className={`flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
                  on
                    ? 'border-acid border-l-acid bg-acid/14'
                    : 'border-line border-l-line bg-panel hover:bg-panel-lift'
                }`}
              >
                <span className="flex items-baseline gap-4">
                  <span
                    className={`font-display text-[30px] leading-none font-semibold tabular-nums ${
                      on ? 'text-acid' : 'text-faint'
                    }`}
                  >
                    {option.no}
                  </span>
                  <span className="text-[28px] leading-tight font-semibold text-paper">
                    {option.title}
                  </span>
                </span>
                <span className={`text-[20px] leading-[30px] ${on ? 'text-paper' : 'text-muted'}`}>
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 右欄：選到的那一條路 ─────────────────────────── */}
      <section
        key={mode}
        className="slide-enter flex min-h-0 min-w-0 flex-col rounded-2xl border border-line bg-panel px-9 py-8"
      >
        {mode === 'app' ? <AppDetail /> : <CliDetail />}
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 26 頁 · GifDemo
 *
 * 上：講師用 ChatGPT 做的三張 GIF ＋ 每張一段可複製的提示詞範例。
 * 下：這個新功能的官方說明（怎麼做／做完之後／限制）。
 * 畫框是 object-contain：GIF 原圖 506 × 337、414 × 414，放進畫框後都比原圖小，不會放大。
 * ══════════════════════════════════════════════════════════════ */

interface GifSlot {
  no: string;
  title: string;
  /** 提示詞範例（示意，不一定是講師實際用的那一段） */
  prompt: string;
  src: string;
  alt: string;
}

const GIF_SLOTS: readonly GifSlot[] = [
  {
    no: '01',
    title: '傳紙條的機器人',
    prompt:
      '做一個循環播放的 GIF：一個圓圓的小機器人在兩台筆電之間來回傳紙條，紙條飛過去再飛回來，最後回到一開始的位置。扁平插畫、米白背景、不要文字。',
    src: gifRobotNotesUrl,
    alt: '循環動畫：小機器人站在兩台筆電中間，把紙條傳過去再接回來',
  },
  {
    no: '02',
    title: '亮燈通知的小助手',
    prompt:
      '做一個循環播放的 GIF：筆電旁的小機器人頭上的燈亮起來，螢幕跳出一則通知，再慢慢暗下去回到原狀。扁平插畫、米白背景、不要文字。',
    src: gifAssistantNotifyUrl,
    alt: '循環動畫：筆電旁的小機器人頭上的燈亮起來，螢幕跳出鈴鐺通知，再慢慢暗下去',
  },
  {
    no: '03',
    title: '錄下操作的游標',
    prompt:
      '做一個循環播放的 GIF：滑鼠游標在網頁上依序點了三個按鈕，角落的錄影圓點跟著一閃一閃，點完之後回到起點。扁平插畫、米白背景、不要文字。',
    src: gifGridButtonsUrl,
    alt: '循環動畫：游標依序點了視窗裡的三個按鈕，右上角的錄影圓點跟著亮起來',
  },
];

const GIF_FACTS: readonly { label: string; text: string }[] = [
  {
    label: '怎麼做',
    text: '描述一個「循環播放的 GIF」，講清楚哪裡要動；也可以上傳一張靜態圖，請它動起來。',
  },
  {
    label: '做完之後',
    text: '在對話裡說要改哪裡；打開 GIF 可以調整播放速度、儲存或分享。',
  },
  {
    label: '限制',
    text: '還在陸續開放，不一定每個帳號都有；你上傳的動態 GIF 不能拿來編輯。',
  },
];

export function GifDemo() {
  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-5">
        {GIF_SLOTS.map((slot) => (
          <div key={slot.no} className="flex min-h-0 min-w-0 flex-col gap-3">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-panel">
              <img
                src={slot.src}
                alt={slot.alt}
                className="absolute inset-0 size-full object-contain"
              />
            </div>
            <div className="flex h-[198px] shrink-0 flex-col rounded-2xl border border-line bg-panel px-5 py-4">
              <div className="flex h-11 shrink-0 items-center gap-3">
                <span className="font-display text-[22px] font-semibold text-faint tabular-nums">
                  {slot.no}
                </span>
                <span className="min-w-0 flex-1 truncate text-[21px] font-semibold text-paper">
                  {slot.title}
                </span>
                <CopyButton text={slot.prompt} />
              </div>
              <p className="mt-2.5 text-[19px] leading-[28px] text-muted">
                <span className="mr-2 text-[17px] text-faint">提示詞範例</span>
                {slot.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid h-[158px] shrink-0 grid-cols-[380px_1fr_1fr_1fr] gap-4">
        <div className="flex flex-col justify-center rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6">
          <span className={`${LABEL_TYPE} text-acid`}>ChatGPT 新功能</span>
          <span className="mt-1.5 text-[26px] leading-tight font-semibold text-paper">
            這幾天新增的：生成 GIF
          </span>
          <span className="mt-1.5 text-[18px] text-muted">2026-11-04 隨 Images 2.6 推出</span>
        </div>
        {GIF_FACTS.map((fact) => (
          <div key={fact.label} className="flex flex-col rounded-2xl border border-line bg-panel px-5 py-4">
            <span className={LABEL_FAINT}>{fact.label}</span>
            <p className="mt-2 text-[19px] leading-[28px] text-paper">{fact.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 27 頁 · RecordReplayDemo
 *
 * 左：① 先安裝外掛（講師的截圖：外掛程式 › Record & Replay）。
 * 右上：② 用這句開始錄（可複製）＋ 錄製 → Skill → 重播 三步。
 * 右下：③ 可以做什麼（講師列的三件事；「玩你的遊戲」旁標現場影片）
 *       ＋ 講師實例 mabinogi-town-travel（瑪奇 Mobile：杜巴頓 → 提爾克納 → 學校）。
 * 用色 acid（開始錄、可以做什麼）＋ teal（講師實例）。
 * ══════════════════════════════════════════════════════════════ */

const RR_START_PROMPT = '@Record & Replay Record my workflow and turn it into a reusable skill';

/** 照官方文件整理的三步 */
const RR_FLOW = ['做一次給它看', '整理成 Skill', '換一組輸入再重播'];

const RR_USES: readonly { title: string; video?: boolean }[] = [
  { title: '上傳 YouTube 影片' },
  { title: '玩你的遊戲', video: true },
  { title: '網站檢查、測試' },
];

const RR_ROUTE = ['杜巴頓', '提爾克納', '學校'];

/** 步驟編號：中性的深色圓，不佔強調色 */
function RrNo({ n }: { n: number }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper font-display text-[17px] font-semibold text-on-accent tabular-nums">
      {n}
    </span>
  );
}

export function RecordReplayDemo() {
  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[470px_minmax(0,1fr)] gap-6">
      {/* ── 左欄：① 先安裝外掛 ─────────────────────────── */}
      <figure className="flex h-full min-h-0 flex-col rounded-2xl border border-line bg-panel p-4">
        <div className="flex h-8 shrink-0 items-center gap-3">
          <RrNo n={1} />
          <span className="text-[24px] font-semibold text-paper">先安裝外掛</span>
        </div>
        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-line-soft bg-panel">
          <img
            src={rrPluginUrl}
            alt="ChatGPT 的外掛程式頁面：Record & Replay（By OpenAI），右上角是「安裝外掛程式」按鈕，下方是三個建議的開場句"
            className="absolute inset-0 size-full object-contain"
          />
        </div>
        <figcaption className="mt-3 shrink-0 text-[19px] leading-[28px] text-muted">
          <span className="font-medium text-paper">外掛程式 › Record & Replay</span>
          ，按「＋ 安裝外掛程式」。只有 Mac，要先開啟 Computer Use。
        </figcaption>
      </figure>

      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        {/* ── ② 用這句開始錄 ─────────────────────────── */}
        <section className="flex shrink-0 flex-col rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-5">
          <div className="flex h-8 items-center gap-3">
            <RrNo n={2} />
            <span className="text-[24px] font-semibold text-paper">用這句開始錄</span>
          </div>
          <p className="mt-3 w-fit rounded-xl bg-ink-soft px-5 py-3 font-mono text-[22px] leading-[32px] text-paper">
            {RR_START_PROMPT}
          </p>
          <div className="mt-3 flex h-11 items-center gap-4">
            <CopyButton text={RR_START_PROMPT} idleLabel="複製這句" />
            <span className="min-w-0 text-[19px] text-muted">
              錄下滑鼠點擊、輸入的文字與操作中的視窗，最多 30 分鐘；可以隨時停止或取消，避開敏感的流程。
            </span>
          </div>
          <div className="mt-3 flex h-11 items-center gap-2">
            {RR_FLOW.map((step, index) => (
              <Fragment key={step}>
                {index > 0 && <ArrowRight width={36} className="text-acid" />}
                <span className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-panel-lift px-4 text-[20px] text-paper">
                  <span className="font-display text-[17px] text-faint tabular-nums">{index + 1}</span>
                  {step}
                </span>
              </Fragment>
            ))}
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
          {/* ── ③ 可以做什麼 ─────────────────────────── */}
          <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-line bg-panel px-6 py-5">
            <div className="flex h-8 shrink-0 items-center gap-3">
              <RrNo n={3} />
              <span className="text-[24px] font-semibold text-paper">可以做什麼？</span>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {RR_USES.map((use) => (
                <li
                  key={use.title}
                  className="flex h-[76px] items-center gap-4 rounded-xl border border-line border-l-[6px] border-l-acid bg-panel-lift px-5"
                >
                  <span className="shrink-0 text-[26px] font-semibold text-paper">{use.title}</span>
                  {use.video && (
                    <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border-2 border-paper px-3 py-1 text-[17px] font-medium text-paper">
                      <span aria-hidden="true">▶</span>
                      現場播放影片：Computer Use 玩遊戲
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* ── 講師實例 ─────────────────────────────── */}
          <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel px-6 py-5">
            <div className="flex h-8 shrink-0 items-baseline gap-3">
              <span className={`${LABEL_TYPE} text-teal`}>講師實例</span>
              <code className="min-w-0 truncate font-mono text-[19px] text-paper">
                mabinogi-town-travel
              </code>
            </div>
            <p className="mt-3 text-[21px] leading-[30px] text-paper">
              錄下一次操作整理成 Skill，讓 ChatGPT 在瑪奇 Mobile 裡自己移動到指定地點。
            </p>
            <div className="mt-3 flex h-12 shrink-0 items-center gap-2">
              {RR_ROUTE.map((place, index) => (
                <Fragment key={place}>
                  {index > 0 && <ArrowRight width={36} className="text-teal" />}
                  <span className="flex h-12 items-center rounded-xl border-2 border-teal bg-panel px-4 text-[22px] font-semibold text-paper">
                    {place}
                  </span>
                </Fragment>
              ))}
            </div>
            <p className="mt-3 text-[19px] leading-[28px] text-muted">
              打開右上角地圖 → 切到歐拉大陸 → 點提爾克納 → 點學校 → 按「前往此處」
            </p>
            <p className="mt-auto text-[19px] leading-[28px] text-paper">
              Skill 寫明：開始移動不等於抵達，看到抵達畫面才回報。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 28 頁 · SitesDemo
 *
 * 〈從 0 到 1 的網站開發〉第 25、26 頁濃縮成一頁：
 *   是什麼        一般的網站 vs ChatGPT Sites（四樣東西）＋ 現在的狀態
 *   四個注意事項  直式頁籤 ＋ 右側概念圖（分享範圍可以點）
 * 下排是連到〈從 0 到 1 的網站開發〉的連結卡與一張「還在公開測試」的提醒。
 * 連結是講師 2026-11-17 補上的 `/#/website-0-to-1`：同一個網站裡的另一份簡報
 * （用 Codex 做第一個網站、部署到 ChatGPT Sites），這一頁就是從它的第 25、26 頁濃縮的。
 * href 前面接 import.meta.env.BASE_URL，發佈到子路徑（VITE_BASE）時才不會連錯；
 * 畫面上照講師給的寫法顯示 `/#/website-0-to-1`。空字串時連結卡顯示「網址待補」、不能點。
 * ══════════════════════════════════════════════════════════════ */

/** 講師補上的連結（同站的另一份簡報）。空字串時連結卡不能點 */
const SITE_LINK_PATH = '/#/website-0-to-1';
const SITE_LINK_HREF = SITE_LINK_PATH
  ? `${import.meta.env.BASE_URL}${SITE_LINK_PATH.replace(/^\//, '')}`
  : '';

type SiteTab = 'what' | 'cautions';

const SITE_TABS: readonly SegOption<SiteTab>[] = [
  { id: 'what', text: '是什麼' },
  { id: 'cautions', text: '四個注意事項' },
];

const SITE_ROWS: readonly { name: string; plain: string; sites: string }[] = [
  { name: '主機', plain: '一台一直開著的機器，要自己租、自己顧', sites: '託管網站，直接給你一個網址' },
  { name: '後端程式', plain: '處理邏輯的程式，要自己部署', sites: '可以執行伺服器端程式' },
  { name: '資料庫', plain: '長期保存資料，要自己架', sites: 'D1（與 SQLite 相容），每個網站 10 GB' },
  { name: '檔案儲存', plain: '圖片、上傳的檔案，要自己找地方放', sites: 'R2，沒有固定的容量上限' },
];

const SITE_FACTS: readonly { label: string; text: string }[] = [
  { label: '做法', text: '在 ChatGPT（Work）或 Codex 裡，用說的建立與修改' },
  { label: '網址', text: '網站名.帳號名.chatgpt.site（示意）' },
  { label: '方案', text: 'Plus、Pro、Business、Enterprise' },
  { label: '費用', text: '主機到 2026-12-31 免費；2027 起超過每月額度要付費' },
  { label: '網域', text: '可以接自訂網域，另外計費' },
];

type CautionId = 'access' | 'deploy' | 'data' | 'delete';

const CAUTIONS: readonly {
  id: CautionId;
  no: string;
  title: string;
  sub: string;
  headline: string;
  lead: string;
}[] = [
  {
    id: 'access',
    no: '01',
    title: '有分權限',
    sub: '三種分享範圍，預設不公開',
    headline: '新網站預設只有你自己打得開',
    lead: '要給別人看，到網站的分享設定調整範圍。點下面三個選項看看差別。',
  },
  {
    id: 'deploy',
    no: '02',
    title: '部署就是正式上線',
    sub: '沒有另外的測試網址',
    headline: '每一次部署，都是正式上線',
    lead: '官方文件寫明：每個部署網址都是正式環境網址。想先檢查，就只儲存版本、先不要部署。',
  },
  {
    id: 'data',
    no: '03',
    title: '資料庫、用量說明有限',
    sub: '有容量上限，沒有備份保證',
    headline: '有容量上限，但沒有備份與穩定性的保證',
    lead: '要把正式資料放在這個網站上，得自己另外備份。',
  },
  {
    id: 'delete',
    no: '04',
    title: '刪除網站就刪光了',
    sub: '永久刪除，無法還原',
    headline: '刪除是永久的，無法還原',
    lead: '刪除網站會連同裡面的資料一起永久消失。只想暫時下架，不用刪除。',
  },
];

type ShareMode = 'owner' | 'invited' | 'public';

const SHARE_MODES: readonly SegOption<ShareMode>[] = [
  { id: 'owner', text: '只有自己（預設）' },
  { id: 'invited', text: '邀請特定的人' },
  { id: 'public', text: '任何有連結的人' },
];

const SHARE_NOTES: Record<ShareMode, string> = {
  owner: '官方寫的是「擁有者和工作區管理員」。個人方案沒有工作區管理員，等於只有你自己。',
  invited: '用 email 邀請，對方要用受邀的帳號登入，才打得開這個網址。',
  public:
    '等於公開到網路上，不用登入。官方文件稱「網際網路上的任何人」；沒有「拿到連結才能看」的半私密模式。',
};

function FlowChips({ items, warnLast }: { items: readonly string[]; warnLast?: boolean }) {
  return (
    <div className="flex items-center">
      {items.map((item, index) => {
        const warn = warnLast && index === items.length - 1;
        return (
          <Fragment key={item}>
            {index > 0 && <ArrowRight width={44} className="mx-2 text-faint" />}
            <span
              className={`flex h-[72px] min-w-0 flex-1 items-center justify-center rounded-xl px-4 text-center text-[21px] leading-snug ${
                warn
                  ? 'border-2 border-coral bg-panel font-semibold text-coral'
                  : 'border border-line bg-panel-lift text-paper'
              }`}
            >
              {item}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

function AccessFigure() {
  const [mode, setMode] = useState<ShareMode>('owner');
  return (
    <div className="flex flex-col gap-4">
      <Segmented label="分享範圍" options={SHARE_MODES} value={mode} onChange={setMode} />
      <p
        key={mode}
        className={`slide-enter rounded-xl border border-l-[6px] bg-panel px-6 py-4 text-[20px] leading-[30px] text-paper ${
          mode === 'public' ? 'border-coral/55 border-l-coral' : 'border-line border-l-line'
        }`}
      >
        {SHARE_NOTES[mode]}
      </p>
    </div>
  );
}

function CautionFigure({ id }: { id: CautionId }) {
  if (id === 'access') return <AccessFigure />;

  if (id === 'deploy') {
    return (
      <div className="flex flex-col gap-4">
        <FlowChips items={['在對話裡修改', '儲存版本，先不部署', '自己檢查一次', '部署＝正式上線']} warnLast />
        <p className="text-[19px] leading-[28px] text-muted">
          部署之後，所有打得開這個網址的人看到的就是新版本。
        </p>
      </div>
    );
  }

  if (id === 'data') {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'D1 資料庫', value: '每個網站 10 GB' },
            { name: 'R2 檔案儲存', value: '沒有固定的容量上限' },
          ].map((item) => (
            <div key={item.name} className="flex flex-col gap-1 rounded-xl border border-line bg-panel-lift px-6 py-4">
              <span className={LABEL_FAINT}>{item.name}</span>
              <span className="text-[26px] font-semibold text-paper">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="rounded-xl border border-coral/55 border-l-[6px] border-l-coral bg-panel px-6 py-3 text-[20px] leading-[30px] text-paper">
          條款沒有備份與穩定性的保證：正式資料要自己另外備份。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FlowChips items={['Delete site', '輸入網站代稱確認', 'Permanently delete', '無法還原']} warnLast />
      <p className="rounded-xl border border-line border-l-[6px] border-l-line bg-panel px-6 py-3 text-[20px] leading-[30px] text-paper">
        只想暫時下架：把分享範圍縮回只有自己，之後還能再打開。
      </p>
    </div>
  );
}

function SiteWhat() {
  return (
    <div className="grid h-full grid-cols-[1fr_560px] gap-7 rounded-2xl border border-line bg-panel p-8">
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="grid h-8 shrink-0 grid-cols-[150px_1fr_1fr] items-center gap-3">
          <span />
          <span className={LABEL_FAINT}>一般的網站</span>
          <span className={`${LABEL_TYPE} text-teal`}>ChatGPT Sites</span>
        </div>
        {SITE_ROWS.map((row) => (
          <div key={row.name} className="grid h-[76px] shrink-0 grid-cols-[150px_1fr_1fr] gap-3">
            <span className="flex items-center text-[24px] font-semibold text-paper">{row.name}</span>
            <span className="flex items-center rounded-xl border border-line-soft bg-panel-lift px-4 text-[19px] leading-snug text-muted">
              {row.plain}
            </span>
            <span className="flex items-center rounded-xl border border-teal/55 border-l-[6px] border-l-teal bg-teal/14 px-4 text-[20px] leading-snug text-paper">
              {row.sites}
            </span>
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl bg-ink-soft p-6">
        <span className={LABEL_FAINT}>現在的狀態 · 2026-11-10 查核</span>
        <dl className="mt-3.5 flex flex-col gap-2.5">
          {SITE_FACTS.map((fact) => (
            <div key={fact.label} className="flex items-baseline gap-3">
              <dt className="w-[52px] shrink-0 text-[17px] text-faint">{fact.label}</dt>
              <dd className="min-w-0 text-[20px] leading-[30px] break-keep text-pretty text-paper">{fact.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function SiteCautions() {
  const [activeId, setActiveId] = useState<CautionId>('access');
  const active = CAUTIONS.find((item) => item.id === activeId) ?? CAUTIONS[0];

  return (
    <div className="flex h-full">
      <nav aria-label="四個注意事項" className="relative z-10 flex w-[400px] shrink-0 flex-col gap-2.5 py-4">
        {CAUTIONS.map((item) => {
          const on = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setActiveId(item.id)}
              className={`-mr-px flex min-h-0 flex-1 items-center gap-4 rounded-l-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
                on
                  ? 'border-line border-r-panel border-l-coral bg-panel'
                  : 'border-line-soft border-r-line border-l-line-soft bg-ink-soft hover:bg-panel-lift'
              }`}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full font-display text-[22px] font-semibold tabular-nums ${
                  on ? 'bg-coral text-on-accent' : 'border border-line bg-panel text-faint'
                }`}
              >
                {item.no}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[23px] leading-[30px] font-semibold text-paper">{item.title}</span>
                <span className={`text-[18px] leading-[26px] ${on ? 'text-paper' : 'text-muted'}`}>
                  {item.sub}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-panel px-10 py-6">
        <div key={active.id} className="slide-enter flex min-h-0 flex-1 flex-col">
          <h3 className="text-[30px] leading-[40px] font-semibold text-paper">{active.headline}</h3>
          <p className="mt-2 text-[20px] leading-[30px] text-muted">{active.lead}</p>
          <div className="mt-5">
            <CautionFigure id={active.id} />
          </div>
        </div>
        <p className="mt-3 shrink-0 text-[16px] leading-[24px] text-faint">
          出處：learn.chatgpt.com/docs/sites · help.openai.com · 2026-11-10 查核
        </p>
      </section>
    </div>
  );
}

function SiteLinkCard() {
  const ready = SITE_LINK_HREF !== '';

  const inner = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-blue" />
          <span className={`${LABEL_TYPE} text-blue`}>完整課程：從 0 到 1 的網站開發</span>
        </span>
        {ready ? (
          <span className="truncate font-mono text-[20px] text-paper">{SITE_LINK_PATH}</span>
        ) : (
          <span className="text-[22px] text-faint">網址待補</span>
        )}
      </div>
      {ready ? (
        <span className="flex shrink-0 items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-[20px] font-medium text-on-accent">
          在新分頁打開
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </span>
      ) : (
        <span className="shrink-0 rounded-xl border border-line px-5 py-2.5 text-[19px] text-faint">
          尚未提供
        </span>
      )}
    </>
  );

  if (!ready) {
    return (
      <div
        aria-disabled="true"
        className="flex h-full items-center gap-6 rounded-2xl border-2 border-dashed border-blue/55 bg-panel px-7"
      >
        {inner}
      </div>
    );
  }

  return (
    <a
      href={SITE_LINK_HREF}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full items-center gap-6 rounded-2xl border-2 border-blue/70 bg-panel px-7 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
    >
      {inner}
    </a>
  );
}

export function SitesDemo() {
  const [tab, setTab] = useState<SiteTab>('what');

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-4">
      <div className="flex h-14 shrink-0 items-center gap-6">
        <Segmented label="ChatGPT Sites" options={SITE_TABS} value={tab} onChange={setTab} />
        <p className="text-[22px] text-paper">
          ChatGPT 內建的託管服務：用說的做網站，直接拿到網址。
        </p>
      </div>

      <div key={tab} className="slide-enter h-[452px] shrink-0">
        {tab === 'what' ? <SiteWhat /> : <SiteCautions />}
      </div>

      <div className="grid h-[100px] shrink-0 grid-cols-[1fr_680px] gap-4">
        <SiteLinkCard />
        <div className="flex items-center rounded-2xl border border-line border-l-[6px] border-l-line bg-panel px-6">
          <p className="text-[19px] leading-[28px] text-muted">
            Sites 還是公開測試版，2027 的費率官方寫的是擬議，方案與費用之後可能改變，上台前再確認一次。
          </p>
        </div>
      </div>
    </div>
  );
}
