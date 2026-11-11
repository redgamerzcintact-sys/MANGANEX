import React, { useState } from 'react';
import {
  Trees,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const SENSOR_TIMELINE = [
  { date: '01 Nov', dustPpm: 42, groundwaterM: -24.2, rainfallMm: 0 },
  { date: '03 Nov', dustPpm: 55, groundwaterM: -24.1, rainfallMm: 4 },
  { date: '05 Nov', dustPpm: 38, groundwaterM: -23.8, rainfallMm: 18 },
  { date: '07 Nov', dustPpm: 64, groundwaterM: -23.5, rainfallMm: 2 },
  { date: '09 Nov', dustPpm: 48, groundwaterM: -23.4, rainfallMm: 0 }
];

export const EnvironmentalPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3045] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#43D6A0]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#43D6A0] uppercase">
              SUSTAINABILITY & STATUTORY ESG COMPLIANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Environmental & Water Table Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAFC1] mt-0.5">
            Piezometer water tables, ambient dust emissions, tailing dam moisture, and reforestation index.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#101927] border border-[#1C3045]">
            <span className="text-[#9BAFC1]">ESG RATING: </span>
            <span className="font-bold text-[#43D6A0]">A+ EXCELLENT</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl border border-[#1C3045] bg-[#101927]">
          <div className="flex items-center justify-between text-xs text-[#9BAFC1] mb-1">
            <span>PIEZOMETER DEPTH</span>
            <Droplets className="w-4 h-4 text-[#54D8E8]" />
          </div>
          <div className="text-2xl font-bold text-white">-23.4 m</div>
          <span className="text-[10px] text-[#43D6A0]">Safe Recharge Equilibrium</span>
        </div>

        <div className="p-4 rounded-xl border border-[#1C3045] bg-[#101927]">
          <div className="flex items-center justify-between text-xs text-[#9BAFC1] mb-1">
            <span>AMBIENT PM10 DUST</span>
            <Wind className="w-4 h-4 text-[#F4B860]" />
          </div>
          <div className="text-2xl font-bold text-white">48 &mu;g/m&sup3;</div>
          <span className="text-[10px] text-[#43D6A0]">Below 100 &mu;g Limit</span>
        </div>

        <div className="p-4 rounded-xl border border-[#1C3045] bg-[#101927]">
          <div className="flex items-center justify-between text-xs text-[#9BAFC1] mb-1">
            <span>SURFACE REFORESTATION</span>
            <Trees className="w-4 h-4 text-[#43D6A0]" />
          </div>
          <div className="text-2xl font-bold text-white">+14.2%</div>
          <span className="text-[10px] text-[#43D6A0]">NDVI Green Canopy Growth</span>
        </div>

        <div className="p-4 rounded-xl border border-[#1C3045] bg-[#101927]">
          <div className="flex items-center justify-between text-xs text-[#9BAFC1] mb-1">
            <span>TAILING DAM STABILITY</span>
            <ShieldCheck className="w-4 h-4 text-[#54D8E8]" />
          </div>
          <div className="text-2xl font-bold text-white">NORMAL</div>
          <span className="text-[10px] text-[#43D6A0]">Pore Pressure Stable</span>
        </div>
      </div>

      {/* Environmental Chart */}
      <div className="p-5 rounded-2xl border border-[#1C3045] bg-[#101927]">
        <h3 className="font-heading font-bold text-base text-white mb-1">
          7-Day Air Quality & Groundwater Equilibrium
        </h3>
        <p className="text-xs text-[#9BAFC1] mb-4">
          Telemetry gathered from stationary telemetry towers around Balaghat & Dongri Buzurg concessions.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SENSOR_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" vertical={false} />
              <XAxis dataKey="date" stroke="#657A90" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#657A90" fontSize={11} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D16',
                  border: '1px solid #1C3045',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Line
                type="monotone"
                dataKey="dustPpm"
                name="PM10 Dust (µg/m³)"
                stroke="#F4B860"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
