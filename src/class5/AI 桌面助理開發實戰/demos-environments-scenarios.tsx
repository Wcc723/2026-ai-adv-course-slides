import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：Claude › Environments
 *
 *   第 35 頁  EnvironmentsScenariosDemo  Environments：可以用在哪些情境（沒有投票 → 根容器 720）
 *   （前兩頁：第 33 頁 demos-environments.tsx 的三種開發模式、第 34 頁 demos-environments-try.tsx 的實作）
 *
 * 2026-11-19 講師要求：「可以用來做什麼，你幫我上網查（也包含我介紹的），然後 34 page 後方補一頁
 * 可以用到的情境」。第 33 頁講「每種模式可以做什麼」（抽象的用途），這一頁放具體情境，
 * 所以卡片的字不重複第 33 頁「可以做什麼」的寫法。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（查核日 2026-11-19；研究員蒐集、查證員逐條對過原文）
 * ──────────────────────────────────────────────────────────────
 * 畫面上的九張卡（講師在第 33 頁寫的三個用途也在其中，2026-11-19 起不另外標示）：
 *   本機  改完畫面當場驗證
 *         https://code.claude.com/docs/en/desktop#preview-your-app
 *         「Claude can start a dev server and open it in the Browser pane to verify its changes. This works
 *          for frontend web apps as well as backend servers」；SSH session 沒有 Browser 面板的工具。
 *         雲端 session 有沒有，文件沒寫，所以只放在本機。
 *   本機＋雲端  本機寫規格、雲端寫程式
 *         https://code.claude.com/docs/en/claude-code-on-the-web
 *         「Plan locally, execute in the cloud: for complex tasks, start Claude in plan mode to collaborate
 *          on the approach, then send work to the cloud」
 *         台灣實例 https://ithelp.ithome.com.tw/articles/10425144（iT 邦幫忙，2026-10-29；WebFetch 回 403，
 *         用 curl 確認）：規格推上 GitHub 後，雲端「大約 40 分鐘後 PR #1 開好，118 個測試全過」；
 *         分法「兩個都不需要，就丟雲端。有一個需要，就留在本機」。
 *   雲端  直接在雲端開發（講師的用途）
 *         https://code.claude.com/docs/en/desktop#run-long-running-tasks-in-the-cloud
 *         「For large refactors, test suites, migrations, or other long-running tasks, select an environment
 *          under Cloud … continue even if you close the app or shut down your computer.」
 *         之後從 claude.ai/code 或手機 App 回來看進度。
 *   雲端  手機上盯 PR
 *         https://code.claude.com/docs/en/claude-code-on-the-web#auto-fix-pull-requests
 *         「From the mobile app: tell Claude to auto-fix the PR, for example "watch this PR and fix any CI
 *          failures or review comments"」；修法明確就直接 push，有歧義先問；repo 要先裝 Claude GitHub App。
 *   排程  每天固定時間的排程（講師的用途）
 *         https://code.claude.com/docs/en/routines（scheduled tasks，以前叫 routines，研究預覽）
 *         例子是文件的 backlog maintenance：每個平日晚上讀上次之後新開的 issue、貼標籤、
 *         依程式碼區域指派負責人，摘要貼到 Slack。
 *   排程  告警一響先查原因
 *         同上，API 觸發：「your monitoring tool calls the scheduled task's API endpoint when an error
 *         threshold is crossed … opens a draft pull request with a proposed fix and a link back to the alert.」
 *   排程  PR 一開就先審
 *         https://code.claude.com/docs/en/routines#add-a-github-trigger
 *         「a GitHub trigger runs on pull_request.opened. The scheduled task applies your team's own review
 *          checklist and leaves inline comments for security, performance, and style issues.」
 *   遠端  連到另一台主機開發（講師的用途；這堂課不示範）
 *         https://code.claude.com/docs/en/desktop#ssh-sessions
 *         「useful for working with codebases that live on cloud VMs, dev containers, or servers with specific
 *          hardware or dependencies」；第一次連線時 Desktop 會自動在遠端安裝 Claude Code。
 *   遠端  AWS 金鑰不放筆電
 *         https://dev.classmethod.jp/articles/claude-code-ssh-sessions-instructions/（2026-03-03）
 *         「EC2のファイルシステムを直接操作でき、EC2に付与されたIAMロールの権限もそのまま使えます。」
 *         「AWSのAPIキーをローカルに置きたくない → SSH（EC2のIAMロールで認証）」
 *
 * 最下面那一行注意事項：
 *   - 雲端 session 與排程都算在訂閱方案的用量裡（同時跑多個按比例多吃）：
 *     https://code.claude.com/docs/en/cloud-environments、claude-code-on-the-web#limitations
 *   - 雲端每次從 repo 全新 clone（「Cloud sessions start from a fresh clone of your repository」）
 *   - 雲端排程最短每 1 小時一次、讀不到本機檔案（要用本機檔案改用 Desktop 本機排程，App 要開著、電腦要醒著）：
 *     https://code.claude.com/docs/en/scheduled-tasks#compare-scheduling-options
 *   - SSH 用 Claude 帳號登入時，斷線後登入可能幾分鐘就過期而停掉：
 *     https://code.claude.com/docs/en/desktop#keep-a-task-running-while-desktop-is-disconnected
 *   - 「研究預覽」放在排程那一欄的標頭（routines 文件 zh-TW：「排程任務目前處於研究預覽階段」）。
 *
 * 講者口述可用（不上畫面）：
 *   - iT 邦幫忙 https://ithelp.ithome.com.tw/articles/10423566（2026-10-15）：每個交易日 08:07 排程整理盤前資訊
 *     送 Telegram；雲端主機的 IP 被證交所擋，擋頁還回 HTTP 200。
 *   - 每晚 2 點挑最優先的 bug 試修、開 draft PR（https://claude.com/blog/introducing-routines-in-claude-code，
 *     2026-04-14）；發表文寫的每日次數上限已改成每小時上限，不要引用。
 *   - 講師公司內的排程是口頭講，不放畫面（同第 33 頁）。
 *   - Projects（跨 repo 汰換 v1 endpoint）是 public beta，只開放 Pro、Max、Ultra，沒選進來。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 點一張卡：卡片變 acid（6px 左粗條 ＋ 外框 ＋ acid/14 淡底），所屬模式的標頭變 acid
 * （「本機＋雲端」那張兩欄的標頭都亮），下方那一列換成這個情境的一句補充與出處。
 * 鍵盤：卡片只擋 Space／Enter，方向鍵照常翻頁；滑鼠點完就放掉焦點。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（同第 33 頁）
 * ──────────────────────────────────────────────────────────────
 *   acid  選到的卡片、它所屬模式的標頭圖示與名稱、下方出處列的 6px 左粗條
 *   其餘中性色（標籤是 line 外框 ＋ muted 字）。
 *   淡底一律配 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；根容器 720）
 * ──────────────────────────────────────────────────────────────
 *   標頭 56 ＋ 12 ＋ 卡片區 flex-1（最多 3 張 × 162 ＋ 間距 12 × 2 ＝ 510）＋ 12
 *   ＋ 出處列 84 ＋ 10 ＋ 注意事項 26 ≈ 710。
 *   卡片 162 ＝ 框 4 ＋ py 28 ＋ 標籤列 32 ＋ 6 ＋ 標題 32 ＋ 6 ＋ 說明 2 行 × 27。
 *   四欄各約 423 寬，卡片內寬約 375：說明 21px 一行約 17 個中文字，九張都在兩行內；
 *   標題 26px 最長「本機寫規格、雲端寫程式」約 286。
 *   任何互動都不改變外框高度；沒有容器會捲動。浮水印在舞台右上（x 1692–1872、y 104–147），
 *   根容器頂端約在舞台 y 184，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（同 demos-environments.tsx 的做法，複製一份，不 import）── */

const LABEL = 'text-[19px] tracking-[0.08em] text-faint';

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 單一按鈕：只擋啟動鍵，方向鍵照常翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ── 資料 ─────────────────────────────────────────────────── */

type ModeId = 'local' | 'cloud' | 'scheduled' | 'ssh';

interface Group {
  id: ModeId;
  /** 名稱照第 33 頁（本機開發／雲端開發／遠端開發）；排程是第 33 頁雲端底下的「排程自動化」 */
  name: string;
  en?: string;
  tag?: string;
}

const GROUPS: readonly Group[] = [
  { id: 'local', name: '本機開發', en: 'Local' },
  { id: 'cloud', name: '雲端開發', en: 'Cloud' },
  { id: 'scheduled', name: '排程自動化', tag: '研究預覽' },
  { id: 'ssh', name: '遠端開發', en: 'SSH', tag: '這堂課不示範' },
];

interface Scenario {
  id: string;
  /** 放在哪一欄 */
  group: ModeId;
  /** 選到時哪些標頭要亮（「本機＋雲端」兩個都亮） */
  modes: readonly ModeId[];
  /** 跨模式的卡片多一個標籤 */
  modeChip?: string;
  title: string;
  line: string;
  /** 什麼時候用（排程那一欄是觸發方式，用字同第 33 頁的晶片） */
  when: string;
  /** 下方那一列：一句補充 */
  fact: string;
  source: string;
  date: string;
}

const CHECKED = '查核 2026-11-19';

const SCENARIOS: readonly Scenario[] = [
  {
    id: 'local-preview',
    group: 'local',
    modes: ['local'],
    title: '改完畫面當場驗證',
    line: 'Claude 開 dev server，在內建瀏覽器驗畫面',
    when: '用到本機檔案',
    fact: '前端網頁、後端 server 都能這樣驗；SSH 的 session 沒有這組工具',
    source: 'Claude Code 文件 › Desktop › Preview your app',
    date: CHECKED,
  },
  {
    id: 'plan-local',
    group: 'local',
    modes: ['local', 'cloud'],
    modeChip: '本機＋雲端',
    title: '本機寫規格、雲端寫程式',
    line: '規格推上 GitHub，雲端照著寫到開 PR，再回本機審',
    when: '人不用在旁邊',
    fact: '台灣實例：規格推上 GitHub 後，雲端約 40 分鐘開出 PR，118 個測試全過',
    source: 'Claude Code 文件 › Claude Code on the web；iT 邦幫忙 2026-10-29',
    date: CHECKED,
  },
  {
    id: 'cloud-long',
    group: 'cloud',
    modes: ['cloud'],
    title: '直接在雲端開發',
    line: '選 Cloud 交出久跑任務，關掉電腦也繼續',
    when: '關機照跑',
    fact: '大型重構、整套測試、資料遷移；之後從 claude.ai/code 或手機 App 回來看進度',
    source: 'Claude Code 文件 › Desktop › Run long-running tasks in the cloud',
    date: CHECKED,
  },
  {
    id: 'cloud-pr',
    group: 'cloud',
    modes: ['cloud'],
    title: '手機上盯 PR',
    line: '叫 Claude 盯著 PR，CI 失敗或有人留言就修',
    when: '手機接手',
    fact: '修法明確就直接 push，意見有歧義會先問你；repo 要先裝 Claude GitHub App',
    source: 'Claude Code 文件 › Claude Code on the web › Auto-fix pull requests',
    date: CHECKED,
  },
  {
    id: 'sched-daily',
    group: 'scheduled',
    modes: ['scheduled'],
    title: '每天固定時間的排程',
    line: '每天固定時間自動跑，筆電闔上也照跑',
    when: '定時',
    fact: '例如每個平日晚上整理新 issue、貼標籤、指派負責人，摘要貼到 Slack',
    source: 'Claude Code 文件 › 排程任務（Routines）',
    date: CHECKED,
  },
  {
    id: 'sched-alert',
    group: 'scheduled',
    modes: ['scheduled'],
    title: '告警一響先查原因',
    line: '監控告警打 API，Claude 先查原因、開修正 PR',
    when: 'API 呼叫',
    fact: '錯誤超過門檻時監控工具呼叫 API，Claude 比對 stack trace 與最近的 commit，開 draft PR',
    source: 'Claude Code 文件 › 排程任務（Routines）› API 觸發',
    date: CHECKED,
  },
  {
    id: 'sched-review',
    group: 'scheduled',
    modes: ['scheduled'],
    title: 'PR 一開就先審',
    line: '新 PR 一開，先跑團隊的 review 清單留註解',
    when: 'GitHub 事件',
    fact: 'PR 一開就觸發，針對安全、效能、風格留行內註解，人類 reviewer 專心看設計',
    source: 'Claude Code 文件 › 排程任務（Routines）› GitHub 觸發',
    date: CHECKED,
  },
  {
    id: 'ssh-host',
    group: 'ssh',
    modes: ['ssh'],
    title: '連到另一台主機開發',
    line: 'SSH 連到自己的伺服器或雲端 VM，直接在上面開發',
    when: '另一台主機',
    fact: 'Desktop 只當介面，Claude Code 跑在遠端；第一次連線時會自動在遠端安裝',
    source: 'Claude Code 文件 › Desktop › SSH sessions',
    date: CHECKED,
  },
  {
    id: 'ssh-aws',
    group: 'ssh',
    modes: ['ssh'],
    title: 'AWS 金鑰不放筆電',
    line: 'SSH 進 EC2，直接用主機的 IAM 權限操作 AWS',
    when: '正式環境',
    fact: '直接操作 EC2 上的檔案，沿用 EC2 的 IAM role，API key 不用放在本機',
    source: 'Classmethod DevelopersIO（日文）2026-03-03',
    date: CHECKED,
  },
];

/* ── 圖示（40 × 40，線條用 currentColor；前三個同第 33 頁）──── */

function ModeIcon({ id }: { id: ModeId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      {id === 'local' && (
        <>
          <rect x={6} y={7} width={28} height={19} rx={2.5} {...common} />
          <path d="M2 31h36l-2.5 3.5h-31z" {...common} />
        </>
      )}
      {id === 'cloud' && (
        <path d="M12 31h17.5a7 7 0 0 0 .8-13.96A10 10 0 0 0 11 15.2 8 8 0 0 0 12 31z" {...common} />
      )}
      {id === 'scheduled' && (
        <>
          <circle cx={20} cy={20} r={14} {...common} />
          <path d="M20 12v8.5l5.5 3.5" {...common} />
        </>
      )}
      {id === 'ssh' && (
        <>
          <rect x={6} y={6} width={28} height={12} rx={2.5} {...common} />
          <rect x={6} y={22} width={28} height={12} rx={2.5} {...common} />
          <circle cx={12} cy={12} r={1.6} fill="currentColor" stroke="none" />
          <circle cx={12} cy={28} r={1.6} fill="currentColor" stroke="none" />
          <path d="M19 12h9M19 28h9" {...common} />
        </>
      )}
    </svg>
  );
}

function Chip({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      className={`inline-flex h-8 shrink-0 items-center rounded-md border-2 px-2.5 text-[19px] leading-none whitespace-nowrap ${
        strong ? 'border-paper text-paper' : 'border-line text-muted'
      }`}
    >
      {children}
    </span>
  );
}

/* ── 欄標頭與卡片 ─────────────────────────────────────────── */

function GroupHeader({ group, on }: { group: Group; on: boolean }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-line px-1">
      <span className={on ? 'text-acid' : 'text-paper'}>
        <ModeIcon id={group.id} />
      </span>
      <span
        className={`text-[26px] leading-none font-semibold whitespace-nowrap transition-colors duration-200 ${
          on ? 'text-acid' : 'text-paper'
        }`}
      >
        {group.name}
      </span>
      {group.en && <span className="font-mono text-[19px] leading-none text-muted">{group.en}</span>}
      {group.tag && (
        <span className="ml-auto">
          <Chip>{group.tag}</Chip>
        </span>
      )}
    </div>
  );
}

function ScenarioCard({
  item,
  on,
  onPick,
}: {
  item: Scenario;
  on: boolean;
  onPick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      onKeyDown={keepActivationKeys}
      className={`flex h-[162px] w-full shrink-0 flex-col gap-1.5 rounded-2xl border-2 border-l-[6px] px-5 py-3.5 text-left transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'border-acid border-l-acid bg-acid/14' : 'border-line border-l-line bg-panel-lift hover:border-acid'
      }`}
    >
      <span className="flex h-8 shrink-0 items-center gap-2">
        {item.modeChip && <Chip strong>{item.modeChip}</Chip>}
        <Chip>{item.when}</Chip>
      </span>
      <span className="text-[26px] leading-8 font-semibold text-paper">{item.title}</span>
      {/* break-keep：只在空白與標點後換行，不把詞拆開；text-balance：兩行平均分，不讓一兩個字單獨掉到第二行 */}
      <span className="text-[21px] leading-[27px] break-keep text-balance text-muted">{item.line}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 35 頁 EnvironmentsScenariosDemo — 可以用在哪些情境
 *
 *   上  四欄：本機開發／雲端開發／排程自動化／遠端開發，每欄 2～3 張情境卡
 *   下  選到的情境：一句補充 ＋ 出處；最下面一行注意事項
 * ══════════════════════════════════════════════════════════════ */

export function EnvironmentsScenariosDemo() {
  const [picked, setPicked] = useState<string>(SCENARIOS[0].id);
  const current = SCENARIOS.find((item) => item.id === picked) ?? SCENARIOS[0];

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col">
      {/* ── 四欄情境 ───────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-4" role="group" aria-label="Environments 的使用情境">
        {GROUPS.map((group) => (
          <div key={group.id} className="flex min-w-0 flex-col gap-3">
            <GroupHeader group={group} on={current.modes.includes(group.id)} />
            {SCENARIOS.filter((item) => item.group === group.id).map((item) => (
              <ScenarioCard
                key={item.id}
                item={item}
                on={item.id === picked}
                onPick={(event) => {
                  setPicked(item.id);
                  blurAfterClick(event);
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── 選到的情境：補充與出處 ─────────────────────── */}
      <div
        aria-live="polite"
        className="mt-3 flex h-[84px] shrink-0 flex-col justify-center gap-1 rounded-xl border-2 border-l-[6px] border-line border-l-acid bg-ink-soft px-6"
      >
        <p key={current.id} className="slide-enter flex items-baseline gap-4 whitespace-nowrap">
          <span className="text-[22px] leading-[30px] font-semibold text-paper">{current.title}</span>
          <span className="text-[21px] leading-[30px] text-paper">{current.fact}</span>
        </p>
        <p className="flex items-baseline gap-3 text-[19px] leading-[26px] whitespace-nowrap">
          <span className={LABEL}>出處</span>
          <span className="text-muted">{current.source}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{current.date}</span>
        </p>
      </div>

      {/* ── 注意事項 ───────────────────────────────────── */}
      <p className="mt-2.5 flex h-[26px] shrink-0 items-center gap-3 text-[19px] leading-[26px] whitespace-nowrap">
        <span className={LABEL}>注意</span>
        <span className="text-muted">
          雲端與排程都算訂閱用量 · 雲端每次從 GitHub 重新 clone · 雲端排程最短每小時一次、讀不到本機檔案 ·
          SSH 用 Claude 帳號登入時，斷線後可能幾分鐘就停
        </span>
      </p>
    </div>
  );
}
