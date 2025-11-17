import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import type { Recording } from '../types';

interface AudioPlayerProps {
  recording: Recording;
  showDownload?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ recording, showDownload = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.muted = newMuted;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    window.open(recording.file_url, '_blank');
  };

  return (
    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
      <audio ref={audioRef} src={recording.file_url} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="
            w-10 h-10 flex items-center justify-center
            bg-rose-600 hover:bg-rose-700 active:bg-rose-800
            text-white rounded-full
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          "
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Time and progress */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-rose-600
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-neutral-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-neutral-600 hover:text-neutral-900"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-rose-600
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Download button */}
        {showDownload && (
          <button
            onClick={handleDownload}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
            title="Download recording"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* File info */}
      <div className="mt-3 pt-3 border-t border-neutral-200">
        <p className="text-sm text-neutral-600">
          {recording.file_name} • {(recording.file_size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};
