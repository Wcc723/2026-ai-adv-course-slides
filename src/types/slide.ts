import type { ComponentType } from 'react';
import type { AssetId } from '../assets/manifest';

/** prism-react-renderer 內建支援的語言 */
export type CodeLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx';

export interface CodeBlock {
  language: CodeLanguage;
  code: string;
  /** 顯示在程式碼上方的檔名（也是多分頁時的標籤） */
  filename?: string;
  /** 需要強調的行號（1 起算） */
  highlightLines?: number[];
}

/** 可用於重點條列與圖解的強調色，對應 theme.css 的色票 */
export type Accent =
  | 'acid'
  | 'coral'
  | 'teal'
  | 'blue'
  | 'lime'
  | 'sky'
  | 'violet'
  | 'amber';

export interface PointItem {
  text: string;
  /** 補充說明，顯示在主文下方 */
  note?: string;
  /** 給定時主文渲染成新分頁開啟的外部連結，適合收尾頁要給的延伸資源 */
  href?: string;
  accent?: Accent;
}

export interface AssetItem {
  id: AssetId;
  /** 覆寫素材名稱 */
  label?: string;
  note?: string;
}

/** 表格的單一儲存格。純字串等同於 `{ text }` */
export interface TableCell {
  text: string;
  /** 主文上方的小標，用來標示這一格屬於哪一類（例如技巧名稱） */
  note?: string;
  /** 給定時渲染成新分頁開啟的外部連結 */
  href?: string;
  /** 覆寫文字色，預設一般儲存格 paper、連結儲存格 blue */
  accent?: Accent;
  /** 版本號、檔名、API 名稱這類需要等寬字的內容 */
  mono?: boolean;
}

/** 表格的一列，長度應與 `columns` 一致 */
export type TableRow = (string | TableCell)[];

/** 左右分割的欄寬比例 */
export type SplitRatio = '1:1' | '3:2' | '2:3' | '2:1' | '1:2';

/**
 * 一頁投影片的內容。`split` 可以遞迴組合，用少數積木拼出大部分版面。
 */
export type SlideBody =
  /** 章節封面 */
  | {
      kind: 'title';
      kicker?: string;
      heading: string;
      /** 導言。給陣列就會分成多段 */
      lead?: string | string[];
      /** 素材庫的共用 SVG */
      assetId?: AssetId;
      /** 這份簡報專用的點陣圖，與 assetId 二選一 */
      image?: { src: string; alt: string };
    }
  /** 內嵌的 React 互動範例（主力版型） */
  | { kind: 'demo'; render: ComponentType; caption?: string; bare?: boolean }
  /** 內嵌的原生 HTML/CSS 範例，跑在 sandbox iframe 裡 */
  | { kind: 'html'; html: string; css?: string; caption?: string }
  /** 手繪 SVG 圖解 */
  | { kind: 'diagram'; render: ComponentType; caption?: string }
  /** 程式碼，多筆時自動變成分頁 */
  | { kind: 'code'; blocks: CodeBlock[] }
  /** 重點條列 */
  | { kind: 'points'; heading?: string; items: PointItem[] }
  /** 素材展示牆 */
  | { kind: 'assets'; heading?: string; items: AssetItem[] }
  /** 表格，儲存格可帶外部連結 */
  | {
      kind: 'table';
      heading?: string;
      columns: string[];
      rows: TableRow[];
      note?: string;
    }
  /** 左右分割，可再巢狀 */
  | { kind: 'split'; left: SlideBody; right: SlideBody; ratio?: SplitRatio };

export interface Step {
  id: string;
  /** 顯示在頁首的步驟名稱 */
  title: string;
  /** 顯示在內容區上方的導言 */
  description?: string;
  body: SlideBody;
}

export interface SlideTemplateProps {
  title: string;
  subtitle?: string;
  steps: Step[];
}
