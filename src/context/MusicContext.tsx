"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import type { MusicTrack, MusicConfig } from "@/types";

interface MusicContextType {
  config: MusicConfig | null;
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loop: boolean;
  shuffle: boolean;
  playbackMode: string;
  playlists: string[];
  activePlaylist: string;
  isPlayerExpanded: boolean;
  hasUserInteracted: boolean;
  autoplayBlocked: boolean;
  togglePlay: () => Promise<void>;
  playTrack: (track: MusicTrack) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setActivePlaylist: (playlist: string) => void;
  setIsPlayerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  reloadMusic: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const PREF_KEY_STATE = "portfolio_music_pref_state"; // "playing" | "paused"
const PREF_KEY_VOLUME = "portfolio_music_pref_vol";
const PREF_KEY_TRACK = "portfolio_music_pref_track_id";
const PREF_KEY_TIME = "portfolio_music_pref_time";

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [config, setConfig] = useState<MusicConfig | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [activePlaylist, setActivePlaylistState] = useState<string>("all");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(true);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [playbackMode, setPlaybackMode] = useState<string>("playlist");
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Single HTML5 Audio instance reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingBeforeAdminRef = useRef<boolean>(false);
  const tracksRef = useRef<MusicTrack[]>([]);
  tracksRef.current = tracks;
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;
  const loopRef = useRef<boolean>(loop);
  loopRef.current = loop;
  const shuffleRef = useRef<boolean>(shuffle);
  shuffleRef.current = shuffle;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;

  const currentTrack = tracks[currentTrackIndex] || null;

  // Fetch music system configuration & tracks from API
  const reloadMusic = useCallback(async () => {
    try {
      const res = await fetch("/api/music", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (data.config) {
        setConfig(data.config);
        setLoop(data.config.loop ?? true);
        setShuffle(data.config.shuffle ?? false);
        setPlaybackMode(data.config.playbackMode || "playlist");
        if (data.config.activePlaylist) {
          setActivePlaylistState(data.config.activePlaylist);
        }
      }

      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        setTracks(data.tracks);
        setPlaylists(data.playlists || []);

        // Restore saved track preference or default track
        let initialIndex = 0;
        const savedTrackId = typeof window !== "undefined" ? localStorage.getItem(PREF_KEY_TRACK) : null;
        if (savedTrackId) {
          const foundIdx = data.tracks.findIndex((t: MusicTrack) => t.id === savedTrackId);
          if (foundIdx !== -1) initialIndex = foundIdx;
        } else if (data.defaultTrack) {
          const foundIdx = data.tracks.findIndex((t: MusicTrack) => t.id === data.defaultTrack.id);
          if (foundIdx !== -1) initialIndex = foundIdx;
        }
        setCurrentTrackIndex(initialIndex);
      } else {
        setTracks([]);
      }
    } catch (err) {
      console.error("Failed to load background music data:", err);
    }
  }, []);

  // Initialize Audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.setAttribute("playsinline", "true");

      // Restore volume preference
      const savedVol = localStorage.getItem(PREF_KEY_VOLUME);
      const initVol = savedVol !== null ? parseFloat(savedVol) : 0.35;
      audio.volume = Math.max(0, Math.min(1, initVol));
      setVolumeState(audio.volume);
      volumeRef.current = audio.volume;

      // Event listeners
      const onTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        // Persist playback time
        if (audioRef.current.currentTime > 0) {
          sessionStorage.setItem(PREF_KEY_TIME, String(audioRef.current.currentTime));
        }
      };

      const onDurationChange = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration || 0);
      };

      const onWaiting = () => setIsLoading(true);
      const onCanPlay = () => setIsLoading(false);

      const onPlay = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setAutoplayBlocked(false);
        localStorage.setItem(PREF_KEY_STATE, "playing");
      };

      const onPause = () => {
        setIsPlaying(false);
        localStorage.setItem(PREF_KEY_STATE, "paused");
      };

      const onEnded = () => {
        handleTrackEnded();
      };

      const onError = (e: Event) => {
        setIsLoading(false);
        setIsPlaying(false);
        console.warn("Audio playback event error:", e);
      };

      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("durationchange", onDurationChange);
      audio.addEventListener("loadedmetadata", onDurationChange);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      audioRef.current = audio;
    }

    reloadMusic();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [reloadMusic]);

  // Audio smooth volume fade helpers
  const smoothFade = useCallback((targetVol: number, durationMs = 250, onComplete?: () => void) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const startVol = audioRef.current.volume;
    const steps = 15;
    const stepTime = durationMs / steps;
    const stepDelta = (targetVol - startVol) / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }

      const nextVol = Math.max(0, Math.min(1, startVol + stepDelta * currentStep));
      audioRef.current.volume = nextVol;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audioRef.current.volume = targetVol;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }, []);

  // Set audio source when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const currentSrc = audio.getAttribute("data-track-src");
    if (currentSrc !== currentTrack.audioUrl) {
      const wasAudioPlaying = isPlaying;
      audio.setAttribute("data-track-src", currentTrack.audioUrl);
      audio.src = currentTrack.audioUrl;
      audio.load();

      // Remember current track ID in local storage
      localStorage.setItem(PREF_KEY_TRACK, currentTrack.id);

      // Restore saved position if newly initialized
      const savedTime = sessionStorage.getItem(PREF_KEY_TIME);
      if (savedTime && parseFloat(savedTime) > 0) {
        audio.currentTime = parseFloat(savedTime);
        sessionStorage.removeItem(PREF_KEY_TIME);
      }

      if (wasAudioPlaying && !isAdminRoute && config?.enabled) {
        audio
          .play()
          .catch((err) => console.warn("Track change play blocked:", err));
      }
    }
  }, [currentTrack, isAdminRoute, config?.enabled]);

  // Enable native HTML5 audio looping so the background music repeats
  // seamlessly from the beginning with no silence gap between repetitions.
  // Applied for single-track playback (the ambient background music); the
  // multi-track playlist keeps its sequential loop handling below.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loop && tracks.length <= 1;
  }, [loop, tracks.length]);

  // Pause background music on admin routes to allow song previews without clashing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAdminRoute) {
      if (isPlaying) {
        wasPlayingBeforeAdminRef.current = true;
        audio.pause();
      }
    } else {
      // Returned from admin route: if it was playing, resume smoothly
      if (wasPlayingBeforeAdminRef.current && config?.enabled) {
        wasPlayingBeforeAdminRef.current = false;
        audio
          .play()
          .catch(() => {});
      }
    }
  }, [isAdminRoute, isPlaying, config?.enabled]);

  // Handle browser autoplay policy and user interaction
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFirstInteraction = () => {
      setHasUserInteracted(true);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);

      // Check if user previously had music ON or if admin enabled autoplay
      const savedPref = localStorage.getItem(PREF_KEY_STATE);
      const shouldAttemptAutoplay =
        config?.enabled &&
        (savedPref === "playing" || (savedPref === null && config?.autoplayAttempt));

      if (shouldAttemptAutoplay && audioRef.current && !isAdminRoute) {
        audioRef.current
          .play()
          .catch((err) => {
            console.warn("Autoplay interaction attempt prevented by browser:", err);
            setAutoplayBlocked(true);
          });
      }
    };

    window.addEventListener("pointerdown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, [config?.enabled, config?.autoplayAttempt, isAdminRoute]);

  // Track ended handler (Loop / Playlist / Shuffle)
  const handleTrackEnded = useCallback(() => {
    const currentList = tracksRef.current;
    if (currentList.length === 0) return;

    if (loopRef.current && currentList.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (shuffleRef.current && currentList.length > 1) {
      let nextIdx = Math.floor(Math.random() * currentList.length);
      if (nextIdx === currentTrackIndexRef.current) {
        nextIdx = (nextIdx + 1) % currentList.length;
      }
      setCurrentTrackIndex(nextIdx);
      return;
    }

    // Normal sequential playback
    const nextIdx = (currentTrackIndexRef.current + 1) % currentList.length;
    // If not looping and reached the end of playlist, pause
    if (nextIdx === 0 && !loopRef.current) {
      setIsPlaying(false);
      return;
    }
    setCurrentTrackIndex(nextIdx);
  }, []);

  // Control Actions
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If music is globally disabled in admin settings, do not play
    if (config && !config.enabled) {
      console.warn("Background music is disabled by administrator.");
      return;
    }

    if (isPlaying) {
      // Smooth fade out before pausing
      const curVol = volumeRef.current;
      smoothFade(0, 150, () => {
        audio.pause();
        audio.volume = curVol;
        setIsPlaying(false);
      });
      localStorage.setItem(PREF_KEY_STATE, "paused");
    } else {
      try {
        const targetVol = volumeRef.current;
        audio.volume = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          smoothFade(targetVol, 200);
          setIsPlaying(true);
          setAutoplayBlocked(false);
          localStorage.setItem(PREF_KEY_STATE, "playing");
        }
      } catch (err) {
        console.warn("Audio play() promise rejected:", err);
        setAutoplayBlocked(true);
      }
    }
  }, [isPlaying, config, smoothFade]);

  const playTrack = useCallback(async (track: MusicTrack) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      const audio = audioRef.current;
      if (audio) {
        audio.setAttribute("data-track-src", track.audioUrl);
        audio.src = track.audioUrl;
        audio.load();
        try {
          await audio.play();
          setIsPlaying(true);
          localStorage.setItem(PREF_KEY_STATE, "playing");
        } catch (err) {
          console.warn("Track play rejected:", err);
        }
      }
    }
  }, [tracks]);

  const nextTrack = useCallback(async () => {
    if (tracks.length === 0) return;
    if (shuffle && tracks.length > 1) {
      let nextIdx = Math.floor(Math.random() * tracks.length);
      if (nextIdx === currentTrackIndex) {
        nextIdx = (nextIdx + 1) % tracks.length;
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      const nextIdx = (currentTrackIndex + 1) % tracks.length;
      setCurrentTrackIndex(nextIdx);
    }
  }, [tracks, shuffle, currentTrackIndex]);

  const prevTrack = useCallback(async () => {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    // If playing more than 3 seconds into the track, restart it
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
  }, [tracks, currentTrackIndex]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const safeTime = Math.max(0, Math.min(audio.duration || duration || 0, seconds));
    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (audio) {
      audio.volume = clamped;
    }
    setIsMuted(clamped === 0);
    localStorage.setItem(PREF_KEY_VOLUME, String(clamped));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      const restore = volume > 0 ? volume : 0.35;
      audio.volume = restore;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleLoop = useCallback(() => {
    setLoop((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const setActivePlaylist = useCallback((playlist: string) => {
    setActivePlaylistState(playlist);
  }, []);

  return (
    <MusicContext.Provider
      value={{
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
        playbackMode,
        playlists,
        activePlaylist,
        isPlayerExpanded,
        hasUserInteracted,
        autoplayBlocked,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        setActivePlaylist,
        setIsPlayerExpanded,
        reloadMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
