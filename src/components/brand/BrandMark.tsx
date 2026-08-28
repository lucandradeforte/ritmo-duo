import type { ImgHTMLAttributes } from 'react';
import { resolvePublicAssetPath } from '@/utils/public-asset';

export interface BrandMarkProps extends ImgHTMLAttributes<HTMLImageElement> {
  title?: string;
}

export function BrandMark({ title, ...props }: BrandMarkProps) {
  return (
    <img
      src={resolvePublicAssetPath('pwa-icon-v6-192x192.png')}
      alt={title ?? ''}
      {...props}
    />
  );
}
