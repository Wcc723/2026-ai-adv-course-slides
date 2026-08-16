import { useEffect, useState, type ReactNode } from 'react';

/* ════════════════════════════════════════════════════════════
 * 第三堂課 · 一、專案管理（04–06）
 *
 * 三支元件共用同一組視覺語言：
 * - 左＝目前的專案（前端）／右＝外部資源（後端），中間一條 AI session 邊界
 * - 每一頁最多兩個強調色。05 是「一個狀態一個強調色」，06 是 teal（契約）＋ blue（畫面）
 * - 任何帶語意的淡色填色都再配一條不透明的 6px 左粗條，投影機吃不掉
 * ════════════════════════════════════════════════════════════ */

/* ── 共用小零件 ───────────────────────────────────────────── */

interface FileChip {
  name: string;
  note: string;
}

/** 資料夾／檔案卡：淺色底板放在有色卡片上，文字對比才不依賴透明度 */
function FileCard({ name, note }: FileChip) {
  return (
    <div className="rounded-lg border border-line-soft bg-panel px-4 py-2">
      <p className="font-mono text-[20px] text-paper">{name}</p>
      <p className="mt-0.5 text-[17px] text-muted">{note}</p>
    </div>
  );
}

/** Context 佔用長條：已用量是不透明實心色塊，不靠淡色填滿 */
function ContextBar({
  percent,
  fillClass,
}: {
  percent: number;
  fillClass: string;
}) {
  return (
    <div className="h-[20px] flex-1 rounded-full border border-line bg-panel p-[3px]">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${fillClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** 左右兩個專案共用的外框 */
function ProjectPanel({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-ink-soft p-5">
      <header className="shrink-0">
        <p className="font-display text-[17px] tracking-[0.16em] text-faint uppercase">
          {role}
        </p>
        <p className="mt-1 font-mono text-[24px] text-paper">{name}</p>
      </header>
      {children}
    </section>
  );
}

type BoundaryLink = 'blocked' | 'flooded' | 'granted';

/** 越界箭頭：右（後端）指向左（前端） */
function BoundaryArrow({ y, color }: { y: number; color: string }) {
  return (
    <g>
      <line
        x1={186}
        y1={y}
        x2={40}
        y2={y}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <polygon points={`18,${y} 42,${y - 10} 42,${y + 10}`} fill={color} />
    </g>
  );
}

/**
 * AI session 邊界。
 * 預設是一條灰色虛線（讀不到對面）；放行之後變成 teal 實線＋實線箭頭。
 * 文字全部走 DOM，SVG 內不放 <text>，免去 SVG 文字的對比風險。
 */
function BoundaryColumn({
  height,
  link,
  note,
}: {
  height: number;
  link: BoundaryLink;
  note: string;
}) {
  const granted = link === 'granted';

  return (
    <div className="relative flex w-[200px] shrink-0 flex-col items-center">
      <svg
        className="absolute inset-0"
        width={200}
        height={height}
        viewBox={`0 0 200 ${height}`}
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1={100}
          y1={0}
          x2={100}
          y2={height}
          stroke={granted ? 'var(--color-teal)' : 'var(--color-line)'}
          strokeWidth={granted ? 4 : 3}
          strokeDasharray={granted ? undefined : '12 10'}
        />
        {granted && (
          <BoundaryArrow y={Math.round(height * 0.62)} color="var(--color-teal)" />
        )}
        {link === 'flooded' &&
          [0.4, 0.56, 0.72].map((ratio) => (
            <BoundaryArrow
              key={ratio}
              y={Math.round(height * ratio)}
              color="var(--color-coral)"
            />
          ))}
      </svg>

      {/* 不透明底板：把虛線切斷，同時避免文字疊在線上 */}
      <div className="relative mt-2 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-center">
        <p className="text-[18px] leading-snug text-paper">AI session 邊界</p>
        <p className="mt-1 text-[16px] leading-snug text-muted">{note}</p>
      </div>
    </div>
  );
}

const unselectedButton =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';

/* ════════════════════════════════════════════════════════════
 * 04 why-split — 為什麼要拆專案
 * 強調色：coral（單一大 repo 的問題）／teal（拆開之後）
 * ════════════════════════════════════════════════════════════ */

type SplitMode = 'mono' | 'split';

interface SplitOption {
  id: SplitMode;
  label: string;
  selectedClass: string;
}

const splitOptions: SplitOption[] = [
  { id: 'mono', label: '全部塞給 AI', selectedClass: 'border-coral bg-coral text-on-accent' },
  { id: 'split', label: '拆成多專案', selectedClass: 'border-teal bg-teal text-on-accent' },
];

/** 八個資料夾合計 187 檔，對應下方的 context 讀數 */
const monoFolders: FileChip[] = [
  { name: 'frontend/', note: '42 檔' },
  { name: 'backend/', note: '38 檔' },
  { name: 'legacy/', note: '34 檔' },
  { name: 'docs/', note: '21 檔' },
  { name: 'mobile/', note: '19 檔' },
  { name: 'design/', note: '17 檔' },
  { name: 'scripts/', note: '9 檔' },
  { name: 'infra/', note: '7 檔' },
];

/** 掛載中的前端合計 11 檔，加上 openapi.json 就是 12 檔 */
const mountedFolders: FileChip[] = [
  { name: 'src/pages/', note: '5 檔' },
  { name: 'src/components/', note: '4 檔' },
  { name: 'src/api/', note: '1 檔' },
  { name: 'package.json', note: '1 檔' },
];

interface ContextReading {
  percent: number;
  files: string;
  fillClass: string;
  textClass: string;
}

const splitContext: Record<SplitMode, ContextReading> = {
  mono: {
    percent: 92,
    files: 'AI 讀進 187 個檔案',
    fillClass: 'bg-coral',
    textClass: 'text-coral',
  },
  split: {
    percent: 18,
    files: 'AI 讀進 12 個檔案',
    fillClass: 'bg-teal',
    textClass: 'text-teal',
  },
};

function MonoRepoBoard() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-l-[6px] border-coral/55 border-l-coral bg-coral/14 p-6">
      <div className="flex shrink-0 items-center gap-4">
        <span className="font-mono text-[24px] text-paper">my-monorepo/</span>
        <span className="rounded-full bg-coral px-3 py-1 text-[17px] text-on-accent">
          AI session 開在最外層
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 content-start gap-3">
        {monoFolders.map((folder) => (
          <FileCard key={folder.name} {...folder} />
        ))}
      </div>

      <p className="mt-auto shrink-0 text-[19px] text-paper">
        八個資料夾一起進 context：AI 每回答一次，都要先掃過整個 repo。
      </p>
    </div>
  );
}

function SplitRepoBoard() {
  return (
    <div className="grid h-full grid-cols-[3fr_2fr] gap-6">
      <div className="flex h-full flex-col rounded-2xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 p-6">
        <div className="flex shrink-0 items-center gap-4">
          <span className="font-mono text-[24px] text-paper">frontend/</span>
          <span className="rounded-full bg-teal px-3 py-1 text-[17px] text-on-accent">
            掛載中
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 content-start gap-3">
          {mountedFolders.map((folder) => (
            <FileCard key={folder.name} {...folder} />
          ))}
        </div>

        <p className="mt-auto shrink-0 text-[19px] text-paper">
          這一份才是這次要動的程式碼。
        </p>
      </div>

      <div className="flex h-full flex-col rounded-2xl border border-line bg-ink-soft p-6">
        <div className="flex shrink-0 items-center gap-4">
          <span className="font-mono text-[24px] text-paper">backend/</span>
          <span className="rounded-full border border-line px-3 py-1 text-[17px] text-muted">
            未掛載
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-4 py-2.5">
          <p className="font-mono text-[20px] text-paper">openapi.json</p>
          <p className="mt-0.5 text-[17px] text-paper">唯一被讀進來的檔案</p>
        </div>

        <p className="mt-auto shrink-0 text-[19px] text-muted">
          backend/ 其餘 37 個檔案留在原地，AI 完全看不到。
        </p>
      </div>
    </div>
  );
}

export function WhySplitDemo() {
  const [mode, setMode] = useState<SplitMode>('mono');
  const reading = splitContext[mode];

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-5">
      <div className="flex shrink-0 justify-center gap-3">
        {splitOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`rounded-lg border px-7 py-2.5 text-[20px] transition-colors ${
              mode === option.id ? option.selectedClass : unselectedButton
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 固定高度：兩種模式切換時版面不會跳動 */}
      <div className="h-[330px] shrink-0">
        {mode === 'mono' ? <MonoRepoBoard /> : <SplitRepoBoard />}
      </div>

      <div className="shrink-0 rounded-2xl border border-line bg-ink-soft px-6 py-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[18px] tracking-[0.16em] text-faint uppercase">
            Context Window 佔用
          </span>
          <span className="text-[19px] text-muted">{reading.files}</span>
        </div>
        <div className="mt-3 flex items-center gap-5">
          <ContextBar percent={reading.percent} fillClass={reading.fillClass} />
          <span
            className={`font-display text-[30px] font-semibold tabular-nums ${reading.textClass}`}
          >
            {reading.percent}%
          </span>
        </div>
      </div>

      <p className="shrink-0 text-center text-[22px] text-paper">
        拆專案不是為了好看，是為了讓 AI 每次只吃必要的東西。
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 05 cross-problem — 跨專案的問題
 * 一個狀態一個強調色：error（猜錯）／coral（吃光）／teal（只給契約）
 * ════════════════════════════════════════════════════════════ */

type ShareMode = 'none' | 'all' | 'minimal';

type ShareDetail =
  | { kind: 'text'; text: string }
  | { kind: 'paths'; paths: string[] };

interface ShareConfig {
  id: ShareMode;
  label: string;
  /** 選中態：實心色塊 + 挖空字 */
  selectedClass: string;
  /** 淡色卡片：底色 /14 + 邊框 /55 + 不透明左粗條 */
  cardClass: string;
  barFill: string;
  barText: string;
  link: BoundaryLink;
  boundaryNote: string;
  /** 右側哪些檔案亮起來 */
  litFiles: 'none' | 'contract' | 'all';
  rightStatus: string;
  cardTitle: string;
  cardCode: string;
  cardNote: string;
  contextPercent: number;
  contextNote: string;
  explain: string;
  detail: ShareDetail;
}

const shareConfigs: ShareConfig[] = [
  {
    id: 'none',
    label: '什麼都不給',
    selectedClass: 'border-error bg-error text-on-accent',
    cardClass: 'border-error/55 border-l-error bg-error/14',
    barFill: 'bg-error',
    barText: 'text-error',
    link: 'blocked',
    boundaryNote: '預設讀不到對面',
    litFiles: 'none',
    rightStatus: 'session 邊界外 · 0 個檔案被讀取',
    cardTitle: 'AI 猜出來的欄位',
    cardCode: 'product.productName',
    cardNote: '契約寫的是 title，畫面永遠拿到 undefined。',
    contextPercent: 8,
    contextNote: '0 個後端檔案進入 context',
    explain: 'AI 讀不到 backend/，只能照命名習慣猜欄位。',
    detail: {
      kind: 'text',
      text: '省下來的 context，換成跑起來才發現的錯誤。',
    },
  },
  {
    id: 'all',
    label: '整包丟進去',
    selectedClass: 'border-coral bg-coral text-on-accent',
    cardClass: 'border-coral/55 border-l-coral bg-coral/14',
    barFill: 'bg-coral',
    barText: 'text-coral',
    link: 'flooded',
    boundaryNote: '176 個檔案全部越界',
    litFiles: 'all',
    rightStatus: '整包掛載 · 176 個檔案被讀取',
    cardTitle: '欄位對了，代價在別的地方',
    cardCode: 'product.title',
    cardNote: 'controllers、models、tests 一起擠進同一個 session。',
    contextPercent: 94,
    contextNote: '176 個檔案進入 context',
    explain: '上下文被無關檔案吃光，前面交代過的規則開始被壓縮掉。',
    detail: {
      kind: 'text',
      text: '愈到後面愈常出現「剛剛不是說過了」的回答。',
    },
  },
  {
    id: 'minimal',
    label: '只給必要檔案',
    selectedClass: 'border-teal bg-teal text-on-accent',
    cardClass: 'border-teal/55 border-l-teal bg-teal/14',
    barFill: 'bg-teal',
    barText: 'text-teal',
    link: 'granted',
    boundaryNote: '只放行 openapi.json',
    litFiles: 'contract',
    rightStatus: '指定掛載 · 1 個檔案被讀取',
    cardTitle: '欄位對上契約',
    cardCode: 'product.title',
    cardNote: '型別、必填與狀態碼都照 openapi.json 走。',
    contextPercent: 22,
    contextNote: '1 個檔案：openapi.json',
    explain: '只放行一份契約檔，AI 拿到欄位、型別與狀態碼就夠了。',
    detail: {
      kind: 'paths',
      paths: [
        'settings.json → "additionalDirectories": ["../backend"]',
        '@../backend/openapi.json',
      ],
    },
  },
];

const frontendFiles: FileChip[] = [
  { name: 'src/pages/ProductList.tsx', note: '商品列表' },
  { name: 'src/api/client.ts', note: '呼叫後端' },
  { name: 'src/types/product.ts', note: '欄位型別' },
];

interface BackendFile {
  name: string;
  note: string;
  contract: boolean;
}

/** 非契約檔合計 175 檔，加上 openapi.json 就是 176 檔 */
const backendFiles: BackendFile[] = [
  { name: 'openapi.json', note: '路徑 / 欄位 / 型別', contract: true },
  { name: 'src/controllers/', note: '38 檔', contract: false },
  { name: 'src/models/', note: '26 檔', contract: false },
  { name: 'src/services/', note: '31 檔', contract: false },
  { name: 'tests/', note: '80 檔', contract: false },
];

/** 亮起＝實心左粗條的有色卡片；沒亮＝虛線空框，不用透明度硬撐 */
function BackendRow({
  file,
  lit,
  litClass,
}: {
  file: BackendFile;
  lit: boolean;
  litClass: string;
}) {
  if (!lit) {
    return (
      <div className="flex h-[41px] items-center justify-between rounded-lg border border-dashed border-line-soft px-4">
        <span className="font-mono text-[19px] text-faint">{file.name}</span>
        <span className="text-[17px] text-faint">{file.note}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[41px] items-center justify-between rounded-lg border border-l-[6px] px-4 ${litClass}`}
    >
      <span className="font-mono text-[19px] text-paper">{file.name}</span>
      <span className="text-[17px] text-paper">{file.note}</span>
    </div>
  );
}

export function CrossProjectDemo() {
  const [mode, setMode] = useState<ShareMode>('none');
  const config = shareConfigs.find((item) => item.id === mode) ?? shareConfigs[0];

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex shrink-0 justify-center gap-3">
        {shareConfigs.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`rounded-lg border px-7 py-2.5 text-[20px] transition-colors ${
              mode === option.id ? option.selectedClass : unselectedButton
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex h-[400px] shrink-0 gap-6">
        <ProjectPanel role="目前的專案" name="frontend/">
          <div className="mt-3 grid content-start gap-2">
            {frontendFiles.map((file) => (
              <div
                key={file.name}
                className="flex h-[41px] items-center justify-between rounded-lg border border-line-soft bg-panel px-4"
              >
                <span className="font-mono text-[19px] text-paper">
                  {file.name}
                </span>
                <span className="text-[17px] text-muted">{file.note}</span>
              </div>
            ))}
          </div>

          <div
            className={`mt-auto rounded-xl border border-l-[6px] px-4 py-3 ${config.cardClass}`}
          >
            <p className="text-[19px] text-paper">{config.cardTitle}</p>
            <p className="mt-1 font-mono text-[20px] text-paper">
              {config.cardCode}
            </p>
            <p className="mt-1 text-[17px] text-paper">{config.cardNote}</p>
          </div>
        </ProjectPanel>

        <BoundaryColumn
          height={400}
          link={config.link}
          note={config.boundaryNote}
        />

        <ProjectPanel role="想引入的外部資源" name="backend/">
          <div className="mt-3 grid content-start gap-2">
            {backendFiles.map((file) => (
              <BackendRow
                key={file.name}
                file={file}
                lit={
                  config.litFiles === 'all' ||
                  (config.litFiles === 'contract' && file.contract)
                }
                litClass={config.cardClass}
              />
            ))}
          </div>

          <p className="mt-auto shrink-0 text-[18px] text-muted">
            {config.rightStatus}
          </p>
        </ProjectPanel>
      </div>

      <div className="flex h-[132px] shrink-0 gap-6">
        <div
          className={`flex min-w-0 flex-1 flex-col justify-center rounded-2xl border border-l-[6px] px-6 ${config.cardClass}`}
        >
          <p className="text-[21px] text-paper">{config.explain}</p>
          {config.detail.kind === 'paths' ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {config.detail.paths.map((path) => (
                <span
                  key={path}
                  className="rounded-md border border-line-soft bg-panel px-3 py-1.5 font-mono text-[18px] text-paper"
                >
                  {path}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[19px] text-paper">{config.detail.text}</p>
          )}
        </div>

        <div className="flex w-[360px] shrink-0 flex-col justify-center rounded-2xl border border-line bg-ink-soft px-5">
          <span className="font-display text-[17px] tracking-[0.16em] text-faint uppercase">
            Context 佔用
          </span>
          <div className="mt-2 flex items-center gap-4">
            <ContextBar
              percent={config.contextPercent}
              fillClass={config.barFill}
            />
            <span
              className={`font-display text-[26px] font-semibold tabular-nums ${config.barText}`}
            >
              {config.contextPercent}%
            </span>
          </div>
          <p className="mt-2 text-[17px] text-muted">{config.contextNote}</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 06 openapi-bridge — 用 openapi.json 把前端接起來
 * 強調色：teal（契約與 API）／blue（長出來的前端畫面）
 *
 * 逐步推進用 setTimeout + state，沒有動畫函式庫；
 * 還沒長出來的位置放同高的虛線空框，版面不會跳動。
 * ════════════════════════════════════════════════════════════ */

interface ApiEndpoint {
  method: string;
  path: string;
}

const apiEndpoints: ApiEndpoint[] = [
  { method: 'GET', path: '/api/products' },
  { method: 'POST', path: '/api/coupons' },
  { method: 'GET', path: '/api/admin/orders' },
  { method: 'POST', path: '/api/orders' },
];

interface ScreenCard {
  title: string;
  from: string;
}

const screenCards: ScreenCard[] = [
  { title: '商品列表', from: 'GET /api/products' },
  { title: '優惠券輸入', from: 'POST /api/coupons' },
  { title: '後台訂單', from: 'GET /api/admin/orders' },
  { title: '結帳流程', from: 'POST /api/orders' },
];

/** 0 待機｜1 讀到契約檔｜2–5 展開 API｜6–9 長出畫面｜10 結論 */
const BRIDGE_STEPS = 10;
const BRIDGE_INTERVAL = 520;

function bridgeStatus(progress: number): string {
  if (progress === 0) return '按下按鈕，看一份契約檔怎麼變成前端畫面';
  if (progress <= 5) return '正在讀取契約，展開 API 清單';
  if (progress < BRIDGE_STEPS) return '正在依契約長出對應的前端畫面';
  return '完成：4 個端點 → 4 個畫面';
}

export function OpenApiBridgeDemo() {
  // 只用一個 state：進度自己決定還在不在跑，不必額外維護 running 旗標
  const [progress, setProgress] = useState(0);
  const running = progress > 0 && progress < BRIDGE_STEPS;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setProgress((value) => value + 1),
      BRIDGE_INTERVAL,
    );
    return () => clearTimeout(timer);
  }, [running, progress]);

  const contractRead = progress >= 1;
  const done = progress >= BRIDGE_STEPS;

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      <div className="flex shrink-0 items-center gap-3">
        {/*
          執行中改成淡底，這裡沒有配 6px 左粗條：按鈕的狀態是靠標籤文字
          （讀取中…／讀取 @../…）在講，填色不是唯一的訊號，投影機吃掉也還讀得懂。
        */}
        <button
          type="button"
          onClick={() => setProgress(1)}
          className={`rounded-lg border px-7 py-2.5 font-mono text-[19px] transition-all ${
            running
              ? 'border-teal/55 bg-teal/14 text-paper'
              : 'border-teal bg-teal text-on-accent hover:-translate-y-0.5'
          }`}
        >
          {running ? '讀取中…' : '讀取 @../backend/openapi.json'}
        </button>

        <button
          type="button"
          onClick={() => setProgress(0)}
          className={`rounded-lg border px-6 py-2.5 text-[19px] transition-colors ${unselectedButton}`}
        >
          重置
        </button>

        <p className="ml-auto text-[19px] text-muted">
          {bridgeStatus(progress)}
        </p>
      </div>

      <div className="flex h-[400px] shrink-0 gap-6">
        <ProjectPanel role="目前的專案" name="frontend/">
          <div className="mt-3 grid content-start gap-2">
            {screenCards.map((screen, index) =>
              progress >= index + 6 ? (
                <div
                  key={screen.title}
                  className="flex h-[62px] flex-col justify-center rounded-lg border border-l-[6px] border-blue/55 border-l-blue bg-blue/14 px-4"
                >
                  <p className="text-[20px] text-paper">{screen.title}</p>
                  <p className="mt-0.5 font-mono text-[16px] text-paper">
                    ← {screen.from}
                  </p>
                </div>
              ) : (
                <div
                  key={screen.title}
                  className="h-[62px] rounded-lg border border-dashed border-line-soft"
                />
              ),
            )}
          </div>
        </ProjectPanel>

        <BoundaryColumn
          height={400}
          link={contractRead ? 'granted' : 'blocked'}
          note={contractRead ? '契約檔已放行' : '預設讀不到對面'}
        />

        <ProjectPanel role="外部資源" name="backend/">
          <div className="mt-3">
            {contractRead ? (
              <div className="flex h-[46px] items-center justify-between rounded-lg border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-4">
                <span className="font-mono text-[19px] text-paper">
                  openapi.json
                </span>
                <span className="text-[17px] text-paper">已讀取</span>
              </div>
            ) : (
              <div className="flex h-[46px] items-center rounded-lg border border-dashed border-line-soft px-4">
                <span className="font-mono text-[19px] text-faint">
                  openapi.json
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 grid content-start gap-2">
            {apiEndpoints.map((endpoint, index) =>
              progress >= index + 2 ? (
                <div
                  key={endpoint.path + endpoint.method}
                  className="flex h-[46px] items-center gap-3 rounded-lg border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-4"
                >
                  <span className="rounded bg-teal px-2 py-0.5 font-mono text-[16px] text-on-accent">
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-[19px] text-paper">
                    {endpoint.path}
                  </span>
                </div>
              ) : (
                <div
                  key={endpoint.path + endpoint.method}
                  className="h-[46px] rounded-lg border border-dashed border-line-soft"
                />
              ),
            )}
          </div>
        </ProjectPanel>
      </div>

      {done ? (
        <div className="flex h-[56px] shrink-0 items-center rounded-xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-5">
          <p className="text-[21px] text-paper">
            前端專案沒有後端程式碼，只靠一份契約檔就能把畫面做出來。
          </p>
        </div>
      ) : (
        <div className="h-[56px] shrink-0 rounded-xl border border-dashed border-line-soft" />
      )}

      {/* 標點前不能留空白，所以空白用 {' '} 明寫，不靠 JSX 的換行推斷 */}
      <p className="shrink-0 text-center text-[19px] text-muted">
        給開發者操作的是{' '}
        <span className="font-mono text-paper">Postman</span>
        ，給 AI 讀的是{' '}
        <span className="font-mono text-paper">openapi.json</span>
        。
      </p>
    </div>
  );
}
