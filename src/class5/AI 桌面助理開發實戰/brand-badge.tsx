import type { ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉— 介面四頁的品牌貼紙
 *
 *   第 8–10 頁（demos-interface-chatgpt.tsx、demos-interface-codex.tsx）貼「ChatGPT」
 *   第 11 頁（demos-interface-claude.tsx）貼「Claude」
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼有這張貼紙
 * ──────────────────────────────────────────────────────────────
 * 講師 2026-11-18 在 CODD 筆記「簡報調整」（codd://note/note-plus）：
 *   「我可能會沒有辦法注意當前是 ChatGPT 還是 Claude，所以我想要你在畫面左上角稍微超出、
 *    在這個外框的邊緣上面加上明顯的 ChatGPT 或者是 Claude。字可以更大，彩色的也沒有關係」
 * 「外框」是每頁手繪的 App 視窗示意（2px 框的那個視窗）。
 *
 * ──────────────────────────────────────────────────────────────
 * 做法
 * ──────────────────────────────────────────────────────────────
 *   - 一張實心貼紙騎在視窗外框的左上角：往上超出 20、往左超出 14，高 48、寬固定 188，
 *     字 34px 粗體。兩家的貼紙一樣大，四頁的位置、尺寸、樣式完全一致。
 *   - 視窗本身有 overflow-hidden，所以貼紙放在 BrandFrame（視窗外層的 relative 包裝）裡，
 *     不放進視窗。BrandFrame 本身不加任何尺寸，不會撐高根容器（第 11 頁的視窗上方原本只隔 16，
 *     另外加 mt-4 讓出貼紙往上超出的空間，視窗縮 16，見 demos-interface-claude.tsx）。
 *   - 3px panel 色的外環把貼紙跟它壓住的 2px 框線分開（SpotBadge 選中時也是這樣做）。
 *     含外環的範圍：視窗座標 x −17 … 177、y −23 … 31。
 *   - 視窗的標題列要讓位：三個圓點從 x 190 開始（標題列加 TITLEBAR_CLEAR，即 pl-[188px]，
 *     加上 2px 框）。貼紙下緣（含外環）31 仍在標題列（0 … 42）之內，壓不到側欄與編號標註；
 *     第 8 頁側欄最上方的編號 1 從 y 42 開始，跟貼紙隔 11。
 *   - 原本標題列裡的淡色小字「ChatGPT」（第 10 頁）、「Claude」（第 11 頁）拿掉了：
 *     跟貼紙重複，留著會變成「Claude Claude」。
 *   - pointer-events-none、aria-hidden：純標示，不擋任何熱區；視窗本身的 aria-label
 *     已經寫了是哪一家。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色
 * ──────────────────────────────────────────────────────────────
 *   ChatGPT  bg-teal  ＋ text-on-accent   Claude  bg-coral ＋ text-on-accent
 *   on-accent 對這兩支都在 6.47:1 以上（theme.css 的註解）。
 *   這是讓人一眼分出哪一家的聯想色（綠、赭），不是兩家官方的品牌色，也沒有畫任何 logo。
 *   不用 acid：acid 是這幾頁「選取中」的標註色，貼紙用它會被看成也被選到了。
 *   第 9 頁的 teal 是「有／可以」的晶片、第 10 頁的 teal／coral 是 diff 的新增／刪除，
 *   跟貼紙在不同的區塊、形狀也不同（貼紙是 34px 的實心塊），不會混在一起讀。
 *
 * 只被同一份簡報的三個介面檔 import，不跨簡報。
 * ══════════════════════════════════════════════════════════════ */

export type Brand = 'chatgpt' | 'claude';

const BRAND: Record<Brand, { name: string; look: string }> = {
  chatgpt: { name: 'ChatGPT', look: 'bg-teal' },
  claude: { name: 'Claude', look: 'bg-coral' },
};

/** 視窗標題列的左內距：讓三個圓點從貼紙右邊開始 */
export const TITLEBAR_CLEAR = 'pl-[188px]';

function BrandBadge({ brand }: { brand: Brand }) {
  const { name, look } = BRAND[brand];
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-5 -left-3.5 z-30 flex h-12 w-[188px] items-center justify-center rounded-xl font-display text-[34px] leading-none font-bold tracking-[0.01em] whitespace-nowrap text-on-accent shadow-[0_0_0_3px_var(--color-panel)] ${look}`}
    >
      {name}
    </span>
  );
}

/**
 * 包住 App 視窗示意：視窗照原樣放在裡面，貼紙疊在左上角。
 * className 給外層排版用（例如 shrink-0，或 flex-1 讓視窗吃剩下的高度）。
 */
export function BrandFrame({
  brand,
  className = '',
  children,
}: {
  brand: Brand;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <BrandBadge brand={brand} />
    </div>
  );
}
