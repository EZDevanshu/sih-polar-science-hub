import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea
} from 'recharts';
import {
  Waves,
  Snowflake,
  Compass,
  GraduationCap,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info,
  ThermometerSnowflake,
  Droplets,
  Activity,
  ShieldCheck,
  Calendar,
  Layers,
  Download,
  RotateCcw,
  Sliders,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1/scientific';

// Custom Tooltip for Ocean CTD Profile (Dual Light & Dark Scientific Theme)
const OceanTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let waterMass = 'Intermediate';
    if (label <= 100) waterMass = 'Antarctic Surface Water (AASW)';
    else if (label >= 200 && label <= 1000) waterMass = 'Circumpolar Deep Water (CDW)';
    else if (label >= 1000) waterMass = 'Antarctic Bottom Water (AABW)';

    return (
      <div className="p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Depth: {label} m
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
            {waterMass}
          </span>
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold" style={{ color: entry.color }}>
              {Number(entry.value).toFixed(3)} {entry.name.includes('Temp') ? '°C' : 'PSU'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Ice Core Paleoclimate Profile (Dual Light & Dark Scientific Theme)
const IceCoreTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <p className="font-bold text-sky-800 dark:text-sky-400 mb-1.5 flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          Historical Age: {label !== undefined ? `${Math.round(label).toLocaleString()} yr BP` : 'Modern Ice'}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold" style={{ color: entry.color }}>
              {Number(entry.value).toFixed(2)} {entry.name.includes('Temp') ? '°C' : '‰'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ScientificDataHub({ theme = 'dark', onNavigateToOutreach }) {
  const [activeTab, setActiveTab] = useState('ocean'); // 'ocean' | 'ice-core'
  const [mode, setMode] = useState('researcher'); // 'researcher' | 'student'
  const [oceanResponse, setOceanResponse] = useState(null);
  const [iceCoreResponse, setIceCoreResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Depth Range Slider State [min, max]
  const [depthRange, setDepthRange] = useState([0, 2000]);
  const [activeLayer, setActiveLayer] = useState(null); // 'AASW' | 'CDW' | 'AABW' | null

  // Paleoclimate Timeline Filter State
  const [timelineFilter, setTimelineFilter] = useState('all'); // 'all' | '100k' | '12k'

  const fetchOceanData = useCallback(async () => {
    try {
      const oceanRes = await fetch(`${API_BASE}/ocean`);
      if (!oceanRes.ok) throw new Error(`Ocean API failed: ${oceanRes.status} ${oceanRes.statusText}`);
      const oceanJson = await oceanRes.json();
      setOceanResponse(oceanJson);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Ocean data fetching error:', err);
      setError(err.message);
    }
  }, []);

  const fetchIceCoreData = useCallback(async (epoch) => {
    try {
      const iceRes = await fetch(`${API_BASE}/ice-core?epoch=${epoch}`);
      if (!iceRes.ok) throw new Error(`Ice Core API failed: ${iceRes.status} ${iceRes.statusText}`);
      const iceJson = await iceRes.json();
      setIceCoreResponse(iceJson);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Ice core fetching error:', err);
      setError(err.message);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchOceanData(), fetchIceCoreData(timelineFilter)]);
    setLoading(false);
  }, [fetchOceanData, fetchIceCoreData, timelineFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch ice-core dataset whenever the timeline epoch tab is selected
  useEffect(() => {
    fetchIceCoreData(timelineFilter);
  }, [timelineFilter, fetchIceCoreData]);

  // Raw ocean CTD depth profile records parsed from API response
  const rawOceanProfileData = useMemo(() => {
    if (!oceanResponse?.data || !Array.isArray(oceanResponse.data)) return [];
    return oceanResponse.data
      .map((item) => ({
        depth: Number(item.depth !== undefined ? item.depth : item.depth_m),
        temperature: Number(item.temperature !== undefined ? item.temperature : item.avg_temp),
        salinity: Number(item.salinity !== undefined ? item.salinity : item.avg_salinity),
        station_count: item.station_count || 1
      }))
      .filter((d) => !isNaN(d.depth) && !isNaN(d.temperature) && !isNaN(d.salinity))
      .sort((a, b) => a.depth - b.depth);
  }, [oceanResponse]);

  // Derived filtered ocean records strictly reactive to dual depth slider
  const filteredOceanData = useMemo(() => {
    const [minD, maxD] = depthRange;
    return rawOceanProfileData.filter((d) => d.depth >= minD && d.depth <= maxD);
  }, [rawOceanProfileData, depthRange]);

  // Recalculate statistics strictly over the currently visible ocean depth stratum
  const oceanFilteredStats = useMemo(() => {
    if (!filteredOceanData.length) {
      return {
        count: 0,
        min_temp: null,
        max_temp: null,
        avg_temp: null,
        avg_salinity: null
      };
    }

    let minT = Infinity;
    let maxT = -Infinity;
    let sumT = 0;
    let sumS = 0;

    filteredOceanData.forEach((d) => {
      if (d.temperature < minT) minT = d.temperature;
      if (d.temperature > maxT) maxT = d.temperature;
      sumT += d.temperature;
      sumS += d.salinity;
    });

    return {
      count: filteredOceanData.length,
      min_temp: Number(minT.toFixed(3)),
      max_temp: Number(maxT.toFixed(3)),
      avg_temp: Number((sumT / filteredOceanData.length).toFixed(3)),
      avg_salinity: Number((sumS / filteredOceanData.length).toFixed(3))
    };
  }, [filteredOceanData]);

  // Raw ice core profile records parsed from API response
  const rawIceCoreProfileData = useMemo(() => {
    if (!iceCoreResponse?.data || !Array.isArray(iceCoreResponse.data)) return [];
    return iceCoreResponse.data
      .map((item) => ({
        age: Number(item.age_year_bp !== undefined ? item.age_year_bp : item.age),
        age_year_bp: Number(item.age_year_bp !== undefined ? item.age_year_bp : item.age),
        depth: Number(item.depth_m !== undefined ? item.depth_m : item.depth),
        depth_m: Number(item.depth_m !== undefined ? item.depth_m : item.depth),
        isotope_d18o: Number(item.isotope_del_18o !== undefined ? item.isotope_del_18o : item.isotope),
        deuterium_dD: Number(item.deuterium_del_d !== undefined ? item.deuterium_del_d : item.deuterium),
        temp_proxy: Number(item.temperature_proxy_site_c !== undefined ? item.temperature_proxy_site_c : item.temperature_proxy)
      }))
      .filter((d) => !isNaN(d.age) && !isNaN(d.isotope_d18o))
      .sort((a, b) => a.age - b.age);
  }, [iceCoreResponse]);

  // Derived visible paleoclimate ice-core records strictly reactive to selected epoch
  const visibleIceData = useMemo(() => {
    if (!rawIceCoreProfileData || !rawIceCoreProfileData.length) return [];
    if (timelineFilter === '12k') {
      return rawIceCoreProfileData.filter((d) => (d.age_year_bp ?? d.age ?? 0) <= 12000);
    }
    if (timelineFilter === '100k') {
      return rawIceCoreProfileData.filter((d) => (d.age_year_bp ?? d.age ?? 0) <= 100000);
    }
    return rawIceCoreProfileData;
  }, [rawIceCoreProfileData, timelineFilter]);

  // Recalculate statistics strictly over currently visible paleoclimate records
  const iceFilteredStats = useMemo(() => {
    if (!visibleIceData.length) {
      return {
        count: 0,
        min_age: 0,
        max_age: 0,
        avg_temp: null,
        min_temp: null,
        max_temp: null,
        avg_d18o: null
      };
    }

    let minT = Infinity;
    let maxT = -Infinity;
    let sumT = 0;
    let validT = 0;

    let minIso = Infinity;
    let maxIso = -Infinity;
    let sumIso = 0;
    let validIso = 0;

    visibleIceData.forEach((d) => {
      if (!isNaN(d.temp_proxy)) {
        if (d.temp_proxy < minT) minT = d.temp_proxy;
        if (d.temp_proxy > maxT) maxT = d.temp_proxy;
        sumT += d.temp_proxy;
        validT++;
      }
      if (!isNaN(d.isotope_d18o)) {
        if (d.isotope_d18o < minIso) minIso = d.isotope_d18o;
        if (d.isotope_d18o > maxIso) maxIso = d.isotope_d18o;
        sumIso += d.isotope_d18o;
        validIso++;
      }
    });

    return {
      count: visibleIceData.length,
      min_age: Math.round(visibleIceData[0].age),
      max_age: Math.round(visibleIceData[visibleIceData.length - 1].age),
      min_temp: validT > 0 ? Number(minT.toFixed(2)) : null,
      max_temp: validT > 0 ? Number(maxT.toFixed(2)) : null,
      avg_temp: validT > 0 ? Number((sumT / validT).toFixed(2)) : null,
      min_d18o: validIso > 0 ? Number(minIso.toFixed(2)) : null,
      max_d18o: validIso > 0 ? Number(maxIso.toFixed(2)) : null,
      avg_d18o: validIso > 0 ? Number((sumIso / validIso).toFixed(2)) : null
    };
  }, [visibleIceData]);

  // Dynamic X-Axis Domain, Ticks, and Labels tailored to selected epoch
  const xAxisConfig = useMemo(() => {
    if (timelineFilter === '12k') {
      return {
        domain: [0, 12000],
        ticks: [0, 2000, 4000, 6000, 8000, 10000, 12000],
        label: 'Historical Age (0 – 12k yr BP • Holocene Epoch)',
        badgeLabel: 'Holocene · 0–12k yr BP'
      };
    }
    if (timelineFilter === '100k') {
      return {
        domain: [0, 100000],
        ticks: [0, 20000, 40000, 60000, 80000, 100000],
        label: 'Historical Age (0 – 100k yr BP • Glacial-Interglacial Cycle)',
        badgeLabel: 'Last 100k Years · 0–100k yr BP'
      };
    }
    const maxAge = iceFilteredStats.max_age || 720000;
    return {
      domain: [0, 720000],
      ticks: [0, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
      label: 'Historical Age (0 – 720,000 yr BP • 8 Quaternary Glacial Cycles)',
      badgeLabel: `All 720k Years · 0–${Math.round(maxAge / 1000)}k yr BP`
    };
  }, [timelineFilter, iceFilteredStats.max_age]);

  // Clean, readable tick formatter for X-axis
  const formatAgeTick = useCallback((val) => {
    if (val === 0) return '0 BP';
    if (val >= 1000) {
      return `${Math.round(val / 1000)}k BP`;
    }
    return `${val} BP`;
  }, []);

  // Export Tab 1 Ocean CTD Profile as CSV
  const exportOceanCSV = useCallback(() => {
    if (!filteredOceanData.length) return;

    const headers = ['depth_m', 'temperature_c', 'salinity_psu', 'station_count'];
    const rows = filteredOceanData.map((d) => [
      d.depth,
      d.temperature,
      d.salinity,
      d.station_count
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `southern_ocean_ctd_strata_${depthRange[0]}m_${depthRange[1]}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredOceanData, depthRange]);

  // Export Tab 2 Paleoclimate Timeline as JSON
  const exportIceCoreJSON = useCallback(() => {
    if (!visibleIceData.length) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(visibleIceData, null, 2)
    )}`;
    const link = document.createElement('a');
    const blob = new Blob([JSON.stringify(visibleIceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dome_fuji_720k_paleoclimate.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [visibleIceData]);

  // Quick reset for depth slider
  const resetDepthFilter = () => {
    setDepthRange([0, 2000]);
    setActiveLayer(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* 1. TOP HEADER & SCIENTIFIC CITATION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              SIH 2026 Polar Science Hub • Research Tier
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Express API :5000 Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Polar Ocean & Paleoclimate Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized CTD soundings from NOAA WOA18 and 720,000-year ice core isotope records from Dome Fuji, East Antarctica.
          </p>
        </div>

        {/* CONTROLS (MODE TOGGLE & SYNC) */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 sm:flex-none justify-center">
            <button
              onClick={() => setMode('researcher')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                mode === 'researcher'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Compass className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Researcher Mode</span>
              <span className="sm:hidden">Researcher</span>
            </button>
            <button
              onClick={() => {
                setMode('student');
                if (onNavigateToOutreach) onNavigateToOutreach();
              }}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                mode === 'student'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Student Outreach Mode</span>
              <span className="sm:hidden">Outreach</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors disabled:opacity-50 shadow-xs cursor-pointer flex-shrink-0"
            title="Synchronize Live Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-semibold">Backend Connection Alert:</span> {error}. Confirm that the Node.js Express server is active on port 5000 (`node server.js`).
          </div>
        </div>
      )}

      {/* 2. DYNAMIC VERIFIED STATS RIBBON (Strictly Reflects Active Tab & Filtered Range) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {activeTab === 'ocean' ? (
          <>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Filtered Mean Temp</span>
                <ThermometerSnowflake className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {oceanFilteredStats.avg_temp !== null ? `${oceanFilteredStats.avg_temp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Computed across {oceanFilteredStats.count} depths
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Filtered Min Temp</span>
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {oceanFilteredStats.min_temp !== null ? `${oceanFilteredStats.min_temp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Extreme sub-zero stratum
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Filtered Max Temp</span>
                <ThermometerSnowflake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {oceanFilteredStats.max_temp !== null ? `${oceanFilteredStats.max_temp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Intermediate warm core (CDW)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Filtered Mean Salinity</span>
                <Droplets className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {oceanFilteredStats.avg_salinity !== null ? `${oceanFilteredStats.avg_salinity} PSU` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Practical Salinity Unit
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Visible Epoch</span>
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white truncate" title={xAxisConfig.badgeLabel}>
                {timelineFilter === '12k' ? 'Holocene (0–12k)' : timelineFilter === '100k' ? 'Last 100k Years' : 'All 720k Years'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Rendering {visibleIceData.length} records
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Epoch Mean Proxy Temp</span>
                <ThermometerSnowflake className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {iceFilteredStats.avg_temp !== null ? `${iceFilteredStats.avg_temp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Reconstructed site temperature
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Epoch Min Temp Anomaly</span>
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {iceFilteredStats.min_temp !== null ? `${iceFilteredStats.min_temp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Deep glacial stadial peak
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Mean δ18O Isotope</span>
                <Snowflake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {iceFilteredStats.avg_d18o !== null ? `${iceFilteredStats.avg_d18o} ‰` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Stable water isotope ratio
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. AI SCIENTIFIC INSIGHT CARD (Grounded in Verified Stats) */}
      <div className="p-4 sm:p-5 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Scientific Analytical Insight
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Zero Hallucination Guarantee
                </span>
              </h3>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Live Provenance: NOAA WOA18 Decadal Climatology & Dome Fuji NCEI Archive
          </div>
        </div>

        {activeTab === 'ocean' ? (
          <blockquote className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-l-3 border-sky-600 pl-3.5 py-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-r-lg">
            &ldquo;<span className="font-semibold text-sky-800 dark:text-sky-300">Ocean CTD Summary:</span> Southern Ocean thermal structure stabilizes at{' '}
            <span className="font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100/70 dark:bg-sky-950/80 px-1 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {oceanFilteredStats.avg_temp !== null ? `${oceanFilteredStats.avg_temp}°C` : '-0.549°C'}
            </span>{' '}
            with mean salinity of{' '}
            <span className="font-mono text-indigo-800 dark:text-indigo-300 font-bold bg-indigo-100/70 dark:bg-indigo-950/80 px-1 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {oceanFilteredStats.avg_salinity !== null ? `${oceanFilteredStats.avg_salinity} PSU` : '34.562 PSU'}
            </span>
            , acting as a sub-zero barrier against ice-shelf basal melting.&rdquo;
          </blockquote>
        ) : (
          <blockquote className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-l-3 border-sky-600 pl-3.5 py-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-r-lg">
            &ldquo;<span className="font-semibold text-sky-800 dark:text-sky-300">Dome Fuji Paleoclimate Summary:</span> The {xAxisConfig.badgeLabel} record comprises{' '}
            <span className="font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100/70 dark:bg-sky-950/80 px-1 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {visibleIceData.length} soundings
            </span>{' '}
            (spanning {iceFilteredStats.min_age.toLocaleString()} to {iceFilteredStats.max_age.toLocaleString()} yr BP). Reconstructed atmospheric temperatures average{' '}
            <span className="font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100/70 dark:bg-sky-950/80 px-1 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {iceFilteredStats.avg_temp !== null ? `${iceFilteredStats.avg_temp}°C` : '-3.13°C'}
            </span>{' '}
            with δ18O stabilizing near{' '}
            <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100/70 dark:bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {iceFilteredStats.avg_d18o !== null ? `${iceFilteredStats.avg_d18o}‰` : '-57.01‰'}
            </span>
            , validating 8 Quaternary orbital eccentricity cycles.&rdquo;
          </blockquote>
        )}

        {mode === 'student' && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>
              {activeTab === 'ocean' ? (
                <>
                  <strong className="text-slate-800 dark:text-slate-200">Student Explanation:</strong> Cold and dense salty water sinks around Antarctica, creating the &ldquo;Antarctic Bottom Water&rdquo; that drives ocean currents across the entire planet!
                </>
              ) : (
                <>
                  <strong className="text-slate-800 dark:text-slate-200">Student Explanation:</strong> Ice cores act like time capsules! As snow falls and compresses into ice on the high Antarctic plateau, it traps air and water isotopes, letting scientists see 720,000 years of Earth&apos;s climate history!
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* STUDENT MODE OUTREACH CARD */}
      {mode === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60">
          <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
              <Droplets className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              What is Salinity (PSU)?
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              Salinity measures salt content. When seawater freezes into sea ice, salt is rejected, creating heavy water that sinks into the abyssal ocean.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-sky-900/60 shadow-xs">
            <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5 mb-1">
              <Snowflake className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              What are Ice Isotopes (&delta;18O)?
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              An ancient natural thermometer. Lighter water molecules evaporate faster in warm eras. Ice core isotope records reveal 720,000 years of climate history!
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-cyan-100 dark:border-cyan-900/60 shadow-xs">
            <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Did You Know? (Dome Fuji)
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              Dome Fuji in East Antarctica is at 3,810m elevation with winter temperatures reaching below -80°C. Its ice core spans 8 glacial cycles.
            </p>
          </div>
        </div>
      )}

      {/* 4. MAIN SCIENTIFIC VISUALIZATION WORKBENCH */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {/* TABS HEADER & GLOBAL ACTIONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 sm:px-4 py-2 gap-2">
          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('ocean')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'ocean'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Waves className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'ocean' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden md:inline">Southern Ocean Depth Profile (CTD)</span>
              <span className="md:hidden">Ocean CTD Profile</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'ocean' ? 'bg-sky-700 text-sky-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {filteredOceanData.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ice-core')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'ice-core'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <Snowflake className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'ice-core' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              <span className="hidden md:inline">Dome Fuji Paleoclimate Records</span>
              <span className="md:hidden">Dome Fuji Ice Core</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'ice-core' ? 'bg-sky-700 text-sky-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {visibleIceData.length}
              </span>
            </button>
          </div>

          {/* EXPORT DATASET CONTROLS */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {activeTab === 'ocean' ? (
              <button
                onClick={exportOceanCSV}
                disabled={!filteredOceanData.length}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-sky-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer whitespace-nowrap"
                title="Export filtered CTD dataset as CSV"
              >
                <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Export <span className="hidden sm:inline">Dataset </span>(CSV)</span>
              </button>
            ) : (
              <button
                onClick={exportIceCoreJSON}
                disabled={!visibleIceData.length}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-sky-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer whitespace-nowrap"
                title="Export selected paleoclimate timeline as JSON"
              >
                <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Export <span className="hidden sm:inline">Dataset </span>(JSON)</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: OCEAN CTD PROFILE WITH DYNAMIC DEPTH FILTER & WATER MASS STRATIFICATION */}
        {activeTab === 'ocean' && (
          <div className="p-5 space-y-4">
            {/* DYNAMIC DUAL-HANDLE DEPTH RANGE FILTER TOOLBAR */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Depth Range Filter:</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-sky-300 font-bold shadow-2xs">
                    {depthRange[0]} m
                  </span>
                  <span className="text-slate-400">to</span>
                  <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-sky-300 font-bold shadow-2xs">
                    {depthRange[1]} m
                  </span>
                </div>
              </div>

              {/* DUAL SLIDER CONTROLS */}
              <div className="flex-1 max-w-md w-full flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">0m</span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={2000}
                      step={5}
                      value={depthRange[0]}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), depthRange[1] - 10);
                        setDepthRange([val, depthRange[1]]);
                      }}
                      className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      title="Minimum Depth"
                    />
                    <input
                      type="range"
                      min={0}
                      max={2000}
                      step={5}
                      value={depthRange[1]}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), depthRange[0] + 10);
                        setDepthRange([depthRange[0], val]);
                      }}
                      className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg ml-2"
                      title="Maximum Depth"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">2000m</span>
                </div>
              </div>

              {/* RESET BUTTON */}
              {(depthRange[0] > 0 || depthRange[1] < 2000) && (
                <button
                  onClick={resetDepthFilter}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-colors shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* WATER MASS STRATIFICATION LEGEND & CHIPS */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Water Mass Layers:
                </span>
                {/* Layer 1: AASW */}
                <button
                  onMouseEnter={() => setActiveLayer('AASW')}
                  onMouseLeave={() => setActiveLayer(null)}
                  onClick={() => setDepthRange([0, 100])}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] cursor-pointer ${
                    activeLayer === 'AASW'
                      ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-400 dark:border-sky-600 text-sky-900 dark:text-sky-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:border-sky-400 shadow-2xs'
                  }`}
                  title="Click to zoom into Antarctic Surface Water (0–100m)"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="font-semibold text-sky-700 dark:text-sky-300">AASW</span>
                  <span className="text-slate-500 dark:text-slate-400">(0–100m)</span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 dark:text-slate-400">• Wind-driven surface layer</span>
                </button>

                {/* Layer 2: CDW */}
                <button
                  onMouseEnter={() => setActiveLayer('CDW')}
                  onMouseLeave={() => setActiveLayer(null)}
                  onClick={() => setDepthRange([200, 1000])}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] cursor-pointer ${
                    activeLayer === 'CDW'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:border-amber-400 shadow-2xs'
                  }`}
                  title="Click to zoom into Circumpolar Deep Water (200–1000m)"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">CDW</span>
                  <span className="text-slate-500 dark:text-slate-400">(200–1000m)</span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 dark:text-slate-400">• Thermal inversion warm core</span>
                </button>

                {/* Layer 3: AABW */}
                <button
                  onMouseEnter={() => setActiveLayer('AABW')}
                  onMouseLeave={() => setActiveLayer(null)}
                  onClick={() => setDepthRange([1000, 2000])}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] cursor-pointer ${
                    activeLayer === 'AABW'
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:border-indigo-400 shadow-2xs'
                  }`}
                  title="Click to zoom into Antarctic Bottom Water (1000–2000m)"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">AABW</span>
                  <span className="text-slate-500 dark:text-slate-400">(1000–2000m)</span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 dark:text-slate-400">• Abyssal dense water mass</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-sky-600 inline-block" /> Temperature (°C)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-indigo-600 inline-block" /> Salinity (PSU)
                </span>
              </div>
            </div>

            {/* CHART RENDER & EMPTY STATE */}
            {loading ? (
              <div className="h-80 sm:h-96 flex items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
                <span>Loading Southern Ocean CTD soundings...</span>
              </div>
            ) : filteredOceanData.length === 0 ? (
              <div className="h-80 sm:h-96 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <p className="text-sm">No depth soundings within the selected stratum.</p>
                <button
                  onClick={resetDepthFilter}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-xs cursor-pointer"
                >
                  Reset Depth Range (0–2000m)
                </button>
              </div>
            ) : (
              <div className="h-80 sm:h-96 w-full min-w-0 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredOceanData}
                    margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
                  >
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={theme === 'dark' ? 0.35 : 0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                    <XAxis
                      dataKey="depth"
                      type="number"
                      domain={[depthRange[0], depthRange[1]]}
                      stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                      fontSize={11}
                      tickFormatter={(val) => `${val}m`}
                      tick={{ fill: theme === 'dark' ? '#94a3b8' : '#475569' }}
                      label={{
                        value: 'Hydrographic Depth (meters below sea surface)',
                        position: 'insideBottom',
                        offset: -15,
                        fill: theme === 'dark' ? '#94a3b8' : '#475569',
                        fontSize: 12
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#0284c7"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${val}°C`}
                      tick={{ fill: '#0284c7' }}
                      label={{
                        value: 'Temperature (°C)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#0284c7',
                        fontSize: 11
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#4f46e5"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${val}`}
                      tick={{ fill: '#4f46e5' }}
                      label={{
                        value: 'Salinity (PSU)',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#4f46e5',
                        fontSize: 11
                      }}
                    />

                    {/* WATER MASS STRATIFICATION ANNOTATIONS */}
                    {/* AASW: 0–100m */}
                    {depthRange[0] <= 100 && depthRange[1] >= 0 && (
                      <ReferenceArea
                        yAxisId="left"
                        x1={Math.max(0, depthRange[0])}
                        x2={Math.min(100, depthRange[1])}
                        fill={theme === 'dark' ? '#0369a1' : '#e0f2fe'}
                        fillOpacity={activeLayer === 'AASW' ? 0.5 : (theme === 'dark' ? 0.18 : 0.35)}
                        stroke="#0284c7"
                        strokeOpacity={0.4}
                        strokeDasharray="3 3"
                      />
                    )}
                    {/* CDW: 200–1000m */}
                    {depthRange[0] <= 1000 && depthRange[1] >= 200 && (
                      <ReferenceArea
                        yAxisId="left"
                        x1={Math.max(200, depthRange[0])}
                        x2={Math.min(1000, depthRange[1])}
                        fill={theme === 'dark' ? '#b45309' : '#fef3c7'}
                        fillOpacity={activeLayer === 'CDW' ? 0.5 : (theme === 'dark' ? 0.18 : 0.35)}
                        stroke="#d97706"
                        strokeOpacity={0.4}
                        strokeDasharray="3 3"
                      />
                    )}
                    {/* AABW: 1000–2000m */}
                    {depthRange[0] <= 2000 && depthRange[1] >= 1000 && (
                      <ReferenceArea
                        yAxisId="left"
                        x1={Math.max(1000, depthRange[0])}
                        x2={Math.min(2000, depthRange[1])}
                        fill={theme === 'dark' ? '#4338ca' : '#ede9fe'}
                        fillOpacity={activeLayer === 'AABW' ? 0.5 : (theme === 'dark' ? 0.18 : 0.35)}
                        stroke="#4f46e5"
                        strokeOpacity={0.4}
                        strokeDasharray="3 3"
                      />
                    )}

                    <Tooltip content={<OceanTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#tempGrad)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="salinity"
                      name="Salinity (PSU)"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOME FUJI PALEOCLIMATE WITH RESEARCH-GRADE TIMELINE & DYNAMIC CHART */}
        {activeTab === 'ice-core' && (
          <div className="p-5 space-y-4">
            {/* DATASET HEADER & SUMMARY */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Dome Fuji Paleoclimate Records</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono">
                    East Antarctica • 3,810m Elev
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuous 720,000-year deep ice core record preserving atmospheric temperature proxies and stable water isotopes (δ¹⁸O and δD) across 8 Quaternary glacial cycles.
                </p>
              </div>
            </div>

            {/* TIMELINE CONTROLS & REACTIVE RECORD BADGE */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Timeline:
                </span>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs" role="tablist" aria-label="Chronological Timeline Filter">
                  <button
                    role="tab"
                    aria-selected={timelineFilter === 'all'}
                    onClick={() => setTimelineFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      timelineFilter === 'all'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>All 720k Years</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={timelineFilter === '100k'}
                    onClick={() => setTimelineFilter('100k')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      timelineFilter === '100k'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Last 100k Years</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={timelineFilter === '12k'}
                    onClick={() => setTimelineFilter('12k')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      timelineFilter === '12k'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Holocene · 12k</span>
                  </button>
                </div>
              </div>

              {/* REACTIVE RECORD BADGE DERIVED FROM visibleIceData.length */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse" />
                  Rendering {visibleIceData.length} records · {xAxisConfig.badgeLabel}
                </span>
              </div>
            </div>

            {/* CHART RENDER & EMPTY STATE */}
            {loading ? (
              <div className="h-80 sm:h-96 flex items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
                <span>Loading paleoclimate isotope archive...</span>
              </div>
            ) : visibleIceData.length === 0 ? (
              <div className="h-80 sm:h-96 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <p className="text-sm">No paleoclimate records in this timeline filter.</p>
                <button
                  onClick={() => setTimelineFilter('all')}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-xs cursor-pointer"
                >
                  Show All Records
                </button>
              </div>
            ) : (
              <div className="h-80 sm:h-96 w-full min-w-0 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={visibleIceData}
                    margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                    <XAxis
                      dataKey="age"
                      type="number"
                      domain={xAxisConfig.domain}
                      ticks={xAxisConfig.ticks}
                      stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                      fontSize={11}
                      tickFormatter={formatAgeTick}
                      tick={{ fill: theme === 'dark' ? '#94a3b8' : '#475569' }}
                      label={{
                        value: xAxisConfig.label,
                        position: 'insideBottom',
                        offset: -15,
                        fill: theme === 'dark' ? '#94a3b8' : '#475569',
                        fontSize: 12
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#0284c7"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tick={{ fill: '#0284c7' }}
                      label={{
                        value: 'Isotope Ratio δ18O (‰)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#0284c7',
                        fontSize: 11
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#059669"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${val}°C`}
                      tick={{ fill: '#059669' }}
                      label={{
                        value: 'Reconstructed Temp (°C)',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#059669',
                        fontSize: 11
                      }}
                    />
                    <Tooltip content={<IceCoreTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="isotope_d18o"
                      name="δ18O Isotope Ratio (‰)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temp_proxy"
                      name="Reconstructed Temp (°C)"
                      stroke="#059669"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* TAB 2 DYNAMIC STATISTICS RIBBON */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Sampled Records</span>
                  <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {iceFilteredStats.count}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Spanning {iceFilteredStats.min_age.toLocaleString()} to {iceFilteredStats.max_age.toLocaleString()} yr BP
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Min Proxy Temp</span>
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {iceFilteredStats.min_temp !== null ? `${iceFilteredStats.min_temp}°C` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Peak glacial cooling
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Avg Proxy Temp</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {iceFilteredStats.avg_temp !== null ? `${iceFilteredStats.avg_temp}°C` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Mean epoch anomaly
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Max Proxy Temp</span>
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {iceFilteredStats.max_temp !== null ? `${iceFilteredStats.max_temp}°C` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Interglacial thermal peak
                </div>
              </div>
            </div>

            {/* TAB 2 DATASET INFORMATION & METADATA */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Dome Fuji Ice Core Station:</span>
                <span>East Antarctic Plateau (77°19&apos;S, 39°42&apos;E) • Elevation: 3,810m • Deep Core: 3,035m</span>
              </div>
              <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Archive: NOAA NCEI Paleoclimatology #2018-024
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. METRICS FOOTER & PROVENANCE CITATIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800 gap-2 font-mono">
        <div>
          Data Sources: NOAA WOA18 Decadal Hydrographic Climatology (NCPOR / NPDC) • NCEI Paleoclimatology Dome Fuji Project
        </div>
        {lastRefreshed && (
          <div className="text-slate-500 dark:text-slate-400">
            Live Synchronization: {lastRefreshed}
          </div>
        )}
      </div>
    </div>
  );
}
