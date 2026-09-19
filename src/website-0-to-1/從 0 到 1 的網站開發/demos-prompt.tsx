import { Fragment, useEffect, useRef, useState } from 'react';
import { MainlineTrack } from './diagrams-prompt';
import type {
  MainlineTrackProps,
  TrackNode,
  TrackPath,
  TrackTone,
} from './diagrams-prompt';

/* ══════════════════════════════════════════════════════════════
 * 第二章開頭：提示詞的四頁
 *
 *   第 20 頁  MainlineDemo        一條從零到完成的線（split 2:3 右欄）
 *   第 21 頁  ThreeFactorsDemo    三件會把線帶偏的事（隨機／提示詞／資源）
 *   第 22 頁  PromptThreeDemo     一次給足的三件事：開關一件，看 AI 要猜什麼
 *   第 23 頁  PromptExamplesDemo  三種寫法，照你的狀況挑（可複製）
 *
 * 前兩頁移植自另一個專案的〈如何寫好提示詞〉，做過深色→亮色轉換；
 * 後兩頁是這一堂課新寫的，接在「會把線帶偏的事」之後，給一個簡化到
 * 一次就能寫完的版本。
 *
 * ──────────────────────────────────────────────────────────────
 * 顏色
 * ──────────────────────────────────────────────────────────────
 * 第 20、21 頁的線條色彩契約寫在 diagrams-prompt.tsx 的檔頭。
 * 第 21 頁三種情況各有一支色，但同一時間只會亮一種，
 * 畫面上永遠是「acid 主線 + 目前這一種」兩色。
 *
 * 第 22、23 頁的三件事全部用 acid，靠序號 1／2／3 區分，不是三個顏色：
 *   第 22 頁  acid 三件事  ＋  coral「AI 得自己猜」
 *   第 23 頁  acid 三件事  ＋  teal「延伸技巧」與「已複製」
 *
 * 低透明度填色不單獨承擔語意：選中的卡、說明卡都配 6px 的不透明左粗條，
 * 關掉的卡改成虛線框。淡底上的內文一律 text-paper / text-muted。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這一份沒有 description 與 caption，面板內可用 ≈ 1744 × 768。
 *   第 20 頁  split 2:3 右欄，面板內可用 ≈ 993 × 768，容器 952 寬、約 581 高
 *   第 21 頁  沿用原版的 h-[648px]，由面板的 items-center 上下置中
 *   第 22、23 頁  h-[700px]
 *
 * 沒有任何容器可以捲動：未輪到的 DOM 一律不掛（`{cond && …}`），
 * 只有 SVG 的 <path> 例外（沒有 box layout，只切 progress / opacity）。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

/** 面板小標籤的字體規格，顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 最常見的那一種：次要色的小標籤 */
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

/* ══════════════════════════════════════════════════════════════
 * 第 20 頁 `mainline` — 一條從零到完成的線
 *
 * 版位是 `split 2:3` 的右欄：講者在左欄唸三個名詞（起點／節點／終點）的時候，
 * 右邊一直在動，所以這裡沒有任何按鈕，一個 setInterval 推 tick，
 * progress 從 0 長到 1 → 停一下 → 倒帶 → 再跑一次，永遠循環。
 *
 * 一輪 12.0 秒：生長 9.0s ／ 停在終點 2.0s ／ 倒帶 1.0s。
 * 倒帶不是硬切：progress 一口氣設回 0，由 MainlineTrack 自己那條
 * `transition-[stroke-dashoffset] duration-700` 把線收回去，看起來像倒帶。
 *
 * 這一頁只演「順利」—— 沒有偏離、沒有分岔，全部走 acid。
 *
 * 兩處刻意的調整：
 *   1. 不給 `arrow: true`。markerEnd 不受 stroke-dasharray 影響，線才長到一半
 *      箭頭就已經浮在終點；終點有旗子，箭頭本來就是多的。
 *   2. 多一條 `rail`（同一條 d、細線、不給 progress），
 *      否則還沒被走過的節點會孤零零地飄在空白處。
 *      亮色紙面比深色更吃淡色，透明度從 0.16 提到 0.22。
 *
 * 高度：軌道框 402（2 + 48 + 40 + 12 + 300）+ gap-6 24 + 說明卡 ≈155 ≈ 581
 *   說明卡 = border 2 + py-6 48 + 小標 20.4 + mt-2 8 + 標題 35.75 + mt-1.5 6 + 內文 34.1
 *   計數列 h-[40px]：19px 文字配 24px 數字，數字若沿用繼承的 1.5 行高，
 *   基線對齊後行框會撐到 32（實測），固定 28 的列會往上頂出 4px。
 *   現在內文 leading-[28px]、數字 leading-none（行框 ≈ 28），列高 40 留 12 的餘裕。
 * 寬度：容器 952；軌道框內可用 952 − 2 − 48 = 902 ≥ SVG 880
 * ══════════════════════════════════════════════════════════════ */

const ML_BOX_W = 880;
const ML_BOX_H = 300;
const ML_LINE_Y = 140;
const ML_LINE_X0 = 70;
const ML_LINE_X1 = 790;
const ML_GOAL_X = 820;

const ML_LINE_D = 'M 70 140 L 790 140';

/* ── 節奏（tick 推導，沒有任何動畫函式庫）──────────────── */

const ML_TICK_MS = 100;
/** 線從 0 長到 1：9.0 秒，四個節點各撐約 1.8 秒 */
const ML_GROW_TICKS = 90;
/** 抵達終點後停 2.0 秒，讓「做完了」被看見 */
const ML_HOLD_TICKS = 20;
/** 倒帶 1.0 秒，配合 MainlineTrack 內建的 700ms transition */
const ML_REWIND_TICKS = 10;
const ML_CYCLE_TICKS = ML_GROW_TICKS + ML_HOLD_TICKS + ML_REWIND_TICKS;

/** tick → 0~1 的推進度。生長 → 停住 → 歸零倒帶，然後由 % 回到開頭 */
function mlProgress(tick: number) {
  if (tick < ML_GROW_TICKS) return tick / ML_GROW_TICKS;
  if (tick < ML_GROW_TICKS + ML_HOLD_TICKS) return 1;
  return 0;
}

interface MainlineNode {
  x: number;
  /** 畫在節點下方的小標籤，7 個字以內（節點間距 145，再長會相撞） */
  label: string;
}

/** 第一個是起點，後面四個是四個會影響方向的事件 */
const ML_NODES: MainlineNode[] = [
  { x: 70, label: '起點' },
  { x: 215, label: '你說一句' },
  { x: 360, label: 'AI 產一段' },
  { x: 505, label: '你補一份檔案' },
  { x: 650, label: 'AI 再產一段' },
];

/** 起點不算「事件節點」，所以計數器的分母是 4 */
const ML_EVENT_TOTAL = ML_NODES.length - 1;

interface MainlineStage {
  /** 說明卡上方的小標，跟著線頭走 */
  badge: string;
  title: string;
  note: string;
}

/**
 * 前五筆對應 ML_NODES，最後一筆是「抵達終點」。
 * 一次只掛目前這一筆，沒有被藏起來的卡片。
 */
const ML_STAGES: MainlineStage[] = [
  {
    badge: '起點',
    title: '什麼都還沒有',
    note: '一個網頁、一份報表或一篇文章，這時候都還只是你腦袋裡的想法。',
  },
  {
    badge: `節點 01 / 0${ML_EVENT_TOTAL}`,
    title: '你說一句',
    note: '你把想做的事告訴 AI，這條線的方向就是從這一句定下來的。',
  },
  {
    badge: `節點 02 / 0${ML_EVENT_TOTAL}`,
    title: 'AI 產一段',
    note: 'AI 照著你說的產出第一版，線往終點的方向推進一格。',
  },
  {
    badge: `節點 03 / 0${ML_EVENT_TOTAL}`,
    title: '你補一份檔案',
    note: '多給一份參考資料，AI 需要自己猜的地方就少一塊。',
  },
  {
    badge: `節點 04 / 0${ML_EVENT_TOTAL}`,
    title: 'AI 再產一段',
    note: '有了那份資料，這一段就比上一段更接近你要的東西。',
  },
  {
    badge: '終點',
    title: '這件事做完了',
    note: '線一路走到底，中間沒有任何一步需要退回來重做。',
  },
];

/**
 * 第 20 頁：一條從零到完成的線。自動循環、沒有任何按鈕。
 *
 * 每一拍都只做一件事：把 tick 加一（並且 % 回圈長，數字不會無限長大），
 * 其餘的（progress、線頭在哪、哪個節點亮、說明卡顯示第幾段）全部由 tick 推導。
 */
export function MainlineDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((value) => (value + 1) % ML_CYCLE_TICKS);
    }, ML_TICK_MS);

    return () => clearInterval(timer);
  }, []);

  const progress = mlProgress(tick);
  const arrived =
    tick >= ML_GROW_TICKS && tick < ML_GROW_TICKS + ML_HOLD_TICKS;

  /** 線頭現在的 x。節點要不要亮、說明卡顯示哪一段，都看它 */
  const head = ML_LINE_X0 + progress * (ML_LINE_X1 - ML_LINE_X0);

  /*
   * tsconfig 的 lib 只到 ES2022，沒有 Array.prototype.findLastIndex，
   * 所以用「已經被走過的節點有幾個」反推目前是第幾個。
   */
  const reached = ML_NODES.filter((node) => head >= node.x - 1).length;
  const currentIndex = Math.max(0, reached - 1);
  const stage = ML_STAGES[arrived ? ML_STAGES.length - 1 : currentIndex];

  const nodes: TrackNode[] = ML_NODES.map((node, index) => ({
    x: node.x,
    y: ML_LINE_Y,
    tone: 'acid',
    label: node.label,
    // 只亮目前這一顆：移動中的光點跟說明卡一對一，台下不會看錯在講哪一段
    active: index === currentIndex,
  }));

  return (
    <div className="flex w-[952px] flex-col gap-6">
      {/* 軌道 */}
      <div className="rounded-2xl border border-line bg-ink-soft p-6">
        <div className="flex h-[40px] items-center justify-between">
          <p className={LABEL_FAINT}>主線 · 從零到完成</p>
          <p className="text-[19px] leading-[28px] text-muted">
            已經走過{' '}
            <span className="font-display text-[24px] leading-none text-acid tabular-nums">
              {currentIndex}
            </span>{' '}
            / {ML_EVENT_TOTAL} 個節點
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <MainlineTrack
            width={ML_BOX_W}
            height={ML_BOX_H}
            title="一條從零到完成的線，中間四個節點都往終點的方向推進"
            paths={[
              // 還沒走到的路線先用細淡線鋪好，節點才不會飄在空白處
              {
                id: 'rail',
                d: ML_LINE_D,
                tone: 'acid',
                opacity: 0.22,
                width: 2,
              },
              { id: 'main', d: ML_LINE_D, tone: 'acid', progress },
            ]}
            nodes={nodes}
            goal={{
              x: ML_GOAL_X,
              y: ML_LINE_Y,
              tone: 'acid',
              label: '做完了',
            }}
          />
        </div>
      </div>

      {/* 線頭現在走到哪一段 */}
      <div className="rounded-2xl border border-l-[6px] border-acid/55 border-l-acid bg-acid/14 px-8 py-6">
        <p className={`${LABEL_TYPE} leading-[1.2] text-acid`}>{stage.badge}</p>
        <p className="mt-2 text-[26px] leading-snug text-paper">{stage.title}</p>
        <p className="mt-1.5 text-[21px] leading-relaxed text-muted">
          {stage.note}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 21 頁 `three-factors` — 三件會把線帶偏的事（滿版）
 *
 * 互動：三顆大卡＝手動選情況；選中的那一種在軌道上自動循環播放
 * （畫線 3.6s → 停 3.0s → 收回重畫）；右下角的「下一步」把三種串成一輪，
 * 走到 03 之後變成「回到第一種」再繞回 01，不會播完卡死。
 * 切換情況用 key= 重建 TfTrack，不用 setTick(0)。
 *
 * 亮色的調整：選中的大卡與說明卡都補上 6px 不透明左粗條（淡底不單獨承擔
 * 語意）；沒選中的卡用 pl-[29px] 補回左粗條的寬度，切換時文字不會跳。
 * 走偏的終點原本是 danger，改成跟偏離線同一支 coral，畫面維持兩色。
 *
 * 高度：情況大卡列 133 + gap-4 16 + 主體 499 = 648
 *   主體左·軌道面板 border 2 + p-5 40 + svg 412.5 = 454.5 ≤ 499
 *   主體右·欄 470：說明卡 flex-1(423) + gap-4 16 + 按鈕 60 = 499
 * 寬度：1742 − 470 − gap 20 = 1252，扣 p-5 40 + border 2 → svg 可用 1210
 * ══════════════════════════════════════════════════════════════ */

type TfMode = 'random' | 'prompt' | 'resource';

/** 這一頁三種情況各自的強調色，同一時間只亮一種 */
type TfTone = 'teal' | 'coral' | 'blue';

/** 情況標籤、說明卡小標的文字色（淡底 /14、/20 上都 ≥ 4.9:1） */
const TF_TEXT: Record<TfTone, string> = {
  teal: 'text-teal',
  coral: 'text-coral',
  blue: 'text-blue',
};

/** 選中的大卡：強調底 + 實色左粗條 */
const TF_ON: Record<TfTone, string> = {
  teal: 'border-teal/70 border-l-teal bg-teal/20',
  coral: 'border-coral/70 border-l-coral bg-coral/20',
  blue: 'border-blue/70 border-l-blue bg-blue/20',
};

/** 右側說明卡：一般淡底 + 實色左粗條 */
const TF_CARD: Record<TfTone, string> = {
  teal: 'border-teal/55 border-l-teal bg-teal/14',
  coral: 'border-coral/55 border-l-coral bg-coral/14',
  blue: 'border-blue/55 border-l-blue bg-blue/14',
};

interface TfModeInfo {
  key: TfMode;
  tone: TfTone;
  title: string;
  note: string;
  /** 說明卡主文 */
  detail: string;
  /** 說明卡底部的「這條線在畫什麼」小字，幫台下把文字對回圖 */
  lineNote: string;
}

const TF_MODES: TfModeInfo[] = [
  {
    key: 'random',
    tone: 'teal',
    title: 'AI 本來就是隨機的',
    note: '每次產出都不完全一樣',
    detail:
      'AI 是依照前面的內容推論下一句，同樣的問題問兩次，答案也不會一模一樣。這會讓線輕微地晃，但通常還在往終點走。',
    lineNote: '線一路小幅上下晃動，但終點沒有跑掉。',
  },
  {
    key: 'prompt',
    tone: 'coral',
    title: '你給的提示詞',
    note: '指錯方向，線就跟著轉彎',
    detail:
      'AI 會照著你給的方向往下做。方向給錯了，它不會停下來問，只會很有效率地把你帶到錯的地方。',
    lineNote: '虛線是原本要去的地方，實線是 AI 實際帶你去的方向。',
  },
  {
    key: 'resource',
    tone: 'blue',
    title: 'AI 手上的資源',
    note: '資料不夠，線會變得模糊',
    detail:
      '檔案、網路資料、你給的權限，都是讓 AI 看清楚目標的東西。資源不夠時，AI 只能用猜的 —— 線不是偏掉，是同時往好幾個方向散開。',
    lineNote: '沒有一條線是確定的，越往右越散開。',
  },
];

/* ── 路徑（全部照 diagrams-prompt.tsx 的基準座標，width 880 / height 300）── */

/** 小幅抖動的折線：AI 的隨機產出 */
const TF_D_JITTER =
  'M 70 140 L 143 122 L 215 154 L 288 126 L 360 150 L 433 124 L 505 152 L 578 130 L 650 146 L 790 140';

/** 走到第 3 個節點為止的主線（情況 02 用） */
const TF_D_KEPT_3 = 'M 70 140 L 360 140';

/** 「原本要去的地方」鬼影 */
const TF_D_GHOST = 'M 360 140 L 790 140';

/** 從第 3 個節點往下偏的曲線：提示詞給錯 */
const TF_D_DRIFT = 'M 360 140 C 432 142 470 172 528 194 S 688 224 790 236';

/** 走到第 2 個節點為止的主線（情況 03 用） */
const TF_D_KEPT_2 = 'M 70 140 L 215 140';

/** 從第 2 個節點發散成 3 條：資源不足 */
const TF_D_FAN_UP = 'M 215 140 C 360 140 520 110 790 62';
const TF_D_FAN_MID = 'M 215 140 C 360 140 520 140 790 140';
const TF_D_FAN_DOWN = 'M 215 140 C 360 140 520 170 790 218';

/**
 * 鬼影與發散線的透明度。深色原版是 0.32；紙面上 0.32 只剩 1.7:1，
 * 投影時整條會消失，提到 0.42（約 2:1）。這兩種線靠的是虛線形狀，
 * 不是對比，所以不再往上調，免得跟實線搶。
 */
const TF_FAINT_LINE = 0.42;

/* ── 循環播放的節拍 ─────────────────────────────────────── */

const TF_STEP_MS = 300;
/** 12 拍畫完 ≈ 3.6s */
const TF_GROW_TICKS = 12;
/** 一輪 22 拍：畫 12 拍 + 停 10 拍（3.0s），之後收回重畫 */
const TF_CYCLE_TICKS = 22;

/* ── 節點：線頭走到哪裡才長出來 ────────────────────────── */

interface TfMark {
  x: number;
  y: number;
  /** progress 到這個值才掛出這顆節點 */
  at: number;
  label?: string;
}

/** 抖動折線的五個折點（節點要放在折點上，不然會浮在線外） */
const TF_JITTER_MARKS: TfMark[] = [
  { x: 70, y: 140, at: 0 },
  { x: 215, y: 154, at: 0.2 },
  { x: 360, y: 150, at: 0.41, label: '答案不會一樣' },
  { x: 505, y: 152, at: 0.61 },
  { x: 650, y: 146, at: 0.82 },
];

/** 偏離曲線上的三個點，越往右偏得越多 */
const TF_DRIFT_MARKS: TfMark[] = [
  { x: 449, y: 160, at: 0.28 },
  { x: 528, y: 194, at: 0.55 },
  { x: 643, y: 219, at: 0.82 },
];

/**
 * 只有「最後一顆走到的節點」是 active，其餘保持小圓點，
 * 這樣台下的視線會跟著線頭走，而不是看到一整排放大的圈。
 */
function tfMarkNodes(marks: TfMark[], progress: number, tone: TrackTone) {
  const reached = marks.filter((mark) => progress >= mark.at);

  return reached.map<TrackNode>((mark, index) => ({
    x: mark.x,
    y: mark.y,
    tone,
    label: mark.label,
    active: index === reached.length - 1,
  }));
}

interface TfFrame {
  paths: TrackPath[];
  nodes: TrackNode[];
  goal?: MainlineTrackProps['goal'];
  title: string;
}

function tfFrame(mode: TfMode, progress: number): TfFrame {
  if (mode === 'random') {
    return {
      title: '主線變成小幅上下抖動的折線，晃歸晃，最後還是走到終點的旗子',
      paths: [
        {
          id: 'jitter',
          d: TF_D_JITTER,
          tone: 'teal',
          progress,
          // 線還在長的時候就掛箭頭，箭頭會先浮在還沒走到的終點上
          arrow: progress >= 0.995,
        },
      ],
      nodes: tfMarkNodes(TF_JITTER_MARKS, progress, 'teal'),
      goal: { x: 820, y: 140, tone: 'acid', label: '還是走到終點' },
    };
  }

  if (mode === 'prompt') {
    return {
      title:
        '主線走到第三個節點後分成兩條：虛線是原本要去的地方，實線往下偏離到另一個終點',
      paths: [
        { id: 'kept', d: TF_D_KEPT_3, tone: 'acid', progress: 1 },
        {
          id: 'ghost',
          d: TF_D_GHOST,
          tone: 'acid',
          dashed: true,
          opacity: TF_FAINT_LINE,
          width: 3,
        },
        {
          id: 'drift',
          d: TF_D_DRIFT,
          tone: 'coral',
          progress,
          arrow: progress >= 0.995,
        },
      ],
      nodes: [
        { x: 70, y: 140, tone: 'acid' },
        { x: 215, y: 140, tone: 'acid' },
        { x: 360, y: 140, tone: 'coral', label: '你指錯方向', active: true },
        ...tfMarkNodes(TF_DRIFT_MARKS, progress, 'coral'),
        // dim：這是「沒有發生的事」，不能比真正的偏離還亮
        { x: 790, y: 140, tone: 'acid', label: '原本要去的地方', dim: true },
      ],
      goal: { x: 820, y: 236, tone: 'coral', label: '不是你要的東西' },
    };
  }

  return {
    title: '主線走到第二個節點後散成三條虛線，越往右分得越開，終點沒有旗子',
    paths: [
      { id: 'kept', d: TF_D_KEPT_2, tone: 'acid', progress: 1 },
      {
        id: 'fan-up',
        d: TF_D_FAN_UP,
        tone: 'blue',
        progress,
        opacity: TF_FAINT_LINE,
        dashed: true,
      },
      {
        id: 'fan-mid',
        d: TF_D_FAN_MID,
        tone: 'blue',
        progress,
        opacity: TF_FAINT_LINE,
        dashed: true,
      },
      {
        id: 'fan-down',
        d: TF_D_FAN_DOWN,
        tone: 'blue',
        progress,
        opacity: TF_FAINT_LINE,
        dashed: true,
      },
    ],
    nodes: [
      { x: 70, y: 140, tone: 'acid' },
      { x: 215, y: 140, tone: 'blue', label: '資料不夠', active: true },
      // 三條線都畫到底之後才掛終點的空心圓 —— 空心圓＋虛線就是「不確定」
      ...(progress >= 0.9
        ? tfMarkNodes(
            [
              { x: 790, y: 62, at: 0 },
              { x: 790, y: 140, at: 0, label: '只能用猜的' },
              { x: 790, y: 218, at: 0 },
            ],
            0,
            'blue',
          ).map<TrackNode>((node) => ({ ...node, active: false }))
        : []),
    ],
    // 終點是不確定的，所以刻意不畫旗子
  };
}

/* ── 軌道（自己擁有 tick，靠外層的 key= 重建來重置）────── */

function TfTrack({ mode }: { mode: TfMode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setTick((value) => (value + 1) % TF_CYCLE_TICKS),
      TF_STEP_MS,
    );

    return () => clearInterval(timer);
  }, []);

  const progress = Math.min(1, tick / TF_GROW_TICKS);
  const frame = tfFrame(mode, progress);

  return (
    <MainlineTrack
      width={880}
      height={300}
      title={frame.title}
      paths={frame.paths}
      nodes={frame.nodes}
      goal={frame.goal}
    />
  );
}

/**
 * 第 21 頁：同一條線，三種會把它帶偏的情況。
 *
 * 三顆大卡是手動選；選中的那一種在左下的軌道上自動循環播放；
 * 右下角的「下一步」把三種串成一輪，走完會繞回第一種，不會停在死畫面。
 */
export function ThreeFactorsDemo() {
  const [index, setIndex] = useState(0);

  const active = TF_MODES[index];
  const isLast = index === TF_MODES.length - 1;

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-4">
      {/* 情況大卡列 */}
      <div className="grid shrink-0 grid-cols-3 gap-5">
        {TF_MODES.map((item, itemIndex) => {
          const isActive = itemIndex === index;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setIndex(itemIndex)}
              className={`rounded-2xl border py-3.5 pr-6 text-left transition-colors ${
                isActive
                  ? `border-l-[6px] pl-6 ${TF_ON[item.tone]}`
                  : 'border-line-soft bg-panel-lift pl-[29px] hover:border-line'
              }`}
            >
              <span
                className={`${LABEL_TYPE} ${
                  isActive ? TF_TEXT[item.tone] : 'text-faint'
                }`}
              >
                {`情況 0${itemIndex + 1}`}
              </span>
              <p className="mt-1.5 text-[26px] font-semibold text-paper">
                {item.title}
              </p>
              <p className="mt-1 text-[19px] text-muted">{item.note}</p>
            </button>
          );
        })}
      </div>

      {/* 主體：左邊軌道、右邊說明卡 + 下一步 */}
      <div className="flex min-h-0 flex-1 gap-5">
        {/* 面板不加 items-center，讓內層拿到確定高度，max-h-full 才算得出來 */}
        <div className="flex min-w-0 flex-1 rounded-2xl border border-line bg-ink-soft p-5">
          <div className="flex min-h-0 flex-1 items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-full">
            {/* key= 換情況時整棵子樹重建，計時器一定會被 cleanup 掉 */}
            <TfTrack key={active.key} mode={active.key} />
          </div>
        </div>

        <div className="flex w-[470px] shrink-0 flex-col gap-4">
          <div
            className={`flex min-h-0 flex-1 flex-col rounded-2xl border border-l-[6px] px-6 py-5 ${
              TF_CARD[active.tone]
            }`}
          >
            <p className={`${LABEL_TYPE} ${TF_TEXT[active.tone]}`}>
              {`情況 0${index + 1}`}
            </p>
            <p className="mt-3 text-[23px] leading-relaxed text-paper">
              {active.detail}
            </p>
            <p className="mt-auto border-t border-line pt-4 text-[19px] leading-relaxed text-muted">
              {active.lineNote}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % TF_MODES.length)}
            className="flex h-[60px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-acid bg-acid text-[22px] text-on-accent transition-opacity hover:opacity-90"
          >
            <span className="font-semibold">
              {isLast ? '回到第一種' : '下一步'}
            </span>
            <span className="font-mono text-[19px] tabular-nums">
              {`0${index + 1} / 03`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 22、23 頁共用：提示詞與它的標記
 *
 * 一段提示詞拆成「段落 → 區塊 → 行」三層：
 *   段落之間是原文的空行；區塊是同一個標記連續的幾行；
 *   每個區塊左邊一條 6px 粗條 + 序號徽章 + 名稱，標出它屬於哪一件事。
 *
 * 三件事全部用 acid，靠序號 1／2／3 區分（投影機去飽和之後，
 * 三個相近的油墨色會塌成一支，序號不會）。只有第 23 頁的
 * 「延伸技巧」用 teal 的「＋」—— 它不是三件事之一，是在三件事之上加的條件。
 *
 * 複製出去的文字由同一份資料組回來（promptText），保證跟畫面上逐字一致。
 * ══════════════════════════════════════════════════════════════ */

type ThreeMark = 'describe' | 'info' | 'scope';
type PromptMark = ThreeMark | 'extra';

interface PromptMarkInfo {
  badge: string;
  name: string;
  /** 實心徽章底色，上面只放 text-on-accent */
  badgeClass: string;
  /** 區塊左粗條的顏色 */
  barClass: string;
}

const PROMPT_MARKS: Record<PromptMark, PromptMarkInfo> = {
  describe: {
    badge: '1',
    name: '描述',
    badgeClass: 'bg-acid',
    barClass: 'border-l-acid',
  },
  info: {
    badge: '2',
    name: '資訊',
    badgeClass: 'bg-acid',
    barClass: 'border-l-acid',
  },
  scope: {
    badge: '3',
    name: '範圍',
    badgeClass: 'bg-acid',
    barClass: 'border-l-acid',
  },
  extra: {
    badge: '+',
    name: '延伸技巧',
    badgeClass: 'bg-teal',
    barClass: 'border-l-teal',
  },
};

const THREE_MARKS: readonly ThreeMark[] = ['describe', 'info', 'scope'];

interface PromptBlock {
  mark: PromptMark;
  lines: readonly string[];
}

/** 一個段落是幾個相鄰的區塊，段落之間在原文裡是一行空白 */
type PromptParagraph = readonly PromptBlock[];

/** 提示詞裡代表附件的字樣，畫面上做成一顆小膠囊 */
const ATTACH_TOKEN = '@素材';

/** 三段範例共用的頭尾兩段 */
const P_DESCRIBE: PromptParagraph = [
  { mark: 'describe', lines: ['我想要製作個人介紹網站'] },
];
const P_SCOPE: PromptParagraph = [
  { mark: 'scope', lines: ['請僅使用 HTML、CSS、JS 來完成它'] },
];

/** 簡單起手（第 22 頁也用這一段） */
const PROMPT_SIMPLE: readonly PromptParagraph[] = [
  P_DESCRIBE,
  [
    {
      mark: 'info',
      lines: [
        '附件中的 @素材 是我的相關資料',
        '請依據我的個人特質，幫我製作個人網站',
      ],
    },
  ],
  P_SCOPE,
];

/** 明確描述 */
const PROMPT_DETAILED: readonly PromptParagraph[] = [
  P_DESCRIBE,
  [
    { mark: 'info', lines: ['附件中的 @素材 是我的相關資料'] },
    {
      mark: 'extra',
      lines: [
        '其他條件如下：',
        '- 畫面上至少要有6個區塊',
        '- 必要時，你可以生成圖片，來增加網站豐富度',
        '- 網站上可以加入一些動態，例如滾動時持續有動態效果加入',
      ],
    },
  ],
  P_SCOPE,
];

/** 先討論、再開始 */
const PROMPT_DISCUSS: readonly PromptParagraph[] = [
  P_DESCRIBE,
  [
    {
      mark: 'info',
      lines: [
        '附件中的 @素材 是我的相關資料',
        '我不是很確認應該有什麼內容',
        '請你給予相關建議',
      ],
    },
  ],
  P_SCOPE,
];

/** 組回純文字：段內換行、段落之間空一行，跟原文逐字一致 */
function promptText(paragraphs: readonly PromptParagraph[]) {
  return paragraphs
    .map((paragraph) => paragraph.flatMap((block) => block.lines).join('\n'))
    .join('\n\n');
}

/** 「@素材」膠囊。它代表你附上的檔案，不是要照打的字 */
function AttachChip() {
  return (
    <span className="rounded-md border border-line bg-panel px-2 py-0.5 font-semibold text-paper">
      {ATTACH_TOKEN}
    </span>
  );
}

function PromptLine({ text }: { text: string }) {
  const parts = text.split(ATTACH_TOKEN);

  return (
    <p className="text-[26px] leading-[42px] text-paper">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <AttachChip />}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

/** 實心序號徽章。第 22 頁的開關卡與提示詞左欄共用 */
function MarkBadge({
  mark,
  size = 'sm',
}: {
  mark: PromptMark;
  size?: 'sm' | 'lg';
}) {
  const info = PROMPT_MARKS[mark];
  const sizeClass =
    size === 'lg' ? 'size-12 text-[26px]' : 'size-8 text-[19px]';

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-display leading-none text-on-accent ${sizeClass} ${info.badgeClass}`}
    >
      {info.badge}
    </span>
  );
}

/**
 * 一個區塊：左粗條 + 序號與名稱 + 這幾行字。
 * 左欄加 select-none：複製失敗改成手動選取時，選到的只會是提示詞本身。
 */
function MarkedBlock({ block }: { block: PromptBlock }) {
  const info = PROMPT_MARKS[block.mark];

  return (
    <div
      className={`grid grid-cols-[148px_minmax(0,1fr)] border-l-[6px] pl-5 ${info.barClass}`}
    >
      <div className="flex h-[42px] items-center gap-2.5 select-none">
        <MarkBadge mark={block.mark} />
        <span className="text-[19px] text-muted">{info.name}</span>
      </div>
      <div>
        {block.lines.map((line) => (
          <PromptLine key={line} text={line} />
        ))}
      </div>
    </div>
  );
}

/** 整段提示詞。段落之間 22px 代表原文的空行，同段的區塊只隔 6px */
function PromptLines({
  paragraphs,
}: {
  paragraphs: readonly PromptParagraph[];
}) {
  return (
    <div className="flex flex-col gap-[22px]">
      {paragraphs.map((paragraph) => (
        <div
          key={paragraph.map((block) => block.lines[0]).join('|')}
          className="flex flex-col gap-1.5"
        >
          {paragraph.map((block) => (
            <MarkedBlock key={block.lines[0]} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 22 頁 `prompt-three` — 一次給足的三件事
 *
 * 左邊三張可以開關的卡（描述／資訊／範圍），右邊是用第 23 頁
 * 「簡單起手」那段組出來的提示詞。三段剛好對應三件事：
 *   第一段  我想要製作個人介紹網站                 → 1 描述
 *   第二段  附件中的 @素材… / 請依據我的個人特質… → 2 資訊（有哪些資源、想要做什麼）
 *   第三段  請僅使用 HTML、CSS、JS 來完成它        → 3 範圍
 *
 * 關掉一件事，那幾行從提示詞裡消失（不掛，不是淡掉），右下角列出
 * 「AI 得自己猜」的內容；三件都開的時候換成一句收束，帶到下一頁。
 * 「少了描述」會看資訊那段還在不在：還在的話 AI 看得到「個人網站」四個字，
 * 猜的範圍比較小，兩種情況的說法不一樣。
 *
 * 純手動，沒有計時器。
 *
 * 高度：700 = 左欄 標題列 36 + gap 16 + 三張卡 (616 − 32) / 3 ≈ 195
 *            右欄 提示詞框 320 + gap 20 + 結果卡 flex-1 360
 * 寬度：1740 = 左欄 620 + gap 24 + 右欄 1096
 * ══════════════════════════════════════════════════════════════ */

interface PtItem {
  mark: ThreeMark;
  title: string;
  note: string;
}

const PT_ITEMS: readonly PtItem[] = [
  {
    mark: 'describe',
    title: '描述你要做什麼',
    note: '你要做什麼樣的東西，例如個人介紹網站。',
  },
  {
    mark: 'info',
    title: '給予充足的資訊',
    note: '你有哪些資源、你想要做什麼。',
  },
  {
    mark: 'scope',
    title: '限制範圍',
    note: '你要用什麼方式開發，例如只用 HTML、CSS、JS。',
  },
];

type PtState = Record<ThreeMark, boolean>;

/** 少了某一件事時，AI 要自己猜的內容。一行放得下（約 45 字以內） */
function ptGuess(mark: ThreeMark, on: PtState): string {
  if (mark === 'describe') {
    return on.info
      ? '只看到「個人網站」四個字，要做成自我介紹、作品集還是部落格，只能自己挑。'
      : '不知道要做哪一種網站，只能自己挑一個方向。';
  }
  if (mark === 'info') {
    return '沒有你的資料，姓名、經歷、照片都只能先用假資料填上。';
  }
  return '可能直接用它習慣的框架與建置工具，你的電腦就得先裝更多東西。';
}

/** 開關的外觀。狀態由外層的 button 負責（aria-pressed），這裡只畫圖 */
function PtSwitch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-[34px] w-[64px] shrink-0 rounded-full border transition-colors ${
        on ? 'border-acid bg-acid' : 'border-line bg-ink-soft'
      }`}
    >
      <span
        className={`absolute top-[3px] size-[26px] rounded-full transition-[left] duration-200 ${
          on ? 'left-[32px] bg-on-accent' : 'left-[3px] bg-faint'
        }`}
      />
    </span>
  );
}

export function PromptThreeDemo() {
  const [on, setOn] = useState<PtState>({
    describe: true,
    info: true,
    scope: true,
  });

  const toggle = (mark: ThreeMark) =>
    setOn((prev) => ({ ...prev, [mark]: !prev[mark] }));

  const given = THREE_MARKS.filter((mark) => on[mark]);
  const missing = THREE_MARKS.filter((mark) => !on[mark]);

  // 關掉的那件事整塊拿掉；拿完變空的段落也一起拿掉，才不會留下多餘的空行
  const visible = PROMPT_SIMPLE.map((paragraph) =>
    paragraph.filter((block) => block.mark !== 'extra' && on[block.mark]),
  ).filter((paragraph) => paragraph.length > 0);

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] gap-6">
      {/* 左欄：三張開關卡 */}
      <div className="flex w-[620px] shrink-0 flex-col gap-4">
        <div className="flex h-[36px] shrink-0 items-center justify-between">
          <p className="text-[19px] text-muted">點一張卡，把那一件事拿掉</p>
          <p className="text-[19px] text-muted">
            給了{' '}
            <span className="font-display text-[26px] text-acid tabular-nums">
              {given.length}
            </span>{' '}
            / 3 件
          </p>
        </div>

        {PT_ITEMS.map((item) => {
          const isOn = on[item.mark];

          return (
            <button
              key={item.mark}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(item.mark)}
              className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border py-5 pr-6 text-left transition-colors ${
                isOn
                  ? 'border-l-[6px] border-acid/55 border-l-acid bg-acid/14 pl-6'
                  : 'border-dashed border-line bg-panel pl-[29px] hover:border-muted'
              }`}
            >
              {isOn ? (
                <MarkBadge mark={item.mark} size="lg" />
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-line font-display text-[26px] leading-none text-faint">
                  {PROMPT_MARKS[item.mark].badge}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[28px] leading-tight font-semibold ${
                    isOn ? 'text-paper' : 'text-muted'
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-2 text-[20px] leading-snug text-muted">
                  {item.note}
                </p>
              </div>

              <div className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
                <PtSwitch on={isOn} />
                <span className="text-[16px] text-faint">
                  {isOn ? '有給' : '拿掉了'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 右欄：組出來的提示詞 + AI 得自己猜什麼 */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex h-[320px] shrink-0 flex-col rounded-2xl border border-line bg-ink-soft">
          <div className="flex h-[52px] shrink-0 items-center border-b border-line-soft px-6">
            <p className={LABEL_FAINT}>組出來的提示詞</p>
          </div>
          <div className="min-h-0 flex-1 px-6 py-5">
            {visible.length > 0 ? (
              <PromptLines paragraphs={visible} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[22px] text-faint">
                  輸入框是空的，AI 什麼都不知道。
                </p>
              </div>
            )}
          </div>
        </div>

        {missing.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-l-[6px] border-coral/55 border-l-coral bg-coral/14 px-7 py-6">
            <p className={`${LABEL_TYPE} text-coral`}>AI 得自己猜</p>
            <ul className="mt-4 flex flex-col gap-4">
              {missing.map((mark) => (
                <li key={mark} className="flex items-start gap-4">
                  <span className="mt-[1px] grid size-8 shrink-0 place-items-center rounded-full border-2 border-coral font-display text-[19px] leading-none text-coral">
                    {PROMPT_MARKS[mark].badge}
                  </span>
                  <p className="text-[21px] leading-[32px] text-paper">
                    <span className="font-semibold">
                      少了{PROMPT_MARKS[mark].name}：
                    </span>
                    {ptGuess(mark, on)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-center rounded-2xl border border-l-[6px] border-acid/55 border-l-acid bg-acid/14 px-7 py-6">
            <p className={`${LABEL_TYPE} text-acid`}>三件事都給了</p>
            <p className="mt-3 text-[26px] leading-relaxed text-paper">
              AI 知道要做什麼、手上有你的資料，也知道只能用 HTML、CSS、JS。
            </p>
            <p className="mt-2 text-[21px] leading-relaxed text-muted">
              它不用猜，第一版就會接近你要的樣子。下一頁看三種寫法，照你的狀況挑一種。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 23 頁 `prompt-examples` — 三種寫法，照你的狀況挑
 *
 * 三個分頁：簡單起手／明確描述／先討論、再開始。提示詞逐字照課綱原文，
 * 用第 22 頁同一套標記（1 描述、2 資訊、3 範圍）；「明確描述」裡的
 * 條件標成 teal 的「＋ 延伸技巧」。
 *
 * 複製：先試 navigator.clipboard.writeText；不能用（非 https、權限被擋）
 * 就退回暫時的 textarea + execCommand('copy')；兩條都失敗才把提示詞文字
 * 選取起來，請講者自己按 ⌘C。左欄的標記是 select-none，選到的只有提示詞。
 * 按下後的狀態 1.8 秒（手動選取 4 秒）後自動回到「複製提示詞」。
 *
 * 分頁選中用深色小色塊（bg-paper + text-on-accent），不佔強調色；
 * 這一頁的兩個強調色是 acid（三件事）與 teal（延伸技巧、已複製）。
 *
 * 高度：700 = 分頁列 84 + gap 20 + 主體 596
 *   左·提示詞框：標題列 68 + 內容（明確描述最長）42 + 22 + 216 + 22 + 42 + py 48 ≈ 460
 *   右·三張卡 ≈ 190 + 170 + 130 + gap 32，多的留給第一張卡
 * 寬度：1740 = 提示詞框 1136 + gap 24 + 右欄 580
 * ══════════════════════════════════════════════════════════════ */

type PeKey = 'simple' | 'detailed' | 'discuss';

interface PeExample {
  key: PeKey;
  tab: string;
  /** 適合什麼時候用 */
  when: string;
  /** 送出之後會發生什麼 */
  after: string;
  paragraphs: readonly PromptParagraph[];
}

const PE_EXAMPLES: readonly PeExample[] = [
  {
    key: 'simple',
    tab: '簡單起手',
    when: '手上已經有素材，想先看 AI 做出第一版，再一步一步調整。',
    after: 'AI 讀完你的素材，自己決定版面與內容，直接做出第一版網站。',
    paragraphs: PROMPT_SIMPLE,
  },
  {
    key: 'detailed',
    tab: '明確描述',
    when: '心裡已經有畫面：要幾個區塊、要不要圖片、要不要動態，一次列清楚。',
    after:
      'AI 照條件做：至少六個區塊、需要時自己生成圖片、捲動時加上動態效果。',
    paragraphs: PROMPT_DETAILED,
  },
  {
    key: 'discuss',
    tab: '先討論、再開始',
    when: '還不確定網站該放哪些內容，想先聽聽建議再決定。',
    after: 'AI 會先回一份內容建議。你挑好、補上想法之後，再請它開始做。',
    paragraphs: PROMPT_DISCUSS,
  },
];

type CopyState = 'idle' | 'copied' | 'manual';

/** 舊瀏覽器與非 https 環境的退路：暫時放一個 textarea 再用 execCommand 複製 */
function legacyCopy(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  document.body.removeChild(area);
  return copied;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 權限被擋或文件沒有焦點，改走下面的退路
    }
  }
  return legacyCopy(text);
}

const COPY_LABEL: Record<CopyState, string> = {
  idle: '複製提示詞',
  copied: '已複製',
  manual: '已選取，請按 ⌘C／Ctrl+C',
};

const COPY_SKIN: Record<CopyState, string> = {
  idle: 'border-line bg-panel text-paper hover:border-muted',
  copied: 'border-teal bg-teal text-on-accent',
  manual: 'border-paper bg-paper text-on-accent',
};

export function PromptExamplesDemo() {
  const [index, setIndex] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const bodyRef = useRef<HTMLDivElement>(null);

  const example = PE_EXAMPLES[index];

  // 「已複製」只亮一下就回到原本的按鈕
  useEffect(() => {
    if (copyState === 'idle') return;

    const timer = window.setTimeout(
      () => setCopyState('idle'),
      copyState === 'copied' ? 1800 : 4000,
    );
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const selectTab = (next: number) => {
    setIndex(next);
    setCopyState('idle');
  };

  const handleCopy = async () => {
    const copied = await copyToClipboard(promptText(example.paragraphs));
    if (copied) {
      setCopyState('copied');
      return;
    }

    // 兩條路都失敗：把提示詞選取起來，讓講者自己按 ⌘C
    const body = bodyRef.current;
    const selection = window.getSelection();
    if (body && selection) {
      selection.selectAllChildren(body);
      setCopyState('manual');
    }
  };

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] flex-col gap-5">
      {/* 分頁列 */}
      <div className="grid h-[84px] shrink-0 grid-cols-3 gap-4">
        {PE_EXAMPLES.map((item, itemIndex) => {
          const isActive = itemIndex === index;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectTab(itemIndex)}
              className={`flex flex-col justify-center rounded-2xl border px-6 text-left transition-colors ${
                isActive
                  ? 'border-paper bg-paper text-on-accent'
                  : 'border-line-soft bg-panel-lift text-paper hover:border-line'
              }`}
            >
              <span
                className={`${LABEL_TYPE} ${isActive ? '' : 'text-faint'}`}
              >
                {`寫法 0${itemIndex + 1}`}
              </span>
              <span className="mt-1 text-[26px] leading-tight font-semibold">
                {item.tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* 主體：左邊提示詞、右邊說明 */}
      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-ink-soft">
          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-line-soft px-6">
            <p className={LABEL_FAINT}>{`提示詞 · ${example.tab}`}</p>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className={`h-[46px] rounded-xl border px-5 text-[19px] font-semibold transition-colors ${
                COPY_SKIN[copyState]
              }`}
            >
              {COPY_LABEL[copyState]}
            </button>
          </div>
          <div ref={bodyRef} className="min-h-0 flex-1 px-6 py-6">
            <PromptLines paragraphs={example.paragraphs} />
          </div>
        </div>

        <div className="flex w-[580px] shrink-0 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-panel-lift px-7 py-6">
            <p className={LABEL_FAINT}>適合什麼時候用</p>
            <p className="mt-3 text-[26px] leading-relaxed text-paper">
              {example.when}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-line bg-panel-lift px-7 py-6">
            <p className={LABEL_FAINT}>送出之後</p>
            <p className="mt-3 text-[22px] leading-relaxed text-paper">
              {example.after}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-line bg-panel-lift px-6 py-5">
            <p className="text-[21px] leading-[1.9] text-paper">
              <AttachChip /> 是你附上的檔案，例如履歷、照片、作品集。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
