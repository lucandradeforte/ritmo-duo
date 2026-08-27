import type { SVGAttributes } from 'react';

export interface BrandMarkProps extends SVGAttributes<SVGSVGElement> {
  title?: string;
}

export function BrandMark({ title, ...props }: BrandMarkProps) {
  const labelled = Boolean(title);

  return (
    <svg
      viewBox="0 0 512 512"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={title}
      {...props}
    >
      <defs>
        <linearGradient id="brand-surface" x1="72" y1="52" x2="442" y2="464" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b211d" />
          <stop offset="1" stopColor="#090b09" />
        </linearGradient>
        <linearGradient id="brand-lime" x1="84" y1="170" x2="170" y2="350" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c9ff58" />
          <stop offset="1" stopColor="#79d900" />
        </linearGradient>
        <linearGradient id="brand-orange" x1="342" y1="168" x2="430" y2="350" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffb258" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="472" height="472" rx="116" fill="url(#brand-surface)" />
      <rect x="78" y="170" width="70" height="172" rx="30" fill="url(#brand-lime)" />
      <rect x="132" y="196" width="40" height="120" rx="18" fill="#a6ef25" />
      <rect x="364" y="170" width="70" height="172" rx="30" fill="url(#brand-orange)" />
      <rect x="340" y="196" width="40" height="120" rx="18" fill="#ff9738" />
      <path
        d="M158 256h70l25-42 31 84 25-42h45"
        fill="none"
        stroke="#f5f8f2"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="256" r="10" fill="#b6f43a" />
    </svg>
  );
}
