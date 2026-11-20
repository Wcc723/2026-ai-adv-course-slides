import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import coddGroupsUrl from './images/codd-groups.png';
import githubProjectsUrl from './images/github-projects.webp';
import githubProjectCardUrl from './images/github-project-card.webp';
import coddWebRemoteUrl from './images/codd-web-remote.webp';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 目前實戰中，我怎麼使用這些工具
 *
 *   第 44 頁  PracticeClaudeDemo        實戰：Claude 系列（CLI 搭配自行開發的擴充）
 *   第 45 頁  PracticeDevicesDemo       實戰：跨裝置的開發流程（架構圖）
 *   第 46 頁  PracticeDevicesShotsDemo  實戰：跨裝置流程的實際畫面
 *   三頁都沒有投票 → 根容器 720。
 *   （第 47 頁 PracticeProjectPromptDemo「用一段提示詞建立 GitHub Project」在 demos-practice-prompt.tsx，
 *    接在第 46 頁後面；前面第 43 頁是 CODD（demos-claude.tsx 的 CoddDemo）。
 *    原本接在後面的「實戰：ChatGPT 系列與混合使用」（MixDemo）2026-11-18 依講師筆記
 *    codd://note/note-plus 移除了。）
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源：講師的 CODD 筆記「簡報調整」（codd://note/note-xcra，2026-11-10 17:17）
 *   「目前實戰中，我會怎麼去使用這些不同的工具 › Claude 系列（CLI 搭配自行開發的擴充為主）」
 * ──────────────────────────────────────────────────────────────
 * 第 44 頁  兩點照原文：
 *           「日常開發：就大部分來講的話，我已經轉到我自己的 CODD 工具了。」
 *           「多專案管理：我會同時開非常多的專案，依據不同類型，把它分配到不同的群組。」
 *           截圖 images/codd-groups.png（CODD 側欄，263 × 339）。六個群組的名稱與
 *           底下的專案名稱照截圖抄；「收合中」是截圖上沒有展開的群組。
 * 第 45 頁  原文「已經定義好的開發流程，可以使用另一台裝置開發」（筆記寫成
 *           「開發留成」「裝至」，是語音輸入的錯字），三個步驟照原文：
 *             1. 會開啟 Project
 *             2. 多個裝置讀取同一個 Project，進行中的專案會進行 Agent 登記
 *             3. 使用 CODD 網頁版，來進行另一個裝置的控制
 *           講師要求畫一張架構圖：本地端與雲端的機器，加上 GitHub 上的 Project。
 *           講師 2026-11-10 更正：CODD 網頁版是放在 Mac mini 上的 —— Mac mini 跑網頁版的服務，
 *           人在別處時，從手邊的裝置用瀏覽器打開它，操作 Mac mini 上的 session。
 *           所以第 ③ 步畫成「MacBook（瀏覽器）→ Mac mini 上的 CODD 網頁版」，雲端主機不在這一步。
 * 第 46 頁  三張截圖，各對應一步：
 *             images/github-projects.webp      GitHub Projects 列表（casper.tw 開發、口袋工具開發）
 *             images/github-project-card.webp  一張卡片，右側 Agent 欄位（原圖就有紅框）
 *             images/codd-web-remote.webp      CODD 網頁版（FANCY/CODD），左側是 Mac mini 上的 sessions
 *                                               （依上面的更正）。左下角的帳號 email
 *                                               與內文裡的一個 IP 在轉檔時已經模糊處理
 *
 * ──────────────────────────────────────────────────────────────
 * 補的示意（筆記沒有，為了讓畫面成立才加的）
 * ──────────────────────────────────────────────────────────────
 *   - 第 45 頁整張架構圖：MacBook／Mac mini／雲端主機三台機器、「手邊的筆電」「開發機」
 *     這些角色、每台跑什麼（Claude Code ＋ CODD）、誰連到誰，都是依三個步驟畫的示意。
 *     Mac mini 取自截圖裡 Agent 欄位的「卡斯伯's Mac mini」；雲端主機是講師要求畫進來的，
 *     實際用哪一家、跑什麼沒有寫。「CODD 網頁版在 Mac mini 上」是講師確認過的（見上方更正），
 *     不是示意；用 MacBook 當「打開瀏覽器的那一端」才是示意，手邊的任何裝置都可以。
 *   - 第 45 頁三步的說明句（例如「看 Agent 欄位就知道哪台在做」）是依原文與截圖歸納的。
 *   - 第 46 頁「放大」的範圍是挑出來讓投影看得清楚的區域，不是截圖原本的標記
 *     （Agent 欄位的紅框除外，那是原圖就有的）。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（每頁一支強調色）
 * ──────────────────────────────────────────────────────────────
 *   第 44 頁  acid 選到的群組與截圖上的框
 *   第 45 頁  acid 目前步驟的線、節點與 Agent 欄位；沒選步驟時全部是 paper
 *   第 46 頁  acid 目前步驟、截圖上的放大框
 *   淡底（/14）一律配 6px 不透明左粗條，不單獨承擔語意。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（Panel 內可用約 1744 × 768；根容器 720）
 * ──────────────────────────────────────────────────────────────
 * 第 44 頁  右 560：截圖框 ＝ 外框 2 ＋ p-4 32 ＋ 圖 640（496 × 640，放大 1.89 倍）＋ 12 ＋ 說明 26 ＝ 712。
 *           左 1156：日常開發卡 236 ＋ 16 ＋ 多專案卡 468
 *             （py 48 ＋ 標籤列 40 ＋ 12 ＋ 主句 40 ＋ 16 ＋ 群組 3 × 84 ＋ 2 × 12 ＝ 432）。
 *             日常開發卡的晶片列內容寬 1093（1156 − px 56 − 左條 6 − 框 1）：九個項目本身 1020，
 *             gap 用 8（8 個間隔 64 → 1084）；gap 12 會到 1116，「系統狀況」頂到卡片右框（瀏覽器量過）。
 * 第 45 頁  左 560：說明卡 104 ＋ 3 個步驟 flex-1（約 160；說明 19px 每行 23 字、最多 3 行）
 *             ＋ 看全貌 52，gap 12 × 4。
 *           右 1156：架構圖外框 2 ＋ SVG 1152 × 716（1:1，字最小 16）。
 * 第 46 頁  左 440：標籤 28 ＋ 3 個步驟 flex-1（約 210；說明 19px 每行 17 字、最多 3 行）。
 *           右 1276：外框 4 ＋ p-4 32 ＋ 檢視區 1240 × 624 ＋ 12 ＋ 底列 48 ＝ 720。
 * 任何互動都不改變外框高度；沒有容器會捲動。浮水印在舞台右上：三頁根容器的右上角
 * 只有截圖的角落或架構圖的空白，按鈕與重點文字都不在那裡（第 46 頁的切換鈕放在底列）。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

/** 選取中的卡片：淡底一定配 6px 不透明左粗條 */
const CARD_ON = 'border-acid border-l-acid bg-acid/14';
const CARD_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

const BTN =
  'h-11 shrink-0 rounded-xl border px-5 text-[19px] whitespace-nowrap transition-colors duration-200';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 按鈕群組裡的按鍵不能讓簡報翻頁（空白鍵、方向鍵） */
function stopKeys(event: KeyboardEvent) {
  event.stopPropagation();
}

/** 按完就放掉焦點，避免之後按空白鍵重複觸發這個按鈕 */
function blurAfterClick(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.blur();
}

/* ══════════════════════════════════════════════════════════════
 * 第 44 頁 PracticeClaudeDemo — 實戰：Claude 系列
 *
 *   左上  日常開發：已經轉到 CODD（Claude Code CLI ＋ 自己開發的擴充）。
 *   左下  多專案管理：六個群組按鈕，點一個，右邊的實際畫面就框出那個群組。
 *   右    CODD 側欄截圖（放大 1.89 倍）。
 * ══════════════════════════════════════════════════════════════ */

type GroupId = 'needs-you' | 'pocketool' | 'casper' | 'domain' | 'codd' | 'hahow';

/** y0、y1 是群組在原圖（263 × 339）上的上下緣；左右一律 5–256 */
const GROUPS: readonly { id: GroupId; name: string; sub: string; y0: number; y1: number }[] = [
  { id: 'needs-you', name: 'NEEDS YOU', sub: '1 個待看 · claude-1a 已完成', y0: 9, y1: 63 },
  { id: 'pocketool', name: 'POCKETOOL 系列', sub: '2026-站群流量與變現、口袋工具-workspace', y0: 68, y1: 133 },
  { id: 'casper', name: '卡斯伯群組', sub: 'Casper Workspace、casper-small-games', y0: 139, y1: 205 },
  { id: 'domain', name: '新網域申請', sub: '收合中', y0: 210, y1: 231 },
  { id: 'codd', name: 'CODD 開發工具', sub: 'CODD 桌面版、2026-remote-claude-code', y0: 237, y1: 303 },
  { id: 'hahow', name: 'HAHOW 課程', sub: '收合中', y0: 308, y1: 330 },
];

const GROUP_IMG_W = 496;
const GROUP_IMG_H = 640;
/** 640 / 339 */
const GROUP_SCALE = GROUP_IMG_H / 339;

/** 第 43 頁 CODD 的特色，名稱縮短成標籤 */
const CODD_PARTS = ['Session 管理', '用量', '切換帳號', '文件管理', '系統狀況'] as const;

export function PracticeClaudeDemo() {
  const [picked, setPicked] = useState<GroupId | null>(null);
  const group = GROUPS.find((item) => item.id === picked) ?? null;

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[minmax(0,1fr)_560px] gap-6">
      {/* ── 左 ─────────────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        {/* 日常開發 */}
        <section className="flex h-[236px] shrink-0 flex-col gap-4 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel px-7 py-6">
          <div className="flex h-10 shrink-0 items-center gap-4">
            <span className={`${STEP_BADGE} border-paper text-paper`}>01</span>
            <span className={LABEL_FAINT}>日常開發</span>
          </div>
          <p className="text-[32px] leading-snug font-semibold text-paper">
            就大部分來講，我已經轉到自己開發的 CODD 了。
          </p>
          <div className="flex min-w-0 items-center gap-2 text-[20px] whitespace-nowrap text-muted">
            <span className="flex h-11 shrink-0 items-center rounded-xl border-2 border-paper px-4 font-mono text-[19px] text-paper">
              Claude Code（CLI）
            </span>
            <span className="text-[24px] text-paper">＋</span>
            <span className="flex h-11 shrink-0 items-center rounded-xl border-2 border-paper bg-paper px-4 text-[19px] font-semibold text-on-accent">
              CODD（自己開發的擴充）
            </span>
            <span className="mx-1 text-[24px] text-faint">→</span>
            {CODD_PARTS.map((part) => (
              <span
                key={part}
                className="flex h-9 shrink-0 items-center rounded-full border border-line bg-panel-lift px-3 text-[17px] text-muted"
              >
                {part}
              </span>
            ))}
          </div>
        </section>

        {/* 多專案管理 */}
        <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-line bg-panel px-7 py-6">
          <div className="flex h-10 shrink-0 items-center gap-4">
            <span className={`${STEP_BADGE} border-paper text-paper`}>02</span>
            <span className={LABEL_FAINT}>多專案管理</span>
            <span className="ml-auto text-[18px] text-muted">點一個群組，右邊的實際畫面會框出來</span>
          </div>
          <p className="h-10 shrink-0 text-[28px] leading-snug font-semibold text-paper">
            同時開非常多的專案，依類型分到不同的群組。
          </p>
          <div
            role="group"
            aria-label="CODD 側欄的群組"
            onKeyDown={stopKeys}
            className="mt-1 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3"
          >
            {GROUPS.map((item) => {
              const on = item.id === picked;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={(event) => {
                    setPicked(on ? null : item.id);
                    blurAfterClick(event);
                  }}
                  className={`flex min-w-0 flex-col justify-center gap-1 rounded-xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
                    on ? CARD_ON : CARD_OFF
                  }`}
                >
                  <span
                    className={`truncate font-mono text-[23px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}
                  >
                    {item.name}
                  </span>
                  <span className={`truncate text-[18px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── 右：CODD 側欄截圖 ─────────────────────────────── */}
      <figure className="flex min-h-0 flex-col items-center gap-3 rounded-2xl border border-line bg-ink-soft p-4">
        <div className="relative h-[640px] w-[496px] shrink-0">
          <img
            src={coddGroupsUrl}
            alt="CODD 側欄：專案依類型分成 NEEDS YOU、POCKETOOL 系列、卡斯伯群組、新網域申請、CODD 開發工具、HAHOW 課程六個群組"
            width={GROUP_IMG_W}
            height={GROUP_IMG_H}
            className="size-full rounded-lg"
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute rounded-lg border-[4px] border-acid transition-[top,height,opacity] duration-300 ${
              group ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: 5 * GROUP_SCALE - 6,
              width: 251 * GROUP_SCALE + 12,
              top: (group?.y0 ?? 0) * GROUP_SCALE - 6,
              height: ((group?.y1 ?? 0) - (group?.y0 ?? 0)) * GROUP_SCALE + 12,
            }}
          />
        </div>
        <figcaption className="shrink-0 text-center text-[17px] leading-snug text-faint">
          實際畫面：CODD 側欄的群組
        </figcaption>
      </figure>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 45 頁 PracticeDevicesDemo — 實戰：跨裝置的開發流程
 *
 *   左  三個步驟（照筆記原文）＋「看全貌」。
 *   右  架構圖（1152 × 716）：上方 GitHub Project「casper.tw 開發」，
 *       下方左邊是本地端（MacBook、Mac mini），右邊是雲端主機。
 *       點哪一步，那一步用到的線、節點與 Agent 欄位就用 acid 亮起來，其他退成虛線。
 *       沒選步驟（看全貌）時所有線都是實線 paper。
 *         ① MacBook → Project
 *         ② Mac mini ↔ Project、雲端主機 ↔ Project（Agent 欄位亮）
 *         ③ MacBook「瀏覽器」→ Mac mini「CODD 網頁版」（兩個 chip 與 Mac mini 亮）
 *       Mac mini 多一個「CODD 網頁版」chip，所以它比另外兩台高（200 → 236），
 *       用掉的是原本 MacBook → 雲端主機那條弧線留下的底部空間。
 * ══════════════════════════════════════════════════════════════ */

type DeviceStep = 1 | 2 | 3;

const DEVICE_STEPS: readonly { step: DeviceStep; name: string; text: string }[] = [
  {
    step: 1,
    name: '開啟 Project',
    text: '在 GitHub 開一個 Project（casper.tw 開發），當作跨裝置協同的唯一工作來源。',
  },
  {
    step: 2,
    name: '讀取同一個 Project、Agent 登記',
    text: '每台裝置都讀同一個 Project；正在做的卡片，在 Agent 欄位登記「模型 / 裝置 / session」。',
  },
  {
    step: 3,
    name: '用 CODD 網頁版控制另一台',
    text: 'CODD 網頁版跑在 Mac mini 上。人不在它前面時，用手邊裝置的瀏覽器打開，直接操作上面的 session。',
  },
];

type ArrowTone = 'paper' | 'acid' | 'line';

/** 線的樣式：沒選步驟 → paper 實線；選了步驟 → 這一步 acid 粗線、其他 line 虛線 */
function lineStyle(current: DeviceStep | null, step: DeviceStep) {
  if (current === null) return { tone: 'paper' as ArrowTone, width: 2.5, dashed: false };
  if (current === step) return { tone: 'acid' as ArrowTone, width: 4.5, dashed: false };
  return { tone: 'line' as ArrowTone, width: 2.5, dashed: true };
}

function DeviceLine({
  d,
  current,
  step,
  both = false,
}: {
  d: string;
  current: DeviceStep | null;
  step: DeviceStep;
  both?: boolean;
}) {
  const { tone, width, dashed } = lineStyle(current, step);
  return (
    <path
      d={d}
      fill="none"
      stroke={`var(--color-${tone})`}
      strokeWidth={width}
      strokeDasharray={dashed ? '9 7' : undefined}
      strokeLinecap="round"
      markerEnd={`url(#practice-arrow-${tone})`}
      markerStart={both ? `url(#practice-arrow-${tone})` : undefined}
      className="transition-[stroke,stroke-width] duration-300"
    />
  );
}

/**
 * 線上的步驟編號。亮起時用「紙底＋粗 acid 框＋acid 字」而不是實心 acid 圓配白字：
 * 稽核腳本的 SVG 對比是拿字跟 SVG 外層底色比，算不到圓本身，實心圓會被誤判成 1:1。
 */
function StepDot({ x, y, current, step }: { x: number; y: number; current: DeviceStep | null; step: DeviceStep }) {
  const on = current === step;
  const dim = current !== null && !on;
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={17}
        fill="var(--color-panel)"
        stroke={on ? 'var(--color-acid)' : dim ? 'var(--color-line)' : 'var(--color-paper)'}
        strokeWidth={on ? 4 : 2.5}
        className="transition-[stroke,stroke-width] duration-300"
      />
      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fontFamily="var(--font-mono)"
        fill={on ? 'var(--color-acid)' : dim ? 'var(--color-faint)' : 'var(--color-paper)'}
      >
        {step}
      </text>
    </g>
  );
}

/** 節點裡的 chip：第一個的上緣在 y 566，往下每個 46 高、間隔 10 */
const CHIP_TOP = 566;
const CHIP_H = 46;
const CHIP_STEP = CHIP_H + 10;

function DeviceNode({
  x,
  w,
  h = 200,
  title,
  sub,
  chips,
  lit,
  dim,
}: {
  x: number;
  w: number;
  /** 一個 chip 200；兩個 chip 236 */
  h?: number;
  title: string;
  sub: string;
  chips: readonly { label: string; lit?: boolean }[];
  lit: boolean;
  dim: boolean;
}) {
  const cx = x + w / 2;
  const chipW = 224;
  const text = dim ? 'var(--color-muted)' : 'var(--color-paper)';
  return (
    <g>
      <rect
        x={x}
        y={450}
        width={w}
        height={h}
        rx={18}
        fill="var(--color-ink-soft)"
        stroke={lit ? 'var(--color-acid)' : dim ? 'var(--color-line)' : 'var(--color-paper)'}
        strokeWidth={lit ? 4 : 2}
        className="transition-[stroke,stroke-width] duration-300"
      />
      <text x={cx} y={502} textAnchor="middle" fontSize={30} fontWeight={700} fill={text}>
        {title}
      </text>
      <text x={cx} y={536} textAnchor="middle" fontSize={20} fill="var(--color-muted)">
        {sub}
      </text>
      {chips.map((chip, index) => {
        const top = CHIP_TOP + index * CHIP_STEP;
        return (
          <g key={chip.label}>
            <rect
              x={cx - chipW / 2}
              y={top}
              width={chipW}
              height={CHIP_H}
              rx={CHIP_H / 2}
              fill="var(--color-panel)"
              stroke={chip.lit ? 'var(--color-acid)' : 'var(--color-line)'}
              strokeWidth={chip.lit ? 3.5 : 1.5}
              className="transition-[stroke,stroke-width] duration-300"
            />
            <text
              x={cx}
              y={top + 29}
              textAnchor="middle"
              fontSize={18}
              fontWeight={chip.lit ? 700 : 400}
              fill={text}
            >
              {chip.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** 1152 × 716 的架構圖 */
function DevicesDiagram({ current }: { current: DeviceStep | null }) {
  const projectLit = current === 1 || current === 2;
  const agentLit = current === 2;
  const dimFor = (steps: readonly DeviceStep[]) => current !== null && !steps.includes(current);

  return (
    <svg width={1152} height={716} viewBox="0 0 1152 716" role="img">
      <title>
        跨裝置的開發流程：GitHub Project 是唯一的工作來源，本地端與雲端的機器都讀它、在卡片上登記
        Agent；CODD 網頁版跑在 Mac mini 上，人不在它前面時，用 MacBook 的瀏覽器打開它來操作
      </title>
      <defs>
        {(['paper', 'acid', 'line'] as const).map((tone) => (
          <marker
            key={tone}
            id={`practice-arrow-${tone}`}
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={14}
            markerHeight={14}
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={`var(--color-${tone})`} />
          </marker>
        ))}
      </defs>

      <text x={28} y={44} fontSize={17} fill="var(--color-faint)" letterSpacing="0.12em">
        架構示意
      </text>

      {/* ── GitHub Project ── */}
      <rect
        x={336}
        y={24}
        width={480}
        height={236}
        rx={20}
        fill="var(--color-ink-soft)"
        stroke={projectLit ? 'var(--color-acid)' : current === null ? 'var(--color-paper)' : 'var(--color-line)'}
        strokeWidth={projectLit ? 4.5 : 2.5}
        className="transition-[stroke,stroke-width] duration-300"
      />
      <text x={576} y={66} textAnchor="middle" fontSize={30} fontWeight={700} fill="var(--color-paper)">
        GitHub Project
      </text>
      <text x={576} y={98} textAnchor="middle" fontSize={22} fill="var(--color-paper)">
        casper.tw 開發
      </text>
      <text x={576} y={127} textAnchor="middle" fontSize={18} fill="var(--color-muted)">
        跨裝置協同的唯一工作來源
      </text>
      {/* 一張卡片 */}
      <rect x={362} y={144} width={428} height={102} rx={12} fill="var(--color-panel)" stroke="var(--color-line)" strokeWidth={1.5} />
      <text x={382} y={172} fontSize={18} fill="var(--color-paper)">
        卡片：音效站，音效增加到 10 萬列
      </text>
      <rect
        x={374}
        y={186}
        width={404}
        height={46}
        rx={10}
        fill="var(--color-panel)"
        stroke={agentLit ? 'var(--color-acid)' : 'var(--color-line)'}
        strokeWidth={agentLit ? 3.5 : 1.5}
        className="transition-[stroke,stroke-width] duration-300"
      />
      <text x={390} y={215} fontSize={17} fill={agentLit ? 'var(--color-acid)' : 'var(--color-muted)'} fontWeight={agentLit ? 700 : 400}>
        Agent：Opus 5.5 / 卡斯伯's Mac mini / …
      </text>

      {/* ── 區域 ── */}
      <rect x={20} y={404} width={692} height={304} rx={22} fill="none" stroke="var(--color-line)" strokeWidth={2} strokeDasharray="10 8" />
      <text x={42} y={436} fontSize={18} fill="var(--color-muted)" letterSpacing="0.12em">
        本地端
      </text>
      <rect x={744} y={404} width={388} height={304} rx={22} fill="none" stroke="var(--color-line)" strokeWidth={2} strokeDasharray="10 8" />
      <text x={766} y={436} fontSize={18} fill="var(--color-muted)" letterSpacing="0.12em">
        雲端
      </text>

      {/* ── 線（先畫線，節點蓋在上面） ── */}
      {/* ① MacBook 開啟 Project */}
      <DeviceLine d="M 178 446 C 178 350, 380 340, 400 266" current={current} step={1} />
      {/* ② Mac mini、雲端主機 讀取 ↔ 登記 */}
      <DeviceLine d="M 542 446 C 542 360, 576 340, 576 266" current={current} step={2} both />
      <DeviceLine d="M 938 446 C 938 350, 760 330, 752 266" current={current} step={2} both />
      {/* ③ MacBook 的瀏覽器（第一個 chip，y 589）→ Mac mini 上的 CODD 網頁版（第二個 chip，y 645） */}
      <DeviceLine d="M 312 589 C 359 589, 359 645, 406 645" current={current} step={3} />

      {/* ── 節點 ── */}
      <DeviceNode
        x={48}
        w={260}
        title="MacBook"
        sub="手邊的筆電"
        chips={[{ label: '瀏覽器', lit: current === 3 }]}
        lit={current === 1}
        dim={dimFor([1, 3])}
      />
      <DeviceNode
        x={412}
        w={260}
        h={236}
        title="Mac mini"
        sub="開發機"
        chips={[{ label: 'Claude Code ＋ CODD' }, { label: 'CODD 網頁版', lit: current === 3 }]}
        lit={current === 2 || current === 3}
        dim={dimFor([2, 3])}
      />
      <DeviceNode
        x={786}
        w={304}
        title="雲端主機"
        sub="遠端的開發機"
        chips={[{ label: 'Claude Code ＋ CODD' }]}
        lit={current === 2}
        dim={dimFor([2])}
      />

      {/* ── 步驟編號 ── */}
      <StepDot x={282} y={348} current={current} step={1} />
      <StepDot x={559} y={352} current={current} step={2} />
      <StepDot x={847} y={345} current={current} step={2} />
      <StepDot x={359} y={617} current={current} step={3} />
    </svg>
  );
}

export function PracticeDevicesDemo() {
  const [current, setCurrent] = useState<DeviceStep | null>(null);

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[560px_1fr] gap-6">
      {/* ── 左：三個步驟 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3" role="group" aria-label="跨裝置流程的步驟" onKeyDown={stopKeys}>
        <div className="flex h-[104px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl border border-l-[6px] border-line border-l-paper bg-panel-lift px-6">
          <span className={LABEL_FAINT}>已經定義好的開發流程</span>
          <p className="text-[25px] leading-snug font-semibold text-paper">換一台裝置，也能接著開發。</p>
        </div>

        {DEVICE_STEPS.map((item) => {
          const on = item.step === current;
          return (
            <button
              key={item.step}
              type="button"
              aria-pressed={on}
              onClick={(event) => {
                setCurrent(on ? null : item.step);
                blurAfterClick(event);
              }}
              className={`flex min-h-0 flex-1 items-start gap-4 rounded-2xl border border-l-[6px] px-5 py-4 text-left transition-colors duration-200 ${
                on ? CARD_ON : CARD_OFF
              }`}
            >
              <span
                className={`${STEP_BADGE} mt-0.5 ${on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'}`}
              >
                {item.step}
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className={`text-[25px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
                <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>{item.text}</span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={current === null}
          onClick={(event) => {
            setCurrent(null);
            blurAfterClick(event);
          }}
          className={`${BTN} h-[52px] ${
            current === null
              ? 'border-paper bg-paper font-semibold text-on-accent'
              : 'border-line bg-panel text-paper hover:border-acid'
          }`}
        >
          看全貌
        </button>
      </div>

      {/* ── 右：架構圖 ───────────────────────────────────── */}
      <div className="h-[720px] overflow-hidden rounded-2xl border-2 border-line bg-panel">
        <DevicesDiagram current={current} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 46 頁 PracticeDevicesShotsDemo — 實戰：跨裝置流程的實際畫面
 *
 *   左  三個步驟（同第 45 頁），點哪一步換哪一張截圖。
 *   右  檢視區 1240 × 624：預設放大到重點區域，底列可以切「全圖」或另一個重點。
 *       圖用 background 畫（大小、位置用算的），所以放大不是靠 overflow 裁切；
 *       全圖時框出所有重點，放大時只框目前那一個。
 * ══════════════════════════════════════════════════════════════ */

const VIEW_W = 1240;
const VIEW_H = 624;

/** 重點區域：x、y、w、h 是截圖檔（webp）的像素座標；k 是放大倍率（檢視區像素 ÷ 原圖像素） */
interface Spot {
  label: string;
  rect: readonly [number, number, number, number];
  k: number;
}

interface Shot {
  step: DeviceStep;
  name: string;
  text: string;
  src: string;
  alt: string;
  natW: number;
  natH: number;
  note: string;
  spots: readonly Spot[];
}

const SHOTS: readonly Shot[] = [
  {
    step: 1,
    name: '開啟 Project',
    text: 'GitHub Projects 裡的「casper.tw 開發」：部落格、工具、workspace 跨裝置協同的唯一工作來源。',
    src: githubProjectsUrl,
    alt: 'GitHub Projects 列表：casper.tw 開發（跨裝置協同的唯一工作來源）與口袋工具開發，兩個都是 Private',
    natW: 1600,
    natH: 483,
    note: '實際畫面：GitHub Projects',
    spots: [{ label: 'casper.tw 開發', rect: [24, 135, 786, 165], k: 1.3 }],
  },
  {
    step: 2,
    name: 'Agent 登記',
    text: '卡片右側的 Agent 欄位：Opus 5.5 / 卡斯伯\'s Mac mini / session id，看一眼就知道哪台在做。',
    src: githubProjectCardUrl,
    alt: 'GitHub Project 的一張卡片「音效站：音效增加到 10 萬列」，右側 Agent 欄位寫著 Opus 5.5 / 卡斯伯\'s Mac mini / 24525c',
    natW: 1600,
    natH: 1230,
    note: '實際畫面：Project 卡片（紅框是原圖就有的）',
    spots: [{ label: 'Agent 欄位', rect: [1076, 870, 524, 126], k: 1.15 }],
  },
  {
    step: 3,
    name: 'CODD 網頁版',
    text: '瀏覽器裡看得到 Mac mini 上的每個 session，可以直接送訊息，也能按 ESC、TAB、方向鍵。',
    src: coddWebRemoteUrl,
    alt: 'CODD 網頁版：左側列出 Mac mini 上的五個 session，右側是 casper-workspace 的 Claude Code 對話，下方有訊息輸入框與 ESC、TAB、方向鍵等按鍵',
    natW: 1920,
    natH: 986,
    note: '實際畫面：CODD 網頁版（帳號與 IP 已模糊處理）',
    spots: [
      { label: 'Mac mini 上的 sessions', rect: [0, 62, 302, 356], k: 1.45 },
      { label: '送指令與按鍵', rect: [318, 724, 742, 192], k: 1.35 },
    ],
  },
];

interface ViewBox {
  k: number;
  x0: number;
  y0: number;
}

function clampRange(value: number, lo: number, hi: number) {
  if (hi < lo) return (lo + hi) / 2;
  return Math.max(lo, Math.min(value, hi));
}

/** spot 為 null → 全圖（contain、置中）；否則以重點區域的中心放大 */
function viewOf(shot: Shot, spot: Spot | null): ViewBox {
  if (!spot) {
    const k = Math.min(VIEW_W / shot.natW, VIEW_H / shot.natH);
    return { k, x0: (shot.natW - VIEW_W / k) / 2, y0: (shot.natH - VIEW_H / k) / 2 };
  }
  const { k } = spot;
  const [x, y, w, h] = spot.rect;
  const viewW = VIEW_W / k;
  const viewH = VIEW_H / k;
  return {
    k,
    x0: clampRange(x + w / 2 - viewW / 2, 0, shot.natW - viewW),
    y0: clampRange(y + h / 2 - viewH / 2, 0, shot.natH - viewH),
  };
}

function ShotViewer({ shot }: { shot: Shot }) {
  /** -1 是全圖，其他是 spots 的索引；換截圖時整個重掛，回到第一個重點 */
  const [view, setView] = useState(0);
  const spot = view >= 0 ? (shot.spots[view] ?? null) : null;
  const box = viewOf(shot, spot);
  const marks = spot ? [spot] : shot.spots;

  const options: { id: number; label: string }[] = [
    ...shot.spots.map((item, index) => ({ id: index, label: `放大：${item.label}` })),
    { id: -1, label: '全圖' },
  ];

  return (
    <figure className="flex h-[720px] min-w-0 flex-col gap-3 rounded-2xl border-2 border-line bg-ink-soft p-4">
      <div className="relative h-[624px] w-[1240px] shrink-0 rounded-lg [clip-path:inset(0_round_0.5rem)]">
        <div
          role="img"
          aria-label={shot.alt}
          className="absolute inset-0 bg-no-repeat transition-[background-size,background-position] duration-300"
          style={{
            backgroundImage: `url(${shot.src})`,
            backgroundSize: `${shot.natW * box.k}px ${shot.natH * box.k}px`,
            backgroundPosition: `${-box.x0 * box.k}px ${-box.y0 * box.k}px`,
          }}
        />
        {marks.map((item) => {
          const [x, y, w, h] = item.rect;
          return (
            <span
              key={item.label}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-lg border-[4px] border-acid transition-[left,top,width,height] duration-300"
              style={{
                left: (x - box.x0) * box.k - 6,
                top: (y - box.y0) * box.k - 6,
                width: w * box.k + 12,
                height: h * box.k + 12,
              }}
            />
          );
        })}
      </div>

      <div className="flex h-12 shrink-0 items-center gap-3">
        <div role="group" aria-label="檢視方式" onKeyDown={stopKeys} className="flex shrink-0 items-center gap-2">
          {options.map((option) => {
            const on = option.id === view;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={(event) => {
                  setView(option.id);
                  blurAfterClick(event);
                }}
                className={`${BTN} ${
                  on
                    ? 'border-paper bg-paper font-semibold text-on-accent'
                    : 'border-line bg-panel text-paper hover:border-acid'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <figcaption className="ml-auto truncate text-[17px] text-faint">{shot.note}</figcaption>
      </div>
    </figure>
  );
}

export function PracticeDevicesShotsDemo() {
  const [step, setStep] = useState<DeviceStep>(1);
  const shot = SHOTS.find((item) => item.step === step) ?? SHOTS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[440px_1fr] gap-6">
      {/* ── 左：三個步驟 ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-3" role="group" aria-label="切換截圖" onKeyDown={stopKeys}>
        <span className={`${LABEL_FAINT} flex h-7 shrink-0 items-center`}>對應上一頁的三個步驟</span>
        {SHOTS.map((item) => {
          const on = item.step === step;
          return (
            <button
              key={item.step}
              type="button"
              aria-pressed={on}
              onClick={(event) => {
                setStep(item.step);
                blurAfterClick(event);
              }}
              className={`flex min-h-0 flex-1 items-start gap-4 rounded-2xl border border-l-[6px] px-5 py-5 text-left transition-colors duration-200 ${
                on ? CARD_ON : CARD_OFF
              }`}
            >
              <span
                className={`${STEP_BADGE} mt-0.5 ${on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'}`}
              >
                {pad2(item.step)}
              </span>
              <span className="flex min-w-0 flex-col gap-2">
                <span className={`text-[26px] leading-tight text-paper ${on ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
                <span className={`text-[19px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>{item.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 右：截圖 ─────────────────────────────────────── */}
      <ShotViewer key={shot.step} shot={shot} />
    </div>
  );
}
