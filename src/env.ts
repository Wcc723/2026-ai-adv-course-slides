/**
 * 「內部版」與「對外版」兩種模式的唯一開關。
 *
 * 由環境變數 `VITE_DECK_MODE` 決定，值寫在專案根目錄的 .env 檔：
 *
 * | 指令 | 讀到的檔案 | 模式 |
 * | --- | --- | --- |
 * | `pnpm dev` | `.env` + `.env.development` | internal |
 * | `pnpm dev:public` | `.env` + `.env.public` | public |
 * | `pnpm build` / `preview` / `deploy` | `.env` | public |
 *
 * 兩種模式的差別：
 * - internal：參考範本會出現在首頁與路由，簡報不加浮水印
 * - public：只留下對外的簡報，每一頁加上六角學院浮水印
 *
 * `import.meta.env.VITE_DECK_MODE` 是 Vite 在 build 時就替換成字面值的常數，
 * 不是執行期判斷，所以對外產物裡 internal 的路由與元件會被整個 tree-shake 掉，
 * 不是「連不到」而是根本沒被打包進去。這也表示 `.env` 一定要留著這個變數：
 * 少了它 Vite 就換不掉，整段會退回執行期判斷，內部簡報反而會被打包出去。
 *
 * 判斷式刻意寫成「等於 internal 才算內部版」而不是反過來，
 * 這樣萬一變數沒讀到，結果會偏向對外版（少幾份簡報），而不是把內部簡報漏出去。
 */
export const isInternal = import.meta.env.VITE_DECK_MODE === 'internal';

/** 對外版：production build 與 `pnpm dev:public` */
export const isPublic = !isInternal;
