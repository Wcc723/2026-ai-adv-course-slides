import type { Step } from '../../types/slide';
import { assets } from '../../assets/manifest';
import { PaletteDemo, SplitRatioDemo } from './demos';
import { RequestFlowDiagram } from './diagrams';

export const slideTitle = '簡報版型示範';
export const slideSubtitle = 'Reference Deck';

export const steps: Step[] = [
  {
    id: 'cover',
    title: '封面',
    body: {
      kind: 'title',
      kicker: 'Slide System',
      heading: '簡報版型示範',
      lead: '這份簡報同時是版型的參考標準與活文件。每一頁對應一種 SlideBody，開新課程時直接複製這個資料夾當起點。',
      assetId: 'planning-copy',
    },
  },

  {
    id: 'layout-kinds',
    title: '九種版型',
    description:
      '一頁投影片的內容由 SlideBody 決定。九種積木涵蓋大部分教學場景，其中 split 可以遞迴組合。',
    body: {
      kind: 'points',
      items: [
        {
          text: 'title — 章節封面',
          note: 'kicker、大標、導言，可選一張素材',
          accent: 'acid',
        },
        {
          text: 'demo — 內嵌 React 互動範例',
          note: '主力版型，講到哪就操作到哪',
          accent: 'teal',
        },
        {
          text: 'html — 內嵌原生 HTML / CSS',
          note: '跑在 sandbox iframe，色票變數已經注入',
          accent: 'coral',
        },
        {
          text: 'diagram — 手繪 SVG 圖解',
          note: '顏色用 var(--color-*)，換色票時自動跟著換',
          accent: 'blue',
        },
        {
          text: 'code / points / assets / table',
          note: '程式碼（多筆自動變分頁）、重點條列、素材展示牆、表格（儲存格可放外部連結）',
          accent: 'lime',
        },
        {
          text: 'split — 左右分割，可巢狀',
          note: '五種比例：1:1、3:2、2:3、2:1、1:2',
          accent: 'violet',
        },
      ],
    },
  },

  {
    id: 'palette',
    title: '專案色票',
    description:
      '色票定義在 src/styles/theme.css，全站只有這一個來源。下方數值是即時從 CSS 變數讀出來的，改了 theme.css 這頁就會跟著變。',
    body: {
      kind: 'demo',
      render: PaletteDemo,
      caption: 'demo 版型：任何有狀態的 React 元件都可以直接放進來',
    },
  },

  {
    id: 'html-embed',
    title: 'HTML 內嵌範例',
    description:
      'html 版型跑在 sandbox iframe 裡，跟簡報本身的樣式完全隔離。專案色票已經以 CSS 變數注入，可以直接使用。',
    body: {
      kind: 'split',
      ratio: '1:1',
      left: {
        kind: 'html',
        caption: '實際執行結果（含 JavaScript）',
        css: `
.card {
  width: 380px;
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--panel);
}
.card h3 { color: var(--acid); font-size: 26px; }
.card p { margin-top: 10px; color: var(--muted); font-size: 18px; }
.card button {
  margin-top: 22px;
  padding: 12px 20px;
  color: var(--ink);
  border: 0;
  border-radius: 8px;
  background: var(--teal);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}
.card output { margin-left: 14px; color: var(--teal); font-size: 20px; }`,
        html: `<div class="card">
  <h3>互動卡片</h3>
  <p>iframe 內可以寫任何 HTML、CSS 與 JavaScript。</p>
  <button id="btn">點我 +1</button>
  <output id="out">0</output>
</div>
<script>
  let count = 0;
  const out = document.getElementById('out');
  document.getElementById('btn').addEventListener('click', () => {
    out.textContent = ++count;
  });
</script>`,
      },
      right: {
        kind: 'code',
        blocks: [
          {
            language: 'typescript',
            filename: 'slides.ts',
            code: `{
  kind: 'html',
  caption: '實際執行結果（含 JavaScript）',
  css: '.card { ... }',
  html: '<div class="card">...</div>',
}

// iframe 內建可用的 CSS 變數：
// --ink  --ink-soft  --panel  --panel-lift
// --line  --paper  --muted
// --acid  --coral  --teal  --blue`,
            highlightLines: [1, 2, 3, 4, 5, 6],
          },
        ],
      },
    },
  },

  {
    id: 'diagram',
    title: 'SVG 圖解',
    description:
      '圖解不畫自己的背景，顏色一律走 CSS 變數。這樣同一份圖解在調色票之後不需要重畫。',
    body: {
      kind: 'diagram',
      render: RequestFlowDiagram,
      caption: 'diagram 版型：src/showcase/版型示範/diagrams.tsx',
    },
  },

  {
    id: 'code',
    title: '程式碼版型',
    description:
      '多筆 codeBlock 會自動變成分頁。highlightLines 可以標出這一頁要講的重點行。',
    body: {
      kind: 'code',
      blocks: [
        {
          language: 'typescript',
          filename: 'slides.ts',
          code: `import type { Step } from '../../types/slide';

export const slideTitle = '課程名稱';

export const steps: Step[] = [
  {
    id: 'unique-id',
    title: '頁首顯示的步驟名稱',
    description: '內容區上方的導言，可省略',
    body: { kind: 'demo', render: MyDemo },
  },
];`,
          highlightLines: [7, 8, 9, 10],
        },
        {
          language: 'tsx',
          filename: 'index.tsx',
          code: `import { SlideTemplate } from '../../template';
import { slideTitle, steps } from './slides';

export function MyCourseSlide() {
  return <SlideTemplate title={slideTitle} steps={steps} />;
}`,
        },
        {
          language: 'tsx',
          filename: 'router.tsx',
          code: `import { MyCourseSlide } from './weekN/課程名稱';

export const router = createHashRouter([
  { path: '/', element: <Home /> },
  { path: '/weekN/my-course', element: <MyCourseSlide /> },
]);`,
          highlightLines: [5],
        },
      ],
    },
  },

  {
    id: 'split',
    title: '分割版型',
    description:
      'split 的 left 與 right 各自又是一個 SlideBody，所以可以再放 split，拼出四宮格之類的版面。',
    body: {
      kind: 'split',
      ratio: '3:2',
      left: {
        kind: 'demo',
        render: SplitRatioDemo,
        caption: '點按鈕切換比例',
      },
      right: {
        kind: 'points',
        heading: '巢狀範例',
        items: [
          { text: '左圖右碼：ratio 1:1', accent: 'teal' },
          { text: '左碼右說明：ratio 2:1', accent: 'blue' },
          {
            text: 'right 再放一個 split',
            note: '就能做出右側上下堆疊的三欄版面',
            accent: 'violet',
          },
        ],
      },
    },
  },

  {
    id: 'assets',
    title: 'SVG 素材庫',
    description:
      '素材放在 src/assets/svg/，在 manifest.ts 補一筆 metadata 就能用 <Asset id="..." /> 取用，id 有型別提示。',
    body: {
      kind: 'assets',
      items: assets.map((asset) => ({ id: asset.id })),
    },
  },

  {
    id: 'table',
    title: '表格版型',
    description:
      'table 版型用來整理規格、對照與資源清單。儲存格可以只寫字串，也可以指定 mono、accent，或給 href 變成新分頁開啟的外部連結。',
    body: {
      kind: 'table',
      heading: '這套簡報系統的技術棧',
      columns: ['項目', '本專案的用法', '官方文件'],
      rows: [
        [
          'React',
          { text: '19 / function component', mono: true },
          { text: 'react.dev', href: 'https://react.dev' },
        ],
        [
          'Vite',
          { text: '7 / @vitejs/plugin-react', mono: true },
          { text: 'vite.dev', href: 'https://vite.dev' },
        ],
        [
          'Tailwind CSS',
          { text: 'v4 / @theme static', mono: true, accent: 'acid' },
          { text: 'tailwindcss.com', href: 'https://tailwindcss.com' },
        ],
        [
          'TypeScript',
          { text: 'strict: true', mono: true },
          {
            text: 'typescriptlang.org',
            href: 'https://www.typescriptlang.org/docs/',
          },
        ],
        [
          '語法高亮',
          { text: 'prism-react-renderer', mono: true },
          {
            text: 'github.com/FormidableLabs',
            href: 'https://github.com/FormidableLabs/prism-react-renderer',
          },
        ],
        [
          '翻頁動畫',
          { text: '.slide-enter（純 CSS）', mono: true, accent: 'teal' },
          { text: 'MDN: CSS animation', href: 'https://developer.mozilla.org/docs/Web/CSS/animation' },
        ],
      ],
      note: '儲存格三種寫法：純字串、{ text, mono: true }、{ text, href }。有 href 的會加上外部連結箭頭，並以 target="_blank" 開新分頁。',
    },
  },

  {
    id: 'shortcuts',
    title: '簡報操作',
    description: '直播與實體授課常用的操作都綁在鍵盤上，滑鼠只是備援。',
    body: {
      kind: 'points',
      heading: '鍵盤快捷鍵',
      items: [
        {
          text: '→ / ↓ / Space / PageDown　下一步',
          note: '簡報筆送出的就是 PageUp / PageDown',
          accent: 'acid',
        },
        { text: '← / ↑ / PageUp　上一步', accent: 'acid' },
        { text: 'Home / End　跳到第一步 / 最後一步', accent: 'blue' },
        {
          text: 'F 全螢幕　B 黑幕　H 隱藏頁首頁尾',
          note: 'H 可以讓內容佔滿整個 16:9 舞台',
          accent: 'teal',
        },
        {
          text: '網址會記住目前步驟（?s=3）',
          note: '直播中可以直接跳頁，或把某一頁的連結貼給學員',
          accent: 'lime',
        },
        {
          text: '範例輸入框內打字不會翻頁',
          note: '游標在 input / textarea 時，方向鍵與空白鍵交還給範例',
          accent: 'violet',
        },
      ],
    },
  },
];
