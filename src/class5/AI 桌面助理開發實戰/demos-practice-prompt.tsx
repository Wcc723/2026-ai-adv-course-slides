import { Fragment, useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 實戰：用一段提示詞建立 GitHub Project
 *
 *   第 46 頁  PracticeProjectPromptDemo  實戰：用一段提示詞建立 GitHub Project
 *             接在第 45 頁 PracticeDevicesShotsDemo（demos-practice.tsx，跨裝置流程的
 *             實際畫面）後面。沒有投票 → 根容器 h-[720px]。
 *
 *   左  提示詞「分階段複製」：左側五個階段的步驟列，每一步右邊一顆「複製」（點了就複製
 *       那一段，並切到那一段）；右邊是目前這一段「會複製出去的原文」，頂端一顆最醒目的
 *       「複製第 N 階段」。複製過的階段，編號換成勾，照順序貼的時候知道貼到哪了。
 *       「複製完整提示詞」降成標題列右端的次要按鈕。
 *   右  照提示詞做出來的 Project 卡片（介面示意），底下是卡片的生命週期：
 *       待開發 → 開發中 → 驗收／完成。點「開發中」Agent 欄位填上並用 acid 框起來
 *       （標「誰在做這張卡」）；點「驗收／完成」Agent 清空、「結果」寫回內文。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * - 講師要求（2026-11-18，CODD 筆記「簡報調整」codd://note/note-plus）：
 *   「這邊的提示詞有分階段很好，那你幫我把提示詞改成分階段複製的，現在分階段不是很好複製。」
 * - 講師要求（2026-11-17）：「實戰：跨裝置流程的實際畫面 — 參考我的 GitHub Project，
 *   提供一個完整的提示詞（可以讓學生建立 Project 用的，也能讓我在課堂上示範），
 *   其中一個 Agent 欄位一定要補上（誰要做這張卡）」。
 * - 提示詞全文（PROMPT_INTRO ＋ PROMPT_SECTIONS）照講師給的原文，沒有改任何字。
 *   每一階段複製出去的文字（PHASES[].copyText）：
 *     第一階段 ＝ 開場兩行 ＋ 空一行 ＋「一、開始前」與第 1–2 條
 *     第二～五階段 ＝ 段落標題（第四段含括號）＋ 該段條目
 *   五個階段用空一行串起來，跟「複製完整提示詞」（PROMPT_TEXT）逐字相同
 *   （2026-11-18 用程式比對過，也跟改版前的全文逐字相同）。
 *   畫面顯示與複製出去的是同一份資料；指令、檔名用等寬字標出來（CODE_FRAGMENTS）
 *   只是排版，「一定要有」標籤也只在畫面上，都不會進到複製的內容。
 * - 範本是講師自己的 Project「casper.tw 開發」（私人看板，第 45 頁有實際畫面），
 *   描述「跨裝置協同的唯一工作來源」。借用的規則：
 *     Status 單選：探索、待開發（範圍清楚，可以接）、開發中、驗收、已上線、完成、凍結（終止）
 *     Agent 文字：「模型 / 裝置名稱 / session 前 8 碼」
 *     開工前把 Status 改成「開發中」並填 Agent，上線或結案時清空 Agent
 *     卡片內文分「出處／現況／做法／結果」四段
 *   講師看板上的「Project」單選欄位，提示詞裡叫「Repo」（避免跟 GitHub Project 撞名），
 *   頁面照提示詞用 Repo。講師看板的網址、number、欄位 id 都沒有放上畫面。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-18）
 * ──────────────────────────────────────────────────────────────
 *   提示詞裡的 gh 指令，對照本機 gh 2.102.0（2026-09-30）的 --help，
 *   線上版同一份內容在 https://cli.github.com/manual/ 的各子指令頁：
 *   - https://cli.github.com/manual/gh_project
 *     「The minimum required scope for the token is: `project`」「add the `project`
 *     scope by running `gh auth refresh -s project`」→ 第 1 條
 *   - https://cli.github.com/manual/gh_project_create   --owner（"@me"）、--title → 第 3 條
 *   - https://cli.github.com/manual/gh_project_link     link [<number>] --owner --repo → 第 4 條
 *   - https://cli.github.com/manual/gh_project_field-create
 *     --data-type {TEXT|SINGLE_SELECT|DATE|NUMBER}、--single-select-options → 第 6、7 條
 *   - gh project 底下沒有改欄位選項的子指令（只有 field-create／field-delete／field-list），
 *     所以第 5 條要走 GraphQL；提示詞本身已經寫了「改不了就告訴我，我到網頁上改」的退路。
 *   - https://cli.github.com/manual/gh_project_item-edit
 *     「Remove a project item field value with `--clear`」→ 第 10 條
 *   - https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
 *     自訂欄位可以是 date、number、single select、text、iteration → Agent 用 Text 成立
 *   沒有查證、照講師原文：
 *   - 「給空字串清不掉」是講師的實際經驗，--help 沒有寫空字串的行為。
 *   - scutil --get ComputerName（macOS）／hostname（Windows）沒有另外查官方文件。
 *   - 哪些 GitHub 方案能用 Projects，上面那頁沒寫；所以「課堂示範」提示只說
 *     先用測試 repo，沒有寫「Free 帳號就能用」。
 *   本頁沒有用到 research-digest.txt／research-1117.json 的內容（那兩份查的是 ChatGPT 與
 *   Claude 桌面版，沒有涵蓋 gh CLI 與 GitHub Projects）。
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（講師沒給、為了讓畫面成立才加的，都可以換掉）
 * ──────────────────────────────────────────────────────────────
 *   - 標題列的「貼一段給 AI，等它回報完再貼下一段」是操作說明，依開場那句「每一步做完先
 *     跟我回報，再做下一步」寫的；步驟列的副標（「開場 ＋ 第 1–2 條」等）由資料算出來。
 *   - 右邊整個卡片畫面是手繪的介面示意，不是截圖，版面參考 GitHub Project 的卡片側欄
 *     （欄位一列一個），畫面下方標「介面示意」。
 *   - Project 名稱「小明的網站開發」、卡片標題「示範卡：首頁加上聯絡表單」、Repo 選項
 *     「my-site」、內文四段的文字，都是示意。「小明」與 Agent 的值
 *     「Opus 5.5 / 小明的 MacBook / 421648f9」取自提示詞第 6 條的例子。
 *   - 生命週期三格的短句是依提示詞第 8、9、10 條縮寫的；「驗收／完成」那格的 Status
 *     顯示「完成」（第 10 條寫「驗收」或「完成」都可以）。
 *   - 「誰在做這張卡」的標籤是講師的原話（括號裡那句）。
 *   - 預設停在「開發中」，一進頁面就看得到 Agent 欄位被框起來。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 *   步驟列：點階段名稱切換右邊的內容；點右邊的「複製」直接複製那一段並切過去。
 *   內容框頂端「複製第 N 階段」複製目前這一段；標題列「複製完整提示詞」複製全文。
 *   複製成功：按鈕變 teal「已複製」、內容框外框變 teal，2.4 秒後回到原本的樣子；
 *   步驟列的編號換成勾（留到離開這一頁）。clipboard 失敗就退回 execCommand，
 *   再失敗按鈕顯示「複製失敗」。螢幕閱讀器由一個 aria-live 區塊念出結果。
 *   生命週期三格切換卡片狀態。
 *   鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點，
 *   之後按方向鍵、空白鍵照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（強調色只有 acid）
 * ──────────────────────────────────────────────────────────────
 *   acid   目前的階段：步驟列那一列（淡底＋6px 左粗條＋實心編號）、它的「複製」與內容框的
 *          「複製第 N 階段」（實心 CTA）；Agent 欄位：卡片上的 4px 框與「誰在做這張卡」
 *          實心標籤、提示詞第 6 條的左粗條與「一定要有」實心標籤；選到的生命週期格。
 *   teal   「已複製」：實心底＋白字的按鈕、複製過的實心勾、內容框 2px 外框，不靠淡色填色。
 *   其他階段的「複製」與「複製完整提示詞」是中性的外框按鈕（次要）。
 *   淡底（/14）一律配 6px 不透明左粗條或實色框，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768；根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   欄寬：左 minmax(0,1fr) ≈ 936 ／ gap 24 ／ 右 780。
 *   左  標題列 48 ＋ 12 ＋ 主體 660；主體 ＝ 步驟列 300 ／ gap 16 ／ 內容框 ≈ 620。
 *       步驟列：5 列 flex-1（約 107，gap 10）＋ 10 ＋ 課堂示範提示 76。
 *         每列：6px 粗條 ＋ 編號 36 ＋ 名稱 22px／副標 17px（可用約 150）＋ 複製鈕 64 × 64。
 *       內容框（扣邊框 4 ＝ 656）：頂列 72 ＋ 內文 pt 16 ＋ … ＋ pb 20。
 *         最長的「四、規則」：標題含括號兩行 64 ＋ 10 ＋ 6 條（文字寬約 495，20px 一行約
 *         24 個中文字）≈ 13 行 × 30 ＋ 每條 py 8 × 6 ＋ gap 4 × 5 ≈ 460 → 約 640
 *         （2026-11-18 瀏覽器實測：第四階段內文底下還剩約 60）。
 *         第一階段多一段開場（約 3 行），但只有 2 條，比第四階段短。
 *         內文容器 overflow-hidden：超出就會被稽核量到，不會默默推動版面。
 *   右  卡片視窗 522 ＋ 12 ＋ 生命週期 150 ＋ 12 ＋ 說明 24 ＝ 720
 *       視窗內：邊框 4 ＋ 標題列 40 ＋ p-5 40 → 438：卡片標題 36 ＋ 16 ＋ 欄位 3 × 54 ＋ 邊框
 *         ≈ 166 ＋ 16 ＋ 內文標籤 24 ＋ 8 ＋ 2 × 2 格（每格約 82，內容 68）。
 *       生命週期每格約 239 寬：py 24 ＋ 編號列 32 ＋ 6 ＋ 第幾條 21 ＋ 6 ＋ 19px 兩行 52 ≈ 143。
 *   任何互動都不改變外框高度（按鈕寬度固定、換字不推版面；內容框與各列都是固定高的容器）。
 *   浮水印在舞台右上（x 1692–1872、y 104–147）：根容器右上角約 260 × 120 只有
 *   卡片視窗的標題列與欄位列的空白，文字（視窗名稱、卡片標題、欄位值）都靠左；
 *   所有複製鈕都在左欄（右端約在舞台 x 1026），不在整頁右上角。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 選取中的卡片：淡底一定配 6px 不透明左粗條 */
const CARD_ON = 'border-acid border-l-acid bg-acid/14';
const CARD_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** 按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ══════════════════════════════════════════════════════════════
 * 提示詞（講師原文，一字不改）
 * ══════════════════════════════════════════════════════════════ */

type SectionId = 'start' | 'create' | 'fields' | 'rules' | 'demo';

interface PromptItem {
  n: number;
  text: string;
}

interface PromptSection {
  id: SectionId;
  /** 步驟列上的短名 */
  name: string;
  /** 原文的段落標題 */
  heading: string;
  /** 原文標題後面的括號（只有第四段有） */
  note?: string;
  items: readonly PromptItem[];
}

const PROMPT_INTRO =
  '請用 gh CLI 幫我建立一個 GitHub Project，當作多台裝置、多個 AI session 共用的工作看板。每一步做完先跟我回報，再做下一步。';

const PROMPT_SECTIONS: readonly PromptSection[] = [
  {
    id: 'start',
    name: '開始前',
    heading: '一、開始前',
    items: [
      {
        n: 1,
        text: '執行 gh auth status，確認權限有 project。沒有的話，請我自己執行 gh auth refresh -s project，你不要改我的登入設定。',
      },
      { n: 2, text: '問我兩件事：Project 的名稱，以及要連結哪些 repo（owner/repo）。' },
    ],
  },
  {
    id: 'create',
    name: '建立 Project',
    heading: '二、建立 Project',
    items: [
      { n: 3, text: '用 gh project create --owner @me --title "<名稱>" 建立，記下 number 與 id。' },
      { n: 4, text: '用 gh project link 把我給的 repo 一個一個連進來。' },
    ],
  },
  {
    id: 'fields',
    name: '欄位',
    heading: '三、欄位',
    items: [
      {
        n: 5,
        text: 'Status（單選）：預設的選項換成「探索、待開發、開發中、驗收、已上線、完成、凍結」。gh 沒有直接改選項的指令就用 GraphQL；真的改不了就告訴我，我到網頁上改。',
      },
      {
        n: 6,
        text: 'Agent（文字）：誰正在做這張卡。格式是「模型 / 裝置名稱 / session 前 8 碼」，例如「Opus 5.5 / 小明的 MacBook / 421648f9」。裝置名稱用 scutil --get ComputerName（Windows 用 hostname）。',
      },
      { n: 7, text: 'Repo（單選）：每個連結的 repo 一個選項，再加一個「未定」。' },
    ],
  },
  {
    id: 'rules',
    name: '規則',
    heading: '四、規則',
    note: '（寫進 docs/project-board.md，並在 CLAUDE.md 加一行指過去）',
    items: [
      { n: 8, text: '要做什麼從 Project 挑；新的想法先開成一張卡，不在同一個 session 直接做。' },
      {
        n: 9,
        text: '開工：先看哪些卡在「開發中」、Agent 是誰，同一個 repo 有人在改就換一張；挑好後把 Status 改成「開發中」，同時填 Agent。',
      },
      {
        n: 10,
        text: '收尾：Status 改成「驗收」或「完成」，結果寫回卡片內文，Agent 清空（用 --clear，給空字串清不掉）。',
      },
      { n: 11, text: '「開發中」超過兩天沒更新，不要直接接手，先問我。' },
      { n: 12, text: '卡片內文固定寫四段：出處、現況、做法、結果。' },
      { n: 13, text: '把 Project 的 number、id，以及每個欄位與選項的 id 記在文件裡，之後的 session 不用再查。' },
    ],
  },
  {
    id: 'demo',
    name: '示範',
    heading: '五、示範',
    items: [
      { n: 14, text: '建一張示範卡，走一次「開工 → 收尾」，最後給我 Project 網址和所有欄位的 id。' },
    ],
  },
];

/** 一段的原文：段落標題（含括號）一行，之後一條一行 */
function sectionBlock(section: PromptSection) {
  return [`${section.heading}${section.note ?? ''}`, ...section.items.map((item) => `${item.n}. ${item.text}`)].join(
    '\n',
  );
}

/** 複製出去的全文：開場、空一行、五段（段與段之間空一行），跟原文的排法一樣 */
const PROMPT_TEXT = [PROMPT_INTRO, ...PROMPT_SECTIONS.map(sectionBlock)].join('\n\n');

interface Phase extends PromptSection {
  /** 第幾階段（1–5）；用數字不用國字，圓圈裡的「一」看起來像減號 */
  step: number;
  /** 第一階段連開場一起複製 */
  withIntro: boolean;
  /** 步驟列與內容框頂列的副標：這一階段包含哪幾條 */
  range: string;
  /** 這一階段複製出去的文字 */
  copyText: string;
}

/** 五個階段：用空一行串起來就是 PROMPT_TEXT */
const PHASES: readonly Phase[] = PROMPT_SECTIONS.map((section, index) => {
  const first = section.items[0].n;
  const last = section.items[section.items.length - 1].n;
  const items = first === last ? `第 ${first} 條` : `第 ${first}–${last} 條`;
  const withIntro = index === 0;
  return {
    ...section,
    step: index + 1,
    withIntro,
    range: withIntro ? `開場 ＋ ${items}` : items,
    copyText: withIntro ? `${PROMPT_INTRO}\n\n${sectionBlock(section)}` : sectionBlock(section),
  };
});

/** Agent 欄位那一條：講師要求「一定要補上」 */
const AGENT_ITEM = 6;

/* ── 指令與檔名用等寬字（只是排版，複製的文字不變） ─────────── */

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 長的放前面，避免 gh project create … 先被 gh project 之類的短字串切斷 */
const CODE_FRAGMENTS = [
  'gh project create --owner @me --title "<名稱>"',
  'gh auth refresh -s project',
  'scutil --get ComputerName',
  'docs/project-board.md',
  'gh project link',
  'gh auth status',
  'owner/repo',
  'CLAUDE.md',
  'hostname',
  '--clear',
].sort((a, b) => b.length - a.length);

const CODE_PATTERN = new RegExp(`(${CODE_FRAGMENTS.map(escapeRegExp).join('|')})`);

/**
 * 比這長的指令（只有 gh project create 那一串）可以在空白處換行，不然「用」會被單獨留在
 * 上一行；每個字詞各自 nowrap，只會在空白斷開，不會把 "<名稱>" 拆成兩半。
 */
const CODE_WRAP_FROM = 30;

/** split 用了擷取群組，奇數位置就是指令 */
function PromptText({ text }: { text: string }) {
  const parts = text.split(CODE_PATTERN);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className={`rounded-md border border-line-soft bg-ink-soft px-1.5 font-mono text-[0.88em] text-paper ${
              part.length > CODE_WRAP_FROM ? 'box-decoration-clone' : 'whitespace-nowrap'
            }`}
          >
            {part.length > CODE_WRAP_FROM
              ? part.split(' ').map((word, wordIndex) => (
                  <Fragment key={wordIndex}>
                    {wordIndex > 0 && ' '}
                    <span className="whitespace-nowrap">{word}</span>
                  </Fragment>
                ))
              : part}
          </code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/* ── 複製 ─────────────────────────────────────────────────── */

type CopyStatus = 'idle' | 'copied' | 'failed';
type CopyTarget = SectionId | 'all';

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

function CopyIcon({ done, size = 22 }: { done: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {done ? (
        <path d="M4 12.5 9.5 18 20 6.5" />
      ) : (
        <>
          <rect x={8} y={8} width={12} height={12} rx={2.5} />
          <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
        </>
      )}
    </svg>
  );
}

type CopyLook = 'cta' | 'tile' | 'secondary';

/** 三種大小：內容框頂端的 CTA、步驟列的方塊、標題列的次要按鈕；寬度都固定，換字不推版面 */
const COPY_SIZE: Record<CopyLook, string> = {
  cta: 'h-12 w-[232px] gap-2.5 rounded-xl text-[20px]',
  tile: 'size-16 flex-col gap-0.5 rounded-xl text-[16px] leading-tight',
  secondary: 'h-11 w-[214px] gap-2 rounded-xl text-[19px]',
};

function CopyButton({
  look,
  status,
  primary,
  label,
  copiedLabel,
  ariaLabel,
  onCopy,
}: {
  look: CopyLook;
  status: CopyStatus;
  /** 實心 acid（目前這一段）；否則是中性外框 */
  primary: boolean;
  label: string;
  copiedLabel: string;
  ariaLabel?: string;
  onCopy: () => void;
}) {
  const tone =
    status === 'copied'
      ? 'border-teal bg-teal text-on-accent'
      : status === 'failed'
        ? 'border-error bg-panel text-error'
        : primary
          ? 'border-acid bg-acid text-on-accent hover:border-paper'
          : 'border-line bg-panel text-paper hover:border-paper';

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={status === 'failed' ? '瀏覽器擋下了複製，請手動選取文字' : undefined}
      onClick={(event) => {
        onCopy();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex shrink-0 items-center justify-center border-2 font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS_RING} ${COPY_SIZE[look]} ${tone}`}
    >
      <CopyIcon done={status === 'copied'} size={look === 'tile' ? 24 : 22} />
      {status === 'copied' ? copiedLabel : status === 'failed' ? (look === 'tile' ? '失敗' : '複製失敗') : label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 左：提示詞（分階段複製）
 * ══════════════════════════════════════════════════════════════ */

interface CopyFlash {
  target: CopyTarget;
  ok: boolean;
}

function PromptPanel() {
  const [phaseId, setPhaseId] = useState<SectionId>('start');
  /** 剛剛複製的結果，2.4 秒後清掉 */
  const [flash, setFlash] = useState<CopyFlash | null>(null);
  /** 複製過的階段（編號換成勾），離開這一頁才重來 */
  const [copied, setCopied] = useState<ReadonlySet<SectionId>>(() => new Set());

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 2400);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const phase = PHASES.find((item) => item.id === phaseId) ?? PHASES[0];

  function copy(target: CopyTarget) {
    if (target !== 'all') setPhaseId(target);
    const text = target === 'all' ? PROMPT_TEXT : (PHASES.find((item) => item.id === target)?.copyText ?? '');
    void copyText(text).then((ok) => {
      setFlash({ target, ok });
      if (ok && target !== 'all') setCopied((prev) => new Set(prev).add(target));
    });
  }

  const statusOf = (target: CopyTarget): CopyStatus =>
    flash?.target === target ? (flash.ok ? 'copied' : 'failed') : 'idle';

  const flashPhase = flash && flash.target !== 'all' ? PHASES.find((item) => item.id === flash.target) : undefined;
  const announce = !flash
    ? ''
    : `${flash.ok ? '已複製' : '複製失敗：'}${flash.target === 'all' ? '完整提示詞' : `第 ${flashPhase?.step ?? ''} 階段`}`;

  const paneStatus = statusOf(phase.id);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-col gap-3">
      {/* 標題列：完整提示詞降成次要按鈕，在左欄右端（不是整頁右上角） */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={LABEL_FAINT}>提示詞 · 分五階段</span>
        <span className="text-[19px] whitespace-nowrap text-muted">貼一段給 AI，等它回報完再貼下一段</span>
        <span className="ml-auto">
          <CopyButton
            look="secondary"
            status={statusOf('all')}
            primary={false}
            label="複製完整提示詞"
            copiedLabel="已複製全文"
            onCopy={() => copy('all')}
          />
        </span>
      </div>

      {/* 只給螢幕閱讀器：用 clip-path 藏起來（sr-only 的 overflow-hidden 會被溢出稽核誤報） */}
      <span aria-live="polite" className="pointer-events-none absolute size-px whitespace-nowrap [clip-path:inset(50%)]">
        {announce}
      </span>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)] gap-4">
        {/* 步驟列：每一步右邊一顆「複製」 */}
        <div className="flex min-h-0 flex-col gap-2.5">
          <ol aria-label="提示詞的五個階段" className="flex min-h-0 flex-1 flex-col gap-2.5">
            {PHASES.map((item) => {
              const on = item.id === phaseId;
              const done = copied.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`flex min-h-0 flex-1 items-center gap-2 rounded-2xl border border-l-[6px] pr-3 transition-colors duration-200 ${
                    on ? CARD_ON : CARD_OFF
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`第 ${item.step} 階段：${item.name}（${item.range}）${done ? '，已複製過' : ''}`}
                    onClick={(event) => {
                      setPhaseId(item.id);
                      blurAfterClick(event);
                    }}
                    onKeyDown={keepActivationKeys}
                    className={`flex min-w-0 flex-1 items-center gap-3 self-stretch rounded-l-[10px] pl-3 text-left ${FOCUS_RING}`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-[18px] font-semibold ${
                        done
                          ? 'border-teal bg-teal text-on-accent'
                          : on
                            ? 'border-acid bg-acid text-on-accent'
                            : 'border-line text-faint'
                      }`}
                    >
                      {done ? <CopyIcon done size={20} /> : item.step}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span
                        className={`text-[22px] leading-tight whitespace-nowrap text-paper ${on ? 'font-semibold' : ''}`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[17px] leading-tight whitespace-nowrap text-muted">{item.range}</span>
                    </span>
                  </button>
                  <CopyButton
                    look="tile"
                    status={statusOf(item.id)}
                    primary={on}
                    label="複製"
                    copiedLabel="已複製"
                    ariaLabel={`複製第 ${item.step} 階段`}
                    onCopy={() => copy(item.id)}
                  />
                </li>
              );
            })}
          </ol>
          <p className="flex h-[76px] shrink-0 items-center rounded-2xl border border-dashed border-line px-4 text-[19px] leading-7 text-muted">
            課堂示範：先拿一個測試用的 repo 跑一遍
          </p>
        </div>

        {/* 目前這一段：顯示的就是複製出去的原文 */}
        <section
          aria-label={`第 ${phase.step} 階段會複製的內容`}
          className={`flex min-h-0 min-w-0 flex-col rounded-2xl border-2 bg-panel transition-colors duration-200 ${
            paneStatus === 'copied' ? 'border-teal' : 'border-line'
          }`}
        >
          <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-line-soft pr-4 pl-6">
            <span className="text-[24px] font-semibold whitespace-nowrap text-paper">第 {phase.step} 階段</span>
            <span className="text-[19px] whitespace-nowrap text-muted">{phase.range}</span>
            <span className="ml-auto">
              <CopyButton
                look="cta"
                status={paneStatus}
                primary
                label={`複製第 ${phase.step} 階段`}
                copiedLabel={`已複製第 ${phase.step} 階段`}
                onCopy={() => copy(phase.id)}
              />
            </span>
          </div>

          <div key={phase.id} className="slide-enter flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-6 pt-4 pb-5">
            {phase.withIntro && (
              <p className="shrink-0 border-b border-line-soft pb-3 text-[20px] leading-[30px] text-pretty text-paper">
                <PromptText text={PROMPT_INTRO} />
              </p>
            )}
            <p className="shrink-0 leading-8">
              <span className="text-[22px] font-semibold text-paper">{phase.heading}</span>
              {phase.note && (
                <span className="text-[19px] text-muted">
                  <PromptText text={phase.note} />
                </span>
              )}
            </p>
            <ol className="flex shrink-0 flex-col gap-1">
              {phase.items.map((item) => {
                const must = item.n === AGENT_ITEM;
                return (
                  <li
                    key={item.n}
                    className={`flex gap-2.5 rounded-xl border border-l-[6px] px-3 py-1 ${
                      must ? 'border-acid border-l-acid bg-acid/14' : 'border-transparent border-l-transparent'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-right font-mono text-[18px] leading-[30px] text-faint">
                      {item.n}.
                    </span>
                    <span className="min-w-0 text-[20px] leading-[30px] text-pretty text-paper">
                      {must && (
                        <span className="mr-2 inline-block rounded-full border border-acid bg-acid px-2.5 align-[1px] text-[17px] leading-[26px] font-semibold text-on-accent">
                          一定要有
                        </span>
                      )}
                      <PromptText text={item.text} />
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 右：做出來的卡片（介面示意）＋ 生命週期
 * ══════════════════════════════════════════════════════════════ */

type Stage = 'todo' | 'doing' | 'done';

interface StageInfo {
  id: Stage;
  n: number;
  /** 生命週期格上的名稱 */
  status: string;
  /** 卡片 Status 欄位顯示的選項 */
  chip: string;
  /** 動作與對應的提示詞條目 */
  act: string;
  rule: number;
  text: string;
}

const STAGES: readonly StageInfo[] = [
  {
    id: 'todo',
    n: 1,
    status: '待開發',
    chip: '待開發',
    act: '挑卡',
    rule: 8,
    text: '範圍清楚、可以接；Agent 還是空的。',
  },
  {
    id: 'doing',
    n: 2,
    status: '開發中',
    chip: '開發中',
    act: '開工',
    rule: 9,
    text: '先看誰在做，再改 Status、填上 Agent。',
  },
  {
    id: 'done',
    n: 3,
    status: '驗收／完成',
    chip: '完成',
    act: '收尾',
    rule: 10,
    text: '結果寫回內文，Agent 用 --clear 清空。',
  },
];

/** 取自提示詞第 6 條的例子 */
const AGENT_VALUE = 'Opus 5.5 / 小明的 MacBook / 421648f9';

/** 卡片內文四段（提示詞第 12 條）；「結果」在收尾時才寫回 */
const CARD_BODY: readonly { label: string; text: string; done?: string }[] = [
  { label: '出處', text: '課堂示範（第 14 條）' },
  { label: '現況', text: '首頁沒有聯絡方式' },
  { label: '做法', text: '加一個聯絡表單區塊' },
  { label: '結果', text: '收尾時寫回', done: '表單上線，測試送出成功' },
];

function OptionChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-panel-lift px-3.5 text-[17px] whitespace-nowrap text-paper">
      <span aria-hidden="true" className="size-2.5 rounded-full bg-muted" />
      {children}
    </span>
  );
}

function FieldRow({
  name,
  first = false,
  ring = false,
  children,
}: {
  name: string;
  first?: boolean;
  /** 4px acid 框：這一步的重點欄位 */
  ring?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex h-[54px] shrink-0 items-center gap-3 rounded-lg px-4 transition-shadow duration-300 ${
        first ? '' : 'border-t border-line-soft'
      } ${ring ? 'z-10 ring-4 ring-acid' : ''}`}
    >
      <span className="w-[84px] shrink-0 font-mono text-[17px] text-faint">{name}</span>
      {children}
    </div>
  );
}

function AgentValue({ stage }: { stage: Stage }) {
  if (stage === 'doing') {
    return (
      <>
        <span className="font-mono text-[19px] font-semibold whitespace-nowrap text-paper">{AGENT_VALUE}</span>
        <span className="ml-auto shrink-0 rounded-full border-2 border-acid bg-acid px-3 text-[17px] leading-[28px] font-semibold whitespace-nowrap text-on-accent">
          誰在做這張卡
        </span>
      </>
    );
  }
  return (
    <>
      <span className="text-[19px] text-faint">空白</span>
      <span className="ml-auto shrink-0 rounded-full border border-line px-3 text-[17px] leading-[28px] whitespace-nowrap text-muted">
        {stage === 'todo' ? (
          '還沒人接'
        ) : (
          <>
            用 <PromptText text="--clear" /> 清空
          </>
        )}
      </span>
    </>
  );
}

function ProjectCardMock({ stage }: { stage: Stage }) {
  const info = STAGES.find((item) => item.id === stage) ?? STAGES[0];
  const done = stage === 'done';

  return (
    <figure
      aria-label={`GitHub Project 卡片示意：Status ${info.chip}，Agent ${stage === 'doing' ? AGENT_VALUE : '空白'}，Repo my-site`}
      className="flex min-h-0 flex-1 flex-col rounded-2xl border-2 border-line bg-panel"
    >
      {/* 標題列：右半邊刻意留空（浮水印在整頁右上） */}
      <div className="flex h-10 shrink-0 items-center gap-2 rounded-t-[14px] border-b border-line bg-panel-lift px-4">
        {[0, 1, 2].map((dot) => (
          <span key={dot} aria-hidden="true" className="size-3 rounded-full bg-line" />
        ))}
        <span className="ml-3 text-[17px] text-muted">GitHub Project · 小明的網站開發</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <p className="flex h-9 shrink-0 items-center text-[24px] font-semibold text-paper">示範卡：首頁加上聯絡表單</p>

        {/* 欄位：Status · Agent · Repo */}
        <div className="flex shrink-0 flex-col rounded-xl border border-line bg-panel">
          <FieldRow name="Status" first>
            <OptionChip>{info.chip}</OptionChip>
          </FieldRow>
          <FieldRow name="Agent" ring={stage === 'doing'}>
            <AgentValue stage={stage} />
          </FieldRow>
          <FieldRow name="Repo">
            <OptionChip>my-site</OptionChip>
          </FieldRow>
        </div>

        {/* 內文四段 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span className={`${LABEL_FAINT} flex h-6 shrink-0 items-center`}>卡片內文 · 固定四段</span>
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2.5">
            {CARD_BODY.map((part) => {
              const filled = !part.done || done;
              return (
                <div
                  key={part.label}
                  className="flex min-w-0 flex-col justify-center gap-1 rounded-lg border border-line-soft bg-panel-lift px-4"
                >
                  <span className="text-[17px] leading-tight text-faint">{part.label}</span>
                  <span className={`text-[19px] leading-snug ${filled ? 'text-paper' : 'text-faint'}`}>
                    {done && part.done ? part.done : part.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </figure>
  );
}

function StageStepper({ stage, onPick }: { stage: Stage; onPick: (stage: Stage) => void }) {
  return (
    <div
      role="group"
      aria-label="卡片的生命週期"
      className="grid h-[150px] shrink-0 grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)]"
    >
      {STAGES.map((item, index) => {
        const on = item.id === stage;
        return (
          <Fragment key={item.id}>
            {index > 0 && (
              <span aria-hidden="true" className="flex items-center justify-center text-[22px] text-faint">
                →
              </span>
            )}
            <button
              type="button"
              aria-pressed={on}
              onClick={(event) => {
                onPick(item.id);
                blurAfterClick(event);
              }}
              onKeyDown={keepActivationKeys}
              className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border border-l-[6px] px-3.5 py-3 text-left transition-colors duration-200 ${FOCUS_RING} ${
                on ? CARD_ON : CARD_OFF
              }`}
            >
              <span className="flex h-8 shrink-0 items-center gap-2.5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-[17px] ${
                    on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
                  }`}
                >
                  {item.n}
                </span>
                <span className={`text-[22px] leading-tight whitespace-nowrap text-paper ${on ? 'font-semibold' : ''}`}>
                  {item.status}
                </span>
              </span>
              <span className={`text-[17px] leading-tight ${on ? 'text-paper' : 'text-faint'}`}>
                {item.act} · 提示詞第 {item.rule} 條
              </span>
              <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
                <PromptText text={item.text} />
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 46 頁 · PracticeProjectPromptDemo
 * ══════════════════════════════════════════════════════════════ */

export function PracticeProjectPromptDemo() {
  /** 預設停在「開發中」：一進頁面就看得到 Agent 欄位被框起來 */
  const [stage, setStage] = useState<Stage>('doing');

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[minmax(0,1fr)_780px] gap-6">
      <PromptPanel />

      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <ProjectCardMock stage={stage} />
        <StageStepper stage={stage} onPick={setStage} />
        <p className="flex h-6 shrink-0 items-center text-[17px] whitespace-nowrap text-faint">
          介面示意：以講師的「casper.tw 開發」（上一頁）為範本，實際畫面以 GitHub 為準
        </p>
      </div>
    </div>
  );
}
