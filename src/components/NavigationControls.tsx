interface NavigationControlsProps {
  currentStep: number;
  stepTitles: string[];
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

const buttonClass =
  'flex items-center gap-3 rounded-lg border px-6 py-3 text-[20px] transition-colors disabled:cursor-not-allowed disabled:opacity-30';

export function NavigationControls({
  currentStep,
  stepTitles,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onGoTo,
}: NavigationControlsProps) {
  return (
    <nav className="flex h-[76px] shrink-0 items-center gap-8 border-t border-line bg-ink-soft px-12">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className={`${buttonClass} border-line-soft bg-panel text-muted enabled:hover:border-line enabled:hover:text-paper`}
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        上一步
      </button>

      {/*
        進度條：每一段都可以直接點擊跳頁，直播時很好用。
        亮色主題下三態不能只靠亮度階梯——深色版是 acid 最亮 > faint > line，
        亮色版 acid 與 faint 都變深，階梯會塌。所以改成：
        用彩度區分當前段（acid 對頁尾 5.51:1），並給它額外的高度當第二個訊號，
        「現在在哪」就不是只靠顏色。
      */}
      <ol className="flex flex-1 items-center gap-1.5">
        {stepTitles.map((stepTitle, index) => {
          const position = index + 1;
          const isCurrent = position === currentStep;
          const state = isCurrent
            ? 'h-2.5 bg-acid'
            : position < currentStep
              ? 'h-1.5 bg-faint/60'
              : 'h-1.5 bg-line';

          return (
            <li key={`${stepTitle}-${index}`} className="flex-1">
              <button
                type="button"
                onClick={() => onGoTo(index)}
                title={`${position}. ${stepTitle}`}
                aria-label={`跳到第 ${position} 步：${stepTitle}`}
                aria-current={isCurrent}
                className="group flex w-full items-center py-3"
              >
                <span
                  className={`w-full rounded-full transition-colors group-hover:bg-acid/60 ${state}`}
                />
              </button>
            </li>
          );
        })}
      </ol>

      {/* text-on-accent 而不是 text-ink：以前用 text-ink 只是因為 ink 剛好是近黑，
          是巧合不是設計。hover 用 brightness 而不是手調的 hex，換色票不用跟著改 */}
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={`${buttonClass} border-acid bg-acid font-semibold text-on-accent enabled:hover:brightness-125`}
      >
        下一步
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
