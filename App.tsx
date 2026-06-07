import React, { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import VideoPlayer from './components/VideoPlayer';
import { fetchSurahList, fetchAyahs } from './services/quranService';
import { searchPexelsVideos } from './services/pexelsService';
import { Surah, Ayah, VideoConfig } from './types';
import { DEFAULT_BACKGROUND_VIDEO, SURAH_LIST_SIMPLE } from './constants';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>(SURAH_LIST_SIMPLE);
  const [currentAyahs, setCurrentAyahs] = useState<Ayah[]>([]);
  const [config, setConfig] = useState<VideoConfig>({
    reciterId: 'mishary',
    surahNumber: 1,
    startAyah: 1,
    endAyah: 7,
    channelName: "Quran Daily",
    videoPlaylist: [DEFAULT_BACKGROUND_VIDEO],
    exportFormat: 'mp4',
    arabicFont: 'amiri',
    fontSizeArabic: 56,
    fontSizeEnglish: 28,
    overlayOpacity: 0.4,
    showBorder: false,
    showVisualizer: true
  });
  const [isSearchingVideo, setIsSearchingVideo] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load Full Surah List on Mount
  useEffect(() => {
    const loadSurahs = async () => {
      const list = await fetchSurahList();
      if (list.length > 0) {
        setSurahs(list);
      }
    };
    loadSurahs();
  }, []);

  // Initial Data Load
  useEffect(() => {
    handleConfigUpdate(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfigUpdate = async (newConfig: VideoConfig) => {
    // Only fetch new verses if surah, range, reciter changed, or if current list is empty
    const needsRefetch = 
      newConfig.surahNumber !== config.surahNumber ||
      newConfig.startAyah !== config.startAyah ||
      newConfig.endAyah !== config.endAyah ||
      newConfig.reciterId !== config.reciterId ||
      currentAyahs.length === 0;

    if (needsRefetch) {
      setIsFetchingData(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        // 1. Fetch Ayah Data (Text + Audio URLs)
        const ayahs = await fetchAyahs(
          newConfig.surahNumber,
          newConfig.startAyah,
          newConfig.endAyah,
          newConfig.reciterId
        );
        
        if (ayahs.length === 0) {
          setErrorMsg("Could not fetch Verse data. Please check your internet or verse range.");
        } else {
          setSuccessMsg("Updated Recitation.");
        }

        setCurrentAyahs(ayahs);
      } catch (err) {
          console.error(err);
          setErrorMsg("An error occurred while setting up the player.");
      } finally {
        setIsFetchingData(false);
      }
    }

    // Determine Video Playlist
    let playlist = config.videoPlaylist;

    // If custom URL is provided, it overrides the playlist to a single item
    if (newConfig.customVideoUrl && newConfig.customVideoUrl.trim() !== "") {
        playlist = [newConfig.customVideoUrl];
    } 
    // If a new playlist was provided by search/generation, use it
    else if (newConfig.videoPlaylist && newConfig.videoPlaylist.length > 0) {
        playlist = newConfig.videoPlaylist;
    }
    
    setConfig({
      ...newConfig,
      videoPlaylist: playlist
    });
  };

  const handlePexelsSearch = async (query: string): Promise<string[]> => {
    setIsSearchingVideo(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const videoUris = await searchPexelsVideos(query);
      if (videoUris.length > 0) {
        setSuccessMsg(`Found ${videoUris.length} background videos.`);
        return videoUris;
      } else {
        setErrorMsg("No videos found on Pexels for that query.");
        return [];
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Failed to search Pexels.");
      return [];
    } finally {
      setIsSearchingVideo(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Mobile/Tablet Header */}
      <div className="md:hidden p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
         <h1 className="font-bold text-xl text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> QuranGen
         </h1>
      </div>

      {/* Left Panel: Controls */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-full p-4 md:p-6 bg-slate-900 border-r border-slate-800 overflow-y-auto z-10">
        <div className="mb-6 hidden md:block">
           <h1 className="font-bold text-2xl text-emerald-400 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 animate-pulse" /> QuranGen
           </h1>
           <p className="text-slate-500 text-sm mt-1">AI Video Maker & Player</p>
        </div>
        
        <ControlPanel 
          surahs={surahs}
          config={config}
          onConfigChange={(partialConfig) => handleConfigUpdate({...config, ...partialConfig})}
          onSearchBackground={handlePexelsSearch}
          isSearchingVideo={isSearchingVideo}
        />
        
        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {errorMsg && (
              <div className="p-3 bg-red-900/40 border border-red-800/50 text-red-200 text-xs rounded-lg animate-in fade-in slide-in-from-top-2">
                  {errorMsg}
              </div>
          )}
          {successMsg && (
              <div className="p-3 bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 text-xs rounded-lg animate-in fade-in slide-in-from-top-2">
                  {successMsg}
              </div>
          )}

        </div>
      </div>

      {/* Right Panel: Player/Canvas */}
      <div className="w-full md:w-2/3 lg:w-3/4 h-full p-4 md:p-8 bg-slate-950 flex flex-col justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none"></div>
        
        <div className="z-10 w-full max-w-6xl mx-auto">
          {isFetchingData ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 animate-pulse">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                  <p className="text-lg font-medium text-slate-300">Loading Recitation Data...</p>
                  <p className="text-sm">Fetching Ayahs and Translations</p>
              </div>
          ) : (
              <VideoPlayer 
                  ayahs={currentAyahs}
                  playlist={config.videoPlaylist}
                  channelName={config.channelName}
                  exportFormat={config.exportFormat}
                  config={config}
              />
          )}
        </div>
      </div>

    </div>
  );
};

export default App;