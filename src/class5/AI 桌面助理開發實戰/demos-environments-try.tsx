import { useEffect, useId, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：Claude › Environments
 *
 *   第 34 頁  EnvironmentsTryDemo  Environments 實作：同一個專案，Local 和 Cloud 各跑一次
 *             （沒有投票 → 根容器 720；第 33 頁在 demos-environments.tsx，
 *              後面第 35 頁的使用情境在 demos-environments-scenarios.tsx）
 *
 * 2026-11-19 依講師的新目標重寫：只講 Local 與 Cloud（SSH／Docker 的示範整段拿掉），
 * 三句提示詞依序送（提示詞一 → 提示詞二 → echo），看 ③ 環境變數那一段。
 * 同一天第二次調整：原本第 34 頁（環境變數）移除，這一頁從第 35 頁變第 34 頁；
 * 底部的「這個功能拿來做什麼」三個用途移到第 33 頁（demos-environments.tsx），
 * 省下的高度給終端機（字級 19 → 20、行高 26 → 34）與提示詞（21 → 23）。提示詞與輸出的文字不變。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師準備的範例專案 第五堂/Claude/env-switch-demo（commit 53c776c；README.md、CLAUDE.md、
 * .env.example、scripts/lib/collect.mjs）。畫面上的路徑只顯示到「第五堂/Claude/env-switch-demo」。
 *   - 左欄的檔案結構是 README「檔案結構」的精簡版；三句提示詞照 README，一字不改。
 *   - 每個分頁「這個環境要先設定」照 README「課前準備」縮寫；環境變數兩行照 README 指定的值。
 *
 * 終端機只放 npm run check 的 ③ 段（npm run report 印的四段跟它一樣），文字照實，
 * 欄位對齊改用固定寬度（原本是空白補齊）。
 *   Local（This computer）  實際輸出：2026-11-19 在講師這台 Mac 的範例專案跑 npm run check
 *                            （有 .env、沒有另外設環境變數，就是上課的狀態）。
 *   Local（已存環境）        實際輸出，但已存環境是用 shell 環境變數模擬的（同一天、同一個專案）：
 *                            DEMO_API_KEY=demo-not-a-real-key-1234 DEMO_ENV_LABEL=本機環境的環境變數 npm run check
 *                            畫面標「用 shell 環境變數模擬」；Desktop 的已存環境實際跑過之後再換掉這個標記。
 *   Cloud                    示意：照 collect.mjs 的 describe() 在 Cloud（CLAUDE_CODE_REMOTE=true、
 *                            沒有 .env、兩個變數來自 Cloud 環境）會印的字寫成，值是 README 指定的
 *                            DEMO_ENV_LABEL=雲端環境的環境變數、DEMO_API_KEY=demo-not-a-real-key-5678。
 *   echo 那一列三個分頁都是預期（README「預期結果對照表」），以實測為準。
 *
 * 查證（查核日 2026-11-19）：
 *   - Cloud session 會設定 CLAUDE_CODE_REMOTE=true（code.claude.com/docs/en/env-vars、cloud-environments）
 *   - Cloud 環境的變數是 .env 格式，Claude 跑的指令都讀得到（OTEL_* 除外）；同一個環境的人都讀得到
 *   - 已存的 Local 環境：只有從它開的新 session 拿得到變數（code.claude.com/docs/en/desktop）
 *   （排程任務、SSH 這些「拿來做什麼」的查證跟著用途搬到 demos-environments.tsx）
 *
 * ──────────────────────────────────────────────────────────────
 * 版面
 * ──────────────────────────────────────────────────────────────
 *   左 540：範例專案（路徑、檔案結構）→ 三句提示詞（可複製）
 *   右 1fr：三個分頁 → 這個環境要先設定 → ③ 的輸出 → echo 的預期
 *   跟 Local（This computer）不同的行：6px 不透明 acid 左粗條 ＋ acid/14 淡底（淡底不單獨承擔語意）。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動與鍵盤
 * ──────────────────────────────────────────────────────────────
 *   分頁是 tablist：←→（↑↓、Home、End）在分頁間移動，按鍵不往上傳，所以不會翻頁。
 *   複製按鈕只擋啟動鍵；滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著），之後照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid  選到的分頁、跟 This computer 不同的行（左粗條與淡底）
 *   「已複製」用中性的 bg-paper ＋ text-on-accent。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；根容器 720）
 * ──────────────────────────────────────────────────────────────
 *   720 ＝ 左：範例專案 ≈ 216 ＋ 16 ＋ 提示詞卡 flex-1（≈ 488；內容 ≈ 354）
 *          右：分頁 52 ＋ 12 ＋ 設定 92 ＋ 12 ＋ 終端機 flex-1（≈ 476；標頭 38 ＋ 最多 9 行 × 34 ＋ py 24 ＝ 368）
 *              ＋ 12 ＋ echo 64
 *   行寬：最長的是 This computer 的「在已存的 Local 環境填 DEMO_API_KEY=…」那一行，20px 約 1010px
 *   （終端機內寬約 1130）。
 *   任何互動都不改變外框高度；沒有容器會捲動。浮水印在舞台右上（x 1692–1872、y 104–147），
 *   根容器頂端約在舞台 y 184，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 vote-ui.tsx、demos-antigravity.tsx，不 import）──────── */

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

/* ── 複製 ─────────────────────────────────────────────────── */

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 沒有 clipboard 權限（例如非 https）就退回 execCommand */
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

/** 寬度固定，換字不會推動版面；2.4 秒後回到原本的字 */
function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <button
      type="button"
      onClick={(event) => {
        void copyText(text).then((ok) => setStatus(ok ? 'copied' : 'failed'));
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      aria-live="polite"
      title={status === 'failed' ? '瀏覽器擋下了複製，請手動選取文字' : undefined}
      className={`h-8 w-[112px] shrink-0 rounded-lg border text-[19px] transition-colors duration-200 ${FOCUS_RING} ${
        status === 'copied'
          ? 'border-paper bg-paper font-medium text-on-accent'
          : status === 'failed'
            ? 'border-error bg-panel text-error'
            : 'border-line bg-panel text-paper hover:border-paper'
      }`}
    >
      {status === 'copied' ? '已複製' : status === 'failed' ? '複製失敗' : '複製'}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 資料
 * ══════════════════════════════════════════════════════════════ */

/** 三句提示詞（照 README，一字不改） */
const PROMPTS: readonly { tag: string; text: string }[] = [
  { tag: '提示詞一', text: '你是否可以主動存取 Claude ENV？' },
  {
    tag: '提示詞二',
    text: '跑 npm run report，用三句話告訴我：你在哪個環境、看到的是哪個版本的程式碼、DEMO_ENV_LABEL 從哪裡來。',
  },
  { tag: '收尾', text: '幫我 echo $DEMO_API_KEY' },
];

/** 左欄的檔案結構（精簡；註解照 README 縮寫） */
const TREE: readonly { path: string; note?: string }[] = [
  { path: 'env-switch-demo/' },
  { path: '├── message.txt', note: '示範一：在本機改，不 commit' },
  { path: '├── .env.example', note: 'DEMO_ENV_LABEL=本機的 .env' },
  { path: '├── CLAUDE.md', note: '三句提示詞各怎麼回答' },
  { path: '└── scripts/', note: 'npm run check／report' },
];

type EnvId = 'local' | 'saved' | 'cloud';

interface SetupItem {
  text: string;
  code?: string;
}

interface EnvInfo {
  id: EnvId;
  name: string;
  /** 分頁上的小字 */
  sub: string;
  /** 終端機標頭右邊的小字與標記 */
  source: string;
  badge: string;
  setup: readonly SetupItem[];
  /** 環境變數（照 README 課前準備） */
  vars?: readonly string[];
  /** echo $DEMO_API_KEY 的預期結果 */
  echo: string;
  echoEmpty?: boolean;
}

const ENVS: readonly EnvInfo[] = [
  {
    id: 'local',
    name: 'Local',
    sub: 'This computer',
    source: '這台 Mac・2026-11-19',
    badge: '實際輸出',
    setup: [
      { text: '環境選擇器選 This computer' },
      { text: '資料夾選', code: 'env-switch-demo' },
      { text: '專案裡有', code: '.env' },
    ],
    echo: '（空的：沒有設定）',
    echoEmpty: true,
  },
  {
    id: 'saved',
    name: 'Local',
    sub: '已存環境',
    source: '這台 Mac・2026-11-19',
    badge: '用 shell 環境變數模擬',
    setup: [
      { text: 'New environment › Local' },
      { text: 'Environment variables 填兩行' },
      { text: '從它開新 session' },
    ],
    vars: ['DEMO_ENV_LABEL=本機環境的環境變數', 'DEMO_API_KEY=demo-not-a-real-key-1234'],
    echo: 'demo-not-a-real-key-1234',
  },
  {
    id: 'cloud',
    name: 'Cloud',
    sub: '雲端環境',
    source: '依範例程式的輸出規則寫的',
    badge: '示意',
    setup: [
      { text: '專案推上 GitHub' },
      { text: 'New environment › Cloud' },
      { text: 'Environment variables 填兩行' },
    ],
    vars: ['DEMO_ENV_LABEL=雲端環境的環境變數', 'DEMO_API_KEY=demo-not-a-real-key-5678'],
    echo: 'demo-not-a-real-key-5678',
  },
];

/* ── npm run check 的 ③ ─────────────────────────────────── */

type Row = { kind: 'kv'; label: string; value: string; diff?: boolean } | { kind: 'more'; text: string; diff?: boolean };

/** 實際輸出（2026-11-19，有 .env，沒有另外設環境變數） */
const LOCAL_ROWS: readonly Row[] = [
  { kind: 'kv', label: 'DEMO_ENV_LABEL', value: '本機的 .env' },
  { kind: 'kv', label: '來源', value: '專案的 .env（環境變數裡沒有）' },
  { kind: 'kv', label: 'DEMO_API_KEY', value: '沒有設定' },
  { kind: 'kv', label: '來源', value: '都沒有（環境變數沒有，專案的 .env 也沒有）' },
  { kind: 'more', text: '在已存的 Local 環境填 DEMO_API_KEY=…（假的值），再從它開新 session' },
  { kind: 'kv', label: 'CLAUDE_CODE_REMOTE', value: '沒有' },
  { kind: 'kv', label: '誰啟動的', value: 'npm run check，有 CLAUDECODE=1（Claude Code 啟動的）' },
];

/** 實際輸出，已存環境用 shell 環境變數模擬 */
const SAVED_ROWS: readonly Row[] = [
  { kind: 'kv', label: 'DEMO_ENV_LABEL', value: '本機環境的環境變數', diff: true },
  { kind: 'kv', label: '來源', value: '環境變數（啟動這個程序時就有）', diff: true },
  { kind: 'more', text: '專案的 .env 也寫了「本機的 .env」，但環境變數優先，這個值沒有用到', diff: true },
  { kind: 'kv', label: 'DEMO_API_KEY', value: '有設定（結尾 …1234，共 24 個字）', diff: true },
  { kind: 'kv', label: '來源', value: '環境變數（啟動這個程序時就有）', diff: true },
  { kind: 'more', text: '程式只回報有沒有設定，不印出值', diff: true },
  { kind: 'kv', label: 'CLAUDE_CODE_REMOTE', value: '沒有' },
  { kind: 'kv', label: '誰啟動的', value: 'npm run check，有 CLAUDECODE=1（Claude Code 啟動的）' },
];

/** 示意：Cloud（沒有 .env，兩個變數來自 Cloud 環境） */
const CLOUD_ROWS: readonly Row[] = [
  { kind: 'kv', label: 'DEMO_ENV_LABEL', value: '雲端環境的環境變數', diff: true },
  { kind: 'kv', label: '來源', value: '環境變數（啟動這個程序時就有）', diff: true },
  { kind: 'kv', label: 'DEMO_API_KEY', value: '有設定（結尾 …5678，共 24 個字）', diff: true },
  { kind: 'kv', label: '來源', value: '環境變數（啟動這個程序時就有）', diff: true },
  { kind: 'more', text: '程式只回報有沒有設定，不印出值', diff: true },
  { kind: 'kv', label: 'CLAUDE_CODE_REMOTE', value: '有（true）', diff: true },
  { kind: 'kv', label: '誰啟動的', value: 'npm run check，有 CLAUDECODE=1（Claude Code 啟動的）' },
];

const ROWS: Record<EnvId, readonly Row[]> = { local: LOCAL_ROWS, saved: SAVED_ROWS, cloud: CLOUD_ROWS };

/* ══════════════════════════════════════════════════════════════
 * 版面零件
 * ══════════════════════════════════════════════════════════════ */

/** 一行輸出：跟 This computer 不同的行是 6px 不透明左粗條 ＋ 淡底。
 * 不在行內放 sr-only 的「不同」：sr-only 的 1px 框會被稽核腳本當成溢出，
 * 改把不同的行數寫進 Terminal 的 aria-label。 */
function TermRow({ row }: { row: Row }) {
  return (
    <div
      className={`flex h-[34px] min-w-0 items-center border-l-[6px] pr-5 pl-[14px] whitespace-nowrap ${
        row.diff ? 'border-l-acid bg-acid/14' : 'border-l-transparent'
      }`}
    >
      {row.kind === 'kv' ? (
        <>
          <span className="w-[24ch] shrink-0 pl-[3ch] text-faint">{row.label}</span>
          <span className="text-paper">{row.value}</span>
        </>
      ) : (
        <span className="pl-[24ch] text-muted">{row.text}</span>
      )}
    </div>
  );
}

function Badge({ env }: { env: EnvInfo }) {
  return (
    <span
      className="rounded-md border-2 border-paper px-2 text-[19px] leading-[22px] font-semibold whitespace-nowrap text-paper"
    >
      {env.badge}
    </span>
  );
}

function Terminal({ env, rows }: { env: EnvInfo; rows: readonly Row[] }) {
  const diffCount = rows.filter((row) => row.diff).length;
  return (
    <div
      role="region"
      aria-label={`${env.name}（${env.sub}）的 npm run check ③ 段（${env.badge}${diffCount ? `；左側有粗條的 ${diffCount} 行跟 This computer 不同` : ''}）`}
      className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-ink-soft py-3 font-mono text-[20px] leading-[34px]"
    >
      <div className="flex h-[38px] items-center gap-3 border-l-[6px] border-l-transparent pr-5 pl-[14px] whitespace-nowrap">
        <span className="text-faint">$</span>
        <span className="font-semibold text-paper">npm run check</span>
        <span className="font-sans text-[19px] text-muted">只看 ③（report 印的一樣）</span>
        <span className="ml-auto flex items-center gap-3 font-sans">
          <span className="text-[19px] text-muted">{env.source}</span>
          <Badge env={env} />
        </span>
      </div>
      <div className="flex h-[34px] items-center border-l-[6px] border-l-transparent pl-[14px] font-semibold text-paper">
        ③ 環境變數
      </div>
      {rows.map((row, index) => (
        <TermRow key={index} row={row} />
      ))}
    </div>
  );
}

function SetupChip({ no, children }: { no: number; children: ReactNode }) {
  return (
    <span className="inline-flex h-[36px] shrink-0 items-center gap-2 rounded-lg border border-line-soft bg-panel-lift px-3 text-[19px] whitespace-nowrap text-paper">
      <span className="font-mono text-[19px] text-faint">{no}</span>
      {children}
    </span>
  );
}

function SetupBar({ env }: { env: EnvInfo }) {
  return (
    <div className="grid h-[92px] shrink-0 grid-cols-[100px_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-line bg-panel px-5">
      <span className={`${LABEL} leading-snug`}>
        要先設定
      </span>
      <div className="flex min-w-0 flex-col justify-center gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {env.setup.map((item, index) => (
            <SetupChip key={item.text} no={index + 1}>
              <span>{item.text}</span>
              {item.code && <code className="font-mono text-[19px]">{item.code}</code>}
            </SetupChip>
          ))}
        </div>
        {env.vars ? (
          <div className="flex min-w-0 items-center gap-5 font-mono text-[19px] whitespace-nowrap text-paper">
            {env.vars.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        ) : (
          <div className="text-[19px] whitespace-nowrap text-muted">
            <span className="font-mono">.env</span> 裡是 <span className="font-mono">DEMO_ENV_LABEL=本機的 .env</span>，沒有另外設環境變數
          </div>
        )}
      </div>
    </div>
  );
}

function EchoRow({ env }: { env: EnvInfo }) {
  return (
    <div className="flex h-[64px] shrink-0 items-center gap-4 rounded-2xl border border-line bg-panel px-5">
      <span className={`${LABEL} shrink-0`}>收尾</span>
      <span className="shrink-0 font-mono text-[19px] text-muted">$ echo "$DEMO_API_KEY"</span>
      <span aria-hidden="true" className="text-[21px] text-faint">
        →
      </span>
      <span
        className={`min-w-0 flex-1 truncate font-mono text-[21px] ${env.echoEmpty ? 'text-muted' : 'font-semibold text-acid'}`}
      >
        {env.echo}
      </span>
      <span className="inline-flex h-8 shrink-0 items-center rounded-md border-2 border-line px-2.5 text-[19px] text-muted">
        預期，以實測為準
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 34 頁 EnvironmentsTryDemo — 同一個專案，Local 和 Cloud 各跑一次
 * ══════════════════════════════════════════════════════════════ */

export function EnvironmentsTryDemo() {
  const [envId, setEnvId] = useState<EnvId>('local');
  const baseId = useId();

  const env = ENVS.find((item) => item.id === envId) ?? ENVS[0];
  const rows = ROWS[envId];
  const diffCount = rows.filter((row) => row.diff).length;
  const panelId = `${baseId}-panel`;

  /** tablist：←→↑↓、Home、End 在分頁間移動；所有按鍵都不往上傳（不翻頁） */
  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    event.stopPropagation();
    const index = ENVS.findIndex((item) => item.id === envId);
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % ENVS.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + ENVS.length - 1) % ENVS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ENVS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    setEnvId(ENVS[next].id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-[540px_minmax(0,1fr)] gap-8">
        {/* ── 左：範例專案與三句提示詞 ───────────────────── */}
        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <section className="flex shrink-0 flex-col">
            <div className="flex h-7 items-center justify-between gap-4">
              <span className={LABEL}>範例專案</span>
              <span className="text-[19px] text-muted">Node 18 以上・零相依</span>
            </div>
            <p className="mt-1.5 font-mono text-[23px] leading-[30px] font-semibold text-paper">
              第五堂/Claude/env-switch-demo
            </p>
            <div
              role="group"
              aria-label="檔案結構"
              className="mt-2.5 rounded-xl border border-line bg-ink-soft px-5 py-2 text-[19px] leading-[26px]"
            >
              {TREE.map((entry) => (
                <div key={entry.path} className="grid grid-cols-[196px_minmax(0,1fr)] gap-3 whitespace-nowrap">
                  <span className="font-mono whitespace-pre text-paper">{entry.path}</span>
                  <span className="truncate text-muted">{entry.note}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col justify-center gap-3 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel px-6 py-3">
            <span className={LABEL}>三句提示詞（依序送）</span>
            {PROMPTS.map((prompt) => (
              <div key={prompt.tag} className="flex flex-col gap-1">
                <div className="flex h-8 items-center justify-between gap-4">
                  <span className="text-[19px] font-semibold text-acid">{prompt.tag}</span>
                  <CopyButton text={prompt.text} />
                </div>
                <p className="text-[23px] leading-[32px] text-paper">{prompt.text}</p>
              </div>
            ))}
          </section>
        </div>

        {/* ── 右：三個分頁 ───────────────────────────────── */}
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="flex h-[52px] shrink-0 items-center gap-4">
            <div role="tablist" aria-label="切換環境" onKeyDown={onTabKey} className="flex h-full items-center gap-2.5">
              {ENVS.map((item) => {
                const on = item.id === envId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${item.id}`}
                    aria-selected={on}
                    aria-controls={panelId}
                    tabIndex={on ? 0 : -1}
                    onClick={(event) => {
                      setEnvId(item.id);
                      blurAfterClick(event);
                    }}
                    className={`flex h-full items-center gap-3 rounded-xl border-2 px-5 whitespace-nowrap transition-colors duration-200 ${FOCUS_RING} ${
                      on ? 'border-acid bg-acid text-on-accent' : 'border-line bg-panel text-paper hover:border-acid'
                    }`}
                  >
                    <span className="font-mono text-[24px] leading-none font-semibold">{item.name}</span>
                    <span className={`text-[19px] ${on ? 'text-on-accent' : 'text-muted'}`}>{item.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* 圖例 */}
            <span className="ml-auto flex shrink-0 items-center gap-3 text-[19px] whitespace-nowrap" aria-live="polite">
              {diffCount === 0 ? (
                <span className="text-muted">This computer 是對照的基準</span>
              ) : (
                <>
                  <span aria-hidden="true" className="h-[26px] w-[6px] shrink-0 bg-acid" />
                  <span className="text-paper">
                    跟 This computer 不同：<span className="font-semibold tabular-nums">{diffCount}</span> 行
                  </span>
                </>
              )}
            </span>
          </div>

          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${baseId}-tab-${envId}`}
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            <SetupBar env={env} />
            <Terminal env={env} rows={rows} />
            <EchoRow env={env} />
          </div>
        </div>
      </div>
    </div>
  );
}
