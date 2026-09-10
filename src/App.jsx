import React, { useState, useEffect } from 'react';
import ScientificDataHub from './components/ScientificDataHub';
import ExpeditionsHub from './components/ExpeditionsHub';
import OutreachHub from './components/OutreachHub';
import MediaGallery from './components/MediaGallery';
import AIPolarAssistant from './components/AIPolarAssistant';
import { Compass, Globe, Shield, Terminal, Waves, Ship, Sun, Moon, GraduationCap, Camera } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('ocean');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('polar-hub-theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('polar-hub-theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      try {
        localStorage.setItem('polar-hub-theme', next);
      } catch (e) {}
      return next;
    });
  };

  const handleAskAI = (question) => {
    window.dispatchEvent(new CustomEvent('ask-polar-ai', { detail: { question, domain: 'outreach' } }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-150">
      {/* STITCH SCIENTIFIC TOP BAR - FULLY RESPONSIVE */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 md:py-0 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-4">
          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base md:text-lg whitespace-nowrap">
                  POLAR SCIENCE HUB
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex-shrink-0">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden lg:block whitespace-nowrap">
                Integrated Polar Science Knowledge & Data Platform
              </p>
            </div>
          </div>

          {/* MAIN MODULE NAVIGATION TABS - RESPONSIVE HORIZONTAL SCROLL ON MOBILE */}
          <nav className="order-3 md:order-2 w-full md:w-auto flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              id="nav-tab-ocean"
              onClick={() => setActiveTab('ocean')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'ocean'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Waves className={`w-3.5 h-3.5 ${activeTab === 'ocean' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden sm:inline">Ocean & Paleoclimate Hub</span>
              <span className="sm:hidden">Ocean Hub</span>
            </button>

            <button
              id="nav-tab-expeditions"
              onClick={() => setActiveTab('expeditions')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'expeditions'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Ship className={`w-3.5 h-3.5 ${activeTab === 'expeditions' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden sm:inline">Indian Expeditions & Logistics</span>
              <span className="sm:hidden">Expeditions</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'expeditions'
                    ? 'bg-sky-700 text-sky-100'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                87
              </span>
            </button>

            <button
              id="nav-tab-outreach"
              onClick={() => setActiveTab('outreach')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'outreach'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${activeTab === 'outreach' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden sm:inline">Polar Outreach & Trivia</span>
              <span className="sm:hidden">Outreach</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'outreach'
                    ? 'bg-sky-700 text-sky-100'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                25
              </span>
            </button>

            <button
              id="nav-tab-media"
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'media'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Camera className={`w-3.5 h-3.5 ${activeTab === 'media' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden sm:inline">Media & Video Gallery</span>
              <span className="sm:hidden">Media</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'media'
                    ? 'bg-sky-700 text-sky-100'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                21
              </span>
            </button>
          </nav>

          {/* RIGHT ACTION CLUSTER: TRUST BADGES & SUN/MOON THEME TOGGLE */}
          <div className="order-2 md:order-3 flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <div className="hidden 2xl:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Antarctica & Arctic Archives</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">MongoDB Verified</span>
              </div>
            </div>

            {/* INSTANT THEME TOGGLE: RESPONSIVE PADDING & TEXT */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer select-none active:scale-95 flex-shrink-0"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-600 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SUBHEADER ARCHIVE BANNER */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Integrated Polar Science Knowledge & Data Platform</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-sky-700 dark:text-sky-400 font-medium">Maitri: -18.4°C</span>
            <span className="hidden md:inline text-slate-500">Bharati: 69°24′S 76°11′E</span>
            <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-medium">
              Dome Fuji: 720kyr Base
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        <div className={activeTab === 'ocean' ? 'block' : 'hidden'}>
          <ScientificDataHub theme={theme} onNavigateToOutreach={() => setActiveTab('outreach')} />
        </div>
        <div className={activeTab === 'expeditions' ? 'block' : 'hidden'}>
          <ExpeditionsHub theme={theme} />
        </div>
        <div className={activeTab === 'outreach' ? 'block' : 'hidden'}>
          <OutreachHub theme={theme} onAskAI={handleAskAI} />
        </div>
        <div className={activeTab === 'media' ? 'block' : 'hidden'}>
          <MediaGallery theme={theme} />
        </div>
      </main>

      {/* GROUNDED AI POLAR ASSISTANT FLOATING DRAWER */}
      <AIPolarAssistant theme={theme} />

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2 transition-colors duration-150">
        <div className="flex items-center justify-center gap-2 font-mono text-slate-600 dark:text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>MongoDB: polar_hub • Express API: http://localhost:5000 • Vite React: http://localhost:5173</span>
        </div>
        <p>
          Smart India Hackathon 2026 — Polar Science Outreach, Knowledge Repository and Media Dissemination Portal
        </p>
      </footer>
    </div>
  );
}

export default App;
