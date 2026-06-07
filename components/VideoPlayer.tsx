import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Ayah, ExportFormat, VideoConfig } from '../types';
import { Play, Pause, SkipBack, SkipForward, Maximize, Download, AlertTriangle, VideoOff } from 'lucide-react';

interface VideoPlayerProps {
  ayahs: Ayah[];
  playlist: string[]; // Array of background video URLs
  channelName: string;
  exportFormat: ExportFormat;
  config: VideoConfig;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  ayahs, 
  playlist, 
  channelName, 
  exportFormat, 
  config 
}) => {
  // Config overrides / customizer options
  const arabicFont = config.arabicFont || 'amiri';
  const fontSizeArabic = config.fontSizeArabic || 56;
  const fontSizeEnglish = config.fontSizeEnglish || 28;
  const overlayOpacity = config.overlayOpacity !== undefined ? config.overlayOpacity : 0.4;
  const showBorder = false;
  const showVisualizer = config.showVisualizer !== undefined ? config.showVisualizer : true;

  // React State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null); // For background video preloading
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Audio Pipeline Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Seamless Background Transition and Crossfading Refs
  const lastFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionAlphaRef = useRef<number>(1.0);
  const isTransitioningRef = useRef<boolean>(false);
  const hasLastFrameRef = useRef<boolean>(false);
  const lastUrlRef = useRef<string>('');

  const currentAyah = ayahs[currentAyahIndex];
  const currentVideoUrl = playlist[currentVideoIndex] || playlist[0] || '';
  const nextVideoUrl = playlist[(currentVideoIndex + 1) % playlist.length] || playlist[0] || '';

  // Trigger seamless background transitions on URL change
  useEffect(() => {
    if (currentVideoUrl && currentVideoUrl !== lastUrlRef.current) {
      if (lastUrlRef.current) {
        isTransitioningRef.current = true;
        transitionAlphaRef.current = 0.0;
      }
      lastUrlRef.current = currentVideoUrl;
    }
  }, [currentVideoUrl]);

  // Get Supported MIME type
  const getSelectedMimeType = (format: ExportFormat) => {
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 Baseline + AAC LC (optimal compatibility)
      'video/mp4;codecs=avc1.4d401e,mp4a.40.2', 
      'video/mp4;codecs=avc1.64001E,mp4a.40.2', 
      'video/mp4;codecs=h264,aac',              
      'video/mp4'                               
    ];

    const webmTypes = [
       'video/webm;codecs=vp9,opus',
       'video/webm;codecs=vp8,opus',
       'video/webm',
    ];

    const priority = format === 'mp4' ? [...mp4Types, ...webmTypes] : [...webmTypes, ...mp4Types];

    for (const type of priority) {
        if (MediaRecorder.isTypeSupported(type)) {
            console.log(`MIME selection active: ${type}`);
            return type;
        }
    }
    return ''; 
  };

  // Draw Wrapped Text centered
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number, 
    isArabic: boolean = false
  ) => {
    ctx.direction = isArabic ? 'rtl' : 'ltr';
    
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineArray: string[] = [];

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lineArray.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lineArray.push(line);

    // Render centered lines matching middle baseline
    const startY = y - ((lineArray.length - 1) * lineHeight) / 2;

    for (let k = 0; k < lineArray.length; k++) {
       ctx.fillText(lineArray[k], x, startY + (k * lineHeight));
    }
  };

  // Dynamic Audio Context lazy integration
  const ensureAudioConnected = () => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const dest = ctx.createMediaStreamDestination();
            audioDestRef.current = dest;
        }
    }

    if (audioContextRef.current && audioRef.current && !audioSourceRef.current) {
        try {
            const ctx = audioContextRef.current;
            const dest = audioDestRef.current!;

            const source = ctx.createMediaElementSource(audioRef.current);
            audioSourceRef.current = source;

            // Frequency Analyzer initialization
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64; 
            analyserRef.current = analyser;

            source.connect(analyser);
            analyser.connect(dest);
            analyser.connect(ctx.destination);
            
            console.log("Audio pipeline connected successfully on interaction.");
        } catch (e) {
            console.error("Audio pipeline lazy mount exception:", e);
        }
    }
  };

  // Main canvas render frame loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && video && ctx) {
        // Reset any context transformation defaults
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1.0;

        // 1. Draw Background Video with seamless transition caching and crossfading
        let hasDrawnBackground = false;

        const videoW = video.videoWidth || 1920;
        const videoH = video.videoHeight || 1080;
        const scale = Math.max(canvas.width / videoW, canvas.height / videoH);
        const x = (canvas.width / 2) - (videoW / 2) * scale;
        const y = (canvas.height / 2) - (videoH / 2) * scale;
        const w = videoW * scale;
        const h = videoH * scale;

        if (isTransitioningRef.current) {
            // Render the last valid static frame from the previous background first
            if (hasLastFrameRef.current && lastFrameCanvasRef.current) {
                ctx.drawImage(lastFrameCanvasRef.current, 0, 0, canvas.width, canvas.height);
                hasDrawnBackground = true;
            }

            if (video.readyState >= 2 && !videoError) {
                // Increment crossfade opacity dynamically on each frame loop (approx. 400ms speed)
                transitionAlphaRef.current = Math.min(1.0, transitionAlphaRef.current + 0.04);
                if (transitionAlphaRef.current >= 1.0) {
                    isTransitioningRef.current = false;
                }

                ctx.globalAlpha = transitionAlphaRef.current;
                ctx.drawImage(video, x, y, w, h);
                ctx.globalAlpha = 1.0;
                hasDrawnBackground = true;

                // Cache current frame on transition complete
                if (!isTransitioningRef.current) {
                    if (!lastFrameCanvasRef.current) {
                        lastFrameCanvasRef.current = document.createElement('canvas');
                        lastFrameCanvasRef.current.width = canvas.width;
                        lastFrameCanvasRef.current.height = canvas.height;
                    }
                    const lfCtx = lastFrameCanvasRef.current.getContext('2d');
                    if (lfCtx) {
                        lfCtx.drawImage(video, x, y, w, h);
                        hasLastFrameRef.current = true;
                    }
                }
            }
        } else {
            if (video.readyState >= 2 && !videoError) {
                ctx.drawImage(video, x, y, w, h);
                hasDrawnBackground = true;

                // Cache the running frame for subsequent background swaps
                if (!lastFrameCanvasRef.current) {
                    lastFrameCanvasRef.current = document.createElement('canvas');
                    lastFrameCanvasRef.current.width = canvas.width;
                    lastFrameCanvasRef.current.height = canvas.height;
                }
                const lfCtx = lastFrameCanvasRef.current.getContext('2d');
                if (lfCtx) {
                    lfCtx.drawImage(video, x, y, w, h);
                    hasLastFrameRef.current = true;
                }
            }
        }

        if (!hasDrawnBackground) {
             // Fallback dark ambient background gradient if first load
             const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
             gradient.addColorStop(0, '#0f172a');
             gradient.addColorStop(1, '#020617');
             ctx.fillStyle = gradient;
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Black Dimming Overlay Opacity (Adjustable via setup style)
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle buffering indicator drawn in the top-left corner if the background video is loading
        if (video && video.readyState < 2 && !videoError && playlist.length > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.font = 'normal 16px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText("Buffering background video...", 60, 60);
        }

        // 4. Floating Watermark Signature
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = 'bold 24px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.shadowBlur = 0;
        ctx.fillText(channelName.toUpperCase(), canvas.width - 60, 60);

        // 5. Quran Verses & Arabic Typography Overlay
        if (currentAyah) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxWidth = canvas.width * 0.76;

            // Font Selection Resolver
            let resolvedArFont = '"Amiri", serif';
            if (arabicFont === 'cairo') {
                resolvedArFont = '"Cairo", sans-serif';
            } else if (arabicFont === 'scheherazade') {
                resolvedArFont = '"Scheherazade New", serif';
            }

            // Draw Arabic text
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;
            ctx.font = `700 ${fontSizeArabic}px ${resolvedArFont}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Elevate offset upwards when drawing visualizer below
            const arOffsetY = showVisualizer ? 130 : 80;
            // Increased line height multiplier to 2.1 for Arabic text to provide spacious separation preventing diacritic overlapping
            drawWrappedText(ctx, currentAyah.text, centerX, centerY - arOffsetY, maxWidth, fontSizeArabic * 2.1, true);

            // Draw English translation text
            ctx.fillStyle = '#e2e8f0';
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.font = `300 ${fontSizeEnglish}px "Inter", sans-serif`;
            
            const enOffsetY = showVisualizer ? 80 : 120;
            drawWrappedText(ctx, currentAyah.translation || '', centerX, centerY + enOffsetY, maxWidth, fontSizeEnglish * 1.5, false);

            // Draw Verses reference number pill
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.fillStyle = '#34d399'; // Mint green color
            ctx.shadowBlur = 0;
            const refText = `  SURAH ${config.surahNumber} : VERSE ${currentAyah.numberInSurah}  `;
            const labelY = showVisualizer ? centerY + 240 : centerY + 260;
            ctx.fillText(refText, centerX, labelY);
        }

        // 6. Real-time Audio EQ Visualizer drawn dynamically on the Canvas
        if (showVisualizer && analyserRef.current && isPlaying) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            const numBars = 32;
            const barWidth = 10;
            const gap = 6;
            const visualizerWidth = (barWidth + gap) * numBars;
            const startX = (canvas.width - visualizerWidth) / 2;
            const bottomY = canvas.height - 110; 

            ctx.shadowBlur = 0; // Keep dynamic shapes vector-clear

            for (let i = 0; i < numBars; i++) {
                // Symmetrical bell-curve index mapping for clean wave looks
                const symmetricIndex = i < numBars / 2 ? i * 2 : (numBars - 1 - i) * 2;
                const freqValue = dataArray[symmetricIndex % bufferLength] || 0;
                const barHeight = (freqValue / 255) * 110 + 4; // max 110px, min 4px

                // Draw stylish emerald gradient pillars
                ctx.fillStyle = "rgba(16, 185, 129, 0.72)"; 
                const xPos = startX + i * (barWidth + gap);
                ctx.beginPath();
                ctx.roundRect(xPos, bottomY - barHeight, barWidth, barHeight, 5);
                ctx.fill();
            }
        }
    }
    
    requestRef.current = requestAnimationFrame(renderFrame);
  }, [channelName, currentAyah, videoError, showBorder, arabicFont, fontSizeArabic, fontSizeEnglish, overlayOpacity, showVisualizer, isPlaying]);

  // Handle Mount frame triggers
  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [renderFrame]);

  // Video controller loaders
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
        videoRef.current.load();
        if (isPlaying) {
            videoRef.current.play().catch(() => {});
        }
    }
  }, [currentVideoUrl]);

  // Next Video background preloading
  useEffect(() => {
      if (nextVideoRef.current && nextVideoUrl !== currentVideoUrl) {
          nextVideoRef.current.load();
      }
  }, [nextVideoUrl, currentVideoUrl]);

  // Recording clock timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Primary toggle controller
  const togglePlay = async () => {
    if (!audioRef.current || !videoRef.current) return;
    
    ensureAudioConnected();
    
    if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio run exception:", e));
      videoRef.current.play().catch(e => console.error("Video run exception:", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
        videoRef.current?.pause();
    }
  }, [isPlaying]);

  // Synchronize audio playback when currentAyahIndex changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        ensureAudioConnected();
        audioRef.current.play().catch(e => console.error("Audio playback error on verse change:", e));
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [currentAyahIndex]);

  // Reset indices on list shifts
  useEffect(() => {
    setIsPlaying(false);
    setCurrentAyahIndex(0);
    setProgress(0);
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.pause();
    }
    if (videoRef.current) {
        videoRef.current.pause();
    }
  }, [ayahs]);

  const handleVideoError = () => {
      console.warn("Video load error, skipping background sources...");
      if (playlist.length > 1) {
          setCurrentVideoIndex(prev => (prev + 1) % playlist.length);
      } else {
          setVideoError(true);
      }
  };

  const handleVideoEnded = () => {
      if (playlist.length > 1) {
          setCurrentVideoIndex(prev => (prev + 1) % playlist.length);
      } else {
          videoRef.current?.play().catch(() => {});
      }
  };

  const handleAudioEnded = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      videoRef.current?.pause();
      setCurrentAyahIndex(0);
      
      if (isRecording) {
        stopRecording();
      }
    }
  };

  // Recording MediaRecorder Pipeline
  const startRecording = async () => {
    setDownloadError(null);
    if (!canvasRef.current) return;
    
    ensureAudioConnected();
    
    if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    chunksRef.current = [];
    
    const canvasStream = canvasRef.current.captureStream(25); // capture at standard 25fps constant
    let combinedStream = canvasStream;

    if (audioDestRef.current && audioDestRef.current.stream) {
        const audioTracks = audioDestRef.current.stream.getAudioTracks();
        if (audioTracks.length > 0) {
            combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioTracks
            ]);
        }
    }

    const mimeType = getSelectedMimeType(exportFormat);
    
    if (!mimeType) {
        setDownloadError(`Export format not supported on this browser.`);
        return;
    }

    try {
        const mediaRecorder = new MediaRecorder(combinedStream, { 
            mimeType,
            videoBitsPerSecond: 4500000, // 4.5 Mbps for full clear 1080p outputs
            audioBitsPerSecond: 160000  // 160kbps stereo
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onerror = () => {
            setDownloadError("Compilation failed midway.");
            stopRecording();
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            if (blob.size === 0) {
                 setDownloadError("No media blocks compiled. Attempt again.");
                 setIsRecording(false);
                 return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            a.download = `quran_video_${Date.now()}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setIsRecording(false);
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        
        if (!isPlaying) {
             togglePlay();
        }

    } catch (e) {
        console.error("MediaRecorder start failure:", e);
        setDownloadError("Media capture permissions or encoder unavailable.");
        setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
  };

  const toggleRecord = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  return (
    <div className="flex flex-col gap-4 h-full" ref={containerRef}>
      
      {/* Cinematic Viewport Canvas */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800 group">
         <canvas 
           ref={canvasRef}
           width={1920}
           height={1080}
           className="w-full h-full object-contain"
         />

         {/* Black-screen placeholder failures */}
         {videoError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/80">
                  <div className="bg-black/80 p-4 rounded-lg flex items-center gap-2 text-amber-500 border border-amber-500/20 shadow-xl">
                      <VideoOff className="w-5 h-5 animate-bounce" />
                      <span className="text-sm font-medium">Underlying stream restricted. Skipping background playlist...</span>
                  </div>
              </div>
         )}

         {/* Raw Players Hidden */}
         <video 
           ref={videoRef}
           src={currentVideoUrl}
           className="hidden"
           crossOrigin="anonymous" 
           muted
           playsInline
           onEnded={handleVideoEnded}
           onError={handleVideoError}
         />
         <video 
           ref={nextVideoRef}
           src={nextVideoUrl}
           className="hidden"
           crossOrigin="anonymous" 
           muted
           playsInline
           preload="auto"
         />
         <audio 
           ref={audioRef}
           src={currentAyah?.audioUrl}
           onEnded={handleAudioEnded}
           onTimeUpdate={() => {
             if (audioRef.current && audioRef.current.duration) {
               setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
             }
           }}
           crossOrigin="anonymous"
           onError={() => console.error("Audio failed to stream")}
         />

         {/* Interactive Hover HUD overlay controls (Not recorded in generated canvas stream) */}
         <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/95 via-black/25 to-transparent p-5">
            <div className="w-full space-y-4">
                 {/* Timeline progress tracker */}
                <div 
                  className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
                  onClick={(e) => {
                    if (audioRef.current && audioRef.current.duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      audioRef.current.currentTime = percentage * audioRef.current.duration;
                    }
                  }}
                >
                    <div className="h-full bg-emerald-500 rounded-full" style={{width: `${progress}%`}} />
                </div>
                
                {/* HUD Action Rails */}
                <div className="flex justify-between items-center text-white">
                    <div className="flex gap-3.5 items-center">
                        <button 
                            type="button"
                            onClick={togglePlay}
                            className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95 border-0 cursor-pointer"
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-emerald-400"/> : <Play className="w-6 h-6 fill-emerald-400 ml-0.5"/>}
                        </button>
                        <div className="flex gap-1.5">
                            <button 
                              type="button"
                              onClick={() => setCurrentAyahIndex(Math.max(0, currentAyahIndex - 1))} 
                              className="hover:text-emerald-400 p-1.5 rounded-full hover:bg-white/5 transition-colors border-0 cursor-pointer text-slate-300"
                            >
                              <SkipBack className="w-5 h-5"/>
                            </button>
                            <button 
                              type="button"
                              onClick={() => setCurrentAyahIndex(Math.min(ayahs.length - 1, currentAyahIndex + 1))} 
                              className="hover:text-emerald-400 p-1.5 rounded-full hover:bg-white/5 transition-colors border-0 cursor-pointer text-slate-300"
                            >
                              <SkipForward className="w-5 h-5"/>
                            </button>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                             VERSE {currentAyahIndex + 1} of {ayahs.length}
                        </span>
                    </div>

                    <div className="flex gap-3.5 items-center">
                         {downloadError && (
                              <span className="text-amber-400 text-[10px] flex items-center gap-1 font-semibold bg-amber-950/70 px-2 px-2.5 py-1 rounded border border-amber-700/30">
                                  <AlertTriangle className="w-3.5 h-3.5" /> {downloadError}
                              </span>
                         )}
                         <button 
                            type="button"
                            onClick={toggleRecord} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border-0 cursor-pointer ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'}`}
                         >
                            <Download className="w-3.5 h-3.5" />
                            {isRecording ? `STOP REC (${recordingTime}s)` : 'DOWNLOAD VIDEO'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => containerRef.current?.requestFullscreen()} 
                          className="hover:bg-white/5 p-2 rounded-lg text-slate-400 hover:text-white transition-colors border-0 cursor-pointer"
                        >
                            <Maximize className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            </div>
         </div>
         
         {/* Live Recording HUD state */}
         {isRecording && (
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse shadow-lg z-20 border border-red-500">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  <span className="text-[10px] font-extrabold tracking-wider">REC</span>
              </div>
         )}
      </div>
      
      {/* Recording progress HUD with automatic final-verse triggers */}
      {isRecording && (
        <div className="p-3.5 bg-red-950/20 border border-red-800/40 text-red-100 text-xs rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold text-red-400">Recording & Compiling Active ({recordingTime}s)</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              For perfect results, please keep this tab active and playing. The player will automatically stop recording and trigger your high-fidelity video download as soon as the final selected verse finishes.
            </p>
          </div>
        </div>
      )}
      
      {/* Footer State Details */}
       <div className="flex justify-between items-center px-1.5 text-slate-400 text-xs">
        <p>Active Verse: <span className="text-emerald-400 font-bold">Ayah {currentAyah?.numberInSurah || 0}</span></p>
        <p className="opacity-60 text-[11px]">
            Exporting <span className="text-white font-semibold">{exportFormat.toUpperCase()}</span>. Output baked on browser canvas stream logic.
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
