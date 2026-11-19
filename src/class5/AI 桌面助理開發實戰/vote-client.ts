import { useSyncExternalStore } from 'react';
import { ALL_TOPIC_IDS, type VoteTopicId } from './vote-topics';
import { VOTE_ROOM, VOTE_WS_URL } from './vote-config';

/* ══════════════════════════════════════════════════════════════
 * 現場投票的連線與狀態（vote-ui.tsx 的投票列與投票結果頁共用）
 *
 * - 全份簡報共用「一條」WebSocket：模組層級的 store ＋ useSyncExternalStore。
 *   第一個訂閱者出現時才連線，之後換頁、離開投票頁都不關，所以翻頁不會重連。
 * - 斷線自動重連：指數退避 1、2、4、8 秒，上限 10 秒（加 ±25% 抖動，
 *   避免全班同時重連）。收到伺服器的第一份狀態才把退避歸零。
 * - 心跳：每 25 秒送 'ping'，伺服器自動回 'pong'（不會喚醒 Durable Object）。
 *   60 秒都沒收到任何訊息就當作斷線，直接重連（手機切網路時常見）。
 *   回到分頁（visibilitychange）或網路恢復（online）時立刻重連。
 * - clientId 存 localStorage；拿不到（無痕、封鎖網站資料）就用記憶體裡的隨機 id，
 *   重新整理之後會變成另一個人，這是可以接受的退化。
 * - 投票是樂觀更新：按下去馬上顯示「你投的分數」，伺服器確認（yours）之前
 *   都留在 pending 裡，斷線期間投的票會在重連後補送。
 *   同一個 clientId 對同一個主題再投一次就是改票（由伺服器處理）。
 *
 * 協定見 workers/class5-vote/src/index.ts 的檔頭。
 * ══════════════════════════════════════════════════════════════ */

export type VoteStatus = 'connecting' | 'open' | 'offline' | 'unconfigured';

export type ScoreCounts = readonly [number, number, number, number, number];

export interface TopicStats {
  counts: ScoreCounts;
  total: number;
  avg: number;
}

export interface VoteSnapshot {
  status: VoteStatus;
  /** 收過至少一份伺服器的全量狀態（還沒收到之前，票數一律顯示為「—」） */
  synced: boolean;
  topics: Readonly<Record<VoteTopicId, TopicStats>>;
  /** 這個瀏覽器投過的分數（含還沒被伺服器確認的） */
  yours: Readonly<Partial<Record<VoteTopicId, number>>>;
  /** 投過至少一票的不同 clientId 數 */
  voters: number;
  /** 目前連著投票伺服器的分頁數 */
  online: number;
}

export const VOTE_SCORES = [1, 2, 3, 4, 5] as const;

const CLIENT_ID_KEY = 'class5-vote-client';
const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 10_000;
const HEARTBEAT_MS = 25_000;
const STALE_MS = 60_000;

/* ── clientId ───────────────────────────────────────────── */

function randomId(): string {
  try {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

function loadClientId(): string {
  try {
    const saved = window.localStorage.getItem(CLIENT_ID_KEY);
    if (saved && CLIENT_ID_PATTERN.test(saved)) return saved;
    const created = randomId();
    window.localStorage.setItem(CLIENT_ID_KEY, created);
    return created;
  } catch {
    return randomId();
  }
}

let clientId: string | null = null;

function getClientId(): string {
  clientId ??= loadClientId();
  return clientId;
}

/* ── store ──────────────────────────────────────────────── */

const ZERO: TopicStats = { counts: [0, 0, 0, 0, 0], total: 0, avg: 0 };

function emptyTopics(): Record<VoteTopicId, TopicStats> {
  const topics = {} as Record<VoteTopicId, TopicStats>;
  for (const id of ALL_TOPIC_IDS) topics[id] = ZERO;
  return topics;
}

let snapshot: VoteSnapshot = {
  status: VOTE_WS_URL ? 'connecting' : 'unconfigured',
  synced: false,
  topics: emptyTopics(),
  yours: {},
  voters: 0,
  online: 0,
};

const listeners = new Set<() => void>();

function update(patch: Partial<VoteSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  for (const listener of listeners) listener();
}

/* 連線狀態 */
let socket: WebSocket | null = null;
let started = false;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let lastMessageAt = 0;

/** 伺服器確認過的分數 */
let confirmed: Partial<Record<VoteTopicId, number>> = {};
/** 已經按下、還沒被伺服器確認的分數 */
const pending = new Map<VoteTopicId, number>();

function mergedYours(): Partial<Record<VoteTopicId, number>> {
  const yours = { ...confirmed };
  for (const [topic, score] of pending) yours[topic] = score;
  return yours;
}

/* ── 解析伺服器訊息（不信任任何欄位） ──────────────────── */

const TOPIC_IDS: ReadonlySet<string> = new Set(ALL_TOPIC_IDS);

function isTopicId(value: string): value is VoteTopicId {
  return TOPIC_IDS.has(value);
}

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function parseStats(value: unknown): TopicStats {
  if (typeof value !== 'object' || value === null) return ZERO;
  const raw = (value as { counts?: unknown }).counts;
  if (!Array.isArray(raw) || raw.length !== 5) return ZERO;
  const counts = [
    toCount(raw[0]),
    toCount(raw[1]),
    toCount(raw[2]),
    toCount(raw[3]),
    toCount(raw[4]),
  ] as const;
  const total = counts.reduce((sum, n) => sum + n, 0);
  const weighted = counts.reduce((sum, n, index) => sum + n * (index + 1), 0);
  return { counts, total, avg: total === 0 ? 0 : weighted / total };
}

function handleMessage(text: string) {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return;
  }
  if (typeof data !== 'object' || data === null) return;
  const message = data as Record<string, unknown>;
  if (message.type !== 'state') return;

  const topics = emptyTopics();
  if (typeof message.topics === 'object' && message.topics !== null) {
    for (const [id, stats] of Object.entries(message.topics)) {
      if (isTopicId(id)) topics[id] = parseStats(stats);
    }
  }

  // 帶 yours 的版本是給「這個 clientId」的：以它為準，已確認的 pending 拿掉
  if (typeof message.yours === 'object' && message.yours !== null) {
    const next: Partial<Record<VoteTopicId, number>> = {};
    for (const [id, score] of Object.entries(message.yours)) {
      if (isTopicId(id) && typeof score === 'number' && score >= 1 && score <= 5) {
        next[id] = score;
      }
    }
    confirmed = next;
    for (const [topic, score] of pending) {
      if (confirmed[topic] === score) pending.delete(topic);
    }
  }

  attempt = 0;
  update({
    synced: true,
    topics,
    yours: mergedYours(),
    voters: toCount(message.voters),
    online: toCount(message.online),
  });
}

/* ── 連線 ───────────────────────────────────────────────── */

function socketUrl(): string {
  const url = new URL(VOTE_WS_URL);
  url.searchParams.set('room', VOTE_ROOM);
  url.searchParams.set('clientId', getClientId());
  return url.toString();
}

function sendVote(topic: VoteTopicId, score: number) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify({ type: 'vote', topic, score, clientId: getClientId() }));
  } catch {
    // 送不出去就留在 pending，重連後補送
  }
}

function stopHeartbeat() {
  if (heartbeatTimer !== null) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (Date.now() - lastMessageAt > STALE_MS) {
      dropSocket();
      return;
    }
    try {
      socket.send('ping');
    } catch {
      dropSocket();
    }
  }, HEARTBEAT_MS);
}

/** 放掉目前的連線（不等 close 握手），標成離線並排重連 */
function dropSocket() {
  const current = socket;
  socket = null;
  stopHeartbeat();
  if (current) {
    current.onopen = null;
    current.onmessage = null;
    current.onclose = null;
    current.onerror = null;
    try {
      current.close();
    } catch {
      // 已經關了
    }
  }
  update({ status: 'offline' });
  scheduleReconnect();
}

function scheduleReconnect() {
  if (reconnectTimer !== null) clearTimeout(reconnectTimer);
  const backoff = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
  const wait = Math.min(BACKOFF_MAX_MS, backoff * (0.75 + Math.random() * 0.5));
  attempt = Math.min(attempt + 1, 10);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, wait);
}

function connect() {
  if (!VOTE_WS_URL || socket) return;

  let next: WebSocket;
  try {
    next = new WebSocket(socketUrl());
  } catch {
    update({ status: 'offline' });
    scheduleReconnect();
    return;
  }

  socket = next;
  if (snapshot.status !== 'connecting') update({ status: 'connecting' });

  next.onopen = () => {
    if (socket !== next) return;
    lastMessageAt = Date.now();
    update({ status: 'open' });
    for (const [topic, score] of pending) sendVote(topic, score);
    startHeartbeat();
  };

  next.onmessage = (event: MessageEvent) => {
    if (socket !== next) return;
    lastMessageAt = Date.now();
    if (typeof event.data !== 'string' || event.data === 'pong') return;
    handleMessage(event.data);
  };

  next.onclose = () => {
    if (socket !== next) return;
    socket = null;
    stopHeartbeat();
    update({ status: 'offline' });
    scheduleReconnect();
  };

  // onerror 之後一定會接著 onclose，重連交給 onclose
  next.onerror = () => {};
}

/** 分頁回到前景、網路恢復：不要等退避，馬上重試 */
function reconnectNow() {
  if (!started || !VOTE_WS_URL) return;
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (Date.now() - lastMessageAt > HEARTBEAT_MS) {
      try {
        socket.send('ping');
      } catch {
        dropSocket();
      }
    }
    return;
  }
  if (socket) return; // 正在連
  attempt = 0;
  if (reconnectTimer !== null) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  connect();
}

function ensureStarted() {
  if (started) return;
  started = true;
  if (!VOTE_WS_URL) return;

  window.addEventListener('online', reconnectNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reconnectNow();
  });
  connect();
}

/* ── 對外 API ───────────────────────────────────────────── */

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureStarted();
  return () => {
    // 刻意不在沒有訂閱者時斷線：換到沒有投票列的頁面再回來，不必重連
    listeners.delete(listener);
  };
}

function getSnapshot(): VoteSnapshot {
  return snapshot;
}

/** 目前的投票狀態。第一次呼叫時建立連線 */
export function useVoteState(): VoteSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** 給 React 以外的程式（例如在 Node 裡測連線）用；元件請用 useVoteState */
export { subscribe as subscribeVotes, getSnapshot as getVoteSnapshot };

/** 投票或改票。沒連上時先記著，連上後補送 */
export function castVote(topic: VoteTopicId, score: number) {
  if (!VOTE_WS_URL) return;
  if (!Number.isInteger(score) || score < 1 || score > 5) return;
  pending.set(topic, score);
  update({ yours: mergedYours() });
  sendVote(topic, score);
}
