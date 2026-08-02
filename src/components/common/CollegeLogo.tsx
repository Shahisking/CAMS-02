import React from 'react';
import aitLogo from '../../assets/images/ait_logo.jpg';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  variant?: 'full' | 'icon-only';
  lightText?: boolean;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'full',
  lightText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Adithya Institute of Technology (AIT) logo */}
      <img
        src={aitLogo}
        alt="Adithya Institute of Technology"
        className={`${sizeMap[size]} shrink-0 drop-shadow-sm select-none object-contain`}
        draggable={false}
      />

      {showText && variant === 'full' && (
        <div className="flex flex-col leading-tight">
          <span className="font-black tracking-tight text-[#F35B1A] font-sans text-sm sm:text-base">
            ADITHYA
          </span>
          <span
            className={`font-extrabold tracking-wider text-[10px] sm:text-xs uppercase font-sans ${
              lightText ? 'text-white' : 'text-[#1C234E] dark:text-slate-100'
            }`}
          >
            INSTITUTE OF TECHNOLOGY
          </span>
        </div>
      )}
    </div>
  );
};
