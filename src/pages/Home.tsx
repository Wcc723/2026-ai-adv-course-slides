import { Link } from 'react-router-dom';
import {
  courses,
  getAllSeries,
  getAllWeeks,
  getCoursesBySeries,
  getCoursesByWeek,
  getReferenceCourses,
  type Course,
} from '../data/courses';

const shortcuts = [
  { keys: '→ / Space / PageDown', action: '下一步' },
  { keys: '← / PageUp', action: '上一步' },
  { keys: 'Home / End', action: '第一步 / 最後一步' },
  { keys: 'F', action: '全螢幕' },
  { keys: 'B', action: '黑幕' },
  { keys: 'H', action: '隱藏頁首頁尾' },
];

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={course.path}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-line bg-panel px-7 py-6 transition-colors hover:border-acid/55 hover:bg-panel-lift"
    >
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-paper transition-colors group-hover:text-acid">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 text-sm text-muted">{course.description}</p>
        )}
      </div>
      <svg
        className="size-5 shrink-0 text-faint transition-transform group-hover:translate-x-1 group-hover:text-acid"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function SectionHeading({ label, note }: { label: string; note?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-4">
      <h2 className="font-display text-lg tracking-[0.16em] text-paper uppercase">
        {label}
      </h2>
      {note && <span className="text-sm text-faint">{note}</span>}
    </div>
  );
}

export function Home() {
  const weeks = getAllWeeks();
  const series = getAllSeries();
  const references = getReferenceCourses();

  return (
    <div className="min-h-full overflow-auto bg-ink px-8 py-16">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-line pb-10">
          <p className="font-display text-sm tracking-[0.2em] text-acid uppercase">
            Interactive Presentation
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-paper">
            AI 開發進化營
          </h1>
          {/* 版型示範是 internalOnly 的，對外版沒有那一份，這句話就不能提它 */}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            固定 1920×1080 的 16:9 舞台，內容以內嵌互動範例為主。選一份簡報開始
            {references.length > 0 ? '，或先看版型示範了解可用的版型與色票。' : '。'}
          </p>
        </header>

        {references.length > 0 && (
          <section className="mt-12">
            <SectionHeading label="參考範本" note="開新課程請從這裡複製" />
            <div className="grid gap-4">
              {references.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {series.map((name) => (
          <section key={name} className="mt-12">
            <SectionHeading label={name} />
            <div className="grid gap-4">
              {getCoursesBySeries(name).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))}

        {weeks.map((week) => (
          <section key={week} className="mt-12">
            <SectionHeading label={`Week ${week}`} />
            <div className="grid gap-4">
              {getCoursesByWeek(week).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))}

        {courses.length === 0 && (
          <p className="mt-12 text-center text-muted">目前沒有可用的課程</p>
        )}

        <section className="mt-16 rounded-2xl border border-line bg-panel px-7 py-6">
          <SectionHeading label="鍵盤操作" />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2"
              >
                <dt className="font-mono text-sm text-paper">{shortcut.keys}</dt>
                <dd className="text-sm text-muted">{shortcut.action}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-faint">
            目前步驟會記在網址（?s=3），可以直接跳頁或把單頁連結分享出去。
          </p>
        </section>
      </div>
    </div>
  );
}
