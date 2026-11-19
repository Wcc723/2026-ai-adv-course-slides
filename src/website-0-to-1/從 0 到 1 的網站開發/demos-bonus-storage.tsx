import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StorageMap, type StorageMapProps } from './diagrams-bonus';

/* ════════════════════════════════════════════════════════════
 * 第 37 頁 · StorageDemo — D1 與 R2：資料庫與檔案上傳空間
 *
 * 殼照第 26 頁（SiteCautionsDemo）：左邊四個直式頁籤，選中的那一個跟
 * 右邊的面板接在一起；面板是標題 ＋ 導言 ＋ 圖 ＋ 底部一行出處。
 * 圖照第 25 頁的 ArchMap：同一張「延伸版」運作概念圖（diagrams-bonus 的
 * StorageMap）四個頁籤都在，只換「哪裡亮、哪裡變紅」。
 *
 *   01 D1 資料庫        點亮 後端↔D1；右邊一張 todos 迷你資料表，
 *                        按「新增一筆待辦」看資料一路流進 D1、多一列
 *   02 R2 檔案上傳空間  點亮 後端↔R2（D1 淡淡亮著，因為它記檔名）；
 *                        「附上一張照片 → 打開這張照片」兩段流程
 *   03 沒有備份          D1、R2 轉 coral，外框外面一格虛線的「官方備份？」；
 *                        可以切到「自己另存一份」看看你能做的事
 *   04 沒有保證          外框改成 coral 虛線 ＋ Beta 徽章；
 *                        點條款的任一條，圖跟著變（斷線、問號、下架、刪除）
 * 頁籤之間用 key 重設狀態，照第 26 頁的做法。
 *
 * 融合前面的概念：導言各用一句話點回第 16 頁（資料庫的角色）、
 * 第 25 頁（Sites 附了 D1、R2，這堂課沒用到）、第三章（Google 試算表）、
 * 第 26 頁（資料庫沒有備份與保證）。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（2026-09 的狀態，ChatGPT Sites 是 public beta，會過期）
 * ──────────────────────────────────────────────────────────────
 * - learn.chatgpt.com/docs/sites：D1、R2 由 Sites 提供，部署時自動建立；
 *   每個網站的資料庫 10 GB。
 * - github.com/Wcc723/chatgpt-sites-d1-r2-skill：R2 沒有公開網址、要透過
 *   程式讀取並先確認是本人；目前沒有官方工具能匯出／清空正式資料庫，
 *   也不能從 ChatGPT 列出或批次刪除正式環境 R2 的檔案。
 * - ChatGPT Sites 條款（openai.com/policies）：不保證不中斷、不保證內容
 *   不遺失、保留隨時下架網站的權利。刪除網站的說法同第 26 頁。
 * - 資料表的長相照範例 Todo 手帳（一列待辦 ＋ 照片檔名、照片放 R2）；
 *   畫面上的待辦、人名、檔名、檔案大小都是示意。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（整頁兩支）
 * ──────────────────────────────────────────────────────────────
 *   teal   D1、R2、資料流、你能做的事（頁籤 01、02）
 *   coral  風險（頁籤 03、04，同第 26 頁）
 * 選中的按鈕用中性深色小色塊（bg-paper ＋ text-on-accent），不佔額度。
 * 淡填色一律配 6px 不透明左粗條或實色邊框；實心色塊上的字用 text-on-accent。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 根容器 h-[700px] max-w-[1740px]，同第 25、26 頁。
 * 右側面板 py-8：標題 40 ＋ 8 ＋ 導言 30 ＋ 20 ＋ 圖 ≈ 498 ＋ 16 ＋ 出處 24。
 * 圖那一列：左邊 660 寬的 StorageMap（viewBox 660×496，1:1），
 * 右邊約 540 寬的說明與互動。沒有任何容器會捲動，未輪到的內容一律不掛。
 * 右上角（浮水印的位置）只有標題列的空白，沒有按鈕。
 * ════════════════════════════════════════════════════════════ */

/* ── 共用零件 ─────────────────────────────────────────────── */

/** 標籤裡會出現檔名、英文名，所以不用 uppercase */
const LABEL = 'font-display text-[17px] tracking-[0.12em] text-faint';

const BTN = 'h-11 shrink-0 rounded-xl border px-5 text-[19px] transition-colors duration-200';
const BTN_MAIN = `${BTN} border-paper bg-paper text-on-accent hover:bg-muted hover:border-muted`;
const BTN_GHOST = `${BTN} border-line bg-panel text-muted hover:border-faint hover:text-paper`;
const BTN_OFF = `${BTN} cursor-default border-line-soft bg-panel text-faint`;

/**
 * 依序播放幾拍，每拍間隔 gap 毫秒。phase = -1 代表還沒開始。
 * 計時器放在同一個陣列裡，卸載（切頁籤）時一次清掉。
 */
function usePlayer(gap = 650) {
  const [phase, setPhase] = useState(-1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.splice(0).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const stop = () => {
    timers.current.splice(0).forEach((id) => window.clearTimeout(id));
  };

  const play = (count: number) => {
    stop();
    setPhase(0);
    for (let index = 1; index < count; index += 1) {
      timers.current.push(window.setTimeout(() => setPhase(index), gap * index));
    }
  };

  const reset = () => {
    stop();
    setPhase(-1);
  };

  return { phase, play, reset };
}

/** 左邊放圖、右邊放說明的那一列 */
function FigureRow({ map, children }: { map: StorageMapProps; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 gap-7">
      <div className="h-full w-[660px] shrink-0 rounded-2xl border border-line bg-panel-lift">
        <StorageMap {...map} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

/** 流程的一拍：到了是實心 teal 圓，還沒到是灰框 */
function StepBadge({ no, reached }: { no: number; reached: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[17px] transition-colors duration-300 ${
        reached ? 'bg-teal text-on-accent' : 'border border-line bg-panel text-faint'
      }`}
    >
      {no}
    </span>
  );
}

/** 「你能做的」提示：teal 左粗條，淡底上的字用 paper */
function TipBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-5 py-4">
      <span className="text-[17px] font-semibold tracking-[0.12em] text-paper">你能做的</span>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 頁籤
 * ════════════════════════════════════════════════════════════ */

type TabId = 'd1' | 'r2' | 'backup' | 'guarantee';
type Accent = 'teal' | 'coral';

interface Tab {
  id: TabId;
  no: string;
  title: string;
  sub: string;
  accent: Accent;
  headline: string;
  lead: string;
  source: string;
}

const SOURCE_DATA = 'learn.chatgpt.com/docs/sites · chatgpt-sites-d1-r2 Skill · 2026-09';
const SOURCE_RISK =
  'learn.chatgpt.com/docs/sites · ChatGPT Sites 條款（openai.com/policies）· 2026-09';

const TABS: readonly Tab[] = [
  {
    id: 'd1',
    no: '01',
    title: 'D1 資料庫',
    sub: '存文字與數字，一列一筆',
    accent: 'teal',
    headline: 'D1 是網站的資料庫：一列一筆，存文字與數字',
    lead: '就是第 16 頁講的「資料庫」。第三章的資料放在 Google 試算表，D1 則是 Sites 內建的那一個。',
    source: SOURCE_DATA,
  },
  {
    id: 'r2',
    no: '02',
    title: 'R2 檔案上傳空間',
    sub: '存照片、PDF 的檔案本體',
    accent: 'teal',
    headline: 'R2 放檔案本體，D1 只記檔名',
    lead: '第 25 頁提過 Sites 附了 D1、R2，這堂課沒用到。要讓使用者上傳照片、PDF，就靠 R2。',
    source: SOURCE_DATA,
  },
  {
    id: 'backup',
    no: '03',
    title: '沒有備份',
    sub: '壞了、刪了，官方沒說能還原',
    accent: 'coral',
    headline: '官方沒說會備份，重要資料要自己留一份',
    lead: '第 26 頁提過這件事。放進 D1、R2 之前，先看官方目前說了什麼、沒說什麼。',
    source: SOURCE_RISK,
  },
  {
    id: 'guarantee',
    no: '04',
    title: '沒有保證',
    sub: 'Beta：可能中斷、可能下架',
    accent: 'coral',
    headline: '還在 Beta：條款寫明「不保證」',
    lead: '下面是條款寫明的三件事，加上刪除網站的後果。重要的正式資料，不要只放在這裡。',
    source: SOURCE_RISK,
  },
];

const TAB_ON: Record<Accent, string> = {
  teal: 'border-line border-r-panel border-l-teal bg-panel',
  coral: 'border-line border-r-panel border-l-coral bg-panel',
};

const NUM_ON: Record<Accent, string> = {
  teal: 'bg-teal text-on-accent',
  coral: 'bg-coral text-on-accent',
};

export function StorageDemo() {
  const [activeId, setActiveId] = useState<TabId>('d1');
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <div className="flex h-[700px] w-full max-w-[1740px]">
      {/* ── 左：直式頁籤（尺寸與接合方式同第 26 頁） ───────── */}
      <nav
        aria-label="D1、R2 與兩個風險"
        className="relative z-10 flex w-[430px] shrink-0 flex-col gap-3 py-8"
      >
        {TABS.map((tab) => {
          const on = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={on}
              onClick={() => setActiveId(tab.id)}
              className={`-mr-px flex flex-1 items-center gap-5 rounded-l-2xl border border-l-[6px] px-6 text-left transition-colors ${
                on
                  ? TAB_ON[tab.accent]
                  : 'border-line-soft border-r-line border-l-line-soft bg-ink-soft hover:bg-panel-lift'
              }`}
            >
              <span
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full font-display text-[24px] font-semibold tabular-nums ${
                  on ? NUM_ON[tab.accent] : 'border border-line bg-panel text-faint'
                }`}
              >
                {tab.no}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[26px] font-semibold leading-[34px] text-paper">
                  {tab.title}
                </span>
                <span className={`text-[19px] leading-[28px] ${on ? 'text-paper' : 'text-muted'}`}>
                  {tab.sub}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── 右：標題 ＋ 導言 ＋ 圖 ＋ 出處 ────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-panel px-10 py-8">
        <header className="flex shrink-0 flex-col gap-2">
          <h3 className="text-[30px] font-semibold leading-[40px] text-paper">{active.headline}</h3>
          <p className="text-[20px] leading-[30px] text-muted">{active.lead}</p>
        </header>

        {/* key 讓切換頁籤時，每張圖的互動狀態都從頭開始 */}
        <div key={active.id} className="mt-5 flex min-h-0 flex-1 flex-col">
          {active.id === 'd1' && <D1Figure />}
          {active.id === 'r2' && <R2Figure />}
          {active.id === 'backup' && <BackupFigure />}
          {active.id === 'guarantee' && <GuaranteeFigure />}
        </div>

        <p className="mt-4 shrink-0 text-[16px] leading-[24px] text-faint">出處：{active.source}</p>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 01 D1 資料庫 — 新增一筆待辦
 * ════════════════════════════════════════════════════════════ */

interface TodoRow {
  id: number;
  text: string;
  photo: string;
  owner: string;
}

const TODOS: readonly TodoRow[] = [
  { id: 1, text: '買牛奶', photo: '—', owner: '小明' },
  { id: 2, text: '繳電話費', photo: '—', owner: '小美' },
  { id: 3, text: '整理相簿', photo: '—', owner: '小明' },
];

const NEW_TODO: TodoRow = { id: 4, text: '訂火車票', photo: '—', owner: '小明' };

const PHOTO_KEY = 'todos/3/a1b2.jpg';

/** 欄寬：id／待辦／照片檔名／誰的。表頭與每一列共用，才對得齊 */
const COL = {
  id: 'w-[52px] shrink-0 pl-4 font-mono',
  text: 'w-[140px] shrink-0',
  photo: 'min-w-0 flex-1 truncate font-mono text-[17px]',
  owner: 'w-[72px] shrink-0',
};

function TodoHeader() {
  return (
    <div className="flex h-11 shrink-0 items-center border-l-[6px] border-l-transparent bg-ink-soft text-[17px] text-faint">
      <span className={COL.id}>id</span>
      <span className={COL.text}>待辦</span>
      <span className={`${COL.photo} font-sans`}>照片檔名</span>
      <span className={COL.owner}>誰的</span>
    </div>
  );
}

function TodoLine({ row, fresh = false }: { row: TodoRow; fresh?: boolean }) {
  const empty = row.photo === '—';
  return (
    <div
      className={`flex h-12 shrink-0 items-center border-t border-l-[6px] border-t-line-soft text-[20px] ${
        fresh ? 'slide-enter border-l-teal bg-teal/14' : 'border-l-transparent'
      }`}
    >
      <span className={`${COL.id} text-[18px] text-muted`}>{row.id}</span>
      <span className={`${COL.text} text-paper`}>{row.text}</span>
      <span className={`${COL.photo} ${empty ? 'text-faint' : 'text-paper'}`}>{row.photo}</span>
      <span className={`${COL.owner} text-paper`}>{row.owner}</span>
    </div>
  );
}

const D1_STEPS = ['送出新待辦', '寫進 D1', '畫面更新'] as const;

const D1_FACTS: readonly { big: string; small: string }[] = [
  { big: '一列一筆', small: '像雲端上的 Excel' },
  { big: '10 GB', small: '每個網站的上限' },
  { big: '自動建好', small: '部署時建立\n不用自己申請' },
];

function D1Figure() {
  const { phase, play, reset } = usePlayer();
  const running = phase >= 0;
  const added = phase >= 1;

  const map: StorageMapProps = {
    lit: ['user', 'client', 'backend'],
    d1: 'on',
    r2: 'off',
    legend: true,
    arrows: !running
      ? ['backendToD1', 'd1ToBackend']
      : phase === 0
        ? ['userToClient', 'clientToBackend']
        : phase === 1
          ? ['userToClient', 'clientToBackend', 'backendToD1']
          : ['userToClient', 'clientToBackend', 'backendToD1', 'backendToClient'],
    ring: phase === 0 ? 'backend' : phase === 1 ? 'd1' : phase === 2 ? 'client' : undefined,
    notes: {
      d1: added ? '4 筆待辦' : '3 筆待辦',
      client: phase === 2 ? '多了一筆待辦' : undefined,
    },
  };

  return (
    <FigureRow map={map}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <span className={LABEL}>Todo 手帳的 todos 資料表</span>
        <span className="ml-auto" />
        <button
          type="button"
          onClick={() => (running ? reset() : play(D1_STEPS.length))}
          className={running ? BTN_GHOST : BTN_MAIN}
        >
          {running ? '重來' : '＋ 新增一筆待辦'}
        </button>
      </div>

      <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-panel">
        <TodoHeader />
        {TODOS.map((row) => (
          <TodoLine key={row.id} row={row} />
        ))}
        {added ? (
          <TodoLine row={NEW_TODO} fresh />
        ) : (
          <div className="flex h-12 shrink-0 items-center border-t border-t-line-soft pl-5 text-[18px] text-faint">
            下一筆會寫在這一列
          </div>
        )}
      </div>

      {/* 三拍的進度：到了才轉實心 teal */}
      <div className="flex h-9 shrink-0 items-center gap-3">
        {D1_STEPS.map((step, index) => (
          <span key={step} className="flex items-center gap-3">
            {index > 0 && <span className="text-[18px] text-faint">→</span>}
            <StepBadge no={index + 1} reached={phase >= index} />
            <span className={`text-[19px] ${phase >= index ? 'text-paper' : 'text-muted'}`}>
              {step}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-auto grid shrink-0 grid-cols-3 gap-3">
        {D1_FACTS.map((fact) => (
          <div
            key={fact.big}
            className="flex flex-col gap-1 rounded-xl border border-line bg-panel-lift px-4 py-3"
          >
            <span className="font-display text-[28px] font-semibold leading-[36px] text-teal">
              {fact.big}
            </span>
            <span className="whitespace-pre-line text-[18px] leading-[26px] text-muted">
              {fact.small}
            </span>
          </div>
        ))}
      </div>
    </FigureRow>
  );
}

/* ════════════════════════════════════════════════════════════
 * 02 R2 檔案上傳空間 — 附上一張照片 → 打開這張照片
 * ════════════════════════════════════════════════════════════ */

type R2Action = 'none' | 'upload' | 'open';

const UPLOAD_STEPS = ['瀏覽器送出一張照片', '照片本體放進 R2', 'D1 那一列只記下檔名'] as const;

const OPEN_STEPS = [
  '瀏覽器要求打開這張照片',
  '先查 D1：這一筆是不是本人的',
  '是本人，才從 R2 拿出照片',
  '照片送回瀏覽器',
] as const;

function r2Map(action: R2Action, phase: number): StorageMapProps {
  const base: StorageMapProps = {
    lit: ['user', 'client', 'backend'],
    d1: 'soft',
    r2: 'on',
    legend: true,
    notes: { r2: '還沒有檔案', d1: '只記檔名' },
  };

  if (action === 'none') {
    return { ...base, arrows: ['backendToR2', 'r2ToBackend'] };
  }

  const start: StorageMapProps['arrows'] = ['userToClient', 'clientToBackend'];

  if (action === 'upload') {
    return {
      ...base,
      d1: phase >= 2 ? 'on' : 'soft',
      arrows:
        phase === 0
          ? start
          : phase === 1
            ? [...start, 'backendToR2']
            : [...start, 'backendToR2', 'backendToD1'],
      ring: phase === 0 ? 'backend' : phase === 1 ? 'r2' : 'd1',
      notes: {
        client: phase === 0 ? '選了一張照片' : undefined,
        r2: phase >= 1 ? '1 張照片' : '還沒有檔案',
        d1: phase >= 2 ? '記下檔名' : '只記檔名',
      },
    };
  }

  return {
    ...base,
    d1: phase >= 1 ? 'on' : 'soft',
    arrows:
      phase === 0
        ? start
        : phase === 1
          ? [...start, 'backendToD1', 'd1ToBackend']
          : phase === 2
            ? [...start, 'backendToD1', 'd1ToBackend', 'r2ToBackend']
            : [...start, 'backendToD1', 'd1ToBackend', 'r2ToBackend', 'backendToClient'],
    ring: phase === 0 ? 'backend' : phase === 1 ? 'd1' : phase === 2 ? 'r2' : 'client',
    notes: {
      client: phase >= 3 ? '看到照片了' : undefined,
      r2: '1 張照片',
      d1: phase >= 1 ? '確認是本人' : '只記檔名',
    },
  };
}

function R2Figure() {
  const [action, setAction] = useState<R2Action>('none');
  const { phase, play, reset } = usePlayer();

  const uploadDone = action === 'open' || (action === 'upload' && phase >= UPLOAD_STEPS.length - 1);
  const inR2 = action === 'open' || (action === 'upload' && phase >= 1);
  const keyRecorded = action === 'open' || (action === 'upload' && phase >= 2);
  const d1Touched = (action === 'upload' && phase >= 2) || (action === 'open' && phase >= 1);
  const r2Touched = (action === 'upload' && phase >= 1) || (action === 'open' && phase >= 2);
  const delivered = action === 'open' && phase >= OPEN_STEPS.length - 1;

  const steps: readonly string[] = action === 'open' ? OPEN_STEPS : UPLOAD_STEPS;

  const start = (next: R2Action, count: number) => {
    setAction(next);
    play(count);
  };

  const restart = () => {
    reset();
    setAction('none');
  };

  return (
    <FigureRow map={r2Map(action, phase)}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <button
          type="button"
          disabled={action !== 'none'}
          onClick={() => start('upload', UPLOAD_STEPS.length)}
          className={action === 'none' ? BTN_MAIN : BTN_OFF}
        >
          {action === 'none' ? '① 附上一張照片' : '① 已附上'}
        </button>
        <button
          type="button"
          disabled={!(action === 'upload' && uploadDone)}
          onClick={() => start('open', OPEN_STEPS.length)}
          className={action === 'upload' && uploadDone ? BTN_MAIN : BTN_OFF}
        >
          {action === 'open' ? '② 已打開' : '② 打開這張照片'}
        </button>
        <span className="ml-auto" />
        {action !== 'none' && (
          <button type="button" onClick={restart} className={BTN_GHOST}>
            重來
          </button>
        )}
      </div>

      {/* D1 裡的第 3 列：照片欄只放檔名 */}
      <div
        className={`flex h-[88px] shrink-0 items-center gap-4 rounded-xl border border-l-[6px] bg-panel px-4 transition-colors duration-300 ${
          d1Touched ? 'border-teal border-l-teal' : 'border-line border-l-line'
        }`}
      >
        <span className="w-[44px] shrink-0 font-display text-[26px] font-bold text-teal">D1</span>
        <div className="grid min-w-0 flex-1 grid-cols-[36px_110px_minmax(0,1fr)_52px] gap-x-3 gap-y-1">
          <span className="text-[16px] text-faint">id</span>
          <span className="text-[16px] text-faint">待辦</span>
          <span className="text-[16px] text-faint">照片檔名</span>
          <span className="text-[16px] text-faint">誰的</span>
          <span className="font-mono text-[19px] text-muted">3</span>
          <span className="text-[20px] text-paper">整理相簿</span>
          <span
            className={`truncate font-mono text-[17px] leading-[30px] ${
              keyRecorded ? 'text-paper' : 'text-faint'
            }`}
          >
            {keyRecorded ? PHOTO_KEY : '—'}
          </span>
          <span className="text-[20px] text-paper">小明</span>
        </div>
      </div>

      {/* R2：照片本體 */}
      <div
        className={`flex h-[76px] shrink-0 items-center gap-4 rounded-xl border border-l-[6px] bg-panel px-4 transition-colors duration-300 ${
          r2Touched ? 'border-teal border-l-teal' : 'border-line border-l-line'
        }`}
      >
        <span className="w-[44px] shrink-0 font-display text-[26px] font-bold text-teal">R2</span>
        {inR2 ? (
          <div className="slide-enter flex min-w-0 flex-1 items-center gap-3">
            <PhotoThumb />
            <span className="min-w-0 flex-1 truncate font-mono text-[17px] text-paper">
              {PHOTO_KEY}
            </span>
            <span
              className={`shrink-0 rounded-md px-2.5 py-0.5 text-[16px] font-semibold ${
                delivered ? 'bg-teal text-on-accent' : 'border border-line text-muted'
              }`}
            >
              {delivered ? '已送到瀏覽器' : '照片本體 2.4 MB'}
            </span>
          </div>
        ) : (
          <span className="flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-line text-[19px] text-muted">
            還沒有檔案
          </span>
        )}
      </div>

      {/* 這一段流程的每一拍 */}
      <ol className="flex shrink-0 flex-col gap-1.5">
        {steps.map((step, index) => {
          const reached = action !== 'none' && phase >= index;
          return (
            <li key={step} className="flex h-9 items-center gap-3">
              <StepBadge no={index + 1} reached={reached} />
              <span className={`text-[20px] ${reached ? 'text-paper' : 'text-muted'}`}>{step}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-auto shrink-0 rounded-xl border border-l-[6px] border-line border-l-muted bg-panel-lift px-5 py-3 text-[19px] leading-[28px] text-paper">
        R2 沒有公開網址，照片只能透過你的程式拿。
      </p>
    </FigureRow>
  );
}

/** 照片縮圖：一個小相框，線條 teal */
function PhotoThumb() {
  return (
    <svg width={40} height={40} viewBox="0 0 44 44" aria-hidden="true" className="shrink-0">
      <rect x={6} y={9} width={32} height={26} rx={3} fill="var(--color-teal)" fillOpacity={0.22} />
      <rect
        x={6}
        y={9}
        width={32}
        height={26}
        rx={3}
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth={2.2}
      />
      <circle cx={15} cy={17} r={3} fill="none" stroke="var(--color-teal)" strokeWidth={2.2} />
      <path
        d="M6 31 L16 22 L23 28 L28 24 L38 32"
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
 * 03 沒有備份
 * ════════════════════════════════════════════════════════════ */

const BACKUP_FACTS: readonly { tag: string; text: string }[] = [
  { tag: '沒有說明', text: '會不會自動備份、能不能還原' },
  { tag: '沒有工具', text: '匯出、清空正式資料庫' },
  { tag: '做不到', text: '從 ChatGPT 列出、批次刪除\n正式環境 R2 的檔案' },
];

function BackupFigure() {
  const [mine, setMine] = useState(false);

  const map: StorageMapProps = {
    lit: ['user', 'client', 'backend'],
    d1: 'risk',
    r2: 'risk',
    backup: mine ? 'mine' : 'unknown',
    arrows: mine ? ['toBackup'] : [],
    ring: mine ? 'backup' : undefined,
  };

  return (
    <FigureRow map={map}>
      <span className={`flex h-7 shrink-0 items-center ${LABEL}`}>官方目前的說法</span>
      <ul className="flex shrink-0 flex-col gap-2.5">
        {BACKUP_FACTS.map((fact) => (
          <li
            key={fact.text}
            className="flex min-h-[64px] items-center gap-4 rounded-xl border border-l-[6px] border-coral/55 border-l-coral bg-coral/10 px-4 py-2.5"
          >
            <span className="w-[100px] shrink-0 rounded-md bg-coral px-2 py-1 text-center text-[17px] font-semibold text-on-accent">
              {fact.tag}
            </span>
            <span className="whitespace-pre-line text-[20px] leading-[28px] text-paper">
              {fact.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <TipBox>
          <p className="text-[20px] leading-[30px] text-paper">
            重要資料自己另存一份。
            <br />
            例如在網站上做一顆「匯出我的資料」按鈕。
          </p>
          <button
            type="button"
            aria-pressed={mine}
            onClick={() => setMine((value) => !value)}
            className={`self-start ${mine ? BTN_GHOST : BTN_MAIN}`}
          >
            {mine ? '回到只放在 Sites' : '看看自己另存一份'}
          </button>
        </TipBox>
      </div>
    </FigureRow>
  );
}

/* ════════════════════════════════════════════════════════════
 * 04 沒有保證 — 點一條，圖跟著變
 * ════════════════════════════════════════════════════════════ */

type TermId = 'outage' | 'loss' | 'takedown' | 'delete';

const TERMS: readonly { id: TermId; tag: string; title: string; effect: string }[] = [
  {
    id: 'outage',
    tag: '不保證',
    title: '服務不中斷',
    effect: '中斷時網站打不開，資料也拿不到。',
  },
  {
    id: 'loss',
    tag: '不保證',
    title: '內容不遺失',
    effect: 'D1 的資料、R2 的檔案，不保證還在。',
  },
  {
    id: 'takedown',
    tag: '保留權利',
    title: '隨時下架網站',
    effect: '網站可能被下架，網址就打不開了。',
  },
  {
    id: 'delete',
    tag: '刪除網站',
    title: '資料一起永久消失',
    effect: 'D1、R2 裡的東西一起刪掉，無法還原。',
  },
];

function guaranteeMap(term: TermId): StorageMapProps {
  const base: StorageMapProps = {
    lit: ['user', 'client', 'backend'],
    d1: 'soft',
    r2: 'soft',
    frame: 'beta',
  };

  switch (term) {
    case 'outage':
      return { ...base, cut: true, notes: { client: '網站打不開' } };
    case 'loss':
      return { ...base, d1: 'risk', r2: 'risk', unsure: true, notes: { d1: '還在嗎？', r2: '還在嗎？' } };
    case 'takedown':
      return {
        ...base,
        frame: 'gone',
        d1: 'gone',
        r2: 'gone',
        stamp: '網站已下架',
        notes: { client: '網址打不開' },
      };
    case 'delete':
      return {
        ...base,
        frame: 'gone',
        d1: 'gone',
        r2: 'gone',
        stamp: '已永久刪除',
        notes: { d1: '永久消失', r2: '永久消失' },
      };
  }
}

function GuaranteeFigure() {
  const [termId, setTermId] = useState<TermId>('outage');

  return (
    <FigureRow map={guaranteeMap(termId)}>
      <span className={`flex h-7 shrink-0 items-center ${LABEL}`}>點一條，看看網站和資料會怎樣</span>
      <div className="flex shrink-0 flex-col gap-2.5">
        {TERMS.map((term) => {
          const on = term.id === termId;
          return (
            <button
              key={term.id}
              type="button"
              aria-pressed={on}
              onClick={() => setTermId(term.id)}
              className={`flex flex-col gap-1.5 rounded-xl border border-l-[6px] px-4 py-2.5 text-left transition-colors duration-200 ${
                on
                  ? 'border-coral border-l-coral bg-panel'
                  : 'border-line-soft border-l-line bg-panel hover:border-line'
              }`}
            >
              <span className="flex h-9 items-center gap-4">
                <span
                  className={`w-[100px] shrink-0 rounded-md px-2 py-1 text-center text-[17px] font-semibold ${
                    on ? 'bg-coral text-on-accent' : 'border border-line text-muted'
                  }`}
                >
                  {term.tag}
                </span>
                <span className={`text-[21px] font-semibold ${on ? 'text-paper' : 'text-muted'}`}>
                  {term.title}
                </span>
              </span>
              {on && (
                <span className="slide-enter pl-[116px] text-[19px] leading-[28px] text-paper">
                  {term.effect}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <TipBox>
          <p className="text-[20px] leading-[30px] text-paper">
            重要的正式資料不要只放這裡，另外存一份。
          </p>
        </TipBox>
      </div>
    </FigureRow>
  );
}
