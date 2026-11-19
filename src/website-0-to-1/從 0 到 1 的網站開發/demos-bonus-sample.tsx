import { useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 第 39 頁 — SampleDemo  部署範例：Todo 手帳
 *
 * 講者指定「參考『開通 Google 服務』這頁的排版」，所以版面、尺寸、層級
 * 照抄第 30 頁的 GoogleServiceDemo（demos-sheet.tsx）：
 *   左邊一張大的連結卡（整張是 <a target="_blank">），主角是範例 repo；
 *   右邊一欄「範例裡有什麼」，點一下標出正在講的那一項。
 * 每一項只寫一句話，細節留在 repo 的 README；D1 與 R2 在第 37 頁講過，
 * 那兩項掛一個「第 37 頁」的小標籤。
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源
 * ──────────────────────────────────────────────────────────────
 * - github.com/Wcc723/2026-ai-adv-course-gpt-site-sample 的 repo 說明
 *   「ChatGPT Sites 範例：帳號密碼登入的 Todo 手帳（D1 + Drizzle + R2 圖片上傳）」
 *   與 README；搭配第 38 頁的 Skill chatgpt-sites-d1-r2 使用。
 * - 右欄五項的事實（鎖定次數、5 MB、SIGNUP_INVITE_CODE、沒有 project_id）
 *   全部出自講者提供的整理，沒有另外補。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色（兩支）
 * ──────────────────────────────────────────────────────────────
 *   blue  ＝ 連結（info），同第 30 頁
 *   teal  ＝ 列表的選中色，這一段加碼的「資料」主色，跟第 37 頁一致
 * 選中一律是淡底 ＋ 6px 不透明左粗條 ＋ 實心序號方塊，淡底不單獨承擔語意。
 * off 狀態也留著 6px 左框（line 色），切換時內容才不會左右位移。
 * 技術小標籤與「第 37 頁」都是中性色，不另外開色。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算（根 700，同第 25、26、30 頁）
 * ──────────────────────────────────────────────────────────────
 *   連結卡 860 ／ gap 32 ／ 列表欄 ≈ 848
 *   連結卡：p-10 上下 80 ＋ 頂列 36 ＋ 主區 ≈ 430 ＋ 底部說明 66，
 *           其餘交給 justify-between
 *   列表欄：小標 36 ＋ gap 16 ＋ 三列單行（各 104）＋ 兩列雙行（各 136）
 *           ＋ gap 12 × 4 ＝ 632（實測），留約 16 的餘裕
 *   雙行的兩列是刻意拆成兩句各一行，斷行才不會落在詞中間；
 *   再多一行就會超出，改文案時要重新量。
 * 沒有任何容器可以捲動。對外版的浮水印在右上角：列表欄的小標列
 * 右半邊刻意留白，不放按鈕。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件（照第 30 頁；Tailwind 只掃得到完整字串，所以存整串） ── */

/** 面板小標籤。只放中文，才能用 uppercase 的字距 */
const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';

/** 可點選的列：基底 ＋ on ／ off。on 是淡底配 6px 不透明左粗條 */
const PICK_BASE =
  'rounded-2xl border border-l-[6px] text-left transition-colors duration-200';
const PICK_ON = 'border-teal/70 border-l-teal bg-teal/14';
const PICK_OFF = 'border-line-soft border-l-line bg-panel-lift hover:border-line';

/** 選中列的實心序號方塊 */
const PILL_DATA = 'border-teal bg-teal text-on-accent';

/** 反引號包起來的片段畫成等寬字（環境變數、指令、欄位名稱） */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded-md border border-line-soft bg-panel px-1.5 font-mono text-[0.9em] text-paper"
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

/* ── 內容 ───────────────────────────────────────────────── */

const REPO_HOST = 'https://github.com/';
const REPO_PATH = 'Wcc723/2026-ai-adv-course-gpt-site-sample';
const REPO_URL = `${REPO_HOST}${REPO_PATH}`;

const STACK: readonly string[] = ['vinext（React）', 'Tailwind', 'D1 ＋ Drizzle', 'R2'];

interface SampleItem {
  mark: string;
  title: string;
  /** 一個字串一行（兩句話就拆兩行，斷行才不會落在詞中間）。反引號包起來的片段會畫成等寬字 */
  body: readonly string[];
  /** 本簡報哪一頁講過 */
  seen?: string;
}

const SAMPLE_ITEMS: readonly SampleItem[] = [
  {
    mark: '1',
    title: '帳號密碼登入',
    body: ['註冊、登入、登出；密碼錯 5 次鎖 15 分鐘。'],
  },
  {
    mark: '2',
    title: '待辦存在 D1',
    body: ['新增、編輯、完成、刪除；每個帳號只看得到自己的。'],
    seen: '第 37 頁',
  },
  {
    mark: '3',
    title: '圖片存在 R2',
    body: ['每件待辦可以附一張圖片，5 MB 以內，只有本人看得到。'],
    seen: '第 37 頁',
  },
  {
    mark: '4',
    title: '邀請碼',
    body: [
      '環境變數 `SIGNUP_INVITE_CODE`。',
      '留空代表打得開網站的人都能註冊，分享或公開前一定要設。',
    ],
  },
  {
    mark: '最後',
    title: '部署',
    body: [
      '用 ChatGPT 桌面版的 Codex 打開資料夾，請 `@Sites` 先私人發布。',
      'repo 刻意沒有 `project_id`，第一次部署會建立你自己的網站。',
    ],
  },
];

export function SampleDemo() {
  const [pick, setPick] = useState(0);

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] gap-8">
      {/* 左：範例 repo —— 這一頁的主角 */}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="group flex w-[860px] shrink-0 flex-col justify-between rounded-3xl border-2 border-blue/70 bg-panel p-10 transition-colors duration-200 hover:border-blue hover:bg-panel-lift"
      >
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-blue" />
          <span className={`${LABEL_TYPE} text-blue`}>範例原始碼</span>
          <span className="ml-auto rounded-full border border-blue/55 px-3.5 py-1 text-[17px] text-blue">
            GitHub 公開 repo
          </span>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h3 className="text-[42px] leading-[1.35] font-semibold text-paper">
              Todo 手帳：ChatGPT Sites ＋ D1 ＋ R2 的完整範例
            </h3>
            <p className="flex flex-col text-[21px] leading-[1.55] text-muted">
              <span>帳號密碼登入、待辦存資料庫、圖片存檔案空間。</span>
              <span>
                搭配第 38 頁的 Skill
                <span className="mx-1.5 font-mono text-[19px] text-paper">
                  chatgpt-sites-d1-r2
                </span>
                使用。
              </span>
            </p>
          </div>

          <ul className="flex flex-wrap gap-2.5" aria-label="用到的技術">
            {STACK.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-line bg-ink-soft px-3.5 py-1.5 text-[18px] text-paper"
              >
                {name}
              </li>
            ))}
          </ul>

          <p className="rounded-2xl border border-line-soft bg-ink-soft px-6 py-4 font-mono text-[19px] leading-[1.55] break-all">
            <span className="text-muted">{REPO_HOST}</span>
            <span className="font-semibold text-blue">{REPO_PATH}</span>
          </p>

          <span className="inline-flex w-fit items-center gap-3 rounded-xl bg-blue px-6 py-3.5 text-[22px] font-medium text-on-accent">
            在新分頁打開 GitHub
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </span>
        </div>

        <p className="border-t border-line-soft pt-6 text-[21px] leading-[1.55] text-muted">
          clone 下來，請 Codex 照 README 在自己電腦上跑起來，再部署成你自己的網站。
        </p>
      </a>

      {/* 右：範例裡有什麼 */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex h-9 shrink-0 items-center gap-3">
          <span className="size-2.5 rounded-full bg-teal" />
          <span className={`${LABEL_TYPE} text-teal`}>範例裡有什麼</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          {SAMPLE_ITEMS.map((item, index) => {
            const on = index === pick;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setPick(index)}
                aria-pressed={on}
                className={`flex shrink-0 items-center gap-5 px-6 py-3.5 ${PICK_BASE} ${
                  on ? PICK_ON : PICK_OFF
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl border font-display ${
                    item.mark.length > 1 ? 'text-[16px]' : 'text-[22px]'
                  } ${on ? PILL_DATA : 'border-line text-muted'}`}
                >
                  {item.mark}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="mb-1 flex items-center gap-3">
                    <span
                      className={`text-[26px] font-semibold ${
                        on ? 'text-teal' : 'text-paper'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.seen && (
                      <span className="ml-auto shrink-0 rounded-full border border-line px-3 py-0.5 text-[16px] text-muted">
                        {item.seen}
                      </span>
                    )}
                  </span>
                  {item.body.map((line) => (
                    <span
                      key={line}
                      className={`text-[21px] leading-[1.5] ${
                        on ? 'text-paper' : 'text-muted'
                      }`}
                    >
                      <InlineCode text={line} />
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
