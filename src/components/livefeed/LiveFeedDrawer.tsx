import React, { useState } from 'react';
import {
  Bell,
  X,
  Satellite,
  Compass,
  Activity,
  AlertTriangle,
  BrainCircuit,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface FeedEvent {
  id: string;
  category: 'SATELLITE' | 'GEOLOGY' | 'PRODUCTION' | 'RISK' | 'AI_MODEL';
  title: string;
  description: string;
  timestamp: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  mineName: string;
  linkTo?: string;
  synthetic: true;
}

const INITIAL_EVENTS: FeedEvent[] = [
  {
    id: 'ev-01',
    category: 'RISK',
    title: 'North Ridge Slope Micro-Instability Warning',
    description: 'InSAR deformation of 3.4mm detected over past 72h on Sector 4 pit wall. Haulage route diversion recommended.',
    timestamp: '2 min ago',
    severity: 'CRITICAL',
    mineName: 'Dongri Buzurg',
    linkTo: '/risk-center',
    synthetic: true
  },
  {
    id: 'ev-02',
    category: 'PRODUCTION',
    title: 'Daily Production Target Exceeded (+8.4%)',
    description: 'Balaghat Underground Shaft #2 hauled 2,840 metric tonnes against 2,620t planned target.',
    timestamp: '14 min ago',
    severity: 'SUCCESS',
    mineName: 'Balaghat',
    linkTo: '/production',
    synthetic: true
  },
  {
    id: 'ev-03',
    category: 'SATELLITE',
    title: 'New Sentinel-2 MSI Composite Ingested',
    description: 'Cloud cover 4.2% across Sausar Belt. NDVI and clay-carbonate ratio indices updated for prospect ranking.',
    timestamp: '42 min ago',
    severity: 'INFO',
    mineName: 'Regional Corridor',
    linkTo: '/satellite',
    synthetic: true
  },
  {
    id: 'ev-04',
    category: 'GEOLOGY',
    title: 'Borehole BH-2022-84 Mineralized Intersection',
    description: 'Core assay returned 41.2% Mn over 14.8m interval at -180m RL. High-grade braunite reef confirmed.',
    timestamp: '1 hr ago',
    severity: 'SUCCESS',
    mineName: 'Tirodi Extension',
    linkTo: '/exploration',
    synthetic: true
  },
  {
    id: 'ev-05',
    category: 'AI_MODEL',
    title: 'XGBoost Prospectivity Model Retrained (v2.4.1)',
    description: 'ROC-AUC improved to 0.941 across 142 training boreholes. Mandla corridor prospectivity upgraded to Very High.',
    timestamp: '3 hrs ago',
    severity: 'INFO',
    mineName: 'Mandla Corridor',
    linkTo: '/intelligence',
    synthetic: true
  },
  {
    id: 'ev-06',
    category: 'RISK',
    title: 'Heavy Rainfall Advisory (Monsoon Front)',
    description: 'Predicted 68mm rainfall over next 36 hours. Dewatering pumps tested and placed on active standby.',
    timestamp: '5 hrs ago',
    severity: 'WARNING',
    mineName: 'Ukwa Mine',
    linkTo: '/risk-center',
    synthetic: true
  }
];

interface LiveFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveFeedDrawer: React.FC<LiveFeedDrawerProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<FeedEvent[]>(INITIAL_EVENTS);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredEvents = filterCategory === 'ALL'
    ? events
    : events.filter((e) => e.category === filterCategory);

  const getSeverityBadge = (severity: FeedEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-[#FF6878]/15 border-[#FF6878] text-[#FF6878]';
      case 'WARNING':
        return 'bg-[#F4B860]/15 border-[#F4B860] text-[#F4B860]';
      case 'SUCCESS':
        return 'bg-[#43D6A0]/15 border-[#43D6A0] text-[#43D6A0]';
      default:
        return 'bg-[#54D8E8]/15 border-[#54D8E8] text-[#54D8E8]';
    }
  };

  const getCategoryIcon = (category: FeedEvent['category']) => {
    switch (category) {
      case 'SATELLITE': return <Satellite className="w-3.5 h-3.5" />;
      case 'GEOLOGY': return <Compass className="w-3.5 h-3.5" />;
      case 'PRODUCTION': return <Activity className="w-3.5 h-3.5" />;
      case 'RISK': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'AI_MODEL': return <BrainCircuit className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-md h-full bg-[#090D16] border-l border-[#1C3045] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#1C3045] flex items-center justify-between bg-[#101927]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-[#43D6A0] animate-pulse block shadow-[0_0_8px_#43D6A0]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                <span>LIVE OPERATIONAL FEED</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#54D8E8]/15 text-[#54D8E8]">
                  REAL-TIME
                </span>
              </h3>
              <span className="text-[10px] font-mono text-[#9BAFC1]">
                Geospatial telemetry & operational alerts
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1C3045] text-[#9BAFC1] hover:text-white hover:border-[#54D8E8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-[#1C3045] bg-[#0B0F19] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['ALL', 'RISK', 'PRODUCTION', 'GEOLOGY', 'SATELLITE', 'AI_MODEL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-[#54D8E8] text-[#060911]'
                  : 'bg-[#101927] border border-[#1C3045] text-[#9BAFC1] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event List Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#2C4866] transition-all group"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="flex items-center gap-1 text-[#9BAFC1]">
                  {getCategoryIcon(event.category)}
                  <span className="font-bold">{event.category}</span>
                  <span>&bull;</span>
                  <span className="text-white">{event.mineName}</span>
                </span>
                <span className="text-[#657A90] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.timestamp}
                </span>
              </div>

              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-white group-hover:text-[#54D8E8] transition-colors leading-snug">
                  {event.title}
                </h4>
                <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#9BAFC1] leading-relaxed mb-2.5">
                {event.description}
              </p>

              {/* Bottom Action Link */}
              {event.linkTo && (
                <NavLink
                  to={event.linkTo}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#54D8E8] hover:underline"
                >
                  <span>Investigate in workspace</span>
                  <ChevronRight className="w-3 h-3" />
                </NavLink>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Synthetic Disclaimer */}
        <div className="p-3 border-t border-[#1C3045] bg-[#0B0F19] text-[9px] font-mono text-[#657A90] text-center">
          SYNTHETIC DEMONSTRATION STREAM &bull; NOT VERIFIED LIVE MOIL DATA
        </div>
      </div>
    </div>
  );
};

