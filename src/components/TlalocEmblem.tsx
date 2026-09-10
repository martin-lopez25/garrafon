import React from 'react';
import logoImage from '../../imagen/logo.jpg';

interface TlalocEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  animate?: boolean;
}

export const TlalocEmblem: React.FC<TlalocEmblemProps> = ({
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-32 h-32 md:w-40 md:h-40',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      title="Tláloc - Señor del Agua y de la Lluvia"
    >
      {/* Outer Aztec Halo / Water Ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-500/20 via-teal-500/10 to-transparent blur-md pointer-events-none" />

      <img
        src={logoImage}
        alt="Logo de Tláloc"
        className={`relative z-10 w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)] ${
          animate ? 'transition-transform duration-500 hover:scale-105' : ''
        }`}
      />

      <svg
        viewBox="0 0 200 200"
        className={`hidden w-full h-full drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)] ${
          animate ? 'transition-transform duration-500 hover:scale-105' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tlalocGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="tlalocJade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="60%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>
          <linearGradient id="tlalocWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#00f0c0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Headdress / Corona de Plumas y Nubes de Tormenta */}
        <path
          d="M30 65 Q 40 25, 70 30 Q 85 10, 100 12 Q 115 10, 130 30 Q 160 25, 170 65 Z"
          fill="url(#tlalocJade)"
          stroke="#fde047"
          strokeWidth="3"
        />

        {/* Central Crown Feather Crest & Sun Disk */}
        <circle cx="100" cy="28" r="9" fill="url(#tlalocGold)" stroke="#042f2e" strokeWidth="2" />
        <circle cx="100" cy="28" r="4" fill="#06b6d4" />
        <circle cx="75" cy="38" r="6" fill="url(#tlalocGold)" />
        <circle cx="125" cy="38" r="6" fill="url(#tlalocGold)" />

        {/* Stepped Cloud Patterns in Crest */}
        <path
          d="M80 50 L88 50 L88 44 L112 44 L112 50 L120 50"
          stroke="#fde047"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Base Face Mask Shield */}
        <path
          d="M45 65 C45 65, 36 120, 50 145 C62 166, 85 174, 100 174 C115 174, 138 166, 150 145 C164 120, 155 65, 155 65 Z"
          fill="url(#tlalocWater)"
          stroke="#00f0c0"
          strokeWidth="4"
        />

        {/* Characteristic Mesoamerican Ringed Eyes (Anteojeras de Tláloc / Chalchihuitl) */}
        {/* Left Ring Eye */}
        <circle cx="72" cy="94" r="22" fill="#042f2e" stroke="url(#tlalocGold)" strokeWidth="4" />
        <circle cx="72" cy="94" r="14" fill="#0f172a" stroke="#00f0c0" strokeWidth="3" />
        <circle cx="72" cy="94" r="6" fill="#38bdf8" />
        <circle cx="75" cy="91" r="2.5" fill="#ffffff" />

        {/* Right Ring Eye */}
        <circle cx="128" cy="94" r="22" fill="#042f2e" stroke="url(#tlalocGold)" strokeWidth="4" />
        <circle cx="128" cy="94" r="14" fill="#0f172a" stroke="#00f0c0" strokeWidth="3" />
        <circle cx="128" cy="94" r="6" fill="#38bdf8" />
        <circle cx="131" cy="91" r="2.5" fill="#ffffff" />

        {/* Central Eye Bridge (Serpentine link between eyes) */}
        <path
          d="M93 94 C96 90, 104 90, 107 94"
          stroke="#fde047"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Aztec Nose Loop */}
        <path
          d="M94 106 C94 115, 106 115, 106 106"
          stroke="#38bdf8"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Characteristic Serpent Upper Lip (Bigote / Labio serpentino de Tláloc) */}
        <path
          d="M52 128 C55 120, 75 124, 100 125 C125 124, 145 120, 148 128 C148 135, 138 138, 100 138 C62 138, 52 135, 52 128 Z"
          fill="#064e3b"
          stroke="#00f0c0"
          strokeWidth="3.5"
        />

        {/* Stylized Rain Fangs (Colmillos de la Lluvia y Rayo) */}
        {/* Outer Left Fang */}
        <path d="M66 138 L68 156 L74 138 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        {/* Inner Left Fang */}
        <path d="M78 138 L82 160 L88 138 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        {/* Inner Right Fang */}
        <path d="M112 138 L118 160 L122 138 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        {/* Outer Right Fang */}
        <path d="M126 138 L132 156 L134 138 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

        {/* Central Teeth */}
        <rect x="91" y="138" width="8" height="9" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
        <rect x="101" y="138" width="8" height="9" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />

        {/* Ear Ornaments (Orejeras de Jade con colgantes) */}
        <circle cx="34" cy="115" r="9" fill="url(#tlalocJade)" stroke="#fde047" strokeWidth="2.5" />
        <circle cx="34" cy="115" r="3.5" fill="#00f0c0" />
        <path d="M34 124 L34 136" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
        <circle cx="34" cy="139" r="3" fill="#38bdf8" />

        <circle cx="166" cy="115" r="9" fill="url(#tlalocJade)" stroke="#fde047" strokeWidth="2.5" />
        <circle cx="166" cy="115" r="3.5" fill="#00f0c0" />
        <path d="M166 124 L166 136" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
        <circle cx="166" cy="139" r="3" fill="#38bdf8" />

        {/* Sacred Water Droplets (Gotas de Lluvia de Jade) */}
        <path
          d="M100 180 C95 186, 95 194, 100 197 C105 194, 105 186, 100 180 Z"
          fill="#38bdf8"
          stroke="#00f0c0"
          strokeWidth="1.5"
        />
        <path
          d="M75 174 C71 179, 71 185, 75 188 C79 185, 79 179, 75 174 Z"
          fill="#00f0c0"
          stroke="#fde047"
          strokeWidth="1.2"
        />
        <path
          d="M125 174 C121 179, 121 185, 125 188 C129 185, 129 179, 125 174 Z"
          fill="#00f0c0"
          stroke="#fde047"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
