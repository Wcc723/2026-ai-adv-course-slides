import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 獨特的能力：Claude › Environments
 *
 *   第 33 頁  EnvironmentsDemo  Environments：選 Claude 在哪裡開發（withVote → 根容器 640）
 *   （第 34 頁的實作頁 EnvironmentsTryDemo 在 demos-environments-try.tsx，
 *    第 35 頁的使用情境 EnvironmentsScenariosDemo 在 demos-environments-scenarios.tsx）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-19 的回饋：
 *   「message.txt 改了、還沒 commit：這段沒有突顯『環境』的用途（不是講 git，是要介紹環境）」
 *   「概念圖調整一下，不是那麼多文字，而是介紹開發模式，以及他可以做什麼」
 *   「Environments：環境變數能套用到專案嗎？ → 這頁移除（造成困惑）」
 *   以及講師先前寫的「這個可以做什麼用」：
 *     1. 直接在 Claude 雲端開發
 *     2. 可以使用 Claude 安排自動化（講師公司內有些排程就是這樣做 → 口頭講，不放畫面）
 *     3. 可以直接用 Claude 進行遠端開發（另一台主機）
 * 所以這一頁從「git 對照表」改成「三種開發模式 ＋ 各自可以做什麼」；原本第 34 頁
 * （環境變數、安全結論、誰讀得到）整頁拿掉，實作頁底部的「這個功能拿來做什麼」移到這裡。
 * 課堂上只示範 Local 與 Cloud；SSH 只介紹用途，畫面標「這堂課不示範」。
 *
 * ──────────────────────────────────────────────────────────────
 * 查證（查核日 2026-11-19）
 * ──────────────────────────────────────────────────────────────
 * https://code.claude.com/docs/en/desktop
 *   #environment-configuration
 *     Local「runs on your machine with direct access to your files」
 *     Cloud「runs on Anthropic-managed infrastructure by default. Sessions continue even if you close the app.」
 *     SSH 「runs on a remote machine you connect to over SSH, such as your own servers, cloud VMs, or
 *          dev containers. A running task can keep going while Desktop is disconnected」
 *   #cloud-sessions  長時間任務選 Cloud；「continue even if you close the app or shut down your computer」，
 *          「monitor cloud sessions from claude.ai/code or the Claude mobile app」
 *   #preview-your-app  Local session 在 Browser pane 預覽（SSH session 沒有這些工具）
 *   #ssh-sessions  「useful for working with codebases that live on cloud VMs, dev containers, or servers
 *          with specific hardware or dependencies」
 *   #start-a-session  環境選擇器是 prompt box 下方第一個控制項（送出第一則訊息之前），顯示目前環境的名稱
 *   Local session 讀 ~/.claude/skills/（SSH 讀的是遠端主機的）
 * https://code.claude.com/docs/en/cloud-environments
 *   「Cloud sessions start from a fresh clone of your repository」→「每次從 GitHub 拿專案」
 * https://code.claude.com/docs/en/routines
 *   scheduled tasks（以前叫 routines，research preview）「run in the cloud on a schedule, on API calls,
 *   or on GitHub events」，跑在 Anthropic 的雲端，「keep working when your laptop is closed」
 *
 * 補的示意：Desktop 視窗是手繪示意，不是截圖；選擇器上的 my-cloud-env、my-server 是虛構的環境名稱
 * （實際顯示你自己取的名字）。三個「例如」是講師沒寫、為了讓用途具體而補的情境。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 左邊概念圖右側的三張卡（本機／雲端／遠端）可以點：Desktop 到那台機器的連線變成 acid 粗線，
 * 右邊「可以做什麼」換成那個模式的用途。Desktop 示意上的選擇器也跟著換名稱。
 * 鍵盤：按鈕群組擋掉按鍵往上傳（空白鍵、方向鍵不翻頁）；滑鼠點完就放掉焦點，之後照常翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   acid  選到的模式（卡片 6px 左粗條 ＋ 外框 ＋ acid/14 淡底、連線、選擇器外框）、
 *         「可以做什麼」面板的 6px 左粗條與模式名稱
 *   其餘中性色；淡底一律配 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；根容器 640）
 * ──────────────────────────────────────────────────────────────
 *   左卡 1040 ＝ 框 4 ＋ p 48：概念圖 984 × 540 ＋ 16 ＋ 在哪裡選 28。
 *     概念圖：右欄標籤 30 ＋ 18 ＋ 三張卡 152 × 3 ＋ 間距 18 × 2 ＝ 540（卡片中心 y 124／294／464）；
 *             Desktop 視窗 320 × 230，中心對齊中間那張卡（y 294），連線從 x 320 到 x 516。
 *   右卡 676 ＝ py 56：標題 46 ＋ 24 ＋ 用途最多 3 張 × 96 ＋ 間距 14 × 2 ＋ mt-auto ＋ 例如 92 ≈ 534。
 *   任何互動都不改變外框高度；沒有容器會捲動。浮水印在舞台右上（x 1692–1872、y 104–147），
 *   根容器頂端約在舞台 y 184，碰不到。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（同 demos-environments-try.tsx、vote-ui.tsx 的做法，複製一份，不 import）── */

const LABEL = 'text-[19px] tracking-[0.08em] text-faint';

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 按鈕群組裡的按鍵不能讓簡報翻頁（空白鍵、方向鍵） */
function stopKeys(event: KeyboardEvent) {
  event.stopPropagation();
}

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ── 資料 ─────────────────────────────────────────────────── */

type ModeId = 'local' | 'cloud' | 'ssh';

interface Use {
  title: string;
  sub?: string;
  /** 用小晶片列出的觸發方式（雲端排程） */
  chips?: readonly string[];
  tag?: string;
}

interface Mode {
  id: ModeId;
  name: string;
  en: string;
  where: string;
  detail: string;
  /** Desktop 示意上，選擇器顯示的名稱 */
  picker: string;
  /** 只介紹用途、課堂上不示範 */
  noDemo?: boolean;
  uses: readonly Use[];
  example: string;
}

const MODES: readonly Mode[] = [
  {
    id: 'local',
    name: '本機開發',
    en: 'Local',
    where: '你的電腦',
    detail: '直接用你的資料夾',
    picker: 'This computer',
    uses: [
      { title: '直接改你的檔案', sub: '改完就在你的資料夾裡' },
      { title: '馬上預覽', sub: 'Desktop 的預覽面板直接打開來看' },
      { title: '用你電腦上的工具與設定', sub: '裝好的指令、你的 skills 都在' },
    ],
    example: '改網站的樣式，Claude 改完，你馬上在預覽面板確認。',
  },
  {
    id: 'cloud',
    name: '雲端開發',
    en: 'Cloud',
    where: 'Anthropic 的機器',
    detail: '每次從 GitHub 拿一份專案',
    picker: 'my-cloud-env',
    uses: [
      { title: '關掉電腦也繼續跑', sub: '長時間的任務丟給雲端，回來看結果' },
      { title: '從手機、網頁接手', sub: '在 claude.ai/code 或 Claude App 看進度' },
      { title: '排程自動化', chips: ['定時', 'API 呼叫', 'GitHub 事件'], tag: '研究預覽' },
    ],
    example: '每天早上自動整理報表，你還沒開電腦就跑完了。',
  },
  {
    id: 'ssh',
    name: '遠端開發',
    en: 'SSH',
    where: '你的另一台主機',
    detail: '自己的伺服器、雲端 VM',
    picker: 'my-server',
    noDemo: true,
    uses: [
      { title: '直接在另一台主機上開發', sub: '程式碼留在那台機器，Desktop 當操作介面' },
      { title: '用那台機器的環境與資源', sub: '特定的硬體、已經裝好的相依套件' },
    ],
    example: '專案要在有 GPU 的主機上跑，Desktop 連過去直接開發。',
  },
];

/* ── 圖示（40 × 40，線條用 currentColor）────────────────── */

function ModeIcon({ id }: { id: ModeId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={44} height={44} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      {id === 'local' && (
        <>
          <rect x={6} y={7} width={28} height={19} rx={2.5} {...common} />
          <path d="M2 31h36l-2.5 3.5h-31z" {...common} />
        </>
      )}
      {id === 'cloud' && (
        <path d="M12 31h17.5a7 7 0 0 0 .8-13.96A10 10 0 0 0 11 15.2 8 8 0 0 0 12 31z" {...common} />
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

function SmallTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center rounded-md border-2 border-line px-2.5 text-[19px] leading-none whitespace-nowrap text-muted">
      {children}
    </span>
  );
}

/* ── 概念圖 ───────────────────────────────────────────────── */

/** 三張卡的上緣（概念圖座標）；卡高 152，中心 124／294／464 */
const CARD_TOP = [48, 218, 388] as const;
const CARD_H = 152;
const CARD_LEFT = 524;
const DESKTOP_W = 320;
const HUB_Y = 294;

/** Desktop 的示意視窗：Code 分頁 → prompt box → 第一個按鈕是環境選擇器 */
function DesktopMock({ mode }: { mode: Mode }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 flex h-[230px] flex-col overflow-hidden rounded-2xl border-2 border-paper bg-panel-lift"
      style={{ top: HUB_Y - 115, width: DESKTOP_W }}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="size-3 rounded-full bg-faint" />
        <span className="size-3 rounded-full bg-faint" />
        <span className="size-3 rounded-full bg-faint" />
        <span className="ml-2 text-[19px] font-semibold text-paper">Claude Desktop</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="inline-flex h-9 w-fit items-center rounded-lg bg-paper px-3 text-[19px] font-semibold text-on-accent">
          Code
        </span>
        <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-panel p-3">
          <span className="text-[19px] leading-[26px] text-muted">交代 Claude 要做什麼…</span>
          <span
            key={mode.id}
            className="slide-enter inline-flex h-10 w-fit items-center gap-1.5 rounded-lg border-2 border-acid bg-panel-lift px-3 font-mono text-[19px] font-semibold text-paper"
          >
            {mode.picker} <span className="text-acid">▾</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Desktop → 三台機器的連線；選到的那一條是 acid 粗線，畫在最上面 */
function Links({ picked }: { picked: ModeId }) {
  const ends = MODES.map((mode, index) => ({ id: mode.id, y: CARD_TOP[index] + CARD_H / 2 }));
  const pathFor = (y: number) => {
    const x0 = DESKTOP_W;
    const x1 = CARD_LEFT - 8;
    const mid = (x0 + x1) / 2;
    return y === HUB_Y ? `M ${x0} ${HUB_Y} L ${x1} ${y}` : `M ${x0} ${HUB_Y} C ${mid + 10} ${HUB_Y}, ${mid - 10} ${y}, ${x1} ${y}`;
  };
  const ordered = [...ends.filter((end) => end.id !== picked), ...ends.filter((end) => end.id === picked)];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      width={984}
      height={540}
      viewBox="0 0 984 540"
    >
      <defs>
        <marker id="env-mode-arrow-on" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={18} markerHeight={18} markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--color-acid)" />
        </marker>
        <marker id="env-mode-arrow-off" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={12} markerHeight={12} markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--color-faint)" />
        </marker>
      </defs>
      {ordered.map((end) => {
        const on = end.id === picked;
        return (
          <path
            key={end.id}
            d={pathFor(end.y)}
            fill="none"
            stroke={on ? 'var(--color-acid)' : 'var(--color-faint)'}
            strokeWidth={on ? 5 : 2.5}
            strokeDasharray={on ? undefined : '8 8'}
            markerEnd={on ? 'url(#env-mode-arrow-on)' : 'url(#env-mode-arrow-off)'}
          />
        );
      })}
      <circle cx={DESKTOP_W} cy={HUB_Y} r={7} fill="var(--color-acid)" />
    </svg>
  );
}

function ModeCard({
  mode,
  top,
  on,
  onPick,
}: {
  mode: Mode;
  top: number;
  on: boolean;
  onPick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      style={{ top, left: CARD_LEFT, height: CARD_H }}
      className={`absolute right-0 flex flex-col justify-center gap-1.5 rounded-2xl border-2 border-l-[6px] px-6 text-left transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'border-acid border-l-acid bg-acid/14' : 'border-line border-l-line bg-panel-lift hover:border-acid'
      }`}
    >
      <span className="flex h-11 items-center gap-3">
        <span className={on ? 'text-acid' : 'text-paper'}>
          <ModeIcon id={mode.id} />
        </span>
        <span className="text-[28px] leading-none font-semibold text-paper">{mode.name}</span>
        <span className="font-mono text-[21px] leading-none text-muted">{mode.en}</span>
        {mode.noDemo && (
          <span className="ml-auto">
            <SmallTag>這堂課不示範</SmallTag>
          </span>
        )}
      </span>
      <span className="text-[21px] leading-snug text-paper">{mode.where}</span>
      <span className="text-[19px] leading-snug text-muted">{mode.detail}</span>
    </button>
  );
}

/* ── 可以做什麼 ───────────────────────────────────────────── */

function UsesPanel({ mode }: { mode: Mode }) {
  return (
    <section
      aria-live="polite"
      className="flex h-[640px] min-w-0 flex-col rounded-2xl border-2 border-l-[6px] border-line border-l-acid bg-panel px-8 py-7"
    >
      <div className="flex h-[46px] shrink-0 items-center gap-4">
        <h3 className="text-[34px] leading-none font-semibold whitespace-nowrap text-paper">
          <span className="text-acid">{mode.name}</span>，可以做什麼
        </h3>
        {mode.noDemo && (
          <span className="ml-auto">
            <SmallTag>只介紹用途</SmallTag>
          </span>
        )}
      </div>

      <ol key={mode.id} className="slide-enter mt-6 flex flex-col gap-3.5">
        {mode.uses.map((use, index) => (
          <li
            key={use.title}
            className="flex h-[96px] items-center gap-4 rounded-xl border border-line-soft bg-panel-lift px-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper font-mono text-[21px] font-semibold text-on-accent">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex items-center gap-3">
                <span className="text-[26px] leading-tight font-semibold whitespace-nowrap text-paper">{use.title}</span>
                {use.tag && <SmallTag>{use.tag}</SmallTag>}
              </span>
              {use.sub && <span className="truncate text-[20px] leading-snug text-muted">{use.sub}</span>}
              {use.chips && (
                <span className="flex items-center gap-2">
                  {use.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex h-8 items-center rounded-full border-2 border-paper px-3 text-[19px] leading-none whitespace-nowrap text-paper"
                    >
                      {chip}
                    </span>
                  ))}
                  <span className="text-[19px] whitespace-nowrap text-muted">都能觸發</span>
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <div key={`${mode.id}-ex`} className="slide-enter mt-auto flex shrink-0 flex-col gap-1 rounded-xl bg-ink-soft px-5 py-4">
        <span className={LABEL}>例如</span>
        <p className="text-[22px] leading-snug text-paper">{mode.example}</p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 33 頁 EnvironmentsDemo — 選 Claude 在哪裡開發
 *
 *   左  概念圖：Claude Desktop（你下指令的地方）→ 本機／雲端／遠端（Claude 開發的地方），
 *       底下一行「在哪裡選」
 *   右  選到的模式「可以做什麼」：2～3 個用途 ＋ 一句例子
 * ══════════════════════════════════════════════════════════════ */

export function EnvironmentsDemo() {
  const [picked, setPicked] = useState<ModeId>('local');
  const mode = MODES.find((item) => item.id === picked) ?? MODES[0];

  return (
    <div className="grid h-[640px] w-full max-w-[1740px] grid-cols-[1040px_minmax(0,1fr)] gap-6">
      {/* ── 左：概念圖 ─────────────────────────────────── */}
      <div className="flex h-[640px] min-w-0 flex-col gap-4 rounded-2xl border-2 border-line bg-panel p-6">
        <div className="relative h-[540px] w-[984px] shrink-0">
          <Links picked={picked} />

          <span
            className="absolute left-0 h-[30px] text-center text-[20px] leading-[30px] text-muted"
            style={{ top: HUB_Y - 115 - 42, width: DESKTOP_W }}
          >
            你在這裡下指令
          </span>
          <DesktopMock mode={mode} />

          <span
            className="absolute top-0 right-0 h-[30px] text-[20px] leading-[30px] text-muted"
            style={{ left: CARD_LEFT }}
          >
            Claude 在這裡開發（點一下切換）
          </span>
          <div role="group" aria-label="選 Claude 在哪裡開發" onKeyDown={stopKeys}>
            {MODES.map((item, index) => (
              <ModeCard
                key={item.id}
                mode={item}
                top={CARD_TOP[index]}
                on={item.id === picked}
                onPick={(event) => {
                  setPicked(item.id);
                  blurAfterClick(event);
                }}
              />
            ))}
          </div>
        </div>

        <p className="flex h-7 shrink-0 items-center gap-3 text-[19px] leading-7 whitespace-nowrap">
          <span className={LABEL}>在哪裡選</span>
          <span className="text-paper">
            Code 分頁 › <span className="font-mono">⌘N</span> › 送出第一則訊息前，prompt 下方第一個按鈕
          </span>
        </p>
      </div>

      {/* ── 右：可以做什麼 ─────────────────────────────── */}
      <UsesPanel mode={mode} />
    </div>
  );
}
