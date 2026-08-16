import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * GitHub Pages 的子路徑，必須跟「發佈用儲存庫」的名稱一致。
   *
   * 這裡刻意不寫死：本儲存庫只是產生器的原始碼、不發佈（見 README 的儲存庫政策），
   * 真正要部署的是另外開的那個 repo，而它叫什麼只有那邊知道。
   *
   *   本機開發 / 自訂網域 → 不用設，預設 '/'
   *   要發佈到 GitHub Pages → 建置時給 VITE_BASE，例如：
   *     VITE_BASE=/2026-react-course-slides/ pnpm build
   *
   * 前後的斜線都要有，少了會讓資源路徑接錯。
   */
  base: process.env.VITE_BASE ?? '/',
})
