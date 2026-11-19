import { Fragment, useState, type KeyboardEvent, type MouseEvent } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：ChatGPT
 *
 *   第 29 頁  MiniPetDemo  Mini 寵物：智慧精靈（Pets）與迷你介面（Mini）
 *             （withVote 包起來 → 根容器 h-[640px] w-full max-w-[1740px]）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師的 CODD 筆記「簡報調整」（codd://note/note-plus，2026-11-18）在 Sites 那一節：
 *   「後面再幫我補一個 ChatGPT 專屬功能 Mini 寵物」——筆記只有這一句。
 * 依官方文件判斷「Mini 寵物」指的是 ChatGPT 桌面版的 Pets（官方繁中「智慧精靈」）
 * 加上它的 Mini 選項（官方繁中「迷你介面」：只留對話控制項、不顯示角色）。
 * 第三方教學（arte.itlibra.com，App 26.1016 版）說設定裡這一區標成「Mini & Pets」，
 * 只有這一篇這樣寫，畫面不用這個字樣。講師如果指的是別的功能，這頁要重做。
 *
 * 一頁一個概念：寵物不幫你做事，是「背景任務的狀態燈＋隨叫隨到的快速對話入口」。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-18）
 * ──────────────────────────────────────────────────────────────
 * - https://learn.chatgpt.com/zh-Hant/docs/pets.md（官方繁中，畫面上的用詞都照這一頁）
 *     標題「智慧精靈」；「或選取迷你介面，只顯示對話控制項」；
 *     四種狀態：執行中「對話正在處理任務」、需要輸入「對話需要你核准、回答問題或做出其他決定」、
 *     已就緒「對話已完成任務，並有未讀動態」、受阻「對話中的任務失敗，或對話遇到系統錯誤」；
 *     「多個對話都有動態時，智慧精靈會優先顯示需要輸入的對話，接著依序顯示受阻、已就緒及執行中的對話」；
 *     「開啟應用程式底部的個人資料選單，選取智慧精靈」、「輸入 /pet，或開啟指令選單並選取顯示智慧精靈」、
 *     「在智慧精靈上按一下滑鼠右鍵，選取隱藏」；快速鍵 macOS Option+Space、Windows Windows+Alt+P；
 *     「從這些控制項開始的對話不屬於任何專案」；「選取鈴鐺圖示即可顯示討論串清單，再選擇其中一個討論串來開啟對話」；
 *     「網頁版不提供桌面應用程式的浮動介面、動態面板或 /pet 指令」；
 *     「在桌面應用程式中建立的自訂智慧精靈會儲存在你的電腦上」；遵循作業系統的減少動態效果設定。
 * - https://learn.chatgpt.com/docs/pets.md（英文原文）
 *     「Pets are optional animated companions for following work.」
 *     「Choosing a pet changes its appearance, not how ChatGPT completes tasks.」
 *     「In the ChatGPT desktop app on macOS and Windows, a pet can float above other app windows.」
 *     「start a chat by typing or speaking」；「Use @ to add context and $ to choose a skill.」
 *     「If Pets are available for your account and workspace …」；
 *     「A web pet appears inside supported ChatGPT Work chats.」
 *     註：「Settings > Personalization > Pet > Select pet」是英文版「網頁版」的路徑（繁中網頁版同樣是
 *       「設定 › 個人化 › 智慧精靈」）；桌面版兩種語言都寫「個人資料選單 › 智慧精靈」或「設定 › 智慧精靈」→ 畫面寫「個人資料選單 › 智慧精靈」與 /pet。
 * - https://learn.chatgpt.com/docs/whats-new（2026-09-07～11 那週：從寵物開快速對話、新增 Mini）
 * - https://support.claude.com/en/articles/12626668-use-quick-entry-with-claude-desktop-on-mac
 *     「Double-tap the Option key to open Claude from any app.」只有 macOS 的 Claude Desktop、
 *     所有方案都有 → 右下「Claude 有嗎？」卡。
 *   Claude 桌面版沒有螢幕上的寵物：Claude Code 2.1.89 的 /buddy 是 4/1 的終端機彩蛋、
 *   現行指令參考頁已經沒有；claude-desktop-buddy 是 ESP32 的實體桌寵開源專案。
 *   兩者都不是螢幕寵物，畫面只放 Quick entry。
 *
 * 沒有寫上畫面的（查得到但為了少字省略，或說法不一）：
 * - 自訂寵物用 hatch-pet 技能（設定 › Create pet）；畫面只寫「也能自己做一隻」。
 * - macOS 同時按兩個 Command 拍 Appshot 送給寵物、Computer Use 子母畫面吸附在寵物上。
 * - Codex CLI 的終端機寵物（/pets）：pets 文件寫 tmux、Zellij 不能用，
 *   但 0.168.0 版 changelog 寫可以經由 Kitty passthrough 在 tmux 全螢幕窗格顯示，兩邊不一致。
 * - 內建寵物 8 隻的名單、2026-05-01 以 Codex pets 首發：只見於第三方報導（gihyo.jp、Engadget）。
 * - 手機版：官方文件沒提；只有社群回報 iPhone 設定看得到、對話裡不出現。
 * - 適用方案：官方只寫「帳號與工作區有開放才看得到」，沒有列方案 → 畫面寫「以實際畫面為準」。
 *
 * 補的示意（不是官方畫面）：
 * - 左邊整塊桌面、別的 App 視窗、寵物的長相與表情、控制列的樣子都是手繪示意；
 *   官方的寵物是像素風動畫，這裡的角色是自己畫的。
 * - 三個對話（修登入頁、整理週報、跑測試）與四個步驟是虛構的情境，
 *   用來把官方的四種狀態與優先順序走一遍。狀態名稱與說明是官方繁中原文（縮短過）。
 * - 控制列「打字／語音／討論串」三顆按鈕的排列與文字是示意；官方只說可以打字或用語音開對話、
 *   鈴鐺圖示列出討論串。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * - 上方切換：智慧精靈（有角色）／迷你介面（拿掉角色，控制列不變）。
 * - 右欄四步：依序點，三個對話的狀態跟著變；寵物照官方的優先順序顯示最需要你的那一個
 *   （第 1 步全部執行中 → 第 2 步已就緒 → 第 3 步受阻 → 第 4 步需要輸入，每一步都比前一步優先）。
 *   右下的優先順序晶片標出寵物現在顯示的是哪一種。一進頁面是第 0 步：還沒派任務，寵物在睡覺。
 *   迷你介面沒有角色，點步驟時會順手打開討論串清單，讓狀態看得到。
 * - 控制列：打字／語音打開快速對話（標出 @、$ 與「不屬於任何專案」）；討論串打開清單，
 *   點一條顯示「開啟這段對話」。左上的 ⌥ Option ＋ Space 鍵帽也能打開快速對話。
 * - 鍵盤：按鈕被鍵盤聚焦時，空白鍵與 Enter 只觸發按鈕、不翻頁；滑鼠點完就放掉焦點。
 * - 執行中的轉圈圈用 motion-safe，作業系統開了「減少動態效果」就不轉（官方的寵物也是這樣）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（只有 acid 一支強調色）
 * ──────────────────────────────────────────────────────────────
 *   四種狀態不用顏色區分，用圖示（轉圈、打勾、驚嘆號、問號）＋官方的字區分，
 *   這樣一頁不會出現四支強調色（theme.css：一頁最多兩支）。
 *   acid  寵物「現在顯示的」那一種：頭上的徽章、對話泡泡的 6px 左粗條、優先順序的實心晶片、
 *         清單裡對應那一條的左粗條、右欄目前這一步（6px 左粗條＋/14 淡底＋實心號碼）。
 *   選中的切換鈕、控制列按下的按鈕、做過的步驟號碼：中性的深色色塊（bg-paper ＋ text-on-accent）。
 *   淡底只有目前這一步的 acid/14，配 6px 不透明左粗條。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內 1744 × 768，扣掉投票列後根容器 640，不捲動）
 * ──────────────────────────────────────────────────────────────
 *   切換列 56 ＋ 16 ＋ 主區 436 ＋ 16 ＋ 小卡 116 ＝ 640
 *   主區 grid [1fr 540px] gap 24 → 左邊桌面示意 1176 × 436
 *     桌面  上方一列 48（示意標籤／全域快速鍵）
 *           別的 App 視窗 left 24、top 56、600 × 296
 *           左下模式說明 y 372–412，最長 16 字 × 18 ＝ 288 寬
 *           右下浮動層 right 28、bottom 20，寬 ≈ 340：
 *             泡泡 76 ＋ 8 ＋ 角色 179（viewBox 150 × 140 放大 1.28 倍）＋ 8 ＋ 控制列 60 ＝ 331
 *             （top ≈ 85，碰不到上方一列的 48）
 *             迷你介面：泡泡＋角色的位置換成同高的虛線框 263（76 ＋ 8 ＋ 179），控制列位置不動
 *           彈出的快速對話／討論串 400 寬，貼在浮動層左邊 16、底部對齊
 *             → x ≈ 392–792，壓在別的 App 視窗上（示意「浮在其他視窗上面」），不碰左下說明（止於 312）
 *             討論串 ≈ py 32 ＋ 標題 24 ＋ 10 ＋ 3 × 56 ＋ 2 × 8 ＋ 10 ＋ 註 28 ≈ 288（top ≈ 128）
 *             快速對話 ≈ py 32 ＋ 24 ＋ 10 ＋ 48 ＋ 12 ＋ 36 ＋ 10 ＋ 24 ≈ 196
 *     右欄  標籤 30 ＋ 10 ＋ 四步（64 × 4 ＋ 8 × 3 ＝ 280）＋ 14 ＋ 優先順序卡 flex-1（≈ 102）
 *           優先順序晶片 ≈ 116 ＋ 80 ＋ 98 ＋ 98 ＋ 分隔 3 × 24 ＝ 464（卡片內寬 498）
 *   小卡  四欄各 ≈ 423，px-5 → 字寬 381，19px 一行最多約 20 個全形字；兩行都 truncate，
 *         超出的話稽核的溢出檢查會抓到。
 *   切換、步驟、彈出層都不改變根容器高度：桌面裡的東西全是 absolute。
 *
 * 浮水印在對外版的右上角（舞台 x 1692–1872、y 104–147）。這頁的右上是右欄頂端，
 * 只有靠左的短標籤「示意 · 依序點一下」（約 190 寬，止於右欄 x ≈ 190），
 * 右欄的第一個按鈕從根容器 y ≈ 112 開始、文字靠左。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（照 demos-antigravity.tsx 複製，不跨檔 import）──── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

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

/** 浮在桌面上的東西共用的陰影（顏色走 token） */
const FLOAT_SHADOW = 'shadow-[0_12px_28px_-16px_var(--color-paper)]';

/* ── 資料 ───────────────────────────────────────────────── */

type PetState = 'running' | 'ready' | 'blocked' | 'input';
type Look = 'pet' | 'mini';
type Panel = 'none' | 'type' | 'voice' | 'list';
type ThreadId = 'login' | 'report' | 'test';

/** 官方繁中的狀態名稱與說明（learn.chatgpt.com/zh-Hant/docs/pets，說明縮短過） */
const STATE_INFO: Record<PetState, { name: string; desc: string }> = {
  input: { name: '需要輸入', desc: '要你核准、回答問題或做決定' },
  blocked: { name: '受阻', desc: '任務失敗，或遇到系統錯誤' },
  ready: { name: '已就緒', desc: '完成任務，有未讀動態' },
  running: { name: '執行中', desc: '正在處理任務' },
};

/** 官方的優先順序：需要輸入 › 受阻 › 已就緒 › 執行中 */
const PRIORITY: readonly PetState[] = ['input', 'blocked', 'ready', 'running'];

/** 虛構的三個背景對話（示意） */
const THREADS: readonly { id: ThreadId; name: string }[] = [
  { id: 'login', name: '修登入頁' },
  { id: 'report', name: '整理週報' },
  { id: 'test', name: '跑測試' },
];

interface Step {
  title: string;
  sub: string;
  /** 對話泡泡的第二行 */
  bubble: string;
  threads: Record<ThreadId, PetState>;
}

/** 四步情境：每一步出現的狀態都比前一步優先，寵物一路換到最需要你的那個 */
const STEPS: readonly Step[] = [
  {
    title: '派出三個任務',
    sub: '三個對話都在「執行中」',
    bubble: '3 個對話正在處理任務',
    threads: { login: 'running', report: 'running', test: 'running' },
  },
  {
    title: '「整理週報」做完了',
    sub: '已就緒：完成任務，有未讀動態',
    bubble: '「整理週報」做完了，有未讀',
    threads: { login: 'running', report: 'ready', test: 'running' },
  },
  {
    title: '「跑測試」失敗了',
    sub: '受阻：任務失敗，或遇到系統錯誤',
    bubble: '「跑測試」失敗了',
    threads: { login: 'running', report: 'ready', test: 'blocked' },
  },
  {
    title: '「修登入頁」要你核准',
    sub: '需要輸入：核准、回答問題或做決定',
    bubble: '「修登入頁」在等你核准',
    threads: { login: 'input', report: 'ready', test: 'blocked' },
  },
];

/** 照官方優先順序，挑出寵物要顯示的狀態 */
function topState(threads: Record<ThreadId, PetState>): PetState {
  const states = Object.values(threads);
  return PRIORITY.find((state) => states.includes(state)) ?? 'running';
}

const LOOKS: readonly { id: Look; text: string }[] = [
  { id: 'pet', text: '智慧精靈 · Pets' },
  { id: 'mini', text: '迷你介面 · Mini' },
];

/** 桌面左下的一句話：兩種外觀差在哪 */
const LOOK_NOTE: Record<Look, string> = {
  pet: '換哪一隻只改外觀，也能自己做一隻',
  mini: '迷你介面：拿掉角色，控制列不變',
};

/** 底部四張小卡，兩行都是官方文件寫得到的（Claude 那張是 Claude 的說明中心） */
const FACTS: readonly { label: string; lines: [string, string] }[] = [
  {
    label: '怎麼叫出來',
    lines: ['個人資料選單 › 智慧精靈，選一隻', '再輸入 /pet 顯示；右鍵寵物 › 隱藏'],
  },
  {
    label: '在哪裡用',
    lines: ['桌面版 Mac、Windows：浮在視窗上', '網頁版：只在 Work 對話裡出現'],
  },
  {
    label: '要注意',
    lines: ['從寵物開的對話，不屬於任何專案', '適用方案官方沒列出，以實際畫面為準'],
  },
  {
    label: 'Claude 有嗎？',
    lines: ['沒有螢幕寵物；最接近的是 Quick entry', 'Mac 連按兩下 Option 叫出輸入框'],
  },
];

/* ── 圖示 ───────────────────────────────────────────────── */

/** 四種狀態的圖示（24 單位的方格）：轉圈、打勾、驚嘆號、問號 */
function StateGlyphPaths({ state }: { state: PetState }) {
  if (state === 'running') {
    return (
      <path
        d="M12 4 A8 8 0 1 1 4 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="origin-center [transform-box:fill-box] motion-safe:animate-spin"
      />
    );
  }
  const ring = (
    <circle cx={12} cy={12} r={9} fill="none" stroke="currentColor" strokeWidth={2.2} />
  );
  if (state === 'ready') {
    return (
      <>
        {ring}
        <path
          d="M8 12.5 L11 15.5 L16.5 9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  }
  if (state === 'blocked') {
    return (
      <>
        {ring}
        <path d="M12 7.5 V13" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={12} cy={16.6} r={1.4} fill="currentColor" />
      </>
    );
  }
  return (
    <>
      {ring}
      <path
        d="M9.4 9.7 A2.7 2.7 0 1 1 13.4 12 C12.5 12.5 12 13.1 12 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <circle cx={12} cy={17} r={1.4} fill="currentColor" />
    </>
  );
}

function StateGlyph({ state, size = 22 }: { state: PetState; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <StateGlyphPaths state={state} />
    </svg>
  );
}

type BarIcon = 'type' | 'voice' | 'list';

function ControlIcon({ icon }: { icon: BarIcon }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      {icon === 'type' && (
        <>
          <path d="M5 19 L6 15 L16 5 L19 8 L9 18 Z" {...common} />
          <path d="M14 7 L17 10" {...common} />
        </>
      )}
      {icon === 'voice' && (
        <>
          <rect x={9} y={3} width={6} height={11} rx={3} {...common} />
          <path d="M6 11 A6 6 0 0 0 18 11" {...common} />
          <path d="M12 17 V21" {...common} />
        </>
      )}
      {icon === 'list' && (
        <>
          <path d="M6 16 V11 A6 6 0 0 1 18 11 V16 L19.5 18 H4.5 Z" {...common} />
          <path d="M10 20.5 A2 2 0 0 0 14 20.5" {...common} />
        </>
      )}
    </svg>
  );
}

/* ── 角色（手繪示意，不是官方的寵物）─────────────────────── */

const INK = 'var(--color-paper)';
const FACE_STROKE = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };

function PetFace({ state }: { state: PetState | null }) {
  if (state === null) {
    // 還沒有任務：閉著眼睛
    return (
      <>
        <path d="M44 72 Q52 79 60 72" {...FACE_STROKE} />
        <path d="M80 72 Q88 79 96 72" {...FACE_STROKE} />
        <path d="M64 96 H76" {...FACE_STROKE} />
      </>
    );
  }
  if (state === 'running') {
    return (
      <>
        <circle cx={56} cy={70} r={6} fill={INK} />
        <circle cx={92} cy={70} r={6} fill={INK} />
        <path d="M62 94 H80" {...FACE_STROKE} />
      </>
    );
  }
  if (state === 'ready') {
    return (
      <>
        <path d="M44 74 Q52 63 60 74" {...FACE_STROKE} />
        <path d="M80 74 Q88 63 96 74" {...FACE_STROKE} />
        <path d="M57 89 Q70 102 83 89" {...FACE_STROKE} />
      </>
    );
  }
  if (state === 'blocked') {
    return (
      <>
        <path d="M46 64 L58 76 M58 64 L46 76" {...FACE_STROKE} />
        <path d="M82 64 L94 76 M94 64 L82 76" {...FACE_STROKE} />
        <path d="M58 99 Q70 89 82 99" {...FACE_STROKE} />
      </>
    );
  }
  return (
    <>
      <circle cx={52} cy={70} r={9} fill={INK} />
      <circle cx={88} cy={70} r={9} fill={INK} />
      <circle cx={55} cy={67} r={2.6} fill="var(--color-panel)" />
      <circle cx={91} cy={67} r={2.6} fill="var(--color-panel)" />
      <circle cx={70} cy={96} r={5.5} {...FACE_STROKE} />
    </>
  );
}

function PetSprite({ state }: { state: PetState | null }) {
  return (
    <svg width={192} height={179} viewBox="0 0 150 140" aria-hidden="true" className="shrink-0">
      <ellipse cx={70} cy={131} rx={44} ry={6} fill="var(--color-line-soft)" />
      <path
        d="M40 38 L32 12 L60 28 Z"
        fill="var(--color-panel)"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path
        d="M100 38 L108 12 L80 28 Z"
        fill="var(--color-panel)"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <rect x={22} y={24} width={96} height={100} rx={42} fill="var(--color-panel)" stroke={INK} strokeWidth={4} />
      <PetFace state={state} />
      {state !== null && (
        <g>
          <circle cx={124} cy={30} r={21} fill="var(--color-acid)" stroke="var(--color-panel)" strokeWidth={4} />
          <g transform="translate(109 15) scale(1.25)" className="text-on-accent">
            <StateGlyphPaths state={state} />
          </g>
        </g>
      )}
    </svg>
  );
}

/* ── 上方的切換 ─────────────────────────────────────────── */

function LookSwitch({ value, onChange }: { value: Look; onChange: (look: Look) => void }) {
  return (
    <div
      role="tablist"
      aria-label="寵物的外觀"
      className="flex h-14 w-fit shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-ink-soft p-1.5"
    >
      {LOOKS.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={(event) => {
              onChange(option.id);
              blurAfterClick(event);
            }}
            onKeyDown={keepActivationKeys}
            className={`h-full rounded-xl px-6 text-[21px] transition-colors duration-200 ${FOCUS_RING} ${
              on ? 'bg-paper font-medium text-on-accent' : 'text-muted hover:bg-panel hover:text-paper'
            }`}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}

/* ── 左邊：桌面示意 ─────────────────────────────────────── */

/** 別的 App 的視窗：只有灰條，表示「你正在做別的事」 */
function OtherApp() {
  const bars = ['w-[62%]', 'w-[48%]', 'w-[78%]', 'w-[40%]', 'w-[70%]', 'w-[55%]', 'w-[66%]', 'w-[34%]'];
  return (
    <div
      aria-hidden="true"
      className="absolute top-14 left-6 flex h-[296px] w-[600px] flex-col overflow-hidden rounded-xl border border-line bg-panel"
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-4">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-3 rounded-full bg-line" />
        ))}
        <span className="ml-3 text-[17px] text-faint">你正在用的別的 App</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 px-8">
        {bars.map((width, index) => (
          <span key={index} className={`block h-3 rounded-full bg-line-soft ${width}`} />
        ))}
      </div>
    </div>
  );
}

function BarButton({
  icon,
  label,
  on,
  onClick,
}: {
  icon: BarIcon;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        onClick();
        blurAfterClick(event);
      }}
      onKeyDown={keepActivationKeys}
      className={`flex h-11 items-center gap-2 rounded-full px-4 text-[19px] transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'bg-paper font-medium text-on-accent' : 'text-paper hover:bg-panel-lift'
      }`}
    >
      <ControlIcon icon={icon} />
      {label}
    </button>
  );
}

/** 快速對話（打字或語音） */
function QuickChat({ voice }: { voice: boolean }) {
  return (
    <div className={`slide-enter flex w-[400px] flex-col rounded-2xl border-2 border-paper bg-panel px-5 py-4 ${FLOAT_SHADOW}`}>
      <span className={LABEL_FAINT}>快速對話 · 開一段新對話</span>
      <div className="mt-2.5 flex h-12 items-center gap-2.5 rounded-xl border border-line bg-panel-lift px-4">
        {voice ? (
          <>
            <ControlIcon icon="voice" />
            <span className="text-[20px] text-paper">聆聽中，直接用說的…</span>
          </>
        ) : (
          <>
            <span className="text-[20px] text-muted">打字問點什麼…</span>
            <span className="h-6 w-0.5 bg-paper motion-safe:animate-pulse" />
          </>
        )}
      </div>
      <div className="mt-3 flex h-9 items-center gap-2.5">
        {[
          { key: '@', text: '加上下文' },
          { key: '$', text: '選技能' },
        ].map((chip) => (
          <span
            key={chip.key}
            className="flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[18px] text-paper"
          >
            <span className="font-mono font-semibold">{chip.key}</span>
            {chip.text}
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[17px] leading-[24px] text-faint">這段對話不屬於任何專案</p>
    </div>
  );
}

/** 鈴鐺打開的討論串清單 */
function ThreadList({
  step,
  shown,
  opened,
  onOpen,
}: {
  step: Step | null;
  shown: PetState | null;
  opened: ThreadId | null;
  onOpen: (id: ThreadId) => void;
}) {
  const openedName = THREADS.find((thread) => thread.id === opened)?.name;
  return (
    <div className={`slide-enter flex w-[400px] flex-col rounded-2xl border-2 border-paper bg-panel px-5 py-4 ${FLOAT_SHADOW}`}>
      <span className={LABEL_FAINT}>討論串</span>
      {step === null ? (
        <p className="mt-2.5 flex h-[184px] items-center justify-center rounded-xl border border-dashed border-line text-[19px] text-faint">
          還沒有任務：先點右邊的第 1 步
        </p>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-2">
          {THREADS.map((thread) => {
            const state = step.threads[thread.id];
            const top = state === shown && THREADS.find((t) => step.threads[t.id] === shown)?.id === thread.id;
            const isOpen = opened === thread.id;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  aria-pressed={isOpen}
                  onClick={(event) => {
                    onOpen(thread.id);
                    blurAfterClick(event);
                  }}
                  onKeyDown={keepActivationKeys}
                  className={`flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-l-[6px] px-4 text-left transition-colors duration-200 ${FOCUS_RING} ${
                    top ? 'border-line border-l-acid' : 'border-line border-l-line-soft'
                  } ${isOpen ? 'bg-panel-lift' : 'bg-panel hover:bg-panel-lift'}`}
                >
                  <span className="text-[20px] font-medium text-paper">{thread.name}</span>
                  <span className={`flex items-center gap-1.5 text-[18px] ${top ? 'font-semibold text-acid' : 'text-muted'}`}>
                    <StateGlyph state={state} size={20} />
                    {STATE_INFO[state].name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className={`mt-2.5 h-7 text-[17px] leading-7 ${openedName ? 'text-paper' : 'text-faint'}`}>
        {openedName ? `→ 開啟「${openedName}」這段對話` : '點一條，開啟那段對話'}
      </p>
    </div>
  );
}

function DesktopMock({
  look,
  step,
  panel,
  opened,
  onPanel,
  onOpen,
}: {
  look: Look;
  step: Step | null;
  panel: Panel;
  opened: ThreadId | null;
  onPanel: (panel: Panel) => void;
  onOpen: (id: ThreadId) => void;
}) {
  const shown = step ? topState(step.threads) : null;
  const toggle = (next: Panel) => onPanel(panel === next ? 'none' : next);

  return (
    <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border border-line bg-ink-soft">
      {/* 上方一列：示意標籤＋全域快速鍵（按鍵帽＝模擬按下快速鍵） */}
      <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-between px-6">
        <span className={LABEL_FAINT}>示意 · 寵物浮在其他 App 上面</span>
        <div className="flex items-center gap-3">
          <span className="text-[18px] text-muted">全域快速鍵</span>
          <button
            type="button"
            aria-pressed={panel === 'type'}
            aria-label="模擬按下 Option＋Space，打開快速對話"
            onClick={(event) => {
              toggle('type');
              blurAfterClick(event);
            }}
            onKeyDown={keepActivationKeys}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-1 transition-colors duration-200 ${FOCUS_RING} hover:bg-panel-lift`}
          >
            {['⌥ Option', 'Space'].map((key, index) => (
              <Fragment key={key}>
                {index > 0 && <span className="text-[18px] text-muted">＋</span>}
                <kbd
                  className={`flex h-8 items-center rounded-md border border-b-[3px] px-2.5 font-sans text-[18px] ${
                    panel === 'type' ? 'border-paper bg-paper text-on-accent' : 'border-line bg-panel text-paper'
                  }`}
                >
                  {key}
                </kbd>
              </Fragment>
            ))}
          </button>
          <span className="text-[18px] text-muted">Windows：Win＋Alt＋P</span>
        </div>
      </div>

      <OtherApp />

      {/* 左下：兩種外觀差在哪 */}
      <p
        key={look}
        className="slide-enter absolute bottom-5 left-6 flex h-10 items-center text-[18px] text-paper"
      >
        {LOOK_NOTE[look]}
      </p>

      {/* 右下：浮動層 */}
      <div className="absolute right-7 bottom-5 z-20 flex flex-col items-end gap-2">
        {panel !== 'none' && (
          <div className="absolute right-[calc(100%+16px)] bottom-0">
            {panel === 'list' ? (
              <ThreadList step={step} shown={shown} opened={opened} onOpen={onOpen} />
            ) : (
              <QuickChat key={panel} voice={panel === 'voice'} />
            )}
          </div>
        )}

        {look === 'pet' && (
          <>
            {shown && step ? (
              <div
                key={shown}
                className={`slide-enter w-[320px] rounded-2xl border border-line border-l-[6px] border-l-acid bg-panel px-4 py-2.5 ${FLOAT_SHADOW}`}
              >
                <div className="flex items-center gap-2 text-[21px] leading-[28px] font-semibold text-paper">
                  <span className="text-acid">
                    <StateGlyph state={shown} />
                  </span>
                  {STATE_INFO[shown].name}
                </div>
                <p className="text-[18px] leading-[26px] text-muted">{step.bubble}</p>
              </div>
            ) : (
              <div className="w-[320px] rounded-2xl border border-dashed border-line bg-panel px-4 py-2.5 text-[18px] leading-[26px] text-faint">
                沒有任務，寵物在睡覺
              </div>
            )}
            <PetSprite state={shown} />
          </>
        )}

        {look === 'mini' && (
          <div
            key="mini"
            className="slide-enter flex h-[263px] w-[320px] items-center justify-center rounded-2xl border-2 border-dashed border-line text-[18px] text-faint"
          >
            這裡原本是角色
          </div>
        )}

        <div
          role="toolbar"
          aria-label="寵物的對話控制列"
          className={`flex h-[60px] items-center gap-1 rounded-full border-2 border-line bg-panel p-1.5 ${FLOAT_SHADOW}`}
        >
          <BarButton icon="type" label="打字" on={panel === 'type'} onClick={() => toggle('type')} />
          <BarButton icon="voice" label="語音" on={panel === 'voice'} onClick={() => toggle('voice')} />
          <BarButton icon="list" label="討論串" on={panel === 'list'} onClick={() => toggle('list')} />
        </div>
      </div>
    </div>
  );
}

/* ── 右欄：四步情境＋優先順序 ───────────────────────────── */

function StepPanel({
  stepIndex,
  shown,
  onStep,
}: {
  stepIndex: number;
  shown: PetState | null;
  onStep: (index: number) => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex h-[30px] shrink-0 items-center">
        <span className={LABEL_FAINT}>示意 · 依序點一下</span>
      </div>

      <ol className="mt-2.5 flex shrink-0 flex-col gap-2">
        {STEPS.map((step, index) => {
          const no = index + 1;
          const on = no === stepIndex;
          const done = no < stepIndex;
          return (
            <li key={step.title}>
              <button
                type="button"
                aria-pressed={on}
                onClick={(event) => {
                  onStep(no);
                  blurAfterClick(event);
                }}
                onKeyDown={keepActivationKeys}
                className={`flex h-16 w-full items-center gap-3.5 rounded-xl border border-l-[6px] px-4 text-left transition-colors duration-200 ${FOCUS_RING} ${
                  on
                    ? 'border-acid/55 border-l-acid bg-acid/14'
                    : 'border-line border-l-line-soft bg-panel hover:bg-panel-lift'
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-[20px] font-semibold tabular-nums ${
                    on
                      ? 'bg-acid text-on-accent'
                      : done
                        ? 'bg-paper text-on-accent'
                        : 'border border-line bg-panel text-faint'
                  }`}
                >
                  {no}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[22px] leading-[28px] font-semibold text-paper">{step.title}</span>
                  <span className="truncate text-[18px] leading-[24px] text-muted">{step.sub}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3.5 flex min-h-0 flex-1 flex-col justify-center rounded-2xl border border-line bg-panel px-5">
        <span className={LABEL_FAINT}>好幾個同時有動靜，先顯示</span>
        <div className="mt-2 flex items-center gap-1.5">
          {PRIORITY.map((state, index) => {
            const on = state === shown;
            return (
              <Fragment key={state}>
                {index > 0 && (
                  <span aria-hidden="true" className="w-3 text-center text-[20px] text-faint">
                    ›
                  </span>
                )}
                <span
                  className={`flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-[18px] whitespace-nowrap transition-colors duration-200 ${
                    on ? 'bg-acid font-semibold text-on-accent' : 'border border-line bg-panel text-paper'
                  }`}
                >
                  <StateGlyph state={state} size={18} />
                  {STATE_INFO[state].name}
                </span>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 29 頁 · MiniPetDemo
 * ══════════════════════════════════════════════════════════════ */

export function MiniPetDemo() {
  const [look, setLook] = useState<Look>('pet');
  /** 0 ＝ 還沒派任務；1–4 對應 STEPS */
  const [stepIndex, setStepIndex] = useState(0);
  const [panel, setPanel] = useState<Panel>('none');
  const [opened, setOpened] = useState<ThreadId | null>(null);

  const step = stepIndex > 0 ? STEPS[stepIndex - 1] : null;
  const shown = step ? topState(step.threads) : null;

  function changePanel(next: Panel) {
    setPanel(next);
    setOpened(null);
  }

  function changeStep(index: number) {
    setStepIndex(index);
    setOpened(null);
    // 迷你介面沒有角色：狀態要看討論串清單
    if (look === 'mini') setPanel('list');
  }

  return (
    <div className="flex h-[640px] w-full max-w-[1740px] flex-col gap-4">
      <div className="flex h-14 shrink-0 items-center gap-6">
        <LookSwitch value={look} onChange={setLook} />
        <p className="text-[22px] text-paper">浮在其他視窗上：幫你盯背景任務，也能隨手開新對話。</p>
      </div>

      <div className="grid h-[436px] shrink-0 grid-cols-[1fr_540px] gap-6">
        <DesktopMock
          look={look}
          step={step}
          panel={panel}
          opened={opened}
          onPanel={changePanel}
          onOpen={setOpened}
        />
        <StepPanel stepIndex={stepIndex} shown={shown} onStep={changeStep} />
      </div>

      <ul className="grid h-[116px] shrink-0 grid-cols-4 gap-4">
        {FACTS.map((fact) => (
          <li
            key={fact.label}
            className="flex min-w-0 flex-col justify-center rounded-2xl border border-line bg-panel px-5"
          >
            <span className={LABEL_FAINT}>{fact.label}</span>
            <span className="mt-1 truncate text-[19px] leading-[28px] text-paper">{fact.lines[0]}</span>
            <span className="truncate text-[19px] leading-[28px] text-muted">{fact.lines[1]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
