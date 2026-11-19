import type { Step } from '../../types/slide';
import {
  CoverDemo,
  AgendaDemo,
  Chapter1Cover,
  Chapter2Cover,
  Chapter3Cover,
  Chapter4Cover,
  Chapter5Cover,
  Chapter6Cover,
  HowToOpenDemo,
} from './demos-intro';
import {
  MainAgentDemo,
  SubAgentDemo,
  OutsourceDemo,
  BenefitsDemo,
} from './demos-subagent';
import { ContextWindowDemo, ContextFillingDemo } from './demos-context';
import { CompareDemo, MixDemo } from './demos-concepts';
import { ClaudeTypesDemo, ClaudeInvokeDemo } from './demos-claude';
import { CodexTypesDemo, CodexInvokeDemo } from './demos-codex';
import { GeneralEnoughDemo, WhenCustomDemo } from './demos-choose';
import { DrawbacksDemo, UltracodeExpDemo } from './demos-tradeoffs';
import {
  WorkflowsDemo,
  UltracodeDemo,
  LoopFlowDemo,
  HumanLoopDemo,
  LoopEngineerDemo,
} from './demos-ultracode-loop';
import { SddLoopDemo } from './demos-sdd';
import { TriggerDemo, SchedulerDemo } from './demos-trigger';
import { MoreTriggersDemo } from './demos-trigger-more';
import { GoalDemo } from './demos-goal';
import { BoundaryDemo } from './demos-boundary';
import { LoopRiskDemo } from './demos-risk';
import { UltracodeHowDemo } from './demos-ultracode-how';
import { LoopMdDemo } from './demos-loop-md';
import { CoddDemo } from './demos-codd';
import { ProjectsBoardDemo } from './demos-projects';
import { ProjectsFlowDemo } from './demos-projects-flow';
import { LocalComputeDemo } from './demos-local-compute';

export const slideTitle = 'AI 協作進階－SubAgents 與外部服務整合';
export const slideSubtitle = 'SubAgents & External Services';

/*
 * 四十四頁、六章的節奏（每一章的第一頁是章節頁）：
 *   1        封面
 *   2        課程大綱：六章，點一章看包含哪些頁
 *   3–10     第一章 SubAgent 是什麼：主 Agent → SubAgent → 外包的比喻
 *            → 回顧 Context Window → 什麼會塞爆 Context → 好處 → 怎麼開啟
 *   11–14    第二章 SubAgent、Skill 與 MCP：差異 → 混合使用 → 需要建立嗎
 *   15–22    第三章 實際使用 SubAgent：Claude Code 分類／呼叫
 *            → ChatGPT 分類／呼叫 → 通用型就夠用 → 什麼時候自訂 → 缺點
 *   23–27    第四章 Ultracode：dynamic workflows → 開啟 → 怎麼分工 → 實際使用心得
 *   28–39    第五章 Loop Engineering：回圈 → 傳統 AI Coding → 工程師做什麼
 *            → 重新定義 SDD → 觸發方式 → 定時觸發的三種方案 → loop.md
 *            → 其他觸發方式（Desktop、GitHub Actions、Channels）→ Goal
 *            → 邊界（常見狀況）→ 風險
 *   40–44    第六章 近期的分享：遠端工具 CODD → GitHub Projects 看板
 *            → 專案管理的流程（哪些在 GitHub、哪些在 Claude）→ 本地算力
 *
 * 第 2 頁課程大綱的頁碼是 demos-intro.tsx 的 CHAPTERS 算出來的（不能 import 這個檔，
 * 會循環引用），這裡增刪或調換頁面時，CHAPTERS 的 `pages` 要一起改。
 *
 * 曾經有一頁「具體來說有哪些方法？」（Anthropic〈Getting started with loops〉的
 * 四種 Loop）講師看過後決定拿掉 —— 對學員來說太難懂。
 * 第 32–34、36–39 頁是之後補的段落（2026-10-06，Notion 連線故障，講師直接貼上 callout）。
 * 第 36 頁是講師看完第 34 頁後要求加的：把查文件時看到、callout 沒列的三種做法講清楚。
 * 第 26 頁「Ultracode 怎麼分工」是講師要求加的 Ultracode 說明，只講觀念，範例講師之後補。
 *
 * 2026-10-13 依 Notion「1013 修改」改版（43 → 44 頁）：
 *   - 第 34 頁後面新增第 35 頁 loop.md（demos-loop-md.tsx），原本的 35–38 往後移一頁。
 *   - 移除原本的第 39–43 頁：第六章「外部服務整合」（章節頁、怎麼串接外部服務、
 *     把外部服務交給 SubAgent、PR 一開自動 Code Review）與最後的重點回顧
 *     —— 講師的理由是「跟前面主題落差太大」。原始碼收在
 *     _backup/2026-10-13-class4-before-1013.tar.gz（src/class4 當時還沒進 git）。
 *   - 新增第六章「近期的分享」（第 40–44 頁），內容是講師最近的實際做法：
 *     CODD（demos-codd.tsx）、GitHub Projects 看板（demos-projects.tsx）、
 *     專案管理的流程（demos-projects-flow.tsx）、本地算力（demos-local-compute.tsx）。
 *   課名（slideTitle）沿用 Notion 頁面標題，沒有跟著改。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 規格是 Notion「課綱 › AI 協作進階－SubAgents 與外部服務整合」的 callout。
 * 其中幾段指定沿用其他簡報的頁面：
 *
 *   第 4–6、9 頁        〈5 種 SubAgent 協作模式〉第 3、5、6、7 頁（demos-subagent.tsx）
 *                        MainAgent／SubAgent／Outsource／Benefits
 *   第 24–25、29–31 頁  〈5 種 SubAgent 協作模式〉第 9、10、12、13、14 頁
 *                        （demos-ultracode-loop.tsx）
 *                        Workflows／Ultracode／LoopFlow／HumanLoop／LoopEngineer
 *   第 7–8 頁           2026-interactive-presentive〈常見 AI 專有名詞〉第 11、13 頁
 *                        （demos-context.tsx，那個專案是深色主題，移植時做過色彩轉換）
 *                        ContextWindow／ContextFilling
 *
 * 沿用的頁面一律複製進這個資料夾，不跨簡報 import —— 兩份簡報各自演進。
 *
 * 第 14 頁「需要建立 SubAgent 嗎？」在 Notion 上不是 callout 而是一般段落，
 * 照原文做成一頁，講師確認保留。
 *
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description，也沒有 caption
 * ──────────────────────────────────────────────────────────────
 * 跟〈5 種 SubAgent 協作模式〉一致：標題說這一頁在講什麼，demo 自己說現在發生什麼。
 */
export const steps: Step[] = [
  /* ── 開場 ───────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: { kind: 'demo', render: CoverDemo, bare: true },
  },
  {
    id: 'agenda',
    title: '課程大綱',
    body: { kind: 'demo', render: AgendaDemo },
  },

  /* ── 第一章 SubAgent 是什麼 ────────────────────────────── */

  {
    id: 'chapter-1',
    title: '第一章',
    body: { kind: 'demo', render: Chapter1Cover, bare: true },
  },
  {
    id: 'main-agent',
    title: '先認識主 Agent',
    body: { kind: 'demo', render: MainAgentDemo },
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
    id: 'context-window',
    title: '還記得 Context Window 嗎？',
    body: { kind: 'demo', render: ContextWindowDemo },
  },
  {
    id: 'context-overflow',
    title: '什麼情況會塞爆 Context',
    body: {
      kind: 'split',
      ratio: '2:3',
      left: {
        kind: 'points',
        heading: '什麼情況會超過 Context？',
        items: [
          {
            text: '聊天時間太長',
            note: '前面的對話一直累積，Context 越來越大',
            accent: 'acid',
          },
          {
            text: '一次加入太多文件',
            note: 'PDF、文章、網頁等資料都會占用 Context',
            accent: 'acid',
          },
          {
            text: '程式碼專案太大',
            note: '一次要求 AI 讀大量檔案，很容易吃掉大量 Token',
            accent: 'acid',
          },
          {
            text: '工具回傳大量資料',
            note: '搜尋結果、API、MCP 取得的內容也會被加入',
            accent: 'acid',
          },
        ],
      },
      right: { kind: 'demo', render: ContextFillingDemo },
    },
  },
  {
    id: 'benefits',
    title: '所以使用 SubAgent 的好處是？',
    body: { kind: 'demo', render: BenefitsDemo },
  },
  {
    id: 'how-to-open',
    title: '在 ChatGPT 與 Claude Code 開啟 SubAgent',
    body: { kind: 'demo', render: HowToOpenDemo },
  },

  /* ── 第二章 SubAgent、Skill 與 MCP ─────────────────────── */

  {
    id: 'chapter-2',
    title: '第二章',
    body: { kind: 'demo', render: Chapter2Cover, bare: true },
  },
  {
    id: 'compare',
    title: 'SubAgent 跟 Skill、MCP 不同之處',
    body: { kind: 'demo', render: CompareDemo },
  },
  {
    id: 'mix',
    title: 'SubAgent、Skill、MCP 可以混合使用',
    body: { kind: 'demo', render: MixDemo },
  },
  {
    id: 'when-create',
    title: '需要建立 SubAgent 嗎？',
    body: {
      kind: 'split',
      ratio: '2:3',
      left: {
        kind: 'points',
        heading: '什麼時候值得派出 SubAgent？',
        items: [
          {
            text: '隔離在獨立的 Context',
            note: '把探索、測試輸出、Log 與大量搜尋結果放到 SubAgent 那邊，降低主 Agent 的 Context 污染。',
            accent: 'acid',
          },
          {
            text: '同時處理彼此獨立的任務',
            note: '互不相依的工作可以平行進行，加速任務的完成。',
            accent: 'acid',
          },
        ],
      },
      right: {
        kind: 'table',
        heading: '用哪一種方式？',
        columns: ['使用情境', '建議方式'],
        rows: [
          ['一次性的獨立工作', '直接要求派出 SubAgent，不必建立設定檔'],
          ['經常使用相同角色、指令、模型或權限', { text: '建立自訂型 SubAgent（Custom Agent）', accent: 'acid' }],
          ['只需要重用操作流程，不需要獨立 Context', '建立 Skill'],
          ['需要存取瀏覽器、資料庫或外部服務', '設定 MCP，再決定由主 Agent 或 SubAgent 使用'],
        ],
        note: 'SubAgent 是執行中的工作者；自訂型（Custom Agent）是可以重複使用的角色設定。',
      },
    },
  },

  /* ── 第三章 實際使用 SubAgent ──────────────────────────── */

  {
    id: 'chapter-3',
    title: '第三章',
    body: { kind: 'demo', render: Chapter3Cover, bare: true },
  },
  {
    id: 'claude-types',
    title: 'Claude Code 的 SubAgent 分類',
    body: { kind: 'demo', render: ClaudeTypesDemo },
  },
  {
    id: 'claude-invoke',
    title: 'Claude Code 的 SubAgent 呼叫方式',
    body: { kind: 'demo', render: ClaudeInvokeDemo },
  },
  {
    id: 'codex-types',
    title: 'ChatGPT（Codex）的 SubAgent 分類',
    body: { kind: 'demo', render: CodexTypesDemo },
  },
  {
    id: 'codex-invoke',
    title: 'ChatGPT（Codex）的 SubAgent 呼叫方式',
    body: { kind: 'demo', render: CodexInvokeDemo },
  },
  {
    id: 'general-enough',
    title: '絕大部分通用型就夠用',
    body: { kind: 'demo', render: GeneralEnoughDemo },
  },
  {
    id: 'when-custom',
    title: '什麼時候該用自訂型',
    body: { kind: 'demo', render: WhenCustomDemo },
  },
  {
    id: 'drawbacks',
    title: 'SubAgent 的缺點',
    body: { kind: 'demo', render: DrawbacksDemo },
  },

  /* ── 第四章 Ultracode ──────────────────────────────────── */

  {
    id: 'chapter-4',
    title: '第四章',
    body: { kind: 'demo', render: Chapter4Cover, bare: true },
  },
  {
    id: 'workflows',
    title: 'Ultracode（dynamic workflows）',
    body: { kind: 'demo', render: WorkflowsDemo },
  },
  {
    id: 'ultracode',
    title: '開啟 Ultracode',
    body: { kind: 'demo', render: UltracodeDemo },
  },
  {
    id: 'ultracode-how',
    title: 'Ultracode 怎麼分工',
    body: { kind: 'demo', render: UltracodeHowDemo },
  },
  {
    id: 'ultracode-experience',
    title: 'Ultracode 實際使用心得',
    body: { kind: 'demo', render: UltracodeExpDemo },
  },

  /* ── 第五章 Loop Engineering ───────────────────────────── */

  {
    id: 'chapter-5',
    title: '第五章',
    body: { kind: 'demo', render: Chapter5Cover, bare: true },
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
  {
    id: 'sdd',
    title: '具體怎麼做：重新定義 SDD',
    body: { kind: 'demo', render: SddLoopDemo },
  },
  {
    id: 'triggers',
    title: '觸發方式：不只 Prompt',
    body: { kind: 'demo', render: TriggerDemo },
  },
  {
    id: 'schedulers',
    title: '定時觸發的三種方案',
    body: { kind: 'demo', render: SchedulerDemo },
  },
  {
    id: 'loop-md',
    title: 'loop.md：給 /loop 一份預設工作',
    body: { kind: 'demo', render: LoopMdDemo },
  },
  {
    id: 'more-triggers',
    title: '其他觸發方式',
    body: { kind: 'demo', render: MoreTriggersDemo },
  },
  {
    id: 'goal',
    title: 'Goal：往同一個方向持續開發',
    body: { kind: 'demo', render: GoalDemo },
  },
  {
    id: 'boundaries',
    title: '邊界：經常發生的狀況',
    body: { kind: 'demo', render: BoundaryDemo },
  },
  {
    id: 'loop-risks',
    title: 'Loop Engineering 的風險',
    body: { kind: 'demo', render: LoopRiskDemo },
  },

  /* ── 第六章 近期的分享 ─────────────────────────────────── */

  {
    id: 'chapter-6',
    title: '第六章',
    body: { kind: 'demo', render: Chapter6Cover, bare: true },
  },
  {
    id: 'codd',
    title: '遠端工具更新：CODD',
    body: { kind: 'demo', render: CoddDemo },
  },
  {
    id: 'projects-board',
    title: '專案管理：用 GitHub Projects',
    body: { kind: 'demo', render: ProjectsBoardDemo },
  },
  {
    id: 'projects-flow',
    title: '開發流程：哪些在 GitHub、哪些在 Claude',
    body: { kind: 'demo', render: ProjectsFlowDemo },
  },
  {
    id: 'local-compute',
    title: '本地算力運用',
    body: { kind: 'demo', render: LocalComputeDemo },
  },
];
