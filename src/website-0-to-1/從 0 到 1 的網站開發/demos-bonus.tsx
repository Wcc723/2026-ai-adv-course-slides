import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 加碼內容 · 第 38 頁 SkillDemo — 新手向 Skill
 *
 * 加碼的其他頁各自一個檔案：
 *   第 37 頁  demos-bonus-storage.tsx  D1 與 R2（＋ diagrams-bonus.tsx 的架構圖）
 *   第 39 頁  demos-bonus-sample.tsx   部署範例：Todo 手帳
 *   第 40 頁  demos-bonus-prompt.tsx   提示詞產生器
 *   （第 36 頁是章節封面，在 slides.ts 裡）
 *
 * 內容來源：github.com/Wcc723/chatgpt-sites-d1-r2-skill 的 SKILL.md 與 README。
 * 用色：acid（目前選的功能）＋ teal（檢查通過、已複製）。
 * 淡底一律配 6px 不透明左粗條或實色邊框，不單獨承擔語意。
 * 高度預算：根容器 h-[720px]、max-w-[1740px]，沒有任何容器會捲動。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL_TYPE = 'font-display text-[17px] tracking-[0.16em] uppercase';
const LABEL_FAINT = `${LABEL_TYPE} text-faint`;

const BTN_ROW =
  'h-11 rounded-xl border px-5 text-[19px] transition-colors duration-200';

const STEP_BADGE =
  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-[18px]';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 反引號包起來的片段畫成等寬字；複製出去的原字串不受影響 */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded-md bg-panel px-1.5 font-mono text-[0.9em] text-paper"
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
    void copyText(text).then((ok) => setStatus(ok ? 'copied' : 'failed'));
  };

  return [status, copy];
}

function CopyButton({
  status,
  label,
  onClick,
}: {
  status: CopyStatus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BTN_ROW} min-w-[132px] shrink-0 ${
        status === 'copied'
          ? 'border-teal bg-teal font-medium text-on-accent'
          : 'border-line bg-panel text-paper hover:border-acid'
      }`}
    >
      {status === 'copied' ? '已複製' : label}
    </button>
  );
}

function CopyFailed() {
  return (
    <span className="text-[18px] text-paper">
      {'瀏覽器擋下了複製，請手動選取文字'}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 38 頁 · SkillDemo — 新手向 Skill
 *
 * 左邊四件事（環境檢查、開發引導、新手向說明、安全性檢查），點一件，右邊
 * 換成那一件的細節；右下是安裝，三種方式各一顆複製鍵。
 * 「請 Codex 幫你裝」排第一：這堂課的學員不一定會開終端機。
 * ══════════════════════════════════════════════════════════════ */

const SKILL_REPO = 'https://github.com/Wcc723/chatgpt-sites-d1-r2-skill';

type FeatureId = 'env' | 'guide' | 'beginner' | 'security';

const FEATURES: readonly { id: FeatureId; name: string; sub: string }[] = [
  { id: 'env', name: '環境檢查', sub: 'Node.js、git、ChatGPT 方案' },
  { id: 'guide', name: '開發引導', sub: '8 個步驟，一次只做一步' },
  { id: 'beginner', name: '新手向說明', sub: '說白話、固定的 emoji' },
  { id: 'security', name: '安全性檢查', sub: '部署前的格式檢查與金鑰掃描' },
];

const ENV_CHECKS: readonly { name: string; text: string }[] = [
  { name: 'Node.js', text: '24 LTS（最低 22.13）；沒有或太舊就帶你安裝' },
  { name: 'npm', text: '跟著 Node.js 一起裝好' },
  { name: 'git', text: '沒有就帶你安裝，並設定好 git 身分' },
  { name: 'ChatGPT', text: 'Plus、Pro、Business、Enterprise、Edu 才能部署' },
];

const GUIDE_STEPS: readonly string[] = [
  '檢查開發環境',
  '建立專案並開始用 git',
  '宣告 D1／R2（hosting.json）',
  '設計資料表',
  '寫功能：資料、上傳、登入',
  '環境變數',
  '安全檢查＋提交',
  '用 ChatGPT Sites 部署',
];

const EMOJI_LEGEND: readonly { mark: string; text: string }[] = [
  { mark: '🧭', text: '目前進度' },
  { mark: '✅', text: '檢查通過' },
  { mark: '❌', text: '沒通過，先修好' },
  { mark: '⚠️', text: '注意' },
  { mark: '🔐', text: '資安' },
  { mark: '🚫', text: '絕對不要' },
  { mark: '💡', text: '小技巧' },
  { mark: '🤖', text: '可以複製給 AI' },
];

const SECURITY_COMMANDS: readonly { cmd: string; note: string }[] = [
  { cmd: 'npx tsc --noEmit', note: '型別檢查' },
  { cmd: 'npm run build', note: '建置' },
  { cmd: 'preflight.mjs . --after-build', note: '符合 ChatGPT Sites 格式' },
  { cmd: 'scan-secrets.mjs . --history', note: '金鑰有沒有外洩（含 git 歷史）' },
];

const SCAN_TIMES = ['每次部署前', '新增或更換機密之後', '每個月一次', '改成公開前'] as const;

function FeatureDetail({ id }: { id: FeatureId }) {
  if (id === 'env') {
    return (
      <>
        <p className="text-[22px] leading-normal text-paper">
          {'D1、R2 的網站要在自己的電腦上跑伺服器程式，所以會用到 Node.js 與 git —— 這跟前面不用 Node.js 的靜態網站不一樣。'}
        </p>
        <div className="flex flex-col gap-2.5">
          {ENV_CHECKS.map((check) => (
            <div
              key={check.name}
              className="flex h-[54px] items-center gap-4 rounded-xl border border-l-[6px] border-line border-l-teal bg-panel px-5"
            >
              <span className="text-[20px]">✅</span>
              <span className="w-[110px] shrink-0 font-mono text-[20px] text-paper">
                {check.name}
              </span>
              <span className="text-[20px] text-paper">{check.text}</span>
            </div>
          ))}
        </div>
        <p className="text-[19px] leading-snug text-muted">
          <InlineCode text="AI 能執行指令時會自己跑 `doctor.mjs` 檢查，你只要在跳出權限視窗時按「允許」。" />
        </p>
      </>
    );
  }

  if (id === 'guide') {
    return (
      <>
        <p className="text-[22px] leading-normal text-paper">
          {'從空資料夾到拿到網址，拆成 8 步。每一步開頭告訴你進度，做完先確認 ✅ 才往下。'}
        </p>
        <div className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-2.5">
          {GUIDE_STEPS.map((step, index) => (
            <div
              key={step}
              className="flex h-[54px] items-center gap-3 rounded-xl border border-line bg-panel px-4"
            >
              <span className="shrink-0 font-mono text-[18px] text-muted">
                {`🧭 ${index + 1}／8`}
              </span>
              <span className="truncate text-[20px] text-paper">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-[19px] leading-snug text-muted">
          {'會刪除或覆蓋東西的操作（刪資料夾、改成公開），會先說明後果、等你同意。'}
        </p>
      </>
    );
  }

  if (id === 'beginner') {
    return (
      <>
        <div className="flex flex-col gap-2.5">
          {[
            '說白話：專有名詞第一次出現，先用一句話解釋',
            '一次只做一步，指令放在可以直接複製的區塊裡',
            '出錯時先安撫、再解釋原因、最後給修正步驟',
          ].map((rule) => (
            <p
              key={rule}
              className="border-l-[6px] border-l-acid pl-4 text-[21px] leading-snug text-paper"
            >
              {rule}
            </p>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-panel px-5 py-3 text-[20px] leading-normal text-paper">
          <span className={`mr-3 ${LABEL_FAINT}`}>例如</span>
          {'「D1 就是放在雲端的資料庫，可以想成一張張 Excel 表。」'}
        </div>
        <div className="flex flex-col gap-2">
          <span className={LABEL_FAINT}>同一個 emoji 永遠代表同一件事</span>
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_LEGEND.map((item) => (
              <div
                key={item.mark}
                className="flex h-[46px] items-center gap-2 rounded-lg border border-line bg-panel px-3"
              >
                <span className="text-[20px]">{item.mark}</span>
                <span className="truncate text-[18px] text-paper">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl bg-ink-soft px-5 py-4">
        {SECURITY_COMMANDS.map((item) => (
          <div key={item.cmd} className="flex h-[36px] items-center gap-4">
            <span className="w-[400px] shrink-0 truncate font-mono text-[19px] text-paper">
              {item.cmd}
            </span>
            <span className="truncate text-[18px] text-muted">{item.note}</span>
          </div>
        ))}
      </div>
      <p className="border-l-[6px] border-l-acid pl-4 text-[21px] leading-snug text-paper">
        {'🔐 不會請你把密碼、金鑰貼進對話。金鑰只放在 .env 與 ChatGPT Sites 的 Secret。'}
      </p>
      <div className="flex flex-col gap-2">
        <span className={LABEL_FAINT}>什麼時候要再掃一次</span>
        <div className="flex flex-wrap gap-2">
          {SCAN_TIMES.map((time) => (
            <span
              key={time}
              className="rounded-full border border-line bg-panel px-4 py-1.5 text-[19px] text-paper"
            >
              {time}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

type InstallId = 'ask' | 'codex' | 'claude';

const INSTALLS: readonly {
  id: InstallId;
  label: string;
  text: string;
  usage: string;
}[] = [
  {
    id: 'ask',
    label: '請 Codex 幫你裝',
    text: `請幫我安裝這個 Skill：${SKILL_REPO}\n用 git clone 放到 ~/.agents/skills/chatgpt-sites-d1-r2（資料夾名稱要一模一樣）`,
    usage: '裝好之後輸入 `$chatgpt-sites-d1-r2`，或用 `/skills` 挑選',
  },
  {
    id: 'codex',
    label: '終端機 · Codex',
    text: `git clone ${SKILL_REPO}.git ~/.agents/skills/chatgpt-sites-d1-r2`,
    usage: '使用：輸入 `$chatgpt-sites-d1-r2`，或用 `/skills` 挑選',
  },
  {
    id: 'claude',
    label: '終端機 · Claude Code',
    text: `git clone ${SKILL_REPO}.git ~/.claude/skills/chatgpt-sites-d1-r2`,
    usage: '使用：輸入 `/chatgpt-sites-d1-r2`；第一次建立 skills 資料夾要重開 Claude Code',
  },
];

export function SkillDemo() {
  const [feature, setFeature] = useState<FeatureId>('env');
  const [install, setInstall] = useState<InstallId>('ask');
  const [status, copy] = useCopy();
  const current = FEATURES.find((item) => item.id === feature) ?? FEATURES[0];
  const currentInstall = INSTALLS.find((item) => item.id === install) ?? INSTALLS[0];

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[540px_1fr] gap-6">
      {/* ── 左：四件事 ＋ 連結 ─────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <span className={LABEL_FAINT}>這份 Skill 會幫你做的四件事</span>
        <div className="flex flex-col gap-3">
          {FEATURES.map((item, index) => {
            const on = item.id === feature;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFeature(item.id)}
                aria-current={on}
                className={`flex h-[96px] items-center gap-5 rounded-2xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${
                  on
                    ? 'border-acid border-l-acid bg-acid/14'
                    : 'border-line-soft border-l-line bg-panel-lift hover:border-line'
                }`}
              >
                <span
                  className={`${STEP_BADGE} ${
                    on ? 'border-acid bg-acid text-on-accent' : 'border-line text-faint'
                  }`}
                >
                  {pad2(index + 1)}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span
                    className={`text-[26px] ${on ? 'font-semibold text-paper' : 'text-paper'}`}
                  >
                    {item.name}
                  </span>
                  <span className={`truncate text-[19px] ${on ? 'text-paper' : 'text-muted'}`}>
                    {item.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <a
          href={SKILL_REPO}
          target="_blank"
          rel="noreferrer"
          className="mt-auto flex flex-col gap-1.5 rounded-2xl border border-line bg-panel px-5 py-4 transition-colors hover:border-blue"
        >
          <span className={LABEL_FAINT}>GitHub</span>
          <span className="font-mono text-[19px] break-all text-blue underline underline-offset-4">
            github.com/Wcc723/chatgpt-sites-d1-r2-skill
          </span>
          <span className="text-[17px] text-muted">
            {'Claude Code、Codex、ChatGPT 都能用'}
          </span>
        </a>
      </div>

      {/* ── 右：細節 ＋ 安裝 ───────────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 rounded-2xl border border-line bg-panel-lift px-8 py-6">
          <span className={`${LABEL_TYPE} text-acid`}>{current.name}</span>
          <FeatureDetail id={feature} />
        </div>

        <div className="flex h-[196px] shrink-0 flex-col gap-3 overflow-hidden rounded-2xl border border-line">
          <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line bg-panel-lift px-5">
            <span className={`mr-2 ${LABEL_FAINT}`}>安裝</span>
            {INSTALLS.map((item) => {
              const on = item.id === install;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInstall(item.id)}
                  aria-current={on}
                  className={`h-10 rounded-lg border px-4 text-[18px] transition-colors ${
                    on
                      ? 'border-paper bg-paper text-on-accent'
                      : 'border-line-soft bg-panel text-muted hover:border-line hover:text-paper'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <span className="ml-auto" />
            {status === 'failed' && <CopyFailed />}
            <CopyButton
              status={status}
              label="複製"
              onClick={() => copy(currentInstall.text)}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 px-5 pb-3">
            <p className="font-mono text-[17px] leading-snug whitespace-pre-wrap break-all text-paper">
              {currentInstall.text}
            </p>
            <p className="text-[17px] text-muted">
              <InlineCode text={currentInstall.usage} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
