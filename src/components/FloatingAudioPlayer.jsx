import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function FloatingAudioPlayer({ audio, onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setError(false);
  }, [audio]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => setError(true)); }
  };

  const onTimeUpdate = () => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * el.duration;
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // Si el audio es de YouTube, no hay reproductor nativo — abrir en nueva pestaña
  if (audio?.type === 'youtube') {
    return (
      <AnimatePresence>
        {audio && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed left-4 right-4 z-50 rounded-2xl border shadow-xl overflow-hidden"
            style={{ background: '#FDFBF7', borderColor: '#E0DCD3', bottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: audio.color }}>
                {audio.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{audio.title}</p>
                <p className="text-[10px] text-muted-foreground">{audio.author} · {audio.duration}</p>
              </div>
              <a
                href={audio.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-white shrink-0"
                style={{ background: '#E07A5F' }}
              >
                Abrir ▶
              </a>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Reproductor nativo para URLs de audio directo
  return (
    <AnimatePresence>
      {audio && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed left-4 right-4 z-50 rounded-2xl border shadow-xl overflow-hidden"
          style={{ background: '#FDFBF7', borderColor: '#E0DCD3', bottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
        >
          <audio
            ref={audioRef}
            src={audio.url}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={() => setPlaying(false)}
          />

          {/* Header row */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: audio.color }}>
              {audio.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{audio.title}</p>
              <p className="text-[10px] text-muted-foreground">{audio.author}</p>
            </div>
            <button onClick={() => setMinimized(m => !m)} className="w-7 h-7 flex items-center justify-center text-muted-foreground">
              {minimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <AnimatePresence>
            {!minimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {error ? (
                    <p className="text-xs text-muted-foreground text-center py-1">No se puede reproducir este audio directamente.</p>
                  ) : (
                    <>
                      {/* Progress bar */}
                      <div
                        className="w-full h-1.5 rounded-full cursor-pointer"
                        style={{ background: '#E0DCD3' }}
                        onClick={seek}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress * 100}%`, background: '#E07A5F' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {audioRef.current ? fmt(audioRef.current.currentTime) : '0:00'}
                        </span>
                        <button
                          onClick={toggle}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ background: '#E07A5F' }}
                        >
                          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <span className="text-[10px] text-muted-foreground">{duration ? fmt(duration) : audio.duration}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}