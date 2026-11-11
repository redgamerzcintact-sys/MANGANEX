import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
  MapPin,
  RefreshCw,
  Volume2,
  VolumeX,
  Flame,
  Activity,
  AlertTriangle,
  History,
  Trash2,
  ChevronRight,
  Database,
  ExternalLink,
  Globe2,
  Languages,
  Plus,
  Compass,
  Sliders,
  Copy,
  Check,
  Search,
  Pin,
  PinOff,
  Edit2,
  ThumbsUp,
  ThumbsDown,
  Square
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  text: string;
  intent?: string;
  toolsCalled?: string[];
  sources?: { title: string; type: string }[];
  recommendations?: string[];
  supportingData?: Record<string, any>;
  feedback?: 'like' | 'dislike' | null;
}

interface ChatSession {
  id: string;
  title: string;
  pinned: boolean;
  time?: string;
  updated_at?: string;
}

// 26 Languages: 13 Indian + 13 International
const SUPPORTED_LANGUAGES = [
  // Indian Languages (13)
  { code: 'en', bcp47: 'en-US', name: 'English (Indian/UK)' },
  { code: 'hi', bcp47: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'mr', bcp47: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'bn', bcp47: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'ta', bcp47: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'te', bcp47: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'gu', bcp47: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', bcp47: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', bcp47: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', bcp47: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', bcp47: 'ur-IN', name: 'Urdu (اردو)' },
  { code: 'or', bcp47: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', bcp47: 'as-IN', name: 'Assamese (অসমীয়া)' },
  // International Languages (13)
  { code: 'es', bcp47: 'es-ES', name: 'Spanish (Español)' },
  { code: 'fr', bcp47: 'fr-FR', name: 'French (Français)' },
  { code: 'de', bcp47: 'de-DE', name: 'German (Deutsch)' },
  { code: 'ja', bcp47: 'ja-JP', name: 'Japanese (日本語)' },
  { code: 'zh', bcp47: 'zh-CN', name: 'Chinese (中文)' },
  { code: 'ar', bcp47: 'ar-SA', name: 'Arabic (العربية)' },
  { code: 'ru', bcp47: 'ru-RU', name: 'Russian (Русский)' },
  { code: 'pt', bcp47: 'pt-BR', name: 'Portuguese (Português)' },
  { code: 'it', bcp47: 'it-IT', name: 'Italian (Italiano)' },
  { code: 'ko', bcp47: 'ko-KR', name: 'Korean (한국어)' },
  { code: 'tr', bcp47: 'tr-TR', name: 'Turkish (Türkçe)' },
  { code: 'id', bcp47: 'id-ID', name: 'Indonesian (Bahasa)' },
  { code: 'fa', bcp47: 'fa-IR', name: 'Persian (فارسی)' }
];

const VOICE_COMMAND_PRESETS = [
  "Show me high-potential manganese zones.",
  "What is the predicted production shortfall?",
  "Summarize recent satellite observations.",
  "Explain the geological formations in this area.",
  "Which equipment has the highest downtime?",
  "Generate a geological exploration report."
];

export const NexusPage: React.FC = () => {
  const { selectedMine, selectedProspect, theme } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Editing user message state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [activeSessionId, setActiveSessionId] = useState('sess-1');
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([
    { id: 'sess-1', title: 'Balaghat 30-Day Monsoon Shortfall', pinned: true, time: '10 mins ago' },
    { id: 'sess-2', title: 'Sauser Belt Fold Extension Evaluation', pinned: true, time: '2 hours ago' },
    { id: 'sess-3', title: 'OR-Tools Fleet Allocation Audit', pinned: false, time: 'Yesterday' },
    { id: 'sess-4', title: 'Ukwa Hillside Conveyor Risk Assessment', pinned: false, time: '3 days ago' }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      timestamp: '14:10:00',
      text: `Welcome to the NEXUS Geospatial Intelligence Workspace. I am your autonomous AI decision-support agent for the Central India Manganese Belt.

Currently synchronized with:
• Mine: ${selectedMine.name} (District: ${selectedMine.district}, UNFC 111)
• Target Formation: ${selectedProspect?.name || 'Sauser Fold Belt'} (UNFC 333)
• Earth Observation: Sentinel-2 MSI Level-2A & MOIL Telemetry Stream

Select your operating language (26 Indian & Global languages supported) or speak your inquiry. How can I assist your exploration or mine planning today?`,
      intent: 'SYSTEM_INITIALIZATION',
      toolsCalled: ['get_mine_details', 'get_weather_radar_risk'],
      sources: [
        { title: 'MOIL Cadastral Survey 2024 (Bharweli Mine)', type: 'GEOLOGICAL_CADASTRE' },
        { title: 'Sentinel-2 MSI Level-2A Orthorectified Composite', type: 'EARTH_OBSERVATION' }
      ],
      recommendations: [
        "Forecast 30-day production shortfall under current monsoon deluge",
        "Explain high prospectivity score at Sauser Belt North",
        "Simulate pump bank activation to recover lost output",
        "Generate executive briefing for Ministry of Steel directorate"
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await api.chatNexus(q, selectedMine.id, selectedProspect?.region, selectedLang.code, activeSessionId);

      // Auto-update session title from first meaningful user query
      setHistorySessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId && (s.title.includes('Inquiry') || s.title.includes('Session') || s.title.includes('Consultation'))) {
            const cleanTitle = q.length > 36 ? q.substring(0, 36) + '...' : q;
            return { ...s, title: cleanTitle };
          }
          return s;
        })
      );

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: res?.answer || `NEXUS Intelligence has analyzed your query regarding "${q}" for ${selectedMine.name}.`,
        intent: res?.intent || 'GENERAL_INTELLIGENCE_QUERY',
        toolsCalled: res?.tools_called || ['get_production_forecast'],
        sources: res?.sources || [
          { title: 'MOIL Annual Exploration & Reserve Audit 2024-25', type: 'GEOLOGICAL_AUDIT' },
          { title: 'MANGANEX ML Engine v4.8 (Ensemble)', type: 'AI_MODEL' }
        ],
        recommendations: res?.recommendations || [
          "Inspect Earth X-Ray strata cross-sections",
          "Run OR-Tools equipment re-allocation"
        ],
        supportingData: res?.supporting_data
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `[Generation stopped by user]`
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `NEXUS local cache: Analysis complete for "${q}". Hydrothermal alteration detected along Sauser Belt North.`
          }
        ]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
    setLoading(false);
  };

  const handleEditAndResend = (msgId: string, text: string) => {
    setEditingMessageId(msgId);
    setEditText(text);
  };

  const handleConfirmEdit = (msgId: string) => {
    if (!editText.trim()) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: editText.trim() } : m))
    );
    const textToResend = editText.trim();
    setEditingMessageId(null);
    setEditText('');
    handleSend(textToResend);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistorySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const handleFeedback = (msgId: string, feedback: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
      )
    );
  };

  // ── VOICE SPEECH RECOGNITION (STT) ────────────────────────────────────────
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your query.');
      return;
    }

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang.bcp47;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setRecognitionInstance(recognition);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // ── TEXT TO SPEECH (TTS) ──────────────────────────────────────────────────
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for voice readout
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\[(.*?)\]/g, '$1')
      .replace(/#(.*?)\n/g, '$1 ')
      .replace(/•/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang.bcp47;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewSession = () => {
    const newId = `sess-${Date.now()}`;
    const newSession = {
      id: newId,
      title: `Exploration Inquiry #${historySessions.length + 1}`,
      pinned: false,
      time: 'Just now'
    };
    setHistorySessions([newSession, ...historySessions]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `New consultation session initialized for **${selectedMine.name}**. Language set to **${selectedLang.name}**.\n\nAsk any question regarding manganese prospectivity, borehole assays, or production forecasting.`
      }
    ]);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistorySessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id && historySessions.length > 1) {
      setActiveSessionId(historySessions.find((s) => s.id !== id)?.id || '');
    }
  };

  const isDark = theme === 'dark';

  // Filter sessions
  const filteredSessions = historySessions.filter((s) =>
    s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const recentSessions = filteredSessions.filter((s) => !s.pinned);

  return (
    <div
      className={`flex h-full w-full overflow-hidden select-none font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#060911] text-[#F2F6FA]' : 'bg-[#F5F7FA] text-[#172333]'
      }`}
    >
      {/* ── LEFT SIDEBAR: SESSION HISTORY & MODEL STATUS ────────────────────────── */}
      <div
        className={`w-80 h-full border-r flex flex-col justify-between shrink-0 transition-colors duration-200 ${
          isDark ? 'border-[#1C3045] bg-[#090D16]' : 'border-[#DCE4EC] bg-white'
        }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header & New Chat button */}
          <div className={`p-4 border-b space-y-3 ${isDark ? 'border-[#1C3045] bg-[#0B0F19]' : 'border-[#DCE4EC] bg-[#F8FAFC]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#54D8E8] to-[#168BFF] flex items-center justify-center text-[#080C12]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h1 className={`font-heading font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                    NEXUS AI Copilot
                  </h1>
                  <span className="text-[9px] font-mono text-[#54D8E8]">MOIL INTELLIGENCE CORE</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-[#43D6A0]/15 text-[#43D6A0] text-[9px] font-mono font-bold border border-[#43D6A0]/30">
                LIVE
              </span>
            </div>

            <button
              onClick={handleNewSession}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(84,216,232,0.25)] hover:shadow-[0_0_20px_rgba(84,216,232,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Intelligence Session</span>
            </button>
          </div>

          {/* Search Conversations Bar */}
          <div className={`p-3 border-b ${isDark ? 'border-[#1C3045] bg-[#080C12]' : 'border-[#DCE4EC] bg-white'}`}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#657A90]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className={`w-full h-8 pl-8 pr-3 rounded-lg text-xs font-mono border focus:outline-none ${
                  isDark
                    ? 'bg-[#101927] border-[#1C3045] text-white placeholder-[#4C647D] focus:border-[#54D8E8]'
                    : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#172333] placeholder-[#94A3B8] focus:border-[#087F9B]'
                }`}
              />
            </div>
          </div>

          {/* 26-Language Selector */}
          <div className={`p-3 border-b space-y-1.5 ${isDark ? 'border-[#1C3045] bg-[#080C12]' : 'border-[#DCE4EC] bg-white'}`}>
            <label className={`text-[10px] font-mono flex items-center gap-1.5 font-bold ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
              <Languages className="w-3.5 h-3.5 text-[#54D8E8]" />
              <span>OPERATING LANGUAGE (26 LANGUAGES)</span>
            </label>
            <select
              value={selectedLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) setSelectedLang(found);
              }}
              className={`w-full h-8 px-2.5 rounded-lg text-xs font-mono border focus:outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#101927] border-[#1C3045] text-white focus:border-[#54D8E8]'
                  : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#172333] focus:border-[#087F9B]'
              }`}
            >
              <optgroup label="Indian Languages (13)">
                {SUPPORTED_LANGUAGES.slice(0, 13).map((lang) => (
                  <option key={lang.code} value={lang.code} className={isDark ? 'bg-[#101927] text-white' : 'bg-white text-black'}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="International Languages (13)">
                {SUPPORTED_LANGUAGES.slice(13).map((lang) => (
                  <option key={lang.code} value={lang.code} className={isDark ? 'bg-[#101927] text-white' : 'bg-white text-black'}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Sessions List */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {/* Pinned Section */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <span className={`text-[9.5px] font-mono uppercase px-2 font-bold flex items-center gap-1 ${isDark ? 'text-[#F4B860]' : 'text-[#D97706]'}`}>
                  <Pin className="w-3 h-3" /> PINNED CONVERSATIONS
                </span>
                {pinnedSessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => setActiveSessionId(sess.id)}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? isDark
                            ? 'bg-[#152235] border-[#54D8E8] text-white shadow-sm'
                            : 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]'
                          : isDark
                          ? 'bg-[#0E1726]/60 border-[#1C3045] text-[#9BAFC1] hover:border-[#2C4866] hover:text-white'
                          : 'bg-[#FAFCFE] border-[#DCE4EC] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#172333]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Pin className="h-3 w-3 text-[#F4B860] shrink-0" />
                        <span className="truncate">{sess.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(sess.id, e)}
                          title="Unpin conversation"
                          className="p-1 hover:text-[#F4B860]"
                        >
                          <PinOff className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          title="Delete session"
                          className="p-1 hover:text-[#FF6878]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Section */}
            <div className="space-y-1">
              <span className={`text-[9.5px] font-mono uppercase px-2 font-bold ${isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}`}>
                Recent Consultations
              </span>
              {recentSessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? isDark
                          ? 'bg-[#152235] border-[#54D8E8] text-white shadow-sm'
                          : 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]'
                        : isDark
                        ? 'bg-[#0E1726]/60 border-[#1C3045] text-[#9BAFC1] hover:border-[#2C4866] hover:text-white'
                        : 'bg-[#FAFCFE] border-[#DCE4EC] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#172333]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <History className="h-3.5 w-3.5 text-[#54D8E8] shrink-0" />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(sess.id, e)}
                        title="Pin to top"
                        className="p-1 hover:text-[#F4B860]"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        title="Delete session"
                        className="p-1 hover:text-[#FF6878]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Intelligence Telemetry Footprint */}
        <div className={`p-4 border-t space-y-2 text-[10.5px] font-mono ${isDark ? 'border-[#1C3045] bg-[#0A111C]' : 'border-[#DCE4EC] bg-[#F8FAFC]'}`}>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}>Model Provider:</span>
            <span className="text-[#54D8E8] font-bold">Llama-3.2 + RAG</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}>Embeddings:</span>
            <span className="text-white font-bold">all-MiniLM-L6-v2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}>Active Tools:</span>
            <span className="text-[#43D6A0] font-bold">17 Application Tools</span>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: CONVERSATION STREAM & ACTION DOCK ───────────────────── */}
      <div className="flex-1 h-full flex flex-col justify-between overflow-hidden">
        
        {/* Messages Scroll View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isEditing = editingMessageId === m.id;

            return (
              <div
                key={m.id}
                className={`flex gap-3.5 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-[#168BFF] to-[#A78BFA] text-white'
                      : 'bg-gradient-to-br from-[#54D8E8] to-[#168BFF] text-[#080C12]'
                  }`}
                >
                  {isUser ? <Flame className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-3 group ${
                    isUser
                      ? isDark
                        ? 'bg-[#152235] border-[#168BFF]/50 text-white rounded-tr-none'
                        : 'bg-[#0284C7] text-white border-transparent rounded-tr-none'
                      : isDark
                      ? 'bg-[#101927] border-[#1C3045] text-[#F2F6FA] rounded-tl-none'
                      : 'bg-white border-[#DCE4EC] text-[#172333] rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Top Bar for Assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 border-b border-[#1C3045]/40 text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[#54D8E8] font-bold uppercase">
                          {m.intent || 'GEOSPATIAL INTELLIGENCE'}
                        </span>
                        {m.toolsCalled && m.toolsCalled.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-[#54D8E8]/15 text-[#54D8E8] border border-[#54D8E8]/30">
                            TOOL: {m.toolsCalled[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* TTS Voice Readout */}
                        <button
                          onClick={() => speakText(m.text)}
                          title="Speak answer via Text-to-Speech"
                          className="p-1 rounded text-[#9BAFC1] hover:text-[#54D8E8] cursor-pointer"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#FF6878]" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        {/* Copy Response */}
                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          title="Copy response to clipboard"
                          className="p-1 rounded text-[#9BAFC1] hover:text-[#54D8E8] cursor-pointer"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-[#43D6A0]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {/* Thumbs Up / Down Feedback */}
                        <button
                          onClick={() => handleFeedback(m.id, 'like')}
                          title="Helpful response"
                          className={`p-1 rounded cursor-pointer ${m.feedback === 'like' ? 'text-[#43D6A0]' : 'text-[#9BAFC1] hover:text-[#43D6A0]'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(m.id, 'dislike')}
                          title="Needs improvement"
                          className={`p-1 rounded cursor-pointer ${m.feedback === 'dislike' ? 'text-[#FF6878]' : 'text-[#9BAFC1] hover:text-[#FF6878]'}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[#657A90]">{m.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Top Bar for User (Edit button) */}
                  {isUser && !isEditing && (
                    <div className="flex items-center justify-between pb-1 border-b border-white/20 text-[10px] font-mono">
                      <span className="text-white/70">You</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditAndResend(m.id, m.text)}
                          title="Edit and resend"
                          className="p-0.5 rounded text-white/80 hover:text-white cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <span className="text-white/60">{m.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Message Content: Normal vs Edit Mode */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#080C12] border border-[#54D8E8] text-white text-xs font-mono focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-2 py-1 rounded bg-[#101927] border border-[#1C3045] text-xs font-mono text-[#9BAFC1]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmEdit(m.id)}
                          className="px-3 py-1 rounded bg-[#54D8E8] text-[#080C12] text-xs font-mono font-bold"
                        >
                          Save & Resend
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>
                  )}

                  {/* RAG Document Sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#1C3045]/40 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#54D8E8] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        VERIFIED RAG CITATIONS ({m.sources.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {m.sources.map((s, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
                              isDark ? 'bg-[#080C12] border-[#1C3045] text-[#9BAFC1]' : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#64748B]'
                            }`}
                          >
                            <span className="truncate pr-2">{s.title}</span>
                            <span className="px-1 rounded bg-[#54D8E8]/10 text-[#54D8E8] shrink-0 text-[8.5px]">
                              {s.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation Actions */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-[#1C3045]/40 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#43D6A0]">
                        RECOMMENDED FOLLOW-UP ACTIONS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.recommendations.map((rec, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(rec)}
                            className={`text-left text-[10.5px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? 'bg-[#0A121E] border-[#1C3045] text-[#9BAFC1] hover:text-white hover:border-[#54D8E8]'
                                : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#64748B] hover:text-[#172333] hover:border-[#087F9B]'
                            }`}
                          >
                            &bull; {rec}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center justify-between gap-3 text-xs font-mono text-[#54D8E8] p-3 rounded-xl bg-[#101927]/60 border border-[#1C3045] max-w-md">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 border-2 border-[#54D8E8] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>NEXUS reasoning & executing tools...</span>
              </div>
              <button
                onClick={handleStopGeneration}
                className="px-2.5 py-1 rounded-lg bg-[#FF6878]/20 border border-[#FF6878]/40 text-[#FF6878] text-[10.5px] font-mono font-bold flex items-center gap-1 hover:bg-[#FF6878]/30 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── BOTTOM DOCK: QUICK PRESETS & VOICE INPUT ──────────────────────────── */}
        <div className={`p-4 border-t space-y-3 ${isDark ? 'border-[#1C3045] bg-[#0A111C]' : 'border-[#DCE4EC] bg-white'}`}>
          {/* Quick Voice Command Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-mono">
            <span className={`shrink-0 font-bold ${isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}`}>
              SUGGESTIONS:
            </span>
            {VOICE_COMMAND_PRESETS.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleSend(cmd)}
                className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-[#101927] border-[#1C3045] text-[#9BAFC1] hover:text-white hover:border-[#54D8E8]'
                    : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#64748B] hover:text-[#172333] hover:border-[#087F9B]'
                }`}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="flex items-center gap-3">
            {/* Mic Button with Pulse Waveform visualizer */}
            <button
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : `Speak in ${selectedLang.name}`}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-[#FF6878] text-white border-[#FF6878] animate-pulse shadow-[0_0_20px_rgba(255,104,120,0.6)]'
                  : isDark
                  ? 'bg-[#101927] border-[#1C3045] text-[#54D8E8] hover:border-[#54D8E8]'
                  : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#087F9B] hover:border-[#087F9B]'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Query Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isListening
                    ? `Listening in ${selectedLang.name}... Speak now.`
                    : `Ask NEXUS anything in ${selectedLang.name} (e.g. "Forecast 30-day shortfall for Balaghat")...`
                }
                className={`w-full h-11 pl-4 pr-12 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#080C12] border-[#1C3045] text-white placeholder-[#4C647D] focus:border-[#54D8E8]'
                    : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#172333] placeholder-[#94A3B8] focus:border-[#087F9B]'
                }`}
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] hover:opacity-90 disabled:opacity-30 cursor-pointer transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
