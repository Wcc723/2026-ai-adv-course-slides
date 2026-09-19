import { useState, type ReactNode } from 'react';
import {
  BrowserGlyph,
  ChatGlyph,
  CheckGlyph,
  Connector,
  CrossGlyph,
  DataLimitDiagram,
  DatabaseGlyph,
  FileGlyph,
  GearGlyph,
  GlobeGlyph,
  ImageGlyph,
  InfoGlyph,
  KeyGlyph,
  LockGlyph,
  PersonGlyph,
  ServerGlyph,
  SheetGlyph,
  TrashGlyph,
} from './diagrams-site';

/* ════════════════════════════════════════════════════════════
 * ChatGPT Sites 與部署、權限（第 26、31、34 頁）
 *
 *   第 26 頁  SiteCautionsDemo  四個注意事項：直式頁籤 ＋ 右側概念圖
 *   第 31 頁  AccessLayersDemo  三道門：上方選人 ＋ 橫向關卡 ＋ 跟著狀態變的說明
 *   第 34 頁  DeployNotesDemo   部署前檢查：打勾清單 ＋ 右側工作視窗
 *
 * 三頁刻意用三種不同的殼，連著翻才不會像原地踏步。
 *
 * ──────────────────────────────────────────────────────────────
 * 說法的依據（2026-09-18 查證）
 * ──────────────────────────────────────────────────────────────
 * - ChatGPT Sites：learn.chatgpt.com/docs/sites、help.openai.com 繁中說明中心、
 *   ChatGPT Sites 條款。它是 public beta，這三頁會過期，上台前再確認一次
 *   分享選項的中文名稱、邀請功能在個人方案的介面、用量說明。
 *   · 「任何有連結的人」是台灣 Plus 介面出現過的字樣，官方文件叫
 *     「網際網路上的任何人」，功能上就是公開、不用登入 —— 沒有半私密模式。
 *   · 刪除會不會連資料庫一起刪，官方沒有逐字寫，畫面上用「網站連同資料
 *     一起永久消失」這個查證報告建議的講法。
 *   · 環境變數前端讀不讀得到，官方沒寫；畫面上寫成推論的語氣。
 * - Google 的部分（授權來源規則、測試使用者、Client ID／Secret 對照表）
 *   出自課程的「Google 服務開通說明」。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 * - 第 26 頁：coral（警示）＋ teal（比較安全的做法、打得開）。
 * - 第 31、34 頁：ok（通過）＋ error（擋下）。
 * - 選中的按鈕、人物一律用中性的深色小色塊（bg-paper ＋ text-on-accent），
 *   不另外開一支強調色，每頁維持兩色。
 * - 淡填色一律配 6px 不透明左粗條；淡底上的文字用 text-paper，
 *   強調色只出現在實心徽章或素色表面上。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這份簡報沒有 description 與 caption，面板內可用約 1744 × 768。
 * 三個根容器都是 h-[700px] max-w-[1740px]；沒有任何容器會捲動，
 * 未輪到的內容一律不掛。
 * ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
 * 共用零件
 * ════════════════════════════════════════════════════════════ */

const segBase =
  'rounded-lg border px-5 py-2 text-[19px] leading-[28px] transition-colors';
/** 選中：中性的深色小色塊，不佔強調色的額度 */
const segOn = 'border-paper bg-paper text-on-accent';
const segOff =
  'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper';

/** 實心的小徽章（✓／✗），放在淡底上也站得住 */
function MarkBadge({
  ok,
  size = 32,
  tone,
}: {
  ok: boolean;
  size?: number;
  /** 預設 ok→bg-ok、不 ok→bg-error；第 26 頁改用 teal／coral */
  tone?: 'teal-coral';
}) {
  const bg =
    tone === 'teal-coral'
      ? ok
        ? 'bg-teal'
        : 'bg-coral'
      : ok
        ? 'bg-ok'
        : 'bg-error';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-on-accent ${bg}`}
      style={{ width: size, height: size }}
    >
      {ok ? (
        <CheckGlyph size={size * 0.62} />
      ) : (
        <CrossGlyph size={size * 0.62} />
      )}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
 * 第 26 頁 — ChatGPT Sites 的四個注意事項
 *
 * 左邊四個直式頁籤，選中的那一個跟右邊的圖框接在一起；
 * 右邊每一項一張概念圖，底部一行出處。
 * 用色：coral（警示）＋ teal（安全的做法）。
 * ════════════════════════════════════════════════════════════ */

type CautionId = 'access' | 'deploy' | 'data' | 'delete';

interface Caution {
  id: CautionId;
  no: string;
  title: string;
  sub: string;
  headline: string;
  lead: string;
  source: string;
}

const CAUTIONS: readonly Caution[] = [
  {
    id: 'access',
    no: '01',
    title: '有分權限',
    sub: '三種分享範圍，預設不公開',
    headline: '新網站預設只有你自己打得開',
    lead: '要給別人看，到網站的分享設定調整範圍。',
    source: 'learn.chatgpt.com/docs/sites · help.openai.com 說明中心 · 2026-09',
  },
  {
    id: 'deploy',
    no: '02',
    title: '部署就是正式上線',
    sub: '沒有另外的測試網址',
    headline: '每一次部署，都是正式上線',
    lead: '官方文件寫明：每個部署網址都是正式環境網址。想先檢查，就只儲存版本、先不要部署。',
    source: 'learn.chatgpt.com/docs/sites · 2026-09',
  },
  {
    id: 'data',
    no: '03',
    title: '資料庫、用量說明有限',
    sub: '有容量上限，沒有備份與保證',
    headline: '有容量上限，但沒有備份與穩定性的保證',
    lead: '要把正式資料放在這個網站上，得自己另外備份。',
    source:
      'learn.chatgpt.com/docs/sites · ChatGPT Sites 條款（openai.com/policies）· 2026-09',
  },
  {
    id: 'delete',
    no: '04',
    title: '刪除網站就刪光了',
    sub: '永久刪除，無法還原',
    headline: '刪除是永久的，無法還原',
    lead: '刪除網站會連同裡面的資料一起永久消失。只想暫時下架，不用刪除。',
    source: 'learn.chatgpt.com/docs/sites · help.openai.com 說明中心 · 2026-09',
  },
];

export function SiteCautionsDemo() {
  const [activeId, setActiveId] = useState<CautionId>('access');
  const active = CAUTIONS.find((item) => item.id === activeId) ?? CAUTIONS[0];

  return (
    <div className="flex h-[700px] w-full max-w-[1740px]">
      {/* ── 左：直式頁籤 ─────────────────────────────── */}
      <nav
        aria-label="四個注意事項"
        className="relative z-10 flex w-[430px] shrink-0 flex-col gap-3 py-8"
      >
        {CAUTIONS.map((item) => {
          const on = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setActiveId(item.id)}
              className={`-mr-px flex flex-1 items-center gap-5 rounded-l-2xl border border-l-[6px] px-6 text-left transition-colors ${
                on
                  ? 'border-line border-r-panel border-l-coral bg-panel'
                  : 'border-line-soft border-r-line border-l-line-soft bg-ink-soft hover:bg-panel-lift'
              }`}
            >
              <span
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full font-display text-[24px] font-semibold tabular-nums ${
                  on
                    ? 'bg-coral text-on-accent'
                    : 'border border-line bg-panel text-faint'
                }`}
              >
                {item.no}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[26px] font-semibold leading-[34px] text-paper">
                  {item.title}
                </span>
                <span
                  className={`text-[19px] leading-[28px] ${
                    on ? 'text-paper' : 'text-muted'
                  }`}
                >
                  {item.sub}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── 右：概念圖 ───────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-panel px-10 py-8">
        <header className="flex shrink-0 flex-col gap-2">
          <h3 className="text-[30px] font-semibold leading-[40px] text-paper">
            {active.headline}
          </h3>
          <p className="text-[20px] leading-[30px] text-muted">{active.lead}</p>
        </header>

        {/* key 讓切換頁籤時，每張圖的互動狀態都從頭開始 */}
        <div key={active.id} className="mt-5 flex min-h-0 flex-1 flex-col">
          {active.id === 'access' && <AccessFigure />}
          {active.id === 'deploy' && <DeployFigure />}
          {active.id === 'data' && <DataFigure />}
          {active.id === 'delete' && <DeleteFigure />}
        </div>

        <p className="mt-4 shrink-0 text-[16px] leading-[24px] text-faint">
          出處：{active.source}
        </p>
      </section>
    </div>
  );
}

/* ── 01 有分權限 ─────────────────────────────────────────── */

type ShareMode = 'owner' | 'invited' | 'public';

const SHARE_MODES: readonly { id: ShareMode; label: string }[] = [
  { id: 'owner', label: '只有自己（預設）' },
  { id: 'invited', label: '邀請特定的人' },
  { id: 'public', label: '任何有連結的人' },
];

const SHARE_NOTES: Record<ShareMode, string> = {
  owner:
    '官方寫的是「擁有者和工作區管理員」。個人方案沒有工作區管理員，等於只有你自己。',
  invited: '用 email 邀請，對方要用受邀的帳號登入，才打得開這個網址。',
  public:
    '等於公開到網路上，不用登入。官方文件稱「網際網路上的任何人」；沒有「拿到連結才能看」的半私密模式。',
};

interface Visitor {
  id: string;
  name: string;
  invited: boolean;
}

const VISITORS: readonly Visitor[] = [
  { id: 'family', name: '受邀的家人', invited: true },
  { id: 'friend', name: '拿到網址的朋友', invited: false },
  { id: 'stranger', name: '被轉傳網址的陌生人', invited: false },
];

function visitorResult(
  mode: ShareMode,
  visitor: Visitor,
): { ok: boolean; reason: string } {
  if (mode === 'public') return { ok: true, reason: '不用登入就打得開' };
  if (mode === 'invited') {
    return visitor.invited
      ? { ok: true, reason: '登入受邀的帳號後打得開' }
      : { ok: false, reason: '不在邀請名單上' };
  }
  return { ok: false, reason: '只有擁有者打得開' };
}

function AccessFigure() {
  const [mode, setMode] = useState<ShareMode>('owner');

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex shrink-0 items-center gap-3">
        <span className="mr-2 text-[18px] tracking-[0.08em] text-faint">
          分享範圍
        </span>
        {SHARE_MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
            className={`${segBase} ${mode === option.id ? segOn : segOff}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-4">
        {/* 擁有者 */}
        <div className="flex w-[200px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-4 py-6">
          <PersonGlyph size={56} className="text-paper" />
          <span className="text-[26px] font-semibold text-paper">你</span>
          <span className="text-[18px] text-muted">擁有者</span>
          <span className="mt-1 flex items-center gap-2 text-[19px] text-paper">
            <MarkBadge ok size={26} tone="teal-coral" />
            打得開
          </span>
        </div>

        <span className="text-teal">
          <Connector state="ok" width={56} />
        </span>

        {/* 網站 */}
        <div className="flex w-[350px] shrink-0 flex-col items-center gap-3 rounded-2xl border-2 border-line bg-ink-soft px-5 py-7">
          {mode === 'public' ? (
            <GlobeGlyph size={60} className="text-paper" />
          ) : (
            <LockGlyph size={60} className="text-paper" />
          )}
          <span className="text-[24px] font-semibold text-paper">你的網站</span>
          <span className="font-mono text-[17px] text-muted">
            my-site.yourname.chatgpt.site
          </span>
          <span className="rounded-md border border-line bg-panel px-3 py-1 text-[17px] text-paper">
            {SHARE_MODES.find((option) => option.id === mode)?.label}
          </span>
        </div>

        {/* 訪客：箭頭指回網站 */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {VISITORS.map((visitor) => {
            const result = visitorResult(mode, visitor);
            return (
              <div key={visitor.id} className="flex items-center gap-3">
                <span className={result.ok ? 'text-teal' : 'text-coral'}>
                  <Connector
                    state={result.ok ? 'ok' : 'blocked'}
                    direction="left"
                    width={64}
                  />
                </span>
                <div
                  className={`flex min-w-0 flex-1 items-center gap-4 rounded-xl border border-l-[6px] px-5 py-3 ${
                    result.ok
                      ? 'border-teal/55 border-l-teal bg-teal/14'
                      : 'border-coral/55 border-l-coral bg-coral/14'
                  }`}
                >
                  <PersonGlyph size={36} className="text-paper" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[22px] font-semibold leading-[30px] text-paper">
                      {visitor.name}
                    </span>
                    <span className="text-[18px] leading-[26px] text-paper">
                      {result.reason}
                    </span>
                  </span>
                  <MarkBadge ok={result.ok} size={34} tone="teal-coral" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p
        className={`shrink-0 rounded-xl border border-l-[6px] bg-panel px-6 py-3 text-[20px] leading-[30px] text-paper ${
          mode === 'public'
            ? 'border-coral/55 border-l-coral'
            : 'border-line border-l-teal'
        }`}
      >
        {SHARE_NOTES[mode]}
      </p>
    </div>
  );
}

/* ── 02 部署就是正式上線 ─────────────────────────────────── */

const PRE_DEPLOY_CHECKS = [
  '沒有密碼、金鑰',
  '沒有個資、內部資料',
  '功能都實際點過',
  '分享範圍選最窄的',
];

function DeployFigure() {
  const [deployed, setDeployed] = useState(false);
  const live = deployed ? 'v3' : 'v1';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 items-stretch">
        {/* 1 修改 */}
        <div className="flex w-[200px] shrink-0 flex-col gap-3 rounded-2xl border border-line bg-ink-soft p-5">
          <ChatGlyph size={40} className="text-paper" />
          <span className="text-[24px] font-semibold leading-[32px] text-paper">
            在對話裡修改
          </span>
          <span className="rounded-lg border border-line bg-panel px-3 py-2 text-[18px] leading-[26px] text-paper">
            標題改成我的名字
          </span>
          <span className="mt-auto text-[19px] leading-[28px] text-muted">
            每改一次，就多一份新的內容
          </span>
        </div>

        <span className="flex items-center text-faint">
          <Connector state="ok" width={40} />
        </span>

        {/* 2 儲存版本 */}
        <div className="flex w-[250px] shrink-0 flex-col gap-3 rounded-2xl border border-l-[6px] border-teal/55 border-l-teal bg-panel p-5">
          <span className="text-[24px] font-semibold leading-[32px] text-paper">
            儲存版本
          </span>
          <ul className="flex flex-col gap-2">
            {['v3', 'v2', 'v1'].map((version) => (
              <li
                key={version}
                className="flex items-center gap-3 rounded-lg border border-line-soft bg-ink-soft px-3 py-2"
              >
                <span className="font-mono text-[19px] text-paper">
                  {version}
                </span>
                <span className="text-[17px] text-muted">
                  {version === 'v3' ? '剛儲存' : '已儲存'}
                </span>
                {version === live && (
                  <span className="ml-auto rounded-md bg-coral px-2 py-0.5 text-[16px] text-on-accent">
                    上線中
                  </span>
                )}
              </li>
            ))}
          </ul>
          <span className="mt-auto text-[19px] leading-[28px] text-paper">
            只是存起來，網址上的內容不變
          </span>
        </div>

        <span className="flex items-center text-faint">
          <Connector state="ok" width={40} />
        </span>

        {/* 3 部署前檢查 */}
        <div className="flex w-[280px] shrink-0 flex-col gap-3 rounded-2xl border border-line bg-ink-soft p-5">
          <span className="text-[24px] font-semibold leading-[32px] text-paper">
            部署前先確認
          </span>
          <ul className="flex flex-col gap-2">
            {PRE_DEPLOY_CHECKS.map((check) => (
              <li
                key={check}
                className="flex items-center gap-3 text-[19px] leading-[28px] text-paper"
              >
                <span className="h-[20px] w-[20px] shrink-0 rounded-[4px] border-2 border-muted bg-panel" />
                {check}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setDeployed((value) => !value)}
            className={`mt-auto rounded-lg border px-5 py-2.5 text-[20px] transition-colors ${
              deployed
                ? 'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper'
                : 'border-coral bg-coral text-on-accent'
            }`}
          >
            {deployed ? '重來' : '部署 v3'}
          </button>
        </div>

        <span className="flex items-center text-coral">
          <Connector state={deployed ? 'ok' : 'idle'} width={40} />
        </span>

        {/* 4 部署版本 = 正式網址 */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-l-[6px] border-coral/55 border-l-coral bg-panel p-5">
          <span className="text-[24px] font-semibold leading-[32px] text-paper">
            部署版本
          </span>
          <div className="flex flex-col gap-2 rounded-lg border border-line bg-ink-soft px-4 py-3">
            <GlobeGlyph size={32} className="text-paper" />
            <span className="font-mono text-[16px] leading-[24px] text-muted">
              my-site.yourname.chatgpt.site
            </span>
            <span className="flex items-baseline gap-2 text-[19px] text-paper">
              網址上現在是
              <span className="font-mono text-[24px] font-semibold">{live}</span>
            </span>
          </div>
          <span className="mt-auto text-[19px] leading-[28px] text-paper">
            打得開這個網址的人，立刻看到這一版
          </span>
        </div>
      </div>

      <p className="shrink-0 text-[20px] leading-[30px] text-paper">
        {deployed
          ? '按下部署，網址上立刻換成 v3。錯字、金鑰、測試用的假資料，也一起上線了。'
          : '已經儲存了 v3，網址上仍然是 v1。還沒部署之前，打開網址的人看不到這次的修改。'}
      </p>
    </div>
  );
}

/* ── 03 資料庫、用量說明有限 ─────────────────────────────── */

type FactTone = 'known' | 'ui' | 'missing';

const DATA_FACTS: readonly { tag: string; tone: FactTone; text: string }[] = [
  { tag: '官方有寫', tone: 'known', text: '每個網站的資料庫上限 10 GB。' },
  {
    tag: '只在介面上',
    tone: 'ui',
    text: '整個帳號的用量上限依方案而定，數字只顯示在產品介面，文件沒寫。',
  },
  {
    tag: '沒有說明',
    tone: 'missing',
    text: '資料庫會不會自動備份、能不能還原，官方都沒有說明。',
  },
  {
    tag: '明文不保證',
    tone: 'missing',
    text: '這是 Beta 服務：條款寫明不保證不中斷、不保證內容不遺失，也保留隨時下架網站的權利。',
  },
];

const FACT_ROW: Record<FactTone, string> = {
  known: 'border-teal/55 border-l-teal bg-teal/14',
  ui: 'border-line border-l-line bg-panel-lift',
  missing: 'border-coral/55 border-l-coral bg-coral/14',
};

const FACT_TAG: Record<FactTone, string> = {
  known: 'bg-teal text-on-accent',
  ui: 'border border-line bg-panel text-paper',
  missing: 'bg-coral text-on-accent',
};

function DataFigure() {
  return (
    <div className="flex min-h-0 flex-1 items-center gap-10">
      <DataLimitDiagram />
      <ul className="flex min-w-0 flex-1 flex-col gap-3">
        {DATA_FACTS.map((fact) => (
          <li
            key={fact.tag}
            className={`flex items-center gap-5 rounded-xl border border-l-[6px] px-5 py-4 ${FACT_ROW[fact.tone]}`}
          >
            <span
              className={`w-[132px] shrink-0 rounded-md px-2 py-1 text-center text-[18px] font-semibold ${FACT_TAG[fact.tone]}`}
            >
              {fact.tag}
            </span>
            <span className="text-[21px] leading-[31px] text-paper">
              {fact.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 04 刪除網站就刪光了 ─────────────────────────────────── */

const SITE_PARTS: readonly {
  id: string;
  label: string;
  note: string;
  icon: (props: { size?: number; className?: string }) => ReactNode;
}[] = [
  { id: 'files', label: '網頁檔案', note: 'HTML、CSS、JS', icon: FileGlyph },
  { id: 'db', label: '資料庫', note: '留言、表單資料', icon: DatabaseGlyph },
  { id: 'uploads', label: '上傳的檔案', note: '圖片、附件', icon: ImageGlyph },
];

function DeleteFigure() {
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 items-center gap-4">
        {/* 網站本體 */}
        <div
          className={`flex w-[500px] shrink-0 flex-col gap-3 rounded-2xl border-2 p-5 ${
            deleted ? 'border-dashed border-coral bg-panel' : 'border-line bg-ink-soft'
          }`}
        >
          <span className="font-mono text-[18px] text-muted">
            my-site.yourname.chatgpt.site
          </span>
          {SITE_PARTS.map((part) => {
            const Icon = part.icon;
            return deleted ? (
              <div
                key={part.id}
                className="flex h-[64px] items-center gap-4 rounded-xl border-2 border-dashed border-line px-4"
              >
                <span className="text-[20px] text-faint">{part.label}</span>
                <span className="ml-auto text-[18px] text-faint">已永久移除</span>
              </div>
            ) : (
              <div
                key={part.id}
                className="flex h-[64px] items-center gap-4 rounded-xl border border-line bg-panel px-4"
              >
                <Icon size={32} className="text-paper" />
                <span className="text-[21px] font-semibold text-paper">
                  {part.label}
                </span>
                <span className="ml-auto text-[18px] text-muted">{part.note}</span>
              </div>
            );
          })}
        </div>

        <span className="text-coral">
          <Connector state={deleted ? 'ok' : 'idle'} direction="left" width={56} />
        </span>

        {/* 刪除確認視窗（示意） */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-line bg-panel p-6">
          <span className="flex items-center gap-3 text-[24px] font-semibold text-paper">
            <TrashGlyph size={30} className="text-coral" />
            刪除網站
          </span>
          <span className="text-[19px] leading-[28px] text-muted">
            這個動作無法復原。輸入網站代稱以確認：
          </span>
          <span className="rounded-lg border-2 border-line bg-ink-soft px-4 py-2 font-mono text-[20px] text-paper">
            my-site
          </span>
          <button
            type="button"
            onClick={() => setDeleted((value) => !value)}
            className={`self-start rounded-lg border px-6 py-2.5 text-[20px] transition-colors ${
              deleted
                ? 'border-line-soft bg-panel-lift text-muted hover:border-line hover:text-paper'
                : 'border-coral bg-coral text-on-accent'
            }`}
          >
            {deleted ? '重來' : '永久刪除'}
          </button>
        </div>
      </div>

      <p className="shrink-0 rounded-xl border border-l-[6px] border-teal/55 border-l-teal bg-teal/14 px-6 py-3 text-[20px] leading-[30px] text-paper">
        {deleted
          ? '網站和裡面的資料都回不來了。下次只想暫時下架，把分享範圍改回「只有自己（預設）」就好。'
          : '只想暫時下架？把分享範圍改回「只有自己（預設）」，網站和資料都還在。'}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 第 31 頁 — 權限控管：三道門
 *
 * 情境是第 35 頁的家庭記帳工具。一個人要用到帳目，要依序通過三道
 * 互相獨立的門；打開其中一道，不會自動打開另一道。
 *   ① ChatGPT Sites 的分享設定：誰打得開這個網址
 *   ② Google 登入：OAuth 同意畫面在「測試」階段，只有測試使用者登得進來
 *   ③ 試算表的共用設定：網站拿這個人自己的 Google 帳號去讀寫
 * 用色：ok（通過）＋ error（擋下）。
 *
 * 家人跟第 29 頁試算表的「家庭成員」分頁、共用設定一致：
 *   爸爸 = 擁有者（做網站的人）、媽媽 = 編輯者、小明 = 檢視者。
 * 再加一個只拿到網址的朋友，當作家人以外的人。
 * ════════════════════════════════════════════════════════════ */

type PersonId = 'dad' | 'mom' | 'ming' | 'friend';
type SheetRole = 'owner' | 'editor' | 'viewer' | 'none';

interface Member {
  id: PersonId;
  name: string;
  setup: string;
  /** 網站的擁有者：第 1 道門怎麼設都打得開 */
  owner: boolean;
  invited: boolean;
  testUser: boolean;
  sheet: SheetRole;
}

const MEMBERS: readonly Member[] = [
  {
    id: 'dad',
    name: '爸爸',
    setup: '網站與試算表的擁有者',
    owner: true,
    invited: true,
    testUser: true,
    sheet: 'owner',
  },
  {
    id: 'mom',
    name: '媽媽',
    setup: '三道門都設好了',
    owner: false,
    invited: true,
    testUser: true,
    sheet: 'editor',
  },
  {
    id: 'ming',
    name: '小明',
    setup: '試算表只給了檢視',
    owner: false,
    invited: true,
    testUser: true,
    sheet: 'viewer',
  },
  {
    id: 'friend',
    name: '朋友',
    setup: '只拿到網址',
    owner: false,
    invited: false,
    testUser: false,
    sheet: 'none',
  },
];

type Verdict = 'pass' | 'fail' | 'partial' | 'skip';

interface DoorResult {
  verdict: Verdict;
  reason: string;
}

interface Door {
  no: string;
  name: string;
  where: string;
  question: string;
  rule: string;
}

const DOORS: readonly Door[] = [
  {
    no: '1',
    name: '網站分享設定',
    where: '在 ChatGPT Sites 設定',
    question: '誰打得開這個網址？',
    rule: '預設只有自己；可以改成邀請特定的人，或任何有連結的人',
  },
  {
    no: '2',
    name: 'Google 登入',
    where: '在 Google Cloud 設定',
    question: '誰登得進來？',
    rule: 'OAuth 同意畫面在「測試」階段：只有測試使用者登得進來',
  },
  {
    no: '3',
    name: '試算表共用',
    where: '在 Google 試算表設定',
    question: '登入後，讀得到、寫得進嗎？',
    rule: '網站用這個人自己的 Google 帳號讀寫；檢視者只能讀，編輯者才能記帳',
  },
];

function evaluate(member: Member, mode: ShareMode): DoorResult[] {
  const results: DoorResult[] = [];

  // ① 網站分享設定
  if (member.owner) {
    results.push({
      verdict: 'pass',
      reason: `${member.name}是擁有者，怎麼設都打得開`,
    });
  } else if (mode === 'public') {
    results.push({ verdict: 'pass', reason: '任何有連結的人都打得開，不用登入' });
  } else if (mode === 'invited') {
    results.push(
      member.invited
        ? { verdict: 'pass', reason: '在邀請名單上，登入受邀的帳號後打得開' }
        : { verdict: 'fail', reason: '不在邀請名單上，打不開這個網址' },
    );
  } else {
    results.push({
      verdict: 'fail',
      reason: '分享範圍是「只有自己（預設）」，只有擁有者打得開',
    });
  }

  // ② Google 登入
  if (results[0].verdict !== 'pass') {
    results.push({ verdict: 'skip', reason: '' });
  } else if (member.testUser) {
    results.push({
      verdict: 'pass',
      reason: member.owner
        ? '開通時把自己的帳號加進測試使用者了'
        : '已經加進測試使用者名單',
    });
  } else {
    results.push({
      verdict: 'fail',
      reason: '不在測試使用者名單上，Google 不讓這個帳號登入',
    });
  }

  // ③ 試算表共用
  if (results[1].verdict !== 'pass') {
    results.push({ verdict: 'skip', reason: '' });
  } else if (member.sheet === 'owner') {
    results.push({
      verdict: 'pass',
      reason: `試算表是${member.name}建的，可以讀也可以寫`,
    });
  } else if (member.sheet === 'editor') {
    results.push({ verdict: 'pass', reason: '共用為「編輯者」，可以讀也可以寫' });
  } else if (member.sheet === 'viewer') {
    results.push({ verdict: 'partial', reason: '共用為「檢視者」，只能讀、不能寫' });
  } else {
    results.push({
      verdict: 'fail',
      reason: '試算表沒有共用給這個帳號，讀不到資料',
    });
  }

  return results;
}

function outcomeOf(results: DoorResult[]): {
  ok: boolean;
  text: string;
} {
  const failed = results.findIndex((result) => result.verdict === 'fail');
  if (failed === 0) return { ok: false, text: '打不開網站' };
  if (failed === 1) return { ok: false, text: '打得開網站，但登不進來' };
  if (failed === 2) return { ok: false, text: '登入了，但讀不到帳目' };
  if (results[2].verdict === 'partial') {
    return { ok: false, text: '看得到帳目，但不能記帳' };
  }
  return { ok: true, text: '看得到帳目，也可以記帳' };
}

function hintOf(member: Member, mode: ShareMode, results: DoorResult[]): string {
  const failed = results.findIndex((result) => result.verdict === 'fail');
  if (failed === 0 && mode === 'owner') {
    return member.invited
      ? `網站預設只有擁有者打得開。要讓${member.name}用，先把第 1 道門的分享範圍打開。`
      : `網站預設只有擁有者打得開，${member.name}拿到網址也打不開。`;
  }
  if (failed === 0) {
    return `分享範圍是邀請制，${member.name}不在名單上，連網址都打不開。`;
  }
  if (failed === 1) {
    return mode === 'public'
      ? `網址公開之後${member.name}打得開網站，但不在測試使用者名單上，Google 不讓這個帳號登入。網站公開，不等於資料公開。`
      : `${member.name}打得開網站，但不在測試使用者名單上，Google 不讓這個帳號登入。`;
  }
  if (failed === 2) {
    return `${member.name}打得開網站、也登得進來，但試算表沒有共用給這個 Google 帳號，網站拿這個帳號去讀就被拒絕。`;
  }
  if (results[2].verdict === 'partial') {
    return `${member.name}的帳號被共用為「檢視者」，網站讀得到帳目，送出新的一筆時會被 Google 拒絕。要記帳，就改成「編輯者」。`;
  }
  if (member.owner) {
    return `${member.name}是網站和試算表的擁有者，也在測試使用者名單上，三道門都通過。`;
  }
  return `三道門都設好了：${member.name}打得開網址、登得進 Google，帳號也有試算表的編輯權限。`;
}

const DOOR_FACE: Record<Verdict, string> = {
  pass: 'border-ok/55 border-l-ok bg-ok/14',
  partial: 'border-ok/55 border-l-ok bg-ok/14',
  fail: 'border-error/55 border-l-error bg-error/14',
  skip: 'border-line-soft border-l-line-soft bg-ink-soft',
};

const DOOR_NUMBER: Record<Verdict, string> = {
  pass: 'bg-ok text-on-accent',
  partial: 'bg-ok text-on-accent',
  fail: 'bg-error text-on-accent',
  skip: 'border border-line bg-panel text-faint',
};

const DOOR_ICONS = [LockGlyph, KeyGlyph, SheetGlyph];

export function AccessLayersDemo() {
  const [personId, setPersonId] = useState<PersonId>('mom');
  const [mode, setMode] = useState<ShareMode>('owner');

  const member = MEMBERS.find((item) => item.id === personId) ?? MEMBERS[0];
  const results = evaluate(member, mode);
  const outcome = outcomeOf(results);

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] flex-col gap-5">
      {/* ── 上：選人 ＋ 第 1 道門的開關 ─────────────── */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="mr-1 text-[18px] tracking-[0.08em] text-faint">
          選一個人
        </span>
        {MEMBERS.map((item) => {
          const on = item.id === personId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPersonId(item.id)}
              className={`flex items-center gap-2 ${segBase} ${on ? segOn : segOff}`}
            >
              <PersonGlyph size={22} />
              {item.name}
            </button>
          );
        })}

        <span className="ml-auto mr-1 text-[18px] tracking-[0.08em] text-faint">
          第 1 道門的分享範圍
        </span>
        {SHARE_MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
            className={`${segBase} ${mode === option.id ? segOn : segOff}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ── 中：人 → 三道門 → 結果 ─────────────────── */}
      <div className="flex min-h-0 flex-1 items-stretch">
        <div className="flex w-[200px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-ink-soft px-4 text-center">
          <PersonGlyph size={64} className="text-paper" />
          <span className="text-[30px] font-semibold text-paper">{member.name}</span>
          <span className="text-[18px] leading-[26px] text-muted">{member.setup}</span>
        </div>

        {DOORS.map((door, index) => {
          const result = results[index];
          const Icon = DOOR_ICONS[index];
          return (
            <div key={door.no} className="flex min-w-0 flex-1 items-stretch">
              <span
                className={`flex items-center px-1 ${
                  result.verdict === 'skip' ? 'text-line' : 'text-ok'
                }`}
              >
                <Connector
                  state={result.verdict === 'skip' ? 'idle' : 'ok'}
                  width={34}
                />
              </span>
              <DoorCard door={door} result={result} icon={Icon} />
            </div>
          );
        })}

        <span
          className={`flex items-center px-1 ${
            results[2].verdict === 'pass' || results[2].verdict === 'partial'
              ? 'text-ok'
              : 'text-line'
          }`}
        >
          <Connector
            state={
              results[2].verdict === 'pass' || results[2].verdict === 'partial'
                ? 'ok'
                : 'idle'
            }
            width={34}
          />
        </span>

        <div
          className={`flex w-[210px] shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-l-[6px] px-4 text-center ${
            outcome.ok
              ? 'border-ok/55 border-l-ok bg-ok/14'
              : 'border-error/55 border-l-error bg-error/14'
          }`}
        >
          <span className="text-[17px] tracking-[0.1em] text-muted">結果</span>
          <MarkBadge ok={outcome.ok} size={48} />
          <span className="text-[24px] font-semibold leading-[34px] text-paper">
            {outcome.text}
          </span>
        </div>
      </div>

      {/* ── 下：跟著狀態變的說明 ─────────────────────── */}
      <div className="flex shrink-0 flex-col gap-3">
        <p
          className={`flex min-h-[80px] items-center rounded-xl border border-l-[6px] bg-panel px-6 py-3 text-[22px] leading-[32px] text-paper ${
            outcome.ok ? 'border-ok/55 border-l-ok' : 'border-error/55 border-l-error'
          }`}
        >
          {hintOf(member, mode, results)}
        </p>
        <p className="flex items-center gap-3 text-[18px] leading-[28px] text-muted">
          <InfoGlyph size={24} className="text-muted" />
          測試階段登入時會看到「Google 尚未驗證這個應用程式」。這是你自己建立的測試應用程式，按「繼續」是正常的。
        </p>
      </div>
    </div>
  );
}

function DoorCard({
  door,
  result,
  icon: Icon,
}: {
  door: Door;
  result: DoorResult;
  icon: (props: { size?: number; className?: string }) => ReactNode;
}) {
  const reached = result.verdict !== 'skip';
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-l-[6px] p-5 ${DOOR_FACE[result.verdict]}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full font-display text-[22px] font-semibold ${DOOR_NUMBER[result.verdict]}`}
        >
          {door.no}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[23px] font-semibold leading-[30px] text-paper">
            {door.name}
          </span>
          <span className="text-[16px] leading-[22px] text-faint">{door.where}</span>
        </span>
        <Icon size={32} className="ml-auto text-paper" />
      </div>

      <p className="text-[22px] leading-[32px] text-paper">{door.question}</p>

      <div className="flex flex-1 flex-col justify-center gap-2 border-t border-line pt-3">
        {reached ? (
          <>
            <span className="flex items-center gap-3 text-[24px] font-semibold text-paper">
              <MarkBadge ok={result.verdict !== 'fail'} size={30} />
              {result.verdict === 'pass' && '通過'}
              {result.verdict === 'partial' && '只能讀'}
              {result.verdict === 'fail' && '擋在這裡'}
            </span>
            <span className="text-[20px] leading-[30px] text-paper">
              {result.reason}
            </span>
          </>
        ) : (
          <span className="text-[20px] leading-[30px] text-faint">
            還沒走到這一道門
          </span>
        )}
      </div>

      <p className="border-t border-line pt-3 text-[17px] leading-[26px] text-muted">
        {door.rule}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * 第 34 頁 — 部署前要確認的事
 *
 * 左邊是打勾清單（每一項自己勾、下方有進度），右邊是一個工作視窗，
 * 內容跟著選中的那一項換。第 1 項是能操作的「已授權的 JavaScript 來源」
 * 檢查器，規則出自 Google 服務開通說明。
 * 用色：ok（吻合、已確認）＋ error（不吻合、不可以）。
 * ════════════════════════════════════════════════════════════ */

type NoteId = 'origin' | 'secret' | 'env' | 'after';

const NOTES: readonly {
  id: NoteId;
  title: string;
  sub: string;
  location: string;
}[] = [
  {
    id: 'origin',
    title: '加入正式網址',
    sub: 'Google 的已授權 JavaScript 來源',
    location: 'Google Cloud › 憑證 › OAuth 用戶端 ID（網頁應用程式）',
  },
  {
    id: 'secret',
    title: '分清楚 ID 與 Secret',
    sub: '哪一個可以放在前端',
    location: 'Google Cloud › 憑證 › OAuth 用戶端 ID',
  },
  {
    id: 'env',
    title: '環境變數與機密資訊',
    sub: 'ChatGPT Sites 的網站設定',
    location: 'ChatGPT Sites › my-ledger › 設定',
  },
  {
    id: 'after',
    title: '部署完回頭看一次',
    sub: '分享範圍、測試使用者、試算表共用',
    location: '部署之後 › 用家人的帳號走一次',
  },
];

export function DeployNotesDemo() {
  const [activeId, setActiveId] = useState<NoteId>('origin');
  const [checked, setChecked] = useState<Record<NoteId, boolean>>({
    origin: false,
    secret: false,
    env: false,
    after: false,
  });

  const active = NOTES.find((note) => note.id === activeId) ?? NOTES[0];
  const done = NOTES.filter((note) => checked[note.id]).length;

  return (
    <div className="flex h-[700px] w-full max-w-[1740px] gap-8">
      {/* ── 左：打勾清單 ─────────────────────────────── */}
      <aside className="flex w-[460px] shrink-0 flex-col gap-4 rounded-2xl border border-line bg-ink-soft p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-[26px] font-semibold text-paper">部署前檢查</span>
          <span className="text-[19px] tabular-nums text-muted">
            已確認 {done}／{NOTES.length}
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {NOTES.map((note, index) => {
            const on = note.id === activeId;
            const isChecked = checked[note.id];
            return (
              <li
                key={note.id}
                className={`flex items-stretch rounded-xl border border-l-[6px] bg-panel ${
                  on ? 'border-line border-l-paper' : 'border-line-soft border-l-line-soft'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  aria-label={`${note.title}：${isChecked ? '已確認' : '未確認'}`}
                  onClick={() =>
                    setChecked((current) => ({
                      ...current,
                      [note.id]: !current[note.id],
                    }))
                  }
                  className="flex w-[64px] shrink-0 items-center justify-center"
                >
                  <span
                    className={`flex h-[32px] w-[32px] items-center justify-center rounded-md border-2 ${
                      isChecked
                        ? 'border-ok bg-ok text-on-accent'
                        : 'border-muted bg-panel text-transparent'
                    }`}
                  >
                    {isChecked && <CheckGlyph size={22} />}
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActiveId(note.id)}
                  className="flex min-w-0 flex-1 flex-col gap-1 py-4 pr-5 text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-display text-[20px] font-semibold tabular-nums text-faint">
                      {index + 1}
                    </span>
                    <span className="text-[23px] font-semibold leading-[30px] text-paper">
                      {note.title}
                    </span>
                  </span>
                  <span className="text-[18px] leading-[26px] text-muted">
                    {note.sub}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-3">
          <div className="h-[14px] w-full overflow-hidden rounded-full border border-line bg-panel">
            <div
              className="h-full rounded-full bg-ok transition-[width] duration-300"
              style={{ width: `${(done / NOTES.length) * 100}%` }}
            />
          </div>
          <span className="flex items-center gap-2 text-[19px] leading-[28px] text-paper">
            {done === NOTES.length ? (
              <>
                <MarkBadge ok size={26} />
                四項都確認了，可以部署
              </>
            ) : (
              '每確認一項，就在左邊打勾'
            )}
          </span>
        </div>
      </aside>

      {/* ── 右：工作視窗 ─────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line bg-ink-soft px-6">
          <span className="h-[12px] w-[12px] rounded-full bg-line" />
          <span className="h-[12px] w-[12px] rounded-full bg-line" />
          <span className="h-[12px] w-[12px] rounded-full bg-line" />
          <span className="ml-3 font-mono text-[17px] text-muted">
            {active.location}
          </span>
        </div>

        <div key={active.id} className="flex min-h-0 flex-1 flex-col p-7">
          {active.id === 'origin' && <OriginChecker />}
          {active.id === 'secret' && <SecretCompare />}
          {active.id === 'env' && <EnvNotes />}
          {active.id === 'after' && <AfterDeploy />}
        </div>
      </section>
    </div>
  );
}

/* ── 1 已授權的 JavaScript 來源檢查器 ────────────────────── */

const SITE_ORIGIN = 'https://my-ledger.yourname.chatgpt.site';
const LOCAL_ORIGIN = 'http://localhost:5500';

interface Candidate {
  url: string;
  ok: boolean;
  /** 不吻合時的分類，顯示在徽章上 */
  kind: string;
  reason: string;
}

/** 故意把正確的兩個打散，不讓第一個就是答案 */
const CANDIDATES: readonly Candidate[] = [
  {
    url: 'http://my-ledger.yourname.chatgpt.site',
    ok: false,
    kind: '協定不同',
    reason: '網站跑在 https；http 與 https 是不同來源',
  },
  {
    url: SITE_ORIGIN,
    ok: true,
    kind: '吻合',
    reason: '正式網址：協定、網域都完全吻合',
  },
  {
    url: 'https://www.my-ledger.yourname.chatgpt.site',
    ok: false,
    kind: '網域不同',
    reason: '多了 www 就是另一個網域，要完全吻合',
  },
  {
    url: 'https://my-ledger.yourname.chatgpt.site/login',
    ok: false,
    kind: '有路徑',
    reason: '只能填協定＋網域＋埠號，不可以有路徑或結尾斜線',
  },
  {
    url: 'http://localhost:3000',
    ok: false,
    kind: '埠號不同',
    reason: '本機預覽跑在 5500；埠號不同就是不同來源',
  },
  {
    url: LOCAL_ORIGIN,
    ok: true,
    kind: '吻合',
    reason: '本機預覽：localhost 要連埠號一起填',
  },
];

function OriginChecker() {
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  const reveal = (url: string) =>
    setRevealed((current) => new Set(current).add(url));

  const allRevealed = revealed.size === CANDIDATES.length;
  const authorized = [SITE_ORIGIN, LOCAL_ORIGIN];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center gap-3">
        <h4 className="text-[24px] font-semibold leading-[34px] text-paper">
          點一個網址，看它能不能填進「已授權的 JavaScript 來源」
        </h4>
        <button
          type="button"
          onClick={() =>
            setRevealed(
              allRevealed
                ? new Set()
                : new Set(CANDIDATES.map((candidate) => candidate.url)),
            )
          }
          className={`ml-auto ${segBase} ${segOff}`}
        >
          {allRevealed ? '重來' : '全部檢查'}
        </button>
      </div>

      <p className="shrink-0 text-[18px] leading-[28px] text-muted">
        <span className="mr-3">你的網站</span>
        正式網址 <span className="font-mono text-paper">{SITE_ORIGIN}</span>
        <span className="mx-3">·</span>
        本機預覽 <span className="font-mono text-paper">{LOCAL_ORIGIN}</span>
      </p>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* 候選網址 */}
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {CANDIDATES.map((candidate) => {
            const shown = revealed.has(candidate.url);
            const face = !shown
              ? 'border-line-soft border-l-line bg-panel-lift hover:border-line'
              : candidate.ok
                ? 'border-ok/55 border-l-ok bg-ok/14'
                : 'border-error/55 border-l-error bg-error/14';
            return (
              <li key={candidate.url}>
                <button
                  type="button"
                  onClick={() => reveal(candidate.url)}
                  className={`flex w-full flex-col gap-0.5 rounded-xl border border-l-[6px] px-5 py-1.5 text-left transition-colors ${face}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[18px] leading-[28px] text-paper">
                      {candidate.url}
                    </span>
                    {shown && (
                      <span
                        className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[17px] text-on-accent ${
                          candidate.ok ? 'bg-ok' : 'bg-error'
                        }`}
                      >
                        {candidate.ok ? (
                          <CheckGlyph size={18} />
                        ) : (
                          <CrossGlyph size={18} />
                        )}
                        {candidate.kind}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[18px] leading-[26px] ${
                      shown ? 'text-paper' : 'text-faint'
                    }`}
                  >
                    {shown ? candidate.reason : '點一下檢查'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* 設定欄位（示意）＋ 規則 ＋ 提醒 */}
        {/*
          * 高度：可用 492（590 − 標題列 46 − 說明列 28 − 兩個 gap 24）。
          * 設定欄位 160 ＋ 規則 179.5 ＋ 提醒三行 110 ＋ 兩個 gap 24 = 473.5，留 18.5 餘裕。
          * 原本 gap-4／p-4／gap-3 是 497.5，溢出 5px。
          */}
        <div className="flex w-[470px] shrink-0 flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-ink-soft px-4 py-3">
            <span className="text-[20px] font-semibold text-paper">
              已授權的 JavaScript 來源
            </span>
            {authorized.map((url) => {
              const found = revealed.has(url);
              return (
                <span
                  key={url}
                  className={`flex h-[44px] items-center rounded-lg border px-3 font-mono text-[16px] ${
                    found
                      ? 'border-ok bg-panel text-paper'
                      : 'border-dashed border-line bg-panel text-faint'
                  }`}
                >
                  {found ? url : '還沒找到'}
                </span>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-line bg-panel px-5 py-3">
            <span className="text-[17px] tracking-[0.08em] text-faint">填寫規則</span>
            {[
              '協定要一致：http 與 https 是不同來源',
              '網域要完全吻合，www 也算在內',
              '只填協定＋網域＋埠號，沒有路徑',
              '本機要含埠號，埠號不同就是不同來源',
            ].map((rule) => (
              <span key={rule} className="text-[18px] leading-[28px] text-paper">
                · {rule}
              </span>
            ))}
          </div>

          <p className="rounded-xl border border-l-[6px] border-line border-l-paper bg-panel px-5 py-3 text-[18px] leading-[28px] text-paper">
            之後改了網站網址或綁自訂網域，這裡要跟著改：就算舊網址會轉址過去，頁面的來源也已經是新網址了。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 2 Client ID 與 Client Secret ────────────────────────── */

const SECRET_ROWS: readonly { label: string; id: string; secret: string }[] = [
  { label: '可否公開', id: '可以公開', secret: '絕對不可公開' },
  { label: '功能', id: '識別應用程式的身分', secret: '證明應用程式的擁有權' },
  { label: '流出的影響', id: '風險極低', secret: '高風險，必須立即重新產生' },
  {
    label: '保護機制',
    id: '已授權來源（網域白名單）',
    secret: '環境變數與後端保護',
  },
  {
    label: '這堂課放哪',
    id: 'config.js（前端，誰都看得到）',
    secret: '用不到，不複製進任何檔案',
  },
];

const MISUSE_FLOW = [
  '別人複製你的 Client ID，放到他自己的網站',
  'Google 比對來源：他的網址不在你的已授權清單',
  '回傳 origin_mismatch，登入失敗',
];

function SecretCompare() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h4 className="shrink-0 text-[24px] font-semibold leading-[34px] text-paper">
        Client ID 可以公開，Client Secret 絕對不放前端
      </h4>

      <div className="grid shrink-0 grid-cols-[170px_1fr_1fr] overflow-hidden rounded-xl border border-line">
        <span className="border-b border-line bg-ink-soft" />
        <span className="flex items-center gap-3 border-b border-l border-line bg-ink-soft px-5 py-3 text-[21px] font-semibold text-paper">
          <MarkBadge ok size={28} />
          Client ID
        </span>
        <span className="flex items-center gap-3 border-b border-l border-line bg-ink-soft px-5 py-3 text-[21px] font-semibold text-paper">
          <MarkBadge ok={false} size={28} />
          Client Secret
        </span>
        {SECRET_ROWS.map((row, index) => {
          const last = index === SECRET_ROWS.length - 1;
          const rowBorder = last ? '' : 'border-b border-line';
          return (
            <div key={row.label} className="contents">
              <span
                className={`flex items-center bg-panel px-5 py-2.5 text-[18px] text-faint ${rowBorder}`}
              >
                {row.label}
              </span>
              <span
                className={`flex items-center border-l border-line bg-panel px-5 py-2.5 text-[20px] leading-[30px] text-paper ${rowBorder}`}
              >
                {row.id}
              </span>
              <span
                className={`flex items-center border-l border-line bg-panel px-5 py-2.5 text-[20px] leading-[30px] text-paper ${rowBorder}`}
              >
                {row.secret}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <span className="text-[18px] tracking-[0.08em] text-faint">
          為什麼 Client ID 被看到也沒關係
        </span>
        <div className="flex flex-1 items-stretch">
          {MISUSE_FLOW.map((step, index) => (
            <div key={step} className="flex min-w-0 flex-1 items-stretch">
              {index > 0 && (
                <span className="flex items-center px-1 text-faint">
                  <Connector state="ok" width={36} />
                </span>
              )}
              <span
                className={`flex min-w-0 flex-1 items-center rounded-xl border px-5 py-3 text-[20px] leading-[30px] text-paper ${
                  index === MISUSE_FLOW.length - 1
                    ? 'border-error/55 border-l-[6px] border-l-error bg-error/14'
                    : 'border-line bg-ink-soft'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 3 ChatGPT Sites 的環境變數與機密資訊 ────────────────── */

const ENV_RULES = [
  '在網站的設定裡新增、修改、刪除',
  '改完要重新部署，才會生效',
  '機密資訊只有擁有者能設定',
  '機密不要寫進提示詞、附件或網站內容',
];

function EnvNotes() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h4 className="shrink-0 text-[24px] font-semibold leading-[34px] text-paper">
        ChatGPT Sites 的「環境變數」與「機密資訊」
      </h4>

      {/* 概念圖：設定 → 伺服器端讀得到；前端拿不到 */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex w-[330px] shrink-0 flex-col gap-3 rounded-2xl border-2 border-line bg-ink-soft p-5">
          <span className="flex items-center gap-3 text-[22px] font-semibold text-paper">
            <GearGlyph size={30} className="text-paper" />
            網站設定
          </span>
          <span className="rounded-lg border border-line bg-panel px-4 py-2 text-[19px] text-paper">
            環境變數
          </span>
          <span className="flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2 text-[19px] text-paper">
            <LockGlyph size={22} className="text-paper" />
            機密資訊
          </span>
        </div>

        <div className="flex flex-col gap-16">
          <span className="text-ok">
            <Connector state="ok" width={80} />
          </span>
          <span className="text-error">
            <Connector state="blocked" width={80} />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-4 rounded-xl border border-l-[6px] border-ok/55 border-l-ok bg-ok/14 px-5 py-3">
            <ServerGlyph size={36} className="text-paper" />
            <span className="flex flex-col">
              <span className="text-[21px] font-semibold text-paper">
                伺服器端程式
              </span>
              <span className="text-[18px] text-paper">這些值是給它讀的</span>
            </span>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-l-[6px] border-error/55 border-l-error bg-error/14 px-5 py-3">
            <BrowserGlyph size={36} className="text-paper" />
            <span className="flex flex-col">
              <span className="text-[21px] font-semibold text-paper">
                瀏覽器裡的前端檔案（config.js）
              </span>
              <span className="text-[18px] text-paper">
                純靜態網站沒有伺服器端程式，前端不會拿到這些值
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel px-6 py-4">
          <span className="text-[17px] tracking-[0.08em] text-faint">
            官方文件寫的
          </span>
          {ENV_RULES.map((rule) => (
            <span key={rule} className="text-[20px] leading-[30px] text-paper">
              · {rule}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-l-[6px] border-ok/55 border-l-ok bg-ok/14 px-6 py-4">
          <span className="text-[17px] tracking-[0.08em] text-muted">
            這堂課的做法
          </span>
          <span className="text-[20px] leading-[30px] text-paper">
            網站是純靜態的，只有 HTML、CSS、JS。
          </span>
          <span className="text-[20px] leading-[30px] text-paper">
            公開設定寫在 config.js，Client Secret 不放前端。
          </span>
          <span className="mt-auto text-[16px] leading-[24px] text-muted">
            前端讀不讀得到這些值，官方文件沒有寫明；這裡是依文件推論。
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── 4 部署完回頭看一次 ──────────────────────────────────── */

const AFTER_CHECKS: readonly { no: string; name: string; check: string }[] = [
  {
    no: '1',
    name: '網站分享範圍',
    check: '選夠用的最窄範圍：只給家人用，就邀請特定的人。',
  },
  {
    no: '2',
    name: 'Google 測試使用者',
    check: '家人要用的 Google 帳號，都加進測試使用者名單了嗎？',
  },
  {
    no: '3',
    name: '試算表共用',
    check: '要記帳的人給「編輯者」，只看的人給「檢視者」。',
  },
];

function AfterDeploy() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h4 className="shrink-0 text-[24px] font-semibold leading-[34px] text-paper">
        部署完，照三道門的順序再走一次
      </h4>

      <ul className="flex shrink-0 flex-col gap-3">
        {AFTER_CHECKS.map((item) => (
          <li
            key={item.no}
            className="flex items-center gap-5 rounded-xl border border-line bg-ink-soft px-6 py-4"
          >
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-paper font-display text-[24px] font-semibold text-on-accent">
              {item.no}
            </span>
            <span className="w-[220px] shrink-0 text-[22px] font-semibold text-paper">
              {item.name}
            </span>
            <span className="text-[20px] leading-[30px] text-paper">
              {item.check}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-5">
        <div className="flex items-center gap-4 rounded-xl border border-line bg-panel px-6 py-4">
          <BrowserGlyph size={40} className="text-paper" />
          <span className="text-[20px] leading-[30px] text-paper">
            用不是擁有者的帳號實際打開一次。開一個無痕視窗，就看得到陌生人會看到什麼。
          </span>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-l-[6px] border-ok/55 border-l-ok bg-ok/14 px-6 py-4">
          <SheetGlyph size={40} className="text-paper" />
          <span className="text-[20px] leading-[30px] text-paper">
            網站公開的是畫面，帳目在試算表裡；讀得到帳目的，只有被共用試算表的 Google 帳號。
          </span>
        </div>
      </div>
    </div>
  );
}
