import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  Film,
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  Tag,
  Building2,
  Fish,
  Mountain,
  Ship,
  Video
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const CATEGORY_ICONS = {
  'All Media': Layers,
  'Research Stations': Building2,
  'Polar Wildlife': Fish,
  'Cryosphere & Landscapes': Mountain,
  'Expeditions & Science': Ship,
  'Outreach Documentaries': Video
};

const CATEGORY_COLORS = {
  'Research Stations': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Polar Wildlife': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Cryosphere & Landscapes': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'Expeditions & Science': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  'Outreach Documentaries': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
};

export default function MediaGallery({ theme = 'dark' }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Media');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'image' | 'video'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox state
  const [activeLightboxItem, setActiveLightboxItem] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/v1/media`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch media gallery`);
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setMediaItems(data.data);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (err) {
      console.error('Media fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Category filter
      if (activeCategory !== 'All Media' && item.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchLoc && !matchTags) return false;
      }
      return true;
    });
  }, [mediaItems, activeCategory, selectedType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = mediaItems.length;
    const photos = mediaItems.filter(m => m.type === 'image').length;
    const videos = mediaItems.filter(m => m.type === 'video').length;
    return { total, photos, videos };
  }, [mediaItems]);

  // Lightbox Navigation
  const imageItemsOnly = useMemo(() => {
    return filteredItems.filter(i => i.type === 'image');
  }, [filteredItems]);

  const handlePrevLightbox = (e) => {
    e.stopPropagation();
    if (!activeLightboxItem) return;
    const idx = imageItemsOnly.findIndex(i => i.id === activeLightboxItem.id);
    if (idx > 0) {
      setActiveLightboxItem(imageItemsOnly[idx - 1]);
    } else {
      setActiveLightboxItem(imageItemsOnly[imageItemsOnly.length - 1]);
    }
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    if (!activeLightboxItem) return;
    const idx = imageItemsOnly.findIndex(i => i.id === activeLightboxItem.id);
    if (idx >= 0 && idx < imageItemsOnly.length - 1) {
      setActiveLightboxItem(imageItemsOnly[idx + 1]);
    } else {
      setActiveLightboxItem(imageItemsOnly[0]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxItem) {
        if (e.key === 'Escape') setActiveLightboxItem(null);
        if (e.key === 'ArrowLeft') handlePrevLightbox(e);
        if (e.key === 'ArrowRight') handleNextLightbox(e);
      }
      if (activeVideoModal && e.key === 'Escape') {
        setActiveVideoModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxItem, activeVideoModal, imageItemsOnly]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* HERO SECTION / HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-sky-900/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Person 5 Multimedia Pipeline • SIH 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Antarctic Visual Archive & Outreach Media
            </h1>
            <p className="text-sm text-sky-100/80 leading-relaxed">
              High-resolution photographic documentation, drone aerial cinematography, and scientific video reels curated from India's Antarctic stations (Bharati, Maitri) and deep-field expeditions.
            </p>
          </div>

          {/* QUICK STATS PILLS */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl font-black text-white">{stats.total}</span>
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">Total Assets</span>
            </div>
            <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl font-black text-sky-300">{stats.photos}</span>
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">Photos</span>
            </div>
            <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl font-black text-rose-300">{stats.videos}</span>
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">Video Reels</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: CATEGORY PILLS + SEARCH + TYPE TOGGLE */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
            {['All Media', 'Research Stations', 'Polar Wildlife', 'Cryosphere & Landscapes', 'Expeditions & Science', 'Outreach Documentaries'].map(cat => {
              const Icon = CATEGORY_ICONS[cat] || Layers;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* TYPE TOGGLE: ALL / PHOTOS / VIDEOS */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto flex-shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Assets ({stats.total})
            </button>
            <button
              onClick={() => setSelectedType('image')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'image'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="w-3 h-3 text-sky-500" />
              Photos ({stats.photos})
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'video'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Film className="w-3 h-3 text-rose-500" />
              Videos ({stats.videos})
            </button>
          </div>
        </div>

        {/* SEARCH AND REFRESH BAR */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search media by title, location (e.g. Bharati, Weddell Sea), or scientific tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={fetchMedia}
            title="Reload Media Archive"
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>Failed to load media: {error}</span>
          <button onClick={fetchMedia} className="underline font-bold hover:text-rose-800">Retry</button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-800" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Camera className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No media items found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No photographs or video recordings match your active filters or search query.
          </p>
          <button
            onClick={() => { setActiveCategory('All Media'); setSelectedType('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* MEDIA GRID */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            const isVideo = item.type === 'video';
            const catBadgeClass = CATEGORY_COLORS[item.category] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-sky-500/40 transition-all duration-300"
              >
                {/* THUMBNAIL CONTAINER */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-950 select-none">
                  {isVideo ? (
                    // Video Thumbnail with Overlay Play Trigger
                    <div
                      onClick={() => setActiveVideoModal(item)}
                      className="relative w-full h-full cursor-pointer flex items-center justify-center bg-slate-950 group/video"
                    >
                      <video
                        src={`${API_BASE_URL}${item.url}`}
                        className="w-full h-full object-cover opacity-80 group-hover/video:opacity-95 group-hover/video:scale-105 transition-all duration-500 pointer-events-none"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      {/* Big Glowing Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/video:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 group-hover/video:scale-110 group-hover/video:bg-rose-500 transition-all">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>
                      {/* Duration Tag */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white backdrop-blur-xs flex items-center gap-1">
                        <Film className="w-3 h-3 text-rose-400" />
                        <span>{item.duration || '0:45'}</span>
                      </div>
                    </div>
                  ) : (
                    // Photo Thumbnail with Click-to-Zoom Trigger
                    <div
                      onClick={() => setActiveLightboxItem(item)}
                      className="relative w-full h-full cursor-pointer overflow-hidden group/photo"
                    >
                      <img
                        src={`${API_BASE_URL}${item.url}`}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/photo:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end p-3">
                        <div className="flex items-center gap-1.5 text-white text-[11px] font-semibold">
                          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>View Full Res</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY BADGE ON THUMBNAIL */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md ${catBadgeClass}`}>
                      {isVideo ? <Video className="w-2.5 h-2.5" /> : <Camera className="w-2.5 h-2.5" />}
                      <span>{item.category}</span>
                    </span>
                  </div>

                  {/* FILE SIZE BADGE */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-200 backdrop-blur-xs">
                      {item.file_size_kb > 1024
                        ? `${(item.file_size_kb / 1024).toFixed(1)} MB`
                        : `${Math.round(item.file_size_kb)} KB`}
                    </span>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                      <span className="truncate">{item.location || 'Antarctica'}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* TAGS AND ACTIONS */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {item.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[80px]">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {isVideo ? (
                      <button
                        onClick={() => setActiveVideoModal(item)}
                        className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveLightboxItem(item)}
                        className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 font-bold cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {activeLightboxItem && (
        <div
          onClick={() => setActiveLightboxItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveLightboxItem(null)}
            className="absolute top-4 right-4 z-60 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevLightbox}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:block"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextLightbox}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:block"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl"
          >
            {/* Image Preview Container */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] md:min-h-[500px]">
              <img
                src={`${API_BASE_URL}${activeLightboxItem.url}`}
                alt={activeLightboxItem.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 p-5 bg-slate-900 text-slate-100 flex flex-col justify-between space-y-4 overflow-y-auto border-t md:border-t-0 md:border-l border-slate-800 text-xs">
              <div className="space-y-3">
                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${CATEGORY_COLORS[activeLightboxItem.category] || 'bg-slate-800 text-slate-300'}`}>
                  {activeLightboxItem.category}
                </span>

                <h2 className="text-base font-bold text-white leading-snug">
                  {activeLightboxItem.title}
                </h2>

                <div className="space-y-1.5 text-slate-400 text-[11px]">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>{activeLightboxItem.location || 'Antarctica'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono">
                    <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>
                      {activeLightboxItem.file_size_kb > 1024
                        ? `${(activeLightboxItem.file_size_kb / 1024).toFixed(1)} MB`
                        : `${activeLightboxItem.file_size_kb} KB`}{' '}
                      • .{activeLightboxItem.extension?.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Description</h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {activeLightboxItem.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Keywords & Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {activeLightboxItem.tags?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Direct High-Res Download */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <a
                  href={`${API_BASE_URL}${activeLightboxItem.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High Resolution</span>
                </a>
                <p className="text-[9px] text-center text-slate-500">
                  {activeLightboxItem.attribution}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED HTML5 VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveVideoModal(null)}
            className="absolute top-4 right-4 z-60 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Video (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header bar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-white text-sm">{activeVideoModal.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                {activeVideoModal.duration || 'Video Reel'}
              </span>
            </div>

            {/* Video Player */}
            <div className="relative aspect-16/9 bg-black flex items-center justify-center">
              <video
                src={`${API_BASE_URL}${activeVideoModal.url}`}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the HTML5 video tag.
              </video>
            </div>

            {/* Footer description */}
            <div className="p-4 bg-slate-900 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400 max-w-xl">
                {activeVideoModal.description}
              </p>
              <a
                href={`${API_BASE_URL}${activeVideoModal.url}`}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex-shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Video ({Math.round(activeVideoModal.file_size_kb / 1024)} MB)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
