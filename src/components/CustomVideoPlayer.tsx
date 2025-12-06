
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Rewind, FastForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';


interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  let controlTimeout: NodeJS.Timeout;

  const handlePlayPause = () => {
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
  
  const handleSkip = (amount: number) => {
    if(videoRef.current) {
        videoRef.current.currentTime += amount;
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const toggleFullScreen = () => {
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    const handleLoadedMetadata = () => {
      if (video) setDuration(video.duration);
    };

    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlTimeout);
        controlTimeout = setTimeout(() => setShowControls(false), 3000);
    }
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
    
    if (container) {
        container.addEventListener('mousemove', handleMouseMove);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
      if (container) {
          container.removeEventListener('mousemove', handleMouseMove);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(controlTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full group bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={handlePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div 
        className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col gap-2">
            <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full cursor-pointer h-2 [&>span:first-child]:h-2"
                styles={{
                    track: { backgroundColor: 'hsl(var(--primary) / 0.3)' },
                    range: { backgroundColor: 'hsl(var(--primary))' },
                    thumb: {
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: '0 0 5px hsl(var(--primary))'
                    }
                }}
            />
            <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <button onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                 <div className="flex items-center gap-3">
                    <button onClick={() => handleSkip(-10)}>
                        <Rewind className="w-6 h-6"/>
                    </button>
                     <button onClick={() => handleSkip(10)}>
                        <FastForward className="w-6 h-6"/>
                    </button>
                </div>


                <div className="flex items-center gap-3">
                    <button onClick={toggleMute}>
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.05}
                        className="w-24 cursor-pointer h-2 [&>span:first-child]:h-2"
                         styles={{
                            track: { backgroundColor: 'hsl(var(--primary) / 0.3)' },
                            range: { backgroundColor: 'hsl(var(--primary))' },
                            thumb: {
                                backgroundColor: 'hsl(var(--primary))',
                                boxShadow: '0 0 5px hsl(var(--primary))'
                            }
                        }}
                    />
                    <button onClick={toggleFullScreen}>
                        {isFullScreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// Extend slider to accept styles for custom coloring
declare module 'react' {
  interface ForwardRefExoticComponent<P extends object> {
    <T extends object>(
      props: P & { styles?: T } & React.RefAttributes<HTMLElement>
    ): React.ReactElement | null;
  }
}

const originalSliderRender = (Slider as any).render;

if (originalSliderRender) {
  (Slider as any).render = (props: any, ref: any) => {
    const { styles, ...rest } = props;
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          props.className
        )}
        {...rest}
      >
        <SliderPrimitive.Track
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          style={styles?.track}
        >
          <SliderPrimitive.Range
            className="absolute h-full bg-primary"
            style={styles?.range}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={styles?.thumb}
        />
      </SliderPrimitive.Root>
    );
  };
}
