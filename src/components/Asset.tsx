import { assetUrl, getAsset, type AssetId } from '../assets/manifest';

interface AssetProps {
  id: AssetId;
  /** 邊長（px），素材設計在 220px 左右最好看 */
  size?: number;
  /** 覆寫替代文字，預設用素材名稱 */
  alt?: string;
  className?: string;
}

/** 從素材庫取用一張 SVG。素材為透明底，直接放在深色面板上即可。 */
export function Asset({ id, size = 220, alt, className = '' }: AssetProps) {
  const meta = getAsset(id);

  return (
    <img
      src={assetUrl(id)}
      alt={alt ?? meta.name}
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      draggable={false}
    />
  );
}
