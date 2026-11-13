"use client";

import { useState, useRef, useEffect } from "react";
import { useMusic } from "@/context/MusicContext";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Shuffle,
  ChevronUp,
  ChevronDown,
  ListMusic,
  X,
  Sparkles,
  Disc3,
  Loader2,
} from "lucide-react";
import { sound } from "@/lib/sound";

interface BackgroundMusicPlayerProps {
  embeddedInNavbar?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function BackgroundMusicPlayer({
  embeddedInNavbar = false,
}: BackgroundMusicPlayerProps) {
  const {
    config,
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    loop,
    shuffle,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    isPlayerExpanded,
    setIsPlayerExpanded,
  } = useMusic();

  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLInputElement>(null);

  // Close player popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
        setIsPlayerExpanded(false);
        setShowPlaylistDrawer(false);
      }
    }
    if (isPlayerExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPlayerExpanded, setIsPlayerExpanded]);

  // If entire music system is disabled by admin:
  // If showTopbarToggle is also false, hide completely.
  // If showTopbarToggle is true, we display it in a disabled state so visitor sees it's disabled.
  if (config && !config.enabled) {
    if (!config.showTopbarToggle) {
      return null;
    }
    // Render muted disabled button
    return (
      <div
        className="relative inline-flex items-center"
        title="Background Music is currently disabled by administrator"
      >
        <button
          disabled
          aria-label="Background Music Disabled"
          className="px-2.5 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono opacity-40 cursor-not-allowed flex items-center gap-2"
        >
          <Music className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline text-[10px] tracking-wider uppercase text-zinc-500">
            Music Off
          </span>
        </button>
      </div>
    );
  }

  // If admin turned off topbar toggle specifically
  if (config && !config.showTopbarToggle && embeddedInNavbar) {
    return null;
  }

  // If no tracks exist yet
  if (tracks.length === 0) {
    return null;
  }

  const buttonStyle = config?.buttonStyle || "equalizer";

  return (
    <div ref={playerRef} className="relative inline-flex items-center">
      {/* =========================================================================
          TOPBAR TOGGLE BUTTON (Customizable Style)
          ========================================================================= */}
      <div className="flex items-center gap-1 group">
        <button
          onClick={() => {
            sound.playClick();
            togglePlay();
          }}
          onMouseEnter={() => sound.playHover()}
          aria-label={isPlaying ? "Pause Background Music" : "Play Background Music"}
          title={
            isPlaying
              ? `Now Playing: ${currentTrack?.title || "Background Music"} (Click to Pause)`
              : `Start Background Music: ${currentTrack?.title || "Ambient Audio"}`
          }
          className={`relative px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2.5 select-none ${
            isPlaying
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:border-emerald-400"
              : "border-white/10 hover:border-white/30 bg-white/5 text-zinc-400 hover:text-white"
          }`}
          style={{
            borderColor: isPlaying ? "var(--theme-border-glow, rgba(16,185,129,0.5))" : undefined,
          }}
        >
          {/* Animated Equalizer Bars or Disc */}
          {buttonStyle === "vinyl" ? (
            <Disc3
              className={`w-4 h-4 transition-transform ${
                isPlaying ? "animate-spin-slow text-emerald-400" : "text-zinc-500"
              }`}
            />
          ) : (
            <div className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center py-[1px]">
              <span
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  isPlaying ? "bg-emerald-400 animate-eq-1" : "h-[3px] bg-zinc-500"
                }`}
                style={{
                  backgroundColor: isPlaying ? "var(--theme-accent, #34d399)" : undefined,
                }}
              />
              <span
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  isPlaying ? "bg-emerald-400 animate-eq-2" : "h-[3px] bg-zinc-500"
                }`}
                style={{
                  backgroundColor: isPlaying ? "var(--theme-accent, #34d399)" : undefined,
                }}
              />
              <span
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  isPlaying ? "bg-emerald-400 animate-eq-3" : "h-[3px] bg-zinc-500"
                }`}
                style={{
                  backgroundColor: isPlaying ? "var(--theme-accent, #34d399)" : undefined,
                }}
              />
              <span
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  isPlaying ? "bg-emerald-400 animate-eq-4" : "h-[3px] bg-zinc-500"
                }`}
                style={{
                  backgroundColor: isPlaying ? "var(--theme-accent, #34d399)" : undefined,
                }}
              />
            </div>
          )}

          {/* Text Badge (Desktop) */}
          <span className="hidden sm:inline font-mono text-[11px] font-semibold tracking-wider uppercase">
            {isLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>Loading</span>
              </span>
            ) : isPlaying ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Music ON</span>
              </span>
            ) : (
              <span>Music OFF</span>
            )}
          </span>

          {/* Active Glow Ring */}
          {isPlaying && (
            <span
              className="absolute inset-0 rounded-xl pointer-events-none opacity-20 animate-pulse"
              style={{
                boxShadow: "0 0 12px var(--theme-accent, #10b981)",
              }}
            />
          )}
        </button>

        {/* Expand / Minimize Popover Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            setIsPlayerExpanded((prev) => !prev);
          }}
          aria-label={isPlayerExpanded ? "Collapse Music Player" : "Expand Music Player"}
          title={isPlayerExpanded ? "Close player deck" : "Open audio player controls"}
          className={`p-1.5 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer ${
            isPlayerExpanded ? "bg-white/15 text-white border-white/30" : ""
          }`}
        >
          {isPlayerExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* =========================================================================
          EXPANDABLE COMPACT PREMIUM AUDIO PLAYER DECK
          ========================================================================= */}
      {isPlayerExpanded && (
        <div
          className="absolute top-full right-0 mt-3 w-80 sm:w-88 p-4 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl"
          style={{
            backgroundColor: "rgba(10, 8, 18, 0.94)",
            borderColor: "var(--theme-border-glow, rgba(255,255,255,0.15))",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px var(--theme-glow, rgba(135,62,255,0.2))",
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--theme-primary-gradient)",
                }}
              >
                <Music className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Background Music
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                  showPlaylistDrawer
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
                title="View full playlist"
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Tracks ({tracks.length})</span>
              </button>

              <button
                onClick={() => setIsPlayerExpanded(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Currently Playing Card */}
          <div className="py-3.5 flex items-center gap-3.5">
            {/* Spinning Holographic Vinyl / Artwork Disc */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 h-14 rounded-full border-2 border-white/20 p-1 flex items-center justify-center transition-all ${
                  isPlaying ? "animate-spin-slow border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "opacity-75"
                }`}
                style={{
                  background: "radial-gradient(circle, rgba(40,30,60,1) 0%, rgba(10,8,18,1) 80%)",
                }}
              >
                <div className="w-4 h-4 rounded-full bg-zinc-900 border border-white/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              {isPlaying && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A0812] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              )}
            </div>

            {/* Title & Artist */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold"
                >
                  {currentTrack?.playlist || "Ambient"}
                </span>
                {currentTrack?.isDefault && (
                  <span className="text-[9px] font-mono text-amber-400 font-bold">
                    DEFAULT
                  </span>
                )}
              </div>
              <h4 className="font-sans font-bold text-sm text-white truncate mt-1">
                {currentTrack?.title || "Select a song"}
              </h4>
              <p className="font-mono text-xs text-zinc-400 truncate">
                {currentTrack?.artist || "Ambient Soundscape"}
              </p>
            </div>
          </div>

          {/* Scrubbable Progress Bar */}
          <div className="space-y-1">
            <input
              ref={progressBarRef}
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              aria-label="Seek track position"
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport Controls (Shuffle, Prev, Play/Pause, Next, Loop) */}
          <div className="flex items-center justify-between pt-3 pb-2">
            <button
              onClick={() => {
                sound.playClick();
                toggleShuffle();
              }}
              aria-label={shuffle ? "Disable Shuffle" : "Enable Shuffle"}
              title={shuffle ? "Shuffle: ON" : "Shuffle: OFF"}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                shuffle ? "text-emerald-400 bg-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                prevTrack();
              }}
              aria-label="Previous Track"
              title="Previous song"
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => {
                sound.playClick();
                togglePlay();
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "var(--theme-primary-gradient, linear-gradient(135deg, #FF5A1F 0%, #873EFF 100%))",
                boxShadow: isPlaying
                  ? "0 0 20px rgba(16, 185, 129, 0.4)"
                  : "0 0 20px var(--theme-glow, rgba(135, 62, 255, 0.35))",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                nextTrack();
              }}
              aria-label="Next Track"
              title="Next song"
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                toggleLoop();
              }}
              aria-label={loop ? "Disable Loop" : "Enable Loop"}
              title={loop ? "Loop: ON" : "Loop: OFF"}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                loop ? "text-emerald-400 bg-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume Slider"
              className="flex-1 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />

            <span className="font-mono text-[10px] text-zinc-400 w-8 text-right">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* Playlist Drawer */}
          {showPlaylistDrawer && (
            <div className="mt-3 pt-3 border-t border-white/10 max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-2 pb-1 uppercase tracking-wider">
                <span>Playlist Songs</span>
                <span>Track {currentTrackIndex + 1}/{tracks.length}</span>
              </div>
              {tracks.map((track, idx) => {
                const isSelected = track.id === currentTrack?.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      sound.playClick();
                      playTrack(track);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                      isSelected
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-white font-bold"
                        : "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] opacity-60 w-4">{idx + 1}.</span>
                      <span className="truncate">{track.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isSelected && isPlaying && (
                        <div className="flex items-end gap-[1px] h-2.5 w-2.5 justify-center">
                          <span className="w-[2px] h-full bg-emerald-400 animate-eq-1" />
                          <span className="w-[2px] h-full bg-emerald-400 animate-eq-3" />
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-500">
                        {track.duration ? formatTime(track.duration) : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
