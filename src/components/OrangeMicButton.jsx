import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function OrangeMicButton({ isListening, onTap }) {
  const [pressed, setPressed] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isListening) { setSeconds(0); return; }
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isListening]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setPressed(true);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!pressed) return;
    setPressed(false);
    onTap?.();
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Breathing halo when listening */}
      {isListening && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 160, height: 160, border: '8px solid rgba(224,122,95,0.3)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Gentle idle pulse */}
      {!isListening && !pressed && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 140, height: 140, background: 'rgba(224,122,95,0.08)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main button */}
      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        animate={{ scale: pressed && !isListening ? 0.93 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative w-[140px] h-[140px] rounded-full flex items-center justify-center select-none touch-none"
        style={{
          background: isListening
            ? 'linear-gradient(145deg, #E07A5F, #C9614A)'
            : 'linear-gradient(145deg, #F0916F, #E07A5F)',
          boxShadow: isListening
            ? '0 0 0 4px rgba(224,122,95,0.25), 0 12px 40px rgba(224,122,95,0.4)'
            : '0 8px 32px rgba(224,122,95,0.35), 0 2px 8px rgba(224,122,95,0.2)',
        }}
      >
        {isListening ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-semibold text-sm tabular-nums">
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex gap-1 items-end h-5">
              {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-white/90"
                  animate={{ height: ['6px', '18px', '6px'] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <span className="text-white/70 text-[9px]">Te escucho, sigue…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-4xl select-none">🍊</span>
            <span className="text-white/80 text-[10px]">Toca para empezar</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}