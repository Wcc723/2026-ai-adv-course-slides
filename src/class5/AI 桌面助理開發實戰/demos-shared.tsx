import { useEffect, useId, useState } from 'react';
import chatgptProjectUrl from './images/chatgpt-project.png';
import claudeProjectUrl from './images/claude-project.png';
import smartUiUrl from './images/smart-ui.png';
import computerUseUrl from './images/computer-use.png';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 共有的能力（一）
 *
 *   第 14 頁   ProjectsDemo           專案管理（withVote）
 *   第 16 頁   SmartUiDemo            智慧型互動介面（withVote）
 *   第 17 頁   ComputerUseDemo        Computer Use：兩家的使用方法與技術優缺點（withVote）
 *   第 18 頁   ComputerUsePromptDemo  Computer Use 實作：到 Discord 留言
 *   （第 15 頁 ProjectsCompareDemo「ChatGPT、Claude 的專案差在哪」在 demos-projects-compare.tsx）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（Notion「課綱 › ChatGPT vs Claude」）
 * ──────────────────────────────────────────────────────────────
 * - 「專案管理」callout：「提及『專案管理功能』，在 ChatGPT、Claude 的運用方式」，
 *   附兩張建立專案的截圖（images/chatgpt-project.png、claude-project.png）。
 *   ChatGPT 截圖下方那句「專案會將對話、檔案和自訂指示集中在一處」直接拿來當標題。
 * - 「智慧型互動介面」callout：「幫忙查詢專有名詞，以及可以叫出來的範例提示詞；
 *   另外補上使用情境；到時候提供一個提示詞，除了產出以外，讓 AI 也可以讀到他的內容」，
 *   附 images/smart-ui.png。第三個範例提示詞就是最後這句要的那一個。
 * - 「Computer use」callout：「分別列出兩家 Computer Use 的使用方法，並列出兩家在技術上的
 *   優缺點／然後請提供提示詞找到 Discord > 六角學院 > AI 開發進化營 | 2026 > 交誼大廳
 *   並且留一句話」，附 images/computer-use.png。前半是第 17 頁，後半是第 18 頁。
 *   截圖只用在第 18 頁（第 17 頁沒有放，避免同一張圖連兩頁）。
 * - 講師 2026-11-17：「我記得 Claude 沒有 Cowork」。查證後（下面標 ◆ 的來源）：
 *   Chat 與 Cowork 已合併成一般對話，桌面版 ＝ 對話 ＋ Code 分頁；但還在分批推送
 *   （Pro／Max／Ultra 逐步開放，Team 2026-12-01 預設開啟、2027-02-01 舊介面退場），
 *   沒換到的帳號訊息框還有「Chat」「Cowork」兩個選項。所以頁面一律寫「對話／Code 分頁」，
 *   只在需要時用「舊介面的 Cowork」帶過，不再把 Cowork 當成獨立的模式或分頁。
 *   頻道名稱前的 🌟 與「|」是照截圖補進提示詞的，讓 AI 比較好認。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-10；標 ◆ 的是 2026-11-17 重查或新增的）
 * ──────────────────────────────────────────────────────────────
 * Cowork 與對話合併
 *   ◆ https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude
 *     「these are merged into a single conversation」「The model picker and the "Code" tab are
 *     where they were.」「Projects work in every conversation.」；訊息框還看得到
 *     「Chat」「Cowork」就是還沒換到新版。
 *   ◆ https://claude.com/product/cowork   「Claude Cowork is now just Claude.」
 *   ◆ https://support.claude.com/en/articles/18342806-set-up-and-manage-the-new-unified-claude-experience-for-your-team-organization
 *     Team 2026-12-01 預設開啟，2027-02-01 舊的分開介面退場。
 * 專案
 *   ◆ https://help.openai.com/en/articles/10169521-projects-in-chatgpt
 *     403，只讀得到搜尋摘要（摘要）：Free 起就能邀人共用、權限分 chat／edit；
 *     共用的專案自動改成「僅限專案」記憶；僅限專案記憶的專案不能用 ChatGPT Work。
 *     （2026-08-14 release notes 的摘要也有同一句，help.openai.com/en/articles/6825453）
 *   https://learn.chatgpt.com/docs/projects
 *   https://support.claude.com/en/articles/9517075-what-are-projects
 *   ◆ https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects
 *     「Each project has its own memory.」；所有方案都有，Free 最多 5 個。
 *   ◆ https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects
 *     「expand your project's capacity by up to 10x」，Pro／Max／Ultra／Team／Enterprise 才有
 *     → 運用方式寫「最多約 10 倍」，
 *     不寫「資料再多也放得下」。
 *   ◆ https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork
 *     桌面版的專案（原 Cowork 專案）：本機資料夾、匯入既有專案、貼網址、專案專屬的排程任務；
 *     「A project also shares memory with your chats outside of projects.」，
 *     關掉「Use account memory」才完全分開；記憶不會帶到其他專案。
 *     匯入按鈕的名稱官方前後不一（Import from project／Import a project），頁面只寫「匯入」。
 *   ◆ https://code.claude.com/docs/en/claude-projects
 *     Code 分頁另有新版 Projects（beta，Pro／Max／Ultra，不能共用），放在第 15 頁的註，
 *     這頁不提。
 * 互動介面
 *   https://openai.com/index/gpt-6-for-everyone/            ChatGPT：Intelligent UI（GPT-6，2026-10-07）
 *   https://help.openai.com/en/articles/20001598-intelligent-ui-in-chatgpt
 *   https://support.claude.com/en/articles/13979539-custom-visuals-in-chat-and-cowork
 *   https://claude.com/blog/claude-builds-visuals          Claude：Custom visuals（Beta，2026-03-12）
 * Computer Use
 *   https://learn.chatgpt.com/docs/computer-use
 *   https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt
 *   ◆ https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork
 *     標題還叫「…in Cowork」，內文寫「available in Cowork and Claude Code in the Claude Desktop
 *     application」；合併之後 16761823 寫任何對話都能用（beta，Pro／Max／Ultra）。
 *     開關是 Settings › Capabilities 的「Enable computer use」（或 Settings › System › This computer）。
 *   https://code.claude.com/docs/en/computer-use            （App 分級控制、截圖縮放）
 * help.openai.com 的文章 WebFetch 拿到 403，內容是從搜尋索引的摘要讀到的，
 * 能跟 learn.chatgpt.com 對上的才寫進頁面。
 *
 * 刻意寫得概括的地方（官方文件互相矛盾，或查不到）：
 * - 兩家「設定 › …」的選單路徑：ChatGPT 有兩份文件寫法不同（設定的 Computer use 頁
 *   vs Plugins › Computer Use），Claude 是 Settings › Capabilities 或 Settings › System，
 *   頁面只寫「在設定裡啟用」。
 * - ChatGPT 的 Intelligent UI 會不會把使用者在介面上的操作傳回模型：官方只寫
 *   「用介面上的控制項調整回答」。講師實測讀得到（CODD 筆記「簡報調整」2026-11-10：
 *   「AI 讀得到你的操作嗎『待講師實測』，是可以的，所以提示移除」），
 *   頁面改成確定的說法、標「講師實測」，第三則提示詞拿掉複製貼上的退路。
 *   Claude 是官方寫明的：一般對話中點視覺化會送出追問，Cowork 還不支援。
 *   ◆ 那篇文章（13979539）是 2026-04-22 的版本，早於 2026-09-16 的合併，所以頁面寫成
 *   「舊介面的 Cowork 任務還不支援」；合併後的對話裡做 Cowork 類的工作時行不行，官方沒寫。
 * - 「智慧型互動介面」是講師頁面的標題，OpenAI 的繁中官方譯名查不到，頁面用英文原名。
 *
 * 補的示意：
 * - 第 14 頁的「運用方式」三格（一個 repo／一門課／一個客戶一個專案⋯）是依各家功能
 *   寫的使用建議，不是官方文件的內容，也不是講師的原話。
 * - 第 16 頁的三個範例提示詞與三個使用情境：情境對應 OpenAI（探索概念、做小工具、學概念）
 *   與 Claude（把資料畫成圖表、比較選項、圖解流程）官方列的例子；提示詞是照截圖與情境寫的。
 * - 第 18 頁的兩份提示詞。差異：ChatGPT 版開頭用 @Computer（官方叫出 Computer Use 的寫法）；
 *   Claude 版加「不要改用瀏覽器或連接器」，因為官方寫 Claude 會先用連接器、瀏覽器，
 *   最後才操作畫面。兩份都停在送出前，等使用者回覆「送出」。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（分頁一律是中性的實心深色膠囊，不佔強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 14 頁   acid（運用方式的左粗條與標籤）
 *   第 16 頁   acid（選中的範例提示詞）＋ teal（已複製、「官方寫明」）；「講師實測」是中性的深色膠囊
 *   第 17 頁  teal（優點）＋ coral（缺點）
 *   第 18 頁  teal（已複製）＋ warn（送出前的提醒）
 *   淡底（/14）一律配 6px 不透明左粗條；狀態徽章是實心或實線框，不靠淡色。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768；withVote 的頁面根容器 640，第 18 頁 720）
 * ──────────────────────────────────────────────────────────────
 *   第 14 頁   h-[640]：分頁列 56 ＋ 20 ＋ 本體 564
 *             左：截圖框 720 × 564（p-4、說明 26）→ 圖片區 688 × 494，
 *                 ChatGPT 圖 1.25:1 → 619 × 494，Claude 圖 1.33:1 → 657 × 494
 *             右（988 寬）：標籤 22 ＋ 6 ＋ 標題 39 ＋ 16 ＋ 五列 × 53（21px 一行；
 *                 換行一列 ＋29）≈ 265 ＋ 運用方式 ≈ 152 → ≈ 500，留 64 給換行
 *   第 16 頁   h-[640]：左截圖框 580 × 640（圖 0.91:1 → 約 519 × 570）
 *             右（1128 寬）：分頁列 56 ＋ 20 ＋ 分頁內容 564
 *               專有名詞  兩張卡 554 寬：py 48 ＋ 名稱 70 ＋ 推出 27 ＋ 說明兩行 75
 *                         ＋ 兩列（怎麼叫 三行 135、讀得到嗎 兩行 ＋ 徽章 112）≈ 490
 *               範例提示詞 左清單 340 × 三格；右框 py 48 ＋ 標籤 24 ＋ 16 ＋ 提示詞井
 *                         （20px × 1.55，每行 33 字；最長的第三則 8 行 248 ＋ py 40）
 *                         ＋ 16 ＋ 底列 52 ≈ 444
 *               使用情境  三列平分 564（gap 16）→ 每列 177，內容 ≈ 106
 *   第 17 頁  h-[640]：分頁列 56 ＋ 16 ＋ 兩家各一列 220 ＋ 16 ＋ 16 ＋ 共通列 96
 *             使用方法  四格 364 寬，19px 每行 17 字，最多三行 → 卡高 ≈ 152
 *             優缺點    兩格 739 寬，20px 每行 32 字，三條各一行 → 卡高 ≈ 164
 *   第 18 頁  h-[720]：左 600 寬 ＝ 截圖框 454（圖約 430 × 384）＋ 20 ＋ 目的地卡 246
 *             右 1108 寬 ＝ 分頁列 56 ＋ 14 ＋ 貼到哪裡 30 ＋ 14 ＋ 輸入列 56 ＋ 14
 *                         ＋ 提示詞框 434 ＋ 14 ＋ 提醒 88
 *             提示詞井 19px × 1.5、每行 52 字，最多 9 行 ＋ 空行 12 ≈ 270（可用 306）。
 *             要留的話限 30 字，第 4 步一定在一行內。
 *             「貼到哪裡」一行 20px，兩版都控制在約 810 寬內（右欄從 x 632 起 → 止於 ≈ 1444），
 *             不伸進根容器右上 260 × 120。
 *   沒有任何容器會捲動，切換分頁不改變高度。浮水印在右上角：四頁的分頁列都靠左，
 *   根容器右上約 260 × 120 內沒有文字（第 16 頁那裡是 Claude 卡片的空白上緣）。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

type Vendor = 'chatgpt' | 'claude';

interface TabItem<T extends string> {
  id: T;
  name: string;
}

/** 分頁：選中的是實心深色膠囊（中性色，不佔強調色） */
function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex h-14 shrink-0 items-stretch gap-1.5 rounded-2xl border border-line bg-panel-lift p-1.5"
    >
      {items.map((item) => {
        const on = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(item.id)}
            className={`rounded-xl px-6 text-[21px] whitespace-nowrap transition-colors duration-200 ${
              on
                ? 'bg-paper font-semibold text-on-accent'
                : 'text-muted hover:bg-panel hover:text-paper'
            }`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 截圖畫框：圖片絕對定位填滿圖片區、object-contain，不會變形也不會撐高。
 * 畫框自己沒有高度 —— 放在 grid 裡會被撐滿；放在 flex 欄裡要給 `flex-1`。
 */
function Shot({
  src,
  alt,
  caption,
  className = '',
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure
      className={`flex min-h-0 flex-col gap-3 rounded-2xl border border-line bg-ink-soft p-4 ${className}`}
    >
      <div className="relative min-h-0 flex-1">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-contain"
        />
      </div>
      <figcaption className="shrink-0 text-center text-[17px] leading-snug text-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── 複製 ─────────────────────────────────────────────────── */

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 沒有 clipboard 權限（例如非 https）就退回 execCommand */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '-9999px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** 換提示詞時用 `key` 重掛，「已複製」不會殘留到下一則 */
function CopyButton({ text, label = '複製提示詞' }: { text: string; label?: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleClick = () => {
    void copyText(text).then((ok) => setStatus(ok ? 'copied' : 'failed'));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={status === 'failed' ? '瀏覽器擋下了複製，請手動選取文字' : undefined}
      className={`h-11 min-w-[148px] shrink-0 rounded-xl border px-5 text-[19px] transition-colors duration-200 ${
        status === 'copied'
          ? 'border-teal bg-teal font-medium text-on-accent'
          : status === 'failed'
            ? 'border-paper bg-panel text-paper'
            : 'border-line bg-panel text-paper hover:border-paper'
      }`}
    >
      {status === 'copied' ? '已複製' : status === 'failed' ? '複製失敗' : label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 14 頁 · ProjectsDemo — 專案管理
 *
 * 分頁切換 ChatGPT／Claude。左邊是講師的「建立專案」截圖，右邊是該家專案的
 * 五個重點（指示、檔案、本機資料夾、記憶、共用）與三個運用方式。
 * 一進頁面停在 ChatGPT。
 * ══════════════════════════════════════════════════════════════ */

interface ProjectSide {
  label: string;
  title: string;
  shot: { src: string; alt: string; caption: string };
  rows: readonly { name: string; text: string }[];
  uses: readonly { name: string; text: string }[];
}

const PROJECT_TABS: readonly TabItem<Vendor>[] = [
  { id: 'chatgpt', name: 'ChatGPT 專案' },
  { id: 'claude', name: 'Claude 專案' },
];

const PROJECT_SIDES: Record<Vendor, ProjectSide> = {
  chatgpt: {
    label: 'ChatGPT · Projects',
    title: '對話、檔案和自訂指示集中在一處',
    shot: {
      src: chatgptProjectUrl,
      alt: 'ChatGPT 的建立專案視窗：專案名稱、來源資料夾（在這台電腦上新增資料夾）、預設記憶，以及「專案會將對話、檔案和自訂指示集中在一處」的說明',
      caption: 'ChatGPT 桌面版：建立時可以指定「來源資料夾」與記憶',
    },
    rows: [
      { name: '專案指示', text: '寫一次，專案裡的每個對話都會套用' },
      { name: '檔案與來源', text: '上傳的檔案、接上的來源，專案裡的對話都能用' },
      {
        name: '本機資料夾',
        text: '桌面版可以連結電腦上的資料夾，ChatGPT 能讀寫裡面的檔案',
      },
      {
        // 摘要（help.openai.com 10169521）：共用的專案自動改成僅限專案記憶
        name: '專案記憶',
        text: '可選「預設記憶」或「僅限專案」；共用後固定是「僅限專案」',
      },
      // 摘要：Free、Go、Plus、Pro 都能邀人
      { name: '共用', text: '連 Free 都能邀人一起用；權限分可以編輯、只能對話' },
    ],
    uses: [
      { name: '一個 repo 一個專案', text: '連結本機資料夾，在 Work 裡直接讀寫檔案' },
      { name: '一門課一個專案', text: '課綱、講義放進來，指示寫好輸出格式' },
      // 摘要：僅限專案記憶的專案不能用 ChatGPT Work（跟上面那格的 Work 用法分開）。
      // 依據只有摘要，跟第 15 頁的「也可能不能開 Work」用同樣的保留程度 →「可能」
      { name: '一個客戶一個專案', text: '共用給同事，記憶只留在專案裡；可能不能開 Work' },
    ],
  },
  claude: {
    label: 'Claude · Projects',
    title: '每個專案有自己的對話紀錄與知識庫',
    shot: {
      src: claudeProjectUrl,
      alt: 'Claude 的建立專案視窗：您正在進行什麼工作、您想達成什麼目標，以及選填的背景資訊',
      caption: 'Claude：建立時先寫要做什麼、想達成什麼目標',
    },
    rows: [
      { name: '專案指示', text: '每個專案自己的指示：語氣、角色、輸出格式' },
      {
        name: '專案知識',
        text: '文件、程式碼、文字都能放；付費方案資料多時自動改用 RAG，容量最多約 10 倍',
      },
      {
        name: '本機資料夾',
        text: '桌面版的專案可以掛本機資料夾、匯入其他專案或貼網址',
      },
      {
        name: '專案記憶',
        text: '不帶到其他專案，但預設和一般對話共用；關掉「Use account memory」才分開',
      },
      { name: '共用', text: 'Team、Enterprise 方案才能共用，權限分成可檢視、可編輯' },
    ],
    uses: [
      { name: '一個客戶一個專案', text: '合約、會議紀錄放進專案知識，每次對話都帶著' },
      // 11473015：RAG「expand your project's capacity by up to 10x」，有上限，Free 沒有
      { name: '長期研究主題', text: '付費方案自動切到 RAG，容量最多約 10 倍' },
      { name: '固定的例行工作', text: '專案裡加排程任務，例如每週自動整理週報' },
    ],
  },
};

export function ProjectsDemo() {
  const [vendor, setVendor] = useState<Vendor>('chatgpt');
  const side = PROJECT_SIDES[vendor];

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-5">
      <div className="flex h-14 shrink-0 items-center gap-6">
        <Tabs items={PROJECT_TABS} value={vendor} onChange={setVendor} label="切換專案" />
        <p className="text-[20px] text-muted">截圖是兩家的「建立專案」視窗</p>
      </div>

      <div
        key={vendor}
        className="slide-enter grid min-h-0 flex-1 grid-cols-[720px_1fr] gap-8"
      >
        <Shot src={side.shot.src} alt={side.shot.alt} caption={side.shot.caption} />

        <div className="flex min-h-0 flex-col">
          <p className={`${LABEL_TYPE} text-faint`}>{side.label}</p>
          <h3 className="mt-1.5 text-[30px] leading-tight font-semibold text-paper">
            {side.title}
          </h3>

          <dl className="mt-4 flex flex-col border-t border-line">
            {side.rows.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[150px_1fr] items-baseline gap-4 border-b border-line-soft py-3"
              >
                <dt className="text-[19px] font-semibold text-muted">{row.name}</dt>
                <dd className="text-[21px] leading-snug text-paper">{row.text}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-4">
            <p className={`${LABEL_TYPE} text-acid`}>運用方式</p>
            <ul className="mt-3 grid grid-cols-3 gap-5">
              {side.uses.map((use) => (
                <li key={use.name} className="flex min-w-0 flex-col gap-1">
                  <span className="text-[21px] leading-snug font-semibold text-paper">
                    {use.name}
                  </span>
                  <span className="text-[19px] leading-[1.45] break-keep text-pretty text-muted">{use.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 16 頁 · SmartUiDemo — 智慧型互動介面
 *
 * 左：講師的截圖（ChatGPT 對話裡的「網站成長儀表板」）。
 * 右：三個分頁 —— 專有名詞（兩家的官方名稱、怎麼叫出來、AI 讀不讀得到你的操作）、
 *     範例提示詞（三則可複製，第三則是「讓 AI 讀到你在介面上的選擇再繼續」）、
 *     使用情境（三個）。一進頁面停在專有名詞。
 * ══════════════════════════════════════════════════════════════ */

type SmartTab = 'terms' | 'prompts' | 'cases';

const SMART_TABS: readonly TabItem<SmartTab>[] = [
  { id: 'terms', name: '專有名詞' },
  { id: 'prompts', name: '範例提示詞' },
  { id: 'cases', name: '使用情境' },
];

interface Term {
  vendor: string;
  term: string;
  since: string;
  desc: string;
  how: string;
  read: string;
  /** 「AI 讀得到你的操作嗎」的依據：官方文件寫明，或講師實測 */
  basis: 'official' | 'tested';
}

const TERMS: readonly Term[] = [
  {
    vendor: 'ChatGPT',
    term: 'Intelligent UI',
    since: 'GPT-6 起 · 2026-10-07 推出',
    desc: '回答不只是文字，可以直接是圖表、表單、按鈕這類能操作的介面。',
    how: '模型依問題自己決定要不要用，也可以直接要求「做成可以操作的介面」。在 Chat 模式使用，Work 模式與語音模式沒有。',
    read: '讀得到。你在介面上勾選、切換、按下的結果，AI 看得到，可以接著往下聊。',
    basis: 'tested',
  },
  {
    vendor: 'Claude',
    term: 'Custom visuals',
    since: 'Beta · 2026-03-12 推出',
    desc: '圖表、流程圖、互動元件直接畫在回答裡，可以點按鈕、拉滑桿。',
    how: 'Claude 自己判斷，也可以說「畫成圖」「visualize this」。不用另外開設定；網頁版與桌面版看得到，手機 App 不會顯示。',
    read: '一般對話裡點視覺化的元素，會直接送出追問給 Claude；舊介面的 Cowork 任務還不支援。',
    basis: 'official',
  },
];

interface SmartPrompt {
  id: string;
  name: string;
  sub: string;
  text: string;
  note: string;
}

const SMART_PROMPTS: readonly SmartPrompt[] = [
  {
    id: 'dashboard',
    name: '叫出互動儀表板',
    sub: '對照左邊的截圖',
    text: [
      '用模擬資料做一個「網站成長儀表板」，直接在對話裡做成可以操作的介面：',
      '- 上方可以切換近 7 天、近 30 天、近 90 天',
      '- 顯示總訪客與日平均',
      '- 折線圖分成搜尋、社群、直接三種流量來源，可以勾選篩選',
      '不要只給我程式碼，我要直接在對話裡操作。',
    ].join('\n'),
    note: '寫明「做成可以操作的介面」比較容易叫出來；AI 仍可能判斷用文字回答比較好。',
  },
  {
    id: 'tool',
    name: '做一個對話裡的小工具',
    sub: '分帳計算機',
    text: [
      '做一個可以直接在對話裡使用的分帳計算機：',
      '- 輸入總金額、人數、服務費百分比',
      '- 即時算出每個人要付多少',
      '- 可以切換「四捨五入到整數」',
      '做成可以操作的介面，不要只給我公式。',
    ].join('\n'),
    note: '計算機、小遊戲、分帳工具都是 OpenAI 官方舉的例子。',
  },
  {
    id: 'read-back',
    name: '讓 AI 讀到你的選擇',
    sub: '選完再繼續',
    text: [
      '幫我做一個互動式的比較介面，比較 Cloudflare Pages、Vercel、Netlify 三個部署平台：',
      '- 讓我勾選在意的條件（免費額度、建置速度、後端功能、學習成本），並用滑桿設定每個條件的權重',
      '- 介面下方即時顯示我目前的選擇摘要',
      '- 放一個「送出我的選擇」按鈕，按下後把摘要傳回這個對話',
      '收到我的選擇之後，依照條件與權重推薦一個平台，並說明理由。',
    ].join('\n'),
    note: '兩家都讀得到你在介面上的選擇：Claude 是官方寫明，ChatGPT 是講師實測。',
  },
];

const SMART_CASES: readonly { name: string; text: string; say: string }[] = [
  {
    name: '看懂一份數據',
    text: '把 CSV 或一段數字變成儀表板，直接切時間區間、篩選來源，就像左邊的網站成長儀表板。',
    say: '「把這份流量資料做成可以切換時間區間的儀表板」',
  },
  {
    name: '幫自己做決定',
    text: '幾個方案並排比較，勾選在意的條件、拉權重，再讓 AI 依照你的選擇給建議。',
    say: '「比較這三個方案，讓我勾選在意的條件再推薦」',
  },
  {
    name: '學概念、做小工具',
    text: '拖動參數看公式或流程怎麼變化；或直接在對話裡做計算機、分帳工具來用。',
    say: '「做一個可以拖動年利率的複利計算機」',
  },
];

function TermCard({ item }: { item: Term }) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-7 py-6">
      <p className={`${LABEL_TYPE} text-faint`}>{item.vendor}</p>
      <p className="mt-1 text-[36px] leading-[1.2] font-semibold text-paper">{item.term}</p>
      <p className="text-[19px] leading-[1.4] text-muted">{item.since}</p>
      <p className="mt-3 text-[21px] leading-normal text-paper">{item.desc}</p>

      <div className="mt-5 border-t border-line pt-4">
        <p className="text-[17px] leading-snug font-semibold text-faint">怎麼叫出來</p>
        <p className="mt-1.5 text-[20px] leading-normal text-paper">{item.how}</p>
      </div>

      <div className="mt-4">
        <div className="flex h-[30px] items-center gap-3">
          <p className="text-[17px] leading-snug font-semibold text-faint">
            AI 讀得到你的操作嗎
          </p>
          {item.basis === 'official' ? (
            <span className="rounded-full border border-teal bg-teal px-3 py-0.5 text-[16px] font-medium text-on-accent">
              官方寫明
            </span>
          ) : (
            <span className="rounded-full border border-paper bg-paper px-3 py-0.5 text-[16px] font-medium text-on-accent">
              講師實測
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[20px] leading-normal text-paper">{item.read}</p>
      </div>
    </div>
  );
}

function SmartPrompts() {
  const [picked, setPicked] = useState(SMART_PROMPTS[0].id);
  const index = SMART_PROMPTS.findIndex((item) => item.id === picked);
  const prompt = SMART_PROMPTS[index];

  return (
    <div className="grid h-full grid-cols-[340px_1fr] gap-5">
      <div className="flex min-h-0 flex-col gap-3">
        {SMART_PROMPTS.map((item, order) => {
          const on = item.id === picked;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(item.id)}
              className={`flex min-h-0 flex-1 flex-col justify-center gap-1 rounded-2xl border border-l-[6px] px-6 text-left transition-colors duration-200 ${
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
                className={`text-[24px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}
              >
                {item.name}
              </span>
              <span className={`text-[19px] ${on ? 'text-paper' : 'text-muted'}`}>
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={prompt.id}
        className="slide-enter flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-7 py-6"
      >
        <div className="flex items-baseline gap-4">
          <span className={`${LABEL_TYPE} text-faint`}>範例提示詞 0{index + 1}</span>
          <span className="text-[18px] text-muted">ChatGPT、Claude 都可以用</span>
        </div>
        <p className="mt-4 min-h-0 flex-1 rounded-xl bg-ink-soft px-6 py-5 text-[20px] leading-[1.55] whitespace-pre-line text-paper">
          {prompt.text}
        </p>
        <div className="mt-4 flex min-h-[52px] items-center gap-4">
          <CopyButton key={prompt.id} text={prompt.text} />
          <p className="text-[18px] leading-[1.45] text-muted">{prompt.note}</p>
        </div>
      </div>
    </div>
  );
}

function SmartCases() {
  return (
    <div className="flex h-full flex-col gap-4">
      {SMART_CASES.map((item, order) => (
        <div
          key={item.name}
          className="flex min-h-0 flex-1 items-center gap-6 rounded-2xl border border-line bg-panel px-7"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-line font-display text-[24px] font-semibold text-faint tabular-nums">
            0{order + 1}
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-[26px] leading-tight font-semibold text-paper">{item.name}</p>
            <p className="mt-1.5 text-[20px] leading-normal text-muted">{item.text}</p>
            <p className="mt-2 text-[19px] leading-snug text-paper">
              <span className="mr-3 text-[17px] text-faint">可以這樣說</span>
              {item.say}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SmartUiDemo() {
  const [tab, setTab] = useState<SmartTab>('terms');

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[580px_1fr] gap-8">
      <Shot
        src={smartUiUrl}
        alt="ChatGPT 對話裡直接產生的互動式「網站成長儀表板」：可切換近 7／30／90 天、總訪客與日平均、三種流量來源的折線圖與勾選篩選，右上角標著「即時互動」，下方是「問問 ChatGPT」輸入框"
        caption="ChatGPT 對話裡直接長出來的「網站成長儀表板」"
      />

      <div className="flex min-h-0 flex-col gap-5">
        <Tabs items={SMART_TABS} value={tab} onChange={setTab} label="切換內容" />

        <div key={tab} className="slide-enter min-h-0 flex-1">
          {tab === 'terms' && (
            <div className="grid h-full grid-cols-2 gap-5">
              {TERMS.map((item) => (
                <TermCard key={item.term} item={item} />
              ))}
            </div>
          )}
          {tab === 'prompts' && <SmartPrompts />}
          {tab === 'cases' && <SmartCases />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 17 頁 · ComputerUseDemo — 兩家的使用方法與技術上的優缺點
 *
 * 兩列（ChatGPT、Claude）× 分頁切換的內容：
 *   使用方法          四步：開啟 → 系統權限 → 下指令 → 授權
 *   技術上的優缺點    優點（teal）｜缺點（coral），各三條，全部有官方文件依據
 * 底下一條兩家共通，並註明速度與穩定度看講師實測。一進頁面停在使用方法。
 * ══════════════════════════════════════════════════════════════ */

type CuTab = 'how' | 'tradeoffs';

const CU_TABS: readonly TabItem<CuTab>[] = [
  { id: 'how', name: '使用方法' },
  { id: 'tradeoffs', name: '技術上的優缺點' },
];

interface CuSide {
  id: Vendor;
  name: string;
  where: string;
  meta: string;
  steps: readonly { name: string; text: string }[];
  pros: readonly string[];
  cons: readonly string[];
}

const CU_SIDES: readonly CuSide[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    where: '桌面版的 Work 模式、Codex',
    meta: 'macOS · Windows',
    steps: [
      { name: '開啟', text: '在設定裡啟用 Computer Use，第一次會帶你安裝外掛。' },
      {
        name: '系統權限',
        text: 'macOS 要給「螢幕錄製」與「輔助使用」；Windows 不用，但目標視窗要留在畫面上。',
      },
      { name: '下指令', text: '提示詞裡寫 @Computer 或 @App 名稱，例如 @Chrome。' },
      { name: '授權', text: '第一次用某個 App 會先問你，可以選 Always allow 記住。' },
    ],
    pros: [
      'Mac 鎖定時也能繼續操作（Locked use，要另外開啟）',
      '選 Always allow 記住授權，同一個 App 不用每次都問',
      '網頁任務可改用雲端瀏覽器，闔上筆電也會繼續跑',
    ],
    cons: [
      'Windows 只能在前景執行，會佔用你的滑鼠與鍵盤',
      '不能操作終端機與 ChatGPT 本身，也不能代按系統權限',
      '只在 Work 模式與 Codex 裡，而且依地區開放',
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    where: '桌面版的對話、Code 分頁',
    meta: 'macOS · Windows · Beta',
    steps: [
      { name: '開啟', text: '在設定裡打開「Enable computer use」。' },
      {
        name: '系統權限',
        text: 'macOS 要給「輔助使用」與「螢幕錄製」；Windows 打開開關就能用。',
      },
      {
        name: '下指令',
        text: '在對話或 Code 分頁直接交代；連接器、瀏覽器能做的會先用那些。',
      },
      { name: '授權', text: '每個 App 都要你先允許；交易、加密貨幣類 App 預設封鎖。' },
    ],
    pros: [
      '先找最快的路：連接器 → 瀏覽器，最後才操作畫面',
      '依 App 分級控制：瀏覽器只能看、終端機與 IDE 只能點',
      '會掃描畫面上的提示詞注入，也可以設定封鎖清單',
    ],
    cons: [
      '還在 Beta；Team、Enterprise 方案目前不能用',
      '官方自己寫：操作畫面比連接器慢，複雜任務有時要重試',
      '沒有沙盒：點到的連結可能開進你沒授權的 App',
    ],
  },
];

const CU_COMMON: readonly string[] = [
  '都是看截圖判斷畫面，再點擊、打字',
  'macOS 都要給螢幕錄製與輔助使用權限',
  'macOS 上都能在背景執行',
];

function CuSteps({ side }: { side: CuSide }) {
  return (
    <ol className="grid h-full grid-cols-4 gap-3">
      {side.steps.map((step, order) => (
        <li
          key={step.name}
          className="flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-5 py-4"
        >
          <span className="flex items-baseline gap-3">
            <span className="font-display text-[20px] leading-none font-semibold text-faint tabular-nums">
              0{order + 1}
            </span>
            <span className="text-[20px] leading-tight font-semibold text-paper">
              {step.name}
            </span>
          </span>
          <span className="mt-2 text-[19px] leading-[1.5] text-paper">{step.text}</span>
        </li>
      ))}
    </ol>
  );
}

function CuList({ kind, items }: { kind: 'pros' | 'cons'; items: readonly string[] }) {
  const pros = kind === 'pros';
  return (
    <div
      className={`flex min-h-0 flex-col rounded-2xl border border-line border-l-[6px] bg-panel px-6 py-4 ${
        pros ? 'border-l-teal' : 'border-l-coral'
      }`}
    >
      <p className={`${LABEL_TYPE} ${pros ? 'text-teal' : 'text-coral'}`}>
        {pros ? '優點' : '缺點'}
      </p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[20px] leading-[1.4] text-paper">
            <span
              aria-hidden="true"
              className={`w-7 shrink-0 text-center font-semibold ${pros ? 'text-teal' : 'text-coral'}`}
            >
              {pros ? '＋' : '－'}
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ComputerUseDemo() {
  const [tab, setTab] = useState<CuTab>('how');

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-4">
      <div className="flex h-14 shrink-0 items-center gap-6">
        <Tabs items={CU_TABS} value={tab} onChange={setTab} label="切換內容" />
        <p className="text-[20px] text-muted">兩家都在桌面版 App 裡，直接操作你電腦上的 App</p>
      </div>

      {CU_SIDES.map((side) => (
        <div key={side.id} className="grid min-h-0 flex-1 grid-cols-[230px_1fr] gap-4">
          <div className="flex min-h-0 flex-col justify-center rounded-2xl border border-line bg-ink-soft px-6">
            <p className="text-[30px] leading-tight font-semibold text-paper">{side.name}</p>
            <p className="mt-1 text-[18px] leading-snug break-keep text-pretty text-muted">{side.where}</p>
            <p className="mt-2 text-[17px] text-faint">{side.meta}</p>
          </div>

          <div key={tab} className="slide-enter min-h-0">
            {tab === 'how' ? (
              <CuSteps side={side} />
            ) : (
              <div className="grid h-full grid-cols-2 gap-4">
                <CuList kind="pros" items={side.pros} />
                <CuList kind="cons" items={side.cons} />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex h-[96px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-line bg-ink-soft px-7">
        <div className="flex items-baseline gap-6">
          <span className={`${LABEL_TYPE} shrink-0 text-faint`}>兩家共通</span>
          {CU_COMMON.map((item) => (
            <span key={item} className="text-[20px] leading-snug text-paper">
              {item}
            </span>
          ))}
        </div>
        <p className="text-[17px] leading-snug text-muted">
          以上整理自兩家官方文件（2026-11-10）；實際的速度與穩定度，看講師實測。
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 18 頁 · ComputerUsePromptDemo — 到 Discord 留言
 *
 * 左：講師的 Discord 側欄截圖＋要去的地方（App › 伺服器 › 類別 › 頻道）。
 * 右：ChatGPT 版／Claude 版兩份提示詞（分頁切換）。「要留的話」可以自己改，
 *     提示詞即時更新，複製出去的就是改過的版本。下方提醒送出是對外操作。
 * ══════════════════════════════════════════════════════════════ */

const DEFAULT_MESSAGE = '我是用 Computer Use 留言的 👋';
const MESSAGE_MAX = 30;

const PROMPT_TABS: readonly TabItem<Vendor>[] = [
  { id: 'chatgpt', name: 'ChatGPT 版' },
  { id: 'claude', name: 'Claude 版' },
];

const PROMPT_WHERE: Record<Vendor, string> = {
  chatgpt: '貼到 ChatGPT 桌面版的 Work 模式或 Codex；開頭的 @Computer 會叫出 Computer Use。',
  // 寬度不超過 ChatGPT 那句（約 810），右端才不會伸進根容器右上的浮水印區
  claude: '貼到 Claude 桌面版的對話（看得到 Cowork 就選它）或 Code 分頁；先開 computer use。',
};

const DISCORD_PATH: readonly { name: string; value: string }[] = [
  { name: 'App', value: 'Discord' },
  { name: '伺服器', value: '六角學院' },
  { name: '類別', value: 'AI 開發進化營 | 2026' },
  { name: '頻道', value: '🌟 | 交誼大廳' },
];

/** 提示詞的一行；`message` 為 true 的那一行在畫面上把留言標出來 */
interface PromptLine {
  text: string;
  message?: string;
}

function buildPrompt(vendor: Vendor, message: string): PromptLine[] {
  const opening: PromptLine[] =
    vendor === 'chatgpt'
      ? [
          {
            text: '@Computer 請用 Computer Use 操作我電腦上的 Discord 桌面 App，幫我到指定頻道留一句話：',
          },
          { text: '1. 打開 Discord App。' },
        ]
      : [
          {
            text: '請用 computer use 直接操作我電腦上的 Discord 桌面 App（不要改用瀏覽器或連接器），幫我到指定頻道留一句話：',
          },
          { text: '1. 打開 Discord App；跳出權限詢問時，我會允許 Discord。' },
        ];

  return [
    ...opening,
    { text: '2. 在左側的伺服器列表找到「六角學院」，點進去。' },
    {
      text: '3. 在頻道列表找到類別「AI 開發進化營 | 2026」，點選頻道「交誼大廳」（名稱前有 🌟）。',
    },
    { text: '4. 點訊息輸入框，輸入：', message },
    {
      text: '5. 先不要送出。停下來告訴我目前的伺服器、頻道與訊息內容，等我回覆「送出」才按 Enter。',
    },
    { text: '' },
    { text: '只操作 Discord，不要點其他頻道或私訊；找不到伺服器或頻道就停下來問我。' },
  ];
}

function promptToText(lines: readonly PromptLine[]): string {
  return lines.map((line) => line.text + (line.message ?? '')).join('\n');
}

export function ComputerUsePromptDemo() {
  const [vendor, setVendor] = useState<Vendor>('chatgpt');
  const [draft, setDraft] = useState(DEFAULT_MESSAGE);
  const inputId = useId();

  const message = draft.trim() === '' ? DEFAULT_MESSAGE : draft.trim();
  const lines = buildPrompt(vendor, message);
  const promptText = promptToText(lines);
  const vendorName = vendor === 'chatgpt' ? 'ChatGPT' : 'Claude';

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[600px_1fr] gap-8">
      {/* ── 左：截圖＋目的地 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-5">
        <Shot
          src={computerUseUrl}
          alt="Discord 側欄：類別「AI 開發進化營 | 2026」底下的頻道列表，選中的是「🌟 | 交誼大廳」，其他還有班級公告、每日活動、作業討論"
          caption="講師的 Discord 側欄：AI 開發進化營 | 2026 › 交誼大廳"
          className="flex-1"
        />

        <div className="shrink-0 rounded-2xl border border-line bg-panel px-6 py-5">
          <p className={`${LABEL_TYPE} text-faint`}>要去的地方</p>
          <dl className="mt-3 flex flex-col">
            {DISCORD_PATH.map((step) => (
              <div
                key={step.name}
                className="grid grid-cols-[84px_1fr] items-center border-b border-line-soft py-1.5 last:border-b-0"
              >
                <dt className="text-[18px] text-muted">{step.name}</dt>
                <dd className="text-[22px] leading-[1.4] font-medium text-paper">{step.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── 右：提示詞 ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3.5">
        <Tabs items={PROMPT_TABS} value={vendor} onChange={setVendor} label="切換提示詞版本" />

        <p className="h-[30px] shrink-0 text-[20px] leading-[30px] text-muted">
          {PROMPT_WHERE[vendor]}
        </p>

        <div className="flex h-14 shrink-0 items-center gap-4">
          <label htmlFor={inputId} className="shrink-0 text-[20px] font-semibold text-paper">
            要留的話
          </label>
          <input
            id={inputId}
            type="text"
            value={draft}
            maxLength={MESSAGE_MAX}
            placeholder={DEFAULT_MESSAGE}
            onChange={(event) => setDraft(event.target.value)}
            className="h-full min-w-0 flex-1 rounded-xl border-2 border-line bg-panel px-5 text-[22px] text-paper transition-colors duration-200 outline-none placeholder:text-faint focus:border-paper"
          />
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_MESSAGE)}
            className="h-full shrink-0 rounded-xl border border-line bg-panel px-5 text-[19px] text-paper transition-colors duration-200 hover:border-paper"
          >
            還原
          </button>
        </div>

        <div
          key={vendor}
          className="slide-enter flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-panel px-7 py-5"
        >
          <div className="flex h-11 shrink-0 items-center justify-between gap-4">
            <span className={`${LABEL_TYPE} text-faint`}>提示詞 · {vendorName} 版</span>
            <CopyButton key={vendor} text={promptText} />
          </div>
          <div className="mt-3 min-h-0 flex-1 rounded-xl bg-ink-soft px-6 py-4 text-[19px] leading-[1.5] text-paper">
            {lines.map((line, index) =>
              line.text === '' && line.message === undefined ? (
                <div key={index} aria-hidden="true" className="h-3" />
              ) : (
                <p key={index}>
                  {line.text}
                  {line.message !== undefined && (
                    <span className="rounded-md border border-paper px-1.5 font-semibold">
                      {line.message}
                    </span>
                  )}
                </p>
              ),
            )}
          </div>
        </div>

        <div className="flex h-[88px] shrink-0 items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-warn bg-panel px-6">
          <span className="shrink-0 rounded-full bg-warn px-4 py-1 text-[19px] font-semibold text-on-accent">
            注意
          </span>
          <p className="text-[21px] leading-normal break-keep text-pretty text-paper">
            送出訊息是對外操作，會用你的帳號發言、全班都看得到。先讓 AI 停在送出前，確認頻道與內容再放行。
          </p>
        </div>
      </div>
    </div>
  );
}
