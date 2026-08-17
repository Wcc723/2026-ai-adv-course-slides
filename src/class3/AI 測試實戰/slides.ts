import type { Step } from '../../types/slide';
import {
  MultiProjectDemo,
  WhySplitDemo,
  CrossProjectDemo,
  OpenApiBridgeDemo,
  PostmanDemo,
} from './demos-project';
import { EslintDemo, AiRulesDemo } from './demos-rules';
import {
  WhyTestDemo,
  UnitTestDemo,
  IntegrationTestDemo,
  ContractTestDemo,
  E2eTestDemo,
} from './demos-testing';
import { QuizSingleDemo, QuizMultiDemo } from './demos-quiz';
import {
  LowValueTestDemo,
  ContextWindowDemo,
  CheatTestDemo,
  NoStopLoopDemo,
} from './demos-risk';
import {
  ModularTestDemo,
  ModelSwitchDemo,
  ManualTerminalDemo,
} from './demos-fix';
import { CiFlowDemo } from './demos-ci';
import {
  OpenApiExampleDemo,
  StaticCheckExampleDemo,
  TestBranchExampleDemo,
  CiExampleDemo,
} from './demos-example';

export const slideTitle = 'AI 測試實戰';
export const slideSubtitle = '從自動測試到跨專案整合';

export const steps: Step[] = [
  /* ── 開場 ───────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: {
      kind: 'title',
      kicker: 'Class 3',
      heading: 'AI 測試實戰',
      lead: [
        '把功能做出來只是第一步。當 AI 開始大量產出程式碼，決定專案能不能走遠的是規範與測試。',
        '這堂課從跨專案的檔案管理開始，走過四種測試與 AI 協作時的六個風險，最後把測試交給 GitHub Actions。',
        '每一段都有可以直接操作的範例分支，課後可以自己跑一次。',
      ],
      assetId: 'codex-mode',
    },
  },

  {
    id: 'agenda',
    title: '課程大綱',
    description: '三條主線，從專案的邊界一路推到自動化的測試環境。',
    body: {
      kind: 'points',
      items: [
        {
          text: '跨專案的管理',
          note: '專案該怎麼拆，以及怎麼把外部資源交給 AI 而不撐爆 Context。',
          accent: 'acid',
        },
        {
          text: '程式碼規範與測試',
          note: 'ESLint 與 AI Rules 兩層規範，加上四種測試的守備範圍與風險。',
          accent: 'acid',
        },
        {
          text: '把測試交給外部資源',
          note: '用 GitHub Actions 建立一致環境與合併門檻，再接回 AI 的開發迴圈。',
          accent: 'acid',
        },
      ],
    },
  },

  /* ── 一、專案管理 ───────────────────────────────────────── */

  {
    id: 'ch-project',
    title: '第一章',
    body: {
      kind: 'title',
      kicker: 'Chapter 01',
      heading: '跨專案的管理',
      lead: [
        '前端一個 repo、後端一個 repo，AI 卻只看得到你掛給它的目錄。',
        '這一章談專案該怎麼拆，以及跨專案時該給 AI 哪一份檔案。',
      ],
    },
  },

  {
    id: 'multi-project',
    title: '多專案的情境',
    description:
      '正常開發到什麼程度，手上才會同時有多個專案？先看看專案實際長什麼樣子，再談怎麼餵給 AI。',
    body: {
      kind: 'demo',
      render: MultiProjectDemo,
      caption: '小型專案不需要拆；模組與團隊長大之後才依需求拆分',
    },
  },

  {
    id: 'why-split',
    title: '為什麼要拆專案',
    description: '切換兩種做法，看 AI 實際要讀幾個檔案、Context 佔用差多少。',
    body: {
      kind: 'demo',
      render: WhySplitDemo,
      caption:
        '單一大 repo 讀 187 個檔案、Context 92%；拆開後只掛前端加一份 openapi.json，剩 18%',
    },
  },

  {
    id: 'cross-problem',
    title: '跨專案的難題',
    description:
      '三選一試試看：什麼都不給、整包丟進去、只給必要檔案，看 AI 的產出怎麼變。',
    body: {
      kind: 'demo',
      render: CrossProjectDemo,
      caption: '兩個專案之間隔著一條 session 邊界，跨過去的方式決定了成本與正確率',
    },
  },

  {
    id: 'openapi-bridge',
    title: 'OpenAPI 橋接',
    description: '點「讀取 openapi.json」，看右側的 API 清單怎麼長出左側的前端畫面。',
    body: {
      kind: 'demo',
      render: OpenApiBridgeDemo,
      caption: 'openapi.json 是前後端之間唯一需要交換的檔案',
    },
  },

  {
    id: 'postman-ui',
    title: 'Postman 介面',
    description:
      '同一份 openapi.json，AI 讀的是那份 json，開發者看到的則是這個介面。',
    body: {
      kind: 'demo',
      render: PostmanDemo,
      caption:
        'openapi.json 用 openapi-to-postmanv2 轉出來的 Collection，點一下就能打 API',
    },
  },

  {
    id: 'human-vs-ai',
    title: '人看與 AI 看',
    description: '同一份 API，給人跟給 AI 要的是兩種不同的東西。',
    body: {
      kind: 'split',
      ratio: '1:1',
      left: {
        kind: 'points',
        heading: '兩種讀者',
        items: [
          {
            text: '給開發者閱讀與操作 → Postman',
            note: '一個一個打開、填參數、按 Send 驗證回應',
            accent: 'amber',
          },
          {
            text: '給 AI 讀取 → openapi.json',
            note: '機器可解析的規格，AI 不用猜欄位名稱與型別',
            accent: 'teal',
          },
          {
            text: 'Zod 的優點是可以把 API 當作文件使用',
            note: '同一份 schema 同時負責驗證與產生文件，改一次兩邊都對',
            accent: 'teal',
          },
        ],
      },
      right: {
        kind: 'code',
        blocks: [
          {
            language: 'typescript',
            filename: '.claude/settings.json',
            code: `// 讓 AI 讀得到另一個專案的目錄
{
  "permissions": {
    "additionalDirectories": ["../hex-backend"]
  }
}

// 設定之後，對話裡可以直接引用外部專案的檔案
// @../hex-backend/openapi.json`,
            highlightLines: [3, 4, 5],
          },
        ],
      },
    },
  },

  {
    id: 'project-recipes',
    title: '課程範例 · OpenAPI',
    description:
      '課程範例：OpenAPI 的提示詞貼進 Claude Code，右邊是可以直接切過去跑的分支。',
    body: {
      kind: 'demo',
      render: OpenApiExampleDemo,
      caption: 'OpenAPI：提示詞 → Claude Code；分支 → 直接切過去看結果',
    },
  },

  /* ── 二、程式碼規範與測試 ──────────────────────────────── */

  {
    id: 'ch-quality',
    title: '第二章',
    body: {
      kind: 'title',
      kicker: 'Chapter 02',
      heading: '程式碼規範與測試',
      lead: [
        '隨著專案規模成長，程式碼品質往往會偏離最初設定的水準，執行時也可能出現不如預期的狀況。',
        '為了不讓問題累積到後期才處理，我們會在開發過程中先建立規範，並導入測試機制，讓錯誤能及早被發現。',
      ],
    },
  },

  {
    id: 'ch-quality-goals',
    title: '第二章上 · 會學到',
    body: {
      kind: 'points',
      heading: '第二章上 · 你會學到',
      items: [
        {
          text: '把規範拆成兩層寫下來',
          note: '你會逐條勾選 AGENTS.md，看同一個任務的產出從造假的綠燈變成如實回報。',
          accent: 'blue',
        },
        {
          text: '在跑測試之前先用靜態檢查擋一輪',
          note: '型別、build 與 ESLint／Prettier 三道關卡，各自攔得下什麼樣的錯。',
          accent: 'blue',
        },
        {
          text: '看清楚沒有測試時，一次偏差會滾多遠',
          note: '第 3 步弄壞的既有行為要到第 10 步才被發現，回溯成本一路累加。',
          accent: 'blue',
        },
        {
          text: '走過四種測試各自的守備範圍',
          note: 'Unit、Integration、Contract、E2E 都有可以動手玩的示範，看它們各自抓得到什麼。',
          accent: 'blue',
        },
        {
          text: '學會判斷手上這段程式碼該補哪一種',
          note: '判斷的起點不是覆蓋率，是它壞掉的時候你最想先知道什麼。',
          accent: 'blue',
        },
        {
          text: '用七題情境考題檢查自己的判斷',
          note: '四題單選、三題複選，複選那三題會告訴你答案常常不只一個。',
          accent: 'blue',
        },
      ],
    },
  },

  {
    id: 'eslint',
    title: 'ESLint',
    description: '切三個分頁看違規行，再按「自動修正」，注意哪些問題它修不掉。',
    body: {
      kind: 'demo',
      render: EslintDemo,
      caption: 'ESLint 標出違規行與規則名稱：semi、prefer-const、camelcase',
    },
  },

  {
    id: 'ai-rules',
    title: 'AI Rules',
    description:
      '逐條勾選 AGENTS.md 的規則，看右側 AI 的產出跟著變成什麼樣子。',
    body: {
      kind: 'demo',
      render: AiRulesDemo,
      caption:
        'ESLint 是機器讀的規則，AGENTS.md 是 AI 讀的規則；ESLint 只是 JS 的常見選項，不是唯一選擇',
    },
  },

  {
    id: 'static-check',
    title: '課程範例 · 靜態檢查',
    description:
      '課程範例：靜態檢查的提示詞貼進 Claude Code，右邊是可以直接切過去跑的分支。',
    body: {
      kind: 'demo',
      render: StaticCheckExampleDemo,
      caption: '靜態檢查：提示詞 → Claude Code；分支 → 直接切過去看結果',
    },
  },

  {
    id: 'why-test',
    title: '為什麼要測試',
    description:
      '第 3 步加了一個新功能，它悄悄弄壞了既有行為。把「加入測試」打開，看它會停在哪裡。',
    body: {
      kind: 'demo',
      render: WhyTestDemo,
      caption: '沒有測試時，第 3 步的偏差要到第 10 步才被發現，回溯成本一路累加',
    },
  },

  {
    id: 'test-types',
    title: '四種測試',
    description: '這份簡報只講這四種，每一種都有自己的需求、範圍與運作方式。',
    body: {
      kind: 'table',
      columns: ['測試類型', '需求', '測試範圍', '運作方式'],
      rows: [
        [
          'Unit Test',
          '確保單一程式邏輯正確，並能快速定位錯誤',
          '單一函式、方法、元件邏輯或資料轉換',
          '傳入指定輸入，比對實際輸出是否符合預期',
        ],
        [
          'Integration Test',
          '確保個別正常的模組串接後仍能正確合作',
          '元件、Store、Service、資料庫等多個模組之間的互動',
          '啟動部分真實模組，模擬操作並驗證資料流與結果',
        ],
        [
          'API／Contract Test',
          '確保系統之間的功能、資料格式與約定不會被意外破壞',
          'API 狀態碼、欄位、型別、錯誤處理與資料內容',
          '發送 API 請求，檢查回應內容是否符合規格或契約',
        ],
        [
          'E2E Test',
          '確保使用者能在接近正式環境的條件下完成重要任務',
          '從瀏覽器介面到 API、資料庫的完整操作流程',
          '使用自動化瀏覽器模擬點擊、輸入與頁面跳轉，驗證最終結果',
        ],
      ],
      note: '由小到大：Unit 顧單點、Integration 顧串接、Contract 顧約定、E2E 顧整段流程。',
    },
  },

  {
    id: 'test-unit',
    title: 'Unit Test',
    description: '改改看參數，觀察哪一列會從綠燈變成紅燈。',
    body: {
      kind: 'demo',
      render: UnitTestDemo,
      caption: 'Unit Test：固定輸入對固定輸出，錯了立刻知道是哪一列出問題',
    },
  },

  {
    id: 'test-integration',
    title: 'Integration Test',
    description:
      '先看三個模組各自的單元測試全綠，再切到「串起來卻錯」——注意綠燈是怎麼來的。',
    body: {
      kind: 'demo',
      render: IntegrationTestDemo,
      caption:
        'Integration Test：API 只檢查了登入，權限那一關漏掉，對應分支 codex/admin-orders-auth-bug',
    },
  },

  {
    id: 'test-contract',
    title: 'Contract Test',
    description:
      '先逐張判斷哪一個回應符合契約，再切到「一次測全部」——那是 openapi.json 轉出來的 Collection。',
    body: {
      kind: 'demo',
      render: ContractTestDemo,
      caption: 'API／Contract Test：回應要同時符合欄位、型別與狀態碼，缺一不可',
    },
  },

  {
    id: 'test-e2e',
    title: 'E2E Test',
    description:
      '先用「人工手動測」把流程點一遍，感受一下要點幾次，再切成自動跑對照。',
    body: {
      kind: 'demo',
      render: E2eTestDemo,
      caption: 'E2E Test：用真的瀏覽器把整段購物流程走完，對應分支 codex/e2e-required-address-bug',
    },
  },

  {
    id: 'test-lab',
    title: '課程範例 · 測試分支',
    description:
      '課程範例：測試分支的提示詞貼進 Claude Code，右邊是可以直接切過去跑的分支。',
    body: {
      kind: 'demo',
      render: TestBranchExampleDemo,
      caption: '測試分支：提示詞 → Claude Code；分支 → 直接切過去看結果',
    },
  },

  {
    id: 'which-test',
    title: '怎麼選測試',
    description: '先問這段程式碼壞掉會怎樣，再決定要補哪一種測試。',
    body: {
      kind: 'table',
      columns: ['測試類型', '什麼時候要用', '測的是什麼', '這門課的具體案例'],
      rows: [
        [
          { text: 'Unit Test', accent: 'acid' },
          '高風險商業邏輯',
          '單一函式的邏輯運算',
          '九折、折抵上限與最低消費金額是否計算正確',
        ],
        [
          { text: 'Integration Test', accent: 'teal' },
          '容易斷掉的模組串接',
          '多個模組串起來後的協作與資料流',
          {
            note: 'codex/admin-orders-auth-bug',
            text: '管理員訂單 API 是否真的擋掉一般會員',
          },
        ],
        [
          { text: 'API／Contract Test', accent: 'blue' },
          '跨系統依賴',
          '系統之間的欄位、型別、狀態碼與錯誤格式',
          '前端拿到的 price 是 number 還是被改成字串',
        ],
        [
          { text: 'E2E Test', accent: 'violet' },
          '核心商業流程',
          '使用者從頭到尾走完一次的真實流程',
          {
            note: 'codex/e2e-checkout',
            text: '顧客輸入優惠券後，能不能以正確金額完成付款',
          },
        ],
      ],
      note: '同一段功能常常需要兩種以上的測試，先寫哪一種取決於它壞掉的時候你最想先知道什麼。',
    },
  },

  {
    id: 'quiz-single',
    title: '情境單選題',
    description: '四題，每題只選一個答案。先自己判斷，再點開解答。',
    body: {
      kind: 'demo',
      render: QuizSingleDemo,
      caption: '圖例固定在上方：① Unit ② Integration ③ API／Contract ④ E2E',
    },
  },

  {
    id: 'quiz-multi',
    title: '情境複選題',
    description: '三題複選，一個情境可能同時需要兩種以上的測試。',
    body: {
      kind: 'demo',
      render: QuizMultiDemo,
      caption: '複選題：選項之間不是互斥的，重點是說得出各自守住什麼',
    },
  },

  {
    id: 'ch-quality-recap',
    title: '第二章上 · 重點',
    body: {
      kind: 'points',
      heading: '這一段的重點',
      items: [
        {
          text: '規範要分兩層寫，缺一層就會漏',
          note: 'ESLint 擋的是寫出來的程式碼，AGENTS.md 擋的是 AI 產出的方式。',
          accent: 'acid',
        },
        {
          text: '靜態檢查是最便宜的一關',
          note: '型別錯、跑不起來、風格不一致，在寫測試之前就能先解決掉。',
          accent: 'acid',
        },
        {
          text: '測試的價值是把偏差留在發生的那一步',
          note: '它不保證新功能不出錯，而是讓出錯停在第 3 步，不是第 10 步。',
          accent: 'acid',
        },
        {
          text: '四種測試不是四選一',
          note: '三支單元測試全綠，串起來照樣漏掉權限 —— 各層驗得到的東西不一樣。',
          accent: 'acid',
        },
        {
          text: '選測試先問「壞掉時最想先知道什麼」',
          note: '高風險邏輯先補 Unit、跨系統依賴先補 Contract、核心流程才動用 E2E。',
          accent: 'acid',
        },
        {
          text: '同一個情境常常需要兩種以上的測試',
          note: '複選題的重點不是選對名詞，是說得出每一種各自守住什麼。',
          accent: 'acid',
        },
      ],
    },
  },

  /* ── 二（下半）、AI 協作時的測試問題 ───────────────────── */

  {
    id: 'ch-ai-risk',
    title: '第二章（下）',
    body: {
      kind: 'title',
      kicker: 'Chapter 02',
      heading: 'AI 協作時的測試問題',
      lead: [
        '測試本身沒有錯，錯的是它在產生、執行與修正三個階段各自失控的方式。',
      ],
    },
  },

  {
    id: 'ch-ai-risk-goals',
    title: '第二章下 · 會學到',
    body: {
      kind: 'points',
      heading: '第二章下 · 你會學到',
      items: [
        {
          text: '親手刪掉一批說不出價值的測試',
          note: '28 個刪到剩 6 個，你會看到覆蓋率掉了，抓到的 bug 數卻沒有跟著少。',
          accent: 'blue',
        },
        {
          text: '量一次執行階段的代價落在哪裡',
          note: '範圍、輸出與穩定度的代價都記在 Context 上：60% 的用量可以壓回 8%。',
          accent: 'blue',
        },
        {
          text: '認出修正階段的兩個陷阱',
          note: '改測試換來的綠燈，以及沒有上限的修正迴圈，都會讓問題留在原地。',
          accent: 'blue',
        },
        {
          text: '學會寫出說得出價值的測試',
          note: '優先測商業規則、邊界與曾發生的 Bug；說不出價值的就不加。',
          accent: 'blue',
        },
        {
          text: '把測試切成模組來跑',
          note: '一次全跑 4m32s、1,842 行；只跑改到的 coupon 是 11s、34 行。',
          accent: 'blue',
        },
        {
          text: '替上下文換一個地方承接，必要時自己跑',
          note: 'Session／Model／Effort／SubAgent 各有代價，人工跑一次再貼關鍵錯誤往往更省。',
          accent: 'blue',
        },
      ],
    },
  },

  {
    id: 'risk-overview',
    title: '六個問題',
    description: '六個問題分屬三個階段，後面每一頁各拆一個來看。',
    body: {
      kind: 'points',
      items: [
        {
          text: '產生過多低價值測試',
          note: '產生階段｜數量看起來增加了，但多數只驗證實作細節，維護成本高過價值。',
          accent: 'coral',
        },
        {
          text: '測試範圍過大',
          note: '執行階段｜每次修改都跑完整測試，等待時間與 Context 消耗一起被放大。',
          accent: 'coral',
        },
        {
          text: '錯誤輸出過多',
          note: '執行階段｜大量 log 與 stack trace 灌進對話，把真正的關鍵訊息淹沒。',
          accent: 'coral',
        },
        {
          text: '測試結果不穩定（Flaky Test）',
          note: '執行階段｜同一份程式碼時好時壞，AI 會針對不存在的問題反覆修改。',
          accent: 'coral',
        },
        {
          text: '修改測試逃避問題',
          note: '修正階段｜為了讓測試通過而刪除斷言或放寬條件，綠燈了但問題還在。',
          accent: 'coral',
        },
        {
          text: '缺少停止條件',
          note: '修正階段｜失敗就改、改完再跑，沒有次數上限就會一直迴圈下去。',
          accent: 'coral',
        },
      ],
    },
  },

  {
    id: 'risk-low-value',
    title: '低價值測試',
    description: '按「只留說得出價值的」，注意覆蓋率掉了，抓到的 bug 數卻沒變。',
    body: {
      kind: 'demo',
      render: LowValueTestDemo,
      caption: '28 個測試刪到剩 6 個：getter/setter、只驗證實作細節、重複的邊界都可以拿掉',
    },
  },

  {
    id: 'risk-context',
    title: 'Context 消耗',
    description: '先按「跑完整測試」，再按「只跑相關測試」，看容量條的變化。',
    body: {
      kind: 'demo',
      render: ContextWindowDemo,
      caption: '測試 log 是 Context 消耗最快的來源，早期的指示會先被壓縮掉',
    },
  },

  {
    id: 'risk-cheat',
    title: '改測試逃避',
    description: '兩種修法都讓畫面變綠，注意金額有沒有一起變對。',
    body: {
      kind: 'demo',
      render: CheatTestDemo,
      caption: '改測試與改實作，畫面上都是綠燈——綠燈不等於正確',
    },
  },

  {
    id: 'risk-loop',
    title: '沒有停止條件',
    description: '先讓它自己轉幾圈，再打開「最多修 3 次」的開關。',
    body: {
      kind: 'demo',
      render: NoStopLoopDemo,
      caption: '沒有停止條件時，次數、token 與修改範圍會一路發散到不相關的檔案',
    },
  },

  {
    id: 'fix-writing',
    title: '怎麼寫測試',
    description: '解決方案的第一段：控制產生出來的測試數量與品質。',
    body: {
      kind: 'points',
      heading: '產生測試程式碼',
      items: [
        {
          text: '優先測試商業規則、邊界條件、錯誤處理，以及曾經發生的 Bug',
          note: '這四類是真的會出事的地方，其餘的先不要急著補。',
          accent: 'teal',
        },
        {
          text: '使用計劃模式，要求 AI 說明每個測試能防止什麼問題',
          note: '無法說明價值的測試就不加入。',
          accent: 'teal',
        },
        {
          text: '適當使用 Happy Path Test',
          note: '需要快速確認主要功能時，優先測試最常見的成功流程，以降低測試時間與 Context 消耗。高風險商業規則、權限、安全性與例外情境，仍需補充邊界與錯誤測試。',
          accent: 'teal',
        },
      ],
    },
  },

  {
    id: 'fix-modular',
    title: '模組化執行',
    description: '自己選幾個模組，比較「一次全跑」與「只跑改到的」差多少。',
    body: {
      kind: 'demo',
      render: ModularTestDemo,
      caption: '一次全跑 4m32s、輸出 1,842 行；只跑改到的 coupon 是 11s、34 行',
    },
  },

  {
    id: 'fix-models',
    title: '模型與 Session',
    description: '切 Model、Effort、Session 與 SubAgent，看主 session 的佔用怎麼變。',
    body: {
      kind: 'demo',
      render: ModelSwitchDemo,
      caption: '開 SubAgent 時測試 log 留在子代理，主 session 只收到一段摘要',
    },
  },

  {
    id: 'fix-manual',
    title: '手動確認',
    description: '點指令跑一次，再切成失敗的結果對照看。',
    body: {
      kind: 'demo',
      render: ManualTerminalDemo,
      caption: '在終端機自己跑一次 npm run test:module -- coupon，是最快確認狀態的方法',
    },
  },

  {
    id: 'ch-ai-risk-recap',
    title: '第二章下 · 重點',
    body: {
      kind: 'points',
      heading: '這一段的重點',
      items: [
        {
          text: '測試不是越多越好',
          note: '刪掉 22 個說不出價值的之後，覆蓋率掉了 7%，抓到的真實 bug 一個都沒少。',
          accent: 'acid',
        },
        {
          text: '綠燈不等於正確',
          note: '斷言被刪掉之後畫面照樣全綠，算錯的金額原封不動送出去。',
          accent: 'acid',
        },
        {
          text: 'Context 是有限資源，測試 log 消耗最快',
          note: '額度被 log 佔滿時，最先被壓縮掉的是你一開始交代的那些規則。',
          accent: 'acid',
        },
        {
          text: '一定要先給停止條件',
          note: '同一問題最多修三次、之後交回人工，才收得住次數、token 與改動範圍。',
          accent: 'acid',
        },
        {
          text: '只跑跟這次修改相關的測試',
          note: '從 4m32s／1,842 行變成 11s／34 行，省下的同時是時間與 Context。',
          accent: 'acid',
        },
        {
          text: '換 Session 或開 SubAgent 不是讓上下文消失',
          note: '是換一個地方承接它 —— 省的是主 Session 的額度，不是總花費。',
          accent: 'acid',
        },
      ],
    },
  },

  /* ── 三、外部資源與 GitHub Actions ─────────────────────── */

  {
    id: 'ch-ci',
    title: '第三章',
    body: {
      kind: 'title',
      kicker: 'Chapter 03',
      heading: '把測試交給 GitHub Actions',
      lead: [
        '本地端的測試只證明「在你的電腦上會過」。要當成門檻，得換一個乾淨且一致的環境。',
        '這一章把測試搬到遠端，再把結果接回 AI 的開發迴圈。',
      ],
    },
  },

  {
    id: 'why-ci',
    title: '為什麼要 CI',
    description: '三個理由，每一個都同時對人與對 AI 成立。',
    body: {
      kind: 'points',
      items: [
        {
          text: '建立一致的測試環境',
          note: '避免開發者電腦上的 Node.js 版本、環境變數、Cache 與作業系統差異影響測試結果。',
          accent: 'blue',
        },
        {
          text: '建立合併與部署門檻',
          note: '測試、Build 或品質檢查未通過時，可以阻止 PR 合併或後續部署。',
          accent: 'blue',
        },
        {
          text: '將耗時工作移出本地端',
          note: '完整 E2E 與跨環境測試交由遠端執行，減少本地端與 AI 的等待成本。',
          accent: 'blue',
        },
      ],
    },
  },

  {
    id: 'ci-flow',
    title: 'Actions 流程',
    description: '先選成功或失敗情境，再按「git push」讓流程自己跑完。',
    body: {
      kind: 'demo',
      render: CiFlowDemo,
      caption: '從 push 到 Runner、jobs，最後停在合併門檻或失敗的 Log 與 Artifact',
    },
  },

  {
    id: 'ci-pros-cons',
    title: 'CI 的優缺點',
    description: '導入之前先把代價一起看過，再決定哪些測試要搬上去。',
    body: {
      kind: 'split',
      ratio: '1:1',
      left: {
        kind: 'points',
        heading: '優點',
        items: [
          { text: '每次都從相對乾淨且一致的環境執行', accent: 'teal' },
          { text: '可以由 Push、PR、排程或手動操作自動觸發', accent: 'teal' },
          { text: '能統一團隊與 AI 的測試標準', accent: 'teal' },
        ],
      },
      right: {
        kind: 'points',
        heading: '缺點',
        items: [
          { text: '遠端除錯速度通常比本地端慢', accent: 'coral' },
          { text: '環境設定相對複雜', accent: 'coral' },
          { text: 'GitHub Actions 並非完全免費', accent: 'coral' },
        ],
      },
    },
  },

  {
    id: 'ci-how',
    title: '課程範例 · GitHub Actions',
    description:
      '課程範例：GitHub Actions 的提示詞貼進 Claude Code，右邊是可以直接切過去跑的分支。',
    body: {
      kind: 'demo',
      render: CiExampleDemo,
      caption: 'GitHub Actions：提示詞 → Claude Code；分支 → 直接切過去看結果',
    },
  },

  {
    id: 'recap',
    title: '重點回顧',
    description: '三個章節收束成六句，回去之後照著這六條檢查自己的專案。',
    body: {
      kind: 'points',
      items: [
        {
          text: '拆專案，只給 AI 必要的檔案',
          note: 'additionalDirectories 與 openapi.json 是跨專案最小的介面。',
          accent: 'acid',
        },
        {
          text: '規範要分兩層寫',
          note: 'ESLint 給機器讀、AGENTS.md 給 AI 讀，兩層都要寫下來。',
          accent: 'acid',
        },
        {
          text: '四種測試各有守備範圍',
          note: 'Unit 顧單點、Integration 顧串接、Contract 顧約定、E2E 顧流程。',
          accent: 'acid',
        },
        {
          text: '綠燈不等於正確',
          note: '測試被改成配合錯誤答案時，畫面一樣是綠的，金額還是算錯。',
          accent: 'acid',
        },
        {
          text: '給 AI 停止條件與執行範圍',
          note: '最多修三次、只跑改到的模組，是控制成本最有效的兩條線。',
          accent: 'acid',
        },
        {
          text: '把耗時的測試交給 GitHub Actions',
          note: '一致環境、合併門檻，並把 Artifact 留給人與 AI 讀。',
          accent: 'acid',
        },
      ],
    },
  },
];
