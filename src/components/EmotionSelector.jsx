import { motion } from 'framer-motion';

const EMOTIONS = [
  { key: 'enojo',     emoji: '😤', label: 'Enojo', sub: 'Frustración' },
  { key: 'tristeza',  emoji: '😔', label: 'Tristeza', sub: 'Dolor' },
  { key: 'ansiedad',  emoji: '😰', label: 'Ansiedad', sub: 'Miedo' },
  { key: 'confusion', emoji: '😶', label: 'Confusión', sub: 'Bloqueo' },
];

export default function EmotionSelector({ onSelect, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex-1 flex flex-col px-6 py-10"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Antes de empezar</p>
      <h2 className="text-xl font-semibold text-foreground leading-snug mb-8">
        ¿Qué emoción describe mejor cómo te sientes ahora?
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {EMOTIONS.map((e, i) => (
          <motion.button
            key={e.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelect(e.key)}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-white py-5 px-3 hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
          >
            <span className="text-4xl">{e.emoji}</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{e.label}</p>
              <p className="text-xs text-muted-foreground">{e.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="text-sm text-muted-foreground underline underline-offset-2 text-center"
      >
        No estoy seguro/a, solo escúchame
      </button>
    </motion.div>
  );
}