import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 協作進階〉— 第六章 近期的分享：本地算力
 *
 *   第 44 頁  LocalComputeDemo   本地算力運用（整份簡報的最後一頁）
 *
 * Notion 原文（「1013 修改」→ 加入「近期的分享」）：
 *   「本地算力運用：主要提到，目前來說的話，做大語言模型本地端的算力其實有很多的玩法。
 *    那最近的話，我有試著使用本地算力去建立大量的音訊，然後來作為英語學習網站所需的
 *    模擬真人聲音。https://www.pocketool.app/vocab/zh-tw/」
 *   Notion 另有一句是給研究用的，指向講師的私人專案，學員打不開，畫面與註解都不放。
 *
 * 跟前後頁的關係：
 *   第 43 頁（開發流程：哪些在 GitHub、哪些在 Claude）講人、Claude Code 與 GitHub
 *   怎麼分工；這一頁換個方向，講在自己電腦上跑 AI 模型。原本的最後一頁「重點回顧」
 *   已在 1013 修改移除，所以這一頁就是最後一頁，沒有再做收尾卡。
 *
 * 用詞：Notion 寫「大語言模型本地端的算力」，但講師這個例子實際在本機跑的是
 *   語音模型（TTS 念出來、ASR 聽寫檢查），沒有本地的文字 LLM。畫面上一律寫
 *   「本地 AI 模型」「本地算力」，第 01 項標題列另有一枚「這次跑的是語音模型」；
 *   引用講師原句的地方照原句。
 *
 * 版型同第 36、39 頁：「左邊是選項，右邊是情境」。
 *   左  四個重點（MenuItem）＋ 最下面一張連到網站的連結卡（新分頁）。
 *   右  情境卡，用選項 id 當 key 重新掛載；標題列 ＋ 播放器（usePlayer）。
 *     01 本地算力有很多玩法  講師原句 ＋ 情境圖：要念的文字 → 本機模型 → 網站音檔／影片音軌
 *     02 聲音怎麼來          文字描述 → 候選參考音挑一個 → 每一句都複製同一個聲音
 *     03 一句話的生產線      英文、中文 × 2 seed → Whisper 錯誤率 → 挑一版／補做 → 人耳
 *                            ＋ 計算器：加減句數，看一集的純模型時間
 *     04 為什麼用本地        三個理由 ＋ 三個代價（逐張亮起）＋ 跑在哪台機器
 *
 * ──────────────────────────────────────────────────────────────
 * 事實依據（2026-10-13 查的）
 * ──────────────────────────────────────────────────────────────
 * 網站 · https://www.pocketool.app/vocab/zh-tw/
 *   - <title>口袋單字王</title>；meta description：「口袋單字王：用遊戲學多益單字和片語。
 *     每個字都有高音質發音，例句由 9 位角色配音，也能放慢聽…」
 * 網站的音檔索引 · https://www.pocketool.app/vocab/data/audio-index.json
 *   - {"counts":{"words":3640,"examples":7426,"stories":525,"files":15231}}
 *     → 畫面上的「15,231 個音檔：單字 3,640、例句 7,426、故事句 525」。
 * 模型與授權（Hugging Face API 的 license 標籤）
 *   - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base         license:apache-2.0
 *   - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign  license:apache-2.0
 *   - https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-Base-8bit  license:apache-2.0
 *     （實際錄音用的是這個 MLX 8-bit 版）
 *   - https://huggingface.co/hexgrad/Kokoro-82M                   license:apache-2.0
 *   - https://huggingface.co/openai/whisper-large-v3-turbo        license:mit
 *     （本機用的是 mlx-whisper 載入的 large-v3-turbo）
 *   以上五個 license 標籤，審稿時（2026-10-13）用 https://huggingface.co/api/models/<id>
 *   再查過一次，結果相同。
 * 講師的專案文件（私人專案，只引原文，不寫出處路徑）
 *   - 硬體：「M4 Max、64 GB、macOS 26，沒有 NVIDIA GPU。第二輪的三個模型都用 MLX 8-bit 跑。」
 *   - 合成聲：「所有聲音都是合成的。參考聲音全部由聲音設計模型依英文描述產生，
 *     沒有使用任何真人錄音。」影片頻道規則：「英文用網站英文配音的同一組聲音，
 *     中文用台灣腔參考音…都不加情緒。」中文參考音的音色取自角色原本的英文參考音。
 *   - 先設計再複製：「（Qwen3 聲音設計直念）…每句像不同的人。（聲音複製）每句是同一個人」。
 *     參考音有幾個候選，最後挑一個定案。
 *   - 2 個 seed：「每句英文、中文各錄 2 個 seed，用 Whisper 錯誤率挑；挑到的還有錯時補做
 *     （英文換 seed，中文先改送簡體字、再換 seed）。」
 *   - 破音字：「Whisper 聽不出破音字念錯（例如「還」念成 huán 也會轉寫成「還」），
 *     最後還是要用耳朵聽。」
 *   - 速度（MacBook M4 Max 實測）：英文每段生成中位數 1.34 秒、音訊中位數 5.12 秒，
 *     RTF 0.26（約 3.8 倍即時）→ 畫面寫「約 5 秒的音訊，生成約 1.3 秒」。
 *   - 一集的實際量：148 句，含補做共 963 個候選音檔，純模型時間約 0.33 小時（約 20 分鐘）。
 *   - 長片：11 集，音軌合計約 585 分鐘（約 9.75 小時），每集 143–150 句（截至 10-13）。
 *   - 記憶體：錄音的峰值約 4–8 GB；守門程式超過門檻就先中止。
 *   - 降溫：起因是「夜間錄音 Mac 太燙」；做法「一次只跑一個模型、低優先權、每筆之間休息」，
 *     錄音排在晚上。
 *   - 採用本地的理由：「角色聲線一致」「費用為零」「輸出可以重現」
 *     （「例句、台詞、故事配音做下去，本地仍是 0」「不受雲端改版影響」）。
 *     「可以重現」的根據：錄音用的模型固定在特定 revision、seed 固定是 42 與 7
 *     → 04 那張卡寫「模型版本和 seed 都固定」，不寫「輸出由輸入決定」
 *     （原文是「key 由輸入決定」，講的是檔名，不是聲音）。
 *
 * 審稿時收窄的說法（避免畫面說得比事實大）：
 *   - 網站的音檔不只出自一個引擎。畫面只列授權明確的 Qwen3-TTS、Kokoro，後面加「等」；
 *     「約 5 秒的音訊，生成約 1.3 秒」是 Qwen3-TTS 的實測，01 那格寫明是 Qwen3-TTS。
 *   - 候選參考音不只出自一個聲音設計模型（影片角色定案的那一個是 Qwen3-TTS VoiceDesign
 *     做的），所以 02 寫「聲音設計模型，例如 Qwen3-TTS VoiceDesign」。
 *   - 用 Qwen3-TTS Base 照參考音複製的是影片的錄音，02 寫「影片的錄音用…」。
 *   - 不是每個模型都跑 MLX 8-bit：01 寫「主要用 MLX 跑」，04 寫「Qwen3-TTS 用 MLX 8-bit 跑」。
 *   - 速度與記憶體是在這台 MacBook 量的；影片後面幾集改到另一台 Mac 錄（規格文件沒寫），
 *     所以 04 最下面那條叫「實測機器」，不說全部都在這台跑。
 *
 * 研究資料裡還有各引擎的檔案數、其他試過的引擎與雲端服務、上傳與備份的做法，
 * 這一頁刻意不放：只講這個例子在做什麼，不講內部的取捨細節。
 *
 * ──────────────────────────────────────────────────────────────
 * 哪些是補的示意（為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   01  「要念的文字」四格（單字、例句、故事句、影片台詞）是照網站的三類音檔加上影片歸納的。
 *       兩張成果卡裡的「✓ 本機生成」是把「全部本機生成」放在卡上。
 *   02  角色描述那四行英文、三句例句、「候選 a／b／c」的字母。候選有幾個、挑哪一個是示意，
 *       「有幾個候選、挑一個定案」這件事是真的。
 *   03  「I haven't had breakfast yet.／我還沒吃早餐。」這句台詞、四個錯誤率
 *       （0%、20%、17%、17%，依字數算得出來）、「中文兩版都有錯 → 改送簡體字 → 0%」的劇情。
 *       計算器：句數 × 2 語 × 2 seed × 1.3 秒，是用英文每段的中位數估第一輪的純模型時間，
 *       中文段落的長度沒有另外量；下面那行「實際一集 148 句 …約 20 分鐘」是實測，
 *       差的部分就是補做與重錄。
 *   04  六張卡的說明是把專案文件的原句改寫成短句；圖示是裝飾。
 *   波形都是用公式畫的裝飾，不是真的音訊。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選單選取、情境圖裡目前這一步（節點、箭頭、狀態列的 ›）、04 目前這一張卡。
 *   teal  完成／通過：成果卡生成好了、定案的參考音、Whisper 挑中的那一版、
 *         「每一句都是同一個人」、04 的三個理由。
 *   錯誤率、代價、「兩版都有錯」一律中性色（不開 coral）；網站連結卡也是中性的 LINK 樣式。
 *   淡底（/14、/10）一律配實色邊框或 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬：左欄 540 ＋ gap 32 ＋ 右欄 1168（卡片內寬 1168 − 2 − 64 ＝ 1102，SVG 一律 1102 寬 1:1）。
 * 左：標籤 26 ＋ 16 ＋ 四張選單 flex-1 ＋ 16 ＋ 連結卡 122
 *     → 選單 (720 − 26 − 16 − 16 − 122 − 3 × 12) ÷ 4 ＝ 126／張；
 *       內容 py 32 ＋ 名稱 35 ＋ 6 ＋ 說明一行 26 ≈ 99。
 *     連結卡內容 標籤 26 ＋ 6 ＋ 站名 33 ＋ 6 ＋ 網址 27 ≈ 98。
 * 右：卡片 py 24 × 2 ＋ 邊框 2 → 內高 670 ＝ 標題列 48 ＋ 16 ＋ 主體 606。
 *   01  原句 122 ＋ 16 ＋ 情境 412 ＋ 16 ＋ 狀態 40 ＝ 606
 *   02  情境 424 ＋ 16 ＋ 狀態 40 ＋ 16 ＋ 對照兩卡 110 ＝ 606
 *   03  情境 388 ＋ 16 ＋ 狀態 40 ＋ 16 ＋ 計算器 146（內容 ≈ 29 ＋ 4 ＋ 45 ＋ 4 ＋ 26 ＝ 108）＝ 606
 *   04  兩欄 470（標籤 26 ＋ 12 ＋ 三張卡 136 × 3 ＋ 12 × 2）＋ 16 ＋ 機器 120 ＝ 606
 *       卡片內容 py 24 ＋ 標題 33 ＋ 6 ＋ 說明兩行 60 ≈ 125。
 * 實測（無頭 Chrome 1920 × 1080）：根容器 y 184–904；選單 126／張、連結卡 122；右卡主體 606
 *   （y 273–879）。四項每一格的 overflow／contrast／childEscape／outOfMain 都是空的，
 *   右卡下緣 y 904、左欄最後一張卡下緣 y 904，跟根容器 720 高對齊。
 * 浮水印在舞台右上（x 1692–1872、y 104–147），根容器從 y 184 開始，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（複製自 demos-trigger-more.tsx，不 import 那個檔案）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

const BTN =
  'h-12 rounded-xl border px-6 text-[20px] transition-colors duration-200 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} border-acid bg-acid font-medium text-on-accent hover:brightness-110 disabled:border-line disabled:bg-ink-soft disabled:font-normal disabled:text-faint`;
const BTN_GHOST = `${BTN} border-line bg-panel text-paper hover:border-acid disabled:border-line-soft disabled:text-faint`;
const BTN_SQUARE =
  'flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-panel text-[26px] leading-none text-paper transition-colors duration-200 hover:border-acid disabled:cursor-not-allowed disabled:border-line-soft disabled:text-faint';

const SVG_TR =
  'transition-[fill,stroke,stroke-width,fill-opacity,opacity] duration-300 ease-out';

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  acid: 'var(--color-acid)',
  teal: 'var(--color-teal)',
} as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** SVG 箭頭。markerUnits 用 userSpaceOnUse，粗細變化時箭頭大小不跟著跳 */
function ArrowMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      {(['muted', 'acid'] as const).map((tone) => (
        <marker
          key={tone}
          id={`${prefix}-${tone}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={14}
          markerHeight={14}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={tone === 'acid' ? C.acid : C.muted} />
        </marker>
      ))}
    </defs>
  );
}

/** 直線箭頭：作用中 acid、平常 muted */
function Arrow({ d, on, prefix }: { d: string; on: boolean; prefix: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={on ? C.acid : C.muted}
      strokeWidth={on ? 3.5 : 2}
      markerEnd={`url(#${prefix}-${on ? 'acid' : 'muted'})`}
      className={SVG_TR}
    />
  );
}

/** 節點的四種狀態：目前這一步（acid）、完成（teal）、平常、還沒有東西（虛線） */
type BoxState = 'on' | 'done' | 'idle' | 'empty';

function boxStyle(state: BoxState) {
  if (state === 'on') {
    return { fill: C.acid, fillOpacity: 0.14, stroke: C.acid, strokeWidth: 3.5 };
  }
  if (state === 'done') {
    return { fill: C.teal, fillOpacity: 0.1, stroke: C.teal, strokeWidth: 3 };
  }
  if (state === 'empty') {
    return { fill: 'none', stroke: C.muted, strokeWidth: 2, strokeDasharray: '7 6' };
  }
  return { fill: C.inkSoft, fillOpacity: 1, stroke: C.line, strokeWidth: 2 };
}

/** 裝飾用的波形：一排直條，高度由 seed 決定（同一個 seed ＝ 同一個聲音的長相）。
 * 兩個頻率都跟著 seed 變，不同 seed 的長相才分得開。 */
function wavePath(x: number, cy: number, w: number, h: number, seed: number, bars: number) {
  const step = w / bars;
  const f1 = 0.55 + ((seed * 37) % 11) * 0.09;
  const f2 = 0.21 + ((seed * 53) % 7) * 0.05;
  const phase = seed * 1.3;
  let d = '';
  for (let i = 0; i < bars; i += 1) {
    const a =
      Math.abs(Math.sin((i + 1) * f1 + phase)) * 0.65 +
      Math.abs(Math.sin((i + 1) * f2 + phase * 0.7)) * 0.35;
    const envelope = Math.sin((Math.PI * (i + 0.5)) / bars);
    const amp = Math.max(0.14, a * (0.35 + 0.65 * envelope));
    const half = (h / 2) * amp;
    const px = x + step * (i + 0.5);
    d += `M${px.toFixed(1)} ${(cy - half).toFixed(1)}V${(cy + half).toFixed(1)}`;
  }
  return d;
}

function Wave({
  x,
  cy,
  w,
  h,
  seed,
  color,
  bars = 20,
  strokeWidth = 4,
}: {
  x: number;
  cy: number;
  w: number;
  h: number;
  seed: number;
  color: string;
  bars?: number;
  strokeWidth?: number;
}) {
  return (
    <path
      d={wavePath(x, cy, w, h, seed, bars)}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={SVG_TR}
    />
  );
}

/* ── 播放器（同第 36 頁的 usePlayer，多一個 live）─────────────
 * tick 從 0 走到 last。mode 只決定「剛掛上去」的樣子：
 *   still  停在最後一格（一進頁面時）
 *   play   從 0 開始自動播（在左欄點了別的選項時）
 * live：這張卡有沒有「播過」。一進頁面停在最後一格時數字直接顯示，
 *       播放或按了下一步之後，數字出現時才從 0 跳上去。
 * 情境卡用選項 id 當 key，換選項就整張重掛，狀態自然歸零。 */

type PlayMode = 'still' | 'play';

function usePlayer(last: number, ms: number, mode: PlayMode) {
  const [tick, setTick] = useState(mode === 'still' ? last : 0);
  const [playing, setPlaying] = useState(mode === 'play');
  const [live, setLive] = useState(mode === 'play');

  const atEnd = tick >= last;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setTick((value) => Math.min(value + 1, last)),
      ms,
    );
    return () => window.clearTimeout(timer);
  }, [running, tick, last, ms]);

  const toggle = () => {
    setLive(true);
    if (atEnd) {
      setTick(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const step = () => {
    setLive(true);
    setPlaying(false);
    setTick((value) => Math.min(value + 1, last));
  };

  const label = running ? '暫停' : atEnd ? '重播' : tick === 0 ? '播放' : '繼續';

  return { tick, atEnd, live, toggle, step, label };
}

type Player = ReturnType<typeof usePlayer>;

function PlayerControls({ player }: { player: Player }) {
  return (
    <div className="ml-auto flex shrink-0 gap-3">
      <button type="button" onClick={player.toggle} className={BTN_PRIMARY}>
        {player.label}
      </button>
      <button
        type="button"
        onClick={player.step}
        disabled={player.atEnd}
        className={BTN_GHOST}
      >
        下一步
      </button>
    </div>
  );
}

/** 數字從 0 跳到 to（約 0.7 秒，先快後慢）。animate 為 false 時直接顯示最後的值 */
const COUNT_FRAMES = 24;

function CountUp({ to, digits = 0, animate }: { to: number; digits?: number; animate: boolean }) {
  const [frame, setFrame] = useState(animate ? 0 : COUNT_FRAMES);

  useEffect(() => {
    if (frame >= COUNT_FRAMES) return;
    const timer = window.setTimeout(() => setFrame((value) => value + 1), 30);
    return () => window.clearTimeout(timer);
  }, [frame]);

  const progress = frame / COUNT_FRAMES;
  const eased = 1 - (1 - progress) ** 3;
  return (
    <>
      {(to * eased).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}
    </>
  );
}

/** 左側選單的一列（同第 39 頁的 MenuItem，撐滿高度、沒有 chips） */
function MenuItem({
  index,
  name,
  sub,
  on,
  onClick,
}: {
  index: number;
  name: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on}
      className={`flex min-h-0 flex-1 items-center gap-5 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
        on
          ? 'border-acid border-l-acid bg-acid/14'
          : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
      }`}
    >
      <span
        className={`${STEP_BADGE} ${
          on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
        }`}
      >
        {pad2(index + 1)}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className={`text-[28px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
          {name}
        </span>
        <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}

/** 情境圖下面那一行：現在發生什麼 */
function StatusLine({ text }: { text: string }) {
  return (
    <p className="flex h-10 shrink-0 items-center gap-2 text-[20px] text-paper">
      <span className="font-semibold text-acid">›</span>
      {text}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 01 · 本地算力有很多玩法
 *
 * tick 0  要念的文字（四格）
 *      1  送進本機的 AI 模型（螢幕亮 acid）
 *      2  網站「口袋單字王」15,231 個音檔（數字從 0 跳上去）
 *      3  情境故事影片：11 集、約 9.75 小時
 *      4  兩張成果卡都標上「✓ 本機生成」
 *
 * 座標（viewBox 1102 × 412，1:1 呈現）：
 *   要念的文字 (2, 30) 248 × 352；四格 x 20 w 212 h 58，y 88／158／228／298
 *   箭頭 256 → 318（y 206）
 *   筆電螢幕 (326, 14) 420 × 300：標題 y 52、分隔線 y 70、
 *     TTS 格 (346, 86) 380 × 112、ASR 格 (346, 212) 380 × 86
 *   底座 y 322–344；機器名 y 376、補充 y 404（置中 x 536）
 *   箭頭 752 → 814（y 107、y 296）
 *   成果卡 x 820 w 280：網站 y 14–200、影片 y 214–400
 * ══════════════════════════════════════════════════════════════ */

const SCRIPT_ROWS: readonly { label: string; site: boolean }[] = [
  { label: '單字', site: true },
  { label: '例句', site: true },
  { label: '故事句', site: true },
  { label: '影片台詞', site: false },
];

function PlaygroundScene({ tick, live }: { tick: number; live: boolean }) {
  const textOn = tick === 0;
  const macOn = tick === 1;
  const siteOn = tick === 2;
  const videoOn = tick === 3;
  const siteShown = tick >= 2;
  const videoShown = tick >= 3;

  const siteState: BoxState = !siteShown ? 'empty' : siteOn ? 'on' : 'done';
  const videoState: BoxState = !videoShown ? 'empty' : videoOn ? 'on' : 'done';

  return (
    <svg width={1102} height={412} viewBox="0 0 1102 412" role="img" className="shrink-0">
      <title>
        要念的文字送進本機的 AI 模型，念出來再聽寫檢查，產出網站「口袋單字王」的 15,231
        個音檔，以及 11 集情境故事影片、約 9.75 小時的音軌
      </title>
      <ArrowMarkers prefix="lc1" />

      {/* 要念的文字 */}
      <rect x={2} y={30} width={248} height={352} rx={18} {...boxStyle(textOn ? 'on' : 'idle')} className={SVG_TR} />
      <text x={24} y={66} fontSize={20} fontWeight={700} fill={textOn ? C.acid : C.paper} className={SVG_TR}>
        要念的文字
      </text>
      {SCRIPT_ROWS.map((row, i) => {
        const y = 88 + i * 70;
        const voiced = row.site ? siteShown : videoShown;
        return (
          <g key={row.label}>
            <rect x={20} y={y} width={212} height={58} rx={12} fill={C.panel} stroke={C.line} strokeWidth={1.5} />
            <text x={38} y={y + 36} fontSize={19} fill={C.paper}>
              {row.label}
            </text>
            {voiced && <Wave x={142} cy={y + 29} w={74} h={26} seed={i + 2} bars={9} strokeWidth={3.5} color={C.muted} />}
          </g>
        );
      })}

      {/* 文字 → 本機 */}
      <Arrow d="M 256 206 L 318 206" on={macOn} prefix="lc1" />

      {/* 筆電螢幕：本地 AI 模型 */}
      <rect x={326} y={14} width={420} height={300} rx={18} {...boxStyle(macOn ? 'on' : 'idle')} className={SVG_TR} />
      <text x={348} y={52} fontSize={21} fontWeight={700} fill={macOn ? C.acid : C.paper} className={SVG_TR}>
        本地 AI 模型
      </text>
      <text x={724} y={52} textAnchor="end" fontSize={17} fill={C.muted}>
        在本機跑
      </text>
      <line x1={326} y1={70} x2={746} y2={70} stroke={C.line} strokeWidth={1.5} />

      <rect x={346} y={86} width={380} height={112} rx={14} fill={C.panel} stroke={C.line} strokeWidth={1.5} />
      <text x={366} y={120} fontSize={20} fontWeight={700} fill={C.paper}>
        念出來 · TTS
      </text>
      <text x={366} y={152} fontSize={18} fill={C.paper} className="font-mono">
        Qwen3-TTS、Kokoro 等
      </text>
      <text x={366} y={184} fontSize={17} fill={C.muted}>
        Qwen3-TTS：約 5 秒的音訊，生成約 1.3 秒
      </text>
      <Wave x={626} cy={126} w={84} h={40} seed={3} bars={10} color={macOn ? C.acid : C.muted} />

      <rect x={346} y={212} width={380} height={86} rx={14} fill={C.panel} stroke={C.line} strokeWidth={1.5} />
      <text x={366} y={246} fontSize={20} fontWeight={700} fill={C.paper}>
        聽寫檢查 · ASR
      </text>
      <text x={366} y={278} fontSize={17} fill={C.paper} className="font-mono">
        Whisper large-v3-turbo
      </text>
      <g stroke={macOn ? C.acid : C.muted} strokeWidth={4} strokeLinecap="round" className={SVG_TR}>
        <path d="M 640 238 L 706 238" />
        <path d="M 640 255 L 692 255" />
        <path d="M 640 272 L 700 272" />
      </g>

      {/* 底座與機器 */}
      <path d="M 300 322 L 772 322 L 754 344 L 318 344 Z" fill={C.inkSoft} stroke={C.muted} strokeWidth={2} />
      <text x={536} y={376} textAnchor="middle" fontSize={21} fontWeight={700} fill={C.paper}>
        開發機 MacBook · M4 Max · 64 GB
      </text>
      <text x={536} y={404} textAnchor="middle" fontSize={17} fill={C.muted}>
        沒有 NVIDIA GPU，主要用 MLX 跑
      </text>

      {/* 本機 → 兩邊的成果 */}
      <Arrow d="M 752 107 L 814 107" on={siteOn} prefix="lc1" />
      <Arrow d="M 752 296 L 814 296" on={videoOn} prefix="lc1" />

      {/* 網站 · 口袋單字王 */}
      <rect x={820} y={14} width={280} height={186} rx={18} {...boxStyle(siteState)} className={SVG_TR} />
      <text x={842} y={46} fontSize={17} fontWeight={600} fill={C.muted}>
        網站 · 口袋單字王
      </text>
      {siteShown ? (
        <>
          <text x={842} y={102} fill={C.paper}>
            <tspan fontSize={46} fontWeight={700} fill={siteOn ? C.acid : C.paper} className="font-display">
              <CountUp to={15231} animate={live} />
            </tspan>
            <tspan dx={8} fontSize={20}>
              個音檔
            </tspan>
          </text>
          <text x={842} y={136} fontSize={17} fill={C.muted}>
            單字 3,640 · 例句 7,426
          </text>
          <text x={842} y={164} fontSize={17} fill={C.muted}>
            故事句 525
          </text>
          {tick >= 3 && (
            <text x={1080} y={164} textAnchor="end" fontSize={17} fontWeight={700} fill={C.teal}>
              ✓ 本機生成
            </text>
          )}
        </>
      ) : (
        <text x={842} y={104} fontSize={20} fill={C.faint}>
          還沒產生
        </text>
      )}

      {/* YouTube · 情境故事影片 */}
      <rect x={820} y={214} width={280} height={186} rx={18} {...boxStyle(videoState)} className={SVG_TR} />
      <text x={842} y={246} fontSize={17} fontWeight={600} fill={C.muted}>
        YouTube · 情境故事影片
      </text>
      {videoShown ? (
        <>
          <text x={842} y={302} fill={C.paper}>
            <tspan fontSize={20}>約</tspan>
            <tspan dx={6} fontSize={46} fontWeight={700} fill={videoOn ? C.acid : C.paper} className="font-display">
              <CountUp to={9.75} digits={2} animate={live} />
            </tspan>
            <tspan dx={8} fontSize={20}>
              小時
            </tspan>
          </text>
          <text x={842} y={336} fontSize={17} fill={C.muted}>
            已錄好 11 集長片的音軌
          </text>
          <text x={842} y={364} fontSize={16} fill={C.faint}>
            截至 2026-10-13
          </text>
          {tick >= 4 && (
            <text x={1080} y={364} textAnchor="end" fontSize={17} fontWeight={700} fill={C.teal}>
              ✓ 本機生成
            </text>
          )}
        </>
      ) : (
        <text x={842} y={304} fontSize={20} fill={C.faint}>
          還沒產生
        </text>
      )}
    </svg>
  );
}

/** 01 上方的講師原句（照 Notion 原文） */
function QuoteCard() {
  return (
    <blockquote className="flex h-[122px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-6">
      <span className={LABEL_FAINT}>最近的嘗試</span>
      <p className="text-[21px] leading-normal text-paper">
        「目前來說的話，做大語言模型本地端的算力其實有很多的玩法。」
      </p>
      <p className="text-[21px] leading-normal text-paper">
        「那最近的話，我有試著使用本地算力去建立大量的音訊，然後來作為英語學習網站所需的模擬真人聲音。」
      </p>
    </blockquote>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 02 · 聲音怎麼來
 *
 * tick 0  一段英文描述角色（年紀、口音、不帶情緒）
 *      1  聲音設計模型照描述生出候選 a／b／c
 *      2  挑一個定案（候選 a 變 teal）
 *      3  每一句都照參考音複製（三句的波形出現，跟候選 a 同一個長相）
 *      4  三句都變 teal：每一句都是同一個人（「✓ 每句都是同一個人」留給下方的對照卡講）
 *
 * 座標（viewBox 1102 × 424，1:1 呈現）：
 *   欄標題 y 22：① x 2、② x 378、③ x 680
 *   ① 描述卡 (2, 40) 316 × 370：說明 y 76、四行 y 114–204、分隔線 y 232、
 *     模型 y 268／300、補充 y 352／380
 *   ② 候選三格 x 378 w 244 h 76，y 52／144／236；下方說明 y 350／378
 *   ③ 三句 x 680 w 420 h 76，y 52／144／236；下方兩行 y 350／378（中文那行 18px 約 396 寬）
 *   箭頭 324 → 372、628 → 674（y 182，三格的中間那一格）
 * ══════════════════════════════════════════════════════════════ */

const VOICE_PROMPT = [
  'A calm, friendly woman',
  'in her thirties.',
  'Clear American accent,',
  'no emotion.',
] as const;

const VOICE_LINES: readonly { text: string; bars: number }[] = [
  { text: 'Good morning, everyone.', bars: 17 },
  { text: 'Could you check the invoice?', bars: 23 },
  { text: 'The meeting starts at nine.', bars: 20 },
];

/** 候選參考音：a 是最後定案的那一個。seed、條數、粗細都不一樣，
 * 三個候選一眼就看得出是不同的人；下面三句照 a 複製，條距跟 a 一樣（208 ÷ 20 ＝ 10.4） */
const CANDIDATES: readonly { letter: string; seed: number; bars: number; stroke: number }[] = [
  { letter: 'a', seed: 5, bars: 20, stroke: 4 },
  { letter: 'b', seed: 11, bars: 13, stroke: 6 },
  { letter: 'c', seed: 17, bars: 28, stroke: 2.5 },
];

const PICKED_SEED = CANDIDATES[0].seed;

function VoiceScene({ tick }: { tick: number }) {
  const promptOn = tick === 0;
  const designOn = tick === 1;
  const picked = tick >= 2;
  const cloneOn = tick === 3;
  const cloned = tick >= 3;
  const same = tick >= 4;

  return (
    <svg width={1102} height={424} viewBox="0 0 1102 424" role="img" className="shrink-0">
      <title>
        先用一段英文描述角色，聲音設計模型生出幾個候選參考音，挑一個定案；之後每一句都照這段參考音複製，每一句都是同一個人
      </title>
      <ArrowMarkers prefix="lc2" />

      {/* 欄標題 */}
      <text x={2} y={22} fontSize={18} fontWeight={600} fill={promptOn ? C.acid : C.muted} className={SVG_TR}>
        ① 用文字描述角色
      </text>
      <text x={378} y={22} fontSize={18} fontWeight={600} fill={designOn || tick === 2 ? C.acid : C.muted} className={SVG_TR}>
        ② 產生參考音
      </text>
      <text x={680} y={22} fontSize={18} fontWeight={600} fill={cloneOn ? C.acid : C.muted} className={SVG_TR}>
        ③ 每一句都複製這個聲音
      </text>

      {/* ① 描述 */}
      <rect x={2} y={40} width={316} height={370} rx={18} {...boxStyle(promptOn ? 'on' : 'idle')} className={SVG_TR} />
      <text x={24} y={76} fontSize={17} fill={C.muted}>
        角色描述（英文）
      </text>
      {VOICE_PROMPT.map((line, i) => (
        <text key={line} x={24} y={114 + i * 30} fontSize={19} fill={C.paper} className="font-mono">
          {line}
        </text>
      ))}
      <line x1={2} y1={232} x2={318} y2={232} stroke={C.line} strokeWidth={1.5} />
      <text x={24} y={268} fontSize={17} fill={C.muted}>
        聲音設計模型，例如
      </text>
      <text
        x={24}
        y={300}
        fontSize={18}
        fontWeight={designOn ? 700 : 400}
        fill={designOn ? C.acid : C.paper}
        className={`font-mono ${SVG_TR}`}
      >
        Qwen3-TTS VoiceDesign
      </text>
      <text x={24} y={352} fontSize={18} fill={C.muted}>
        只靠文字描述，
      </text>
      <text x={24} y={380} fontSize={18} fill={C.muted}>
        不用任何錄音當範本
      </text>

      <Arrow d="M 324 182 L 372 182" on={designOn} prefix="lc2" />

      {/* ② 候選參考音 */}
      {CANDIDATES.map((cand, i) => {
        const y = 52 + i * 92;
        let state: BoxState = 'idle';
        if (tick === 0) state = 'empty';
        else if (designOn) state = 'on';
        else if (i === 0) state = 'done';
        const isPick = picked && i === 0;
        let waveColor: string = C.muted;
        if (designOn) waveColor = C.acid;
        else if (isPick) waveColor = C.teal;
        return (
          <g key={cand.letter}>
            <rect x={378} y={y} width={244} height={76} rx={14} {...boxStyle(state)} className={SVG_TR} />
            <text x={396} y={y + 28} fontSize={17} fill={tick === 0 ? C.faint : C.paper}>
              候選 {cand.letter}
            </text>
            {isPick && (
              <text x={604} y={y + 28} textAnchor="end" fontSize={17} fontWeight={700} fill={C.teal}>
                ✓ 定案
              </text>
            )}
            {tick >= 1 && (
              <Wave
                x={396}
                cy={y + 52}
                w={208}
                h={26}
                seed={cand.seed}
                bars={cand.bars}
                strokeWidth={cand.stroke}
                color={waveColor}
              />
            )}
          </g>
        );
      })}
      <text x={378} y={350} fontSize={18} fill={C.muted}>
        從候選裡挑一個，
      </text>
      <text x={378} y={378} fontSize={18} fill={C.muted}>
        當成角色的參考音
      </text>

      <Arrow d="M 628 182 L 674 182" on={cloneOn} prefix="lc2" />

      {/* ③ 每一句都複製 */}
      {VOICE_LINES.map((line, i) => {
        const y = 52 + i * 92;
        let state: BoxState = 'empty';
        if (cloneOn) state = 'on';
        else if (same) state = 'done';
        return (
          <g key={line.text}>
            <rect x={680} y={y} width={420} height={76} rx={14} {...boxStyle(state)} className={SVG_TR} />
            <text x={700} y={y + 28} fontSize={19} fill={C.paper}>
              {line.text}
            </text>
            {cloned ? (
              <Wave
                x={700}
                cy={y + 52}
                w={line.bars * 10.4}
                h={26}
                seed={PICKED_SEED}
                bars={line.bars}
                color={cloneOn ? C.acid : C.teal}
              />
            ) : (
              <text x={700} y={y + 58} fontSize={16} fill={C.faint}>
                等參考音定案
              </text>
            )}
          </g>
        );
      })}
      <text x={680} y={350} fontSize={18} fill={C.muted}>
        影片的錄音用 Qwen3-TTS Base 照參考音複製
      </text>
      <text x={680} y={378} fontSize={18} fill={C.muted}>
        中文另用同一個音色做台灣腔參考音，再一樣複製
      </text>
    </svg>
  );
}

/** 02 下方對照卡裡的小波形：三句同一個人（同一個 seed）或三句三個人 */
function MiniWaves({ same }: { same: boolean }) {
  const rows = same
    ? [
        { seed: PICKED_SEED, bars: 11 },
        { seed: PICKED_SEED, bars: 11 },
        { seed: PICKED_SEED, bars: 11 },
      ]
    : [
        { seed: 2, bars: 9 },
        { seed: 9, bars: 13 },
        { seed: 14, bars: 7 },
      ];
  return (
    <svg width={124} height={66} viewBox="0 0 124 66" aria-hidden="true" className="shrink-0">
      {rows.map((row, i) => (
        <Wave
          key={i}
          x={2}
          cy={11 + i * 22}
          w={row.bars * 9}
          h={same ? 16 : 10 + i * 4}
          seed={row.seed}
          bars={row.bars}
          strokeWidth={3}
          color={same ? C.teal : C.muted}
        />
      ))}
    </svg>
  );
}

function VoiceCompare() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
      <div className="flex items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-muted bg-panel-lift px-6">
        <MiniWaves same={false} />
        <div className="flex min-w-0 flex-col gap-1">
          <span className={LABEL_FAINT}>每句都直接用聲音設計念</span>
          <span className="text-[22px] leading-snug text-paper">每句聽起來像不同的人</span>
        </div>
      </div>
      <div className="flex items-center gap-5 rounded-2xl border border-line border-l-[6px] border-l-teal bg-panel-lift px-6">
        <MiniWaves same />
        <div className="flex min-w-0 flex-col gap-1">
          <span className={LABEL_FAINT}>先設計、再複製</span>
          <span className="text-[22px] leading-snug font-semibold text-paper">
            <span className="text-teal">✓</span> 每句都是同一個人
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 03 · 一句話的生產線
 *
 * tick 0  一句台詞：英文、中文各一版
 *      1  各跑 2 個 seed（42、7）→ 4 個候選
 *      2  Whisper 轉寫，算錯誤率
 *      3  英文挑 seed 42；中文兩版都有錯
 *      4  補做：中文改送簡體字 → 0%（英文有錯時是換 seed）
 *      5  破音字 Whisper 聽不出來 → 待聽清單，人耳聽（「還」亮起來）
 *
 * 座標（viewBox 1102 × 388，1:1 呈現）：
 *   欄標題 y 20：① x 2、② x 236、③ x 520、④ x 722
 *   ① 英文 (2, 40) 194 × 120、中文 (2, 176) 194 × 120
 *   ② 四格 x 236 w 244 h 56，y 40／104／176／240
 *   ③ 四格 x 520 w 162 h 56（同 y）
 *   ④ 英文 (722, 40) 378 × 120、中文 (722, 176) 378 × 120
 *   ⑤ 待聽清單 (2, 316) 1098 × 70
 *   箭頭 200 → 230、484 → 514、686 → 716
 * ══════════════════════════════════════════════════════════════ */

const PIPE_ROWS: readonly { key: string; seed: number; err: string; y: number; zh: boolean }[] = [
  { key: 'en-42', seed: 42, err: '0%', y: 40, zh: false },
  { key: 'en-7', seed: 7, err: '20%', y: 104, zh: false },
  { key: 'zh-42', seed: 42, err: '17%', y: 176, zh: true },
  { key: 'zh-7', seed: 7, err: '17%', y: 240, zh: true },
];

const PIPE_HEADS: readonly { x: number; text: string; ticks: readonly number[] }[] = [
  { x: 2, text: '① 一句台詞', ticks: [0] },
  { x: 236, text: '② 各跑 2 個 seed', ticks: [1] },
  { x: 520, text: '③ Whisper 檢查', ticks: [2] },
  { x: 722, text: '④ 挑錯誤率最低的', ticks: [3, 4] },
];

function PipelineScene({ tick }: { tick: number }) {
  const hl = tick === 5;

  const enState: BoxState = tick < 3 ? 'empty' : tick === 3 ? 'on' : 'done';
  let zhState: BoxState = 'empty';
  if (tick === 3 || tick === 4) zhState = 'on';
  else if (tick >= 5) zhState = 'done';

  return (
    <svg width={1102} height={388} viewBox="0 0 1102 388" role="img" className="shrink-0">
      <title>
        一句台詞的英文、中文各跑 2 個 seed，Whisper 轉寫後挑錯誤率最低的一版，有錯就補做；破音字
        Whisper 聽不出來，最後進待聽清單用耳朵聽
      </title>
      <ArrowMarkers prefix="lc3" />

      {/* 欄標題 */}
      {PIPE_HEADS.map((head) => {
        const on = head.ticks.includes(tick);
        return (
          <text
            key={head.text}
            x={head.x}
            y={20}
            fontSize={18}
            fontWeight={600}
            fill={on ? C.acid : C.muted}
            className={SVG_TR}
          >
            {head.text}
          </text>
        );
      })}

      {/* ① 一句台詞 */}
      <rect x={2} y={40} width={194} height={120} rx={16} {...boxStyle(tick === 0 ? 'on' : 'idle')} className={SVG_TR} />
      <text x={20} y={68} fontSize={17} fill={C.muted}>
        英文
      </text>
      <text x={20} y={102} fontSize={19} fill={C.paper}>
        I haven’t had
      </text>
      <text x={20} y={130} fontSize={19} fill={C.paper}>
        breakfast yet.
      </text>

      <rect x={2} y={176} width={194} height={120} rx={16} {...boxStyle(tick === 0 ? 'on' : 'idle')} className={SVG_TR} />
      <text x={20} y={204} fontSize={17} fill={C.muted}>
        中文
      </text>
      <text x={20} y={250} fontSize={20} fill={C.paper}>
        我
        <tspan fill={hl ? C.acid : C.paper} fontWeight={hl ? 700 : 400} className={SVG_TR}>
          還
        </tspan>
        沒吃早餐。
      </text>
      {hl && (
        <text x={20} y={280} fontSize={16} fontWeight={600} fill={C.acid}>
          hái？huán？
        </text>
      )}

      <Arrow d="M 200 100 L 230 100" on={tick === 1} prefix="lc3" />
      <Arrow d="M 200 236 L 230 236" on={tick === 1} prefix="lc3" />

      {/* ② 4 個候選 ＋ ③ 錯誤率 */}
      {PIPE_ROWS.map((row) => {
        let candState: BoxState = 'idle';
        if (tick === 0) candState = 'empty';
        else if (tick === 1) candState = 'on';

        let checkState: BoxState = 'idle';
        if (tick < 2) checkState = 'empty';
        else if (tick === 2) checkState = 'on';
        else if (row.key === 'en-42') checkState = 'done';

        const cy = row.y + 28;
        return (
          <g key={row.key}>
            <rect x={236} y={row.y} width={244} height={56} rx={12} {...boxStyle(candState)} className={SVG_TR} />
            <text x={252} y={row.y + 34} fontSize={17} fill={tick === 0 ? C.faint : C.paper} className="font-mono">
              seed {row.seed}
            </text>
            {tick >= 1 && (
              <Wave
                x={344}
                cy={cy}
                w={122}
                h={30}
                seed={row.seed / 6 + (row.zh ? 3 : 0)}
                bars={12}
                strokeWidth={3.5}
                color={tick === 1 ? C.acid : C.muted}
              />
            )}

            <Arrow d={`M 484 ${cy} L 514 ${cy}`} on={tick === 2} prefix="lc3" />

            <rect x={520} y={row.y} width={162} height={56} rx={12} {...boxStyle(checkState)} className={SVG_TR} />
            {tick >= 2 ? (
              <text x={601} y={row.y + 36} textAnchor="middle" fill={C.paper}>
                <tspan fontSize={16} fill={C.muted}>
                  錯誤率
                </tspan>
                <tspan dx={8} fontSize={22} fontWeight={700}>
                  {row.err}
                </tspan>
              </text>
            ) : (
              <text x={601} y={row.y + 34} textAnchor="middle" fontSize={16} fill={C.faint}>
                等轉寫
              </text>
            )}
          </g>
        );
      })}

      <Arrow d="M 686 100 L 716 100" on={tick === 3} prefix="lc3" />
      <Arrow d="M 686 236 L 716 236" on={tick === 3 || tick === 4} prefix="lc3" />

      {/* ④ 英文：挑 seed 42 */}
      <rect x={722} y={40} width={378} height={120} rx={16} {...boxStyle(enState)} className={SVG_TR} />
      {tick >= 3 ? (
        <>
          <text x={744} y={88} fontSize={22} fontWeight={700} fill={C.teal}>
            ✓ 採用 seed 42
          </text>
          <text x={744} y={122} fontSize={18} fill={C.muted}>
            錯誤率 0%，這一版就是成品
          </text>
        </>
      ) : (
        <text x={744} y={106} fontSize={18} fill={C.faint}>
          等檢查結果
        </text>
      )}

      {/* ④ 中文：兩版都有錯 → 補做 */}
      <rect x={722} y={176} width={378} height={120} rx={16} {...boxStyle(zhState)} className={SVG_TR} />
      {tick === 3 && (
        <>
          <text x={744} y={220} fontSize={22} fontWeight={700} fill={C.paper}>
            兩版都有錯（17%）
          </text>
          <text x={744} y={254} fontSize={18} fill={C.muted}>
            挑不出來，要補做
          </text>
        </>
      )}
      {tick >= 4 && (
        <>
          <text x={744} y={214} fontSize={22} fontWeight={700} fill={C.teal}>
            ✓ 補做：改送簡體字
          </text>
          <text x={744} y={246} fontSize={18} fill={C.muted}>
            「我还没吃早餐。」→ 錯誤率 0%
          </text>
          <text x={744} y={278} fontSize={16} fill={C.muted}>
            英文有錯的話，是換 seed 再錄
          </text>
        </>
      )}
      {tick < 3 && (
        <text x={744} y={242} fontSize={18} fill={C.faint}>
          等檢查結果
        </text>
      )}

      {/* ⑤ 待聽清單 */}
      <rect x={2} y={316} width={1098} height={70} rx={16} {...boxStyle(hl ? 'on' : 'idle')} className={SVG_TR} />
      <text x={24} y={358} fontSize={20} fontWeight={700} fill={hl ? C.acid : C.paper} className={SVG_TR}>
        ⑤ 待聽清單
      </text>
      <text x={170} y={358} fontSize={19} fill={C.paper}>
        破音字 Whisper 聽不出來：「還」念成 huán，也會轉寫成「還」
      </text>
      <text x={1078} y={358} textAnchor="end" fontSize={20} fontWeight={700} fill={hl ? C.acid : C.paper} className={SVG_TR}>
        → 最後用耳朵聽
      </text>
    </svg>
  );
}

/* ── 03 下方的計算器：一集要跑多久？ ────────────────────────
 * 句數 × 2 語 × 2 seed ＝ 候選數；× 1.3 秒（英文每段的實測中位數）＝ 純模型時間。
 * 一集 143–150 句，所以預設 150；每按一下 ±50，範圍 50–500。
 * 150 句 → 600 個候選 → 780 秒 ≈ 13 分鐘。實測一集 148 句含補做是 963 個、約 20 分鐘。 */

const LINES_STEP = 50;
const LINES_MIN = 50;
const LINES_MAX = 500;
const SECONDS_PER_TAKE = 1.3;

function EpisodeCalc() {
  const [lines, setLines] = useState(150);
  const takes = lines * 2 * 2;
  const minutes = Math.round((takes * SECONDS_PER_TAKE) / 60);

  return (
    <div className="flex min-h-0 flex-1 items-center gap-8 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-6">
      <div className="flex w-[190px] shrink-0 flex-col gap-1">
        <span className={LABEL_FAINT}>算算看</span>
        <span className="text-[24px] leading-snug font-semibold text-paper">一集要跑多久？</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label={`少 ${LINES_STEP} 句`}
          disabled={lines <= LINES_MIN}
          onClick={() => setLines((value) => Math.max(LINES_MIN, value - LINES_STEP))}
          className={BTN_SQUARE}
        >
          −
        </button>
        <span className="flex w-[124px] items-baseline justify-center gap-1">
          <span className="font-display text-[40px] leading-none font-semibold text-paper">{lines}</span>
          <span className="text-[20px] text-paper">句</span>
        </span>
        <button
          type="button"
          aria-label={`多 ${LINES_STEP} 句`}
          disabled={lines >= LINES_MAX}
          onClick={() => setLines((value) => Math.min(LINES_MAX, value + LINES_STEP))}
          className={BTN_SQUARE}
        >
          +
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[21px] leading-snug text-paper">
          {lines} 句 × 2 語 × 2 seed ＝ {takes.toLocaleString('en-US')} 個候選
        </p>
        <p className="flex items-baseline gap-2 text-[21px] text-paper">
          × 每個約 1.3 秒 ≈
          <span className="text-[30px] font-semibold">{minutes} 分鐘</span>
          <span className="text-[19px] text-muted">純模型時間</span>
        </p>
        <p className="text-[19px] leading-snug text-muted">
          實際一集 148 句：加上補做共 963 個候選，約 20 分鐘
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 04 · 為什麼用本地
 *
 * tick 0–2  三個理由逐張亮起（目前這張 acid，看過的左粗條變 teal）
 *      3–5  三個代價逐張亮起（看過的左粗條變 muted）
 *      6    全部看完，沒有亮起的卡
 * 兩欄各 539 寬：卡片內 539 − 2 − 6 − 40 − 圖示 44 − 16 ≈ 431（20px 約 21 字一行）。
 * ══════════════════════════════════════════════════════════════ */

type IconId = 'same' | 'zero' | 'repeat' | 'heat' | 'night' | 'ear';

interface WhyCard {
  title: string;
  body: string;
  icon: IconId;
}

const WHY_GOOD: readonly WhyCard[] = [
  {
    title: '角色聲線一致',
    body: '單字裡的角色，之後也要念例句和台詞，聲音得是同一個人。',
    icon: 'same',
  },
  {
    title: '費用為零',
    body: '例句、台詞、故事配音越做越多，本地還是 0，只有電費。',
    icon: 'zero',
  },
  {
    title: '輸出可以重現',
    body: '模型版本和 seed 都固定，不會因為雲端改版，聲音就跟著變。',
    icon: 'repeat',
  },
];

const WHY_COST: readonly WhyCard[] = [
  {
    title: '會燙',
    body: '筆電夜間錄音太燙，加了降溫：每筆之間休息、低優先權。',
    icon: 'heat',
  },
  {
    title: '要排隊',
    body: '一次只跑一個模型，錄音排在晚上；記憶體超過門檻就先停。',
    icon: 'night',
  },
  {
    title: '要人把關',
    body: 'Whisper 聽不出破音字，最後還是要人耳聽待聽清單。',
    icon: 'ear',
  },
];

const RIG: readonly { main: string; sub: string }[] = [
  { main: 'M4 Max · 64 GB', sub: '開發機 MacBook' },
  { main: '沒有 NVIDIA GPU', sub: 'Qwen3-TTS 用 MLX 8-bit 跑' },
  { main: '記憶體峰值約 4–8 GB', sub: '錄音時（Qwen3-TTS）' },
];

function zigPath(y: number) {
  return `M4 ${y} L10 ${y - 5} L16 ${y + 5} L22 ${y - 5} L28 ${y + 5} L34 ${y - 5} L40 ${y}`;
}

function WhyIcon({ id, color }: { id: IconId; color: string }) {
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      aria-hidden="true"
      className={`shrink-0 ${SVG_TR}`}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === 'same' && (
        <>
          <path d={zigPath(9)} />
          <path d={zigPath(22)} />
          <path d={zigPath(35)} />
        </>
      )}
      {id === 'zero' && (
        <>
          <circle cx={22} cy={22} r={18} />
          <ellipse cx={22} cy={22} rx={6} ry={9} />
        </>
      )}
      {id === 'repeat' && (
        <>
          <path d="M 8 20 A 14 14 0 0 1 34 14" />
          <path d="M 35 6 L 35 15 L 26 15" />
          <path d="M 36 24 A 14 14 0 0 1 10 30" />
          <path d="M 9 38 L 9 29 L 18 29" />
        </>
      )}
      {id === 'heat' && (
        <>
          <path d="M 17 27 V 9 A 5 5 0 0 1 27 9 V 27" />
          <circle cx={22} cy={33} r={7} />
          <path d="M 22 31 V 15" />
        </>
      )}
      {id === 'night' && (
        <>
          <path d="M 27 6 A 16 16 0 1 0 38 30 A 14 14 0 0 1 27 6 Z" />
          <path d="M 33 9 L 39 9 L 33 16 L 39 16" />
        </>
      )}
      {id === 'ear' && (
        <>
          <path d="M 8 28 V 22 A 14 14 0 0 1 36 22 V 28" />
          <rect x={4} y={26} width={9} height={13} rx={3} />
          <rect x={31} y={26} width={9} height={13} rx={3} />
        </>
      )}
    </svg>
  );
}

type CardState = 'on' | 'done' | 'idle';

function WhyItem({ card, state, good }: { card: WhyCard; state: CardState; good: boolean }) {
  let frame = 'border-line-soft border-l-line bg-panel-lift';
  if (state === 'on') frame = 'border-acid border-l-acid bg-acid/14';
  else if (state === 'done') {
    frame = good
      ? 'border-line-soft border-l-teal bg-panel-lift'
      : 'border-line-soft border-l-muted bg-panel-lift';
  }

  let iconColor: string = C.muted;
  if (state === 'on') iconColor = C.acid;
  else if (good && state === 'done') iconColor = C.teal;

  return (
    <div
      className={`flex min-h-0 flex-1 items-center gap-4 rounded-2xl border border-l-[6px] px-5 py-3 transition-colors duration-200 ${frame}`}
    >
      <WhyIcon id={card.icon} color={iconColor} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-2 text-[26px] leading-tight font-semibold text-paper">
          {good && state === 'done' && <span className="text-teal">✓</span>}
          {card.title}
        </span>
        <span className="text-[20px] leading-normal break-keep text-muted">{card.body}</span>
      </div>
    </div>
  );
}

function WhyBoard({ tick }: { tick: number }) {
  const stateOf = (index: number): CardState => {
    if (index === tick) return 'on';
    if (index < tick) return 'done';
    return 'idle';
  };

  return (
    <>
      <div className="grid h-[470px] shrink-0 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>選本地的三個理由</span>
          {WHY_GOOD.map((card, i) => (
            <WhyItem key={card.title} card={card} state={stateOf(i)} good />
          ))}
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <span className={LABEL_FAINT}>代價，以及怎麼處理</span>
          {WHY_COST.map((card, i) => (
            <WhyItem key={card.title} card={card} state={stateOf(i + WHY_GOOD.length)} good={false} />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-6 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-6">
        <span className={`${LABEL_FAINT} w-[100px] shrink-0`}>實測機器</span>
        <div className="grid min-w-0 flex-1 grid-cols-3">
          {RIG.map((cell, i) => (
            <div
              key={cell.main}
              className={`flex flex-col gap-1 px-6 ${i > 0 ? 'border-l border-line-soft' : ''}`}
            >
              <span className="text-[22px] leading-snug font-semibold whitespace-nowrap text-paper">
                {cell.main}
              </span>
              <span className="text-[18px] leading-snug text-muted">{cell.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 44 頁 · LocalComputeDemo
 * ══════════════════════════════════════════════════════════════ */

type PointId = 'playground' | 'voice' | 'pipeline' | 'why';

interface Point {
  id: PointId;
  /** 左欄選單 */
  name: string;
  sub: string;
  /** 右卡標題列 */
  title: string;
  tag: string;
  /** 情境圖下面那一行，每格一句（04 沒有） */
  status: readonly string[];
  last: number;
  ms: number;
}

const POINTS: readonly Point[] = [
  {
    id: 'playground',
    name: '本地算力有很多玩法',
    sub: '這次的例子：英語學習網站的大量音訊',
    title: '本地算力有很多玩法',
    tag: '這次跑的是語音模型',
    status: [
      '要念的文字：單字、例句、故事句，還有影片台詞',
      '送進本機的 AI 模型：先念出來，再聽寫檢查',
      '網站「口袋單字王」：15,231 個音檔',
      '情境故事影片：已錄好 11 集長片，音軌合計約 9.75 小時',
      '兩邊的聲音全部在本機生成，沒有用雲端的語音服務',
    ],
    last: 4,
    ms: 1300,
  },
  {
    id: 'voice',
    name: '聲音怎麼來',
    sub: '用文字捏出角色，每句都複製同一個聲音',
    title: '聲音怎麼來',
    tag: '全部是合成的聲音',
    status: [
      '先用一段英文描述角色的聲音：年紀、口音，而且不帶情緒',
      '聲音設計模型照描述，生出幾個候選的參考音',
      '從候選裡挑一個定案，當成這個角色的參考音',
      '之後的每一句，都照這段參考音複製聲音',
      '每一句都是同一個人；從頭到尾沒有任何真人錄音',
    ],
    last: 4,
    ms: 1400,
  },
  {
    id: 'pipeline',
    name: '一句話的生產線',
    sub: '每句跑 2 個 seed，Whisper 檢查，人耳把關',
    title: '一句話的生產線',
    tag: '英文、中文各 2 個 seed',
    status: [
      '一句台詞有英文、中文兩個版本',
      '每個版本各跑 2 個 seed：一句就有 4 個候選音檔',
      'Whisper 把每個候選轉回文字，算出錯誤率',
      '英文挑錯誤率 0% 的 seed 42；中文兩版都有錯',
      '有錯就補做：英文換 seed，中文先改送簡體字再錄',
      '破音字 Whisper 聽不出來，最後進待聽清單，用耳朵聽',
    ],
    last: 5,
    ms: 1300,
  },
  {
    id: 'why',
    name: '為什麼用本地',
    sub: '聲線一致、費用為零、可以重現',
    title: '為什麼用本地',
    tag: '好處與代價',
    status: [],
    last: WHY_GOOD.length + WHY_COST.length,
    ms: 1100,
  },
];

function PointCard({ index, item, mode }: { index: number; item: Point; mode: PlayMode }) {
  const player = usePlayer(item.last, item.ms, mode);
  const status = item.status[Math.min(player.tick, item.status.length - 1)] ?? '';

  return (
    <div className="slide-enter flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-line bg-panel px-8 py-6">
      {/* 標題列 */}
      <div className="flex h-12 shrink-0 items-center gap-4">
        <span className={`${LABEL_TYPE} shrink-0 text-acid`}>重點 {pad2(index + 1)}</span>
        <span className="text-[30px] leading-none font-semibold text-paper">{item.title}</span>
        <span className="rounded-full border border-line bg-panel-lift px-4 py-1 text-[18px] text-paper">
          {item.tag}
        </span>
        <PlayerControls player={player} />
      </div>

      {/* 主體 */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {item.id === 'playground' && (
          <>
            <QuoteCard />
            <div className="h-[412px] shrink-0">
              <PlaygroundScene tick={player.tick} live={player.live} />
            </div>
            <StatusLine text={status} />
          </>
        )}
        {item.id === 'voice' && (
          <>
            <div className="h-[424px] shrink-0">
              <VoiceScene tick={player.tick} />
            </div>
            <StatusLine text={status} />
            <VoiceCompare />
          </>
        )}
        {item.id === 'pipeline' && (
          <>
            <div className="h-[388px] shrink-0">
              <PipelineScene tick={player.tick} />
            </div>
            <StatusLine text={status} />
            <EpisodeCalc />
          </>
        )}
        {item.id === 'why' && <WhyBoard tick={player.tick} />}
      </div>
    </div>
  );
}

const SITE_URL = 'https://www.pocketool.app/vocab/zh-tw/';

/** 左欄最下面：連到網站的連結卡（新分頁），中性色 */
function SiteLink() {
  return (
    <a
      href={SITE_URL}
      target="_blank"
      rel="noreferrer"
      className="group flex h-[122px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-line border-l-[6px] border-l-paper bg-panel-lift px-6 transition-colors duration-200 hover:border-acid hover:border-l-acid"
    >
      <span className={LABEL_FAINT}>這次的例子 · 英語學習網站</span>
      <span className="text-[26px] leading-tight font-semibold text-paper">口袋單字王</span>
      <span className="text-[18px] text-muted underline decoration-line underline-offset-4 transition-colors duration-200 group-hover:text-acid">
        <span className="font-mono">pocketool.app/vocab/zh-tw/</span> ↗
      </span>
    </a>
  );
}

export function LocalComputeDemo() {
  const [picked, setPicked] = useState<PointId>('playground');
  const [touched, setTouched] = useState(false);
  const index = Math.max(
    0,
    POINTS.findIndex((item) => item.id === picked),
  );

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-8">
      {/* ── 左：四個重點 ＋ 網站連結 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>四個重點 · 用本機模型大量產生音訊</span>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {POINTS.map((item, i) => (
            <MenuItem
              key={item.id}
              index={i}
              name={item.name}
              sub={item.sub}
              on={item.id === picked}
              onClick={() => {
                setPicked(item.id);
                setTouched(true);
              }}
            />
          ))}
        </div>
        <SiteLink />
      </div>

      {/* ── 右：情境 ─────────────────────────────────────── */}
      <PointCard
        key={picked}
        index={index}
        item={POINTS[index]}
        mode={touched ? 'play' : 'still'}
      />
    </div>
  );
}
