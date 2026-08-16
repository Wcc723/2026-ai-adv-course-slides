import { useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * 色票總覽：直接從 CSS 變數讀值，theme.css 改了這裡就會跟著改
 * ──────────────────────────────────────────────────────────── */

interface TokenGroup {
  label: string;
  note: string;
  tokens: string[];
}

const tokenGroups: TokenGroup[] = [
  {
    label: '基底',
    note: '表面與分隔線，panel 最亮',
    tokens: [
      'panel',
      'ink',
      'panel-lift',
      'ink-soft',
      'line',
      'line-soft',
      'letterbox',
    ],
  },
  {
    label: '前景',
    note: '文字三層 + 色塊上的挖空字',
    tokens: ['paper', 'muted', 'faint', 'on-accent'],
  },
  {
    label: '強調',
    note: '主色系，一頁最多用兩個',
    tokens: ['acid', 'coral', 'teal', 'blue'],
  },
  {
    label: '延伸',
    note: '圖解需要更多可辨識色時',
    tokens: ['lime', 'sky', 'violet', 'amber', 'danger'],
  },
  {
    label: '語意',
    note: '指向強調色的別名，改上面就會跟著動',
    tokens: ['ok', 'warn', 'error', 'info'],
  },
  {
    label: '角色',
    note: '前後端與資料流圖解共用',
    tokens: ['role-user', 'role-client', 'role-server', 'role-data'],
  },
];

const allTokens = tokenGroups.flatMap((group) => group.tokens);

/** 亮色主題的透明階慣例 */
const alphaSteps = [
  { alpha: 14, kind: 'bg', note: '一般底色' },
  { alpha: 20, kind: 'bg', note: '強調底色' },
  { alpha: 55, kind: 'border', note: '邊框' },
] as const;

/** 從 :root 讀出目前生效的色票值 */
function readTokenValues(): Record<string, string> {
  const computed = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    allTokens.map((token) => [
      token,
      computed.getPropertyValue(`--color-${token}`).trim(),
    ]),
  );
}

export function PaletteDemo() {
  const [values] = useState(readTokenValues);
  const [selected, setSelected] = useState('acid');

  const selectedVar = `var(--color-${selected})`;

  return (
    <div className="flex size-full min-h-0 flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-x-8 gap-y-5 overflow-auto">
        {tokenGroups.map((group) => (
          <section key={group.label}>
            <h4 className="font-display text-[20px] tracking-[0.14em] text-paper">
              {group.label}
              <span className="ml-3 text-[15px] tracking-normal text-faint">
                {group.note}
              </span>
            </h4>

            <div className="mt-2 grid gap-1">
              {group.tokens.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setSelected(token)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-1 text-left transition-colors ${
                    selected === token
                      ? 'border-acid/55 bg-acid/14'
                      : 'border-line-soft bg-panel-lift hover:border-line'
                  }`}
                >
                  <span
                    className="size-5 shrink-0 rounded border border-line"
                    style={{ background: `var(--color-${token})` }}
                  />
                  <span className="min-w-0 flex-1 truncate font-mono text-[16px] text-paper">
                    --color-{token}
                  </span>
                  <span className="font-mono text-[15px] text-faint uppercase">
                    {values[token] ?? ''}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 選取色的透明階示範。
          三個數字是亮色主題的慣例，比深色時代高一階：紙底要更高的 alpha
          才能做出同樣的存在感（深色 /8 疊在近黑上是 1.23:1，紙底要 /14）。

          文字一律用 paper 而不是強調色本身：強調色壓在自己的淡色底上
          只有 1.2–4:1，過不了稽核，這正是「填色不能單獨承擔語意」的例子。 */}
      <div className="shrink-0 rounded-xl border border-line bg-ink-soft px-4 py-3">
        <p className="font-mono text-[16px] text-muted">
          --color-{selected} 的透明階
          <span className="ml-3 font-sans text-[15px] text-faint">
            填色配不透明的粗邊，語意才不會被投影機吃掉
          </span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {alphaSteps.map(({ alpha, kind, note }) => (
            <div
              key={alpha}
              className="rounded-lg px-4 py-1.5 text-[17px] text-paper"
              style={
                kind === 'bg'
                  ? {
                      borderLeft: `6px solid ${selectedVar}`,
                      background: `color-mix(in srgb, ${selectedVar} ${alpha}%, transparent)`,
                    }
                  : {
                      border: `2px solid color-mix(in srgb, ${selectedVar} ${alpha}%, transparent)`,
                    }
              }
            >
              {/* note 也用 paper：muted 壓在 /20 的色底上只有 4.43:1，差一點就不合格 */}
              <span className="font-mono">/{alpha}</span>
              <span className="ml-2 text-[15px]">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 互動範例：示範 demo 版型可以放任何有狀態的 React 元件
 * ──────────────────────────────────────────────────────────── */

const ratios = ['1:1', '3:2', '2:3', '2:1', '1:2'] as const;

export function SplitRatioDemo() {
  const [ratio, setRatio] = useState<(typeof ratios)[number]>('3:2');
  const [left, right] = ratio.split(':');

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {ratios.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRatio(value)}
            className={`rounded-lg border px-5 py-2.5 font-mono text-[18px] transition-colors ${
              ratio === value
                ? 'border-acid bg-acid text-on-accent'
                : 'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div
        className="grid h-[260px] gap-4"
        style={{ gridTemplateColumns: `${left}fr ${right}fr` }}
      >
        <div className="grid place-items-center rounded-xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 text-[22px] text-teal">
          left
        </div>
        <div className="grid place-items-center rounded-xl border border-l-[6px] border-blue/55 border-l-blue bg-blue/14 text-[22px] text-blue">
          right
        </div>
      </div>

      <p className="text-center font-mono text-[17px] text-faint">
        {`{ kind: 'split', ratio: '${ratio}', left, right }`}
      </p>
    </div>
  );
}
