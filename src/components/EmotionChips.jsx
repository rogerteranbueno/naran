import { motion } from 'framer-motion';

const EMOTIONS = [
  { key: 'enojo',     emoji: '😤', label: 'Enojo' },
  { key: 'tristeza',  emoji: '😔', label: 'Tristeza' },
  { key: 'ansiedad',  emoji: '😰', label: 'Ansiedad' },
  { key: 'confusion', emoji: '😶', label: 'Confusión' },
];

export default function EmotionChips({ selected, onSelect }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-muted-foreground mb-2">¿Cómo te sientes? <span className="opacity-60">(Opcional)</span></p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {EMOTIONS.map((e, i) => (
          <motion.button
            key={e.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(selected === e.key ? null : e.key)}
            className="flex items-center gap-1.5 shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all active:scale-95"
            style={{
              borderColor: selected === e.key ? '#E07A5F' : 'hsl(var(--border))',
              background: selected === e.key ? 'rgba(224,122,95,0.1)' : 'white',
              color: selected === e.key ? '#E07A5F' : 'hsl(var(--muted-foreground))',
            }}
          >
            <span>{e.emoji}</span>
            <span>{e.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}