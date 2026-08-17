import { useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * 第 10 頁 — ESLint 運作概念
 *
 * 用色：acid 是操作色（分頁、開關、修正鈕），error 是違規、ok 是修好之後。
 * 主色系同時只會出現 acid + teal(ok) 兩支，紅（danger）走延伸色，
 * 因為「違規／通過」需要一組彼此分得開的狀態色。
 *
 * 違規行不是只有 bg-error/14 —— 淡填色在投影機上會整片被吃掉，
 * 一律再配一條 6px 不透明的左粗條（跟 CodeBlock 的 highlightLines 同一套做法）。
 * ──────────────────────────────────────────────────────────── */

type LintRuleName = 'semi' | 'prefer-const' | 'camelcase';

interface LintProblem {
  /** 1 起算的行號 */
  line: number;
  rule: LintRuleName;
  message: string;
}

interface LintCase {
  id: LintRuleName;
  label: string;
  filename: string;
  before: readonly string[];
  after: readonly string[];
  problems: readonly LintProblem[];
}

/** 每個分頁最多 8 行 —— 程式碼井的高度是照 8 行算死的，加行就會超出高度預算 */
const lintCases: readonly LintCase[] = [
  {
    id: 'semi',
    label: '分號',
    filename: 'cart.js',
    before: [
      'function getTotal(items) {',
      '  let total = 0',
      '  for (const item of items) {',
      '    total += item.price',
      '  }',
      '  return total',
      '}',
    ],
    after: [
      'function getTotal(items) {',
      '  let total = 0;',
      '  for (const item of items) {',
      '    total += item.price;',
      '  }',
      '  return total;',
      '}',
    ],
    problems: [
      { line: 2, rule: 'semi', message: 'Missing semicolon.' },
      { line: 4, rule: 'semi', message: 'Missing semicolon.' },
      { line: 6, rule: 'semi', message: 'Missing semicolon.' },
    ],
  },
  {
    id: 'prefer-const',
    label: 'let / const',
    filename: 'checkout.js',
    before: [
      'function getPayable(items) {',
      '  let total = sumPrice(items);',
      '  let taxRate = 0.05;',
      '  if (total > 1000) {',
      '    return total * (1 + taxRate) - 100;',
      '  }',
      '  return total * (1 + taxRate);',
      '}',
    ],
    after: [
      'function getPayable(items) {',
      '  const total = sumPrice(items);',
      '  const taxRate = 0.05;',
      '  if (total > 1000) {',
      '    return total * (1 + taxRate) - 100;',
      '  }',
      '  return total * (1 + taxRate);',
      '}',
    ],
    problems: [
      {
        line: 2,
        rule: 'prefer-const',
        message: "'total' is never reassigned. Use 'const' instead.",
      },
      {
        line: 3,
        rule: 'prefer-const',
        message: "'taxRate' is never reassigned. Use 'const' instead.",
      },
    ],
  },
  {
    id: 'camelcase',
    label: '命名規則',
    filename: 'profile.js',
    before: [
      'function renderProfile(user) {',
      '  const user_name = user.name;',
      '  const login_count = user.logins.length;',
      '  if (login_count === 0) {',
      '    return `${user_name} 尚未登入`;',
      '  }',
      '  return `${user_name} 已登入 ${login_count} 次`;',
      '}',
    ],
    after: [
      'function renderProfile(user) {',
      '  const userName = user.name;',
      '  const loginCount = user.logins.length;',
      '  if (loginCount === 0) {',
      '    return `${userName} 尚未登入`;',
      '  }',
      '  return `${userName} 已登入 ${loginCount} 次`;',
      '}',
    ],
    problems: [
      {
        line: 2,
        rule: 'camelcase',
        message: "Identifier 'user_name' is not in camel case.",
      },
      {
        line: 3,
        rule: 'camelcase',
        message: "Identifier 'login_count' is not in camel case.",
      },
    ],
  },
];

/** off＝沒裝規範、on＝ESLint 抓到問題、fixed＝跑過 --fix */
type LintMode = 'off' | 'on' | 'fixed';

const tabBase =
  'rounded-lg border px-5 py-2.5 text-[18px] transition-colors';
const tabOn = 'border-acid bg-acid text-on-accent';
const tabOff =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';

export function EslintDemo() {
  const [activeId, setActiveId] = useState<LintRuleName>('semi');
  const [mode, setMode] = useState<LintMode>('off');

  const active = lintCases.find((item) => item.id === activeId) ?? lintCases[0];
  const lines = mode === 'fixed' ? active.after : active.before;
  const flaggedLines = new Set(
    mode === 'on' ? active.problems.map((problem) => problem.line) : [],
  );

  const selectTab = (id: LintRuleName) => {
    setActiveId(id);
    // 換分頁時不關掉 ESLint，只把「已修正」退回「抓到問題」，才好連著三個分頁講
    setMode((current) => (current === 'fixed' ? 'on' : current));
  };

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-4">
      {/* ── 操作列 ─────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2">
        {lintCases.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectTab(item.id)}
            className={`${tabBase} ${activeId === item.id ? tabOn : tabOff}`}
          >
            {item.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode((current) => (current === 'off' ? 'on' : 'off'))}
            className={`${tabBase} ${mode === 'off' ? tabOff : tabOn}`}
          >
            套用 ESLint
          </button>
          <button
            type="button"
            disabled={mode !== 'on'}
            onClick={() => setMode('fixed')}
            className={`rounded-lg border px-5 py-2.5 font-mono text-[18px] transition-colors ${
              mode === 'on'
                ? 'border-acid bg-acid text-on-accent'
                : 'cursor-not-allowed border-line-soft bg-panel-lift text-faint'
            }`}
          >
            自動修正（--fix）
          </button>
        </div>
      </div>

      {/* ── 編輯器 ─────────────────────────────────────── */}
      <div className="shrink-0 overflow-hidden rounded-xl border border-line">
        <div className="flex items-center justify-between border-b border-line bg-panel-lift px-5 py-2.5">
          <span className="font-mono text-[18px] text-paper">
            {active.filename}
          </span>
          {mode === 'off' && (
            <span className="rounded-full border border-line px-3.5 py-1 font-mono text-[16px] text-muted">
              ESLint 未啟用
            </span>
          )}
          {mode === 'on' && (
            <span className="rounded-full bg-error px-3.5 py-1 font-mono text-[16px] text-on-accent">
              {active.problems.length} 個問題
            </span>
          )}
          {mode === 'fixed' && (
            <span className="rounded-full bg-ok px-3.5 py-1 font-mono text-[16px] text-on-accent">
              0 個問題
            </span>
          )}
        </div>

        <div className="min-h-[280px] bg-ink-soft py-3">
          {lines.map((line, index) => {
            const flagged = flaggedLines.has(index + 1);
            return (
              <div
                key={`${active.id}-${index}`}
                className={`flex h-[32px] items-center gap-3 pr-5 ${
                  flagged ? 'bg-error/14' : ''
                }`}
              >
                <span
                  className={`h-full w-[6px] shrink-0 ${flagged ? 'bg-error' : ''}`}
                />
                <span className="w-[28px] shrink-0 text-right font-mono text-[18px] text-faint">
                  {index + 1}
                </span>
                <code className="font-mono text-[20px] whitespace-pre text-paper">
                  {line}
                </code>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 結果區 ─────────────────────────────────────── */}
      <div className="flex min-h-[176px] shrink-0 flex-col gap-2.5">
        {mode === 'off' && (
          <div className="rounded-xl border border-line-soft bg-panel-lift px-5 py-4">
            <p className="text-[22px] text-paper">
              沒有規範時，這段程式碼可以被合併進專案
            </p>
            <p className="mt-1.5 text-[18px] text-muted">
              它跑得起來，只是每個人寫出來的樣子都不一樣 —— 按上面的「套用
              ESLint」看看機器會抓到什麼
            </p>
          </div>
        )}

        {mode === 'on' &&
          active.problems.map((problem) => (
            <div
              key={`${problem.rule}-${problem.line}`}
              className="flex items-center gap-4 rounded-lg border border-l-[6px] border-error/55 border-l-error bg-error/14 px-4 py-2.5"
            >
              <span className="w-[80px] shrink-0 text-[19px] text-paper">
                第 {problem.line} 行
              </span>
              <span className="shrink-0 font-mono text-[20px] font-semibold text-paper">
                {problem.rule}
              </span>
              <span className="text-[20px] text-paper">{problem.message}</span>
            </div>
          ))}

        {mode === 'fixed' && (
          <div className="rounded-xl border border-l-[6px] border-ok/55 border-l-ok bg-ok/14 px-5 py-4">
            <p className="text-[22px] text-paper">
              eslint --fix 已套用：{active.problems.length}{' '}
              個問題全部自動修正，程式的行為完全沒變
            </p>
            <p className="mt-1.5 text-[18px] text-paper">
              規則是機器讀的，所以機器自己就能改。留給人的只剩「要不要這條規則」
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 第 11 頁 — 加入 AI Rules
 *
 * 用色：acid 是「這條規則已啟用」的選取態（acid 的角色就是 selection／CTA），
 * 右側產出走語意色 ok / error / warn。主色系同時最多 acid + teal(ok) 兩支，
 * danger 與 amber 是延伸色，用在需要三段可辨識狀態的地方。
 * ──────────────────────────────────────────────────────────── */

type RuleId =
  'keep-assertions' | 'scope-tests' | 'minimal-diff' | 'stop-after-three';

/**
 * 左欄放的是「一整份 AGENTS.md」而不是四個被抽出來的選項 ——
 * 學員要看到的是真的專案裡會放的檔案長什麼樣子，所以連驗證指令、
 * 產生檔、金鑰、回報格式這些不可點的條目都寫進去。
 *
 * ⚠ 這一頁的文件容器是全 deck 唯一允許內部捲動的地方（卡斯伯指定）：
 *   文件本來就比容器高，捲動本身就是「這是一份完整檔案」的訊息。
 *   其餘元件仍然不准靠捲軸塞內容。
 *
 * kind: 'rule' 的四行是開關，驅動右欄的產出；其餘一律不可點。
 */
type DocLine =
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'rule'; id: RuleId; text: string }
  | { kind: 'blank' };

const agentsDoc: readonly DocLine[] = [
  { kind: 'h1', text: 'AGENTS.md' },
  { kind: 'blank' },

  { kind: 'h2', text: '專案結構' },
  {
    kind: 'bullet',
    text: '前端 apps/web、後端 apps/api，共用型別放 packages/shared。',
  },
  {
    kind: 'bullet',
    text: '前後端的欄位與型別以 openapi.json 為準，不要各自猜。',
  },
  { kind: 'blank' },

  { kind: 'h2', text: '驗證方式' },
  { kind: 'bullet', text: '修改 apps/web/ 後執行 pnpm --filter web test。' },
  { kind: 'bullet', text: '修改 apps/api/ 後執行 pnpm --filter api test。' },
  { kind: 'bullet', text: '契約或 Schema 異動後執行 pnpm contract:check。' },
  { kind: 'rule', id: 'scope-tests', text: '先跑相關測試，通過再跑完整測試。' },
  {
    kind: 'bullet',
    text: '送出前執行 pnpm lint 與 pnpm typecheck，兩個都要過。',
  },
  { kind: 'blank' },

  { kind: 'h2', text: '限制' },
  {
    kind: 'bullet',
    text: '不要直接修改自動產生的檔案（openapi.d.ts、*.gen.ts），改來源定義後重新產生。',
  },
  {
    kind: 'rule',
    id: 'keep-assertions',
    text: '不要為了讓測試通過而刪除斷言、放寬條件或更新 Snapshot。',
  },
  { kind: 'bullet', text: '新增正式環境相依套件前先說明原因。' },
  {
    kind: 'rule',
    id: 'minimal-diff',
    text: '修改範圍保持最小，不做無關的重構。',
  },
  {
    kind: 'bullet',
    text: '不要提交 .env 或任何金鑰，範例值寫進 .env.example。',
  },
  { kind: 'blank' },

  { kind: 'h2', text: '停止條件' },
  {
    kind: 'rule',
    id: 'stop-after-three',
    text: '同一問題最多修三次，之後交回人工確認。',
  },
  { kind: 'bullet', text: '要刪掉既有測試才能通過時，先停下來說明理由。' },
  { kind: 'bullet', text: '找不到規格或契約時不要自行假設，直接問。' },
  { kind: 'blank' },

  { kind: 'h2', text: '回報格式' },
  {
    kind: 'bullet',
    text: '先寫改了什麼，再寫怎麼驗證，最後寫還沒處理的部分。',
  },
  { kind: 'bullet', text: '測試沒過就直接說沒過，不要只回報通過的項目。' },
];

const ruleCount = agentsDoc.filter((line) => line.kind === 'rule').length;

const initialChecked: Record<RuleId, boolean> = {
  'keep-assertions': false,
  'scope-tests': false,
  'minimal-diff': false,
  'stop-after-three': false,
};

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" className="size-[14px]" aria-hidden="true">
      <path
        d="M4 10.6 8.2 14.6 16 5.4"
        fill="none"
        stroke="var(--color-on-accent)"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AiRulesDemo() {
  const [checked, setChecked] =
    useState<Record<RuleId, boolean>>(initialChecked);

  const toggle = (id: RuleId) =>
    setChecked((current) => ({ ...current, [id]: !current[id] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const honest = checked['keep-assertions'];
  const bounded = checked['stop-after-three'];

  const verdictTitle = honest
    ? '測試失敗：折扣金額預期 90、實際 100'
    : '已刪除 3 個斷言，測試通過 ✅';

  const verdictLines: readonly string[] = honest
    ? [
        '× tests/discount.test.ts:24 › 滿千折百',
        '原因：calcDiscount 少算了最低消費門檻',
        '建議：修正該函式，斷言與 Snapshot 一律不動',
      ]
    : [
        '- expect(total).toBe(90)',
        '- expect(items).toHaveLength(2)',
        '- expect(res.status).toBe(200)',
      ];

  const logLines: readonly string[] = [
    checked['scope-tests']
      ? '$ npm run test:module -- coupon  →  11s、34 行輸出'
      : '$ npm test  →  4m32s、1,842 行輸出',
    checked['minimal-diff']
      ? 'changed: src/utils/calcDiscount.ts（僅 1 個檔案）'
      : 'changed: calcDiscount.ts, cart.ts, order.ts … 共 8 個檔案',
  ];

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-5">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6">
        {/* ── 左：AGENTS.md 全文（唯一允許捲動的容器）──── */}
        <section>
          <p className="mb-3 text-[17px] leading-[1.5] text-faint">
            有核取方塊的 {ruleCount} 行可以點，勾選代表這條規則有寫進
            AGENTS.md；文件比框高，往下捲可以看完整份。
          </p>

          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex items-center justify-between border-b border-line bg-panel-lift px-5 py-2.5">
              <span className="font-mono text-[18px] text-paper">
                AGENTS.md
              </span>
              <span className="rounded-full border border-line px-3.5 py-1 font-mono text-[16px] text-muted">
                {checkedCount} / {ruleCount} 條已勾選
              </span>
            </div>

            {/* ⚠ 全 deck 唯一的內部捲軸：h 固定、內容約兩倍高，捲動是刻意的 */}
            <div className="h-[400px] overflow-y-auto bg-ink-soft px-4 py-4">
              {agentsDoc.map((line, index) => {
                const key = `${line.kind}-${index}`;

                if (line.kind === 'blank') {
                  return <div key={key} className="h-[12px]" />;
                }

                if (line.kind === 'h1') {
                  return (
                    <p
                      key={key}
                      className="px-2 font-mono text-[20px] leading-[1.7] text-paper"
                    >
                      <span className="text-faint">#</span> {line.text}
                    </p>
                  );
                }

                if (line.kind === 'h2') {
                  return (
                    <p
                      key={key}
                      className="px-2 font-mono text-[18px] leading-[1.7] text-paper"
                    >
                      <span className="text-faint">##</span> {line.text}
                    </p>
                  );
                }

                if (line.kind === 'bullet') {
                  return (
                    <div key={key} className="flex items-start gap-2 px-2">
                      <span className="w-[20px] shrink-0 font-mono text-[17px] leading-[1.7] text-faint">
                        -
                      </span>
                      <span className="font-mono text-[17px] leading-[1.7] text-muted">
                        {line.text}
                      </span>
                    </div>
                  );
                }

                const on = checked[line.id];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(line.id)}
                    className="flex w-full items-start gap-2 rounded-md px-2 text-left transition-colors hover:bg-panel"
                  >
                    {/* 勾／空框是不靠顏色的第一個訊號 */}
                    <span
                      className={`mt-[5px] grid size-[20px] shrink-0 place-items-center rounded-[5px] border ${
                        on ? 'border-acid bg-acid' : 'border-line bg-panel'
                      }`}
                    >
                      {on && <CheckMark />}
                    </span>
                    {/* 刪除線是第二個訊號：沒勾＝這條沒寫進去 */}
                    <span
                      className={`font-mono text-[17px] leading-[1.7] ${
                        on
                          ? 'text-paper'
                          : 'text-faint line-through decoration-2'
                      }`}
                    >
                      {line.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 右：AI 的產出 ───────────────────────────── */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h4 className="text-[20px] text-paper">AI 的產出</h4>
            <span
              className={`rounded-full px-3.5 py-1 font-mono text-[16px] text-on-accent ${
                honest ? 'bg-ok' : 'bg-error'
              }`}
            >
              {honest ? '如實回報' : '造假的綠燈'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className={`rounded-xl border border-l-[6px] px-6 py-5 ${
                honest
                  ? 'border-ok/55 border-l-ok bg-ok/14'
                  : 'border-error/55 border-l-error bg-error/14'
              }`}
            >
              <p className="text-[24px] leading-[1.4] text-paper">
                {verdictTitle}
              </p>
              <div className="mt-2 flex flex-col">
                {verdictLines.map((line) => (
                  <span
                    key={line}
                    className="font-mono text-[19px] leading-[1.6] text-paper"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>

            {bounded ? (
              <div className="rounded-xl border border-line bg-ink-soft px-6 py-4">
                <p className="text-[21px] text-paper">
                  第 3 次仍未通過，已停止並交回人工確認
                </p>
                <p className="mt-1 text-[18px] text-muted">
                  有停止條件，token 與改動範圍都收得住
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-l-[6px] border-warn/55 border-l-warn bg-warn/14 px-6 py-4">
                <p className="text-[21px] text-paper">（第 7 次嘗試修正中…）</p>
                <p className="mt-1 text-[18px] text-paper">
                  沒有停止條件，改動範圍越跑越大，token 一直燒
                </p>
              </div>
            )}

            <div className="rounded-xl border border-line bg-ink-soft px-6 py-4">
              {logLines.map((line) => (
                <p
                  key={line}
                  className="font-mono text-[19px] leading-[1.6] text-muted"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 底部對照 ───────────────────────────────────── */}
      <div className="shrink-0 rounded-xl border border-line bg-ink-soft px-6 py-4">
        <p className="text-[24px] leading-[1.6] text-paper">
          ESLint 是機器讀的規則，擋的是寫出來的程式碼；AI Rules 是 AI
          讀的規則，擋的是它產出的方式。兩個相輔相成。
        </p>
        <p className="mt-2 text-[17px] text-muted">
          ESLint 不是唯一選擇，只是 JavaScript 生態裡最常見的那一個。
        </p>
      </div>
    </div>
  );
}
