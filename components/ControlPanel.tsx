import React, { useState, useEffect } from 'react';
import { Reciter, Surah, ExportFormat, Ayah, VideoConfig } from '../types';
import { RECITERS } from '../constants';
import { 
  Search, Play, Video, Type, Hash, Loader2, FileVideo, 
  Sparkles, Sliders, Eye, Palette, ChevronDown, ChevronUp, Image
} from 'lucide-react';

interface ControlPanelProps {
  surahs: Surah[];
  currentAyahs?: Ayah[];
  config: VideoConfig;
  onConfigChange: (config: any) => void;
  onSearchBackground: (query: string) => Promise<string[]>;
  isSearchingVideo: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  surahs, 
  currentAyahs = [],
  config,
  onConfigChange, 
  onSearchBackground,
  isSearchingVideo
}) => {
  // Navigation & Accordions State
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showVersePreview, setShowVersePreview] = useState(false);

  // Form State Linked with Config Defaults
  const [selectedReciter, setSelectedReciter] = useState(config.reciterId);
  const [selectedSurah, setSelectedSurah] = useState<number>(config.surahNumber);
  
  const [startAyahInput, setStartAyahInput] = useState<string>(config.startAyah.toString());
  const [endAyahInput, setEndAyahInput] = useState<string>(config.endAyah.toString());
  
  const [channelName, setChannelName] = useState(config.channelName);
  const [bgQuery, setBgQuery] = useState("Nature clouds");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("Nature clouds");
  const [currentMaxAyahs, setCurrentMaxAyahs] = useState(7);
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>(config.exportFormat);

  // Canvas visual styles
  const [arabicFont, setArabicFont] = useState(config.arabicFont || 'amiri');
  const [fontSizeArabic, setFontSizeArabic] = useState(config.fontSizeArabic || 56);
  const [fontSizeEnglish, setFontSizeEnglish] = useState(config.fontSizeEnglish || 28);
  const [overlayOpacity, setOverlayOpacity] = useState(config.overlayOpacity !== undefined ? config.overlayOpacity : 0.4);
  const [showBorder, setShowBorder] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(config.showVisualizer !== undefined ? config.showVisualizer : true);

  // Update max ayahs when surah changes
  useEffect(() => {
    const surah = surahs.find(s => s.number === selectedSurah);
    if (surah) {
      setCurrentMaxAyahs(surah.numberOfAyahs);
      const currentStart = parseInt(startAyahInput) || 1;
      const currentEnd = parseInt(endAyahInput) || 1;
      
      if (currentStart > surah.numberOfAyahs || currentEnd > surah.numberOfAyahs) {
        setStartAyahInput("1");
        setEndAyahInput(Math.min(7, surah.numberOfAyahs).toString());
      }
    }
  }, [selectedSurah, surahs]);

  const handlePexelsSearchClick = async () => {
      const urls = await onSearchBackground(bgQuery);
      setCustomVideoUrl("");
      return urls;
  };

  const validateAndSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let start = parseInt(startAyahInput) || 1;
    let end = parseInt(endAyahInput) || 1;

    // Clamp boundary ranges
    if (start < 1) start = 1;
    if (end > currentMaxAyahs) end = currentMaxAyahs;
    if (start > currentMaxAyahs) start = currentMaxAyahs;
    if (end < 1) end = 1;

    // Correct direction boundaries
    if (start > end) {
      end = start;
    }

    setStartAyahInput(start.toString());
    setEndAyahInput(end.toString());

    let newPlaylist: string[] | undefined = undefined;

    // Search Pexels only if query actually changed and it is filled and no custom URL
    if (!customVideoUrl && bgQuery && bgQuery.trim() !== "" && bgQuery.trim().toLowerCase() !== lastSearchedQuery.trim().toLowerCase()) {
       const foundUrls = await handlePexelsSearchClick();
       if (foundUrls.length > 0) {
           newPlaylist = foundUrls;
           setLastSearchedQuery(bgQuery);
       }
    }

    onConfigChange({
      reciterId: selectedReciter,
      surahNumber: selectedSurah,
      startAyah: start,
      endAyah: end,
      channelName,
      customVideoUrl: customVideoUrl.trim(),
      ...(newPlaylist ? { videoPlaylist: newPlaylist } : {}),
      exportFormat,
      arabicFont,
      fontSizeArabic,
      fontSizeEnglish,
      overlayOpacity,
      showBorder,
      showVisualizer
    });
  };

  const isCustomUrlValid = customVideoUrl === "" || (customVideoUrl.startsWith("http") && customVideoUrl.endsWith(".mp4"));
  const customUrlError = !isCustomUrlValid ? "URL must start with http/https and end with .mp4" : null;
  const isYoutube = customVideoUrl.includes("youtube.com") || customVideoUrl.includes("youtu.be");
  const isPexelsPage = customVideoUrl.includes("pexels.com/video/");

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-6">
      
      {/* Primary Setup Panel */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
        <Video className="w-5 h-5 text-emerald-400" />
        Video Config
      </h2>

      <form onSubmit={validateAndSubmit} className="space-y-5">
        {/* Reciter Selection */}
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <label className="text-xs font-semibold text-slate-300">Qari (Reciter)</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            value={selectedReciter}
            onChange={(e) => setSelectedReciter(e.target.value)}
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Surah Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Surah</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
          >
            {surahs.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.name})
              </option>
            ))}
          </select>
        </div>

        {/* Ayah Range Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> Start Verse
            </label>
            <input 
              type="number" 
              min="1"
              max={currentMaxAyahs}
              value={startAyahInput}
              onChange={(e) => setStartAyahInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> End Verse
            </label>
            <input 
              type="number" 
              min="1"
              max={currentMaxAyahs}
              value={endAyahInput}
              onChange={(e) => setEndAyahInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span>Surah limit: {currentMaxAyahs} Verses</span>
          <span>Selected: {Math.max(1, (parseInt(endAyahInput) || 1) - (parseInt(startAyahInput) || 1) + 1)} verses</span>
        </div>

        {/* Watermark Watermark */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" /> Watermark Overlay
          </label>
          <input 
            type="text" 
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="e.g. Daily Quran Recitation"
          />
        </div>

        <div className="h-px bg-slate-700/60 my-2" />

        {/* BACKGROUND MEDIA CONTROLLER */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Image className="w-4 h-4 text-emerald-400" /> Background Video Source
          </label>
          
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={bgQuery}
                onChange={(e) => setBgQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Keywords (e.g. peaceful clouds)"
              />
              <button 
                type="button"
                onClick={async () => {
                    const urls = await handlePexelsSearchClick();
                    if (urls.length > 0) {
                        setLastSearchedQuery(bgQuery);
                    }
                    onConfigChange({
                        reciterId: selectedReciter,
                        surahNumber: selectedSurah,
                        startAyah: parseInt(startAyahInput) || 1,
                        endAyah: parseInt(endAyahInput) || 1,
                        channelName,
                        customVideoUrl: "",
                        ...(urls.length > 0 ? { videoPlaylist: urls } : {}),
                        exportFormat
                    });
                }}
                disabled={isSearchingVideo}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSearchingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

             {/* Custom URL Field */}
             <div className="space-y-1.5 pt-1">
               <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Or paste custom direct MP4 URL</label>
               <input 
                type="text" 
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
                className={`w-full bg-slate-900 border rounded-lg p-2.5 text-xs text-white focus:ring-2 outline-none ${!isCustomUrlValid ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'}`}
                placeholder="https://example.com/flowing-river.mp4"
              />
              {isYoutube && <p className="text-[10px] text-red-400">YouTube pages do not offer direct MP4 streams.</p>}
              {isPexelsPage && <p className="text-[10px] text-red-500">Must be a direct CDN file, search above instead.</p>}
              {customUrlError && !isYoutube && !isPexelsPage && (
                <p className="text-[10px] text-red-400">{customUrlError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-700/60 my-2" />

        {/* STYLE PANEL ACCORDION SEGMENT */}
        <div className="rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900/50">
          <button
            type="button"
            onClick={() => setShowStylePanel(!showStylePanel)}
            className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2 text-emerald-400">
              <Sliders className="w-4 h-4" /> Canvas Art Styles
            </span>
            {showStylePanel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showStylePanel && (
            <div className="p-4 border-t border-slate-700/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Black Dimmer Mask</span>
                  <span className="text-emerald-500">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={overlayOpacity * 100}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 100;
                    setOverlayOpacity(val);
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Font Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Arabic Font Style</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={arabicFont}
                  onChange={(e) => setArabicFont(e.target.value)}
                >
                  <option value="amiri">Amiri (Traditional Elegant)</option>
                  <option value="scheherazade">Scheherazade (Ancient Naskh)</option>
                  <option value="cairo">Cairo (Modern Geometric Sans)</option>
                </select>
              </div>

              {/* FontSize Arabic */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Arabic Verse Size</span>
                  <span className="text-emerald-400 font-mono text-[10px]">{fontSizeArabic}px</span>
                </div>
                <input
                  type="range"
                  min="36"
                  max="76"
                  step="2"
                  value={fontSizeArabic}
                  onChange={(e) => setFontSizeArabic(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* FontSize English */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>English Translation Size</span>
                  <span className="text-emerald-400 font-mono text-[10px]">{fontSizeEnglish}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="38"
                  step="2"
                  value={fontSizeEnglish}
                  onChange={(e) => setFontSizeEnglish(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={showVisualizer}
                    onChange={(e) => setShowVisualizer(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Draw Dynamic Audio EQ Wave</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* VERSE TEXT PREVIEW SEGMENT */}
        {currentAyahs.length > 0 && (
          <div className="rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900/50">
            <button
              type="button"
              onClick={() => setShowVersePreview(!showVersePreview)}
              className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              <span className="flex items-center gap-2 text-indigo-400">
                <Eye className="w-4 h-4" /> Selected Verses ({currentAyahs.length})
              </span>
              {showVersePreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showVersePreview && (
              <div className="p-3 border-t border-slate-700/60 space-y-3 max-h-[180px] overflow-y-auto animate-in slide-in-from-top-2 duration-200 scrollbar text-left">
                {currentAyahs.map((ayah, idx) => (
                  <div key={idx} className="p-2 bg-slate-950/40 rounded-lg space-y-1 text-xs border border-slate-800/80">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                      <span>VERSE {ayah.numberInSurah}</span>
                    </div>
                    <p className="text-right font-arabic text-emerald-300 text-sm leading-relaxed" dir="rtl">{ayah.text}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-light">{ayah.translation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-slate-700/60 my-2" />

        {/* Export settings */}
        <div className="space-y-1.5 animate-in fade-in">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-slate-400" /> Web Download Format
          </label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
          >
            <option value="mp4">MP4 (H.264/AAC - Great for WhatsApp / Instagram)</option>
            <option value="webm">WebM (VP9/Opus - High Speed Browser Download)</option>
          </select>
        </div>

        <button 
          type="submit"
          disabled={isSearchingVideo}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer border-0 mt-4"
        >
          {isSearchingVideo ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4.5 h-4.5" fill="currentColor" />
          )}
          Compile & Apply Settings
        </button>
      </form>
    </div>
  );
};

export default ControlPanel;
