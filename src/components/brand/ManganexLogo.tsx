import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const ManganexLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="manganex-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54D8E8" />
          <stop offset="0.5" stopColor="#38A2FF" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="manganex-strata" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54D8E8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Hexagonal Geological Crystal / Subsurface Prism */}
      <polygon
        points="16,2 29,9.5 29,22.5 16,30 3,22.5 3,9.5"
        stroke="#273747"
        strokeWidth="1.2"
        fill="#0D141E"
      />

      {/* Layered Inferred Ore Strata Facets */}
      <polygon
        points="16,6 25,11.2 25,20.8 16,26 7,20.8 7,11.2"
        fill="url(#manganex-strata)"
        stroke="url(#manganex-grad)"
        strokeWidth="1.2"
      />

      {/* Central Diamond Ore Core */}
      <polygon
        points="16,10 21,13.5 21,18.5 16,22 11,18.5 11,13.5"
        fill="#121D29"
        stroke="#54D8E8"
        strokeWidth="1.5"
      />

      {/* Orbital / Spatial Satellite Sensor Track */}
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="5"
        transform="rotate(-25 16 16)"
        stroke="#54D8E8"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.85"
      />

      {/* Active Satellite Node Pulse */}
      <circle cx="27" cy="11" r="1.5" fill="#54D8E8" />
      <circle cx="16" cy="16" r="1.8" fill="#54D8E8" />
    </svg>
  );
};

