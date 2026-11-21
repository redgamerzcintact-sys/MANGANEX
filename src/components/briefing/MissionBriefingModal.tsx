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
      title: "Step 1 — Command Center: Central India Manganese Belt",
      subtitle: "MOIL Cadastre & Operational Mine Telemetry",
      route: '/command-center',
      description: "Real-time spatial monitoring of MOIL's core manganese concessions across Maharashtra and Madhya Pradesh (Balaghat, Dongri Buzurg, Chikla, Ukwa, Munsar). Displays high-precision cadastral polygons, Sauser fault traces, and active mine status indicators.",
      keyAction: "Reviewing spatial concessions, Sauser thrust lineaments, and live mine operational telemetry."
    },
    {
      title: "Step 2 — Reserve Prospectivity AI",
      subtitle: "Subsurface Geology & Core Assays (Satellite Surface Indicators)",
      route: '/prospectivity',
      description: "Blind manganese prospect discovery powered by scikit-learn Random Forest + Gradient Boosting. Subsurface targets are driven by drillcore assays and structural fold compatibility; Sentinel-2 SWIR/iron oxide indices serve strictly as surface alteration indicators.",
      keyAction: "Inspecting prospectivity scores, feature attribution weights, and UNFC reserve categories."
    },
    {
      title: "Step 3 — Production Shortfall Forecasting",
      subtitle: "Weather, Equipment Downtime & Blasting Impact",
      route: '/production',
      description: "30-day predictive time-series forecasting estimating monthly extraction deficits. Accurately anticipates monsoon sump inundation, equipment maintenance delays, and blasting restrictions to protect MOIL's extraction targets.",
      keyAction: "Analyzing 30-day P50 forecasts, confidence intervals, and primary shortfall drivers."
    },
    {
      title: "Step 4 — Future Fork Scenario Lab",
      subtitle: "Parametric What-If Simulation & Shortfall Mitigation",
      route: '/scenario-lab',
      description: "Interactive decision laboratory allowing mine planners to simulate rainfall shocks, fleet availability changes, and pump capacity adjustments. Computes potential recoverable volume and rebalances stope extraction.",
      keyAction: "Comparing baseline deficit vs. corrective dewatering and fleet reallocation future scenarios."
    },
    {
      title: "Step 5 — NEXUS AI Copilot",
      subtitle: "Multilingual Decision Support & Scientific RAG",
      route: '/nexus',
      description: "Autonomous geoscientific assistant supporting Indian languages (Hindi, Marathi, etc.) and international languages. Synthesizes borehole assays, UNFC reserve classifications, and mitigation protocols with verifiable source citations.",
      keyAction: "Querying multilingual knowledge base, borehole assays, and automated operational recommendations."
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
                MANGANEX 5-STEP JUDGE GUIDED TOUR
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
          <span>EXIT TOUR</span>
        </button>
      </div>

      {/* Bottom Floating Presenter Card */}
      <div className="pointer-events-auto max-w-2xl mx-auto w-full rounded-2xl bg-[#101925]/95 border border-[#26384A] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-mono text-[#9A85FF] mb-1">
          <span>{currentScene.subtitle}</span>
          <span className="text-[#38D9A9]">STEP {briefingSceneIndex + 1}/{scenes.length}</span>
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
            <span>Previous Step</span>
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
            <span>{briefingSceneIndex === scenes.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

