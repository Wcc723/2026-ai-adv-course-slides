/**
 * 部署防呆 —— 擋下「從原始儲存庫直接發佈 GitHub Pages」。
 *
 * 判斷依據只有一個：`git remote get-url origin`。
 *
 *   origin 是 SOURCE_REPOS 其中之一 → 中止，連 build 都不會跑
 *   origin 是**其他任何位置**       → 直接放行，不做任何限制
 *
 * 也就是說：只要你把專案搬到自己的儲存庫，上傳、更新、部署都是自由的，
 * 這支腳本不會擋你，也不需要移除它。
 *
 * ⚠ 不要為了繞過它而刪掉這個檔案或改 package.json。
 *   真的需要例外時用下面的環境變數，那樣至少會留下痕跡。
 */
import { execSync } from 'node:child_process';

/** 原始儲存庫。這裡列出的 repo 一律不准部署 */
const SOURCE_REPOS = ['hexschool/2026_course_presentation_builder'];

/** 例外開關。僅限儲存庫維護者，而且要真的確定 */
const OVERRIDE = 'ALLOW_SOURCE_REPO_DEPLOY';

const CONTACT = '卡斯伯（@wcc723）';

/** 把 git@github.com:owner/repo.git 與 https://github.com/owner/repo 都收斂成 owner/repo */
function normalize(url) {
  return url
    .trim()
    .replace(/\.git$/, '')
    .replace(/^git@[^:]+:/, '')
    .replace(/^ssh:\/\/git@[^/]+\//, '')
    .replace(/^https?:\/\/[^/]+\//, '')
    .toLowerCase();
}

function originUrl() {
  try {
    return execSync('git remote get-url origin', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    // 沒有 origin（例如剛 git init）—— 沒有可部署的目標，不擋
    return null;
  }
}

const url = originUrl();

if (url === null) {
  console.log('[deploy] 找不到 origin，略過原始儲存庫檢查。');
  process.exit(0);
}

const repo = normalize(url);

if (!SOURCE_REPOS.includes(repo)) {
  // 已經是自己的儲存庫了 —— 上傳、更新、部署都自由，這裡不做任何限制
  console.log(`[deploy] origin = ${repo}（非原始儲存庫），放行。`);
  process.exit(0);
}

if (process.env[OVERRIDE] === '1') {
  console.warn('');
  console.warn(`⚠️  ${OVERRIDE}=1 —— 正在從原始儲存庫 ${repo} 部署。`);
  console.warn('   這違反本專案的儲存庫政策，請確認你真的是維護者而且確定要這麼做。');
  console.warn('');
  process.exit(0);
}

console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⛔  已中止：不要從這個儲存庫部署 GitHub Pages

  origin = ${repo}

  這個儲存庫是**簡報產生器的原始碼**，不是簡報的發佈位置。
  把 Pages 開在這裡會讓「產生器」與「產出的簡報」綁在同一個網址上，
  之後每一份新簡報都會互相覆蓋。

  要發佈簡報，請這樣做：

    1. 另外開一個儲存庫，例如 your-org/2026-react-course-slides
    2. 把這份專案複製過去，重建 git 歷史、換成自己的 remote：

         rm -rf .git
         git init && git add -A && git commit -m "init: 從簡報產生器起始"
         git remote add origin <你自己的 remote>
         git push -u origin main

    3. 用新 repo 的名稱當 VITE_BASE 建置並發佈：

         VITE_BASE=/2026-react-course-slides/ pnpm deploy:pages

    4. 在新儲存庫的 Settings → Pages 開啟

  換成自己的 remote 之後，這支腳本就會放行 ——
  上傳、更新、部署都是自由的，不需要刪掉它。

  部署相關的決定請先聯絡 ${CONTACT}。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

process.exit(1);
