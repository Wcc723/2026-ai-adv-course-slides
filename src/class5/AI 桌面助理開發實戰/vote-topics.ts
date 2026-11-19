/*
 * 投票主題清單：slides.ts 的 withVote、最後一頁的投票結果、AI in Chrome 表單的下拉選單、
 * 第 2 頁的挑戰單選題、第 6 頁的訂閱調查共用。
 * id 同時是伺服器的白名單（workers/class5-vote/src/index.ts），增刪或改名要兩邊一起改，
 * 改完要重新部署 Worker（不在白名單的票會被伺服器安靜丟掉）。
 *
 * 2026-11-10 依講師筆記調整：新增 Google Antigravity，另外加一個「最後一堂課想看哪一類挑戰」
 * 的單選投票（POLL）。Environments 一度拿掉，講師之後要求補回（Claude Desktop 的環境）。
 *
 * 2026-11-18 依講師 CODD 筆記「簡報調整」（codd://note/note-plus）：
 * - 新增評分主題 'mini-pet'（ChatGPT 的 Mini 寵物，1～5 分）→ 評分主題 17 個。
 *   label 加上官方繁中名稱「智慧精靈」（learn.chatgpt.com/zh-Hant/docs/pets，查核日 2026-11-18），
 *   跟第 29 頁的標題「Mini 寵物：智慧精靈（Pets）」對得上；投票結果頁與 AI in Chrome 表單的下拉選單都顯示這個字。
 * - 新增第 6 頁「你目前訂閱了哪些方案？」的五個主題（不算進投票結果頁的排行）：
 *     sub-chatgpt／sub-claude／sub-google／sub-other  題一，複選（SUBSCRIPTION_TOPICS）
 *     sub-budget                                      題二，單選（BUDGET_OPTIONS）
 *   協定不變（score 1～5、同一個 clientId 再投一次就是改票），複選的做法見 SUBSCRIPTION_TOPICS。
 */

/** 1～5 分的功能評分主題（投票結果頁的排行只列這些） */
export type ScoreTopicId =
  | 'projects'
  | 'smart-ui'
  | 'computer-use'
  | 'remote-control'
  | 'voice-mcp'
  | 'ai-in-chrome'
  | 'dot'
  | 'image-gen'
  | 'gif'
  | 'record-replay'
  | 'sites'
  | 'mini-pet'
  | 'artifact'
  | 'claude-studio'
  | 'environments'
  | 'antigravity'
  | 'codd';

/**
 * 單選投票。沿用同一套協定：score 1～4 代表第幾個選項（POLL_OPTIONS 的順序），
 * 伺服器回來的 counts[0..3] 就是各選項的票數，counts[4] 永遠是 0。
 */
export const POLL_TOPIC = 'final-challenge';
export type PollTopicId = typeof POLL_TOPIC;

/** 第 6 頁題一（複選）：每個選項各是一個主題 */
export type SubscriptionTopicId = 'sub-chatgpt' | 'sub-claude' | 'sub-google' | 'sub-other';

/** 第 6 頁題二（單選）：做法同 POLL_TOPIC，score 1～4 ＝ BUDGET_OPTIONS 的第幾個 */
export const BUDGET_TOPIC = 'sub-budget';
export type BudgetTopicId = typeof BUDGET_TOPIC;

export type VoteTopicId = ScoreTopicId | PollTopicId | SubscriptionTopicId | BudgetTopicId;

export interface VoteTopic {
  id: ScoreTopicId;
  label: string;
  group: '共有' | 'ChatGPT' | 'Claude' | 'Google' | '卡斯伯';
}

export const VOTE_TOPICS: readonly VoteTopic[] = [
  { id: 'projects', label: '專案管理', group: '共有' },
  { id: 'smart-ui', label: '智慧型互動介面', group: '共有' },
  { id: 'computer-use', label: 'Computer Use', group: '共有' },
  { id: 'remote-control', label: 'Remote Control', group: '共有' },
  { id: 'voice-mcp', label: '語音搭配 MCP', group: '共有' },
  { id: 'ai-in-chrome', label: 'AI in Chrome', group: '共有' },
  { id: 'dot', label: 'Dot', group: 'ChatGPT' },
  { id: 'image-gen', label: '圖片生成', group: 'ChatGPT' },
  { id: 'gif', label: 'GIF 生成', group: 'ChatGPT' },
  { id: 'record-replay', label: 'Record & Replay', group: 'ChatGPT' },
  { id: 'sites', label: 'Sites', group: 'ChatGPT' },
  { id: 'mini-pet', label: 'Mini 寵物（智慧精靈）', group: 'ChatGPT' },
  { id: 'artifact', label: '互動式 Artifact', group: 'Claude' },
  { id: 'claude-studio', label: 'Slides、Design、Dashboards、Motion', group: 'Claude' },
  { id: 'environments', label: 'Environments', group: 'Claude' },
  { id: 'antigravity', label: 'Google Antigravity', group: 'Google' },
  { id: 'codd', label: 'CODD', group: '卡斯伯' },
];

export interface PollOption {
  /** 送給伺服器的 score（1～4） */
  score: 1 | 2 | 3 | 4;
  label: string;
  example: string;
}

/** 「最後一堂課，你想看哪一類的挑戰」的選項（講師筆記 2026-11-10） */
export const POLL_OPTIONS: readonly PollOption[] = [
  { score: 1, label: '商業服務', example: '電商、CRM、商品上下架' },
  { score: 2, label: 'Web Game', example: '瀏覽器上就能玩的遊戲' },
  { score: 3, label: '應用程式', example: '像 CODD、個人記事本' },
  { score: 4, label: '其他', example: '到 Discord 上投票討論' },
];

/* ── 第 6 頁：你目前訂閱了哪些方案？ ─────────────────────── */

/**
 * 題一是複選，但協定一個主題只記一個分數，所以「每個選項一個主題」：
 *   score 1（SUBSCRIBED）＝ 有訂；score 2（UNSUBSCRIBED）＝ 取消勾選。
 * 再點一次就送 2，再點一次又送 1（伺服器把它當改票）。
 * 有訂的人數 ＝ 伺服器回來的 counts[0]；counts[1] 是勾過又取消的人，畫面不顯示。
 */
export const SUBSCRIBED = 1;
export const UNSUBSCRIBED = 2;

export interface SubscriptionOption {
  topic: SubscriptionTopicId;
  label: string;
  /** 卡片上的小字：哪一家的 */
  vendor: string;
}

/** 選項照講師筆記的順序：ChatGPT、Claude、Google AI Ultra、其他 */
export const SUBSCRIPTION_TOPICS: readonly SubscriptionOption[] = [
  { topic: 'sub-chatgpt', label: 'ChatGPT', vendor: 'OpenAI' },
  { topic: 'sub-claude', label: 'Claude', vendor: 'Anthropic' },
  { topic: 'sub-google', label: 'Google AI Ultra', vendor: 'Google' },
  { topic: 'sub-other', label: '其他', vendor: '其他 AI 服務' },
];

export interface BudgetOption {
  /** 送給伺服器的 score（1～4） */
  score: 1 | 2 | 3 | 4;
  label: string;
}

/** 題二「目前訂閱的方案額度」（講師筆記：$20 美元、100、200、200 以上） */
export const BUDGET_OPTIONS: readonly BudgetOption[] = [
  { score: 1, label: '$20' },
  { score: 2, label: '$100' },
  { score: 3, label: '$200' },
  { score: 4, label: '$200 以上' },
];

/** vote-client 建空狀態、過濾伺服器回應用：評分主題＋單選投票＋訂閱調查 */
export const ALL_TOPIC_IDS: readonly VoteTopicId[] = [
  ...VOTE_TOPICS.map((topic) => topic.id),
  POLL_TOPIC,
  ...SUBSCRIPTION_TOPICS.map((option) => option.topic),
  BUDGET_TOPIC,
];
