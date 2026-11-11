import React from 'react';

// ============================================================================
// 1. 3D BLUE MINERAL CRYSTAL (Total Reserves KPI)
// ============================================================================
export const MineralCrystal3D: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="crystAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="fac1" x1="20" y1="20" x2="60" y2="70">
        <stop offset="0%" stopColor="#E0F7FF" /><stop offset="50%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="fac2" x1="50" y1="10" x2="90" y2="60">
        <stop offset="0%" stopColor="#93C5FD" /><stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="fac3" x1="10" y1="40" x2="50" y2="90">
        <stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="facTop" x1="45" y1="15" x2="65" y2="45">
        <stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#BAE6FD" /><stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
      <filter id="crystGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#00D9FF" floodOpacity="0.5" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#crystAura)" />
    <g filter="url(#crystGlow)">
      <polygon points="50,12 82,32 75,72 50,88 25,72 18,32" fill="#0c1e3d" stroke="#1d4ed8" strokeWidth="1" />
      <polygon points="50,88 25,72 45,55" fill="url(#fac3)" stroke="#60a5fa" strokeWidth="0.8" />
      <polygon points="50,88 45,55 65,58" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.8" />
      <polygon points="50,88 65,58 75,72" fill="#172554" stroke="#2563eb" strokeWidth="0.8" />
      <polygon points="25,72 18,32 42,38 45,55" fill="url(#fac1)" stroke="#93c5fd" strokeWidth="0.8" />
      <polygon points="75,72 65,58 70,38 82,32" fill="url(#fac2)" stroke="#60a5fa" strokeWidth="0.8" />
      <polygon points="45,55 42,38 62,32 65,58" fill="url(#fac3)" stroke="#bae6fd" strokeWidth="0.8" />
      <polygon points="50,12 18,32 42,38" fill="url(#facTop)" stroke="#ffffff" strokeWidth="1" />
      <polygon points="50,12 42,38 62,32" fill="#e0f2fe" stroke="#ffffff" strokeWidth="1" />
      <polygon points="50,12 62,32 82,32" fill="url(#fac2)" stroke="#93c5fd" strokeWidth="0.8" />
      <circle cx="42" cy="38" r="2.5" fill="#ffffff" />
      <circle cx="50" cy="12" r="2" fill="#ffffff" />
    </g>
  </svg>
);

// ============================================================================
// 2. 3D YELLOW MINING HAUL TRUCK (Predicted Production KPI)
// ============================================================================
export const HaulTruck3D: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="trkAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="trkYellow" x1="10" y1="20" x2="80" y2="70">
        <stop offset="0%" stopColor="#FDE047" /><stop offset="60%" stopColor="#EAB308" /><stop offset="100%" stopColor="#A16207" />
      </linearGradient>
      <linearGradient id="bedYellow" x1="15" y1="25" x2="70" y2="55">
        <stop offset="0%" stopColor="#FEF08A" /><stop offset="70%" stopColor="#EAB308" /><stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="trkGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#EAB308" floodOpacity="0.4" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#trkAura)" />
    <g filter="url(#trkGlow)">
      {/* Dump Bed */}
      <polygon points="14,44 24,20 76,26 68,52 18,52" fill="url(#bedYellow)" stroke="#CA8A04" strokeWidth="1" />
      <polygon points="24,20 36,14 84,20 76,26" fill="#FEF08A" stroke="#EAB308" strokeWidth="1" />
      <polygon points="76,26 84,20 76,46 68,52" fill="#854D0E" />
      {/* Ribs on bed */}
      <line x1="30" y1="24" x2="28" y2="50" stroke="#A16207" strokeWidth="1.5" />
      <line x1="44" y1="25" x2="42" y2="51" stroke="#A16207" strokeWidth="1.5" />
      <line x1="58" y1="26" x2="56" y2="51" stroke="#A16207" strokeWidth="1.5" />
      {/* Cab & Platform */}
      <polygon points="68,52 88,54 90,40 78,38" fill="url(#trkYellow)" stroke="#CA8A04" strokeWidth="1" />
      <rect x="78" y="39" width="10" height="7" rx="1" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" opacity="0.9" />
      {/* Heavy Mining Tires */}
      <ellipse cx="28" cy="65" rx="12" ry="14" fill="#1E293B" stroke="#475569" strokeWidth="2" />
      <ellipse cx="28" cy="65" rx="5" ry="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <ellipse cx="76" cy="66" rx="12" ry="14" fill="#1E293B" stroke="#475569" strokeWidth="2" />
      <ellipse cx="76" cy="66" rx="5" ry="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
    </g>
  </svg>
);

// ============================================================================
// 3. 3D GLOWING ORANGE HAZARD TRIANGLE (Shortfall Risk KPI)
// ============================================================================
export const HazardTriangle3D: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="hazAura" cx="50%" cy="55%" r="50%">
        <stop offset="0%" stopColor="#FF9B32" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="hazFace" x1="50" y1="12" x2="50" y2="82">
        <stop offset="0%" stopColor="#FED7AA" /><stop offset="35%" stopColor="#FB923C" /><stop offset="80%" stopColor="#EA580C" /><stop offset="100%" stopColor="#C2410C" />
      </linearGradient>
      <filter id="hazGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#FF7A00" floodOpacity="0.6" />
      </filter>
    </defs>
    <circle cx="50" cy="52" r="45" fill="url(#hazAura)" />
    <g filter="url(#hazGlow)">
      <polygon points="50,12 88,78 12,78" fill="#7C2D12" />
      <polygon points="50,14 86,76 14,76" fill="#FDBA74" />
      <polygon points="50,18 82,73 18,73" fill="url(#hazFace)" stroke="#FED7AA" strokeWidth="1" />
      {/* Exclamation */}
      <path d="M50 32 L53 53 H47 L50 32 Z" fill="#FFFFFF" />
      <circle cx="50" cy="62" r="3.2" fill="#FFFFFF" />
    </g>
  </svg>
);

// ============================================================================
// 4. 3D GLOWING CYAN SECURITY SHIELD (Confidence Score KPI)
// ============================================================================
export const ShieldScore3D: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="shldAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="shldRim" x1="15" y1="15" x2="85" y2="85">
        <stop offset="0%" stopColor="#E0F7FF" /><stop offset="40%" stopColor="#00D9FF" /><stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="shldCavity" x1="50" y1="18" x2="50" y2="84">
        <stop offset="0%" stopColor="#083344" /><stop offset="60%" stopColor="#0E7490" /><stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <filter id="shldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#00D9FF" floodOpacity="0.5" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#shldAura)" />
    <g filter="url(#shldGlow)">
      <path d="M50 14 L82 24 C82 55 68 76 50 86 C32 76 18 55 18 24 L50 14 Z" fill="url(#shldRim)" />
      <path d="M50 19 L77 28 C77 53 65 71 50 80 C35 71 23 53 23 28 L50 19 Z" fill="url(#shldCavity)" stroke="#38BDF8" strokeWidth="1.2" />
      <path d="M38 48 L46 56 L64 36" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 48 L46 56 L64 36" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// ============================================================================
// 5. 3D ROBOT MASCOT (Head for Control Hub / Full body for NEXUS AI)
// ============================================================================
export const RobotMascot3D: React.FC<{ className?: string; mini?: boolean }> = ({ className = 'w-24 h-24', mini = false }) => {
  if (mini) {
    // Cute 3D Robot Head for Control Hub
    return (
      <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <radialGradient id="miniAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          <filter id="eyeGlowMini">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="48" r="40" fill="url(#miniAura)" />
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="8" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="7" r="4" fill="#00D9FF" filter="url(#eyeGlowMini)" />
        <circle cx="50" cy="7" r="2" fill="#FFFFFF" />
        {/* Ears */}
        <ellipse cx="20" cy="45" rx="3.5" ry="8" fill="#3B82F6" />
        <ellipse cx="80" cy="45" rx="3.5" ry="8" fill="#3B82F6" />
        {/* Head chassis */}
        <rect x="22" y="20" width="56" height="48" rx="20" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.2" />
        {/* Visor */}
        <rect x="28" y="28" width="44" height="28" rx="12" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        {/* Cyan Glowing Eyes */}
        <ellipse cx="40" cy="42" rx="4.5" ry="6.5" fill="#00D9FF" filter="url(#eyeGlowMini)" />
        <circle cx="41" cy="40" r="1.8" fill="#FFFFFF" />
        <ellipse cx="60" cy="42" rx="4.5" ry="6.5" fill="#00D9FF" filter="url(#eyeGlowMini)" />
        <circle cx="61" cy="40" r="1.8" fill="#FFFFFF" />
      </svg>
    );
  }

  // Full-body 3D futuristic floating robot for NEXUS AI Assistant
  return (
    <svg viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="robAuraFull" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#818CF8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
        </radialGradient>
        <filter id="eyeGlowFull">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="70" cy="80" rx="60" ry="70" fill="url(#robAuraFull)" />
      {/* Antenna */}
      <line x1="70" y1="24" x2="70" y2="10" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="9" r="4.5" fill="#00D9FF" filter="url(#eyeGlowFull)" />
      <circle cx="70" cy="9" r="2.5" fill="#FFFFFF" />
      {/* Floating Hands */}
      <ellipse cx="28" cy="100" rx="9" ry="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <circle cx="28" cy="100" r="3.5" fill="#38BDF8" opacity="0.8" />
      <ellipse cx="112" cy="100" rx="9" ry="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <circle cx="112" cy="100" r="3.5" fill="#38BDF8" opacity="0.8" />
      {/* Head */}
      <rect x="36" y="22" width="68" height="52" rx="24" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
      <ellipse cx="34" cy="48" rx="4" ry="9" fill="#2563EB" />
      <ellipse cx="106" cy="48" rx="4" ry="9" fill="#2563EB" />
      <rect x="44" y="32" width="52" height="32" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="1" />
      <ellipse cx="58" cy="48" rx="5" ry="7" fill="#00D9FF" filter="url(#eyeGlowFull)" />
      <circle cx="59" cy="46" r="2" fill="#FFFFFF" />
      <ellipse cx="82" cy="48" rx="5" ry="7" fill="#00D9FF" filter="url(#eyeGlowFull)" />
      <circle cx="83" cy="46" r="2" fill="#FFFFFF" />
      {/* Torso */}
      <path d="M48 76 C48 76 54 125 70 128 C86 125 92 76 92 76 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
      <path d="M44 80 C38 82 36 94 44 98 C48 94 48 84 44 80 Z" fill="#2563EB" />
      <path d="M96 80 C102 82 104 94 96 98 C92 94 92 84 96 80 Z" fill="#2563EB" />
      {/* Glowing Arc Reactor */}
      <circle cx="70" cy="98" r="9" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
      <circle cx="70" cy="98" r="6" fill="#00D9FF" filter="url(#eyeGlowFull)" />
      <circle cx="70" cy="98" r="3" fill="#FFFFFF" />
      {/* Base Thruster Ring */}
      <ellipse cx="70" cy="138" rx="14" ry="4" fill="#00D9FF" filter="url(#eyeGlowFull)" opacity="0.8" />
    </svg>
  );
};

// ============================================================================
// 6. 3D ISOMETRIC GEOLOGICAL EARTH X-RAY BLOCK
// ============================================================================
export const EarthXRayBlock3D: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="mntnGrad" x1="40" y1="20" x2="280" y2="90">
        <stop offset="0%" stopColor="#4ADE80" /><stop offset="30%" stopColor="#15803D" /><stop offset="70%" stopColor="#78350F" /><stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      <linearGradient id="lay5L" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#9333EA"/></linearGradient>
      <linearGradient id="lay5R" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E879F9"/><stop offset="100%" stopColor="#7E22CE"/></linearGradient>
      <linearGradient id="lay4L" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FB7185"/><stop offset="100%" stopColor="#E11D48"/></linearGradient>
      <linearGradient id="lay4R" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FDA4AF"/><stop offset="100%" stopColor="#BE123C"/></linearGradient>
      <linearGradient id="lay3L" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#0284C7"/></linearGradient>
      <linearGradient id="lay3R" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7DD3FC"/><stop offset="100%" stopColor="#0369A1"/></linearGradient>
      <linearGradient id="lay2L" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#86EFAC"/><stop offset="100%" stopColor="#16A34A"/></linearGradient>
      <linearGradient id="lay2R" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#BBF7D0"/><stop offset="100%" stopColor="#15803D"/></linearGradient>
      <linearGradient id="lay1L" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#CA8A04"/></linearGradient>
      <linearGradient id="lay1R" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FEF08A"/><stop offset="100%" stopColor="#A16207"/></linearGradient>
      <filter id="reefGlow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#D946EF" floodOpacity="0.6" />
      </filter>
    </defs>

    <polygon points="160,215 285,150 160,110 35,150" fill="#020617" opacity="0.7" />

    {/* LAYER 5: Glowing Manganese Ore Horizon */}
    <g filter="url(#reefGlow)">
      <polygon points="35,150 160,195 160,210 35,165" fill="url(#lay5L)" stroke="#F472B6" strokeWidth="0.8" />
      <polygon points="160,195 285,150 285,165 160,210" fill="url(#lay5R)" stroke="#E879F9" strokeWidth="0.8" />
    </g>

    {/* LAYER 4: High Grade Reef */}
    <polygon points="35,135 160,180 160,195 35,150" fill="url(#lay4L)" stroke="#FB7185" strokeWidth="0.8" />
    <polygon points="160,180 285,135 285,150 160,195" fill="url(#lay4R)" stroke="#FDA4AF" strokeWidth="0.8" />

    {/* LAYER 3: Quartzite & Aquifer */}
    <polygon points="35,118 160,163 160,180 35,135" fill="url(#lay3L)" stroke="#38BDF8" strokeWidth="0.8" />
    <polygon points="160,163 285,118 285,135 160,180" fill="url(#lay3R)" stroke="#7DD3FC" strokeWidth="0.8" />

    {/* LAYER 2: Schist */}
    <polygon points="35,102 160,147 160,163 35,118" fill="url(#lay2L)" stroke="#86EFAC" strokeWidth="0.8" />
    <polygon points="160,147 285,102 285,118 160,163" fill="url(#lay2R)" stroke="#BBF7D0" strokeWidth="0.8" />

    {/* LAYER 1: Sandstone */}
    <polygon points="35,85 160,130 160,147 35,102" fill="url(#lay1L)" stroke="#FDE047" strokeWidth="0.8" />
    <polygon points="160,130 285,85 285,102 160,147" fill="url(#lay1R)" stroke="#FEF08A" strokeWidth="0.8" />

    {/* TOP MOUNTAIN SURFACE: Jagged Green Ridges */}
    <polygon points="35,85 160,130 285,85 160,35" fill="url(#mntnGrad)" stroke="#86EFAC" strokeWidth="1" />
    {/* Mountains Ridges */}
    <path d="M50 78 L75 52 L110 70 L145 42 L175 60 L210 38 L255 75" stroke="#BBF7D0" strokeWidth="1.5" fill="none" opacity="0.8" />
    {/* Terraced Open Pit Steps on Top */}
    <ellipse cx="160" cy="80" rx="38" ry="18" fill="#78350F" opacity="0.85" stroke="#CA8A04" strokeWidth="1" />
    <ellipse cx="160" cy="81" rx="26" ry="12" fill="#451A03" opacity="0.9" stroke="#EAB308" strokeWidth="0.8" />
    <ellipse cx="160" cy="82" rx="14" ry="6" fill="#1C1917" stroke="#FEF08A" strokeWidth="0.8" />

    {/* Glowing Vertical Borehole Rods */}
    <line x1="105" y1="70" x2="105" y2="185" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.95" />
    <circle cx="105" cy="70" r="3.5" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1" />
    <circle cx="105" cy="185" r="3" fill="#D946EF" />

    <line x1="160" y1="82" x2="160" y2="204" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.95" />
    <circle cx="160" cy="82" r="4" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1" />
    <circle cx="160" cy="204" r="3.5" fill="#D946EF" />

    <line x1="215" y1="65" x2="215" y2="175" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.95" />
    <circle cx="215" cy="65" r="3.5" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1" />
    <circle cx="215" cy="175" r="3" fill="#D946EF" />

    {/* Depth Callout Annotations on Left */}
    <text x="5" y="88" fill="#00D9FF" fontSize="7" fontFamily="monospace">0m</text>
    <line x1="18" y1="85" x2="33" y2="85" stroke="#00D9FF" strokeWidth="0.8" strokeDasharray="2 1" />
    <text x="0" y="122" fill="#00D9FF" fontSize="7" fontFamily="monospace">-140m</text>
    <line x1="24" y1="118" x2="33" y2="118" stroke="#00D9FF" strokeWidth="0.8" strokeDasharray="2 1" />
    <text x="0" y="154" fill="#D946EF" fontSize="7" fontWeight="bold" fontFamily="monospace">-385m</text>
    <line x1="24" y1="150" x2="33" y2="150" stroke="#D946EF" strokeWidth="0.8" strokeDasharray="2 1" />
  </svg>
);

// ============================================================================
// 7. SATELLITE IN ORBIT (Satellite Intelligence Card)
// ============================================================================
export const SatelliteSpaceGraphic: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="earthLimb" cx="50%" cy="130%" r="85%">
        <stop offset="0%" stopColor="#0284C7" /><stop offset="45%" stopColor="#0369A1" /><stop offset="75%" stopColor="#0F172A" /><stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <linearGradient id="solBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" /><stop offset="50%" stopColor="#2563EB" /><stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <filter id="limbGlow">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    <rect width="280" height="180" fill="#040915" />
    {/* Stars */}
    <circle cx="25" cy="30" r="0.9" fill="#FFFFFF" opacity="0.8" />
    <circle cx="65" cy="45" r="1.3" fill="#BAE6FD" opacity="0.9" />
    <circle cx="120" cy="25" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="210" cy="35" r="1.2" fill="#38BDF8" opacity="0.8" />
    <circle cx="260" cy="20" r="1.1" fill="#FFFFFF" opacity="0.9" />

    {/* Earth Atmosphere Rim */}
    <path d="M-20 180 Q140 90 300 180 Z" fill="url(#earthLimb)" />
    <path d="M-20 180 Q140 90 300 180" stroke="#38BDF8" strokeWidth="4" opacity="0.85" filter="url(#limbGlow)" />
    <path d="M-20 180 Q140 92 300 180" stroke="#00D9FF" strokeWidth="1.5" opacity="0.95" />

    {/* Satellite */}
    <g transform="translate(148, 42) rotate(-18)">
      {/* Left Array */}
      <rect x="-42" y="-12" width="28" height="24" rx="2" fill="url(#solBlue)" stroke="#60A5FA" strokeWidth="0.8" />
      <line x1="-33" y1="-12" x2="-33" y2="12" stroke="#93C5FD" strokeWidth="0.6" opacity="0.7" />
      <line x1="-24" y1="-12" x2="-24" y2="12" stroke="#93C5FD" strokeWidth="0.6" opacity="0.7" />
      <line x1="-14" y1="0" x2="-8" y2="0" stroke="#E2E8F0" strokeWidth="2" />
      {/* Body */}
      <rect x="-8" y="-9" width="16" height="18" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="-5" y="-6" width="10" height="12" rx="1" fill="#F59E0B" opacity="0.9" />
      {/* Right Array */}
      <line x1="8" y1="0" x2="14" y2="0" stroke="#E2E8F0" strokeWidth="2" />
      <rect x="14" y="-12" width="28" height="24" rx="2" fill="url(#solBlue)" stroke="#60A5FA" strokeWidth="0.8" />
      <line x1="23" y1="-12" x2="23" y2="12" stroke="#93C5FD" strokeWidth="0.6" opacity="0.7" />
      <line x1="32" y1="-12" x2="32" y2="12" stroke="#93C5FD" strokeWidth="0.6" opacity="0.7" />
      {/* Dish & Sensor Beam */}
      <polygon points="-3,18 3,18 18,65 -18,65" fill="#00D9FF" opacity="0.18" />
    </g>
  </svg>
);

// ============================================================================
// 8. REGIONAL GEOLOGICAL HEATMAP (Geological Heatmap Card)
// ============================================================================
export const RegionalHeatmapGraphic: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="heatCoreBig" cx="48%" cy="42%" r="50%">
        <stop offset="0%" stopColor="#FF1E1E" /><stop offset="30%" stopColor="#FF7A00" /><stop offset="60%" stopColor="#FFDE00" /><stop offset="85%" stopColor="#00E69A" /><stop offset="100%" stopColor="#0055FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="heatCoreEast" cx="58%" cy="32%" r="42%">
        <stop offset="0%" stopColor="#FF1E1E" /><stop offset="40%" stopColor="#FF8800" /><stop offset="75%" stopColor="#FFEA00" /><stop offset="100%" stopColor="#0077FF" stopOpacity="0" />
      </radialGradient>
      <filter id="blurHeat">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <rect width="240" height="180" fill="#050B17" />
    {/* Grid lines */}
    <path d="M30 0 V180 M60 0 V180 M90 0 V180 M120 0 V180 M150 0 V180 M180 0 V180 M210 0 V180" stroke="#0E1E38" strokeWidth="0.8" />
    <path d="M0 30 H240 M0 60 H240 M0 90 H240 M0 120 H240 M0 150 H240" stroke="#0E1E38" strokeWidth="0.8" />

    {/* Concession Boundary */}
    <path
      d="M48 102 C42 82 56 58 76 46 C98 36 122 28 148 32 C178 38 192 54 186 74 C180 88 196 102 182 122 C166 138 152 132 142 148 C132 160 112 166 96 158 C82 150 76 128 66 122 C56 118 48 115 48 102 Z"
      fill="#0B1B36"
      stroke="#00D9FF"
      strokeWidth="1.8"
      strokeDasharray="4 2"
    />

    {/* Heatmap Blobs */}
    <g filter="url(#blurHeat)">
      <path
        d="M58 98 C52 82 66 62 82 52 C102 42 128 36 148 38 C172 42 182 58 178 72 C172 88 188 102 172 118 C158 130 144 125 134 140 C124 150 110 152 100 145 C86 138 80 122 72 118 Z"
        fill="#0055FF"
        opacity="0.8"
      />
      <ellipse cx="108" cy="82" rx="38" ry="28" fill="url(#heatCoreBig)" opacity="0.95" />
      <ellipse cx="145" cy="68" rx="30" ry="22" fill="url(#heatCoreEast)" opacity="0.95" />
      <circle cx="102" cy="80" r="14" fill="#FF1E1E" />
      <circle cx="146" cy="66" r="11" fill="#FF1E1E" />
    </g>

    {/* Crisp inner stroke */}
    <path
      d="M48 102 C42 82 56 58 76 46 C98 36 122 28 148 32 C178 38 192 54 186 74 C180 88 196 102 182 122 C166 138 152 132 142 148 C132 160 112 166 96 158 C82 150 76 128 66 122 C56 118 48 115 48 102 Z"
      stroke="#38BDF8"
      strokeWidth="1.2"
      fill="none"
    />

    {/* Targeting Crosshair */}
    <g transform="translate(102, 80)">
      <circle cx="0" cy="0" r="8" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      <line x1="-12" y1="0" x2="12" y2="0" stroke="#FFFFFF" strokeWidth="1.2" />
      <line x1="0" y1="-12" x2="0" y2="12" stroke="#FFFFFF" strokeWidth="1.2" />
    </g>
  </svg>
);

// ============================================================================
// 9. REALISTIC TILTED SMARTPHONE MOCKUP (Mobile View Card)
// ============================================================================
export const MobileViewMockup3D: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="phBody" x1="20" y1="10" x2="140" y2="250">
        <stop offset="0%" stopColor="#334155" /><stop offset="40%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="phGlass" x1="30" y1="20" x2="130" y2="240">
        <stop offset="0%" stopColor="#0B132B" /><stop offset="100%" stopColor="#030712" />
      </linearGradient>
      <filter id="phShadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="4" dy="12" stdDeviation="10" floodColor="#00D9FF" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#phShadow)" transform="rotate(-3 80 130)">
      {/* Phone chassis */}
      <rect x="20" y="14" width="120" height="232" rx="22" fill="url(#phBody)" stroke="#475569" strokeWidth="2" />
      {/* Screen */}
      <rect x="25" y="19" width="110" height="222" rx="18" fill="url(#phGlass)" stroke="#1E293B" strokeWidth="1" />
      {/* Notch */}
      <rect x="62" y="24" width="36" height="7" rx="3.5" fill="#020617" />
      {/* Header */}
      <text x="34" y="44" fill="#00D9FF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">M</text>
      <text x="44" y="44" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">MANGANEX</text>
      <circle cx="122" cy="42" r="2" fill="#00E69A" />
      {/* Heatmap on screen */}
      <g transform="translate(30, 52)">
        <rect width="100" height="142" rx="10" fill="#061224" />
        <circle cx="50" cy="70" r="36" fill="#0066FF" opacity="0.4" />
        <circle cx="50" cy="70" r="26" fill="#00E676" opacity="0.6" />
        <circle cx="50" cy="70" r="16" fill="#FFD600" opacity="0.8" />
        <circle cx="50" cy="70" r="9" fill="#FF3D00" />
        <polygon points="20,40 80,30 90,95 30,110" stroke="#00D9FF" strokeWidth="1" strokeDasharray="3 2" fill="none" />
        <circle cx="38" cy="55" r="2.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.8" />
        <circle cx="65" cy="80" r="2.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.8" />
        {/* Floating pill in phone */}
        <rect x="8" y="104" width="84" height="28" rx="6" fill="#0B1B36" stroke="#00D9FF" strokeWidth="0.8" opacity="0.95" />
        <text x="14" y="116" fill="#94A3B8" fontSize="5" fontFamily="sans-serif">High Potential</text>
        <text x="14" y="126" fill="#00D9FF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">~ 42.5 Mt</text>
      </g>
      {/* Tab bar */}
      <rect x="25" y="206" width="110" height="35" rx="14" fill="#040914" stroke="#1E293B" strokeWidth="0.8" />
      <g transform="translate(30, 212)">
        <circle cx="14" cy="12" r="3" fill="#00D9FF" />
        <text x="10" y="24" fill="#00D9FF" fontSize="4.5" fontFamily="sans-serif">Map</text>
        <rect x="36" y="9" width="8" height="6" rx="1" fill="#64748B" />
        <text x="32" y="24" fill="#64748B" fontSize="4.5" fontFamily="sans-serif">Stats</text>
        <circle cx="64" cy="12" r="3" fill="#64748B" />
        <text x="58" y="24" fill="#64748B" fontSize="4.5" fontFamily="sans-serif">Alerts</text>
        <circle cx="86" cy="12" r="3" fill="#64748B" />
        <text x="82" y="24" fill="#64748B" fontSize="4.5" fontFamily="sans-serif">User</text>
      </g>
    </g>
  </svg>
);
