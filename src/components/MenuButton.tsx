import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  courses,
  getAllSeries,
  getAllWeeks,
  getCoursesBySeries,
  getCoursesByWeek,
  getReferenceCourses,
} from '../data/courses';

export function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const weeks = getAllWeeks();
  const series = getAllSeries();
  const references = getReferenceCourses();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="課程選單"
        title="課程選單"
        aria-expanded={isOpen}
        className={`grid size-11 place-items-center rounded-lg border transition-colors ${
          isOpen
            ? 'border-acid/55 bg-acid/14 text-acid'
            : 'border-line-soft bg-panel text-muted hover:border-line hover:text-paper'
        }`}
      >
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        /* 全站唯一的陰影。深色版是 55% 純黑的大範圍暈開——那在深底上才成立；
           紙面上要換成暖墨色、更小的位移與模糊，否則會像一塊髒污 */
        <div className="absolute top-full left-0 z-50 mt-3 w-[340px] overflow-hidden rounded-xl border border-line bg-panel shadow-[0_16px_40px_rgb(58_48_28/16%)]">
          <div className="p-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-4 py-3 text-[18px] text-muted transition-colors hover:bg-panel-lift hover:text-paper"
            >
              課程首頁
            </Link>
          </div>

          {references.length > 0 && (
            <div className="border-t border-line-soft p-2">
              <p className="px-4 py-2 font-display text-[15px] tracking-[0.16em] text-faint uppercase">
                參考範本
              </p>
              {references.map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-3 text-[18px] text-paper transition-colors hover:bg-panel-lift hover:text-acid"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          )}

          {series.map((name) => (
            <div key={name} className="border-t border-line-soft p-2">
              <p className="px-4 py-2 font-display text-[15px] tracking-[0.16em] text-faint uppercase">
                {name}
              </p>
              {getCoursesBySeries(name).map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-3 text-[18px] text-paper transition-colors hover:bg-panel-lift hover:text-acid"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          ))}

          {weeks.map((week) => (
            <div key={week} className="border-t border-line-soft p-2">
              <p className="px-4 py-2 font-display text-[15px] tracking-[0.16em] text-faint uppercase">
                Week {week}
              </p>
              {getCoursesByWeek(week).map((course) => (
                <Link
                  key={course.id}
                  to={course.path}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-3 text-[18px] text-paper transition-colors hover:bg-panel-lift hover:text-acid"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          ))}

          {courses.length === 0 && (
            <p className="p-6 text-center text-[17px] text-faint">尚無課程</p>
          )}
        </div>
      )}
    </div>
  );
}
