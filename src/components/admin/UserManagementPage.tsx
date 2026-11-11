import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'USR-001',
    name: 'Dr. Arindam Das',
    email: 'admin@moil.gov.in',
    role: 'ROLE_ADMIN',
    department: 'Director General of Mining Operations',
    status: 'ACTIVE',
    lastLogin: 'Today, 10:14 AM'
  },
  {
    id: 'USR-002',
    name: 'Priya Sharma',
    email: 'geologist@moil.gov.in',
    role: 'ROLE_GEOLOGIST',
    department: 'Central Geological Survey & Exploration',
    status: 'ACTIVE',
    lastLogin: 'Today, 09:30 AM'
  },
  {
    id: 'USR-003',
    name: 'Rajesh K. Verma',
    email: 'engineer@moil.gov.in',
    role: 'ROLE_ENGINEER',
    department: 'Balaghat Underground Extraction Division',
    status: 'ACTIVE',
    lastLogin: 'Yesterday, 04:12 PM'
  },
  {
    id: 'USR-004',
    name: 'Sneha Patel',
    email: 'analyst@moil.gov.in',
    role: 'ROLE_ANALYST',
    department: 'Geospatial Remote Sensing Wing',
    status: 'ACTIVE',
    lastLogin: 'Yesterday, 02:45 PM'
  },
  {
    id: 'USR-005',
    name: 'Suresh Patil',
    email: 'viewer@moil.gov.in',
    role: 'ROLE_VIEWER',
    department: 'Executive Planning Directorate',
    status: 'ACTIVE',
    lastLogin: '05 Nov 2026'
  }
];

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3045] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#54D8E8]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
              SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            User Management & Clearance
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAFC1] mt-0.5">
            Audit authorized personnel, allocate spatial layers, and review Spring Security credentials.
          </p>
        </div>

        <button
          onClick={() => alert('New user invitation protocol initiated.')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54D8E8] text-[#080C12] font-mono font-bold text-xs hover:bg-[#54D8E8]/90 transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>PROVISION ACCESS</span>
        </button>
      </div>

      {/* Search & Audit Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657A90]" />
          <input
            type="text"
            placeholder="Search personnel by name, email, or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#101927] border border-[#1C3045] text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
          />
        </div>

        <div className="text-xs font-mono text-[#9BAFC1] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#43D6A0]" />
          <span>Spring Security 6 &bull; BCrypt Encrypted Tokens</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-2xl border border-[#1C3045] bg-[#101927]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">USER ID</th>
                <th className="py-2.5 px-3">PERSONNEL NAME</th>
                <th className="py-2.5 px-3">OFFICIAL EMAIL</th>
                <th className="py-2.5 px-3">ASSIGNED ROLE</th>
                <th className="py-2.5 px-3">DIVISION / WING</th>
                <th className="py-2.5 px-3">LAST AUDIT LOGIN</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/60 text-[#F2F6FA]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#152235]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#54D8E8]">{u.id}</td>
                  <td className="py-3 px-3 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#168BFF]/15 text-[#168BFF] border border-[#168BFF]/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{u.department}</td>
                  <td className="py-3 px-3 text-[#657A90]">{u.lastLogin}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
                      {u.status}
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

