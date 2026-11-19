import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import type { VoteTopicId } from './vote-topics';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 開場、目錄、五個章節頁
 *
 *   第 1 頁   CoverDemo         封面（bare）：左標題，右邊手繪兩個桌面 App 視窗 ＋ VS
 *   第 4 頁   ToolFeelDemo      目前對於 AI 工具的體感：評分表，點列名／欄名高亮
 *   第 5 頁   SubscriptionDemo  卡斯伯目前訂閱：三張卡片（不算合計）
 *   第 7 頁   AgendaDemo        本次重點：桌面版。提示框 ＋ 目錄（七組），點分組看項目
 *   第 12 頁  SharedCover       章節頁（bare）第一部分：ChatGPT、Claude 共有的能力
 *   第 23 頁  ChatgptCover      章節頁（bare）第二部分：獨特的能力：ChatGPT
 *   第 30 頁  ClaudeCover       章節頁（bare）第三部分：獨特的能力：Claude
 *   第 36 頁  AntigravityCover  章節頁（bare）小章節：Google Antigravity
 *   第 40 頁  OwnToolsCover     章節頁（bare）最後一部分：開發屬於自己的工具
 *   （第 2、3 頁在 demos-front.tsx；第 6 頁訂閱調查在 demos-subscription-poll.tsx；
 *    第 8–11 頁「兩家桌面版的介面」沒有章節頁，
 *    頁面在 demos-interface-chatgpt.tsx、demos-interface-codex.tsx、demos-interface-claude.tsx）
 *
 * 封面與章節頁照第四堂課 demos-intro.tsx 的寫法，不用 `title` 版型；
 * 字級照 `SlideBodyView` 的 TitleBody（kicker 22、大標 92、導言 26）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（Notion「課綱 › ChatGPT vs Claude」，2026-11-10 讀取；
 * 講師 CODD 筆記「簡報調整」codd://note/note-xcra，2026-11-10 17:17）
 * ──────────────────────────────────────────────────────────────
 * - 第 4 頁：callout「目前對於 AI 工具的體感」那張表，星等與文字照抄，
 *   空白格維持空白（畫成「—」）。底部的摘要列是從表格算出來的，沒有加評語。
 *   CODD 筆記改了兩格：ChatGPT 的「大型專案」與「CLI 工具完整性」都改成 2 星。
 *   講師 2026-11-17 補了一列「商業模式的理解」：ChatGPT、Claude 各 1 星，Gemini 2 星。
 * - 第 5 頁：callout「卡斯伯目前訂閱」。100*1 ＝ 100 美元方案 × 1 個帳號；
 *   Claude 200*3 ＝ 200 美元方案 × 3 個帳號；Google AI Ultra 100*1（3300）的
 *   3300 是台幣價。用途三句照抄。CODD 筆記：「下方可以不用每月合計」，
 *   所以拿掉了合計列（連同只為合計存在的勾選框與月／年切換）。
 * - 第 7 頁（2026-11-18 前是第 6 頁）：callout「本次重點 “桌面版”」：「先說一下，如果是一般問答，不在本次
 *   介紹範疇」原句放進提示框。目錄照頁面最上方的大綱與 slides.ts 的頁序；
 *   大綱寫的「語音搭配 MCP（Claude 限定英文）」括號一併保留在說明裡。
 *   每一列的短說明，凡是講師 callout 或 CODD 筆記有寫的（模型強度、
 *   Computer Use 實作、Remote Control、語音搭配 MCP、AI in Chrome、Dot、圖片生成、
 *   GIF、Record & Replay、互動式 Artifact、Antigravity、CODD、實戰中的用法）都照原文濃縮。
 *   Environments 一度依 CODD 筆記拿掉，講師之後要求補回 Claude Desktop 的環境（當時第 31–33 頁；2026-11-19 起是第 33–35 頁，第 35 頁是情境）；
 *   那幾列的標題縮短自 slides.ts，短說明是照 slides.ts 的標題與頁面內容自己寫的（示意）。
 * - 章節頁：kicker／大標照任務指定；主句與導言是照該部分的頁序歸納的。
 *   Antigravity 的主句原本照 11-10 的 CODD 筆記（原本是 IDE，新版也做成類似 ChatGPT、Claude
 *   桌面版的應用程式；筆記原文「類似 Jupyter 或者是 Claude」，Jupyter 判斷是語音輸入把 ChatGPT 聽錯）。
 *   2026-11-18 依新筆記改寫，見下方的變更紀錄。
 *
 * 2026-11-17 講師第二輪調整（slides.ts 由 38 頁變 43 頁；這一段的頁碼是當時的），這個檔跟著改的地方：
 * - 原本第 9 頁「補充：ChatGPT 的 Work 邏輯」拿掉，換成「共有」前面的第 7–10 頁
 *   「兩家桌面版的介面」。目錄多一組 'interface'（沒有章節頁，所以不算進 PartId 的四個部分），
 *   第 6 頁左欄從六組變七組（高度預算重排，見下方）。
 * - 專案管理後面多一頁（第 14 頁，兩家的專案差在哪），跨裝置流程後面多一頁
 *   （第 41 頁，建立 GitHub Project 的提示詞）。四個章節頁頁碼改成 11、22、28、34。
 * - 封面第二段導言改成先講「兩家的介面」再講共有的能力（結尾縮短，量過維持三行 137）；
 *   第一部分章節頁的導言補上「兩家專案的差異」（量過三行 136）。
 * - 第 4、6 頁的按鈕補上 keepActivationKeys／blurAfterClick：焦點在按鈕上時 Space、Enter
 *   只按按鈕、不換頁；滑鼠點完就放掉焦點，接著按 Space 照常換頁。
 * - 第 7–10 頁四列的短說明依 2026-11-17 的查證寫（見下方「查證」），
 *   第 14、41 頁的短說明照 slides.ts 的標題與註解寫（示意）。
 *
 * 2026-11-18 講師第三輪調整（CODD 筆記「簡報調整」codd://note/note-plus；
 * slides.ts 由 43 頁變 47 頁；這一段的頁碼是當時的；2026-11-19 刪一頁又補一頁，第 36 頁以後跟現在相同），
 * 這個檔跟著改的地方：
 * - 新章節頁 OwnToolsCover（第 40 頁）：PartCover 多一個部分 'own-tools'。
 *   章節名稱照筆記原話「這一頁前面再補一個介紹頁，接下來的主題應該叫做『開發屬於自己的工具』」。
 *   目錄原本的「CODD 與實戰」改成這一組（第 40–46 頁），前面多了第 41 頁「社群上的自製工具」。
 *   kicker 寫「最後一部分」而不是「第四部分」：Antigravity 是小章節、在進度列排第 04，
 *   寫第四部分會跟進度列的 05 對不起來。
 *   主句與導言是照這一組的頁序歸納的；導言呼應第 3 頁作業「替自己的開發做一個工具」，
 *   社群工具的四類照第 41 頁（demos-community-tools.tsx）的類別名稱與講師的說法（龍蝦）。
 * - 「實戰：ChatGPT 系列與混合使用」整頁移除（筆記：「目前跟上下文比較沒有關係」），
 *   目錄的那一列，以及只出自那一頁的兩條重點（ChatGPT 系列、混合使用）一起拿掉；
 *   封面第二段導言的結尾「CODD 與實戰中的混合使用」改成這一部分的名稱。
 * - Antigravity 章節頁的主句照筆記原話「它的 IDE 還是存在，不過它現在又多出類似 ChatGPT
 *   或 Claude 的桌面版應用程式」；導言的名稱與時間照官方（見下方「查證 2026-11-18」）。
 *   原本導言的「獨家：開啟 IDE、多種模型」與「都還不完整」留給第 37 頁本身講。
 * - 第 6 頁新增訂閱調查（demos-subscription-poll.tsx）：目錄不列開場，所以只影響頁碼。
 * - Sites 後面多了第 29 頁「Mini 寵物」（withVote 'mini-pet'），Antigravity 後面多了
 *   第 38 頁比較表。投票頁從 16 頁變 17 頁（TOTAL_VOTES 從 GROUPS 算，不用手改）。
 * - 進度列從四格變五格：等寬放不下「04 Antigravity」，改成照字寬分配（見高度預算）。
 *
 * ⚠ 頁碼是照 slides.ts 手寫在 GROUPS 的 `no` 與 `cover`（不能 import slides.ts，
 *   會循環引用）。slides.ts 增刪或調換頁面時，這裡要一起改（2026-11-19，共 47 頁）：
 *     1 封面 2 最後一堂課投票 3 作業挑戰 4 體感 5 訂閱 6 訂閱調查 7 桌面版（目錄）
 *       （開場不列進目錄）
 *     8 ChatGPT 桌面版的介面 9 ChatGPT Work 10 ChatGPT Codex 11 Claude 桌面版的介面
 *       （兩家桌面版的介面，沒有章節頁）
 *     12 共有（章節頁）13 模型強度 14 專案管理★ 15 專案管理：兩家的專案差在哪
 *       16 智慧型互動介面★ 17 Computer Use★ 18 Computer Use 實作 19 Remote Control★
 *       20 語音搭配 MCP★ 21 AI in Chrome★ 22 AI in Chrome 實作
 *     23 ChatGPT（章節頁）24 Dot★ 25 圖片生成★ 26 GIF 生成★ 27 Record & Replay★ 28 Sites★
 *       29 Mini 寵物：智慧精靈★
 *     30 Claude（章節頁）31 互動式 Artifact★ 32 Slides、Design、Dashboards、Motion★
 *       33 Environments：選 Claude 在哪裡開發★ 34 Environments 實作 35 Environments：情境
 *     36 Antigravity（章節頁）37 Google Antigravity★ 38 比較表：Gemini 與 ChatGPT、Claude
 *       39 Antigravity 實例
 *     40 開發屬於自己的工具（章節頁）41 社群上的自製工具 42 CODD★ 43 實戰：Claude 系列
 *       44 實戰：跨裝置的開發流程 45 實戰：跨裝置流程的實際畫面
 *       46 實戰：用一段提示詞建立 GitHub Project
 *     47 投票結果                                          （★ ＝ withVote，共 17 頁）
 *   2026-11-19 稍晚（46 → 47 頁）：第 34 頁後補「Environments：可以用在哪些情境」（第 35 頁，沒有投票）；
 *   舊 35–46 → 新 36–47；1–34 不變，投票頁數不變。
 *   2026-11-19（47 → 46 頁）：舊第 34 頁「Environments：環境變數能套用到專案嗎？」刪除；
 *   舊 35–47 → 新 34–46；1–33 不變，投票頁數不變（刪掉的那頁沒有投票）。
 *   2026-11-18（43 → 47 頁）：1–5 不變；6 → 7；7–27 各加 1；28–35 各加 2；36 → 39；37 → 42；
 *   38–41 → 43–46；42 刪除；43 → 47。
 *   `vote` 欄位的型別是 vote-topics.ts 的 VoteTopicId，主題 id 改名時 tsc 會擋。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-10）
 * ──────────────────────────────────────────────────────────────
 * - ChatGPT Pro 有三級，標籤是「Pro 100／Pro 200／Pro 500」：
 *     https://chatgpt.com/pricing/
 *   每月 100 美元這一級的說明在 help center（WebFetch 回 403，只看到搜尋摘要
 *   「Pro 100 at $100」）：
 *     https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers
 * - Claude 每月 200 美元的是 Ultra，原本叫 Max 20x（Max 現在是 100 美元那一級）：
 *     https://claude.com/pricing
 *     https://support.claude.com/en/articles/17728952-what-is-the-ultra-plan
 *     （原文：「The Max 20x plan is now called the Ultra plan.」）
 * - Google Antigravity 是 Google 的 agentic development platform，含桌面 App、
 *   Antigravity CLI、IDE 與 SDK：https://antigravity.google/
 *   （2026-11-18 更新：官方文件現在寫明 Antigravity CLI 的指令是 agy，講師寫的「AGY CLI」
 *    就是它；產品線另有 Antigravity Extensions。見下方「查證 2026-11-18」）
 * - Google AI Ultra 的價格沒有查（不在指定的官方網域內），卡片只寫講師給的數字。
 *   （2026-11-18 的研究：Antigravity 官方 2026-05-19 的方案調整新增每月 US$100 的 Ultra，
 *    跟卡片的「100 方案」一致；台幣價仍沒查）
 * - 第 7 頁（當時第 6 頁）短說明裡，講師 callout 沒寫、另外查的：
 *     Record & Replay 示範一次流程、存成可重複使用的 skill：
 *       https://learn.chatgpt.com/docs/extend/record-and-replay
 *       （developers.openai.com/codex/record-and-replay 會轉址到這裡）
 *     Sites 在對話裡建立、發佈、分享網站：
 *       https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites
 *     Slides／Design／Dashboards／Motion 是 Claude 的 artifact 類型（Motion 是動畫，匯出 MP4）：
 *       https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them
 *       （2026-11-17 的查證發現官方範本現在叫「Data」，內容是 Dashboards、data stories；
 *        目錄標題跟 slides.ts 走，slides.ts 還寫 Dashboards，這裡就先不改）
 *
 * 查證（查核日 2026-11-17）：第 8–11 頁（當時第 7–10 頁）「兩家桌面版的介面」的短說明
 *   （下面各條的頁碼是當時的，各加 1 就是現在的頁碼）
 * - 第 7 頁「先選 ChatGPT 或 Codex，再切 Chat、Work」：桌面版最上層用 ChatGPT 下拉選單
 *   （product selector）選 ChatGPT 或 Codex，ChatGPT 裡再用輸入框上方的切換鈕選 Chat 或 Work：
 *     https://learn.chatgpt.com/docs/quickstart
 *       （原文 "select Codex from the ChatGPT dropdown"、
 *        "switch to Work at the top of the new chat page, above the composer"）
 *     https://learn.chatgpt.com/docs/app（"Choose ChatGPT or Codex."）
 *   「左上角選單」只見於 help.openai.com 舊版文章的搜尋摘要，所以這裡不寫位置。
 * - 第 8 頁「本機或雲端；雲端任務關掉 App 也繼續」：桌面版的 Work 可以在本機跑
 *   （"Work locally"）或交給雲端（Cloud），雲端任務關掉 App 也會繼續：
 *     https://learn.chatgpt.com/docs/use-chatgpt
 *       （原文 "A task can keep going after you close the desktop app"）
 *   選單的實際字樣官方各頁不一（Enterprise 文件寫 "Local/Cloud selector"），所以這裡寫中文。
 *     https://learn.chatgpt.com/docs/get-started-with-work
 *     https://learn.chatgpt.com/docs/whats-new（2026-09-28 那一週的 "Local computer access with
 *       Work Cloud"：工作區有開、電腦保持上線時，雲端 Work 也能用電腦上的檔案；目錄不提）
 * - 第 9 頁「Local、Worktree、Cloud；改動看 diff」：Codex 的對話在 Local、Worktree 或 Cloud 跑
 *   （"Use Work in to choose This computer or Cloud."，Local 與 Worktree 都在自己電腦上）：
 *     https://learn.chatgpt.com/docs/environments/modes
 *   改動在審查畫面看 diff；Work 則會隱藏 Git、shell 這些細節：
 *     https://learn.chatgpt.com/docs/use-chatgpt（"Hide technical details like Git or shell commands"）
 * - 第 10 頁「Cowork 已併入對話，寫程式到 Code 分頁」：
 *     https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude
 *       （原文 "these are merged into a single conversation"、
 *        "The model picker and the "Code" tab are where they were."）
 *   這是分批推出的新版：還沒換到的帳號，訊息框仍看得到 Chat、Cowork 兩個選項
 *   （Team 2026-12-01 預設開啟）。目錄只有一行放不下但書，細節留給第 10 頁本身。
 * - help.openai.com 的文章對 WebFetch 回 403，上面四句都不靠那些頁面。
 *
 * 查證（查核日 2026-11-18）：Antigravity 章節頁、第 7 頁 Antigravity 那一組
 * - 桌面 App 是 2026-05-19（I/O 2026）推出的 Antigravity 2.0，「a new, standalone desktop
 *   application」；原本的編輯器沒有被取代，改名 Antigravity IDE 另外下載、繼續更新：
 *     https://antigravity.google/blog/introducing-google-antigravity-2
 *     https://codelabs.developers.google.com/getting-started-agy-ide?hl=en
 *       （原文「four main products: Antigravity, Antigravity IDE, Antigravity CLI, and Antigravity SDK」）
 *   → 章節頁導言的「2.0」「改名 Antigravity IDE」「App 是另一個獨立的應用程式」。
 *   App 右上角開 IDE：codelab 只寫了沒裝 IDE 時的「Install IDE」；「Open IDE」只見於講師截圖，
 *   所以導言不寫按鈕字樣。舊的「原本是 IDE，新版也做成…」跟官方說法衝突（IDE 沒有長成 App，
 *   是另外多了一個 App），已照講師 11-18 的新說法改寫。
 * - 第 38 頁比較表裡的兩個模型：Gemini 4 Argon（2026-10-13）、Gemini 4 Carbon（2026-11-10 開放，
 *   官方「our strongest model」，訂閱只給 Ultra）。出處寫在 demos-gemini-compare.tsx；
 *   這裡的導言只寫名稱。
 * - 第 37 頁短說明「付費方案可選 Claude」：https://antigravity.google/pricing
 *   免費方案原本能用的 Claude 4.6 標示「Will be removed on November 18, 2026」；
 *   Claude Sonnet／Opus 5.5 只給付費、非試用的 Pro、Ultra 與企業版。「獨家」是講師的判斷，沒有另外查。
 * - 官方頁面是研究 agent 用 WebFetch 讀全文（經過摘要），引文可能有些微轉述的落差。
 *
 * 補的示意：
 * - 封面右側兩個視窗是 JSX 手繪的示意，不是任何 App 的實際畫面；視窗裡的
 *   功能標籤（圖片生成、Dot、Sites／互動式 Artifact、Slides、Environments）
 *   取自本堂的目錄。底部「共有」那一列同樣取自目錄。
 *   Claude 視窗第二個標籤在 Environments 拿掉時換成 Design，補回後改回 Environments
 *   （Design 已經包在 Slides 那一頁的四種產出裡，Environments 是 Claude 這一章獨立的一段）。
 * - 封面導言兩段、章節頁的主句與導言、第 7 頁每組那一句，是照頁序歸納的
 *   （Antigravity 章節頁的主句例外，是講師原話濃縮）。
 * - 第 7 頁「兩家的介面」那一組的標題：第 8、9 頁縮短自 slides.ts（見 GROUPS 的註解）。
 * - 第 7 頁新加的短說明（第 29 Mini 寵物、第 38 比較表、第 41 社群工具）是照各頁檔頭濃縮的（示意）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁最多兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   封面、章節頁  只有 acid（kicker、VS、目前這一部分）。
 *   第 4 頁       acid（高亮的列／欄）＋ amber（星星）。
 *   第 5 頁       acid（卡片的 6px 左粗條）＋ blue（Antigravity 連結卡）。
 *   第 7 頁       acid（選取的分組）＋ coral（「先說一下」提示框）。
 *   投票標記一律中性（paper 外框），不另佔一支強調色。
 *   淡底（/14）一律配 6px 不透明左粗條、實心色塊或實心表頭，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 *   封面（bare，1824 × 848）
 *     左欄 960 寬 ≈ kicker 30 ＋ 20 ＋ 大標 94 ＋ 16 ＋ 副標 62 ＋ 32
 *            ＋ 導言（2 行 92 ＋ 20 ＋ 3～4 行 138～184）≈ 504～550；大標萬一換行也只到 644
 *     右欄  視覺 800 × 580：視窗 372 × 430 兩個（右邊那個往下錯 56）
 *           ＋ 底部「共有」列 64（上緣 516，離右視窗下緣 486 還有 30）
 *   第 4 頁（Panel 內，根容器 h-[720px]）
 *     說明列 52 ＋ 20 ＋ 表頭 60 ＋ 8 列 × 58 ＋ 間距 8 × 6 ＝ 644 ＋ 摘要列 72 ＝ 716
 *     （2026-11-17 加了「商業模式的理解」一列，列高從 66 收到 58）
 *   第 5 頁（h-[720px]）
 *     三張卡片撐滿 720；最高的 Google 卡 py-7 56 ＋ 標題 40 ＋ 8
 *     ＋ 方案 30 ＋ 24 ＋ 價格 60 ＋ 12 ＋ 帳號數 32 ＋ 24 ＋ 用途 21＋24＋8＋35
 *     ＋ 原文 24 ＋ 14 ＋ 連結卡 78 ≈ 534（Notion 原文與連結卡用 mt-auto 貼底）
 *   第 7 頁（h-[720px]）
 *     左欄  提示框 148（2026-11-17 收緊：py-4、gap-2）＋ 12
 *           ＋ 七組平分 559（gap 8 × 6）→ 每組 73，內容 59（名稱 30 ＋ 4 ＋ 頁碼範圍 25）
 *           （六組時提示框 ≈ 159、每組 ≈ 85；加了「兩家的介面」之後重排，瀏覽器量過）
 *           2026-11-18 仍是七組（「CODD 與實戰」換成「開發屬於自己的工具」），每組維持 73
 *     右卡  py-7 56 ＋ 標籤 29 ＋ 6 ＋ 大標 45 ＋ 6 ＋ 一句 29 ＋ 16
 *           ＋ 清單最多 10 列 × 44 ＋ 頁尾 46 ＋ mt-auto 留白 ≈ 720
 *           每列 頁碼 56 ＋ 標題 430 ＋ 短說明 ≈ 468 ＋ 投票標記 84（右卡內寬 ≈ 1074）
 *           最多的是「共有」10 列（清單底離頁尾 45）；章節頁不列
 *           開發屬於自己的工具 6 列 ＋ 16 ＋ 三條重點 → 重點框底離頁尾 69
 *           （四條重點的「CODD 與實戰」是 31；2026-11-18 瀏覽器量過，七組都沒有換行）
 *           標題欄 430 放 23px 約 18 個中文字寬：太長的縮短過（見 GROUPS 的註解），
 *           量過最長的是「實戰：用一段提示詞建立 GitHub Project」412、
 *           「Slides、Design、Dashboards、Motion」408、
 *           「Antigravity 實例：互動式視覺化與遊戲」395、「ChatGPT 介面：Chat、Work、Codex」388
 *           短說明欄 468：最長的是「獨家：開啟 IDE、多種模型（付費可選 Claude）」407
 *   章節頁（bare）
 *     左欄 1064 寬 ≈ kicker 30 ＋ 20 ＋ 大標 188（第一部分、Antigravity 刻意兩行）＋ 32
 *            ＋ 主句 48 ＋ 20 ＋ 導言 3 行 138 ＋ 40 ＋ 投票列 40 ≈ 556
 *            2026-11-18 瀏覽器量：共有 550、ChatGPT 411（導言 2 行）、Claude 411、
 *            Antigravity 550（主句一行 48、導言 3 行 137）、開發屬於自己的工具 456（大標一行 94）
 *     右欄 680 寬  進度 44 ＋ 16 ＋ 最多 10 列 × 50 ＋ 間距 9 × 8 ≈ 632（共有）
 *           五段進度照字寬分配（flex grow，basis 是字寬）：字寬加 px-3 與邊框是
 *           87／124／110／139／142，合計 602 ＋ gap 8 × 4 ＝ 634，剩下的 46 平均分給五格；
 *           等寬的話每格 (680 − 4 × 8) ÷ 5 ≈ 130，放不下「04 Antigravity」（139）
 *   沒有任何容器會捲動，互動不改變高度（每列都是固定高）。
 *   浮水印在右上角：第 4 頁表頭在說明列下方（距頂 72）、第 5 頁 Google 卡的
 *   右上只有留白（名稱靠左）、第 7 頁右卡標題列靠左；
 *   bare 頁的內容垂直置中，右欄上緣離舞台頂端都超過 230。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 五角星（24 × 24 座標） */
const STAR_PATH =
  'M12 2.6l2.85 5.95 6.55.8-4.83 4.5 1.25 6.48L12 17.1l-5.82 3.23 1.25-6.48L2.6 9.35l6.55-.8z';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/**
 * 焦點在按鈕上時，Space／Enter 只按這顆按鈕，不讓簡報換頁。
 * 照 demos-antigravity.tsx 的寫法複製一份（每個檔自給自足，不互相 import）。
 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/** 功能頁底部有投票的標記。中性色，不佔強調色 */
function VoteMark() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-paper px-2.5 py-0.5 text-[16px] leading-snug text-paper">
      <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden="true">
        <path d={STAR_PATH} fill="currentColor" />
      </svg>
      投票
    </span>
  );
}

/* ── 目錄資料（第 7 頁與五個章節頁共用）──────────────── */

type GroupId =
  | 'interface'
  | 'shared'
  | 'chatgpt'
  | 'claude'
  | 'antigravity'
  | 'own-tools'
  | 'results';
/** 有章節頁的五個部分（'interface'、'results' 沒有章節頁，不在這裡） */
type PartId = 'shared' | 'chatgpt' | 'claude' | 'antigravity' | 'own-tools';

interface PageItem {
  /** 頁碼，照 slides.ts 手寫 */
  no: number;
  /** 照 slides.ts 的 title（太長放不進一行的，縮短過，見各列註解） */
  title: string;
  /** 第 7 頁右卡的一句短說明（19px，一行放得下：≤ 24 個中文字） */
  note: string;
  /** 有投票的頁面（slides.ts 用 withVote 包起來的） */
  vote?: VoteTopicId;
}

interface Group {
  id: GroupId;
  /** 左欄的名稱 */
  name: string;
  /** 右卡的大標 */
  fullName: string;
  /** 章節頁頁碼（只有五個部分有） */
  cover?: number;
  /** 右卡那一句說明（21px，一行） */
  desc: string;
  pages: readonly PageItem[];
  /** 在清單下面補幾條重點（投票結果那一組由 resultBullets() 算） */
  bullets?: readonly string[];
}

const GROUPS: readonly Group[] = [
  {
    // 2026-11-17 新增：取代原本「共有」裡的「補充：ChatGPT 的 Work 邏輯」，沒有章節頁
    id: 'interface',
    name: '兩家的介面',
    fullName: '先認識兩家桌面版的介面',
    // 不寫「只有對話和 Code」：會被讀成 Claude 沒有 Cowork 的能力；跟第 11 頁的「Cowork 已併入」對齊
    desc: 'ChatGPT 分 Chat、Work、Codex；Claude 是對話（Cowork 已併入）和 Code。',
    pages: [
      // slides.ts：「ChatGPT 桌面版的介面：Chat、Work、Codex」，放不進 430 寬
      { no: 8, title: 'ChatGPT 介面：Chat、Work、Codex', note: '先選 ChatGPT 或 Codex，再切 Chat、Work' },
      // slides.ts：「ChatGPT Work：在本機跑，還是交給雲端」，放不進 430 寬
      { no: 9, title: 'ChatGPT Work：本機或雲端', note: '本機或雲端；雲端任務關掉 App 也繼續' },
      { no: 10, title: 'ChatGPT Codex：寫程式的地方', note: 'Local、Worktree、Cloud；改動看 diff' },
      { no: 11, title: 'Claude 桌面版的介面：對話與 Code', note: 'Cowork 已併入對話，寫程式到 Code 分頁' },
    ],
  },
  {
    id: 'shared',
    name: '共有的能力',
    fullName: 'ChatGPT、Claude 共有的能力',
    cover: 12,
    desc: '兩家桌面版都有的功能，放在一起對照；其中兩項有實作。',
    pages: [
      { no: 13, title: '模型強度', note: '兩家的模型、Effort 與方案費率' },
      { no: 14, title: '專案管理', note: '專案功能在兩邊怎麼運用', vote: 'projects' },
      // slides.ts：「專案管理：ChatGPT、Claude 的專案差在哪」，放不進 430 寬；短說明是示意
      { no: 15, title: '專案管理：兩家的專案差在哪', note: '放什麼、記憶、共用，兩家對照' },
      { no: 16, title: '智慧型互動介面', note: '產出可操作的介面，AI 讀得到你的操作', vote: 'smart-ui' },
      { no: 17, title: 'Computer Use', note: '讓 AI 操作你電腦上的 App', vote: 'computer-use' },
      { no: 18, title: 'Computer Use 實作：到 Discord 留言', note: '一段提示詞，請 AI 到交誼大廳留言' },
      { no: 19, title: 'Remote Control', note: '在手機上接手電腦上的工作', vote: 'remote-control' },
      {
        no: 20,
        title: '語音搭配 MCP',
        note: '語音透過 MCP 讀 Notion 課綱（Claude 限英文）',
        vote: 'voice-mcp',
      },
      { no: 21, title: 'AI in Chrome', note: '讓 AI 來操控你的瀏覽器', vote: 'ai-in-chrome' },
      { no: 22, title: 'AI in Chrome 實作：幫我填表單', note: '請 AI 幫忙填寫畫面上的表單' },
    ],
  },
  {
    id: 'chatgpt',
    name: '獨特的能力：ChatGPT',
    fullName: '獨特的能力：ChatGPT',
    cover: 23,
    desc: 'ChatGPT 這一邊才有的能力：從系統層級的 Dot、直接發佈網站，到桌面上的寵物。',
    pages: [
      { no: 24, title: 'Dot', note: '對話、排程、串接服務、操作電腦', vote: 'dot' },
      { no: 25, title: '圖片生成', note: '目前其他家都沒這麼強，Codex CLI 也能用', vote: 'image-gen' },
      { no: 26, title: 'GIF 生成', note: '直接生成 GIF 動圖，附三個範例', vote: 'gif' },
      { no: 27, title: 'Record & Replay', note: '先裝外掛，錄一次流程存成 Skill', vote: 'record-replay' },
      { no: 28, title: 'Sites', note: '在對話裡做網站，直接發佈分享', vote: 'sites' },
      // 2026-11-18 新增。短說明照 demos-mini-pet.tsx 檔頭「背景任務的狀態燈＋隨叫隨到的快速對話入口」
      // 濃縮（官方 Pets：桌面版可以浮在其他視窗上面），示意。標題縮短自 slides.ts「Mini 寵物：智慧精靈（Pets）」
      { no: 29, title: 'Mini 寵物：智慧精靈', note: '浮在桌面上：任務狀態燈＋快速對話', vote: 'mini-pet' },
    ],
  },
  {
    id: 'claude',
    name: '獨特的能力：Claude',
    fullName: '獨特的能力：Claude',
    cover: 30,
    desc: 'Claude 這一邊才有的能力：互動式 Artifact、四種產出，以及 Desktop 的三種開發模式。',
    pages: [
      { no: 31, title: '互動式 Artifact', note: '可以互動，Claude 也讀得到操作結果', vote: 'artifact' },
      {
        no: 32,
        title: 'Slides、Design、Dashboards、Motion',
        note: '簡報、設計、儀表板、動畫',
        vote: 'claude-studio',
      },
      // 第 33–35 頁的標題縮短自 slides.ts（原標題放不進 430 寬），短說明是示意
      // （2026-11-19 改：第 33 頁改成三種開發模式，原本第 34 頁「環境變數」刪除）
      // slides.ts：「Environments：選 Claude 在哪裡開發」
      { no: 33, title: 'Environments：在哪裡開發', note: '本機、雲端、遠端，各自可以做什麼', vote: 'environments' },
      // slides.ts：「Environments 實作：同一個專案，Local 和 Cloud 各跑一次」
      { no: 34, title: 'Environments 實作：Local 和 Cloud', note: '同一個範例專案，三句提示詞跑一次' },
      // 2026-11-19 新增。slides.ts：「Environments：可以用在哪些情境」
      { no: 35, title: 'Environments：用在哪些情境', note: '本機、雲端、排程、遠端的九個具體情境' },
    ],
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    fullName: '小章節：Google Antigravity',
    cover: 36,
    // 2026-11-18：照講師新說法（IDE 還在，又多了桌面版 App），再帶到比較表
    desc: 'IDE 還在，又多了桌面版 App；再用一張比較表看 Gemini 和另外兩家。',
    pages: [
      {
        no: 37,
        title: 'Google Antigravity',
        // 「獨家」是講師的判斷；Claude 只給付費、非試用方案（pricing，2026-11-18）
        note: '獨家：開啟 IDE、多種模型（付費可選 Claude）',
        vote: 'antigravity',
      },
      // 2026-11-18 新增。六個面向照 demos-gemini-compare.tsx（講師評分）
      { no: 38, title: '比較表：Gemini 與 ChatGPT、Claude', note: '講師體感：六個面向，加上 Argon、Carbon' },
      { no: 39, title: 'Antigravity 實例：互動式視覺化與遊戲', note: '互動式視覺化，和用它做的遊戲' },
    ],
  },
  {
    // 2026-11-18：原本的「CODD 與實戰」改成這一組，前面多了章節頁（現在第 40 頁）與社群工具（現在第 41 頁）；
    // 「實戰：ChatGPT 系列與混合使用」整頁移除
    id: 'own-tools',
    name: '開發屬於自己的工具',
    fullName: '開發屬於自己的工具',
    cover: 40,
    desc: '社群上大家替自己做的工具，接著是我自己開發的 CODD 與實戰中的用法。',
    pages: [
      // 短說明是第 41 頁的四個類別（demos-community-tools.tsx），「龍蝦」是講師的說法
      { no: 41, title: '社群上的自製工具', note: '用量監測、切換帳號、跨 session、龍蝦' },
      { no: 42, title: 'CODD：我自己開發的工具', note: 'session、專案、文件管理與各種監控', vote: 'codd' },
      // slides.ts 的標題是「實戰：Claude 系列（CLI 搭配自行開發的擴充）」，放不進 430 寬，括號移到短說明
      { no: 43, title: '實戰：Claude 系列', note: 'CLI 搭配自行開發的擴充' },
      { no: 44, title: '實戰：跨裝置的開發流程', note: '本地、雲端機器與 GitHub Project' },
      { no: 45, title: '實戰：跨裝置流程的實際畫面', note: 'GitHub Project 與 CODD 網頁版' },
      // 標題照 slides.ts（量過約 412，放得進 430）；
      // 短說明照 2026-11-18 的改版（提示詞分階段複製）與 slides.ts 舊註解「含 Agent 欄位」寫的（示意）
      { no: 46, title: '實戰：用一段提示詞建立 GitHub Project', note: '分階段複製，連 Agent 欄位一起建好' },
    ],
    bullets: [
      // 第 41 頁的四類（講師筆記列的順序）
      '社群：用量監測、切換帳號、跨 session 管理，到龍蝦這類個人 AI 助理',
      'Claude 系列：日常開發大多已轉到 CODD，多個專案依類型分組',
      '跨裝置：多台裝置讀同一個 GitHub Project，進行中的卡片登記 Agent',
    ],
  },
  {
    id: 'results',
    name: '投票結果',
    fullName: '最後：投票結果',
    desc: '有投票標記的功能頁都可以評 1～5 分，最後一起看結果。',
    pages: [{ no: 47, title: '投票結果', note: '今天介紹的功能，大家給幾分' }],
  },
];

function groupById(id: GroupId) {
  return GROUPS.find((group) => group.id === id) ?? GROUPS[0];
}

function voteCount(group: Group) {
  return group.pages.filter((page) => page.vote).length;
}

const TOTAL_VOTES = GROUPS.reduce((sum, group) => sum + voteCount(group), 0);

function resultBullets() {
  return [
    `有「投票」標記的 ${TOTAL_VOTES} 個功能頁，底部都可以投 1～5 分，5 分是滿分`,
    '最後一頁即時看大家的結果',
  ];
}

function pageRange(group: Group) {
  const first = group.cover ?? group.pages[0].no;
  const last = group.pages[group.pages.length - 1].no;
  return first === last ? `第 ${first} 頁` : `第 ${first}–${last} 頁`;
}

/* ══════════════════════════════════════════════════════════════
 * 第 1 頁 · CoverDemo
 *
 * 左：kicker、大標、副標、導言兩段。
 * 右：兩個桌面 App 視窗（左 ChatGPT、右 Claude，錯開 56）、中間 acid 的 VS，
 *     底部一列兩家共有的功能。視窗是中性色，只有 VS 用 acid。
 * ══════════════════════════════════════════════════════════════ */

function SkeletonLine({ width }: { width: string }) {
  return <span className={`block h-2.5 rounded-full bg-line-soft ${width}`} />;
}

function ImageTile() {
  return (
    <div className="flex h-[132px] shrink-0 flex-col rounded-xl border border-line bg-ink-soft px-3 pt-2 pb-2">
      <svg
        className="min-h-0 flex-1"
        width="100%"
        viewBox="0 0 220 90"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
      >
        <circle cx={170} cy={26} r={12} stroke="var(--color-muted)" strokeWidth={2.5} />
        <path
          d="M8 84 L66 34 L102 64 L134 42 L212 84 Z"
          fill="var(--color-panel)"
          stroke="var(--color-muted)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[16px] leading-tight text-faint">圖片生成</span>
    </div>
  );
}

function ArtifactTile() {
  const bars = ['h-[34px]', 'h-[56px]', 'h-[44px]', 'h-[70px]', 'h-[30px]'];
  return (
    <div className="flex h-[132px] shrink-0 flex-col rounded-xl border border-line bg-ink-soft px-3 pt-2 pb-2">
      <div className="flex min-h-0 flex-1 items-end gap-2.5 px-2">
        {bars.map((height, index) => (
          <span key={index} className={`w-7 rounded-t-md bg-muted ${height}`} />
        ))}
        <span className="mb-1 ml-auto flex h-6 w-11 items-center rounded-full bg-paper px-1">
          <span className="ml-auto size-4 rounded-full bg-panel" />
        </span>
      </div>
      <span className="mt-1.5 text-[16px] leading-tight text-faint">互動式 Artifact</span>
    </div>
  );
}

function AppWindow({
  name,
  tile,
  chips,
  className,
}: {
  name: string;
  tile: 'image' | 'artifact';
  chips: readonly string[];
  className: string;
}) {
  return (
    <div
      className={`absolute flex h-[430px] w-[372px] flex-col overflow-hidden rounded-2xl border-2 border-paper bg-panel ${className}`}
    >
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-ink-soft px-4">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-3 rounded-full bg-line" />
        ))}
        <span className="ml-3 text-[19px] font-semibold text-paper">{name}</span>
        <span className="ml-auto font-mono text-[16px] text-faint">Desktop</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 側欄：專案與對話清單 */}
        <div className="flex w-[84px] shrink-0 flex-col gap-3 border-r border-line-soft bg-ink-soft px-3 py-4">
          <span className="block h-7 rounded-lg border border-line bg-panel" />
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-[80%]" />
          <SkeletonLine width="w-[90%]" />
          <SkeletonLine width="w-[65%]" />
        </div>

        {/* 對話區 */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <span className="ml-auto block h-8 w-[150px] shrink-0 rounded-xl rounded-br-sm bg-ink-soft" />
          <div className="flex shrink-0 flex-col gap-2">
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-[85%]" />
          </div>
          {tile === 'image' ? <ImageTile /> : <ArtifactTile />}
          <div className="flex shrink-0 flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-line px-2.5 py-0.5 text-[16px] leading-snug text-muted"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-auto flex h-10 shrink-0 items-center rounded-xl border border-line px-3">
            <SkeletonLine width="w-24" />
            <span className="ml-auto size-6 rounded-full bg-paper" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverVisual() {
  return (
    <div
      className="relative h-[580px] w-[800px] shrink-0"
      role="img"
      aria-label="ChatGPT 與 Claude 兩個桌面 App 視窗並排，中間是 VS，底下列出兩家共有的功能"
    >
      <AppWindow name="ChatGPT" tile="image" chips={['Dot', 'Sites']} className="top-0 left-0" />
      <AppWindow
        name="Claude"
        tile="artifact"
        chips={['Slides', 'Environments']}
        className="top-[56px] right-0"
      />

      <span className="absolute top-[222px] left-1/2 grid size-[108px] -translate-x-1/2 place-items-center rounded-full border-[6px] border-ink bg-acid font-display text-[40px] font-semibold tracking-wide text-on-accent">
        VS
      </span>

      <div className="absolute inset-x-0 bottom-0 flex h-[64px] items-center justify-center gap-4 rounded-2xl border border-line bg-panel">
        <span className={`${LABEL_TYPE} text-faint`}>共有</span>
        <span className="text-[20px] text-muted">
          專案管理・Computer Use・Remote Control・AI in Chrome
        </span>
      </div>
    </div>
  );
}

const COVER_LEAD = [
  '這堂課只看「桌面版」：ChatGPT 與 Claude 的桌面 App，除了對話，還能管理專案、操作電腦上的 App，甚至遠端操控另一台電腦。',
  '先認識兩家的介面，再看共有與各自獨特的能力：ChatGPT 的 Dot、產圖與 Sites，Claude 的互動式 Artifact、四種產出與三種開發模式；接著是小章節 Google Antigravity，最後一部分是「開發屬於自己的工具」。',
] as const;

export function CoverDemo() {
  return (
    <div className="flex h-full w-full items-center gap-16">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          第五堂課
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          AI 桌面助理開發實戰
        </h2>
        <p className="mt-4 font-display text-[52px] leading-[1.2] font-semibold tracking-tight text-paper">
          ChatGPT vs Claude
        </p>
        {/* 中文換行不能靠 JSX 斷行（會多出空白），所以整段寫成字串 */}
        <p className="mt-8 max-w-[900px] text-[26px] leading-[1.75] text-muted">
          {COVER_LEAD[0]}
        </p>
        <p className="mt-5 max-w-[900px] text-[26px] leading-[1.75] text-muted">
          {COVER_LEAD[1]}
        </p>
      </div>
      <CoverVisual />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 4 頁 · ToolFeelDemo — 目前對於 AI 工具的體感
 *
 * Notion 那張表照抄成評分表。點欄名（工具）或列名（項目）高亮那一欄／列，
 * 再點一次取消；底部摘要列從表格算出這一欄／列的重點，不加評語。
 * 欄被選取時表頭是實心 acid，列被選取時列名有 6px acid 左粗條，
 * 儲存格的 acid/14 淡底只是輔助。
 * ══════════════════════════════════════════════════════════════ */

const FEEL_TOOLS = ['ChatGPT', 'Claude', 'Gemini'] as const;

/** 數字是星星數；字串是文字；null 是原表空白 */
type FeelCell = number | string | null;

interface FeelRow {
  name: string;
  cells: readonly [FeelCell, FeelCell, FeelCell];
}

const FEEL_ROWS: readonly FeelRow[] = [
  { name: '通用程度', cells: [3, 1, 1] },
  { name: '產圖', cells: [3, null, 1] },
  { name: '一般 Coding', cells: [3, 3, 1] },
  // ChatGPT 的這兩格依 CODD 筆記（2026-11-10）由 1 星改成 2 星
  { name: '大型專案', cells: [2, 3, null] },
  { name: 'CLI 工具完整性', cells: [2, 3, 1] },
  { name: 'Desktop 工具完整性', cells: [3, 2, null] },
  // 講師 2026-11-17 補的一列：對商業模式的理解，Claude、ChatGPT 各 1 星，Gemini 2 星
  { name: '商業模式的理解', cells: [1, 1, 2] },
  { name: '特化用處', cells: ['圖片、語音對話', null, 'Google 搜尋混合能力'] },
];

type FeelPick = { kind: 'row' | 'col'; index: number } | null;

function Stars({ count, size }: { count: number; size: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1" role="img" aria-label={`${count} 顆星`}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d={STAR_PATH} fill="var(--color-amber)" />
        </svg>
      ))}
    </span>
  );
}

function FeelValue({ value }: { value: FeelCell }) {
  if (value === null) {
    return (
      <span className="text-[26px] text-faint" aria-label="空白">
        —
      </span>
    );
  }
  if (typeof value === 'number') return <Stars count={value} size={30} />;
  return <span className="text-[23px] leading-snug text-paper">{value}</span>;
}

/** 摘要列的一小段：標籤 ＋ 內容 */
function SummaryPart({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      {label}
      <span className="text-[21px] leading-none text-paper">{children}</span>
    </span>
  );
}

function SummaryLabel({ children }: { children: ReactNode }) {
  return <span className="text-[18px] leading-none text-faint">{children}</span>;
}

function FeelSummary({ pick }: { pick: FeelPick }) {
  if (!pick) {
    return (
      <p className="text-[21px] leading-snug text-muted">
        點欄名（ChatGPT、Claude、Gemini）看單一工具，點列名比較同一件事。空白的格子是原表就沒有填。
      </p>
    );
  }

  if (pick.kind === 'col') {
    const tool = FEEL_TOOLS[pick.index];
    const byStars = [3, 2, 1]
      .map((count) => ({
        count,
        names: FEEL_ROWS.filter((row) => row.cells[pick.index] === count).map((row) => row.name),
      }))
      .filter((part) => part.names.length > 0);
    const blank = FEEL_ROWS.filter((row) => row.cells[pick.index] === null).map((row) => row.name);
    const special = FEEL_ROWS.find((row) => typeof row.cells[pick.index] === 'string');

    return (
      <div className="flex min-w-0 items-center gap-8">
        <span className="shrink-0 text-[24px] leading-none font-semibold text-paper">{tool}</span>
        {byStars.map((part) => (
          <SummaryPart key={part.count} label={<Stars count={part.count} size={20} />}>
            {part.names.join('、')}
          </SummaryPart>
        ))}
        {blank.length > 0 && (
          <SummaryPart label={<SummaryLabel>空白</SummaryLabel>}>{blank.join('、')}</SummaryPart>
        )}
        {special && (
          <SummaryPart label={<SummaryLabel>{special.name}</SummaryLabel>}>
            {special.cells[pick.index]}
          </SummaryPart>
        )}
      </div>
    );
  }

  const row = FEEL_ROWS[pick.index];
  const texts = FEEL_TOOLS.map((tool, index) => ({ tool, value: row.cells[index] })).filter(
    (item) => typeof item.value === 'string',
  );
  const blank = FEEL_TOOLS.filter((_, index) => row.cells[index] === null);

  if (texts.length > 0) {
    return (
      <div className="flex min-w-0 items-center gap-8">
        <span className="shrink-0 text-[24px] leading-none font-semibold text-paper">{row.name}</span>
        {texts.map((item) => (
          <SummaryPart key={item.tool} label={<SummaryLabel>{item.tool}</SummaryLabel>}>
            {item.value}
          </SummaryPart>
        ))}
        {blank.length > 0 && (
          <SummaryPart label={<SummaryLabel>空白</SummaryLabel>}>{blank.join('、')}</SummaryPart>
        )}
      </div>
    );
  }

  const numbers = row.cells.map((value) => (typeof value === 'number' ? value : 0));
  const best = Math.max(...numbers);
  const leaders = FEEL_TOOLS.filter((_, index) => numbers[index] === best);

  return (
    <div className="flex min-w-0 items-center gap-8">
      <span className="shrink-0 text-[24px] leading-none font-semibold text-paper">{row.name}</span>
      <SummaryPart label={<SummaryLabel>{leaders.length > 1 ? '並列最高' : '最高'}</SummaryLabel>}>
        <span className="flex items-center gap-2.5">
          {leaders.join('、')}
          <Stars count={best} size={20} />
        </span>
      </SummaryPart>
      {blank.length > 0 && (
        <SummaryPart label={<SummaryLabel>空白</SummaryLabel>}>{blank.join('、')}</SummaryPart>
      )}
    </div>
  );
}

export function ToolFeelDemo() {
  const [pick, setPick] = useState<FeelPick>(null);

  const toggle = (kind: 'row' | 'col', index: number) =>
    setPick((current) =>
      current && current.kind === kind && current.index === index ? null : { kind, index },
    );

  const rowOn = (index: number) => pick?.kind === 'row' && pick.index === index;
  const colOn = (index: number) => pick?.kind === 'col' && pick.index === index;

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col">
      {/* 說明列：靠左，右上角留給浮水印 */}
      <div className="flex h-[52px] shrink-0 items-center gap-4">
        <span className="rounded-full bg-paper px-4 py-1 text-[17px] font-semibold text-on-accent">
          講師個人體感
        </span>
        <span className="text-[24px] text-paper">卡斯伯自己用下來的感覺，不是評測數據。</span>
      </div>

      <div className="mt-5 flex shrink-0 flex-col gap-1.5">
        {/* 表頭 */}
        <div className="grid h-[60px] grid-cols-[360px_repeat(3,minmax(0,1fr))] gap-1.5">
          <span className={`flex items-end px-5 pb-2 ${LABEL_TYPE} text-faint`}>項目 ／ 工具</span>
          {FEEL_TOOLS.map((tool, index) => (
            <button
              key={tool}
              type="button"
              onClick={(event) => {
                toggle('col', index);
                blurAfterClick(event);
              }}
              onKeyDown={keepActivationKeys}
              aria-pressed={colOn(index)}
              className={`flex items-center justify-center rounded-xl border text-[26px] font-semibold transition-colors duration-200 ${
                colOn(index)
                  ? 'border-acid bg-acid text-on-accent'
                  : 'border-line-soft bg-panel-lift text-paper hover:border-line'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        {/* 八列 */}
        {FEEL_ROWS.map((row, rowIndex) => (
          <div
            key={row.name}
            className="grid h-[58px] grid-cols-[360px_repeat(3,minmax(0,1fr))] gap-1.5"
          >
            <button
              type="button"
              onClick={(event) => {
                toggle('row', rowIndex);
                blurAfterClick(event);
              }}
              onKeyDown={keepActivationKeys}
              aria-pressed={rowOn(rowIndex)}
              className={`flex items-center rounded-xl border border-l-[6px] px-5 text-left text-[24px] text-paper transition-colors duration-200 ${
                rowOn(rowIndex)
                  ? 'border-acid/55 border-l-acid bg-acid/14 font-semibold'
                  : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
              }`}
            >
              {row.name}
            </button>
            {row.cells.map((value, colIndex) => {
              const lit = rowOn(rowIndex) || colOn(colIndex);
              return (
                <div
                  key={FEEL_TOOLS[colIndex]}
                  className={`flex items-center justify-center rounded-xl border px-4 transition-colors duration-200 ${
                    lit ? 'border-acid/55 bg-acid/14' : 'border-line-soft bg-panel'
                  }`}
                >
                  <FeelValue value={value} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 摘要列 */}
      <div
        className={`mt-auto flex h-[72px] shrink-0 items-center rounded-2xl border border-l-[6px] px-7 transition-colors duration-200 ${
          pick ? 'border-acid/55 border-l-acid bg-panel' : 'border-line border-l-line bg-panel-lift'
        }`}
      >
        <FeelSummary pick={pick} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 5 頁 · SubscriptionDemo — 卡斯伯目前訂閱
 *
 * 三張卡片：產品、方案、單價 × 帳號數、用途、Notion 原文。
 * Google 卡底部是 Antigravity 連結卡。
 * 原本底部有每月合計（含勾選框與月／年切換），CODD 筆記說不需要，已拿掉。
 * ══════════════════════════════════════════════════════════════ */

type PlanId = 'chatgpt' | 'claude' | 'google';

interface Plan {
  id: PlanId;
  product: string;
  plan: string;
  currency: 'USD' | 'TWD';
  /** 單一帳號每月 */
  price: number;
  count: number;
  use: string;
  /** Notion 原文 */
  raw: string;
}

const PLANS: readonly Plan[] = [
  {
    id: 'chatgpt',
    product: 'ChatGPT',
    plan: 'Pro 100',
    currency: 'USD',
    price: 100,
    count: 1,
    use: '日常使用、產圖',
    raw: 'ChatGPT 100*1',
  },
  {
    id: 'claude',
    product: 'Claude',
    plan: 'Ultra（原 Max 20x）',
    currency: 'USD',
    price: 200,
    count: 3,
    use: '主力開發，架構、探索能力最強',
    raw: 'Claude 200*3',
  },
  {
    id: 'google',
    product: 'Google AI Ultra',
    plan: '100 方案・以台幣付款',
    currency: 'TWD',
    price: 3300,
    count: 1,
    use: '搭配 AGY CLI 來優化 SEO',
    raw: 'Google AI Ultra 100*1（3300）',
  },
];

const ANTIGRAVITY_URL = 'https://antigravity.google/';

function money(currency: Plan['currency'], amount: number) {
  return `${currency === 'USD' ? 'US$' : 'NT$'}${amount.toLocaleString('en-US')}`;
}

function AntigravityLink() {
  return (
    <a
      href={ANTIGRAVITY_URL}
      target="_blank"
      rel="noreferrer"
      className="group flex shrink-0 items-center gap-4 rounded-2xl border-2 border-blue/70 bg-panel px-5 py-3 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
    >
      <span className="size-2.5 shrink-0 rounded-full bg-blue" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className={`${LABEL_TYPE} text-blue`}>Google Antigravity</span>
        <span className="font-mono text-[19px] leading-tight text-blue">antigravity.google</span>
      </span>
      <span
        aria-hidden="true"
        className="ml-auto text-[26px] text-blue transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </a>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-l-[6px] border-line border-l-acid bg-panel px-8 py-7">
      {/* 產品名靠左（右上角留空） */}
      <p className="flex h-10 shrink-0 items-center text-[30px] leading-tight font-semibold text-paper">
        {plan.product}
      </p>

      <div className="mt-2 flex shrink-0 items-center gap-3">
        <span className="rounded-full border border-line px-3 py-0.5 text-[17px] text-muted">
          {plan.plan}
        </span>
      </div>

      <div className="mt-6 flex shrink-0 items-baseline gap-2">
        <span className="font-display text-[60px] leading-none font-semibold tabular-nums text-paper">
          {money(plan.currency, plan.price)}
        </span>
        <span className="text-[22px] text-muted">／月</span>
      </div>
      <p className="mt-3 shrink-0 text-[24px] leading-snug text-paper">
        × {plan.count} 個帳號
        {plan.count > 1 && (
          <span className="ml-4 font-semibold">
            ＝ {money(plan.currency, plan.price * plan.count)}／月
          </span>
        )}
      </p>

      <div className="mt-6 shrink-0 border-t border-line-soft pt-5">
        <p className={`${LABEL_TYPE} text-faint`}>用途</p>
        <p className="mt-2 text-[26px] leading-snug text-paper">{plan.use}</p>
      </div>

      <p className="mt-auto shrink-0 font-mono text-[17px] text-faint">Notion：{plan.raw}</p>
      {plan.id === 'google' && (
        <div className="mt-3.5">
          <AntigravityLink />
        </div>
      )}
    </div>
  );
}

export function SubscriptionDemo() {
  return (
    // 拿掉每月合計之後不再撐滿 720 高：卡片照內容高度，整組在內容區垂直置中
    <div className="grid w-full max-w-[1740px] grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 7 頁 · AgendaDemo — 本次重點：桌面版
 *
 * 左上：coral 提示框，講師原句「先說一下，如果是一般問答，不在本次介紹範疇」。
 * 左下：七個分組（兩家的介面、共有、ChatGPT、Claude、Google Antigravity、開發屬於自己的工具、投票結果）。
 * 右：選到的分組有哪些頁（頁碼、標題、一句短說明、投票標記）；
 *     「開發屬於自己的工具」那一組在下面補三條重點，投票結果那一組補兩條。頁尾說明投票。
 * 一進頁面停在第一組「兩家的介面」（下一頁就是它）。
 * ══════════════════════════════════════════════════════════════ */

export function AgendaDemo() {
  const [current, setCurrent] = useState<GroupId>('interface');
  const group = groupById(current);
  const groupIndex = GROUPS.indexOf(group);
  const bullets = group.id === 'results' ? resultBullets() : group.bullets;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[560px_1fr] gap-8">
      {/* ── 左：提示框 ＋ 七個分組 ───────────────────────── */}
      {/* 七組之後提示框收緊一點（py-5 → py-4、gap-3 → gap-2），讓每組多 2px 左右 */}
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-l-[6px] border-coral/55 border-l-coral bg-coral/14 px-6 py-4">
          <span className="w-fit rounded-full bg-coral px-4 py-1 text-[18px] font-semibold text-on-accent">
            先說一下
          </span>
          <p className="text-[27px] leading-snug font-semibold text-paper">
            如果是一般問答，不在本次介紹範疇。
          </p>
          <p className="text-[19px] leading-snug text-muted">
            這堂課的重點是「桌面版」App 能做的事。
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {GROUPS.map((item, index) => {
            const on = item.id === current;
            const votes = voteCount(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={(event) => {
                  setCurrent(item.id);
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                aria-current={on}
                className={`flex min-h-0 flex-1 items-center gap-4 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
                  on
                    ? 'border-acid border-l-acid bg-acid/14'
                    : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
                }`}
              >
                <span
                  className={`w-10 shrink-0 font-display text-[28px] leading-none font-semibold tabular-nums ${
                    on ? 'text-acid' : 'text-faint'
                  }`}
                >
                  {pad2(index + 1)}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className={`text-[24px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
                    {item.name}
                  </span>
                  <span className={`text-[18px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
                    {pageRange(item)}
                    {votes > 0 && ` · ${votes} 頁可投票`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 右：這一組有哪些頁 ───────────────────────────── */}
      <div
        key={current}
        className="slide-enter flex min-h-0 flex-col rounded-2xl border border-line bg-panel px-9 py-7"
      >
        <div className="flex items-baseline gap-4">
          <span className={`${LABEL_TYPE} text-acid`}>目錄 {pad2(groupIndex + 1)}／{pad2(GROUPS.length)}</span>
          <span className="text-[19px] text-faint">{pageRange(group)}</span>
        </div>
        <h3 className="mt-1.5 text-[36px] leading-tight font-semibold text-paper">{group.fullName}</h3>
        <p className="mt-1.5 text-[21px] leading-snug text-muted">{group.desc}</p>

        <ol className="mt-4 flex flex-col border-t border-line">
          {group.pages.map((page) => (
            <li
              key={page.no}
              className="grid h-[44px] shrink-0 grid-cols-[56px_430px_minmax(0,1fr)_84px] items-center gap-x-3 border-b border-line-soft"
            >
              <span className="font-mono text-[19px] text-faint tabular-nums">{pad2(page.no)}</span>
              <span className="text-[23px] leading-tight text-paper">{page.title}</span>
              <span className="text-[19px] leading-tight text-muted">{page.note}</span>
              <span className="flex justify-end">{page.vote && <VoteMark />}</span>
            </li>
          ))}
        </ol>

        {bullets && bullets.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2 rounded-xl border border-line-soft bg-ink-soft px-6 py-4">
            {bullets.map((line) => (
              <li key={line} className="flex items-start gap-3 text-[21px] leading-snug text-paper">
                <span className="mt-[11px] size-2 shrink-0 rounded-full bg-paper" />
                {line}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto flex items-center gap-3 border-t border-line-soft pt-4 text-[19px] text-muted">
          <VoteMark />
          有這個標記的功能頁，底部可以投 1～5 分，5 分是滿分；最後一頁看投票結果。
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 章節頁 · SharedCover／ChatgptCover／ClaudeCover／AntigravityCover／OwnToolsCover
 *
 * 左：kicker（第幾部分）、大標、主句、導言、這一部分有幾頁可以投票。
 * 右：五段進度（目前這一部分實心 acid）＋ 這一部分包含的頁面清單。
 *     五段進度照字寬分配（flex-grow）：等寬的話每格只有 129，放不下「04 Antigravity」。
 * ══════════════════════════════════════════════════════════════ */

const PART_ORDER: readonly PartId[] = ['shared', 'chatgpt', 'claude', 'antigravity', 'own-tools'];

const PART_COPY: Record<
  PartId,
  { kicker: string; tab: string; heading: string; summary: string; lead: string }
> = {
  shared: {
    kicker: '第一部分',
    tab: '共有',
    heading: 'ChatGPT、Claude\n共有的能力',
    summary: '兩家桌面版都有的功能，放在一起對照。',
    lead: '從模型強度、專案管理與兩家專案的差異開始，一路看到 Computer Use、Remote Control、語音搭配 MCP 與 AI in Chrome；Computer Use 和 AI in Chrome 各有一頁實作。',
  },
  chatgpt: {
    kicker: '第二部分',
    tab: 'ChatGPT',
    heading: '獨特的能力：ChatGPT',
    summary: 'ChatGPT 這一邊才有的能力。',
    // \u00a0（不換行空白）：不讓「Record & Replay」從中間換行
    lead: '依事件自己觸發的 Dot、圖片與 GIF 生成、示範一次就能重複使用的 Record\u00a0&\u00a0Replay、Sites，以及浮在桌面上的 Mini 寵物。',
  },
  claude: {
    kicker: '第三部分',
    tab: 'Claude',
    heading: '獨特的能力：Claude',
    summary: 'Claude 這一邊才有的能力。',
    lead: '能互動、Claude 也讀得到結果的 Artifact，簡報、設計、儀表板與動畫四種產出，以及 Claude Desktop 的三種開發模式：先看各自能做什麼，實際跑一次，再看可以用在哪些情境。',
  },
  antigravity: {
    kicker: '小章節',
    tab: 'Antigravity',
    heading: 'Google\nAntigravity',
    // 講師原話（codd://note/note-plus，2026-11-18）：
    // 「它的 IDE 還是存在，不過它現在又多出類似 ChatGPT 或 Claude 的桌面版應用程式」
    summary: '它的 IDE 還在，現在又多出類似 ChatGPT、Claude 的桌面版應用程式。',
    // 名稱與時間照官方（查核日 2026-11-18，出處見檔頭「查證 2026-11-18」）；
    // 「優劣勢」是講師筆記的用詞，Argon、Carbon 是第 38 頁左欄的兩個模型
    lead: '2026 年 5 月的 Antigravity 2.0 另外推出獨立的桌面 App，原本的編輯器改名 Antigravity IDE 繼續提供。接著用比較表看 Gemini（含新模型 Argon、Carbon）和 ChatGPT、Claude 的優劣勢，最後是兩個實例。',
  },
  'own-tools': {
    // 不寫「第四部分」：Antigravity 是小章節、進度列排 04，這一部分是 05
    kicker: '最後一部分',
    tab: '自己的工具',
    // 章節名稱照講師原話（codd://note/note-plus，2026-11-18）：
    // 「接下來的主題應該叫做『開發屬於自己的工具』」
    heading: '開發屬於自己的工具',
    summary: '先看社群上大家替自己做的工具，再看我自己開發的 CODD。',
    // 呼應第 3 頁作業；四類照第 41 頁的類別與講師的說法（龍蝦）
    lead: '呼應第 3 頁的作業「替自己的開發做一個工具」：社群上已經有人做了用量監測、切換帳號、跨 session 管理，以及龍蝦這類的個人 AI 助理。接著是我自己做的 CODD，和實戰中的跨裝置流程與 GitHub Project。',
  },
};

function PartCover({ part }: { part: PartId }) {
  const copy = PART_COPY[part];
  const group = groupById(part);
  const votes = voteCount(group);

  return (
    <div className="flex h-full w-full items-center gap-20">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          {copy.kicker}
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight whitespace-pre-line text-paper">
          {copy.heading}
        </h2>
        <p className="mt-8 max-w-[1000px] text-[30px] leading-[1.6] font-medium text-paper">
          {copy.summary}
        </p>
        <p className="mt-5 max-w-[1000px] text-[26px] leading-[1.75] text-muted">{copy.lead}</p>
        <p className="mt-10 flex items-center gap-3 text-[22px] text-muted">
          <VoteMark />
          這一部分有 {votes} 個功能頁可以投票（1～5 分）
        </p>
      </div>

      <div className="flex w-[680px] shrink-0 flex-col gap-4">
        {/* 五格照字寬分配：basis 是字寬，剩下的空間平均加給每一格 */}
        <ol className="flex gap-2">
          {PART_ORDER.map((id, index) => {
            const active = id === part;
            return (
              <li
                key={id}
                aria-current={active ? 'step' : undefined}
                className={`flex h-11 grow items-center gap-2 rounded-lg border px-3 text-[18px] whitespace-nowrap ${
                  active
                    ? 'border-acid bg-acid font-semibold text-on-accent'
                    : 'border-line bg-panel text-muted'
                }`}
              >
                <span className="font-display tabular-nums">{pad2(index + 1)}</span>
                <span>{PART_COPY[id].tab}</span>
              </li>
            );
          })}
        </ol>

        <ol className="flex flex-col gap-2">
          {group.pages.map((page) => (
            <li
              key={page.no}
              className="grid h-[50px] grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-line bg-panel px-5"
            >
              <span className="font-mono text-[19px] text-faint tabular-nums">{pad2(page.no)}</span>
              <span className="text-[23px] leading-tight text-paper">{page.title}</span>
              {page.vote ? <VoteMark /> : <span />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function SharedCover() {
  return <PartCover part="shared" />;
}

export function ChatgptCover() {
  return <PartCover part="chatgpt" />;
}

export function ClaudeCover() {
  return <PartCover part="claude" />;
}

export function AntigravityCover() {
  return <PartCover part="antigravity" />;
}

/** 第 40 頁：最後一部分「開發屬於自己的工具」（2026-11-18 新增） */
export function OwnToolsCover() {
  return <PartCover part="own-tools" />;
}
