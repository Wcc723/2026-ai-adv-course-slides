import { isInternal } from '../env';

export interface Course {
  id: string;
  title: string;
  path: string;
  description?: string;
  /** 週次。既沒有週次也沒有系列的視為參考範本 */
  week?: number;
  /** 系列名稱。用來收納不屬於週次的成套簡報 */
  series?: string;
}

/**
 * 只在內部版出現的簡報。**目前是空的**，機制本身完整保留著。
 *
 * 版型示範原本放在這裡，後來改成公開：它只是版型與色票的參考標準，沒有不能給人
 * 看的內容；而且擺在內部版有個實際的壞處 —— 浮水印只在對外版渲染，內部版永遠
 * 看不到，等於這個 repo 沒有任何一頁能驗證浮水印會不會壓到內容。
 *
 * 要放不公開的簡報時：往這個陣列加一筆，同時在 `src/router.tsx` 的
 * `internalOnlyRoutes` 加對應路由。`isInternal` 是 build 時就被換成字面值的常數
 * （見 `src/env.ts`），所以對外版的產物裡這個三元運算式會被靜態求值成 `[]` ——
 * 連標題與路徑都不會出現在 JS 裡，不是「濾掉不顯示」而是根本沒被打包進去。
 *
 * 兩邊沒有自動關聯：這裡少一筆只是選單看不到，那邊少一筆才是路由連不上。
 */
const internalCourses: Course[] = isInternal
  ? [
      // 範例：{ id: 'draft', title: '課程草稿', path: '/internal/draft' }
    ]
  : [];

/**
 * 兩種模式都看得到的簡報。
 *
 * 舊的鐵人賽簡報留在原專案 `2026-interactive-presentive`，這份專案從版型範本
 * 重新開始。新增課程時往這裡加，不必動下面的 helper —— 有 `week` 的會自動歸到
 * Week N，有 `series` 的會自動歸到該系列，兩者都沒有的會被當成參考範本。
 */
const publicCourses: Course[] = [
  {
    id: 'layout-showcase',
    title: '簡報版型示範',
    path: '/showcase/layouts',
    description: '版型、色票與素材庫的參考標準，開新課程請從這份複製',
  },
  {
    id: 'ai-testing',
    title: 'AI 測試實戰－從自動測試到跨專案整合',
    path: '/class3/ai-testing',
    description:
      '跨專案管理、程式碼規範與四種測試，以及把測試交給 GitHub Actions',
    series: '第三堂課',
  },
];

/** 首頁與課程選單看到的清單。對外版就是 `publicCourses` 本身 */
export const courses: Course[] = [...internalCourses, ...publicCourses];

export function getReferenceCourses(): Course[] {
  return courses.filter(
    (course) => course.week === undefined && course.series === undefined,
  );
}

export function getCoursesByWeek(week: number): Course[] {
  return courses.filter((course) => course.week === week);
}

export function getAllWeeks(): number[] {
  const weeks = courses
    .map((course) => course.week)
    .filter((week): week is number => week !== undefined);

  return [...new Set(weeks)].sort((a, b) => a - b);
}

export function getCoursesBySeries(name: string): Course[] {
  return courses.filter((course) => course.series === name);
}

/** 系列名稱，依 courses 的出現順序去重 */
export function getAllSeries(): string[] {
  const series = courses
    .map((course) => course.series)
    .filter((name): name is string => name !== undefined);

  return [...new Set(series)];
}
