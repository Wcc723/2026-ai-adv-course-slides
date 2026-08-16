/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * `internal` 代表內部版，其餘值一律當成對外版。
   * 語意與載入規則見 `src/env.ts`，不要直接讀這個變數。
   */
  readonly VITE_DECK_MODE: string;
}
