import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  Flame,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
  Box,
  Activity,
  AlertTriangle,
  GitFork,
  ShieldCheck,
  ChevronRight,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { startBriefing } = useAppStore();

  return (
    <div className="min-h-screen w-full bg-[#080D14] text-[#EDF5FC] overflow-x-hidden select-none flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#26384A]/60 px-6 sm:px-12 flex items-center justify-between backdrop-blur-md bg-[#080D14]/80 fixed inset-x-0 top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#37D9FF] to-[#9A85FF] flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(55,217,255,0.4)]">
            <Flame className="h-6 w-6 fill-black stroke-black" />
          </div>
          <div>
            <span className="font-heading font-bold text-xl tracking-wider text-[#EDF5FC]">
              MANGANEX
            </span>
            <span className="block text-[10px] font-mono tracking-widest text-[#96AABD] uppercase">
              THE EARTH'S HIDDEN INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => { startBriefing(); navigate('/command-center'); }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-[#26384A] bg-[#101925] text-xs font-mono text-[#EDF5FC] hover:border-[#37D9FF] transition-colors"
          >
            <Sparkles className="h-4 w-4 text-[#9A85FF]" />
            <span>MISSION BRIEFING</span>
          </button>
          <button
            onClick={() => navigate('/command-center')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#37D9FF] hover:bg-[#37D9FF]/90 text-black text-xs font-mono font-bold shadow-[0_0_20px_rgba(55,217,255,0.4)] transition-all"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 sm:px-12 flex-1 flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        {/* Subtle Tech Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#37D9FF]/10 border border-[#37D9FF]/30 text-xs font-mono text-[#37D9FF] mb-6">
          <span className="h-2 w-2 rounded-full bg-[#38D9A9] animate-pulse" />
          <span>MINISTRY OF STEEL & MOIL LIMITED MANGANESE INITIATIVE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-heading font-bold tracking-tight text-[#EDF5FC] leading-tight">
          Uncovering India's <span className="bg-gradient-to-r from-[#37D9FF] via-[#9A85FF] to-[#38D9A9] bg-clip-text text-transparent">Manganese Reserves</span> Through Deep Geospatial AI
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#96AABD] max-w-3xl leading-relaxed">
          An advanced digital mining command center fusing multi-spectral satellite imagery, geological cross-sections, and real-time shortfall forecasting to overcome production deficits across Central India.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/command-center')}
            className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-[#37D9FF] hover:bg-[#37D9FF]/90 text-black text-sm font-mono font-bold shadow-[0_0_30px_rgba(55,217,255,0.4)] transition-all hover:scale-105"
          >
            <Compass className="h-5 w-5" />
            <span>LAUNCH COMMAND CENTER</span>
          </button>

          <button
            onClick={() => { startBriefing(); navigate('/command-center'); }}
            className="flex items-center gap-3 px-8 py-3.5 rounded-xl border border-[#9A85FF]/50 bg-[#152130] text-[#EDF5FC] text-sm font-mono font-semibold hover:bg-[#9A85FF]/20 transition-all"
          >
            <Sparkles className="h-5 w-5 text-[#9A85FF]" />
            <span>START 8-SCENE BRIEFING</span>
          </button>
        </div>

        {/* INTERACTIVE GEOSPATIAL FEATURE PREVIEW CARDS */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div
            onClick={() => navigate('/command-center')}
            className="p-6 rounded-2xl bg-[#101925] border border-[#26384A] hover:border-[#37D9FF] transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-[#37D9FF]/10 text-[#37D9FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#EDF5FC]">
              Geospatial Command Center
            </h3>
            <p className="text-xs text-[#96AABD] mt-2 leading-relaxed font-mono">
              68% map-first operational radar spanning Balaghat, Ukwa, Dongri Buzurg, Kandri, Munsar, Chikla, and Tirodi.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate('/subsurface')}
            className="p-6 rounded-2xl bg-[#101925] border border-[#26384A] hover:border-[#9A85FF] transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-[#9A85FF]/10 text-[#9A85FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Box className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#EDF5FC]">
              Earth X-Ray & 3D Twin
            </h3>
            <p className="text-xs text-[#96AABD] mt-2 leading-relaxed font-mono">
              Volumetric subsurface exploration with diamond core assay integration down to -400m RL.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate('/scenario-lab')}
            className="p-6 rounded-2xl bg-[#101925] border border-[#26384A] hover:border-[#38D9A9] transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-[#38D9A9]/10 text-[#38D9A9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GitFork className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#EDF5FC]">
              Future Fork Simulation
            </h3>
            <p className="text-xs text-[#96AABD] mt-2 leading-relaxed font-mono">
              Simulate monsoon drainage levers and fleet reallocation to anticipate and mitigate production shortfalls.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#26384A] py-6 px-6 sm:px-12 flex flex-wrap items-center justify-between text-xs font-mono text-[#96AABD]">
        <div>
          <span>MANGANEX • The Earth's Hidden Intelligence</span>
        </div>
        <div>
          <span>Developed for CodeQuest 2026 • MOIL Innovation Ecosystem</span>
        </div>
      </footer>
    </div>
  );
};

