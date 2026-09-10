import React from 'react';

/**
 * Mesoamerican Xicalcoliuhqui (Stepped Fret) decorative border band
 */
export const CodexBorder: React.FC<{
  className?: string;
  variant?: 'gold' | 'turquoise' | 'teal' | 'subtle';
}> = ({ className = '', variant = 'turquoise' }) => {
  const colorMap = {
    gold: 'text-amber-400/80 border-amber-500/30',
    turquoise: 'text-cyan-400/80 border-cyan-500/30',
    teal: 'text-teal-400/80 border-teal-500/30',
    subtle: 'text-cyan-600/40 border-cyan-800/30',
  };

  return (
    <div
      className={`w-full overflow-hidden flex items-center justify-center select-none py-1 ${colorMap[variant]} ${className}`}
    >
      <div className="flex items-center space-x-2 text-xs font-mono tracking-widest opacity-80">
        <span>◆</span>
        <span>═</span>
        <span>☲</span>
        <span>☵</span>
        <span>☲</span>
        <span>═</span>
        <span className="font-bold text-sm">≋≋ 𐀏 ≋≋</span>
        <span>═</span>
        <span>☲</span>
        <span>☵</span>
        <span>☲</span>
        <span>═</span>
        <span>◆</span>
      </div>
    </div>
  );
};

/**
 * Geometric stepped fret SVG band
 */
export const SteppedFretBand: React.FC<{
  className?: string;
  height?: number;
}> = ({ className = '', height = 12 }) => {
  return (
    <div className={`w-full overflow-hidden opacity-60 ${className}`}>
      <svg
        className="w-full"
        height={height}
        preserveAspectRatio="repeat-x"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="steppedFret"
          x="0"
          y="0"
          width="40"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          {/* Mesoamerican stepped spiral fret */}
          <path
            d="M0 0 H40 M0 12 H40 M5 12 V4 H15 V8 H10 V6 H13 M25 0 V8 H35 V4 H30 V6 H33"
            fill="none"
            stroke="#00f0c0"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </pattern>
        <rect width="100%" height={height} fill="url(#steppedFret)" />
      </svg>
    </div>
  );
};

/**
 * Aztec Water Glyph (Atl)
 */
export const AztecWaterGlyph: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 4 C14 12, 6 22, 6 28 C6 35, 12 38, 20 38 C28 38, 34 35, 34 28 C34 22, 26 12, 20 4 Z"
        fill="#0284c7"
        stroke="#00f0c0"
        strokeWidth="2"
      />
      {/* Chalchihuitl Jade bead inside drop */}
      <circle cx="20" cy="27" r="5" fill="#10b981" stroke="#fde047" strokeWidth="1.5" />
      <circle cx="20" cy="27" r="2" fill="#ffffff" />
      {/* Stepped ripple */}
      <path
        d="M13 22 Q 20 18, 27 22"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
