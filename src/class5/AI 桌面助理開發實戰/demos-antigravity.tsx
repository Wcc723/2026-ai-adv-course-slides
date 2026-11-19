import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';
import appShotUrl from './images/antigravity-app.webp';
import visualShotUrl from './images/antigravity-visual.webp';
import gameShotUrl from './images/antigravity-game.webp';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 小章節：Google Antigravity
 *
 *   第 37 頁  AntigravityDemo          Google Antigravity（withVote → 根容器 640）
 *   第 39 頁  AntigravityExamplesDemo  Antigravity 實例：互動式視覺化與遊戲（沒有投票 → 720）
 *   （第 36 頁的小章節封面 AntigravityCover 在 demos-intro.tsx，跟其他章節頁共用 PartCover；
 *     第 38 頁的比較表 GeminiCompareDemo 在 demos-gemini-compare.tsx）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：講師的 CODD 筆記「簡報調整」（codd://note/note-xcra，2026-11-10 17:17）
 *           「新增小章節：Google Antigravity」一節
 * ──────────────────────────────────────────────────────────────
 * - 定位：筆記原文是「原本是製作成 IDE 的模式，現在新的版本也製作成類似 Jupyter
 *   或者是 Claude 的桌面版應用程式」。判斷「Jupyter」是語音輸入把「ChatGPT」聽錯了
 *   （上下文都在比 ChatGPT 與 Claude 的桌面版），頁面寫成「類似 ChatGPT、Claude
 *   桌面版的應用程式」。講師若原意真的是 Jupyter，改 AntigravityDemo 的副標即可。
 * - 2026-11-18 改標題與副標（CODD 筆記「簡報調整」codd://note/note-plus：
 *   「它的 IDE 還是存在，不過它現在又多出類似 ChatGPT 或 Claude 的桌面版應用程式」）。
 *   舊的「從 IDE 長成桌面版 App」跟官方說法衝突（查核日 2026-11-18）：
 *     https://antigravity.google/blog/introducing-google-antigravity-2
 *       2026-05-19 的 Antigravity 2.0「is a new, standalone desktop application」，
 *       原本的編輯器沒有被取代、繼續提供；
 *     https://codelabs.developers.google.com/getting-started-agy-ide?hl=en
 *       產品線分成 Antigravity（App）、Antigravity IDE、Antigravity CLI、Antigravity SDK
 *       → 副標的「改名 Antigravity IDE 繼續提供」。
 *   其餘句子（獨家、也有、缺點）是講師體感，沒有改。
 * - 特色三塊（獨家／別家有的它大多也有／缺點）照筆記，是講師的使用心得，
 *   頁面標「講師體感」，沒有另外查官方文件。
 * - 三張截圖（images/antigravity-*.webp）是講師筆記裡的圖，縮到 1800 寬轉 WebP：
 *     antigravity-app.webp     桌面版畫面（Open IDE、Gemini 4 Argon High、Auto）
 *     antigravity-visual.webp  互動式視覺化：皇家競技場 3D 架構探索器
 *     antigravity-game.webp    做出來的遊戲，開在 Antigravity 內建的瀏覽器裡
 * - 第 39 頁的提示詞照 antigravity-app.webp 截圖裡的原文。截圖開頭有一個「Gemini」
 *   的檔案標籤（看起來是用 @ 帶入的資料夾），不是提示詞的文字，所以沒有放進來。
 *   「開工前先問的 3 個問題」與選的答案也照同一張截圖，答案只留重點。
 * - 第 39 頁右欄的說明（三個分頁、看得到的模組、內建瀏覽器）是照截圖畫面寫的，
 *   不是講師的原話。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 第 37 頁  右欄有 ◎ 的項目可以點，左邊截圖用框標出它在畫面上的位置
 *           （開啟 IDE、換模型、Automations、語音）。一進頁面標「開啟 IDE」。
 *           講師 2026-11-17 要求拿掉缺點底下的「例如 Auto Mode 還是一直跳出來要求權限」，
 *           連同它在截圖上的 Auto Mode 標示框一起移除。
 *           框的座標是對原圖 2576 × 1839 量的百分比（SPOTS），圖片盒子鎖同樣的比例，
 *           所以框不會因為 object-contain 的留白而偏掉。
 * 第 39 頁  分頁切換兩個實例（照筆記的順序：互動式視覺化 → 遊戲）；遊戲的提示詞可以複製。
 * 鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點，
 *       之後按方向鍵、空白鍵照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   blue   獨家
 *   teal   別家有的它大多也有、互動式視覺化
 *   coral  缺點
 *   acid   選中的項目、截圖上的標示框（框外再描一圈 on-accent，深色截圖上才看得到）
 *   區塊都是 bg-panel ＋ 6px 不透明左粗條，沒有靠淡色填色傳達語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768）
 * ──────────────────────────────────────────────────────────────
 *   第 37 頁  h-[640]：左截圖框 780 寬（p-4）→ 圖片盒 748 × 534 ＋ 12 ＋ 說明 24 ＋ 32 ≈ 602
 *             右（928 寬）：標籤 24 ＋ 6 ＋ 標題 38 ＋ 6 ＋ 副標 30 ＋ 20
 *                         ＋ 獨家 ≈ 164 ＋ 14 ＋ 也有 ≈ 104 ＋ 14 ＋ 缺點 ≈ 98 ＋ 提示 26 ≈ 544
 *   第 39 頁  h-[720]：分頁列 56 ＋ 20 ＋ 本體 644
 *             左截圖框 1060 寬 → 圖片區 1028 × 576（兩張圖都是高度先碰到）
 *             右 648 寬：遊戲分頁 標籤 24 ＋ 10 ＋ 提示詞框 ≈ 285 ＋ 20 ＋ 標題 31 ＋ 12
 *                         ＋ 三個問題 (77 × 3 ＋ 10 × 2 = 251) ≈ 640（瀏覽器量過，離底 4）
 *                         提示詞框：標題列 44 ＋ 12 ＋ 內文 195（三段共 5 行 × 31 ＋ 段距 8 × 2
 *                         ＋ py 24）＋ py 32 ＋ 框 2。三段原本用空行分隔（whitespace-pre-line），
 *                         兩個空行多吃 62、整欄超出 42，改成段距 8；break-keep 讓換行落在標點上，
 *                         第一段不會剩「了。」單獨一行。複製出去的文字仍是空一行分段
 *                       視覺化分頁 標籤 ＋ 標題 ＋ 說明兩行 ＋ 三列 ＋ 結論框 ≈ 520
 *   沒有任何容器會捲動。浮水印在右上角：兩頁的右欄都是靠左的文字，分頁列靠左。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁 */
function keepActivationKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/* ══════════════════════════════════════════════════════════════
 * 第 37 頁 · AntigravityDemo — Google Antigravity
 *
 * 左：Antigravity 桌面版的截圖，選中的項目用框標出位置。
 * 右：定位一句 ＋ 三塊特色（獨家／別家有的它大多也有／缺點）。
 * ══════════════════════════════════════════════════════════════ */

type SpotId = 'ide' | 'models' | 'automations' | 'voice';

interface Spot {
  /** 標在截圖上的字 */
  label: string;
  /** 對原圖的百分比：左、上、寬、高 */
  box: { x: number; y: number; w: number; h: number };
  /** 標籤放在框的上面或下面、對齊框的左緣或右緣 */
  place: 'above' | 'below';
  align: 'left' | 'right';
}

const SPOTS: Record<SpotId, Spot> = {
  ide: {
    label: '開啟 IDE',
    box: { x: 86.2, y: 0.4, w: 7.8, h: 4.2 },
    place: 'below',
    align: 'right',
  },
  models: {
    label: '換模型：付費方案也能選 Claude',
    box: { x: 30.0, y: 92.4, w: 13.0, h: 4.0 },
    place: 'above',
    align: 'left',
  },
  automations: {
    label: 'Automations：排程',
    box: { x: 0.9, y: 9.7, w: 10.6, h: 3.8 },
    place: 'below',
    align: 'left',
  },
  voice: {
    label: '語音對話',
    box: { x: 85.5, y: 92.2, w: 6.0, h: 4.4 },
    place: 'above',
    align: 'right',
  },
};

interface Feature {
  text: string;
  spot?: SpotId;
}

const EXCLUSIVE: readonly Feature[] = [
  { text: '可以直接開啟 IDE', spot: 'ide' },
  { text: '可以用多種模型：除了 Gemini 本家，付費方案還能用 Claude', spot: 'models' },
];

const ALSO_HAS: readonly Feature[] = [
  { text: '多 Agent' },
  { text: 'Remote Control' },
  { text: '排程', spot: 'automations' },
  { text: '互動式視覺化' },
  { text: '語音對話', spot: 'voice' },
];

/** 截圖上的標示框與標籤 */
function SpotMark({ spot }: { spot: Spot }) {
  const { x, y, w, h } = spot.box;
  const labelStyle = {
    ...(spot.place === 'below' ? { top: `${y + h + 1.2}%` } : { bottom: `${100 - y + 1.2}%` }),
    ...(spot.align === 'left' ? { left: `${x}%` } : { right: `${100 - (x + w)}%` }),
  };

  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-lg border-4 border-acid shadow-[0_0_0_3px_var(--color-on-accent)]"
        style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      />
      <span
        className="pointer-events-none absolute rounded-md bg-acid px-3 py-1 text-[17px] leading-tight font-semibold whitespace-nowrap text-on-accent shadow-[0_0_0_2px_var(--color-on-accent)]"
        style={labelStyle}
      >
        {spot.label}
      </span>
    </>
  );
}

/** 有 ◎ 的項目：按下去在截圖上標出位置 */
function SpotButton({
  feature,
  current,
  onPick,
  size = 'row',
}: {
  feature: Feature & { spot: SpotId };
  current: SpotId;
  onPick: (id: SpotId) => void;
  size?: 'row' | 'chip';
}) {
  const on = feature.spot === current;
  const shape =
    size === 'row'
      ? 'min-h-[50px] w-full justify-between rounded-xl px-4 py-2 text-left text-[22px] leading-snug'
      : 'h-11 rounded-full px-4 text-[20px]';

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onPick(feature.spot);
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex items-center gap-3 border-2 transition-colors duration-150 ${shape} ${FOCUS_RING} ${
        on
          ? 'border-acid bg-panel font-semibold text-paper'
          : 'border-line bg-panel text-paper hover:border-acid'
      }`}
    >
      <span>{feature.text}</span>
      <span
        aria-hidden="true"
        className={`shrink-0 text-[18px] leading-none ${on ? 'text-acid' : 'text-faint'}`}
      >
        {on ? '◉' : '◎'}
      </span>
    </button>
  );
}

function hasSpot(feature: Feature): feature is Feature & { spot: SpotId } {
  return feature.spot !== undefined;
}

export function AntigravityDemo() {
  const [current, setCurrent] = useState<SpotId>('ide');

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[780px_minmax(0,1fr)] gap-8">
      {/* ── 左：截圖 ＋ 標示框 ───────────────────────────── */}
      <figure className="flex min-h-0 flex-col gap-3 rounded-2xl border border-line bg-ink-soft p-4">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="relative aspect-[2576/1839] w-[748px]">
            <img
              src={appShotUrl}
              alt="Google Antigravity 桌面版：左側是 New Conversation、Automations、Customizations 與專案清單，中間是對話（請它做一個類似皇室戰爭的 Three.js 遊戲，它先問了 3 個問題），右上角有 Open IDE，輸入框下方可以選模型 Gemini 4 Argon High 與 Auto 模式"
              className="absolute inset-0 size-full rounded-lg"
            />
            <SpotMark spot={SPOTS[current]} />
          </div>
        </div>
        <figcaption className="shrink-0 text-center text-[17px] leading-snug text-faint">
          Antigravity 桌面版：對話、專案、Automations 都在同一個視窗，右上角可以直接開 IDE
        </figcaption>
      </figure>

      {/* ── 右：定位 ＋ 三塊特色 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col">
        <div className="flex items-center gap-3">
          <p className={`${LABEL_TYPE} text-faint`}>Google · Antigravity</p>
          <span className="rounded-full border-2 border-paper px-3 py-0.5 text-[16px] leading-tight font-semibold text-paper">
            講師體感
          </span>
        </div>
        <h3 className="mt-1.5 text-[31px] leading-tight font-semibold text-paper">
          IDE 還在，又多了桌面版 App
        </h3>
        <p className="mt-1.5 text-[21px] leading-snug text-muted">
          原本的 IDE 改名 Antigravity IDE 繼續提供，另外多了類似 ChatGPT、Claude 的桌面版應用程式。
        </p>

        <div className="mt-5 flex flex-col gap-3.5">
          {/* 獨家 */}
          <section className="rounded-2xl border border-l-[6px] border-line border-l-blue bg-panel px-5 py-3.5">
            <p className={`${LABEL_TYPE} text-blue`}>獨家</p>
            <div className="mt-2.5 flex flex-col gap-2">
              {EXCLUSIVE.filter(hasSpot).map((feature) => (
                <SpotButton
                  key={feature.spot}
                  feature={feature}
                  current={current}
                  onPick={setCurrent}
                />
              ))}
            </div>
          </section>

          {/* 別家有的它大多也有 */}
          <section className="rounded-2xl border border-l-[6px] border-line border-l-teal bg-panel px-5 py-3.5">
            <p className={`${LABEL_TYPE} text-teal`}>別家有的，它大多也有</p>
            <ul className="mt-2.5 flex flex-wrap items-center gap-2">
              {ALSO_HAS.map((feature) => (
                <li key={feature.text}>
                  {hasSpot(feature) ? (
                    <SpotButton
                      feature={feature}
                      current={current}
                      onPick={setCurrent}
                      size="chip"
                    />
                  ) : (
                    <span className="flex h-11 items-center rounded-full border-2 border-line-soft bg-panel px-4 text-[20px] text-paper">
                      {feature.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* 缺點 */}
          <section className="rounded-2xl border border-l-[6px] border-line border-l-coral bg-panel px-5 py-3.5">
            <p className={`${LABEL_TYPE} text-coral`}>缺點</p>
            <p className="mt-2 text-[22px] leading-snug text-paper">
              別家的功能都有，但都不完整；模型也還不是主力。
            </p>
          </section>
        </div>

        <p className="mt-auto text-[19px] text-faint">點有 ◎ 的項目，左邊截圖會標出它在哪裡</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 39 頁 · AntigravityExamplesDemo — 互動式視覺化與遊戲
 *
 * 分頁切換兩個實例（同一個專案）。左邊是截圖，右邊是說明；
 * 遊戲那一頁附講師的提示詞（可複製）與 Antigravity 開工前問的 3 個問題。
 * ══════════════════════════════════════════════════════════════ */

type ExampleId = 'visual' | 'game';

const EXAMPLE_TABS: readonly { id: ExampleId; name: string }[] = [
  { id: 'visual', name: '互動式視覺化' },
  { id: 'game', name: '做一個遊戲' },
];

/** 畫面上分段顯示（段距 8，不用空行）；複製出去的仍是空一行分段的原文 */
const GAME_PROMPT_PARAGRAPHS = [
  '我們來做一個類似《皇室戰爭》的遊戲，你只要製作一關就可以了。',
  '整個遊戲會使用到 Three.js 來製作。如果需要下載其他外掛程式，使用 pnpm 來進行下載。',
  '過程中如果你有任何問題，可以隨時提出。',
] as const;

const GAME_PROMPT = GAME_PROMPT_PARAGRAPHS.join('\n\n');

const GAME_QUESTIONS: readonly { ask: string; pick: string }[] = [
  { ask: '前端架構與建置工具', pick: 'Vite ＋ Vue 3 ＋ Three.js' },
  { ask: '卡牌與兵種機制', pick: '經典 5 卡：騎士、弓箭手、巨人、骷髏群、火球術' },
  { ask: '3D 場景與角色的美術', pick: 'Low-Poly 程序化建模，不用外部素材' },
];

const VISUAL_ROWS: readonly { name: string; text: string }[] = [
  { name: '三個分頁', text: '模組架構與資料流、尋路與部署沙盒、五卡數值與剋制' },
  {
    name: '看得到的模組',
    text: 'App.vue（UI 與 HUD）、ArenaEngine.js（3D 場景與戰鬥），加上 models、constants、sound',
  },
  { name: '技術', text: 'Vue 3 ＋ Three.js' },
];

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
      title={status === 'failed' ? '瀏覽器擋下了複製，請手動選取文字' : undefined}
      className={`h-11 min-w-[148px] shrink-0 rounded-xl border px-5 text-[19px] transition-colors duration-200 ${FOCUS_RING} ${
        status === 'copied'
          ? 'border-teal bg-teal font-medium text-on-accent'
          : status === 'failed'
            ? 'border-paper bg-panel text-paper'
            : 'border-line bg-panel text-paper hover:border-paper'
      }`}
    >
      {status === 'copied' ? '已複製' : status === 'failed' ? '複製失敗' : '複製提示詞'}
    </button>
  );
}

/* ── 版面零件 ─────────────────────────────────────────────── */

function ExampleShot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="flex min-h-0 flex-col gap-3 rounded-2xl border border-line bg-ink-soft p-4">
      <div className="relative min-h-0 flex-1">
        <img src={src} alt={alt} className="absolute inset-0 size-full object-contain" />
      </div>
      <figcaption className="shrink-0 text-center text-[17px] leading-snug text-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

function VisualSide() {
  return (
    <div className="flex min-h-0 flex-col">
      <p className={`${LABEL_TYPE} text-faint`}>實例一 · 互動式視覺化</p>
      <h3 className="mt-1.5 text-[30px] leading-tight font-semibold text-paper">
        把專案架構畫成可以點的圖
      </h3>
      <p className="mt-2 text-[21px] leading-snug text-muted">
        「皇家競技場 3D 架構探索器」：點任一個模組節點，右邊就顯示它的內部設計與資料流向。
      </p>

      <dl className="mt-5 flex flex-col border-t border-line">
        {VISUAL_ROWS.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[136px_1fr] items-baseline gap-4 border-b border-line-soft py-3"
          >
            <dt className="text-[19px] font-semibold text-muted">{row.name}</dt>
            <dd className="text-[21px] leading-snug break-keep text-pretty text-paper">{row.text}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto rounded-2xl border border-l-[6px] border-line border-l-teal bg-panel px-6 py-4">
        <p className={`${LABEL_TYPE} text-teal`}>重點</p>
        <p className="mt-2 text-[22px] leading-snug text-paper">
          別家有的互動式視覺化，Antigravity 也做得到；看的正是旁邊那個遊戲專案。
        </p>
      </div>
    </div>
  );
}

function GameSide() {
  return (
    <div className="flex min-h-0 flex-col">
      <p className={`${LABEL_TYPE} text-faint`}>實例二 · 做一個遊戲</p>

      <div className="mt-2.5 rounded-2xl border border-l-[6px] border-line border-l-acid bg-panel px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className={`${LABEL_TYPE} text-acid`}>講師的提示詞</p>
          <CopyButton text={GAME_PROMPT} />
        </div>
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-ink-soft px-4 py-3 text-[20px] leading-[1.55] text-paper">
          {GAME_PROMPT_PARAGRAPHS.map((text) => (
            <p key={text} className="break-keep text-pretty">
              {text}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-5 flex min-h-0 flex-col">
        <p className="text-[22px] leading-snug font-semibold text-paper">
          開工前，它先問了 3 個問題
        </p>
        <ol className="mt-3 flex flex-col gap-2.5">
          {GAME_QUESTIONS.map((item, index) => (
            <li
              key={item.ask}
              className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-line bg-panel px-4 py-2.5"
            >
              <span className="mt-0.5 flex size-8 items-center justify-center rounded-full border-2 border-paper font-display text-[17px] leading-none font-semibold text-paper tabular-nums">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[19px] leading-snug text-muted">{item.ask}</span>
                <span className="text-[21px] leading-snug text-paper">{item.pick}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function AntigravityExamplesDemo() {
  const [tab, setTab] = useState<ExampleId>('visual');

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col gap-5">
      <div className="flex h-14 shrink-0 items-center gap-6">
        <div
          role="tablist"
          aria-label="切換實例"
          className="inline-flex h-14 shrink-0 items-stretch gap-1.5 rounded-2xl border border-line bg-panel-lift p-1.5"
        >
          {EXAMPLE_TABS.map((item) => {
            const on = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={(event) => {
                  setTab(item.id);
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                className={`rounded-xl px-6 text-[21px] whitespace-nowrap transition-colors duration-200 ${FOCUS_RING} ${
                  on
                    ? 'bg-paper font-semibold text-on-accent'
                    : 'text-muted hover:bg-panel hover:text-paper'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <p className="text-[20px] text-muted">兩個都是同一個專案：類似《皇室戰爭》的 3D 對戰遊戲</p>
      </div>

      <div key={tab} className="slide-enter grid min-h-0 flex-1 grid-cols-[1060px_minmax(0,1fr)] gap-8">
        {tab === 'visual' ? (
          <>
            <ExampleShot
              src={visualShotUrl}
              alt="皇家競技場 3D 架構探索器：上方三個分頁（模組架構與資料流、尋路與部署沙盒、五卡數值與剋制），左邊是 App.vue、ArenaEngine.js、models.js、constants.js、sound.js 的模組節點，右邊是選中模組的設計說明與程式片段"
              caption="Antigravity 產生的「皇家競技場 3D 架構探索器」（Vue 3 ＋ Three.js）"
            />
            <VisualSide />
          </>
        ) : (
          <>
            <ExampleShot
              src={gameShotUrl}
              alt="Antigravity 的畫面：左邊是對話（把開發伺服器換到 5180 埠並給出預覽網址），右邊是內建瀏覽器開著遊戲「皇家競技場 3D：單一關卡對決」，可以選 AI 對手難度與五張卡牌"
              caption="左邊是對話，右邊是 Antigravity 內建的瀏覽器，直接開著遊戲的關卡選單"
            />
            <GameSide />
          </>
        )}
      </div>
    </div>
  );
}
