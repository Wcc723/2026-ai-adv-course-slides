import type { Step } from '../../types/slide';
import {
  WhereDemo,
  ThreeModesDemo,
  TheLineDemo,
  CodexExtraDemo,
  SameJobDemo,
  CodexToolsDemo,
} from './demos-desktop';
import {
  ComposerDemo,
  SlashDemo,
  ProjectDemo,
  ApprovalDemo,
  ModelDemo,
  EffortDemo,
} from './demos-details';
import {
  LoadDemo,
  RolesDemo,
  FrontendDemo,
  ImageLoadDemo,
  SiteArchDemo,
} from './demos-web';
import {
  MainlineDemo,
  ThreeFactorsDemo,
  PromptThreeDemo,
  PromptExamplesDemo,
} from './demos-prompt';
import {
  SiteCautionsDemo,
  AccessLayersDemo,
  DeployNotesDemo,
} from './demos-site';
import {
  WhySheetsDemo,
  SpreadsheetDemo,
  GoogleServiceDemo,
} from './demos-sheet';
import {
  VueConceptsDemo,
  AdvancedPromptDemo,
  FamilyLedgerDemo,
} from './demos-advanced';
import { SkillDemo } from './demos-bonus';
import { StorageDemo } from './demos-bonus-storage';
import { SampleDemo } from './demos-bonus-sample';
import { PromptGeneratorDemo } from './demos-bonus-prompt';

export const slideTitle = '從 0 到 1 的網站開發';
export const slideSubtitle = 'Codex · ChatGPT Sites · Google 試算表';

/*
 * 四十一頁的節奏：
 *   1–2    封面、今天的四個目標
 *   3–18   第一章 起手式：ChatGPT 桌面版的三種模式 → 輸入框那一排設定
 *          → 網站怎麼運作（伺服器、前端、圖片）
 *   19–26  第二章 建構並部署第一個網站：提示詞 → Codex 裡的三件事
 *          → ChatGPT Sites 是什麼、要注意什麼
 *   27–35  第三章 串接 Google 試算表：為什麼 → 資料長相 → 開通服務 → 權限
 *          → 進階網站的概念與提示詞 → 部署前檢查 → 家庭記帳實作
 *   36–40  加碼內容：D1 與 R2（含風險）→ 新手向 Skill → 部署範例
 *          → 提示詞產生器（demos-bonus*.tsx、diagrams-bonus.tsx）
 *   41     重點回顧
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 規格是 Notion「課綱 › 從 0 到 1 的網站開發」的 callout。其中五段指定沿用
 * 另一個專案（2026-interactive-presentive，iThome 鐵人賽 2026）的頁面：
 *
 *   第 4–8 頁    chatgpt-desktop 的 2、3、4、6、7 頁
 *   第 9–14 頁   chatgpt-desktop-details 的 2–7 頁
 *   第 15–17 頁  how-websites-work 的 2、3、4 頁（第 18 頁圖片是補的）
 *   第 20–21 頁  prompt-writing 的 2、3 頁
 *   第 29 頁     json-and-data 的 3 頁（結尾改寫、資料換成家庭記帳）
 *   第 32 頁     vite 的 5 頁（五個概念只留 Vue、元件、路由）
 *
 * 那個專案是深色主題，這裡是亮色，同名 token 在兩邊明暗相反
 * （`ink` 從近黑變成米白），所以每個 demo 都做過色彩轉換，不是直接複製。
 * 移植的頁面也拿掉了「Day 09」「上一篇」這類跨篇引用 —— 這是一堂獨立課程。
 *
 * ChatGPT Sites 的兩頁（第 25、26 頁）與部署、權限兩頁（第 31、34 頁）
 * 的說法在 2026-09-18 對照過官方文件（learn.chatgpt.com/docs/sites、
 * help.openai.com 繁中說明中心）。它是 public beta，**這幾頁會過期**，
 * 上台前再確認一次方案、分享選項的中文名稱與用量說明。
 *
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description，也沒有 caption
 * ──────────────────────────────────────────────────────────────
 * 使用者決定：跟來源簡報一致，只留兩層 —— 標題說這一頁在講什麼，
 * demo 自己說現在發生什麼。
 */
export const steps: Step[] = [
  /* ── 開場 ───────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: {
      kind: 'title',
      kicker: 'From 0 to 1',
      heading: '從 0 到 1 的網站開發',
      lead: [
        '這堂課從 ChatGPT 桌面版的基本操作開始，用 Codex 做出第一個網站，再用 ChatGPT Sites 部署成一個真的網址。',
        '最後把資料放進 Google 試算表，做出一個全家都能登入的記帳工具。',
      ],
      assetId: 'site-files-edit',
    },
  },

  {
    id: 'agenda',
    title: '今天的四個目標',
    body: {
      kind: 'points',
      items: [
        {
          text: '使用前端框架進行開發，不需要 Node.js',
          note: 'Vue 3 與 Vue Router 用瀏覽器可以直接執行的版本，整個網站就是幾個靜態檔案。',
          accent: 'acid',
        },
        {
          text: '使用 ChatGPT Sites 進行部署',
          note: '在 Codex 裡把做好的網站變成一個別人也打得開的網址。',
          accent: 'acid',
        },
        {
          text: '使用 ChatGPT Sites 的環境變數',
          note: '分清楚哪些設定可以公開寫在前端、哪些必須留在伺服器端。',
          accent: 'acid',
        },
        {
          text: '串接 Google 試算表，並管好權限',
          note: '誰打得開網站、誰登得進來、登入後讀得到哪一份資料，是三件分開的事。',
          accent: 'acid',
        },
      ],
    },
  },

  /* ── 第一章 起手式 ──────────────────────────────────────── */

  {
    id: 'ch-basics',
    title: '第一章',
    body: {
      kind: 'title',
      kicker: 'Chapter 01',
      heading: '起手式的一些操作技巧',
      lead: [
        '開始做網站之前，先認識 ChatGPT 桌面版的三種工作方式，以及輸入框附近那一排會一直影響結果的設定。',
        '接著補上網站運作的基本觀念：伺服器、前端，以及 HTML、CSS、JavaScript 與圖片這幾種檔案。',
      ],
    },
  },

  /* chatgpt-desktop 的 2、3、4、6、7 頁 */

  {
    id: 'where',
    title: '這三個在畫面的哪裡',
    body: { kind: 'demo', render: WhereDemo },
  },
  {
    id: 'three-modes',
    title: 'Chat、Work、Codex 各自適合什麼',
    body: { kind: 'demo', render: ThreeModesDemo },
  },
  {
    id: 'the-line',
    title: '本機工作方式是主要分界',
    body: { kind: 'demo', render: TheLineDemo },
  },
  {
    id: 'codex-extra',
    title: 'Codex 額外提供的開發者介面',
    body: { kind: 'demo', render: CodexExtraDemo },
  },
  {
    id: 'same-job',
    title: '同一件事的三個階段',
    body: { kind: 'demo', render: SameJobDemo },
  },

  /* chatgpt-desktop-details 的 2–7 頁：建立你第一個專案 */

  {
    id: 'composer',
    title: '輸入框下面那一排',
    body: { kind: 'demo', render: ComposerDemo },
  },
  {
    id: 'slash',
    title: '斜線可以呼叫出不同的指令',
    body: { kind: 'demo', render: SlashDemo },
  },
  {
    id: 'project',
    title: '專案：先確認你在哪一個',
    body: { kind: 'demo', render: ProjectDemo },
  },
  {
    id: 'approval',
    title: '三種核准方式',
    body: { kind: 'demo', render: ApprovalDemo },
  },
  {
    id: 'model',
    title: '模型清單怎麼讀',
    body: { kind: 'demo', render: ModelDemo },
  },
  {
    id: 'effort',
    title: '推理強度與快速',
    body: { kind: 'demo', render: EffortDemo },
  },

  /* how-websites-work 的 2、3、4 頁，加上補的圖片頁 */

  {
    id: 'load',
    title: '輸入網址之後，發生了什麼事',
    body: { kind: 'demo', render: LoadDemo },
  },
  {
    id: 'roles',
    title: '前端、後端、伺服器、資料庫',
    body: { kind: 'demo', render: RolesDemo },
  },
  {
    id: 'frontend',
    title: '前端是用什麼寫的',
    body: { kind: 'demo', render: FrontendDemo },
  },
  {
    id: 'images',
    title: '圖片是怎麼放進網頁的',
    body: { kind: 'demo', render: ImageLoadDemo },
  },

  /* ── 第二章 建構並部署 ──────────────────────────────────── */

  {
    id: 'ch-build',
    title: '第二章',
    body: {
      kind: 'title',
      kicker: 'Chapter 02',
      heading: '建構你第一個網站並進行部署',
      lead: [
        '把想要的網站一次講清楚，交給 Codex 寫出來，先在自己的電腦上預覽。',
        '確認沒問題之後，用 ChatGPT Sites 部署成一個別人也打得開的網址。',
      ],
    },
  },

  /* prompt-writing 的 2、3 頁 */

  {
    id: 'mainline',
    title: '一條從零到完成的線',
    body: {
      kind: 'split',
      ratio: '2:3',
      left: {
        kind: 'points',
        heading: '這條線在說什麼？',
        items: [
          {
            text: '起點是什麼都還沒有，終點是這件事做完了',
            note: '可能是一個網頁、一份報表，也可能是一篇文章。',
            accent: 'teal',
          },
          {
            text: '線上的每個節點，都是一次會影響方向的事件',
            note: '你丟一句話、AI 產一段內容、你補一份檔案，都算一個節點。',
            accent: 'acid',
          },
          {
            text: '順利的時候，線是直的，一路走到終點',
            note: '接下來要講的，就是有哪些事會把這條線帶偏。',
            accent: 'teal',
          },
        ],
      },
      right: { kind: 'demo', render: MainlineDemo },
    },
  },
  {
    id: 'three-factors',
    title: '實際運行常常會與預期不同',
    body: { kind: 'demo', render: ThreeFactorsDemo },
  },

  /* 簡化版：提示詞一次給足 */

  {
    id: 'prompt-three',
    title: '一次給足的三件事',
    body: { kind: 'demo', render: PromptThreeDemo },
  },
  {
    id: 'prompt-examples',
    title: '三種寫法，照你的狀況挑',
    body: { kind: 'demo', render: PromptExamplesDemo },
  },
  {
    id: 'codex-tools',
    title: '在 Codex 中你會用到的三件事',
    body: { kind: 'demo', render: CodexToolsDemo },
  },

  /* ChatGPT Sites */

  {
    id: 'what-is-site',
    title: '什麼是 ChatGPT Sites',
    body: { kind: 'demo', render: SiteArchDemo },
  },
  {
    id: 'site-cautions',
    title: 'ChatGPT Sites 的四個注意事項',
    body: { kind: 'demo', render: SiteCautionsDemo },
  },

  /* ── 第三章 串接 Google 試算表 ──────────────────────────── */

  {
    id: 'ch-sheets',
    title: '第三章',
    body: {
      kind: 'title',
      kicker: 'Chapter 03',
      heading: '串接 Google 試算表',
      lead: [
        '網站的資料不一定要放在網站裡。Google 試算表是任何人都看得懂的資料庫。',
        '這一章把登入、權限與部署串起來，最後做出一個家庭記帳工具。',
      ],
    },
  },
  {
    id: 'why-sheets',
    title: '為什麼要串接 Google 試算表',
    body: { kind: 'demo', render: WhySheetsDemo },
  },
  {
    id: 'spreadsheet',
    title: '試算表裡的資料長什麼樣子',
    body: { kind: 'demo', render: SpreadsheetDemo },
  },
  {
    id: 'google-service',
    title: '開通 Google 服務',
    body: { kind: 'demo', render: GoogleServiceDemo },
  },
  {
    id: 'access',
    title: '權限控管：三道門',
    body: { kind: 'demo', render: AccessLayersDemo },
  },
  {
    id: 'vue-concepts',
    title: '進階網站會遇到的三個概念',
    body: { kind: 'demo', render: VueConceptsDemo },
  },
  {
    id: 'advanced-prompt',
    title: '進階網站的提示詞',
    body: { kind: 'demo', render: AdvancedPromptDemo },
  },
  {
    id: 'deploy-notes',
    title: '部署前要確認的事',
    body: { kind: 'demo', render: DeployNotesDemo },
  },
  {
    id: 'family-ledger',
    title: '實作：家庭記帳工具',
    body: { kind: 'demo', render: FamilyLedgerDemo },
  },

  /* ── 加碼內容 ───────────────────────────────────────────── */

  {
    id: 'ch-bonus',
    title: '加碼內容',
    body: {
      kind: 'title',
      kicker: 'Bonus',
      heading: '加碼：讓網站記得資料、收得下檔案',
      lead: [
        '第 25 頁提過 ChatGPT Sites 還附了資料庫（D1）與檔案儲存（R2），這堂課的網站沒有用到。',
        '加碼這一段把它們打開：先認識兩者與風險，再用一份新手向的 Skill，從第一份提示詞開始做。',
      ],
    },
  },
  {
    id: 'd1-r2',
    title: 'D1 與 R2：資料庫與檔案上傳空間',
    body: { kind: 'demo', render: StorageDemo },
  },
  {
    id: 'bonus-skill',
    title: '新手向 Skill：chatgpt-sites-d1-r2',
    body: { kind: 'demo', render: SkillDemo },
  },
  {
    id: 'bonus-sample',
    title: '部署範例：Todo 手帳',
    body: { kind: 'demo', render: SampleDemo },
  },
  {
    id: 'bonus-prompt',
    title: '提示詞產生器：開始用 Skill 之前',
    body: { kind: 'demo', render: PromptGeneratorDemo },
  },

  /* ── 收尾 ───────────────────────────────────────────────── */

  {
    id: 'recap',
    title: '重點回顧',
    body: {
      kind: 'points',
      heading: '這堂課的重點',
      items: [
        {
          text: '做網站主要用 Codex，輸入框附近的設定會一路沿用',
          note: 'Chat 討論、Work 產出成果、Codex 攤開開發者介面；專案、核准方式、模型與推理強度都在同一列。',
          accent: 'acid',
        },
        {
          text: '提示詞一次給足三件事',
          note: '要做什麼、手上有什麼、用什麼方式做。不確定內容的時候，先請 AI 給建議再開始。',
          accent: 'acid',
        },
        {
          text: '部署就是正式上線',
          note: 'ChatGPT Sites 提供主機、後端與資料庫；新網站預設只有自己打得開，刪除之後無法還原。',
          accent: 'acid',
        },
        {
          text: '資料放在 Google 試算表，權限分三道門',
          note: '網站的分享設定、Google 登入的測試使用者、試算表的共用設定，各自決定一件事。',
          accent: 'acid',
        },
        {
          text: '進階網站仍然是一包靜態檔案',
          note: 'Vue、元件、路由都用瀏覽器直接執行的版本；公開設定放 config.js，Secret 不放前端。',
          accent: 'acid',
        },
      ],
    },
  },
];
