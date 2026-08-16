import { Navigate, createHashRouter, type RouteObject } from 'react-router-dom';
import { isInternal } from './env';
import { Home } from './pages/Home';
import { LayoutShowcaseSlide } from './showcase/版型示範';
import { AiTestingSlide } from './class3/AI 測試實戰';

/**
 * 只在內部版掛載的路由，對應 `src/data/courses.ts` 的 `internalCourses`。
 * **目前是空的**，機制本身完整保留著（理由與用法見 `courses.ts` 的註解）。
 *
 * `isInternal` 是 build 時就被換成字面值的常數（見 `src/env.ts`），所以對外版產物裡
 * 這個三元運算式會被靜態求值成 `[]`，元件連同它的 demos、diagrams
 * 都會被 tree-shake 掉，不只是「連不到」而是根本沒被打包進去。
 *
 * ⚠ tree-shaking 還依賴 `package.json` 的 `sideEffects` 宣告。少了它，Rollup 會把
 *   deck 的 demos / diagrams 當成有副作用而整個保留下來 —— 路由確實連不到，
 *   但程式碼還是進了對外產物。
 *
 * 新增／移除時記得同步 `courses.ts` 的 `internalCourses`，兩邊沒有自動關聯。
 */
const internalOnlyRoutes: RouteObject[] = isInternal
  ? [
      // 範例：{ path: '/internal/draft', element: <DraftSlide /> }
    ]
  : [];

export const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  ...internalOnlyRoutes,
  {
    path: '/showcase/layouts',
    element: <LayoutShowcaseSlide />,
  },
  {
    path: '/class3/ai-testing',
    element: <AiTestingSlide />,
  },
  /*
   * 認不得的網址一律回首頁。沒有這一條的話，react-router 會直接把它內建的
   * 開發者錯誤畫面（「Unexpected Application Error! 💿 Hey developer 👋」）
   * 端到台下 —— 對外版拿掉 internalOnly 的路由之後，舊書籤與分享出去的連結
   * 就會踩到這個。
   */
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
