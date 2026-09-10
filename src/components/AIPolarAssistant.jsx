import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  Database,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bot,
  Layers,
  Waves,
  Snowflake,
  Ship,
  FileText,
  Fish,
  Building2
} from 'lucide-react';

const QUICK_PROMPTS = [
  {
    label: "Tell me an interesting fact about Antarctic wildlife",
    shortLabel: "Antarctic Wildlife Facts",
    icon: Fish,
    domain: "outreach"
  },
  {
    label: "How do scientists live in sub-zero stations?",
    shortLabel: "Sub-Zero Station Life",
    icon: Building2,
    domain: "outreach"
  },
  {
    label: "Explain the food chain in the Southern Ocean",
    shortLabel: "Southern Ocean Food Chain",
    icon: Waves,
    domain: "outreach"
  },
  {
    label: "Why does CDW water warm up between 200m and 800m depth?",
    shortLabel: "CDW Warming (200-800m)",
    icon: Layers,
    domain: "scientific"
  },
  {
    label: "Which vessel was used in the 41st Indian Antarctic Expedition and what were the logistics?",
    shortLabel: "41st Expedition & Vessel Logistics",
    icon: Ship,
    domain: "expedition"
  }
];

export default function AIPolarAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: 'Hello! I am your Grounded Polar Research Assistant. Every response is strictly synthesized from live MongoDB measurements across NOAA WOA18 hydrographic profiles, Dome Fuji paleoclimate ice cores, and NCPOR Expedition archives, guaranteeing zero AI hallucination.',
      evidence: null,
      timestamp: 'Live Engine'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleAskEvent = (e) => {
      if (e.detail && e.detail.question) {
        setIsOpen(true);
        sendQuery(e.detail.question, e.detail.domain || 'outreach');
      }
    };
    window.addEventListener('ask-polar-ai', handleAskEvent);
    return () => window.removeEventListener('ask-polar-ai', handleAskEvent);
  }, []);

  const sendQuery = async (queryText, targetDomain = null) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsgId = Date.now().toString();
    const userMsg = {
      id: userMsgId,
      type: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const payload = {
        question: q,
        query: q
      };
      if (targetDomain) {
        payload.domain = targetDomain;
      } else if (/expedition|isea|vessel|ship|icebreaker|cargo|logistics|maitri|bharati|golovnin|ivan papanin|polar circle|cape town|goa|resupply/i.test(q)) {
        payload.domain = 'expedition';
      }

      const res = await fetch('http://localhost:5000/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = await res.json();
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg = {
        id: aiMsgId,
        type: 'ai',
        text: data.answer || 'No analysis returned from database.',
        evidence: data.evidence || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      // Auto-expand evidence for the latest message
      setExpandedEvidence((prev) => ({ ...prev, [aiMsgId]: true }));
    } catch (err) {
      console.error('Error querying AI polar assistant:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          text: `Backend communication error: ${err.message}. Please ensure the Express server is active on port 5000.`,
          evidence: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvidence = (msgId) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Polar Assistant"
          className="group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-bold text-xs shadow-xl shadow-slate-900/20 dark:shadow-sky-600/25 border border-slate-700 dark:border-sky-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </div>
          <span className="tracking-wide font-semibold hidden sm:inline">AI Polar Assistant</span>
          <span className="tracking-wide font-semibold sm:hidden">AI Assistant</span>
          <span className="text-[10px] bg-sky-700 text-white px-1.5 py-0.2 rounded-full font-mono hidden xs:inline">SIH Online</span>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* FLOATING DRAWER PANEL (DUAL THEME) */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-18 sm:inset-x-auto sm:right-6 sm:bottom-24 z-50 sm:w-[460px] max-h-[82vh] sm:max-h-[640px] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* HEADER */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">AI Polar Assistant</h3>
                  <span className="text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Zero Hallucination
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">Strictly cites live MongoDB polar archives</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QUICK PROMPTS CHIPS */}
          <div className="px-3 sm:px-4 py-2 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>Suggested Grounded Prompts:</span>
            </div>
            <div className="flex flex-col gap-1 max-h-24 sm:max-h-none overflow-y-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, i) => {
                const IconComponent = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendQuery(prompt.label, prompt.domain)}
                    disabled={loading}
                    className="group w-full text-left text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 text-slate-700 dark:text-slate-300 hover:text-sky-800 dark:hover:text-sky-300 transition-all flex items-center gap-2 disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{prompt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 max-h-[44vh] sm:max-h-[440px] bg-slate-50/40 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.type === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-sky-600 text-white font-medium rounded-br-none shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* VERIFIED EVIDENCE PILL FOR AI RESPONSES */}
                {msg.evidence && (
                  <div className="mt-2 max-w-[92%] w-full">
                    <button
                      onClick={() => toggleEvidence(msg.id)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Verified Database Evidence</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </span>
                      {expandedEvidence[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>

                    {expandedEvidence[msg.id] && (
                      <div className="mt-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[10px] space-y-2 font-mono text-slate-700 dark:text-slate-300 animate-in fade-in-50 shadow-xs">
                        {/* Standard Key-Values */}
                        {Object.entries(msg.evidence)
                          .filter(([k]) => k !== 'sources')
                          .map(([key, val]) => (
                            <div key={key} className="flex justify-between gap-2 py-0.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                              <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-right">{String(val)}</span>
                            </div>
                          ))}

                        {/* Array of Sources with Document & Page Citations */}
                        {Array.isArray(msg.evidence.sources) && msg.evidence.sources.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                            <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1 font-sans">
                              <FileText className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                              Official Grounding Citations:
                            </span>
                            {msg.evidence.sources.map((s, sIdx) => (
                              <div key={sIdx} className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                                <div className="text-sky-700 dark:text-sky-300 font-semibold flex items-center justify-between">
                                  <span>{s.title ? s.title : `[Source ${sIdx + 1}: ${s.source_document}]`}</span>
                                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                                    {s.page_number !== undefined ? `Page ${s.page_number}` : (s.id ? `#${s.id}` : '')}
                                  </span>
                                </div>
                                {(s.scientific_fact || s.excerpt) && (
                                  <p className="text-[9px] text-slate-600 dark:text-slate-300 font-sans italic line-clamp-2">
                                    &ldquo;{s.scientific_fact || s.excerpt}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300 p-2.5 bg-sky-50 dark:bg-sky-950/50 rounded-lg border border-sky-200 dark:border-sky-800 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
                <span>Querying MongoDB live collections with zero hallucination...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask polar question (e.g. 41st vessel, CDW warming)..."
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              aria-label="Send query"
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
