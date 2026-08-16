import type { PrismTheme } from 'prism-react-renderer';

/**
 * 對映 theme.css 色票的淺色語法主題。
 *
 * ⚠ 這裡的十個值是全站少數不得不寫死 hex 的地方：prism-react-renderer 產出的是
 *   inline style，CSS 變數到不了，所以 `var(--color-*)` 在這裡無效。
 *   改色票時這個檔案要手動跟著改，右邊註解標的是對應的 token。
 *
 * 對比基準是程式碼井的底色 --color-ink-soft (#e9e5d9)，全部 ≥5.22:1。
 * 十個值全部等於 theme.css 既有的 token 值，所以色票只有一套心智模型。
 */
export const codeTheme: PrismTheme = {
  plain: {
    color: '#211f19', // --color-paper  13.08:1
    backgroundColor: 'transparent', // 實際落在 bg-ink-soft 的程式碼井上
  },
  styles: [
    // 註解是教學時最常唸的內容，不要壓太淡
    {
      types: ['comment', 'prolog', 'cdata', 'doctype'],
      style: { color: '#5c5440', fontStyle: 'italic' }, // --color-faint  5.96:1
    },
    {
      types: ['punctuation', 'operator'],
      style: { color: '#4f4a39' }, // --color-muted  7.03:1
    },
    {
      types: ['tag', 'keyword', 'deleted', 'important'],
      style: { color: '#883a20' }, // --color-coral  6.24:1
    },
    {
      // 字串走松綠而不是主強調的品紅：品紅在這裡出現頻率太高會很吵
      types: ['string', 'attr-value', 'char', 'inserted', 'regex'],
      style: { color: '#126625' }, // --color-lime  5.65:1
    },
    {
      types: ['function', 'function-variable'],
      style: { color: '#095c5a' }, // --color-teal  6.20:1
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: '#2a3796' }, // --color-blue  8.00:1
    },
    {
      types: ['attr-name', 'property', 'variable'],
      style: { color: '#5e4410' }, // --color-amber  7.22:1
    },
    {
      types: ['class-name', 'maybe-class-name'],
      style: { color: '#6c3297' }, // --color-violet  6.56:1
    },
    {
      types: ['selector', 'builtin', 'atrule'],
      style: { color: '#1a6196' }, // --color-sky  5.22:1（十色中最緊的一支）
    },
  ],
};
