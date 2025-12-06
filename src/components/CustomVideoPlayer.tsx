
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  const handleVideoClick = () => {
    handlePlayPause({ stopPropagation: () => {} } as React.MouseEvent);
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const hideControls = () => {
    if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
    }
  }

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    const handleLoadedMetadata = () => {
      if (video) setDuration(video.duration);
    };

    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      // Mute by default
      video.muted = true;
      setIsMuted(true);
    }
    
    if (container) {
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', hideControls);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
      if (container) {
          container.removeEventListener('mousemove', handleMouseMove);
          container.removeEventListener('mouseleave', hideControls);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full group bg-black rounded-lg overflow-hidden" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        loop
        playsInline
      />
      
      <div 
        className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <button onClick={handleVideoClick} className="bg-black/50 text-white p-4 rounded-full">
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
      </div>

      <div 
        className={cn(
            "absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
        )}
      >
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full cursor-pointer h-2.5 group/slider"
          />
        <div className="flex items-center justify-between text-white mt-1.5">
            {/* Left Controls */}
            <div className="flex items-center gap-2 md:gap-3">
                <button onClick={handlePlayPause} className="p-1">
                    {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <div className="text-xs md:text-sm font-mono tracking-tighter">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1">/</span>
                    <span className="text-white/70">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 md:gap-3">
                <button onClick={toggleMute} className="p-1">
                    {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <button onClick={toggleFullScreen} className="p-1">
                    {isFullScreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
