import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'mic',
    text: 'Toca para hablar. Te escucho.',
    position: 'above',
    targetId: 'home-mic',
  },
  {
    id: 'write',
    text: 'O escríbelo aquí.',
    position: 'above',
    targetId: 'home-write',
  },
  {
    id: 'nav',
    text: 'Aquí tienes tu historial, práctica y más.',
    position: 'above',
    targetId: 'home-nav',
  },
];

const KEY = 'naran_onboarded_v2';

export default function HomeTour({ onDone }) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    measureTarget(STEPS[step].targetId);
  }, [step]);

  const measureTarget = (id) => {
    const el = document.getElementById(id);
    if (!el) { setPos(null); return; }
    const r = el.getBoundingClientRect();
    setPos({ top: r.top, left: r.left, width: r.width, height: r.height, cx: r.left + r.width / 2 });
  };

  const advance = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    localStorage.setItem(KEY, '1');
    onDone();
  };

  if (!pos) return null;

  const tooltipLeft = Math.max(12, Math.min(pos.cx - 120, window.innerWidth - 252));
  const tooltipTop = pos.top - 68;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" onClick={advance}>
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

        {/* Spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={pos.left - 12}
                y={pos.top - 8}
                width={pos.width + 24}
                height={pos.height + 16}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#spotlight)" />
        </svg>

        {/* Tooltip */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute px-4 py-3 rounded-2xl shadow-xl max-w-[240px]"
          style={{
            background: '#2C2C2C',
            color: '#fff',
            top: Math.max(16, tooltipTop),
            left: tooltipLeft,
            fontSize: 14,
            lineHeight: '1.5',
            pointerEvents: 'none',
          }}
        >
          {STEPS[step].text}
          {/* Arrow */}
          <div
            className="absolute w-3 h-3 rotate-45"
            style={{
              background: '#2C2C2C',
              bottom: -6,
              left: Math.min(pos.cx - tooltipLeft - 6, 200),
            }}
          />
        </motion.div>

        {/* Step dots */}
        <div
          className="absolute flex gap-1.5 items-center"
          style={{ bottom: 100, left: '50%', transform: 'translateX(-50%)' }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step ? '#E07A5F' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={(e) => { e.stopPropagation(); finish(); }}
          className="absolute top-14 right-5 text-xs text-white/60 underline"
          style={{ pointerEvents: 'auto' }}
        >
          Saltar
        </button>
      </div>
    </AnimatePresence>
  );
}