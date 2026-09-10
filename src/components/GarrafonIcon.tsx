import React from 'react';

interface GarrafonIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  filled?: boolean;
  count?: number;
  className?: string;
  animate?: boolean;
}

export const SingleGarrafon: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  active?: boolean;
  label?: string;
}> = ({ size = 'md', active = true, label }) => {
  const sizeMap = {
    sm: 'w-8 h-12',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
    xl: 'w-24 h-36',
  };

  return (
    <div className={`relative flex flex-col items-center ${sizeMap[size]}`}>
      <svg
        viewBox="0 0 80 110"
        className={`w-full h-full filter drop-shadow-md transition-all duration-300 ${
          active
            ? 'drop-shadow-[0_4px_12px_rgba(14,165,233,0.45)] scale-100'
            : 'opacity-40 grayscale scale-95'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="jugGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#7dd3fc" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="jugWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Cap (Tapa del garrafón) */}
        <rect x="33" y="4" width="14" height="8" rx="2" fill="url(#capGrad)" stroke="#1e40af" strokeWidth="1.5" />
        <rect x="31" y="11" width="18" height="3" rx="1" fill="#3b82f6" />

        {/* Neck (Cuello) */}
        <path d="M32 14 L32 24 L48 24 L48 14 Z" fill="#7dd3fc" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />

        {/* Shoulders and Body (Cuerpo del garrafón 20L) */}
        <path
          d="M32 24 C24 28, 14 36, 14 46 L14 96 C14 102, 20 106, 28 106 L52 106 C60 106, 66 102, 66 96 L66 46 C66 36, 56 28, 48 24 Z"
          fill="url(#jugGlass)"
          stroke="#0284c7"
          strokeWidth="2.5"
        />

        {/* Water fill (Agua pura de manantial Tláloc) */}
        {active && (
          <path
            d="M16 48 Q 28 45, 40 48 T 64 48 L64 96 C64 100, 58 104, 52 104 L28 104 C22 104, 16 100, 16 96 Z"
            fill="url(#jugWater)"
            className="animate-pulse"
          />
        )}

        {/* Horizontal Ridges (Costillas características del garrafón de policarbonato) */}
        <line x1="15" y1="56" x2="65" y2="56" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />
        <line x1="15" y1="70" x2="65" y2="70" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />
        <line x1="15" y1="84" x2="65" y2="84" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />

        {/* Handle indentation or Aztec Chalchihuitl Water Seal */}
        <circle cx="40" cy="70" r="7" fill="#0369a1" stroke="#fde047" strokeWidth="1.5" />
        <circle cx="40" cy="70" r="3" fill="#38bdf8" />

        {/* Glass reflection highlight */}
        <path
          d="M20 48 L20 94"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </svg>
      {label && (
        <span className="mt-1 text-[11px] font-semibold text-cyan-200 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

export const GarrafonDisplay: React.FC<{
  count: number;
  size?: 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}> = ({ count, size = 'lg', showLabel = true }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
        {Array.from({ length: count }, (_, index) => (
          <SingleGarrafon
            key={index}
            size={size}
            active={true}
            label={count === 1 ? 'Garrafón único' : `#${index + 1}`}
          />
        ))}
      </div>
      {showLabel && (
        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>
            {count} {count === 1 ? 'garrafón' : 'garrafones'} ({count * 20} litros)
          </span>
        </div>
      )}
    </div>
  );
};
