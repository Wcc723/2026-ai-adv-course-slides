import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import whiteboardUrl from './images/idea-whiteboard.webp';
import screenshotUrl from './images/idea-screenshot.webp';
import voiceUrl from './images/idea-voice.webp';
import remoteUrl from './images/idea-remote.webp';
import messageUrl from './images/idea-message.webp';
import statuslightUrl from './images/idea-statuslight.webp';
import desktoppetUrl from './images/idea-desktoppet.webp';
import sitereportUrl from './images/idea-sitereport.webp';

/* ══════════════════════════════════════════════════════════════
 * 〈AI 桌面助理開發實戰－ChatGPT vs Claude〉開發屬於自己的工具（二）
 *
 *   第 42 頁  ExtensionAppsDemo  作業靈感：可以替自己做哪些工具（沒有投票 → 720）
 *   前一頁是「社群上的自製工具」（第 41 頁，demos-community-tools.tsx 的 CommunityToolsDemo），
 *   後一頁是講師自己做的 CODD（第 43 頁，demos-claude.tsx 的 CoddDemo）。
 *
 * 這一頁是第 3 頁作業「替自己的開發做一個工具」的靈感牆：只給點子、不給答案，
 * 所以不列現成產品、不寫說明，每個點子只有名字，右邊配一張概念圖。
 *
 * 講師 2026-11-20 指定的八個點子（順序與括號照原文，括號內容放在名字右邊的小字）：
 *   - 白板工具（畫流程、架構給 AI 看）
 *   - 截圖標註
 *   - 語音輸入
 *   - 遠端協作工具
 *   - 自動發訊息（Hook 就能做了）
 *   - 狀態小燈
 *   - 桌寵
 *   - 網站數據報告
 *
 * 版本紀錄（都是 2026-11-20）：
 *   1. 查證過的現成工具清單（三個方向各五個、附官方網址）：講師退回，這一頁要給靈感，不是給答案。
 *   2. 八個點子排成 4 × 2 的卡片牆，每張只有名字。
 *   3. 現在這版：講師要求「左邊是選項、右邊是示意圖，也可以使用 Codex Image 來生成概念圖」，
 *      卡片牆拿掉，改成左邊八個選項、右邊大張概念圖。
 *
 * ──────────────────────────────────────────────────────────────
 * 概念圖（images/idea-*.webp，八張）
 * ──────────────────────────────────────────────────────────────
 * 生成：Codex CLI 的 image_generation（~/.claude/skills/codex-image 的 codex-image.sh），
 *   2026-11-20。原圖 1536 × 1024，縮成 1200 × 800 WebP（每張 41–79 KB）。
 * 共用風格（每張 prompt 的後半段都一樣）：扁平的編輯風向量插畫，深墨線稿 #211F19、
 *   米白紙底 #F4F1E8、奶油色面板 #FFFDF9；強調色只用品紅 #9F257B、松綠 #126625、
 *   深青 #095C5A、群青 #2A3796 和一點赭色 #883A20；3:2 橫幅、主體置中、留白充足；
 *   畫面裡不能有任何文字、數字或標誌，螢幕、文件、對話框裡只畫抽象的灰色線條。
 *   小機器人（頭上有一顆亮點）是八張共用的「AI 助理」角色。
 * 各張的場景（prompt 前半段的大意）：
 *   whiteboard   開發者在大型手寫板上畫架構草圖，一道品紅箭頭把草圖送到 AI 助理旁的程式碼視窗
 *   screenshot   用觸控筆在網頁截圖上圈出錯位的按鈕和破圖、貼便利貼，再丟進 AI 助理的對話框
 *   voice        開發者拿著咖啡對筆電說話，聲波流進提示框變成一行行文字，AI 助理在螢幕邊聽
 *   remote       中間一台電腦開著共用的 AI 寫程式工作階段，咖啡廳、沙發、火車上的隊友用虛線連進來
 *   message      筆電上的進度條跑完打勾，AI 助理把一則訊息沿著品紅虛線送到公園長椅上那個人的手機
 *   statuslight  開發桌上的終端機旁有一座三色小燈（綠、赭黃、品紅），現在亮的是赭黃
 *   desktoppet   戴品紅項圈的圓胖小貓坐在螢幕上緣，因為工作跑完（綠色勾勾）開心地舉旗
 *   sitereport   大螢幕上的網站數據儀表板，AI 助理拿著寫好重點的報告板在旁邊說明，角落有月曆
 * prompt 原文（英文）當時放在生圖的暫存資料夾（ideas/style.txt 與 ideas/prompts.tsv），沒有進 repo；
 *   重製時照上面的場景與共用風格寫成英文，「場景 ＋ 共用風格」接起來丟給 codex-image.sh 即可。
 *
 * ──────────────────────────────────────────────────────────────
 * 互動
 * ──────────────────────────────────────────────────────────────
 * 左邊八個選項一次只選一個（預設 01），點已選的那個不會取消。右邊的圖跟著換。
 * 八張圖疊在同一個畫框裡用 opacity 交叉淡入（CSS transition，不用 JS 動畫函式庫），
 * 切換時不會閃白，畫框尺寸固定，不會跳版。
 * 鍵盤：選項是 radiogroup，聚焦在選項上時 ↑↓（←→ 也可以）換選項、空白鍵與 Enter 選取，
 * 這些按鍵都不往上傳，不會翻頁；滑鼠點完就放掉焦點，方向鍵回到翻頁。
 *
 * ──────────────────────────────────────────────────────────────
 * 尺寸（Panel 內 1744 × 768，根容器 h-[720px] max-w-[1740px]，不捲動）
 * ──────────────────────────────────────────────────────────────
 * 寬度：左 630 ＋ gap 32 ＋ 右畫框 1078 ＝ 1740。
 *   畫框 1078 × 720、邊框 2 → 內框 1074 × 716，剛好 3:2，圖片等比填滿、沒有留邊。
 * 左欄高度：作業一句 2 行 × 38 ＝ 76 ＋ gap 20 ＋ 選項區 624（8 列、列距 8：
 *   (624 − 7 × 8) ÷ 8 ＝ 71）＝ 720，上下和畫框對齊。
 * 選項寬：630 − 左粗條 6 − 邊框 1 − 2 × 20 ＝ 583 可用；
 *   最長的一列「01 白板工具 畫流程、架構給 AI 看」約 420。
 * 字級：作業一句 26、名稱 30、編號 22（semibold）、小字 20。
 * 浮水印在右上角（舞台 x1692–1872、y104–147）：根容器頂端約在舞台 y184，碰不到。
 * ══════════════════════════════════════════════════════════════ */

const FOCUS_RING =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid';

/** 滑鼠點完就放掉焦點（鍵盤觸發的 click detail 是 0，焦點留著） */
function blurAfterClick(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

/* ── 資料（講師原文，不要加說明） ───────────────────────────── */

interface Idea {
  id: string;
  name: string;
  /** 講師原文括號裡的字 */
  sub?: string;
  src: string;
  alt: string;
}

const IDEAS: readonly Idea[] = [
  {
    id: 'whiteboard',
    name: '白板工具',
    sub: '畫流程、架構給 AI 看',
    src: whiteboardUrl,
    alt: '開發者在大型手寫板上畫出架構草圖（使用者、方塊、箭頭、資料庫），一道箭頭把草圖送到旁邊的 AI 助理，筆電上出現一模一樣的架構圖',
  },
  {
    id: 'screenshot',
    name: '截圖標註',
    src: screenshotUrl,
    alt: '開發者拿觸控筆在網頁截圖上圈出破掉的圖片和位置不對的按鈕、貼上便利貼，再把標註好的截圖丟進右邊 AI 助理的對話框',
  },
  {
    id: 'voice',
    name: '語音輸入',
    src: voiceUrl,
    alt: '開發者一手拿著咖啡、對著筆電說話，聲音流進提示框變成一行行文字，AI 助理從螢幕上方探頭聽著',
  },
  {
    id: 'remote',
    name: '遠端協作工具',
    src: remoteUrl,
    alt: '中間的電腦開著同一個 AI 寫程式的工作階段，在咖啡廳用筆電、在沙發上用手機、在火車上用平板的三位隊友用虛線連進來，螢幕上有不同顏色的游標',
  },
  {
    id: 'message',
    name: '自動發訊息',
    sub: 'Hook 就能做了',
    src: messageUrl,
    alt: '桌上筆電的進度條跑完、出現綠色勾勾，AI 助理把一則訊息沿著虛線送到坐在公園長椅上那個人的手機',
  },
  {
    id: 'statuslight',
    name: '狀態小燈',
    src: statuslightUrl,
    alt: '開發桌上的螢幕開著終端機，AI 助理從畫面裡探頭，旁邊有一座綠、黃、桃紅三顆燈的小燈座，現在亮的是黃燈',
  },
  {
    id: 'desktoppet',
    name: '桌寵',
    src: desktoppetUrl,
    alt: '戴著桃紅色項圈的圓胖小貓趴在螢幕上緣，因為螢幕上的工作跑完出現綠色勾勾，開心地舉起小旗子，旁邊有彩帶和星星',
  },
  {
    id: 'sitereport',
    name: '網站數據報告',
    src: sitereportUrl,
    alt: '大螢幕上是網站數據儀表板（上升的折線圖、長條圖、環形圖、世界地圖），AI 助理拿著寫好重點的報告板在旁邊說明，角落有一本月曆',
  },
];

/* ── 選項列 ───────────────────────────────────────────────── */

function IdeaOption({
  idea,
  no,
  on,
  onPick,
}: {
  idea: Idea;
  no: number;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      tabIndex={on ? 0 : -1}
      onClick={(event) => {
        onPick();
        blurAfterClick(event);
      }}
      className={`flex min-h-0 items-center gap-4 rounded-xl border border-l-[6px] px-5 text-left transition-colors duration-200 ${FOCUS_RING} ${
        on ? 'border-acid border-l-acid bg-acid/14' : 'border-line border-l-line bg-panel hover:bg-panel-lift'
      }`}
    >
      <span
        className={`w-[30px] shrink-0 font-display text-[22px] leading-none font-semibold tabular-nums ${
          on ? 'text-paper' : 'text-faint'
        }`}
      >
        {String(no).padStart(2, '0')}
      </span>
      <span className="flex min-w-0 items-baseline gap-4 whitespace-nowrap">
        <span className="text-[30px] leading-[38px] font-semibold text-paper">{idea.name}</span>
        {idea.sub && <span className="text-[20px] leading-none text-muted">{idea.sub}</span>}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 第 42 頁 · ExtensionAppsDemo · 作業靈感：可以替自己做哪些工具
 * ══════════════════════════════════════════════════════════════ */

export function ExtensionAppsDemo() {
  const [pick, setPick] = useState(0);

  /** radiogroup：方向鍵換選項；空白鍵、Enter、方向鍵都不往上傳（不翻頁），其他鍵照常 */
  function onListKey(event: KeyboardEvent<HTMLDivElement>) {
    const { key } = event;
    if (key === ' ' || key === 'Enter') {
      event.stopPropagation();
      return;
    }
    let next = -1;
    if (key === 'ArrowDown' || key === 'ArrowRight') next = (pick + 1) % IDEAS.length;
    else if (key === 'ArrowUp' || key === 'ArrowLeft') next = (pick + IDEAS.length - 1) % IDEAS.length;
    if (next < 0) return;
    event.stopPropagation();
    event.preventDefault();
    setPick(next);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div className="grid h-[720px] w-full max-w-[1740px] grid-cols-[630px_1078px] gap-8">
      {/* ── 左：作業一句＋八個選項 ─────────────────────────── */}
      <div className="flex min-h-0 flex-col gap-5">
        <p className="shrink-0 text-[26px] leading-[38px] text-muted">
          <span className="font-semibold text-paper">第 3 頁的作業</span>：挑一個做做看，
          <br />
          或從這裡延伸出自己的點子。
        </p>

        <div
          role="radiogroup"
          aria-label="作業靈感"
          onKeyDown={onListKey}
          className="grid min-h-0 flex-1 grid-rows-8 gap-2"
        >
          {IDEAS.map((idea, index) => (
            <IdeaOption
              key={idea.id}
              idea={idea}
              no={index + 1}
              on={pick === index}
              onPick={() => setPick(index)}
            />
          ))}
        </div>
      </div>

      {/* ── 右：概念圖（八張疊在一起，交叉淡入） ─────────────── */}
      <div className="relative h-[720px] w-[1078px] overflow-hidden rounded-2xl border-2 border-line bg-ink">
        {IDEAS.map((idea, index) => {
          const on = pick === index;
          return (
            <img
              key={idea.id}
              src={idea.src}
              alt={idea.alt}
              width={1200}
              height={800}
              aria-hidden={!on}
              className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                on ? 'opacity-100' : 'opacity-0'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
