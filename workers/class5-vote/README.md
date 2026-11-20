# class5-vote — 第五堂課的現場投票伺服器

〈AI 桌面助理開發實戰－ChatGPT vs Claude〉的功能頁底部有一列 1～5 分的投票，
學員用自己的電腦或手機打開對外網站上的簡報就能投，講師的投影畫面即時看到平均與票數，
最後一頁（第 48 頁）是 17 個功能主題的排行。開場另有兩頁問卷，走同一套協定、不算進排行：

- 第 2 頁「最後一堂課想看哪一類挑戰」：單選（`final-challenge`，score 1～4 是選項編號）
- 第 6 頁「你目前訂閱了哪些方案？」：題一複選（`sub-chatgpt`、`sub-claude`、`sub-google`、`sub-other`），
  題二單選（`sub-budget`，score 1～4 是 $20／$100／$200／$200 以上）。做法見下面「複選怎麼做」

- 前端：`src/class5/AI 桌面助理開發實戰/vote-ui.tsx`（畫面）、`vote-client.ts`（連線）、
  `vote-config.ts`（網址與房間）
- 伺服器：這個資料夾。Cloudflare Worker ＋ 一個 SQLite-backed Durable Object（`VoteRoom`），
  用 WebSocket Hibernation API，沒有人投票時物件會休眠，不佔執行時間

目前部署在：

```
https://class5-vote.agito723.workers.dev
wss://class5-vote.agito723.workers.dev/ws     ← vote-config.ts 的預設值
```

## 路由

| 路由 | 用途 |
| --- | --- |
| `GET /ws?room=<room>&clientId=<id>` | 升級成 WebSocket，交給以 `room` 命名的 Durable Object |
| `GET /state?room=<room>` | 目前的全量狀態（JSON，含 CORS），除錯用 |
| `GET /` | 健康檢查 |

`room` 是 1–64 個英數字、底線或連字號。一個房間就是一份獨立的投票。

## 協定（JSON 文字訊息）

```jsonc
// client → server
{ "type": "vote", "topic": "projects", "score": 4, "clientId": "…" }

// server → client
{
  "type": "state",
  "topics": { "projects": { "counts": [0, 1, 0, 3, 2], "total": 6, "avg": 3.83 }, … },
  "voters": 12,          // 投過至少一票的不同 clientId 數
  "online": 31,          // 目前連線數
  "yours": { "projects": 4 }   // 只有「這個 clientId」收到的版本才有
}
```

- 連線時先送一次全量（帶這個 clientId 的 `yours`）。
- 有人投票就在 250ms 後廣播全量（節流，一群人同時投只廣播一次）；連線人數變化 1 秒後廣播。
- 同一個 clientId 對同一個主題再投一次就是改票，票數不會重複算。
- 心跳：client 每 25 秒送字串 `ping`，伺服器自動回 `pong`（`setWebSocketAutoResponse`，不喚醒物件）。
- 不合法的訊息一律安靜丟掉：`topic` 不在白名單（23 個：17 個評分主題、單選 `final-challenge`、
  第 6 頁的 5 個 `sub-*`，與 `vote-topics.ts` 的 `ALL_TOPIC_IDS` 一致）、
  `score` 不是 1–5 的整數、`clientId` 不是 8–64 個 `[A-Za-z0-9_-]`、
  訊息超過 512 字元、二進位訊息、連線時帶的 clientId 跟訊息裡的不一樣、
  同一條連線 10 秒內超過 30 則。一個房間最多記 5000 個不同的 clientId。

> 增刪主題時，`src/index.ts` 的 `TOPICS` 與前端 `vote-topics.ts` 要一起改，再重新部署。
> **2026-11-18 加了 `mini-pet` 與 5 個 `sub-*`：已部署的 Worker 要重新 `npx wrangler deploy`
> 才收得到這 6 個主題的票**（沒部署之前，前端按下去只會顯示「你投的」，票數不會動）。

### 單選、複選怎麼做（協定不變）

伺服器只認「一個 clientId 對一個主題記一個 1–5 的分數」，再投一次就是改票。
評分以外的題目都借這個規則：

| 題型 | 主題 | score 的意思 | 畫面顯示 |
| --- | --- | --- | --- |
| 1～5 分評分 | 17 個功能主題 | 分數 | 平均、票數、五格分佈 |
| 單選 | `final-challenge`、`sub-budget` | 第幾個選項（1–4） | `counts[0..3]` 是各選項票數 |
| 複選 | `sub-chatgpt`、`sub-claude`、`sub-google`、`sub-other`（每個選項一個主題） | 1 ＝ 有勾、2 ＝ 取消勾選 | `counts[0]` 是勾選人數；`counts[1]` 是勾過又取消的，不顯示 |

複選的「取消」是改票成 2，不是刪掉那一票，所以 `voters`（投過至少一票的人數）不會因為取消而減少。

## 重置投票（換房間）

沒有「清空」的 API —— 刻意不放，因為那需要一組密鑰，而前端的東西任何人都看得到。
**換一個房間名稱就是一份全新的、空的投票**：

1. 改 `src/class5/AI 桌面助理開發實戰/vote-config.ts` 的 `DEFAULT_VOTE_ROOM`
   （2026-11-19 已經換過一次：`'class5-2026'` → `'class5-2026-b'`，下次可以換成 `'class5-2026-c'`）
2. 重新部署簡報網站。學員重新整理頁面就會進新房間；已經開著的分頁要重新整理才會換過去

舊房間的資料會留著（每個房間只有幾 KB），隨時可以用 `/state?room=舊名稱` 回頭查。

### 測試時用自己的房間

**不要在正式房間 `class5-2026-b` 裡測試投票。** 在瀏覽器 console：

```js
localStorage.setItem('class5-vote-room', 'test-1')   // 進測試房間
localStorage.removeItem('class5-vote-room')                 // 回正式房間
```

重新整理後生效，只影響這個瀏覽器。第 2、6 頁與投票結果頁（第 48 頁）在測試房間時會顯示「測試房間：…」。

## 部署

需要 Cloudflare 帳號（Free 方案就能用 SQLite-backed Durable Object）。不用安裝任何套件，
直接用 `npx` 跑 wrangler，不要把 wrangler 加進根目錄的 `package.json`。

```bash
cd workers/class5-vote
npx wrangler whoami          # 確認登入的帳號；沒登入就 npx wrangler login
npx wrangler deploy          # 第一次部署會套用 migrations（建立 VoteRoom 類別）
```

部署完會印出 `https://class5-vote.<你的子網域>.workers.dev`。把它改成
`wss://class5-vote.<你的子網域>.workers.dev/ws` 填進 `vote-config.ts` 的 `DEFAULT_WS_URL`。
不想改程式也可以在 build 時給環境變數 `VITE_VOTE_WS_URL`。
`DEFAULT_WS_URL` 清成空字串、又沒給環境變數時，投票列會顯示「投票伺服器尚未設定」，按鈕停用。

這個 Worker 沒有任何 secret，也沒有綁其他 Cloudflare 資源。

`wrangler.jsonc` 用的是 `migrations` ＋ `new_sqlite_classes`。Cloudflare 現在也支援用
`exports` 宣告 Durable Object 類別，但兩種寫法互斥，而且用 `exports` 部署過就不能改回來，
所以維持 `migrations`。

看即時 log：

```bash
npx wrangler tail class5-vote
```

## 本機測試

```bash
cd workers/class5-vote
npx wrangler dev --port 8787          # 本機的 Durable Object，資料存在 .wrangler/state
```

另開一個終端機，讓簡報連本機伺服器：

```bash
VITE_VOTE_WS_URL=ws://127.0.0.1:8787/ws pnpm dev
```

或直接看狀態：

```bash
curl "http://127.0.0.1:8787/state?room=test-local"
```

用 Node 22 以上內建的 `WebSocket` 就能寫測試腳本（連兩個 client、投票、看廣播、改票、
送非法訊息確認被丟掉）。腳本不要放進 repo。

## 型別檢查

`worker-configuration.d.ts` 是 `wrangler types` 產生的（約 600 KB），沒有進版控：

```bash
cd workers/class5-vote
npx wrangler types                                   # 改過 wrangler.jsonc 也要重跑
cd ../..
pnpm exec tsc -p workers/class5-vote/tsconfig.json   # 用根目錄的 typescript
```

根目錄的 `pnpm lint` 會掃到 `workers/**/src`；`.wrangler/` 與產生的型別檔已經加進
`eslint.config.js` 的 `globalIgnores`。
