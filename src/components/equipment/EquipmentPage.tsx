import React, { useState } from 'react';
import {
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  mine: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'STANDBY' | 'WARNING';
  utilization: number;
  engineHours: number;
  lastService: string;
  nextService: string;
}

const EQUIPMENT_FLEET: EquipmentItem[] = [
  {
    id: 'EQ-TRK-01',
    name: 'CAT 777E Haul Truck #1',
    type: 'Heavy Hauler (100t)',
    mine: 'Dongri Buzurg',
    status: 'OPERATIONAL',
    utilization: 94,
    engineHours: 4820,
    lastService: '12 Oct 2026',
    nextService: '25 Nov 2026'
  },
  {
    id: 'EQ-TRK-02',
    name: 'CAT 777E Haul Truck #2',
    type: 'Heavy Hauler (100t)',
    mine: 'Dongri Buzurg',
    status: 'OPERATIONAL',
    utilization: 91,
    engineHours: 4560,
    lastService: '14 Oct 2026',
    nextService: '28 Nov 2026'
  },
  {
    id: 'EQ-EXC-01',
    name: 'Komatsu PC1250 Excavator',
    type: 'Hydraulic Shovel (6.7m³)',
    mine: 'Balaghat Open Bench',
    status: 'OPERATIONAL',
    utilization: 88,
    engineHours: 6210,
    lastService: '02 Oct 2026',
    nextService: '15 Nov 2026'
  },
  {
    id: 'EQ-DRL-01',
    name: 'Sandvik DI550 Core Drill',
    type: 'Exploration Diamond Drill',
    mine: 'Tirodi Exploration',
    status: 'WARNING',
    utilization: 72,
    engineHours: 2890,
    lastService: '28 Sep 2026',
    nextService: '10 Nov 2026'
  },
  {
    id: 'EQ-WND-01',
    name: 'Underground Friction Winder #1',
    type: 'Shaft Hoist (12t skip)',
    mine: 'Balaghat Underground',
    status: 'OPERATIONAL',
    utilization: 98,
    engineHours: 14200,
    lastService: '20 Oct 2026',
    nextService: '05 Dec 2026'
  },
  {
    id: 'EQ-PMP-01',
    name: 'Kirloskar High-Lift Dewatering Pump',
    type: 'Mine Dewatering (450 m³/h)',
    mine: 'Ukwa Deep Sump',
    status: 'MAINTENANCE',
    utilization: 0,
    engineHours: 9100,
    lastService: '08 Nov 2026',
    nextService: '12 Nov 2026'
  }
];

export const EquipmentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredFleet = EQUIPMENT_FLEET.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.mine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-[#43D6A0]/15 text-[#43D6A0] border-[#43D6A0]/40';
      case 'WARNING':
        return 'bg-[#F4B860]/15 text-[#F4B860] border-[#F4B860]/40';
      case 'MAINTENANCE':
        return 'bg-[#FF6878]/15 text-[#FF6878] border-[#FF6878]/40';
      default:
        return 'bg-[#54D8E8]/15 text-[#54D8E8] border-[#54D8E8]/40';
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3045] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F4B860]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#F4B860] uppercase">
              OPERATIONAL FLEET TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Equipment Availability & Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAFC1] mt-0.5">
            Real-time telemetry, engine health, dispatch utilization, and scheduled maintenance.
          </p>
        </div>

        {/* Fleet KPI Highlights */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#101927] border border-[#1C3045]">
            <span className="text-[#9BAFC1]">FLEET UPTIME: </span>
            <span className="font-bold text-[#43D6A0]">92.4%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#101927] border border-[#1C3045]">
            <span className="text-[#9BAFC1]">ACTIVE RIGS: </span>
            <span className="font-bold text-white">48 / 52</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657A90]" />
          <input
            type="text"
            placeholder="Search equipment ID, rig name, or mine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#101927] border border-[#1C3045] text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'OPERATIONAL', 'WARNING', 'MAINTENANCE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#54D8E8] text-[#080C12]'
                  : 'bg-[#101927] border border-[#1C3045] text-[#9BAFC1] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="p-5 rounded-2xl border border-[#1C3045] bg-[#101927]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">RIG ID</th>
                <th className="py-2.5 px-3">EQUIPMENT ASSET</th>
                <th className="py-2.5 px-3">CONCESSION / SITE</th>
                <th className="py-2.5 px-3">UTILIZATION</th>
                <th className="py-2.5 px-3">ENGINE HOURS</th>
                <th className="py-2.5 px-3">NEXT SERVICE</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/60 text-[#F2F6FA]">
              {filteredFleet.map((eq) => (
                <tr key={eq.id} className="hover:bg-[#152235]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#54D8E8]">{eq.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{eq.name}</div>
                    <div className="text-[10px] text-[#9BAFC1]">{eq.type}</div>
                  </td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{eq.mine}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[#080C12] overflow-hidden">
                        <div
                          className="h-full bg-[#54D8E8]"
                          style={{ width: `${eq.utilization}%` }}
                        />
                      </div>
                      <span className="font-bold">{eq.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{eq.engineHours.toLocaleString()} hrs</td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{eq.nextService}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadge(eq.status)}`}>
                      {eq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

