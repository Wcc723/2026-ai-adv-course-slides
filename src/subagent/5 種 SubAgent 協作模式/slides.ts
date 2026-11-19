import type { Step } from '../../types/slide';
import {
  CoverDemo,
  RoadmapDemo,
  Level1Cover,
  Level2Cover,
  Level3Cover,
  Level4Cover,
  Level5Cover,
} from './demos-intro';
import {
  MainAgentDemo,
  SubAgentDemo,
  OutsourceDemo,
  BenefitsDemo,
} from './demos-level1';
import {
  WorkflowsDemo,
  UltracodeDemo,
  LoopFlowDemo,
  HumanLoopDemo,
  LoopEngineerDemo,
} from './demos-level23';
import {
  RemoteAgentDemo,
  RemoteScenarioDemo,
  ChatGptArchDemo,
  HermesArchDemo,
  HermesFeaturesDemo,
} from './demos-level45';

export const slideTitle = '5 種 SubAgent 協作模式';
export const slideSubtitle = 'SubAgent Patterns';

/*
 * 二十三頁的節奏：
 *   1–3    封面、五個 Level 總覽、先認識主 Agent
 *   4–7    Level 1 基礎 SubAgent：是什麼 → 外包的比喻 → 好處
 *   8–10   Level 2 Ultra Code：dynamic workflows → 怎麼開啟（ultracode）
 *   11–14  Level 3 Loop Engineering：流程 → 傳統 AI Coding → 工程師要做的事
 *   15–18  Level 4 Remote Agent：概念 → 使用情境 → 我自己用在哪
 *   19–22  Level 5 Hermes Agent：ChatGPT 架構 → Hermes 架構 → 特點
 *   23     重點回顧
 *
 * 內容來源：Notion「暫存 › 5 種 SubAgent 協作模式」的 callout 區塊。
 * 第 9、10 頁的兩張截圖也是從那一頁下載的（images/workflows.png、ultracode.png）；
 * 封面、第 16–17 頁的插圖是 Codex Image 產的。
 *
 * demo 分四個檔案：demos-intro（封面、總覽、章節頁）、demos-level1、
 * demos-level23、demos-level45。
 *
 * 跟〈從 0 到 1 的網站開發〉一樣沒有 description、也沒有 caption：
 * 標題說這一頁在講什麼，demo 自己說現在發生什麼。
 */
export const steps: Step[] = [
  /* ── 開場 ───────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: { kind: 'demo', render: CoverDemo, bare: true },
  },
  {
    id: 'roadmap',
    title: '五個 Level 的協作模式',
    body: { kind: 'demo', render: RoadmapDemo },
  },
  {
    id: 'main-agent',
    title: '先認識主 Agent',
    body: { kind: 'demo', render: MainAgentDemo },
  },

  /* ── Level 1 基礎 SubAgent ─────────────────────────────── */

  {
    id: 'level-1',
    title: 'Level 1',
    body: { kind: 'demo', render: Level1Cover, bare: true },
  },
  {
    id: 'subagent',
    title: 'SubAgent 是什麼？',
    body: { kind: 'demo', render: SubAgentDemo },
  },
  {
    id: 'outsource',
    title: 'SubAgent 的概念',
    body: { kind: 'demo', render: OutsourceDemo },
  },
  {
    id: 'benefits',
    title: '這樣做有什麼好處？',
    body: { kind: 'demo', render: BenefitsDemo },
  },

  /* ── Level 2 Ultra Code ────────────────────────────────── */

  {
    id: 'level-2',
    title: 'Level 2',
    body: { kind: 'demo', render: Level2Cover, bare: true },
  },
  {
    id: 'workflows',
    title: 'Claude Code 的 dynamic workflows',
    body: { kind: 'demo', render: WorkflowsDemo },
  },
  {
    id: 'ultracode',
    title: '開啟 dynamic workflows',
    body: { kind: 'demo', render: UltracodeDemo },
  },

  /* ── Level 3 Loop Engineering ──────────────────────────── */

  {
    id: 'level-3',
    title: 'Level 3',
    body: { kind: 'demo', render: Level3Cover, bare: true },
  },
  {
    id: 'loop',
    title: 'Loop Engineering',
    body: { kind: 'demo', render: LoopFlowDemo },
  },
  {
    id: 'ai-coding',
    title: 'AI Coding 工程師做什麼',
    body: { kind: 'demo', render: HumanLoopDemo },
  },
  {
    id: 'loop-engineer',
    title: 'Loop Engineering 工程師做什麼',
    body: { kind: 'demo', render: LoopEngineerDemo },
  },

  /* ── Level 4 Remote Agent ──────────────────────────────── */

  {
    id: 'level-4',
    title: 'Level 4',
    body: { kind: 'demo', render: Level4Cover, bare: true },
  },
  {
    id: 'remote',
    title: 'Remote Agent',
    body: { kind: 'demo', render: RemoteAgentDemo },
  },
  {
    id: 'remote-scenarios',
    title: 'Remote Agent 使用情境',
    body: { kind: 'demo', render: RemoteScenarioDemo },
  },
  {
    id: 'my-usage',
    title: 'Remote Agent 我自己用在哪？',
    body: {
      kind: 'points',
      items: [
        {
          text: '遠端控制電腦',
          note: '員工旅遊的時候，透過 Remote Control 控制我的電腦，修正一些 coding 上的問題。',
          accent: 'acid',
        },
        {
          text: '自動化操作',
          note: '安排 AI 自動排程，幫我批改學生的作業。',
          accent: 'acid',
        },
        {
          text: '排程工作',
          note: '有一個串接 LINE 的 AI，會定期發訊息給我跟我老婆。',
          accent: 'acid',
        },
      ],
    },
  },

  /* ── Level 5 Hermes Agent ──────────────────────────────── */

  {
    id: 'level-5',
    title: 'Level 5',
    body: { kind: 'demo', render: Level5Cover, bare: true },
  },
  {
    id: 'chatgpt-arch',
    title: '直接使用 ChatGPT 的架構',
    body: { kind: 'demo', render: ChatGptArchDemo },
  },
  {
    id: 'hermes-arch',
    title: 'Hermes Agent 的架構',
    body: { kind: 'demo', render: HermesArchDemo },
  },
  {
    id: 'hermes-features',
    title: 'Hermes Agent 特點',
    body: { kind: 'demo', render: HermesFeaturesDemo },
  },

  /* ── 收尾 ───────────────────────────────────────────────── */

  {
    id: 'recap',
    title: '重點回顧',
    body: {
      kind: 'points',
      items: [
        {
          text: 'Level 1｜基礎 SubAgent',
          note: '跟你對話的是主 Agent，它可以把工作交給 SubAgent：更快、更輕鬆、更專業。',
          accent: 'acid',
        },
        {
          text: 'Level 2｜Ultra Code',
          note: '把 Claude Code 調成 ultracode（xhigh ＋ workflows），它會自己決定要不要開大量 SubAgent。',
          accent: 'acid',
        },
        {
          text: 'Level 3｜Loop Engineering',
          note: '工程師從「每一輪都下 prompt」變成設計 Loop、完善 Harness、決定觸發方式與邊界。',
          accent: 'acid',
        },
        {
          text: 'Level 4｜Remote Agent',
          note: '用手機遠端控制另一台電腦上的 Agent，或讓它在獨立裝置上照排程工作。',
          accent: 'acid',
        },
        {
          text: 'Level 5｜Hermes Agent',
          note: '裝在自己電腦上的 Agent：不綁模型、持續學習、派 SubAgent、串接各種服務。',
          accent: 'acid',
        },
      ],
    },
  },
];
