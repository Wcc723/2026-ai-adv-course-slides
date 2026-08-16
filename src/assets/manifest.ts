/**
 * SVG 素材庫
 *
 * 新增素材的步驟：
 * 1. 把 512×512 viewBox 的 SVG 放進 `src/assets/svg/<id>.svg`（檔名 = id）
 * 2. 在下方 `assets` 補一筆 metadata
 * 3. 用 `<Asset id="<id>" />` 取用，AssetId 會自動帶出型別提示
 *
 * 素材沿用「直播用簡報工具」的 technical-editorial 風格：
 * 透明底、base stroke #F7F2E7、accent #FF6B5A / #C8F04B / #42D7C2。
 */

const svgUrls = import.meta.glob('./svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export interface AssetMeta {
  /** 穩定識別碼，同時是檔名 */
  id: string;
  /** 繁體中文名稱 */
  name: string;
  /** 這個素材代表什麼 */
  purpose: string;
  /** 搜尋用語意標籤 */
  tags: readonly string[];
}

export const assets = [
  {
    id: 'frontend-web',
    name: '前端網頁',
    purpose: '使用者看到並操作的瀏覽器前端介面',
    tags: ['前端', '網頁', '瀏覽器', 'ui', 'browser'],
  },
  {
    id: 'api-server',
    name: 'API 伺服器',
    purpose: '接收前端請求、執行邏輯並回傳資料的 API 服務',
    tags: ['後端', 'api', '伺服器', '服務', 'server'],
  },
  {
    id: 'database',
    name: '資料庫',
    purpose: '由 API 伺服器讀取與寫入的持久化資料儲存層',
    tags: ['資料庫', '儲存', 'sql', '資料層', 'database'],
  },
  {
    id: 'chat-mode',
    name: 'Chat 對話',
    purpose: '透過來回對話提出問題、討論與腦力激盪',
    tags: ['chat', '對話', '討論', '問答'],
  },
  {
    id: 'work-mode',
    name: 'Work 成果',
    purpose: '把目標與素材整理成可檢查的成果',
    tags: ['work', '任務', '成果', '交付物'],
  },
  {
    id: 'codex-mode',
    name: 'Codex 開發',
    purpose: '使用開發者工具、程式碼與技術細節進入專案實作',
    tags: ['codex', '程式碼', '開發', '終端機'],
  },
  {
    id: 'planning-copy',
    name: '網站企劃文案',
    purpose: '整理網站企劃、內容架構與完整文案',
    tags: ['企劃', '文案', '文件', '規劃'],
  },
  {
    id: 'site-files-edit',
    name: '網站檔案編輯',
    purpose: '在本機網站資料夾建立與修改程式檔案',
    tags: ['網站', '資料夾', '檔案', '編輯'],
  },
  {
    id: 'local-folder',
    name: '本機資料夾',
    purpose: '桌面工作區中經授權可讀取的本機資料夾與檔案',
    tags: ['本機', '資料夾', '工作區', '專案'],
  },
  {
    id: 'terminal-tools',
    name: '本機工具',
    purpose: '在本機終端機執行命令與開發工具',
    tags: ['終端機', '命令', '工具', 'shell'],
  },
  {
    id: 'website-inspection',
    name: '網站檢查',
    purpose: '打開網站、檢查畫面與驗證互動結果',
    tags: ['網站', '檢查', '預覽', '測試'],
  },
  {
    id: 'authorized-app',
    name: '授權應用程式',
    purpose: '在使用者允許的權限範圍內操作桌面應用程式',
    tags: ['應用程式', '授權', '權限', '桌面'],
  },
] as const satisfies readonly AssetMeta[];

export type AssetId = (typeof assets)[number]['id'];

const assetById = new Map(assets.map((asset) => [asset.id, asset]));

export function getAsset(id: AssetId): AssetMeta {
  const asset = assetById.get(id);
  if (!asset) {
    throw new Error(`找不到素材：${id}`);
  }
  return asset;
}

export function assetUrl(id: AssetId): string {
  const url = svgUrls[`./svg/${id}.svg`];
  if (!url) {
    throw new Error(`找不到素材檔案：src/assets/svg/${id}.svg`);
  }
  return url;
}
