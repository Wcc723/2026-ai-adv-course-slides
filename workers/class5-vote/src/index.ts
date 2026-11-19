/**
 * 第五堂課〈AI 桌面助理開發實戰－ChatGPT vs Claude〉的現場投票伺服器。
 *
 * 學員在簡報的功能頁底部投 1～5 分，講師的投影畫面即時看到平均與票數。
 * 第 2 頁的挑戰題（單選）與第 6 頁的訂閱調查（複選＋單選）也走同一套協定，
 * 做法見下面 TOPICS 的註解。
 * 一個房間（room）＝ 一個 Durable Object（SQLite-backed），以房間名稱命名；
 * 換一個房間名稱就是一份全新的、空的投票。
 *
 * 路由
 *   GET /ws?room=<room>&clientId=<id>   升級成 WebSocket，交給該房間的 Durable Object
 *   GET /state?room=<room>              目前的全量狀態（JSON，含 CORS，給除錯用）
 *
 * 協定（JSON 文字訊息）
 *   client → server  {type:'vote', topic, score, clientId}
 *   server → client  {type:'state', topics:{[topic]:{counts:[n1..n5], total, avg}},
 *                     voters, online, yours?:{[topic]:score}}
 *   連線時先送一次全量（帶 yours）；之後每次有人投票，節流 250ms 後廣播全量。
 *   投過票的那個 clientId 收到的版本會帶 yours，其他人收到的不帶。
 *   心跳：client 送 'ping'，由 setWebSocketAutoResponse 回 'pong'，不會喚醒物件。
 *
 * 驗證（不合法就安靜丟掉，不回錯誤）
 *   topic 必須在白名單、score 是 1–5 的整數、clientId 是 8–64 個 [A-Za-z0-9_-]、
 *   單則訊息 ≤ 512 字元、每條連線 10 秒內最多 30 則。連線時帶了 clientId 的，
 *   投票訊息裡的 clientId 必須跟連線時的一樣。同一個 clientId 對同一個主題
 *   再投一次就是改票。
 *
 * 參考：Cloudflare Durable Objects 文件（WebSocket Hibernation、SQLite storage、
 * State API），查核日 2026-11-10。
 *   https://developers.cloudflare.com/durable-objects/best-practices/websockets/
 *   https://developers.cloudflare.com/durable-objects/api/state/
 *   https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/
 */

import { DurableObject } from 'cloudflare:workers';

/* ── 白名單：與 src/class5/AI 桌面助理開發實戰/vote-topics.ts 的 ALL_TOPIC_IDS 一致 ──
 * 17 個 1～5 分的功能評分，加上 1 個單選投票 'final-challenge'（score 1～4 是選項編號，
 * 協定不變）。2026-11-10 加上 'antigravity' 與 'final-challenge'；'environments' 一度拿掉，
 * 同日講師要求補回。
 * 2026-11-18（講師 CODD 筆記 codd://note/note-plus）加上 'mini-pet'（評分），以及第 6 頁
 * 訂閱調查的 5 個主題，協定一樣不變：
 *   sub-chatgpt／sub-claude／sub-google／sub-other  複選，每個選項一個主題，
 *                                                   score 1 ＝ 有訂、score 2 ＝ 取消（改票）
 *   sub-budget                                      單選，score 1～4 是選項編號
 * 共 23 個主題。 */

const TOPICS = [
  'projects',
  'smart-ui',
  'computer-use',
  'remote-control',
  'voice-mcp',
  'ai-in-chrome',
  'dot',
  'image-gen',
  'gif',
  'record-replay',
  'sites',
  'mini-pet',
  'artifact',
  'claude-studio',
  'environments',
  'antigravity',
  'codd',
  'final-challenge',
  'sub-chatgpt',
  'sub-claude',
  'sub-google',
  'sub-other',
  'sub-budget',
] as const;

type TopicId = (typeof TOPICS)[number];
const TOPIC_SET: ReadonlySet<string> = new Set(TOPICS);

const ROOM_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const MAX_MESSAGE_CHARS = 512;
/** 一個房間最多記幾個不同的 clientId，避免被亂數 id 灌爆 */
const MAX_VOTERS_PER_ROOM = 5000;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_MESSAGES = 30;
/** 有人投票：最多等這麼久就廣播 */
const VOTE_FLUSH_MS = 250;
/** 只有連線人數變了：可以等久一點 */
const PRESENCE_FLUSH_MS = 1000;
const WS_OPEN = 1;

type Counts = [number, number, number, number, number];

interface TopicStats {
  counts: Counts;
  total: number;
  avg: number;
}

interface StateMessage {
  type: 'state';
  topics: Record<TopicId, TopicStats>;
  voters: number;
  online: number;
  yours?: Partial<Record<TopicId, number>>;
}

interface Attachment {
  clientId: string | null;
}

interface Vote {
  topic: TopicId;
  score: number;
  clientId: string;
}

function isTopic(value: unknown): value is TopicId {
  return typeof value === 'string' && TOPIC_SET.has(value);
}

function parseVote(data: unknown): Vote | null {
  if (typeof data !== 'object' || data === null) return null;
  const { type, topic, score, clientId } = data as Record<string, unknown>;
  if (type !== 'vote') return null;
  if (!isTopic(topic)) return null;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) {
    return null;
  }
  if (typeof clientId !== 'string' || !CLIENT_ID_PATTERN.test(clientId)) return null;
  return { topic, score, clientId };
}

function emptyCounts(): Counts {
  return [0, 0, 0, 0, 0];
}

function readAttachment(ws: WebSocket): Attachment {
  const value = ws.deserializeAttachment() as Attachment | null;
  return value ?? { clientId: null };
}

/* ══════════════════════════════════════════════════════════════
 * Durable Object：一個投票房間
 * ══════════════════════════════════════════════════════════════ */

export class VoteRoom extends DurableObject<Env> {
  /** 每個主題 1–5 分各幾票。以 SQLite 的 tally 表為準，這裡是快取 */
  private tally = new Map<TopicId, Counts>();
  private voterCount = 0;

  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushDue = 0;
  /** 全量狀態變了（票數或連線人數），下次 flush 要廣播給所有人 */
  private sharedDirty = false;
  /** 剛投過票的 clientId，下次 flush 送帶 yours 的版本 */
  private dirtyClients = new Set<string>();
  /** 每條連線的訊息速率。只放記憶體：休眠醒來歸零沒關係 */
  private rate = new WeakMap<WebSocket, { start: number; count: number }>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // 休眠醒來時建構子會再跑一次，所以這裡只做建表與讀取彙總（23 個主題 × 5 分 ≤ 115 列）。
    // sql.exec 是同步的，不需要 blockConcurrencyWhile。
    const sql = ctx.storage.sql;
    sql.exec(
      `CREATE TABLE IF NOT EXISTS votes (
         client_id  TEXT    NOT NULL,
         topic      TEXT    NOT NULL,
         score      INTEGER NOT NULL,
         updated_at INTEGER NOT NULL,
         PRIMARY KEY (client_id, topic)
       )`,
    );
    sql.exec(
      `CREATE TABLE IF NOT EXISTS tally (
         topic TEXT    NOT NULL,
         score INTEGER NOT NULL,
         n     INTEGER NOT NULL,
         PRIMARY KEY (topic, score)
       )`,
    );
    sql.exec(
      `CREATE TABLE IF NOT EXISTS voters (
         client_id TEXT    PRIMARY KEY,
         first_at  INTEGER NOT NULL
       )`,
    );

    for (const row of sql.exec<{ topic: string; score: number; n: number }>(
      'SELECT topic, score, n FROM tally',
    )) {
      if (!isTopic(row.topic) || row.score < 1 || row.score > 5) continue;
      const counts = this.tally.get(row.topic) ?? emptyCounts();
      counts[row.score - 1] = row.n;
      this.tally.set(row.topic, counts);
    }
    this.voterCount = sql
      .exec<{ c: number }>('SELECT COUNT(*) AS c FROM voters')
      .one().c;

    // 心跳不喚醒物件：'ping' 直接由 runtime 回 'pong'
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  /* ── HTTP：WebSocket 升級 ────────────────────────────── */

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const raw = new URL(request.url).searchParams.get('clientId');
    const clientId = raw && CLIENT_ID_PATTERN.test(raw) ? raw : null;

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ clientId } satisfies Attachment);
    server.send(JSON.stringify(this.buildState(clientId)));

    // 連線人數變了：晚一點再廣播，一群人同時連進來時只廣播一次
    this.sharedDirty = true;
    this.scheduleFlush(PRESENCE_FLUSH_MS);

    return new Response(null, { status: 101, webSocket: client });
  }

  /* ── RPC：給 /state 除錯用 ─────────────────────────────── */

  async snapshot(): Promise<StateMessage> {
    return this.buildState(null);
  }

  /* ── WebSocket Hibernation handlers ──────────────────── */

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string' || message.length > MAX_MESSAGE_CHARS) return;

    // 自動回應已經處理 'ping'；物件醒著時保險再回一次
    if (message === 'ping') {
      ws.send('pong');
      return;
    }

    if (!this.withinRate(ws)) return;

    let data: unknown;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    const vote = parseVote(data);
    if (!vote) return;

    const attachment = readAttachment(ws);
    if (attachment.clientId === null) {
      // 連線時沒帶 clientId：第一次投票時綁定，之後就不能換
      ws.serializeAttachment({ clientId: vote.clientId } satisfies Attachment);
    } else if (attachment.clientId !== vote.clientId) {
      return;
    }

    const result = this.applyVote(vote);
    if (result === 'rejected') return;

    this.dirtyClients.add(vote.clientId);
    if (result === 'changed') this.sharedDirty = true;
    this.scheduleFlush(VOTE_FLUSH_MS);
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): Promise<void> {
    void wasClean;
    // compatibility_date ≥ 2026-04-07 會自動回應 close；手動呼叫是保險。
    // 1005／1006 這類保留碼不能傳給 close()，所以包 try。
    try {
      ws.close(code, reason);
    } catch {
      // 已經關了或是保留碼，忽略
    }
    this.sharedDirty = true;
    this.scheduleFlush(PRESENCE_FLUSH_MS);
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    void ws;
    console.error(
      JSON.stringify({ level: 'error', message: 'websocket error', error: String(error) }),
    );
    this.sharedDirty = true;
    this.scheduleFlush(PRESENCE_FLUSH_MS);
  }

  /* ── 投票寫入 ────────────────────────────────────────── */

  private applyVote({ topic, score, clientId }: Vote): 'changed' | 'same' | 'rejected' {
    const sql = this.ctx.storage.sql;
    const previous = sql
      .exec<{ score: number }>(
        'SELECT score FROM votes WHERE client_id = ? AND topic = ?',
        clientId,
        topic,
      )
      .toArray()[0];

    if (previous?.score === score) return 'same';

    let isNewVoter = false;
    if (!previous) {
      isNewVoter =
        sql.exec('SELECT 1 FROM voters WHERE client_id = ?', clientId).toArray().length === 0;
      if (isNewVoter && this.voterCount >= MAX_VOTERS_PER_ROOM) return 'rejected';
    }

    const now = Date.now();
    // 先寫入 SQLite（同一個交易），成功之後才更新記憶體快取
    this.ctx.storage.transactionSync(() => {
      if (isNewVoter) {
        sql.exec('INSERT INTO voters (client_id, first_at) VALUES (?, ?)', clientId, now);
      }
      if (previous) {
        sql.exec(
          'UPDATE votes SET score = ?, updated_at = ? WHERE client_id = ? AND topic = ?',
          score,
          now,
          clientId,
          topic,
        );
        this.bumpTally(topic, previous.score, -1);
      } else {
        sql.exec(
          'INSERT INTO votes (client_id, topic, score, updated_at) VALUES (?, ?, ?, ?)',
          clientId,
          topic,
          score,
          now,
        );
      }
      this.bumpTally(topic, score, 1);
    });

    const counts = this.tally.get(topic) ?? emptyCounts();
    if (previous && previous.score >= 1 && previous.score <= 5) {
      counts[previous.score - 1] = Math.max(0, counts[previous.score - 1] - 1);
    }
    counts[score - 1] += 1;
    this.tally.set(topic, counts);
    if (isNewVoter) this.voterCount += 1;

    return 'changed';
  }

  private bumpTally(topic: TopicId, score: number, delta: number) {
    this.ctx.storage.sql.exec(
      `INSERT INTO tally (topic, score, n) VALUES (?, ?, ?)
       ON CONFLICT (topic, score) DO UPDATE SET n = MAX(0, n + excluded.n)`,
      topic,
      score,
      delta,
    );
  }

  private withinRate(ws: WebSocket): boolean {
    const now = Date.now();
    const entry = this.rate.get(ws);
    if (!entry || now - entry.start > RATE_WINDOW_MS) {
      this.rate.set(ws, { start: now, count: 1 });
      return true;
    }
    entry.count += 1;
    return entry.count <= RATE_MAX_MESSAGES;
  }

  /* ── 狀態與廣播 ──────────────────────────────────────── */

  private onlineCount(): number {
    return this.ctx.getWebSockets().filter((ws) => ws.readyState === WS_OPEN).length;
  }

  private buildState(clientId: string | null, online = this.onlineCount()): StateMessage {
    const topics = {} as Record<TopicId, TopicStats>;
    for (const topic of TOPICS) {
      const counts = [...(this.tally.get(topic) ?? emptyCounts())] as Counts;
      const total = counts.reduce((sum, n) => sum + n, 0);
      const weighted = counts.reduce((sum, n, index) => sum + n * (index + 1), 0);
      const avg = total === 0 ? 0 : Math.round((weighted / total) * 100) / 100;
      topics[topic] = { counts, total, avg };
    }

    const state: StateMessage = { type: 'state', topics, voters: this.voterCount, online };
    if (clientId) state.yours = this.yoursOf(clientId);
    return state;
  }

  private yoursOf(clientId: string): Partial<Record<TopicId, number>> {
    const yours: Partial<Record<TopicId, number>> = {};
    for (const row of this.ctx.storage.sql.exec<{ topic: string; score: number }>(
      'SELECT topic, score FROM votes WHERE client_id = ?',
      clientId,
    )) {
      if (isTopic(row.topic)) yours[row.topic] = row.score;
    }
    return yours;
  }

  /**
   * 節流：已經排了一個更早的 flush 就不再排；新的比較急（投票）就提前。
   * setTimeout 會讓物件在計時期間不休眠，最多 1 秒，可以接受。
   */
  private scheduleFlush(delay: number) {
    const due = Date.now() + delay;
    if (this.flushTimer !== null) {
      if (this.flushDue <= due) return;
      clearTimeout(this.flushTimer);
    }
    this.flushDue = due;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, delay);
  }

  private flush() {
    const sockets = this.ctx.getWebSockets();
    const online = sockets.filter((ws) => ws.readyState === WS_OPEN).length;
    const shared = this.sharedDirty ? JSON.stringify(this.buildState(null, online)) : null;
    const dirty = this.dirtyClients;
    this.sharedDirty = false;
    this.dirtyClients = new Set();

    const personal = new Map<string, string>();
    for (const ws of sockets) {
      if (ws.readyState !== WS_OPEN) continue;
      const { clientId } = readAttachment(ws);
      let payload = shared;
      if (clientId && dirty.has(clientId)) {
        payload = personal.get(clientId) ?? null;
        if (payload === null) {
          payload = JSON.stringify(this.buildState(clientId, online));
          personal.set(clientId, payload);
        }
      }
      if (payload === null) continue;
      try {
        ws.send(payload);
      } catch {
        // 正在關閉的連線，忽略
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
 * Worker：路由
 * ══════════════════════════════════════════════════════════════ */

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method not allowed' }, 405);
    }

    if (url.pathname === '/') {
      return json({ ok: true, service: 'class5-vote', routes: ['/ws?room=', '/state?room='] });
    }

    if (url.pathname !== '/ws' && url.pathname !== '/state') {
      return json({ error: 'not found' }, 404);
    }

    const room = url.searchParams.get('room') ?? '';
    if (!ROOM_PATTERN.test(room)) {
      return json({ error: 'room 必須是 1–64 個英數字、底線或連字號' }, 400);
    }

    const stub = env.VOTE_ROOM.getByName(room);

    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return json({ error: 'expected websocket upgrade' }, 426);
      }
      return stub.fetch(request);
    }

    try {
      return json({ room, ...(await stub.snapshot()) });
    } catch (error) {
      console.error(
        JSON.stringify({ level: 'error', message: 'snapshot failed', room, error: String(error) }),
      );
      return json({ error: 'temporarily unavailable' }, 503);
    }
  },
} satisfies ExportedHandler<Env>;
