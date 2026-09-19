import { useState, type ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 第三章 串接 Google 試算表 —— 前三頁（第 28–30 頁）
 *
 *   第 28 頁  WhySheetsDemo      為什麼要串接 Google 試算表（新寫）
 *   第 29 頁  SpreadsheetDemo    試算表裡的資料長什麼樣子（改編）
 *   第 30 頁  GoogleServiceDemo  開通 Google 服務（新寫，主角是文件連結）
 *
 * 第 28 頁緊接在「ChatGPT Sites 的四個注意事項」之後，敘事是
 * 「把資料放在網站外面」。**不貶低 ChatGPT Sites 的資料庫** —— 它是正式的
 * 關聯式資料庫；講的是這堂課的情境（全家直接看、直接改）試算表比較合適。
 *
 * 第 29 頁改編自 iThome 鐵人賽 2026〈JSON 與資料〉的 SpreadsheetDemo：
 *   - 資料從行李箱商店換成家庭記帳（收支紀錄／家庭成員／分類／每月預算）
 *   - 第三階段原本是「為什麼不直接寄這份試算表」，跟這堂課的論點相反，
 *     改成「試算表怎麼對到網站的資料」：分頁＝資料表、第一列＝欄位名稱、
 *     往下每一列＝一筆紀錄，附一段 Sheets API values 的示意
 *   - 深色主題轉亮色：原本 bg-paper text-ink 的白底試算表改成 bg-panel text-paper，
 *     淺底上的彩色字限制不再成立（亮色下強調色對 panel 都 ≥ 5.22:1）
 *
 * ──────────────────────────────────────────────────────────────
 * 顏色（三頁共用）
 * ──────────────────────────────────────────────────────────────
 *   violet       試算表、這一章的主角
 *   role-client  網站（第 28 頁）；blue 也是第 30 頁的連結色（語意是 info）
 * 一頁最多兩支強調色，三頁都是 violet ＋ blue（第 29 頁只用 violet）。
 *
 * 「這一項不一樣」一律是淡底 ＋ 6px 不透明左粗條，或實心徽章 ——
 * 低透明度填色不單獨承擔語意。卡片的 off 狀態也留著 6px 左框（line 色），
 * 切換時內容才不會左右位移 5px。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 *   第 29 頁沿用來源尺寸：DemoRoot 648，主區 584 ＋ 控制列 44（gap 20）
 *   第 28、30 頁新寫：根容器 700
 * 沒有任何容器可以捲動；未輪到的內容一律不掛。
 * ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * 共用零件
 * Tailwind 只掃得到完整字串，所以每一格都存整串 class，不做動態拼接。
 * ══════════════════════════════════════════════════════════════ */

/** 面板小標籤的字體規格。顏色由呼叫端決定 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 控制列那一排按鈕的共同尺寸 */
const BTN_ROW =
  'h-11 rounded-xl border px-5 text-[19px] transition-colors duration-200';

/** 次要按鈕的皮膚（「重來」） */
const GHOST_SKIN =
  'border-line-soft text-muted hover:border-line hover:text-paper';

/** 停用的按鈕。不用 opacity 壓，改用本來就比較暗的 faint */
const GHOST_OFF = 'cursor-default border-line-soft text-faint';

/** 試算表色的實心藥丸（主要按鈕、欄標、序號徽章） */
const PILL_SHEET = 'border-violet bg-violet text-on-accent';

/** 圓形的序號徽章。只放得下一位數 */
const STEP_BADGE =
  'flex size-8 shrink-0 items-center justify-center rounded-full border font-display text-[17px]';

/** 可點選的大卡：基底 ＋ on ／ off。on 是淡底配 6px 不透明左粗條 */
const PICK_BASE =
  'rounded-2xl border border-l-[6px] text-left transition-colors duration-200';
const PICK_ON = 'border-violet/70 border-l-violet bg-violet/14';
const PICK_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** demo 底部那一行提示 */
function Hint({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      className={`text-[21px] leading-snug ${strong ? 'text-violet' : 'text-muted'}`}
    >
      {children}
    </span>
  );
}

/** 步驟圓點列。目前這一顆拉長成膠囊 */
function StepDots({
  total,
  current,
  onPick,
}: {
  total: number;
  current: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex h-6 items-center gap-2.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`第 ${i + 1} 步`}
          aria-current={i === current}
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
            i === current ? 'w-9 bg-violet' : 'w-2.5 bg-line hover:bg-faint'
          }`}
        />
      ))}
    </div>
  );
}

/* ── SheetGrid ──────────────────────────────────────────── */

/**
 * 目測字寬：CJK 與全形標點算兩格，其餘算一格。
 * 只拿來分配欄寬，不需要精準。
 */
function sheetTextUnits(text: string) {
  let units = 0;
  for (const char of text) {
    units += /[\u2e80-\u9fff\uff00-\uff60\u3000-\u303f]/.test(char) ? 2 : 1;
  }
  return units;
}

/** 整欄的值都是數字就靠右對齊 —— 這是試算表本人的行為 */
function sheetIsNumericColumn(
  rows: readonly (readonly string[])[],
  colIndex: number,
) {
  const values = rows
    .map((row) => row[colIndex] ?? '')
    .filter((value) => value !== '');
  return (
    values.length > 0 && values.every((value) => /^-?[\d,]+(\.\d+)?$/.test(value))
  );
}

interface SheetGridProps {
  /** 試算表的第 1 列：欄位名稱 */
  header: readonly string[];
  /** 第 2 列起的資料，長度要跟 header 一樣 */
  rows: readonly (readonly string[])[];
  /** 尾巴補幾列空白列，讓它看起來像一份還沒填滿的檔案 */
  blankRows?: number;
  /** 各自圈起來的欄（0 起算），框住「欄位名稱 ＋ 資料列」 */
  markCols?: readonly number[];
  /**
   * 框出 A1 到第 rangeCols 欄、最後一筆資料那一塊（一個整體的框），
   * 第 1 列另外上底色。給「第一列＝欄位名稱、往下每一列＝一筆」用。
   */
  rangeCols?: number;
  /**
   * 某一格正在被誰編輯。row 是資料列索引（0 ＝ 第 2 列），名牌掛在格子下方。
   * 名牌是下一列的格線項目，不是絕對定位 —— 凸出去的絕對定位子元素會讓
   * scrollHeight 大於格子本身，稽核判成溢出。所以編輯格下面要留一列
   * （`blankRows` ≥ 1）；真的沒有的話，格線會自動多長一條名牌高的列。
   */
  editCell?: { row: number; col: number; who: string };
  size?: number;
  rowHeight?: number;
  headHeight?: number;
  gutter?: number;
  className?: string;
}

/**
 * 試算表的格線：A B C 欄標 ＋ 1 2 3 列號。
 *
 * 所有格子都寫死 gridRow / gridColumn —— 圈選框是疊在同一個 grid 上的
 * 空 div，不寫死位置的話，自動排版會繞開那個框、把後面的格子整批擠位。
 *
 * 圈選分兩層：底色層放在格子**之前**（格子沒有底色，字畫在它上面）、
 * 外框層放在格子**之後**（蓋過格線）。
 *
 * 欄寬依內容分配（`sheetTextUnits`）。自己不捲動，呼叫端要保證列數放得下。
 */
function SheetGrid({
  header,
  rows,
  blankRows = 0,
  markCols = [],
  rangeCols = 0,
  editCell,
  size = 19,
  rowHeight = 45,
  headHeight = 34,
  gutter = 48,
  className = '',
}: SheetGridProps) {
  /** 試算表的第 1 列就是欄位名稱，跟真的試算表一樣 */
  const sheetRows: readonly (readonly string[])[] = [
    header,
    ...rows,
    ...Array.from({ length: blankRows }, () => header.map(() => '')),
  ];

  const template = header
    .map((_, colIndex) =>
      sheetRows.reduce(
        (widest, row) => Math.max(widest, sheetTextUnits(row[colIndex] ?? '')),
        3,
      ),
    )
    .map((units) => `minmax(0, ${units}fr)`)
    .join(' ');

  const numeric = header.map((_, colIndex) =>
    sheetIsNumericColumn(rows, colIndex),
  );
  /** 圈選框蓋住「欄位名稱那一列 ＋ 資料列」，空白列不蓋 */
  const markEndLine = rows.length + 3;
  const labelSize = Math.max(15, size - 4);
  const colMarked = (colIndex: number) =>
    markCols.includes(colIndex) || colIndex < rangeCols;

  return (
    <div className={`shrink-0 bg-panel text-paper ${className}`}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `${gutter}px ${template}`,
          gridTemplateRows: `${headHeight}px repeat(${sheetRows.length}, ${rowHeight}px)`,
        }}
      >
        {/* 左上角那一格：真的試算表也是空的 */}
        <div
          className="border-r border-b border-line-soft bg-ink-soft"
          style={{ gridRow: 1, gridColumn: 1 }}
        />

        {/* A B C 欄標。被圈到的欄換成實心藥丸 */}
        {header.map((_, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className="flex items-center justify-center border-r border-b border-line-soft bg-ink-soft"
            style={{ gridRow: 1, gridColumn: colIndex + 2 }}
          >
            <span
              className={`rounded-md px-2 py-0.5 font-display tracking-[0.1em] ${
                colMarked(colIndex)
                  ? 'bg-violet font-semibold text-on-accent'
                  : 'text-muted'
              }`}
              style={{ fontSize: `${labelSize}px` }}
            >
              {String.fromCharCode(65 + colIndex)}
            </span>
          </div>
        ))}

        {/* 1 2 3 列號。框出範圍時，第 1 列是實心藥丸、資料列是粗體彩字 */}
        {sheetRows.map((_, rowIndex) => {
          const inRange = rangeCols > 0 && rowIndex <= rows.length;
          const headRow = rangeCols > 0 && rowIndex === 0;
          return (
            <div
              key={`num-${rowIndex}`}
              className="flex items-center justify-center border-r border-b border-line-soft bg-ink-soft"
              style={{ gridRow: rowIndex + 2, gridColumn: 1 }}
            >
              <span
                className={`rounded-md px-1.5 font-mono ${
                  headRow
                    ? 'bg-violet font-semibold text-on-accent'
                    : inRange
                      ? 'font-semibold text-violet'
                      : 'text-muted'
                }`}
                style={{ fontSize: `${labelSize}px` }}
              >
                {rowIndex + 1}
              </span>
            </div>
          );
        })}

        {/* 底色層：畫在格子之前，字才會壓在上面 */}
        {markCols.map((colIndex) => (
          <div
            key={`mark-fill-${colIndex}`}
            aria-hidden="true"
            className="pointer-events-none bg-violet/14"
            style={{ gridColumn: colIndex + 2, gridRow: `2 / ${markEndLine}` }}
          />
        ))}
        {rangeCols > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none bg-violet/14"
            style={{ gridColumn: `2 / ${rangeCols + 2}`, gridRow: '2 / 3' }}
          />
        )}

        {/* 每一格 */}
        {sheetRows.map((row, rowIndex) =>
          header.map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={`flex min-w-0 items-center border-r border-b border-line-soft px-3 ${
                numeric[colIndex] && rowIndex > 0 ? 'justify-end' : ''
              }`}
              style={{ gridRow: rowIndex + 2, gridColumn: colIndex + 2 }}
            >
              <span
                className={`min-w-0 truncate text-paper ${
                  rowIndex === 0 ? 'font-semibold' : ''
                }`}
                style={{ fontSize: `${size}px` }}
              >
                {row[colIndex] ?? ''}
              </span>
            </div>
          )),
        )}

        {/* 外框層：畫在格子之後，蓋過格線 */}
        {markCols.map((colIndex) => (
          <div
            key={`mark-edge-${colIndex}`}
            aria-hidden="true"
            className="pointer-events-none rounded-md border-2 border-violet"
            style={{ gridColumn: colIndex + 2, gridRow: `2 / ${markEndLine}` }}
          />
        ))}
        {rangeCols > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none rounded-md border-2 border-violet"
            style={{
              gridColumn: `2 / ${rangeCols + 2}`,
              gridRow: `2 / ${markEndLine}`,
            }}
          />
        )}

        {/* 正在編輯的那一格：實色外框 ＋ 名牌。名牌放在下一列、貼齊右上角，
            不做絕對定位，才不會凸出格線（見 editCell 的說明） */}
        {editCell && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none border-2 border-violet"
              style={{
                gridColumn: editCell.col + 2,
                gridRow: editCell.row + 3,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none self-start justify-self-end rounded-b-md bg-violet px-2 text-[15px] leading-[22px] text-on-accent"
              style={{
                gridColumn: editCell.col + 2,
                gridRow: editCell.row + 4,
              }}
            >
              {editCell.who}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 28 頁 — WhySheetsDemo
 *
 * 左欄三張理由卡，右欄一張示意：網站 ⇄ Google 試算表。
 * 點哪一張理由，右邊兩個方塊就換成那一個理由的畫面：
 *   readable  試算表打開就是表格，媽媽正在改其中一格
 *   separate  網站變成虛線（刪掉或重做），試算表與版本記錄都還在
 *   access    網站上是「用 Google 帳號登入」，試算表這邊是「共用」設定
 *
 * 版面（根 700）：主區 636 ＋ 提示列 44（gap 20）
 *   左欄 640：小標 36 ＋ gap 16 ＋ 三張卡（各約 157，合計約 503 ／ 584）
 *   右欄 ≈ 1072：小標 36 ＋ gap 16 ＋ 方塊區 584
 *     網站 320 ／ 連線 170 ／ 試算表 ≈ 542
 *     方塊內可用：584 − 框 4 − 標題列 60 − py 40 ＝ 480
 *     試算表那一格最高的是 separate：格線 231 ＋ gap 20 ＋ 版本記錄 182 ≈ 433
 *
 * 進場動畫（`.slide-enter` 從下方 10px 滑入）掛在方塊裡**置中的內層**，
 * 不掛在 flex-1 那一層 —— 貼齊底邊的元素一位移就凸出去，背景分頁的
 * 動畫時間軸又是暫停的，稽核會停在位移 10px 的那一格量到溢出。
 * 格線多一列空白，是給「媽媽」名牌掛的（見 SheetGrid 的 editCell）。
 * ══════════════════════════════════════════════════════════════ */

type WhyId = 'readable' | 'separate' | 'access';

interface WhyReason {
  id: WhyId;
  title: string;
  body: string;
}

const WHY_REASONS: readonly WhyReason[] = [
  {
    id: 'readable',
    title: '任何人都看得懂',
    body: '打開就是一張表格，家人也能直接看、直接改。資料庫通常要用專門的工具才看得到。',
  },
  {
    id: 'separate',
    title: '資料跟網站分開',
    body: '網站刪掉或重做，試算表還在；改錯了，也能從「版本記錄」回到之前的版本。',
  },
  {
    id: 'access',
    title: '權限用 Google 帳號管',
    body: '誰能看、誰能編輯，都在試算表的「共用」設定裡，第 31 頁會細講。',
  },
];

/** 右欄那張迷你試算表。跟第 29 頁的「收支紀錄」是同一批資料的前四欄 */
const WHY_SHEET_HEADER: readonly string[] = ['日期', '成員', '分類', '金額'];
const WHY_SHEET_ROWS: readonly (readonly string[])[] = [
  ['2026-09-01', '媽媽', '餐飲', '320'],
  ['2026-09-02', '爸爸', '交通', '1150'],
  ['2026-09-03', '小明', '教育', '380'],
];

/** 版本記錄。最上面那一筆是目前的版本 */
const WHY_VERSIONS: readonly { time: string; who: string; note?: string }[] = [
  { time: '9月18日 下午2:02', who: '媽媽', note: '目前版本' },
  { time: '9月17日 晚上9:40', who: '爸爸' },
  { time: '9月15日 上午8:12', who: '小明', note: '可以還原成這一版' },
];

/** 共用設定裡的三個人 */
const WHY_SHARE: readonly { who: string; email: string; role: string }[] = [
  { who: '爸', email: 'dad@example.com', role: '擁有者' },
  { who: '媽', email: 'mom@example.com', role: '編輯者' },
  { who: '明', email: 'ming@example.com', role: '檢視者' },
];

/** 網站那一格的迷你頁面：這個月的支出，資料就是右邊那張表 */
function WhySitePage() {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[22px] font-semibold text-paper">九月的支出</span>
      <div className="flex flex-col rounded-xl border border-line-soft">
        {WHY_SHEET_ROWS.map((row) => (
          <div
            key={row[0]}
            className="flex items-center justify-between border-b border-line-soft px-4 py-2.5 last:border-b-0"
          >
            <span className="text-[19px] text-muted">
              {row[1]} · {row[2]}
            </span>
            <span className="font-mono text-[19px] text-paper">{row[3]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4">
        <span className="text-[19px] text-muted">合計</span>
        <span className="font-mono text-[21px] font-semibold text-paper">
          1850
        </span>
      </div>
    </div>
  );
}

function WhySiteBox({ reason }: { reason: WhyId }) {
  const gone = reason === 'separate';

  return (
    <div
      className={`flex w-[320px] shrink-0 flex-col rounded-2xl border-2 bg-panel ${
        gone ? 'border-dashed border-line' : 'border-role-client/70'
      }`}
    >
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line-soft px-5">
        <span
          className={`size-3 rounded-full ${gone ? 'bg-faint' : 'bg-role-client'}`}
        />
        <span
          className={`text-[22px] font-semibold ${
            gone ? 'text-muted' : 'text-role-client'
          }`}
        >
          網站
        </span>
        <span className="ml-auto text-[16px] text-faint">ChatGPT Sites</span>
      </div>

      {/* 動畫掛在內層：外層 flex-1 貼齊方塊底邊，位移 10px 就凸出去 */}
      <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-5">
        <div key={reason} className="slide-enter">
          {reason === 'readable' && <WhySitePage />}

          {reason === 'separate' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-[26px] font-semibold text-muted">
                網站刪掉了
              </span>
              <span className="text-[22px] text-muted">或整個重做</span>
              <span className="mt-3 text-[19px] leading-[1.5] text-muted">
                資料本來就不在這裡，
                <br />
                所以不受影響
              </span>
            </div>
          )}

          {reason === 'access' && (
            <div className="flex flex-col gap-4">
              <span className="text-[22px] font-semibold text-paper">家庭記帳</span>
              <span className="rounded-xl bg-role-client px-4 py-3 text-center text-[19px] font-medium text-on-accent">
                用 Google 帳號登入
              </span>
              <span className="text-[19px] leading-[1.5] text-muted">
                登入的是哪個帳號，決定讀不讀得到右邊那份試算表。
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 中間那條連線：上面去（寫入）、下面回（讀取）。網站不在時變虛線 */
function WhyLink({ reason }: { reason: WhyId }) {
  const gone = reason === 'separate';
  const stroke = gone ? 'var(--color-line)' : 'var(--color-muted)';
  const dash = gone ? '8 8' : undefined;

  return (
    <div className="flex w-[170px] shrink-0 flex-col items-center justify-center gap-3">
      <span className="text-center text-[17px] leading-snug text-muted">
        Google Sheets API
      </span>
      <svg width={150} height={70} viewBox="0 0 150 70" role="img">
        <title>網站寫入試算表、也從試算表讀取</title>
        <line
          x1={6}
          y1={20}
          x2={134}
          y2={20}
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={dash}
        />
        <polygon points="146,20 132,12 132,28" fill={stroke} />
        <line
          x1={16}
          y1={50}
          x2={144}
          y2={50}
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={dash}
        />
        <polygon points="4,50 18,42 18,58" fill={stroke} />
      </svg>
      <span className="text-center text-[17px] leading-snug text-faint">
        {gone ? '連線沒了，資料還在' : '寫入 · 讀取'}
      </span>
    </div>
  );
}

function WhySheetBox({ reason }: { reason: WhyId }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl border-2 border-violet/70 bg-panel">
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line-soft px-5">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet font-display text-[16px] font-semibold text-on-accent">
          表
        </span>
        <span className="text-[22px] font-semibold text-violet">
          Google 試算表
        </span>
        <span className="ml-auto text-[17px] text-faint">家庭記帳</span>
      </div>

      {/* 動畫掛在內層，理由同網站那一格 */}
      <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-5">
        <div key={reason} className="slide-enter flex flex-col gap-5">
          {reason !== 'access' && (
            <SheetGrid
              header={WHY_SHEET_HEADER}
              rows={WHY_SHEET_ROWS}
              blankRows={1}
              editCell={
                reason === 'readable' ? { row: 2, col: 3, who: '媽媽' } : undefined
              }
              size={18}
              rowHeight={40}
              headHeight={30}
              gutter={38}
              className="border-t border-l border-line-soft"
            />
          )}

          {reason === 'readable' && (
            <div className="mt-3 flex flex-col gap-1.5">
              <span className="text-[22px] text-paper">
                不用裝任何工具，打開就是表格
              </span>
              <span className="text-[19px] text-muted">
                媽媽正在改第 4 列的金額，爸爸同時也看得到
              </span>
            </div>
          )}

          {reason === 'separate' && (
            <div className="flex flex-col gap-2">
              <span className={`${LABEL_TYPE} text-violet`}>版本記錄</span>
              {WHY_VERSIONS.map((item, index) => (
                <div
                  key={item.time}
                  className={`flex h-11 items-center gap-4 rounded-lg border border-l-[6px] px-4 ${
                    index === WHY_VERSIONS.length - 1
                      ? 'border-violet/70 border-l-violet bg-violet/14'
                      : 'border-line-soft border-l-line bg-panel-lift'
                  }`}
                >
                  <span className="text-[19px] text-paper">{item.time}</span>
                  <span className="text-[19px] text-muted">{item.who}</span>
                  {item.note && (
                    <span className="ml-auto text-[17px] text-muted">
                      {item.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {reason === 'access' && (
            <div className="flex flex-col gap-3">
              <span className="text-[22px] font-semibold text-paper">
                共用「家庭記帳」
              </span>
              <div className="flex flex-col rounded-xl border border-line-soft">
                {WHY_SHARE.map((person) => (
                  <div
                    key={person.email}
                    className="flex h-[58px] items-center gap-4 border-b border-line-soft px-4 last:border-b-0"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-soft text-[17px] text-paper">
                      {person.who}
                    </span>
                    <span className="font-mono text-[18px] text-paper">
                      {person.email}
                    </span>
                    <span className="ml-auto text-[19px] text-muted">
                      {person.role}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-l-[6px] border-violet/70 border-l-violet bg-violet/14 px-4 py-3">
                <span className="shrink-0 text-[19px] font-semibold text-paper">
                  一般存取權
                </span>
                <span className="text-[19px] text-paper">
                  限制：只有上面這三個帳號打得開
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WhySheetsDemo() {
  const [pick, setPick] = useState<WhyId>('readable');

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] flex-col gap-5">
      <div className="flex min-h-0 flex-1 gap-7">
        {/* 左：三個理由 */}
        <div className="flex w-[640px] shrink-0 flex-col gap-4">
          <div className="flex h-9 shrink-0 items-center gap-3">
            <span className="size-2.5 rounded-full bg-violet" />
            <span className={`${LABEL_TYPE} text-violet`}>
              把資料放在網站外面
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
            {WHY_REASONS.map((reason, index) => {
              const on = reason.id === pick;
              return (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setPick(reason.id)}
                  aria-pressed={on}
                  className={`flex shrink-0 flex-col gap-2 px-6 py-5 ${PICK_BASE} ${
                    on ? PICK_ON : PICK_OFF
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`${STEP_BADGE} ${
                        on ? PILL_SHEET : 'border-line text-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-[28px] font-semibold ${
                        on ? 'text-violet' : 'text-paper'
                      }`}
                    >
                      {reason.title}
                    </span>
                  </span>
                  <span
                    className={`text-[21px] leading-[1.55] ${
                      on ? 'text-paper' : 'text-muted'
                    }`}
                  >
                    {reason.body}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右：網站 ⇄ Google 試算表 */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex h-9 shrink-0 items-center gap-3">
            <span className="size-2.5 rounded-full bg-role-client" />
            <span className={`${LABEL_TYPE} text-muted`}>
              網站 ⇄ Google 試算表
            </span>
          </div>
          <div className="flex min-h-0 flex-1 items-stretch gap-5">
            <WhySiteBox reason={pick} />
            <WhyLink reason={pick} />
            <WhySheetBox reason={pick} />
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <Hint>
          ChatGPT Sites 也有自己的資料庫（關聯式，與 SQLite 相容）；這堂課要讓全家直接看、直接改，所以把資料放在網站外面。
        </Hint>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 29 頁 — SpreadsheetDemo
 *
 * 主區是一個試算表視窗（bg-panel，靠 violet 外框跟面板分開）。
 * 底部那一排是**試算表本人的分頁**（收支紀錄／家庭成員／分類／每月預算
 * ＋ 一顆「＋」），不是這一頁的步驟 —— 步驟走右下角的控制列。
 *
 * 三個階段：
 *   0 看表        四張分頁隨便點，先建立「資料本來就長這樣」的共識
 *   1 圈四欄      收支紀錄的 日期／成員／分類／金額 被框起來
 *                 （以網站的「每月統計」那一頁為例）
 *   2 對到網站    A1:D4 整塊框起來：分頁＝資料表、第 1 列＝欄位名稱、
 *                 往下每一列＝一筆紀錄，右欄附 Sheets API values 的示意
 *
 * 收支紀錄的欄位順序刻意是「日期、成員、分類、金額、項目、備註」——
 * 網站要的四欄排在 A–D 連在一起，第 2 階段的示意才能對應到一個真的範圍
 * （`收支紀錄!A1:D4`），不是憑空挑出不相鄰的幾欄。
 *
 * ──────────────────────────────────────────────────────────────
 * 版面：右欄三個階段都在，只換內容
 * ──────────────────────────────────────────────────────────────
 * 右邊那一欄是常駐的 `w-[560px]`，不可以改成條件掛載 —— 否則試算表
 * 在階段之間會被擠窄，欄寬整批重算、每一格橫向位移一大段。
 * 進場動畫靠 `key={stage}` ＋ 全域的 `.slide-enter`，但**掛在卡片區裡
 * 置中的那一層**，不掛在 aside 上：aside 貼齊主區底邊，`.slide-enter`
 * 從下方 10px 滑入時會整整凸出 10px（背景分頁的動畫時間軸是暫停的，
 * 稽核就停在那一格）。置中的內層下方有餘裕，位移不會碰到邊。
 *
 * 高度預算：
 *   DemoRoot 648 − 控制列 44 − gap 20 = 主區 584
 *   試算表視窗 584 − 框線 2 = 582
 *     檔名列 52 + 格線 444 + 空白 40 + 分頁列 46 = 582
 *     格線 444 = 欄標列 38 + 7 列 × 58（欄位名稱 1 + 資料 3 + 空白 3）
 *   右欄 584 = 小標 36 + gap 16 + 卡片區 532
 *     階段 0 ≈ 472、階段 1 ≈ 460、階段 2 ≈ 482
 *     最高的階段 2 上下各留約 25，扣掉進場位移 10 還剩約 15
 *
 * 四張分頁都是 3 筆 —— 列數一致，切分頁時格線的高度才不會跳。
 * ══════════════════════════════════════════════════════════════ */

type SheetTabId = 'records' | 'members' | 'categories' | 'budget';

interface SheetDoc {
  id: SheetTabId;
  /** 分頁上的名字 */
  label: string;
  /** 試算表第 1 列的欄位名稱 */
  header: readonly string[];
  rows: readonly (readonly string[])[];
  /** 右欄那張卡上的一句話：這張表裝的是什麼。**一行以內**（≤ 22 個全形字） */
  note: string;
  /** 停在這一張表時，底部那一句 */
  hint: string;
}

const SHEET_DOCS: readonly SheetDoc[] = [
  {
    id: 'records',
    label: '收支紀錄',
    header: ['日期', '成員', '分類', '金額', '項目', '備註'],
    rows: [
      ['2026-09-01', '媽媽', '餐飲', '320', '菜市場', '週末採買'],
      ['2026-09-02', '爸爸', '交通', '1150', '加油', ''],
      ['2026-09-03', '小明', '教育', '380', '參考書', '月考用'],
    ],
    note: '哪一天、誰、哪一類、花了多少',
    hint: '一列是一筆收支，一欄是一個欄位 —— 這種表你本來就會看。',
  },
  {
    id: 'members',
    label: '家庭成員',
    header: ['成員', '身分', 'Google 帳號'],
    rows: [
      ['爸爸', '家長', 'dad@example.com'],
      ['媽媽', '家長', 'mom@example.com'],
      ['小明', '小孩', 'ming@example.com'],
    ],
    note: '家裡有誰，各用哪個 Google 帳號',
    hint: '換一張分頁：家裡有誰。同一份試算表裡，用底下的分頁切換。',
  },
  {
    id: 'categories',
    label: '分類',
    header: ['分類', '收支', '包含哪些'],
    rows: [
      ['餐飲', '支出', '三餐、買菜、飲料'],
      ['交通', '支出', '加油、捷運、停車'],
      ['教育', '支出', '學費、書籍、補習'],
    ],
    note: '每一筆收支要歸到哪一類',
    hint: '分類也是一張表 —— 每一筆收支要歸到哪一類、包含哪些東西。',
  },
  {
    id: 'budget',
    label: '每月預算',
    header: ['月份', '分類', '預算'],
    rows: [
      ['2026-09', '餐飲', '12000'],
      ['2026-09', '交通', '3000'],
      ['2026-09', '教育', '2000'],
    ],
    note: '每個月、每一類打算花多少',
    hint: '預算一樣是一張表。四張分頁放在同一份試算表裡，就是這個家的記帳資料。',
  },
];

/**
 * 收支紀錄裡「每月統計那一頁真的需要」的四欄。
 * `col` 是欄索引，右欄卡片的 badge 直接換算成 A / B / C / D ——
 * 跟試算表上被圈起來的欄標是同一個字母，台下才對得起來。
 */
const SHEET_NEEDED: readonly { col: number; field: string; body: string }[] = [
  { col: 0, field: '日期', body: '只算這個月的' },
  { col: 1, field: '成員', body: '每個人各花了多少' },
  { col: 2, field: '分類', body: '每一類各花了多少' },
  { col: 3, field: '金額', body: '加總起來的數字' },
];

/** 圈選哪幾欄由 `SHEET_NEEDED` 決定，兩邊不會各說各話 */
const SHEET_MARK_COLS: readonly number[] = SHEET_NEEDED.map((item) => item.col);

const SHEET_TOTAL = 3;

/** 控制列那顆主要按鈕，三個階段的字 */
const SHEET_ACTIONS: readonly string[] = [
  '圈出網站要的欄位',
  '對到網站的資料',
  '三個對應都在右邊了',
];

/** 右欄的小標，三個階段各一句 */
const SHEET_RAIL_TITLES: readonly string[] = [
  '同一份試算表裡的四張分頁',
  '網站那一頁真正要的幾欄',
  '試算表怎麼對到網站的資料',
];

/** 第 1、2 階段的底部提示。第 0 階段跟著分頁走（見 SheetDoc.hint） */
const SHEET_HINTS: readonly string[] = [
  '',
  '「每月統計」只要日期、成員、分類、金額這四欄 —— 挑得出來，就代表這份資料有結構。',
  '網站透過 Google Sheets API 讀到的，就是這一列一列的資料。',
];

/**
 * 第 2 階段的示意：讀取 `收支紀錄!A1:D4` 時，回應裡的 values。
 * 形狀是 Sheets API 的真實形狀（二維陣列、值預設是顯示出來的字串），
 * 回應裡的 range、majorDimension 省略，所以標成示意。
 */
const SHEET_VALUES_LINES: readonly string[] = [
  '{',
  '  "values": [',
  '    ["日期", "成員", "分類", "金額"],',
  '    ["2026-09-01", "媽媽", "餐飲", "320"],',
  '    ["2026-09-02", "爸爸", "交通", "1150"],',
  '    ["2026-09-03", "小明", "教育", "380"]',
  '  ]',
  '}',
];

/** 第 2 階段右欄那三張對應卡 */
const SHEET_MAPPING: readonly { id: string; from: string; to: string }[] = [
  { id: 'tab', from: '一個分頁', to: '一張資料表' },
  { id: 'head', from: '第 1 列', to: '欄位名稱' },
  { id: 'rows', from: '往下每一列', to: '一筆紀錄' },
];

/** 對應卡左邊的記號：跟試算表上的樣子一模一樣 */
function SheetMappingMark({ id }: { id: string }) {
  if (id === 'tab') {
    return (
      <span className="rounded-lg bg-paper px-3 py-1 text-[17px] font-semibold text-on-accent">
        收支紀錄
      </span>
    );
  }
  if (id === 'head') {
    return (
      <span className="rounded-md bg-violet px-2 font-mono text-[18px] font-semibold text-on-accent">
        1
      </span>
    );
  }
  return (
    <span className="font-mono text-[18px] font-semibold tracking-[0.3em] text-violet">
      234
    </span>
  );
}

export function SpreadsheetDemo() {
  const [tab, setTab] = useState<SheetTabId>('records');
  const [stage, setStage] = useState(0);

  const doc = SHEET_DOCS.find((item) => item.id === tab) ?? SHEET_DOCS[0];
  /** 圈選只發生在收支紀錄上 */
  const onRecords = tab === 'records';

  /** 往任何一個階段跳，只要不是第 0 階段就先把分頁切回收支紀錄 */
  const goStage = (next: number) => {
    const clamped = Math.max(0, Math.min(SHEET_TOTAL - 1, next));
    if (clamped > 0) setTab('records');
    setStage(clamped);
  };

  /** 換到別張表就退回第 0 階段 —— 圈欄與對應的說法只對收支紀錄成立 */
  const pickTab = (id: SheetTabId) => {
    setTab(id);
    if (id !== 'records') setStage(0);
  };

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="flex min-h-0 flex-1 gap-5">
        {/* 左：試算表視窗。右欄常駐，所以三個階段都是同一個寬度 */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-violet/55 bg-panel text-paper">
          {/* 檔名列 */}
          <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line-soft px-5">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet font-display text-[16px] font-semibold text-on-accent">
              表
            </span>
            <span className="text-[21px] font-semibold">家庭記帳</span>
            <span className="ml-auto shrink-0 rounded-full bg-paper px-3.5 py-1 text-[16px] text-on-accent">
              Google 試算表
            </span>
          </div>

          {/* 格線。尺寸寫死在這裡，不吃 SheetGrid 的預設值 */}
          <SheetGrid
            key={doc.id}
            header={doc.header}
            rows={doc.rows}
            blankRows={3}
            markCols={stage === 1 && onRecords ? SHEET_MARK_COLS : []}
            rangeCols={stage === 2 && onRecords ? 4 : 0}
            size={24}
            rowHeight={58}
            headHeight={38}
          />

          {/* 表格底下的空白。真的試算表這一塊也是空的 */}
          <div className="min-h-0 flex-1" />

          {/* 分頁列：這是試算表本人的分頁，不是這一頁的步驟 */}
          <div className="flex h-[46px] shrink-0 items-center gap-1.5 border-t border-line-soft bg-ink-soft px-3">
            {SHEET_DOCS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickTab(item.id)}
                aria-current={item.id === tab}
                className={`flex h-[34px] shrink-0 items-center rounded-lg px-4 text-[19px] transition-colors duration-200 ${
                  item.id === tab
                    ? 'bg-paper font-semibold text-on-accent'
                    : 'text-muted hover:bg-panel'
                }`}
              >
                {item.label}
              </button>
            ))}
            <span
              aria-hidden="true"
              className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-[22px] text-muted"
            >
              ＋
            </span>
          </div>
        </div>

        {/* 右：常駐的說明欄，換的只有裡面的內容。
            aside 本身不掛動畫 —— 它貼齊主區底邊，進場位移 10px 就凸出去；
            動畫掛在置中的內層，下方留得出位移的空間 */}
        <aside className="flex min-h-0 w-[560px] shrink-0 flex-col gap-4">
          <div className="flex h-9 shrink-0 items-center gap-3">
            <span className="size-2.5 rounded-full bg-violet" />
            <span className={`${LABEL_TYPE} text-violet`}>
              {SHEET_RAIL_TITLES[stage]}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <div key={stage} className="slide-enter flex flex-col gap-3.5">
              {/* 階段 0：四張分頁各是什麼，目前這一張跟著底部分頁高亮 */}
              {stage === 0 &&
                SHEET_DOCS.map((item) => {
                  const on = item.id === tab;
                  return (
                    <div
                      key={item.id}
                      className={`shrink-0 px-6 py-4 ${PICK_BASE} ${
                        on ? PICK_ON : 'border-line-soft border-l-line bg-panel-lift'
                      }`}
                    >
                      <span
                        className={`text-[24px] font-semibold ${
                          on ? 'text-violet' : 'text-paper'
                        }`}
                      >
                        {item.label}
                      </span>
                      <p
                        className={`mt-1.5 text-[21px] leading-[1.5] ${
                          on ? 'text-paper' : 'text-muted'
                        }`}
                      >
                        {item.note}
                      </p>
                    </div>
                  );
                })}

              {/* 階段 1：被圈起來的那四欄，badge 就是欄標的 A / B / C / D */}
              {stage === 1 && (
                <>
                  <p className="shrink-0 text-[21px] text-muted">
                    以「每月統計」為例：誰花了多少、花在哪一類
                  </p>
                  {SHEET_NEEDED.map((item) => (
                    <div
                      key={item.field}
                      className="flex shrink-0 items-center gap-4 rounded-2xl border border-l-[6px] border-violet/55 border-l-violet bg-violet/14 px-5 py-3"
                    >
                      <span className={`${STEP_BADGE} ${PILL_SHEET} font-semibold`}>
                        {String.fromCharCode(65 + item.col)}
                      </span>
                      <span className="w-[64px] shrink-0 text-[24px] font-semibold text-violet">
                        {item.field}
                      </span>
                      <span className="text-[21px] text-paper">{item.body}</span>
                    </div>
                  ))}

                  <div className="shrink-0 rounded-2xl border border-line-soft bg-panel-lift px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      {['項目', '備註'].map((text) => (
                        <span
                          key={text}
                          className="inline-flex shrink-0 items-center rounded-full border border-line bg-panel px-3.5 py-1 text-[17px] text-muted"
                        >
                          {text}
                        </span>
                      ))}
                      <span className="text-[19px] text-faint">沒圈到</span>
                    </div>
                    <p className="mt-2 text-[21px] leading-[1.55] text-muted">
                      看明細的那一頁才用得到；每月統計只要左邊四欄。
                    </p>
                  </div>
                </>
              )}

              {/* 階段 2：試算表的三個部位各對到什麼，加上 API 讀到的示意 */}
              {stage === 2 && (
                <>
                  {SHEET_MAPPING.map((item) => (
                    <div
                      key={item.id}
                      className="grid shrink-0 grid-cols-[124px_1fr] items-center gap-4 rounded-2xl border border-l-[6px] border-violet/55 border-l-violet bg-violet/14 px-5 py-2"
                    >
                      <span className="flex">
                        <SheetMappingMark id={item.id} />
                      </span>
                      <span className="flex items-baseline gap-3">
                        <span className="text-[21px] text-muted">{item.from}</span>
                        <span className="text-[21px] text-faint">＝</span>
                        <span className="text-[24px] font-semibold text-paper">
                          {item.to}
                        </span>
                      </span>
                    </div>
                  ))}

                  <div className="shrink-0 rounded-2xl border border-line-soft bg-panel-lift px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`${LABEL_TYPE} text-faint`}>
                        API 回傳的 values（示意）
                      </span>
                      <span className="ml-auto font-mono text-[16px] text-muted">
                        收支紀錄!A1:D4
                      </span>
                    </div>
                    <pre className="mt-2 rounded-xl bg-panel px-3 py-2.5 font-mono text-[18px] leading-[1.35] text-paper">
                      {SHEET_VALUES_LINES.join('\n')}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <Hint strong={stage === 2}>
          {stage === 0 ? doc.hint : SHEET_HINTS[stage]}
        </Hint>
        <div className="flex shrink-0 items-center gap-4">
          <StepDots total={SHEET_TOTAL} current={stage} onPick={goStage} />
          <button
            type="button"
            onClick={() => goStage(stage + 1)}
            disabled={stage >= SHEET_TOTAL - 1}
            className={`${BTN_ROW} ${
              stage >= SHEET_TOTAL - 1 ? GHOST_OFF : `${PILL_SHEET} font-medium`
            }`}
          >
            {SHEET_ACTIONS[stage]}
          </button>
          <button
            type="button"
            onClick={() => {
              setStage(0);
              setTab('records');
            }}
            className={`${BTN_ROW} ${GHOST_SKIN}`}
          >
            重來
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 30 頁 — GoogleServiceDemo
 *
 * 這一頁的主角是那份操作文件的公開連結（講者指定：直接用那一頁介紹）。
 * 左邊一張大的連結卡（整張是 <a target="_blank">），右邊列出文件裡的
 * 步驟當導覽，點一下標出正在講的那一步。每一步只寫一句話，
 * 截圖與注意事項留在文件裡；權限與授權來源在第 31、34 頁會再講。
 *
 * 顏色：blue ＝ 連結（info），violet ＝ 步驟（這一章的主色）。
 *
 * 版面（根 700）：連結卡 860 ／ gap 32 ／ 步驟欄 ≈ 848
 *   步驟欄：小標 36 ＋ gap 16 ＋ 五列（各約 104）＋ gap 12 × 4 ≈ 620
 * ══════════════════════════════════════════════════════════════ */

const GUIDE_URL =
  'https://liberating-turtle-5a2.notion.site/Google-Service-30f6a246851880cb9886f32a49aa87b6';

const GUIDE_TITLE =
  '如何從零開啟 Google Service 服務，以及該服務需要注意的項目';

interface ServiceStep {
  mark: string;
  title: string;
  body: string;
  /** 本簡報後面哪一頁會再講 */
  later?: string;
}

const SERVICE_STEPS: readonly ServiceStep[] = [
  {
    mark: '1',
    title: '啟用 Google Sheets API',
    body: '在 Google Cloud 的專案裡啟用它，網站才能讀寫試算表。',
  },
  {
    mark: '2',
    title: '設定 OAuth 同意畫面',
    body: '使用者登入時看到的授權畫面；一般用戶選「外部」。',
  },
  {
    mark: '3',
    title: '建立 OAuth 用戶端 ID',
    body: '類型選「網頁應用程式」，填上「已授權的 JavaScript 來源」。',
    later: '第 34 頁',
  },
  {
    mark: '4',
    title: '加入測試使用者',
    body: '還在「測試」狀態時，只有名單上的帳號能完成登入授權。',
    later: '第 31 頁',
  },
  {
    mark: '最後',
    title: '複製 Client ID，放進 config.js',
    body: 'Client ID 可以公開寫在前端；Client Secret 不要放進前端。',
  },
];

export function GoogleServiceDemo() {
  const [pick, setPick] = useState(0);

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] gap-8">
      {/* 左：文件連結 —— 這一頁的主角 */}
      <a
        href={GUIDE_URL}
        target="_blank"
        rel="noreferrer"
        className="group flex w-[860px] shrink-0 flex-col justify-between rounded-3xl border-2 border-blue/70 bg-panel p-10 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
      >
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-blue" />
          <span className={`${LABEL_TYPE} text-blue`}>操作文件</span>
          <span className="ml-auto rounded-full border border-blue/55 px-3.5 py-1 text-[17px] text-blue">
            Notion 公開頁面
          </span>
        </div>

        <div className="flex flex-col gap-7">
          <h3 className="text-[42px] leading-[1.35] font-semibold text-paper">
            {GUIDE_TITLE}
          </h3>
          <p className="rounded-2xl border border-line-soft bg-ink-soft px-6 py-4 font-mono text-[19px] leading-[1.55] break-all text-blue">
            {GUIDE_URL}
          </p>
          <span className="inline-flex w-fit items-center gap-3 rounded-xl bg-blue px-6 py-3.5 text-[22px] font-medium text-on-accent">
            在新分頁打開文件
            <span aria-hidden="true">↗</span>
          </span>
        </div>

        <p className="text-[21px] leading-[1.55] text-muted">
          每一步的截圖與要注意的地方都在文件裡；右邊只列順序。
        </p>
      </a>

      {/* 右：文件裡的步驟 */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex h-9 shrink-0 items-center gap-3">
          <span className="size-2.5 rounded-full bg-violet" />
          <span className={`${LABEL_TYPE} text-violet`}>文件裡的步驟</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          {SERVICE_STEPS.map((step, index) => {
            const on = index === pick;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => setPick(index)}
                aria-pressed={on}
                className={`flex shrink-0 items-center gap-5 px-6 py-4 ${PICK_BASE} ${
                  on ? PICK_ON : PICK_OFF
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl border font-display ${
                    step.mark.length > 1 ? 'text-[16px]' : 'text-[22px]'
                  } ${on ? PILL_SHEET : 'border-line text-muted'}`}
                >
                  {step.mark}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-[26px] font-semibold ${
                        on ? 'text-violet' : 'text-paper'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.later && (
                      <span className="ml-auto shrink-0 rounded-full border border-line px-3 py-0.5 text-[16px] text-muted">
                        {step.later}再講
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[21px] leading-[1.5] ${
                      on ? 'text-paper' : 'text-muted'
                    }`}
                  >
                    {step.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
