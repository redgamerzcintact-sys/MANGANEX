import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Search,
  MapPin,
  Flame,
  Layers,
  Box,
  Activity,
  AlertTriangle,
  GitFork,
  Sun,
  Moon,
  Sparkles,
  Command,
  ArrowRight,
  Clock,
  X,
  Compass,
  Database,
  Cpu,
  Sliders,
  Bot,
  ShieldCheck
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setSelectedMineId,
    setSelectedProspectId,
    toggleTheme,
    startBriefing,
    theme
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('manganex_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Keyboard shortcut listener (Ctrl+K / Cmd+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute Search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    let active = true;
    const runSearch = async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(debouncedQuery.trim());
        if (active && res?.results) {
          setResults(res.results);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    runSearch();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Focus on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isCommandPaletteOpen]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('manganex_recent_searches', JSON.stringify(updated));
  };

  const handleSelect = (item: any) => {
    if (item.title) saveRecentSearch(item.title);

    setCommandPaletteOpen(false);

    if (item.mineId) {
      setSelectedMineId(item.mineId);
    }
    if (item.prospectId) {
      setSelectedProspectId(item.prospectId);
    }
    if (item.action === 'briefing') {
      startBriefing();
      return;
    }
    if (item.action === 'theme') {
      toggleTheme();
      return;
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  const isDark = theme === 'dark';

  // Group results by category
  const groupedResults = results.reduce((acc: Record<string, any[]>, curr: any) => {
    const cat = curr.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mines & Cadastre':
        return MapPin;
      case 'Geological Targets':
        return Compass;
      case 'Formations & Faults':
        return Layers;
      case 'Boreholes & Assays':
        return Box;
      case 'Equipment Telemetry':
        return Activity;
      default:
        return Sparkles;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[75vh] ${
          isDark
            ? 'bg-[#0A121E] border-[#1C3045] text-white'
            : 'bg-white border-[#DCE4EC] text-[#172333]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className={`flex items-center px-4 py-3.5 border-b ${
            isDark ? 'border-[#1C3045] bg-[#0E1726]' : 'border-[#DCE4EC] bg-[#F8FAFC]'
          }`}
        >
          <Search className="h-5 w-5 text-[#54D8E8] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search mines, geological formations, boreholes, equipment, or commands..."
            className={`w-full bg-transparent text-sm font-mono outline-none ${
              isDark ? 'text-white placeholder-[#657A90]' : 'text-[#172333] placeholder-[#94A3B8]'
            }`}
          />
          {loading && (
            <span className="w-4 h-4 border-2 border-[#54D8E8] border-t-transparent rounded-full animate-spin shrink-0 mr-2" />
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#657A90] hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
              isDark
                ? 'bg-[#080C12] text-[#9BAFC1] border-[#1C3045]'
                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {query.trim() === '' ? (
            /* Recent Searches & Suggested Actions */
            <div className="space-y-4 p-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-mono uppercase text-[#657A90] mb-2 font-bold">
                    <span>Recent Searches</span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('manganex_recent_searches');
                      }}
                      className="hover:text-[#FF6878] text-[9.5px]"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(s)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                          isDark
                            ? 'bg-[#101927] border-[#1C3045] text-[#9BAFC1] hover:text-white hover:border-[#54D8E8]'
                            : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#64748B] hover:text-[#172333] hover:border-[#087F9B]'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-[#54D8E8]" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10.5px] font-mono uppercase text-[#657A90] mb-2 font-bold">
                  Quick Navigation & Intelligence Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { title: 'Interactive GIS Map Explorer', route: '/command-center', icon: MapPin },
                    { title: '3D Subsurface Digital Twin', route: '/subsurface', icon: Box },
                    { title: 'Manganese Prospectivity AI', route: '/exploration', icon: Compass },
                    { title: 'Sentinel-2 Satellite Studio', route: '/satellite', icon: Layers },
                    { title: 'Production Pulse & Shortfall', route: '/production', icon: Activity },
                    { title: 'Risk Intelligence Radar', route: '/risk-center', icon: AlertTriangle }
                  ].map((quick, i) => {
                    const Icon = quick.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCommandPaletteOpen(false);
                          navigate(quick.route);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#0E1726] border-[#1C3045] hover:border-[#54D8E8] text-[#9BAFC1] hover:text-white'
                            : 'bg-[#F8FAFC] border-[#DCE4EC] hover:border-[#087F9B] text-[#64748B] hover:text-[#172333]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-[#54D8E8]" />
                          <span className="text-xs font-bold">{quick.title}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs font-mono text-[#657A90]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#54D8E8]" />
              <p>No results found matching "{debouncedQuery}".</p>
              <p className="text-[10px] mt-1 text-[#4C647D]">
                Try searching for 'Balaghat', 'Mansar formation', 'Borehole', or 'Sentinel-2'.
              </p>
            </div>
          ) : (
            /* Categorized Search Results */
            (Object.entries(groupedResults) as [string, any[]][]).map(([category, items]) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 text-[10.5px] font-mono uppercase tracking-wider text-[#54D8E8] font-bold">
                    <CategoryIcon className="w-3.5 h-3.5" />
                    <span>{category}</span>
                    <span className="text-[9px] text-[#657A90]">({items.length})</span>
                  </div>

                  <div className="space-y-1">
                    {items.map((item: any) => {
                      const itemOverallIndex = results.indexOf(item);
                      const isHighlighted = itemOverallIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isHighlighted
                              ? isDark
                                ? 'bg-[#152235] border-[#54D8E8] shadow-[0_0_12px_rgba(84,216,232,0.2)]'
                                : 'bg-[#E0F2FE] border-[#0284C7]'
                              : isDark
                              ? 'bg-[#0E1726]/80 border-[#1C3045] hover:border-[#2C4866]'
                              : 'bg-white border-[#DCE4EC] hover:border-[#CBD5E1]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-[#101927] border border-[#1C3045] flex items-center justify-center text-[#54D8E8] shrink-0">
                              <CategoryIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-[#54D8E8]/15 text-[#54D8E8] border border-[#54D8E8]/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-mono block mt-0.5 ${
                                  isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'
                                }`}
                              >
                                {String(item.subtitle || '').replace(/&bull;/g, '•')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.coordinates && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#101927] text-[#657A90] border border-[#1C3045] hidden sm:inline">
                                {item.coordinates[0].toFixed(2)}°N, {item.coordinates[1].toFixed(2)}°E
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-[#54D8E8] opacity-75" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div
          className={`px-4 py-2 border-t text-[10px] font-mono flex items-center justify-between ${
            isDark ? 'border-[#1C3045] bg-[#0E1726] text-[#657A90]' : 'border-[#DCE4EC] bg-[#F8FAFC] text-[#94A3B8]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>&bull;</span>
            <span>ENTER Open</span>
            <span>&bull;</span>
            <span>ESC Close</span>
          </div>
          <span>MANGANEX Unified Cadastre Index</span>
        </div>
      </div>
    </div>
  );
};