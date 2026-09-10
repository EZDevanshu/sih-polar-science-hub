import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Lightbulb,
  Compass,
  Fish,
  Building2,
  Mountain,
  Radio,
  Navigation,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Satellite,
  Waves
} from 'lucide-react';

const CATEGORY_META = {
  'All': { icon: Filter, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' },
  'Fauna & Wildlife': { icon: Fish, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  'Station Trivia': { icon: Building2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Glaciology Primer': { icon: Mountain, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800' },
  'Citizen Science': { icon: Radio, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
  'Southern Ocean Food Chain': { icon: Waves, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'Expedition Anecdotes': { icon: Navigation, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' }
};

export default function OutreachHub({ theme = 'dark', onAskAI }) {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOutreachRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/v1/outreach');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } else {
        throw new Error('Invalid response structure from outreach API');
      }
    } catch (err) {
      console.error('Failed to load outreach records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreachRecords();
  }, []);

  // Filtered records based on active category pill and live search
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesCat = selectedCategory === 'All' || rec.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = rec.title?.toLowerCase().includes(q);
      const descMatch = rec.description?.toLowerCase().includes(q);
      const factMatch = rec.scientific_fact?.toLowerCase().includes(q);
      const tagMatch = Array.isArray(rec.tags) && rec.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || factMatch || tagMatch;
    });
  }, [records, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* 1. TOP HERO BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Student Outreach & Polar Knowledge Hub
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              NCPOR Person 6 Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Polar Science Outreach, Trivia & Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore verified educational modules, wildlife adaptations, sub-zero station life, and sea ice dynamics across Antarctica.
          </p>
        </div>

        <button
          onClick={fetchOutreachRecords}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors disabled:opacity-50 shadow-xs cursor-pointer text-xs font-bold"
          title="Synchronize Outreach Records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* 2. REAL-TIME DATASET METRICS & SEA ICE CLIMATE BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Educational Modules</span>
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {records.length || '—'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Across 6 distinct polar knowledge themes
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sea Ice Soundings</span>
            <Satellite className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            3,653
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Daily passive microwave satellite points
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Antarctic Record Low</span>
            <Mountain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            1.79M km²
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Observed on 21 Feb 2023 via SSMIS-F18
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Indian Stations</span>
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            Maitri & Bharati
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Schirmacher Oasis & Larsemann Hills
          </div>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER WORKBENCH */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wildlife, penguins, station life, food chain, krill..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredRecords.length}</span> of {records.length} modules
          </div>
        </div>

        {/* Category Filter Pills - Responsive Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:pb-0">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] || { icon: Filter, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
            const Icon = meta.icon;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : meta.color}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ERROR STATE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs">
          Failed to load outreach records: {error}. Ensure backend is running at http://localhost:5000.
        </div>
      )}

      {/* 5. INTERACTIVE OUTREACH TRIVIA CARDS GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-sky-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading verified polar knowledge records from MongoDB...
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching outreach modules found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or selecting &quot;All&quot; categories above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((item) => {
            const meta = CATEGORY_META[item.category] || { icon: Filter, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' };
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs hover:shadow-md group"
              >
                <div className="space-y-3">
                  {/* Category Pill & ID */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.bg} ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                      {item.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      #{item.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Glowing "Did You Know?" Fact Banner */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-400/20">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Scientific Takeaway</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      &quot;{item.scientific_fact}&quot;
                    </p>
                  </div>

                  {/* Tags */}
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Attribution & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={item.source}>
                    {item.source}
                  </span>

                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`Tell me more about ${item.title}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                      <span>Ask AI</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
