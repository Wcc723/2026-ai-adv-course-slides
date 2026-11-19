import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 第 40 頁 · PromptGeneratorDemo — 提示詞產生器：開始用 Skill 之前
 *
 * 這一頁是**工具**，不是在展示提示詞長怎樣：
 *   左  問題表單，六題一次攤開。第一題打字（或點範例），其餘五題點選項，
 *       單選、再點一次取消。每題右側有一個小結果標籤（→ D1、→ R2…），
 *       選了之後才亮。
 *   右  產生的提示詞。跟著左邊即時改寫，任何時候按「複製提示詞」拿到的
 *       都是一份可以直接貼給 Codex 的完整文字 —— 沒有虛線佔位、沒有「請填入」。
 *
 * 提示詞的組法（`buildLines`）：
 *   - 回答了的題目進「目前的想法」清單；沒回答的不進清單，改列在
 *     「還沒決定：…。請先問我。」那一行（全部都答了，這一行就不出現）。
 *   - 第一題沒填，開頭改成「還沒想清楚要做什麼，請先幫我釐清」。
 *   - 選了要串接其他服務，那一句會帶上「金鑰我會自己設成 Secret，不會貼給你」。
 *   - 畫面上看到的字 ＝ 複製出去的字；唯一的差別是 Skill 名稱在畫面上用等寬字。
 * 最近一次改到的那一行會亮一下（6px acid 左粗條 ＋ 淡底，約 1 秒後淡出），
 * 用 CSS transition 做，亮起是瞬間、淡出 0.7 秒。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * - 題目與選項沿用舊版 FirstPromptDemo（demos-bonus.tsx），原本出自講者的
 *   「做網站之前，先回答 8 個問題」Artifact，挑出新手最需要先想的六題。
 *   「每個人的資料要分開嗎」這一題沒有加：放進來每題間距會壓到 15px 左右，
 *   而且它的答案其實就是第 5 題的登入（要分開就一定要登入）。
 * - 結尾三條要求合併了那份 Artifact 的提示詞 ①、④，措辭照講者給的格式。
 * - Skill：github.com/Wcc723/chatgpt-sites-d1-r2-skill。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（兩支強調色）
 * ──────────────────────────────────────────────────────────────
 *   acid  選中的選項（實色邊框）、「複製提示詞」實心 CTA、剛改到的那一行
 *   teal  已回答的題號（實心）、亮起來的結果標籤（實色邊框）、已複製
 * 淡底一律配實色邊框或 6px 左粗條，不單獨承擔語意；實心色塊上的字用 text-on-accent。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 根容器 h-[700px] max-w-[1740px]（同第 25、26、30 頁），左 880 ＋ 右其餘。
 *   左  標題列 60 ＋ 題目區 638：每題 104（上下 11 ＋ 題目列 32 ＋ 8 ＋ 選項 42），
 *       六題 ＋ 分隔線 629，剩 9px。再加一題就放不下，要先砍掉左欄標題列。
 *   右  標題列 60 ＋ 提示詞 562 ＋ 底列 76。提示詞 21px、行高 31.5；最長的情況
 *       （第一題填滿 24 字折成兩行、四題答一題沒答）約 12 行 ＋ 4 個段落間距 ≈ 500。
 *       第 3 條要求與「其他服務」那一句刻意寫短，21px 下剛好一行，不會掉一個字到下一行。
 * 第一題的輸入框限制 24 個字，避免開頭那一行把整段推出框外。
 *
 * 浮水印在對外版固定在右上角。右欄標題列的右端只放「已回答 N / 6」的
 * 文字與進度條，按鈕都不在那裡：「重設」在左欄標題列，「複製提示詞」在右欄底列。
 * ══════════════════════════════════════════════════════════════ */

/* ── 題目 ───────────────────────────────────────────────── */

type ChoiceQuestionId = 'who' | 'data' | 'files' | 'login' | 'service';

interface Choice {
  id: string;
  /** 選項 chip 上的字 */
  text: string;
  /** 寫進「目前的想法」的那一句 */
  line: string;
  /** 選了之後結果標籤的字 */
  tag: string;
  /** true：需要某個東西（標籤亮成 teal）；false：不需要（中性外框） */
  need: boolean;
}

interface ChoiceQuestion {
  id: ChoiceQuestionId;
  ask: string;
  /** 「目前的想法」清單裡這一條的開頭 */
  label: string;
  /** 沒回答時，列在「還沒決定」裡的名稱 */
  pending: string;
  /** 還沒選的時候，結果標籤的字 */
  tagIdle: string;
  choices: readonly Choice[];
}

const WHAT_EXAMPLES = ['全家一起記帳', '社團活動報名', '收集我的食譜照片'] as const;
const WHAT_MAX = 24;

const QUESTIONS: readonly ChoiceQuestion[] = [
  {
    id: 'who',
    ask: '誰會用這個網站？',
    label: '誰會用',
    pending: '誰會用',
    tagIdle: '→ 分享範圍',
    choices: [
      { id: 'me', text: '只有我自己', line: '只有我自己', tag: '只給自己', need: true },
      {
        id: 'invite',
        text: '我邀請的人（家人、朋友）',
        line: '我邀請的人（家人、朋友）',
        tag: '邀請制',
        need: true,
      },
      { id: 'public', text: '任何人（公開）', line: '任何人都能看（公開）', tag: '公開', need: true },
    ],
  },
  {
    id: 'data',
    ask: '關掉網頁再打開，資料還要在嗎？',
    label: '資料',
    pending: '資料要不要記住',
    tagIdle: '→ D1',
    choices: [
      {
        id: 'yes',
        text: '要，換手機也要看得到',
        line: '要記住，換手機也要看得到（需要資料庫 D1）',
        tag: '需要 D1',
        need: true,
      },
      {
        id: 'no',
        text: '不用，內容是固定的',
        line: '不用記住，內容是固定的',
        tag: '不用 D1',
        need: false,
      },
    ],
  },
  {
    id: 'files',
    ask: '需要上傳照片或檔案嗎？',
    label: '上傳',
    pending: '要不要上傳檔案',
    tagIdle: '→ R2',
    choices: [
      {
        id: 'yes',
        text: '要上傳照片或檔案',
        line: '要上傳照片或檔案（需要檔案儲存 R2）',
        tag: '需要 R2',
        need: true,
      },
      { id: 'no', text: '不用', line: '不用上傳', tag: '不用 R2', need: false },
    ],
  },
  {
    id: 'login',
    ask: '網站需要知道「誰在用」嗎？',
    label: '登入',
    pending: '登入方式',
    tagIdle: '→ 登入',
    choices: [
      {
        id: 'none',
        text: '不用，大家看到的都一樣',
        line: '不用登入，大家看到的都一樣',
        tag: '不用登入',
        need: false,
      },
      {
        id: 'chatgpt',
        text: '要，大家都有 ChatGPT',
        line: '用 Sign in with ChatGPT',
        tag: 'ChatGPT 登入',
        need: true,
      },
      {
        id: 'invite-code',
        text: '要，不是人人都有 ChatGPT',
        line: '用帳號密碼加上邀請碼（不是每個人都有 ChatGPT）',
        tag: '帳密＋邀請碼',
        need: true,
      },
    ],
  },
  {
    id: 'service',
    ask: '需要串接其他服務嗎？（寄信、AI、LINE…）',
    label: '其他服務',
    pending: '要不要串接其他服務',
    tagIdle: '→ Secret',
    choices: [
      { id: 'no', text: '不用', line: '不需要', tag: '不用 Secret', need: false },
      {
        id: 'yes',
        text: '要，金鑰我自己設定',
        line: '要串接，金鑰我會自己設成 Secret，不會貼給你',
        tag: '需要 Secret',
        need: true,
      },
    ],
  },
];

const TOTAL = QUESTIONS.length + 1;

/* ── 組提示詞 ───────────────────────────────────────────── */

const PROMPT_ASK = '請用 `chatgpt-sites-d1-r2` Skill 帶我做。開始寫程式之前：';

const PROMPT_RULES = [
  '還沒決定或不清楚的地方先問我，一次只問一題，每題給我 2～4 個選項',
  '我不確定時，建議最簡單、最安全、之後還能再加的做法，並說明理由',
  '整理成「需求摘要卡」給我確認，確認後才開始做；摘要卡沒寫的功能先不要加',
] as const;

type Picks = Partial<Record<ChoiceQuestionId, string>>;

type PromptLine =
  | { key: string; kind: 'gap' }
  | { key: string; kind: 'text'; text: string }
  | { key: string; kind: 'item'; label: string; text: string }
  | { key: string; kind: 'rule'; n: number; text: string };

function pickedChoice(question: ChoiceQuestion, picks: Picks): Choice | undefined {
  const id = picks[question.id];
  return id ? question.choices.find((choice) => choice.id === id) : undefined;
}

/** 使用者打的字結尾常帶標點，接「。」之前先拿掉 */
function cleanWhat(value: string): string {
  return value.trim().replace(/[。．.！!？?，,、；;：:\s]+$/u, '');
}

function buildLines(what: string, picks: Picks): PromptLine[] {
  const topic = cleanWhat(what);
  const lines: PromptLine[] = [
    {
      key: 'what',
      kind: 'text',
      text: topic
        ? `我想用 ChatGPT Sites 做一個網站：${topic}。`
        : '我想用 ChatGPT Sites 做一個網站，但還沒想清楚要做什麼，請先幫我釐清。',
    },
  ];

  const answered = QUESTIONS.flatMap((question) => {
    const choice = pickedChoice(question, picks);
    return choice ? [{ question, choice }] : [];
  });
  const pending = QUESTIONS.filter((question) => !pickedChoice(question, picks));

  if (answered.length > 0) {
    lines.push(
      { key: 'gap-ideas', kind: 'gap' },
      { key: 'ideas', kind: 'text', text: '目前的想法：' },
      ...answered.map(({ question, choice }) => ({
        key: question.id,
        kind: 'item' as const,
        label: question.label,
        text: choice.line,
      })),
    );
  }

  if (pending.length > 0) {
    lines.push(
      { key: 'gap-pending', kind: 'gap' },
      {
        key: 'pending',
        kind: 'text',
        text: `還沒決定：${pending.map((question) => question.pending).join('、')}。請先問我。`,
      },
    );
  }

  lines.push(
    { key: 'gap-ask', kind: 'gap' },
    { key: 'ask', kind: 'text', text: PROMPT_ASK },
    ...PROMPT_RULES.map((rule, index) => ({
      key: `rule-${index}`,
      kind: 'rule' as const,
      n: index + 1,
      text: rule,
    })),
  );

  return lines;
}

/** 複製出去的全文：跟畫面同一份資料，反引號拿掉 */
function toPlainText(lines: readonly PromptLine[]): string {
  return lines
    .map((line) => {
      switch (line.kind) {
        case 'gap':
          return '';
        case 'item':
          return `- ${line.label}：${line.text}`;
        case 'rule':
          return `${line.n}. ${line.text}`;
        default:
          return line.text;
      }
    })
    .join('\n')
    .replaceAll('`', '');
}

/* ── 複製（同第 33、35 頁的做法：clipboard 失敗就退回 execCommand）── */

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 往下走退路 */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '-9999px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function useCopy(): [CopyStatus, (text: string) => void] {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = (text: string) => {
    void copyText(text)
      .catch(() => false)
      .then((ok) => setStatus(ok ? 'copied' : 'failed'));
  };

  return [status, copy];
}

/* ── 小零件 ─────────────────────────────────────────────── */

/** 標籤裡有 Skill 名稱、Todo 之類的專有名詞，不轉大寫 */
const LABEL = 'font-display text-[17px] tracking-[0.12em] text-faint';

/** 反引號包起來的片段畫成等寬字；複製出去的字串另外拿掉反引號 */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded-md bg-panel px-1.5 font-mono text-[0.88em] text-paper"
          >
            {part}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function NumberBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[16px] transition-colors duration-200 ${
        done ? 'border-teal bg-teal text-on-accent' : 'border-line bg-panel text-faint'
      }`}
    >
      {String(n).padStart(2, '0')}
    </span>
  );
}

function ResultTag({ question, choice }: { question: ChoiceQuestion; choice?: Choice }) {
  const tone = !choice
    ? 'border-dashed border-line text-faint'
    : choice.need
      ? 'border-teal bg-teal/14 font-medium text-teal'
      : 'border-line bg-panel-lift text-muted';
  return (
    <span
      className={`ml-auto flex h-8 shrink-0 items-center rounded-full border-2 px-3.5 text-[16px] leading-none transition-colors duration-200 ${tone}`}
    >
      {choice ? choice.tag : question.tagIdle}
    </span>
  );
}

const CHIP =
  'flex h-[42px] shrink-0 items-center rounded-full border-2 px-4 text-[19px] transition-colors duration-150';
const CHIP_ON = 'border-acid bg-acid/14 font-medium text-paper';
const CHIP_OFF = 'border-line bg-panel text-paper hover:border-acid/55';

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

/* ── 右欄：一行提示詞 ───────────────────────────────────── */

function PromptLineView({ line, flash }: { line: PromptLine; flash: boolean }) {
  if (line.kind === 'gap') return <div className="h-[18px] shrink-0" aria-hidden="true" />;

  // 亮起是瞬間（duration-0），熄掉才慢慢淡出（duration-700）
  const frame = `flex border-l-[6px] pr-6 pl-[26px] transition-colors ${
    flash ? 'border-l-acid bg-acid/14 duration-0' : 'border-l-transparent duration-700'
  }`;

  if (line.kind === 'item') {
    return (
      <div className={frame}>
        <span className="w-[24px] shrink-0 font-mono text-faint">-</span>
        <span>
          <span className="text-muted">{`${line.label}：`}</span>
          {line.text}
        </span>
      </div>
    );
  }

  if (line.kind === 'rule') {
    return (
      <div className={frame}>
        <span className="w-[28px] shrink-0 font-mono text-faint">{`${line.n}.`}</span>
        <span>{line.text}</span>
      </div>
    );
  }

  return (
    <div className={frame}>
      <span className={line.key === 'what' ? 'font-medium' : undefined}>
        <InlineCode text={line.text} />
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */

export function PromptGeneratorDemo() {
  const [what, setWhat] = useState('');
  const [picks, setPicks] = useState<Picks>({});
  const [flash, setFlash] = useState<{ key: string; n: number } | null>(null);
  const [status, copy] = useCopy();

  // 同一行連續改動也要重新計時，所以依 n（每次加一）觸發
  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 1000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const lines = buildLines(what, picks);
  const doneCount =
    (cleanWhat(what) ? 1 : 0) + QUESTIONS.filter((question) => pickedChoice(question, picks)).length;

  const flashLine = (key: string) => setFlash((prev) => ({ key, n: (prev?.n ?? 0) + 1 }));

  const changeWhat = (value: string) => {
    setWhat(value.slice(0, WHAT_MAX));
    flashLine('what');
  };

  const pick = (question: ChoiceQuestion, choice: Choice) => {
    const off = picks[question.id] === choice.id;
    setPicks((prev) => ({ ...prev, [question.id]: off ? undefined : choice.id }));
    flashLine(off ? 'pending' : question.id);
  };

  const reset = () => {
    setWhat('');
    setPicks({});
    setFlash(null);
  };

  return (
    <div className="grid h-[700px] w-full max-w-[1740px] grid-cols-[880px_minmax(0,1fr)] gap-6">
      {/* ── 左：問題表單 ─────────────────────────────────── */}
      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-panel-lift px-7">
          <div className="flex items-baseline gap-4">
            <span className={LABEL}>回答這六題</span>
            <span className="text-[18px] text-muted">不確定就跳過，提示詞會請 AI 先問你</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="h-10 shrink-0 rounded-lg border border-line bg-panel px-4 text-[18px] text-paper transition-colors duration-200 hover:border-acid"
          >
            重設
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center divide-y divide-line-soft px-7">
          {/* 第 1 題：打字 ＋ 範例 */}
          <div className="flex flex-col gap-2 py-[11px]">
            <div className="flex h-8 items-center gap-3.5">
              <NumberBadge n={1} done={cleanWhat(what) !== ''} />
              <p className="text-[22px] leading-tight font-medium text-paper">網站是做什麼的？</p>
              <span className="text-[18px] text-muted">用一句話說說看</span>
            </div>
            <div className="flex items-center gap-2 pl-[46px]">
              <input
                type="text"
                value={what}
                maxLength={WHAT_MAX}
                onChange={(event) => changeWhat(event.target.value)}
                placeholder="例如：全家一起記帳"
                aria-label="網站是做什麼的"
                className="h-[42px] min-w-0 flex-1 rounded-xl border-2 border-line bg-panel px-4 text-[21px] text-paper transition-colors placeholder:text-muted focus:border-acid focus:outline-none"
              />
              {WHAT_EXAMPLES.map((example) => {
                const on = what === example;
                return (
                  <button
                    key={example}
                    type="button"
                    aria-pressed={on}
                    onClick={() => changeWhat(on ? '' : example)}
                    className={`${CHIP} px-3.5 text-[17px] ${on ? CHIP_ON : CHIP_OFF}`}
                  >
                    {example}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 第 2～6 題：單選，再點一次取消 */}
          {QUESTIONS.map((question, index) => {
            const choice = pickedChoice(question, picks);
            return (
              <div key={question.id} className="flex flex-col gap-2 py-[11px]">
                <div className="flex h-8 items-center gap-3.5">
                  <NumberBadge n={index + 2} done={Boolean(choice)} />
                  <p className="text-[22px] leading-tight font-medium text-paper">{question.ask}</p>
                  <ResultTag question={question} choice={choice} />
                </div>
                <div className="flex gap-2 pl-[46px]">
                  {question.choices.map((item) => {
                    const on = choice?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => pick(question, item)}
                        className={`${CHIP} ${on ? CHIP_ON : CHIP_OFF}`}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 右：產生的提示詞 ─────────────────────────────── */}
      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line">
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-panel-lift px-7">
          <span className={LABEL}>產生的提示詞</span>
          <div className="flex items-center gap-3">
            <span className="text-[18px] text-muted">{`已回答 ${doneCount} / ${TOTAL}`}</span>
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: TOTAL }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-5 rounded-full transition-colors duration-200 ${
                    index < doneCount ? 'bg-teal' : 'bg-line'
                  }`}
                />
              ))}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-ink-soft py-6 text-[21px] leading-[1.5] text-paper">
          {lines.map((line) => (
            <PromptLineView key={line.key} line={line} flash={flash?.key === line.key} />
          ))}
        </div>

        <div className="flex h-[76px] shrink-0 items-center justify-between gap-5 border-t border-line bg-panel-lift pr-4 pl-7">
          {status === 'failed' ? (
            <p className="text-[19px] text-paper">瀏覽器擋下了複製，請手動選取上面的文字</p>
          ) : (
            <p className="text-[19px] leading-snug text-muted">
              貼到 ChatGPT 桌面版的 Codex
              <br />
              <InlineCode text="先裝好 `chatgpt-sites-d1-r2` Skill" />
            </p>
          )}
          <button
            type="button"
            onClick={() => copy(toPlainText(lines))}
            className={`flex h-[52px] min-w-[200px] shrink-0 items-center justify-center gap-2.5 rounded-xl border-2 px-6 text-[21px] font-medium text-on-accent transition-colors duration-200 ${
              status === 'copied' ? 'border-teal bg-teal' : 'border-acid bg-acid hover:bg-acid/90'
            }`}
          >
            {status === 'copied' ? <CheckGlyph /> : <CopyGlyph />}
            {status === 'copied' ? '已複製' : '複製提示詞'}
          </button>
        </div>
      </section>
    </div>
  );
}
