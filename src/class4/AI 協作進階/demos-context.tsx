import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第一章 回顧 Context Window
 *
 *   第 7 頁  ContextWindowDemo   還記得 Context Window 嗎？（整頁 demo）
 *   第 8 頁  ContextFillingDemo  什麼情況會塞爆 Context（split 2:3 的右欄）
 *
 * callout：「還記得先前介紹過 Context Window 的概念？使用 "互動式教學簡報" 的
 * "11 Context Window 與 Context Length" "13 什麼情況會塞爆 Context"」
 * → 這兩頁是「回顧」，替第 9 頁「SubAgent 的好處（隔離 Context）」鋪路。
 *
 * ──────────────────────────────────────────────────────────────
 * 來源
 * ──────────────────────────────────────────────────────────────
 * 移植自 2026-interactive-presentive〈常見 AI 專有名詞〉
 * （src/ithome2026/AI專有名詞/demos.tsx）：
 *   第 11 頁 window-vs-length  → ContextWindowDemo
 *   第 13 頁 context-overflow  → ContextFillingDemo（只有右欄，左欄 points 在 slides.ts）
 * 複製而不是 import：兩份簡報各自演進。互動行為照舊 ——
 * 第 7 頁拖拉桿調 Context Length；第 8 頁方塊自動落下、塞滿後清空重來。
 * 文字照來源，沒有跨篇引用（來源這兩頁本來就沒有「Day xx」「上一篇」）。
 *
 * ──────────────────────────────────────────────────────────────
 * 從深色主題移植過來時改了什麼
 * ──────────────────────────────────────────────────────────────
 * 來源是深色主題，同名 token 在這裡明暗相反（ink 是米白、paper 是墨色）：
 *   - 強調色收斂成兩支：來源第 7 頁用 teal（使用中）＋ amber（快滿了），
 *     第 8 頁用 blue／teal／acid／violet 四色對應左欄四個條目，再加 danger（已滿）。
 *     這裡兩頁統一成 acid（Context 的使用量，主角）＋ coral（快滿、已滿，代價）。
 *   - 第 8 頁的方塊不再靠顏色分辨來源（左欄四項在這份 slides.ts 都是 acid），
 *     改成每個方塊直接寫上來源名稱，圖例也跟著改成「方塊 = 內容來源」。
 *   - 透明階上調：淡底 /8、/16 → /14、/20；邊框 /45、/50、/60 → 實色或 /55。
 *     淡底一律再配實色框線或 6px 左粗條，不單獨承擔語意。
 *   - 使用中的格子從 teal/30 淡底改成 acid/70 ＋ 實色框：紙面上 /30 的格子
 *     投影出去會跟空格子糊在一起。
 *   - 空格子從 panel-lift 改成 ink-soft：panel-lift 疊在 panel 上只有 1.17:1。
 *   - 「Context 已滿」徽章原本是 bg-ink（深色時代的黑底），改成 bg-panel ＋ 實色 coral 框。
 *   - 拉桿：這個 repo 沒有任何 range 的全域樣式，原生拉桿在舞台上只有 16px，
 *     教室後排看不到。改成 12px 軌道 ＋ 32px 圓鈕（WebKit 與 Firefox 各寫一組）。
 *
 * ──────────────────────────────────────────────────────────────
 * 為了版面補的、跟來源不一樣的地方
 * ──────────────────────────────────────────────────────────────
 *   - 第 7 頁：來源是單欄（格子、兩行大字、拉桿、兩行說明，寬 1240）。這裡改成
 *     左格子＋拉桿、右三張說明卡，好撐滿 1740 寬。來源那句「Context Window 是
 *     容量上限，Context Length 是目前內容的長度」拆進兩張卡；「外框」「亮起來的
 *     格子」是補的指認語，把卡片跟左邊的圖對起來。
 *   - 第 8 頁：多一顆「暫停／繼續播放」，預設仍是自動播放（來源沒有任何按鈕），
 *     方便講師停在某一格講解。方塊改成落在盒子內部的頂端才開始下墜，
 *     不從盒子外面掉進來 —— 不會有任何東西超出容器。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這份簡報沒有 description、沒有 caption。
 *
 * 第 7 頁（整頁 demo）：Panel 內可用 ≈ 1742 × 766，根容器 h-[720px] max-w-[1740px]。
 *   兩欄 grid [1fr_520px] gap-12 → 左欄 1740 − 520 − 48 = 1172 寬。
 *   左：外框 = 10 列 × 40 + 9 × gap 8 = 472 ＋ p-6 48 ＋ 框線 3×2 = 526
 *       gap-6 24 ＋ 拉桿 40 ＋ mt-1 4 ＋ 刻度 26 = 620（垂直置中）
 *   右：三張卡 ≈ 184 ＋ 192 ＋ 120 ＋ gap 2 × 20 = 536（垂直置中）
 *   格子寬 = (1172 − 6 − 48 − 19 × 8) / 20 ≈ 48，接近正方形。
 *
 * 第 8 頁（split 2:3 右欄）：內容區 1824 − gap 32 = 1792，3/5 → 1075 寬；
 *   扣 Panel 框線 2 ＋ p-10 80 → 可用 ≈ 993 × 766。根容器 h-[720px] w-full，
 *   實際寬度就是 993。
 *   左（560 寬）：標頭 28 ＋ mt-3 12 ＋ 盒子 600 ＋ p-3 24 ＋ 框線 2×2 = 668
 *     盒子內：12 塊 × 列高 50 − 8 = 592 ≤ 600。
 *   右（993 − 560 − 32 = 401 寬）：標籤 26 ＋ 4 列 × 42 ＋ 說明卡 ≈ 190
 *     ＋ 按鈕 48 ＋ gap 6 × 16 ≈ 530。
 *
 * 沒有任何容器會捲動。浮水印在右上角（舞台 y 104–147），兩頁的根容器
 * 都從 Panel 的 p-10 之內開始（y ≥ 160），碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_FAINT =
  'font-display text-[17px] tracking-[0.16em] text-faint uppercase';

const BTN_GHOST =
  'h-12 rounded-xl border border-line bg-panel px-6 text-[20px] text-paper transition-colors duration-200 hover:border-acid';

/* ══════════════════════════════════════════════════════════════
 * 第 7 頁 · ContextWindowDemo — 還記得 Context Window 嗎？
 *
 * 200 個方格 = 200K Token，一格代表 1K，每一列 20K。
 * 外框 = Context Window（容量上限）；亮起來的格子 = Context Length（目前長度）。
 * 拖拉桿改變 Context Length，超過 85% 時外框、格子、讀數一起轉成 coral。
 *
 * 用色：acid（目前的 Context Length）＋ coral（快滿了）。
 * ══════════════════════════════════════════════════════════════ */

const CW_TOTAL_K = 200;
const CW_COLUMNS = 20;
const CW_ROWS = 10;
/** 超過這個使用率就轉成警示色 */
const CW_NEAR_FULL_RATIO = 0.85;

/** 陣列內容固定，放在模組層級，避免每次拖曳都重建 */
const CW_CELLS = Array.from({ length: CW_COLUMNS * CW_ROWS }, (_, index) => index);

/*
 * 拉桿樣式。Tailwind 只掃得到完整字串，所以兩種狀態各存一整串。
 * 圓鈕 32px、軌道 12px → WebKit 的 margin-top 是 (12 − 32) / 2 = −10。
 */
const RANGE_BASE =
  'h-10 w-full cursor-pointer appearance-none bg-transparent ' +
  '[&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-line ' +
  '[&::-webkit-slider-thumb]:mt-[-10px] [&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-colors ' +
  '[&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-line ' +
  '[&::-moz-range-thumb]:size-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0';
const RANGE_THUMB_ACID =
  '[&::-webkit-slider-thumb]:bg-acid [&::-moz-range-thumb]:bg-acid';
const RANGE_THUMB_CORAL =
  '[&::-webkit-slider-thumb]:bg-coral [&::-moz-range-thumb]:bg-coral';

export function ContextWindowDemo() {
  const [lengthK, setLengthK] = useState(48);

  const nearFull = lengthK / CW_TOTAL_K > CW_NEAR_FULL_RATIO;

  /*
   * 所有亮起的格子共用同一組 class 與同一個 duration。
   * 刻意不做逐格 transition-delay，不然一次會排出 200 條錯開的動畫。
   */
  const usedCell = nearFull
    ? 'border-coral bg-coral/70'
    : 'border-acid bg-acid/70';

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[minmax(0,1fr)_520px] items-center gap-12">
      {/* ── 左：外框 = Context Window，亮起來的格子 = Context Length ── */}
      <div className="flex min-w-0 flex-col gap-6">
        <div
          className={`relative rounded-2xl border-[3px] p-6 transition-colors duration-200 ${
            nearFull ? 'border-coral' : 'border-line'
          }`}
        >
          {/* 標籤壓在框線上，用 bg-panel 切斷邊框 —— 依賴外層 Panel 是 bg-panel */}
          <span className="absolute -top-4 right-8 bg-panel px-3 font-display text-[19px] tracking-[0.12em] text-faint">
            Context Window｜200K Token
          </span>

          <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-2">
            {CW_CELLS.map((index) => (
              <div
                key={index}
                className={`h-10 rounded-md border transition-colors duration-150 ${
                  index < lengthK ? usedCell : 'border-line-soft bg-ink-soft'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 左右各內縮 27（框線 3 ＋ p-6 24），讓拉桿的兩端對齊格子 */}
        <div className="px-[27px]">
          <input
            type="range"
            min={0}
            max={CW_TOTAL_K}
            step={1}
            value={lengthK}
            onChange={(event) => setLengthK(Number(event.target.value))}
            aria-label="目前 Context Length"
            className={`${RANGE_BASE} ${nearFull ? RANGE_THUMB_CORAL : RANGE_THUMB_ACID}`}
          />
          <div className="mt-1 flex justify-between font-mono text-[17px] text-faint">
            <span>0</span>
            <span>100K</span>
            <span>200K</span>
          </div>
        </div>
      </div>

      {/* ── 右：兩個讀數 ＋ 桌子的比喻 ─────────────────────── */}
      <div className="flex min-w-0 flex-col gap-5">
        <div className="rounded-2xl border border-line px-7 py-6">
          <p className={LABEL_FAINT}>Context Window</p>
          <p className="mt-2 font-display text-[56px] leading-none font-semibold text-paper">
            200K
            <span className="ml-2 text-[28px] font-medium">Token</span>
          </p>
          <p className="mt-3 text-[22px] text-muted">容量上限：外框能裝多少</p>
        </div>

        <div
          className={`rounded-2xl border border-l-[6px] px-7 py-6 transition-colors duration-200 ${
            nearFull
              ? 'border-coral/55 border-l-coral bg-coral/14'
              : 'border-acid/55 border-l-acid bg-acid/14'
          }`}
        >
          {/* 固定 h-8：「快滿了」出現與消失時，卡片高度不跳 */}
          <div className="flex h-8 items-center justify-between">
            <p className={LABEL_FAINT}>目前 Context Length</p>
            {nearFull && (
              <span className="rounded-full bg-coral px-3 py-0.5 text-[17px] font-semibold text-on-accent">
                快滿了
              </span>
            )}
          </div>
          <p
            className={`mt-2 font-display text-[56px] leading-none font-semibold tabular-nums ${
              nearFull ? 'text-coral' : 'text-acid'
            }`}
          >
            {lengthK}K
            <span className="ml-2 text-[28px] font-medium">Token</span>
          </p>
          <p className="mt-3 text-[22px] text-muted">目前內容的長度：亮起來的格子</p>
        </div>

        <div className="rounded-2xl bg-ink-soft px-7 py-6">
          <p className="text-[22px] leading-relaxed text-paper">
            可以把 Window 想成一張桌子 —— 桌子越大，一次可以攤開的資料就越多。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 8 頁 · ContextFillingDemo — 什麼情況會塞爆 Context（右欄）
 *
 * 一個盒子，方塊持續從上方落下堆積；塞滿後整個盒子轉 coral、顯示
 * 「Context 已滿」，停約 800ms 後清空重來。整段動畫由單一 tick 推導。
 * 方塊依序輪替四種來源，對應同一頁左欄的四個條目。
 *
 * 用色：acid（占用 Context 的內容，與左欄 points 的 accent 一致）＋ coral（已滿）。
 * ══════════════════════════════════════════════════════════════ */

const FILL_TICK_MS = 24; // 動畫更新頻率，約 42fps
const FILL_STEP_TICKS = 12; // 一個方塊落下所需的 tick（約 288ms）
const FILL_CAPACITY = 12; // 盒子內最多堆幾個方塊
const FILL_HOLD_TICKS = 33; // 塞滿之後停留約 800ms
const FILL_TICKS = FILL_CAPACITY * FILL_STEP_TICKS;
const FILL_CYCLE = FILL_TICKS + FILL_HOLD_TICKS;
const FILL_BLOCK_H = 42;
const FILL_ROW_H = 50; // 方塊高度 ＋ 間距
const FILL_BOX_H = 600; // 盒子內可堆疊的高度（12 × 50 − 8 = 592，留一點餘裕）
/** 方塊開始下墜的位置：剛好貼著盒子內部的頂端，不從盒子外面掉進來 */
const FILL_START_BOTTOM = FILL_BOX_H - FILL_BLOCK_H;

/** 方塊依來源輪替，順序對應左欄四個條目；寬度只是讓堆疊看起來參差 */
const FILL_SOURCES = [
  { key: 'chat', label: '對話紀錄', note: '每一輪問答都會留下', width: 320 },
  { key: 'doc', label: '文件內容', note: 'PDF、文章、網頁', width: 470 },
  { key: 'code', label: '程式碼', note: '一次讀進來的檔案', width: 400 },
  { key: 'tool', label: '工具回傳', note: '搜尋、API、MCP 結果', width: 355 },
] as const;

/** 方塊外觀：acid/20 淡底 ＋ 實色框 ＋ 6px 左粗條；字用 paper，不用彩色字疊淡底 */
const FILL_BLOCK =
  'flex items-center rounded-lg border border-l-[6px] border-acid bg-acid/20 px-4 text-[18px] text-paper';

export function ContextFillingDemo() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setTick((value) => (value + 1) % FILL_CYCLE),
      FILL_TICK_MS,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  const isFull = tick >= FILL_TICKS;
  const settled = Math.min(Math.floor(tick / FILL_STEP_TICKS), FILL_CAPACITY);
  // 落下進度用 (sub + 1) / STEP，讓最後一格剛好落到定位，銜接下一個 tick 不會跳動
  const progress = ((tick % FILL_STEP_TICKS) + 1) / FILL_STEP_TICKS;

  const fallingSource = FILL_SOURCES[settled % FILL_SOURCES.length];
  const fallingRest = settled * FILL_ROW_H;
  // 位移用 p² 模擬加速下墜
  const fallingBottom =
    fallingRest + (1 - progress * progress) * (FILL_START_BOTTOM - fallingRest);

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] items-center gap-8">
      {/* ── 左：Context Window 盒子 ─────────────────────────── */}
      <div className="w-[560px] shrink-0">
        <div className="flex items-baseline justify-between">
          <p className={LABEL_FAINT}>Context Window</p>
          <p
            className={`text-[20px] ${
              isFull ? 'font-semibold text-coral' : 'text-muted'
            }`}
          >
            {isFull ? '已滿' : `已使用 ${settled} / ${FILL_CAPACITY}`}
          </p>
        </div>

        <div
          className={`relative mt-3 overflow-hidden rounded-2xl border-2 p-3 transition-colors ${
            isFull ? 'border-coral bg-coral/14' : 'border-line bg-ink-soft'
          }`}
          style={{ height: FILL_BOX_H + 24 + 4 }}
        >
          <div className="relative size-full">
            {Array.from({ length: settled }, (_, index) => {
              const source = FILL_SOURCES[index % FILL_SOURCES.length];
              return (
                <div
                  key={index}
                  className={`absolute left-0 ${FILL_BLOCK}`}
                  style={{
                    bottom: index * FILL_ROW_H,
                    width: source.width,
                    height: FILL_BLOCK_H,
                  }}
                >
                  {source.label}
                </div>
              );
            })}

            {!isFull && (
              <div
                className={`absolute left-0 ${FILL_BLOCK}`}
                style={{
                  bottom: fallingBottom,
                  width: fallingSource.width,
                  height: FILL_BLOCK_H,
                  opacity: 0.35 + 0.65 * progress,
                }}
              >
                {fallingSource.label}
              </div>
            )}
          </div>

          {isFull && (
            <div className="absolute inset-0 z-10 grid place-items-center">
              <span className="rounded-xl border-2 border-coral bg-panel px-7 py-3.5 text-[26px] font-semibold text-coral">
                Context 已滿
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 右：圖例 ＋ 結論 ＋ 暫停 ───────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        <p className={LABEL_FAINT}>方塊 = 內容來源</p>

        {FILL_SOURCES.map((source) => (
          <div key={source.key} className="flex items-center gap-4">
            <span className={`h-[42px] w-[124px] shrink-0 ${FILL_BLOCK}`}>
              {source.label}
            </span>
            <span className="min-w-0 text-[19px] leading-snug text-muted">
              {source.note}
            </span>
          </div>
        ))}

        <p className="mt-2 rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-6 py-5 text-[22px] leading-relaxed text-paper">
          不管來自哪裡，占用的都是同一個 Context。把一部分工作交給 SubAgent，就不會全部塞在同一個 Context 裡。
        </p>

        <div>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={BTN_GHOST}
          >
            {playing ? '暫停' : '繼續播放'}
          </button>
        </div>
      </div>
    </div>
  );
}
