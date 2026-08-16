import { MenuButton } from './MenuButton';

interface SlideHeaderProps {
  title: string;
  stepTitle: string;
  currentStep: number;
  totalSteps: number;
}

export function SlideHeader({
  title,
  stepTitle,
  currentStep,
  totalSteps,
}: SlideHeaderProps) {
  return (
    <header className="flex h-[84px] shrink-0 items-center gap-6 border-b border-line bg-ink-soft px-12">
      <MenuButton />

      <span className="h-9 w-px shrink-0 bg-line" />

      <div className="min-w-0 flex-1">
        <p className="font-display text-[16px] tracking-[0.18em] text-faint uppercase">
          {title}
        </p>
        <h1 className="mt-1 truncate text-[26px] leading-tight font-semibold text-paper">
          {stepTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-baseline gap-2 font-display tracking-[0.14em] tabular-nums">
        <span className="text-[30px] text-acid">
          {String(currentStep).padStart(2, '0')}
        </span>
        <span className="text-[20px] text-faint">
          / {String(totalSteps).padStart(2, '0')}
        </span>
      </div>
    </header>
  );
}
