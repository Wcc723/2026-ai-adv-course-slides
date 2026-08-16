import { useLayoutEffect, useState, type ReactNode } from 'react';

/** 舞台基準尺寸：所有版面都以這組座標撰寫 */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/**
 * 固定 1920×1080 的 16:9 舞台，等比縮放並置中於視窗（letterbox）。
 *
 * 這樣做的好處是：投影、直播、錄影、不同解析度的螢幕看到的排版完全一致，
 * 所有子元件都可以直接用舞台像素寫死尺寸，不需要寫 RWD。
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      setScale(
        Math.min(
          window.innerWidth / STAGE_WIDTH,
          window.innerHeight / STAGE_HEIGHT,
        ),
      );
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    /* letterbox 用自己的 token 而不是 bg-ink。目前兩者同值（舞台邊界隱形），
       但保持分開是為了讓「舞台外框」與「頁面底色」可以各自調整 —— 見 theme.css */
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-letterbox">
      {/* 外層是「縮放後」的尺寸，讓置中照常運作；內層才是 1920×1080 的實際舞台 */}
      <div
        className="relative"
        style={{
          width: STAGE_WIDTH * scale,
          height: STAGE_HEIGHT * scale,
        }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
