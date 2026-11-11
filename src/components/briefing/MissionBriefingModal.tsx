import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Sparkles,
  MapPin,
  Flame,
  Layers,
  AlertTriangle,
  GitFork,
  CheckCircle2
} from 'lucide-react';

export const MissionBriefingModal: React.FC = () => {
  const { isBriefingActive, briefingSceneIndex, nextBriefingScene, prevBriefingScene, stopBriefing, loadDemoScenario } = useAppStore();
  const navigate = useNavigate();

  if (!isBriefingActive) return null;

  const scenes = [
    {
      title: "Scene 1 — India's Manganese Challenge",
      subtitle: "The Mission & Geological Setting",
      route: '/command-center',
      description: "India's steel production target of 300 MTPA by 2030 requires over 10 MT of manganese ore annually. Central India (Sauser Belt spanning Maharashtra and Madhya Pradesh) hosts MOIL's primary high-grade reserves, yet legacy extraction encounters acute depth limits, declining grades, and monsoon vulnerabilities.",
      keyAction: "Highlighting Central India Manganese Corridor and operational mine network."
    },
    {
      title: "Scene 2 — Detect the Opportunity",
      subtitle: "AI Mineral Prospecting & Deep Sensing",
      route: '/exploration',
      description: "By fusing Landsat-9 SWIR hydrothermal alteration signatures with magnetic lineaments and regional fold tectonics, MANGANEX isolates high-confidence blind ore horizons—such as the Sauser Belt Fold Extension scoring 91.4% prospectivity.",
      keyAction: "Inspecting Prospect DNA and structural anticlinal continuity."
    },
    {
      title: "Scene 3 — Look Beneath the Surface",
      subtitle: "Earth X-Ray & Subsurface Slicing",
      route: '/subsurface',
      description: "Transitioning directly from 2D satellite surface observations to a 3D geological digital twin. Diamond wireline drillholes (BH-BG-2023-14) intersect massive Braunite-Pyrolusite reefs between 135m and 275m depth, confirming economic feasibility.",
      keyAction: "Rotating 3D geological strata and dragging the horizontal depth slicer."
    },
    {
      title: "Scene 4 — Identify Operational Risk",
      subtitle: "Shortfall Radar & Causal Ripple",
      route: '/risk-center',
      description: "Extreme monsoon precipitation (124.5 mm in 24h) triggered Sub-Level 7 sump flooding at Balaghat, placing an estimated 8,800 tonnes of high-grade dioxide ore at immediate risk of dispatch delay.",
      keyAction: "Visualizing causal cascading ripple from sump pumps to blast faces and surface dispatch."
    },
    {
      title: "Scene 5 — Explore the Future",
      subtitle: "Future Fork: Decision Simulation Laboratory",
      route: '/scenario-lab',
      description: "Rather than passively accepting production deficits, planners simulate corrective actions: deploying auxiliary submersible dewatering pumps and reallocating haulage fleet to Upper Level 4 recovers 6,400 tonnes of lost volume.",
      keyAction: "Comparing Baseline Deficit vs. Corrective Future scenario."
    },
    {
      title: "Scene 6 — Operational Chessboard",
      subtitle: "Optimization Studio & Fleet Scheduling",
      route: '/optimization',
      description: "Dynamic resource allocation shifts idle electric LHD loaders from development drifts to active extraction stopes, optimizing cycle times and clearing ore-pass bottlenecks.",
      keyAction: "Reviewing drag-and-drop fleet allocation and shift constraints."
    },
    {
      title: "Scene 7 — Scientific Explainability & Trust",
      subtitle: "AI Intelligence Center & Trust Lens",
      route: '/intelligence',
      description: "Every AI prediction is backed by transparent data provenance: distinguishing observed drill cores, interpolated geophysics, and synthetic training runs with clear uncertainty boundaries.",
      keyAction: "Inspecting feature importance and scientific provenance markers."
    },
    {
      title: "Scene 8 — Executive Decision Briefing",
      subtitle: "Mission Complete & Exportable Briefing",
      route: '/reports',
      description: "Synthesized operational summary ready for Ministry of Steel officials and MOIL directorate: immediate pump intervention authorized, new core drilling campaign chartered for North Balaghat.",
      keyAction: "Generating printable executive PDF decision briefing."
    }
  ];

  const currentScene = scenes[briefingSceneIndex];

  const handleNext = () => {
    if (briefingSceneIndex < scenes.length - 1) {
      nextBriefingScene();
      navigate(scenes[briefingSceneIndex + 1].route);
    } else {
      stopBriefing();
    }
  };

  const handlePrev = () => {
    if (briefingSceneIndex > 0) {
      prevBriefingScene();
      navigate(scenes[briefingSceneIndex - 1].route);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Banner Indicator */}
      <div className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-xl bg-[#101925]/95 border border-[#37D9FF]/40 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#37D9FF] text-black flex items-center justify-center font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#37D9FF]">
                MANGANEX MISSION BRIEFING MODE
              </span>
              <span className="text-xs text-[#96AABD]">
                • Step {briefingSceneIndex + 1} of {scenes.length}
              </span>
            </div>
            <h2 className="text-sm font-heading font-bold text-[#EDF5FC]">{currentScene.title}</h2>
          </div>
        </div>

        <button
          onClick={stopBriefing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#26384A] bg-[#152130] text-xs font-mono text-[#96AABD] hover:text-[#FF6378] hover:border-[#FF6378]/50 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>EXIT BRIEFING</span>
        </button>
      </div>

      {/* Bottom Floating Presenter Card */}
      <div className="pointer-events-auto max-w-2xl mx-auto w-full rounded-2xl bg-[#101925]/95 border border-[#26384A] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-mono text-[#9A85FF] mb-1">
          <span>{currentScene.subtitle}</span>
          <span className="text-[#38D9A9]">SCENE {briefingSceneIndex + 1}/8</span>
        </div>

        <p className="text-sm text-[#EDF5FC] leading-relaxed mb-3">
          {currentScene.description}
        </p>

        <div className="p-2.5 rounded-lg bg-[#080D14]/80 border border-[#26384A] text-xs font-mono text-[#37D9FF] flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-4 w-4 text-[#38D9A9] shrink-0" />
          <span>{currentScene.keyAction}</span>
        </div>

        {/* Scene Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26384A]">
          <button
            onClick={handlePrev}
            disabled={briefingSceneIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#26384A] text-xs font-medium text-[#96AABD] hover:text-[#EDF5FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Scene</span>
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === briefingSceneIndex
                    ? 'w-6 bg-[#37D9FF]'
                    : i < briefingSceneIndex
                    ? 'w-2 bg-[#38D9A9]'
                    : 'w-2 bg-[#26384A]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#37D9FF] hover:bg-[#37D9FF]/90 text-black text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(55,217,255,0.4)] transition-all"
          >
            <span>{briefingSceneIndex === scenes.length - 1 ? 'Finish Briefing' : 'Next Scene'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

