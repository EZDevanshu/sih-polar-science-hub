import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ship,
  Compass,
  MapPin,
  Calendar,
  Anchor,
  FileText,
  Layers,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Snowflake,
  AlertCircle,
  X,
  BookOpen,
  Navigation,
  Globe2,
  Building2,
  Tag
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1/expeditions';

export default function ExpeditionsHub() {
  const [expeditions, setExpeditions] = useState([]);
  const [stats, setStats] = useState({
    total_expeditions_tracked: 0,
    unique_vessels_used: 0,
    stations_covered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVessel, setSelectedVessel] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal / Chunk drawer state
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docDetail, setDocDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chunkFilter, setChunkFilter] = useState('');

  // Fetch expeditions with query params
  const fetchExpeditions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedVessel !== 'ALL') params.append('vessel', selectedVessel);
      if (selectedStation !== 'ALL') params.append('station', selectedStation);

      const url = `${API_BASE}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API responded with HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setExpeditions(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        throw new Error(data.message || 'Failed to retrieve records');
      }
    } catch (err) {
      console.error('Failed to fetch expeditions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedVessel, selectedStation]);

  useEffect(() => {
    fetchExpeditions();
  }, [fetchExpeditions]);

  // Open modal and fetch chunk details
  const openExcerptModal = async (docId) => {
    setSelectedDocId(docId);
    setDetailLoading(true);
    setChunkFilter('');
    try {
      const res = await fetch(`${API_BASE}/${docId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setDocDetail(data.data);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDocId(null);
    setDocDetail(null);
    setChunkFilter('');
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sorted list
  const sortedExpeditions = useMemo(() => {
    return [...expeditions].sort((a, b) => {
      const yearA = parseInt(String(a.operational_year || '').match(/\d{4}/)?.[1] || '0', 10);
      const yearB = parseInt(String(b.operational_year || '').match(/\d{4}/)?.[1] || '0', 10);
      return sortOrder === 'DESC' ? yearB - yearA : yearA - yearB;
    });
  }, [expeditions, sortOrder]);

  // Filtered modal chunks
  const filteredChunks = useMemo(() => {
    if (!docDetail || !docDetail.chunks) return [];
    if (!chunkFilter.trim()) return docDetail.chunks;
    const q = chunkFilter.toLowerCase();
    return docDetail.chunks.filter(c =>
      (c.chunk_text || '').toLowerCase().includes(q) ||
      String(c.page || c.page_number).includes(q)
    );
  }, [docDetail, chunkFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Indian Antarctic Expeditions & Logistics Archive
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                NCPOR • Indian Antarctic Expedition Knowledge Repository (Person 4: Expeditions & Logistics)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            <Globe2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Gateway: Goa ⇄ Cape Town ⇄ Antarctica</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>MongoDB Ingested</span>
          </div>
        </div>
      </div>

      {/* 2. LIVE METRICS RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Expeditions Logged</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.total_expeditions_tracked}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Historical & modern mission reports</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vessels / Icebreakers Used</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.unique_vessels_used}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">MV Polar Circle, Golovnin, Papanin</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Polar Stations Serviced</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.stations_covered}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Maitri, Bharati, Dakshin Gangotri</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Primary Gateway</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                Cape Town / Goa
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Dronning Maud & Larsemann Hills</p>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expeditions, vessels, stations (e.g. '41st', 'Golovnin', 'Bharati', '2021', 'Maitri')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls Cluster */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Vessel Dropdown */}
            <select
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
              className="w-full sm:w-auto flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Vessels / Ships</option>
              <option value="Polar Circle">MV Polar Circle</option>
              <option value="Vasiliy Golovnin">MV Vasiliy Golovnin</option>
              <option value="Ivan Papanin">MV Ivan Papanin</option>
              <option value="Thuleland">MV Thuleland</option>
            </select>

            {/* Station Dropdown */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full sm:w-auto flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Stations / Ports</option>
              <option value="Maitri">Maitri (Schirmacher)</option>
              <option value="Bharati">Bharati (Larsemann)</option>
              <option value="Dakshin Gangotri">Dakshin Gangotri</option>
              <option value="Himadri">Himadri (Arctic)</option>
              <option value="Cape Town">Cape Town Gateway</option>
              <option value="Goa">Goa / Mormugao</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
              className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs flex-1 sm:flex-none whitespace-nowrap cursor-pointer"
              title="Toggle Chronological Sort"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {/* Reset */}
            {(searchQuery || selectedVessel !== 'ALL' || selectedStation !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVessel('ALL');
                  setSelectedStation('ALL');
                }}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700 hover:border-rose-300 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-700 flex items-center justify-center gap-1 transition-colors flex-1 sm:flex-none cursor-pointer"
                title="Clear all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Filters:</span>
          {['41st ISEA', 'Maitri Station', 'Bharati', 'Polar Circle', 'Cape Town', 'Austral Summer'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700 hover:border-sky-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. EXPEDITIONS LIST / CARDS */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading expedition records from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm text-rose-800 dark:text-rose-300 font-medium">Error loading expeditions: {error}</p>
          <button
            onClick={fetchExpeditions}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs text-white shadow-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : sortedExpeditions.length === 0 ? (
        <div className="py-16 text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl">
          <Ship className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No matching expeditions found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or resetting filters to view all 87 archived documents.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedVessel('ALL');
              setSelectedStation('ALL');
            }}
            className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 transition-colors shadow-xs"
          >
            Show All Expeditions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Showing {sortedExpeditions.length} expedition reports</span>
            <span className="font-mono">Database Collection: expeditions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedExpeditions.map((item) => {
              const hasVessel = Array.isArray(item.vessel) && item.vessel.length > 0;
              const hasPorts = Array.isArray(item.ports) && item.ports.length > 0;
              const hasHighlights = Array.isArray(item.operational_highlights) && item.operational_highlights.length > 0;

              return (
                <div
                  key={item.document_id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  {/* Top Metadata Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.expedition_number ? (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono">
                            {item.expedition_number}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                            Archive Record
                          </span>
                        )}

                        {item.operational_year && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            {item.operational_year}
                          </span>
                        )}

                        {item.season && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {item.season}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.document_type || 'Expedition Report'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {item.expedition_title || item.source_document.replace(/\.pdf$/i, '').replace(/[+_]/g, ' ')}
                    </h3>

                    {/* Route or Ports */}
                    {item.route ? (
                      <div className="flex items-center gap-1.5 text-xs text-sky-800 dark:text-sky-300 font-mono bg-sky-50/70 dark:bg-sky-950/40 px-2.5 py-1 rounded border border-sky-200/80 dark:border-sky-800">
                        <Navigation className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="truncate">{item.route}</span>
                      </div>
                    ) : hasPorts ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {item.ports.slice(0, 4).map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                              p.toLowerCase().includes('maitri')
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : p.toLowerCase().includes('bharati')
                                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                : p.toLowerCase().includes('gangotri')
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Vessels */}
                    {hasVessel && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <Ship className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Vessel:</span>
                        {item.vessel.map((v, vIdx) => (
                          <span
                            key={vIdx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Highlights Excerpt */}
                    {hasHighlights && (
                      <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">Logistics Highlights: </span>
                        {item.operational_highlights[0]}
                      </div>
                    )}

                    {/* Environmental Summary */}
                    {item.environmental_summary && (
                      <div className="pt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-sky-700 dark:text-sky-400 font-semibold not-italic">Environmental: </span>
                        {item.environmental_summary}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.page_count} Pages</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px] sm:max-w-[160px]">{item.source_document}</span>
                    </div>

                    <button
                      onClick={() => openExcerptModal(item.document_id)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Report Excerpts</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. REPORT EXCERPTS MODAL */}
      {selectedDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50 dark:bg-slate-950">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-mono font-semibold">
                    {docDetail?.document_id || selectedDocId}
                  </span>
                  <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
                    {docDetail?.expedition_title || docDetail?.source_document || 'Official Expedition Report'}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  Source: {docDetail?.source_document} • {docDetail?.chunks?.length || 0} Grounded Evidence Chunks
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer flex-shrink-0"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter extracted passages (e.g. 'vessel', 'cargo', 'weather', 'page 12')..."
                  value={chunkFilter}
                  onChange={(e) => setChunkFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Modal Content / Chunks List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
              {detailLoading ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading grounded text chunks...</p>
                </div>
              ) : filteredChunks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No excerpt passages match your filter criteria or this document is an image scan without embedded text.
                </div>
              ) : (
                filteredChunks.map((chunk, idx) => (
                  <div
                    key={chunk.chunk_id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                  >
                    {/* Chunk Top Citation Bar */}
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Chunk {idx + 1}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold">
                          Page {chunk.page !== undefined ? chunk.page : chunk.page_number}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        Citation: [Source: {chunk.source_document}, Page {chunk.page !== undefined ? chunk.page : chunk.page_number}]
                      </span>
                    </div>

                    {/* Chunk Text Passage */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                      &ldquo;{chunk.chunk_text}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono">
                Collection: expedition_chunks (Grounded AI Evidence)
              </span>
              <button
                onClick={closeModal}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
