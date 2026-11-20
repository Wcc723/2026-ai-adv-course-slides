import { Fragment, useEffect, useState, type KeyboardEvent } from 'react';
import coddNotesUrl from './images/codd-notes.webp';

/* ══════════════════════════════════════════════════════════════
 * 第 32 頁的範例連結 —— 主持人填這裡
 *
 * 四張卡片（Slides、Design、Dashboards、Motion）的範例由主持人另外用 Claude 產生，
 * 產生後把網址貼進對應的欄位即可，不用改其他地方：
 *   - 空字串：卡片下方顯示「範例連結待補」，不能點
 *   - 有網址：變成藍色的連結卡，在新分頁打開
 * 用 Record 而不是 `as const`：`as const` 會把型別鎖成空字串 ''，填上網址後
 * 型別跟著變，沒有好處。
 * ══════════════════════════════════════════════════════════════ */

type StudioId = 'slides' | 'design' | 'dashboards' | 'motion';

const STUDIO_EXAMPLES: Record<StudioId, string> = {
  slides: 'https://claude.ai/artifact/HGBAaqho4f2akmiJkNAsqr',
  design: 'https://claude.ai/artifact/EubgA3p47uRhmUxiNB2sgq',
  dashboards: 'https://claude.ai/artifact/XtMRMPYEWzCKjfupAhmuFb',
  motion: 'https://claude.ai/artifact/ERA8ABNQz9CbZ5Ev1ccUr1',
};

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：Claude、CODD
 *
 *   第 31 頁  ArtifactDemo      互動式 Artifact（withVote → 根容器 640）
 *   第 32 頁  StudioDemo        Slides、Design、Dashboards、Motion（withVote → 640）
 *   第 43 頁  CoddDemo          CODD：我自己開發的工具（withVote → 640）
 *   （Environments 在 demos-environments.tsx／demos-environments-try.tsx（第 33–34 頁）；
 *    CODD 前一頁是第 42 頁的作業靈感 demos-extension-apps.tsx，再前面是第 41 頁的社群工具
 *    demos-community-tools.tsx。）
 *
 * 2026-11-18 講師 CODD 筆記「簡報調整」（codd://note/note-plus）：「實戰：ChatGPT 系列與
 * 混合使用」「這頁幫我移除，目前跟上下文比較沒有關係」→ MixDemo 連同只有它用到的
 * 資料（MIX_USES、BRANCHES）、圖（MixDiagram 等）、播放器（usePlayer、PlayerControls）
 * 與按鈕樣式（BTN_*）一起刪掉。頁碼同時改成 47 頁版（Artifact 29 → 31、CODD 37 → 42）。
 * 2026-11-19 刪掉 Environments 的第 34 頁（47 → 46 頁），CODD 一度變成第 41 頁；
 * 同一天又在第 34 頁後補了情境頁（46 → 47 頁），CODD 回到第 42 頁。
 * 2026-11-20 在第 41 頁後補了作業靈感頁（47 → 48 頁），CODD 變成第 43 頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：Notion「課綱 › ChatGPT vs Claude」（2026-11-10 讀取）
 *   https://app.notion.com/p/4136ab47eb48805290aee58fed3a6076
 * 以及講師的 CODD 筆記「簡報調整」（codd://note/note-xcra，2026-11-10 17:17）
 * ──────────────────────────────────────────────────────────────
 * 第 31 頁  callout「獨特的能力 - Claude／互動式 Artifact」。左欄的三段話是原文，
 *           只把「除了先前所提到生成式 AI…」斷成逗號；兩張範例連結照原文的網址
 *           （包水餃遊戲的網址保留 #page-… 錨點，畫面上只顯示到 id）。
 * 第 32 頁  callout「Slides、Design、Dashboards、Motion」：「這些功能說實在我也沒用過，
 *           所以我希望你幫我生成相關的範例…生成完之後，你再把這個連結放進來」。
 *           前半句放進右下的卡片；後半句就是最上方的 STUDIO_EXAMPLES。
 * 第 43 頁  callout「CODD 我自己開發的工具」的特色清單，五項照原文分成五個選項。
 *           視覺複製自第四堂課 src/class4/AI 協作進階/demos-codd.tsx（不 import）。
 *           第 4 項依筆記改成「內部文件管理」，右邊換成講師 CODD 的實際畫面
 *           （images/codd-notes.webp，筆記裡附的截圖）。
 *           Claude 系列與跨裝置流程在 demos-practice.tsx（第 44–46 頁）。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-10）
 * ──────────────────────────────────────────────────────────────
 * Artifact 類型與方案
 *   https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
 *     Slides「Presentations built from your notes, reports, or the work already in your chat.」
 *     Design「Visuals, mockups, prototypes, one-pagers, and landing pages, built with your design system.」
 *     Dashboards (beta)「Dashboards built from your data platforms or connected apps, like Salesforce.」
 *     Motion (beta)「Animated explainers, charts, and walkthroughs built from your content.」
 *     Docs／Slides／Design 所有方案；Dashboards beta 在 Pro、Max、Ultra、Team、Enterprise；
 *     Motion beta 只在 Team、Enterprise。persistent storage（個人／共用）在 Pro 以上。
 *   2026-11-17 重查 https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them
 *     範本改名「Data」（說明「Dashboards, data stories, narrated short videos…」），沒有 beta 標記；
 *     「The Data template is available on Pro, Max, Ultra, Team, and Enterprise plans.」
 *     → 卡片名稱照講師的標題留「Dashboards」，方案標籤改成「付費方案 · 範本叫 Data」，
 *       跟第 11 頁 Output 選單畫的 Docs／Slides／Design／Data 對得上。改名的確切日期沒查到。
 *   https://claude.com/resources/articles/dashboards-and-motion（2026-10-08 發布）
 *     Dashboards「a dashboard that stays current」、點任一個數字看得到它的查詢；
 *     Motion 是程式寫的動畫，文字、數字、時間點都能改，匯出 MP4，訊息框輸入 /motion；
 *     官方的 Dashboards 範例句「Build a dashboard of this quarter's revenue by region.」
 *   https://code.claude.com/docs/en/artifacts
 *     Slides／Design／Docs 是 claude.ai 上的範本，可匯出 PowerPoint、PDF 等；
 *     Claude Code 有 /slides、/design；Design 的每個畫板可匯出 PNG、PDF。
 *     Artifact 把結果帶回 Claude 的官方寫法有兩種：頁面上的「Copy as prompt」按鈕、
 *     以及分享後的留言（Send to Claude）。
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（文件沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 第 31 頁：四種情境（重構方案、開場音樂、寫文章前的三題、登入頁三個版本）、
 *     對話裡的每一句、「② Claude 讀到」的內容與 Claude 的回覆都是編的。
 *     「互動 → Claude 讀得到 → 一起做決定」是依講師那段話畫的；官方文件沒有寫
 *     Claude 怎麼讀到這些互動（見回報的待確認）。
 *   - 第 32 頁：四張縮圖是 JSX 畫的示意；四句提示詞是補的（Dashboards 那句改寫自官方範例）。
 *   - 第 43 頁：三個 session、資料夾、文件、三個帳號、所有數字都是虛構的。
 *     「切換帳號後，USAGE 換成那個帳號的剩餘用量」是示意；Notion 只寫了兩項功能本身。
 *     「內部文件管理」的三個放大區域與說明（收件匣、AI 可讀權限、版本紀錄）是照截圖寫的。
 *     介面示意裡 class5 那個 session 的「第 31 頁」指本簡報的 Artifact 頁（2026-11-18 起的頁碼）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁最多兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 31 頁  acid 目前情境、選到的選項、「② Claude 讀到」；blue 兩張範例連結卡
 *   第 32 頁  acid 選到的卡片、動起來的縮圖元素、提示詞卡；blue 範例連結
 *   第 43 頁  acid 選單、介面示意上的外框、實際畫面縮圖上選到的區域；
 *             amber WAITING 與快用完的額度（同第四堂課）
 *   淡底（/14）一律配 6px 不透明左粗條或實色外框，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；withVote 的頁面根容器上限 640）
 * ──────────────────────────────────────────────────────────────
 * 第 31 頁 640：左欄 560 ＝ 心得卡 flex-1（內容最多約 393）＋ 14 ＋ 連結卡 100 × 2 ＋ 14。
 *   右欄 1148 ＝ 情境列 52 ＋ 16 ＋ 介面示意 572（標題列 52 ＋ 內容 516）。
 *   對話欄 400：問句 ≤ 74 ＋ 一行 52 ＋ 讀到 ≤ 140 ＋ 回覆 ≤ 132 ＋ gap 36 ≈ 434 ≤ 476。
 *   Artifact 欄：步驟標籤＋問題 59 ＋ 16 ＋ 內容（最高是決策 3 × 104 ＋ 24 ＝ 336）≈ 411 ≤ 468。
 * 第 32 頁 640：卡片列 452（縮圖 160 ＋ 名稱 38 ＋ 說明 ≤ 90 ＋ 補充 25 ＋ 連結 68 ＋ 間距 ≈ 431）
 *   ＋ 16 ＋ 下排 172（提示詞卡約 111；講師卡約 133）。
 * 第 43 頁 640：左欄五個選項各 120。右卡 ＝ 外框 2 ＋ py 40 ＋ 標題列 48 ＋ 12 ＋ 介面示意 466
 *   ＋ 12 ＋ 說明 56 ＝ 636（留 4）。
 *   側欄（內高 462）＝ py 16 ＋ 品牌列 32 ＋ 6 ＋ session 區 216 ＋ HOST 102 ＋ 4 ＋ USAGE 78 ＝ 454。
 *   主區終端機內容高 310，行高 25.2：最多是 WAITING 的四行＋確認框＋插入文件兩行 ≈ 299。
 *   「內部文件管理」的實際畫面同樣 466：左欄縮圖 197 ＋ 10 ＋ 三個區域 76 × 3 ＋ 8 × 2 ＝ 451；
 *   右邊放大區外框 776 × 466，放大倍率 ＝ min(772 ÷ 區域寬, 462 ÷ 區域高) ≈ 1.33～1.35。
 * 任何互動都不改變外框高度；可能變長的字一律 nowrap ＋ truncate，沒有容器會捲動。
 * 浮水印在舞台右上（top 104、right 48、180 × 43），落在 Panel 的外框與內距上；
 * 各頁根容器的右上角仍只放裝飾（縮圖角落、空白），不放按鈕與重點文字。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自第四堂課的 demos-codd.tsx，不 import）──────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const CHIP =
  'inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-panel px-3 text-[16px] whitespace-nowrap text-muted';

/** 選取中的卡片：淡底一定配 6px 不透明左粗條 */
const CARD_ON = 'border-acid border-l-acid bg-acid/14';
const CARD_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 複製（clipboard 失敗就退回 execCommand）──────────────── */

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 往下走退路 */
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

function useCopy(): [CopyStatus, (text: string) => void] {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = (text: string) => {
    void copyText(text).then((ok) => setStatus(ok ? 'copied' : 'failed'));
  };

  return [status, copy];
}

/** 左側選單的一列（同第四堂課的 MenuItem，撐滿高度） */
function MenuItem({
  index,
  name,
  sub,
  on,
  onClick,
  mono = false,
}: {
  index: number;
  name: string;
  sub: string;
  on: boolean;
  onClick: () => void;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-2 text-left transition-colors duration-200 ${
        on ? CARD_ON : CARD_OFF
      }`}
    >
      <span
        className={`${STEP_BADGE} ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span
          className={`leading-tight whitespace-nowrap text-paper ${mono ? 'font-mono text-[25px]' : 'text-[27px]'} ${
            on ? 'font-semibold' : ''
          }`}
        >
          {name}
        </span>
        <span
          className={`text-[19px] leading-snug whitespace-nowrap ${on ? 'text-paper' : 'text-muted'}`}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 31 頁 ArtifactDemo — 互動式 Artifact
 *
 *   左  講師的心得（原文三段）＋「① 互動 → ② Claude 讀得到 → ③ 一起做決定」
 *       ＋ 兩張範例連結卡（blue）。
 *   右  上排四個情境＝講師說的「決策、音樂選擇、選項的回答、設計稿的回覆」。
 *       下面是一個 Claude 視窗的示意：左邊對話、右邊 Artifact。
 *       在 Artifact 上點任何選項，左邊的「② Claude 讀到」與「③ 一起做決定」立刻跟著變。
 * ══════════════════════════════════════════════════════════════ */

type ScenarioId = 'decide' | 'music' | 'quiz' | 'design';

interface Choice {
  id: string;
  label: string;
  badge?: string;
  note?: string;
  time?: string;
}

interface Question {
  id: string;
  /** 「② Claude 讀到」左邊那一欄 */
  key: string;
  label: string;
  options: readonly Choice[];
}

type Picks = Readonly<Record<string, string>>;

interface Scenario {
  id: ScenarioId;
  tab: string;
  title: string;
  ask: string;
  prompt: string;
  questions: readonly Question[];
  reply: (pick: (questionId: string) => Choice) => string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    id: 'decide',
    tab: '決策',
    title: '重構方案比較',
    ask: '幫我把三個重構方案，做成可以選的頁面',
    prompt: '這次重構，先做哪一個？',
    questions: [
      {
        id: 'plan',
        key: '方案',
        label: '方案',
        options: [
          {
            id: 'a',
            badge: 'A',
            label: '先補測試，再重構',
            note: '最穩，但要多花兩天',
          },
          {
            id: 'b',
            badge: 'B',
            label: '邊重構邊補測試',
            note: '比較快，review 會比較累',
          },
          {
            id: 'c',
            badge: 'C',
            label: '先拆成幾個小 PR',
            note: '最好 review，總時間最長',
          },
        ],
      },
    ],
    reply: (pick) => {
      const plan = pick('plan').id;
      if (plan === 'a') return '好，就先補測試。我先列出還沒有測試的模組給你看。';
      if (plan === 'b') return '好，邊重構邊補測試：每改完一個模組，就補上它的測試。';
      return '好，先拆成小 PR。我先排好拆分的順序，你確認再動手。';
    },
  },
  {
    id: 'music',
    tab: '音樂選擇',
    title: '直播開場音樂',
    ask: '開場音樂挑三首，做成頁面給我選',
    prompt: '直播開場要用哪一首？',
    questions: [
      {
        id: 'track',
        key: '開場音樂',
        label: '開場音樂',
        options: [
          {
            id: 'piano',
            label: 'Lo-fi 鋼琴',
            note: '安靜，適合等人進場',
            time: '0:42',
          },
          {
            id: 'synth',
            label: '輕快電子',
            note: '節奏感強，比較有精神',
            time: '0:38',
          },
          {
            id: 'guitar',
            label: '木吉他',
            note: '溫暖，像在聊天',
            time: '0:45',
          },
        ],
      },
    ],
    reply: (pick) => `好，開場就用「${pick('track').label}」。我把它排進直播流程表，放在倒數之後。`,
  },
  {
    id: 'quiz',
    tab: '選項的回答',
    title: '寫文章前的三個問題',
    ask: '寫之前先問我幾個問題，做成選項',
    prompt: '回答這三題，我再開始寫',
    questions: [
      {
        id: 'reader',
        key: '讀者',
        label: '這篇寫給誰看？',
        options: [
          { id: 'new', label: '剛入門的新手' },
          { id: 'pro', label: '有經驗的工程師' },
        ],
      },
      {
        id: 'length',
        key: '篇幅',
        label: '要寫多長？',
        options: [
          { id: 'short', label: '800 字左右' },
          { id: 'long', label: '2000 字以上' },
        ],
      },
      {
        id: 'tone',
        key: '語氣',
        label: '語氣呢？',
        options: [
          { id: 'casual', label: '輕鬆口語' },
          { id: 'formal', label: '正式' },
        ],
      },
    ],
    reply: (pick) =>
      `了解：寫給${pick('reader').label}、${pick('length').label}、${pick('tone').label}。我先列大綱給你確認。`,
  },
  {
    id: 'design',
    tab: '設計稿的回覆',
    title: '登入頁設計稿',
    ask: '登入頁做三個版本，讓我選一個',
    prompt: '選一個版本，再留一句話',
    questions: [
      {
        id: 'layout',
        key: '版本',
        label: '版本',
        options: [
          { id: 'a', badge: 'A', label: '置中卡片' },
          { id: 'b', badge: 'B', label: '左右分欄' },
          { id: 'c', badge: 'C', label: '滿版背景' },
        ],
      },
      {
        id: 'note',
        key: '留言',
        label: '留一句話給 Claude',
        options: [
          { id: 'title', label: '標題再大一點' },
          { id: 'button', label: '按鈕改成實心' },
          { id: 'ok', label: '照這樣就好' },
        ],
      },
    ],
    reply: (pick) => {
      const layout = pick('layout');
      const note = pick('note');
      if (note.id === 'ok') return `好，就用 ${layout.badge} 版「${layout.label}」，不用再改。`;
      return `好，用 ${layout.badge} 版「${layout.label}」，${note.label}，改好再給你看一次。`;
    },
  },
];

const INITIAL_PICKS: Record<ScenarioId, Picks> = {
  decide: { plan: 'a' },
  music: { track: 'guitar' },
  quiz: { reader: 'new', length: 'short', tone: 'casual' },
  design: { layout: 'b', note: 'button' },
};

function choiceOf(scenario: Scenario, picks: Picks, questionId: string): Choice {
  const question =
    scenario.questions.find((item) => item.id === questionId) ?? scenario.questions[0];
  return question.options.find((option) => option.id === picks[questionId]) ?? question.options[0];
}

function choiceText(choice: Choice) {
  const badge = choice.badge ? `${choice.badge} ` : '';
  const time = choice.time ? `（${choice.time}）` : '';
  return `${badge}${choice.label}${time}`;
}

const ARTIFACT_EXAMPLES: readonly {
  name: string;
  href: string;
  shown: string;
}[] = [
  {
    name: '包水餃遊戲',
    href: 'https://claude.ai/artifact/M8Mx8beDfBVpB9vcpQijn2#page-dcb81aee8d83',
    shown: 'claude.ai/artifact/M8Mx8beDfBVpB9vcpQijn2',
  },
  {
    name: '垃圾車語音',
    href: 'https://claude.ai/artifact/TJhzTvuyK5NyHuTLpfpUWE',
    shown: 'claude.ai/artifact/TJhzTvuyK5NyHuTLpfpUWE',
  },
];

/** 三首曲子的假波形（固定值，不用亂數） */
const WAVES: readonly (readonly number[])[] = [
  [14, 22, 30, 18, 26, 38, 24, 16, 30, 42, 28, 20, 34, 24, 14, 26, 36, 22, 18, 30, 40, 26, 16, 22],
  [30, 40, 22, 44, 26, 38, 18, 42, 30, 24, 44, 20, 36, 28, 40, 22, 44, 30, 26, 38, 20, 42, 28, 34],
  [18, 24, 20, 30, 26, 22, 34, 28, 20, 26, 32, 24, 18, 28, 36, 26, 22, 30, 24, 20, 28, 34, 26, 18],
];

type PickHandler = (questionId: string, optionId: string) => void;

/** 決策：三張方案卡（3 × 104 ＋ 2 × 12 ＝ 336） */
function DecideBody({
  question,
  picks,
  onPick,
}: {
  question: Question;
  picks: Picks;
  onPick: PickHandler;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option) => {
        const on = picks[question.id] === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(question.id, option.id)}
            className={`flex h-[104px] shrink-0 items-center gap-5 rounded-xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
              on ? CARD_ON : 'border-line border-l-line bg-panel hover:border-acid'
            }`}
          >
            <span
              className={`${STEP_BADGE} ${on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'}`}
            >
              {option.badge}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className={`text-[24px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
                {option.label}
              </span>
              <span className="text-[19px] leading-snug text-muted">{option.note}</span>
            </span>
            {on && (
              <span className="ml-auto shrink-0 text-[19px] font-semibold text-acid">✓ 已選</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 音樂選擇：三首曲子（3 × 100 ＋ 2 × 12 ＝ 324） */
function MusicBody({
  question,
  picks,
  onPick,
}: {
  question: Question;
  picks: Picks;
  onPick: PickHandler;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option, index) => {
        const on = picks[question.id] === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(question.id, option.id)}
            className={`flex h-[100px] shrink-0 items-center gap-5 rounded-xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
              on ? CARD_ON : 'border-line border-l-line bg-panel hover:border-acid'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-[18px] ${
                on ? 'border-acid bg-acid text-on-accent' : 'border-line text-paper'
              }`}
            >
              ▶
            </span>
            <span className="flex w-[200px] shrink-0 flex-col gap-1">
              <span className={`text-[24px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
                {option.label}
              </span>
              <span className="text-[18px] leading-snug whitespace-nowrap text-muted">
                {option.note}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-12 min-w-0 flex-1 items-center gap-[5px] overflow-hidden"
            >
              {WAVES[index % WAVES.length].map((height, bar) => (
                <span
                  key={bar}
                  className={`w-[6px] shrink-0 rounded-full transition-colors duration-200 ${on ? 'bg-acid' : 'bg-line'}`}
                  style={{ height }}
                />
              ))}
            </span>
            <span className="shrink-0 font-mono text-[19px] text-muted">{option.time}</span>
          </button>
        );
      })}
    </div>
  );
}

/** 選項的回答：三題，每題兩個選項（3 × 90 ＋ 2 × 20 ＝ 310） */
function QuizBody({
  questions,
  picks,
  onPick,
}: {
  questions: readonly Question[];
  picks: Picks;
  onPick: PickHandler;
}) {
  return (
    <div className="flex flex-col gap-5">
      {questions.map((question, index) => (
        <div key={question.id} className="flex flex-col gap-2">
          <span className="text-[21px] leading-snug text-paper">
            <span className="mr-2 font-mono text-faint">Q{index + 1}</span>
            {question.label}
          </span>
          <div className="flex gap-3">
            {question.options.map((option) => {
              const on = picks[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPick(question.id, option.id)}
                  className={`h-[52px] rounded-xl border-2 px-6 text-[21px] whitespace-nowrap transition-colors duration-200 ${
                    on
                      ? 'border-acid bg-acid font-semibold text-on-accent'
                      : 'border-line bg-panel text-paper hover:border-acid'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 登入頁的三種版型縮圖（純裝飾，全是中性色） */
function LoginThumb({ variant }: { variant: string }) {
  const form = (
    <span className="flex w-[84px] flex-col gap-1.5">
      <span className="h-2.5 w-3/4 rounded-full bg-paper" />
      <span className="h-3 rounded border border-line bg-panel" />
      <span className="h-3 rounded border border-line bg-panel" />
      <span className="h-3.5 rounded bg-muted" />
    </span>
  );

  if (variant === 'a') {
    return (
      <span className="flex h-full items-center justify-center bg-ink-soft">
        <span className="rounded-md border border-line bg-panel p-3">{form}</span>
      </span>
    );
  }
  if (variant === 'b') {
    return (
      <span className="grid h-full grid-cols-2 bg-panel">
        <span className="flex items-center justify-center bg-line-soft">
          <span className="size-12 rounded-full border-2 border-muted" />
        </span>
        <span className="flex items-center justify-center">{form}</span>
      </span>
    );
  }
  return (
    <span className="relative flex h-full items-center bg-line-soft px-5">
      <span className="absolute top-4 right-6 size-16 rounded-full border-2 border-muted" />
      <span className="absolute right-16 bottom-3 size-8 rounded-full border-2 border-muted" />
      <span className="relative rounded-md border border-line bg-panel p-3">{form}</span>
    </span>
  );
}

/** 設計稿的回覆：三張縮圖＋三句留言（150 ＋ 8 ＋ 30 ＋ 20 ＋ 28 ＋ 8 ＋ 48 ≈ 292） */
function DesignBody({
  questions,
  picks,
  onPick,
}: {
  questions: readonly Question[];
  picks: Picks;
  onPick: PickHandler;
}) {
  const [layout, note] = questions;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        {layout.options.map((option) => {
          const on = picks[layout.id] === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(layout.id, option.id)}
              className="group flex min-w-0 flex-col gap-2 text-left"
            >
              <span
                className={`block h-[150px] overflow-hidden rounded-lg border-[3px] transition-colors duration-200 ${
                  on ? 'border-acid' : 'border-line group-hover:border-muted'
                }`}
              >
                <LoginThumb variant={option.id} />
              </span>
              <span className="flex items-center gap-2 text-[20px] leading-tight text-paper">
                <span
                  className={`flex size-7 items-center justify-center rounded-full border font-mono text-[16px] ${
                    on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
                  }`}
                >
                  {option.badge}
                </span>
                <span className={on ? 'font-semibold' : ''}>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[19px] leading-snug text-muted">{note.label}</span>
        <div className="flex gap-3">
          {note.options.map((option) => {
            const on = picks[note.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => onPick(note.id, option.id)}
                className={`h-12 rounded-full border-2 px-5 text-[20px] whitespace-nowrap transition-colors duration-200 ${
                  on
                    ? 'border-acid bg-acid font-semibold text-on-accent'
                    : 'border-line bg-panel text-paper hover:border-acid'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArtifactBody({
  scenario,
  picks,
  onPick,
}: {
  scenario: Scenario;
  picks: Picks;
  onPick: PickHandler;
}) {
  if (scenario.id === 'decide')
    return <DecideBody question={scenario.questions[0]} picks={picks} onPick={onPick} />;
  if (scenario.id === 'music')
    return <MusicBody question={scenario.questions[0]} picks={picks} onPick={onPick} />;
  if (scenario.id === 'quiz')
    return <QuizBody questions={scenario.questions} picks={picks} onPick={onPick} />;
  return <DesignBody questions={scenario.questions} picks={picks} onPick={onPick} />;
}

const FLOW_STEPS = ['① 互動', '② Claude 讀得到', '③ 一起做決定'] as const;

export function ArtifactDemo() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('decide');
  const [allPicks, setAllPicks] = useState<Record<ScenarioId, Picks>>(INITIAL_PICKS);

  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
  const picks = allPicks[scenario.id];
  const pick = (questionId: string) => choiceOf(scenario, picks, questionId);
  const readKey = `${scenario.id}-${scenario.questions.map((question) => picks[question.id]).join('-')}`;

  const onPick: PickHandler = (questionId, optionId) =>
    setAllPicks((prev) => ({
      ...prev,
      [scenario.id]: { ...prev[scenario.id], [questionId]: optionId },
    }));

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[560px_1fr] gap-8">
      {/* ── 左：講師的心得＋範例連結 ─────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3.5">
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6 py-5">
          <span className={LABEL_FAINT}>卡斯伯的使用心得</span>
          <p className="text-[22px] leading-snug font-semibold text-paper">
            Claude 的 Artifact 是一個我非常喜歡的功能。
          </p>
          <p className="text-[20px] leading-[1.55] text-paper">
            除了先前所提到，生成式 AI 可以提供文件給你看之外，Artifact
            可以產生互動式文件：它可以像網站一樣讓你在上面互動，而
            <span className="font-semibold text-acid">這些互動內容 Claude 都可以直接讀取</span>。
          </p>
          <p className="text-[20px] leading-[1.55] text-muted">
            所以在做一些決策，或者像是音樂選擇、選項的回答，甚至是設計稿的回覆，我都會在互動式
            Artifact 上面進行。
          </p>
          <div className="mt-auto flex items-center gap-2 pt-1">
            {FLOW_STEPS.map((label, index) => (
              <Fragment key={label}>
                {index > 0 && (
                  <span aria-hidden="true" className="text-[18px] text-faint">
                    →
                  </span>
                )}
                <span className="flex h-9 items-center rounded-full border border-line bg-panel px-3 text-[18px] whitespace-nowrap text-paper">
                  {label}
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        {ARTIFACT_EXAMPLES.map((example, index) => (
          <a
            key={example.href}
            href={example.href}
            target="_blank"
            rel="noreferrer"
            className="group flex h-[100px] shrink-0 flex-col justify-center gap-1 rounded-2xl border border-l-[6px] border-blue/55 border-l-blue bg-panel px-6 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
          >
            <span className={`${LABEL_TYPE} text-blue`}>講師的範例 · {pad2(index + 1)}</span>
            <span className="flex items-center justify-between gap-4">
              <span className="text-[26px] leading-tight font-semibold text-paper">
                {example.name}
              </span>
              <span
                aria-hidden="true"
                className="text-[22px] text-blue transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </span>
            <span className="font-mono text-[17px] whitespace-nowrap text-blue underline decoration-blue/55 underline-offset-4">
              {example.shown}
            </span>
          </a>
        ))}
      </div>

      {/* ── 右：情境＋Claude 視窗示意 ───────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <div className="flex h-[52px] shrink-0 items-center gap-3">
          <span className={`${LABEL_FAINT} mr-1`}>使用情境</span>
          {SCENARIOS.map((item) => {
            const on = item.id === scenario.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setScenarioId(item.id)}
                className={`h-[52px] rounded-xl border px-5 text-[21px] whitespace-nowrap transition-colors duration-200 ${
                  on
                    ? 'border-acid bg-acid font-semibold text-on-accent'
                    : 'border-line bg-panel-lift text-paper hover:border-acid'
                }`}
              >
                {item.tab}
              </button>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[400px_1fr] overflow-hidden rounded-2xl border-2 border-line bg-panel">
          {/* 對話 */}
          <div className="flex min-h-0 flex-col border-r border-line bg-panel-lift">
            <div className="flex h-[52px] shrink-0 items-center border-b border-line px-5">
              <span className={LABEL_FAINT}>對話</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
              <p className="max-w-[300px] self-end rounded-2xl rounded-br-md border border-line bg-panel px-4 py-2.5 text-[19px] leading-snug break-keep text-paper">
                {scenario.ask}
              </p>
              <p className="text-[18px] leading-snug text-muted">
                <span className="mr-2 font-semibold text-paper">Claude</span>
                做好了，在右邊選；選完我讀得到。
              </p>
              <div
                key={readKey}
                className="slide-enter flex flex-col gap-1.5 rounded-xl border border-l-[6px] border-acid/55 border-l-acid bg-panel px-4 py-3"
              >
                <span className={`${LABEL_TYPE} text-acid`}>② Claude 讀得到</span>
                <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-[19px] leading-snug">
                  {scenario.questions.map((question) => (
                    <Fragment key={question.id}>
                      <span className="text-muted">{question.key}</span>
                      <span className="font-semibold text-paper">
                        {choiceText(pick(question.id))}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div
                key={`${readKey}-reply`}
                className="slide-enter flex flex-col gap-1.5 rounded-xl border border-line bg-panel px-4 py-3"
              >
                <span className={LABEL_FAINT}>③ 一起做決定</span>
                <p className="text-[19px] leading-snug text-paper">
                  <span className="mr-2 font-semibold">Claude</span>
                  {scenario.reply(pick)}
                </p>
              </div>
            </div>
          </div>

          {/* Artifact */}
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line px-6">
              <span className={LABEL_FAINT}>Artifact</span>
              <span className="text-[22px] leading-tight font-semibold whitespace-nowrap text-paper">
                {scenario.title}
              </span>
              <span className={CHIP}>示意畫面</span>
            </div>
            <div key={scenario.id} className="slide-enter flex min-h-0 flex-1 flex-col gap-4 p-6">
              <div className="flex flex-col gap-1">
                <span className={`${LABEL_TYPE} text-acid`}>① 互動：在 Artifact 上點選</span>
                <h3 className="text-[26px] leading-tight font-semibold text-paper">
                  {scenario.prompt}
                </h3>
              </div>
              <ArtifactBody scenario={scenario} picks={picks} onPick={onPick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 32 頁 StudioDemo — Slides、Design、Dashboards、Motion
 *
 *   上排  四張卡：縮圖（JSX 畫的示意）、名稱＋方案、官方的一句話、補充、範例連結。
 *         點一張卡就選它，它的縮圖開始動（換頁／移動選取框／資料更新／播放）。
 *   下排  左：選到那張的「試試這句提示詞」＋複製＋怎麼開始。右：講師的那句話。
 * ══════════════════════════════════════════════════════════════ */

interface Studio {
  id: StudioId;
  name: string;
  plan: string;
  desc: string;
  detail: string;
  prompt: string;
  start: string;
}

const STUDIOS: readonly Studio[] = [
  {
    id: 'slides',
    name: 'Slides',
    plan: '所有方案',
    desc: '把你的筆記、報告，或對話裡已經有的內容，做成一份簡報。',
    detail: '可以匯出 PowerPoint、PDF',
    prompt: '把〈ChatGPT vs Claude〉這堂課的大綱做成 8 頁簡報，給工程師看，一頁一個重點。',
    start: '在對話裡直接描述；Claude Code 也可以輸入 /slides 加一句簡介',
  },
  {
    id: 'design',
    name: 'Design',
    plan: '所有方案',
    desc: '視覺稿、mockup、prototype、一頁式文件、landing page，套用你的 design system。',
    detail: '每個畫板可以匯出 PNG、PDF',
    prompt: '幫課程報名頁做一版 landing page 設計稿，桌機、手機各一個畫板。',
    start: '在對話裡直接描述；Claude Code 也可以輸入 /design 加一句簡介',
  },
  {
    id: 'dashboards',
    // 名稱照講師的標題留 Dashboards；官方範本 2026-11-17 已改名 Data、不標 beta（見檔頭）。
    // 選中時名稱變 semibold，名稱＋晶片這一列只剩約 6px（Avenir Next 實測），晶片不要再加字
    name: 'Dashboards',
    plan: '付費方案 · 範本叫 Data',
    desc: '從資料平台或連接的 App（例如 Salesforce）抓資料做成儀表板，資料變了會跟著更新。',
    detail: '點任一個數字，看得到它背後的查詢',
    prompt: '做一個儀表板：這一季各地區的營收。',
    start: '用一句話描述要看的資料；資料來自你連接的 App 或資料平台',
  },
  {
    id: 'motion',
    name: 'Motion',
    plan: 'Beta · Team／Enterprise',
    desc: '把你的內容做成動畫：說明動畫、圖表、操作導覽；文字、數字、時間點都能再改。',
    detail: '可以匯出 MP4',
    prompt: '把「互動式 Artifact 怎麼運作」做成 30 秒的動畫說明。',
    start: '在 Claude 的訊息框輸入 /motion',
  },
];

/* ── 四張縮圖（內寬約 368 × 158，全是中性色；只有選到的那張用 acid） ── */

function SlidesThumb({ on, tick }: { on: boolean; tick: number }) {
  const page = on ? tick % 3 : 0;
  return (
    <span className="flex h-full gap-3 p-3">
      <span className="flex w-[64px] shrink-0 flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`flex h-[38px] flex-col gap-1 rounded border-2 bg-panel p-1.5 transition-colors duration-300 ${
              index === page ? (on ? 'border-acid' : 'border-paper') : 'border-line-soft'
            }`}
          >
            <span className="h-1.5 w-3/4 rounded-full bg-muted" />
            <span className="h-1 w-1/2 rounded-full bg-line" />
          </span>
        ))}
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col gap-2.5 rounded-md border border-line bg-panel-lift p-4">
        {page === 0 && (
          <>
            <span className="mt-5 h-4 w-3/4 rounded bg-paper" />
            <span className="h-2.5 w-1/2 rounded bg-muted" />
          </>
        )}
        {page === 1 && (
          <>
            <span className="h-3 w-1/2 rounded bg-paper" />
            {[0, 1, 2].map((index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-muted" />
                <span className="h-2 w-3/4 rounded bg-line" />
              </span>
            ))}
          </>
        )}
        {page === 2 && (
          <>
            <span className="h-3 w-1/2 rounded bg-paper" />
            <span className="flex min-h-0 flex-1 items-end gap-2">
              {[40, 65, 50, 85].map((height, index) => (
                <span
                  key={index}
                  className={`w-5 rounded-t ${index === 3 && on ? 'bg-acid' : 'bg-muted'}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </span>
          </>
        )}
        <span className="absolute bottom-1 left-3 font-mono text-[16px] text-faint">
          {page + 1}/3
        </span>
      </span>
    </span>
  );
}

/** Design 的選取框位置（相對縮圖內框） */
const DESIGN_TARGETS: readonly {
  left: number;
  top: number;
  width: number;
  height: number;
}[] = [
  { left: 26, top: 50, width: 132, height: 24 },
  { left: 26, top: 104, width: 72, height: 28 },
  { left: 254, top: 58, width: 92, height: 50 },
];

function DesignThumb({ on, tick }: { on: boolean; tick: number }) {
  const target = DESIGN_TARGETS[tick % DESIGN_TARGETS.length];
  return (
    <span className="relative block h-full bg-ink-soft">
      <span className="absolute top-1 left-4 font-mono text-[16px] text-faint">Desktop</span>
      <span className="absolute top-1 left-[250px] font-mono text-[16px] text-faint">Mobile</span>
      {/* 桌機畫板 */}
      <span className="absolute top-[28px] left-4 flex h-[118px] w-[214px] flex-col gap-2 rounded border border-line bg-panel p-3">
        <span className="h-1.5 w-full rounded-full bg-line-soft" />
        <span className="mt-1 h-3.5 w-[120px] rounded bg-paper" />
        <span className="h-2 w-[150px] rounded bg-line" />
        <span className="mt-2 h-4 w-[60px] rounded bg-muted" />
      </span>
      {/* 手機畫板 */}
      <span className="absolute top-[28px] left-[250px] flex h-[118px] w-[100px] flex-col gap-1.5 rounded border border-line bg-panel p-2">
        <span className="h-2.5 w-3/4 rounded bg-paper" />
        <span className="h-[40px] rounded border border-line bg-panel-lift" />
        <span className="h-2 w-full rounded bg-line" />
        <span className="h-3 w-1/2 rounded bg-muted" />
      </span>
      {on && (
        <span
          aria-hidden="true"
          className="absolute rounded-sm border-2 border-dashed border-acid transition-all duration-500 ease-out"
          style={target}
        />
      )}
    </span>
  );
}

const DASH_FRAMES: readonly {
  kpi: readonly string[];
  bars: readonly number[];
}[] = [
  { kpi: ['1,284', '312', '96%'], bars: [38, 52, 46, 64, 58, 72, 66, 84] },
  { kpi: ['1,307', '318', '95%'], bars: [38, 52, 46, 64, 58, 72, 70, 78] },
  { kpi: ['1,341', '325', '97%'], bars: [38, 52, 46, 64, 58, 72, 74, 92] },
];

function DashboardThumb({ on, tick }: { on: boolean; tick: number }) {
  const frame = DASH_FRAMES[on ? tick % DASH_FRAMES.length : 0];
  return (
    <span className="flex h-full flex-col gap-2 p-3">
      <span className="grid h-[40px] shrink-0 grid-cols-3 gap-2">
        {frame.kpi.map((value, index) => (
          <span
            key={index}
            className="flex items-center justify-between rounded-md border border-line bg-panel-lift px-2"
          >
            <span className="h-1.5 w-5 rounded-full bg-line" />
            <span className="font-mono text-[18px] font-semibold text-paper">{value}</span>
          </span>
        ))}
      </span>
      <span className="flex min-h-0 flex-1 items-end gap-2 border-b border-line px-1">
        {frame.bars.map((height, index) => (
          <span
            key={index}
            className={`flex-1 rounded-t transition-[height] duration-500 ${
              index === frame.bars.length - 1 && on ? 'bg-acid' : 'bg-muted'
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </span>
      <span className="flex shrink-0 justify-between font-mono text-[16px] leading-5 text-faint">
        <span>更新於 剛剛</span>
        <span>點數字看查詢</span>
      </span>
    </span>
  );
}

const MOTION_X = [16, 104, 192, 280] as const;
const MOTION_BAR = [36, 84, 132, 180] as const;

function MotionThumb({ on, tick }: { on: boolean; tick: number }) {
  const frame = on ? tick % MOTION_X.length : 0;
  const percent = (frame / (MOTION_X.length - 1)) * 100;
  return (
    <span className="flex h-full flex-col gap-2 p-3">
      <span className="relative block h-[86px] shrink-0 rounded-md border border-line bg-panel-lift">
        <span
          className={`absolute top-[12px] size-10 rounded-full transition-[left] duration-1000 ease-in-out ${
            on ? 'bg-acid' : 'bg-paper'
          }`}
          style={{ left: MOTION_X[frame] }}
        />
        <span
          className="absolute bottom-[12px] left-4 h-3 rounded bg-muted transition-[width] duration-1000 ease-in-out"
          style={{ width: MOTION_BAR[frame] }}
        />
      </span>
      <span className="relative block h-[22px] shrink-0">
        <span className="absolute inset-x-0 top-[9px] h-1 rounded bg-line" />
        {[0, 33.3, 66.6, 100].map((left) => (
          <span
            key={left}
            className="absolute top-[5px] size-3 -translate-x-1/2 rotate-45 bg-muted"
            style={{ left: `${left}%` }}
          />
        ))}
        <span
          className={`absolute top-0 h-full w-[3px] -translate-x-1/2 rounded transition-[left] duration-1000 ease-linear ${
            on ? 'bg-acid' : 'bg-paper'
          }`}
          style={{ left: `${percent}%` }}
        />
      </span>
      <span className="font-mono text-[16px] leading-5 text-faint">
        0:{pad2(frame * 10)} / 0:30
      </span>
    </span>
  );
}

function StudioThumb({ id, on, tick }: { id: StudioId; on: boolean; tick: number }) {
  if (id === 'slides') return <SlidesThumb on={on} tick={tick} />;
  if (id === 'design') return <DesignThumb on={on} tick={tick} />;
  if (id === 'dashboards') return <DashboardThumb on={on} tick={tick} />;
  return <MotionThumb on={on} tick={tick} />;
}

function StudioCard({
  studio,
  on,
  tick,
  onSelect,
}: {
  studio: Studio;
  on: boolean;
  tick: number;
  onSelect: () => void;
}) {
  const url = STUDIO_EXAMPLES[studio.id];
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col rounded-2xl border border-l-[6px] transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-panel-lift'
          : 'border-line border-l-line bg-panel-lift hover:border-acid/55'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={on}
        className="flex min-h-0 flex-1 flex-col gap-2.5 px-5 pt-5 text-left"
      >
        <span className="block h-[160px] w-full shrink-0 overflow-hidden rounded-xl border border-line bg-panel">
          <StudioThumb id={studio.id} on={on} tick={tick} />
        </span>
        <span className="flex items-center gap-3">
          <span
            className={`text-[30px] leading-tight text-paper ${on ? 'font-semibold' : 'font-medium'}`}
          >
            {studio.name}
          </span>
          <span className={CHIP}>{studio.plan}</span>
        </span>
        <span className="text-[20px] leading-[1.5] break-keep text-pretty text-paper">{studio.desc}</span>
        <span className="mt-auto text-[18px] leading-snug text-muted">{studio.detail}</span>
      </button>
      <div className="px-5 pt-2 pb-4">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group flex h-11 items-center justify-between rounded-xl border border-blue/55 bg-panel px-4 text-[19px] text-blue transition-colors duration-200 hover:border-blue"
          >
            <span className="underline decoration-blue/55 underline-offset-4">
              開啟 {studio.name} 範例
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex h-11 items-center rounded-xl border border-dashed border-line px-4 text-[19px] text-faint"
          >
            範例連結待補
          </span>
        )}
      </div>
    </div>
  );
}

function StudioPrompt({ studio }: { studio: Studio }) {
  const [status, copy] = useCopy();
  const label =
    status === 'copied' ? '已複製' : status === 'failed' ? '複製失敗，請手動選取' : '複製提示詞';
  return (
    <div className="slide-enter flex min-w-0 flex-col justify-center gap-2 rounded-2xl border border-l-[6px] border-acid/55 border-l-acid bg-panel px-6">
      <div className="flex items-center gap-4">
        <span className={`${LABEL_TYPE} text-acid`}>{studio.name} · 試試這句提示詞</span>
        <button
          type="button"
          onClick={() => copy(studio.prompt)}
          className={`h-10 shrink-0 rounded-xl border px-4 text-[18px] whitespace-nowrap transition-colors duration-200 ${
            status === 'copied'
              ? 'border-acid bg-acid font-semibold text-on-accent'
              : 'border-line bg-panel-lift text-paper hover:border-acid'
          }`}
        >
          {label}
        </button>
      </div>
      <p className="text-[22px] leading-snug font-medium text-paper">「{studio.prompt}」</p>
      <p className="text-[18px] leading-snug text-muted">怎麼開始：{studio.start}</p>
    </div>
  );
}

export function StudioDemo() {
  const [picked, setPicked] = useState<StudioId>('slides');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(timer);
  }, []);

  const studio = STUDIOS.find((item) => item.id === picked) ?? STUDIOS[0];

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-4">
      <div className="grid h-[452px] shrink-0 grid-cols-4 gap-5">
        {STUDIOS.map((item) => (
          <StudioCard
            key={item.id}
            studio={item}
            on={item.id === picked}
            tick={tick}
            onSelect={() => setPicked(item.id)}
          />
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_520px] gap-5">
        <StudioPrompt key={studio.id} studio={studio} />
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6">
          <span className={LABEL_FAINT}>卡斯伯</span>
          <p className="text-[21px] leading-[1.5] text-paper">
            這些功能說實在我也沒用過，所以請 Claude 各生成一個範例，連結放在每張卡片下面。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 43 頁 CoddDemo — CODD：我自己開發的工具
 *
 *   左  Notion 的五項特色。
 *   右  CODD 的介面示意（視覺沿用第四堂課），選到哪一項，那一區就用 acid 外框標出來。
 *       介面本身可以操作：
 *         - 點 session 切換；資料夾可以收合；「✎ 重新命名」可以直接改名（Enter 確定、Esc 取消）
 *         - class5 那個 session 停在 WAITING，按確認框的「1. Yes」→ BUSY → IDLE
 *         - 點左上角的帳號就換到下一個帳號，USAGE 跟著換
 *         - 文件旁邊的「插入」把文件放進輸入框，按 SEND 送進目前的 session
 *         - 選到「系統狀況」時，HOST 的數字會跳動
 *       選到「內部文件管理」時，右邊換成講師 CODD 筆記本的實際畫面（DocsShot）：
 *       左邊縮圖＋三個區域，點了就把那一區放大到讀得出字。
 *   重新點「Session、專案管理」會把 class5 放回 WAITING，方便重講一次。
 * ══════════════════════════════════════════════════════════════ */

type FeatureId = 'sessions' | 'usage' | 'account' | 'docs' | 'host';

const FEATURES: readonly {
  id: FeatureId;
  name: string;
  sub: string;
  status: string;
  hint: string;
}[] = [
  {
    id: 'sessions',
    name: 'Session、專案管理',
    sub: '資料夾、重新命名、狀態監控',
    status: '大量 session 用資料夾分專案、可以重新命名；狀態燈告訴你它現在在做什麼',
    hint: '點 session、✎ 改名',
  },
  {
    id: 'usage',
    name: 'Claude 用量剩餘',
    sub: '還剩多少、幾點重置',
    status: 'Claude 的用量還剩多少、幾點重置，一眼看到',
    hint: '數字跟著目前的帳號',
  },
  {
    id: 'account',
    name: 'Claude 快速切換帳號',
    sub: '點一下就換帳號',
    status: '快速切換 Claude 帳號，點一下就換到下一個',
    hint: '點左上角的帳號',
  },
  {
    id: 'docs',
    name: '內部文件管理',
    sub: '筆記依專案分類，AI 讀得到',
    status: '筆記依專案分類、連到 session，AI 能不能讀也設在筆記上',
    hint: '點區域放大',
  },
  {
    id: 'host',
    name: '系統目前狀況',
    sub: 'CPU、記憶體、硬碟空間',
    status: '主機目前的狀況：CPU、記憶體、硬碟空間',
    hint: '數字會跟著更新',
  },
];

type CoddSessionId = 'class5' | 'vote' | 'blog';
type CoddStatus = 'waiting' | 'busy' | 'idle';
type LineKind = 'you' | 'tool' | 'out' | 'say' | 'spin';

interface Line {
  kind: LineKind;
  text: string;
}

interface CoddSession {
  id: CoddSessionId;
  name: string;
  path: string;
  status: CoddStatus;
  inState: string;
  up: string;
  ctx: number;
  lines: readonly Line[];
}

const CODD_SESSIONS: Record<CoddSessionId, CoddSession> = {
  class5: {
    id: 'class5',
    name: 'class5：第 31 頁',
    path: '~/projects/slides',
    status: 'waiting',
    inState: '2m',
    up: '38m',
    ctx: 57,
    lines: [
      { kind: 'you', text: '第 31 頁改成可以點的 Artifact 示意' },
      { kind: 'tool', text: 'Read(slides.ts)' },
      { kind: 'tool', text: 'Update(demos-claude.tsx)' },
      { kind: 'out', text: '加了四種使用情境' },
    ],
  },
  vote: {
    id: 'vote',
    name: 'vote：投票即時更新',
    path: '~/projects/vote',
    status: 'busy',
    inState: '4m',
    up: '1h05m',
    ctx: 42,
    lines: [
      { kind: 'you', text: '投票改成 1～5 分，結果即時更新' },
      { kind: 'tool', text: 'Read(src/worker.ts)' },
      { kind: 'tool', text: 'Update(src/worker.ts)' },
      { kind: 'out', text: '每投一票就廣播新的平均分數' },
      { kind: 'tool', text: 'Bash(pnpm test)' },
      { kind: 'out', text: 'Running…' },
      { kind: 'spin', text: 'Working… (4m 02s · esc to interrupt)' },
    ],
  },
  blog: {
    id: 'blog',
    name: 'blog：週報文章',
    path: '~/projects/blog',
    status: 'idle',
    inState: '18m',
    up: '46m',
    ctx: 81,
    lines: [
      { kind: 'you', text: '把這週的更新整理成週報' },
      { kind: 'tool', text: 'Read(CHANGELOG.md)' },
      { kind: 'tool', text: 'Write(posts/weekly-45.md)' },
      { kind: 'out', text: '新功能 3 項、修正 5 項' },
      { kind: 'say', text: '週報草稿寫好了，要不要調整語氣？' },
      { kind: 'spin', text: 'Worked for 2m 8s' },
    ],
  },
};

/** class5 按下「1. Yes」之後接著印出來的幾行 */
const CLASS5_TAIL: Record<'busy' | 'idle', readonly Line[]> = {
  busy: [
    { kind: 'tool', text: 'Bash(pnpm lint)' },
    { kind: 'out', text: 'Running…' },
    { kind: 'spin', text: 'Working… (5s · esc to interrupt)' },
  ],
  idle: [
    { kind: 'tool', text: 'Bash(pnpm lint)' },
    { kind: 'out', text: '沒有錯誤' },
    { kind: 'say', text: '第 31 頁改好了，要我順便跑型別檢查嗎？' },
    { kind: 'spin', text: 'Worked for 1m 12s' },
  ],
};

type FolderId = 'slides' | 'blog';

const FOLDERS: readonly {
  id: FolderId;
  name: string;
  sessions: readonly CoddSessionId[];
}[] = [
  { id: 'slides', name: '課程簡報', sessions: ['class5', 'vote'] },
  { id: 'blog', name: '部落格', sessions: ['blog'] },
];

type DocId = 'outline' | 'deploy' | 'api';

const DOCS: readonly {
  id: DocId;
  title: string;
  meta: string;
  size: string;
}[] = [
  { id: 'outline', title: '第五堂課大綱', meta: '1,284 字', size: '1,284 字' },
  { id: 'deploy', title: '部署檢查清單', meta: '12 項', size: '12 項' },
  { id: 'api', title: '投票 API 規格', meta: '3 張圖', size: '860 字、3 張圖' },
];

const ACCOUNTS: readonly {
  name: string;
  usage: readonly { span: string; left: number; reset: string }[];
}[] = [
  {
    name: '帳號 A',
    usage: [
      { span: '5h', left: 12, reset: '19:30' },
      { span: '1w', left: 48, reset: '週五 23:00' },
    ],
  },
  {
    name: '帳號 B',
    usage: [
      { span: '5h', left: 86, reset: '21:10' },
      { span: '1w', left: 73, reset: '週六 09:00' },
    ],
  },
  {
    name: '帳號 C',
    usage: [
      { span: '5h', left: 64, reset: '20:40' },
      { span: '1w', left: 31, reset: '週四 18:00' },
    ],
  },
];

const HOST_FRAMES: readonly {
  cpu: number;
  mem: number;
  memText: string;
  disk: number;
  diskText: string;
}[] = [
  { cpu: 23, mem: 57, memText: '9.1/16G', disk: 64, diskText: '182G free' },
  { cpu: 41, mem: 58, memText: '9.3/16G', disk: 64, diskText: '182G free' },
  { cpu: 67, mem: 61, memText: '9.8/16G', disk: 65, diskText: '181G free' },
  { cpu: 35, mem: 59, memText: '9.4/16G', disk: 65, diskText: '181G free' },
];

/* ── 「內部文件管理」：講師 CODD 的實際畫面（images/codd-notes.webp，1920 × 1049）──
 * 整張縮進右卡只剩 0.4 倍，字讀不出來，所以左邊是縮圖＋三個區域，右邊把選到的區域
 * 放大到約 1.33 倍（原圖的字 12～13px → 舞台上約 16～17px）。
 * 放大用 background-image 的縮放與位移，不用 overflow-hidden 裁圖
 * （溢出稽核會把被裁掉的 <img> 當成內容被裁掉）。 */

const DOC_SHOT = { w: 1920, h: 1049 } as const;
const DOC_THUMB_W = 360;
const DOC_THUMB_SCALE = DOC_THUMB_W / DOC_SHOT.w;
/** 放大區的內框（外框 776 × 466 扣掉 2px 邊框） */
const DOC_ZOOM = { w: 772, h: 462 } as const;

type DocRegionId = 'list' | 'note' | 'side';

/** 座標是原圖像素 */
const DOC_REGIONS: readonly {
  id: DocRegionId;
  name: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
}[] = [
  {
    id: 'list',
    name: '筆記本與清單',
    sub: '收件匣、依專案分類',
    x: 75,
    y: 52,
    w: 517,
    h: 348,
  },
  {
    id: 'note',
    name: '筆記內容',
    sub: 'AI 可讀權限、所屬專案',
    x: 598,
    y: 0,
    w: 582,
    h: 300,
  },
  {
    id: 'side',
    name: '右側欄',
    sub: '連到的 session、版本紀錄',
    x: 1683,
    y: 55,
    w: 237,
    h: 345,
  },
];

function DocsShot() {
  const [regionId, setRegionId] = useState<DocRegionId>('list');
  const region = DOC_REGIONS.find((item) => item.id === regionId) ?? DOC_REGIONS[0];
  const scale = Math.min(DOC_ZOOM.w / region.w, DOC_ZOOM.h / region.h);

  return (
    <div className="grid h-[466px] shrink-0 grid-cols-[360px_1fr] gap-4">
      {/* ── 左：縮圖＋三個區域 ───────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-2.5">
        <div className="relative h-[197px] w-[360px] shrink-0 rounded-lg border border-line bg-panel-lift">
          <img
            src={coddNotesUrl}
            alt="講師的 CODD 筆記本畫面（縮圖）"
            width={DOC_THUMB_W}
            height={197}
            className="block h-[197px] w-[360px] rounded-lg"
          />
          {DOC_REGIONS.map((item) => {
            const on = item.id === region.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`放大：${item.name}`}
                aria-pressed={on}
                onClick={() => setRegionId(item.id)}
                className={`absolute rounded-sm transition-colors duration-200 ${
                  on
                    ? 'border-[3px] border-acid'
                    : 'border-2 border-dashed border-on-accent hover:border-acid'
                }`}
                style={{
                  left: item.x * DOC_THUMB_SCALE,
                  top: item.y * DOC_THUMB_SCALE,
                  width: item.w * DOC_THUMB_SCALE,
                  height: item.h * DOC_THUMB_SCALE,
                }}
              />
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {DOC_REGIONS.map((item, i) => {
            const on = item.id === region.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setRegionId(item.id)}
                className={`flex h-[76px] shrink-0 items-center gap-4 rounded-xl border border-l-[6px] px-4 text-left transition-colors duration-200 ${
                  on ? CARD_ON : CARD_OFF
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-[17px] ${
                    on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`text-[22px] leading-tight whitespace-nowrap text-paper ${on ? 'font-semibold' : ''}`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-[17px] leading-snug whitespace-nowrap ${on ? 'text-paper' : 'text-muted'}`}
                  >
                    {item.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 右：放大 ─────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 items-center justify-center rounded-xl border-2 border-line bg-panel-lift">
        <div
          key={region.id}
          role="img"
          aria-label={`CODD 筆記本畫面放大：${region.name}（${region.sub}）`}
          className="slide-enter rounded-md"
          style={{
            width: Math.floor(region.w * scale),
            height: Math.floor(region.h * scale),
            backgroundImage: `url(${coddNotesUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${DOC_SHOT.w * scale}px ${DOC_SHOT.h * scale}px`,
            backgroundPosition: `${-region.x * scale}px ${-region.y * scale}px`,
          }}
        />
      </div>
    </div>
  );
}
const STATUS_LABEL: Record<CoddStatus, string> = {
  waiting: 'WAITING',
  busy: 'BUSY',
  idle: 'IDLE',
};

const MOCK_LABEL = 'font-mono text-[16px] tracking-[0.12em] uppercase';

/** 區塊外框：疊在區塊上面的 acid 框，用 opacity 淡入淡出（不影響排版） */
function Focus({ on, className = 'inset-0' }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-lg border-[3px] border-acid transition-opacity duration-300 ${className} ${
        on ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

/** 狀態燈：WAITING ◆ amber、BUSY ● 實心、IDLE ○ 空心 */
function Lamp({ status }: { status: CoddStatus }) {
  if (status === 'waiting') {
    return <span aria-hidden="true" className="size-3 shrink-0 rotate-45 bg-amber" />;
  }
  if (status === 'busy') {
    return <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-paper" />;
  }
  return <span aria-hidden="true" className="size-3 shrink-0 rounded-full border-2 border-muted" />;
}

/** 狀態標籤：一定有文字，不靠顏色分辨 */
function StatusTag({ status, extra }: { status: CoddStatus; extra?: string }) {
  const tone =
    status === 'waiting'
      ? 'border-amber bg-amber font-semibold text-on-accent'
      : status === 'busy'
        ? 'border-paper text-paper'
        : 'border-line text-muted';
  return (
    <span
      className={`flex h-6 shrink-0 items-center rounded border px-1.5 font-mono text-[16px] leading-none whitespace-nowrap ${tone}`}
    >
      {extra ? `${STATUS_LABEL[status]} · ${extra}` : STATUS_LABEL[status]}
    </span>
  );
}

function TermLine({ line }: { line: Line }) {
  if (line.kind === 'you') {
    return (
      <p className="truncate whitespace-pre text-paper">
        <span className="text-muted">{'> '}</span>
        {line.text}
      </p>
    );
  }
  if (line.kind === 'out') {
    return <p className="truncate whitespace-pre text-muted">{`  ⎿ ${line.text}`}</p>;
  }
  if (line.kind === 'spin') {
    return <p className="truncate whitespace-pre text-faint">{`✻ ${line.text}`}</p>;
  }
  return <p className="truncate whitespace-pre text-paper">{`● ${line.text}`}</p>;
}

/** Claude Code 的權限確認（簡化成五行），「1. Yes」可以按 */
function PermissionBox({ onApprove }: { onApprove: () => void }) {
  return (
    <div className="mt-1.5 rounded-lg border-2 border-line bg-panel px-4 py-1.5">
      <p className="font-semibold text-paper">Bash(pnpm lint)</p>
      <p className="text-paper">Do you want to proceed?</p>
      <button
        type="button"
        onClick={onApprove}
        className="-mx-1 block rounded px-1 text-left font-semibold whitespace-pre text-acid hover:bg-acid/14"
      >
        ❯ 1. Yes
      </button>
      <p className="whitespace-pre text-muted">{"  2. Yes, and don't ask again"}</p>
      <p className="whitespace-pre text-muted">{'  3. No'}</p>
    </div>
  );
}

function HostRow({ label, percent, value }: { label: string; percent: number; value: string }) {
  return (
    <div className="grid grid-cols-[44px_1fr_92px] items-center gap-2 px-1.5">
      <span className="text-faint">{label}</span>
      <span className="h-2 rounded-full bg-line-soft">
        <span
          className="block h-2 rounded-full bg-muted transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-right text-paper">{value}</span>
    </div>
  );
}

export function CoddDemo() {
  const [feature, setFeature] = useState<FeatureId>('sessions');
  const [selected, setSelected] = useState<CoddSessionId>('class5');
  const [names, setNames] = useState<Record<CoddSessionId, string>>({
    class5: CODD_SESSIONS.class5.name,
    vote: CODD_SESSIONS.vote.name,
    blog: CODD_SESSIONS.blog.name,
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState<Record<FolderId, boolean>>({
    slides: false,
    blog: false,
  });
  const [account, setAccount] = useState(0);
  const [phase, setPhase] = useState<CoddStatus>('waiting');
  const [inserted, setInserted] = useState<DocId | null>(null);
  const [sent, setSent] = useState<{
    session: CoddSessionId;
    doc: DocId;
  } | null>(null);
  const [hostFrame, setHostFrame] = useState(0);

  /* class5：BUSY 一段時間後變 IDLE */
  useEffect(() => {
    if (phase !== 'busy') return;
    const timer = window.setTimeout(() => setPhase('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /* 只有選到「系統目前狀況」時 HOST 才跳動 */
  useEffect(() => {
    if (feature !== 'host') return;
    const timer = window.setInterval(
      () => setHostFrame((value) => (value + 1) % HOST_FRAMES.length),
      1300,
    );
    return () => window.clearInterval(timer);
  }, [feature]);

  const index = Math.max(
    0,
    FEATURES.findIndex((item) => item.id === feature),
  );
  const current = FEATURES[index];

  const sessionOf = (id: CoddSessionId): CoddSession =>
    id === 'class5'
      ? {
          ...CODD_SESSIONS.class5,
          status: phase,
          inState: phase === 'waiting' ? '2m' : '3s',
        }
      : CODD_SESSIONS[id];
  const session = sessionOf(selected);
  const waitingCount = (['class5', 'vote', 'blog'] as const).filter(
    (id) => sessionOf(id).status === 'waiting',
  ).length;
  const usage = ACCOUNTS[account].usage;
  const host = HOST_FRAMES[hostFrame];

  const commitName = () => {
    const name = draft.trim();
    if (name) setNames((prev) => ({ ...prev, [selected]: name }));
    setEditing(false);
  };

  const pickSession = (id: CoddSessionId) => {
    if (editing) commitName();
    setSelected(id);
  };

  const pickFeature = (id: FeatureId) => {
    setFeature(id);
    if (id === 'sessions') setPhase('waiting');
  };

  const onNameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commitName();
    if (event.key === 'Escape') setEditing(false);
  };

  const send = () => {
    if (!inserted) return;
    setSent({ session: selected, doc: inserted });
    setInserted(null);
  };

  const flags = {
    sessions: feature === 'sessions',
    usage: feature === 'usage',
    account: feature === 'account',
    host: feature === 'host',
  };

  let tail: readonly Line[] = [];
  if (selected === 'class5' && (phase === 'busy' || phase === 'idle')) tail = CLASS5_TAIL[phase];
  const sentDoc =
    sent && sent.session === selected ? DOCS.find((doc) => doc.id === sent.doc) : undefined;
  const insertedDoc = DOCS.find((doc) => doc.id === inserted);

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[500px_1fr] gap-8">
      {/* ── 左：五項特色 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-2.5">
        {FEATURES.map((item, i) => (
          <MenuItem
            key={item.id}
            index={i}
            name={item.name}
            sub={item.sub}
            on={item.id === feature}
            onClick={() => pickFeature(item.id)}
          />
        ))}
      </div>

      {/* ── 右：CODD 介面示意 ───────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-line bg-panel px-7 py-5">
        <div className="flex h-12 shrink-0 items-center gap-4">
          <span className={`${LABEL_TYPE} shrink-0 text-acid`}>功能 {pad2(index + 1)}</span>
          <span className="text-[30px] leading-none font-semibold whitespace-nowrap text-paper">
            {current.name}
          </span>
          <span className={CHIP}>
            {feature === 'docs' ? '實際畫面 · 講師的 CODD' : '示意畫面 · 資料是虛構的'}
          </span>
        </div>

        {feature === 'docs' ? (
          <DocsShot />
        ) : (
          <div className="grid h-[466px] shrink-0 grid-cols-[340px_1fr] overflow-hidden rounded-xl border-2 border-line bg-panel">
            {/* ── 側欄 ─────────────────────────────────────── */}
            <div className="flex min-h-0 flex-col border-r border-line bg-panel-lift px-3 py-2">
              <div className="flex h-8 shrink-0 items-center justify-between px-1">
                <span className="font-mono text-[19px] font-bold tracking-[0.06em] text-paper">
                  FANCY/CODD
                </span>
                <button
                  type="button"
                  onClick={() => setAccount((value) => (value + 1) % ACCOUNTS.length)}
                  aria-label={`目前是${ACCOUNTS[account].name}，點一下換下一個帳號`}
                  className="relative flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel px-2 font-mono text-[16px] text-paper transition-colors duration-200 hover:border-acid"
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-paper" />
                  {ACCOUNTS[account].name} ▾
                  <Focus on={flags.account} className="-inset-1.5" />
                </button>
              </div>

              {/* SESSIONS（資料夾） */}
              <div className="relative mt-1.5 shrink-0 rounded-lg p-1">
                <div className="flex h-[26px] items-center justify-between px-1">
                  <span className={`${MOCK_LABEL} text-faint`}>Sessions 3</span>
                  {waitingCount > 0 && (
                    <span className="flex h-6 items-center gap-1.5 rounded bg-amber px-2 font-mono text-[16px] leading-none font-semibold text-on-accent">
                      ◆ {waitingCount}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex h-[180px] flex-col">
                  {FOLDERS.map((folder) => (
                    <Fragment key={folder.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsed((prev) => ({
                            ...prev,
                            [folder.id]: !prev[folder.id],
                          }))
                        }
                        aria-expanded={!collapsed[folder.id]}
                        className="flex h-[26px] shrink-0 items-center gap-2 px-1 text-left text-[17px] text-muted hover:text-paper"
                      >
                        <span aria-hidden="true" className="w-3 font-mono text-[16px]">
                          {collapsed[folder.id] ? '▸' : '▾'}
                        </span>
                        {folder.name}
                        <span className="font-mono text-[16px] text-faint">
                          {folder.sessions.length}
                        </span>
                      </button>
                      {!collapsed[folder.id] &&
                        folder.sessions.map((id) => {
                          const item = sessionOf(id);
                          const on = selected === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => pickSession(id)}
                              aria-pressed={on}
                              title={`最近一次 prompt：${item.lines[0].text}`}
                              className={`flex h-[42px] w-full shrink-0 flex-col justify-center gap-0.5 rounded-md border-l-4 pr-2 pl-5 text-left transition-colors duration-200 ${
                                on
                                  ? 'border-l-paper bg-panel'
                                  : 'border-l-transparent hover:bg-panel'
                              }`}
                            >
                              <span className="flex w-full items-center gap-2">
                                <Lamp status={item.status} />
                                <span className="min-w-0 flex-1 truncate text-[17px] leading-5 text-paper">
                                  {names[id]}
                                </span>
                                <StatusTag status={item.status} />
                              </span>
                              <span className="flex w-full justify-between gap-2 font-mono text-[16px] leading-[18px] whitespace-nowrap text-muted">
                                <span>{item.path}</span>
                                <span>
                                  {item.inState} · {item.up}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                    </Fragment>
                  ))}
                </div>
                <Focus on={flags.sessions} />
              </div>

              {/* HOST ＋ USAGE */}
              <div className="mt-auto flex shrink-0 flex-col gap-1">
                <div className="relative flex flex-col gap-0.5 rounded-lg px-1.5 py-1 font-mono text-[16px] leading-[22px]">
                  <div className="flex items-center justify-between px-1.5">
                    <span className={`${MOCK_LABEL} text-faint`}>Host</span>
                    <span className="text-muted">up 12d 3h</span>
                  </div>
                  <HostRow label="CPU" percent={host.cpu} value={`${host.cpu}%`} />
                  <HostRow label="MEM" percent={host.mem} value={host.memText} />
                  <HostRow label="DISK" percent={host.disk} value={host.diskText} />
                  <Focus on={flags.host} />
                </div>

                <div className="relative flex flex-col gap-0.5 rounded-lg px-1.5 py-1 font-mono text-[16px] leading-[22px]">
                  <div className="flex items-center justify-between px-1.5">
                    <span className={`${MOCK_LABEL} text-faint`}>Usage 剩餘</span>
                    <span className="text-muted">{ACCOUNTS[account].name} · 重置</span>
                  </div>
                  {usage.map((row) => {
                    const low = row.left <= 20;
                    return (
                      <div
                        key={row.span}
                        className="grid grid-cols-[24px_1fr_44px_max-content] items-center gap-2 px-1.5"
                      >
                        <span className="text-faint">{row.span}</span>
                        <span className="h-2 rounded-full bg-line-soft">
                          <span
                            className={`block h-2 rounded-full transition-[width] duration-500 ${low ? 'bg-amber' : 'bg-muted'}`}
                            style={{ width: `${row.left}%` }}
                          />
                        </span>
                        <span
                          className={`text-right ${low ? 'font-semibold text-amber' : 'text-paper'}`}
                        >
                          {row.left}%
                        </span>
                        <span className="text-muted">{row.reset}</span>
                      </div>
                    );
                  })}
                  <Focus on={flags.usage} />
                </div>
              </div>
            </div>

            {/* ── 主區 ─────────────────────────────────────── */}
            <div className="flex min-h-0 min-w-0 flex-col">
              {/* session 標題列 */}
              <div className="relative flex h-16 shrink-0 items-center border-b border-line px-5">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-3">
                    <Lamp status={session.status} />
                    {editing ? (
                      // 上限 9 字：選中的側欄列只有 166px（17px 字），9 個中文字剛好放得下；
                      // 原本的 18 字在側欄與標題列都會被裁成「…」
                      <input
                        autoFocus
                        value={draft}
                        maxLength={9}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onNameKey}
                        onBlur={commitName}
                        aria-label="新的 session 名稱"
                        className="h-8 w-[280px] rounded-md border-2 border-acid bg-panel px-2 text-[20px] text-paper outline-none"
                      />
                    ) : (
                      <span className="max-w-[300px] truncate text-[21px] leading-7 font-semibold text-paper">
                        {names[selected]}
                      </span>
                    )}
                    <StatusTag status={session.status} extra={session.inState} />
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(names[selected]);
                          setEditing(true);
                        }}
                        className="flex h-7 shrink-0 items-center rounded-md border border-line px-2 text-[16px] whitespace-nowrap text-paper transition-colors duration-200 hover:border-acid"
                      >
                        ✎ 重新命名
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[16px] leading-[22px] whitespace-nowrap text-muted">
                    <span>{session.path}</span>
                    <span aria-hidden="true">·</span>
                    <span>UP {session.up}</span>
                    <span aria-hidden="true">·</span>
                    <span>CTX {session.ctx}%</span>
                  </div>
                </div>
              </div>

              {/* 終端機 ＋ 文件 */}
              <div className="grid min-h-0 flex-1 grid-cols-[1fr_244px]">
                <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-ink-soft px-5 py-3 font-mono text-[18px] leading-[1.4]">
                  {session.lines.map((line, i) => (
                    <TermLine key={`${session.id}-${i}`} line={line} />
                  ))}
                  {selected === 'class5' && phase === 'waiting' && (
                    <PermissionBox onApprove={() => setPhase('busy')} />
                  )}
                  {tail.map((line, i) => (
                    <TermLine key={`tail-${i}`} line={line} />
                  ))}
                  {sentDoc && (
                    <div key={`${sentDoc.id}-${selected}`} className="slide-enter">
                      <TermLine
                        line={{
                          kind: 'you',
                          text: `[文件] ${sentDoc.title} 照這份改`,
                        }}
                      />
                      <TermLine
                        line={{
                          kind: 'out',
                          text: `已插入文件內容（${sentDoc.size}）`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex min-h-0 flex-col gap-1.5 border-l border-line bg-panel-lift px-3 py-2">
                  <div className="flex h-6 shrink-0 items-center justify-between px-1">
                    <span className={`${MOCK_LABEL} text-faint`}>Docs 3</span>
                  </div>
                  {DOCS.map((doc) => {
                    const on = inserted === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`flex shrink-0 items-center gap-2 rounded-md border bg-panel px-3 py-2 transition-colors duration-200 ${
                          on ? 'border-acid' : 'border-line-soft'
                        }`}
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[17px] leading-[22px] text-paper">
                            {doc.title}
                          </span>
                          <span className="font-mono text-[16px] leading-5 text-muted">
                            {doc.meta}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setInserted(doc.id)}
                          className={`h-8 shrink-0 rounded-md border px-2 text-[16px] whitespace-nowrap transition-colors duration-200 ${
                            on
                              ? 'border-acid bg-acid font-semibold text-on-accent'
                              : 'border-line text-paper hover:border-acid'
                          }`}
                        >
                          插入
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 輸入框 */}
              <div className="relative mx-3 my-1.5 flex h-[52px] shrink-0 items-center gap-2 rounded-lg px-1.5">
                <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-panel px-4 text-[18px] whitespace-nowrap">
                  {insertedDoc ? (
                    <>
                      <span className="flex h-7 shrink-0 items-center rounded border border-acid px-2 text-[16px] font-semibold text-acid">
                        [文件] {insertedDoc.title}
                      </span>
                      <span className="truncate text-paper">照這份改</span>
                    </>
                  ) : (
                    <span className="truncate text-faint">訊息 · Enter 送出 · ⇧Enter 換行</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={send}
                  disabled={!insertedDoc}
                  className="flex h-11 shrink-0 items-center rounded-md border border-line px-4 font-mono text-[16px] tracking-[0.12em] text-paper transition-colors duration-200 enabled:hover:border-acid disabled:text-faint"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          key={current.id}
          className="slide-enter flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6"
        >
          <span className="text-[21px] font-semibold text-acid">›</span>
          <p className="min-w-0 flex-1 truncate text-[21px] text-paper">{current.status}</p>
          <span className="shrink-0 text-[18px] whitespace-nowrap text-muted">
            試試看：{current.hint}
          </span>
        </div>
      </div>
    </div>
  );
}
