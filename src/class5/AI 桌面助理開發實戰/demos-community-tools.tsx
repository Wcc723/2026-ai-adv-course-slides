import { useState, type KeyboardEvent, type MouseEvent } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 開發屬於自己的工具（一）
 *
 *   第 41 頁  CommunityToolsDemo  社群上的自製工具（沒有投票 → 720）
 *   前一頁是章節頁「開發屬於自己的工具」（第 40 頁，demos-intro.tsx 的 OwnToolsCover），
 *   後一頁是第 3 頁作業的靈感牆「作業靈感：可以替自己做哪些工具」（第 42 頁，demos-extension-apps.tsx 的 ExtensionAppsDemo），
 *   再下一頁才是講師自己做的 CODD（第 43 頁，demos-claude.tsx 的 CoddDemo）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-18 的 CODD 筆記「簡報調整」（codd://note/note-plus）：
 *   「CODD：我自己開發的工具：這一頁的前面，你幫我搜尋目前社群上面有哪些自己開發的工具。
 *    就我自己了解的話，蠻多屬於用量監測、切換帳號；近期好像也有幾套比較大的，甚至是
 *    跨 session 的管理，或者是像龍蝦這類的工具，你都幫我把它列出來。」
 * 四個類別照講師列的順序：用量監測 → 切換帳號 → 跨 session 管理 → 龍蝦（個人 AI 助理）。
 * 「龍蝦」是講師的說法，查到的是 OpenClaw（官方吉祥物是龍蝦 Molty）；
 * 「龍蝦」這個中文暱稱本身沒有官方中文出處，畫面寫成類別名稱後面的括號。
 *
 * 查核日 2026-11-18。star 數與授權是用 gh api repos/<repo> 讀 GitHub（研究 agent 當天查），
 * 卡片與細節的說明來自各專案 README 或官方文件：
 *   用量監測
 *   - CodexBar  https://github.com/steipete/CodexBar   MIT · 約 23,204 ★ · v0.84.0（2026-11-07）
 *     「Show usage stats for OpenAI Codex and Claude Code, without having to login.」
 *     macOS menu bar，另有 CLI 與 Linux 版；支援 Codex、Claude、Cursor、Gemini、Copilot 等。
 *     作者 Peter Steinberger，也是 OpenClaw 的作者。
 *   - ccusage   https://github.com/ccusage/ccusage     MIT · 約 19,476 ★（ryoppippi/ccusage 已轉址）
 *     「Analyze coding (agent) CLI token usage and costs from local data」；
 *     支援 Claude Code、Codex、OpenCode、Amp、Gemini CLI、OpenClaw；daily／monthly／session 指令。
 *   - claude-hud  https://github.com/jarrodwatts/claude-hud   MIT · 約 29,237 ★
 *     「context usage, rate limits, active tools, running agents, and todo progress」
 *   - 官方 status line：https://code.claude.com/docs/en/statusline
 *     「Percentage of the 5-hour or 7-day rate limit consumed」（rate_limits 欄位）
 *   切換帳號／供應商
 *   - CC Switch  https://github.com/farion1231/cc-switch   MIT · 約 155,358 ★ · v4.0.34（2026-11-17）
 *     Tauri 桌面 App（Windows／macOS／Linux），切換 API 供應商、集中管理 MCP／Skills／Prompts；
 *     「Only official website: ccswitch.io」
 *   - claude-swap  https://github.com/realiti4/claude-swap   MIT · 約 4,790 ★
 *     「Switch between multiple Claude Code accounts, with automatic rate-limit rotation」
 *   - codex-auth  https://github.com/Loongphy/codex-auth   MIT · 約 2,878 ★
 *     Codex CLI、VS Code 擴充、Codex App 都適用。同類桌面版 codex-switcher（Lampese）約 930 ★。
 *   - Anthropic 條款：https://code.claude.com/docs/en/legal-and-compliance
 *     「assume ordinary, individual usage of Claude Code and the Agent SDK」；
 *     第三方不得收集、儲存或中轉 Claude.ai 憑證。
 *   跨 session 管理
 *   - Conductor  https://www.conductor.build/docs/
 *     「run Claude Code, Codex, Cursor, and OpenCode in parallel」，每個任務有自己的工作區與分支。
 *     官網沒寫授權與公司；「免費、閉源」只見於第三方（alternativeto.net）→ 畫面寫「第三方資料說」，
 *     不列 star 數。
 *   - cmux  https://github.com/manaflow-ai/cmux   GPL-3.0-or-later · 約 28,814 ★
 *     「Ghostty-based macOS terminal with vertical tabs and notifications for AI coding agents」；
 *     「Panes get a blue ring and tabs light up when coding agents need your attention」；
 *     README 有 Claude Code teammate 模式與 cmux hooks setup codex → 支援標 Claude、Codex。
 *     細節的引言是 README 的「The best developers have always built their own tools.」（中譯）。
 *   - claude-mem  https://github.com/thedotmack/claude-mem   Apache-2.0 · 約 118,072 ★
 *     「Your coding agent forgets everything between sessions. Claude-Mem remembers for it.」；
 *     「Works with Claude Code, Codex, Cursor, OpenCode and 11 more agents」；
 *     用 npx claude-mem install 或 Claude Code 的 /plugin 安裝 → 形式標「外掛」；
 *     付費 observer 有 30 天試用，也可以跳過登入（README 2026-11-18）。
 *     講師的「跨 session 的管理」有兩種讀法（平行管理很多 session／跨 session 的記憶），兩種都放。
 *   - Claude Squad（AGPL-3.0，約 8,827 ★）只在類別細節帶過。
 *   - 生態變化：Vibe Kanban 的母公司 bloop 2026-04-10 結束營運、專案改由社群維護
 *     （https://www.vibekanban.com/blog/shutdown）；Crystal 改名 Nimbalyst（stravu/crystal README）；
 *     opcode（前身 Claudia）最後一個正式版是 2025-08-31 的 v0.2.0。
 *   個人 AI 助理（龍蝦）
 *   - OpenClaw  https://github.com/openclaw/openclaw   MIT · 約 394,700 ★ · v2026.10.33（2026-11-18）
 *     在自己電腦上跑，本機 Gateway 是控制中樞，從 WhatsApp、Telegram、Slack、Discord、iMessage 等操作；
 *     模型可換 Claude、Codex 或本機模型。
 *   - 沿革 https://docs.openclaw.ai/start/lore：Clawd／Clawdbot（2025-11-25 起）→ Moltbot（2026-01-27）
 *     → OpenClaw（2026-01-30）。「Anthropic sent a polite email asking for a name change.」
 *     原文括號寫了「trademark stuff」；畫面保守寫成「Anthropic 來信請它改名」。
 *     「Moltbot won, because molting is what lobsters do to grow.」
 *   - https://steipete.me/posts/2026/openclaw：作者加入 OpenAI，
 *     「OpenClaw will move to a foundation and stay open and independent.」（Bloomberg 2026-02-15）
 *   - https://docs.openclaw.ai/concepts/oauth：Codex OAuth 明確支援；Anthropic 訂閱只寫「員工告知又允許了」，
 *     「For Anthropic in production, API key auth is still the safer recommended path.」
 *   延伸：awesome-claude-code https://github.com/hesreallyhim/awesome-claude-code（約 58,260 ★）
 *
 * 補的示意（不是官方原文，也不是講師原話）：
 * - 卡片上的一句話、類別的副標與細節，是照上面的文件濃縮的。
 * - 底部那行「共通點」是這頁要帶出的重點（照主控的安排），呼應第 3 頁的作業挑戰
 *   「替自己的開發做一個工具」；「講師把 01、02、03 做進同一個工具」對照第 43 頁 CODD 的
 *   五項特色（Session、專案管理／Claude 用量剩餘／Claude 快速切換帳號）。
 * - 卡片的 ★ 是四捨五入到千位的 star 數（例：23.2k），細節寫到百位並附查詢日。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 一進頁面什麼都沒選，下方細節區是提示＋star 數的查詢日＋延伸清單。
 *   - 點類別（欄頭）：欄頭加 6px acid 左粗條＋淡底，細節區換成這一類的重點與「要注意／也有」。
 *   - 點工具卡：卡片加 6px acid 左粗條＋淡底，細節區換成這個工具的說明、GitHub 網址（可點）、
 *     star 數與查詢日。
 *   再點一次同一個就取消。連結開新分頁（target=_blank rel=noreferrer）。
 * 鍵盤：按鈕與連結被鍵盤聚焦時，空白鍵與 Enter 只觸發它、不翻頁；滑鼠點完就放掉焦點。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（只有 acid 一支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選中的類別與卡片（6px 左粗條＋/14 淡底）、細節區的左粗條、底部「共通點」的實心標籤。
 *   blue  外部連結（跟 SlideBodyView 表格的 href 一致：底線＋↗）。
 *   其餘一律中性；淡底一定配不透明左粗條，標籤是實心，不靠淡色傳達語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   四欄（每欄 (1740 − 3 × 20) ÷ 4 ＝ 420）480 ＋ 16 ＋ 細節區 152 ＋ 16 ＋ 底部 56 ＝ 720
 *   每欄  欄頭 84 ＋ 10 ＋ 卡片區 386（三張 flex-1 平分：122 × 3 ＋ 10 × 2）
 *         卡片 py 24 ＋ 名稱列 32 ＋ 4 ＋ 一句話 27 ＋ ≥ 6 ＋ 標籤列 28 ≈ 121
 *         一句話 19px，卡片內文字寬 420 − 2 − 6 − 40 ＝ 372 → 一行約 19 字
 *   第四欄  OpenClaw 一張大卡佔滿 386：名稱列、一句話、聊天軟體標籤、改名時間軸、模型＋★
 *   細節區  py 40 ＋ 框 2 ＋ 三欄（380 ／ 1fr ／ 440）各自垂直置中；
 *           中欄說明 21px 兩行內（約 35 字一行）＋ 註 19px 一行
 *   切換選取不改變任何高度：細節區固定 152、卡片固定 flex-1。
 *   浮水印在右上角（舞台 x1692–1872、y104–147）：根容器頂端約在舞台 y184，碰不到；
 *   第四欄欄頭在根容器最右上，但整個在浮水印下方。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

/** 小標（不轉大寫：類別名稱裡有「session」，轉大寫會變成 SESSION） */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.12em]';

const QUERY_DATE = '2026-11-18';

/** 按鈕或連結被鍵盤聚焦時，空白鍵與 Enter 只觸發它、不翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

function ExternalLink({ href, text, size = 'text-[20px]' }: { href: string; text: string; size?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={blurAfterClick}
      onKeyDown={keepActivationKeys}
      className={`inline-flex items-center gap-1.5 font-mono leading-tight whitespace-nowrap text-blue underline underline-offset-4 transition-colors hover:text-acid ${size} ${FOCUS_RING}`}
    >
      {text}
      <span aria-hidden="true" className="font-sans no-underline">
        ↗
      </span>
    </a>
  );
}

/** 帶連字號的名稱（claude-swap、codex-auth、2026-02…）不在連字號處斷行 */
function keepNames(text: string) {
  return text.split(/([A-Za-z0-9.]+(?:-[A-Za-z0-9.]+)+)/).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="flex h-7 shrink-0 items-center rounded-md border border-line px-2 text-[16px] leading-none whitespace-nowrap text-muted">
      {children}
    </span>
  );
}

/* ── 資料 ─────────────────────────────────────────────────── */

type CatId = 'usage' | 'switch' | 'session' | 'claw';

interface Category {
  id: CatId;
  no: string;
  name: string;
  pain: string;
  point: string;
  asideLabel: string;
  aside: string;
}

const CATEGORIES: readonly Category[] = [
  {
    id: 'usage',
    no: '01',
    name: '用量監測',
    pain: '還剩多少額度、花了多少',
    point: '形式最多：menu bar、CLI、Claude Code 外掛都有。官方 status line 現在也提供 5 小時、7 天的用量百分比。',
    asideLabel: '跟作業的關係',
    aside: '第 3 頁作業的範例「AI 額度監控」，就是這一類。',
  },
  {
    id: 'switch',
    no: '02',
    name: '切換帳號／供應商',
    pain: '好幾個帳號、好幾家 API',
    point: 'CC Switch 主打切換 API 供應商、集中管理 MCP 與 Skills；claude-swap、codex-auth 才是單純換帳號。',
    asideLabel: '要注意',
    aside: 'Anthropic 條款：訂閱的用量上限以「一般、個人使用」為前提，也不允許第三方收集或中轉 Claude.ai 憑證。',
  },
  {
    id: 'session',
    no: '03',
    name: '跨 session 管理',
    pain: '同時開很多個 agent',
    point: '兩種方向：平行管理很多個 session（Conductor、cmux，還有 Claude Squad），或讓記憶跨 session（claude-mem）。',
    asideLabel: '來來去去',
    aside: 'Vibe Kanban 的公司收掉、改社群維護；Crystal 改名 Nimbalyst；opcode 一年多沒發新版。',
  },
  {
    id: 'claw',
    no: '04',
    name: '個人 AI 助理（龍蝦）',
    pain: '在聊天軟體裡指揮自己的 AI',
    point: '作者 Peter Steinberger 在 2026-02 加入 OpenAI，OpenClaw 移交基金會、維持開源。',
    asideLabel: '名字的由來',
    aside: 'Moltbot 取自龍蝦蛻殼（molt）長大；吉祥物是一隻龍蝦，叫 Molty。',
  },
];

type ToolId =
  | 'codexbar'
  | 'ccusage'
  | 'claude-hud'
  | 'cc-switch'
  | 'claude-swap'
  | 'codex-auth'
  | 'conductor'
  | 'cmux'
  | 'claude-mem'
  | 'openclaw';

interface Tool {
  id: ToolId;
  cat: CatId;
  name: string;
  /** 形式：CLI、menu bar、桌面 App… */
  form: string;
  /** 卡片上的一句話（19px，一行約 19 字內） */
  line: string;
  /** 支援的工具（OpenClaw 是可換的模型） */
  support: readonly string[];
  /** 卡片上的 star（千位四捨五入）；null ＝ 不列 */
  stars: string | null;
  /** 細節區的 star（百位） */
  starsFull: string | null;
  license: string;
  href: string;
  hrefText: string;
  /** 細節區的說明（21px，兩行內） */
  detail: string;
  /** 細節區的註（19px，一行） */
  note: string;
}

const TOOLS: readonly Tool[] = [
  /* 01 用量監測 */
  {
    id: 'codexbar',
    cat: 'usage',
    name: 'CodexBar',
    form: 'menu bar',
    line: 'menu bar 上看各家用量與重置時間',
    support: ['Codex', 'Claude', '+ 更多'],
    stars: '23.2k',
    starsFull: '約 23,200',
    license: 'macOS · MIT',
    href: 'https://github.com/steipete/CodexBar',
    hrefText: 'github.com/steipete/CodexBar',
    detail: '沿用已登入的帳號，看 Codex、Claude、Cursor、Gemini 等的用量上限與重置時間；另有 CLI 與 Linux 版。',
    note: '作者 Peter Steinberger，也是 04 OpenClaw 的作者。',
  },
  {
    id: 'ccusage',
    cat: 'usage',
    name: 'ccusage',
    form: 'CLI',
    line: '讀本機紀錄，算 token 用量與費用',
    support: ['Claude', 'Codex', '+ 更多'],
    stars: '19.5k',
    starsFull: '約 19,500',
    license: 'npx ccusage · MIT',
    href: 'https://github.com/ccusage/ccusage',
    hrefText: 'github.com/ccusage/ccusage',
    detail: '一行 npx ccusage 就能跑：讀本機紀錄，算出 Claude Code、Codex、Gemini CLI、OpenClaw 等的 token 用量與費用。',
    note: '可以按日、按月、按 session 看。',
  },
  {
    id: 'claude-hud',
    cat: 'usage',
    name: 'claude-hud',
    form: '外掛',
    line: '輸入框下方顯示 context 與用量上限',
    support: ['Claude'],
    stars: '29.2k',
    starsFull: '約 29,200',
    license: 'Claude Code 外掛 · MIT',
    href: 'https://github.com/jarrodwatts/claude-hud',
    hrefText: 'github.com/jarrodwatts/claude-hud',
    detail: '在 Claude Code 輸入框下方顯示 context 用量、用量上限、執行中的工具與 agent、待辦進度。',
    note: '官方 status line 現在也提供 5 小時、7 天的用量百分比。',
  },

  /* 02 切換帳號／供應商 */
  {
    id: 'cc-switch',
    cat: 'switch',
    name: 'CC Switch',
    form: '桌面 App',
    line: '一鍵切換 API 供應商、管理 MCP',
    support: ['Claude', 'Codex', '+ 更多'],
    stars: '155k',
    starsFull: '約 155,400',
    license: 'Windows／macOS／Linux · MIT',
    href: 'https://github.com/farion1231/cc-switch',
    hrefText: 'github.com/farion1231/cc-switch',
    detail: '一鍵切換 API 供應商，集中管理 MCP、Skills、Prompts；Claude Code、Codex、Gemini CLI、OpenClaw 都能用。',
    note: 'README 特別寫明：官網只有 ccswitch.io。',
  },
  {
    id: 'claude-swap',
    cat: 'switch',
    name: 'claude-swap',
    form: 'CLI',
    line: '多帳號切換，快到上限自動輪替',
    support: ['Claude'],
    stars: '4.8k',
    starsFull: '約 4,800',
    license: 'cswap · MIT',
    href: 'https://github.com/realiti4/claude-swap',
    hrefText: 'github.com/realiti4/claude-swap',
    detail: 'Claude Code 的多帳號切換，附用量儀表板；快撞到用量上限前，自動換下一個帳號。',
    note: '用之前先看類別 02 的「要注意」（官方條款）。',
  },
  {
    id: 'codex-auth',
    cat: 'switch',
    name: 'codex-auth',
    form: 'CLI',
    line: '切換、管理多個 Codex 帳號',
    support: ['Codex'],
    stars: '2.9k',
    starsFull: '約 2,900',
    license: 'npm · MIT',
    href: 'https://github.com/Loongphy/codex-auth',
    hrefText: 'github.com/Loongphy/codex-auth',
    detail: '切換、管理多個 Codex 帳號；Codex CLI、VS Code 擴充、Codex App 都適用。',
    note: '桌面 App 版的同類工具：codex-switcher（約 930 ★）。',
  },

  /* 03 跨 session 管理 */
  {
    id: 'conductor',
    cat: 'session',
    name: 'Conductor',
    form: 'Mac App',
    line: '平行跑多個 agent，一個任務一個分支',
    support: ['Claude', 'Codex', '+ 更多'],
    stars: null,
    starsFull: null,
    license: 'Mac App · 官網沒寫授權',
    href: 'https://www.conductor.build/',
    hrefText: 'conductor.build',
    detail: '在 Mac 上平行跑 Claude Code、Codex、Cursor、OpenCode，每個任務有自己的工作區與分支。',
    note: '第三方資料說是免費、閉源的 App（官網沒寫）。',
  },
  {
    id: 'cmux',
    cat: 'session',
    name: 'cmux',
    form: '終端機',
    line: '哪個 agent 在等你，分頁就亮起來',
    support: ['Claude', 'Codex', '+ 更多'],
    stars: '28.8k',
    starsFull: '約 28,800',
    license: 'macOS · GPL-3.0',
    href: 'https://github.com/manaflow-ai/cmux',
    hrefText: 'github.com/manaflow-ai/cmux',
    detail: '以 Ghostty 為基礎的 macOS 終端機：垂直分頁開很多個 session，哪個 agent 需要你就亮起來、跳通知。',
    note: 'README：「最好的開發者，一直都在打造自己的工具。」',
  },
  {
    id: 'claude-mem',
    cat: 'session',
    name: 'claude-mem',
    form: '外掛',
    line: '記下這次 session，帶進下一次',
    support: ['Claude', 'Codex', '+ 更多'],
    stars: '118k',
    starsFull: '約 118,100',
    license: 'npx／Claude Code 外掛 · Apache-2.0',
    href: 'https://github.com/thedotmack/claude-mem',
    hrefText: 'github.com/thedotmack/claude-mem',
    detail: 'agent 換個 session 就忘光；它在旁邊做筆記，下一個 session 開始時帶進重點。支援 Claude Code、Codex、Cursor 等。',
    note: '安裝時會推付費的 observer（30 天試用），不選也能用。',
  },

  /* 04 個人 AI 助理（龍蝦） */
  {
    id: 'openclaw',
    cat: 'claw',
    name: 'OpenClaw',
    form: 'Gateway＋App',
    line: '跑在自己電腦上，從聊天軟體下指令',
    support: ['Claude', 'Codex', '本機模型'],
    stars: '395k',
    starsFull: '約 394,700',
    license: 'Gateway＋CLI，另有手機 App · MIT',
    href: 'https://github.com/openclaw/openclaw',
    hrefText: 'github.com/openclaw/openclaw',
    detail: '開源的個人 AI 助理：本機 Gateway 當控制中樞，從 WhatsApp、Telegram、Slack、Discord、iMessage 下指令。',
    note: 'OpenClaw 文件：Codex 訂閱可直接接；Claude 正式環境仍建議用 API key。',
  },
];

const CLAW_CHANNELS = ['WhatsApp', 'Telegram', 'Slack', 'iMessage'] as const;

/** 改名時間軸（docs.openclaw.ai/start/lore）。why 是換掉這個名字的原因 */
const CLAW_NAMES: readonly { name: string; date: string; why?: string }[] = [
  { name: 'Clawdbot', date: '2025-11', why: 'Anthropic 來信請它改名' },
  { name: 'Moltbot', date: '2026-01-27' },
  { name: 'OpenClaw', date: '2026-01-30' },
];

type Pick = { kind: 'cat'; id: CatId } | { kind: 'tool'; id: ToolId } | null;

/* ── 欄頭（類別） ─────────────────────────────────────────── */

function CategoryHeader({
  cat,
  on,
  onPick,
}: {
  cat: Category;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex h-[84px] shrink-0 flex-col justify-center gap-1 rounded-xl border-l-[6px] px-4 text-left transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'border-l-acid bg-acid/14' : 'border-l-line bg-ink-soft hover:bg-panel-lift'
      }`}
    >
      <span className="flex items-baseline gap-3">
        <span
          className={`font-display text-[20px] leading-none font-semibold tabular-nums ${
            on ? 'text-acid' : 'text-faint'
          }`}
        >
          {cat.no}
        </span>
        <span className="text-[25px] leading-tight font-semibold whitespace-nowrap text-paper">
          {cat.name}
        </span>
      </span>
      <span className="text-[18px] leading-snug whitespace-nowrap text-muted">{cat.pain}</span>
    </button>
  );
}

/* ── 工具卡 ───────────────────────────────────────────────── */

function cardLook(on: boolean) {
  return on
    ? 'border-acid border-l-acid bg-acid/14'
    : 'border-line border-l-line bg-panel hover:bg-panel-lift';
}

function StarCount({ tool }: { tool: Tool }) {
  if (!tool.stars) return null;
  return (
    <span
      aria-label={`GitHub star ${tool.starsFull}`}
      className="ml-auto shrink-0 text-[18px] leading-none whitespace-nowrap text-faint tabular-nums"
    >
      ★ {tool.stars}
    </span>
  );
}

function ToolCard({ tool, on, onPick }: { tool: Tool; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex min-h-0 flex-1 flex-col rounded-xl border border-l-[6px] px-5 py-3 text-left transition-colors duration-200 ${FOCUS_RING} ${cardLook(on)}`}
    >
      <span className="flex h-8 items-center gap-3">
        <span className="text-[23px] leading-none font-semibold whitespace-nowrap text-paper">
          {tool.name}
        </span>
        <span className="ml-auto shrink-0 text-[16px] leading-none whitespace-nowrap text-faint">
          {tool.form}
        </span>
      </span>
      <span className="mt-1 text-[19px] leading-[27px] whitespace-nowrap text-muted">
        {tool.line}
      </span>
      <span className="mt-auto flex items-center gap-1.5">
        {tool.support.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
        <StarCount tool={tool} />
      </span>
    </button>
  );
}

/** 第四欄：OpenClaw 一張大卡（聊天軟體＋改名時間軸＋模型） */
function ClawCard({ tool, on, onPick }: { tool: Tool; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex min-h-0 flex-1 flex-col rounded-xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${FOCUS_RING} ${cardLook(on)}`}
    >
      <span className="flex h-9 items-center gap-3">
        <span className="text-[28px] leading-none font-semibold whitespace-nowrap text-paper">
          {tool.name}
        </span>
        <span className="ml-auto shrink-0 text-[16px] leading-none whitespace-nowrap text-faint">
          {tool.form}
        </span>
      </span>
      <span className="mt-1 text-[19px] leading-[27px] whitespace-nowrap text-muted">
        {tool.line}
      </span>

      <span className="mt-4 text-[16px] leading-[22px] text-faint">聊天軟體（還有更多）</span>
      <span className="mt-1.5 flex items-center gap-1.5">
        {CLAW_CHANNELS.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
      </span>

      <span className="mt-auto rounded-lg border border-line-soft bg-ink-soft px-3 py-2.5">
        <span className="block text-[16px] leading-[22px] text-faint">名字換過兩次</span>
        <span className="relative mt-1.5 flex flex-col gap-1">
          {/* 串起三個點的直線：從第一個點的中心到最後一個點的中心 */}
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[5px] w-0.5 bg-line" />
          {CLAW_NAMES.map((item, index) => {
            const last = index === CLAW_NAMES.length - 1;
            return (
              <span key={item.name} className="relative flex flex-col">
                <span className="flex h-6 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`size-3 shrink-0 rounded-full ${
                      last ? 'bg-paper' : 'border-2 border-muted bg-ink-soft'
                    }`}
                  />
                  <span
                    className={`text-[19px] leading-none whitespace-nowrap ${
                      last ? 'font-semibold text-paper' : 'text-muted'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="ml-auto text-[16px] leading-none whitespace-nowrap text-faint tabular-nums">
                    {item.date}
                  </span>
                </span>
                {item.why && (
                  <span className="pl-6 text-[16px] leading-[22px] whitespace-nowrap text-faint">
                    {`↓ ${item.why}`}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      </span>

      <span className="mt-3 flex items-center gap-1.5">
        <span className="mr-1 text-[16px] leading-none text-faint">模型</span>
        {tool.support.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
        <StarCount tool={tool} />
      </span>
    </button>
  );
}

/* ── 細節區 ───────────────────────────────────────────────── */

const DETAIL_BOX = 'h-[152px] shrink-0 rounded-2xl';

function Detail({ pick }: { pick: Pick }) {
  if (pick === null) {
    return (
      <div
        className={`${DETAIL_BOX} flex items-center justify-between gap-10 border-2 border-dashed border-line bg-panel px-8`}
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-[24px] leading-tight font-semibold text-muted">點類別或卡片，看細節</p>
          <p className="text-[19px] leading-snug text-faint">GitHub 網址、star 數、要注意的地方</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-[19px] leading-snug text-muted">
            ★ ＝ GitHub star 數 · 查詢日 {QUERY_DATE}
          </p>
          <p className="flex items-center gap-3 text-[19px] leading-snug text-muted">
            想找更多
            <ExternalLink
              href="https://github.com/hesreallyhim/awesome-claude-code"
              text="awesome-claude-code"
              size="text-[19px]"
            />
          </p>
        </div>
      </div>
    );
  }

  if (pick.kind === 'cat') {
    const cat = CATEGORIES.find((item) => item.id === pick.id) ?? CATEGORIES[0];
    return (
      <div
        key={`cat-${cat.id}`}
        aria-live="polite"
        className={`${DETAIL_BOX} slide-enter grid grid-cols-[380px_minmax(0,1fr)_440px] items-center gap-8 border border-line border-l-[6px] border-l-acid bg-panel px-7`}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <p className={`${LABEL_TYPE} text-faint`}>類別 {cat.no}</p>
          <p className="text-[30px] leading-tight font-semibold whitespace-nowrap text-paper">
            {cat.name}
          </p>
          <p className="text-[19px] leading-snug text-muted">{cat.pain}</p>
        </div>
        <p className="text-[21px] leading-[1.5] text-pretty text-paper">{keepNames(cat.point)}</p>
        <div className="flex min-w-0 flex-col gap-1 border-l border-line-soft pl-6">
          <p className="text-[17px] leading-6 font-semibold text-faint">{cat.asideLabel}</p>
          <p className="text-[19px] leading-[1.45] text-pretty text-muted">{keepNames(cat.aside)}</p>
        </div>
      </div>
    );
  }

  const tool = TOOLS.find((item) => item.id === pick.id) ?? TOOLS[0];
  const cat = CATEGORIES.find((item) => item.id === tool.cat) ?? CATEGORIES[0];
  const onGitHub = tool.href.startsWith('https://github.com/');
  return (
    <div
      key={`tool-${tool.id}`}
      aria-live="polite"
      className={`${DETAIL_BOX} slide-enter grid grid-cols-[380px_minmax(0,1fr)_440px] items-center gap-8 border border-line border-l-[6px] border-l-acid bg-panel px-7`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className={`${LABEL_TYPE} text-faint`}>
          {cat.no} {cat.name}
        </p>
        <p className="text-[30px] leading-tight font-semibold whitespace-nowrap text-paper">
          {tool.name}
        </p>
        <p className="text-[19px] leading-snug text-muted">{tool.license}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-[21px] leading-[1.5] text-pretty text-paper">{keepNames(tool.detail)}</p>
        <p className="text-[19px] leading-snug text-muted">{keepNames(tool.note)}</p>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2 border-l border-line-soft pl-6">
        <p className="text-[17px] leading-6 font-semibold text-faint">{onGitHub ? 'GitHub' : '官網'}</p>
        <ExternalLink href={tool.href} text={tool.hrefText} size="text-[19px]" />
        <p className="text-[19px] leading-snug text-muted tabular-nums">
          {tool.starsFull ? `★ ${tool.starsFull} · ${QUERY_DATE} 查詢` : '沒查到公開的 repo，不列 star'}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 41 頁 · CommunityToolsDemo — 社群上的自製工具
 * ══════════════════════════════════════════════════════════════ */

export function CommunityToolsDemo() {
  const [pick, setPick] = useState<Pick>(null);

  const toggle = (next: NonNullable<Pick>) =>
    setPick((prev) => (prev !== null && prev.kind === next.kind && prev.id === next.id ? null : next));

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col">
      {/* ── 四個類別 ─────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-5">
        {CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((tool) => tool.cat === cat.id);
          const catOn = pick?.kind === 'cat' && pick.id === cat.id;
          return (
            <section key={cat.id} aria-label={cat.name} className="flex min-h-0 flex-col gap-2.5">
              <CategoryHeader cat={cat} on={catOn} onPick={() => toggle({ kind: 'cat', id: cat.id })} />
              {tools.map((tool) => {
                const on = pick?.kind === 'tool' && pick.id === tool.id;
                const onPick = () => toggle({ kind: 'tool', id: tool.id });
                return cat.id === 'claw' ? (
                  <ClawCard key={tool.id} tool={tool} on={on} onPick={onPick} />
                ) : (
                  <ToolCard key={tool.id} tool={tool} on={on} onPick={onPick} />
                );
              })}
            </section>
          );
        })}
      </div>

      {/* ── 細節 ─────────────────────────────────────────── */}
      <div className="mt-4 shrink-0">
        <Detail pick={pick} />
      </div>

      {/* ── 共通點 → 第 43 頁 CODD（2026-11-20 中間多了第 42 頁作業靈感，不再是下一頁） ── */}
      <div className="mt-4 flex h-14 shrink-0 items-center gap-4 rounded-xl border border-line bg-ink-soft px-6">
        <span className="shrink-0 rounded-full bg-acid px-4 py-1 text-[18px] font-semibold text-on-accent">
          共通點
        </span>
        <p className="text-[21px] leading-tight whitespace-nowrap text-paper">
          都是開發者替自己的痛點做的工具；第 3 頁的作業，就是輪到你做一個。
        </p>
        <p className="ml-auto text-[20px] leading-tight whitespace-nowrap text-muted">
          第 43 頁 CODD：講師把 01、02、03 做進同一個工具 →
        </p>
      </div>
    </div>
  );
}
