import { useMemo, type ReactNode } from 'react';
import type {
  Accent,
  SlideBody,
  SplitRatio,
  TableCell,
  TableRow,
} from '../types/slide';
import { getAsset } from '../assets/manifest';
import { Asset } from './Asset';
import { CodeTabs } from './CodeTabs';

/* ── 色票對照（Tailwind 需要完整字串，不能動態拼接）────────── */

const accentText: Record<Accent, string> = {
  acid: 'text-acid',
  coral: 'text-coral',
  teal: 'text-teal',
  blue: 'text-blue',
  lime: 'text-lime',
  sky: 'text-sky',
  violet: 'text-violet',
  amber: 'text-amber',
};

/*
 * 透明階在亮色主題下要比深色高一階。
 * 校準方式是對齊「觀感」而不是數字：深色的 bg-acid/8 疊在 #171713 上是 1.23:1，
 * 同樣的存在感在紙底需要 /14（疊在 panel 上 1.23–1.28:1）。
 * 邊框 /35 → /55（2.51–3.02:1），對應深色 /35 的 1.87–3.07:1。
 */
const accentBorder: Record<Accent, string> = {
  acid: 'border-acid/55',
  coral: 'border-coral/55',
  teal: 'border-teal/55',
  blue: 'border-blue/55',
  lime: 'border-lime/55',
  sky: 'border-sky/55',
  violet: 'border-violet/55',
  amber: 'border-amber/55',
};

const accentBg: Record<Accent, string> = {
  acid: 'bg-acid/14',
  coral: 'bg-coral/14',
  teal: 'bg-teal/14',
  blue: 'bg-blue/14',
  lime: 'bg-lime/14',
  sky: 'bg-sky/14',
  violet: 'bg-violet/14',
  amber: 'bg-amber/14',
};

/*
 * 不透明的左側粗條，跟 accentBg 搭配使用。
 *
 * 為什麼需要它：投影機做不出黑、環境光會把黑階抬起來，1.2:1 這種等級的
 * 半透明填色在教室後排會被整片吃掉。填色在筆電上是清楚的分組訊號，
 * 但不能單獨承擔語意——所以每張卡片再給一條實心的 accent 邊。
 */
const accentEdge: Record<Accent, string> = {
  acid: 'border-l-acid',
  coral: 'border-l-coral',
  teal: 'border-l-teal',
  blue: 'border-l-blue',
  lime: 'border-l-lime',
  sky: 'border-l-sky',
  violet: 'border-l-violet',
  amber: 'border-l-amber',
};

const ratioColumns: Record<SplitRatio, string> = {
  '1:1': '1fr 1fr',
  '3:2': '3fr 2fr',
  '2:3': '2fr 3fr',
  '2:1': '2fr 1fr',
  '1:2': '1fr 2fr',
};

/* ── 共用外框 ───────────────────────────────────────────── */

function Panel({
  children,
  caption,
  padded = true,
}: {
  children: ReactNode;
  caption?: string;
  padded?: boolean;
}) {
  return (
    <figure className="flex h-full min-h-0 w-full flex-col gap-4">
      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-2xl border border-line bg-panel ${
          padded ? 'p-10' : ''
        }`}
      >
        {children}
      </div>
      {caption && (
        <figcaption className="shrink-0 text-center text-[18px] tracking-wide text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── 各版型 ─────────────────────────────────────────────── */

function TitleBody({
  kicker,
  heading,
  lead,
  assetId,
  image,
}: Extract<SlideBody, { kind: 'title' }>) {
  const paragraphs = typeof lead === 'string' ? [lead] : (lead ?? []);

  return (
    <div className="flex h-full items-center gap-20">
      <div className="min-w-0 flex-1">
        {kicker && (
          <p className="font-display text-[22px] tracking-[0.18em] text-acid uppercase">
            {kicker}
          </p>
        )}
        <h2 className="mt-5 font-display text-[92px] leading-[1.02] font-semibold tracking-tight text-paper">
          {heading}
        </h2>
        {paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={`max-w-[1000px] text-[26px] leading-[1.75] text-muted ${
              index === 0 ? 'mt-8' : 'mt-5'
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>
      {/*
        素材畫框刻意用 bg-paper（近黑）而不是 bg-panel。
        素材是奶白線稿配深色填色，為深底畫的；直接放在紙面上輪廓線只剩 1.10:1
        會整條消失，圖形退化成深色剪影。墊一塊深色底板就能維持原本的關係
        （線稿對底板 14.76:1、內部填色 1.07:1），12 個檔案一個位元都不用改。
        ⚠ 這是刻意的設計語言，不是漏改。改回 bg-panel 不會有錯誤訊息，
          稽核也不會擋（剪影的對比反而更高），但素材會全部退化。
      */}
      {(assetId || image) && (
        <div className="grid size-[420px] shrink-0 place-items-center overflow-hidden rounded-3xl border border-line bg-paper">
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              className="size-[368px] object-contain"
            />
          ) : (
            assetId && <Asset id={assetId} size={280} />
          )}
        </div>
      )}
    </div>
  );
}

function DemoBody({
  render: Render,
  caption,
  bare,
}: Extract<SlideBody, { kind: 'demo' }>) {
  if (bare) {
    return (
      <figure className="flex h-full min-h-0 w-full flex-col gap-4">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
          <Render />
        </div>
        {caption && (
          <figcaption className="shrink-0 text-center text-[18px] text-faint">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <Panel caption={caption}>
      <Render />
    </Panel>
  );
}

function HtmlBody({ html, css, caption }: Extract<SlideBody, { kind: 'html' }>) {
  const srcDoc = useMemo(
    () => `<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<style>
  /*
   * iframe 是 sandbox，外層的 CSS 變數進不來，所以色票要在這裡重寫一份。
   * ⚠ 這 11 個值必須跟 theme.css 同步，改色票時容易漏掉這裡——
   *   漏掉的症狀是參考範本第 4 頁中間出現一塊深色方塊。
   * color-scheme 也一定要跟著改，否則 sandbox 內的表單控制項與捲軸
   * 會維持深色的 UA 樣式。
   */
  :root {
    color-scheme: light;
    --ink: #f4f1e8;
    --ink-soft: #e9e5d9;
    --panel: #fffdf9;
    --panel-lift: #efebe0;
    --line: #c2b8a2;
    --paper: #211f19;
    --muted: #4f4a39;
    --acid: #9f257b;
    --coral: #883a20;
    --teal: #095c5a;
    --blue: #2a3796;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--ink-soft);
    color: var(--paper);
    font-family: "Avenir Next", "PingFang TC", "Noto Sans TC", system-ui, sans-serif;
    font-size: 20px;
    line-height: 1.7;
  }
  ${css ?? ''}
</style>
</head>
<body>
${html}
<script>
  // 焦點在 iframe 裡時，父層收不到 keydown。把翻頁按鍵轉發回簡報，
  // 這樣操作過範例之後還是能直接用鍵盤翻頁。
  (function () {
    var NAV = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','f','F','b','B','h','H'];
    addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var target = event.target;
      if (target && (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName) !== -1)) return;
      if (NAV.indexOf(event.key) === -1) return;
      event.preventDefault();
      parent.postMessage({ type: 'slide-key', key: event.key }, '*');
    });
  })();
</script>
</body>
</html>`,
    [html, css],
  );

  return (
    <figure className="flex h-full min-h-0 w-full flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-ink-soft">
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="size-full border-0"
          title="HTML 範例"
        />
      </div>
      {caption && (
        <figcaption className="shrink-0 text-center text-[18px] text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function DiagramBody({
  render: Render,
  caption,
}: Extract<SlideBody, { kind: 'diagram' }>) {
  return (
    <Panel caption={caption}>
      {/* 圖解等比放大填滿面板寬度，高度不足時由 viewBox 自動 letterbox */}
      <div className="flex size-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-full">
        <Render />
      </div>
    </Panel>
  );
}

function PointsBody({
  heading,
  items,
}: Extract<SlideBody, { kind: 'points' }>) {
  // 項目多的時候自動收緊，避免超出舞台高度
  const dense = items.length > 4;

  return (
    <div className={`flex h-full min-h-0 flex-col ${dense ? 'gap-6' : 'gap-8'}`}>
      {heading && (
        <h3 className="shrink-0 font-display text-[40px] font-semibold tracking-tight text-paper">
          {heading}
        </h3>
      )}
      <ul
        className={`grid min-h-0 flex-1 content-start overflow-auto ${
          dense ? 'gap-3' : 'gap-4'
        }`}
      >
        {items.map((item, index) => {
          const accent = item.accent ?? 'acid';

          return (
            <li
              key={item.text}
              className={`flex items-start gap-6 rounded-2xl border border-l-[6px] px-8 ${
                dense ? 'py-5' : 'py-6'
              } ${accentBorder[accent]} ${accentEdge[accent]} ${accentBg[accent]}`}
            >
              <span
                className={`font-display leading-none font-semibold tabular-nums ${
                  dense ? 'text-[26px]' : 'text-[30px]'
                } ${accentText[accent]}`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p
                  className={`leading-snug text-paper ${
                    dense ? 'text-[26px]' : 'text-[28px]'
                  }`}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 underline underline-offset-4 transition-colors hover:text-acid ${accentText[accent]}`}
                    >
                      {item.text}
                      <ExternalLinkArrow />
                    </a>
                  ) : (
                    item.text
                  )}
                </p>
                {item.note && (
                  <p
                    className={`mt-1.5 leading-relaxed text-muted ${
                      dense ? 'text-[19px]' : 'text-[21px]'
                    }`}
                  >
                    {item.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AssetsBody({
  heading,
  items,
}: Extract<SlideBody, { kind: 'assets' }>) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-8">
      {heading && (
        <h3 className="shrink-0 font-display text-[40px] font-semibold tracking-tight text-paper">
          {heading}
        </h3>
      )}
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 overflow-auto">
        {items.map((item) => {
          const meta = getAsset(item.id);

          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-panel px-5 py-7"
            >
              {/* 素材本身墊一塊 bg-paper 底板，卡片其餘部分維持紙面。
                  理由同 TitleBody 的畫框：素材是為深底畫的，直接放在紙上
                  輪廓線會消失。把底板收在素材周圍而不是整張卡，
                  說明文字才能留在紙面上、維持既有的 paper / faint 階層。 */}
              <div className="grid size-[176px] place-items-center rounded-xl bg-paper">
                <Asset id={item.id} size={140} />
              </div>
              <div className="text-center">
                <p className="text-[22px] text-paper">
                  {item.label ?? meta.name}
                </p>
                <p className="mt-1.5 text-[17px] leading-snug text-faint">
                  {item.note ?? meta.purpose}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 外部連結儲存格尾端的小箭頭，用 currentColor 跟著文字色與 hover 走 */
function ExternalLinkArrow() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M9.5 2.5h4v4" />
      <path d="M13.5 2.5 7.5 8.5" />
      <path d="M11.5 9v4.5h-9v-9H7" />
    </svg>
  );
}

function TableCellView({ cell }: { cell: string | TableCell }) {
  const data: TableCell = typeof cell === 'string' ? { text: cell } : cell;
  const face = data.mono ? 'font-mono text-[20px]' : '';

  const body = data.href ? (
    <a
      href={data.href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 underline underline-offset-4 transition-colors hover:text-acid ${
        data.accent ? accentText[data.accent] : 'text-blue'
      } ${face}`}
    >
      {data.text}
      <ExternalLinkArrow />
    </a>
  ) : (
    <span
      className={`${data.accent ? accentText[data.accent] : 'text-paper'} ${face}`}
    >
      {data.text}
    </span>
  );

  if (!data.note) return body;

  // 小標接在主文上方，用 faint 的字級與間距，不跟主文搶視線
  return (
    <span className="block">
      <span className="mb-1.5 block font-display text-[16px] tracking-[0.14em] text-faint uppercase">
        {data.note}
      </span>
      {body}
    </span>
  );
}

/** 同一份表格內文字可能重複，把整列的文字併起來當 key */
function rowKey(row: TableRow, index: number) {
  const label = row
    .map((cell) => (typeof cell === 'string' ? cell : cell.text))
    .join('|');

  return `${index}-${label}`;
}

function TableBody({
  heading,
  columns,
  rows,
  note,
}: Extract<SlideBody, { kind: 'table' }>) {
  // 列數多時自動收緊列高。簡報不該出現捲軸，超過約 10 列就該拆頁。
  const rowPadding =
    rows.length > 8 ? 'py-3' : rows.length > 6 ? 'py-4' : 'py-5';

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {heading && (
        <h3 className="shrink-0 font-display text-[40px] font-semibold tracking-tight text-paper">
          {heading}
        </h3>
      )}

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-panel px-6 py-7">
        <table className="h-full w-full border-collapse text-left">
          <thead>
            {/* h-0 讓表頭不去吸收 h-full 分配下來的多餘高度 */}
            <tr className="h-0">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-line px-5 pb-4 font-display text-[18px] font-semibold tracking-[0.16em] text-faint uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowKey(row, rowIndex)}
                className="border-b border-line-soft last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    className={`px-5 align-middle text-[22px] leading-snug ${rowPadding}`}
                  >
                    <TableCellView cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note && (
        <p className="shrink-0 text-[19px] leading-relaxed text-faint">{note}</p>
      )}
    </div>
  );
}

function SplitBody({
  left,
  right,
  ratio = '1:1',
}: Extract<SlideBody, { kind: 'split' }>) {
  return (
    <div
      className="grid h-full min-h-0 gap-8"
      style={{ gridTemplateColumns: ratioColumns[ratio] }}
    >
      <div className="min-h-0 min-w-0">
        <SlideBodyView body={left} />
      </div>
      <div className="min-h-0 min-w-0">
        <SlideBodyView body={right} />
      </div>
    </div>
  );
}

/* ── 分派 ───────────────────────────────────────────────── */

export function SlideBodyView({ body }: { body: SlideBody }) {
  switch (body.kind) {
    case 'title':
      return <TitleBody {...body} />;
    case 'demo':
      return <DemoBody {...body} />;
    case 'html':
      return <HtmlBody {...body} />;
    case 'diagram':
      return <DiagramBody {...body} />;
    case 'code':
      return <CodeTabs codeBlocks={body.blocks} />;
    case 'points':
      return <PointsBody {...body} />;
    case 'assets':
      return <AssetsBody {...body} />;
    case 'table':
      return <TableBody {...body} />;
    case 'split':
      return <SplitBody {...body} />;
  }
}
