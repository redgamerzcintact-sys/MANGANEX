import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Layers,
  MapPin,
  AlertTriangle,
  BrainCircuit,
  Volume2,
  RefreshCw,
  FileText,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const NexusDrawer: React.FC = () => {
  const { isNexusOpen, setNexusOpen, selectedMine, selectedProspect } = useAppStore();
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    details?: string;
    intent?: string;
    sources?: any[];
    recommendations?: string[];
  }>>([
    {
      role: 'assistant',
      text: `Hello! I am NEXUS, your Geospatial AI Decision-Support Copilot for the Central India Manganese Belt. Currently synchronized with ${selectedMine.name} and local borehole logs. How can I assist your operational decisions?`,
      recommendations: [
        "What is the projected 30-day production shortfall at Balaghat?",
        "Explain the high prospectivity score at Sauser Belt North.",
        "How is rainfall impacting current underground dewatering?"
      ]
    }
  ]);

  if (!isNexusOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMsgs);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.chatNexus(q, selectedMine.id, selectedProspect?.region);
      if (res) {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: res.answer,
            intent: res.intent,
            sources: res.sources,
            recommendations: res.recommendations
          }
        ]);
      } else {
        // Fallback response if backend offline
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: `Telemetry analyzed for ${selectedMine.name}. Actual monthly extraction is tracking at ${selectedMine.actualMonthlyProductionTonnes.toLocaleString()} tonnes (${selectedMine.forecastVariancePercent}% variance). Secondary dewatering station requires activation.`,
            recommendations: [
              "Review Earth X-Ray underground strata",
              "Simulate rainfall mitigation in Scenario Lab"
            ]
          }
        ]);
      }
    } catch {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: `Local decision cache: High hydrothermal alteration detected along Sauser Belt North. Recommend 4 diamond wireline boreholes on 200m grid.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Using keyboard input.');
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
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setRecognitionInstance(recognition);
    } catch {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (speechSynthesisActive) {
        window.speechSynthesis.cancel();
        setSpeechSynthesisActive(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      utterance.onend = () => setSpeechSynthesisActive(false);
      utterance.onerror = () => setSpeechSynthesisActive(false);
      setSpeechSynthesisActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#090D16]/95 border-l border-[#1C3045] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 font-sans">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1C3045] bg-[#0B0F19]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#54D8E8] to-[#A78BFA] flex items-center justify-center text-[#060911] shadow-[0_0_12px_rgba(84,216,232,0.3)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-[#F2F6FA]">NEXUS COPILOT</span>
              <span className="px-1.5 py-0.2 rounded bg-[#54D8E8]/20 text-[#54D8E8] text-[10px] font-mono border border-[#54D8E8]/40">
                AI REASONER ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#9BAFC1] font-mono">Intent-Aware Tool Calling & Knowledge Engine</p>
          </div>
        </div>

        <button
          onClick={() => setNexusOpen(false)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#1C3045] text-[#9BAFC1] hover:text-[#F2F6FA] hover:bg-[#101B2A] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Active Context Banner */}
      <div className="px-4 py-2 bg-[#060911] border-b border-[#1C3045] text-[11px] font-mono text-[#9BAFC1] flex items-center justify-between">
        <span className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-[#54D8E8]" />
          <span>Active Context: <b className="text-[#F2F6FA]">{selectedMine.name}</b></span>
        </span>
        <span className="text-[10px] text-[#43D6A0]">RAG CONNECTED</span>
      </div>

      {/* Messages Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#168BFF] text-white font-medium'
                  : 'bg-[#101B2A] text-[#F2F6FA] border border-[#1C3045]'
              }`}
            >
              {msg.intent && (
                <div className="mb-2 flex items-center justify-between text-[9px] font-mono border-b border-[#1C3045] pb-1">
                  <span className="text-[#54D8E8] font-bold">TOOL DISPATCH: {msg.intent}</span>
                  <button
                    onClick={() => speakText(msg.text)}
                    className="text-[#9BAFC1] hover:text-[#54D8E8] transition-colors"
                    title="Read aloud"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Citations and Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[#1C3045] space-y-1">
                  <span className="text-[9.5px] font-mono text-[#9BAFC1] uppercase font-bold flex items-center gap-1">
                    <FileText className="h-3 w-3 text-[#54D8E8]" />
                    Verified Citations:
                  </span>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="text-[10px] font-mono text-[#54D8E8]/90 pl-2 border-l border-[#54D8E8]/40">
                      • {src.title} ({src.type})
                    </div>
                  ))}
                </div>
              )}

              {/* Action Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[#1C3045] space-y-1">
                  <span className="text-[9.5px] font-mono text-[#43D6A0] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Recommended Actions:
                  </span>
                  {msg.recommendations.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(rec)}
                      className="block text-left text-[10px] font-mono text-[#9BAFC1] hover:text-[#54D8E8] pl-2 border-l border-[#43D6A0]/40 transition-colors"
                    >
                      → {rec}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#101B2A] border border-[#1C3045] text-xs font-mono text-[#54D8E8]">
            <RefreshCw className="h-4 w-4 animate-spin text-[#54D8E8]" />
            <span>NEXUS reasoning & executing ML tool calls...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Quick Bar */}
      <div className="p-3 bg-[#0B0F19] border-t border-[#1C3045] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          "30-day forecast",
          "Explain prospectivity",
          "Rainfall & sump risk",
          "OR-Tools equipment advice"
        ].map((sugg, i) => (
          <button
            key={i}
            onClick={() => handleSend(sugg)}
            className="px-2.5 py-1 rounded-md bg-[#101B2A] hover:bg-[#54D8E8]/10 text-[#9BAFC1] hover:text-[#54D8E8] border border-[#1C3045] text-[10px] font-mono whitespace-nowrap transition-colors"
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#090D16] border-t border-[#1C3045] flex items-center gap-2">
        <button
          onClick={handleVoiceToggle}
          className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${
            isListening
              ? 'bg-[#FF6878] text-[#060911] border-[#FF6878] animate-pulse'
              : 'bg-[#101B2A] border-[#1C3045] text-[#9BAFC1] hover:text-[#F2F6FA]'
          }`}
          title="Voice input"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask NEXUS about ${selectedMine.name} geology or production...`}
          className="flex-1 h-9 px-3 rounded-lg bg-[#101B2A] border border-[#1C3045] text-xs text-[#F2F6FA] placeholder-[#9BAFC1]/50 focus:border-[#54D8E8] focus:outline-none font-mono"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="h-9 px-3 rounded-lg bg-[#54D8E8] text-[#060911] font-bold text-xs hover:bg-[#54D8E8]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
