'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Languages,
  Subtitles,
  Loader2,
  Check,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export interface VideoPlayerProps {
  movie: {
    id: string;
    title: string;
    titleRw?: string | null;
    slug: string;
    videoUrl: string;
    video480pUrl?: string | null;
    video720pUrl?: string | null;
    video1080pUrl?: string | null;
    subtitlesUrl?: string | null;
    subtitlesRwUrl?: string | null;
    hasKinyarwanda: boolean;
    kinyarwandaType: 'NONE' | 'AUDIO_TRACK' | 'SEPARATE_VIDEO';
    kinyarwandaAudioUrl?: string | null;
    kinyarwandaVideoUrl?: string | null;
  };
  initialLanguage?: 'en' | 'rw';
  initialTime?: number;
}

export function VideoPlayer({ movie, initialLanguage = 'en', initialTime = 0 }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioTrackRef = useRef<HTMLAudioElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Dual-Language state
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'rw'>(
    movie.hasKinyarwanda && initialLanguage === 'rw' ? 'rw' : 'en'
  );

  // Quality state
  type Quality = 'auto' | '1080p' | '720p' | '480p';
  const [selectedQuality, setSelectedQuality] = useState<Quality>('auto');
  const [activeVideoSrc, setActiveVideoSrc] = useState(movie.videoUrl);

  // Subtitles
  const [activeSubtitle, setActiveSubtitle] = useState<'off' | 'en' | 'rw'>('off');

  // Menus
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  // Resume notification
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  // Determine actual video URL based on language and quality selection
  const resolveVideoUrl = useCallback(
    (quality: Quality, lang: 'en' | 'rw') => {
      // If separate video dubbing is active in Kinyarwanda
      if (lang === 'rw' && movie.kinyarwandaType === 'SEPARATE_VIDEO' && movie.kinyarwandaVideoUrl) {
        return movie.kinyarwandaVideoUrl;
      }

      // Resolutions
      if (quality === '480p' && movie.video480pUrl) return movie.video480pUrl;
      if (quality === '720p' && movie.video720pUrl) return movie.video720pUrl;
      if (quality === '1080p' && movie.video1080pUrl) return movie.video1080pUrl;

      return movie.videoUrl;
    },
    [movie]
  );

  // 1. Initial Load & Progress Recovery
  useEffect(() => {
    let startTime = initialTime;
    try {
      const savedProgress = localStorage.getItem(`nr_progress_${movie.id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.progressSeconds && parsed.progressSeconds > 10 && !parsed.completed) {
          startTime = parsed.progressSeconds;
          const mins = Math.floor(startTime / 60);
          const secs = Math.floor(startTime % 60);
          setResumeNotice(`Resuming from ${mins}:${secs < 10 ? '0' : ''}${secs}`);
          setTimeout(() => setResumeNotice(null), 5000);
        }
      }
    } catch {
      // Ignore storage errors
    }

    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  }, [movie.id, initialTime]);

  // 2. Continuous Progress Autosave (Every 5 seconds)
  useEffect(() => {
    if (!isPlaying || currentTime <= 0) return;

    const interval = setInterval(() => {
      const progressData = {
        movieId: movie.id,
        progressSeconds: currentTime,
        durationSeconds: duration,
        language: activeLanguage,
        completed: duration > 0 && currentTime >= duration * 0.95,
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(`nr_progress_${movie.id}`, JSON.stringify(progressData));

        // Sync with backend API (authenticated or guest)
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
        }).catch(() => {});
      } catch {
        // Ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, activeLanguage, movie.id]);

  // 3. Audio Track Synchronization (Single Video + Second Audio Track)
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioTrackRef.current;

    if (!video) return;

    if (activeLanguage === 'rw' && movie.kinyarwandaType === 'AUDIO_TRACK' && audio) {
      // Mute primary video and unmute secondary Kinyarwanda audio track
      video.muted = true;
      audio.muted = isMuted;
      audio.volume = volume;
      audio.currentTime = video.currentTime;
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    } else {
      // English or separate video mode: use primary video audio
      video.muted = isMuted;
      video.volume = volume;
      if (audio) {
        audio.pause();
      }
    }
  }, [activeLanguage, isMuted, volume, isPlaying, movie.kinyarwandaType]);

  // 4. Handle Hot-Swapping Video Stream for Quality or Separate Video
  const handleQualityChange = (quality: Quality) => {
    const video = videoRef.current;
    if (!video) return;

    const savedTime = video.currentTime;
    const wasPlaying = !video.paused;

    setSelectedQuality(quality);
    const newSrc = resolveVideoUrl(quality, activeLanguage);
    setActiveVideoSrc(newSrc);

    video.src = newSrc;
    video.currentTime = savedTime;
    if (wasPlaying) {
      video.play().catch(() => {});
    }
    setShowQualityMenu(false);
  };

  // 5. Handle Language Switch
  const toggleLanguage = () => {
    const nextLang = activeLanguage === 'en' ? 'rw' : 'en';
    const video = videoRef.current;
    if (!video) return;

    setActiveLanguage(nextLang);

    if (movie.kinyarwandaType === 'SEPARATE_VIDEO') {
      const savedTime = video.currentTime;
      const wasPlaying = !video.paused;
      const newSrc = resolveVideoUrl(selectedQuality, nextLang);
      setActiveVideoSrc(newSrc);
      video.src = newSrc;
      video.currentTime = savedTime;
      if (wasPlaying) {
        video.play().catch(() => {});
      }
    }
  };

  // Controls Visibility Timer
  const handleActivity = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
        setShowSubtitleMenu(false);
      }
    }, 3500);
    setControlsTimeout(timeout);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    handleActivity();
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);

    if (audioTrackRef.current && activeLanguage === 'rw') {
      audioTrackRef.current.currentTime = newTime;
    }
    handleActivity();
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);

    if (audioTrackRef.current && activeLanguage === 'rw') {
      audioTrackRef.current.currentTime = newTime;
    }
    handleActivity();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(10);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyL' && movie.hasKinyarwanda) {
        e.preventDefault();
        toggleLanguage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleActivity}
      onTouchStart={handleActivity}
      className="relative w-full aspect-video bg-[#1B1F3B] rounded-2xl sm:rounded-3xl overflow-hidden shadow-soft select-none group border border-brand-border/60"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={activeVideoSrc}
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            // Calculate buffer
            const len = videoRef.current.buffered.length;
            if (len > 0) {
              setBuffered(videoRef.current.buffered.end(len - 1));
            }
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      >
        {movie.subtitlesUrl && (
          <track
            label="English"
            kind="subtitles"
            srcLang="en"
            src={movie.subtitlesUrl}
            default={activeSubtitle === 'en'}
          />
        )}
        {movie.subtitlesRwUrl && (
          <track
            label="Ikinyarwanda"
            kind="subtitles"
            srcLang="rw"
            src={movie.subtitlesRwUrl}
            default={activeSubtitle === 'rw'}
          />
        )}
      </video>

      {/* Hidden Secondary Audio Track for Kinyarwanda Dubbing */}
      {movie.hasKinyarwanda && movie.kinyarwandaAudioUrl && movie.kinyarwandaType === 'AUDIO_TRACK' && (
        <audio ref={audioTrackRef} src={movie.kinyarwandaAudioUrl} preload="auto" />
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#1B1F3B]/40">
          <Loader2 className="w-12 h-12 text-brand-amber animate-spin" />
        </div>
      )}

      {/* Resume Time Notification Toast */}
      {resumeNotice && (
        <div className="absolute top-4 left-4 z-30 px-4 py-2 rounded-2xl bg-[#1B1F3B]/90 border border-brand-amber text-xs font-bold text-brand-amber shadow-amber flex items-center gap-2 animate-fade-in">
          <Clock className="w-4 h-4" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {/* Ambient Gradient Overlays */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-[#1B1F3B]/90 via-transparent to-[#1B1F3B]/50 transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-amber text-[#1B1F3B] flex items-center justify-center shadow-amber hover:scale-110 active:scale-95 transition-all">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-[#1B1F3B]" />
          </div>
        </div>
      )}

      {/* Top Bar Overlay: Title and Language Pill */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-brand-text line-clamp-1 drop-shadow-md">
            {activeLanguage === 'rw' && movie.titleRw ? movie.titleRw : movie.title}
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-[#1B1F3B]/80 border border-brand-border text-[11px] font-bold text-brand-amber">
            {selectedQuality.toUpperCase()}
          </span>
        </div>

        {/* Quick Language Toggle Button */}
        {movie.hasKinyarwanda && (
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface/90 hover:bg-brand-surface text-xs font-extrabold border border-brand-border shadow-soft transition-all"
            title="Switch Language (English / Ikinyarwanda)"
          >
            <Languages className="w-3.5 h-3.5 text-brand-amber" />
            <span className="text-brand-text">
              {activeLanguage === 'rw' ? 'Ikinyarwanda' : 'English'}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-6 space-y-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          {/* Buffer Bar */}
          <div
            className="absolute left-0 h-1.5 bg-[#2F3563] rounded-full pointer-events-none"
            style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
          />
          {/* Progress Fill */}
          <div
            className="absolute left-0 h-1.5 bg-brand-amber rounded-full pointer-events-none"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          {/* Range Input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubberChange}
            className="w-full h-1.5 opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {/* Left Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              type="button"
              className="p-1.5 sm:p-2 text-brand-text hover:text-brand-amber transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => seek(-10)}
              type="button"
              className="p-1.5 text-brand-text hover:text-brand-amber transition-colors hidden sm:block"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => seek(10)}
              type="button"
              className="p-1.5 text-brand-text hover:text-brand-amber transition-colors hidden sm:block"
              title="Fast forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume / Mute */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                type="button"
                className="p-1.5 text-brand-text hover:text-brand-amber transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-brand-coral" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-brand-surface rounded-lg appearance-none cursor-pointer accent-brand-amber hidden sm:block"
              />
            </div>

            {/* Time Display */}
            <span className="text-xs font-mono text-brand-text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dual Language Button */}
            {movie.hasKinyarwanda && (
              <button
                onClick={toggleLanguage}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                  activeLanguage === 'rw'
                    ? 'bg-brand-green/20 text-brand-green border-brand-green/40'
                    : 'bg-brand-surface text-brand-text border-brand-border'
                }`}
                title="Toggle Kinyarwanda Audio"
              >
                <Languages className="w-3.5 h-3.5 text-brand-amber" />
                <span>{activeLanguage === 'rw' ? 'RW Dub' : 'EN Audio'}</span>
              </button>
            )}

            {/* Subtitles Button */}
            {(movie.subtitlesUrl || movie.subtitlesRwUrl) && (
              <div className="relative">
                <button
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  type="button"
                  className="p-1.5 text-brand-text hover:text-brand-amber transition-colors"
                  title="Subtitles / Closed Captions"
                >
                  <Subtitles className="w-4 h-4" />
                </button>
                {showSubtitleMenu && (
                  <div className="absolute bottom-10 right-0 w-36 bg-brand-surface border border-brand-border rounded-xl p-1 shadow-card text-xs space-y-1">
                    <button
                      onClick={() => {
                        setActiveSubtitle('off');
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                        activeSubtitle === 'off' ? 'bg-brand-amber/20 text-brand-amber font-bold' : 'text-brand-text'
                      }`}
                    >
                      <span>Off</span>
                      {activeSubtitle === 'off' && <Check className="w-3 h-3" />}
                    </button>
                    {movie.subtitlesUrl && (
                      <button
                        onClick={() => {
                          setActiveSubtitle('en');
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          activeSubtitle === 'en' ? 'bg-brand-amber/20 text-brand-amber font-bold' : 'text-brand-text'
                        }`}
                      >
                        <span>English</span>
                        {activeSubtitle === 'en' && <Check className="w-3 h-3" />}
                      </button>
                    )}
                    {movie.subtitlesRwUrl && (
                      <button
                        onClick={() => {
                          setActiveSubtitle('rw');
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          activeSubtitle === 'rw' ? 'bg-brand-amber/20 text-brand-amber font-bold' : 'text-brand-text'
                        }`}
                      >
                        <span>Ikinyarwanda</span>
                        {activeSubtitle === 'rw' && <Check className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                type="button"
                className="p-1.5 text-brand-text hover:text-brand-amber transition-colors flex items-center gap-1"
                title="Streaming Quality"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[11px] font-bold text-brand-amber hidden sm:inline">
                  {selectedQuality}
                </span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-10 right-0 w-44 bg-brand-surface border border-brand-border rounded-2xl p-1.5 shadow-card text-xs space-y-1 z-30">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-brand-text-muted">
                    Quality / Data Saver
                  </div>
                  {(['auto', '1080p', '720p', '480p'] as Quality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        selectedQuality === q
                          ? 'bg-brand-amber text-[#1B1F3B] font-bold'
                          : 'text-brand-text hover:bg-brand-surface-hover'
                      }`}
                    >
                      <span>
                        {q === 'auto'
                          ? 'Auto (Adaptive)'
                          : q === '480p'
                          ? '480p (Mobile Saver)'
                          : q === '720p'
                          ? '720p (HD)'
                          : '1080p (Full HD)'}
                      </span>
                      {selectedQuality === q && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              type="button"
              className="p-1.5 text-brand-text hover:text-brand-amber transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

