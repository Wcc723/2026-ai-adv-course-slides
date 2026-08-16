# 課程簡報產生器

教學用的互動式簡報系統。固定 1920×1080 的 16:9 舞台、亮色技術風格（淨白米底 + 墨版文字），內容以內嵌互動範例為主，支援鍵盤翻頁、全螢幕、黑幕與網址記錄步驟。

---

## ⛔ 先讀這個：本儲存庫不發佈簡報

**這裡只有產生器的原始碼，不是任何一份簡報的發佈位置。**

> **這一節只適用於原始儲存庫 `hexschool/2026_course_presentation_builder`。**
> 只要你已經把 `origin` 換成自己的位置，下面的限制全部不適用 ——
> 上傳、更新、部署、要怎麼改都是自由的，防呆腳本也會自動放行，不需要移除它。
>
> ```bash
> git remote get-url origin   # 確認自己在哪
> ```

### 不要把 GitHub Pages 開在這個儲存庫

Pages 開在這裡，「產生器」與「產出的簡報」會綁在同一個網址上，之後每一份新簡報都會互相覆蓋。

`pnpm deploy:pages` 有防呆會直接中止。**不要繞過它** —— 部署相關的決定請先聯絡**卡斯伯（@wcc723）**。

### 要做自己的簡報？請重建一份儲存庫

不要直接 commit 或 push 到這個 repo。把這份專案複製成自己的儲存庫再開發：

```bash
# 1. 取得一份乾淨的副本
git clone git@github.com:hexschool/2026_course_presentation_builder.git my-course-slides
cd my-course-slides

# 2. 重建 git 歷史，換成自己的 remote
rm -rf .git
git init && git add -A && git commit -m "init: 從簡報產生器起始"
git remote add origin git@github.com:<你的帳號>/my-course-slides.git
git push -u origin main
```

用 `rm -rf .git` 重建而不是 fork：歷史乾淨、不會誤推回來，而且發佈用的儲存庫本來就跟產生器的開發歷史無關。

### 在你自己的儲存庫部署

`VITE_BASE` 要設成該儲存庫的名稱（前後斜線都要有），然後在 Settings → Pages 開啟：

```bash
VITE_BASE=/my-course-slides/ pnpm deploy:pages
```

用自訂網域或部署到網站根目錄就不用設，預設是 `/`。

| | 本儲存庫（產生器） | 你自己開的儲存庫 |
| --- | --- | --- |
| 放什麼 | 版型系統、色票、參考範本 | 實際課程的簡報 |
| GitHub Pages | 不開 | 開在這裡 |
| `VITE_BASE` | 不用設 | 設成 repo 名稱 |

---

## 快速開始

```bash
pnpm install
pnpm dev
```

打開 **<http://localhost:5173/#/showcase/layouts>**。

目前只有「簡報版型示範」一份，它同時是版型的參考標準與色票的活文件 —— 九種版型各有一頁實例，開新課程請從 `src/showcase/版型示範/` 複製。

舊的課程簡報留在原專案 `2026-interactive-presentive`，沒有搬過來。

## 指令

```bash
pnpm dev         # 開發伺服器（內部模式，看不到浮水印）
pnpm dev:public  # 對外模式，會顯示六角學院浮水印
pnpm build       # TypeScript 編譯 + Vite 建置
pnpm lint        # ESLint
pnpm preview     # 預覽建置產物
pnpm deploy:pages # 建置並發佈到 GitHub Pages（原始儲存庫會被防呆擋下，見上方政策）
```

浮水印只在對外模式渲染，所以 `pnpm dev` 永遠看不到它 —— 這是設計，不是壞掉。要確認浮水印有沒有壓到內容，用 `pnpm dev:public`。

## 技術

React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · prism-react-renderer

## 文件

| 檔案 | 內容 |
| --- | --- |
| [docs/readme-presentation.md](docs/readme-presentation.md) | 撰寫簡報、色票規範、SVG 素材與圖解慣例 |
| [CLAUDE.md](CLAUDE.md) | 專案慣例摘要（給 Claude Code 讀的） |
| `.claude/skills/interactive-slide-deck/` | 新增簡報的完整流程、視覺硬規則、生圖與稽核腳本 |

## 鍵盤操作

| 按鍵 | 動作 |
| --- | --- |
| `→` `↓` `Space` `PageDown` | 下一步 |
| `←` `↑` `PageUp` | 上一步 |
| `Home` / `End` | 第一步 / 最後一步 |
| `F` | 全螢幕 |
| `B` | 黑幕 |
| `H` | 隱藏頁首頁尾（滿版） |

簡報筆送出的就是 `PageUp` / `PageDown`。目前步驟記在網址 `?s=3`，可以直接跳頁或分享單頁連結。
