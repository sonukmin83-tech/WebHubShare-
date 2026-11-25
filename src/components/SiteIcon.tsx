import React, { useState } from 'react';
import { getGrad, getInitials } from '../lib/validation';

interface SiteIconProps {
  name: string;
  logo?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const SIZE_CLASSES: Record<NonNullable<SiteIconProps['size']>, string> = {
  sm: 'w-[52px] h-[52px] rounded-[15px] text-xl',
  md: 'w-16 h-16 rounded-[18px] text-2xl',
  lg: 'w-[88px] h-[88px] rounded-[24px] text-3xl',
  full: 'w-full aspect-square rounded-[24%] text-3xl',
};

export const SiteIcon: React.FC<SiteIconProps> = ({ name, logo, size = 'md' }) => {
  const [failed, setFailed] = useState(false);
  const [c1, c2] = getGrad(name);
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size];

  if (!logo || failed) {
    return (
      <div
        className={`${sizeClass} grid place-items-center font-bold text-white shrink-0 select-none`}
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} relative grid place-items-center overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0`}
    >
      <img
        src={logo}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
};
