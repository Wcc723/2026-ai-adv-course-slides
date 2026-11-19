/**
 * 現場投票的連線設定（伺服器在 workers/class5-vote/，部署與重置見那裡的 README.md）。
 *
 * VOTE_WS_URL  投票伺服器的 WebSocket 網址（結尾是 /ws）。
 *              預設是已部署的 Cloudflare Worker；build 時可以用環境變數
 *              VITE_VOTE_WS_URL 覆寫（例如本機 `wrangler dev` 的 ws://127.0.0.1:8787/ws）。
 *              設成空字串（這裡的預設值清空）→ 投票列顯示「投票伺服器尚未設定」。
 *
 * VOTE_ROOM    房間名稱。一個房間就是一份獨立的投票，換名稱 ＝ 從零開始。
 *              正式上課用預設的 'class5-2026-b'（2026-11-19 從 'class5-2026' 換過來，
 *              舊房間只有講師自己按的試投票）。測試時在瀏覽器 console 執行
 *                localStorage.setItem('class5-vote-room', 'test-xxx')
 *              重新整理就進測試房間（只影響這個瀏覽器），測完
 *                localStorage.removeItem('class5-vote-room')
 *              ⚠ 不要在正式房間裡測試投票。
 *
 * VITE_* 會被打包進前端，任何人都看得到 —— 這裡只放網址，不放任何密鑰。
 */

const DEFAULT_WS_URL = 'wss://class5-vote.agito723.workers.dev/ws';

export const DEFAULT_VOTE_ROOM = 'class5-2026-b';
export const VOTE_ROOM_STORAGE_KEY = 'class5-vote-room';

/** 跟伺服器的檢查一致：1–64 個英數字、底線或連字號 */
const ROOM_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const envUrl = import.meta.env.VITE_VOTE_WS_URL as string | undefined;

export const VOTE_WS_URL: string = envUrl?.trim() || DEFAULT_WS_URL;

function readRoom(): string {
  try {
    const saved = window.localStorage.getItem(VOTE_ROOM_STORAGE_KEY)?.trim();
    if (saved && ROOM_PATTERN.test(saved)) return saved;
  } catch {
    // 無痕模式或封鎖了網站資料：用預設房間
  }
  return DEFAULT_VOTE_ROOM;
}

export const VOTE_ROOM: string = readRoom();
