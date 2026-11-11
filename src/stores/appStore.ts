import { create } from 'zustand';
import { MINES_DATA, PROSPECTS_DATA, RISK_ALERTS } from '../data/demoData';
import { Mine, GeologicalProspect, RiskAlert } from '../types';

export type DemoScenario = 'default' | 'scenario-a' | 'scenario-b' | 'scenario-c' | 'scenario-d';

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  selectedMineId: string;
  setSelectedMineId: (id: string) => void;
  selectedMine: Mine;

  selectedProspectId: string | null;
  setSelectedProspectId: (id: string | null) => void;
  selectedProspect: GeologicalProspect | null;

  activeRiskAlerts: RiskAlert[];
  acknowledgeAlert: (alertId: string) => void;

  timelineDate: string;
  setTimelineDate: (date: string) => void;

  // Layer Toggles
  layers: {
    prospectivity: boolean;
    knownReserves: boolean;
    lithology: boolean;
    boreholes: boolean;
    faults: boolean;
    satelliteNdvi: boolean;
    rainfallAccumulation: boolean;
    soilMoisture: boolean;
    haulRoutes: boolean;
    uncertaintyFog: boolean;
  };
  toggleLayer: (layerKey: keyof AppState['layers']) => void;
  layerOpacity: Record<string, number>;
  setLayerOpacity: (layerKey: string, opacity: number) => void;

  // Demo Scenarios Preset Engine
  activeDemoScenario: DemoScenario;
  loadDemoScenario: (scenario: DemoScenario) => void;

  // Nexus Assistant
  isNexusOpen: boolean;
  setNexusOpen: (open: boolean) => void;
  toggleNexus: () => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Mission Briefing
  isBriefingActive: boolean;
  briefingSceneIndex: number;
  startBriefing: () => void;
  nextBriefingScene: () => void;
  prevBriefingScene: () => void;
  stopBriefing: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('manganex_theme') === 'light') ? 'light' : 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('manganex_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  selectedMineId: 'mine-balaghat',
  selectedMine: MINES_DATA[0],
  setSelectedMineId: (id) => {
    const found = MINES_DATA.find((m) => m.id === id) || MINES_DATA[0];
    set({ selectedMineId: id, selectedMine: found });
  },

  selectedProspectId: 'prospect-sauser-north',
  selectedProspect: PROSPECTS_DATA[0],
  setSelectedProspectId: (id) => {
    const found = PROSPECTS_DATA.find((p) => p.id === id) || null;
    set({ selectedProspectId: id, selectedProspect: found });
  },

  activeRiskAlerts: RISK_ALERTS,
  acknowledgeAlert: (alertId) => {
    set((state) => ({
      activeRiskAlerts: state.activeRiskAlerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    }));
  },

  timelineDate: '2026-10-31',
  setTimelineDate: (date) => set({ timelineDate: date }),

  layers: {
    prospectivity: true,
    knownReserves: true,
    lithology: true,
    boreholes: true,
    faults: true,
    satelliteNdvi: false,
    rainfallAccumulation: true,
    soilMoisture: false,
    haulRoutes: true,
    uncertaintyFog: false,
  },
  toggleLayer: (layerKey) =>
    set((state) => ({
      layers: { ...state.layers, [layerKey]: !state.layers[layerKey] },
    })),
  layerOpacity: {
    prospectivity: 0.85,
    rainfallAccumulation: 0.7,
    lithology: 0.75,
    uncertaintyFog: 0.65,
  },
  setLayerOpacity: (layerKey, opacity) =>
    set((state) => ({
      layerOpacity: { ...state.layerOpacity, [layerKey]: opacity },
    })),

  activeDemoScenario: 'default',
  loadDemoScenario: (scenario) => {
    if (scenario === 'scenario-a') {
      // Hidden Mineral Opportunity
      set({
        activeDemoScenario: scenario,
        selectedProspectId: 'prospect-sauser-north',
        selectedProspect: PROSPECTS_DATA[0],
        layers: {
          ...get().layers,
          prospectivity: true,
          lithology: true,
          boreholes: true,
          uncertaintyFog: true,
        },
      });
    } else if (scenario === 'scenario-b') {
      // Rainfall-Driven Production Risk
      set({
        activeDemoScenario: scenario,
        selectedMineId: 'mine-balaghat',
        selectedMine: MINES_DATA[0],
        layers: {
          ...get().layers,
          rainfallAccumulation: true,
          soilMoisture: true,
          prospectivity: false,
        },
      });
    } else if (scenario === 'scenario-c') {
      // Equipment Breakdown
      set({
        activeDemoScenario: scenario,
        selectedMineId: 'mine-munsar',
        selectedMine: MINES_DATA[4],
        layers: {
          ...get().layers,
          haulRoutes: true,
        },
      });
    } else if (scenario === 'scenario-d') {
      // Recovery Through Planning
      set({
        activeDemoScenario: scenario,
        selectedMineId: 'mine-balaghat',
        selectedMine: MINES_DATA[0],
      });
    } else {
      set({ activeDemoScenario: 'default' });
    }
  },

  isNexusOpen: false,
  setNexusOpen: (open) => set({ isNexusOpen: open }),
  toggleNexus: () => set((state) => ({ isNexusOpen: !state.isNexusOpen })),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  isBriefingActive: false,
  briefingSceneIndex: 0,
  startBriefing: () => set({ isBriefingActive: true, briefingSceneIndex: 0 }),
  nextBriefingScene: () =>
    set((state) => ({
      briefingSceneIndex: Math.min(state.briefingSceneIndex + 1, 7),
    })),
  prevBriefingScene: () =>
    set((state) => ({
      briefingSceneIndex: Math.max(state.briefingSceneIndex - 1, 0),
    })),
  stopBriefing: () => set({ isBriefingActive: false, briefingSceneIndex: 0 }),
}));

