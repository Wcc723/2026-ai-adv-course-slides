import type { Step } from '../../types/slide';
import {
  CoverDemo,
  ToolFeelDemo,
  SubscriptionDemo,
  AgendaDemo,
  SharedCover,
  ChatgptCover,
  ClaudeCover,
  AntigravityCover,
  OwnToolsCover,
} from './demos-intro';
import { FinalChallengeDemo, HomeworkDemo } from './demos-front';
import { ModelsDemo } from './demos-models';
import { ChatgptAppDemo, ChatgptWorkDemo } from './demos-interface-chatgpt';
import { ChatgptCodexDemo } from './demos-interface-codex';
import { ClaudeAppDemo } from './demos-interface-claude';
import { ProjectsCompareDemo } from './demos-projects-compare';
import { SubscriptionPollDemo } from './demos-subscription-poll';
import { MiniPetDemo } from './demos-mini-pet';
import { GeminiCompareDemo } from './demos-gemini-compare';
import { CommunityToolsDemo } from './demos-community-tools';
import { ExtensionAppsDemo } from './demos-extension-apps';
import {
  ProjectsDemo,
  SmartUiDemo,
  ComputerUseDemo,
  ComputerUsePromptDemo,
} from './demos-shared';
import {
  RemoteControlDemo,
  VoiceMcpDemo,
  ChromeDemo,
  ChromeFormDemo,
} from './demos-shared-2';
import {
  DotDemo,
  ImageGenDemo,
  GifDemo,
  RecordReplayDemo,
  SitesDemo,
} from './demos-chatgpt';
import { ArtifactDemo, StudioDemo, CoddDemo } from './demos-claude';
import { EnvironmentsDemo } from './demos-environments';
import { EnvironmentsTryDemo } from './demos-environments-try';
import { EnvironmentsScenariosDemo } from './demos-environments-scenarios';
import { AntigravityDemo, AntigravityExamplesDemo } from './demos-antigravity';
import {
  PracticeClaudeDemo,
  PracticeDevicesDemo,
  PracticeDevicesShotsDemo,
} from './demos-practice';
import { PracticeProjectPromptDemo } from './demos-practice-prompt';
import { withVote } from './vote';
import { VoteResultsDemo } from './vote-ui';

export const slideTitle = 'AI 桌面助理開發實戰－ChatGPT vs Claude';
export const slideSubtitle = 'ChatGPT vs Claude Desktop';

/*
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * Notion「課綱 › ChatGPT vs Claude」（2026-11-10 版），加上講師的 CODD 筆記
 * 「簡報調整」（codd://note/note-xcra，2026-11-10 17:17）：
 *   - 開場前方新增「最後一堂課想看哪一類挑戰」（現場單選投票）與「作業挑戰」
 *   - 新增小章節 Google Antigravity；Environments 一度拿掉，講師之後要求補回 Claude Desktop 的環境
 *     （範例在 課綱範例/第五堂/Claude/env-switch-demo/；
 *     現在的兩頁見下方 2026-11-19 那兩段）
 *   - 混合使用改寫成「目前實戰中怎麼用這些工具」：CODD 放前面，後面接 Claude 系列、
 *     跨裝置流程（架構圖＋實際畫面）、ChatGPT 系列與混合使用
 *
 * 講師 2026-11-17 的第二輪調整：
 *   - 「補充：ChatGPT 的 Work 邏輯」移到「共有的能力」前面，拆成用介面講的四頁
 *     （ChatGPT 的 Chat／Work／Codex、Work、Codex，再補 Claude 的介面：對話＋Code，Cowork 已併入對話）
 *   - 專案管理後面補一頁：ChatGPT、Claude 的專案差在哪
 *   - 跨裝置流程後面補一頁：建立 GitHub Project 的完整提示詞（含 Agent 欄位）
 *
 * 講師 2026-11-18 的第三輪調整（CODD 筆記「簡報調整」codd://note/note-plus）：
 *   - 「卡斯伯目前訂閱」後面補一頁現場投票：訂閱了哪些方案（複選）、方案額度（單選）
 *   - 第 8–11 頁的介面示意加上明顯的 ChatGPT／Claude 標籤
 *   - Sites 後面補 ChatGPT 專屬功能「Mini 寵物」
 *   - Environments 改成只用同一台 Mac 示範（不用 Mac mini）；2026-11-19 再改，見下一段
 *   - Antigravity 章節頁的論述：IDE 還在，另外多了桌面版應用程式；
 *     Antigravity 後面補一張 Gemini 與 ChatGPT、Claude 的比較表（講師的評分）
 *   - CODD 前面補章節頁「開發屬於自己的工具」與「社群上的自製工具」
 *   - GitHub Project 提示詞改成分階段複製；移除「實戰：ChatGPT 系列與混合使用」
 *   - 投票結果頁最下方補連結，回到第 2 頁的挑戰投票
 *
 * 講師 2026-11-19 調整 Environments（當時第 33–35 頁，頁數不變；同一天又改了一次，見下一段）：
 *   只講 Local 與 Cloud（不示範 SSH／Docker），圍繞兩個問題：環境與專案程式碼是什麼關係、
 *   環境變數能不能套用到專案上；重點是安全性與不同環境下的開發。三頁改成：
 *   環境和專案程式碼的關係（對照圖）→ 環境變數能套用到專案嗎（三段示範、安全結論、誰讀得到）
 *   → 實作（三句提示詞，Local／已存環境／Cloud 的 ③ 輸出，加上這個功能拿來做什麼）。
 *
 * 講師 2026-11-19 第二次調整 Environments（共 47 頁 → 46 頁）：
 *   - 第 33 頁改成「選 Claude 在哪裡開發」：不講 git（拿掉 message.txt 還沒 commit 的開關與
 *     Local｜GitHub｜Cloud 的逐列對照），改成少字的概念圖：本機（Local）／雲端（Cloud）／
 *     遠端（SSH，這堂課不示範）三種開發模式，點了看「可以做什麼」（講師寫的三個用途：
 *     雲端開發、排程自動化、遠端開發）。
 *   - 第 34 頁「環境變數能套用到專案嗎？」整頁移除（講師：造成困惑）。
 *   - 實作頁（現在第 34 頁）底部的「這個功能拿來做什麼」移到第 33 頁，提示詞與輸出不變。
 *   - 原本第 35–47 頁各減 1 → 第 34–46 頁。
 *
 * 講師 2026-11-19 第三次調整 Environments（共 46 頁 → 47 頁）：
 *   「可以用來做什麼，你幫我上網查（也包含我介紹的），然後 34 page 後方補一頁可以用到的情境」
 *   - 實作頁（第 34 頁）後面補第 35 頁「Environments：可以用在哪些情境」（demos-environments-scenarios.tsx）：
 *     本機／雲端／排程自動化／遠端四欄九個具體情境（含講師的三個用途；原本標「講師常用」，講師要求拿掉），
 *     點卡片看一句補充與出處；情境是上網查來、逐條對過原文的（出處與查核日在那個檔的檔頭）。
 *   - 原本第 35–46 頁各加 1 → 第 36–47 頁；投票頁數不變（新頁沒有投票）。
 *
 * 2026-11-20（共 47 頁 → 48 頁）：
 *   - 第 41 頁「社群上的自製工具」後面補第 42 頁「作業靈感：可以替自己做哪些工具」
 *     （demos-extension-apps.tsx）：第 3 頁作業的靈感牆，講師指定的八個點子，每個只有名字
 *     （兩個附講師原文的小字），點卡片只是標示。不列現成產品、不給答案；
 *     稍早列查證過的現成工具那一版被講師退回。
 *   - 原本第 42–47 頁各加 1 → 第 43–48 頁；投票頁數不變（新頁沒有投票）。
 *   - 同一天講師再調整第 42 頁：「左邊是選項、右邊是示意圖，也可以使用 Codex Image 來生成概念圖」。
 *     4 × 2 卡片牆拿掉，改成左邊八個選項（一次選一個，預設 01）、右邊大張概念圖
 *     （images/idea-*.webp，八張 Codex image_generation 生成的 3:2 插圖，prompt 記在那個檔的檔頭）。
 *
 * 頁序：開場（投票、作業、體感、訂閱、訂閱投票、重點）→ 兩家桌面版的介面 → 共有的能力
 *   → ChatGPT 獨特的能力 → Claude 獨特的能力 → 小章節 Google Antigravity
 *   → 開發屬於自己的工具（社群的工具、作業靈感、CODD、實戰）→ 投票結果
 *
 * 投票：功能頁底部 1～5 分（withVote），走 Cloudflare 的 WebSocket（vote-*.ts），
 * 最後一頁是即時排行。第 2 頁的挑戰投票是同一條連線上的單選題（vote-topics.ts 的 POLL）。
 *
 * 現場影片（不進 repo，課堂上從本機播放）：
 *   課綱範例/第五堂/Computer Use 玩遊戲.mp4
 *   ChatGPT 用 Record & Replay 錄出來的技能（mabinogi-town-travel）去操作手遊，
 *   記在 Record & Replay 頁「玩你的遊戲」旁邊。
 *
 * 這一份沒有 description，也沒有 caption：標題說這一頁在講什麼，
 * demo 自己說現在發生什麼（跟第四堂課一致）。
 *
 * 「本次重點：桌面版」那一頁的目錄是 demos-intro.tsx 手寫的（不能 import 這個檔，
 * 會循環引用），這裡增刪或調換頁面時要一起改。
 */
export const steps: Step[] = [
  /* ── 開場 ───────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: { kind: 'demo', render: CoverDemo, bare: true },
  },
  {
    id: 'final-challenge',
    title: '最後一堂課，你想看哪一類的挑戰？',
    body: { kind: 'demo', render: FinalChallengeDemo },
  },
  {
    id: 'homework',
    title: '作業挑戰：替自己的開發做一個工具',
    body: { kind: 'demo', render: HomeworkDemo },
  },
  {
    id: 'tool-feel',
    title: '目前對於 AI 工具的體感',
    body: { kind: 'demo', render: ToolFeelDemo },
  },
  {
    id: 'subscriptions',
    title: '卡斯伯目前訂閱',
    body: { kind: 'demo', render: SubscriptionDemo },
  },
  {
    id: 'subscription-poll',
    title: '你目前訂閱了哪些方案？',
    body: { kind: 'demo', render: SubscriptionPollDemo },
  },
  {
    id: 'desktop-focus',
    title: '本次重點：桌面版',
    body: { kind: 'demo', render: AgendaDemo },
  },

  /* ── 兩家桌面版的介面 ───────────────────────────────────── */

  {
    id: 'chatgpt-app',
    title: 'ChatGPT 桌面版的介面：Chat、Work、Codex',
    body: { kind: 'demo', render: ChatgptAppDemo },
  },
  {
    id: 'chatgpt-work',
    title: 'ChatGPT Work：在本機跑，還是交給雲端',
    body: { kind: 'demo', render: ChatgptWorkDemo },
  },
  {
    id: 'chatgpt-codex',
    title: 'ChatGPT Codex：寫程式的地方',
    body: { kind: 'demo', render: ChatgptCodexDemo },
  },
  {
    id: 'claude-app',
    title: 'Claude 桌面版的介面：對話與 Code',
    body: { kind: 'demo', render: ClaudeAppDemo },
  },

  /* ── 共有的能力 ─────────────────────────────────────────── */

  {
    id: 'shared-cover',
    title: 'ChatGPT、Claude 共有的能力',
    body: { kind: 'demo', render: SharedCover, bare: true },
  },
  {
    id: 'models',
    title: '模型強度',
    body: { kind: 'demo', render: ModelsDemo },
  },
  {
    id: 'projects',
    title: '專案管理',
    body: { kind: 'demo', render: withVote(ProjectsDemo, 'projects') },
  },
  {
    id: 'projects-compare',
    title: '專案管理：ChatGPT、Claude 的專案差在哪',
    body: { kind: 'demo', render: ProjectsCompareDemo },
  },
  {
    id: 'smart-ui',
    title: '智慧型互動介面',
    body: { kind: 'demo', render: withVote(SmartUiDemo, 'smart-ui') },
  },
  {
    id: 'computer-use',
    title: 'Computer Use',
    body: { kind: 'demo', render: withVote(ComputerUseDemo, 'computer-use') },
  },
  {
    id: 'computer-use-try',
    title: 'Computer Use 實作：到 Discord 留言',
    body: { kind: 'demo', render: ComputerUsePromptDemo },
  },
  {
    id: 'remote-control',
    title: 'Remote Control',
    body: {
      kind: 'demo',
      render: withVote(RemoteControlDemo, 'remote-control'),
    },
  },
  {
    id: 'voice-mcp',
    title: '語音搭配 MCP',
    body: { kind: 'demo', render: withVote(VoiceMcpDemo, 'voice-mcp') },
  },
  {
    id: 'ai-in-chrome',
    title: 'AI in Chrome',
    body: { kind: 'demo', render: withVote(ChromeDemo, 'ai-in-chrome') },
  },
  {
    id: 'chrome-form',
    title: 'AI in Chrome 實作：幫我填表單',
    body: { kind: 'demo', render: ChromeFormDemo },
  },

  /* ── 獨特的能力：ChatGPT ────────────────────────────────── */

  {
    id: 'chatgpt-cover',
    title: '獨特的能力：ChatGPT',
    body: { kind: 'demo', render: ChatgptCover, bare: true },
  },
  {
    id: 'dot',
    title: 'Dot',
    body: { kind: 'demo', render: withVote(DotDemo, 'dot') },
  },
  {
    id: 'image-gen',
    title: '圖片生成',
    body: { kind: 'demo', render: withVote(ImageGenDemo, 'image-gen') },
  },
  {
    id: 'gif',
    title: 'GIF 生成',
    body: { kind: 'demo', render: withVote(GifDemo, 'gif') },
  },
  {
    id: 'record-replay',
    title: 'Record & Replay',
    body: {
      kind: 'demo',
      render: withVote(RecordReplayDemo, 'record-replay'),
    },
  },
  {
    id: 'sites',
    title: 'Sites',
    body: { kind: 'demo', render: withVote(SitesDemo, 'sites') },
  },
  {
    id: 'mini-pet',
    // 「Mini 寵物」是講師筆記的說法；冒號後是官方繁中名稱（learn.chatgpt.com/zh-Hant/docs/pets，
    // 查核日 2026-11-18：智慧精靈＝Pets，另有「迷你介面」選項），見 demos-mini-pet.tsx 檔頭
    title: 'Mini 寵物：智慧精靈（Pets）',
    body: { kind: 'demo', render: withVote(MiniPetDemo, 'mini-pet') },
  },

  /* ── 獨特的能力：Claude ─────────────────────────────────── */

  {
    id: 'claude-cover',
    title: '獨特的能力：Claude',
    body: { kind: 'demo', render: ClaudeCover, bare: true },
  },
  {
    id: 'artifact',
    title: '互動式 Artifact',
    body: { kind: 'demo', render: withVote(ArtifactDemo, 'artifact') },
  },
  {
    id: 'claude-studio',
    title: 'Slides、Design、Dashboards、Motion',
    body: { kind: 'demo', render: withVote(StudioDemo, 'claude-studio') },
  },
  {
    id: 'environments',
    title: 'Environments：選 Claude 在哪裡開發',
    body: {
      kind: 'demo',
      render: withVote(EnvironmentsDemo, 'environments'),
    },
  },
  {
    id: 'environments-try',
    title: 'Environments 實作：同一個專案，Local 和 Cloud 各跑一次',
    body: { kind: 'demo', render: EnvironmentsTryDemo },
  },
  {
    id: 'environments-scenarios',
    title: 'Environments：可以用在哪些情境',
    body: { kind: 'demo', render: EnvironmentsScenariosDemo },
  },

  /* ── 小章節：Google Antigravity ────────────────────────── */

  {
    id: 'antigravity-cover',
    title: '小章節：Google Antigravity',
    body: { kind: 'demo', render: AntigravityCover, bare: true },
  },
  {
    id: 'antigravity',
    title: 'Google Antigravity',
    body: { kind: 'demo', render: withVote(AntigravityDemo, 'antigravity') },
  },
  {
    id: 'gemini-compare',
    title: '比較表：Gemini 與 ChatGPT、Claude',
    body: { kind: 'demo', render: GeminiCompareDemo },
  },
  {
    id: 'antigravity-examples',
    title: 'Antigravity 實例：互動式視覺化與遊戲',
    body: { kind: 'demo', render: AntigravityExamplesDemo },
  },

  /* ── 開發屬於自己的工具：社群的工具、作業靈感、CODD、實戰中的用法 ─── */

  {
    id: 'own-tools-cover',
    title: '開發屬於自己的工具',
    body: { kind: 'demo', render: OwnToolsCover, bare: true },
  },
  {
    id: 'community-tools',
    title: '社群上的自製工具',
    body: { kind: 'demo', render: CommunityToolsDemo },
  },
  {
    id: 'extension-apps',
    title: '作業靈感：可以替自己做哪些工具',
    body: { kind: 'demo', render: ExtensionAppsDemo },
  },
  {
    id: 'codd',
    title: 'CODD：我自己開發的工具',
    body: { kind: 'demo', render: withVote(CoddDemo, 'codd') },
  },
  {
    id: 'practice-claude',
    title: '實戰：Claude 系列（CLI 搭配自行開發的擴充）',
    body: { kind: 'demo', render: PracticeClaudeDemo },
  },
  {
    id: 'practice-devices',
    title: '實戰：跨裝置的開發流程',
    body: { kind: 'demo', render: PracticeDevicesDemo },
  },
  {
    id: 'practice-devices-shots',
    title: '實戰：跨裝置流程的實際畫面',
    body: { kind: 'demo', render: PracticeDevicesShotsDemo },
  },
  {
    id: 'practice-project-prompt',
    title: '實戰：用一段提示詞建立 GitHub Project',
    body: { kind: 'demo', render: PracticeProjectPromptDemo },
  },

  /* ── 投票結果 ───────────────────────────────────────────── */

  {
    id: 'vote-results',
    title: '投票結果',
    body: { kind: 'demo', render: VoteResultsDemo },
  },
];
