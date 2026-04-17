import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function OrangeMicButton({ isListening, onPressStart, onPressEnd, onTap }) {
  const [pressed, setPressed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const pressStartRef = useRef(null);
  const didFireStart = useRef(false);

  useEffect(() => {
    if (!isListening) { setSeconds(0); return; }
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isListening]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setPressed(true);
    pressStartRef.current = Date.now();
    didFireStart.current = false;

    // Delay firing onPressStart to distinguish tap vs hold
    setTimeout(() => {
      if (pressStartRef.current !== null) {
        // Still held — it's a hold
        didFireStart.current = true;
        onPressStart?.();
      }
    }, 250);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!pressed) return;
    const startTime = pressStartRef.current;
    pressStartRef.current = null;
    setPressed(false);

    const held = Date.now() - (startTime || Date.now());
    if (held < 250) {
      // Tap rápido — toggle mode
      onTap?.();
    } else if (didFireStart.current) {
      // Hold released — process
      onPressEnd?.();
    }
    didFireStart.current = false;
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Breathing rings when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{ width: 160, height: 160, background: 'rgba(224,122,95,0.12)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: 160, height: 160, background: 'rgba(224,122,95,0.08)' }}
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </>
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
            <span className="text-white/70 text-[9px]">Toca para parar</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-4xl select-none">🍊</span>
            <span className="text-white/80 text-[10px]">Toca o mantén</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}