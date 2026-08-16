import type { ReactElement } from 'react';

/**
 * 第三堂課 · 課程範例的統一版型
 *
 * 08 `openapi-example`      → OpenApiExampleDemo     OpenAPI 文件與跨專案交換
 * 12 `static-check-example` → StaticCheckExampleDemo 靜態檢查的三道關卡
 * 19 `test-branch-example`  → TestBranchExampleDemo  四種測試的範例分支
 * 37 `ci-example`           → CiExampleDemo          把測試搬上 GitHub Actions
 *
 * 這四頁原本長成四種樣子（兩張表格、兩個 split ＋ 假的 TypeScript 程式碼區塊）。
 * 現在收斂成同一個 CourseExampleView：同一列標頭、同一個 Claude Code 介面、
 * 同一組「會做到什麼 / 對照分支」。學員在第 08 頁學會怎麼讀這個畫面，
 * 之後三頁就不必重新理解版面。
 *
 * ⚠ 提示詞是「純文字」不是程式碼。以前包成 const prompt = `…` 的 TypeScript 區塊，
 *   看起來像要貼進專案裡執行；實際上那是要貼進 Claude Code 輸入框的一段話。
 *   所以這裡刻意畫成終端機輸入區（行首一個 >），沒有語法高亮、沒有變數宣告。
 *
 * 用色分工（一頁最多兩支主強調色，其餘一律語意 token）：
 * - acid：課程範例標籤 ＋「這個範例會做到」——把兩者綁成同一個識別
 * - ok / error / 中性 line：對照分支的狀態，語意本來就有專用 token
 *
 * ⚠ 左欄是全檔的深色底板（bg-paper）。深底上的文字一律 text-ink / text-ink-soft，
 *   沿用 text-paper 會變成黑底黑字。
 *
 * ⚠ 高度預算（上限 640）——以最擠的第 19 頁（3 條重點 ＋ 5 條分支）為基準：
 *     標頭列 32 ＋ gap 12
 *     右欄 = 重點區 (25 + 61×3 + 6×2 = 220)
 *          + gap 12
 *          + 分支區 (25 + 59×5 + 6×4 = 344)
 *          = 576
 *     合計 620，留 20px 餘裕。
 *   加大字級或行高之前先把這段算式重算一次；左欄會跟著右欄拉高，
 *   提示詞最多 6 行（180px）遠低於左欄可用高度，不是瓶頸。
 */

/* ════════════════════════════════════════════════════════════
 * 型別與共用零件
 * ════════════════════════════════════════════════════════════ */

export interface ExampleBranch {
  name: string;
  note: string;
  tone?: 'ok' | 'error' | 'neutral';
}

export interface ExampleHighlight {
  text: string;
  note?: string;
}

export interface CourseExampleSpec {
  /** 這個範例在做什麼，例：OpenAPI 文件 */
  label: string;
  /** 貼進 Claude Code 的提示詞（純文字、含換行，不是程式碼） */
  prompt: string;
  /** 最多 3 條 */
  highlights: readonly ExampleHighlight[];
  /** 最多 5 條 */
  branches: readonly ExampleBranch[];
}

/** 四頁共用同一個示範專案，路徑固定不進 spec —— 它屬於「介面」不屬於「內容」 */
const PROJECT_PATH = '~/hexschool/ai-testing-demo';

/**
 * 分支狀態的外觀。
 * 淡填色不得單獨承擔語意，所以每一種都配一條不透明的 6px 左粗條；
 * 中性那一支不上色，改用 panel-lift 的「浮起」表面。
 */
const BRANCH_FACE: Record<'ok' | 'error' | 'neutral', string> = {
  ok: 'border-ok/55 border-l-ok bg-ok/14',
  error: 'border-error/55 border-l-error bg-error/14',
  neutral: 'border-line-soft border-l-line bg-panel-lift',
};

/* ════════════════════════════════════════════════════════════
 * CourseExampleView — 四頁共用的情境畫面
 * ════════════════════════════════════════════════════════════ */

export function CourseExampleView({
  spec,
}: {
  spec: CourseExampleSpec;
}): ReactElement {
  const promptLines = spec.prompt.split('\n');
  const lastLine = promptLines.length - 1;

  return (
    <div className="flex w-full max-w-[1680px] flex-col gap-3">
      {/* ── 統一標頭：四頁一模一樣的這一列 ───────────────── */}
      <div className="flex shrink-0 items-center gap-4">
        <span className="rounded-md bg-acid px-3 py-1 text-[16px] font-semibold tracking-[0.14em] text-on-accent">
          課程範例
        </span>
        <h3 className="text-[22px] font-semibold leading-[30px] text-paper">
          {spec.label}
        </h3>
        <span className="ml-auto text-[17px] text-faint">
          課後把分支切過去，就能自己跑一次
        </span>
      </div>

      {/* ── 左：Claude Code 介面 · 右：會做到什麼 ＋ 對照分支 ── */}
      <div className="flex min-h-0 items-stretch gap-6">
        {/* 左欄（約 3/5）：深色底板，文字一律 ink 系 */}
        <div className="flex min-w-0 flex-[3] flex-col overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="flex shrink-0 items-center gap-3 border-b border-ink/20 px-6 py-2.5">
            <span className="size-[18px] shrink-0 rounded-[5px] bg-ink" />
            <span className="font-mono text-[18px] font-semibold text-ink">
              claude
            </span>
            <span className="truncate font-mono text-[17px] text-ink-soft">
              {PROJECT_PATH}
            </span>
          </div>

          {/* 輸入區：純文字提示詞，沒有語法高亮也沒有變數宣告 */}
          <div className="flex-1 px-6 py-4 font-mono text-[19px] leading-[30px]">
            {promptLines.map((line, index) => (
              <div key={index} className="flex gap-2">
                <span className="w-[14px] shrink-0 text-ink-soft">
                  {index === 0 ? '>' : ''}
                </span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap text-ink">
                  {line}
                  {index === lastLine && (
                    <span className="ml-1.5 inline-block h-[17px] w-[9px] translate-y-[2px] animate-pulse bg-ink" />
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="shrink-0 border-t border-ink/20 px-6 py-2.5 text-[17px] text-ink-soft">
            貼進 Claude Code 之後，先讓它說明計畫，確認方向再讓它動手改檔案。
          </p>
        </div>

        {/* 右欄（約 2/5） */}
        <div className="flex min-w-0 flex-[2] flex-col gap-3">
          {/* 上半：這個範例會做到 */}
          <section className="shrink-0">
            <p className="mb-1 text-[17px] leading-[21px] text-faint">
              這個範例會做到
            </p>
            <div className="flex flex-col gap-1.5">
              {spec.highlights.map((item) => (
                <div
                  key={item.text}
                  className="rounded-lg border border-l-[6px] border-acid/55 border-l-acid bg-acid/14 px-4 py-1.5"
                >
                  <p className="text-[21px] font-medium leading-[26px] text-paper">
                    {item.text}
                  </p>
                  {item.note && (
                    <p className="text-[17px] leading-[21px] text-paper">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 下半：對照分支 */}
          <section className="shrink-0">
            <p className="mb-1 text-[17px] leading-[21px] text-faint">
              對照分支 · git checkout 後就能執行
            </p>
            <div className="flex flex-col gap-1.5">
              {spec.branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`rounded-lg border border-l-[6px] px-4 py-1.5 ${
                    BRANCH_FACE[branch.tone ?? 'neutral']
                  }`}
                >
                  <p className="truncate font-mono text-[19px] font-medium leading-[24px] text-paper">
                    {branch.name}
                  </p>
                  <p className="text-[17px] leading-[21px] text-paper">
                    {branch.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 08 · OpenApiExampleDemo — OpenAPI 文件與跨專案交換
 * ════════════════════════════════════════════════════════════ */

const openApiSpec: CourseExampleSpec = {
  label: 'OpenAPI 文件與跨專案交換',
  prompt: [
    '我要為這個後端專案加入 OpenAPI 文件，請先說明流程再動手。',
    '以 zod 定義 schema，用 @asteasolutions/zod-to-openapi 產生 openapi.json，',
    '再用 swagger-parser 驗證格式，並以 swagger-ui-express 掛一個文件頁。',
    '完成後把 openapi.json 用 openapi-to-postmanv2 轉成 Postman Collection。',
  ].join('\n'),
  highlights: [
    { text: '以 zod 當單一來源', note: '同一份 schema 同時負責執行時驗證與文件產出' },
    { text: '產出 openapi.json 給 AI 讀', note: '另一個專案不必翻後端程式碼也知道有哪些 API' },
    { text: '轉成 Postman Collection', note: '開發者拿到可以直接點來測的請求集合' },
  ],
  branches: [
    {
      name: 'feature/openapi',
      note: '文件、Swagger UI 與 Postman 轉換都在這支',
      tone: 'neutral',
    },
    {
      name: 'codex/admin-dashboard',
      note: '完全不看後端程式碼，只靠 openapi.json 產出的管理後台',
      tone: 'ok',
    },
  ],
};

export function OpenApiExampleDemo(): ReactElement {
  return <CourseExampleView spec={openApiSpec} />;
}

/* ════════════════════════════════════════════════════════════
 * 12 · StaticCheckExampleDemo — 靜態檢查（測試之前的三道關卡）
 * ════════════════════════════════════════════════════════════ */

const staticCheckSpec: CourseExampleSpec = {
  label: '靜態檢查（測試之前的三道關卡）',
  prompt: [
    '請為這個 TypeScript 專案建立 eslint.config.js（Flat Config）：',
    '以 typescript-eslint recommended 為基礎，補上 semi、prefer-const、camelcase，',
    '格式交給 Prettier 避免規則打架，package.json 補上 lint 與 lint:fix。',
    '先說明每條規則擋掉什麼，再動手改檔案。',
  ].join('\n'),
  highlights: [
    {
      text: 'TypeScript 在程式執行前先找出型別問題',
      note: '欄位打錯、少傳參數、型別對不上，在編輯器就會亮紅線',
    },
    {
      text: 'npm run build、npm start 本身就是一道檢查',
      note: '跑不起來就是還沒過',
    },
    {
      text: 'ESLint 與 Prettier 統一風格',
      note: '規則寫在設定檔裡，人與 AI 產出的標準一致',
    },
  ],
  branches: [
    {
      name: 'codex/eslint-errors-demo',
      note: '品質不如預期時 ESLint 會抓到什麼',
      tone: 'error',
    },
    {
      name: 'codex/eslint-clean',
      note: '正確修正後的成果',
      tone: 'ok',
    },
  ],
};

export function StaticCheckExampleDemo(): ReactElement {
  return <CourseExampleView spec={staticCheckSpec} />;
}

/* ════════════════════════════════════════════════════════════
 * 19 · TestBranchExampleDemo — 四種測試的範例分支
 *
 * 五條分支，是四頁裡最擠的一頁；高度預算就是照這一頁抓的。
 * ════════════════════════════════════════════════════════════ */

const testBranchSpec: CourseExampleSpec = {
  label: '四種測試的範例分支',
  prompt: [
    '先跑 npm run test:integration，只把失敗的那一支整理給我，',
    '說明是權限檢查漏了什麼，不要一次貼整份 log。',
  ].join('\n'),
  highlights: [
    { text: 'npm test 跑全部測試', note: '單元、整合、端對端一次跑完' },
    { text: 'npm run test:integration 只跑整合', note: '確認 API 與資料庫之間的串接' },
    {
      text: 'npm run test:module -- coupon 只跑單一模組',
      note: '只跑檔名含 coupon 的測試，回饋最快',
    },
  ],
  branches: [
    {
      name: 'codex/tests-unit-integration',
      note: '初始加入測試的狀態',
      tone: 'neutral',
    },
    {
      name: 'codex/admin-orders-auth-bug',
      note: 'API 只檢查登入、漏掉管理員權限，一般會員也拿得到所有訂單',
      tone: 'error',
    },
    {
      name: 'codex/admin-orders-auth-fixed',
      note: '修正後的版本',
      tone: 'ok',
    },
    {
      name: 'codex/e2e-checkout',
      note: '完整購物流程通過：加入購物車→結帳→登入→建立訂單→付款',
      tone: 'ok',
    },
    {
      name: 'codex/e2e-required-address-bug',
      note: '後端要必填 shippingAddress、前端沒送，卡在建立訂單',
      tone: 'error',
    },
  ],
};

export function TestBranchExampleDemo(): ReactElement {
  return <CourseExampleView spec={testBranchSpec} />;
}

/* ════════════════════════════════════════════════════════════
 * 37 · CiExampleDemo — 把測試搬上 GitHub Actions
 * ════════════════════════════════════════════════════════════ */

const ciSpec: CourseExampleSpec = {
  label: '把測試搬上 GitHub Actions',
  prompt: [
    '在 .github/workflows/ 建立 ci.yml：push 到 develop 與 PR 時觸發。',
    '用 ubuntu-latest + Node.js 20 並開啟 npm cache，',
    '依序跑 lint → build → 單元與整合測試 → E2E，',
    '失敗時也要用 upload-artifact 保存報告與截圖，',
    '最後把 lint 與 test 設為 PR 的必要檢查。',
    '修改前先檢查專案結構並提出計畫，等我確認再開始。',
  ].join('\n'),
  highlights: [
    {
      text: '建立 GitHub Actions 設定檔',
      note: 'push 與 PR 時自動觸發，不必記得手動跑',
    },
    {
      text: '保存測試過程產生的 Artifact',
      note: '報告與截圖留在 CI 上，失敗時直接下載來看',
    },
    {
      text: '將必要的測試結果設為合併條件',
      note: 'lint 與 test 沒過就不能併進 develop',
    },
  ],
  branches: [
    {
      name: 'codex/ci-error-demo',
      note: 'CI 失敗時 Artifact 裡留下什麼',
      tone: 'error',
    },
    {
      name: 'develop',
      note: '全部通過後才併進來的結果',
      tone: 'ok',
    },
  ],
};

export function CiExampleDemo(): ReactElement {
  return <CourseExampleView spec={ciSpec} />;
}
