import React from 'react';
import { GoogleMapExplorer } from './GoogleMapExplorer';
import { Mine, GeologicalProspect } from '../../types';

interface InteractiveMapProps {
  selectedMine?: Mine;
  onSelectMine?: (mineId: string) => void;
  selectedProspect?: GeologicalProspect | null;
  onSelectProspect?: (prospectId: string) => void;
  selectedYear: number;
  onYearChange?: (year: number) => void;
  isPlayingYear: boolean;
  onTogglePlayYear?: () => void;
  activeLayers: {
    boreholes: boolean;
    seismic: boolean;
    groundwater: boolean;
    haulage: boolean;
    riskHeatmap: boolean;
  };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <GoogleMapExplorer
        selectedMine={props.selectedMine}
        onSelectMine={props.onSelectMine}
        selectedProspect={props.selectedProspect}
        onSelectProspect={props.onSelectProspect}
        selectedYear={props.selectedYear}
        activeLayers={props.activeLayers}
      />
    </div>
  );
};
