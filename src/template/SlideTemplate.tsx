import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SlideTemplateProps } from '../types/slide';
import { isPublic } from '../env';
import { Stage } from '../stage';
import {
  SlideHeader,
  NavigationControls,
  SlideBodyView,
  Watermark,
} from '../components';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // 瀏覽器拒絕全螢幕時安靜略過，不影響簡報進行
  }
}

/**
 * 簡報主版型。
 *
 * 鍵盤操作：
 * - → / ↓ / Space / PageDown：下一步
 * - ← / ↑ / PageUp：上一步
 * - Home / End：第一步 / 最後一步
 * - F：全螢幕、B：黑幕、H：隱藏頁首頁尾（滿版）
 *
 * 目前步驟會同步到網址 `?s=3`，直播中可以直接跳頁或分享特定頁面。
 */
export function SlideTemplate({ title, subtitle, steps }: SlideTemplateProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isBlackout, setIsBlackout] = useState(false);
  const [isChromeHidden, setIsChromeHidden] = useState(false);

  const lastIndex = Math.max(steps.length - 1, 0);
  const parsed = Number.parseInt(searchParams.get('s') ?? '1', 10);
  const currentStepIndex = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed - 1, 0), lastIndex)
    : 0;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), lastIndex);
      setSearchParams({ s: String(clamped + 1) }, { replace: true });
    },
    [lastIndex, setSearchParams],
  );

  const goToPrev = useCallback(
    () => goTo(currentStepIndex - 1),
    [currentStepIndex, goTo],
  );
  const goToNext = useCallback(
    () => goTo(currentStepIndex + 1),
    [currentStepIndex, goTo],
  );

  useEffect(() => {
    /** 回傳 true 表示這個鍵有被簡報接手 */
    const handleKey = (key: string): boolean => {
      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          goToNext();
          return true;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          goToPrev();
          return true;
        case 'Home':
          goTo(0);
          return true;
        case 'End':
          goTo(lastIndex);
          return true;
        case 'f':
        case 'F':
          void toggleFullscreen();
          return true;
        case 'b':
        case 'B':
          setIsBlackout(true);
          return true;
        case 'h':
        case 'H':
          setIsChromeHidden((hidden) => !hidden);
          return true;
        default:
          return false;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // 黑幕時吃掉所有按鍵，任何鍵都用來離開黑幕
      if (isBlackout) {
        event.preventDefault();
        setIsBlackout(false);
        return;
      }

      // 範例裡有輸入框，打字時不要觸發翻頁
      if (isTypingTarget(event.target)) return;

      if (handleKey(event.key)) event.preventDefault();
    };

    // html 版型的 iframe 會把按鍵轉發過來（焦點在 iframe 裡時父層收不到 keydown）
    const handleMessage = (event: MessageEvent) => {
      const data: unknown = event.data;
      if (
        typeof data !== 'object' ||
        data === null ||
        (data as { type?: unknown }).type !== 'slide-key'
      ) {
        return;
      }

      const key = (data as { key?: unknown }).key;
      if (typeof key !== 'string') return;

      if (isBlackout) {
        setIsBlackout(false);
        return;
      }

      handleKey(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [goTo, goToNext, goToPrev, isBlackout, lastIndex]);

  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return (
      <Stage>
        <div className="grid size-full place-items-center text-[24px] text-muted">
          沒有可顯示的步驟
        </div>
      </Stage>
    );
  }

  return (
    <>
      <Stage>
        <div className="relative flex size-full flex-col bg-ink">
          {!isChromeHidden && (
            <SlideHeader
              title={subtitle ? `${title} · ${subtitle}` : title}
              stepTitle={currentStep.title}
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
            />
          )}

          <main className="min-h-0 flex-1 px-12 py-9">
            {/* key 一變就重新掛載並播放 CSS 進場動畫，沒有退場等待 */}
            <div
              key={currentStep.id}
              className="slide-enter flex h-full min-h-0 flex-col gap-6"
            >
              {currentStep.description && (
                <p className="max-w-[1560px] shrink-0 text-[24px] leading-relaxed text-muted">
                  {currentStep.description}
                </p>
              )}
              <div className="min-h-0 flex-1">
                <SlideBodyView body={currentStep.body} />
              </div>
            </div>
          </main>

          {!isChromeHidden && (
            <NavigationControls
              currentStep={currentStepIndex + 1}
              stepTitles={steps.map((step) => step.title)}
              hasPrev={currentStepIndex > 0}
              hasNext={currentStepIndex < lastIndex}
              onPrev={goToPrev}
              onNext={goToNext}
              onGoTo={goTo}
            />
          )}

          {/* 對外版才有。放在 flex 之外的絕對定位，按 H 隱藏頁首頁尾時位置不變 */}
          {isPublic && <Watermark />}
        </div>
      </Stage>

      {isBlackout && (
        <button
          type="button"
          onClick={() => setIsBlackout(false)}
          aria-label="離開黑幕"
          className="fixed inset-0 z-50 cursor-default bg-black"
        />
      )}
    </>
  );
}
