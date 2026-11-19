import { useState } from 'react';
import coverUrl from './images/cover.png';

/* ══════════════════════════════════════════════════════════════
 * 〈5 種 SubAgent 協作模式〉— 開場與章節頁
 *
 *   第 1 頁        CoverDemo      封面（bare，左標題、右 Codex 插圖）
 *   第 2 頁        RoadmapDemo    五個 Level 的階梯，點一階看說明
 *   第 4/8/11/15/19 頁  Level1Cover … Level5Cover  章節頁（bare）
 *
 * 封面與章節頁不用 `title` 版型：`title` 的圖框是為 SVG 素材準備的 420px
 * `bg-paper` 深色底板，這份的插圖是紙面風格的橫幅點陣圖，放進去會被壓成
 * 小方塊、外面還多一圈深框。章節頁右側另外放一條五階的進度，讓學員知道
 * 現在走到第幾階。字級照抄 `SlideBodyView` 的 TitleBody（kicker 22、
 * 大標 92、導言 26）。
 *
 * 用色：只有 acid（目前這一階）。其他階一律 muted／line。
 * 高度預算：Roadmap 根容器 h-[720px]；封面與章節頁是 bare，撐滿 848。
 * ══════════════════════════════════════════════════════════════ */

/* ── 五個 Level ─────────────────────────────────────────── */

type LevelNo = 1 | 2 | 3 | 4 | 5;

interface Level {
  no: LevelNo;
  name: string;
  summary: string;
  /** 總覽頁下方那一行：這一階要看的重點 */
  focus: string;
}

const LEVELS: readonly Level[] = [
  {
    no: 1,
    name: '基礎 SubAgent',
    summary: '一個 Agent 開始把工作交給其他 Agent',
    focus: '主 Agent 是跟你對話的那一位，SubAgent 由它指派、幫它分擔工作。',
  },
  {
    no: 2,
    name: 'Ultra Code',
    summary: '多個 Agent 平行處理不同任務',
    focus: 'Claude Code 的 dynamic workflows：一次開出十幾個 SubAgent 分頭處理。',
  },
  {
    no: 3,
    name: 'Loop Engineering',
    summary: '讓 Agent 可以持續循環工作、驗證、修正',
    focus: '寫程式、跑測試、失敗就修，繞回圈的不再是人，而是 AI 自己。',
  },
  {
    no: 4,
    name: 'Remote Agent',
    summary: '工作不再綁在自己的電腦前',
    focus: '用手機控制另一台電腦上的 Agent，或讓它在獨立裝置上照排程工作。',
  },
  {
    no: 5,
    name: 'Hermes Agent',
    summary: '開始出現 PM Agent，由 Agent 管理其他 Coding Agent',
    focus: '裝在自己電腦上的 Agent，串通訊工具、混用模型、再派 SubAgent 做事。',
  },
];

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 每一階的小圖示（currentColor，跟著外層的 text-* 走）─────── */

function LevelGlyph({ no }: { no: LevelNo }) {
  const common = {
    width: 200,
    height: 110,
    viewBox: '0 0 200 110',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (no === 1) {
    return (
      <svg {...common}>
        {[22, 55, 88].map((y) => (
          <line key={y} x1={62} y1={55} x2={136} y2={y} strokeWidth={2} />
        ))}
        <circle cx={44} cy={55} r={20} fill="currentColor" />
        {[22, 55, 88].map((y) => (
          <circle key={y} cx={150} cy={y} r={12} />
        ))}
      </svg>
    );
  }

  if (no === 2) {
    const dots = [];
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        dots.push(
          <circle
            key={`${row}-${col}`}
            cx={112 + col * 22}
            cy={22 + row * 22}
            r={7}
          />,
        );
      }
    }
    return (
      <svg {...common}>
        <line x1={62} y1={55} x2={96} y2={55} strokeWidth={2} />
        <circle cx={44} cy={55} r={20} fill="currentColor" />
        {dots}
      </svg>
    );
  }

  if (no === 3) {
    return (
      <svg {...common}>
        <path d="M 138 34 A 40 40 0 1 0 140 78" />
        <path d="M 128 22 L 140 34 L 124 40" />
        <circle cx={100} cy={55} r={14} fill="currentColor" />
      </svg>
    );
  }

  if (no === 4) {
    return (
      <svg {...common}>
        <rect x={20} y={20} width={40} height={72} rx={8} />
        <line x1={34} y1={82} x2={46} y2={82} />
        <line x1={70} y1={56} x2={116} y2={56} strokeDasharray="6 7" />
        <rect x={126} y={24} width={60} height={42} rx={4} />
        <path d="M 116 80 L 196 80 L 188 70 L 124 70 Z" />
        <circle cx={156} cy={45} r={8} fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x={84} y={6} width={32} height={26} rx={6} fill="currentColor" />
      {[40, 100, 160].map((x) => (
        <g key={x}>
          <line x1={100} y1={32} x2={x} y2={52} strokeWidth={2} />
          <circle cx={x} cy={62} r={10} />
          <line x1={x} y1={72} x2={x - 12} y2={90} strokeWidth={2} />
          <line x1={x} y1={72} x2={x + 12} y2={90} strokeWidth={2} />
          <circle cx={x - 12} cy={96} r={5} />
          <circle cx={x + 12} cy={96} r={5} />
        </g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 1 頁 · CoverDemo
 * ══════════════════════════════════════════════════════════════ */

export function CoverDemo() {
  return (
    <div className="flex h-full w-full items-center gap-16">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          SubAgent Patterns
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          5 種 SubAgent
          <br />
          協作模式
        </h2>
        <p className="mt-8 max-w-[760px] text-[26px] leading-[1.75] text-muted">
          這篇想跟大家分享 SubAgent 是做什麼使用的。
        </p>
        <p className="mt-5 max-w-[760px] text-[26px] leading-[1.75] text-muted">
          從一個 Agent 把工作交給其他 Agent 開始，一路走到由 Agent 管理其他 Coding Agent。
        </p>
      </div>
      <div className="grid h-[640px] w-[900px] shrink-0 place-items-center overflow-hidden rounded-3xl border border-line bg-panel">
        <img
          src={coverUrl}
          alt="一位主 Agent 把任務卡分派給四位各自工作的小助手"
          className="size-full object-contain"
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 2 頁 · RoadmapDemo — 五個 Level 的階梯
 *
 * 五根由左往右變高的柱子，點一根，下方換成那一階的重點。
 * 柱高 300 → 460（每階 +40），加上下方說明 176 與 gap 40，總高 676。
 * ══════════════════════════════════════════════════════════════ */

const STEP_HEIGHTS: Record<LevelNo, string> = {
  1: 'h-[300px]',
  2: 'h-[340px]',
  3: 'h-[380px]',
  4: 'h-[420px]',
  5: 'h-[460px]',
};

export function RoadmapDemo() {
  const [current, setCurrent] = useState<LevelNo>(1);
  const level = LEVELS[current - 1];

  return (
    <div className="flex h-[720px] w-full max-w-[1740px] flex-col justify-center gap-10">
      <div className="flex items-end gap-5">
        {LEVELS.map((item) => {
          const active = item.no === current;
          return (
            <button
              key={item.no}
              type="button"
              onClick={() => setCurrent(item.no)}
              className={`flex flex-1 flex-col justify-between rounded-2xl border border-t-[6px] px-6 pt-5 pb-6 text-left transition-colors duration-300 ${
                STEP_HEIGHTS[item.no]
              } ${
                active
                  ? 'border-acid bg-acid/14'
                  : 'border-line border-t-line bg-panel hover:border-acid/55'
              }`}
            >
              <div>
                <p
                  className={`font-display text-[20px] tracking-[0.16em] uppercase ${
                    active ? 'text-acid' : 'text-faint'
                  }`}
                >
                  Level {pad2(item.no)}
                </p>
                <p className="mt-2 font-display text-[32px] leading-tight font-semibold text-paper">
                  {item.name}
                </p>
              </div>
              <div className={active ? 'text-acid' : 'text-muted'}>
                <LevelGlyph no={item.no} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex h-[176px] items-center gap-10 rounded-2xl border border-l-[6px] border-line border-l-acid bg-panel px-10">
        <p className="font-display text-[72px] leading-none font-semibold text-acid tabular-nums">
          {pad2(level.no)}
        </p>
        <div className="min-w-0">
          <p className="text-[30px] leading-snug font-medium text-paper">
            {level.summary}
          </p>
          <p className="mt-2 text-[22px] leading-normal text-muted">
            {level.focus}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 章節頁 · Level1Cover … Level5Cover
 *
 * 左邊是 TitleBody 的字級；右邊一條五階的進度，目前這一階 acid 粗條。
 * ══════════════════════════════════════════════════════════════ */

const LEVEL_LEADS: Record<LevelNo, string> = {
  1: '先從最基本的開始：跟你對話的主 Agent，開始把工作交給其他 Agent。',
  2: '知道派工的好處之後，下一步是一次派出一大群 SubAgent，讓它們平行處理。',
  3: '不只是派工，而是讓 Agent 自己寫、自己驗證、自己修正，一圈一圈做下去。',
  4: '原本要坐在電腦前打 prompt，現在拿起手機就能指揮另一台電腦上的 Agent。',
  5: 'Hermes Agent 跟 OpenClaw 有點像：一個裝在你自己電腦上、能再去管理其他 Agent 的 Agent。',
};

function LevelCover({ no }: { no: LevelNo }) {
  const level = LEVELS[no - 1];

  return (
    <div className="flex h-full w-full items-center gap-20">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
          Level {pad2(no)}
        </p>
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          {level.name}
        </h2>
        <p className="mt-8 max-w-[1000px] text-[30px] leading-[1.6] font-medium text-paper">
          {level.summary}
        </p>
        <p className="mt-5 max-w-[1000px] text-[26px] leading-[1.75] text-muted">
          {LEVEL_LEADS[no]}
        </p>
      </div>

      <ol className="flex w-[520px] shrink-0 flex-col gap-3">
        {LEVELS.map((item) => {
          const active = item.no === no;
          return (
            <li
              key={item.no}
              className={`flex items-center gap-5 rounded-xl border border-l-[6px] px-6 py-4 ${
                active
                  ? 'border-acid bg-acid/14'
                  : 'border-line border-l-line bg-panel'
              }`}
            >
              <span
                className={`font-display text-[28px] leading-none font-semibold tabular-nums ${
                  active ? 'text-acid' : 'text-faint'
                }`}
              >
                {pad2(item.no)}
              </span>
              <span
                className={`text-[24px] ${
                  active ? 'font-medium text-paper' : 'text-muted'
                }`}
              >
                {item.name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Level1Cover() {
  return <LevelCover no={1} />;
}

export function Level2Cover() {
  return <LevelCover no={2} />;
}

export function Level3Cover() {
  return <LevelCover no={3} />;
}

export function Level4Cover() {
  return <LevelCover no={4} />;
}

export function Level5Cover() {
  return <LevelCover no={5} />;
}
