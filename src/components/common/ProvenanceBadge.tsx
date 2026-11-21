import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export interface DataProvenanceInfo {
  status?: 'REAL' | 'DERIVED' | 'SYNTHETIC' | string;
  source?: string;
  retrieved_at?: string;
  retrievedAt?: string;
}

interface ProvenanceBadgeProps {
  provenance?: DataProvenanceInfo | null;
  status?: 'REAL' | 'DERIVED' | 'SYNTHETIC' | string;
  source?: string;
  retrievedAt?: string;
  className?: string;
  compact?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  status: propStatus,
  source: propSource,
  retrievedAt: propRetrievedAt,
  className = '',
  compact = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const status = (provenance?.status || propStatus || 'DERIVED').toUpperCase();
  const source = provenance?.source || propSource || 'MOIL Cadastre & Sensor Registry';
  const retrievedAt =
    provenance?.retrieved_at || provenance?.retrievedAt || propRetrievedAt || new Date().toISOString();

  const config =
    status === 'REAL'
      ? {
          label: 'REAL DATA',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          desc: 'Verified primary source telemetry / actual MOIL drillcore or shift records.',
        }
      : status === 'SYNTHETIC'
      ? {
          label: 'SYNTHETIC',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          desc: 'Calibrated synthetic benchmark dataset for national hackathon simulation.',
        }
      : {
          label: 'DERIVED',
          bg: 'bg-[#54D8E8]/10',
          border: 'border-[#54D8E8]/30',
          text: 'text-[#54D8E8]',
          dot: 'bg-[#54D8E8]',
          desc: 'Computed via scikit-learn ML models, geostatistical kriging, or physics simulators.',
        };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        title={`Provenance: ${status} | Source: ${source}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono tracking-wider transition-all hover:scale-105 select-none ${config.bg} ${config.border} ${config.text} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        <span className="font-bold">{config.label}</span>
        {!compact && (
          <span className="text-[9px] opacity-75 max-w-[130px] truncate hidden sm:inline">
            • {source.split('(')[0].trim()}
          </span>
        )}
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md p-5 rounded-2xl bg-[#090E18] border border-[#1C3045] shadow-2xl space-y-4 text-xs font-mono text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1C3045] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#54D8E8]" />
                <span className="font-heading font-bold text-sm text-white">DATA PROVENANCE SPEC</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-[#152235] text-[#9BAFC1] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#657A90] text-[10px] block uppercase">Provenance Status</span>
                <div className="inline-flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded border text-xs font-bold ${config.bg} ${config.border} ${config.text}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-[11px] text-[#9BAFC1]">{config.desc}</span>
                </div>
              </div>

              <div>
                <span className="text-[#657A90] text-[10px] block uppercase">Data Source / Engine</span>
                <p className="text-white mt-0.5 text-xs font-semibold">{source}</p>
              </div>

              <div>
                <span className="text-[#657A90] text-[10px] block uppercase">Retrieved / Computed At</span>
                <p className="text-[#54D8E8] mt-0.5 text-xs">{retrievedAt}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1726] border border-[#1C3045] text-[11px] text-[#9BAFC1] leading-relaxed">
                <p>
                  <strong>MOIL Data Governance:</strong> MANGANEX categorizes telemetry as REAL (sensor / actual collar), DERIVED (scikit-learn ML or physics simulation), or SYNTHETIC (calibrated demo benchmark).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

